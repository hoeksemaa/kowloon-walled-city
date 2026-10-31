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
  china: pal(['#eef0ea', '#dfe8ec', '#e9e4d6', '#cfdde0']),
  flask: pal(['#c8352b', '#e0b02c', '#3f8f5a', '#e87fa0', '#2b62a8', '#e8e2d0']),
  bottle: pal(['#3a2418', '#5a3418', '#c9a23c', '#5a7a3a', '#e8e2d0']),
  book: pal(['#8a2a22', '#2b4a7a', '#3f6a4a', '#c9b48a', '#d9d4c4', '#6a4a7a']),
  gate: pal(['#3f4a44', '#4f5f52', '#4a4f4b', '#6b4a32', '#5d6b74']),
  alu: col('#b9bdbb'), paper: col('#dcd8cc'), ivory: col('#ece4cc'), back: col('#2f6b4a'),
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
//
// X also keeps the spots where people can lie, sit or work at the pieces (crowd.js): kind
// 'bed', 'seat', 'desk' or 'work'; h, the heading of a person there; y, the height of a bed;
// seat 1 if the piece is the seat, 0 if the person brings a stool.
function makeX(M, tower, f, y0, rng) {
  const top = y0 + CUT_H - 0.012;
  const cap = [tower, f, K.poche, 1];
  const X = {
    rng,
    unit: -1,
    spots: [],
    lamps: [],
    pick: (arr) => arr[Math.floor(rng() * arr.length)],
    // A spot at (s, t), facing along (ds, dt).
    spot(R, s, t, kind, ds, dt, y = 0, seat = 1) {
      const [x, z] = R.loc(s, t), [x1, z1] = R.loc(s + ds * 0.1, t + dt * 0.1);
      X.spots.push({ u: X.unit, x, z, h: Math.atan2(x1 - x, z1 - z), kind, y, seat });
    },
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
    X.spot(R, s + Math.cos(a) * r, t + Math.sin(a) * r, 'seat', -Math.cos(a), -Math.sin(a));
  }
};

// Small things: on the tops of the pieces, on the tables and on the floor. draw(X, R, s, t, h)
// centres the thing at (s, t) of the frame R, on a surface at height h. r: the radius of the
// floor that it takes. INFERRED: what lies where. The red, white and blue bag, the thermos
// flask and the rice cooker are the usual things of a Hong Kong home of the time.
const tone = (c, k) => c.clone().multiplyScalar(k);
const ITEMS = {
  bowl: { r: 0.07, draw: (X, R, s, t, h) => X.round(R, s, t, 0.065, h, h + 0.045, X.pick(C.china), 0, 6) },
  bowls: { r: 0.07, draw(X, R, s, t, h) {
    const c = X.pick(C.china);
    for (let q = 0; q < 3; q++) X.round(R, s, t, 0.066 - q * 0.004, h + q * 0.032, h + q * 0.032 + 0.04, c, 0, 6);
  } },
  cup: { r: 0.04, draw: (X, R, s, t, h) => X.round(R, s, t, 0.035, h, h + 0.08, X.pick(C.china), 0, 5) },
  teapot: { r: 0.08, draw(X, R, s, t, h) {
    const c = X.pick(C.china);
    X.round(R, s, t, 0.075, h, h + 0.1, c, 0, 7);
    X.round(R, s, t, 0.03, h + 0.1, h + 0.13, c, 0, 5);
    X.part(R, s + 0.06, s + 0.13, t - 0.012, t + 0.012, h + 0.04, h + 0.065, c);
  } },
  thermos: { r: 0.06, draw(X, R, s, t, h) {
    X.round(R, s, t, 0.058, h, h + 0.3, X.pick(C.flask), 5, 7);
    X.round(R, s, t, 0.038, h + 0.3, h + 0.35, C.white, 0, 6);
  } },
  pot: { r: 0.14, draw(X, R, s, t, h) {
    X.round(R, s, t, 0.13, h, h + 0.13, C.alu, 5, 9);
    X.round(R, s, t, 0.115, h + 0.13, h + 0.15, tone(C.alu, 0.85), 5, 9);
    X.round(R, s, t, 0.02, h + 0.15, h + 0.18, C.dark, 0, 5);
  } },
  cooker: { r: 0.14, draw(X, R, s, t, h) {
    X.round(R, s, t, 0.13, h, h + 0.19, C.white, 5, 9);
    X.round(R, s, t, 0.11, h + 0.19, h + 0.23, X.pick(C.flask), 5, 9);
  } },
  bottles: { r: 0.12, draw(X, R, s, t, h) {
    for (let q = 0; q < 3; q++) X.round(R, s + (q - 1) * 0.07, t + (X.rng() - 0.5) * 0.05, 0.03, h, h + 0.17 + X.rng() * 0.08, X.pick(C.bottle), 0, 5);
  } },
  board: { r: 0.18, draw: (X, R, s, t, h) => X.part(R, s - 0.16, s + 0.16, t - 0.11, t + 0.11, h, h + 0.03, C.bamboo, 1) },
  radio: { r: 0.14, draw(X, R, s, t, h) {
    const c = X.pick([C.dark, C.red, col('#c9c4b5'), col('#4f6b5a')]);
    X.part(R, s - 0.13, s + 0.13, t - 0.05, t + 0.05, h, h + 0.15, c, 5);
    X.part(R, s - 0.1, s + 0.1, t + 0.05, t + 0.055, h + 0.03, h + 0.11, C.dark, 10);
  } },
  books: { r: 0.12, draw(X, R, s, t, h) {
    let y = h;
    for (let q = 2 + Math.floor(X.rng() * 3); q > 0; q--) {
      const d = (X.rng() - 0.5) * 0.04;
      X.part(R, s - 0.1 + d, s + 0.1 + d, t - 0.075, t + 0.075, y, y + 0.035, X.pick(C.book));
      y += 0.035;
    }
  } },
  paper: { r: 0.2, draw: (X, R, s, t, h) => X.part(R, s - 0.19, s + 0.19, t - 0.14, t + 0.14, h, h + 0.008, C.paper, 10) },
  // a game of mahjong: four walls of tiles face down, and some tiles face up in the middle
  mahjong: { r: 0.3, draw(X, R, s, t, h) {
    for (const [s0, s1, t0, t1] of [[-0.22, 0.2, -0.24, -0.2], [0.2, 0.24, -0.22, 0.2], [-0.2, 0.22, 0.2, 0.24], [-0.24, -0.2, -0.2, 0.22]]) {
      X.part(R, s + s0, s + s1, t + t0, t + t1, h, h + 0.025, C.ivory);
      X.part(R, s + s0, s + s1, t + t0, t + t1, h + 0.025, h + 0.045, C.back);
    }
    for (let q = 0; q < 5; q++) {
      const a = (X.rng() - 0.5) * 0.24, b = (X.rng() - 0.5) * 0.24;
      X.part(R, s + a - 0.015, s + a + 0.015, t + b - 0.02, t + b + 0.02, h, h + 0.02, C.ivory);
    }
  } },
  basin: { r: 0.24, draw(X, R, s, t, h) {
    const c = X.pick(C.plastic);
    X.round(R, s, t, 0.22, h, h + 0.11, c, 0, 10);
    X.round(R, s, t, 0.18, h + 0.11, h + 0.112, tone(c, 0.72), 0, 10);
  } },
  bucket: { r: 0.16, draw: (X, R, s, t, h) => X.round(R, s, t, 0.15, h, h + 0.32, X.pick(C.plastic), 0, 8) },
  fan: { r: 0.2, draw(X, R, s, t, h) {
    const c = X.pick([col('#9fc3c8'), col('#e8e4da'), col('#7fae8f'), col('#d9a0a8')]);
    X.round(R, s, t, 0.14, h, h + 0.04, c, 5, 8);
    X.round(R, s, t, 0.02, h + 0.04, h + 0.62, C.steel, 5, 5);
    X.part(R, s - 0.17, s + 0.17, t - 0.04, t + 0.04, h + 0.55, h + 0.89, c, 10);
    X.part(R, s - 0.06, s + 0.06, t + 0.04, t + 0.14, h + 0.66, h + 0.78, c, 5);
  } },
  // the red, white and blue bag of woven plastic
  bag: { r: 0.24, draw(X, R, s, t, h) {
    const hh = 0.24 + X.rng() * 0.1;
    X.part(R, s - 0.21, s - 0.07, t - 0.12, t + 0.12, h, h + hh, col('#2b4f9a'), 2);
    X.part(R, s - 0.07, s + 0.07, t - 0.12, t + 0.12, h, h + hh, col('#e8e6df'), 2);
    X.part(R, s + 0.07, s + 0.21, t - 0.12, t + 0.12, h, h + hh, col('#b8302a'), 2);
  } },
  slippers: { r: 0.16, draw(X, R, s, t, h) {
    for (let q = 0; q < 2; q++) {
      const c = X.pick(C.plastic), o = q * 0.22 - 0.11 + (X.rng() - 0.5) * 0.04;
      X.part(R, s + o - 0.09, s + o - 0.01, t - 0.12, t + 0.12, h, h + 0.025, c);
      X.part(R, s + o + 0.01, s + o + 0.09, t - 0.11, t + 0.13, h, h + 0.025, c);
    }
  } },
  papers: { r: 0.22, draw(X, R, s, t, h) {
    let y = h;
    for (let q = 3 + Math.floor(X.rng() * 4); q > 0; q--) {
      const d = (X.rng() - 0.5) * 0.05;
      X.part(R, s - 0.2 + d, s + 0.2 + d, t - 0.15, t + 0.15, y, y + 0.04, C.paper, 10);
      y += 0.04;
    }
  } },
  // a drum of plastic pellets, its lid off
  drum: { r: 0.27, draw(X, R, s, t, h) {
    X.round(R, s, t, 0.25, h, h + 0.56, X.pick([col('#2b62a8'), col('#3a5f8a'), col('#7d8a9c')]), 5, 10);
    X.round(R, s, t, 0.21, h + 0.56, h + 0.57, X.pick(C.plastic), 2, 10);
  } },
  scraps: { r: 0.32, draw(X, R, s, t, h) {
    for (let q = 0; q < 4; q++) {
      const a = (X.rng() - 0.5) * 0.3, b = (X.rng() - 0.5) * 0.3, l = 0.08 + X.rng() * 0.14;
      X.part(R, s + a - l, s + a + l, t + b - 0.06, t + b + 0.06, h, h + 0.05 + X.rng() * 0.12, X.pick([C.steel, ...C.machine, ...C.card]), 5);
    }
  } },
  trolley: { r: 0.45, draw(X, R, s, t, h) {
    for (const [a, b] of [[-0.32, -0.2], [0.32, -0.2], [-0.32, 0.2], [0.32, 0.2]]) X.round(R, s + a, t + b, 0.05, h, h + 0.1, C.dark, 0, 6);
    X.part(R, s - 0.4, s + 0.4, t - 0.25, t + 0.25, h + 0.1, h + 0.14, C.steel, 5);
    X.part(R, s - 0.42, s - 0.38, t - 0.25, t + 0.25, h + 0.14, h + 0.95, C.steel, 5);
    X.part(R, s - 0.3, s + 0.1, t - 0.2, t + 0.2, h + 0.14, h + 0.44, X.pick(C.card));
    if (X.rng() < 0.6) X.part(R, s + 0.12, s + 0.38, t - 0.18, t + 0.12, h + 0.14, h + 0.36, X.pick(C.card));
  } },
  // a bamboo basket, full
  basket: { r: 0.24, draw(X, R, s, t, h) {
    X.round(R, s, t, 0.22, h, h + 0.3, C.bamboo, 1, 9);
    X.round(R, s, t, 0.19, h + 0.3, h + 0.33, X.pick([...C.quilt, ...C.sack, ...C.plastic]), 2, 9);
  } },
  rubbish: { r: 0.2, draw(X, R, s, t, h) {
    const c = X.pick([C.black, col('#e8e6df'), col('#2b2b29'), col('#c8352b')]);
    X.round(R, s, t, 0.19, h, h + 0.26, c, 0, 7);
    X.round(R, s + 0.03, t, 0.1, h + 0.26, h + 0.36, c, 0, 6);
  } },
  'pot plant': { r: 0.17, draw(X, R, s, t, h) {
    X.round(R, s, t, 0.15, h, h + 0.3, X.pick([col('#a65a3a'), col('#8a4a32'), col('#6e6a62')]), 0, 8);
    X.round(R, s, t, 0.2, h + 0.3, h + 0.5, X.pick([col('#4f6b3a'), col('#5d7a42'), col('#3f5a32')]), 0, 7);
    X.round(R, s + 0.03, t - 0.02, 0.11, h + 0.5, h + 0.75, X.pick([col('#4f6b3a'), col('#6f8f5a')]), 0, 6);
  } },
  sacks: { r: 0.3, draw(X, R, s, t, h) {
    X.part(R, s - 0.28, s + 0.02, t - 0.2, t + 0.2, h, h + 0.27, X.pick(C.sack));
    X.part(R, s + 0.03, s + 0.3, t - 0.2, t + 0.2, h, h + 0.25, X.pick(C.sack));
    if (X.rng() < 0.5) X.part(R, s - 0.14, s + 0.16, t - 0.18, t + 0.18, h + 0.26, h + 0.5, X.pick(C.sack));
  } },
  jar: { r: 0.09, draw(X, R, s, t, h) {
    X.round(R, s, t, 0.08, h, h + 0.17, C.glass, 9, 8);
    X.round(R, s, t, 0.06, h + 0.17, h + 0.2, X.pick([C.red, C.gold, C.dark]), 0, 8);
  } },
};
const put = (X, R, key, s, t, h) => ITEMS[key].draw(X, R, s, t, h);
const PIECES = {
  bed: { L: 1.9, D: 0.92, build(X, R) {
    const wood = X.rng() < 0.6, fr = X.pick(wood ? C.wood : C.paint), code = wood ? 1 : 5;
    X.part(R, 0, 1.9, 0, 0.92, 0, 0.3, fr, code);
    X.part(R, 0, 0.05, 0, 0.92, 0.3, 0.85, fr, code);
    X.part(R, 0.04, 1.86, 0.04, 0.88, 0.3, 0.42, X.pick(C.sheet), 2);
    X.part(R, 0.08, 0.48, 0.14, 0.78, 0.42, 0.5, C.white);
    X.part(R, 0.72, 1.86, 0.03, 0.89, 0.42, 0.48, X.pick(C.quilt), 2);
    if (X.rng() < 0.55) for (const [s, t] of [[0, 0], [1.85, 0], [0, 0.87], [1.85, 0.87]]) X.part(R, s, s + 0.05, t, t + 0.05, 0, 1.9, fr, code);
    // two to a bed, as in the crowded flats (pp158-161)
    X.spot(R, 0.98, 0.27, 'bed', 1, 0, 0.47);
    X.spot(R, 0.98, 0.66, 'bed', 1, 0, 0.47);
  } },
  cot: { L: 1.8, D: 0.6, build(X, R) {
    X.part(R, 0, 1.8, 0, 0.6, 0, 0.36, X.pick(C.paint), 0);
    X.part(R, 0.03, 1.77, 0.03, 0.57, 0.36, 0.42, X.pick(C.quilt), 2);
    X.spot(R, 0.92, 0.3, 'bed', 1, 0, 0.41);
  } },
  wardrobe: { L: 0.95, D: 0.52, build(X, R) { X.part(R, 0, 0.95, 0, 0.52, 0, 1.85, X.pick(C.wood), 1); } },
  tv: { L: 1.0, D: 0.45, build(X, R) {
    X.part(R, 0, 1.0, 0, 0.45, 0, 0.6, X.pick(C.wood), 1);
    X.part(R, 0.22, 0.78, 0.03, 0.42, 0.6, 1.02, C.dark);
    X.part(R, 0.27, 0.73, 0.42, 0.44, 0.65, 0.98, C.dark, 3);
    put(X, R, X.pick(['thermos', 'teapot', 'radio', 'cup', 'books']), X.rng() < 0.5 ? 0.11 : 0.89, 0.2, 0.6);
    X.spot(R, 0.5, 1.45, 'seat', 0, -1, 0, 0);
  } },
  // a low cupboard, with what a family keeps to hand on top of it
  chest: { L: 1.0, D: 0.45, build(X, R) {
    const w = X.pick(C.wood);
    X.part(R, 0, 1.0, 0, 0.45, 0, 0.78, w, 1);
    X.part(R, 0.49, 0.51, 0.45, 0.46, 0.1, 0.7, tone(w, 0.6), 1);
    const k = 1 + Math.floor(X.rng() * 3);
    for (let q = 0; q < k; q++) put(X, R, X.pick(['thermos', 'radio', 'teapot', 'cup', 'books', 'jar', 'bowls']), 0.18 + q * 0.32, 0.18 + X.rng() * 0.1, 0.78);
  } },
  fridge: { L: 0.62, D: 0.62, build(X, R) { X.part(R, 0, 0.62, 0, 0.62, 0, 1.45, X.pick(C.appl), 5); } },
  kitchen: { L: 1.5, D: 0.56, build(X, R) {
    X.part(R, 0, 1.5, 0, 0.56, 0, 0.8, X.rng() < 0.5 ? C.tile : C.concrete, 0);
    X.part(R, 0.08, 0.62, 0.08, 0.48, 0.8, 0.9, C.dark, 5);
    X.round(R, 0.35, 0.28, 0.2, 0.9, 0.98, C.dark, 5);
    X.part(R, 0.95, 1.42, 0.06, 0.5, 0.74, 0.81, C.steel, 5);
    if (X.rng() < 0.5) put(X, R, 'cooker', 0.79, 0.38, 0.8);
    else X.round(R, 0.75, 0.42, 0.08, 0.8, 0.98, X.pick(C.plastic));
    put(X, R, 'bottles', 0.8, 0.1, 0.8);
    put(X, R, X.pick(['bowls', 'bowls', 'pot', 'board']), 1.18, 0.3, 0.81);
    X.spot(R, 0.6, 0.86, 'work', 0, -1);
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
    X.spot(R, 0.48, 0.47, 'seat', 0, 1);
    X.spot(R, 1.12, 0.47, 'seat', 0, 1);
    X.spot(R, 0.82, 0.48, 'bed', 1, 0, 0.42);
  } },
  desk: { L: 1.0, D: 0.55, build(X, R) {
    const w = X.pick(C.wood);
    X.part(R, 0, 1.0, 0, 0.55, 0.7, 0.75, w, 1);
    X.part(R, 0, 0.4, 0, 0.55, 0, 0.7, w, 1);
    X.part(R, 0.96, 1.0, 0, 0.55, 0, 0.7, w, 1);
    X.part(R, 0.1, 0.5, 0.06, 0.32, 0.75, 0.8, C.white, 10);
    put(X, R, X.pick(['books', 'books', 'radio', 'thermos']), 0.76, 0.14, 0.75);
    if (X.rng() < 0.6) put(X, R, 'cup', 0.6, 0.4, 0.75);
    X.part(R, 0.58, 0.9, 0.6, 0.95, 0, 0.45, X.pick(C.paint));
    X.part(R, 0.58, 0.9, 0.9, 0.95, 0.45, 0.9, X.pick(C.paint));
    X.spot(R, 0.74, 0.8, 'desk', 0, -1);
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
    X.spot(R, 0.52, 0.95, 'desk', 0, -1);
  } },
  moulder: { L: 2.1, D: 0.85, build(X, R) {
    const m = X.pick(C.machine);
    X.part(R, 0, 2.1, 0, 0.85, 0, 0.9, m, 5);
    X.part(R, 0.2, 1.3, 0.15, 0.7, 0.9, 1.3, m, 5);
    X.round(R, 1.6, 0.42, 0.24, 0.9, 1.5, C.steel, 5, 8);
    X.round(R, 0.4, 1.2, 0.26, 0, 0.5, X.pick(C.plastic), 7, 8);
    X.spot(R, 1.0, 1.2, 'work', 0, -1);
  } },
  lathe: { L: 1.7, D: 0.6, build(X, R) {
    const m = X.pick(C.machine);
    X.part(R, 0, 1.7, 0, 0.6, 0, 0.82, m, 5);
    X.part(R, 0, 0.4, 0.05, 0.55, 0.82, 1.2, m, 5);
    X.part(R, 0.4, 1.6, 0.2, 0.4, 0.82, 0.92, C.steel, 5);
    X.part(R, 1.3, 1.6, 0.1, 0.5, 0.82, 1.05, m, 5);
    X.spot(R, 0.9, 0.95, 'work', 0, -1);
  } },
  bench: { L: 1.8, D: 0.7, build(X, R) {
    const w = X.pick(C.wood);
    X.part(R, 0, 1.8, 0, 0.7, 0.82, 0.88, w, 1);
    for (const s of [0, 1.72]) X.part(R, s, s + 0.08, 0, 0.7, 0, 0.82, w, 1);
    X.part(R, 0.2, 0.42, 0.05, 0.3, 0.88, 1.02, C.steel, 5);
    for (let q = 0; q < 4; q++) X.part(R, 0.6 + q * 0.25, 0.75 + q * 0.25, 0.1 + X.rng() * 0.3, 0.3 + X.rng() * 0.3, 0.88, 0.95, X.pick(C.machine), 5);
    X.spot(R, 0.5, 1.05, 'work', 0, -1);
    X.spot(R, 1.3, 1.05, 'work', 0, -1);
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
    X.spot(R, 0.8, 0.98, 'work', 0, -1);
  } },
  stove: { L: 1.3, D: 0.85, build(X, R) {
    X.part(R, 0, 1.3, 0, 0.85, 0, 0.85, col('#8a5a46'), 0);
    X.round(R, 0.38, 0.42, 0.32, 0.85, 0.98, C.dark, 5, 12);
    X.round(R, 0.95, 0.42, 0.24, 0.85, 1.25, C.bamboo, 1, 10);
    X.spot(R, 0.62, 1.18, 'work', 0, -1);
  } },
  worktable: { L: 1.6, D: 0.8, build(X, R) {
    X.part(R, 0, 1.6, 0, 0.8, 0.8, 0.85, C.steel, 5);
    for (const s of [0, 1.55]) for (const t of [0, 0.75]) X.part(R, s, s + 0.05, t, t + 0.05, 0, 0.8, C.steel, 5);
    X.part(R, 0.2, 0.9, 0.2, 0.6, 0.85, 0.9, C.white, 8);
    X.spot(R, 0.55, 1.12, 'work', 0, -1);
    X.spot(R, 1.15, -0.32, 'work', 0, 1);
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
    for (const t of [0.15, 0.42]) if (X.rng() < 0.7) put(X, R, 'jar', 1.88, t, 0.92);
    X.spot(R, 0.8, 0.95, 'work', 0, -1);
  } },
  goods: { L: 1.6, D: 0.4, build(X, R) { X.part(R, 0, 1.6, 0, 0.4, 0, 1.9, X.pick(C.wood), 7); } },
  herbs: { L: 2.2, D: 0.45, build(X, R) { X.part(R, 0, 2.2, 0, 0.45, 0, 2.0, col('#6a4630'), 6); X.spot(R, 1.1, 0.8, 'work', 0, -1); } },
  dentist: { L: 1.9, D: 0.9, build(X, R) {
    const c = X.pick([col('#c9d6cf'), col('#d8c9a8'), col('#9fb6c2')]);
    X.round(R, 0.95, 0.45, 0.22, 0, 0.35, C.steel, 5, 8);
    X.part(R, 0.35, 1.2, 0.15, 0.75, 0.35, 0.55, c, 2);
    X.part(R, 1.2, 1.75, 0.15, 0.75, 0.55, 0.62, c, 2);
    X.part(R, 0.15, 0.35, 0.15, 0.75, 0.55, 0.95, c, 2);
    X.round(R, 1.6, 0.85, 0.12, 0, 0.75, C.white, 5, 8);
    X.part(R, 0.05, 0.1, 0.0, 0.05, 0, 1.9, C.steel, 5);
    X.spot(R, 0.75, 1.15, 'work', 0, -1);
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
    X.spot(R, 0.45, 0.26, 'seat', 0, 1);
    X.spot(R, 1.35, 0.26, 'seat', 0, 1);
  } },
  altar: { L: 1.7, D: 0.65, build(X, R) {
    X.part(R, 0, 1.7, 0, 0.65, 0, 0.95, C.red, 0);
    for (let q = 0; q < 3; q++) X.part(R, 0.25 + q * 0.5, 0.45 + q * 0.5, 0.15, 0.35, 0.95, 1.4, C.gold, 5);
    X.round(R, 0.85, 0.85, 0.2, 0, 0.5, col('#7a6038'), 5, 8);
    X.part(R, 0.2, 1.5, 0.66, 0.7, 0.2, 0.75, C.gold, 4);
    X.spot(R, 0.85, 1.15, 'work', 0, -1);
  } },
  pingpong: { L: 2.74, D: 1.52, build(X, R) {
    X.part(R, 0, 2.74, 0, 1.52, 0.72, 0.76, C.table, 12);
    for (const s of [0.3, 2.34]) X.part(R, s, s + 0.1, 0.2, 1.32, 0, 0.72, C.dark);
    X.part(R, 1.36, 1.38, -0.1, 1.62, 0.76, 0.92, C.white);
    X.spot(R, -0.42, 0.76, 'work', 1, 0);
    X.spot(R, 3.16, 0.76, 'work', -1, 0);
  } },
  blackboard: { L: 2.4, D: 0.08, build(X, R) { X.part(R, 0, 2.4, 0, 0.08, 0.85, 2.0, col('#2f4a3a'), 11); X.spot(R, 1.2, 0.62, 'work', 0, -1); } },
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
  X.spot(R, 0.35, 0.76, 'desk', 0, -1);
} };

// What each kind of unit holds, along the walls and in the middle of the room. Tables in the
// middle get stools round them.
const ROOM = {
  home: { walls: ['bed', 'kitchen', 'wardrobe', 'bed', 'tv', 'chest', 'fridge', 'shelf', 'boxes', 'buckets', 'bed', 'chest', 'sofa', 'desk', 'boxes', 'cot'], table: 0.8 },
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

// What lies on the floor of each kind of unit (ITEMS). The floor plate is a little above the
// storey line, so the things on it stand at FLOOR_Y.
const STREW = {
  home: ['basin', 'fan', 'bag', 'slippers', 'bucket', 'papers', 'bag', 'basin', 'fan', 'slippers'],
  plastics: ['drum', 'drum', 'scraps', 'trolley', 'bag', 'basket'],
  metal: ['scraps', 'scraps', 'drum', 'trolley', 'bucket'],
  garment: ['basket', 'bag', 'basket', 'fan', 'bag', 'papers'],
  foodfac: ['basin', 'basket', 'bucket', 'basin', 'drum'],
  works: ['scraps', 'bag', 'drum', 'trolley', 'basket', 'papers'],
  eating: ['basin', 'bucket', 'basket', 'bag'],
  shop: ['basket', 'basket', 'bag', 'papers'],
  medicine: ['basket', 'basket', 'bag'],
  dentist: ['fan', 'bucket'], clinic: ['fan', 'bucket'], office: ['papers', 'fan', 'papers'],
  kaifong: ['papers', 'fan'], school: ['bucket'], temple: ['basket'], youth: ['fan', 'bag'],
};
STREW.storage = STREW.works;
const FLOOR_Y = 0.04, CORRIDOR_Y = 0.05;

// What lies on a table of radius tr with n stools round it: a bowl for each stool in a cooked
// food stall; in a home, a game of mahjong or a few cups, bowls and flasks.
function tableTop(X, R, use, tr, n) {
  const h = 0.74, a0 = X.rng() * Math.PI * 2;
  if (use === 'eating') {
    for (let q = 0; q < n; q++) { const a = a0 + (q / n) * Math.PI * 2; put(X, R, 'bowl', Math.cos(a) * tr * 0.64, Math.sin(a) * tr * 0.64, h); }
    put(X, R, 'bottles', 0, 0, h);
    return;
  }
  if (use === 'home' && X.rng() < 0.2) { put(X, R, 'mahjong', 0, 0, h); return; }
  const list = use === 'home' ? ['bowl', 'bowls', 'cup', 'cup', 'teapot', 'thermos', 'paper', 'bowl'] : ['cup', 'paper', 'thermos', 'books', 'cup'];
  const k = 1 + Math.floor(X.rng() * 4);
  for (let q = 0; q < k; q++) {
    const key = list[Math.floor(X.rng() * list.length)], a = a0 + (q / k) * Math.PI * 2, r = k === 1 ? 0 : tr - 0.06 - ITEMS[key].r;
    put(X, R, key, Math.cos(a) * r, Math.sin(a) * r, h);
  }
}

// Floors: [shader code, colours]. 4 terrazzo, 5 checker, 6 mosaic, 7 linoleum, 8 cement,
// 9 wet tiles (kitchens and toilets).
const FLOORS = {
  home: [[4, pal(['#b9b2a6', '#a8a39a', '#c4b8a0'])], [5, pal(['#d8d0c0', '#c9b9a0', '#b8c4bc'])], [6, pal(['#c9d3cf', '#d9cdb8', '#d6c8c0'])], [7, pal(['#a86f4d', '#7d6a55', '#8a7a5c', '#5f6e5c'])]],
  work: [[8, pal(['#8e8a82', '#9a958b', '#807b73'])]],
  shop: [[6, pal(['#c9d3cf', '#d9cdb8', '#c0c8c0'])], [5, pal(['#d8d0c0', '#c9b9a0'])], [4, pal(['#b9b2a6', '#c4b8a0'])]],
};
const floorFor = (use) => (use === 'home' ? FLOORS.home : ['eating', 'shop', 'medicine', 'dentist', 'clinic', 'office', 'kaifong', 'school', 'temple', 'youth'].includes(use) ? FLOORS.shop : FLOORS.work);

// ---- the cut storey ------------------------------------------------------------------------
// Floors, doors and furniture of the units of block b at storey f, plan P, drawing d. Gives
// the spots of the people at the furniture (makeX), and a lamp for each unit: a pool of light
// over its box in the frame (lamps.js), a tungsten bulb in a home, tubes elsewhere. tint: a
// colour that the floors take 40 % of (the colour of the use in the legend), or none.
export function furnish(M, L, b, f, P, d, tint) {
  if (!P || !P.units.length) return { spots: [], lamps: [] };
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
  const hallUsed = []; // [x, z, r] of the things in the corridor

  for (const u of P.units) {
    X.unit = u.id;
    const s0 = X.spots.length;
    const [lx, lz] = toXZ(F, (u.a0 + u.a1) / 2, (u.w0 + u.w1) / 2);
    X.lamps.push({ u: u.id, x: lx, z: lz, ra: (u.a1 - u.a0) / 2, rw: (u.w1 - u.w0) / 2, axis: [F.ux, F.uz, F.px, F.pz], warm: use === 'home' });
    // The floor: the unit's cells, clipped to the block and trimmed off the stairs.
    const [code, cols] = floorFor(use)[Math.floor(hash2(b.id * 31 + u.id, f) * floorFor(use).length)];
    let fc = cols[Math.floor(hash2(u.id, b.id + f) * cols.length)];
    if (tint) fc = fc.clone().lerp(tint, 0.4);
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
    // shrine to the earth god, with its red lamp. Outside the door, in the corridor: the iron
    // gate of a flat folded back by day, shoes, a bucket, a bag of rubbish; sacks and drums
    // by a workshop. INFERRED.
    const door = u.door;
    let dA = null, dW = null, inA = 0, inW = 0, shrine = false;
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
        if (i !== undefined && P.cell[i] === -1) { PIECES.shrine.build(X, sh); shrine = true; }
      }
      // The corridor side: s along the wall from the middle of the door, t out from the wall.
      const out = door.axis === 'w'
        ? { loc: (s, t) => toXZ(F, dA + s, dW - inW * t) }
        : { loc: (s, t) => toXZ(F, dA - inA * t, dW + s) };
      const hall = (s0, s1, t1) => [[s0, 0.04], [s1, 0.04], [s0, t1], [s1, t1]].every(([s, t]) => {
        const [x, z] = out.loc(s, t), i = cellOf(x, z);
        return i !== undefined && P.cell[i] === -1 && inRings(b.rings, x, z) && !P.cores.some((c) => {
          const [a, w] = toAW(x, z);
          return a > c.a0 - 0.1 && a < c.a1 + 0.1 && w > c.w0 - 0.1 && w < c.w1 + 0.1;
        });
      });
      const home = use === 'home';
      if (home && rng() < 0.7 && hall(0.42, 0.58, 0.12)) {
        const g = X.pick(C.gate);
        X.part(out, 0.43, 0.57, 0.04, 0.11, 0, 2.05, g, 5);
        X.part(out, 0.41, 0.59, 0.03, 0.12, 2.05, 2.1, g, 5);
      }
      const things = home ? ['slippers', 'slippers', 'bucket', 'rubbish', 'basin', 'pot plant'] : ['sacks', 'drum', 'rubbish', 'bucket', 'basket'];
      for (const s of shrine ? [0.82] : [0.82, -0.72]) {
        if (rng() > (home ? 0.45 : 0.35)) continue;
        const key = things[Math.floor(rng() * things.length)], r = ITEMS[key].r;
        if (!hall(s - r, s + r, 0.06 + 2 * r)) continue;
        const [x, z] = out.loc(s, 0.05 + r);
        if (hallUsed.some(([x1, z1, r1]) => Math.hypot(x - x1, z - z1) < r + r1 + 0.1)) continue;
        hallUsed.push([x, z, r]);
        put(X, out, key, s, 0.05 + r, CORRIDOR_Y);
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
    // At night, mats on the free floor of a home for those with no bed: the first free places
    // on a grid, along the unit and across it. They come before the table: in a small flat the
    // floor is for sleep. INFERRED.
    if (use === 'home') {
      let m = 0;
      for (const along of [true, false]) {
        const LA = along ? 1.8 : 0.72, LW = along ? 0.72 : 1.8;
        for (let a0 = u.a0 + 0.06; a0 + LA < u.a1 - 0.05 && m < 3; a0 += 0.3)
          for (let w0 = u.w0 + 0.06; w0 + LW < u.w1 - 0.05 && m < 3; w0 += 0.3) {
            if (!free(a0, a0 + LA, w0, w0 + LW)) continue;
            taken.push([a0, a0 + LA, w0, w0 + LW]);
            X.spot({ loc: along ? (q, t) => toXZ(F, a0 + q, w0 + t) : (q, t) => toXZ(F, a0 + t, w0 + q) }, 0.9, 0.36, 'bed', 1, 0, 0, 0);
            m++;
          }
      }
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
        const tr = 0.42 + rng() * 0.08, ns = 3 + Math.floor(rng() * 2);
        X.round(R, 0, 0, tr, 0.7, 0.74, use === 'home' || rng() < 0.5 ? X.pick(C.wood) : C.white, 1, 14);
        stools(X, R, 0, 0, 0.62, ns);
        tableTop(X, R, use, tr, ns);
        break;
      }
    }
    // Things on the free floor, along the walls or out in the room, but not where people
    // sit, sleep or work.
    const strew = STREW[use] || STREW.works, mine = X.spots.slice(s0);
    const ns = Math.max(1, Math.min(8, Math.round(u.area / (use === 'home' ? 2.6 : 4))));
    for (let q = 0; q < ns; q++) {
      const key = strew[Math.floor(rng() * strew.length)], r = ITEMS[key].r + 0.03, e = r + 0.05;
      for (let tries = 0; tries < 10; tries++) {
        let a = u.a0 + e + rng() * Math.max(0, u.a1 - u.a0 - 2 * e), w = u.w0 + e + rng() * Math.max(0, u.w1 - u.w0 - 2 * e);
        if (rng() < 0.65) {
          if (rng() < 0.5) a = rng() < 0.5 ? u.a0 + e : u.a1 - e;
          else w = rng() < 0.5 ? u.w0 + e : u.w1 - e;
        }
        if (!free(a - r, a + r, w - r, w + r)) continue;
        const [x, z] = toXZ(F, a, w);
        if (mine.some((p) => Math.hypot(p.x - x, p.z - z) < r + 0.42)) continue;
        taken.push([a - r, a + r, w - r, w + r]);
        put(X, { loc: (s, t) => toXZ(F, a + s, w + t) }, key, 0, 0, FLOOR_Y);
        break;
      }
    }
  }
  return { spots: X.spots, lamps: X.lamps };
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
  tableTop(X, R, 'home', 0.45, 3);
  const B = { loc: (s, t) => map(2.4 + s, 1.0 + t) };
  put(X, B, 'basin', 0, 0, FLOOR_Y);
  put(X, { loc: (s, t) => map(4.2 + s, 2.6 + t) }, 'fan', 0, 0, FLOOR_Y);
  // wet tiles in the kitchen and the toilet
  for (const [x0, y0, x1, y1] of WET) {
    const Q = [map(x0, y0), map(x1, y0), map(x1, y1), map(x0, y1)];
    M.face(Q.map(([x, z]) => [x, y, z]), [0, 1, 0], C.tile, Q.map(([x, z]) => [x, z]), [b.tower, f, K.plate, 9]);
  }
}
