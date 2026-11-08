// The definitive structure of the City (src/city/) in the main app, drawn as floor layers.
// Layer k holds all that stands on the slabs of floor index k: the slab of storey k of each
// building, its walls, rooms, partitions and stairs, and the links of that storey. The roof of
// a building of n storeys, with all that is on it (parapets, stair huts, roof rooms, ladders),
// is layer n. Thus:
// - in the normal view the layers stand in place;
// - pulled apart (setSpread), layer k rises by lift[k]. The G/F of one building can stand over
//   the 1/F of another (the G/F floors range over 15 m of the slope), but a clear gap of GAP m
//   lies between the highest point of each layer and the lowest point of the next;
// - peeled to storey c (setPeel), the layers over c go, with all the roofs over storey c and
//   all that is on them: all the rooms of that storey show from above, with their walls whole.
// Nothing is cut: the layers only move apart, or go.
// The structure has no colours: the caller gives colorOf (src/structureColors.js).
import * as THREE from 'three';
import { buildMesh, buildProps, KIND } from './city/mesh.js';
import { levelAt, floorName } from './city/model.js';
import { UNIT } from './city/plan.js';
import { smoothstep } from './util.js';

export const GAP = 6; // metres of clear air between two layers, pulled apart
const NO_ID = -100;

const triangulate = (outer, holes) => {
  const v = (p) => new THREE.Vector2(p[0], p[1]);
  const tris = THREE.ShapeUtils.triangulateShape(outer.map(v), holes.map((h) => h.map(v)));
  return { pts: [...outer, ...holes.flat()], idx: tris.flat() };
};

const VERT_HEAD = 'attribute vec3 aInfo; varying vec3 vInfo;';
const VERT_BODY = 'vInfo = aInfo;';

export class CityLayers {
  // S: the structure (buildStructure in src/city/model.js); colorOf: the colour of each part.
  constructor(S, colorOf) {
    this.S = S;
    const maxN = Math.max(...S.list.map((b) => b.n));
    this.top = maxN; // the highest layer: only roofs
    this.n = maxN + 1;
    this.spread = 0;
    this.peelK = -1;
    this.U = {
      uSel: { value: NO_ID }, uHi: { value: NO_ID },
      uCutColor: { value: new THREE.Color('#3d3934') },
    };

    // ---- the geometry: the shell, the ladders and stools, and the inside of every floor ----
    const shell = buildMesh(S, { triangulate, props: false, colorOf });
    const inside = buildMesh(S, { triangulate, shell: false, inside: () => true, colorOf });
    const props = [];
    for (const d of S.doors) {
      const one = { doors: [d], list: S.list };
      // a stool stands in the corridor of storey d.k (links.js); a ladder on the lower roof
      if (d.stool) props.push([buildProps(one, 'stool', { colorOf }).arrays, d.b, d.k ?? 0]);
      if (d.kind === 'ladder') {
        const low = d.y <= d.yc ? S.list[d.b] : S.list[d.c];
        props.push([buildProps(one, 'ladder', { colorOf }).arrays, low.id, low.n]);
      }
    }
    for (const [a, b, k] of props) for (let v = 0; v < a.info.length; v += 3) { a.info[v] = b; a.info[v + 1] = k; }
    // The parapet round the terrace of a setback stands on the floor under the top storey, not
    // on the roof: it goes with that floor.
    for (let v = 0; v < shell.info.length; v += 3) {
      const b = S.list[shell.info[v]];
      if (shell.info[v + 2] === KIND.ROOF && shell.info[v + 1] === b.n && shell.position[v + 1] < b.y[b.n] - 0.3) shell.info[v + 1] = b.n - 1;
    }
    const sets = [{ a: shell, inside: false }, { a: merge(props.map((p) => p[0])), inside: false }, { a: inside, inside: true }];

    // ---- the band of each layer, and its lift when pulled apart ----
    const lo = new Array(this.n).fill(Infinity), hi = new Array(this.n).fill(-Infinity);
    for (const { a } of sets)
      for (let v = 0; v < a.info.length; v += 3) {
        const k = a.info[v + 1], y = a.position[v + 1];
        if (y < lo[k]) lo[k] = y;
        if (y > hi[k]) hi[k] = y;
      }
    this.lo = lo; this.hi = hi;
    this.lifts();

    // ---- the materials: the view, the shadows, the pick ----
    this.material = this.viewMaterial();
    this.depth = this.depthMaterial();
    this.pickMat = this.pickMaterial();

    // ---- a group for each layer, with a mesh for each set ----
    const L = S.L, cx = L.x0 + L.W / 2, cz = L.z0 + L.D / 2, r = Math.hypot(L.W, L.D) / 2;
    this.group = new THREE.Group();
    this.pickScene = new THREE.Scene();
    this.layers = Array.from({ length: this.n }, (_, k) => {
      const group = new THREE.Group(), pick = new THREE.Group();
      this.group.add(group);
      this.pickScene.add(pick);
      return { k, group, pick, meshes: [], twins: [] };
    });
    for (const set of sets) {
      const { a } = set;
      const shared = {
        position: new THREE.BufferAttribute(a.position, 3), normal: new THREE.BufferAttribute(a.normal, 3),
        color: new THREE.BufferAttribute(a.color, 3), aInfo: new THREE.BufferAttribute(a.info, 3),
      };
      split(a, this.n).forEach((idx, k) => {
        if (!idx.length) return;
        const g = new THREE.BufferGeometry();
        for (const [name, attr] of Object.entries(shared)) g.setAttribute(name, attr);
        g.setIndex(new THREE.BufferAttribute(idx, 1));
        // the shared buffers hold every layer: the bounds come from the band of this one
        g.boundingSphere = new THREE.Sphere(new THREE.Vector3(cx, (lo[k] + hi[k]) / 2, cz), Math.hypot(r, (hi[k] - lo[k]) / 2) + 2);
        const m = new THREE.Mesh(g, this.material);
        m.castShadow = m.receiveShadow = true;
        m.customDepthMaterial = this.depth;
        m.userData.inside = set.inside;
        const t = new THREE.Mesh(g, this.pickMat);
        const lv = this.layers[k];
        lv.group.add(m);
        lv.pick.add(t);
        lv.meshes.push(m);
        lv.twins.push(t);
      });
    }
    // ---- the dark plates between the layers pulled apart: each layer shows through the plate
    // over it, with a light edge round the plate (the box of the City plan) ----
    const plateGeo = new THREE.PlaneGeometry(L.W + 4, L.D + 4).rotateX(-Math.PI / 2).translate(cx, 0, cz);
    const edgeGeo = new THREE.EdgesGeometry(plateGeo);
    this.plates = [];
    for (let k = 1; k < this.n; k++) {
      const plate = new THREE.Mesh(plateGeo, new THREE.MeshBasicMaterial({ color: '#1c1b18', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
      plate.renderOrder = 1;
      const edge = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: '#efe8d6', transparent: true, opacity: 0 }));
      this.group.add(plate, edge);
      this.plates[k] = { plate, edge };
    }
    this.pickRT = new THREE.WebGLRenderTarget(1, 1);
    this.px = new Uint8Array(4);
    this.tags = [];
    this.spans = []; // the meshes of addSpan
    this.tier = 0; // the detail that shows (setTier)
    this.apply();
  }

  // The lift of each layer pulled apart, from the bands lo and hi: a clear gap of GAP m over
  // the highest point of the layer under it.
  lifts() {
    this.lift = [0];
    for (let k = 1; k < this.n; k++) this.lift[k] = this.lift[k - 1] + Math.max(0, this.hi[k - 1] + GAP - this.lo[k]);
    this.maxLift = this.lift[this.n - 1];
  }

  // More geometry for layer k, drawn and picked as the structure of that layer: the pipes and
  // cables of src/life/pipes.js. a: mesh arrays as buildMesh gives them (position, normal,
  // colour, info, index), all of layer k. shadow: it casts shadows. tier: 0 always shows, 1 only
  // near the camera (setTier), for the things thinner than a pixel from far away.
  addLayer(k, a, { shadow = true, tier = 0 } = {}) {
    const lv = this.layers[k];
    if (!lv || !a.index.length) return;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(a.position, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(a.normal, 3));
    g.setAttribute('color', new THREE.BufferAttribute(a.color, 3));
    g.setAttribute('aInfo', new THREE.BufferAttribute(a.info, 3));
    g.setIndex(new THREE.BufferAttribute(a.index, 1));
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, this.material);
    m.castShadow = shadow; m.receiveShadow = true;
    m.customDepthMaterial = this.depth;
    m.userData.inside = false;
    m.userData.tier = tier;
    const t = new THREE.Mesh(g, this.pickMat);
    lv.group.add(m); lv.pick.add(t);
    lv.meshes.push(m); lv.twins.push(t);
    // the band of the layer takes in the new geometry (a pipe over the roof), thus the gap stays
    for (let v = 1; v < a.position.length; v += 3) {
      if (a.position[v] < this.lo[k]) this.lo[k] = a.position[v];
      if (a.position[v] > this.hi[k]) this.hi[k] = a.position[v];
    }
    this.lifts();
    this.apply();
  }

  // Geometry that joins two layers (a wire from one building to another): it shows only in the
  // normal view, not pulled apart and not peeled. It is not picked.
  addSpan(a) {
    if (!a.index.length) return;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(a.position, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(a.normal, 3));
    g.setAttribute('color', new THREE.BufferAttribute(a.color, 3));
    g.setAttribute('aInfo', new THREE.BufferAttribute(a.info, 3));
    g.setIndex(new THREE.BufferAttribute(a.index, 1));
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, this.material);
    m.receiveShadow = true;
    this.group.add(m);
    this.spans.push(m);
    this.apply();
  }

  // The material of the view: the peel, the cut faces dark, the selected building warm and
  // the building under the pointer a little lighter.
  viewMaterial() {
    const m = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, this.U);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>\n${VERT_HEAD}`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>\n${VERT_BODY}`);
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vInfo; uniform float uSel; uniform float uHi; uniform vec3 uCutColor;')
        .replace('#include <dithering_fragment>', `#include <dithering_fragment>
  if (!gl_FrontFacing) gl_FragColor.rgb = uCutColor;
  if (abs(vInfo.x - uSel) < 0.5) gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.98, 0.72, 0.36), 0.32);
  else if (abs(vInfo.x - uHi) < 0.5) gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(1.0, 0.95, 0.85), 0.25);`);
    };
    m.customProgramCacheKey = () => 'kwc-layers';
    return m;
  }

  // The shadows: both faces of each part cast them.
  depthMaterial() {
    return new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, side: THREE.DoubleSide });
  }

  // The pick: each fragment writes its building + 1 (red and green), and its layer and kind
  // (blue: layer + 16 kind). 0 is nothing.
  pickMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: this.U,
      side: THREE.DoubleSide,
      vertexShader: `${VERT_HEAD}\nvoid main() { ${VERT_BODY} gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `varying vec3 vInfo;\nvoid main() { float id = vInfo.x + 1.0;
  gl_FragColor = vec4(mod(id, 256.0) / 255.0, floor(id / 256.0) / 255.0, (vInfo.y + 16.0 * vInfo.z) / 255.0, 1.0); }`,
    });
  }

  // The real buildings and the ground round the City hide what is behind them, also in the pick.
  addOccluders(objects) {
    const black = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    for (const o of objects) {
      o.updateWorldMatrix(true, false);
      const t = new THREE.Mesh(o.geometry, black);
      t.matrixAutoUpdate = false;
      t.matrix.copy(o.matrixWorld);
      this.pickScene.add(t);
    }
  }

  // A plate with the name of each layer, in the pulled-apart view: at the west edge of the dark
  // plate under the layer (G/F: on the ground), thus it names what stands over that plate.
  // font: a CSS font.
  makeTags(font) {
    const L = this.S.L;
    for (const lv of this.layers) {
      const text = lv.k === this.top ? 'ROOF' : floorName(lv.k);
      const c = document.createElement('canvas'), g = c.getContext('2d'), s = 4;
      g.font = `${8 * s}px ${font}`;
      const w = Math.ceil(g.measureText(text).width) + 8 * s;
      c.width = w; c.height = 13 * s;
      g.fillStyle = 'rgba(28, 27, 25, 0.92)';
      g.fillRect(0, 0, c.width, c.height);
      g.font = `${8 * s}px ${font}`;
      g.fillStyle = '#ddd3b8';
      g.textBaseline = 'middle';
      g.fillText(text, 4 * s, c.height / 2 + s / 2);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, fog: false }));
      sp.center.set(1, 0);
      sp.renderOrder = 20;
      sp.position.set(L.x0 - 3, 0, L.z0 + L.D / 2);
      sp.userData.aspect = w / c.height;
      this.group.add(sp);
      lv.tag = sp;
      this.tags.push(sp);
    }
    this.apply();
  }

  // Keep the plates about 15 pixels high on the screen.
  sizeTags(camera, heightPx) {
    const m = (camera.top - camera.bottom) / camera.zoom / heightPx, h = 15 * m;
    for (const t of this.tags) t.scale.set(h * t.userData.aspect, h, 1);
  }

  // e: 0 in place, 1 fully apart.
  setSpread(e) {
    this.spread = e;
    this.apply();
  }

  // Peel the city to storey c: the layers over c go; storey c stays whole. c = -1: no peel.
  setPeel(c) {
    this.peelK = c;
    this.apply();
  }

  apply() {
    const e = this.spread, c = this.peelK, a = smoothstep(0.02, 0.5, e);
    for (const lv of this.layers) {
      const on = c < 0 || lv.k <= c;
      lv.group.position.y = this.lift[lv.k] * e;
      lv.group.visible = on;
      // The inside of a floor shows only from above: pulled apart, or the peeled storey.
      for (const m of lv.meshes) m.visible = (!m.userData.inside || e > 0.01 || lv.k === c) && (m.userData.tier || 0) <= this.tier;
    }
    // The plate under layer k lies in the middle of the clear air between layer k - 1 and layer
    // k, thus it never cuts a building. It comes in as that gap opens.
    for (let k = 1; k < this.n; k++) {
      const { plate, edge } = this.plates[k];
      const top = this.hi[k - 1] + this.lift[k - 1] * e, bot = this.lo[k] + this.lift[k] * e;
      const p = smoothstep(1, GAP, bot - top);
      plate.position.y = edge.position.y = (top + bot) / 2;
      plate.visible = edge.visible = p > 0.01 && (c < 0 || k <= c);
      plate.material.opacity = 0.26 * p;
      edge.material.opacity = 0.55 * p;
    }
    for (const m of this.spans) m.visible = e < 0.01 && c < 0;
    for (const lv of this.layers) {
      if (!lv.tag) continue;
      lv.tag.position.y = lv.k ? this.plates[lv.k].plate.position.y + 0.3 : this.lo[0];
      lv.tag.visible = (c < 0 || lv.k <= c) && a > 0.01;
      lv.tag.material.opacity = a;
    }
  }

  // The detail that shows, from the metres of the view in one pixel: the thin things of tier 1
  // show under 0.16 m (as the small things of src/life/furnish.js).
  setTier(mPerPx) {
    const t = mPerPx < 0.16 ? 1 : 0;
    if (t !== this.tier) { this.tier = t; this.apply(); }
  }

  setSelected(b) { this.U.uSel.value = b >= 0 ? b : NO_ID; }
  setHover(b) { this.U.uHi.value = b >= 0 ? b : NO_ID; }

  // What is under the screen point (x, y) of a w x h view: { b, k, kind } for a part of a
  // building, { person, k, kind } for a figure (src/life/figures.js, kind 8), or null. A real
  // building or the ground in front stops the pick.
  pick(renderer, camera, x, y, w, h) {
    for (const lv of this.layers) {
      lv.pick.position.y = lv.group.position.y;
      lv.pick.visible = lv.group.visible;
      lv.twins.forEach((t, i) => { t.visible = lv.meshes[i].visible; });
    }
    camera.setViewOffset(w, h, Math.floor(x), Math.floor(y), 1, 1);
    const prev = renderer.getRenderTarget(), cc = renderer.getClearColor(this.clear ||= new THREE.Color()), ca = renderer.getClearAlpha();
    renderer.setRenderTarget(this.pickRT);
    renderer.setClearColor(0x000000, 1);
    renderer.clear();
    renderer.render(this.pickScene, camera);
    renderer.setRenderTarget(prev);
    renderer.setClearColor(cc, ca);
    camera.clearViewOffset();
    renderer.readRenderTargetPixels(this.pickRT, 0, 0, 1, 1, this.px);
    const id = this.px[0] + this.px[1] * 256 - 1, kind = this.px[2] >> 4, k = this.px[2] % 16;
    if (id < 0) return null;
    if (kind === 8) return { person: id, k, kind };
    if (id >= this.S.list.length) return null;
    return { b: id, k, kind };
  }

  // The point on the floor of storey k of building b under a ray, in the model (not lifted).
  floorPoint(ray, b, k, h = 0) {
    const B = this.S.list[b], y = B.y[k] + h + this.lift[k] * this.spread;
    if (Math.abs(ray.direction.y) < 1e-6) return null;
    const t = (y - ray.origin.y) / ray.direction.y;
    return t > 0 ? { x: ray.origin.x + ray.direction.x * t, z: ray.origin.z + ray.direction.z * t } : null;
  }

  // (h: metres over the floor.)
  // The room (unit) of storey k of building b at the point p: the plan cell under it, else the
  // nearest unit within 3 m. On the roof (k = n): the roof room, if the building has one.
  roomAt(b, k, p) {
    const B = this.S.list[b];
    if (k >= B.n) return B.roofRoom ? 0 : null;
    const plan = B.phaseOf(k).plan, c = plan.R.cellXZ(p.x, p.z), v = c >= 0 ? plan.code[c] : -1;
    if (v >= UNIT) return v - UNIT;
    let best = null, bd = 3;
    for (const u of plan.units) { const d = Math.hypot(u.x - p.x, u.z - p.z); if (d < bd) { bd = d; best = u.id; } }
    return best;
  }

  // The storey of building b at height y (in the model): levelAt of src/city/model.js.
  levelOf(b, y) { return levelAt(this.S.list[b], y); }
}

// Several sets of mesh arrays as one.
function merge(list) {
  let nv = 0, ni = 0;
  for (const a of list) { nv += a.position.length / 3; ni += a.index.length; }
  const out = { position: new Float32Array(nv * 3), normal: new Float32Array(nv * 3), color: new Float32Array(nv * 3), info: new Float32Array(nv * 3), index: new Uint32Array(ni) };
  let v = 0, i = 0;
  for (const a of list) {
    out.position.set(a.position, v * 3); out.normal.set(a.normal, v * 3); out.color.set(a.color, v * 3); out.info.set(a.info, v * 3);
    for (let q = 0; q < a.index.length; q++) out.index[i + q] = a.index[q] + v;
    v += a.position.length / 3; i += a.index.length;
  }
  return out;
}

// The triangles of each layer: an index array for each, into the shared vertex buffers.
function split(a, n) {
  const I = a.info, idx = a.index, count = new Uint32Array(n);
  for (let t = 0; t < idx.length; t += 3) count[I[idx[t] * 3 + 1]]++;
  const out = Array.from(count, (c) => new Uint32Array(c * 3)), at = new Uint32Array(n);
  for (let t = 0; t < idx.length; t += 3) {
    const k = I[idx[t] * 3 + 1], o = out[k];
    o[at[k]++] = idx[t]; o[at[k]++] = idx[t + 1]; o[at[k]++] = idx[t + 2];
  }
  return out;
}
