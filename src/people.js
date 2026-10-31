// Residents and their week, Tue 16 to Mon 22 Dec 1986.
//
// SOURCED: "28,200 occupants residing in 8800 separate apartments" in January 1987
// (City of Darkness Revisited, p340), and "just over 33,000" with the people who worked in
// the City but lived elsewhere (p339): thus about 4,800 come in to work each day. Nine real
// people with their homes and trades, and 16 people of the book at their places
// (residents.js); water hours by floor (林羅平); schoolchildren in "pristine white uniforms"
// (a police officer, 1987); children on the roofs (Albert Ng, 2013). From the book: police on
// the beat (pp251, 283), refuse at 4am (p93), sweepers (p104), meter readers (p98), patients
// from outside on the outer roads (p242), the one standpipe (p108), the kindergarten (p300),
// candy wrapping after school (p77), the Old People's Centre (pp305-306), and the roofs in
// the early evening (p322).
// INFERRED: the share of each role, the number of each kind of visitor, and the hours of
// each day. A 1980s Hong Kong week: work and school six days, Saturday school in the morning
// only, Sunday off for most. 冬至 (Winter Solstice, Mon 22 Dec 1986) is a Hong Kong-wide
// custom: families "做冬" and eat together, and many leave work early. That evening is
// INFERRED for the city's families.
import { STOREY, USE_GROUP, USE_DOING, buildingName, locate } from './layout.js';
import { planAt, unitName } from './floorplan.js';
import { WALK, CLIMB } from './routes.js';
import { mulberry32, clamp, linearRGB, hash2 } from './util.js';
import { REAL, BOOK_PEOPLE } from './residents.js';

const SURNAMES = ['Chan', 'Wong', 'Lee', 'Cheung', 'Lau', 'Ho', 'Ng', 'Leung', 'Lam', 'Tse', 'Yip', 'Kwok', 'Tang', 'Fung', 'Mak', 'Cheng', 'Lo', 'Yeung', 'Chow', 'Kwan', 'Chu', 'Tsang', 'Wu', 'So'];
const GIVEN = ['Ming', 'Wai', 'Kit', 'Fai', 'Ying', 'Mei', 'Hung', 'Keung', 'Lin', 'Chun', 'Sang', 'Yee', 'Kam', 'Wing', 'Yuk', 'Hing', 'Choi', 'Fong', 'Kwai', 'Tak', 'Lai', 'Shing'];

// The shares are INFERRED. Elders: "about a third" of residents were over 60 in about 1990
// (p178); the model gives fewer for 1986. Workshop hands: many came in from outside (p339).
export const ROLES = {
  child: { label: 'young child', share: 0.08, ages: [1, 5] },
  student: { label: 'schoolchild', share: 0.2, ages: [6, 18] },
  worker_out: { label: 'works outside the city', share: 0.23, ages: [17, 60] },
  worker_in: { label: 'factory / workshop hand', share: 0.13, ages: [15, 65] },
  shopkeeper: { label: 'shopkeeper', share: 0.06, ages: [25, 70] },
  homemaker: { label: 'homemaker', share: 0.12, ages: [22, 65] },
  elder: { label: 'elder', share: 0.18, ages: [62, 90] },
};

// People who come in from outside. n: how many; the numbers are INFERRED, but the day
// workers are 33,000 less 28,200 (pp339-340).
export const OUTSIDERS = {
  day_worker: { label: 'workshop hand who lives outside the city', n: 4800, ages: [16, 60] },
  police: { label: 'police constable on the beat (pp251, 283)', n: 6, ages: [22, 45] },
  refuse: { label: 'refuse collector (p93)', n: 3, ages: [25, 60] },
  sweeper: { label: 'street sweeper of the Urban Services Department (p104)', n: 10, ages: [30, 62] },
  meter: { label: 'electricity meter reader (p98)', n: 2, ages: [25, 50] },
  patient: { label: 'patient from outside the city (p242)', n: 300, ages: [6, 85] },
};

// December clothes, sRGB, measured in the photos of City of Darkness Revisited: navy or black
// padded jackets for old people (p306); a white blouse and a navy skirt for schoolgirls
// (p322); vests and yellow or pink tops for small children (pp322-325); singlets in the
// workshops (pp246-247, 290-291); pale shirts and grey trousers; floral pyjama suits (p36);
// quilted vests and cardigans (p30); "Bundled up against the chill of a Hong Kong winter"
// (p293); police in a dark uniform and a peaked cap (pp220, 252). Who wears what is INFERRED.
const WEAR = {
  vest: ['#e4e7de', '#dcdcd2'],
  shirt: ['#e4e7de', '#d9d4c7', '#c8d0d6', '#d6cfc0'],
  trousers: ['#5a5754', '#4a4845', '#6b6762', '#3d3a37', '#454574'],
  jacket: ['#454574', '#36312e', '#5a4a3c', '#3c4a5c'],
  old: ['#454574', '#36312e', '#2f2c33'],
  cardigan: ['#8c5a4a', '#6f7d62', '#7a6a58', '#5d6d7c', '#a0866c', '#9a7b8a'],
  pyjama: ['#e9bea1', '#d88067', '#c9a3b8'],
  kid: ['#d8b54a', '#e9a3b4', '#e4e7de', '#9fb6c2', '#d88067'],
  kidLegs: ['#5d6d7c', '#3d3a37', '#454574', '#8c5a4a'],
  blouse: ['#eef0ea'], skirt: ['#2f3557'],
  police: ['#403430'],
};
const pickHex = (rng, list) => list[Math.floor(rng() * list.length)];

// Days of the week from Tue 16 Dec 1986. Day 6 is 冬至.
export const WEEK = ['TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN', 'MON'];
export const SAT = 4, SUN = 5, DONGZHI = 6;

export function createPopulation(L, total = 28200, seed = 1987) {
  const rng = mulberry32(seed);
  const B = L.buildings;
  const flats = [];
  for (const b of B)
    for (let f = 0; f < b.floors; f++) if (b.uses[f] === 'home') for (let m = 0; m < b.flats; m++) flats.push({ b: b.id, f, m });
  const letter = (b, f, t) => {
    const P = planAt(b, f), u = P && t ? P.units.findIndex((x) => x.letter === t) : -1;
    return u >= 0 ? u : 0;
  };

  const work = [], shops = [], schools = [];
  for (const b of B)
    b.uses.forEach((u, f) => {
      const w = Math.min(b.cells.length, 100); // a big floor holds more, but not without limit
      const g = USE_GROUP[u];
      if (g === 'work') work.push({ b: b.id, f, w, what: u });
      if (g === 'shop') shops.push({ b: b.id, f, w, what: u });
      if (u === 'school') schools.push({ b: b.id, f, w, what: u });
    });
  const pickW = (list) => {
    let t = list.reduce((s, e) => s + e.w, 0) * rng();
    for (const e of list) if ((t -= e.w) <= 0) return e;
    return list[list.length - 1];
  };
  const roleList = Object.entries(ROLES);
  const pickRole = () => {
    let r = rng();
    for (const [k, v] of roleList) if ((r -= v.share) <= 0) return k;
    return 'worker_out';
  };

  // The real people first, at their recorded places where a source gives one.
  const agents = [];
  const homeOf = new Map();
  for (const R of REAL) {
    let home = null;
    const h = R.home;
    if (h && h.street) {
      const b = locate(L, h.street, h.num, h.floor);
      if (b) { const m = letter(b, h.floor, h.unit); home = { type: 'in', b: b.id, f: h.floor, m, ...spotIn(L, b, h.floor, m, rng) }; }
    } else if (h) {
      const c = B.filter((b) => b.kind === 'tenement' && b.floors > h.floor + 1 && b.uses[h.floor] === 'home');
      const b = c[Math.floor(rng() * c.length)];
      home = { type: 'in', b: b.id, f: h.floor, m: 0, ...spotIn(L, b, h.floor, 0, rng) };
    }
    if (!home && homeOf.has(R.key)) home = homeOf.get(R.key);
    const a = {
      id: agents.length, name: R.name, age: R.age, role: R.sched, real: R, home, flat: home ? home.m : 0,
      rng: rng(),
    };
    if (h && h.pair) homeOf.set(h.pair, home);
    if (R.work) {
      const c = B.filter((b) => b.uses[0] === R.work.use && b.floors > 1 && (R.work.near === 'edge' ? b.front !== 'inner' : b.front === 'inner'));
      const b = c[Math.floor(rng() * c.length)] || B.find((x) => x.uses[0] === R.work.use);
      a.work = { type: 'in', b: b.id, f: 0, what: R.work.use, ...spotIn(L, b, 0, -1, rng) };
    }
    agents.push(a);
  }
  // 劉太 shares 劉先生's flat.
  for (const a of agents) if (!a.home) a.home = homeOf.get(a.real.key) || { type: 'away', ap: 0, what: 'outside the city' };
  const taken = new Set(agents.filter((a) => a.home.type === 'in').map((a) => `${a.home.b}:${a.home.f}:${a.home.m}`));

  // The people of City of Darkness Revisited, at their places (layout.js bookPlaces). A
  // home that the book does not give is a flat near the work (INFERRED).
  const nearFlat = (b0) => {
    let best = null, bd = Infinity;
    for (const fl of flats) {
      if (taken.has(`${fl.b}:${fl.f}:${fl.m}`)) continue;
      const d = Math.hypot(B[fl.b].cx - b0.cx, B[fl.b].cz - b0.cz) + rng() * 6;
      if (d < bd) { bd = d; best = fl; }
    }
    return best;
  };
  for (const P of BOOK_PEOPLE) {
    const at = L.book && L.book[P.n], p = L.bookPlaces && L.bookPlaces[P.n];
    if (!at || !p) continue;
    const b = B[at.b];
    let fl = null;
    if (P.home && P.home.above) for (let f = at.f + 1; f < b.floors && !fl; f++) if (b.uses[f] === 'home') fl = { b: b.id, f, m: 0 };
    fl ||= nearFlat(b);
    taken.add(`${fl.b}:${fl.f}:${fl.m}`);
    const facts = [[p.where ? `${p.where}.` : `${p.what}.`, `City of Darkness Revisited, p${p.page}`]];
    facts.push(P.hours ? [`Hours: ${P.hours}.`, `p${P.page || p.page}, about 1990`] : ['Hours not recorded: the model uses the usual hours of the trade.', 'INFERRED']);
    const real = {
      key: `book${P.n}`, book: P.n, name: p.name, role: `${p.what} (City of Darkness Revisited, p${p.page})`, age: null,
      home: { text: P.home ? P.home.text : 'not recorded: the model puts a flat near the work (INFERRED)' },
      household: 3, facts, quotes: [],
    };
    const a = {
      id: agents.length, name: p.name, age: null, role: P.sched || 'book', real, book: P,
      home: { type: 'in', ...fl, ...spotIn(L, B[fl.b], fl.f, fl.m, rng) }, flat: fl.m,
      rng: rng(),
    };
    if (P.roof) {
      const c = b.cells[Math.floor(rng() * b.cells.length)];
      a.work = { type: 'roof', b: b.id, x: L.cellX(c), z: L.cellZ(c) };
    } else a.work = { type: 'in', b: b.id, f: at.f, what: b.uses[at.f], ...spotIn(L, b, at.f, -1, rng) };
    agents.push(a);
  }

  // A real person's flat holds the household that the source gives, and no other. The
  // household of a person of the book is not recorded: three, the mean of the city (p340).
  const realHouses = [];
  for (const a of agents) {
    if (a.home.type !== 'in') continue;
    const n = (a.real.household || 1) - 1;
    const surname = a.real.book ? a.name.split(' ')[0] : SURNAMES[Math.floor(rng() * SURNAMES.length)];
    if (n > 0) realHouses.push({ fl: { b: a.home.b, f: a.home.f, m: a.home.m }, n, surname });
  }
  const free = flats.filter((fl) => !taken.has(`${fl.b}:${fl.f}:${fl.m}`));
  // About 8,800 flats (layout.js): one household to each; a few flats hold two.
  const nHouse = Math.round(free.length * 1.06);
  const homes = [];
  for (let h = 0; h < nHouse; h++) homes.push(h < free.length ? free[h] : free[Math.floor(rng() * free.length)]);
  const left = total - agents.filter((a) => a.home.type === 'in').length - realHouses.reduce((s, h) => s + h.n, 0);
  const mean = left / homes.length;
  const households = homes.map((fl) => ({
    fl,
    n: Math.max(1, Math.round(mean + (rng() - 0.5) * mean * 1.2)),
    surname: SURNAMES[Math.floor(rng() * SURNAMES.length)],
  }));
  // Nudge household sizes so the head count comes out exact.
  let sum = households.reduce((s, h) => s + h.n, 0);
  while (sum !== left) {
    const h = households[Math.floor(rng() * households.length)];
    if (sum < left) { h.n++; sum++; } else if (h.n > 1) { h.n--; sum--; }
  }
  for (const { fl, n, surname } of households.concat(realHouses)) {
    const home = { type: 'in', b: fl.b, f: fl.f, m: fl.m, ...spotIn(L, B[fl.b], fl.f, fl.m, rng) };
    for (let p = 0; p < n; p++) {
      const role = pickRole();
      const [a0, a1] = ROLES[role].ages;
      const a = {
        id: agents.length,
        name: `${surname} ${GIVEN[Math.floor(rng() * GIVEN.length)]}`,
        age: Math.round(a0 + rng() * (a1 - a0)),
        role,
        home,
        flat: fl.m,
        rng: rng(),
      };
      if (role === 'worker_in' && work.length) { const w = pickW(work); a.work = { type: 'in', b: w.b, f: w.f, what: w.what, ...spotIn(L, B[w.b], w.f, -1, rng) }; }
      if (role === 'shopkeeper' && shops.length) { const w = pickW(shops); a.work = { type: 'in', b: w.b, f: w.f, what: w.what, ...spotIn(L, B[w.b], w.f, -1, rng) }; }
      if (role === 'student' && schools.length && rng() < 0.15) { const w = pickW(schools); a.school = { type: 'in', b: w.b, f: w.f, what: 'school', ...spotIn(L, B[w.b], w.f, -1, rng) }; }
      // Some children go to the Salvation Army kindergarten (p300); some schoolchildren wrap
      // candy for the candy factory after school (p77). The shares are INFERRED.
      if (role === 'child' && a.age >= 3 && rng() < 0.1) a.kinder = true;
      if (role === 'student' && a.age >= 8 && a.age <= 15 && rng() < 0.006) a.candy = true;
      agents.push(a);
    }
  }

  // Places that the routines of makeSchedule use.
  const roofs = [];
  for (const t of L.towers) {
    const top = t.blocks.map((id) => B[id]).filter((b) => b.floors >= 4 && b.floors === Math.max(...t.blocks.map((id) => B[id].floors)));
    if (top.length) roofs.push(top[0].id);
  }
  const at = (b, f, m = -1) => ({ type: 'in', b, f, ...spotIn(L, B[b], f, m, rng) });
  L.people = {
    roofs,
    clinics: work.concat(shops).filter((e) => (e.what === 'clinic' || e.what === 'dentist') && B[e.b].front !== 'inner'),
    eating: shops.filter((e) => e.what === 'eating'),
    kinder: L.book && L.book.kindergarten ? L.book.kindergarten : null,
    candy: L.book && L.book[25] ? L.book[25] : null,
    at,
  };

  // People who come in from outside (OUTSIDERS). Each has a home outside, by one way out.
  const BEATS = ['lys', 'kms', 'tcs', 'skg', 'lsr', 'tts', 'tcn', 'lcb'];
  for (const [role, o] of Object.entries(OUTSIDERS)) {
    for (let q = 0; q < o.n; q++) {
      const [a0, a1] = o.ages;
      const a = {
        id: agents.length,
        name: `${SURNAMES[Math.floor(rng() * SURNAMES.length)]} ${GIVEN[Math.floor(rng() * GIVEN.length)]}`,
        age: Math.round(a0 + rng() * (a1 - a0)),
        role,
        home: { type: 'away', ap: Math.floor(rng() * L.away.length), what: role === 'police' ? 'off duty' : 'home, outside the city' },
        flat: 0,
        rng: rng(),
      };
      if (role === 'day_worker') { const w = pickW(work); a.work = at(w.b, w.f); a.work.what = w.what; }
      if (role === 'police') a.shift = q >> 1;
      if (role === 'sweeper') a.street = BEATS[q % BEATS.length];
      agents.push(a);
    }
  }
  for (const a of agents) dress(a, rng);
  return agents;
}

// What someone wears: a top and a bottom colour, a body size (0 child, 1 adult, 2 old, with
// a stoop) and a hat (0 none, 1 a police cap, 2 a flat cap, 3 a navy hat). The people of the book wear
// what their photo shows, if residents.js gives it.
function dress(a, rng) {
  const W = (k) => pickHex(rng, WEAR[k]);
  const workshop = { factory: 1, noodles: 1, textile: 1, plastics: 1, roastmeat: 1, cakes: 1 };
  let top, bottom = W('trousers');
  a.size = a.role === 'elder' || (a.age && a.age >= 66) ? 2 : a.role === 'child' || (a.age && a.age < 12) ? 0 : 1;
  a.hat = 0;
  const look = (a.book && a.book.look) || (a.real && a.real.look);
  if (look) { top = look.top || W('shirt'); bottom = look.bottom || bottom; a.hat = look.hat || 0; }
  else if (a.book) top = workshop[a.book.trade] ? W('vest') : a.book.trade === 'clinic' || a.book.trade === 'dentist' || a.book.trade === 'bonesetter' ? W('shirt') : W('cardigan');
  else switch (a.role) {
    case 'child': top = rng() < 0.4 ? W('cardigan') : W('kid'); bottom = W('kidLegs'); break;
    case 'student':
      if (rng() < 0.7) { if (rng() < 0.5) { top = W('blouse'); bottom = W('skirt'); } else { top = W('shirt'); bottom = rng() < 0.5 ? '#2f3557' : W('trousers'); } }
      else { top = rng() < 0.5 ? W('cardigan') : W('kid'); bottom = W('kidLegs'); }
      break;
    case 'elder': top = rng() < 0.75 ? W('old') : W('cardigan'); bottom = W('old'); break;
    case 'homemaker': case 'market':
      if (rng() < 0.35) { top = W('pyjama'); bottom = top; } else top = W('cardigan');
      break;
    case 'worker_in': case 'day_worker': case 'fishball': top = rng() < 0.45 ? W('vest') : rng() < 0.5 ? W('cardigan') : W('jacket'); break;
    case 'shopkeeper': case 'store': top = rng() < 0.6 ? W('cardigan') : W('shirt'); break;
    case 'police': top = bottom = W('police'); a.hat = 1; break;
    default: top = rng() < 0.5 ? W('jacket') : W('shirt');
  }
  a.color = linearRGB(top);
  a.bottom = linearRGB(bottom);
}

// What someone carries, by what they do: flour sacks (pp246, 248), buckets at the standpipe
// (p108) and the sweepers' buckets (p104), baskets to the market and for the refuse (p93),
// LP gas cylinders (p179) and the postman's bag (p144). 0 is nothing.
export const PROPS = { none: 0, sack: 1, bucket: 2, basket: 3, gas: 4, mailbag: 5, sweeper: 6 };
function propFor(a) {
  const t = a.act || '';
  if (a.role === 'postman') return PROPS.mailbag;
  if (a.role === 'sweeper') return PROPS.sweeper;
  if (a.role === 'refuse' || t.includes('market') || t.includes('buying food') || t === 'shopping') return PROPS.basket;
  if (t.includes('standpipe')) return PROPS.bucket;
  if ((t.includes('noodles') || t === USE_DOING.foodfac || t.includes('candy')) && a.rng < 0.25) return PROPS.sack;
  if (t === USE_DOING.shop && a.rng < 0.03) return PROPS.gas;
  return PROPS.none;
}

// How someone holds themselves while they stay (figures.js): 0 stand, 1 sit, 2 sit at work
// (a machine, a desk, a table of mahjong), 3 lie, 4 work standing, 5 exercise or wave the
// pigeons in, 6 squat. INFERRED from what they do.
export const POSE = { stand: 0, sit: 1, desk: 2, lie: 3, work: 4, exercise: 5, squat: 6 };
const SIT_WORK = /sewing|office|tuition|homework|map|candy|rush order|mahjong|accounts|kindergarten|clinic|school/;
const STAND_WORK = /cooking|housework|workshop|metal works|food workshop|noodles|minding|eating house|ping pong|laundry|water|fishballs|sweeping|refuse|feeding|dentist/;
const SIT = /breakfast|lunch|dinner|supper|tea|TV|resting|worship|a break/;
function poseFor(a) {
  const t = a.act || '';
  if (t === 'asleep') return POSE.lie;
  if (/exercise|flying the pigeons|calling the pigeons/.test(t)) return POSE.exercise;
  if (SIT_WORK.test(t)) return POSE.desk;
  if (STAND_WORK.test(t)) return POSE.work;
  if (SIT.test(t)) return POSE.sit;
  // At home or out on a roof: some sit on a stool, some squat, the rest stand.
  const r = hash2(a.id, t.length);
  if (a.size === 0 && r < 0.35) return POSE.squat;
  if (a.size === 2 || r < 0.5) return POSE.sit;
  return POSE.stand;
}

// A spot inside a block at storey f: in unit m of its floor plan; in any unit if m is -1;
// in the corridor if m is -3.
function spotIn(L, b, f, m, rng) {
  let cells = b.cells;
  const P = planAt(b, f);
  if (P) {
    if (m >= 0 && P.units[m]) cells = P.units[m].cells;
    else if (m === -1) cells = P.units[Math.floor(rng() * P.units.length)].cells;
    else if (m === -3) {
      const hall = b.cells.filter((k, i) => P.cell[i] === -1);
      if (hall.length) cells = hall;
    }
  }
  const c = cells[Math.floor(rng() * cells.length)];
  return { x: L.cellX(c) + (rng() - 0.5) * 0.6, z: L.cellZ(c) + (rng() - 0.5) * 0.6 };
}

// A spot in a lane, on the ground. With a street key, in that street's lane.
function laneSpot(L, rng, street) {
  const list = street && L.streetLanes[street] && L.streetLanes[street].length ? L.streetLanes[street] : null;
  let k;
  if (list) k = list[Math.floor(rng() * list.length)];
  else {
    for (let t = 0; t < 200; t++) {
      k = Math.floor(rng() * L.N);
      if (L.inside[k] && L.alley[k] === 1) break;
    }
  }
  return { type: 'ground', k, street: list ? street : null, x: L.cellX(k) + (rng() - 0.5) * 0.5, z: L.cellZ(k) + (rng() - 0.5) * 0.5 };
}

function makeSchedule(a, L, rng, dow) {
  const S = [];
  const at = (t, place, act) => S.push([clamp(t, 1, 1435), place, act]);
  const H = (h, m = 0) => h * 60 + m;
  const J = (base, spread) => base + (rng() - 0.5) * 2 * spread;
  const home = a.home, B = L.buildings;
  const away = (what) => ({ type: 'away', ap: Math.floor(rng() * L.away.length), what });
  const roof = () => ({ type: 'roof', b: home.b, x: home.x, z: home.z });
  const yamen = () => {
    const c = L.yard[Math.floor(rng() * L.yard.length)];
    return { type: 'in', b: L.yamenId, f: 0, x: L.cellX(c) + (rng() - 0.5) * 0.8, z: L.cellZ(c) + (rng() - 0.5) * 0.8 };
  };
  const sat = dow === SAT, sun = dow === SUN, dz = dow === DONGZHI;
  const PL = L.people;
  const pick = (list) => list[Math.floor(rng() * list.length)];
  // The one Government standpipe inside the city, on Tai Chang Street (p108).
  const standpipe = () => L.standpipe && { type: 'ground', k: L.standpipe.k, street: 'tcs', x: L.standpipe.x + (rng() - 0.5) * 1.2, z: L.standpipe.z + (rng() - 0.5) * 1.2 };
  const roofOf = (r, b = B[pick(PL.roofs)]) => {
    const c = b.cells[Math.floor(r() * b.cells.length)];
    return { type: 'roof', b: b.id, x: L.cellX(c) + (r() - 0.5) * 0.6, z: L.cellZ(c) + (r() - 0.5) * 0.6 };
  };
  const DZ = '冬至 dinner with the family (做冬)';
  // On 冬至 the family is home for dinner, and stays in.
  const dongzhi = (t = 18.25) => { at(J(H(Math.floor(t), (t % 1) * 60), 20), home, DZ); at(J(H(22, 40), 30), home, 'asleep'); };
  at(0, home, 'asleep');
  switch (a.role) {
    case 'child': {
      // The Salvation Army kindergarten on Lung Chun Back Road (p300); the hours are INFERRED.
      if (a.kinder && PL.kinder && !sat && !sun) {
        at(J(H(7, 0), 30), home, 'breakfast');
        at(J(H(8, 40), 10), PL.at(PL.kinder.b, PL.kinder.f), 'at the Salvation Army kindergarten (p300)');
        at(J(H(12, 5), 10), home, 'lunch at home');
      } else at(J(H(7, 0), 30), home, 'at home');
      if (dz) { dongzhi(); break; }
      at(J(H(20, 30), 30), home, 'asleep');
      break;
    }
    case 'student': {
      if (sun) {
        at(J(H(8, 0), 40), home, 'Sunday at home');
        const r = rng();
        if (r < 0.35) { at(J(H(10, 0), 60), roof(), 'playing on the roofs'); at(J(H(12, 30), 30), home, 'lunch'); }
        else if (r < 0.6) { at(J(H(9, 45), 30), away('out with the family'), 'out with the family'); at(J(H(14, 0), 60), home, 'home'); }
        if (rng() < 0.4) { at(J(H(15, 0), 40), roof(), 'flying a kite from the roof'); at(J(H(17, 30), 20), home, 'dinner'); }
        at(J(H(21, 45), 30), home, 'asleep');
        break;
      }
      at(J(H(6, 40), 20), home, 'getting ready for school');
      // Children wrap the candy of the candy factory after school (p77); the wrapping goes on
      // to 9pm (p76). The days and hours of a child are INFERRED.
      const candy = () => {
        if (!a.candy || !PL.candy || dz || (dow + a.id) % 3 === 0) return false;
        at(J(H(16, 50), 10), PL.at(PL.candy.b, PL.candy.f), 'wrapping candy for the candy factory (p77)');
        at(J(H(19, 30), 20), home, 'dinner');
        return true;
      };
      const school = a.school || away('at school');
      if (sat) {
        at(J(H(7, 35), 15), school, 'at school (Saturday morning)');
        at(J(H(12, 40), 15), home, 'lunch at home');
        if (rng() < 0.55) { at(J(H(14, 0), 40), roof(), 'playing on the roofs'); at(J(H(17, 50), 20), home, 'dinner'); }
      } else if (a.age < 12 && a.rng < 0.5) {
        at(J(H(7, 25), 15), school, 'at school (morning session)');
        at(J(H(12, 50), 15), home, 'lunch at home');
        if (candy()) { /* wrapping candy */ } else if (rng() < 0.45) { at(J(H(15, 45), 30), roof(), 'playing on the roofs'); at(J(H(17, 15), 20), home, 'homework'); }
      } else if (a.age < 12) {
        if (rng() < 0.4) { at(J(H(9, 30), 30), roof(), 'playing on the roofs'); at(J(H(11, 15), 15), home, 'lunch'); }
        at(J(H(12, 30), 10), school, 'at school (afternoon session)');
        at(J(H(dz ? 17 : 18, 25), 10), home, dz ? 'home for 冬至' : 'dinner');
      } else {
        at(J(H(7, 30), 15), school, 'at secondary school');
        at(J(H(16, 30), 10), home, 'homework');
        if (candy()) { /* wrapping candy */ } else if (!dz && rng() < 0.3) { at(J(H(17, 0), 10), roof(), 'on the roofs'); at(J(H(18, 30), 15), home, 'dinner'); }
      }
      if (dz) dongzhi(18.4); else at(J(H(21, 45), 30), home, 'asleep');
      break;
    }
    case 'worker_out': {
      if (sun && rng() < 0.85) {
        at(J(H(8, 0), 40), home, 'Sunday at home');
        if (rng() < 0.45) { at(J(H(9, 30), 40), away('out with the family'), 'out with the family'); at(J(H(13, 30), 60), home, 'home'); }
        at(J(H(23, 0), 30), home, 'asleep');
        break;
      }
      at(J(H(6, 15), 25), home, 'breakfast');
      at(J(H(7, 30), 40), away('at work outside the city'), 'at work outside the city');
      if (dz) { at(J(H(17, 40), 30), home, 'home early for 冬至'); dongzhi(); break; }
      if (sat && rng() < 0.5) at(J(H(13, 45), 30), home, 'home after a half day');
      else at(J(H(19, 15), 50), home, 'dinner');
      if (rng() < 0.1) { at(J(H(20, 45), 15), away('out for the evening'), 'out for the evening'); at(J(H(22, 50), 20), home, 'home late'); }
      at(J(H(23, 20), 15), home, 'asleep');
      break;
    }
    case 'worker_in': {
      if (sun && rng() < 0.75) {
        at(J(H(8, 0), 40), home, 'Sunday at home');
        if (rng() < 0.4) { at(J(H(9, 30), 40), away('out with the family'), 'out with the family'); at(J(H(13, 30), 60), home, 'home'); }
        at(J(H(23, 0), 30), home, 'asleep');
        break;
      }
      const w = a.work || away('at work');
      const what = USE_DOING[w.what] || 'at work';
      at(J(H(5, 0), 30), home, 'getting up');
      at(J(H(5, 45), 30), w, what);
      if (rng() < 0.4) { at(J(H(12, 10), 8), home, 'lunch at home'); at(J(H(13, 0), 8), w, what); }
      if (dz) { at(J(H(17, 50), 20), home, 'home early for 冬至'); dongzhi(); break; }
      at(J(H(19, 0), 40), home, 'dinner');
      at(J(H(23, 0), 30), home, 'asleep');
      break;
    }
    case 'shopkeeper': {
      at(J(H(6, 30), 20), home, 'breakfast');
      at(J(H(sun ? 9 : 7, 45), 30), a.work || away('at work'), 'minding the shop');
      if (dz) { at(J(H(18, 0), 20), home, 'shop shut early for 冬至'); dongzhi(18.5); break; }
      at(J(H(sun ? 19 : 21, 30), 40), home, 'supper');
      at(J(H(23, 30), 20), home, 'asleep');
      break;
    }
    case 'homemaker': {
      at(J(H(5, 45), 20), home, 'cooking breakfast');
      at(J(H(8, 15), 30), away('at the market'), 'at the market');
      at(J(H(9, 45), 25), home, 'cooking');
      if (rng() < 0.4) { at(J(H(10, 30), 25), roof(), 'hanging laundry on the roof'); at(J(H(11, 15), 15), home, 'housework'); }
      if (L.standpipe && rng() < 0.1) { at(J(H(12, 45), 15), standpipe(), 'carrying water from the standpipe (p108)'); at(J(H(13, 25), 5), home, 'housework'); }
      if (dz) {
        at(J(H(14, 30), 30), away('buying food for the 冬至 dinner'), 'buying food for the 冬至 dinner');
        at(J(H(15, 45), 20), home, 'cooking the 冬至 dinner');
        dongzhi();
        break;
      }
      if (rng() < 0.2) { at(J(H(15, 30), 25), away('shopping'), 'shopping'); at(J(H(16, 30), 15), home, 'cooking dinner'); }
      if (rng() < 0.1) { at(J(H(17, 15), 10), roof(), 'on the roof in the early evening (p322)'); at(J(H(18, 0), 10), home, 'cooking dinner'); }
      at(J(H(22, 30), 30), home, 'asleep');
      break;
    }
    case 'elder': {
      at(J(H(5, 15), 25), home, 'up early');
      const r = rng();
      if (r < 0.55) { at(J(H(6, 0), 20), away('at a tea house'), 'at a tea house'); at(J(H(9, 15), 40), home, 'resting'); }
      else if (r < 0.8) { at(J(H(6, 0), 20), roof(), 'morning exercise on the roof'); at(J(H(7, 15), 20), home, 'resting'); }
      else at(J(H(7, 30), 30), home, 'at home');
      // The Old People's Centre in the Yamen: afternoons Monday to Saturday, worship on Sunday
      // (pp305-306).
      if (!sun && rng() < 0.35) { at(J(H(14, 30), 30), yamen(), 'tea and TV at the Old People’s Centre in the Yamen (pp305–306)'); at(J(H(17, 15), 30), home, 'resting'); }
      else if (sun && rng() < 0.2) { at(J(H(10, 15), 10), yamen(), 'Sunday worship at the Old People’s Centre (p305)'); at(J(H(11, 40), 15), home, 'resting'); }
      if (dz) { dongzhi(18); break; }
      // "A grandmother would keep her eye on her own grandchildren as well as the children of her
      // neighbours, while her daughter prepared supper" (p322).
      if (rng() < 0.3) { at(J(H(17, 35), 10), roof(), 'on the roof in the early evening, minding the children (p322)'); at(J(H(18, 45), 10), home, 'supper'); }
      at(J(H(21, 0), 40), home, 'asleep');
      break;
    }
    // ---- the real people (hours INFERRED from their trades) ----
    case 'mapper': {
      const lanes = ['lys', 'kms', 'tcs', 'skg', 'lsr'];
      const map = (t, n) => {
        for (let q = 0; q < n; q++) at(J(t + q * 32, 4), laneSpot(L, rng, lanes[Math.floor(rng() * lanes.length)]), 'drawing his map of the lanes');
      };
      if (sun) { at(H(8, 30), home, 'at home'); map(H(9, 30), 5); at(H(12, 30), home, 'lunch'); map(H(14, 0), 6); at(H(17, 30), home, 'inking the map at home'); at(H(23, 30), home, 'asleep'); break; }
      at(H(7, 15), home, 'getting up');
      at(H(7, 50), away('at his studies outside the city'), 'at his studies outside the city');
      if (sat) { at(H(13, 15), home, 'lunch'); map(H(14, 15), 6); at(H(17, 45), home, 'inking the map at home'); at(H(23, 30), home, 'asleep'); break; }
      if (dz) { at(H(17, 50), home, 'home for 冬至'); dongzhi(18.3); break; }
      at(H(18, 30), home, 'dinner');
      map(H(19, 30), 4);
      at(H(21, 45), home, 'inking the map at home');
      at(H(23, 40), home, 'asleep');
      break;
    }
    case 'youth': {
      const hall = { type: 'in', b: home.b, f: home.f, ...spotIn(L, L.buildings[home.b], home.f, -3, rng) };
      if (sun) { at(H(9, 0), home, 'Sunday at home'); at(H(10, 30), roof(), 'flying a kite from the roof'); at(H(12, 30), home, 'lunch'); at(H(15, 0), hall, 'playing ping pong in the hallway'); at(H(17, 30), home, 'dinner'); at(H(23, 0), home, 'asleep'); break; }
      at(H(6, 50), home, 'getting up');
      at(H(7, 30), away('at school or work outside (not recorded)'), 'at school or work outside (not recorded)');
      if (sat) { at(H(13, 0), home, 'lunch'); at(H(14, 30), roof(), 'on the roofs with friends'); at(H(17, 45), home, 'dinner'); at(H(19, 30), hall, 'playing ping pong in the hallway'); at(H(21, 30), home, 'home'); at(H(23, 30), home, 'asleep'); break; }
      if (dz) { at(H(17, 30), home, 'home for 冬至'); dongzhi(18.3); break; }
      at(H(17, 40), home, 'home');
      at(H(19, 30), hall, 'playing ping pong in the hallway');
      at(H(21, 0), home, 'homework');
      at(H(23, 15), home, 'asleep');
      break;
    }
    case 'fishball': {
      // Home outside the city: not recorded.
      const shop = a.work;
      a.home = away('home, outside the city (not recorded)');
      S.length = 0;
      at(0, a.home, 'home, outside the city (not recorded)');
      at(H(4, 30), shop, 'making fishballs for the markets');
      at(H(10, 45), away('delivering to markets and restaurants outside'), 'delivering to markets and restaurants outside');
      at(H(13, 30), shop, 'at the shop: orders, fish, accounts');
      if (dz) { at(H(17, 0), a.home, 'home for 冬至 (outside the city)'); break; }
      if (dow === 2) {
        const c = L.buildings.filter((b) => b.uses[0] === 'foodfac' && b.id !== shop.b);
        const ob = c[Math.floor(rng() * c.length)];
        at(H(19, 15), { type: 'in', b: ob.id, f: 0, ...spotIn(L, ob, 0, -1, rng) }, 'mahjong with other bosses after work');
        at(H(23, 0), a.home, 'home, outside the city (not recorded)');
      } else at(H(19, 0), a.home, 'home, outside the city (not recorded)');
      break;
    }
    case 'postman': {
      // Lam Po Chun's round (p146): he sorts the mail at the Lung Kong Road Post Office outside
      // the City, starts at a store on Lo Yan Street, works the north-south lane and then the
      // side alleys, climbs one stair, crosses the roofs by ladders and windows and goes down
      // another (pp145-146), fills the postbox walls, meets some residents at 4/F or 5/F, and
      // delivers outside the City for part of the day. An 8-hour shift (WSJ, 2014). The book
      // gives no times, thus the hours are INFERRED.
      a.home = away('off duty');
      S.length = 0;
      at(0, a.home, 'off duty');
      if (sun) break;
      const lys = B.filter((b) => b.kind !== 'yamen' && b.floors > 1 && L.addr.lys && L.addr.lys.F.includes(b.id));
      const store = lys.find((b) => b.uses[0] === 'shop') || lys[0] || pick(B.filter((b) => b.floors > 1));
      const inside = (b, f, act, m = -3) => ({ place: { type: 'in', b: b.id, f, ...spotIn(L, b, f, m, rng) }, act });
      const stops = [inside(store, 0, 'with the mail, at a store on Lo Yan Street (p146)', -1)];
      for (const b of lys.slice(0, 8)) stops.push(inside(b, 0, 'filling the postboxes in the entrance (p188)'));
      const side = ['kms', 'tcs', 'skg', 'tts'].flatMap((st) => (L.addr[st] ? L.addr[st].F : []).map((id) => B[id]))
        .filter((b) => b.kind === 'tenement' && b.floors > 5);
      for (let q = 0; q < 6 && side.length; q++) {
        const b = pick(side);
        stops.push(inside(b, 0, 'filling the postboxes in the entrance (p188)'));
        if (q % 2 === 0) stops.push(inside(b, 4 + Math.floor(rng() * 2), 'with a letter for a resident on 4/F or 5/F (p146)'));
        if (q % 3 === 1) {
          // Up one stair, over the roofs and down another (pp145-146).
          stops.push({ place: roofOf(rng, b), act: 'crossing the roofs by ladders and windows (pp145-146)' });
          const nb = B.filter((x) => x.tower !== b.tower && x.floors > 4 && Math.hypot(x.cx - b.cx, x.cz - b.cz) < 20);
          if (nb.length) stops.push({ place: roofOf(rng, pick(nb)), act: 'crossing the roofs by ladders and windows (pp145-146)' });
        }
      }
      at(H(7, 0), away('at the Lung Kong Road Post Office'), 'sorting the mail at the Lung Kong Road Post Office (p146)');
      let t = H(8, 20);
      for (const s0 of stops) {
        if (t > H(12, 30) && t < H(13, 15)) t = H(13, 15);
        if (t > H(sat ? 11 : 14, 0)) break;
        at(t, s0.place, s0.act);
        t += 11 + rng() * 8;
      }
      if (!sat) { at(Math.max(t, H(14, 0)), away('delivering outside the City'), 'delivering outside the City (p146)'); at(H(15, 30), a.home, 'off duty'); }
      else at(t, a.home, 'off duty');
      break;
    }
    case 'commuter': {
      at(H(6, 50), home, 'getting up');
      if (sun) { at(H(9, 30), away('yum cha outside the city'), 'yum cha outside the city'); at(H(13, 0), home, 'Sunday at home'); at(H(23, 0), home, 'asleep'); break; }
      at(H(7, 30), away('at his office in Central'), 'at his office in Central');
      if (dz) { at(H(18, 0), home, 'home for 冬至'); dongzhi(18.5); break; }
      at(H(sat ? 13 : 19, 10), home, sat ? 'home after a half day' : 'dinner');
      at(H(23, 15), home, 'asleep');
      break;
    }
    case 'tenant':
    case 'worker': {
      at(H(6, 30), home, 'breakfast');
      if (sun) { at(H(10, 0), home, 'Sunday at home'); at(H(23, 0), home, 'asleep'); break; }
      at(H(7, 20), away('at work outside the city (trade not recorded)'), 'at work outside the city (trade not recorded)');
      if (dz) { at(H(17, 45), home, 'home early for 冬至'); dongzhi(); break; }
      at(H(19, 0), home, 'dinner');
      at(H(23, 0), home, 'asleep');
      break;
    }
    case 'market': {
      at(H(6, 0), home, 'cooking breakfast');
      at(H(8, 15), away('at the market'), 'at the market');
      at(H(9, 40), home, 'housework');
      if (dz) { at(H(14, 30), away('buying food for the 冬至 dinner'), 'buying food for the 冬至 dinner'); at(H(15, 45), home, 'cooking the 冬至 dinner'); dongzhi(); break; }
      at(H(22, 30), home, 'asleep');
      break;
    }
    case 'store': {
      at(H(6, 30), home, 'getting up');
      at(H(7, 30), a.work, 'minding the store');
      if (dz) { at(H(18, 0), home, 'store shut for 冬至'); dongzhi(18.4); break; }
      at(H(21, 30), home, 'home');
      at(H(23, 30), home, 'asleep');
      break;
    }
    // ---- the people of City of Darkness Revisited (residents.js BOOK_PEOPLE) ----
    case 'book': {
      const P = a.book, w = a.work, T = (h) => Math.round(h * 60);
      let open = sun ? P.sun || (P.days === 7 ? P.open : null) : P.open;
      // On 冬至 every place shuts at 18:00 (INFERRED).
      if (open && dz) open = open.map(([s0, s1]) => [s0, Math.min(s1, 18)]).filter(([s0, s1]) => s1 > s0);
      // A rush order the night before: work after dinner to 2am (p237).
      const rush = (d) => P.rush && P.rush.includes(d);
      if (rush((dow + 6) % 7)) { S.length = 0; at(0, w, 'a rush order, after midnight (p237)'); at(T(2.2), home, 'asleep'); }
      if (!open || !open.length) {
        at(J(H(8, 30), 30), home, 'Sunday at home');
        if (rng() < 0.5) { at(J(H(10, 0), 30), away('out with the family'), 'out with the family'); at(J(H(14, 0), 40), home, 'home'); }
        at(J(H(22, 45), 20), home, 'asleep');
        break;
      }
      // What the person does at hour h: the busy hours and the late work have their own words.
      const doing = (h) => (P.busy && h >= P.busy[0] && h < P.busy[1] ? `${P.doing}: the busiest hours (p${P.page})`
        : P.late && h >= P.late[0] ? `${P.late[1]} (p${P.page})` : P.doing);
      at(T(open[0][0]) - 45, home, 'getting up');
      open.forEach(([s0, s1], i) => {
        at(T(s0) - 6, w, doing(s0));
        if (s1 - s0 > 7 && s0 < 12 && s1 > 14) { at(T(12.5), w, 'lunch at work'); at(T(13.1), w, doing(13.1)); }
        if (s1 - s0 > 7 && s0 < 18 && s1 > 20 && !P.busy) { at(T(18.5), w, 'dinner at work'); at(T(19.1), w, doing(19.1)); }
        for (const h of [P.busy && P.busy[0], P.busy && P.busy[1], P.late && P.late[0]]) if (h && h > s0 && h < s1) at(T(h), w, doing(h));
        const next = open[i + 1];
        if (next && P.between) at(T(s1), away(P.between), `${P.between} (p${P.page})`);
        else if (next && next[0] - s1 >= 1) at(T(s1) + 4, home, 'a break at home');
      });
      const end = Math.min(T(open[open.length - 1][1]) + 4, 1435);
      at(end, home, dz ? 'home for 冬至' : 'home');
      if (dz) { dongzhi(Math.max(18.4, end / 60 + 0.3)); break; }
      if (rush(dow)) { at(T(20), w, 'a rush order, after dinner (p237)'); break; }
      at(Math.max(end + 15, J(H(23, 15), 20)), home, 'asleep');
      break;
    }
    case 'pigeons': {
      // Chan Kwan Leung keeps pigeons on a roof that he rents (p318); they fly in the
      // mid-afternoon (p321). His other hours are not recorded.
      const w = a.work;
      at(H(6, 50), w, 'feeding the pigeons (p318)');
      if (sun) { at(H(9, 0), home, 'Sunday at home'); at(H(13, 45), w, 'on his roof with the pigeons'); }
      else { at(H(8, 10), away('out (not recorded)'), 'out (not recorded)'); at(H(14, 10), w, 'on his roof with the pigeons'); }
      at(H(14, 35), w, 'flying the pigeons (p321)');
      at(H(16, 40), w, 'calling the pigeons back to the loft');
      at(H(17, 20), home, dz ? 'home for 冬至' : 'dinner');
      if (dz) { dongzhi(18.3); break; }
      at(H(23, 0), home, 'asleep');
      break;
    }
    // ---- people who come in from outside (OUTSIDERS) ----
    case 'day_worker': {
      S.length = 0;
      at(0, home, home.what);
      if (sun && rng() < 0.85) break;
      const w = a.work, what = USE_DOING[w.what] || 'at work';
      at(J(H(7, 45), 25), w, what);
      if (PL.eating.length && rng() < 0.25) { const e = pick(PL.eating); at(J(H(12, 15), 10), PL.at(e.b, e.f), 'lunch at an eating house'); at(J(H(13, 0), 8), w, what); }
      if (dz) { at(J(H(17, 15), 20), home, 'home for 冬至, outside the city'); break; }
      at(sat && rng() < 0.5 ? J(H(13, 30), 20) : J(H(19, 0), 35), home, home.what);
      break;
    }
    case 'police': {
      // Two constables to each beat and three 8-hour shifts a day (pp251, 283), some of the
      // beat on the roofs. The hours of the shifts are INFERRED. Both of a pair walk the same
      // beat, thus the stops come from one seed for the pair.
      S.length = 0;
      const r = mulberry32(4100 + dow * 7 + a.shift);
      const stop = () => (r() < 0.12 ? roofOf(r, B[PL.roofs[Math.floor(r() * PL.roofs.length)]]) : laneSpot(L, r, null));
      const beat = (t0, t1) => { for (let t = t0; t < t1; t += 14 + r() * 8) at(t, stop(), 'on the beat'); };
      if (a.shift === 2) { beat(0, H(7, 0)); at(H(7, 0), home, 'off duty'); beat(H(23, 0), H(23, 59)); }
      else { at(0, home, home.what); const t0 = H(a.shift ? 15 : 7, 0); beat(t0, t0 + 480); at(t0 + 480, home, 'off duty'); }
      break;
    }
    case 'refuse': {
      // Refuse collectors on Tai Chang Street at 4am (p93). INFERRED: every day, until 5.30.
      S.length = 0;
      at(0, home, home.what);
      let t = J(H(3, 50), 5);
      for (let q = 0; q < 8; q++, t += 9 + rng() * 4) at(t, laneSpot(L, rng, 'tcs'), 'collecting the refuse (p93)');
      at(t, home, 'gone with the refuse');
      break;
    }
    case 'sweeper': {
      // Sweepers of the Urban Services Department with their buckets (p104). The hours are
      // INFERRED: 7 to 3, Monday to Saturday.
      S.length = 0;
      at(0, home, home.what);
      if (sun) break;
      for (let t = J(H(7, 0), 10); t < H(dz ? 14 : 15, 0); t += 18 + rng() * 12) at(t, laneSpot(L, rng, a.street), 'sweeping the lane (p104)');
      at(H(dz ? 14 : 15, 5), home, home.what);
      break;
    }
    case 'meter': {
      // Meter readers with torches in the dark stairs (p98). The days are INFERRED.
      S.length = 0;
      at(0, home, home.what);
      if (dow !== 1 && dow !== 2) break;
      for (let t = J(H(9, 30), 10); t < H(16, 30); t += 12 + rng() * 8) {
        const b = pick(B.filter((x) => x.kind === 'tenement' || x.kind === 'low'));
        const f = Math.floor(rng() * Math.min(3, b.floors - 1));
        at(t, { type: 'in', b: b.id, f, ...spotIn(L, b, f, -3, rng) }, 'reading the meters by torchlight (p98)');
      }
      at(H(16, 45), home, home.what);
      break;
    }
    case 'patient': {
      // Patients from outside go to the dentists and doctors on the outer roads, thus they do
      // not enter the City (p242). How many, and when, is INFERRED.
      S.length = 0;
      at(0, home, home.what);
      if (!PL.clinics.length || rng() > (sun ? 0.15 : 0.5)) break;
      const c = pick(PL.clinics);
      const t = sun ? J(H(10, 30), 50) : Math.min(J(H(14, 0), 270), dz ? H(16, 30) : 1440);
      at(t, PL.at(c.b, c.f), c.what === 'dentist' ? 'at the dentist (p242)' : 'seeing the doctor (p242)');
      at(t + 25 + rng() * 35, home, home.what);
      break;
    }
    default: {
      at(J(H(7, 0), 30), home, 'at home');
      if (dz) { dongzhi(); break; }
      at(J(H(20, 30), 30), home, 'asleep');
    }
  }
  S.sort((p, q) => p[0] - q[0]);
  return S;
}

// Binary min-heap of [time, agent index].
class Heap {
  constructor() { this.t = []; this.i = []; }
  get size() { return this.t.length; }
  push(t, i) {
    const T = this.t, I = this.i;
    let n = T.length;
    T.push(t); I.push(i);
    while (n > 0) {
      const p = (n - 1) >> 1;
      if (T[p] <= T[n]) break;
      [T[p], T[n]] = [T[n], T[p]]; [I[p], I[n]] = [I[n], I[p]];
      n = p;
    }
  }
  peek() { return this.t[0]; }
  pop() {
    const T = this.t, I = this.i, top = I[0];
    const lt = T.pop(), li = I.pop();
    if (T.length) {
      T[0] = lt; I[0] = li;
      let n = 0;
      for (;;) {
        const l = 2 * n + 1, r = l + 1;
        let m = n;
        if (l < T.length && T[l] < T[m]) m = l;
        if (r < T.length && T[r] < T[m]) m = r;
        if (m === n) break;
        [T[m], T[n]] = [T[n], T[m]]; [I[m], I[n]] = [I[n], I[m]];
        n = m;
      }
    }
    return top;
  }
  clear() { this.t.length = 0; this.i.length = 0; }
}

export class Sim {
  constructor(L, agents) {
    this.L = L;
    this.agents = agents;
    this.fields = new Map();
    this.heap = new Heap();
    this.moving = [];
    this.minute = 0;
    this.day = 0;
    const n = agents.length;
    this.aP = new Float32Array(n * 4);
    this.aC = new Float32Array(n * 3);
    this.aB = new Float32Array(n * 3);
    this.aL = new Float32Array(n * 4);
    // aM = [heading, gait, pose, seed]: gait 0 still, 1 walking, 2 on a stair, 3 on a ladder.
    this.aM = new Float32Array(n * 4);
    for (const a of agents) {
      this.aB.set(a.bottom, a.id * 3);
      this.aM[a.id * 4] = a.rng * Math.PI * 2;
      this.aM[a.id * 4 + 3] = a.rng;
    }
    this.selected = -1;
    this.activity = new Float32Array(144);
    this.residents = agents.filter((a) => a.home.type === 'in').length;
  }

  // ---- paths ---------------------------------------------------------------------------
  field(target) {
    let f = this.fields.get(target);
    if (f) return f;
    const { N, W, D, cost } = this.L;
    f = new Uint16Array(N).fill(65535);
    const buckets = [[target]];
    f[target] = 0;
    for (let d = 0; d < buckets.length; d++) {
      const bk = buckets[d];
      if (!bk) continue;
      for (let q = 0; q < bk.length; q++) {
        const k = bk[q];
        if (f[k] !== d) continue;
        const i = k % W, j = (k / W) | 0;
        const relax = (n) => {
          const c = cost[n];
          if (!c) return;
          const nd = d + c;
          if (nd < f[n]) { f[n] = nd; (buckets[nd] ||= []).push(n); }
        };
        if (i > 0) relax(k - 1);
        if (i < W - 1) relax(k + 1);
        if (j > 0) relax(k - W);
        if (j < D - 1) relax(k + W);
      }
    }
    this.fields.set(target, f);
    return f;
  }

  groundRoute(from, to, ox, oz, pts) {
    const { W, D } = this.L;
    const f = this.field(to);
    let k = from, guard = 0, last = -1, dir = -1;
    while (k !== to && guard++ < 4000) {
      const i = k % W, j = (k / W) | 0;
      let best = k, bv = f[k];
      const cand = [];
      if (i > 0) cand.push(k - 1);
      if (i < W - 1) cand.push(k + 1);
      if (j > 0) cand.push(k - W);
      if (j < D - 1) cand.push(k + W);
      for (const n of cand) if (f[n] < bv) { bv = f[n]; best = n; }
      if (best === k) break;
      const nd = best - k;
      if (nd !== dir && last >= 0) pts.push([this.L.cellX(k) + ox, this.L.cellZ(k) + oz, 0, 0]);
      dir = nd; last = k; k = best;
    }
    pts.push([this.L.cellX(k) + ox, this.L.cellZ(k) + oz, 0, 0]);
  }

  // Waypoints [x, z, y, level] from one place to another: through the corridors, stairs,
  // links and roofs of routes.js, and along the lanes on the grid. When the clock runs fast,
  // people take the plain way: down, along the lanes, and up.
  plan(a, from, to) {
    const ox = (a.rng - 0.5) * 0.6, oz = (((a.rng * 7919) % 1) - 0.5) * 0.6;
    return this.L.routes.trip(from, to, ox, oz, this.fast, (k0, k1, pts) => this.groundRoute(k0, k1, ox, oz, pts));
  }

  // ---- state ---------------------------------------------------------------------------
  write(a, x, z, y, lv) {
    const o = a.id * 4;
    this.aP[o] = x; this.aP[o + 1] = z; this.aP[o + 2] = y; this.aP[o + 3] = lv;
  }
  place(a, p) {
    a.loc = p;
    if (p.type === 'away') this.write(a, 0, 0, 0, -1);
    else if (p.type === 'roof') this.write(a, p.x, p.z, this.L.buildings[p.b].floors * STOREY, this.L.buildings[p.b].floors - 1);
    else if (p.type === 'ground') this.write(a, p.x, p.z, 0, 0);
    else this.write(a, p.x, p.z, p.f * STOREY, p.f);
  }
  // The look of a person: the top colour (aC), and aL = [size, prop, hat * 2 + real, dim].
  tint(a) {
    const o = a.id * 3, q = a.id * 4, sel = a.id === this.selected;
    if (sel) { this.aC[o] = 1; this.aC[o + 1] = 0.36; this.aC[o + 2] = 0.22; }
    else this.aC.set(a.color, o);
    this.aL[q] = a.size;
    this.aL[q + 1] = propFor(a);
    this.aL[q + 2] = a.hat * 2 + (a.real ? 1 : 0);
    this.aL[q + 3] = !sel && a.act === 'asleep' ? 0.62 : 1;
    this.aM[q + 2] = poseFor(a);
  }

  select(id) {
    const prev = this.selected;
    this.selected = id;
    if (prev >= 0) this.tint(this.agents[prev]);
    if (id >= 0) this.tint(this.agents[id]);
  }

  newDay() {
    const rng = mulberry32(9000 + this.day);
    this.heap.clear();
    this.activity.fill(0);
    for (const a of this.agents) {
      a.sched = makeSchedule(a, this.L, rng, this.day % 7);
      for (let s = 0; s < a.sched.length; s++) {
        if (a.sched[s][1] === a.home) continue;
        const t0 = a.sched[s][0], t1 = s + 1 < a.sched.length ? a.sched[s + 1][0] : 1440;
        for (let m = Math.floor(t0 / 10); m < Math.min(144, Math.ceil(t1 / 10)); m++) this.activity[m]++;
      }
    }
  }

  // Jump to a time of day without walking: everyone is put where they would be.
  setTime(minute) {
    this.minute = minute;
    this.newDay();
    this.moving.length = 0;
    for (const a of this.agents) {
      let s = 0;
      while (s + 1 < a.sched.length && a.sched[s + 1][0] <= minute) s++;
      a.si = s;
      a.trip = null;
      this.aM[a.id * 4 + 1] = 0;
      a.act = a.sched[s][2];
      a.fidget = minute + 5 + a.rng * 40;
      this.place(a, a.sched[s][1]);
      this.tint(a);
      if (s + 1 < a.sched.length) this.heap.push(a.sched[s + 1][0], a.id);
    }
  }

  go(a, to, now) {
    if (a.trip) this.finish(a);
    const from = a.loc;
    if (from === to) return;
    const pts = this.plan(a, from, to);
    const speed = a.size === 2 ? WALK * 0.65 : a.size === 0 ? WALK * 0.8 : WALK;
    const tc = [0];
    for (let q = 1; q < pts.length; q++) {
      const p = pts[q - 1], c = pts[q];
      const h = Math.hypot(c[0] - p[0], c[1] - p[1]), v = Math.abs(c[2] - p[2]);
      tc.push(tc[q - 1] + h / speed + v / (a.size === 2 ? CLIMB * 0.6 : CLIMB));
    }
    a.trip = { pts, tc, t0: now, seg: 0, to };
    a.loc = { type: 'moving' };
    this.moving.push(a.id);
  }

  finish(a) {
    const to = a.trip.to;
    a.trip = null;
    this.aM[a.id * 4 + 1] = 0;
    this.place(a, to);
  }

  // Advance by dt simulated seconds.
  step(dt) {
    this.fast = dt > 5;
    const prevMin = this.minute;
    this.minute += dt / 60;
    if (this.minute >= 1440) {
      this.day++;
      this.setTime(this.minute - 1440);
      return;
    }
    const nowS = this.minute * 60;
    while (this.heap.size && this.heap.peek() <= this.minute) {
      const a = this.agents[this.heap.pop()];
      a.si++;
      const [, place, act] = a.sched[a.si];
      a.act = act;
      this.tint(a);
      this.go(a, place, a.sched[a.si][0] * 60);
      if (a.si + 1 < a.sched.length) this.heap.push(a.sched[a.si + 1][0], a.id);
    }
    // Small moves around the flat while awake, so the plan view is not frozen.
    if (Math.floor(this.minute) !== Math.floor(prevMin)) {
      const n = this.agents.length, tries = Math.ceil(n * 0.004);
      for (let q = 0; q < tries; q++) {
        const a = this.agents[Math.floor(Math.random() * n)];
        if (a.trip || a.act === 'asleep' || !a.loc) continue;
        const base = a.loc.base || a.loc;
        if (a.loc.type === 'roof') { this.roam(a, base, nowS); continue; }
        if (a.loc.type !== 'in') continue;
        const r = mulberry32((a.id * 31 + Math.floor(this.minute)) | 0);
        const spot = spotIn(this.L, this.L.buildings[base.b], base.f, base === a.home ? a.flat : -1, r);
        this.go(a, { ...base, ...spot, base }, nowS);
      }
    }
    const M = this.moving;
    for (let q = M.length - 1; q >= 0; q--) {
      const a = this.agents[M[q]];
      const tr = a.trip;
      if (!tr) { M[q] = M[M.length - 1]; M.pop(); continue; }
      const el = nowS - tr.t0;
      while (tr.seg < tr.tc.length - 1 && el > tr.tc[tr.seg + 1]) tr.seg++;
      if (tr.seg >= tr.tc.length - 1) {
        this.finish(a);
        M[q] = M[M.length - 1]; M.pop();
        continue;
      }
      const p = tr.pts[tr.seg], c = tr.pts[tr.seg + 1];
      const span = tr.tc[tr.seg + 1] - tr.tc[tr.seg];
      const f = span > 0 ? (el - tr.tc[tr.seg]) / span : 1;
      this.write(a, p[0] + (c[0] - p[0]) * f, p[1] + (c[1] - p[1]) * f, p[2] + (c[2] - p[2]) * f, p[3] + (c[3] - p[3]) * f);
      // Face the way they go; a climb with no way along is a ladder.
      const o = a.id * 4, dx = c[0] - p[0], dz = c[1] - p[1];
      if (dx * dx + dz * dz > 1e-4) {
        this.aM[o] = Math.atan2(dx, dz);
        this.aM[o + 1] = Math.abs(c[2] - p[2]) > 0.01 ? 2 : 1;
      } else this.aM[o + 1] = Math.abs(c[2] - p[2]) > 0.01 ? 3 : 1;
    }
  }

  // On the roofs: to another spot on this roof, or over to the next roof (Albert Ng: "The
  // kids would go onto the roofs and leap from building to building", SCMP 2013).
  roam(a, base, nowS) {
    const L = this.L, R = L.routes, B = L.buildings;
    const r = mulberry32((a.id * 31 + Math.floor(this.minute)) | 0);
    let t = B[a.loc.b].tower;
    const near = R.roofNear(t);
    if (near.length && r() < 0.6) t = near[Math.floor(r() * near.length)];
    // Back toward the home roof, so nobody roams off for good.
    if (t !== B[base.b].tower && B[a.loc.b].tower !== B[base.b].tower && r() < 0.5) t = B[base.b].tower;
    const tops = L.towers[t].blocks.filter((id) => B[id].floors === R.towerTop[t]);
    const b = B[tops[Math.floor(r() * tops.length)]];
    const c = b.cells[Math.floor(r() * b.cells.length)];
    this.go(a, { type: 'roof', b: b.id, x: L.cellX(c) + (r() - 0.5) * 0.6, z: L.cellZ(c) + (r() - 0.5) * 0.6, base }, nowS);
  }

  // Where is someone, in words.
  describe(a) {
    const B = this.L.buildings;
    const STREET = { lys: '老人街 Lo Yan St', kms: '光明街 Kwong Ming St', tcs: '大井街 Tai Chang St', skg: '社公街 Sz Kung St', lsr: '龍城路 Lung Shing Rd' };
    const where = (p) => {
      if (!p) return '';
      if (p.type === 'away') return 'outside the city';
      if (p.type === 'ground') return p.street ? `in the lane of ${STREET[p.street]}` : 'in a lane';
      if (p.type === 'roof') return `roof of ${buildingName(B[p.b])}`;
      if (p.type === 'in') {
        const P = planAt(B[p.b], p.f), u = P && p.m !== undefined ? P.units[p.m] : null;
        return `${unitName(B[p.b], p.f, u)}, ${buildingName(B[p.b])}`;
      }
      return '';
    };
    const moving = !!a.trip;
    return {
      title: a.name,
      role: a.real ? a.real.role : (ROLES[a.role] || OUTSIDERS[a.role]).label,
      age: a.age,
      now: moving ? `walking → ${where(a.trip.to)}` : a.act,
      at: moving ? '' : where(a.loc),
      home: a.real && a.real.home && a.real.home.text ? a.real.home.text : a.home.type === 'away' ? 'outside the city' : where(a.home),
      level: this.levelOf(a),
    };
  }

  // Storey index, 'RF' on a roof, or null when outside the city.
  levelOf(a) {
    const o = a.id * 4;
    if (this.aP[o + 3] < 0) return null;
    if (a.loc && a.loc.type === 'roof') return 'RF';
    return Math.round(this.aP[o + 2] / STOREY);
  }

  stats() {
    let out = 0, away = 0;
    const perLevel = new Map();
    for (const a of this.agents) {
      if (!a.loc) continue;
      if (a.loc.type === 'away') { away++; continue; }
      const base = a.loc.base || a.loc;
      if (base !== a.home) out++;
      const lv = this.levelOf(a);
      perLevel.set(lv, (perLevel.get(lv) || 0) + 1);
    }
    return { away, out, moving: this.moving.length, perLevel };
  }
}
