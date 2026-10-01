(() => {
'use strict';
const $ = s => document.querySelector(s);
const el = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (v === true) n.setAttribute(k, '');
    else if (v !== false && v != null) n.setAttribute(k, v);
  }
  for (const c of kids) if (c != null) n.append(c);
  return n;
};
const ICON = {
  play: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11l9-5.5z"/></svg>',
  pause: '<svg viewBox="0 0 16 16" fill="currentColor"><rect x="3.5" y="2.5" width="3" height="11" rx="1"/><rect x="9.5" y="2.5" width="3" height="11" rx="1"/></svg>',
  rewind: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 3v4h4"/><path d="M3.5 7A5 5 0 1 1 5 11.5"/></svg>',
  eye: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/></svg>',
  eyeOff: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2 2l12 12"/><path d="M6.3 3.8A6.8 6.8 0 0 1 8 3.5C12 3.5 14.5 8 14.5 8a12 12 0 0 1-1.7 2.3M10.5 11.9A6 6 0 0 1 8 12.5C4 12.5 1.5 8 1.5 8a12.6 12.6 0 0 1 2.4-3"/></svg>',
  up: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 13V3.5M4.5 7L8 3.5 11.5 7"/></svg>',
  caret: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>',
  down: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v9.5M4.5 9L8 12.5 11.5 9"/></svg>',
  dice: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="2" width="12" height="12" rx="3"/><circle cx="5.5" cy="5.5" r=".9" fill="currentColor"/><circle cx="10.5" cy="10.5" r=".9" fill="currentColor"/><circle cx="8" cy="8" r=".9" fill="currentColor"/></svg>',
  copy: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="5" y="5" width="9" height="9" rx="2"/><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"/></svg>',
  trash: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4"/></svg>',
  undo: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3L2 6l3 3"/><path d="M2 6h7.5a4.5 4.5 0 0 1 0 9H6"/></svg>',
  help: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="1.5" y="4" width="13" height="8.5" rx="1.8"/><path d="M4.5 7h.01M7 7h.01M9.5 7h.01M12 7h.01M5 9.8h6"/></svg>',
  close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
  download: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2.5v8M4.5 7.5L8 11l3.5-3.5M3 13.5h10"/></svg>',
  pencil: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 2.5l3 3L6 13H3v-3z"/></svg>',
  upload: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 11V3M4.5 6.5L8 3l3.5 3.5M3 13.5h10"/></svg>',
  reset: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 8a5.5 5.5 0 1 0 1.8-4.1"/><path d="M2.5 2.5v3h3"/></svg>',
  grip: '<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="6" cy="4" r="1.1"/><circle cx="10" cy="4" r="1.1"/><circle cx="6" cy="8" r="1.1"/><circle cx="10" cy="8" r="1.1"/><circle cx="6" cy="12" r="1.1"/><circle cx="10" cy="12" r="1.1"/></svg>',
  move: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1.5v13M1.5 8h13M8 1.5L6 3.5M8 1.5l2 2M8 14.5l-2-2M8 14.5l2-2M1.5 8l2-2M1.5 8l2 2M14.5 8l-2-2M14.5 8l-2 2"/></svg>',
  rotate3: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9"/><path d="M13.5 2.5v2.2h-2.2"/></svg>',
  reorder: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 2.5v11M2.5 5L5 2.5 7.5 5M11 13.5v-11M8.5 11l2.5 2.5 2.5-2.5"/></svg>',
  left: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3.5L5.5 8l4.5 4.5"/></svg>',
  right: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5L10.5 8 6 12.5"/></svg>',
  diamond: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M8 2l6 6-6 6-6-6z"/></svg>',
  cube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M12 2.8l8 4.6v9.2l-8 4.6-8-4.6V7.4z"/><path d="M4 7.4l8 4.6 8-4.6M12 12v9.2"/></svg>',
  plus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M8 3v10M3 8h10"/></svg>',
  shuffle: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4.5h2.2c1.4 0 2.3.6 3 1.7l1.6 3.6c.7 1.1 1.6 1.7 3 1.7H14"/><path d="M2 11.5h2.2c.9 0 1.6-.3 2.2-.8M9.6 5.3c.6-.5 1.3-.8 2.2-.8H14"/><path d="M12 2.5l2 2-2 2M12 9.5l2 2-2 2"/></svg>',
  loop: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 2.5l2 2-2 2"/><path d="M13.5 4.5H5.5a3 3 0 0 0-3 3v.5"/><path d="M4.5 13.5l-2-2 2-2"/><path d="M2.5 11.5h8a3 3 0 0 0 3-3V8"/></svg>',
  redo: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 3l3 3-3 3"/><path d="M14 6H6.5a4.5 4.5 0 0 0 0 9H10"/></svg>',
};

/* ---------------- state ---------------- */
const RATIOS = [['1:1', 1, 1], ['16:9', 16, 9], ['9:16', 9, 16], ['4:3', 4, 3], ['3:4', 3, 4], ['4:5', 4, 5], ['3:2', 3, 2], ['2:3', 2, 3], ['21:9', 21, 9], ['Custom']];
const TIERS = [[540, 'Small'], [720, 'HD'], [1080, 'Full HD'], [1440, 'QHD'], [2160, '4K']];
const STILLS = [['png', 'PNG'], ['jpeg', 'JPEG'], ['webp', 'WebP']];
const MOTION = [['gif', 'GIF'], ['mp4', 'MP4'], ['webm', 'WebM']];
const IS_MOTION = f => f === 'gif' || f === 'mp4' || f === 'webm';
const STORE_KEY = 'texture-foundry-v2', OLD_KEY = 'texture-foundry-v1';

const state = {
  layers: [], ratio: '16:9', tier: 1080, customW: 1920, customH: 1080,
  format: 'png', quality: 0.92, speed: 1, previewQ: 1,
  anim: { fps: 20, gifSize: 640, dither: true, vfps: 30, vq: 1, repeat: 1 },
  loop: { on: true, dur: 30 },
  vtool: 'move', kfOn: false, kfH: 250, presetsMin: false, layersMin: false,
  presetId: 'b0', panelL: null, panelR: null,
};
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let time = 0, phase = 0, playing = !reduceMotion;
let dirty = true, exporting = false;
const textures = new Map();
let uidN = 1;
const uid = () => 'L' + (uidN++) + Math.random().toString(36).slice(2, 6);

function newLayer(type, o = {}) {
  const def = LAYER_TYPES[type];
  const params = {};
  for (const p of layerParams(type)) params[p.k] = p.d;
  Object.assign(params, def.colors || {}, o.params || {});
  const L = { id: uid(), type, on: o.on ?? true, open: o.open ?? true, blend: o.blend ?? 0, opacity: o.opacity ?? 1, params };
  if (o.keys && typeof o.keys === 'object') L.keys = JSON.parse(JSON.stringify(o.keys));
  return L;
}

/* ---------------- presets ---------------- */
/* Built-in textures: the library a fresh page starts with (and what Reset restores). */
const BUILTIN = [
  ["Void", "A chrome crystal drifting through violet liquid", [
    ["concrete", {"scale": 3.373, "rough": 0.137, "pores": 0.089, "stains": 0.788, "color": "#c112e2", "seed": 23}, 0, 1, true],
    ["gasbands", {"bands": 6.3, "turb": 1.827, "shear": 0.784, "storms": 0.832, "flash": 0.482, "speed": 0.14, "seed": 49, "pal": 3, "ca": "#0b0d28", "cb": "#9432da", "cc": "#f7efde", "shift": 0.04, "contrast": 1.06, "cycle": 0}, 4, 0.54, true],
    ["object3d", {"shape": 5, "lastShape": 0, "anim": 0, "clip": 0, "arep": 1, "mat": 2, "color": "#e8e4dc", "size": 1.217, "x": 0, "y": 0, "rotX": 134, "rotY": -22.1, "rotZ": 64.1, "motion": 1, "cycles": 2, "spinX": 0, "spinY": 0, "spinZ": 0, "wobble": 0.056, "wscale": 3.42, "light": 249.8, "shine": 1.336, "rim": 0.56, "ior": 0.124, "repeat": 5.86, "shadow": 0.36}, 0, 1, true],
    ["chromemap", {"bands": 5.62, "hard": 1.079, "disp": 0.079, "soft": 0.817, "tint": "#a3b4d8", "dark": "#300e2c", "speed": 0.76}, 0, 1, true],
    ["sharpen", {"amt": 0.77, "rad": 3.62}, 0, 1, true],
    ["adjust", {"bri": -0.028, "con": 0.829, "sat": 0.915, "hue": 77.3, "temp": -0.602, "gamma": 0.997, "hs": 0}, 0, 1, true],
    ["grain", {"amt": 0.078, "size": 1.2, "color": 0, "anim": 1}, 0, 1, true],
  ]],
  ["Oil spill", "Chrome swirls printed as a CMY halftone", [
    ["liqmetal", {"scale": 0.544, "flow": 0.39, "bands": 3.78, "disp": 0.519, "hard": 2.202, "tint": "#9fb2d9", "dark": "#3b0f42", "speed": 0.54, "seed": 89}, 0, 1, true],
    ["halftone", {"size": 14.5, "angle": 55.1, "mode": 1, "soft": 0.76, "ink": "#1b0b25", "paper": "#d1f4b0"}, 0, 1, true],
  ]],
  ["Iridescent", "Soft holographic folds with a pearlescent shimmer", [
    ["holo", {"scale": 0.982, "crinkle": 0.865, "bands": 5.365, "sat": 0.194, "sparkle": 0.476, "speed": 0.24, "seed": 21}, 0, 1, true],
    ["lens", {"distort": -0.944, "zoom": 1.914, "chroma": 0.916, "blur": 0.596, "vign": 0}, 0, 1, true],
    ["grain", {"amt": 0.107, "size": 1.2, "color": 0, "anim": 1}, 0, 1, true],
  ]],
  ["Ink", "Twisted ink dithered onto warm paper", [
    ["warp", {"scale": 1.15, "warp": 3.29, "oct": 5, "bands": 0.97, "mixq": 0.5, "speed": 0.35, "seed": 2, "pal": 0, "ca": "#17062e", "cb": "#d73930", "cc": "#f1f7dc", "shift": 0.04, "contrast": 1.61, "cycle": 0}, 0, 1, true],
    ["twirl", {"strength": 3.75, "radius": 1.125, "cx": 0.15, "cy": 0.06, "speed": 0.41}, 0, 1, true],
    ["sharpen", {"amt": 0.63, "rad": 2.92}, 0, 1, true],
    ["dither", {"levels": 2, "px": 1, "mat": 2, "mono": 1, "dark": "#000000", "light": "#f4e0cb"}, 0, 1, true],
    ["grain", {"amt": 0.072, "size": 1.2, "color": 0, "anim": 1}, 0, 1, true],
  ]],
  ["Ancient sun", "A grainy sun with an iridescent sheen", [
    ["graingrad", {"shape": 2, "scale": 1.077, "soft": 0.682, "grain": 0.333, "gsize": 1.88, "speed": 0.4, "seed": 62, "pal": 7, "ca": "#34092f", "cb": "#ddcd37", "cc": "#d1f9cb", "shift": -0.19, "contrast": 1.47, "cycle": 0}, 0, 1, true],
    ["iridescence", {"amount": 0.36, "freq": 2.99, "hue": 0.298, "edge": 1.395, "speed": 0.56}, 0, 1, true],
    ["crt", {"dens": 3.97, "int": 0.96, "mask": 0.423, "curve": 0.244, "roll": 2.59}, 0, 1, false],
    ["glow", {"th": 0.605, "int": 0.53, "radius": 33.3, "tint": "#ffffff"}, 0, 1, true],
    ["grain", {"amt": 0.051, "size": 1.2, "color": 0, "anim": 1}, 0, 1, true],
  ]],
  ["Truchet", "Interlocking arcs in red and mint", [
    ["truchet", {"scale": 4.73, "width": 0.346, "style": 1, "speed": 0.18, "seed": 27, "pal": 0, "ca": "#1a0b25", "cb": "#e7343b", "cc": "#bfe5bb", "shift": 0.27, "contrast": 0.7, "cycle": 0}, 0, 1, true],
  ]],
  ["Fullmetal", "Rippling chrome stretched through ridged glass", [
    ["satin", {"folds": 4.06, "angle": 91, "flow": 0.249, "sheen": 0.329, "tight": 46.7, "color": "#bfb135", "shade": "#bfb135", "speed": 0.79, "seed": 70}, 0, 1, true],
    ["concrete", {"scale": 4.32, "rough": 0.726, "pores": 0.318, "stains": 0.941, "color": "#4595cf", "seed": 90}, 1, 0.4, true],
    ["fluted", {"count": 20.9, "angle": 162.4, "dist": 0.817, "shape": 2, "chroma": 0.961, "shadow": 0.313, "shine": 0.489, "blur": 0.939}, 0, 1, true],
    ["lens", {"distort": 0.364, "zoom": 1.839, "chroma": 0.666, "blur": 0.741, "vign": 0.123}, 0, 1, true],
    ["chromemap", {"bands": 3.28, "hard": 1.961, "disp": 0.13, "soft": 0.58, "tint": "#a3b4d8", "dark": "#270b19", "speed": 0.28}, 0, 1, true],
    ["grain", {"amt": 0.105, "size": 1.2, "color": 0, "anim": 1}, 0, 1, true],
  ]],
  ["Vinyl", "Warm pixel patterns warped into restless grooves", [
    ["neuro", {"scale": 7.86, "detail": 6, "bright": 1.984, "sharp": 3.91, "speed": 1.1, "seed": 45, "pal": 0, "ca": "#000000", "cb": "#962c2c", "cc": "#fffbcc", "shift": 0.24, "contrast": 0.75, "cycle": 0}, 0, 1, true],
    ["pixelate", {"size": 30.4}, 0, 1, true],
    ["wave", {"amp": 44.1, "freq": 25.65, "dir": 3, "speed": -1.19}, 0, 1, true],
    ["grain", {"amt": 0.107, "size": 1.2, "color": 0, "anim": 1}, 0, 1, true],
  ]],
  ["Pulse", "Grainy color ripples broken into dithered pixels", [
    ["graingrad", {"shape": 3, "scale": 0.947, "soft": 0.841, "grain": 0.702, "gsize": 3.42, "speed": 0.34, "seed": 58, "pal": 5, "ca": "#0b2008", "cb": "#37a5ef", "cc": "#e3bbf2", "shift": 0.92, "contrast": 1.13, "cycle": 0}, 0, 1, true],
    ["pixelate", {"size": 25.2}, 0, 1, true],
    ["chroma", {"amount": 10.7, "radial": 1, "angle": 103}, 0, 1, true],
    ["dither", {"levels": 4, "px": 2.91, "mat": 5, "mono": 0, "dark": "#253409", "light": "#eae1f1"}, 0, 1, true],
    ["grain", {"amt": 0.046, "size": 1.2, "color": 0, "anim": 1}, 0, 1, true],
  ]],
  ["Neurons", "Fine luminous filaments weaving through the dark", [
    ["filaments", {"mode": 0, "scale": 3.33, "width": 0.041, "layers": 3, "core": 0.766, "speed": 0.67, "seed": 65, "pal": 0, "ca": "#03030c", "cb": "#b3d55d", "cc": "#c7caea", "shift": -0.36, "contrast": 1.13, "cycle": 0}, 0, 1, true],
    ["sharpen", {"amt": 1.55, "rad": 2.29}, 0, 1, true],
    ["grain", {"amt": 0.061, "size": 1.2, "color": 0, "anim": 1}, 0, 1, true],
  ]],
  ["Microscope", "Warped cellular forms traced in sharp contours", [
    ["graingrad", {"shape": 4, "scale": 0.428, "soft": 0.678, "grain": 0.926, "gsize": 4.61, "speed": 0.69, "seed": 49, "pal": 5, "ca": "#1b1f0b", "cb": "#328dc6", "cc": "#c5c3ed", "shift": 0.04, "contrast": 1.77, "cycle": 0}, 0, 1, true],
    ["object3d", {"shape": 0, "lastShape": 0, "anim": 0, "clip": 0, "arep": 1, "mat": 3, "color": "#ff9fb8", "size": 1.21, "x": 0, "y": 0, "rotX": -22.1, "rotY": 36.3, "rotZ": -57.2, "motion": 7, "cycles": 1, "spinX": 0, "spinY": 0, "spinZ": 0, "wobble": 0.308, "wscale": 3.47, "light": 124.7, "shine": 0.25, "rim": 1.827, "ior": 0.244, "repeat": 1.76, "shadow": 0.308}, 0, 1, true],
    ["polar", {"mode": 0, "zoom": 1.13, "rep": 3, "spin": 0.38}, 0, 1, true],
    ["transform", {"rot": -162.5, "zoom": 1.51, "ox": -0.678, "oy": 0.947, "sx": 0, "sy": 0, "spin": 0, "wrap": 1}, 0, 1, true],
    ["edges", {"str": 2.55, "thick": 3.01, "mode": 0}, 0, 1, true],
  ]],
  ["Amoeba", "A wobbling glass knot over grainy yellow silk", [
    ["studio", {"style": 0, "c1": "#e3e419", "c2": "#e3e419", "c3": "#e3e419", "c4": "#e3e419", "scale": 1.519, "angle": 124.8, "distort": 0.65, "soft": 0.846, "sheen": 0.4, "grain": 0.52, "speed": 0.59, "seed": 6}, 0, 1, true],
    ["object3d", {"shape": 3, "lastShape": 0, "anim": 1, "clip": 0, "arep": 1, "mat": 3, "color": "#a8d8ff", "size": 0.995, "x": 0, "y": 0, "rotX": 98.7, "rotY": -100.4, "rotZ": 91.5, "motion": 6, "cycles": 1, "spinX": 0, "spinY": 0, "spinZ": 0, "wobble": 0.37, "wscale": 5.54, "light": 13.4, "shine": 0.146, "rim": 0.132, "ior": 0.775, "repeat": 3.86, "shadow": 0.127}, 0, 1, true],
  ]],
  ["Wave", "Layered color swells", [
    ["studio", {"style": 1, "c1": "#1776e0", "c2": "#1776e0", "c3": "#1776e0", "c4": "#1776e0", "scale": 0.657, "angle": 18.3, "distort": 1.62, "soft": 0.286, "sheen": 0.037, "grain": 0.161, "speed": 0.54, "seed": 60}, 0, 1, true],
  ]],
  ["Cells", "Glowing cells behind reeded glass", [
    ["voronoi", {"scale": 8.22, "jitter": 0.28, "mode": 0, "edge": 0.109, "speed": 0.51, "seed": 23, "pal": 7, "ca": "#06182a", "cb": "#d634e6", "cc": "#f1e5b4", "shift": 0.59, "contrast": 1.58, "cycle": 0}, 0, 1, true],
    ["fluted", {"count": 65.9, "angle": 85.5, "dist": 0.519, "shape": 0, "chroma": 0.744, "shadow": 0.623, "shine": 0.046, "blur": 0.359}, 0, 1, true],
    ["halftone", {"size": 16.5, "angle": 34.4, "mode": 0, "soft": 0.67, "ink": "#2f220f", "paper": "#d0ddf5"}, 0, 1, true],
    ["adjust", {"bri": -0.084, "con": 1.325, "sat": 1.38, "hue": -1.3, "temp": -0.395, "gamma": 0.785, "hs": 0}, 0, 1, true],
  ]],
  ["Static noise", "Halftone noise glowing in thermal colors", [
    ["simplex", {"scale": 7.68, "oct": 4, "steps": 4, "soft": 0.035, "warp": 1.907, "speed": 0.56, "seed": 41, "pal": 3, "ca": "#340f1a", "cb": "#c6db39", "cc": "#c1eddd", "shift": -0.64, "contrast": 1.69, "cycle": 0}, 0, 1, true],
    ["halftone", {"size": 14.1, "angle": 58.2, "mode": 0, "soft": 0.34, "ink": "#221236", "paper": "#dbeec7"}, 0, 1, true],
    ["edges", {"str": 2.2, "thick": 4.3, "mode": 2}, 0, 1, true],
    ["heatmap", {"con": 2.241, "off": -0.263, "bands": 13.9, "lines": 0.439, "pulse": 0.573}, 0, 1, true],
  ]],
  ["Game water", "Pixel-art water with caustic glints", [
    ["meshgrad", {"c1": "#a70cdc", "c2": "#a70cdc", "c3": "#a70cdc", "c4": "#a70cdc", "distort": 1.074, "swirl": -1.919, "soft": 2.948, "grain": 0.927, "speed": 0.11, "seed": 69}, 0, 1, true],
    ["gradmap", {"pal": 0, "ca": "#200a5c", "cb": "#ffffff", "cc": "#add8eb", "shift": -0.21, "contrast": 0.75, "cycle": 0}, 0, 1, true],
    ["water", {"scale": 2.06, "height": 0.386, "chop": 0.618, "dir": 99.5, "caustics": 0.708, "glints": 0.722, "depth": 0.119, "clarity": 0.563, "tint": "#1a9bc4", "speed": 0.8, "seed": 71}, 0, 1, true],
    ["pixelate", {"size": 23.2}, 0, 1, true],
    ["vignette", {"amt": 0.422, "size": 0.7, "soft": 0.6, "round": 0.5, "color": "#000000"}, 0, 1, true],
  ]],
  ["Space runes", "Glowing contour glyphs from a stepped ripple", [
    ["graingrad", {"shape": 3, "scale": 1.557, "soft": 0.393, "grain": 0.194, "gsize": 4.41, "speed": 0.41, "seed": 59, "pal": 4, "ca": "#450a10", "cb": "#e7d135", "cc": "#a5f3f5", "shift": -0.49, "contrast": 1.45, "cycle": 0}, 0, 1, true],
    ["posterize", {"levels": 7, "gamma": 2.41}, 0, 1, true],
    ["transform", {"rot": -165.1, "zoom": 3.23, "ox": -0.952, "oy": 0.976, "sx": 0, "sy": 0, "spin": 0, "wrap": 1}, 0, 1, true],
    ["edges", {"str": 2.73, "thick": 3.88, "mode": 0}, 0, 1, true],
    ["grain", {"amt": 0.069, "size": 1.2, "color": 0, "anim": 1}, 0, 1, true],
  ]],
  ["Universe", "Holographic dust through a wide lens", [
    ["holo", {"scale": 4.831, "crinkle": 0.333, "bands": 0.386, "sat": 0.711, "sparkle": 0.688, "speed": 0.38, "seed": 15}, 0, 1, true],
    ["gradmap", {"pal": 5, "ca": "#330d46", "cb": "#e7da23", "cc": "#baf2b6", "shift": -0.15, "contrast": 0.83, "cycle": 0}, 0, 1, true],
    ["chroma", {"amount": 6.3, "radial": 0, "angle": 210}, 0, 1, true],
    ["lens", {"distort": -0.928, "zoom": 0.638, "chroma": 0.88, "blur": 0.251, "vign": 0.707}, 0, 1, true],
    ["grain", {"amt": 0.064, "size": 1.2, "color": 0, "anim": 1}, 0, 1, true],
  ]],
  ["Molten dusk", "Folding lava with a hot bloom", [
    ["warp", {"scale": 1.6, "warp": 3.8, "oct": 6, "mixq": 0.35, "speed": 0.12, "pal": 3, "contrast": 1.15}],
    ["glow", {"th": 0.62, "int": 0.9, "radius": 40}],
    ["chroma", {"amount": 5, "radial": 1}],
    ["grain", {"amt": 0.09}],
    ["vignette", {"amt": 0.55, "size": 0.75, "soft": 0.8}],
  ]],
  ["Mesh gradient", "Four colors flowing into each other", [
    ["meshgrad", {"c1": "#0d1b4d", "c2": "#6b3cff", "c3": "#ff6a88", "c4": "#ffd3a1", "distort": 0.7, "swirl": 0.5, "soft": 1.3, "speed": 0.3}],
    ["grain", {"amt": 0.05}],
  ]],
  ["Aurora", "Curtains of light over a night sky", [
    ["noise", {"scale": 1.4, "oct": 4, "lac": 2, "gain": 0.5, "warp": 2.51, "ridged": 0, "angle": 90, "speed": 0.13, "seed": 0, "pal": 0, "ca": "#01040d", "cb": "#0e9c82", "cc": "#c6ffdc", "shift": 0, "contrast": 1.5, "cycle": 0}, 0, 1, true],
    ["wave", {"amp": 35.1, "freq": 1.6, "dir": 1, "speed": 0.4}, 0, 1, true],
    ["glow", {"th": 0.5, "int": 0.42, "radius": 55, "tint": "#9dffd6"}, 0, 1, true],
    ["adjust", {"bri": 0, "con": 1, "sat": 1, "hue": 0, "temp": 0, "gamma": 1, "hs": 1}, 0, 1, true],
  ]],
  ["Neuro noise", "Glowing, vein-like sine networks", [
    ["neuro", {"scale": 5, "detail": 12, "bright": 1.35, "sharp": 3.2, "speed": 0.5, "pal": 0, "ca": "#000000", "cb": "#2f47ff", "cc": "#eef2ff"}],
    ["glow", {"th": 0.55, "int": 0.7, "radius": 30}],
    ["vignette", {"amt": 0.4}],
  ]],
  ["Grain gradient", "A soft wave dissolved in print grain", [
    ["graingrad", {"shape": 0, "scale": 1, "soft": 0.2, "grain": 0.35, "gsize": 1.4, "speed": 0.3, "pal": 0, "ca": "#0f1636", "cb": "#e2546e", "cc": "#ffd6a0"}],
  ]],
  ["Marbled paper", "Suminagashi ink rings", [
    ["warp", {"scale": 0.9, "warp": 3.2, "oct": 3, "bands": 6, "mixq": 0.15, "speed": 0.06, "pal": 8, "contrast": 1.1}],
    ["invert", {"mode": 1, "th": 0.5, "soft": 0.12}],
    ["gradmap", {"ca": "#17213f", "cb": "#5a6a8e", "cc": "#efe7d6"}],
    ["grain", {"amt": 0.1, "size": 1.6}],
    ["vignette", {"amt": 0.35, "color": "#6e5b3e", "soft": 1}],
  ]],
  ["Thermal", "Heat camera, ironbow palette", [
    ["noise", {"scale": 1.8, "oct": 5, "warp": 1.6, "speed": 0.25, "pal": 8, "contrast": 1.7}],
    ["blur", {"radius": 8}],
    ["gradmap", {"ca": "#0a0020", "cb": "#d0342c", "cc": "#fff1a8", "contrast": 1.3}],
    ["posterize", {"levels": 12}],
    ["crt", {"dens": 4, "int": 0.22, "mask": 0.08, "curve": 0, "roll": 0.3}],
    ["grain", {"amt": 0.08}],
  ]],
  ["Simplex", "Stepped simplex contours in cool tones", [
    ["simplex", {"scale": 1.6, "oct": 3, "steps": 7, "soft": 0.12, "warp": 0.5, "speed": 0.25, "pal": 0, "ca": "#0c1a2b", "cb": "#3f7fa8", "cc": "#e8f3f2"}],
    ["grain", {"amt": 0.04}],
  ]],
  ["Halftone", "One ink, big dots, slow tide", [
    ["warp", {"scale": 1.1, "warp": 3, "oct": 4, "speed": 0.15, "pal": 8, "contrast": 1.3}],
    ["halftone", {"size": 16, "angle": 30, "mode": 0, "soft": 0.1, "ink": "#111111", "paper": "#f1ece2"}],
    ["grain", {"amt": 0.06}],
  ]],
  ["Riso print", "Single blue ink halftone on paper", [
    ["noise", {"scale": 2.4, "warp": 1.2, "pal": 8, "contrast": 1.3, "speed": 0.1}],
    ["halftone", {"size": 9, "angle": 22, "mode": 0, "soft": 0.15, "ink": "#2340b8", "paper": "#f2ecdf"}],
    ["grain", {"amt": 0.1, "size": 1.5}],
  ]],
  ["Crosshatch", "Turbulence engraved in ink lines", [
    ["turbulence", {"scale": 1, "detail": 6, "turb": 0.9, "bands": 1.2, "disp": 0, "speed": 0.2, "pal": 8}],
    ["dither", {"levels": 2, "px": 2, "mat": 4, "mono": 1, "dark": "#171411", "light": "#efe8da"}],
  ]],
  ["1-bit water", "Dithered caustics in black and white", [
    ["caustics", {"scale": 1.2, "sharp": 5, "speed": 0.6, "pal": 8}],
    ["displace", {"amount": 20, "scale": 2}],
    ["dither", {"levels": 2, "px": 3}],
  ]],
  ["Two-tone", "A plasma field in chunky yellow pixels", [
    ["plasma", {"scale": 2.5, "complex": 3, "twist": 1.2, "speed": 0.5, "pal": 8}],
    ["dither", {"levels": 2, "px": 5, "mono": 1, "dark": "#0d0d12", "light": "#e9f07a"}],
  ]],
  ["Tape memory", "A sunset lost on VHS", [
    ["gradient", {"type": 0, "angle": 90, "pal": 0, "ca": "#1c0b3d", "cb": "#ff5d73", "cc": "#ffd08a"}],
    ["noise", {"scale": 2.2, "oct": 3, "warp": 1.2, "angle": 0, "speed": 0.2, "pal": 0, "ca": "#000000", "cb": "#3a1030", "cc": "#ffb07a"}, 3, 0.45],
    ["wave", {"amp": 5, "freq": 22, "dir": 0, "speed": 1.5}],
    ["chroma", {"amount": 6}],
    ["crt", {"dens": 4.5, "int": 0.4, "mask": 0.12, "curve": 0.15, "roll": 0.6}],
    ["grain", {"amt": 0.1}],
  ]],
  ["Phosphor", "A dot grid glowing in CRT green", [
    ["grid", {"type": 2, "scale": 34, "width": 0.3, "rot": 0, "soft": 0, "speed": 0.4, "pal": 0, "ca": "#000000", "cb": "#0b3d17", "cc": "#8dff9e", "shift": 0, "contrast": 1, "cycle": 0}, 0, 1, true],
    ["displace", {"amount": 30, "scale": 2, "oct": 3, "speed": 0.4, "seed": 0}, 0, 1, true],
    ["glow", {"th": 0.4, "int": 1, "radius": 25, "tint": "#7dff95"}, 0, 1, true],
  ]],
  ["Terminal", "Green glyph rain across the screen", [
    ["glyphs", {"scale": 26, "rain": 0.8, "trail": 0.45, "density": 0.9, "flicker": 3, "speed": 0.6}],
    ["glow", {"th": 0.35, "int": 1, "radius": 22, "tint": "#8dffa0"}],
    ["crt", {"dens": 3.5, "int": 0.3, "mask": 0.12, "curve": 0.08, "roll": 0.3}],
    ["vignette", {"amt": 0.5}],
  ]],
  ["LED wall", "White lights tracing a slow plasma", [
    ["plasma", {"scale": 1.6, "complex": 3, "twist": 1, "speed": 0.5, "pal": 8}],
    ["led", {"size": 16, "round": 0.9, "gap": 0.3, "glow": 0.6, "levels": 8}],
    ["glow", {"th": 0.5, "int": 0.7, "radius": 25}],
  ]],
  ["Hard drive", "Interlocking arcs rippled into grainy halftone bands", [
    ["truchet", {"scale": 5.05, "width": 0.394, "style": 1, "speed": 0.56, "seed": 9, "pal": 7, "ca": "#30270e", "cb": "#25d5c9", "cc": "#dadef4", "shift": 0.47, "contrast": 1.59, "cycle": 0}, 0, 1, true],
    ["noise", {"scale": 3.96, "oct": 5, "lac": 3.29, "gain": 0.72, "warp": 0.4, "ridged": 0, "angle": 73, "speed": 0.22, "seed": 13, "pal": 4, "ca": "#3a4310", "cb": "#48db19", "cc": "#e3ccf2", "shift": 0.31, "contrast": 1.24, "cycle": 0}, 3, 0.65, true],
    ["water", {"scale": 2.88, "height": 0.406, "chop": 0.887, "dir": 342.1, "caustics": 1.067, "glints": 0.384, "depth": 0.082, "clarity": 0.761, "tint": "#1a9bc4", "speed": 0.75, "seed": 75}, 0, 1, true],
    ["wave", {"amp": 29.4, "freq": 21.61, "dir": 3, "speed": 0.63}, 0, 1, true],
    ["halftone", {"size": 14.3, "angle": 87.6, "mode": 0, "soft": 0.82, "ink": "#320f2a", "paper": "#e0f3ed"}, 0, 1, true],
    ["grain", {"amt": 0.105, "size": 1.2, "color": 0, "anim": 1}, 0, 1, true],
  ]],
  ["Silk noir", "Black silk catching cold light", [
    ["studio", {"style": 0, "c1": "#050507", "c2": "#1c1c24", "c3": "#6c6f7d", "c4": "#e7e9f0", "scale": 1.1, "angle": 140, "distort": 0.9, "soft": 0.375, "sheen": 0.603, "grain": 0.365, "speed": 0.25, "seed": 0}, 0, 1, true],
  ]],
  ["Flow", "Ribbons of blue pulled by a current", [
    ["studio", {"style": 5, "c1": "#020b2a", "c2": "#1d4ed8", "c3": "#38bdf8", "c4": "#e0f2fe", "scale": 1, "angle": 20, "distort": 0.699, "soft": 1, "sheen": 0.5, "grain": 0.06, "speed": 0.3, "seed": 0}, 0, 1, true],
  ]],
  ["Pool", "Tiles under clear, rippling water", [
    ["grid", {"type": 1, "scale": 9, "width": 0.06, "pal": 0, "ca": "#2ab3d6", "cb": "#1b8db0", "cc": "#e9fbff"}],
    ["water", {"scale": 2.4, "height": 0.55, "chop": 0.5, "dir": 35, "caustics": 0.8, "glints": 0.6, "depth": 0.3, "clarity": 0.9, "tint": "#1a9bc4", "speed": 0.5}],
    ["vignette", {"amt": 0.3, "color": "#03303f"}],
  ]],
  ["Chrome knot", "A mirror knot on a turntable", [
    ["studio", {"style": 0, "c1": "#140c2e", "c2": "#6d2ff2", "c3": "#f0479b", "c4": "#ffc285", "scale": 1, "angle": 30, "distort": 0.8, "soft": 0.6, "sheen": 0.6, "grain": 0.05, "speed": 0.25}],
    ["object3d", {"shape": 3, "mat": 2, "color": "#f2eee8", "size": 1, "rotX": 20, "rotY": 0, "motion": 1, "cycles": 1, "shine": 1, "rim": 0.7, "shadow": 0.4}],
  ]],
];
let libN = 0;
const libId = () => 'tx' + Date.now().toString(36) + (libN++).toString(36);
const defaultLibrary = () => BUILTIN.map(([name, desc, layers], i) => ({ id: 'b' + i, name, desc, created: i + 1, layers: JSON.parse(JSON.stringify(layers)) }));
let library = defaultLibrary();
function presetLayers(i) {
  return library[i].layers.filter(([t]) => LAYER_TYPES[t]).map(([t, p, blend, op, on, keys]) => newLayer(t, { params: p, blend: blend || 0, opacity: op ?? 1, on: on !== false, open: false, keys }));
}

/* ---------------- randomization ---------------- */
const RAND = {
  noise: { scale: [1, 8] }, warp: { scale: [0.8, 3.5] }, voronoi: { scale: [3, 15] }, waves: { freq: [3, 30] },
  plasma: { scale: [1, 6] }, rings: { count: [3, 25] }, grid: { scale: [4, 24] }, truchet: { scale: [4, 16] },
  julia: { iter: [60, 160], zoom: [0.8, 2.5] }, stars: { density: [10, 50] },
  pixelate: { size: [4, 36] }, blur: { radius: [0, 12] }, glow: { radius: [10, 60], int: [0.4, 1.6], th: [0.4, 0.85] },
  displace: { amount: [10, 80] }, wave: { amp: [5, 50] }, twirl: { strength: [-5, 5] }, tile: { nx: [2, 5], ny: [2, 5] },
  halftone: { size: [5, 20] }, dither: { px: [1, 4], levels: [2, 4] }, posterize: { levels: [3, 8] }, edges: { str: [0.8, 3] },
  chroma: { amount: [2, 20] }, crt: { dens: [2, 5] }, glitch: { int: [0.1, 0.6], split: [2, 15], speed: [1, 6] },
  vignette: { amt: [0.3, 0.8] }, sharpen: { amt: [0.3, 2] },
};
const NO_RAND = new Set(['tint', 'color:vignette', 'image']);
function hsl(h, s, l) {
  h = ((h % 1) + 1) % 1;
  const f = n => { const k = (n + h * 12) % 12; const a = s * Math.min(l, 1 - l); return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
  return '#' + [f(0), f(8), f(4)].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
}
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
function snap(v, s) { const d = Math.max(0, -Math.floor(Math.log10(s || 1))); return +(Math.round(v / s) * s).toFixed(d); }
function randomizeLayer(L) {
  const def = LAYER_TYPES[L.type];
  if (def.image) return;
  const h = Math.random();
  const dark = hsl(h, rnd(0.45, 0.8), rnd(0.07, 0.17));
  const mid = hsl(h + rnd(0.06, 0.4), rnd(0.55, 0.9), rnd(0.45, 0.6));
  const light = hsl(h + rnd(0.45, 0.6), rnd(0.35, 0.8), rnd(0.8, 0.92));
  const R = RAND[L.type] || {};
  for (const p of layerParams(L.type)) {
    if (NO_RAND.has(p.k) || NO_RAND.has(p.k + ':' + L.type)) continue;
    if (p.t === 'color') L.params[p.k] = /^(ca|ink|dark)$/.test(p.k) ? dark : /^(cc|paper|light)$/.test(p.k) ? light : mid;
    else if (p.t === 'select') L.params[p.k] = p.k === 'pal' ? (Math.random() < 0.4 ? 0 : 1 + Math.floor(Math.random() * 7)) : Math.floor(Math.random() * p.o.length);
    else if (p.t === 'bool') L.params[p.k] = Math.random() < 0.5 ? 1 : 0;
    else { const [lo, hi] = R[p.k] || p.r || [p.min, p.max]; L.params[p.k] = snap(rnd(lo, hi), p.s); }
  }
  if (def.render3d) {
    if ((L.params.shape | 0) === 9 && !models.has(L.id)) L.params.shape = Math.floor(Math.random() * 9);
    L.params.size = snap(rnd(0.7, 1.3), 0.001); L.params.x = 0; L.params.y = 0; L.params.shadow = snap(rnd(0, 0.5), 0.001);
  }
}
const GEN_POOL = ['noise', 'warp', 'voronoi', 'gradient', 'waves', 'plasma', 'rings', 'grid', 'truchet', 'caustics', 'julia', 'turbulence', 'nacre', 'filaments', 'gasbands', 'moire', 'beads', 'meshgrad', 'graingrad', 'liqmetal', 'gemsmoke', 'neuro', 'simplex', 'brushed', 'wood', 'stone', 'terrazzo', 'holo', 'satin', 'concrete', 'goldleaf', 'blobs', 'rust', 'studio', 'studio', 'studio'];
const FX_POOL = ['kaleido', 'wave', 'displace', 'twirl', 'bulge', 'polar', 'mirror', 'tile', 'pixelate', 'glow', 'edges', 'chroma', 'glitch', 'crt', 'halftone', 'dither', 'posterize', 'adjust', 'gradmap', 'transform', 'sharpen', 'led', 'glass', 'fluted', 'lens', 'water', 'heatmap', 'relief', 'chromemap', 'iridescence'];
function shuffleStack() {
  const out = [];
  const g = newLayer(pick(GEN_POOL), { open: false }); randomizeLayer(g); out.push(g);
  if (Math.random() < 0.55) {
    const g2 = newLayer(pick(GEN_POOL.concat(['stars'])), { open: false }); randomizeLayer(g2);
    g2.blend = pick([1, 3, 4, 5, 6, 10]); g2.opacity = snap(rnd(0.35, 0.85), 0.01); out.push(g2);
  }
  // Sometimes a 3D object: usually under the effects so they reach it, sometimes on top of everything.
  let obj = null;
  if (Math.random() < 0.25) {
    obj = newLayer('object3d', { open: false }); randomizeLayer(obj);
    obj.params.shape = Math.floor(Math.random() * 9);
    obj.params.mat = pick([0, 1, 1, 2, 2, 3, 3, 4, 5, 6]);
    obj.params.motion = 1 + Math.floor(Math.random() * 7);
    obj.params.cycles = pick([1, 1, 1, 2]);
    obj.params.color = pick(['#f1ede6', '#ffd9a8', '#a8d8ff', '#ff9fb8', '#c9ffd2', '#e8e4dc']);
    if (Math.random() < 0.65) { out.push(obj); obj = null; }
  }
  const used = new Set();
  const n = 1 + Math.floor(Math.random() * 3);
  while (used.size < n) {
    const t = pick(FX_POOL); if (used.has(t)) continue; used.add(t);
    const f = newLayer(t, { open: false }); randomizeLayer(f); out.push(f);
  }
  if (obj) out.push(obj);
  if (Math.random() < 0.5) out.push(newLayer('grain', { params: { amt: snap(rnd(0.04, 0.12), 0.001) }, open: false }));
  if (!used.has('vignette') && Math.random() < 0.12) out.push(newLayer('vignette', { params: { amt: snap(rnd(0.3, 0.6), 0.001) }, open: false }));
  return out;
}

/* ---------------- three.js pipeline ---------------- */
const canvas = $('#view');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
} catch (e) {
  $('#canvasWrap').innerHTML = '<p class="empty">This browser could not start WebGL, which the texture engine needs. Try a recent Chrome, Edge, Firefox or Safari with hardware acceleration switched on.</p>';
  throw e;
}
renderer.setPixelRatio(1);
const MAX_TEX = Math.min(renderer.capabilities.maxTextureSize || 4096, 8192);
const scene = new THREE.Scene();
const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
quad.frustumCulled = false; scene.add(quad);
const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
const COPY = new THREE.ShaderMaterial({
  uniforms: { tPrev: { value: null } }, vertexShader: VERT, depthTest: false, depthWrite: false,
  fragmentShader: 'precision highp float; varying vec2 vUv; uniform sampler2D tPrev; void main(){ gl_FragColor = vec4(texture2D(tPrev, vUv).rgb, 1.0); }',
});
const BLACK = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1, THREE.RGBAFormat); BLACK.needsUpdate = true;
const mats = {};
function getMat(type) {
  if (mats[type]) return mats[type];
  const def = LAYER_TYPES[type];
  const u = {
    tPrev: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uLoop: { value: 0 }, uOpacity: { value: 1 }, uBlend: { value: 0 },
    u_seed: { value: 0 }, u_pal: { value: 0 }, u_ca: { value: new THREE.Color() }, u_cb: { value: new THREE.Color() }, u_cc: { value: new THREE.Color() },
    u_shift: { value: 0 }, u_contrast: { value: 1 }, u_cycle: { value: 0 },
  };
  for (const p of def.params) if (!u['u_' + p.k]) u['u_' + p.k] = { value: p.t === 'color' ? new THREE.Color() : 0 };
  if (def.render3d) u.u_obj = { value: BLACK };
  if (def.image) { u.u_tex = { value: BLACK }; u.u_texSize = { value: new THREE.Vector2(1, 1) }; u.u_has = { value: 0 }; }
  mats[type] = new THREE.ShaderMaterial({ uniforms: u, vertexShader: VERT, fragmentShader: buildFragment(type), depthTest: false, depthWrite: false });
  return mats[type];
}
function makeRT(w, h) {
  return new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, type: THREE.UnsignedByteType, depthBuffer: false, stencilBuffer: false });
}
function ensurePair(pair, w, h) {
  if (pair.w === w && pair.h === h && pair.a) return;
  disposePair(pair);
  pair.a = makeRT(w, h); pair.b = makeRT(w, h); pair.w = w; pair.h = h;
}
function disposePair(pair) { if (pair.a) { pair.a.dispose(); pair.b.dispose(); pair.a = pair.b = null; pair.w = pair.h = 0; } }
let curLoop = 0;   // loop length in animation seconds for the stack being rendered; 0 = free running

/* ---------------- keyframes ----------------
   L.keys = { paramKey | '_opacity': [{ u, v, e }] }, sorted by u. u is the position in the loop (0 to 1),
   so changing the loop length stretches the animation. With the loop on, interpolation also runs from the
   last key round to the first, which keeps keyframed motion seamless. e is the ease out of that key. */
const EASES = ['Linear', 'Ease in and out', 'Ease in', 'Ease out', 'Hold', 'Custom curve'];
// Each built-in ease as a cubic-bezier, used to seed the curve editor when switching to Custom.
const EASE_BEZ = [[0, 0, 1, 1], [0.42, 0, 0.58, 1], [0.42, 0, 1, 1], [0, 0, 0.58, 1], [0, 0, 1, 1]];
const CURVE_PRESETS = [
  ['Linear', [0, 0, 1, 1]], ['Smooth', [0.42, 0, 0.58, 1]], ['Ease in', [0.55, 0, 1, 0.45]], ['Ease out', [0, 0.55, 0.45, 1]],
  ['Strong', [0.85, 0, 0.15, 1]], ['Overshoot', [0.34, 1.56, 0.64, 1]], ['Anticipate', [0.36, 0, 0.66, -0.56]], ['Spring back', [0.68, -0.6, 0.32, 1.6]],
];
// cubic-bezier(x1, y1, x2, y2) at progress x: solve X(t) = x by Newton steps with a bisection fallback.
function bezierY(b, x) {
  const [x1, y1, x2, y2] = b;
  const B = (t, a, c) => 3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * c + t * t * t;
  const dB = (t, a, c) => 3 * (1 - t) * (1 - t) * a + 6 * (1 - t) * t * (c - a) + 3 * t * t * (1 - c);
  let t = x;
  for (let i = 0; i < 8; i++) { const e = B(t, x1, x2) - x, d = dB(t, x1, x2); if (Math.abs(e) < 1e-6) break; if (Math.abs(d) < 1e-6) { t = -1; break; } t -= e / d; }
  if (!(t >= 0 && t <= 1) || Math.abs(B(t, x1, x2) - x) > 1e-4) {
    let lo = 0, hi = 1; t = x;
    for (let i = 0; i < 30; i++) { t = (lo + hi) / 2; if (B(t, x1, x2) < x) lo = t; else hi = t; }
  }
  return B(t, y1, y2);
}
let curKU = 0;     // keyframe time (0 to 1) of the frame being rendered
let kclock = 0;    // seconds of playback, drives keyframes while the loop is off
const easeF = (e, x) => e === 1 ? x * x * (3 - 2 * x) : e === 2 ? x * x : e === 3 ? 1 - (1 - x) * (1 - x) : x;
function evalKeys(ks, u) {
  const n = ks.length; if (!n) return null; if (n === 1) return ks[0].v;
  const cyc = state.loop.on;
  let i = -1; for (let j = 0; j < n; j++) if (ks[j].u <= u) i = j;
  let a, b, ua, ub;
  if (i === -1) { if (!cyc) return ks[0].v; a = ks[n - 1]; b = ks[0]; ua = a.u - 1; ub = b.u; }
  else if (i === n - 1) { if (!cyc) return ks[n - 1].v; a = ks[n - 1]; b = ks[0]; ua = a.u; ub = b.u + 1; }
  else { a = ks[i]; b = ks[i + 1]; ua = a.u; ub = b.u; }
  if ((a.e | 0) === 4) return a.v;
  const x = ub > ua ? Math.min(1, Math.max(0, (u - ua) / (ub - ua))) : 0;
  return a.v + (b.v - a.v) * ((a.e | 0) === 5 && a.b ? bezierY(a.b, x) : easeF(a.e | 0, x));
}
const keysOf = (L, k) => (L.keys && L.keys[k]) || null;
const isKeyed = (L, k) => { const ks = keysOf(L, k); return !!(ks && ks.length); };
const isAnimated = L => !!L.keys && Object.keys(L.keys).some(k => L.keys[k].length);
function liveParams(L, u = curKU) {
  if (!isAnimated(L)) return L.params;
  const P = { ...L.params };
  for (const k in L.keys) if (k !== '_opacity' && L.keys[k].length) P[k] = evalKeys(L.keys[k], u);
  return P;
}
function liveOpacity(L, u = curKU) { const ks = keysOf(L, '_opacity'); return ks && ks.length ? evalKeys(ks, u) : L.opacity; }
function liveValue(L, k, u) { const ks = keysOf(L, k); return ks && ks.length ? evalKeys(ks, u) : (k === '_opacity' ? L.opacity : L.params[k]); }
const uNow = () => state.loop.on ? (state.loop.dur ? phase / state.loop.dur : 0) : ((kclock / Math.max(state.loop.dur, 0.001)) % 1);
const frameU = () => 1 / Math.max(1, state.loop.dur * 30);
function keyAt(L, k, u) { const ks = keysOf(L, k); return ks ? ks.find(x => Math.abs(x.u - u) < frameU() * 0.5) : null; }
function setKey(L, k, u, v) {
  if (!L.keys) L.keys = {};
  const ks = L.keys[k] || (L.keys[k] = []);
  const ex = ks.find(x => Math.abs(x.u - u) < frameU() * 0.5);
  if (ex) ex.v = v; else { ks.push({ u: Math.round(u / frameU()) * frameU() % 1, v, e: 1 }); ks.sort((a, b) => a.u - b.u); }
}
function removeKey(L, k, key) {
  const ks = keysOf(L, k); if (!ks) return;
  const i = ks.indexOf(key); if (i >= 0) ks.splice(i, 1);
  if (!ks.length) delete L.keys[k];
}
// Change a value from the UI: on an animated property this writes a key at the playhead.
function writeValue(L, k, v) {
  if (isKeyed(L, k)) setKey(L, k, uNow(), v);
  if (k === '_opacity') L.opacity = v; else L.params[k] = v;
}
function runStack(pair, w, h, t, layers = state.layers, onLayer = null) {
  ensurePair(pair, w, h);
  let read = pair.a, write = pair.b;
  renderer.setRenderTarget(read); renderer.setClearColor(0x000000, 1); renderer.clear();
  for (const L of layers) {
    if (!L.on || !LAYER_TYPES[L.type]) continue;
    const m = getMat(L.type), u = m.uniforms, def = LAYER_TYPES[L.type];
    u.tPrev.value = read.texture; u.uRes.value.set(w, h); u.uTime.value = t; u.uLoop.value = curLoop;
    const P = liveParams(L);
    u.uOpacity.value = liveOpacity(L); u.uBlend.value = L.blend;
    for (const p of layerParams(L.type)) {
      const k = 'u_' + p.k; if (!u[k]) continue;
      const v = P[p.k];
      if (p.t === 'color') u[k].value.set(v || '#000000'); else u[k].value = +v || 0;
    }
    if (def.render3d) u.u_obj.value = render3D(L, P, read.texture, w, h, t).texture;
    if (def.image) {
      const tx = textures.get(L.id);
      u.u_tex.value = tx ? tx.tex : BLACK; u.u_has.value = tx ? 1 : 0;
      if (tx) u.u_texSize.value.set(tx.w, tx.h);
    }
    quad.material = m;
    renderer.setRenderTarget(write); renderer.render(scene, cam);
    const tmp = read; read = write; write = tmp;
    if (onLayer) onLayer(L, read);
  }
  return read;
}

/* ---------------- 3D object layers ----------------
   Each 3D layer renders its mesh into its own transparent target (supersampled 2x for clean edges),
   and the layer's composite shader lays that over the stack. The mesh shader can read the layers
   below, so chrome reflects them, glass bends them, and the wrap material uses them as a texture. */
const models = new Map();               // layer id -> { root: Object3D, name }
const objScene = new THREE.Scene();
const objCam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
objCam.position.set(0, 0, 3.2);
const objHolder = new THREE.Group(); objScene.add(objHolder);
const objRTs = new Map();
const geoCache = {};
// Non-indexed copy with barycentric coordinates, so the wireframe material can draw real-width lines.
function wireGeometry(g) {
  if (g.userData.wire) return g.userData.wire;
  const w = g.index ? g.toNonIndexed() : g.clone();
  const n = w.attributes.position.count, b = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) b[i * 3 + (i % 3)] = 1;
  w.setAttribute('bary', new THREE.BufferAttribute(b, 3));
  return (g.userData.wire = w);
}
// Sparser meshes for the wireframe material, so the lines read as a lattice rather than a solid.
function wireShape(i) {
  const k = 'w' + i; if (geoCache[k]) return geoCache[k];
  const G = [
    () => new THREE.SphereGeometry(0.5, 24, 16),
    () => new THREE.BoxGeometry(0.72, 0.72, 0.72, 2, 2, 2),
    () => new THREE.TorusGeometry(0.36, 0.15, 12, 36),
    () => new THREE.TorusKnotGeometry(0.3, 0.1, 96, 8),
    () => new THREE.IcosahedronGeometry(0.55, 0),
    () => new THREE.OctahedronGeometry(0.58, 0),
    () => new THREE.CylinderGeometry(0.34, 0.34, 0.8, 24, 4),
    () => new THREE.ConeGeometry(0.42, 0.85, 24, 4),
    () => new THREE.IcosahedronGeometry(0.5, 3),
  ][i] || (() => new THREE.SphereGeometry(0.5, 24, 16));
  return (geoCache[k] = wireGeometry(G()));
}
function shapeGeometry(i) {
  if (geoCache[i]) return geoCache[i];
  const G = [
    () => new THREE.SphereGeometry(0.5, 128, 96),
    () => new THREE.BoxGeometry(0.72, 0.72, 0.72, 1, 1, 1),
    () => new THREE.TorusGeometry(0.36, 0.15, 96, 192),
    () => new THREE.TorusKnotGeometry(0.3, 0.1, 320, 40),
    () => new THREE.IcosahedronGeometry(0.55, 0),
    () => new THREE.OctahedronGeometry(0.58, 0),
    () => new THREE.CylinderGeometry(0.34, 0.34, 0.8, 128, 1),
    () => new THREE.ConeGeometry(0.42, 0.85, 128, 1),
    () => new THREE.IcosahedronGeometry(0.5, 24),
  ][i] || (() => new THREE.SphereGeometry(0.5, 64, 48));
  return (geoCache[i] = G());
}
const OBJ_VERT = `
#include <common>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
uniform float uTime, uLoop, uWobble, uWScale, uWSpeed;
attribute vec3 bary;
varying vec3 vN, vV, vB; varying vec2 vUv;
#define TAU 6.28318530718
float ang1(float w){ if (uLoop <= 0.0 || w == 0.0) return w * uTime; float n = w * uLoop / TAU; return TAU * sign(n) * max(1.0, floor(abs(n) + 0.5)) * uTime / uLoop; }
vec3 disp(vec3 p, vec3 n){
  float k = uWScale * 2.0;
  float d = sin(p.x * k + ang1(0.9 * uWSpeed)) * sin(p.y * k + ang1(0.7 * uWSpeed) + 1.3) * sin(p.z * k + ang1(1.1 * uWSpeed) + 2.1);
  return p + n * d * uWobble * 0.3;
}
void main(){
  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  vec3 p = transformed, n = objectNormal;
  if (uWobble > 0.0) {
    vec3 t1 = normalize(abs(n.y) < 0.99 ? cross(n, vec3(0.0, 1.0, 0.0)) : cross(n, vec3(1.0, 0.0, 0.0)));
    vec3 t2 = cross(n, t1);
    float e = 0.004;
    vec3 a = disp(p, n), b = disp(p + t1 * e, n), c = disp(p + t2 * e, n);
    n = normalize(cross(b - a, c - a)); p = a;
  }
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vV = -mv.xyz; vN = normalize(normalMatrix * n); vUv = uv; vB = bary;
  gl_Position = projectionMatrix * mv;
}`;
const OBJ_FRAG = `
precision highp float;
uniform sampler2D tPrev; uniform vec2 uRes; uniform vec3 uColor;
uniform float uMode, uShine, uRim, uIor, uRepeat, uLightA, uWire;
varying vec3 vN, vV, vB; varying vec2 vUv;
#define TAU 6.28318530718
void main(){
  vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
  vec3 v = normalize(vV);
  vec3 L = normalize(vec3(cos(uLightA), sin(uLightA), 0.9));
  float nl = dot(n, L), dif = max(nl, 0.0), wrap = nl * 0.5 + 0.5;
  vec3 h = normalize(L + v);
  float sp = pow(max(dot(n, h), 0.0), mix(12.0, 160.0, clamp(uShine * 0.5, 0.0, 1.0))) * uShine;
  float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
  vec2 suv = gl_FragCoord.xy / uRes;
  vec3 col;
  if (uMode < 0.5) col = uColor * (0.2 + 0.85 * wrap * wrap) + uColor * fres * uRim * 0.3 + sp * 0.12;
  else if (uMode < 1.5) col = uColor * (0.1 + 0.9 * dif) + sp + fres * uRim * 0.4;
  else if (uMode < 2.5) {
    vec3 r = reflect(-v, n);
    vec3 env = texture2D(tPrev, clamp(0.5 + r.xy * 0.48, 0.0, 1.0)).rgb;
    col = env * mix(vec3(1.0), uColor, 0.45) * (0.75 + 0.35 * wrap) + sp * 0.9 + fres * uRim * 0.55;
  } else if (uMode < 3.5) {
    vec2 off = n.xy * uIor * 0.14;
    vec3 bg = vec3(texture2D(tPrev, suv - off * 1.06).r, texture2D(tPrev, suv - off).g, texture2D(tPrev, suv - off * 0.94).b);
    col = bg * mix(vec3(1.0), uColor, 0.3) * (0.85 + 0.2 * wrap) + sp + fres * uRim * 0.9;
  } else if (uMode < 4.5) {
    vec2 m = 1.0 - abs(1.0 - mod(vUv * uRepeat * vec2(2.0, 1.0), 2.0));
    col = texture2D(tPrev, m).rgb * (0.25 + 0.9 * wrap) + sp * 0.5 + fres * uRim * 0.25;
  } else if (uMode < 5.5) {
    vec3 film = 0.5 + 0.5 * cos(TAU * (dot(n, v) * 1.3 + n.y * 0.25 + vec3(0.0, 0.33, 0.67)));
    col = film * (0.35 + 0.75 * wrap) + sp + fres * uRim * 0.6;
  } else {
    float e = min(min(vB.x, vB.y), vB.z);
    float fw = fwidth(e) * uWire;
    float line = 1.0 - smoothstep(fw * 0.5, fw * 1.5, e);
    if (line < 0.02) discard;
    col = uColor * (0.75 + 0.35 * wrap) + fres * uRim * 0.5;
    gl_FragColor = vec4(clamp(col, 0.0, 1.0), line);
    return;
  }
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;
const objMats = new Map();
function objMaterial(L) {
  let m = objMats.get(L.id);
  if (!m) {
    m = new THREE.ShaderMaterial({
      vertexShader: OBJ_VERT, fragmentShader: OBJ_FRAG, side: THREE.DoubleSide, extensions: { derivatives: true },
      uniforms: {
        tPrev: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uColor: { value: new THREE.Color() },
        uMode: { value: 0 }, uShine: { value: 0 }, uRim: { value: 0 }, uIor: { value: 0 }, uRepeat: { value: 1 }, uLightA: { value: 0 }, uWire: { value: 2 },
        uTime: { value: 0 }, uLoop: { value: 0 }, uWobble: { value: 0 }, uWScale: { value: 1 }, uWSpeed: { value: 1 },
      },
    });
    objMats.set(L.id, m);
  }
  return m;
}
const meshCache = new Map();
function objNode(L, P, mat) {
  const shape = P.shape | 0, wire = (P.mat | 0) === 6;
  if (shape === 9) {
    const md = models.get(L.id); if (!md) return null;
    md.root.traverse(o => {
      if (!o.isMesh) return;
      if (!o.userData.solid) o.userData.solid = o.geometry;
      o.geometry = wire ? wireGeometry(o.userData.solid) : o.userData.solid;
      const mats = o.userData.mats || (o.userData.mats = new Map());
      let m = mats.get(L.id);
      if (!m || m.uniforms !== mat.uniforms) {
        const ma = o.geometry.morphAttributes || {};
        m = new THREE.ShaderMaterial({
          vertexShader: OBJ_VERT, fragmentShader: OBJ_FRAG, uniforms: mat.uniforms, side: THREE.DoubleSide, extensions: { derivatives: true },
          skinning: !!o.isSkinnedMesh, morphTargets: !!ma.position, morphNormals: !!ma.normal,
        });
        mats.set(L.id, m);
      }
      o.material = m;
    });
    // Imported animation clips play a whole number of times per loop, so they loop with everything else.
    if (md.mixer && md.clips.length) {
      const ci = Math.min(md.clips.length - 1, Math.max(0, P.clip | 0));
      if (+P.anim) {
        if (md.cur !== ci) { md.mixer.stopAllAction(); md.action = md.mixer.clipAction(md.clips[ci]); md.action.play(); md.cur = ci; }
        const rep = Math.max(1, Math.round(+P.arep || 1));
        md.mixer.setTime(((curKU * rep) % 1) * (md.clips[ci].duration || 1));
      } else if (md.cur !== -1) { md.mixer.setTime(0); md.mixer.stopAllAction(); md.cur = -1; }
    }
    return md.root;
  }
  const key = L.id + ':' + shape;
  let mesh = meshCache.get(key);
  if (!mesh) { mesh = new THREE.Mesh(shapeGeometry(shape), mat); meshCache.set(key, mesh); }
  mesh.geometry = wire ? wireShape(shape) : shapeGeometry(shape);
  mesh.material = mat;
  return mesh;
}
/* Motion presets. Each is a whole number of cycles over the loop, so the last frame meets the first.
   With the loop off they repeat every 4 seconds of animation time. */
function objMotion(P, t) {
  const m = P.motion | 0, out = { rx: 0, ry: 0, rz: 0, x: 0, y: 0 };
  if (!m) return out;
  const ph = curLoop > 0 ? t / curLoop : t / 4, A = Math.PI * 2 * Math.max(1, Math.round(+P.cycles || 1)) * ph;
  if (m === 1) out.ry = A;
  else if (m === 2) { out.rx = A; out.ry = A; }
  else if (m === 3) out.rx = A;
  else if (m === 4) { out.ry = Math.sin(A) * 0.75; out.rz = Math.sin(A) * 0.12; }
  else if (m === 5) { out.y = Math.sin(A) * 0.08; out.ry = Math.sin(A) * 0.35; out.rx = Math.sin(A + 1.2) * 0.12; }
  else if (m === 6) { out.x = Math.cos(A) * 0.32; out.y = Math.sin(A) * 0.2; out.ry = A; }
  else if (m === 7) { out.ry = A; out.y = Math.sin(A * 2) * 0.05; }
  return out;
}
function jsAng1(w, t, loop) {
  if (loop <= 0 || !w) return w * t;
  const n = w * loop / (Math.PI * 2);
  return Math.PI * 2 * Math.sign(n) * Math.max(1, Math.floor(Math.abs(n) + 0.5)) * t / loop;
}
function render3D(L, P, belowTex, w, h, t) {
  const ss = Math.max(1, Math.min(2, (MAX_TEX || 4096) / Math.max(w, h)));
  const W = Math.round(w * ss), H = Math.round(h * ss), key = W + 'x' + H;
  let rt = objRTs.get(key);
  if (!rt) {
    rt = new THREE.WebGLRenderTarget(W, H, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, depthBuffer: true, stencilBuffer: false });
    objRTs.set(key, rt);
    if (objRTs.size > 5) { const [k0, r0] = objRTs.entries().next().value; if (k0 !== key) { r0.dispose(); objRTs.delete(k0); } }
  }
  const mat = objMaterial(L), U = mat.uniforms;
  U.tPrev.value = belowTex; U.uRes.value.set(W, H); U.uColor.value.set(P.color || '#ffffff');
  U.uMode.value = P.mat | 0; U.uShine.value = +P.shine || 0; U.uRim.value = +P.rim || 0; U.uIor.value = +P.ior || 0;
  U.uRepeat.value = +P.repeat || 1; U.uLightA.value = (+P.light || 0) * Math.PI / 180;
  U.uTime.value = t; U.uLoop.value = curLoop;
  U.uWobble.value = (+P.wobble || 0) + ((P.shape | 0) === 8 ? 0.35 : 0); U.uWScale.value = +P.wscale || 1; U.uWSpeed.value = 1;
  U.uWire.value = 1.4 * Math.max(1, Math.min(2, W / w));
  objHolder.clear();
  const node = objNode(L, P, mat);
  renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear();
  if (node) {
    objHolder.add(node);
    const d2r = Math.PI / 180, M = objMotion(P, t);
    objHolder.rotation.set((+P.rotX || 0) * d2r + jsAng1(+P.spinX || 0, t, curLoop) + M.rx, (+P.rotY || 0) * d2r + jsAng1(+P.spinY || 0, t, curLoop) + M.ry, (+P.rotZ || 0) * d2r + jsAng1(+P.spinZ || 0, t, curLoop) + M.rz);
    const s = +P.size || 1;
    objHolder.scale.set(s, s, s);
    objCam.aspect = w / h; objCam.updateProjectionMatrix();
    const vh = 2 * objCam.position.z * Math.tan(objCam.fov * Math.PI / 360);
    objHolder.position.set(((+P.x || 0) + M.x) * vh * 0.5 * objCam.aspect, ((+P.y || 0) + M.y) * vh * 0.5, 0);
    renderer.render(objScene, objCam);
  }
  renderer.setClearColor(0x000000, 1);
  return rt;
}
function disposeLayer3D(id) {
  const m = objMats.get(id); if (m) { m.dispose(); objMats.delete(id); }
  for (const k of [...meshCache.keys()]) if (k.startsWith(id + ':')) meshCache.delete(k);
}
const LOADERS = { glb: 'LOADER_GLTF', gltf: 'LOADER_GLTF', obj: 'LOADER_OBJ', stl: 'LOADER_STL' };
const MODEL_EXT = /\.(glb|gltf|obj|stl)$/i;
async function loadModel(file, L) {
  const ext = (file.name.match(MODEL_EXT) || [])[1];
  if (!ext) { toast('That file is not a 3D model. Use GLB, glTF, OBJ or STL.'); return; }
  try {
    await loadScript(LOADERS[ext.toLowerCase()]);
    let root, clips = [];
    const e = ext.toLowerCase();
    if (e === 'glb' || e === 'gltf') {
      const data = e === 'glb' ? await file.arrayBuffer() : await file.text();
      const g = await new Promise((res, rej) => new THREE.GLTFLoader().parse(data, '', res, err => rej(err || new Error('could not read the glTF'))));
      root = g.scene; clips = (g.animations || []).filter(c => c.duration > 0);
    } else if (e === 'obj') root = new THREE.OBJLoader().parse(await file.text());
    else root = new THREE.Mesh(new THREE.STLLoader().parse(await file.arrayBuffer()));
    let meshes = 0;
    root.traverse(o => { if (o.isMesh) { meshes++; if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals(); } });
    if (!meshes) throw new Error('the file has no meshes');
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root), size = new THREE.Vector3(), ctr = new THREE.Vector3();
    box.getSize(size); box.getCenter(ctr);
    const wrap = new THREE.Group(), inner = new THREE.Group();
    inner.add(root); inner.position.copy(ctr).multiplyScalar(-1);
    wrap.add(inner); wrap.scale.setScalar(1 / Math.max(size.x, size.y, size.z, 1e-6));
    const old = models.get(L.id);
    const mixer = clips.length ? new THREE.AnimationMixer(root) : null;
    models.set(L.id, { root: wrap, name: file.name, clips, mixer, cur: -1 });
    if (clips.length) { L.params.anim = 1; L.params.clip = 0; }
    if (old && ![...models.entries()].some(([id, m]) => id !== L.id && m === old)) old.root.traverse(o => { if (o.isMesh) o.geometry.dispose(); });
    L.params.shape = 9; dirty = true; renderStack(); committed();
    toast(clips.length ? `Loaded ${file.name} with ${clips.length} animation${clips.length === 1 ? '' : 's'}.` : `Loaded ${file.name}.`);
  } catch (err) {
    console.error(err);
    toast(`Could not load ${file.name}: ${err.message || err}. glTF files with separate texture or buffer files will not load; use GLB instead.`);
  }
}
function pickModel(L) {
  const input = el('input', { type: 'file', accept: '.glb,.gltf,.obj,.stl', hidden: true });
  input.addEventListener('change', () => { if (input.files[0]) loadModel(input.files[0], L); input.remove(); });
  document.body.append(input); input.click();
}
function modelPanel(L) {
  const md = models.get(L.id), box = el('div', { class: 'model-panel' });
  if (!md) {
    const drop = el('button', { class: 'model-drop', type: 'button', onclick: () => pickModel(L) },
      el('span', { class: 'md-icon', html: ICON.cube }),
      el('b', {}, 'Upload a 3D model'),
      el('span', {}, 'GLB, glTF, OBJ or STL. Animated GLB and glTF files play their animations. You can also drop a file on the canvas.'));
    box.append(drop);
    return box;
  }
  box.append(modelRow(L));
  if (md.clips && md.clips.length) {
    const P = L.params;
    box.append(boolRow('Play animation', P.anim, v => { P.anim = v; dirty = true; renderStack(); committed(); }));
    if (+P.anim) {
      if (md.clips.length > 1) box.append(selectRow('Clip', md.clips.map((c, i) => c.name || `Clip ${i + 1}`), Math.min(md.clips.length - 1, P.clip | 0), v => { P.clip = v; dirty = true; committed(); }));
      box.append(sliderRow({ label: 'Plays per loop', value: Math.max(1, P.arep | 0), min: 1, max: 12, step: 1, def: 1, onInput: v => { P.arep = v; dirty = true; }, onChange: committed }));
      const c = md.clips[Math.min(md.clips.length - 1, P.clip | 0)];
      box.append(el('p', { class: 'opts-note' }, `“${c.name || 'Clip'}” is ${c.duration.toFixed(2)} s long and is retimed to play ${Math.max(1, P.arep | 0)} time${(P.arep | 0) > 1 ? 's' : ''} per loop, so it stays seamless.`));
    }
  } else box.append(el('p', { class: 'opts-note' }, 'This model has no animation clips. Use Motion below to animate it.'));
  return box;
}
function modelRow(L) {
  const input = el('input', { type: 'file', accept: '.glb,.gltf,.obj,.stl', hidden: true });
  const md = models.get(L.id);
  const btn = el('button', { class: 'btn', type: 'button' }, md ? 'Replace model' : 'Choose model');
  btn.addEventListener('click', () => input.click());
  input.addEventListener('change', () => { if (input.files[0]) loadModel(input.files[0], L); });
  return el('div', { class: 'file-row' }, btn, input, el('span', { class: 'fname' }, md ? md.name : 'GLB, glTF, OBJ or STL. You can also drop one on the canvas.'));
}
/* Procedural loops: every layer's motion is written so that time loopLen looks exactly like time 0
   (see the loop helpers in the shader header), so a loop is just one pass of time from 0 to loopLen. */
function loopSpec(x) { const s = state.speed, L = state.loop.dur; return { a: x * s, loop: L * s, ku: L ? (x / L) % 1 : 0 }; }
const currentSpec = () => state.loop.on ? loopSpec(phase) : { a: time, loop: 0, ku: uNow() };
function compose(ctx, w, h, spec, onLayer) {
  curLoop = spec.loop || 0; curKU = spec.ku || 0;
  return runStack(ctx.a || (ctx.a = {}), w, h, spec.a, state.layers, onLayer);
}
function disposeCtx(ctx) { if (ctx.a) disposePair(ctx.a); if (ctx.b) disposePair(ctx.b); if (ctx.out) ctx.out.dispose(); ctx.out = null; }
function present(rt) {
  COPY.uniforms.tPrev.value = rt.texture; quad.material = COPY;
  renderer.setRenderTarget(null); renderer.render(scene, cam);
}

/* ---------------- sizes ---------------- */
const even = v => Math.max(2, Math.round(v / 2) * 2);
function exportSize() {
  if (state.ratio === 'Custom') {
    return { w: clampSize(state.customW), h: clampSize(state.customH) };
  }
  const r = RATIOS.find(r => r[0] === state.ratio) || RATIOS[1];
  const short = state.tier, a = r[1] / r[2];
  let w = a >= 1 ? short * a : short, h = a >= 1 ? short : short / a;
  const k = Math.min(1, MAX_TEX / Math.max(w, h));
  return { w: even(w * k), h: even(h * k) };
}
function clampSize(v) { return Math.max(16, Math.min(MAX_TEX, Math.round(+v || 16))); }
function ratioLabel(w, h) {
  const g = (a, b) => b ? g(b, a % b) : a; const d = g(w, h);
  const rw = w / d, rh = h / d;
  return rw <= 64 && rh <= 64 ? `${rw}:${rh}` : (w / h).toFixed(2) + ':1';
}

let prevW = 2, prevH = 2;
function layoutCanvas() {
  const { w, h } = exportSize();
  const wrap = $('#canvasWrap');
  const cs = getComputedStyle(wrap);
  const bw = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const bh = wrap.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  if (bw <= 0 || bh <= 0) return;
  const s = Math.min(bw / w, bh / h);
  const cw = Math.max(1, Math.floor(w * s)), ch = Math.max(1, Math.floor(h * s));
  canvas.style.width = cw + 'px'; canvas.style.height = ch + 'px';
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let pw = cw * dpr * state.previewQ, ph = ch * dpr * state.previewQ;
  const cap = Math.min(1, 2048 / Math.max(pw, ph), w / pw, h / ph);
  if (cap < 1) { pw *= cap; ph *= cap; }
  prevW = Math.max(2, Math.round(pw)); prevH = Math.max(2, Math.round(ph));
  if (!exporting) renderer.setSize(prevW, prevH, false);
  $('#ratioOut').textContent = state.ratio === 'Custom' ? `${w} × ${h}` : state.ratio;
  const g = $('#ratioGlyph'); g.innerHTML = ''; g.append(ratioGlyph(state.ratio === 'Custom' ? ['c', w, h] : RATIOS.find(r => r[0] === state.ratio)));
  dirty = true;
}
new ResizeObserver(() => layoutCanvas()).observe($('#canvasWrap'));

/* ---------------- resizable side panels ---------------- */
const PANELS = {
  l: { key: 'panelL', el: '#leftResizer', min: 220, max: 480, def: 284, sign: 1, cssVar: '--lw' },
  r: { key: 'panelR', el: '#rightResizer', min: 280, max: 560, def: 328, sign: -1, cssVar: '--rw' },
};
const MIN_STAGE = 360;
const RAIL = 44;
function panelWidths() {
  let l = state.presetsMin ? RAIL : state.panelL || PANELS.l.def, r = state.layersMin ? RAIL : state.panelR || PANELS.r.def;
  const room = window.innerWidth - MIN_STAGE;
  if (l + r > room) {
    const over = l + r - room;
    const tl = state.presetsMin ? 0 : Math.max(0, l - PANELS.l.min), tr = state.layersMin ? 0 : Math.max(0, r - PANELS.r.min);
    const k = tl + tr > 0 ? Math.min(1, over / (tl + tr)) : 0;
    l -= tl * k; r -= tr * k;
  }
  return { l: Math.round(l), r: Math.round(r) };
}
function applyPanels() {
  const lay = $('.layout');
  if (window.innerWidth <= 760) { lay.style.removeProperty('--lw'); lay.style.removeProperty('--rw'); return; }
  const w = panelWidths();
  lay.style.setProperty('--lw', w.l + 'px'); lay.style.setProperty('--rw', w.r + 'px');
  for (const [k, P] of Object.entries(PANELS)) {
    const h = $(P.el); h.setAttribute('aria-valuemin', P.min); h.setAttribute('aria-valuemax', P.max); h.setAttribute('aria-valuenow', w[k]);
  }
}
for (const [k, P] of Object.entries(PANELS)) {
  const h = $(P.el);
  let startX = 0, startW = 0;
  const setW = v => { state[P.key] = Math.round(Math.min(P.max, Math.max(P.min, v))); applyPanels(); };
  h.addEventListener('pointerdown', e => {
    e.preventDefault(); h.setPointerCapture(e.pointerId);
    startX = e.clientX; startW = panelWidths()[k];
    h.classList.add('dragging'); document.body.classList.add('resizing');
  });
  h.addEventListener('pointermove', e => { if (h.hasPointerCapture(e.pointerId)) setW(startW + (e.clientX - startX) * P.sign); });
  const end = e => { if (h.hasPointerCapture && h.hasPointerCapture(e.pointerId)) h.releasePointerCapture(e.pointerId); h.classList.remove('dragging'); document.body.classList.remove('resizing'); save(); };
  h.addEventListener('pointerup', end); h.addEventListener('pointercancel', end);
  h.addEventListener('dblclick', () => { state[P.key] = null; applyPanels(); save(); });
  h.addEventListener('keydown', e => {
    const step = e.shiftKey ? 48 : 16, cur = panelWidths()[k];
    const grow = e.key === 'ArrowRight' ? P.sign : e.key === 'ArrowLeft' ? -P.sign : 0;
    if (grow) { e.preventDefault(); setW(cur + grow * step); save(); }
    else if (e.key === 'Home') { e.preventDefault(); setW(P.min); save(); }
    else if (e.key === 'End') { e.preventDefault(); setW(P.max); save(); }
  });
}
window.addEventListener('resize', applyPanels);

/* ---------------- render loop ---------------- */
const preview = {};
let last = performance.now(), thumbAt = 0, ambAt = 0, animAt = 0, thumbsDirty = true;
function updateClock() {
  const c = $('#clock'), Lp = state.loop;
  if (Lp.on) {
    c.innerHTML = `<b>${phase.toFixed(1)}</b><span>/ ${Lp.dur.toFixed(1)} s</span>`;
    const u = Lp.dur ? phase / Lp.dur : 0;
    if (!scrubbing) $('#scrub').value = u;
    $('#scrubFill').style.width = (u * 100) + '%';
  } else c.innerHTML = `<b>${time.toFixed(1)}</b><span>s</span>`;
}
let scrubbing = false;
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.max(0, Math.min(0.1, (now - last) / 1000)); last = now;
  if (exporting) return;
  presetTick(now);
  if (playing) {
    if (state.loop.on) { const L = state.loop.dur; phase += dt; if (phase >= L || phase < 0) phase = ((phase % L) + L) % L; }
    else time += dt * state.speed;
    kclock += dt;
    dirty = true; updateClock();
  }
  if (!dirty) return;
  dirty = false;
  const wantThumbs = thumbsDirty || !playing || now - thumbAt > 450;
  present(compose(preview, prevW, prevH, currentSpec()));
  if (now - ambAt > 220) { ambAt = now; sampleAmbient(); }
  if (state.kfOn) kfTick();
  if (animRows.length && now - animAt > 90) { animAt = now; syncAnimRows(false); }
  if (wantThumbs) { thumbAt = now; thumbsDirty = false; drawThumbs(); }
}

/* ---------------- layer thumbnails + ambient light ---------------- */
const TH = 64, thumbPair = {}, thumbBuf = new Uint8Array(TH * TH * 4);
let thumbImg = null;
function blitThumb(cv, rt) {
  renderer.readRenderTargetPixels(rt, 0, 0, TH, TH, thumbBuf);
  const ctx = cv.getContext('2d');
  if (!thumbImg) thumbImg = ctx.createImageData(TH, TH);
  const row = TH * 4;
  for (let y = 0; y < TH; y++) thumbImg.data.set(thumbBuf.subarray((TH - 1 - y) * row, (TH - y) * row), y * row);
  ctx.putImageData(thumbImg, 0, 0);
}
function drawThumbs() {
  const spec = currentSpec();
  curLoop = spec.loop; curKU = spec.ku || 0;
  runStack(thumbPair, TH, TH, spec.a, state.layers, (L, rt) => {
    const cv = document.querySelector(`[data-id="${L.id}"] canvas.thumb`);
    if (cv) blitThumb(cv, rt);
  });
}
const ambCv = document.createElement('canvas'); ambCv.width = ambCv.height = 2;
const ambCtx = ambCv.getContext('2d', { willReadFrequently: true });
function sampleAmbient() {
  try {
    ambCtx.drawImage(canvas, 0, 0, 2, 2);
    const d = ambCtx.getImageData(0, 0, 2, 2).data, root = document.documentElement.style;
    for (let i = 0; i < 4; i++) root.setProperty('--a' + (i + 1), `rgb(${d[i * 4]}, ${d[i * 4 + 1]}, ${d[i * 4 + 2]})`);
  } catch (e) { /* sampling is decorative only */ }
}

/* ---------------- history + persistence ---------------- */
let past = [], future = [], current = '[]';
const snapshot = () => JSON.stringify(state.layers);
// What a preset's content is, ignoring layer ids and which cards are expanded.
const presetKey = layers => JSON.stringify(layers.filter(L => !LAYER_TYPES[L.type].image).map(L => [L.type, L.params, L.blend, L.opacity, L.on, isAnimated(L) ? L.keys : 0]));
function committed() {
  const s = snapshot(); if (s === current) return;
  past.push(current); if (past.length > 80) past.shift(); future = []; current = s;
  syncHistoryButtons(); save(); syncPresets();
}
function restore(s) {
  state.layers = JSON.parse(s); current = s; kfSel.clear();
  for (const id of [...textures.keys()]) if (!state.layers.some(l => l.id === id)) { /* keep for redo */ }
  renderStack(); dirty = true; save(); syncHistoryButtons(); syncPresets();
}
function undo() { if (!past.length) return; future.push(current); restore(past.pop()); }
function redo() { if (!future.length) return; past.push(current); restore(future.pop()); }
function syncHistoryButtons() { $('#undo').disabled = !past.length; $('#redo').disabled = !future.length; }
let saveT = 0;
function save() {
  clearTimeout(saveT);
  saveT = setTimeout(() => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        layers: state.layers, ratio: state.ratio, tier: state.tier, customW: state.customW, customH: state.customH,
        format: state.format, quality: state.quality, speed: state.speed, previewQ: state.previewQ, anim: state.anim, loop: state.loop, presetId: state.presetId, presetSnap, panelL: state.panelL, panelR: state.panelR, vtool: state.vtool, kfOn: state.kfOn, kfH: state.kfH, ver: 3,
      }));
    } catch (e) { /* storage unavailable: nothing to keep */ }
  }, 250);
}
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY) || localStorage.getItem(OLD_KEY); if (!raw) return false;
    const d = JSON.parse(raw);
    if (!Array.isArray(d.layers)) return false;
    state.layers = d.layers.filter(l => l && LAYER_TYPES[l.type]).map(l => {
      const base = newLayer(l.type);
      return { ...base, ...l, id: l.id || base.id, params: { ...base.params, ...(l.params || {}) } };
    });
    for (const k of ['ratio', 'tier', 'customW', 'customH', 'format', 'quality', 'speed', 'previewQ']) if (d[k] != null) state[k] = d[k];
    if (d.anim) { for (const k of Object.keys(state.anim)) if (d.anim[k] != null) state.anim[k] = d.anim[k]; }
    if (d.loop) Object.assign(state.loop, d.loop);
    if (d.panelL) state.panelL = d.panelL; if (d.panelR) state.panelR = d.panelR;
    else if (d.anim && d.anim.dur) state.loop.dur = Math.min(30, Math.max(1, d.anim.dur));
    // Settings version 3 made a 30 second seamless loop the default.
    if ((d.ver || 0) < 3) { state.loop.on = true; state.loop.dur = 30; }
    if (d.vtool === 'rotate' || d.vtool === 'move') state.vtool = d.vtool;
    if (typeof d.kfOn === 'boolean') state.kfOn = d.kfOn; if (d.kfH) state.kfH = d.kfH;
    // Panels always open expanded on load; collapsing only lasts for the visit.
    if (typeof d.presetId === 'string' && libIndex(d.presetId) >= 0 && d.presetSnap) { state.presetId = d.presetId; presetSnap = d.presetSnap; } else state.presetId = null;
    if (state.format === 'video') state.format = 'mp4';
    if (![...STILLS, ...MOTION].some(f => f[0] === state.format)) state.format = 'png';
    return true;
  } catch (e) { return false; }
}

/* ---------------- controls ---------------- */
function fmt(v, s) {
  if (s >= 1) return String(Math.round(v));
  const d = s >= 0.1 ? 1 : s >= 0.01 ? 2 : 3;
  return (+v).toFixed(d);
}
function setPct(range) {
  const p = (range.value - range.min) / (range.max - range.min) * 100;
  range.style.setProperty('--pct', p + '%');
}
// Card rows for keyable properties, so playback can show their animated values and key states.
let animRows = [];
function kfButton(L, k, label) {
  const b = el('button', { class: 'kf-dia', type: 'button', 'aria-label': `Keyframe ${label}` });
  b.addEventListener('click', e => {
    e.stopPropagation();
    const u = uNow(), ex = keyAt(L, k, u);
    if (ex) removeKey(L, k, ex); else setKey(L, k, u, liveValue(L, k, u));
    dirty = true; committed(); syncAnimRows(true); buildKf();
  });
  return b;
}
function syncKfButton(b, L, k) {
  const keyed = isKeyed(L, k), on = keyed && !!keyAt(L, k, uNow());
  b.classList.toggle('keyed', keyed); b.classList.toggle('on', on);
  b.title = !keyed ? 'Add a keyframe here to start animating this value' : on ? 'Remove the keyframe at the playhead' : 'Add a keyframe at the playhead';
}
function syncAnimRows(force) {
  const u = uNow();
  for (const r of animRows) {
    if (!r.range.isConnected) continue;
    syncKfButton(r.btn, r.L, r.k);
    r.row.classList.toggle('animated', isKeyed(r.L, r.k));
    if (!isKeyed(r.L, r.k) || (!force && document.activeElement === r.range)) continue;
    const v = liveValue(r.L, r.k, u);
    r.range.value = v; r.num.value = fmt(v, r.step); setPct(r.range);
  }
}
function sliderRow({ label, value, min, max, step, def, onInput, onChange, kf }) {
  const range = el('input', { type: 'range', min, max, step, value, 'aria-label': label });
  const num = el('input', { type: 'number', class: 'num', min, max, step, value: fmt(value, step), 'aria-label': label + ' value' });
  const lbl = el('span', { class: 'lbl', title: def != null ? 'Double-click to reset' : label }, label);
  if (kf) {
    const btn = kfButton(kf.L, kf.k, label);
    lbl.prepend(btn);
    const row = el('div', { class: 'row' + (isKeyed(kf.L, kf.k) ? ' animated' : '') }, lbl, range, num);
    animRows.push({ L: kf.L, k: kf.k, btn, range, num, step, row });
    syncKfButton(btn, kf.L, kf.k);
    if (isKeyed(kf.L, kf.k)) { const v = liveValue(kf.L, kf.k, uNow()); range.value = v; num.value = fmt(v, step); }
    setPct(range);
    range.addEventListener('input', () => { num.value = fmt(range.value, step); setPct(range); onInput(+range.value); });
    range.addEventListener('change', () => onChange && onChange());
    num.addEventListener('change', () => { let v = Math.min(max, Math.max(min, +num.value || 0)); range.value = v; num.value = fmt(v, step); setPct(range); onInput(v); onChange && onChange(); });
    if (def != null) lbl.addEventListener('dblclick', () => { range.value = def; num.value = fmt(def, step); setPct(range); onInput(+def); onChange && onChange(); });
    return row;
  }
  setPct(range);
  range.addEventListener('input', () => { num.value = fmt(range.value, step); setPct(range); onInput(+range.value); });
  range.addEventListener('change', () => onChange && onChange());
  num.addEventListener('change', () => {
    let v = Math.min(max, Math.max(min, +num.value || 0)); range.value = v; num.value = fmt(v, step); setPct(range); onInput(v); onChange && onChange();
  });
  if (def != null) lbl.addEventListener('dblclick', () => { range.value = def; num.value = fmt(def, step); setPct(range); onInput(+def); onChange && onChange(); });
  return el('div', { class: 'row' }, lbl, range, num);
}
function selectRow(label, options, value, onChange) {
  const s = el('select', { 'aria-label': label }, ...options.map((o, i) => el('option', { value: i, selected: i == value }, o)));
  s.addEventListener('change', () => onChange(+s.value));
  return el('div', { class: 'row full' }, el('span', { class: 'lbl' }, label), s);
}
function colorRow(label, value, onInput, onChange) {
  const c = el('input', { type: 'color', value, 'aria-label': label });
  c.addEventListener('input', () => onInput(c.value));
  c.addEventListener('change', () => onChange());
  return el('div', { class: 'row full' }, el('span', { class: 'lbl' }, label), c);
}
function boolRow(label, value, onChange) {
  const i = el('input', { type: 'checkbox', checked: !!value, 'aria-label': label });
  i.addEventListener('change', () => onChange(i.checked ? 1 : 0));
  return el('div', { class: 'row full' }, el('span', { class: 'lbl' }, label), el('label', { class: 'switch' }, i, el('span')));
}

/* ---------------- stack UI ---------------- */
function tool(icon, label, onclick, extra = '') {
  return el('button', { class: 'tool ' + extra, type: 'button', title: label, 'aria-label': label, html: ICON[icon], onclick });
}
function renderStack() {
  const ol = $('#stack'); ol.innerHTML = '';
  animRows = [];
  $('#layerCount').textContent = state.layers.length || '';
  syncCanvasCursor();
  if (state.kfOn) buildKf();
  thumbsDirty = true; dirty = true;
  if (!state.layers.length) {
    ol.append(el('li', { class: 'empty' }, 'The stack is empty. Add a texture to start, or pick a preset.'));
    return;
  }
  for (let i = state.layers.length - 1; i >= 0; i--) ol.append(buildCard(state.layers[i], i));
}
function buildCard(L, idx) {
  const def = LAYER_TYPES[L.type];
  const n = state.layers.length;
  const li = el('li', { class: `card ${def.kind}${L.on ? '' : ' off'}`, 'data-id': L.id });
  const kindEl = el('span', { class: 'kind' });
  const syncMeta = () => {
    const meta = [def.kind === 'gen' ? 'Texture' : 'Effect'];
    if (L.blend) meta.push(BLEND_MODES[L.blend]);
    if (L.opacity < 1) meta.push(Math.round(L.opacity * 100) + '%');
    kindEl.textContent = meta.join(', ');
  };
  syncMeta();
  const title = el('button', { class: 'card-title', type: 'button', 'aria-expanded': String(!!L.open) },
    el('canvas', { class: 'thumb', width: TH, height: TH, 'aria-hidden': 'true' }),
    el('span', { class: 'tt' }, el('span', { class: 'nm' }, def.name), kindEl),
    el('span', { class: 'caret', 'aria-hidden': 'true', html: ICON.caret }));
  title.addEventListener('click', () => { L.open = !L.open; renderStack(); save(); });
  const eye = tool(L.on ? 'eye' : 'eyeOff', L.on ? 'Hide layer' : 'Show layer', () => { L.on = !L.on; dirty = true; renderStack(); committed(); });
  eye.setAttribute('aria-pressed', String(!L.on));
  const up = tool('up', 'Move up', () => moveLayer(idx, 1)); up.disabled = idx === n - 1;
  const down = tool('down', 'Move down', () => moveLayer(idx, -1)); down.disabled = idx === 0;
  const tools = [up, down];
  if (!def.image) tools.push(tool('dice', 'Randomize settings', () => { randomizeLayer(L); dirty = true; renderStack(); committed(); }));
  tools.push(tool('copy', 'Duplicate', () => {
    const c = JSON.parse(JSON.stringify(L)); c.id = uid();
    if (textures.has(L.id)) textures.set(c.id, textures.get(L.id));
    if (models.has(L.id)) models.set(c.id, models.get(L.id));
    state.layers.splice(idx + 1, 0, c); dirty = true; renderStack(); committed();
  }));
  tools.push(tool('trash', 'Delete layer', () => { state.layers.splice(idx, 1); if (def.render3d) disposeLayer3D(L.id); dirty = true; renderStack(); committed(); }, 'danger'));
  const grip = el('button', { class: 'grip', type: 'button', title: 'Drag to reorder (or use the arrow keys)', 'aria-label': `Reorder ${def.name}. Use up and down arrow keys.`, html: ICON.grip });
  grip.addEventListener('pointerdown', e => startCardDrag(e, li));
  grip.addEventListener('keydown', e => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const dir = e.key === 'ArrowUp' ? 1 : -1, j = idx + dir;
    if (j < 0 || j >= n) return;
    moveLayer(idx, dir);
    const g = document.querySelector(`[data-id="${L.id}"] .grip`); g && g.focus();
  });
  li.append(el('div', { class: 'card-head' }, grip, eye, title, el('div', { class: 'tools' }, ...tools)));
  if (!L.open) return li;

  const body = el('div', { class: 'card-body' });
  const set = (k, v) => { L.params[k] = v; dirty = true; };
  body.append(selectRow('Blend', BLEND_MODES, L.blend, v => { L.blend = v; syncMeta(); dirty = true; committed(); }));
  body.append(sliderRow({ label: 'Opacity', value: L.opacity, min: 0, max: 1, step: 0.01, def: 1, kf: { L, k: '_opacity' }, onInput: v => { writeValue(L, '_opacity', v); syncMeta(); dirty = true; }, onChange: () => { committed(); syncAnimRows(true); buildKf(); } }));
  if (def.image) { body.append(imageRow(L)); body.append(el('p', { class: 'opts-note' }, 'Drag on the canvas to move or rotate it (pick the tool above the canvas). Scroll to zoom.')); }
  if (def.render3d) {
    const isModel = (L.params.shape | 0) === 9;
    body.append(el('div', { class: 'row stacked' }, el('span', { class: 'lbl' }, 'Source'),
      seg([[0, 'Built-in shape'], [1, 'Your model']], isModel ? 1 : 0, v => {
        if (v === 1 && !isModel) { L.params.lastShape = L.params.shape | 0; L.params.shape = 9; if (!models.has(L.id)) pickModel(L); }
        else if (v === 0 && isModel) L.params.shape = L.params.lastShape | 0;
        dirty = true; renderStack(); committed();
      })));
    if (isModel) body.append(modelPanel(L));
    body.append(el('p', { class: 'opts-note' }, 'Drag on the canvas to move or rotate it (pick the tool above the canvas; Shift rolls). Scroll to resize.'));
  }
  const params = layerParams(L.type);
  if (params.length) body.append(el('div', { class: 'sep' }));
  for (const p of params) {
    if (p.show && !p.show(L.params)) continue;
    const v = L.params[p.k];
    if (p.t === 'select') body.append(selectRow(p.l, p.o, v, x => { set(p.k, x); renderStack(); committed(); }));
    else if (p.t === 'bool') body.append(boolRow(p.l, v, x => { set(p.k, x); renderStack(); committed(); }));
    else if (p.t === 'color') body.append(colorRow(p.l, v, x => set(p.k, x), committed));
    else body.append(sliderRow({ label: p.l, value: v, min: p.min, max: p.max, step: p.s, def: p.d, kf: { L, k: p.k }, onInput: x => { if (isKeyed(L, p.k)) { writeValue(L, p.k, x); dirty = true; } else set(p.k, x); }, onChange: () => { committed(); syncAnimRows(true); buildKf(); } }));
  }
  li.append(body);
  return li;
}
function imageRow(L) {
  const input = el('input', { type: 'file', accept: 'image/*', hidden: true });
  const tx = textures.get(L.id);
  const btn = el('button', { class: 'btn', type: 'button' }, tx ? 'Replace image' : 'Choose image');
  btn.addEventListener('click', () => input.click());
  input.addEventListener('change', () => { if (input.files[0]) loadImage(input.files[0], L); });
  return el('div', { class: 'file-row' }, btn, input, el('span', { class: 'fname' }, tx ? tx.name : 'No image yet. You can also drop one on the canvas.'));
}
function loadImage(file, L) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    let src = img, w = img.naturalWidth, h = img.naturalHeight;
    const k = Math.min(1, 4096 / Math.max(w, h));
    if (k < 1) { const c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); src = c; w = c.width; h = c.height; }
    const tex = new THREE.Texture(src);
    tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = false; tex.needsUpdate = true;
    const old = textures.get(L.id);
    if (old && ![...textures.entries()].some(([id, t]) => id !== L.id && t === old)) old.tex.dispose();
    textures.set(L.id, { tex, w, h, name: file.name });
    URL.revokeObjectURL(url); dirty = true; renderStack();
  };
  img.onerror = () => { URL.revokeObjectURL(url); setStatus('That file could not be read as an image. Try a PNG, JPEG or WebP.', true); };
  img.src = url;
}
function moveLayer(idx, dir) {
  const j = idx + dir; if (j < 0 || j >= state.layers.length) return;
  const a = state.layers; [a[idx], a[j]] = [a[j], a[idx]];
  dirty = true; renderStack(); committed();
}
function addLayer(type) {
  const L = newLayer(type);
  state.layers.push(L);
  closeAddMenu(); dirty = true; renderStack(); committed();
  requestAnimationFrame(() => { const c = document.querySelector(`[data-id="${L.id}"]`); c && c.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
  return L;
}

/* ---------------- add menu ---------------- */
const PV_W = 96, PV_H = 72;
let previewsDrawn = false;
function buildAddMenu() {
  const m = $('#addMenu');
  const grid = kind => el('div', { class: 'add-grid ' + kind }, ...Object.entries(LAYER_TYPES).filter(([, d]) => kind === 'media' ? d.media : d.kind === kind && !d.media)
    .map(([k, d]) => el('button', { type: 'button', title: d.blurb, 'data-type': k, onclick: () => addLayer(k) },
      el('canvas', { class: 'pv', width: PV_W, height: PV_H, 'aria-hidden': 'true' }),
      el('span', { class: 'nm' }, el('b', {}, d.name)), el('span', { class: 'sr' }, '. ' + d.blurb))));
  m.append(
    el('div', { class: 'add-sec' }, el('h3', {}, 'Media', el('span', {}, 'Your own image, a 3D shape or your own model')), (() => {
      const g = grid('media');
      g.append(el('button', { type: 'button', title: 'Upload a GLB, glTF, OBJ or STL model, including animated glTF', 'data-action': 'model', onclick: () => {
        const L = newLayer('object3d', { params: { shape: 9, mat: 1, lastShape: 3 } }); state.layers.push(L); closeAddMenu(); renderStack(); committed(); pickModel(L);
      } }, el('span', { class: 'pv blank-model', 'aria-hidden': 'true', html: ICON.cube }), el('span', { class: 'nm' }, el('b', {}, 'Your 3D model'))));
      return g;
    })()),
    el('div', { class: 'add-sec' }, el('h3', {}, 'Textures', el('span', {}, 'Paint a new image')), grid('gen')),
    el('div', { class: 'add-sec' }, el('h3', {}, 'Effects', el('span', {}, 'Reshape the layers below')), grid('fx')));
}
/* Thumbnails render at ~72px tall, where pixel-sized effects nearly vanish and tonal ones look like
   their base, so each effect gets a base that shows it off and exaggerated settings. Effects in
   SPLIT_PV are drawn before/after: left half without the effect, right half with it. */
const PV_BASE = {
  grid: () => newLayer('grid', { params: { scale: 6, pal: 3 } }),
  warp: () => newLayer('warp', { params: { pal: 3, scale: 1.4, contrast: 1.1 } }),
  smooth: () => newLayer('meshgrad', { params: { distort: 0.9, swirl: 0.8 } }),
  pastel: () => newLayer('meshgrad', { params: { c1: '#e7c9b0', c2: '#d8a9c0', c3: '#a9c3e3', c4: '#f3e3c3', distort: 0.8 } }),
  pool: () => newLayer('grid', { params: { type: 1, scale: 6, width: 0.07, pal: 0, ca: '#2ab3d6', cb: '#1b8db0', cc: '#e9fbff' } }),
};
const PV = {
  transform: ['grid', { rot: 28, zoom: 1.7 }], wave: ['grid', { amp: 160, freq: 3 }], displace: ['grid', { amount: 240, scale: 2 }],
  mirror: ['warp', { mode: 4 }], tile: ['warp', { nx: 3, ny: 2 }], led: ['smooth', { size: 110, gap: 0.3, levels: 8 }],
  paper: ['pastel', { amount: 1, fiber: 1, crumple: 1, folds: 3, rough: 0.8 }], relief: ['warp', { depth: 6, radius: 9, shine: 0.8 }],
  pixelate: ['warp', { size: 90 }], blur: ['warp', { radius: 110 }], glow: ['warp', { radius: 220, int: 1.6 }],
  sharpen: ['warp', { amt: 4, rad: 9 }], chroma: ['warp', { amount: 70 }], glitch: ['warp', { int: 0.8, blocks: 10, split: 60 }],
  crt: ['warp', { dens: 22, int: 0.75, mask: 0.6, curve: 0.45 }], halftone: ['smooth', { size: 90 }], dither: ['smooth', { px: 14 }],
  posterize: ['smooth', { levels: 4 }], adjust: ['warp', { hue: 140, sat: 1.5 }], grain: ['smooth', { amt: 0.45, size: 5 }],
  vignette: ['pastel', { amt: 1, size: 0.45 }], invert: ['warp', {}], gradmap: ['warp', {}], iridescence: ['warp', { amount: 0.9 }],
  heatmap: ['smooth', {}], chromemap: ['warp', {}], edges: ['warp', {}], fluted: ['smooth', { count: 10, dist: 0.7 }],
  lens: ['grid', { distort: 0.9, chroma: 1 }], glass: ['smooth', { scale: 5, strength: 0.8 }], water: ['pool', { scale: 2, caustics: 1, glints: 0.8 }],
  kaleido: ['grid', {}], twirl: ['grid', {}], bulge: ['grid', {}], polar: ['grid', {}], orb: ['warp', {}],
};
const PV_GEN = {
  graingrad: { soft: 0.2, grain: 0.35 }, glyphs: { rain: 0.5, trail: 0.7, scale: 14 }, meshgrad: { distort: 1, swirl: 0.8 },
  object3d: { mat: 1, shape: 3, shadow: 0.5, color: '#f1ede6' }, stars: { size: 3, density: 18 }, beads: { scale: 8 }, terrazzo: { scale: 8 },
};
const SPLIT_PV = new Set(['adjust', 'sharpen', 'grain', 'posterize', 'paper', 'relief', 'blur', 'chroma', 'invert', 'gradmap', 'iridescence', 'crt', 'dither', 'halftone', 'heatmap', 'chromemap', 'edges', 'glow', 'pixelate', 'led', 'glitch']);
function previewStack(k, baseOnly) {
  const def = LAYER_TYPES[k];
  if (def.kind === 'gen') {
    const L = newLayer(k, { params: PV_GEN[k] || {} }); L.open = false;
    return def.render3d ? [PV_BASE.smooth(), L] : [L];
  }
  const [bk, prm] = PV[k] || ['warp', {}];
  const base = PV_BASE[bk]();
  return baseOnly ? [base] : [base, newLayer(k, { params: prm })];
}
const d0 = k => LAYER_TYPES[k].blurb + '.';
function drawPreviews() {
  if (previewsDrawn) return; previewsDrawn = true;
  const pair = {}, buf = new Uint8Array(PV_W * PV_H * 4);
  for (const btn of document.querySelectorAll('#addMenu button[data-type]')) {
    const k = btn.dataset.type, def = LAYER_TYPES[k], cv = btn.querySelector('canvas');
    if (def.image) { cv.classList.add('blank'); continue; }
    if (SPLIT_PV.has(k)) btn.title = d0(k) + ' Left half before, right half after.';
    curLoop = 0; curKU = 0;
    const ctx = cv.getContext('2d'), img = ctx.createImageData(PV_W, PV_H), row = PV_W * 4;
    renderer.readRenderTargetPixels(runStack(pair, PV_W, PV_H, 1.5, previewStack(k)), 0, 0, PV_W, PV_H, buf);
    for (let y = 0; y < PV_H; y++) img.data.set(buf.subarray((PV_H - 1 - y) * row, (PV_H - y) * row), y * row);
    if (SPLIT_PV.has(k)) {
      renderer.readRenderTargetPixels(runStack(pair, PV_W, PV_H, 1.5, previewStack(k, true)), 0, 0, PV_W, PV_H, buf);
      const half = PV_W >> 1;
      for (let y = 0; y < PV_H; y++) {
        const src = (PV_H - 1 - y) * row, dst = y * row;
        img.data.set(buf.subarray(src, src + half * 4), dst);
        const o = dst + half * 4; img.data[o] = img.data[o + 1] = img.data[o + 2] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  disposePair(pair);
  renderer.setRenderTarget(null); dirty = true;
}
function closeAddMenu() { $('#addMenu').hidden = true; $('#addBtn').setAttribute('aria-expanded', 'false'); }
$('#addBtn').innerHTML = ICON.plus + '<span>Add layer</span>';
$('#addBtn').addEventListener('click', e => {
  e.stopPropagation();
  const m = $('#addMenu'); m.hidden = !m.hidden; $('#addBtn').setAttribute('aria-expanded', String(!m.hidden));
  if (!m.hidden) { drawPreviews(); const f = m.querySelector('button'); f && f.focus({ preventScroll: true }); }
});
document.addEventListener('click', e => { if (!$('#addMenu').hidden && !$('#addMenu').contains(e.target)) closeAddMenu(); });

/* ---------------- transport ---------------- */
function syncPlay() {
  const b = $('#play'); b.innerHTML = playing ? ICON.pause : ICON.play;
  b.setAttribute('aria-label', playing ? 'Pause animation' : 'Play animation'); b.title = playing ? 'Pause (Space)' : 'Play (Space)';
}
$('#play').addEventListener('click', () => { playing = !playing; syncPlay(); });
$('#rewind').innerHTML = ICON.rewind;
$('#rewind').addEventListener('click', () => { if (state.loop.on) phase = 0; else time = 0; updateClock(); dirty = true; });
/* ---------------- popovers + export dialog ---------------- */
const pops = [];
function bindPop(btnSel, popSel, onOpen) {
  const btn = $(btnSel), pop = $(popSel);
  const set = open => { pop.hidden = !open; btn.setAttribute('aria-expanded', String(open)); if (open && onOpen) onOpen(); };
  btn.addEventListener('click', e => { e.stopPropagation(); const open = pop.hidden; pops.forEach(p => p.set(false)); set(open); });
  pop.addEventListener('click', e => e.stopPropagation());
  pops.push({ set, pop, btn });
}
document.addEventListener('click', () => pops.forEach(p => p.set(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') pops.forEach(p => { if (!p.pop.hidden) { p.set(false); p.btn.focus(); } }); });
bindPop('#helpBtn', '#helpPop');
bindPop('#ratioBtn', '#ratioPop');
bindPop('#loopBtn', '#loopPop', () => renderLoopOpts());
$('#helpBtn').innerHTML = ICON.help;
const dlg = $('#exportDlg');
$('#openExport').innerHTML = ICON.download + '<span>Export</span>';
$('#dlgClose').innerHTML = ICON.close;
function openExport() { pops.forEach(p => p.set(false)); renderExport(); if (!dlg.open) dlg.showModal(); }
$('#openExport').addEventListener('click', openExport);
$('#dlgClose').addEventListener('click', () => { if (!exporting) dlg.close(); });
dlg.addEventListener('cancel', e => { if (exporting) e.preventDefault(); });
dlg.addEventListener('click', e => { if (e.target === dlg && !exporting) dlg.close(); });
function setLoop(on) {
  if (!on && state.loop.on) time = loopSpec(phase).a;
  state.loop.on = on;
  if (on) phase = 0;
  syncTimeline(); renderLoopOpts(); renderSummary(); dirty = true; save();
}
function syncTimeline() {
  const Lp = state.loop;
  $('#loopBtn').classList.toggle('on', Lp.on);
  $('#loopBtn').innerHTML = ICON.loop + `<span>${Lp.on ? Lp.dur.toFixed(1) + ' s loop' : 'Loop off'}</span>`;
  $('#scrubWrap').classList.toggle('off', !Lp.on);
  $('#scrub').disabled = !Lp.on;
  updateClock();
}
const scrub = $('#scrub');
scrub.addEventListener('input', () => { scrubbing = true; phase = +scrub.value * state.loop.dur; dirty = true; updateClock(); });
scrub.addEventListener('change', () => { scrubbing = false; });
scrub.addEventListener('pointerup', () => { scrubbing = false; });
$('#undo').innerHTML = ICON.undo; $('#redo').innerHTML = ICON.redo;
$('#undo').addEventListener('click', undo); $('#redo').addEventListener('click', redo);
const speedIn = $('#speed');
speedIn.addEventListener('input', () => { state.speed = +speedIn.value; $('#speedOut').textContent = state.speed.toFixed(2) + '×'; setPct(speedIn); dirty = true; save(); });
$('#speedOut').addEventListener('dblclick', () => { speedIn.value = 1; speedIn.dispatchEvent(new Event('input')); });
$('#shuffle').innerHTML = ICON.shuffle + '<span>Shuffle</span>';
$('#shuffle').addEventListener('click', doShuffle);
function doShuffle() { state.layers = shuffleStack(); state.presetId = null; presetSnap = ''; dirty = true; renderStack(); committed(); syncPresets(); }

/* ---------------- texture library (built-ins plus anything the person saves) ---------------- */
const LIB_KEY = 'texture-foundry-library-v1';
const PT_W = 264, PT_H = 198, presetCache = new Map();
let presetSnap = '', hoverPreset = null, hoverAt = 0, previewQueue = [];
const libIndex = id => library.findIndex(e => e.id === id);
const presetStack = id => { if (!presetCache.has(id)) { const i = libIndex(id); presetCache.set(id, i >= 0 ? presetLayers(i) : []); } return presetCache.get(id); };
let libSeen = new Set(BUILTIN.map(b => b[0]));
const BUILTIN_RANK_OF = n => { const i = BUILTIN.findIndex(b => b[0] === n); return i >= 0 ? i + 1 : undefined; };
function saveLibrary() { try { localStorage.setItem(LIB_KEY, JSON.stringify({ v: 1, textures: library, seen: [...libSeen] })); } catch (e) { /* storage is optional */ } }
function loadLibrary() {
  try {
    const d = JSON.parse(localStorage.getItem(LIB_KEY) || 'null');
    if (d && Array.isArray(d.textures)) {
      library = d.textures.filter(validEntry);
      const bdesc = new Map(BUILTIN.map(b => [b[0], b[1]]));
      library.forEach(e => { if ((!e.desc || e.desc === 'Saved from your stack') && bdesc.get(e.name)) e.desc = bdesc.get(e.name); });
      // Older libraries have no creation dates: keep their current order as the age order.
      const base = Date.now() - library.length * 1000;
      library.forEach((e, i) => { if (!e.created) e.created = BUILTIN_RANK_OF(e.name) ?? base + i * 1000; });
      // Built-ins added since this library was saved join it; ones the person deleted stay deleted.
      const seen = new Set(Array.isArray(d.seen) ? d.seen : library.map(e => e.name)), have = new Set(library.map(e => e.name));
      let added = 0;
      defaultLibrary().forEach(e => { if (!seen.has(e.name) && !have.has(e.name)) { library.push({ ...e, id: libId() }); added++; } });
      libSeen = new Set([...seen, ...BUILTIN.map(b => b[0])]);
      if (added) saveLibrary();
    }
  } catch (e) { /* keep defaults */ }
}
function validEntry(e) { return e && typeof e.name === 'string' && Array.isArray(e.layers) && e.layers.every(l => Array.isArray(l) && typeof l[0] === 'string'); }
function stackToEntryLayers(layers) {
  return layers.filter(L => !LAYER_TYPES[L.type].image).map(L => isAnimated(L) ? [L.type, { ...L.params }, L.blend, L.opacity, L.on, JSON.parse(JSON.stringify(L.keys))] : [L.type, { ...L.params }, L.blend, L.opacity, L.on]);
}
function uniqueName(base) {
  const names = new Set(library.map(e => e.name));
  if (!names.has(base)) return base;
  for (let n = 2; ; n++) if (!names.has(`${base} ${n}`)) return `${base} ${n}`;
}
function loadPreset(id) {
  const i = libIndex(id); if (i < 0) return;
  state.layers = presetLayers(i); state.presetId = id; presetSnap = presetKey(state.layers);
  phase = 0; time = 0; dirty = true; renderStack(); committed(); syncPresets(); updateClock();
}
function saveCurrentAsTexture() {
  const cur = state.presetId && libIndex(state.presetId) >= 0 ? library[libIndex(state.presetId)] : null;
  const e = { id: libId(), name: uniqueName(cur ? cur.name + ' copy' : 'My texture'), desc: 'Saved from your stack', created: Date.now(), layers: stackToEntryLayers(state.layers) };
  library.unshift(e); saveLibrary();
  state.presetId = e.id; presetSnap = presetKey(state.layers); save();
  buildPresets();
  renameTile(e.id);
  toast(`Saved “${e.name}” to your textures.`);
}
function deleteTexture(id) {
  const i = libIndex(id); if (i < 0) return;
  const [e] = library.splice(i, 1); presetCache.delete(id); saveLibrary();
  if (state.presetId === id) { state.presetId = null; presetSnap = ''; }
  buildPresets(); save();
  toast(`Deleted “${e.name}”.`, 'Undo', () => { library.splice(Math.min(i, library.length), 0, e); saveLibrary(); buildPresets(); });
}
/* ---------- collapsing the side panels ----------
   On desktop a collapsed panel becomes a slim rail at the edge; on phones it folds to its header. */
function syncPresetsMin() {
  $('.presets-panel').classList.toggle('min', state.presetsMin);
  $('#presetsToggle').setAttribute('aria-expanded', String(!state.presetsMin));
  $('.layers-panel').classList.toggle('min', state.layersMin);
  $('#layersToggle').setAttribute('aria-expanded', String(!state.layersMin));
  $('#leftResizer').hidden = state.presetsMin; $('#rightResizer').hidden = state.layersMin;
}
function togglePanel(which) {
  if (which === 'presets') { state.presetsMin = !state.presetsMin; if (!state.presetsMin) previewQueue = library.map(e => e.id); }
  else { state.layersMin = !state.layersMin; if (state.layersMin) closeAddMenu(); }
  syncPresetsMin(); applyPanels(); save();
}
$('#presetsToggle').addEventListener('click', () => togglePanel('presets'));
$('#layersToggle').addEventListener('click', () => togglePanel('layers'));

/* ---------- reordering the library ----------
   Tiles are always draggable: a mouse drag starts after a few pixels of movement, a touch drag after a
   short press (so the strip can still be scrolled). The Reorder menu applies a whole-library sort. */
const SORTS = [
  ['az', 'Name, A to Z', (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base', numeric: true })],
  ['za', 'Name, Z to A', (a, b) => b.name.localeCompare(a.name, undefined, { sensitivity: 'base', numeric: true })],
  ['new', 'Newest first', (a, b) => (b.created || 0) - (a.created || 0)],
  ['old', 'Oldest first', (a, b) => (a.created || 0) - (b.created || 0)],
  ['mine', 'My textures first', (a, b) => (isBuiltinName(b) - isBuiltinName(a))],
  ['layers', 'Fewest layers first', (a, b) => a.layers.length - b.layers.length],
  ['default', 'Default order', (a, b) => defaultRank(a) - defaultRank(b)],
  ['rev', 'Reverse current order', null],
];
const BUILTIN_RANK = new Map(BUILTIN.map((b, i) => [b[0], i]));
const isBuiltinName = e => BUILTIN_RANK.has(e.name) ? 1 : 0;
const defaultRank = e => BUILTIN_RANK.has(e.name) ? BUILTIN_RANK.get(e.name) : 1e6 + (e.created || 0) / 1e13;
function sortLibrary(key) {
  const S = SORTS.find(x => x[0] === key); if (!S) return;
  const before = library.slice();
  if (S[2]) { const idx = new Map(library.map((e, i) => [e, i])); library.sort((a, b) => S[2](a, b) || idx.get(a) - idx.get(b)); }
  else library.reverse();
  saveLibrary(); buildPresets();
  toast(`Sorted: ${S[1].toLowerCase()}.`, 'Undo', () => { library = before; saveLibrary(); buildPresets(); });
}
{
  const btn = $('#libReorder'); btn.innerHTML = ICON.reorder;
  btn.setAttribute('aria-haspopup', 'menu');
  const pop = el('div', { class: 'pop pop-right sort-pop', id: 'sortPop', role: 'menu', hidden: true },
    el('p', { class: 'pop-title' }, 'Reorder presets'),
    ...SORTS.map(([k, label]) => el('button', { type: 'button', role: 'menuitem', class: 'menu-item', onclick: () => { pops.forEach(p => p.set(false)); sortLibrary(k); } }, label)),
    el('p', { class: 'pop-foot' }, 'You can also drag any preset to move it.'));
  btn.parentNode.classList.add('pop-anchor'); btn.after(pop);
  bindPop('#libReorder', '#sortPop');
}
function moveTexture(id, by, refocus) {
  const i = libIndex(id); if (i < 0) return;
  const j = Math.max(0, Math.min(library.length - 1, i + by)); if (j === i) return;
  const [e] = library.splice(i, 1); library.splice(j, 0, e);
  saveLibrary(); buildPresets();
  const t = document.querySelector(`.tile[data-tid="${id}"] .preset`);
  t && refocus && t.focus({ preventScroll: false });
}
let tileDragging = false;
document.addEventListener('touchmove', e => { if (tileDragging) e.preventDefault(); }, { passive: false });
function armTileDrag(e, tile, btn) {
  if (e.button !== undefined && e.button !== 0) return;
  const touch = e.pointerType === 'touch', sx = e.clientX, sy = e.clientY, id = e.pointerId;
  let timer = 0, started = false;
  const cancel = () => { clearTimeout(timer); btn.removeEventListener('pointermove', pre); btn.removeEventListener('pointerup', cancel); btn.removeEventListener('pointercancel', cancel); };
  const begin = ev => { cancel(); started = true; startTileDrag(ev || e, tile, btn, sx, sy, id); };
  const pre = ev => {
    const d = Math.hypot(ev.clientX - sx, ev.clientY - sy);
    if (touch) { if (d > 10) cancel(); }
    else if (d > 5) begin(ev);
  };
  btn.addEventListener('pointermove', pre); btn.addEventListener('pointerup', cancel); btn.addEventListener('pointercancel', cancel);
  if (touch) timer = setTimeout(() => { begin(null); if (navigator.vibrate) navigator.vibrate(8); }, 380);
}
function startTileDrag(ev0, tile, btn, sx, sy, pid) {
  try { btn.setPointerCapture(pid); } catch (err) { /* pointer already gone */ }
  tileDragging = true; btn.dataset.dragged = '1';
  const grid = $('#presetGrid'), tiles = [...grid.querySelectorAll('.tile[data-tid]')], from = tiles.indexOf(tile);
  const scroller = grid.scrollWidth > grid.clientWidth + 2 ? grid : $('.presets-panel');
  const s0 = { x: scroller.scrollLeft, y: scroller.scrollTop };
  let to = from, target = null, lx = ev0.clientX ?? sx, ly = ev0.clientY ?? sy, raf = 0;
  tile.classList.add('lifting'); grid.classList.add('dragging-tiles');
  const place = () => {
    const ddx = lx - sx + (scroller.scrollLeft - s0.x), ddy = ly - sy + (scroller.scrollTop - s0.y);
    tile.style.transform = `translate(${ddx}px, ${ddy}px)`;
    let best = -1, bd = Infinity;
    tiles.forEach((t, i) => {
      if (i === from) return;
      const r = t.getBoundingClientRect(), d = (r.left + r.width / 2 - lx) ** 2 + (r.top + r.height / 2 - ly) ** 2;
      if (d < bd) { bd = d; best = i; }
    });
    const near = best >= 0 && bd < (tile.getBoundingClientRect().width * 0.9) ** 2;
    if (target) target.classList.remove('drop-before', 'drop-after');
    target = near ? tiles[best] : null; to = near ? best : from;
    if (target) target.classList.add(to > from ? 'drop-after' : 'drop-before');
  };
  const edgeScroll = () => {
    raf = 0;
    const b = scroller.getBoundingClientRect(), E = 48; let vx = 0, vy = 0;
    if (scroller === grid) { if (lx < b.left + E) vx = -8; else if (lx > b.right - E) vx = 8; }
    else { if (ly < b.top + E) vy = -8; else if (ly > b.bottom - E) vy = 8; }
    if (vx || vy) { scroller.scrollLeft += vx; scroller.scrollTop += vy; place(); raf = requestAnimationFrame(edgeScroll); }
  };
  const move = ev => { lx = ev.clientX; ly = ev.clientY; place(); if (!raf) raf = requestAnimationFrame(edgeScroll); };
  const up = () => {
    btn.removeEventListener('pointermove', move); btn.removeEventListener('pointerup', up); btn.removeEventListener('pointercancel', up);
    if (raf) cancelAnimationFrame(raf);
    tileDragging = false;
    tile.classList.remove('lifting'); tile.style.transform = ''; grid.classList.remove('dragging-tiles');
    if (target) target.classList.remove('drop-before', 'drop-after');
    setTimeout(() => { delete btn.dataset.dragged; }, 0);
    if (to !== from) {
      const tid = tile.dataset.tid;
      const [x] = library.splice(from, 1); library.splice(to, 0, x);
      saveLibrary(); buildPresets();
      const t = document.querySelector(`.tile[data-tid="${tid}"] .preset`); t && t.focus({ preventScroll: true });
    }
  };
  btn.addEventListener('pointermove', move); btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up);
  place();
}
function renameTile(id) {
  const tile = document.querySelector(`.tile[data-tid="${id}"]`); if (!tile) return;
  const nm = tile.querySelector('.nm'), e = library[libIndex(id)];
  const inp = el('input', { class: 'nm-edit', type: 'text', value: e.name, maxlength: 60, 'aria-label': 'Texture name' });
  nm.replaceWith(inp); inp.focus(); inp.select();
  let done = false;
  const finish = ok => {
    if (done) return; done = true;
    const v = inp.value.trim();
    if (ok && v && v !== e.name) { e.name = v; saveLibrary(); }
    buildPresets(); syncPresets();
  };
  inp.addEventListener('keydown', ev => { if (ev.key === 'Enter') finish(true); if (ev.key === 'Escape') { ev.stopPropagation(); finish(false); } });
  inp.addEventListener('blur', () => finish(true));
  inp.addEventListener('click', ev => ev.stopPropagation());
}
function buildPresets() {
  const g = $('#presetGrid'); g.innerHTML = '';
  syncPresetsMin();
  $('#libCount').textContent = library.length || '';
  const actionTile = (cls, icon, name, desc, fn) => el('div', { class: 'tile' }, el('button', { class: 'preset ' + cls, type: 'button', onclick: fn },
    el('span', { class: 'pv-action', html: icon }),
    el('span', { class: 'meta' }, el('span', { class: 'nm' }, name), el('span', { class: 'ds' }, desc))));
  g.append(actionTile('save-tile', ICON.plus, 'Save current', 'Add this stack as a texture', saveCurrentAsTexture));
  g.append(actionTile('shuffle-tile', ICON.shuffle, 'Shuffle', 'A random stack every time', doShuffle));
  library.forEach((e, idx) => {
    const id = e.id;
    const b = el('button', { class: 'preset', type: 'button', 'aria-pressed': 'false', 'aria-roledescription': 'draggable preset', title: 'Click to load, drag to reorder (Alt plus arrow keys from the keyboard)', onclick: ev => { if (b.dataset.dragged) { delete b.dataset.dragged; ev.preventDefault(); return; } loadPreset(id); } },
      el('span', { class: 'pv-wrap' }, el('canvas', { class: 'pv', width: PT_W, height: PT_H, 'aria-hidden': 'true' }), el('span', { class: 'edited' }, 'Edited')),
      el('span', { class: 'meta' }, el('span', { class: 'nm' }, e.name), el('span', { class: 'ds' }, e.desc || '')));
    const acts = el('div', { class: 'tile-acts' },
        el('button', { class: 'tile-btn', type: 'button', title: 'Rename', 'aria-label': `Rename ${e.name}`, html: ICON.pencil, onclick: ev => { ev.stopPropagation(); renameTile(id); } }),
        el('button', { class: 'tile-btn danger', type: 'button', title: 'Delete', 'aria-label': `Delete ${e.name}`, html: ICON.trash, onclick: ev => { ev.stopPropagation(); deleteTexture(id); } }));
    const tile = el('div', { class: 'tile', 'data-tid': id }, b, acts);
    b.addEventListener('pointerdown', ev => armTileDrag(ev, tile, b));
    b.addEventListener('keydown', ev => {
      if (!ev.altKey) return;
      const k = ev.key;
      if (k === 'ArrowLeft' || k === 'ArrowUp') { ev.preventDefault(); moveTexture(id, -1, true); }
      else if (k === 'ArrowRight' || k === 'ArrowDown') { ev.preventDefault(); moveTexture(id, 1, true); }
      else if (k === 'Home') { ev.preventDefault(); moveTexture(id, -library.length, true); }
      else if (k === 'End') { ev.preventDefault(); moveTexture(id, library.length, true); }
    });
    b.addEventListener('pointerenter', () => { hoverPreset = id; hoverAt = 0; });
    b.addEventListener('pointerleave', () => { if (hoverPreset === id) { hoverPreset = null; previewQueue.push(id); } });
    b.addEventListener('focus', () => { hoverPreset = id; hoverAt = 0; });
    b.addEventListener('blur', () => { if (hoverPreset === id) { hoverPreset = null; previewQueue.push(id); } });
    g.append(tile);
  });
  if (!library.length) g.append(el('p', { class: 'empty lib-empty' }, 'No textures left. Save the current stack, import a file, or reset to bring back the built-ins.'));
  previewQueue = library.map(e => e.id);
  syncPresets();
}
// Tiles render at twice their size and are scaled down, so fine patterns (dither, halftone,
// scanlines) average out the way they would in a real downsized export instead of aliasing.
const SS_W = PT_W * 2, SS_H = PT_H * 2, ptPair = {}, ptBuf = new Uint8Array(SS_W * SS_H * 4);
const ssCv = document.createElement('canvas'); ssCv.width = SS_W; ssCv.height = SS_H;
const ssCtx = ssCv.getContext('2d'), ssImg = ssCtx.createImageData(SS_W, SS_H);
function drawPresetTile(id, t) {
  const cv = document.querySelector(`.tile[data-tid="${id}"] canvas`); if (!cv) return;
  curLoop = 0; curKU = ((t - 2) / 8) % 1;
  const rt = runStack(ptPair, SS_W, SS_H, t, presetStack(id));
  renderer.readRenderTargetPixels(rt, 0, 0, SS_W, SS_H, ptBuf);
  const row = SS_W * 4;
  for (let y = 0; y < SS_H; y++) ssImg.data.set(ptBuf.subarray((SS_H - 1 - y) * row, (SS_H - y) * row), y * row);
  ssCtx.putImageData(ssImg, 0, 0);
  const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(ssCv, 0, 0, PT_W, PT_H);
  cv.classList.add('ready');
}
function presetTick(now) {
  if (state.presetsMin) return false;
  let drew = false;
  if (previewQueue.length) { const id = previewQueue.shift(); if (id !== hoverPreset) drawPresetTile(id, 2); drew = true; }
  if (hoverPreset && now - hoverAt > 33 && !reduceMotion) { hoverAt = now; drawPresetTile(hoverPreset, 2 + now / 1000); drew = true; }
  return drew;
}
function syncPresets() {
  const i = state.presetId ? libIndex(state.presetId) : -1;
  const edited = i >= 0 && presetKey(state.layers) !== presetSnap;
  document.querySelectorAll('.tile[data-tid]').forEach(t => {
    const on = t.dataset.tid === state.presetId;
    t.querySelector('.preset').setAttribute('aria-pressed', String(on)); t.classList.toggle('is-edited', on && edited);
  });
  $('#presetName').textContent = i >= 0 ? library[i].name : 'Custom stack';
  $('#presetsCurrent').textContent = i >= 0 ? library[i].name + (edited ? ' (edited)' : '') : 'Custom stack';
  $('#editedTag').hidden = !edited;
  $('#editActs').hidden = !edited;
}
/* Overwrite the selected preset with the current stack, or throw the edits away. */
function saveChanges() {
  const i = state.presetId ? libIndex(state.presetId) : -1;
  if (i < 0) { saveCurrentAsTexture(); return; }
  const e = library[i], before = e.layers;
  const hadImage = state.layers.some(L => LAYER_TYPES[L.type].image);
  e.layers = stackToEntryLayers(state.layers);
  presetCache.delete(e.id); saveLibrary();
  presetSnap = presetKey(state.layers); save(); syncPresets(); previewQueue.push(e.id);
  toast(`Saved changes to “${e.name}”.${hadImage ? ' Image layers are not stored in presets.' : ''}`, 'Undo', () => {
    e.layers = before; presetCache.delete(e.id); saveLibrary(); previewQueue.push(e.id);
    presetSnap = presetKey(presetLayers(i)); syncPresets();
  });
}
function revertPreset() {
  const i = state.presetId ? libIndex(state.presetId) : -1; if (i < 0) return;
  state.layers = presetLayers(i); dirty = true; renderStack(); committed();
  presetSnap = presetKey(state.layers); syncPresets();
}
$('#saveChangesBtn').addEventListener('click', saveChanges);
$('#revertBtn').addEventListener('click', revertPreset);

/* export / import every texture in one file */
$('#libExport').innerHTML = ICON.download;
$('#libImport').innerHTML = ICON.upload;
$('#libExport').addEventListener('click', async () => {
  const data = { format: 'texture-foundry-textures', version: 1, exported: new Date().toISOString(), textures: library.map(({ name, desc, layers, created }) => ({ name, desc, created, layers })) };
  const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
  const d = new Date(), p2 = n => String(n).padStart(2, '0');
  const ok = await saveFile(`texture-foundry-textures-${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}.json`, blob, '', true);
  if (ok !== false) toast(`Exported ${library.length} textures.`);
});
$('#libImport').addEventListener('click', () => $('#libFile').click());
$('#libFile').addEventListener('change', async ev => {
  const f = ev.target.files && ev.target.files[0]; ev.target.value = '';
  if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    const list = Array.isArray(d) ? d : d && d.textures;
    if (!Array.isArray(list)) throw new Error('not a texture file');
    let added = 0, skipped = 0, dupes = 0;
    const have = new Set(library.map(e => e.name + '|' + JSON.stringify(e.layers)));
    for (const t of list) {
      if (!validEntry(t)) { skipped++; continue; }
      const layers = t.layers.filter(l => LAYER_TYPES[l[0]]);
      if (!layers.length) { skipped++; continue; }
      if (have.has(String(t.name) + '|' + JSON.stringify(layers))) { dupes++; continue; }
      library.push({ id: libId(), name: uniqueName(String(t.name).slice(0, 60)), desc: String(t.desc || '').slice(0, 120), created: Date.now() + added, layers });
      added++;
    }
    saveLibrary(); buildPresets();
    const extra = [dupes ? `${dupes} already in your library` : '', skipped ? `${skipped} unreadable` : ''].filter(Boolean).join(', ');
    toast(added ? `Imported ${added} texture${added === 1 ? '' : 's'}${extra ? ` (skipped ${extra})` : ''}.` : (dupes && !skipped ? 'Every texture in that file is already in your library.' : 'Nothing in that file could be imported.'));
  } catch (e) { toast('That file is not a Texture Foundry texture export.'); }
});

/* toasts */
let toastTimer = 0;
function toast(msg, actionLabel, action) {
  const t = $('#toast'); t.innerHTML = '';
  t.append(el('span', {}, msg));
  if (actionLabel) t.append(el('button', { type: 'button', class: 'toast-btn', onclick: () => { t.hidden = true; action(); } }, actionLabel));
  t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, actionLabel ? 6000 : 3200);
}

/* reset to a fresh page */
const DEFAULT_STATE = JSON.stringify(state);
const resetDlg = $('#resetDlg');
$('#resetBtn').innerHTML = ICON.reset;
$('#resetBtn').addEventListener('click', () => { pops.forEach(p => p.set(false)); resetDlg.showModal(); });
$('#resetCancel').addEventListener('click', () => resetDlg.close());
$('#resetGo').addEventListener('click', () => {
  resetDlg.close();
  try { localStorage.removeItem(STORE_KEY); localStorage.removeItem(OLD_KEY); localStorage.removeItem(LIB_KEY); } catch (e) { /* ignore */ }
  const fresh = JSON.parse(DEFAULT_STATE);
  for (const k of Object.keys(fresh)) state[k] = fresh[k];
  library = defaultLibrary(); libSeen = new Set(BUILTIN.map(b => b[0])); presetCache.clear();
  textures.forEach(t => t.tex.dispose && t.tex.dispose()); textures.clear();
  state.layers = presetLayers(0); state.presetId = library[0].id;
  phase = 0; time = 0; playing = !reduceMotion;
  current = snapshot(); presetSnap = presetKey(state.layers); past = []; future = [];
  $('#previewQ').value = String(state.previewQ);
  speedIn.value = state.speed; speedIn.dispatchEvent(new Event('input'));
  applyPanels(); buildPresets(); renderStack(); renderExport(); syncPlay(); syncHistoryButtons(); syncTimeline(); layoutCanvas();
  toast('Everything is back to how a fresh page starts.');
});
$('#previewQ').addEventListener('change', e => { state.previewQ = +e.target.value; layoutCanvas(); save(); });

document.addEventListener('keydown', e => {
  const tag = (e.target.tagName || '').toLowerCase();
  const typing = tag === 'input' || tag === 'select' || tag === 'textarea';
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !typing) { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y' && !typing) { e.preventDefault(); redo(); return; }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') { e.preventDefault(); if (!dlg.open) saveChanges(); return; }
  if (e.key === 'Escape') { closeAddMenu(); closePropMenu(); }
  if (e.code === 'Space' && !typing && tag !== 'button') { e.preventDefault(); playing = !playing; syncPlay(); }
  if (e.key.toLowerCase() === 'l' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) setLoop(!state.loop.on);
  if (e.key.toLowerCase() === 'k' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) toggleKf(!state.kfOn);
  if ((e.key === '[' || e.key === ']') && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); togglePanel(e.key === '[' ? 'presets' : 'layers'); }
  if ((e.key === 'Delete' || e.key === 'Backspace') && !typing && state.kfOn && kfSel.size) { e.preventDefault(); deleteSelectedKeys(); }
  if (e.key.toLowerCase() === 'e' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey && !dlg.open) { e.preventDefault(); openExport(); }
  if (e.key.toLowerCase() === 's' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey && !dlg.open) { e.preventDefault(); saveCurrentAsTexture(); }
});

/* drop an image on the stage */
const stage = $('#stage');
stage.addEventListener('dragover', e => { if ([...e.dataTransfer.items].some(i => i.kind === 'file')) { e.preventDefault(); stage.classList.add('drop'); } });
stage.addEventListener('dragleave', e => { if (!stage.contains(e.relatedTarget)) stage.classList.remove('drop'); });
stage.addEventListener('drop', e => {
  e.preventDefault(); stage.classList.remove('drop');
  const files = [...e.dataTransfer.files];
  const mf = files.find(f => MODEL_EXT.test(f.name));
  if (mf) { const L = newLayer('object3d', { params: { shape: 9, mat: 1 } }); state.layers.push(L); renderStack(); committed(); loadModel(mf, L); return; }
  const f = files.find(f => f.type.startsWith('image/')); if (!f) return;
  const L = newLayer('image'); state.layers.unshift(L); renderStack(); committed(); loadImage(f, L);
});

/* Viewport handling for image and 3D layers: drag on the canvas to move or rotate the targeted layer,
   scroll to resize it. The target is the image or 3D layer whose card is open, otherwise the topmost one. */
const movable = L => L.on && (LAYER_TYPES[L.type].render3d || LAYER_TYPES[L.type].image);
function viewTarget() {
  const m = state.layers.filter(movable);
  return m.filter(L => L.open).pop() || m[m.length - 1] || null;
}
function syncCanvasCursor() {
  const L = viewTarget(), box = $('#vtool');
  canvas.classList.toggle('can-move', !!L && state.vtool === 'move');
  canvas.classList.toggle('can-rotate', !!L && state.vtool === 'rotate');
  box.hidden = !L;
  if (!L) return;
  $('#vtoolName').textContent = LAYER_TYPES[L.type].name;
  box.querySelectorAll('button[data-tool]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tool === state.vtool)));
}
$('#vtool').querySelectorAll('button[data-tool]').forEach(b => {
  b.innerHTML = ICON[b.dataset.tool === 'move' ? 'move' : 'rotate3'] + `<span>${b.dataset.tool === 'move' ? 'Move' : 'Rotate'}</span>`;
  b.addEventListener('click', () => { state.vtool = b.dataset.tool; syncCanvasCursor(); save(); });
});
const clampP = (L, k, v) => { const p = layerParams(L.type).find(x => x.k === k); return p ? Math.min(p.max, Math.max(p.min, v)) : v; };
const wrapDeg = a => { a = ((a + 180) % 360 + 360) % 360 - 180; return Math.round(a * 10) / 10; };
{
  let drag = null;
  canvas.addEventListener('pointerdown', e => {
    const L = viewTarget(); if (!L || e.button !== 0) return;
    e.preventDefault(); canvas.setPointerCapture(e.pointerId);
    drag = { L, x: e.clientX, y: e.clientY, p0: { ...L.params } };
    canvas.classList.add('dragging');
  });
  canvas.addEventListener('pointermove', e => {
    if (!drag || !canvas.hasPointerCapture(e.pointerId)) return;
    const { L, p0 } = drag, P = L.params, cw = canvas.clientWidth, ch = canvas.clientHeight;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y, is3d = LAYER_TYPES[L.type].render3d;
    if (state.vtool === 'move') {
      if (is3d) {
        P.x = clampP(L, 'x', Math.round(((+p0.x || 0) + dx / cw * 2) * 1000) / 1000);
        P.y = clampP(L, 'y', Math.round(((+p0.y || 0) - dy / ch * 2) * 1000) / 1000);
      } else {
        // image: offsets live in rotated, zoomed image space
        const a = -(+p0.rot || 0) * Math.PI / 180, z = +p0.zoom || 1, ca = cw / ch;
        const px = dx / ch, py = -dy / ch;
        const rx = Math.cos(a) * px - Math.sin(a) * py, ry = Math.sin(a) * px + Math.cos(a) * py;
        P.ox = clampP(L, 'ox', Math.round(((+p0.ox || 0) + rx / z / (ca * 0.5)) * 1000) / 1000);
        P.oy = clampP(L, 'oy', Math.round(((+p0.oy || 0) + ry / z / 0.5) * 1000) / 1000);
      }
    } else {
      const k = 360 / Math.max(200, cw);
      if (is3d) {
        if (e.shiftKey) P.rotZ = wrapDeg((+p0.rotZ || 0) - dx * k);
        else { P.rotY = wrapDeg((+p0.rotY || 0) + dx * k); P.rotX = wrapDeg((+p0.rotX || 0) + dy * k); }
      } else P.rot = wrapDeg((+p0.rot || 0) - dx * k);
    }
    dirty = true;
  });
  const end = e => {
    if (!drag) return;
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    drag = null; canvas.classList.remove('dragging'); renderStack(); committed();
  };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
  let wheelT = 0;
  canvas.addEventListener('wheel', e => {
    const L = viewTarget(); if (!L) return;
    e.preventDefault();
    const k = LAYER_TYPES[L.type].render3d ? 'size' : 'zoom';
    L.params[k] = clampP(L, k, Math.round((+L.params[k] || 1) * Math.exp(-e.deltaY * 0.0015) * 1000) / 1000);
    dirty = true;
    clearTimeout(wheelT); wheelT = setTimeout(() => { renderStack(); committed(); }, 250);
  }, { passive: false });
}

/* ---------------- keyframe timeline panel ---------------- */
const kfSel = new Set();          // selected key objects
const kfCollapsed = new Set();    // layer ids folded in the timeline
const kfPanel = $('#kfPanel');
$('#kfBtn').innerHTML = ICON.diamond + '<span>Keyframes</span>';
$('#kfClose').innerHTML = ICON.close;
$('#kfEase').append(...EASES.map((n, i) => el('option', { value: i }, n)));
function toggleKf(on) {
  state.kfOn = on;
  kfPanel.hidden = !on; $('#kfBtn').setAttribute('aria-pressed', String(on));
  document.body.classList.toggle('kf-on', on);
  if (on) buildKf(); else kfSel.clear();
  save();
}
$('#kfBtn').addEventListener('click', () => toggleKf(!state.kfOn));
$('#kfClose').addEventListener('click', () => toggleKf(false));
function kfProps(L) {
  const list = [{ k: '_opacity', l: 'Opacity', min: 0, max: 1, s: 0.01 }];
  for (const p of layerParams(L.type)) if ((!p.t || p.t === 'range') && p.min != null && !p.nokf) list.push({ k: p.k, l: p.l, min: p.min, max: p.max, s: p.s });
  return list;
}
// Shift-snapping targets: every keyframe (except ones being dragged), the playhead, and the loop start.
function snapTargets(exclude, withPlayhead) {
  const t = [0, 1];
  for (const L of state.layers) if (L.keys) for (const k of Object.keys(L.keys)) for (const x of L.keys[k]) if (!exclude || !exclude.has(x)) t.push(x.u);
  if (withPlayhead) t.push(uNow());
  return t;
}
function snapU(u, targets, widthPx, px = 8) {
  let best = u, bd = px / widthPx;
  for (const c of targets) { const d = Math.abs(c - u); if (d < bd) { bd = d; best = c; } }
  showSnap(best !== u ? best : null);
  return best;
}
function showSnap(u) { const s = $('#kfSnap'); if (!s) return; s.hidden = u == null; if (u != null) s.style.left = (Math.min(u, 0.99999) * 100) + '%'; }
function setPlayU(u) {
  u = Math.min(0.99999, Math.max(0, u));
  if (playing) { playing = false; syncPlay(); }
  if (state.loop.on) phase = u * state.loop.dur; else kclock = u * state.loop.dur;
  dirty = true; updateClock(); kfTick(); syncAnimRows(true);
}
const fmtS = x => (Math.round(x * 10) / 10).toFixed(1);
function buildKf() {
  if (!state.kfOn) return;
  const D = state.loop.dur, ruler = $('#kfRuler'), rows = $('#kfRows');
  ruler.innerHTML = ''; rows.innerHTML = '';
  const major = D <= 6 ? 1 : D <= 15 ? 2 : 5;
  for (let t = 0; t <= D + 1e-6; t += (D <= 12 ? 0.5 : 1)) {
    const mj = Math.abs(t / major - Math.round(t / major)) < 1e-6;
    const tk = el('span', { class: 'kf-tick' + (mj ? ' major' : '') }); tk.style.left = (t / D * 100) + '%';
    if (mj && t < D - 1e-6) tk.append(el('b', {}, fmtS(t).replace(/\.0$/, '') + 's'));
    ruler.append(tk);
  }
  const stack = state.layers.slice().reverse();
  if (!stack.length) rows.append(el('p', { class: 'kf-empty' }, 'Add a layer to start animating.'));
  else if (!stack.some(isAnimated)) rows.append(el('p', { class: 'kf-empty' }, 'Nothing is animated yet. Click a diamond next to a value in a layer card, or + on a layer here, to add a keyframe at the playhead. Change the value at another time to add the next one.'));
  for (const L of stack) {
    const def = LAYER_TYPES[L.type], keyed = L.keys ? Object.keys(L.keys).filter(k => L.keys[k].length) : [];
    const folded = kfCollapsed.has(L.id);
    const caret = el('button', { class: 'kf-caret', type: 'button', 'aria-expanded': String(!folded), 'aria-label': `${folded ? 'Show' : 'Hide'} ${def.name} properties`, html: ICON.caret, onclick: () => { folded ? kfCollapsed.delete(L.id) : kfCollapsed.add(L.id); buildKf(); } });
    const add = el('button', { class: 'kf-add', type: 'button', title: 'Animate a property', 'aria-label': `Animate a property of ${def.name}`, html: ICON.plus });
    add.addEventListener('click', e => { e.stopPropagation(); openPropMenu(add, L); });
    const sum = el('div', { class: 'kf-track kf-sum' });
    const us = new Set(); keyed.forEach(k => L.keys[k].forEach(x => us.add(Math.round(x.u * 1e4))));
    us.forEach(u => { const d = el('span', { class: 'kf-mini' }); d.style.left = (u / 1e4 * 100) + '%'; sum.append(d); });
    rows.append(el('div', { class: 'kf-row layer' + (L.on ? '' : ' off') }, el('div', { class: 'kf-lab' }, caret, el('span', { class: 'kf-lname' }, def.name), add), sum));
    if (folded) continue;
    for (const k of keyed) {
      const P = kfProps(L).find(x => x.k === k) || { k, l: k, s: 0.01 };
      const btn = kfButton(L, k, P.l); syncKfButton(btn, L, k);
      const val = el('span', { class: 'kf-val', 'data-l': L.id, 'data-k': k });
      const track = el('div', { class: 'kf-track keys' });
      track.addEventListener('dblclick', e => {
        if (e.target !== track) return;
        const r = track.getBoundingClientRect(), u = (e.clientX - r.left) / r.width;
        setKey(L, k, u, liveValue(L, k, u)); committed(); buildKf(); syncAnimRows(true); dirty = true;
      });
      for (const key of L.keys[k]) {
        const d = el('button', { class: 'kf-key e' + (key.e | 0) + (kfSel.has(key) ? ' sel' : ''), type: 'button', title: `${fmtS(key.u * D)} s: ${fmt(key.v, P.s || 0.01)} (${EASES[key.e | 0]})`, 'aria-label': `Keyframe at ${fmtS(key.u * D)} seconds` });
        d.style.left = (key.u * 100) + '%'; d._key = key;
        d.addEventListener('pointerdown', e => startKeyDrag(e, L, k, key, track));
        d.addEventListener('dblclick', e => { e.stopPropagation(); setPlayU(key.u); });
        track.append(d);
      }
      rows.append(el('div', { class: 'kf-row prop' }, el('div', { class: 'kf-lab' }, btn, el('span', { class: 'kf-pname' }, P.l), val), track));
    }
  }
  syncKfHead(); kfTick();
}
function keyOwner(key) {
  for (const L of state.layers) if (L.keys) for (const k of Object.keys(L.keys)) if (L.keys[k].includes(key)) return { L, k };
  return null;
}
function syncKfHead() {
  const any = kfSel.size > 0, one = kfSel.size === 1 ? [...kfSel][0] : null;
  $('#kfEaseWrap').hidden = !any; $('#kfDel').hidden = !any; $('#kfCurveBtn').hidden = !any; $('#kfOne').hidden = !one;
  if (any) $('#kfEase').value = String([...kfSel][0].e | 0);
  $('#kfDel').textContent = kfSel.size > 1 ? `Delete ${kfSel.size} keys` : 'Delete key';
  if (one) {
    const o = keyOwner(one), P = o && kfProps(o.L).find(x => x.k === o.k);
    $('#kfKT').value = fmtS(one.u * state.loop.dur);
    $('#kfKV').value = fmt(one.v, (P && P.s) || 0.01); $('#kfKV').step = (P && P.s) || 0.01;
  }
  if (!any) closeCurve();
}
$('#kfEase').addEventListener('change', () => {
  const e = +$('#kfEase').value;
  kfSel.forEach(k => { if (e === 5 && !k.b) k.b = (EASE_BEZ[k.e | 0] || EASE_BEZ[1]).slice(); k.e = e; });
  dirty = true; committed(); buildKf();
  if (e === 5) openCurve();
});
$('#kfKT').addEventListener('change', () => {
  const one = [...kfSel][0]; if (!one) return;
  one.u = Math.min(1 - frameU(), Math.max(0, (+$('#kfKT').value || 0) / state.loop.dur));
  one.u = Math.round(one.u / frameU()) * frameU();
  const o = keyOwner(one); if (o) o.L.keys[o.k].sort((a, b) => a.u - b.u);
  dirty = true; committed(); buildKf(); syncAnimRows(true);
});
$('#kfKV').addEventListener('change', () => {
  const one = [...kfSel][0]; if (!one) return;
  const o = keyOwner(one), P = o && kfProps(o.L).find(x => x.k === o.k);
  let v = +$('#kfKV').value || 0; if (P && P.min != null) v = Math.min(P.max, Math.max(P.min, v));
  one.v = v; dirty = true; committed(); buildKf(); syncAnimRows(true);
});

/* ---- curve editor: a cubic-bezier for the selected keys, dragged on a graph or typed in ---- */
const CV = { W: 240, H: 250, x0: 20, x1: 220, y1v: 75, y0v: 175 };   // value 1 sits at y=75, value 0 at y=175: room for -0.75 to 1.75
const cvX = x => CV.x0 + x * (CV.x1 - CV.x0), cvY = y => CV.y0v - y * (CV.y0v - CV.y1v);
const cvInvX = px => (px - CV.x0) / (CV.x1 - CV.x0), cvInvY = py => (CV.y0v - py) / (CV.y0v - CV.y1v);
let curveB = null;
function selectedCurve() { const k = [...kfSel][0]; return k ? (k.e === 5 && k.b ? k.b.slice() : (EASE_BEZ[k.e | 0] || EASE_BEZ[1]).slice()) : null; }
function applyCurve(b, commit) {
  curveB = b.map(v => Math.round(v * 1000) / 1000);
  kfSel.forEach(k => { k.e = 5; k.b = curveB.slice(); });
  dirty = true; drawCurve();
  if (commit) { committed(); buildKf(); }
}
function drawCurve() {
  const svg = $('#cvSvg'), b = curveB; if (!svg || !b) return;
  let d = '';
  for (let i = 0; i <= 48; i++) { const x = i / 48; d += (i ? 'L' : 'M') + cvX(x).toFixed(1) + ' ' + cvY(bezierY(b, x)).toFixed(1); }
  $('#cvPath').setAttribute('d', d);
  $('#cvL1').setAttribute('x2', cvX(b[0])); $('#cvL1').setAttribute('y2', cvY(b[1]));
  $('#cvL2').setAttribute('x2', cvX(b[2])); $('#cvL2').setAttribute('y2', cvY(b[3]));
  $('#cvH1').setAttribute('cx', cvX(b[0])); $('#cvH1').setAttribute('cy', cvY(b[1]));
  $('#cvH2').setAttribute('cx', cvX(b[2])); $('#cvH2').setAttribute('cy', cvY(b[3]));
  ['cvX1', 'cvY1', 'cvX2', 'cvY2'].forEach((id, i) => { const n = $('#' + id); if (document.activeElement !== n) n.value = b[i]; });
  $('#cvCss').textContent = `cubic-bezier(${b.join(', ')})`;
}
function openCurve() {
  if (!kfSel.size) return;
  curveB = selectedCurve();
  const pop = $('#kfCurve'); pop.hidden = false;
  const r = $('#kfCurveBtn').getBoundingClientRect();
  pop.style.left = Math.max(8, Math.min(window.innerWidth - pop.offsetWidth - 8, r.right - pop.offsetWidth)) + 'px';
  pop.style.top = Math.max(8, r.top - pop.offsetHeight - 8) + 'px';
  drawCurve();
}
function closeCurve() { const p = $('#kfCurve'); if (p) p.hidden = true; }
$('#kfCurveBtn').addEventListener('click', e => { e.stopPropagation(); $('#kfCurve').hidden ? openCurve() : closeCurve(); });
$('#cvClose').innerHTML = ICON.close;
$('#cvClose').addEventListener('click', closeCurve);
$('#cvPresets').append(...CURVE_PRESETS.map(([n, b]) => el('button', { type: 'button', class: 'cv-preset', onclick: () => applyCurve(b.slice(), true) }, n)));
['cvX1', 'cvY1', 'cvX2', 'cvY2'].forEach((id, i) => $('#' + id).addEventListener('change', () => {
  const b = curveB.slice(); let v = +$('#' + id).value || 0;
  b[i] = i % 2 === 0 ? Math.min(1, Math.max(0, v)) : Math.min(1.75, Math.max(-0.75, v));
  applyCurve(b, true);
}));
['cvH1', 'cvH2'].forEach((id, h) => {
  const c = $('#' + id);
  c.addEventListener('pointerdown', e => {
    e.preventDefault(); c.setPointerCapture(e.pointerId);
    const svg = $('#cvSvg');
    const mv = ev => {
      const r = svg.getBoundingClientRect(), sx = CV.W / r.width, sy = CV.H / r.height;
      const x = Math.min(1, Math.max(0, cvInvX((ev.clientX - r.left) * sx))), y = Math.min(1.75, Math.max(-0.75, cvInvY((ev.clientY - r.top) * sy)));
      const b = curveB.slice(); b[h * 2] = x; b[h * 2 + 1] = y; applyCurve(b, false);
    };
    const up = () => { c.removeEventListener('pointermove', mv); c.removeEventListener('pointerup', up); committed(); buildKf(); };
    c.addEventListener('pointermove', mv); c.addEventListener('pointerup', up);
  });
});
document.addEventListener('pointerdown', e => { const p = $('#kfCurve'); if (p && !p.hidden && !p.contains(e.target) && e.target !== $('#kfCurveBtn') && !e.target.closest('#kfRows')) closeCurve(); });
function deleteSelectedKeys() {
  if (!kfSel.size) return;
  for (const L of state.layers) if (L.keys) for (const k of Object.keys(L.keys)) for (const key of L.keys[k].slice()) if (kfSel.has(key)) removeKey(L, k, key);
  kfSel.clear(); dirty = true; committed(); buildKf(); syncAnimRows(true);
}
$('#kfDel').addEventListener('click', deleteSelectedKeys);
function kfTick() {
  if (!state.kfOn) return;
  const u = uNow();
  $('#kfPlayhead').style.left = (u * 100) + '%';
  $('#kfTime').textContent = `${fmtS(u * state.loop.dur)} / ${fmtS(state.loop.dur)} s`;
  document.querySelectorAll('#kfRows .kf-val').forEach(v => {
    const L = state.layers.find(x => x.id === v.dataset.l); if (!L) return;
    const P = kfProps(L).find(x => x.k === v.dataset.k);
    v.textContent = fmt(liveValue(L, v.dataset.k, u), (P && P.s) || 0.01);
  });
}
// scrub on the ruler
{
  const ruler = $('#kfRuler');
  let on = false;
  const at = e => { const r = ruler.getBoundingClientRect(); let u = (e.clientX - r.left) / r.width; u = e.shiftKey ? snapU(u, snapTargets(null, false), r.width) : (showSnap(null), u); setPlayU(u % 1); };
  ruler.addEventListener('pointerdown', e => { on = true; ruler.setPointerCapture(e.pointerId); at(e); });
  ruler.addEventListener('pointermove', e => { if (on) at(e); });
  ruler.addEventListener('pointerup', () => { on = false; showSnap(null); });
  ruler.addEventListener('pointercancel', () => { on = false; });
}
function startKeyDrag(e, L, k, key, track) {
  e.stopPropagation(); e.preventDefault();
  const mod = e.shiftKey || e.metaKey || e.ctrlKey;
  let toggleOnUp = false, narrowOnUp = false;
  if (mod) { if (kfSel.has(key)) toggleOnUp = true; else kfSel.add(key); }
  else if (!kfSel.has(key)) { kfSel.clear(); kfSel.add(key); }
  else narrowOnUp = kfSel.size > 1;   // clicking one of several selected keys selects just it, unless you drag the group
  const d = e.currentTarget; d.setPointerCapture(e.pointerId);
  const r = track.getBoundingClientRect(), x0 = e.clientX, orig = new Map([...kfSel].map(x => [x, x.u]));
  const fu = frameU(), targets = snapTargets(kfSel, true);
  let moved = false;
  document.querySelectorAll('#kfRows .kf-key').forEach(n => n.classList.toggle('sel', kfSel.has(n._key)));
  syncKfHead();
  const move = ev => {
    if (Math.abs(ev.clientX - x0) > 2) moved = true;
    if (!moved) return;
    let du = (ev.clientX - x0) / r.width;
    // Shift snaps the grabbed key to other keys, the playhead or the loop start; the rest of the selection follows.
    if (ev.shiftKey) du = snapU(orig.get(key) + du, targets, r.width) - orig.get(key); else showSnap(null);
    for (const [x, u0] of orig) x.u = Math.round(Math.min(1 - fu, Math.max(0, u0 + du)) / fu) * fu;
    document.querySelectorAll('#kfRows .kf-key').forEach(n => { if (kfSel.has(n._key)) n.style.left = (n._key.u * 100) + '%'; });
    dirty = true;
  };
  const up = () => {
    d.removeEventListener('pointermove', move); d.removeEventListener('pointerup', up); d.removeEventListener('pointercancel', up);
    showSnap(null);
    if (!moved && toggleOnUp) kfSel.delete(key);
    if (!moved && narrowOnUp) { kfSel.clear(); kfSel.add(key); }
    for (const Lx of state.layers) if (Lx.keys) for (const kk of Object.keys(Lx.keys)) Lx.keys[kk].sort((a, b) => a.u - b.u);
    if (moved) committed();
    buildKf(); syncAnimRows(true);
    if (!$('#kfCurve').hidden) { curveB = selectedCurve(); drawCurve(); }
  };
  d.addEventListener('pointermove', move); d.addEventListener('pointerup', up); d.addEventListener('pointercancel', up);
}
// Click empty timeline space to deselect; drag there to draw a selection box (Shift adds to the selection).
{
  const main = $('.kf-main'), rows = $('#kfRows');
  rows.addEventListener('pointerdown', e => {
    if (e.button !== 0 || e.target.closest('button, input, select, .kf-lab')) return;
    e.preventDefault();                         // no browser text selection while drawing the box
    const ws = window.getSelection && window.getSelection(); if (ws) ws.removeAllRanges();
    const mr = main.getBoundingClientRect(), sx = e.clientX, sy = e.clientY, add = e.shiftKey || e.metaKey || e.ctrlKey;
    const base = add ? new Set(kfSel) : new Set();
    const box = el('div', { class: 'kf-marquee' }); main.append(box);
    let moved = false;
    rows.setPointerCapture(e.pointerId);
    const mv = ev => {
      if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 3) moved = true;
      if (!moved) return;
      const x1 = Math.min(sx, ev.clientX), x2 = Math.max(sx, ev.clientX), y1 = Math.min(sy, ev.clientY), y2 = Math.max(sy, ev.clientY);
      Object.assign(box.style, { left: (x1 - mr.left) + 'px', top: (y1 - mr.top) + 'px', width: (x2 - x1) + 'px', height: (y2 - y1) + 'px', display: 'block' });
      kfSel.clear(); base.forEach(k => kfSel.add(k));
      rows.querySelectorAll('.kf-key').forEach(n => {
        const r = n.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const inside = cx >= x1 && cx <= x2 && cy >= y1 && cy <= y2;
        if (inside) kfSel.add(n._key);
        n.classList.toggle('sel', kfSel.has(n._key));
      });
      syncKfHead();
    };
    const up = () => {
      rows.removeEventListener('pointermove', mv); rows.removeEventListener('pointerup', up); rows.removeEventListener('pointercancel', up);
      box.remove();
      if (!moved && !add && kfSel.size) { kfSel.clear(); buildKf(); }
      else syncKfHead();
    };
    rows.addEventListener('pointermove', mv); rows.addEventListener('pointerup', up); rows.addEventListener('pointercancel', up);
  });
}
function openPropMenu(anchor, L) {
  closePropMenu();
  const items = kfProps(L).filter(p => !isKeyed(L, p.k));
  const m = el('div', { class: 'kf-menu', role: 'menu' }, el('p', { class: 'pop-title' }, 'Animate'),
    ...(items.length ? items.map(p => el('button', { type: 'button', role: 'menuitem', onclick: () => {
      setKey(L, p.k, uNow(), liveValue(L, p.k, uNow())); kfCollapsed.delete(L.id); closePropMenu(); committed(); buildKf(); renderStack();
    } }, p.l)) : [el('p', { class: 'kf-empty' }, 'Every property is already animated.')]));
  document.body.append(m);
  const r = anchor.getBoundingClientRect();
  m.style.left = Math.min(window.innerWidth - 220, r.left) + 'px';
  m.style.top = Math.max(8, Math.min(window.innerHeight - m.offsetHeight - 8, r.bottom + 4)) + 'px';
  setTimeout(() => document.addEventListener('pointerdown', propMenuAway), 0);
}
function propMenuAway(e) { const m = document.querySelector('.kf-menu'); if (m && !m.contains(e.target)) closePropMenu(); }
function closePropMenu() { const m = document.querySelector('.kf-menu'); if (m) m.remove(); document.removeEventListener('pointerdown', propMenuAway); }
// resizable height
{
  const h = $('#kfResize');
  const apply = () => { $('.center').style.setProperty('--kfh', Math.round(Math.min(window.innerHeight * 0.65, Math.max(140, state.kfH))) + 'px'); };
  let y0 = 0, h0 = 0;
  h.addEventListener('pointerdown', e => { e.preventDefault(); h.setPointerCapture(e.pointerId); y0 = e.clientY; h0 = kfPanel.getBoundingClientRect().height; document.body.classList.add('resizing-v'); });
  h.addEventListener('pointermove', e => { if (h.hasPointerCapture(e.pointerId)) { state.kfH = h0 - (e.clientY - y0); apply(); } });
  h.addEventListener('pointerup', () => { document.body.classList.remove('resizing-v'); save(); });
  h.addEventListener('keydown', e => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); state.kfH += e.key === 'ArrowUp' ? 20 : -20; apply(); save(); } });
  apply();
}

/* ---------------- drag to reorder layers ----------------
   The list shows the top layer first, so a card's visual index v maps to layer index n - 1 - v. */
function startCardDrag(e, li) {
  if (e.button !== undefined && e.button !== 0) return;
  e.preventDefault();
  const grip = e.currentTarget; grip.setPointerCapture(e.pointerId);
  const list = $('#stack'), cards = [...list.children].filter(c => c.classList.contains('card'));
  const from = cards.indexOf(li); if (from < 0) return;
  const panel = li.closest('.panel'), scroller = panel && panel.scrollHeight > panel.clientHeight ? panel : null;
  const startScroll = scroller ? scroller.scrollTop : 0;
  const r0 = li.getBoundingClientRect(), gap = 6, step = r0.height + gap;
  const mids = cards.map(c => { const r = c.getBoundingClientRect(); return r.top + r.height / 2; });
  const startY = e.clientY;
  let to = from, lastY = e.clientY, raf = 0;
  li.classList.add('dragging'); list.classList.add('reordering');
  const layout = () => {
    const sd = scroller ? scroller.scrollTop - startScroll : 0, dy = lastY - startY + sd;
    li.style.transform = `translateY(${dy}px)`;
    const cy = lastY + sd;
    to = 0;
    for (let i = 0; i < cards.length; i++) if (i !== from && mids[i] < cy) to++;
    cards.forEach((c, i) => {
      if (i === from) return;
      let sh = 0;
      if (from < to && i > from && i <= to) sh = -step;
      if (from > to && i >= to && i < from) sh = step;
      c.style.transform = sh ? `translateY(${sh}px)` : '';
    });
  };
  const autoScroll = () => {
    raf = 0; if (!scroller) return;
    const b = scroller.getBoundingClientRect(), edge = 48;
    let v = 0;
    if (lastY < b.top + edge) v = -Math.ceil((b.top + edge - lastY) / 4);
    else if (lastY > b.bottom - edge) v = Math.ceil((lastY - (b.bottom - edge)) / 4);
    if (v) { scroller.scrollTop += v; layout(); raf = requestAnimationFrame(autoScroll); }
  };
  const move = ev => { lastY = ev.clientY; layout(); if (!raf) raf = requestAnimationFrame(autoScroll); };
  const up = ev => {
    grip.removeEventListener('pointermove', move); grip.removeEventListener('pointerup', up); grip.removeEventListener('pointercancel', up);
    if (raf) cancelAnimationFrame(raf);
    cards.forEach(c => { c.style.transform = ''; });
    li.classList.remove('dragging'); list.classList.remove('reordering');
    if (to !== from) {
      const n = state.layers.length, fi = n - 1 - from, ti = n - 1 - to;
      const [L] = state.layers.splice(fi, 1); state.layers.splice(ti, 0, L);
      dirty = true; renderStack(); committed();
      const g = document.querySelector(`[data-id="${L.id}"] .grip`); g && g.focus({ preventScroll: true });
    }
  };
  grip.addEventListener('pointermove', move); grip.addEventListener('pointerup', up); grip.addEventListener('pointercancel', up);
}

/* ---------------- export panel ---------------- */
function chip(label, pressed, onclick, cls = 'chip') { return el('button', { class: cls, type: 'button', 'aria-pressed': String(pressed), onclick }, label); }
function seg(items, value, onPick) {
  return el('div', { class: 'seg' }, ...items.map(([v, l]) => chip(l, value === v, () => onPick(v))));
}
function ratioGlyph(r) {
  if (!r[1]) return el('span', { class: 'glyph custom', 'aria-hidden': 'true' });
  const a = r[1] / r[2], W = a >= 1 ? 16 : 16 * a, H = a >= 1 ? 16 / a : 16;
  const g = el('span', { class: 'glyph', 'aria-hidden': 'true' }); g.style.width = W.toFixed(1) + 'px'; g.style.height = H.toFixed(1) + 'px';
  return g;
}
const MAX_VIDEO = 3840;
function motionSize(f) {
  const e = exportSize();
  const cap = f === 'gif' ? state.anim.gifSize : Math.min(MAX_VIDEO, MAX_TEX);
  const k = Math.min(f === 'gif' ? Infinity : 1, cap / Math.max(e.w, e.h));
  return { w: even(e.w * k), h: even(e.h * k) };
}
function frameCount(fps) { return Math.max(2, Math.round(state.loop.dur * fps)); }
function renderExport() {
  const rc = $('#ratioChips'); rc.innerHTML = '';
  RATIOS.forEach(r => {
    const b = chip('', state.ratio === r[0], () => { state.ratio = r[0]; renderExport(); layoutCanvas(); save(); }, 'ratio');
    b.append(el('span', { class: 'glyph-box' }, ratioGlyph(r)), el('span', {}, r[0]));
    rc.append(b);
  });
  $('#customWrap').hidden = state.ratio !== 'Custom';
  $('#sizeField').hidden = state.ratio === 'Custom';
  $('#customNote').hidden = state.ratio !== 'Custom';
  $('#customNote').textContent = `Custom size, ${state.customW} × ${state.customH} px. Change it from the aspect ratio menu above the canvas.`;
  const ss = $('#sizeSel'); ss.innerHTML = '';
  const r = RATIOS.find(x => x[0] === state.ratio);
  TIERS.forEach(([s, name]) => {
    let w = s, h = s;
    if (r && r[1]) { const a = r[1] / r[2]; w = even(a >= 1 ? s * a : s); h = even(a >= 1 ? s : s / a); }
    ss.append(el('option', { value: s, selected: s === state.tier, disabled: Math.max(w, h) > MAX_TEX }, `${name}, ${w} × ${h}`));
  });
  $('#cw').value = state.customW; $('#ch').value = state.customH;
  const pickF = k => { state.format = k; setStatus(''); renderExport(); save(); };
  const fg = $('#formatGrid'); fg.innerHTML = '';
  const sub = { png: 'Lossless image', jpeg: 'Small image', webp: 'Modern image', gif: 'Animated, loops', mp4: 'H.264 video', webm: 'VP9 video' };
  [...STILLS, ...MOTION].forEach(([k, l]) => {
    const b = chip('', state.format === k, () => pickF(k), 'fmt');
    b.append(el('span', { class: 'fmt-name' }, l), el('span', { class: 'fmt-sub' }, sub[k]));
    fg.append(b);
  });
  renderFormatOpts(); renderLoopOpts(); renderSummary();
  const label = { png: 'Export PNG', jpeg: 'Export JPEG', webp: 'Export WebP', gif: 'Export GIF', mp4: 'Export MP4', webm: 'Export WebM' }[state.format];
  $('#ctaLabel').textContent = label;
  const Lp = state.loop;
  $('#loopNote').hidden = !IS_MOTION(state.format);
  $('#loopNote').textContent = Lp.on
    ? `Exports one seamless ${Lp.dur.toFixed(1)} s loop with no fades. Adjust it from Loop in the timeline.`
    : `Loop is off, so this records ${Lp.dur.toFixed(1)} s from the current time and the end won't meet the start.`;
}
function renderLoopOpts() {
  const box = $('#loopOpts'), Lp = state.loop; box.innerHTML = '';
  box.append(boolRow('Seamless loop', Lp.on, v => setLoop(!!v)));
  box.append(sliderRow({ label: 'Length (s)', value: Lp.dur, min: 1, max: 30, step: 0.1, def: 30, onInput: v => {
    const u = Lp.dur ? phase / Lp.dur : 0; Lp.dur = v; phase = u * v; dirty = true; syncTimeline(); renderSummary(); buildKf();
  }, onChange: save }));
  box.append(el('p', { class: 'opts-note' }, Lp.on
    ? 'Every layer moves in whole cycles, so the last frame flows straight into the first with no fade. Speeds snap slightly to fit the length; very slow motions may hold still.'
    : 'Loop is off: time runs freely and animated exports record the next stretch from the current time.'));
}
function renderFormatOpts() {
  const box = $('#formatOpts'); box.innerHTML = '';
  const f = state.format, A = state.anim;
  if (f === 'jpeg' || f === 'webp') {
    box.append(sliderRow({ label: 'Quality', value: state.quality, min: 0.4, max: 1, step: 0.01, def: 0.92, onInput: v => state.quality = v, onChange: save }));
  } else if (f === 'gif') {
    box.append(selectRow('Frame rate', ['10 fps', '20 fps', '25 fps', '33 fps', '50 fps'], [10, 20, 25, 33, 50].indexOf(A.fps), i => { A.fps = [10, 20, 25, 33, 50][i]; renderSummary(); save(); }));
    box.append(selectRow('Long edge', ['320 px', '480 px', '640 px', '800 px', '1080 px'], [320, 480, 640, 800, 1080].indexOf(A.gifSize), i => { A.gifSize = [320, 480, 640, 800, 1080][i]; renderSummary(); save(); }));
    box.append(boolRow('Smooth colors', A.dither, v => { A.dither = !!v; save(); }));
  } else if (f === 'mp4' || f === 'webm') {
    box.append(selectRow('Frame rate', ['24 fps', '30 fps', '60 fps'], [24, 30, 60].indexOf(A.vfps), i => { A.vfps = [24, 30, 60][i]; renderSummary(); save(); }));
    box.append(selectRow('Quality', ['Standard', 'High', 'Maximum'], A.vq, i => { A.vq = i; renderSummary(); save(); }));
    if (state.loop.on) box.append(selectRow('Repeat loop', ['Once', '2 times', '3 times', '5 times', '10 times'], [1, 2, 3, 5, 10].indexOf(A.repeat), i => { A.repeat = [1, 2, 3, 5, 10][i]; renderSummary(); save(); }));
    if (!window.VideoEncoder) box.append(el('p', { class: 'opts-note warn' }, 'This browser lacks the WebCodecs encoder, so video is recorded in real time instead and the format depends on what it supports. Chrome, Edge, Safari 16.4+ and Firefox 130+ encode frame by frame.'));
  }
  box.hidden = !box.childNodes.length;
}
function renderSummary() {
  const f = state.format, out = $('#summary');
  $('#gifNote').hidden = true;
  if (!IS_MOTION(f)) { const { w, h } = exportSize(); out.textContent = `${w} × ${h} px, the frame on screen now.`; return; }
  const fps = f === 'gif' ? state.anim.fps : state.anim.vfps, n = frameCount(fps), { w, h } = motionSize(f);
  const reps = f !== 'gif' && state.loop.on ? state.anim.repeat : 1;
  $('#gifNote').hidden = !(f === 'gif' && n > 300);
  const secs = (n / fps * reps).toFixed(1);
  out.textContent = `${w} × ${h} px, ${n} frames, ${secs} s${reps > 1 ? ` (${reps} loops)` : ''}${f === 'gif' ? ', loops forever' : ''}.`;
}
$('#sizeSel').addEventListener('change', e => { state.tier = +e.target.value; layoutCanvas(); renderSummary(); save(); });
for (const id of ['cw', 'ch']) $('#' + id).addEventListener('change', e => {
  const v = clampSize(e.target.value); e.target.value = v;
  if (id === 'cw') state.customW = v; else state.customH = v;
  layoutCanvas(); renderSummary(); save();
});

/* ---------------- saving files ---------------- */
let downloads = null;
if (window.claude && typeof window.claude.use === 'function') {
  window.claude.use('downloads').then(d => { downloads = d; }).catch(() => {});
}
function setStatus(msg, err = false) { const s = $('#status'); s.textContent = msg; s.classList.toggle('err', err); }
function setProgress(p) { $('#ctaFill').style.transform = `scaleX(${p == null ? 0 : Math.max(0, Math.min(1, p))})`; }
async function saveFile(name, blob, note = '', quiet = false) {
  const say = (m, err) => quiet ? toast(m) : setStatus(m, err);
  if (downloads) {
    try { await downloads.save({ filename: name, data: blob }); if (!quiet) setStatus('Saved ' + name + ' (' + prettyBytes(blob.size) + ').' + note); return true; }
    catch (e) {
      const code = e && e.code;
      if (code === 'declined') say('Save cancelled.');
      else if (code === 'rate_limited') say('A save prompt is already open. Finish that one, then try again.', true);
      else if (code === 'too_large') say('That file is too large to save here. Pick a smaller size and try again.', true);
      else say('The file could not be saved: ' + ((e && e.message) || 'unknown error') + '.', true);
      return false;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: name }); document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  if (!quiet) setStatus('Downloaded ' + name + ' (' + prettyBytes(blob.size) + ').' + note);
  return true;
}
const prettyBytes = n => n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
const stamp = () => { const d = new Date(), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`; };
const baseName = (w, h) => `texture-${w}x${h}-${stamp()}`;
const tick = () => new Promise(r => setTimeout(r, 0));

/* Frame list for an animated export: one exact loop when looping, otherwise a run from the current time. */
function frameSpecs(fps) {
  const n = frameCount(fps), out = [];
  if (state.loop.on) { for (let i = 0; i < n; i++) out.push(loopSpec(i * state.loop.dur / n)); }
  else { const sp = state.speed, D = Math.max(state.loop.dur, 0.001); for (let i = 0; i < n; i++) out.push({ a: time + i / fps * sp, loop: 0, ku: ((kclock + i / fps) / D) % 1 }); }
  return out;
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

function readRT(rt, w, h, buf) { renderer.readRenderTargetPixels(rt, 0, 0, w, h, buf); return buf; }

async function exportStill(fmt) {
  const { w, h } = exportSize();
  const ctx = {};
  setStatus(`Rendering ${w} × ${h}…`); setProgress(0.2); await tick();
  const rt = compose(ctx, w, h, currentSpec());
  const buf = readRT(rt, w, h, new Uint8Array(w * h * 4));
  disposeCtx(ctx);
  setProgress(0.6); await tick();
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const c2 = cv.getContext('2d'); const img = c2.createImageData(w, h); const row = w * 4;
  for (let y = 0; y < h; y++) img.data.set(buf.subarray((h - 1 - y) * row, (h - y) * row), y * row);
  c2.putImageData(img, 0, 0);
  const mime = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' }[fmt];
  const blob = await new Promise(r => cv.toBlob(r, mime, state.quality));
  setProgress(1);
  if (!blob) throw new Error('The browser could not encode the image');
  if (blob.type !== mime) { setStatus('This browser cannot encode ' + fmt.toUpperCase() + '. Choose PNG or JPEG instead.', true); return; }
  await saveFile(`${baseName(w, h)}.${fmt === 'jpeg' ? 'jpg' : fmt}`, blob);
}

async function exportGif() {
  const { w, h } = motionSize('gif');
  const delay = Math.max(2, Math.round(100 / state.anim.fps)), fps = 100 / delay;
  const specs = frameSpecs(fps);
  const ctx = {}, buf = new Uint8Array(w * h * 4);
  setStatus('Choosing a 256-color palette…');
  const hist = GifEnc.makeHist();
  const sampleN = Math.min(16, specs.length);
  for (let i = 0; i < sampleN; i++) {
    GifEnc.addToHist(hist, readRT(compose(ctx, w, h, specs[Math.floor(i * specs.length / sampleN)]), w, h, buf), 2);
    setProgress(0.1 * (i + 1) / sampleN); await tick();
  }
  const pal = GifEnc.medianCut(hist, 256), map = GifEnc.makeMapper(pal);
  const wr = GifEnc.createWriter(w, h, pal, delay);
  for (let i = 0; i < specs.length; i++) {
    wr.frame(GifEnc.indexFrame(readRT(compose(ctx, w, h, specs[i]), w, h, buf), w, h, map, state.anim.dither, true));
    setStatus(`Encoding frame ${i + 1} of ${specs.length}…`); setProgress(0.1 + 0.9 * (i + 1) / specs.length);
    await tick();
  }
  disposeCtx(ctx);
  await saveFile(`${baseName(w, h)}.gif`, new Blob([wr.finish()], { type: 'image/gif' }));
}

/* ---------- video: frame-exact encoding with WebCodecs, muxed to MP4 or WebM ---------- */
const scriptCache = {};
function loadScript(src) {
  return scriptCache[src] || (scriptCache[src] = new Promise((res, rej) => {
    const sc = document.createElement('script'); sc.src = src; sc.async = true;
    sc.onload = res; sc.onerror = () => { delete scriptCache[src]; rej(new Error('the video muxer could not be loaded; check the connection')); };
    document.head.append(sc);
  }));
}
const hex2 = n => n.toString(16).padStart(2, '0');
function avcLevel(w, h, fps) {
  const mbs = Math.ceil(w / 16) * Math.ceil(h / 16), rate = mbs * fps;
  const L = [[31, 3600, 108000], [40, 8192, 245760], [42, 8704, 522240], [50, 22080, 589824], [51, 36864, 983040], [52, 36864, 2073600]];
  const hit = L.find(([, f, r]) => mbs <= f && rate <= r) || L[L.length - 1];
  return hex2(hit[0]);
}
function vp9Level(w, h, fps) {
  const px = w * h;
  if (px <= 983040 && fps <= 30) return '31';
  if (px <= 2228224) return fps <= 30 ? '41' : '50';
  return fps <= 30 ? '51' : '52';
}
function codecCandidates(container, w, h, fps) {
  const vp9 = { codec: `vp09.00.${vp9Level(w, h, fps)}.08`, mp4: 'vp9', webm: 'V_VP9', name: 'VP9' };
  const av1 = { codec: Math.max(w, h) > 2048 ? 'av01.0.12M.08' : 'av01.0.08M.08', mp4: 'av1', webm: 'V_AV1', name: 'AV1' };
  if (container === 'webm') return [vp9, { codec: 'vp8', webm: 'V_VP8', name: 'VP8' }, av1];
  const lv = avcLevel(w, h, fps);
  return [
    { codec: 'avc1.6400' + lv, mp4: 'avc', name: 'H.264', avc: true },
    { codec: 'avc1.4d00' + lv, mp4: 'avc', name: 'H.264', avc: true },
    { codec: 'avc1.42e0' + lv, mp4: 'avc', name: 'H.264', avc: true },
    vp9, av1,
  ];
}
async function pickCodec(container, w, h, fps, bitrate) {
  for (const c of codecCandidates(container, w, h, fps)) {
    const cfg = { codec: c.codec, width: w, height: h, bitrate, framerate: fps, latencyMode: 'quality' };
    if (c.avc) cfg.avc = { format: 'avc' };
    try { const r = await VideoEncoder.isConfigSupported(cfg); if (r && r.supported) return { c, cfg: r.config || cfg }; } catch (e) { /* try the next codec */ }
  }
  return null;
}

async function exportVideo(container) {
  if (!window.VideoEncoder || !window.VideoFrame) return exportVideoRealtime(container);
  const { w, h } = motionSize(container), fps = state.anim.vfps;
  const bpp = [0.07, 0.14, 0.28][state.anim.vq] || 0.14;
  const bitrate = Math.round(Math.min(120e6, Math.max(2e6, w * h * fps * bpp)));
  setStatus('Preparing the encoder…'); setProgress(0.01);
  const [picked] = await Promise.all([pickCodec(container, w, h, fps, bitrate), loadScript(MUX_SRC[container])]);
  if (!picked) { setStatus(`This browser cannot encode ${container.toUpperCase()} at ${w} × ${h}. Try a smaller resolution or the other video format.`, true); return; }
  const specs = frameSpecs(fps), n = specs.length, frameUs = 1e6 / fps;
  const chunks = []; let encErr = null;
  const enc = new VideoEncoder({
    output: (chunk, meta) => { const d = new Uint8Array(chunk.byteLength); chunk.copyTo(d); chunks.push({ d, type: chunk.type, ts: chunk.timestamp, meta }); },
    error: e => { encErr = e; },
  });
  enc.configure(picked.cfg);
  renderer.setSize(w, h, false);
  const ctx = {}, gop = Math.max(1, Math.round(fps * 2));
  try {
    for (let i = 0; i < n; i++) {
      if (encErr) throw encErr;
      present(compose(ctx, w, h, specs[i]));
      const vf = new VideoFrame(canvas, { timestamp: Math.round(i * frameUs), duration: Math.round(frameUs) });
      enc.encode(vf, { keyFrame: i % gop === 0 });
      vf.close();
      while (enc.encodeQueueSize > 4) await sleep(4);
      setStatus(`Encoding frame ${i + 1} of ${n} with ${picked.c.name}…`); setProgress(0.95 * (i + 1) / n);
      if (i % 2 === 0) await tick();
    }
    await enc.flush();
    if (encErr) throw encErr;
  } finally {
    if (enc.state !== 'closed') enc.close();
    disposeCtx(ctx);
  }
  setStatus('Writing the file…');
  const reps = state.loop.on ? state.anim.repeat : 1;
  let muxer;
  if (container === 'mp4') {
    muxer = new Mp4Muxer.Muxer({ target: new Mp4Muxer.ArrayBufferTarget(), video: { codec: picked.c.mp4, width: w, height: h, frameRate: fps }, fastStart: 'in-memory', firstTimestampBehavior: 'offset' });
  } else {
    muxer = new WebMMuxer.Muxer({ target: new WebMMuxer.ArrayBufferTarget(), video: { codec: picked.c.webm, width: w, height: h, frameRate: fps }, firstTimestampBehavior: 'offset' });
  }
  // Repeats reuse the encoded loop: it opens on a keyframe, so each copy just shifts in time.
  for (let r = 0; r < reps; r++) for (let j = 0; j < chunks.length; j++) {
    const c = chunks[j], idx = Math.round(c.ts / frameUs) + r * n, ts = Math.round(idx * frameUs);
    const meta = r === 0 ? c.meta : undefined;
    if (container === 'mp4') muxer.addVideoChunkRaw(c.d, c.type, ts, Math.round(frameUs), meta);
    else muxer.addVideoChunkRaw(c.d, c.type, ts, meta);
  }
  muxer.finalize();
  setProgress(1);
  const blob = new Blob([muxer.target.buffer], { type: container === 'mp4' ? 'video/mp4' : 'video/webm' });
  const note = container === 'mp4' && !picked.c.avc ? ` This browser has no H.264 encoder, so the MP4 uses ${picked.c.name}.` : '';
  await saveFile(`${baseName(w, h)}.${container}`, blob, note);
}

async function exportVideoRealtime(container) {
  if (!window.MediaRecorder || !canvas.captureStream) { setStatus('Video recording is not supported in this browser. Export a GIF instead.', true); return; }
  const pref = container === 'mp4' ? ['video/mp4;codecs=avc1', 'video/mp4'] : ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  const mime = pref.concat(['video/webm', 'video/mp4']).find(t => MediaRecorder.isTypeSupported(t));
  if (!mime) { setStatus('This browser cannot record WebM or MP4. Export a GIF instead.', true); return; }
  const k = Math.min(1, 1920 / Math.max(exportSize().w, exportSize().h));
  const w = even(exportSize().w * k), h = even(exportSize().h * k), fps = state.anim.vfps;
  let specs = frameSpecs(fps);
  if (state.loop.on) { const one = specs; for (let r = 1; r < state.anim.repeat; r++) specs = specs.concat(one); }
  renderer.setSize(w, h, false);
  const stream = canvas.captureStream(fps);
  const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: Math.min(40e6, Math.round(w * h * fps * 0.16)) });
  const chunks = []; rec.ondataavailable = ev => { if (ev.data && ev.data.size) chunks.push(ev.data); };
  const stopped = new Promise(r => { rec.onstop = r; });
  const ctx = {};
  present(compose(ctx, w, h, specs[0]));
  rec.start(250);
  const t0 = performance.now();
  for (let i = 0; i < specs.length; i++) {
    present(compose(ctx, w, h, specs[i]));
    setStatus(`Recording frame ${i + 1} of ${specs.length}…`); setProgress((i + 1) / specs.length);
    const wait = t0 + (i + 1) * 1000 / fps - performance.now();
    await sleep(Math.max(0, wait));
  }
  rec.stop(); await stopped; stream.getTracks().forEach(t => t.stop());
  disposeCtx(ctx);
  const ext = mime.startsWith('video/mp4') ? 'mp4' : 'webm';
  await saveFile(`${baseName(w, h)}.${ext}`, new Blob(chunks, { type: mime.split(';')[0] }), ext !== container ? ` This browser can only record ${ext.toUpperCase()}.` : '');
}

$('#exportBtn').addEventListener('click', async () => {
  if (exporting) return;
  if (!state.layers.some(l => l.on)) { setStatus('Nothing to export yet. Add a texture layer first.', true); return; }
  const btn = $('#exportBtn'); btn.disabled = true; btn.classList.add('busy'); exporting = true;
  try {
    if (state.format === 'gif') await exportGif();
    else if (state.format === 'mp4' || state.format === 'webm') await exportVideo(state.format);
    else await exportStill(state.format);
  } catch (err) {
    console.error(err);
    setStatus('Export failed: ' + (err.message || err) + '. Try a smaller size.', true);
  } finally {
    exporting = false; btn.disabled = false; btn.classList.remove('busy'); setProgress(null);
    renderer.setSize(prevW, prevH, false); dirty = true;
  }
});

/* ---------------- boot ---------------- */
loadLibrary();
if (!load()) { state.layers = library.length ? presetLayers(0) : []; state.presetId = library.length ? library[0].id : null; }
current = snapshot();
if (state.presetId && (!presetSnap || presetSnap.includes('"id"'))) presetSnap = presetKey(state.layers);
speedIn.value = state.speed; speedIn.dispatchEvent(new Event('input'));
$('#previewQ').value = String(state.previewQ);
syncPresetsMin(); applyPanels(); buildAddMenu(); buildPresets(); if (state.kfOn) toggleKf(true); renderStack(); renderExport(); syncPlay(); syncHistoryButtons(); syncTimeline();
layoutCanvas();
requestAnimationFrame(loop);
/*DEBUG*/window.__tf = { liveValue, types: LAYER_TYPES, previewStack, mk: t => newLayer(t), read: (rt, w, h, b) => renderer.readRenderTargetPixels(rt, 0, 0, w, h, b), get library() { return library; }, presetLayers, state, runStack, compose, loopSpec, frameSpecs, exportSize, get phase() { return phase; }, set phase(v) { phase = v; dirty = true; }, get time() { return time; }, set time(v) { time = v; dirty = true; } };
})();
