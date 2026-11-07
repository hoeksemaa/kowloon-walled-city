// Plots, lanes and buildings, from the traced street plan (data/plan.json), and the
// businesses in them, from the clearance files (data/businesses.json).
//
// SOURCED: the lane network, the plot outlines, the Yamen compound, the roads on the old
// wall bases, the factory sites and named buildings (traced from the 1980s exhibit plan);
// 459 premises with street, house number, floor, name and trade (GRS HKRS1255-3 titles,
// parsed by tools/parse_grs.py); the storeys along the south face (Lambot's 1990 south
// elevation, M+ 2017.412); the street names of the 1992 map in City of Darkness Revisited
// (data/book.json). APPROXIMATE: where on its street each premises sits (the order follows
// the house numbers). INFERRED, and marked so: storeys away from the south face.
import { mulberry32, vnoise, clamp } from './util.js';
import { buildFootprints, LANE, YARD, ROAD } from './footprint.js';

// No measured storey height is in hand. 3.05 m is a usual Hong Kong tenement storey.
export const STOREY = 3.05;
// "some 300 individual buildings, each rising up to a possible 15 storeys" (City of Darkness
// Revisited, p340).
export const MAX_FLOORS = 15;
export const MARGIN = 18; // metres of street around the city, on the street plate

// The trade of each GRS premises, as the room uses name it (tools/build_room_uses.mjs).
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

// Storeys along the south face, west to east, read off Lambot's 1990 south elevation
// (M+ 2017.412): the skyline height over the base, at 23.9 px per storey, in 40 steps.
// The skyline includes stair huts, thus each value is one storey or less above the roof.
export const SOUTH_PROFILE = [11, 11, 11, 10, 11, 11, 10, 10, 10, 10, 11, 10, 11, 10, 10, 10, 11, 11, 11, 12,
  13, 12, 12, 12, 13, 14, 14, 13, 13, 14, 14, 14, 14, 14, 14, 12, 10, 10, 10, 10];

// The street labels of data/plan.json, by the keys of data/businesses.json.
const PLAN_STREET = {
  'Kwong Ming St 光明街': 'kms', 'Lo Yan St 老人街': 'lys', 'Tai Chang St 大井街': 'tcs', 'Sz Kung St 社公街': 'skg',
  'Lung Shing Rd 龍城路': 'lsr', 'Lung Chun Rd 龍津道': 'lcr', 'Sai Shing Rd 西城路': 'ssr',
};

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

// data/plan_fine.json: the same codes on cells of 1/SUB m, as runs (2 characters for the
// code, 2 for the length).
export function decodeFine(fine) {
  const code = new Int32Array(fine.W * fine.D);
  const val = Object.fromEntries([...ALPH].map((ch, i) => [ch, i]));
  const two = (row, p) => val[row[p]] * 64 + val[row[p + 1]];
  fine.rows.forEach((row, j) => {
    let i = j * fine.W;
    for (let p = 0; p < row.length; p += 4) { const v = two(row, p), n = two(row, p + 2); code.fill(v, i, i + n); i += n; }
  });
  return code;
}

// The footprints from the fine plan (plan.fine: { SUB, W, D, code, exact }), in the frame of L. A
// code that has no building on the 1 m plan takes the region beside it.
function fineFootprints(L, fine, idOf) {
  const s = fine.SUB, M = MARGIN * s, W = fine.W + 2 * M, D = fine.D + 2 * M, N = W * D;
  const owner = new Int32Array(N).fill(-1), inside = new Uint8Array(N), alley = new Uint8Array(N);
  const NONE = -2;
  for (let j = 0; j < fine.D; j++)
    for (let i = 0; i < fine.W; i++) {
      const v = fine.code[j * fine.W + i];
      if (!v) continue;
      const k = (j + M) * W + i + M;
      inside[k] = 1;
      if (v < 4) alley[k] = v;
      else owner[k] = idOf.has(v) ? idOf.get(v) : NONE;
    }
  const nb = (k) => [k - 1, k + 1, k - W, k + W];
  for (let pass = 0, left = 1; left && pass < 400; pass++) {
    left = 0;
    const next = owner.slice();
    for (let k = W; k < N - W; k++) {
      if (owner[k] !== NONE) continue;
      const n = nb(k).find((q) => inside[q] && owner[q] !== NONE);
      if (n === undefined) { left++; continue; }
      next[k] = owner[n];
      if (owner[n] < 0) alley[k] = alley[n];
    }
    owner.set(next);
  }
  // Each building has no part narrower than 0.75 m (an opening of 3 x 3 cells) and is one
  // piece: a thin neck between two rooms splits the floor inside the walls. A cell taken off
  // goes to the building (or else the lane) that has the most cells beside it.
  const ring8 = [-W - 1, -W, -W + 1, -1, 1, W - 1, W, W + 1];
  const core = new Uint8Array(N), keep = new Uint8Array(N), hasCore = new Set();
  for (let k = W + 1; k < N - W - 1; k++) {
    const o = owner[k];
    if (o >= 0 && ring8.every((d) => owner[k + d] === o)) { core[k] = 1; hasCore.add(o); }
  }
  for (let k = W + 1; k < N - W - 1; k++) {
    const o = owner[k];
    if (o >= 0 && (!hasCore.has(o) || core[k] || ring8.some((d) => core[k + d] && owner[k + d] === o))) keep[k] = 1;
  }
  const piece = new Int32Array(N).fill(-1), best = new Map();
  for (let k = 0, n = 0; k < N; k++) {
    if (!keep[k] || piece[k] >= 0) continue;
    const o = owner[k], cells = [k];
    piece[k] = n;
    for (let q = 0; q < cells.length; q++)
      for (const m of nb(cells[q])) if (keep[m] && piece[m] < 0 && owner[m] === o) { piece[m] = n; cells.push(m); }
    if (!best.has(o) || cells.length > best.get(o).size) best.set(o, { id: n, size: cells.length });
    n++;
  }
  for (let k = 0; k < N; k++) if (keep[k] && piece[k] !== best.get(owner[k]).id) keep[k] = 0;
  const was = owner.slice();
  for (let pass = 0, moved = 1; moved && pass < 50; pass++) {
    moved = 0;
    for (let k = W; k < N - W; k++) {
      if (owner[k] < 0 || keep[k]) continue;
      const votes = new Map();
      let lane = 0;
      for (const m of nb(k)) {
        if (owner[m] >= 0 && keep[m] && owner[m] !== was[k]) votes.set(owner[m], (votes.get(owner[m]) || 0) + 1);
        else if (owner[m] < 0 && inside[m]) lane = alley[m] || 1;
      }
      let o = -1, v = 0;
      for (const [q, c] of votes) if (c > v) { o = q; v = c; }
      if (o >= 0) { owner[k] = o; keep[k] = 1; moved++; } else if (lane) { owner[k] = -1; alley[k] = lane; moved++; }
    }
  }
  // Gaps inside the outline are lanes, as on the 1 m plan.
  const outer = new Uint8Array(N), queue = [];
  for (let k = 0; k < N; k++) {
    const i = k % W, j = (k / W) | 0;
    if (!inside[k] && (i === 0 || j === 0 || i === W - 1 || j === D - 1)) { outer[k] = 1; queue.push(k); }
  }
  for (let q = 0; q < queue.length; q++)
    for (const n of nb(queue[q])) if (n >= 0 && n < N && !inside[n] && !outer[n]) { outer[n] = 1; queue.push(n); }
  for (let k = 0; k < N; k++) if (!inside[k] && !outer[k]) { inside[k] = 1; alley[k] = 1; }
  // The buildings that a rule of data/structure_fixes.json draws as a polygon (the Yamen halls,
  // the Youth Centre, the Old People's Centre, the temporary structures ...): their outlines go
  // back onto the polygons, not onto the steps of the cells (see buildFootprints, opts.exact).
  const exact = new Map();
  for (const { codes, poly, order, set } of fine.exact || [])
    for (const c of codes) {
      if (!idOf.has(c)) continue;
      const id = idOf.get(c);
      if (!exact.has(id)) exact.set(id, []);
      exact.get(id).push({ poly, order, inside: c === set });
    }
  // eps 3 cells (0.75 m; plan.fine.eps can set another): the steps of a line at an angle go,
  // the corners of the plan stay. regularise: then the walls go square and straight where they
  // are within a few degrees of it (only here: the 1 m plan stays as it is).
  return buildFootprints({ W, D, owner, inside, alley, x0: L.x0, z0: L.z0 }, { scale: 1 / s, eps: fine.eps ?? 3, pocket: 4 * s * s, exact, regularise: true });
}

// plan: data/plan.json; biz: data/businesses.json; book: data/book.json with its overlay.
// plan.fine (optional, from src/city/fixes.js): the footprints come from the fine plan.
export function buildLayout(plan, biz = null, book = null, seed = 1986) {
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
    cellX: (k) => x0 + (k % W) + 0.5,
    cellZ: (k) => z0 + ((k / W) | 0) + 0.5,
  };

  // ---- footprints -----------------------------------------------------------------------
  let F = buildFootprints(L);
  if (plan.fine) {
    const F1 = F;
    F = fineFootprints(L, plan.fine, new Map(buildings.map((b) => [b.code, b.id])));
    // a building with no cell on the fine plan keeps its 1 m outline
    for (const b of buildings) if (!F.has(b.id)) F.set(b.id, F1.get(b.id) || []);
  }
  L.ground = { lane: F.get(LANE) || [], yard: F.get(YARD) || [], road: F.get(ROAD) || [] };

  // ---- building attributes -------------------------------------------------------------
  const yamenCells = [];
  for (const b of buildings) if (b.kind === 'yamen') yamenCells.push(...b.cells);
  const yc = yamenCells.reduce((s, k) => [s[0] + L.cellX(k), s[1] + L.cellZ(k)], [0, 0]).map((v) => v / Math.max(1, yamenCells.length));
  for (const b of buildings) {
    let sx = 0, sz = 0, top = 0, road = 0;
    const alleyAdj = [];
    for (const k of b.cells) {
      sx += k % W; sz += (k / W) | 0;
      for (const n of nb4(k)) {
        if (!inside[n]) {
          if (n === k - W && clearAbove(n)) top++; // faces up the plan: Tung Tau Tsuen Road
        } else if (alley[n]) {
          alleyAdj.push(k);
          if (alley[n] === 3) road++;
        }
      }
    }
    b.cx = x0 + sx / b.cells.length + 0.5;
    b.cz = z0 + sz / b.cells.length + 0.5;
    b.rings = F.get(b.id) || [];
    b.area = b.cells.length;
    b.front = top >= 2 && b.cz < 0 ? 'top' : road >= 2 ? 'road' : 'inner';
    b.edge = new Set(alleyAdj).size; // the cells on a lane
    // Four draws of the old app for each building (its face and its cages): they stay, thus
    // the storeys below keep their random sequence.
    for (let q = 0; q < 4; q++) rng();
    b.prem = {}; // floor -> premises from the GRS files
  }
  // Blocks from the street inward: the one with the most frontage first. The first block of a
  // tower gives the defaults of its building (src/city/model.js).
  for (const t of towers) t.blocks.sort((p, q) => buildings[q].edge - buildings[p].edge);

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
  const bz1 = plan.D / 2;
  for (const b of buildings) {
    if (b.kind === 'yamen') { b.floors = 1; continue; }
    if (b.name === 'tinHau') { b.floors = 1; b.kind = 'low'; continue; }
    if (b.name === 'youthCentre') { b.floors = 2; b.kind = 'low'; continue; }
    // The free-school centre (義學中心) stood with the youth centre and the old people's
    // home in the middle of the city (HK01, 2016).
    if (b.name === 'freeSchool') { b.floors = 6; continue; }
  }
  // One height for each tower, at its centre. On Tung Tau Tsuen Road, buildings were
  // "rising 12 storeys and more – the maximum height possible for buildings on this, the
  // northern side of the City" in 1972 (p132), and "a 14-storey building appeared on Tung
  // Tau Tsuen Road in 1975" (p336). t.storeysFrom says where the height of tower t comes
  // from: 'south' (the elevation), 'p132', 'p336', 'hut' or 'photos' (INFERRED).
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
    let from = 'photos';
    const southRow = bs.some((b) => b.front === 'road' && b.cz > bz1 - 22);
    if (southRow) { f = profileAt(cx) - 0.3 - (rng() < 0.25 ? 1 : 0); from = 'south'; }
    const north = bs.some((b) => b.front === 'top');
    if (north) {
      f = !north14 && n > 120 && rng() < 0.2 ? ((north14 = true), 14) : 12 + (rng() < 0.4 ? 1 : 0);
      from = f === 14 ? 'p336' : 'p132';
    }
    let kind = 'tenement';
    if (bs.every((b) => b.hut)) { f = 1 + (rng() < 0.3 ? 1 : 0); kind = 'low'; from = 'hut'; }
    else if (!southRow && !north && rng() < 0.07 && n < 120) { f = 2 + rng() * 3; kind = 'low'; }
    else if (!north && f >= 13.5 && rng() < 0.15) { f = 15; from = 'photos'; }
    t.storeysFrom = from;
    const floors = clamp(Math.round(f), 1, MAX_FLOORS);
    for (const b of bs) {
      b.floors = floors;
      b.kind = kind;
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
  if (biz) placePremises(L, biz);

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
  }
  return L;
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
function placePremises(L, biz) {
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
      // Some files write the number as "No. 12"; the address drops the "No.".
      if (!b.address || fixed) b.address = `${p.numText.replace(/^No\.?\s*/i, '')} ${biz.streets[s].replace(/\s*[㐀-鿿]+$/, '')}`;
    }
  }
}

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
