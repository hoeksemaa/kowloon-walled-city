// Who is drawn, and how. Each frame, the people in view are packed into the instance buffers
// of the figures (figures.js): indoors, only the cut storey shows, because the walls hide the
// rest, unless the storeys are apart. Each person moves with the storey they stand on (a
// whole storey, people.js). On the cut storey, people who stay in a unit lie in its beds, sit
// on its seats and stand at its stoves and machines (the spots of interiors.js). Who takes
// which spot is INFERRED: the first free spot of the right kind.
import * as THREE from 'three';
import { STOREY } from './layout.js';
import { planAt } from './floorplan.js';
import { POSE } from './people.js';
import { figureGeometry, makeFigureMaterial, makeFigureDepth } from './figures.js';

const FINE_MAX = 4000; // with more people in view than this, the plain figures
const SPOT_FOR = { [POSE.lie]: ['bed'], [POSE.sit]: ['seat', 'desk'], [POSE.desk]: ['desk', 'seat'], [POSE.work]: ['work'] };
const SPOT_POSE = { bed: POSE.lie, seat: POSE.sit, desk: POSE.desk, work: POSE.work };
// The packed aM.z (figures.js): the pose, + 16 if the furniture is the seat or the bed, + 32
// indoors, + 64 in a room of the cut storey (lit by its lamp, lamps.js).

export class Crowd {
  constructor(sim, L, uniforms) {
    this.sim = sim;
    this.L = L;
    const n = sim.agents.length;
    this.buf = { aP: new Float32Array(n * 4), aM: new Float32Array(n * 4), aC: new Float32Array(n * 3), aB: new Float32Array(n * 3), aL: new Float32Array(n * 4) };
    this.attrs = {};
    for (const [k, arr] of Object.entries(this.buf)) {
      const a = new THREE.InstancedBufferAttribute(arr, arr.length / n);
      a.setUsage(THREE.DynamicDrawUsage);
      this.attrs[k] = a;
    }
    this.ids = new Int32Array(n);
    this.slot = new Int32Array(n).fill(-1);
    this.count = 0;
    this.group = new THREE.Group();
    this.meshes = ['fine', 'plain'].map((kind) => {
      const g = figureGeometry[kind]();
      for (const k in this.attrs) g.setAttribute(k, this.attrs[k]);
      g.instanceCount = 0;
      const mesh = new THREE.Mesh(g, makeFigureMaterial(uniforms, kind === 'plain'));
      mesh.customDepthMaterial = makeFigureDepth(uniforms, kind === 'plain');
      mesh.castShadow = mesh.receiveShadow = true;
      mesh.frustumCulled = false;
      this.group.add(mesh);
      return mesh;
    });
    this.claim = new Int32Array(n).fill(-1);
    this.lit = new Set(); // the units of the cut storey with someone awake in them (lamps.js)
    this.setSpots(-1, []);
    this.frame = 0;
    this._m = new THREE.Matrix4();
  }

  // The spots of the cut storey c (cityMesh.js buildPlan).
  setSpots(c, spots) {
    this.level = c;
    this.spots = spots;
    this.byUnit = new Map();
    spots.forEach((s, i) => {
      const key = s.b * 4096 + s.u;
      if (!this.byUnit.has(key)) this.byUnit.set(key, []);
      this.byUnit.get(key).push(i);
    });
    this.taken = new Int32Array(spots.length).fill(-1);
    this.used = new Uint32Array(spots.length);
    this.claim.fill(-1);
  }

  // The unit someone is in, as a key of byUnit; -1 outside the units.
  unitKey(a, x, z) {
    const loc = a.loc;
    if (!loc || loc.type !== 'in') return -1;
    const P = planAt(this.L.buildings[loc.b], this.level);
    if (!P) return -1;
    const i = P.index.get(Math.floor(z - this.L.z0) * this.L.W + Math.floor(x - this.L.x0));
    const u = i === undefined ? -1 : P.cell[i];
    return u >= 0 ? loc.b * 4096 + u : -1;
  }

  // The spot of person i in unit key, who holds pose: kept from the frames before, or the
  // first free one.
  spotFor(i, key, pose) {
    const want = SPOT_FOR[pose];
    let si = this.claim[i];
    if (si >= 0) {
      const s = this.spots[si];
      if (want && want.includes(s.kind) && s.b * 4096 + s.u === key) { this.used[si] = this.frame; return s; }
      this.taken[si] = -1;
      this.claim[i] = -1;
    }
    const list = want ? this.byUnit.get(key) : null;
    if (!list) return null;
    const start = (i * 7) % list.length;
    for (const kind of want)
      for (let q = 0; q < list.length; q++) {
        si = list[(start + q) % list.length];
        const s = this.spots[si];
        if (s.kind !== kind || this.taken[si] >= 0) continue;
        this.taken[si] = i;
        this.claim[i] = si;
        this.used[si] = this.frame;
        return s;
      }
    return null;
  }

  // Pack the people in view. cut: the cut storey or -1; lifted: the storeys are apart. The beds,
  // seats and lamps of the cut storey are the same in both views.
  update(camera, cut, lifted, offsets) {
    const { sim, L, buf } = this, B = L.buildings, P = sim.aP, M = sim.aM, A = sim.agents, n = A.length;
    const e = this._m.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).elements;
    const top = cut < 0 ? Infinity : cut * STOREY + 1.0, low = cut * STOREY - STOREY * 0.6;
    const spotsOn = cut >= 0 && this.level === cut && this.spots.length > 0;
    this.frame++;
    for (let c = 0; c < this.count; c++) this.slot[this.ids[c]] = -1;
    this.lit.clear();
    let c = 0;
    for (let i = 0; i < n; i++) {
      const o = i * 4, lv = P[o + 3];
      if (lv < 0) continue;
      const x = P[o], z = P[o + 1], y = P[o + 2];
      if (y > top) continue;
      const k = Math.floor(z - L.z0) * L.W + Math.floor(x - L.x0), ow = L.owner[k];
      const out = !L.inside[k] || L.alley[k] > 0 || ow < 0 || y > B[ow].floors * STOREY - 0.3;
      if (!lifted && !out && !(cut >= 0 && y >= low)) continue;
      const Y = y + offsets[Math.min(lv, 15) | 0] + 0.8;
      const nx = e[0] * x + e[4] * Y + e[8] * z + e[12], ny = e[1] * x + e[5] * Y + e[9] * z + e[13];
      if (nx < -1.08 || nx > 1.08 || ny < -1.12 || ny > 1.12) continue;
      let X = x, Z = z, H = y, hd = M[o], pose = M[o + 2];
      const key = spotsOn && !out && Math.abs(y - cut * STOREY) < 0.3 ? this.unitKey(A[i], x, z) : -1, room = key >= 0;
      if (room && M[o + 1] === 0) {
        if (pose !== POSE.lie) this.lit.add(key);
        const s = this.spotFor(i, key, pose);
        if (s) { X = s.x; Z = s.z; H = y + s.y; hd = s.h; pose = SPOT_POSE[s.kind] + (s.seat ? 16 : 0); }
      }
      const q = c * 4, r = c * 3, i3 = i * 3;
      buf.aP[q] = X; buf.aP[q + 1] = Z; buf.aP[q + 2] = H; buf.aP[q + 3] = lv;
      buf.aM[q] = hd; buf.aM[q + 1] = M[o + 1]; buf.aM[q + 2] = pose + (out ? 0 : 32) + (room ? 64 : 0); buf.aM[q + 3] = M[o + 3];
      buf.aC[r] = sim.aC[i3]; buf.aC[r + 1] = sim.aC[i3 + 1]; buf.aC[r + 2] = sim.aC[i3 + 2];
      buf.aB[r] = sim.aB[i3]; buf.aB[r + 1] = sim.aB[i3 + 1]; buf.aB[r + 2] = sim.aB[i3 + 2];
      buf.aL[q] = sim.aL[o]; buf.aL[q + 1] = sim.aL[o + 1]; buf.aL[q + 2] = sim.aL[o + 2]; buf.aL[q + 3] = sim.aL[o + 3];
      this.ids[c] = i;
      this.slot[i] = c;
      c++;
    }
    // Spots whose people have gone are free again.
    for (let s = 0; s < this.taken.length; s++)
      if (this.taken[s] >= 0 && this.used[s] !== this.frame) { this.claim[this.taken[s]] = -1; this.taken[s] = -1; }
    this.count = c;
    for (const a of Object.values(this.attrs)) {
      a.clearUpdateRanges();
      a.addUpdateRange(0, c * a.itemSize);
      a.needsUpdate = true;
    }
    const fine = c <= FINE_MAX && camera.zoom > 1.4;
    this.meshes[0].geometry.instanceCount = fine ? c : 0;
    this.meshes[1].geometry.instanceCount = fine ? 0 : c;
    this.meshes[0].visible = fine && c > 0;
    this.meshes[1].visible = !fine && c > 0;
  }

  // Where person id is drawn, [x, y, z, storey], or null if not in view.
  shown(id) {
    const c = this.slot[id];
    if (c < 0) return null;
    const p = this.buf.aP;
    return [p[c * 4], p[c * 4 + 2], p[c * 4 + 1], p[c * 4 + 3]];
  }

  // The person drawn nearest the screen point (px, py), within r pixels; -1 if none.
  pick(px, py, camera, offsets, r, w, h) {
    const e = this._m.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).elements;
    const p = this.buf.aP;
    let best = -1, bd = r * r;
    for (let c = 0; c < this.count; c++) {
      const x = p[c * 4], z = p[c * 4 + 1];
      const Y = p[c * 4 + 2] + offsets[Math.min(p[c * 4 + 3], 15) | 0] + 1.0;
      const sx = ((e[0] * x + e[4] * Y + e[8] * z + e[12]) * 0.5 + 0.5) * w, sy = (-(e[1] * x + e[5] * Y + e[9] * z + e[13]) * 0.5 + 0.5) * h;
      const d = (sx - px) ** 2 + (sy - py) ** 2;
      if (d < bd) { bd = d; best = this.ids[c]; }
    }
    return best;
  }
}
