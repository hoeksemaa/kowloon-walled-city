// The pipes and cables of the City, drawn as tubes (data/utilities.json: placement.overhead and
// the visuals pipe_bundle, power_cable, drip_sheet and drain):
// - Over each lane: a layer of pipes and cables on wall brackets every 1.5-2 m, 2.2-3.5 m over
//   the lane floor, with steel and plastic water pipes, rubber hoses, electric cables and flex,
//   "sagging and wet" (U74, U76, U86, U110, U143). It is denser over a named lane (30-40 in all)
//   than over a small lane (10-20). The rigid pipes bend at elbows; the hoses, the cables and
//   the flex sag between the brackets, and some flex hangs in loops. A broken pipe was not
//   mended: a new one was added beside it (U74). Thus a pipe often runs only part of a wall and
//   turns into it at its ends.
// - Cables across the lanes, from wall to wall: "wires ran from building to building" (U76).
// - Drip sheets of plastic or metal under the pipes, about every 6 m on the named lanes, slanted
//   to one wall (U162).
// - Pipes and cables down the facades, from the roofs to the lanes (2-6 on each facade on a
//   lane, photo pp114-115; the tank pipes, U15; drains, U150).
// - In the normal view only (they join two buildings, thus two floor layers): wires from
//   building to building higher up (U76), and cables from roof to roof on poles (pp322-323).
// The look of each thing has a source. Where each pipe runs, how many there are, their sizes and
// their colours are INFERRED. The structure is frozen: this file only reads it.
import { LANE } from '../footprint.js';
import { levelAt } from '../city/model.js';
import { inRings, toAW } from '../city/poly.js';
import { mulberry32 } from '../util.js';
import { Layered, Arrays, tube, hang, roundCorners, sheet } from './tubes.js';

export const PIPE_KIND = 9; // the pick kind of the things (ITEM_KIND of furnish.js)

const lin = (hex) => { const n = parseInt(hex.slice(1), 16), f = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return [f(((n >> 16) & 255) / 255), f(((n >> 8) & 255) / 255), f((n & 255) / 255)]; };
const pal = (list) => list.map(lin);
// The colours of the drawing (sRGB): dull, dirty and wet.
const COL = {
  pipe: pal(['#a3a8a5', '#8f9592', '#b4b6b0', '#8d7a66', '#7a6553', '#3c3a37', '#8b9192', '#d1cdc2', '#7d9cb8', '#9aa59b']),
  hose: pal(['#2b2a29', '#2b2a29', '#6e3a2c', '#4a6346', '#c9c2b0', '#3f5f86', '#8a8478']),
  cable: pal(['#1f1e1d', '#2a2927', '#353330', '#4a4845', '#5e5b56', '#c9c4b8']),
  flex: pal(['#1f1e1d', '#d8d2c4', '#8a2e24', '#5c4632', '#7a7468', '#e0d8c0']),
  bracket: pal(['#5e5146', '#6d6052', '#4e4840']),
  drain: pal(['#6f6a62', '#55524c', '#8a8070']),
  sheet: pal(['#7fa08a', '#6f8fa8', '#8a7660', '#9a9c98', '#a89a78']),
  pole: pal(['#b39a62', '#a08a58', '#7a7a74']),
};
// The kinds of the pipes: radius (m), sides, sag between brackets (m for each m of span, squared).
const KIND = {
  pipe: { r: [0.02, 0.038], sides: 5, sag: 0, thick: true },
  hose: { r: [0.016, 0.024], sides: 4, sag: 0.02, thick: true },
  cable: { r: [0.009, 0.014], sides: 3, sag: 0.05, thick: false },
  flex: { r: [0.006, 0.009], sides: 3, sag: 0.09, thick: false },
};
const shade = (c, f) => [c[0] * f, c[1] * f, c[2] * f];

// The slots of the overhead layer: each one a pipe of a kind, height and depth. The same slot
// has the same height and depth on every wall of a lane, thus a pipe goes on from one building
// to the next.
function slots(n, seed) {
  const r = mulberry32(seed), out = [];
  for (let i = 0; i < n; i++) {
    const q = r(), kind = q < 0.34 ? 'pipe' : q < 0.48 ? 'hose' : q < 0.78 ? 'cable' : 'flex', K = KIND[kind];
    out.push({
      kind, r: K.r[0] + r() * (K.r[1] - K.r[0]), sides: K.sides, thick: K.thick,
      f: kind === 'pipe' ? 0.15 + r() * 0.85 : r(), d: kind === 'pipe' ? r() * 0.55 : r(),
      col: shade(COL[kind][Math.floor(r() * COL[kind].length)], 0.82 + r() * 0.3),
      sag: K.sag * (0.5 + r()), loop: kind === 'flex' && r() < 0.35,
    });
  }
  return out;
}
const SLOTS = { named: slots(14, 1986), lane: slots(6, 1215) };
// The pieces of a hanging cable: more for a deeper sag.
const pieces = (sag) => (sag > 0.2 ? 6 : sag > 0.06 ? 4 : 2);

// Build the pipes and cables. S: the structure; walls: a Walls (walls.js); opts.named: the
// lane cells of the named lanes (a Set). Returns { thick, thin: Layered arrays (by layer),
// spans: Arrays (the normal view only), items: [[key, item]] for the pick, risers: the groups of
// pipes down the facades, { b, x, z } }.
export function buildPipes(S, walls, { named = new Set(), tanks = new Set() } = {}) {
  const L = S.L;
  const thick = new Layered(), thin = new Layered(), spans = new Arrays(), items = [];
  const risersAt = []; // the groups of pipes down the facades: { b, x, z } (for src/life/facades.js)
  // k0..k1: the floor layers where the pick finds it (pipes on a facade: all of them)
  const item = (b, kind, x, z, r, k0 = 0, k1 = k0) => items.push([`out:${b}`, { kind, x, z, r, k0, k1 }]);
  const isNamed = (x, z) => { const i = Math.floor(x - L.x0), j = Math.floor(z - L.z0); return named.has(j * L.W + i); };

  for (const b of S.list) {
    const r = mulberry32((b.id * 2654435761 + 77) >>> 0);
    overhead(b, r);
    if (b.n >= 2) risers(b, r);
  }
  roofCables();

  // ---- the overhead layer over the lanes, on the lane walls of the G/F ----
  function overhead(b, r) {
    const ph = b.phases[0], yc = b.n >= 2 ? b.y[1] - 0.22 : b.top - 0.15;
    for (const ring of ph.rings) {
      if (ring.hole) continue;
      const m = ring.pts.length;
      // the edges on a lane of the City, in runs (chains) round the ring
      const onLane = ring.pts.map((A, i) => {
        if (ring.other[i] !== LANE) return false;
        const B = ring.pts[(i + 1) % m], l = Math.hypot(B[0] - A[0], B[1] - A[1]);
        if (l < 0.4) return false;
        const nx = (B[1] - A[1]) / l, nz = -(B[0] - A[0]) / l, mx = (A[0] + B[0]) / 2, mz = (A[1] + B[1]) / 2;
        return walls.inLane(mx + nx * 0.6, mz + nz * 0.6) || walls.inLane(mx + nx * 1.1, mz + nz * 1.1);
      });
      if (!onLane.some(Boolean)) continue;
      // the runs of edges on a lane, round the ring: from the edge after one that is not on a lane
      if (onLane.every(Boolean)) { run(b, ring, [...Array(m).keys()], yc, r, true); continue; }
      const s0 = onLane.findIndex((v) => !v);
      let cur = [];
      for (let q = 1; q <= m; q++) {
        const i = (s0 + q) % m;
        if (onLane[i]) cur.push(i);
        else { if (cur.length) run(b, ring, cur, yc, r, false); cur = []; }
      }
    }
  }

  // One chain of edges (indices of ring edges, in order).
  function run(b, ring, chain, yc, r, closed) {
    const m = ring.pts.length;
    const V = [ring.pts[chain[0]], ...chain.map((i) => ring.pts[(i + 1) % m])];
    const E = chain.map((i, q) => {
      const A = V[q], B = V[q + 1], l = Math.hypot(B[0] - A[0], B[1] - A[1]);
      return { A, l, ux: (B[0] - A[0]) / l, uz: (B[1] - A[1]) / l, nx: (B[1] - A[1]) / l, nz: -(B[0] - A[0]) / l };
    });
    const total = E.reduce((s, e) => s + e.l, 0);
    if (total < 0.8) return;
    // the brackets: every 1.5-2 m, and at each corner of the chain
    const at = [];
    for (let s = 0.12; s < total - 0.12; s += 1.5 + r() * 0.5) at.push(s);
    at.push(total - 0.12);
    let acc = 0;
    for (let q = 0; q + 1 < E.length; q++) { acc += E[q].l; if (!at.some((s) => Math.abs(s - acc) < 0.45)) at.push(acc); }
    at.sort((a, b2) => a - b2);
    const nm = (() => { let c = 0; for (const s of at) { const p = pointAt(E, s); if (isNamed(p.x + p.nx * 0.8, p.z + p.nz * 0.8)) c++; } return c * 2 > at.length; })();
    const set = nm ? SLOTS.named : SLOTS.lane;
    // each bracket: its point, its normal, the floor of the lane, the band of the pipes, the depth
    const K = at.map((s) => {
      const p = pointAt(E, s);
      const yl = walls.laneY(p.x + p.nx * 0.6, p.z + p.nz * 0.6, 1) ?? walls.laneY(p.x + p.nx * 1.2, p.z + p.nz * 1.2, 1);
      if (yl === null) return null;
      const hi = Math.min(yl + (nm ? 3.4 : 2.95), yc), lo = Math.min(yl + (nm ? 2.5 : 2.25), hi - 0.2);
      if (hi < yl + 1.95) return null;
      const open = walls.hit(p.x + p.nx * 0.02, p.z + p.nz * 0.02, p.nx, p.nz, (lo + hi) / 2, 8).t;
      if (open < 0.55) return null;
      const depth = Math.max(0.22, Math.min(Math.min(open, 8) * (nm ? 0.42 : 0.34), nm ? 1.1 : 0.55));
      return { ...p, s, yl, lo, hi, open, depth };
    });
    // smooth the floor of the lane (a lane of steps)
    const ys = K.map((k) => k?.yl);
    K.forEach((k, j) => {
      if (!k) return;
      const nb = [ys[j - 1], ys[j], ys[j + 1]].filter((v) => v !== undefined && v !== null);
      const y = nb.reduce((a, v) => a + v, 0) / nb.length, d = y - k.yl;
      k.lo = Math.min(k.lo + d, k.hi - 0.2); k.yl = y;
    });
    // the runs of good brackets
    const runs = [];
    let cur = [];
    for (const k of K) { if (k) cur.push(k); else { if (cur.length > 1) runs.push(cur); cur = []; } }
    if (cur.length > 1) runs.push(cur);
    // a chain end at a party wall: the pipes go on into the next building's lane wall
    const nextLab = ring.other[(chain[chain.length - 1] + 1) % m], prevLab = ring.other[(chain[0] - 1 + m) % m];
    const meetEnd = !closed && nextLab >= 0, meetStart = !closed && prevLab >= 0;
    for (const R of runs) {
      const first = R[0] === K.find(Boolean) && meetStart, last = R[R.length - 1] === [...K].reverse().find(Boolean) && meetEnd;
      bundle(b, R, set, r, first, last, nm);
    }
  }

  function pointAt(E, s) {
    let a = 0;
    for (let q = 0; q < E.length; q++) {
      const e = E[q];
      if (s <= a + e.l + 1e-6 || q === E.length - 1) {
        const t = Math.max(0, Math.min(e.l, s - a));
        // at a corner: the mean of the two normals, longer by the miter
        let nx = e.nx, nz = e.nz, mit = 1;
        const nb = Math.abs(t - e.l) < 0.05 && E[q + 1] ? E[q + 1] : Math.abs(t) < 0.05 && E[q - 1] ? E[q - 1] : null;
        if (nb) { const mx = nx + nb.nx, mz = nz + nb.nz, l = Math.hypot(mx, mz) || 1; nx = mx / l; nz = mz / l; mit = 1 / Math.max(0.55, nx * e.nx + nz * e.nz); }
        return { x: e.A[0] + e.ux * t, z: e.A[1] + e.uz * t, nx, nz, ux: e.ux, uz: e.uz, mit };
      }
      a += e.l;
    }
    return null;
  }

  // The pipes of one run of brackets R (in order along the wall).
  function bundle(b, R, set, r, meetStart, meetEnd, nm) {
    const n = R.length, info = [b.id, 0, PIPE_KIND];
    const P = (k, sl, dj = 0, yj = 0) => {
      const d = (0.06 + sl.d * k.depth + dj) * k.mit, y = k.lo + sl.f * (k.hi - k.lo) + yj;
      return [k.x + k.nx * d, y, k.z + k.nz * d];
    };
    const wallPt = (k, y) => [k.x + k.nx * 0.01, y, k.z + k.nz * 0.01];
    const ext = (k, p, s) => [p[0] + k.ux * s, p[1], p[2] + k.uz * s];
    for (const sl of set) {
      if (r() > (nm ? 0.86 : 0.8)) continue;
      // the part of the run that this pipe takes: all of it, or a part (a newer pipe)
      let ja = 0, jb = n - 1;
      if (r() < 0.4 && n > 2) { ja = Math.floor(r() * (n - 1)); jb = Math.min(n - 1, ja + 1 + Math.floor(r() * (n - ja))); }
      const pts = [];
      for (let j = ja; j <= jb; j++) {
        const p = P(R[j], sl, (r() - 0.5) * 0.04, (r() - 0.5) * (sl.kind === 'pipe' ? 0.03 : 0.06));
        if (pts.length && sl.kind !== 'pipe') {
          const a = pts[pts.length - 1], span = Math.hypot(p[0] - a[0], p[2] - a[2]);
          let sag = sl.sag * span * span * (0.6 + r() * 0.8);
          if (sl.loop && r() < 0.3) sag += 0.25 + r() * 0.35;
          sag = Math.min(sag, Math.min(a[1], p[1]) - (R[j].yl + 2.0));
          const h = hang(a, p, Math.max(0, sag), pieces(sag));
          pts.push(...h.slice(1));
        } else pts.push(p);
      }
      // the ends: on into the next building, or an elbow into the wall
      const kA = R[ja], kB = R[jb];
      if (ja === 0 && meetStart) pts.unshift(ext(kA, pts[0], -0.3));
      else pts.unshift(wallPt(kA, pts[0][1]));
      if (jb === n - 1 && meetEnd) pts.push(ext(kB, pts[pts.length - 1], 0.3));
      else pts.push(wallPt(kB, pts[pts.length - 1][1]));
      const path = sl.kind === 'pipe' ? roundCorners(pts, 0.07) : roundCorners(pts, 0.04);
      tube((sl.thick ? thick : thin).at(0), path, sl.r, sl.sides, sl.col, info);
    }
    // the brackets: a steel arm from the wall under the pipes, and a strap down the wall
    const col = COL.bracket[b.id % COL.bracket.length];
    R.forEach((k, j) => {
      // an arm under the pipes on every other bracket of a small lane, on each of a named lane
      if (nm || j % 2 === 0) {
        const y = k.lo - 0.05, d = (0.04 + k.depth * 0.75) * k.mit;
        tube(thick.at(0), [[k.x, y, k.z], [k.x + k.nx * d, y, k.z + k.nz * d]], 0.012, 4, col, info);
        tube(thick.at(0), [[k.x + k.nx * 0.012, y - 0.18, k.z + k.nz * 0.012], [k.x + k.nx * 0.012, y + 0.02, k.z + k.nz * 0.012]], 0.01, 4, col, info);
      }
      item(b.id, nm ? 'pipes_named' : 'pipes_lane', k.x + k.nx * k.depth * 0.5, k.z + k.nz * k.depth * 0.5, Math.max(0.6, k.depth));
    });
    // cables across the lane, to the wall in front
    for (let j = 0; j < n; j++) {
      const k = R[j];
      if (r() > (nm ? 0.4 : 0.28) || k.open > 7.5) continue;
      const c = 1 + (r() < 0.35 ? 1 : 0);
      for (let q = 0; q < c; q++) {
        const kind = r() < 0.6 ? 'cable' : 'flex', K2 = KIND[kind], y0 = k.lo + r() * (k.hi - k.lo);
        const sx = k.x + k.nx * 0.03, sz = k.z + k.nz * 0.03, h = walls.hit(sx, sz, k.nx, k.nz, y0, 8);
        if (!Number.isFinite(h.t)) continue;
        let y1 = y0 + (r() - 0.4) * 0.5;
        if (!Number.isFinite(walls.hit(sx, sz, k.nx, k.nz, y1, 8).t)) y1 = y0;
        const t = h.t - 0.02, a = [sx, y0, sz], e = [sx + k.nx * t, y1, sz + k.nz * t];
        const sag = Math.max(0, Math.min(t * (0.05 + r() * 0.12), Math.min(y0, y1) - (k.yl + 2.0)));
        const col2 = shade(COL[kind][Math.floor(r() * COL[kind].length)], 0.85 + r() * 0.25);
        tube(thin.at(0), hang(a, e, sag, pieces(sag) + 1), K2.r[0] + r() * (K2.r[1] - K2.r[0]), K2.sides, col2, info);
        item(b.id, 'cross_wire', sx + k.nx * t * 0.5, sz + k.nz * t * 0.5, Math.max(0.5, t * 0.5));
        // and higher up, from facade to facade: the normal view only
      }
      if (r() < (nm ? 0.25 : 0.18)) highWire(b, k, r);
    }
    // drip sheets on the named lanes, about every 6 m, under the pipes
    if (nm) {
      let next = r() * 4;
      for (const k of R) {
        if (k.s < next || k.open < 1.3) continue;
        next = k.s + 5 + r() * 2.5;
        const w = 0.8 + r() * 0.5, out = Math.min(1.6, k.open * 0.55), y = Math.max(k.yl + 2.15, k.lo - 0.35 - r() * 0.15);
        const a0 = [k.x - k.ux * w / 2 + k.nx * 0.02, y, k.z - k.uz * w / 2 + k.nz * 0.02];
        const a1 = [k.x + k.ux * w / 2 + k.nx * 0.02, y, k.z + k.uz * w / 2 + k.nz * 0.02];
        // slanted down to the wall: the far edge is higher
        sheet(thick.at(0), a0, a1, [k.nx, 0, k.nz], out, -(0.18 + r() * 0.15), COL.sheet[Math.floor(r() * COL.sheet.length)], info);
        item(b.id, 'drip_sheet', k.x + k.nx * out / 2, k.z + k.nz * out / 2, Math.max(0.6, out / 2));
      }
    }
  }

  // A wire high over a lane, from the facade of b over bracket k to the wall in front, at a
  // height of the upper storeys. It joins two buildings: the normal view only.
  function highWire(b, k, r) {
    if (b.n < 3) return;
    const y = b.y[1] + 0.6 + r() * Math.max(0.5, b.top - b.y[1] - 2);
    const lv = levelAt(b, y);
    if (lv < 1 || lv >= b.n) return;
    const near = nearestOnRings(b.phaseOf(lv).rings, k.x, k.z);
    if (!near || near.d > 1.2) return;
    const sx = near.x + near.nx * 0.03, sz = near.z + near.nz * 0.03, h = walls.hit(sx, sz, near.nx, near.nz, y, 10);
    if (!Number.isFinite(h.t) || h.t < 1) return;
    const y1 = y + (r() - 0.5) * 1.2;
    const t = h.t - 0.02;
    if (!Number.isFinite(walls.hit(sx, sz, near.nx, near.nz, y1, 10).t)) return;
    const kind = r() < 0.55 ? 'cable' : 'flex', K2 = KIND[kind];
    const col = shade(COL[kind][Math.floor(r() * COL[kind].length)], 0.85 + r() * 0.25);
    tube(spans, hang([sx, y, sz], [sx + near.nx * t, y1, sz + near.nz * t], t * (0.06 + r() * 0.12), 5), K2.r[0] + r() * (K2.r[1] - K2.r[0]), K2.sides, col, [-1, 0, 0]);
  }

  // ---- down the facades: pipes from the roof to the lane, between the windows ----
  function risers(b, r) {
    const ph1 = b.phaseOf(1), info0 = (k) => [b.id, k, PIPE_KIND];
    // the places between the windows on the walls to the open air (the rule of
    // src/city/mesh.js: one window for each 2.2 m)
    const cand = [];
    let open = 0;
    for (const ring of ph1.rings) {
      if (ring.hole) continue;
      const m = ring.pts.length;
      for (let i = 0; i < m; i++) {
        const lab = ring.other[i];
        if (lab >= 0 || lab < -4) continue; // the open air: a lane, a yard, a road, outside
        const A = ring.pts[i], B = ring.pts[(i + 1) % m], len = Math.hypot(B[0] - A[0], B[1] - A[1]);
        if (len < 2.4) continue;
        open += len;
        const ux = (B[0] - A[0]) / len, uz = (B[1] - A[1]) / len, w = Math.max(1, Math.floor((len - 0.4) / 2.2));
        for (let q = 0; q <= w; q++) {
          const t = Math.max(0.3, Math.min(len - 0.3, (len * q) / w));
          cand.push({ x: A[0] + ux * t, z: A[1] + uz * t, ux, uz, nx: uz, nz: -ux });
        }
      }
    }
    // 2-6 pipes on each facade: a group of 1-3 for each 12 m of open wall, up to 4 groups
    const groups = [], ng = Math.min(4, Math.max(open > 3 ? 1 : 0, Math.round((open / 12) * (0.6 + r() * 0.8))));
    for (let t = 0; t < ng * 4 && groups.length < ng && cand.length; t++) {
      const c = cand[Math.floor(r() * cand.length)];
      if (groups.some((G) => Math.hypot(G.x - c.x, G.z - c.z) < 3)) continue;
      groups.push(c);
    }
    const tank = tanks.has(b.id);
    for (const G of groups) risersAt.push({ b: b.id, x: G.x, z: G.z });
    for (const G of groups) {
      const np = (tank ? 2 : 1) + Math.floor(r() * 2);
      for (let p = 0; p < np; p++) {
        const drain = p === 0 && r() < 0.6, kind = drain ? 'drain' : r() < 0.6 ? 'pipe' : r() < 0.5 ? 'cable' : 'hose';
        const rad = drain ? 0.055 + r() * 0.012 : kind === 'pipe' ? 0.026 + r() * 0.016 : kind === 'cable' ? 0.014 : 0.02;
        const sides = drain ? 5 : kind === 'cable' ? 3 : 4;
        const col = shade((drain ? COL.drain : COL[kind])[Math.floor(r() * (drain ? COL.drain : COL[kind]).length)], 0.85 + r() * 0.25);
        const side = (p - (np - 1) / 2) * 0.12;
        // the storeys that it passes: from the top down, while the wall is there
        let kTop = b.n - 1;
        const at = [];
        for (let k = b.n - 1; k >= 0; k--) {
          const near = nearestOnRings(b.phaseOf(k).rings, G.x, G.z);
          if (!near || near.d > (k === 0 ? 1.6 : 1.1)) { if (k > 0) { at.length = 0; kTop = k - 1; continue; } break; }
          at[k] = near;
        }
        if (!at[kTop] || kTop < 1) continue;
        // where it ends below: a drain goes down to the lane, a water pipe or a cable into a
        // flat (or the G/F ceiling)
        const kLow = drain ? 0 : Math.max(0, Math.floor(r() * Math.min(kTop, 4)));
        const wob = () => (r() < 0.15 ? (r() - 0.5) * 0.16 : 0);
        let lastPt = null;
        for (let k = kTop; k >= kLow; k--) {
          const nr = at[k];
          if (!nr) break;
          const off = rad + 0.03 + (r() < 0.2 ? 0.04 : 0), s = side + wob();
          const px = nr.x + nr.nx * off + nr.ux * s, pz = nr.z + nr.nz * off + nr.uz * s;
          const yTop = k === kTop ? b.y[k + 1] - 0.02 : b.y[k + 1], yBot = k === kLow && !drain ? b.y[k] + 0.5 + r() * 1.2 : k === 0 ? (walls.laneY(px + nr.nx * 0.5, pz + nr.nz * 0.5, 1) ?? b.g0) + 0.02 : b.y[k];
          const pts = [];
          // a jog where the wall of this storey stands apart from the wall over it
          const jog = lastPt && Math.hypot(lastPt[0] - px, lastPt[2] - pz) > 0.02;
          if (jog) pts.push([lastPt[0], yTop + 0.001, lastPt[2]], [lastPt[0], yTop - 0.12, lastPt[2]]);
          pts.push([px, yTop - (jog ? 0.2 : 0), pz]);
          if (k === kLow && !drain) pts.push([px, yBot, pz], [nr.x + nr.nx * 0.01 + nr.ux * s, yBot, nr.z + nr.nz * 0.01 + nr.uz * s]);
          else pts.push([px, Math.max(yBot, b.y[k] - (k === 0 ? 2 : 0)), pz]);
          // a clamp at the middle of the storey
          const ym = (yTop + Math.max(yBot, b.y[k])) / 2;
          const A = (kind === 'cable' || kind === 'hose' ? thin : thick).at(k);
          tube(A, roundCorners(pts, 0.06), rad, sides, col, info0(k));
          if (k % 2 === 0) tube(thick.at(k), [[px, ym - 0.03, pz], [px, ym + 0.03, pz]], rad + 0.012, 4, shade(col, 0.8), info0(k));
          lastPt = [px, 0, pz];
        }
        // the top: over the roof edge, a gooseneck onto the roof (the tank pipes)
        if (kTop === b.n - 1 && !b.pitched) {
          const nr = at[kTop], px = nr.x + nr.nx * (rad + 0.03) + nr.ux * side, pz = nr.z + nr.nz * (rad + 0.03) + nr.uz * side;
          const h = b.parapet ? 1.2 : 0.35;
          tube(thick.at(b.n), roundCorners([[px, b.top - 0.15, pz], [px, b.top + h, pz], [px - nr.nx * 0.5, b.top + h, pz - nr.nz * 0.5], [px - nr.nx * 0.5, b.top + 0.05, pz - nr.nz * 0.5]], 0.1), rad, sides, col, info0(b.n));
        }
      }
      item(b.id, 'wall_pipes', G.x + G.nx * 0.1, G.z + G.nz * 0.1, 0.4, 0, b.n);
    }
  }

  // ---- cables from roof to roof, on poles ----
  function roofCables() {
    const roofs = S.list.filter((b) => !b.pitched && b.roofOpen && b.n >= 2 && b.kind !== 'yamen');
    const done = new Set();
    for (const b of roofs) {
      const r = mulberry32((b.id * 40503 + 11) >>> 0), n = Math.floor(r() * 3);
      const near = roofs.filter((c) => c !== b && Math.hypot(c.cx - b.cx, c.cz - b.cz) < 16).sort(() => r() - 0.5);
      for (let q = 0; q < n && q < near.length; q++) {
        const c = near[q], key = b.id < c.id ? `${b.id}:${c.id}` : `${c.id}:${b.id}`;
        if (done.has(key)) continue;
        done.add(key);
        const pa = roofPoint(b, r), pc = roofPoint(c, r);
        if (!pa || !pc) continue;
        const ha = 1.6 + r() * 2.2, hc = 1.6 + r() * 2.2;
        const a = [pa[0], b.top + ha, pa[1]], e = [pc[0], c.top + hc, pc[1]];
        const span = Math.hypot(e[0] - a[0], e[2] - a[2]), sag = span * (0.04 + r() * 0.08);
        const path = hang(a, e, sag, 10);
        if (path.some((p) => solid(p[0], p[1], p[2]))) continue;
        const kind = r() < 0.6 ? 'cable' : 'flex', K2 = KIND[kind];
        tube(spans, path, K2.r[0] + r() * (K2.r[1] - K2.r[0]), K2.sides, shade(COL[kind][Math.floor(r() * COL[kind].length)], 0.9), [-1, 0, 0]);
        // the poles: bamboo or steel, in the roof layer of each building
        for (const [B, p, h] of [[b, pa, ha], [c, pc, hc]]) {
          tube(thick.at(B.n), [[p[0], B.top, p[1]], [p[0], B.top + h + 0.25, p[1]]], 0.025, 5, COL.pole[Math.floor(r() * COL.pole.length)], [B.id, B.n, PIPE_KIND]);
          item(B.id, 'roof_cable', p[0], p[1], 0.4, B.n);
        }
      }
    }
  }
  // A point on the roof of b, near its edge, away from the stair huts and the roof room.
  function roofPoint(b, r) {
    const rings = b.phases[b.phases.length - 1].rings, ring = rings.find((x) => !x.hole);
    if (!ring) return null;
    const huts = [...b.stairs.map((st) => [st.a0, st.a1, st.w0, st.w1]), ...(b.roofRoom ? [[b.roofRoom.a0, b.roofRoom.a1, b.roofRoom.w0, b.roofRoom.w1]] : [])];
    for (let t = 0; t < 8; t++) {
      const V = ring.pts[Math.floor(r() * ring.pts.length)], f = 0.12 + r() * 0.15;
      const x = V[0] + (b.cx - V[0]) * f, z = V[1] + (b.cz - V[1]) * f, [a, w] = toAW(b.F, x, z);
      if (!inRings(rings.map((q) => q.pts), x, z) || huts.some(([a0, a1, w0, w1]) => a > a0 - 1 && a < a1 + 1 && w > w0 - 1 && w < w1 + 1)) continue;
      return [x, z];
    }
    return null;
  }
  // Is (x, y, z) inside a building?
  function solid(x, y, z) {
    const i = Math.floor(x - L.x0), j = Math.floor(z - L.z0);
    if (i < 0 || j < 0 || i >= L.W || j >= L.D) return false;
    const o = L.owner[j * L.W + i];
    return o >= 0 && !!S.fills(o, y);
  }

  return { thick, thin, spans, items, risers: risersAt };
}

// The nearest point to (x, z) on the walls of rings, with the outward normal and the direction
// of its wall; d: the distance.
export function nearestOnRings(rings, x, z) {
  let best = null;
  for (const ring of rings) {
    if (ring.hole) continue;
    const m = ring.pts.length;
    for (let i = 0; i < m; i++) {
      const A = ring.pts[i], B = ring.pts[(i + 1) % m], ex = B[0] - A[0], ez = B[1] - A[1], l2 = ex * ex + ez * ez;
      if (l2 < 1e-6) continue;
      const t = Math.max(0, Math.min(1, ((x - A[0]) * ex + (z - A[1]) * ez) / l2)), px = A[0] + ex * t, pz = A[1] + ez * t;
      const d = Math.hypot(x - px, z - pz);
      if (!best || d < best.d) { const l = Math.sqrt(l2); best = { x: px, z: pz, d, ux: ex / l, uz: ez / l, nx: ez / l, nz: -ex / l }; }
    }
  }
  return best;
}
