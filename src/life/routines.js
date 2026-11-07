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
  // The household of the day (planHouse): its dinner, its water, who fetches the drinking water.
  const F = p.hh !== undefined && X.house ? X.house(p, dow) : null;
  const dongzhi = (t = 18.25) => {
    at(F ? F.dinner : J(H(Math.floor(t), (t % 1) * 60), 20), home, F && F.members === 1 ? '冬至 dinner' : DZ);
    at(J(H(22, 40), 30), home, 'asleep');
  };
  // Dinner: with the family, with the others of a shared flat, or alone (some at an eating house).
  const dinner = (old = false) => {
    if (!F) return;
    if (F.members > 1) {
      at(F.dinner, home, F.kind === 'sharers' ? 'dinner with the others of the flat' : 'dinner with the family');
      if (F.rubbish?.who === p.id && F.rubbish.how === 'throw') {
        const t = F.dinner + J(30, 5);
        at(t, home, 'throwing the rubbish out of the window, into the gap between the buildings (pp103, 209)');
        at(t + 3, home, p.role === 'homemaker' ? 'washing up' : 'the evening at home');
      }
      return;
    }
    if (!old && X.places.eating.length && r() < 0.35) {
      at(F.dinner - 10, X.places.eating[Math.floor(r() * X.places.eating.length)], 'dinner at an eating house');
      at(F.dinner + J(40, 10), home, 'at home');
    } else at(F.dinner, home, old ? 'an early supper alone' : 'dinner alone');
  };
  // Sunday: the family goes out together; all its members leave at the same minute.
  const outing = () => {
    if (!F?.outing) return false;
    at(F.outing.t0, OUT('out with the family'), 'out with the family');
    at(F.outing.t1, home, 'home');
    return true;
  };
  // The drinking water: the well water was not fit to drink, so each day someone carried
  // drinking water from the nearest of the eight standpipes up the stairs (pp108, 249).
  const fetch = (t, after) => {
    if (!F || F.fetch !== p.id || !p.home) return false;
    const pipe = X.pipeFor(p.home);
    if (!pipe) return false;
    const w = X.walkMin(p.home, pipe), back = t + w + J(10, 6);
    at(t, pipe, 'fetching drinking water at the standpipe (pp108, 249)');
    at(back, home, 'carrying the drinking water home, up the stairs (p249)');
    at(back + w + 3, home, after);
    return true;
  };
  // The well water of the day: when it comes to this floor, the drums and the bath are filled.
  const fill = () => {
    if (!F || F.filler !== p.id || !F.water.day) return;
    const t = F.water.day[0] + J(8, 6);
    at(t, home, F.water.kind === 'floors' ? 'filling the drums and the bath: the water has come to this floor (HK01)' : 'filling the drums and the bath while the taps run after the noon pump (p107)');
    at(t + J(40, 10), home, p.role === 'elder' ? 'resting' : 'housework');
  };
  // The water of the night, after the midnight pump: some wake at the sound of it and do the
  // washing (Tam Sau-kuen (譚秀娟), WSJ).
  const night = () => {
    if (!F || F.washer !== p.id || !F.water.night) return;
    const t = F.water.night[0] + J(15, 10);
    at(t, home, 'woken by the sound of the water: doing the washing (WSJ)');
    at(t + J(50, 10), home, 'asleep');
  };
  // The rubbish of the household (planHouse): "the City's residents were not exactly model
  // citizens in this regard" (p104). A few take it to a refuse point before work (p179); some
  // leave it in the orange buckets of the Urban Services Department (p104); the others throw it
  // from the window into the gap between the buildings (pp103, 209).
  const rubbishOut = (t) => {
    if (!F || F.rubbish?.who !== p.id || !p.home) return t;
    if (F.rubbish.how === 'point') {
      const q = X.refuseFor(p.home);
      if (q) { at(t, q, 'taking the rubbish down to the refuse point before work (p179)'); return t + X.walkMin(p.home, q) + 2; }
    }
    if (F.rubbish.how === 'bucket') at(t - 3, home, 'taking the rubbish down to the orange buckets (p104)');
    return t;
  };
  // The evening after dinner.
  const evening = (back = 0) => {
    if (!F) return;
    at(Math.max(back, F.dinner) + J(45, 10), home, 'the evening at home');
  };
  at(0, home, p.home ? 'asleep' : home.what);

  switch (p.role) {
    case 'child': {
      const kin = F?.kinder.get(p.id);
      at(J(H(7, 0), 30), home, 'breakfast');
      if (kin) {
        at(F.kinderT, kin, kin.kind === 'out' ? kin.what : 'at the Salvation Army kindergarten (p300)');
        at(F.kinderBack + 2, home, 'lunch at home');
        at(F.kinderBack + 40, home, 'an afternoon nap');
        at(F.kinderBack + 140, home, 'at home');
      } else at(J(H(7, 40), 20), home, p.age < 3 ? 'at home with the family' : 'playing at home');
      if (!sun && r() < 0.25) { at(J(H(15, 30), 40), roof(), 'playing on the roof'); at(J(H(17, 0), 20), home, 'at home'); }
      if (outing()) {}
      if (dz) { dongzhi(); break; }
      dinner();
      at(Math.max(F ? F.dinner + 50 : 0, J(H(20, 30), 20)), home, 'asleep');
      break;
    }
    case 'student': {
      if (sun) {
        at(J(H(8, 0), 40), home, 'Sunday at home');
        if (!outing()) {
          const q = r();
          if (q < 0.35) { at(J(H(10, 0), 60), roof(), 'playing on the roofs'); at(J(H(12, 30), 30), home, 'lunch'); }
          if (r() < 0.4) { at(J(H(15, 0), 40), roof(), 'flying a kite from the roof'); at(J(H(17, 30), 20), home, 'at home'); }
        }
        fetch(J(H(16, 30), 40), 'homework');
        dinner();
        at(J(H(21, 45), 30), home, 'asleep');
        break;
      }
      at(J(H(6, 40), 20), home, 'getting ready for school');
      const school = OUT('at school');
      // Children wrap the candy of the candy factory after school (p77).
      const candy = () => {
        if (p.seed > 0.12 || !X.places.candy || dz || (dow + p.id) % 3 === 0) return false;
        at(J(H(16, 50), 10), X.places.candy, 'wrapping candy for the candy factory (p77)');
        at(J(H(19, 10), 15), home, 'home from the candy factory');
        return true;
      };
      // A few go to the tutoring club 勤思補習社 after school (262:2:0).
      const tutor = () => {
        if (!X.places.tutor || p.age < 9 || p.seed < 0.985 || sat || dz) return false;
        at(J(H(17, 0), 10), X.places.tutor, 'at the tutoring club 勤思補習社');
        at(J(H(18, 45), 10), home, 'homework');
        return true;
      };
      let back = 0;
      if (sat) {
        at(J(H(7, 35), 15), school, 'at school (Saturday morning)');
        at((back = J(H(12, 40), 15)), home, 'lunch at home');
        fetch(back + J(40, 15), 'at home');
        if (r() < 0.55) { at(J(H(14, 30), 30), roof(), 'playing on the roofs'); at(J(H(17, 50), 20), home, 'at home'); }
      } else if (p.age < 12 && p.seed < 0.5) {
        at(rubbishOut(J(H(7, 25), 15)), school, 'at school (morning session)');
        at((back = J(H(12, 50), 15)), home, 'lunch at home');
        if (!fetch(J(H(14, 15), 20), 'homework') && !candy() && r() < 0.45) { at(J(H(15, 45), 30), roof(), 'playing on the roofs'); at(J(H(17, 15), 20), home, 'homework'); }
      } else if (p.age < 12) {
        if (r() < 0.4) { at(J(H(9, 30), 30), roof(), 'playing on the roofs'); at(J(H(11, 15), 15), home, 'lunch'); }
        at(J(H(12, 30), 10), school, 'at school (afternoon session)');
        at((back = J(H(dz ? 17 : 18, 25), 10)), home, dz ? 'home for 冬至' : 'home from school');
        if (!dz) fetch(back + 10, 'homework');
      } else {
        at(rubbishOut(J(H(7, 30), 15)), school, 'at secondary school');
        at((back = J(H(16, 30), 10)), home, 'homework');
        if (!fetch(back + J(20, 10), 'homework') && !tutor() && !candy() && !dz && r() < 0.3) { at(J(H(17, 0), 10), roof(), 'on the roofs'); at(J(H(18, 30), 15), home, 'homework'); }
      }
      if (dz) { dongzhi(18.4); break; }
      dinner();
      at(F ? F.dinner + J(50, 10) : J(H(20, 0), 20), home, 'homework');
      at(J(H(21, 45), 30), home, 'asleep');
      break;
    }
    case 'worker_out': {
      if (sun && r() < 0.85) {
        at(J(H(8, 0), 40), home, 'Sunday at home');
        if (!outing() && r() < 0.4) { at(J(H(9, 30), 40), OUT('out'), 'out'); at(J(H(13, 30), 60), home, 'home'); }
        fetch(J(H(16, 0), 60), 'at home');
        dinner();
        evening();
        at(J(H(23, 0), 30), home, 'asleep');
        break;
      }
      at(J(H(6, 15), 25), home, 'breakfast');
      at(rubbishOut(J(H(7, 20), 30)), OUT('at work outside the City'), 'at work outside the City');
      if (dz) { at(J(H(17, 40), 30), home, 'home early for 冬至'); dongzhi(); break; }
      let back;
      if (sat && r() < 0.5) at((back = J(H(13, 45), 30)), home, 'home after a half day');
      else if (r() < 0.15) { at((back = (F ? F.dinner : H(19, 20)) + J(70, 30)), home, 'home late from work: a late dinner'); }
      else at((back = (F ? F.dinner : H(19, 20)) - J(22, 12)), home, 'home from work');
      fetch(back + 5, 'at home');
      if (F && back < F.dinner) dinner();
      evening(back);
      at(J(H(23, 20), 15), home, 'asleep');
      break;
    }
    case 'worker_in': {
      if (sun && r() < 0.75) {
        at(J(H(8, 0), 40), home, 'Sunday at home');
        if (!outing() && r() < 0.35) { at(J(H(9, 30), 40), OUT('out'), 'out'); at(J(H(13, 30), 60), home, 'home'); }
        fetch(J(H(16, 0), 60), 'at home');
        dinner();
        evening();
        at(J(H(23, 0), 30), home, 'asleep');
        break;
      }
      const w = p.work, what = X.workDoing(w);
      at(J(H(6, 45), 20), home, 'breakfast');
      at(rubbishOut(J(H(7, 45), 20)), w, what);
      if (r() < 0.4) { at(J(H(12, 10), 8), home, 'lunch at home'); at(J(H(13, 0), 8), w, what); }
      else { at(J(H(12, 15), 10), w, 'lunch at the workbench'); at(J(H(12, 50), 5), w, what); }
      if (dz) { at(J(H(17, 50), 20), home, 'home early for 冬至'); dongzhi(); break; }
      const end = J(H(19, 0), 30);
      at(end, home, 'home from work');
      fetch(end + 5, 'at home');
      if (F && end < F.dinner) dinner(); else at(end + 3, home, 'dinner, kept warm');
      evening(end);
      at(J(H(23, 0), 30), home, 'asleep');
      break;
    }
    case 'shopkeeper': {
      at(J(H(6, 30), 20), home, 'breakfast');
      at(J(H(sun ? 9 : 7, 45), 30), p.work, X.workDoing(p.work, true));
      if (F && F.members > 1 && !dz) { at(F.dinner + J(5, 5), p.work, 'dinner, brought from home'); at(F.dinner + J(30, 5), p.work, X.workDoing(p.work, true)); }
      if (dz) { at(J(H(18, 0), 20), home, 'shut early for 冬至'); dongzhi(18.5); break; }
      at(J(H(sun ? 19 : 21, 30), 40), home, F && F.members > 1 ? 'home from the shop' : 'supper');
      at(J(H(23, 30), 20), home, 'asleep');
      break;
    }
    case 'carrier': {
      // A water carrier: drinking water from the nearest standpipe up the stairs to the homes
      // that pay for it (pp108, 249). The clients, the rounds and the hours are INFERRED.
      if (sun && r() < 0.5) { at(J(H(8, 0), 40), home, 'Sunday at home'); dinner(); at(J(H(22, 30), 30), home, 'asleep'); break; }
      at(J(H(6, 0), 15), home, 'breakfast');
      let t = J(H(6, 45), 10);
      const list = (p.clients || []).filter((c) => (c + dow) % 2 === 0);
      for (const c of list) {
        const ch = X.homeOf(c);
        if (!ch) continue;
        if (t > H(12, 0) && t < H(13, 0)) { at(t, home, 'lunch'); t += 40; }
        if (t > H(19, 0)) break;
        const pipe = X.pipeFor(ch);
        if (!pipe) continue;
        at(t, pipe, 'filling the buckets at the standpipe (p108)');
        const w = X.walkMin(ch, pipe);
        at(t + 4 + r() * 3, ch, 'carrying the water up the stairs to a home that pays for it (p108)');
        t += 7 + 2 * w + r() * 4;
      }
      at(t, home, 'home');
      dinner();
      at(J(H(22, 30), 30), home, 'asleep');
      break;
    }
    case 'homemaker': {
      at(J(H(5, 45), 20), home, 'cooking breakfast');
      const kids = F?.taker === p.id && F.kinder.size;
      let t = J(H(8, 15), 20);
      if (kids) {
        const kin = [...F.kinder.values()][0];
        at(F.kinderT - 1, kin, 'taking the children to the kindergarten');
        t = F.kinderT + 15;
      }
      t = rubbishOut(t);
      at(t, OUT('at the market'), 'at the market');
      at(t + J(80, 15), home, 'cooking');
      const q = r(), fetchAt = q < 0.35 ? Math.max(t + 85, J(H(10, 15), 60)) : q < 0.8 ? J(H(15, 30), 60) : J(H(17, 0), 25);
      if (fetchAt < H(12, 0)) fetch(fetchAt, 'housework');
      if (r() < 0.4) { at(J(H(11, 0), 15), roof(), 'hanging the laundry on the roof'); at(J(H(11, 30), 10), home, 'housework'); }
      if (kids) { const kin = [...F.kinder.values()][0]; at(F.kinderBack - 4, kin, 'fetching the children from the kindergarten'); at(F.kinderBack + 2, home, 'lunch'); }
      else at(J(H(12, 30), 15), home, 'lunch');
      at(J(H(13, 15), 10), home, 'housework');
      fill();
      if (fetchAt >= H(12, 0)) fetch(fetchAt, 'housework');
      if (dz) {
        at(J(H(14, 30), 30), OUT('buying food for the 冬至 dinner'), 'buying food for the 冬至 dinner');
        at(J(H(15, 45), 20), home, 'cooking the 冬至 dinner');
        dongzhi();
        break;
      }
      if (r() < 0.2) { at(J(H(15, 30), 25), OUT('shopping'), 'shopping'); at(J(H(16, 30), 15), home, 'housework'); }
      if (r() < 0.12) { at(J(H(17, 0), 10), roof(), 'on the roof in the early evening (p322)'); at(J(H(17, 40), 10), home, 'housework'); }
      at((F ? F.dinner : H(19, 0)) - J(75, 15), home, 'cooking dinner');
      dinner();
      at((F ? F.dinner : H(19, 0)) + J(35, 8), home, 'washing up');
      evening((F ? F.dinner : H(19, 0)) + 25);
      at(J(H(22, 30), 30), home, 'asleep');
      night();
      break;
    }
    case 'elder': {
      at(J(H(5, 15), 25), home, 'up early');
      const q = r(), takes = F?.taker === p.id && F.kinder.size;
      if (q < 0.5 && !takes) { at(J(H(6, 0), 20), OUT('at a tea house'), 'at a tea house'); at(J(H(9, 15), 40), home, 'resting'); }
      else if (q < 0.78) { at(J(H(6, 0), 20), roof(), 'morning exercise on the roof'); at(J(H(7, 15), 20), home, 'resting'); }
      else at(J(H(7, 30), 30), home, 'at home');
      if (takes) {
        const kin = [...F.kinder.values()][0];
        at(F.kinderT - 1, kin, 'taking the grandchildren to the kindergarten');
        at(F.kinderT + 15, home, 'resting');
        at(F.kinderBack - 4, kin, 'fetching the grandchildren from the kindergarten');
        at(F.kinderBack + 2, home, 'lunch');
      } else if (F?.small && !F.hasHomemaker) at(J(H(8, 0), 20), home, 'minding the grandchildren');
      fetch(r() < 0.6 ? J(H(10, 0), 70) : J(H(15, 45), 60), 'resting');
      fill();
      // The Old People's Centre: afternoons Monday to Saturday, worship on Sunday (pp305-306).
      if (X.places.centre && !sun && r() < 0.3) { at(J(H(14, 30), 30), X.places.centre, 'tea and TV at the Old People’s Centre (pp305–306)'); at(J(H(17, 15), 30), home, 'resting'); }
      else if (X.places.centre && sun && r() < 0.15) { at(J(H(10, 15), 10), X.places.centre, 'Sunday worship at the Old People’s Centre (p305)'); at(J(H(11, 40), 15), home, 'resting'); }
      if (outing()) {}
      if (dz) { dongzhi(18); break; }
      // "A grandmother would keep her eye on her own grandchildren as well as the children of
      // her neighbours, while her daughter prepared supper" (p322).
      if (r() < 0.3) { at(J(H(17, 0), 10), roof(), F?.small ? 'on the roof in the early evening, minding the children (p322)' : 'on the roof in the early evening (p322)'); at(J(H(17, 50), 10), home, 'resting'); }
      dinner(true);
      evening();
      at(J(H(21, 15), 30), home, 'asleep');
      night();
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
      // The Urban Services Department's collectors (p104) "come round crashing and banging" from
      // about 4 am (Lee Pui Yuen (李培元), p93). Each of the three clears a third of the refuse
      // points of the named lanes, lane by lane; the order and the minutes are INFERRED.
      let t = J(H(4, 0), 5);
      const per = Math.ceil(X.refuse.length / 3), pts = X.refuse.slice((p.n % 3) * per, (p.n % 3 + 1) * per);
      if (!pts.length) for (let k = 0; k < 8; k++) pts.push(X.laneSpot(r));
      for (const q of pts) { at(t, q, 'emptying the refuse point into the cart, crashing and banging (pp93, 104)'); t += 7 + r() * 4; }
      at(t, OUT('taking the refuse out of the City'), 'taking the refuse out of the City');
      break;
    }
    case 'sweeper': {
      // The 10 sweepers of the USD, with their buckets (p104). The hours are INFERRED: 7 to 3,
      // Monday to Saturday.
      if (sun) break;
      for (let t = J(H(7, 0), 10); t < H(dz ? 14 : 15, 0); t += 18 + r() * 12) {
        if (X.refuse.length && r() < 0.35) at(t, X.refuse[Math.floor(r() * X.refuse.length)], 'sweeping round a refuse point (p104)');
        else at(t, X.laneSpot(r), 'sweeping the lane (p104)');
      }
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

// The drinking water of building b. The well water was not fit to drink (p108): "the illegal
// tapping of mains water remained an important source of drinking water until the end" (p110),
// and families carried drinking water from the standpipes (p249). Which blocks had a mains tap
// is INFERRED: about half.
export const mainsTap = (b) => mulberry32(b * 104723 + 5)() < 0.5;

// The household of a day: what its members share. INFERRED, except where a fact is named.
// h: a household of population.js; mem: its members; X: the context (sim.js).
export function planHouse(h, mem, dow, X) {
  const r = mulberry32(Math.floor(h.seed * 1e9) + dow * 104729);
  const J = (base, spread) => Math.round(base + (r() - 0.5) * 2 * spread);
  const sat = dow === SAT, sun = dow === SUN, dz = dow === DONGZHI;
  const of = (role) => mem.filter((m) => m.role === role);
  const F = { members: mem.length, kind: h.kind, water: X.water(h.home.b, h.home.k), filler: -1, washer: -1, fetch: -1, outing: null, kinder: new Map(), taker: -1 };
  // dinner: when the workers are home; early on 冬至
  F.dinner = dz ? J(H(18, 15), 15) : sun ? J(H(18, 30), 30) : of('worker_out').length ? J(H(19, 20), 30) : J(H(18, 40), 25);
  const mum = of('homemaker')[0], old = of('elder').sort((a, b) => a.age - b.age)[0], keeper = mum || old || null;
  F.hasHomemaker = !!mum;
  F.small = of('child').length > 0;
  // who is at home when the well water comes, and who wakes for it at night
  if (keeper) F.filler = keeper.id;
  if (keeper && F.water.night && r() < (mum ? 0.4 : 0.2)) F.washer = keeper.id;
  // who carries the drinking water, unless the household pays a carrier (population.js)
  if (!(h.carrier >= 0) && !mainsTap(h.home.b)) {
    const kid = of('student').filter((m) => m.age >= 10).sort((a, b) => b.age - a.age)[0];
    const who = mum || (kid && r() < 0.7 ? kid : null) || (old && old.age < 78 ? old : null) || mem.find((m) => m.role !== 'child' && m.role !== 'elder') || kid || old;
    if (who) F.fetch = who.id;
  }
  // the rubbish (shares INFERRED): who takes it down in the morning, or throws it out at night
  {
    const q = r(), how = q < 0.15 ? 'point' : q < 0.6 ? 'bucket' : 'throw';
    const leaver = of('worker_out')[0] || of('worker_in')[0] || of('student').find((m) => m.age >= 10) || mum;
    const who = how === 'throw' ? keeper || mem.find((m) => m.role !== 'child') : leaver;
    F.rubbish = who && !sun ? { who: who.id, how } : null;
  }
  if (sun && h.kind === 'family' && r() < 0.45) F.outing = { t0: J(H(9, 40), 30), t1: J(H(14, 0), 50) };
  // the kindergarten (ages 3 to 5), Monday to Friday; the homemaker or a grandparent takes them
  if (!sat && !sun) {
    const kin = X.kinderFor(h.id);
    for (const c of of('child')) if (c.age >= 3 && r() < 0.75) F.kinder.set(c.id, kin);
    if (F.kinder.size) { F.taker = keeper ? keeper.id : -1; F.kinderT = J(H(8, 35), 8); F.kinderBack = J(H(11, 55), 8); }
  }
  return F;
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
