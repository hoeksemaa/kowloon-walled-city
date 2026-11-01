// The panel of the selected building (main.js). It gives the facts of one building and never a
// list of its people: its name and size, its blocks, the use of each storey in the colours of
// the legend, the premises of the clearance files and of the book, its flats and the number of
// its simulated residents, its stairs and its links to other buildings, and the sources.
import { USE_LABEL, TRADE_LABEL, bldgOf, blocksOf, bldgName, bldgAddresses } from './layout.js';
import { floorName } from './floorplan.js';
import { USE_COLORS } from './cityMesh.js';

// Where the storeys of a tower come from (t.storeysFrom, layout.js).
const STOREYS_FROM = {
  south: 'storeys from Lambot’s 1990 south elevation (M+ 2017.412)',
  p132: 'storeys after “12 storeys and more” on Tung Tau Tsuen Road from 1972 (p132)',
  p336: '“a 14-storey building appeared on Tung Tau Tsuen Road in 1975” (p336); that it is this building is inferred',
  hut: 'storeys inferred: a hut, with no building on the 1987 plan and no block on the 1992 map',
  photos: 'storeys inferred from the 1989 aerial photos: a tall rim, and lower blocks round the Yamen',
};

// One premises of a floor: its names and trade, and the page of the book that names it. The
// trade is left out when the name says it.
export function premLine(p) {
  const book = p.book ? ` · <span class="tt-book">BOOK p${p.page}</span>${p.inferred ? ' (INFERRED for 1986)' : ''}` : '';
  const trade = TRADE_LABEL[p.trade] || '';
  return `${p.nameZh || ''} ${p.nameEn || ''} <i>${(p.nameEn || '').toLowerCase().includes(trade.toLowerCase()) ? '' : trade}</i>${book}`;
}

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
// The colour chip of a floor use, as in the legend; dashed if the use is inferred.
const chip = (use, inf) => `<span class="sq${inf ? ' inf' : ''}" style="background:${USE_COLORS[use]}"></span>`;
// A block in a short form: front, rear, or its letter.
const tag = (b) => (b.block === 'Front Block' ? 'front' : b.block === 'Rear Block' ? 'rear' : b.block ? b.block.slice(6) : '');
const blk = (b) => (b.block.startsWith('Block') ? b.block : `the ${b.block}`);
const floorList = (fs) => [...fs].sort((a, b) => a - b).map(floorName).join(', ');

// The body of the panel of building id. residents: the simulated residents of each plot; cut:
// the cut storey, or -1.
export function panelHtml(L, id, residents, cut) {
  const B = L.buildings, ps = blocksOf(L, id), bs = ps.map((p) => B[p]), mine = new Set(ps);
  const yamen = bs[0].kind === 'yamen', many = bs.length > 1 && !yamen;
  const floors = Math.max(...bs.map((b) => b.floors)), area = bs.reduce((s, b) => s + b.area, 0);
  const name = bldgName(L, id), addrs = bldgAddresses(L, id);
  const out = [];

  // ---- name and size ----
  out.push(`<div class="nm">${yamen ? 'The Yamen 衙門' : name}</div>`);
  if (addrs && addrs !== name) out.push(`<div>${addrs}</div>`);
  out.push(`<div class="sub">${plural(floors, 'storey')} · footprint about ${area.toLocaleString('en')} m² · ${yamen ? `${bs.length} halls` : plural(bs.length, 'block')}</div>`);
  if (yamen) out.push('<div>Qing-era official compound, the one old building left in the city</div><div>in the 1980s: old people’s centre (老人中心), per the exhibit plan</div>');
  if (bs.some((b) => b.front === 'top')) out.push('<div class="n">fronts Tung Tau Tsuen Road</div>');
  else if (bs.some((b) => b.front === 'road')) out.push('<div class="n">fronts a road on the old wall base</div>');
  const fac = bs.filter((b) => b.factory);
  if (fac.length) out.push(`<div class="n">factory site marked on the exhibit plan${many ? ` (${fac.map(tag).join(', ')})` : ''}</div>`);

  // ---- blocks ----
  if (many) {
    // A block that no file names gets its place by house-number order ("near"), if that is not
    // the address of another block.
    out.push('<h3>BLOCKS</h3>');
    const files = new Set(bs.map((b) => b.address).filter(Boolean));
    for (const b of bs) {
      const at = b.address || (b.near && !files.has(b.near) ? `<i>near ${b.near}</i>` : '<i>no file address</i>');
      out.push(`<div class="r bl"><span class="k">${b.block}</span><span>${at} <i>· ${b.area} m²</i></span></div>`);
    }
  }

  // ---- storeys, from the top ----
  // On each storey, the blocks of one use (and one source) go together.
  out.push(`<h3>STOREYS · FLOOR USE</h3><div class="n">click a storey to cut the city there</div>`);
  let inferred = false;
  for (let k = floors - 1; k >= 0; k--) {
    const parts = [];
    for (const b of bs) {
      if (b.floors <= k) continue;
      const use = b.uses[k], inf = !!(b.inferred && b.inferred[k]);
      let q = parts.find((x) => x.use === use && x.inf === inf);
      if (!q) parts.push((q = { use, inf, blocks: [], flats: 0 }));
      q.blocks.push(tag(b));
      q.flats += b.flats;
      inferred ||= inf;
    }
    const label = (q) => (q.use === 'home' && q.flats ? plural(q.flats, 'flat') : USE_LABEL[q.use]) + (q.inf ? ' *' : '');
    const row = parts.map((q) => `<span class="p">${chip(q.use, q.inf)}${label(q)}${many && parts.length > 1 ? ` <i>${q.blocks.join(', ')}</i>` : ''}</span>`).join('');
    const cls = k === cut ? ' sel' : cut >= 0 && k > cut ? ' above' : '';
    out.push(`<button class="st${cls}" data-k="${k}" title="Cut the city at ${floorName(k)}"><span class="k">${floorName(k)}</span><span class="u">${row}</span></button>`);
  }
  if (inferred) out.push('<div class="n">* trade inferred from the Kai Fong count of 1983, not from a file</div>');

  // ---- premises ----
  const recs = [], book = [];
  for (const b of bs)
    for (const f of Object.keys(b.prem).map(Number))
      for (const p of b.prem[f]) (p.refs ? recs : book).push({ b, f, p });
  const prem = (list) => list.sort((x, y) => y.f - x.f)
    .map(({ b, f, p }) => `<div class="r"><span class="k">${floorName(f)}</span><span>${premLine(p)}${many ? ` <i>· ${tag(b)}</i>` : ''}</span></div>`).join('');
  if (recs.length || book.length) {
    out.push('<h3>PREMISES</h3>');
    if (recs.length) out.push(`<div class="n">in the clearance files (GRS HKRS1255-3):</div>${prem(recs)}`);
    if (book.length) out.push(`<div class="n">in City of Darkness Revisited (2014), place by address:</div>${prem(book)}`);
  }

  // ---- flats and residents: one number, no names ----
  let flats = 0;
  const perFloor = new Set();
  for (let k = 0; k < floors; k++) {
    let n = 0;
    for (const b of bs) if (b.floors > k && b.uses[k] === 'home') n += b.flats;
    flats += n;
    if (n) perFloor.add(n);
  }
  const people = ps.reduce((s, p) => s + (residents.get(p) || 0), 0);
  if (flats || people) {
    const top = Math.max(0, ...perFloor);
    out.push(`<h3>FLATS · RESIDENTS</h3><div><b>${flats}</b> flat${flats === 1 ? '' : 's'}${flats ? `, ${perFloor.size > 1 ? 'up to ' : ''}${top} a floor` : ''} · <b>${people}</b> resident${people === 1 ? '' : 's'} (simulated)</div>
      <div class="n">flats sized so that the city holds 8,800 (p340): inferred</div>`);
  }

  // ---- stairs and links ----
  const way = [];
  const stairs = bs.reduce((s, b) => s + b.cores.length, 0);
  if (stairs) way.push(`<div class="r w"><span class="k">stairs</span><span>${stairs}</span></div>`);
  // The blocks with no stair of their own, by the stair that they use.
  const uses = new Map();
  for (const b of bs) {
    if (b.shareWith < 0) continue;
    const o = B[b.shareWith], whose = mine.has(o.id) ? blk(o) : bldgName(L, bldgOf(L, o.id));
    if (!uses.has(whose)) uses.set(whose, []);
    uses.get(whose).push(b);
  }
  for (const [whose, list] of uses) {
    const who = !many ? 'uses' : list.length === 1 ? `${blk(list[0])} uses` : list.length === 2 && bs.length === 2 ? 'both blocks use' : `Blocks ${list.map(tag).join(', ')} use`;
    way.push(`<div class="r w"><span class="k">shared</span><span>${who} the stair of ${whose}</span></div>`);
  }
  const guests = new Set(B.filter((b) => mine.has(b.shareWith) && !mine.has(b.id)).map((b) => bldgOf(L, b.id)));
  if (guests.size) way.push(`<div class="r w"><span class="k">shared</span><span>its stair also serves ${[...guests].map((g) => bldgName(L, g)).join('; ')}</span></div>`);
  if (!stairs && !bs.some((b) => b.shareWith >= 0) && !yamen) way.push(`<div class="r w"><span class="k">stairs</span><span>none drawn${floors <= 2 ? ' (two storeys or fewer)' : ''}</span></div>`);
  const R = L.routes, other = (b, c) => (mine.has(b) ? c : mine.has(c) ? b : -1);
  if (R) {
    const links = new Map(), add = (o, f) => { const g = bldgOf(L, o); if (!links.has(g)) links.set(g, new Set()); links.get(g).add(f); };
    R.doorsAt.forEach((list, f) => { for (const d of list || []) if (d.link) { const o = other(d.b, d.c); if (o >= 0) add(o, f); } });
    for (const [g, fs] of links) way.push(`<div class="r w"><span class="k">link</span><span>${floorList(fs)} to ${bldgName(L, g)}</span></div>`);
    for (const d of R.bridges) {
      const o = other(d.b, d.c);
      if (o >= 0) way.push(`<div class="r w"><span class="k">bridge</span><span>${floorName(d.f)}, over the lane to ${bldgName(L, bldgOf(L, o))}</span></div>`);
    }
    for (const h of R.hops) {
      const o = h.ta === id ? h.tb : h.tb === id ? h.ta : -1;
      if (o >= 0) way.push(`<div class="r w"><span class="k">roof</span><span>${R.towerTop[h.ta] === R.towerTop[h.tb] ? 'a step across' : 'a ladder'} to ${bldgName(L, o)}</span></div>`);
    }
  }
  if (way.length) out.push(`<h3>STAIRS · LINKS</h3>${way.join('')}<div class="n">stairs after Suenn Ho’s types (pp138–139) · where each stair, link and bridge is: inferred</div>`);

  // ---- sources ----
  const t = L.towers[id];
  out.push('<h3>SOURCES</h3>');
  if (yamen) out.push(`<div class="n">the ${bs.length} halls of the Yamen as one compound, traced from the 1980s street plan</div><div class="n">one storey · walls and roofs from the traced plots · the roof form of each hall is inferred</div>`);
  else {
    out.push('<div class="n">plots from the 1980s street plan · grouping from the 1987 figure-ground plan (p134), checked by eye</div>');
    out.push(`<div class="n">${STOREYS_FROM[t.storeysFrom] || 'storeys inferred'}</div>`);
    if (bs.some((b) => b.address || b.near)) out.push('<div class="n">a block takes its address by house-number order along the street: approximate</div>');
  }

  return out.join('');
}
