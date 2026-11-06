// The day of each person: a list of [minute, place, doing], sorted by the minute. At each
// minute the person leaves for the place and does the thing there. Day 0 of the week is
// Tuesday 16 December 1986; day 6 is Monday 22 December, 冬至 (the winter solstice).
//
// SOURCED (City of Darkness Revisited, 2014): the Salvation Army kindergarten (p300), candy
// wrapping after school (p77), the Old People's Centre (pp305-306), the roofs in the early
// evening (p322), children on the roofs (Albert Ng (吳錦波), SCMP, 4 January 2013), the one
// standpipe (p107), police on the beat (pp251, 283), refuse (p104), meter readers (p98),
// patients from outside (p242).
// INFERRED: all the hours of the crowd. A 1980s Hong Kong week: work and school six days,
// Saturday school in the morning only, Sunday off for most. On 冬至 families eat together
// ("做冬") and many leave work early: a Hong Kong-wide custom, INFERRED for the City.
//
// The real people (data/routines.json) follow their own weeks: each slot gives the days, the
// hours, the place and what they do, with its basis (sourced or inferred).
import { mulberry32 } from '../util.js';

export const DAYS = ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon'];
export const SAT = 4, SUN = 5, DONGZHI = 6;
const H = (h, m = 0) => h * 60 + m;
const clampM = (t) => Math.max(1, Math.min(1438, Math.round(t)));
export const OUT = (what) => ({ kind: 'out', what });

// "Tue-Sat", "Tue,Thu", "all", "Sun" -> the set of the day numbers
export function daySet(s) {
  if (!s || s === 'all') return new Set([0, 1, 2, 3, 4, 5, 6]);
  const out = new Set();
  for (const part of String(s).split(',').map((x) => x.trim())) {
    const [a, b] = part.split('-').map((x) => DAYS.indexOf(x.slice(0, 3)));
    if (a < 0) continue;
    if (b === undefined || b < 0) out.add(a);
    else for (let d = a; ; d = (d + 1) % 7) { out.add(d); if (d === b) break; }
  }
  return out;
}
const minute = (s) => { const [h, m] = String(s).split(':').map(Number); return h * 60 + (m || 0); };

// X: the context (sim.js): rng, places, roofFor, laneSpot, postRound, workDoing.
export function planDay(p, dow, X) {
  const ev = [];
  const r = mulberry32(Math.floor(p.seed * 1e9) + dow * 7919);
  // x: the slot of data/routines.json (its basis and source), for a real person
  const at = (t, place, doing, x) => { if (place) ev.push([clampM(t), place, doing, x]); };
  const J = (base, spread) => base + (r() - 0.5) * 2 * spread;
  const sat = dow === SAT, sun = dow === SUN, dz = dow === DONGZHI;
  const home = p.home || OUT('home, outside the City');
  const roof = () => X.roofFor(p.home?.b) || home;
  const DZ = '冬至 dinner with the family (做冬)';
  const dongzhi = (t = 18.25) => { at(J(H(Math.floor(t), (t % 1) * 60), 20), home, DZ); at(J(H(22, 40), 30), home, 'asleep'); };
  at(0, home, p.home ? 'asleep' : home.what);

  switch (p.role) {
    case 'child': {
      if (p.seed < 0.3 && X.places.kinder && !sat && !sun) {
        at(J(H(7, 0), 30), home, 'breakfast');
        at(J(H(8, 40), 10), X.places.kinder, 'at the Salvation Army kindergarten (p300)');
        at(J(H(12, 5), 10), home, 'lunch at home');
      } else at(J(H(7, 0), 30), home, 'at home');
      if (!sun && r() < 0.25) { at(J(H(15, 30), 40), roof(), 'playing on the roof'); at(J(H(17, 0), 20), home, 'at home'); }
      if (dz) { dongzhi(); break; }
      at(J(H(20, 30), 30), home, 'asleep');
      break;
    }
    case 'student': {
      if (sun) {
        at(J(H(8, 0), 40), home, 'Sunday at home');
        const q = r();
        if (q < 0.35) { at(J(H(10, 0), 60), roof(), 'playing on the roofs'); at(J(H(12, 30), 30), home, 'lunch'); }
        else if (q < 0.6) { at(J(H(9, 45), 30), OUT('out with the family'), 'out with the family'); at(J(H(14, 0), 60), home, 'home'); }
        if (r() < 0.4) { at(J(H(15, 0), 40), roof(), 'flying a kite from the roof'); at(J(H(17, 30), 20), home, 'dinner'); }
        at(J(H(21, 45), 30), home, 'asleep');
        break;
      }
      at(J(H(6, 40), 20), home, 'getting ready for school');
      const school = OUT('at school');
      // Children wrap the candy of the candy factory after school (p77).
      const candy = () => {
        if (p.seed > 0.12 || !X.places.candy || dz || (dow + p.id) % 3 === 0) return false;
        at(J(H(16, 50), 10), X.places.candy, 'wrapping candy for the candy factory (p77)');
        at(J(H(19, 30), 20), home, 'dinner');
        return true;
      };
      if (sat) {
        at(J(H(7, 35), 15), school, 'at school (Saturday morning)');
        at(J(H(12, 40), 15), home, 'lunch at home');
        if (r() < 0.55) { at(J(H(14, 0), 40), roof(), 'playing on the roofs'); at(J(H(17, 50), 20), home, 'dinner'); }
      } else if (p.age < 12 && p.seed < 0.5) {
        at(J(H(7, 25), 15), school, 'at school (morning session)');
        at(J(H(12, 50), 15), home, 'lunch at home');
        if (!candy() && r() < 0.45) { at(J(H(15, 45), 30), roof(), 'playing on the roofs'); at(J(H(17, 15), 20), home, 'homework'); }
      } else if (p.age < 12) {
        if (r() < 0.4) { at(J(H(9, 30), 30), roof(), 'playing on the roofs'); at(J(H(11, 15), 15), home, 'lunch'); }
        at(J(H(12, 30), 10), school, 'at school (afternoon session)');
        at(J(H(dz ? 17 : 18, 25), 10), home, dz ? 'home for 冬至' : 'dinner');
      } else {
        at(J(H(7, 30), 15), school, 'at secondary school');
        at(J(H(16, 30), 10), home, 'homework');
        if (!candy() && !dz && r() < 0.3) { at(J(H(17, 0), 10), roof(), 'on the roofs'); at(J(H(18, 30), 15), home, 'dinner'); }
      }
      if (dz) dongzhi(18.4); else at(J(H(21, 45), 30), home, 'asleep');
      break;
    }
    case 'worker_out': {
      if (sun && r() < 0.85) {
        at(J(H(8, 0), 40), home, 'Sunday at home');
        if (r() < 0.45) { at(J(H(9, 30), 40), OUT('out with the family'), 'out with the family'); at(J(H(13, 30), 60), home, 'home'); }
        at(J(H(23, 0), 30), home, 'asleep');
        break;
      }
      at(J(H(6, 15), 25), home, 'breakfast');
      at(J(H(7, 30), 40), OUT('at work outside the City'), 'at work outside the City');
      if (dz) { at(J(H(17, 40), 30), home, 'home early for 冬至'); dongzhi(); break; }
      if (sat && r() < 0.5) at(J(H(13, 45), 30), home, 'home after a half day');
      else at(J(H(19, 15), 50), home, 'dinner');
      at(J(H(23, 20), 15), home, 'asleep');
      break;
    }
    case 'worker_in': {
      if (sun && r() < 0.75) {
        at(J(H(8, 0), 40), home, 'Sunday at home');
        if (r() < 0.4) { at(J(H(9, 30), 40), OUT('out with the family'), 'out with the family'); at(J(H(13, 30), 60), home, 'home'); }
        at(J(H(23, 0), 30), home, 'asleep');
        break;
      }
      const w = p.work, what = X.workDoing(w);
      at(J(H(6, 30), 30), home, 'getting up');
      at(J(H(7, 30), 30), w, what);
      if (r() < 0.4) { at(J(H(12, 10), 8), home, 'lunch at home'); at(J(H(13, 0), 8), w, what); }
      if (dz) { at(J(H(17, 50), 20), home, 'home early for 冬至'); dongzhi(); break; }
      at(J(H(19, 0), 40), home, 'dinner');
      at(J(H(23, 0), 30), home, 'asleep');
      break;
    }
    case 'shopkeeper': {
      at(J(H(6, 30), 20), home, 'breakfast');
      at(J(H(sun ? 9 : 7, 45), 30), p.work, X.workDoing(p.work, true));
      if (dz) { at(J(H(18, 0), 20), home, 'shut early for 冬至'); dongzhi(18.5); break; }
      at(J(H(sun ? 19 : 21, 30), 40), home, 'supper');
      at(J(H(23, 30), 20), home, 'asleep');
      break;
    }
    case 'homemaker': {
      at(J(H(5, 45), 20), home, 'cooking breakfast');
      at(J(H(8, 15), 30), OUT('at the market'), 'at the market');
      at(J(H(9, 45), 25), home, 'cooking');
      if (r() < 0.4) { at(J(H(10, 30), 25), roof(), 'hanging the laundry on the roof'); at(J(H(11, 15), 15), home, 'housework'); }
      if (X.places.standpipe && r() < 0.06) { at(J(H(12, 45), 30), X.places.standpipe, 'carrying water from the standpipe (p107)'); at(J(H(13, 25), 5), home, 'housework'); }
      if (dz) {
        at(J(H(14, 30), 30), OUT('buying food for the 冬至 dinner'), 'buying food for the 冬至 dinner');
        at(J(H(15, 45), 20), home, 'cooking the 冬至 dinner');
        dongzhi();
        break;
      }
      if (r() < 0.2) { at(J(H(15, 30), 25), OUT('shopping'), 'shopping'); at(J(H(16, 30), 15), home, 'cooking dinner'); }
      if (r() < 0.12) { at(J(H(17, 15), 10), roof(), 'on the roof in the early evening (p322)'); at(J(H(18, 0), 10), home, 'cooking dinner'); }
      at(J(H(22, 30), 30), home, 'asleep');
      break;
    }
    case 'elder': {
      at(J(H(5, 15), 25), home, 'up early');
      const q = r();
      if (q < 0.55) { at(J(H(6, 0), 20), OUT('at a tea house'), 'at a tea house'); at(J(H(9, 15), 40), home, 'resting'); }
      else if (q < 0.8) { at(J(H(6, 0), 20), roof(), 'morning exercise on the roof'); at(J(H(7, 15), 20), home, 'resting'); }
      else at(J(H(7, 30), 30), home, 'at home');
      // The Old People's Centre: afternoons Monday to Saturday, worship on Sunday (pp305-306).
      if (X.places.centre && !sun && r() < 0.3) { at(J(H(14, 30), 30), X.places.centre, 'tea and TV at the Old People’s Centre (pp305–306)'); at(J(H(17, 15), 30), home, 'resting'); }
      else if (X.places.centre && sun && r() < 0.15) { at(J(H(10, 15), 10), X.places.centre, 'Sunday worship at the Old People’s Centre (p305)'); at(J(H(11, 40), 15), home, 'resting'); }
      if (dz) { dongzhi(18); break; }
      // "A grandmother would keep her eye on her own grandchildren as well as the children of
      // her neighbours, while her daughter prepared supper" (p322).
      if (r() < 0.3) { at(J(H(17, 35), 10), roof(), 'on the roof in the early evening, minding the children (p322)'); at(J(H(18, 45), 10), home, 'supper'); }
      at(J(H(21, 0), 40), home, 'asleep');
      break;
    }
    // ---- the people who come in from outside ----
    case 'day_worker': {
      if (sun && r() < 0.85) break;
      const w = p.work, what = X.workDoing(w);
      at(J(H(7, 45), 25), w, what);
      if (X.places.eating.length && r() < 0.25) { at(J(H(12, 15), 10), X.places.eating[Math.floor(r() * X.places.eating.length)], 'lunch at an eating house'); at(J(H(13, 0), 8), w, what); }
      if (dz) { at(J(H(17, 15), 20), home, 'home for 冬至, outside the City'); break; }
      at(sat && r() < 0.5 ? J(H(13, 30), 20) : J(H(19, 0), 35), home, home.what);
      break;
    }
    case 'police': {
      // Two constables to a beat and three 8-hour shifts a day (pp251, 283), part of the beat on
      // the roofs. The hours of the shifts are INFERRED. The two of a pair walk the same beat.
      const q = mulberry32(4100 + dow * 7 + p.shift);
      const stop = () => (q() < 0.12 ? X.anyRoof(q) : X.laneSpot(q));
      const beat = (t0, t1) => { for (let t = t0; t < t1; t += 14 + q() * 8) at(t, stop(), 'on the beat (pp251, 283)'); };
      if (p.shift === 2) { beat(1, H(7, 0)); at(H(7, 0), home, 'off duty'); beat(H(23, 0), H(23, 50)); }
      else { const t0 = H(p.shift ? 15 : 7, 0); beat(t0, t0 + 480); at(t0 + 480, home, 'off duty'); }
      break;
    }
    case 'refuse': {
      // The Urban Services Department's collectors (p104). The hour is INFERRED: before dawn.
      let t = J(H(4, 0), 5);
      for (let k = 0; k < 8; k++, t += 9 + r() * 4) at(t, X.laneSpot(r), 'collecting the refuse (p104)');
      at(t, home, 'gone with the refuse');
      break;
    }
    case 'sweeper': {
      // The 10 sweepers of the USD, with their buckets (p104). The hours are INFERRED: 7 to 3,
      // Monday to Saturday.
      if (sun) break;
      for (let t = J(H(7, 0), 10); t < H(dz ? 14 : 15, 0); t += 18 + r() * 12) at(t, X.laneSpot(r), 'sweeping the lane (p104)');
      at(H(dz ? 14 : 15, 5), home, home.what);
      break;
    }
    case 'meter': {
      // Meter readers with torches in the dark stairs (p98). The days are INFERRED.
      if (dow !== 1 && dow !== 2) break;
      for (let t = J(H(9, 30), 10); t < H(16, 30); t += 12 + r() * 8) at(t, X.anyHome(r), 'reading the meters by torchlight (p98)');
      at(H(16, 45), home, home.what);
      break;
    }
    case 'patient': {
      // Patients from outside go to the dentists and doctors on the outer roads (p242). How many,
      // and when, is INFERRED.
      if (!X.places.clinics.length || r() > (sun ? 0.15 : 0.5)) break;
      const c = X.places.clinics[Math.floor(r() * X.places.clinics.length)];
      const t = sun ? J(H(10, 30), 50) : Math.min(J(H(14, 0), 270), dz ? H(16, 30) : 1430);
      at(t, c, c.cat === 'dentist' ? 'at the dentist (p242)' : 'seeing the doctor (p242)');
      at(t + 25 + r() * 35, home, home.what);
      break;
    }
    case 'real': realDay(p, dow, X, at, r); break;
    default: at(J(H(7, 0), 30), home, 'at home');
  }
  ev.sort((a, b) => a[0] - b[0]);
  return ev;
}

// The day of a real person, from the slots of data/routines.json. A gap is home (or outside
// the City, for a person who lives outside).
function realDay(p, dow, X, at, r) {
  const R = p.routine, home = p.home || OUT('outside the City');
  const placeFor = (s) => {
    if (!s || s === 'home') return home;
    if (s === 'work') return p.work || home;
    if (s === 'out') return OUT('outside the City');
    if (p.places && p.places[s]) return p.places[s];
    if (s.startsWith('roof:')) return X.place(s) || home;
    if (/^\d+:\d+:\d+$/.test(s)) return X.place(s) || home;
    return null;
  };
  const slots = (R.week || []).filter((w) => daySet(w.days).has(dow)).sort((a, b) => minute(a.from) - minute(b.from));
  let end = -1;
  for (const w of slots) {
    const t0 = minute(w.from), t1 = minute(w.to ?? '23:59'), note = w.basis === 'sourced' ? w.doing : `${w.doing}`;
    if (end >= 0 && t0 > end + 1) at(end, home, p.home ? 'at home' : 'outside the City');
    if (w.at === 'round:post') X.postRound(p, t0, t1, at, r, w);
    else if (w.at === 'lanes') { for (let t = t0; t < t1; t += 25 + r() * 15) at(t, X.laneSpot(r), note, w); }
    else if (w.at.startsWith('route:')) at(t0, placeFor(w.at.split('->')[1]) || home, note, w); // the walk from A to B
    else at(t0, placeFor(w.at) || home, note, w);
    end = t1 >= 1439 ? -1 : t1;
  }
  if (end >= 0) at(end, home, p.home ? 'at home' : 'outside the City');
}
