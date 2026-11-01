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
