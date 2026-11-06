// Names the buildings of the 3D structure by the house numbers that Suenn Ho's (何巽) route maps
// of 1991 (M+ CA17/2/1-3) print on them (data/address_anchors.json, tools/addresses.mjs). The
// names are in data/structure_choices.json (layout.name of each building); they are not part of
// the frozen geometry (tools/check_structure.mjs).
//
// The old names came from the layout, which spread the GRS house numbers evenly along each street
// (src/layout.js): an APPROXIMATE order that the route map shows to be wrong on most streets.
// - A building on which the map prints numbers takes them: "30, 31 Tung Tau Tsuen Road", or the
//   first and last number for more than three ("102-110 Lung Chun Road"), and a second street
//   for a corner building.
// - A building with an old address name that the map puts on another building takes
//   "Building <id>".
// - Any other building keeps its name (a named building, or a street that the map does not
//   cover). Only the streets in CLEAR name buildings.
//
//     node tools/route_map_names.mjs [--write]
import { readFileSync, writeFileSync } from 'node:fs';
import { buildLayout } from '../src/layout.js';
import { Terrain } from '../src/terrain.js';
import { buildStructure } from '../src/city/model.js';
import { applyFixes } from '../src/city/fixes.js';
import { makeChoices } from '../src/city/choices.js';
import { makeAddresses, parseNum } from './addresses.mjs';

const root = new URL('..', import.meta.url).pathname;
const json = (p) => JSON.parse(readFileSync(root + p, 'utf8'));
const fixes = json('data/structure_fixes.json');
const fixed = applyFixes(json('data/plan.json'), json('data/book_overlay.json'), fixes, json('data/plan_fine.json'));
const book = json('data/book.json');
book.overlay = fixed.overlay;
const L = buildLayout(null, fixed.plan, json('data/businesses.json'), book, null);
const choicesFile = json('data/structure_choices.json');
const S = buildStructure(L, new Terrain(json('data/terrain.json')), { fixes, choices: makeChoices(choicesFile, false) });
const ADDR = makeAddresses(L, S, json('data/address_anchors.json'));

const STREET = {
  ttt: 'Tung Tau Tsuen Road', lcr: 'Lung Chun Road', lsr: 'Lung Shing Road', ssr: 'Sai Shing Road', kms: 'Kwong Ming Street',
  tcs: 'Tai Chang Street', tcn: 'Tai Chang Street', lys: 'Lo Yan Street', skg: 'Sz Kung Street', lcb: 'Lung Chun Back Road',
  abs: 'Almshouse Back Street', tts: 'Tin Hau Temple Street',
};
// the streets whose numbers the map shows clearly and in order (the inner streets of the south
// half are faint at 1000 px: their few numbers do not name a building)
const CLEAR = new Set(['ttt', 'lcr', 'lsr', 'kms', 'ssr', 'lys']);
const KEY = Object.fromEntries(Object.entries(STREET).map(([k, v]) => [v.toLowerCase(), k]));
const order = (t) => { const p = parseNum(t); return p ? p.lo + (p.suffix ? (p.suffix.charCodeAt(0) - 64) / 100 : 0) : 1e9; };
const numbers = (set) => {
  const xs = [...set].sort((a, b) => order(a) - order(b));
  return xs.length <= 3 ? xs.join(', ') : `${xs[0]}-${xs[xs.length - 1]}`;
};

const changed = [];
for (const b of S.list) {
  const lay = choicesFile.layout[b.key];
  if (!lay || b.kind === 'yamen') continue;
  const named = b.label !== lay.name; // a name from structure_fixes.json (names): keep it
  const m0 = ADDR.numbersOf.get(b.id), m = m0 && new Map([...m0].filter(([s]) => CLEAR.has(s)));
  let name = null;
  if (m && m.size) {
    const parts = [...m].sort((x, y) => y[1].size - x[1].size).slice(0, 2).map(([s, set]) => `${numbers(set)} ${STREET[s] || s}`);
    name = parts.join(' and ');
  } else {
    const old = /^([\dA-Z][\dA-Z&, \-]*)\s+(.+)$/i.exec(lay.name || '');
    const s = old && KEY[old[2].toLowerCase()];
    const r = s && CLEAR.has(s) && ADDR.streets[s] ? ADDR.resolve(s, old[1].split(/[&,]/)[0].trim(), 0) : null;
    if (r && r.b !== b.id) name = `Building ${b.id}`;
  }
  if (name && name !== lay.name) {
    changed.push([b.id, b.key, lay.name, name, named ? `(shown as "${b.label}")` : '']);
    lay.name = name;
  }
}
for (const c of changed) console.log(`b${c[0]} code ${c[1]}: ${c[2]} -> ${c[3]} ${c[4]}`);
console.log(`${changed.length} names changed`);
if (process.argv.includes('--write')) {
  writeFileSync(root + 'data/structure_choices.json', JSON.stringify(choicesFile));
  console.log('wrote data/structure_choices.json');
}
