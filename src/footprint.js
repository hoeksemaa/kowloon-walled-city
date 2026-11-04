// Building footprints as polygons, from the 1 m plot grid (or a finer grid: opts.scale).
//
// The traced plan is a grid of 1 m cells, thus a plot line that runs at an angle shows as a
// staircase. Here each boundary between two neighbours (two plots, or a plot and a lane) is
// traced once, as a chain of cell corners between two junctions, and simplified once with
// Douglas-Peucker. Both neighbours use the same simplified chain, so the polygons still
// meet with no gap and no overlap. The grid stays the model of record for walking, picking
// and placing people; the polygons are only for drawing.

// Region labels: a plot is its building id (0 or more); the rest are negative.
export const LANE = -1, YARD = -2, ROAD = -3, OUTSIDE = -4;

// opts: eps (the Douglas-Peucker tolerance, in cells), scale (metres per cell, 1 by default),
// pocket (the largest closed pocket of lane that is a gap in the trace, in cells), exact (a Map:
// region -> [{ poly, order, inside }], the polygons in world metres that drew the region on the
// cells; inside: the region is inside the polygon, not round it; see snapOf), regularise (true,
// or an object that gets the counts: straighten the walls; see regularise).
export function buildFootprints(L, opts = {}) {
  const EPS = opts.eps ?? 1.0, SC = opts.scale ?? 1, POCKET = opts.pocket ?? 4;
  const { W, D, owner, inside, alley } = L;
  const label = new Int32Array(W * D);
  for (let k = 0; k < W * D; k++) {
    if (owner[k] >= 0) label[k] = owner[k];
    else if (!inside[k]) label[k] = OUTSIDE;
    else label[k] = alley[k] === 2 ? YARD : alley[k] === 3 ? ROAD : LANE;
  }
  // A closed pocket of lane of POCKET cells or fewer is a gap in the trace, not a lane: draw it
  // as part of the plot it touches most. Larger closed pockets stay open, as light wells.
  const seen = new Uint8Array(W * D);
  for (let k = 0; k < W * D; k++) {
    if (label[k] !== LANE || seen[k]) continue;
    const comp = [k], touch = new Map();
    seen[k] = 1;
    for (let q = 0; q < comp.length; q++) {
      const c = comp[q], i = c % W, j = (c / W) | 0;
      for (const [ni, nj] of [[i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]]) {
        const n = nj * W + ni;
        const v = ni < 0 || nj < 0 || ni >= W || nj >= D ? OUTSIDE : label[n];
        if (v === LANE) { if (!seen[n]) { seen[n] = 1; comp.push(n); } } else touch.set(v, (touch.get(v) || 0) + 1);
      }
    }
    if (comp.length > POCKET || [...touch.keys()].some((v) => v < 0)) continue;
    let best = -1, bn = 0;
    for (const [v, n] of touch) if (n > bn) { bn = n; best = v; }
    if (best >= 0) for (const c of comp) label[c] = best;
  }
  const lab = (i, j) => (i < 0 || j < 0 || i >= W || j >= D ? OUTSIDE : label[j * W + i]);
  const CW = W + 1;
  const cid = (i, j) => j * CW + i;
  const cx = (c) => c % CW, cz = (c) => (c / CW) | 0;

  // A corner is a junction when three or more regions meet there, or two regions meet
  // corner to corner (a pinch). Chains run from junction to junction.
  const junction = new Uint8Array(CW * (D + 1));
  for (let j = 0; j <= D; j++)
    for (let i = 0; i <= W; i++) {
      const a = lab(i - 1, j - 1), b = lab(i, j - 1), c = lab(i - 1, j), d = lab(i, j);
      let n = 1;
      if (b !== a) n++;
      if (c !== a && c !== b) n++;
      if (d !== a && d !== b && d !== c) n++;
      if (n >= 3 || (n === 2 && a === d && b === c && a !== b)) junction[cid(i, j)] = 1;
    }

  // Rings of each region, as corner lists. The region is on the right of each directed edge
  // in plan view (x right, z down), so outer rings have positive area and holes negative.
  const regions = new Map();
  for (let k = 0; k < W * D; k++) {
    const r = label[k];
    if (r === OUTSIDE) continue;
    if (!regions.has(r)) regions.set(r, []);
    regions.get(r).push(k);
  }
  const ringsOf = (r, cells) => {
    const out = new Map(); // corner -> outgoing edge end corners
    const add = (a, b) => {
      let l = out.get(a);
      if (!l) out.set(a, (l = []));
      l.push(b);
    };
    for (const k of cells) {
      const i = k % W, j = (k / W) | 0;
      if (lab(i, j - 1) !== r) add(cid(i, j), cid(i + 1, j));
      if (lab(i + 1, j) !== r) add(cid(i + 1, j), cid(i + 1, j + 1));
      if (lab(i, j + 1) !== r) add(cid(i + 1, j + 1), cid(i, j + 1));
      if (lab(i - 1, j) !== r) add(cid(i, j + 1), cid(i, j));
    }
    const rings = [];
    for (const [start, l0] of out) {
      while (l0.length) {
        const ring = [start];
        let prev = start, cur = l0.pop();
        while (cur !== start) {
          ring.push(cur);
          const l = out.get(cur);
          let pick = 0;
          if (l.length > 1) {
            // At a pinch, turn toward the region, so each ring stays simple.
            const dx = cx(cur) - cx(prev), dz = cz(cur) - cz(prev);
            let best = -Infinity;
            l.forEach((nx, q) => {
              const cr = dx * (cz(nx) - cz(cur)) - dz * (cx(nx) - cx(cur));
              if (cr > best) { best = cr; pick = q; }
            });
          }
          prev = cur;
          cur = l.splice(pick, 1)[0];
        }
        rings.push(ring);
      }
    }
    return rings;
  };

  // The region on the far side of the edge a -> b.
  const across = (a, b) => {
    const dx = cx(b) - cx(a), dz = cz(b) - cz(a);
    return lab(Math.floor(cx(a) + dx * 0.5 + dz * 0.5), Math.floor(cz(a) + dz * 0.5 - dx * 0.5));
  };

  // Split every ring into chains; one record per chain, shared by both sides.
  const chains = new Map(); // key "a>b" (first two corners, forward) -> chain
  const regionRings = new Map();
  for (const [r, cells] of regions) {
    const rings = ringsOf(r, cells).map((ring) => {
      const n = ring.length;
      let s0 = ring.findIndex((c) => junction[c]);
      const parts = [];
      if (s0 < 0) {
        // No junction: one closed chain. Start it at its lowest corner, in a fixed direction,
        // so that the region on the other side finds the same record.
        let m = 0;
        for (let q = 1; q < n; q++) if (ring[q] < ring[m]) m = q;
        const fwd = ring[(m + 1) % n] < ring[(m + n - 1) % n];
        const pts = [];
        for (let q = 0; q <= n; q++) pts.push(ring[(m + (fwd ? q : n - q) + n) % n]);
        const key = `o${pts[0]}`;
        let ch = chains.get(key);
        if (!ch) chains.set(key, (ch = { key, pts, closed: true, eps: EPS, sides: [] }));
        ch.sides.push(r);
        parts.push({ ch, rev: !fwd });
      } else {
        let q = s0;
        do {
          const pts = [ring[q]];
          let e = q;
          do { e = (e + 1) % n; pts.push(ring[e]); } while (!junction[ring[e]]);
          const fk = `${pts[0]}>${pts[1]}`, rk = `${pts[pts.length - 1]}>${pts[pts.length - 2]}`;
          let ch = chains.get(fk), rev = false;
          if (!ch && chains.has(rk)) { ch = chains.get(rk); rev = true; }
          if (!ch) chains.set(fk, (ch = { key: fk, pts, closed: false, eps: EPS, sides: [] }));
          ch.sides.push(r);
          parts.push({ ch, rev });
          q = e;
        } while (q !== s0);
      }
      return parts;
    });
    regionRings.set(r, rings);
  }
  for (const ch of chains.values()) {
    const [a, b] = ch.pts;
    // The region on the right of the chain's own direction, and the one across.
    const dx = cx(b) - cx(a), dz = cz(b) - cz(a);
    ch.right = lab(Math.floor(cx(a) + dx * 0.5 - dz * 0.5), Math.floor(cz(a) + dz * 0.5 + dx * 0.5));
    ch.left = across(a, b);
  }

  // Exact outlines. A region of opts.exact was drawn as a polygon on the cells, thus its outline
  // is a staircase, and each step where the region across changes is a junction: Douglas-
  // Peucker cannot take those steps out. Here a corner on the outline of such a region goes
  // onto the nearest edge of its polygons (within SNAP cells: a step is at most 0.71 cells off
  // the edge). A corner has one place for every chain that ends there, thus the neighbours
  // still meet the polygon with no gap and no overlap.
  const SNAP = 0.75;
  const edgesOf = new Map(), allEdges = [];
  for (const [r, list] of opts.exact || []) {
    const E = [];
    for (const { poly, order, inside } of list) {
      const P = { Q: poly.map(([x, z]) => [(x - L.x0) / SC, (z - L.z0) / SC]), order, inside, r };
      P.edges = P.Q.map((a, k) => ({ P, k, a, b: P.Q[(k + 1) % P.Q.length], line: allEdges.length + k }));
      allEdges.push(...P.edges);
      E.push(...P.edges);
    }
    edgesOf.set(r, E);
  }
  // Edges on one line (the rules draw neighbours with a shared line) have one line number.
  const lineOff = (e, p) => {
    const dx = e.b[0] - e.a[0], dz = e.b[1] - e.a[1];
    return Math.abs((p[0] - e.a[0]) * dz - (p[1] - e.a[1]) * dx) / Math.hypot(dx, dz);
  };
  for (const e of allEdges)
    for (const f of allEdges)
      if (f.line > e.line && lineOff(e, f.a) < 0.2 && lineOff(e, f.b) < 0.2) {
        const from = f.line;
        for (const g of allEdges) if (g.line === from) g.line = e.line;
      }
  // The polygons of buildings (one for each rule), and the angle (radians) that they cover round
  // the point p: a corner of a polygon adds its inner angle, a point on an edge adds PI.
  const polys = [...new Map(allEdges.filter((e) => e.P.inside).map((e) => [e.P.order, e.P])).values()];
  for (const P of polys) {
    const n = P.Q.length;
    P.inner = P.Q.map((v, k) => {
      const u = P.Q[(k + n - 1) % n], w = P.Q[(k + 1) % n];
      const t = Math.atan2((w[0] - v[0]) * (u[1] - v[1]) - (w[1] - v[1]) * (u[0] - v[0]), (w[0] - v[0]) * (u[0] - v[0]) + (w[1] - v[1]) * (u[1] - v[1]));
      return (t + 2 * Math.PI) % (2 * Math.PI);
    });
    // the other way round if the polygon runs the other way
    if (P.inner.reduce((s, t) => s + t, 0) > n * Math.PI) P.inner = P.inner.map((t) => 2 * Math.PI - t);
  }
  const segOff = (e, p) => {
    const dx = e.b[0] - e.a[0], dz = e.b[1] - e.a[1];
    const t = Math.max(0, Math.min(1, ((p[0] - e.a[0]) * dx + (p[1] - e.a[1]) * dz) / (dx * dx + dz * dz)));
    return Math.hypot(p[0] - e.a[0] - t * dx, p[1] - e.a[1] - t * dz);
  };
  const cover = (p) => {
    let a = 0;
    for (const P of polys) {
      const k = P.Q.findIndex((v) => Math.hypot(v[0] - p[0], v[1] - p[1]) < 0.02);
      if (k >= 0) a += P.inner[k];
      else if (P.edges.some((e) => segOff(e, p) < 0.02)) a += Math.PI;
    }
    return a;
  };
  // A place on the outline of a building that has no cell round corner c (around: the regions
  // of its four cells) is not a place for c: there the polygons draw a wall between two other
  // regions. order: the rule of the place (its own polygon).
  const foreign = (p, around, order) => polys.some((P) => P.order !== order && !around.includes(P.r) && P.edges.some((e) => segOff(e, p) < 0.02));
  const snaps = new Map(), noSnap = new Set();
  // The place of corner c on a polygon: { p, P (the polygon), e (the edge; null at a vertex),
  // k (the vertex, or -1), lines (the lines it is on) }, or null.
  const atVertex = (P, k) => ({ p: P.Q[k], P, e: null, k, lines: [P.edges[(k + P.Q.length - 1) % P.Q.length].line, P.edges[k].line] });
  const snapOf = (c) => {
    if (noSnap.has(c)) return null;
    if (snaps.has(c)) return snaps.get(c);
    const x = cx(c), z = cz(c), around = [lab(x - 1, z - 1), lab(x, z - 1), lab(x - 1, z), lab(x, z)];
    let best = null, bd = SNAP, bo = -1;
    for (const r of around.filter((r, i) => edgesOf.has(r) && around.indexOf(r) === i))
      for (const e of edgesOf.get(r)) {
        const dx = e.b[0] - e.a[0], dz = e.b[1] - e.a[1];
        const t = ((x - e.a[0]) * dx + (z - e.a[1]) * dz) / (dx * dx + dz * dz);
        const p = t <= 0 ? e.a : t >= 1 ? e.b : [e.a[0] + t * dx, e.a[1] + t * dz];
        const d = Math.hypot(x - p[0], z - p[1]);
        // the nearest edge; of two at the same distance, the one of the later rule (it won the cells)
        if (d > bd + 1e-9 || (best && d > bd - 1e-9 && e.P.order <= bo) || foreign(p, around, e.P.order)) continue;
        bd = d;
        bo = e.P.order;
        best = t <= 0 ? atVertex(e.P, e.k) : t >= 1 ? atVertex(e.P, (e.k + 1) % e.P.Q.length) : { p, P: e.P, e, k: -1, lines: [e.line] };
      }
    // A junction (three regions meet) within 1.5 cells of a corner of a polygon is that corner: the
    // cells move a meeting point of three outlines by a step. Not a corner that the polygons
    // cover all round (two rules meet there, with no room for a third region).
    if (junction[c]) {
      let vd = 1.5, vo = -1;
      for (const r of around.filter((r, i) => edgesOf.has(r) && around.indexOf(r) === i))
        for (const e of edgesOf.get(r)) {
          const d = Math.hypot(x - e.a[0], z - e.a[1]);
          if (d > vd + 1e-9 || (d > vd - 1e-9 && e.P.order <= vo) || cover(e.a) > 2 * Math.PI - 0.01 || foreign(e.a, around, e.P.order)) continue;
          vd = d;
          vo = e.P.order;
          best = atVertex(e.P, e.k);
        }
    }
    snaps.set(c, best);
    return best;
  };
  // The vertices of the polygon between two places on it (two at most, by the shorter way).
  // Two places on two polygons: the vertex of a polygon where a line of each place meets (a
  // rule draws its neighbour on the same line, thus the corner can be on the other polygon).
  const between = (s1, s2) => {
    if (!s1 || !s2 || (s1.e && s1.e === s2.e)) return [];
    if (s1.P !== s2.P) {
      if (s1.lines.some((l) => s2.lines.includes(l))) return [];
      for (const e of allEdges) {
        if (!s1.lines.includes(e.line)) continue;
        for (const v of [atVertex(e.P, e.k), atVertex(e.P, (e.k + 1) % e.P.Q.length)]) {
          if (!v.lines.some((l) => s2.lines.includes(l))) continue;
          const ax = v.p[0] - s1.p[0], az = v.p[1] - s1.p[1], bx = s2.p[0] - v.p[0], bz = s2.p[1] - v.p[1];
          const la = Math.hypot(ax, az), lb = Math.hypot(bx, bz);
          // near both places, and not back the way it came
          if (la < 4 && lb < 4 && (la < 0.05 || lb < 0.05 || ax * bx + az * bz > -0.7 * la * lb)) return [v];
        }
      }
      return [];
    }
    const n = s1.P.Q.length, m = (v) => ((v % n) + n) % n;
    let best = null;
    for (const dir of [1, -1]) {
      const first = s1.e ? m(dir > 0 ? s1.e.k + 1 : s1.e.k) : m(s1.k + dir);
      const last = s2.e ? m(dir > 0 ? s2.e.k : s2.e.k + 1) : m(s2.k - dir);
      if (m(last + dir) === first) return [];
      const out = [];
      for (let v = first, q = 0; q < 2; q++, v = m(v + dir)) {
        out.push(atVertex(s1.P, v));
        if (v === last) {
          if (!best || out.length < best.length) best = out;
          else if (out.length === best.length) return [];
          break;
        }
      }
    }
    return best || [];
  };
  // Simplify a chain with corners on a polygon (S: snapOf of each corner). The vertices of the
  // polygon go in between two edges; a point on one line with the points before and after it
  // goes out; a run off the polygons is Douglas-Peucker. ch.x: true for a point on a polygon.
  // A short run of corners off the polygons (1 to 3) between two places on two edges that meet:
  // the cells cut the corner of the polygon (a step of more than SNAP, or the opening of
  // src/layout.js took the tip). Returns that corner of the polygon, if each corner of the run
  // is within 1.5 cells of the two edges; else null.
  const cornerOf = (s1, s2, run) => {
    if (!s1 || !s2 || !s1.e || !s2.e || run.length > 3) return null;
    const V = between(s1, s2);
    if (V.length !== 1) return null;
    const segd = (x, z, a, b) => {
      const dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz;
      const t = l2 > 0 ? Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2)) : 0;
      return Math.hypot(x - a[0] - t * dx, z - a[1] - t * dz);
    };
    const v = V[0].p;
    return run.every((c) => Math.min(segd(cx(c), cz(c), s1.p, v), segd(cx(c), cz(c), v, s2.p)) <= 1.5) ? V[0] : null;
  };
  const simplifyExact = (ch, S) => {
    const n = ch.closed ? ch.pts.length - 1 : ch.pts.length;
    // the corners in order; a closed chain starts at a corner on a polygon and ends there again
    const o = ch.closed ? S.findIndex(Boolean) : 0;
    if (o < 0 || o >= n) return false;
    const I = [];
    for (let q = 0; q < n; q++) I.push((o + q) % n);
    if (ch.closed) I.push(o);
    let A = []; // { p, s }
    for (let i = 0; i < I.length; i++) {
      const q = I[i], s = S[q], sp = i > 0 ? S[I[i - 1]] : null;
      if (sp && !s) {
        let r = i;
        while (r < I.length && !S[I[r]] && r - i < 4) r++;
        const v = r < I.length ? cornerOf(sp, S[I[r]], I.slice(i, r).map((u) => ch.pts[u])) : null;
        if (v) {
          A.push({ p: v.p, s: v });
          i = r - 1;
          continue;
        }
      }
      if (i > 0) for (const v of between(sp, s)) A.push({ p: v.p, s: v });
      A.push({ p: s ? s.p : [cx(ch.pts[q]), cz(ch.pts[q])], s });
    }
    if (ch.closed) A.pop();
    const m = A.length;
    const online = (u, v, w) => u.s && v.s && w.s && v.s.lines.some((l) => u.s.lines.includes(l) && w.s.lines.includes(l));
    if (ch.closed) {
      // start the closed chain at a point that stays
      const q0 = A.findIndex((v, q) => v.s && !online(A[(q + m - 1) % m], v, A[(q + 1) % m]));
      if (q0 < 0) return false;
      A = [...A.slice(q0), ...A.slice(0, q0 + 1)];
    }
    const k = A.length;
    const stays = (q) => q === 0 || q === k - 1 || (A[q].s && !online(A[q - 1], A[q], A[q + 1]));
    const out = [A[0]];
    for (let a = 0, b = 1; b < k; b++) {
      if (!stays(b)) continue;
      if (b > a + 1 && !A[a + 1].s) {
        // a run off the polygons
        const d = dp(A.slice(a, b + 1).map((v) => v.p), ch.eps);
        for (let q = 1; q < d.length - 1; q++) out.push({ p: d[q], s: null });
      }
      out.push(A[b]);
      a = b;
    }
    // two corners can come to one place: keep one (the end of the chain, if it is one of them)
    ch.s = [];
    ch.x = [];
    out.forEach(({ p, s }, q) => {
      const l = ch.s[ch.s.length - 1];
      if (l && Math.abs(l[0] - p[0]) < 1e-9 && Math.abs(l[1] - p[1]) < 1e-9) {
        if (q === out.length - 1 && ch.s.length > 1) { ch.s[ch.s.length - 1] = p; ch.x[ch.x.length - 1] = !!s; }
        return;
      }
      ch.s.push(p);
      ch.x.push(!!s);
    });
    return true;
  };

  const simplifyAll = () => {
    for (const ch of chains.values()) {
      ch.x = null;
      if (edgesOf.size) {
        const S = ch.pts.map(snapOf);
        if (S.some(Boolean) && simplifyExact(ch, S)) continue;
      }
      const P = ch.pts.map((c) => [cx(c), cz(c)]);
      if (ch.closed) {
        // Split a closed chain at its far point, so each half has fixed ends.
        let far = 1, fd = -1;
        for (let q = 1; q < P.length - 1; q++) {
          const d = (P[q][0] - P[0][0]) ** 2 + (P[q][1] - P[0][1]) ** 2;
          if (d > fd) { fd = d; far = q; }
        }
        const h1 = dp(P.slice(0, far + 1), ch.eps), h2 = dp(P.slice(far), ch.eps);
        ch.s = h1.concat(h2.slice(1));
      } else ch.s = dp(P, ch.eps);
    }
  };

  // Rings of a region in metres, from its simplified chains.
  // other: the region across the edge that starts at each point. A point at the same place as
  // the one before it (two corners on one place of a polygon) is left out.
  const assemble = (r) =>
    regionRings.get(r).map((parts) => {
      const pts = [], other = [];
      const same = (a, b) => a[0] === b[0] && a[1] === b[1];
      for (const { ch, rev } of parts) {
        const s = rev ? [...ch.s].reverse() : ch.s, o = rev ? ch.right : ch.left;
        for (let q = 0; q < s.length - 1; q++) {
          if (pts.length && same(pts[pts.length - 1], s[q])) other[other.length - 1] = o;
          else { pts.push(s[q]); other.push(o); }
        }
      }
      if (pts.length > 1 && same(pts[0], pts[pts.length - 1])) { pts.pop(); other.pop(); }
      return { pts, other };
    });

  // Check and repair: a chain that makes a region's ring self-cross, or cross another
  // chain, is simplified again with a smaller tolerance (in the end, not at all).
  const check = () => {
    const bad = new Set();
    const segs = [];
    for (const ch of chains.values()) for (let q = 0; q < ch.s.length - 1; q++) segs.push([ch, ch.s[q], ch.s[q + 1]]);
    const grid = new Map(), G = Math.max(4, Math.round(4 / SC));
    segs.forEach((s, idx) => {
      const x0 = Math.floor(Math.min(s[1][0], s[2][0]) / G), x1 = Math.floor(Math.max(s[1][0], s[2][0]) / G);
      const z0 = Math.floor(Math.min(s[1][1], s[2][1]) / G), z1 = Math.floor(Math.max(s[1][1], s[2][1]) / G);
      for (let gx = x0; gx <= x1; gx++)
        for (let gz = z0; gz <= z1; gz++) {
          const key = gx * 100000 + gz;
          let l = grid.get(key);
          if (!l) grid.set(key, (l = []));
          l.push(idx);
        }
    });
    for (const l of grid.values())
      for (let p = 0; p < l.length; p++)
        for (let q = p + 1; q < l.length; q++) {
          const A = segs[l[p]], B = segs[l[q]];
          if (properCross(A[1], A[2], B[1], B[2])) { bad.add(A[0]); bad.add(B[0]); }
        }
    for (const [r, cells] of regions) {
      if (r < 0) continue;
      const area = assemble(r).reduce((s, ring) => s + signedArea(ring.pts), 0);
      if (area < cells.length * 0.6 || area > cells.length * 1.4)
        for (const parts of regionRings.get(r)) for (const { ch } of parts) bad.add(ch);
    }
    return bad;
  };
  for (let pass = 0; pass < 4; pass++) {
    simplifyAll();
    const bad = check();
    if (!bad.size) break;
    for (const ch of bad) {
      // a chain on a polygon (see snapOf) goes back to its corners
      if (ch.x) for (const c of ch.pts) noSnap.add(c);
      ch.eps = pass >= 2 ? 0 : ch.eps * 0.5;
    }
  }

  // Straight walls (see regularise). The check runs again; where it finds a problem, the points
  // of those chains stay where Douglas-Peucker put them and regularise runs again. If the check
  // still fails, the walls stay as Douglas-Peucker left them.
  if (opts.regularise) {
    const kept = new Map([...chains.values()].map((ch) => [ch, ch.s]));
    const t0 = globalThis.performance ? performance.now() : 0;
    const cells = new Map([...regions].map(([r, c]) => [r, c.length]));
    const stay = new Set();
    for (const ch of chains.values()) ch.raw = ch.pts.map((c) => [cx(c), cz(c)]);
    let stats;
    for (let pass = 0; pass < 3; pass++) {
      stats = regularise(chains.values(), regionRings, cells, SC, stay);
      const bad = check();
      stats.retries = pass;
      if (!bad.size) break;
      for (const [ch, s] of kept) ch.s = s;
      if (pass === 2) { stats.undone = true; break; }
      for (const ch of bad) for (const p of ch.s) stay.add(`${p[0]},${p[1]}`);
    }
    stats.ms = (globalThis.performance ? performance.now() : 0) - t0;
    if (typeof opts.regularise === 'object') Object.assign(opts.regularise, stats);
  }

  // Output in world metres.
  const X = (p) => [L.x0 + p[0] * SC, L.z0 + p[1] * SC];
  const out = new Map();
  for (const r of regions.keys()) {
    const rings = assemble(r).map(({ pts, other }) => {
      const P = pts.map(X);
      // Each edge of the ring with the region across it.
      const edges = P.map((a, q) => ({ a, b: P[(q + 1) % P.length], other: other[q] }));
      return { pts: P, edges, hole: signedArea(pts) < 0 };
    });
    out.set(r, rings);
  }
  return out;
}

// Douglas-Peucker on an open polyline; the ends stay.
function dp(P, eps) {
  if (P.length <= 2 || eps <= 0) return P.slice();
  const keep = dpKeep(P, eps);
  return P.filter((_, q) => keep[q]);
}

// The points that Douglas-Peucker keeps (1 for each).
function dpKeep(P, eps) {
  const keep = new Uint8Array(P.length);
  keep[0] = keep[P.length - 1] = 1;
  const stack = [[0, P.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, az] = P[a], [bx, bz] = P[b];
    const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
    let far = -1, fd = eps;
    for (let q = a + 1; q < b; q++) {
      const px = P[q][0] - ax, pz = P[q][1] - az;
      const d = l2 > 0 ? Math.abs(px * dz - pz * dx) / Math.sqrt(l2) : Math.hypot(px, pz);
      if (d > fd) { fd = d; far = q; }
    }
    if (far >= 0) { keep[far] = 1; stack.push([a, far], [far, b]); }
  }
  return keep;
}

export function signedArea(P) {
  let s = 0;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) s += P[j][0] * P[i][1] - P[i][0] * P[j][1];
  return s / 2;
}

// True when segments ab and cd cross at a point inside both (not at a shared end).
function properCross(a, b, c, d) {
  const o = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  const d1 = o(c, d, a), d2 = o(c, d, b), d3 = o(a, b, c), d4 = o(a, b, d);
  return ((d1 > 1e-9 && d2 < -1e-9) || (d1 < -1e-9 && d2 > 1e-9)) && ((d3 > 1e-9 && d4 < -1e-9) || (d3 < -1e-9 && d4 > 1e-9));
}

// Main axis of a polygon (unit vector), from its longest edges.
export function mainAxis(rings) {
  let sx = 0, sz = 0;
  for (const ring of rings)
    for (const e of ring.edges) {
      const dx = e.b[0] - e.a[0], dz = e.b[1] - e.a[1];
      const l = Math.hypot(dx, dz);
      if (l < 1e-6) continue;
      // Double the angle, so that opposite directions add up.
      const a = Math.atan2(dz, dx) * 2;
      sx += Math.cos(a) * l * l;
      sz += Math.sin(a) * l * l;
    }
  const a = Math.atan2(sz, sx) / 2;
  return [Math.cos(a), Math.sin(a)];
}

// Intervals where the line p + t*dir is inside the polygon (even-odd over all rings).
export function clipLine(rings, p, dir) {
  const ts = [];
  for (const ring of rings)
    for (const e of ring.edges) {
      const ex = e.b[0] - e.a[0], ez = e.b[1] - e.a[1];
      const den = dir[0] * ez - dir[1] * ex;
      if (Math.abs(den) < 1e-9) continue;
      const wx = e.a[0] - p[0], wz = e.a[1] - p[1];
      const t = (wx * ez - wz * ex) / den, u = (wx * dir[1] - wz * dir[0]) / den;
      if (u >= 0 && u < 1) ts.push(t);
    }
  ts.sort((a, b) => a - b);
  const out = [];
  for (let q = 0; q + 1 < ts.length; q += 2) out.push([ts[q], ts[q + 1]]);
  return out;
}

// ---- Straight walls ----------------------------------------------------------------------------
// After Douglas-Peucker, a wall of the fine plan that is one straight line on the plan can still
// come out a few degrees off its neighbours, or with a kink where its chain ends at a junction
// (the ends of a chain stay on the steps of the cells). regularise moves the points of the
// simplified chains a little, so that walls near each other are square or parallel and a wall
// goes on straight through a junction. Each point is one node for every ring that uses it, thus a
// party wall stays one line for both buildings and the lanes keep their edges. Linear least
// squares on the nodes (conjugate gradients on the normal equations):
//   anchor     p = p0 (weight 1)
//   direction  n . (pb - pa) = 0, n the normal of the target of a segment of 0.6 m or more: the
//              nearest axis of the local frame (from the walls of 2.5 m or more within 10 m, where
//              they agree) if within the limit of the segment, else a longer wall near it within
//              that limit; two segments that go on straight through a node (within 12 deg) take
//              one direction, if the one that turns stays within its limit or is shorter than
//              1.5 m (weight 6)
//   straight   n . p = c for each node of a straight run of a building ring (Douglas-Peucker with
//              0.5 m over the ring, across the junctions): the nodes go onto the line of the run,
//              if no segment of 1.5 m or more turns past its limit (weight 4)
// The angle of a segment of 2.5 m or more is the line fitted to the corners of the cells under it,
// if they lie near one line (RMS 0.15 m or less): the plan draws a straight wall there, and Douglas-
// Peucker ends it on a step of the cells. The limit of such a wall is 3 deg (the fitted angle is
// itself 1-2 deg off the drawn wall); else 8 deg (5 deg for 4 m or more).
// Guards: a node moves 0.9 m at most (0.5 m where nodes are dense), no two segments cross, no
// segment turns round, a lane keeps its width (or at least 0.9 m) at each node and every 0.5 m
// along its walls, a party wall of 1.2 m keeps 1.2 m (a door needs it, see
// src/structure/links.js), a building keeps its area within 10 %. Where a lane, a wall or an
// area fails the first time, a term holds it; else, and the second time, the terms near it go.
// Then the solve runs again (8 times at most); a node that fails twice stays where it was. At
// the end, a node of two segments goes if it turns less than 1 deg or is less than 0.15 m from
// the next node. The points on the polygons of opts.exact stay.
// INFERRED: the buildings of a block were built square and straight where the plot let them;
// the small angles and kinks come from the trace and the cells. The numbers are from the
// research prototype (2026-11-03), not from a source, except the limits. The prototype took 15
// deg (8 deg for 4 m or more). With those, 6 flats of 2 buildings (43 and 112, 27 Lo Yan Street)
// have no way to the lanes (src/structure/plan.js puts the stairs by the outline), and long walls
// turn away from the lines of the plan (checked on the photo of the plan, 2026-11-03). The fit
// and the 3 deg limit keep a wall that the plan draws at an angle at that angle; in the curved
// north-east corner (no frame), the bends between walls of 1.5 m or more stay. With a 2 deg
// limit, the route of src/structure/links.js (then from north to south, near 3/F) went down to 1/F.
const RG = {
  wd: 6, wb: 4, short: 0.6, frame: 2.5, near: 10, coh: 0.5, tol: 8, tolLong: 5, long: 4, through: 12,
  run: 0.5, runMin: 2.5, runSnap: 10, move: 0.9, moveDense: 0.5, dense: 1, denseN: 4, lane: 0.9,
  laneNear: 1.5, laneStep: 0.5, party: 1.2, area: 0.1, hold: 10, turn: 1, close: 0.15, passes: 8,
  fit: 2.5, fitRms: 0.15, fitTol: 3, bend: 1.5,
};

// chainList: the chains of buildFootprints (s: points in cells, x: on a polygon, left, right,
// closed); regionRings: region -> rings as chain parts; cells: building -> its count of cells;
// SC: metres per cell; stay: a set of points ("x,z" in cells) that do not move. Changes ch.s.
// Returns counts.
function regularise(chainList, regionRings, cells, SC, stay = new Set()) {
  const m = (v) => v / SC, DEG = Math.PI / 180, PI = Math.PI;
  const dev = (a, b, per) => { const d = Math.abs(a - b) % per; return Math.min(d, per - d); };
  const CH = [...chainList];
  // nodes
  const idOf = new Map(), X = [], pin = [];
  for (const ch of CH)
    ch.ids = ch.s.map((p, q) => {
      const key = `${p[0]},${p[1]}`;
      let k = idOf.get(key);
      if (k === undefined) { idOf.set(key, (k = pin.length)); X.push(p[0], p[1]); pin.push(0); }
      if ((ch.x && ch.x[q]) || stay.has(key)) pin[k] = 1;
      return k;
    });
  const N = pin.length, P0 = Float64Array.from(X);
  // segments, in the direction of their chain
  const SA = [], SB = [], SCH = [];
  for (const ch of CH)
    for (let q = 0; q + 1 < ch.ids.length; q++)
      if (ch.ids[q] !== ch.ids[q + 1]) { SA.push(ch.ids[q]); SB.push(ch.ids[q + 1]); SCH.push(ch); }
  const M = SA.length;
  const adj = Array.from({ length: N }, () => []);
  for (let s = 0; s < M; s++) { adj[SA[s]].push(s); adj[SB[s]].push(s); }
  const len = new Float64Array(M), th = new Float64Array(M), mx = new Float64Array(M), mz = new Float64Array(M);
  for (let s = 0; s < M; s++) {
    const a = SA[s], b = SB[s], dx = P0[2 * b] - P0[2 * a], dz = P0[2 * b + 1] - P0[2 * a + 1];
    len[s] = Math.hypot(dx, dz);
    th[s] = ((Math.atan2(dz, dx) % PI) + PI) % PI;
    mx[s] = (P0[2 * a] + P0[2 * b]) / 2;
    mz[s] = (P0[2 * a + 1] + P0[2 * b + 1]) / 2;
  }
  // The angle of the trace under each segment: a line fitted to the corners of the cells between
  // its two points (total least squares). A segment of 2.5 m or more whose corners lie close to
  // one line (RMS 0.15 m or less: the steps of a straight line on the cells) is a wall that the
  // plan draws straight, at that angle; fit is NaN for the others. INFERRED: on the photo of the
  // plan, this angle is nearer the drawn wall than the angle of the segment (2026-11-03: median
  // 1.0 deg off, not 1.5 deg, for RMS 0.08-0.1 m; 2.0 deg, not 3.5 deg, for 0.12-0.15 m).
  const fit = new Float64Array(M).fill(NaN);
  for (let s = 0, c = 0; c < CH.length; c++) {
    const ch = CH[c], raw = ch.raw || [], at = [];
    // the place of each point of the chain among its corners (-1: a point on a polygon)
    for (let q = 0, ptr = 0; q < ch.s.length; q++) {
      let i = ptr;
      while (i < raw.length && (raw[i][0] !== ch.s[q][0] || raw[i][1] !== ch.s[q][1])) i++;
      if (i < raw.length) at.push((ptr = i));
      else at.push(-1);
    }
    for (let q = 0; q + 1 < ch.ids.length; q++) {
      if (ch.ids[q] === ch.ids[q + 1]) continue;
      const i0 = at[q], i1 = at[q + 1];
      if (i0 >= 0 && i1 > i0 + 1 && len[s] >= m(RG.fit)) {
        let n = 0, ax = 0, az = 0, xx = 0, zz = 0, xz = 0;
        for (let i = i0; i <= i1; i++) { n++; ax += raw[i][0]; az += raw[i][1]; }
        ax /= n;
        az /= n;
        for (let i = i0; i <= i1; i++) {
          const dx = raw[i][0] - ax, dz = raw[i][1] - az;
          xx += dx * dx; zz += dz * dz; xz += dx * dz;
        }
        const t = ((Math.atan2(2 * xz, xx - zz) / 2) % PI + PI) % PI;
        const lo = (xx + zz) / 2 - Math.hypot((xx - zz) / 2, xz);
        if (Math.sqrt(Math.max(0, lo) / n) <= m(RG.fitRms) && dev(t, th[s], PI) <= RG.runSnap * DEG) fit[s] = t;
      }
      s++;
    }
  }
  const dirOf = (s) => (isNaN(fit[s]) ? th[s] : fit[s]);
  // a grid of boxes: cell size G; box(i) -> [x0, z0, x1, z1]
  const KEY = 100003;
  const makeGrid = (G, n, box) => {
    const g = new Map();
    for (let i = 0; i < n; i++) {
      const [x0, z0, x1, z1] = box(i);
      for (let gx = Math.floor(x0 / G); gx <= Math.floor(x1 / G); gx++)
        for (let gz = Math.floor(z0 / G); gz <= Math.floor(z1 / G); gz++) {
          const key = gx * KEY + gz;
          let l = g.get(key);
          if (!l) g.set(key, (l = []));
          l.push(i);
        }
    }
    return g;
  };
  const around = (g, G, x, z, r, f) => {
    for (let gx = Math.floor((x - r) / G); gx <= Math.floor((x + r) / G); gx++)
      for (let gz = Math.floor((z - r) / G); gz <= Math.floor((z + r) / G); gz++) for (const i of g.get(gx * KEY + gz) || []) f(i);
  };

  // ---- the target direction of each segment ----
  const target = new Float64Array(M).fill(NaN), framed = new Uint8Array(M);
  const stats = { nodes: N, segments: M, fit: 0, frame: 0, along: 0, held: 0, through: 0, runs: 0 };
  const GN = m(RG.near), mids = makeGrid(GN, M, (s) => [mx[s], mz[s], mx[s], mz[s]]);
  // the most a segment turns: 3 deg for a wall that the plan draws straight, else 8 deg (5 deg
  // for 4 m or more)
  const tolOf = (s) => (!isNaN(fit[s]) ? RG.fitTol : len[s] >= m(RG.long) ? RG.tolLong : RG.tol) * DEG;
  for (let s = 0; s < M; s++) {
    if (len[s] < m(RG.short)) continue;
    const own = dirOf(s), held = !isNaN(fit[s]), tol = tolOf(s);
    let c4 = 0, s4 = 0, w = 0, best = -1;
    around(mids, GN, mx[s], mz[s], GN, (q) => {
      if ((mx[q] - mx[s]) ** 2 + (mz[q] - mz[s]) ** 2 >= GN * GN) return;
      if (len[q] >= m(RG.frame)) { c4 += len[q] * Math.cos(4 * dirOf(q)); s4 += len[q] * Math.sin(4 * dirOf(q)); w += len[q]; }
      if (len[q] >= m(RG.long) && len[q] >= 1.5 * len[s] && dev(own, dirOf(q), PI) <= Math.min(tol, RG.tolLong * DEG) && (best < 0 || len[q] > len[best])) best = q;
    });
    // the frame: the mean of the directions mod 90 deg; where the walls do not agree (the
    // curved north-east corner), there is none
    const coherent = w > 0 && Math.hypot(c4, s4) > RG.coh * w;
    framed[s] = coherent ? 1 : 0;
    if (pin[SA[s]] && pin[SB[s]]) continue;
    if (held) stats.fit++;
    if (coherent) {
      const fr = Math.atan2(s4, c4) / 4, t = fr + Math.round((own - fr) / (PI / 2)) * (PI / 2);
      if (Math.abs(own - t) <= tol) { target[s] = ((t % PI) + PI) % PI; stats.frame++; continue; }
    }
    if (best >= 0) { target[s] = dirOf(best); stats.along++; }
    else if (held) { target[s] = own; stats.held++; }
  }
  // straight on through a node: the longer segment (or the one the plan draws straight) gives its
  // direction to the other. The other turns no more than its own limit (see tolOf), unless it is
  // shorter than 1.5 m (a step of the cells); where the walls round a node do not agree (no
  // frame), two segments of 1.5 m or more keep their bend.
  for (let k = 0; k < N; k++) {
    const l = adj[k].filter((s) => len[s] >= m(RG.short));
    for (let i = 0; i < l.length; i++)
      for (let j = i + 1; j < l.length; j++) {
        const a = l[i], b = l[j], oa = SA[a] === k ? SB[a] : SA[a], ob = SA[b] === k ? SB[b] : SA[b];
        const ux = P0[2 * oa] - P0[2 * k], uz = P0[2 * oa + 1] - P0[2 * k + 1], vx = P0[2 * ob] - P0[2 * k], vz = P0[2 * ob + 1] - P0[2 * k + 1];
        if ((ux * vx + uz * vz) / (len[a] * len[b]) > -Math.cos(RG.through * DEG)) continue;
        const ta = isNaN(target[a]) ? dirOf(a) : target[a], tb = isNaN(target[b]) ? dirOf(b) : target[b], d = dev(ta, tb, PI);
        if (d < 1e-6 || d > RG.through * DEG) continue;
        const ha = !isNaN(fit[a]), hb = !isNaN(fit[b]);
        if ((!framed[a] || !framed[b]) && Math.min(len[a], len[b]) >= m(RG.bend)) continue;
        const give = ha !== hb ? (ha ? a : b) : len[a] >= len[b] ? a : b, take = give === a ? b : a, t = give === a ? ta : tb;
        if (len[take] >= m(RG.bend) && dev(t, dirOf(take), PI) > tolOf(take)) continue;
        target[a] = target[b] = t;
        stats.through++;
      }
  }

  // ---- straight runs of the building rings ----
  const segOf = new Map();
  for (let s = 0; s < M; s++) segOf.set(Math.min(SA[s], SB[s]) * N + Math.max(SA[s], SB[s]), s);
  const runs = [];
  const addRun = (nodes, A, B) => {
    let t = Math.atan2(B[1] - A[1], B[0] - A[0]), bl = 0, bt = 0;
    for (let q = 0; q + 1 < nodes.length; q++) {
      const s = segOf.get(Math.min(nodes[q], nodes[q + 1]) * N + Math.max(nodes[q], nodes[q + 1]));
      if (s !== undefined && !isNaN(target[s]) && dev(t, target[s], PI) <= RG.runSnap * DEG && len[s] > bl) { bl = len[s]; bt = target[s]; }
    }
    if (bl) t = bt;
    // the line goes through the nodes on a polygon, if the run has any
    const pins = nodes.filter((k) => pin[k]);
    if (pins.length >= 2) {
      const a = pins[0], b = pins[pins.length - 1], dx = P0[2 * b] - P0[2 * a], dz = P0[2 * b + 1] - P0[2 * a + 1];
      if (Math.hypot(dx, dz) < m(1) || dev(Math.atan2(dz, dx), t, PI) > RG.runSnap * DEG) return;
      t = Math.atan2(dz, dx);
    }
    // a run that turns a wall of 1.5 m or more past its limit (see tolOf) is no run
    for (let q = 0; q + 1 < nodes.length; q++) {
      const s = segOf.get(Math.min(nodes[q], nodes[q + 1]) * N + Math.max(nodes[q], nodes[q + 1]));
      if (s !== undefined && len[s] >= m(RG.bend) && dev(t, dirOf(s), PI) > tolOf(s)) return;
    }
    const nx = -Math.sin(t), nz = Math.cos(t);
    const on = pins.length ? pins : nodes;
    const c = on.reduce((sum, k) => sum + nx * P0[2 * k] + nz * P0[2 * k + 1], 0) / on.length;
    runs.push({ nodes, nx, nz, c });
  };
  const bRings = new Map(); // building -> rings as node lists
  for (const [r, rings] of regionRings) {
    if (r < 0) continue;
    bRings.set(r, []);
    for (const parts of rings) {
      const ring = [];
      for (const { ch, rev } of parts) {
        const ids = rev ? [...ch.ids].reverse() : ch.ids;
        for (let q = 0; q < ids.length - 1; q++) if (ring[ring.length - 1] !== ids[q]) ring.push(ids[q]);
      }
      while (ring.length > 1 && ring[0] === ring[ring.length - 1]) ring.pop();
      bRings.get(r).push(ring);
      const n = ring.length;
      if (n < 4) continue;
      // start at the sharpest corner
      const at = (q) => ring[((q % n) + n) % n];
      let s0 = 0, bt = -1;
      for (let q = 0; q < n; q++) {
        const a = at(q - 1), b = at(q), c = at(q + 1);
        const ux = P0[2 * b] - P0[2 * a], uz = P0[2 * b + 1] - P0[2 * a + 1], vx = P0[2 * c] - P0[2 * b], vz = P0[2 * c + 1] - P0[2 * b + 1];
        const t = Math.abs(Math.atan2(ux * vz - uz * vx, ux * vx + uz * vz));
        if (t > bt) { bt = t; s0 = q; }
      }
      const order = [];
      for (let q = 0; q <= n; q++) order.push(at(s0 + q));
      const Q = order.map((k) => [P0[2 * k], P0[2 * k + 1]]);
      const keep = dpKeep(Q, m(RG.run));
      for (let a = 0, b = 1; b <= n; b++) {
        if (!keep[b]) continue;
        if (b - a >= 2 && Math.hypot(Q[b][0] - Q[a][0], Q[b][1] - Q[a][1]) >= m(RG.runMin)) addRun(order.slice(a, b + 1), Q[a], Q[b]);
        a = b;
      }
    }
  }
  stats.runs = runs.length;

  // ---- the solve ----
  // fixed: the nodes that stay; frozen: segments with no direction term; dead: runs left out
  const solve = (fixed, frozen, dead) => {
    const vi = new Int32Array(N).fill(-1);
    let nv = 0;
    for (let k = 0; k < N; k++) if (!fixed[k]) vi[k] = nv++;
    const ptr = [0], col = [], val = [], rhs = [];
    const term = (k, ax, az, r) => {
      if (vi[k] < 0) return r - ax * P0[2 * k] - az * P0[2 * k + 1];
      col.push(2 * vi[k], 2 * vi[k] + 1);
      val.push(ax, az);
      return r;
    };
    const end = (r) => { if (col.length > ptr[ptr.length - 1]) { rhs.push(r); ptr.push(col.length); } };
    for (let s = 0; s < M; s++) {
      if (frozen[s] || isNaN(target[s])) continue;
      const nx = -Math.sin(target[s]) * RG.wd, nz = Math.cos(target[s]) * RG.wd;
      end(term(SA[s], -nx, -nz, term(SB[s], nx, nz, 0)));
    }
    runs.forEach((u, i) => { if (!dead[i]) for (const k of u.nodes) end(term(k, RG.wb * u.nx, RG.wb * u.nz, RG.wb * u.c)); });
    for (const h of holds) end(h.terms.reduce((r, [k, ax, az]) => term(k, ax, az, r), h.rhs));
    // (I + A'A) x = p0 + A'r, by conjugate gradients with the diagonal as preconditioner
    const n2 = 2 * nv, R = rhs.length, C = Int32Array.from(col), V = Float64Array.from(val);
    const b = new Float64Array(n2), dg = new Float64Array(n2).fill(1), x = new Float64Array(n2);
    for (let k = 0; k < N; k++) if (vi[k] >= 0) { x[2 * vi[k]] = b[2 * vi[k]] = P0[2 * k]; x[2 * vi[k] + 1] = b[2 * vi[k] + 1] = P0[2 * k + 1]; }
    for (let r = 0; r < R; r++) for (let e = ptr[r]; e < ptr[r + 1]; e++) { b[C[e]] += V[e] * rhs[r]; dg[C[e]] += V[e] * V[e]; }
    const mul = (v, out) => {
      out.set(v);
      for (let r = 0; r < R; r++) {
        let d = 0;
        for (let e = ptr[r]; e < ptr[r + 1]; e++) d += V[e] * v[C[e]];
        for (let e = ptr[r]; e < ptr[r + 1]; e++) out[C[e]] += V[e] * d;
      }
    };
    const res = new Float64Array(n2), z = new Float64Array(n2), p = new Float64Array(n2), q = new Float64Array(n2);
    mul(x, q);
    let rz = 0, rr = 0, bb = 0;
    for (let i = 0; i < n2; i++) { res[i] = b[i] - q[i]; z[i] = res[i] / dg[i]; p[i] = z[i]; rz += res[i] * z[i]; rr += res[i] * res[i]; bb += b[i] * b[i]; }
    let it = 0;
    for (; it < 2000 && rr > 1e-22 * bb; it++) {
      mul(p, q);
      let pq = 0;
      for (let i = 0; i < n2; i++) pq += p[i] * q[i];
      const al = rz / pq;
      let rz1 = 0;
      rr = 0;
      for (let i = 0; i < n2; i++) {
        x[i] += al * p[i];
        res[i] -= al * q[i];
        z[i] = res[i] / dg[i];
        rz1 += res[i] * z[i];
        rr += res[i] * res[i];
      }
      const be = rz1 / rz;
      rz = rz1;
      for (let i = 0; i < n2; i++) p[i] = z[i] + be * p[i];
    }
    stats.iterations = (stats.iterations || 0) + it;
    const P = Float64Array.from(P0);
    for (let k = 0; k < N; k++) if (vi[k] >= 0) { P[2 * k] = x[2 * vi[k]]; P[2 * k + 1] = x[2 * vi[k] + 1]; }
    return P;
  };

  // ---- the guards ----
  // how far each node can move: less where 4 or more other nodes are within 1 m
  const maxMove = new Float64Array(N);
  const nodeGrid = makeGrid(m(RG.dense), N, (k) => [P0[2 * k], P0[2 * k + 1], P0[2 * k], P0[2 * k + 1]]);
  for (let k = 0; k < N; k++) {
    let n = 0;
    around(nodeGrid, m(RG.dense), P0[2 * k], P0[2 * k + 1], m(RG.dense), (j) => {
      if (j !== k && Math.hypot(P0[2 * j] - P0[2 * k], P0[2 * j + 1] - P0[2 * k + 1]) < m(RG.dense)) n++;
    });
    maxMove[k] = m(n >= RG.denseN ? RG.moveDense : RG.move);
  }
  // the pairs of segments that cross (a set of s * M + t)
  const crossings = (P) => {
    const G = m(4), out = new Set();
    const g = makeGrid(G, M, (s) => {
      const a = SA[s], b = SB[s];
      return [Math.min(P[2 * a], P[2 * b]), Math.min(P[2 * a + 1], P[2 * b + 1]), Math.max(P[2 * a], P[2 * b]), Math.max(P[2 * a + 1], P[2 * b + 1])];
    });
    const pt = (k) => [P[2 * k], P[2 * k + 1]];
    for (const l of g.values())
      for (let i = 0; i < l.length; i++)
        for (let j = i + 1; j < l.length; j++) {
          const s = Math.min(l[i], l[j]), t = Math.max(l[i], l[j]);
          if (SA[s] === SA[t] || SA[s] === SB[t] || SB[s] === SA[t] || SB[s] === SB[t]) continue;
          if (properCross(pt(SA[s]), pt(SB[s]), pt(SA[t]), pt(SB[t]))) out.add(s * M + t);
        }
    return out;
  };
  const cross0 = crossings(P0);
  // the distance from the point (px, pz) to segment s, the nearest point of s, and its place on s
  const near = (P, px, pz, s) => {
    const ax = P[2 * SA[s]], az = P[2 * SA[s] + 1], dx = P[2 * SB[s]] - ax, dz = P[2 * SB[s] + 1] - az, l2 = dx * dx + dz * dz;
    const t = l2 > 0 ? Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / l2)) : 0;
    return [Math.hypot(px - ax - t * dx, pz - az - t * dz), ax + t * dx, az + t * dz, t];
  };
  // lane widths: a point on a lane wall (a node, or a point every 0.5 m along a segment: a long
  // wall can turn with no node across from it) and a segment that face each other across a lane,
  // less than 1.5 m apart. A pair: [a, b, t, s, d], the point at t from node a to node b, the
  // segment s, the width d. (The side of the lane: +1 on the right of the segment, -1 on the left.)
  const laneSide = (s) => (SCH[s].right === LANE ? 1 : SCH[s].left === LANE ? -1 : 0);
  const onSide = (s, x, z) => {
    const ax = P0[2 * SA[s]], az = P0[2 * SA[s] + 1], dx = P0[2 * SB[s]] - ax, dz = P0[2 * SB[s] + 1] - az;
    return laneSide(s) * (dx * (z - az) - dz * (x - ax)) > 1e-9;
  };
  const laneSegs = [];
  for (let s = 0; s < M; s++) if (laneSide(s)) laneSegs.push(s);
  const GL = m(2), laneGrid = makeGrid(GL, laneSegs.length, (i) => {
    const a = SA[laneSegs[i]], b = SB[laneSegs[i]];
    return [Math.min(P0[2 * a], P0[2 * b]), Math.min(P0[2 * a + 1], P0[2 * b + 1]), Math.max(P0[2 * a], P0[2 * b]), Math.max(P0[2 * a + 1], P0[2 * b + 1])];
  });
  const pairs = [], laneNodes = new Set();
  const pairsAt = (a, b, t, own) => {
    const x = (1 - t) * P0[2 * a] + t * P0[2 * b], z = (1 - t) * P0[2 * a + 1] + t * P0[2 * b + 1], seen = new Set();
    around(laneGrid, GL, x, z, m(RG.laneNear), (i) => {
      const s = laneSegs[i];
      if (seen.has(s) || (a === b && (SA[s] === a || SB[s] === a))) return;
      seen.add(s);
      const [d, qx, qz, f] = near(P0, x, z, s);
      // a wall that meets this one at a node: only across a lane that narrows to a point (the
      // nearest point is inside the wall, not at the node)
      if ((SA[s] === a || SB[s] === a || SA[s] === b || SB[s] === b) && (f < 0.02 || f > 0.98)) return;
      if (d >= m(RG.laneNear) || d < 1e-6 || !onSide(s, x, z) || !own.some((u) => onSide(u, qx, qz))) return;
      pairs.push([a, b, t, s, d]);
    });
  };
  for (const s of laneSegs) laneNodes.add(SA[s]).add(SB[s]);
  for (const k of laneNodes) pairsAt(k, k, 0, adj[k].filter((s) => laneSide(s)));
  for (const s of laneSegs) {
    const n = Math.ceil(len[s] / m(RG.laneStep));
    for (let i = 1; i < n; i++) pairsAt(SA[s], SB[s], i / n, [s]);
  }
  stats.lanePairs = pairs.length;
  const width = (P, [a, b, t, s]) => near(P, (1 - t) * P[2 * a] + t * P[2 * b], (1 - t) * P[2 * a + 1] + t * P[2 * b + 1], s);
  // the area of each building: it changes by 10 % at most, and stays within the range of the
  // check of buildFootprints (cells: building -> its count of cells)
  const areaOf = (P, r) => {
    let a = 0;
    for (const ring of bRings.get(r))
      for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) a += P[2 * ring[j]] * P[2 * ring[i] + 1] - P[2 * ring[i]] * P[2 * ring[j] + 1];
    return a / 2;
  };
  const area0 = new Map([...bRings.keys()].map((r) => [r, areaOf(P0, r)]));
  // Returns the nodes of a failed guard (bad), and the lane pairs, party walls and buildings that
  // failed theirs.
  const guard = (P) => {
    const bad = new Set(), out = { bad, lane: [], party: [], area: [] };
    for (const [r, a0] of area0) {
      const a = areaOf(P, r), n = cells.get(r) || a0;
      if (Math.abs(a - a0) <= RG.area * Math.abs(a0) && (a >= n * 0.6 || a >= a0) && (a <= n * 1.4 || a <= a0)) continue;
      out.area.push(r);
    }
    for (let k = 0; k < N; k++) if (Math.hypot(P[2 * k] - P0[2 * k], P[2 * k + 1] - P0[2 * k + 1]) > maxMove[k]) bad.add(k);
    for (let s = 0; s < M; s++) {
      const a = SA[s], b = SB[s], dx = P[2 * b] - P[2 * a], dz = P[2 * b + 1] - P[2 * a + 1];
      if (dx * (P0[2 * b] - P0[2 * a]) + dz * (P0[2 * b + 1] - P0[2 * a + 1]) <= 0.05 * len[s] * len[s]) bad.add(a).add(b);
      if (SCH[s].left >= 0 && SCH[s].right >= 0 && len[s] >= m(RG.party) && Math.hypot(dx, dz) < m(RG.party)) out.party.push(s);
    }
    for (const st of crossings(P)) {
      if (cross0.has(st)) continue;
      const s = Math.floor(st / M), t = st % M;
      bad.add(SA[s]).add(SB[s]).add(SA[t]).add(SB[t]);
    }
    pairs.forEach((u, i) => { if (width(P, u)[0] < Math.min(u[4], m(RG.lane)) - m(0.02)) out.lane.push(i); });
    return out;
  };
  // Holds: where a lane, a party wall or a building fails its guard the first time, a linear term
  // keeps its width, length or area (weight 10), and the solve runs again. The second time, the
  // terms near it go, as for the other guards.
  const holds = [];
  const holdLane = (i) => {
    const [a, b, t, s, d] = pairs[i], [, qx, qz, u] = width(P0, pairs[i]), c = SA[s], e = SB[s];
    const px = (1 - t) * P0[2 * a] + t * P0[2 * b], pz = (1 - t) * P0[2 * a + 1] + t * P0[2 * b + 1];
    const w = RG.hold, nx = ((px - qx) / d) * w, nz = ((pz - qz) / d) * w;
    const terms = [[c, -(1 - u) * nx, -(1 - u) * nz], [e, -u * nx, -u * nz]];
    if (a === b) terms.push([a, nx, nz]);
    else terms.push([a, (1 - t) * nx, (1 - t) * nz], [b, t * nx, t * nz]);
    holds.push({ terms, rhs: w * Math.min(d, m(RG.lane + 0.03)) });
  };
  const holdParty = (s) => {
    const a = SA[s], b = SB[s], w = RG.hold / len[s];
    const ux = (P0[2 * b] - P0[2 * a]) * w, uz = (P0[2 * b + 1] - P0[2 * a + 1]) * w;
    holds.push({ terms: [[b, ux, uz], [a, -ux, -uz]], rhs: RG.hold * Math.min(len[s], m(RG.party + 0.05)) });
  };
  const holdArea = (r) => {
    // the area to first order: its gradient at each node
    const g = new Map();
    for (const ring of bRings.get(r))
      ring.forEach((k, i) => {
        const pv = ring[(i + ring.length - 1) % ring.length], nx = ring[(i + 1) % ring.length], v = g.get(k) || [0, 0];
        g.set(k, [v[0] + (P0[2 * nx + 1] - P0[2 * pv + 1]) / 2, v[1] + (P0[2 * pv] - P0[2 * nx]) / 2]);
      });
    let n2 = 0, c = 0;
    for (const [k, [gx, gz]] of g) { n2 += gx * gx + gz * gz; c += gx * P0[2 * k] + gz * P0[2 * k + 1]; }
    const w = RG.hold / Math.sqrt(n2 || 1);
    holds.push({ terms: [...g].map(([k, [gx, gz]]) => [k, gx * w, gz * w]), rhs: c * w });
  };

  // ---- solve, check, hold or free the terms near a failed guard, solve again ----
  const fixed = Uint8Array.from(pin), frozen = new Uint8Array(M), dead = new Uint8Array(runs.length), strikes = new Uint8Array(N);
  const held = new Set();
  let P = null;
  stats.passes = 0;
  for (let pass = 0; pass < RG.passes && !P; pass++) {
    stats.passes++;
    const T = solve(fixed, frozen, dead), g = guard(T), bad = g.bad;
    if (!bad.size && !g.lane.length && !g.party.length && !g.area.length) { P = T; break; }
    for (const i of g.lane) {
      if (held.has(`l${i}`)) bad.add(pairs[i][0]).add(pairs[i][1]).add(SA[pairs[i][3]]).add(SB[pairs[i][3]]);
      else { held.add(`l${i}`); holdLane(i); }
    }
    for (const s of g.party) {
      if (held.has(`p${s}`)) bad.add(SA[s]).add(SB[s]);
      else { held.add(`p${s}`); holdParty(s); }
    }
    for (const r of g.area) {
      if (!held.has(`a${r}`)) { held.add(`a${r}`); holdArea(r); continue; }
      for (const ring of bRings.get(r)) for (const k of ring) if (Math.hypot(T[2 * k] - P0[2 * k], T[2 * k + 1] - P0[2 * k + 1]) > m(0.05)) bad.add(k);
    }
    for (const k of bad) {
      if (strikes[k]++) { fixed[k] = 1; for (const s of adj[k]) fixed[SA[s]] = fixed[SB[s]] = 1; }
      for (const s of adj[k]) for (const j of [SA[s], SB[s]]) for (const s2 of adj[j]) frozen[s2] = 1;
    }
    runs.forEach((u, i) => { if (!dead[i] && u.nodes.some((k) => bad.has(k))) dead[i] = 1; });
  }
  stats.holds = holds.length;
  stats.ok = !!P;
  stats.frozen = frozen.reduce((a, v) => a + v, 0);
  stats.dead = dead.reduce((a, v) => a + v, 0);
  stats.dense = maxMove.reduce((a, v) => a + (v < m(RG.move) ? 1 : 0), 0);
  if (!P) P = P0; // the guards still fail: nothing moves
  let moved = 0, most = 0;
  for (let k = 0; k < N; k++) {
    const d = Math.hypot(P[2 * k] - P0[2 * k], P[2 * k + 1] - P0[2 * k + 1]) * SC;
    if (d > 0.01) moved++;
    most = Math.max(most, d);
  }
  Object.assign(stats, { moved, most, fixed: fixed.reduce((s, v) => s + v, 0) - pin.reduce((s, v) => s + v, 0) });

  // ---- the new chains, without the nodes that no longer turn ----
  let dropped = 0;
  for (const ch of CH) {
    const ids = ch.ids.slice();
    for (let q = 1; q < ids.length - 1; ) {
      const k = ids[q], a = ids[q - 1], c = ids[q + 1];
      if (adj[k].length === 2 && ids.length > (ch.closed ? 4 : 2)) {
        const ux = P[2 * k] - P[2 * a], uz = P[2 * k + 1] - P[2 * a + 1], vx = P[2 * c] - P[2 * k], vz = P[2 * c + 1] - P[2 * k + 1];
        const turn = Math.abs(Math.atan2(ux * vz - uz * vx, ux * vx + uz * vz));
        if (turn < RG.turn * DEG || (!pin[k] && Math.min(Math.hypot(ux, uz), Math.hypot(vx, vz)) < m(RG.close))) {
          ids.splice(q, 1);
          dropped++;
          continue;
        }
      }
      q++;
    }
    ch.s = ids.map((k) => [P[2 * k], P[2 * k + 1]]);
  }
  stats.dropped = dropped;
  return stats;
}
