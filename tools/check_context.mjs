// Checks data/context.json, the buildings and roads round the City in December 1986.
//
//     node tools/check_context.mjs
//
// Prints counts, and the buildings nearest under the approach track of the planes
// (src/approach.js). Fails (exit 1) if a building is on the City plate (the plan box with
// the MARGIN of src/layout.js), a building reaches beyond 600 m, a building has no source or no
// height, or a survey sheet does not register on the standing buildings (90% of the control
// residuals under 1 m, and a median shift under 0.75 m), or the City fit is poor. It also
// fails if the whole outline of a building that the plate cuts (plateClipped) reaches onto
// the City itself.
//
// The planes: it fails if the track comes closer than CLEAR metres above the roof of a
// building within SIDE metres of it (both in approach.js), or above the City and its roof
// aerials. It also fails if the runway end or the hill of approach.js does not come from their
// HK1980 Grid points through the transform of data/context.json.
//
// Then it checks what the app draws (src/context.js, src/env.js, src/layout.js). It fails if a
// drawn outline covers a cell of the City, if the dark street round the City reaches under a
// drawn building, if an exit of the people is not on the street or on a road, or if a walk on
// the grid between an exit and the City goes through a drawn building.
//
// Last it checks the ghosts (src/occlude.js) in 48 views. It fails if a building hides a point
// of the City wall and the test does not fade it.
import { readFileSync } from 'node:fs';
import { MARGIN, STOREY, buildLayout } from '../src/layout.js';
import { Sim } from '../src/people.js';
import { drawnBuildings, buildStreet, buildingPrisms } from '../src/context.js';
import { buildSite } from '../src/site.js';
import { Occlusion } from '../src/occlude.js';
import { track, S0, S1, CLEAR, SIDE, GRID, RUNWAY_END, HILL } from '../src/approach.js';

const root = new URL('..', import.meta.url).pathname;
const json = (p) => JSON.parse(readFileSync(root + p, 'utf8'));
const C = json('data/context.json');
const plan = json('data/plan.json');
const problems = [];
const RADIUS = 600;

const area = (r) => r.reduce((s, p, i) => { const q = r[(i + 1) % r.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;
// The part of a ring where a x + b z + c >= 0.
function half(r, a, b, c) {
  const out = [];
  for (let i = 0; i < r.length; i++) {
    const P = r[i], Q = r[(i + 1) % r.length];
    const fp = a * P[0] + b * P[1] + c, fq = a * Q[0] + b * Q[1] + c;
    if (fp >= 0) out.push(P);
    if ((fp >= 0) !== (fq >= 0)) {
      const t = fp / (fp - fq);
      out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]);
    }
  }
  return out;
}

// ---- the City plate ----
const x1 = plan.W / 2 + MARGIN, z1 = plan.D / 2 + MARGIN;
const P = C.plate;
if (Math.abs(P.x0 + x1) > 0.01 || Math.abs(P.x1 - x1) > 0.01 || Math.abs(P.z0 + z1) > 0.01 || Math.abs(P.z1 - z1) > 0.01) {
  problems.push(`the plate in the header (${P.x0}, ${P.z0}, ${P.x1}, ${P.z1}) is not the plan box with MARGIN ${MARGIN}`);
}
function onPlate(r) {
  let q = r;
  for (const h of [[1, 0, x1], [-1, 0, x1], [0, 1, z1], [0, -1, z1]]) {
    q = half(q, ...h);
    if (q.length < 3) return 0;
  }
  return Math.abs(area(q));
}

// ---- buildings ----
const kinds = {}, conf = {};
let in400 = 0;
for (const b of C.buildings) {
  const id = b.id + (b.name ? ` (${b.name})` : '');
  kinds[b.kind] = (kinds[b.kind] || 0) + 1;
  conf[b.confidence] = (conf[b.confidence] || 0) + 1;
  if (b.ring.length < 3 || Math.abs(area(b.ring)) < 1) problems.push(`${id}: no outline`);
  const o = onPlate(b.ring);
  if (o > 0.01) problems.push(`${id}: ${o.toFixed(1)} m2 on the City plate`);
  const far = Math.max(...b.ring.map(([x, z]) => Math.hypot(x, z)));
  if (far > RADIUS) problems.push(`${id}: reaches ${far.toFixed(1)} m from the centre`);
  if (far <= 400) in400++;
  if (!b.source || !b.source.trim()) problems.push(`${id}: no source`);
  if (!(b.height > 0)) problems.push(`${id}: no height`);
  if (b.base !== 0) problems.push(`${id}: base is not 0`);
  if (!['sourced', 'inferred'].includes(b.confidence)) problems.push(`${id}: confidence "${b.confidence}"`);
}
console.log(`buildings ${C.buildings.length}: ${in400} within 400 m, ${C.buildings.length} within 600 m`);
console.log('by kind', kinds, 'height', conf);
console.log(`named ${C.buildings.filter((b) => b.name).length}; parts of buildings that the plate cuts ${C.buildings.filter((b) => b.clipped).length}`);

// ---- the buildings that the plate cuts: the whole outline must stay off the City itself ----
const city = plan.outline.map(([x, z]) => [x - plan.W / 2, z - plan.D / 2]);
function inRing(x, z, r) {
  let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, zi] = r[i], [xj, zj] = r[j];
    if ((zi > z) !== (zj > z) && x < xi + ((z - zi) * (xj - xi)) / (zj - zi)) c = !c;
  }
  return c;
}
const ids = new Set(C.buildings.map((b) => b.id));
for (const c of C.plateClipped) {
  for (const p of c.parts) if (!ids.has(p)) problems.push(`plateClipped ${c.id}: no building ${p}`);
  const xs = c.ring.map((p) => p[0]), zs = c.ring.map((p) => p[1]);
  let n = 0; // samples 0.5 m apart that are in the outline and in the City
  for (let x = Math.min(...xs); x < Math.max(...xs); x += 0.5) {
    for (let z = Math.min(...zs); z < Math.max(...zs); z += 0.5) if (inRing(x, z, c.ring) && inRing(x, z, city)) n++;
  }
  if (n * 0.25 > 1) problems.push(`plateClipped ${c.id}: ${(n * 0.25).toFixed(1)} m2 on the City`);
  console.log(`the plate covers ${Math.round(c.onPlate * 100)}% of ${c.name || c.id}; ${c.parts.length} parts off it; ${(n * 0.25).toFixed(1)} m2 on the City`);
}

// ---- registration ----
for (const [sheet, s] of Object.entries(C.registration)) {
  if (s.controls < 4) continue;
  const shift = Math.hypot(s.dE, s.dN);
  if (s.p90 > 1.0 || shift > 0.75) problems.push(`sheet ${sheet}: shift ${shift.toFixed(2)} m, 90% residual ${s.p90} m`);
}
const regs = Object.values(C.registration);
console.log(`registration: ${regs.length} sheets, ${regs.reduce((s, r) => s + r.controls, 0)} control buildings, worst 90% residual ${Math.max(...regs.map((r) => r.p90)).toFixed(2)} m`);
const fit = C.transform.cityFit;
if (!(fit.outlineMedian <= 2)) problems.push(`City fit: median distance of the outline ${fit.outlineMedian} m`);
console.log(`City fit: turn ${(fit.th * 180 / Math.PI).toFixed(2)} deg, move (${fit.dx}, ${fit.dz}) m, IoU ${fit.iou}, outline median ${fit.outlineMedian} m`);

// ---- roads and open ground ----
const names = new Set(C.roads.map((r) => r.name).filter(Boolean));
for (const r of C.roads) {
  if (r.line.length < 2) problems.push(`${r.id}: no line`);
  if (r.line.some(([x, z]) => Math.hypot(x, z) > RADIUS + 0.01)) problems.push(`${r.id}: beyond 600 m`);
}
console.log(`roads ${C.roads.length} segments, ${names.size} names, ${C.roads.filter((r) => r.width).length} with a measured width`);
console.log(`open ground: ${C.openGround.map((g) => g.name).join('; ')}`);

// ---- the approach track of the planes (src/approach.js) ----
// The runway end and the hill in approach.js: their HK1980 Grid points through the transform.
const T = C.transform;
function toPlan([E, N]) {
  const b = (T.bearingDeg * Math.PI) / 180, dE = E - T.E0, dN = N - T.N0;
  const x0 = Math.sin(b) * dE + Math.cos(b) * dN, z0 = Math.cos(b) * dE - Math.sin(b) * dN;
  return [Math.cos(T.th) * (x0 - T.dx) + Math.sin(T.th) * (z0 - T.dz), -Math.sin(T.th) * (x0 - T.dx) + Math.cos(T.th) * (z0 - T.dz)];
}
for (const [name, p, g] of [['RUNWAY_END', RUNWAY_END, GRID.runwayEnd], ['HILL', HILL, GRID.hill]]) {
  const q = toPlan(g);
  if (Math.hypot(p[0] - q[0], p[1] - q[1]) > 0.5) problems.push(`approach.js: ${name} (${p}) is not E ${g[0]}, N ${g[1]} in the plan (${q.map((v) => v.toFixed(1))})`);
}
// The track every 2 m. For an outline: the least height of the track over the roof, at the
// points of the track within SIDE m of the outline; null if none is that near.
const pts = [];
for (let s = S0; s <= S1; s += 2) pts.push({ s, ...track(s) });
function segDist(x, z, [ax, az], [bx, bz]) {
  const dx = bx - ax, dz = bz - az;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(x - ax - t * dx, z - az - t * dz);
}
function underTrack(ring, height) {
  const xs = ring.map((p) => p[0]), zs = ring.map((p) => p[1]);
  const x0 = Math.min(...xs) - SIDE, x1 = Math.max(...xs) + SIDE, z0 = Math.min(...zs) - SIDE, z1 = Math.max(...zs) + SIDE;
  let best = null;
  for (const t of pts) {
    if (t.x < x0 || t.x > x1 || t.z < z0 || t.z > z1) continue;
    let d = inRing(t.x, t.z, ring) ? 0 : Infinity;
    for (let i = 0; d && i < ring.length; i++) d = Math.min(d, segDist(t.x, t.z, ring[i], ring[(i + 1) % ring.length]));
    if (d <= SIDE && (!best || t.y - height < best.gap)) best = { gap: t.y - height, side: d, s: t.s, y: t.y };
  }
  return best;
}
const under = [];
for (const b of C.buildings) {
  const u = underTrack(b.ring, b.height);
  if (u) under.push({ b, ...u });
}
under.sort((a, c) => a.gap - c.gap);
for (const { b, gap, side, y } of under)
  if (gap < CLEAR) problems.push(`${b.id} ${b.name || ''}: ${b.height} m high, ${gap.toFixed(1)} m under the track (${y.toFixed(1)} m) ${side.toFixed(0)} m to the side; the least is ${CLEAR} m`);
const t0 = track(0);
console.log(`approach track: s ${S0} to ${S1}; nearest the City at ${Math.hypot(t0.x, t0.z).toFixed(0)} m from its centre, ${t0.y.toFixed(1)} m high; ${under.length} buildings within ${SIDE} m of it`);
console.log(`the least clearance under the track (at least ${CLEAR} m):`);
for (const { b, gap, side, y } of under.slice(0, 5)) {
  console.log(`  ${b.id} ${b.name || ''} height ${b.height} m (${b.confidence}), track ${y.toFixed(1)} m, ${gap.toFixed(1)} m clear, ${side.toFixed(0)} m to the side`);
}

// ---- what the app draws ----
const book = json('data/book.json');
book.overlay = json('data/book_overlay.json');
const L = buildLayout(null, plan, json('data/businesses.json'), book, C);
// The City under the track: its outline, and its highest roof with 10 m of stair huts, tanks
// and aerials (INFERRED).
const cityTop = Math.max(...L.buildings.map((b) => b.floors || 0)) * STOREY + 10;
const cu = underTrack(city, cityTop);
if (cu && cu.gap < CLEAR) problems.push(`the City: ${cityTop.toFixed(1)} m high, ${cu.gap.toFixed(1)} m under the track; the least is ${CLEAR} m`);
console.log(`the City, ${cityTop.toFixed(1)} m high with its aerials: ${cu ? `${cu.gap.toFixed(1)} m under the track` : `more than ${SIDE} m from the track`}`);
const drawn = drawnBuildings(C);
const street = buildStreet(L, C.roads);
const near = drawn.filter((b) => b.ring.some(([x, z]) => Math.abs(x) < x1 + 20 && Math.abs(z) < z1 + 20));
let onCity = 0, underStreet = 0;
for (const b of near) {
  const xs = b.ring.map((p) => p[0]), zs = b.ring.map((p) => p[1]);
  let city = 0, st = 0;
  for (let x = Math.min(...xs) + 0.25; x < Math.max(...xs); x += 0.5)
    for (let z = Math.min(...zs) + 0.25; z < Math.max(...zs); z += 0.5) {
      if (!inRing(x, z, b.ring)) continue;
      const i = Math.floor(x - L.x0), j = Math.floor(z - L.z0);
      if (i >= 0 && j >= 0 && i < L.W && j < L.D && L.inside[j * L.W + i]) city++;
      if (street.onStreet(x, z)) st++;
    }
  if (city) problems.push(`${b.id} (${b.name || ''}): ${(city * 0.25).toFixed(1)} m2 on a cell of the City`);
  if (st * 0.25 > 0.5) problems.push(`${b.id} (${b.name || ''}): ${(st * 0.25).toFixed(1)} m2 of the dark street under it`);
  onCity += city; underStreet += st;
}
const streetArea = street.street.reduce((s, v) => s + v, 0) / street.RES ** 2;
console.log(`drawn: ${drawn.length} buildings (${C.plateClipped.map((c) => c.name).join(', ')} whole); ${near.length} near the plate; the dark street ${Math.round(streetArea)} m2 of the plate's ${L.W * L.D} m2`);

// The exits of the people (layout.js): on the street or on a road, and the walks on the grid
// (people.js) between each exit and the City stay clear of the drawn buildings.
const sim = new Sim(L, []);
const hit = (x, z) => near.find((b) => inRing(x, z, b.ring));
for (const [q, c] of L.away.entries()) {
  const x = L.cellX(c), z = L.cellZ(c);
  const where = street.onRoad(x, z) ? 'a road' : street.onStreet(x, z) ? 'the street' : null;
  if (!where || hit(x, z)) problems.push(`exit ${q} at (${x}, ${z}): not on a road or the street`);
}
const lanes = [];
for (let k = 0; k < L.N; k++) if (L.inside[k] && L.alley[k] === 1) lanes.push(k);
const sample = lanes.filter((_, i) => i % Math.ceil(lanes.length / 60) === 0);
let walks = 0, bad = 0;
for (const e of L.away)
  for (const c of sample)
    for (const [a, b] of [[e, c], [c, e]]) {
      const pts = [[L.cellX(a), L.cellZ(a)]];
      sim.groundRoute(a, b, 0, 0, pts);
      walks++;
      let through = null;
      for (let i = 0; i + 1 < pts.length && !through; i++) {
        const [ax, az] = pts[i], [bx, bz] = pts[i + 1], n = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.5);
        for (let s = 0; s <= n && !through; s++) through = hit(ax + ((bx - ax) * s) / n, az + ((bz - az) * s) / n);
      }
      if (through && bad++ < 5) problems.push(`a walk from cell ${a} to cell ${b} goes through ${through.id} (${through.name || ''})`);
    }
console.log(`exits: ${L.away.length}, each on a road or the street; ${walks} walks between the exits and the lanes of the City, ${bad} through a drawn building`);

// The ghosts: in each view, cast a ray from points of the City wall back to the camera
// (Occlusion.hit, which the pick also uses). A building that a ray meets hides that point, thus
// the test (Occlusion.test) must fade it. The test can also fade a building that hides only a
// part of the wall between two points. The check counts those, but they are not problems.
// The points: along the City outline every metre, at 0, 3, 15 and 40 m. The views: 12
// directions round the City, each at 4 angles over the horizon. The angles go from the lowest
// view of the app (controls.maxPolarAngle 1.42, thus 8.6°) to 57°, with the start view (33°).
{
  const outline = buildSite(plan).polygon;
  const occ = new Occlusion(buildingPrisms(C), outline);
  const pts = [];
  for (let i = 0; i < outline.length; i++) {
    const [ax, az] = outline[i], [bx, bz] = outline[(i + 1) % outline.length], n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az)));
    for (let s = 0; s < n; s++) for (const y of [0, 3, 15, 40]) pts.push([ax + ((bx - ax) * s) / n, y, az + ((bz - az) * s) / n]);
  }
  let views = 0, faded = 0, missed = 0, extra = 0, ms = 0;
  const seen = new Uint8Array(occ.n);
  for (let a = 0; a < 12; a++)
    for (const e of [0.15, 0.33, 0.58, 1.0]) {
      const az = (a * Math.PI) / 6, d = { x: -Math.sin(az) * Math.cos(e), y: -Math.sin(e), z: -Math.cos(az) * Math.cos(e) };
      const t0 = performance.now();
      occ.test(d.x, d.y, d.z);
      ms += performance.now() - t0;
      views++;
      seen.fill(0);
      // The points in the frame of the view (occlude.js): v across it, w along it, sorted by v.
      const hl = Math.cos(e), ux = d.x / hl, uz = d.z / hl, k = Math.tan(e);
      const P = pts.map(([x, y, z]) => [ux * z - uz * x, ux * x + uz * z, x, y, z]).sort((p, q) => p[0] - q[0]);
      for (let b = 0; b < occ.n; b++) {
        const B = occ.bld[b];
        if (!B) continue;
        // A circle round the building: only the rays that pass it can meet it.
        const cx = (B.lo[0] + B.hi[0]) / 2, cz = (B.lo[1] + B.hi[1]) / 2, r = Math.hypot(B.hi[0] - cx, B.hi[1] - cz);
        const vc = ux * cz - uz * cx, wc = ux * cx + uz * cz;
        let lo = 0, hi = P.length;
        while (lo < hi) { const m = (lo + hi) >> 1; if (P[m][0] < vc - r) lo = m + 1; else hi = m; }
        for (let q = lo; q < P.length && P[q][0] <= vc + r && !seen[b]; q++) {
          const [, w, x, y, z] = P[q];
          if (y > B.h || wc - r > w || wc + r < w - (B.h - y) / k) continue;
          if (occ.hitOne(b, { x: x - d.x * 1000, y: y - d.y * 1000, z: z - d.z * 1000 }, d) < 1000 - 1e-6) seen[b] = 1;
        }
      }
      for (let b = 0; b < occ.n; b++) {
        if (occ.hide[b]) faded++;
        if (seen[b] && !occ.hide[b]) { missed++; if (missed <= 5) problems.push(`view ${a * 30}° at ${(e * 180 / Math.PI).toFixed(0)}°: building ${b} hides the City wall, but the test does not fade it`); }
        if (!seen[b] && occ.hide[b]) extra++;
      }
    }
  console.log(`ghosts: ${views} views, ${(faded / views).toFixed(1)} buildings faded in a view (mean); ${missed} missed; ${extra} faded with no wall point hidden; the test takes ${(ms / views).toFixed(2)} ms a view in node, with the warm-up`);
}

if (problems.length) {
  console.log(`\n${problems.length} problems:`);
  for (const p of problems.slice(0, 40)) console.log('  ' + p);
  process.exit(1);
}
console.log('ok');
