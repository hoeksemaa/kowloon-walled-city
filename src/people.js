// Residents and their week, Tue 16 to Mon 22 Dec 1986.
//
// SOURCED: about 33,000 residents (the Governor, Oct 1988; "more than 30,000", Baltimore
// Sun 1992); about 8,500 households (see layout.js); nine real people with their homes and
// trades (residents.js); water hours by floor (林羅平); schoolchildren in "pristine white
// uniforms" (a police officer, 1987); children on the roofs (Albert Ng, 2013).
// INFERRED: the share of each role and the hours of each day. A 1980s Hong Kong week: work
// and school six days, Saturday school in the morning only, Sunday off for most. 冬至
// (Winter Solstice, Mon 22 Dec 1986) is a Hong Kong-wide custom: families "做冬" and eat
// together, and many leave work early. That evening is INFERRED for the city's families.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { STOREY, USE_GROUP, USE_DOING, buildingName, locate } from './layout.js';
import { mulberry32, clamp } from './util.js';
import { REAL } from './residents.js';

const SURNAMES = ['Chan', 'Wong', 'Lee', 'Cheung', 'Lau', 'Ho', 'Ng', 'Leung', 'Lam', 'Tse', 'Yip', 'Kwok', 'Tang', 'Fung', 'Mak', 'Cheng', 'Lo', 'Yeung', 'Chow', 'Kwan', 'Chu', 'Tsang', 'Wu', 'So'];
const GIVEN = ['Ming', 'Wai', 'Kit', 'Fai', 'Ying', 'Mei', 'Hung', 'Keung', 'Lin', 'Chun', 'Sang', 'Yee', 'Kam', 'Wing', 'Yuk', 'Hing', 'Choi', 'Fong', 'Kwai', 'Tak', 'Lai', 'Shing'];

export const ROLES = {
  child: { label: 'young child', share: 0.08, ages: [1, 5] },
  student: { label: 'schoolchild', share: 0.2, ages: [6, 18] },
  worker_out: { label: 'works outside the city', share: 0.27, ages: [17, 60] },
  worker_in: { label: 'factory / workshop hand', share: 0.17, ages: [15, 65] },
  shopkeeper: { label: 'shopkeeper', share: 0.06, ages: [25, 70] },
  homemaker: { label: 'homemaker', share: 0.12, ages: [22, 65] },
  elder: { label: 'elder', share: 0.1, ages: [62, 90] },
};

const CLOTHES = ['#e9e4d8', '#d8d3c4', '#2f3d55', '#4a5a6e', '#7a2a24', '#c8b48a', '#3c3c3e', '#5c7a8c', '#a8c0c8', '#c97b5a', '#556b4f', '#efe8d0'];

const WALK = 1.25; // m/s
const CLIMB = 0.28; // m/s vertical on stairs

// Days of the week from Tue 16 Dec 1986. Day 6 is 冬至.
export const WEEK = ['TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN', 'MON'];
export const SAT = 4, SUN = 5, DONGZHI = 6;

export function createPopulation(L, total = 33000, seed = 1987) {
  const rng = mulberry32(seed);
  const B = L.buildings;
  const flats = [];
  for (const b of B)
    for (let f = 0; f < b.floors; f++) if (b.uses[f] === 'home') for (let m = 0; m < b.flats; m++) flats.push({ b: b.id, f, m });

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
      if (b) home = { type: 'in', b: b.id, f: h.floor, ...spotIn(L, b, 0, rng) };
    } else if (h) {
      const c = B.filter((b) => b.kind === 'tenement' && b.floors > h.floor + 1 && b.uses[h.floor] === 'home');
      const b = c[Math.floor(rng() * c.length)];
      home = { type: 'in', b: b.id, f: h.floor, ...spotIn(L, b, 0, rng) };
    }
    if (!home && homeOf.has(R.key)) home = homeOf.get(R.key);
    const a = {
      id: agents.length, name: R.name, age: R.age, role: R.sched, real: R, home, flat: 0,
      color: new THREE.Color('#e8c14a'), rng: rng(),
    };
    if (h && h.pair) homeOf.set(h.pair, home);
    if (R.work) {
      const c = B.filter((b) => b.uses[0] === R.work.use && b.floors > 1 && (R.work.near === 'edge' ? b.front !== 'inner' : b.front === 'inner'));
      const b = c[Math.floor(rng() * c.length)] || B.find((x) => x.uses[0] === R.work.use);
      a.work = { type: 'in', b: b.id, f: 0, what: R.work.use, ...spotIn(L, b, -1, rng) };
    }
    agents.push(a);
  }
  // 劉太 shares 劉先生's flat.
  for (const a of agents) if (!a.home) a.home = homeOf.get(a.real.key) || { type: 'away', ap: 0, what: 'outside the city' };

  // About 8,500 households (layout.js): one to each flat; a few flats hold two.
  const nHouse = Math.round(flats.length * 1.06);
  const homes = [];
  for (let h = 0; h < nHouse; h++) homes.push(h < flats.length ? flats[h] : flats[Math.floor(rng() * flats.length)]);
  const left = total - agents.length;
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
  for (const { fl, n, surname } of households) {
    const home = { type: 'in', b: fl.b, f: fl.f, ...spotIn(L, B[fl.b], fl.m, rng) };
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
        color: new THREE.Color(CLOTHES[Math.floor(rng() * CLOTHES.length)]),
        rng: rng(),
      };
      if (role === 'worker_in' && work.length) { const w = pickW(work); a.work = { type: 'in', b: w.b, f: w.f, what: w.what, ...spotIn(L, B[w.b], -1, rng) }; }
      if (role === 'shopkeeper' && shops.length) { const w = pickW(shops); a.work = { type: 'in', b: w.b, f: w.f, what: w.what, ...spotIn(L, B[w.b], -1, rng) }; }
      if (role === 'student' && schools.length && rng() < 0.15) { const w = pickW(schools); a.school = { type: 'in', b: w.b, f: w.f, what: 'school', ...spotIn(L, B[w.b], -1, rng) }; }
      agents.push(a);
    }
  }
  return agents;
}

// A spot inside a building: within flat m's slice of the plan, or anywhere if m < 0.
function spotIn(L, b, m, rng) {
  const alongX = b.i1 - b.i0 >= b.j1 - b.j0;
  let cells = b.cells;
  if (m >= 0 && b.flats > 1) {
    const lo = m / b.flats, hi = (m + 1) / b.flats;
    const sub = b.cells.filter((c) => {
      const t = alongX ? ((c % L.W) - b.i0 + 0.5) / (b.i1 - b.i0) : (((c / L.W) | 0) - b.j0 + 0.5) / (b.j1 - b.j0);
      return t >= lo && t < hi;
    });
    if (sub.length) cells = sub;
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
  const home = a.home;
  const away = (what) => ({ type: 'away', ap: Math.floor(rng() * L.away.length), what });
  const roof = () => ({ type: 'roof', b: home.b, x: home.x, z: home.z });
  const yamen = () => {
    const c = L.yard[Math.floor(rng() * L.yard.length)];
    return { type: 'in', b: L.yamenId, f: 0, x: L.cellX(c) + (rng() - 0.5) * 0.8, z: L.cellZ(c) + (rng() - 0.5) * 0.8 };
  };
  const sat = dow === SAT, sun = dow === SUN, dz = dow === DONGZHI;
  const DZ = '冬至 dinner with the family (做冬)';
  // On 冬至 the family is home for dinner, and stays in.
  const dongzhi = (t = 18.25) => { at(J(H(Math.floor(t), (t % 1) * 60), 20), home, DZ); at(J(H(22, 40), 30), home, 'asleep'); };
  at(0, home, 'asleep');
  switch (a.role) {
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
      const school = a.school || away('at school');
      if (sat) {
        at(J(H(7, 35), 15), school, 'at school (Saturday morning)');
        at(J(H(12, 40), 15), home, 'lunch at home');
        if (rng() < 0.55) { at(J(H(14, 0), 40), roof(), 'playing on the roofs'); at(J(H(17, 50), 20), home, 'dinner'); }
      } else if (a.age < 12 && a.rng < 0.5) {
        at(J(H(7, 25), 15), school, 'at school (morning session)');
        at(J(H(12, 50), 15), home, 'lunch at home');
        if (rng() < 0.45) { at(J(H(15, 45), 30), roof(), 'playing on the roofs'); at(J(H(17, 15), 20), home, 'homework'); }
      } else if (a.age < 12) {
        if (rng() < 0.4) { at(J(H(9, 30), 30), roof(), 'playing on the roofs'); at(J(H(11, 15), 15), home, 'lunch'); }
        at(J(H(12, 30), 10), school, 'at school (afternoon session)');
        at(J(H(dz ? 17 : 18, 25), 10), home, dz ? 'home for 冬至' : 'dinner');
      } else {
        at(J(H(7, 30), 15), school, 'at secondary school');
        at(J(H(16, 50), 25), home, 'homework');
        if (!dz && rng() < 0.3) { at(J(H(17, 0), 10), roof(), 'on the roofs'); at(J(H(18, 30), 15), home, 'dinner'); }
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
      if (dz) {
        at(J(H(14, 30), 30), away('buying food for the 冬至 dinner'), 'buying food for the 冬至 dinner');
        at(J(H(15, 45), 20), home, 'cooking the 冬至 dinner');
        dongzhi();
        break;
      }
      if (rng() < 0.2) { at(J(H(15, 30), 25), away('shopping'), 'shopping'); at(J(H(16, 30), 15), home, 'cooking dinner'); }
      at(J(H(22, 30), 30), home, 'asleep');
      break;
    }
    case 'elder': {
      at(J(H(5, 15), 25), home, 'up early');
      const r = rng();
      if (r < 0.55) { at(J(H(6, 0), 20), away('at a tea house'), 'at a tea house'); at(J(H(9, 15), 40), home, 'resting'); }
      else if (r < 0.8) { at(J(H(6, 0), 20), roof(), 'morning exercise on the roof'); at(J(H(7, 15), 20), home, 'resting'); }
      else at(J(H(7, 30), 30), home, 'at home');
      if (rng() < 0.35) { at(J(H(14, 30), 30), yamen(), 'at the old people’s centre in the Yamen'); at(J(H(17, 15), 30), home, 'resting'); }
      if (dz) { dongzhi(18); break; }
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
      const hall = { type: 'in', b: home.b, f: home.f, ...spotIn(L, L.buildings[home.b], -1, rng) };
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
        at(H(19, 15), { type: 'in', b: ob.id, f: 0, ...spotIn(L, ob, -1, rng) }, 'mahjong with other bosses after work');
        at(H(23, 0), a.home, 'home, outside the city (not recorded)');
      } else at(H(19, 0), a.home, 'home, outside the city (not recorded)');
      break;
    }
    case 'postman': {
      a.home = away('off duty');
      S.length = 0;
      at(0, a.home, 'off duty');
      if (sun) break;
      const stop = () => {
        const c = L.buildings.filter((b) => b.kind === 'tenement' && b.floors > 3);
        const b = c[Math.floor(rng() * c.length)];
        const f = 1 + Math.floor(rng() * (b.floors - 1));
        return { type: 'in', b: b.id, f, ...spotIn(L, b, -1, rng) };
      };
      let t = H(8, 30);
      at(t, laneSpot(L, rng, null), 'starting his round');
      for (t += 15; t < H(sat ? 12 : 16, 15); t += 22 + rng() * 10) {
        if (!sat && t > H(12, 30) && t < H(13, 15)) { t = H(13, 15); continue; }
        at(t, stop(), 'delivering the mail, up the stairs');
      }
      at(t, a.home, 'off duty');
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
    this.selected = -1;
    this.activity = new Float32Array(144);
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

  // Waypoints [x, z, y, level] from one place to another.
  plan(a, from, to) {
    const L = this.L, B = L.buildings;
    const pts = [];
    const ox = (a.rng - 0.5) * 0.6, oz = (((a.rng * 7919) % 1) - 0.5) * 0.6;
    const yOf = (p) => (p.type === 'roof' ? B[p.b].floors * STOREY : p.type === 'ground' ? 0 : p.f * STOREY);
    const lvOf = (p) => (p.type === 'roof' ? B[p.b].floors - 1 : p.type === 'ground' ? 0 : p.f);
    const stairXZ = (b) => [L.cellX(B[b].stair), L.cellZ(B[b].stair)];
    if (from.type === 'away') {
      const c = L.away[from.ap];
      pts.push([L.cellX(c) + ox, L.cellZ(c) + oz, 0, 0]);
    } else {
      pts.push([from.x, from.z, yOf(from), lvOf(from)]);
    }
    const inB = (p) => p.type === 'in' || p.type === 'roof';
    const sameBuilding = inB(from) && inB(to) && from.b === to.b;
    if (sameBuilding) {
      const [sx, sz] = stairXZ(from.b);
      if (yOf(from) !== yOf(to)) {
        pts.push([sx, sz, yOf(from), lvOf(from)]);
        pts.push([sx, sz, yOf(to), lvOf(to)]);
      }
      pts.push([to.x, to.z, yOf(to), lvOf(to)]);
      return pts;
    }
    let start;
    if (from.type === 'away') start = L.away[from.ap];
    else if (from.type === 'ground') start = from.k;
    else {
      const [sx, sz] = stairXZ(from.b);
      pts.push([sx, sz, yOf(from), lvOf(from)]);
      pts.push([sx, sz, 0, 0]);
      start = B[from.b].stair;
    }
    const target = to.type === 'away' ? L.away[to.ap] : to.type === 'ground' ? to.k : B[to.b].stair;
    this.groundRoute(start, target, ox, oz, pts);
    if (to.type === 'ground') pts.push([to.x, to.z, 0, 0]);
    else if (to.type !== 'away') {
      const [sx, sz] = stairXZ(to.b);
      pts.push([sx, sz, 0, 0]);
      pts.push([sx, sz, yOf(to), lvOf(to)]);
      pts.push([to.x, to.z, yOf(to), lvOf(to)]);
    }
    return pts;
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
  tint(a) {
    const o = a.id * 3;
    let r = a.color.r, g = a.color.g, b = a.color.b;
    if (a.id === this.selected) { r = 1; g = 0.36; b = 0.22; }
    else if (a.act === 'asleep') { r *= 0.3; g *= 0.3; b *= 0.34; }
    this.aC[o] = r; this.aC[o + 1] = g; this.aC[o + 2] = b;
    this.colorsDirty = true;
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
        if (a.sched[s][1].type === 'in' && a.sched[s][1] === a.home) continue;
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
    const speed = a.role === 'elder' ? WALK * 0.65 : a.role === 'child' ? WALK * 0.8 : WALK;
    const tc = [0];
    for (let q = 1; q < pts.length; q++) {
      const p = pts[q - 1], c = pts[q];
      const h = Math.hypot(c[0] - p[0], c[1] - p[1]), v = Math.abs(c[2] - p[2]);
      tc.push(tc[q - 1] + h / speed + v / (a.role === 'elder' ? CLIMB * 0.6 : CLIMB));
    }
    a.trip = { pts, tc, t0: now, seg: 0, to };
    a.loc = { type: 'moving' };
    this.moving.push(a.id);
  }

  finish(a) {
    const to = a.trip.to;
    a.trip = null;
    this.place(a, to);
  }

  // Advance by dt simulated seconds.
  step(dt) {
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
        if (a.trip || a.act === 'asleep' || !a.loc || a.loc.type !== 'in') continue;
        const base = a.loc.base || a.loc;
        const r = mulberry32((a.id * 31 + Math.floor(this.minute)) | 0);
        const spot = spotIn(this.L, this.L.buildings[base.b], base === a.home ? a.flat : -1, r);
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
    }
  }

  // Where is someone, in words.
  describe(a) {
    const B = this.L.buildings;
    const STREET = { lys: '老人街 Lo Yan St', kms: '光明街 Kwong Ming St', tcs: '大井街 Tai Tseng St', skg: '社公街 Sz Kung St', lsr: '龍城路 Lung Shing Rd' };
    const where = (p) => {
      if (!p) return '';
      if (p.type === 'away') return 'outside the city';
      if (p.type === 'ground') return p.street ? `in the lane of ${STREET[p.street]}` : 'in a lane';
      if (p.type === 'roof') return `roof of ${buildingName(B[p.b])}`;
      if (p.type === 'in') return `${p.f === 0 ? 'G/F' : p.f + '/F'}, ${buildingName(B[p.b])}`;
      return '';
    };
    const moving = !!a.trip;
    return {
      title: a.name,
      role: a.real ? a.real.role : ROLES[a.role].label,
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

// Instanced figures, positioned in the vertex shader so that storeys can be lifted apart
// without touching per-person data.
export function makePeopleMesh(sim, shared) {
  const n = sim.agents.length;
  const body = new THREE.BoxGeometry(0.5, 1.22, 0.34).translate(0, 0.61, 0);
  const head = new THREE.BoxGeometry(0.3, 0.3, 0.3).translate(0, 1.4, 0);
  const base = mergeGeometries([body, head]);
  const g = new THREE.InstancedBufferGeometry();
  g.index = base.index;
  g.setAttribute('position', base.getAttribute('position'));
  g.setAttribute('normal', base.getAttribute('normal'));
  const aP = new THREE.InstancedBufferAttribute(sim.aP, 4);
  aP.setUsage(THREE.DynamicDrawUsage);
  const aC = new THREE.InstancedBufferAttribute(sim.aC, 3);
  aC.setUsage(THREE.DynamicDrawUsage);
  g.setAttribute('aP', aP);
  g.setAttribute('aC', aC);
  g.instanceCount = n;
  const m = new THREE.MeshLambertMaterial({ color: 0xffffff });
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, shared);
    s.vertexShader = s.vertexShader
      .replace('#include <common>', `#include <common>
attribute vec4 aP; attribute vec3 aC; varying vec3 vAC;
uniform float uOff[16]; uniform float uCutY; uniform float uPeopleScale;`)
      .replace('#include <begin_vertex>', `
vec3 transformed = position * uPeopleScale;
float lv = clamp(aP.w, 0.0, 14.99);
int i0 = int(floor(lv));
int i1 = min(i0 + 1, 15);
float off = mix(uOff[i0], uOff[i1], fract(lv));
transformed += vec3(aP.x, aP.z + off, aP.y);
vAC = aC;
if (aP.w < -0.5 || aP.z > uCutY) transformed = vec3(0.0, -1.0e5, 0.0);`);
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>
varying vec3 vAC;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
diffuseColor.rgb *= vAC;`);
  };
  m.customProgramCacheKey = () => 'kwc-people';
  const mesh = new THREE.Mesh(g, m);
  mesh.frustumCulled = false;
  return { mesh, aP, aC };
}
