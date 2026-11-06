// The room uses of December 1986 in the structure viewer: data/room_uses.json (made by
// tools/build_room_uses.mjs; see docs/rooms.md). A colour for each room by its use or by its
// basis, a legend that is also a filter, and the facts and sources of one room. The colours are
// the viewer's only: they do not change the structure.
import { rgb } from './structureColors.js';

// The 18 categories in 5 groups. A floor plan puts every colour beside every other, and only
// about three hues stay apart there for all readers. Thus one hue for each group (blue, aqua,
// orange: the three that pass the colour checks for all pairs), two neutrals (homes light,
// community dark), and a lighter or darker shade of the group hue for each category. The
// legend filter shows one category alone, and a click gives the room's category in words.
export const GROUPS = [
  { id: 'home', label: 'Homes', hex: '#d4cab6', cats: ['home'] },
  { id: 'factory', label: 'Factories and workshops', hex: '#2a78d6', cats: ['plastics', 'metal', 'garment', 'foodfac', 'works'] },
  { id: 'health', label: 'Dentists, doctors, medicine', hex: '#1baf7a', cats: ['dentist', 'clinic', 'medicine'] },
  { id: 'trade', label: 'Shops, offices, services', hex: '#eb6834', cats: ['shop', 'eating', 'office', 'storage', 'services'] },
  { id: 'other', label: 'Schools, temples, community', hex: '#6f6a62', cats: ['school', 'religion', 'community', 'vice'] },
];
export const BASIS = [
  { id: 'verified', hex: '#184f95' },
  { id: 'likely', hex: '#5598e7' },
  { id: 'guess', hex: '#d4cab6' },
];
const FILTERED = '#f3f1ec'; // a room that the filter hides

const hexMix = (a, b, t) => {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
// the shade of member i of n: lighter to darker round the group hue
const shade = (hex, i, n) => {
  if (n === 1) return hex;
  const t = -0.4 + (0.8 * i) / (n - 1);
  return t < 0 ? hexMix(hex, '#ffffff', -t) : hexMix(hex, '#000000', t * 0.8);
};
export const CAT_HEX = {};
for (const g of GROUPS) g.cats.forEach((c, i) => { CAT_HEX[c] = shade(g.hex, i, g.cats.length); });
const LIN = Object.fromEntries([...Object.entries(CAT_HEX), ...BASIS.map((b) => [`b:${b.id}`, b.hex]), ['filtered', FILTERED]]
  .map(([k, h]) => [k, rgb(h)]));

export class RoomUses {
  constructor(data) {
    this.data = data;
    this.at = new Map(); // "b:k:u" -> { cat, basis, place }
    for (const [b, k, u, cat, basis, place] of data.units) this.at.set(`${b}:${k}:${u}`, { cat, basis, place });
    this.places = new Map(data.places.map((p) => [p.id, p]));
    this.cats = new Map(data.categories.map((c) => [c.id, c]));
    this.mode = 'use'; // 'use' | 'basis' | 'off'
    this.catOn = new Set(this.cats.keys());
    this.basisOn = new Set(BASIS.map((b) => b.id));
  }
  shown(r) { return this.catOn.has(r.cat) && this.basisOn.has(r.basis); }
  // the colour (linear rgb) of unit u of floor k of building b, or null for the placeholder
  color(b, k, u) {
    if (this.mode === 'off') return null;
    const r = this.at.get(`${b}:${k}:${u}`);
    if (!r) return null;
    if (!this.shown(r)) return LIN.filtered;
    return this.mode === 'basis' ? LIN[`b:${r.basis}`] : LIN[r.cat];
  }
  get(b, k, u) { return this.at.get(`${b}:${k}:${u}`) || null; }
  label(cat) { return this.cats.get(cat)?.label || cat; }
}

export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export const swatch = (hex) => `<span class="sw" style="background:${hex}"></span>`;
export const tag = (basis) => `<span class="tag ${basis}">${basis}</span>`;
