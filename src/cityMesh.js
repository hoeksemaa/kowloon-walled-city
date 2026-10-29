// Turns the layout into one merged mesh per storey, so each storey can be lifted apart
// (exploded view) or cut away (plan view) as a unit. Walls, floors and roofs follow the
// plot outlines from footprint.js: a plot line at an angle is one straight wall.
import * as THREE from 'three';
import { STOREY, MAX_FLOORS } from './layout.js';
import { mulberry32, hash2 } from './util.js';
import { clipLine, LANE, YARD, ROAD, OUTSIDE } from './footprint.js';
import { Builder, polygonsOf, triangulate, wallFrame, insideWithMargin } from './geom.js';
import { planSigns, SignAtlas, emitSign } from './signs.js';

export const CUT_H = 1.1; // height of the plan cut above a floor, metres

// Surface kinds, read by the facade shader.
export const K = {
  wall: 0, plate: 1, roof: 2, alley: 3, parapet: 4, prop: 5, cage: 6, ac: 7,
  laundry: 8, sign: 9, tube: 10, plain: 11, poche: 12,
};

export const USE_COLORS = {
  home: '#cdbb9f',
  dentist: '#b4cbc4', clinic: '#a3c4b7', medicine: '#9fbf9a',
  plastics: '#8fa3ab', metal: '#7f8c94', garment: '#a3a7bb', foodfac: '#d3a46c', works: '#a0a69f',
  eating: '#d9b77a', shop: '#c99a78', office: '#b7a9c4', school: '#cbb96e',
  kaifong: '#c9a35c', temple: '#b8574a', youth: '#b6b08c', yamen: '#bdb3a0',
};

const col = (hex) => new THREE.Color(hex);
const PAL = {
  roof: ['#8a877f', '#7b7a74', '#94918a', '#6f6e69', '#86837a', '#7f7a70'],
  cage: ['#3e4441', '#4a4f4b', '#5a5246', '#6b6a5f', '#556b62', '#7a6d5c', '#8d8a80', '#6a7d86'],
  cloth: ['#d9d4c7', '#a33a2e', '#2f4f7a', '#d8b54a', '#6f8f5a', '#e6e2d8', '#c76f86', '#3d3d40', '#5d86a8'],
  tank: ['#9fb6c2', '#d9d7cf', '#8b8f8c', '#a46c48', '#6d8796', '#c9c4b5', '#3f5f8a'],
  canopy: ['#6d7a72', '#8a8f86', '#5d6d7c', '#9a8f78', '#7d5a4a', '#4f6650'],
  hut: ['#9a968c', '#8b8b82', '#a39d8e', '#7e817d'],
};
const palette = Object.fromEntries(Object.entries(PAL).map(([k, v]) => [k, v.map(col)]));
const pickc = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const facingOf = (o) => (o === OUTSIDE || o === ROAD ? 'street' : o === LANE || o === YARD ? 'alley' : 'building');

export function buildLevels(L) {
  const rng = mulberry32(77);
  const B = L.buildings;
  const facade = B.map((b) => col(b.color));
  const useCol = Object.fromEntries(Object.entries(USE_COLORS).map(([k, v]) => [k, col(v)]));
  const C = {
    alley: col('#3a3d39'), yard: col('#6c695f'), road: col('#5f5c55'), tube: col('#e8f5ee'), ac: col('#cfcac0'),
    bamboo: col('#b39b62'), yamenWall: col('#8c877c'), yamenRoof: col('#4f5651'), white: col('#ffffff'),
  };
  // Triangles of each footprint, made once and used at every storey.
  const tris = B.map((b) => polygonsOf(b.rings).map(triangulate));
  const exposedAt = (o, k) => o < 0 || B[o].floors <= k;

  const atlas = new SignAtlas();
  const signs = planSigns(L, rng);
  const signsAt = Array.from({ length: MAX_FLOORS }, () => []);
  for (const s of signs) signsAt[s.s].push(s);

  const levels = [];
  for (let k = 0; k < MAX_FLOORS; k++) {
    const M = new Builder();
    const S = new Builder('uv');
    const ant = [];
    for (const b of B) {
      if (b.floors <= k) continue;
      if (b.kind === 'yamen') {
        buildYamen(M, b, tris[b.id], C, useCol);
        continue;
      }
      const y0 = k * STOREY, y1 = y0 + STOREY;
      const info = (kind, w = 1) => [b.id, k, kind, w];
      for (const t of tris[b.id]) M.flat(t, y0 + 0.02, useCol[b.uses[k]] || useCol.home, info(K.plate));

      b.rings.forEach((ring, ri) => ring.edges.forEach((e, ei) => {
        if (!exposedAt(e.other, k)) return;
        const fr = wallFrame(e);
        if (fr.len < 0.05) return;
        const facing = facingOf(e.other);
        // A wall that rises above a lower neighbour is often blank: one in two here.
        const blank = facing === 'building' && hash2(b.id * 31 + ri, ei) < 0.5;
        const nwin = Math.max(1, Math.round(fr.len / (k === 0 ? 3.2 : b.modW)));
        const mw = blank || fr.len < 0.9 ? 0 : fr.len / nwin;
        M.vwall(fr.A, fr.B, y0, y1, [fr.n[0], 0, fr.n[1]], facade[b.id], 0, fr.len, info(K.wall, mw));
        if (fr.len < 1.2) return;
        const box = (u0, u1, o0, o1, ya, yb, c, kind) => M.obox(fr.A, fr.t, fr.n, u0, u1, o0, o1, ya, yb, c, info(kind));
        if (k <= 1 && facing === 'alley')
          for (let u = 1.5; u < fr.len - 0.6; u += 5 + rng() * 3) box(u - 0.45, u + 0.45, 0, 0.1, y0 + 2.42, y0 + 2.5, C.tube, K.tube);
        if (k === 0) {
          // Shop canopies over the street fronts.
          if (facing === 'street')
            for (let i = 0; i < nwin; i++)
              if (rng() < 0.45) {
                const u = (i + 0.5) * mw, d = 0.9 + rng() * 0.9;
                box(u - mw * 0.48, u + mw * 0.48, 0, d, y0 + 2.75, y0 + 2.83, pickc(rng, palette.canopy), K.prop);
              }
          return;
        }
        if (!mw) return;
        const cageP = facing === 'street' ? b.cage + 0.2 : facing === 'alley' ? b.cage * 0.85 : b.cage * 0.6;
        for (let i = 0; i < nwin; i++) {
          const u = (i + 0.5) * mw;
          const r = rng();
          if (r < cageP) {
            // Window cages: deep enclosed balconies on the street faces, shallow grilles
            // in the lanes (1987-90 photos).
            const street = facing === 'street';
            const full = street && rng() < 0.45;
            const d = street ? 0.45 + rng() * 0.65 : facing === 'alley' ? 0.2 + rng() * 0.22 : 0.3 + rng() * 0.25;
            const hw = Math.min(mw * (full ? 0.49 : 0.38), full ? 1.6 : 0.85);
            box(u - hw, u + hw, 0, d, y0 + (full ? 0.08 : 0.72), y0 + (full ? 2.9 : 2.36), pickc(rng, palette.cage), K.cage);
            if (rng() < 0.3) box(u - hw * 0.9, u + hw * 0.9, d, d + 0.25, y0 + 0.72, y0 + 0.78, C.bamboo, K.laundry);
          } else if (r < cageP + 0.08) {
            box(u - 0.33, u + 0.33, 0, 0.48, y0 + 0.3, y0 + 0.82, C.ac, K.ac);
          }
          if (rng() < (facing === 'alley' ? 0.035 : 0.07)) {
            // A bamboo pole of laundry, pushed out of the window.
            const len = 1.4 + rng() * 0.8;
            box(u - 0.025, u + 0.025, 0.2, len, y0 + 2.3, y0 + 2.35, C.bamboo, K.laundry);
            for (let q = 0; q < 4; q++) {
              if (rng() < 0.25) continue;
              const o = 0.35 + q * (len - 0.45) / 4, uu = u + (rng() - 0.5) * 0.04;
              box(uu - 0.012, uu + 0.012, o, o + 0.32, y0 + 1.45 + rng() * 0.4, y0 + 2.3, pickc(rng, palette.cloth), K.laundry);
            }
          }
        }
      }));

      if (k === b.floors - 1) {
        const ry = b.floors * STOREY;
        const rinfo = (kind) => [b.id, k, kind, 1];
        const rc = pickc(rng, palette.roof);
        for (const t of tris[b.id]) M.flat(t, ry, rc, rinfo(K.roof));
        for (const ring of b.rings)
          for (const e of ring.edges) {
            if (e.other >= 0 && B[e.other].floors >= b.floors) continue;
            const fr = wallFrame(e);
            M.vwall(fr.A, fr.B, ry, ry + 0.9, [fr.n[0], 0, fr.n[1]], facade[b.id], 0, fr.len, rinfo(K.parapet));
          }
        roofProps(M, L, b, ry, rng, ant, rinfo);
      }
    }
    for (const s of signsAt[k]) emitSign(S, s, atlas.cell(s.text, s.style, s.font), C.white);
    if (k === 0) {
      for (const [rings, c] of [[L.ground.lane, C.alley], [L.ground.yard, C.yard], [L.ground.road, C.road]])
        for (const p of polygonsOf(rings)) M.flat(triangulate(p), 0.01, c, [-1, 0, K.alley, 1]);
    }
    levels.push({ k, geometry: M.geometry(), signs: S.nv ? S.geometry() : null, antennas: new Float32Array(ant) });
  }
  return { levels, signTexture: atlas.texture(), signCount: signs.length };
}

// A random point inside the footprint, at least m from its edges.
function spot(L, b, rng, m) {
  for (let t = 0; t < 30; t++) {
    const c = b.cells[Math.floor(rng() * b.cells.length)];
    const x = L.x0 + (c % L.W) + rng(), z = L.z0 + Math.floor(c / L.W) + rng();
    if (insideWithMargin(b.rings, x, z, m)) return [x, z];
  }
  return null;
}

function roofProps(M, L, b, ry, rng, ant, info) {
  const [ux, uz] = b.axis, px = -uz, pz = ux;
  // Stair hut over the stair, square to the building.
  const sx = L.x0 + (b.stair % L.W) + 0.5, sz = L.z0 + Math.floor(b.stair / L.W) + 0.5;
  for (const [hl, hw] of [[2.4, 2.1], [1.6, 1.6]]) {
    if (!insideWithMargin(b.rings, sx, sz, Math.hypot(hl, hw) / 2 - 0.1)) continue;
    const O = [sx - ux * hl / 2 - px * hw / 2, sz - uz * hl / 2 - pz * hw / 2];
    const hc = pickc(rng, palette.hut);
    M.obox(O, [ux, uz], [px, pz], 0, hl, 0, hw, ry, ry + 2.35, hc, info(K.prop), true);
    M.obox(O, [ux, uz], [px, pz], -0.15, hl + 0.15, -0.15, hw + 0.15, ry + 2.35, ry + 2.45, palette.roof[3], info(K.prop), true);
    break;
  }
  // Water tanks: round and square, on short stands.
  const nt = 1 + Math.floor(rng() * 2) + Math.floor(b.cells.length / 90);
  for (let t = 0; t < nt; t++) {
    const p = spot(L, b, rng, 0.9);
    if (!p) continue;
    const h = 0.9 + rng() * 0.8, c = pickc(rng, palette.tank);
    if (rng() < 0.6) M.prism(p[0], p[1], 0.45 + rng() * 0.3, ry + 0.25, ry + 0.25 + h, 8, c, info(K.prop));
    else {
      const s = 0.8 + rng() * 0.6;
      M.obox([p[0] - ux * s / 2 - px * s / 2, p[1] - uz * s / 2 - pz * s / 2], [ux, uz], [px, pz], 0, s, 0, s, ry + 0.2, ry + 0.2 + h, c, info(K.prop), true);
    }
  }
  // A roof shed on some roofs (pigeon lofts, stores, added rooms).
  if (rng() < 0.22 && b.cells.length > 40) {
    const p = spot(L, b, rng, 2.0);
    if (p) {
      const l = 2.2 + rng() * 1.8, w = 1.8 + rng() * 1.2;
      M.obox([p[0] - ux * l / 2 - px * w / 2, p[1] - uz * l / 2 - pz * w / 2], [ux, uz], [px, pz], 0, l, 0, w, ry, ry + 2.1, pickc(rng, palette.hut), info(K.prop), true);
    }
  }
  // Washing lines between two poles.
  if (rng() < 0.4) {
    const p = spot(L, b, rng, 0.6);
    if (p) {
      const a = rng() * Math.PI, l = 2 + rng() * 2.5;
      const q = [p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l];
      if (insideWithMargin(b.rings, q[0], q[1], 0.3)) {
        ant.push(p[0], ry, p[1], p[0], ry + 1.9, p[1], q[0], ry, q[1], q[0], ry + 1.9, q[1], p[0], ry + 1.85, p[1], q[0], ry + 1.85, q[1]);
        const tx = Math.cos(a), tz = Math.sin(a);
        for (let s = 0.3; s < l - 0.4; s += 0.45 + rng() * 0.3) {
          if (rng() < 0.3) continue;
          M.obox([p[0] + tx * s, p[1] + tz * s], [tx, tz], [-tz, tx], 0, 0.38, -0.01, 0.01, ry + 1.85 - 0.5 - rng() * 0.4, ry + 1.85, pickc(rng, palette.cloth), info(K.laundry), true);
        }
      }
    }
  }
  // TV aerials: a thicket on every roof (1987-90 photos).
  const na = 3 + Math.floor(rng() * Math.min(28, b.cells.length / 5));
  for (let t = 0; t < na; t++) {
    const p = spot(L, b, rng, 0.2);
    if (!p) continue;
    const [x, z] = p;
    const h = 2.4 + rng() * 3.6;
    ant.push(x, ry, z, x, ry + h, z);
    const a = rng() * Math.PI;
    const bars = 2 + Math.floor(rng() * 3);
    for (let q = 0; q < bars; q++) {
      const y = ry + h - q * 0.45, l = (0.9 - q * 0.15) * (0.7 + rng() * 0.6);
      ant.push(x - Math.cos(a) * l, y, z - Math.sin(a) * l, x + Math.cos(a) * l, y, z + Math.sin(a) * l);
    }
  }
}

// A single-storey hall of the Yamen compound: walls on the plot outline and a pitched
// tile roof over its long axis. The restored halls face SSE (OSM); the plan shows the
// compound as the old people's centre, with the youth centre on its north side.
function buildYamen(M, b, tris, C, useCol) {
  const info = (kind) => [b.id, 0, kind, 1];
  for (const t of tris) M.flat(t, 0.03, useCol.yamen, info(K.plate));
  const wh = 3.4, ov = 0.5;
  for (const ring of b.rings)
    for (const e of ring.edges) {
      const fr = wallFrame(e);
      M.vwall(fr.A, fr.B, 0, wh, [fr.n[0], 0, fr.n[1]], C.yamenWall, 0, fr.len, info(K.plain));
    }
  // Roof over the plot's bounding box along its main axis (a) and across it (c).
  const [ux, uz] = b.axis, px = -uz, pz = ux;
  let a0 = Infinity, a1 = -Infinity, c0 = Infinity, c1 = -Infinity;
  for (const ring of b.rings)
    for (const [x, z] of ring.pts) {
      const a = x * ux + z * uz, c = x * px + z * pz;
      a0 = Math.min(a0, a); a1 = Math.max(a1, a); c0 = Math.min(c0, c); c1 = Math.max(c1, c);
    }
  const half = (c1 - c0) / 2, cm = (c0 + c1) / 2;
  const ridge = wh + Math.min(2.6, 0.45 * half + 0.6);
  const P = (a, y, c) => [ux * a + px * c, y, uz * a + pz * c];
  const s = Math.hypot(half + ov, ridge - wh), ny = (half + ov) / s, nc = (ridge - wh) / s;
  const uv = [[a0, 0], [a1, 0], [a1, 1], [a0, 1]];
  M.face([P(a0, wh - 0.3, c1 + ov), P(a1, wh - 0.3, c1 + ov), P(a1, ridge, cm), P(a0, ridge, cm)], [px * nc, ny, pz * nc], C.yamenRoof, uv, info(K.roof));
  M.face([P(a1, wh - 0.3, c0 - ov), P(a0, wh - 0.3, c0 - ov), P(a0, ridge, cm), P(a1, ridge, cm)], [-px * nc, ny, -pz * nc], C.yamenRoof, uv, info(K.roof));
  const tuv = [[0, 0], [1, 0], [0.5, 1]];
  M.face([P(a0, wh, c0), P(a0, wh, c1), P(a0, ridge - 0.2, cm)], [-ux, 0, -uz], C.yamenWall, tuv, info(K.plain));
  M.face([P(a1, wh, c1), P(a1, wh, c0), P(a1, ridge - 0.2, cm)], [ux, 0, uz], C.yamenWall, tuv, info(K.plain));
}

// Plan of one storey for the cut view: black wall caps and dotted outlines, plus
// partitions that split each floor into flats. A deep floor gets a corridor down its
// long axis with flats on both sides.
export function buildPlan(L, c) {
  const M = new Builder();
  const lines = [];
  const black = col('#141414'), part = col('#a39c8f');
  const y0 = c * STOREY, yc = y0 + CUT_H;
  for (const b of L.buildings) {
    if (b.floors <= c || b.kind === 'yamen') continue;
    const info = [b.id, c, K.poche, 1];
    for (const ring of b.rings)
      for (const e of ring.edges) {
        const fr = wallFrame(e), q = 0.2;
        const ix = -fr.n[0] * q, iz = -fr.n[1] * q;
        M.face([[fr.A[0], yc + 0.005, fr.A[1]], [fr.B[0], yc + 0.005, fr.B[1]], [fr.B[0] + ix, yc + 0.005, fr.B[1] + iz], [fr.A[0] + ix, yc + 0.005, fr.A[1] + iz]],
          [0, 1, 0], black, [[0, 0], [1, 0], [1, 1], [0, 1]], info);
        lines.push(fr.A[0], yc + 0.03, fr.A[1], fr.B[0], yc + 0.03, fr.B[1]);
      }
    if (b.flats < 2 || b.uses[c] !== 'home') continue;
    const [ux, uz] = b.axis, px = -uz, pz = ux;
    let a0 = Infinity, a1 = -Infinity, w0 = Infinity, w1 = -Infinity;
    for (const ring of b.rings)
      for (const [x, z] of ring.pts) {
        const a = x * ux + z * uz, w = x * px + z * pz;
        a0 = Math.min(a0, a); a1 = Math.max(a1, a); w0 = Math.min(w0, w); w1 = Math.max(w1, w);
      }
    // A partition from P + d*t0 to P + d*t1 (P, d in plan), with a black cap.
    const emit = (X0, Z0, X1, Z1) => {
      const dx = X1 - X0, dz = Z1 - Z0, l = Math.hypot(dx, dz);
      if (l < 0.6) return;
      const nx = -dz / l, nz = dx / l, t = 0.07;
      M.vwall([X0, Z0], [X1, Z1], y0, yc, [nx, 0, nz], part, 0, l, info);
      M.face([[X0 + nx * t, yc + 0.005, Z0 + nz * t], [X1 + nx * t, yc + 0.005, Z1 + nz * t], [X1 - nx * t, yc + 0.005, Z1 - nz * t], [X0 - nx * t, yc + 0.005, Z0 - nz * t]],
        [0, 1, 0], black, [[0, 0], [1, 0], [1, 1], [0, 1]], info);
      lines.push(X0, yc + 0.03, Z0, X1, yc + 0.03, Z1);
    };
    const corridor = w1 - w0 > 9 && b.flats >= 4;
    const wc = (w0 + w1) / 2, cw = 0.65;
    // Cross walls: lines across the axis, clipped to the footprint (and to one side of
    // the corridor, when there is one).
    const across = (a, lo, hi) => {
      const P = [ux * a, uz * a];
      for (const [t0, t1] of clipLine(b.rings, P, [px, pz])) {
        const s0 = Math.max(t0, lo), s1 = Math.min(t1, hi);
        if (s1 - s0 > 0.6) emit(P[0] + px * s0, P[1] + pz * s0, P[0] + px * s1, P[1] + pz * s1);
      }
    };
    if (corridor) {
      for (const w of [wc - cw, wc + cw]) {
        const P = [px * w, pz * w];
        for (const [t0, t1] of clipLine(b.rings, P, [ux, uz])) emit(P[0] + ux * t0, P[1] + uz * t0, P[0] + ux * t1, P[1] + uz * t1);
      }
      const n = Math.ceil(b.flats / 2);
      for (let m = 1; m < n; m++) {
        const a = a0 + ((a1 - a0) * m) / n;
        across(a, -Infinity, wc - cw);
        across(a, wc + cw, Infinity);
      }
    } else {
      for (let m = 1; m < b.flats; m++) across(a0 + ((a1 - a0) * m) / b.flats, -Infinity, Infinity);
    }
  }
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lines), 3));
  return { geometry: M.geometry(), lines: lg };
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
  } else if (mw < 0.1) {
    // a blank wall: water stains run down from the slab edges
    diffuseColor.rgb *= 0.86 + 0.14 * hash12(vec2(floor(u * 1.7), bid + flr));
  } else if (flr < 0.5) {
    float sw = mw; float si = floor(u / sw); float sx = fract(u / sw);
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
      float on2 = 17.0 + r2 * 2.4, off2 = 21.5 + r3 * 4.0;
      bool lit = (uHour > on1 && uHour < off1) || (uHour > on2 && uHour < off2) || (uHour + 24.0 < off2) || r1 > 0.95;
      float cur = hash12(wid + 3.0);
      vec3 glass = vec3(0.05, 0.055, 0.06);
      vec3 cc = cur < 0.33 ? vec3(0.35, 0.16, 0.12) : (cur < 0.66 ? vec3(0.28, 0.32, 0.24) : vec3(0.5, 0.48, 0.4));
      vec3 wc = mix(glass, cc, step(0.5, cur) * 0.8);
      if (lit) {
        // tungsten bulbs in the flats, fluorescent tubes in some (Girard, 2019)
        vec3 lc = r2 < 0.6 ? vec3(1.0, 0.62, 0.25) : vec3(0.7, 0.92, 0.8);
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
} else if (kind == 6.0) {
  // A window cage: steel bars over a dark balcony, lit from inside at night.
  float bar = max(step(0.78, fract(vWall.x * 8.0)), step(0.84, fract(vWall.y * 2.6)));
  float lit = step(0.45, hash12(floor(vWall.xx * 0.6) + vec2(bid, flr)));
  vec3 inner = mix(vec3(0.07, 0.07, 0.065), vec3(0.95, 0.62, 0.3) * 0.5, lit * uNight);
  glow += vec3(1.0, 0.62, 0.28) * lit * uNight * 0.7 * (1.0 - bar);
  diffuseColor.rgb = mix(inner, diffuseColor.rgb, bar);
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
