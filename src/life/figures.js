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
// 4 hat, 5 bag.
function figureGeometry() {
  const P = [], N = [], part = [], idx = [];
  const box = (x0, x1, y0, y1, z0, z1, q) => {
    const faces = [
      [[1, 0, 0], [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]]],
      [[-1, 0, 0], [[x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [x0, y0, z0]]],
      [[0, 1, 0], [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]]],
      [[0, -1, 0], [[x0, y0, z1], [x0, y0, z0], [x1, y0, z0], [x1, y0, z1]]],
      [[0, 0, 1], [[x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [x0, y0, z1]]],
      [[0, 0, -1], [[x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]]],
    ];
    for (const [n, vs] of faces) {
      const o = P.length / 3;
      for (const v of vs) { P.push(...v); N.push(...n); part.push(q); }
      idx.push(o, o + 1, o + 2, o, o + 2, o + 3);
    }
  };
  box(-0.15, -0.02, 0, 0.8, -0.09, 0.09, 0);
  box(0.02, 0.15, 0, 0.8, -0.09, 0.09, 1);
  box(-0.2, 0.2, 0.78, 1.4, -0.12, 0.12, 2);
  box(-0.1, 0.1, 1.42, 1.66, -0.11, 0.11, 3);
  box(-0.16, 0.16, 1.63, 1.67, -0.16, 0.18, 4);
  box(-0.11, 0.11, 1.66, 1.74, -0.12, 0.12, 4);
  box(0.2, 0.31, 0.86, 1.16, -0.13, 0.13, 5);
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  g.setAttribute('part', new THREE.Float32BufferAttribute(part, 1));
  g.setAttribute('color', new THREE.Float32BufferAttribute(new Array(P.length).fill(1), 3));
  g.setIndex(idx);
  return g;
}

// The figure in GLSL: the pose, the size, the heading, the layer, and what hides it.
const FIG_GLSL = `
attribute float part; attribute vec3 iPos; attribute vec4 iMisc; attribute vec3 iTop; attribute vec3 iBot;
attribute vec4 iHat; attribute vec4 iBag; attribute float iSize;
uniform float uLift[16]; uniform float uShowIn[16]; uniform float uPeelK; uniform float uTime; uniform float uSelId;
vec3 rotX(vec3 v, float a, float y0) { float c = cos(a), s = sin(a); v.y -= y0; return vec3(v.x, c * v.y - s * v.z + y0, s * v.y + c * v.z); }
void fig(out vec3 P, out vec3 Nn, out float hidden) {
  vec3 p = position, n = normal;
  float pose = iMisc.z;
  hidden = 0.0;
  if ((part > 3.5 && part < 4.5 && iHat.a < 0.5) || (part > 4.5 && iBag.a < 0.5)) hidden = 1.0;
  if (part < 1.5) {
    float a = 0.0;
    if (pose > 2.5) a = sin(uTime * 8.0 + iPos.x * 3.1 + iPos.z * 1.7) * 0.5 * (part < 0.5 ? 1.0 : -1.0);
    else if (pose > 0.5 && pose < 1.5) a = -1.5;
    p = rotX(p, a, 0.8); n = rotX(n, a, 0.0);
  }
  if (pose > 0.5 && pose < 1.5) p.y -= 0.36;
  if (pose > 1.5 && pose < 2.5) { p = vec3(p.x, p.z + 0.14, 0.82 - p.y); n = vec3(n.x, n.z, -n.y); }
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
}`;

export class Figures {
  constructor(life, layers) {
    this.life = life; this.layers = layers;
    const N = life.N, geo = figureGeometry();
    this.posAttr = new THREE.InstancedBufferAttribute(life.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.miscAttr = new THREE.InstancedBufferAttribute(life.misc, 4).setUsage(THREE.DynamicDrawUsage);
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
        .replace('#include <beginnormal_vertex>', 'vec3 figP, figN; float figH; fig(figP, figN, figH);\nvec3 objectNormal = figN;')
        .replace('#include <begin_vertex>', 'vec3 transformed = figP;')
        .replace('#include <color_vertex>', `vColor = part < 1.5 ? iBot : part < 2.5 ? iTop : part < 3.5 ? vec3(${skin.r.toFixed(4)}, ${skin.g.toFixed(4)}, ${skin.b.toFixed(4)}) : part < 4.5 ? iHat.rgb : iBag.rgb;
  if (abs(float(gl_InstanceID) - uSelId) < 0.5) vColor = mix(vColor, vec3(1.0, 0.55, 0.12), 0.35);`);
    };
    m.customProgramCacheKey = () => 'kwc-figures';
    this.mesh = new THREE.Mesh(geo, m);
    this.mesh.frustumCulled = false;
    this.mesh.receiveShadow = true;
    // the pick: the number of the figure + 1 in red and green, and layer + 16 kind in blue
    const pickMat = new THREE.ShaderMaterial({
      uniforms: this.U,
      vertexShader: `${FIG_GLSL}\nflat out float vId; flat out float vL;\nvoid main() { vec3 P, Nn; float h; fig(P, Nn, h); vId = float(gl_InstanceID) + 1.0; vL = iMisc.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(P, 1.0); }`,
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
