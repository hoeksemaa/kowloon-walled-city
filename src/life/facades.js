// The things on the outer walls of the flats, from 1/F up (data/furnishings.json "outside"):
// - Window cages: steel grille boxes bolted to the wall outside the windows, "caged balconies,
//   called 'buildings on buildings'" (F38). They are 0.6-0.8 m deep and go across the flat
//   (F134), from the floor to the ceiling (F20: 4 ft deep, a few of them). Each floor of a
//   facade has them, one on the other (F39, F134). They are on 0.7 of the outside windows of
//   the flats.
// - In the cages: laundry on a rail (0.6 of the cages), 1-6 pot plants (0.4), a songbird in a
//   bamboo cage (0.05) (F38, F94, F95, F134). Over the cage, a corrugated awning (0.3; F39, F95),
//   only on a cage that has no cage on it (INFERRED).
// - The windows without a cage: a bamboo pole with laundry out of 0.4 of them (F96). Over a
//   narrow lane, the pole reaches the wall across the lane (INFERRED).
// - Window air-conditioners in 0.25 of the flats with an outside wall (F40, F43, F93).
// - A projecting sign at the windows of each dentist and clinic of 1/F-3/F (F98, F40).
// The shares are those of data/furnishings.json. Where each thing stands, its size and its
// colour are INFERRED:
// - One cage goes across all the windows of a flat on one wall. A pipe down the facade
//   (src/life/pipes.js) between two windows splits it in two.
// - A cage stands only where the open air outside the wall is at least 1 m deeper than the cage,
//   thus a lane stays a lane (INFERRED: the photos show the outer facades only). It does not
//   stand over a lower roof, nor on the pipes down the facade, nor beside another cage.
// - The laundry shows all day and all night (INFERRED: the photos show it by day only).
// The things are those of src/life/furnish.js (put, with 'out'): they go with the floor layer of
// their storey. The structure is frozen: this file only reads it.
import { findWindows } from './windows.js';
import { Walls } from './walls.js';
import { mulberry32 } from '../util.js';

const box = (x0, x1, y0, y1, z0, z1, m = 0, s = 'b') => [x0, x1, y0, y1, z0, z1, m, s];

// The colours (sRGB) of the things outside: the paint or the rust of the cages, the washing,
// the sheets of the awnings, the boards of the signs.
const COLOURS = {
  cage: ['#7c8086', '#6e7378', '#5f6f5a', '#7a5a46', '#a4aaa8', '#4f5a62', '#b8b4a8', '#8a6a52'],
  wash_white: ['#e8e4da'], wash_blue: ['#3f5f86'], wash_grey: ['#8a8478'], wash_red: ['#b84a40'],
  wash_yellow: ['#d8b860'], wash_green: ['#6a8a6a'], wash_dark: ['#2e2e30'], wash_pink: ['#e0a0a8'],
  awning_sheet: ['#8e928c', '#9a8c78', '#7fa08a', '#6f8fa8', '#a0583a', '#c8c4b4'],
  sign_board: ['#c03028', '#e0b830', '#2f6fae', '#3f8f4a', '#e8e0cc'],
  aircon_case: ['#d8d0bc', '#c8c4b4', '#b8b0a0'],
};
const WASH = ['wash_white', 'wash_white', 'wash_blue', 'wash_grey', 'wash_red', 'wash_yellow', 'wash_green', 'wash_dark', 'wash_pink'];

// The shapes, in the frame of src/life/furnish.js (x along the wall, y up, z out of the wall).
// A cage of 2 x 0.7 x 2.4 m (the scale of each one gives its size): a floor plate, grilles at
// the front, at the sides and on top (material slot 4), posts and rails.
const cageParts = (w, d, h) => [
  box(0, w, 0, 0.05, 0, d, 0),
  box(0, w, 0.05, h - 0.03, d - 0.012, d, 4),
  box(0, 0.012, 0.05, h - 0.03, 0, d, 4), box(w - 0.012, w, 0.05, h - 0.03, 0, d, 4),
  box(0, w, h - 0.03, h, 0, d, 4),
  box(0, 0.035, 0, h, d - 0.035, d, 2), box(w - 0.035, w, 0, h, d - 0.035, d, 2),
  box(0, w, h - 0.04, h, d - 0.035, d, 2), box(0, w, 0.95, 0.985, d - 0.035, d, 2),
];
// The washing on a rail under the top of a cage of the same size.
const washParts = (w, d, h, r) => {
  const out = [box(0.05, w - 0.05, h - 0.3, h - 0.28, d - 0.2, d - 0.18, 'metal')];
  let x = 0.1 + r() * 0.15;
  while (x < w - 0.3) {
    const cw = 0.22 + r() * 0.35, drop = 0.35 + r() * 0.55, m = r() < 0.3 ? 2 : WASH[Math.floor(r() * WASH.length)];
    out.push(box(x, Math.min(w - 0.08, x + cw), h - 0.3 - drop, h - 0.29, d - 0.2, d - 0.188, m));
    x += cw + 0.04 + r() * 0.22;
  }
  return out;
};
// A bamboo pole 2 m out of a window (the scale gives its length), the washing under it.
const poleParts = (w, d, h, r) => {
  const out = [box(0, 0.04, -0.04, 0, 0, d, 'bamboo')];
  let z = 0.3 + r() * 0.25;
  while (z < d - 0.3) {
    const cw = 0.25 + r() * 0.35, drop = 0.3 + r() * 0.6, m = r() < 0.3 ? 2 : WASH[Math.floor(r() * WASH.length)];
    out.push(box(0.014, 0.026, -0.04 - drop, -0.03, z, Math.min(d - 0.05, z + cw), m));
    z += cw + 0.05 + r() * 0.3;
  }
  return out;
};
// An awning over a cage: a sheet from the wall, falling 0.22 m to 0.25 m past the cage.
const awningParts = (w, d) => [box(-0.1, w + 0.1, 0, 0.22, 0, d + 0.25, 2, 's')];
// A window air-conditioner: in the window, 0.35 m out of the wall, with a grille at the front.
const airconParts = (w, d, h) => [box(0, w, 0, h, -0.2, d - 0.2, 2), box(0.04, w - 0.04, 0.04, h - 0.04, d - 0.2, d - 0.19, 'metal')];
// A projecting sign: a board out from the wall on two brackets, with a light panel and four
// red blocks (the characters, read from the top down).
const signParts = (w, d, h) => [
  box(0, w, 0, h, 0.15, 0.15 + d, 2),
  box(-0.004, w + 0.004, h * 0.06, h * 0.94, 0.2, 0.1 + d, 'paper'),
  ...[0, 1, 2, 3].map((i) => box(-0.008, w + 0.008, h * (0.74 - i * 0.2), h * (0.74 - i * 0.2) + h * 0.14, 0.15 + d * 0.3, 0.15 + d * 0.7, 'red_paper')),
  box(w * 0.2, w * 0.8, h * 0.25, h * 0.25 + 0.04, 0, 0.15, 'metal'), box(w * 0.2, w * 0.8, h * 0.8, h * 0.8 + 0.04, 0, 0.15, 'metal'),
];

// The kinds of the things outside, for src/life/furnish.js: the label and the facts of the kind
// of data/furnishings.json (from), with the shape and the size of this file.
const KINDS = {
  window_cage: { from: 'window_cage', size: [2, 0.7, 2.4], parts: cageParts, material: 'concrete', accent: 'cage', tier: 0 },
  cage_wash: { from: 'clothes_rack', size: [2, 0.7, 2.4], parts: washParts, variants: 4, material: 'cloth', accent: 'cloth', tier: 1 },
  window_pole: { from: 'laundry_pole', size: [0.04, 2, 1], parts: poleParts, variants: 4, material: 'bamboo', accent: 'cloth', tier: 1 },
  cage_awning: { from: 'awning', size: [2, 0.7, 0.22], parts: awningParts, material: 'corrugated', accent: 'awning_sheet', tier: 0 },
  window_aircon: { from: 'aircon', size: [0.6, 0.55, 0.4], parts: airconParts, material: 'metal', accent: 'aircon_case', tier: 1 },
  shop_sign: { from: 'sign', size: [0.05, 0.6, 1.6], parts: signParts, material: 'metal', accent: 'sign_board', tier: 1 },
};

// The rectangles that the things outside take in plan, with their heights: a cage, a pole, an
// air-conditioner. A 2 m grid of them.
class Taken {
  constructor() { this.grid = new Map(); }
  // a rectangle from the wall point (x, z), hw either side along (ux, uz), d out along (nx, nz)
  rect(x, z, ux, uz, nx, nz, hw, d, y0, y1) {
    const pts = [[-hw, 0], [hw, 0], [hw, d], [-hw, d]].map(([a, o]) => [x + ux * a + nx * o, z + uz * a + nz * o]);
    return { pts, axes: [[ux, uz], [nx, nz]], y0, y1 };
  }
  cells(R, f) {
    const xs = R.pts.map((p) => p[0]), zs = R.pts.map((p) => p[1]);
    for (let i = Math.floor(Math.min(...xs) / 2); i <= Math.floor(Math.max(...xs) / 2); i++)
      for (let j = Math.floor(Math.min(...zs) / 2); j <= Math.floor(Math.max(...zs) / 2); j++) f(`${i}:${j}`);
  }
  add(R) { this.cells(R, (key) => { if (!this.grid.has(key)) this.grid.set(key, []); this.grid.get(key).push(R); }); }
  // Does R overlap a rectangle that is there (in plan and in height)?
  hits(R) {
    let hit = false;
    this.cells(R, (key) => {
      if (hit) return;
      for (const Q of this.grid.get(key) || []) if (Q.y0 < R.y1 && R.y0 < Q.y1 && overlap(Q, R)) { hit = true; return; }
    });
    return hit;
  }
}
// Two rectangles overlap if no axis of either one parts them (by 2 cm).
function overlap(A, B) {
  for (const [ax, az] of [...A.axes, ...B.axes]) {
    const pa = A.pts.map((p) => p[0] * ax + p[1] * az), pb = B.pts.map((p) => p[0] * ax + p[1] * az);
    if (Math.max(...pa) < Math.min(...pb) + 0.02 || Math.max(...pb) < Math.min(...pa) + 0.02) return false;
  }
  return true;
}

// Put the things outside the windows. fu: the Furnish of src/life/furnish.js.
export function placeFacades(fu) {
  const S = fu.S, uses = fu.uses, walls = fu.walls || (fu.walls = new Walls(S));
  fu.addColours(COLOURS);
  const data = fu.F?.kinds || {};
  for (const [k, K] of Object.entries(KINDS)) fu.kinds[k] = { ...(data[K.from] || {}), ...K };
  const outside = new Map((fu.F?.outside || []).map((o) => [o.kind, o]));
  const share = (kind, dflt) => { const v = parseFloat(outside.get(kind)?.share); return Number.isFinite(v) ? v : dflt; };
  const P = {
    cage: share('window_cage', 0.7), wash: share('clothes_rack', 0.6), pole: share('laundry_pole', 0.4), pots: share('plant_pot', 0.4),
    bird: share('birdcage', 0.05), awning: share('awning', 0.3), aircon: share('aircon', 0.25),
  };
  const factsOf = (kind) => outside.get(kind)?.facts || fu.kinds[kind]?.facts || [];
  // a thing for the pick: its box (the pick of src/life/furnish.js meets it first): the middle
  // (x, y, z), the wall W (its tangent and normal), the half sizes along the wall, up and out
  const item = (b, k, kind, from, W, x, y, z, hu, hv, hw, note = '') => {
    const key = `out:${b}`;
    if (!fu.items.has(key)) fu.items.set(key, []);
    const t = {
      kind, x, z, r: Math.max(0.4, hu, hw), k0: k, k1: k, facts: factsOf(from), basis: 'sourced (where it stands: inferred)', why: 'facade', note,
      box: { c: [x, y, z], u: [W.tx, W.tz], w: [W.nx, W.nz], h: [hu, hv, hw] },
    };
    fu.items.get(key).push(t);
    return t;
  };
  const risers = new Map();
  for (const R of fu.risers || []) { if (!risers.has(R.b)) risers.set(R.b, []); risers.get(R.b).push(R); }
  const taken = new Taken();
  const count = { window_cage: 0, cage_wash: 0, plant_pot: 0, birdcage: 0, cage_awning: 0, window_pole: 0, window_aircon: 0, shop_sign: 0 };

  // the windows of each unit on each wall: "b:k:u:ring:edge" -> windows, by t
  const groups = new Map(), byUnit = new Map();
  for (const W of findWindows(S)) {
    if (W.u < 0) continue;
    const U = uses.get(W.b, W.k, W.u), cat = U?.cat;
    if (cat !== 'home' && !((cat === 'dentist' || cat === 'clinic') && W.k <= 3)) continue;
    W.cat = cat;
    const gk = `${W.b}:${W.k}:${W.u}:${W.ri}:${W.i}`, uk = `${W.b}:${W.k}:${W.u}`;
    if (!groups.has(gk)) groups.set(gk, []);
    groups.get(gk).push(W);
    if (!byUnit.has(uk)) byUnit.set(uk, []);
    byUnit.get(uk).push(W);
  }

  // ---- the cages ----
  // One cage across the windows of a flat on one wall (F134: "across each flat"; F39: one on each
  // floor), split where a pipe comes down the facade between two windows.
  const placed = [];
  for (const list of groups.values()) {
    const W0 = list[0];
    if (W0.cat !== 'home' || W0.lab >= 0) continue; // not over a lower roof
    list.sort((a, c) => a.t - c.t);
    const B = S.list[W0.b], k = W0.k, r = mulberry32(((W0.b * 92821) ^ (k * 68917) ^ (W0.u * 1931) ^ (W0.i * 7)) >>> 0);
    // the pipes down this wall, at a along it
    const pipesAt = [];
    for (const G of risers.get(W0.b) || []) {
      const a = (G.x - W0.ax) * W0.tx + (G.z - W0.az) * W0.tz, o = (G.x - W0.ax) * W0.nx + (G.z - W0.az) * W0.nz;
      if (Math.abs(o) <= 1.2) pipesAt.push(a);
    }
    const runs = [[list[0]]];
    for (let q = 1; q < list.length; q++) {
      const e = list[q - 1].t + list[q - 1].w / 2, s0 = list[q].t - list[q].w / 2;
      if (pipesAt.some((a) => a > e - 0.05 && a < s0 + 0.05)) runs.push([list[q]]);
      else runs[runs.length - 1].push(list[q]);
    }
    for (const ws of runs) {
      if (r() >= P.cage) continue;
      const first = ws[0], last = ws[ws.length - 1];
      let t0 = Math.max(0.12, first.t - first.w / 2 - 0.3), t1 = Math.min(W0.len - 0.12, last.t + last.w / 2 + 0.3);
      // keep off the pipes down the facade
      for (const a of pipesAt) {
        if (a < t0 - 0.3 || a > t1 + 0.3) continue;
        if (a < (first.t + last.t) / 2) t0 = Math.max(t0, a + 0.3); else t1 = Math.min(t1, a - 0.3);
      }
      if (t0 > first.t - first.w / 2 - 0.05 || t1 < last.t + last.w / 2 + 0.05) continue;
      const d = r() < 0.1 ? 1.0 + r() * 0.2 : 0.6 + r() * 0.2, wid = t1 - t0, tm = (t0 + t1) / 2;
      const y0 = B.y[k], h = B.y[k + 1] - 0.15 - y0;
      const cx = W0.ax + W0.tx * tm, cz = W0.az + W0.tz * tm;
      // the open air: deep enough in front of the cage (a lane stays a lane), wide enough at its sides
      let ok = true;
      const n = Math.max(3, Math.ceil(wid / 1.5) + 1);
      for (let j = 0; j < n && ok; j++) {
        const sv = t0 + 0.05 + (j / (n - 1)) * (wid - 0.1);
        const px = W0.ax + W0.tx * sv + W0.nx * 0.01, pz = W0.az + W0.tz * sv + W0.nz * 0.01;
        for (const y of [y0 + 0.15, y0 + h - 0.3]) if (walls.hit(px, pz, W0.nx, W0.nz, y, 6).t < d + 1.0) ok = false;
      }
      if (!ok) continue;
      const mx = cx + W0.nx * d * 0.5, mz = cz + W0.nz * d * 0.5;
      if (walls.hit(mx, mz, W0.tx, W0.tz, y0 + h / 2, 6, 0).t < wid / 2 + 0.03 || walls.hit(mx, mz, -W0.tx, -W0.tz, y0 + h / 2, 6, 0).t < wid / 2 + 0.03) continue;
      // the cage only, from its floor to under the next floor: the cage of the floor above stands on it
      const R = taken.rect(cx, cz, W0.tx, W0.tz, W0.nx, W0.nz, wid / 2, d, y0, y0 + h);
      if (taken.hits(R)) continue;
      taken.add(R);
      for (const W of ws) W.cage = true;
      const ang = Math.atan2(W0.nx, W0.nz), sx = wid / 2, sz = d / 0.7;
      fu.put('window_cage', 'out', cx, y0, cz, ang, W0.b, k, r, [sx, h / 2.4, sz]);
      count.window_cage++;
      const inIt = [];
      if (r() < P.wash) { fu.put('cage_wash', 'out', cx, y0, cz, ang, W0.b, k, r, [sx, h / 2.4, sz]); count.cage_wash++; inIt.push('laundry on a rail'); }
      if (r() < P.pots) {
        const np = 1 + Math.floor(r() * 6);
        for (let q = 0; q < np; q++) {
          const a = -wid / 2 + 0.2 + ((q + 0.5) / np) * (wid - 0.4) + (r() - 0.5) * 0.1, o = d - 0.2 - r() * 0.15;
          fu.put('plant_pot', 'out', cx + W0.tx * a + W0.nx * o, y0 + 0.05, cz + W0.tz * a + W0.nz * o, r() * 6.3, W0.b, k, r, [0.8 + r() * 0.5, 0.7 + r() * 0.6, 0.8 + r() * 0.5]);
          count.plant_pot++;
        }
        inIt.push(np > 1 ? `${np} pot plants` : 'a pot plant');
      }
      if (r() < P.bird) {
        const a = (r() - 0.5) * (wid - 0.5);
        fu.put('birdcage', 'out', cx + W0.tx * a + W0.nx * d * 0.5, y0 + Math.min(0, h - 2.35), cz + W0.tz * a + W0.nz * d * 0.5, ang, W0.b, k, r);
        count.birdcage++;
        inIt.push('a songbird in a bamboo cage');
      }
      placed.push({ W0, ws, k, r, cx, cz, mx, mz, y0, h, d, wid, ang, sx, inIt, aw: r() < P.awning });
    }
  }
  // An awning over a cage that has no cage on it (INFERRED: the cage above is the roof of the
  // one under it). Then the pick box of each cage.
  for (const C of placed) {
    const { W0, k, r, cx, cz, y0, h, d, wid, ang, sx, inIt } = C;
    let aw = C.aw;
    if (aw) {
      const A = taken.rect(cx, cz, W0.tx, W0.tz, W0.nx, W0.nz, wid / 2 - 0.05, d, y0 + h + 0.05, y0 + h + 0.35);
      if (taken.hits(A)) aw = false;
      else {
        taken.add(taken.rect(cx, cz, W0.tx, W0.tz, W0.nx, W0.nz, wid / 2, d + 0.05, y0 + h, y0 + h + 0.3));
        fu.put('cage_awning', 'out', cx, y0 + h + 0.01, cz, ang, W0.b, k, r, [sx, 1, (d + 0.05) / 0.7]);
        count.cage_awning++;
        inIt.push('an awning over it');
      }
    }
    const top = h + (aw ? 0.25 : 0);
    const T = item(W0.b, k, 'window_cage', 'window_cage', W0, C.mx, y0 + top / 2, C.mz, wid / 2, top / 2, d / 2 + (aw ? 0.15 : 0), inIt.length ? `In it: ${inIt.join(', ')}.` : '');
    T.inIt = inIt;
    for (const W of C.ws) W.cageItem = T;
  }

  // ---- the air-conditioners, and the signs of the dentists and clinics ----
  for (const [uk, ws] of byUnit) {
    const [b, k, u] = uk.split(':').map(Number), B = S.list[b];
    const r = mulberry32(((b * 15731) ^ (k * 789221) ^ (u * 1376312589)) >>> 0);
    if (ws[0].cat === 'home') {
      if (r() >= P.aircon) continue;
      const W = ws[Math.floor(r() * ws.length)];
      const R = taken.rect(W.x, W.z, W.tx, W.tz, W.nx, W.nz, 0.32, 0.36, W.y0, W.y0 + 0.42);
      if (!W.cage && (W.lab >= 0 || walls.hit(W.x + W.nx * 0.01, W.z + W.nz * 0.01, W.nx, W.nz, W.y0 + 0.2, 4).t < 1.2 || taken.hits(R))) continue;
      if (!W.cage) taken.add(R);
      W.aircon = true;
      fu.put('window_aircon', 'out', W.x, W.y0, W.z, Math.atan2(W.nx, W.nz), b, k, r);
      count.window_aircon++;
      item(b, k, 'window_aircon', 'aircon', W, W.x + W.nx * 0.075, W.y0 + 0.2, W.z + W.nz * 0.075, 0.3, 0.2, 0.275);
      if (W.cageItem) { W.cageItem.inIt.push('an air-conditioner in the window'); W.cageItem.note = `In it: ${W.cageItem.inIt.join(', ')}.`; }
    } else {
      // one sign, beside the first window that has room for it
      for (const W of ws) {
        const t = W.t + W.w / 2 + 0.12 <= W.len - 0.1 ? W.t + W.w / 2 + 0.12 : W.t - W.w / 2 - 0.12;
        if (t < 0.1) continue;
        const x = W.ax + W.tx * t, z = W.az + W.tz * t, yb = Math.max(B.y[k] + 0.2, W.y0 - 0.5);
        const R = taken.rect(x, z, W.tx, W.tz, W.nx, W.nz, 0.05, 0.8, yb, yb + 1.6);
        if (W.lab >= 0 || walls.hit(x + W.nx * 0.01, z + W.nz * 0.01, W.nx, W.nz, yb + 0.8, 4).t < 1.4 || taken.hits(R)) continue;
        taken.add(R);
        W.sign = true;
        fu.put('shop_sign', 'out', x, yb, z, Math.atan2(W.nx, W.nz), b, k, r);
        count.shop_sign++;
        item(b, k, 'shop_sign', 'sign', W, x + W.nx * 0.45, yb + 0.8, z + W.nz * 0.45, 0.05, 0.8, 0.3, `The sign of a ${ws[0].cat === 'dentist' ? 'dentist' : 'clinic'}.`);
        break;
      }
    }
  }

  // ---- bamboo poles with laundry, out of the windows without a cage ----
  for (const list of groups.values()) {
    for (const W of list) {
      if (W.cat !== 'home' || W.cage || W.aircon || W.lab >= 0) continue;
      const r = mulberry32(((W.b * 31337) ^ (W.k * 2971) ^ (W.u * 613) ^ Math.round(W.t * 100)) >>> 0);
      if (r() >= P.pole) continue;
      const y = W.y1 - 0.08, px = W.x + W.nx * 0.01, pz = W.z + W.nz * 0.01;
      const free = Math.min(walls.hit(px, pz, W.nx, W.nz, y, 6).t, walls.hit(px, pz, W.nx, W.nz, y - 0.8, 6).t);
      if (free < 1.0) continue;
      // over a narrow lane, the pole reaches the wall across it
      let L = free <= 3.4 ? free - 0.02 : 1.3 + r() * 0.9;
      const a = (r() - 0.5) * (W.w - 0.2);
      const x = W.x + W.tx * a, z = W.z + W.tz * a;
      // shorter, to stop before a cage or a pole that is there
      let R = taken.rect(x, z, W.tx, W.tz, W.nx, W.nz, 0.05, L, y - 0.95, y + 0.05);
      while (taken.hits(R) && L > 1.0) { L -= 0.3; R = taken.rect(x, z, W.tx, W.tz, W.nx, W.nz, 0.05, L, y - 0.95, y + 0.05); }
      if (L < 1.0 || taken.hits(R)) continue;
      taken.add(R);
      fu.put('window_pole', 'out', x, y, z, Math.atan2(W.nx, W.nz), W.b, W.k, r, [1, 1, L / 2]);
      count.window_pole++;
      item(W.b, W.k, 'window_pole', 'laundry_pole', W, x + W.nx * L / 2, y - 0.45, z + W.nz * L / 2, 0.08, 0.5, L / 2);
    }
  }
  fu.facadeCount = count;
}
