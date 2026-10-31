// "Find them" 尋人: three people of City of Darkness Revisited to find in the running model.
// Each case has five hints, each stronger than the one before: who, how, where, which, show.
// The facts and their pages come from the book; the hours of the people are INFERRED
// (people.js). The functions here read the model and draw nothing, thus a test can run them
// (tools/check_game.mjs).
import { STOREY } from './layout.js';
import { hash2 } from './util.js';

export const CASES = [
  {
    key: 'postman',
    title: 'The postman',
    zh: '郵差',
    name: 'Lam Po Chun',
    find: (a) => a.real && a.real.key === 'postman',
    who: ['Locals called him "hu xu zi" (beardie), or postman Ah-Po. He had a small moustache.', 'p146'],
    looks: ['Postmen wore a hat, "standard issue against the constant dripping in the alleyways". In the book’s photos of a postman, the hat is navy and the bag is brown canvas.', 'pp144, 148–149'],
    how: ['His round starts at a store on Lo Yan Street. He works one north–south lane, then the side alleys. He climbs one stair, crosses the roofs by ladders and windows, and goes down another.', 'pp145–146'],
    usual: 'from 8:20, Monday to Saturday',
  },
  {
    key: 'pigeons',
    title: 'The pigeon breeder',
    zh: '養鴿人',
    name: 'Chan Kwan Leung',
    find: (a) => a.real && a.real.book === 1,
    who: ['In 1981 he left his job and bred racing pigeons on a roof that he rented for HK$1,500 a month.', 'pp318–320'],
    looks: ['He wears a black polo and jeans.', 'p321'],
    how: ['He flies the birds "usually in mid-afternoon when there was a lull in the number of landings at Kai Tak". Look for the flock over his roof.', 'p321'],
    usual: 'on his roof at about 6:50 and from 14:10',
    place: 'The book gives no address. The 1992 map puts him at the north end of Lo Yan Street, thus his roof is APPROXIMATE.',
  },
  {
    key: 'noodles',
    title: 'The noodle maker',
    zh: '麵廠',
    name: 'Hui Tung Choy',
    find: (a) => a.real && a.real.book === 14,
    who: ['He has made noodles at the back of 2 Kwong Ming Street since 1965, in "barely 200 square feet", with no windows and a narrow door.', 'p170'],
    looks: ['He wears a grey flat cap dusted with flour.', 'p171'],
    how: ['His family’s flat is above the factory.', 'p170'],
    usual: 'from 6:30, Monday to Saturday',
  },
];

export const STEPS = ['Who', 'How', 'Where', 'Which', 'Show'];
const FLOOR = (k) => (k === 0 ? 'G/F' : `${k}/F`);
const clock = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(Math.floor(m % 60)).padStart(2, '0')}`;

// Where a person is now, or null when outside the City. kind: 'in' a building, 'roof',
// 'lane' on the ground, or 'link' on a bridge over a lane. b: the building, or the nearest one.
export function spot(L, sim, a) {
  const o = a.id * 4, P = sim.aP;
  if (P[o + 3] < 0) return null;
  const x = P[o], z = P[o + 1];
  const i = Math.floor(x - L.x0), j = Math.floor(z - L.z0), k = j * L.W + i;
  let b = L.owner[k] >= 0 ? L.owner[k] : -1, bd = Infinity;
  if (b < 0)
    for (let dj = -3; dj <= 3; dj++)
      for (let di = -3; di <= 3; di++) {
        const c = (j + dj) * L.W + i + di;
        if (L.owner[c] >= 0 && di * di + dj * dj < bd) { bd = di * di + dj * dj; b = L.owner[c]; }
      }
  if (b < 0) for (const q of L.buildings) { const d = Math.hypot(q.cx - x, q.cz - z); if (q.kind !== 'yamen' && d < bd) { bd = d; b = q.id; } }
  const roof = !!(a.loc && a.loc.type === 'roof') || (b >= 0 && L.owner[k] === b && P[o + 2] >= L.buildings[b].floors * STOREY - 0.5);
  const level = Math.round(P[o + 2] / STOREY);
  const kind = roof ? 'roof' : L.owner[k] >= 0 ? 'in' : level > 0 ? 'link' : 'lane';
  return { x, z, level, kind, b };
}

// The minute when someone outside the City comes back today, or null.
export function returnTime(a, minute) {
  for (let s = a.si + 1; s < a.sched.length; s++) if (a.sched[s][0] > minute && a.sched[s][1].type !== 'away') return a.sched[s][0];
  return null;
}

// The streets nearest a point, by their lane cells or the buildings that give them an address.
function nearStreets(L, x, z) {
  const out = [];
  for (const st of L.streets) {
    let d = Infinity;
    const cells = L.streetLanes[st.key];
    if (cells && cells.length) for (let q = 0; q < cells.length; q += 2) d = Math.min(d, Math.hypot(L.cellX(cells[q]) - x, L.cellZ(cells[q]) - z));
    else if (L.addr[st.key]) for (const id of L.addr[st.key].F) d = Math.min(d, Math.hypot(L.buildings[id].cx - x, L.buildings[id].cz - z));
    if (d < Infinity && !out.some((o) => o.name === st.name)) out.push({ name: st.name, d });
  }
  return out.sort((p, q) => p.d - q.d);
}

// Hint n (0-4) for case c at this minute. Returns { text, page, ring, tower, cut, follow }.
// ring: a circle on the ground that holds the person; tower: the tower to light up; cut: the
// storey to open; follow: a ring that follows the person.
export function hint(L, sim, c, a, n, minute) {
  if (n === 0) return { text: `${c.who[0]} ${c.looks[0]}`, page: `${c.who[1]}; ${c.looks[1]}` };
  const now = sim.describe(a).now.replace(/ \(pp?[\d–-]+\)/g, '');
  const at = spot(L, sim, a);
  if (n === 1) {
    const out = at ? `At ${clock(minute)} he is ${now.replace(/^walking → /, 'on his way to ')}.`
      : (() => { const r = returnTime(a, minute); return `At ${clock(minute)} he is outside the City (${now}). ${r !== null ? `He comes back at about ${clock(r)}.` : `He does not come back today; he is usually in the City ${c.usual}.`} You can move the clock.`; })();
    return { text: `${c.how[0]} ${out}`, page: c.how[1] };
  }
  if (!at) {
    const r = returnTime(a, minute);
    return { text: `He is outside the City now. ${r !== null ? `He comes back at about ${clock(r)}.` : `He does not come back today; he is usually in the City ${c.usual}.`} Move the clock, then ask again.`, page: '', away: true, back: r };
  }
  const B = L.buildings, b = B[at.b], t = L.towers[b.tower];
  if (n === 2) {
    // A circle of 24 m that holds the person, not centred on them.
    const h = hash2(CASES.indexOf(c) * 977 + Math.floor(minute / 30), sim.day);
    const ang = h * 2 * Math.PI, off = 4 + hash2(h * 1e4, 7) * 10;
    const ring = { x: at.x + Math.cos(ang) * off, z: at.z + Math.sin(ang) * off, r: 24 };
    const st = nearStreets(L, ring.x, ring.z);
    const text = st.length > 1 && st[1].d < 35 ? `Between ${st[0].name} and ${st[1].name}.` : st.length ? `Near ${st[0].name}.` : 'In the City.';
    return { text: `${text} The circle on the map holds him.`, page: '', ring };
  }
  const top = Math.max(...t.blocks.map((id) => B[id].floors));
  if (n === 3) {
    let text;
    if (at.kind === 'roof') text = 'On the roofs of this tower.';
    else if (at.kind === 'lane') text = 'On the ground, in the lane beside this tower.';
    else if (at.kind === 'link') text = `On a link over the lane at ${FLOOR(at.level)}, beside this tower.`;
    else {
      const lo = Math.max(0, at.level - Math.floor(hash2(at.b, Math.floor(minute / 30)) * 3)), hi = Math.min(top - 1, lo + 2);
      text = lo === hi ? `On ${FLOOR(lo)} of this tower.` : `Between ${FLOOR(lo)} and ${FLOOR(hi)} of this tower.`;
      return { text: `${text} The tower glows.`, page: '', tower: b.tower, lo, hi };
    }
    return { text: `${text} The tower glows.`, page: '', tower: b.tower };
  }
  return {
    text: at.kind === 'in' ? `${FLOOR(at.level)}: the storey is open, and a ring marks him.` : 'A ring marks him.',
    page: '', tower: b.tower, cut: at.kind === 'in' ? at.level : -1, follow: true,
  };
}
