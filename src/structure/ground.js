// The ground for the structure viewer: the terrain of data/terrain.json as one mesh, painted
// with a map of the roads, the open ground and the lanes of the City; the real buildings of
// December 1986 (data/context.json) standing on it. There is no plate under the City: its
// lanes are the ground itself, inside its own outline. The terrain under a building of the
// City is not drawn (the building's walls go down into the ground), thus no ground shows in a
// ground floor that is dug into the slope.
import * as THREE from 'three';
import { buildingPrisms, ROAD_WIDTH } from '../context.js';
import { FADE_FAR } from '../env.js';

const MAP_PX = 2048;
const COL = {
  ground: '#d9d6ce', open: '#d3cfc4', sports: '#cfd4c6', kerb: '#c7c3b9', road: '#a4a19a', dash: '#d8cfae',
  city: '#77726a', yard: '#8a857b',
};

// A canvas map of the ground in the plan frame, REACH metres round the centre.
function groundMap(T, ctx, S) {
  const R = -T.x0, px = MAP_PX / (2 * R);
  const cv = document.createElement('canvas');
  cv.width = cv.height = MAP_PX;
  const g = cv.getContext('2d');
  const X = (x) => (x + R) * px, Z = (z) => (z + R) * px;
  g.fillStyle = COL.ground;
  g.fillRect(0, 0, MAP_PX, MAP_PX);
  const poly = (ring, fill) => {
    g.beginPath();
    ring.forEach(([x, z], i) => (i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z))));
    g.closePath();
    g.fillStyle = fill;
    g.fill();
  };
  for (const o of ctx.openGround) poly(o.ring, o.kind === 'sports ground' ? COL.sports : COL.open);
  g.lineCap = g.lineJoin = 'round';
  for (const pass of ['kerb', 'road']) {
    g.strokeStyle = COL[pass];
    for (const r of ctx.roads) {
      g.lineWidth = ((r.width || ROAD_WIDTH) + (pass === 'kerb' ? 0.8 : 0)) * px;
      g.beginPath();
      r.line.forEach(([x, z], i) => (i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z))));
      g.stroke();
    }
  }
  // The City: its lanes, yards and roads, inside its outline.
  const L = S.L;
  g.fillStyle = COL.city;
  for (let k = 0; k < L.N; k++) {
    if (!L.inside[k]) continue;
    g.fillStyle = L.alley[k] === 2 ? COL.yard : COL.city;
    g.fillRect(X(L.cellX(k) - 0.5), Z(L.cellZ(k) - 0.5), px + 0.5, px + 0.5);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.flipY = false; // row 0 of the canvas is the low z
  return tex;
}

// A mask of the building footprints of the City (their G/F outlines), at 0.1 m.
function footMask(S) {
  const L = S.L, x0 = L.x0, z0 = L.z0, res = 10;
  const cv = document.createElement('canvas');
  cv.width = Math.ceil(L.W * res); cv.height = Math.ceil(L.D * res);
  const g = cv.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = '#fff';
  for (const b of S.list) {
    g.beginPath();
    for (const r of b.phases[0].rings) r.pts.forEach(([x, z], i) => (i ? g.lineTo((x - x0) * res, (z - z0) * res) : g.moveTo((x - x0) * res, (z - z0) * res)));
    g.fill('evenodd');
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.minFilter = tex.magFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.flipY = false;
  return { tex, box: new THREE.Vector4(x0, z0, L.W, L.D) };
}

export function buildGround(T, ctx, S) {
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
  const far = FADE_FAR + 3 * T.res;
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
  const mask = footMask(S);
  const mat = new THREE.MeshLambertMaterial({ map: groundMap(T, ctx, S) });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uMask = { value: mask.tex };
    sh.uniforms.uMaskBox = { value: mask.box };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vGXZ;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGXZ = (modelMatrix * vec4(position, 1.0)).xz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec2 vGXZ; uniform sampler2D uMask; uniform vec4 uMaskBox;')
      .replace('void main() {', `void main() {
  vec2 mq = (vGXZ - uMaskBox.xy) / uMaskBox.zw;
  if (mq.x > 0.0 && mq.y > 0.0 && mq.x < 1.0 && mq.y < 1.0 && texture2D(uMask, mq).r > 0.5) discard;`);
  };
  const terrain = new THREE.Mesh(geo, mat);
  terrain.receiveShadow = true;
  group.add(terrain);

  // ---- the real buildings of 1986, each standing on its lowest ground ----
  const prisms = buildingPrisms(ctx);
  const P = [], N = [], Cl = [];
  const base = new THREE.Color();
  prisms.forEach((p, id) => {
    if (!p) return;
    let lo = Infinity, sx = 0, sz = 0;
    for (const [x, z] of p.ring) { lo = Math.min(lo, T.h(x, z)); sx += x; sz += z; }
    if (Math.hypot(sx / p.ring.length, sz / p.ring.length) > FADE_FAR + 20) return;
    const y0 = lo - 1, y1 = lo + p.h;
    const r = Math.sin(id * 12.9898) * 43758.5453;
    base.setHSL(0.09 + (r - Math.floor(r)) * 0.03, 0.05, 0.8 + ((r * 7) % 1 + 1) % 1 * 0.07);
    const put = (x, y, z, n, k) => { P.push(x, y, z); N.push(...n); Cl.push(base.r * k, base.g * k, base.b * k); };
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
  });
  const cg = new THREE.BufferGeometry();
  cg.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  cg.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  cg.setAttribute('color', new THREE.Float32BufferAttribute(Cl, 3));
  const city = new THREE.Mesh(cg, new THREE.MeshLambertMaterial({ vertexColors: true }));
  city.castShadow = city.receiveShadow = true;
  group.add(city);
  return { group, terrain, context: city };
}
