// Checks data/people.json (the real residents of Kowloon Walled City (九龍城寨), each from a
// published source) and writes docs/people.md. The people are separate from the rooms
// (data/room_uses.json): a person links to the research facts of the places where they lived or
// worked (linked_facts, the ids of data/room_research.json), and through them to the rooms that
// the room build gave those places (directly, through same_as, or through linked_place).
//
//     node tools/build_people.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const root = new URL('..', import.meta.url).pathname;
const json = (p) => JSON.parse(readFileSync(root + p, 'utf8'));
const data = json('data/people.json'), research = json('data/room_research.json'), uses = json('data/room_uses.json');
const facts = new Map(research.facts.map((f) => [f.id, f]));
const placeOf = new Map(uses.places.map((p) => [p.id, p]));

const problems = [];
const ids = new Set();
const CJK = /[㐀-鿿]/;
for (const p of data.people) {
  const at = `${p.id || '?'}`;
  if (!p.id || ids.has(p.id)) problems.push(`${at}: missing or repeated id`);
  ids.add(p.id);
  if (!p.name) problems.push(`${at}: no name`);
  if (p.nameZh != null && !CJK.test(p.nameZh)) problems.push(`${at}: nameZh has no Chinese characters`);
  if (!p.short || p.short.split(/\s+/).length > 4) problems.push(`${at}: short must be 1-4 words`);
  if (!p.story || p.story.split(/\s+/).length < 30) problems.push(`${at}: story too short`);
  if (!p.sources?.length || p.sources.some((s) => !s.source || !s.quote)) problems.push(`${at}: each source needs source and quote`);
  for (const f of p.linked_facts || []) if (!facts.has(f)) problems.push(`${at}: linked fact ${f} is not in data/room_research.json`);
}
if (problems.length) {
  console.log(`${problems.length} problems:\n  ${problems.join('\n  ')}`);
  process.exit(1);
}

const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const FL = (k) => (k === 0 ? 'G/F' : `${k}/F`);
// the room place of a fact: its own, else the place of the same record (same_as, for example a
// GRS file), else the place of the fact that it belongs to (linked_place, for a person)
const placeFor = (id, depth = 0) => {
  const f = facts.get(id);
  return placeOf.get(id) || (f?.same_as && placeOf.get(f.same_as))
    || (f?.linked_place && depth < 3 ? placeFor(f.linked_place, depth + 1) : null);
};
const roomsOf = (p) => {
  const out = new Map();
  for (const f of p.linked_facts || []) {
    const pl = placeFor(f);
    for (const [b, k, u] of pl?.at || []) out.set(`${b}:${k}:${u}`, `${b}:${k}:${u} (${FL(k)}, ${esc(pl.name)})`);
  }
  return [...out.values()];
};
const named = (p) => `${p.name}${p.nameZh && !p.name.includes(p.nameZh) ? ` (${p.nameZh})` : ''}`;
const in86 = (v) => (v === true ? 'yes' : v === false ? 'no' : 'not known');

const people = [...data.people].sort((a, b) => a.name.localeCompare(b.name));
const lines = [
  '# People of Kowloon Walled City',
  '',
  'This file is made by `node tools/build_people.mjs` from `data/people.json`. Do not edit it by hand.',
  '',
  `${data.about}`,
  '',
  `${people.length} people. In the City in December 1986, as their sources show: ${people.filter((p) => p.in_dec_1986 === true).length};`
    + ` not then: ${people.filter((p) => p.in_dec_1986 === false).length}; not known: ${people.filter((p) => p.in_dec_1986 == null).length}.`,
  '',
  '| Person | Who | In the City | Dec 1986 | Rooms in the model |',
  '| --- | --- | --- | --- | --- |',
  ...people.map((p) => `| [${esc(named(p))}](#${p.id}) | ${esc(p.short)} | ${esc(p.lived || '')} | ${in86(p.in_dec_1986)} | ${esc(roomsOf(p).join('; '))} |`),
  '',
];
for (const p of people) {
  lines.push(`## ${named(p)}`, '', `<a id="${p.id}"></a>**${esc(p.short)}.** ${p.story}`, '');
  if (p.home) lines.push(`- Home: ${p.home}`);
  if (p.work) lines.push(`- Work: ${p.work}`);
  if (p.lived) lines.push(`- In the City: ${p.lived}`);
  const rooms = roomsOf(p);
  if (rooms.length) lines.push(`- Rooms in the model (building:floor:unit): ${rooms.join('; ')}`);
  for (const s of p.sources) lines.push(`- ${s.source}${s.cite ? `, ${s.cite}` : ''}: "${s.quote}"`);
  lines.push('');
}
writeFileSync(root + 'docs/people.md', lines.join('\n'));
console.log(`${people.length} people; wrote docs/people.md`);
