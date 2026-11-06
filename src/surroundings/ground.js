// THE SURROUNDINGS of the City (the definitive 3D structure of 2026-11-04, docs/structure.md):
// the terrain of data/terrain.json as one mesh, painted with a map of the roads, the open
// ground, the paths and courts of data/surroundings.json, and the lanes of the City; the real
// buildings of December 1986 (data/context.json) standing on it. Context only: the City itself
// is src/city/. This module does not import the City model. It knows the City only by the
// plain rings of cityGround() (src/city/model.js), which the viewer passes in.
//
// There is no plate under the City: its lanes are the ground itself, inside its own outline.
// The terrain under a building of the City is not drawn (the building's walls go down into the
// ground), thus no ground shows in a ground floor that is dug into the slope.
import * as THREE from 'three';
import { ROAD_WIDTH } from '../context.js';
import { REACH, contextSolids } from './shapes.js';

const MAP_PX = 2048;
// The near ground: a sharper map of the City and its surroundings (data/surroundings.json):
// the dirt paths, the courts, the pavements. NEAR: its box in the plan frame; NEAR_RES: metres
// per pixel.
const NEAR = { x0: -230, z0: -170, x1: 230, z1: 250 }, NEAR_RES = 0.15;
// The ground has no colours: the caller gives them (colors in buildGround), for example the
// placeholder colours of the viewer (src/structureColors.js). colors.ground: a CSS colour for
// each surface: ground, open, sports, kerb, road, city, yard, dirt, path, cleared, grass,
// court, courtLine, pavement, kerbEdge, asphalt, fence, concrete. colors.building(id): the
// colour (linear rgb) of the real building id of 1986.
const surfaces = (COL) => ({ dirt: COL.dirt, path: COL.path, 'dirt-path': COL.path, cleared: COL.cleared, grass: COL.grass,
  court: COL.court, pavement: COL.pavement, concrete: COL.concrete, asphalt: COL.asphalt });

// Paints the ground into a 2D context g, for the box (x0, z0) of side w x h metres, px pixels
// a metre: the open ground and the roads of data/context.json, then the surroundings of
// data/surroundings.json (sur), then the lanes and yards of the City (city, from cityGround()),
// in the colours COL (colors.ground).
function paintGround(g, box, px, ctx, city, sur, COL) {
  const SURFACE = surfaces(COL);
  const X = (x) => (x - box.x0) * px, Z = (z) => (z - box.z0) * px;
  g.fillStyle = COL.ground;
  g.fillRect(0, 0, g.canvas.width, g.canvas.height);
  const path = (pts, close) => {
    g.beginPath();
    pts.forEach(([x, z], i) => (i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z))));
    if (close) g.closePath();
  };
  const poly = (ring, fill) => { path(ring, true); g.fillStyle = fill; g.fill(); };
  const line = (pts, w, stroke, dash) => {
    path(pts, false);
    g.lineWidth = Math.max(w * px, 0.6); g.strokeStyle = stroke; g.setLineDash(dash ? dash.map((d) => d * px) : []);
    g.stroke(); g.setLineDash([]);
  };
  for (const o of ctx.openGround) poly(o.ring, o.kind === 'sports ground' ? COL.sports : COL.open);
  g.lineCap = g.lineJoin = 'round';
  const feats = sur?.features || [];
  // the surfaces under the roads: cleared ground, fields, courts, then the paths over them
  const order = ['cleared-ground', 'football-field', 'field', 'court', 'hard', 'pavement', 'lane-strip', 'dirt-path', 'paved-path'];
  const rank = (f) => { const i = order.indexOf(f.kind); return i < 0 ? order.length : i; };
  const under = feats.filter((f) => f.kind !== 'road' && f.kind !== 'fence').sort((a, b) => rank(a) - rank(b));
  for (const f of under) {
    const fill = SURFACE[f.surface] || SURFACE[f.kind] || COL.dirt;
    if (f.ring) poly(f.ring, fill);
    if (f.line) line(f.line, f.width || 2, fill);
  }
  // the court markings: each court a rectangle with its centre line, centre circle, the keys
  // and the three-point arcs left out (a structural model)
  for (const f of feats) for (const c of f.courts || []) courtLines(g, X, Z, px, c, COL.courtLine);
  for (const pass of ['kerb', 'road']) {
    g.strokeStyle = COL[pass];
    for (const r of ctx.roads) {
      g.lineWidth = ((r.width || ROAD_WIDTH) + (pass === 'kerb' ? 0.8 : 0)) * px;
      path(r.line, false);
      g.stroke();
    }
  }
  // The streets of the 1987 survey sheet (polygons, kerb to kerb) over the centre lines of
  // data/context.json, which are wider here; then the footways again over the spill of those
  // lines, and a kerb on each edge.
  for (const f of feats) if (f.kind === 'road' && f.line) line(f.line, f.width || 6, COL.road);
  for (const f of feats) if (f.kind === 'road' && f.ring) poly(f.ring, COL.road);
  for (const f of feats) if (f.kind === 'pavement' && f.ring) poly(f.ring, SURFACE[f.surface] || COL.pavement);
  for (const f of feats) if (f.kind === 'road' && f.ring) { path(f.ring, true); g.lineWidth = Math.max(0.3 * px, 0.6); g.strokeStyle = COL.kerbEdge; g.stroke(); }
  for (const f of feats) if (f.kind === 'fence' && f.line) line(f.line, 0.12, COL.fence, [0.6, 0.4]);
  // The City: its lanes and roads, and the G/F outlines of its buildings (the mask takes the
  // ground away under them), then its yards. The outlines come from the fine plan.
  const fill = (rings, col) => {
    g.beginPath();
    for (const r of rings) r.forEach(([x, z], i) => (i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z))));
    g.fillStyle = col;
    g.fill('evenodd');
  };
  fill(city.lanes, COL.city);
  for (const f of city.footprints) fill(f, COL.city);
  fill(city.yards, COL.yard);
}

// The lines of one basketball court c = { centre: [x, z], axis: degrees in the plan frame (0:
// along x), length, width } (28 x 15 m by default): the boundary, the centre line, the centre
// circle and the two keys.
function courtLines(g, X, Z, px, c, colour) {
  const L = c.length || 28, W = c.width || 15, a = ((c.axis || 0) * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a);
  const P = (u, v) => [X(c.centre[0] + u * ca - v * sa), Z(c.centre[1] + u * sa + v * ca)];
  g.strokeStyle = colour; g.lineWidth = Math.max(0.12 * px, 0.8);
  const seg = (pts, close) => { g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(...P(...p)) : g.moveTo(...P(...p)))); if (close) g.closePath(); g.stroke(); };
  seg([[-L / 2, -W / 2], [L / 2, -W / 2], [L / 2, W / 2], [-L / 2, W / 2]], true);
  seg([[0, -W / 2], [0, W / 2]]);
  const circle = [];
  for (let q = 0; q <= 24; q++) circle.push([1.8 * Math.cos((q / 24) * 2 * Math.PI), 1.8 * Math.sin((q / 24) * 2 * Math.PI)]);
  seg(circle);
  for (const s of [-1, 1]) seg([[s * L / 2, -2.45], [s * (L / 2 - 5.8), -2.45], [s * (L / 2 - 5.8), 2.45], [s * L / 2, 2.45]]);
}

// A canvas texture of the ground over box (x0, z0, x1, z1) at res metres per pixel.
function groundTexture(box, res, ctx, city, sur, COL) {
  const cv = document.createElement('canvas');
  cv.width = Math.ceil((box.x1 - box.x0) / res); cv.height = Math.ceil((box.z1 - box.z0) / res);
  paintGround(cv.getContext('2d'), box, 1 / res, ctx, city, sur, COL);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.flipY = false; // row 0 of the canvas is the low z
  return tex;
}

// A mask of the building footprints of the City (their G/F outlines), at 0.1 m.
function footMask(city) {
  const { x0, z0, w, d } = city.box, res = 10;
  const cv = document.createElement('canvas');
  cv.width = Math.ceil(w * res); cv.height = Math.ceil(d * res);
  const g = cv.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = '#fff';
  for (const f of city.footprints) {
    g.beginPath();
    for (const r of f) r.forEach(([x, z], i) => (i ? g.lineTo((x - x0) * res, (z - z0) * res) : g.moveTo((x - x0) * res, (z - z0) * res)));
    g.fill('evenodd');
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.flipY = false;
  return { tex, box: new THREE.Vector4(x0, z0, w, d) };
}

// T: the terrain (src/terrain.js); ctx: data/context.json; city: cityGround() of the City model;
// sur: data/surroundings.json. Returns { group, terrain, context } (three.js objects).
export function buildGround(T, ctx, city, sur, colors) {
  const group = new THREE.Group();
  // ---- the terrain ----
  const n = T.nx, pos = new Float32Array(n * n * 3), uv = new Float32Array(n * n * 2);
  for (let j = 0; j < n; j++)
    for (let i = 0; i < n; i++) {
      const q = j * n + i, x = T.x0 + i * T.res, z = T.z0 + j * T.res;
      pos.set([x, T.at(i, j), z], q * 3);
      uv.set([i / (n - 1), j / (n - 1)], q * 2);
    }
  const idx = [];
  const far = REACH + 3 * T.res;
  for (let j = 0; j + 1 < n; j++)
    for (let i = 0; i + 1 < n; i++) {
      const x = T.x0 + (i + 0.5) * T.res, z = T.z0 + (j + 0.5) * T.res;
      if (Math.hypot(x, z) > far) continue;
      const a = j * n + i, b = a + 1, c = a + n, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const mask = footMask(city);
  const R = -T.x0;
  const farTex = groundTexture({ x0: -R, z0: -R, x1: R, z1: R }, (2 * R) / MAP_PX, ctx, city, sur, colors.ground);
  const near = groundTexture(NEAR, NEAR_RES, ctx, city, sur, colors.ground);
  const mat = new THREE.MeshLambertMaterial({ map: farTex });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uMask = { value: mask.tex };
    sh.uniforms.uMaskBox = { value: mask.box };
    sh.uniforms.uNear = { value: near };
    sh.uniforms.uNearBox = { value: new THREE.Vector4(NEAR.x0, NEAR.z0, NEAR.x1 - NEAR.x0, NEAR.z1 - NEAR.z0) };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vGXZ;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGXZ = (modelMatrix * vec4(position, 1.0)).xz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec2 vGXZ; uniform sampler2D uMask; uniform vec4 uMaskBox; uniform sampler2D uNear; uniform vec4 uNearBox;')
      .replace('#include <map_fragment>', `#include <map_fragment>
  vec2 nq = (vGXZ - uNearBox.xy) / uNearBox.zw;
  if (nq.x > 0.0 && nq.y > 0.0 && nq.x < 1.0 && nq.y < 1.0) diffuseColor.rgb = diffuse * texture2D(uNear, nq).rgb;`)
      .replace('void main() {', `void main() {
  vec2 mq = (vGXZ - uMaskBox.xy) / uMaskBox.zw;
  if (mq.x > 0.0 && mq.y > 0.0 && mq.x < 1.0 && mq.y < 1.0 && texture2D(uMask, mq).r > 0.5) discard;`);
  };
  const terrain = new THREE.Mesh(geo, mat);
  terrain.receiveShadow = true;
  group.add(terrain);

  // ---- the real buildings of 1986, each standing on its lowest ground ----
  const P = [], N = [], Cl = [];
  for (const p of contextSolids(ctx, T)) {
    const { id, y0, y1 } = p;
    const base = colors.building(id);
    const put = (x, y, z, n, k) => { P.push(x, y, z); N.push(...n); Cl.push(base[0] * k, base[1] * k, base[2] * k); };
    for (let i = 0; i < p.ring.length; i++) {
      const [ax, az] = p.ring[i], [bx, bz] = p.ring[(i + 1) % p.ring.length];
      const l = Math.hypot(bx - ax, bz - az) || 1, n = [-(bz - az) / l, 0, (bx - ax) / l];
      put(ax, y0, az, n, 0.85); put(bx, y0, bz, n, 0.85); put(bx, y1, bz, n, 1);
      put(ax, y0, az, n, 0.85); put(bx, y1, bz, n, 1); put(ax, y1, az, n, 1);
    }
    for (const t of THREE.ShapeUtils.triangulateShape(p.ring.map(([x, z]) => new THREE.Vector2(x, z)), [])) {
      let [a, b, c] = t.map((i) => p.ring[i]);
      if ((b[1] - a[1]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[1] - a[1]) < 0) [b, c] = [c, b];
      for (const v of [a, b, c]) put(v[0], y1, v[1], [0, 1, 0], 1.06);
    }
  }
  const cg = new THREE.BufferGeometry();
  cg.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  cg.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  cg.setAttribute('color', new THREE.Float32BufferAttribute(Cl, 3));
  const context = new THREE.Mesh(cg, new THREE.MeshLambertMaterial({ vertexColors: true }));
  context.castShadow = context.receiveShadow = true;
  group.add(context);
  return { group, terrain, context };
}
