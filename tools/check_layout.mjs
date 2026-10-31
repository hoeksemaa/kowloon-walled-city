// Checks the towers, stairs and floor plans of src/layout.js and src/floorplan.js.
//
//     node tools/check_layout.mjs
//
// Prints counts. Fails (exit 1) if a unit has no cell, a cell is in no unit and not next to
// the corridor or a stair, a unit meets neither the corridor nor a stair, a storey or a roof
// has no way down to the lanes, or a walk on one storey goes through the room of another
// unit, or a place of the book has no building.
import { readFileSync } from 'node:fs';
import { buildLayout } from '../src/layout.js';
import { legAt, walkIn, planAt } from '../src/floorplan.js';
import { buildRoutes } from '../src/routes.js';

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

// Routes: every storey and roof has a way down, and walks on one storey keep out of the
// rooms of other units.
const R = buildRoutes(L);
let cut = 0;
for (let n = 0; n < R.N; n++) if (R.exitOf[n] < 0) { cut++; if (cut <= 5) problems.push(`node ${n} (block ${R.nB[n]}, storey ${R.nF[n]}, roof of tower ${R.nT[n]}) has no way down`); }
console.log(`route network: ${R.N} nodes, ${R.doorsAt.flat().filter((d) => d.link).length} links between towers, ${R.bridges.length} bridges, ${R.hops.length} roof hops`);
let rng = 7;
const rnd = () => ((rng = (rng * 16807) % 2147483647) / 2147483647);
let walks = 0, bad = 0;
for (const b of B) {
  if (!b.plans || b.floors < 2) continue;
  const P = planAt(b, 1), units = P.units;
  for (let t = 0; t < 6; t++) {
    const u = units[Math.floor(rnd() * units.length)], v = units[Math.floor(rnd() * units.length)];
    const k0 = u.cells[Math.floor(rnd() * u.cells.length)], k1 = v.cells[Math.floor(rnd() * v.cells.length)];
    const from = { x: L.cellX(k0), z: L.cellZ(k0) }, path = [from, ...walkIn(L, b, 1, from, { x: L.cellX(k1), z: L.cellZ(k1) })];
    walks++;
    // Sample each step; a sample in the room of a third unit is a walk through a wall. Samples
    // within 0.35 m of a door or a corner can fall in the next cell, thus they do not count.
    let through = 0;
    for (let q = 1; q < path.length; q++) {
      const a = path[q - 1], c = path[q], len = Math.hypot(c.x - a.x, c.z - a.z);
      for (let d = 0.35; d < len - 0.35; d += 0.25) {
        const x = a.x + ((c.x - a.x) * d) / len, z = a.z + ((c.z - a.z) * d) / len;
        const i = P.index.get(Math.floor(z - L.z0) * W + Math.floor(x - L.x0));
        if (i !== undefined && P.cell[i] >= 0 && P.cell[i] !== u.id && P.cell[i] !== v.id) through++;
      }
    }
    if (through > 2) bad++;
  }
}
console.log(`walks on one storey: ${walks}, through another unit's room: ${bad}`);
if (bad > walks * 0.02) problems.push(`${bad} of ${walks} walks go through the room of another unit`);

// The places of City of Darkness Revisited: each person of the book has a place, no two in
// one building, and the standpipe and the kindergarten are placed.
const { BOOK_PEOPLE } = await import('../src/residents.js');
const placed = BOOK_PEOPLE.filter((P) => L.book[P.n]);
console.log(`book places ${placed.length} of ${BOOK_PEOPLE.length}; kindergarten ${!!L.book.kindergarten}; standpipe ${!!L.standpipe}`);
if (placed.length < BOOK_PEOPLE.length) problems.push(`book people with no place: ${BOOK_PEOPLE.filter((P) => !L.book[P.n]).map((P) => P.n)}`);
const blocks = Object.values(L.book).map((v) => v.b);
if (new Set(blocks).size < blocks.length) problems.push('two places of the book are in one building');
if (!L.book.kindergarten || !L.standpipe) problems.push('no kindergarten or no standpipe');
for (const P of BOOK_PEOPLE) {
  const v = L.book[P.n];
  if (v && !P.roof && !B[v.b].prem[v.f].some((q) => q.book === P.n)) problems.push(`place ${P.n} has no premises of the book`);
}

if (problems.length) {
  console.log(`${problems.length} problems, e.g.:\n  ${problems.slice(0, 10).join('\n  ')}`);
  process.exit(1);
}
console.log('ok');
