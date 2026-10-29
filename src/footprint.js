// Building footprints as polygons, from the 1 m plot grid.
//
// The traced plan is a grid of 1 m cells, thus a plot line that runs at an angle shows as a
// staircase. Here each boundary between two neighbours (two plots, or a plot and a lane) is
// traced once, as a chain of cell corners between two junctions, and simplified once with
// Douglas-Peucker. Both neighbours use the same simplified chain, so the polygons still
// meet with no gap and no overlap. The grid stays the model of record for walking, picking
// and placing people; the polygons are only for drawing.

// Region labels: a plot is its building id (0 or more); the rest are negative.
export const LANE = -1, YARD = -2, ROAD = -3, OUTSIDE = -4;

export function buildFootprints(L, opts = {}) {
  const EPS = opts.eps ?? 1.0;
  const { W, D, owner, inside, alley } = L;
  const label = new Int32Array(W * D);
  for (let k = 0; k < W * D; k++) {
    if (owner[k] >= 0) label[k] = owner[k];
    else if (!inside[k]) label[k] = OUTSIDE;
    else label[k] = alley[k] === 2 ? YARD : alley[k] === 3 ? ROAD : LANE;
  }
  // A closed pocket of lane of 4 cells or fewer is a gap in the trace, not a lane: draw it
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
    if (comp.length > 4 || [...touch.keys()].some((v) => v < 0)) continue;
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

  const simplifyAll = () => {
    for (const ch of chains.values()) {
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
  const assemble = (r) =>
    regionRings.get(r).map((parts) => {
      const pts = [];
      for (const { ch, rev } of parts) {
        const s = rev ? [...ch.s].reverse() : ch.s;
        for (let q = 0; q < s.length - 1; q++) pts.push(s[q]);
      }
      return { pts, parts };
    });

  // Check and repair: a chain that makes a region's ring self-cross, or cross another
  // chain, is simplified again with a smaller tolerance (in the end, not at all).
  for (let pass = 0; pass < 4; pass++) {
    simplifyAll();
    const bad = new Set();
    const segs = [];
    for (const ch of chains.values()) for (let q = 0; q < ch.s.length - 1; q++) segs.push([ch, ch.s[q], ch.s[q + 1]]);
    const grid = new Map(), G = 4;
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
    if (!bad.size) break;
    for (const ch of bad) ch.eps = pass >= 2 ? 0 : ch.eps * 0.5;
  }

  // Output in world metres.
  const X = (p) => [L.x0 + p[0], L.z0 + p[1]];
  const out = new Map();
  for (const r of regions.keys()) {
    const rings = assemble(r).map(({ pts, parts }) => {
      const P = pts.map(X);
      // Each edge of the ring with the region across it.
      const edges = [];
      let q = 0;
      for (const { ch, rev } of parts) {
        const s = rev ? [...ch.s].reverse() : ch.s;
        const other = rev ? ch.right : ch.left;
        for (let t = 0; t < s.length - 1; t++, q++) edges.push({ a: P[q], b: P[(q + 1) % P.length], other });
      }
      return { pts: P, edges, hole: signedArea(pts) < 0 };
    });
    out.set(r, rings);
  }
  return out;
}

// Douglas-Peucker on an open polyline; the ends stay.
function dp(P, eps) {
  if (P.length <= 2 || eps <= 0) return P.slice();
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
  return P.filter((_, q) => keep[q]);
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
