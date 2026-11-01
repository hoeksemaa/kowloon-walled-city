// Airliners on the final approach to Kai Tak runway 13, low past the City.
//
// SOURCED: the planes passed low beside the city ("watch the planes skim over the top and land
// at Kai Tak", a police officer posted there in 1987; the tailor across the road waited for
// each plane to pass before he spoke, HK01 2022). The track is in approach.js: the IGS beam
// towards Checkerboard Hill, a 47° right turn, and the centre line of runway 13 from the 1987
// survey sheet. It passes the City on its left, about 430 m to the south-west.
// APPROXIMATE: the times. Search extracts of the government's figures give 64,874 aircraft
// movements at Kai Tak in 1986, thus about 89 landings a day. They also give a night curfew
// "between midnight and 6.30 am", with no date. Neither figure is checked
// (primary-sources/README.md). Here one landing
// about every 11 minutes from 06:30 to 23:50, fewer from 14:25 to 16:40. The schedule is the
// same each week; a seed for each day makes the minutes. INFERRED: every landing uses runway 13.
// No source gives the runway in use that week. A plane flies at its real speed when the
// clock runs in real time, and faster when the clock is fast (see update).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mulberry32 } from './util.js';
import { track, GLIDE, SPEED, S0, S1 } from './approach.js';

const OPEN = 6 * 60 + 30; // the curfew ends: the first landing
const SHUT = 23 * 60 + 50; // the last landing, so that it is down before midnight
const GAP = 11; // mean minutes between landings: about 89 a day
const LULL = [865, 1000], LULL_GAP = 20; // 14:25–16:40, when the pigeons flew (p321)
const FLIGHT = 30; // the most minutes of the clock that one flight takes: less than 4 gaps

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
  // At night the body darkens like the buildings round the City (env.js), and its lights show
  // as dots of a fixed size: red on the left wing tip (+x), green on the right, the landing
  // light white.
  g.userData.paint = [white, grey, band].map((m) => [m, m.color.clone()]);
  const dots = (pts, colors, size) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors.flat(), 3));
    const mat = new THREE.PointsMaterial({ size, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0 });
    g.add(new THREE.Points(geo, mat));
    return mat;
  };
  g.userData.lights = [
    dots([[30.3, -1.5, -10], [-30.3, -1.5, -10]], [[1, 0.15, 0.1], [0.2, 1, 0.35]], 3),
    dots([[0, -1.5, 30.5]], [[1, 0.97, 0.85]], 5),
  ];
  return g;
}

export class Planes {
  constructor(scene) {
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
  // A landing starts when the clock passes its time. dt: real seconds; speed: the speed of the
  // clock. At 1× a plane flies at its real speed. When the clock is faster, it flies at twice
  // its real speed, so that it shows for some seconds, but one flight takes at most FLIGHT
  // minutes of the clock. Thus at the fastest speed the planes keep to their times and to the
  // curfew, and the pool of four is enough.
  // night: 0 by day, 1 at night (Lighting.update in env.js).
  update(day, minute, dt, speed, hide, night = 0) {
    if (this.last && (this.last.day !== day || minute < this.last.minute || minute - this.last.minute > 30)) this.active = [];
    else if (this.last)
      for (const t of this.times(day))
        if (t > this.last.minute && t <= minute && (this.active ||= []).length < this.pool.length) this.active.push({ s: S0 });
    this.last = { day, minute };
    const pace = Math.max(Math.min(speed, 2), (speed * (S1 - S0)) / (SPEED * FLIGHT * 60));
    this.active = (this.active || []).filter((a) => (a.s += SPEED * pace * dt) < S1);
    this.pool.forEach((m, q) => {
      const a = this.active[q];
      m.visible = !!a && !hide;
      if (!m.visible) return;
      const t = track(a.s);
      m.position.set(t.x, t.y, t.z);
      m.lookAt(t.x + t.dx * 100, t.y - 100 * GLIDE, t.z + t.dz * 100);
      m.rotateZ(t.bank); // the model's +x is its left wing: a right bank lifts it
      for (const [mat, c] of m.userData.paint) mat.color.copy(c).multiplyScalar(1 - 0.7 * night);
      for (const mat of m.userData.lights) mat.opacity = night;
    });
  }
}
