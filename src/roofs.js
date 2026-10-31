// The clutter of the roofs, beside the stair huts, tanks, sheds and aerials of cityMesh.js:
// plants in pots and in polystyrene boxes, stools, heaps of junk, pipes and bird cages.
//
// SOURCED: the roofs were gardens, play-grounds and stores, with pot plants, bird cages,
// chairs and junk among the aerials (City of Darkness Revisited, pp312-327). INFERRED: what
// stands on which roof, and where.
import * as THREE from 'three';
import { mulberry32 } from './util.js';
import { insideWithMargin } from './geom.js';
import { frameOf, toXZ } from './floorplan.js';
import { K } from './kinds.js';

const col = (hex) => new THREE.Color(hex);
const pal = (list) => list.map(col);
const C = {
  pot: pal(['#a65a3a', '#8a4a32', '#b9714a', '#6e6a62', '#2b62a8', '#c8352b']),
  leaf: pal(['#4f6b3a', '#5d7a42', '#3f5a32', '#6f8f5a', '#7d8f4a', '#35502e']),
  styro: pal(['#e8e6df', '#dcd9cf']),
  stool: pal(['#a8443a', '#3f6390', '#d9d4c4', '#4f7a5a', '#b89a4a']),
  junk: pal(['#7a4a32', '#8b8f8c', '#6b4a32', '#a07a50', '#5d6b4f', '#9a958b', '#4a4f4b', '#c9c4b5']),
  pipe: pal(['#3a3a38', '#6b7270', '#7a4a32', '#9aa0a3']),
  cage: pal(['#c9a23c', '#8a6844', '#e6e2d8']),
  soil: col('#5a4a38'), pole: col('#3a3a38'), block: col('#8f887f'),
};

// Clutter on the roof of block b at height ry. M: the builder of the top storey; info(kind):
// its aInfo.
export function roofClutter(M, L, b, ry, info) {
  const rng = mulberry32((b.id * 7717 + 3) | 0);
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  const F = frameOf(b), U = [F.ux, F.uz], P = [F.px, F.pz];
  const holes = b.cores.map((c) => [c.a0 - 0.5, c.a1 + 0.5, c.w0 - 0.5, c.w1 + 0.5]);
  const clear = (x, z, m) => {
    if (!insideWithMargin(b.rings, x, z, m)) return false;
    const a = x * F.ux + z * F.uz, w = x * F.px + z * F.pz;
    return !holes.some(([a0, a1, w0, w1]) => a > a0 && a < a1 && w > w0 && w < w1);
  };
  const spot = (m) => {
    for (let t = 0; t < 20; t++) {
      const c = b.cells[Math.floor(rng() * b.cells.length)];
      const x = L.x0 + (c % L.W) + rng(), z = L.z0 + Math.floor(c / L.W) + rng();
      if (clear(x, z, m)) return [x, z];
    }
    return null;
  };
  const prop = info(K.prop);
  // A box of size (l, w) along the frame, centred at p.
  const cube = (p, l, w, y0, y1, c, kind = prop) => M.obox([p[0] - U[0] * l / 2 - P[0] * w / 2, p[1] - U[1] * l / 2 - P[1] * w / 2], U, P, 0, l, 0, w, y0, y1, c, kind, true);
  // A shrub: a wide lower tuft and a narrow upper one.
  const plant = (x, z, y) => {
    const s = 0.12 + rng() * 0.1, h = 0.14 + rng() * 0.22;
    M.prism(x, z, s, y, y + h, 6, pick(C.leaf), prop);
    if (rng() < 0.7) M.prism(x + (rng() - 0.5) * 0.08, z + (rng() - 0.5) * 0.08, s * 0.6, y + h, y + h + 0.1 + rng() * 0.25, 5, pick(C.leaf), prop);
  };

  const n = Math.max(2, Math.min(18, Math.round(b.cells.length / 10)));
  for (let q = 0; q < n; q++) {
    const r = rng();
    if (r < 0.34) {
      // a row of pots along the frame
      const p = spot(0.4);
      if (!p) continue;
      const k = 2 + Math.floor(rng() * 4), d = rng() < 0.5 ? U : P;
      for (let i = 0; i < k; i++) {
        const x = p[0] + d[0] * i * 0.42, z = p[1] + d[1] * i * 0.42;
        if (!clear(x, z, 0.25)) break;
        const h = 0.22 + rng() * 0.15, rr = 0.12 + rng() * 0.06;
        M.prism(x, z, rr, ry, ry + h, 6, pick(C.pot), prop);
        plant(x, z, ry + h - 0.03);
      }
    } else if (r < 0.48) {
      // polystyrene fish boxes, planted
      const p = spot(0.5);
      if (!p) continue;
      const k = 1 + Math.floor(rng() * 3);
      for (let i = 0; i < k; i++) {
        const c = [p[0] + U[0] * i * 0.6, p[1] + U[1] * i * 0.6];
        if (!clear(c[0], c[1], 0.35)) break;
        cube(c, 0.56, 0.38, ry, ry + 0.28, pick(C.styro));
        cube(c, 0.5, 0.32, ry + 0.28, ry + 0.31, C.soil);
        plant(c[0], c[1], ry + 0.3);
      }
    } else if (r < 0.56) {
      // stools round a low table, or a few left about
      const p = spot(0.8);
      if (!p) continue;
      if (rng() < 0.5) cube(p, 0.6, 0.6, ry, ry + 0.45, pick(C.junk));
      const k = 2 + Math.floor(rng() * 3), sc = pick(C.stool);
      for (let i = 0; i < k; i++) {
        const a = (i / k) * Math.PI * 2 + rng(), x = p[0] + Math.cos(a) * 0.6, z = p[1] + Math.sin(a) * 0.6;
        if (clear(x, z, 0.15)) M.prism(x, z, 0.15, ry, ry + 0.42, 6, sc, prop);
      }
    } else if (r < 0.8) {
      // a heap of junk: boards, crates, a drum
      const p = spot(0.6);
      if (!p) continue;
      let y = ry;
      const k = 2 + Math.floor(rng() * 4);
      for (let i = 0; i < k; i++) {
        const l = 0.3 + rng() * 0.7, w = 0.25 + rng() * 0.5, h = 0.1 + rng() * 0.35;
        const c = [p[0] + (rng() - 0.5) * 0.5, p[1] + (rng() - 0.5) * 0.5];
        cube(c, l, w, y, y + h, pick(C.junk));
        y = rng() < 0.5 ? y + h : ry;
      }
      if (rng() < 0.4) M.prism(p[0] + 0.5 * U[0], p[1] + 0.5 * U[1], 0.28, ry, ry + 0.85, 8, pick(C.junk), prop);
    } else if (r < 0.92) {
      // a pipe run across the roof, on blocks
      const p = spot(0.3);
      if (!p) continue;
      const d = rng() < 0.5 ? U : P, l = 2 + rng() * 5, c = pick(C.pipe), y = ry + 0.12 + rng() * 0.2;
      let e = 0;
      while (e < l && clear(p[0] + d[0] * (e + 0.3), p[1] + d[1] * (e + 0.3), 0.15)) e += 0.3;
      if (e < 1) continue;
      const nn = [-d[1], d[0]];
      M.obox(p, d, nn, 0, e, -0.035, 0.035, y, y + 0.07, c, prop, true);
      for (let s = 0.4; s < e; s += 1.2) M.obox(p, d, nn, s, s + 0.12, -0.08, 0.08, ry, y, C.block, prop, true);
    } else {
      // a bird cage on a stand
      const p = spot(0.4);
      if (!p) continue;
      cube(p, 0.06, 0.06, ry, ry + 1.0, C.pole);
      cube(p, 0.38, 0.38, ry + 1.0, ry + 1.42, pick(C.cage), info(K.cage));
    }
  }
}
