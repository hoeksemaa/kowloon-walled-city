// The utilities of the City: its water, power, post and refuse (data/utilities.json,
// docs/utilities.md), drawn with the things of src/life/furnish.js.
//
// - Water: the 67 roof tanks of the wells, the floor hatches of their pumps in the G/F rooms,
//   the one Government standpipe in the City (Tai Chang Street (大井街)) with the hoses of the
//   food factories, and the seven standpipes outside the City.
// - Power: a meter board at each G/F stair door, with a meter for each flat of the building
//   (the Kaifong Association (街坊會) had a meter fitted in each unit), and the KFA public
//   lights of the lanes, lit 24 hours a day.
// - The post: the letterboxes beside the stair doors.
// - The pipes and cables (pipes.js): a layer of them over the lanes on wall brackets, cables
//   across the lanes, drip sheets, pipes down the facades, the flex from each meter board up to
//   the flats, and the hoses of the food factories from the standpipe.
// - Refuse: the refuse points of the named lanes, with the buckets of the Urban Services
//   Department (市政總署).
// The look of each thing has a source; where each one stands is INFERRED (the placement rules
// of data/utilities.json). The structure is frozen: this file only reads it.

import { Walls } from './walls.js';
import { buildPipes, nearestOnRings, PIPE_KIND } from './pipes.js';
import { tube, hang, roundCorners, tiles } from './tubes.js';

const box = (x0, x1, y0, y1, z0, z1, m = 0, s = 'b') => [x0, x1, y0, y1, z0, z1, m, s];

// The kinds of the utilities, in the form of data/furnishings.json "kinds", with their parts
// (see SHAPE in furnish.js: x along the wall from 0 to w, y up, z out of the wall). Slot 2 is
// the colour of each thing (its accent); slot 3 is a light that glows.
const KINDS = {
  roof_tank: {
    label: 'water tank of a well, on the roof', size: [2.5, 2.5, 2.0], material: 'concrete', tier: 0,
    facts: ['U11', 'U15', 'U40', 'U56'],
    parts: (w, d, h) => [box(0, w, 0, h, 0, d), box(-0.05, w + 0.05, h, h + 0.08, -0.05, d + 0.05), box(w * 0.3, w * 0.6, h + 0.08, h + 0.14, d * 0.3, d * 0.6, 'metal'),
      box(w * 0.45, w * 0.55, 0, h * 0.8, -0.12, 0, 'galvanised'), box(w * 0.7, w * 0.78, 0, h * 0.5, -0.1, 0, 'galvanised')],
  },
  pump_hatch: {
    label: 'floor hatch of a well pump', size: [0.8, 0.6, 0.05], material: 'metal', tier: 2, facts: ['U45', 'U16', 'U11'],
    parts: (w, d) => [box(0, w, 0, 0.03, 0, d), box(w * 0.38, w * 0.62, 0.03, 0.07, d * 0.3, d * 0.7, 'rubber', 'c')],
  },
  standpipe: {
    label: 'the Government standpipe of Tai Chang Street (大井街)', size: [1.6, 1.0, 1.4], material: 'galvanised', tier: 0, accent: 'plastic',
    facts: ['U1', 'U26', 'U23', 'U25'],
    parts: () => [box(-0.1, 1.7, 0, 0.15, 0, 1.2, 'tile'), box(0, 1.0, 0.85, 0.9, 0.1, 0.16), box(0, 0.05, 0, 0.9, 0.1, 0.16), box(0.95, 1.0, 0, 0.9, 0.1, 0.16),
      box(1.0, 1.06, 0, 1.4, 0.1, 0.16), ...[0.2, 0.45, 0.7].map((x) => box(x, x + 0.06, 0.74, 0.85, 0.12, 0.24, 'metal')),
      box(1.2, 1.6, 0.15, 1.0, 0.15, 0.55, 'concrete', 'c'), box(0.25, 0.55, 0.15, 0.5, 0.55, 0.85, 2, 'c'), box(0.7, 0.95, 0.15, 0.45, 0.7, 0.95, 'plastic', 'c')],
  },
  standpipe_post: {
    label: 'a Government standpipe outside the City', size: [0.6, 0.4, 1.0], material: 'concrete', tier: 1, facts: ['U2', 'U3', 'U4', 'U5'],
    parts: (w, d, h) => [box(0.15, 0.45, 0, h, 0, 0.3), box(0.25, 0.32, h - 0.25, h - 0.05, 0.3, 0.42, 'galvanised'), box(0.05, 0.55, h - 0.3, h - 0.25, 0.32, 0.38, 'galvanised')],
  },
  // the hoses of the food factories (tubes: pipes.js)
  hose_run: { label: 'hoses from the standpipe to the food factories (40-60)', facts: ['U24', 'U25', 'U26'] },
  // a meter board of one row of meters, 1 m wide: scaled to its width and its rows
  meter_board: {
    label: 'electricity meter board', size: [1, 0.15, 0.3], material: 'wood', tier: 1, facts: ['U96', 'U98', 'U114', 'U94'],
    parts: () => [box(0, 1, 0, 0.3, 0, 0.03), box(0.02, 0.86, 0.05, 0.25, 0.03, 0.08, 'enamel'), box(0.88, 0.98, 0.03, 0.27, 0.03, 0.13, 'metal'),
      box(0.4, 0.55, 0.3, 0.6, 0.01, 0.05, 'rubber')],
  },
  letterboxes: {
    label: 'small wooden letterboxes', size: [0.9, 0.12, 0.6], material: 'wood', tier: 2, facts: ['U203', 'U205'],
    parts: () => { const p = []; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) p.push(box(i * 0.225 + 0.01, (i + 1) * 0.225 - 0.01, j * 0.2 + 0.01, (j + 1) * 0.2 - 0.01, 0, 0.12, i % 2 ? 0 : 'dark_wood')); return p; },
  },
  letterbox_metal: {
    label: 'a painted metal letterbox', size: [0.25, 0.1, 0.35], material: 'metal', tier: 2, accent: 'plastic', facts: ['U203', 'U205'],
    parts: (w, d, h) => [box(0, w, 0, h, 0, d, 2), box(0.03, w - 0.03, h * 0.7, h * 0.75, d, d + 0.01, 'rubber')],
  },
  // the pipes and cables (tubes: pipes.js); these give the words and the sources of the pick
  pipes_named: { label: 'overhead pipes and cables over a named lane (30-40): steel and plastic water pipes, rubber hoses, electric cables and flex, on wall brackets', facts: ['U74', 'U76', 'U86', 'U110', 'U143'] },
  pipes_lane: { label: 'overhead pipes and cables over a small lane (10-20), on wall brackets', facts: ['U74', 'U76', 'U86', 'U110', 'U143'] },
  cross_wire: { label: 'a cable across the lane, from building to building', facts: ['U76', 'U86', 'U164'] },
  drip_sheet: { label: 'a plastic or metal sheet over the lane, against the drips from the pipes', facts: ['U162', 'U143', 'U160'] },
  wall_pipes: { label: 'pipes and cables down the wall: the pipes from the roof tanks, the drains and the cables to the flats', facts: ['U15', 'U74', 'U76', 'U150'] },
  flex_up: { label: 'flex tacked to the wall, from the meter board up to the flats', facts: ['U96', 'U98', 'U110'] },
  roof_cable: { label: 'a cable from roof to roof, on a pole', facts: ['U76', 'U86'] },
  lane_lamp: {
    label: 'a public light of the Kaifong Association (a fluorescent tube, lit 24 hours a day)', size: [1.2, 0.1, 0.1], material: 'metal', tier: 1, accent: 'light',
    facts: ['U106', 'U108', 'U109', 'U111'],
    parts: (w) => [box(0, w, 0, 0.05, 0, 0.06, 3), box(w * 0.45, w * 0.55, 0.05, 0.3, 0, 0.04, 'metal')],
  },
  lane_lamp_dark: {
    label: 'a public light of the Kaifong Association, dark (one in four in the small lanes, p103)', size: [1.2, 0.1, 0.1], material: 'metal', tier: 1,
    facts: ['U106', 'U108', 'U109'],
    parts: (w) => [box(0, w, 0, 0.05, 0, 0.06, 'enamel'), box(w * 0.45, w * 0.55, 0.05, 0.3, 0, 0.04, 'metal')],
  },
  refuse_bin: {
    label: 'a refuse point: a low wooden bin, heaped with tied plastic bags', size: [2.0, 1.2, 0.6], material: 'wood', tier: 0, accent: 'plastic',
    facts: ['U120', 'U125', 'U128'],
    parts: (w, d, h) => [box(0, w, 0, h * 0.6, 0, 0.05), box(0, w, 0, h * 0.6, d - 0.05, d), box(0, 0.05, 0, h * 0.6, 0, d), box(w - 0.05, w, 0, h * 0.6, 0, d),
      box(0.1, 0.7, 0, h * 0.9, 0.1, 0.7, 2), box(0.6, 1.2, 0, h, 0.3, 1.0, 'rubber'), box(1.1, 1.8, 0, h * 0.8, 0.1, 0.8, 2), box(1.3, 1.9, 0, h * 0.7, 0.6, 1.1, 'paper')],
  },
  usd_buckets: {
    label: 'refuse buckets of the Urban Services Department (市政總署), stacked', size: [0.6, 0.6, 0.65], material: 'plastic', tier: 1, accent: 'usd', variants: 2,
    parts: (w, d, h, r) => { const n = 5 + Math.floor(r() * 4), p = []; for (let i = 0; i < n; i++) p.push(box(0, w, i * 0.12, i * 0.12 + h * (i === n - 1 ? 1 : 0.2), 0, d, 2, 'c')); return p; },
    facts: ['U120', 'U122'],
  },
};

// Put the utilities in the store of fu (a Furnish). U: data/utilities.json.
export function placeUtilities(fu, U) {
  const S = fu.S, L = S.L, P = U.placement || {}, nodes = S.graph.nodes;
  fu.addColours({ usd: ['#d8701e', '#cf6a1c'] });
  for (const [k, K] of Object.entries(KINDS)) fu.kinds[k] = { ...K, facts: K.facts || [] };
  let seed = 1986;
  const r = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const cellOf = (x, z) => Math.floor(z - L.z0) * L.W + Math.floor(x - L.x0);
  const laneY = (x, z, b) => {
    const n = S.laneNode[cellOf(x, z)];
    return n >= 0 ? nodes[n].y : S.list[b]?.g0 ?? 0;
  };
  const nearest = (x, z) => {
    let best = -1, bd = Infinity;
    for (const B of S.list) { const d = (B.cx - x) ** 2 + (B.cz - z) ** 2; if (d < bd) { bd = d; best = B.id; } }
    return best;
  };
  const listOf = (key) => fu.items.get(key) || fu.items.set(key, []).get(key);
  const add = (key, kind, x, z, rad, note, more) => listOf(key).push({ kind, x, z, r: rad, facts: fu.kinds[kind].facts, basis: 'sourced (where it stands: inferred)', why: 'utilities', note, ...more });
  // the turn whose z axis (out of the wall) goes away from the middle of building b
  const away = (b, x, z) => { const B = S.list[b]; return Math.atan2(x - B.cx, z - B.cz); };
  // the origin of a thing of depth d whose middle is at (x, z), turned by ang
  const back = (x, z, ang, d) => [x - Math.sin(ang) * d / 2, z - Math.cos(ang) * d / 2];
  // the pipes and cables (pipes.js): tubes in the floor layers
  const walls = fu.walls || (fu.walls = new Walls(S));
  const named = new Set();
  for (const cells of Object.values(L.streetLanes || {})) for (const c of cells) named.add(c);
  const tanks = new Set((P.roof_tanks?.list || []).map((t) => t.b));
  const pipes = buildPipes(S, walls, { named, tanks });
  const lin = (hex) => fu.cols[hex]?.[0] ? [fu.cols[hex][0].r, fu.cols[hex][0].g, fu.cols[hex][0].b] : null;
  const FLEX = ['#1f1e1d', '#d8d2c4', '#8a2e24', '#5c4632', '#7a7468', '#2a2927'], HOSE = ['#2b2a29', '#6e3a2c', '#4a6346', '#c9c2b0', '#3f5f86', '#2b2a29', '#8a5a3a'];
  fu.addColours({ ...Object.fromEntries([...FLEX, ...HOSE].map((h) => [h, [h]])) });

  // ---- water: the roof tanks, the pump hatches, the standpipes and the hoses ----
  for (const t of P.roof_tanks?.list || []) {
    const B = S.list[t.b];
    if (!B || B.pitched) continue;
    const ang = Math.atan2(B.F.ux, B.F.uz), [x, z] = back(t.x, t.z, ang, 2.5);
    fu.put('roof_tank', 'roof', x, B.top, z, ang, B.id, B.n, r);
    (fu.blocked.get(B.id) || fu.blocked.set(B.id, []).get(B.id)).push([t.x, t.z, 2.3]);
    add(`roof:${B.id}`, 'roof_tank', t.x, t.z, 1.5, t.feeds?.length ? `It also feeds ${t.feeds.length} other building${t.feeds.length > 1 ? 's' : ''} near it (inferred).` : '');
  }
  for (const p of P.pumps?.list || []) {
    const [b, k] = p.unit.split(':').map(Number), B = S.list[b];
    if (!B) continue;
    const ang = Math.atan2(B.F.ux, B.F.uz), [x, z] = back(p.x, p.z, ang, 0.6);
    fu.put('pump_hatch', 'room', x, B.y[k], z, ang, b, k, r);
    add(p.unit, 'pump_hatch', p.x, p.z, 0.6, 'Under it: the pump pipe of a well, a valve with a hand wheel and an elbow. The pump fills the roof tank at about noon and midnight.');
  }
  const sp = P.standpipe_inside;
  if (sp) {
    const [sx, sz] = sp.xz, b = sp.wall_of, ang = away(b, sx, sz), y = laneY(sx, sz, b), [x, z] = back(sx, sz, ang, 1.0);
    fu.put('standpipe', 'out', x, y, z, ang, b, 0, r);
    add(`out:${b}`, 'standpipe', sx, sz, 1.2, 'The one standpipe of safe drinking water inside the City. People fill buckets and drums here all day; the hoses of the food factories climb the wall.');
    // the hoses: a bundle up the wall by the standpipe, then along the lane overhead, fanning
    // out, and down into the food factories at the end (U25, U26: 40-60 hoses of 1-3 cm)
    const pts = P.hose_path?.points || [];
    if (pts.length > 1) {
      const y0 = laneY(pts[0][0], pts[0][1], b), nx = Math.sin(ang), nz = Math.cos(ang), n = 16;
      for (let i = 0; i < n; i++) {
        const o = (i - (n - 1) / 2), hy = y0 + 2.6 + ((i * 7) % 5) * 0.22, col = lin(HOSE[i % HOSE.length]);
        const path = [[pts[0][0] + nx * 0.12 + nz * o * 0.03, y0 + 0.9, pts[0][1] + nz * 0.12 - nx * o * 0.03]];
        path.push([path[0][0], hy, path[0][2]]);
        for (let q = 1; q < pts.length; q++) {
          const [ax, az] = pts[q - 1], [bx, bz] = pts[q], l = Math.hypot(bx - ax, bz - az) || 1, px = (bz - az) / l, pz = -(bx - ax) / l;
          const spread = o * (0.03 + 0.05 * (q / (pts.length - 1)));
          const e = [bx + px * spread, hy - (q === pts.length - 1 ? 0 : 0.05 * ((i * 3) % 4)), bz + pz * spread];
          path.push(...hang(path[path.length - 1], e, 0.12 + ((i * 5) % 7) * 0.04, 6).slice(1));
        }
        const last = path[path.length - 1];
        path.push([last[0], y0 + 1.2 + (i % 3) * 0.3, last[2]]);
        tube(pipes.thick.at(0), roundCorners(path, 0.08), 0.011 + (i % 4) * 0.003, 5, col, [b, 0, PIPE_KIND]);
      }
      for (let i = 0; i + 1 < pts.length; i++) {
        const [ax, az] = pts[i], [bx, bz] = pts[i + 1], len = Math.hypot(bx - ax, bz - az);
        add(`out:${b}`, 'hose_run', (ax + bx) / 2, (az + bz) / 2, len / 2 + 0.3, 'The hoses go to the food factories of the next block (216:0:4); a worker comes now and then to connect his hose.');
      }
    }
  }
  for (const s of P.outside_standpipes?.list || []) {
    const [sx, sz] = s.xz, b = s.nearest_building, ang = away(b, sx, sz), [x, z] = back(sx, sz, ang, 0.4);
    fu.put('standpipe_post', 'out', x, laneY(sx, sz, b), z, ang, b, 0, r);
    add(`out:${b}`, 'standpipe_post', sx, sz, 0.6, `${s.road}.`);
  }

  // ---- power and post: a meter board and letterboxes at each G/F stair door; pipes down the wall ----
  const units = new Map();
  for (const key of fu.uses.at.keys()) { const b = +key.split(':')[0]; units.set(b, (units.get(b) || 0) + 1); }
  const doorDone = new Set();
  for (const d of S.doors) {
    if (d.kind !== 'street' || (d.k ?? 0) !== 0 || doorDone.has(d.b)) continue;
    doorDone.add(d.b);
    const B = S.list[d.b], m = units.get(d.b) || 0;
    if (!B || !m) continue;
    const ang = Math.atan2(d.n[0], d.n[1]), ux = Math.cos(ang), uz = -Math.sin(ang);
    const ox = d.x + d.n[0] * 0.12, oz = d.z + d.n[1] * 0.12;
    const boards = m > 120 ? [Math.ceil(m / 2), Math.floor(m / 2)] : [m];
    boards.forEach((mm, q) => {
      const rows = Math.min(3, Math.ceil(mm / 40)), wb = 0.15 * Math.min(mm, 40) + 0.3, s = q ? -1 : 1, off = s * (0.5 + wb / 2 + 0.1);
      const x = ox + ux * off, z = oz + uz * off; // the store centres a thing on its width
      fu.put('meter_board', 'out', x, d.y + 1.8, z, ang, d.b, 0, r, [wb, rows, 1]);
      add(`out:${d.b}`, 'meter_board', ox + ux * off, oz + uz * off, wb / 2 + 0.2, `${mm} electricity meters on this board${boards.length > 1 ? ` (and ${boards[1 - q]} on the other)` : ''}: one for each flat and room of the building (${m} in all), in rows of up to 40 (p99). A bundle of flex climbs the stair, one wire for each meter.`);
    });
    // the letterboxes: on the other side of the door (or past the second board)
    const big = m >= 20, lw = big ? 0.9 : 0.25, loff = -(0.5 + (boards.length > 1 ? 0.15 * Math.min(boards[1], 40) + 0.5 : 0) + lw / 2 + 0.1);
    fu.put(big ? 'letterboxes' : 'letterbox_metal', 'out', ox + ux * loff, d.y + (big ? 1.6 : 1.7), oz + uz * loff, ang, d.b, 0, r);
    add(`out:${d.b}`, big ? 'letterboxes' : 'letterbox_metal', ox + ux * loff, oz + uz * loff, 0.5, big ? 'The postman fills them on his round (p145).' : '');
    // the flex: from the top of the board up the wall to the flats, tacked to the wall, and at
    // each storey a few wires leave the bundle along the wall into a flat (U96); loops of flex
    // hang under the board (U98)
    const wb0 = 0.15 * Math.min(boards[0], 40) + 0.3, bx = ox + ux * (0.5 + wb0 / 2 + 0.1), bz = oz + uz * (0.5 + wb0 / 2 + 0.1);
    const yTop = d.y + 1.8 + Math.min(3, Math.ceil(boards[0] / 40)) * 0.3;
    flexUp(B, bx, bz, ux, uz, yTop, Math.max(3, Math.min(8, Math.round(m / 8))), r);
    for (let q = 0; q < 2; q++) {
      const s0 = (q ? 0.1 : -0.4) * wb0, s1 = s0 + 0.25 * wb0, yb = d.y + 1.8 - 0.02;
      tube(pipes.thin.at(0), hang([bx + ux * s0 + d.n[0] * 0.05, yb, bz + uz * s0 + d.n[1] * 0.05], [bx + ux * s1 + d.n[0] * 0.05, yb, bz + uz * s1 + d.n[1] * 0.05], 0.25 + r() * 0.2, 6), 0.008, 3, lin(FLEX[q * 2]), [d.b, 0, PIPE_KIND]);
    }
    add(`out:${d.b}`, 'flex_up', bx, bz, 0.6, '');
  }

  // The flex up the wall of building B from (x, z), the top of a board at yTop: n wires.
  function flexUp(B, x, z, ux, uz, yTop, n, r) {
    const wires = Array.from({ length: n }, (_, i) => ({ s: (i - (n - 1) / 2) * 0.022 + (r() - 0.5) * 0.01, o: 0.012 + r() * 0.02, col: lin(FLEX[Math.floor(r() * FLEX.length)]), live: true }));
    for (let k = 0; k < B.n; k++) {
      const nr = nearestOnRings(B.phaseOf(k).rings, x, z);
      if (!nr || nr.d > 1.0) break;
      const y0 = Math.max(yTop, B.y[k]), y1 = k === B.n - 1 ? B.y[k + 1] - 0.3 : B.y[k + 1];
      if (y1 <= y0) continue;
      // the wires that leave the bundle on this storey (not on the G/F)
      const leave = k === 0 ? 0 : Math.min(wires.filter((w) => w.live).length, 1 + Math.floor(r() * 3));
      let left = 0;
      for (const w of wires) {
        if (!w.live) continue;
        const px = nr.x + nr.nx * w.o + nr.ux * w.s, pz = nr.z + nr.nz * w.o + nr.uz * w.s;
        const out = left < leave && r() < 0.8;
        const yEnd = out ? B.y[k] + 1.9 + r() * 0.35 : y1;
        const pts = [];
        // tacked to the wall, a little crooked
        for (let y = y0; y < yEnd - 0.01; y += 1.2) {
          const y2 = Math.min(yEnd, y + 1.2), wob = (r() - 0.5) * 0.02;
          if (!pts.length) pts.push([px, y, pz]);
          pts.push([px + nr.ux * wob, y2, pz + nr.uz * wob]);
        }
        if (out) {
          // along the wall to a flat, and into the wall
          const dir = r() < 0.5 ? 1 : -1, l = 0.6 + r() * 2.2;
          const ex = px + nr.ux * dir * l, ez = pz + nr.uz * dir * l;
          pts.push(...hang([px, yEnd, pz], [ex, yEnd + 0.05, ez], 0.04 + r() * 0.05, 3).slice(1));
          pts.push([ex - nr.nx * w.o, yEnd + 0.05, ez - nr.nz * w.o]);
          w.live = false; left++;
        }
        if (pts.length > 1) tube(pipes.thin.at(k), roundCorners(pts, 0.03), 0.0075, 3, w.col, [B.id, k, PIPE_KIND]);
      }
      if (!wires.some((w) => w.live)) break;
    }
  }
  // ---- the lanes: the public lights ----
  const isLane = (k) => k >= 0 && k < L.N && L.inside[k] && S.laneNode[k] >= 0;
  const near = new Map(); // a lane cell -> the nearest building, for the pick
  const bOf = (k) => near.get(k) ?? near.set(k, nearest(L.cellX(k), L.cellZ(k))).get(k);
  // the lights: one every 8 m on the named lanes, one every 20 m on the other lanes (p103)
  const lamps = [];
  const lamp = (k, gap, dark) => {
    const x = L.cellX(k), z = L.cellZ(k);
    if (lamps.some(([lx, lz, lg]) => Math.hypot(lx - x, lz - z) < Math.min(gap, lg))) return;
    lamps.push([x, z, gap]);
    const along = isLane(k + 1) || isLane(k - 1), ang = along ? Math.PI / 2 : 0, b = bOf(k);
    const y = nodes[S.laneNode[k]].y + 2.45, kind = dark ? 'lane_lamp_dark' : 'lane_lamp';
    fu.put(kind, 'out', x, y, z, ang, b, 0, r);
    if (b >= 0) add(`out:${b}`, kind, x, z, 0.7, dark ? '' : 'More than 200 of these lights; the KFA kept them on all day and all night, because the lanes are dark at noon.');
  };
  for (const c of named) if (isLane(c)) lamp(c, 8, false);
  let small = 0;
  for (let k = 0; k < L.N; k++) if (isLane(k) && !named.has(k) && L.alley[k]) { const n0 = lamps.length; lamp(k, 20, small % 4 === 3); if (lamps.length > n0) small++; }

  // ---- refuse: the refuse points of the named lanes ----
  P.refuse_points?.list?.forEach((p, q) => {
    const [px, pz] = p.xz, b = p.nearest_stair_door_of ?? nearest(px, pz), ang = away(b, px, pz), y = laneY(px, pz, b);
    const [x, z] = back(px, pz, ang, 1.2);
    fu.put('refuse_bin', 'out', x, y, z, ang, b, 0, r);
    add(`out:${b}`, 'refuse_bin', px, pz, 1.2, 'The refuse collectors of the Urban Services Department take it away before dawn (from about 04:00, inferred).');
    if (q % 2 === 0) {
      const sx = px + Math.cos(ang) * 1.5, sz = pz - Math.sin(ang) * 1.5;
      fu.put('usd_buckets', 'out', sx, y, sz, ang, b, 0, r);
      add(`out:${b}`, 'usd_buckets', sx, sz, 0.5, '');
    }
  });

  // ---- the pipes and cables into the floor layers, and their words for the pick ----
  // the G/F layer holds the most: in tiles of 40 m, thus a near view draws only its part
  const parts = (k, A) => (k === 0 ? tiles(A.typed(), 40) : [A.typed()]);
  for (const [k, A] of pipes.thick.m) for (const a of parts(k, A)) fu.layers.addLayer(k, a, { shadow: true });
  for (const [k, A] of pipes.thin.m) for (const a of parts(k, A)) fu.layers.addLayer(k, a, { shadow: false, tier: 1 }); // thin: near the camera only
  fu.layers.addSpan(pipes.spans.typed());
  for (const [key, t] of pipes.items) if (t.x !== undefined) add(key, t.kind, t.x, t.z, t.r, '', { k0: t.k0, k1: t.k1 });
  fu.pipeVerts = pipes.thick.verts + pipes.thin.verts + pipes.spans.size;
}
