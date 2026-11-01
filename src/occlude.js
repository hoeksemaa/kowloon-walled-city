// The real buildings that hide the City: env.js draws each of them as a faint ghost. A click
// goes through a ghost to the City (main.js). No three.js here, so that
// tools/check_context.mjs can test it in node.
//
// The camera is orthographic, thus all the rays of the view are parallel, along the view
// direction d. The camera always looks down (controls.maxPolarAngle is under 90°), at an angle
// e over the horizon. The ray from a point of the City back to the camera goes up tan(e) metres
// for each metre across. The test pushes the outline of a building of height h along the
// ground, away from the camera, by up to h / tan(e). The building hides a part of the City
// exactly when this pushed outline touches the City outline (site.polygon). The building then
// hides at least the foot of the City wall there, at y = 0. A point higher on the City is
// hidden only if the foot below it is hidden too. The City always stands on the ground, thus
// its height does not change the result. The result is the same in the normal view, with a cut
// storey, and in the layered view: there G/F stays on the ground and the storeys above it go
// up. The zoom, the pan and the lift of the layered view do not change it either: only the
// view direction does. Thus main.js runs the test only when the view direction changes.
//
// The test is in the plan, in the frame of the view: w along the ground direction of the view,
// v across it. A ray along the ground leaves the building through an edge that faces away from
// the camera. It comes into the City through an edge that faces the camera. For two such
// edges, over the span of v that both cover, the gap g(v) = w(City edge) - w(building edge) is
// linear in v. The pushed building touches the City at that place if g has a value in
// [0, h / tan(e)] there.
import { inRing } from './context.js';

// A ring as flat lists of its points and of the outward normals of its edges (edge i runs from
// point i to point i + 1).
function edgesOf(ring) {
  const n = ring.length, x = new Float64Array(n), z = new Float64Array(n), nx = new Float64Array(n), nz = new Float64Array(n);
  const area = ring.reduce((s, p, i) => { const q = ring[(i + 1) % n]; return s + p[0] * q[1] - q[0] * p[1]; }, 0);
  const sign = area > 0 ? 1 : -1;
  for (let i = 0; i < n; i++) {
    const [px, pz] = ring[i], [qx, qz] = ring[(i + 1) % n];
    x[i] = px; z[i] = pz;
    nx[i] = sign * (qz - pz); nz[i] = -sign * (qx - px);
  }
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (let i = 0; i < n; i++) { x0 = Math.min(x0, x[i]); x1 = Math.max(x1, x[i]); z0 = Math.min(z0, z[i]); z1 = Math.max(z1, z[i]); }
  return { n, x, z, nx, nz, ring, lo: [x0, z0], hi: [x1, z1] };
}

export class Occlusion {
  // prisms: buildingPrisms (context.js), null for a building that is not drawn. outline: the
  // City outline, [x, z] in plan metres.
  constructor(prisms, outline) {
    this.n = prisms.length;
    this.bld = prisms.map((p) => p && { ...edgesOf(p.ring), h: p.h });
    this.city = edgesOf(outline);
    this.hide = new Uint8Array(this.n); // 1: the building hides a part of the City
    // The City edges that face the camera, in the frame of the view: v0, w0, v1, w1 (v0 <= v1).
    this.front = new Float64Array(4 * this.city.n);
  }

  // Which buildings hide a part of the City in a view along (dx, dy, dz): 1 in this.hide.
  // Returns their number.
  test(dx, dy, dz) {
    const hide = this.hide.fill(0), hl = Math.hypot(dx, dz);
    if (dy >= 0 || hl < 1e-6) return 0;
    const ux = dx / hl, uz = dz / hl, k = -dy / hl; // k: tan(e)
    const V = (x, z) => ux * z - uz * x, W = (x, z) => ux * x + uz * z;
    const C = this.city, F = this.front;
    let nf = 0, cv0 = Infinity, cv1 = -Infinity, cw0 = Infinity, cw1 = -Infinity;
    for (let i = 0; i < C.n; i++) {
      const v = V(C.x[i], C.z[i]), w = W(C.x[i], C.z[i]);
      cv0 = Math.min(cv0, v); cv1 = Math.max(cv1, v); cw0 = Math.min(cw0, w); cw1 = Math.max(cw1, w);
      if (C.nx[i] * ux + C.nz[i] * uz >= 0) continue;
      const j = (i + 1) % C.n, vj = V(C.x[j], C.z[j]), wj = W(C.x[j], C.z[j]);
      if (v <= vj) { F[nf] = v; F[nf + 1] = w; F[nf + 2] = vj; F[nf + 3] = wj; }
      else { F[nf] = vj; F[nf + 1] = wj; F[nf + 2] = v; F[nf + 3] = w; }
      nf += 4;
    }
    let count = 0;
    for (let b = 0; b < this.n; b++) {
      const B = this.bld[b];
      if (!B) continue;
      const L = B.h / k;
      let bv0 = Infinity, bv1 = -Infinity, bw0 = Infinity, bw1 = -Infinity;
      for (let i = 0; i < B.n; i++) {
        const v = V(B.x[i], B.z[i]), w = W(B.x[i], B.z[i]);
        bv0 = Math.min(bv0, v); bv1 = Math.max(bv1, v); bw0 = Math.min(bw0, w); bw1 = Math.max(bw1, w);
      }
      if (bv1 < cv0 || bv0 > cv1 || bw0 > cw1 || bw1 + L < cw0) continue;
      let hit = false;
      for (let i = 0; i < B.n && !hit; i++) {
        if (B.nx[i] * ux + B.nz[i] * uz <= 0) continue;
        const j = (i + 1) % B.n;
        let va = V(B.x[i], B.z[i]), wa = W(B.x[i], B.z[i]), vb = V(B.x[j], B.z[j]), wb = W(B.x[j], B.z[j]);
        if (va > vb) [va, wa, vb, wb] = [vb, wb, va, wa];
        const sb = vb - va > 1e-9 ? (wb - wa) / (vb - va) : 0;
        for (let f = 0; f < nf; f += 4) {
          const lo = Math.max(va, F[f]), hi = Math.min(vb, F[f + 2]);
          if (lo > hi) continue;
          const sc = F[f + 2] - F[f] > 1e-9 ? (F[f + 3] - F[f + 1]) / (F[f + 2] - F[f]) : 0;
          const g0 = F[f + 1] + sc * (lo - F[f]) - (wa + sb * (lo - va));
          const g1 = F[f + 1] + sc * (hi - F[f]) - (wa + sb * (hi - va));
          if (Math.max(g0, g1) >= 0 && Math.min(g0, g1) <= L) { hit = true; break; }
        }
      }
      if (hit) { hide[b] = 1; count++; }
    }
    return count;
  }

  // The distance along the ray from o in the direction d (a unit vector, {x, y, z}) to the
  // first building that it meets, or Infinity. solid(b) is false for a building that the ray
  // goes through (a ghost).
  hit(o, d, solid) {
    let best = Infinity;
    for (let b = 0; b < this.n; b++) if (this.bld[b] && solid(b)) best = this.hitOne(b, o, d, best);
    return best;
  }

  // The distance along the ray (o, d) to building b, if it is less than best; else best.
  hitOne(b, o, d, best = Infinity) {
    const B = this.bld[b];
    // the box of the building first
    let t0 = 0, t1 = best;
    for (const [p, q, lo, hi] of [[o.x, d.x, B.lo[0], B.hi[0]], [o.y, d.y, 0, B.h], [o.z, d.z, B.lo[1], B.hi[1]]]) {
      if (Math.abs(q) < 1e-12) { if (p < lo || p > hi) return best; continue; }
      const ta = (lo - p) / q, tb = (hi - p) / q;
      t0 = Math.max(t0, Math.min(ta, tb)); t1 = Math.min(t1, Math.max(ta, tb));
      if (t0 > t1) return best;
    }
    // the roof
    if (d.y < 0) {
      const t = (B.h - o.y) / d.y;
      if (t >= 0 && t < best && inRing(o.x + d.x * t, o.z + d.z * t, B.ring)) best = t;
    }
    // the walls
    for (let i = 0; i < B.n; i++) {
      const j = (i + 1) % B.n, ex = B.x[j] - B.x[i], ez = B.z[j] - B.z[i];
      const den = d.x * ez - d.z * ex;
      if (Math.abs(den) < 1e-12) continue;
      const ax = B.x[i] - o.x, az = B.z[i] - o.z;
      const t = (ax * ez - az * ex) / den, s = (ax * d.z - az * d.x) / den;
      if (s < 0 || s > 1 || t < 0 || t >= best) continue;
      const y = o.y + d.y * t;
      if (y >= 0 && y <= B.h) best = t;
    }
    return best;
  }
}
