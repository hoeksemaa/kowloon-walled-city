// Checks data/context.json, the buildings and roads round the City in December 1986.
//
//     node tools/check_context.mjs
//
// Prints counts, and the buildings near the approach track of src/planes.js that are taller
// than the track there. Fails (exit 1) if a building is on the City plate (the plan box with
// the MARGIN of src/layout.js), a building reaches beyond 600 m, a building has no source or no
// height, or a survey sheet does not register on the standing buildings (90% of the control
// residuals under 1 m, and a median shift under 0.75 m), or the City fit is poor. It also
// fails if the whole outline of a building that the plate cuts (plateClipped) reaches onto
// the City itself.
//
// Then it checks what the app draws (src/context.js, src/env.js, src/layout.js). It fails if a
// drawn outline covers a cell of the City, if the dark street round the City reaches under a
// drawn building, if an exit of the people is not on the street or on a road, or if a walk on
// the grid between an exit and the City goes through a drawn building.
import { readFileSync } from 'node:fs';
import { MARGIN, buildLayout } from '../src/layout.js';
import { Sim } from '../src/people.js';
import { drawnBuildings, buildStreet } from '../src/context.js';

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

// ---- the approach track of src/planes.js ----
const src = readFileSync(root + 'src/planes.js', 'utf8');
const main = readFileSync(root + 'src/main.js', 'utf8');
const glideDeg = +src.match(/GLIDE = Math\.tan\(\((\d+(?:\.\d+)?) \* Math\.PI\)/)[1];
const [, S0, S1] = src.match(/S0 = (-?\d+), S1 = (-?\d+)/).map(Number);
const m = main.match(/new Planes\(scene, \[([-\d.]+), ([-\d.]+)\], \[([-\d.]+), ([-\d.]+)\], ([-\d.]+)/);
const [dx, dz, px, pz, h0] = m.slice(1).map(Number);
const GLIDE = Math.tan((glideDeg * Math.PI) / 180);
const trackY = (s) => Math.max(8, h0 - s * GLIDE);
const NEAR = 60; // m either side of the track: half the span of the model plane and a margin
const tall = [], close = [];
for (const b of C.buildings) {
  // the lowest track height over the part of the outline within NEAR of the track
  let low = Infinity, lat = Infinity;
  const pts = [];
  for (let i = 0; i < b.ring.length; i++) {
    const p = b.ring[i], q = b.ring[(i + 1) % b.ring.length];
    for (let k = 0; k < 4; k++) pts.push([p[0] + (q[0] - p[0]) * k / 4, p[1] + (q[1] - p[1]) * k / 4]);
  }
  const sides = new Set();
  for (const [x, z] of pts) {
    const s = (x - px) * dx + (z - pz) * dz, l = (x - px) * dz - (z - pz) * dx;
    sides.add(Math.sign(l));
    if (s < S0 || s > S1) continue;
    if (Math.abs(l) <= NEAR) { low = Math.min(low, trackY(s)); lat = Math.min(lat, Math.abs(l)); }
  }
  if (sides.has(1) && sides.has(-1)) lat = 0;
  if (low < Infinity && b.height > low) tall.push({ b, low, lat });
  else if (low < Infinity) close.push({ b, low, lat });
}
console.log(`approach track: ${glideDeg} deg glide from ${h0} m at (${px}, ${pz}), along (${dx}, ${dz}), s ${S0} to ${S1}`);
console.log(`buildings within ${NEAR} m of the track and taller than the track there: ${tall.length}`);
for (const { b, low, lat } of tall.sort((a, c) => (c.b.height - c.low) - (a.b.height - a.low))) {
  console.log(`  ${b.id} ${b.name || ''} height ${b.height} m (${b.confidence}), track ${low.toFixed(1)} m, ${lat.toFixed(0)} m to the side`);
}
console.log('the least clearance below the track:');
for (const { b, low, lat } of close.sort((a, c) => (a.low - a.b.height) - (c.low - c.b.height)).slice(0, 5)) {
  console.log(`  ${b.id} ${b.name || ''} height ${b.height} m (${b.confidence}), track ${low.toFixed(1)} m, ${lat.toFixed(0)} m to the side`);
}

// ---- what the app draws ----
const book = json('data/book.json');
book.overlay = json('data/book_overlay.json');
const L = buildLayout(null, plan, json('data/businesses.json'), book, C);
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

if (problems.length) {
  console.log(`\n${problems.length} problems:`);
  for (const p of problems.slice(0, 40)) console.log('  ' + p);
  process.exit(1);
}
console.log('ok');
