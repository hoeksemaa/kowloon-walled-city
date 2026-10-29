// Plots, lanes and buildings on a 1 m grid, from the traced street plan (data/plan.json).
//
// SOURCED (via tools/trace_plan.py, from the 1980s street plan on display in the park):
// the lane network, the plot outlines, the Yamen compound, Lung Chun Road and Sai Shing
// Road on the old wall bases, the factory sites marked on Kwong Ming Street, and a few
// named buildings. PROVISIONAL: the storey count and the floor uses of each building. No
// per-plot source for these is in hand yet; they follow published totals (see research/).
import { mulberry32, vnoise, clamp, weighted } from './util.js';

// "10 to 14 stories" and "100 to 140 feet" (WSJ 2014) give about 10 ft per storey.
export const STOREY = 3.05;
export const MAX_FLOORS = 14;
export const MARGIN = 18; // metres of street around the city, on the plinth

// Weathered concrete, mosaic tile and paint, sRGB.
const FACADES = [
  ['#9d9a91', 9], ['#a9a59b', 8], ['#b8b2a4', 7], ['#8d8b85', 6], ['#c3bcaa', 5], ['#a8b6ab', 4],
  ['#9eafb7', 4], ['#c3aca2', 3], ['#bab9b0', 5], ['#a48f72', 2], ['#7e8483', 3], ['#b4a58a', 3],
];

// Floor uses. The trades are the 11 categories of the 1983 Kai Fong business count, 645
// premises in all: dentists 97, plastics 93, clinics 89, shops 77, metal 56, garment 44,
// other manufacturing 41, meat 35, cakes 33, textile 30, others 50 (WSJ 2014).
export const USE_LABEL = {
  home: 'flats',
  plastics: 'plastics factory',
  metal: 'metal works',
  garment: 'garment workshop',
  textile: 'textile workshop',
  factory: 'other manufacturing',
  meat: 'meat production',
  cakes: 'cake and pastry bakery',
  shop: 'shop',
  food: 'eating house',
  clinic: 'unlicensed clinic',
  dentist: 'unlicensed dentist',
  mahjong: 'mahjong parlour',
  school: 'school / kindergarten',
  temple: 'Tin Hau temple',
  kaifong: 'Kai Fong association',
  youth: 'youth centre',
  yamen: 'Yamen · old people’s centre',
};
export const USE_GROUP = {
  plastics: 'work', metal: 'work', garment: 'work', textile: 'work', factory: 'work', meat: 'work', cakes: 'work',
  shop: 'shop', food: 'shop', clinic: 'shop', dentist: 'shop', mahjong: 'shop', school: 'school',
};
export const USE_DOING = {
  plastics: 'moulding plastic parts', metal: 'at the metal works', garment: 'sewing garments',
  textile: 'at the textile workshop', factory: 'at the factory', meat: 'making meat products',
  cakes: 'baking cakes and pastry',
};

// Ground-floor weights by frontage. PROVISIONAL shares, shaped by the 1983 count and by
// where the sources put each trade: dentists and doctors faced Tung Tau Tsuen Road; food
// premises lined Lung Chun Road; factories filled Kwong Ming Street (plan caption).
const G_INNER = [
  ['home', 24], ['plastics', 13], ['metal', 8], ['garment', 5], ['textile', 4], ['factory', 6],
  ['meat', 5], ['cakes', 5], ['shop', 8], ['food', 5], ['clinic', 4], ['dentist', 2], ['mahjong', 3], ['school', 1],
];
const G_TOP = [['dentist', 40], ['clinic', 28], ['shop', 14], ['food', 12], ['home', 6]];
const G_ROAD = [
  ['food', 26], ['shop', 22], ['meat', 8], ['cakes', 8], ['clinic', 6], ['dentist', 6], ['mahjong', 6], ['factory', 6], ['home', 12],
];
const G_FACTORY = [['meat', 22], ['cakes', 22], ['factory', 20], ['plastics', 18], ['metal', 18]];

const NAMES = {
  youthCentre: 'youth centre 青年中心',
  freeSchool: 'Lung Chun Free School Bldg 龍津義學大樓',
  tinHau: 'Tin Hau temple 天后廟',
  kaifong: 'Kai Fong Welfare Assn 街坊福利會',
};
export function buildingName(b) {
  if (b.kind === 'yamen') return 'the Yamen';
  return NAMES[b.name] || `bldg ${b.id}`;
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

export function buildLayout(site, plan, seed = 1989) {
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

  // ---- building attributes -------------------------------------------------------------
  for (const b of buildings) {
    let sx = 0, sz = 0, i0 = W, i1 = 0, j0 = D, j1 = 0, edge = false, top = 0, road = 0;
    const alleyAdj = [];
    for (const k of b.cells) {
      const i = k % W, j = (k / W) | 0;
      sx += i; sz += j;
      i0 = Math.min(i0, i); i1 = Math.max(i1, i + 1); j0 = Math.min(j0, j); j1 = Math.max(j1, j + 1);
      for (const n of nb4(k)) {
        if (!inside[n]) {
          edge = true;
          if (n === k - W && clearAbove(n)) top++; // faces up the plan: Tung Tau Tsuen Road
        } else if (alley[n]) {
          alleyAdj.push(k);
          if (alley[n] === 3) road++;
        }
      }
    }
    Object.assign(b, { i0, i1, j0, j1, edge });
    b.cx = x0 + sx / b.cells.length + 0.5;
    b.cz = z0 + sz / b.cells.length + 0.5;
    b.front = top >= 2 && b.cz < 0 ? 'top' : road >= 2 ? 'road' : 'inner';
    const ci = sx / b.cells.length, cj = sz / b.cells.length;
    const near = (alleyAdj.length ? alleyAdj : b.cells).reduce((best, k) => {
      const d = (k % W - ci) ** 2 + (((k / W) | 0) - cj) ** 2;
      return d < best.d ? { k, d } : best;
    }, { k: b.cells[0], d: Infinity });
    b.stair = near.k;
    b.color = weighted(rng, FACADES);
    b.modW = 1.5 + rng() * 1.1;
    b.cage = rng() * 0.55;
    b.seed = rng();

    if (b.kind === 'yamen') {
      b.floors = 1;
      b.uses = ['yamen'];
      b.color = '#8f8a80';
    } else if (b.name === 'tinHau') {
      b.floors = 1; // height not known
      b.kind = 'low';
      b.uses = ['temple'];
      b.color = '#a5826f';
    } else if (b.name === 'youthCentre') {
      b.floors = 2; // height not known
      b.kind = 'low';
      b.uses = ['youth', 'youth'];
    } else {
      // PROVISIONAL heights: "buildings of up to 14 stories" by the 1970s (CoD Revisited),
      // 12-14 storeys by the 1980s (Steadman), and 259 of 563 structures at 4+ storeys in
      // 1975 (Lai 2024). A smooth field keeps neighbours alike.
      let f = 12 + 3.2 * (vnoise(b.cx / 40, b.cz / 40, 3) - 0.5) * 2 + 2 * (vnoise(b.cx / 11, b.cz / 11, 7) - 0.5);
      const r = rng();
      if (r < 0.09 && b.cells.length < 160) { f = 1 + rng() * 3.5; b.kind = 'low'; }
      else if (r < 0.21) f = 5 + rng() * 4.5;
      b.floors = clamp(Math.round(f), 1, MAX_FLOORS);
      b.uses = [];
      const ground = b.factory ? G_FACTORY : b.front === 'top' ? G_TOP : b.front === 'road' ? G_ROAD : G_INNER;
      for (let fl = 0; fl < b.floors; fl++) {
        if (fl === 0) b.uses.push(b.name === 'kaifong' ? 'kaifong' : weighted(rng, ground));
        else if (b.factory && fl <= 5 && rng() < 0.55) b.uses.push(b.uses[0]);
        else if (b.front === 'top' && fl <= 3 && rng() < 0.3) b.uses.push(rng() < 0.55 ? 'dentist' : 'clinic');
        else if (fl <= 3 && rng() < 0.1) b.uses.push(weighted(rng, [['garment', 4], ['plastics', 3], ['textile', 2], ['school', 1]]));
        else b.uses.push('home');
      }
    }
    b.flats = Math.max(1, Math.round(b.cells.length / 23)); // "a typical unit was 23 m²" (research 1.6)
  }

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

  // Street names from the plan, in world metres.
  const streets = Object.entries(plan.streets).map(([name, [i, j, dir]]) => ({
    name, dir, x: x0 + MARGIN + i + 0.5, z: z0 + MARGIN + j + 0.5,
  }));

  return {
    W, D, N, x0, z0, inside, alley, owner, cost, buildings, away, yard, streets,
    yamenId,
    bbox: { minx: -plan.W / 2, maxx: plan.W / 2, minz: -plan.D / 2, maxz: plan.D / 2 },
    cellX: (k) => x0 + (k % W) + 0.5,
    cellZ: (k) => z0 + ((k / W) | 0) + 0.5,
  };
}
