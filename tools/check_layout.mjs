// Checks the towers, stairs and floor plans of src/layout.js and src/floorplan.js.
//
//     node tools/check_layout.mjs
//
// Prints counts. Fails (exit 1) if a unit has no cell, a cell is in no unit and not next to
// the corridor or a stair, or a unit meets neither the corridor nor a stair.
import { readFileSync } from 'node:fs';
import { buildLayout } from '../src/layout.js';
import { legAt } from '../src/floorplan.js';

const root = new URL('..', import.meta.url).pathname;
const json = (p) => JSON.parse(readFileSync(root + p, 'utf8'));
const book = json('data/book.json');
book.overlay = json('data/book_overlay.json');
const L = buildLayout(null, json('data/plan.json'), json('data/businesses.json'), book);
const B = L.buildings, W = L.W;
const problems = [], nooks = [];

const floors = {};
for (const t of L.towers) floors[B[t.blocks[0]].floors] = (floors[B[t.blocks[0]].floors] || 0) + 1;
const layouts = {};
for (const b of B) layouts[b.layout] = (layouts[b.layout] || 0) + 1;
console.log(`towers ${L.towers.length}, blocks ${B.length}`);
console.log('towers by storeys', floors);
console.log('block layouts', layouts);
console.log(`stairs ${B.reduce((s, b) => s + (b.cores ? b.cores.length : 0), 0)}; blocks sharing a stair ${B.filter((b) => b.shareWith >= 0).length}`);

let flats = 0, work = 0, split = 0, landlocked = 0, noCorridorDoor = 0;
const sizes = [];
for (const b of B) {
  if (!b.plans) continue;
  for (const kind of ['home', 'work']) {
    const P = b.plans[kind];
    P.cell.forEach((v, i) => {
      const k = b.cells[i], [x, z] = [L.cellX(k), L.cellZ(k)];
      const G = b.band && legAt(b.band, x * b.F.ux + z * b.F.uz), w = x * b.F.px + z * b.F.pz;
      const inBand = G && w >= G.w0 && w < G.w1;
      if (v === -1 && !inBand) nooks.push([b, P, k]);
    });
    const part = new Map(b.cells.map((k, i) => [k, P.cell[i]]));
    // A cell in no unit and not in the corridor: a nook, next to the corridor or a stair.
    for (const [, , k] of nooks.splice(0)) if (![k - 1, k + 1, k - W, k + W].some((n) => part.get(n) === -2 || part.get(n) === -1))
      problems.push(`block ${b.id} ${kind}: cell ${k} in no unit`);
    for (const u of P.units) {
      if (!u.cells.length) problems.push(`block ${b.id} ${kind}: unit ${u.id} has no cell`);
      // One piece? (Cells that meet at a corner count as one piece.)
      const set = new Set(u.cells), seen = new Set([u.cells[0]]), q = [u.cells[0]];
      while (q.length) for (const n of [q.pop()].flatMap((k) => [k - 1, k + 1, k - W, k + W, k - W - 1, k - W + 1, k + W - 1, k + W + 1])) if (set.has(n) && !seen.has(n)) { seen.add(n); q.push(n); }
      if (seen.size < set.size) split++;
      // A way out: the unit touches the corridor or a stair, or it is the only unit, or its
      // block has no stair of its own (a door to a neighbour's stair, or none).
      const out = u.cells.some((k) => [k - 1, k + 1, k - W, k + W].some((n) => part.get(n) === -1 || part.get(n) === -2));
      if (!out && P.units.length > 1 && b.cores.length) problems.push(`block ${b.id} ${kind}: unit ${u.id} touches no corridor or stair`);
      if (!out && P.units.length > 1 && !b.cores.length) landlocked++;
      if (b.band && u.door && u.door.axis !== 'w') noCorridorDoor++;
    }
  }
  const hf = b.uses.filter((u) => u === 'home').length;
  flats += b.plans.home.units.length * hf;
  work += b.plans.work.units.length * (b.uses.length - hf);
  for (const u of b.plans.home.units) for (let f = 0; f < hf; f++) sizes.push(u.area);
}
sizes.sort((a, b) => a - b);
const q = (p) => sizes[Math.floor(p * (sizes.length - 1))];
console.log(`flats ${flats} (book: 8800), size m2 p10 ${q(0.1)} p50 ${q(0.5)} p90 ${q(0.9)}, mean ${(sizes.reduce((s, v) => s + v, 0) / sizes.length).toFixed(1)}`);
console.log(`work units ${work}; units in more than one piece (a stair between two rooms) ${split}`);
console.log(`units in blocks with no stair that reach out only through another unit ${landlocked}; units on a corridor with a door on a stair ${noCorridorDoor}`);
console.log(`the survey flat: block ${L.realFlat && L.realFlat.b}, unit ${L.realFlat && L.realFlat.u}`);

if (problems.length) {
  console.log(`${problems.length} problems, e.g.:\n  ${problems.slice(0, 10).join('\n  ')}`);
  process.exit(1);
}
console.log('ok');
