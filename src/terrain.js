// The ground round the City: data/terrain.json (tools/terrain.py), heights in metres above
// Principal Datum (mPD) on a square lattice in the plan frame. h(x, z) is bilinear between the
// lattice points, thus the lanes, the buildings and the ground mesh all use one surface.
export class Terrain {
  constructor(t) {
    this.res = t.res; this.x0 = t.x0; this.z0 = t.z0; this.nx = t.nx; this.nz = t.nz;
    this.data = new Float32Array(t.nx * t.nz);
    t.h.forEach((row, j) => row.forEach((v, i) => { this.data[j * t.nx + i] = v / 10; }));
    this.spots = t.spots || [];
    this.reach = Math.min(-t.x0, t.x0 + (t.nx - 1) * t.res);
  }

  // The lattice value at column i, row j (clamped to the edge).
  at(i, j) {
    i = Math.max(0, Math.min(this.nx - 1, i));
    j = Math.max(0, Math.min(this.nz - 1, j));
    return this.data[j * this.nx + i];
  }

  // The ground at plan point (x, z).
  h(x, z) {
    const u = (x - this.x0) / this.res, v = (z - this.z0) / this.res;
    const i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j;
    const a = this.at(i, j), b = this.at(i + 1, j), c = this.at(i, j + 1), d = this.at(i + 1, j + 1);
    return a + (b - a) * fu + (c - a) * fv + (a - b - c + d) * fu * fv;
  }

  // The lowest and the highest ground on a ring of plan points (and the middle of each edge).
  range(ring) {
    let lo = Infinity, hi = -Infinity;
    for (let q = 0; q < ring.length; q++) {
      const [x, z] = ring[q], [x2, z2] = ring[(q + 1) % ring.length];
      for (const g of [this.h(x, z), this.h((x + x2) / 2, (z + z2) / 2)]) { lo = Math.min(lo, g); hi = Math.max(hi, g); }
    }
    return [lo, hi];
  }
}
