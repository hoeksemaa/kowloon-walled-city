// The real surroundings of December 1986 (data/context.json): which outlines are drawn, and
// the street round the City. env.js draws them; tools/check_context.mjs checks them. No three.js
// here, so that the check runs in node.

// The 9 road segments with no measured width (each 280 m or more from the centre of the plan
// box) are drawn this wide.
export const ROAD_WIDTH = 7; // INFERRED

// The buildings to draw. The data has a building that the City plate partly covers as its parts
// off the plate; plateClipped holds its whole outline, and that is what is drawn. Thus Mei Tung
// House stands whole.
export function drawnBuildings(C) {
  const parts = new Set(C.plateClipped.flatMap((c) => c.parts));
  const out = C.buildings.filter((b) => !parts.has(b.id));
  for (const c of C.plateClipped) {
    const b = C.buildings.find((q) => q.id === c.parts[0]);
    out.push({ ...b, id: c.id, ring: c.ring, clipped: undefined });
  }
  return out;
}

// The solids that env.js draws, in the order of drawnBuildings: for each building its outline
// (ring) and its height h. The outline is clockwise in (x, z), with no two points closer than
// 5 cm. null for an outline of fewer than 3 points, which is not drawn. occlude.js tests the
// same solids.
export function buildingPrisms(C) {
  return drawnBuildings(C).map((b) => {
    let ring = b.ring.filter((p, i, r) => Math.hypot(p[0] - r[(i + 1) % r.length][0], p[1] - r[(i + 1) % r.length][1]) > 0.05);
    if (ring.length < 3) return null;
    if (ring.reduce((s, p, i) => { const q = ring[(i + 1) % ring.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) > 0) ring = ring.slice().reverse();
    return { ring, h: b.height };
  });
}

// ---- the names of the roads (labels.js) ----
// A run is the segments of one road name, joined end to end. A run gets the name of its road
// in the label layer if it is NAME_MIN metres long or more and comes within NAME_R metres of the
// centre of the plan box. Thus the roads round the City and the main roads near it get their
// names. NAME_R is a little past the start of the haze (350 m, env.js): Prince Edward Road East
// and Nga Tsin Wai Road are in it. The data has the names of the Transport Department, thus of
// today. The 1987 sheets print the same English names (tools/context.py has no list of old
// names); Prince Edward Road East has its name from 1979 or before.
export const NAME_R = 430, NAME_MIN = 100;
export const NAME_STEP = 2; // metres between the points of a run
const JOIN = 2; // the ends of two segments of a run are this close
const TURN = -0.5; // two segments join only if the road turns less than 120° there (cosine),
const REACH = 15; // over this many metres each way
const TWIN = 30; // a run beside a longer run of the same name (the other carriageway): metres
const CROSS = 2; // a point of a run is at a junction if it is this close to the kerb of another road

// The runs to name, nearest the City first. outline: the City outline (site.polygon). Each run:
// its name, its Chinese name, its points every NAME_STEP metres (x, z), the direction of the road
// at each point (tx, tz) and its half width (hw), cross (1 at a junction with another road), home
// (the point nearest the City) and near (the distance of home from the City).
export function roadRuns(C, outline) {
  const byName = new Map();
  for (const r of C.roads) {
    if (!r.name) continue;
    if (!byName.has(r.name)) byName.set(r.name, []);
    byName.get(r.name).push(r);
  }
  const dist2 = (px, pz, [ax, az], [bx, bz]) => {
    const ex = bx - ax, ez = bz - az, l2 = ex * ex + ez * ez || 1;
    const t = Math.max(0, Math.min(1, ((px - ax) * ex + (pz - az) * ez) / l2));
    return (px - ax - t * ex) ** 2 + (pz - az - t * ez) ** 2;
  };
  const toCity = (x, z) => {
    let d = Infinity;
    for (let i = 0; i < outline.length; i++) d = Math.min(d, dist2(x, z, outline[i], outline[(i + 1) % outline.length]));
    return Math.sqrt(d);
  };
  // the box of each road and its kerb, for the junctions
  const boxes = C.roads.map((r) => {
    const h = (r.width || ROAD_WIDTH) / 2 + CROSS;
    const xs = r.line.map((p) => p[0]), zs = r.line.map((p) => p[1]);
    return [Math.min(...xs) - h, Math.min(...zs) - h, Math.max(...xs) + h, Math.max(...zs) + h, h];
  });
  const out = [];
  for (const [name, segs] of byName) {
    // join the segments: each point keeps the half width of its segment
    const lines = segs.map((r) => r.line.map(([x, z]) => [x, z, (r.width || ROAD_WIDTH) / 2]));
    // Two carriageways meet where they part, at times by a short link: there the road turns
    // back, and the two do not join.
    const close = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < JOIN;
    // the point REACH metres along a line from its first point
    const along = (line) => {
      let left = REACH;
      for (let q = 0; q + 1 < line.length; q++) {
        const l = Math.hypot(line[q + 1][0] - line[q][0], line[q + 1][1] - line[q][1]);
        if (l >= left) return [line[q][0] + ((line[q + 1][0] - line[q][0]) * left) / l, line[q][1] + ((line[q + 1][1] - line[q][1]) * left) / l];
        left -= l;
      }
      return line[line.length - 1];
    };
    // does the line u, then the line v from the end of u, go on without a turn back?
    const goesOn = (u, v) => {
      const p = along(u.slice().reverse()), q = u[u.length - 1], r = along(v);
      const ux = q[0] - p[0], uz = q[1] - p[1], vx = r[0] - q[0], vz = r[1] - q[1];
      return ux * vx + uz * vz >= TURN * (Math.hypot(ux, uz) * Math.hypot(vx, vz));
    };
    const runs = [];
    while (lines.length) {
      let cur = lines.shift();
      for (let grew = true; grew;) {
        grew = false;
        for (let i = 0; i < lines.length; i++) {
          const l = lines[i], r = l.slice().reverse(), a = cur[0], b = cur[cur.length - 1];
          if (close(b, l[0]) && goesOn(cur, l)) cur = cur.concat(l.slice(1));
          else if (close(b, r[0]) && goesOn(cur, r)) cur = cur.concat(r.slice(1));
          else if (close(a, l[l.length - 1]) && goesOn(l, cur)) cur = l.slice(0, -1).concat(cur);
          else if (close(a, r[r.length - 1]) && goesOn(r, cur)) cur = r.slice(0, -1).concat(cur);
          else continue;
          lines.splice(i, 1);
          grew = true;
          break;
        }
      }
      runs.push(cur);
    }
    // points every NAME_STEP metres along each run
    const kept = [];
    for (const line of runs) {
      const pts = [];
      let left = 0;
      for (let q = 0; q + 1 < line.length; q++) {
        const [ax, az, h] = line[q], [bx, bz] = line[q + 1], l = Math.hypot(bx - ax, bz - az);
        for (; left <= l; left += NAME_STEP) pts.push([ax + ((bx - ax) * left) / l, az + ((bz - az) * left) / l, h]);
        left -= l;
      }
      if ((pts.length - 1) * NAME_STEP < NAME_MIN || !pts.some(([x, z]) => Math.hypot(x, z) <= NAME_R)) continue;
      kept.push(pts);
    }
    kept.sort((a, b) => b.length - a.length);
    const named = [];
    for (const pts of kept) {
      // the other carriageway of a run already named
      const twin = pts.filter(([x, z]) => named.some((o) => o.some(([u, v]) => (u - x) ** 2 + (v - z) ** 2 < TWIN * TWIN))).length;
      if (twin > pts.length * 0.6) continue;
      named.push(pts);
    }
    for (const pts of named) {
      const n = pts.length, run = { name, nameZh: segs[0].nameZh || '', n, x: new Float32Array(n), z: new Float32Array(n), tx: new Float32Array(n), tz: new Float32Array(n), hw: new Float32Array(n), cross: new Uint8Array(n), home: 0, near: Infinity };
      pts.forEach(([x, z, h], i) => { run.x[i] = x; run.z[i] = z; run.hw[i] = h; });
      for (let i = 0; i < n; i++) {
        // the direction over 6 m each way
        const a = Math.max(0, i - 3), b = Math.min(n - 1, i + 3), l = Math.hypot(run.x[b] - run.x[a], run.z[b] - run.z[a]) || 1;
        run.tx[i] = (run.x[b] - run.x[a]) / l;
        run.tz[i] = (run.z[b] - run.z[a]) / l;
        const x = run.x[i], z = run.z[i];
        C.roads.forEach((r, k) => {
          const [x0, z0, x1, z1, h] = boxes[k];
          if (run.cross[i] || r.name === name || x < x0 || x > x1 || z < z0 || z > z1) return;
          for (let q = 0; q + 1 < r.line.length; q++) if (dist2(x, z, r.line[q], r.line[q + 1]) < h * h) { run.cross[i] = 1; return; }
        });
        const d = toCity(x, z);
        if (d < run.near) { run.near = d; run.home = i; }
      }
      out.push(run);
    }
  }
  return out.sort((a, b) => a.near - b.near);
}

export function inRing(x, z, r) {
  let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, zi] = r[i], [xj, zj] = r[j];
    if ((zi > z) !== (zj > z) && x < xi + ((z - zi) * (xj - xi)) / (zj - zi)) c = !c;
  }
  return c;
}

// The street: the dark ground under the City. It is the part of the plate (the plan box and its
// MARGIN, layout.js) that the City reaches without crossing a road of 1986. Thus it ends at the
// kerbs of Tung Tau Tsuen Road and Tung Tsing Road, and at the plate edge on the open ground to
// the south and west. It runs GROW metres under the roads, which are drawn over it.
// A grid of RES cells a metre over the plate: road (1 = a road surface) and street (1 = street).
const RES = 2, GROW = 1.5;
export function buildStreet(L, roads) {
  const nx = L.W * RES, nz = L.D * RES, N = nx * nz;
  const road = new Uint8Array(N), street = new Uint8Array(N);
  const cx = (i) => L.x0 + (i + 0.5) / RES, cz = (j) => L.z0 + (j + 0.5) / RES;
  for (const r of roads) {
    const h = (r.width || ROAD_WIDTH) / 2;
    for (let q = 0; q + 1 < r.line.length; q++) {
      const [ax, az] = r.line[q], [bx, bz] = r.line[q + 1];
      const ex = bx - ax, ez = bz - az, l2 = ex * ex + ez * ez || 1;
      const i0 = Math.max(0, Math.floor((Math.min(ax, bx) - h - L.x0) * RES)), i1 = Math.min(nx - 1, Math.ceil((Math.max(ax, bx) + h - L.x0) * RES));
      const j0 = Math.max(0, Math.floor((Math.min(az, bz) - h - L.z0) * RES)), j1 = Math.min(nz - 1, Math.ceil((Math.max(az, bz) + h - L.z0) * RES));
      for (let j = j0; j <= j1; j++)
        for (let i = i0; i <= i1; i++) {
          const px = cx(i) - ax, pz = cz(j) - az;
          const t = Math.max(0, Math.min(1, (px * ex + pz * ez) / l2));
          if (Math.hypot(px - t * ex, pz - t * ez) <= h) road[j * nx + i] = 1;
        }
    }
  }
  // Fill from the cell of the City nearest the centre of the plan box.
  let seed = -1, best = Infinity;
  for (let k = 0; k < L.N; k++) {
    if (!L.inside[k]) continue;
    const d = Math.hypot(L.cellX(k), L.cellZ(k));
    if (d < best) { best = d; seed = k; }
  }
  const s = (Math.floor(L.cellZ(seed) - L.z0) * RES) * nx + Math.floor(L.cellX(seed) - L.x0) * RES;
  const queue = [s];
  street[s] = 1;
  for (let q = 0; q < queue.length; q++) {
    const k = queue[q], i = k % nx, j = (k / nx) | 0;
    for (const n of [i > 0 && k - 1, i < nx - 1 && k + 1, j > 0 && k - nx, j < nz - 1 && k + nx]) {
      if (n === false || street[n] || road[n]) continue;
      street[n] = 1;
      queue.push(n);
    }
  }
  // Under the roads by GROW metres.
  for (let g = 0; g < GROW * RES; g++) {
    const add = [];
    for (let k = 0; k < N; k++) {
      if (street[k] || !road[k]) continue;
      const i = k % nx, j = (k / nx) | 0;
      if ((i > 0 && street[k - 1]) || (i < nx - 1 && street[k + 1]) || (j > 0 && street[k - nx]) || (j < nz - 1 && street[k + nx])) add.push(k);
    }
    for (const k of add) street[k] = 1;
  }
  const cell = (x, z) => {
    const i = Math.floor((x - L.x0) * RES), j = Math.floor((z - L.z0) * RES);
    return i < 0 || j < 0 || i >= nx || j >= nz ? -1 : j * nx + i;
  };
  return {
    RES, nx, nz, x0: L.x0, z0: L.z0, road, street,
    // Is (x, z) on the street, or on a road surface (on the plate)?
    onStreet: (x, z) => { const k = cell(x, z); return k >= 0 && street[k] === 1; },
    onRoad: (x, z) => { const k = cell(x, z); return k >= 0 && road[k] === 1; },
    // Is the square of half size h round (x, z) all street, and off the roads?
    fits(x, z, h) {
      for (let v = -h; v <= h; v += 0.5 / RES)
        for (let u = -h; u <= h; u += 0.5 / RES) {
          const k = cell(x + u, z + v);
          if (k < 0 || !street[k] || road[k]) return false;
        }
      return true;
    },
  };
}
