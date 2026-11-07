// The people of the week on the structure: where each one is at each minute, and the walk
// between two places on the routes of the structure (nav.js). The day of each person comes
// from routines.js; the people from population.js.
//
// A person at a place stands, sits or lies at a spot of it: a cell of the room (unit), of the
// roof, or of the lane. Between two places the person walks the route: down the stairs, along
// the corridors and the lanes, over the bridges and the roofs. A person who is out of the City
// walks out at the edge of the plan and is not drawn.
import { Nav, WALK, CLIMB } from './nav.js';
import { planDay, planHouse, OUT } from './routines.js';
import { mulberry32 } from '../util.js';

// The node kinds of nav.js that are open to the sky (drawn always); the others are inside.
const OPEN_KIND = new Set([0, 5, 7, 8, 9]); // lane, street, bridge, roof, roofedge
const H = (h, m = 0) => h * 60 + m;
const RUSH = new Set(['plastics', 'metal', 'garment', 'works']);
export const POSE = { stand: 0, sit: 1, lie: 2, walk: 3 };
const SIT = /breakfast|lunch|dinner|supper|tea|TV|television|radio|resting|mahjong|homework|studies|sewing|wrapping|clinic|dentist|doctor|school|kindergarten|worship|service|inking|accounts|drawing|map|music|orchestra|playing cards|meeting|patients|cutting hair|sitting|vegetables|calligraphy|outwork|packing|prayer/i;
const DOING = {
  plastics: 'at the plastics workshop', metal: 'at the metal workshop', garment: 'at the garment workshop',
  foodfac: 'at the food workshop', works: 'at the workshop', shop: 'in the shop', eating: 'at the eating house',
  office: 'at the office', storage: 'at the store room', services: 'at work', dentist: 'at the dental clinic',
  clinic: 'at the clinic', medicine: 'at the herbalist’s shop', school: 'at the school', religion: 'at the mission',
  community: 'at the association', vice: 'at work',
};
const KEEP = {
  shop: 'minding the shop', eating: 'running the eating house', office: 'at the office', medicine: 'minding the herbalist’s shop',
  dentist: 'seeing patients at the dental clinic', clinic: 'seeing patients at the clinic', services: 'at work', storage: 'at the store room',
};

export class Life {
  constructor(S, uses, pop, opts = {}) {
    this.S = S;
    this.nav = opts.nav || new Nav(S);
    const nav = this.nav, L = S.L;
    this.persons = pop.persons;
    const N = (this.N = this.persons.length);
    this.pos = new Float32Array(N * 3);
    this.misc = new Float32Array(N * 4); // heading, layer, pose, flags (1 inside, 2 hidden)
    this.state = this.persons.map(() => ({ ev: null, ei: -1, cur: null, spot: null, trip: null, wait: null, next: null }));
    this.outTree = nav.tree(nav.exits);
    this.cache = new Map();
    this.queue = [];
    this.day = -1;
    this.lastW = -Infinity;
    this.unitCache = new Map();

    // ---- the places of the routines ----
    const placeOf = (key) => {
      if (key.startsWith('roof:')) { const b = +key.slice(5), node = nav.roof(b); return node >= 0 ? { kind: 'roof', node, b, k: S.list[b].n, key } : null; }
      const [b, k, u] = key.split(':').map(Number), node = nav.unit(b, k, u);
      return node >= 0 ? { kind: 'unit', node, b, k, u, key, cat: uses.get(b, k, u)?.cat } : null;
    };
    this.placeOf = placeOf;
    const P = (key) => placeOf(key);
    const units = (f) => [...uses.at].filter(([, r]) => f(r)).map(([key]) => P(key)).filter(Boolean);
    const standpipe = P('216:0:1');
    if (standpipe) { standpipe.tree = 'standpipe'; this.standTree = nav.tree([standpipe.node]); }
    const places = {
      standpipe, kinder: P('185:0:1'), candy: P('271:0:0'), centre: P('172:2:1'), tutor: P('262:2:0'), temple: P('74:0:0'),
      eating: units((r) => r.cat === 'eating'),
      shops: units((r) => r.cat === 'shop').map((q) => ({ ...q, tree: 'stores' })),
      foodfacs: units((r) => r.cat === 'foodfac'),
      makers: units((r) => r.cat === 'plastics' || r.cat === 'metal' || r.cat === 'garment' || r.cat === 'works'),
      tinHau: P('54:0:0'), music: P('157:3:0'),
      // Jackie Pullinger (潘靈卓): the Shuiyuan youth centre on Tai Chang Street (pp258-260) and the
      // St Stephen's Society, where the daily prayer is (p263)
      shuiyuan: P('254:0:3'), society: P('237:0:0'),
      // the youth centre of the Hong Kong Federation of Youth Groups (香港青年協會), beside the
      // free-school centre: "有不少年青人流連" (HK01, 2016; room_uses T30)
      youth: P('99:3:4'),
      clinics: units((r) => r.cat === 'dentist' || r.cat === 'clinic'),
    };
    const homes = pop.homes;
    // The lanes inside the City, for the beats, the sweepers and the walkers.
    const lanes = [];
    for (let k = 0; k < L.N; k++) if (S.laneNode[k] >= 0 && L.inside[k]) lanes.push(S.laneNode[k]);
    const roofs = S.list.filter((b) => nav.roof(b.id) >= 0).map((b) => b.id);
    const roofFor = new Map();
    const findRoof = (b) => {
      if (b === undefined || b === null) return null;
      if (roofFor.has(b)) return roofFor.get(b);
      const B = S.list[b];
      let best = nav.roof(b) >= 0 ? b : -1, bd = 25;
      if (best < 0) for (const c of roofs) { const d = Math.hypot(S.list[c].cx - B.cx, S.list[c].cz - B.cz); if (d < bd) { bd = d; best = c; } }
      const out = best >= 0 ? P(`roof:${best}`) : null;
      roofFor.set(b, out);
      return out;
    };
    // The roofs that join (ladders and steps, links.js): for the postman's way over the roofs.
    this.roofAdj = new Map();
    for (const d of S.doors) if (d.kind === 'ladder' || d.kind === 'step') {
      for (const [a, c] of [[d.b, d.c], [d.c, d.b]]) { if (!this.roofAdj.has(a)) this.roofAdj.set(a, []); this.roofAdj.get(a).push(c); }
    }
    const lys = S.list.filter((b) => /Lo Yan Street/.test(b.label) && b.n > 1).map((b) => b.id);
    const side = S.list.filter((b) => /Kwong Ming|Tai Chang|Sai Shing|Lung Chun|Tung Tau Tsuen/.test(b.label) && b.n > 5).map((b) => b.id);
    // ---- the households, the water and the eight standpipes ----
    this.households = pop.households || [];
    // The eight Government standpipes of drinking water (p249): the one in the City, on Tai Chang
    // Street (大井街), and seven outside it (data/utilities.json, placement). Each home goes to
    // the nearest one: one search finds the way from every node.
    const UP = opts.utilities?.placement, pipes = [];
    const spots = UP ? [UP.standpipe_inside && [...UP.standpipe_inside.xz, UP.standpipe_inside.wall_of], ...(UP.outside_standpipes?.list || []).map((o) => [...o.xz, o.nearest_building])].filter(Boolean) : [];
    // the lane node nearest (x, z), within maxD m, or -1
    const laneNear = (x, z, maxD) => {
      let best = -1, bd = maxD;
      for (let v = 0; v < nav.N; v++) {
        if (nav.kind[v] !== 0 && nav.kind[v] !== 5) continue;
        const d = Math.hypot(nav.x[v] - x, nav.z[v] - z);
        if (d < bd) { bd = d; best = v; }
      }
      return best;
    };
    for (const [x, z, b] of spots) {
      const best = laneNear(x, z, 3);
      if (best >= 0) pipes.push({ kind: 'lane', node: best, b, tree: 'pipes', queue: true, key: `standpipe:${pipes.length}`, label: pipes.length ? 'at a Government standpipe outside the City' : 'at the Government standpipe of Tai Chang Street (大井街)' });
    }
    this.pipes = pipes;
    // The cafés of the east edge, by Tung Tsing Road (東正道), where the taxi drivers ate (p294).
    places.cafes = places.eating.filter((q) => q.k === 0 && S.list[q.b].cx > 84);
    // The Yamen courtyard (p299): the lane nearest the middle of the Yamen buildings.
    {
      const yam = S.list.filter((B) => /Yamen/.test(B.label));
      const v = yam.length ? laneNear(yam.reduce((t, B) => t + B.cx, 0) / yam.length, yam.reduce((t, B) => t + B.cz, 0) / yam.length, 20) : -1;
      if (v >= 0) places.yard = { kind: 'lane', node: v, key: 'yamen-yard', label: 'in the Yamen courtyard', spread: 12 };
    }
    this.pipeTree = pipes.length ? nav.tree(pipes.map((q) => q.node)) : null;
    this.trees = { pipes: this.pipeTree };
    // The 23 refuse points of the named lanes (data/utilities.json, placement), where the
    // refuse collectors come before dawn (p93), and the few who take their rubbish down go (p179).
    const streetName = new Map((L.streets || []).map((st) => [st.key, st.name]));
    const refuse = [];
    for (const o of UP?.refuse_points?.list || []) {
      const v = laneNear(o.xz[0], o.xz[1], 4);
      if (v >= 0) refuse.push({ kind: 'lane', node: v, tree: 'refuse', key: `refuse:${refuse.length}`, label: `at the refuse point of ${streetName.get(o.street) || 'the lane'}` });
    }
    this.refuse = refuse;
    this.trees.refuse = refuse.length ? nav.tree(refuse.map((q) => q.node)) : null;
    const refuseAt = new Map(refuse.map((q) => [q.node, q])), refuseOf = new Map();
    const nearest = (tree, at, memo, pl) => {
      if (!tree || !pl || pl.node === undefined) return null;
      let q = memo.get(pl.node);
      if (q === undefined) {
        let v = pl.node, n = 0;
        while (v >= 0 && tree.next[v] >= 0 && n++ < 1e5) v = tree.next[v];
        q = tree.next[v] === -1 ? at.get(v) || null : null;
        memo.set(pl.node, q);
      }
      return q;
    };
    const pipeAt = new Map(pipes.map((q) => [q.node, q])), pipeOf = new Map();
    // The stores of the City: each home goes to the nearest one (one search, as for the standpipes).
    this.trees.stores = places.shops.length ? nav.tree(places.shops.map((q) => q.node)) : null;
    const storeAt = new Map(places.shops.map((q) => [q.node, q])), storeOf = new Map(), nearOf = new Map(), barberOf = new Map();
    const nearLists = { foodfacs: places.foodfacs, doctors: places.clinics.filter((q) => q.cat === 'clinic'), dentists: places.clinics.filter((q) => q.cat === 'dentist') };
    const barber = pop.persons.find((q) => q.real === 'ho-chi-kam')?.work || null;
    const houseMemo = new Map();
    // the lanes of the named streets: the main streets of the police beats
    const streetNodes = [];
    for (const cells of Object.values(L.streetLanes || {})) for (const k of cells) if (S.laneNode[k] >= 0) streetNodes.push(S.laneNode[k]);
    const streetSpot = (r) => (streetNodes.length ? { kind: 'lane', node: streetNodes[Math.floor(r() * streetNodes.length)] } : this.X.laneSpot(r));
    // another home in the same building, for a game of mahjong
    const homesOf = new Map();
    for (const h of pop.homes || []) { if (!homesOf.has(h.b)) homesOf.set(h.b, []); homesOf.get(h.b).push(h); }
    const neighbour = (home, r) => {
      const list = homesOf.get(home.b);
      if (!list || list.length < 2) return null;
      for (let t = 0; t < 4; t++) { const h = list[Math.floor(r() * list.length)]; if (h !== home) return h; }
      return null;
    };
    // the lane nearest a home (by the walk, down the stairs), for a chat after dinner: one search
    // finds it from every node, as for the standpipes
    this.trees.lanes = lanes.length ? nav.tree(lanes) : null;
    const laneAt = new Map(), laneOf = new Map();
    const laneBy = (home) => {
      if (!this.trees.lanes || !home || home.node === undefined) return null;
      let v = home.node, n = 0;
      if (!laneOf.has(v)) {
        const T = this.trees.lanes;
        while (v >= 0 && T.next[v] >= 0 && n++ < 1e5) v = T.next[v];
        if (T.next[v] !== -1) laneOf.set(home.node, null);
        else {
          if (!laneAt.has(v)) laneAt.set(v, { kind: 'lane', node: v, tree: 'lanes', label: 'in the lane by the building' });
          laneOf.set(home.node, laneAt.get(v));
        }
      }
      return laneOf.get(home.node);
    };
    // the households of each building with someone at home by day (a homemaker, or an old person
    // under 80): they mind the neighbours' young children (p54)
    let minders = null;
    const minderFor = (home, hid) => {
      if (!minders) {
        minders = new Map();
        for (const h of this.households) {
          if (!h.members.some((i) => this.persons[i].role === 'homemaker' || (this.persons[i].role === 'elder' && this.persons[i].age < 80))) continue;
          if (!minders.has(h.home.b)) minders.set(h.home.b, []);
          minders.get(h.home.b).push(h);
        }
      }
      const list = (minders.get(home.b) || []).filter((h) => h.id !== hid);
      if (!list.length) return null;
      // the household of the same flat first (a lodger and its host), then one of the building
      return list.find((h) => h.home === home) || list[hid % list.length];
    };
    // An old mother and her grown daughter's family in the same building: "Chung Lo Ying's
    // daughter, Chung Yuk Yee, often joined her mother for dinner and helped with the cooking"
    // (p158). For about half of the households of old people with an old woman (INFERRED), a
    // family of the building with a homemaker 18 to 45 years younger; each family has at most one
    // such mother.
    let kin = null;
    const kinLinks = () => {
      if (kin) return kin;
      kin = { daughter: new Map(), mother: new Map() };
      const byB = new Map(), pp = (h) => h.members.map((i) => this.persons[i]);
      for (const h of this.households) {
        if (h.kind !== 'family' || h.home.lived) continue;
        const mum = pp(h).find((m) => m.role === 'homemaker' && m.sex === 'f');
        if (!mum) continue;
        if (!byB.has(h.home.b)) byB.set(h.home.b, []);
        byB.get(h.home.b).push({ h, mum });
      }
      for (const h of this.households) {
        if (h.kind !== 'alone' && h.kind !== 'old couple' && h.kind !== 'old women') continue;
        const mother = pp(h).find((m) => m.role === 'elder' && m.sex === 'f');
        if (!mother || mulberry32(h.id * 7 + 3)() >= 0.5) continue;
        const c = (byB.get(h.home.b) || []).find((x) => !kin.mother.has(x.h.id) && x.h.home !== h.home && x.mum.age <= mother.age - 18 && x.mum.age >= mother.age - 45);
        if (!c) continue;
        kin.daughter.set(h.id, { hh: c.h.id, id: c.mum.id, home: c.h.home, mother: mother.id });
        kin.mother.set(c.h.id, { hh: h.id, id: mother.id, home: h.home });
      }
      return kin;
    };
    this.X = {
      places, place: P, roofFor: findRoof, refuse, streetSpot, neighbour, laneBy, minderFor,
      daughterOf: (hid) => kinLinks().daughter.get(hid) || null,
      motherOf: (hid) => kinLinks().mother.get(hid) || null,
      // the days the daughter comes to dinner: about 2 in 5 (INFERRED), at a time of the
      // mother's household
      kinDay: (mumHid, dow) => {
        const q = mulberry32(mumHid * 7919 + dow * 31 + 11);
        if (q() >= 0.4) return null;
        const d = 18 * 60 + 25 + Math.floor(q() * 35);
        return { t0: d - 65, dinner: d, t1: d + 50 };
      },
      // A rush order: the workers come back after dinner and work until 2 or 3 am (p237); a
      // workshop could run "24 hours a day" (p88). On about 1 day in 12 for each workshop
      // (INFERRED). The food workshops work through the night of Sunday 21 December, before
      // 冬至 (Monday 22 December): bakers and roast-meat makers worked overnight at festivals
      // (pp44, 289); 冬至 is not named (INFERRED).
      rush: (w, dow) => {
        if (!w || w.kind !== 'unit') return false;
        if (w.cat === 'foodfac') return dow === 6; // Sunday
        if (!RUSH.has(w.cat)) return false;
        return mulberry32(w.b * 7919 + w.k * 131 + (w.u || 0) * 17 + dow * 7717)() < 0.08;
      },
      pipeFor: (pl) => nearest(this.pipeTree, pipeAt, pipeOf, pl),
      refuseFor: (pl) => nearest(this.trees.refuse, refuseAt, refuseOf, pl),
      storeFor: (pl) => nearest(this.trees.stores, storeAt, storeOf, pl),
      // the barber's shop of Ho Chi Kam (何智錦), for the people who live within 20 m of it (p28; INFERRED distance)
      barberFor: (pl) => {
        if (!barber || !pl || pl.b === undefined) return null;
        if (!barberOf.has(pl.b)) { const B = S.list[pl.b], C = S.list[barber.b]; barberOf.set(pl.b, Math.hypot(C.cx - B.cx, C.cz - B.cz) < 20); }
        return barberOf.get(pl.b) ? barber : null;
      },
      // one of the three places of a kind (foodfacs, doctors, dentists) nearest a home (straight,
      // between the buildings); i picks one
      near: (kind, pl, i = 0) => {
        const list = nearLists[kind];
        if (!pl || pl.b === undefined || !list?.length) return null;
        const key = `${kind}:${pl.b}`;
        if (!nearOf.has(key)) {
          const B = S.list[pl.b], d = (q) => { const C = S.list[q.b]; return Math.hypot(C.cx - B.cx, C.cz - B.cz); };
          nearOf.set(key, list.map((q) => [d(q), q]).sort((a, b) => a[0] - b[0]).slice(0, 3).map((e) => e[1]));
        }
        const L = nearOf.get(key);
        return L[i % L.length];
      },
      foodNear: (pl, i = 0) => this.X.near('foodfacs', pl, i),
      // The household of person p on day dow (routines.js planHouse), kept for the day.
      house: (p, dow) => {
        const key = dow * 1e6 + p.hh;
        let F = houseMemo.get(key);
        if (F === undefined) {
          if (houseMemo.size > 30000) houseMemo.clear();
          const h = this.households[p.hh];
          F = h ? planHouse(h, h.members.map((i) => this.persons[i]), dow, this.X) : null;
          houseMemo.set(key, F);
        }
        return F;
      },
      homeOf: (hid) => this.households[hid]?.home || null,
      // The water of floor k of building b. INFERRED from the facts named: some blocks had water
      // all day (p113); many pumps ran at noon and midnight, and the taps ran a few hours after
      // (p107); elsewhere the water came by floors, low floors first (林羅平, HK01), and a top
      // floor got it from 3 pm (袁家倫, Epoch Times).
      water: (b, k) => {
        const q = mulberry32(b * 7919 + 17), v = q();
        if (v < 0.1) return { kind: 'all', day: null, night: null };
        if (v < 0.55) return { kind: 'runs', day: [H(12, 15), H(15, 0)], night: [H(0, 15), H(3, 0)] };
        const t0 = Math.round(H(6, 0) + q() * 50 + Math.max(0, k - 1) * 45);
        return { kind: 'floors', day: [t0, t0 + 90], night: null };
      },
      // The walk between two places, in minutes (straight, with the climb; a guess for the plan).
      walkMin: (a, b) => {
        const d = Math.hypot(nav.x[a.node] - nav.x[b.node], nav.z[a.node] - nav.z[b.node]) * 1.4;
        return Math.max(d / WALK, Math.abs(nav.y[a.node] - nav.y[b.node]) / CLIMB) / 60 + 0.5;
      },
      // The kindergarten of a household: the Salvation Army kindergarten (p300) for some (it had
      // "80 students", p300: 2 households in 25 give 80), one outside the City for the
      // others (INFERRED).
      kinderFor: (hid) => (places.kinder && hid % 25 < 2 ? places.kinder : OUT('at a kindergarten outside the City')),
      laneSpot: (r) => ({ kind: 'lane', node: lanes[Math.floor(r() * lanes.length)] }),
      anyRoof: (r) => P(`roof:${roofs[Math.floor(r() * roofs.length)]}`),
      anyHome: (r) => homes[Math.floor(r() * homes.length)],
      workDoing: (w, keeper) => (w ? (keeper && KEEP[w.cat]) || DOING[w.cat] || 'at work' : 'at work'),
      // The postman's round (pp145-146): the store on Lo Yan Street (老人街), the entrances along
      // the street, letters on the 4/F or 5/F of buildings in the side alleys, then up one stair,
      // over the roofs by ladders and windows, and down another. The stops are INFERRED.
      postRound: (p, t0, t1, at, r, w) => {
        const store = p.places?.store || P('45:0:2');
        const g = (b) => { const B = S.list[b], us = B.phaseOf(0).plan.units; return us.length ? P(`${b}:0:${us[Math.floor(r() * us.length)].id}`) : null; };
        const up = (b) => { const B = S.list[b], k = Math.min(B.n - 1, 4 + Math.floor(r() * 2)), us = B.phaseOf(k).plan.units; return us.length ? P(`${b}:${k}:${us[Math.floor(r() * us.length)].id}`) : null; };
        const stops = [[store, 'with the mail at the store on Lo Yan Street (p146)']];
        const L1 = [...lys].sort(() => r() - 0.5).slice(0, 7);
        for (const b of L1) stops.push([g(b), 'filling the letter boxes in the entrance']);
        for (let q = 0; q < 5 && side.length; q++) {
          const b = side[Math.floor(r() * side.length)];
          stops.push([g(b), 'filling the letter boxes in the entrance']);
          stops.push([up(b), 'a letter for a resident on 4/F or 5/F (p146)']);
          if (q === 1 || q === 3) {
            let c = b;
            for (let h = 0; h < 3; h++) {
              const roof = P(`roof:${c}`);
              if (roof) stops.push([roof, 'crossing the roofs by ladders and windows (pp145–146)']);
              const nx = this.roofAdj.get(c);
              if (!nx || !nx.length) break;
              c = nx[Math.floor(r() * nx.length)];
            }
            stops.push([g(c), 'down another stair to the lanes (p146)']);
          }
        }
        let t = t0;
        for (const [pl, what] of stops) { if (t >= t1 - 5) break; if (pl) { at(t, pl, what, w); t += 8 + r() * 7; } }
      },
    };
  }

  // The power cuts of day `day`: "the Walled City was often hit by power cuts" (Lam Po Chun
  // (林寶鎮), p145), and houses shared one cable (p44). The rate, the hours and the size are INFERRED: on about
  // half the evenings one cut (some evenings two), each of 25 to 60 minutes, in a building and
  // up to five more within 15 m of it. [{ bs: Set of buildings, t0, t1 }]
  cutsOf(day) {
    this.cutMemo = this.cutMemo || new Map();
    let list = this.cutMemo.get(day);
    if (!list) {
      const r = mulberry32(9137 + day * 613), S = this.S;
      list = [];
      const n = r() < 0.5 ? 0 : r() < 0.7 ? 1 : 2;
      for (let q = 0; q < n; q++) {
        const B = S.list[Math.floor(r() * S.list.length)];
        const near = S.list.filter((c) => c !== B && Math.hypot(c.cx - B.cx, c.cz - B.cz) < 15).sort(() => r() - 0.5).slice(0, 5);
        const t0 = Math.round(18 * 60 + r() * 300);
        list.push({ bs: new Set([B.id, ...near.map((c) => c.id)]), t0, t1: t0 + 25 + Math.round(r() * 35) });
      }
      this.cutMemo.set(day, list);
    }
    return list;
  }

  // The buildings without power now (a Set), or null.
  cutsNow() {
    if (this.day < 0) return null;
    const m = this.lastW - this.day * 1440;
    let out = null;
    for (const c of this.cutsOf(this.day)) if (m >= c.t0 && m < c.t1) { out = out || new Set(); for (const b of c.bs) out.add(b); }
    return out;
  }

  // The unit object of a place, with its cells.
  unitOf(pl) {
    const key = pl.key;
    let u = this.unitCache.get(key);
    if (u === undefined) {
      const B = this.S.list[pl.b];
      u = pl.k < B.n ? { plan: B.phaseOf(pl.k).plan, unit: B.phaseOf(pl.k).plan.units.find((x) => x.id === pl.u) } : null;
      this.unitCache.set(key, u);
    }
    return u;
  }

  // The spot of person i at place pl: [x, y, z, layer, inside].
  spot(i, pl) {
    const nav = this.nav, r = mulberry32((i * 7919 + (pl.node || 0) * 31) >>> 0);
    if (pl.kind === 'out') return null;
    const n = pl.node, base = [nav.x[n], nav.y[n], nav.z[n], nav.layer[n], OPEN_KIND.has(nav.kind[n]) ? 0 : 1];
    if (pl.kind === 'unit') {
      const U = this.unitOf(pl);
      if (U && U.unit && U.unit.cells.length) {
        const c = U.unit.cells[Math.floor(r() * U.unit.cells.length)], R = U.plan.R;
        const [x, z] = R.xz(c % R.ni, Math.floor(c / R.ni));
        return [x + (r() - 0.5) * 0.2, base[1], z + (r() - 0.5) * 0.2, base[3], 1];
      }
      return base;
    }
    if (pl.kind === 'roof') {
      const B = this.S.list[pl.b], plan = B.phaseOf(B.n - 1).plan, R = plan.R;
      for (let t = 0; t < 8; t++) {
        const x = base[0] + (r() - 0.5) * 7, z = base[2] + (r() - 0.5) * 7, c = R.cellXZ(x, z);
        if (c >= 0 && R.inside[c]) return [x, B.top, z, B.n, 0];
      }
      return [base[0], B.top, base[2], B.n, 0];
    }
    // an open place (the Yamen courtyard): a spot on a lane cell within `spread` m of the node
    if (pl.spread) {
      const L = this.S.L;
      for (let t = 0; t < 10; t++) {
        const x = base[0] + (r() - 0.5) * pl.spread, z = base[2] + (r() - 0.5) * pl.spread;
        const cx = Math.floor(x - L.x0), cz = Math.floor(z - L.z0), k = cz * L.W + cx;
        if (cx < 0 || cz < 0 || cx >= L.W || cz >= L.D) continue;
        const v = this.S.laneNode[k];
        if (v >= 0) return [x, nav.y[v], z, base[3], 0];
      }
    }
    const w = pl.queue ? 2.6 : 0.6; // a queue at a standpipe
    return [base[0] + (r() - 0.5) * w, base[1], base[2] + (r() - 0.5) * w, base[3], 0];
  }

  // The route between two places, as node ids, or undefined (not yet found) or null (none).
  routeOf(a, b, now) {
    const nav = this.nav;
    if (b.kind === 'out') return a.kind === 'out' ? null : nav.follow(this.outTree, a.node);
    if (a.kind === 'out') return nav.follow(this.outTree, b.node, true);
    if (a.node === b.node) return Int32Array.of(a.node);
    // to or from a standpipe or a refuse point: the tree of the nearest one, if it is this one
    if (b.tree && this.trees[b.tree] && !a.tree) { const p = nav.follow(this.trees[b.tree], a.node); if (p && p[p.length - 1] === b.node) return p; }
    if (a.tree && this.trees[a.tree] && !b.tree) { const p = nav.follow(this.trees[a.tree], b.node, true); if (p && p[0] === a.node) return p; }
    if (b.tree === 'standpipe') return nav.follow(this.standTree, a.node);
    if (a.tree === 'standpipe') return nav.follow(this.standTree, b.node, true);
    const key = `${a.node}>${b.node}`;
    let p = this.cache.get(key);
    if (p !== undefined) return p;
    const back = this.cache.get(`${b.node}>${a.node}`);
    if (back !== undefined) return back && back.slice().reverse();
    if (!now) return undefined;
    p = nav.route(a.node, b.node);
    this.cache.set(key, p);
    return p;
  }

  // A walk: the points of the route from spot sa to spot sb, with the time of each.
  trip(i, path, sa, sb, t0) {
    const nav = this.nav, n = path.length + (sa ? 1 : 0) + (sb ? 1 : 0);
    const pts = new Float32Array(n * 3), lay = new Uint8Array(n), ins = new Uint8Array(n), T = new Float32Array(n);
    let q = 0;
    const put = (x, y, z, l, inside) => { pts[q * 3] = x; pts[q * 3 + 1] = y; pts[q * 3 + 2] = z; lay[q] = l; ins[q] = inside; q++; };
    if (sa) put(...sa);
    for (const v of path) put(nav.x[v], nav.y[v], nav.z[v], nav.layer[v], OPEN_KIND.has(nav.kind[v]) ? 0 : 1);
    if (sb) put(...sb);
    for (let j = 1; j < n; j++) {
      const dx = pts[j * 3] - pts[j * 3 - 3], dy = pts[j * 3 + 1] - pts[j * 3 - 2], dz = pts[j * 3 + 2] - pts[j * 3 - 1];
      T[j] = T[j - 1] + Math.max(Math.hypot(dx, dz) / WALK, Math.abs(dy) / CLIMB);
    }
    return { pts, lay, ins, T, t0, end: t0 + T[n - 1] / 60 };
  }

  // Put person i at a place, still.
  settle(i, pl, doing, slot = null) {
    const s = this.state[i];
    s.cur = pl; s.trip = null; s.wait = null;
    s.spot = this.spot(i, pl);
    s.doing = doing; s.slot = slot;
    this.draw(i);
  }

  draw(i) {
    const s = this.state[i], o = i * 3, m = i * 4;
    if (!s.spot) { this.misc[m + 3] = 2; return; }
    this.pos[o] = s.spot[0]; this.pos[o + 1] = s.spot[1]; this.pos[o + 2] = s.spot[2];
    this.misc[m] = (this.persons[i].seed * 6.283) % 6.283;
    this.misc[m + 1] = s.spot[3];
    this.misc[m + 2] = /asleep|a nap/.test(s.doing || '') ? POSE.lie : SIT.test(s.doing || '') ? POSE.sit : POSE.stand;
    this.misc[m + 3] = s.spot[4] ? 1 : 0;
  }

  // The plans of a day for every person, and where each one is at minute 0 of it.
  planAll(day) {
    for (let i = 0; i < this.N; i++) {
      const s = this.state[i];
      s.ev = s.next && s.next.day === day ? s.next.ev : planDay(this.persons[i], day, this.X);
      s.next = null;
      s.ei = -1;
    }
    this.day = day;
    this.nextPlan = 0;
  }

  // The clock jumped: each person goes straight to where the plan puts them at minute m.
  jump(day, m) {
    if (day !== this.day) this.planAll(day);
    for (let i = 0; i < this.N; i++) {
      const s = this.state[i], ev = s.ev;
      let ei = 0;
      while (ei + 1 < ev.length && ev[ei + 1][0] <= m) ei++;
      s.ei = ei;
      this.settle(i, ev[ei][1], ev[ei][2], ev[ei][3]);
    }
  }

  // The time is minute m of day `day`. budget: ms for new routes in this frame.
  update(day, m, budget = 4) {
    const W = day * 1440 + m;
    if (W < this.lastW || W - this.lastW > 180 || this.day < 0) { this.jump(day, m); this.lastW = W; return; }
    if (day !== this.day) {
      // a new day: the place of each person carries over
      this.planAll(day);
    }
    this.lastW = W;
    const t0 = performance.now();
    let routed = 0;
    for (let i = 0; i < this.N; i++) {
      const s = this.state[i], ev = s.ev;
      // the next event of the plan
      if (!s.wait && s.ei + 1 < ev.length && ev[s.ei + 1][0] <= m) {
        while (s.ei + 1 < ev.length && ev[s.ei + 1][0] <= m) s.ei++;
        const [tm, pl, doing, x] = ev[s.ei];
        s.wait = { pl, doing, x, t: day * 1440 + tm };
      }
      if (s.wait) {
        const from = s.trip ? null : s.cur;
        if (s.trip) { /* finish the walk first, from where it ends */ }
        else if (!from || from === s.wait.pl || (from.kind === 'out' && s.wait.pl.kind === 'out')) { this.settle(i, s.wait.pl, s.wait.doing, s.wait.x); }
        else {
          let path = this.routeOf(from, s.wait.pl, false);
          if (path === undefined && performance.now() - t0 < budget) { path = this.routeOf(from, s.wait.pl, true); routed++; }
          if (path === null) this.settle(i, s.wait.pl, s.wait.doing, s.wait.x);
          else if (path !== undefined) {
            const sb = this.spot(i, s.wait.pl);
            s.trip = this.trip(i, path, s.spot, sb, Math.max(s.wait.t, W - 0.5));
            s.trip.to = s.wait.pl; s.trip.doing = s.wait.doing; s.trip.sb = sb; s.trip.slot = s.wait.x;
            s.wait = null;
          }
        }
      }
      if (s.trip) {
        const tr = s.trip;
        if (W >= tr.end) {
          s.cur = tr.to; s.spot = tr.sb; s.doing = tr.doing; s.slot = tr.slot; s.trip = null;
          this.draw(i);
        } else this.walk(i, tr, (W - tr.t0) * 60);
      }
    }
    // plan the next day, a few people in each frame
    if (this.day < 6) {
      const n = Math.min(this.N, this.nextPlan + 600);
      for (let i = this.nextPlan; i < n; i++) this.state[i].next = { day: this.day + 1, ev: planDay(this.persons[i], this.day + 1, this.X) };
      this.nextPlan = n;
    }
    this.routedLast = routed;
  }

  // Person i on a walk, sec seconds after its start.
  walk(i, tr, sec) {
    const T = tr.T, n = T.length;
    let lo = 0, hi = n - 1;
    if (sec <= 0) hi = 0;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (T[mid] <= sec) lo = mid; else hi = mid; }
    const j = Math.min(lo, n - 2), a = j * 3, b = a + 3, span = T[j + 1] - T[j];
    const f = n < 2 ? 0 : span > 0 ? Math.min(1, Math.max(0, (sec - T[j]) / span)) : 1;
    const P = tr.pts, o = i * 3, m = i * 4;
    if (n < 2) { this.pos[o] = P[0]; this.pos[o + 1] = P[1]; this.pos[o + 2] = P[2]; return; }
    this.pos[o] = P[a] + (P[b] - P[a]) * f;
    this.pos[o + 1] = P[a + 1] + (P[b + 1] - P[a + 1]) * f;
    this.pos[o + 2] = P[a + 2] + (P[b + 2] - P[a + 2]) * f;
    const dx = P[b] - P[a], dz = P[b + 2] - P[a + 2];
    if (dx * dx + dz * dz > 1e-4) this.misc[m] = Math.atan2(dx, dz);
    this.misc[m + 1] = f < 0.5 ? tr.lay[j] : tr.lay[j + 1];
    this.misc[m + 2] = POSE.walk;
    this.misc[m + 3] = tr.ins[j] && tr.ins[j + 1] ? 1 : 0;
  }

  // What person i does now, and where: for the panel.
  now(i) {
    const s = this.state[i];
    if (s.trip) return { walking: true, to: s.trip.to, doing: s.trip.doing, slot: s.trip.slot };
    if (s.wait) return { walking: false, at: s.cur, doing: s.wait.doing, slot: s.wait.x, waiting: true };
    return { walking: false, at: s.cur, doing: s.doing, slot: s.slot };
  }
}
export { OUT };
