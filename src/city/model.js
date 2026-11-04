// THE DEFINITIVE 3D STRUCTURE OF KOWLOON WALLED CITY (frozen 2026-11-04; docs/structure.md).
// src/city/ is the City alone; src/surroundings/ is the context round it. Do not change the
// structure: tools/check_structure.mjs fails when it changes (data/structure_frozen.json).
//
// The 3D structure of the City: each building with its own ground floor level, its own storey
// heights, its own walls, its own stairs, and a footprint that can change with height. No
// three.js here, thus tools/check_structure.mjs runs it in node.
//
// SOURCED: the plots and the buildings of the 1987 plan (data/plan.json, data/book_overlay.json);
// the storeys of the south face (Lambot's 1990 elevation) and of the north face (City of
// Darkness Revisited, pp132, 336); the ground (data/terrain.json). From the book: a building
// grows over its lower neighbours, and its footprint changes at each step (Suenn Ho, p137);
// stairs in the centre, at the side, at a corner, or in a strip, and stairs that two to four
// buildings share (pp138-139); a 4/F flat and a shared 5/F where three stairs meet (p340); a
// pencil building of one room of about 4.0 m and a stair of about 1.0 m, with walls of about
// 0.2 m (Suzuki's 1993 survey, p209); floors that do not line up from one building to the
// next, a taller ground floor, stair huts on the roofs, and bridges over the light wells
// (Terasawa's cut-away drawing, the fold-out).
//
// INFERRED, and marked so: the storey heights of each building, the storeys away from the two
// faces, which buildings grow over which, the overhangs over the lanes, where each stair runs,
// and the plan of each floor.
import { mulberry32, vnoise, clamp } from '../util.js';
import { SOUTH_PROFILE } from '../layout.js';
import { LANE, YARD, ROAD, OUTSIDE } from '../footprint.js';
import { unionRings, offsetRing, signedArea, toAW, toXZ, segDist, inRings } from './poly.js';
import { placeStairs, planPhase, stairParts, SPINE, innerRings } from './plan.js';
import { buildLinks } from './links.js';
import { makeChoices } from './choices.js';

export const WALL = 0.2; // each building has its own outer walls (p209)
export const SLAB = 0.15;
export const PARAPET = 1.0;
// The share of the flat roofs with a parapet. John's estimate (2026-11-03): about 20 % of the
// roofs had one; the bronze model in the park shows most roofs with a plain edge. Which roofs
// have one is INFERRED (a hash of the building's key).
export const PARAPET_RATE = 0.2;
export const HUT = 2.4; // a stair hut on the roof, floor to roof
export const STEP = 0.15; // the G/F floor is one step over the lane at the main door
export const TERRACE = -10; // the label of a wall that a setback leaves on the roof below

// The label of a ring edge: a plot id (0 or more), or one of these.
export const OPEN = new Set([LANE, YARD, ROAD, OUTSIDE, TERRACE]);
const LABEL_WEIGHT = { [OUTSIDE]: 2.0, [ROAD]: 1.5, [LANE]: 1.0, [YARD]: 0.7 };

// The frame of a set of rings: the smallest box round them, with a along its long side.
export function frameFor(rings) {
  const box = (ux, uz) => {
    const px = -uz, pz = ux;
    let a0 = Infinity, a1 = -Infinity, w0 = Infinity, w1 = -Infinity;
    for (const r of rings)
      for (const [x, z] of r.pts) {
        const a = x * ux + z * uz, w = x * px + z * pz;
        a0 = Math.min(a0, a); a1 = Math.max(a1, a); w0 = Math.min(w0, w); w1 = Math.max(w1, w);
      }
    return a1 - a0 >= w1 - w0 ? { ux, uz, px, pz, a0, a1, w0, w1 } : { ux: px, uz: pz, px: -ux, pz: -uz, a0: w0, a1: w1, w0: -a1, w1: -a0 };
  };
  let best = null, area = Infinity;
  for (const r of rings)
    for (let i = 0; i < r.pts.length; i++) {
      const a = r.pts[i], b = r.pts[(i + 1) % r.pts.length], dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz);
      if (l < 1.5) continue;
      const F = box(dx / l, dz / l), s = (F.a1 - F.a0) * (F.w1 - F.w0);
      if (s < area - 0.3) { best = F; area = s; }
    }
  return best || box(1, 0);
}

// Rings as { pts, other }: other[i] is the label of the edge from pts[i] to pts[i + 1].
const labelled = (rings) => rings.map((r) => ({ pts: r.pts, other: r.edges.map((e) => e.other), hole: r.hole }));
export const ringArea = (rings) => rings.reduce((s, r) => s + signedArea(r.pts), 0);

// The part of the rings on one side of the line a = cut in frame F (keep: -1 the low side,
// +1 the high side). The new edges along the cut get the label TERRACE.
function clipRings(rings, F, cut, keep) {
  const out = [];
  for (const r of rings) {
    const n = r.pts.length, segs = [];
    const f = (p) => keep * (toAW(F, p[0], p[1])[0] - cut) * -1; // <= 0: kept
    for (let i = 0; i < n; i++) {
      const S = r.pts[i], E = r.pts[(i + 1) % n], fs = f(S), fe = f(E);
      const X = () => { const t = fs / (fs - fe); return [S[0] + (E[0] - S[0]) * t, S[1] + (E[1] - S[1]) * t]; };
      if (fs <= 0 && fe <= 0) segs.push([S, E, r.other[i]]);
      else if (fs <= 0) segs.push([S, X(), r.other[i]]);
      else if (fe <= 0) segs.push([X(), E, r.other[i]]);
    }
    if (!segs.length) continue;
    const pts = [], other = [];
    for (let q = 0; q < segs.length; q++) {
      const [A, B, l] = segs[q], N = segs[(q + 1) % segs.length][0];
      if (Math.hypot(B[0] - A[0], B[1] - A[1]) > 1e-6) { pts.push(A); other.push(l); }
      if (Math.hypot(N[0] - B[0], N[1] - B[1]) > 1e-6) { pts.push(B); other.push(TERRACE); }
    }
    if (pts.length >= 3 && Math.abs(signedArea(pts)) > 0.5) out.push({ pts, other, hole: r.hole });
  }
  return out;
}

// The roof height that the sourced buildings give, as a smooth surface: a plane fitted to
// them, and a Gaussian of SIGMA metres round each one for the rest.
function roofSurface(pts, SIGMA = 28) {
  // Least squares: r = c0 + c1 x + c2 z.
  const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], v = [0, 0, 0];
  for (const p of pts) {
    const q = [1, p.x, p.z];
    for (let i = 0; i < 3; i++) { v[i] += q[i] * p.r; for (let j = 0; j < 3; j++) M[i][j] += q[i] * q[j]; }
  }
  const c = solve3(M, v);
  const plane = (x, z) => c[0] + c[1] * x + c[2] * z;
  return (x, z) => {
    let num = 0, den = 0.3;
    for (const p of pts) {
      const w = Math.exp(-((p.x - x) ** 2 + (p.z - z) ** 2) / (2 * SIGMA * SIGMA));
      num += w * (p.r - plane(p.x, p.z));
      den += w;
    }
    return plane(x, z) + num / den;
  };
}
function solve3(M, v) {
  const A = M.map((row, i) => [...row, v[i]]);
  for (let i = 0; i < 3; i++) {
    let p = i;
    for (let r = i + 1; r < 3; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
    [A[i], A[p]] = [A[p], A[i]];
    for (let r = 0; r < 3; r++) {
      if (r === i) continue;
      const f = A[r][i] / A[i][i];
      for (let c = i; c < 4; c++) A[r][c] -= f * A[i][c];
    }
  }
  return A.map((row, i) => row[3] / row[i]);
}

// L: the layout (layout.js); T: the ground (terrain.js).
// The ground plan of the City for the surroundings (src/surroundings/ground.js), as plain rings
// of [x, z]: its lanes and roads, its yards, the G/F outline of each building (a list of rings
// for each), and the box of the plan. The surroundings know the City only by this.
export function cityGround(S) {
  const L = S.L, pts = (rings) => rings.map((r) => r.pts);
  return {
    lanes: pts([...L.ground.lane, ...L.ground.road]),
    yards: pts(L.ground.yard),
    footprints: S.list.map((b) => pts(b.phases[0].rings)),
    box: { x0: L.x0, z0: L.z0, w: L.W, d: L.D },
  };
}

export function buildStructure(L, T, opts = {}) {
  const seed = opts.seed ?? 1987;
  const P = L.buildings; // the plots
  // data/structure_fixes.json: names and storeys from the sources, by plot code
  const fixes = opts.fixes || {};
  const nameOf = (plots) => { for (const p of plots) { const s = fixes.names?.[P[p].code]; if (s) return s; } return null; };
  const storeyFix = (plots) => (fixes.storeys || []).find((f) => plots.some((p) => P[p].code === f.code)) || null;
  const regions = new Map(P.map((b) => [b.id, b.rings]));
  // opts.choices (choices.js): the kept random choices; with none, the old random sequence
  const S = { L, T, list: [], ofPlot: new Int32Array(P.length).fill(-1), choices: opts.choices || makeChoices(null, true) };

  // ---- the buildings: one for each tower, and one for each hall of the Yamen ----
  const add = (plots, t) => {
    const p0 = P[plots[0]], id = S.list.length;
    const rings = labelled(unionRings(regions, plots));
    if (!rings.length) return;
    const key = Math.min(...plots.map((p) => P[p].code)); // the key of the building in choices.js
    const lay = S.choices.layout(key, { n: p0.floors, kind: p0.kind, from: t.storeysFrom || 'named', name: t.name || `Building ${t.id}` });
    const b = {
      id, tower: t.id, plots, rings, kind: lay.kind, name: p0.name || null, color: p0.color,
      label: nameOf(plots) || (lay.kind === 'yamen' ? `the Yamen, hall ${id}` : lay.name),
      from: lay.kind === 'yamen' ? 'yamen' : lay.from, layN: lay.n, key,
    };
    b.rng = mulberry32(seed * 7919 + S.choices.seed(key, t.id * 131 + plots[0]));
    for (const p of plots) S.ofPlot[p] = id;
    b.area = ringArea(rings);
    b.F = frameFor(rings);
    let cx = 0, cz = 0, n = 0;
    for (const p of plots) { cx += P[p].cx * P[p].area; cz += P[p].cz * P[p].area; n += P[p].area; }
    b.cx = cx / n; b.cz = cz / n;
    S.list.push(b);
  };
  for (const t of L.towers) {
    if (P[t.blocks[0]].kind === 'yamen') for (const p of t.blocks) add([p], t);
    else add(t.blocks, t);
  }
  const bOf = (p) => (p >= 0 ? S.list[S.ofPlot[p]] : null);
  S.bOf = bOf;

  // ---- frontage: each edge of a building on a lane, a yard, a road or the street round ----
  const cell = (x, z) => {
    const i = Math.floor(x - L.x0), j = Math.floor(z - L.z0);
    return i < 0 || j < 0 || i >= L.W || j >= L.D ? -1 : j * L.W + i;
  };
  // The open width in front of a point of a wall, along n, up to 8 m: the lane cells up to the
  // next plot that is not of building b. The 1 m plan and the traced walls differ by up to a
  // metre, thus the count starts a little behind the wall and skips b's own plots.
  const own = (b, o) => S.ofPlot[o] === b.id || b.annex?.some((a) => S.list[a.id].plots.includes(o));
  S.openWidth = (x, z, nx, nz, b) => {
    let n = 0;
    for (let t = -0.6; t < 8; t += 0.25) {
      const k = cell(x + nx * t, z + nz * t);
      if (k < 0 || !L.inside[k]) return t > 0 ? 8 : n * 0.25 + 8;
      const o = L.owner[k];
      if (o < 0) n++;
      else if (!b || !own(b, o)) { if (n || t > 1.2) return n * 0.25; }
    }
    return 8;
  };
  for (const b of S.list) {
    b.front = [];
    for (const r of b.rings)
      for (let i = 0; i < r.pts.length; i++) {
        const lab = r.other[i];
        if (!(lab in LABEL_WEIGHT)) continue;
        const A = r.pts[i], B = r.pts[(i + 1) % r.pts.length], dx = B[0] - A[0], dz = B[1] - A[1], l = Math.hypot(dx, dz);
        if (l < 0.5) continue;
        const nx = dz / l, nz = -dx / l, mx = (A[0] + B[0]) / 2, mz = (A[1] + B[1]) / 2;
        const width = S.openWidth(mx, mz, nx, nz, b);
        b.front.push({ ring: r, i, lab, len: l, width, n: [nx, nz], mid: [mx, mz], ground: T.h(mx + nx * 0.6, mz + nz * 0.6) });
      }
    // The main door: on the longest front, the streets round the City first.
    let best = null, bs = 0;
    for (const f of b.front) {
      if (f.width < 0.9) continue;
      const s = f.len * LABEL_WEIGHT[f.lab];
      if (s > bs) { bs = s; best = f; }
    }
    b.main = best;
    let g;
    if (best) g = best.ground;
    else { // no frontage: the mean ground under it
      let s = 0, n = 0;
      for (const p of b.plots) for (const k of P[p].cells) { s += T.h(L.cellX(k), L.cellZ(k)); n++; }
      g = s / n;
    }
    b.g0 = g + (b.kind === 'yamen' ? 0.45 : STEP); // the halls stand on a low platform
    let lo = Infinity;
    for (const r of b.rings) for (const [x, z] of r.pts) lo = Math.min(lo, T.h(x, z));
    b.foot = Math.min(lo, b.g0) - 0.6; // the walls go this far down
  }

  // ---- storeys and storey heights ----
  // A building keeps the storeys of the layout where a source gives them. Elsewhere (INFERRED)
  // its roof follows the roofline that the sourced buildings give: it rises to the north, with
  // the ground, from 34-51 mPD on the south face to 51-60 mPD on Tung Tau Tsuen Road. The
  // storeys counted on the bronze model of the City (fixes.storeys, from "bronze") set only the
  // buildings counted: the bronze simplifies, and the roofline keeps to the photos of the City.
  // The ring round the Yamen court is not lower than the rest: the 1989 aerial photos and the
  // bronze show a deep court with tall walls.
  for (const b of S.list) {
    const r = b.rng;
    b.n = b.layN;
    if (b.kind === 'yamen') { b.h0 = 4.1 + r() * 0.5; b.hs = 3; }
    else if (b.name === 'tinHau') { b.h0 = 4.6; b.hs = 3; }
    else if (b.kind === 'low' || b.n <= 3) { b.h0 = 2.8 + r() * 0.5; b.hs = 2.65 + r() * 0.3; }
    else { b.h0 = 3.3 + r() * 0.6; b.hs = 2.7 + r() * 0.3; }
  }
  // Lambot's south elevation shows only the east half of the south face (fixes.south: the
  // plan x of its first step, the width of a step, and the gap at the book's binding). The
  // layout spread its 40 steps over the whole face; here they go on that part only. A building
  // takes the median of the steps over its width. The rest of the face takes its storeys from
  // the roofline (INFERRED).
  if (fixes.south) {
    const { x0, step, binding } = fixes.south;
    const stepAt = (x) => {
      let k = Math.floor((x - x0) / step);
      if (binding && k >= binding.k) k = Math.floor((x - x0 - binding.dx) / step);
      return k >= 0 && k < SOUTH_PROFILE.length ? SOUTH_PROFILE[k] : null;
    };
    for (const b of S.list) {
      if (b.from !== 'south') continue;
      const xs = b.rings.flatMap((r) => r.pts.map((p) => p[0]));
      const lo = Math.min(...xs), hi = Math.max(...xs), v = [];
      for (let x = lo + 0.5; x < hi; x += 0.5) { const n = stepAt(x); if (n) v.push(n); }
      if (v.length < 2) { b.from = 'photos'; continue; }
      v.sort((p, q) => p - q);
      b.n = v[v.length >> 1];
    }
  }
  // Storeys counted on photos, or set by a source (fixes.storeys).
  for (const b of S.list) {
    const f = storeyFix(b.plots);
    if (!f) continue;
    b.n = f.n; b.from = f.from; b.fix = f;
    if (f.kind) b.kind = f.kind;
    if (f.roof === 'pitched') b.pitched = true; // a sloped roof of tiles: no roof to walk on
    if (b.kind === 'low') { b.h0 = 3.2 + b.rng() * 0.4; b.hs = 2.8; }
    if (f.inferred || !['photo', 'bronze'].includes(f.from)) b.inferred = true;
  }
  const sourced = S.list.filter((b) => ['south', 'p132', 'p336', 'photo'].includes(b.from));
  const roofOf = (b) => b.g0 + b.h0 + (b.n - 1) * b.hs;
  const R = roofSurface(sourced.map((b) => ({ x: b.cx, z: b.cz, r: roofOf(b) })));
  S.roofline = R;
  // The old layout made 7 % of these low at random, and a few 15-storey ones; no source gives
  // that, thus each one here takes its storeys from the roofline.
  for (const b of S.list) {
    if (b.from !== 'photos') continue;
    if (b.kind !== 'tenement' || b.n <= 3) { b.h0 = 3.3 + b.rng() * 0.6; b.hs = 2.7 + b.rng() * 0.3; }
    b.kind = 'tenement';
    let f = (R(b.cx, b.cz) - b.g0 - b.h0) / b.hs + 1;
    f += 2.2 * (vnoise(b.cx / 14, b.cz / 14, 5) - 0.5) + 1.2 * (b.rng() - 0.5);
    b.n = S.choices.storeys(b.key, clamp(Math.round(f), 2, 15));
    b.inferred = true;
  }
  for (const b of S.list) {
    b.y = [b.g0];
    b.h = [];
    for (let k = 0; k < b.n; k++) {
      const h = k === 0 ? b.h0 : b.hs + (b.rng() - 0.5) * 0.08;
      b.h.push(h);
      b.y.push(b.y[k] + h);
    }
    b.top = b.y[b.n];
  }

  // ---- annexes: a building grows over the roof of a lower neighbour (p137) ----
  // A neighbour with a party wall of 2.5 m or more, 3 storeys or more lower, and not the Yamen
  // or a named building, or a building whose source says so (fixes.storeys "annex": false, the
  // thin tower). The tall one takes the air over it from its first floor above the lower roof.
  // INFERRED: which ones; about half of the candidates.
  const shared = (a, c) => {
    let s = 0;
    for (const r of a.rings)
      for (let i = 0; i < r.pts.length; i++)
        if (r.other[i] >= 0 && S.ofPlot[r.other[i]] === c.id) {
          const A = r.pts[i], B = r.pts[(i + 1) % r.pts.length];
          s += Math.hypot(B[0] - A[0], B[1] - A[1]);
        }
    return s;
  };
  const neighbours = (b) => {
    const out = new Set();
    for (const r of b.rings) for (const o of r.other) if (o >= 0 && S.ofPlot[o] !== b.id) out.add(S.ofPlot[o]);
    return [...out].map((i) => S.list[i]);
  };
  S.neighbours = neighbours;
  for (const b of S.list) b.annex = [];
  const plain = (b) => b.kind !== 'yamen' && !b.name && b.fix?.annex !== false;
  for (const low of [...S.list].sort((p, q) => p.top - q.top)) {
    if (!plain(low) || low.over || low.annex.length || low.area > 90) continue;
    let best = null, bs = 0;
    for (const c of neighbours(low)) {
      if (!plain(c) || c.over || c.n < low.n + 3 || c.annex.length >= 3) continue;
      const s = shared(low, c) * (c.n - low.n);
      if (shared(low, c) >= 2.5 && s > bs) { bs = s; best = c; }
    }
    if (!best || low.rng() > (low.kind === 'low' || low.n <= 2 ? 0.7 : 0.45)) continue;
    const k = best.y.findIndex((y) => y >= low.top + PARAPET * 0.3 + SLAB);
    if (k < 1 || k >= best.n - 1) continue;
    best.annex.push({ id: low.id, from: k });
    low.over = { id: best.id, from: k, gap: best.y[k] - SLAB - low.top };
  }

  // ---- flat sizes and factory floors (INFERRED; see plan.js) ----
  // Each building has its own flat size, about 19 m2 ("around 200 square feet", p130). A
  // building that the plan marks as a factory (data/plan.json factoryPlots) has factories on
  // 1/F up to 3/F; another one has a factory on 1/F at times (Suenn Ho, p139: the most
  // factories low down).
  const gauss = (r) => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
  for (const b of S.list) {
    b.home = clamp(21 * Math.exp(0.22 * gauss(b.rng)), 13, 32);
    const fac = b.plots.some((p) => P[p].factory);
    b.factoryTo = b.kind !== 'tenement' || b.n < 4 ? 0 : fac ? 1 + Math.floor(b.rng() * 3) : b.rng() < 0.15 ? 1 : 0;
  }

  // ---- phases: the levels that share one footprint ----
  const makePhases = (b) => {
    const r = b.rng;
    // Overhangs: from 1/F or 2/F up, the walls on a lane of 2.2 m or more move out by up to
    // 0.6 m, and leave at least 1.6 m of sky between the two sides (INFERRED).
    if (b.overFrom === undefined) b.overFrom = b.kind === 'tenement' && b.n >= 4 && r() < 0.7 ? (r() < 0.5 ? 1 : 2) : Infinity;
    const off = (rings) => rings.map((ring) => {
      const o = ring.pts.map((A, i) => {
        const lab = ring.other[i];
        if (!(lab in LABEL_WEIGHT)) return 0;
        const B = ring.pts[(i + 1) % ring.pts.length], dx = B[0] - A[0], dz = B[1] - A[1], l = Math.hypot(dx, dz);
        if (l < 1.5) return 0;
        const w = S.openWidth((A[0] + B[0]) / 2, (A[1] + B[1]) / 2, dz / l, -dx / l, b);
        const m = lab === OUTSIDE ? 0.45 : lab === YARD ? Math.min(0.4, (w - 3) / 2) : Math.min(0.6, (w - 1.6) / 2);
        return w >= 2.2 && m > 0.1 ? m : 0;
      });
      return o.some((v) => v > 0) ? { pts: offsetRing(ring.pts, o), other: ring.other, hole: ring.hole } : ring;
    });
    // A setback: some tall buildings have a top storey over part of the roof only.
    if (b.setback === undefined) b.setback = b.kind === 'tenement' && b.n >= 5 && b.area >= 45 && !b.over && r() < 0.3 ? 0.45 + r() * 0.25 : 0;
    const factory = (k) => k >= 1 && k <= (b.factoryTo || 0);
    const key = (k) => [k === 0 ? 'g' : '', k >= b.overFrom ? 'o' : '', ...b.annex.filter((a) => k >= a.from).map((a) => a.id),
      b.setback && k === b.n - 1 ? 's' : '', factory(k) ? 'F' : ''].join('|');
    b.phases = [];
    for (let k = 0; k < b.n; k++) {
      const kk = key(k), last = b.phases[b.phases.length - 1];
      if (last && last.key === kk) { last.k1 = k + 1; continue; }
      const ids = [...b.plots];
      for (const a of b.annex) if (k >= a.from) ids.push(...S.list[a.id].plots);
      let rings = ids.length > b.plots.length ? labelled(unionRings(regions, ids)) : b.rings;
      if (k >= b.overFrom) rings = off(rings);
      b.phases.push({ key: kk, k0: k, k1: k + 1, rings, area: ringArea(rings), use: factory(k) ? 'factory' : null });
    }
    b.phaseOf = (k) => b.phases.find((p) => k >= p.k0 && k < p.k1) || b.phases[b.phases.length - 1];
  };
  for (const b of S.list) makePhases(b);

  // ---- stairs, then the plan of each phase ----
  for (const b of S.list) placeStairs(S, b);
  // A building too small for a stair of its own is a wing of a neighbour: it shares the
  // neighbour's stair (pp138-139), thus its floors are at the neighbour's levels, with a door
  // through the party wall on each floor.
  for (const pass of [0, 1, 2])
  for (const b of S.list) {
    if (b.kind === 'yamen' || b.n < 2 || b.stairs.length || b.wingOf !== undefined) continue;
    let host = null, hs = 0;
    for (const c of neighbours(b)) {
      if (pass === 0 ? !c.stairs.length : !c.stairs.length && c.wingOf === undefined) continue;
      if (c.wingOf === b.id) continue;
      const s = shared(b, c) + 3 * Math.min(c.n, b.n) / b.n;
      if (shared(b, c) >= 1.2 && s > hs) { hs = s; host = c; }
    }
    if (!host) { if (pass === 2) { b.forceStair = true; placeStairs(S, b); } continue; }
    b.wingOf = host.id;
    b.n = Math.min(b.n, host.n);
    b.g0 = host.g0; b.h0 = host.h0; b.hs = host.hs;
    b.h = host.h.slice(0, b.n); b.y = host.y.slice(0, b.n + 1); b.top = b.y[b.n];
    b.foot = Math.min(b.foot, b.g0 - 0.6);
    b.overFrom = Math.max(b.overFrom, host.overFrom);
    b.setback = 0;
    makePhases(b);
  }
  // Tiny buildings with no stair and no neighbour to share one with: a hut of one storey.
  for (const b of S.list) {
    if (b.kind === 'yamen' || b.n < 2 || b.stairs.length || b.wingOf !== undefined) continue;
    b.n = 1; b.kind = 'low'; b.from = 'hut'; b.inferred = true;
    b.h0 = 2.8; b.h = [b.h0]; b.y = [b.g0, b.g0 + b.h0]; b.top = b.y[1];
    b.overFrom = Infinity; b.setback = 0;
    makePhases(b);
  }
  findSites(S, b => neighbours(b), shared);
  for (const b of S.list) {
    // The setback keeps the end of the building with the stair, and every other stair too:
    // a stair goes up to the top roof, thus its hut must stand on the top storey. Where the
    // stairs are at both ends, the cut leaves too little open roof and the building has no
    // setback. No setback on a floor that a wing reaches: the wing's door is in the party wall.
    if (b.setback && S.list.some((w) => w.wingOf === b.id && w.n >= b.phases[b.phases.length - 1].k0 + 1)) b.setback = 0;
    if (b.setback) {
      const ph = b.phases[b.phases.length - 1], F = b.F;
      const st = b.stairs[0];
      const mid = st ? (st.a0 + st.a1) / 2 : F.a0;
      const keep = mid < (F.a0 + F.a1) / 2 ? -1 : 1;
      let cut = keep < 0 ? F.a0 + (F.a1 - F.a0) * b.setback : F.a1 - (F.a1 - F.a0) * b.setback;
      for (const s of b.stairs) cut = keep < 0 ? Math.max(cut, s.a1 + 1.2) : Math.min(cut, s.a0 - 1.2);
      const rings = clipRings(ph.rings, F, cut, keep);
      if (rings.length && ringArea(rings) > 12 && ringArea(rings) < ph.area - 8) { ph.rings = rings; ph.area = ringArea(rings); ph.setback = { cut, keep }; }
      else b.setback = 0;
    }
    for (const ph of b.phases) ph.plan = planPhase(S, b, ph);
  }

  // ---- who stands where: the plots each building fills, by height ----
  // S.fills(p, y): the building whose floor space holds plot p at height y, or null.
  const fill = new Map();
  for (const b of S.list) {
    for (const p of b.plots) (fill.get(p) || fill.set(p, []).get(p)).push([b.foot, b.top, b.id]);
    for (const a of b.annex) for (const p of S.list[a.id].plots) (fill.get(p) || fill.set(p, []).get(p)).push([b.y[a.from] - SLAB, b.top, b.id]);
  }
  S.fills = (p, y) => {
    for (const [y0, y1, id] of fill.get(p) || []) if (y >= y0 && y < y1) return S.list[id];
    return null;
  };

  // ---- parapets: about 20 % of the flat roofs (PARAPET_RATE); the rest end at the slab ----
  for (const b of S.list) b.parapet = !b.pitched && S.choices.num(`parapet:${b.key}`, 4243) < PARAPET_RATE;

  // ---- roof rooms ----
  // A room of one storey on the roof, beside a stair hut: about 20 % of the tenements (INFERRED
  // from the 1987 aerial photos of the roofs), and the buildings that a source gives one
  // (fixes.storeys: roofRoom). It is a box of 2.2 to 4 m at an end of the stair hut, as wide
  // as the stair and its corridor, or a box beside the hut, inside the top floor's outline.
  for (const b of S.list) {
    b.roofRoom = null;
    const st = b.stairs[0], open = !b.over || b.over.gap >= HUT + 0.3;
    if (!st || !open || b.kind !== 'tenement' || !(b.fix?.roofRoom || S.choices.num(`roofroom:${b.key}`, 777) < 0.2)) continue;
    const rings = innerRings(b.phases[b.phases.length - 1].rings);
    // the boxes to try: at either end of the stair, then beside it
    const len = 2.5 + S.choices.num(`roofroomlen:${b.key}`, 777) * 1.5, w0 = st.spine && st.side < 0 ? st.w0 - SPINE : st.w0, w1 = st.spine && st.side > 0 ? st.w1 + SPINE : st.w1;
    const boxes = [];
    for (const l of [len, 2.2]) for (const dir of [1, -1]) boxes.push(dir > 0 ? [st.a1, st.a1 + l, w0, w1] : [st.a0 - l, st.a0, w0, w1]);
    for (const l of [2.8, 2.2]) boxes.push([st.a0, st.a1, w1, w1 + l], [st.a0, st.a1, w0 - l, w0]);
    for (const [a0, a1, b0, b1] of boxes) {
      const pts = [[a0, b0], [a1, b0], [a1, b1], [a0, b1], [(a0 + a1) / 2, (b0 + b1) / 2]].map(([a, w]) => toXZ(b.F, a, w));
      if (!pts.every(([x, z]) => inRings(rings, x, z))) continue;
      b.roofRoom = { a0, a1, w0: b0, w1: b1 };
      break;
    }
  }

  buildLinks(S);
  return S;
}

// The level of building b at height y: the k with y[k] <= y < y[k + 1], or -1 below, n above.
export function levelAt(b, y) {
  if (y < b.y[0]) return -1;
  for (let k = 0; k < b.n; k++) if (y < b.y[k + 1]) return k;
  return b.n;
}

export const floorName = (k) => (k === 0 ? 'G/F' : `${k}/F`);

// ---- link sites ----
// The corridors of two neighbours both reach their party wall at one point, chosen here; there
// links.js puts a door on each floor where both reach it within DOOR_DY of each other, at the
// rate of the pair. A small floor (no corridor) links only from its stair landing. A pair of
// buildings across a lane of BRIDGE_W m or less can get a bridge site, from 2/F up. INFERRED:
// the rates; 15 % of the pairs have no door at all, and half the pairs across a lane a bridge.
export const BRIDGE_W = 3.5;
// The route inside the buildings from the SW corner of the City to the NE corner (below, and
// links.js). p164 has a route on 3/F-4/F from one end of the City to the other. John asked
// (2026-11-04) for a route from corner to corner at the middle of the City's height (the median
// building has 12 storeys): an ARTISTIC choice, not SOURCED. CHAIN_FLOORS: its floors.
export const CHAIN_FLOORS = [5, 7];
const NE = [0.948, -0.32]; // north-east in the plan frame (+x is bearing 63.63 degrees)
// The ends of the route: of the buildings in list, the CORNER_N nearest the SW corner and the
// CORNER_N nearest the NE corner (the points of the outlines farthest to the SW and the NE).
// One at each corner, thus the route goes the full way from corner to corner.
const CORNER_N = 1;
export function routeCorners(S, list) {
  let sw = null, ne = null;
  for (const b of S.list)
    for (const r of b.rings)
      for (const p of r.pts) {
        const s = p[0] * NE[0] + p[1] * NE[1];
        if (!sw || s < sw.s) sw = { s, p };
        if (!ne || s > ne.s) ne = { s, p };
      }
  const near = (q) => [...list].sort((a, c) => Math.hypot(a.cx - q[0], a.cz - q[1]) - Math.hypot(c.cx - q[0], c.cz - q[1])).slice(0, CORNER_N);
  return [near(sw.p), near(ne.p)];
}
function findSites(S, neighbours, shared) {
  const C = S.choices, R = (key) => C.num(key, 31337);
  const two = (b, c) => (b.key < c.key ? `${b.key}:${c.key}` : `${c.key}:${b.key}`); // a pair in one order
  S.pairs = new Map();
  S.farPairs = new Map();
  const linkable = (b) => b.kind !== 'yamen' && b.stairs.length && b.wingOf === undefined;
  for (const b of S.list) b.sites = [];
  // The landing of a building with no corridor, as a box in its frame, or null.
  const landingOf = (b) => {
    const st = b.stairs[0];
    if (!st || st.spine) return null;
    const pa = stairParts(st), [l0, l1] = pa.landings[0];
    return { a0: l0, a1: l1, w0: st.w0, w1: st.w1 };
  };
  // The circulation of a building as boxes in its frame: the landing, or each corridor.
  const circOf = (b) => b.stairs.map((st) => {
    if (!st.spine) return landingOf(b);
    const w0 = st.side < 0 ? st.w0 - SPINE : st.w1;
    return { a0: b.F.a0, a1: b.F.a1, w0, w1: w0 + SPINE };
  });
  const nearBox = (b, box, x, z) => {
    const [a, w] = toAW(b.F, x, z);
    return Math.hypot(Math.max(box.a0 - a, 0, a - box.a1), Math.max(box.w0 - w, 0, w - box.w1));
  };
  const near = (b, boxes, x, z) => Math.min(...boxes.map((box) => nearBox(b, box, x, z)));
  // A point at a stair (or within 0.5 m of it) is no place for a door.
  const atStair = (b, x, z) => { const [a, w] = toAW(b.F, x, z); return b.stairs.some((st) => a > st.a0 - 0.5 && a < st.a1 + 0.5 && w > st.w0 - 0.5 && w < st.w1 + 0.5); };
  for (const b of S.list) {
    if (!linkable(b)) continue;
    for (const c of neighbours(b)) {
      if (c.id <= b.id || !linkable(c)) continue;
      if (b.annex.some((a) => a.id === c.id) || c.annex.some((a) => a.id === b.id)) continue;
      const cb = circOf(b), cc = circOf(c);
      let best = null, far = null;
      for (const r of b.rings)
        for (let i = 0; i < r.pts.length; i++) {
          if (r.other[i] < 0 || S.ofPlot[r.other[i]] !== c.id) continue;
          const A = r.pts[i], B = r.pts[(i + 1) % r.pts.length], len = Math.hypot(B[0] - A[0], B[1] - A[1]);
          if (len < 1.4) continue;
          // The point on the edge nearest the circulation of both buildings: a short passage
          // (or none) from the door to the stair on each side. A landing must be near.
          let t = -1, bd = Infinity;
          for (let q = 0.6; q <= len - 0.6; q += 0.25) {
            const x = A[0] + ((B[0] - A[0]) * q) / len, z = A[1] + ((B[1] - A[1]) * q) / len;
            if (atStair(b, x, z) || atStair(c, x, z)) continue;
            const db = near(b, cb, x, z), dc = near(c, cc, x, z);
            if (!far || db + dc < far.d) far = { d: db + dc, P: [x, z], n: [(B[1] - A[1]) / len, -(B[0] - A[0]) / len] };
            if ((!b.stairs[0].spine && db > 6) || (!c.stairs[0].spine && dc > 6)) continue;
            if (db + dc < bd) { bd = db + dc; t = q; }
          }
          if (t < 0) continue;
          const score = Math.min(len, 4) - bd;
          if (!best || score > best.score) {
            const l = len, nx = (B[1] - A[1]) / l, nz = -(B[0] - A[0]) / l;
            best = { score, P: [A[0] + ((B[0] - A[0]) * t) / l, A[1] + ((B[1] - A[1]) * t) / l], n: [nx, nz] };
          }
        }
      if (shared(b, c) < 1.4) continue;
      // A pair with no good site: a site for the SW-NE route only, at the point nearest
      // the circulation of both.
      if (!best) { if (far) S.farPairs.set(`${b.id}:${c.id}`, { b: b.id, c: c.id, rate: 0, P: far.P, n: far.n }); continue; }
      // the factor of the pair on the rate of doors by height (links.js); no door for 15 %
      const rate = R(`rate:${two(b, c)}`) < 0.15 ? 0 : 0.6 + 0.8 * R(`rate2:${two(b, c)}`);
      const key = `${b.id}:${c.id}`;
      S.pairs.set(key, { b: b.id, c: c.id, rate, P: best.P, n: best.n });
      if (!rate) continue;
      b.sites.push({ P: best.P, n: best.n, key });
      c.sites.push({ P: best.P, n: [-best.n[0], -best.n[1]], key });
    }
  }
  // bridges
  const L = S.L;
  S.bridgeSites = new Map();
  for (const b of S.list) {
    if (!linkable(b) || b.n < 3 || landingOf(b)) continue;
    for (const r of b.rings)
      for (let i = 0; i < r.pts.length; i++) {
        if (r.other[i] !== -1 && r.other[i] !== -2) continue; // a lane or a yard
        const A = r.pts[i], B = r.pts[(i + 1) % r.pts.length], len = Math.hypot(B[0] - A[0], B[1] - A[1]);
        if (len < 2.5) continue;
        const nx = (B[1] - A[1]) / len, nz = -(B[0] - A[0]) / len, P = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
        let c = null;
        for (let s = 0.5; s <= BRIDGE_W + 0.5 && !c; s += 0.25) {
          const ci = Math.floor(P[0] + nx * s - L.x0), cj = Math.floor(P[1] + nz * s - L.z0);
          if (ci < 0 || cj < 0 || ci >= L.W || cj >= L.D) break;
          const o = L.owner[cj * L.W + ci];
          if (o >= 0) c = S.list[S.ofPlot[o]];
        }
        if (!c || c.id === b.id || !linkable(c) || c.n < 3 || landingOf(c)) continue;
        // the nearest point of c to P
        let Q = null, qd = Infinity;
        for (const r2 of c.rings)
          for (let j = 0; j < r2.pts.length; j++) {
            const C = r2.pts[j], D = r2.pts[(j + 1) % r2.pts.length], d = segDist(P[0], P[1], C, D);
            if (d < qd) {
              const dx = D[0] - C[0], dz = D[1] - C[1], l2 = dx * dx + dz * dz;
              const t = Math.max(0, Math.min(1, ((P[0] - C[0]) * dx + (P[1] - C[1]) * dz) / l2));
              qd = d; Q = [C[0] + dx * t, C[1] + dz * t];
            }
          }
        if (!Q || qd < 0.8 || qd > BRIDGE_W) continue;
        const key = b.id < c.id ? `${b.id}:${c.id}` : `${c.id}:${b.id}`;
        const o = S.bridgeSites.get(key);
        if (!o || qd < o.d) S.bridgeSites.set(key, { b: b.id, c: c.id, P, Q, d: qd });
      }
  }
  // One route inside the buildings from the SW corner of the City to the NE corner, on the
  // floors CHAIN_FLOORS (see there). INFERRED: which buildings. The chain is the cheapest one
  // over the party walls and the bridge sites, by the distance between the buildings and the
  // floors that line up on CHAIN_FLOORS.
  const links = S.list.filter(linkable);
  const step = (b, c) => {
    let dy = Infinity;
    const [lo, hi] = CHAIN_FLOORS;
    for (let k = lo; k <= hi && k < b.n; k++) for (let kc = lo; kc <= hi && kc < c.n; kc++) dy = Math.min(dy, Math.abs(b.y[k] - c.y[kc]));
    return dy <= 0.6 ? 0 : dy <= 1.2 ? 15 : Infinity;
  };
  const adj = new Map(links.map((b) => [b.id, []]));
  // The kept route (choices.js): a step between two buildings that follow each other on it
  // costs a quarter, thus the route stays where the outlines still let it.
  const keptChain = C.kept?.chain || [], onKept = new Set();
  for (let q = 0; q + 1 < keptChain.length; q++) { onKept.add(`${keptChain[q]}:${keptChain[q + 1]}`); onKept.add(`${keptChain[q + 1]}:${keptChain[q]}`); }
  for (const x of [...S.pairs.values(), ...S.farPairs.values(), ...S.bridgeSites.values()]) {
    const b = S.list[x.b], c = S.list[x.c], bridge = !!x.Q;
    const extra = step(b, c) + (bridge ? 5 : S.pairs.has(`${x.b}:${x.c}`) ? 0 : 10);
    if (!isFinite(extra)) continue;
    const w = (Math.hypot(b.cx - c.cx, b.cz - c.cz) + extra) * (onKept.has(`${b.key}:${c.key}`) ? 0.25 : 1);
    adj.get(b.id).push([c.id, w, bridge]); adj.get(c.id).push([b.id, w, bridge]);
  }
  const [starts, last] = routeCorners(S, links), ends = new Set(last.map((b) => b.id));
  const dist = new Map(), prev = new Map(), via = new Map(), todo = new Set();
  for (const b of starts) { dist.set(b.id, 0); todo.add(b.id); }
  let end = null;
  while (todo.size) {
    let v = null;
    for (const q of todo) if (v === null || dist.get(q) < dist.get(v)) v = q;
    todo.delete(v);
    if (ends.has(v)) { end = v; break; }
    for (const [u, w, bridge] of adj.get(v)) {
      const d = dist.get(v) + w;
      if (d < (dist.get(u) ?? Infinity)) { dist.set(u, d); prev.set(u, v); todo.add(u); via.set(u, bridge); }
    }
  }
  // The chain gets sites (thus passages to its doors); links.js makes the route itself.
  const chain = [];
  for (let v = end; v != null; v = prev.get(v)) chain.unshift(v);
  const a0 = (a, c) => (a < c ? `${a}:${c}` : `${c}:${a}`);
  for (let q = 0; q + 1 < chain.length; q++) {
    const key = a0(chain[q], chain[q + 1]);
    if (via.get(chain[q + 1])) { S.bridgeSites.get(key).chain = true; continue; }
    if (!S.pairs.has(key)) S.pairs.set(key, S.farPairs.get(key));
    const x = S.pairs.get(key);
    x.chain = true;
    if (x.rate) continue;
    x.rate = 0.6;
    S.list[x.b].sites.push({ P: x.P, n: x.n, key: `${x.b}:${x.c}` });
    S.list[x.c].sites.push({ P: x.P, n: [-x.n[0], -x.n[1]], key: `${x.b}:${x.c}` });
  }
  S.bridgeAll = new Map(S.bridgeSites); // for the SW-NE route (links.js)
  // Half of the bridge sites keep a bridge, and every one on the route.
  for (const [key, x] of [...S.bridgeSites]) {
    if (!x.chain && R(`bsite:${two(S.list[x.b], S.list[x.c])}`) >= 0.5) { S.bridgeSites.delete(key); continue; }
    const n = [(x.Q[0] - x.P[0]) / x.d, (x.Q[1] - x.P[1]) / x.d];
    S.list[x.b].sites.push({ P: x.P, n, key: 'b' + key, from: 2 });
    S.list[x.c].sites.push({ P: x.Q, n: [-n[0], -n[1]], key: 'b' + key, from: 2 });
  }
}
