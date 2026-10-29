// Plots, lanes and buildings, from the traced street plan (data/plan.json), and the
// businesses in them, from the clearance files (data/businesses.json).
//
// SOURCED: the lane network, the plot outlines, the Yamen compound, the roads on the old
// wall bases, the factory sites and named buildings (traced from the 1980s exhibit plan);
// 459 premises with street, house number, floor, name and trade (GRS HKRS1255-3 titles,
// parsed by tools/parse_grs.py); the storeys along the south face (Lambot's 1990 south
// elevation, M+ 2017.412). APPROXIMATE: where on its street each premises sits (the order
// follows the house numbers). INFERRED, and marked so: storeys away from the south face, and
// the trade of a floor that no file records.
import { mulberry32, vnoise, clamp, weighted } from './util.js';
import { buildFootprints, mainAxis, LANE, YARD, ROAD } from './footprint.js';

// No measured storey height is in hand. 3.05 m is a usual Hong Kong tenement storey.
export const STOREY = 3.05;
export const MAX_FLOORS = 14;
export const MARGIN = 18; // metres of street around the city, on the plinth

// Weathered concrete, mosaic tile and paint, sRGB (from the 1987-90 photos).
const FACADES = [
  ['#9d9a91', 9], ['#a9a59b', 8], ['#b8b2a4', 7], ['#8d8b85', 6], ['#c3bcaa', 5], ['#a8b6ab', 4],
  ['#9eafb7', 4], ['#c3aca2', 3], ['#bab9b0', 5], ['#a48f72', 2], ['#7e8483', 3], ['#b4a58a', 3],
  ['#d2cdbf', 4], ['#cfc6b0', 3],
];

// Floor uses. Each GRS trade maps to one use; the labels say what the premises were.
export const USE_LABEL = {
  home: 'flats',
  dentist: 'dentist',
  clinic: 'doctor / bone-setter',
  medicine: 'medicine shop',
  plastics: 'plastics workshop',
  metal: 'metal + machine shop',
  garment: 'garment, textile + shoe workshop',
  foodfac: 'food workshop',
  eating: 'eating house / ice café',
  shop: 'shop',
  works: 'other workshop',
  office: 'trading / property office',
  school: 'school / tuition school',
  kaifong: 'Kai Fong Welfare Association',
  temple: 'temple / shrine',
  youth: 'youth centre',
  yamen: 'Yamen · old people’s centre',
};
const TRADE_USE = {
  dentist: 'dentist', clinic: 'clinic', bonesetter: 'clinic', medicine: 'medicine',
  plastics: 'plastics', metal: 'metal', electrical: 'metal', toys: 'works',
  garment: 'garment', textile: 'garment', shoes: 'garment',
  fishball: 'foodfac', noodles: 'foodfac', meat: 'foodfac', roastmeat: 'foodfac', cakes: 'foodfac',
  food: 'foodfac', catering: 'foodfac',
  eatinghouse: 'eating', cafe: 'eating',
  store: 'shop', jewellery: 'shop', optical: 'shop', salon: 'shop', gas: 'shop', laundry: 'shop', furniture: 'shop',
  factory: 'works', printing: 'works', plumbing: 'works', construction: 'works',
  trading: 'office', property: 'office', transport: 'office', storage: 'office',
  school: 'school', kaifong: 'kaifong', temple: 'temple',
};
export const TRADE_LABEL = {
  dentist: 'dentist', clinic: 'clinic', bonesetter: 'bone-setter', medicine: 'medicine shop',
  plastics: 'plastics factory', metal: 'metal works', electrical: 'electrical works', toys: 'toy maker',
  garment: 'garment maker', textile: 'weaving / textile', shoes: 'shoe or leather maker',
  fishball: 'fishball maker', noodles: 'noodle maker', meat: 'meat products', roastmeat: 'roast meat',
  cakes: 'cakes and dim sum', food: 'food products', catering: 'catering (伙食)',
  eatinghouse: 'restaurant', cafe: 'ice café (冰室)', store: 'store', jewellery: 'jewellery or gems',
  optical: 'optical shop', salon: 'hair salon', gas: 'LP gas dealer', laundry: 'laundry', furniture: 'furniture',
  factory: 'factory', printing: 'printing or paper', plumbing: 'water + electrical works (水電)',
  construction: 'construction', trading: 'trading company', property: 'property agent', transport: 'transport company',
  storage: 'storage', school: 'tuition school', kaifong: 'kaifong association', temple: 'shrine',
};
export const USE_GROUP = {
  plastics: 'work', metal: 'work', garment: 'work', foodfac: 'work', works: 'work',
  dentist: 'shop', clinic: 'shop', medicine: 'shop', eating: 'shop', shop: 'shop', office: 'shop', school: 'shop',
};
export const USE_DOING = {
  plastics: 'at the plastics workshop', metal: 'at the metal works', garment: 'at the sewing machines',
  foodfac: 'at the food workshop', works: 'at the workshop', dentist: 'at the dentist’s', clinic: 'at the clinic',
  medicine: 'minding the medicine shop', eating: 'working at the eating house', shop: 'minding the shop',
  office: 'at the office', school: 'at the tuition school',
};

// Storeys along the south face, west to east, read off Lambot's 1990 south elevation
// (M+ 2017.412): the skyline height over the base, at 23.9 px per storey, in 40 steps.
// The skyline includes stair huts, thus each value is one storey or less above the roof.
const SOUTH_PROFILE = [11, 11, 11, 10, 11, 11, 10, 10, 10, 10, 11, 10, 11, 10, 10, 10, 11, 11, 11, 12,
  13, 12, 12, 12, 13, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 12, 10, 10, 10, 10];

const NAMES = {
  youthCentre: 'youth centre 青年中心',
  freeSchool: 'Lung Chun Free School Bldg 龍津義學大樓',
  tinHau: 'Tin Hau temple 天后廟',
  kaifong: 'Kai Fong Welfare Assn 街坊福利會',
};
export function buildingName(b) {
  if (b.kind === 'yamen') return 'the Yamen';
  if (NAMES[b.name]) return NAMES[b.name];
  if (b.address) return b.address;
  return `bldg ${b.id}`;
}

// Plan codes: 0 outside, 1 lane, 2 open yard, 3 road, 4+ plot.
const ALPH = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
export function decodePlan(plan) {
  const code = new Int32Array(plan.W * plan.D);
  const val = Object.fromEntries([...ALPH].map((ch, i) => [ch, i]));
  plan.rows.forEach((row, j) => {
    for (let i = 0; i < plan.W; i++) code[j * plan.W + i] = val[row[2 * i]] * 64 + val[row[2 * i + 1]];
  });
  return code;
}

export function buildLayout(site, plan, biz = null, seed = 1986) {
  const rng = mulberry32(seed);
  const pc = decodePlan(plan);
  const W = plan.W + 2 * MARGIN, D = plan.D + 2 * MARGIN, N = W * D;
  const x0 = -plan.W / 2 - MARGIN, z0 = -plan.D / 2 - MARGIN;

  // 0 = built, 1 = lane, 2 = open yard, 3 = road
  const inside = new Uint8Array(N), alley = new Uint8Array(N);
  const owner = new Int32Array(N).fill(-1);
  const byCode = new Map();
  for (let j = 0; j < plan.D; j++)
    for (let i = 0; i < plan.W; i++) {
      const v = pc[j * plan.W + i];
      if (!v) continue;
      const k = (j + MARGIN) * W + i + MARGIN;
      inside[k] = 1;
      if (v < 4) alley[k] = v;
      else {
        if (!byCode.has(v)) byCode.set(v, []);
        byCode.get(v).push(k);
      }
    }

  const nb4 = (k) => {
    const i = k % W, j = (k / W) | 0, out = [];
    if (i > 0) out.push(k - 1);
    if (i < W - 1) out.push(k + 1);
    if (j > 0) out.push(k - W);
    if (j < D - 1) out.push(k + W);
    return out;
  };

  // Gaps left inside the outline by the trace become open ground, so that "outside" means
  // the streets around the city.
  const outer = new Uint8Array(N), queue = [];
  for (let k = 0; k < N; k++) {
    const i = k % W, j = (k / W) | 0;
    if (!inside[k] && (i === 0 || j === 0 || i === W - 1 || j === D - 1)) { outer[k] = 1; queue.push(k); }
  }
  for (let q = 0; q < queue.length; q++)
    for (const n of nb4(queue[q])) if (!inside[n] && !outer[n]) { outer[n] = 1; queue.push(n); }
  for (let k = 0; k < N; k++) if (!inside[k] && !outer[k]) { inside[k] = 1; alley[k] = 1; }

  // True when nothing of the city lies above cell k in its column of the plan.
  const clearAbove = (k) => {
    for (let q = k; q >= 0; q -= W) if (inside[q]) return false;
    return true;
  };

  const yamenCodes = new Set(plan.yamenPlots), factoryCodes = new Set(plan.factoryPlots);
  const nameOf = Object.fromEntries(Object.entries(plan.named).map(([k, v]) => [v, k]));
  const buildings = [];
  for (const [code, cells] of [...byCode.entries()].sort((a, b) => a[0] - b[0])) {
    const b = { id: buildings.length, code, cells, kind: yamenCodes.has(code) ? 'yamen' : 'tenement' };
    if (nameOf[code]) b.name = nameOf[code];
    b.factory = factoryCodes.has(code);
    for (const k of cells) owner[k] = b.id;
    buildings.push(b);
  }
  const L = {
    W, D, N, x0, z0, inside, alley, owner, buildings,
    bbox: { minx: -plan.W / 2, maxx: plan.W / 2, minz: -plan.D / 2, maxz: plan.D / 2 },
    cellX: (k) => x0 + (k % W) + 0.5,
    cellZ: (k) => z0 + ((k / W) | 0) + 0.5,
  };

  // ---- footprints -----------------------------------------------------------------------
  const F = buildFootprints(L);
  L.ground = { lane: F.get(LANE) || [], yard: F.get(YARD) || [], road: F.get(ROAD) || [] };

  // ---- building attributes -------------------------------------------------------------
  const yamenCells = [];
  for (const b of buildings) if (b.kind === 'yamen') yamenCells.push(...b.cells);
  const yc = yamenCells.reduce((s, k) => [s[0] + L.cellX(k), s[1] + L.cellZ(k)], [0, 0]).map((v) => v / Math.max(1, yamenCells.length));
  for (const b of buildings) {
    let sx = 0, sz = 0, i0 = W, i1 = 0, j0 = D, j1 = 0, top = 0, road = 0;
    const alleyAdj = [];
    for (const k of b.cells) {
      const i = k % W, j = (k / W) | 0;
      sx += i; sz += j;
      i0 = Math.min(i0, i); i1 = Math.max(i1, i + 1); j0 = Math.min(j0, j); j1 = Math.max(j1, j + 1);
      for (const n of nb4(k)) {
        if (!inside[n]) {
          if (n === k - W && clearAbove(n)) top++; // faces up the plan: Tung Tau Tsuen Road
        } else if (alley[n]) {
          alleyAdj.push(k);
          if (alley[n] === 3) road++;
        }
      }
    }
    Object.assign(b, { i0, i1, j0, j1 });
    b.cx = x0 + sx / b.cells.length + 0.5;
    b.cz = z0 + sz / b.cells.length + 0.5;
    b.rings = F.get(b.id) || [];
    b.axis = mainAxis(b.rings);
    b.area = b.cells.length;
    b.front = top >= 2 && b.cz < 0 ? 'top' : road >= 2 ? 'road' : 'inner';
    const ci = sx / b.cells.length, cj = sz / b.cells.length;
    const near = (alleyAdj.length ? alleyAdj : b.cells).reduce((best, k) => {
      const d = (k % W - ci) ** 2 + (((k / W) | 0) - cj) ** 2;
      return d < best.d ? { k, d } : best;
    }, { k: b.cells[0], d: Infinity });
    b.stair = near.k;
    b.color = weighted(rng, FACADES);
    b.modW = 1.5 + rng() * 1.1;
    b.cage = 0.25 + rng() * 0.6;
    b.seed = rng();
    b.prem = {}; // floor -> premises from the GRS files
  }

  // ---- storeys ----------------------------------------------------------------------------
  // South face: from the 1990 elevation. Elsewhere: INFERRED from the 1989 aerial photos,
  // which show a tall rim (10-14) and lower blocks round the Yamen; "seven- to 14-story"
  // (Baltimore Sun, 1992) and "10 to 15-story" (UPI, 1987).
  const south = buildings.filter((b) => b.front === 'road' && b.cz > 0);
  const sx0 = Math.min(...south.map((b) => b.cx)), sx1 = Math.max(...south.map((b) => b.cx));
  const profileAt = (x) => {
    const t = clamp((x - sx0) / Math.max(1, sx1 - sx0), 0, 0.9999) * SOUTH_PROFILE.length;
    return SOUTH_PROFILE[Math.floor(t)];
  };
  const bz1 = L.bbox.maxz;
  for (const b of buildings) {
    if (b.kind === 'yamen') { b.floors = 1; b.uses = ['yamen']; b.color = '#8f8a80'; continue; }
    if (b.name === 'tinHau') { b.floors = 1; b.kind = 'low'; b.uses = ['temple']; b.color = '#a5826f'; continue; }
    if (b.name === 'youthCentre') { b.floors = 2; b.kind = 'low'; b.uses = ['youth', 'youth']; continue; }
    // The free-school centre (義學中心) stood with the youth centre and the old people's
    // home in the middle of the city (HK01, 2016). Its upper floors: INFERRED flats.
    if (b.name === 'freeSchool') { b.floors = 6; b.uses = ['school', 'school', 'home', 'home', 'home', 'home']; continue; }
    const dy = Math.hypot(b.cx - yc[0], b.cz - yc[1]);
    // Rim height: the south profile, carried north with noise; lower toward the Yamen.
    let f = profileAt(b.cx) - 0.5 + 2.4 * (vnoise(b.cx / 30, b.cz / 30, 3) - 0.5) + 1.6 * (vnoise(b.cx / 9, b.cz / 9, 7) - 0.5);
    f -= 5.5 * (1 - clamp((dy - 16) / 34, 0, 1));
    const southRow = b.front === 'road' && b.cz > bz1 - 22;
    if (southRow) f = profileAt(b.cx) - 0.3 - (rng() < 0.25 ? 1 : 0);
    const r = rng();
    if (!southRow && r < 0.07 && b.cells.length < 120) { f = 2 + rng() * 3; b.kind = 'low'; }
    b.floors = clamp(Math.round(f), 1, MAX_FLOORS);
    b.uses = new Array(b.floors).fill('home');
  }

  // ---- streets and premises ----------------------------------------------------------------
  const streets = Object.entries(plan.streets).map(([name, [i, j, dir]]) => ({
    name, dir, i: i + MARGIN, j: j + MARGIN, x: x0 + MARGIN + i + 0.5, z: z0 + MARGIN + j + 0.5,
  }));
  L.streets = streets;
  L.frontage = streetFrontages(L, streets);
  if (biz) placePremises(L, biz, rng);

  // Floors that no file records. INFERRED: the Kai Fong Association counted 645 shops,
  // workshops and clinics in 1983 (charted by WSJ, 2014). The clearance files place fewer,
  // thus more floors take a trade until the count is 645. Ground floors go first, street
  // fronts before lanes; some upper floors too ("shops and factories were on upper floors",
  // Lambot, 2019). The trade comes from the 1983 count: dentists and clinics on the street
  // fronts, factories in the lanes.
  if (biz) {
    let n = 0;
    for (const b of buildings) n += Object.keys(b.prem).length;
    const cand = [];
    for (const b of buildings) {
      if (b.kind !== 'tenement' && b.kind !== 'low') continue;
      if (b.name === 'kaifong' && !b.prem[0]) b.uses[0] = 'kaifong';
      for (let f = 0; f < Math.min(4, b.floors); f++) {
        if (b.prem[f] || b.uses[f] !== 'home') continue;
        const w = f > 0 ? 0.35 : b.factory ? 5 : b.front !== 'inner' ? 4 : 2;
        cand.push({ b, f, key: -Math.log(rng()) / w });
      }
    }
    cand.sort((a, c) => a.key - c.key);
    for (const { b, f } of cand) {
      if (n >= KAIFONG_1983_TOTAL) break;
      const pool = b.factory ? MIX_FACTORY : b.front === 'inner' ? MIX_LANE : MIX_FRONT;
      b.uses[f] = weighted(rng, pool);
      (b.inferred ||= {})[f] = true;
      n++;
    }
  }
  // Flats: residents give 200-300 sq ft (19-28 m2) for their flats (WSJ fact boxes, 2014).
  // 21 m2 of plot a flat gives about 8,500 households; residents counted "8000多戶" (HK01,
  // 2016) and the Legislative Council was told of about 10,000 (Hansard, Feb 1987).
  for (const b of buildings) b.flats = Math.max(1, Math.round(b.cells.length / 21));

  // The main hall is the largest Yamen building; people "at the Yamen" use its yard.
  const yamens = buildings.filter((b) => b.kind === 'yamen');
  const yamenId = yamens.reduce((best, b) => (b.cells.length > best.cells.length ? b : best), yamens[0]).id;
  const yard = [];
  for (let k = 0; k < N; k++) if (alley[k] === 2) yard.push(k);

  // ---- walking costs --------------------------------------------------------------------
  // 1 = street, lane or yard, higher = cutting through a ground floor.
  const cost = new Uint8Array(N);
  for (let k = 0; k < N; k++) {
    if (!inside[k] || alley[k]) cost[k] = 1;
    else if (owner[k] >= 0) cost[k] = buildings[owner[k]].kind === 'yamen' ? 3 : 6;
  }

  // People who leave the city walk to the edge of the plinth and vanish.
  const away = [];
  for (const f of [0.22, 0.5, 0.78]) { away.push(Math.round(f * (W - 1))); away.push((D - 1) * W + Math.round(f * (W - 1))); }
  for (const f of [0.33, 0.66]) { away.push(Math.round(f * (D - 1)) * W); away.push(Math.round(f * (D - 1)) * W + W - 1); }

  return Object.assign(L, { cost, away, yard, yamenId, yamenCentre: yc });
}

// The plots along each street, in order. Tung Tau Tsuen Road, Lung Chun Road and Sai
// Shing Road come from the edges of the plan; the inner streets from a walk along the lane
// from the street's label on the plan.
function streetFrontages(L, streets) {
  const { W, D, alley, owner, buildings, inside } = L;
  const out = {};
  const byX = (a, b) => buildings[a].cx - buildings[b].cx, byZ = (a, b) => buildings[a].cz - buildings[b].cz;
  out.ttt = buildings.filter((b) => b.front === 'top').map((b) => b.id).sort(byX);
  const southRoad = [], westRoad = [];
  for (let k = 0; k < W * D; k++) {
    if (alley[k] !== 3) continue;
    const i = k % W, j = (k / W) | 0;
    (j > D * 0.62 ? southRoad : i < W * 0.3 ? westRoad : southRoad).push(k);
  }
  const touching = (cells) => {
    const s = new Set();
    for (const k of cells) for (const n of [k - 1, k + 1, k - W, k + W]) if (owner[n] >= 0 && buildings[owner[n]].kind !== 'yamen') s.add(owner[n]);
    return [...s];
  };
  out.lcr = touching(southRoad).sort(byX);
  out.ssr = touching(westRoad).sort(byZ);
  const walk = (st) => {
    // Nearest lane cell to the label.
    let k0 = -1, bd = Infinity;
    for (let dj = -6; dj <= 6; dj++)
      for (let di = -6; di <= 6; di++) {
        const k = (st.j + dj) * W + st.i + di;
        if (inside[k] && alley[k] === 1 && di * di + dj * dj < bd) { bd = di * di + dj * dj; k0 = k; }
      }
    if (k0 < 0) return [];
    const ns = st.dir === 'ns';
    const seq = [];
    for (const step of [-1, 1]) {
      let c = ns ? k0 % W : (k0 / W) | 0, p = ns ? (k0 / W) | 0 : k0 % W;
      const part = [];
      for (let guard = 0; guard < 200; guard++) {
        const cells = [];
        for (let w = 2; w <= 3 && !cells.length; w++)
          for (let o = -w; o <= w; o++) {
            const i = ns ? c + o : p, j = ns ? p : c + o;
            const k = j * W + i;
            if (i > 0 && j > 0 && i < W - 1 && j < D - 1 && inside[k] && alley[k] === 1) cells.push(k);
          }
        if (!cells.length) break;
        part.push(...cells);
        c = Math.round(cells.reduce((s, k) => s + (ns ? k % W : (k / W) | 0), 0) / cells.length);
        p += step;
      }
      if (step < 0) seq.push(...part.reverse()); else seq.push(...part);
    }
    const order = [], seen = new Set();
    for (const k of seq)
      for (const n of [k - 1, k + 1, k - W, k + W]) {
        const o = owner[n];
        if (o >= 0 && !seen.has(o) && buildings[o].kind !== 'yamen') { seen.add(o); order.push(o); }
      }
    return { cells: seq, order };
  };
  const key = { 'Kwong Ming St 光明街': 'kms', 'Lo Yan St 老人街': 'lys', 'Tai Tseng St 大井街': 'tcs', 'Sz Kung St 社公街': 'skg', 'Lung Shing Rd 龍城路': 'lsr' };
  L.streetLanes = {};
  for (const st of streets) {
    const k = key[st.name];
    if (!k) continue;
    const w = walk(st);
    out[k] = w.order || [];
    L.streetLanes[k] = w.cells || [];
  }
  return out;
}

// Put each GRS premises on a plot of its street, at its floor. The order along the street
// follows the house numbers. Suenn Ho's 1991 route map (M+ CA17/2/2) shows the numbers on
// Tung Tau Tsuen Road and Lung Chun Road falling from west to east, and on Sai Shing Road
// from north to south. On the inner streets the direction is not known: they count from
// the north or west end.
function placePremises(L, biz, rng) {
  const { buildings, frontage } = L;
  const desc = { ttt: true, lcr: true, ssr: true };
  const byStreet = {};
  for (const p of biz.premises) (byStreet[p.street] ||= []).push(p);
  for (const [s, list] of Object.entries(byStreet)) {
    let F = frontage[s];
    if (!F || !F.length) {
      // Tin Hau Temple Back Street and the rest: the plots round the Tin Hau temple.
      const t = buildings.find((b) => b.name === 'tinHau');
      F = buildings.filter((b) => b.kind !== 'yamen' && Math.hypot(b.cx - t.cx, b.cz - t.cz) < 14).map((b) => b.id);
    }
    const nums = [...new Set(list.map((p) => p.num))].sort((a, b) => (desc[s] ? b - a : a - b));
    const rank = new Map(nums.map((n, i) => [n, i]));
    (L.addr ||= {})[s] = { nums, F, desc: !!desc[s] };
    for (const p of list) {
      const t = nums.length > 1 ? rank.get(p.num) / (nums.length - 1) : 0.5;
      let idx = Math.round(t * (F.length - 1));
      const floor = p.floor ?? 0;
      // A file's floor must exist: take the nearest plot on the street that is tall enough.
      let b = null;
      for (let d = 0; d < F.length && !b; d++)
        for (const q of [idx - d, idx + d]) {
          const c = buildings[F[q]];
          if (c && c.floors > floor && c.kind !== 'yamen') { b = c; break; }
        }
      if (!b) continue;
      const fixed = p.trade === 'kaifong' && buildings.find((c) => c.name === 'kaifong' && c.floors > floor);
      if (fixed) b = fixed;
      (b.prem[floor] ||= []).push(p);
      if (!b.prem[floor].use) {
        b.prem[floor].use = TRADE_USE[p.trade] || 'works';
        b.uses[floor] = b.prem[floor].use;
      }
      if (!b.address || fixed) b.address = `${p.numText} ${biz.streets[s].replace(/\s*[㐀-鿿]+$/, '')}`;
    }
  }
}

// The Kai Fong Association's count of 1983, as WSJ (2014) charts it: 97 dentists, 93
// plastics, 89 clinics, 77 shops, 56 metal, 44 garment, 41 other manufacturing, 35 meat,
// 33 cake, 30 textile, 50 others (645). Split here between street fronts and lanes.
const KAIFONG_1983_TOTAL = 645;
const MIX_FRONT = [['dentist', 80], ['clinic', 70], ['shop', 45], ['medicine', 10], ['eating', 12], ['office', 10]];
const MIX_LANE = [['plastics', 93], ['metal', 56], ['garment', 74], ['works', 41], ['foodfac', 68], ['shop', 32],
  ['dentist', 17], ['clinic', 19], ['eating', 10]];
const MIX_FACTORY = [['plastics', 3], ['metal', 2], ['foodfac', 3], ['works', 2], ['garment', 1]];

// The building at a recorded address (street key, house number), with at least `floor` + 1
// storeys: the same house-number order that places the GRS premises. APPROXIMATE.
export function locate(L, street, num, floor = 0) {
  const A = L.addr && L.addr[street];
  if (!A || !A.F.length) return null;
  let r = 0;
  while (r < A.nums.length && (A.desc ? A.nums[r] > num : A.nums[r] < num)) r++;
  const t = A.nums.length > 1 ? Math.min(r, A.nums.length - 1) / (A.nums.length - 1) : 0.5;
  const idx = Math.round(t * (A.F.length - 1));
  for (let d = 0; d < A.F.length; d++)
    for (const q of [idx - d, idx + d]) {
      const b = L.buildings[A.F[q]];
      if (b && b.floors > floor && b.kind !== 'yamen') return b;
    }
  return null;
}
