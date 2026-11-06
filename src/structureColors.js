// The placeholder colours of the structure viewer (structure.html). The 3D structure
// (src/city/, src/surroundings/) has no colours: the code that draws it gives them. These
// colours are placeholders: change them freely, they do not change the structure.
import * as THREE from 'three';

// a CSS hex colour as linear rgb, for the vertex colours
const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
export function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [lin(((n >> 16) & 255) / 255), lin(((n >> 8) & 255) / 255), lin((n & 255) / 255)];
}
const frac = (x) => x - Math.floor(x);
const hash = (id, s) => frac(Math.sin(id * 12.9898 + s) * 43758.5453);

// the parts of the City (PARTS in src/city/mesh.js)
const PART = {
  wallInside: '#d9d2c3', slab: '#9c968b', slabEdge: '#7d776d', roof: '#a8a297', parapet: '#b3ab9d', tile: '#5b5750',
  hut: '#b8b0a2', partition: '#e3dccd', stair: '#8a8378', landing: '#a39c90', corridor: '#8f877b', link: '#6f5d4b',
  wood: '#7b6347',
};
// the outside walls: one colour for each building, by weight (painted render, mosaic tile)
const FACADES = [
  ['#a79f96', 10], ['#8e877f', 6], ['#c9c0b2', 5], ['#e6d6bb', 3], ['#ddd6c8', 3], ['#c1a994', 5],
  ['#a08d7d', 3], ['#d3b894', 4], ['#b19a83', 3], ['#93a9b0', 4], ['#7a8d91', 2], ['#98a290', 4],
  ['#b69482', 2], ['#8f7a6e', 2],
];
// the floors of the units: a few near shades, thus the units of one floor stand apart
const UNITS = ['#c9b9a0', '#c2b49d', '#cdbfa8', '#bfae95', '#c6bba7', '#cab49a'];

const PART_LIN = Object.fromEntries(Object.entries(PART).map(([k, h]) => [k, rgb(h)]));
const FACADE_LIN = FACADES.map(([h]) => rgb(h)), FACADE_SUM = FACADES.reduce((s, [, w]) => s + w, 0);
const UNIT_LIN = UNITS.map(rgb);
const facade = [];
function facadeOf(b) {
  if (facade[b] === undefined) {
    let r = hash(b, 1.7) * FACADE_SUM, i = 0;
    while (i < FACADES.length - 1 && (r -= FACADES[i][1]) >= 0) i++;
    facade[b] = FACADE_LIN[i];
  }
  return facade[b];
}

// colorOf(part, b, k, u) for buildMesh and buildProps (src/city/mesh.js). unitColor(b, k, u):
// an optional colour (linear rgb) for each unit, for example its use; null keeps the
// placeholder colour.
export function cityColors(unitColor = null) {
  return (part, b, k, u) => {
    if (part === 'wall') return facadeOf(b);
    if (part === 'unit') return (unitColor && unitColor(b, k, u)) || UNIT_LIN[(u * 7 + b) % UNIT_LIN.length];
    return PART_LIN[part];
  };
}

// the colours of the surroundings, for buildGround (src/surroundings/ground.js)
const c = new THREE.Color();
export const groundColors = {
  ground: {
    ground: '#d9d6ce', open: '#d3cfc4', sports: '#cfd4c6', kerb: '#c7c3b9', road: '#a4a19a', city: '#77726a', yard: '#8a857b',
    dirt: '#cdb99b', path: '#c2ab88', cleared: '#d3cfc4', grass: '#bcc4a2', court: '#b7b3aa', courtLine: '#f6f4ee',
    pavement: '#cdc9c0', kerbEdge: '#e9e6de', asphalt: '#8f8c86', fence: '#6f6b63', concrete: '#c6c2b8',
  },
  // the real buildings of 1986: pale warm greys, a little apart
  building(id) {
    const r = Math.sin(id * 12.9898) * 43758.5453;
    c.setHSL(0.09 + frac(r) * 0.03, 0.05, 0.8 + frac(r * 7) * 0.07);
    return [c.r, c.g, c.b];
  },
};
