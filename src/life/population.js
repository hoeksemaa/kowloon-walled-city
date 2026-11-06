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
};
const ADULT = new Set(['worker_out', 'worker_in', 'shopkeeper', 'homemaker', 'elder']);

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
  // The roles, by their shares, then shuffled: the first member of each household is an adult.
  const pool = [];
  for (const [role, R] of Object.entries(ROLES)) for (let i = 0; i < Math.round(R.share * RESIDENTS); i++) pool.push(role);
  while (pool.length < RESIDENTS) pool.push('worker_out');
  pool.length = RESIDENTS;
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const adults = pool.filter((r) => ADULT.has(r)), young = pool.filter((r) => !ADULT.has(r));
  const rest = [];
  let ai = 0;
  const firsts = homes.map(() => adults[ai++] || 'worker_out');
  for (; ai < adults.length; ai++) rest.push(adults[ai]);
  rest.push(...young);
  for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [rest[i], rest[j]] = [rest[j], rest[i]]; }
  let ri = 0;
  homes.forEach((home, h) => {
    for (let m = 0; m < sizes[h]; m++) {
      const role = m === 0 ? firsts[h] : rest[ri++] || 'elder', R = ROLES[role];
      const age = Math.round(R.ages[0] + rng() * (R.ages[1] - R.ages[0]));
      persons.push({ id: persons.length, kind: 'resident', role, age, sex: role === 'homemaker' ? (rng() < 0.92 ? 'f' : 'm') : rng() < 0.5 ? 'f' : 'm', home, hh: h, seed: rng() });
    }
  });

  // ---- the workplaces: owners and keepers, then the workers of the City, then the day workers ----
  const seats = [];
  for (const w of works) {
    const n = Math.max(1, Math.round(w.area / (M2_PER_WORKER[w.cat] || 12)));
    w.cap = n;
    for (let i = 0; i < n; i++) seats.push(w);
  }
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
  return { persons, homes, works };
}
