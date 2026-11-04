// Plan geometry for the 3D structure: rings of [x, z] points, frames, rasters and offsets.
// A ring from footprint.js has the region on the right of each edge (x right, z down), thus an
// outer ring has a positive signed area and a hole a negative one.
import { pointInPolygon } from '../util.js';

export function signedArea(P) {
  let s = 0;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) s += P[j][0] * P[i][1] - P[i][0] * P[j][1];
  return s / 2;
}

// Even-odd test over all rings (each a list of points).
export function inRings(rings, x, z) {
  let n = 0;
  for (const r of rings) if (pointInPolygon(x, z, r)) n++;
  return n % 2 === 1;
}

// Distance from (x, z) to the segment a-b.
export function segDist(x, z, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz;
  let t = l2 > 0 ? ((x - a[0]) * dx + (z - a[1]) * dz) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz);
}

export function ringsDist(rings, x, z) {
  let d = Infinity;
  for (const r of rings) for (let i = 0; i < r.length; i++) d = Math.min(d, segDist(x, z, r[i], r[(i + 1) % r.length]));
  return d;
}

// The rings of a set of footprint regions, as one region: the edges between two of the regions
// drop out, and the rest join into loops. footprint.js gives the two sides of a shared edge the
// same points, thus the ends meet exactly. regions: Map id -> rings (with edges).
export function unionRings(regions, ids) {
  const set = new Set(ids), out = [];
  const key = (p) => `${p[0].toFixed(4)},${p[1].toFixed(4)}`;
  const from = new Map();
  for (const id of ids)
    for (const r of regions.get(id) || [])
      for (const e of r.edges) {
        if (set.has(e.other)) continue;
        const k = key(e.a);
        if (!from.has(k)) from.set(k, []);
        from.get(k).push(e);
      }
  const used = new Set();
  for (const list of from.values())
    for (const e0 of list) {
      if (used.has(e0)) continue;
      const edges = [];
      let e = e0;
      for (let guard = 0; guard < 10000 && e && !used.has(e); guard++) {
        used.add(e);
        edges.push(e);
        const next = (from.get(key(e.b)) || []).filter((q) => !used.has(q));
        if (!next.length) break;
        if (next.length === 1) { e = next[0]; continue; }
        // At a pinch, turn toward the region (the right), as footprint.js does.
        const dx = e.b[0] - e.a[0], dz = e.b[1] - e.a[1];
        e = next.reduce((p, q) => {
          const cr = (n) => dx * (n.b[1] - n.a[1]) - dz * (n.b[0] - n.a[0]);
          return cr(q) > cr(p) ? q : p;
        });
      }
      if (edges.length >= 3) out.push({ pts: edges.map((q) => q.a), edges, hole: signedArea(edges.map((q) => q.a)) < 0 });
    }
  return out;
}

// A ring with some edges moved out by off[i] metres (0: the edge stays). Each corner is the
// meet of the two lines; where the lines are nearly parallel, the corner moves with its edge.
// The normal of edge a -> b that points out of the region (on its left) is [dz, -dx] / l.
export function offsetRing(pts, off) {
  const n = pts.length, lines = [];
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1e-9;
    const nx = dz / l, nz = -dx / l, o = off[i] || 0;
    lines.push({ p: [a[0] + nx * o, a[1] + nz * o], d: [dx / l, dz / l], n: [nx, nz], o });
  }
  const out = [];
  for (let i = 0; i < n; i++) {
    const A = lines[(i + n - 1) % n], B = lines[i];
    const den = A.d[0] * B.d[1] - A.d[1] * B.d[0];
    const P = pts[i];
    if (Math.abs(den) < 0.08) {
      const o = Math.max(A.o, B.o), nn = A.o >= B.o ? A.n : B.n;
      out.push([P[0] + nn[0] * o, P[1] + nn[1] * o]);
      continue;
    }
    const t = ((B.p[0] - A.p[0]) * B.d[1] - (B.p[1] - A.p[1]) * B.d[0]) / den;
    let q = [A.p[0] + A.d[0] * t, A.p[1] + A.d[1] * t];
    // A sharp corner: keep the mitre within 3 times the offset.
    const lim = 3 * Math.max(Math.abs(A.o), Math.abs(B.o), 0.05), dq = Math.hypot(q[0] - P[0], q[1] - P[1]);
    if (dq > lim) q = [P[0] + ((q[0] - P[0]) * lim) / dq, P[1] + ((q[1] - P[1]) * lim) / dq];
    out.push(q);
  }
  return out;
}

// A frame for a building: a along its long side, w across it (frameOf in floorplan.js gives the
// box). toXZ and toAW turn points between the plan and the frame.
export const toXZ = (F, a, w) => [F.ux * a + F.px * w, F.uz * a + F.pz * w];
export const toAW = (F, x, z) => [x * F.ux + z * F.uz, x * F.px + z * F.pz];

// A raster of a region in its frame, with cells of G metres. inside[c] = 1 for a cell whose
// middle is in the rings and at least `inset` metres from every edge of them.
export class Raster {
  constructor(F, rings, G = 0.25, inset = 0) {
    this.F = F; this.G = G;
    let a0 = Infinity, a1 = -Infinity, w0 = Infinity, w1 = -Infinity;
    for (const r of rings) for (const [x, z] of r) {
      const [a, w] = toAW(F, x, z);
      a0 = Math.min(a0, a); a1 = Math.max(a1, a); w0 = Math.min(w0, w); w1 = Math.max(w1, w);
    }
    this.A0 = Math.floor(a0 / G) * G - G; this.W0 = Math.floor(w0 / G) * G - G;
    this.ni = Math.ceil((a1 - this.A0) / G) + 2; this.nj = Math.ceil((w1 - this.W0) / G) + 2;
    this.inside = new Uint8Array(this.ni * this.nj);
    this.count = 0;
    for (let j = 0; j < this.nj; j++)
      for (let i = 0; i < this.ni; i++) {
        const [x, z] = this.xz(i, j);
        if (inRings(rings, x, z) && (!inset || ringsDist(rings, x, z) >= inset)) { this.inside[j * this.ni + i] = 1; this.count++; }
      }
  }
  a(i) { return this.A0 + (i + 0.5) * this.G; }
  w(j) { return this.W0 + (j + 0.5) * this.G; }
  xz(i, j) { return toXZ(this.F, this.a(i), this.w(j)); }
  // The cell of frame point (a, w), or -1 outside the raster.
  cellAW(a, w) {
    const i = Math.floor((a - this.A0) / this.G), j = Math.floor((w - this.W0) / this.G);
    return i < 0 || j < 0 || i >= this.ni || j >= this.nj ? -1 : j * this.ni + i;
  }
  cellXZ(x, z) { const [a, w] = toAW(this.F, x, z); return this.cellAW(a, w); }
}

// The intervals of t where the line p + t * dir is inside the rings (even-odd).
export function clipLine(rings, p, dir) {
  const ts = [];
  for (const r of rings)
    for (let i = 0; i < r.length; i++) {
      const a = r[i], b = r[(i + 1) % r.length];
      const ex = b[0] - a[0], ez = b[1] - a[1];
      const den = dir[0] * ez - dir[1] * ex;
      if (Math.abs(den) < 1e-12) continue;
      const wx = a[0] - p[0], wz = a[1] - p[1];
      const t = (wx * ez - wz * ex) / den, u = (wx * dir[1] - wz * dir[0]) / den;
      if (u >= 0 && u < 1) ts.push(t);
    }
  ts.sort((x, y) => x - y);
  const out = [];
  for (let q = 0; q + 1 < ts.length; q += 2) out.push([ts[q], ts[q + 1]]);
  return out;
}
