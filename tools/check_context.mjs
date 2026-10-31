// Checks data/context.json, the buildings and roads round the City in December 1986.
//
//     node tools/check_context.mjs
//
// Prints counts, and the buildings near the approach track of src/planes.js that are taller
// than the track there. Fails (exit 1) if a building is on the City plate (the plan box with
// the MARGIN of src/layout.js), a building reaches beyond 600 m, a building has no source or no
// height, or a survey sheet does not register on the standing buildings (90% of the control
// residuals under 1 m, and a mean shift under 0.75 m), or the City fit is poor.
import { readFileSync } from 'node:fs';
import { MARGIN } from '../src/layout.js';

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
console.log(`named ${C.buildings.filter((b) => b.name).length}; clipped by the plate ${C.buildings.filter((b) => b.clipped).length}`);

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

if (problems.length) {
  console.log(`\n${problems.length} problems:`);
  for (const p of problems.slice(0, 40)) console.log('  ' + p);
  process.exit(1);
}
console.log('ok');
