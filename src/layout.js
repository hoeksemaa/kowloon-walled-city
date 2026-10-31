// Plots, lanes and buildings, from the traced street plan (data/plan.json), and the
// businesses in them, from the clearance files (data/businesses.json).
//
// SOURCED: the lane network, the plot outlines, the Yamen compound, the roads on the old
// wall bases, the factory sites and named buildings (traced from the 1980s exhibit plan);
// 459 premises with street, house number, floor, name and trade (GRS HKRS1255-3 titles,
// parsed by tools/parse_grs.py); the storeys along the south face (Lambot's 1990 south
// elevation, M+ 2017.412); the street names and the 40 numbers of the 1992 map in City of
// Darkness Revisited (data/book.json). APPROXIMATE: where on its street each premises sits
// (the order follows the house numbers). INFERRED, and marked so: storeys away from the south face, and
// the trade of a floor that no file records.
import { mulberry32, vnoise, clamp, weighted } from './util.js';
import { buildFootprints, mainAxis, LANE, YARD, ROAD } from './footprint.js';
import { setupCores, makePlan, WORK_AREA } from './floorplan.js';
import { BOOK_PEOPLE } from './residents.js';

// No measured storey height is in hand. 3.05 m is a usual Hong Kong tenement storey.
export const STOREY = 3.05;
// "some 300 individual buildings, each rising up to a possible 15 storeys" (City of Darkness
// Revisited, p340).
export const MAX_FLOORS = 15;
export const MARGIN = 18; // metres of street around the city, on the street plate

// Render and paint, sRGB, measured in the photos of City of Darkness Revisited: cream render
// (pp61, 87), warm beige (p13), ochre (p97), grey concrete (pp143, 327), duck-egg blue (p60),
// mint green (pp86, 142) and old brick (p96), with their shades. The outer faces are paint
// and render; mosaic tile is mostly inside. Each building gets one, and its value moves by up
// to 20-40 levels from its neighbours' (p143), thus a building strip stands out.
const FACADES = [
  ['#a79f96', 10], ['#8e877f', 6], ['#c9c0b2', 5], ['#e6d6bb', 3], ['#ddd6c8', 3], ['#c1a994', 5],
  ['#a08d7d', 3], ['#d3b894', 4], ['#b19a83', 3], ['#93a9b0', 4], ['#7a8d91', 2], ['#98a290', 4],
  ['#b69482', 2], ['#8f7a6e', 2],
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

// The street labels of data/plan.json, by the keys of data/businesses.json.
const PLAN_STREET = {
  'Kwong Ming St 光明街': 'kms', 'Lo Yan St 老人街': 'lys', 'Tai Chang St 大井街': 'tcs', 'Sz Kung St 社公街': 'skg',
  'Lung Shing Rd 龍城路': 'lsr', 'Lung Chun Rd 龍津道': 'lcr', 'Sai Shing Rd 西城路': 'ssr',
};

const NAMES = {
  youthCentre: 'youth centre 青年中心',
  freeSchool: 'Lung Chun Free School Bldg 龍津義學大樓',
  tinHau: 'Tin Hau temple 天后廟',
  kaifong: 'Kai Fong Welfare Assn 街坊福利會',
};
export function buildingName(b) {
  if (b.kind === 'yamen') return 'the Yamen';
  if (NAMES[b.name]) return NAMES[b.name];
  const base = b.towerName || `bldg ${b.tower}`;
  return b.block ? `${b.block}, ${base}` : base;
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

export function buildLayout(site, plan, biz = null, book = null, seed = 1986) {
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
  // ---- towers ----
  // The 1987 figure-ground plan shows "around 300" buildings (p134, p340); tools/book_overlay.py
  // joins the touching plots that stood as one, by vote and then by a check by eye (286 towers,
  // 270 with the Yamen as one). Each plot stays a block of its tower, as in
  // the file addresses ("Front Block", "Rear Block"). A tower has one height, one face colour
  // and one name. Plots with no building in 1987 and no block on the 1992 map are huts.
  const towerOfCode = new Map();
  if (book) book.overlay.towers.groups.forEach((g, t) => g.forEach((c) => towerOfCode.set(c, t)));
  const lowCodes = new Set(book ? book.overlay.low : []);
  const towers = [], byGroup = new Map();
  for (const b of buildings) {
    const g = towerOfCode.get(b.code);
    let t = g === undefined ? null : byGroup.get(g);
    if (!t) {
      t = { id: towers.length, blocks: [] };
      towers.push(t);
      if (g !== undefined) byGroup.set(g, t);
    }
    b.tower = t.id;
    t.blocks.push(b.id);
    if (lowCodes.has(b.code) && b.kind === 'tenement') b.hut = true;
  }
  const L = {
    W, D, N, x0, z0, inside, alley, owner, buildings, towers,
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
    b.edge = [...new Set(alleyAdj)];
    b.color = weighted(rng, FACADES);
    b.modW = 1.5 + rng() * 1.1;
    b.cage = 0.25 + rng() * 0.6;
    b.seed = rng();
    b.prem = {}; // floor -> premises from the GRS files
  }
  for (const t of towers) {
    const b0 = buildings[t.blocks[0]];
    for (const id of t.blocks) Object.assign(buildings[id], { color: b0.color, modW: b0.modW, cage: b0.cage });
    // Blocks from the street inward: the one with the most frontage first.
    t.blocks.sort((p, q) => buildings[q].edge.length - buildings[p].edge.length);
    t.blocks.forEach((id, i) => (buildings[id].block = t.blocks.length < 2 ? null
      : t.blocks.length === 2 ? ['Front Block', 'Rear Block'][i] : `Block ${'ABCDEFGHJK'[i] || i + 1}`));
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
  }
  // One height for each tower, at its centre. On Tung Tau Tsuen Road, buildings were
  // "rising 12 storeys and more – the maximum height possible for buildings on this, the
  // northern side of the City" in 1972 (p132), and "a 14-storey building appeared on Tung
  // Tau Tsuen Road in 1975" (p336).
  let north14 = false;
  for (const t of towers) {
    const bs = t.blocks.map((id) => buildings[id]).filter((b) => b.floors === undefined);
    if (!bs.length) continue;
    let n = 0, cx = 0, cz = 0;
    for (const b of bs) { n += b.cells.length; cx += b.cx * b.cells.length; cz += b.cz * b.cells.length; }
    cx /= n; cz /= n;
    const dy = Math.hypot(cx - yc[0], cz - yc[1]);
    // Rim height: the south profile, carried north with noise; lower toward the Yamen.
    let f = profileAt(cx) - 0.5 + 2.4 * (vnoise(cx / 30, cz / 30, 3) - 0.5) + 1.6 * (vnoise(cx / 9, cz / 9, 7) - 0.5);
    f -= 5.5 * (1 - clamp((dy - 16) / 34, 0, 1));
    const southRow = bs.some((b) => b.front === 'road' && b.cz > bz1 - 22);
    if (southRow) f = profileAt(cx) - 0.3 - (rng() < 0.25 ? 1 : 0);
    const north = bs.some((b) => b.front === 'top');
    if (north) f = !north14 && n > 120 && rng() < 0.2 ? ((north14 = true), 14) : 12 + (rng() < 0.4 ? 1 : 0);
    let kind = 'tenement';
    if (bs.every((b) => b.hut)) { f = 1 + (rng() < 0.3 ? 1 : 0); kind = 'low'; }
    else if (!southRow && !north && rng() < 0.07 && n < 120) { f = 2 + rng() * 3; kind = 'low'; }
    else if (!north && f >= 13.5 && rng() < 0.15) f = 15;
    const floors = clamp(Math.round(f), 1, MAX_FLOORS);
    for (const b of bs) {
      b.floors = floors;
      b.kind = kind;
      b.uses = new Array(floors).fill('home');
    }
  }

  // ---- streets and premises ----------------------------------------------------------------
  // Street names: the exhibit plan, and the four more that the 1992 map gives (book.json).
  const street = (key, name, [i, j, dir]) => ({
    key, name, dir, i: i + MARGIN, j: j + MARGIN, x: x0 + MARGIN + i + 0.5, z: z0 + MARGIN + j + 0.5,
  });
  const streets = Object.entries(plan.streets).map(([name, at]) => street(PLAN_STREET[name], name, at));
  if (book) for (const [key, at] of Object.entries(book.overlay.streets)) streets.push(street(key, book.streets[key].name, at));
  L.streets = streets;
  L.frontage = streetFrontages(L, streets);
  if (biz) placePremises(L, biz, rng);

  // Tower names: a file address of one of its blocks, or else a house number by the street
  // order (APPROXIMATE, "near").
  if (L.addr)
    for (const [s, A] of Object.entries(L.addr)) {
      const name = biz.streets[s].replace(/\s*[㐀-鿿]+$/, '');
      A.F.forEach((id, i) => {
        const n = A.nums[Math.round((i / Math.max(1, A.F.length - 1)) * (A.nums.length - 1))];
        if (!buildings[id].near) buildings[id].near = `${n} ${name}`;
      });
    }
  for (const t of towers) {
    const bs = t.blocks.map((id) => buildings[id]);
    const a = bs.find((b) => b.address), n = bs.find((b) => b.near);
    t.name = a ? a.address : n ? `near ${n.near}` : null;
    for (const b of bs) b.towerName = t.name;
  }

  // ---- stairs and floor plans ---------------------------------------------------------------
  setupCores(L);
  for (const b of buildings) if (b.kind !== 'yamen') b.plans = { work: makePlan(L, b, WORK_AREA, 'work') };

  // The places of the people in City of Darkness Revisited go first, before the fill.
  if (book) bookPlaces(L, book);

  // Floors that no file records. INFERRED: the Kai Fong Association counted 645 shops,
  // workshops and clinics in 1983 (charted by WSJ, 2014). The clearance files place fewer,
  // thus more floors take a trade until the count is 645; each workshop unit of a floor
  // counts as one. Ground floors go first, street fronts before lanes; some upper floors too
  // ("shops and factories were on upper floors", Lambot, 2019). The trade comes from the
  // 1983 count: dentists and clinics on the street fronts, factories in the lanes.
  if (biz) {
    let n = 0;
    for (const b of buildings) if (b.plans) n += Object.keys(b.prem).length * b.plans.work.units.length;
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
      // Heavy metal shops stay on G/F (City of Darkness Revisited, p257).
      do b.uses[f] = weighted(rng, pool); while (f > 0 && b.uses[f] === 'metal');
      (b.inferred ||= {})[f] = true;
      n += b.plans.work.units.length;
    }
  }
  // Flats: "28,200 occupants residing in 8800 separate apartments" in January 1987 (p340).
  // The flat size is set so that the home floors hold about 8,800 flats. A flat then comes
  // out at about 15 m2 (160 sq ft), less than the 200-400 sq ft that residents give (WSJ,
  // 2014; SCMP, 2013). The model keeps the book's count.
  const homeFloors = (b) => b.uses.filter((u) => u === 'home').length;
  let net = 0;
  for (const b of buildings) {
    if (!b.plans) continue;
    let c = 0;
    for (const v of b.plans.work.cell) if (v >= 0) c++;
    net += c * homeFloors(b);
  }
  let T = net / APARTMENTS_1987;
  for (let it = 0; it < 4; it++) {
    let count = 0;
    for (const b of buildings) if (b.plans) { b.plans.home = makePlan(L, b, T, 'home'); count += b.plans.home.units.length * homeFloors(b); }
    L.flatCount = count;
    if (Math.abs(count - APARTMENTS_1987) < 80) break;
    T *= count / APARTMENTS_1987;
  }
  L.flatArea = T;
  for (const b of buildings) b.flats = b.plans ? b.plans.home.units.length : 0;
  if (book) realFloors(L, book);

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

  // People who leave the city walk to an exit at the edge of the street plate, where they fade
  // out (figures.js).
  const away = [];
  for (const f of [0.22, 0.5, 0.78]) { away.push(Math.round(f * (W - 1))); away.push((D - 1) * W + Math.round(f * (W - 1))); }
  for (const f of [0.33, 0.66]) { away.push(Math.round(f * (D - 1)) * W); away.push(Math.round(f * (D - 1)) * W + W - 1); }

  // The 40 numbers of the 1992 map (City of Darkness Revisited, pp352-353), fitted to the plan
  // by tools/book_overlay.py. APPROXIMATE: the map "cannot be considered entirely accurate"
  // (p353). places: the 12 numbers that mark a place, each with its own number. mapPeople:
  // the 33 numbers that name a person; for five of them the key also names a place.
  const places = !book ? [] : book.places.filter((p) => p.place).map((p) => {
    const [i, j] = book.overlay.markers[p.n];
    return { ...p, k: (Math.floor(j) + MARGIN) * W + Math.floor(i) + MARGIN, x: x0 + MARGIN + i, z: z0 + MARGIN + j };
  });
  const mapPeople = !book ? [] : book.places.filter((p) => p.place !== p.name);

  return Object.assign(L, { cost, away, yard, yamenId, yamenCentre: yc, places, mapPeople });
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
  L.streetLanes = {};
  for (const st of streets) {
    if (st.key === 'lcr' || st.key === 'ssr') continue;
    const w = walk(st);
    out[st.key] = w.order || [];
    L.streetLanes[st.key] = w.cells || [];
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
const APARTMENTS_1987 = 8800;
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

// The places of City of Darkness Revisited that the model uses (BOOK_PEOPLE in residents.js),
// and the kindergarten and the standpipe. A place goes to its file address if a clearance
// file matches it, else to its address in the text, else to its street, nearest its pin on
// the 1992 map. Where the map and the text disagree, the text wins. L.book[n]: { b, f }.
function bookPlaces(L, book) {
  const B = L.buildings, W = L.W;
  const pin = (n) => {
    const m = book.overlay.markers[n];
    return m ? { x: L.x0 + MARGIN + m[0], z: L.z0 + MARGIN + m[1] } : null;
  };
  // The building nearest a point (or the middle one), not used by another place, with a
  // floor that no file names if it can.
  const used = new Set();
  const near = (ids, at, f = 0) => {
    const list = ids.map((id) => B[id]).filter((b) => b.kind !== 'yamen' && b.floors > f + 1 && !used.has(b.id));
    if (!list.length) return null;
    const free = list.filter((b) => !b.prem[f]);
    if (!at) return (free.length ? free : list)[(free.length ? free : list).length >> 1];
    const cost = (b) => Math.hypot(b.cx - at.x, b.cz - at.z) + (b.prem[f] ? 12 : 0);
    return list.reduce((p, q) => (cost(q) < cost(p) ? q : p));
  };
  const onStreet = (st) => {
    if (L.addr[st]) return L.addr[st].F;
    const s = new Set();
    for (const k of L.streetLanes[st] || []) for (const n of [k - 1, k + 1, k - W, k + W]) if (L.owner[n] >= 0) s.add(L.owner[n]);
    return [...s];
  };
  const find = (p) => {
    const grs = p.grs || ((book.matches.list.find((m) => m.n === p.n) || {}).grs);
    if (grs)
      for (const b of B)
        for (const [f, list] of Object.entries(b.prem)) if (list.some((q) => q.refs && q.refs.includes(grs))) return { b, f: +f, grs: true };
    const f = p.floor ?? 0;
    if (p.street && p.num != null) { const b = locate(L, p.street, p.num, f); if (b) return { b, f }; }
    if (p.street) { const b = near(onStreet(p.street), p.conflict ? null : pin(p.n), f); if (b) return { b, f }; }
    const at = pin(p.n), b = at && near(B.map((b) => b.id), at, f);
    return b ? { b, f } : null;
  };
  L.book = {};
  L.bookPlaces = Object.fromEntries(book.places.map((p) => [p.n, p]));
  for (const P of BOOK_PEOPLE) {
    const p = book.places.find((q) => q.n === P.n), hit = p && find(p);
    if (!hit) continue;
    const { b, f } = hit;
    L.book[P.n] = { b: b.id, f };
    used.add(b.id);
    if (P.roof) continue;
    const grs = hit.grs && b.prem[f].find((q) => q.refs && q.refs.includes(p.grs || book.matches.list.find((m) => m.n === p.n).grs));
    if (grs) {
      Object.assign(grs, { book: p.n, page: p.page });
      // The file title can give a house name first; the note in book.json gives the trade name.
      const name = p.grsNote && p.grsNote.split(',')[0];
      if (name && /^[A-Za-z][^:]*$/.test(name)) grs.nameEn = name;
    }
    else (b.prem[f] ||= []).push({ nameEn: P.premises || '', trade: P.trade, book: p.n, page: p.page });
    b.prem[f].use = b.uses[f] = TRADE_USE[P.trade];
    if (b.inferred) delete b.inferred[f];
  }
  // The Salvation Army kindergarten on Lung Chun Back Road (p300). The book does not say
  // when it opened, thus it is INFERRED for 1986.
  const kg = near(onStreet('lcb'), pin(29));
  if (kg) {
    used.add(kg.id);
    (kg.prem[0] ||= []).push({ nameEn: 'Salvation Army kindergarten', trade: 'school', book: 29, page: 300, inferred: true });
    kg.prem[0].use ||= 'school';
    kg.uses[0] = 'school';
    L.book.kindergarten = { b: kg.id, f: 0 };
  }
  // The one Government standpipe inside the city, on Tai Chang Street (pp28, 107, 292).
  const sp = pin(30);
  if (sp) {
    let best = -1, bd = Infinity;
    for (const k of L.streetLanes.tcs || []) { const d = Math.hypot(L.cellX(k) - sp.x, L.cellZ(k) - sp.z); if (d < bd) { bd = d; best = k; } }
    if (best >= 0) L.standpipe = { k: best, x: L.cellX(best), z: L.cellZ(best) };
  }
  L.bookHours = book.hours;
}

// The two floors that the clearance survey drew in 1987 (City of Darkness Revisited, p340).
// The model places each by its house number (APPROXIMATE) and names its units.
function realFloors(L, book) {
  const B = L.buildings;
  const flat = book.flats.taiHing4F;
  const b = locate(L, 'ssr', 6, 4);
  if (b && b.plans) {
    if (b.uses[4] !== 'home' && !b.prem[4]) { b.uses[4] = 'home'; if (b.inferred) delete b.inferred[4]; }
    const units = b.plans.home.units.filter((u) => u.door && u.door.axis === 'w');
    const u = (units.length ? units : b.plans.home.units).reduce((p, q) => (Math.abs(q.area - 25) < Math.abs(p.area - 25) ? q : p));
    (b.unitNotes ||= {})[`4:${u.id}`] = {
      name: `${flat.address} (the survey's flat)`,
      note: `Measured on 9 Nov 1987 (p340): living room 9.65 m², two cubicles of 3.54 m², kitchen 2.0 m², toilet, two bed spaces. Place by house number, approximate.`,
    };
    L.realFlat = { b: b.id, f: 4, u: u.id };
  }
  const shared = book.flats.cheungOn5F;
  const c = locate(L, 'ttt', 31, 5);
  if (c) {
    // The units of the tower's 5/F nearest a stair, in the order of the survey sheet.
    const list = [];
    for (const id of L.towers[c.tower].blocks) {
      const d = B[id];
      if (!d.plans || d.floors <= 5 || d.uses[5] !== 'home') continue;
      for (const u of d.plans.home.units) list.push({ d, u, near: d.cores.length ? 0 : 1 });
    }
    list.sort((p, q) => p.near - q.near || q.u.area - p.u.area);
    shared.units.forEach((s, i) => {
      if (!list[i]) return;
      (list[i].d.unitNotes ||= {})[`5:${list[i].u.id}`] = {
        name: s.address,
        note: `${s.ref}. The 1987 survey (p340) drew a shared 5/F here: five units, and three stairs that share landings. The plan in the model is inferred.`,
      };
    });
  }
}
