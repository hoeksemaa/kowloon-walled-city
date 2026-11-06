// Checks the floor layers of the main app (src/cityLayers.js): each piece of the structure is in
// the layer of its floor index, the layers pulled apart have a clear gap between them, and the
// peel takes away all that is over the peeled storey.
//
// The meshes need a browser, thus this check runs in the page. Serve the repository
// (python3 serve.py 8173), open http://127.0.0.1:8173/, and in the console of the page:
//
//     (await import('./tools/check_stack.js')).checkStack(kwc)
//
// It returns 'ok', or a list of problems. It checks that:
// - each vertex of the meshes of layer k has layer k in aInfo.y, and lies in the storey k of its
//   building: from its floor (for G/F, its foot on the lowest ground) to its next floor, with
//   1.2 m for the railings of a bridge; a link (a bridge, the steps at a door) reaches down to
//   the other end of its doors (the neighbour's floor, the lane); a roof (layer n) from the
//   underside of its slab up to its huts, its hipped roof or the top of a ladder;
// - each building has its G/F in layer 0 and its roof in layer n (n storeys);
// - pulled apart, the highest point of each layer is at least GAP m under the lowest point of
//   the next one, and the dark plate under each layer lies in that gap;
// - peeled to storey c, the layers over c are hidden; the walls of storey c of each building
//   that has it end PEEL_H m over its floor c, and the other buildings are whole; the inside of a
//   floor shows only on the peeled storey, or with the layers apart.
// The spread and the peel are put back at the end.
import { GAP, PEEL_H } from '../src/cityLayers.js';
import { KIND } from '../src/city/mesh.js';

export async function checkStack(kwc) {
  const { layers, S } = kwc;
  const problems = [];
  const say = (t) => { if (problems.length < 40) problems.push(t); };
  const spread0 = layers.spread, peel0 = layers.peelK;

  // ---- each vertex in the storey of its building ----
  // A link (a bridge, the steps at a door) reaches down to the other end of its doors: the
  // floor of the same storey of the neighbour, or the lane.
  const linkLo = new Map();
  for (const d of S.doors) {
    if (d.k === undefined) continue;
    const key = `${d.b}:${d.k}`, y = Math.min(d.y, d.yc ?? d.y, d.ground ?? d.y) - 0.35;
    linkLo.set(key, Math.min(linkLo.get(key) ?? Infinity, y));
  }
  const has = Array.from({ length: layers.n }, () => new Set());
  const band = layers.layers.map(() => [Infinity, -Infinity]);
  for (const lv of layers.layers)
    for (const m of lv.meshes) {
      const g = m.geometry, P = g.attributes.position.array, I = g.attributes.aInfo.array, idx = g.index.array;
      for (let q = 0; q < idx.length; q++) {
        const v = idx[q], b = I[v * 3], k = I[v * 3 + 1], y = P[v * 3 + 1], B = S.list[b];
        if (k !== lv.k) { say(`layer ${lv.k}: a vertex of building ${b} has layer ${k}`); continue; }
        has[k].add(b);
        band[k][0] = Math.min(band[k][0], y); band[k][1] = Math.max(band[k][1], y);
        let lo = k === 0 ? B.foot - 0.35 : k < B.n ? B.y[k] - 0.4 : B.y[B.n] - 0.2;
        if (I[v * 3 + 2] === KIND.LINK) lo = Math.min(lo, linkLo.get(`${b}:${k}`) ?? lo);
        const hi = k < B.n ? B.y[k + 1] + 1.25 : B.y[B.n] + 12;
        if (y < lo - 0.01 || y > hi + 0.01) say(`building ${b} layer ${k}: a vertex at ${y.toFixed(2)} m, out of ${lo.toFixed(2)}..${hi.toFixed(2)}`);
      }
    }
  for (const B of S.list) {
    if (!has[0].has(B.id)) say(`building ${B.id}: no G/F in layer 0`);
    if (!has[B.n].has(B.id)) say(`building ${B.id}: no roof in layer ${B.n}`);
  }

  // ---- the gaps, pulled apart ----
  layers.setSpread(1);
  for (let k = 0; k + 1 < layers.n; k++) {
    const top = band[k][1] + layers.layers[k].group.position.y, next = band[k + 1][0] + layers.layers[k + 1].group.position.y;
    if (next - top < GAP - 0.01) say(`layers ${k} and ${k + 1} pulled apart: only ${(next - top).toFixed(2)} m between them`);
    const { plate } = layers.plates[k + 1];
    if (!plate.visible || plate.position.y <= top || plate.position.y >= next) say(`pulled apart: the dark plate under layer ${k + 1} is not in the gap over layer ${k}`);
  }

  // ---- the peel ----
  const tops = [0, 4, 9, layers.top - 1];
  for (const e of [0, 1]) {
    layers.setSpread(e);
    for (const c of tops) {
      layers.setPeel(c);
      for (const lv of layers.layers) {
        if (lv.group.visible !== lv.k <= c) say(`peeled to ${c}: layer ${lv.k} ${lv.group.visible ? 'shows' : 'is hidden'}`);
        for (const m of lv.meshes) if (m.userData.inside && m.visible !== (e > 0.01 || lv.k === c)) say(`peeled to ${c}, spread ${e}: the inside of layer ${lv.k} ${m.visible ? 'shows' : 'is hidden'}`);
      }
      for (const B of S.list) {
        const want = B.n > c ? B.y[c] + PEEL_H : null, got = layers.ycut[B.id];
        if (want === null ? got < 1e4 : Math.abs(got - want) > 1e-3) say(`peeled to ${c}: building ${B.id} is cut at ${got}`);
      }
    }
  }
  layers.setPeel(-1);
  if (layers.layers.some((lv) => !lv.group.visible)) say('no peel: a layer is hidden');

  layers.setSpread(spread0);
  layers.setPeel(peel0);
  return problems.length ? problems : 'ok';
}
