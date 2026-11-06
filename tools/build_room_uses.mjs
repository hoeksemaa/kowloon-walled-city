// Builds data/room_uses.json: the use of each room (unit) of the frozen 3D structure in
// December 1986. It changes no geometry: it reads the structure and writes a mask.
//
//     node tools/build_room_uses.mjs
//
// Inputs: the frozen structure (as tools/check_structure.mjs builds it), data/businesses.json
// (the clearance premises of the GRS catalogue), data/room_research.json (the documented places
// and their sources). Same inputs, same output: the random choices use a fixed seed.
//
// 1. Documented places. Each GRS premises (with the corrections of room_research.json) and each
//    place fact of December 1986 goes to a building and a floor: by its address (house-number
//    order along the street, APPROXIMATE: src/layout.js locate), else by its number on the
//    1992 map, else by a building that fits its clue, else to a building on its street. Then
//    it goes to the best free unit of that floor (a G/F shop to a unit with a lane door, a
//    factory to a factory floor, a flat to a flat).
// 2. Guesses. The other units get a use from the counts of the sources: the non-residential
//    units on each level (Suenn Ho, p139), the trades of the Kai Fong count of 1983 (WSJ), the
//    dentists of 1987 (p36) and the clinics (p187), each trade on the floors where the GRS
//    premises of that trade are. The documented places count against these totals. All other
//    units are flats.
//
// Each unit gets one category (CATEGORIES), one basis (verified | likely | guess) and the id of
// its documented place, if any. A place on a floor that has no free unit shares a unit: the
// place keeps it in its "at" list, but the unit shows the first place.
import { readFileSync, writeFileSync } from 'node:fs';
import { buildLayout, locate, MARGIN, TRADE_LABEL } from '../src/layout.js';
import { Terrain } from '../src/terrain.js';
import { buildStructure } from '../src/city/model.js';
import { applyFixes } from '../src/city/fixes.js';
import { makeChoices } from '../src/city/choices.js';
import { mulberry32 } from '../src/util.js';
import { cityFingerprint } from './structure_fingerprint.mjs';
import { makeAddresses } from './addresses.mjs';

const root = new URL('..', import.meta.url).pathname;
const json = (p) => JSON.parse(readFileSync(root + p, 'utf8'));
const book = json('data/book.json'), biz = json('data/businesses.json'), research = json('data/room_research.json');
const fixes = json('data/structure_fixes.json');
const fixed = applyFixes(json('data/plan.json'), json('data/book_overlay.json'), fixes, json('data/plan_fine.json'));
book.overlay = fixed.overlay;
const L = buildLayout(null, fixed.plan, biz, book, null);
const T = new Terrain(json('data/terrain.json'));
const S = buildStructure(L, T, { fixes, choices: makeChoices(json('data/structure_choices.json'), false) });

// ---- categories (at most 20) ----
export const CATEGORIES = [
  ['home', 'flats', 'homes: flats, divided flats, cubicles, roof huts'],
  ['dentist', 'dentist', 'dental clinics and denture makers'],
  ['clinic', 'doctor / clinic', 'doctors (mostly unlicensed, trained in China), clinics, bone-setters'],
  ['medicine', 'herbalist / medicine shop', 'Chinese herbal doctors and medicine shops'],
  ['plastics', 'plastics factory', 'plastics and rubber workshops'],
  ['metal', 'metal + machine works', 'metal, machine, electrical and jewellery workshops'],
  ['garment', 'garment, textile + shoe workshop', 'weaving, knitting, garments, shoes and leather'],
  ['foodfac', 'food workshop', 'noodles, fishballs, meat, cakes, candy, catering'],
  ['works', 'other workshop', 'other factories and workshops: wood, paper, printing, pigeon lofts'],
  ['shop', 'shop', 'stores, groceries, stalls'],
  ['eating', 'eating house', 'restaurants and cafés'],
  ['office', 'office / company', 'trading, property and other company premises'],
  ['storage', 'store room', 'store rooms and warehouses'],
  ['services', 'services + utilities', 'barbers, laundries, water and power suppliers, wells, toilets'],
  ['school', 'school / kindergarten', 'schools, kindergartens, child care, tuition'],
  ['religion', 'temple / church / mission', 'temples, shrines, churches, missions and their centres'],
  ['community', 'association / community', 'the Kai Fong association, clubs, youth and old people\'s centres'],
  ['vice', 'gambling / drugs / sex', 'only where a source shows it in the period'],
].map(([id, label, note]) => ({ id, label, note }));
const CAT = new Set(CATEGORIES.map((c) => c.id));
const FACTORY = new Set(['plastics', 'metal', 'garment', 'foodfac', 'works']);
const FRONT = new Set(['shop', 'eating', 'dentist', 'clinic', 'medicine', 'services', 'office']);
const HALL = new Set(['school', 'community', 'religion']);
const TRADE_CAT = {
  dentist: 'dentist', clinic: 'clinic', bonesetter: 'clinic', medicine: 'medicine',
  plastics: 'plastics', metal: 'metal', electrical: 'metal', jewellery: 'metal', toys: 'works',
  garment: 'garment', textile: 'garment', shoes: 'garment',
  fishball: 'foodfac', noodles: 'foodfac', meat: 'foodfac', roastmeat: 'foodfac', cakes: 'foodfac', food: 'foodfac', catering: 'foodfac',
  eatinghouse: 'eating', cafe: 'eating',
  store: 'shop', optical: 'shop', gas: 'shop', furniture: 'shop', salon: 'services', laundry: 'services',
  factory: 'works', printing: 'works', plumbing: 'works', construction: 'works',
  trading: 'office', property: 'office', transport: 'office', storage: 'storage',
  school: 'school', kaifong: 'community', temple: 'religion',
};
const BASIS_RANK = { verified: 0, likely: 1, guess: 2 };
// English names first (CLAUDE.md): the places whose record puts the Chinese name first but also
// gives an English name. Each one: id -> [the English name, the Chinese name]. A place whose
// sources give only a Chinese name keeps it: no English translation is made up.
const ENGLISH_FIRST = {
  A14: ['Sang Kee Restaurant sign', '生記飯店'], A15: ['Tang Chi Shing Dentistry sign', '鄧志成牙科'],
  A42: ['International Clinic sign', '國際診所'], T29: ['Free-school centre, former Lung Tsun Free School', '義學中心 / 龍津義學'],
  T30: ['Youth centre, Hong Kong Federation of Youth Groups', '青年中心 (香港青年協會)'],
  T37: ['Ling Sang Dentistry (probably Cheng Ling Sang Dentistry)', '凌生牙科'], T39: ['Chong Tin Lai Dentistry', '莊天麗牙科'],
  T40: ['Cheung Ting Wah Skin Clinic', '張廷華皮膚專科'], T43: ['Wong Wai Kuen Dentistry', '王偉權牙科'],
  T45: ['Wing Fat Store, with a KENT sign', '榮發士多'], Z27: ['Lok Fuk Wah Dentistry', '樂福華牙科'], Z29: ['Yau Chai Clinic', '柔濟診所'],
  D3: ['Ng family flat, 4/F, 94 Lung Chun Road', '吳宅'], D9: ['Yan Chai Clinic', '仁濟診所'],
  D31: ['Man Kwok (International) Clinic, Dr Mui Lap Lim', '萬國診所'], D32: ['Siu Mei Mei Gynaecology', '蕭美美婦科'],
  D33: ['Chung Wah Dental Clinic', '中華牙科診所'], D35: ['Hui Chi Cheong Dentistry', '許熾昌牙科'],
  D36: ['Yeung Wing Kwong Dentistry', '楊永光牙科'], D39: ['Suen Yeung Sin Dentistry', '孫仰先牙科'],
  D40: ['Mok Sze Luk Dental Room', '莫斯錄牙室'], D42: ['Ng Sek Lung Dentistry', '伍錫隆牙科'],
  D43: ['Ngai Hon Man Dentistry', '魏漢文牙科'], D44: ['Cheung Chuen Bone-setter', '張泉跌打'],
  G46: ['Sing Chow Shoes (second premises)', '星洲鞋店'], C32: ['Stairwell direction sign, probably Wan Tung plastics factory', '運通'],
  'grs:HKRS1255-3-309': ['Sing Chow Shoes, Tung Tau Tsuen Road', '星洲鞋店'],
};
// "K.W.C." (Kowloon Walled City) is not a name: some GRS titles put it before the name, or in
// place of it.
const KWC = /^K\.?\s?W\.?\s?C\b\.?\s*(\[Kowloon Walled City\])?\s*/i;
function named(p) {
  if (ENGLISH_FIRST[p.id]) return { name: ENGLISH_FIRST[p.id][0], nameZh: ENGLISH_FIRST[p.id][1] };
  const name = KWC.test(p.name || '') ? p.name.replace(KWC, '').trim() || p.nameZh || p.name : p.name;
  return { name, nameZh: p.nameZh || undefined };
}

// ---- the units of the structure ----
const units = [], unitAt = new Map();
for (const b of S.list) {
  for (let k = 0; k < b.n; k++)
    for (const u of b.phaseOf(k).plan.units) {
      const r = { b: b.id, k, u: u.id, kind: u.kind, area: u.area, front: false, place: null, cat: null, basis: null };
      units.push(r); unitAt.set(`${b.id}:${k}:${u.id}`, r);
    }
  if (b.roofRoom && S.unitNode.has(`${b.id}:${b.n}:0`)) {
    const n = S.graph.nodes[S.unitNode.get(`${b.id}:${b.n}:0`)];
    const r = { b: b.id, k: b.n, u: 0, kind: 'roofroom', area: n.area, front: false, place: null, cat: null, basis: null };
    units.push(r); unitAt.set(`${b.id}:${b.n}:0`, r);
  }
}
for (const d of S.doors) { // a unit with a door to a lane or street
  if (d.kind !== 'shop' && d.kind !== 'street') continue;
  let best = null, bd = Infinity;
  for (const u of S.list[d.b].phaseOf(d.k).plan.units) {
    const dd = Math.hypot(u.x - d.x, u.z - d.z);
    if (dd < bd) { bd = dd; best = u; }
  }
  if (best) unitAt.get(`${d.b}:${d.k}:${best.id}`).front = true;
}
const onFloor = new Map(); // "b:k" -> units
for (const r of units) {
  const key = `${r.b}:${r.k}`;
  if (!onFloor.has(key)) onFloor.set(key, []);
  onFloor.get(key).push(r);
}
const storeys = (b) => S.list[b].n + (S.list[b].roofRoom ? 1 : 0); // floors with units
// the house numbers of Suenn Ho's (何巽) route maps of 1991 (tools/addresses.mjs)
const ADDR = makeAddresses(L, S, json('data/address_anchors.json'));
const tooLow = []; // verified places whose address building is lower than their floor

// ---- where an address is ----
const pinAt = (m) => ({ x: L.x0 + MARGIN + m[0], z: L.z0 + MARGIN + m[1] });
const STREET_LABEL = book.overlay.streets || {}; // streets the layout has no house numbers for
const LANE_STREET = [
  [/lung chun/i, 'lcr'], [/tai chang/i, 'tcs'], [/sai shing/i, 'ssr'], [/kwong ming/i, 'kms'], [/lo yan/i, 'lys'],
  [/lung shing/i, 'lsr'], [/sz kung/i, 'skg'], [/tung tau/i, 'ttt'], [/tin hau/i, 'tht'],
];
const EAST_ROW = S.list.filter((b) => /Temporary structure \(TS-E/.test(b.label || '')).map((b) => b.id);
let allowYamen = false; // the Yamen halls take only a hall use: a centre, a school, a temple, a clinic
const usable = (id, k) => id != null && S.list[id] && (allowYamen || S.list[id].kind !== 'yamen') && storeys(id) > k;
const nearestTo = (at, k, ids = S.list.map((b) => b.id)) => {
  let best = null, bd = Infinity;
  for (const id of ids) {
    if (!usable(id, k)) continue;
    const b = S.list[id], d = Math.hypot(b.cx - at.x, b.cz - at.z);
    if (d < bd) { bd = d; best = id; }
  }
  return best;
};
const hash = (s) => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const num = (v) => { const n = parseInt(String(v ?? '').replace(/^No\.?\s*/i, ''), 10); return Number.isFinite(n) ? n : null; };
const streetKey = (s) => {
  if (!s) return null;
  if (L.addr[s] || STREET_LABEL[s]) return s;
  if (/tung tsing/i.test(s)) return 'east';
  for (const [rx, key] of LANE_STREET) if (rx.test(s)) return key;
  return null;
};
// the street that a location clue names first (for a place with no street in its source)
const textStreet = (t) => {
  let best = null, at = Infinity;
  for (const [rx, key] of [[/tung tsing/i, 'east'], ...LANE_STREET]) {
    const m = rx.exec(t || '');
    if (m && m.index < at) { at = m.index; best = key; }
  }
  return best;
};
const hasFree = (id, k) => (onFloor.get(`${id}:${k}`) || []).some((r) => !r.place);
const pickOne = (ids, p, k) => { const free = ids.filter((id) => hasFree(id, k)), pool = free.length ? free : ids; return pool[hash(p.id) % pool.length]; };
// the building nearest to the place's number on the 1992 map
function pinBuilding(p, k) {
  if (p.map_pin == null || !book.overlay.markers[p.map_pin]) return null;
  const at = pinAt(book.overlay.markers[p.map_pin]);
  const cands = (p.candidate_buildings || []).filter((id) => usable(id, k));
  const b = cands.length ? nearestTo(at, k, cands) : nearestTo(at, k);
  return b != null ? { b, how: 'map' } : null;
}
// lanes that the model does not know, but that a source puts next to an address
// (B24/114: "Blk. C. 5/F. 3. Cheung On Lane" shares one 5/F with the rear block of Shing Hing
// Bldg, 31B Tung Tau Tsuen Rd): the nearest building behind the address building, off the street
const LANE_NEAR = { 'Cheung On Lane': { street: 'ttt', num: '31B', name: '31B Tung Tau Tsuen Rd' } };
function laneNear(p, k) {
  const at = LANE_NEAR[p.street];
  const m = at && ADDR.resolve(at.street, at.num, 0);
  if (!m) return null;
  const b0 = S.list[m.b], front = new Set((L.frontage[at.street] || []).map((q) => S.ofPlot[q]));
  const ids = S.list.filter((b) => !front.has(b.id) && usable(b.id, k) && Math.hypot(b.cx - b0.cx, b.cz - b0.cz) < 25).map((b) => b.id);
  const b = nearestTo({ x: b0.cx, z: b0.cz }, k, ids);
  return b != null ? { b, how: 'clue', note: `behind ${at.name} (building ${b0.id}, route map)` } : null;
}
// building of a place: { b, how } or null
function findBuilding(p, k) {
  const lane = laneNear(p, k);
  if (lane) return lane;
  let key = streetKey(p.street), byClue = false;
  if (!key && !p.street) { key = textStreet(`${p.clue || ''} ${p.name || ''}`); byClue = !!key; }
  const n = num(p.num), along = byClue ? 'clue' : 'street';
  if (key && L.addr[key] && n != null) {
    const lane = key !== p.street; // a numbered lane: only the street is known
    const P = locate(L, key, n, k);
    const b = P ? S.ofPlot[P.id] : null;
    if (usable(b, k)) return { b, how: lane ? 'street' : 'address' };
  }
  const pinned = pinBuilding(p, k);
  if (pinned) return pinned;
  const cands = (p.candidate_buildings || []).filter((id) => usable(id, k));
  if (cands.length) return { b: cands[0], how: 'clue' };
  if (key === 'east') {
    const ids = EAST_ROW.filter((id) => usable(id, k));
    if (ids.length) return { b: pickOne(ids, p, k), how: along };
  }
  if (key && L.addr[key]) {
    const ids = [...new Set(L.addr[key].F.map((q) => S.ofPlot[q]))].filter((id) => usable(id, k));
    if (ids.length) return { b: pickOne(ids, p, k), how: along };
  }
  if (key && STREET_LABEL[key]) {
    const [i, j] = STREET_LABEL[key], at = pinAt([i, j]);
    const ids = S.list.map((b) => b.id).filter((id) => usable(id, k))
      .sort((a, c) => Math.hypot(S.list[a].cx - at.x, S.list[a].cz - at.z) - Math.hypot(S.list[c].cx - at.x, S.list[c].cz - at.z))
      .slice(0, 6);
    if (ids.length) return { b: pickOne(ids, p, k), how: along };
  }
  return null;
}
// the floor of a place with no floor in its source: a home, or a clue such as 'upper floor': a
// floor above G/F (null); else a floor from the GRS premises of the same category (a weighted pick)
const grsFloors = {};
for (const q of biz.premises) {
  const c = TRADE_CAT[q.trade];
  if (c && q.floor != null) (grsFloors[c] ??= [0, 0, 0, 0, 0])[Math.min(4, Math.max(0, q.floor))] += 1;
}
const defaultFloor = (p) => {
  if (p.cat === 'home' || /upper floor|high floor|upstairs/i.test(`${p.clue || ''} ${p.name || ''}`)) return null;
  const h = grsFloors[p.cat];
  if (!h) return 0;
  let x = hash(p.id + ':floor') % h.reduce((a, b) => a + b, 0);
  for (let l = 0; l < 5; l++) { if (x < h[l]) return l; x -= h[l]; }
  return 0;
};

// ---- the documented places ----
const places = [];
const refPlace = new Map(); // GRS ref -> place
const facts = research.facts.filter((f) => !f.drop);
const corrections = new Map(facts.filter((f) => f.corrects).map((f) => [f.corrects, f]));
for (const q of biz.premises) {
  const ref = q.refs[0];
  const fix = q.refs.map((r) => corrections.get(r)).find(Boolean);
  const cat = fix?.cat || TRADE_CAT[q.trade] || 'shop';
  const p = {
    id: `grs:${ref}`, name: fix?.name || (q.nameEn && q.nameEn !== 'KWC' ? q.nameEn : null) || q.nameZh || q.title.slice(0, 60), nameZh: q.nameZh,
    use: fix?.use || (q.trade ? TRADE_LABEL[q.trade] || q.trade : 'business premises (trade not in the title)'), cat,
    basis: q.trade || fix ? (q.floor != null && q.num != null ? 'verified' : 'likely') : 'guess',
    street: fix ? fix.street : q.street, num: fix ? fix.num : q.numText, floor: fix ? fix.floor : q.floor,
    candidate_buildings: [], map_pin: null, unit_clue: /rear/i.test(q.title) ? 'rear' : /front/i.test(q.title) ? 'front' : null,
    grs: !fix || (fix.street === q.street && num(fix.num) === q.num && fix.floor === q.floor) ? q.refs : null,
    sources: [{ source: 'GRS catalogue, HKRS1255-3 (clearance compensation files)', cite: q.refs.join(', '), quote: q.title, date: q.dates, type: 'catalogue (1987-1992)' }],
  };
  if (fix) p.sources.push({ source: fix.source, cite: fix.cite, quote: fix.quote, date: fix.date, type: fix.source_type, note: fix.model_conflict });
  places.push(p);
  for (const r of q.refs) refPlace.set(r, p);
}
const byId = new Map(places.map((p) => [p.id, p]));
for (const f of [...facts.filter((x) => !x.same_as), ...facts.filter((x) => x.same_as)]) {
  if (f.kind !== 'place' || f.corrects || !f.in_period || !CAT.has(f.cat)) continue;
  const src = { source: f.source, cite: f.cite, quote: f.quote, date: f.date, type: f.source_type };
  const same = f.same_as && (byId.get(f.same_as) || refPlace.get(f.same_as.replace(/^grs:/, '')));
  if (same) { same.sources.push(src); if (BASIS_RANK[f.basis] < BASIS_RANK[same.basis]) same.basis = f.basis; continue; }
  const p = {
    id: f.id, name: f.name, nameZh: f.nameZh, use: f.use, cat: f.cat, basis: f.basis,
    street: f.street, num: f.num, floor: f.floor, map_pin: f.map_pin, unit_clue: f.unit_clue,
    candidate_buildings: f.candidate_buildings || [], clue: f.location_clue, sources: [src],
  };
  places.push(p); byId.set(p.id, p);
}
// GRS premises that the research marks as the same room as another place, or as outside the period
const grsDropped = [];
for (const [id, g] of Object.entries(research.grs_fixes || {})) {
  const p = byId.get(id);
  if (!p) continue;
  const target = g.same_as && byId.get(g.same_as);
  if (target) { target.sources.push(...p.sources); if (BASIS_RANK[p.basis] < BASIS_RANK[target.basis]) target.basis = p.basis; }
  else if (!g.drop) continue;
  places.splice(places.indexOf(p), 1); byId.delete(id);
  for (const r of p.grs || []) if (refPlace.get(r) === p) refPlace.set(r, target || null);
  grsDropped.push({ id, name: p.name, same_as: g.same_as, drop: g.drop, why: g.why });
}

// ---- place each documented place in a unit ----
const unitScore = (r, p) => {
  let s = 0;
  if (FRONT.has(p.cat)) s += (r.k === 0 && r.front ? 6 : 0) + (r.kind === 'shop' ? 1 : 0);
  if (FACTORY.has(p.cat)) s += (r.kind === 'factory' ? 6 : 0) + (r.kind === 'hall' ? 2 : 0) + r.area / 60;
  if (HALL.has(p.cat)) s += (r.kind === 'hall' ? 6 : 0) + r.area / 30;
  if (p.cat === 'home') s += r.kind === 'flat' || r.kind === 'roofroom' ? 4 : r.kind === 'room' ? 2 : 0;
  if (p.cat === 'storage') s += r.kind === 'room' ? 3 : 0;
  if (p.unit_clue && /rear|back|inner/i.test(p.unit_clue)) s += r.front ? -3 : 3;
  if (p.unit_clue && /front/i.test(p.unit_clue)) s += r.front ? 3 : -1;
  return s + r.area / 1000;
};
const unplaced = [];
const grsAt = new Map(); // GRS ref -> the building and floor where the layout put the premises
L.buildings.forEach((P, q) => {
  for (const [f, list] of Object.entries(P.prem || {})) for (const x of list) for (const r of x.refs || []) grsAt.set(r, { b: S.ofPlot[q], k: +f });
});
// The rooms of one documented flat (a drawn plan) are parts of the flat: they share its unit.
const PART_OF = { M75: 'M74', M76: 'M74', M77: 'M74', M78: 'M74', M79: 'M74', M80: 'M74', M81: 'M74' };
const order = [...places].sort((a, b) => BASIS_RANK[a.basis] - BASIS_RANK[b.basis] || (a.floor == null) - (b.floor == null)
  || !!PART_OF[a.id] - !!PART_OF[b.id]);
for (const p of order) {
  const whole = PART_OF[p.id] && byId.get(PART_OF[p.id]);
  if (whole) {
    if (whole.at) { p.at = whole.at; p.how = `part of ${whole.id}`; } else unplaced.push(p);
    continue;
  }
  allowYamen = HALL.has(p.cat) || p.cat === 'clinic';
  const k0 = p.floor != null ? Math.max(0, p.floor) : defaultFloor(p); // a basement: G/F (the model has none)
  let k = k0 ?? 1, found = null;
  // the map first: the building that Suenn Ho's route maps give for the house number (a numbered
  // lane is not on the map: only its street is known)
  const key0 = streetKey(p.street);
  if (key0 && key0 === p.street && p.num != null) {
    const m = ADDR.resolve(key0, p.num, k);
    if (m && !m.low && usable(m.b, k)) found = { b: m.b, how: m.how };
    else if (m && m.low && k0 != null) {
      if (p.basis === 'verified') tooLow.push({ id: p.id, b: m.b, floor: k, n: storeys(m.b) });
      found = null; // the next steps find the nearest taller building
      const b0 = S.list[m.b], ids = S.list.filter((b) => usable(b.id, k)).map((b) => b.id);
      const b = nearestTo({ x: b0.cx, z: b0.cz }, k, ids);
      if (b != null) found = { b, how: m.how + ', taller building', note: `the map's building for this address has ${b0.n} storeys in the model` };
    }
  }
  // else its number on the 1992 map: nearer than the layout's house-number order. The 1992 map
  // marks the place itself: if the route map's building is more than 25 m from it, the 1992 map wins.
  const pinned = pinBuilding(p, k);
  if (found && pinned && found.b !== pinned.b) {
    const a = S.list[found.b], at = pinAt(book.overlay.markers[p.map_pin]), d = Math.hypot(a.cx - at.x, a.cz - at.z);
    if (d > 25) found = { ...pinned, note: `the route map gives building ${a.id}, ${Math.round(d)} m from this place on the 1992 map` };
  }
  if (!found) found = pinned;
  if (!found && p.grs) {
    const g = p.grs.map((r) => grsAt.get(r)).find(Boolean);
    if (g && usable(g.b, g.k)) { k = g.k; found = { b: g.b, how: 'address' }; }
  }
  if (!found) found = findBuilding(p, k);
  if (!found && k0 != null) { // the building at the address is too low: the nearest taller one on the street
    const lower = findBuilding({ ...p, floor: 0 }, 0);
    if (lower) {
      const b0 = S.list[lower.b], ids = S.list.filter((b) => usable(b.id, k)).map((b) => b.id);
      const b = nearestTo({ x: b0.cx, z: b0.cz }, k, ids);
      if (b != null) found = { b, how: lower.how, note: `the model's building at this place has only ${b0.n} storeys` };
    }
  }
  if (!found) { unplaced.push(p); continue; }
  if (k0 == null) k = 1 + (hash(p.id) % Math.max(1, S.list[found.b].n - 1)); // a home with no floor
  // no free unit on that floor (or no unit: an open G/F): a verified place stays in its building
  // and shares a unit (the source gives its address; the model's rooms are not sourced). Any
  // other place goes to the nearest building within 30 m that has a free unit, the same street
  // first.
  const freeAt = (id) => (onFloor.get(`${id}:${k}`) || []).filter((r) => !r.place);
  let bu = found.b, moved = false;
  const noUnit = !(onFloor.get(`${bu}:${k}`) || []).length; // the model's floor has no room here (an open G/F)
  if (!freeAt(bu).length && (p.basis !== 'verified' || noUnit)) {
    const b0 = S.list[found.b], key = streetKey(p.street);
    const street = new Set(key && L.addr[key] ? L.addr[key].F.map((q) => S.ofPlot[q]) : []);
    const near = S.list.filter((b) => b.id !== b0.id && usable(b.id, k) && freeAt(b.id).length)
      .map((b) => [b.id, Math.hypot(b.cx - b0.cx, b.cz - b0.cz) - (street.has(b.id) ? 10 : 0)])
      .filter(([, d]) => d < 30).sort((x, y) => x[1] - y[1]);
    if (near.length) { bu = near[0][0]; moved = true; }
  } else if (!freeAt(bu).length && p.basis === 'verified') {
    // A model building often stands for several lots of the map, thus it has fewer rooms on a floor
    // than the premises there: the next building on the same street frontage (centres within 12 m)
    // that has a free unit, else the place shares a unit.
    const b0 = S.list[found.b], key = streetKey(p.street);
    const street = new Set(key && L.frontage[key] ? L.frontage[key].map((q) => S.ofPlot[q]) : []);
    const near = S.list.filter((b) => b.id !== b0.id && street.has(b.id) && usable(b.id, k) && freeAt(b.id).length)
      .map((b) => [b.id, Math.hypot(b.cx - b0.cx, b.cz - b0.cz)]).filter(([, d]) => d <= 12).sort((x, y) => x[1] - y[1]);
    if (near.length) { bu = near[0][0]; moved = true; }
  }
  const free = freeAt(bu), all = onFloor.get(`${bu}:${k}`) || [];
  const pick = (list) => [...list].sort((a, c) => unitScore(c, p) - unitScore(a, p) || a.u - c.u)[0];
  const r = free.length ? pick(free) : pick(all);
  if (!r) { unplaced.push(p); continue; }
  p.at = [[r.b, r.k, r.u]];
  p.how = found.how + (moved ? ', next building' : '') + (free.length ? '' : ', shares a unit');
  if (found.note) p.note = found.note;
  if (moved && noUnit) p.note = [p.note, `the model's building at this address has no room on ${k ? k + '/F' : 'G/F'}`].filter(Boolean).join('; ');
  if (!r.place) { r.place = p.id; r.cat = p.cat; r.basis = p.basis; }
}

// ---- guesses: the counts of the sources ----
// A check (not a constraint): Suenn Ho's drawing of the factories and other non-residential units
// by level, 1991-92 (p139; about +/-20 %): G/F 350-450 and M/F about 50 (the M/F rooms belong to
// G/F units here), 1/F about 160, 2/F about 110, 3/F about 70; she draws no level above 3/F.
// Above 3/F: the 40 GRS premises on 4/F-12/F.
const LEVEL = { 0: 400, 1: 160, 2: 110, 3: 70, 4: 40 }; // 4 = 4/F and up
const band = (k) => Math.min(k, 4);
// Trades: dentists 86 in 1987 (p36); clinics 60 (p187); medicine shops and herbalists about 15
// (7 GRS + the herbal doctors of the book); the other trades: the Kai Fong count of 1983 (WSJ:
// plastics 93, shops 77, metal 56, garment 44 + textile 30, manufacturing 41, meat 35 + cake 33,
// others 50; the others in the shares of the GRS offices, eating houses, services and store rooms).
// The counts are not scaled: the Kai Fong survey (745 premises, 1983) and Suenn Ho's levels
// (about 740 units without the M/F, 1991-92) give about the same total.
const KAIFONG = { plastics: 93, shop: 77, metal: 56, garment: 74, works: 41, foodfac: 68 };
const OTHER = { office: 37, eating: 17, services: 4, storage: 2 }, otherAll = 50;
const otherSum = Object.values(OTHER).reduce((a, b) => a + b, 0);
const target = { dentist: 86, clinic: 60, medicine: 15, ...KAIFONG };
for (const [c, v] of Object.entries(OTHER)) target[c] = Math.round((otherAll * v) / otherSum);
// documented places count against the totals
const documented = {}, docLevel = [0, 0, 0, 0, 0];
for (const r of units) if (r.place && r.cat !== 'home') {
  documented[r.cat] = (documented[r.cat] || 0) + 1;
  docLevel[band(r.k)] += 1;
}
const need = {};
for (const c of Object.keys(target)) need[c] = Math.max(0, target[c] - (documented[c] || 0));
// the floors of the guesses: the floor spread of the GRS premises of the same category (all GRS
// premises if the category has fewer than 10), times the gap of each level to Suenn Ho's count,
// rounded by largest remainder
const grsAll = [0, 0, 0, 0, 0];
for (const h of Object.values(grsFloors)) h.forEach((v, l) => (grsAll[l] += v));
const quota = {}; // category -> [count per level band]
// Each level takes guesses in the share of its gap to Suenn Ho's count (LEVEL): the documented
// places fill G/F more than the upper floors (the sources show more G/F rooms).
const gap = [0, 1, 2, 3, 4].map((l) => Math.max(0.05, (LEVEL[l] - docLevel[l]) / LEVEL[l]));
for (const c of Object.keys(need)) {
  if (!need[c]) continue;
  const h0 = grsFloors[c] && grsFloors[c].reduce((a, b) => a + b, 0) >= 10 ? grsFloors[c] : grsAll;
  const h = h0.map((v, l) => v * gap[l]);
  const sum = h.reduce((a, b) => a + b, 0), row = h.map((v) => (v * need[c]) / sum), fl = row.map(Math.floor);
  const left = need[c] - fl.reduce((a, b) => a + b, 0);
  row.map((v, l) => [v - fl[l], l]).sort((a, b) => b[0] - a[0]).slice(0, left).forEach(([, l]) => fl[l]++);
  quota[c] = fl;
}
// where each trade is more likely (from the sources)
const edge = new Set(['ttt', 'lcr', 'lsr'].flatMap((s) => (L.addr[s]?.F || []).map((q) => S.ofPlot[q])));
const foodStreets = new Set(['tcs', 'kms'].flatMap((s) => (L.addr[s]?.F || []).map((q) => S.ofPlot[q])));
const xs = S.list.map((b) => b.cx).sort((a, b) => a - b), west = xs[Math.floor(xs.length * 0.25)];
const eastRow = new Set(EAST_ROW);
const guessWeight = (r, c) => {
  const b = S.list[r.b];
  if (b.kind === 'yamen' || r.kind === 'roofroom') return 0;
  let w = 1;
  if (r.k === 0) {
    if (FRONT.has(c)) w = r.front ? 6 : r.kind === 'shop' ? 1.5 : 0.5;
    else if (FACTORY.has(c)) w = r.front ? 2 : 3;
    else if (c === 'storage') w = r.front ? 0.5 : 3;
  } else {
    if (FACTORY.has(c)) w = r.kind === 'factory' ? 12 : r.kind === 'flat' ? 1 : 0.5;
    else if (c === 'storage') w = r.kind === 'room' ? 3 : 1;
    else w = r.kind === 'room' ? 0.7 : 1;
  }
  if ((c === 'dentist' || c === 'clinic' || c === 'medicine') && edge.has(r.b)) w *= 4; // pp36, 243; GRS
  if ((c === 'dentist' || c === 'eating') && eastRow.has(r.b)) w *= 4; // p32
  if (c === 'foodfac' && foodStreets.has(r.b)) w *= 2; // pp110, 290
  if (FACTORY.has(c) && b.cx < west) w *= 0.5; // p12: fewer factories on the west side
  return w;
};
const rng = mulberry32(19861201);
const pickWeighted = (list, wf) => {
  let sum = 0; const ws = list.map((r) => { const w = wf(r); sum += w; return w; });
  if (sum <= 0) return -1;
  let x = rng() * sum;
  for (let i = 0; i < list.length; i++) { x -= ws[i]; if (x <= 0 && ws[i] > 0) return i; }
  return ws.findLastIndex((w) => w > 0);
};
// factory categories first (they need the factory floors), then the rest; large quotas first
const fillOrder = Object.keys(quota).sort((a, b) => (FACTORY.has(b) - FACTORY.has(a)) || a.localeCompare(b));
const shortfall = {};
for (let l = 0; l < 5; l++)
  for (const c of fillOrder) {
    const pool = units.filter((r) => !r.cat && band(r.k) === l);
    for (let i = 0; i < quota[c][l]; i++) {
      const j = pickWeighted(pool, (r) => guessWeight(r, c));
      if (j < 0) { shortfall[c] = (shortfall[c] || 0) + quota[c][l] - i; break; }
      const r = pool[j]; pool.splice(j, 1);
      r.cat = c; r.basis = 'guess';
    }
  }
// A factory unit of the model (an inference from the building form) that the counts do not fill is
// a home: the factory totals come from the sources, not from the unit kinds.
allowYamen = false;
// the Yamen halls with no documented use: the old people's centre that used them (book.json)
for (const r of units) if (!r.cat && S.list[r.b].kind === 'yamen') { r.cat = 'community'; r.basis = 'guess'; }
for (const r of units) if (!r.cat) { r.cat = 'home'; r.basis = 'guess'; } // all other units: flats

// ---- write ----
const count = (f) => { const m = {}; for (const r of units) { const k = f(r); m[k] = (m[k] || 0) + 1; } return m; };
const byCat = count((r) => r.cat), byBasis = count((r) => r.basis);
const placedCount = places.filter((p) => p.at).length;
const out = {
  about: 'The use of each room (unit) of the definitive 3D structure of Kowloon Walled City in December 1986: a mask over the frozen structure. '
    + 'Made by tools/build_room_uses.mjs from data/businesses.json and data/room_research.json; see docs/rooms.md. Do not edit by hand.',
  period: 'December 1986',
  structure: cityFingerprint(S),
  key: 'A unit is [b, k, u]: building id (S.list), floor k (0 = G/F; k = n is the roof room), unit id on that floor (phaseOf(k).plan.units); the key "b:k:u" of S.unitNode.',
  basis: {
    verified: 'a source gives the street, the house number and the floor (or a named building and floor, or a drawn plan of the room). The building is the model\'s building at that address, which is APPROXIMATE (house-number order along the street), and the unit on that floor is the best fit',
    likely: 'a source gives the use and part of the place: the street, a number on the 1992 map, no floor',
    guess: 'the use is from the counts of the sources (by category and by level), or the use or the place is uncertain',
  },
  categories: CATEGORIES.map((c) => ({ ...c, units: byCat[c.id] || 0 })),
  counts: { units: units.length, basis: byBasis, places: places.length, placed: placedCount, unplaced: unplaced.length, targets: target, level: LEVEL, shortfall },
  places: places.filter((p) => p.at).map((p) => ({
    id: p.id, ...named(p), use: p.use, cat: p.cat, basis: p.basis,
    address: [p.num, p.street].filter((v) => v != null && v !== '').join(' ') || undefined, floor: p.floor ?? undefined,
    map_pin: p.map_pin ?? undefined, clue: p.clue || undefined, at: p.at, how: p.how, note: p.note, sources: p.sources,
  })),
  grs_merged_or_dropped: grsDropped,
  unplaced: unplaced.map((p) => ({
    id: p.id, ...named(p), use: p.use, cat: p.cat, basis: p.basis, street: p.street ?? undefined, num: p.num ?? undefined,
    floor: p.floor ?? undefined, clue: p.clue || undefined,
    why: p.street && !streetKey(p.street) ? 'the model does not know this lane' : 'no source gives the street, the building or a map number',
    sources: p.sources,
  })),
  columns: ['b', 'k', 'u', 'cat', 'basis', 'place'],
  units: units.map((r) => [r.b, r.k, r.u, r.cat, r.basis, r.place]),
};
const text = JSON.stringify(out, null, 1).replace(/\[\n\s+(-?\d+),\n\s+(-?\d+),\n\s+(-?\d+),\n\s+("[^"]*"),\n\s+("[^"]*"),\n\s+("[^"]*"|null)\n\s+\]/g, '[$1, $2, $3, $4, $5, $6]')
  .replace(/\[\n\s+(\d+),\n\s+(\d+),\n\s+(\d+)\n\s+\]/g, '[$1, $2, $3]');
writeFileSync(root + 'data/room_uses.json', text + '\n');

// docs/room_places.md: the documented places, by building and floor (generated)
const FL = (k) => (k === 0 ? 'G/F' : `${k}/F`);
const esc = (v) => String(v ?? '').replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
const catLabel = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));
const placed = out.places.slice().sort((a, b) => a.at[0][0] - b.at[0][0] || a.at[0][1] - b.at[0][1] || a.at[0][2] - b.at[0][2]);
const md = [
  '# Documented places in the 3D structure (generated)',
  '',
  'Made by `node tools/build_room_uses.mjs` from `data/room_research.json` and `data/businesses.json`. Do not edit by hand. See `docs/rooms.md` for the method.',
  '',
  `${placed.length} documented places have a unit; ${out.unplaced.length} have no place that the model can use (end of this file). Unit = building:floor:unit (the key of \`S.unitNode\`). "How": address = the model's building at that address (APPROXIMATE: house-number order); street = a building on that street; map = the 1992 map number; clue = a building that fits a clue; next building = the nearest building with a free unit on that floor.`,
  '',
  '| Unit | Building | Floor | Category | Use | Name | Address in the source | Basis | How | Sources |',
  '|---|---|---|---|---|---|---|---|---|---|',
  ...placed.map((p) => {
    const [b, k, u] = p.at[0];
    return `| ${b}:${k}:${u} | ${esc(S.list[b].label)} | ${FL(k)} | ${catLabel[p.cat]} | ${esc(p.use)} | ${esc(p.name)}${p.nameZh && !String(p.name).includes(p.nameZh) ? ` (${esc(p.nameZh)})` : ''} | ${esc([p.address, p.floor != null ? FL(Math.max(0, p.floor)) : '', p.map_pin != null ? 'map ' + p.map_pin : ''].filter(Boolean).join(', '))} | ${p.basis} | ${esc(p.how)}${p.note ? ' (' + esc(p.note) + ')' : ''} | ${esc([...new Set(p.sources.map((x) => x.cite))].join('; '))} |`;
  }),
  '',
  '## Documented places with no unit',
  '',
  'These places existed in the period, but the sources give no place that the model can use (or a lane that the model does not know).',
  '',
  '| Id | Category | Use | Name | Place in the source | Basis | Sources |',
  '|---|---|---|---|---|---|---|',
  ...out.unplaced.map((p) => `| ${p.id} | ${catLabel[p.cat]} | ${esc(p.use)} | ${esc(p.name)}${p.nameZh && !String(p.name).includes(p.nameZh) ? ` (${esc(p.nameZh)})` : ''} | ${esc([p.num, p.street, p.floor != null ? FL(Math.max(0, p.floor)) : ''].filter(Boolean).join(' '))} | ${p.basis} | ${esc(p.sources.map((x) => x.cite).join('; '))} |`),
  '',
];
writeFileSync(root + 'docs/room_places.md', md.join('\n'));
console.log(`${units.length} units: ${JSON.stringify(byBasis)}`);
console.log('by category:', JSON.stringify(byCat));
console.log(`places: ${places.length}, placed ${placedCount}, unplaced ${unplaced.length}; shortfall ${JSON.stringify(shortfall)}`);
console.log('targets:', JSON.stringify(target), 'documented:', JSON.stringify(documented));
const lv = (f) => [0, 1, 2, 3, 4].map((l) => units.filter((r) => band(r.k) === l && r.k < S.list[r.b].n && f(r)).length);
console.log('non-home by level (G/F 1/F 2/F 3/F 4/F+):', lv((r) => r.cat !== 'home').join(' '), '| Suenn Ho:', Object.values(LEVEL).join(' '));
console.log('factories by level:', lv((r) => FACTORY.has(r.cat)).join(' '));
const howCount = {};
for (const p of places) if (p.at && p.basis === 'verified') howCount[p.how] = (howCount[p.how] || 0) + 1;
console.log('verified places by how:', JSON.stringify(howCount));
console.log(`verified places whose map building is lower than their floor: ${tooLow.length}`, tooLow.map((t) => `${t.id} b${t.b} ${t.floor}/F (${t.n} storeys)`).join('; '));
