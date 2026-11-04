// Checks the 3D structure of src/structure/ (model.js, plan.js, links.js).
//
//     node tools/check_structure.mjs
//     node tools/check_structure.mjs --record   # write data/structure_choices.json
//     COARSE=1 node tools/check_structure.mjs   # the 1 m outlines (no data/plan_fine.json)
//
// Prints counts: buildings, storeys, stairs, units by kind, doors and links, links by height,
// the SW-NE route inside, and routes between flats on upper floors. Fails (exit 1) if
// more than 0.1 % of the units have no way to the lanes, if there is no SW-NE route
// inside, if a building has no floor, or if two floors of one building are out of order.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { buildLayout } from '../src/layout.js';
import { Terrain } from '../src/terrain.js';
import { buildStructure } from '../src/structure/model.js';
import { applyFixes } from '../src/structure/fixes.js';
import { makeChoices, choicesFile } from '../src/structure/choices.js';
import { route, reach } from '../src/structure/links.js';
import { mulberry32 } from '../src/util.js';

const root = new URL('..', import.meta.url).pathname;
const json = (p) => JSON.parse(readFileSync(root + p, 'utf8'));
const book = json('data/book.json');
const fixes = json('data/structure_fixes.json');
const fixed = applyFixes(json('data/plan.json'), json('data/book_overlay.json'), fixes, process.env.COARSE ? null : json('data/plan_fine.json'));
book.overlay = fixed.overlay;
const L = buildLayout(null, fixed.plan, json('data/businesses.json'), book, json('data/context.json'));
const T = new Terrain(json('data/terrain.json'));
const t0 = Date.now();
// the kept random choices (src/structure/choices.js); --record makes them again from the old
// random sequence
const record = process.argv.includes('--record');
const choices = makeChoices(existsSync(root + 'data/structure_choices.json') ? json('data/structure_choices.json') : null, record);
const S = buildStructure(L, T, { fixes, choices });
const ms = Date.now() - t0;
const problems = [];
const count = (f) => { const m = {}; for (const b of S.list) { const k = f(b); if (k != null) m[k] = (m[k] || 0) + 1; } return m; };

for (const b of S.list) {
  if (!b.n || !b.phases.length) problems.push(`building ${b.id} has no floor`);
  for (let k = 0; k < b.n; k++) if (!(b.y[k + 1] > b.y[k] + 2)) problems.push(`building ${b.id}: floor ${k} is ${(b.y[k + 1] - b.y[k]).toFixed(2)} m high`);
}
console.log(`${S.list.length} buildings in ${ms} ms`);
console.log('storeys from:', JSON.stringify(count((b) => b.from)));
console.log('storeys:', JSON.stringify(count((b) => b.n)));
console.log('stairs:', JSON.stringify(count((b) => b.stairs.map((s) => s.type + (s.rmax > 0.2 ? ' (steep)' : '') + (s.spine ? ' + corridor' : '')).join(', ') || (b.wingOf !== undefined ? 'wing of a neighbour' : 'none'))));
console.log(`annexes (one building over another): ${S.list.reduce((s, b) => s + b.annex.length, 0)}, setbacks: ${S.list.filter((b) => b.setback).length}, overhangs: ${S.list.filter((b) => b.overFrom < 99).length}`);
const g0 = S.list.map((b) => b.g0).sort((a, b) => a - b), roof = S.list.filter((b) => b.kind === 'tenement').map((b) => b.top).sort((a, b) => a - b);
const pc = (a, p) => a[Math.min(a.length - 1, Math.floor(a.length * p))].toFixed(1);
console.log(`G/F floor: ${pc(g0, 0)}..${pc(g0, 1)} mPD; tenement roofs p10/p50/p90: ${pc(roof, 0.1)} / ${pc(roof, 0.5)} / ${pc(roof, 0.9)} mPD`);
// floors that line up: two neighbours with floors within 0.15 m of each other
let near = 0, all = 0;
for (const b of S.list) for (const c of S.neighbours(b)) {
  if (c.id < b.id || b.wingOf === c.id || c.wingOf === b.id) continue;
  for (let k = 1; k < b.n; k++) { all++; if (c.y.some((y) => Math.abs(y - b.y[k]) < 0.15)) near++; }
}
console.log(`floors of neighbours within 0.15 m of each other: ${((100 * near) / all).toFixed(0)} % (wings and their hosts left out)`);

let units = 0, area = 0;
const byKind = {};
for (const b of S.list) for (const ph of b.phases) for (const u of ph.plan.units) {
  units += ph.k1 - ph.k0; area += u.area * (ph.k1 - ph.k0);
  for (let k = ph.k0; k < ph.k1; k++) (byKind[u.kind] ||= []).push(u.area);
}
console.log(`units: ${units}, mean ${(area / units).toFixed(1)} m2`);
for (const [k, a] of Object.entries(byKind)) {
  a.sort((x, y) => x - y);
  console.log(`  ${k}: ${a.length}, p10/p50/p90 ${pc(a, 0.1)} / ${pc(a, 0.5)} / ${pc(a, 0.9)} m2, over 40 m2: ${a.filter((v) => v > 40).length}`);
}
const doors = {};
for (const d of S.doors) doors[d.kind] = (doors[d.kind] || 0) + 1;
console.log('doors and links:', JSON.stringify(doors));
// doors between buildings (not wings) on each floor of a building, by height
const band = (k) => (k <= 5 ? '1/F-5/F' : k <= 9 ? '6/F-9/F' : '10/F+');
const floors = {}, mid = {};
for (const b of S.list) if (b.stairs.length) for (let k = 1; k < b.n; k++) floors[band(k)] = (floors[band(k)] || 0) + 1;
for (const d of S.doors) if (['party', 'half', 'span', 'hole', 'bridge'].includes(d.kind) && d.k > 0 && d.kc > 0) mid[band(Math.min(d.k, d.kc))] = (mid[band(Math.min(d.k, d.kc))] || 0) + 2;
console.log('links to other buildings per floor:', Object.keys(floors).map((k) => `${k} ${((mid[k] || 0) / floors[k]).toFixed(2)}`).join(', '));
// the SW-NE route inside the buildings: no lanes, no roofs
const inside = new Set(['lane', 'street', 'step', 'ladder', 'roofdoor', 'window']);
const unitOn = (b, k) => [...S.unitNode].find(([q]) => q.startsWith(`${b}:${k}:`))?.[1];
const ns0 = S.chainEnds && unitOn(S.chain[0], S.chainEnds[0]), ns1 = S.chainEnds && unitOn(S.chain.at(-1), S.chainEnds[1]);
const ns = ns0 !== undefined && ns1 !== undefined ? route(S, ns0, ns1, inside) : null;
if (ns) {
  const ks = ns.path.map((v) => S.graph.nodes[v].k).filter((k) => k !== undefined);
  console.log(`SW-NE route inside: ${S.chain.length} buildings, ${ns.kinds.filter((k) => k === 'party').length} doors, ${ns.kinds.filter((k) => k === 'bridge').length} bridges, floors ${Math.min(...ks)}-${Math.max(...ks)}`);
} else problems.push('no SW-NE route inside the buildings');
console.log(`graph: ${S.graph.nodes.length} nodes, ${S.graph.to.length / 2} edges`);

// every unit reaches the lanes
const seen = reach(S, S.laneNode[S.laneNode.findIndex((v) => v >= 0)]);
const lost = [...S.unitNode].filter(([, id]) => !seen[id]).map(([k]) => k);
console.log(`units with no way to the lanes: ${lost.length}${lost.length ? ` (${lost.slice(0, 12).join(' ')})` : ''}`);
if (lost.length > S.unitNode.size * 0.001) problems.push(`${lost.length} units have no way to the lanes`);

// routes between flats on 8/F or higher, 20-70 m apart
const rng = mulberry32(5), up = [...S.unitNode].filter(([k]) => +k.split(':')[1] >= 8);
let n = 0, lane = 0, roofs = 0, sum = 0;
for (let q = 0; q < 2000 && n < 150; q++) {
  const [ka, a] = up[Math.floor(rng() * up.length)], [kb, b] = up[Math.floor(rng() * up.length)];
  const A = S.graph.nodes[a], B = S.graph.nodes[b], d = Math.hypot(A.x - B.x, A.z - B.z);
  if (ka.split(':')[0] === kb.split(':')[0] || d < 20 || d > 70) continue;
  const r = route(S, a, b);
  if (!r) continue;
  n++;
  if (r.kinds.includes('lane') || r.kinds.includes('street')) lane++;
  if (r.kinds.some((k) => k === 'step' || k === 'ladder' || k === 'window' || k === 'roofdoor')) roofs++;
  sum += r.cost / d;
}
console.log(`routes between flats on 8/F+, 20-70 m apart: ${n}; down to the lanes ${lane}, over the roofs ${roofs}, off the lanes ${n - lane}; cost / distance ${(sum / n).toFixed(1)}`);

if (record) {
  choices.out.made = new Date().toISOString().slice(0, 10) + (process.env.COARSE ? ', the 1 m outlines' : ', the fine outlines');
  writeFileSync(root + 'data/structure_choices.json', JSON.stringify(choicesFile(choices)) + '\n');
  console.log(`wrote data/structure_choices.json: ${Object.keys(choices.out.u).length} choices`);
}

if (problems.length) {
  console.log(`\n${problems.length} problems:`);
  for (const p of problems.slice(0, 30)) console.log('  ' + p);
  process.exit(1);
}
console.log('ok');
