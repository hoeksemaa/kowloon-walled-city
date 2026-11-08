// Tubes and sheets as plain mesh arrays, for the pipes and cables of pipes.js: one set of
// arrays for each floor layer (src/cityLayers.js addLayer), in the form of buildMesh
// (position, normal, colour, info: building, layer, kind; index). The colours are linear rgb.

export class Arrays {
  constructor() { this.P = []; this.N = []; this.C = []; this.I = []; this.idx = []; }
  get size() { return this.P.length / 3; }
  vert(x, y, z, nx, ny, nz, c, info) {
    this.P.push(x, y, z); this.N.push(nx, ny, nz); this.C.push(c[0], c[1], c[2]); this.I.push(info[0], info[1], info[2]);
  }
  typed() {
    return {
      position: new Float32Array(this.P), normal: new Float32Array(this.N), color: new Float32Array(this.C),
      info: new Float32Array(this.I), index: new Uint32Array(this.idx),
    };
  }
}

// One set of arrays for each key (a layer), made on demand.
export class Layered {
  constructor() { this.m = new Map(); }
  at(k) { if (!this.m.has(k)) this.m.set(k, new Arrays()); return this.m.get(k); }
  get verts() { let n = 0; for (const a of this.m.values()) n += a.size; return n; }
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

// The bends of a path made round: each corner of more than about 15 degrees is cut at rad
// before and after it, with a point between, as an elbow of a pipe.
export function roundCorners(pts, rad) {
  if (pts.length < 3) return pts;
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = sub(pts[i], pts[i - 1]), b = sub(pts[i + 1], pts[i]), la = len(a), lb = len(b);
    if (la < 1e-6 || lb < 1e-6) continue;
    const c = dot(a, b) / (la * lb);
    if (c > 0.966) { out.push(pts[i]); continue; }
    const r = Math.min(rad, la * 0.45, lb * 0.45), P = pts[i];
    const p0 = [P[0] - (a[0] / la) * r, P[1] - (a[1] / la) * r, P[2] - (a[2] / la) * r];
    const p2 = [P[0] + (b[0] / lb) * r, P[1] + (b[1] / lb) * r, P[2] + (b[2] / lb) * r];
    const m = [(p0[0] + p2[0]) / 4 + P[0] / 2, (p0[1] + p2[1]) / 4 + P[1] / 2, (p0[2] + p2[2]) / 4 + P[2] / 2];
    out.push(p0, m, p2);
  }
  out.push(pts[pts.length - 1]);
  return out;
}

// A cable that hangs between a and b: a sag of `sag` m at the middle (a parabola, near enough to
// a catenary for a short span), in n pieces.
export function hang(a, b, sag, n) {
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t]);
  }
  return out;
}

// A tube of radius r and `sides` sides along the path pts, into the arrays A. The frame of each
// ring is carried along the path (parallel transport), thus the tube does not twist. col: the
// linear rgb; info: [building, layer, kind]. The ends are open.
export function tube(A, pts, r, sides, col, info) {
  const n = pts.length;
  if (n < 2) return;
  const base = A.size;
  let N0 = null;
  for (let i = 0; i < n; i++) {
    const T = norm(sub(pts[Math.min(n - 1, i + 1)], pts[Math.max(0, i - 1)]));
    let N;
    if (!N0) N = norm(Math.abs(T[1]) < 0.9 ? cross(T, [0, 1, 0]) : cross(T, [1, 0, 0]));
    else { const d = dot(N0, T); N = norm([N0[0] - T[0] * d, N0[1] - T[1] * d, N0[2] - T[2] * d]); }
    const B = cross(T, N);
    N0 = N;
    const P = pts[i];
    for (let s = 0; s < sides; s++) {
      const a = (s / sides) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
      const d = [N[0] * ca + B[0] * sa, N[1] * ca + B[1] * sa, N[2] * ca + B[2] * sa];
      A.vert(P[0] + d[0] * r, P[1] + d[1] * r, P[2] + d[2] * r, d[0], d[1], d[2], col, info);
    }
  }
  for (let i = 0; i < n - 1; i++)
    for (let s = 0; s < sides; s++) {
      const a = base + i * sides + s, b = base + i * sides + ((s + 1) % sides), c = a + sides, d = b + sides;
      A.idx.push(a, b, c, b, d, c); // counter-clockwise from outside: the back faces of the layers are dark
    }
}

// A box from its middle c, its half sizes h along the axes u (along), v (up) and w (out), into
// the arrays A: for the brackets on the walls.
export function box(A, c, u, v, w, h, col, info) {
  const base = A.size;
  const faces = [[u, v, w, 1], [u, v, w, -1], [v, w, u, 1], [v, w, u, -1], [w, u, v, 1], [w, u, v, -1]];
  const hs = new Map([[u, h[0]], [v, h[1]], [w, h[2]]]);
  // the faces must turn counter-clockwise to the outside (the back faces of the layers are
  // dark): for a left-handed u, v, w, the turn is the other way
  const flip = dot(cross(u, v), w) < 0;
  for (const [a, b, n, s] of faces) {
    const ha = hs.get(a), hb = hs.get(b), hn = hs.get(n) * s, o = A.size;
    for (const [p, q] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      A.vert(c[0] + a[0] * ha * p + b[0] * hb * q + n[0] * hn, c[1] + a[1] * ha * p + b[1] * hb * q + n[1] * hn, c[2] + a[2] * ha * p + b[2] * hb * q + n[2] * hn,
        n[0] * s, n[1] * s, n[2] * s, col, info);
    }
    if ((s > 0) !== flip) A.idx.push(o, o + 1, o + 2, o, o + 2, o + 3); else A.idx.push(o, o + 2, o + 1, o, o + 3, o + 2);
  }
  return A.size - base;
}

// A corrugated sheet: from the edge a0-a1 (on the wall, at its height) out along w by `out` m,
// falling `drop` m to the far edge, with ridges every 0.12 m along the edge.
export function sheet(A, a0, a1, w, out, drop, col, info) {
  const e = sub(a1, a0), L = len(e), n = Math.max(2, Math.round(L / 0.06));
  const base = A.size;
  for (let i = 0; i <= n; i++) {
    const t = i / n, ridge = (i % 2) * 0.025;
    const p = [a0[0] + e[0] * t, a0[1] + e[1] * t + ridge, a0[2] + e[2] * t];
    const q = [p[0] + w[0] * out, p[1] - drop, p[2] + w[2] * out];
    const sh = i % 2 ? 1 : 0.86; // the ridges catch the light, the troughs less
    const c = [col[0] * sh, col[1] * sh, col[2] * sh];
    const nrm = norm([w[0] * drop, out, w[2] * drop]);
    A.vert(p[0], p[1], p[2], nrm[0], nrm[1], nrm[2], c, info);
    A.vert(q[0], q[1], q[2], nrm[0], nrm[1], nrm[2], c, info);
  }
  // the upper face turns counter-clockwise to the sky
  const g = cross(sub([a0[0] + w[0] * out, a0[1] - drop, a0[2] + w[2] * out], a0), e), up = g[1] > 0;
  for (let i = 0; i < n; i++) {
    const a = base + i * 2;
    if (up) A.idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); else A.idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
}

// Mesh arrays cut into square tiles of `size` m (by the first vertex of each triangle), thus the
// camera can leave out the tiles that it does not see.
export function tiles(a, size) {
  const groups = new Map(), idx = a.index, P = a.position;
  for (let t = 0; t < idx.length; t += 3) {
    const v = idx[t], key = `${Math.floor(P[v * 3] / size)}:${Math.floor(P[v * 3 + 2] / size)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(t);
  }
  const out = [];
  for (const list of groups.values()) {
    const map = new Map(), index = new Uint32Array(list.length * 3);
    let n = 0;
    list.forEach((t, q) => { for (let c = 0; c < 3; c++) { const v = idx[t + c]; if (!map.has(v)) map.set(v, n++); index[q * 3 + c] = map.get(v); } });
    const part = { position: new Float32Array(n * 3), normal: new Float32Array(n * 3), color: new Float32Array(n * 3), info: new Float32Array(n * 3), index };
    for (const [v, w] of map) for (const k of ['position', 'normal', 'color', 'info']) { part[k][w * 3] = a[k][v * 3]; part[k][w * 3 + 1] = a[k][v * 3 + 1]; part[k][w * 3 + 2] = a[k][v * 3 + 2]; }
    out.push(part);
  }
  return out;
}
