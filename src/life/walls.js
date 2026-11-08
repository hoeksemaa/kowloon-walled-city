// The outer walls of the structure, for the things that hang outside them: the pipes and cables
// over the lanes (pipes.js), the cages and the laundry poles at the windows (facades.js). It
// answers one question: from a point of a wall, how far does the open air go along a direction,
// at a height? The 1 m plan of the lanes differs from the traced walls by up to a metre
// (src/city/model.js, openWidth), thus this file casts the ray at the walls themselves: the
// rings of each phase of each building, from the foot (or the slab of the phase) to its top.
// The structure is frozen: this file only reads it.
import { SLAB, PARAPET } from '../city/model.js';

const CELL = 2; // metres: the grid of the walls

export class Walls {
  constructor(S) {
    this.S = S;
    const L = S.L;
    this.x0 = L.x0 - 30; this.z0 = L.z0 - 30;
    this.nx = Math.ceil((L.W + 60) / CELL); this.nz = Math.ceil((L.D + 60) / CELL);
    this.grid = new Map();
    this.stamp = 0;
    let n = 0;
    for (const b of S.list) {
      const last = b.phases[b.phases.length - 1];
      for (const ph of b.phases) {
        const y0 = ph.k0 === 0 ? b.foot : b.y[ph.k0] - SLAB;
        const y1 = (b.y[ph.k1] ?? b.top) + (ph === last && b.parapet ? PARAPET : 0);
        for (const r of ph.rings)
          for (let i = 0; i < r.pts.length; i++) {
            const A = r.pts[i], B = r.pts[(i + 1) % r.pts.length];
            const e = { ax: A[0], az: A[1], bx: B[0], bz: B[1], y0, y1, b: b.id, seen: 0 };
            const i0 = this.ci(Math.min(A[0], B[0])), i1 = this.ci(Math.max(A[0], B[0]));
            const j0 = this.cj(Math.min(A[1], B[1])), j1 = this.cj(Math.max(A[1], B[1]));
            for (let i2 = i0; i2 <= i1; i2++) for (let j2 = j0; j2 <= j1; j2++) {
              const key = j2 * this.nx + i2;
              if (!this.grid.has(key)) this.grid.set(key, []);
              this.grid.get(key).push(e);
            }
            n++;
          }
      }
    }
    this.count = n;
  }

  ci(x) { return Math.max(0, Math.min(this.nx - 1, Math.floor((x - this.x0) / CELL))); }
  cj(z) { return Math.max(0, Math.min(this.nz - 1, Math.floor((z - this.z0) / CELL))); }

  // The distance along (dx, dz) (a unit vector) from (x, z) to the first wall that stands at
  // height y, up to maxD; Infinity if none. from: the distance to start at (past the wall the
  // ray leaves). Returns { t, b }.
  hit(x, z, dx, dz, y, maxD = 8, from = 0.03) {
    const stamp = ++this.stamp;
    let best = Infinity, bb = -1;
    const steps = Math.ceil(maxD / (CELL / 2)) + 1;
    for (let s = 0; s <= steps; s++) {
      const t = Math.min(maxD, (s * CELL) / 2);
      const key = this.cj(z + dz * t) * this.nx + this.ci(x + dx * t);
      const list = this.grid.get(key);
      if (!list) continue;
      for (const e of list) {
        if (e.seen === stamp) continue;
        e.seen = stamp;
        if (y < e.y0 || y > e.y1) continue;
        // the ray P + t D against the segment A + u (B - A)
        const ex = e.bx - e.ax, ez = e.bz - e.az, den = dx * ez - dz * ex;
        if (Math.abs(den) < 1e-9) continue;
        const wx = e.ax - x, wz = e.az - z;
        const tt = (wx * ez - wz * ex) / den, u = (wx * dz - wz * dx) / den;
        if (u < -1e-6 || u > 1 + 1e-6 || tt <= from || tt >= best) continue;
        best = tt; bb = e.b;
      }
      if (best <= t) break;
    }
    return { t: best <= maxD ? best : Infinity, b: bb };
  }

  // The floor of the lane (or the road) at (x, z): the y of the nearest lane node within r
  // cells, or null.
  laneY(x, z, r = 1) {
    const S = this.S, L = S.L, nodes = S.graph.nodes;
    const i0 = Math.floor(x - L.x0), j0 = Math.floor(z - L.z0);
    let best = null, bd = Infinity;
    for (let dj = -r; dj <= r; dj++)
      for (let di = -r; di <= r; di++) {
        const i = i0 + di, j = j0 + dj;
        if (i < 0 || j < 0 || i >= L.W || j >= L.D) continue;
        const v = S.laneNode[j * L.W + i];
        if (v < 0) continue;
        const d = di * di + dj * dj;
        if (d < bd) { bd = d; best = nodes[v].y; }
      }
    return best;
  }

  // Is (x, z) over a lane of the City (a lane cell inside the City)?
  inLane(x, z) {
    const L = this.S.L, i = Math.floor(x - L.x0), j = Math.floor(z - L.z0);
    if (i < 0 || j < 0 || i >= L.W || j >= L.D) return false;
    const k = j * L.W + i;
    return !!L.inside[k] && this.S.laneNode[k] >= 0;
  }
}
