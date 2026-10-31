// Airliners on the final approach to Kai Tak runway 13, low over the roofs.
//
// SOURCED: the planes passed low over the city ("watch the planes skim over the top and land
// at Kai Tak", a police officer posted there in 1987; the tailor across the road waited for
// each plane to pass before he spoke, HK01 2016). The runway 13 final runs on a bearing of
// about 134°, NE of the city, on a 3° glide path (CAD; the IGS approach of 1974).
// APPROXIMATE: the times. Search extracts of the government's figures give 64,874 aircraft
// movements at Kai Tak in 1986, thus about 89 landings a day, and a night curfew "between
// midnight and 6.30 am" (undated; neither checked, primary-sources/README.md). Here one landing
// about every 11 minutes from 06:30 to 23:50, fewer from 14:25 to 16:40. The schedule is the
// same each week; a seed for each day makes the minutes. INFERRED: every landing uses runway 13.
// No source gives the runway in use that week. Each plane flies on its own clock (see
// update), not at the speed of the simulation.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mulberry32 } from './util.js';

const SPEED = 75; // m/s, about 145 knots
const GLIDE = Math.tan((3 * Math.PI) / 180);
const S0 = -1500, S1 = 950; // metres along the path, 0 = abeam the city
const OPEN = 6 * 60 + 30; // the curfew ends: the first landing
const SHUT = 23 * 60 + 50; // the last landing, so that it is down before midnight
const GAP = 11; // mean minutes between landings: about 89 a day
const LULL = [865, 1000], LULL_GAP = 20; // 14:25–16:40, when the pigeons flew (p321)

function model(stripe) {
  const white = new THREE.MeshLambertMaterial({ color: '#e9e7e1' });
  const grey = new THREE.MeshLambertMaterial({ color: '#9a9d9f' });
  const band = new THREE.MeshLambertMaterial({ color: stripe });
  const g = new THREE.Group();
  const body = new THREE.CylinderGeometry(3.1, 3.1, 56, 12).rotateX(Math.PI / 2);
  const nose = new THREE.SphereGeometry(3.1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2).translate(0, 0, 28);
  const tail = new THREE.ConeGeometry(3.1, 10, 12).rotateX(-Math.PI / 2).translate(0, 0.8, -33);
  g.add(new THREE.Mesh(mergeGeometries([body, nose, tail]), white));
  // Swept wings and tailplane as flat slabs.
  const wing = (span, root, tip, sweep, y, z) => {
    const s = new THREE.Shape();
    s.moveTo(0, root / 2); s.lineTo(span, -sweep + tip / 2); s.lineTo(span, -sweep - tip / 2); s.lineTo(0, -root / 2);
    const right = new THREE.ExtrudeGeometry(s, { depth: 0.6, bevelEnabled: false }).rotateX(Math.PI / 2).translate(0, y, z);
    const left = right.clone().scale(-1, 1, 1);
    return [right, left];
  };
  const wings = wing(30, 12, 3.5, 12, -1.2, 2);
  const tp = wing(11, 5, 2, 5, 1.5, -30);
  g.add(new THREE.Mesh(mergeGeometries([...wings, ...tp]), grey));
  const fin = new THREE.Shape();
  fin.moveTo(0, 0); fin.lineTo(-9, 12); fin.lineTo(-13, 12); fin.lineTo(-8, 0);
  const finG = new THREE.ExtrudeGeometry(fin, { depth: 0.5, bevelEnabled: false }).rotateY(-Math.PI / 2).translate(0.25, 2.5, -27);
  g.add(new THREE.Mesh(finG, band));
  const stripeG = new THREE.CylinderGeometry(3.15, 3.15, 50, 12, 1, true, Math.PI * 0.35, Math.PI * 0.3).rotateX(Math.PI / 2).translate(0, 0, 2);
  g.add(new THREE.Mesh(stripeG, band));
  for (const sx of [-2.2, 2.2]) {
    const eng = new THREE.CylinderGeometry(1.3, 1.1, 5, 10).rotateX(Math.PI / 2).translate(sx * 5, -3.2, 6);
    g.add(new THREE.Mesh(eng, grey));
  }
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.9, 8, 6), new THREE.MeshBasicMaterial({ color: '#fff6d8' }));
  lamp.position.set(0, -1.5, 30);
  g.add(lamp);
  g.userData.lamp = lamp;
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}

export class Planes {
  // dir: unit direction of travel in the plan; p0: the point abeam the city; h0: height there.
  constructor(scene, dir, p0, h0) {
    this.dir = dir; this.p0 = p0; this.h0 = h0;
    this.pool = ['#b8261c', '#1f5f8c', '#1d6a47', '#8c6a1d'].map((c) => {
      const m = model(c);
      m.visible = false;
      scene.add(m);
      return m;
    });
    this.cache = new Map();
  }
  // The minutes of the day's landings, from the end of the curfew to the last landing, each
  // gap within 3 minutes of its mean. A lull in mid-afternoon, when the pigeons flew (p321;
  // INFERRED from the caption).
  times(day) {
    if (this.cache.has(day)) return this.cache.get(day);
    const rng = mulberry32(5150 + day);
    const t = [];
    for (let m = OPEN + rng() * 6; m < SHUT; m += (m > LULL[0] && m < LULL[1] ? LULL_GAP : GAP) - 3 + rng() * 6) t.push(m);
    this.cache.set(day, t);
    return t;
  }
  // A landing starts when the clock passes its time. The plane then flies in real time
  // (at twice real speed), so that it can be seen at any speed of the clock.
  update(day, minute, dt, hide) {
    if (this.last && (this.last.day !== day || minute < this.last.minute || minute - this.last.minute > 30)) this.active = [];
    else if (this.last)
      for (const t of this.times(day))
        if (t > this.last.minute && t <= minute && (this.active ||= []).length < this.pool.length) this.active.push({ s: S0 });
    this.last = { day, minute };
    this.active = (this.active || []).filter((a) => (a.s += SPEED * 2 * dt) < S1);
    this.pool.forEach((m, q) => {
      const a = this.active[q];
      m.visible = !!a && !hide;
      if (!m.visible) return;
      const x = this.p0[0] + this.dir[0] * a.s, z = this.p0[1] + this.dir[1] * a.s;
      const y = Math.max(8, this.h0 - a.s * GLIDE);
      m.position.set(x, y, z);
      m.lookAt(x + this.dir[0] * 100, y - 100 * GLIDE, z + this.dir[1] * 100);
    });
  }
}
