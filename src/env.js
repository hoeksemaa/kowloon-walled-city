// The model's surroundings: plinth, streets, the hazy city below, light and time of day.
import * as THREE from 'three';
import { rects } from './cityMesh.js';
import { mulberry32, clamp, lerp, smoothstep } from './util.js';

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
  const pave = [];
  for (let c = 0; c < L.N; c++) {
    if (L.inside[c]) continue;
    const i = c % L.W, j = (c / L.W) | 0;
    let near = false;
    for (let dj = -3; dj <= 3 && !near; dj++)
      for (let di = -3; di <= 3 && !near; di++) {
        const ni = i + di, nj = j + dj;
        if (ni >= 0 && nj >= 0 && ni < L.W && nj < L.D && L.inside[nj * L.W + ni]) near = true;
      }
    if (near) pave.push(c);
  }
  const pg = [];
  for (const [i0, j0, i1, j1] of rects(L, pave)) {
    const g = new THREE.PlaneGeometry(i1 - i0, j1 - j0).rotateX(-Math.PI / 2);
    g.translate(L.x0 + (i0 + i1) / 2, 0.006, L.z0 + (j0 + j1) / 2);
    pg.push(g);
  }
  const paveMesh = new THREE.Mesh(mergeGeoms(pg), new THREE.MeshLambertMaterial({ color: '#77736a' }));
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

// Low blocks far below the plinth, mostly lost in haze. Kowloon City around the Walled
// City was kept low by the airport height limits; heights here are placeholders.
// Drawn as a miniature, so that it reads as far below rather than merely lower.
function buildContextCity(L) {
  const rng = mulberry32(5);
  const box = new THREE.BoxGeometry(1, 1, 1);
  box.translate(0, 0.5, 0);
  const n = 12000;
  const mesh = new THREE.InstancedMesh(box, new THREE.MeshLambertMaterial({ color: '#ffffff' }), n);
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

function mergeGeoms(list) {
  let n = 0;
  for (const g of list) n += g.getAttribute('position').count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), idx = [];
  let o = 0;
  for (const g of list) {
    pos.set(g.getAttribute('position').array, o * 3);
    nor.set(g.getAttribute('normal').array, o * 3);
    for (const v of g.index.array) idx.push(v + o);
    o += g.getAttribute('position').count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setIndex(idx);
  return out;
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
  constructor(scene, center) {
    this.scene = scene;
    this.center = center;
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

  // Hong Kong in mid-March: sunrise about 06:30, sunset about 18:30.
  update(hour, explodeLift) {
    const day = (hour - 6.5) / 12;
    const elev = Math.sin(Math.PI * clamp(day, 0, 1));
    const light = smoothstep(0.0, 0.25, elev) * (day > 0 && day < 1 ? 1 : 0);
    const az = lerp(-Math.PI * 0.55, Math.PI * 0.55, clamp(day, 0, 1));
    const r = 420;
    const e = Math.max(0.18, elev) * 1.05;
    const c = this.center;
    this.sun.position.set(c.x + Math.sin(az) * r * Math.cos(e), c.y + explodeLift * 0.5 + Math.sin(e) * r, c.z + Math.cos(az) * r * Math.cos(e) * 0.6 + 120);
    this.sun.target.position.set(c.x, c.y + explodeLift * 0.5, c.z);
    this.sun.intensity = 0.15 + 1.5 * light;
    this.sun.color.setHSL(0.09, 0.5 - 0.35 * elev, 0.82 + 0.1 * elev);
    this.hemi.intensity = 0.62 + 0.7 * smoothstep(-0.05, 0.3, elev);
    this.hemi.color.set(light > 0.05 ? '#dcd9cc' : '#8e96b0');
    skyAt(hour, this.sky);
    this.scene.fog.color.copy(this.sky);
    return 1 - smoothstep(0.02, 0.35, elev);
  }
}
