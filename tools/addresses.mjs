// Where a house number is: the house numbers printed on the base plan of Suenn Ho's (何巽)
// route maps of 1991 (M+ CA17/2/1-3), read tile by tile and fitted to data/plan.json
// (data/address_anchors.json, tools/route_map_fit.py). Used by tools/build_room_uses.mjs.
//
// A number is a label at a point of the plan. A label belongs to each street whose frontage
// plots (L.frontage) are within FRONT_M of the point, and its plot is the nearest frontage plot
// of that street (the map's lots reach the road edge; the model's plots can stop a few metres
// short of it). Along each street, the
// numbers must run in order: the longest run in order is kept (on each side apart where the
// odd and the even numbers face each other), and a label out of that order is dropped (a
// misreading, or a corner plot of another street).
//
// resolve(street, numText, floor): the model building of an address, and how it was found:
//   'route map'  the map prints this number (or a range with it) on a plot of this street;
//   'route map, between'  the map does not print it: the point between the two nearest numbers
//              that it prints on this street (on the same side), and the frontage plot nearest
//              that point;
//   'route map, beyond'   at most BEYOND past the last number that the map prints on this street: the
//              plot of that number.
// null if the map prints no number on this street, or if the number is further past its range
// (for example Lung Chun Road (龍津道) 1-70: the map prints 160 down to 72 only).
const MARGIN = 18; // the margin of the layout grid round the plan (src/layout.js)
const FRONT_M = 5;
const LANE_TIE = 2;
const BEYOND = 4; // numbers past the printed range: only this far, else the map does not give the place

// "152-150" -> 150..152; "31E" -> 31 with suffix E; "13-14" -> 13, 14; "No. 4E" -> 4 with E
export function parseNum(t) {
  const s = String(t ?? '').replace(/^No\.?\s*/i, '').replace(/\s+/g, '').replace(/[–—~]/g, '-');
  const m = s.match(/^(\d+)([A-Z]?)(?:-(\d+)([A-Z]?))?/i);
  if (!m) return null;
  const a = +m[1], b = m[3] ? +m[3] : a, lo = Math.min(a, b), hi = Math.max(a, b);
  if (hi - lo > 12) return null;
  return { lo, hi, n: a, suffix: !m[3] && m[2] ? m[2].toUpperCase() : '', range: hi > lo };
}

// the longest subsequence of xs (sorted by position) whose numbers do not decrease
function longestRun(xs) {
  const n = xs.length, len = new Array(n).fill(1), prev = new Array(n).fill(-1);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < i; j++)
      if (xs[j].key <= xs[i].key && len[j] + 1 > len[i]) { len[i] = len[j] + 1; prev[i] = j; }
  let best = 0;
  for (let i = 1; i < n; i++) if (len[i] > len[best]) best = i;
  const out = [];
  for (let i = n ? best : -1; i >= 0; i = prev[i]) out.push(xs[i]);
  return out.reverse();
}

export function makeAddresses(L, S, anchors) {
  const ownerAt = (x, z) => {
    const i = Math.floor(x) + MARGIN, j = Math.floor(z) + MARGIN;
    return i < 0 || j < 0 || i >= L.W || j >= L.D ? -1 : L.owner[j * L.W + i];
  };
  const plotNear = (x, z, r = 2.5) => {
    const q = ownerAt(x, z);
    if (q >= 0) return q;
    let best = -1, bd = Infinity;
    for (let dz = -r; dz <= r; dz += 0.5)
      for (let dx = -r; dx <= r; dx += 0.5) {
        const d = Math.hypot(dx, dz), qq = d <= r ? ownerAt(x + dx, z + dz) : -1;
        if (qq >= 0 && d < bd) { bd = d; best = qq; }
      }
    return best;
  };
  // the cells (plan metres) of each street's frontage plots
  const cellsOf = new Map();
  for (let k = 0; k < L.owner.length; k++) {
    const q = L.owner[k];
    if (q < 0) continue;
    if (!cellsOf.has(q)) cellsOf.set(q, []);
    cellsOf.get(q).push([(k % L.W) - MARGIN + 0.5, Math.floor(k / L.W) - MARGIN + 0.5]);
  }
  const frontCells = {};
  for (const [s, F] of Object.entries(L.frontage)) frontCells[s] = F.flatMap((q) => (cellsOf.get(q) || []).map((c) => [...c, q]));
  const nearestFront = (s, x, z) => {
    let best = null, bd = Infinity;
    for (const [cx, cz, q] of frontCells[s] || []) {
      const d = Math.hypot(cx - x, cz - z);
      if (d < bd) { bd = d; best = q; }
    }
    return { q: best, d: bd };
  };
  // each street's axis: the main direction of its frontage cells, and the side of a point
  const axis = {};
  for (const [s, C] of Object.entries(frontCells)) {
    if (!C.length) continue;
    let mx = 0, mz = 0;
    for (const [x, z] of C) { mx += x / C.length; mz += z / C.length; }
    let xx = 0, xz = 0, zz = 0;
    for (const [x, z] of C) { xx += (x - mx) ** 2; xz += (x - mx) * (z - mz); zz += (z - mz) ** 2; }
    const th = 0.5 * Math.atan2(2 * xz, xx - zz);
    axis[s] = { mx, mz, ux: Math.cos(th), uz: Math.sin(th) };
  }
  const along = (s, x, z) => (x - axis[s].mx) * axis[s].ux + (z - axis[s].mz) * axis[s].uz;
  const side = (s, x, z) => Math.sign(-(x - axis[s].mx) * axis[s].uz + (z - axis[s].mz) * axis[s].ux) || 1;

  // the lane cells of each inner street, from the layout's walk along it (L.streetLanes). The
  // three roads round the City have none: for them the distance to the frontage plots counts.
  const laneCells = {};
  for (const [s, cells] of Object.entries(L.streetLanes || {})) laneCells[s] = cells;
  const laneDist = (s, x, z) => {
    let bd = Infinity;
    for (const k of laneCells[s] || []) bd = Math.min(bd, Math.hypot((k % L.W) - MARGIN + 0.5 - x, Math.floor(k / L.W) - MARGIN + 0.5 - z));
    return bd;
  };

  // ---- the labels of each street, in order ----
  // A label goes to each street whose frontage plots are within FRONT_M, but only to the
  // nearest of those streets (by its lane), and to another one only if that lane is within
  // LANE_TIE metres as near (a corner lot): a block between two streets fronts both.
  const raw = {};
  for (const a of anchors.labels) {
    if (a.kind !== 'number') continue;
    const pn = parseNum(a.text);
    if (!pn) continue;
    const [x, z] = a.plan;
    const cand = Object.keys(frontCells).map((s) => ({ s, f: nearestFront(s, x, z) })).filter((c) => c.f.d <= FRONT_M)
      .map((c) => ({ ...c, lane: laneCells[c.s] ? laneDist(c.s, x, z) : c.f.d }));
    const near = Math.min(...cand.map((c) => c.lane));
    for (const { s, f, lane } of cand) {
      if (lane > near + LANE_TIE) continue;
      (raw[s] ||= []).push({ ...pn, text: a.text, x, z, q: f.q, b: S.ofPlot[f.q], conf: a.confidence, t: along(s, x, z), side: side(s, x, z) });
    }
  }
  const streets = {};
  for (const [s, list] of Object.entries(raw)) {
    const byT = [...list].sort((a, b) => a.t - b.t);
    // numbers in one run (rising or falling along the axis), or two runs: odd and even apart
    const run = (xs, dir) => longestRun(xs.map((a) => ({ ...a, key: dir * (a.lo + (a.suffix ? (a.suffix.charCodeAt(0) - 64) / 100 : 0)) })));
    const one = [run(byT, 1), run(byT, -1)].sort((a, b) => b.length - a.length)[0];
    const split = [0, 1].map((par) => {
      const xs = byT.filter((a) => a.lo % 2 === par);
      return [run(xs, 1), run(xs, -1)].sort((a, b) => b.length - a.length)[0];
    });
    const two = split[0].length + split[1].length;
    const sides = split.map((xs) => xs.reduce((acc, a) => acc + a.side, 0) / Math.max(1, xs.length));
    const parity = two >= one.length + 3 && Math.min(split[0].length, split[1].length) >= Math.max(4, 0.25 * two) && Math.sign(sides[0]) !== Math.sign(sides[1]) && Math.abs(sides[0]) > 0.5 && Math.abs(sides[1]) > 0.5;
    const kept = parity ? [...split[0], ...split[1]] : one;
    streets[s] = { parity, kept, dropped: list.length - kept.length, all: list.length };
  }

  function resolve(s, numText, floor = 0) {
    const st = streets[s], pn = parseNum(numText);
    if (!st || !st.kept.length || !pn) return null;
    const tall = (b) => b != null && S.list[b] && S.list[b].kind !== 'yamen' && S.list[b].n + (S.list[b].roofRoom ? 1 : 0) > floor;
    const pick = (x, z, q, how) => {
      let b = S.ofPlot[q];
      if (!tall(b)) { // a building too low for the floor: a frontage plot within 4 m that is tall enough (the fit), else this one
        let best = null, bd = Infinity;
        for (const [cx, cz, qq] of frontCells[s]) {
          const d = Math.hypot(cx - x, cz - z);
          if (d < bd && d <= 4 && tall(S.ofPlot[qq])) { bd = d; best = qq; }
        }
        if (best != null) b = S.ofPlot[best];
        else return { b, how, low: true };
      }
      return { b, how };
    };
    const pool = st.parity ? st.kept.filter((a) => a.lo % 2 === pn.n % 2) : st.kept;
    // the number on the map: the same text, or a range with it, or the same number with another letter
    const same = pool.filter((a) => a.lo <= pn.n && pn.n <= a.hi);
    if (same.length) {
      const exact = same.find((a) => !a.range && a.suffix === pn.suffix) || same.find((a) => a.range) || same.find((a) => !a.suffix) || same[0];
      return pick(exact.x, exact.z, exact.q, 'route map');
    }
    // between the two nearest numbers on the map
    const lower = pool.filter((a) => a.hi < pn.n).sort((a, b) => b.hi - a.hi)[0];
    const upper = pool.filter((a) => a.lo > pn.n).sort((a, b) => a.lo - b.lo)[0];
    if (lower && upper) {
      const f = (pn.n - lower.hi) / (upper.lo - lower.hi), x = lower.x + f * (upper.x - lower.x), z = lower.z + f * (upper.z - lower.z);
      const { q } = nearestFront(s, x, z);
      return pick(x, z, q, 'route map, between');
    }
    // past the last number that the map prints: only near it (BEYOND numbers), else unknown
    const end = lower || upper, gap = lower ? pn.n - lower.hi : upper.lo - pn.n;
    if (gap > BEYOND) return null;
    return pick(end.x, end.z, end.q, 'route map, beyond');
  }
  // the numbers that the map prints on the plots of building b, for the docs
  const numbersOf = new Map();
  for (const [s, st] of Object.entries(streets))
    for (const a of st.kept) {
      if (!numbersOf.has(a.b)) numbersOf.set(a.b, new Map());
      const m = numbersOf.get(a.b);
      if (!m.has(s)) m.set(s, new Set());
      m.get(s).add(a.text);
    }
  return { resolve, streets, numbersOf };
}
