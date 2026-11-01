// The model's surroundings: the street round the city, the real buildings, roads and open ground
// of December 1986 round it at the same level, light and time of day.
import * as THREE from 'three';
import { OUTSIDE } from './footprint.js';
import { mulberry32, clamp, smoothstep } from './util.js';
import { withDim } from './dim.js';
import { buildingPrisms, buildStreet, ROAD_WIDTH } from './context.js';

// The haze (main.js): all is clear out to FADE_NEAR metres from the centre of the city, then
// fades slowly into the sky, and is gone at FADE_FAR. Nothing is drawn beyond.
const FADE_NEAR = 350, FADE_FAR = 600;

// The flat layers on the ground are drawn first, in this order, each over the one before: they
// do not need the depth test, because all else stands on them. The street keeps its depth, so
// that nothing shows below it.
const ORDER = { ground: -7, open: -6, street: -5, kerb: -4, road: -3, pave: -2, dash: -1 };
const flat = (o, order) => {
  o.renderOrder = ORDER[order];
  o.receiveShadow = true;
  if (order !== 'ground' && order !== 'street') o.material.depthTest = o.material.depthWrite = false;
  return o;
};

// The ground is part of G/F: below a cut storey in the layered view, it dims with G/F (dim.js).
export function groundMat(m) {
  m.onBeforeCompile = (s) => withDim(s, '0.0');
  m.customProgramCacheKey = () => `kwc-ground-${m.type}`;
  return m;
}

// ctx: data/context.json.
export function buildEnvironment(scene, L, ctx) {
  const group = new THREE.Group();

  // Street surface: the dark ground under the city, flush with the ground round it. It ends at
  // the kerbs of the real roads on the north and east, and at the edge of the plate on the
  // open ground to the south and west (context.js). A pavement band runs along the city edge.
  const street = buildStreet(L, ctx.roads);
  group.add(flat(new THREE.Mesh(streetGeometry(street), groundMat(new THREE.MeshLambertMaterial({ color: '#57534c' }))), 'street'));
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
  group.add(flat(new THREE.Mesh(upGeometry(pv), groundMat(new THREE.MeshLambertMaterial({ color: '#77736a' }))), 'pave'));

  // The road names keep their place beside the hull of the city pushed out by ~10 m, where the
  // boundary roads were drawn before the real roads.
  const hull = convexHull(L.inside, L);
  const road = offsetConvex(hull, 10.5);

  const prisms = buildingPrisms(ctx);
  group.add(buildRoads(ctx.roads), buildOpenGround(ctx.openGround), buildContextCity(L, prisms));
  scene.add(group);
  // prisms: the real buildings as solids (context.js); ghosts: their fade to a ghost.
  return { group, roadOutline: road, street, prisms, ghosts: new Ghosts(prisms.length) };
}

// A geometry of flat triangles at the ground, all facing up: [x, y, z] in a flat list.
function upGeometry(pv) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pv, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(new Float32Array(pv.length).map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
  return g;
}

// The street as rectangles: the runs of each row of the grid, with equal runs of the rows
// below joined to them.
function streetGeometry(S) {
  const pv = [], open = new Map(), m = 1 / S.RES;
  const rect = (i0, i1, j0, j1) => {
    const xa = S.x0 + i0 * m, xb = S.x0 + i1 * m, za = S.z0 + j0 * m, zb = S.z0 + j1 * m;
    pv.push(xa, 0, za, xa, 0, zb, xb, 0, zb, xa, 0, za, xb, 0, zb, xb, 0, za);
  };
  for (let j = 0; j <= S.nz; j++) {
    const runs = new Set();
    for (let i = 0, a = -1; j < S.nz && i <= S.nx; i++) {
      const on = i < S.nx && S.street[j * S.nx + i];
      if (on && a < 0) a = i;
      if (!on && a >= 0) { runs.add(`${a},${i}`); a = -1; }
    }
    for (const [key, j0] of open) if (!runs.has(key)) { const [a, b] = key.split(',').map(Number); rect(a, b, j0, j); open.delete(key); }
    for (const key of runs) if (!open.has(key)) open.set(key, j);
  }
  return upGeometry(pv);
}

// ---- the roads and the open ground of December 1986 --------------------------------------
// The real roads at their width, in a gentle grey darker than the ground, with a light kerb.
// Near the city each carries a dashed centre line, as the boundary roads did before.
const ROAD = new THREE.Color('#a19e97'), KERB = new THREE.Color('#c9c5bc'), DASH = new THREE.Color('#d9cfae');
const ROAD_MAT = new THREE.MeshLambertMaterial({ color: '#ffffff' });
const KERB_MAT = new THREE.MeshLambertMaterial({ color: '#ffffff' });
const DASH_MAT = new THREE.LineDashedMaterial({ color: '#ffffff', dashSize: 2.2, gapSize: 2.6 });
const KERB_W = 0.4, DASH_R = 260, DASH_MIN_W = 5;

function buildRoads(roads) {
  const band = (pv, line, h, y) => {
    const tri = (a, b, c) => {
      if ((b[1] - a[1]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[1] - a[1]) < 0) [b, c] = [c, b]; // face up
      pv.push(a[0], y, a[1], b[0], y, b[1], c[0], y, c[1]);
    };
    for (let q = 0; q < line.length; q++) {
      const A = line[q];
      // a round join (or end) at each point
      for (let s = 0; s < 12; s++) {
        const a0 = (s / 12) * 2 * Math.PI, a1 = ((s + 1) / 12) * 2 * Math.PI;
        tri(A, [A[0] + Math.cos(a0) * h, A[1] + Math.sin(a0) * h], [A[0] + Math.cos(a1) * h, A[1] + Math.sin(a1) * h]);
      }
      if (q + 1 === line.length) break;
      const B = line[q + 1], dx = B[0] - A[0], dz = B[1] - A[1], l = Math.hypot(dx, dz) || 1;
      const nx = (dz / l) * h, nz = (-dx / l) * h;
      const P = [A[0] + nx, A[1] + nz], Q = [B[0] + nx, B[1] + nz], R = [B[0] - nx, B[1] - nz], S = [A[0] - nx, A[1] - nz];
      tri(P, Q, R); tri(P, R, S);
    }
  };
  const rv = [], kv = [], dv = [];
  for (const r of roads) {
    const h = (r.width || ROAD_WIDTH) / 2;
    band(rv, r.line, h, 0.01);
    band(kv, r.line, h + KERB_W, 0.008);
    if (2 * h < DASH_MIN_W) continue;
    for (let q = 0; q + 1 < r.line.length; q++) {
      const [ax, az] = r.line[q], [bx, bz] = r.line[q + 1];
      if (Math.hypot((ax + bx) / 2, (az + bz) / 2) < DASH_R) dv.push(ax, 0.02, az, bx, 0.02, bz);
    }
  }
  const g = new THREE.Group();
  g.add(flat(new THREE.Mesh(upGeometry(kv), KERB_MAT), 'kerb'), flat(new THREE.Mesh(upGeometry(rv), ROAD_MAT), 'road'));
  const dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.Float32BufferAttribute(dv, 3));
  const dash = flat(new THREE.LineSegments(dg, DASH_MAT), 'dash');
  dash.computeLineDistances();
  g.add(dash);
  return g;
}

// The open ground: faint tints on the ground. The cleared ground of Sai Tau Tsuen and the
// building sites in a warm earth grey, the market a little lighter, the football field and the
// courts a faint green grey.
const OPEN_MAT = new THREE.MeshLambertMaterial({ color: '#ffffff', vertexColors: true });
const OPEN_TINT = { 'building site': '#d8d4ca', market: '#dbd8cf', 'sports ground': '#d3d8cb' };

function buildOpenGround(open) {
  const pv = [], col = [], c = new THREE.Color();
  for (const g of open) {
    c.set(OPEN_TINT[g.kind] || OPEN_TINT['building site']);
    const ring = g.ring.map(([x, z]) => new THREE.Vector2(x, z));
    for (const t of THREE.ShapeUtils.triangulateShape(ring, [])) {
      let [a, b, d] = t.map((i) => g.ring[i]);
      if ((b[1] - a[1]) * (d[0] - a[0]) - (b[0] - a[0]) * (d[1] - a[1]) < 0) [b, d] = [d, b]; // face up
      for (const p of [a, b, d]) { pv.push(p[0], -0.03, p[1]); col.push(c.r, c.g, c.b); }
    }
  }
  const geo = upGeometry(pv);
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return flat(new THREE.Mesh(geo, OPEN_MAT), 'open');
}

// ---- the real buildings of December 1986 --------------------------------------------------
// Light warm greys, as on a 3D map: each building a little different, the roofs a little lighter
// than the walls, and the walls a little darker toward the ground. The normals lean a little
// toward up, so the walls stay soft, but each face keeps its own shade, so the edges stay crisp.
// They cast shadows and take them. By day and at night they darken with the sky, as the ground
// does; at night the streets take a faint sodium glow (#f8f1ba / #cfb272, p316), and a few
// windows are lit.
const CONTEXT_MAT = new THREE.MeshLambertMaterial({ color: '#ffffff', vertexColors: true });
const GROUND_MAT = new THREE.MeshLambertMaterial({ color: '#ffffff' });
const GROUND = new THREE.Color('#dddcd8');
const SODIUM = new THREE.Color('#cfb272');
// uNight: the light of the city (Lighting). uLit: the share of the windows lit at this hour.
// uOpen: the layered view (main.js). A building that stands partly in the box of the City
// (Mei Tung House) fades to a faint dither as the storeys open, so that the slabs of the
// storeys do not cut through it. uGhost and uClock: the ghosts of the buildings that hide the
// City (Ghosts, below).
export const CONTEXT_U = { uNight: { value: 0 }, uLit: { value: 0 }, uOpen: { value: 0 }, uGhost: { value: null }, uClock: { value: 0 } };
// aCtx: [metres along the walls, seed of the building, 1 on a wall (0 on a roof), 1 in the box].
const CTX_VERT = ['#include <common>', `#include <common>
attribute vec4 aCtx; varying vec4 vCtx; varying float vCtxY;`, '#include <begin_vertex>', `#include <begin_vertex>
vCtx = aCtx; vCtxY = position.y;`];
const CTX_FRAG = `uniform float uNight; uniform float uLit; uniform float uOpen; varying vec4 vCtx; varying float vCtxY;
float ctxIgn(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
float ctxHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }`;
const CTX_OPEN = 'if (vCtx.w > 0.5 && ctxIgn(gl_FragCoord.xy) < 0.85 * uOpen) discard;';
// The ghost (Ghosts, below): vGhost is the fade of the building, 0 solid and 1 a ghost, from
// its texel of uGhost. GHOST_W: the texels in a row of uGhost. GHOST_EASE: the seconds of the
// fade. The ghost and the fade of the layered view use the same dither, thus the stronger one
// wins. The shadow pass (CONTEXT_DEPTH) has no ghost.
const GHOST_W = 64, GHOST_EASE = 0.25;
const GHOST_VERT = ['#include <common>', `#include <common>
attribute float aCtxId; uniform sampler2D uGhost; uniform float uClock; varying float vGhost;`, '#include <begin_vertex>', `#include <begin_vertex>
int ghostId = int(aCtxId + 0.5);
vec4 ghost = texelFetch(uGhost, ivec2(ghostId % ${GHOST_W}, ghostId / ${GHOST_W}), 0);
vGhost = mix(ghost.x, ghost.y, smoothstep(ghost.z, ghost.z + ${GHOST_EASE.toFixed(2)}, uClock));`];
const CTX_GHOST = 'if (ctxIgn(gl_FragCoord.xy) < 0.85 * max(vGhost, vCtx.w * uOpen)) discard;';
CONTEXT_MAT.onBeforeCompile = (s) => {
  Object.assign(s.uniforms, CONTEXT_U);
  s.vertexShader = s.vertexShader.replace(CTX_VERT[0], CTX_VERT[1]).replace(CTX_VERT[2], CTX_VERT[3])
    .replace(GHOST_VERT[0], GHOST_VERT[1]).replace(GHOST_VERT[2], GHOST_VERT[3]);
  s.fragmentShader = s.fragmentShader
    .replace('#include <common>', `#include <common>
${CTX_FRAG}
varying float vGhost;`)
    .replace('void main() {', `void main() {
  ${CTX_GHOST}`)
    .replace('#include <normal_fragment_begin>', `#include <normal_fragment_begin>
normal = normalize(mix(normal, normalize(mat3(viewMatrix) * vec3(0.0, 1.0, 0.0)), 0.3));`)
    // Lit windows at night (none by day or at dawn): a bay 3.2 m wide on each storey of 2.9 m;
    // a window in the middle of each bay, lit by chance at the share uLit. Some warm, some the
    // blue-white of a tube.
    .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
vec2 g = vec2(vCtx.x / 3.2, vCtxY / 2.9), w = fwidth(g);
if (vCtx.z > 0.5 && uNight > 0.0) {
  vec2 c = floor(g), f = fract(g);
  float m = smoothstep(0.25 - w.x, 0.25 + w.x, f.x) * smoothstep(0.75 + w.x, 0.75 - w.x, f.x)
          * smoothstep(0.32 - w.y, 0.32 + w.y, f.y) * smoothstep(0.8 + w.y, 0.8 - w.y, f.y);
  float h = ctxHash(c + vec2(vCtx.y * 61.0, vCtx.y * 17.0));
  vec3 tint = fract(h * 37.0) < 0.6 ? vec3(1.0, 0.72, 0.42) : vec3(0.72, 0.84, 1.0);
  totalEmissiveRadiance += tint * (0.2 * m * step(h, uLit) * smoothstep(0.35, 0.9, uNight));
}`);
};
CONTEXT_MAT.customProgramCacheKey = () => 'kwc-context';
// The shadow of a building that fades in the layered view fades with it. A ghost keeps the
// shadow of the whole building: the shadows do not change when the camera moves.
const CONTEXT_DEPTH = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
CONTEXT_DEPTH.onBeforeCompile = (s) => {
  Object.assign(s.uniforms, CONTEXT_U);
  s.vertexShader = s.vertexShader.replace(CTX_VERT[0], CTX_VERT[1]).replace(CTX_VERT[2], CTX_VERT[3]);
  s.fragmentShader = s.fragmentShader.replace('#include <common>', `#include <common>
${CTX_FRAG}`).replace('void main() {', `void main() {
  ${CTX_OPEN}`);
};
CONTEXT_DEPTH.customProgramCacheKey = () => 'kwc-context-depth';

// The buildings of data/context.json stand on the ground, each from its outline up to its
// height, all in one mesh; the ground is a disc that ends where the haze is whole. The
// outlines are clockwise in (x, z) (buildingPrisms, context.js), so that each wall faces out.
// aCtxId: the index of the building in prisms, for its ghost.
function buildContextCity(L, prisms) {
  const pos = [], nor = [], col = [], att = [], ids = [];
  const base = new THREE.Color(), c = new THREE.Color();
  const box = (x, z) => x > L.x0 && x < L.x0 + L.W && z > L.z0 && z < L.z0 + L.D;
  let id = 0;
  const put = (x, y, z, n, k, a) => { pos.push(x, y, z); nor.push(...n); col.push(base.r * k, base.g * k, base.b * k); att.push(...a); ids.push(id); };
  prisms.forEach((b, i) => {
    if (!b) return;
    id = i;
    const ring = b.ring;
    const rng = mulberry32(id * 7 + 3), seed = rng();
    base.setHSL(0.09 + rng() * 0.03, 0.03 + rng() * 0.04, 0.79 + rng() * 0.08);
    const h = b.h, inBox = ring.some(([x, z]) => box(x, z)) ? 1 : 0;
    let u = 0;
    for (let i = 0; i < ring.length; i++) {
      const [px, pz] = ring[i], [qx, qz] = ring[(i + 1) % ring.length];
      const l = Math.hypot(qx - px, qz - pz), n = [-(qz - pz) / l, 0, (qx - px) / l];
      const a0 = [u, seed, 1, inBox], a1 = [u + l, seed, 1, inBox];
      put(px, 0, pz, n, 0.84, a0); put(qx, 0, qz, n, 0.84, a1); put(qx, h, qz, n, 1, a1);
      put(px, 0, pz, n, 0.84, a0); put(qx, h, qz, n, 1, a1); put(px, h, pz, n, 1, a0);
      u += l;
    }
    const tris = THREE.ShapeUtils.triangulateShape(ring.map(([x, z]) => new THREE.Vector2(x, z)), []);
    for (const t of tris) {
      let [p, q, r] = t.map((i) => ring[i]);
      if ((q[1] - p[1]) * (r[0] - p[0]) - (q[0] - p[0]) * (r[1] - p[1]) < 0) [q, r] = [r, q]; // face up
      for (const v of [p, q, r]) put(v[0], h, v[1], [0, 1, 0], 1.07, [0, seed, 0, inBox]);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geo.setAttribute('aCtx', new THREE.Float32BufferAttribute(att, 4));
  geo.setAttribute('aCtxId', new THREE.Float32BufferAttribute(ids, 1));
  const mesh = new THREE.Mesh(geo, CONTEXT_MAT);
  mesh.customDepthMaterial = CONTEXT_DEPTH;
  mesh.castShadow = mesh.receiveShadow = true;
  const cx = L.x0 + L.W / 2, cz = L.z0 + L.D / 2;
  // A little below the street, so that the two do not fight where they overlap.
  const ground = flat(new THREE.Mesh(new THREE.CircleGeometry(FADE_FAR, 128).rotateX(-Math.PI / 2), GROUND_MAT), 'ground');
  ground.position.set(cx, -0.05, cz);
  const g = new THREE.Group();
  g.add(mesh, ground);
  return g;
}

// The ghosts of the real buildings that hide the City (occlude.js tests which ones, main.js
// calls set when the view direction changes). The texel of building i in uGhost holds the fade
// at the last change, the fade that it goes to, and the time of that change in seconds. The
// shader eases from the one to the other in GHOST_EASE seconds, on the clock uClock. A fade of
// 0 is the solid building, 1 a ghost: 15 % of it stays, as a dither (CTX_GHOST).

export class Ghosts {
  constructor(n) {
    this.n = n;
    this.data = new Float32Array(GHOST_W * Math.max(1, Math.ceil(n / GHOST_W)) * 4);
    this.tex = new THREE.DataTexture(this.data, GHOST_W, this.data.length / 4 / GHOST_W, THREE.RGBAFormat, THREE.FloatType);
    this.tex.needsUpdate = true;
    CONTEXT_U.uGhost.value = this.tex;
  }

  // The fade of building i at the time t, as the shader has it.
  at(i, t) {
    const d = this.data, o = 4 * i, x = clamp((t - d[o + 2]) / GHOST_EASE, 0, 1);
    return d[o] + (d[o + 1] - d[o]) * x * x * (3 - 2 * x);
  }

  // From the time t, each building i goes to the fade to[i].
  set(to, t) {
    const d = this.data;
    for (let i = 0; i < this.n; i++) {
      const o = 4 * i;
      if (d[o + 1] === to[i]) continue;
      d[o] = this.at(i, t);
      d[o + 1] = to[i];
      d[o + 2] = t;
      this.tex.needsUpdate = true;
    }
  }
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

// The share of the windows round the City that are lit, by the hour: most in the evening,
// few after midnight, some again before dawn. INFERRED; no source counts them.
const LIT = [[0, 0.08], [2, 0.04], [5, 0.03], [6.5, 0.07], [8, 0.04], [17, 0.1], [19, 0.15], [22.5, 0.13], [24, 0.08]];
function litAt(hour) {
  for (let i = 0; i + 1 < LIT.length; i++) {
    const [h0, v0] = LIT[i], [h1, v1] = LIT[i + 1];
    if (hour <= h1) return v0 + ((v1 - v0) * (hour - h0)) / (h1 - h0);
  }
  return LIT[0][1];
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
    // The ground and the city around darken on the same curve. The roads take a little more of
    // the sodium glow than the ground, and the roofs less.
    const dark = 1 - 0.7 * night;
    CONTEXT_MAT.color.setScalar(dark);
    OPEN_MAT.color.setScalar(dark);
    GROUND_MAT.color.copy(GROUND).multiplyScalar(dark);
    ROAD_MAT.color.copy(ROAD).multiplyScalar(dark);
    KERB_MAT.color.copy(KERB).multiplyScalar(dark);
    DASH_MAT.color.copy(DASH).multiplyScalar(1 - 0.75 * night);
    CONTEXT_MAT.emissive.copy(SODIUM).multiplyScalar(0.012 * night);
    for (const m of [GROUND_MAT, OPEN_MAT, KERB_MAT]) m.emissive.copy(SODIUM).multiplyScalar(0.02 * night);
    ROAD_MAT.emissive.copy(SODIUM).multiplyScalar(0.035 * night);
    CONTEXT_U.uNight.value = night;
    CONTEXT_U.uLit.value = litAt(hour);
    return night;
  }
}
