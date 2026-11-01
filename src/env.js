// The model's surroundings: the street round the city, the ground and the city around it at
// the same level, light and time of day.
import * as THREE from 'three';
import { OUTSIDE } from './footprint.js';
import { mulberry32, clamp, smoothstep } from './util.js';
import { withDim } from './dim.js';

// The haze (main.js): all is clear out to FADE_NEAR metres from the centre of the city, then
// fades slowly into the sky, and is gone at FADE_FAR. Nothing is drawn beyond.
const FADE_NEAR = 350, FADE_FAR = 600;

// The ground is part of G/F: below a cut storey in the layered view, it dims with G/F (dim.js).
export function groundMat(m) {
  m.onBeforeCompile = (s) => withDim(s, '0.0');
  m.customProgramCacheKey = () => `kwc-ground-${m.type}`;
  return m;
}

export function buildEnvironment(scene, L) {
  const group = new THREE.Group();
  const xa = L.x0, xb = L.x0 + L.W, za = L.z0, zb = L.z0 + L.D;

  // Street surface: a dark rectangle under the city, flush with the ground round it. It is also
  // the shape of each storey's slab in the layered view (main.js). A pavement band runs along
  // the city edge.
  const street = new THREE.Mesh(
    new THREE.PlaneGeometry(xb - xa, zb - za).rotateX(-Math.PI / 2),
    groundMat(new THREE.MeshLambertMaterial({ color: '#57534c' })),
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
  const paveMesh = new THREE.Mesh(pg, groundMat(new THREE.MeshLambertMaterial({ color: '#77736a' })));
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
  const roadLine = new THREE.LineSegments(rg, groundMat(new THREE.LineDashedMaterial({ color: '#d9cfae', dashSize: 2.2, gapSize: 2.6 })));
  roadLine.computeLineDistances();
  group.add(roadLine);

  group.add(buildContextCity(L));
  scene.add(group);
  return { group, roadOutline: road };
}

// The ground and the city around the City: light, plain greys by day, so that they show the
// place and leave the eye on the City. At night they are dark, with a faint glow of sodium
// amber, the colour of Kowloon seen past the roofs (#f8f1ba / #cfb272, p316). Lighting darkens
// both and sets the glow by the hour.
const CONTEXT_MAT = new THREE.MeshLambertMaterial({ color: '#ffffff' });
const GROUND_MAT = new THREE.MeshLambertMaterial({ color: '#ffffff' });
const GROUND = new THREE.Color('#dddcd8');
const SODIUM = new THREE.Color('#cfb272');
// Soft light, as on a map: the normals of the blocks lean up, so the walls take nearly the
// light of the roofs, and the blocks stay low in contrast.
CONTEXT_MAT.onBeforeCompile = (s) => {
  s.vertexShader = s.vertexShader.replace('#include <defaultnormal_vertex>', `#include <defaultnormal_vertex>
transformedNormal = normalize(mix(normalize(transformedNormal), mat3(viewMatrix) * vec3(0.0, 1.0, 0.0), 0.55));`);
};
CONTEXT_MAT.customProgramCacheKey = () => 'kwc-context';

// Low blocks on the ground round the city, out to FADE_FAR. Kowloon City around the Walled
// City was kept low by the airport height limits; the blocks and their heights are
// placeholders. The ground is a disc that ends where the haze is whole.
function buildContextCity(L) {
  const rng = mulberry32(5);
  const box = new THREE.BoxGeometry(1, 1, 1);
  box.translate(0, 0.5, 0);
  const n = 8000;
  const mesh = new THREE.InstancedMesh(box, CONTEXT_MAT, n);
  const m = new THREE.Matrix4(), c = new THREE.Color();
  const cx = L.x0 + L.W / 2, cz = L.z0 + L.D / 2;
  let k = 0;
  const block = 15, street = 5, R = Math.ceil(FADE_FAR / (block + street));
  for (let gx = -R; gx <= R && k < n; gx++)
    for (let gz = -R; gz <= R && k < n; gz++) {
      const bx = cx + gx * (block + street) + (gz % 3) * 4, bz = cz + gz * (block + street);
      if (Math.hypot(bx - cx, bz - cz) > FADE_FAR - block) continue;
      if (Math.abs(bx - cx) < L.W * 0.55 && Math.abs(bz - cz) < L.D * 0.55) continue;
      if (rng() < 0.07) continue;
      const parts = 1 + Math.floor(rng() * 3);
      for (let p = 0; p < parts && k < n; p++) {
        const w = block / parts;
        const h = 4 + rng() * 7 + (rng() < 0.05 ? 7 : 0);
        m.makeScale(w - 0.6, h, block - 0.8 - rng() * 4);
        m.setPosition(bx - block / 2 + w * (p + 0.5), 0, bz);
        mesh.setMatrixAt(k, m);
        c.setHSL(0.11, 0.02 + rng() * 0.03, 0.8 + rng() * 0.1);
        mesh.setColorAt(k, c);
        k++;
      }
    }
  mesh.count = k;
  mesh.receiveShadow = true;
  // A little below the street, so that the two do not fight where they overlap.
  const ground = new THREE.Mesh(new THREE.CircleGeometry(FADE_FAR, 128).rotateX(-Math.PI / 2), GROUND_MAT);
  ground.position.set(cx, -0.05, cz);
  ground.receiveShadow = true;
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
// The sky, which is also the colour of the haze, in sRGB by the height of the sun in degrees.
// By day a pale grey, a little lighter than the lit ground, so that the city around melts into
// it; warmer as the sun goes down. At night a dark slate, darker than the walls, so that the lit
// windows stand out, with a dark afterglow near sunset and sunrise. Lighting mixes the two on
// the curve of the city's own light (uNight).
const SKY_DAY = [[-6, '#9c8174'], [4, '#b39b88'], [14, '#bfb8aa'], [30, '#c9c7c0'], [45, '#d0cfc9']];
const SKY_NIGHT = [[-14, '#1e1f26'], [-5, '#28262c'], [3, '#3b3334']];
const rgbOf = (t) => t.map(([a, c]) => [a, new THREE.Color(c).getRGB({}, THREE.SRGBColorSpace)]);
const skyDay = rgbOf(SKY_DAY), skyNight = rgbOf(SKY_NIGHT);

function skyAt(table, alt) {
  if (alt <= table[0][0]) return table[0][1];
  for (let i = 0; i < table.length - 1; i++) {
    const [a0, c0] = table[i], [a1, c1] = table[i + 1];
    if (alt <= a1) {
      const t = (alt - a0) / (a1 - a0);
      return { r: c0.r + (c1.r - c0.r) * t, g: c0.g + (c1.g - c0.g) * t, b: c0.b + (c1.b - c0.b) * t };
    }
  }
  return table[table.length - 1][1];
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
    // fogNear and fogFar carry the radii of the haze (main.js).
    scene.fog = new THREE.Fog(this.sky, FADE_NEAR, FADE_FAR);
  }

  // Fit the shadow map to the part of the city in view (x, z, half size r): close up, the
  // shadows of furniture and people are sharp.
  setFocus(x, z, r) {
    this.focus = [x, z];
    const s = this.sun.shadow.camera;
    if (Math.abs(s.right - r) > 0.5) { s.left = -r; s.right = r; s.top = r; s.bottom = -r; s.updateProjectionMatrix(); }
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
    const c = this.focus ? { x: this.focus[0], y: this.center.y, z: this.focus[1] } : this.center, N = this.north, E = this.east;
    const hx = E[0] * Math.sin(az) + N[0] * Math.cos(az), hz = E[1] * Math.sin(az) + N[1] * Math.cos(az);
    this.sun.position.set(c.x + hx * r * Math.cos(e), c.y + explodeLift * 0.5 + Math.sin(e) * r, c.z + hz * r * Math.cos(e));
    this.sun.target.position.set(c.x, c.y + explodeLift * 0.5, c.z);
    this.sun.intensity = 0.15 + 1.5 * light;
    this.sun.color.setHSL(0.09, 0.5 - 0.35 * elev, 0.82 + 0.1 * elev);
    this.hemi.intensity = 0.62 + 0.7 * smoothstep(-0.05, 0.3, elev);
    this.hemi.color.set(light > 0.05 ? '#dcd9cc' : '#8e96b0');
    const night = 1 - smoothstep(0.02, 0.35, elev);
    // The sky and the haze follow the city's light: day and night mixed by uNight.
    const d = skyAt(skyDay, alt / D), n = skyAt(skyNight, alt / D);
    this.sky.setRGB(d.r + (n.r - d.r) * night, d.g + (n.g - d.g) * night, d.b + (n.b - d.b) * night, THREE.SRGBColorSpace);
    this.scene.fog.color.copy(this.sky);
    // The ground and the city around darken on the same curve.
    const dark = 1 - 0.7 * night;
    CONTEXT_MAT.color.setScalar(dark);
    GROUND_MAT.color.copy(GROUND).multiplyScalar(dark);
    CONTEXT_MAT.emissive.copy(SODIUM).multiplyScalar(0.012 * night);
    GROUND_MAT.emissive.copy(SODIUM).multiplyScalar(0.02 * night);
    return night;
  }
}
