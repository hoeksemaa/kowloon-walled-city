// The ways between the spaces of the City: doors from the lanes, doors through party walls,
// bridges over the lanes, stairs, and steps and ladders from roof to roof. They make one graph,
// with the lanes, thus a route from any room to any other can go through other buildings and
// over the roofs, as well as down to the lanes.
//
// SOURCED: corridors that run through several buildings, bridges over the light wells, and
// stair huts on the roofs (Terasawa's fold-out); stairs that two to four buildings share, and a
// floor where three stairs share the landings (pp138-139, p340); people crossed the City over
// the roofs (pp106, 194, 253, 283); bridges from a building to its neighbour (p167). Between
// roofs one storey apart, a ladder; where a taller building is two or three storeys over a
// roof, a corridor window, opened, with a stool under it (Lam Po Chun, p145). INFERRED: where
// each door, bridge, ladder, hole and window is. A door through a party wall joins two floors
// that are within DOOR_DY of each other, with steps. No source shows a plank between roofs,
// thus the model has none. Only two buildings had lifts (pp146, 179), and no source names
// them, thus the model has none.
import { LANE, YARD, ROAD, OUTSIDE } from '../footprint.js';
import { G, OUT, FLIGHT, LANDING, CORR, UNIT, stairParts, risers } from './plan.js';
import { toXZ, toAW, segDist, inRings } from './poly.js';
import { PARAPET, CHAIN_FLOORS, routeCorners } from './model.js';

const WALL = 0.2, HUT = 2.4;
export const DOOR_DY = 0.95; // m of steps in a party door
const LOOSE_DY = 1.2; // m: a window or a door on the SW-NE route, with steps or a stool
const HOLE_DY = 0.3; // m: a hole joins two floors that are nearly level
// m: the most a person climbs from roof to roof with no aid: 0.5 m of step over a 1 m parapet,
// thus 1.5 m of wall in all. A higher wall needs a ladder.
const CLIMB = 1.5;
// m: two roofs within this of each other, with no parapet between them, make one open roof.
const FLAT_DY = 0.3;
const BRIDGE_W = 3.5, BRIDGE_DY = 0.6, ROOF_DY = 3.2;
const SILL = 1.0, STOOL = 0.45; // m: a corridor window over the floor, and a stool under it
const SPAN_N = 40, HOLE_N = 40; // flats that span two buildings, and holes between buildings
// The rate of party doors on a floor, by its height (INFERRED from the passages research: most
// links between buildings were on 1/F to 5/F, few above 9/F; pp164, 175).
const byHeight = (k) => (k === 0 ? 0.1 : k <= 5 ? 0.35 : k <= 9 ? 0.15 : 0.05);
const STREET = new Set([LANE, YARD, ROAD, OUTSIDE]);
const circ = (v) => v === LANDING || v === CORR;
// A building of one room with no stair (a hall of the Yamen, a hut, the temple): a door can
// open into the room itself.
const roomy = (b) => b.kind === 'yamen' || (!b.stairs.length && b.wingOf === undefined);
const pass = (b, v) => circ(v) || (v >= UNIT && roomy(b));
const UP = 3.5, DOWN = 2.5; // cost of 1 m up or down a stair, in metres of level walking

// The nearest ring edge to (x, z): { r, i, t (metres from pts[i]), d, n (out), len }.
export function nearestEdge(rings, x, z) {
  let best = null;
  for (const r of rings)
    for (let i = 0; i < r.pts.length; i++) {
      const A = r.pts[i], B = r.pts[(i + 1) % r.pts.length], d = segDist(x, z, A, B);
      if (best && d >= best.d) continue;
      const dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz) || 1e-9;
      const t = Math.max(0, Math.min(len, ((x - A[0]) * dx + (z - A[1]) * dz) / len));
      best = { r, i, t, d, len, n: [dz / len, -dx / len], P: [A[0] + (dx / len) * t, A[1] + (dz / len) * t] };
    }
  return best;
}

export function buildLinks(S) {
  const { L, T } = S;
  // the random choices (choices.js): a number for each key, from the old sequence 4242 in record mode
  const C = S.choices, R = (key) => C.num(key, 4242), O = (key) => C.order(key, 4242);
  const bk = (b) => (typeof b === 'number' ? S.list[b] : b).key;
  const pk = (x) => `${bk(x.b)}:${bk(x.c)}`;
  // a pair of buildings and a floor, in one order: the building with the lower key first, and its floor
  const ck = (x) => (bk(x.b) < bk(x.c) ? `${bk(x.b)}:${bk(x.c)}:${x.k}` : `${bk(x.c)}:${bk(x.b)}:${x.kc}`);
  const ckPair = (x) => (bk(x.b) < bk(x.c) ? `${bk(x.b)}:${bk(x.c)}` : `${bk(x.c)}:${bk(x.b)}`);
  const nodes = [], E = [];
  const node = (x, y, z, kind, extra = {}) => { nodes.push({ x, y, z, kind, ...extra }); return nodes.length - 1; };
  const edge = (a, b, cost, kind) => E.push([a, b, cost, kind]);
  const regions = new Map();
  const put = (key, id) => { if (key == null) return; if (!regions.has(key)) regions.set(key, []); regions.get(key).push(id); };
  S.openings = []; // { b, k, r, i, t, w, y0, y1, kind }: a hole in a wall (mesh.js)
  S.doors = []; // every door, bridge and ladder, for the mesh and the counts
  S.chainGaps = 0; // links of the SW-NE route that found no place
  const open = (b, k, e, w, y0, y1, kind) => S.openings.push({ b: b.id, k, r: e.r, i: e.i, t: e.t, w, y0, y1, kind });

  const planOf = (b, k) => b.phaseOf(k).plan;
  const cellAt = (b, k, x, z) => { const p = planOf(b, k); const c = p.R.cellXZ(x, z); return c < 0 ? OUT : p.code[c]; };
  const regionAt = (b, k, x, z) => {
    const p = planOf(b, k), c = p.R.cellXZ(x, z);
    if (c < 0) return null;
    const v = p.code[c];
    if (circ(v)) return `c:${b.id}:${k}:${p.comp[c]}`;
    if (v >= UNIT) return `u:${b.id}:${k}:${v - UNIT}`;
    return null;
  };
  const roofKey = (b) => `r:${b.id}`;
  // A roof can be walked on unless a building stands over it (an annex) with no room between.
  for (const b of S.list) b.roofOpen = !b.pitched && (!b.over || b.over.gap >= HUT + 0.3);

  // ---- the lanes: a node on each 1 m cell of lane, yard and road, and of the street round ----
  const laneNode = new Int32Array(L.N).fill(-1);
  for (let k = 0; k < L.N; k++) {
    if (L.owner[k] >= 0 || (L.inside[k] && !L.alley[k])) continue;
    const x = L.cellX(k), z = L.cellZ(k);
    laneNode[k] = node(x, T.h(x, z), z, 'lane', { cell: k });
  }
  for (let k = 0; k < L.N; k++) {
    if (laneNode[k] < 0) continue;
    const i = k % L.W, j = (k / L.W) | 0, a = nodes[laneNode[k]];
    for (const [di, dj] of [[1, 0], [0, 1], [1, 1], [-1, 1]]) {
      const ii = i + di, jj = j + dj;
      if (ii < 0 || jj < 0 || ii >= L.W || jj >= L.D) continue;
      const n = laneNode[jj * L.W + ii];
      if (n < 0) continue;
      // a diagonal step only where both side cells are open
      if (di && dj && (laneNode[j * L.W + ii] < 0 || laneNode[jj * L.W + i] < 0)) continue;
      const bN = nodes[n], dy = bN.y - a.y;
      edge(laneNode[k], n, Math.hypot(di, dj) + Math.abs(dy) * 1.5, 'lane');
    }
  }
  const laneAt = (x, z) => {
    const i = Math.floor(x - L.x0), j = Math.floor(z - L.z0);
    let best = -1, bd = Infinity;
    for (let dj = -2; dj <= 2; dj++)
      for (let di = -2; di <= 2; di++) {
        const ii = i + di, jj = j + dj;
        if (ii < 0 || jj < 0 || ii >= L.W || jj >= L.D) continue;
        const n = laneNode[jj * L.W + ii];
        if (n < 0) continue;
        const d = Math.hypot(nodes[n].x - x, nodes[n].z - z);
        if (d < bd) { bd = d; best = n; }
      }
    return best;
  };

  // ---- units, unit doors and stairs ----
  S.unitNode = new Map();
  for (const b of S.list)
    for (let k = 0; k < b.n; k++) {
      const p = planOf(b, k), y = b.y[k];
      for (const u of p.units) {
        const id = node(u.x, y, u.z, 'unit', { b: b.id, k, u: u.id, area: u.area });
        S.unitNode.set(`${b.id}:${k}:${u.id}`, id);
        put(`u:${b.id}:${k}:${u.id}`, id);
        for (const d of u.doors) {
          const [x, z] = toXZ(b.F, d.a, d.w);
          const dn = node(x, y, z, 'door', { b: b.id, k });
          put(`u:${b.id}:${k}:${u.id}`, dn);
          put(`c:${b.id}:${k}:${d.comp}`, dn);
        }
      }
    }
  for (const b of S.list) {
    b.stairNodes = [];
    for (const st of b.stairs) {
      const pa = stairParts(st), list = [];
      const mid = (a0, a1, w0, w1) => toXZ(b.F, (a0 + a1) / 2, (w0 + w1) / 2);
      for (let k = 0; k <= b.n; k++) {
        const y = b.y[k], top = k === b.n;
        if (top && !b.roofOpen) break;
        const key = top ? roofKey(b) : null;
        if (st.type === 'dogleg') {
          const [x, z] = mid(...pa.landings[0], st.w0, st.w1);
          const n = node(x, y, z, 'landing', { b: b.id, k });
          put(key || regionAt(b, k, x, z), n);
          list.push({ k, land: n });
        } else {
          const [x0, z0] = mid(...pa.landings[0], st.w0, st.w1), [x1, z1] = mid(...pa.landings[1], st.w0, st.w1);
          const n0 = top ? -1 : node(x0, y, z0, 'landing', { b: b.id, k }), n1 = node(x1, y, z1, 'landing', { b: b.id, k });
          if (!top) put(regionAt(b, k, x0, z0), n0);
          put(key || regionAt(b, k, x1, z1), n1);
          list.push({ k, bottom: n0, top: n1 });
        }
      }
      // the flights
      for (let q = 0; q + 1 < list.length; q++) {
        const k = list[q].k, h = b.h[k];
        if (st.type === 'dogleg') {
          const [x, z] = mid(pa.flights[0], pa.flights[1], st.w0, st.w1);
          const far = toXZ(b.F, pa.at(pa.len - pa.LB / 2), (st.w0 + st.w1) / 2);
          const hn = node(far[0], b.y[k] + h / 2, far[1], 'half', { b: b.id, k });
          list[q].half = hn;
          put(`h:${b.id}:${b.stairs.indexOf(st)}:${k}`, hn);
          const run = pa.len - pa.LA;
          edge(list[q].land, hn, run + 1 + UP * h / 2, 'stair');
          edge(hn, list[q + 1].land, run + 1 + UP * h / 2, 'stair');
          void x; void z;
        } else {
          edge(list[q].bottom, list[q + 1].top, pa.len - 2 * pa.land + 1 + UP * h, 'stair');
        }
      }
      b.stairNodes.push(list);
    }
  }

  // ---- doors to the lanes ----
  // On each floor, a cell of the circulation or of a G/F unit on a wall that faces a lane gets
  // a door if the lane there is within reach of the floor: 1.2 m of steps on G/F, 0.5 m above.
  for (const b of S.list) {
    b.street = 0;
    for (let k = 0; k < b.n; k++) {
      const p = planOf(b, k), { R, code } = p, y = b.y[k];
      const runs = new Map();
      for (let c = 0; c < code.length; c++) {
        const v = code[c];
        if (v === OUT || v === FLIGHT) continue;
        if (v >= UNIT && k > 0) continue;
        const i = c % R.ni, j = (c / R.ni) | 0;
        if (!(i === 0 || j === 0 || i === R.ni - 1 || j === R.nj - 1 || !code[c - 1] || !code[c + 1] || !code[c - R.ni] || !code[c + R.ni])) continue;
        const [x, z] = R.xz(i, j);
        const e = nearestEdge(p.inner ? b.phaseOf(k).rings : [], x, z);
        if (!e || e.d > WALL + G || !STREET.has(e.r.other[e.i])) continue;
        const Q = [e.P[0] + e.n[0] * 0.6, e.P[1] + e.n[1] * 0.6];
        if (S.openWidth(e.P[0], e.P[1], e.n[0], e.n[1], b) < 0.9) continue;
        const g = T.h(Q[0], Q[1]);
        if (Math.abs(y - g) > (k === 0 ? 1.25 : 0.5)) continue;
        const key = `${e.r === undefined ? 0 : b.phaseOf(k).rings.indexOf(e.r)}:${e.i}:${circ(v) ? 'c' + p.comp[c] : 'u' + v}`;
        if (!runs.has(key)) runs.set(key, []);
        runs.get(key).push({ c, e, g, v });
      }
      for (const list of runs.values()) {
        if (list.length < 3) continue;
        list.sort((p1, p2) => p1.e.t - p2.e.t);
        const m = list[list.length >> 1], e = m.e;
        const shop = m.v >= UNIT;
        const w = shop ? Math.min(2.6, Math.max(0.9, (list[list.length - 1].e.t - list[0].e.t) * 0.8)) : 1.0;
        if (e.t < w / 2 + 0.15 || e.t > e.len - w / 2 - 0.15) continue;
        const ln = laneAt(e.P[0] + e.n[0] * 0.6, e.P[1] + e.n[1] * 0.6);
        if (ln < 0) continue;
        const [x, z] = R.xz(m.c % R.ni, (m.c / R.ni) | 0);
        const dn = node(e.P[0], y, e.P[1], 'street', { b: b.id, k });
        put(regionAt(b, k, x, z), dn);
        edge(dn, ln, 0.8 + Math.abs(y - m.g) * (UP + DOWN) / 2, 'street');
        open(b, k, e, w, y, y + (shop ? 2.6 : 2.15), shop ? 'shop' : 'door');
        S.doors.push({ kind: shop ? 'shop' : 'street', b: b.id, k, x: e.P[0], z: e.P[1], n: e.n, y, ground: m.g, w });
        b.street++;
      }
    }
  }

  // ---- doors through party walls, and onto the roofs of lower neighbours ----
  // Each candidate is a run of 0.75 m or more of a wall that two floors (or a floor and a
  // roof) both touch with their circulation. A wing has a door on each floor to its host.
  const cand = new Map(); // pair key -> list
  const addCand = (b, c, x) => {
    const key = b.id < c.id ? `${b.id}:${c.id}` : `${c.id}:${b.id}`;
    if (!cand.has(key)) cand.set(key, []);
    cand.get(key).push(x);
  };
  for (const b of S.list)
    for (let k = 0; k < b.n; k++) {
      const ph = b.phaseOf(k), y = b.y[k];
      for (const r of ph.rings)
        for (let i = 0; i < r.pts.length; i++) {
          const lab = r.other[i];
          if (lab < 0) continue;
          const A = r.pts[i], B = r.pts[(i + 1) % r.pts.length], dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz);
          if (len < 1.2) continue;
          const tx = dx / len, tz = dz / len, nx = tz, nz = -tx;
          const c = S.fills(lab, y + 0.3);
          const wing = c && (b.wingOf === c.id || c.wingOf === b.id);
          let run = null;
          const flush = () => {
            if (run && run.n >= (wing ? 2 : 3)) {
              const t = (run.t0 + run.t1) / 2, P = [A[0] + tx * t, A[1] + tz * t];
              addCand(b, run.c || S.bOf(lab), { b: b.id, k, c: run.c ? run.c.id : S.bOf(lab).id, kc: run.kc, P, n: [nx, nz], e: { r, i, t, len },
                ra: run.ra, rc: run.rc, y, yc: run.yc, roof: !run.c, wing, len: run.t1 - run.t0, host: run.host });
            }
            run = null;
          };
          for (let t = 0.4; t <= len - 0.4; t += G) {
            const P = [A[0] + tx * t, A[1] + tz * t];
            const qa = [P[0] - nx * (WALL + G / 2), P[1] - nz * (WALL + G / 2)];
            const qc = [P[0] + nx * (WALL + G / 2), P[1] + nz * (WALL + G / 2)];
            const va = cellAt(b, k, qa[0], qa[1]);
            let ok = null;
            if (c && c.id !== b.id && b.id < c.id) {
              // a floor of c within DOOR_DY (the same floor for a wing)
              for (let kc = 0; kc < c.n && !ok; kc++) {
                const dy = c.y[kc] - y;
                if (wing ? kc !== k : Math.abs(dy) > DOOR_DY) continue;
                const vc = cellAt(c, kc, qc[0], qc[1]);
                const aOk = wing ? va !== OUT && va !== FLIGHT : pass(b, va);
                const cOk = wing ? vc !== OUT && vc !== FLIGHT : pass(c, vc);
                if (aOk && cOk) ok = { c, kc, ra: regionAt(b, k, qa[0], qa[1]), rc: regionAt(c, kc, qc[0], qc[1]), yc: c.y[kc], host: circ(wing && c.wingOf === b.id ? va : vc) };
              }
            } else if (!c) {
              // open air over a lower roof: a door onto it, or a corridor window, if the roof is
              // near this floor
              const low = S.bOf(lab), dy = y - (low ? low.top : 0);
              if (low && low.id !== b.id && low.roofOpen && low.kind !== 'yamen' && dy >= -LOOSE_DY && dy <= DOOR_DY && circ(va))
                ok = { c: null, kc: low.n, ra: regionAt(b, k, qa[0], qa[1]), rc: roofKey(low), yc: low.top };
            }
            const same = ok && run && run.kc === ok.kc && run.ra === ok.ra && run.rc === ok.rc;
            if (!same) { flush(); if (ok) run = { ...ok, t0: t, t1: t, n: 1 }; }
            else { run.t1 = t; run.n++; }
          }
          flush();
        }
    }
  // Doors from the half landings of the dog-leg stairs: a half landing on a party wall, with a
  // floor of the neighbour within DOOR_DY of it, can open onto that floor (p340).
  for (const b of S.list)
    b.stairs.forEach((st, si) => {
      if (st.type !== 'dogleg') return;
      const pa = stairParts(st), [h0, h1] = [Math.min(pa.at(pa.len - pa.LB), pa.at(pa.len)), Math.max(pa.at(pa.len - pa.LB), pa.at(pa.len))];
      for (let k = 0; k + 1 < b.n; k++) {
        const yh = b.y[k] + b.h[k] / 2, ph = b.phaseOf(k);
        for (const r of ph.rings)
          for (let i = 0; i < r.pts.length; i++) {
            const lab = r.other[i];
            if (lab < 0) continue;
            const A = r.pts[i], B = r.pts[(i + 1) % r.pts.length], dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz);
            const tx = dx / len, tz = dz / len, nx = tz, nz = -tx;
            const c = S.fills(lab, yh + 0.3);
            if (!c || c.id === b.id || c.wingOf === b.id || b.wingOf === c.id) continue;
            for (let t = 0.5; t <= len - 0.5; t += 0.25) {
              const P = [A[0] + tx * t, A[1] + tz * t];
              const [qa, qw] = toAW(b.F, P[0] - nx * (WALL + G / 2), P[1] - nz * (WALL + G / 2));
              if (qa < h0 + 0.1 || qa > h1 - 0.1 || qw < st.w0 + 0.15 || qw > st.w1 - 0.15) continue;
              const qc = [P[0] + nx * (WALL + G / 2), P[1] + nz * (WALL + G / 2)];
              for (let kc = 0; kc < c.n; kc++) {
                if (Math.abs(c.y[kc] - yh) > LOOSE_DY || !pass(c, cellAt(c, kc, qc[0], qc[1]))) continue;
                addCand(b, c, { b: b.id, k, c: c.id, kc, P, n: [nx, nz], e: { r, i, t, len }, ra: `h:${b.id}:${si}:${k}`, rc: regionAt(c, kc, qc[0], qc[1]),
                  y: yh, yc: c.y[kc], half: true, len: 1 });
                break;
              }
              break;
            }
          }
      }
    });

  // Choose: every floor of a wing. Else each floor of a pair of buildings that has a
  // candidate gets a door at the rate of its height (byHeight) times the factor of the pair
  // (model.js), and a pair with a site gets at least one, low down if it can; a pair with no
  // site gets few. A lower roof
  // next to a corridor (50 %): a corridor window with a stool under it (p145), or a door with
  // steps down where the floor is more than 0.3 m over the roof. A building with no door to a
  // lane gets one on its lowest floor that can have one.
  const chosen = [];
  const shuffle = (a, key) => a.map((x) => [O(key(x)), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);
  const at = (x) => `${pk(x)}:${x.k}:${x.kc}:${Math.round(x.P[0] * 4)}:${Math.round(x.P[1] * 4)}`; // one candidate
  const lowK = (x) => Math.min(x.k, x.kc);
  for (const [key, list] of cand) {
    const wings = list.filter((x) => x.wing);
    if (wings.length) {
      const byK = new Map();
      for (const x of wings) { const o = byK.get(x.k); if (!o || (x.host && !o.host) || (x.host === o.host && x.len > o.len)) byK.set(x.k, x); }
      chosen.push(...byK.values());
      continue;
    }
    const pair = S.pairs.get(key), b0 = S.list[list[0].b], c0 = S.list[list[0].c];
    const yamen = b0.kind === 'yamen' && c0.kind === 'yamen';
    const f = yamen ? 1 : pair ? pair.rate : roomy(b0) || roomy(c0) ? 0 : 0.2;
    const doors = list.filter((x) => !x.roof), roofs = list.filter((x) => x.roof);
    const byK = new Map();
    for (const x of shuffle(doors, (q) => 'd:' + at(q))) { const o = byK.get(x.k); if (!o || (x.half && !o.half) || x.len > o.len) byK.set(x.k, x); }
    let any = false;
    for (const x of byK.values()) if (R(`door:${ck(x)}`) < (yamen ? 1 : f * byHeight(lowK(x)))) { chosen.push(x); any = true; }
    if (!any && pair && f > 0) {
      const tie = (p, q) => (C.record ? O('') - 0.5 : O(`low:${ck(p)}`) - O(`low:${ck(q)}`));
      const low = [...byK.values()].sort((p, q) => byHeight(lowK(q)) - byHeight(lowK(p)) || tie(p, q));
      if (low.length) chosen.push(low[0]);
    }
    if (roofs.length) {
      const x = roofs.sort((p, q) => Math.abs(p.yc - p.y) - Math.abs(q.yc - q.y))[0], dy = x.y - x.yc;
      const win = dy <= 0.3;
      if (R(`roofwin:${pk(x)}`) < 0.5 && (win || dy <= DOOR_DY)) { x.window = win; chosen.push(x); }
    }
  }
  // A wing that has no door to its host on a floor (the host has its stair on each shared
  // wall there) opens onto the corridor of another neighbour on that floor, or else onto a
  // flat of it, on a run of 0.5 m of wall or more.
  const covered = new Set();
  for (const x of chosen) if (x.wing) { covered.add(`${x.b}:${x.k}`); covered.add(`${x.c}:${x.kc}`); }
  for (const d of S.doors) if (d.kind === 'street' || d.kind === 'shop') covered.add(`${d.b}:${d.k}`);
  for (const w of S.list) {
    if (w.wingOf === undefined) continue;
    for (let k = 0; k < w.n; k++) {
      if (covered.has(`${w.id}:${k}`)) continue;
      let best = null;
      for (const r of w.phaseOf(k).rings)
        for (let i = 0; i < r.pts.length; i++) {
          const lab = r.other[i];
          if (lab < 0) continue;
          const c = S.fills(lab, w.y[k] + 0.3);
          if (!c || c.id === w.id || c.wingOf === w.id || roomy(c)) continue;
          const A = r.pts[i], B = r.pts[(i + 1) % r.pts.length], len = Math.hypot(B[0] - A[0], B[1] - A[1]);
          if (len < 1.2) continue;
          const tx = (B[0] - A[0]) / len, tz = (B[1] - A[1]) / len, nx = tz, nz = -tx;
          for (let kc = 0; kc < c.n; kc++) {
            const dy = c.y[kc] - w.y[k];
            if (Math.abs(dy) > DOOR_DY) continue;
            let run = 0;
            for (let t = 0.4; t <= len - 0.4; t += G) {
              const P = [A[0] + tx * t, A[1] + tz * t];
              const qa = [P[0] - nx * (WALL + G / 2), P[1] - nz * (WALL + G / 2)], qc = [P[0] + nx * (WALL + G / 2), P[1] + nz * (WALL + G / 2)];
              const va = cellAt(w, k, qa[0], qa[1]), vc = cellAt(c, kc, qc[0], qc[1]);
              const ok = va !== OUT && va !== FLIGHT && (circ(vc) || vc >= UNIT);
              run = ok ? run + 1 : 0;
              if (run < 3) continue;
              const score = (circ(vc) ? 10 : 0) - Math.abs(dy);
              if (best && score <= best.score) continue;
              best = { score, b: w.id, k, c: c.id, kc, P, n: [nx, nz], e: { r, i, t, len }, ra: regionAt(w, k, qa[0], qa[1]), rc: regionAt(c, kc, qc[0], qc[1]),
                y: w.y[k], yc: c.y[kc], len: 0.5 };
            }
          }
        }
      if (best) chosen.push(best);
    }
  }
  const has = new Set(chosen.map((x) => `${x.b}:${x.c}`));
  for (const b of S.list) {
    if (b.street || b.wingOf !== undefined) continue;
    const all = [];
    for (const list of cand.values()) for (const x of list) if (!x.roof && (x.b === b.id || x.c === b.id)) all.push(x);
    all.sort((p, q) => Math.min(p.k, p.kc) - Math.min(q.k, q.kc));
    if (all.length && !has.has(`${all[0].b}:${all[0].c}`) && Math.abs(all[0].yc - all[0].y) <= DOOR_DY) chosen.push(all[0]);
  }
  // ---- the SW-NE route (model.js, CHAIN_FLOORS) ----
  // The cheapest chain of buildings from the SW corner of the City to the NE corner, over party walls
  // and lanes, with a door or a bridge between each two on CHAIN_FLOORS. The doors go where the
  // circulation (or a flat, if need be) of both is on the wall, with floors within LOOSE_DY.
  // the floors of the kept route (choices.js), by pair: the floor of the building with the lower key
  const keptFloor = new Map((C.kept?.chainLinks || []).map((key) => { const [a, c, k] = key.split(':'); return [`${a}:${c}`, +k]; }));
  const MID = (CHAIN_FLOORS[0] + CHAIN_FLOORS[1]) / 2;
  // a link of the route off CHAIN_FLOORS costs more (in m of walking), floor by floor
  const off = (k) => Math.max(0, CHAIN_FLOORS[0] - k, k - CHAIN_FLOORS[1]);
  const offCost = (x) => 15 * Math.max(off(x.k), off(x.kc));
  const direct = (b, c, P, bridge, pick) => {
    const pairs = [];
    for (let k = 1; k < b.n; k++) for (let kc = 1; kc < c.n; kc++) if (Math.abs(c.y[kc] - b.y[k]) <= LOOSE_DY) pairs.push([k, kc]);
    const want = keptFloor.get(ckPair({ b, c })), lowFirst = b.key < c.key;
    const kept = (p) => (want !== undefined && (lowFirst ? p[0] : p[1]) === want ? 0 : 1);
    pairs.sort((p, q) => kept(p) - kept(q) || Math.abs(Math.min(...p) - MID) - Math.abs(Math.min(...q) - MID) || Math.abs(c.y[p[1]] - b.y[p[0]]) - Math.abs(c.y[q[1]] - b.y[q[0]]));
    const ok = (v) => circ(v) || v >= UNIT;
    for (const [k, kc] of pairs) {
      const rb = b.phaseOf(k).rings, rc = c.phaseOf(kc).rings, e0 = nearestEdge(rb, P[0], P[1]);
      if (!e0 || e0.d > 1.5) continue;
      const A = e0.r.pts[e0.i], B = e0.r.pts[(e0.i + 1) % e0.r.pts.length], tx = (B[0] - A[0]) / e0.len, tz = (B[1] - A[1]) / e0.len;
      let best = null;
      for (let t = 0.4; t <= e0.len - 0.4; t += G) {
        const P1 = [A[0] + tx * t, A[1] + tz * t];
        let Q1 = P1, m = [tz, -tx];
        if (bridge) {
          const e2 = nearestEdge(rc, P1[0], P1[1]), d = e2 ? Math.hypot(e2.P[0] - P1[0], e2.P[1] - P1[1]) : 0;
          if (d < 0.5 || d > BRIDGE_W) continue;
          Q1 = e2.P; m = [(Q1[0] - P1[0]) / d, (Q1[1] - P1[1]) / d];
        }
        const qa = [P1[0] - m[0] * (WALL + G / 2), P1[1] - m[1] * (WALL + G / 2)], qc = [Q1[0] + m[0] * (WALL + G / 2), Q1[1] + m[1] * (WALL + G / 2)];
        const va = cellAt(b, k, qa[0], qa[1]), vc = cellAt(c, kc, qc[0], qc[1]);
        if (!ok(va) || !ok(vc)) continue;
        const score = (circ(va) ? 0 : 5) + (circ(vc) ? 0 : 5) + Math.hypot(P1[0] - P[0], P1[1] - P[1]);
        if (!best || score < best.score) best = { score, P1, Q1, m, qa, qc };
      }
      if (!best) continue;
      const e = nearestEdge(rb, best.P1[0], best.P1[1]), e2 = nearestEdge(rc, best.Q1[0], best.Q1[1]);
      return pick({ b: b.id, k, c: c.id, kc, P: best.P1, Q: best.Q1, n: best.m, e, e2, ra: regionAt(b, k, best.qa[0], best.qa[1]),
        rc: regionAt(c, kc, best.qc[0], best.qc[1]), y: b.y[k], yc: c.y[kc], len: 1, chain: true });
    }
    return null;
  };
  const chainBridges = [];
  {
    const ends = S.list.filter((b) => b.stairs.length && b.wingOf === undefined && b.kind !== 'yamen');
    const [first, last] = routeCorners(S, ends);
    const adj = new Map(ends.map((b) => [b.id, []]));
    // the kept route (choices.js): a step on it costs a quarter
    const keptChain = C.kept?.chain || [], onKept = new Set();
    for (let q = 0; q + 1 < keptChain.length; q++) { onKept.add(`${keptChain[q]}:${keptChain[q + 1]}`); onKept.add(`${keptChain[q + 1]}:${keptChain[q]}`); }
    const add = (x, bridge) => {
      if (!adj.has(x.b) || !adj.has(x.c)) return;
      const b = S.list[x.b], c = S.list[x.c];
      const w = (Math.hypot(b.cx - c.cx, b.cz - c.cz) + (bridge ? 5 : 0) + (x.chain ? 0 : 3)) * (onKept.has(`${b.key}:${c.key}`) ? 0.25 : 1);
      adj.get(x.b).push({ to: x.c, w, x, bridge }); adj.get(x.c).push({ to: x.b, w, x, bridge });
    };
    for (const x of S.pairs.values()) add(x, false);
    for (const [key, x] of S.farPairs) if (!S.pairs.has(key)) add(x, false);
    for (const x of S.bridgeAll.values()) add(x, true);
    const memo = new Map();
    const link = (e) => {
      const key = `${e.x.b}:${e.x.c}:${e.bridge}`;
      if (!memo.has(key)) memo.set(key, direct(S.list[e.x.b], S.list[e.x.c], e.x.P, e.bridge, (q) => q));
      return memo.get(key);
    };
    const dist = new Map(), prev = new Map(), todo = new Set(), south = new Set(last.map((b) => b.id));
    for (const b of first) { dist.set(b.id, 0); todo.add(b.id); }
    let end = null;
    while (todo.size) {
      let v = null;
      for (const q of todo) if (v === null || dist.get(q) < dist.get(v)) v = q;
      todo.delete(v);
      if (south.has(v)) { end = v; break; }
      for (const e of adj.get(v)) {
        if (dist.get(v) + e.w >= (dist.get(e.to) ?? Infinity)) continue;
        const x = link(e);
        if (!x) continue;
        const d = dist.get(v) + e.w + offCost(x);
        if (d >= (dist.get(e.to) ?? Infinity)) continue;
        dist.set(e.to, d); prev.set(e.to, { v, e }); todo.add(e.to);
      }
    }
    S.chain = [];
    for (let v = end; v != null; v = prev.get(v)?.v) {
      S.chain.unshift(v);
      const p = prev.get(v);
      if (!p) continue;
      const x = link(p.e);
      if (p.e.bridge) chainBridges.push({ ...x, b: S.list[x.b], c: S.list[x.c] });
      else chosen.push(x);
    }
    if (end === null) S.chainGaps = 1;
    // the floor of the route in its first and in its last building (viewer.js, the checks)
    const endFloor = (id, x) => (x.b === id ? x.k : x.kc);
    S.chainEnds = S.chain.length > 1 ? [endFloor(S.chain[0], link(prev.get(S.chain[1]).e)), endFloor(S.chain.at(-1), link(prev.get(S.chain.at(-1)).e))] : null;
    C.out.chain = S.chain.map((id) => S.list[id].key);
    C.out.chainLinks = [];
    for (let q = 1; q < S.chain.length; q++) { const p = prev.get(S.chain[q]); if (p) C.out.chainLinks.push(ck(link(p.e))); }
  }

  // ---- informal links (INFERRED): one flat in two buildings, and holes ----
  // The residents built and changed the City at will (pp145, 209). SPAN_N flats have a room
  // in each of two buildings, with an opening and a step between them. HOLE_N holes go through
  // a party wall from a corridor or a flat into a flat or a corridor of the next building.
  const loose = [];
  // A kept flat or hole (choices.js) looks for a place every 0.4 m along the wall, if it must.
  const keptLoose = new Set(Object.values(C.kept?.take || {}).flat().map((key) => key.split(':').slice(1, 3).join(':')));
  for (const b of S.list) {
    if (roomy(b)) continue;
    for (let k = 1; k < b.n; k++) {
      const y = b.y[k];
      for (const r of b.phaseOf(k).rings)
        for (let i = 0; i < r.pts.length; i++) {
          const lab = r.other[i];
          if (lab < 0) continue;
          const A = r.pts[i], B = r.pts[(i + 1) % r.pts.length], dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz);
          if (len < 1.6) continue;
          const c = S.fills(lab, y + 0.3);
          if (!c || c.id <= b.id || roomy(c) || c.wingOf === b.id || b.wingOf === c.id) continue;
          const tx = dx / len, tz = dz / len, nx = tz, nz = -tx;
          const ts = [len / 2, len / 4, (3 * len) / 4];
          if (keptLoose.has(ckPair({ b, c }))) for (let t = 0.6; t <= len - 0.6; t += 0.4) ts.push(t);
          for (const t of ts) {
            if (t < 0.6 || t > len - 0.6) continue;
            const P = [A[0] + tx * t, A[1] + tz * t];
            const qa = [P[0] - nx * (WALL + G / 2), P[1] - nz * (WALL + G / 2)], qc = [P[0] + nx * (WALL + G / 2), P[1] + nz * (WALL + G / 2)];
            const va = cellAt(b, k, qa[0], qa[1]);
            if (!(va >= UNIT || circ(va))) continue;
            let x = null;
            for (let kc = 1; kc < c.n && !x; kc++) {
              const dy = c.y[kc] - y, vc = cellAt(c, kc, qc[0], qc[1]);
              if (Math.abs(dy) > LOOSE_DY || !(vc >= UNIT || circ(vc)) || (circ(va) && circ(vc))) continue;
              const span = va >= UNIT && vc >= UNIT && Math.abs(dy) <= 0.6;
              if (!span && Math.abs(dy) > HOLE_DY) continue;
              x = { b: b.id, k, c: c.id, kc, P, n: [nx, nz], e: { r, i, t, len }, ra: regionAt(b, k, qa[0], qa[1]), rc: regionAt(c, kc, qc[0], qc[1]), y, yc: c.y[kc], len: 1, loose: span ? 'span' : 'hole' };
            }
            if (x) { loose.push(x); break; }
          }
        }
    }
  }
  const used = new Set();
  // The kept ones first (choices.js): the same pair on the same floor, then the same pair.
  const take = (kind, n) => {
    const lk = (x) => `${kind}:${ck(x)}`, pair = (key) => key.split(':').slice(0, 3).join(':');
    const keptKeys = C.kept?.take?.[kind] || [];
    const rank = new Map(keptKeys.map((k, i) => [k, i])), rankPair = new Map(keptKeys.map((k, i) => [pair(k), i]));
    const score = (x) => (rank.has(lk(x)) ? rank.get(lk(x)) : rankPair.has(pair(lk(x))) ? 1e4 + rankPair.get(pair(lk(x))) : 1e9);
    let list = shuffle(loose.filter((q) => q.loose === kind), (q) => 'l:' + at(q));
    if (C.kept) list = list.map((x, i) => [score(x), i, x]).sort((p, q) => p[0] - q[0] || p[1] - q[1]).map((p) => p[2]);
    const got = [];
    for (const x of list) {
      if (!n) break;
      const key = `${x.b}:${x.c}`;
      if (used.has(key)) continue;
      used.add(key); chosen.push(x); n--; got.push(lk(x));
    }
    C.out.take[kind] = got;
  };
  take('span', SPAN_N); take('hole', HOLE_N);

  for (const x of chosen) {
    const b = S.list[x.b], c = x.roof ? null : S.list[x.c];
    const ya = x.y, yc = x.yc, dy = yc - ya;
    const kind = x.roof ? (x.window ? 'window' : 'roofdoor') : x.wing ? 'wing' : x.loose || (x.half ? 'half' : 'party');
    const na = node(x.P[0] - x.n[0] * 0.3, ya, x.P[1] - x.n[1] * 0.3, 'party', { b: b.id, k: x.k });
    const nc = node(x.P[0] + x.n[0] * 0.3, yc, x.P[1] + x.n[1] * 0.3, 'party', { b: x.c, k: x.kc });
    put(x.ra, na); put(x.rc, nc);
    // a window or a hole is slow: a climb, or a stoop
    const slow = kind === 'window' || kind === 'hole' ? 3 : 0;
    edge(na, nc, 0.6 + slow + Math.abs(dy) * (dy > 0 ? UP : DOWN) * (slow ? 1.5 : 1), kind);
    // The opening in each wall, on each floor that it crosses: a door 2.05 m high over the
    // higher floor; a hole 0.6 m wide and 1.5 m high; a window from SILL over the floor.
    let lo = Math.min(ya, yc), top = Math.max(ya, yc) + 2.05, w = 0.8, stool = null;
    if (kind === 'hole') { lo = Math.max(ya, yc); top = lo + 1.5; w = 0.6; }
    if (kind === 'window') {
      // the stool stands in the corridor, under the window (p145)
      lo = Math.max(ya + SILL, yc + 0.1); top = lo + 1.0; w = 0.7;
      stool = { x: x.P[0] - x.n[0] * 0.45, z: x.P[1] - x.n[1] * 0.45, y: ya, h: STOOL };
    }
    const holes = (o) => {
      if (!o) return;
      for (let k = 0; k < o.n; k++) {
        if (o.y[k + 1] <= lo || o.y[k] >= top) continue;
        const e = nearestEdge(o.phaseOf(k).rings, x.P[0], x.P[1]);
        if (e && e.d < 0.12) open(o, k, e, w, lo, top, kind);
      }
    };
    holes(b); holes(c);
    S.doors.push({ kind, b: b.id, k: x.k, c: x.c, kc: x.kc, x: x.P[0], z: x.P[1], n: x.n, y: ya, yc, w, stool, chain: !!x.chain });
  }

  // ---- bridges over the lanes ----
  // From 2/F up, a corridor that faces a lane of BRIDGE_W m or less, with a corridor of the
  // building across within BRIDGE_DY of its floor, gets a bridge (20 % of the pairs).
  const bridgeCand = new Map();
  for (const b of S.list)
    for (let k = 2; k < b.n; k++) {
      const ph = b.phaseOf(k), y = b.y[k];
      for (const r of ph.rings)
        for (let i = 0; i < r.pts.length; i++) {
          if (r.other[i] !== LANE && r.other[i] !== YARD) continue;
          const A = r.pts[i], B = r.pts[(i + 1) % r.pts.length], dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz);
          if (len < 2) continue;
          const tx = dx / len, tz = dz / len, nx = tz, nz = -tx;
          for (let t = 0.8; t <= len - 0.8; t += 0.5) {
            const P = [A[0] + tx * t, A[1] + tz * t];
            const qa = [P[0] - nx * (WALL + G / 2), P[1] - nz * (WALL + G / 2)];
            if (!circ(cellAt(b, k, qa[0], qa[1]))) continue;
            // across: the first point that some building fills at this height
            let hit = null;
            for (let s = 0.5; s <= BRIDGE_W + 0.6; s += 0.25) {
              const X = P[0] + nx * s, Z = P[1] + nz * s;
              const ci = Math.floor(X - L.x0), cj = Math.floor(Z - L.z0);
              if (ci < 0 || cj < 0 || ci >= L.W || cj >= L.D) break;
              const o = L.owner[cj * L.W + ci];
              if (o < 0) continue;
              const c = S.fills(o, y + 1.2);
              if (!c || c.id === b.id) break;
              const ph2 = c.phaseOf(Math.max(0, Math.min(c.n - 1, c.y.findIndex((v) => v > y + 1.2) - 1)));
              const e2 = nearestEdge(ph2.rings, X, Z);
              if (!e2) break;
              hit = { c, e2, s: Math.hypot(e2.P[0] - P[0], e2.P[1] - P[1]) };
              break;
            }
            if (!hit || hit.s < 0.8 || hit.s > BRIDGE_W) continue;
            const c = hit.c;
            for (let kc = 0; kc < c.n; kc++) {
              if (Math.abs(c.y[kc] - y) > BRIDGE_DY) continue;
              const Q = hit.e2.P, qc = [Q[0] + nx * (WALL + G / 2), Q[1] + nz * (WALL + G / 2)];
              if (!circ(cellAt(c, kc, qc[0], qc[1]))) continue;
              const e2 = nearestEdge(c.phaseOf(kc).rings, Q[0], Q[1]);
              if (!e2 || e2.d > 0.15 || e2.t < 0.6 || e2.t > e2.len - 0.6) continue;
              const key = b.id < c.id ? `${b.id}:${c.id}` : `${c.id}:${b.id}`;
              if (!bridgeCand.has(key)) bridgeCand.set(key, []);
              bridgeCand.get(key).push({ b, k, c, kc, P, Q, n: [nx, nz], e: { r, i, t, len }, e2, ra: regionAt(b, k, qa[0], qa[1]), rc: regionAt(c, kc, qc[0], qc[1]) });
            }
          }
        }
    }
  // A pair with a bridge site (model.js) gets a bridge on 50 % of the floors that can have
  // one there, and at least one; another pair, rarely.
  const bridges = [];
  for (const [key, list] of bridgeCand) {
    const site = S.bridgeSites.get(key);
    const near = site ? list.filter((x) => Math.min(Math.hypot(x.P[0] - site.P[0], x.P[1] - site.P[1]), Math.hypot(x.P[0] - site.Q[0], x.P[1] - site.Q[1])) < 1.5) : list;
    const byK = new Map();
    for (const x of shuffle(near, (q) => 'b:' + at(q))) if (!byK.has(x.k)) byK.set(x.k, x);
    let any = false;
    for (const x of byK.values()) if (R(`bridge:${ck(x)}`) < (site ? 0.5 : 0.02)) { bridges.push(x); any = true; }
    if (!any && site && byK.size) bridges.push(shuffle([...byK.values()], (q) => 'bf:' + at(q))[0]);
  }
  bridges.push(...chainBridges);
  for (const x of bridges) {
    const { b, c } = x;
    const ya = b.y[x.k], yc = c.y[x.kc];
    const na = node(x.P[0], ya, x.P[1], 'bridge', { b: b.id, k: x.k }), nc = node(x.Q[0], yc, x.Q[1], 'bridge', { b: c.id, k: x.kc });
    put(x.ra, na); put(x.rc, nc);
    edge(na, nc, Math.hypot(x.Q[0] - x.P[0], x.Q[1] - x.P[1]) + Math.abs(yc - ya) * UP, 'bridge');
    const top = Math.max(ya, yc) + 2.05;
    open(b, x.k, x.e, 0.9, ya, top, 'bridge');
    open(c, x.kc, x.e2, 0.9, yc, top, 'bridge');
    S.doors.push({ kind: 'bridge', b: b.id, k: x.k, c: c.id, kc: x.kc, x: x.P[0], z: x.P[1], x2: x.Q[0], z2: x.Q[1], y: ya, yc, w: 0.9, chain: !!x.chain });
  }

  // ---- roofs: from roof to roof with a step (CLIMB or less of wall), or by a ladder ----
  // SOURCED: "When it was only one floor, people... bridged the gap with the help of a ladder"
  // (Lam Po Chun, p145). INFERRED: most people used the lanes (p249); thus a ladder for 30 %
  // of the pairs that differ by up to one storey. About 20 % of the roofs have a parapet
  // (model.js). Where two roofs are nearly level and neither has a parapet, they make one open
  // roof, thus they always join.
  for (const b of S.list) {
    if (!b.roofOpen || b.kind === 'yamen') continue;
    const rings = b.phases[b.phases.length - 1].rings;
    let cx = 0, cz = 0, n = 0;
    for (const r of rings) for (const [x, z] of r.pts) { cx += x; cz += z; n++; }
    b.roofNode = node(cx / n, b.top, cz / n, 'roof', { b: b.id, k: b.n });
    put(roofKey(b), b.roofNode);
    // a roof room (model.js): a unit on the roof, with a door onto it
    if (b.roofRoom) {
      const R = b.roofRoom, [x, z] = toXZ(b.F, (R.a0 + R.a1) / 2, (R.w0 + R.w1) / 2);
      const id = node(x, b.top, z, 'unit', { b: b.id, k: b.n, u: 0, area: (R.a1 - R.a0) * (R.w1 - R.w0), roofRoom: true });
      S.unitNode.set(`${b.id}:${b.n}:0`, id);
      put(roofKey(b), id);
    }
  }
  const roofPairs = new Map();
  for (const b of S.list) {
    if (b.roofNode === undefined) continue;
    for (const r of b.phases[b.phases.length - 1].rings)
      for (let i = 0; i < r.pts.length; i++) {
        const lab = r.other[i];
        if (lab < 0) continue;
        const c = S.bOf(lab);
        if (!c || c.id === b.id || c.roofNode === undefined || c.top > b.top) continue;
        if (S.fills(lab, c.top + 0.6) && S.fills(lab, c.top + 0.6) !== c) continue;
        const dy = b.top - c.top;
        if (dy > ROOF_DY) continue;
        const A = r.pts[i], B = r.pts[(i + 1) % r.pts.length], len = Math.hypot(B[0] - A[0], B[1] - A[1]);
        if (len < 1.2) continue;
        // the top roof of c must be at this wall, not the terrace of a setback below it
        const M = [(A[0] + B[0]) / 2 + ((B[1] - A[1]) / len) * 0.3, (A[1] + B[1]) / 2 - ((B[0] - A[0]) / len) * 0.3];
        if (!inRings(c.phases[c.phases.length - 1].rings.map((q) => q.pts), M[0], M[1])) continue;
        const key = `${b.id}:${c.id}`, o = roofPairs.get(key);
        if (!o || len > o.len) roofPairs.set(key, { b, c, len, P: [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], dy, e: { r, i, t: len / 2, len } });
      }
  }
  // The wall to climb from the lower roof c to the higher roof b: the step, with the parapet of
  // b on it; or the parapet of c, where the step is lower than that parapet.
  const wall = (b, c, dy) => (b.parapet ? dy + PARAPET : c.parapet ? Math.max(dy, PARAPET) : dy);
  for (const x of roofPairs.values()) {
    const w = wall(x.b, x.c, x.dy), step = w <= CLIMB, open = !x.b.parapet && !x.c.parapet && x.dy <= FLAT_DY;
    if (R(`roof:${ckPair(x)}`) >= (open ? 1 : step ? 0.9 : 0.3)) continue;
    const na = node(x.P[0], x.b.top, x.P[1], 'roofedge', { b: x.b.id, k: x.b.n }), nc = node(x.P[0], x.c.top, x.P[1], 'roofedge', { b: x.c.id, k: x.c.n });
    put(roofKey(x.b), na); put(roofKey(x.c), nc);
    edge(na, nc, step ? 1 + w * 2 : 3 + x.dy * 5, step ? 'step' : 'ladder');
    // n: the normal of the wall, out of b onto the roof of c (the ladder stands against it)
    const { r, i } = x.e, A = r.pts[i], B = r.pts[(i + 1) % r.pts.length];
    S.doors.push({ kind: step ? 'step' : 'ladder', b: x.b.id, c: x.c.id, x: x.P[0], z: x.P[1], y: x.b.top, yc: x.c.top, e: x.e,
      n: [(B[1] - A[1]) / x.len, -(B[0] - A[0]) / x.len] });
  }

  // ---- each region joins all its nodes ----
  for (const [key, list] of regions) {
    const f = key[0] === 'r' ? 1.2 : 1.1;
    for (let p = 0; p < list.length; p++)
      for (let q = p + 1; q < list.length; q++) {
        const a = nodes[list[p]], b = nodes[list[q]];
        edge(list[p], list[q], Math.hypot(a.x - b.x, a.z - b.z) * f + Math.abs(a.y - b.y) * 2, 'walk');
      }
  }

  // ---- the graph, as arrays ----
  const deg = new Int32Array(nodes.length + 1);
  for (const [a, b] of E) { deg[a + 1]++; deg[b + 1]++; }
  for (let i = 0; i < nodes.length; i++) deg[i + 1] += deg[i];
  const to = new Int32Array(deg[nodes.length]), cost = new Float32Array(deg[nodes.length]), kind = new Array(deg[nodes.length]);
  const fill = deg.slice();
  for (const [a, b, c, k] of E) {
    to[fill[a]] = b; cost[fill[a]] = c; kind[fill[a]++] = k;
    to[fill[b]] = a; cost[fill[b]] = c; kind[fill[b]++] = k;
  }
  S.graph = { nodes, start: deg, to, cost, kind, regions };
  S.laneNode = laneNode;
}

// The cheapest route from node s to node t: { path: [node ids], cost, kinds } or null.
// avoid: a set of edge kinds that the route must not use.
export function route(S, s, t, avoid = null) {
  const { nodes, start, to, cost, kind } = S.graph, n = nodes.length;
  const dist = new Float64Array(n).fill(Infinity), prev = new Int32Array(n).fill(-1), pk = new Array(n);
  const heap = [[0, s]];
  dist[s] = 0;
  const push = (d, v) => {
    heap.push([d, v]);
    for (let i = heap.length - 1; i > 0; ) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  while (heap.length) {
    const [d, v] = pop();
    if (d > dist[v]) continue;
    if (v === t) break;
    for (let e = start[v]; e < start[v + 1]; e++) {
      if (avoid && avoid.has(kind[e])) continue;
      const w = to[e], nd = d + cost[e];
      if (nd < dist[w]) { dist[w] = nd; prev[w] = v; pk[w] = kind[e]; push(nd, w); }
    }
  }
  if (!isFinite(dist[t])) return null;
  const path = [], kinds = [];
  for (let v = t; v >= 0; v = prev[v]) { path.push(v); kinds.push(pk[v]); }
  path.reverse(); kinds.reverse();
  return { path, cost: dist[t], kinds };
}

// All nodes that node s reaches.
export function reach(S, s) {
  const { nodes, start, to } = S.graph, seen = new Uint8Array(nodes.length), list = [s];
  seen[s] = 1;
  for (let q = 0; q < list.length; q++)
    for (let e = start[list[q]]; e < start[list[q] + 1]; e++) if (!seen[to[e]]) { seen[to[e]] = 1; list.push(to[e]); }
  return seen;
}
