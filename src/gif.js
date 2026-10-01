/* ---------- Minimal animated GIF encoder (global palette, median cut, LZW) ---------- */
const GifEnc = (() => {
  class Bytes {
    constructor(n = 1 << 20) { this.b = new Uint8Array(n); this.n = 0; }
    grow(k) { if (this.n + k > this.b.length) { const nb = new Uint8Array(Math.max(this.b.length * 2, this.n + k)); nb.set(this.b.subarray(0, this.n)); this.b = nb; } }
    byte(v) { this.grow(1); this.b[this.n++] = v & 255; }
    u16(v) { this.byte(v); this.byte(v >> 8); }
    str(s) { for (let i = 0; i < s.length; i++) this.byte(s.charCodeAt(i)); }
    arr(a) { this.grow(a.length); this.b.set(a, this.n); this.n += a.length; }
    out() { return this.b.slice(0, this.n); }
  }

  // Histogram in 5-bit-per-channel bins, with color sums for accurate averages
  function makeHist() { return { cnt: new Float64Array(32768), r: new Float64Array(32768), g: new Float64Array(32768), b: new Float64Array(32768) }; }
  function addToHist(h, rgba, step = 1) {
    for (let i = 0; i < rgba.length; i += 4 * step) {
      const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
      const k = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
      h.cnt[k]++; h.r[k] += r; h.g[k] += g; h.b[k] += b;
    }
  }

  function medianCut(h, maxColors = 256) {
    const bins = [];
    for (let k = 0; k < 32768; k++) if (h.cnt[k] > 0) bins.push(k);
    const avg = (k, ch) => ch === 0 ? h.r[k] / h.cnt[k] : ch === 1 ? h.g[k] / h.cnt[k] : h.b[k] / h.cnt[k];
    const stat = box => {
      let mn = [255, 255, 255], mx = [0, 0, 0], c = 0;
      for (const k of box.bins) { c += h.cnt[k]; for (let ch = 0; ch < 3; ch++) { const v = avg(k, ch); if (v < mn[ch]) mn[ch] = v; if (v > mx[ch]) mx[ch] = v; } }
      const rg = [mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]];
      box.ch = rg[0] >= rg[1] && rg[0] >= rg[2] ? 0 : rg[1] >= rg[2] ? 1 : 2;
      box.range = rg[box.ch]; box.count = c;
      box.score = box.bins.length > 1 ? box.range * Math.sqrt(c) : -1;
      return box;
    };
    let boxes = [stat({ bins })];
    while (boxes.length < maxColors) {
      let bi = -1, best = 0;
      for (let i = 0; i < boxes.length; i++) if (boxes[i].score > best) { best = boxes[i].score; bi = i; }
      if (bi < 0) break;
      const box = boxes[bi]; const ch = box.ch;
      box.bins.sort((a, b) => avg(a, ch) - avg(b, ch));
      let half = box.count / 2, acc = 0, cut = 1;
      for (let i = 0; i < box.bins.length - 1; i++) { acc += h.cnt[box.bins[i]]; if (acc >= half) { cut = i + 1; break; } cut = i + 1; }
      const a = stat({ bins: box.bins.slice(0, cut) }), b = stat({ bins: box.bins.slice(cut) });
      boxes.splice(bi, 1, a, b);
    }
    const pal = [];
    for (const box of boxes) {
      let r = 0, g = 0, b = 0, c = 0;
      for (const k of box.bins) { r += h.r[k]; g += h.g[k]; b += h.b[k]; c += h.cnt[k]; }
      if (c > 0) pal.push([Math.round(r / c), Math.round(g / c), Math.round(b / c)]);
    }
    if (!pal.length) pal.push([0, 0, 0]);
    return pal;
  }

  function makeMapper(pal) {
    const lut = new Int16Array(32768).fill(-1);
    return (r, g, b) => {
      const k = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
      let v = lut[k];
      if (v >= 0) return v;
      const cr = (r & 248) | 4, cg = (g & 248) | 4, cb = (b & 248) | 4;
      let bd = 1e9;
      for (let i = 0; i < pal.length; i++) {
        const dr = pal[i][0] - cr, dg = pal[i][1] - cg, db = pal[i][2] - cb;
        const d = dr * dr * 2 + dg * dg * 4 + db * db * 3;
        if (d < bd) { bd = d; v = i; }
      }
      lut[k] = v; return v;
    };
  }

  const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v / 16 - 0.5) * 14);

  // rgba: Uint8Array from WebGL (bottom-up rows) when flipY is true
  function indexFrame(rgba, w, h, map, dither, flipY) {
    const out = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) {
      const sy = flipY ? h - 1 - y : y;
      for (let x = 0; x < w; x++) {
        const i = (sy * w + x) * 4;
        let r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
        if (dither) { const d = BAYER4[((y & 3) << 2) | (x & 3)]; r = Math.max(0, Math.min(255, r + d)); g = Math.max(0, Math.min(255, g + d)); b = Math.max(0, Math.min(255, b + d)); }
        out[y * w + x] = map(r | 0, g | 0, b | 0);
      }
    }
    return out;
  }

  const table = new Int16Array(1 << 20);
  function lzw(indices, minCode, bytes) {
    const clear = 1 << minCode, eoi = clear + 1;
    let codeSize = minCode + 1, next = eoi + 1;
    table.fill(-1);
    const raw = new Bytes(indices.length + 1024);
    let cur = 0, bits = 0;
    const emit = c => { cur |= c << bits; bits += codeSize; while (bits >= 8) { raw.byte(cur & 255); cur >>>= 8; bits -= 8; } };
    emit(clear);
    let prefix = indices[0];
    for (let i = 1; i < indices.length; i++) {
      const k = indices[i];
      const key = (prefix << 8) | k;
      const c = table[key];
      if (c !== -1) { prefix = c; continue; }
      emit(prefix);
      if (next === 4096) {
        emit(clear); table.fill(-1); codeSize = minCode + 1; next = eoi + 1;
      } else {
        if (next >= (1 << codeSize)) codeSize++;
        table[key] = next++;
      }
      prefix = k;
    }
    emit(prefix); emit(eoi);
    if (bits > 0) raw.byte(cur & 255);
    const data = raw.out();
    bytes.byte(minCode);
    for (let i = 0; i < data.length; i += 255) {
      const n = Math.min(255, data.length - i);
      bytes.byte(n); bytes.arr(data.subarray(i, i + n));
    }
    bytes.byte(0);
  }

  function createWriter(w, h, pal, delayCs) {
    const bytes = new Bytes(1 << 22);
    bytes.str('GIF89a'); bytes.u16(w); bytes.u16(h);
    bytes.byte(0xF7); bytes.byte(0); bytes.byte(0);
    for (let i = 0; i < 256; i++) { const c = pal[i] || [0, 0, 0]; bytes.byte(c[0]); bytes.byte(c[1]); bytes.byte(c[2]); }
    bytes.byte(0x21); bytes.byte(0xFF); bytes.byte(11); bytes.str('NETSCAPE2.0'); bytes.byte(3); bytes.byte(1); bytes.u16(0); bytes.byte(0);
    return {
      frame(indices) {
        bytes.byte(0x21); bytes.byte(0xF9); bytes.byte(4); bytes.byte(0x04); bytes.u16(delayCs); bytes.byte(0); bytes.byte(0);
        bytes.byte(0x2C); bytes.u16(0); bytes.u16(0); bytes.u16(w); bytes.u16(h); bytes.byte(0);
        lzw(indices, 8, bytes);
      },
      finish() { bytes.byte(0x3B); return bytes.out(); },
    };
  }

  return { makeHist, addToHist, medianCut, makeMapper, indexFrame, createWriter };
})();
if (typeof module !== 'undefined') module.exports = GifEnc;
