// Utilities: power cables, water pipes, telephone lines and TV aerial leads, strung across
// the lanes, along the walls and up the faces of the buildings.
//
// SOURCED: two private suppliers inside, "一人專門供電，另一人專門供水", and power-company
// meters near the outer streets (林羅平, HK01 2024); meters in each flat, asked for by the
// kaifong (HK01 2016); water from about 70 wells (Gordon Jones, WSJ 2014) pumped to roof
// tanks; eight Government standpipes in 1987, "Only one of these was located within the
// City" (City of Darkness Revisited, p107), on Tai Chang Street (pp28, 292; the 1992 map,
// no. 30), the others on Tung Tau Tsuen Road and Tung Tsing Road (葉德偉, HK01 2016); water
// by floor in the morning, "二、三樓可能於早上6、7點來水，然後8、9時就輪到三、四樓" (林羅平); a
// broken pipe was not mended, "只會再駁一條新的" (HK01 2016); "knotted wires, dangling
// electric cables" (Posner, 1987 visit). SCHEMATIC: where each line runs. No map of the
// lines survives.
//
// Each line is cut at the slab lines into pieces of one storey each. When the storeys are
// pulled apart, each piece moves with its storey, and keeps its shape, and below a cut storey
// it dims with its storey (dim.js).
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { STOREY } from './layout.js';
import { CUT_H } from './kinds.js';
import { withDim, dimColor } from './dim.js';
import { mulberry32, clamp, weighted } from './util.js';
import { OUTSIDE } from './footprint.js';
import { wallFrame } from './geom.js';

export const WIRE_TYPES = [
  { key: 'power', label: 'electricity', color: '#f2a43a', px: 1.9 },
  { key: 'water', label: 'water pipe (flows at its supply hour)', color: '#5cc6c4', px: 1.8 },
  { key: 'phone', label: 'telephone', color: '#a68ad6', px: 1.2 },
  { key: 'tv', label: 'TV aerial lead', color: '#d9d3c2', px: 1.0 },
];
const T = Object.fromEntries(WIRE_TYPES.map((t, i) => [t.key, i]));
const SEGS = 10;

// Water by floor (林羅平, HK01 2024): [first floor, last floor, start hour, end hour].
export const WATER_HOURS = [[2, 3, 6, 7], [3, 4, 8, 9]];

export function buildWires(L) {
  const rng = mulberry32(42);
  const { W, D, owner, alley, buildings: B, x0, z0 } = L;
  const wires = [];
  const own = (i, j) => (i < 0 || j < 0 || i >= W || j >= D ? -1 : owner[j * W + i]);
  const isLane = (i, j) => i >= 0 && j >= 0 && i < W && j < D && alley[j * W + i] === 1;

  // The walls of each building that face open ground, for fixing line ends to.
  const open = B.map((b) => b.rings.flatMap((r) => r.edges.filter((e) => e.other < 0).map(wallFrame)));
  const snap = (b, x, z, off = 0.08) => {
    let best = null, bd = Infinity;
    for (const f of open[b]) {
      const t = clamp((x - f.A[0]) * f.t[0] + (z - f.A[1]) * f.t[1], 0.1, f.len - 0.1);
      const px = f.A[0] + f.t[0] * t, pz = f.A[1] + f.t[1] * t;
      const d = (px - x) ** 2 + (pz - z) ** 2;
      if (d < bd) { bd = d; best = [px + f.n[0] * off, pz + f.n[1] * off, f.n[0], f.n[1], Math.sqrt(d)]; }
    }
    return best;
  };
  const laneCells = [];
  for (let c = 0; c < L.N; c++) if (L.inside[c] && alley[c] === 1) laneCells.push(c);
  const pickType = (mix) => T[weighted(rng, mix)];

  // Spans across a lane, wall to wall: most low down, a few up to 9/F.
  const SPAN_MIX = [['power', 45], ['phone', 18], ['tv', 22], ['water', 15]];
  for (let n = 0; n < 1800; n++) {
    const c = laneCells[Math.floor(rng() * laneCells.length)];
    const i = c % W, j = (c / W) | 0;
    const horiz = rng() < 0.5, di = horiz ? 1 : 0, dj = horiz ? 0 : 1;
    let a = 0, b = 0;
    while (a < 6 && own(i - di * (a + 1), j - dj * (a + 1)) < 0 && alley[(j - dj * (a + 1)) * W + i - di * (a + 1)]) a++;
    while (b < 6 && own(i + di * (b + 1), j + dj * (b + 1)) < 0 && alley[(j + dj * (b + 1)) * W + i + di * (b + 1)]) b++;
    const oa = own(i - di * (a + 1), j - dj * (a + 1)), ob = own(i + di * (b + 1), j + dj * (b + 1));
    if (oa < 0 || ob < 0 || oa === ob || a + b > 6 || B[oa].kind === 'yamen' || B[ob].kind === 'yamen') continue;
    const along = rng() * 0.8 + 0.1;
    const pa = snap(oa, x0 + i + (horiz ? -a : along), z0 + j + (horiz ? along : -a));
    const pb = snap(ob, x0 + i + (horiz ? b + 1 : along + (rng() - 0.5) * 0.6), z0 + j + (horiz ? along + (rng() - 0.5) * 0.6 : b + 1));
    if (!pa || !pb || pa[4] > 1.5 || pb[4] > 1.5) continue;
    const top = Math.min(B[oa].floors, B[ob].floors, 9);
    const fa = Math.floor(Math.pow(rng(), 1.7) * top);
    const fb = clamp(fa + [-1, 0, 0, 0, 1][Math.floor(rng() * 5)], 0, top - 1);
    wires.push(make([pa[0], pa[1]], fa, fa * STOREY + 1.9 + rng() * 0.8, [pb[0], pb[1]], fb, fb * STOREY + 1.9 + rng() * 0.8, 0.12 + rng() * 0.5, pickType(SPAN_MIX), [0, 0, 0]));
  }

  // Trunks: bundles of cable and pipe that come in from the outer streets and run along the
  // lanes, clipped to the walls every few metres.
  const entrances = laneCells.filter((c) => {
    const i = c % W, j = (c / W) | 0;
    return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => !L.inside[(j + b) * W + i + a] || alley[(j + b) * W + i + a] === 3);
  });
  for (let n = 0; n < 70; n++) {
    let c = entrances[Math.floor(rng() * entrances.length)];
    const kind = rng() < 0.6 ? 'power' : 'water';
    const strands = kind === 'power' ? 2 + Math.floor(rng() * 3) : 1 + Math.floor(rng() * 2);
    const seen = new Set([c]);
    const path = [c];
    let dir = null;
    for (let s = 0; s < 30 + rng() * 50; s++) {
      const i = c % W, j = (c / W) | 0;
      const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a, b]) => isLane(i + a, j + b) && !seen.has((j + b) * W + i + a));
      if (!opts.length) break;
      const keep = dir && opts.find(([a, b]) => a === dir[0] && b === dir[1]);
      dir = keep && rng() < 0.85 ? keep : opts[Math.floor(rng() * opts.length)];
      c = (j + dir[1]) * W + i + dir[0];
      seen.add(c);
      path.push(c);
    }
    // Fix points every 3 cells, on the wall nearest the path.
    const fixes = [];
    for (let q = 0; q < path.length; q += 3) {
      const k = path[q], i = k % W, j = (k / W) | 0;
      const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => own(i + a, j + b)).filter((o) => o >= 0 && B[o].kind !== 'yamen');
      if (!nb.length) continue;
      const p = snap(nb[0], x0 + i + 0.5, z0 + j + 0.5);
      if (p && p[4] < 1.6) fixes.push(p);
    }
    for (let s = 0; s < strands; s++) {
      const y = kind === 'power' ? 2.5 + s * 0.12 + rng() * 0.2 : 0.5 + s * 0.15 + rng() * 1.6;
      for (let q = 0; q + 1 < fixes.length; q++) {
        const a = fixes[q], b = fixes[q + 1];
        wires.push(make([a[0] + a[2] * s * 0.05, a[1] + a[3] * s * 0.05], 0, y, [b[0] + b[2] * s * 0.05, b[1] + b[3] * s * 0.05], 0, y + (rng() - 0.5) * 0.15, 0.08 + rng() * 0.2, T[kind], [a[2], 0, a[3]]));
      }
    }
  }

  // Risers on the open faces: water pumped up to the roof tanks, power up to the meters,
  // TV aerial leads down from the roof, telephone lines.
  for (const b of B) {
    if (b.kind !== 'tenement' || b.floors < 3 || !open[b.id].length) continue;
    const faces = open[b.id].filter((f) => f.len > 1.2);
    if (!faces.length) continue;
    const at = () => {
      const f = faces[Math.floor(rng() * faces.length)];
      const t = 0.3 + rng() * (f.len - 0.6);
      return { p: [f.A[0] + f.t[0] * t + f.n[0] * 0.1, f.A[1] + f.t[1] * t + f.n[1] * 0.1], t: f.t, n: f.n };
    };
    const top = b.floors - 1, roof = b.floors * STOREY;
    if (rng() < 0.55) {
      const r = at();
      wires.push(make(r.p, 0, 0.4, [r.p[0] + r.t[0] * 0.3, r.p[1] + r.t[1] * 0.3], top, roof + 0.8, 0.05, T.water, [r.n[0], 0, r.n[1]]));
    }
    const nr = 1 + Math.floor(rng() * 3);
    for (let q = 0; q < nr; q++) {
      const r = at();
      const kind = weighted(rng, [['power', 4], ['tv', 4], ['phone', 2]]);
      const f = 1 + Math.floor(rng() * top);
      const drift = (rng() - 0.5) * 1.2;
      const p2 = [r.p[0] + r.t[0] * drift, r.p[1] + r.t[1] * drift];
      if (kind === 'tv') wires.push(make(r.p, top, roof + 0.6, p2, f, f * STOREY + 2.1, 0.06, T.tv, [r.n[0], 0, r.n[1]]));
      else wires.push(make(r.p, 0, 2.6, p2, f, f * STOREY + 1.6 + rng(), 0.06, T[kind], [r.n[0], 0, r.n[1]]));
    }
  }

  // Standpipes: the one inside, on Tai Chang Street at no. 30 of the 1992 map (APPROXIMATE;
  // the lane cell of layout.js bookPlaces, where the people fetch water),
  // then seven on the outer edge (Tung Tau Tsuen Road on the north, Tung Tsing Road on the
  // east; SCHEMATIC).
  const pipes = [];
  const sp = L.places.find((p) => p.n === 30);
  if (L.standpipe) pipes.push([L.standpipe.x, L.standpipe.z]);
  else if (sp) {
    let best = null, bd = Infinity;
    for (let dj = -5; dj <= 5; dj++)
      for (let di = -5; di <= 5; di++) {
        const k = sp.k + dj * W + di;
        if (alley[k] === 1 && di * di + dj * dj < bd) { bd = di * di + dj * dj; best = k; }
      }
    if (best !== null) pipes.push([L.cellX(best), L.cellZ(best)]);
  }
  const edge = [];
  for (const b of B)
    for (const r of b.rings)
      for (const e of r.edges)
        if (e.other === OUTSIDE && (b.front === 'top' || b.cx > L.bbox.maxx - 30)) edge.push(wallFrame(e));
  edge.sort((a, b) => b.len - a.len);
  for (let q = 0; q < 7 && q < edge.length; q++) {
    const f = edge[Math.floor((q / 7) * Math.min(edge.length, 60))];
    pipes.push([f.A[0] + f.t[0] * f.len / 2 + f.n[0] * 1.2, f.A[1] + f.t[1] * f.len / 2 + f.n[1] * 1.2]);
  }
  return { wires, standpipes: pipes };
}

// A line from pa ([x, z]) on storey la, at height ya, to pb on storey lb, at yb. sag: how far
// its middle hangs from the straight line; out: the way a near-vertical run bows.
function make(pa, la, ya, pb, lb, yb, sag, type, out) {
  return { a: [pa[0], ya, pa[1]], la, b: [pb[0], yb, pb[1]], lb, type, out, top: Math.max(la, lb), sag };
}

// The line of wire w as it hangs in the normal view (SEGS segments, with the sag at right
// angles to the chord), cut at each slab line between its two ends. Each segment goes to
// out ([x, y, z] of its two ends) and its storey to ks. The part above the roof stays with
// the top storey, as the roof does.
function pieces(w, out, ks) {
  const [ax, ay, az] = w.a, [bx, by, bz] = w.b, sag = w.sag;
  let cx = bx - ax, cy = by - ay, cz = bz - az;
  const d = Math.hypot(cx, cy, cz);
  if (d > 1e-4) { cx /= d; cy /= d; cz /= d; }
  // Sag hangs down, at right angles to the chord; a near-vertical run bows outward.
  let sx = cx * cy, sy = cy * cy - 1, sz = cz * cy;
  if (sx * sx + sy * sy + sz * sz < 0.04) { sx = w.out[0]; sy = 0; sz = w.out[2]; }
  const sl = Math.hypot(sx, sy, sz) || 1;
  sx /= sl; sy /= sl; sz /= sl;
  const lo = Math.min(w.la, w.lb), hi = Math.max(w.la, w.lb);
  const storey = (y) => Math.min(hi, Math.max(lo, Math.floor(y / STOREY)));
  let p = [ax, ay, az];
  for (let s = 1; s <= SEGS; s++) {
    const t = s / SEGS, k = 4 * t * (1 - t) * sag;
    const q = [ax + (bx - ax) * t + sx * k, ay + (by - ay) * t + sy * k, az + (bz - az) * t + sz * k];
    let kp = storey(p[1]), a = p;
    const kq = storey(q[1]);
    while (kp !== kq) {
      const up = kq > kp, f = ((up ? kp + 1 : kp) * STOREY - p[1]) / (q[1] - p[1]);
      const m = [p[0] + (q[0] - p[0]) * f, p[1] + (q[1] - p[1]) * f, p[2] + (q[2] - p[2]) * f];
      out.push(...a, ...m);
      ks.push(kp);
      a = m;
      kp += up ? 1 : -1;
    }
    out.push(...a, ...q);
    ks.push(kq);
    p = q;
  }
}

export class WireLayer {
  constructor(L, data) {
    this.object = new THREE.Group();
    // One layer per type; water is split into the floors that get morning water and the rest.
    const groups = new Map();
    for (const w of data.wires) {
      const key = w.type === T.water && w.top <= 4 ? 'waterLow' : WIRE_TYPES[w.type].key;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(w);
    }
    this.layers = [...groups.entries()].map(([key, wires]) => {
      const t = WIRE_TYPES[wires[0].type];
      const rest = [], ks = [];
      for (const w of wires) pieces(w, rest, ks);
      const pos = new Float32Array(rest), cols = new Float32Array(rest.length);
      const geometry = new LineSegmentsGeometry();
      geometry.setPositions(pos);
      geometry.setColors(cols);
      // The colour of the type goes in the colour of each segment, dimmed by its storey.
      const material = new LineMaterial({ color: '#ffffff', vertexColors: true, linewidth: t.px, worldUnits: false, dashSize: 0.5, gapSize: 0.35 });
      const object = new LineSegments2(geometry, material);
      object.frustumCulled = false;
      object.renderOrder = 2;
      this.object.add(object);
      // rest: the segments in the normal view; k: the storey of each segment.
      return { key, rest: new Float32Array(rest), k: Uint8Array.from(ks), pos, cols, color: new THREE.Color(t.color), geometry, material, object };
    });
    // Standpipes: short posts with a tap, on the street (G/F).
    const g = new THREE.CylinderGeometry(0.07, 0.07, 1.0, 6).translate(0, 0.5, 0);
    const mat = new THREE.MeshLambertMaterial({ color: '#5cc6c4' });
    mat.onBeforeCompile = (s) => withDim(s, '0.0');
    mat.customProgramCacheKey = () => 'kwc-standpipe';
    const posts = new THREE.InstancedMesh(g, mat, data.standpipes.length);
    data.standpipes.forEach(([x, z], i) => posts.setMatrixAt(i, new THREE.Matrix4().makeTranslation(x, 0, z)));
    this.object.add(posts);
    this.standpipes = data.standpipes;
    this.flowing = false;
  }

  // Water runs in the low pipes during the morning supply hours.
  tick(hour, dt) {
    const on = WATER_HOURS.some(([, , h0, h1]) => hour >= h0 && hour < h1);
    for (const l of this.layers) {
      if (l.key !== 'waterLow') continue;
      if (on !== this.flowing) {
        l.material.dashed = on;
        l.material.linewidth = on ? 2.6 : WIRE_TYPES[T.water].px;
        l.material.needsUpdate = true;
        if (on) l.object.computeLineDistances();
      }
      if (on) l.material.dashOffset -= dt * 2.0;
    }
    this.flowing = on;
  }

  // offsets[k] = the lift of storey k. Each segment moves with its own storey. With a cut
  // storey, the storeys above it are hidden, and the rest is cut level at CUT_H over its floor
  // (the section of cityMesh.js). Each segment takes the colour of its storey (dim.js).
  update(offsets, cut) {
    const top = cut >= 0 ? cut * STOREY + CUT_H + 0.05 : Infinity;
    for (const l of this.layers) {
      const R = l.rest, P = l.pos, K = l.k, C = l.cols;
      const tone = [];
      for (let k = 0; k < 16; k++) tone.push(dimColor(l.color, k, {}));
      let o = 0;
      for (let i = 0; i < K.length; i++) {
        const k = K[i];
        if (cut >= 0 && k > cut) continue;
        const r = i * 6;
        let x0 = R[r], y0 = R[r + 1], z0 = R[r + 2], x1 = R[r + 3], y1 = R[r + 4], z1 = R[r + 5];
        if (y0 > top && y1 > top) continue;
        if (y0 > top || y1 > top) {
          const f = (top - y0) / (y1 - y0), x = x0 + (x1 - x0) * f, z = z0 + (z1 - z0) * f;
          if (y0 > top) { x0 = x; y0 = top; z0 = z; } else { x1 = x; y1 = top; z1 = z; }
        }
        const off = offsets[k], c = tone[k];
        C[o] = C[o + 3] = c.r; C[o + 1] = C[o + 4] = c.g; C[o + 2] = C[o + 5] = c.b;
        P[o++] = x0; P[o++] = y0 + off; P[o++] = z0; P[o++] = x1; P[o++] = y1 + off; P[o++] = z1;
      }
      const attr = l.geometry.attributes.instanceStart;
      attr.data.array.set(P);
      attr.data.needsUpdate = true;
      l.geometry.attributes.instanceColorStart.data.needsUpdate = true;
      l.geometry.instanceCount = o / 6;
      if (l.material.dashed) l.object.computeLineDistances();
    }
  }

  setResolution(w, h) {
    for (const l of this.layers) l.material.resolution.set(w, h);
  }
}
