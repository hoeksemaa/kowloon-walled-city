// The things in the rooms and on the roofs: beds, bunks, altars, stoves, machines, sacks,
// dental chairs, aerials, laundry, pot plants. data/furnishings.json gives, from the sources,
// what stood in each kind of room (its "recipes"), the documented rooms with their own
// contents, and the roofs; this file puts each thing at a free place of the room, against a
// wall, in a corner, by the door or in the middle, and draws it as a few simple solids.
//
// The things go with the floor layers of src/cityLayers.js: they rise with their layer, go
// with the layers over a peeled storey, and show inside a building only where the floor shows
// (pulled apart, or the peeled storey). They are drawn with instancing, one mesh for each kind
// of thing, and the shader lifts each one with its layer (as src/life/figures.js does). The
// rooms are furnished a few at a time after the page loads, a layer at a time from G/F up. The
// small things (a calendar, a clock, a pot plant) show only near the camera. The structure is
// frozen: this file only reads it, and puts nothing in src/city.
//
// The colours are this file's (the data holds materials as words). Where each thing stands in a
// room, and the colour of each plastic stool or quilt, are INFERRED.
import * as THREE from 'three';
import { SLAB } from '../city/model.js';
import { CORR, LANDING, FLIGHT } from '../city/plan.js';
import { toAW } from '../city/poly.js';
import { mulberry32 } from '../util.js';
import { placeUtilities } from './utilities.js';

const PIGEON_ROOF = 59;
export const ITEM_KIND = 9; // the kind of a thing in aInfo (cityLayers.js: the pick gives layer + 16 kind)
const G = 0.25; // the cells of the plans (src/city/plan.js)

// The colours of the materials (sRGB). Lists: one is picked for each thing.
const MAT = {
  wood: ['#8a6a48', '#7a5c3e', '#9a7a52'], dark_wood: ['#5a4030', '#4e3628'], red_lacquer: ['#9a2a20', '#a8321f'], lacquer: ['#9a2a20'],
  metal: ['#7c8086', '#6e7378'], steel: ['#8a9096', '#7a8288'], galvanised: ['#a4aaa8'], aluminium: ['#c4c8cc'],
  plastic: ['#c8402e', '#2f6fae', '#3f8f4a', '#e08aa0', '#e0b830', '#e8e4da'], rubber: ['#2a2a2a'],
  cloth: ['#c8b8a0', '#8aa0b8', '#b88a8a', '#a0b090', '#d8d0c0'], quilt: ['#d88a8a', '#8aa8d0', '#e0c080', '#c0a0c8', '#e8d8c8'],
  paper: ['#e8e0cc', '#d8cfb8'], red_paper: ['#c03028'], tile: ['#d8d4c8', '#c8d8d0', '#e0c8c8'], porcelain: ['#ecebe6'],
  glass: ['#a8c0c8'], concrete: ['#9a968e'], rattan: ['#b89a62'], bamboo: ['#c0a86a'], stainless: ['#b8bcc0'],
  enamel: ['#e8e6dc', '#dce4e0'], flour: ['#f0ece0'], food: ['#c89a5a', '#d8b070'], plant: ['#4f7a3a', '#5f8a42', '#3e6a32'],
  screen: ['#2a3034'], light: ['#f4f0dc'], corrugated: ['#8e928c', '#9a8c78'],
};
const lin = (hex) => new THREE.Color(hex);

// The parts of each kind, in metres, in its own frame: x along the wall (width w), y up (height
// h), z out of the wall into the room (depth d), from 0 at the wall. A part: [x0, x1, y0, y1,
// z0, z1, material slot (0: first material, 1: second, 2: a picked accent, or a material
// name), shape ('b' box, 'c' 8-sided cylinder)].
const box = (x0, x1, y0, y1, z0, z1, m = 0, s = 'b') => [x0, x1, y0, y1, z0, z1, m, s];
const legs = (w, d, h, t = 0.04, m = 0) => [box(0, t, 0, h, 0, t, m), box(w - t, w, 0, h, 0, t, m), box(0, t, 0, h, d - t, d, m), box(w - t, w, 0, h, d - t, d, m)];
const SHAPE = {
  table: (w, d, h) => [box(0, w, h - 0.04, h, 0, d), ...legs(w, d, h - 0.04)],
  round_table: (w, d, h) => [box(0, w, h - 0.04, h, 0, d, 0, 'c'), box(w / 2 - 0.05, w / 2 + 0.05, 0, h - 0.04, d / 2 - 0.05, d / 2 + 0.05)],
  mahjong_table: (w, d, h) => [box(0, w, h - 0.05, h, 0, d, 'cloth'), ...legs(w, d, h - 0.05)],
  desk: (w, d, h) => [box(0, w, h - 0.04, h, 0, d), box(w * 0.6, w, 0, h - 0.04, 0, d), box(0, 0.04, 0, h - 0.04, 0, d)],
  school_desk: (w, d, h) => [box(0, w, h - 0.04, h, 0, d), ...legs(w, d, h - 0.04)],
  workbench: (w, d, h) => [box(0, w, h - 0.06, h, 0, d), ...legs(w, d, h - 0.06), box(0, w, 0.15, 0.18, 0, d)],
  stool: (w, d, h) => [box(0, w, h - 0.04, h, 0, d, 2, 'c'), box(w * 0.2, w * 0.8, 0, h - 0.04, d * 0.2, d * 0.8, 2)],
  chair: (w, d, h) => [box(0, w, 0.42, 0.46, 0, d, 2), ...legs(w, d, 0.42, 0.03), box(0, w, 0.46, h, 0, 0.04, 2)],
  bench: (w, d, h) => [box(0, w, h - 0.05, h, 0, d), box(0.05, 0.1, 0, h - 0.05, 0, d), box(w - 0.1, w - 0.05, 0, h - 0.05, 0, d)],
  sofa: (w, d, h) => [box(0, w, 0, 0.42, 0, d, 2), box(0, w, 0.42, h, 0, 0.18, 2), box(0, 0.15, 0.42, 0.6, 0, d, 2), box(w - 0.15, w, 0.42, 0.6, 0, d, 2)],
  pews: (w, d, h) => [box(0, w, 0.42, 0.46, 0, d), box(0, w, 0.46, h, 0, 0.05), box(0, 0.05, 0, 0.42, 0, d), box(w - 0.05, w, 0, 0.42, 0, d)],
  bed: (w, d, h) => [box(0, w, 0, h * 0.7, 0, d), box(0.02, w - 0.02, h * 0.7, h, 0.02, d - 0.02, 2)],
  clinic_bed: (w, d, h) => [box(0, w, h - 0.12, h, 0, d, 1), ...legs(w, d, h - 0.12)],
  bunk: (w, d, h) => [
    box(0, 0.05, 0, h, 0, 0.05), box(w - 0.05, w, 0, h, 0, 0.05), box(0, 0.05, 0, h, d - 0.05, d), box(w - 0.05, w, 0, h, d - 0.05, d),
    box(0, w, 0.3, 0.36, 0, d), box(0.03, w - 0.03, 0.36, 0.5, 0.03, d - 0.03, 2),
    box(0, w, h - 0.45, h - 0.39, 0, d), box(0.03, w - 0.03, h - 0.39, h - 0.25, 0.03, d - 0.03, 2)],
  cot: (w, d, h) => [box(0, w, 0, 0.45, 0, d), box(0.02, w - 0.02, 0.45, 0.6, 0.02, d - 0.02, 2), box(0, w, h - 0.03, h, d - 0.03, d, 1), box(0, w, 0.6, h - 0.1, d - 0.02, d, 'cloth')],
  cockloft: (w, d) => [box(0, w, 1.95, 2.07, 0, d), box(0.1, 0.18, 0, 1.95, d - 0.08, d), box(w - 0.18, w - 0.1, 0, 1.95, d - 0.08, d), box(0.1, w - 0.1, 2.07, 2.3, 0.1, d - 0.1, 2)],
  partition: (w, d, h) => [box(0, w, 0, h, 0, Math.max(d, 0.03))],
  cabinet: (w, d, h) => [box(0, w, 0, h, 0, d), box(w / 2 - 0.005, w / 2 + 0.005, 0.1, h - 0.1, d, d + 0.01, 1)],
  shelf: (w, d, h) => [box(0, 0.03, 0, h, 0, d), box(w - 0.03, w, 0, h, 0, d), ...[0.1, 0.55, 1.0, 1.45, h - 0.03].map((y) => box(0, w, y, y + 0.03, 0, d)), box(0.05, w - 0.05, 0.13, 0.4, 0.05, d - 0.05, 2), box(0.05, w * 0.6, 1.03, 1.3, 0.05, d - 0.05, 2)],
  rack: (w, d, h) => [box(0, 0.04, 0, h, 0, d), box(w - 0.04, w, 0, h, 0, d), ...[0.4, 0.9, 1.4].map((y) => box(0, w, y, y + 0.03, 0, d)), box(0.05, w - 0.05, 0.43, 0.6, 0.05, d - 0.05, 'food')],
  counter: (w, d, h) => [box(0, w, 0, h - 0.04, 0, d), box(-0.02, w + 0.02, h - 0.04, h, -0.02, d + 0.02, 1)],
  glass_case: (w, d, h) => [box(0, w, 0, 0.5, 0, d, 1), box(0.02, w - 0.02, 0.5, h, 0.02, d - 0.02, 'glass')],
  drawers: (w, d, h) => [box(0, w, 0, h, 0, d), ...[0.3, 0.6, 0.9, 1.2, 1.5].map((y) => box(0.02, w - 0.02, y, y + 0.012, d, d + 0.01, 'dark_wood'))],
  boxes: (w, d, h, r) => { const n = 1 + Math.floor(r() * 3); return Array.from({ length: n }, (_, i) => box(0.02 * i, w - 0.02 * i, h * i, h * (i + 1), 0, d)); },
  crates: (w, d, h, r) => { const n = 1 + Math.floor(r() * 3); return Array.from({ length: n }, (_, i) => box(0, w, h * i, h * (i + 1) - 0.01, 0, d, 2)); },
  sacks: (w, d, h, r) => { const n = 1 + Math.floor(r() * 2); return Array.from({ length: n }, (_, i) => box(0.02, w - 0.02, (h * 0.5) * i, h * 0.5 * (i + 1), 0.02 * i, d - 0.02 * i)); },
  jars: (w, d, h) => [0, 1, 2].map((i) => box((w / 3) * i + 0.02, (w / 3) * (i + 1) - 0.02, 0.85, 0.85 + h, 0, d, 0, 'c')),
  altar: (w, d, h) => [box(0, w, 1.45, 1.45 + h, 0, d, 0), box(w * 0.4, w * 0.6, 1.45 + 0.05, 1.45 + 0.15, d * 0.6, d * 0.9, 'light')],
  shrine_door: (w, d, h) => [box(0, w, 0, h, 0, d), box(w * 0.35, w * 0.65, 0.05, 0.15, d, d + 0.05, 'light')],
  calendar: (w, d, h) => [box(0, w, 1.3, 1.3 + h, 0, 0.01)],
  clock: (w, d, h) => [box(0, w, 1.9, 1.9 + h, 0, 0.04, 0, 'c')],
  mirror: (w, d, h) => [box(0, w, 0.9, 0.9 + h, 0, 0.03)],
  couplet: (w, d, h) => [box(0, 0.25, 0.6, 0.6 + h, 0, 0.01), box(w - 0.25, w, 0.6, 0.6 + h, 0, 0.01)],
  blackboard: (w, d, h) => [box(0, w, 0.9, 0.9 + h, 0, 0.04)],
  lantern: (w, d, h) => [box(0, w, 2.0 - h, 2.0, 0, d, 0, 'c')],
  stove: (w, d, h) => [box(0, w, 0, h - 0.08, 0, d), box(w * 0.2, w * 0.55, h - 0.08, h, d * 0.25, d * 0.75, 1, 'c'), box(w * 0.25, w * 0.5, h, h + 0.18, d * 0.3, d * 0.7, 'metal', 'c')],
  wok_stove: (w, d, h) => [box(0, w, 0, h, 0, d), box(w * 0.1, w * 0.45, h, h + 0.12, d * 0.2, d * 0.8, 'rubber', 'c'), box(w * 0.55, w * 0.9, h, h + 0.12, d * 0.2, d * 0.8, 'rubber', 'c')],
  sink: (w, d, h) => [box(0, w, 0, h - 0.15, 0, d), box(0.05, w - 0.05, h - 0.15, h, 0.05, d - 0.05, 1)],
  toilet: (w, d, h) => [box(0, w, 0, h, 0.1, d), box(-0.3, 0.02, 0, 1.6, 0, d + 0.3, 'tile'), box(w - 0.02, w + 0.3, 0, 1.6, 0, d + 0.3, 'tile')],
  washtub: (w, d, h) => [box(0, w, 0, h, 0, d, 2, 'c')],
  water_drum: (w, d, h) => [box(0, w, 0, h, 0, d, 2, 'c')],
  bucket: (w, d, h) => [box(0, w, 0, h, 0, d, 2, 'c')],
  vat: (w, d, h) => [box(0, w, 0, h, 0, d, 2, 'c')],
  steamer: (w, d, h) => [box(0, w, 0.8, 0.8 + h, 0, d, 0, 'c'), box(-0.05, w + 0.05, 0, 0.8, -0.05, d + 0.05, 'concrete')],
  oven: (w, d, h) => [box(0, w, 0, h, 0, d, 0, 'c')],
  incense_burner: (w, d, h) => [box(0, w, 0, h, 0, d, 0, 'c')],
  plant_pot: (w, d, h) => [box(0, w, 0, h * 0.5, 0, d, 0, 'c'), box(-0.05, w + 0.05, h * 0.5, h * 1.3, -0.05, d + 0.05, 'plant', 'c')],
  tv: (w, d, h) => [box(0, w, 0, 0.7, 0, d, 'dark_wood'), box(0.02, w - 0.02, 0.7, 0.7 + h, 0.02, d - 0.02), box(0.06, w - 0.06, 0.74, 0.7 + h - 0.06, d - 0.02, d - 0.01, 'screen')],
  radio: (w, d, h) => [box(0, w, 0.9, 0.9 + h, 0, d)],
  telephone: (w, d, h) => [box(0, w, 0.76, 0.76 + h, 0, d)],
  fan: (w, d, h) => [box(w / 2 - 0.03, w / 2 + 0.03, 0, h * 2.2, d / 2 - 0.03, d / 2 + 0.03, 1), box(0, w, h * 2.2, h * 2.2 + w, d / 2 - 0.05, d / 2 + 0.05, 0, 'c')],
  fridge: (w, d, h) => [box(0, w, 0, h, 0, d), box(w - 0.08, w - 0.05, h * 0.5, h * 0.8, d, d + 0.03, 'metal')],
  aircon: (w, d, h) => [box(0, w, 1.7, 1.7 + h, 0, d)],
  lamp: (w, d, h) => [box(0, w, 0, h, 0, d, 'light')],
  sewing_machine: (w, d, h) => [box(0, w, h - 0.04, h, 0, d, 1), ...legs(w, d, h - 0.04, 0.04, 0), box(w * 0.2, w * 0.7, h, h + 0.3, d * 0.3, d * 0.6, 0)],
  machine: (w, d, h) => [box(0, w, 0, h * 0.6, 0, d), box(w * 0.15, w * 0.85, h * 0.6, h, d * 0.2, d * 0.8, 2)],
  press: (w, d, h) => [box(0, w, 0, h * 0.5, 0, d), box(w * 0.1, w * 0.9, h * 0.5, h * 0.8, 0, d * 0.6, 2), box(w * 0.35, w * 0.65, h * 0.8, h, d * 0.1, d * 0.4, 0, 'c')],
  lathe: (w, d, h) => [box(0, w, h * 0.6, h * 0.75, 0, d), box(0, w * 0.3, h * 0.75, h, 0, d, 2), box(0.05, 0.15, 0, h * 0.6, 0.05, d - 0.05), box(w - 0.15, w - 0.05, 0, h * 0.6, 0.05, d - 0.05)],
  loom: (w, d, h) => [box(0, 0.08, 0, h, 0, d), box(w - 0.08, w, 0, h, 0, d), box(0, w, h - 0.1, h, 0, d), box(0.08, w - 0.08, 0.6, 0.8, 0.1, d - 0.1, 'cloth', 'c')],
  knitting_machine: (w, d, h) => [box(0, w, h - 0.15, h, 0, d), ...legs(w, d, h - 0.15)],
  noodle_machine: (w, d, h) => [box(0, w, 0, h * 0.55, 0, d), box(w * 0.1, w * 0.9, h * 0.55, h, d * 0.2, d * 0.8, 1, 'c'), box(w * 0.2, w * 0.8, h * 0.55 + 0.02, h * 0.7, d * 0.75, d * 0.9, 'flour')],
  mixer: (w, d, h) => [box(0, w, 0, h * 0.7, 0, d, 0, 'c'), box(w * 0.4, w * 0.6, h * 0.7, h, d * 0.4, d * 0.6)],
  dental_chair: (w, d, h) => [box(w * 0.3, w * 0.7, 0, 0.45, d * 0.3, d * 0.7, 0), box(0, w, 0.45, 0.6, d * 0.25, d, 1), box(0, w, 0.6, h, d * 0.85, d, 1), box(w * 0.25, w * 0.75, 0.3, 0.45, 0, d * 0.25, 1)],
  dental_light: (w, d, h) => [box(0, 0.06, 0, h, 0, 0.06), box(0, w, h - 0.05, h, 0, 0.06), box(w - 0.2, w, h - 0.25, h - 0.05, 0, d, 'light')],
  barber_chair: (w, d, h) => [box(w * 0.3, w * 0.7, 0, 0.4, d * 0.3, d * 0.7, 0), box(0, w, 0.4, 0.55, 0, d, 1), box(0, w, 0.55, h, d - 0.12, d, 1)],
  lectern: (w, d, h) => [box(w * 0.3, w * 0.7, 0, h - 0.1, d * 0.3, d * 0.7), box(0, w, h - 0.12, h, 0, d)],
  pigeon_loft: (w, d, h) => [box(0, w, 0, 0.5, 0, d, 0), box(0, w, 0.5, h, 0, d, 'galvanised'), box(-0.05, w + 0.05, h, h + 0.06, -0.05, d + 0.05, 0)],
  birdcage: (w, d, h) => [box(0, w, 1.6, 1.6 + h, 0, d, 0, 'c')],
  clothes_rack: (w, d, h) => [box(0, 0.03, 0, h, 0, 0.03, 'metal'), box(w - 0.03, w, 0, h, 0, 0.03, 'metal'), box(0, w, h - 0.03, h, 0, 0.03, 'metal'), box(0.05, w - 0.05, h * 0.35, h - 0.05, 0, 0.02, 2)],
  laundry_pole: (w, d, h, r) => [box(0, 0.05, 0, 1.9, 0, 0.05, 'bamboo'), box(w - 0.05, w, 0, 1.9, 0, 0.05, 'bamboo'), box(0, w, 1.85, 1.9, 0, 0.05, 'bamboo'),
    ...[0.1, 0.45, 0.8, 1.2, 1.55].filter(() => r() < 0.8).map((x) => box(x * (w / 2), x * (w / 2) + 0.3, 1.25 + r() * 0.2, 1.85, 0, 0.02, 2))],
  tv_aerial: (w, d, h) => [box(0, 0.04, 0, h, 0, 0.04, 'aluminium'), box(-w / 2, w / 2, h - 0.05, h - 0.02, 0, 0.02, 'aluminium'), box(-w * 0.4, w * 0.4, h - 0.45, h - 0.42, 0, 0.02, 'aluminium'), box(-w * 0.3, w * 0.3, h - 0.85, h - 0.82, 0, 0.02, 'aluminium')],
  sign: (w, d, h) => [box(0, w, 0, h, 0, d)],
  window_cage: (w, d, h) => [box(0, w, 0, 0.05, 0, d), box(0, w, h - 0.05, h, 0, d), box(0, 0.04, 0, h, d - 0.04, d), box(w - 0.04, w, 0, h, d - 0.04, d),
    ...[0.25, 0.5, 0.75].map((t) => box(w * t - 0.015, w * t + 0.015, 0, h, d - 0.02, d)), box(0, w, h * 0.45, h * 0.45 + 0.03, d - 0.03, d)],
  awning: (w, d) => [box(0, w, 0, 0.05, 0, d, 2)],
  washing_machine: (w, d, h) => [box(0, w, 0, h, 0, d)],
  freezer: (w, d, h) => [box(0, w, 0, h, 0, d)],
  ladder: (w, d, h) => [box(0, 0.05, 0, h, 0, 0.05), box(w - 0.05, w, 0, h, 0, 0.05), ...[0.3, 0.6, 0.9, 1.2, 1.5, 1.8].filter((y) => y < h).map((y) => box(0, w, y, y + 0.03, 0, 0.04))],
  letterbox: (w, d, h) => [box(0, w, 1.0, 1.0 + h, 0, d)],
  roof_hut: (w, d, h) => [box(0, w, 0, h, 0, d), box(-0.1, w + 0.1, h, h + 0.05, -0.1, d + 0.1, 'galvanised')],
};
// The height over the floor where a thing of a 'wall' place hangs, when its shape does not say.
const CEILING = new Set(['lamp']);
// Things that stand by a wall, not in the open floor, whatever the recipe says.
const AT_WALL = new Set(['calendar', 'clock', 'mirror', 'couplet', 'blackboard', 'altar', 'aircon', 'shelf', 'cabinet', 'drawers', 'fridge', 'tv', 'sink', 'stove', 'clothes_rack', 'bunk', 'bed']);
// The words of a place name that tell its trade, for the variants of data/furnishings.json.
const TRADE = {
  noodle: ['noodle', '麵'], cake: ['cake', 'bakery', 'biscuit', 'pastry', '餅'], roast_meat: ['roast', 'siu mei', '燒'], fishball: ['fishball', 'fish ball', '魚蛋', '魚丸'],
  metalwork: ['metal', 'iron', 'steel', 'lathe'], jewellery: ['jewel', 'gold', 'watch'], electrical: ['electric', 'electronic', 'radio'], plating: ['plating', 'electroplat'],
  shoes: ['shoe', 'leather'], knitting: ['knit'], weaving: ['weav', 'muslin', 'cloth', 'textile'], sewing: ['sew', 'garment', 'tailor', 'clothing'],
  handbag: ['handbag', 'bag'], paper: ['paper', 'print', 'box'], temple: ['temple', '廟'], church: ['church', 'mission', 'chapel', 'gospel'],
  cafe: ['café', 'cafe', 'tea', '茶'], restaurant: ['restaurant', '飯店', '酒家'], dai_pai_dong: ['dai pai dong', 'stall', '大牌檔'], hair: ['barber', 'hair', '理髮'],
  utility: ['standpipe', 'toilet', 'well', 'transformer', 'water'],
};
// Things that take no floor (they hang high, or are thin).
const NO_FLOOR = new Set(['lamp', 'calendar', 'clock', 'mirror', 'couplet', 'blackboard', 'altar', 'aircon', 'cockloft', 'birdcage', 'lantern', 'radio']);

// The kinds whose shape has a random part (a heap of boxes, the washing on a line): three
// shapes of each.
const RANDOM = new Set(['boxes', 'crates', 'sacks', 'laundry_pole']);
// The things that show only near the camera: the small things (under 0.5 m across, and the
// things on the walls) under NEAR_M metres of the view for each pixel, the things under 1 m
// across under MID_M. The large things always show.
const DECOR = new Set(['calendar', 'clock', 'couplet', 'telephone', 'radio', 'mirror', 'incense_burner', 'birdcage', 'letterbox', 'lantern', 'lamp', 'fan', 'jars', 'altar', 'blackboard']);
const NEAR_M = 0.07, MID_M = 0.16;
const WHITE = { r: 1, g: 1, b: 1 };

// The geometry of the parts of one kind: position, normal, colour (the accent parts white),
// and aAcc (1 on an accent part: its colour comes from each thing).
function protoGeometry(parts, colourOf) {
  const P = [], N = [], C = [], A = [], idx = [];
  const put = (x, y, z, nx, ny, nz, col, acc) => { P.push(x, y, z); N.push(nx, ny, nz); C.push(col.r, col.g, col.b); A.push(acc); };
  for (const [x0, x1, y0, y1, z0, z1, m, shape] of parts) {
    // slot 2: the accent of each thing; slot 3: a light that glows (its colour is the accent)
    const acc = m === 2 ? 1 : m === 3 ? 2 : 0, col = acc ? WHITE : colourOf(m);
    if (shape === 'c') {
      const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, rx = (x1 - x0) / 2, rz = (z1 - z0) / 2, n = 6;
      for (let q = 0; q < n; q++) {
        const a0 = (q / n) * Math.PI * 2, a1 = ((q + 1) / n) * Math.PI * 2, am = (a0 + a1) / 2, o = P.length / 3;
        const xa = cx + Math.cos(a0) * rx, za = cz + Math.sin(a0) * rz, xb = cx + Math.cos(a1) * rx, zb = cz + Math.sin(a1) * rz;
        const nx = Math.cos(am), nz = Math.sin(am);
        put(xa, y0, za, nx, 0, nz, col, acc); put(xb, y0, zb, nx, 0, nz, col, acc); put(xb, y1, zb, nx, 0, nz, col, acc); put(xa, y1, za, nx, 0, nz, col, acc);
        idx.push(o, o + 2, o + 1, o, o + 3, o + 2);
        const t = P.length / 3;
        put(cx, y1, cz, 0, 1, 0, col, acc); put(xa, y1, za, 0, 1, 0, col, acc); put(xb, y1, zb, 0, 1, 0, col, acc);
        idx.push(t, t + 2, t + 1);
      }
      continue;
    }
    const F = [
      [[1, 0, 0], [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]]],
      [[-1, 0, 0], [[x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [x0, y0, z0]]],
      [[0, 1, 0], [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]]],
      [[0, 0, 1], [[x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [x0, y0, z1]]],
      [[0, 0, -1], [[x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]]],
    ];
    for (const [n, vs] of F) {
      const o = P.length / 3;
      for (const v of vs) put(v[0], v[1], v[2], n[0], n[1], n[2], col, acc);
      idx.push(o, o + 1, o + 2, o, o + 2, o + 3);
    }
  }
  const g = new THREE.InstancedBufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  g.setAttribute('aAcc', new THREE.Float32BufferAttribute(A, 1));
  g.setIndex(idx);
  return g;
}

// The vertex code of a thing: iPos (x, y, z, turn), iInfo (building, layer, kind, 1 in a room or
// 0 on a roof or outside), iCol (the accent colour, and the tint of the rest), iScl (its scale:
// the length of a run of pipes, the width of a meter board). A thing of a layer over the
// peeled storey, or of a room whose floor does not show, goes to one point far under the City.
const THING_GLSL = `
attribute vec4 iPos; attribute vec4 iInfo; attribute vec4 iCol; attribute vec3 iScl; attribute float aAcc;
uniform float uLift[16]; uniform float uShowIn[16]; uniform float uPeelK;
varying vec3 vInfo; varying float vGlow;
bool thingHidden() { int L = int(iInfo.y + 0.5); return (uPeelK > -0.5 && iInfo.y > uPeelK + 0.5) || (iInfo.w > 0.5 && uShowIn[L] < 0.5); }
vec3 thingTurn(vec3 p) { float c = cos(iPos.w), s = sin(iPos.w); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }
vec3 thingPos(vec3 p) { if (thingHidden()) return iPos.xyz - vec3(0.0, 2000.0, 0.0); int L = int(iInfo.y + 0.5); return thingTurn(p * iScl) + iPos.xyz + vec3(0.0, uLift[L], 0.0); }
`;

export class Furnish {
  // F: data/furnishings.json; uses: the room uses (src/roomUses.js); layers: CityLayers.
  // U: data/utilities.json (the tanks, pumps, standpipes, meter boards, pipes, lamps, refuse).
  constructor(S, uses, F, layers, U = null) {
    this.S = S; this.uses = uses; this.F = F; this.layers = layers;
    this.kinds = F?.kinds || {};
    this.facts = new Map([...(F?.facts || []), ...(U?.facts || [])].map((f) => [f.id, f]));
    this.blocked = new Map(); // b -> [[x, z, r]]: the roof of b is taken there (a tank)
    this.cols = {};
    for (const [m, list] of Object.entries(MAT)) this.cols[m] = list.map(lin);
    this.items = new Map(); // "b:k:u" or "roof:b" -> [{ kind, x, z, r, facts, basis, why }]
    this.protos = new Map(); // a kind (and a shape) -> { geo, n, pos, info, col, layerEnd, mesh, twin }
    this.U = {
      uLift: { value: new Float32Array(16) }, uShowIn: { value: new Float32Array(16) }, uPeelK: { value: -10 },
      uSel: layers.U.uSel, uHi: layers.U.uHi,
    };
    this.material = this.viewMaterial();
    this.pickMat = this.pickMaterial();
    this.group = new THREE.Group();
    // the rooms to furnish, a layer at a time from G/F up
    this.queue = [];
    for (const [key, r] of uses.at) {
      const [b, k, u] = key.split(':').map(Number), B = S.list[b];
      if (k < B.n) this.queue.push({ b, k, u, key, cat: r.cat, place: r.place });
    }
    this.queue.sort((p, q) => p.k - q.k || p.b - q.b || p.u - q.u);
    this.qi = 0;
    this.doneTo = -1; // the layers up to this one are furnished
    if (U) placeUtilities(this, U);
    this.buildRoofs();
    this.flush();
  }

  // More colours of materials (sRGB), for the utilities.
  addColours(o) { for (const [m, list] of Object.entries(o)) this.cols[m] = list.map(lin); }

  colour(name, r) {
    const list = this.cols[name] || this.cols[name?.replace(/s$/, '')] || this.cols[name?.split(' ')[0]] || this.cols.wood;
    return r ? list[Math.floor(r() * list.length)] : list[0];
  }

  // The store of the things of one kind (and shape): where is 'room' (the rooms: in the order of
  // their layers), 'roof' or 'out' (the lanes, the walls outside).
  proto(kind, where, r) {
    const K0 = this.kinds[kind] || {}, nv = K0.variants || (RANDOM.has(kind) ? 3 : 1);
    const v = nv > 1 ? Math.floor(r() * nv) : 0, key = `${where}:${kind}:${v}`, roof = where !== 'room';
    let P = this.protos.get(key);
    if (!P) {
      const K = this.kinds[kind] || {}, [w, d, h] = K.size || [0.5, 0.5, 0.5];
      const mats = String(K.material || 'wood').split(/,\s*/);
      const parts = (K.parts || SHAPE[kind] || ((ww, dd, hh) => [box(0, ww, 0, hh, 0, dd)]))(w, d, h, mulberry32(v * 977 + 13));
      for (const q of parts) { q[0] -= w / 2; q[1] -= w / 2; }
      const geo = protoGeometry(parts, (m) => (m === 0 ? this.colour(mats[0]) : m === 1 ? this.colour(mats[1] || mats[0]) : this.colour(m)));
      // the accent: the quilt of a bed, the plastic of a stool or a drum, the washing on a line
      const accent = mats.includes('quilt') ? 'quilt' : mats.includes('plastic') ? 'plastic' : mats.includes('cloth') || kind === 'laundry_pole' || kind === 'clothes_rack' ? 'cloth' : mats[0];
      P = { key, kind, roof, geo, accent: K.accent || accent, n: 0, sent: 0, pos: [], info: [], col: [], scl: [], layerEnd: new Array(this.doneTo + 1).fill(0), mesh: null, twin: null };
      this.protos.set(key, P);
    }
    return P;
  }

  // A thing of kind `kind` at (x, y, z), turned by ang (its z axis, out of the wall, goes to
  // (sin ang, cos ang)), in layer k of building b.
  // where: 'room', 'roof' or 'out'; scl: the scale [x, y, z], or none.
  put(kind, where, x, y, z, ang, b, k, r, scl = null) {
    const P = this.proto(kind, where, r), c = this.colour(P.accent, r), t = 0.86 + r() * 0.2;
    P.pos.push(x, y, z, ang); P.info.push(b, k, ITEM_KIND, where === 'room' ? 1 : 0); P.col.push(c.r, c.g, c.b, t);
    if (scl) P.scl.push(scl[0], scl[1], scl[2]); else P.scl.push(1, 1, 1);
    P.n++;
  }

  // Send the things made since the last flush to the GPU: a new geometry for each kind with
  // new things (the old one is disposed of; the parts of the kind are shared).
  flush() {
    for (const P of this.protos.values()) {
      if (P.n === P.sent) continue;
      const g = new THREE.InstancedBufferGeometry(), base = P.geo;
      for (const name of ['position', 'normal', 'color', 'aAcc']) g.setAttribute(name, base.getAttribute(name));
      g.setIndex(base.getIndex());
      g.setAttribute('iPos', new THREE.InstancedBufferAttribute(new Float32Array(P.pos), 4));
      g.setAttribute('iInfo', new THREE.InstancedBufferAttribute(new Float32Array(P.info), 4));
      g.setAttribute('iCol', new THREE.InstancedBufferAttribute(new Float32Array(P.col), 4));
      g.setAttribute('iScl', new THREE.InstancedBufferAttribute(new Float32Array(P.scl), 3));
      g.instanceCount = P.n;
      P.sent = P.n;
      if (!P.mesh) {
        P.mesh = new THREE.Mesh(g, this.material);
        P.mesh.frustumCulled = false;
        P.mesh.receiveShadow = true;
        const [w, d] = this.kinds[P.kind]?.size || [0.5, 0.5];
        P.mesh.userData.tier = this.kinds[P.kind]?.tier ?? (P.roof && P.kind !== 'plant_pot' ? 0 : DECOR.has(P.kind) || Math.max(w, d) < 0.5 ? 2 : Math.max(w, d) < 1 ? 1 : 0);
        this.group.add(P.mesh);
        P.twin = new THREE.Mesh(g, this.pickMat);
        P.twin.frustumCulled = false;
        this.layers.pickScene.add(P.twin);
      } else {
        const old = P.mesh.geometry;
        P.mesh.geometry = P.twin.geometry = g;
        if (old !== base) old.dispose();
      }
      P.cur = g;
    }
  }

  // The material of the view: Lambert, with the selected building warm and the building under
  // the pointer lighter (as in src/cityLayers.js).
  viewMaterial() {
    const m = new THREE.MeshLambertMaterial({ vertexColors: true });
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, this.U);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>\n${THING_GLSL}`)
        .replace('#include <beginnormal_vertex>', 'vec3 objectNormal = thingTurn(normal);')
        .replace('#include <begin_vertex>', 'vec3 transformed = thingPos(position); vInfo = iInfo.xyz;')
        .replace('#include <color_vertex>', 'vColor = color * mix(vec3(iCol.w), iCol.rgb, min(aAcc, 1.0)); vGlow = step(1.5, aAcc);');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vInfo; varying float vGlow; uniform float uSel; uniform float uHi;')
        .replace('#include <dithering_fragment>', `#include <dithering_fragment>
  gl_FragColor.rgb = mix(gl_FragColor.rgb, vColor * 1.1, vGlow);
  if (abs(vInfo.x - uSel) < 0.5) gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.98, 0.72, 0.36), 0.32);
  else if (abs(vInfo.x - uHi) < 0.5) gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0, 0.95, 0.85), 0.25);`);
    };
    m.customProgramCacheKey = () => 'kwc-things';
    return m;
  }

  // The pick: the building + 1 (red and green), the layer + 16 kind (blue), as in cityLayers.js.
  pickMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: this.U,
      vertexShader: `${THING_GLSL}\nvoid main() { vInfo = iInfo.xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(thingPos(position), 1.0); }`,
      fragmentShader: `varying vec3 vInfo;\nvoid main() { float id = vInfo.x + 1.0;
  gl_FragColor = vec4(mod(id, 256.0) / 255.0, floor(id / 256.0) / 255.0, (vInfo.y + 16.0 * vInfo.z) / 255.0, 1.0); }`,
    });
  }

  // The recipe of a unit: a documented room's own list, else the recipe of its use (a home by
  // its type, from the rules of data/furnishings.json "home_types").
  recipeOf(U, B, unit, r) {
    const own = this.F?.rooms?.[U.key];
    if (own) return { id: `room ${U.key}`, items: own.items.map((x) => ({ ...x, n: [x.n ?? 1, x.n ?? 1], p: 1, basis: 'sourced' })), note: own.note };
    const R = this.F?.recipes || {};
    let t = U.cat;
    if (U.cat === 'home') {
      const a = unit.area;
      t = 'home_family_flat';
      if (U.k === 0) t = 'home_ground';
      else if (unit.kind === 'room' || a < 10) t = 'home_one_room';
      else if (a >= 25) t = r() < 0.5 ? 'home_divided_flat' : 'home_family_flat';
      else if (a >= 15 && r() < 0.03) t = 'home_bedspace_room';
    }
    const rec = R[t];
    if (!rec) return null;
    let items = rec.items || [], telling = rec.telling || [], id = t;
    // a recipe of trades: the trade of the documented place, by the words of its name, else
    // one by the shares (data/furnishings.json: the shares of the trade words of the place names)
    if (rec.variants) {
      const vs = Object.entries(rec.variants), place = U.place ? this.uses.places?.get(U.place) : null;
      const words = place ? `${place.name || ''} ${place.use || ''}`.toLowerCase() : '';
      let v = words ? vs.find(([name]) => (TRADE[name] || [name]).some((w) => words.includes(w))) : null;
      if (!v) {
        let x = r() * vs.reduce((s2, [, q]) => s2 + (q.share || 0), 0);
        v = vs.find(([, q]) => (x -= q.share || 0) <= 0) || vs[vs.length - 1];
      }
      items = [...(v[1].items || []), ...items];
      telling = v[1].telling || [];
      id = `${t}_${v[0]}`;
    }
    // the telling things first (they tell the use of the room), then the rest
    items = [...items.filter((x) => telling.includes(x.kind)), ...items.filter((x) => !telling.includes(x.kind))];
    return { id, items };
  }

  // Furnish one room (unit) U.
  furnishUnit(U) {
    const B = this.S.list[U.b], plan = B.phaseOf(U.k).plan, unit = plan.units.find((x) => x.id === U.u);
    if (!unit || !unit.cells.length) return;
    const r = mulberry32(((U.b * 73856093) ^ (U.k * 19349663) ^ (U.u * 83492791)) >>> 0);
    const rec = this.recipeOf(U, B, unit, r);
    if (!rec) return;
    const R = plan.R, ni = R.ni, cells = new Set(unit.cells), occ = new Set();
    const y0 = B.y[U.k], ceil = B.y[U.k + 1] - SLAB - y0;
    const list = this.items.get(U.key) || []; // a pump hatch can be there already
    const at = (i, j) => j * ni + i;
    const inU = (i, j) => i >= 0 && j >= 0 && i < ni && j < R.nj && cells.has(at(i, j));
    const codeAt = (i, j) => (i >= 0 && j >= 0 && i < ni && j < R.nj ? plan.code[at(i, j)] : 0);
    const isDoorSide = (i, j) => { const v = codeAt(i, j); return v === CORR || v === LANDING || v === FLIGHT; };
    const isWindowSide = (i, j) => codeAt(i, j) === 0;
    const F = R.F;
    // The four sides: the step to the neighbour cell, and the direction into the room (a, w).
    const SIDES = [[-1, 0, 1, 0], [1, 0, -1, 0], [0, -1, 0, 1], [0, 1, 0, -1]];
    const list0 = [...unit.cells];
    // Try to put a thing of nw x nd cells with its back to a wall: returns the frame or null.
    const fit = (nw, nd, want) => {
      for (let tries = 0; tries < 70; tries++) {
        const c = list0[Math.floor(r() * list0.length)], i = c % ni, j = Math.floor(c / ni);
        const order = [0, 1, 2, 3].sort(() => r() - 0.5);
        for (const sIdx of order) {
          const [di, dj, ia, iw] = SIDES[sIdx];
          if (want === 'centre') break;
          if (inU(i + di, j + dj)) continue; // not a wall on this side
          if (want === 'door' && !isDoorSide(i + di, j + dj) && tries < 40) continue;
          if (want === 'window' && !isWindowSide(i + di, j + dj) && tries < 40) continue;
          // along the wall: the axis across the side
          const ta = iw !== 0 ? 1 : 0, tw = ia !== 0 ? 1 : 0;
          const cellsOf = [];
          let ok = true;
          for (let p = 0; p < nw && ok; p++)
            for (let q = 0; q < nd && ok; q++) {
              const ci = i + ta * p + ia * q, cj = j + tw * p + iw * q;
              if (!inU(ci, cj) || occ.has(at(ci, cj))) ok = false;
              else cellsOf.push([ci, cj]);
            }
          if (!ok) continue;
          if (want === 'corner') {
            const end = [i + ta * (nw - 1), j + tw * (nw - 1)];
            if (inU(i - ta, j - tw) && inU(end[0] + ta, end[1] + tw)) continue;
          }
          return { cellsOf, ia, iw, ta, tw, i, j };
        }
        if (want === 'centre') {
          const cellsOf = [];
          let ok = true;
          const ia = 0, iw = 1, ta = 1, tw = 0;
          for (let p = -1; p <= nw && ok; p++)
            for (let q = -1; q <= nd && ok; q++) {
              const ci = i + p, cj = j + q;
              if (!inU(ci, cj) || occ.has(at(ci, cj))) ok = false;
              else if (p >= 0 && q >= 0 && p < nw && q < nd) cellsOf.push([ci, cj]);
            }
          if (ok) return { cellsOf, ia, iw, ta, tw, i, j, centre: true };
        }
      }
      return null;
    };
    for (const it of rec.items) {
      if (!this.kinds[it.kind] && !SHAPE[it.kind]) continue;
      if (it.place === 'outside_window') continue; // the things outside the windows are not drawn yet
      if ((it.p ?? 1) < 1 && r() > it.p) continue;
      // the conditions of the notes: "Only in a room of N m2 or more", "Only with a cockloft",
      // "Only in a unit with an outside wall"
      const only = /Only in a (?:room|flat) of (\d+) m2/.exec(it.note || '');
      if (only && unit.area < +only[1]) continue;
      if (/Only with a cockloft/.test(it.note || '') && !list.some((t) => t.kind === 'cockloft')) continue;
      if (/Only in a unit with an outside wall/.test(it.note || '') && !list0.some((c) => SIDES.some(([di, dj]) => isWindowSide(c % ni + di, Math.floor(c / ni) + dj)))) continue;
      let n;
      if (Array.isArray(it.n)) n = it.n[0] + Math.floor(r() * (it.n[1] - it.n[0] + 1));
      else if (it.per_m2) n = Math.max(1, Math.round(unit.area * it.per_m2 * (0.7 + r() * 0.6)));
      else n = 1;
      n = Math.min(n, 24);
      const K = this.kinds[it.kind] || { size: [0.5, 0.5, 0.5] };
      const [w, d, h] = K.size || [0.5, 0.5, 0.5];
      if (h > ceil + 0.3 && it.kind !== 'cockloft') continue;
      for (let q = 0; q < n; q++) {
        let T;
        if (CEILING.has(it.kind)) {
          const c = list0[Math.floor(r() * list0.length)], [x, z] = R.xz(c % ni, Math.floor(c / ni));
          T = { x, y: y0 + ceil - 0.08, z, ang: Math.atan2(F.ux, F.uz) };
        } else {
          const place = AT_WALL.has(it.kind) && it.place === 'centre' ? 'wall' : it.place;
          const nw = Math.max(1, Math.ceil(w / G - 0.01)), nd = Math.max(1, Math.ceil(Math.max(d, 0.05) / G - 0.01));
          const f = fit(nw, nd, place === 'ceiling' ? 'centre' : place);
          if (!f) break;
          if (!NO_FLOOR.has(it.kind)) for (const [ci, cj] of f.cellsOf) occ.add(at(ci, cj));
          // the frame: origin at the middle of the wall side of the thing, z into the room
          let sa = 0, sw = 0;
          for (const [ci, cj] of f.cellsOf) { sa += R.a(ci); sw += R.w(cj); }
          sa /= f.cellsOf.length; sw /= f.cellsOf.length;
          const ia = f.centre ? 0 : f.ia, iw = f.centre ? 1 : f.iw;
          const ba = sa - ia * (nd * G) / 2, bw = sw - iw * (nd * G) / 2; // back to the wall
          const x = F.ux * ba + F.px * bw, z = F.uz * ba + F.pz * bw;
          const nx = F.ux * ia + F.px * iw, nz = F.uz * ia + F.pz * iw;
          T = { x, y: y0, z, ang: Math.atan2(nx, nz) };
        }
        // the lights hang under the ceiling: from above they hide the room, thus they are not drawn
        if (!CEILING.has(it.kind)) this.put(it.kind, 'room', T.x, T.y, T.z, T.ang, B.id, U.k, r);
        // the middle of the thing: its origin is the middle of its back, against the wall
        list.push({ kind: it.kind, x: T.x + Math.sin(T.ang) * d / 2, z: T.z + Math.cos(T.ang) * d / 2, r: Math.max(w, d) / 2 + 0.1, facts: it.facts || [], basis: it.basis || (rec.id.startsWith('room') ? 'sourced' : 'inferred'), why: rec.id });
      }
    }
    this.items.set(U.key, list);
  }

  // The roofs: aerials, laundry, pot plants, seats and heaps, and the pigeon lofts of Chan Kwan
  // Leung (陳昆亮). The shares come from data/furnishings.json "roofs" (counts of the roofs in
  // the photos of City of Darkness Revisited); where each thing stands is INFERRED.
  buildRoofs() {
    const S = this.S;
    const RULES = [
      { kind: 'tv_aerial', p: 0.93, n: [3, 10] },
      { kind: 'laundry_pole', p: 0.45, n: [1, 3] },
      { kind: 'plant_pot', p: 0.45, n: [3, 12] },
      { kind: 'chair', p: 0.2, n: [1, 2] },
      { kind: 'boxes', p: 0.3, n: [1, 4] },
    ];
    const src = new Map((this.F?.roofs || []).map((x) => [x.kind, x]));
    for (const B of S.list) {
      if (B.pitched || !B.roofOpen || B.n < 2 || B.kind === 'yamen') continue;
      const k = B.n, r = mulberry32((B.id * 2654435761) >>> 0), plan = B.phaseOf(B.n - 1).plan, R = plan.R;
      // the free cells of the roof: not in a stair hut or a roof room, nor in front of their doors
      const huts = [...B.stairs.map((st) => [st.a0, st.a1, st.w0, st.w1]), ...(B.roofRoom ? [[B.roofRoom.a0, B.roofRoom.a1, B.roofRoom.w0, B.roofRoom.w1]] : [])];
      const free = [];
      for (let c = 0; c < R.inside.length; c++) {
        if (!R.inside[c]) continue;
        const [x, z] = R.xz(c % R.ni, Math.floor(c / R.ni)), [a, w] = toAW(B.F, x, z);
        if (huts.some(([a0, a1, w0, w1]) => a > a0 - 1.1 && a < a1 + 1.1 && w > w0 - 1.1 && w < w1 + 1.1)) continue;
        if ((this.blocked.get(B.id) || []).some(([bx, bz, br]) => Math.hypot(x - bx, z - bz) < br)) continue;
        free.push([x, z]);
      }
      if (free.length < 8) continue;
      const list = this.items.get(`roof:${B.id}`) || []; // a tank can be there already
      // the two lofts of Chan Kwan Leung (陳昆亮) stand on the roof of his own building, 59 (pp318-321;
      // data/routines.json); the map pin of the lofts (place B71) is on the next building, 75
      const rules = B.id === PIGEON_ROOF ? [{ kind: 'pigeon_loft', p: 1, n: [2, 2] }, ...RULES] : RULES;
      for (const rule of rules) {
        if (r() > rule.p) continue;
        const n = rule.n[0] + Math.floor(r() * (rule.n[1] - rule.n[0] + 1));
        for (let q = 0; q < n; q++) {
          const [x, z] = free[Math.floor(r() * free.length)];
          // the lofts and the laundry stand square to the building; the rest at any turn
          const ang = rule.kind === 'pigeon_loft' || rule.kind === 'laundry_pole' ? Math.atan2(B.F.ux, B.F.uz) + (r() < 0.5 ? 0 : Math.PI) : r() * Math.PI * 2;
          this.put(rule.kind, 'roof', x, B.top, z, ang, B.id, k, r);
          const dd = (this.kinds[rule.kind]?.size || [0, 0.5])[1] / 2;
          list.push({ kind: rule.kind, x: x + Math.sin(ang) * dd, z: z + Math.cos(ang) * dd, r: rule.kind === 'pigeon_loft' ? 1.7 : 0.6, facts: src.get(rule.kind)?.facts || [], basis: rule.kind === 'pigeon_loft' ? 'sourced' : 'sourced (where each stands: inferred)', why: 'roofs' });
        }
      }
      this.items.set(`roof:${B.id}`, list);
    }
  }

  // Each frame: furnish some rooms (budget: ms), and follow the layers of src/cityLayers.js.
  // mPerPx: metres of the view for each pixel (the small things show under NEAR_M, MID_M).
  update(mPerPx, budget = 4) {
    if (this.qi < this.queue.length) {
      const t0 = performance.now();
      while (this.qi < this.queue.length && performance.now() - t0 < budget) {
        const U = this.queue[this.qi];
        if (U.k > this.doneTo + 1) this.layerDone();
        this.furnishUnit(U);
        this.qi++;
      }
      if (this.qi >= this.queue.length) this.layerDone(true);
    }
    const L = this.layers, e = L.spread, c = L.peelK, U = this.U;
    for (let k = 0; k < 16; k++) {
      U.uLift.value[k] = k < L.n ? L.lift[k] * e : 0;
      U.uShowIn.value[k] = e > 0.01 || k === c ? 1 : 0;
    }
    U.uPeelK.value = c >= 0 ? c : -10;
    const rooms = e > 0.01 || c >= 0, tier = mPerPx < NEAR_M ? 2 : mPerPx < MID_M ? 1 : 0;
    for (const P of this.protos.values()) {
      if (!P.mesh) continue;
      P.mesh.visible = (P.roof || rooms) && P.mesh.userData.tier <= tier;
      // peeled and not pulled apart: the things over the peeled storey are not drawn
      const end = !P.roof && e <= 0.01 && c >= 0 && c <= this.doneTo ? P.layerEnd[c] : P.sent;
      P.cur.instanceCount = Math.min(P.sent, end ?? P.sent);
      P.twin.visible = P.mesh.visible && P.cur.instanceCount > 0;
    }
  }

  // The rooms of the next layer (or of all the layers left) are furnished: note where the
  // things of each layer end, and send them.
  layerDone(all = false) {
    const k = all ? this.layers.n - 1 : this.doneTo + 1;
    for (let q = this.doneTo + 1; q <= k; q++) for (const P of this.protos.values()) if (!P.roof) P.layerEnd[q] = P.n;
    this.doneTo = k;
    this.flush();
  }

  // The thing of room `key` at the point p (x, z), or null.
  // k: the floor layer of the pick; a thing with k0..k1 (a pipe outside) is found only there.
  thingAt(key, p, k) {
    const list = this.items.get(key);
    if (!list) return null;
    let best = null, bd = Infinity;
    for (const t of list) {
      if (t.k0 !== undefined && k !== undefined && (k < t.k0 || k > t.k1)) continue;
      const d = Math.hypot(t.x - p.x, t.z - p.z);
      if (d < t.r && d < bd) { bd = d; best = t; }
    }
    return best;
  }

  // The thing under the ray in storey k of building b (a pick of kind ITEM_KIND): the ray is
  // cut at some heights over the floor, and the nearest thing to a cut wins. Returns { key,
  // room, thing }: room is { k, u }, or null on a roof.
  pick(layers, ray, b, k) {
    const B = this.S.list[b], roof = k >= B.n;
    let best = null;
    for (const h of [-0.3, 0.05, 0.4, 0.8, 1.3, 1.9, 2.6, 3.1, 3.6]) {
      const p = layers.floorPoint(ray, b, k, h);
      if (!p) continue;
      const u = roof ? null : layers.roomAt(b, k, p), key = roof ? `roof:${b}` : `${b}:${k}:${u}`;
      // the things of the room (or the roof), and the things outside the walls of b (out:b)
      for (const kk of h >= 0 && h < 2.7 ? [key, `out:${b}`] : [`out:${b}`]) {
        const t = this.thingAt(kk, p, k);
        if (!t) continue;
        const d = Math.hypot(t.x - p.x, t.z - p.z);
        if (!best || d < best.d) best = { d, key: kk, room: roof || kk.startsWith('out:') ? null : { k, u }, thing: t };
      }
      if (!best && !roof && u !== null && h >= 0) best = { d: Infinity, key, room: { k, u }, thing: null };
    }
    return best;
  }


  // The words of a thing, with its sources.
  describe(t) {
    const K = this.kinds[t.kind] || {};
    const facts = (t.facts || []).map((id) => this.facts.get(id)).filter(Boolean);
    return { label: K.label || t.kind.replace(/_/g, ' '), basis: t.basis, why: t.why, facts };
  }
}

// The words of the things of a room for its panel: the thing under the pointer first, then a
// count of each kind, with the facts of the sources. thing: a thing of thingAt, or null.
export function thingsHtml(fu, key, thing, esc) {
  const list = fu.items.get(key);
  if (!list || !list.length) return '';
  const out = key.startsWith('out:');
  let html = `<h3>${out ? 'WHAT IS HERE' : 'WHAT STANDS IN IT'}</h3>`;
  if (thing) {
    const d = fu.describe(thing);
    html += `<div class="r"><span class="k">this</span><span><b>${esc(d.label)}</b> <span class="tag ${d.basis === 'sourced' ? 'verified' : 'guess'}">${esc(d.basis)}</span>${thing.note ? `<br>${esc(thing.note)}` : ''}</span></div>`;
    // a fact: its words (a summary of the source), then the source; the quote is verbatim
    for (const f of d.facts.slice(0, 2))
      html += `<div class="sub">${esc(f.text || '')} <span class="n">(${esc(f.source || '')}${f.cite ? `, ${esc(f.cite)}` : ''})</span>${f.quote ? `<br><i>“${esc(String(f.quote).slice(0, 200))}${String(f.quote).length > 200 ? '…' : ''}”</i>` : ''}</div>`;
  }
  if (out) return `${html}<div class="sub">The water, the power, the post and the refuse of the City: data/utilities.json. The look of each thing has a source; where each one stands is INFERRED.</div>`;
  const n = new Map();
  for (const t of list) n.set(t.kind, (n.get(t.kind) || 0) + 1);
  const words = [...n].map(([k, c]) => `${c > 1 ? `${c} × ` : ''}${esc(fu.describe({ kind: k }).label.replace(/\s*\(.*$/, '').replace(/:.*$/, ''))}`);
  const why = (list.find((t) => t.why !== 'utilities') || list[0]).why;
  html += `<div>${words.join(' · ')}</div>`;
  html += `<div class="sub">${why === 'utilities' ? 'The water, the power and the refuse of the City: data/utilities.json. Where each thing stands is INFERRED.'
    : why.startsWith('room') ? 'The things of this documented room come from its sources; where each stands is INFERRED.'
      : why === 'roofs' ? 'Roofs: the kinds and their shares come from the photos of the roofs (City of Darkness Revisited); where each stands is INFERRED.'
        : `The things of a room of this kind (${esc(why.replace(/_/g, ' '))}) come from the sources of such rooms; which of them stand in this room, and where, is INFERRED.`}</div>`;
  return html;
}
