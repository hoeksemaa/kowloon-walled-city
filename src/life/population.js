// The people of the City in the week of 16 to 22 December 1986, on the definitive structure.
//
// SOURCED: "28,200 occupants residing in 8800 separate apartments" in January 1987 (City of
// Darkness Revisited, p340), and "just over 33,000" with the people who worked in the City but
// lived elsewhere (p339): thus about 4,800 come in to work each day. Police on the beat (pp251,
// 283), the 10 sweepers of the Urban Services Department (市政總署) (p104), the refuse collectors
// (p93), the meter readers (p98), and patients from outside (p242).
// INFERRED: the size of each household (from the floor area of its flat), the share of each
// role, the age of each person, and which workplace each worker goes to.
//
// The crowd has no names: no source names these people. Only the real people of
// data/people.json have names and stories; data/routines.json gives their homes, workplaces and
// weeks.
import { mulberry32 } from '../util.js';
import { mainsTap } from './routines.js';

export const RESIDENTS = 28200;
export const DAY_WORKERS = 4800;

// The roles of the residents. The shares are INFERRED (the old app's shares). Elders: "about a
// third" of residents were over 60 in about 1990 (p178); the model gives fewer for 1986.
export const ROLES = {
  child: { label: 'young child', share: 0.08, ages: [1, 5] },
  student: { label: 'schoolchild', share: 0.2, ages: [6, 18] },
  worker_out: { label: 'works outside the City', share: 0.27, ages: [17, 60] },
  worker_in: { label: 'factory or workshop hand in the City', share: 0.08, ages: [15, 65] },
  shopkeeper: { label: 'keeps a shop or a business in the City', share: 0.04, ages: [25, 70] },
  homemaker: { label: 'homemaker', share: 0.15, ages: [22, 65] },
  elder: { label: 'elder', share: 0.18, ages: [62, 90] },
  carrier: { label: 'water carrier, paid to carry drinking water up the stairs (p108)', share: 0, ages: [22, 55] },
};

// The people who come in from outside. n: how many. The day workers are 33,000 less 28,200
// (pp339-340); the other numbers are INFERRED, except the 10 sweepers (p104).
export const OUTSIDERS = {
  day_worker: { label: 'workshop hand who lives outside the City', n: DAY_WORKERS, ages: [16, 60] },
  police: { label: 'police constable on the beat (pp251, 283)', n: 6, ages: [22, 45] },
  sweeper: { label: 'street sweeper of the Urban Services Department (p104)', n: 10, ages: [30, 62] },
  refuse: { label: 'refuse collector of the Urban Services Department (p104)', n: 3, ages: [25, 60] },
  meter: { label: 'electricity meter reader (p98)', n: 2, ages: [25, 50] },
  patient: { label: 'patient from outside the City (p242)', n: 300, ages: [6, 85] },
};

// Workers in a workplace: one for each so many m² of floor (INFERRED). A workshop of 480 sq ft
// (45 m²) had seven full-time workers (Lam Leung Po (林良寶), room_research B50).
const M2_PER_WORKER = {
  plastics: 5, metal: 5, garment: 4, foodfac: 5, works: 6, shop: 14, eating: 7, office: 10,
  storage: 40, services: 12, dentist: 12, clinic: 12, medicine: 14, school: 15, religion: 20,
  community: 15, vice: 12,
};
// The categories whose owner or keeper is a 'shopkeeper'; the others take 'worker_in'.
const KEEPER = new Set(['shop', 'eating', 'office', 'medicine', 'services', 'dentist', 'clinic', 'storage']);

const pick = (r, a) => a[Math.floor(r() * a.length)];
const between = (r, a, b) => Math.round(a + r() * (b - a));

// The trade of a worker (INFERRED shares): outside the City, in a workshop of the City, or a
// shop or a business of the City. More women than men worked in the factories.
function workRole(r, sex) {
  const q = r();
  if (sex === 'm') return q < 0.64 ? 'worker_out' : q < 0.86 ? 'worker_in' : 'shopkeeper';
  return q < 0.58 ? 'worker_out' : q < 0.9 ? 'worker_in' : 'shopkeeper';
}

// The members of a household of n people: [{ role, age, sex, rel }], with .kind. INFERRED: no
// source gives the make-up of the households of the City in 1986. The kinds: one person alone
// (an old person, or a worker), two old people, workers who share a flat, and families (a
// couple, their children, and in a big household a grandparent).
export function makeHousehold(n, r) {
  const M = [];
  const add = (role, age, sex, rel) => M.push({ role, age, sex, rel });
  if (n === 1) {
    if (r() < 0.62) add('elder', between(r, 62, 88), r() < 0.6 ? 'f' : 'm', 'lives alone');
    else { const sex = r() < 0.8 ? 'm' : 'f'; add(workRole(r, sex), between(r, 19, 60), sex, 'lives alone'); }
    M.kind = 'alone';
    return M;
  }
  const q = r();
  if (n === 2 && q < 0.42) {
    add('elder', between(r, 64, 86), 'm', 'husband'); add('elder', between(r, 61, 83), 'f', 'wife');
    M.kind = 'old couple';
    return M;
  }
  if ((n === 2 && q < 0.52) || (n >= 3 && q < 0.06)) {
    const sex = r() < 0.85 ? 'm' : 'f';
    for (let i = 0; i < n; i++) add(workRole(r, sex), between(r, 18, 56), sex, 'shares the flat');
    M.kind = 'sharers';
    return M;
  }
  // a family
  const single = n === 2 && r() < 0.3;
  const fa = between(r, 26, 57), mo = Math.max(21, fa - between(r, 0, 8));
  const grand = !single && ((n >= 5 && r() < 0.75) || (n === 4 && r() < 0.4) || (n === 3 && r() < 0.15));
  let nk = n - (single ? 1 : 2) - (grand ? 1 : 0);
  if (n === 2 && !single) nk = 0;
  // the ages of the children: a gap of 1 to 3 years between them; the eldest at most 24 and
  // born when the mother was 19 or more, the youngest born when she was 42 or less
  const kids = [];
  const gaps = Array.from({ length: Math.max(0, nk - 1) }, () => between(r, 1, 3)), span = gaps.reduce((t, g) => t + g, 0);
  const lo = Math.max(0, mo - 42) + span, hi = Math.max(lo, Math.min(24, mo - 19));
  let a = Math.round(hi - (hi - lo) * r() ** 1.6);
  for (let i = 0; i < nk; i++) { kids.push(Math.max(0, a)); a -= gaps[i] || 0; }
  const small = kids.some((x) => x < 6);
  const momRole = r() < (small ? 0.72 : 0.42) ? 'homemaker' : workRole(r, 'f');
  if (!single || r() < 0.2) add(workRole(r, 'm'), fa, 'm', single ? 'father' : nk ? 'father' : 'husband');
  if (!single || M.length === 0) add(single ? (r() < 0.3 ? 'homemaker' : workRole(r, 'f')) : momRole, mo, 'f', nk ? 'mother' : 'wife');
  if (grand) { const sex = r() < 0.66 ? 'f' : 'm'; add('elder', Math.max(62, mo + between(r, 22, 32)), sex, sex === 'f' ? 'grandmother' : 'grandfather'); }
  for (const age of kids) {
    const sex = r() < 0.5 ? 'f' : 'm', rel = sex === 'f' ? 'daughter' : 'son';
    const role = age < 6 ? 'child' : age <= 16 ? 'student' : age <= 18 ? (r() < 0.45 ? 'student' : workRole(r, sex)) : workRole(r, sex);
    add(role, Math.max(1, age), sex, rel);
  }
  M.kind = nk ? 'family' : 'couple';
  return M;
}

export function buildPopulation(S, uses, nav, routines, people, seed = 1986) {
  const rng = mulberry32(seed);
  const persons = [];
  const placeOf = (key) => {
    if (!key) return null;
    if (key.startsWith('roof:')) {
      const b = +key.slice(5), node = nav.roof(b);
      return node >= 0 ? { kind: 'roof', node, b, k: S.list[b].n, key } : null;
    }
    const [b, k, u] = key.split(':').map(Number), node = nav.unit(b, k, u);
    return node >= 0 ? { kind: 'unit', node, b, k, u, key, cat: uses.get(b, k, u)?.cat } : null;
  };

  // ---- the homes and the workplaces ----
  // The homes of the real people (data/routines.json) take no household of the crowd: the
  // sources say who lived there.
  const realHomes = new Set(Object.values(routines?.people || {}).map((R) => R.home).filter(Boolean));
  const homes = [], works = [];
  for (const [key, r] of uses.at) {
    if (r.cat === 'home' && realHomes.has(key)) continue;
    const p = placeOf(key);
    if (!p) continue;
    const [b, k, u] = key.split(':').map(Number), B = S.list[b];
    p.area = k >= B.n ? 6 : B.phaseOf(k).plan.units.find((x) => x.id === u)?.area || 10;
    if (r.cat === 'home') homes.push(p);
    else works.push(p);
  }

  // ---- the households: their sizes follow the floor area of the flat ----
  let want = homes.map((h) => Math.min(9, Math.max(1, h.area / 6)));
  const scale = RESIDENTS / want.reduce((s, v) => s + v, 0);
  const sizes = want.map((v) => Math.max(1, Math.round(v * scale + (rng() - 0.5))));
  let total = sizes.reduce((s, v) => s + v, 0);
  for (let q = 0; total !== RESIDENTS && q < 1e6; q++) {
    const i = Math.floor(rng() * sizes.length);
    if (total > RESIDENTS && sizes[i] > 1) { sizes[i]--; total--; } else if (total < RESIDENTS && sizes[i] < 10) { sizes[i]++; total++; }
  }
  // The members of each household: a family, a couple, old people, workers who share a flat,
  // or one person alone (makeHousehold). The roles follow from the members.
  const households = [];
  homes.forEach((home, h) => {
    const hr = mulberry32(Math.floor(rng() * 4294967296));
    const members = makeHousehold(sizes[h], hr);
    const hh = { id: h, home, kind: members.kind, members: [], seed: hr() };
    for (const M of members) {
      hh.members.push(persons.length);
      persons.push({ id: persons.length, kind: 'resident', role: M.role, age: M.age, sex: M.sex, rel: M.rel, home, hh: h, seed: rng() });
    }
    households.push(hh);
  });

  // ---- the water carriers ----
  // "A small workforce" carried drinking water from the standpipes till the end (p108), and some
  // were paid "suppliers" (p108, caption). How many, and for which homes, is INFERRED: 30
  // carriers, for one in five of the households with no mains tap (routines.js mainsTap);
  // each home goes to the nearest carrier.
  const men = persons.filter((p) => p.role === 'worker_out' && p.sex === 'm' && p.age >= 22 && p.age <= 55), carriers = [];
  for (let i = 0; i < 30 && men.length; i++) {
    const p = men.splice(Math.floor(rng() * men.length), 1)[0];
    p.role = 'carrier'; p.clients = [];
    carriers.push(p);
  }
  const at = (pl) => S.list[pl.b];
  for (const h of households) {
    if (!carriers.length || mainsTap(h.home.b) || rng() >= 0.2) continue;
    const B = at(h.home);
    let best = null, bd = Infinity;
    for (const c of carriers) { const C = at(c.home), d = Math.hypot(C.cx - B.cx, C.cz - B.cz); if (d < bd && c.hh !== h.id) { bd = d; best = c; } }
    if (best) { h.carrier = best.id; best.clients.push(h.id); }
  }

  // ---- the workplaces: owners and keepers, then the workers of the City, then the day workers ----
  // The jobs of the City: the residents who work in it, and the 4,800 who come in (pp339-340),
  // in "700 businesses" (p110). The seats of each workplace follow its floor area (M2_PER_WORKER),
  // scaled so that all these jobs have a seat.
  const seats = [], nIn = persons.filter((p) => p.role === 'worker_in' || p.role === 'shopkeeper').length;
  const raw = works.map((w) => w.area / (M2_PER_WORKER[w.cat] || 12)), f = (nIn + DAY_WORKERS) / raw.reduce((t, v) => t + v, 0);
  works.forEach((w, q) => {
    const n = Math.max(1, Math.round(raw[q] * f));
    w.cap = n;
    for (let i = 0; i < n; i++) seats.push(w);
  });
  for (let i = seats.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [seats[i], seats[j]] = [seats[j], seats[i]]; }
  const keeperSeats = seats.filter((w) => KEEPER.has(w.cat)), handSeats = seats.filter((w) => !KEEPER.has(w.cat));
  for (const p of persons) {
    if (p.role === 'shopkeeper') p.work = keeperSeats.pop() || handSeats.pop() || null;
    else if (p.role === 'worker_in') p.work = handSeats.pop() || keeperSeats.pop() || null;
    if ((p.role === 'shopkeeper' || p.role === 'worker_in') && !p.work) p.role = 'worker_out';
  }
  const left = [...handSeats, ...keeperSeats];
  const O = OUTSIDERS;
  for (let i = 0; i < O.day_worker.n; i++) {
    const work = left.length ? left.pop() : pick(rng, works);
    persons.push({ id: persons.length, kind: 'outsider', role: 'day_worker', age: Math.round(16 + rng() * 44), sex: rng() < 0.5 ? 'f' : 'm', home: null, work, seed: rng() });
  }
  for (const role of ['police', 'sweeper', 'refuse', 'meter', 'patient'])
    for (let i = 0; i < O[role].n; i++) {
      const [a0, a1] = O[role].ages;
      persons.push({ id: persons.length, kind: 'outsider', role, age: Math.round(a0 + rng() * (a1 - a0)), sex: role === 'police' || role === 'refuse' ? 'm' : rng() < 0.5 ? 'f' : 'm', home: null, seed: rng(), shift: i % 3, n: i });
    }

  // ---- the real people (data/routines.json, data/people.json) ----
  const byId = new Map((people?.people || []).map((p) => [p.id, p]));
  for (const [pid, R] of Object.entries(routines?.people || {})) {
    const P = byId.get(pid);
    if (!P) continue;
    const places = {};
    for (const [name, key] of Object.entries(R.places || {})) places[name] = placeOf(key);
    const f = R.figure || {};
    persons.push({
      id: persons.length, kind: 'real', role: 'real', real: pid, person: P, routine: R,
      age: f.age ?? 40, sex: /^f/i.test(f.sex || '') ? 'f' : 'm', home: placeOf(R.home), work: placeOf(R.work), places, seed: rng(),
    });
  }
  return { persons, homes, works, households };
}
