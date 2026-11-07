// The lit windows of the City at night, from the people of the sim: a window glows when someone
// is awake in the room behind it (a flat, a workshop, a shop). A room where all are asleep, or
// that is empty, is dark. The flats have tungsten bulbs (warm) and the corridors fluorescent
// tubes ("單位裏的鎢絲燈、走廊的光管", Girard and Lambot to HK01; U109 of data/utilities.json); a corridor is lit here and there (INFERRED: the meter
// readers carried torches, p98). The workshops and shops have tubes (INFERRED). In a power cut
// (sim.js cutAt) the windows of the building are dark.
//
// The windows are the openings of the outer walls of src/city/mesh.js: on a wall to the open
// air, from 1/F up, one window for each 2.2 m of wall, away from the doors. This module finds
// them with the same rule (it does not change the structure), and the room behind each one: the
// unit of the plan just inside the wall.
//
// The glow shows in the normal view only (not pulled apart, not peeled), and only at night.
import * as THREE from 'three';
import { WALL, SLAB, PARAPET, OPEN } from '../city/model.js';
import { UNIT, CORR, LANDING } from '../city/plan.js';

const WARM = new THREE.Color('#ffc27a'), TUBE = new THREE.Color('#cfe0ff');

export class LitWindows {
  // S: the structure; life: the sim (src/life/sim.js); uses: the room uses (the kind of each room).
  constructor(S, life, uses) {
    this.S = S; this.life = life;
    const pos = [], size = [], tint = [];
    this.corr = []; // [window index, building] of the corridor windows that are lit at night
    this.bOf = [];
    this.byKey = new Map(); // "b:k:u" -> [window index]
    const openAt = new Map();
    for (const o of S.openings) { const key = `${o.b}:${o.k}`; if (!openAt.has(key)) openAt.set(key, []); openAt.get(key).push(o); }
    let n = 0;
    for (const b of S.list) {
      for (let k = 1; k < b.n; k++) {
        const ph = b.phaseOf(k), plan = ph.plan, y = b.y[k], yb = b.y[k + 1] - SLAB;
        const ops = openAt.get(`${b.id}:${k}`) || [];
        ph.rings.forEach((r) => {
          for (let i = 0; i < r.pts.length; i++) {
            const A = r.pts[i], B = r.pts[(i + 1) % r.pts.length], dx = B[0] - A[0], dz = B[1] - A[1], len = Math.hypot(dx, dz);
            if (len < 1.3) continue;
            const tx = dx / len, tz = dz / len, nx = tz, nz = -tx;
            const lab = r.other[i];
            let open = OPEN.has(lab);
            if (!open && lab >= 0 && !S.fills(lab, y + 0.3)) { const low = S.bOf(lab); open = low && low.top + (low.parapet ? PARAPET : 0) <= y + 0.9; }
            if (!open) continue;
            const holes = ops.filter((o) => o.r === r && o.i === i).map((o) => [o.t - o.w / 2, o.t + o.w / 2]);
            const m = Math.max(1, Math.floor((len - 0.4) / 2.2)), w = Math.min(1.0, len - 0.5);
            for (let q = 0; q < m; q++) {
              const t = (len * (q + 0.5)) / m;
              if (holes.some((h) => h[0] < t + w / 2 + 0.2 && h[1] > t - w / 2 - 0.2)) continue;
              const head = Math.min(y + 2.1, yb - 0.15);
              if (head - (y + 0.9) <= 0.5) continue;
              holes.push([t - w / 2, t + w / 2]);
              // the room behind the window
              const px = A[0] + tx * t - nx * (WALL + 0.35), pz = A[1] + tz * t - nz * (WALL + 0.35);
              const c = plan.R.cellXZ(px, pz), v = c >= 0 ? plan.code[c] : -1;
              const h = Math.sin(b.id * 12.9898 + k * 78.233 + v * 37.719 + q * 3.1) * 43758.5453, rand = h - Math.floor(h);
              let col = WARM;
              if (v === CORR || v === LANDING) {
                if (rand > 0.45) continue; // a corridor lit here and there
                this.corr.push(n);
                col = TUBE;
              } else if (v >= UNIT) {
                const key = `${b.id}:${k}:${v - UNIT}`;
                if (!this.byKey.has(key)) this.byKey.set(key, []);
                this.byKey.get(key).push(n);
                if (uses && uses.get(b.id, k, v - UNIT)?.cat !== 'home') col = TUBE;
              } else continue;
              this.bOf.push(b.id);
              // the glow stands in the middle of the wall, facing out
              const cx = A[0] + tx * t - nx * WALL * 0.5, cz = A[1] + tz * t - nz * WALL * 0.5;
              pos.push(cx, (y + 0.9 + head) / 2, cz, Math.atan2(nx, nz));
              size.push(w, head - (y + 0.9));
              tint.push(col.r, col.g, col.b);
              n++;
            }
          }
        });
      }
    }
    this.n = n;
    this.lit = new Float32Array(n);
    const g = new THREE.InstancedBufferGeometry();
    const quad = new THREE.PlaneGeometry(1, 1);
    g.index = quad.index;
    g.setAttribute('position', quad.getAttribute('position'));
    g.setAttribute('iPos', new THREE.InstancedBufferAttribute(new Float32Array(pos), 4));
    g.setAttribute('iSize', new THREE.InstancedBufferAttribute(new Float32Array(size), 2));
    g.setAttribute('iTint', new THREE.InstancedBufferAttribute(new Float32Array(tint), 3));
    this.litAttr = new THREE.InstancedBufferAttribute(this.lit, 1);
    this.litAttr.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('iLit', this.litAttr);
    g.instanceCount = n;
    this.U = { uNight: { value: 0 } };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.U,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      vertexShader: `attribute vec4 iPos; attribute vec2 iSize; attribute vec3 iTint; attribute float iLit;
varying vec3 vTint; varying float vLit;
void main() {
  vTint = iTint; vLit = iLit;
  vec3 p = vec3(position.x * iSize.x, position.y * iSize.y, 0.0);
  float c = cos(iPos.w), s = sin(iPos.w);
  vec3 w = vec3(iPos.x + p.x * c + p.z * s, iPos.y + p.y, iPos.z - p.x * s + p.z * c);
  gl_Position = vLit > 0.1 ? projectionMatrix * modelViewMatrix * vec4(w, 1.0) : vec4(0.0, 0.0, -2.0, 1.0);
}`,
      fragmentShader: `uniform float uNight; varying vec3 vTint; varying float vLit;
void main() { gl_FragColor = vec4(vTint, 0.9 * uNight * vLit); }`,
    });
    this.mesh = new THREE.Mesh(g, mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 2;
    this.lastW = -1;
  }

  // Each frame: night (0 by day, 1 at night, from Lighting), and whether the view is the normal
  // one (not pulled apart and not peeled). The rooms are looked at again each sim minute.
  update(night, normal) {
    this.U.uNight.value = Math.max(0, (night - 0.25) / 0.75);
    this.mesh.visible = normal && night > 0.25;
    if (!this.mesh.visible) return;
    const L = this.life, W = L.lastW | 0;
    if (W === this.lastW) return;
    this.lastW = W;
    this.lit.fill(0);
    for (const j of this.corr) this.lit[j] = 0.6;
    for (let i = 0; i < L.N; i++) {
      const s = L.state[i];
      if (s.trip || !s.cur || s.cur.kind !== 'unit' || /asleep/.test(s.doing || '')) continue;
      const list = this.byKey.get(s.cur.key);
      if (list) for (const j of list) this.lit[j] = 1;
    }
    // the power cuts of the hour: all dark in the buildings that are cut
    const cut = L.cutsNow?.();
    if (cut && cut.size) for (let j = 0; j < this.n; j++) if (cut.has(this.bOf[j])) this.lit[j] = 0;
    this.litAttr.needsUpdate = true;
  }
}
