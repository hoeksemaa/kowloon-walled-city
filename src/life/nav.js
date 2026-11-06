// The routes of the people on the structure. The graph is the one of src/city/links.js
// (S.graph): the lanes, the doors, the stairs, the corridors, the bridges, the ladders and the
// roofs, thus a route can go through other buildings and over the roofs. The structure is
// frozen; this file only reads it.
//
// A route is a list of node ids. Nav.route finds one with A* and landmarks (ALT: the bound on
// the cost from a node to the goal comes from the costs to 12 far-apart nodes); Nav.tree finds,
// for every node, the way to the nearest of some sources (for example the ways out of the
// City), in one search.
// The speeds are INFERRED: 1.25 m/s on the level, and 0.28 m/s up or down a stair or a ladder
// (the speeds of the old app, src/routes.js).
export const WALK = 1.25;
export const CLIMB = 0.28;
const HEUR = 1.0; // A* weight over the landmark bound: 1 gives the best route
const MARKS = 12; // landmarks for the A* bound (ALT)

// A binary heap of (key, node), with typed arrays.
class Heap {
  constructor(n = 4096) { this.k = new Float64Array(n); this.v = new Int32Array(n); this.size = 0; }
  push(key, v) {
    if (this.size === this.k.length) {
      const k = new Float64Array(this.size * 2), w = new Int32Array(this.size * 2);
      k.set(this.k); w.set(this.v); this.k = k; this.v = w;
    }
    const K = this.k, V = this.v;
    let i = this.size++;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (K[p] <= key) break;
      K[i] = K[p]; V[i] = V[p]; i = p;
    }
    K[i] = key; V[i] = v;
  }
  pop() {
    const K = this.k, V = this.v, top = V[0], n = --this.size, key = K[n], v = V[n];
    let i = 0;
    for (;;) {
      let c = 2 * i + 1;
      if (c >= n) break;
      if (c + 1 < n && K[c + 1] < K[c]) c++;
      if (K[c] >= key) break;
      K[i] = K[c]; V[i] = V[c]; i = c;
    }
    K[i] = key; V[i] = v;
    return top;
  }
  topKey() { return this.k[0]; }
}

export class Nav {
  constructor(S) {
    const G = S.graph, N = G.nodes.length;
    this.S = S; this.N = N;
    this.start = G.start; this.to = G.to; this.cost = G.cost;
    this.x = new Float32Array(N); this.y = new Float32Array(N); this.z = new Float32Array(N);
    this.layer = new Uint8Array(N); // the floor layer of the node (src/cityLayers.js): the lanes are layer 0
    this.b = new Int16Array(N).fill(-1);
    this.kind = new Uint8Array(N);
    const KINDS = ['lane', 'unit', 'door', 'landing', 'half', 'street', 'party', 'bridge', 'roof', 'roofedge'];
    G.nodes.forEach((n, i) => {
      this.x[i] = n.x; this.y[i] = n.y; this.z[i] = n.z;
      this.layer[i] = n.k ?? 0;
      if (n.b !== undefined) this.b[i] = n.b;
      this.kind[i] = Math.max(0, KINDS.indexOf(n.kind));
    });
    this.KINDS = KINDS;
    this.g = new Float64Array(N);
    this.prev = new Int32Array(N);
    this.mark = new Uint32Array(N);
    this.closed = new Uint32Array(N);
    this.stamp = 0;
    this.heap = new Heap();
    // The ways out: the lane nodes at the edge of the plan box, round the City.
    const L = S.L, exits = [];
    for (let k = 0; k < L.N; k++) {
      const v = S.laneNode[k];
      if (v < 0) continue;
      const i = k % L.W, j = (k / L.W) | 0;
      if (i <= 1 || j <= 1 || i >= L.W - 2 || j >= L.D - 2) exits.push(v);
    }
    this.exits = exits;
    // The landmarks: each one the farthest node from those before it.
    this.marks = [];
    let far = exits[0];
    for (let m = 0; m < MARKS; m++) {
      const { d } = this.tree([far]);
      const f = new Float32Array(N);
      for (let i = 0; i < N; i++) f[i] = Number.isFinite(d[i]) ? d[i] : 0;
      this.marks.push(f);
      let best = -1, bd = -1;
      for (let i = 0; i < N; i++) {
        let lo = Infinity;
        for (const L of this.marks) lo = Math.min(lo, L[i]);
        if (lo > bd && Number.isFinite(d[i])) { bd = lo; best = i; }
      }
      far = best;
    }
  }

  // A lower bound of the cost from node v to node t (the landmarks).
  bound(v, t) {
    let h = 0;
    for (const L of this.marks) { const q = Math.abs(L[t] - L[v]); if (q > h) h = q; }
    return h;
  }

  // The node of unit u of floor k of building b (k = n: the roof room), or -1.
  unit(b, k, u) { return this.S.unitNode.get(`${b}:${k}:${u}`) ?? -1; }
  // The node of the roof of building b, or -1 (a pitched roof, or a roof under an annex).
  roof(b) { return this.S.list[b].roofNode ?? -1; }

  // The route from node s to node t (A*), as an Int32Array of node ids, or null.
  route(s, t) {
    if (s === t) return Int32Array.of(s);
    const { start, to, cost, g, prev, mark, closed, heap } = this;
    const st = ++this.stamp;
    heap.size = 0;
    g[s] = 0; prev[s] = -1; mark[s] = st;
    heap.push(HEUR * this.bound(s, t), s);
    while (heap.size) {
      const v = heap.pop();
      if (v === t) break;
      if (closed[v] === st) continue;
      closed[v] = st;
      const gv = g[v];
      for (let e = start[v]; e < start[v + 1]; e++) {
        const w = to[e], nd = gv + cost[e];
        if (closed[w] === st || (mark[w] === st && nd >= g[w])) continue;
        mark[w] = st; g[w] = nd; prev[w] = v;
        heap.push(nd + HEUR * this.bound(w, t), w);
      }
    }
    if (mark[t] !== st) return null;
    let n = 1;
    for (let v = t; prev[v] >= 0; v = prev[v]) n++;
    const out = new Int32Array(n);
    for (let v = t, i = n - 1; i >= 0; v = prev[v], i--) out[i] = v;
    return out;
  }

  // For every node, the next node on the way to the nearest of the sources (-1 at a source,
  // and -2 where no way leads): one search for all.
  tree(sources) {
    const { start, to, cost, N } = this, next = new Int32Array(N).fill(-2), d = new Float64Array(N).fill(Infinity), heap = new Heap(1 << 16);
    for (const s of sources) { d[s] = 0; next[s] = -1; heap.push(0, s); }
    while (heap.size) {
      const key = heap.topKey(), v = heap.pop();
      if (key > d[v]) continue;
      for (let e = start[v]; e < start[v + 1]; e++) {
        const w = to[e], nd = key + cost[e];
        if (nd < d[w]) { d[w] = nd; next[w] = v; heap.push(nd, w); }
      }
    }
    return { next, d };
  }

  // The route from node s to its source in a tree, or from the source to s (back = true).
  follow(tree, s, back = false) {
    if (tree.next[s] === -2) return null;
    const list = [];
    for (let v = s; v >= 0; v = tree.next[v]) list.push(v);
    if (back) list.reverse();
    return Int32Array.from(list);
  }

  // The time of each step of a route, in seconds from its start (cumulative): level walking
  // at WALK, and the climb of a stair or a ladder at CLIMB.
  times(path) {
    const { x, y, z } = this, T = new Float32Array(path.length);
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1], b = path[i];
      T[i] = T[i - 1] + Math.max(Math.hypot(x[b] - x[a], z[b] - z[a]) / WALK, Math.abs(y[b] - y[a]) / CLIMB);
    }
    return T;
  }
}
