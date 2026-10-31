// Inside the storeys: the stairs of every storey, and, on the cut storey, the floors of the
// units, their doors and their furniture.
//
// SOURCED: mosaic stairs and whitewashed corridors (City of Darkness Revisited, pp165, 177);
// the 4/F flat of 6 Sai Shing Road with its cubicles, kitchen, toilet and bed spaces (p340);
// bunk beds and bed spaces in the flats (pp158-161); tiled floors, a checker and a small
// mosaic (pp25, 156); the noodle factory's racks (pp170-171); plastics, metal and garment
// workshops (pp246-257); dentists' chairs (pp238-243); the herbal medicine shop (p228).
// INFERRED: which unit has which furniture, and where each piece stands. A seeded random
// choice, the same each time.
import * as THREE from 'three';
import { STOREY } from './layout.js';
import { frameOf, toXZ, stairFit, STAIR, FLAT } from './floorplan.js';
import { triangulate } from './geom.js';
import { mulberry32, hash2, pointInPolygon } from './util.js';
import { K, CUT_H } from './kinds.js';

const col = (hex) => new THREE.Color(hex);
const pal = (list) => list.map(col);
const C = {
  wood: pal(['#6b4a32', '#7a5536', '#5a3d2a', '#8a6844', '#4a3426']),
  paint: pal(['#4f6b5a', '#5d7466', '#7d8a9c', '#8c96a8', '#a65a3a', '#c9c4b5']),
  sheet: pal(['#e4e7de', '#d9cdb8', '#c9d3cf', '#e9d9c0']),
  quilt: pal(['#b8574a', '#d88067', '#5d86a8', '#d8b54a', '#6f8f5a', '#9a6f8f', '#c94f6d', '#e6e2d8']),
  plastic: pal(['#c8352b', '#2b62a8', '#e8e2d0', '#3f8f5a', '#e0b02c', '#e87fa0']),
  appl: pal(['#e8e4da', '#d9d4c8', '#c7c9c4', '#b9cbc4']),
  card: pal(['#a07a50', '#b08c5c', '#8c6a46', '#c2a06e']),
  sack: pal(['#cbbd9a', '#d8ccb0', '#b9a888']),
  machine: pal(['#55665d', '#4d5a63', '#6b7270', '#5d6b4f']),
  white: col('#ecebe4'), steel: col('#9aa0a3'), dark: col('#2a2826'), black: col('#141414'),
  red: col('#a8251c'), gold: col('#c9a23c'), green: col('#2f5f3f'), table: col('#2f6b4a'),
  concrete: col('#9a958b'), tile: col('#dcdcd4'), glass: col('#a9c4c9'), bamboo: col('#b39b62'),
};

// ---- stairs --------------------------------------------------------------------------------
// A dog-leg stair in each built core (floorplan.js stairFit): flight A rises from the floor
// landing at a0 to the half landing at a1, and flight B turns back to the floor above. The
// floor above has an opening over both flights (cityMesh.js), so the stair well is open from
// storey to storey.
const MOSAIC = col('#9c968c'), RISER = col('#7c766d'), WELL = col('#bdb6aa'), STRING = col('#8a847a');
export function emitStairs(M, b, k) {
  if (!b.cores || !b.cores.length) return;
  const F = frameOf(b), y0 = k * STOREY, half = STOREY / 2, n = STAIR.RISERS, h = half / n;
  const U = [F.ux, 0, F.uz], W = [F.px, 0, F.pz], up = [0, 1, 0];
  const P = (a, w, y) => { const [x, z] = toXZ(F, a, w); return [x, y, z]; };
  const info = (code) => [b.tower, k, K.stair, code];
  for (const c of b.cores) {
    const r = stairFit(b, c);
    if (!r) continue;
    const fa = r.a0 + STAIR.LA, la = r.a1 - STAIR.LB, t = (la - fa) / (n - 1), wm = (r.w0 + r.w1) / 2;
    const tread = (a0, a1, w0, w1, y, front) => M.face([P(a0, w0, y), P(a1, w0, y), P(a1, w1, y), P(a0, w1, y)], up, MOSAIC,
      [[w0, Math.abs(a0 - front)], [w0, Math.abs(a1 - front)], [w1, Math.abs(a1 - front)], [w1, Math.abs(a0 - front)]], info(0));
    const riser = (a, w0, w1, ya, yb, s) => M.face([P(a, w0, ya), P(a, w1, ya), P(a, w1, yb), P(a, w0, yb)], [U[0] * s, 0, U[2] * s], RISER,
      [[w0, 0], [w1, 0], [w1, yb - ya], [w0, yb - ya]], info(1));
    // flight A, on the low side of w, up along +a
    const A0 = r.w0, A1 = wm - 0.05, B0 = wm + 0.05, B1 = r.w1;
    for (let i = 0; i < n; i++) {
      const a = fa + i * t;
      riser(a, A0, A1, y0 + i * h, y0 + (i + 1) * h, -1);
      if (i < n - 1) tread(a, a + t, A0, A1, y0 + (i + 1) * h, a);
    }
    // the half landing, a slab across both flights
    tread(la, r.a1, r.w0, r.w1, y0 + half, la);
    M.face([P(la, B0, y0 + half - 0.16), P(la, B1, y0 + half - 0.16), P(la, B1, y0 + half), P(la, B0, y0 + half)], [-U[0], 0, -U[2]], RISER,
      [[B0, 0], [B1, 0], [B1, 0.16], [B0, 0.16]], info(1));
    // flight B, on the high side of w, up along -a to the floor above
    for (let j = 0; j < n; j++) {
      const a = la - j * t;
      riser(a, B0, B1, y0 + half + j * h, y0 + half + (j + 1) * h, 1);
      if (j < n - 1) tread(a - t, a, B0, B1, y0 + half + (j + 1) * h, a);
    }
    // the outer stringers, and the wall between the flights
    const slope = (a, w, s, yLo, yHi, nrm) => M.face([P(a[0], w, yLo[0]), P(a[1], w, yLo[1]), P(a[1], w, yHi[1]), P(a[0], w, yHi[0])], nrm, STRING,
      [[0, 0], [Math.abs(a[1] - a[0]), 0], [Math.abs(a[1] - a[0]), 1], [0, 1]], info(2));
    slope([fa, la], A0, 1, [y0, y0 + half - 0.3], [y0 + h + 0.12, y0 + half + 0.12], [-W[0], 0, -W[2]]);
    slope([la, fa], B1, 1, [y0 + half - 0.3, y0 + STOREY - 0.3], [y0 + half + h + 0.12, y0 + STOREY + 0.06], [W[0], 0, W[2]]);
    M.face([P(fa, wm, y0), P(la, wm, y0), P(la, wm, y0 + STOREY), P(fa, wm, y0 + STOREY)], W, STRING,
      [[0, 0], [la - fa, 0], [la - fa, STOREY], [0, STOREY]], info(2));
    // The well: walls on its three closed sides, seen from the storeys above through the
    // opening. The cut storey hides them, and its plan draws the walls with their caps.
    const wi = [b.tower, k, K.well, 1];
    const wall = (p0, p1, nrm, len) => M.face([P(...p0, y0), P(...p1, y0), P(...p1, y0 + STOREY), P(...p0, y0 + STOREY)], nrm, WELL,
      [[0, 0], [len, 0], [len, STOREY], [0, STOREY]], wi);
    wall([fa, r.w0], [r.a1, r.w0], W, r.a1 - fa);
    wall([fa, r.w1], [r.a1, r.w1], [-W[0], 0, -W[2]], r.a1 - fa);
    wall([r.a1, r.w0], [r.a1, r.w1], [-U[0], 0, -U[2]], r.w1 - r.w0);
  }
}

// ---- geometry helpers ------------------------------------------------------------------------
// Keep the part of a polygon where nx*x + nz*z <= d.
function clipHalf(poly, nx, nz, d) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const A = poly[i], B = poly[(i + 1) % poly.length];
    const da = nx * A[0] + nz * A[1] - d, db = nx * B[0] + nz * B[1] - d;
    if (da <= 0) out.push(A);
    if ((da <= 0) !== (db <= 0)) { const s = da / (da - db); out.push([A[0] + (B[0] - A[0]) * s, A[1] + (B[1] - A[1]) * s]); }
  }
  return out;
}
const inRings = (rings, x, z) => rings.reduce((n, r) => n + (pointInPolygon(x, z, r.pts) ? 1 : 0), 0) % 2 === 1;

// A box on four corners [x, z] (any order round the box), from y0 to y1, with no bottom.
function box4(M, Q, y0, y1, c, info, topC = c, topInfo = info) {
  const cx = (Q[0][0] + Q[1][0] + Q[2][0] + Q[3][0]) / 4, cz = (Q[0][1] + Q[1][1] + Q[2][1] + Q[3][1]) / 4;
  M.face(Q.map(([x, z]) => [x, y1, z]), [0, 1, 0], topC, Q.map(([x, z]) => [x, z]), topInfo);
  for (let i = 0; i < 4; i++) {
    const A = Q[i], B = Q[(i + 1) % 4];
    let nx = B[1] - A[1], nz = -(B[0] - A[0]);
    const l = Math.hypot(nx, nz) || 1;
    nx /= l; nz /= l;
    if (nx * ((A[0] + B[0]) / 2 - cx) + nz * ((A[1] + B[1]) / 2 - cz) < 0) { nx = -nx; nz = -nz; }
    M.face([[A[0], y0, A[1]], [B[0], y0, B[1]], [B[0], y1, B[1]], [A[0], y1, A[1]]], [nx, 0, nz], c,
      [[0, 0], [l, 0], [l, y1 - y0], [0, y1 - y0]], info);
  }
}

// ---- furniture -------------------------------------------------------------------------------
// A piece stands on a local frame R: loc(s, t) gives the plan point at s along its length
// (0..L) and t out from the wall (0..D). X draws the parts and clips them at the cut, with a
// black cap where the cut goes through them.
function makeX(M, tower, f, y0, rng) {
  const top = y0 + CUT_H - 0.012;
  const cap = [tower, f, K.poche, 1];
  const X = {
    rng,
    pick: (arr) => arr[Math.floor(rng() * arr.length)],
    part(R, s0, s1, t0, t1, h0, h1, c, code = 0) {
      let ya = y0 + h0, yb = y0 + h1;
      if (ya >= top) return;
      const cut = yb > top;
      if (cut) yb = top;
      const Q = [R.loc(s0, t0), R.loc(s1, t0), R.loc(s1, t1), R.loc(s0, t1)];
      box4(M, Q, ya, yb, c, [tower, f, K.furn, code], cut ? C.black : c, cut ? cap : [tower, f, K.furn, code]);
    },
    round(R, s, t, r, h0, h1, c, code = 0, sides = 10) {
      let ya = y0 + h0, yb = y0 + h1;
      if (ya >= top) return;
      const cut = yb > top;
      if (cut) yb = top;
      const [x, z] = R.loc(s, t);
      M.prism(x, z, r, ya, yb, sides, cut ? C.black : c, cut ? cap : [tower, f, K.furn, code]);
    },
  };
  return X;
}

// The pieces. L and D are the sizes along the wall and out from it.
const stools = (X, R, s, t, r, n) => {
  const sc = X.pick(C.plastic);
  for (let q = 0; q < n; q++) {
    const a = (q / n) * Math.PI * 2 + X.rng() * 0.4;
    X.round(R, s + Math.cos(a) * r, t + Math.sin(a) * r, 0.15, 0, 0.44, sc, 0, 8);
  }
};
const PIECES = {
  bed: { L: 1.9, D: 0.92, build(X, R) {
    const wood = X.rng() < 0.6, fr = X.pick(wood ? C.wood : C.paint), code = wood ? 1 : 5;
    X.part(R, 0, 1.9, 0, 0.92, 0, 0.3, fr, code);
    X.part(R, 0, 0.05, 0, 0.92, 0.3, 0.85, fr, code);
    X.part(R, 0.04, 1.86, 0.04, 0.88, 0.3, 0.42, X.pick(C.sheet), 2);
    X.part(R, 0.08, 0.48, 0.14, 0.78, 0.42, 0.5, C.white);
    X.part(R, 0.72, 1.86, 0.03, 0.89, 0.42, 0.48, X.pick(C.quilt), 2);
    if (X.rng() < 0.55) for (const [s, t] of [[0, 0], [1.85, 0], [0, 0.87], [1.85, 0.87]]) X.part(R, s, s + 0.05, t, t + 0.05, 0, 1.9, fr, code);
  } },
  cot: { L: 1.8, D: 0.6, build(X, R) {
    X.part(R, 0, 1.8, 0, 0.6, 0, 0.36, X.pick(C.paint), 0);
    X.part(R, 0.03, 1.77, 0.03, 0.57, 0.36, 0.42, X.pick(C.quilt), 2);
  } },
  wardrobe: { L: 0.95, D: 0.52, build(X, R) { X.part(R, 0, 0.95, 0, 0.52, 0, 1.85, X.pick(C.wood), 1); } },
  tv: { L: 1.0, D: 0.45, build(X, R) {
    X.part(R, 0, 1.0, 0, 0.45, 0, 0.6, X.pick(C.wood), 1);
    X.part(R, 0.22, 0.78, 0.03, 0.42, 0.6, 1.02, C.dark);
    X.part(R, 0.27, 0.73, 0.42, 0.44, 0.65, 0.98, C.dark, 3);
  } },
  fridge: { L: 0.62, D: 0.62, build(X, R) { X.part(R, 0, 0.62, 0, 0.62, 0, 1.45, X.pick(C.appl), 5); } },
  kitchen: { L: 1.5, D: 0.56, build(X, R) {
    X.part(R, 0, 1.5, 0, 0.56, 0, 0.8, X.rng() < 0.5 ? C.tile : C.concrete, 0);
    X.part(R, 0.08, 0.62, 0.08, 0.48, 0.8, 0.9, C.dark, 5);
    X.round(R, 0.35, 0.28, 0.2, 0.9, 0.98, C.dark, 5);
    X.part(R, 0.95, 1.42, 0.06, 0.5, 0.74, 0.81, C.steel, 5);
    X.round(R, 0.75, 0.42, 0.08, 0.8, 0.98, X.pick(C.plastic));
  } },
  shrine: { L: 0.34, D: 0.24, build(X, R) {
    X.part(R, 0, 0.34, 0, 0.24, 0, 0.36, C.red, 0);
    X.part(R, 0.12, 0.22, 0.2, 0.25, 0.08, 0.2, C.red, 4);
    X.round(R, 0.17, 0.32, 0.04, 0, 0.08, C.gold);
  } },
  sofa: { L: 1.6, D: 0.78, build(X, R) {
    const c = X.pick(C.quilt);
    X.part(R, 0, 1.6, 0, 0.78, 0, 0.42, c, 2);
    X.part(R, 0, 1.6, 0, 0.2, 0.42, 0.82, c, 2);
    X.part(R, 0, 0.14, 0.2, 0.78, 0.42, 0.6, c, 2);
    X.part(R, 1.46, 1.6, 0.2, 0.78, 0.42, 0.6, c, 2);
  } },
  desk: { L: 1.0, D: 0.55, build(X, R) {
    const w = X.pick(C.wood);
    X.part(R, 0, 1.0, 0, 0.55, 0.7, 0.75, w, 1);
    X.part(R, 0, 0.4, 0, 0.55, 0, 0.7, w, 1);
    X.part(R, 0.96, 1.0, 0, 0.55, 0, 0.7, w, 1);
    X.part(R, 0.1, 0.5, 0.06, 0.32, 0.75, 0.8, C.white, 10);
    X.part(R, 0.58, 0.9, 0.6, 0.95, 0, 0.45, X.pick(C.paint));
    X.part(R, 0.58, 0.9, 0.9, 0.95, 0.45, 0.9, X.pick(C.paint));
  } },
  shelf: { L: 1.0, D: 0.32, build(X, R) {
    X.part(R, 0, 1.0, 0, 0.32, 0, 1.8, X.pick(C.wood), 7);
  } },
  boxes: { L: 0.7, D: 0.5, build(X, R) {
    let y = 0;
    for (let q = 0; q < 3; q++) {
      const hh = 0.25 + X.rng() * 0.2, i = X.rng() * 0.08;
      X.part(R, i, 0.7 - i, i, 0.5 - i, y, y + hh, X.pick(C.card));
      y += hh;
    }
  } },
  buckets: { L: 0.8, D: 0.42, build(X, R) {
    for (let q = 0; q < 3; q++) X.round(R, 0.16 + q * 0.25, 0.2, 0.15 + X.rng() * 0.04, 0, 0.32 + X.rng() * 0.1, X.pick(C.plastic), 0, 8);
  } },
  shoes: { L: 0.62, D: 0.26, build(X, R) {
    X.part(R, 0, 0.62, 0, 0.26, 0, 0.42, X.pick(C.wood), 1);
    for (let q = 0; q < 3; q++) X.part(R, 0.05 + q * 0.19, 0.18 + q * 0.19, 0.27, 0.5, 0, 0.04, X.pick(C.plastic));
  } },
  squat: { L: 0.42, D: 0.62, build(X, R) {
    X.part(R, 0, 0.42, 0, 0.62, 0, 0.06, C.white, 5);
    X.round(R, 0.21, 0.82, 0.14, 0, 0.3, X.pick(C.plastic), 0, 8);
  } },
  sewing: { L: 1.1, D: 0.62, build(X, R) {
    const t = X.pick(C.wood);
    X.part(R, 0, 1.1, 0, 0.62, 0.7, 0.75, t, 1);
    X.part(R, 0, 0.06, 0, 0.62, 0, 0.7, t, 1);
    X.part(R, 1.04, 1.1, 0, 0.62, 0, 0.7, t, 1);
    X.part(R, 0.3, 0.75, 0.15, 0.4, 0.75, 1.0, C.dark, 5);
    X.part(R, 0.62, 0.75, 0.15, 0.4, 0.75, 1.05, C.dark, 5);
    X.part(R, 0.82, 1.05, 0.2, 0.45, 0.75, 0.85, X.pick(C.quilt), 2);
    X.part(R, 0.35, 0.7, 0.8, 1.1, 0, 0.45, X.pick(C.plastic));
  } },
  moulder: { L: 2.1, D: 0.85, build(X, R) {
    const m = X.pick(C.machine);
    X.part(R, 0, 2.1, 0, 0.85, 0, 0.9, m, 5);
    X.part(R, 0.2, 1.3, 0.15, 0.7, 0.9, 1.3, m, 5);
    X.round(R, 1.6, 0.42, 0.24, 0.9, 1.5, C.steel, 5, 8);
    X.round(R, 0.4, 1.2, 0.26, 0, 0.5, X.pick(C.plastic), 7, 8);
  } },
  lathe: { L: 1.7, D: 0.6, build(X, R) {
    const m = X.pick(C.machine);
    X.part(R, 0, 1.7, 0, 0.6, 0, 0.82, m, 5);
    X.part(R, 0, 0.4, 0.05, 0.55, 0.82, 1.2, m, 5);
    X.part(R, 0.4, 1.6, 0.2, 0.4, 0.82, 0.92, C.steel, 5);
    X.part(R, 1.3, 1.6, 0.1, 0.5, 0.82, 1.05, m, 5);
  } },
  bench: { L: 1.8, D: 0.7, build(X, R) {
    const w = X.pick(C.wood);
    X.part(R, 0, 1.8, 0, 0.7, 0.82, 0.88, w, 1);
    for (const s of [0, 1.72]) X.part(R, s, s + 0.08, 0, 0.7, 0, 0.82, w, 1);
    X.part(R, 0.2, 0.42, 0.05, 0.3, 0.88, 1.02, C.steel, 5);
    for (let q = 0; q < 4; q++) X.part(R, 0.6 + q * 0.25, 0.75 + q * 0.25, 0.1 + X.rng() * 0.3, 0.3 + X.rng() * 0.3, 0.88, 0.95, X.pick(C.machine), 5);
  } },
  sacks: { L: 1.4, D: 0.9, build(X, R) {
    for (let q = 0; q < 6; q++) {
      const s = (q % 3) * 0.46, t = Math.floor(q / 3) * 0.45, y = X.rng() < 0.4 ? 0.28 : 0;
      X.part(R, s + 0.02, s + 0.44, t + 0.02, t + 0.43, y, y + 0.27, X.pick(C.sack));
    }
  } },
  noodles: { L: 1.6, D: 0.62, build(X, R) {
    for (const s of [0, 1.56]) for (const t of [0, 0.58]) X.part(R, s, s + 0.04, t, t + 0.04, 0, 1.75, C.bamboo, 1);
    X.part(R, 0.05, 1.55, 0.08, 0.54, 0.35, 1.7, C.white, 8);
  } },
  stove: { L: 1.3, D: 0.85, build(X, R) {
    X.part(R, 0, 1.3, 0, 0.85, 0, 0.85, col('#8a5a46'), 0);
    X.round(R, 0.38, 0.42, 0.32, 0.85, 0.98, C.dark, 5, 12);
    X.round(R, 0.95, 0.42, 0.24, 0.85, 1.25, C.bamboo, 1, 10);
  } },
  worktable: { L: 1.6, D: 0.8, build(X, R) {
    X.part(R, 0, 1.6, 0, 0.8, 0.8, 0.85, C.steel, 5);
    for (const s of [0, 1.55]) for (const t of [0, 0.75]) X.part(R, s, s + 0.05, t, t + 0.05, 0, 0.8, C.steel, 5);
    X.part(R, 0.2, 0.9, 0.2, 0.6, 0.85, 0.9, C.white, 8);
  } },
  bolts: { L: 1.2, D: 0.6, build(X, R) {
    for (let q = 0; q < 5; q++) X.part(R, q * 0.24, q * 0.24 + 0.22, 0, 0.6, 0, 0.22 + X.rng() * 0.5, X.pick(C.quilt), 2);
  } },
  crates: { L: 1.2, D: 0.8, build(X, R) {
    X.part(R, 0, 0.58, 0, 0.8, 0, 0.6, X.pick(C.wood), 1);
    X.part(R, 0.62, 1.2, 0, 0.8, 0, 0.55, X.pick(C.card));
    X.part(R, 0.66, 1.16, 0.05, 0.75, 0.55, 0.95, X.pick(C.card));
  } },
  counter: { L: 2.0, D: 0.6, build(X, R) {
    X.part(R, 0, 2.0, 0, 0.6, 0, 0.92, X.pick(C.wood), 1);
    X.part(R, 0.1, 1.2, 0.05, 0.55, 0.92, 1.08, C.glass, 9);
    X.part(R, 1.4, 1.75, 0.15, 0.45, 0.92, 1.02, C.dark, 5);
  } },
  goods: { L: 1.6, D: 0.4, build(X, R) { X.part(R, 0, 1.6, 0, 0.4, 0, 1.9, X.pick(C.wood), 7); } },
  herbs: { L: 2.2, D: 0.45, build(X, R) { X.part(R, 0, 2.2, 0, 0.45, 0, 2.0, col('#6a4630'), 6); } },
  dentist: { L: 1.9, D: 0.9, build(X, R) {
    const c = X.pick([col('#c9d6cf'), col('#d8c9a8'), col('#9fb6c2')]);
    X.round(R, 0.95, 0.45, 0.22, 0, 0.35, C.steel, 5, 8);
    X.part(R, 0.35, 1.2, 0.15, 0.75, 0.35, 0.55, c, 2);
    X.part(R, 1.2, 1.75, 0.15, 0.75, 0.55, 0.62, c, 2);
    X.part(R, 0.15, 0.35, 0.15, 0.75, 0.55, 0.95, c, 2);
    X.round(R, 1.6, 0.85, 0.12, 0, 0.75, C.white, 5, 8);
    X.part(R, 0.05, 0.1, 0.0, 0.05, 0, 1.9, C.steel, 5);
  } },
  cabinet: { L: 0.9, D: 0.45, build(X, R) {
    X.part(R, 0, 0.9, 0, 0.45, 0, 1.0, X.rng() < 0.5 ? C.white : X.pick(C.paint), 5);
    X.part(R, 0.05, 0.85, 0.05, 0.4, 1.0, 1.6, C.glass, 9);
  } },
  examine: { L: 1.85, D: 0.7, build(X, R) {
    X.part(R, 0, 1.85, 0, 0.7, 0, 0.62, C.white, 5);
    X.part(R, 0.03, 0.45, 0.1, 0.6, 0.62, 0.7, C.white);
  } },
  waiting: { L: 1.8, D: 0.45, build(X, R) {
    const w = X.pick(C.wood);
    X.part(R, 0, 1.8, 0, 0.45, 0.4, 0.45, w, 1);
    for (const s of [0.05, 1.7]) X.part(R, s, s + 0.06, 0.05, 0.4, 0, 0.4, w, 1);
    X.part(R, 0, 1.8, 0, 0.05, 0.45, 0.85, w, 1);
  } },
  altar: { L: 1.7, D: 0.65, build(X, R) {
    X.part(R, 0, 1.7, 0, 0.65, 0, 0.95, C.red, 0);
    for (let q = 0; q < 3; q++) X.part(R, 0.25 + q * 0.5, 0.45 + q * 0.5, 0.15, 0.35, 0.95, 1.4, C.gold, 5);
    X.round(R, 0.85, 0.85, 0.2, 0, 0.5, col('#7a6038'), 5, 8);
    X.part(R, 0.2, 1.5, 0.66, 0.7, 0.2, 0.75, C.gold, 4);
  } },
  pingpong: { L: 2.74, D: 1.52, build(X, R) {
    X.part(R, 0, 2.74, 0, 1.52, 0.72, 0.76, C.table, 12);
    for (const s of [0.3, 2.34]) X.part(R, s, s + 0.1, 0.2, 1.32, 0, 0.72, C.dark);
    X.part(R, 1.36, 1.38, -0.1, 1.62, 0.76, 0.92, C.white);
  } },
  blackboard: { L: 2.4, D: 0.08, build(X, R) { X.part(R, 0, 2.4, 0, 0.08, 0.85, 2.0, col('#2f4a3a'), 11); } },
  files: { L: 0.5, D: 0.62, build(X, R) { X.part(R, 0, 0.5, 0, 0.62, 0, 1.3, X.pick([col('#7d8a9c'), col('#8a8f86'), col('#c9c4b5')]), 6); } },
  safe: { L: 0.6, D: 0.6, build(X, R) { X.part(R, 0, 0.6, 0, 0.6, 0, 0.9, col('#3f5f4f'), 5); } },
};
// A desk with its chair, for the offices and the school.
PIECES.schooldesk = { L: 0.7, D: 0.95, build(X, R) {
  const w = X.pick(C.wood), p = X.pick(C.paint);
  X.part(R, 0, 0.7, 0, 0.45, 0.68, 0.72, w, 1);
  X.part(R, 0, 0.7, 0, 0.45, 0, 0.68, p);
  X.part(R, 0.18, 0.52, 0.6, 0.92, 0, 0.42, p);
  X.part(R, 0.18, 0.52, 0.88, 0.92, 0.42, 0.8, p);
} };

// What each kind of unit holds, along the walls and in the middle of the room. Tables in the
// middle get stools round them.
const ROOM = {
  home: { walls: ['bed', 'kitchen', 'wardrobe', 'bed', 'tv', 'fridge', 'shelf', 'boxes', 'buckets', 'bed', 'sofa', 'desk', 'boxes', 'cot'], table: 0.8 },
  plastics: { walls: ['moulder', 'moulder', 'sacks', 'bench', 'moulder', 'sacks', 'crates', 'bench'], table: 0.3 },
  metal: { walls: ['lathe', 'bench', 'lathe', 'crates', 'bench', 'lathe', 'sacks'], table: 0.2 },
  garment: { walls: ['sewing', 'sewing', 'sewing', 'bolts', 'sewing', 'sewing', 'bolts', 'sewing', 'boxes'], table: 0.6 },
  foodfac: { walls: ['noodles', 'stove', 'worktable', 'sacks', 'noodles', 'fridge', 'sacks', 'noodles'], table: 0.5 },
  works: { walls: ['bench', 'crates', 'shelf', 'bench', 'crates', 'boxes', 'sacks'], table: 0.3 },
  eating: { walls: ['counter', 'fridge', 'kitchen', 'shelf', 'boxes'], table: 1, tables: 4 },
  shop: { walls: ['counter', 'goods', 'goods', 'sacks', 'goods', 'boxes', 'goods'], table: 0 },
  medicine: { walls: ['herbs', 'counter', 'herbs', 'goods', 'sacks'], table: 0 },
  dentist: { walls: ['dentist', 'cabinet', 'waiting', 'dentist', 'cabinet', 'desk'], table: 0 },
  clinic: { walls: ['desk', 'examine', 'cabinet', 'waiting', 'cabinet', 'shelf'], table: 0 },
  office: { walls: ['desk', 'files', 'desk', 'safe', 'files', 'desk', 'shelf'], table: 0.5 },
  school: { walls: ['blackboard', 'desk', 'shelf'], table: 0, rows: 'schooldesk' },
  kaifong: { walls: ['desk', 'files', 'desk', 'shelf', 'files', 'safe'], table: 1 },
  temple: { walls: ['altar', 'shelf', 'boxes'], table: 0 },
  youth: { walls: ['shelf', 'tv', 'boxes', 'sofa'], table: 0, middle: 'pingpong' },
};
ROOM.storage = ROOM.works;

// Floors: [shader code, colours]. 4 terrazzo, 5 checker, 6 mosaic, 7 linoleum, 8 cement,
// 9 wet tiles (kitchens and toilets).
const FLOORS = {
  home: [[4, pal(['#b9b2a6', '#a8a39a', '#c4b8a0'])], [5, pal(['#d8d0c0', '#c9b9a0', '#b8c4bc'])], [6, pal(['#c9d3cf', '#d9cdb8', '#d6c8c0'])], [7, pal(['#a86f4d', '#7d6a55', '#8a7a5c', '#5f6e5c'])]],
  work: [[8, pal(['#8e8a82', '#9a958b', '#807b73'])]],
  shop: [[6, pal(['#c9d3cf', '#d9cdb8', '#c0c8c0'])], [5, pal(['#d8d0c0', '#c9b9a0'])], [4, pal(['#b9b2a6', '#c4b8a0'])]],
};
const floorFor = (use) => (use === 'home' ? FLOORS.home : ['eating', 'shop', 'medicine', 'dentist', 'clinic', 'office', 'kaifong', 'school', 'temple', 'youth'].includes(use) ? FLOORS.shop : FLOORS.work);

// ---- the cut storey ------------------------------------------------------------------------
// Floors, doors and furniture of the units of block b at storey f, plan P, drawing d.
export function furnish(M, L, b, f, P, d) {
  if (!P || !P.units.length) return;
  const F = frameOf(b), y0 = f * STOREY, use = b.uses[f];
  const rng = mulberry32((b.id * 7919 + f * 104729) | 0);
  const X = makeX(M, b.tower, f, y0, rng);
  const cellOf = (x, z) => {
    const i = Math.floor(x - L.x0), j = Math.floor(z - L.z0);
    return P.index.get(j * L.W + i);
  };
  const inUnit = (u, x, z) => { const i = cellOf(x, z); return i !== undefined && P.cell[i] === u.id && inRings(b.rings, x, z); };
  const toAW = (x, z) => [x * F.ux + z * F.uz, x * F.px + z * F.pz];
  const flatMap = new Map(d.flats.map((q) => [q.u, q.map]));

  for (const u of P.units) {
    // The floor: the unit's cells, clipped to the block and trimmed off the stairs.
    const [code, cols] = floorFor(use)[Math.floor(hash2(b.id * 31 + u.id, f) * floorFor(use).length)];
    const fc = cols[Math.floor(hash2(u.id, b.id + f) * cols.length)];
    const pinfo = [b.tower, f, K.plate, code];
    const yy = y0 + 0.035 + (u.id % 4) * 0.0015;
    for (const k of u.cells) {
      const x0 = L.cellX(k) - 0.5, z0 = L.cellZ(k) - 0.5;
      let poly = [[x0, z0], [x0 + 1, z0], [x0 + 1, z0 + 1], [x0, z0 + 1]];
      if (!poly.every(([x, z]) => inRings(b.rings, x, z))) {
        const outer = b.rings.find((r) => !r.hole && pointInPolygon(x0 + 0.5, z0 + 0.5, r.pts)) || b.rings[0];
        poly = clipHalf(clipHalf(clipHalf(clipHalf(outer.pts, 1, 0, x0 + 1), -1, 0, -x0), 0, 1, z0 + 1), 0, -1, -z0);
      }
      const [ca, cw] = toAW(x0 + 0.5, z0 + 0.5);
      for (const c of P.cores) {
        if (ca < c.a0 - 0.72 || ca > c.a1 + 0.72 || cw < c.w0 - 0.72 || cw > c.w1 + 0.72) continue;
        const v = [[c.a0 - ca, F.ux, F.uz, c.a0], [ca - c.a1, -F.ux, -F.uz, -c.a1], [c.w0 - cw, F.px, F.pz, c.w0], [cw - c.w1, -F.px, -F.pz, -c.w1]];
        const [, nx, nz, dd] = v.reduce((p, q) => (q[0] > p[0] ? q : p));
        poly = clipHalf(poly, nx, nz, dd);
      }
      if (poly.length < 3) continue;
      const tri = triangulate({ outer: poly, holes: [] });
      const v = M.nv;
      for (const [x, z] of tri.pts) M.vert([x, yy, z], [0, 1, 0], fc, [x, z], pinfo);
      for (const i of tri.idx) M.idx.push(v + i);
      M.nv += tri.pts.length;
    }

    // The door: a leaf swung open into the room, and outside some home doors the little
    // shrine to the earth god, with its red lamp.
    const door = u.door;
    let dA = null, dW = null, inA = 0, inW = 0;
    if (door) {
      dA = door.a; dW = door.w;
      if (door.axis === 'w') inW = u.where === 'below' ? -1 : 1;
      else inA = (u.a0 + u.a1) / 2 < door.a ? -1 : 1;
      const leaf = door.axis === 'w'
        ? { loc: (s, t) => toXZ(F, dA + 0.41 + t, dW + inW * s) }
        : { loc: (s, t) => toXZ(F, dA + inA * s, dW + 0.41 + t) };
      X.part(leaf, 0.02, 0.82, 0, 0.04, 0, 2.0, use === 'home' ? X.pick(C.wood) : X.pick(C.paint), use === 'home' ? 1 : 5);
      if (use === 'home' && rng() < 0.22) {
        const sh = door.axis === 'w'
          ? { loc: (s, t) => toXZ(F, dA - 0.85 + s, dW - inW * (0.04 + t)) }
          : { loc: (s, t) => toXZ(F, dA - inA * (0.04 + t), dW - 0.85 + s) };
        const [sx, sz] = sh.loc(0.17, 0.12), i = cellOf(sx, sz);
        if (i !== undefined && P.cell[i] === -1) PIECES.shrine.build(X, sh);
      }
    }

    // Placed boxes in the frame, to keep pieces apart and off the door and the stairs.
    const taken = [];
    for (const c of P.cores) taken.push([c.a0 - 0.1, c.a1 + 0.1, c.w0 - 0.1, c.w1 + 0.1]);
    const clearDoor = (a0, a1, w0, w1) => dA === null || Math.hypot(Math.max(a0 - dA, 0, dA - a1), Math.max(w0 - dW, 0, dW - w1)) > 0.85;
    const free = (a0, a1, w0, w1) => {
      if (!clearDoor(a0, a1, w0, w1)) return false;
      for (const [p0, p1, q0, q1] of taken) if (a0 < p1 + 0.04 && a1 > p0 - 0.04 && w0 < q1 + 0.04 && w1 > q0 - 0.04) return false;
      for (const [sa, sw] of [[0.02, 0.02], [0.98, 0.02], [0.98, 0.98], [0.02, 0.98], [0.5, 0.5], [0.5, 0.02], [0.5, 0.98], [0.02, 0.5], [0.98, 0.5]]) {
        const [x, z] = toXZ(F, a0 + (a1 - a0) * sa, w0 + (w1 - w0) * sw);
        if (!inUnit(u, x, z)) return false;
      }
      return true;
    };

    const map = flatMap.get(u);
    if (map) {
      // The surveyed flat (p340): its rooms in the template's metres.
      furnishSurvey(X, map, M, b, f, yy + 0.004);
      continue;
    }
    const room = ROOM[use] || ROOM.works;
    // Along the walls: try the pieces in turn, at spots along each side of the unit's box.
    const n = Math.max(2, Math.round(u.area / (use === 'home' ? 3.2 : 4.5)));
    const list = room.walls.slice(0, Math.min(room.walls.length, n));
    const sides = [
      (L0, D0, s) => [u.a0 + 0.04, u.a0 + 0.04 + D0, u.w0 + s, u.w0 + s + L0, (q, t) => toXZ(F, u.a0 + 0.04 + t, u.w0 + s + q)],
      (L0, D0, s) => [u.a1 - 0.04 - D0, u.a1 - 0.04, u.w0 + s, u.w0 + s + L0, (q, t) => toXZ(F, u.a1 - 0.04 - t, u.w0 + s + L0 - q)],
      (L0, D0, s) => [u.a0 + s, u.a0 + s + L0, u.w0 + 0.04, u.w0 + 0.04 + D0, (q, t) => toXZ(F, u.a0 + s + L0 - q, u.w0 + 0.04 + t)],
      (L0, D0, s) => [u.a0 + s, u.a0 + s + L0, u.w1 - 0.04 - D0, u.w1 - 0.04, (q, t) => toXZ(F, u.a0 + s + q, u.w1 - 0.04 - t)],
    ];
    const spanOf = (si) => (si < 2 ? u.w1 - u.w0 : u.a1 - u.a0);
    for (const key of list) {
      const p = PIECES[key];
      let done = false;
      const order = [0, 1, 2, 3].sort(() => rng() - 0.5);
      for (const si of order) {
        const span = spanOf(si) - p.L;
        if (span < 0) continue;
        const start = rng() * Math.min(span, 1.5);
        for (let s = start; s <= span && !done; s += 0.3) {
          const [a0, a1, w0, w1, loc] = sides[si](p.L, p.D, s);
          if (!free(a0, a1, w0, w1)) continue;
          taken.push([a0, a1, w0, w1]);
          p.build(X, { loc });
          done = true;
        }
        if (done) break;
      }
    }
    // The middle: a round table with stools, a ping pong table, or rows of desks.
    const midA = (u.a0 + u.a1) / 2, midW = (u.w0 + u.w1) / 2;
    if (room.rows) {
      const p = PIECES[room.rows];
      for (let a = u.a0 + 0.6; a + p.L < u.a1 - 0.4; a += p.L + 0.35)
        for (let w = u.w0 + 0.9; w + p.D < u.w1 - 0.3; w += p.D + 0.25) {
          if (!free(a, a + p.L, w, w + p.D)) continue;
          taken.push([a, a + p.L, w, w + p.D]);
          p.build(X, { loc: (q, t) => toXZ(F, a + q, w + t) });
        }
    } else if (room.middle) {
      const p = PIECES[room.middle];
      const a0 = midA - p.L / 2, w0 = midW - p.D / 2;
      if (free(a0 - 0.5, a0 + p.L + 0.5, w0, w0 + p.D)) { taken.push([a0, a0 + p.L, w0, w0 + p.D]); p.build(X, { loc: (q, t) => toXZ(F, a0 + q, w0 + t) }); }
    }
    const nt = room.tables || 1;
    for (let q = 0; q < nt; q++) {
      if (rng() >= room.table) continue;
      for (let tries = 0; tries < 14; tries++) {
        const a = midA + (rng() - 0.5) * Math.max(0, u.a1 - u.a0 - 1.6), w = midW + (rng() - 0.5) * Math.max(0, u.w1 - u.w0 - 1.6);
        if (!free(a - 0.72, a + 0.72, w - 0.72, w + 0.72)) continue;
        taken.push([a - 0.72, a + 0.72, w - 0.72, w + 0.72]);
        const R = { loc: (s, t) => toXZ(F, a + s, w + t) };
        X.round(R, 0, 0, 0.08, 0, 0.7, C.dark, 0, 6);
        X.round(R, 0, 0, 0.42 + rng() * 0.08, 0.7, 0.74, use === 'home' || rng() < 0.5 ? X.pick(C.wood) : C.white, 1, 14);
        if (use === 'home' && rng() < 0.4) X.round(R, 0.1, 0.05, 0.1, 0.74, 0.8, C.white);
        stools(X, R, 0, 0, 0.62, 3 + Math.floor(rng() * 2));
        break;
      }
    }
  }
}

// The flat of the 1987 survey (p340), in the template's metres (FLAT in floorplan.js): x along
// the outer wall, y from the outer wall (0) to the door wall. Each piece: [x0, y0, x1, y1,
// piece, turn]; turn lays the piece's length along y.
const SURVEY = [
  [0.08, 0.05, 2.08, 0.97, 'bed'], // cubicle C
  [2.24, 0.03, 3.56, 0.6, 'kitchen'], // kitchen D
  [3.8, 0.2, 4.25, 0.85, 'squat'], // toilet E
  [0.05, 2.5, 0.97, 4.45, 'bed', true], // cubicle B
  [0.05, 4.5, 0.97, 5.0, 'wardrobe', true],
  [1.62, 3.03, 3.34, 3.67, 'bed'], // bed space G
  [1.62, 3.72, 3.3, 4.18, 'cot'], // bed space F
  [3.75, 1.7, 4.55, 2.15, 'tv'],
  [3.95, 4.3, 4.55, 4.9, 'fridge'],
  [1.6, 1.7, 2.3, 2.15, 'boxes'],
];
const WET = [[2.2, 0, 3.6, 1.62], [3.6, 0, 4.6, 1.62]];
function furnishSurvey(X, map, M, b, f, y) {
  for (const [x0, y0, x1, y1, key, turn] of SURVEY) {
    const p = PIECES[key];
    const loc = turn
      ? (s, t) => map(x0 + ((x1 - x0) * t) / p.D, y0 + ((y1 - y0) * s) / p.L)
      : (s, t) => map(x0 + ((x1 - x0) * s) / p.L, y0 + ((y1 - y0) * t) / p.D);
    p.build(X, { loc });
  }
  // the table of the living room, with its stools
  const R = { loc: (s, t) => map(3.0 + s, 3.3 + t) };
  X.round(R, 0, 0, 0.08, 0, 0.7, C.dark, 0, 6);
  X.round(R, 0, 0, 0.45, 0.7, 0.74, X.pick(C.wood), 1, 14);
  stools(X, R, 0, 0, 0.62, 3);
  // wet tiles in the kitchen and the toilet
  for (const [x0, y0, x1, y1] of WET) {
    const Q = [map(x0, y0), map(x1, y0), map(x1, y1), map(x0, y1)];
    M.face(Q.map(([x, z]) => [x, y, z]), [0, 1, 0], C.tile, Q.map(([x, z]) => [x, z]), [b.tower, f, K.plate, 9]);
  }
}
