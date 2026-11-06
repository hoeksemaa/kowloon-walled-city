// The panel of the selected building in the main app, and the box under the pointer: the facts
// of the building in the structure (src/city/model.js), each storey with the uses of its rooms
// in December 1986 (data/room_uses.json, docs/rooms.md), the places that the sources put in it,
// and the facts and sources of one room.
import { floorName } from './city/model.js';
import { CAT_HEX, esc } from './roomUses.js';

const fmt = (v) => v.toFixed(1);
const sq = (cat) => `<span class="sq" style="background:${CAT_HEX[cat] || '#ccc'}"></span>`;
const BASIS = {
  verified: 'a source gives the address and the floor',
  likely: 'a source gives the use and part of the place',
  guess: 'no source names this room: its use is a guess from the counts of the sources',
};

// Where the storeys of a building come from (b.from in src/city/model.js).
// The note of the fix (data/structure_fixes.json), which can be long, folds under it.
function storeysFrom(b) {
  const head = {
    south: "the south face, Lambot's elevation of 1990 (sourced)",
    p132: 'the range of City of Darkness Revisited p132 (sourced); the count of this building is inferred',
    p336: 'the range of City of Darkness Revisited p336 (sourced); the count of this building is inferred',
    photo: 'a photo (sourced)',
    bronze: `the bronze model in the park (${b.inferred ? 'inferred' : 'sourced'})`,
    aerial: 'an aerial photo (sourced)',
    sheet1987: 'the survey sheet of 1987 (sourced)',
    photos: 'the roofline of the faces that photos count (inferred)',
    hut: 'a hut (inferred)', named: 'a named building', yamen: 'a hall of the Yamen (衙門)',
  }[b.from] || b.from;
  const why = ['photo', 'bronze', 'aerial', 'sheet1987'].includes(b.from) && b.fix?.why;
  return why ? `<details><summary>${esc(head)}</summary>${esc(why)}</details>` : esc(head);
}

// The documented places of each building: building id -> [place].
export function placesByBuilding(uses) {
  const m = new Map();
  for (const p of uses.places.values())
    for (const [b] of p.at || []) {
      if (!m.has(b)) m.set(b, []);
      if (!m.get(b).includes(p)) m.get(b).push(p);
    }
  return m;
}

// A place that would give away the answer of an open mystery (src/life/mysteries.js sets
// p.mystery to the number of its case) shows no name until the case is solved.
const placeName = (p) => (p.mystery ? `<i>a place of an open mystery (case ${p.mystery})</i>`
  : `${esc(p.name)}${p.nameZh && !String(p.name).includes(p.nameZh) ? ` (${esc(p.nameZh)})` : ''}`);

// The uses of the rooms of storey k of building b, as swatches with counts.
function storeyUses(uses, B, k) {
  const c = {};
  for (const u of B.phaseOf(k).plan.units) { const r = uses.get(B.id, k, u.id); if (r) c[r.cat] = (c[r.cat] || 0) + 1; }
  return Object.entries(c).sort((x, y) => y[1] - x[1])
    .map(([cat, n]) => `<span class="p">${sq(cat)}${n} ${esc(cat === 'home' ? (n === 1 ? 'flat' : 'flats') : uses.label(cat))}</span>`).join('');
}

// The facts and sources of room u of storey k (k = n: the roof room).
function roomHtml(S, uses, B, { k, u }) {
  const r = uses.get(B.id, k, u);
  const where = `${k >= B.n ? 'roof room' : `${floorName(k)}, room ${u}`}`;
  if (!r) return `<h3>ROOM · ${where.toUpperCase()}</h3><div class="sub">No use recorded for this room.</div>`;
  const p = r.place ? uses.places.get(r.place) : null;
  let html = `<h3>ROOM · ${where.toUpperCase()}</h3><div class="r"><span class="k">use</span><span>${sq(r.cat)} <b>${esc(uses.label(r.cat))}</b> · ${r.basis}</span></div>`;
  if (!p) return `${html}<div class="sub">${BASIS[r.basis] || ''}</div>`;
  if (p.mystery) return `${html}<div class="r"><span class="k">place</span><span>${placeName(p)}: solve the case to see its name and its sources.</span></div>`;
  const addr = [p.address, p.floor != null ? floorName(Math.max(0, p.floor)) : '', p.map_pin != null ? `1992 map no. ${p.map_pin}` : ''].filter(Boolean).join(', ');
  html += `<div class="r"><span class="k">place</span><span><b>${placeName(p)}</b>: ${esc(p.use)}</span></div>
    <div class="r"><span class="k">source</span><span>${esc(addr || 'no address')} · placed by ${esc(p.how)}</span></div>`;
  for (const x of p.sources.slice(0, 3))
    html += `<div class="sub">${esc(x.source)}${x.cite ? `, ${esc(x.cite)}` : ''}${x.date ? ` (${esc(x.date)})` : ''}${x.quote ? `: <i>“${esc(String(x.quote).slice(0, 240))}”</i>` : ''}</div>`;
  return html;
}

// The panel of building b. peel: the storey that the City is peeled to (-1 for none); room:
// { k, u } of the selected room, or null; roomExtra: more HTML for the room (the things and
// the people in it, src/life/).
export function panelHtml(S, uses, places, b, peel, room, roomExtra = '') {
  const B = S.list[b];
  const stairs = B.stairs.map((s) => `${s.type === 'dogleg' ? 'dog-leg' : s.rmax > 0.2 ? 'steep straight' : 'straight'}${s.spine ? ' + corridor' : ''}`).join(', ')
    || (B.wingOf !== undefined ? `the stair of building ${B.wingOf}` : 'none');
  const lc = {};
  for (const d of S.doors) if (d.b === B.id || d.c === B.id) lc[d.kind] = (lc[d.kind] || 0) + 1;
  const links = Object.entries(lc).map(([q, n]) => `${n} ${q}`).join(', ') || 'none';
  let html = `<div class="nm">${esc(B.label)}</div>
    <div class="sub">${B.n} storey${B.n > 1 ? 's' : ''} · building no. ${B.id} of the structure</div>
    ${room ? roomHtml(S, uses, B, room) : ''}${roomExtra}
    <h3>BUILDING</h3>
    <div class="r bl"><span class="k">storeys from</span><span>${storeysFrom(B)}</span></div>
    <div class="r bl"><span class="k">heights</span><span>G/F floor ${fmt(B.g0)} mPD · roof ${fmt(B.top)} mPD</span></div>
    <div class="r bl"><span class="k">footprint</span><span>${B.area.toFixed(0)} m²</span></div>
    <div class="r bl"><span class="k">stairs</span><span>${esc(stairs)}</span></div>
    <div class="r bl"><span class="k">links</span><span>${esc(links)}</span></div>
    <h3>STOREYS · CLICK ONE TO PEEL THE CITY TO IT</h3>`;
  if (B.roofRoom) {
    const r = uses.get(B.id, B.n, 0);
    html += `<div class="st"><span class="k">roof</span><span class="u">${r ? `<span class="p">${sq(r.cat)}roof room: ${esc(uses.label(r.cat))}</span>` : 'roof room'}</span></div>`;
  }
  for (let k = B.n - 1; k >= 0; k--) {
    const cls = ['st', k === peel ? 'sel' : '', peel >= 0 && k > peel ? 'above' : ''].filter(Boolean).join(' ');
    html += `<button class="${cls}" data-k="${k}" title="Peel the City to ${floorName(k)}"><span class="k">${floorName(k)}</span><span class="u">${storeyUses(uses, B, k) || `${B.phaseOf(k).plan.units.length} rooms`}</span></button>`;
  }
  const ps = places.get(B.id) || [];
  if (ps.length) {
    html += `<h3>PLACES OF THE SOURCES IN THIS BUILDING (${ps.length})</h3>`;
    for (const p of ps.slice(0, 12)) {
      const floors = [...new Set(p.at.filter((a) => a[0] === B.id).map((a) => (a[1] >= B.n ? 'roof' : floorName(a[1]))))].join(', ');
      html += `<div class="r w"><span class="k">${floors}</span><span>${sq(p.cat)}<b>${placeName(p)}</b>${p.mystery ? '' : ` · ${esc(p.use)} · <i>${p.basis}</i>`}</span></div>`;
    }
    if (ps.length > 12) html += `<div class="sub">and ${ps.length - 12} more</div>`;
  }
  return html;
}

// The box of a building under the pointer.
export function buildingTip(S, b) {
  const B = S.list[b];
  return `<div class="tt-h">${esc(B.label).toUpperCase()} · ${B.n} STOREY${B.n > 1 ? 'S' : ''}</div>`;
}

// The box of a room under the pointer: its storey, its use and its documented place.
export function roomTip(S, uses, b, { k, u }) {
  const B = S.list[b], r = uses.get(b, k, u), p = r?.place ? uses.places.get(r.place) : null;
  const where = k >= B.n ? 'ROOF ROOM' : `${floorName(k)} · ROOM ${u}`;
  const use = r ? `<div><span class="tt-k">${esc(uses.label(r.cat))}</span> ${r.basis}</div>` : '';
  return `<div class="tt-h">${where}</div><div>${esc(B.label)}</div>${use}${p ? `<div class="tt-r">${placeName(p)}</div>` : ''}`;
}
