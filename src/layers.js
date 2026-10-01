/* ---------- Layer definitions: textures (generators) and effects ---------- */
const GLSL_HEAD = `
precision highp float;
varying vec2 vUv;
uniform sampler2D tPrev;
uniform vec2 uRes;
uniform float uTime;
uniform float uLoop;
uniform float uOpacity;
uniform float uBlend;
uniform float u_seed;
uniform float u_pal;
uniform vec3 u_ca;
uniform vec3 u_cb;
uniform vec3 u_cc;
uniform float u_shift;
uniform float u_contrast;
uniform float u_cycle;
#define PI 3.14159265359
#define TAU 6.28318530718
float PXS(){ return uRes.y/1080.0; }
vec2 mirrorUV(vec2 u){ u = mod(u, 2.0); return 1.0 - abs(1.0 - u); }
vec3 S(vec2 u){ return texture2D(tPrev, mirrorUV(u)).rgb; }
float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash22(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz) * p3.zy); }
vec2 grad2(vec2 i){ float a = hash12(i + u_seed * 17.13) * TAU; return vec2(cos(a), sin(a)); }
float gnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(grad2(i), f);
  float b = dot(grad2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0));
  float c = dot(grad2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0));
  float d = dot(grad2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbmx(vec2 p, float oct, float lac, float gain){
  float s = 0.0, a = 0.5, n = 0.0;
  mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 8; i++) {
    if (float(i) >= oct) break;
    s += a * gnoise(p); n += a;
    p = r * p * lac + vec2(3.1, 1.7);
    a *= gain;
  }
  return s / max(n, 1e-4);
}
float snoise(vec2 v){
  const float F2 = 0.36602540378, G2 = 0.21132486540;
  vec2 i = floor(v + (v.x + v.y) * F2);
  vec2 x0 = v - i + (i.x + i.y) * G2;
  vec2 o = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec2 x1 = x0 - o + G2, x2 = x0 - 1.0 + 2.0 * G2;
  vec3 w = max(0.5 - vec3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
  w = w * w * w * w;
  return dot(w, vec3(dot(grad2(i), x0), dot(grad2(i + o), x1), dot(grad2(i + 1.0), x2))) * 70.0;
}
vec3 rgb2hsv(vec3 c){
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y); float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}
vec3 hsv2rgb(vec3 c){
  vec3 p = abs(fract(c.xxx + vec3(1.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);
  return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
}
/* Loop helpers. uLoop is the loop length in animation seconds (0 = free running).
   Every animated term goes through one of these so that at uTime == uLoop the frame
   matches uTime == 0 exactly: oscillations snap to whole turns, drifts travel a closed
   circle whose length matches the requested speed, and stepped randomness repeats. */
float cycles(float w){
  float n = w * uLoop / TAU;
  if (abs(n) < 0.2) return 0.0;
  return sign(n) * max(1.0, floor(abs(n) + 0.5));
}
float ang(float w){ return uLoop > 0.0 ? TAU * cycles(w) * uTime / uLoop : w * uTime; }
// Like ang, but never freezes: any nonzero rate makes at least one full cycle per loop.
float ang1(float w){ if (uLoop <= 0.0 || w == 0.0) return w * uTime; float n = w * uLoop / TAU; return TAU * sign(n) * max(1.0, floor(abs(n) + 0.5)) * uTime / uLoop; }
float units(float v, float period){ return ang(v * TAU / period) / TAU * period; }
vec2 drift(vec2 v){
  if (uLoop <= 0.0) return v * uTime;
  float sp = length(v); if (sp < 1e-6) return vec2(0.0);
  float r = sp * uLoop / TAU, a = TAU * uTime / uLoop;
  vec2 d = v / sp;
  return (d * sin(a) + vec2(-d.y, d.x) * (1.0 - cos(a))) * r;
}
float sway(float v){ return uLoop > 0.0 ? sin(TAU * uTime / uLoop) * v * uLoop / TAU : v * uTime; }
float tstep(float rate, float off){
  if (uLoop <= 0.0) return floor(uTime * rate + off);
  float n = max(1.0, floor(rate * uLoop + 0.5));
  return mod(floor(uTime / uLoop * n + off + 1e-4), n);
}
vec3 cosPal(float t, vec3 a, vec3 b, vec3 c, vec3 d){ return a + b * cos(TAU * (c * t + d)); }
vec3 colorize(float t){
  t = (t - 0.5) * u_contrast + 0.5;
  float sh = u_shift + (u_pal < 0.5 ? units(u_cycle * 0.2, 2.0) : units(u_cycle * 0.2, 1.0));
  if (u_pal < 0.5) {
    t = u_cycle != 0.0 ? 1.0 - abs(1.0 - mod(t + sh, 2.0)) : clamp(t + sh, 0.0, 1.0);
    return t < 0.5 ? mix(u_ca, u_cb, t * 2.0) : mix(u_cb, u_cc, t * 2.0 - 1.0);
  }
  float x = t + sh;
  vec3 h = vec3(0.5);
  vec3 c;
  if (u_pal < 1.5) c = cosPal(x, h, h, vec3(1.0), vec3(0.0, 0.33, 0.67));
  else if (u_pal < 2.5) c = cosPal(x, h, h, vec3(1.0, 0.7, 0.4), vec3(0.0, 0.15, 0.20));
  else if (u_pal < 3.5) c = cosPal(x, h, h, vec3(1.0), vec3(0.3, 0.20, 0.20));
  else if (u_pal < 4.5) c = cosPal(x, h, h, vec3(1.0, 1.0, 0.5), vec3(0.8, 0.90, 0.30));
  else if (u_pal < 5.5) c = cosPal(x, h, h, vec3(1.0), vec3(0.0, 0.10, 0.20));
  else if (u_pal < 6.5) c = cosPal(x, h, h, vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25));
  else if (u_pal < 7.5) c = cosPal(x, vec3(0.8, 0.5, 0.4), vec3(0.2, 0.4, 0.2), vec3(2.0, 1.0, 1.0), vec3(0.0, 0.25, 0.25));
  else c = vec3(clamp(t + sh, 0.0, 1.0));
  return clamp(c, 0.0, 1.0);
}
vec3 blendMode(vec3 b, vec3 s, float m){
  if (m < 0.5) return s;
  if (m < 1.5) return b + s;
  if (m < 2.5) return b * s;
  if (m < 3.5) return 1.0 - (1.0 - b) * (1.0 - s);
  if (m < 4.5) return mix(2.0 * b * s, 1.0 - 2.0 * (1.0 - b) * (1.0 - s), step(0.5, b));
  if (m < 5.5) return abs(b - s);
  if (m < 6.5) return mix(2.0 * b * s + b * b * (1.0 - 2.0 * s), sqrt(max(b, 0.0)) * (2.0 * s - 1.0) + 2.0 * b * (1.0 - s), step(0.5, s));
  if (m < 7.5) return max(b, s);
  if (m < 8.5) return min(b, s);
  if (m < 9.5) return b / max(1.0 - s, 1e-3);
  return b + s - 2.0 * b * s;
}
`;

const GEN_MAIN = `
void main(){
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  vec3 base = texture2D(tPrev, uv).rgb;
  vec4 top = layerColor(uv, p);
  vec3 r = blendMode(base, top.rgb, uBlend);
  gl_FragColor = vec4(clamp(mix(base, r, uOpacity * top.a), 0.0, 1.0), 1.0);
}`;
const GEN_DEFAULT_COLOR = `vec4 layerColor(vec2 uv, vec2 p){ return vec4(colorize(gen(uv, p)), 1.0); }`;
const FX_MAIN = `
void main(){
  vec2 uv = vUv;
  vec3 base = texture2D(tPrev, uv).rgb;
  vec3 c = fx(uv);
  vec3 r = blendMode(base, c, uBlend);
  gl_FragColor = vec4(clamp(mix(base, r, uOpacity), 0.0, 1.0), 1.0);
}`;

const BLEND_MODES = ['Normal', 'Add', 'Multiply', 'Screen', 'Overlay', 'Difference', 'Soft light', 'Lighten', 'Darken', 'Color dodge', 'Exclusion'];
const PALETTES = ['Colors A to C', 'Spectrum', 'Ember', 'Dusk', 'Lime', 'Tidepool', 'Candy', 'Rose', 'Mono'];

const PAL_PARAMS = [
  { k: 'pal', l: 'Palette', t: 'select', o: PALETTES, d: 0 },
  { k: 'ca', l: 'Color A', t: 'color', d: '#10132b', show: p => p.pal == 0 },
  { k: 'cb', l: 'Color B', t: 'color', d: '#e0467c', show: p => p.pal == 0 },
  { k: 'cc', l: 'Color C', t: 'color', d: '#ffe9b0', show: p => p.pal == 0 },
  { k: 'shift', l: 'Palette shift', min: -1, max: 1, s: 0.01, d: 0 },
  { k: 'contrast', l: 'Contrast', min: 0.1, max: 3, s: 0.01, d: 1, r: [0.7, 1.8] },
  { k: 'cycle', l: 'Color cycle', min: -2, max: 2, s: 0.01, d: 0, r: [0, 0] },
];
const SEED = { k: 'seed', l: 'Seed', min: 0, max: 100, s: 1, d: 0 };
const SPEED = (d = 0.2, max = 2) => ({ k: 'speed', l: 'Speed', min: 0, max, s: 0.01, d, r: [0, max * 0.4] });

const LAYER_TYPES = {
  /* ===================== TEXTURES ===================== */
  noise: {
    name: 'Noise', kind: 'gen', blurb: 'Layered fractal noise',
    params: [
      { k: 'scale', l: 'Scale', min: 0.5, max: 20, s: 0.01, d: 3 },
      { k: 'oct', l: 'Detail', min: 1, max: 8, s: 1, d: 5 },
      { k: 'lac', l: 'Roughness', min: 1.2, max: 3.5, s: 0.01, d: 2 },
      { k: 'gain', l: 'Persistence', min: 0.2, max: 0.85, s: 0.01, d: 0.5 },
      { k: 'warp', l: 'Self-warp', min: 0, max: 3, s: 0.01, d: 0 },
      { k: 'ridged', l: 'Ridged', t: 'bool', d: 0 },
      { k: 'angle', l: 'Drift angle', min: 0, max: 360, s: 1, d: 45 },
      SPEED(0.15), SEED,
    ],
    glsl: `
float gen(vec2 uv, vec2 p){
  vec2 dir = vec2(cos(radians(u_angle)), sin(radians(u_angle)));
  vec2 q = p * u_scale + drift(dir * u_speed);
  if (u_warp > 0.0) q += u_warp * vec2(fbmx(q * 0.7 + vec2(1.7, 0.0) + drift(vec2(0.0, 0.37) * u_speed), 3.0, 2.0, 0.5), fbmx(q * 0.7 + vec2(9.2, 0.0) + drift(vec2(0.0, -0.29) * u_speed), 3.0, 2.0, 0.5));
  float n = fbmx(q, u_oct, u_lac, u_gain);
  if (u_ridged > 0.5) { n = 1.0 - abs(n) * 2.4; return n * n; }
  return n * 0.85 + 0.5;
}`,
  },
  warp: {
    name: 'Fluid marble', kind: 'gen', blurb: 'Domain-warped swirls',
    colors: { pal: 3 },
    params: [
      { k: 'scale', l: 'Scale', min: 0.3, max: 8, s: 0.01, d: 1.8 },
      { k: 'warp', l: 'Warp', min: 0, max: 6, s: 0.01, d: 3.5 },
      { k: 'oct', l: 'Detail', min: 1, max: 8, s: 1, d: 5 },
      { k: 'bands', l: 'Veins', min: 0, max: 12, s: 0.01, d: 0, r: [0, 5] },
      { k: 'mixq', l: 'Depth', min: 0, max: 1, s: 0.01, d: 0.25 },
      SPEED(0.2), SEED,
    ],
    glsl: `
float gen(vec2 uv, vec2 p){
  vec2 x = p * u_scale;
  vec2 q = vec2(fbmx(x + drift(vec2(0.0, 0.3) * u_speed), u_oct, 2.0, 0.5), fbmx(x + vec2(5.2, 1.3) + drift(vec2(-0.2, 0.0) * u_speed), u_oct, 2.0, 0.5));
  vec2 r = vec2(fbmx(x + u_warp * q + vec2(1.7, 9.2) + drift(vec2(0.15, 0.1) * u_speed), u_oct, 2.0, 0.5), fbmx(x + u_warp * q + vec2(8.3, 2.8) + drift(vec2(-0.1, 0.126) * u_speed), u_oct, 2.0, 0.5));
  float f = fbmx(x + u_warp * r, u_oct, 2.0, 0.5);
  float v = f * 0.9 + 0.5 + (length(q) - 0.3) * u_mixq;
  if (u_bands > 0.0) v = 0.5 + 0.5 * sin(v * u_bands * TAU);
  return v;
}`,
  },
  voronoi: {
    name: 'Cells', kind: 'gen', blurb: 'Voronoi cells and crackle',
    params: [
      { k: 'scale', l: 'Scale', min: 1, max: 40, s: 0.01, d: 6 },
      { k: 'jitter', l: 'Jitter', min: 0, max: 1, s: 0.01, d: 1 },
      { k: 'mode', l: 'Style', t: 'select', o: ['Distance', 'Edges', 'Flat cells', 'Stained glass'], d: 0 },
      { k: 'edge', l: 'Edge width', min: 0, max: 0.5, s: 0.001, d: 0.08, show: p => p.mode == 1 || p.mode == 3 },
      SPEED(0.3), SEED,
    ],
    glsl: `
float gen(vec2 uv, vec2 p){
  vec2 x = p * u_scale; vec2 i = floor(x), f = fract(x);
  float d1 = 8.0, d2 = 8.0; vec2 id = vec2(0.0);
  for (int yy = -1; yy <= 1; yy++) for (int xx = -1; xx <= 1; xx++) {
    vec2 g = vec2(float(xx), float(yy));
    vec2 o = hash22(i + g + u_seed * 7.1);
    o = 0.5 + 0.5 * sin(ang(u_speed) + TAU * o);
    o = mix(vec2(0.5), o, u_jitter);
    vec2 rr = g + o - f; float d = dot(rr, rr);
    if (d < d1) { d2 = d1; d1 = d; id = i + g; } else if (d < d2) { d2 = d; }
  }
  d1 = sqrt(d1); d2 = sqrt(d2);
  float e = smoothstep(0.0, max(u_edge, 0.001), d2 - d1);
  if (u_mode < 0.5) return d1;
  if (u_mode < 1.5) return e;
  float c = hash12(id + u_seed * 3.3);
  if (u_mode < 2.5) return c;
  return c * e;
}`,
  },
  gradient: {
    name: 'Gradient', kind: 'gen', blurb: 'Linear, radial and angular ramps',
    params: [
      { k: 'type', l: 'Shape', t: 'select', o: ['Linear', 'Radial', 'Angular', 'Diamond'], d: 0 },
      { k: 'angle', l: 'Angle', min: 0, max: 360, s: 1, d: 90 },
      { k: 'repeat', l: 'Repeat', min: 1, max: 12, s: 0.01, d: 1, r: [1, 4] },
      { k: 'wrap', l: 'Repeat mode', t: 'select', o: ['Clamp', 'Repeat', 'Mirror'], d: 0 },
      { k: 'cx', l: 'Center X', min: -1, max: 1, s: 0.01, d: 0 },
      { k: 'cy', l: 'Center Y', min: -1, max: 1, s: 0.01, d: 0 },
      SPEED(0, 2),
    ],
    glsl: `
float gen(vec2 uv, vec2 p){
  vec2 c = p - vec2(u_cx, u_cy) * 0.5;
  float a = radians(u_angle); vec2 d = vec2(cos(a), sin(a));
  float t;
  if (u_type < 0.5) t = dot(c, d) + 0.5;
  else if (u_type < 1.5) t = length(c) * 1.4;
  else if (u_type < 2.5) t = fract((atan(c.y, c.x) - a) / TAU);
  else { vec2 r = mat2(d.x, -d.y, d.y, d.x) * c; t = (abs(r.x) + abs(r.y)) * 1.2; }
  t = t * u_repeat - (u_wrap > 1.5 ? units(u_speed, 2.0) : units(u_speed, 1.0));
  if (u_wrap < 0.5) return clamp(t, 0.0, 1.0);
  if (u_wrap < 1.5) return fract(t);
  return 1.0 - abs(1.0 - mod(t, 2.0));
}`,
  },
  waves: {
    name: 'Stripes', kind: 'gen', blurb: 'Bands with a noisy wobble',
    params: [
      { k: 'freq', l: 'Frequency', min: 1, max: 80, s: 0.01, d: 12 },
      { k: 'angle', l: 'Angle', min: 0, max: 180, s: 1, d: 30 },
      { k: 'warp', l: 'Wobble', min: 0, max: 3, s: 0.01, d: 0.6 },
      { k: 'ws', l: 'Wobble scale', min: 0.2, max: 8, s: 0.01, d: 1.5 },
      { k: 'sharp', l: 'Hardness', min: 0, max: 1, s: 0.01, d: 0.2 },
      { k: 'speed', l: 'Speed', min: -3, max: 3, s: 0.01, d: 0.5, r: [-1, 1] },
      SEED,
    ],
    glsl: `
float gen(vec2 uv, vec2 p){
  float a = radians(u_angle); vec2 d = vec2(cos(a), sin(a));
  float w = fbmx(p * u_ws + drift(vec2(0.0, 0.1) * abs(u_speed)), 4.0, 2.0, 0.5) * u_warp;
  float s = sin((dot(p, d) + w) * u_freq * PI + ang(u_speed * 2.0));
  s = sign(s) * pow(abs(s), mix(1.0, 0.04, u_sharp));
  return s * 0.5 + 0.5;
}`,
  },
  plasma: {
    name: 'Plasma', kind: 'gen', blurb: 'Interfering sine fields',
    colors: { pal: 1 },
    params: [
      { k: 'scale', l: 'Scale', min: 0.5, max: 12, s: 0.01, d: 3 },
      { k: 'complex', l: 'Complexity', min: 1, max: 6, s: 1, d: 3 },
      { k: 'twist', l: 'Orbit', min: 0, max: 3, s: 0.01, d: 1 },
      SPEED(0.6, 3), SEED,
    ],
    glsl: `
float gen(vec2 uv, vec2 p){
  vec2 x = p * u_scale; float v = 0.0;
  for (int i = 0; i < 6; i++) {
    if (float(i) >= u_complex) break;
    float fi = float(i) + 1.0 + u_seed * 0.137;
    v += sin(x.x * fi * 0.7 + ang(u_speed * (0.5 + 0.3 * fi)) + fi);
    v += sin(x.y * fi * 0.66 + ang(u_speed * (0.4 + 0.2 * fi) * 1.1) + fi * 2.0);
    v += sin(length(x - vec2(sin(ang(u_speed * 0.3 * fi)), cos(ang(u_speed * 0.25 * fi))) * u_twist * 2.0) * fi * 0.9 - ang(u_speed));
  }
  v /= u_complex * 3.0;
  return 0.5 + 0.5 * sin(v * PI * 1.5);
}`,
  },
  rings: {
    name: 'Rings', kind: 'gen', blurb: 'Concentric rings and spirals',
    params: [
      { k: 'count', l: 'Rings', min: 1, max: 60, s: 0.01, d: 10 },
      { k: 'arms', l: 'Spiral arms', min: -12, max: 12, s: 1, d: 0 },
      { k: 'sharp', l: 'Hardness', min: 0, max: 1, s: 0.01, d: 0.3 },
      { k: 'wobble', l: 'Wobble', min: 0, max: 1, s: 0.01, d: 0 },
      { k: 'cx', l: 'Center X', min: -1, max: 1, s: 0.01, d: 0, r: [-0.3, 0.3] },
      { k: 'cy', l: 'Center Y', min: -1, max: 1, s: 0.01, d: 0, r: [-0.3, 0.3] },
      { k: 'speed', l: 'Speed', min: -3, max: 3, s: 0.01, d: 0.3, r: [-1, 1] },
    ],
    glsl: `
float gen(vec2 uv, vec2 p){
  vec2 c = p - vec2(u_cx, u_cy) * 0.5;
  float r = length(c), a = atan(c.y, c.x);
  r += u_wobble * 0.05 * sin(a * 6.0 + ang(1.3));
  float s = sin(r * u_count * TAU * 0.5 + a * u_arms - ang(u_speed * 3.0));
  s = sign(s) * pow(abs(s), mix(1.0, 0.04, u_sharp));
  return s * 0.5 + 0.5;
}`,
  },
  grid: {
    name: 'Grid', kind: 'gen', blurb: 'Checkers, lines, dots, diamonds',
    colors: { ca: '#f4efe6', cb: '#8a8f99', cc: '#1a1c22' },
    params: [
      { k: 'type', l: 'Pattern', t: 'select', o: ['Checker', 'Lines', 'Dots', 'Diamonds'], d: 0 },
      { k: 'scale', l: 'Scale', min: 2, max: 60, s: 0.01, d: 10 },
      { k: 'width', l: 'Size', min: 0.02, max: 0.5, s: 0.001, d: 0.12, show: p => p.type != 0 },
      { k: 'rot', l: 'Rotation', min: 0, max: 90, s: 0.1, d: 0 },
      { k: 'soft', l: 'Softness', min: 0, max: 1, s: 0.01, d: 0, r: [0, 0.3] },
      SPEED(0, 2),
    ],
    glsl: `
float gen(vec2 uv, vec2 p){
  float a = radians(u_rot); mat2 R = mat2(cos(a), -sin(a), sin(a), cos(a));
  vec2 x = R * p * u_scale + vec2(units(u_speed, 2.0), units(u_speed * 0.5, 2.0));
  vec2 f = fract(x);
  float aa = u_scale / uRes.y * 1.5 + u_soft * 0.3;
  if (u_type < 0.5) { float s = sin(x.x * PI) * sin(x.y * PI); return smoothstep(-aa * PI, aa * PI, s); }
  if (u_type < 1.5) { float g = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y)); return 1.0 - smoothstep(u_width * 0.5 - aa, u_width * 0.5 + aa, g); }
  if (u_type < 2.5) { float d = length(f - 0.5); return 1.0 - smoothstep(u_width - aa, u_width + aa, d); }
  float d = abs(f.x - 0.5) + abs(f.y - 0.5); return 1.0 - smoothstep(u_width - aa, u_width + aa, d);
}`,
  },
  truchet: {
    name: 'Truchet', kind: 'gen', blurb: 'Random tiles that form mazes',
    colors: { ca: '#14213d', cb: '#fca311', cc: '#fff6e0' },
    params: [
      { k: 'scale', l: 'Scale', min: 2, max: 40, s: 0.01, d: 8 },
      { k: 'width', l: 'Line width', min: 0.02, max: 0.45, s: 0.001, d: 0.14 },
      { k: 'style', l: 'Tile', t: 'select', o: ['Arcs', 'Diagonals'], d: 0 },
      { k: 'speed', l: 'Flip rate', min: 0, max: 3, s: 0.01, d: 0, r: [0, 1] },
      SEED,
    ],
    glsl: `
float gen(vec2 uv, vec2 p){
  vec2 x = p * u_scale; vec2 i = floor(x), f = fract(x);
  float h = hash12(i + u_seed * 1.7 + tstep(u_speed, hash12(i + 5.0) * 4.0) * vec2(1.7, 3.1));
  if (h > 0.5) f.x = 1.0 - f.x;
  float aa = u_scale / uRes.y * 1.5;
  float d;
  if (u_style < 0.5) d = min(abs(length(f) - 0.5), abs(length(f - 1.0) - 0.5));
  else d = abs(f.x - f.y) * 0.7071;
  return 1.0 - smoothstep(u_width * 0.5 - aa, u_width * 0.5 + aa, d);
}`,
  },
  caustics: {
    name: 'Caustics', kind: 'gen', blurb: 'Light rippling through water',
    colors: { ca: '#03263a', cb: '#1b8fb3', cc: '#e8fbff' },
    params: [
      { k: 'scale', l: 'Scale', min: 0.3, max: 6, s: 0.01, d: 1.5 },
      { k: 'sharp', l: 'Sharpness', min: 1, max: 16, s: 0.01, d: 7 },
      SPEED(0.5, 3), SEED,
    ],
    glsl: `
float gen(vec2 uv, vec2 p){
  vec2 q = p * u_scale * TAU - 250.0;
  vec2 i = q; float c = 1.0; float inten = 0.005;
  for (int n = 0; n < 5; n++) {
    float k = 1.0 - (3.5 / float(n + 1));
    float t = (23.0 + u_seed * 3.7) * k + ang(u_speed * 0.5 * k);
    i = q + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
    c += 1.0 / length(vec2(q.x / (sin(i.x + t) / inten), q.y / (cos(i.y + t) / inten)));
  }
  c /= 5.0;
  c = 1.17 - pow(c, 1.4);
  return clamp(pow(abs(c), u_sharp), 0.0, 1.0);
}`,
  },
  stars: {
    name: 'Stars', kind: 'gen', blurb: 'Twinkling points of light',
    colors: { ca: '#04050c', cb: '#aab9ff', cc: '#ffffff' },
    params: [
      { k: 'density', l: 'Density', min: 4, max: 100, s: 0.01, d: 26 },
      { k: 'size', l: 'Star size', min: 0.5, max: 8, s: 0.01, d: 2 },
      { k: 'glow', l: 'Glow', min: 0, max: 1, s: 0.01, d: 0.3 },
      { k: 'layers', l: 'Depth layers', min: 1, max: 3, s: 1, d: 2 },
      { k: 'twinkle', l: 'Twinkle', min: 0, max: 4, s: 0.01, d: 1.2 },
      SEED,
    ],
    glsl: `
float gen(vec2 uv, vec2 p){
  float v = 0.0;
  for (int L = 0; L < 3; L++) {
    if (float(L) >= u_layers) break;
    float fl = float(L);
    float sc = u_density * (1.0 + fl * 0.8);
    vec2 x = p * sc + fl * 17.3; vec2 i = floor(x), f = fract(x);
    vec2 o = 0.15 + 0.7 * hash22(i + u_seed + fl * 3.1);
    float h = hash12(i * 1.7 + u_seed + fl);
    float d = length(f - o);
    float px = sc / 1080.0;
    float r = max(u_size * px * (0.4 + h) / (1.0 + fl * 0.5), 0.6 * sc / uRes.y);
    float tw = 0.55 + 0.45 * sin(ang(u_twinkle * (1.0 + h * 3.0)) + h * 50.0);
    float b = smoothstep(r, 0.0, d) + u_glow * 0.12 * smoothstep(r * 8.0, 0.0, d);
    v += b * tw * (0.35 + 0.65 * h);
  }
  return clamp(v, 0.0, 1.0);
}`,
  },
  julia: {
    name: 'Fractal', kind: 'gen', blurb: 'Julia set, gently orbiting',
    colors: { pal: 3 },
    params: [
      { k: 'zoom', l: 'Zoom', min: 0.3, max: 6, s: 0.01, d: 1.1 },
      { k: 'cre', l: 'Shape X', min: -1, max: 1, s: 0.001, d: -0.8, r: [-0.85, 0.4] },
      { k: 'cim', l: 'Shape Y', min: -1, max: 1, s: 0.001, d: 0.156, r: [-0.7, 0.7] },
      { k: 'iter', l: 'Iterations', min: 20, max: 200, s: 1, d: 100 },
      { k: 'rot', l: 'Rotation', min: 0, max: 360, s: 1, d: 0 },
      { k: 'bandw', l: 'Color bands', min: 0.2, max: 4, s: 0.01, d: 1 },
      SPEED(0.15, 1),
    ],
    glsl: `
float gen(vec2 uv, vec2 p){
  float a = radians(u_rot);
  vec2 z = mat2(cos(a), -sin(a), sin(a), cos(a)) * p * 2.6 / u_zoom;
  vec2 c = vec2(u_cre, u_cim) + 0.04 * vec2(cos(ang(u_speed)), sin(ang(u_speed * 1.3)));
  float n = 0.0, m2 = 0.0;
  for (int i = 0; i < 200; i++) {
    if (float(i) >= u_iter) break;
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    m2 = dot(z, z);
    if (m2 > 256.0) break;
    n += 1.0;
  }
  if (n >= u_iter) return 0.0;
  float sn = n - log2(log2(m2)) + 4.0;
  return fract(sqrt(max(sn, 0.0) / 12.0) * u_bandw);
}`,
  },
  turbulence: {
    name: 'Turbulence', kind: 'gen', blurb: 'Layered sine flow with color dispersion',
    colors: { pal: 1, contrast: 0.9 },
    params: [
      { k: 'scale', l: 'Scale', min: 0.3, max: 6, s: 0.01, d: 1.6 },
      { k: 'detail', l: 'Detail', min: 1, max: 9, s: 1, d: 6 },
      { k: 'turb', l: 'Turbulence', min: 0, max: 2, s: 0.001, d: 0.85 },
      { k: 'bands', l: 'Bands', min: 0.3, max: 8, s: 0.01, d: 1.8 },
      { k: 'disp', l: 'Dispersion', min: 0, max: 1, s: 0.001, d: 0.35 },
      SPEED(0.3, 2), SEED,
    ],
    glsl: `
vec4 layerColor(vec2 uv, vec2 p){
  vec2 q = p * u_scale * 3.0 + u_seed * 1.37;
  float f = 1.0;
  mat2 R = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 9; i++) {
    if (float(i) >= u_detail) break;
    float fi = float(i);
    q += u_turb * sin(q.yx * f + ang(u_speed * (1.0 + 0.3 * fi)) + fi * 1.7) / f;
    q = R * q;
    f *= 1.45;
  }
  float v = (q.x + q.y) * 0.5 * u_bands, d = u_disp * 0.9;
  vec3 c = vec3(colorize(0.5 + 0.5 * sin(v - d)).r, colorize(0.5 + 0.5 * sin(v)).g, colorize(0.5 + 0.5 * sin(v + d)).b);
  return vec4(c, 1.0);
}`,
    custom: true,
  },
  nacre: {
    name: 'Nacre', kind: 'gen', blurb: 'Mother-of-pearl contour bands',
    palette: false,
    params: [
      { k: 'scale', l: 'Scale', min: 0.3, max: 6, s: 0.01, d: 1.4 },
      { k: 'count', l: 'Bands', min: 2, max: 40, s: 0.1, d: 12 },
      { k: 'warp', l: 'Warp', min: 0, max: 3, s: 0.001, d: 1.2 },
      { k: 'hue', l: 'Hue shift', min: 0, max: 1, s: 0.001, d: 0 },
      { k: 'sat', l: 'Iridescence', min: 0, max: 1, s: 0.001, d: 0.55 },
      { k: 'line', l: 'Contours', min: 0, max: 1, s: 0.001, d: 0.4 },
      { k: 'sheen', l: 'Sheen', min: 0, max: 1.5, s: 0.001, d: 0.7 },
      SPEED(0.12, 1), SEED,
    ],
    glsl: `
float nacreH(vec2 q, float sp){
  vec2 w = vec2(fbmx(q + drift(vec2(1.0, -0.7) * sp), 4.0, 2.0, 0.5), fbmx(q + vec2(5.2, 1.3) + drift(vec2(-0.6, 1.0) * sp), 4.0, 2.0, 0.5));
  return fbmx(q + w * u_warp * 2.0, 5.0, 2.0, 0.5);
}
vec4 layerColor(vec2 uv, vec2 p){
  float t = u_speed * 0.3;
  vec2 q = p * u_scale * 2.0;
  float h = nacreH(q, t);
  float e = 0.004 * u_scale;
  vec2 g = vec2(nacreH(q + vec2(e, 0.0), t) - h, nacreH(q + vec2(0.0, e), t) - h) / e;
  float x = h * u_count + u_count * 0.5;
  float k = floor(x), f = fract(x);
  float band = hash12(vec2(k * 1.31, u_seed + 3.0));
  vec3 film = 0.5 + 0.5 * cos(TAU * (band * 0.6 + f * 0.22 + h * 0.8 + u_hue + vec3(0.0, 0.33, 0.67)));
  vec3 pearl = mix(vec3(0.94, 0.92, 0.9), film, u_sat);
  vec3 n = normalize(vec3(-g * 0.12, 1.0));
  float spec = pow(max(dot(n, normalize(vec3(0.35, 0.45, 1.0))), 0.0), 16.0);
  float edge = smoothstep(0.0, 0.07, f) * smoothstep(1.0, 0.93, f);
  vec3 c = pearl * (0.74 + 0.26 * f);
  c = mix(c * (1.0 - u_line * 0.65), c, edge);
  c += spec * u_sheen * 0.45;
  return vec4(clamp(c, 0.0, 1.0), 1.0);
}`,
    custom: true,
  },
  filaments: {
    name: 'Filaments', kind: 'gen', blurb: 'Crawling plasma lightning',
    colors: { ca: '#07021a', cb: '#9b3cff', cc: '#fff4ff' },
    params: [
      { k: 'mode', l: 'Shape', t: 'select', o: ['Web', 'Radial'], d: 1 },
      { k: 'scale', l: 'Scale', min: 0.3, max: 8, s: 0.01, d: 2 },
      { k: 'width', l: 'Thickness', min: 0.002, max: 0.2, s: 0.001, d: 0.03 },
      { k: 'layers', l: 'Layers', min: 1, max: 4, s: 1, d: 3 },
      { k: 'core', l: 'Core glow', min: 0, max: 2, s: 0.001, d: 0.8 },
      SPEED(0.4, 3), SEED,
    ],
    glsl: `
float gen(vec2 uv, vec2 p){
  vec2 sd = vec2(u_seed * 3.1, u_seed * 1.7);
  float r = length(p), a = atan(p.y, p.x);
  float v = 0.0;
  for (int i = 0; i < 4; i++) {
    if (float(i) >= u_layers) break;
    float fi = float(i);
    vec2 q;
    if (u_mode < 0.5) q = p * u_scale * (1.0 + fi * 0.35) + vec2(fi * 7.1, fi * 3.3) + drift(vec2(0.0, 0.3) * u_speed);
    else q = vec2(cos(a), sin(a)) * u_scale * (1.0 + fi * 0.3) + vec2(fi * 5.3, r * 2.5) + drift(vec2(0.0, -(0.6 + 0.2 * fi)) * u_speed);
    float n = fbmx(q + sd + drift(vec2(0.2, -0.15) * u_speed), 5.0, 2.0, 0.5);
    float w = u_width * (1.0 - fi * 0.18);
    v += w / (abs(n) + w) * (1.0 - fi * 0.2);
  }
  v /= max(u_layers * 0.7, 1.0);
  if (u_mode > 0.5) v *= smoothstep(1.2, 0.05, r);
  v += u_core * exp(-r * r * 12.0) * (0.85 + 0.15 * sin(ang(u_speed * 5.0)));
  return clamp(pow(v, 1.6), 0.0, 1.0);
}`,
  },
  gasbands: {
    name: 'Gas bands', kind: 'gen', blurb: 'Sheared storm bands like a gas giant',
    colors: { ca: '#4a2b1c', cb: '#c98a55', cc: '#f6e6cc' },
    params: [
      { k: 'bands', l: 'Bands', min: 2, max: 30, s: 0.1, d: 9 },
      { k: 'turb', l: 'Turbulence', min: 0, max: 2, s: 0.001, d: 0.8 },
      { k: 'shear', l: 'Jet speed', min: 0, max: 3, s: 0.001, d: 1 },
      { k: 'storms', l: 'Storms', min: 0, max: 1, s: 0.001, d: 0.4 },
      { k: 'flash', l: 'Lightning', min: 0, max: 1, s: 0.001, d: 0 },
      SPEED(0.3, 2), SEED,
    ],
    glsl: `
float gen(vec2 uv, vec2 p){
  vec2 q = p + vec2(u_seed * 1.7, 0.0);
  float yw = q.y * u_bands + fbmx(q * vec2(1.5, 3.0) + 11.0, 3.0, 2.0, 0.5) * 1.4;
  float lane = hash12(vec2(floor(yw), u_seed)) - 0.5;
  q.x += sway(u_speed * u_shear * lane * 0.6);
  float n = fbmx(vec2(q.x * 2.2, yw * 0.9) + drift(vec2(0.04, 0.03) * u_speed), 5.0, 2.0, 0.5);
  float v = 0.5 + 0.5 * sin(yw * PI * 0.5 + n * 4.0 * u_turb + hash12(vec2(floor(yw), 3.0)) * 3.0);
  v = mix(v, 0.5 + 0.5 * n * 1.6, 0.35);
  vec2 g = vec2(q.x * u_bands * 0.35, yw * 0.5);
  vec2 ci = floor(g), cf = fract(g) - 0.5;
  float h = hash12(ci + u_seed * 7.0);
  if (h < u_storms * 0.35) {
    vec2 o = cf - (hash22(ci) - 0.5) * 0.3;
    float r = length(o * vec2(0.6, 1.2));
    float sw = smoothstep(0.32, 0.0, r);
    float ring = sin(r * 40.0 - ang(u_speed * 2.0) + atan(o.y, o.x) * 2.0);
    v = mix(v, 0.5 + 0.45 * ring * sw + (h * 2.0 - 0.3) * 0.5, sw * 0.9);
  }
  if (u_flash > 0.0) {
    vec2 fcell = floor(p * 6.0);
    float fl = step(1.0 - u_flash * 0.08, hash12(fcell + tstep(u_speed * 7.0, 0.0) * 1.37));
    v += fl * smoothstep(0.35, 0.0, length(fract(p * 6.0) - 0.5)) * 1.5;
  }
  return clamp(v, 0.0, 1.0);
}`,
  },
  moire: {
    name: 'Moiré', kind: 'gen', blurb: 'Glowing line lattices interfering',
    colors: { ca: '#02030a', cb: '#3a4bff', cc: '#e9f0ff' },
    params: [
      { k: 'count', l: 'Lattices', min: 2, max: 8, s: 1, d: 3 },
      { k: 'freq', l: 'Density', min: 10, max: 240, s: 0.1, d: 70 },
      { k: 'spread', l: 'Angle spread', min: 0, max: 30, s: 0.01, d: 3.5 },
      { k: 'warp', l: 'Warp', min: 0, max: 1, s: 0.001, d: 0.15 },
      { k: 'sharp', l: 'Line sharpness', min: 1, max: 12, s: 0.01, d: 4 },
      SPEED(0.2, 2), SEED,
    ],
    glsl: `
float gen(vec2 uv, vec2 p){
  float w = fbmx(p * 2.0 + u_seed + drift(vec2(0.1, 0.07) * u_speed), 3.0, 2.0, 0.5) * u_warp;
  float v = 0.0;
  for (int i = 0; i < 8; i++) {
    if (float(i) >= u_count) break;
    float fi = float(i);
    float a = radians(fi * u_spread) + sin(ang(u_speed * 0.3) + fi) * radians(u_spread) * 0.5;
    vec2 dir = vec2(cos(a), sin(a));
    float s = 0.5 + 0.5 * cos(dot(p + w, dir) * u_freq + fi * 1.3 + ang(u_speed * (mod(fi, 2.0) - 0.5)));
    v += pow(s, u_sharp);
  }
  return clamp(v / u_count * 1.6, 0.0, 1.0);
}`,
  },
  orbital: {
    name: 'Orbital', kind: 'gen', blurb: 'Electron-cloud lobes with rainbow phase',
    colors: { pal: 1 },
    params: [
      { k: 'lobes', l: 'Lobes', min: 1, max: 8, s: 1, d: 3 },
      { k: 'shells', l: 'Shells', min: 1, max: 6, s: 0.01, d: 2 },
      { k: 'size', l: 'Size', min: 0.2, max: 2, s: 0.001, d: 0.9 },
      { k: 'swirl', l: 'Swirl', min: -4, max: 4, s: 0.001, d: 1.2 },
      { k: 'grain', l: 'Probability dots', min: 0, max: 1, s: 0.001, d: 0.35 },
      { k: 'gain', l: 'Brightness', min: 0.2, max: 3, s: 0.001, d: 1.3 },
      SPEED(0.3, 2), SEED,
    ],
    glsl: `
vec4 layerColor(vec2 uv, vec2 p){
  float r = length(p) / u_size + 1e-4, a = atan(p.y, p.x);
  float ph = a * u_lobes + r * u_swirl * 3.0 - ang(u_speed);
  float ang = pow(abs(cos(ph * 0.5)), 2.0);
  float rad = pow(sin(r * u_shells * PI * 0.9), 2.0) * exp(-r * 2.2) * r * 4.0;
  float dens = ang * rad;
  dens *= 0.75 + 0.5 * fbmx(p * 6.0 / u_size + drift(vec2(0.2, 0.15) * u_speed) + u_seed, 3.0, 2.0, 0.5);
  float sp = step(hash12(floor(uv * uRes) + tstep(u_speed * 12.0, 0.0) * 13.1), dens * 1.4);
  float v = mix(dens, sp * 0.9 + dens * 0.3, u_grain) * u_gain;
  vec3 c = colorize(fract(ph / TAU * 0.5 + r * 0.15)) * v;
  return vec4(clamp(c, 0.0, 1.0), 1.0);
}`,
    custom: true,
  },
  beads: {
    name: 'Beads', kind: 'gen', blurb: 'Glossy beads swelling in a hex grid',
    colors: { pal: 6 },
    params: [
      { k: 'scale', l: 'Scale', min: 3, max: 60, s: 0.1, d: 14 },
      { k: 'size', l: 'Bead size', min: 0.2, max: 1.2, s: 0.001, d: 0.85 },
      { k: 'pulse', l: 'Swell', min: 0, max: 1, s: 0.001, d: 0.5 },
      { k: 'gloss', l: 'Gloss', min: 0, max: 1.5, s: 0.001, d: 0.8 },
      { k: 'gapc', l: 'Gap color', t: 'color', d: '#0b0a10' },
      SPEED(0.5, 3), SEED,
    ],
    glsl: `
vec4 layerColor(vec2 uv, vec2 p){
  vec2 q = p * u_scale;
  vec2 rr = vec2(1.0, 1.7320508), hh = rr * 0.5;
  vec2 a = mod(q, rr) - hh, b = mod(q - hh, rr) - hh;
  vec2 g = dot(a, a) < dot(b, b) ? a : b;
  vec2 id = q - g;
  float nz = gnoise(id * 0.15 + u_seed * 3.1 + drift(vec2(0.15, -0.1) * u_speed));
  float rad = 0.5 * u_size * (1.0 - u_pulse * 0.45 + u_pulse * 0.45 * sin(ang(u_speed * 1.5) + nz * 8.0));
  float d = length(g) / max(rad, 1e-3);
  float px = 1.5 / (uRes.y / u_scale) / max(rad, 1e-3);
  if (d > 1.0 + px) return vec4(u_gapc, 1.0);
  float z = sqrt(max(1.0 - d * d, 0.0));
  vec3 n = vec3(g / max(rad, 1e-3), z);
  vec3 L = normalize(vec3(-0.5, 0.6, 0.7));
  vec3 base = colorize(0.5 + nz * 0.9);
  vec3 c = base * (0.3 + 0.8 * max(dot(n, L), 0.0));
  c += pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 30.0) * u_gloss;
  return vec4(mix(u_gapc, clamp(c, 0.0, 1.0), smoothstep(1.0 + px, 1.0 - px, d)), 1.0);
}`,
    custom: true,
  },
  glyphs: {
    name: 'Glyphs', kind: 'gen', blurb: 'A raining matrix of tiny characters',
    colors: { ca: '#000000', cb: '#0f7a2c', cc: '#d8ffe0' },
    params: [
      { k: 'scale', l: 'Rows', min: 8, max: 80, s: 0.1, d: 28 },
      { k: 'rain', l: 'Rain', min: 0, max: 1, s: 0.001, d: 0.7 },
      { k: 'trail', l: 'Trail length', min: 0.05, max: 1, s: 0.001, d: 0.35 },
      { k: 'density', l: 'Density', min: 0.1, max: 1, s: 0.001, d: 0.85 },
      { k: 'flicker', l: 'Flicker', min: 0, max: 12, s: 0.01, d: 3 },
      SPEED(0.6, 3), SEED,
    ],
    glsl: `
float gen(vec2 uv, vec2 p){
  vec2 q = p * u_scale * vec2(1.0 / 0.72, 1.0);
  vec2 cell = floor(q), lc = fract(q);
  vec2 gp = floor(lc * vec2(7.0, 9.0)) - vec2(1.0, 1.0);
  if (gp.x < 0.0 || gp.x > 4.0 || gp.y < 0.0 || gp.y > 6.0) return 0.0;
  float ch = tstep(u_speed * u_flicker * (0.3 + hash12(cell + 5.0)), hash12(cell) * 50.0);
  float on = step(0.52, hash12(gp + cell * 7.13 + ch * 3.7 + u_seed));
  float present = step(hash12(cell + 91.0 + u_seed), u_density);
  float col = cell.x;
  float head = fract(-units(u_speed * (0.15 + 0.35 * hash12(vec2(col, 2.0 + u_seed))), 1.0) + hash12(vec2(col, 9.0)));
  float rows = u_scale;
  float yy = fract(cell.y / rows);
  float dist = fract(yy - head + 1.0);
  float br = mix(0.55, exp(-dist / max(u_trail, 0.01) * 3.0) + step(dist, 1.5 / rows) * 0.8, u_rain);
  return clamp(on * present * br, 0.0, 1.0);
}`,
  },
  meshgrad: {
    name: 'Mesh gradient', kind: 'gen', blurb: 'Four colors flowing into each other',
    palette: false,
    params: [
      { k: 'c1', l: 'Color 1', t: 'color', d: '#0d1b4d' },
      { k: 'c2', l: 'Color 2', t: 'color', d: '#6b3cff' },
      { k: 'c3', l: 'Color 3', t: 'color', d: '#ff6a88' },
      { k: 'c4', l: 'Color 4', t: 'color', d: '#ffd3a1' },
      { k: 'distort', l: 'Distortion', min: 0, max: 1.5, s: 0.001, d: 0.6 },
      { k: 'swirl', l: 'Swirl', min: -2, max: 2, s: 0.001, d: 0.4 },
      { k: 'soft', l: 'Softness', min: 0.3, max: 3, s: 0.001, d: 1.2 },
      { k: 'grain', l: 'Grain', min: 0, max: 1, s: 0.001, d: 0 },
      SPEED(0.35, 2), SEED,
    ],
    glsl: `
vec4 layerColor(vec2 uv, vec2 p){
  float asp = uRes.x / uRes.y;
  vec2 q = p;
  q += u_distort * 0.13 * vec2(sin(p.y * 3.1 + ang(u_speed * 0.9) + u_seed), cos(p.x * 2.7 + ang(u_speed * 0.7) - u_seed));
  float r = length(q), sa = u_swirl * 2.2 * exp(-r * r * 3.0);
  q = mat2(cos(sa), -sin(sa), sin(sa), cos(sa)) * q;
  vec3 col = vec3(0.0); float ws = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    vec2 base = vec2(cos(fi * 1.9 + u_seed * 0.7), sin(fi * 2.3 + u_seed * 1.3)) * vec2(0.34 * asp, 0.3);
    vec2 pt = base + vec2(0.22 * asp, 0.2) * vec2(sin(ang(u_speed * (0.6 + 0.17 * fi)) + fi * 2.0), cos(ang(u_speed * (0.5 + 0.13 * fi)) + fi * 1.3));
    float dd = length(q - pt);
    float w = exp(-dd * dd / (0.16 * u_soft)) + 1e-6;
    vec3 c = i == 0 ? u_c1 : (i == 1 ? u_c2 : (i == 2 ? u_c3 : u_c4));
    col += c * w; ws += w;
  }
  col /= ws;
  col += (hash12(floor(uv * uRes)) - 0.5) * u_grain * 0.22;
  return vec4(clamp(col, 0.0, 1.0), 1.0);
}`,
    custom: true,
  },
  graingrad: {
    name: 'Grain gradient', kind: 'gen', blurb: 'Soft shapes dissolved in print grain',
    colors: { ca: '#0f1636', cb: '#e2546e', cc: '#ffd6a0' },
    params: [
      { k: 'shape', l: 'Shape', t: 'select', o: ['Wave', 'Blob', 'Sphere', 'Ripple', 'Corners'], d: 0 },
      { k: 'scale', l: 'Scale', min: 0.3, max: 4, s: 0.001, d: 1 },
      { k: 'soft', l: 'Softness', min: 0, max: 1, s: 0.001, d: 0.55 },
      { k: 'grain', l: 'Grain', min: 0, max: 1, s: 0.001, d: 0.6 },
      { k: 'gsize', l: 'Grain size', min: 1, max: 5, s: 0.01, d: 1.4 },
      SPEED(0.3, 2), SEED,
    ],
    glsl: `
float gen(vec2 uv, vec2 p){
  vec2 q = p * u_scale;
  float v;
  if (u_shape < 0.5) {
    vec2 m = q + drift(vec2(0.35, 0.2) * u_speed);
    v = 0.5 + 0.5 * sin(m.x * 2.4 + sin(m.y * 3.0 + u_seed + drift(vec2(0.0, 0.5) * u_speed).y * 3.0) * 1.3);
    v = mix(v, 0.5 - q.y * 0.9, 0.45);
  } else if (u_shape < 1.5) {
    v = 0.5 + 1.5 * fbmx(q * 1.2 + u_seed + drift(vec2(0.22, 0.12) * u_speed), 3.0, 2.0, 0.5);
  } else if (u_shape < 2.5) {
    vec2 c = drift(vec2(0.06, 0.04) * u_speed);
    float d = length(q - c) / 0.38;
    float la = ang(u_speed * 1.6) + u_seed;
    vec3 L = normalize(vec3(cos(la), sin(la), 0.7));
    v = d < 1.0 ? 0.12 + 0.88 * max(dot(vec3((q - c) / 0.38, sqrt(1.0 - d * d)), L), 0.0) : 0.06 * exp(-(d - 1.0) * 4.0);
  } else if (u_shape < 3.5) {
    float r = length(q);
    v = 0.5 + 0.5 * sin(r * 11.0 - ang(u_speed * 2.0)) * exp(-r * 1.2);
    v = mix(v, 1.0 - r * 0.8, 0.3);
  } else {
    float asp = uRes.x / uRes.y;
    vec2 a = vec2(-0.5 * asp, 0.5) + drift(vec2(0.3, -0.2) * u_speed);
    vec2 b = vec2(0.5 * asp, -0.5) + drift(vec2(-0.25, 0.3) * u_speed);
    v = smoothstep(1.2, 0.0, length(q - a) / u_scale) * 0.9 + smoothstep(1.2, 0.0, length(q - b) / u_scale) * 0.45;
  }
  v = clamp((v - 0.5) / (u_soft * 0.9 + 0.1) * 0.5 + 0.5, 0.0, 1.0);
  float gs = max(1.0, u_gsize * PXS());
  float g = hash12(floor(uv * uRes / gs) + u_seed) - 0.5;
  g += gnoise(uv * uRes / (60.0 * PXS())) * 0.35;
  return clamp(v + g * u_grain * 0.55, 0.0, 1.0);
}`,
  },
  liqmetal: {
    name: 'Liquid metal', kind: 'gen', blurb: 'Flowing chrome with spectral edges',
    palette: false,
    params: [
      { k: 'scale', l: 'Scale', min: 0.3, max: 6, s: 0.001, d: 1.3 },
      { k: 'flow', l: 'Flow', min: 0, max: 3, s: 0.001, d: 1.2 },
      { k: 'bands', l: 'Reflections', min: 0.5, max: 10, s: 0.01, d: 2.6 },
      { k: 'disp', l: 'Dispersion', min: 0, max: 1, s: 0.001, d: 0.3 },
      { k: 'hard', l: 'Contrast', min: 0.5, max: 4, s: 0.001, d: 1.6 },
      { k: 'tint', l: 'Tint', t: 'color', d: '#9fb2d9' },
      { k: 'dark', l: 'Shadow', t: 'color', d: '#06070b' },
      SPEED(0.3, 2), SEED,
    ],
    glsl: `
float env(float x){
  float a = pow(0.5 + 0.5 * cos(TAU * x), u_hard);
  float b = pow(0.5 + 0.5 * cos(TAU * x * 2.0 + 1.3), 6.0) * 0.35;
  return clamp(a + b, 0.0, 1.0);
}
vec4 layerColor(vec2 uv, vec2 p){
  vec2 q = p * u_scale + u_seed;
  vec2 w = vec2(fbmx(q * 0.8 + drift(vec2(0.25, 0.1) * u_speed), 4.0, 2.0, 0.5), fbmx(q * 0.8 + 4.7 + drift(vec2(-0.1, 0.22) * u_speed), 4.0, 2.0, 0.5));
  float h = q.y * 0.6 + q.x * 0.25 + w.x * u_flow * 1.6 + fbmx(q * 1.7 + w * u_flow + drift(vec2(0.15, -0.12) * u_speed), 4.0, 2.0, 0.5) * u_flow;
  float x = h * u_bands, d = u_disp * 0.12;
  vec3 c = vec3(env(x - d), env(x), env(x + d));
  vec3 col = mix(u_dark, mix(u_tint, vec3(1.0), c * c), c);
  return vec4(clamp(col, 0.0, 1.0), 1.0);
}`,
    custom: true,
  },
  gemsmoke: {
    name: 'Gem smoke', kind: 'gen', blurb: 'Jewel-colored wisps curling in the dark',
    palette: false,
    params: [
      { k: 'scale', l: 'Scale', min: 0.3, max: 5, s: 0.001, d: 1.2 },
      { k: 'warp', l: 'Curl', min: 0, max: 4, s: 0.001, d: 2 },
      { k: 'wisps', l: 'Wispiness', min: 1, max: 10, s: 0.01, d: 4 },
      { k: 'hue', l: 'Hue', min: 0, max: 1, s: 0.001, d: 0.62 },
      { k: 'spread', l: 'Hue spread', min: 0, max: 1, s: 0.001, d: 0.35 },
      { k: 'glow', l: 'Brightness', min: 0.2, max: 3, s: 0.001, d: 1.2 },
      { k: 'bg', l: 'Background', t: 'color', d: '#040309' },
      SPEED(0.25, 2), SEED,
    ],
    glsl: `
vec4 layerColor(vec2 uv, vec2 p){
  vec2 q = p * u_scale * 1.8 + u_seed;
  vec2 w1 = vec2(fbmx(q + drift(vec2(0.2, 0.05) * u_speed), 4.0, 2.0, 0.5), fbmx(q + 3.1 + drift(vec2(-0.05, 0.18) * u_speed), 4.0, 2.0, 0.5));
  vec2 w2 = vec2(fbmx(q + w1 * u_warp + 1.7 + drift(vec2(0.1, -0.12) * u_speed), 4.0, 2.0, 0.5), fbmx(q + w1 * u_warp + 8.3, 4.0, 2.0, 0.5));
  float n = fbmx(q + w2 * u_warp, 5.0, 2.0, 0.5);
  float wisp = pow(1.0 - clamp(abs(n) * 2.4, 0.0, 1.0), u_wisps);
  float body = smoothstep(-0.25, 0.45, w2.x + w2.y * 0.5);
  float v = wisp * (0.35 + 0.65 * body);
  float h = u_hue + w1.x * u_spread + n * 0.25 * u_spread;
  vec3 c = vec3(hsv2rgb(vec3(fract(h - 0.03), 0.75, 1.0)).r, hsv2rgb(vec3(fract(h), 0.75, 1.0)).g, hsv2rgb(vec3(fract(h + 0.03), 0.75, 1.0)).b);
  vec3 col = u_bg + c * v * u_glow + pow(v, 3.0) * 0.5 * u_glow;
  return vec4(clamp(col, 0.0, 1.0), 1.0);
}`,
    custom: true,
  },
  neuro: {
    name: 'Neuro noise', kind: 'gen', blurb: 'Glowing, vein-like sine networks',
    colors: { ca: '#000000', cb: '#3348ff', cc: '#eef2ff' },
    params: [
      { k: 'scale', l: 'Scale', min: 1, max: 20, s: 0.01, d: 6 },
      { k: 'detail', l: 'Detail', min: 3, max: 15, s: 1, d: 12 },
      { k: 'bright', l: 'Brightness', min: 0.2, max: 3, s: 0.001, d: 1.1 },
      { k: 'sharp', l: 'Sharpness', min: 0.5, max: 8, s: 0.01, d: 3 },
      SPEED(0.5, 3), SEED,
    ],
    glsl: `
float gen(vec2 uv, vec2 p){
  vec2 q = p + u_seed * 0.13;
  vec2 acc = vec2(0.0), res = vec2(0.0);
  float sc = u_scale, tt = ang(u_speed);
  mat2 R = mat2(cos(1.07), -sin(1.07), sin(1.07), cos(1.07));
  for (int i = 0; i < 15; i++) {
    if (float(i) >= u_detail) break;
    q = R * q; acc = R * acc;
    vec2 L = q * sc + float(i) * 1.3 + acc - tt;
    acc += sin(L);
    res += (0.5 + 0.5 * cos(L)) / sc;
    sc *= 1.21;
  }
  float v = (res.x + res.y) * u_scale / 11.5;
  return pow(clamp(v * u_bright, 0.0, 1.0), u_sharp);
}`,
  },
  simplex: {
    name: 'Simplex noise', kind: 'gen', blurb: 'Smooth or stepped simplex contours',
    colors: { pal: 5 },
    params: [
      { k: 'scale', l: 'Scale', min: 0.3, max: 12, s: 0.01, d: 2 },
      { k: 'oct', l: 'Detail', min: 1, max: 6, s: 1, d: 3 },
      { k: 'steps', l: 'Color steps', min: 0, max: 16, s: 1, d: 6 },
      { k: 'soft', l: 'Step softness', min: 0, max: 1, s: 0.001, d: 0.15, show: p => p.steps > 1 },
      { k: 'warp', l: 'Warp', min: 0, max: 2, s: 0.001, d: 0.4 },
      SPEED(0.25, 2), SEED,
    ],
    glsl: `
float gen(vec2 uv, vec2 p){
  vec2 q = p * u_scale;
  vec2 w = vec2(snoise(q * 0.5 + drift(vec2(0.0, 0.18) * u_speed)), snoise(q * 0.5 + 5.2 + drift(vec2(0.16, 0.0) * u_speed)));
  q += w * u_warp + drift(vec2(0.2, 0.1) * u_speed);
  float n = 0.0, a = 0.5, tot = 0.0;
  for (int i = 0; i < 6; i++) {
    if (float(i) >= u_oct) break;
    n += a * snoise(q); tot += a;
    q = mat2(0.8, 0.6, -0.6, 0.8) * q * 2.02 + 1.7; a *= 0.5;
  }
  float v = clamp(0.5 + 0.55 * n / tot, 0.0, 1.0);
  if (u_steps > 1.0) {
    float x = v * u_steps, f = fract(x);
    v = (floor(x) + smoothstep(0.5 - u_soft * 0.5, 0.5 + u_soft * 0.5 + 1e-3, f)) / u_steps;
  }
  return v;
}`,
  },
  brushed: {
    name: 'Brushed metal', kind: 'gen', blurb: 'Fine directional grain with a moving sheen',
    palette: false,
    params: [
      { k: 'mode', l: 'Brushing', t: 'select', o: ['Straight', 'Circular'], d: 0 },
      { k: 'angle', l: 'Angle', min: 0, max: 180, s: 0.1, d: 0, show: p => p.mode == 0 },
      { k: 'scale', l: 'Grain density', min: 0.3, max: 6, s: 0.001, d: 1.5 },
      { k: 'rough', l: 'Roughness', min: 0, max: 1, s: 0.001, d: 0.55 },
      { k: 'sheen', l: 'Sheen', min: 0, max: 2, s: 0.001, d: 1 },
      { k: 'width', l: 'Sheen width', min: 0.05, max: 1, s: 0.001, d: 0.3 },
      { k: 'tint', l: 'Metal', t: 'color', d: '#c6cad1' },
      { k: 'dark', l: 'Shadow', t: 'color', d: '#34373e' },
      SPEED(0.25, 2), SEED,
    ],
    glsl: `
vec4 layerColor(vec2 uv, vec2 p){
  float along, across, s;
  if (u_mode < 0.5) {
    float a = radians(u_angle); vec2 r = mat2(cos(a), -sin(a), sin(a), cos(a)) * p;
    along = r.x; across = r.y;
    float pos = sin(ang1(u_speed) + u_seed) * 0.45;
    s = exp(-pow((r.x * 0.35 + r.y - pos) / u_width, 2.0));
  } else {
    float rr = length(p), aa = atan(p.y, p.x);
    along = aa * max(rr, 0.02); across = rr;
    s = pow(abs(cos(aa - ang1(u_speed) - u_seed)), 1.0 / max(u_width * 0.12, 0.01)) * smoothstep(0.0, 0.08, rr);
  }
  float streak = fbmx(vec2(along * 1.5 * u_scale, across * 260.0 * u_scale) + u_seed, 3.0, 2.0, 0.5);
  float fine = gnoise(vec2(along * 5.0 * u_scale, across * 900.0 * u_scale) + 3.0);
  float g = clamp(0.5 + streak * 0.9 + fine * 0.45 * u_rough, 0.0, 1.0);
  vec3 base = mix(u_dark, u_tint, 0.62 + (g - 0.5) * 0.7 * (0.4 + u_rough));
  vec3 col = base + s * u_sheen * 0.45 * (0.65 + 0.5 * g) * mix(u_tint, vec3(1.0), 0.6);
  return vec4(clamp(col, 0.0, 1.0), 1.0);
}`,
    custom: true,
  },
  wood: {
    name: 'Wood grain', kind: 'gen', blurb: 'Growth rings, fibers and knots',
    palette: false,
    params: [
      { k: 'scale', l: 'Scale', min: 0.3, max: 5, s: 0.001, d: 1.2 },
      { k: 'rings', l: 'Rings', min: 2, max: 40, s: 0.01, d: 14 },
      { k: 'warp', l: 'Waviness', min: 0, max: 2, s: 0.001, d: 0.7 },
      { k: 'knots', l: 'Knots', min: 0, max: 1, s: 0.001, d: 0.35 },
      { k: 'fiber', l: 'Fibers', min: 0, max: 1, s: 0.001, d: 0.6 },
      { k: 'light', l: 'Light wood', t: 'color', d: '#d7a468' },
      { k: 'dark', l: 'Dark wood', t: 'color', d: '#6f4221' },
      SPEED(0, 1), SEED,
    ],
    glsl: `
vec4 layerColor(vec2 uv, vec2 p){
  vec2 q = p * u_scale + vec2(u_seed * 3.1, u_seed * 1.3) + drift(vec2(0.2, 0.0) * u_speed);
  float y = q.y * 2.0 + fbmx(q * vec2(0.5, 2.0), 4.0, 2.0, 0.5) * u_warp * 1.4;
  vec2 kc = floor(q * vec2(0.7, 1.4));
  float knot = 0.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 c = kc + vec2(float(i), float(j));
    float h = hash12(c + u_seed * 5.0);
    if (h < u_knots * 0.35) {
      vec2 ctr = (c + 0.25 + hash22(c) * 0.5) / vec2(0.7, 1.4);
      vec2 d = (q - ctr) * vec2(1.0, 2.2);
      float kd = length(d);
      y += 0.35 * exp(-kd * 5.0) * sign(q.y - ctr.y + 1e-4) * 2.0;
      knot = max(knot, smoothstep(0.12, 0.0, kd));
    }
  }
  float v = 0.5 + 0.5 * sin(y * u_rings);
  v = pow(v, 0.55);
  float fine = gnoise(vec2(q.x * 6.0, y * 90.0));
  vec3 col = mix(u_dark, u_light, v * 0.85 + 0.15 * (fbmx(q * vec2(0.3, 6.0), 3.0, 2.0, 0.5) + 0.5));
  col *= 1.0 + fine * u_fiber * 0.16;
  col = mix(col, u_dark * 0.55, knot * 0.8);
  return vec4(clamp(col, 0.0, 1.0), 1.0);
}`,
    custom: true,
  },
  stone: {
    name: 'Marble stone', kind: 'gen', blurb: 'Polished stone with fine veining',
    palette: false,
    params: [
      { k: 'scale', l: 'Scale', min: 0.3, max: 5, s: 0.001, d: 1 },
      { k: 'veins', l: 'Veins', min: 0.3, max: 10, s: 0.01, d: 1.1 },
      { k: 'sharp', l: 'Vein fineness', min: 1, max: 60, s: 0.1, d: 22 },
      { k: 'turb', l: 'Turbulence', min: 0, max: 3, s: 0.001, d: 1.4 },
      { k: 'base', l: 'Stone', t: 'color', d: '#ece8e1' },
      { k: 'vein', l: 'Vein', t: 'color', d: '#3a3c44' },
      { k: 'accent', l: 'Accent', t: 'color', d: '#b8995f' },
      { k: 'acc', l: 'Accent amount', min: 0, max: 1, s: 0.001, d: 0.3 },
      SPEED(0, 1), SEED,
    ],
    glsl: `
vec4 layerColor(vec2 uv, vec2 p){
  vec2 q = p * u_scale + u_seed * 1.7 + drift(vec2(0.1, 0.06) * u_speed);
  float w = fbmx(q * 1.1, 6.0, 2.0, 0.5) * u_turb;
  float x = (q.x + q.y * 0.4) * u_veins + w * 3.5;
  float s1 = 1.0 - abs(sin(x));
  float v1 = pow(s1, u_sharp) + pow(s1, u_sharp * 0.12) * 0.22;
  float v2 = pow(1.0 - abs(sin(x * 3.1 + fbmx(q * 2.6 + 4.0, 5.0, 2.0, 0.5) * 5.0)), u_sharp * 4.0) * 0.45 * smoothstep(0.2, 0.6, fbmx(q * 0.9 + 21.0, 3.0, 2.0, 0.5) + 0.5);
  float cloud = fbmx(q * 2.5 + 9.0, 5.0, 2.0, 0.5) + 0.5;
  vec3 col = u_base * (0.86 + 0.2 * cloud);
  col = mix(col, u_accent, u_acc * smoothstep(0.5, 0.85, fbmx(q * 1.2 + 13.0, 4.0, 2.0, 0.5) + 0.5) * 0.7);
  col = mix(col, u_vein, clamp(v1 * 0.85 + v2, 0.0, 1.0));
  return vec4(clamp(col, 0.0, 1.0), 1.0);
}`,
    custom: true,
  },
  terrazzo: {
    name: 'Terrazzo', kind: 'gen', blurb: 'Stone chips set in a pale ground',
    palette: false,
    params: [
      { k: 'scale', l: 'Scale', min: 4, max: 60, s: 0.01, d: 14 },
      { k: 'density', l: 'Chip density', min: 0, max: 1, s: 0.001, d: 0.55 },
      { k: 'chip', l: 'Chip size', min: 0.1, max: 1, s: 0.001, d: 0.65 },
      { k: 'speck', l: 'Specks', min: 0, max: 1, s: 0.001, d: 0.5 },
      { k: 'base', l: 'Ground', t: 'color', d: '#ece6dc' },
      { k: 'c1', l: 'Chip 1', t: 'color', d: '#d9643a' },
      { k: 'c2', l: 'Chip 2', t: 'color', d: '#2f5d62' },
      { k: 'c3', l: 'Chip 3', t: 'color', d: '#e8b04a' },
      { k: 'c4', l: 'Chip 4', t: 'color', d: '#1f1f24' },
      SEED,
    ],
    glsl: `
vec4 layerColor(vec2 uv, vec2 p){
  vec2 x = p * u_scale, i = floor(x), f = fract(x);
  float d1 = 8.0, d2 = 8.0; vec2 id = vec2(0.0);
  for (int yy = -1; yy <= 1; yy++) for (int xx = -1; xx <= 1; xx++) {
    vec2 g = vec2(float(xx), float(yy));
    vec2 rr = g + hash22(i + g + u_seed * 7.3) - f; float d = dot(rr, rr);
    if (d < d1) { d2 = d1; d1 = d; id = i + g; } else if (d < d2) d2 = d;
  }
  float edge = sqrt(d2) - sqrt(d1);
  vec3 col = u_base * (0.95 + 0.08 * fbmx(p * 6.0 + u_seed, 3.0, 2.0, 0.5));
  float h = hash12(id + u_seed * 2.1);
  float aa = 1.5 * u_scale / uRes.y;
  float inside = smoothstep((1.0 - u_chip) * 0.5 - aa, (1.0 - u_chip) * 0.5 + aa, edge);
  if (h < u_density) {
    float k = hash12(id * 1.7 + 4.0);
    vec3 cc = k < 0.25 ? u_c1 : (k < 0.5 ? u_c2 : (k < 0.75 ? u_c3 : u_c4));
    cc *= 0.9 + 0.2 * hash12(id + 9.0);
    col = mix(col, cc, inside);
  }
  float sp = step(1.0 - u_speck * 0.06, hash12(floor(uv * uRes / max(1.0, 2.0 * PXS())) + u_seed));
  col = mix(col, u_c4 * 0.8 + 0.05, sp * 0.8);
  return vec4(clamp(col, 0.0, 1.0), 1.0);
}`,
    custom: true,
  },
  holo: {
    name: 'Holographic foil', kind: 'gen', blurb: 'Crinkled rainbow foil with glints',
    palette: false,
    params: [
      { k: 'scale', l: 'Scale', min: 0.5, max: 8, s: 0.001, d: 2 },
      { k: 'crinkle', l: 'Crinkle', min: 0, max: 2, s: 0.001, d: 1.3 },
      { k: 'bands', l: 'Rainbow bands', min: 0.3, max: 6, s: 0.001, d: 1.1 },
      { k: 'sat', l: 'Saturation', min: 0, max: 1, s: 0.001, d: 0.5 },
      { k: 'sparkle', l: 'Glints', min: 0, max: 1, s: 0.001, d: 0.45 },
      SPEED(0.3, 2), SEED,
    ],
    glsl: `
vec4 layerColor(vec2 uv, vec2 p){
  vec2 q = p * u_scale + u_seed;
  float n = fbmx(q, 5.0, 2.0, 0.5) * u_crinkle;
  float n2 = fbmx(q * 2.3 + 5.0, 4.0, 2.0, 0.5) * u_crinkle;
  float h = (p.x * 0.7 + p.y * 0.5) * u_bands + n * 1.6 + n2 * 0.6 + units(u_speed * 0.3, 1.0);
  vec3 rb = 0.5 + 0.5 * cos(TAU * (h + vec3(0.0, 0.33, 0.67)));
  float e = 0.01;
  vec2 g = vec2(fbmx(q + vec2(e, 0.0), 5.0, 2.0, 0.5) - fbmx(q - vec2(e, 0.0), 5.0, 2.0, 0.5), fbmx(q + vec2(0.0, e), 5.0, 2.0, 0.5) - fbmx(q - vec2(0.0, e), 5.0, 2.0, 0.5)) / (2.0 * e) * u_crinkle;
  vec3 nrm = normalize(vec3(-g * 0.35, 1.0));
  float lit = dot(nrm, normalize(vec3(-0.4, 0.5, 0.75)));
  vec3 col = mix(vec3(0.82, 0.84, 0.88), rb, u_sat) * (0.55 + 0.55 * lit);
  col += pow(max(dot(reflect(-normalize(vec3(-0.4, 0.5, 0.75)), nrm), vec3(0.0, 0.0, 1.0)), 0.0), 18.0) * 0.55;
  vec2 cell = floor(uv * uRes / max(1.0, 3.0 * PXS()));
  float gl = step(1.0 - u_sparkle * 0.02, hash12(cell + u_seed));
  col += gl * (0.5 + 0.5 * sin(ang(u_speed * 6.0) + hash12(cell * 3.1) * 40.0)) * 1.2;
  return vec4(clamp(col, 0.0, 1.0), 1.0);
}`,
    custom: true,
  },
  satin: {
    name: 'Satin', kind: 'gen', blurb: 'Draped fabric catching a soft sheen',
    palette: false,
    params: [
      { k: 'folds', l: 'Folds', min: 0.5, max: 8, s: 0.01, d: 2.4 },
      { k: 'angle', l: 'Drape angle', min: 0, max: 180, s: 0.1, d: 20 },
      { k: 'flow', l: 'Rumple', min: 0, max: 2, s: 0.001, d: 0.9 },
      { k: 'sheen', l: 'Sheen', min: 0, max: 2, s: 0.001, d: 1.3 },
      { k: 'tight', l: 'Sheen tightness', min: 2, max: 60, s: 0.1, d: 7 },
      { k: 'color', l: 'Fabric', t: 'color', d: '#7a1f3d' },
      { k: 'shade', l: 'Shadow', t: 'color', d: '#12050b' },
      SPEED(0.3, 2), SEED,
    ],
    glsl: `
float satH(vec2 p){
  float a = radians(u_angle); vec2 r = mat2(cos(a), -sin(a), sin(a), cos(a)) * p;
  return sin(r.x * u_folds * 5.0 + fbmx(r * 0.8 + u_seed + drift(vec2(0.15, 0.08) * u_speed), 3.0, 2.0, 0.5) * u_flow * 1.6) * 0.5
       + fbmx(r * 1.6 + 7.0 + drift(vec2(-0.1, 0.12) * u_speed), 3.0, 2.0, 0.5) * u_flow * 0.25;
}
vec4 layerColor(vec2 uv, vec2 p){
  float e = 0.004, h = satH(p);
  vec2 g = vec2(satH(p + vec2(e, 0.0)) - h, satH(p + vec2(0.0, e)) - h) / e;
  vec3 n = normalize(vec3(-g * 0.12, 1.0));
  vec3 L = normalize(vec3(-0.4, 0.6, 0.7));
  float dif = max(dot(n, L), 0.0);
  float sp = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), u_tight);
  vec3 col = mix(u_shade, u_color, 0.12 + 0.95 * dif) + sp * u_sheen * mix(u_color, vec3(1.0), 0.55);
  return vec4(clamp(col, 0.0, 1.0), 1.0);
}`,
    custom: true,
  },
  concrete: {
    name: 'Concrete', kind: 'gen', blurb: 'Poured cement with pores and stains',
    palette: false,
    params: [
      { k: 'scale', l: 'Scale', min: 0.5, max: 8, s: 0.001, d: 2 },
      { k: 'rough', l: 'Roughness', min: 0, max: 1, s: 0.001, d: 0.6 },
      { k: 'pores', l: 'Pores', min: 0, max: 1, s: 0.001, d: 0.45 },
      { k: 'stains', l: 'Stains', min: 0, max: 1, s: 0.001, d: 0.35 },
      { k: 'color', l: 'Cement', t: 'color', d: '#a8a59f' },
      SEED,
    ],
    glsl: `
vec4 layerColor(vec2 uv, vec2 p){
  vec2 q = p * u_scale + u_seed * 2.3;
  float base = fbmx(q * 3.0, 6.0, 2.1, 0.55);
  float fine = hash12(floor(uv * uRes / max(1.0, PXS()))) - 0.5;
  vec2 x = q * 18.0, i = floor(x), f = fract(x);
  float pit = 0.0;
  for (int yy = -1; yy <= 1; yy++) for (int xx = -1; xx <= 1; xx++) {
    vec2 g = vec2(float(xx), float(yy)), c = i + g;
    float h = hash12(c + u_seed);
    if (h < u_pores * 0.22) {
      float r = 0.08 + 0.18 * hash12(c * 1.9);
      pit = max(pit, smoothstep(r, r * 0.4, length(g + hash22(c) - f)));
    }
  }
  float st = smoothstep(0.1, 0.6, fbmx(q * 0.6 + 11.0, 4.0, 2.0, 0.5) + 0.3) * u_stains;
  vec3 col = u_color * (0.9 + base * 0.35 * u_rough + fine * 0.12 * u_rough);
  col *= 1.0 - st * 0.35;
  col = mix(col, u_color * 0.35, pit);
  return vec4(clamp(col, 0.0, 1.0), 1.0);
}`,
    custom: true,
  },
  goldleaf: {
    name: 'Gold leaf', kind: 'gen', blurb: 'Crackled metal flakes over a dark ground',
    palette: false,
    params: [
      { k: 'scale', l: 'Flake size', min: 2, max: 40, s: 0.01, d: 8 },
      { k: 'cracks', l: 'Cracks', min: 0, max: 1, s: 0.001, d: 0.45 },
      { k: 'vary', l: 'Variation', min: 0, max: 1, s: 0.001, d: 0.5 },
      { k: 'sheen', l: 'Sheen', min: 0, max: 2, s: 0.001, d: 1 },
      { k: 'gold', l: 'Leaf', t: 'color', d: '#d4a843' },
      { k: 'base', l: 'Ground', t: 'color', d: '#2a1d16' },
      SPEED(0.25, 2), SEED,
    ],
    glsl: `
vec4 layerColor(vec2 uv, vec2 p){
  vec2 x = p * u_scale, i = floor(x), f = fract(x);
  float d1 = 8.0, d2 = 8.0; vec2 id = vec2(0.0);
  for (int yy = -1; yy <= 1; yy++) for (int xx = -1; xx <= 1; xx++) {
    vec2 g = vec2(float(xx), float(yy));
    vec2 rr = g + hash22(i + g + u_seed * 3.3) - f; float d = dot(rr, rr);
    if (d < d1) { d2 = d1; d1 = d; id = i + g; } else if (d < d2) d2 = d;
  }
  float edge = sqrt(d2) - sqrt(d1);
  float tilt = hash12(id + u_seed) - 0.5;
  float pos = sin(ang1(u_speed) + u_seed) * 0.6;
  float s = exp(-pow((p.x * 0.6 + p.y * 0.4 - pos + tilt * 0.5 * u_vary) / 0.28, 2.0));
  vec3 leaf = u_gold * (0.7 + 0.6 * tilt * u_vary + 0.15 * fbmx(p * 20.0, 3.0, 2.0, 0.5));
  leaf += s * u_sheen * vec3(1.0, 0.92, 0.7) * 0.55;
  float aa = 1.5 * u_scale / uRes.y;
  float crack = 1.0 - smoothstep(u_cracks * 0.05, u_cracks * 0.05 + aa, edge);
  float missing = step(hash12(id * 2.7 + u_seed), u_cracks * 0.12);
  vec3 col = mix(leaf, u_base, max(crack, missing));
  return vec4(clamp(col, 0.0, 1.0), 1.0);
}`,
    custom: true,
  },
  blobs: {
    name: 'Chrome blobs', kind: 'gen', blurb: 'Liquid metal droplets merging and splitting',
    palette: false,
    params: [
      { k: 'count', l: 'Blobs', min: 2, max: 8, s: 1, d: 5 },
      { k: 'size', l: 'Size', min: 0.05, max: 0.4, s: 0.001, d: 0.17 },
      { k: 'bands', l: 'Reflections', min: 0.5, max: 6, s: 0.01, d: 1.6 },
      { k: 'hard', l: 'Contrast', min: 0.5, max: 4, s: 0.001, d: 1.6 },
      { k: 'disp', l: 'Dispersion', min: 0, max: 1, s: 0.001, d: 0.25 },
      { k: 'tint', l: 'Tint', t: 'color', d: '#a9bbdf' },
      { k: 'bg', l: 'Background', t: 'color', d: '#07080c' },
      SPEED(0.4, 2), SEED,
    ],
    glsl: `
float benv(float x){ return clamp(pow(0.5 + 0.5 * cos(TAU * x), u_hard) + pow(0.5 + 0.5 * cos(TAU * x * 2.0 + 1.3), 6.0) * 0.3, 0.0, 1.0); }
vec4 layerColor(vec2 uv, vec2 p){
  float asp = uRes.x / uRes.y;
  float f = 0.0; vec2 g = vec2(0.0);
  for (int i = 0; i < 8; i++) {
    if (float(i) >= u_count) break;
    float fi = float(i) + u_seed * 0.37;
    vec2 c = vec2(sin(ang(u_speed * (0.5 + 0.13 * float(i))) + fi * 1.7) * 0.33 * asp, cos(ang(u_speed * (0.4 + 0.11 * float(i))) + fi * 2.3) * 0.3);
    vec2 d = p - c;
    float r2 = u_size * u_size * (0.7 + 0.6 * hash12(vec2(fi, 3.0)));
    float q = dot(d, d) + 1e-4;
    f += r2 / q;
    g += -2.0 * r2 * d / (q * q);
  }
  float aa = 0.06;
  float m = smoothstep(1.0 - aa, 1.0 + aa, f);
  vec3 n = normalize(vec3(-g / (f * f + 1e-4) * 0.16, 1.0));
  float x = (n.y * 0.8 + n.x * 0.3) * u_bands, dd = u_disp * 0.1;
  vec3 e = vec3(benv(x - dd), benv(x), benv(x + dd));
  vec3 metal = mix(u_bg, mix(u_tint, vec3(1.0), e * e), e) * (0.55 + 0.45 * n.z);
  vec3 col = mix(u_bg + u_tint * 0.06 * smoothstep(0.3, 1.0, f), metal, m);
  return vec4(clamp(col, 0.0, 1.0), 1.0);
}`,
    custom: true,
  },
  rust: {
    name: 'Rust and patina', kind: 'gen', blurb: 'Weathered steel eaten by rust and verdigris',
    palette: false,
    params: [
      { k: 'scale', l: 'Scale', min: 0.5, max: 6, s: 0.001, d: 1.6 },
      { k: 'amount', l: 'Rust', min: 0, max: 1, s: 0.001, d: 0.55 },
      { k: 'pitting', l: 'Pitting', min: 0, max: 1, s: 0.001, d: 0.5 },
      { k: 'pat', l: 'Patina', min: 0, max: 1, s: 0.001, d: 0.25 },
      { k: 'metal', l: 'Metal', t: 'color', d: '#8a8d93' },
      { k: 'rustc', l: 'Rust color', t: 'color', d: '#8c3b17' },
      { k: 'patc', l: 'Patina color', t: 'color', d: '#3f8f7a' },
      SEED,
    ],
    glsl: `
vec4 layerColor(vec2 uv, vec2 p){
  vec2 q = p * u_scale + u_seed * 1.9;
  float m = fbmx(q * 1.5, 6.0, 2.0, 0.55) + 0.5;
  float edge = 1.0 - u_amount;
  float rmask = smoothstep(edge - 0.06, edge + 0.06, m);
  vec3 metal = u_metal * (0.85 + 0.2 * gnoise(vec2(q.x * 3.0, q.y * 200.0)) + 0.1 * fbmx(q * 8.0, 3.0, 2.0, 0.5));
  float rv = fbmx(q * 5.0 + 3.0, 5.0, 2.0, 0.5) + 0.5;
  vec3 rust = mix(u_rustc * 0.55, mix(u_rustc, vec3(0.85, 0.5, 0.2), 0.35), rv);
  float pits = step(1.0 - u_pitting * 0.12, hash12(floor(uv * uRes / max(1.0, 2.0 * PXS())) + u_seed)) * rmask;
  rust *= 1.0 - pits * 0.6 + (hash12(floor(uv * uRes)) - 0.5) * 0.15;
  vec3 col = mix(metal, rust, rmask);
  float pm = smoothstep(0.62, 0.75, fbmx(q * 1.1 + 17.0, 4.0, 2.0, 0.5) + 0.5) * u_pat;
  col = mix(col, u_patc * (0.8 + 0.3 * rv), pm);
  col = mix(col, col * 0.7, smoothstep(0.0, 0.05, abs(m - edge)) < 0.5 ? 0.3 * u_amount : 0.0);
  return vec4(clamp(col, 0.0, 1.0), 1.0);
}`,
    custom: true,
  },
  object3d: {
    name: '3D object', kind: 'gen', blurb: 'A lit, rotatable shape or your own model',
    palette: false, render3d: true, media: true,
    params: [
      { k: 'shape', l: 'Shape', t: 'select', o: ['Sphere', 'Cube', 'Torus', 'Torus knot', 'Icosahedron', 'Octahedron', 'Cylinder', 'Cone', 'Blob'], d: 3, show: p => p.shape != 9 },
      { k: 'lastShape', l: 'Last shape', min: 0, max: 8, s: 1, d: 3, show: () => false, nokf: true, r: [0, 0] },
      { k: 'anim', l: 'Play model animation', t: 'bool', d: 1, show: () => false },
      { k: 'clip', l: 'Animation clip', min: 0, max: 99, s: 1, d: 0, show: () => false, nokf: true, r: [0, 0] },
      { k: 'arep', l: 'Plays per loop', min: 1, max: 12, s: 1, d: 1, show: () => false, nokf: true, r: [1, 1] },
      { k: 'mat', l: 'Material', t: 'select', o: ['Clay', 'Glossy', 'Chrome (reflects layers below)', 'Glass (bends layers below)', 'Wrapped in layers below', 'Iridescent', 'Wireframe'], d: 2 },
      { k: 'color', l: 'Color', t: 'color', d: '#e8e4dc' },
      { k: 'size', l: 'Size', min: 0.1, max: 2.5, s: 0.001, d: 1 },
      { k: 'x', l: 'Position X', min: -1, max: 1, s: 0.001, d: 0, r: [0, 0] },
      { k: 'y', l: 'Position Y', min: -1, max: 1, s: 0.001, d: 0, r: [0, 0] },
      { k: 'rotX', l: 'Tilt', min: -180, max: 180, s: 0.1, d: 20 },
      { k: 'rotY', l: 'Turn', min: -180, max: 180, s: 0.1, d: 30 },
      { k: 'rotZ', l: 'Roll', min: -180, max: 180, s: 0.1, d: 0 },
      { k: 'motion', l: 'Motion', t: 'select', o: ['None', 'Turntable', 'Tumble', 'Flip', 'Pendulum', 'Float', 'Orbit', 'Spin and bob'], d: 1 },
      { k: 'cycles', l: 'Cycles per loop', min: 1, max: 4, s: 1, d: 1, show: p => p.motion > 0 },
      { k: 'spinX', l: 'Extra tilt spin', min: -2, max: 2, s: 0.01, d: 0, r: [0, 0] },
      { k: 'spinY', l: 'Extra turn spin', min: -2, max: 2, s: 0.01, d: 0, r: [0, 0] },
      { k: 'spinZ', l: 'Extra roll spin', min: -2, max: 2, s: 0.01, d: 0, r: [0, 0] },
      { k: 'wobble', l: 'Wobble', min: 0, max: 1, s: 0.001, d: 0, r: [0, 0.4] },
      { k: 'wscale', l: 'Wobble scale', min: 0.5, max: 8, s: 0.01, d: 2.5, show: p => p.wobble > 0 || p.shape == 8 },
      { k: 'light', l: 'Light angle', min: 0, max: 360, s: 0.1, d: 135 },
      { k: 'shine', l: 'Shine', min: 0, max: 2, s: 0.001, d: 0.8 },
      { k: 'rim', l: 'Rim light', min: 0, max: 2, s: 0.001, d: 0.6 },
      { k: 'ior', l: 'Refraction', min: 0, max: 1, s: 0.001, d: 0.45, show: p => p.mat == 3 },
      { k: 'repeat', l: 'Texture repeat', min: 0.5, max: 8, s: 0.01, d: 1, show: p => p.mat == 4 },
      { k: 'shadow', l: 'Shadow', min: 0, max: 1, s: 0.001, d: 0.35 },
    ],
    glsl: `uniform sampler2D u_obj;
vec4 layerColor(vec2 uv, vec2 p){
  vec4 o = texture2D(u_obj, uv);
  float sh = 0.0;
  if (u_shadow > 0.0) {
    for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++)
      sh += texture2D(u_obj, uv + vec2(0.012, 0.05) + vec2(float(i), float(j)) * vec2(0.022 * uRes.y / uRes.x, 0.022)).a;
    sh = sh / 9.0 * u_shadow * 0.7;
  }
  float a = o.a + sh * (1.0 - o.a);
  return vec4(a > 0.0 ? o.rgb * o.a / a : vec3(0.0), a);
}`,
    custom: true,
  },
  studio: {
    name: 'Studio gradient', kind: 'gen', blurb: 'Silk, stripe, wave, liquid, paper, flow and dune gradients',
    palette: false,
    params: [
      { k: 'style', l: 'Style', t: 'select', o: ['Silk', 'Stripe', 'Wave', 'Liquid', 'Paper', 'Flow', 'Dune'], d: 0 },
      { k: 'c1', l: 'Color 1', t: 'color', d: '#140c2e' },
      { k: 'c2', l: 'Color 2', t: 'color', d: '#6d2ff2' },
      { k: 'c3', l: 'Color 3', t: 'color', d: '#f0479b' },
      { k: 'c4', l: 'Color 4', t: 'color', d: '#ffc285' },
      { k: 'scale', l: 'Scale', min: 0.3, max: 4, s: 0.001, d: 1 },
      { k: 'angle', l: 'Angle', min: 0, max: 360, s: 0.1, d: 30 },
      { k: 'distort', l: 'Distortion', min: 0, max: 2, s: 0.001, d: 0.8 },
      { k: 'soft', l: 'Softness', min: 0, max: 1, s: 0.001, d: 0.6 },
      { k: 'sheen', l: 'Sheen', min: 0, max: 1.5, s: 0.001, d: 0.6 },
      { k: 'grain', l: 'Grain', min: 0, max: 1, s: 0.001, d: 0.12 },
      SPEED(0.3, 2), SEED,
    ],
    glsl: `
vec3 cAt(float i){ float k = mod(i, 4.0); return k < 0.5 ? u_c1 : (k < 1.5 ? u_c2 : (k < 2.5 ? u_c3 : u_c4)); }
vec3 ramp4(float t){
  float x = clamp(t, 0.0, 1.0) * 3.0;
  if (x < 1.0) return mix(u_c1, u_c2, smoothstep(0.0, 1.0, x));
  if (x < 2.0) return mix(u_c2, u_c3, smoothstep(0.0, 1.0, x - 1.0));
  return mix(u_c3, u_c4, smoothstep(0.0, 1.0, x - 2.0));
}
float silkH(vec2 q, float sp){
  float w = fbmx(q * 0.6 + drift(vec2(0.15, 0.08) * sp), 4.0, 2.0, 0.5) * u_distort;
  return sin(q.x * 5.0 + w * 3.4 + sin(q.y * 1.9 + ang(sp * 0.8)) * 1.6) * 0.5 + w * 0.2;
}
vec4 layerColor(vec2 uv, vec2 p){
  float a = radians(u_angle), sp = u_speed;
  vec2 q = mat2(cos(a), -sin(a), sin(a), cos(a)) * p * u_scale + u_seed * 0.37;
  float st = u_style;
  vec3 col;
  if (st < 0.5) {
    float e = 0.01, h = silkH(q, sp);
    vec2 g = vec2(silkH(q + vec2(e, 0.0), sp) - h, silkH(q + vec2(0.0, e), sp) - h) / e;
    vec3 n = normalize(vec3(-g * 0.3, 1.0)), L = normalize(vec3(-0.4, 0.6, 0.7));
    float dif = max(dot(n, L), 0.0);
    float spc = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 14.0 + (1.0 - u_soft) * 40.0);
    col = ramp4(0.5 + h * 0.75) * (0.5 + 0.62 * dif);
    col += spc * u_sheen * mix(col, vec3(1.0), 0.6) * 1.6;
  } else if (st < 1.5) {
    float v = q.y + sin(q.x * 1.1 + ang(sp * 0.6)) * 0.35 * u_distort + sin(q.x * 2.3 - ang(sp * 0.9) + 1.0) * 0.12 * u_distort
            + fbmx(q * 0.5 + drift(vec2(0.1, 0.05) * sp), 3.0, 2.0, 0.5) * 0.3 * u_distort;
    float k = v * 3.4, f = fract(k), id = floor(k);
    float e = smoothstep(1.0 - u_soft * 0.6 - 0.02, 1.0, f);
    col = mix(cAt(id), cAt(id + 1.0), e) * (0.88 + 0.12 * f);
    col += smoothstep(0.85, 1.0, f) * (1.0 - e) * u_sheen * 0.25;
  } else if (st < 2.5) {
    float y = q.y, s = 0.004 + u_soft * 0.06;
    col = u_c1;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float b = -0.32 + fi * 0.3 + 0.1 * sin(q.x * (1.3 + 0.45 * fi) + ang(sp * (0.5 + 0.2 * fi)) + fi * 1.7) * (0.4 + u_distort)
              + 0.05 * fbmx(vec2(q.x * 1.5, fi * 3.0) + drift(vec2(0.08, 0.0) * sp), 3.0, 2.0, 0.5);
      float m = smoothstep(b - s, b + s, y);
      col = mix(col, cAt(fi + 1.0), m);
      col *= 1.0 - 0.28 * exp(-max(y - b, 0.0) * 22.0) * m;
      col += u_sheen * 0.18 * exp(-abs(y - b) * 60.0) * m;
    }
  } else if (st < 3.5) {
    float asp = uRes.x / uRes.y, f = 0.0; vec2 g = vec2(0.0); vec3 bc = vec3(0.0); float bw = 0.0;
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      vec2 c = vec2(sin(ang(sp * (0.5 + 0.13 * fi)) + fi * 1.7 + u_seed) * 0.34 * asp, cos(ang(sp * (0.4 + 0.11 * fi)) + fi * 2.3) * 0.3) * u_scale;
      vec2 d = q - c;
      float r2 = 0.05 * (0.7 + 0.6 * hash12(vec2(fi, 7.0))) * (0.6 + u_distort * 0.5), dd = dot(d, d) + 1e-4;
      f += r2 / dd; g += -2.0 * r2 * d / (dd * dd);
      bc += cAt(mod(fi, 3.0) + 1.0) * r2 / dd; bw += r2 / dd;
    }
    float m = smoothstep(0.85 - u_soft * 0.3, 1.1, f);
    vec3 n = normalize(vec3(-g / (f * f + 1e-3) * 0.12, 1.0));
    vec3 blob = bc / bw * (0.7 + 0.35 * n.z) + pow(max(dot(reflect(vec3(0.45, -0.55, -0.7), n), vec3(0.0, 0.0, 1.0)), 0.0), 30.0) * u_sheen;
    col = mix(mix(u_c1, u_c3, clamp(0.5 - q.y * 0.6, 0.0, 1.0) * 0.22), blob, m);
  } else if (st < 4.5) {
    float asp = uRes.x / uRes.y;
    vec2 m = q + u_distort * 0.12 * vec2(sin(q.y * 3.1 + ang(sp * 0.9)), cos(q.x * 2.7 + ang(sp * 0.7)));
    vec3 acc = vec3(0.0); float ws = 0.0;
    for (int i = 0; i < 4; i++) {
      float fi = float(i);
      vec2 pt = vec2(cos(fi * 1.9 + u_seed), sin(fi * 2.3 + u_seed * 1.3)) * vec2(0.34 * asp, 0.3) + vec2(0.2, 0.18) * vec2(sin(ang(sp * (0.6 + 0.17 * fi)) + fi * 2.0), cos(ang(sp * (0.5 + 0.13 * fi)) + fi));
      float d = length(m - pt), w = exp(-d * d / (0.04 + u_soft * 0.12)) + 1e-6;
      acc += cAt(fi) * w; ws += w;
    }
    col = acc / ws;
    col *= 1.0 + gnoise(uv * uRes / (1.5 * PXS())) * 0.07 + gnoise(vec2(uv.x * 900.0, uv.y * 60.0)) * 0.035;
    col += (hash12(floor(uv * uRes / max(1.0, PXS())) + 3.0) - 0.5) * 0.08;
  } else if (st < 5.5) {
    vec2 x = q;
    for (int i = 0; i < 5; i++) {
      float an = fbmx(x * 0.7 + drift(vec2(0.12, 0.06) * sp) + 3.0, 3.0, 2.0, 0.5) * TAU * u_distort * 0.6;
      x += vec2(cos(an), sin(an)) * 0.18;
    }
    float t = 0.5 + 0.5 * sin(x.y * 3.0 + fbmx(x * 1.2 + 7.0, 3.0, 2.0, 0.5) * 2.0);
    t = mix(smoothstep(0.2, 0.8, t), t, u_soft);
    col = ramp4(t) + pow(t, 12.0) * u_sheen * 0.35;
  } else {
    vec2 m = q + drift(vec2(0.06, 0.0) * sp);
    float y = m.y + fbmx(m * vec2(0.6, 1.2) + 5.0, 4.0, 2.0, 0.5) * u_distort * 0.6;
    float k = y * 3.0, f = fract(k), id = floor(k);
    float crest = 0.7;
    float lit = mix(1.0, 0.32, smoothstep(crest - 0.03 - u_soft * 0.05, crest + 0.03 + u_soft * 0.05, f));
    lit = mix(lit, 1.0, smoothstep(0.93, 1.0, f));
    float h = f < crest ? f / crest : (1.0 - f) / (1.0 - crest);
    float rip = gnoise(vec2(m.x * 30.0, y * 90.0)) * 0.05;
    col = ramp4(clamp(0.15 + 0.6 * lit * (0.75 + 0.25 * h) + 0.12 * hash12(vec2(id, u_seed)) + rip, 0.0, 1.0));
    col += pow(h, 20.0) * u_sheen * 0.25 * step(f, crest);
  }
  col += (hash12(floor(uv * uRes) + u_seed) - 0.5) * u_grain * 0.25;
  return vec4(clamp(col, 0.0, 1.0), 1.0);
}`,
    custom: true,
  },
  solid: {
    name: 'Solid color', kind: 'gen', blurb: 'A flat fill to blend onto',
    palette: false,
    params: [{ k: 'color', l: 'Color', t: 'color', d: '#f2e3c6' }],
    glsl: `uniform vec3 u_color;
vec4 layerColor(vec2 uv, vec2 p){ return vec4(u_color, 1.0); }`,
    custom: true,
  },
  image: {
    name: 'Image', kind: 'gen', blurb: 'Your own picture, to run effects on',
    palette: false, image: true, media: true,
    params: [
      { k: 'fit', l: 'Fit', t: 'select', o: ['Cover', 'Contain', 'Stretch'], d: 0 },
      { k: 'zoom', l: 'Zoom', min: 0.2, max: 5, s: 0.01, d: 1 },
      { k: 'rot', l: 'Rotation', min: -180, max: 180, s: 0.1, d: 0 },
      { k: 'ox', l: 'Offset X', min: -1, max: 1, s: 0.001, d: 0 },
      { k: 'oy', l: 'Offset Y', min: -1, max: 1, s: 0.001, d: 0 },
    ],
    glsl: `uniform sampler2D u_tex; uniform vec2 u_texSize; uniform float u_has;
vec4 layerColor(vec2 uv, vec2 p){
  if (u_has < 0.5) return vec4(0.0);
  float ca = uRes.x / uRes.y, ia = u_texSize.x / max(u_texSize.y, 1.0);
  float a = radians(u_rot);
  vec2 q = mat2(cos(a), -sin(a), sin(a), cos(a)) * p / u_zoom - vec2(u_ox * ca, u_oy) * 0.5;
  vec2 t;
  if (u_fit < 0.5) t = ia > ca ? vec2(q.x / ia, q.y) : vec2(q.x / ca, q.y * ia / ca);
  else if (u_fit < 1.5) t = ia > ca ? vec2(q.x / ca, q.y * ia / ca) : vec2(q.x / ia, q.y);
  else t = vec2(q.x / ca, q.y);
  t += 0.5;
  if (t.x < 0.0 || t.y < 0.0 || t.x > 1.0 || t.y > 1.0) return vec4(0.0);
  return texture2D(u_tex, t);
}`,
    custom: true,
  },

  /* ===================== EFFECTS ===================== */
  transform: {
    name: 'Transform', kind: 'fx', blurb: 'Rotate, zoom, pan, scroll',
    params: [
      { k: 'rot', l: 'Rotation', min: -180, max: 180, s: 0.1, d: 0 },
      { k: 'zoom', l: 'Zoom', min: 0.1, max: 5, s: 0.01, d: 1 },
      { k: 'ox', l: 'Offset X', min: -1, max: 1, s: 0.001, d: 0 },
      { k: 'oy', l: 'Offset Y', min: -1, max: 1, s: 0.001, d: 0 },
      { k: 'sx', l: 'Scroll X', min: -1, max: 1, s: 0.001, d: 0, r: [0, 0] },
      { k: 'sy', l: 'Scroll Y', min: -1, max: 1, s: 0.001, d: 0, r: [0, 0] },
      { k: 'spin', l: 'Spin', min: -2, max: 2, s: 0.01, d: 0, r: [0, 0] },
      { k: 'wrap', l: 'Edges', t: 'select', o: ['Mirror', 'Repeat', 'Clamp'], d: 0 },
    ],
    glsl: `
vec3 fx(vec2 uv){
  float asp = uRes.x / uRes.y; vec2 p = (uv - 0.5) * vec2(asp, 1.0);
  float a = radians(u_rot) + ang(u_spin);
  p = mat2(cos(a), -sin(a), sin(a), cos(a)) * p / u_zoom; p.x /= asp;
  vec2 q = p + 0.5 - vec2(u_ox, u_oy) * 0.5 - vec2(units(u_sx * 0.2, 2.0), units(u_sy * 0.2, 2.0));
  if (u_wrap < 0.5) return S(q);
  if (u_wrap < 1.5) return texture2D(tPrev, fract(q)).rgb;
  return texture2D(tPrev, clamp(q, 0.0, 1.0)).rgb;
}`,
  },
  kaleido: {
    name: 'Kaleidoscope', kind: 'fx', blurb: 'Mirrored radial slices',
    params: [
      { k: 'seg', l: 'Segments', min: 2, max: 24, s: 1, d: 6 },
      { k: 'rot', l: 'Rotation', min: 0, max: 360, s: 1, d: 0 },
      { k: 'zoom', l: 'Zoom', min: 0.2, max: 3, s: 0.01, d: 1 },
      { k: 'spin', l: 'Spin', min: -2, max: 2, s: 0.01, d: 0, r: [-0.3, 0.3] },
    ],
    glsl: `
vec3 fx(vec2 uv){
  float asp = uRes.x / uRes.y; vec2 p = (uv - 0.5) * vec2(asp, 1.0);
  float r = length(p) / u_zoom, a = atan(p.y, p.x) + radians(u_rot) + ang(u_spin);
  float seg = TAU / u_seg; a = mod(a, seg); a = abs(a - seg * 0.5);
  vec2 q = vec2(cos(a), sin(a)) * r; q.x /= asp;
  return S(q + 0.5);
}`,
  },
  wave: {
    name: 'Wave warp', kind: 'fx', blurb: 'Sine ripples and water rings',
    params: [
      { k: 'amp', l: 'Amplitude', min: 0, max: 120, s: 0.1, d: 20 },
      { k: 'freq', l: 'Frequency', min: 0.5, max: 30, s: 0.01, d: 6 },
      { k: 'dir', l: 'Direction', t: 'select', o: ['Horizontal', 'Vertical', 'Both', 'Radial'], d: 0 },
      { k: 'speed', l: 'Speed', min: -3, max: 3, s: 0.01, d: 1, r: [-1.5, 1.5] },
    ],
    glsl: `
vec3 fx(vec2 uv){
  float asp = uRes.x / uRes.y; vec2 p = (uv - 0.5) * vec2(asp, 1.0);
  float A = u_amp / 1080.0; float t = ang(u_speed * 2.0);
  vec2 o = vec2(0.0);
  if (u_dir < 0.5) o.x = sin(p.y * u_freq * TAU + t) * A;
  else if (u_dir < 1.5) o.y = sin(p.x * u_freq * TAU + t) * A;
  else if (u_dir < 2.5) o = vec2(sin(p.y * u_freq * TAU + t), cos(p.x * u_freq * TAU + ang(u_speed * 2.2))) * A;
  else { float r = length(p); o = normalize(p + 1e-5) * sin(r * u_freq * TAU - t) * A; }
  o.x /= asp;
  return S(uv + o);
}`,
  },
  displace: {
    name: 'Liquify', kind: 'fx', blurb: 'Noise-driven displacement',
    params: [
      { k: 'amount', l: 'Amount', min: 0, max: 250, s: 0.1, d: 40 },
      { k: 'scale', l: 'Scale', min: 0.3, max: 12, s: 0.01, d: 3 },
      { k: 'oct', l: 'Detail', min: 1, max: 6, s: 1, d: 3 },
      SPEED(0.3), SEED,
    ],
    glsl: `
vec3 fx(vec2 uv){
  float asp = uRes.x / uRes.y; vec2 p = (uv - 0.5) * vec2(asp, 1.0) * u_scale;
  vec2 o = vec2(fbmx(p + drift(vec2(u_speed, 0.0)) + 3.1, u_oct, 2.0, 0.5), fbmx(p + drift(vec2(0.0, u_speed)) + 7.7, u_oct, 2.0, 0.5));
  o *= u_amount / 1080.0 * 2.0; o.x /= asp;
  return S(uv + o);
}`,
  },
  twirl: {
    name: 'Twirl', kind: 'fx', blurb: 'Swirl around a point',
    params: [
      { k: 'strength', l: 'Strength', min: -10, max: 10, s: 0.01, d: 3 },
      { k: 'radius', l: 'Radius', min: 0.05, max: 1.5, s: 0.001, d: 0.5 },
      { k: 'cx', l: 'Center X', min: -1, max: 1, s: 0.01, d: 0, r: [-0.3, 0.3] },
      { k: 'cy', l: 'Center Y', min: -1, max: 1, s: 0.01, d: 0, r: [-0.3, 0.3] },
      { k: 'speed', l: 'Sway', min: 0, max: 3, s: 0.01, d: 0, r: [0, 0.8] },
    ],
    glsl: `
vec3 fx(vec2 uv){
  float asp = uRes.x / uRes.y; vec2 c = vec2(u_cx * asp, u_cy) * 0.5;
  vec2 p = (uv - 0.5) * vec2(asp, 1.0) - c;
  float r = length(p); float f = max(0.0, 1.0 - r / u_radius); f = f * f * (3.0 - 2.0 * f);
  float a = f * (u_strength + sin(ang(u_speed)) * u_strength * 0.5);
  float s = sin(a), co = cos(a); p = mat2(co, -s, s, co) * p;
  p += c; p.x /= asp;
  return S(p + 0.5);
}`,
  },
  orb: {
    name: 'Orb', kind: 'fx', blurb: 'Wrap everything below onto a lit sphere',
    params: [
      { k: 'map', l: 'Mapping', t: 'select', o: ['Wrap around', 'Glass lens', 'Globe'], d: 0 },
      { k: 'size', l: 'Size', min: 0.1, max: 1.4, s: 0.001, d: 0.72 },
      { k: 'zoom', l: 'Texture zoom', min: 0.2, max: 4, s: 0.01, d: 1 },
      { k: 'spin', l: 'Spin', min: -2, max: 2, s: 0.01, d: 0.15, r: [-0.3, 0.3] },
      { k: 'tilt', l: 'Tilt', min: -90, max: 90, s: 0.1, d: 18 },
      { k: 'lens', l: 'Refraction', min: 0, max: 1, s: 0.001, d: 0.5, show: p => p.map == 1 },
      { k: 'shade', l: 'Shading', min: 0, max: 1, s: 0.001, d: 0.5 },
      { k: 'spec', l: 'Highlight', min: 0, max: 2, s: 0.001, d: 0.7 },
      { k: 'rim', l: 'Rim light', min: 0, max: 2, s: 0.001, d: 0.8 },
      { k: 'halo', l: 'Halo', min: 0, max: 1.5, s: 0.001, d: 0.35 },
      { k: 'fringe', l: 'Rim fringe', min: 0, max: 1, s: 0.001, d: 0 },
      { k: 'atmo', l: 'Atmosphere', min: 0, max: 1.5, s: 0.001, d: 0 },
      { k: 'atmoc', l: 'Air color', t: 'color', d: '#8fc7ff', show: p => p.atmo > 0 },
      { k: 'bg', l: 'Background', t: 'select', o: ['Solid color', 'Keep layers', 'Blurred layers'], d: 0 },
      { k: 'bgc', l: 'Color', t: 'color', d: '#060608', show: p => p.bg == 0 },
    ],
    glsl: `
vec3 orbBlur(vec2 uv, float r){ vec3 s = vec3(0.0); for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++) s += S(uv + vec2(float(i), float(j)) * r); return s / 25.0; }
vec3 fx(vec2 uv){
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(asp, 1.0);
  float R = u_size * 0.5, d = length(p) / R, aa = 1.5 / (uRes.y * R);
  vec3 avg = (S(vec2(0.3, 0.3)) + S(vec2(0.7, 0.35)) + S(vec2(0.4, 0.7)) + S(vec2(0.62, 0.6)) + S(vec2(0.5))) * 0.2;
  vec3 bg = u_bg < 0.5 ? u_bgc : (u_bg < 1.5 ? S(uv) : orbBlur(uv, 0.018 / max(asp, 1.0)));
  float od = max(d - 1.0, 0.0);
  vec3 outside = bg + avg * u_halo * exp(-od * 3.5) * 0.9 + u_atmoc * u_atmo * (exp(-od * 14.0) * 0.8 + exp(-od * 4.0) * 0.25);
  if (d > 1.0 + aa) return outside;
  vec2 sp = p / R;
  float z = sqrt(max(1.0 - dot(sp, sp), 0.0));
  float fres = pow(1.0 - z, 3.0);
  vec3 n0 = vec3(sp, z);
  vec2 tuv;
  if (u_map < 0.5 || u_map > 1.5) {
    float ti = radians(u_tilt), sa = ang(u_spin);
    vec3 n = vec3(n0.x, n0.y * cos(ti) - n0.z * sin(ti), n0.y * sin(ti) + n0.z * cos(ti));
    n = vec3(n.x * cos(sa) + n.z * sin(sa), n.y, -n.x * sin(sa) + n.z * cos(sa));
    vec2 st = u_map < 0.5 ? n.xy / (1.0 + abs(n.z)) : vec2(n.x / (1.0 + abs(n.z)), asin(clamp(n.y, -1.0, 1.0)) / (PI * 0.5));
    tuv = st * 0.5 / u_zoom / vec2(asp, 1.0) + 0.5;
  } else {
    float sa = ang(u_spin * 0.5);
    vec2 q = sp * R * mix(1.0, 0.3, u_lens * z);
    q = mat2(cos(sa), -sin(sa), sin(sa), cos(sa)) * q / u_zoom;
    tuv = q / vec2(asp, 1.0) + 0.5;
  }
  vec3 col;
  if (u_fringe > 0.0) {
    vec2 off = sp * u_fringe * (0.004 + 0.05 * fres) / vec2(asp, 1.0);
    col = vec3(S(tuv + off).r, S(tuv).g, S(tuv - off).b);
  } else col = S(tuv);
  vec3 L = normalize(vec3(-0.45, 0.55, 0.75));
  col *= mix(1.0, 0.22 + 0.95 * max(dot(n0, L), 0.0), u_shade);
  col = mix(col, u_atmoc, clamp(fres * u_atmo * 1.1 + pow(1.0 - z, 1.5) * u_atmo * 0.15, 0.0, 1.0));
  float spec = pow(max(dot(reflect(-L, n0), vec3(0.0, 0.0, 1.0)), 0.0), 48.0);
  vec3 rimc = mix(avg, vec3(1.0), 0.45);
  if (u_fringe > 0.0) rimc = mix(rimc, 0.5 + 0.5 * cos(TAU * (fres * 2.0 + atan(sp.y, sp.x) / TAU + vec3(0.0, 0.33, 0.67))), u_fringe * 0.7);
  col += spec * u_spec + fres * u_rim * rimc;
  return mix(outside, col, smoothstep(1.0 + aa, 1.0 - aa, d));
}`,
  },
  led: {
    name: 'LED wall', kind: 'fx', blurb: 'Rebuild the image from round LED dots',
    params: [
      { k: 'size', l: 'Cell size', min: 3, max: 60, s: 0.1, d: 12 },
      { k: 'round', l: 'Roundness', min: 0, max: 1, s: 0.001, d: 0.85 },
      { k: 'gap', l: 'Gap', min: 0, max: 0.8, s: 0.001, d: 0.25 },
      { k: 'glow', l: 'Bleed', min: 0, max: 1.5, s: 0.001, d: 0.5 },
      { k: 'levels', l: 'Color steps', min: 2, max: 32, s: 1, d: 32 },
    ],
    glsl: `
vec3 fx(vec2 uv){
  float cs = u_size * PXS();
  vec2 fc = uv * uRes, cell = floor(fc / cs), lc = fract(fc / cs) - 0.5;
  vec3 c = S((cell + 0.5) * cs / uRes);
  c = floor(c * (u_levels - 1.0) + 0.5) / (u_levels - 1.0);
  float r = 0.5 * (1.0 - u_gap);
  vec2 a = abs(lc);
  float box = max(a.x, a.y), circ = length(lc);
  float dd = mix(box, circ, u_round);
  float px = 1.0 / cs;
  float dotm = smoothstep(r + px, r - px, dd);
  float halo = exp(-max(dd - r, 0.0) * 9.0) * u_glow * 0.5;
  return c * (dotm + halo * (1.0 - dotm)) + vec3(0.025) * (1.0 - dotm);
}`,
  },
  glass: {
    name: 'Glass', kind: 'fx', blurb: 'Frosted, rippled or faceted glass',
    params: [
      { k: 'mode', l: 'Glass', t: 'select', o: ['Frosted', 'Rippled', 'Faceted'], d: 2 },
      { k: 'scale', l: 'Scale', min: 1, max: 60, s: 0.01, d: 9 },
      { k: 'strength', l: 'Refraction', min: 0, max: 1, s: 0.001, d: 0.5 },
      { k: 'chroma', l: 'Chroma', min: 0, max: 1, s: 0.001, d: 0.35 },
      { k: 'frost', l: 'Frost', min: 0, max: 1, s: 0.001, d: 0.25 },
      { k: 'shine', l: 'Edge shine', min: 0, max: 1, s: 0.001, d: 0.45 },
      SPEED(0.2, 2), SEED,
    ],
    glsl: `
vec3 fx(vec2 uv){
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(asp, 1.0), off = vec2(0.0);
  float hl = 0.0;
  if (u_mode < 0.5) {
    off = (hash22(floor(uv * uRes / max(1.0, PXS() * 1.5)) + u_seed) - 0.5) * 0.03 * u_strength;
    off += vec2(fbmx(p * u_scale * 0.4 + drift(vec2(0.1, 0.0) * u_speed), 3.0, 2.0, 0.5), fbmx(p * u_scale * 0.4 + 7.0, 3.0, 2.0, 0.5)) * 0.03 * u_strength;
  } else if (u_mode < 1.5) {
    vec2 q = p * u_scale;
    float e = 0.02;
    float h0 = sin(q.x * 1.3 + sin(q.y * 0.9 + ang(u_speed)) * 1.5) + gnoise(q * 0.6 + drift(vec2(0.2, 0.1) * u_speed)) * 1.5;
    float hx = sin((q.x + e) * 1.3 + sin(q.y * 0.9 + ang(u_speed)) * 1.5) + gnoise((q + vec2(e, 0.0)) * 0.6 + drift(vec2(0.2, 0.1) * u_speed)) * 1.5;
    float hy = sin(q.x * 1.3 + sin((q.y + e) * 0.9 + ang(u_speed)) * 1.5) + gnoise((q + vec2(0.0, e)) * 0.6 + drift(vec2(0.2, 0.1) * u_speed)) * 1.5;
    vec2 g = vec2(hx - h0, hy - h0) / e;
    off = g * 0.012 * u_strength / max(u_scale * 0.1, 0.3);
    hl = pow(max(g.x * 0.3 + g.y * 0.4, 0.0), 3.0) * 0.15;
  } else {
    vec2 x = p * u_scale, i = floor(x), f = fract(x);
    float d1 = 8.0, d2 = 8.0; vec2 id = vec2(0.0);
    for (int yy = -1; yy <= 1; yy++) for (int xx = -1; xx <= 1; xx++) {
      vec2 g = vec2(float(xx), float(yy));
      vec2 o = hash22(i + g + u_seed * 3.7);
      o = 0.5 + 0.4 * sin(ang(u_speed) + TAU * o);
      vec2 rr = g + o - f; float d = dot(rr, rr);
      if (d < d1) { d2 = d1; d1 = d; id = i + g; } else if (d < d2) d2 = d;
    }
    float edge = sqrt(d2) - sqrt(d1);
    off = (hash22(id * 1.3 + u_seed) - 0.5) * 0.09 * u_strength;
    hl = smoothstep(0.06, 0.0, edge);
  }
  off.x /= asp;
  float ch = u_chroma * 0.6;
  vec3 col = vec3(S(uv + off * (1.0 + ch)).r, S(uv + off).g, S(uv + off * (1.0 - ch)).b);
  if (u_frost > 0.0) {
    float r = u_frost * 0.012;
    col = col * 0.4 + (S(uv + off + vec2(r, 0.0)) + S(uv + off - vec2(r, 0.0)) + S(uv + off + vec2(0.0, r)) + S(uv + off - vec2(0.0, r))) * 0.15;
  }
  return col + hl * u_shine * 0.6;
}`,
  },
  fluted: {
    name: 'Fluted glass', kind: 'fx', blurb: 'Reeded glass ribs refracting what is below',
    params: [
      { k: 'count', l: 'Ribs', min: 4, max: 160, s: 0.1, d: 36 },
      { k: 'angle', l: 'Angle', min: 0, max: 180, s: 0.1, d: 0 },
      { k: 'dist', l: 'Distortion', min: 0, max: 1, s: 0.001, d: 0.55 },
      { k: 'shape', l: 'Rib shape', t: 'select', o: ['Round', 'Sharp', 'Wavy'], d: 0 },
      { k: 'chroma', l: 'Chroma', min: 0, max: 1, s: 0.001, d: 0.35 },
      { k: 'shadow', l: 'Shadow', min: 0, max: 1, s: 0.001, d: 0.35 },
      { k: 'shine', l: 'Highlight', min: 0, max: 1, s: 0.001, d: 0.4 },
      { k: 'blur', l: 'Blur', min: 0, max: 1, s: 0.001, d: 0.15 },
    ],
    glsl: `
vec3 fx(vec2 uv){
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(asp, 1.0);
  float a = radians(u_angle); mat2 R = mat2(cos(a), -sin(a), sin(a), cos(a)), Ri = mat2(cos(a), sin(a), -sin(a), cos(a));
  vec2 r = R * p;
  float x = r.x * u_count / asp;
  if (u_shape > 1.5) x += sin(r.y * 7.0) * 0.35;
  float i = floor(x), f = fract(x);
  float lens = u_shape > 0.5 && u_shape < 1.5 ? (f - 0.5) * 2.0 : sin((f - 0.5) * PI);
  float xs = i + 0.5 + (f - 0.5) * (1.0 - u_dist * 0.85) + lens * u_dist * 0.35;
  float ch = u_chroma * 0.25 * lens;
  vec3 col = vec3(0.0);
  float bl = u_blur * 0.02;
  for (int k = -1; k <= 1; k++) {
    float oy = float(k) * bl;
    vec2 pr = Ri * vec2((xs + ch) * asp / u_count, r.y + oy), pg = Ri * vec2(xs * asp / u_count, r.y + oy), pb = Ri * vec2((xs - ch) * asp / u_count, r.y + oy);
    col += vec3(S(pr / vec2(asp, 1.0) + 0.5).r, S(pg / vec2(asp, 1.0) + 0.5).g, S(pb / vec2(asp, 1.0) + 0.5).b);
  }
  col /= 3.0;
  col *= 1.0 - u_shadow * pow(abs(lens), 3.0) * 0.8;
  col += u_shine * 0.55 * smoothstep(0.09, 0.0, abs(f - 0.24));
  return col;
}`,
  },
  lens: {
    name: 'Lens', kind: 'fx', blurb: 'Barrel distortion with chromatic edges',
    params: [
      { k: 'distort', l: 'Distortion', min: -1, max: 1, s: 0.001, d: 0.4 },
      { k: 'zoom', l: 'Zoom', min: 0.5, max: 2, s: 0.001, d: 1.05 },
      { k: 'chroma', l: 'Chroma', min: 0, max: 1, s: 0.001, d: 0.45 },
      { k: 'blur', l: 'Edge blur', min: 0, max: 1, s: 0.001, d: 0.3 },
      { k: 'vign', l: 'Falloff', min: 0, max: 1, s: 0.001, d: 0.3 },
    ],
    glsl: `
vec3 fx(vec2 uv){
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(asp, 1.0);
  float r2 = dot(p, p);
  vec2 q = p * (1.0 + u_distort * 0.9 * r2) / u_zoom;
  float ca = u_chroma * 0.035 * r2;
  float br = u_blur * 0.015 * r2;
  vec3 col = vec3(0.0);
  for (int k = 0; k < 4; k++) {
    float an = float(k) * 1.5708 + 0.4;
    vec2 o = vec2(cos(an), sin(an)) * br;
    vec2 qr = q * (1.0 + ca) + o, qg = q + o, qb = q * (1.0 - ca) + o;
    col += vec3(S(qr / vec2(asp, 1.0) + 0.5).r, S(qg / vec2(asp, 1.0) + 0.5).g, S(qb / vec2(asp, 1.0) + 0.5).b);
  }
  col *= 0.25;
  return col * (1.0 - u_vign * smoothstep(0.1, 0.9, r2 * 1.6));
}`,
  },
  water: {
    name: 'Water', kind: 'fx', blurb: 'Look down through rippling water with caustics and glints',
    params: [
      { k: 'scale', l: 'Wave size', min: 0.5, max: 10, s: 0.01, d: 2.4 },
      { k: 'height', l: 'Refraction', min: 0, max: 1, s: 0.001, d: 0.5 },
      { k: 'chop', l: 'Ripples', min: 0, max: 1, s: 0.001, d: 0.45 },
      { k: 'dir', l: 'Wind direction', min: 0, max: 360, s: 0.1, d: 35 },
      { k: 'caustics', l: 'Caustics', min: 0, max: 1.5, s: 0.001, d: 0.75 },
      { k: 'glints', l: 'Sun glints', min: 0, max: 1.5, s: 0.001, d: 0.5 },
      { k: 'depth', l: 'Depth tint', min: 0, max: 1, s: 0.001, d: 0.3 },
      { k: 'clarity', l: 'Clarity', min: 0, max: 1, s: 0.001, d: 0.85 },
      { k: 'tint', l: 'Water color', t: 'color', d: '#1a9bc4' },
      SPEED(0.5, 2), SEED,
    ],
    glsl: `
// Height field: five directional swells whose speeds follow deep-water dispersion (slower long waves),
// plus fine chop. Returns height in x and its gradient in yz.
vec3 wField(vec2 q){
  float a0 = radians(u_dir);
  vec3 r = vec3(0.0);
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float a = a0 + (hash12(vec2(fi, u_seed)) - 0.5) * 1.6;
    vec2 d = vec2(cos(a), sin(a));
    float f = 1.2 * pow(1.55, fi), amp = 0.5 / pow(1.7, fi);
    float ph = dot(q, d) * f + ang(u_speed * sqrt(f) * 1.7) + fi * 2.3 + u_seed;
    r += vec3(amp * sin(ph), amp * f * cos(ph) * d);
  }
  if (u_chop > 0.0) {
    float e = 0.02;
    vec2 m = q * 4.0 + drift(vec2(0.35, 0.2) * u_speed);
    float c0 = gnoise(m);
    r += vec3(c0, (gnoise(m + vec2(e, 0.0)) - c0) / e * 4.0, (gnoise(m + vec2(0.0, e)) - c0) / e * 4.0) * u_chop * 0.12;
  }
  return r;
}
float wCaustic(vec2 p){
  vec2 q = p * TAU - 250.0, i = q; float c = 1.0, inten = 0.005;
  for (int n = 0; n < 4; n++) {
    float k = 1.0 - (3.5 / float(n + 1));
    float t = (23.0 + u_seed * 3.7) * k + ang(u_speed * 0.6 * k);
    i = q + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
    c += 1.0 / length(vec2(q.x / (sin(i.x + t) / inten), q.y / (cos(i.y + t) / inten)));
  }
  c = 1.17 - pow(c / 4.0, 1.4);
  return clamp(pow(abs(c), 9.0), 0.0, 1.0);
}
vec3 fx(vec2 uv){
  float asp = uRes.x / uRes.y;
  vec2 q = (uv - 0.5) * vec2(asp, 1.0) * u_scale;
  vec3 w = wField(q);
  vec3 n = normalize(vec3(-w.yz * 0.22, 1.0));
  vec2 off = n.xy * u_height * 0.07 / max(u_scale * 0.35, 0.4);
  off.x /= asp;
  vec3 below = S(uv + off);
  if (u_clarity < 1.0) {
    float r = (1.0 - u_clarity) * 0.012;
    vec3 bl = (S(uv + off + vec2(r, 0.0)) + S(uv + off - vec2(r, 0.0)) + S(uv + off + vec2(0.0, r)) + S(uv + off - vec2(0.0, r))) * 0.25;
    below = mix(below, bl, 1.0 - u_clarity);
  }
  vec3 col = mix(below, below * (u_tint * 1.35 + 0.08), u_depth);
  float cst = wCaustic((uv - 0.5) * vec2(asp, 1.0) * u_scale * 0.45 + off * 3.0);
  col += cst * u_caustics * 0.7 * mix(vec3(1.0), u_tint + 0.55, 0.35) * (0.6 + 0.4 * n.z);
  float sa = radians(u_dir) + 2.2;
  vec3 L = normalize(vec3(cos(sa) * 0.5, sin(sa) * 0.5, 1.0));
  float sp = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 60.0);
  float sparkle = smoothstep(0.62, 0.95, gnoise(q * 18.0 + drift(vec2(0.6, 0.4) * u_speed)) + 0.5);
  col += sp * sparkle * u_glints * 1.8;
  col += pow(1.0 - n.z, 2.0) * u_depth * 0.25 * (u_tint + 0.3);
  return col;
}`,
  },
  paper: {
    name: 'Paper', kind: 'fx', blurb: 'Fibers, crumples and folds over everything',
    params: [
      { k: 'amount', l: 'Amount', min: 0, max: 1, s: 0.001, d: 0.85 },
      { k: 'fiber', l: 'Fibers', min: 0, max: 1, s: 0.001, d: 0.5 },
      { k: 'crumple', l: 'Crumple', min: 0, max: 1, s: 0.001, d: 0.4 },
      { k: 'folds', l: 'Folds', min: 0, max: 6, s: 1, d: 2 },
      { k: 'rough', l: 'Roughness', min: 0, max: 1, s: 0.001, d: 0.35 },
      { k: 'tint', l: 'Paper color', t: 'color', d: '#f4ede1' },
      SEED,
    ],
    glsl: `
float crH(vec2 p){ return abs(fbmx(p * 4.0 + u_seed, 5.0, 2.0, 0.5)); }
vec3 fx(vec2 uv){
  float asp = uRes.x / uRes.y;
  vec2 p = (uv - 0.5) * vec2(asp, 1.0);
  vec3 col = S(uv);
  float fib = 0.0;
  for (int i = 0; i < 3; i++) {
    float a = hash12(vec2(float(i), u_seed)) * PI;
    vec2 r = mat2(cos(a), -sin(a), sin(a), cos(a)) * p;
    fib += gnoise(r * vec2(260.0, 14.0) + float(i) * 7.0);
  }
  fib /= 3.0;
  float e = 0.004, h = crH(p);
  vec3 n = normalize(vec3(-(crH(p + vec2(e, 0.0)) - h) / e, -(crH(p + vec2(0.0, e)) - h) / e, 12.0));
  float lit = dot(n, normalize(vec3(-0.5, 0.6, 0.6))) - 0.72;
  float fold = 0.0;
  for (int i = 0; i < 6; i++) {
    if (float(i) >= u_folds) break;
    vec2 c = (hash22(vec2(float(i) * 3.1, u_seed + 2.0)) - 0.5) * vec2(asp, 1.0) * 0.8;
    float a = hash12(vec2(u_seed, float(i) + 9.0)) * PI;
    float d = dot(p - c, vec2(cos(a), sin(a)));
    fold += sign(d) * 0.05 * exp(-abs(d) * 40.0) - 0.08 * exp(-abs(d) * 900.0);
  }
  float grain = (hash12(floor(uv * uRes)) - 0.5) * 0.09 * u_rough + gnoise(p * 90.0) * 0.05 * u_rough;
  float shade = 1.0 + fib * u_fiber * 0.13 + lit * u_crumple * 0.9 + fold + grain;
  return mix(col, col * u_tint * shade * 1.04, u_amount);
}`,
  },
  heatmap: {
    name: 'Heatmap', kind: 'fx', blurb: 'Map brightness onto a thermal scale',
    params: [
      { k: 'con', l: 'Contrast', min: 0.3, max: 3, s: 0.001, d: 1.2 },
      { k: 'off', l: 'Offset', min: -0.5, max: 0.5, s: 0.001, d: 0 },
      { k: 'bands', l: 'Contour count', min: 4, max: 40, s: 0.1, d: 14 },
      { k: 'lines', l: 'Contours', min: 0, max: 1, s: 0.001, d: 0.25 },
      { k: 'pulse', l: 'Contour flow', min: 0, max: 2, s: 0.001, d: 0.4 },
    ],
    glsl: `
vec3 heatc(float v){
  vec3 c0 = vec3(0.0, 0.0, 0.02), c1 = vec3(0.12, 0.04, 0.4), c2 = vec3(0.0, 0.35, 1.0), c3 = vec3(0.0, 0.85, 1.0),
       c4 = vec3(0.2, 1.0, 0.45), c5 = vec3(1.0, 0.92, 0.1), c6 = vec3(1.0, 0.25, 0.02), c7 = vec3(1.0, 1.0, 1.0);
  float x = clamp(v, 0.0, 1.0) * 7.0;
  if (x < 1.0) return mix(c0, c1, x);
  if (x < 2.0) return mix(c1, c2, x - 1.0);
  if (x < 3.0) return mix(c2, c3, x - 2.0);
  if (x < 4.0) return mix(c3, c4, x - 3.0);
  if (x < 5.0) return mix(c4, c5, x - 4.0);
  if (x < 6.0) return mix(c5, c6, x - 5.0);
  return mix(c6, c7, x - 6.0);
}
vec3 fx(vec2 uv){
  float v = clamp((luma(S(uv)) - 0.5) * u_con + 0.5 + u_off, 0.0, 1.0);
  vec3 c = heatc(v);
  float f = fract(v * u_bands - units(u_pulse, 1.0));
  float line = smoothstep(0.1, 0.0, min(f, 1.0 - f));
  return mix(c, c * 0.35, line * u_lines);
}`,
  },
  relief: {
    name: 'Relief', kind: 'fx', blurb: 'Emboss what is below into a lit surface',
    params: [
      { k: 'depth', l: 'Depth', min: 0, max: 8, s: 0.001, d: 2 },
      { k: 'angle', l: 'Light angle', min: 0, max: 360, s: 0.1, d: 135 },
      { k: 'shine', l: 'Shine', min: 0, max: 1.5, s: 0.001, d: 0.45 },
      { k: 'tight', l: 'Shine tightness', min: 2, max: 80, s: 0.1, d: 24 },
      { k: 'keep', l: 'Keep color', min: 0, max: 1, s: 0.001, d: 0.85 },
      { k: 'radius', l: 'Bevel', min: 0.5, max: 6, s: 0.01, d: 1.5 },
    ],
    glsl: `
vec3 fx(vec2 uv){
  vec2 e = vec2(u_radius * PXS(), 0.0) / uRes;
  vec2 f = vec2(0.0, u_radius * PXS()) / uRes;
  float gx = luma(S(uv + e)) - luma(S(uv - e));
  float gy = luma(S(uv + f)) - luma(S(uv - f));
  vec3 n = normalize(vec3(-gx * u_depth * 4.0, -gy * u_depth * 4.0, 1.0));
  float a = radians(u_angle);
  vec3 L = normalize(vec3(cos(a), sin(a), 0.8));
  float dif = max(dot(n, L), 0.0);
  float sp = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), u_tight);
  vec3 base = mix(vec3(0.55), S(uv), u_keep);
  return base * (0.3 + 0.9 * dif) + sp * u_shine;
}`,
  },
  chromemap: {
    name: 'Chrome map', kind: 'fx', blurb: 'Reflect what is below like polished metal',
    params: [
      { k: 'bands', l: 'Reflections', min: 0.5, max: 8, s: 0.01, d: 2 },
      { k: 'hard', l: 'Contrast', min: 0.5, max: 4, s: 0.001, d: 1.6 },
      { k: 'disp', l: 'Dispersion', min: 0, max: 1, s: 0.001, d: 0.3 },
      { k: 'soft', l: 'Smoothing', min: 0, max: 1, s: 0.001, d: 0.4 },
      { k: 'tint', l: 'Tint', t: 'color', d: '#a3b4d8' },
      { k: 'dark', l: 'Shadow', t: 'color', d: '#06070b' },
      SPEED(0, 2),
    ],
    glsl: `
float cenv(float x){ return clamp(pow(0.5 + 0.5 * cos(TAU * x), u_hard) + pow(0.5 + 0.5 * cos(TAU * x * 2.0 + 1.3), 6.0) * 0.35, 0.0, 1.0); }
vec3 fx(vec2 uv){
  float r = u_soft * 6.0 * PXS();
  vec2 o = vec2(r) / uRes;
  float v = luma(S(uv)) * 0.4 + (luma(S(uv + vec2(o.x, 0.0))) + luma(S(uv - vec2(o.x, 0.0))) + luma(S(uv + vec2(0.0, o.y))) + luma(S(uv - vec2(0.0, o.y)))) * 0.15;
  float x = v * u_bands + units(u_speed * 0.2, 1.0), d = u_disp * 0.12;
  vec3 c = vec3(cenv(x - d), cenv(x), cenv(x + d));
  return mix(u_dark, mix(u_tint, vec3(1.0), c * c), c);
}`,
  },
  iridescence: {
    name: 'Iridescence', kind: 'fx', blurb: 'Thin-film rainbow sheen over what is below',
    params: [
      { k: 'amount', l: 'Amount', min: 0, max: 1, s: 0.001, d: 0.6 },
      { k: 'freq', l: 'Film thickness', min: 0.5, max: 12, s: 0.01, d: 3 },
      { k: 'hue', l: 'Hue shift', min: 0, max: 1, s: 0.001, d: 0 },
      { k: 'edge', l: 'Edge boost', min: 0, max: 2, s: 0.001, d: 0.8 },
      SPEED(0.2, 2),
    ],
    glsl: `
vec3 fx(vec2 uv){
  vec3 base = S(uv);
  vec2 e = vec2(1.5 * PXS()) / uRes;
  float g = length(vec2(luma(S(uv + vec2(e.x, 0.0))) - luma(S(uv - vec2(e.x, 0.0))), luma(S(uv + vec2(0.0, e.y))) - luma(S(uv - vec2(0.0, e.y)))));
  float v = luma(base) + g * u_edge * 3.0;
  vec3 film = 0.5 + 0.5 * cos(TAU * (v * u_freq + u_hue + units(u_speed * 0.2, 1.0) + vec3(0.0, 0.33, 0.67)));
  vec3 lit = base * 0.45 + film * (base * 0.9 + 0.12);
  return mix(base, lit, u_amount);
}`,
  },
  bulge: {
    name: 'Bulge', kind: 'fx', blurb: 'Fisheye bulge or pinch',
    params: [
      { k: 'strength', l: 'Strength', min: -0.9, max: 1, s: 0.001, d: 0.5 },
      { k: 'radius', l: 'Radius', min: 0.1, max: 1.5, s: 0.001, d: 0.6 },
    ],
    glsl: `
vec3 fx(vec2 uv){
  float asp = uRes.x / uRes.y; vec2 p = (uv - 0.5) * vec2(asp, 1.0);
  float r = length(p) / u_radius;
  if (r < 1.0 && r > 0.0) p = normalize(p) * pow(r, 1.0 + u_strength) * u_radius;
  p.x /= asp;
  return S(p + 0.5);
}`,
  },
  polar: {
    name: 'Polar', kind: 'fx', blurb: 'Wrap into a circle, or unwrap',
    params: [
      { k: 'mode', l: 'Direction', t: 'select', o: ['Wrap to circle', 'Unwrap circle'], d: 0 },
      { k: 'zoom', l: 'Zoom', min: 0.2, max: 3, s: 0.01, d: 1 },
      { k: 'rep', l: 'Repeats', min: 1, max: 8, s: 1, d: 1 },
      { k: 'spin', l: 'Spin', min: -2, max: 2, s: 0.01, d: 0, r: [-0.5, 0.5] },
    ],
    glsl: `
vec3 fx(vec2 uv){
  float asp = uRes.x / uRes.y;
  if (u_mode < 0.5) {
    vec2 p = (uv - 0.5) * vec2(asp, 1.0);
    float r = length(p) * 2.0 * u_zoom;
    float a = atan(p.y, p.x) / TAU + 0.5 + units(u_spin * 0.1, 1.0);
    return S(vec2(fract(a * u_rep), r));
  }
  float a = uv.x * TAU * u_rep + ang(u_spin); float r = uv.y * 0.5 / u_zoom;
  vec2 q = vec2(cos(a), sin(a)) * r; q.x /= asp;
  return S(q + 0.5);
}`,
  },
  mirror: {
    name: 'Mirror', kind: 'fx', blurb: 'Reflect one half onto the other',
    params: [{ k: 'mode', l: 'Mirror', t: 'select', o: ['Left onto right', 'Right onto left', 'Top onto bottom', 'Bottom onto top', 'Four-way'], d: 0 }],
    glsl: `
vec3 fx(vec2 uv){
  vec2 q = uv;
  if (u_mode < 0.5) q.x = q.x > 0.5 ? 1.0 - q.x : q.x;
  else if (u_mode < 1.5) q.x = q.x < 0.5 ? 1.0 - q.x : q.x;
  else if (u_mode < 2.5) q.y = q.y < 0.5 ? 1.0 - q.y : q.y;
  else if (u_mode < 3.5) q.y = q.y > 0.5 ? 1.0 - q.y : q.y;
  else q = 0.5 - abs(q - 0.5);
  return S(q);
}`,
  },
  tile: {
    name: 'Tile', kind: 'fx', blurb: 'Repeat in a grid',
    params: [
      { k: 'nx', l: 'Columns', min: 1, max: 12, s: 1, d: 3 },
      { k: 'ny', l: 'Rows', min: 1, max: 12, s: 1, d: 3 },
      { k: 'mirror', l: 'Mirror tiles', t: 'bool', d: 1 },
      { k: 'brick', l: 'Brick offset', min: 0, max: 1, s: 0.01, d: 0, r: [0, 0.5] },
    ],
    glsl: `
vec3 fx(vec2 uv){
  vec2 q = uv * vec2(u_nx, u_ny);
  q.x += step(1.0, mod(floor(q.y), 2.0)) * u_brick;
  vec2 f = fract(q);
  if (u_mirror > 0.5) { vec2 m = mod(floor(q), 2.0); f = mix(f, 1.0 - f, m); }
  return S(f);
}`,
  },
  pixelate: {
    name: 'Pixelate', kind: 'fx', blurb: 'Chunky square pixels',
    params: [{ k: 'size', l: 'Pixel size', min: 1, max: 120, s: 0.1, d: 12 }],
    glsl: `
vec3 fx(vec2 uv){
  vec2 cell = vec2(max(1.0, u_size * PXS())) / uRes;
  return S((floor(uv / cell) + 0.5) * cell);
}`,
  },
  blur: {
    name: 'Blur', kind: 'fx', blurb: 'Soft gaussian blur',
    params: [{ k: 'radius', l: 'Radius', min: 0, max: 80, s: 0.1, d: 10 }],
    glsl: `
vec3 fx(vec2 uv){
  float R = u_radius * PXS(); if (R < 0.5) return S(uv);
  vec3 acc = vec3(0.0); float w = 0.0;
  for (int i = 0; i < 64; i++) {
    float fi = float(i); float r = sqrt((fi + 0.5) / 64.0) * R; float a = fi * 2.39996323;
    vec2 o = vec2(cos(a), sin(a)) * r / uRes; float k = exp(-r * r / (R * R) * 2.0);
    acc += S(uv + o) * k; w += k;
  }
  return acc / w;
}`,
  },
  glow: {
    name: 'Glow', kind: 'fx', blurb: 'Bloom around bright areas',
    params: [
      { k: 'th', l: 'Threshold', min: 0, max: 1, s: 0.001, d: 0.6 },
      { k: 'int', l: 'Intensity', min: 0, max: 4, s: 0.01, d: 1.2 },
      { k: 'radius', l: 'Radius', min: 2, max: 150, s: 0.1, d: 30 },
      { k: 'tint', l: 'Tint', t: 'color', d: '#ffffff' },
    ],
    glsl: `uniform vec3 u_tint;
vec3 fx(vec2 uv){
  vec3 base = S(uv); float R = u_radius * PXS();
  vec3 acc = vec3(0.0); float w = 0.0;
  for (int i = 0; i < 48; i++) {
    float fi = float(i); float r = sqrt((fi + 0.5) / 48.0) * R; float a = fi * 2.39996323;
    vec2 o = vec2(cos(a), sin(a)) * r / uRes; float k = exp(-r * r / (R * R) * 2.5);
    vec3 c = S(uv + o); c *= smoothstep(u_th, u_th + 0.15, luma(c));
    acc += c * k; w += k;
  }
  return base + acc / w * u_int * u_tint;
}`,
  },
  sharpen: {
    name: 'Sharpen', kind: 'fx', blurb: 'Crisp up edges',
    params: [
      { k: 'amt', l: 'Amount', min: 0, max: 5, s: 0.01, d: 1 },
      { k: 'rad', l: 'Radius', min: 0.5, max: 5, s: 0.01, d: 1 },
    ],
    glsl: `
vec3 fx(vec2 uv){
  vec2 o = u_rad * PXS() / uRes; vec3 c = S(uv);
  vec3 b = (S(uv + vec2(o.x, 0.0)) + S(uv - vec2(o.x, 0.0)) + S(uv + vec2(0.0, o.y)) + S(uv - vec2(0.0, o.y))) * 0.25;
  return clamp(c + (c - b) * u_amt, 0.0, 1.0);
}`,
  },
  edges: {
    name: 'Edges', kind: 'fx', blurb: 'Outline detection',
    params: [
      { k: 'str', l: 'Strength', min: 0, max: 6, s: 0.01, d: 1.5 },
      { k: 'thick', l: 'Thickness', min: 0.5, max: 6, s: 0.01, d: 1 },
      { k: 'mode', l: 'Style', t: 'select', o: ['Glowing lines', 'Ink on paper', 'Colored lines'], d: 0 },
    ],
    glsl: `
vec3 fx(vec2 uv){
  vec2 o = u_thick * PXS() / uRes;
  float tl = luma(S(uv + vec2(-o.x, o.y))), tc = luma(S(uv + vec2(0.0, o.y))), tr = luma(S(uv + o));
  float ml = luma(S(uv - vec2(o.x, 0.0))), mr = luma(S(uv + vec2(o.x, 0.0)));
  float bl = luma(S(uv - o)), bc = luma(S(uv - vec2(0.0, o.y))), br = luma(S(uv + vec2(o.x, -o.y)));
  float gx = -tl - 2.0 * ml - bl + tr + 2.0 * mr + br;
  float gy = -bl - 2.0 * bc - br + tl + 2.0 * tc + tr;
  float e = clamp(length(vec2(gx, gy)) * u_str, 0.0, 1.0);
  if (u_mode < 0.5) return vec3(e);
  if (u_mode < 1.5) return vec3(1.0 - e);
  return S(uv) * e * 1.5;
}`,
  },
  chroma: {
    name: 'Chromatic split', kind: 'fx', blurb: 'Offset red and blue channels',
    params: [
      { k: 'amount', l: 'Amount', min: 0, max: 60, s: 0.1, d: 8 },
      { k: 'radial', l: 'From center', t: 'bool', d: 1 },
      { k: 'angle', l: 'Angle', min: 0, max: 360, s: 1, d: 0, show: p => !p.radial },
    ],
    glsl: `
vec3 fx(vec2 uv){
  vec2 d;
  if (u_radial > 0.5) d = (uv - 0.5) * u_amount * PXS() / uRes.y * 2.0;
  else { float a = radians(u_angle); d = vec2(cos(a), sin(a)) * u_amount * PXS() / uRes; }
  return vec3(S(uv + d).r, S(uv).g, S(uv - d).b);
}`,
  },
  glitch: {
    name: 'Glitch', kind: 'fx', blurb: 'Torn scanlines and color blocks',
    params: [
      { k: 'int', l: 'Intensity', min: 0, max: 1, s: 0.001, d: 0.4 },
      { k: 'blocks', l: 'Slices', min: 2, max: 80, s: 1, d: 18 },
      { k: 'split', l: 'Color split', min: 0, max: 40, s: 0.1, d: 10 },
      { k: 'speed', l: 'Rate', min: 0, max: 12, s: 0.01, d: 3 },
      SEED,
    ],
    glsl: `
vec3 fx(vec2 uv){
  float t = tstep(u_speed, 0.0) + u_seed * 10.0;
  float row = floor(uv.y * u_blocks);
  float r = hash12(vec2(row, t)); float r2 = hash12(vec2(row * 1.7 + 3.0, t));
  float on = step(1.0 - u_int * 0.8, r);
  float sh = (r2 - 0.5) * 0.25 * u_int * on;
  float bx = floor(uv.x * u_blocks * 0.5);
  float blk = step(0.97 - u_int * 0.1, hash12(vec2(bx, row + t * 7.0)));
  vec2 q = uv + vec2(sh, 0.0);
  vec2 d = vec2(u_split * PXS() / uRes.x * (on + 0.2), 0.0);
  vec3 c = vec3(S(q + d).r, S(q).g, S(q - d).b);
  return mix(c, S(q + vec2(0.0, 0.07)).gbr, blk * u_int);
}`,
  },
  crt: {
    name: 'CRT', kind: 'fx', blurb: 'Scanlines, RGB mask, curved glass',
    params: [
      { k: 'dens', l: 'Line spacing', min: 1, max: 14, s: 0.01, d: 3 },
      { k: 'int', l: 'Line darkness', min: 0, max: 1, s: 0.001, d: 0.5 },
      { k: 'mask', l: 'RGB mask', min: 0, max: 1, s: 0.001, d: 0.3 },
      { k: 'curve', l: 'Curvature', min: 0, max: 1, s: 0.001, d: 0, r: [0, 0.5] },
      { k: 'roll', l: 'Roll speed', min: 0, max: 3, s: 0.01, d: 0.3 },
    ],
    glsl: `
vec3 fx(vec2 uv){
  vec2 q = uv;
  if (u_curve > 0.0) {
    vec2 c = q - 0.5; c *= 1.0 + u_curve * 0.35 * dot(c, c) * 4.0; q = c + 0.5;
    if (q.x < 0.0 || q.y < 0.0 || q.x > 1.0 || q.y > 1.0) return vec3(0.0);
  }
  vec3 col = S(q);
  float y = q.y * uRes.y / (u_dens * PXS()) + units(u_roll * 60.0 / u_dens, 1.0);
  float line = 0.5 + 0.5 * sin(y * TAU);
  col *= 1.0 - u_int * (1.0 - line);
  float mx = mod(floor(uv.x * uRes.x / max(1.0, PXS() * 1.5)), 3.0);
  vec3 m = vec3(step(mx, 0.5), step(0.5, mx) * step(mx, 1.5), step(1.5, mx));
  col *= mix(vec3(1.0), 0.35 + m * 1.3, u_mask);
  return col;
}`,
  },
  halftone: {
    name: 'Halftone', kind: 'fx', blurb: 'Printed dot screens',
    params: [
      { k: 'size', l: 'Dot spacing', min: 3, max: 60, s: 0.1, d: 10 },
      { k: 'angle', l: 'Screen angle', min: 0, max: 90, s: 0.1, d: 45 },
      { k: 'mode', l: 'Inks', t: 'select', o: ['One ink', 'Cyan, magenta, yellow'], d: 0 },
      { k: 'soft', l: 'Softness', min: 0, max: 1, s: 0.01, d: 0.2 },
      { k: 'ink', l: 'Ink', t: 'color', d: '#1d2a6b', show: p => p.mode == 0 },
      { k: 'paper', l: 'Paper', t: 'color', d: '#f3ecdf' },
    ],
    glsl: `uniform vec3 u_ink; uniform vec3 u_paper;
float ht(vec2 px, float ang, float sz, vec3 mask, float mono){
  float s = sin(ang), c = cos(ang); mat2 R = mat2(c, -s, s, c); mat2 Ri = mat2(c, s, -s, c);
  vec2 r = R * px / sz; vec2 cell = floor(r) + 0.5; vec2 cpx = Ri * cell * sz;
  vec3 col = S(cpx / uRes);
  float v = mono > 0.5 ? 1.0 - luma(col) : 1.0 - dot(col, mask);
  float d = length(r - cell); float rad = sqrt(clamp(v, 0.0, 1.0)) * 0.75; float aa = max(u_soft * 0.35, 1.5 / sz);
  return 1.0 - smoothstep(rad - aa, rad + aa, d);
}
vec3 fx(vec2 uv){
  vec2 px = uv * uRes; float sz = u_size * PXS(); float a = radians(u_angle);
  if (u_mode < 0.5) return mix(u_paper, u_ink, ht(px, a, sz, vec3(0.0), 1.0));
  float cC = ht(px, a + 0.2618, sz, vec3(1.0, 0.0, 0.0), 0.0);
  float cM = ht(px, a + 1.309, sz, vec3(0.0, 1.0, 0.0), 0.0);
  float cY = ht(px, a, sz, vec3(0.0, 0.0, 1.0), 0.0);
  return u_paper * vec3(1.0 - cC, 1.0 - cM, 1.0 - cY);
}`,
  },
  dither: {
    name: 'Dither', kind: 'fx', blurb: 'Ordered dithering, retro 1-bit',
    params: [
      { k: 'levels', l: 'Levels', min: 2, max: 8, s: 1, d: 2 },
      { k: 'px', l: 'Pixel size', min: 1, max: 10, s: 0.01, d: 2 },
      { k: 'mat', l: 'Pattern', t: 'select', o: ['Bayer 8×8', 'Bayer 4×4', 'Noise', 'Lines', 'Cross-hatch', 'Round dots'], d: 0 },
      { k: 'mono', l: 'Two colors', t: 'bool', d: 1 },
      { k: 'dark', l: 'Dark', t: 'color', d: '#1b1b3a', show: p => !!p.mono },
      { k: 'light', l: 'Light', t: 'color', d: '#f2e8cf', show: p => !!p.mono },
    ],
    glsl: `uniform vec3 u_dark; uniform vec3 u_light;
float bayer2(vec2 a){ a = floor(a); return fract(a.x / 2.0 + a.y * a.y * 0.75); }
float bayer4(vec2 a){ return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a){ return bayer4(0.5 * a) * 0.25 + bayer2(a); }
vec3 fx(vec2 uv){
  float ps = max(1.0, u_px * PXS()); vec2 pix = floor(uv * uRes / ps); vec2 q = (pix + 0.5) * ps / uRes;
  vec3 c = S(q);
  float th;
  if (u_mat < 0.5) th = bayer8(pix);
  else if (u_mat < 1.5) th = bayer4(pix);
  else if (u_mat < 2.5) th = hash12(pix);
  else if (u_mat < 3.5) th = abs(fract((pix.x + pix.y) / 6.0) - 0.5) * 2.0;
  else if (u_mat < 4.5) th = (abs(fract((pix.x + pix.y) / 6.0) - 0.5) + abs(fract((pix.x - pix.y) / 6.0) - 0.5));
  else th = clamp(length(fract(pix / 5.0) - 0.5) * 1.41, 0.0, 0.999);
  float L = u_levels - 1.0;
  if (u_mono > 0.5) { float v = floor(luma(c) * L + th) / L; return mix(u_dark, u_light, clamp(v, 0.0, 1.0)); }
  return clamp(floor(c * L + th) / L, 0.0, 1.0);
}`,
  },
  posterize: {
    name: 'Posterize', kind: 'fx', blurb: 'Reduce to flat color steps',
    params: [
      { k: 'levels', l: 'Levels', min: 2, max: 24, s: 1, d: 5 },
      { k: 'gamma', l: 'Gamma', min: 0.3, max: 2.5, s: 0.01, d: 1 },
    ],
    glsl: `
vec3 fx(vec2 uv){
  vec3 c = pow(max(S(uv), 0.0), vec3(u_gamma)); float L = u_levels - 1.0;
  c = floor(c * L + 0.5) / L;
  return pow(clamp(c, 0.0, 1.0), vec3(1.0 / u_gamma));
}`,
  },
  adjust: {
    name: 'Color adjust', kind: 'fx', blurb: 'Brightness, contrast, hue, saturation',
    params: [
      { k: 'bri', l: 'Brightness', min: -1, max: 1, s: 0.001, d: 0, r: [-0.1, 0.1] },
      { k: 'con', l: 'Contrast', min: 0, max: 3, s: 0.001, d: 1, r: [0.8, 1.5] },
      { k: 'sat', l: 'Saturation', min: 0, max: 3, s: 0.001, d: 1, r: [0.5, 1.8] },
      { k: 'hue', l: 'Hue', min: -180, max: 180, s: 0.1, d: 0 },
      { k: 'temp', l: 'Warmth', min: -1, max: 1, s: 0.001, d: 0 },
      { k: 'gamma', l: 'Gamma', min: 0.2, max: 3, s: 0.001, d: 1, r: [0.7, 1.4] },
      { k: 'hs', l: 'Hue cycle', min: 0, max: 3, s: 0.01, d: 0, r: [0, 0] },
    ],
    glsl: `
vec3 fx(vec2 uv){
  vec3 c = S(uv);
  c = pow(max(c, 0.0), vec3(1.0 / u_gamma));
  c += u_bri; c = (c - 0.5) * u_con + 0.5;
  c += vec3(u_temp * 0.1, 0.0, -u_temp * 0.1);
  float l = luma(c); c = mix(vec3(l), c, u_sat);
  vec3 h = rgb2hsv(clamp(c, 0.0, 1.0));
  h.x = fract(h.x + u_hue / 360.0 + units(u_hs * 0.1, 1.0));
  return hsv2rgb(h);
}`,
  },
  gradmap: {
    name: 'Gradient map', kind: 'fx', blurb: 'Recolor by brightness', palette: true,
    colors: { ca: '#1a1035', cb: '#c2466b', cc: '#ffd79a' },
    params: [],
    glsl: `
vec3 fx(vec2 uv){ return colorize(luma(S(uv))); }`,
  },
  invert: {
    name: 'Invert', kind: 'fx', blurb: 'Invert, threshold, solarize',
    params: [
      { k: 'mode', l: 'Mode', t: 'select', o: ['Invert', 'Threshold', 'Solarize'], d: 0 },
      { k: 'th', l: 'Threshold', min: 0, max: 1, s: 0.001, d: 0.5, show: p => p.mode != 0 },
      { k: 'soft', l: 'Softness', min: 0, max: 0.5, s: 0.001, d: 0.02, show: p => p.mode == 1 },
    ],
    glsl: `
vec3 fx(vec2 uv){
  vec3 c = S(uv);
  if (u_mode < 0.5) return 1.0 - c;
  if (u_mode < 1.5) return vec3(smoothstep(u_th - u_soft, u_th + u_soft + 1e-3, luma(c)));
  return mix(c, 1.0 - c, step(u_th, c));
}`,
  },
  grain: {
    name: 'Film grain', kind: 'fx', blurb: 'Fine photographic noise',
    params: [
      { k: 'amt', l: 'Amount', min: 0, max: 1, s: 0.001, d: 0.12, r: [0.05, 0.25] },
      { k: 'size', l: 'Grain size', min: 1, max: 6, s: 0.01, d: 1.2 },
      { k: 'color', l: 'Colored', t: 'bool', d: 0 },
      { k: 'anim', l: 'Moving', t: 'bool', d: 1 },
    ],
    glsl: `
vec3 fx(vec2 uv){
  vec3 c = S(uv);
  vec2 px = floor(uv * uRes / max(1.0, u_size * PXS()));
  float t = u_anim > 0.5 ? tstep(24.0, 0.0) : 0.0;
  vec2 k = px + t * vec2(13.1, 7.7);
  vec3 n = u_color > 0.5 ? vec3(hash12(k), hash12(k + 17.0), hash12(k + 41.0)) : vec3(hash12(k));
  return c + (n - 0.5) * u_amt;
}`,
  },
  vignette: {
    name: 'Vignette', kind: 'fx', blurb: 'Darken toward the edges',
    params: [
      { k: 'amt', l: 'Amount', min: 0, max: 1, s: 0.001, d: 0.7 },
      { k: 'size', l: 'Size', min: 0.1, max: 1.6, s: 0.001, d: 0.7 },
      { k: 'soft', l: 'Softness', min: 0.05, max: 1.2, s: 0.001, d: 0.6 },
      { k: 'round', l: 'Roundness', min: 0, max: 1, s: 0.001, d: 0.5 },
      { k: 'color', l: 'Color', t: 'color', d: '#000000' },
    ],
    glsl: `uniform vec3 u_color;
vec3 fx(vec2 uv){
  vec3 c = S(uv); vec2 p = uv - 0.5; p.x *= mix(1.0, uRes.x / uRes.y, u_round);
  float d = length(p) * 2.0;
  float v = smoothstep(u_size, u_size + u_soft, d) * u_amt;
  return mix(c, u_color, clamp(v, 0.0, 1.0));
}`,
  },
};

function layerParams(type) {
  const def = LAYER_TYPES[type];
  const pal = def.palette === undefined ? def.kind === 'gen' : def.palette;
  return pal ? def.params.concat(PAL_PARAMS) : def.params;
}

function buildFragment(type) {
  const def = LAYER_TYPES[type];
  const decl = def.params.filter(p => p.k !== 'seed' && !new RegExp('uniform \\w+ u_' + p.k + '\\b').test(def.glsl))
    .map(p => `uniform ${p.t === 'color' ? 'vec3' : 'float'} u_${p.k};`).join('\n');
  if (def.kind === 'gen') {
    return GLSL_HEAD + decl + '\n' + def.glsl + '\n' + (def.custom ? '' : GEN_DEFAULT_COLOR) + GEN_MAIN;
  }
  return GLSL_HEAD + decl + '\n' + def.glsl + '\n' + FX_MAIN;
}

if (typeof module !== 'undefined') module.exports = { LAYER_TYPES, buildFragment, layerParams, BLEND_MODES, PALETTES, PAL_PARAMS };
