// The model's surroundings: plinth, streets, the hazy city below, light and time of day.
import * as THREE from 'three';
import { OUTSIDE } from './footprint.js';
import { mulberry32, clamp, smoothstep } from './util.js';

export const PLINTH_DEPTH = 150;

export function buildEnvironment(scene, L) {
  const group = new THREE.Group();
  const xa = L.x0, xb = L.x0 + L.W, za = L.z0, zb = L.z0 + L.D;

  // Plinth: the model stands on a block that drops into the haze.
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(xb - xa, PLINTH_DEPTH, zb - za),
    new THREE.MeshLambertMaterial({ color: '#4a4038' }),
  );
  plinth.position.set((xa + xb) / 2, -PLINTH_DEPTH / 2 - 0.02, (za + zb) / 2);
  plinth.receiveShadow = true;
  group.add(plinth);
  const rim = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(xb - xa, 0.01, zb - za)),
    new THREE.LineBasicMaterial({ color: '#e9e1cf', transparent: true, opacity: 0.85 }),
  );
  rim.position.set((xa + xb) / 2, 0, (za + zb) / 2);
  group.add(rim);

  // Street surface, with a pavement band along the city edge.
  const street = new THREE.Mesh(
    new THREE.PlaneGeometry(xb - xa, zb - za).rotateX(-Math.PI / 2),
    new THREE.MeshLambertMaterial({ color: '#57534c' }),
  );
  street.position.set((xa + xb) / 2, 0, (za + zb) / 2);
  street.receiveShadow = true;
  group.add(street);
  // Pavement: a 3 m band round the city outline, with round joins at the corners.
  const edges = [];
  for (const b of L.buildings) for (const r of b.rings) for (const e of r.edges) if (e.other === OUTSIDE) edges.push(e);
  for (const rings of Object.values(L.ground)) for (const r of rings) for (const e of r.edges) if (e.other === OUTSIDE) edges.push(e);
  const pv = [], PW = 3, y = 0.006;
  const tri = (a, b, c) => {
    if ((b[1] - a[1]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[1] - a[1]) < 0) [b, c] = [c, b]; // face up
    pv.push(a[0], y, a[1], b[0], y, b[1], c[0], y, c[1]);
  };
  for (const e of edges) {
    const dx = e.b[0] - e.a[0], dz = e.b[1] - e.a[1], l = Math.hypot(dx, dz) || 1;
    const nx = (dz / l) * PW, nz = (-dx / l) * PW;
    const A = e.a, B = e.b, C = [B[0] + nx, B[1] + nz], D = [A[0] + nx, A[1] + nz];
    tri(A, C, B); tri(A, D, C);
    for (let q = 0; q < 8; q++) {
      const a0 = (q / 8) * 2 * Math.PI, a1 = ((q + 1) / 8) * 2 * Math.PI;
      tri(A, [A[0] + Math.cos(a1) * PW, A[1] + Math.sin(a1) * PW], [A[0] + Math.cos(a0) * PW, A[1] + Math.sin(a0) * PW]);
    }
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.Float32BufferAttribute(pv, 3));
  pg.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(pv.length).map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
  const paveMesh = new THREE.Mesh(pg, new THREE.MeshLambertMaterial({ color: '#77736a' }));
  paveMesh.receiveShadow = true;
  group.add(paveMesh);

  // Centre lines of the boundary roads: the hull of the city pushed out by ~10 m.
  const hull = convexHull(L.inside, L);
  const road = offsetConvex(hull, 10.5);
  const rp = [];
  for (let q = 0; q < road.length; q++) {
    const [ax, az] = road[q], [bx, bz] = road[(q + 1) % road.length];
    rp.push(ax, 0.02, az, bx, 0.02, bz);
  }
  const rg = new THREE.BufferGeometry();
  rg.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3));
  const roadLine = new THREE.LineSegments(rg, new THREE.LineDashedMaterial({ color: '#d9cfae', dashSize: 2.2, gapSize: 2.6 }));
  roadLine.computeLineDistances();
  group.add(roadLine);

  group.add(buildContextCity(L));
  scene.add(group);
  return { group, roadOutline: road };
}

// Road names painted on the plinth beside the side of the city they run along.
// names: { top, right, bottom, left } (sides of the plan) -> label text.
export function addStreetLabels(scene, site, road, names) {
  const dirs = { top: [0, -1], bottom: [0, 1], right: [1, 0], left: [-1, 0] };
  const n = road.length;
  for (const [side, text] of Object.entries(names)) {
    if (!text) continue;
    const [dx, dz] = dirs[side];
    let best = null;
    for (let i = 0; i < n; i++) {
      const [ax, az] = road[i], [bx, bz] = road[(i + 1) % n];
      const ex = bx - ax, ez = bz - az, l = Math.hypot(ex, ez);
      const nx = ez / l, nz = -ex / l;
      const score = (nx * dx + nz * dz) * l;
      if (!best || score > best.score) best = { score, mx: (ax + bx) / 2, mz: (az + bz) / 2, ex: ex / l, ez: ez / l, nx, nz, l };
    }
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 64;
    const g = c.getContext('2d');
    const draw = () => {
      g.clearRect(0, 0, c.width, c.height);
      g.fillStyle = '#ddd3b8';
      g.font = '34px Silkscreen, monospace';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(text, 512, 34);
      tex.needsUpdate = true;
    };
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    draw();
    document.fonts.ready.then(draw);
    const w = Math.min(best.l * 0.8, 64);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w / 16), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    // Read along the road, upright from the default camera (which looks from +x, +z).
    let ang = Math.atan2(-best.ez, best.ex);
    if (Math.sin(ang) + Math.cos(ang) < 0) ang += Math.PI;
    m.rotation.z = ang;
    m.position.set(best.mx + best.nx * 3.5, 0.04, best.mz + best.nz * 3.5);
    scene.add(m);
  }
}

// Kowloon at night, seen past the roofs, is sodium amber (#f8f1ba / #cfb272, p316). Lighting
// sets its glow by the hour.
const CONTEXT_MAT = new THREE.MeshLambertMaterial({ color: '#ffffff' });
const SODIUM = new THREE.Color('#cfb272');

// Low blocks far below the plinth, mostly lost in haze. Kowloon City around the Walled
// City was kept low by the airport height limits; heights here are placeholders.
// Drawn as a miniature, so that it reads as far below rather than merely lower.
function buildContextCity(L) {
  const rng = mulberry32(5);
  const box = new THREE.BoxGeometry(1, 1, 1);
  box.translate(0, 0.5, 0);
  const n = 12000;
  const mesh = new THREE.InstancedMesh(box, CONTEXT_MAT, n);
  const m = new THREE.Matrix4(), c = new THREE.Color();
  const cx = L.x0 + L.W / 2, cz = L.z0 + L.D / 2;
  let k = 0;
  const block = 15, street = 5, R = 44;
  for (let gx = -R; gx <= R && k < n; gx++)
    for (let gz = -R; gz <= R && k < n; gz++) {
      if (gx * gx + gz * gz > R * R) continue;
      const bx = cx + gx * (block + street) + (gz % 3) * 4, bz = cz + gz * (block + street);
      if (Math.abs(bx - cx) < L.W * 0.55 && Math.abs(bz - cz) < L.D * 0.55) continue;
      if (rng() < 0.07) continue;
      const parts = 1 + Math.floor(rng() * 3);
      for (let p = 0; p < parts && k < n; p++) {
        const w = block / parts;
        const h = 4 + rng() * 7 + (rng() < 0.05 ? 7 : 0);
        m.makeScale(w - 0.6, h, block - 0.8 - rng() * 4);
        m.setPosition(bx - block / 2 + w * (p + 0.5), -PLINTH_DEPTH, bz);
        mesh.setMatrixAt(k, m);
        c.setHSL(0.11, 0.04 + rng() * 0.05, 0.5 + rng() * 0.14);
        mesh.setColorAt(k, c);
        k++;
      }
    }
  mesh.count = k;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#7c7a70' }));
  ground.position.set(cx, -PLINTH_DEPTH - 0.1, cz);
  const g = new THREE.Group();
  g.add(mesh, ground);
  return g;
}

function convexHull(inside, L) {
  const pts = [];
  for (let c = 0; c < L.N; c++) {
    if (!inside[c]) continue;
    const x = L.x0 + (c % L.W), z = L.z0 + ((c / L.W) | 0);
    pts.push([x, z], [x + 1, z], [x, z + 1], [x + 1, z + 1]);
  }
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

function offsetConvex(poly, d) {
  // Hull is counter-clockwise in (x, z); push each edge outward and intersect neighbours.
  const n = poly.length, lines = [];
  for (let i = 0; i < n; i++) {
    const [ax, az] = poly[i], [bx, bz] = poly[(i + 1) % n];
    const dx = bx - ax, dz = bz - az, l = Math.hypot(dx, dz) || 1;
    const nx = dz / l, nz = -dx / l;
    lines.push([ax + nx * d, az + nz * d, dx, dz]);
  }
  const out = [];
  for (let i = 0; i < n; i++) {
    const [px, pz, dx, dz] = lines[(i + n - 1) % n], [qx, qz, ex, ez] = lines[i];
    const den = dx * ez - dz * ex;
    if (Math.abs(den) < 1e-6) { out.push([qx, qz]); continue; }
    const t = ((qx - px) * ez - (qz - pz) * ex) / den;
    out.push([px + dx * t, pz + dz * t]);
  }
  return out;
}

// ---- light and time of day ----------------------------------------------------------------
const SKY = [
  [0, '#252a36'], [4.8, '#2c3240'], [5.8, '#5f5f68'], [6.6, '#9a8e82'], [7.6, '#a3a093'],
  [12, '#a8a89c'], [16.5, '#a4a194'], [17.8, '#b0927a'], [18.6, '#7c6a6a'], [19.4, '#444656'],
  [20.5, '#2d3240'], [24, '#252a36'],
];
const skyCols = SKY.map(([h, c]) => [h, new THREE.Color(c)]);

export function skyAt(hour, out) {
  for (let i = 0; i < skyCols.length - 1; i++) {
    const [h0, c0] = skyCols[i], [h1, c1] = skyCols[i + 1];
    if (hour >= h0 && hour <= h1) return out.copy(c0).lerp(c1, (hour - h0) / (h1 - h0));
  }
  return out.copy(skyCols[0][1]);
}

export class Lighting {
  constructor(scene, center, site) {
    this.scene = scene;
    this.center = center;
    this.north = site.north;
    this.east = site.east;
    this.hemi = new THREE.HemisphereLight('#dcd9cc', '#4a4540', 1.2);
    scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight('#fff3df', 1.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(4096, 4096);
    const s = this.sun.shadow.camera;
    s.left = -190; s.right = 190; s.top = 190; s.bottom = -190; s.near = 10; s.far = 900;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.05;
    scene.add(this.sun, this.sun.target);
    this.sky = new THREE.Color();
    scene.background = this.sky;
    scene.fog = new THREE.Fog(this.sky, 900, 1700);
  }

  // The sun over Hong Kong in the week of 16-22 Dec 1986: latitude 22.33° N, declination
  // -23.4°, solar noon at about 12:22 HKT. Sunrise about 06:57, sunset about 17:45.
  update(hour, explodeLift) {
    const D = Math.PI / 180, phi = 22.33 * D, dec = -23.4 * D;
    const H = (hour - 12.37) * 15 * D;
    const sinAlt = Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H);
    const alt = Math.asin(sinAlt) + 0.83 * D; // with refraction
    let az = Math.acos(clamp((Math.sin(dec) - sinAlt * Math.sin(phi)) / (Math.cos(Math.asin(sinAlt)) * Math.cos(phi)), -1, 1));
    if (H > 0) az = 2 * Math.PI - az; // bearing from north
    const elev = clamp(alt / (44.3 * D), 0, 1);
    const light = smoothstep(0.0, 0.25, elev) * (alt > 0 ? 1 : 0);
    const r = 420;
    const e = Math.max(0.16, alt);
    const c = this.center, N = this.north, E = this.east;
    const hx = E[0] * Math.sin(az) + N[0] * Math.cos(az), hz = E[1] * Math.sin(az) + N[1] * Math.cos(az);
    this.sun.position.set(c.x + hx * r * Math.cos(e), c.y + explodeLift * 0.5 + Math.sin(e) * r, c.z + hz * r * Math.cos(e));
    this.sun.target.position.set(c.x, c.y + explodeLift * 0.5, c.z);
    this.sun.intensity = 0.15 + 1.5 * light;
    this.sun.color.setHSL(0.09, 0.5 - 0.35 * elev, 0.82 + 0.1 * elev);
    this.hemi.intensity = 0.62 + 0.7 * smoothstep(-0.05, 0.3, elev);
    this.hemi.color.set(light > 0.05 ? '#dcd9cc' : '#8e96b0');
    // The sky colours were set for March light: map December hours onto them.
    const m = hour < 6.95 ? hour - 0.45 : hour > 17.75 ? hour + 0.75 : 6.5 + (hour - 6.95) * (12 / 10.8);
    skyAt(clamp(m, 0, 24), this.sky);
    this.scene.fog.color.copy(this.sky);
    const night = 1 - smoothstep(0.02, 0.35, elev);
    CONTEXT_MAT.emissive.copy(SODIUM).multiplyScalar(0.32 * night);
    return night;
  }
}
