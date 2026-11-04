// The 3D structure as triangles: walls with their thickness and their holes (doors, shop
// fronts, windows), floor slabs with the stair openings, partitions, stairs step by step,
// stair huts, parapets and bridges. No three.js here: the caller gives a triangulate
// function for the slabs (THREE.ShapeUtils in the browser), thus node can count the triangles.
//
// Each vertex carries info = (building, level, kind). A cut through a closed solid shows its
// inside faces; the viewer draws those dark, as a cut face.
import { FloatBuf } from '../util.js';
import { toXZ, toAW, inRings, segDist } from './poly.js';
import { G, OUT, FLIGHT, LANDING, CORR, UNIT, stairParts } from './plan.js';
import { WALL, SLAB, PARAPET, HUT, OPEN } from './model.js';
const PARAPET_T = 0.15; // the thickness of a roof parapet

export const KIND = { WALL: 0, SLAB: 1, PART: 2, STAIR: 3, FLOOR: 4, ROOF: 5, LINK: 6, HUT: 7 };
const KIND_NAMES = Object.keys(KIND);
export const kindName = (k) => KIND_NAMES[k] || '?';

const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
export function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [lin(((n >> 16) & 255) / 255), lin(((n >> 8) & 255) / 255), lin((n & 255) / 255)];
}
const mul = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

const C = {
  inner: rgb('#d9d2c3'), slab: rgb('#9c968b'), slabEdge: rgb('#7d776d'), part: rgb('#e3dccd'),
  stair: rgb('#8a8378'), landing: rgb('#a39c90'), hut: rgb('#b8b0a2'), parapet: rgb('#b3ab9d'),
  corr: rgb('#8f877b'), roof: rgb('#a8a297'), tile: rgb('#5b5750'), link: rgb('#6f5d4b'), wood: rgb('#7b6347'),
  unit: ['#c9b9a0', '#c2b49d', '#cdbfa8', '#bfae95', '#c6bba7', '#cab49a'].map(rgb),
};

class IntBuf {
  constructor(n = 1 << 16) { this.a = new Uint32Array(n); this.n = 0; }
  push(...v) {
    if (this.n + v.length > this.a.length) { const b = new Uint32Array(Math.max(this.a.length * 2, this.n + v.length)); b.set(this.a); this.a = b; }
    for (const x of v) this.a[this.n++] = x;
  }
}
class Buf {
  constructor() { this.p = new FloatBuf(); this.n = new FloatBuf(); this.c = new FloatBuf(); this.f = new FloatBuf(); this.idx = new IntBuf(); this.nv = 0; }
  // A flat convex polygon of [x, y, z] corners, facing n.
  face(P, n, c, info) {
    let nx = 0, ny = 0, nz = 0;
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length];
      nx += (a[1] - b[1]) * (a[2] + b[2]); ny += (a[2] - b[2]) * (a[0] + b[0]); nz += (a[0] - b[0]) * (a[1] + b[1]);
    }
    const flip = nx * n[0] + ny * n[1] + nz * n[2] < 0, v = this.nv;
    for (const q of P) { this.p.p3(q[0], q[1], q[2]); this.n.p3(n[0], n[1], n[2]); this.c.p3(c[0], c[1], c[2]); this.f.p3(info[0], info[1], info[2]); }
    for (let i = 1; i + 1 < P.length; i++) if (flip) this.idx.push(v, v + i + 1, v + i); else this.idx.push(v, v + i, v + i + 1);
    this.nv += P.length;
  }
  // An upright prism on a plan quad q (4 [x, z] corners in order round it), from y0 to y1.
  // sides: which of the 4 sides to draw (side s runs from q[s] to q[s + 1]).
  prism(q, y0, y1, c, info, { sides = [1, 1, 1, 1], top = false, bottom = false, cIn = null, inSide = -1 } = {}) {
    let cx = 0, cz = 0;
    for (const p of q) { cx += p[0] / 4; cz += p[1] / 4; }
    for (let s = 0; s < 4; s++) {
      if (!sides[s]) continue;
      const a = q[s], b = q[(s + 1) % 4], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz);
      if (l < 1e-6) continue;
      let n = [dz / l, 0, -dx / l];
      if (n[0] * ((a[0] + b[0]) / 2 - cx) + n[2] * ((a[1] + b[1]) / 2 - cz) < 0) n = [-n[0], 0, -n[2]];
      this.face([[a[0], y0, a[1]], [b[0], y0, b[1]], [b[0], y1, b[1]], [a[0], y1, a[1]]], n, s === inSide && cIn ? cIn : c, info);
    }
    const P = (y) => q.map((p) => [p[0], y, p[1]]);
    if (top) this.face(P(y1), [0, 1, 0], c, info);
    if (bottom) this.face(P(y0), [0, -1, 0], c, info);
  }
  // A box in a building frame: a0..a1 along a, w0..w1 along w.
  fbox(F, a0, a1, w0, w1, y0, y1, c, info, top = true, bottom = true) {
    const q = [toXZ(F, a0, w0), toXZ(F, a1, w0), toXZ(F, a1, w1), toXZ(F, a0, w1)];
    this.prism(q, y0, y1, c, info, { top, bottom });
  }
  // A sloped slab between two plan points (a bridge): width w, thickness t.
  deck(P, Q, ya, yb, w, t, c, info) {
    const dx = Q[0] - P[0], dz = Q[1] - P[1], l = Math.hypot(dx, dz) || 1, nx = (-dz / l) * w / 2, nz = (dx / l) * w / 2;
    const A = [P[0] + nx, P[1] + nz], B = [Q[0] + nx, Q[1] + nz], Cc = [Q[0] - nx, Q[1] - nz], D = [P[0] - nx, P[1] - nz];
    const v = (p, y) => [p[0], y, p[1]];
    this.face([v(A, ya), v(B, yb), v(Cc, yb), v(D, ya)], [0, 1, 0], c, info);
    this.face([v(A, ya - t), v(B, yb - t), v(Cc, yb - t), v(D, ya - t)], [0, -1, 0], c, info);
    this.face([v(A, ya - t), v(B, yb - t), v(B, yb), v(A, ya)], [nx, 0, nz], c, info);
    this.face([v(D, ya - t), v(Cc, yb - t), v(Cc, yb), v(D, ya)], [-nx, 0, -nz], c, info);
  }
  arrays() {
    const idx = this.idx.a.subarray(0, this.idx.n);
    return { position: this.p.view().slice(), normal: this.n.view().slice(), color: this.c.view().slice(), info: this.f.view().slice(),
      index: this.nv > 65535 ? idx.slice() : Uint16Array.from(idx) };
  }
}

// Holes of a wall from t = 0 to len and y0 to y1: the solid pieces [t0, t1, ya, yb, top, bottom].
function pieces(len, y0, y1, holes) {
  const H = holes.map(([t0, t1, ya, yb]) => [Math.max(0, t0), Math.min(len, t1), Math.max(y0, ya), Math.min(y1, yb)]).filter((h) => h[1] - h[0] > 0.05 && h[3] - h[2] > 0.05);
  if (!H.length) return [[0, len, y0, y1, false, false]];
  const ts = [...new Set([0, len, ...H.flatMap((h) => [h[0], h[1]])])].sort((a, b) => a - b);
  const out = [];
  for (let q = 0; q + 1 < ts.length; q++) {
    const t0 = ts[q], t1 = ts[q + 1], m = (t0 + t1) / 2;
    const cut = H.filter((h) => h[0] <= m && h[1] >= m).sort((a, b) => a[2] - b[2]);
    let y = y0;
    for (const h of cut) {
      if (h[2] > y + 0.01) out.push([t0, t1, y, h[2], true, y > y0 + 0.01]);
      y = Math.max(y, h[3]);
    }
    if (y < y1 - 0.01) out.push([t0, t1, y, y1, false, y > y0 + 0.01]);
  }
  return out;
}

// The polygons of a set of rings ({ pts, hole }), each outer ring with the holes in it, and
// extra holes (stair openings) put in the ring that holds them.
function polys(rings, extra = []) {
  const outers = rings.filter((r) => !r.hole).map((r) => ({ outer: r.pts, holes: [] }));
  const pip = (p, ring) => inRings([ring], p[0], p[1]);
  for (const r of rings) if (r.hole) { const o = outers.find((o) => pip(r.pts[0], o.outer)); if (o) o.holes.push(r.pts); }
  for (const h of extra) { const m = h.reduce((s, p) => [s[0] + p[0] / h.length, s[1] + p[1] / h.length], [0, 0]); const o = outers.find((o) => pip(m, o.outer)); if (o) o.holes.push(h); }
  return outers;
}

// The opening in the slab over each stair: the flights and the half landing.
function stairHoles(b) {
  return b.stairs.map((st) => {
    const pa = stairParts(st), [a0, a1] = pa.flights;
    return [toXZ(b.F, a0, st.w0), toXZ(b.F, a1, st.w0), toXZ(b.F, a1, st.w1), toXZ(b.F, a0, st.w1)];
  });
}

// shell: the walls, slabs, roofs, huts and links of each building. inside(b, k): the floors
// whose inside (floor colours, partitions, stairs) to draw; the viewer asks for the floors that
// its cut shows, thus the mesh stays small.
// props: false leaves the ladders and stools out (buildProps draws them on their own).
export function buildMesh(S, { triangulate, only = null, shell = true, inside = null, props = true } = {}) {
  const out = new Buf();
  const openAt = new Map();
  for (const o of S.openings) { const key = `${o.b}:${o.k}`; if (!openAt.has(key)) openAt.set(key, []); openAt.get(key).push(o); }

  for (const b of S.list) {
    if (only && !only.has(b.id)) continue;
    const face = rgb(b.color || '#a79f96');
    const holesUp = stairHoles(b);
    if (shell) {

    // ---- slabs: one at each floor, and the roof ----
    const slab = (rings, y, k, holes, kind = KIND.SLAB) => {
      const info = [b.id, k, kind];
      for (const P of polys(rings, holes)) {
        const tri = triangulate(P.outer, P.holes);
        const pts = tri.pts;
        for (let q = 0; q < tri.idx.length; q += 3) {
          const A = pts[tri.idx[q]], B = pts[tri.idx[q + 1]], D = pts[tri.idx[q + 2]];
          out.face([[A[0], y, A[1]], [B[0], y, B[1]], [D[0], y, D[1]]], [0, 1, 0], kind === KIND.ROOF ? C.roof : C.slab, info);
          out.face([[A[0], y - SLAB, A[1]], [B[0], y - SLAB, B[1]], [D[0], y - SLAB, D[1]]], [0, -1, 0], C.slab, info);
        }
        for (const ring of [P.outer, ...P.holes])
          for (let i = 0; i < ring.length; i++) {
            const A = ring[i], B = ring[(i + 1) % ring.length], dx = B[0] - A[0], dz = B[1] - A[1], l = Math.hypot(dx, dz);
            if (l < 1e-6) continue;
            out.face([[A[0], y - SLAB, A[1]], [B[0], y - SLAB, B[1]], [B[0], y, B[1]], [A[0], y, A[1]]], [dz / l, 0, -dx / l], C.slabEdge, info);
          }
      }
    };
    const bigger = (p, q) => (p.area >= q.area ? p : q);
    for (let k = 0; k <= b.n; k++) {
      const ph = k === 0 ? b.phases[0] : k === b.n ? b.phaseOf(b.n - 1) : bigger(b.phaseOf(k - 1), b.phaseOf(k));
      slab(ph.rings, b.y[k], k, k > 0 && b.stairs.length && (k < b.n || b.roofOpen) ? holesUp : [], k === b.n ? KIND.ROOF : KIND.SLAB);
    }

    // ---- outer walls, level by level, with doors and windows ----
    for (let k = 0; k < b.n; k++) {
      const ph = b.phaseOf(k), plan = ph.plan, y = b.y[k];
      const ya = k === 0 ? b.foot : y, yb = b.y[k + 1] - SLAB;
      const ops = openAt.get(`${b.id}:${k}`) || [];
      const info = [b.id, k, KIND.WALL];
      ph.rings.forEach((r, ri) => {
        const inner = plan.inner[ri];
        for (let i = 0; i < r.pts.length; i++) {
          const A = r.pts[i], B = r.pts[(i + 1) % r.pts.length], dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz);
          if (len < 1e-3) continue;
          const tx = dx / len, tz = dz / len, nx = tz, nz = -tx; // n points out
          const IA = inner ? inner[i] : [A[0] - nx * WALL, A[1] - nz * WALL], IB = inner ? inner[(i + 1) % r.pts.length] : [B[0] - nx * WALL, B[1] - nz * WALL];
          const lab = r.other[i];
          const holes = ops.filter((o) => o.r === r && o.i === i).map((o) => [o.t - o.w / 2, o.t + o.w / 2, o.y0, o.y1]);
          // windows on a wall to the open air, from 1/F up
          let open = OPEN.has(lab);
          if (!open && lab >= 0 && !S.fills(lab, y + 0.3)) { const low = S.bOf(lab); open = low && low.top + (low.parapet ? PARAPET : 0) <= y + 0.9; }
          if (open && k > 0 && len >= 1.3) {
            const n = Math.max(1, Math.floor((len - 0.4) / 2.2)), w = Math.min(1.0, len - 0.5);
            for (let q = 0; q < n; q++) {
              const t = (len * (q + 0.5)) / n;
              if (holes.some((h) => h[0] < t + w / 2 + 0.2 && h[1] > t - w / 2 - 0.2)) continue;
              const head = Math.min(y + 2.1, yb - 0.15);
              if (head - (y + 0.9) > 0.5) holes.push([t - w / 2, t + w / 2, y + 0.9, head]);
            }
          }
          for (const [t0, t1, y0, y1, top, bottom] of pieces(len, ya, yb, holes)) {
            const O0 = [A[0] + tx * t0, A[1] + tz * t0], O1 = [A[0] + tx * t1, A[1] + tz * t1];
            const I0 = t0 <= 1e-6 ? IA : [O0[0] - nx * WALL, O0[1] - nz * WALL];
            const I1 = t1 >= len - 1e-6 ? IB : [O1[0] - nx * WALL, O1[1] - nz * WALL];
            out.prism([O0, O1, I1, I0], y0, y1, face, info, { sides: [1, t1 < len - 1e-6 ? 1 : 0, 1, t0 > 1e-6 ? 1 : 0], top, bottom, cIn: C.inner, inSide: 2 });
          }
        }
      });
    }

    // ---- parapets (b.parapet, about 20 % of the flat roofs): round the roof, and round the part of
    // a floor that a setback leaves open ----
    const parapet = (ring, y, skip) => {
      for (let i = 0; i < ring.pts.length; i++) {
        const A = ring.pts[i], B = ring.pts[(i + 1) % ring.pts.length], dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz);
        if (len < 0.2) continue;
        const tx = dx / len, tz = dz / len, nx = tz, nz = -tx;
        let t0 = null;
        const flush = (t1) => {
          if (t0 === null || t1 - t0 < 0.1) { t0 = null; return; }
          const O0 = [A[0] + tx * t0, A[1] + tz * t0], O1 = [A[0] + tx * t1, A[1] + tz * t1];
          out.prism([O0, O1, [O1[0] - nx * PARAPET_T, O1[1] - nz * PARAPET_T], [O0[0] - nx * PARAPET_T, O0[1] - nz * PARAPET_T]], y, y + PARAPET, C.parapet, [b.id, b.n, KIND.ROOF], { top: true });
          t0 = null;
        };
        for (let t = 0; t < len; t += 0.25) {
          const m = Math.min(len, t + 0.125), ok = !skip || !skip(A[0] + tx * m - nx * 0.4, A[1] + tz * m - nz * 0.4);
          if (ok && t0 === null) t0 = t;
          if (!ok) flush(t);
        }
        flush(len);
      }
    };
    if (b.pitched) hipRoof(out, b, b.phases[b.phases.length - 1].rings, b.top, triangulate);
    else if (b.kind !== 'yamen') {
      const top = b.phases[b.phases.length - 1];
      if (b.parapet) for (const r of top.rings) parapet(r, b.y[b.n], null);
      if (b.parapet && top.setback && b.phases.length > 1) {
        const below = b.phases[b.phases.length - 2];
        for (const r of below.rings) parapet(r, b.y[b.n - 1], (x, z) => inRings(top.rings.map((q) => q.pts), x, z));
      }
    } else {
      // A hall of the Yamen: a pitched roof of tiles over its frame box, where the hall fills 75 %
      // of it or more (all six halls; the west range of the front court fills 79.7 %).
      const F = b.F, boxArea = (F.a1 - F.a0) * (F.w1 - F.w0);
      if (b.area / boxArea >= 0.75) {
        const y = b.top, e = 0.35, ridge = y + Math.min(2.2, (F.w1 - F.w0) * 0.32), wm = (F.w0 + F.w1) / 2;
        const p = (a, w, yy) => { const [x, z] = toXZ(F, a, w); return [x, yy, z]; };
        const a0 = F.a0 - e, a1 = F.a1 + e, w0 = F.w0 - e, w1 = F.w1 + e, info = [b.id, b.n, KIND.ROOF];
        out.face([p(a0, w0, y), p(a1, w0, y), p(a1, wm, ridge), p(a0, wm, ridge)], [0, 1, 0], C.tile, info);
        out.face([p(a0, w1, y), p(a1, w1, y), p(a1, wm, ridge), p(a0, wm, ridge)], [0, 1, 0], C.tile, info);
        const [gx, gz] = [F.ux, F.uz];
        out.face([p(a0 + e, w0 + e, y), p(a0 + e, w1 - e, y), p(a0 + e, wm, ridge - 0.1)], [-gx, 0, -gz], face, info);
        out.face([p(a1 - e, w0 + e, y), p(a1 - e, w1 - e, y), p(a1 - e, wm, ridge - 0.1)], [gx, 0, gz], face, info);
      } else for (const r of b.phases[0].rings) parapet(r, b.top, null);
    }

    }
    // ---- inside: floor colours, partitions, stairs ----
    for (let k = 0; k < b.n; k++) {
      if (!inside || !inside(b.id, k)) continue;
      const ph = b.phaseOf(k), plan = ph.plan, { R, code } = plan, y = b.y[k], yb = b.y[k + 1] - SLAB;
      const { ni, nj } = R;
      // floor colours: rectangles of one code, grown greedily
      const used = new Uint8Array(code.length);
      const colOf = (v) => (v === CORR || v === LANDING ? C.corr : C.unit[(v * 7 + b.id) % C.unit.length]);
      for (let j = 0; j < nj; j++)
        for (let i = 0; i < ni; i++) {
          const c0 = j * ni + i, v = code[c0];
          if (used[c0] || v === OUT || v === FLIGHT || !R.inside[c0]) continue;
          let i1 = i;
          while (i1 + 1 < ni && !used[j * ni + i1 + 1] && code[j * ni + i1 + 1] === v) i1++;
          let j1 = j;
          for (;;) {
            if (j1 + 1 >= nj) break;
            let ok = true;
            for (let q = i; q <= i1 && ok; q++) if (used[(j1 + 1) * ni + q] || code[(j1 + 1) * ni + q] !== v) ok = false;
            if (!ok) break;
            j1++;
          }
          for (let jj = j; jj <= j1; jj++) for (let q = i; q <= i1; q++) used[jj * ni + q] = 1;
          const a0 = R.A0 + i * G, a1 = R.A0 + (i1 + 1) * G, w0 = R.W0 + j * G, w1 = R.W0 + (j1 + 1) * G;
          const P = [toXZ(b.F, a0, w0), toXZ(b.F, a1, w0), toXZ(b.F, a1, w1), toXZ(b.F, a0, w1)].map(([x, z]) => [x, y + 0.006, z]);
          out.face(P, [0, 1, 0], colOf(v), [b.id, k, KIND.FLOOR]);
        }
      // partitions: on each boundary between two codes that need a wall, in straight runs
      const need = (p, q) => {
        if (p === q) return false;
        const cp = p === CORR || p === LANDING || p === FLIGHT, cq = q === CORR || q === LANDING || q === FLIGHT;
        if (cp && cq) return (p === FLIGHT) !== (q === FLIGHT) && !(p === LANDING || q === LANDING);
        return true;
      };
      const gap = new Set(); // door cells on a line: `${axis}:${line}:${pos}`
      for (const d of plan.doors) for (let q = d.from; q < d.to; q++) gap.add(`${d.axis}:${d.line}:${q}`);
      const info = [b.id, k, KIND.PART];
      const wallRun = (axis, line, p0, p1, isDoor) => {
        // axis 'a': the line a = A0 + line G, from w(p0) to w(p1); axis 'w': the line w = ...
        const ext0 = 0.05, ext1 = 0.05, h = 0.05;
        const yy1 = isDoor ? yb : yb;
        if (axis === 'a') {
          const a = R.A0 + line * G, w0 = R.W0 + p0 * G - ext0, w1 = R.W0 + p1 * G + ext1;
          out.fbox(b.F, a - h, a + h, w0, w1, isDoor ? y + 2.0 : y, yy1, C.part, info, false, isDoor);
        } else {
          const w = R.W0 + line * G, a0 = R.A0 + p0 * G - ext0, a1 = R.A0 + p1 * G + ext1;
          out.fbox(b.F, a0, a1, w - h, w + h, isDoor ? y + 2.0 : y, yy1, C.part, info, false, isDoor);
        }
      };
      // lines across a (between i - 1 and i)
      for (let i = 1; i < ni; i++) {
        let run = -1, door = -1;
        for (let j = 0; j <= nj; j++) {
          const p = j < nj ? code[j * ni + i - 1] : 0, q = j < nj ? code[j * ni + i] : 0;
          const inside = j < nj && R.inside[j * ni + i - 1] && R.inside[j * ni + i];
          const isWall = inside && need(p, q);
          const isGap = isWall && gap.has(`a:${i}:${j}`);
          if (run >= 0 && (!isWall || isGap)) { wallRun('a', i, run, j); run = -1; }
          if (door >= 0 && !isGap) { wallRun('a', i, door, j, true); door = -1; }
          if (isWall && !isGap && run < 0) run = j;
          if (isGap && door < 0) door = j;
        }
      }
      for (let j = 1; j < nj; j++) {
        let run = -1, door = -1;
        for (let i = 0; i <= ni; i++) {
          const p = i < ni ? code[(j - 1) * ni + i] : 0, q = i < ni ? code[j * ni + i] : 0;
          const inside = i < ni && R.inside[(j - 1) * ni + i] && R.inside[j * ni + i];
          const isWall = inside && need(p, q);
          const isGap = isWall && gap.has(`w:${j}:${i}`);
          if (run >= 0 && (!isWall || isGap)) { wallRun('w', j, run, i); run = -1; }
          if (door >= 0 && !isGap) { wallRun('w', j, door, i, true); door = -1; }
          if (isWall && !isGap && run < 0) run = i;
          if (isGap && door < 0) door = i;
        }
      }
      // stairs
      for (const st of b.stairs) {
        if (k === b.n - 1 && !b.roofOpen) continue;
        const pa = stairParts(st), d = st.dir, h = b.h[k], T = st.tread;
        const nR = Math.ceil(h / st.rmax - 1e-9), r = h / nR;
        const sinfo = [b.id, k, KIND.STAIR];
        const tread = (aFrom, aTo, w0, w1, top) => out.fbox(b.F, Math.min(aFrom, aTo), Math.max(aFrom, aTo), w0, w1, top - r - 0.12, top, C.stair, sinfo);
        if (st.type === 'dogleg') {
          const n1 = Math.ceil(nR / 2), n2 = nR - n1, aL = pa.at(pa.LA), far = pa.at(pa.len);
          for (let j = 1; j < n1; j++) tread(aL + d * (j - 1) * T, aL + d * j * T, pa.lane1[0], pa.lane1[1], y + j * r);
          const yh = y + n1 * r;
          const hl = (a0, w0, w1) => out.fbox(b.F, Math.min(a0, far), Math.max(a0, far), w0, w1, yh - 0.15, yh, C.landing, sinfo);
          hl(aL + d * (n1 - 1) * T, pa.lane1[0], pa.lane1[1]);
          hl(aL + d * (n2 - 1) * T, pa.lane2[0], pa.lane2[1]);
          const wm0 = (st.w0 + st.w1) / 2;
          hl(aL + d * (n1 - 1) * T, wm0 - 0.06, wm0 + 0.06);
          for (let j = 1; j < n2; j++) tread(aL + d * (n2 - 1 - j) * T, aL + d * (n2 - j) * T, pa.lane2[0], pa.lane2[1], yh + j * r);
          // the wall between the two flights
          const wm = (st.w0 + st.w1) / 2, aEnd = aL + d * (Math.min(n1, n2) - 1) * T;
          if (Math.abs(aEnd - aL) > 0.2) out.fbox(b.F, Math.min(aL, aEnd), Math.max(aL, aEnd), wm - 0.05, wm + 0.05, y, yb, C.part, info, true, false);
        } else {
          // the flight ends at the top landing; a lower storey starts it later
          const aTop = pa.at(pa.len - pa.land);
          for (let j = 1; j < nR; j++) tread(aTop - d * (nR - j) * T, aTop - d * (nR - j - 1) * T, st.w0 + 0.05, st.w1 - 0.05, y + j * r);
        }
      }
    }

    // ---- stair huts ----
    if (shell && b.roofOpen && b.kind !== 'yamen')
      for (const st of b.stairs) {
        const y = b.top, F = b.F, t = 0.12, info = [b.id, b.n, KIND.HUT];
        const pa = stairParts(st);
        // the door: on the long side toward the corridor (or the middle of the roof), at the landing
        const side = st.side || (Math.abs(st.w1 - (F.w0 + F.w1) / 2) < Math.abs(st.w0 - (F.w0 + F.w1) / 2) ? 1 : -1);
        const land = st.type === 'dogleg' ? pa.landings[0] : pa.landings[1];
        const da = (land[0] + land[1]) / 2;
        const sides = [
          [st.a0, st.a1, st.w0, st.w0 + t, side < 0], [st.a0, st.a1, st.w1 - t, st.w1, side > 0],
          [st.a0, st.a0 + t, st.w0, st.w1, false], [st.a1 - t, st.a1, st.w0, st.w1, false],
        ];
        for (const [a0, a1, w0, w1, door] of sides) {
          if (!door) { out.fbox(F, a0, a1, w0, w1, y, y + HUT, C.hut, info, false, false); continue; }
          out.fbox(F, a0, da - 0.4, w0, w1, y, y + HUT, C.hut, info, false, false);
          out.fbox(F, da + 0.4, a1, w0, w1, y, y + HUT, C.hut, info, false, false);
          out.fbox(F, da - 0.4, da + 0.4, w0, w1, y + 2.0, y + HUT, C.hut, info, false, true);
        }
        out.fbox(F, st.a0 - 0.1, st.a1 + 0.1, st.w0 - 0.1, st.w1 + 0.1, y + HUT, y + HUT + 0.12, C.roof, info);
      }
    // ---- a roof room (model.js): four walls with a door toward the middle of the roof, a roof ----
    if (shell && b.roofRoom && b.roofOpen) {
      const R = b.roofRoom, y = b.top, F = b.F, t = 0.12, info = [b.id, b.n, KIND.HUT];
      const mid = (R.a0 + R.a1) / 2, ds = Math.abs(R.w1 - (F.w0 + F.w1) / 2) < Math.abs(R.w0 - (F.w0 + F.w1) / 2) ? 1 : -1;
      for (const [w0, w1, door] of [[R.w0, R.w0 + t, ds < 0], [R.w1 - t, R.w1, ds > 0]]) {
        if (!door) { out.fbox(F, R.a0, R.a1, w0, w1, y, y + HUT, C.hut, info, false, false); continue; }
        out.fbox(F, R.a0, mid - 0.4, w0, w1, y, y + HUT, C.hut, info, false, false);
        out.fbox(F, mid + 0.4, R.a1, w0, w1, y, y + HUT, C.hut, info, false, false);
        out.fbox(F, mid - 0.4, mid + 0.4, w0, w1, y + 2.0, y + HUT, C.hut, info, false, true);
      }
      out.fbox(F, R.a0, R.a0 + t, R.w0, R.w1, y, y + HUT, C.hut, info, false, false);
      out.fbox(F, R.a1 - t, R.a1, R.w0, R.w1, y, y + HUT, C.hut, info, false, false);
      out.fbox(F, R.a0 - 0.1, R.a1 + 0.1, R.w0 - 0.1, R.w1 + 0.1, y + HUT, y + HUT + 0.12, C.roof, info);
    }
  }

  // ---- links: steps at the doors to the lanes, bridges, ladders, stools ----
  for (const d of shell ? S.doors : []) {
    if (only && !only.has(d.b)) continue;
    const info = [d.b, d.k ?? 0, KIND.LINK];
    if ((d.kind === 'street' || d.kind === 'shop') && d.y - d.ground > 0.12) {
      const n = Math.max(1, Math.round((d.y - d.ground) / 0.16)), tx = -d.n[1], tz = d.n[0];
      for (let s = 1; s <= n; s++) {
        const o0 = (n - s) * 0.28, o1 = o0 + 0.28, y1 = d.ground + ((d.y - d.ground) * s) / n;
        const P = (t, o) => [d.x + tx * t + d.n[0] * o, d.z + tz * t + d.n[1] * o];
        out.prism([P(-d.w / 2, o0), P(d.w / 2, o0), P(d.w / 2, o1), P(-d.w / 2, o1)], d.ground - 0.3, y1, C.landing, info, { top: true });
      }
    }
    if (d.kind === 'bridge') {
      out.deck([d.x, d.z], [d.x2, d.z2], d.y, d.yc, 0.9, 0.15, C.link, info);
      const dx = d.x2 - d.x, dz = d.z2 - d.z, l = Math.hypot(dx, dz) || 1, nx = -dz / l, nz = dx / l;
      for (const s of [-1, 1]) {
        const o = s * 0.42;
        out.deck([d.x + nx * o, d.z + nz * o], [d.x2 + nx * o, d.z2 + nz * o], d.y + 1.0, d.yc + 1.0, 0.05, 1.0, C.link, info);
      }
    }
    if (props && d.stool) stool(out, d, info);
    if (props && d.kind === 'ladder') ladder(out, d, info, S);
  }
  return out.arrays();
}

// A hipped roof of tiles over a low building (fixes.storeys: roof "pitched"), on its own
// outline: the roof over a point is RISE times the distance from the point to the nearest
// outer wall, up to HIP_MAX. Thus a ridge runs along the middle, and a hip goes down to each
// corner. The outline is cut into cells of HIP_G m in the frame of the building.
const RISE = 0.55, HIP_MAX = 3.4, HIP_G = 0.25;
function hipRoof(out, b, rings, y, triangulate) {
  const F = b.F, info = [b.id, b.n, KIND.ROOF];
  const aw = rings.map((r) => r.pts.map(([x, z]) => toAW(F, x, z)));
  const segs = [];
  for (const r of aw) for (let i = 0; i < r.length; i++) segs.push([r[i], r[(i + 1) % r.length]]);
  const at = ([a, w]) => {
    let d = Infinity;
    for (const [p, q] of segs) d = Math.min(d, segDist(a, w, p, q));
    const [x, z] = toXZ(F, a, w);
    return [x, y + Math.min(HIP_MAX, RISE * d), z];
  };
  // the part of a ring in the cell [a0, a1] x [w0, w1] (Sutherland-Hodgman)
  const clip = (ring, a0, a1, w0, w1) => {
    let P = ring;
    for (const f of [(p) => p[0] - a0, (p) => a1 - p[0], (p) => p[1] - w0, (p) => w1 - p[1]]) {
      const Q = [];
      for (let i = 0; i < P.length; i++) {
        const p = P[i], q = P[(i + 1) % P.length], fp = f(p), fq = f(q);
        if (fp >= 0) Q.push(p);
        if (fp >= 0 !== fq >= 0) { const t = fp / (fp - fq); Q.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
      }
      if (Q.length < 3) return null;
      P = Q;
    }
    return P;
  };
  for (const ring of aw) {
    let a0 = Infinity, a1 = -Infinity, w0 = Infinity, w1 = -Infinity;
    for (const [a, w] of ring) { a0 = Math.min(a0, a); a1 = Math.max(a1, a); w0 = Math.min(w0, w); w1 = Math.max(w1, w); }
    for (let i = Math.floor(a0 / HIP_G); i * HIP_G < a1; i++)
      for (let j = Math.floor(w0 / HIP_G); j * HIP_G < w1; j++) {
        const P = clip(ring, i * HIP_G, (i + 1) * HIP_G, j * HIP_G, (j + 1) * HIP_G);
        if (!P) continue;
        const tri = triangulate(P, []);
        for (let q = 0; q < tri.idx.length; q += 3) {
          const A = at(tri.pts[tri.idx[q]]), B = at(tri.pts[tri.idx[q + 1]]), D = at(tri.pts[tri.idx[q + 2]]);
          const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], vx = D[0] - A[0], vy = D[1] - A[1], vz = D[2] - A[2];
          let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
          const l = Math.hypot(nx, ny, nz);
          if (l < 1e-9) continue;
          if (ny < 0) { nx = -nx; ny = -ny; nz = -nz; }
          out.face([A, B, D], [nx / l, ny / l, nz / l], C.tile, info);
        }
      }
  }
}

// A stool under a corridor window (links.js): a plain box.
function stool(out, d, info) {
  const { x, z, y, h } = d.stool;
  out.prism([[x - 0.2, z - 0.2], [x + 0.2, z - 0.2], [x + 0.2, z + 0.2], [x - 0.2, z + 0.2]], y, y + h, C.wood, info, { top: true });
}
// A ladder from roof to roof (links.js): a plain slab flat against the wall of the higher
// building, on the lower roof, from the lower roof to 1 m over the higher roof: the top of its
// parapet, or a handhold where it has none. A plank at its foot. d.n points out of the wall onto
// the lower roof; t runs along the wall. Where the lower roof has a parapet (0.15 m thick, along
// this wall too), the ladder stands against the parapet.
function ladder(out, d, info, S) {
  const hi = Math.max(d.y, d.yc), lo = Math.min(d.y, d.yc), [nx, nz] = d.n, tx = -nz, tz = nx;
  const g = S.list[d.c]?.parapet ? PARAPET_T : 0;
  const at = (t, o) => [d.x + tx * t + nx * (g + o), d.z + tz * t + nz * (g + o)];
  out.deck(at(0, 0.02), at(0, 0.42), lo + 0.02, lo + 0.02, 0.5, 0.02, C.wood, info);
  out.prism([at(-0.25, 0.05), at(0.25, 0.05), at(0.25, 0.1), at(-0.25, 0.1)], lo, hi + PARAPET, C.wood, info, { top: true });
}

// The ladders (kind 'ladder') or the stools (kind 'stool') only, as one mesh, and the top of
// each one (for a marker): { arrays, tops: [[x, y, z]] }.
export function buildProps(S, kind) {
  const out = new Buf(), tops = [];
  for (const d of S.doors) {
    const info = [d.b, d.k ?? 0, KIND.LINK];
    if (kind === 'stool' && d.stool) { stool(out, d, info); tops.push([d.stool.x, d.stool.y + d.stool.h, d.stool.z]); }
    if (kind === 'ladder' && d.kind === 'ladder') { ladder(out, d, info, S); tops.push([d.x + d.n[0] * 0.08, Math.max(d.y, d.yc) + PARAPET, d.z + d.n[1] * 0.08]); }
  }
  return { arrays: out.arrays(), tops };
}
