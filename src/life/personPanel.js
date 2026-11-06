// The panel of a selected person, and the box under the pointer. A real person (data/people.json)
// shows their name, their story, their sources and their day with the basis of each hour. A
// person of the crowd has no name: no source names them; their day is INFERRED.
import { floorName } from '../city/model.js';
import { esc } from '../roomUses.js';
import { ROLES, OUTSIDERS } from './population.js';

const hm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.floor(m % 60)).padStart(2, '0')}`;
const nameOf = (P) => `${esc(P.name)}${P.nameZh && !String(P.name).includes(P.nameZh) ? ` (${esc(P.nameZh)})` : ''}`;
const roleOf = (p) => (ROLES[p.role] || OUTSIDERS[p.role] || { label: p.role }).label;
const article = (s) => (/^[aeiou]/i.test(s) ? `An ${s}` : `A ${s}`);

// Where a place is, in words.
export function placeWords(S, uses, pl) {
  if (!pl) return '';
  if (pl.kind === 'out') return esc(pl.what || 'outside the City');
  if (pl.kind === 'lane') return 'in the lanes';
  const B = S.list[pl.b];
  if (pl.kind === 'roof') return `on the roof of ${esc(B.label)}`;
  const r = uses.get(pl.b, pl.k, pl.u), use = r ? uses.label(r.cat) : '';
  const where = pl.k >= B.n ? `the roof room of ${esc(B.label)}` : `${floorName(pl.k)} of ${esc(B.label)}, room ${pl.u}`;
  return `${where}${use ? ` <i>(${esc(use)})</i>` : ''}`;
}

const basisTag = (x) => (x ? `<span class="tag ${x.basis === 'sourced' ? 'verified' : 'guess'}">${x.basis === 'sourced' ? 'sourced' : 'inferred'}</span>` : '<span class="tag guess">inferred</span>');
const cite = (x) => (x && (x.cite || x.source) ? ` <span class="n">${esc([x.source && x.source !== 'inference' ? x.source : '', x.cite].filter(Boolean).join(', '))}</span>` : '');

// The panel of person i. ctx: { life, S, uses, pop, follow }.
export function personHtml(ctx, i) {
  const { life, S, uses, pop } = ctx, p = life.persons[i], now = life.now(i), s = life.state[i];
  const P = p.person;
  let html = '';
  if (P) {
    html += `<div class="nm">${nameOf(P)}</div><div class="sub">${esc(P.short)}${P.lived ? ` · ${esc(P.lived)}` : ''}</div>`;
  } else {
    const hh = p.hh !== undefined ? pop.persons.filter((q) => q.hh === p.hh).length : 0;
    html += `<div class="nm">${article(roleOf(p))}</div>
      <div class="sub">about ${p.age} · ${p.home ? `lives on ${placeWords(S, uses, p.home)}${hh > 1 ? ` · a household of ${hh}` : ' · lives alone'}` : 'lives outside the City'}</div>`;
  }
  html += `<button class="follow${ctx.follow ? ' on' : ''}" data-follow="1">${ctx.follow ? 'STOP FOLLOWING' : 'FOLLOW'}</button>`;
  html += '<h3>NOW</h3>';
  html += `<div>${esc(now.doing || '')}${P ? ` ${basisTag(now.slot)}` : ''}</div>`;
  html += `<div class="sub">${now.walking ? `walking to ${placeWords(S, uses, now.to)}` : placeWords(S, uses, now.at)}</div>`;
  if (P && P.story) html += `<h3>THEIR STORY</h3><div>${esc(P.story)}</div>`;
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

// The box of person i under the pointer.
export function personTip(life, i) {
  const p = life.persons[i], now = life.now(i), P = p.person;
  return `<div class="tt-h">${P ? nameOf(P) : article(roleOf(p)).toUpperCase()}</div><div>${esc(now.doing || '')}</div>`;
}
