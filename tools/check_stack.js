// Checks that the storeys stack: the normal view is the exploded view with its storeys put
// back together. Each drawn piece is part of one storey and moves only with that storey, so
// nothing stretches, and nothing comes or goes when the storeys are pulled apart.
//
// The meshes need a browser, thus this check runs in the page. Serve the repository
// (python3 serve.py 8173), open http://127.0.0.1:8173/, and in the console of the page:
//
//     (await import('./tools/check_stack.js')).checkStack(kwc)
//
// It returns 'ok', or a list of problems. It checks that:
// - each vertex of the meshes of storey k (and of the plan of each cut storey) has storey k
//   in aInfo.y, and no vertex is more than 0.3 m below the floor of storey k (a cage or an
//   air-conditioner can sit a little below it, on the floor line of its tower);
// - each sign starts on its own storey, and each aerial and washing line of storey k stands
//   on the roof of storey k (no more than 5 m over it);
// - each segment of a cable or a pipe is in one storey: it lies inside that storey (or above
//   the roof, for the top storey), and when the storeys are pulled apart, both of its ends
//   move up by the lift of that storey; with a cut storey, no segment rises above the section;
// - each person is drawn with the lift of one whole storey, at this time and for 40 minutes
//   of the morning, in steps of 2 seconds (people on the stairs, ladders and roofs).
// The clock and the cut are put back at the end.
import { STOREY } from '../src/layout.js';
import { CUT_H } from '../src/kinds.js';

export async function checkStack(kwc) {
  const { levels, wires, sim, people, state, setCut, offsets } = kwc;
  const problems = [];
  const say = (t) => { if (problems.length < 40) problems.push(t); };
  const cut0 = state.cut, minute0 = sim.minute;

  // ---- meshes ----
  const meshCheck = (name, g, k) => {
    const P = g.attributes.position.array, I = g.attributes.aInfo.array;
    let wrong = 0, low = 0;
    for (let i = 0; i < P.length / 3; i++) {
      if (I[i * 4 + 1] !== k) wrong++;
      if (P[i * 3 + 1] < k * STOREY - 0.3) low++;
    }
    if (wrong) say(`${name} of storey ${k}: ${wrong} vertices of another storey`);
    if (low) say(`${name} of storey ${k}: ${low} vertices more than 0.3 m below its floor`);
  };
  for (const lv of levels) {
    const k = lv.k;
    meshCheck('mesh', lv.mesh.geometry, k);
    if (lv.cutout) meshCheck('see-through mesh', lv.cutout.geometry, k);
    if (lv.signs) {
      // a face of a sign: 4 vertices, the lowest on the storey
      const P = lv.signs.geometry.attributes.position.array;
      let out = 0;
      for (let q = 0; q < P.length / 3; q += 4) {
        const lo = Math.min(P[q * 3 + 1], P[q * 3 + 4], P[q * 3 + 7], P[q * 3 + 10]);
        if (lo < k * STOREY - 0.01 || lo > (k + 1) * STOREY) out++;
      }
      if (out) say(`signs of storey ${k}: ${out} faces start off the storey`);
    }
    const A = lv.antennas.geometry.attributes.position.array, roof = (k + 1) * STOREY;
    let off = 0;
    for (let i = 1; i < A.length; i += 3) if (A[i] < roof - 0.01 || A[i] > roof + 5.01) off++;
    if (off) say(`aerials of storey ${k}: ${off} points off the roof of the storey`);
  }
  for (const lv of levels) {
    setCut(lv.k);
    meshCheck('plan', lv.plan.mesh.geometry, lv.k);
  }

  // ---- cables and pipes ----
  const lift = Float32Array.from({ length: 16 }, (_, k) => k * 13);
  const drawn = (off, cut) => {
    wires.update(off, cut);
    return wires.layers.map((l) => ({ P: l.pos.slice(0, l.geometry.instanceCount * 6), n: l.geometry.instanceCount }));
  };
  const rest = drawn(new Float32Array(16), -1), apart = drawn(lift, -1);
  wires.layers.forEach((l, li) => {
    const R = l.rest, K = l.k, A = rest[li].P, B = apart[li].P;
    let outside = 0, moved = 0;
    if (rest[li].n !== K.length || apart[li].n !== K.length) say(`${l.key}: ${K.length} segments, but ${rest[li].n} and ${apart[li].n} drawn`);
    for (let i = 0; i < K.length; i++) {
      const k = K[i], r = i * 6;
      if (k !== Math.floor(k)) say(`${l.key}: segment ${i} has storey ${k}`);
      for (const y of [R[r + 1], R[r + 4]]) if (y < k * STOREY - 0.01 || y > (k + 1) * STOREY + 0.81) outside++;
      for (let j = 0; j < 6; j++) {
        const d = B[r + j] - A[r + j], want = j === 1 || j === 4 ? lift[k] : 0;
        if (Math.abs(d - want) > 1e-3) { moved++; break; }
      }
    }
    if (outside) say(`${l.key}: ${outside} segment ends outside their storey`);
    if (moved) say(`${l.key}: ${moved} segments do not move with their storey`);
  });
  for (const c of [0, 3, 6, 9]) {
    const top = c * STOREY + CUT_H + 0.05;
    drawn(new Float32Array(16), c).forEach(({ P, n }, li) => {
      let over = 0;
      for (let i = 0; i < n; i++) if (P[i * 6 + 1] > top + 1e-3 || P[i * 6 + 4] > top + 1e-3) over++;
      if (over) say(`${wires.layers[li].key}: ${over} segments above the section of ${c}/F`);
    });
  }
  setCut(cut0);
  wires.update(offsets, cut0);

  // ---- people ----
  const P = sim.aP;
  let bad = 0;
  const peopleCheck = () => {
    for (let i = 0; i < sim.agents.length; i++) {
      const lv = P[i * 4 + 3], y = P[i * 4 + 2];
      if (lv < 0) continue;
      // whole, and the storey of the piece underfoot: at most one storey and a roof below them
      if (lv !== Math.floor(lv) || y < lv * STOREY - 0.01 || y > (lv + 2) * STOREY + 0.01) {
        if (!bad) say(`person ${i}: storey ${lv} at height ${y.toFixed(2)} m (${(sim.minute / 60).toFixed(2)} h)`);
        bad++;
      }
    }
  };
  peopleCheck();
  sim.setTime(7 * 60);
  for (let s = 0; s < 1200; s++) { sim.step(2); peopleCheck(); }
  if (bad) say(`${bad} times a person was drawn between two storeys`);
  // the crowd's own copy, from which the figures take their lift
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const Q = people.buf.aP;
  let badDrawn = 0;
  for (let c = 0; c < people.count; c++) if (Q[c * 4 + 3] !== Math.floor(Q[c * 4 + 3])) badDrawn++;
  if (badDrawn) say(`${badDrawn} figures drawn between two storeys`);
  sim.setTime(minute0);
  return problems.length ? problems : 'ok';
}
