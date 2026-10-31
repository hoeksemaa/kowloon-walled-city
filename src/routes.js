// The walking network above the lanes: every storey of every block, and the roofs.
//
// SOURCED: "the upper-level walkways connecting different buildings" (Chan Cheung-chuen, M+
// audio guide); the postmen climbed one stair, crossed the roofs by ladders and windows, and
// went down another (City of Darkness Revisited, pp145-146); children "would go onto the
// roofs and leap from building to building" (SCMP, 4 Jan 2013). INFERRED: where each link,
// bridge and ladder is.
//
// Nodes: one for each storey of each block, and one for each tower roof. Edges: stairs;
// doors between the blocks of one tower, and to a neighbour's stair, on every storey; links
// to the next tower on some storeys; bridges over narrow lanes; and roof hops, with a ladder
// where two roofs differ by one storey. The lanes are not in the graph: a route can leave it
// at any ground floor with a stair and walk the lanes on the grid (people.js).
import { STOREY } from './layout.js';
import { hash2 } from './util.js';
import { stairPoints, walkIn } from './floorplan.js';

export const WALK = 1.25; // m/s
export const CLIMB = 0.28; // m/s vertical on stairs
const LANE = 1.4; // a lane route is about this much longer than the straight line
const LINK_SHARE = 0.2; // the part of the storeys where two towers have a link

class Heap {
  constructor() { this.k = []; this.v = []; }
  get size() { return this.k.length; }
  push(k, v) {
    const K = this.k, V = this.v;
    let n = K.length;
    K.push(k); V.push(v);
    while (n > 0) {
      const p = (n - 1) >> 1;
      if (K[p] <= K[n]) break;
      [K[p], K[n]] = [K[n], K[p]]; [V[p], V[n]] = [V[n], V[p]];
      n = p;
    }
  }
  pop() {
    const K = this.k, V = this.v, top = V[0], topK = K[0];
    const lk = K.pop(), lv = V.pop();
    if (K.length) {
      K[0] = lk; V[0] = lv;
      for (let n = 0; ; ) {
        const l = 2 * n + 1, r = l + 1;
        let m = n;
        if (l < K.length && K[l] < K[m]) m = l;
        if (r < K.length && K[r] < K[m]) m = r;
        if (m === n) break;
        [K[m], K[n]] = [K[n], K[m]]; [V[m], V[n]] = [V[n], V[m]];
        n = m;
      }
    }
    this.lastKey = topK;
    return top;
  }
}

export function buildRoutes(L) {
  const B = L.buildings, W = L.W;
  const cx = (k) => L.cellX(k), cz = (k) => L.cellZ(k);
  const sp = B.map((b) => (b.plans ? stairPoints(L, b) : []));

  // ---- nodes ----
  const base = new Int32Array(B.length).fill(-1);
  const nB = [], nF = [], nT = [], nX = [], nZ = [], nY = [];
  for (const b of B) {
    if (!b.plans || b.kind === 'yamen') continue;
    base[b.id] = nB.length;
    for (let f = 0; f < b.floors; f++) { nB.push(b.id); nF.push(f); nT.push(-1); nX.push(b.cx); nZ.push(b.cz); nY.push(f * STOREY); }
  }
  const roofOf = new Int32Array(L.towers.length).fill(-1);
  const towerTop = L.towers.map((t) => Math.max(...t.blocks.map((id) => (base[id] >= 0 ? B[id].floors : 0))));
  L.towers.forEach((t, ti) => {
    if (!towerTop[ti]) return;
    let n = 0, x = 0, z = 0;
    for (const id of t.blocks) { n += B[id].cells.length; x += B[id].cx * B[id].cells.length; z += B[id].cz * B[id].cells.length; }
    roofOf[ti] = nB.length;
    nB.push(-1); nF.push(towerTop[ti] - 1); nT.push(ti); nX.push(x / n); nZ.push(z / n); nY.push(towerTop[ti] * STOREY);
  });
  const N = nB.length;
  const adj = Array.from({ length: N }, () => []);
  const add = (a, b, cost, e) => { e.cost = cost; adj[a].push([b, e]); adj[b].push([a, e]); };
  const dist = (a, b) => Math.hypot(nX[a] - nX[b], nZ[a] - nZ[b]);

  // ---- stairs ----
  for (const b of B)
    if (base[b.id] >= 0 && sp[b.id].length)
      for (let f = 0; f + 1 < b.floors; f++) add(base[b.id] + f, base[b.id] + f + 1, STOREY / CLIMB + 1, { kind: 'stair', b: b.id });

  // ---- doors between blocks ----
  // The cells where two blocks touch. A door goes where both sides are corridor or stair if
  // it can, near the middle of the shared wall.
  const touch = new Map();
  for (const b of B) {
    if (base[b.id] < 0) continue;
    for (const k of b.cells)
      for (const n of [k - 1, k + 1, k - W, k + W]) {
        const o = L.owner[n];
        if (o > b.id && base[o] >= 0) {
          const key = b.id * 4096 + o;
          if (!touch.has(key)) touch.set(key, []);
          touch.get(key).push([k, n]);
        }
      }
  }
  const open = (b, k) => {
    const P = b.plans.home, v = P.cell[P.index.get(k)];
    return v === -1 ? 2 : v === -2 ? 1 : 0;
  };
  const doorsAt = [], hops = []; // doorsAt[f]: the doors between blocks on storey f
  const atF = (f, d) => (doorsAt[f] ||= []).push(d);
  const hopDone = new Set();
  for (const [key, list] of touch) {
    const b = B[Math.floor(key / 4096)], c = B[key % 4096];
    let best = list[0], bs = -1;
    list.forEach(([k, n], i) => {
      const s = open(b, k) + open(c, n) - Math.abs(i - list.length / 2) / (list.length + 1);
      if (s > bs) { bs = s; best = [k, n]; }
    });
    const [k, n] = best;
    const mid = { x: (cx(k) + cx(n)) / 2, z: (cz(k) + cz(n)) / 2 };
    const door = { kind: 'door', b: b.id, c: c.id, kb: k, kc: n, pa: mid, pb: mid };
    const top = Math.min(b.floors, c.floors);
    const one = b.tower === c.tower || b.shareWith === c.id || c.shareWith === b.id;
    const d = Math.hypot(b.cx - c.cx, b.cz - c.cz) / WALK + 1;
    for (let f = 0; f < top; f++) {
      if (!one && (f < 2 || hash2(b.id * 131 + c.id, f) >= LINK_SHARE)) continue;
      add(base[b.id] + f, base[c.id] + f, d, door);
      atF(f, { ...door, link: !one });
    }
    // A roof hop between two towers whose roofs differ by one storey or less.
    const tb = b.tower, tc = c.tower, rb = roofOf[tb], rc = roofOf[tc];
    if (tb !== tc && rb >= 0 && rc >= 0 && b.floors === towerTop[tb] && c.floors === towerTop[tc] && Math.abs(b.floors - c.floors) <= 1) {
      const hk = Math.min(tb, tc) * 4096 + Math.max(tb, tc);
      if (!hopDone.has(hk)) {
        hopDone.add(hk);
        const [hk0, hk1] = list[list.length >> 1];
        const h = { kind: 'hop', ta: tb, tb: tc, x: (cx(hk0) + cx(hk1)) / 2, z: (cz(hk0) + cz(hk1)) / 2, low: b.floors < c.floors ? hk0 : hk1, high: b.floors < c.floors ? hk1 : hk0 };
        add(rb, rc, dist(rb, rc) / WALK + (b.floors === c.floors ? 2 : 10), h);
        hops.push(h);
      }
    }
  }

  // ---- bridges over narrow lanes ----
  const cand = new Map();
  for (const b of B) {
    if (base[b.id] < 0 || b.floors < 6) continue;
    for (const k of b.cells)
      for (const d of [1, -1, W, -W]) {
        let m = k + d, lane = 0;
        while (lane < 3 && L.inside[m] && L.alley[m] === 1 && L.owner[m] < 0) { m += d; lane++; }
        const o = L.owner[m];
        if (!lane || lane > 2 || o < 0 || o <= b.id || base[o] < 0 || B[o].tower === b.tower || B[o].floors < 6) continue;
        const key = b.id * 4096 + o;
        if (!cand.has(key)) cand.set(key, []);
        cand.get(key).push([k, m, d]);
      }
  }
  const bridges = [];
  for (const [key, list] of [...cand].sort((p, q) => hash2(p[0], 3) - hash2(q[0], 3))) {
    if (bridges.length >= 36) break;
    const b = B[Math.floor(key / 4096)], c = B[key % 4096];
    const [k, m, d] = list[list.length >> 1];
    const pa = { x: cx(k) + (cx(k + d) - cx(k)) / 2, z: cz(k) + (cz(k + d) - cz(k)) / 2 };
    const pb = { x: cx(m) + (cx(m - d) - cx(m)) / 2, z: cz(m) + (cz(m - d) - cz(m)) / 2 };
    if (bridges.some((q) => Math.hypot(q.pa.x - pa.x, q.pa.z - pa.z) < 12)) continue;
    const top = Math.min(b.floors, c.floors);
    const f = 3 + Math.floor(hash2(key, 5) * (top - 4));
    const br = { kind: 'door', b: b.id, c: c.id, kb: k, kc: m, pa, pb, f, bridge: true };
    add(base[b.id] + f, base[c.id] + f, Math.hypot(b.cx - c.cx, b.cz - c.cz) / WALK + 1, br);
    bridges.push(br);
  }

  // ---- roofs: up the stair of each block that reaches the top, or else by a hatch ----
  for (const b of B)
    if (base[b.id] >= 0 && sp[b.id].length && roofOf[b.tower] >= 0 && b.floors === towerTop[b.tower])
      add(base[b.id] + b.floors - 1, roofOf[b.tower], STOREY / CLIMB + 2, { kind: 'roof', b: b.id, pt: sp[b.id][0] });
  L.towers.forEach((t, ti) => {
    const r = roofOf[ti];
    if (r < 0 || adj[r].some(([, e]) => e.kind === 'roof')) return;
    const b = B[t.blocks.filter((id) => base[id] >= 0 && B[id].floors === towerTop[ti]).sort((p, q) => B[q].cells.length - B[p].cells.length)[0]];
    const k = b.cells[b.cells.length >> 1];
    add(base[b.id] + b.floors - 1, r, STOREY / CLIMB + 2, { kind: 'roof', b: b.id, pt: { x: cx(k), z: cz(k), k }, hatch: true });
  });

  // ---- the way down from each node to the nearest stair foot ----
  const exitCell = new Int32Array(N).fill(-1);
  for (const b of B) if (base[b.id] >= 0 && sp[b.id].length) exitCell[base[b.id]] = sp[b.id][0].k;
  const down = new Float64Array(N).fill(Infinity), downNext = new Int32Array(N).fill(-1), exitOf = new Int32Array(N).fill(-1);
  const downEdge = new Array(N).fill(null);
  {
    const H = new Heap();
    for (let n = 0; n < N; n++) if (exitCell[n] >= 0) { down[n] = 0; exitOf[n] = n; H.push(0, n); }
    while (H.size) {
      const n = H.pop();
      if (H.lastKey > down[n]) continue;
      for (const [m, e] of adj[n]) {
        const d = down[n] + e.cost;
        if (d < down[m]) { down[m] = d; downNext[m] = n; downEdge[m] = e; exitOf[m] = exitOf[n]; H.push(d, m); }
      }
    }
  }
  const chainDown = (n) => {
    const steps = [];
    for (let g = 0; downNext[n] >= 0 && g < 400; g++) { steps.push([n, downNext[n], downEdge[n]]); n = downNext[n]; }
    return steps;
  };
  const chainUp = (n) => chainDown(n).reverse().map(([a, b, e]) => [b, a, e]);
  const laneTime = (k0, k1) => (Math.hypot(cx(k0) - cx(k1), cz(k0) - cz(k1)) * LANE) / WALK;

  // ---- search: through the network, or down to the lanes and up again ----
  const cache = new Map();
  function search(s, t) {
    const key = s * 65536 + t;
    if (cache.has(key)) return cache.get(key);
    // The plain way: down at the nearest stair, along the lanes, and up.
    const lane = (n) => (exitOf[n] >= 0 && exitOf[t] >= 0 ? down[n] + laneTime(exitCell[exitOf[n]], exitCell[exitOf[t]]) + down[t] : Infinity);
    let best = lane(s), end = -1;
    const g = new Map([[s, 0]]), prev = new Map();
    const h = (n) => Math.hypot(nX[n] - nX[t], nZ[n] - nZ[t]) / WALK + Math.abs(nY[n] - nY[t]) / CLIMB;
    const H = new Heap();
    H.push(h(s), s);
    for (let it = 0; H.size && it < 3000; it++) {
      const n = H.pop();
      if (H.lastKey >= best) break;
      const gn = g.get(n);
      if (n === t) { best = gn; end = t; break; }
      // Leave here for the lanes?
      if (exitCell[n] >= 0 && exitOf[t] >= 0) {
        const c = gn + laneTime(exitCell[n], exitCell[exitOf[t]]) + down[t];
        if (c < best) { best = c; end = n; }
      }
      for (const [m, e] of adj[n]) {
        const d = gn + e.cost;
        if (d < (g.has(m) ? g.get(m) : Infinity)) { g.set(m, d); prev.set(m, [n, e]); H.push(d + h(m), m); }
      }
    }
    let steps;
    if (end < 0) steps = null; // the plain way
    else {
      steps = [];
      for (let n = end; n !== s; ) { const [p, e] = prev.get(n); steps.push([p, n, e]); n = p; }
      steps.reverse();
    }
    const out = { end, steps };
    if (cache.size > 20000) cache.clear();
    cache.set(key, out);
    return out;
  }

  // ---- waypoints ----
  // A trip from one place to another: [x, z, y, storey] points. ground(k0, k1, pts) adds a
  // lane route between two cells.
  function trip(from, to, ox, oz, fast, ground) {
    const pts = [];
    const nodeOf = (p) => (p.type === 'roof' ? roofOf[B[p.b].tower] : p.type === 'in' && base[p.b] >= 0 ? base[p.b] + p.f : -1);
    const cellOf = (p) => (p.type === 'away' ? L.away[p.ap] : p.type === 'ground' ? p.k : Math.floor(p.z - L.z0) * W + Math.floor(p.x - L.x0));
    const s = nodeOf(from), t = nodeOf(to);
    let cur; // { x, z, k?, n: node }
    const yOf = (n) => nY[n], lvOf = (n) => nF[n];
    const put = (x, z, n) => pts.push([x, z, yOf(n), lvOf(n)]);
    // Walk on the storey of the current node to point Q.
    const walk = (Q) => {
      if (Math.hypot(Q.x - cur.x, Q.z - cur.z) < 0.05) return;
      const n = cur.n;
      if (nT[n] >= 0) put(Q.x, Q.z, n);
      else for (const p of walkIn(L, B[nB[n]], nF[n], cur, Q)) put(p.x, p.z, n);
      cur = { ...Q, n };
    };
    const nearStair = (b) => sp[b].reduce((p, q) => (Math.hypot(q.x - cur.x, q.z - cur.z) < Math.hypot(p.x - cur.x, p.z - cur.z) ? q : p));
    const stepAlong = ([a, b, e]) => {
      if (e.kind === 'stair') {
        const st = nearStair(e.b);
        walk(st);
        put(st.x, st.z, b);
        cur = { ...st, n: b };
      } else if (e.kind === 'door') {
        const fwd = nB[a] === e.b;
        const [p, q, kp, kq] = fwd ? [e.pa, e.pb, e.kb, e.kc] : [e.pb, e.pa, e.kc, e.kb];
        walk({ ...p, k: kp });
        cur = { ...q, k: kq, n: b };
        put(q.x, q.z, b);
      } else if (e.kind === 'roof') {
        // Up through the stair hut, or down from it.
        const st = e.pt;
        walk(st);
        put(st.x, st.z, b);
        cur = { ...st, n: b };
      } else if (e.kind === 'hop') {
        walk({ x: e.x, z: e.z });
        put(e.x, e.z, b);
        cur = { x: e.x, z: e.z, n: b };
      }
    };
    const finish = () => {
      if (to.type === 'roof' || to.type === 'in') walk({ x: to.x, z: to.z });
    };

    if (from.type === 'away') { const c = L.away[from.ap]; pts.push([cx(c) + ox, cz(c) + oz, 0, 0]); }
    else if (s >= 0) pts.push([from.x, from.z, yOf(s), lvOf(s)]);
    else pts.push([from.x, from.z, 0, 0]);
    if (s >= 0) cur = { x: from.x, z: from.z, n: s };

    const unreachable = (n) => n >= 0 && exitOf[n] < 0;
    if (s >= 0 && t >= 0 && !unreachable(s) && !unreachable(t)) {
      if (s === t) { finish(); return pts; }
      const r = fast ? { end: -1, steps: null } : search(s, t);
      if (r.end === t) { r.steps.forEach(stepAlong); finish(); return pts; }
      for (const st of r.steps || chainDown(s)) stepAlong(st);
      const e = r.end >= 0 ? r.end : exitOf[s];
      const st = sp[nB[e]][0];
      walk(st);
      const tExit = exitOf[t], tst = sp[nB[tExit]][0];
      ground(st.k, tst.k, pts);
      put(tst.x, tst.z, tExit);
      cur = { ...tst, n: tExit };
      chainUp(t).forEach(stepAlong);
      finish();
      return pts;
    }
    // One end (or both) in the lanes, outside the city, or in the Yamen.
    let k0;
    if (s >= 0 && !unreachable(s)) {
      chainDown(s).forEach(stepAlong);
      const st = sp[nB[exitOf[s]]][0];
      walk(st);
      k0 = st.k;
    } else k0 = cellOf(from);
    if (t >= 0 && !unreachable(t)) {
      const tExit = exitOf[t], tst = sp[nB[tExit]][0];
      ground(k0, tst.k, pts);
      put(tst.x, tst.z, tExit);
      cur = { ...tst, n: tExit };
      chainUp(t).forEach(stepAlong);
      finish();
    } else {
      ground(k0, cellOf(to), pts);
      if (to.type !== 'away') pts.push([to.x, to.z, 0, 0]);
    }
    return pts;
  }

  // Roofs next to roof t, by hops: for people who roam the roofs.
  const roofNear = (ti) => adj[roofOf[ti]].filter(([, e]) => e.kind === 'hop').map(([m]) => nT[m]);

  return {
    N, base, roofOf, towerTop, adj, down, exitOf, nB, nF, nT,
    doorsAt, bridges, hops,
    search, trip, roofNear,
  };
}
