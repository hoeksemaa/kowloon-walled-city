// The outside of the blocks, beside the walls of cityMesh.js: the window cages and what is
// kept in them, air-conditioners, pipes down the walls and the slab ledges. The facade shader
// draws the bars, grilles and pipes from the codes in aInfo.w, with FACADE_GLSL below.
//
// SOURCED: grilles "painted in the characteristic dark green or orange rust-preventing
// paint" (City of Darkness Revisited, p150); the cages hold pot plants, laundry and boxes
// (pp18, 26, 142-143); rust streaks run down the walls (pp14, 96-97). INFERRED: the bar
// patterns, the sizes, and which cage holds what.
import * as THREE from 'three';
import { K } from './kinds.js';

const col = (hex) => new THREE.Color(hex);
const pal = (list) => list.map(col);
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

const C = {
  sheet: pal(['#8e918c', '#7a4a32', '#9a958b', '#5d7a74', '#6e4d3d', '#a59d92']),
  pot: pal(['#a65a3a', '#8a4a32', '#b9714a', '#6e6a62', '#2b62a8', '#c8352b', '#3f6f45']),
  leaf: pal(['#4f6b3a', '#5d7a42', '#3f5a32', '#6f8f5a', '#35502e']),
  box: pal(['#a8865a', '#b89a6a', '#dcd9cf', '#e8e6df', '#8b8f8c', '#c9433a', '#3f6390']),
  bird: pal(['#c9a23c', '#8a6844', '#e6e2d8']),
  ac: [pal(['#d6cfbd', '#cfc6b0', '#e0dccf']), pal(['#9a9a94', '#8b8f8c', '#a59d92']), pal(['#e6e4dc', '#dedbd2']), pal(['#c2b79c', '#b7ad98'])],
  pipe: pal(['#3a3a38', '#5b5f5c', '#8b8f8c', '#2c3b4a', '#7a4a32', '#9aa0a3']),
};

// aInfo.w of a face that the shader draws with a frame: which face, a pattern (0-3), and the
// face's width and height in cm. 2 is added, so that the codes 0 and 1 keep their old meaning
// (0: a bridge or a ladder, 1: a small bird cage; see the shader).
export const FACE = { front: 0, side: 1, topBars: 2, topSheet: 3, floor: 4 };
export function faceCode(face, pat, W, H) {
  const cm = (x) => Math.max(0, Math.min(511, Math.round(x * 100)));
  return ((face * 4 + pat) * 512 + cm(W)) * 512 + cm(H) + 2;
}

// A point of the wall frame fr: u along the wall, o out of it, at height y.
const at = (fr, u, o, y) => [fr.A[0] + fr.t[0] * u + fr.n[0] * o, y, fr.A[1] + fr.t[1] * u + fr.n[1] * o];
const rect = (w, h) => [[0, 0], [w, 0], [w, h], [0, h]];

// A box on the wall: u0..u1 along it, o0..o1 out of it, from ya to yb. Each face has its own
// uv from 0, in metres, and its own code. f: { front, side, top: a FACE, floor, topColor }.
function wallBox(M, fr, u0, u1, o0, o1, ya, yb, c, info, pat, f) {
  const N = [fr.n[0], 0, fr.n[1]], T = [fr.t[0], 0, fr.t[1]];
  const W = u1 - u0, D = o1 - o0, H = yb - ya;
  const I = (face, w, h) => [info[0], info[1], info[2], faceCode(face, pat, w, h)];
  const P = (u, o, y) => at(fr, u, o, y);
  if (f.front) M.face([P(u0, o1, ya), P(u1, o1, ya), P(u1, o1, yb), P(u0, o1, yb)], N, c, rect(W, H), I(FACE.front, W, H));
  if (f.side) {
    M.face([P(u0, o0, ya), P(u0, o1, ya), P(u0, o1, yb), P(u0, o0, yb)], [-T[0], 0, -T[2]], c, rect(D, H), I(FACE.side, D, H));
    M.face([P(u1, o1, ya), P(u1, o0, ya), P(u1, o0, yb), P(u1, o1, yb)], T, c, rect(D, H), I(FACE.side, D, H));
  }
  if (f.top !== undefined) M.face([P(u0, o0, yb), P(u1, o0, yb), P(u1, o1, yb), P(u0, o1, yb)], [0, 1, 0], f.topColor || c, rect(W, D), I(f.top, W, D));
  if (f.floor) M.face([P(u0, o0, ya), P(u1, o0, ya), P(u1, o1, ya), P(u0, o1, ya)], [0, 1, 0], c, rect(W, D), I(FACE.floor, W, D));
}

// A window cage: steel bars in a frame of angle iron on the front and the sides, a sheet
// floor, and bars or a sheet of iron over the top. The bars are cut out in the shader, so
// the window and the wall show through.
export function emitCage(M, fr, u0, u1, d, ya, yb, c, info, rng) {
  const pat = Math.floor(rng() * 4);
  const sheet = rng() < 0.55;
  wallBox(M, fr, u0, u1, 0, d, ya, yb, c, info, pat, {
    front: true, side: true, floor: true,
    top: sheet ? FACE.topSheet : FACE.topBars, topColor: sheet ? pick(rng, C.sheet) : c,
  });
  return sheet;
}

// What is kept in a cage: pot plants, boxes, laundry hung from the top, now and then a bird
// cage. tw, k: the tower and the storey, for aInfo. aInfo.w of a thing: 0 a pot, 1 and 2
// leaves (upright, flat), 3 a box; plus 10 times a seed for the leaves.
export function cageThings(M, fr, u0, u1, d, ya, yb, tw, k, rng, cloth) {
  const ti = (code) => [tw, k, K.thing, code];
  const W = u1 - u0;
  let a = u0 + 0.06, b = u1 - 0.06; // the free length of the floor, from each end
  // Plants: a trough or a row of pots, with leaves over them.
  if (d >= 0.18 && rng() < 0.5) {
    const deep = Math.min(d - 0.06, 0.3), l = Math.min(W * 0.65, 0.35 + rng() * 0.6);
    const o0 = 0.04, h = 0.14 + rng() * 0.12, pc = pick(rng, C.pot);
    if (rng() < 0.5) M.obox(fr.A, fr.t, fr.n, a, a + l, o0, o0 + deep, ya, ya + h, pc, ti(0));
    else for (let x = a; x + deep * 0.8 <= a + l; x += deep * 1.05) M.obox(fr.A, fr.t, fr.n, x, x + deep * 0.8, o0, o0 + deep * 0.8, ya, ya + h, pc, ti(0));
    const fh = Math.min(yb - ya - h - 0.05, 0.3 + rng() * 0.5), om = o0 + deep / 2, lc = pick(rng, C.leaf);
    const x0 = a - 0.04, x1 = a + l + 0.04, yl = ya + h - 0.02, seed = 10 * Math.floor(rng() * 100);
    // an upright sheet of leaves along the row, and a flat one over it
    M.face([at(fr, x0, om, yl), at(fr, x1, om, yl), at(fr, x1, om, yl + fh), at(fr, x0, om, yl + fh)], [fr.n[0], 0, fr.n[1]], lc, rect(1, 1), ti(1 + seed));
    const yf = yl + fh * 0.55, oa = Math.max(0.02, om - deep * 0.7), ob = Math.min(d - 0.02, om + deep * 0.7);
    M.face([at(fr, x0, oa, yf), at(fr, x1, oa, yf), at(fr, x1, ob, yf), at(fr, x0, ob, yf)], [0, 1, 0], lc, rect(1, 1), ti(2 + seed));
    a += l + 0.08;
  }
  // Boxes: cardboard, polystyrene, a tin trunk, one on another.
  if (d >= 0.25 && b - a > 0.3 && rng() < 0.45) {
    let y = ya;
    const n = 1 + Math.floor(rng() * (yb - ya > 2 ? 3 : 2));
    for (let i = 0; i < n; i++) {
      const l = Math.min(b - a, 0.25 + rng() * 0.3), h = 0.18 + rng() * 0.25, deep = Math.min(d - 0.04, 0.2 + rng() * 0.25);
      if (y + h > yb - 0.1) break;
      M.obox(fr.A, fr.t, fr.n, b - l, b, 0.02, 0.02 + deep, y, y + h, pick(rng, C.box), ti(3));
      y += h;
    }
  }
  // Laundry on a wire under the top.
  if (yb - ya > 1.0 && rng() < 0.32) {
    const om = Math.min(d * 0.55, d - 0.05), n = 2 + Math.floor(rng() * 3), y1 = yb - 0.05;
    for (let i = 0; i < n; i++) {
      const w = 0.2 + rng() * 0.25, x = u0 + 0.08 + (W - 0.16 - w) * (i + rng() * 0.6) / n, h = 0.3 + rng() * 0.45;
      M.face([at(fr, x, om, y1 - h), at(fr, x + w, om, y1 - h), at(fr, x + w, om, y1), at(fr, x, om, y1)], [fr.n[0], 0, fr.n[1]], pick(rng, cloth), rect(w, h), [tw, k, K.laundry, 1]);
    }
  } else if (d >= 0.3 && yb - ya > 1.0 && rng() < 0.08) {
    // a bird cage hung from the top, near the front (the shader draws code 1 as fine bars)
    const x = u0 + 0.15 + rng() * Math.max(0, W - 0.6), s = 0.26;
    M.obox(fr.A, fr.t, fr.n, x, x + s, d - s - 0.04, d - 0.04, yb - 0.5, yb - 0.5 + 0.32, pick(rng, C.bird), [tw, k, K.cage, 1], true);
  }
}

// A window air-conditioner out of the wall at u, from height y: a box whose grilles the
// shader draws (style 0-3), on some a hood of sheet iron, and under most a stain of drips
// (in Mc, the see-through mesh). Window units were common on the open faces by the mid-1980s
// (p8).
export function emitAC(M, Mc, fr, u, y, rng, info, wallCol, stain) {
  const st = Math.floor(rng() * 4);
  const w = [0.62, 0.7, 0.56, 0.66][st] * (0.92 + rng() * 0.16), h = [0.44, 0.52, 0.4, 0.48][st], d = [0.46, 0.55, 0.42, 0.5][st];
  const c = pick(rng, C.ac[st]);
  wallBox(M, fr, u - w / 2, u + w / 2, 0, d, y, y + h, c, info, st, { front: true, side: true, top: FACE.topSheet });
  if (st === 2 || rng() < 0.2) {
    // a hood of sheet iron, sloping out over the unit
    const P = (uu, o, yy) => at(fr, uu, o, yy), x0 = u - w / 2 - 0.06, x1 = u + w / 2 + 0.06;
    M.face([P(x0, d + 0.08, y + h + 0.05), P(x1, d + 0.08, y + h + 0.05), P(x1, 0, y + h + 0.22), P(x0, 0, y + h + 0.22)],
      [fr.n[0] * 0.5, 0.87, fr.n[1] * 0.5], pick(rng, C.sheet), rect(x1 - x0, d + 0.1), [info[0], info[1], info[2], faceCode(FACE.floor, st, x1 - x0, d + 0.1)]);
  }
  if (stain && rng() < 0.75) {
    // drips from the unit: a dark stain fading down the wall; uv: 0-1 across, metres down
    const sw = w * (0.4 + rng() * 0.4), sh = 0.8 + rng() * 2.2, o = 0.006;
    Mc.face([at(fr, u - sw / 2, o, y - sh), at(fr, u + sw / 2, o, y - sh), at(fr, u + sw / 2, o, y), at(fr, u - sw / 2, o, y)],
      [fr.n[0], 0, fr.n[1]], wallCol, [[0, sh], [1, sh], [1, 0], [0, 0]], [info[0], info[1], K.stain, sh]);
  }
}

// A pipe, or a bundle of n pipes of diameter dia, down the wall at u from ya to yb, standing
// off the wall. One flat face: the shader rounds the pipes and draws their clips. v is the
// height above the ground, so that the clips line up from storey to storey.
export function emitPipe(M, fr, u, ya, yb, n, dia, c, tw, k) {
  const w = n * dia * 1.25, o = dia * 0.6 + 0.02;
  M.face([at(fr, u - w / 2, o, ya), at(fr, u + w / 2, o, ya), at(fr, u + w / 2, o, yb), at(fr, u - w / 2, o, yb)], [fr.n[0], 0, fr.n[1]], c,
    [[0, ya], [w, ya], [w, yb], [0, yb]], [tw, k, K.pipe, n + 10 * Math.round(dia * 100)]);
}
export const pipeColor = (rng) => pick(rng, C.pipe);

// A slab ledge along the whole wall at height y: a top and a front, run past the ends so that
// the ledges of two walls close the corner between them.
export function emitLedge(M, fr, y, depth, h, c, info) {
  const u0 = -depth, u1 = fr.len + depth;
  M.face([at(fr, u0, 0, y + h), at(fr, u1, 0, y + h), at(fr, u1, depth, y + h), at(fr, u0, depth, y + h)], [0, 1, 0], c, [[u0, 0], [u1, 0], [u1, depth], [u0, depth]], info);
  M.face([at(fr, u0, depth, y), at(fr, u1, depth, y), at(fr, u1, depth, y + h), at(fr, u0, depth, y + h)], [fr.n[0], 0, fr.n[1]], c, [[u0, 0], [u1, 0], [u1, h], [u0, h]], info);
}

// GLSL shared by the colour pass and the shadow pass of the storeys: noise, and how much of a
// pixel the steel of a cage, the leaves of a plant or a pipe covers (0-1). fw: fwidth(vWall),
// the size of a pixel in metres of the face.
export const FACADE_GLSL = /* glsl */ `
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x), f.y); }
float fcBarsI(float x, float f) { return floor(x) * f + min(fract(x), f); }
// The share of a pixel w wide (in periods) covered by bars f wide (a share of the period),
// one centred on each whole x.
float fcBars(float x, float f, float w) {
  w = max(w, 1e-3); x += 0.5 * f;
  return clamp((fcBarsI(x + 0.5 * w, f) - fcBarsI(x - 0.5 * w, f)) / w, 0.0, 1.0);
}
// Bars b metres wide every s metres. A bar is never drawn thinner than 0.7 of a pixel (px),
// so that far off a grille thickens into a screen and does not flicker away.
float fcGrid(float x, float s, float b, float px) { return fcBars(x / s, min(1.0, max(b, 0.7 * px) / s), px / s); }
// aInfo.w of a framed face (faceCode in facades.js): the face, the pattern, the size in metres.
void fcDecode(float w, out float face, out float pat, out vec2 S) {
  float c = floor(w - 2.0 + 0.5);
  S.y = mod(c, 512.0) / 100.0; c = floor(c / 512.0);
  S.x = mod(c, 512.0) / 100.0; c = floor(c / 512.0);
  pat = mod(c, 4.0); face = floor(c / 4.0);
}
float fcFrame(vec2 q, vec2 S, float b, vec2 fw) {
  vec2 e = min(q, S - q), bb = max(vec2(b), 0.7 * fw);
  return max(1.0 - smoothstep(bb.x - 0.5 * fw.x, bb.x + 0.5 * fw.x, e.x), 1.0 - smoothstep(bb.y - 0.5 * fw.y, bb.y + 0.5 * fw.y, e.y));
}
// A window cage (kind 6, code over 1.5).
float cageCover(vec2 q, float w, vec2 fw) {
  float face, pat; vec2 S; fcDecode(w, face, pat, S);
  if (face > 2.5) return 1.0; // a sheet over the top, or the floor
  float cov = fcFrame(q, S, 0.035, fw);
  if (face > 1.5) return min(max(cov, max(fcGrid(q.x, 0.15, 0.012, fw.x), fcGrid(q.y, 0.15, 0.012, fw.y))), 1.0 - 0.45 * smoothstep(0.03, 0.12, max(fw.x, fw.y)));
  // upright bars spread evenly between the posts, and flat rails across
  float s = pat == 1.0 ? 0.15 : 0.11;
  s = S.x / max(1.0, floor(S.x / s + 0.5));
  float vb = fcGrid(q.x, s, 0.014, fw.x), hb = 0.0;
  if (pat == 0.0) hb = fcGrid(q.y, S.y / 3.0, 0.025, fw.y);
  else if (pat == 1.0) hb = fcGrid(q.y, 0.15, 0.012, fw.y);
  else if (pat == 2.0) {
    // a band of diamonds under the top
    float top = S.y - 0.32;
    hb = max(fcGrid(q.y - top, 100.0, 0.025, fw.y), fcGrid(q.y - S.y * 0.4, 100.0, 0.025, fw.y));
    if (q.y > top) vb = max(fcGrid(q.x + q.y, 0.16, 0.012, fw.x + fw.y), fcGrid(q.x - q.y, 0.16, 0.012, fw.x + fw.y));
  } else {
    // a sheet across the bottom, and one rail
    hb = max(1.0 - smoothstep(0.28, 0.28 + fw.y, q.y), fcGrid(q.y - S.y * 0.55, 100.0, 0.025, fw.y));
  }
  // Far off, where the bars have thickened into a screen, let half the light through, so
  // the window behind still shows (and lit windows still shine through at night).
  return min(1.0 - (1.0 - cov) * (1.0 - vb) * (1.0 - hb), 1.0 - 0.45 * smoothstep(0.03, 0.12, max(fw.x, fw.y)));
}
// A small bird cage (kind 6, code 1): fine bars, a solid top and a tray at the foot.
float birdCover(vec2 q, vec3 nrm, vec2 fw) {
  if (abs(nrm.y) > 0.5) return 1.0;
  float c = max(fcGrid(q.x, 0.028, 0.005, fw.x), fcGrid(q.y, 0.12, 0.01, fw.y));
  return max(c, 1.0 - smoothstep(0.04, 0.04 + fw.y, q.y));
}
// Leaves (kind 17, codes 1 and 2, plus 10 times a seed): clumps, ragged at the top and the
// ends. q: 0-1 on the face.
float leafCover(vec2 q, float code, float seed) {
  float n = 0.6 * vnoise(q * vec2(9.0, 7.0) + seed) + 0.4 * vnoise(q * vec2(23.0, 19.0) + seed * 1.3);
  float edge = code < 1.5
    ? 0.4 * smoothstep(0.3, 1.0, q.y) + 0.35 * smoothstep(0.32, 0.5, abs(q.x - 0.5)) - 0.12 * (1.0 - q.y)
    : 0.45 * smoothstep(0.25, 0.5, max(abs(q.x - 0.5), abs(q.y - 0.5)));
  return smoothstep(0.38, 0.44, n - edge);
}
// Pipes (kind 18): n pipes side by side, each dia metres; clips every 1.6 m hold them.
float pipeCover(vec2 q, float w, vec2 fw) {
  float c = floor(w + 0.5), dia = floor(c / 10.0) / 100.0;
  float lx = fract(q.x / (dia * 1.25)) * 1.25 - 0.125;
  float a = abs(2.0 * lx - 1.0), aa = fw.x / dia * 2.0 + 1e-3;
  float clip = 1.0 - smoothstep(0.045, 0.045 + fw.y, fract(q.y / 1.6));
  return max(max(1.0 - smoothstep(1.0 - aa, 1.0 + aa, a), clip), step(0.6 * dia, fw.x));
}
// A dither in screen space, for cut-outs drawn without alpha to coverage.
float fcIgn(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
// The shadow pass needs less: bars as plain stripes, which the soft shadow filter blurs.
float shadowCover(float kind, vec4 info, vec2 q) {
  if (kind == 6.0 && info.w > 0.5) {
    if (info.w < 1.5) return max(step(fract(q.x / 0.028), 0.2), step(q.y, 0.04));
    if (floor(floor(info.w - 1.5) / 1048576.0) > 2.5) return 1.0; // a sheet or a floor
    return max(step(fract(q.x / 0.11), 0.16), step(fract(q.y / 0.55), 0.06));
  }
  if (kind == 17.0) {
    float c = floor(info.w + 0.5), t = mod(c, 10.0);
    if (t > 0.5 && t < 2.5) return leafCover(q, t, floor(c / 10.0) * 3.7 + info.x * 1.7 + info.y * 3.1);
  }
  return 1.0;
}
// The coverage of a surface that is cut out in places (1 for a solid one).
float facadeCover(float kind, vec4 info, vec2 q, vec3 nrm, vec2 fw) {
  if (kind == 6.0 && info.w > 0.5) return info.w < 1.5 ? birdCover(q, nrm, fw) : cageCover(q, info.w, fw);
  if (kind == 17.0) {
    float c = floor(info.w + 0.5), t = mod(c, 10.0);
    if (t > 0.5 && t < 2.5) return leafCover(q, t, floor(c / 10.0) * 3.7 + info.x * 1.7 + info.y * 3.1);
  }
  if (kind == 18.0) return pipeCover(q, info.w, fw);
  return 1.0;
}
`;
