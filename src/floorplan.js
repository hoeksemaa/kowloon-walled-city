// Floor plans: stairs, corridors and units in each block, for the cut view and for homes.
//
// SOURCED: Suenn Ho's stair types, among them a stair in the centre or at the side, a
// corridor with a stair at each end, and stairs that two or three buildings share
// (City of Darkness Revisited, pp138-139); "28,200 occupants residing in 8800 separate
// apartments" in January 1987 (p340); flats of 200-300 sq ft (WSJ fact boxes, 2014);
// workshops of about 480 and 600 sq ft (pp169, 292); the 4/F flat of 6 Sai Shing Road,
// measured on 9 Nov 1987: a living room, two cubicles, a kitchen, a toilet and two bed spaces
// (p340); a shared 5/F where three stairs meet (p340). INFERRED: where each stair and
// corridor runs and where the units divide. Every home floor of a block has the same plan,
// and so has every work floor.
//
// Each block (one plot of the traced plan) is laid out in its own frame: a runs along its
// main axis, w across it. A corridor runs along a in straight legs, with a jog where the
// block bends; units are slots along the corridor. Every unit meets the corridor or a stair.
import { clipLine } from './footprint.js';

const CORE_A = 3.0, CORE_W = 2.4; // a dog-leg stair: two flights of about 1.1 m and a landing
const BAND = 1.2; // corridor width
export const WORK_AREA = 50; // m2, a workshop of 480-600 sq ft
const FLOOR = (f) => (f === 0 ? 'G/F' : `${f}/F`);
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

// The frame is the smallest box round the block, with a along its long side. In a block
// with slanted ends, the box then follows the long walls, and a corridor along a stays
// inside the block.
export function frameOf(b) {
  if (b.F) return b.F;
  const box = ([ux, uz]) => {
    const px = -uz, pz = ux;
    let a0 = Infinity, a1 = -Infinity, w0 = Infinity, w1 = -Infinity;
    for (const r of b.rings)
      for (const [x, z] of r.pts) {
        const a = x * ux + z * uz, w = x * px + z * pz;
        a0 = Math.min(a0, a); a1 = Math.max(a1, a); w0 = Math.min(w0, w); w1 = Math.max(w1, w);
      }
    return a1 - a0 >= w1 - w0 ? { ux, uz, px, pz, a0, a1, w0, w1 } : { ux: px, uz: pz, px: -ux, pz: -uz, a0: w0, a1: w1, w0: -a1, w1: -a0 };
  };
  let best = box(b.axis), area = (best.a1 - best.a0) * (best.w1 - best.w0);
  for (const r of b.rings)
    for (const e of r.edges) {
      const dx = e.b[0] - e.a[0], dz = e.b[1] - e.a[1], l = Math.hypot(dx, dz);
      if (l < 2) continue;
      const F = box([dx / l, dz / l]), s = (F.a1 - F.a0) * (F.w1 - F.w0);
      if (s < area - 0.5) { best = F; area = s; }
    }
  b.F = best;
  return b.F;
}
export const toXZ = (F, a, w) => [F.ux * a + F.px * w, F.uz * a + F.pz * w];
const toAW = (F, x, z) => [x * F.ux + z * F.uz, x * F.px + z * F.pz];

// The block across a, at a: [w0, w1] of the widest piece, or null.
function spanAt(b, F, a) {
  const iv = clipLine(b.rings, toXZ(F, a, 0), [F.px, F.pz]);
  return iv.length ? iv.reduce((p, q) => (q[1] - q[0] > p[1] - p[0] ? q : p)) : null;
}

// The corridor: straight legs along a. A leg runs in the middle of the block (double) or
// along its wall (single, side 'low' or 'high'). Where the block bends, the next leg starts
// with a jog. Each leg: { a0, a1, w0, w1, wall, inner }; wall is the w of the block wall
// (null in the middle), and inner is the wall's line farthest into the block.
function corridorLegs(b, F, side) {
  const key = (lw) => (side === 'mid' ? (lw[0] + lw[1]) / 2 : side === 'low' ? lw[0] : lw[1]);
  let legs = [];
  for (let a = F.a0 + 0.5; a < F.a1; a += 1) {
    const lw = spanAt(b, F, a);
    if (!lw) continue;
    const k = key(lw), L = legs[legs.length - 1];
    if (L && Math.max(L.kmax, k) - Math.min(L.kmin, k) <= 1.2) { L.kmin = Math.min(L.kmin, k); L.kmax = Math.max(L.kmax, k); L.a1 = a + 0.5; }
    else legs.push({ a0: a - 0.5, a1: a + 0.5, kmin: k, kmax: k });
  }
  // A leg shorter than 4 m joins the neighbour nearest in w, and keeps its line.
  for (let j = 0; legs.length > 1 && j < legs.length; ) {
    if (legs[j].a1 - legs[j].a0 >= 4) { j++; continue; }
    const c = legs[j], km = (c.kmin + c.kmax) / 2, d = (L) => (L ? Math.abs((L.kmin + L.kmax) / 2 - km) : Infinity);
    const n = d(legs[j - 1]) <= d(legs[j + 1]) ? j - 1 : j + 1, L = legs[n];
    L.a0 = Math.min(L.a0, c.a0); L.a1 = Math.max(L.a1, c.a1);
    legs.splice(j, 1);
    j = 0;
  }
  legs = legs.map((L) => {
    const m = (L.kmin + L.kmax) / 2;
    // A single corridor runs from the block wall to BAND past the wall's mean line.
    if (side === 'mid') return { a0: L.a0, a1: L.a1, w0: m - BAND / 2, w1: m + BAND / 2, wall: null };
    if (side === 'low') return { a0: L.a0, a1: L.a1, w0: L.kmin, w1: m + BAND, wall: L.kmin, inner: L.kmax };
    return { a0: L.a0, a1: L.a1, w0: m - BAND, w1: L.kmax, wall: L.kmax, inner: L.kmin };
  });
  if (legs.length) { legs[0].a0 = F.a0 - 1; legs[legs.length - 1].a1 = F.a1 + 1; }
  return legs.length ? legs : null;
}
export const legAt = (legs, a) => legs.find((L) => a < L.a1) || legs[legs.length - 1];

// Stairs. A block with a lane frontage and room for a stair gets its own; a long block
// gets one at each end. A block with no frontage shares the stair of a neighbour: in its
// own tower if it can, or else in the next tower.
export function setupCores(L) {
  const B = L.buildings, W = L.W;
  for (const b of B) {
    b.cores = [];
    b.band = null;
    b.shareWith = -1;
    b.layout = 'room';
    if (b.kind === 'yamen' || !b.rings.length) continue;
    const F = frameOf(b);
    const da = F.a1 - F.a0, dw = F.w1 - F.w0, area = b.cells.length;
    if (b.floors <= 2 || area < 24) continue;
    b.layout = da < 8 || area < 40 || dw < 5 ? 'none' : dw >= 8.5 ? 'double' : 'single';
    const [sa, sw] = toAW(F, L.cellX(b.stair), L.cellZ(b.stair));
    const lw = spanAt(b, F, Math.min(Math.max(sa, F.a0 + 0.5), F.a1 - 0.5)) || [F.w0, F.w1];
    const low = sw - lw[0] < lw[1] - sw;
    if (b.layout !== 'none') b.band = corridorLegs(b, F, b.layout === 'double' ? 'mid' : low ? 'low' : 'high');
    if (!b.band && b.layout !== 'none') b.layout = 'none';
    if (!b.edge.length) continue; // no frontage: shares a stair, below
    const ac = (a) => Math.min(Math.max(a, F.a0 + CORE_A / 2), F.a1 - CORE_A / 2);
    const at = da > 26 && b.layout !== 'none' ? [F.a0 + 1.8, F.a1 - 1.8] : [sa];
    for (const a of at) {
      const c = ac(a);
      let wr;
      if (b.layout === 'none') {
        // A narrow block: the stair runs across it (the tong lau plan) and splits it in two.
        const [w0, w1] = spanAt(b, F, c) || [F.w0, F.w1];
        wr = w1 - w0 < CORE_W + 1.5 ? [w0, w1] : low ? [w0, w0 + CORE_W] : [w1 - CORE_W, w1];
      } else {
        // Beside the corridor, on the side of the stair cell.
        const G = legAt(b.band, c), up = b.layout === 'double' ? sw >= (G.w0 + G.w1) / 2 : low;
        wr = up ? [G.w1, G.w1 + CORE_W] : [G.w0 - CORE_W, G.w0];
      }
      b.cores.push({ a0: c - CORE_A / 2, a1: c + CORE_A / 2, w0: wr[0], w1: wr[1], k: -1 });
    }
    for (const c of b.cores) {
      // The cell where people go up and down: the one nearest the middle of the stair.
      const [mx, mz] = toXZ(F, (c.a0 + c.a1) / 2, (c.w0 + c.w1) / 2);
      let best = b.cells[0], bd = Infinity;
      for (const k of b.cells) {
        const d = (L.cellX(k) - mx) ** 2 + (L.cellZ(k) - mz) ** 2;
        if (d < bd) { bd = d; best = k; }
      }
      c.k = best;
    }
    b.stair = b.cores[0].k;
  }
  // Blocks with no stair of their own: a door through the party wall to the neighbour's.
  for (const b of B) {
    if (b.cores.length || b.kind === 'yamen' || b.floors <= 2) continue;
    const opts = new Map();
    for (const k of b.cells)
      for (const n of [k - 1, k + 1, k - W, k + W]) {
        const o = L.owner[n];
        if (o < 0 || o === b.id || !B[o].cores.length) continue;
        if (!opts.has(o)) opts.set(o, [k, n]);
      }
    let best = null, bs = -Infinity;
    for (const [o, pair] of opts) {
      const s = (B[o].tower === b.tower ? 100 : 0) + Math.min(B[o].floors, b.floors) - (B[o].floors < b.floors ? 50 : 0);
      if (s > bs) { bs = s; best = { o, pair }; }
    }
    if (!best) continue;
    b.shareWith = best.o;
    b.stair = B[best.o].cores[0].k;
    const [k, n] = best.pair;
    b.shareDoor = [(L.cellX(k) + L.cellX(n)) / 2, (L.cellZ(k) + L.cellZ(n)) / 2];
  }
}

// The plan of one kind of floor ('home' or 'work') of block b, with units of about T m2.
export function makePlan(L, b, T, kind) {
  const F = frameOf(b);
  const n = b.cells.length;
  const P = { kind, T, units: [], cell: new Int16Array(n).fill(-1), band: b.band, cores: b.cores };
  const aw = b.cells.map((k) => toAW(F, L.cellX(k), L.cellZ(k)));
  const inCore = (a, w) => b.cores.some((c) => a >= c.a0 && a < c.a1 && w >= c.w0 && w < c.w1);
  const inBand = (a, w) => { if (!b.band) return false; const G = legAt(b.band, a); return w >= G.w0 && w < G.w1; };
  // Sides of the corridor: below it in w, above it, or (no corridor) all of the block.
  const sides = b.layout === 'double' ? ['below', 'above'] : b.layout === 'single' ? [b.band[0].wall === b.band[0].w0 ? 'above' : 'below'] : ['all'];
  const sideOf = (a, w) => {
    const G = b.band && legAt(b.band, a);
    return sides.findIndex((s) => s === 'all' || (s === 'below' ? w < G.w0 : w >= G.w1));
  };
  // The unit's w range at a: from the corridor to the block wall.
  const wRange = (s, a) => {
    const lw = spanAt(b, F, a) || [F.w0, F.w1], G = b.band && legAt(b.band, a);
    return sides[s] === 'all' ? lw : sides[s] === 'below' ? [Math.min(lw[0], G.w0), G.w0] : [G.w1, Math.max(lw[1], G.w1)];
  };
  const cellsOf = sides.map(() => []);
  for (let i = 0; i < n; i++) {
    const [a, w] = aw[i];
    if (inCore(a, w)) { P.cell[i] = -2; continue; }
    if (inBand(a, w)) { P.cell[i] = -1; continue; }
    const s = sideOf(a, w);
    if (s >= 0) cellsOf[s].push(i);
  }
  sides.forEach((side, s) => {
    const list = cellsOf[s].sort((i, j) => aw[i][0] - aw[j][0]);
    if (!list.length) return;
    // The stairs on this side cut it into runs. A short run joins the next one, round the
    // stair.
    const cuts = b.cores.filter((c) => side === 'all' || sideOf((c.a0 + c.a1) / 2, (c.w0 + c.w1) / 2) === s).map((c) => (c.a0 + c.a1) / 2).sort((x, y) => x - y);
    let runs = cuts.concat(Infinity).map((hi, r) => ({ lo: r ? cuts[r - 1] : -Infinity, hi, cells: [] }));
    for (const i of list) runs.find((R) => aw[i][0] < R.hi).cells.push(i);
    runs = runs.filter((R) => R.cells.length);
    for (let r = 0; runs.length > 1 && r < runs.length; ) {
      if (runs[r].cells.length >= 0.6 * T) { r++; continue; }
      const j = r === 0 ? 1 : r === runs.length - 1 ? r - 1 : runs[r - 1].cells.length < runs[r + 1].cells.length ? r - 1 : r + 1;
      const [p, q] = j < r ? [runs[j], runs[r]] : [runs[r], runs[j]];
      runs.splice(Math.min(r, j), 2, { lo: p.lo, hi: q.hi, cells: [...p.cells, ...q.cells].sort((x, y) => aw[x][0] - aw[y][0]) });
      r = 0;
    }
    runs.forEach(({ lo, hi, cells: run }) => {
      const m = Math.max(1, Math.round(run.length / T));
      // Equal-area slots: cut between the sorted cells.
      const bounds = [lo];
      for (let q = 1; q < m; q++) {
        const idx = Math.round((q * run.length) / m);
        bounds.push((aw[run[idx - 1]][0] + aw[run[idx]][0]) / 2);
      }
      bounds.push(hi);
      for (let q = 0; q < m; q++) {
        const cells = run.filter((i) => aw[i][0] >= bounds[q] && aw[i][0] < bounds[q + 1]);
        if (!cells.length) continue;
        // At the ends of the block, the slot stops at its last cells.
        const ca0 = Math.min(...cells.map((i) => aw[i][0])) - 0.5, ca1 = Math.max(...cells.map((i) => aw[i][0])) + 0.5;
        const a0 = bounds[q] === -Infinity ? ca0 : bounds[q], a1 = bounds[q + 1] === Infinity ? ca1 : bounds[q + 1];
        const [w0, w1] = wRange(s, (a0 + a1) / 2);
        const u = { id: P.units.length, side: s, where: side, a0, a1, w0, w1, cells: cells.map((i) => b.cells[i]), area: cells.length };
        for (const i of cells) P.cell[i] = u.id;
        P.units.push(u);
      }
    });
  });
  P.index = new Map(b.cells.map((k, i) => [k, i]));
  const W = L.W, nb = (k) => [k - 1, k + 1, k - W, k + W];
  const unitOf = (k) => P.units[P.cell[P.index.get(k)]];
  // Cells beside a stair but in no slot: the nearest unit takes them.
  for (let i = 0; i < n; i++) {
    if (P.cell[i] !== -1 || inBand(...aw[i])) continue;
    let best = -1, bd = Infinity;
    for (const u of P.units) {
      const d = Math.max(0, u.a0 - aw[i][0], aw[i][0] - u.a1) + Math.max(0, u.w0 - aw[i][1], aw[i][1] - u.w1);
      if (d < bd) { bd = d; best = u.id; }
    }
    if (best >= 0) { P.cell[i] = best; P.units[best].cells.push(b.cells[i]); P.units[best].area++; }
  }
  // A stray piece of a unit, cut off by a stair or a jog, joins the unit next to it. A small
  // piece with no unit next to it is a nook of the corridor.
  const exit = (j) => j !== undefined && (P.cell[j] === -2 || (P.cell[j] === -1 && inBand(...aw[j])));
  for (const u of P.units) {
    const left = new Set(u.cells), parts = [];
    while (left.size) {
      const [k0] = left, part = [k0];
      left.delete(k0);
      for (let j = 0; j < part.length; j++)
        for (const m of [...nb(part[j]), part[j] - W - 1, part[j] - W + 1, part[j] + W - 1, part[j] + W + 1]) if (left.delete(m)) part.push(m);
      parts.push(part);
    }
    parts.sort((p, q) => q.length - p.length);
    for (const part of parts.slice(1)) {
      let to = null;
      for (const k of part) for (const m of nb(k)) { const v = unitOf(m); if (v && v !== u && (!to || (v.side === u.side && to.side !== u.side))) to = v; }
      const nook = !to && part.length <= 4 && part.some((k) => nb(k).some((m) => exit(P.index.get(m))));
      if (!to && !nook) continue;
      const set = new Set(part);
      u.cells = u.cells.filter((k) => !set.has(k)); u.area -= part.length;
      if (to) { to.cells.push(...part); to.area += part.length; }
      for (const k of part) P.cell[P.index.get(k)] = to ? to.id : -1;
    }
  }
  if (!P.units.length) {
    // A block with no slot (a hut, a small shop): one room.
    const u = { id: 0, side: 0, where: 'all', a0: F.a0, a1: F.a1, w0: F.w0, w1: F.w1, cells: b.cells.filter((k, i) => P.cell[i] !== -2), area: 0 };
    u.area = u.cells.length;
    for (let i = 0; i < n; i++) if (P.cell[i] !== -2) P.cell[i] = 0;
    P.units.push(u);
  }
  // A unit that meets neither the corridor nor a stair joins a neighbour that does.
  const meets = (u) => u.cells.some((k) => nb(k).some((m) => exit(P.index.get(m))));
  for (let again = b.cores.length || b.band; again; ) {
    again = false;
    for (const u of P.units) {
      if (P.units.length < 2 || meets(u)) continue;
      let to = null;
      for (const k of u.cells)
        for (const m of nb(k)) {
          const v = P.units[P.cell[P.index.get(m)]];
          if (v && v !== u && meets(v) && (!to || (v.side === u.side) > (to.side === u.side) || ((v.side === u.side) === (to.side === u.side) && v.area < to.area))) to = v;
        }
      if (!to) continue;
      to.cells.push(...u.cells); to.area += u.area;
      to.a0 = Math.min(to.a0, u.a0); to.a1 = Math.max(to.a1, u.a1);
      P.units.splice(P.units.indexOf(u), 1);
      P.units.forEach((v, i) => { v.id = i; for (const k of v.cells) P.cell[P.index.get(k)] = i; });
      again = true;
      break;
    }
  }
  // The door: on the corridor, near one end of the slot, at a cell next to the corridor;
  // or else on the face of the stair.
  for (const u of P.units) {
    const want = u.a0 + (u.a1 - u.a0) * (u.id % 2 ? 0.12 : 0.88);
    let best = null, bd = Infinity;
    if (sides[u.side] !== 'all')
      for (const k of u.cells) {
        const i = P.index.get(k);
        if (!nb(k).some((m) => { const j = P.index.get(m); return j !== undefined && P.cell[j] === -1 && inBand(...aw[j]); })) continue;
        const d = Math.abs(aw[i][0] - want);
        if (d < bd) { bd = d; best = aw[i][0]; }
      }
    if (best !== null) {
      const G = legAt(b.band, best), a = Math.min(Math.max(best, G.a0 + 0.5), G.a1 - 0.5);
      u.door = { axis: 'w', w: sides[u.side] === 'below' ? G.w0 : G.w1, a };
    } else if (b.cores.length) {
      const c = b.cores.reduce((p, q) => (Math.abs((q.a0 + q.a1) / 2 - (u.a0 + u.a1) / 2) < Math.abs((p.a0 + p.a1) / 2 - (u.a0 + u.a1) / 2) ? q : p));
      const before = (u.a0 + u.a1) / 2 < (c.a0 + c.a1) / 2;
      u.door = { axis: 'a', a: before ? c.a0 : c.a1, w: (c.w0 + c.w1) / 2 };
    }
  }
  P.units.forEach((u, i) => (u.letter = LETTERS[i % LETTERS.length] + (i >= LETTERS.length ? Math.floor(i / LETTERS.length) : '')));
  return P;
}

export const planAt = (b, f) => (b.plans ? (b.uses[f] === 'home' ? b.plans.home : b.plans.work) : null);

// The unit of block b at storey f that holds cell k: { plan, u } (u: unit, or null for the
// corridor or the stair).
export function unitAt(b, f, k) {
  const P = planAt(b, f);
  if (!P) return null;
  const i = P.index.get(k);
  if (i === undefined) return null;
  const v = P.cell[i];
  return { plan: P, u: v >= 0 ? P.units[v] : null, part: v === -1 ? 'corridor' : v === -2 ? 'stair' : 'unit' };
}

export function unitName(b, f, u) {
  const P = planAt(b, f);
  if (!P || !u) return FLOOR(f);
  const note = b.unitNotes && b.unitNotes[`${f}:${u.id}`];
  if (note && note.name) return note.name;
  return P.kind === 'home' ? `Flat ${u.letter}, ${FLOOR(f)}` : `Rm ${u.id + 1}, ${FLOOR(f)}`;
}

// Lines and floor patches for the cut view of block b at storey f, in plan x, z:
// walls [x0, z0, x1, z1], fine (cubicle and bed-space walls), treads, and plates
// [[x, z] x4, colour key].
export function planDrawing(L, b, f) {
  const P = planAt(b, f);
  const out = { walls: [], fine: [], treads: [], plates: [] };
  if (!P || !b.rings.length) return out;
  const F = frameOf(b);
  const along = (w, a0, a1, gaps, list) => {
    // A wall along a, at w, from a0 to a1, inside the block, minus the gaps.
    const P0 = toXZ(F, 0, w);
    for (const [t0, t1] of clipLine(b.rings, P0, [F.ux, F.uz])) {
      let segs = [[Math.max(t0, a0), Math.min(t1, a1)]];
      for (const [g0, g1] of gaps) segs = segs.flatMap(([s0, s1]) => (g1 <= s0 || g0 >= s1 ? [[s0, s1]] : [[s0, g0], [g1, s1]]));
      for (const [s0, s1] of segs) if (s1 - s0 > 0.15) list.push([...toXZ(F, s0, w), ...toXZ(F, s1, w)]);
    }
  };
  const across = (a, w0, w1, gaps, list) => {
    const P0 = toXZ(F, a, 0);
    for (const [t0, t1] of clipLine(b.rings, P0, [F.px, F.pz])) {
      let segs = [[Math.max(t0, w0), Math.min(t1, w1)]];
      for (const [g0, g1] of gaps) segs = segs.flatMap(([s0, s1]) => (g1 <= s0 || g0 >= s1 ? [[s0, s1]] : [[s0, g0], [g1, s1]]));
      for (const [s0, s1] of segs) if (s1 - s0 > 0.15) list.push([...toXZ(F, a, s0), ...toXZ(F, a, s1)]);
    }
  };
  const quad = (a0, a1, w0, w1, key) => out.plates.push([[toXZ(F, a0, w0), toXZ(F, a1, w0), toXZ(F, a1, w1), toXZ(F, a0, w1)], key]);

  // The corridor, leg by leg: its floor and its walls, open at the doors and at the stairs,
  // with a jog where one leg meets the next.
  const legs = P.band || [];
  legs.forEach((G, j) => {
    const lo = G.wall === G.w0 ? G.inner : G.w0, hi = G.wall === G.w1 ? G.inner : G.w1;
    for (const [t0, t1] of clipLine(b.rings, toXZ(F, 0, (lo + hi) / 2), [F.ux, F.uz]))
      if (Math.min(t1, G.a1) > Math.max(t0, G.a0)) quad(Math.max(t0, G.a0), Math.min(t1, G.a1), lo, hi, 'corridor');
    for (const edge of [G.w0, G.w1]) {
      if (edge === G.wall) continue;
      const gaps = [];
      for (const u of P.units) if (u.door && u.door.axis === 'w' && u.door.w === edge) gaps.push([u.door.a - 0.45, u.door.a + 0.45]);
      for (const c of P.cores) if (Math.abs(c.w0 - edge) < 1e-6 || Math.abs(c.w1 - edge) < 1e-6) gaps.push([c.a0, c.a1]);
      along(edge, G.a0, G.a1, gaps, out.walls);
      const N = legs[j + 1], e2 = N && (edge === G.w0 ? N.w0 : N.w1);
      if (N && Math.abs(e2 - edge) > 0.05) across(G.a1, Math.min(edge, e2), Math.max(edge, e2), [], out.walls);
    }
  });
  // Walls between units on the same side, round any stair that they meet at.
  for (const u of P.units) {
    const next = P.units.find((v) => v.side === u.side && Math.abs(v.a0 - u.a1) < 1e-6);
    if (!next) continue;
    const gaps = P.cores.filter((c) => c.a0 < u.a1 && c.a1 > u.a1).map((c) => [c.w0, c.w1]);
    const lw = spanAt(b, F, u.a1) || [u.w0, u.w1], G = legs.length && legAt(legs, u.a1);
    const [w0, w1] = u.where === 'below' ? [lw[0], G.w0] : u.where === 'above' ? [G.w1, lw[1]] : lw;
    across(u.a1, w0, w1, gaps, out.walls);
  }
  // Stairs: the core walls, a wall between the flights, the treads, and the landing.
  for (const c of P.cores) {
    quad(c.a0, c.a1, c.w0, c.w1, 'stair');
    const gapsW = [];
    for (const u of P.units) if (u.door && u.door.axis === 'a' && (Math.abs(u.door.a - c.a0) < 1e-6 || Math.abs(u.door.a - c.a1) < 1e-6)) gapsW.push([u.door.w - 0.45, u.door.w + 0.45, u.door.a]);
    for (const w of [c.w0, c.w1]) {
      const open = legs.some((G) => Math.abs(w - G.w0) < 1e-6 || Math.abs(w - G.w1) < 1e-6);
      const lw = spanAt(b, F, (c.a0 + c.a1) / 2);
      if (!open && !(lw && (Math.abs(w - lw[0]) < 0.3 || Math.abs(w - lw[1]) < 0.3))) along(w, c.a0, c.a1, [], out.walls);
    }
    for (const a of [c.a0, c.a1]) across(a, c.w0, c.w1, gapsW.filter((g) => Math.abs(g[2] - a) < 1e-6).map((g) => [g[0], g[1]]), out.walls);
    const wm = (c.w0 + c.w1) / 2, land = c.a1 - 0.9;
    out.fine.push([...toXZ(F, c.a0, wm), ...toXZ(F, land, wm)]);
    for (let a = c.a0 + 0.27; a < land; a += 0.27) {
      out.treads.push([...toXZ(F, a, c.w0 + 0.08), ...toXZ(F, a, wm - 0.05)]);
      out.treads.push([...toXZ(F, a, wm + 0.05), ...toXZ(F, a, c.w1 - 0.08)]);
    }
  }
  // Flats: cubicles and bed spaces after the 1987 survey plan (p340), fitted to the slot.
  if (P.kind === 'home')
    for (const u of P.units) if (u.door) fitFlat(F, u, P.cores, !!(b.unitNotes && b.unitNotes[`${f}:${u.id}`]), out.fine);
  return out;
}

// The 4/F flat of 6 Sai Shing Road (p340), in metres: x along the outer wall, y from the
// outer wall (0) to the door wall (5.38). Walls, with the openings left out.
const FLAT = {
  w: 4.6, d: 5.38,
  walls: [
    [2.2, 0, 2.2, 1.62], // cubicle C | kitchen D
    [0, 1.64, 1.2, 1.64], [1.9, 1.64, 2.16, 1.64], // cubicle C, curtain gap
    [3.6, 0, 3.6, 1.62], [3.6, 1.62, 3.85, 1.62], [4.35, 1.62, 4.6, 1.62], // toilet E
    [0, 2.44, 0.9, 2.44], [1.5, 2.44, 1.55, 2.44], [1.55, 3.05, 1.55, 5.38], // cubicle B
    [1.6, 3.0, 3.36, 3.0], [1.6, 3.69, 3.36, 3.69], // bed space G
    [1.6, 4.2, 3.32, 4.2], // bed space F
  ],
};
function fitFlat(F, u, cores, force, list) {
  // x runs along the door wall, y from the far wall to the door wall.
  const d = u.door;
  let along, depth, at, pt;
  if (d.axis === 'w') {
    along = [u.a0, u.a1]; depth = [Math.abs(d.w - u.w1) < Math.abs(d.w - u.w0) ? u.w0 : u.w1, d.w]; at = d.a;
    pt = (s, t) => toXZ(F, s, t);
  } else {
    along = [u.w0, u.w1]; depth = [Math.abs(d.a - u.a1) < Math.abs(d.a - u.a0) ? u.a0 : u.a1, d.a]; at = d.w;
    pt = (s, t) => toXZ(F, t, s);
  }
  const wa = along[1] - along[0], dd = Math.abs(depth[1] - depth[0]);
  if (!force && (wa < 3.2 || wa > 7.5 || dd < 3.6 || dd > 8.5)) return;
  const [ra0, ra1, rw0, rw1] = d.axis === 'w'
    ? [along[0], along[1], Math.min(...depth), Math.max(...depth)] : [Math.min(...depth), Math.max(...depth), along[0], along[1]];
  if (cores.some((c) => c.a0 < ra1 - 0.05 && c.a1 > ra0 + 0.05 && c.w0 < rw1 - 0.05 && c.w1 > rw0 + 0.05)) return;
  // The template's door is near its x end: mirror it to meet the unit's door.
  const flip = Math.abs(at - along[0]) < Math.abs(at - along[1]);
  const map = (x, y) => pt(flip ? along[1] - (x / FLAT.w) * wa : along[0] + (x / FLAT.w) * wa, depth[0] + (y / FLAT.d) * (depth[1] - depth[0]));
  for (const [x0, y0, x1, y1] of FLAT.walls) list.push([...map(x0, y0), ...map(x1, y1)]);
}

export { FLOOR as floorName };
