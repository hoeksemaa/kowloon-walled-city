// Turns the layout into one merged mesh per storey, so each storey can be lifted apart
// (exploded view) or cut away (plan view) as a unit. Walls, floors and roofs follow the
// plot outlines from footprint.js: a plot line at an angle is one straight wall.
import * as THREE from 'three';
import { STOREY, MAX_FLOORS } from './layout.js';
import { mulberry32, hash2, pointInPolygon } from './util.js';
import { LANE, YARD, ROAD, OUTSIDE } from './footprint.js';
import { Builder, polygonsOf, triangulate, wallFrame, insideWithMargin } from './geom.js';
import { planSigns, SignAtlas, emitSign } from './signs.js';
import { planDrawing, frameOf, toXZ, stairHole, planAt } from './floorplan.js';
import { emitStairs, furnish } from './interiors.js';
import { roofClutter } from './roofs.js';
import { emitCage, cageThings, emitAC, emitPipe, pipeColor, emitLedge, FACADE_GLSL } from './facades.js';
import { K, CUT_H } from './kinds.js';

export { K, CUT_H };

export const USE_COLORS = {
  home: '#cdbb9f',
  dentist: '#b4cbc4', clinic: '#a3c4b7', medicine: '#9fbf9a',
  plastics: '#8fa3ab', metal: '#7f8c94', garment: '#a3a7bb', foodfac: '#d3a46c', works: '#a0a69f',
  eating: '#d9b77a', shop: '#c99a78', office: '#b7a9c4', school: '#cbb96e',
  kaifong: '#c9a35c', temple: '#b8574a', youth: '#b6b08c', yamen: '#bdb3a0',
};

const col = (hex) => new THREE.Color(hex);
// Colours measured in the photos of City of Darkness Revisited (about 110 patches, sRGB, pulled
// toward neutral where a print has a cast). Grilles: "painted in the characteristic dark green
// or orange rust-preventing paint" (p150), and pale blue in the prints. Roof slabs and the
// corrugated sheds: pp313, 327. Laundry: pp36, 313.
const PAL = {
  roof: ['#b3ab9f', '#a59d92', '#9b9389', '#bdb5a9', '#8f887f', '#aaa294'],
  cage: ['#2f4a3a', '#38503f', '#4a3126', '#6e4d3d', '#9c5a3c', '#8c96a8', '#7d8a9c', '#4a4f4b'],
  cloth: ['#e4e7de', '#e9bea1', '#d88067', '#454574', '#36312e', '#d8b54a', '#6f8f5a', '#e6e2d8', '#5d86a8'],
  tank: ['#9fb6c2', '#d9d7cf', '#8b8f8c', '#a46c48', '#6d8796', '#c9c4b5', '#3f5f8a'],
  canopy: ['#6d7a72', '#8a8f86', '#5d6d7c', '#9a8f78', '#7d5a4a', '#4f6650'],
  hut: ['#aca194', '#9d9488', '#b68f73', '#8e8174'],
};
const palette = Object.fromEntries(Object.entries(PAL).map(([k, v]) => [k, v.map(col)]));
const pickc = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const RUST = col('#4a2a1c');
const facingOf = (o) => (o === OUTSIDE || o === ROAD ? 'street' : o === LANE || o === YARD ? 'alley' : 'building');

export function buildLevels(L) {
  const rng = mulberry32(77);
  const B = L.buildings;
  const facade = B.map((b) => col(b.color).multiplyScalar(0.86 + 0.26 * hash2(b.id, 11)));
  const useCol = Object.fromEntries(Object.entries(USE_COLORS).map(([k, v]) => [k, col(v)]));
  const C = {
    alley: col('#433d3c'), yard: col('#6c695f'), road: col('#5f5c55'), tube: col('#e8f5ee'), ac: col('#cfcac0'),
    bamboo: col('#b39b62'), yamenWall: col('#7f817a'), yamenRoof: col('#7d7f79'), white: col('#ffffff'),
    granite: col('#aaa69b'), yamenRidge: col('#4a4d48'), glaze: col('#3f6b4f'), door: col('#4a2a20'),
  };
  // Facade details (pipes, ledges, air-conditioners, what is in the cages) take their own
  // random numbers, so that the roofs, cages and laundry keep the ones they had.
  const frng = mulberry32(91);
  // Each tower has its own floor lines, not those of its neighbours (p143): from 1/F up its
  // windows, sills, cages and ledges sit vo metres off the storey (-0.35 to 0.35 in 15 steps).
  const voStep = B.map((b) => Math.floor(hash2(b.tower, 37) * 15));
  const voOf = (b) => (voStep[b.id] / 14 - 0.5) * 0.7;
  // About half the towers show their slabs as a ledge at each floor (INFERRED); the others
  // only as a band in the render.
  const ledged = B.map((b) => hash2(b.tower, 41) < 0.5);
  // Triangles of each footprint, made once and used at every storey. Above G/F the floor has
  // an opening over each built stair (interiors.js).
  const tris = B.map((b) => polygonsOf(b.rings).map(triangulate));
  const holed = B.map((b, i) => {
    const holes = (b.cores || []).map((c) => stairHole(b, c)).filter(Boolean);
    if (!holes.length) return tris[i];
    const F = frameOf(b), polys = polygonsOf(b.rings);
    for (const h of holes) {
      const q = [[h.a0, h.w0], [h.a1, h.w0], [h.a1, h.w1], [h.a0, h.w1]].map(([a, w]) => toXZ(F, a, w));
      const cx = q.reduce((s2, p) => s2 + p[0], 0) / 4, cz = q.reduce((s2, p) => s2 + p[1], 0) / 4;
      const poly = polys.find((pl) => pointInPolygon(cx, cz, pl.outer)) || polys[0];
      poly.holes.push(q);
    }
    return polys.map(triangulate);
  });
  // The Yamen's halls light up together when the pointer is over one of them.
  const yamenTower = L.yamenId !== undefined ? B[L.yamenId].tower : -1;
  const exposedAt = (o, k) => o < 0 || B[o].floors <= k;
  // How dark a lane wall is: 1 in a lane under 2 m, less in a wider one. Daylight reaches the
  // ground "only in those few places where narrow gaps had been left" (p103); Lo Yan Street
  // is "the only street that had some degree of natural lighting" (p23).
  const laneWidth = (fr) => {
    const x = fr.A[0] + fr.t[0] * fr.len / 2, z = fr.A[1] + fr.t[1] * fr.len / 2;
    let d = 0.3;
    for (; d < 9; d += 0.5) {
      const i = Math.floor(x + fr.n[0] * d - L.x0), j = Math.floor(z + fr.n[1] * d - L.z0);
      if (i < 0 || j < 0 || i >= L.W || j >= L.D) break;
      const c = j * L.W + i;
      if (!L.inside[c] || L.owner[c] >= 0) break;
    }
    return d;
  };
  const laneDark = (d) => Math.max(1, Math.min(10, Math.round(10 - (d - 2) * 1.4)));

  const atlas = new SignAtlas();
  const signs = planSigns(L, rng);
  const signsAt = Array.from({ length: MAX_FLOORS }, () => []);
  for (const s of signs) signsAt[s.s].push(s);

  const levels = [];
  // The see-through things (cages, plants, pipes, stains) go in a mesh of their own, drawn
  // with alpha to coverage (makeCutoutMaterial); the rest stays fully opaque, and fast. A stain
  // that runs down past the slab line goes on in the mesh of the storey below (facades.js).
  const Mcs = Array.from({ length: MAX_FLOORS }, () => new Builder());
  for (let k = 0; k < MAX_FLOORS; k++) {
    const M = new Builder();
    const Mc = Mcs[k];
    const S = new Builder('uv');
    const ant = [];
    for (const b of B) {
      if (b.floors <= k) continue;
      if (b.kind === 'yamen') {
        buildYamen(M, L, b, tris[b.id], C, useCol, yamenTower);
        continue;
      }
      const y0 = k * STOREY, y1 = y0 + STOREY;
      // aInfo.x is the tower: the shader varies and highlights by tower.
      const info = (kind, w = 1) => [b.tower, k, kind, w];
      for (const t of (k ? holed : tris)[b.id]) M.flat(t, y0 + 0.02, useCol[b.uses[k]] || useCol.home, info(K.plate));
      emitStairs(M, b, k);

      b.rings.forEach((ring, ri) => ring.edges.forEach((e, ei) => {
        if (!exposedAt(e.other, k)) return;
        let fr = wallFrame(e);
        if (fr.len < 0.05) return;
        const facing = facingOf(e.other);
        const lw = facing === 'alley' && k < 8 ? laneWidth(fr) : 0;
        // From 2/F up, some buildings overhang the lanes (p131); the lane below stays at least
        // a metre wide.
        const ov = facing === 'alley' && k >= 2 && lw >= 2.2 && hash2(b.id, 13) < 0.5 ? Math.min(0.6, (lw - 1.2) / 2) : 0;
        if (ov) {
          const A = [fr.A[0] + fr.n[0] * ov, fr.A[1] + fr.n[1] * ov], Bq = [fr.B[0] + fr.n[0] * ov, fr.B[1] + fr.n[1] * ov];
          const pi = info(K.plain), shade = facade[b.id].clone().multiplyScalar(0.7);
          if (k === 2) M.face([[fr.A[0], y0, fr.A[1]], [fr.B[0], y0, fr.B[1]], [Bq[0], y0, Bq[1]], [A[0], y0, A[1]]], [0, -1, 0], shade, [[0, 0], [1, 0], [1, 1], [0, 1]], pi);
          M.vwall(fr.A, A, y0, y1, [-fr.t[0], 0, -fr.t[1]], shade, 0, ov, pi);
          M.vwall(Bq, fr.B, y0, y1, [fr.t[0], 0, fr.t[1]], shade, 0, ov, pi);
          fr = { ...fr, A, B: Bq };
        }
        // A wall that rises above a lower neighbour is often blank: one in two here.
        const blank = facing === 'building' && hash2(b.id * 31 + ri, ei) < 0.5;
        const nwin = Math.max(1, Math.round(fr.len / (k === 0 ? 3.2 : b.modW)));
        const mw = blank || fr.len < 0.9 ? 0 : fr.len / nwin;
        // aInfo.w: the window width, plus 8 times (the darkness of a lane wall, 1-10, plus 16
        // times the step of the tower's floor lines, voStep).
        const dark = lw ? laneDark(lw) : 0;
        M.vwall(fr.A, fr.B, y0, y1, [fr.n[0], 0, fr.n[1]], facade[b.id], 0, fr.len, info(K.wall, mw + 8 * (dark + 16 * voStep[b.id])));
        // Pipes down the wall, at the same places on every storey so that they run from the roof
        // to the lane: a drain near one end, and on some walls a bundle of water pipes from the
        // roof tanks (INFERRED).
        const vo = k ? voOf(b) : 0, top = k === b.floors - 1 ? y1 + 0.6 : y1;
        if (fr.len >= 1.5 && !(k === 0 && facing === 'street')) {
          const ph = (q) => hash2(b.id * 97 + ri * 13 + q, ei);
          const shade = (c) => (dark && k < 6 ? c.clone().multiplyScalar(1 - 0.07 * dark) : c);
          if (ph(1) < 0.55) {
            const u = ph(2) < 0.5 ? 0.14 : fr.len - 0.14;
            emitPipe(Mc, fr, u, y0, top, 1, 0.1, shade(pipeColor(() => ph(7))), b.tower, k);
          }
          if (ph(3) < 0.3 && fr.len >= 2.5) {
            const n = 2 + Math.floor(ph(4) * 3), u = (0.3 + 0.4 * ph(5)) * fr.len;
            const at = mw ? Math.round(u / mw) * mw : u; // between two windows
            emitPipe(Mc, fr, Math.min(fr.len - 0.2, Math.max(0.2, at)), y0, top, n, 0.035 + 0.02 * ph(6), shade(pipeColor(() => ph(8))), b.tower, k);
          }
        }
        // A slab ledge at the floor line.
        if (k && ledged[b.id] && facing !== 'alley' && fr.len >= 1.2) {
          const yl = y0 + (vo >= 0 ? vo : vo + STOREY);
          emitLedge(M, fr, yl - 0.03, 0.07, 0.15, facade[b.id].clone().multiplyScalar(0.94), info(K.plain));
        }
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
        // Cages: on the open faces most bays from 2/F up have one, and their dark inside fills
        // 40-63 % of the face (pp18, 26, 143). The north face on Tung Tau Tsuen Road has fewer
        // cages and many air-conditioners, one to every 2-4 windows (p8).
        const north = b.front === 'top' && facing === 'street';
        const open = (k >= 2 ? 0.62 : 0.3) + 0.25 * b.cage;
        const cageP = north ? 0.3 : facing === 'alley' ? open * 0.6 : facing === 'street' ? open : open * 0.85;
        const acP = north ? 0.3 : 0.08;
        const yw = y0 + vo; // the floor line of the tower on this storey
        for (let i = 0; i < nwin; i++) {
          const u = (i + 0.5) * mw;
          const r = rng();
          if (r < cageP) {
            // Window cages: deep enclosed balconies on the street faces, shallow grilles
            // in the lanes (1987-90 photos).
            const street = facing !== 'alley';
            const full = street && rng() < 0.55;
            const d = facing === 'street' ? 0.45 + rng() * 0.65 : facing === 'alley' ? 0.2 + rng() * 0.22 : 0.3 + rng() * 0.35;
            const hw = Math.min(mw * (full ? 0.49 : 0.42), full ? 1.6 : 0.95);
            const ya = yw + (full ? 0.08 : 0.72), yb = yw + (full ? 2.9 : 2.36);
            emitCage(Mc, fr, u - hw, u + hw, d, ya, yb, pickc(rng, palette.cage), info(K.cage), frng);
            if (frng() < (facing === 'alley' ? 0.35 : 0.7)) cageThings(Mc, fr, u - hw, u + hw, d, ya, yb, b.tower, k, frng, palette.cloth);
            if (rng() < 0.3) box(u - hw * 0.9, u + hw * 0.9, d, d + 0.25, yw + 0.72, yw + 0.78, C.bamboo, K.laundry);
          } else if (r < cageP + acP) {
            emitAC(M, Mcs, fr, u, yw + 0.3, frng, info(K.ac, 0), facade[b.id].clone().multiplyScalar(0.45).lerp(RUST, 0.35), facing !== 'alley');
          }
          if (rng() < (facing === 'alley' ? 0.035 : 0.07)) {
            // A bamboo pole of laundry, pushed out of the window.
            const len = 1.4 + rng() * 0.8;
            box(u - 0.025, u + 0.025, 0.2, len, yw + 2.3, yw + 2.35, C.bamboo, K.laundry);
            for (let q = 0; q < 4; q++) {
              if (rng() < 0.25) continue;
              const o = 0.35 + q * (len - 0.45) / 4, uu = u + (rng() - 0.5) * 0.04;
              box(uu - 0.012, uu + 0.012, o, o + 0.32, yw + 1.45 + rng() * 0.4, yw + 2.3, pickc(rng, palette.cloth), K.laundry);
            }
          }
        }
      }));

      if (k === b.floors - 1) {
        const ry = b.floors * STOREY;
        const rinfo = (kind) => [b.tower, k, kind, 1];
        const rc = palette.roof[Math.floor(hash2(b.tower, 7) * palette.roof.length)];
        for (const t of tris[b.id]) M.flat(t, ry, rc, rinfo(K.roof));
        for (const ring of b.rings)
          for (const e of ring.edges) {
            if (e.other >= 0 && B[e.other].floors >= b.floors) continue;
            const fr = wallFrame(e);
            M.vwall(fr.A, fr.B, ry, ry + 0.9, [fr.n[0], 0, fr.n[1]], facade[b.id], 0, fr.len, rinfo(K.parapet));
          }
        roofProps(M, L, b, ry, rng, ant, rinfo);
        roofClutter(M, L, b, ry, rinfo);
      }
    }
    linksAt(M, L, k, rng);
    if (k === 0) { lanePipes(M, L, rng); wellAt(M, L); }
    if (k === 1) laneSheets(M, L, rng);
    for (const s of signsAt[k]) emitSign(S, s, atlas.cell(s.text, s.style, s.font), C.white);
    if (k === 0) {
      for (const [rings, c] of [[L.ground.lane, C.alley], [L.ground.yard, C.yard], [L.ground.road, C.road]])
        for (const p of polygonsOf(rings)) M.flat(triangulate(p), 0.01, c, [-1, 0, K.alley, 1]);
    }
    levels.push({ k, geometry: M.geometry(), cutout: null, signs: S.nv ? S.geometry() : null, antennas: new Float32Array(ant) });
  }
  for (const lv of levels) lv.cutout = Mcs[lv.k].nv ? Mcs[lv.k].geometry() : null;
  return { levels, signTexture: atlas.texture(), signCount: signs.length };
}

// Across a lane cell: the lane's width in cells (1-3) and the axis that crosses it, or null.
function across(L, k) {
  const W = L.W, owned = (c) => L.owner[c] >= 0;
  for (const [step, axis] of [[1, 'x'], [W, 'z']]) {
    let a = k, b = k, n = 1;
    while (n <= 4 && !owned(a - step) && L.alley[a - step] === 1) { a -= step; n++; }
    while (n <= 4 && !owned(b + step) && L.alley[b + step] === 1) { b += step; n++; }
    if (n <= 3 && owned(a - step) && owned(b + step)) return { a, b, n, axis, step };
  }
  return null;
}

// Plastic and metal sheets over the narrow lanes, at about the first floor (p249).
const SHEETS = ['#aca194', '#b68f73', '#8fb3a6', '#c9c2a8', '#6f8fa8', '#d6d3c8'].map(col);
function laneSheets(M, L, rng) {
  for (let k = 0; k < L.N; k++) {
    if (L.alley[k] !== 1 || !L.inside[k] || rng() > 0.07) continue;
    const A = across(L, k);
    if (!A) continue;
    const x0 = L.cellX(A.a) - 0.5, z0 = L.cellZ(A.a) - 0.5, x1 = L.cellX(A.b) + 0.5, z1 = L.cellZ(A.b) + 0.5;
    const len = 1 + rng() * 1.6, y = STOREY + 0.3 + rng() * 1.6, tilt = (rng() - 0.5) * 0.4;
    const [X0, X1, Z0, Z1] = A.axis === 'x' ? [x0, x1, z0 + 0.5 - len / 2, z0 + 0.5 + len / 2] : [x0 + 0.5 - len / 2, x0 + 0.5 + len / 2, z0, z1];
    M.box(X0, y, Z0, X1, y + 0.04 + Math.abs(tilt), Z1, pickc(rng, SHEETS), [-1, 1, K.prop, 1]);
  }
}

// Bundles of water pipes and cables under the lane ceilings (pp10, 106-107, 144).
const PIPES = ['#3a3a38', '#6d6a63', '#2c3b4a', '#8a8378'].map(col);
function lanePipes(M, L, rng) {
  for (let k = 0; k < L.N; k++) {
    if (L.alley[k] !== 1 || !L.inside[k] || rng() > 0.05) continue;
    const A = across(L, k);
    if (!A) continue;
    // The bundle runs along the lane, close to one wall.
    const side = rng() < 0.5 ? A.a : A.b, sgn = side === A.a ? -1 : 1;
    const cx = L.cellX(side), cz = L.cellZ(side), len = 3 + rng() * 4, y = 2.3 + rng() * 0.5;
    for (let q = 0; q < 2 + Math.floor(rng() * 3); q++) {
      const off = 0.35 - q * 0.08, yy = y + (q % 2) * 0.07;
      const r = 0.025 + rng() * 0.03, c = pickc(rng, PIPES);
      if (A.axis === 'x') M.box(cx + sgn * off - r, yy, cz - len / 2, cx + sgn * off + r, yy + 2 * r, cz + len / 2, c, [-1, 0, K.prop, 1]);
      else M.box(cx - len / 2, yy, cz + sgn * off - r, cx + len / 2, yy + 2 * r, cz + sgn * off + r, c, [-1, 0, K.prop, 1]);
    }
  }
}

// The well near the standpipe, no. 34 of the 1992 map (APPROXIMATE): a low stone curb.
function wellAt(M, L) {
  const p = L.places && L.places.find((q) => q.n === 34);
  if (!p) return;
  let best = -1, bd = Infinity;
  for (let dj = -6; dj <= 6; dj++)
    for (let di = -6; di <= 6; di++) {
      const k = p.k + dj * L.W + di;
      if (L.alley[k] === 1 && L.inside[k] && di * di + dj * dj < bd) { bd = di * di + dj * dj; best = k; }
    }
  if (best < 0) return;
  M.prism(L.cellX(best), L.cellZ(best), 0.5, 0, 0.6, 10, col('#8a857a'), [-1, 0, K.plain, 1]);
  M.prism(L.cellX(best), L.cellZ(best), 0.38, 0.6, 0.61, 10, col('#1c1c1a'), [-1, 0, K.plain, 1]);
}

// Bridges over the lanes at storey k, and ladders from the roof of a block whose top storey is
// k up to the next roof (routes.js). A ladder stands on its roof, thus it is part of storey k
// and moves with that roof. A bridge is a closed passage of sheet metal and timber.
const LINK_COL = { bridge: col('#5d5a50'), deck: col('#3f3d38'), ladder: col('#8b6b4a') };
function linksAt(M, L, k, rng) {
  const R = L.routes, B = L.buildings;
  if (!R) return;
  const y0 = k * STOREY;
  for (const br of R.bridges) {
    if (br.f !== k) continue;
    const dx = br.pb.x - br.pa.x, dz = br.pb.z - br.pa.z, len = Math.hypot(dx, dz);
    const t = [dx / len, dz / len], n = [-t[1], t[0]], info = [B[br.b].tower, k, K.cage, 0];
    M.obox([br.pa.x, br.pa.z], t, n, -0.1, len + 0.1, -0.6, 0.6, y0, y0 + 0.2, LINK_COL.deck, info, true);
    M.obox([br.pa.x, br.pa.z], t, n, -0.1, len + 0.1, -0.6, 0.6, y0 + 0.2, y0 + 2.3, LINK_COL.bridge, info, true);
  }
  for (const h of R.hops) {
    const lo = B[L.owner[h.low]], hi = B[L.owner[h.high]];
    if (lo.floors === hi.floors || lo.floors - 1 !== k) continue;
    // Against the higher wall, on the lower roof.
    let nx = L.cellX(h.low) - L.cellX(h.high), nz = L.cellZ(h.low) - L.cellZ(h.high);
    const l = Math.hypot(nx, nz); nx /= l; nz /= l;
    const O = [h.x, h.z], t = [-nz, nx], n = [nx, nz], info = [lo.tower, k, K.cage, 0.25];
    const ya = (k + 1) * STOREY, yb = ya + STOREY + 0.9;
    for (const u of [-0.26, 0.2]) M.obox(O, t, n, u, u + 0.06, 0.12, 0.18, ya, yb, LINK_COL.ladder, info, true);
    for (let y = ya + 0.3; y < yb - 0.1; y += 0.3) M.obox(O, t, n, -0.2, 0.2, 0.13, 0.17, y, y + 0.04, LINK_COL.ladder, info, true);
  }
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
  // A stair hut over each stair of the block (floorplan.js).
  const F = frameOf(b), { ux, uz, px, pz } = F;
  for (const c of b.cores) {
    const O = toXZ(F, c.a0, c.w0), hl = c.a1 - c.a0, hw = c.w1 - c.w0;
    const hc = pickc(rng, palette.hut);
    M.obox(O, [ux, uz], [px, pz], 0, hl, 0, hw, ry, ry + 2.35, hc, info(K.prop), true);
    M.obox(O, [ux, uz], [px, pz], -0.15, hl + 0.15, -0.15, hw + 0.15, ry + 2.35, ry + 2.45, palette.roof[3], info(K.prop), true);
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
  // A shed of grey corrugated sheet or rusty iron on many roofs (pigeon lofts, stores, added
  // rooms; pp312-313, 326-327).
  if (rng() < 0.4 && b.cells.length > 30) {
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
  // TV aerials: "a dense forest" on steel or bamboo poles, 2-5 m tall, about one every 1-3 m;
  // many tilt, and wires join them (pp314-315, 322-325).
  const na = 3 + Math.floor(Math.min(70, b.cells.length / 4) * (0.6 + rng() * 0.4));
  let last = null;
  for (let t = 0; t < na; t++) {
    const p = spot(L, b, rng, 0.2);
    if (!p) continue;
    const [x, z] = p;
    const h = 2 + rng() * 3;
    const lean = rng() < 0.5 ? 0.1 + rng() * 0.45 : 0, la = rng() * 2 * Math.PI;
    const tx = x + Math.cos(la) * lean, tz = z + Math.sin(la) * lean;
    ant.push(x, ry, z, tx, ry + h, tz);
    const a = rng() * Math.PI;
    const bars = 2 + Math.floor(rng() * 3);
    for (let q = 0; q < bars; q++) {
      const f = 1 - (q * 0.45) / h, y = ry + h - q * 0.45, l = (0.9 - q * 0.15) * (0.7 + rng() * 0.6);
      const cx = x + (tx - x) * f, cz = z + (tz - z) * f;
      ant.push(cx - Math.cos(a) * l, y, cz - Math.sin(a) * l, cx + Math.cos(a) * l, y, cz + Math.sin(a) * l);
    }
    if (last && Math.hypot(last[0] - tx, last[2] - tz) < 4.5 && rng() < 0.6) ant.push(last[0], last[1], last[2], tx, ry + h * 0.85, tz);
    last = [tx, ry + h * 0.85, tz];
  }
}

// A single-storey hall of the Yamen compound: walls on the plot outline and a pitched
// tile roof over its long axis. The restored halls face SSE (OSM); the plan shows the
// compound as the old people's centre, with the youth centre on its north side.
// INFERRED from the Yamen of 1847 as restored in today's park, not from a photo of 1986:
// grey brick on a granite base; roofs of grey pan-and-roll tiles, with a ridge and a green
// glazed edge at the eaves; on the bigger halls a porch of granite columns on the south side,
// with the door in the middle. Every part has the one tower id, so the halls light up together.
function buildYamen(M, L, b, tris, C, useCol, tower) {
  const info = (kind, w = 1) => [tower, 0, kind, w];
  for (const t of tris) M.flat(t, 0.03, useCol.yamen, info(K.plate));
  const wh = 3.4, base = 0.45;
  for (const ring of b.rings)
    for (const e of ring.edges) {
      const fr = wallFrame(e), n = [fr.n[0], 0, fr.n[1]];
      M.vwall(fr.A, fr.B, 0, base, n, C.granite, 0, fr.len, info(K.plain));
      // aInfo.w 2: the shader lays the brick in courses (v from the top of the base)
      M.vwall(fr.A, fr.B, base, wh, n, C.yamenWall, 0, fr.len, info(K.plain, 2));
    }
  // Roof over the plot's bounding box, with its ridges along a and the halls' fronts across
  // it (c). The halls face SSE, which is +z in the plan: the ridges run along whichever axis
  // of the plot is nearer x.
  let [ux, uz] = b.axis;
  if (Math.abs(uz) > Math.abs(ux)) [ux, uz] = [-uz, ux];
  const px = -uz, pz = ux;
  let a0 = Infinity, a1 = -Infinity, c0 = Infinity, c1 = -Infinity;
  for (const ring of b.rings)
    for (const [x, z] of ring.pts) {
      const a = x * ux + z * uz, c = x * px + z * pz;
      a0 = Math.min(a0, a); a1 = Math.max(a1, a); c0 = Math.min(c0, c); c1 = Math.max(c1, c);
    }
  const P = (a, y, c) => [ux * a + px * c, y, uz * a + pz * c];
  const U = [ux, uz], V = [px, pz], O = [0, 0];
  // +z is SSE in the plan: sc is the side of c that faces south. A big hall has a deeper
  // eave there, over the porch. A deep plot is roofed as several halls side by side, each
  // under its own pitched roof, with a gutter between them.
  const sc = pz >= 0 ? 1 : -1, big = a1 - a0 > 5 && c1 - c0 > 4;
  const nb = Math.max(1, Math.round((c1 - c0) / 9)), half = (c1 - c0) / nb / 2;
  const ridgeH = wh + Math.min(2.6, 0.45 * half + 0.6), ga = 0.25; // the roof runs ga past the gables
  const slope = (ridgeH - (wh - 0.3)) / (half + 0.5);
  const gv = (y) => y - base;
  let porch = null;
  for (let i = 0; i < nb; i++) {
    const cm = c0 + (2 * i + 1) * half;
    for (const side of [1, -1]) {
      // eaves: deep over the porch, short on the outer walls, none at a gutter
      const outer = side > 0 ? i === nb - 1 : i === 0, south = outer && side === sc;
      const ov = !outer ? 0 : south && big ? 1.5 : 0.5;
      const ce = cm + side * (half + ov), ye = ridgeH - slope * (half + ov), len = Math.hypot(half + ov, ridgeH - ye);
      const ny = (half + ov) / len, nc = ((ridgeH - ye) / len) * side;
      if (south && big) porch = { cw: cm + side * half, depth: ov - 0.3, ye };
      // aInfo.w 2: tiles; v runs up the slope from the eave, in metres
      M.face([P(a0 - ga, ye, ce), P(a1 + ga, ye, ce), P(a1 + ga, ridgeH, cm), P(a0 - ga, ridgeH, cm)], [px * nc, ny, pz * nc], C.yamenRoof,
        [[a0 - ga, 0], [a1 + ga, 0], [a1 + ga, len], [a0 - ga, len]], info(K.roof, 2));
      // the glazed board along an eave
      if (outer)
        M.face([P(a0 - ga, ye - 0.16, ce), P(a1 + ga, ye - 0.16, ce), P(a1 + ga, ye, ce), P(a0 - ga, ye, ce)], [px * side, 0, pz * side], C.glaze,
          [[a0, 0], [a1, 0], [a1, 0.16], [a0, 0.16]], info(K.roof));
      // the verges: the roof's thickness along the gables
      for (const [a, s2] of [[a0 - ga, -1], [a1 + ga, 1]])
        M.face([P(a, ye - 0.16, ce), P(a, ridgeH - 0.16, cm), P(a, ridgeH, cm), P(a, ye, ce)], [ux * s2, 0, uz * s2], C.yamenRidge,
          [[0, 0], [len, 0], [len, 0.16], [0, 0.16]], info(K.roof));
    }
    // the ridge, its ends raised a little
    M.obox(O, U, V, a0 - ga - 0.05, a1 + ga + 0.05, cm - 0.14, cm + 0.14, ridgeH - 0.12, ridgeH + 0.24, C.yamenRidge, info(K.roof), true);
    for (const [x0, x1] of [[a0 - ga - 0.1, a0 - ga + 0.4], [a1 + ga - 0.4, a1 + ga + 0.1]])
      M.obox(O, U, V, x0, x1, cm - 0.12, cm + 0.12, ridgeH + 0.24, ridgeH + 0.46, C.yamenRidge, info(K.roof), true);
    // the gables, in brick
    const ca = cm - half, cb = cm + half;
    M.face([P(a0, wh, ca), P(a0, wh, cb), P(a0, ridgeH - 0.2, cm)], [-ux, 0, -uz], C.yamenWall, [[ca, gv(wh)], [cb, gv(wh)], [cm, gv(ridgeH - 0.2)]], info(K.plain, 2));
    M.face([P(a1, wh, cb), P(a1, wh, ca), P(a1, ridgeH - 0.2, cm)], [ux, 0, uz], C.yamenWall, [[cb, gv(wh)], [ca, gv(wh)], [cm, gv(ridgeH - 0.2)]], info(K.plain, 2));
  }
  if (!porch) return;
  // The porch: a granite step, columns along its edge under a beam, and the door. Columns
  // stand only on open ground (not on another hall).
  const { cw, depth, ye } = porch, la = a1 - a0;
  const open = (a, c) => {
    const [x, , z] = P(a, 0, c), i = Math.floor(x - L.x0), j = Math.floor(z - L.z0);
    return i >= 0 && j >= 0 && i < L.W && j < L.D && L.inside[j * L.W + i] && L.owner[j * L.W + i] < 0;
  };
  const cols = [], nc = Math.max(2, Math.round(la / 3));
  for (let i = 0; i <= nc; i++) {
    const a = 0.4 + ((la - 0.8) * i) / nc;
    if (open(a0 + a, cw + sc * depth)) cols.push(a);
  }
  if (cols.length < 2) return;
  const F0 = P(a0, 0, cw), fo = [F0[0], F0[2]], Pn = [px * sc, pz * sc];
  M.obox(fo, U, Pn, cols[0] - 0.3, cols[cols.length - 1] + 0.3, 0, depth + 0.3, 0, 0.16, C.granite, info(K.plain));
  for (const a of cols) {
    const [x, , z] = P(a0 + a, 0, cw + sc * depth);
    M.prism(x, z, 0.13, 0.16, ye - 0.3, 8, C.granite, info(K.plain));
  }
  M.obox(fo, U, Pn, cols[0] - 0.2, cols[cols.length - 1] + 0.2, depth - 0.12, depth + 0.12, ye - 0.32, ye - 0.04, C.door, info(K.plain), true);
  const am = la / 2;
  M.obox(fo, U, Pn, am - 0.95, am + 0.95, 0, 0.03, base, 3.0, C.granite, info(K.plain));
  M.obox(fo, U, Pn, am - 0.75, am + 0.75, 0.03, 0.05, base, 2.8, C.door, info(K.plain));
}

// Plan of one storey for the cut view: black wall caps and dotted outlines; inside each
// block, the corridor, the stairs, the walls between units, and the cubicles and bed spaces
// of the flats (floorplan.js).
const POSTBOX = col('#6f7d62'), METERS = col('#2b2b29');
export function buildPlan(L, c) {
  const M = new Builder();
  const lines = [], spots = [], lamps = [];
  // Whitewashed walls and corridors, mosaic stairs (pp165, 177).
  const black = col('#141414'), part = col('#cfc8bd'), thin = col('#d8d2c6');
  const plate = { corridor: col('#e2ddd8'), stair: col('#6e6966') };
  const plateW = { corridor: 2, stair: 3 };
  const y0 = c * STOREY, yc = y0 + CUT_H;
  const UV = [[0, 0], [1, 0], [1, 1], [0, 1]];
  for (const b of L.buildings) {
    if (b.floors <= c || b.kind === 'yamen') continue;
    const info = [b.tower, c, K.poche, 1], faceInfo = [b.tower, c, K.iwall, 1];
    for (const ring of b.rings)
      for (const e of ring.edges) {
        const fr = wallFrame(e), q = 0.2;
        const ix = -fr.n[0] * q, iz = -fr.n[1] * q;
        M.face([[fr.A[0], yc + 0.005, fr.A[1]], [fr.B[0], yc + 0.005, fr.B[1]], [fr.B[0] + ix, yc + 0.005, fr.B[1] + iz], [fr.A[0] + ix, yc + 0.005, fr.A[1] + iz]],
          [0, 1, 0], black, UV, info);
        lines.push(fr.A[0], yc + 0.03, fr.A[1], fr.B[0], yc + 0.03, fr.B[1]);
      }
    // A wall from (X0, Z0) to (X1, Z1): t is half its thickness, h its height over the floor.
    const emit = ([X0, Z0, X1, Z1], t, h, c0, cap, dashed) => {
      const dx = X1 - X0, dz = Z1 - Z0, l = Math.hypot(dx, dz);
      if (l < 0.1) return;
      const nx = -dz / l, nz = dx / l, y = y0 + h;
      M.vwall([X0, Z0], [X1, Z1], y0, y, [nx, 0, nz], c0, 0, l, faceInfo);
      M.face([[X0 + nx * t, y + 0.005, Z0 + nz * t], [X1 + nx * t, y + 0.005, Z1 + nz * t], [X1 - nx * t, y + 0.005, Z1 - nz * t], [X0 - nx * t, y + 0.005, Z0 - nz * t]],
        [0, 1, 0], cap, UV, info);
      if (dashed) lines.push(X0, y + 0.03, Z0, X1, y + 0.03, Z1);
    };
    const d = planDrawing(L, b, c);
    for (const [q, key] of d.plates) M.face(q.map(([x, z]) => [x, y0 + 0.045, z]), [0, 1, 0], plate[key], q.map(([x, z]) => [x, z]), [b.tower, c, K.plate, plateW[key]]);
    for (const w of d.walls) emit(w, 0.07, CUT_H, part, black, true);
    for (const w of d.fine) emit(w, 0.035, CUT_H * 0.8, thin, part, false);
    for (const w of d.treads) emit(w, 0.02, 0.08, black, black, false);
    const fu = furnish(M, L, b, c, planAt(b, c), d);
    for (const sp of fu.spots) spots.push({ ...sp, b: b.id });
    for (const lp of fu.lamps) lamps.push({ ...lp, b: b.id });
    // On G/F, a wall of postboxes at each entrance (p188) and a bank of meters at the stair
    // (p101). Their places beside the stair are INFERRED.
    if (c === 0 && b.cores.length) {
      const F = frameOf(b), u = [F.ux, F.uz], p = [F.px, F.pz], pi = [b.tower, c, K.plain, 1];
      for (const core of b.cores) {
        const l = Math.min(1.2, core.a1 - core.a0);
        M.obox(toXZ(F, core.a0, core.w0), u, p, 0, l, -0.24, -0.04, y0, y0 + 1.0, POSTBOX, pi, true);
        M.obox(toXZ(F, core.a0, core.w1), u, p, 0, Math.min(0.8, l), 0.04, 0.2, y0 + 0.45, y0 + 1.05, METERS, pi, true);
      }
    }
  }
  // Doors through the walls between blocks: amber where they link two towers (routes.js).
  const door = { inner: plate.corridor, link: col('#c9a35c') };
  for (const d of (L.routes && L.routes.doorsAt[c]) || []) {
    let nx = L.cellX(d.kc) - L.cellX(d.kb), nz = L.cellZ(d.kc) - L.cellZ(d.kb);
    const l = Math.hypot(nx, nz); nx /= l; nz /= l;
    const tx = -nz, tz = nx, x = d.pa.x, z = d.pa.z, y = yc + 0.012;
    M.face([[x - tx * 0.45 - nx * 0.3, y, z - tz * 0.45 - nz * 0.3], [x + tx * 0.45 - nx * 0.3, y, z + tz * 0.45 - nz * 0.3],
      [x + tx * 0.45 + nx * 0.3, y, z + tz * 0.45 + nz * 0.3], [x - tx * 0.45 + nx * 0.3, y, z - tz * 0.45 + nz * 0.3]],
    [0, 1, 0], d.link ? door.link : door.inner, UV, [L.buildings[d.b].tower, c, K.plate, 1]);
  }
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lines), 3));
  return { geometry: M.geometry(), lines: lg, spots, lamps };
}

// The section at a cut storey, the same in both views: each storey drops all that rises above
// the cut plane (uCutTop, a height of the normal view: the storeys before their lift; very
// high with no cut). The cut storey also drops its roofs, parapets, roof things and stair
// wells; its plan draws the walls.
const SECTION = /* glsl */ `
if (vRestY > uCutTop) discard;
if (uIsCut > 0.5 && (kind == 2.0 || kind == 4.0 || kind == 5.0 || kind == 14.0)) discard;`;

const FRAG = /* glsl */ `
vec3 glow = vec3(0.0);
float kind = vInfo.z;
float bid = vInfo.x;
float flr = vInfo.y;
vec2 fwW = fwidth(vWall); // the size of a pixel in metres of the face
${SECTION}
// Light colours measured in the photos: tubes near-white (#f4f6f1), windows at dusk blue-white
// (#b4dcfa), and some warm bulbs (pp16-17, 30, 42).
const vec3 TUBE = vec3(0.9, 0.92, 0.88);
const vec3 DUSK = vec3(0.46, 0.72, 0.96);
const vec3 BULB = vec3(1.0, 0.72, 0.42);
if (kind < 0.5) {
  float u = vWall.x; float v = vWall.y;
  // aInfo.w: the window width mw + 8 * (the lane darkness + 16 * the step of the floor lines)
  float code = floor(vInfo.w / 8.0);
  float mw = vInfo.w - code * 8.0;
  float lane = mod(code, 16.0) / 10.0; // 0 on an open face, up to 1 in a lane under 2 m
  float hgt = flr * 3.05 + v;
  float g = 0.88 + 0.12 * hash12(floor(vec2(u * 0.8, (flr * 2.8 + v) * 0.6)) + bid * 3.1);
  diffuseColor.rgb *= g;
  diffuseColor.rgb *= mix(0.8, 1.0, clamp(flr / 6.0, 0.0, 1.0));
  // Weathering: broad patches of grime, and black mould where the water runs (pp14, 32-33).
  float fade = 1.0 - smoothstep(0.03, 0.08, max(fwW.x, fwW.y)); // fine detail fades out far off
  diffuseColor.rgb *= 0.84 + 0.22 * vnoise(vec2(u * 0.45, hgt * 0.3) + bid * 7.1);
  float mould = vnoise(vec2(u * 1.4, hgt * 0.7) + bid * 3.3);
  if (fade > 0.0) mould = mould * 0.7 + vnoise(vec2(u * 5.0, hgt * 2.0) + bid) * 0.3 * fade + 0.15 * (1.0 - fade);
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.12, 0.12, 0.1), smoothstep(0.66, 0.86, mould) * 0.5);
  // Some towers are faced in small mosaic tiles (INFERRED).
  if (hash12(vec2(bid, 9.1)) < 0.22) {
    vec2 tq = vec2(u, hgt) / 0.1;
    float joint = max(fcBars(tq.x, 0.1, fwW.x / 0.1), fcBars(tq.y, 0.1, fwW.y / 0.1));
    diffuseColor.rgb *= (1.0 + 0.1 * fade * (hash12(floor(tq) + bid) - 0.5)) * (1.0 - 0.2 * joint);
  }
  // Each building has its own floor lines, not those of its neighbours (p143).
  float vo = (floor(code / 16.0) / 14.0 - 0.5) * 0.7;
  float vv = flr < 0.5 ? v : v - vo;
  if (mod(vv, 3.05) < 0.2) diffuseColor.rgb *= 0.72;
  // Grime streaks fall from each slab edge, some of them rust (pp14, 96-97).
  float sc = floor(u * 2.6);
  float h1 = hash12(vec2(sc, bid * 1.7 + flr * 3.1)), h2 = hash12(vec2(sc + 9.0, bid + flr));
  float drop = mod(3.05 - vv, 3.05);
  float st = step(0.3, h1) * (1.0 - smoothstep(0.0, 0.3 + 2.4 * h2 * h2, drop));
  vec3 stainC = h1 > 0.88 ? vec3(0.24, 0.1, 0.067) : vec3(0.19, 0.11, 0.08);
  diffuseColor.rgb = mix(diffuseColor.rgb, stainC, st * (0.2 + 0.3 * h2));
  if (!gl_FrontFacing) {
    // inside face of an outer wall: whitewash, darker near the floor
    diffuseColor.rgb = vec3(0.36, 0.34, 0.3) * (0.75 + 0.25 * smoothstep(0.0, 1.2, v));
  } else if (mw < 0.1) {
    // a blank wall: more water stains run down from the slab edges
    diffuseColor.rgb *= 0.82 + 0.18 * hash12(vec2(floor(u * 1.7), bid + flr));
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
      // an open shop is lit by tubes; a shut one has its steel gate down
      if (isOpen) { diffuseColor.rgb = TUBE * 0.35; glow += TUBE * (0.3 + 0.4 * uNight); }
      else { float sh = step(0.5, fract(v * 10.0)); diffuseColor.rgb = mix(vec3(0.3), vec3(0.22), sh); }
    }
  } else {
    float wi = floor(u / mw); float fx = fract(u / mw);
    vec2 wid = vec2(bid * 7.0 + wi, flr * 13.0 + bid);
    float r1 = hash12(wid), r2 = hash12(wid + 17.3), r3 = hash12(wid + 41.7), r4 = hash12(wid + 63.1), r5 = hash12(wid + 81.9);
    // The opening (u0..u1, v0..v1): most are wide; some are narrow, or small and high (a
    // kitchen or a toilet). The cages of cityMesh.js fit the wide ones.
    float x0 = 0.14, x1 = 0.86, v0 = 0.8, v1 = 2.25;
    if (r4 < 0.1) { x0 = 0.34; x1 = 0.66; }
    else if (r4 < 0.18) { x0 = 0.3; x1 = 0.7; v0 = 1.5; }
    float u0 = (wi + x0) * mw, u1 = (wi + x1) * mw;
    bool win = r1 > 0.08;
    vec3 wallC = diffuseColor.rgb;
    // a streak under the sill
    if (win && fx > x0 + 0.12 && fx < x1 - 0.12 && vv > 0.0 && vv < v0 - 0.1 && r3 > 0.35) diffuseColor.rgb *= 1.0 - 0.3 * smoothstep(v0 - 0.1 - 0.7 * r2, v0 - 0.1, vv);
    // the sill, lit on top with a shadow under it; on some, a hood over the head
    if (win && u > u0 - 0.06 && u < u1 + 0.06) {
      if (vv > v0 - 0.07 && vv <= v0) diffuseColor.rgb = wallC * 1.2;
      else if (vv > v0 - 0.12 && vv <= v0 - 0.07) diffuseColor.rgb = wallC * 0.5;
      else if (r5 > 0.62 && vv >= v1 && vv < v1 + 0.08) diffuseColor.rgb = wallC * (vv < v1 + 0.02 ? 0.55 : 1.15);
    }
    if (win && u > u0 && u < u1 && vv > v0 && vv < v1) {
      float on1 = 5.0 + r2 * 2.2, off1 = 6.6 + r3 * 1.6;
      float on2 = 17.0 + r2 * 2.4, off2 = 21.5 + r3 * 4.0;
      bool lit = (uHour > on1 && uHour < off1) || (uHour > on2 && uHour < off2) || (uHour + 24.0 < off2) || r1 > 0.95;
      vec3 lc = r2 < 0.45 ? DUSK : (r2 < 0.8 ? TUBE : BULB);
      if (fade < 0.01) {
        // Far off, a window is a few pixels: one colour for its glass, frame and curtains.
        float cur = hash12(wid + 3.0);
        vec3 wc = cur < 0.22 ? vec3(0.06) : vec3(0.2, 0.18, 0.15);
        diffuseColor.rgb = wc;
        if (lit) { diffuseColor.rgb = lc * 0.4; glow += lc * (0.16 + 1.0 * uNight) * (cur < 0.22 ? 0.85 : 0.6); }
      } else {
      // The opening is set back D into the wall. Follow the line of sight in: it meets a
      // reveal (a side, or the sill below) or the glass. The camera is orthographic.
      vec3 Nw = normalize(vWN), Tw = vec3(Nw.z, 0.0, -Nw.x);
      vec3 Vc = vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2]);
      float vn = max(dot(Vc, Nw), 0.2), du = -dot(Vc, Tw) / vn, dv = -Vc.y / vn;
      float D = 0.12 + 0.1 * r3;
      float tu = du > 0.0 ? (u1 - u) / du : (du < 0.0 ? (u0 - u) / du : 9.0);
      float tv = dv > 0.0 ? (v1 - vv) / dv : (dv < 0.0 ? (v0 - vv) / dv : 9.0);
      float th = min(tu, tv);
      if (th < D) {
        diffuseColor.rgb = wallC * (tu < tv ? 0.62 : (dv < 0.0 ? 0.95 : 0.45)) * (1.0 - 0.3 * th / D);
        if (lit) glow += lc * 0.15 * (th / D) * (0.2 + uNight);
      } else {
        // on the glass: gm in metres from its lower left corner, g from 0 to 1
        float W = u1 - u0, Hh = v1 - v0;
        vec2 gm = vec2(u + du * D - u0, vv + dv * D - v0), g = gm / vec2(W, Hh);
        float ft = hash12(wid + 7.7);
        // the frame: steel casements with a fanlight, an aluminium slider, or many small panes
        float nl = ft < 0.5 ? (W > 1.1 ? 3.0 : 2.0) : (ft < 0.85 ? 2.0 : 3.0);
        float edge = min(min(gm.x, W - gm.x), min(gm.y, Hh - gm.y));
        float mx = abs(fract(g.x * nl + 0.5) - 0.5) * W / nl;
        float bar = max(step(edge, 0.045), step(mx, ft < 0.85 ? 0.022 : 0.012));
        if (ft < 0.5) bar = max(bar, step(abs(g.y - 0.72) * Hh, 0.022));
        else if (ft >= 0.85) bar = max(bar, step(abs(fract(g.y * 4.0 + 0.5) - 0.5) * Hh / 4.0, 0.012));
        float fc = hash12(wid + 2.9);
        vec3 frameC = ft >= 0.5 && ft < 0.85 ? vec3(0.6, 0.61, 0.58)
          : (fc < 0.3 ? vec3(0.16, 0.25, 0.19) : (fc < 0.55 ? vec3(0.72, 0.7, 0.62) : (fc < 0.8 ? vec3(0.38, 0.43, 0.47) : vec3(0.34, 0.18, 0.12))));
        // behind the glass: bare, curtains drawn back or shut, a blind let down part way,
        // frosted or papered panes, or newspaper; tr: how much lamp light comes through
        float cur = hash12(wid + 3.0), cc = hash12(wid + 5.5);
        vec3 curC = cc < 0.2 ? vec3(0.62, 0.22, 0.16) : (cc < 0.4 ? vec3(0.32, 0.43, 0.3) : (cc < 0.6 ? vec3(0.78, 0.72, 0.58)
          : (cc < 0.75 ? vec3(0.32, 0.4, 0.58) : (cc < 0.9 ? vec3(0.75, 0.5, 0.22) : vec3(0.72, 0.56, 0.6)))));
        float fold = 0.78 + 0.22 * sin(gm.x * 38.0) * fade;
        vec3 inside = vec3(0.035, 0.034, 0.032) * (0.7 + 0.6 * g.y);
        float tr = 1.0, cover = 0.0;
        if (cur < 0.22) {
        } else if (cur < 0.5) {
          float sd = 0.16 + 0.14 * hash12(wid + 9.1);
          if (g.x < sd || g.x > 1.0 - sd) { cover = 1.0; inside = curC * fold; tr = 0.4; }
        } else if (cur < 0.64) {
          if (abs(g.x - 0.5 - (cc - 0.5) * 0.4) > 0.025) { cover = 1.0; inside = curC * fold; tr = 0.4; }
        } else if (cur < 0.8) {
          float bh = 0.3 + 0.65 * hash12(wid + 2.2);
          if (g.y > 1.0 - bh) { float sl = mix(0.85, step(0.3, fract(gm.y / 0.045)), fade); cover = 1.0; inside = vec3(0.74, 0.72, 0.66) * (0.7 + 0.3 * sl); tr = 0.5 * (0.5 + 0.5 * sl); }
        } else if (cur < 0.9) {
          if (g.y < 0.62) { cover = 1.0; inside = vec3(0.56, 0.58, 0.56); tr = 0.65; }
        } else {
          cover = 1.0; inside = vec3(0.62, 0.6, 0.54) * (1.0 + 0.25 * fade * (hash12(floor(gm * vec2(14.0, 34.0)) + wid) - 0.5)); tr = 0.3;
        }
        inside *= mix(1.0, 0.62, cover);
        // one leaf open: no glass in it
        bool openLeaf = r5 < 0.2 && ft < 0.85 && g.x > 1.0 - 1.0 / nl;
        // a little of the sky and the building opposite in the glass, and a sheen
        float sheen = smoothstep(0.3, 0.0, abs(fract(g.x * 0.55 + g.y * 0.4 + r2) - 0.5));
        vec3 refl = vec3(0.5, 0.53, 0.56) * (0.07 + 0.13 * sheen) * (1.0 - 0.85 * uNight);
        vec3 wc = inside + (openLeaf ? vec3(0.0) : refl);
        // the head of the opening shades the top of the glass by day
        wc *= 1.0 - 0.35 * smoothstep(0.7, 1.0, g.y) * (1.0 - uNight);
        if (lit) {
          vec3 room = lc * 0.45 * (0.8 + 0.3 * g.y);
          wc = mix(room, mix(room, inside * lc * 1.3, 0.6), cover) + (openLeaf ? vec3(0.0) : refl * 0.5);
          vec3 tint = tr * (0.6 + 0.6 * inside / max(max(inside.r, inside.g), max(inside.b, 0.05)));
          glow += lc * (0.16 + 1.0 * uNight) * mix(vec3(1.0), tint, cover) * (0.85 + 0.25 * g.y);
        }
        diffuseColor.rgb = mix(wc, frameC, bar);
        glow *= 1.0 - bar;
      }
      }
      // a grille flush in the opening, on some of the low windows
      if (r5 > (flr < 2.5 ? 0.7 : 0.94)) {
        float gb = max(fcGrid(u - u0, 0.12, 0.016, fwW.x), fcGrid(vv - v0, (v1 - v0) / 3.0, 0.02, fwW.y));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.13, 0.15, 0.13), gb);
        glow *= 1.0 - gb;
      }
    }
  }
  // A lane face is 10-35 % as bright as an open face near the ground (photos, pp10, 42, 102),
  // with pools of light from the tubes and bulbs.
  if (lane > 0.0 && gl_FrontFacing) {
    float h = flr * 3.05 + v;
    diffuseColor.rgb *= mix(1.0, mix(0.14, 1.0, smoothstep(0.0, 20.0, h)), lane);
    float pc = fract(u / 6.5 + hash12(vec2(bid, 5.1)));
    float pool = smoothstep(0.32, 0.0, abs(pc - 0.5)) * (1.0 - smoothstep(0.0, 5.0, h));
    glow += mix(TUBE, BULB, step(0.7, hash12(vec2(bid, floor(u / 6.5))))) * pool * 0.1 * lane;
  }
} else if (kind == 1.0) {
  float pw = vInfo.w;
  vec2 q = vWall;
  if (pw > 2.5 && pw < 3.5) {
    // the floor round a stair: mosaic (p165)
    diffuseColor.rgb *= 0.75 + 0.45 * hash12(floor(q * 9.0));
  } else if (pw > 1.5 && pw < 2.5) {
    // a corridor: whitewash, the brightest space inside, lit by tubes (p177)
    diffuseColor.rgb *= 0.9 + 0.12 * hash12(floor(q * vec2(3.0, 0.7)));
    glow += TUBE * (0.06 + 0.3 * uNight);
  } else if (pw < 1.5) {
    diffuseColor.rgb *= 0.9 + 0.1 * hash12(floor(q * 1.6) + bid);
    // Tiles in the cut view: a checker (p156) or a small mosaic (pp25, 156).
    float tk = hash12(vec2(bid, flr * 1.7));
    if (uIsCut > 0.5 && tk < 0.35) diffuseColor.rgb *= mix(0.8, 1.12, mod(floor(q.x / 0.3) + floor(q.y / 0.3), 2.0));
    else if (uIsCut > 0.5 && tk < 0.55) diffuseColor.rgb *= 0.9 + 0.18 * hash12(floor(q * 7.0));
  } else if (pw < 4.5) {
    // terrazzo: chips in cement, with brass strips
    diffuseColor.rgb *= 0.86 + 0.22 * hash12(floor(q * 30.0));
    if (hash12(floor(q * 30.0) + 3.1) > 0.92) diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.7, 0.66, 0.6), 0.6);
    if (min(fract(q.x / 1.2), fract(q.y / 1.2)) < 0.012) diffuseColor.rgb *= vec3(1.15, 0.9, 0.55);
  } else if (pw < 5.5) {
    // a checker of 30 cm tiles (p156)
    vec2 g = q / 0.3;
    diffuseColor.rgb *= mix(0.58, 1.1, mod(floor(g.x) + floor(g.y), 2.0));
    if (min(fract(g.x), fract(g.y)) < 0.04) diffuseColor.rgb *= 0.7;
  } else if (pw < 6.5) {
    // a small mosaic (pp25, 156)
    vec2 g = q * 20.0;
    diffuseColor.rgb *= 0.8 + 0.32 * hash12(floor(g) + bid);
    if (min(fract(g.x), fract(g.y)) < 0.1) diffuseColor.rgb *= 0.72;
  } else if (pw < 7.5) {
    // linoleum with a printed pattern
    vec2 g = fract(q * 1.6) - 0.5;
    float r = length(g), dm = abs(g.x) + abs(g.y);
    diffuseColor.rgb *= 0.9 + 0.08 * vnoise(q * 3.0);
    diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 1.45, smoothstep(0.025, 0.0, abs(r - 0.28)));
    diffuseColor.rgb *= 1.0 - 0.18 * step(0.46, dm);
  } else if (pw < 8.5) {
    // the cement floor of a workshop, with oil stains
    diffuseColor.rgb *= 0.78 + 0.3 * vnoise(q * 0.7) + 0.06 * hash12(floor(q * 40.0));
    float oil = vnoise(q * 1.3 + 7.0);
    diffuseColor.rgb *= 1.0 - 0.45 * smoothstep(0.62, 0.8, oil);
  } else {
    // white wall tiles on the floor of a kitchen or a toilet, and wet
    vec2 g = q / 0.15;
    diffuseColor.rgb *= 0.92 + 0.1 * hash12(floor(g));
    if (min(fract(g.x), fract(g.y)) < 0.06) diffuseColor.rgb *= 0.68;
    diffuseColor.rgb *= 1.0 - 0.25 * smoothstep(0.55, 0.75, vnoise(q * 2.0 + 3.0));
  }
  // Floors are only seen in the cut and exploded views; light them like lit rooms at night.
  glow += diffuseColor.rgb * (0.08 + 0.42 * uNight);
} else if (kind == 2.0) {
  if (vInfo.w > 1.5) {
    // The Yamen's tiles: rows of round roll tiles down the slope over the pans, courses
    // across, moss, and a green glazed edge at the eaves (INFERRED; see buildYamen).
    float rp = abs(fract(vWall.x / 0.24) - 0.5) * 2.0; // 0 on a roll, 1 in a pan
    float fr = 1.0 - smoothstep(0.08, 0.2, fwW.x);
    float t = mix(0.86, mix(1.12, 0.6, smoothstep(0.15, 0.6, rp)), fr);
    t *= 1.0 - 0.15 * fr * step(fract(vWall.y / 0.2), 0.12);
    diffuseColor.rgb *= t * (0.9 + 0.18 * vnoise(vWall * vec2(0.8, 1.5) + bid));
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.3, 0.33, 0.25), smoothstep(0.65, 0.9, vnoise(vWall * vec2(2.5, 4.0) + 5.0)) * 0.25);
    if (vWall.y < 0.3) diffuseColor.rgb = vec3(0.24, 0.42, 0.31) * t;
  } else diffuseColor.rgb *= 0.8 + 0.2 * hash12(floor(vWall * 0.7) + bid * 1.7);
} else if (kind == 3.0) {
  diffuseColor.rgb *= 0.8 + 0.25 * hash12(floor(vWall * 0.9));
  // Pools of light under the tubes and bulbs of the lanes.
  vec2 g2 = vWall / 5.0; vec2 cl = floor(g2);
  vec2 f2 = fract(g2) - 0.5 - (vec2(hash12(cl + 3.1), hash12(cl + 8.7)) - 0.5) * 0.5;
  float pool = step(0.5, hash12(cl)) * (1.0 - smoothstep(0.05, 0.3, length(f2)));
  glow += vec3(0.035, 0.05, 0.042) * (0.6 + 0.4 * uNight) + mix(TUBE, BULB, step(0.7, hash12(cl + 1.3))) * pool * 0.09;
} else if (kind == 4.0) {
  // a parapet: black mould (pp14, 32-33)
  diffuseColor.rgb *= 0.5 + 0.35 * hash12(floor(vWall * vec2(1.3, 4.0)) + bid);
} else if (kind == 6.0 && vInfo.w < 0.5) {
  // A bridge or a ladder (w 0.25): a grille painted over a dark void, lit from inside at
  // night. A ladder takes its lights from the storey it climbs to.
  float bar = max(step(0.78, fract(vWall.x * 8.0)), step(0.84, fract(vWall.y * 2.6)));
  vec2 cid = floor(vWall.xx * 0.6) + vec2(bid, flr + step(0.1, vInfo.w));
  float lit = step(0.45, hash12(cid));
  vec3 lc = hash12(cid + 7.0) < 0.55 ? DUSK : BULB;
  vec3 inner = mix(vec3(0.03, 0.022, 0.018), lc * 0.3, lit * uNight);
  glow += lc * lit * uNight * 0.55 * (1.0 - bar);
  diffuseColor.rgb = mix(inner, diffuseColor.rgb, bar);
} else if (kind == 6.0) {
  // A window cage (pp18, 26, 142-143) or a bird cage: steel bars, cut out where there is no
  // steel, so the window and the wall show through. Painted, and rusting at the joints.
  float far = smoothstep(0.015, 0.08, max(fwW.x, fwW.y));
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.34, 0.17, 0.09), smoothstep(0.55, 0.9, vnoise(vWall * vec2(3.0, 1.5) + bid * 1.7 + flr * 5.3)) * 0.6);
  float face = 0.0, pat; vec2 S;
  if (vInfo.w > 1.5) fcDecode(vInfo.w, face, pat, S);
  if (face > 3.5) diffuseColor.rgb *= 0.5; // the floor
  else if (face > 2.5) {
    // a sheet of corrugated iron over the top, rusty in patches
    diffuseColor.rgb *= mix(1.0, 0.82 + 0.3 * abs(sin(vWall.y * 41.0)), 1.0 - far) * (0.8 + 0.3 * vnoise(vWall * 2.0 + bid));
  } else diffuseColor.rgb *= mix(1.0, 0.32, far); // far off, the bars blend with the dark inside
  // Far off, a cage is a few pixels of bars, things and the shade under its top: a dark
  // screen (as in the old cages). At night, less of it, so the lit windows still show.
  float cv = facadeCover(kind, vInfo, vWall, vWN, fwW);
  if (face < 2.5) cv = mix(cv, 0.8, far * (1.0 - 0.6 * uNight));
  CUTOUT(cv);
} else if (kind == 7.0) {
  // An air-conditioner (facades.js emitAC): the grille of its condenser outside, louvres in
  // the sides, a hood of corrugated sheet on some; grime and drips.
  float face = 0.0, st = 0.0; vec2 S = vec2(1.0);
  if (vInfo.w > 1.5) fcDecode(vInfo.w, face, st, S);
  vec2 q = vWall;
  float fd = 1.0 - smoothstep(0.01, 0.04, max(fwW.x, fwW.y));
  float rim = step(0.035, min(min(q.x, S.x - q.x), min(q.y, S.y - q.y)));
  if (face < 0.5 && vInfo.w > 1.5) {
    float gr = st < 0.5 ? step(0.45, fract(q.y / 0.022)) : (st < 1.5 ? step(0.5, fract(q.x / 0.02))
      : (st < 2.5 ? max(step(0.6, fract(q.x / 0.03)), step(0.6, fract(q.y / 0.03))) : step(0.5, fract(length(q - S * 0.5) / 0.03))));
    if (st > 2.5 && length(q - S * 0.5) > min(S.x, S.y) * 0.42) gr = 1.0;
    diffuseColor.rgb *= mix(1.0, mix(0.85, mix(0.25, 1.0, gr), fd), rim);
  } else if (face < 1.5) {
    float sl = step(0.5, fract(q.y / 0.035)) * step(S.y * 0.45, q.y) * step(0.06, q.x) * step(q.x, S.x - 0.06);
    diffuseColor.rgb *= 1.0 - 0.5 * sl * fd - 0.12 * (1.0 - fd) * step(S.y * 0.45, q.y);
  } else if (face > 3.5) diffuseColor.rgb *= mix(0.9, 0.78 + 0.3 * abs(sin(q.x * 41.0)), fd);
  diffuseColor.rgb *= 0.82 + 0.25 * vnoise(q * 4.0 + bid + flr);
  if (st > 0.5 && st < 1.5) diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.36, 0.2, 0.12), smoothstep(0.5, 0.85, vnoise(q * vec2(6.0, 2.0) + bid)) * 0.6);
} else if (kind == 11.0 && vInfo.w > 1.5) {
  // the Yamen's grey brick, in courses with the joints staggered (INFERRED)
  float course = floor(vWall.y / 0.065);
  vec2 bq = vec2(vWall.x / 0.24 + 0.5 * mod(course, 2.0), vWall.y / 0.065);
  float joint = max(fcBars(bq.x, 0.05, fwW.x / 0.24), fcBars(bq.y, 0.15, fwW.y / 0.065));
  float fb = 1.0 - smoothstep(0.02, 0.05, fwW.y);
  diffuseColor.rgb *= (1.0 + 0.16 * fb * (hash12(floor(bq) + bid) - 0.5)) * (1.0 - 0.25 * joint);
  diffuseColor.rgb *= 0.85 + 0.2 * vnoise(vWall * vec2(0.6, 1.2) + bid);
} else if (kind == 17.0) {
  // Things in the cages (facades.js cageThings): pots, leaves, boxes.
  float tc = mod(floor(vInfo.w + 0.5), 10.0);
  if (tc > 0.5 && tc < 2.5) {
    float n = vnoise(vWall * 26.0 + bid + floor(vInfo.w / 10.0));
    diffuseColor.rgb *= 0.55 + 0.75 * n;
    // flowers on some plants
    if (hash12(vec2(floor(vInfo.w / 10.0), 4.0)) > 0.7 && vnoise(vWall * 40.0 + 2.0) > 0.78) diffuseColor.rgb = hash12(vec2(floor(vInfo.w / 10.0), 6.0)) > 0.5 ? vec3(0.8, 0.2, 0.18) : vec3(0.85, 0.7, 0.2);
    CUTOUT(facadeCover(kind, vInfo, vWall, vWN, fwW));
  } else diffuseColor.rgb *= 0.85 + 0.2 * hash12(floor(vWall * 10.0) + bid);
} else if (kind == 18.0) {
  // A pipe or a bundle of pipes (facades.js emitPipe): round, with clips, stained.
  float c = floor(vInfo.w + 0.5), dia = floor(c / 10.0) / 100.0;
  float lx = fract(vWall.x / (dia * 1.25)) * 1.25 - 0.125, a = clamp(abs(2.0 * lx - 1.0), 0.0, 1.0);
  float fp = 1.0 - smoothstep(0.3 * dia, 0.8 * dia, fwW.x);
  diffuseColor.rgb *= mix(0.8, 0.45 + 0.7 * sqrt(1.0 - a * a), fp);
  diffuseColor.rgb *= 0.8 + 0.3 * vnoise(vec2(vWall.x * 3.0, vWall.y * 0.7) + bid);
  if (fract(vWall.y / 1.6) < 0.045) diffuseColor.rgb *= 0.6;
  CUTOUT(facadeCover(kind, vInfo, vWall, vWN, fwW));
} else if (kind == 19.0) {
  // A stain of drips: u 0-1 across, v metres down from the unit; w its length, + 4 times the
  // storey of the unit (a stain that runs past the slab line is in two storeys, facades.js).
  float sl = mod(vInfo.w, 4.0), sf = floor(vInfo.w / 4.0);
  float n = vnoise(vec2(vWall.x * 7.0, vWall.y * 1.5) + bid + sf);
  float a = smoothstep(0.5, 0.2, abs(vWall.x - 0.5)) * (1.0 - smoothstep(0.1, sl, vWall.y)) * (0.35 + 0.65 * n);
  CUTOUT(a * 0.75);
} else if (kind == 13.0) {
  // A stair: mosaic treads with a dark nosing, plain risers, whitewashed stringers (p165).
  float sc = vInfo.w;
  if (sc < 0.5) {
    diffuseColor.rgb *= 0.8 + 0.3 * hash12(floor(vWall * 22.0) + bid);
    if (vWall.y < 0.045) diffuseColor.rgb *= vec3(0.5, 0.46, 0.4);
  } else if (sc < 1.5) {
    diffuseColor.rgb *= (0.85 + 0.15 * hash12(floor(vWall * 12.0))) * (0.75 + 0.25 * smoothstep(0.0, 0.17, vWall.y));
  } else {
    diffuseColor.rgb *= 0.82 + 0.18 * hash12(floor(vWall * vec2(2.0, 5.0)) + bid);
  }
  glow += diffuseColor.rgb * (0.05 + 0.3 * uNight);
} else if (kind == 14.0) {
  // the wall of a stair well, darker low down
  diffuseColor.rgb *= (0.55 + 0.45 * smoothstep(0.0, 2.5, vWall.y)) * (0.85 + 0.15 * hash12(floor(vWall * vec2(1.5, 3.0)) + bid));
  glow += diffuseColor.rgb * (0.03 + 0.2 * uNight);
} else if (kind == 15.0) {
  // Furniture and machines (interiors.js); vInfo.w picks the surface.
  float fc = vInfo.w;
  vec2 q = vWall;
  float n = hash12(floor(q * 9.0) + bid);
  if (fc < 0.5) diffuseColor.rgb *= 0.92 + 0.1 * n;
  else if (fc < 1.5) diffuseColor.rgb *= 0.86 + 0.18 * hash12(vec2(floor((q.x + q.y * 0.15) * 16.0), bid));
  else if (fc < 2.5) {
    vec2 g = q * 8.0;
    float h = hash12(vec2(bid, flr));
    diffuseColor.rgb *= h < 0.5 ? mix(0.78, 1.1, mod(floor(g.x) + floor(g.y), 2.0)) : 0.88 + 0.25 * step(0.82, hash12(floor(g)));
  } else if (fc < 3.5) {
    // a television: on in the evening in some flats
    float on = step(0.35, hash12(vec2(bid, flr + floor(q.x)))) * step(17.5, uHour) * step(uHour, 23.5);
    vec3 tvC = vec3(0.35, 0.5, 0.8) * (0.75 + 0.25 * sin(uHour * 700.0 + bid));
    diffuseColor.rgb = mix(vec3(0.03, 0.035, 0.04), tvC * 0.5, on);
    glow += tvC * on * 0.9;
  } else if (fc < 4.5) glow += vec3(0.9, 0.08, 0.04) * (0.5 + 0.7 * uNight);
  else if (fc < 5.5) diffuseColor.rgb *= 0.95 + 0.15 * n;
  else if (fc < 6.5) {
    // a wall of drawers, with brass knobs (p228)
    vec2 g = vec2(q.x * 4.0, q.y * 5.0), fg = fract(g);
    diffuseColor.rgb *= 1.0 - 0.45 * clamp(step(fg.x, 0.06) + step(fg.y, 0.08), 0.0, 1.0);
    if (length(fg - vec2(0.5, 0.55)) < 0.08) diffuseColor.rgb = vec3(0.55, 0.42, 0.12);
  } else if (fc < 7.5) {
    // shelves of goods
    vec2 g = vec2(q.x * 7.0, q.y * 3.2), cl = floor(g);
    float h = hash12(cl + bid);
    vec3 gc = h < 0.2 ? vec3(0.55, 0.06, 0.04) : h < 0.4 ? vec3(0.7, 0.55, 0.08) : h < 0.55 ? vec3(0.08, 0.25, 0.5) : h < 0.7 ? vec3(0.75, 0.72, 0.65) : h < 0.85 ? vec3(0.12, 0.35, 0.12) : vec3(0.45, 0.3, 0.16);
    diffuseColor.rgb = mix(gc * (0.7 + 0.3 * hash12(cl + 3.0)), diffuseColor.rgb, step(fract(g.y), 0.14));
  } else if (fc < 8.5) {
    // fresh noodles hung on the racks (p171)
    float st = step(0.4, fract(q.x * 28.0 + hash12(vec2(floor(q.x * 28.0), 1.0))));
    diffuseColor.rgb *= 0.72 + 0.32 * st;
  } else if (fc < 9.5) glow += vec3(0.22, 0.28, 0.28) * (0.15 + 0.6 * uNight);
  else if (fc < 10.5) diffuseColor.rgb *= 0.85 + 0.15 * step(0.5, fract(q.y * 20.0));
  else if (fc < 11.5) diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.7), 0.6 * step(0.93, hash12(floor(q * vec2(30.0, 12.0)) + bid)));
  glow += diffuseColor.rgb * (0.04 + 0.35 * uNight);
} else if (kind == 16.0) {
  // The inside walls: whitewash, a dark skirting, grime low down, and now and then a
  // calendar or a poster.
  float v = vWall.y, u = vWall.x;
  diffuseColor.rgb *= 0.9 + 0.1 * hash12(floor(vec2(u * 1.5, v * 3.0)) + bid);
  if (v < 0.1) diffuseColor.rgb *= 0.5;
  else diffuseColor.rgb *= 0.78 + 0.22 * smoothstep(0.1, 1.0, v);
  float pc = floor(u / 1.7), ph = hash12(vec2(pc, bid + flr)), px = fract(u / 1.7);
  if (ph > 0.72 && px > 0.35 && px < 0.62 && v > 0.6) diffuseColor.rgb = ph > 0.9 ? vec3(0.55, 0.05, 0.04) : ph > 0.81 ? vec3(0.78, 0.76, 0.68) : vec3(0.7, 0.5, 0.12);
  glow += diffuseColor.rgb * (0.04 + 0.3 * uNight);
} else if (kind == 9.0) {
  glow += diffuseColor.rgb * 0.6 * uNight;
} else if (kind == 10.0) {
  glow += TUBE;
}
// On the cut storey at night, each room is lit by its own lamp (lamps.js) while someone in it
// is awake, and is dim when all sleep. A television, a shrine lamp or a glass case keeps its
// own light.
if (uIsCut > 0.5 && (kind == 15.0 || kind == 16.0 || (kind == 1.0 && vInfo.w > 3.5))) {
  float fc = vInfo.w;
  bool own = kind == 15.0 && ((fc > 2.5 && fc < 4.5) || (fc > 8.5 && fc < 9.5));
  if (!own) {
    vec3 lamp = min(texture2D(uLampMap, (vXZ - uLampBox.xy) * uLampBox.zw).rgb, vec3(1.0));
    glow = glow * mix(1.0, 0.3, uNight) + diffuseColor.rgb * lamp * (0.7 * uNight);
  }
}
if (bid >= 0.0 && abs(bid - uHint) < 0.5) {
  // the tower of a hint of the game (game.js)
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.95, 0.72, 0.25), 0.35);
  glow += vec3(0.22, 0.15, 0.03);
}
if (bid >= 0.0 && abs(bid - uHi) < 0.5) {
  diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.95, 0.45, 0.28), 0.5);
  glow += vec3(0.2, 0.07, 0.02);
}
`;

// Both passes of a storey see the facade uv (vWall), aInfo, the normal (vWN, in world space:
// the storeys are only moved, never turned), the plan point (vXZ, for the lamps) and the
// height before the lift (vRestY, for the section).
const VERT_PARS = /* glsl */ `attribute vec2 aWall; attribute vec4 aInfo;
varying vec2 vWall; varying vec4 vInfo; varying vec3 vWN; varying vec2 vXZ; varying float vRestY;`;
const VERT_MAIN = /* glsl */ `vWall = aWall; vInfo = aInfo; vWN = normal; vXZ = position.xz; vRestY = position.y;`;

// The shadow pass of a storey: it drops what the colour pass drops for the section, so the
// cut walls do not shade the rooms. Where the colour pass cuts out bars, leaves and pipes,
// it keeps a share of the texels as large as their cover, so cages cast barred shadows.
// Stains cast none.
export function makeBuildingDepth(m, shared) {
  const d = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide });
  d.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, { uCutTop: shared.uCutTop, uIsCut: m.userData.uIsCut });
    s.vertexShader = s.vertexShader
      .replace('#include <common>', `#include <common>
${VERT_PARS}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
${VERT_MAIN}`);
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>
uniform float uIsCut; uniform float uCutTop; varying vec2 vWall; varying vec4 vInfo; varying vec3 vWN; varying float vRestY;
${FACADE_GLSL}`)
      .replace('void main() {', `void main() {
  float kind = vInfo.z;
  ${SECTION}
  if (kind == 19.0) discard;
  if (shadowCover(kind, vInfo, vWall) < 0.5) discard;`);
  };
  d.customProgramCacheKey = () => 'kwc-building-depth';
  return d;
}

// The material of a storey. A surface cut out in places (CUTOUT(cover)) is dropped where a
// dither says so: the opaque mesh holds few of them (the bird cages on the roofs). The
// see-through mesh uses makeCutoutMaterial.
function buildingMaterial(shared, uIsCut, a2c) {
  const m = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, alphaToCoverage: a2c });
  m.userData.uIsCut = uIsCut;
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, shared, { uIsCut });
    s.vertexShader = s.vertexShader
      .replace('#include <common>', `#include <common>
${VERT_PARS}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
${VERT_MAIN}`);
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>
uniform float uHour; uniform float uNight; uniform float uHi; uniform float uHint; uniform float uIsCut; uniform float uCutTop;
uniform sampler2D uLampMap; uniform vec4 uLampBox;
varying vec2 vWall; varying vec4 vInfo; varying vec3 vWN; varying vec2 vXZ; varying float vRestY;
${FACADE_GLSL}
${a2c ? '#define CUTOUT(c) diffuseColor.a = (c); if (diffuseColor.a < 0.01) discard;' : '#define CUTOUT(c) if ((c) <= fcIgn(gl_FragCoord.xy)) discard;'}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
${FRAG}`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
totalEmissiveRadiance += glow;`);
  };
  m.customProgramCacheKey = () => (a2c ? 'kwc-building-a2c' : 'kwc-building');
  return m;
}

export function makeBuildingMaterial(shared) {
  return buildingMaterial(shared, { value: 0 }, false);
}

// The see-through mesh of a storey (levels[k].cutout): bars, leaves and pipes give their
// cover of each pixel as alpha, and the multisampled frame turns it into a share of the
// samples, so thin bars stay smooth. It shares the cut of the storey's material m.
export function makeCutoutMaterial(m, shared) {
  return buildingMaterial(shared, m.userData.uIsCut, true);
}
