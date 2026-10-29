// Cables and pipes strung across the alleys and down the facades.
//
// Each wire keeps a fixed length. When the storeys are pulled apart, its ends move with
// their storeys: a slack cable straightens, then stays taut.
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { STOREY } from './layout.js';
import { mulberry32, clamp } from './util.js';

export const WIRE_TYPES = [
  { key: 'power', label: 'electricity', color: '#f2a43a', w: 5 },
  { key: 'power', label: 'electricity', color: '#e2642f', w: 3 },
  { key: 'water', label: 'water pipe', color: '#5cc6c4', w: 3 },
  { key: 'phone', label: 'telephone', color: '#a68ad6', w: 1.5 },
  { key: 'tv', label: 'TV cable', color: '#d9d3c2', w: 1.2 },
];

const SEGS = 10;

export function buildWires(L) {
  const rng = mulberry32(42);
  const { W, D, owner, alley, buildings, x0, z0 } = L;
  const wires = [];
  const own = (i, j) => (i < 0 || j < 0 || i >= W || j >= D ? -1 : owner[j * W + i]);
  const type = () => {
    let r = rng() * WIRE_TYPES.reduce((s, t) => s + t.w, 0);
    for (let t = 0; t < WIRE_TYPES.length; t++) if ((r -= WIRE_TYPES[t].w) <= 0) return t;
    return 0;
  };
  const alleyCells = [];
  for (let c = 0; c < L.N; c++) if (L.inside[c] && alley[c] === 1) alleyCells.push(c);

  // Spans across an alley, wall to wall.
  for (let n = 0; n < 1500; n++) {
    const c = alleyCells[Math.floor(rng() * alleyCells.length)];
    const i = c % W, j = (c / W) | 0;
    const horiz = rng() < 0.5;
    const di = horiz ? 1 : 0, dj = horiz ? 0 : 1;
    let a = 0, b = 0;
    while (a < 6 && own(i - di * (a + 1), j - dj * (a + 1)) < 0 && alley[(j - dj * (a + 1)) * W + i - di * (a + 1)]) a++;
    while (b < 6 && own(i + di * (b + 1), j + dj * (b + 1)) < 0 && alley[(j + dj * (b + 1)) * W + i + di * (b + 1)]) b++;
    const oa = own(i - di * (a + 1), j - dj * (a + 1)), ob = own(i + di * (b + 1), j + dj * (b + 1));
    if (oa < 0 || ob < 0 || a + b > 6) continue;
    const top = Math.min(buildings[oa].floors, buildings[ob].floors, 8);
    const fa = Math.floor(Math.pow(rng(), 1.6) * top);
    const fb = clamp(fa + [-1, 0, 0, 0, 1][Math.floor(rng() * 5)], 0, top - 1);
    const along = rng() * 0.8 + 0.1;
    const pa = horiz ? [x0 + i - a, z0 + j + along] : [x0 + i + along, z0 + j - a];
    const pb = horiz ? [x0 + i + b + 1, z0 + j + along + (rng() - 0.5) * 0.6] : [x0 + i + along + (rng() - 0.5) * 0.6, z0 + j + b + 1];
    wires.push(make(pa, fa, fa * STOREY + 1.9 + rng() * 0.8, pb, fb, fb * STOREY + 1.9 + rng() * 0.8, 0.12 + rng() * 0.5, type(), [0, 0, 0]));
  }

  // Risers running down alley facades from upper floors to the street.
  for (let n = 0; n < 420; n++) {
    const c = alleyCells[Math.floor(rng() * alleyCells.length)];
    const i = c % W, j = (c / W) | 0;
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const [di, dj] = dirs[Math.floor(rng() * 4)];
    const o = own(i + di, j + dj);
    if (o < 0 || buildings[o].floors < 4) continue;
    const bf = buildings[o].floors;
    const fh = 3 + Math.floor(rng() * (bf - 3));
    const fl = Math.floor(rng() * 2);
    // Wall plane between the alley cell and the building, nudged into the alley.
    const wx = di === 0 ? x0 + i + 0.2 + rng() * 0.6 : x0 + i + (di > 0 ? 1 : 0) - di * 0.15;
    const wz = dj === 0 ? z0 + j + 0.2 + rng() * 0.6 : z0 + j + (dj > 0 ? 1 : 0) - dj * 0.15;
    const drift = (rng() - 0.5) * 1.2;
    const pb = di === 0 ? [wx + drift, wz] : [wx, wz + drift];
    wires.push(make([wx, wz], fh, fh * STOREY + 1.0 + rng() * 1.5, pb, fl, fl * STOREY + 2.0 + rng() * 0.6, 0.05, type(), [-di, 0, -dj]));
  }

  // Runs along a wall, clipped every few metres.
  for (let n = 0; n < 500; n++) {
    const c = alleyCells[Math.floor(rng() * alleyCells.length)];
    const i = c % W, j = (c / W) | 0;
    const [di, dj] = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(rng() * 4)];
    const o = own(i + di, j + dj);
    if (o < 0) continue;
    const f = Math.floor(Math.pow(rng(), 1.4) * Math.min(buildings[o].floors, 6));
    const len = 2 + rng() * 5;
    const wx = di === 0 ? x0 + i + 0.5 : x0 + i + (di > 0 ? 1 : 0) - di * 0.12;
    const wz = dj === 0 ? z0 + j + 0.5 : z0 + j + (dj > 0 ? 1 : 0) - dj * 0.12;
    const y = f * STOREY + 2.0 + rng() * 0.6;
    const pb = di === 0 ? [wx + len * (rng() < 0.5 ? -1 : 1), wz] : [wx, wz + len * (rng() < 0.5 ? -1 : 1)];
    wires.push(make([wx, wz], f, y, pb, f, y + (rng() - 0.5) * 0.4, 0.1 + rng() * 0.25, type(), [-di, 0, -dj]));
  }
  return wires;
}

function make(pa, la, ya, pb, lb, yb, sag, type, out) {
  const d = Math.hypot(pb[0] - pa[0], yb - ya, pb[1] - pa[1]);
  return {
    a: [pa[0], ya, pa[1]], la, b: [pb[0], yb, pb[1]], lb, type, out,
    length: d + (8 * sag * sag) / (3 * Math.max(d, 0.3)),
  };
}

export class WireLayer {
  constructor(L, wires) {
    this.wires = wires;
    const n = wires.length * SEGS;
    this.pos = new Float32Array(n * 6);
    const colors = new Float32Array(n * 6);
    const c = new THREE.Color();
    wires.forEach((w, i) => {
      c.set(WIRE_TYPES[w.type].color);
      for (let s = 0; s < SEGS * 2; s++) colors.set([c.r, c.g, c.b], (i * SEGS * 2 + s) * 3);
    });
    this.geometry = new LineSegmentsGeometry();
    this.geometry.setPositions(this.pos);
    this.geometry.setColors(colors);
    this.material = new LineMaterial({ linewidth: 1.5, vertexColors: true, worldUnits: false });
    this.object = new LineSegments2(this.geometry, this.material);
    this.object.frustumCulled = false;
    this.object.renderOrder = 2;
  }

  // offsets[level] = vertical lift of that storey; cutY = hide wires above this height.
  update(offsets, cut) {
    const P = this.pos;
    let o = 0;
    const A = new THREE.Vector3(), B = new THREE.Vector3(), ch = new THREE.Vector3(), sd = new THREE.Vector3();
    for (const w of this.wires) {
      A.set(w.a[0], w.a[1] + offsets[w.la], w.a[2]);
      B.set(w.b[0], w.b[1] + offsets[w.lb], w.b[2]);
      const hidden = cut >= 0 && Math.max(w.la, w.lb) > cut;
      if (hidden) B.copy(A);
      ch.subVectors(B, A);
      const d = ch.length();
      const sag = w.length > d ? Math.sqrt((3 * d * (w.length - d)) / 8) : 0;
      if (d > 1e-4) ch.divideScalar(d);
      // Sag hangs down, perpendicular to the chord; for near-vertical runs it bows outward.
      sd.set(0, -1, 0).addScaledVector(ch, ch.y);
      if (sd.lengthSq() < 0.04) sd.set(w.out[0], 0, w.out[2]);
      sd.normalize();
      let px = A.x, py = A.y, pz = A.z;
      for (let s = 1; s <= SEGS; s++) {
        const t = s / SEGS, k = 4 * t * (1 - t) * sag;
        const x = A.x + (B.x - A.x) * t + sd.x * k;
        const y = A.y + (B.y - A.y) * t + sd.y * k;
        const z = A.z + (B.z - A.z) * t + sd.z * k;
        P[o++] = px; P[o++] = py; P[o++] = pz; P[o++] = x; P[o++] = y; P[o++] = z;
        px = x; py = y; pz = z;
      }
    }
    const attr = this.geometry.attributes.instanceStart;
    attr.data.array.set(P);
    attr.data.needsUpdate = true;
  }

  setResolution(w, h) {
    this.material.resolution.set(w, h);
  }
}
