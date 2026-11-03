// Applies data/structure_fixes.json to the traced plan (data/plan.json) and to the towers of
// the 1987 figure-ground plan (data/book_overlay.json), before buildLayout. Each fix is a
// correction from a source (see its "why"): strips of pavement that the trace made into plots,
// the Yamen compound as it stood in 1987, an edge between two buildings, and the low temporary
// structures on the east edge. No three.js here.
import { decodePlan, decodeFine } from '../layout.js';

const ALPH = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
const OPEN = { lane: 1, yard: 2, road: 3 };
const WHERE = { outside: 0, ...OPEN };

const pip = (ring, x, z) => {
  let s = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, zi] = ring[i], [xj, zj] = ring[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) s = !s;
  }
  return s;
};

// The cell rules on one grid of codes: W x D cells of sc metres, in the plan frame of
// buildLayout (cell (i, j) has its centre at (-W*sc/2 + (i + 0.5)*sc, -D*sc/2 + (j + 0.5)*sc)).
// Returns the count of cells that each rule set.
function applyRules(code, W, D, sc, rules) {
  const X = (i) => (-W / 2 + i + 0.5) * sc, Z = (j) => (-D / 2 + j + 0.5) * sc;
  const changed = [];
  for (const rule of rules) {
    const w = rule.where || {}, codes = w.codes ? new Set(w.codes) : null;
    const to = typeof rule.set === 'number' ? rule.set : rule.set === 'outside' ? 0 : OPEN[rule.set];
    if (to === undefined) throw new Error(`structure_fixes: bad set ${rule.set}`);
    let n = 0;
    const set = [];
    for (let j = 0; j < D; j++)
      for (let i = 0; i < W; i++) {
        const k = j * W + i, v = code[k], x = X(i), z = Z(j);
        const isOpen = w.open && v === WHERE[w.open];
        if (codes || w.open) { if (!(codes && codes.has(v)) && !isOpen) continue; }
        if (w.x && (x < w.x[0] || x > w.x[1])) continue;
        if (w.z && (z < w.z[0] || z > w.z[1])) continue;
        if (w.poly && !pip(w.poly, x, z)) continue;
        if (w.left) {
          const [[ax, az], [bx, bz]] = w.left;
          if ((bx - ax) * (z - az) - (bz - az) * (x - ax) <= 0) continue;
        }
        set.push([k, v]);
      }
    for (const [k] of set) code[k] = to;
    // keepLanes: a row of cells that starts at the end of a lane stays as it was (a lane goes on
    // through the strip to the street).
    if (rule.keepLanes)
      for (const [k, v] of set) {
        const j = (k / W) | 0;
        let i = k % W;
        while (i > 0 && code[j * W + i - 1] === to) i--;
        if (i > 0 && code[j * W + i - 1] === OPEN.lane) code[k] = v;
      }
    for (const [k] of set) if (code[k] === to) n++;
    changed.push(n);
  }
  return changed;
}

// plan, overlay: the parsed JSON files; fixes: data/structure_fixes.json; fine (optional):
// data/plan_fine.json. Returns new objects. With fine, the new plan has plan.fine = { SUB, W,
// D, code }, with the same rules applied to it.
export function applyFixes(plan, overlay, fixes, fine = null) {
  const code = decodePlan(plan), W = plan.W, D = plan.D;
  const rules = fixes.cells || [];
  const changed = applyRules(code, W, D, 1, rules);
  let fineOut = null;
  if (fine) {
    const fc = decodeFine(fine);
    const changedFine = applyRules(fc, fine.W, fine.D, 1 / fine.SUB, rules);
    fineOut = { SUB: fine.SUB, W: fine.W, D: fine.D, code: fc, changed: changedFine };
  }
  const rows = [];
  for (let j = 0; j < D; j++) {
    let s = '';
    for (let i = 0; i < W; i++) { const v = code[j * W + i]; s += ALPH[v >> 6] + ALPH[v & 63]; }
    rows.push(s);
  }
  const not = new Set(fixes.notYamen || []);
  const yamenPlots = [...plan.yamenPlots.filter((c) => !not.has(c)), ...(fixes.yamen || [])];
  const newPlan = { ...plan, rows, yamenPlots };
  if (fineOut) newPlan.fine = fineOut;
  // Towers: the new halls are one tower (the Yamen); the plots taken out of the Yamen stand
  // alone; the plots that no longer exist leave their groups.
  const left = new Set(code);
  const own = new Set(fixes.ownTower || []), hall = new Set(fixes.yamen || []);
  const groups = [];
  let yamenGroup = null;
  for (const g of overlay.towers.groups) {
    const isYamen = g.some((c) => plan.yamenPlots.includes(c));
    const keep = g.filter((c) => left.has(c) && !own.has(c));
    if (isYamen && !yamenGroup) { yamenGroup = [...keep.filter((c) => yamenPlots.includes(c)), ...hall]; groups.push(yamenGroup); }
    else if (keep.length) groups.push(keep);
  }
  if (!yamenGroup) groups.push([...hall]);
  for (const c of own) if (left.has(c) && !groups.some((g) => g.includes(c))) groups.push([c]);
  const newOverlay = { ...overlay, towers: { ...overlay.towers, groups } };
  return { plan: newPlan, overlay: newOverlay, changed };
}
