// The day of each person: a list of [minute, place, doing], sorted by the minute. At each
// minute the person leaves for the place and does the thing there. Day 0 of the week is
// Tuesday 16 December 1986; day 6 is Monday 22 December, 冬至 (the winter solstice).
//
// SOURCED (City of Darkness Revisited, 2014): the Salvation Army (救世軍) kindergarten (p300), candy
// wrapping after school (p77), the Old People's Centre (老人中心) (pp305-306), the roofs in the early
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
// The trades of the workshops (not the shops)
const HAND = new Set(['foodfac', 'plastics', 'metal', 'garment', 'works']);
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
  // The fixed blocks of the day (away from home, or the water), so that the errands (the
  // drinking water) and the visits do not cut into them.
  const away = [];
  const block = (t0, t1) => { away.push([t0, t1]); };
  const busy = (t0, t1) => away.some(([a, b]) => t0 < b + 5 && t1 > a - 5);
  const freeAt = (t, len) => {
    for (let k = 0; k < 8; k++) {
      const hit = away.filter(([a, b]) => t < b + 5 && t + len > a - 5);
      if (!hit.length) break;
      t = Math.max(...hit.map((x) => x[1])) + 8;
    }
    return t;
  };
  // A free afternoon (a half day): out, on the roof or at home. The shares are INFERRED.
  const afternoon = (t) => {
    const q = r();
    if (q < 0.3) { const e = J(H(17, 30), 30); at(t, OUT('out'), 'out'); at(e, home, 'home'); block(t, e); }
    else if (q < 0.42) { const e = t + J(60, 20); at(t, roof(), 'on the roof'); at(e, home, 'the afternoon at home'); block(t, e); }
    else at(t, home, 'the afternoon at home');
  };
  // A visit to place pl from about t0 to t1, if the time is free; then `after` at home.
  const visit = (t0, t1, pl, doing, after) => { if (!pl || busy(t0 - 30, t1 + 30)) return false; const a0 = J(t0, 20), a1 = J(t1, 20); at(a0, pl, doing); at(a1, home, after); block(a0, a1); return true; };
  // An errand at the nearest store of the City: the biggest "used to be crowded between 5 and
  // 9pm every day" (p93); "small convenience stores at different floor levels" spared the trek
  // down and were "communal meeting places where people could stop and chat" (p175). Who goes,
  // and when, is INFERRED.
  const store = (t, after) => {
    const s = p.home && X.storeFor?.(p.home);
    if (!s) return false;
    const w = X.walkMin(p.home, s);
    t = freeAt(t, 2 * w + 15);
    const chat = r() < 0.2, stay = chat ? J(20, 8) : J(6, 3);
    at(t, s, chat ? 'buying at the store, and a chat there (p175)' : s.k > 0 ? 'buying at a small store on an upper floor (p175)' : 'buying at a store of the City (p93)');
    at(t + w + stay, home, after);
    block(t, t + 2 * w + stay);
    return true;
  };
  // A haircut at the barber's shop of Ho Chi Kam (何智錦) and his wife: "We are the only
  // hairparlour inside the City and my customers are people living nearby"; "We used to open at
  // 9am and close when there were no more customers" (p28). Who is near (20 m), one haircut in
  // about five weeks, and the hours of the visits are INFERRED.
  const haircut = (t, after) => {
    const s = !dz && p.home && X.barberFor?.(p.home);
    if (!s || r() > 1 / 35) return false;
    const w = X.walkMin(p.home, s), stay = J(35, 10), len = 2 * w + stay;
    t = freeAt(Math.max(t, H(9, 0)), len);
    if (t + len > H(19, 50) || (t + len > H(13, 0) && t < H(13, 45))) return false;
    if (F && t < F.dinner + 40 && t + len > F.dinner - 10) return false;
    at(t, s, 'a haircut at the barber’s shop of Ho Chi Kam (何智錦), the only one in the City (p28)');
    at(t + w + stay, home, after);
    block(t, t + len);
    return true;
  };
  const dongzhi = (t = 18.25) => {
    const d = F ? F.dinner : J(H(Math.floor(t), (t % 1) * 60), 20);
    at(d, home, F && F.members === 1 ? '冬至 dinner' : DZ);
    at(d + J(110, 15), home, r() < 0.5 ? 'watching television (p160)' : 'the evening at home');
    at(J(H(22, 40), 30), home, 'asleep');
  };
  // Dinner: with the family, with the others of a shared flat, or alone (some at an eating house).
  const dinner = (old = false) => {
    if (!F) return;
    if (F.members > 1) {
      at(F.dinner, home, F.kind === 'sharers' || F.kind === 'old women' ? 'dinner with the others of the flat' : F.kind === 'family' ? 'dinner with the family' : 'dinner together');
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
    const w = X.walkMin(p.home, pipe);
    t = freeAt(t, 2 * w + 20);
    const back = t + w + J(10, 6);
    at(t, pipe, 'fetching drinking water at the standpipe (pp108, 249)');
    at(back, home, 'carrying the drinking water home, up the stairs (p249)');
    at(back + w + 3, home, after);
    block(t, back + w + 3);
    return true;
  };
  // The well water of the day: when it comes to this floor, the drums and the bath are filled.
  const fill = () => {
    if (!F || F.filler !== p.id || !F.water.day) return;
    const t = F.water.day[0] + J(8, 6);
    block(t, t + 40);
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
  // The evening after dinner: television (p160), mahjong at a neighbour's flat ("the alleys were
  // alive with the clacking of mahjong tiles", p15), or a short chat in the lane in the cool
  // night air (p316). The shares and the hours are INFERRED.
  const evening = (back = 0, old = false) => {
    if (!F) return;
    const t = Math.max(back, F.dinner) + J(45, 10), q = r();
    if (p.music && (dow === 0 || dow === 3) && X.places.music) {
      at(Math.max(t, J(H(19, 45), 10)), X.places.music, 'playing in the amateur Chinese orchestra: twice a week its music echoes through the alleys (p15)');
      at(J(H(21, 45), 10), home, 'the evening at home');
      return;
    }
    if (q >= 0.2 && q < 0.26 && store(t, 'watching television (p160)')) return;
    if (q < 0.12 && p.home) {
      const nb = X.neighbour(p.home, r);
      if (nb) { at(t, nb, 'playing mahjong at a neighbour’s flat (p15)'); at(t + J(old ? 100 : 150, 30), home, 'at home, after mahjong at a neighbour’s flat'); return; }
    }
    if (q < 0.2 && p.home && !old) {
      const lane = X.laneBy(p.home);
      if (lane) { at(t, lane, 'a quiet chat in the lane after dinner (p316)'); at(t + J(30, 10), home, 'the evening at home'); return; }
    }
    at(t, home, q < 0.62 ? 'watching television (p160)' : 'the evening at home');
  };
  // ---- work: the hours of each trade ----
  // The shift of person p at workplace w today: { t0, t1, lunch, split, meals } or null (shut).
  // SOURCED: stores open from 6 or 8 am to midnight, seven days a week (pp91, 93); a café from
  // 9 am until very late (p57); a doctor 9 am-1 pm and 3.30-8 pm, Monday to Saturday, and
  // Sunday mornings (p187); a dentist 10 am to 6 or 7 pm, with a day off (p245); the Kai Fong
  // office in office hours, Monday to Friday (p180); a roast-meat maker from 4 am (p286); a
  // fish workshop makes less on Tuesdays (p292); noodle workers about nine hours from 8 am, with
  // an hour for a meal (p228). The other hours are INFERRED.
  const shift = (w, keeper) => {
    const cat = w?.cat || 'works', K = (h, m, sp) => J(H(h, m), sp);
    switch (cat) {
      case 'shop': return keeper ? { t0: K(7, 0, 50), t1: K(23, 40, 15), meals: true } : { t0: K(8, 0, 30), t1: K(20, 0, 40), meals: true };
      case 'eating': return { t0: K(8, 30, 30), t1: keeper ? K(23, 15, 30) : K(21, 30, 40), meals: true };
      case 'medicine': return { t0: K(9, 0, 30), t1: K(21, 0, 30), meals: true };
      case 'office': case 'community': return sun ? null : sat ? { t0: K(9, 0, 10), t1: K(13, 0, 10) } : { t0: K(9, 0, 10), t1: K(18, 0, 15), lunch: true };
      case 'dentist': return ((w.u ?? w.b) % 2 ? sat : sun) ? null : { t0: K(10, 0, 15), t1: K(18, 45, 30), lunch: true };
      case 'clinic': return sun ? { t0: K(9, 0, 10), t1: K(13, 0, 10) } : { t0: K(9, 0, 10), t1: K(20, 0, 10), split: [H(13, 0), H(15, 30)] };
      case 'foodfac': return sun && r() < 0.6 && !X.rush(w, dow) ? null : { t0: r() < 0.15 ? K(4, 0, 15) : K(6, 30, 50), t1: dow === 0 ? K(17, 30, 30) : K(19, 0, 50), meals: true };
      case 'school': case 'religion': return sun ? null : { t0: K(9, 0, 15), t1: K(17, 0, 30), lunch: true };
      default: return sun && r() < 0.75 ? null : sat && r() < 0.4 ? { t0: K(8, 0, 20), t1: K(13, 30, 30) } : { t0: K(8, 0, 20), t1: K(19, 0, 45), lunch: true };
    }
  };
  // The day at work: the events from the start to the end of the shift. Returns the shift.
  const workDay = (w, keeper, sh) => {
    const what = X.workDoing(w, keeper);
    // a rush order went on past midnight: still at work, then a short night (p237)
    if (dow > 0 && X.rush(w, dow - 1)) {
      // the food workshops: "We often have to work overnight during these occasions" (p44)
      if (w.cat === 'foodfac') { at(0, w, 'working through the night before the festival (pp44, 289)'); at(J(H(5, 30), 30), home, 'asleep, after the night of work'); sh.t0 = Math.max(sh.t0, J(H(11, 30), 30)); }
      else { at(0, w, 'still at work on a rush order (p237)'); at(J(H(2, 40), 25), home, 'asleep'); sh.t0 = Math.max(sh.t0, J(H(9, 30), 20)); }
    }
    at(sh.t0 - J(35, 10), home, 'breakfast');
    at(rubbishOut(sh.t0), w, what);
    if (sh.split) { at(sh.split[0], home, 'lunch at home, between the two surgeries'); at(sh.split[0] + J(45, 10), home, 'resting, between the two surgeries'); at(sh.split[1], w, what); }
    else if (sh.lunch) {
      if (r() < 0.35 && p.home) { at(J(H(12, 10), 8), home, 'lunch at home'); at(J(H(13, 0), 8), w, what); }
      else { at(J(H(12, 15), 10), w, 'lunch at the workbench'); at(J(H(12, 50), 5), w, what); }
    } else if (sh.meals) { at(J(H(12, 30), 30), w, keeper ? 'lunch in the shop' : 'lunch at work'); at(J(H(13, 5), 10), w, what); }
    sh.what = what;
    return sh;
  };
  // After work on a rush day: back to the workshop after dinner, until 2 or 3 am (p237); in a
  // food workshop before the festival, through the night (pp44, 289).
  const rushEve = (w, t) => {
    if (!w || !X.rush(w, dow)) return false;
    at(t, w, w.cat === 'foodfac' ? 'working through the night before the festival (pp44, 289)' : 'back at the workshop after dinner: a rush order (p237)');
    return true;
  };
  at(0, home, p.home ? 'asleep' : home.what);

  switch (p.role) {
    case 'child': {
      const kin = F?.kinder.get(p.id);
      at(J(H(7, 0), 30), home, 'breakfast');
      if (kin) {
        at(Math.min(F.kinderT - 5, J(H(7, 40), 10)), home, 'at home');
        at(F.kinderT, kin, kin.kind === 'out' ? kin.what : 'at the Salvation Army kindergarten (p300)');
        // "we have outings at least twice a month. Sometimes we go to the park just outside the City
        // and other times we go to Kowloon Park" (p300): this week on Thursday (INFERRED)
        if (dow === 2 && kin === X.places.kinder) { at(F.kinderT + 20, OUT('on an outing with the kindergarten, to Kowloon Park'), 'on an outing with the kindergarten, to Kowloon Park (p300)'); at(F.kinderBack - 15, kin, 'back at the kindergarten from the outing (p300)'); }
        at(F.kinderBack + 2, home, 'lunch at home');
        at(F.kinderBack + 40, home, 'an afternoon nap');
        at(F.kinderBack + 140, home, 'at home');
      } else at(J(H(7, 40), 20), home, p.age < 3 ? 'at home with the family' : F && !F.hasHomemaker && F.hasOld ? 'at home with the grandparent (p54)' : 'playing at home');
      // "Parents here usually lock them in their flats and don't allow them to play outside"
      // (p300); children played on the stairs and the landings (p54). The shares are INFERRED.
      const q = r();
      if (!sun && q < 0.1) { at(J(H(15, 30), 40), roof(), 'playing on the roof'); at(J(H(17, 0), 20), home, 'at home'); }
      else if (q < 0.3) { at(J(H(15, 30), 50), home, 'playing on the landing outside the flat (p54)'); at(J(H(17, 0), 20), home, 'at home'); }
      if (outing()) {}
      if (dz) { dongzhi(); break; }
      dinner();
      const bed = Math.max(F ? F.dinner + 50 : 0, J(H(20, 30), 20));
      at(bed - J(70, 10), home, 'watching television (p160)');
      at(bed - 20, home, 'a bath before bed (p160)');
      at(bed, home, 'asleep');
      break;
    }
    case 'student': {
      if (sun) {
        at(J(H(8, 0), 40), home, 'Sunday at home');
        if (!outing()) {
          const q = r();
          if (q < 0.35) { const s0 = J(H(10, 0), 60), e = J(H(12, 30), 30); at(s0, roof(), 'playing on the roofs'); at(e, home, 'lunch'); at(e + J(45, 10), home, 'at home'); block(s0, e); }
          if (r() < 0.4) { const s0 = J(H(15, 0), 40), e = J(H(17, 30), 20); at(s0, roof(), 'flying a kite from the roof'); at(e, home, 'at home'); block(s0, e); }
        }
        fetch(J(H(16, 30), 40), 'homework');
        dinner();
        if (F) at(F.dinner + J(50, 10), home, 'watching television (p160)');
        at(J(H(21, 45), 30), home, 'asleep');
        break;
      }
      const pm = !sat && p.age < 12 && p.seed >= 0.5; // the afternoon session
      at(J(H(6, 50), 10), home, pm ? 'breakfast' : 'getting ready for school');
      const school = OUT('at school');
      // Children wrap the candies of the candy workshop after school, at tables in the alley
      // (p77); teenagers "come and go", for half an hour or more, and the wrapping goes on until
      // 9 pm (p76). Which children, and how long, is INFERRED.
      const candy = () => {
        if (p.seed > 0.12 || !X.places.candy || dz || (dow + p.id) % 3 === 0) return false;
        const t = J(H(17, 30), 70);
        at(t, X.places.candy, 'wrapping candies in the alley for the candy workshop (pp76–77)');
        const e = Math.min(H(21, 0), t + J(60, 30));
        at(e, home, 'home from the candy wrapping');
        at(e + J(15, 5), home, 'homework');
        return true;
      };
      // A child of a family workshop helps after school: "放學之後放低書包就去幫手刮魚肉 … 做到差唔多
      // 9點幾10點返屋企" (林羅平, HK01). On about half the school days (INFERRED).
      const family = () => {
        const w = F?.familyWork;
        if (!w || p.age < 10 || dz || r() < 0.5) return false;
        const what = w.cat === 'foodfac' ? 'helping at the family workshop after school (林羅平, HK01)' : 'helping in the family shop after school';
        at(J(H(17, 0), 15), w, what);
        helped = { w, what, t: J(H(21, 20), 20) };
        return true;
      };
      let helped = null;
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
        at(back + J(40, 10), home, 'Saturday afternoon at home');
        if (r() < 0.55) { const s0 = J(H(14, 30), 30), e = J(H(17, 50), 20); at(s0, roof(), 'playing on the roofs'); at(e, home, 'at home'); block(s0, e); }
        fetch(back + J(50, 15), 'Saturday afternoon at home');
      } else if (p.age < 12 && p.seed < 0.5) {
        at(rubbishOut(J(H(7, 25), 15)), school, 'at school (morning session)');
        at((back = J(H(12, 50), 15)), home, 'lunch at home');
        at(back + J(40, 10), home, 'homework');
        if (!fetch(J(H(14, 15), 20), 'homework') && !family() && !candy()) { const q2 = r(); if (q2 < 0.45) { at(J(H(15, 45), 30), roof(), 'playing on the roofs'); at(J(H(17, 15), 20), home, 'homework'); } else if (q2 < 0.55) store(J(H(17, 40), 30), 'homework'); }
      } else if (p.age < 12) {
        at(J(H(7, 30), 10), home, 'homework, before the afternoon session');
        if (r() < 0.4) { at(J(H(9, 30), 30), roof(), 'playing on the roofs'); at(J(H(10, 50), 15), home, 'at home'); }
        at(J(H(11, 40), 10), home, 'lunch');
        at(J(H(12, 30), 10), school, 'at school (afternoon session)');
        at((back = J(H(dz ? 17 : 18, 25), 10)), home, dz ? 'home for 冬至' : 'home from school');
        // dinner kept for a child back after the others have eaten (INFERRED)
        if (!dz) { if (F && F.dinner < back + 10) at(back + 3, home, 'dinner, kept for after school'); else if (!fetch(back + 10, 'homework')) at(back + J(20, 5), home, 'homework'); }
      } else {
        at(rubbishOut(J(H(7, 30), 15)), school, 'at secondary school');
        at((back = J(H(16, 30), 10)), home, 'homework');
        if (!fetch(back + J(20, 10), 'homework') && !family() && !tutor() && !candy() && !dz) { const q2 = r(); if (q2 < 0.3) { at(J(H(17, 0), 10), roof(), 'on the roofs'); at(J(H(18, 30), 15), home, 'homework'); } else if (q2 < 0.42) store(J(H(17, 40), 30), 'homework'); }
      }
      if (dz) { dongzhi(18.4); break; }
      if (helped && F) {
        at(F.dinner, helped.w, 'dinner at the workshop'); at(F.dinner + 30, helped.w, helped.what);
        at(helped.t, home, 'home: a bath, then homework'); at(Math.max(helped.t + 50, J(H(22, 30), 15)), home, 'asleep');
        break;
      }
      dinner();
      at(F ? F.dinner + J(50, 10) : J(H(20, 0), 20), home, r() < 0.3 ? 'homework, then television (p160)' : 'homework');
      at(J(H(21, 45), 30), home, 'asleep');
      break;
    }
    case 'worker_out': {
      if (sun && r() < 0.85) {
        at(J(H(8, 0), 40), home, 'Sunday at home');
        if (!outing() && r() < 0.4) { at(J(H(9, 30), 40), OUT('out'), 'out'); at(J(H(13, 30), 60), home, 'home'); block(H(9, 0), H(14, 30)); }
        haircut(J(H(11, 0), 150), 'Sunday at home');
        // "the rubbish-spattered temple where gamblers came to implore and bribe the gods to
        // improve their luck" (p15): the Tin Hau Temple (天后廟) off Lo Yan Street (p241)
        if (p.sex === 'm' && r() < 0.015 && X.places.tinHau) { const t1 = J(H(14, 0), 150); if (!busy(t1, t1 + 40)) { at(t1, X.places.tinHau, 'asking the gods for luck at the Tin Hau Temple (天后廟) (p15)'); at(t1 + J(20, 6), home, 'at home'); block(t1, t1 + 30); } }
        fetch(J(H(16, 0), 60), 'at home');
        dinner();
        evening();
        at(J(H(23, 0), 30), home, 'asleep');
        break;
      }
      const go = J(H(7, 20), 30);
      at(go - J(55, 10), home, 'breakfast');
      at(rubbishOut(go), OUT('at work outside the City'), 'at work outside the City');
      if (dz) { at(J(H(17, 40), 30), home, 'home early for 冬至'); dongzhi(); break; }
      let back;
      if (sat && r() < 0.5) { at((back = J(H(13, 45), 30)), home, 'home after a half day'); if (!haircut(back + J(40, 10), 'the afternoon at home')) afternoon(back + J(40, 10)); }
      else if (r() < 0.15) { at((back = (F ? F.dinner : H(19, 20)) + J(70, 30)), home, 'home late from work: a late dinner'); }
      else at((back = (F ? F.dinner : H(19, 20)) - J(22, 12)), home, 'home from work');
      // shopping on the way home: a resident of a high floor "每次回家前都會打電話給家人，看看還有
      // 什麼食品或日用品東西需要購置" (陳先生, Wen Wei Po (文匯報), 7 October 2024)
      if (r() < 0.12) store(back + J(12, 4), 'at home');
      else if (!F || back < F.dinner - 60) haircut(back + J(15, 5), 'at home');
      fetch(back + 5, 'at home');
      if (F && back < F.dinner) dinner();
      evening(back);
      at(J(H(23, 20), 15), home, 'asleep');
      break;
    }
    case 'worker_in':
    case 'shopkeeper': {
      const keeper = p.role === 'shopkeeper', w = p.work, sh = shift(w, keeper);
      if (!sh) {
        at(J(H(8, 0), 40), home, 'a day off at home');
        if (!outing() && r() < 0.35) { at(J(H(9, 30), 40), OUT('out'), 'out'); at(J(H(13, 30), 60), home, 'home'); block(H(9, 0), H(14, 30)); }
        fetch(J(H(16, 0), 60), 'at home');
        haircut(J(H(15, 0), 60), 'a day off at home');
        if (dz) { dongzhi(); break; }
        dinner(); evening();
        at(J(H(23, 0), 30), home, 'asleep');
        break;
      }
      workDay(w, keeper, sh);
      // On 冬至 most shut early; the food trades work on (INFERRED from pp44, 289).
      if (dz && w?.cat !== 'foodfac') { at(Math.min(sh.t1, J(H(17, 50), 20)), home, keeper ? 'shut early for 冬至' : 'home early for 冬至'); dongzhi(); break; }
      // a long day: dinner at work, brought from home or cooked there
      if (F && sh.t1 > F.dinner + 20) { at(F.dinner + J(5, 5), w, keeper ? 'dinner in the shop' : 'dinner at work'); at(F.dinner + J(35, 5), w, sh.what); }
      at(sh.t1, home, sh.t1 > H(22, 0) ? 'home, after the day in the shop' : 'home from work');
      if (sh.t1 < H(16, 0)) { if (!haircut(sh.t1 + J(40, 10), 'the afternoon at home')) afternoon(sh.t1 + J(40, 10)); }
      else if (F && F.dinner - sh.t1 > 75) { if (!haircut(sh.t1 + J(15, 5), 'resting after work')) at(sh.t1 + J(30, 10), home, 'resting after work'); }
      if (F && sh.t1 < F.dinner) dinner();
      else if (F && sh.t1 <= F.dinner + 20) at(sh.t1 + 3, home, 'a late dinner');
      if (sh.t1 < H(21, 0)) { fetch(sh.t1 + 5, 'at home'); evening(sh.t1); }
      else if (sh.t1 < H(22, 30)) at(sh.t1 + J(25, 5), home, 'the evening at home');
      if (!rushEve(w, Math.max(F?.dinner ?? 0, sh.t1) + J(60, 15))) at(Math.max(sh.t1 + 30, J(H(23, 0), 30)), home, 'asleep');
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
      evening(t);
      at(J(H(22, 30), 30), home, 'asleep');
      break;
    }
    case 'homemaker': {
      at(J(H(5, 45), 20), home, 'cooking breakfast');
      // "a small family shrine, which was regularly blessed with fresh offerings of food and
      // incense" (p154)
      if (r() < 0.6) { const t = J(H(7, 10), 15); at(t, home, 'fresh food and incense at the family shrine (p154)'); at(t + 6, home, 'housework'); }
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
      // the washing: in the well water of the pipes, which "could only be deployed for bathing and
      // laundry" (p14); then out to dry in the corridor (p176), or on the roof (INFERRED shares)
      const lq = r(), WASH = 'washing the clothes in the well water of the pipes, good only for bathing and laundry (p14)';
      if (lq < 0.5) {
        const t0 = freeAt(J(H(10, 25), 15), 55), t = t0 + J(35, 8);
        at(t0, home, WASH);
        if (lq < 0.35) { at(t, home, 'hanging the washing out to dry in the corridor (p176)'); at(t + 15, home, 'housework'); }
        else { at(t, roof(), 'hanging the washing on the roof'); at(t + J(22, 5), home, 'housework'); }
        block(t0, t + 22);
      }
      // the temples: "women comprised the majority of visitors" of the Fuk Tak shrine (p32)
      if (r() < 0.05 && X.places.temple) { const t = J(H(9, 30), 30); at(t, X.places.temple, 'incense at the Fuk Tak shrine (福德古廟) (p32)'); at(t + J(25, 8), home, 'housework'); }
      if (kids) { const kin = [...F.kinder.values()][0]; at(F.kinderBack - 4, kin, 'fetching the children from the kindergarten'); at(F.kinderBack + 2, home, 'lunch'); }
      else at(J(H(12, 30), 15), home, 'lunch');
      // outwork at home for a workshop of the City: "30 or more female workers who worked from
      // home" (p88); plastic products packed in the corridors (p176). The share is INFERRED.
      const outwork = !!F?.outwork;
      at(J(H(13, 15), 10), home, outwork ? 'outwork at home: packing for a workshop of the City (pp88, 176)' : 'housework');
      // part-time work at a food workshop near home: "A few neighbours - ladies - help me with the
      // fish dumplings" (Lam Leung Po (林良寶), p292); "Bundled up against the chill of a Hong Kong
      // winter and the workshop's air-conditioning, female part-time workers prepare minced fish
      // dumplings" (p293). Which women, and the hours, are INFERRED.
      const ff = F?.partTime && X.foodNear?.(p.home, p.hh);
      if (ff && !dz) { const t1 = J(H(13, 25), 10), t2 = J(H(16, 25), 15); at(t1, ff, 'part-time work at a food workshop near home, in a coat against the winter chill (pp292-293)'); at(t2, home, 'housework'); block(t1, t2); }
      fill();
      if (fetchAt >= H(12, 0)) fetch(fetchAt, outwork ? 'outwork at home: packing for a workshop of the City (pp88, 176)' : 'housework');
      if (dz) {
        at(J(H(14, 30), 30), OUT('buying food for the 冬至 dinner'), 'buying food for the 冬至 dinner');
        at(J(H(15, 45), 20), home, 'cooking the 冬至 dinner');
        dongzhi();
        break;
      }
      const hq = r();
      if (hq < 0.15) { at(J(H(15, 30), 25), OUT('shopping'), 'shopping'); at(J(H(16, 30), 15), home, 'housework'); }
      else if (hq < 0.4) store(J(H(16, 40), 35), 'housework');
      else if (hq < 0.41 && X.places.yard) { const t1 = J(H(14, 50), 20); at(t1, X.places.yard, 'preparing the vegetables for dinner in the Yamen courtyard (p299)'); at(t1 + J(50, 10), home, 'housework'); block(t1, t1 + 50); }
      haircut(J(H(14, 40), 30), 'housework');
      if (r() < 0.12) { at(J(H(17, 0), 10), roof(), 'on the roof in the early evening (p322)'); at(J(H(17, 40), 10), home, 'housework'); }
      at((F ? F.dinner : H(19, 0)) - J(75, 15), home, 'cooking dinner');
      dinner();
      at((F ? F.dinner : H(19, 0)) + J(35, 8), home, 'washing up');
      // some evenings, women of the City wrap candies for the Lees' candy workshop (p79)
      if (X.places.candy && r() < 0.05) { at((F ? F.dinner : H(19, 0)) + J(55, 10), X.places.candy, 'wrapping candies at the candy workshop (p79)'); at(J(H(21, 0), 10), home, 'the evening at home'); }
      else evening((F ? F.dinner : H(19, 0)) + 25);
      if (F?.small) at(J(H(20, 0), 15), home, 'bathing the children (p160)');
      at(J(H(22, 30), 30), home, 'asleep');
      night();
      break;
    }
    case 'elder': {
      at(J(H(5, 30), 30), home, 'up early');
      const q = r(), takes = F?.taker === p.id && F.kinder.size, minds = F && !F.hasHomemaker && (F.small || F.pickup);
      const care = minds ? 'minding the grandchildren (p54)' : 'resting';
      // Some old people hardly leave the room: "rarely venturing out and with only his radio and
      // television for diversion" (p24).
      const room = !minds && !takes && (p.seed * 7) % 1 < 0.15;
      // The mornings. No source gives a tea house in the City, or exercise at dawn: INFERRED.
      let t;
      if (room) at((t = J(H(7, 0), 30)), home, 'in the room, with the radio');
      else if (q < 0.12 && !takes && !minds) { const s0 = J(H(6, 15), 20); t = J(H(9, 15), 40); at(s0, OUT('at a tea house outside the City'), 'at a tea house outside the City'); at(t, home, 'resting'); block(s0, t); }
      // "Her daily routine would take her to the adjoining park" (Law Yu Yi, p80)
      else if (q < 0.25 && !takes && !minds) { const s0 = J(H(6, 45), 25); t = J(H(8, 30), 30); at(s0, OUT('in the park next to the City'), 'in the park next to the City (p80)'); at(t, home, 'resting'); block(s0, t); }
      // a top-floor tenant: "可以上天臺做運動" (袁家倫, Epoch Times (大紀元時報), 5 May 2024); the hour is INFERRED
      else if (q < 0.33) { const s0 = J(H(6, 15), 20); t = J(H(7, 15), 20); at(s0, roof(), 'morning exercise on the roof'); at(t, home, care); block(s0, t); }
      else at((t = J(H(7, 15), 20)), home, minds ? care : 'at home');
      // "a small family shrine, which was regularly blessed with fresh offerings of food and
      // incense" (p154): by the old person when there is no homemaker
      if (!room && !F?.hasHomemaker && r() < 0.6) { const s0 = t + J(15, 5); at(s0, home, 'fresh food and incense at the family shrine (p154)'); at(s0 + 6, home, care); }
      if (takes) {
        const kin = [...F.kinder.values()][0];
        at(F.kinderT - 1, kin, 'taking the grandchildren to the kindergarten');
        at(F.kinderT + 15, home, 'resting');
        at(F.kinderBack - 4, kin, 'fetching the grandchildren from the kindergarten');
        at(F.kinderBack + 2, home, 'lunch with the grandchildren');
        at(F.kinderBack + J(45, 10), home, 'minding the grandchildren (p54)');
        block(F.kinderT - 1, F.kinderT + 15); block(F.kinderBack - 4, F.kinderBack + 45);
      }
      // "Mrs Law collected her two grandchildren from school every day and took them back to her
      // small apartment for the afternoon, where they often did their homework on her bed" (p54)
      if (F?.pickup && !sat && !sun && !room) {
        at(F.pickup - 15, OUT('collecting the grandchildren from school'), 'collecting the grandchildren from school (p54)');
        at(F.pickup + 20, home, 'minding the grandchildren: homework on the bed (p54)');
        block(F.pickup - 15, F.pickup + 20);
      }
      fill();
      // The Old People's Centre (172:2:1): 184 members (p305); afternoon tea and television
      // (p306), and later mornings too (p308); Sunday worship for the Christians (p305).
      const C = X.places.centre, goes = p.centre === 'daily' || (p.centre === 'some' && (p.id + dow) % 3 === 0);
      if (C && !sun && goes && !minds) {
        if (r() < 0.3 && visit(H(9, 30), H(11, 30), C, 'the morning at the Old People’s Centre (老人中心) (p308)', 'lunch')) at(J(H(12, 15), 10), home, 'resting');
        // "calligraphy classes for the many elderly women who had never been taught to write"
        // (p306): on Wednesday and Friday afternoons for half the women (INFERRED)
        const write = p.sex === 'f' && (dow === 1 || dow === 3) && (p.seed * 13) % 1 < 0.5;
        visit(H(14, 30), H(17, 15), C, write ? 'a calligraphy class at the Old People’s Centre (老人中心) (p306)' : 'tea and television at the Old People’s Centre (老人中心) (p306)', 'resting');
      } else if (C && sun && p.worship) visit(H(10, 15), H(11, 40), C, 'Sunday worship at the Old People’s Centre (老人中心) (p305)', 'resting');
      else if (sun && p.chapel) visit(H(10, 0), H(11, 30), X.places.kinder, 'at the Sunday service in the Salvation Army (救世軍) chapel (p301)', 'resting');
      // the busy day before the festival: "we employ some elderly women of Chiu Chow origin on a
      // daily-rate basis" (a cake shop, p44); which women, and where, is INFERRED
      else if (dow === 5 && p.sex === 'f' && p.age <= 74 && !room && (p.seed * 11) % 1 < 0.1 && X.places.foodfacs.length) visit(H(12, 30), H(17, 45), X.places.foodfacs[Math.floor(p.seed * 1e6) % X.places.foodfacs.length], 'helping at a food workshop before the festival, on a daily rate (p44)', 'resting');
      // "the courtyard was a popular meeting place on sunny days, with residents bringing chairs
      // from their apartments to sit and chat" (p299); which days were sunny is INFERRED
      else if (!room && !minds && r() < 0.01 && visit(H(14, 0), H(15, 45), X.places.yard, 'sitting in the Yamen courtyard on a chair from home, to chat (p299)', 'resting')) {}
      else if (!room && !minds && r() < 0.18 && p.home) {
        const nb = X.neighbour(p.home, r);
        if (nb) visit(H(14, 30), H(17, 30), nb, 'playing mahjong at a neighbour’s flat (p15)', 'resting');
      } else if (!room && p.sex === 'f' && r() < 0.05 && X.places.temple) visit(H(10, 0), H(10, 25), X.places.temple, 'incense at the Fuk Tak shrine (福德古廟) (p32)', 'resting');
      if (!takes && !busy(H(11, 45), H(13, 0))) { const t1 = J(H(12, 15), 15); at(t1, home, F?.small ? 'lunch with the grandchildren' : 'lunch'); at(t1 + J(40, 8), home, minds ? care : 'an afternoon nap'); if (!minds) at(t1 + J(130, 20), home, 'resting'); block(t1, t1 + 40); }
      fetch(r() < 0.6 ? J(H(10, 0), 70) : J(H(15, 45), 60), care);
      // a friend from the Centre who has not come for two days: a call at the home, on about 1 day
      // in 4 of such absences (p306; INFERRED)
      if (p.checks && !sun && !dz) {
        const c = p.checks.find((x) => (x.id + dow) % 3 !== 0 && (x.id + dow + 6) % 3 !== 0 && (x.id * 7 + dow) % 4 === 0);
        const h2 = c && X.homeOf(c.hh), t1 = freeAt(J(H(17, 35), 10), 30);
        if (h2 && t1 < H(18, 20)) { at(t1, h2, 'calling at the home of a friend from the Centre who has not come for two days (p306)'); at(t1 + J(25, 5), home, 'resting'); block(t1, t1 + 25); }
      }
      if (!room && !minds && r() < 0.1) store(J(H(16, 0), 60), 'resting');
      else if (!minds) haircut(r() < 0.5 ? J(H(10, 0), 40) : J(H(15, 0), 50), care);
      if (outing()) {}
      if (dz) { dongzhi(18); break; }
      // "A grandmother would keep her eye on her own grandchildren as well as the children of
      // her neighbours, while her daughter prepared supper in an apartment below" (p322).
      if (F?.roofEve?.who === p.id) { at(F.roofEve.t0, roof(), 'on the roof in the early evening, minding the grandchildren and the neighbours’ children (p322)'); at(F.roofEve.t1, home, 'resting'); }
      else if (!room && !F?.roofEve && r() < 0.2 && !busy(H(16, 50), H(18, 0))) { at(J(H(17, 0), 10), roof(), 'on the roof in the early evening (p322)'); at(J(H(17, 50), 10), home, 'resting'); }
      // a widower alone: "A friend lives upstairs and comes down to eat with me in the
      // evening" (Wong Hoi Ming (王海明), p233)
      if (F && F.members === 1 && p.sex === 'm' && r() < 0.35) at(F.dinner, home, 'dinner with a friend from upstairs (p233)');
      else dinner(true);
      if (room) at(F ? F.dinner + J(50, 10) : J(H(19, 30), 20), home, 'in the room, with the television (p24)');
      else evening(0, true);
      at(J(H(21, 15), 30), home, 'asleep');
      night();
      break;
    }
    // ---- the people who come in from outside ----
    case 'day_worker': {
      const w = p.work, sh = shift(w, false);
      if (!sh) break;
      const what = X.workDoing(w);
      if (dow > 0 && X.rush(w, dow - 1)) sh.t0 = Math.max(sh.t0, J(H(9, 30), 20));
      at(sh.t0, w, what);
      if (sh.split) { at(sh.split[0], OUT('between the two surgeries, outside the City'), 'between the two surgeries, outside the City'); at(sh.split[1], w, what); }
      else if (X.places.eating.length && r() < 0.25) { at(J(H(12, 15), 10), X.places.eating[Math.floor(r() * X.places.eating.length)], 'lunch at an eating house'); at(J(H(13, 0), 8), w, what); }
      else if (sh.lunch || sh.meals) { at(J(H(12, 20), 10), w, 'lunch at work'); at(J(H(12, 55), 5), w, what); }
      if (dz && w?.cat !== 'foodfac') { at(J(H(17, 15), 20), home, 'home for 冬至, outside the City'); break; }
      if (X.rush(w, dow)) { at(sh.t1, w, w.cat === 'foodfac' ? 'working through the night before the festival (pp44, 289)' : 'on into the night: a rush order (p237)'); at(J(H(23, 40), 10), home, home.what); break; }
      at(sh.t1, home, home.what);
      break;
    }
    case 'police': {
      // Six constables, "two people on each of the three beats a day" (p251), in shifts of 8
      // hours: the City was patrolled "at least once during each eight-hour shift" (p283). They patrolled the main streets "two or
      // three times a day" (林羅平, Ming Pao Weekly 2024); the 3-11 pm shift was the busiest
      // (p253). The hours of the shifts and of the patrols are INFERRED. The two of a pair walk
      // the same beat; between patrols they are at the post outside the City.
      const q = mulberry32(4100 + dow * 7 + p.shift);
      const t0 = p.shift === 0 ? H(7, 0) : p.shift === 1 ? H(15, 0) : H(23, 0) - 1440;
      const n = p.shift === 1 ? 3 : 2;
      const post = OUT('at the police post outside the City');
      for (let k = 0; k < n; k++) {
        let s0 = t0 + 30 + (k * 480) / n + q() * 60;
        if (s0 < 0) s0 += 1440; // the night shift: its patrols after midnight are today's
        // on the roofs, the pigeon keeper meets "a few policemen. They are transferred to new beats
        // every three months and are often new to the Walled City, so I have to show them the way"
        // (Chan Kwan Leung (陳昆亮), p319)
        for (let t = s0, e = s0 + 35 + q() * 20; t < e; t += 9 + q() * 6) { const up = q() < 0.15; at(t, up ? X.anyRoof(q) : X.streetSpot(q), up ? 'on the beat across the roofs, often new to the City (p319)' : 'on the beat (pp251, 283)'); }
        at(s0 + 60, post, post.what);
      }
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
      // Patients from outside ("My patients come from both inside and outside the City, though
      // mostly from outside", p187), to the dentists and the doctors on the
      // outer roads (p242), in the hours of the clinics (pp187, 245). On Sunday mornings the
      // factory workers come, with colds and coughs (p187). How many on each day is INFERRED.
      if (!X.places.clinics.length || r() > (sun ? 0.25 : sat ? 0.8 : 1)) break;
      const c = X.places.clinics[Math.floor(r() * X.places.clinics.length)], den = c.cat === 'dentist';
      if (sun && den) break;
      const t = sun ? J(H(10, 45), 100) : den ? H(10, 0) + r() * 520 : r() < 0.45 ? H(9, 0) + r() * 220 : H(15, 30) + r() * 250;
      at(t, c, den ? 'at the dentist (pp36, 242)' : sun ? 'at the Sunday morning surgery, with a cold (p187)' : 'seeing the doctor (p187)');
      at(t + 25 + r() * 35, home, home.what);
      break;
    }
    case 'taxi': {
      // "Taxi drivers, in particular, were regular patrons since they were able to park their
      // cabs at the kerbside" (the cafés by Tung Tsing Road (東正道), p294). The hours are INFERRED.
      const cafes = X.places.cafes;
      if (!cafes?.length) break;
      const c = cafes[Math.floor(r() * cafes.length)], road = OUT('driving the taxi, outside the City');
      at(0, road, road.what);
      if (r() < 0.7) { const t = J(H(12, 40), 50); at(t, c, 'a taxi driver at lunch in a café, the cab at the kerb (p294)'); at(t + J(35, 10), road, road.what); }
      if (r() < 0.5) { const t = J(H(22, 20), 60); at(t, c, 'a taxi driver at supper in a café, the cab at the kerb (p294)'); at(t + J(30, 10), road, road.what); }
      break;
    }
    case 'porter': {
      // "Business carried on regardless, and men carrying sacks of flour ... were an everyday
      // sight" (p249); the alleys were "an obstacle course of delivery trolleys" (p249), and the
      // products of a plastics factory were "packaged for delivery" in a corridor (p176). The
      // loads, the hours and the days are INFERRED: flour in to the food workshops in the
      // morning, goods out of the workshops in the afternoon, Monday to Saturday.
      if (sun || !X.places.foodfacs.length) break;
      const road = OUT('at the lorry on the road');
      let t = J(H(7, 0), 30);
      at(t - 5, road, road.what);
      for (; t < H(11, 40); t += 20 + r() * 10) {
        const w = X.places.foodfacs[Math.floor(r() * X.places.foodfacs.length)];
        at(t, w, 'carrying a sack of flour in from the road to a food workshop (p249)');
        at(t + 9 + r() * 4, road, 'back to the lorry for the next sack');
      }
      at(t, home, 'a meal and a rest, outside the City');
      if (!sat && X.places.makers.length) {
        for (t = J(H(14, 0), 30); t < H(17, 30); t += 22 + r() * 10) {
          const w = X.places.makers[Math.floor(r() * X.places.makers.length)];
          at(t, w, 'collecting the goods of a workshop, packed for delivery (p176)');
          at(t + 9 + r() * 4, road, 'carrying the goods out to the road on a delivery trolley (p249)');
        }
        at(t, home, home.what);
      }
      break;
    }
    case 'addict': {
      // "A few heroin addicts remained in the City until the end" (p260). Wong Wai Chung: "To beg
      // for some of the white powder [pure heroin], I would get down and grasp the legs of the
      // drug dealers on the street" (p258); in 1985, "because I did not have money, I had to go
      // back home to eat" and "I slept on the streets every day" (p259).
      // "The younger generation of addicts found in the City in the late '80s preferred to inject
      // the drug" (p259). A workshop owner: "I get rid of them by giving them a few dollars"
      // (Cheng San (鄭山), p169). A doctor: "Drug addicts have, on occasion, stopped by to see if
      // they can obtain some of these [heroin substitutes or certain painkillers], but I've always
      // just told them to go away" (Tsin Mu Lam (錢茂林), p187). Some try to give up at the
      // Shuiyuan centre of Jackie Pullinger (潘靈卓) (pp259-260) and at the daily prayer of the
      // St Stephen's Society (p263). The hours, the places in the lanes, who sleeps in the City
      // and who tries to give up are INFERRED.
      const L = X.places, quit = p.n % 3 === 0, inCity = p.n % 4 === 1;
      const street = inCity ? X.laneSpot(mulberry32(7700 + p.n)) : OUT('on the streets outside the City');
      const sleep = inCity ? 'asleep in the lane: he sleeps on the streets (p259)' : 'asleep on the streets, outside the City (p259)';
      const BEG = 'begging the dealers in the lane for a little of the white powder (p258)', USE = 'injecting heroin in a quiet corner of the lanes (p259)';
      ev.length = 0; // not the default night at home
      at(0, street, sleep);
      let t = J(H(10, 30), 60), uses = 0, ate = inCity;
      const step = () => {
        const q = r();
        if (!ate && t > H(12, 30)) { ate = true; at(t, OUT('at his family’s home, outside the City'), 'back to his family’s home outside the City, to eat (p259)'); t += J(100, 20); return; }
        if (q < 0.25 && t < H(19, 0) && L.makers.length) { at(t, L.makers[Math.floor(r() * L.makers.length)], 'asking at a workshop for a few dollars; the owner gives him some to go (p169)'); t += J(12, 4); }
        else if (q < 0.32 && t < H(19, 0) && L.clinics.length) { at(t, L.clinics[Math.floor(r() * L.clinics.length)], 'asking a doctor for heroin substitutes or painkillers; the doctor tells him to go away (p187)'); t += J(10, 3); }
        else if (q < 0.6 && uses < 3) { at(t, X.laneSpot(r), USE); t += J(60, 20); uses++; }
        else { at(t, X.laneSpot(r), BEG); t += J(55, 20); }
      };
      at(t, X.laneSpot(r), BEG); t += J(40, 15);
      at(t, X.laneSpot(r), USE); t += J(60, 20); uses++;
      if (quit) {
        while (t < H(sun ? 18 : 14, 0)) step();
        if (!sun && L.shuiyuan) { at(t, L.shuiyuan, 'at the Shuiyuan youth centre of Jackie Pullinger, which helps addicts give up drugs (pp259-260)'); t = J(H(17, 45), 10); }
        while (t < H(18, 50)) step();
        if (L.society) { at(Math.max(t, H(19, 20)), L.society, 'at the daily prayer of the St Stephen\u2019s Society: healing hands, hymns and open confession to God (p263)'); t = J(H(22, 35), 10); }
      } else while (t < H(22, 0)) step();
      at(t, street, sleep);
      break;
    }
    case 'former_addict': {
      // "After I gave up taking drugs, I still went to the Walled City to pray for drug addicts,
      // and pay them visits" (Wong Wai Chung, p261); the daily prayer of the St Stephen's Society
      // at 'The Well' (p263). At the Shuiyuan centre "a dozen pairs of eyes" met him in a friendly
      // way (p259). The hours and the days of the visits are INFERRED.
      const L = X.places;
      if (!L.society) break;
      if (!sun && L.shuiyuan && r() < 0.4) { const t = J(H(14, 30), 30); at(t, L.shuiyuan, 'at the Shuiyuan youth centre, to welcome the addicts who come to give up (p259)'); at(t + J(150, 30), home, home.what); }
      if (r() < 0.5) { let t = J(H(18, 0), 20); for (let k = 0; k < 2; k++, t += J(25, 8)) at(t, X.laneSpot(r), 'in the lanes, to pray for the drug addicts and pay them visits (p261)'); }
      at(J(H(19, 25), 5), L.society, 'at the daily prayer of the St Stephen\u2019s Society: healing hands, hymns and open confession to God (p263)');
      at(J(H(22, 35), 10), home, home.what);
      break;
    }
    case 'real': realDay(p, dow, X, at, r); break;
    default: at(J(H(7, 0), 30), home, 'at home');
  }
  ev.sort((a, b) => a[0] - b[0]);
  if (F && p.home && p.role !== 'real') {
    // the evenings in the family workshop (p173): from the cooking of dinner until the family
    // goes up to the flat for the night, the time at home is spent in the workshop
    if (F.evenWork) {
      const w = F.evenWork, a = F.dinner - 80, b = F.evenBack;
      let slept = false;
      for (const e of ev) {
        if (e[1] !== home || e[0] < a || e[0] >= b) continue;
        if (/^asleep/.test(e[2])) { slept = true; continue; }
        e[1] = w;
        if (/^homework/.test(e[2])) e[2] = 'homework on the workbench of the family workshop (p173)';
        else if (/^dinner/.test(e[2])) e[2] = 'dinner in the family workshop: the family cooks there (p173)';
        else if (/^cooking dinner/.test(e[2])) e[2] = 'cooking dinner in the family workshop (p173)';
        else if (/^(home from work|the evening at home|at home$)/.test(e[2])) e[2] = 'the evening in the family workshop (p173)';
      }
      // the one at work there is already in it
      const last = ev.filter((e) => e[0] < b).pop();
      if (!slept && last && last[1] === w) { ev.push([clampM(b), home, 'up to the flat for the night (p173)']); ev.sort((x, y) => x[0] - y[0]); }
    }
    // the young children minded at a neighbour's flat (p54), and the parent who takes and fetches them
    if (F.minder && F.minded.has(p.id)) {
      const a = F.dropT, b = F.pickT, there = F.minder;
      for (const e of ev) {
        if (e[1] !== home || e[0] < a || e[0] >= b || /^asleep/.test(e[2])) continue;
        e[1] = there;
        if (/^lunch/.test(e[2])) e[2] = 'lunch at the neighbour’s flat (p54)';
        else if (/^homework/.test(e[2])) e[2] = 'homework at the neighbour’s flat (p54)';
        else if (/nap/.test(e[2])) e[2] = 'a nap at the neighbour’s flat (p54)';
        else if (/^breakfast/.test(e[2])) e[2] = 'breakfast at the neighbour’s flat (p54)';
        else if (/^(at home|playing at home|home)/.test(e[2])) e[2] = 'minded at a neighbour’s flat in the building, with her own children (p54)';
      }
      ev.push([clampM(a), there, 'taken to a neighbour’s flat in the building for the day (p54)'], [clampM(b), home, 'home with a parent (p54)']);
      ev.sort((x, y) => x[0] - y[0]);
    } else if (F.minder && F.picker === p.id) {
      ev.push([clampM(F.dropT), F.minder, 'taking the children to a neighbour’s flat in the building (p54)'], [clampM(F.pickT - 8), F.minder, 'picking up the children from the neighbour’s flat on the way home (p54)'], [clampM(F.pickT), home, 'home with the children']);
      ev.sort((x, y) => x[0] - y[0]);
    }
    // the children on the roof in the early evening, with the grandmother (p322)
    if (F.roofEve?.kids.has(p.id)) {
      const before = ev.filter((e) => e[0] <= F.roofEve.t0).pop();
      if (before && before[1].kind !== 'out' && !/^asleep/.test(before[2])) {
        ev.push([clampM(F.roofEve.t0 + 2), roof(), `playing on the roof in the early evening, the ${F.roofEve.gp} watching (p322)`], [clampM(F.roofEve.t1), home, 'at home']);
        ev.sort((x, y) => x[0] - y[0]);
      }
    }
    // the night in the workshop, to guard it (p169)
    if (F.guard === p.id && p.work) for (const e of ev) if (e[2] === 'asleep' && e[1] === home) { e[1] = p.work; e[2] = 'asleep in the workshop, to guard it from the drug addicts (p169)'; }
    // a family that lives in its shop (p94) or its clinic (p245)
    if (F.lived) {
      for (const e of ev) if (e[2] === 'asleep' && e[1] === home) e[2] = F.lived === 'dentist' || F.lived === 'clinic' ? 'asleep on the floor of the clinic (p245)' : 'asleep in the small living area at the back of the shop (p94)';
      // "the business effectively remained open until Lee and his wife turned off the television,
      // shuttered the shop and went to bed" (p94)
      if (p.work === home && F.lived !== 'dentist' && F.lived !== 'clinic') for (const e of ev) if (/^home(,| from work)/.test(e[2])) e[2] = 'the shop stays open: the family lives in it (p94)';
    }
  }
  // The night's sleep comes after the last thing of the evening (a game of mahjong that runs
  // late, a chat in the lane).
  if (p.role !== 'real') {
    let k = -1;
    for (let j = ev.length - 1; j >= 0; j--) if (/^asleep/.test(ev[j][2]) && ev[j][0] >= H(19, 0)) { k = j; break; }
    if (k >= 0 && k < ev.length - 1) {
      const [sl] = ev.splice(k, 1);
      sl[0] = clampM(Math.max(sl[0], ev[ev.length - 1][0] + J(20, 5)));
      ev.push(sl);
    }
  }
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
  // the family's workplace in the City (a family workshop or shop), if any
  F.familyWork = (mem.find((m) => (m.role === 'worker_in' || m.role === 'shopkeeper') && m.work && (m.work.cat === 'foodfac' || m.work.cat === 'shop' || m.work.cat === 'eating')) || {}).work || null;
  // outwork at home (p88): about 3 homemakers in 10 (INFERRED)
  F.outwork = !!mum && r() < 0.3;
  // part-time work at a food workshop (pp292-293): about 1 homemaker in 10 of the others (INFERRED)
  F.partTime = !!mum && !F.outwork && r() < 0.1;
  // A family workshop: "A workplace during the day became a living room at night" (p173). Its
  // maker: "We have a flat up above but we cook and take our showers here, and my kids do their
  // homework here too" (Hui Tung Choy (許東財), p173). A maker of wooden rulers: "I have to stay
  // here at night otherwise the drug addicts would steal everything" (Cheng San (鄭山), p169).
  // Which families do so is INFERRED: 3 in 10 of the families with a workshop and children
  // spend the evenings there, Monday to Saturday; 1 in 10 of the men who own a workshop sleeps
  // there. The owner of a workshop is the first resident who works in it (population.js).
  const hand = !h.home.lived && mem.find((m) => m.role === 'worker_in' && m.work && m.work.owner === m.id && HAND.has(m.work.cat));
  const hs = (h.seed * 7919) % 1;
  if (hand && hs < 0.3 && mem.some((m) => m.role === 'child' || (m.role === 'student' && m.age < 15))) {
    if (!sun && !dz) { F.evenWork = hand.work; F.evenBack = J(H(21, 40), 20); }
  } else if (hand && hand.sex === 'm' && hs >= 0.3 && hs < 0.4) F.guard = hand.id;
  F.lived = h.home.lived ? h.home.cat : null;
  // a grandparent collects the young schoolchildren of the morning session (p54) when there is
  // no homemaker
  F.pickup = !mum && old && !sat && !sun && mem.some((m) => m.role === 'student' && m.age < 12 && m.seed < 0.5) ? J(H(12, 50), 8) : 0;
  if (sun && h.kind === 'family' && r() < 0.45) F.outing = { t0: J(H(9, 40), 30), t1: J(H(14, 0), 50) };
  F.hasOld = !!old;
  // Young children with no one of the household at home by day: "within any one building, a
  // grandmother or housewife might take care of several of the neighbours' children as well as
  // her own", and the parents "would stop by and pick them up on their way home from work"
  // (p54). The neighbour is a household of the building with a homemaker or an old person; the
  // hours are INFERRED.
  const young = mem.filter((m) => m.role === 'child' || (m.role === 'student' && m.age < 12));
  if (!keeper && young.length && !sun) {
    const nb = X.minderFor?.(h.home, h.id), par = mem.find((m) => m.role === 'worker_out' || m.role === 'worker_in' || m.role === 'shopkeeper');
    if (nb && par) { F.minder = nb.home; F.minderHh = nb.id; F.minded = new Set(young.map((m) => m.id)); F.dropT = J(H(6, 40), 8); F.pickT = F.dinner - J(25, 10); F.picker = par.id; }
  }
  // "Early evening brought whole families up to the roof. A grandmother would keep her eye on her
  // own grandchildren as well as the children of her neighbours, while her daughter prepared
  // supper in an apartment below" (p322). On about 1 evening in 5 (INFERRED).
  if (old && young.length && !dz && r() < 0.2) F.roofEve = { who: old.id, gp: old.sex === 'f' ? 'grandmother' : 'grandfather', kids: new Set(young.map((m) => m.id)), t0: J(H(17, 0), 15), t1: J(H(17, 55), 10) };
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
