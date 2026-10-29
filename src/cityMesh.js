// Turns the layout into one merged mesh per storey, so each storey can be lifted apart
// (exploded view) or cut away (plan view) as a unit.
import * as THREE from 'three';
import { STOREY, MAX_FLOORS } from './layout.js';
import { FloatBuf, mulberry32 } from './util.js';

export const CUT_H = 1.1; // height of the plan cut above a floor, metres

// Surface kinds, read by the facade shader.
export const K = {
  wall: 0, plate: 1, roof: 2, alley: 3, parapet: 4, prop: 5, cage: 6, ac: 7,
  laundry: 8, sign: 9, tube: 10, plain: 11, poche: 12,
};

export const USE_COLORS = {
  home: '#cdbb9f',
  plastics: '#8fa3ab', metal: '#7f8c94', garment: '#a3a7bb', textile: '#9aa9a0', factory: '#a0a69f',
  meat: '#c78a7c', cakes: '#d9b77a',
  shop: '#c99a78', food: '#d3a46c', clinic: '#a3c4b7', dentist: '#b4cbc4', mahjong: '#b98aa0',
  school: '#cbb96e', temple: '#b8574a', kaifong: '#c9a35c', youth: '#b6b08c', yamen: '#bdb3a0',
};

const col = (hex) => new THREE.Color(hex);

class Builder {
  constructor() {
    this.pos = new FloatBuf(); this.nor = new FloatBuf(); this.col = new FloatBuf();
    this.uv = new FloatBuf(); this.info = new FloatBuf();
    this.idx = []; this.nv = 0;
  }
  quad(p, n, c, uv, info) {
    for (let i = 0; i < 4; i++) {
      this.pos.p3(p[i][0], p[i][1], p[i][2]);
      this.nor.p3(n[0], n[1], n[2]);
      this.col.p3(c.r, c.g, c.b);
      this.uv.p2(uv[i][0], uv[i][1]);
      this.info.p4(info[0], info[1], info[2], info[3]);
    }
    const v = this.nv;
    this.idx.push(v, v + 1, v + 2, v, v + 2, v + 3);
    this.nv += 4;
  }
  hrect(xa, za, xb, zb, y, c, info) {
    this.quad([[xa, y, za], [xa, y, zb], [xb, y, zb], [xb, y, za]], [0, 1, 0], c,
      [[xa, za], [xa, zb], [xb, zb], [xb, za]], info);
  }
  // Vertical quad from A to B, left to right as seen from the side the normal points to.
  vwall(A, B, y0, y1, n, c, uA, uB, info) {
    const h = y1 - y0;
    this.quad([[A[0], y0, A[1]], [B[0], y0, B[1]], [B[0], y1, B[1]], [A[0], y1, A[1]]], n, c,
      [[uA, 0], [uB, 0], [uB, h], [uA, h]], info);
  }
  box(x0, y0, z0, x1, y1, z1, c, info) {
    this.hrect(x0, z0, x1, z1, y1, c, info);
    this.vwall([x1, z1], [x1, z0], y0, y1, [1, 0, 0], c, z1, z0, info);
    this.vwall([x0, z0], [x0, z1], y0, y1, [-1, 0, 0], c, z0, z1, info);
    this.vwall([x0, z1], [x1, z1], y0, y1, [0, 0, 1], c, x0, x1, info);
    this.vwall([x1, z0], [x0, z0], y0, y1, [0, 0, -1], c, x1, x0, info);
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos.view().slice(), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(this.nor.view().slice(), 3));
    g.setAttribute('color', new THREE.BufferAttribute(this.col.view().slice(), 3));
    g.setAttribute('aWall', new THREE.BufferAttribute(this.uv.view().slice(), 2));
    g.setAttribute('aInfo', new THREE.BufferAttribute(this.info.view().slice(), 4));
    g.setIndex(new THREE.BufferAttribute(new Uint32Array(this.idx), 1));
    g.computeBoundingSphere();
    return g;
  }
}

// Outline edges of a building's cells, merged into straight runs.
// skip(o) tells whether a wall facing building o is hidden.
function edgesOf(L, b, skip) {
  const { W, D, owner, inside, alley } = L;
  const runs = new Map();
  const add = (dir, line, pos) => {
    const key = dir * 100000 + line;
    let a = runs.get(key);
    if (!a) runs.set(key, (a = []));
    a.push(pos);
  };
  const exposed = (ni, nj) => {
    if (ni < 0 || nj < 0 || ni >= W || nj >= D) return true;
    const o = owner[nj * W + ni];
    if (o === b.id) return false;
    return !(o >= 0 && skip(o));
  };
  for (const c of b.cells) {
    const i = c % W, j = (c / W) | 0;
    if (exposed(i + 1, j)) add(0, i + 1, j);
    if (exposed(i - 1, j)) add(1, i, j);
    if (exposed(i, j + 1)) add(2, j + 1, i);
    if (exposed(i, j - 1)) add(3, j, i);
  }
  const out = [];
  for (const [key, arr] of runs) {
    const dir = Math.floor(key / 100000), line = key % 100000;
    arr.sort((p, q) => p - q);
    let s = arr[0], e = arr[0] + 1;
    for (let m = 1; m <= arr.length; m++) {
      if (m < arr.length && arr[m] === e) { e++; continue; }
      // What the run faces, sampled at its middle.
      const mid = Math.floor((s + e - 1) / 2);
      let ni, nj;
      if (dir === 0) { ni = line; nj = mid; } else if (dir === 1) { ni = line - 1; nj = mid; }
      else if (dir === 2) { ni = mid; nj = line; } else { ni = mid; nj = line - 1; }
      const nk = nj * W + ni;
      const facing = !inside[nk] || alley[nk] === 3 ? 'street' : alley[nk] ? 'alley' : 'building';
      out.push({ dir, line, a: s, b: e, facing });
      if (m < arr.length) { s = arr[m]; e = s + 1; }
    }
  }
  return out;
}

function edgeGeom(L, e) {
  const { x0, z0 } = L;
  if (e.dir === 0) { const X = x0 + e.line; return { A: [X, z0 + e.b], B: [X, z0 + e.a], n: [1, 0, 0], uA: z0 + e.b, uB: z0 + e.a }; }
  if (e.dir === 1) { const X = x0 + e.line; return { A: [X, z0 + e.a], B: [X, z0 + e.b], n: [-1, 0, 0], uA: z0 + e.a, uB: z0 + e.b }; }
  if (e.dir === 2) { const Z = z0 + e.line; return { A: [x0 + e.a, Z], B: [x0 + e.b, Z], n: [0, 0, 1], uA: x0 + e.a, uB: x0 + e.b }; }
  const Z = z0 + e.line;
  return { A: [x0 + e.b, Z], B: [x0 + e.a, Z], n: [0, 0, -1], uA: x0 + e.b, uB: x0 + e.a };
}

// A point on (or `out` metres in front of) a wall, at position u along it.
function wallPoint(g, u, out) {
  return g.n[0] !== 0 ? [g.A[0] + g.n[0] * out, u] : [u, g.A[1] + g.n[2] * out];
}

function wallBox(B, g, u, h, y0, y1, o0, o1, c, info) {
  const p = wallPoint(g, u - h, o0), q = wallPoint(g, u + h, o1);
  B.box(Math.min(p[0], q[0]), y0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y1, Math.max(p[1], q[1]), c, info);
}

// Greedy rectangles covering a set of cells: [i0, j0, i1, j1] in cell units.
export function rects(L, cells) {
  const { W } = L;
  const set = new Set(cells), used = new Set(), out = [];
  for (const c of [...cells].sort((a, b) => a - b)) {
    if (used.has(c)) continue;
    const i = c % W, j = (c / W) | 0;
    let w = 1;
    while (set.has(c + w) && !used.has(c + w) && (c + w) % W !== 0) w++;
    let h = 1;
    outer: for (;;) {
      const r = c + h * W;
      for (let q = 0; q < w; q++) if (!set.has(r + q) || used.has(r + q)) break outer;
      h++;
    }
    for (let y = 0; y < h; y++) for (let q = 0; q < w; q++) used.add(c + y * W + q);
    out.push([i, j, i + w, j + h]);
  }
  return out;
}

const PAL = {
  roof: ['#8a877f', '#7b7a74', '#94918a', '#6f6e69', '#86837a', '#7f7a70'],
  cage: ['#3e4441', '#4a4f4b', '#5a5246', '#6b6a5f', '#556b62', '#7a6d5c'],
  cloth: ['#d9d4c7', '#a33a2e', '#2f4f7a', '#d8b54a', '#6f8f5a', '#e6e2d8', '#c76f86', '#3d3d40', '#5d86a8'],
  sign: ['#b8261c', '#d9a72a', '#e8e2d0', '#1f6e4a', '#c43f2a', '#2a4e8c', '#e8e2d0'],
  tank: ['#9fb6c2', '#d9d7cf', '#8b8f8c', '#a46c48', '#6d8796', '#c9c4b5'],
};
const palette = Object.fromEntries(Object.entries(PAL).map(([k, v]) => [k, v.map(col)]));
const pickc = (rng, arr) => arr[Math.floor(rng() * arr.length)];

export function buildLevels(L) {
  const rng = mulberry32(77);
  const facade = L.buildings.map((b) => col(b.color));
  const useCol = Object.fromEntries(Object.entries(USE_COLORS).map(([k, v]) => [k, col(v)]));
  const C = {
    alley: col('#3a3d39'), yard: col('#6c695f'), road: col('#5f5c55'), tube: col('#e8f5ee'), ac: col('#cfcac0'),
    bamboo: col('#b39b62'), hut: col('#9a968c'), yamenWall: col('#8c877c'), yamenRoof: col('#4f5651'),
  };
  const levels = [];
  for (let k = 0; k < MAX_FLOORS; k++) {
    const B = new Builder();
    const ant = [];
    for (const b of L.buildings) {
      if (b.floors <= k) continue;
      if (b.kind === 'yamen') {
        buildYamen(B, L, b, C, useCol);
        continue;
      }
      const y0 = k * STOREY, y1 = y0 + STOREY;
      const info = (kind) => [b.id, k, kind, b.modW];
      for (const [i0, j0, i1, j1] of rects(L, b.cells))
        B.hrect(L.x0 + i0, L.z0 + j0, L.x0 + i1, L.z0 + j1, y0 + 0.02, useCol[b.uses[k]], info(K.plate));

      const edges = edgesOf(L, b, (o) => L.buildings[o].floors > k);
      for (const e of edges) {
        const g = edgeGeom(L, e);
        B.vwall(g.A, g.B, y0, y1, g.n, facade[b.id], g.uA, g.uB, info(K.wall));
        const umin = Math.min(g.uA, g.uB), umax = Math.max(g.uA, g.uB);
        if (umax - umin < 1.2) continue;
        if (k <= 1 && e.facing === 'alley')
          for (let u = umin + 1.5; u < umax - 0.6; u += 5 + rng() * 3)
            wallBox(B, g, u, 0.45, y0 + 2.42, y0 + 2.5, 0, 0.1, C.tube, info(K.tube));
        if (k === 0) continue;
        const m = b.modW;
        for (let wi = Math.ceil(umin / m); (wi + 0.5) * m < umax - 0.45; wi++) {
          const u = (wi + 0.5) * m;
          if (u < umin + 0.45) continue;
          const r = rng();
          if (r < b.cage) wallBox(B, g, u, m * 0.36, y0 + 0.72, y0 + 2.33, 0, 0.36 + rng() * 0.12, pickc(rng, palette.cage), info(K.cage));
          else if (r < b.cage + 0.06) wallBox(B, g, u, 0.36, y0 + 0.3, y0 + 0.8, 0, 0.5, C.ac, info(K.ac));
          if (rng() < 0.05) {
            wallBox(B, g, u, 0.025, y0 + 2.3, y0 + 2.35, 0, 1.7, C.bamboo, info(K.laundry));
            for (let q = 0; q < 3; q++) {
              if (rng() < 0.25) continue;
              const o = 0.3 + q * 0.47;
              wallBox(B, g, u + (rng() - 0.5) * 0.04, 0.012, y0 + 1.5 + rng() * 0.35, y0 + 2.3, o, o + 0.38, pickc(rng, palette.cloth), info(K.laundry));
            }
          }
          const signP = e.facing === 'street' ? 0.12 : e.facing === 'alley' ? 0.03 : 0;
          if (k <= 4 && rng() < signP) {
            const top = y0 + 0.3 + 1.6 + rng() * 2.6;
            wallBox(B, g, u, 0.05, y0 + 0.3, top, 0.25, 1.15, pickc(rng, palette.sign), info(K.sign));
          }
        }
      }

      if (k === b.floors - 1) {
        const ry = b.floors * STOREY;
        const rc = pickc(rng, palette.roof);
        const rinfo = (kind) => [b.id, k, kind, 1];
        for (const [i0, j0, i1, j1] of rects(L, b.cells))
          B.hrect(L.x0 + i0, L.z0 + j0, L.x0 + i1, L.z0 + j1, ry, rc, rinfo(K.roof));
        for (const e of edgesOf(L, b, (o) => L.buildings[o].floors >= b.floors)) {
          const g = edgeGeom(L, e);
          B.vwall(g.A, g.B, ry, ry + 0.9, g.n, facade[b.id], g.uA, g.uB, rinfo(K.parapet));
        }
        roofProps(B, L, b, ry, rng, ant, C, rinfo);
      }
    }
    if (k === 0) {
      const lanes = [], yard = [], road = [];
      for (let c = 0; c < L.N; c++) if (L.inside[c] && L.alley[c]) [null, lanes, yard, road][L.alley[c]].push(c);
      for (const [cells, c] of [[lanes, C.alley], [yard, C.yard], [road, C.road]])
        for (const [i0, j0, i1, j1] of rects(L, cells))
          B.hrect(L.x0 + i0, L.z0 + j0, L.x0 + i1, L.z0 + j1, 0.01, c, [-1, 0, K.alley, 1]);
    }
    levels.push({ k, geometry: B.geometry(), antennas: new Float32Array(ant) });
  }
  return levels;
}

function roofProps(B, L, b, ry, rng, ant, C, info) {
  const { W, owner, x0, z0 } = L;
  const si = b.stair % W, sj = (b.stair / W) | 0;
  // Stair hut: 2x2 cells where possible.
  let hi = si, hj = sj, hw = 1, hd = 1;
  for (const [di, dj] of [[0, 0], [-1, 0], [0, -1], [-1, -1]]) {
    const ok = [[0, 0], [1, 0], [0, 1], [1, 1]].every(([a, c]) => owner[(sj + dj + c) * W + si + di + a] === b.id);
    if (ok) { hi = si + di; hj = sj + dj; hw = 2; hd = 2; break; }
  }
  B.box(x0 + hi + 0.05, ry, z0 + hj + 0.05, x0 + hi + hw - 0.05, ry + 2.3, z0 + hj + hd - 0.05, C.hut, info(K.prop));
  const cells = b.cells;
  const nt = 1 + Math.floor(rng() * 3);
  for (let t = 0; t < nt; t++) {
    const c = cells[Math.floor(rng() * cells.length)];
    const i = c % W, j = (c / W) | 0;
    const s = 0.9 + rng() * 0.7, h = 0.9 + rng() * 0.9;
    B.box(x0 + i + 0.1, ry + 0.2, z0 + j + 0.1, x0 + i + 0.1 + s, ry + 0.2 + h, z0 + j + 0.1 + s, pickc(rng, palette.tank), info(K.prop));
  }
  const na = 2 + Math.floor(rng() * Math.min(9, cells.length / 8));
  for (let t = 0; t < na; t++) {
    const c = cells[Math.floor(rng() * cells.length)];
    const x = x0 + (c % W) + rng(), z = z0 + ((c / W) | 0) + rng();
    const h = 2.4 + rng() * 3.4;
    ant.push(x, ry, z, x, ry + h, z);
    const a = rng() * Math.PI;
    const bars = 2 + Math.floor(rng() * 3);
    for (let q = 0; q < bars; q++) {
      const y = ry + h - q * 0.45, l = (0.9 - q * 0.15) * (0.7 + rng() * 0.6);
      ant.push(x - Math.cos(a) * l, y, z - Math.sin(a) * l, x + Math.cos(a) * l, y, z + Math.sin(a) * l);
    }
  }
}

// A single-storey hall of the Yamen compound: walls on the traced plot outline and a
// pitched tile roof over its long axis. The restored halls face SSE (OSM); the plan shows
// the compound as the old people's centre, with the youth centre on its north side.
function buildYamen(B, L, b, C, useCol) {
  const info = (kind) => [b.id, 0, kind, 1];
  for (const [i0, j0, i1, j1] of rects(L, b.cells))
    B.hrect(L.x0 + i0, L.z0 + j0, L.x0 + i1, L.z0 + j1, 0.03, useCol.yamen, info(K.plate));
  const wh = 3.4, ov = 0.5;
  for (const e of edgesOf(L, b, () => false)) {
    const g = edgeGeom(L, e);
    B.vwall(g.A, g.B, 0, wh, g.n, C.yamenWall, g.uA, g.uB, info(K.plain));
  }
  // Roof in a frame (a = along the ridge, c = across it), mapped back to x/z.
  const alongX = b.i1 - b.i0 >= b.j1 - b.j0;
  const [a0, a1, c0, c1] = alongX ? [b.i0, b.i1, b.j0, b.j1] : [b.j0, b.j1, b.i0, b.i1];
  const A0 = (alongX ? L.x0 : L.z0) + a0, A1 = (alongX ? L.x0 : L.z0) + a1;
  const Cm0 = (alongX ? L.z0 : L.x0) + c0, Cm1 = (alongX ? L.z0 : L.x0) + c1;
  const half = (Cm1 - Cm0) / 2, cm = (Cm0 + Cm1) / 2;
  const ridge = wh + Math.min(2.6, 0.45 * half + 0.6);
  const P = (a, y, c) => (alongX ? [a, y, c] : [c, y, a]);
  const s = Math.hypot(half + ov, ridge - wh), ny = (half + ov) / s, nc = (ridge - wh) / s;
  const N = (sgn) => (alongX ? [0, ny, sgn * nc] : [sgn * nc, ny, 0]);
  const uv = [[A0, 0], [A1, 0], [A1, 1], [A0, 1]];
  const q1 = [P(A0, wh - 0.3, Cm1 + ov), P(A1, wh - 0.3, Cm1 + ov), P(A1, ridge, cm), P(A0, ridge, cm)];
  const q2 = [P(A1, wh - 0.3, Cm0 - ov), P(A0, wh - 0.3, Cm0 - ov), P(A0, ridge, cm), P(A1, ridge, cm)];
  if (alongX) {
    B.quad(q1, N(1), C.yamenRoof, uv, info(K.roof));
    B.quad(q2, N(-1), C.yamenRoof, uv, info(K.roof));
  } else {
    // Swapping x and z flips the winding, so reverse the corner order.
    B.quad([q1[1], q1[0], q1[3], q1[2]], N(1), C.yamenRoof, uv, info(K.roof));
    B.quad([q2[1], q2[0], q2[3], q2[2]], N(-1), C.yamenRoof, uv, info(K.roof));
  }
  // Gable ends.
  for (const [a, sgn] of [[A0, -1], [A1, 1]]) {
    const n = alongX ? [sgn, 0, 0] : [0, 0, sgn];
    const tri = [P(a, wh, Cm0), P(a, wh, Cm1), P(a, ridge - 0.2, cm), P(a, ridge - 0.2, cm)];
    B.quad((sgn > 0) !== alongX ? tri : [tri[1], tri[0], tri[3], tri[2]], n, C.yamenWall, [[0, 0], [1, 0], [1, 1], [0, 1]], info(K.plain));
  }
}

// Plan of one storey for the cut view: black wall caps and dotted outlines, plus
// partitions that split each floor into flats.
export function buildPlan(L, c) {
  const B = new Builder();
  const lines = [];
  const black = col('#141414'), part = col('#a39c8f');
  const y0 = c * STOREY, yc = y0 + CUT_H;
  for (const b of L.buildings) {
    if (b.floors <= c || b.kind === 'yamen') continue;
    const info = [b.id, c, K.poche, 1];
    for (const e of edgesOf(L, b, () => false)) {
      const g = edgeGeom(L, e);
      const p = wallPoint(g, g.uA, 0), q = wallPoint(g, g.uB, -0.2);
      B.hrect(Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1]), yc + 0.005, black, info);
      lines.push(g.A[0], yc + 0.03, g.A[1], g.B[0], yc + 0.03, g.B[1]);
    }
    if (b.flats < 2) continue;
    const alongX = b.i1 - b.i0 >= b.j1 - b.j0;
    const emit = (X0, Z0, X1, Z1) => {
      const vertical = X0 === X1;
      const n = vertical ? [1, 0, 0] : [0, 0, 1];
      B.vwall([X0, Z0], [X1, Z1], y0, yc, n, part, vertical ? Z0 : X0, vertical ? Z1 : X1, info);
      const t = 0.07;
      if (vertical) B.hrect(X0 - t, Math.min(Z0, Z1), X0 + t, Math.max(Z0, Z1), yc + 0.005, black, info);
      else B.hrect(Math.min(X0, X1), Z0 - t, Math.max(X0, X1), Z0 + t, yc + 0.005, black, info);
      lines.push(X0, yc + 0.03, Z0, X1, yc + 0.03, Z1);
    };
    for (let m = 1; m < b.flats; m++) {
      if (alongX) {
        const ci = Math.round(b.i0 + ((b.i1 - b.i0) * m) / b.flats);
        let run = null;
        for (let j = b.j0; j <= b.j1; j++) {
          const ok = j < b.j1 && L.owner[j * L.W + ci - 1] === b.id && L.owner[j * L.W + ci] === b.id;
          if (ok && run === null) run = j;
          if (!ok && run !== null) { emit(L.x0 + ci, L.z0 + run, L.x0 + ci, L.z0 + j); run = null; }
        }
      } else {
        const cj = Math.round(b.j0 + ((b.j1 - b.j0) * m) / b.flats);
        let run = null;
        for (let i = b.i0; i <= b.i1; i++) {
          const ok = i < b.i1 && L.owner[(cj - 1) * L.W + i] === b.id && L.owner[cj * L.W + i] === b.id;
          if (ok && run === null) run = i;
          if (!ok && run !== null) { emit(L.x0 + run, L.z0 + cj, L.x0 + i, L.z0 + cj); run = null; }
        }
      }
    }
  }
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lines), 3));
  return { geometry: B.geometry(), lines: lg };
}

const FRAG = /* glsl */ `
vec3 glow = vec3(0.0);
float kind = vInfo.z;
float bid = vInfo.x;
float flr = vInfo.y;
if (uIsCut > 0.5) {
  if (kind == 2.0 || kind == 4.0 || kind == 5.0) discard;
  if (kind != 1.0 && kind != 3.0 && vLocalY > uCutH + 0.05) discard;
}
if (kind < 0.5) {
  float u = vWall.x; float v = vWall.y; float mw = vInfo.w;
  float g = 0.88 + 0.12 * hash12(floor(vec2(u * 0.8, (flr * 2.8 + v) * 0.6)) + bid * 3.1);
  float streak = hash12(vec2(floor(u * 2.3), bid));
  diffuseColor.rgb *= g * (0.9 + 0.1 * streak);
  diffuseColor.rgb *= mix(0.7, 1.0, clamp(flr / 6.0, 0.0, 1.0));
  if (v < 0.2) diffuseColor.rgb *= 0.72;
  if (!gl_FrontFacing) {
    // inside face of an outer wall: whitewash, darker near the floor
    diffuseColor.rgb = vec3(0.36, 0.34, 0.3) * (0.75 + 0.25 * smoothstep(0.0, 1.2, v));
  } else if (flr < 0.5) {
    float sw = 3.3; float si = floor(u / sw); float sx = fract(u / sw);
    float rs = hash12(vec2(bid * 3.1 + si, 5.0));
    float openT = 6.0 + rs * 3.0; float closeT = 19.0 + rs * 4.5;
    bool isOpen = uHour > openT && uHour < closeT;
    if (v > 2.2 && v < 2.7 && sx > 0.04 && sx < 0.96) {
      vec3 sc = rs < 0.3 ? vec3(0.55, 0.06, 0.04) : (rs < 0.6 ? vec3(0.8, 0.55, 0.08) : (rs < 0.8 ? vec3(0.8, 0.78, 0.7) : vec3(0.05, 0.3, 0.15)));
      diffuseColor.rgb = sc;
      glow += sc * 0.5 * uNight;
    } else if (sx > 0.07 && sx < 0.93 && v < 2.15) {
      if (isOpen) { vec3 ins = vec3(0.62, 0.74, 0.66); diffuseColor.rgb = ins * 0.4; glow += ins * (0.3 + 0.4 * uNight); }
      else { float sh = step(0.5, fract(v * 10.0)); diffuseColor.rgb = mix(vec3(0.3), vec3(0.22), sh); }
    }
  } else {
    float wi = floor(u / mw); float fx = fract(u / mw);
    vec2 wid = vec2(bid * 7.0 + wi, flr * 13.0 + bid);
    float r1 = hash12(wid), r2 = hash12(wid + 17.3), r3 = hash12(wid + 41.7);
    if (r1 > 0.08 && fx > 0.14 && fx < 0.86 && v > 0.8 && v < 2.25) {
      float on1 = 5.0 + r2 * 2.2, off1 = 6.6 + r3 * 1.6;
      float on2 = 17.6 + r2 * 2.4, off2 = 21.5 + r3 * 4.0;
      bool lit = (uHour > on1 && uHour < off1) || (uHour > on2 && uHour < off2) || (uHour + 24.0 < off2) || r1 > 0.95;
      float cur = hash12(wid + 3.0);
      vec3 glass = vec3(0.05, 0.055, 0.06);
      vec3 cc = cur < 0.33 ? vec3(0.35, 0.16, 0.12) : (cur < 0.66 ? vec3(0.28, 0.32, 0.24) : vec3(0.5, 0.48, 0.4));
      vec3 wc = mix(glass, cc, step(0.5, cur) * 0.8);
      if (lit) {
        vec3 lc = r2 < 0.55 ? vec3(1.0, 0.62, 0.25) : vec3(0.7, 0.92, 0.8);
        wc = lc * 0.45;
        glow += lc * (0.16 + 1.1 * uNight);
      }
      float bars = max(step(0.82, fract((fx - 0.14) / 0.72 * 6.0)), step(0.88, fract((v - 0.8) / 1.45 * 3.0)));
      diffuseColor.rgb = mix(wc, vec3(0.12, 0.13, 0.12), bars * 0.85);
      glow *= 1.0 - bars * 0.8;
    }
  }
} else if (kind == 1.0) {
  // Floors are only seen in the cut and exploded views; light them like lit rooms at night.
  diffuseColor.rgb *= 0.9 + 0.1 * hash12(floor(vWall * 1.6) + bid);
  glow += diffuseColor.rgb * (0.08 + 0.42 * uNight);
} else if (kind == 2.0) {
  diffuseColor.rgb *= 0.8 + 0.2 * hash12(floor(vWall * 0.7) + bid * 1.7);
} else if (kind == 3.0) {
  diffuseColor.rgb *= 0.8 + 0.25 * hash12(floor(vWall * 0.9));
  glow += vec3(0.035, 0.05, 0.042) * (0.6 + 0.4 * uNight);
} else if (kind == 9.0) {
  glow += diffuseColor.rgb * 0.6 * uNight;
} else if (kind == 10.0) {
  glow += vec3(0.75, 0.95, 0.85);
}
if (bid >= 0.0 && abs(bid - uHi) < 0.5) {
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.95, 0.45, 0.28), 0.5);
  glow += vec3(0.2, 0.07, 0.02);
}
`;

export function makeBuildingMaterial(shared) {
  const m = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  m.userData.uIsCut = { value: 0 };
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, shared, { uIsCut: m.userData.uIsCut });
    s.vertexShader = s.vertexShader
      .replace('#include <common>', `#include <common>
attribute vec2 aWall; attribute vec4 aInfo;
varying vec2 vWall; varying vec4 vInfo; varying float vLocalY;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
vWall = aWall; vInfo = aInfo; vLocalY = position.y - aInfo.y * ${STOREY.toFixed(3)};`);
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>
uniform float uHour; uniform float uNight; uniform float uHi; uniform float uIsCut; uniform float uCutH;
varying vec2 vWall; varying vec4 vInfo; varying float vLocalY;
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
${FRAG}`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
totalEmissiveRadiance += glow;`);
  };
  m.customProgramCacheKey = () => 'kwc-building';
  return m;
}
