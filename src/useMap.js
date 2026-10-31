// The floor-use highlight of the legend (main.js): a point at a row of the floor-use legend
// lights that use on the plan of the cut storey, and a click keeps it lit. On the cut storey,
// all else goes grey and dark, its people dim and its lines fade. The other storeys and the
// light of the normal view do not change: the highlight is only a view of the plan that the
// user asks for.
//
// A map in plan of the cut storey at 4 texels a metre, over the box uUseBox = [x0, z0,
// 1 / width, 1 / depth] as for the lamps (lamps.js): R = the use of the block there (its place
// in USE_LABEL, + 1; 0 outside the blocks), G = 255 on a corridor or a door to the next block,
// B = 255 on a link to the next building. The storey shader (cityMesh.js) and the people
// (figures.js) read it. uUseMode says what is lit, and uUseKey which use.
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { STOREY, USE_LABEL } from './layout.js';
import { CUT_H } from './kinds.js';
import { polygonsOf, triangulate } from './geom.js';

const RES = 4; // texels a metre
const USE_KEYS = Object.keys(USE_LABEL);
const MODE = { corridor: 2, link: 3 };

export const USE = {
  uUseMap: { value: null },
  uUseBox: { value: new THREE.Vector4(0, 0, 1, 1) },
  uUseMode: { value: 0 }, // 0 off, 1 the use uUseKey, 2 the corridors and their doors, 3 the links
  uUseKey: { value: 0 },
  uUseCol: { value: new THREE.Color() }, // the colour of the legend row
  uUseCut: { value: -1 }, // the cut storey, for the people
};

// useHit(xz): 1 if the plan point xz is lit, else 0.
export const USE_GLSL = /* glsl */ `
uniform sampler2D uUseMap; uniform vec4 uUseBox; uniform float uUseMode; uniform float uUseKey; uniform vec3 uUseCol; uniform float uUseCut;
float useHit(vec2 xz) {
  vec4 m = texture2D(uUseMap, (xz - uUseBox.xy) * uUseBox.zw) * 255.0;
  if (uUseMode < 1.5) return 1.0 - step(0.5, abs(m.r - uUseKey));
  return step(127.0, uUseMode < 2.5 ? m.g : m.b);
}`;

// For onBeforeCompile of the dotted lines of the plan (main.js): out of the lit use they are
// dark, as the rest of the cut storey is.
export function withUse(s) {
  Object.assign(s.uniforms, USE);
  s.vertexShader = s.vertexShader
    .replace('#include <common>', '#include <common>\nvarying vec2 vUseXZ;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nvUseXZ = position.xz;');
  s.fragmentShader = s.fragmentShader
    .replace('#include <common>', `#include <common>\nvarying vec2 vUseXZ;${USE_GLSL}`)
    .replace('#include <color_fragment>', '#include <color_fragment>\nif (uUseMode > 0.5 && useHit(vUseXZ) < 0.5) diffuseColor.rgb *= 0.3;');
}

export class UseMap {
  constructor(L) {
    this.L = L;
    this.w = Math.ceil(L.W * RES);
    this.h = Math.ceil(L.D * RES);
    USE.uUseBox.value.set(L.x0, L.z0, RES / this.w, RES / this.h);
    // The block at each texel, + 1. The plots are the same on every storey.
    this.block = new Uint16Array(this.w * this.h);
    for (const b of L.buildings)
      for (const poly of polygonsOf(b.rings)) {
        const t = triangulate(poly);
        for (let i = 0; i < t.idx.length; i += 3) this.tri(this.block, 1, 0, t.pts[t.idx[i]], t.pts[t.idx[i + 1]], t.pts[t.idx[i + 2]], b.id + 1);
      }
    this.data = new Uint8Array(this.w * this.h * 4);
    this.tex = new THREE.DataTexture(this.data, this.w, this.h, THREE.RGBAFormat);
    this.tex.magFilter = this.tex.minFilter = THREE.NearestFilter;
    this.tex.needsUpdate = true;
    USE.uUseMap.value = this.tex;
    this.c = -1;
    this.plan = null;
    this.key = null; // the key of the outline
    this.cache = new Map();
    // The outline of the lit blocks at the cut: solid where the trade is recorded, dashed where
    // it is inferred. main.js puts the group in the group of the cut storey.
    const line = (dashed) => {
      const m = new LineMaterial({ color: '#fff4dc', linewidth: 3, worldUnits: false, dashed, dashSize: 1.6, gapSize: 1.0 });
      const l = new LineSegments2(new LineSegmentsGeometry(), m);
      l.frustumCulled = false;
      l.renderOrder = 4;
      l.visible = false;
      return l;
    };
    this.solid = line(false);
    this.dashed = line(true);
    this.object = new THREE.Group();
    this.object.add(this.solid, this.dashed);
  }

  // Fill triangle a, b, c of plan points into the texels of arr (stride n, channel ch) with v:
  // each texel whose centre is in it.
  tri(arr, n, ch, a, b, c, v) {
    const L = this.L, X = (x) => (x - L.x0) * RES - 0.5, Z = (z) => (z - L.z0) * RES - 0.5;
    const ax = X(a[0]), az = Z(a[1]), bx = X(b[0]), bz = Z(b[1]), cx = X(c[0]), cz = Z(c[1]);
    const area = (bx - ax) * (cz - az) - (bz - az) * (cx - ax);
    if (Math.abs(area) < 1e-9) return;
    const s = Math.sign(area);
    const i0 = Math.max(0, Math.ceil(Math.min(ax, bx, cx))), i1 = Math.min(this.w - 1, Math.floor(Math.max(ax, bx, cx)));
    const j0 = Math.max(0, Math.ceil(Math.min(az, bz, cz))), j1 = Math.min(this.h - 1, Math.floor(Math.max(az, bz, cz)));
    const e = (px, pz, qx, qz, x, z) => s * ((qx - px) * (z - pz) - (qz - pz) * (x - px));
    for (let j = j0; j <= j1; j++)
      for (let i = i0; i <= i1; i++)
        if (e(ax, az, bx, bz, i, j) >= 0 && e(bx, bz, cx, cz, i, j) >= 0 && e(cx, cz, ax, az, i, j) >= 0) arr[(j * this.w + i) * n + ch] = v;
  }

  quad(q, ch) {
    this.tri(this.data, 4, ch, q[0], q[1], q[2], 255);
    this.tri(this.data, 4, ch, q[0], q[2], q[3], 255);
  }

  // The map of storey c (-1: no cut), with plan p of that storey (cityMesh.js buildPlan).
  set(c, p) {
    this.c = c;
    this.plan = p;
    this.key = undefined;
    for (const v of this.cache.values()) v.forEach((g) => g && g.dispose());
    this.cache.clear();
    const d = this.data, B = this.L.buildings;
    d.fill(0);
    if (c >= 0) {
      const code = B.map((b) => (b.floors > c ? USE_KEYS.indexOf(b.uses[c]) + 1 : 0));
      for (let t = 0; t < this.block.length; t++) if (this.block[t]) d[t * 4] = code[this.block[t] - 1];
      for (const { q } of p.corridors) this.quad(q, 1);
      for (const { q, link } of p.doors) this.quad(q, link ? 2 : 1);
    }
    this.tex.needsUpdate = true;
    this.show(null);
  }

  // The blocks of the cut storey with use key.
  blocks(key) {
    const c = this.c;
    return this.L.buildings.filter((b) => b.floors > c && b.uses[c] === key);
  }

  // Light key on the cut storey: a use, 'corridor', 'link', or null for none. color: the colour
  // of its legend row.
  show(key, color) {
    if (this.c < 0) key = null;
    USE.uUseMode.value = !key ? 0 : MODE[key] || 1;
    USE.uUseKey.value = USE_KEYS.indexOf(key) + 1;
    USE.uUseCut.value = key ? this.c : -1;
    if (color) USE.uUseCol.value.set(color);
    if (key === this.key) return;
    this.key = key;
    if (!this.cache.has(key)) this.cache.set(key, key ? this.outline(key) : [null, null]);
    const [solid, dashed] = this.cache.get(key);
    for (const [l, g] of [[this.solid, solid], [this.dashed, dashed]]) {
      l.visible = !!g;
      if (!g) continue;
      l.geometry = g;
      if (l === this.dashed) l.computeLineDistances();
    }
  }

  // The outline of key at the cut: [solid, dashed] geometries, or null for none. A use: the
  // edges of its blocks that do not touch another lit block. A link: a square round each.
  outline(key) {
    const c = this.c, y = c * STOREY + CUT_H + 0.05, solid = [], dashed = [];
    if (key === 'link') {
      for (const { x, z, nx, nz } of this.plan.doors.filter((d) => d.link)) {
        const r = 0.8, tx = -nz, tz = nx;
        const P = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([s, t]) => [x + (tx * s + nx * t) * r, z + (tz * s + nz * t) * r]);
        for (let i = 0; i < 4; i++) solid.push(P[i][0], y, P[i][1], P[(i + 1) % 4][0], y, P[(i + 1) % 4][1]);
      }
    } else if (key !== 'corridor') {
      const lit = new Set(this.blocks(key).map((b) => b.id));
      for (const id of lit) {
        const b = this.L.buildings[id], out = b.inferred && b.inferred[c] ? dashed : solid;
        for (const r of b.rings)
          for (const e of r.edges) if (!lit.has(e.other)) out.push(e.a[0], y, e.a[1], e.b[0], y, e.b[1]);
      }
    }
    const geo = (pos) => {
      if (!pos.length) return null;
      const g = new LineSegmentsGeometry();
      g.setPositions(pos);
      return g;
    };
    return [geo(solid), geo(dashed)];
  }

  setResolution(w, h) {
    this.solid.material.resolution.set(w, h);
    this.dashed.material.resolution.set(w, h);
  }
}
