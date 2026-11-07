// The ten mysteries of data/mysteries.json: ten real people of the week (data/people.json) to
// find, from easy (1) to hard (10). Each case gives five clues, one at a time, from weak to
// strong; the last clue helps a lot but does not give the answer. A click on the person (or, in
// a case of type "room", on the room) solves the case: its circle is checked, and its story
// opens. Until a case is solved, the name of its person is hidden in the boxes under the
// pointer, and the places of the sources that would give the answer away are hidden in the
// panels. The browser keeps the solved cases and the clues seen (localStorage).
import { esc } from '../roomUses.js';

const KEY = 'kwc-cases-1';

export class Casebook {
  // M: data/mysteries.json; people: data/people.json; uses: the room uses; life: the sim.
  constructor(M, people, uses, life) {
    this.cases = M?.cases || [];
    this.byPerson = new Map(this.cases.map((c) => [c.person, c]));
    this.people = new Map((people?.people || []).map((p) => [p.id, p]));
    this.uses = uses; this.life = life;
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { saved = {}; }
    this.solved = new Set(saved.solved || []);
    this.seen = saved.seen || {}; // case n -> clues shown (1 to 5)
    this.open = null; // the case shown in the panel, or null for the list
    // the places of the sources that name a case person, or stand in an answer room
    this.placeCase = new Map();
    for (const c of this.cases) {
      const P = this.people.get(c.person), names = [P?.name, P?.nameZh].filter(Boolean);
      for (const room of c.answer.rooms) { const r = uses.at.get(room); if (r?.place) this.placeCase.set(r.place, c.n); }
      for (const p of uses.places.values()) if (names.some((n) => p.name.includes(n) || (p.use || '').includes(n))) this.placeCase.set(p.id, c.n);
    }
    this.mark();
  }

  save() { try { localStorage.setItem(KEY, JSON.stringify({ solved: [...this.solved], seen: this.seen })); } catch { /* private mode */ } }

  // Mark the places of the open cases (the panels show them hidden: src/buildingPanel.js).
  mark() {
    for (const [id, n] of this.placeCase) { const p = this.uses.places.get(id); if (p) p.mystery = this.solved.has(n) ? 0 : n; }
  }

  // Is person i of the sim the hidden answer of an open case?
  hidden(i) {
    const p = this.life.persons[i], c = p?.real && this.byPerson.get(p.real);
    return !!c && !this.solved.has(c.n);
  }

  // A click on person i, or on room `key`: the case it solves, or null.
  tryPerson(i) {
    const p = this.life.persons[i], c = p?.real && this.byPerson.get(p.real);
    return c && !this.solved.has(c.n) ? this.solve(c) : null;
  }
  tryRoom(key) {
    const c = this.cases.find((x) => x.answer.type === 'room' && x.answer.rooms.includes(key));
    return c && !this.solved.has(c.n) ? this.solve(c) : null;
  }
  solve(c) {
    this.solved.add(c.n);
    this.seen[c.n] = Math.max(this.seen[c.n] || 1, 1);
    this.open = c.n;
    this.mark();
    this.save();
    return c;
  }

  // The index of the person of case c in the sim, or -1.
  personOf(c) { return this.life.persons.findIndex((p) => p.real === c.person); }

  nameOf(c) {
    const P = this.people.get(c.person);
    if (!P) return '';
    return `${esc(P.name)}${P.nameZh && P.nameZh !== P.name ? ` (${esc(P.nameZh)})` : ''}`;
  }

  // The panel: the list of the cases, or one case with its clues.
  html() {
    const n = this.solved.size;
    let h = `<div class="cb-head">${n} OF ${this.cases.length} FOUND</div>`;
    const c = this.cases.find((x) => x.n === this.open);
    if (!c) {
      h += '<div class="sub">Ten real people of this week of December 1986. Each case gives its clues one at a time. Find the person in the City and click them: the circle of the case is then checked.</div>';
      for (const x of this.cases) {
        const ok = this.solved.has(x.n);
        h += `<button class="cb-row${ok ? ' ok' : ''}" data-case="${x.n}"><span class="cb-dot${ok ? ' on' : ''}" aria-label="${ok ? 'found' : 'not found yet'}"></span><span class="cb-n">${x.n}</span><span class="cb-t">${esc(x.title)} <span class="zh">${esc(x.titleZh || '')}</span>${ok ? `<br><span class="n">${this.nameOf(x)}</span>` : ''}</span></button>`;
      }
      h += '<div class="sub" style="margin-top:8px">The clues and the stories come from the sources; each one names its source. Where the model gives an hour or a room that no source gives, the clue says so (inferred).</div>';
      return h;
    }
    const ok = this.solved.has(c.n), shown = ok ? c.clues.length : Math.max(1, this.seen[c.n] || 1);
    h += `<button class="cb-back" data-case="0">‹ ALL CASES</button>`;
    h += `<div class="nm"><span class="cb-dot big${ok ? ' on' : ''}"></span>${c.n}. ${esc(c.title)} <span class="zh">${esc(c.titleZh || '')}</span></div>`;
    h += `<div class="cb-brief">${esc(c.brief)}</div>`;
    if (ok) {
      h += `<h3>FOUND · ${this.nameOf(c)}</h3><div class="cb-story">${esc(c.solved)}</div>`;
      h += `<button class="follow" data-show="${c.n}">SHOW ME ${c.answer.type === 'room' ? 'THE ROOM' : 'THIS PERSON'}</button>`;
    }
    h += '<h3>CLUES</h3>';
    c.clues.slice(0, shown).forEach((x, q) => {
      h += `<div class="cb-clue"><span class="k">${q + 1}</span><span>${esc(x.text)}<br><span class="n">${esc(x.source)}${x.cite ? `, ${esc(x.cite)}` : ''}</span></span></div>`;
    });
    if (!ok && shown < c.clues.length) h += `<button class="cb-more" data-more="${c.n}">NEXT CLUE (${shown + 1} OF ${c.clues.length})</button>`;
    if (ok) {
      if (c.sources?.length) {
        h += '<h3>SOURCES</h3>';
        for (const x of c.sources.slice(0, 5)) h += `<div class="sub">${esc(x.source)}${x.cite ? `, ${esc(x.cite)}` : ''}${x.quote ? `: <i>“${esc(String(x.quote).slice(0, 220))}”</i>` : ''}</div>`;
      }
    } else h += '<div class="sub" style="margin-top:8px">Find the person and click them. The clock runs: the people move through their day.</div>';
    return h;
  }

  more(n) { this.seen[n] = Math.min(5, Math.max(1, this.seen[n] || 1) + 1); this.save(); }
}
