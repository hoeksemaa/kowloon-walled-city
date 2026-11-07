// Small deterministic helpers shared by the layout, the simulation and the renderer.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash2(x, y) {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export function smoothstep(a, b, x) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

// Value noise in [0, 1].
export function vnoise(x, y, seed = 0) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;
  const s = (a, b) => hash2(a + seed * 1013, b - seed * 7919);
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return lerp(lerp(s(xi, yi), s(xi + 1, yi), u), lerp(s(xi, yi + 1), s(xi + 1, yi + 1), u), v);
}

export function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

// entries: [[value, weight], ...]
export function weighted(rng, entries) {
  let total = 0;
  for (const e of entries) total += e[1];
  let r = rng() * total;
  for (const e of entries) {
    r -= e[1];
    if (r <= 0) return e[0];
  }
  return entries[entries.length - 1][0];
}

export function pointInPolygon(x, z, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

export function polygonArea(poly) {
  let a = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) a += poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1];
  return Math.abs(a) / 2;
}

// Growable Float32Array, used to build large merged geometries without boxing numbers.
export class FloatBuf {
  constructor(n = 1 << 16) {
    this.a = new Float32Array(n);
    this.n = 0;
  }
  grow(k) {
    if (this.n + k <= this.a.length) return;
    const b = new Float32Array(Math.max(this.a.length * 2, this.n + k));
    b.set(this.a);
    this.a = b;
  }
  p2(a, b) {
    this.grow(2);
    this.a[this.n++] = a; this.a[this.n++] = b;
  }
  p3(a, b, c) {
    this.grow(3);
    this.a[this.n++] = a; this.a[this.n++] = b; this.a[this.n++] = c;
  }
  p4(a, b, c, d) {
    this.grow(4);
    this.a[this.n++] = a; this.a[this.n++] = b; this.a[this.n++] = c; this.a[this.n++] = d;
  }
  view() {
    return this.a.subarray(0, this.n);
  }
}

export function fmtClock(min) {
  const m = ((Math.floor(min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
