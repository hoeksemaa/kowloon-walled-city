// The panel of a selected person, and the box under the pointer. A real person (data/people.json)
// shows their name, their story, their sources and their day with the basis of each hour. A
// person of the crowd has no name: no source names them; their day is INFERRED.
import { floorName } from '../city/model.js';
import { esc } from '../roomUses.js';
import { ROLES, OUTSIDERS } from './population.js';
import { mainsTap } from './routines.js';

const hm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.floor(m % 60)).padStart(2, '0')}`;
const nameOf = (P) => `${esc(P.name)}${P.nameZh && !String(P.name).includes(P.nameZh) ? ` (${esc(P.nameZh)})` : ''}`;
const roleOf = (p) => (ROLES[p.role] || OUTSIDERS[p.role] || { label: p.role }).label;
const article = (s) => (/^[aeiou]/i.test(s) ? `An ${s}` : `A ${s}`);

// Where a place is, in words.
export function placeWords(S, uses, pl) {
  if (!pl) return '';
  if (pl.kind === 'out') return esc(pl.what || 'outside the City');
  if (pl.kind === 'lane') return pl.label || 'in the lanes';
  const B = S.list[pl.b];
  if (pl.kind === 'roof') return `on the roof of ${esc(B.label)}`;
  const r = uses.get(pl.b, pl.k, pl.u), use = r ? uses.label(r.cat) : '';
  const where = pl.k >= B.n ? `the roof room of ${esc(B.label)}` : `${floorName(pl.k)} of ${esc(B.label)}, room ${pl.u}`;
  return `${where}${use ? ` <i>(${esc(use)})</i>` : ''}`;
}

const basisTag = (x) => (x ? `<span class="tag ${x.basis === 'sourced' ? 'verified' : 'guess'}">${x.basis === 'sourced' ? 'sourced' : 'inferred'}</span>` : '<span class="tag guess">inferred</span>');
const cite = (x) => (x && (x.cite || x.source) ? ` <span class="n">${esc([x.source && x.source !== 'inference' ? x.source : '', x.cite].filter(Boolean).join(', '))}</span>` : '');

// The members of household h, as buttons that select them; skip: a member not to list.
function membersHtml(life, h, skip = -1) {
  let html = '';
  for (const j of h.members) {
    if (j === skip) continue;
    const q = life.persons[j];
    html += `<button class="who" data-person="${j}"><div class="tt-h">${esc(q.rel)}, ${q.age}</div><div>${esc(roleOf(q))} · ${esc(life.now(j).doing || '')}</div></button>`;
  }
  return html;
}

// The water of a home for day `day`: the well water of its floor, and the drinking water.
function waterHtml(life, h, day) {
  const F = life.X.house({ hh: h.id }, day), W = F?.water;
  if (!W) return '';
  let html = '<h3>THE WATER OF THIS HOME · INFERRED</h3><div class="sub">';
  if (W.kind === 'all') html += 'This block has water all day: its builder made several connections, as some did (p113). ';
  else if (W.kind === 'runs') html += `The pump of the well owner fills the roof tank at noon and at midnight; the taps run for a few hours after (p107): about ${hm(W.day[0])} to ${hm(W.day[1])}, and ${hm(W.night[0])} to ${hm(W.night[1])}. `;
  else html += `The water comes by floors, low floors first (林羅平, HK01): to this floor at about ${hm(W.day[0])} to ${hm(W.day[1])}. The household fills its drums and its bath then. `;
  html += 'The well water is not fit to drink (p108). ';
  const P = life.pipes && life.X.pipeFor(h.home);
  if (mainsTap(h.home.b)) html += 'The drinking water comes from a tap of the block: a pipe taken from the Government mains, illegally, as many were (p110).';
  else if (h.carrier >= 0) html += 'The household pays a water carrier to bring its drinking water up the stairs, every other day (p108).';
  else if (F.fetch >= 0) html += `The ${esc(life.persons[F.fetch].rel === 'lives alone' ? 'resident' : life.persons[F.fetch].rel)} carries the drinking water home each day from ${P ? esc(P.label.replace(/^at /, '')) : 'a standpipe'} (p249).`;
  return `${html}</div>`;
}

// The household that lives in home `key` (for the panel of the room).
export function homeHtml(life, pop, key, day) {
  const h = pop.households?.find((x) => x.home.key === key);
  if (!h) return '';
  const what = { family: 'a family', couple: 'a couple', 'old couple': 'an old couple', sharers: 'workers who share the flat', alone: 'one person, alone' }[h.kind] || 'a household';
  return `<h3>WHO LIVES HERE · ${esc(what).toUpperCase()} OF ${h.members.length}</h3>${membersHtml(life, h)}${waterHtml(life, h, day)}`;
}

// The panel of person i. ctx: { life, S, uses, pop, follow }.
export function personHtml(ctx, i) {
  const { life, S, uses, pop } = ctx, p = life.persons[i], now = life.now(i), s = life.state[i];
  const P = p.person;
  let html = '';
  if (P) {
    html += `<div class="nm">${nameOf(P)}</div><div class="sub">${esc(P.short)}${P.lived ? ` · ${esc(P.lived)}` : ''}</div>`;
  } else {
    const h = p.hh !== undefined ? pop.households?.[p.hh] : null, hh = h ? h.members.length : 0;
    const rel = p.rel && p.rel !== 'lives alone' ? ` · ${esc(p.rel)}` : '';
    html += `<div class="nm">${article(roleOf(p))}</div>
      <div class="sub">about ${p.age}${rel} · ${p.home ? `lives on ${placeWords(S, uses, p.home)}${hh > 1 ? ` · a household of ${hh}` : ' · lives alone'}` : 'lives outside the City'}</div>`;
  }
  html += `<button class="follow${ctx.follow ? ' on' : ''}" data-follow="1">${ctx.follow ? 'STOP FOLLOWING' : 'FOLLOW'}</button>`;
  html += '<h3>NOW</h3>';
  html += `<div>${esc(now.doing || '')}${P ? ` ${basisTag(now.slot)}` : ''}</div>`;
  const where = now.walking ? `walking to ${placeWords(S, uses, now.to)}` : placeWords(S, uses, now.at);
  if (where !== esc(now.doing || '')) html += `<div class="sub">${where}</div>`;
  if (P && P.story) html += `<h3>THEIR STORY</h3><div>${esc(P.story)}</div>`;
  if (!P && p.hh !== undefined && pop.households?.[p.hh]) {
    const h = pop.households[p.hh];
    if (h.members.length > 1) html += `<h3>THE HOUSEHOLD</h3>${membersHtml(life, h, i)}`;
    html += waterHtml(life, h, life.day);
  }
  if (p.role === 'carrier' && p.clients) html += `<div class="sub">Carries drinking water for ${p.clients.length} households near home, each one every other day.</div>`;
  html += `<h3>THIS DAY${P ? '' : ' · ALL THE HOURS ARE INFERRED'}</h3>`;
  let last = '';
  for (const [t, pl, doing, x] of s.ev || []) {
    const line = `${doing}|${pl.key || pl.kind}`;
    if (line === last) continue;
    last = line;
    html += `<div class="r w"><span class="k">${hm(t)}</span><span>${esc(doing)}${P ? ` ${basisTag(x)}` : ''}<br><span class="n">${placeWords(S, uses, pl)}</span>${P ? cite(x) : ''}</span></div>`;
  }
  if (P) {
    if (P.sources && P.sources.length) {
      html += '<h3>SOURCES</h3>';
      for (const x of P.sources.slice(0, 6)) html += `<div class="sub">${esc(x.source)}${x.cite ? `, ${esc(x.cite)}` : ''}${x.quote ? `: <i>“${esc(String(x.quote).slice(0, 260))}”</i>` : ''}</div>`;
    }
  } else {
    html += `<div class="sub" style="margin-top:8px">No source names this person. The crowd of the model follows the counts of the sources: 28,200 residents in January 1987 (City of Darkness Revisited, p340), and about 4,800 people who came in to work (p339). Their roles, homes, workplaces and hours are INFERRED.</div>`;
  }
  return html;
}

// The box of person i under the pointer. hide: the person is the answer of an open mystery
// (src/life/mysteries.js): no name until they are found.
export function personTip(life, i, hide = false) {
  const p = life.persons[i], now = life.now(i), P = p.person;
  return `<div class="tt-h">${P && !hide ? nameOf(P) : P ? 'SOMEONE' : article(roleOf(p)).toUpperCase()}</div><div>${esc(now.doing || '')}</div>`;
}
