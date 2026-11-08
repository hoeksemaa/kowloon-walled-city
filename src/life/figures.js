// The people as small figures: one instanced mesh for all of them, drawn in the floor layers of
// src/cityLayers.js. Each figure rises with its layer when the floors are pulled apart, goes
// with the layers over a peeled storey, and shows inside a building only where the floor shows
// (pulled apart, or the peeled storey). The pick draws the number of each figure.
//
// The colours are the drawing code's, not the data's. December clothes, measured in the photos
// of City of Darkness Revisited (2014): navy or black padded jackets for old people (p306); a
// white blouse and a navy skirt for schoolgirls (p322); vests and yellow or pink tops for small
// children (pp322-325); singlets in the workshops (pp246-247, 290-291); pale shirts and grey
// trousers; floral pyjama suits (p36); quilted vests and cardigans (p30); police in a dark
// uniform and a peaked cap (pp220, 252). Who wears what is INFERRED.
import * as THREE from 'three';
import { mulberry32 } from '../util.js';
import { POSE } from './sim.js';

export const PERSON_KIND = 8; // the kind of a figure in the pick (cityLayers.js: blue = layer + 16 kind)
const WEAR = {
  vest: ['#e4e7de', '#dcdcd2'],
  shirt: ['#e4e7de', '#d9d4c7', '#c8d0d6', '#d6cfc0'],
  trousers: ['#5a5754', '#4a4845', '#6b6762', '#3d3a37', '#454574'],
  jacket: ['#454574', '#36312e', '#5a4a3c', '#3c4a5c'],
  old: ['#454574', '#36312e', '#2f2c33'],
  cardigan: ['#8c5a4a', '#6f7d62', '#7a6a58', '#5d6d7c', '#a0866c', '#9a7b8a'],
  pyjama: ['#e9bea1', '#d88067', '#c9a3b8'],
  kid: ['#d8b54a', '#e9a3b4', '#e4e7de', '#9fb6c2', '#d88067'],
  kidLegs: ['#5d6d7c', '#3d3a37', '#454574', '#8c5a4a'],
  blouse: ['#eef0ea'], skirt: ['#2f3557'],
  police: ['#403430'],
  sweeper: ['#6a7a5a'],
};
// Words of data/routines.json ("figure.wear") and their colours.
const WORDS = [
  [/navy/, '#2f3557'], [/black/, '#2a2826'], [/white/, '#eef0ea'], [/grey|gray/, '#6b6762'], [/brown|canvas/, '#7a5a3a'],
  [/khaki/, '#9a8a62'], [/jeans|denim/, '#4a5a78'], [/blue/, '#3c4a7c'], [/green/, '#4d6a4a'], [/red/, '#9a3a30'],
  [/flour|cream|beige/, '#e6dcc4'], [/cardigan/, '#7a6a58'], [/vest|singlet/, '#e4e7de'], [/uniform/, '#3a3f4a'],
];
const SKIN = '#c99a78';

const lin = (hex) => new THREE.Color(hex); // three turns sRGB hex into the linear working space

// The look of person p: top, bottom, hat (or null), bag (or null), size.
export function lookOf(p) {
  const r = mulberry32(Math.floor(p.seed * 4e9) >>> 0);
  const W = (k) => WEAR[k][Math.floor(r() * WEAR[k].length)];
  let top, bottom = W('trousers'), hat = null, bag = null;
  const f = p.routine?.figure;
  if (f) {
    const wear = String(f.wear || '').toLowerCase(), parts = wear.split(/,|;| and /);
    const col = (s) => { for (const [re, c] of WORDS) if (re.test(s)) return c; return null; };
    const t = parts.find((s) => /shirt|jacket|polo|vest|singlet|blouse|cardigan|coat|top|uniform|sweater|jumper/.test(s));
    const b = parts.find((s) => /trousers|jeans|skirt|shorts|pants/.test(s));
    const h = parts.find((s) => /hat|cap/.test(s));
    top = (t && col(t)) || W('shirt');
    bottom = (b && col(b)) || bottom;
    if (h) hat = col(h) || '#3a3a3a';
    if (/bag/.test(String(f.carry || '') + wear)) bag = col(String(f.carry || '')) || '#7a5a3a';
  } else switch (p.role) {
    case 'child': top = r() < 0.4 ? W('cardigan') : W('kid'); bottom = W('kidLegs'); break;
    case 'student':
      if (r() < 0.7) { if (r() < 0.5) { top = W('blouse'); bottom = W('skirt'); } else { top = W('shirt'); bottom = r() < 0.5 ? '#2f3557' : W('trousers'); } }
      else { top = r() < 0.5 ? W('cardigan') : W('kid'); bottom = W('kidLegs'); }
      break;
    case 'elder': top = r() < 0.75 ? W('old') : W('cardigan'); bottom = W('old'); break;
    case 'homemaker': if (r() < 0.35) { top = W('pyjama'); bottom = top; } else top = W('cardigan'); break;
    case 'worker_in': case 'day_worker': top = r() < 0.45 ? W('vest') : r() < 0.5 ? W('cardigan') : W('jacket'); break;
    case 'shopkeeper': top = r() < 0.6 ? W('cardigan') : W('shirt'); break;
    case 'police': top = bottom = W('police'); hat = '#2c2724'; break;
    case 'sweeper': case 'refuse': top = W('sweeper'); hat = '#6a7a5a'; break;
    case 'meter': top = W('shirt'); bag = '#3a3a3a'; break;
    default: top = r() < 0.5 ? W('jacket') : W('shirt');
  }
  const age = p.age ?? 40;
  const size = age < 6 ? 0.58 : age < 12 ? 0.78 : age < 15 ? 0.9 : age >= 70 ? 0.95 : 1;
  return { top, bottom, hat, bag, size };
}

// The parts of a figure (metres, standing, facing +z): 0 left leg, 1 right leg, 2 body, 3 head,
// 4 hat, 5 bag, 6 left arm, 7 right arm. The faces that never show (the tops of the legs and the
// undersides of the body, the head and the hat, inside the next part or toward the floor) are
// left out: there are 35,000 figures.
function figureGeometry() {
  const P = [], N = [], part = [], idx = [];
  const box = (x0, x1, y0, y1, z0, z1, q, skip = '') => {
    const faces = [
      ['+x', [1, 0, 0], [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]]],
      ['-x', [-1, 0, 0], [[x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [x0, y0, z0]]],
      ['+y', [0, 1, 0], [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]]],
      ['-y', [0, -1, 0], [[x0, y0, z1], [x0, y0, z0], [x1, y0, z0], [x1, y0, z1]]],
      ['+z', [0, 0, 1], [[x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [x0, y0, z1]]],
      ['-z', [0, 0, -1], [[x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]]],
    ];
    for (const [name, n, vs] of faces) {
      if (skip.includes(name)) continue;
      const o = P.length / 3;
      for (const v of vs) { P.push(...v); N.push(...n); part.push(q); }
      idx.push(o, o + 1, o + 2, o, o + 2, o + 3);
    }
  };
  box(-0.15, -0.02, 0, 0.8, -0.09, 0.09, 0, '+y');
  box(0.02, 0.15, 0, 0.8, -0.09, 0.09, 1, '+y');
  box(-0.2, 0.2, 0.78, 1.4, -0.12, 0.12, 2, '-y');
  box(-0.1, 0.1, 1.42, 1.66, -0.11, 0.11, 3);
  box(-0.16, 0.16, 1.63, 1.67, -0.16, 0.18, 4, '-y');
  box(-0.11, 0.11, 1.66, 1.74, -0.12, 0.12, 4, '-y');
  box(0.27, 0.37, 0.86, 1.12, -0.12, 0.12, 5, '-y');
  box(-0.27, -0.2, 0.84, 1.38, -0.055, 0.055, 6);
  box(0.2, 0.27, 0.84, 1.38, -0.055, 0.055, 7);
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  g.setAttribute('part', new THREE.Float32BufferAttribute(part, 1));
  g.setAttribute('color', new THREE.Float32BufferAttribute(new Array(P.length).fill(1), 3));
  g.setIndex(idx);
  return g;
}

// The colours of the quilts over the sleepers (as the beds of src/life/furnish.js).
const QUILT = ['#d88a8a', '#8aa8d0', '#e0c080', '#c0a0c8', '#e8d8c8'].map((h) => { const c = lin(h); return `vec3(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})`; });

// The figure in GLSL: the activity (acts.js ACT: the arms, the lean of the body, the nod and the
// turn of the head), the pose, the size, the heading, the layer, and what hides it. Each figure
// has its own phase, thus the people of a room do not move as one. A sleeper lies under a quilt
// and breathes. How each activity moves is INFERRED.
const FIG_GLSL = `
attribute float part; attribute vec3 iPos; attribute vec4 iMisc; attribute vec3 iTop; attribute vec3 iBot;
attribute vec4 iHat; attribute vec4 iBag; attribute float iSize; attribute float iAct;
uniform float uLift[16]; uniform float uShowIn[16]; uniform float uPeelK; uniform float uTime; uniform float uSelId;
vec3 rotX(vec3 v, float a, float y0) { float c = cos(a), s = sin(a); v.y -= y0; return vec3(v.x, c * v.y - s * v.z + y0, s * v.y + c * v.z); }
vec3 rotZ(vec3 v, float a, vec2 o) { float c = cos(a), s = sin(a); v.xy -= o; return vec3(c * v.x - s * v.y + o.x, s * v.x + c * v.y + o.y, v.z); }
vec3 rotY(vec3 v, float a) { float c = cos(a), s = sin(a); return vec3(c * v.x + s * v.z, v.y, -s * v.x + c * v.z); }
float pulse(float x, float k) { return pow(max(0.0, sin(x)), k); }
void fig(out vec3 P, out vec3 Nn, out float hidden, out float quilt) {
  vec3 p = position, n = normal;
  float pose = iMisc.z, t = uTime;
  float ph = fract(sin(float(gl_InstanceID) * 12.9898) * 43758.5453) * 6.2832;
  bool lie = pose > 1.5 && pose < 2.5, walk = pose > 2.5;
  int A = int(iAct + 0.5);
  hidden = 0.0; quilt = 0.0;
  if ((part > 3.5 && part < 4.5 && (iHat.a < 0.5 || lie)) || (part > 4.5 && part < 5.5 && (iBag.a < 0.5 || lie))) hidden = 1.0;
  // the arms: pitch (forward is less than 0) and spread (out is more than 0) at the shoulder;
  // the lean of the body at the hip, the nod and the turn of the head, a bob of the whole
  float aL = 0.0, aR = 0.0, sL = 0.05, sR = 0.05, lean = 0.0, nod = 0.0, yaw = 0.0, bob = 0.0, legA = 0.0;
  float w = sin(t * 8.0 + iPos.x * 3.1 + iPos.z * 1.7);
  if (walk) {
    legA = w * 0.5; bob = abs(w) * 0.025;
    if (A == 8) { aL = -1.1; aR = -1.1; sL = -0.1; sR = -0.1; lean = -0.05; }
    else { aL = -w * 0.45; aR = w * 0.45; }
  } else if (A == 0) { aL = 0.05 * sin(t * 0.9 + ph); aR = -aL; yaw = 0.4 * sin(t * 0.31 + ph); }
  else if (A == 2) { sL = 0.02; sR = 0.02; }
  else if (A == 3) { aL = -0.35; aR = -0.35; sL = -0.05; sR = -0.05; nod = 0.08 + 0.06 * sin(t * 0.5 + ph); yaw = 0.3 * sin(t * 0.23 + ph); }
  else if (A == 4) { aL = -1.0; sL = -0.15; aR = -1.0 - 0.75 * pulse(t * 2.4 + ph, 2.0); sR = -0.2; nod = 0.15; }
  else if (A == 5) { aL = -0.95 + 0.07 * sin(t * 9.0 + ph); aR = -0.95 + 0.07 * sin(t * 9.0 + ph + 1.7); sL = -0.15; sR = -0.15; lean = 0.15; nod = 0.3; }
  else if (A == 6) { aL = -0.85; sL = -0.1; aR = -0.9 - 0.6 * abs(sin(t * 3.5 + ph)); sR = -0.05; lean = 0.18; nod = 0.25; }
  else if (A == 7) { aL = -0.7; sL = -0.05; aR = -1.0 + 0.25 * sin(t * 4.5 + ph); sR = 0.12 * cos(t * 4.5 + ph) - 0.05; lean = 0.08; nod = 0.2; }
  else if (A == 8) { aL = -1.15; aR = -1.15; sL = -0.12; sR = -0.12; }
  else if (A == 9) { float sw = 0.35 * sin(t * 2.8 + ph); aL = -0.75; aR = -0.6; sL = -0.1 - sw; sR = -0.1 + sw; lean = 0.3; nod = 0.2; }
  else if (A == 10) { aR = -0.25 - 0.6 * pulse(t * 1.6 + ph, 3.0); sR = 0.1; aL = -0.1; nod = 0.07 * sin(t * 3.1 + ph); yaw = 0.25 * sin(t * 0.4 + ph); }
  else if (A == 11) { aL = -1.25; aR = -1.25; sL = -0.05 + 0.2 * pulse(t * 3.0 + ph, 1.0); sR = -0.05 + 0.2 * pulse(t * 3.0 + ph + 2.0, 1.0); lean = 0.2; nod = 0.25; }
  else if (A == 12) { lean = 0.45; aL = -0.75 + 0.18 * sin(t * 6.0 + ph); aR = -0.75 - 0.18 * sin(t * 6.0 + ph); sL = -0.1; sR = -0.1; nod = 0.15; }
  else if (A == 13) { float j = t * 5.0 + ph; bob = 0.13 * abs(sin(j)); aL = -2.5 + 0.4 * sin(j); aR = -2.5 - 0.4 * sin(j); sL = 0.3; sR = 0.3; legA = 0.25 * sin(j); }
  else if (A == 14) { aL = -1.25; aR = -1.25; sL = -0.28; sR = -0.28; lean = 0.35 * pulse(t * 1.1 + ph, 2.0); nod = lean * 0.5; }
  else if (A == 15) { float e = t * 0.8 + ph; aL = -1.2 - 0.5 * sin(e); aR = -1.2 - 0.5 * sin(e + 0.6); sL = 0.35 * (0.5 + 0.5 * cos(e)); sR = sL; bob = -0.05 * (0.5 + 0.5 * sin(e)); yaw = 0.3 * sin(e); }
  else if (A == 16) { aL = -2.6 + 0.15 * sin(t * 2.0 + ph); aR = -2.7 - 0.15 * sin(t * 2.0 + ph); sL = 0.1; sR = 0.1; nod = -0.2; }
  else if (A == 17) { aL = -0.8; sL = -0.12; aR = -0.95 + 0.04 * sin(t * 11.0 + ph); sR = -0.18 + 0.03 * sin(t * 7.0 + ph); lean = 0.18; nod = 0.32; }
  if (part < 1.5) {
    float a = legA * (part < 0.5 ? 1.0 : -1.0);
    if (pose > 0.5 && pose < 1.5) a = -1.5;
    p = rotX(p, a, 0.8); n = rotX(n, a, 0.0);
  } else {
    if (part > 5.5) {
      float side = part > 6.5 ? 1.0 : -1.0, a = part > 6.5 ? aR : aL, sp = (part > 6.5 ? sR : sL) * side;
      p = rotZ(p, sp, vec2(0.235 * side, 1.37)); n = rotZ(n, sp, vec2(0.0));
      p = rotX(p, a, 1.37); n = rotX(n, a, 0.0);
    }
    if (part > 2.5 && part < 4.5) { p = rotY(p, yaw); n = rotY(n, yaw); p = rotX(p, nod, 1.42); n = rotX(n, nod, 0.0); }
    p = rotX(p, lean, 0.8); n = rotX(n, lean, 0.0);
  }
  p.y += bob;
  if (lie && A == 2) {
    // under a quilt: the legs, the body and the arms one wide lump; the body breathes
    if (part < 2.5 || part > 5.5) {
      quilt = 1.0;
      if (part < 1.5) p.x = p.x * 1.4 + (part < 0.5 ? 0.03 : -0.03);
      p.z *= 1.15;
      if (part > 1.5 && part < 2.5) p.z *= 1.0 + 0.08 * sin(t * 1.3 + ph);
    }
  }
  if (pose > 0.5 && pose < 1.5) p.y -= 0.36;
  if (lie) { p = vec3(p.x, p.z + 0.14, 0.82 - p.y); n = vec3(n.x, n.z, -n.y); }
  float sel = abs(float(gl_InstanceID) - uSelId) < 0.5 ? 1.35 : 1.0;
  p *= iSize * sel;
  float c = cos(iMisc.x), s = sin(iMisc.x);
  p = vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
  n = vec3(c * n.x + s * n.z, n.y, -s * n.x + c * n.z);
  int L = int(iMisc.y + 0.5);
  p += iPos; p.y += uLift[L];
  if (iMisc.w > 1.5 || (iMisc.w > 0.5 && uShowIn[L] < 0.5) || (uPeelK > -1.0 && iMisc.y > uPeelK + 0.5)) hidden = 1.0;
  if (hidden > 0.5) p = vec3(0.0, -1.0e5, 0.0);
  P = p; Nn = n;
}
vec3 quiltColour() {
  float q = floor(fract(sin(float(gl_InstanceID) * 78.233) * 43758.5453) * 5.0);
  return q < 0.5 ? ${QUILT[0]} : q < 1.5 ? ${QUILT[1]} : q < 2.5 ? ${QUILT[2]} : q < 3.5 ? ${QUILT[3]} : ${QUILT[4]};
}`;

export class Figures {
  constructor(life, layers) {
    this.life = life; this.layers = layers;
    const N = life.N, geo = figureGeometry();
    this.posAttr = new THREE.InstancedBufferAttribute(life.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.miscAttr = new THREE.InstancedBufferAttribute(life.misc, 4).setUsage(THREE.DynamicDrawUsage);
    this.actAttr = new THREE.InstancedBufferAttribute(life.act, 1).setUsage(THREE.DynamicDrawUsage);
    const top = new Float32Array(N * 3), bot = new Float32Array(N * 3), hat = new Float32Array(N * 4), bag = new Float32Array(N * 4), size = new Float32Array(N);
    this.looks = life.persons.map((p, i) => {
      const L = lookOf(p), t = lin(L.top), b = lin(L.bottom);
      top.set([t.r, t.g, t.b], i * 3); bot.set([b.r, b.g, b.b], i * 3);
      if (L.hat) { const h = lin(L.hat); hat.set([h.r, h.g, h.b, 1], i * 4); }
      if (L.bag) { const h = lin(L.bag); bag.set([h.r, h.g, h.b, 1], i * 4); }
      size[i] = L.size;
      return L;
    });
    geo.setAttribute('iPos', this.posAttr);
    geo.setAttribute('iMisc', this.miscAttr);
    geo.setAttribute('iAct', this.actAttr);
    geo.setAttribute('iTop', new THREE.InstancedBufferAttribute(top, 3));
    geo.setAttribute('iBot', new THREE.InstancedBufferAttribute(bot, 3));
    geo.setAttribute('iHat', new THREE.InstancedBufferAttribute(hat, 4));
    geo.setAttribute('iBag', new THREE.InstancedBufferAttribute(bag, 4));
    geo.setAttribute('iSize', new THREE.InstancedBufferAttribute(size, 1));
    geo.instanceCount = N;
    this.U = {
      uLift: { value: new Float32Array(16) }, uShowIn: { value: new Float32Array(16) },
      uPeelK: { value: -10 }, uTime: { value: 0 }, uSelId: { value: -10 },
    };
    const skin = lin(SKIN);
    const m = new THREE.MeshLambertMaterial({ vertexColors: true });
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, this.U);
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', `#include <common>\n${FIG_GLSL}`)
        .replace('#include <beginnormal_vertex>', 'vec3 objectNormal = figN;')
        .replace('#include <begin_vertex>', 'vec3 transformed = figP;')
        .replace('#include <color_vertex>', `vec3 figP, figN; float figH, figQ; fig(figP, figN, figH, figQ); // before the colour: a sleeper's quilt
  vColor = part < 1.5 ? iBot : part < 2.5 ? iTop : part < 3.5 ? vec3(${skin.r.toFixed(4)}, ${skin.g.toFixed(4)}, ${skin.b.toFixed(4)}) : part < 4.5 ? iHat.rgb : part < 5.5 ? iBag.rgb : iTop;
  if (figQ > 0.5) vColor = quiltColour();
  if (abs(float(gl_InstanceID) - uSelId) < 0.5) vColor = mix(vColor, vec3(1.0, 0.55, 0.12), 0.35);`);
    };
    m.customProgramCacheKey = () => 'kwc-figures';
    this.mesh = new THREE.Mesh(geo, m);
    this.mesh.frustumCulled = false;
    this.mesh.receiveShadow = true;
    // the pick: the number of the figure + 1 in red and green, and layer + 16 kind in blue
    const pickMat = new THREE.ShaderMaterial({
      uniforms: this.U,
      vertexShader: `${FIG_GLSL}\nflat out float vId; flat out float vL;\nvoid main() { vec3 P, Nn; float h, q; fig(P, Nn, h, q); vId = float(gl_InstanceID) + 1.0; vL = iMisc.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(P, 1.0); }`,
      fragmentShader: `flat in float vId; flat in float vL;\nvoid main() { gl_FragColor = vec4(mod(vId, 256.0) / 255.0, floor(vId / 256.0) / 255.0, (vL + 16.0 * ${PERSON_KIND}.0) / 255.0, 1.0); }`,
    });
    this.pick = new THREE.Mesh(geo, pickMat);
    this.pick.frustumCulled = false;
    layers.pickScene.add(this.pick);
  }

  // Each frame: the lifts and the peel of the layers, and the moved figures.
  update(time) {
    const L = this.layers, U = this.U, e = L.spread, c = L.peelK;
    for (let k = 0; k < 16; k++) {
      U.uLift.value[k] = k < L.n ? L.lift[k] * e : 0;
      U.uShowIn.value[k] = e > 0.01 || k === c ? 1 : 0;
    }
    U.uPeelK.value = c >= 0 ? c : -10;
    U.uTime.value = time;
    this.posAttr.needsUpdate = true;
    this.miscAttr.needsUpdate = true;
    this.actAttr.needsUpdate = true;
  }

  select(i) { this.U.uSelId.value = i >= 0 ? i : -10; }

  // The point over the head of person i, in the view (lifted with its layer), or null.
  head(i) {
    const m = this.life.misc, f = m[i * 4 + 3];
    if (f > 1.5) return null;
    const k = Math.round(m[i * 4 + 1]), p = this.life.pos;
    return new THREE.Vector3(p[i * 3], p[i * 3 + 1] + 2.2 + this.U.uLift.value[k], p[i * 3 + 2]);
  }
}
export { POSE };
