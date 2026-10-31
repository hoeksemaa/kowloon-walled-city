// Checks the hints of the game "Find them" (src/game.js) at every 10 minutes of the week.
//
//     node tools/check_game.mjs
//
// For each case and each sample: the person is outside the City and the hints say so, or the
// circle of the Where hint holds the person, the tower of the Which hint is the person's tower
// and its storeys hold the person, and the person is visible in one view (in a building: the
// cut at the person's storey; on a roof, a link or in a lane: the whole view). Fails (exit 1)
// if a sample breaks a rule.
import { readFileSync } from 'node:fs';
import { buildLayout } from '../src/layout.js';
import { buildRoutes } from '../src/routes.js';
import { createPopulation, Sim, WEEK } from '../src/people.js';
import { CASES, hint, spot } from '../src/game.js';

const root = new URL('..', import.meta.url).pathname;
const json = (p) => JSON.parse(readFileSync(root + p, 'utf8'));
const book = json('data/book.json');
book.overlay = json('data/book_overlay.json');
const L = buildLayout(null, json('data/plan.json'), json('data/businesses.json'), book);
L.routes = buildRoutes(L);
const sim = new Sim(L, createPopulation(L));
const B = L.buildings;
const problems = [];
const seen = Object.fromEntries(CASES.map((c) => [c.key, { in: 0, roof: 0, lane: 0, link: 0, away: 0 }]));

for (let d = 0; d < 7; d++) {
  sim.day = d;
  sim.setTime(0);
  for (let m = 0; m < 1440; m += 10) {
    if (m) sim.step(600);
    for (const c of CASES) {
      const a = sim.agents.find(c.find);
      if (!a) { problems.push(`${c.key}: no person`); continue; }
      const at = spot(L, sim, a), when = `${WEEK[d]} ${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      if (!at) {
        seen[c.key].away++;
        if (!hint(L, sim, c, a, 2, m).away) problems.push(`${c.key} ${when}: away, but the Where hint does not say so`);
        continue;
      }
      seen[c.key][at.kind]++;
      const w = hint(L, sim, c, a, 2, m), h = hint(L, sim, c, a, 3, m), s = hint(L, sim, c, a, 4, m);
      if (!w.ring || Math.hypot(w.ring.x - at.x, w.ring.z - at.z) > w.ring.r) problems.push(`${c.key} ${when}: the circle does not hold the person`);
      if (h.tower !== B[at.b].tower) problems.push(`${c.key} ${when}: the Which hint names another tower`);
      if (at.kind === 'in') {
        if (!(h.lo <= at.level && at.level <= h.hi)) problems.push(`${c.key} ${when}: ${at.level}/F is not in ${h.lo}-${h.hi}`);
        if (at.level >= B[at.b].floors) problems.push(`${c.key} ${when}: ${at.level}/F is above the building`);
        if (s.cut !== at.level) problems.push(`${c.key} ${when}: the Show hint opens another storey`);
      } else if (s.cut !== -1) problems.push(`${c.key} ${when}: the Show hint cuts the view for a person outdoors`);
    }
  }
}
for (const c of CASES) console.log(c.key.padEnd(8), JSON.stringify(seen[c.key]));
if (problems.length) {
  console.log(`${problems.length} problems, e.g.:\n  ${problems.slice(0, 12).join('\n  ')}`);
  process.exit(1);
}
console.log('ok');
