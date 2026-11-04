// The plan of each floor of a building, on a raster of G metres in the building's frame: the
// stairs, the corridors and the units (flats, shops and workshops). INFERRED throughout, from
// the types in City of Darkness Revisited: a dog-leg stair at the side with a corridor along
// it, or in a narrow building a straight stair in a strip of about 1.0 m (Suzuki, p209), with
// each flight over the one below and a corridor beside it back to the next flight (the tong
// lau plan). Flats of 200-300 sq ft (WSJ, 2014); shops and workshops on G/F.
import { Raster, offsetRing, toXZ, segDist } from './poly.js';

export const G = 0.25;
export const OUT = 0, FREE = -1, FLIGHT = 1, LANDING = 2, CORR = 3, UNIT = 4;
export const TREAD = 0.21, RISER_MAX = 0.2;
const LA = 1.0, LB = 0.9; // the floor landing and the half landing of a dog-leg stair
export const SPINE = 1.0; // corridor width
const THIN = 2.0; // m: a strip of floor less deep than this, beside a stair or corridor, is no room
const THICK = 1.2; // m: a room is at least this wide somewhere
const HOME = 21, SHOP = 30, FACTORY = 50; // m2 of a unit (a building's own flat size: b.home)
const MIN_UNIT = 7.5; // m2: a smaller piece joins a neighbour unit, or is one room (kind 'room')

const WALL = 0.2;
export const innerRings = (rings) => rings.map((r) => offsetRing(r.pts, r.pts.map(() => -WALL)));

// Risers of a storey of height h, and the rise of each.
export const risers = (h) => { const n = Math.ceil(h / RISER_MAX - 1e-9); return { n, r: h / n }; };

// The stairs of building b, in its frame: [{ type, a0, a1, w0, w1, dir, side, spine }].
// type 'dogleg': a floor landing of LA at the landing end, two flights side by side, a half
// landing of LB at the far end. type 'straight': a strip with a landing at each end and one
// flight between. dir: +1 when the landing end is at a0 (the flights climb toward a1).
// side: the side of the corridor (spine), -1 at w0, +1 at w1, 0 with no corridor.
export function placeStairs(S, b) {
  b.stairs = [];
  if (b.kind === 'yamen' || b.n < 2) return;
  const ph = b.phases[0];
  const R = new Raster(b.F, innerRings(ph.rings).map((p) => p), G);
  const ni = R.ni, nj = R.nj;
  // prefix sums of the cells inside
  const P = new Int32Array((ni + 1) * (nj + 1));
  for (let j = 0; j < nj; j++)
    for (let i = 0; i < ni; i++)
      P[(j + 1) * (ni + 1) + i + 1] = R.inside[j * ni + i] + P[j * (ni + 1) + i + 1] + P[(j + 1) * (ni + 1) + i] - P[j * (ni + 1) + i];
  const sum = (i0, j0, i1, j1) => {
    if (i0 < 0 || j0 < 0 || i1 > ni || j1 > nj) {
      i0 = Math.max(0, i0); j0 = Math.max(0, j0); i1 = Math.min(ni, i1); j1 = Math.min(nj, j1);
      if (i1 <= i0 || j1 <= j0) return 0;
    }
    return P[j1 * (ni + 1) + i1] - P[j0 * (ni + 1) + i1] - P[j1 * (ni + 1) + i0] + P[j0 * (ni + 1) + i0];
  };
  const hmax = Math.max(...b.h.slice(0, b.n));
  // A steep stair (a "ladder stair") for a small building: risers of up to 0.25 m.
  const spec = (type) => {
    const s = type === 'ladder' ? { tread: 0.17, rmax: 0.25, land: 0.7 } : { tread: TREAD, rmax: RISER_MAX, land: 0.9 };
    const nR = Math.ceil(hmax / s.rmax - 1e-9);
    s.len = type === 'dogleg' ? LA + (Math.ceil(nR / 2) - 1) * s.tread + LB : 2 * s.land + (nR - 1) * s.tread;
    return s;
  };
  const cells = (m) => Math.ceil(m / G - 1e-6);
  const door = b.main ? b.main.mid : [b.cx, b.cz];
  const [da, dw] = [door[0] * b.F.ux + door[1] * b.F.uz, door[0] * b.F.px + door[1] * b.F.pz];
  const spineN = cells(SPINE);

  // The depth of floor from row j on, in steps of dj, beside the cells i0..i0+na (up to 2 m).
  const depth = (i0, na, j, dj) => {
    let d = 0;
    for (; d < cells(THIN); j += dj, d++) if (sum(i0, j, i0 + na, j + 1) < na * 0.5) break;
    return d;
  };
  // The best place for a stair of na x nw cells, or null. avoid: stairs placed already.
  // strict: no strip of floor less than THIN deep between the stair (or corridor) and a wall.
  const place = (type, na, nw, withSpine, avoid, strict) => {
    let best = null, bs = Infinity;
    for (let j0 = 0; j0 + nw <= nj; j0++)
      for (let i0 = 0; i0 + na <= ni; i0++) {
        if (sum(i0, j0, i0 + na, j0 + nw) !== na * nw) continue;
        for (const side of withSpine ? [-1, 1] : [0]) {
          let sp = 0;
          if (side) {
            const s0 = side < 0 ? j0 - spineN : j0 + nw;
            sp = sum(i0, s0, i0 + na, s0 + spineN);
            if (sp < na * spineN * 0.8) continue;
          }
          if (strict) {
            const lo = depth(i0, na, j0 - 1 - (side < 0 ? spineN : 0), -1), hi = depth(i0, na, j0 + nw + (side > 0 ? spineN : 0), 1);
            if ((lo > 0 && lo < cells(THIN)) || (hi > 0 && hi < cells(THIN))) continue;
          }
          // against a wall on the side away from the corridor
          const back = side < 0 ? j0 + nw : side > 0 ? j0 - 1 : -1;
          const wall = side ? sum(i0, back, i0 + na, back + 1) < na * 0.5 : true;
          for (const dir of [1, -1]) {
            const la = dir > 0 ? R.A0 + i0 * G : R.A0 + (i0 + na) * G;
            const lw = R.W0 + (j0 + nw / 2) * G;
            let s = Math.hypot(la - da, lw - dw) + (wall ? 0 : 4);
            for (const o of avoid) s -= Math.min(30, Math.hypot((o.a0 + o.a1) / 2 - (R.A0 + (i0 + na / 2) * G), (o.w0 + o.w1) / 2 - lw)) * 2;
            if (s < bs) {
              bs = s;
              best = { type, a0: R.A0 + i0 * G, a1: R.A0 + (i0 + na) * G, w0: R.W0 + j0 * G, w1: R.W0 + (j0 + nw) * G, dir, side, spine: !!side };
            }
          }
        }
      }
    return best;
  };
  const innerArea = R.count * G * G;
  b.innerArea = innerArea;
  if (innerArea < 14 && !b.forceStair) return; // a wing of a neighbour (model.js)
  const wide = b.F.w1 - b.F.w0;
  const D = spec('dogleg'), T = spec('straight'), K = spec('ladder');
  const at = (sp, type, nw, spine, avoid, strict) => {
    const r = place(type, cells(sp.len), cells(nw), spine, avoid, strict);
    return r && Object.assign(r, { tread: sp.tread, rmax: sp.rmax, land: sp.land });
  };
  // A small floor has no corridor: the landing opens into the one flat (with a straight
  // stair, the flat is the way from one flight to the next).
  const small = innerArea < 45;
  const order = (avoid, strict) =>
    (small && (at(D, 'dogleg', 2.0, false, avoid, strict) || at(T, 'straight', 1.0, false, avoid, strict) || at(K, 'straight', 0.9, false, avoid, strict))) ||
    (innerArea >= 40 && wide >= 5.2 && at(D, 'dogleg', 2.0, true, avoid, strict)) ||
    at(T, 'straight', 1.0, true, avoid, strict) || at(D, 'dogleg', 2.0, true, avoid, strict) ||
    at(K, 'straight', 0.9, true, avoid, strict) || at(T, 'straight', 1.0, false, avoid, strict) ||
    at(K, 'straight', 0.9, false, avoid, strict) || at(D, 'dogleg', 2.0, false, avoid, strict);
  const open = (avoid, strict) => at(D, 'dogleg', 2.0, false, avoid, strict) || at(T, 'straight', 1.0, false, avoid, strict) || at(K, 'straight', 0.9, false, avoid, strict);
  const s1 = (small && (open([], true) || open([], false))) || order([], true) || order([], false);
  if (!s1) return;
  b.stairs.push(s1);
  // A long or large building has a second stair, far from the first, if one fits well.
  if (b.F.a1 - b.F.a0 > 22 || innerArea > 260) {
    const s2 = order([s1], true);
    if (s2 && Math.hypot((s2.a0 + s2.a1 - s1.a0 - s1.a1) / 2, (s2.w0 + s2.w1 - s1.w0 - s1.w1) / 2) > 10) b.stairs.push(s2);
  }
}

// The parts of a stair in its frame: the landing bands (walkable at the floor level) and the
// band of the flights. For a dog-leg, lane 1 (up from the floor landing) is on the side away
// from the corridor, lane 2 (up to the next floor) on the corridor side.
export function stairParts(st) {
  const len = st.a1 - st.a0, d = st.dir;
  const at = (t) => (d > 0 ? st.a0 + t : st.a1 - t); // a at distance t from the landing end
  const span = (t0, t1) => [Math.min(at(t0), at(t1)), Math.max(at(t0), at(t1))];
  const land = st.land || 0.9;
  if (st.type === 'dogleg') {
    const mid = (st.w0 + st.w1) / 2;
    const near = st.side >= 0 ? [mid + 0.05, st.w1] : [st.w0, mid - 0.05];
    const far = st.side >= 0 ? [st.w0, mid - 0.05] : [mid + 0.05, st.w1];
    return { landings: [span(0, LA)], flights: span(LA, len), lane1: far, lane2: near, at, len, LA, LB };
  }
  return { landings: [span(0, land), span(len - land, len)], flights: span(land, len - land), at, len, land };
}

// The plan of phase ph of building b: the raster, a code for each cell, the units and their
// doors, and the circulation (landings and corridors).
export function planPhase(S, b, ph) {
  const inner = innerRings(ph.rings);
  const R = new Raster(b.F, inner, G);
  const { ni, nj } = R, N = ni * nj;
  const code = new Int16Array(N);
  for (let c = 0; c < N; c++) code[c] = R.inside[c] ? FREE : OUT;
  const plan = { R, code, inner, units: [], doors: [] };
  if (!R.count) return plan;
  const nb = (c) => {
    const i = c % ni, j = (c / ni) | 0, out = [];
    if (i > 0) out.push(c - 1);
    if (i < ni - 1) out.push(c + 1);
    if (j > 0) out.push(c - ni);
    if (j < nj - 1) out.push(c + ni);
    return out;
  };
  const inRect = (a, w, a0, a1, w0, w1) => a >= a0 && a < a1 && w >= w0 && w < w1;

  // the stairs
  for (const st of b.stairs) {
    const pa = stairParts(st);
    for (let j = 0; j < nj; j++)
      for (let i = 0; i < ni; i++) {
        const c = j * ni + i, a = R.a(i), w = R.w(j);
        if (!inRect(a, w, st.a0, st.a1, st.w0, st.w1)) continue;
        code[c] = pa.landings.some(([x0, x1]) => a >= x0 && a < x1) ? LANDING : FLIGHT;
      }
  }
  // the corridor beside each stair, along a
  for (const st of b.stairs) {
    if (!st.spine) continue;
    const w0 = st.side < 0 ? st.w0 - SPINE : st.w1, w1 = w0 + SPINE;
    for (let j = 0; j < nj; j++) {
      const w = R.w(j);
      if (w < w0 || w >= w1) continue;
      for (let i = 0; i < ni; i++) if (code[j * ni + i] === FREE) code[j * ni + i] = CORR;
    }
  }
  // Keep the corridor that the landings reach.
  const flood = (seed, ok) => {
    const seen = new Uint8Array(N), list = [];
    for (const s of seed) if (!seen[s]) { seen[s] = 1; list.push(s); }
    for (let q = 0; q < list.length; q++) for (const n of nb(list[q])) if (!seen[n] && ok(code[n])) { seen[n] = 1; list.push(n); }
    return seen;
  };
  const circ = (v) => v === LANDING || v === CORR;
  const land = [];
  for (let c = 0; c < N; c++) if (code[c] === LANDING) land.push(c);
  let reach = flood(land, circ);
  for (let c = 0; c < N; c++) if (code[c] === CORR && !reach[c]) code[c] = FREE;

  // A passage of SPINE wide along the cheapest way from the circulation to the target cells.
  const carve = (targets) => {
    const prev = new Int32Array(N).fill(-2), list = [];
    for (let c = 0; c < N; c++) if (circ(code[c])) { prev[c] = -1; list.push(c); }
    if (!list.length) return false;
    let hit = -1;
    for (let q = 0; q < list.length && hit < 0; q++)
      for (const n of nb(list[q])) {
        if (prev[n] !== -2 || code[n] !== FREE) continue;
        prev[n] = list[q];
        if (targets.has(n)) { hit = n; break; }
        list.push(n);
      }
    if (hit < 0) return false;
    const k = Math.round(SPINE / G), path = [];
    for (let c = hit; c >= 0 && !circ(code[c]); c = prev[c]) path.push(c);
    for (const c of path) {
      const i = c % ni, j = (c / ni) | 0;
      for (let di = -1; di < k - 1; di++)
        for (let dj = -1; dj < k - 1; dj++) {
          const ii = i + di, jj = j + dj;
          if (ii >= 0 && jj >= 0 && ii < ni && jj < nj && code[jj * ni + ii] === FREE) code[jj * ni + ii] = CORR;
        }
    }
    return true;
  };

  const anchor = new Set(); // cells of corridor at a door to the lane or to a neighbour
  // G/F: the circulation reaches the main door.
  if (ph.k0 === 0 && b.main && b.stairs.length) {
    const front = new Set();
    for (let c = 0; c < N; c++) {
      if (code[c] === OUT) continue;
      const [x, z] = R.xz(c % ni, (c / ni) | 0);
      if (segDist(x, z, b.main.ring.pts[b.main.i], b.main.ring.pts[(b.main.i + 1) % b.main.ring.pts.length]) < WALL + G * 1.5) front.add(c);
    }
    if (![...front].some((c) => circ(code[c]))) carve(front);
    for (const c of front) if (circ(code[c])) anchor.add(c);
  }

  // The circulation reaches each link site (model.js) that is on this floor's outline.
  if (b.stairs.length)
    for (const site of b.sites || []) {
      if (site.from && ph.k1 <= site.from) continue;
      const c0 = R.cellXZ(site.P[0] - site.n[0] * (WALL + G / 2), site.P[1] - site.n[1] * (WALL + G / 2));
      if (c0 < 0 || code[c0] === OUT || code[c0] === FLIGHT) continue;
      anchor.add(c0);
      if (!circ(code[c0])) carve(new Set([c0]));
    }

  // Each piece of floor reaches the circulation, by a passage if need be.
  const pieces = () => {
    const seen = new Uint8Array(N), out = [];
    for (let c = 0; c < N; c++) {
      if (seen[c] || code[c] !== FREE) continue;
      const list = [c];
      seen[c] = 1;
      let touch = false;
      for (let q = 0; q < list.length; q++)
        for (const n of nb(list[q])) {
          if (circ(code[n])) touch = true;
          if (!seen[n] && code[n] === FREE) { seen[n] = 1; list.push(n); }
        }
      out.push({ cells: list, touch });
    }
    return out;
  };
  if (b.stairs.length)
    for (let guard = 0; guard < 8; guard++) {
      const far = pieces().filter((p) => !p.touch && p.cells.length * G * G >= 4);
      if (!far.length) break;
      far.sort((p, q) => q.cells.length - p.cells.length);
      if (!carve(new Set(far[0].cells))) break;
    }

  // Units: each piece is cut across a into units of about the target size. INFERRED from the
  // sources: flats of "around 200 square feet" (19 m2) in 1963 (p130) and of 200-600 sq ft
  // (WSJ 2014); a divided flat of about 25 m2 on the survey plans of 1987 (p340); factories of
  // 480 and 600 sq ft (45 and 56 m2, pp169, 292), most of them low down (Suenn Ho, p139);
  // shops and workshops on G/F. Each building has its own flat size (b.home, model.js).
  const hall = !b.stairs.length && b.wingOf === undefined; // one room: a Yamen hall, a hut
  const use = hall ? 'hall' : ph.k0 === 0 ? 'shop' : ph.use === 'factory' ? 'factory' : 'flat';
  const target = { hall: Infinity, shop: SHOP, factory: FACTORY, flat: b.home || HOME }[use];
  const units = [];
  const newUnit = (cells) => {
    const u = { id: units.length, cells, area: cells.length * G * G, kind: use };
    for (const c of cells) code[c] = UNIT + u.id;
    units.push(u);
    return u;
  };
  // The pieces of circulation now: a piece of floor that meets two of them (the two landings
  // of a straight stair with no corridor) is one unit, the way from one flight to the next.
  const circComp = new Int32Array(N).fill(-1);
  for (let c = 0, nc = 0; c < N; c++) {
    if (circComp[c] >= 0 || !circ(code[c])) continue;
    const list = [c];
    circComp[c] = nc;
    for (let q = 0; q < list.length; q++) for (const n of nb(list[q])) if (circComp[n] < 0 && circ(code[n])) { circComp[n] = nc; list.push(n); }
    nc++;
  }
  for (const p of pieces()) {
    const area = p.cells.length * G * G;
    if (area < 2.5 && p.touch && b.stairs.length) { for (const c of p.cells) code[c] = CORR; continue; }
    const meets = new Set();
    for (const c of p.cells) for (const n of nb(c)) if (circComp[n] >= 0) meets.add(circComp[n]);
    const n = meets.size > 1 && area < 60 ? 1 : Math.max(1, Math.min(Math.round(area / target), Math.floor(area / MIN_UNIT)));
    if (n === 1) { newUnit(p.cells); continue; }
    const byI = [...p.cells].sort((x, y) => (x % ni) - (y % ni));
    const per = byI.length / n;
    let cur = [], lastI = -1;
    const cuts = [];
    for (const c of byI) {
      const i = c % ni;
      if (cur.length >= per && i !== lastI && cuts.length < n - 1) { cuts.push(cur); cur = []; }
      cur.push(c);
      lastI = i;
    }
    cuts.push(cur);
    for (const part of cuts) if (part.length) newUnit(part);
  }
  // A unit that does not touch the circulation (or the stair landing), a unit of less than
  // MIN_UNIT m2, or a small strip joins the neighbour unit it shares most wall with. A small
  // one with no neighbour unit is one room off the corridor (or part of the corridor).
  const touches = (u) => u.cells.some((c) => nb(c).some((n) => circ(code[n])));
  // A room is at least THICK wide somewhere: a square of THICK fits in it.
  const k = Math.round(THICK / G);
  const fits = (u) => u.cells.some((c) => {
    const i = c % ni, j = (c / ni) | 0;
    if (i + k > ni || j + k > nj) return false;
    for (let dj = 0; dj < k; dj++) for (let di = 0; di < k; di++) if (code[(j + dj) * ni + i + di] !== UNIT + u.id) return false;
    return true;
  });
  for (let guard = 0; guard < 6; guard++) {
    let changed = false;
    for (const u of units) {
      if (!u.cells.length) continue;
      // less than a cubicle of about 80 sq ft, or a small strip
      const area = u.cells.length * G * G, thin = area < 12 && !fits(u);
      const small = area < MIN_UNIT || thin;
      if (!b.stairs.length) {
        // No circulation (a wing, a hall): a corner of less than 1.5 m2 is a void; a small
        // room joins its neighbour.
        if (area >= MIN_UNIT) continue;
        if (area < 1.5) { for (const c of u.cells) code[c] = OUT; u.cells = []; changed = true; continue; }
      } else if (!small && touches(u)) continue;
      const count = new Map();
      for (const c of u.cells) for (const n of nb(c)) if (code[n] >= UNIT && code[n] !== UNIT + u.id) count.set(code[n], (count.get(code[n]) || 0) + 1);
      if (!count.size && !b.stairs.length) continue;
      if (!count.size) {
        // A strip or a corner of less than 4 m2 off the corridor is part of it; a closed one
        // is a duct. The rest is one room (kind 'room': a cubicle or a store).
        if (area < 4 || (thin && area < 8) || !touches(u)) { for (const c of u.cells) code[c] = touches(u) ? CORR : OUT; u.cells = []; changed = true; }
        continue;
      }
      const to = units[[...count].sort((x, y) => y[1] - x[1])[0][0] - UNIT];
      for (const c of u.cells) code[c] = UNIT + to.id;
      to.cells.push(...u.cells);
      u.cells = [];
      changed = true;
    }
    if (!changed) break;
  }
  // A small flat (under 0.75 of the target) joins the neighbour flat that it shares most wall
  // with, if the two together are not over 1.7 times the target.
  if (use === 'flat' || use === 'shop')
    for (const u of units) {
      if (!u.cells.length || u.cells.length * G * G >= 0.75 * target) continue;
      const count = new Map();
      for (const c of u.cells) for (const n of nb(c)) if (code[n] >= UNIT && code[n] !== UNIT + u.id) count.set(code[n], (count.get(code[n]) || 0) + 1);
      const best = [...count].sort((x, y) => y[1] - x[1]).map(([v]) => units[v - UNIT]).find((o) => (o.cells.length + u.cells.length) * G * G <= 1.7 * target);
      if (!best) continue;
      for (const c of u.cells) code[c] = UNIT + best.id;
      best.cells.push(...u.cells);
      u.cells = [];
    }
  // A corridor ends at the last unit that it serves: the dead end past it is part of the
  // units beside it (a short corridor, as in the tong lau plan).
  for (const st of b.stairs) {
    if (!st.spine) continue;
    const w0 = st.side < 0 ? st.w0 - SPINE : st.w1, w1 = w0 + SPINE;
    const rows = [];
    for (let j = 0; j < nj; j++) if (R.w(j) >= w0 - 1e-6 && R.w(j) < w1 - 1e-6) rows.push(j);
    if (!rows.length) continue;
    const jt = rows[0] - 1, jb = rows[rows.length - 1] + 1, half = rows.length >> 1;
    const ia = Math.floor((st.a0 - R.A0) / G), ib = Math.ceil((st.a1 - R.A0) / G) - 1;
    const unitAt = (j, i) => (j >= 0 && j < nj && code[j * ni + i] >= UNIT ? units[code[j * ni + i] - UNIT] : null);
    for (const dir of [1, -1]) {
      const gone = new Set();
      for (let i = dir > 0 ? ni - 1 : 0; dir > 0 ? i > ib : i < ia; i -= dir) {
        const col = rows.map((j) => j * ni + i);
        if (col.every((c) => code[c] === OUT)) continue;
        if (col.some((c) => code[c] !== CORR || anchor.has(c))) break;
        const side = [jt, jb].map((j) => (j >= 0 && j < nj ? code[j * ni + i] : OUT));
        if (side.some((v) => v !== OUT && v < UNIT)) break; // a passage or a stair joins here
        const up = unitAt(jt, i), down = unitAt(jb, i);
        if (!up && !down) break;
        for (const c of col) gone.add(c);
        const left = (u) => u.cells.filter((c) => nb(c).some((n) => circ(code[n]) && !gone.has(n))).length;
        if ((up && left(up) < 4) || (down && left(down) < 4)) { for (const c of col) gone.delete(c); break; }
        col.forEach((c, r) => {
          const u = (r < half ? up : down) || up || down;
          code[c] = UNIT + u.id;
          u.cells.push(c);
        });
      }
    }
  }
  // Renumber the units that are left.
  const keep = units.filter((u) => u.cells.length);
  keep.forEach((u, i) => {
    u.id = i; u.area = u.cells.length * G * G;
    for (const c of u.cells) code[c] = UNIT + i;
    if (u.area < MIN_UNIT && b.stairs.length) u.kind = 'room'; // one room: a cubicle or a store
  });
  plan.units = keep;

  // The pieces of circulation (landings and corridors joined), numbered.
  const comp = new Int32Array(N).fill(-1);
  let ncomp = 0;
  for (let c = 0; c < N; c++) {
    if (comp[c] >= 0 || !circ(code[c])) continue;
    const list = [c];
    comp[c] = ncomp;
    for (let q = 0; q < list.length; q++) for (const n of nb(list[q])) if (comp[n] < 0 && circ(code[n])) { comp[n] = ncomp; list.push(n); }
    ncomp++;
  }
  // The doors of each unit: one to each piece of circulation that it meets, on its longest
  // straight boundary with that piece, 3 cells wide (0.75 m) or the whole boundary if shorter.
  for (const u of keep) {
    const runs = new Map(); // piece + line -> positions
    for (const c of u.cells) {
      const i = c % ni, j = (c / ni) | 0;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ii = i + di, jj = j + dj;
        if (ii < 0 || jj < 0 || ii >= ni || jj >= nj || !circ(code[jj * ni + ii])) continue;
        // A boundary across a (di) is a line at a fixed i; across w (dj) at a fixed j.
        const line = di ? `a${i + (di > 0 ? 1 : 0)}` : `w${j + (dj > 0 ? 1 : 0)}`, p = comp[jj * ni + ii];
        const key = `${p}:${line}`;
        if (!runs.has(key)) runs.set(key, { line, p, di, dj, pos: [] });
        runs.get(key).pos.push(di ? j : i);
      }
    }
    const best = new Map(); // piece -> best run
    for (const r of runs.values()) {
      const pos = [...new Set(r.pos)].sort((x, y) => x - y);
      let s = 0;
      for (let q = 1; q <= pos.length; q++)
        if (q === pos.length || pos[q] !== pos[q - 1] + 1) {
          const len = q - s, o = best.get(r.p);
          if (!o || len > o.len) best.set(r.p, { r, from: pos[s], len });
          s = q;
        }
    }
    u.doors = [];
    for (const { r, from: f0, len } of best.values()) {
      const w = Math.min(3, len), from = f0 + Math.floor((len - w) / 2), line = +r.line.slice(1);
      const door = { unit: u.id, comp: r.p, axis: r.line[0], line, from, to: from + w, inward: r.di || r.dj };
      // the door's middle, in the frame
      door.a = door.axis === 'a' ? R.A0 + line * G : R.A0 + ((from + door.to) / 2) * G;
      door.w = door.axis === 'w' ? R.W0 + line * G : R.W0 + ((from + door.to) / 2) * G;
      u.doors.push(door);
      plan.doors.push(door);
    }
    u.door = u.doors[0] || null;
  }
  plan.comp = comp; plan.ncomp = ncomp;
  for (const u of keep) {
    let sa = 0, sw = 0;
    for (const c of u.cells) { sa += R.a(c % ni); sw += R.w((c / ni) | 0); }
    u.a = sa / u.cells.length; u.w = sw / u.cells.length;
    [u.x, u.z] = toXZ(b.F, u.a, u.w);
  }
  return plan;
}
