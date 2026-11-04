// The viewer of the definitive 3D structure (structure.html): the City (src/city/) on its
// surroundings (src/surroundings/), a cut at any height, a vertical section, x-ray walls, the
// facts of each building, and the cheapest route from one room to another. This is the one
// place that puts the City and its surroundings together. The colours are placeholders: only
// the structure is definitive. The simulation of main.js does not run here.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildSite } from './site.js';
import { buildLayout } from './layout.js';
import { Terrain } from './terrain.js';
import { Lighting } from './env.js';
import { buildStructure, cityGround, floorName, levelAt } from './city/model.js';
import { applyFixes } from './city/fixes.js';
import { makeChoices } from './city/choices.js';
import { buildMesh, buildProps, KIND } from './city/mesh.js';
import { route } from './city/links.js';
import { buildGround } from './surroundings/ground.js';

// The haze of main.js: things fade with distance from the centre, from 350 m to 600 m.
THREE.ShaderChunk.fog_pars_vertex = '#ifdef USE_FOG\nvarying vec2 vFogXZ;\n#endif';
THREE.ShaderChunk.fog_vertex = '#ifdef USE_FOG\nvFogXZ = ((mvPosition.xyz - viewMatrix[3].xyz) * mat3(viewMatrix)).xz;\n#endif';
THREE.ShaderChunk.fog_pars_fragment = '#ifdef USE_FOG\nuniform vec3 fogColor; varying vec2 vFogXZ;\nuniform float fogNear; uniform float fogFar;\n#endif';
THREE.ShaderChunk.fog_fragment = '#ifdef USE_FOG\nfloat fogFactor = smoothstep(fogNear, fogFar, length(vFogXZ));\ngl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);\n#endif';

const $ = (id) => document.getElementById(id);
const canvas = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.localClippingEnabled = true;
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 6000);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.09;
controls.screenSpacePanning = true;
controls.maxPolarAngle = Math.PI * 0.495;
const VIEW_H = 260;

const OFF = 1e5;
const cutPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), OFF);
const secPlane = new THREE.Plane(new THREE.Vector3(1, 0, 0), OFF);
const U = { uXray: { value: 0 }, uSel: { value: -1 }, uCut: { value: new THREE.Color('#4a4540') } };

const triangulate = (outer, holes) => {
  const v = (p) => new THREE.Vector2(p[0], p[1]);
  const tris = THREE.ShapeUtils.triangulateShape(outer.map(v), holes.map((h) => h.map(v)));
  return { pts: [...outer, ...holes.flat()], idx: tris.flat() };
};

// The City material: a cut shows the inside faces, drawn dark; x-ray takes most of the outer
// walls away; the selected building is a little warmer.
function cityMaterial() {
  const m = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, clippingPlanes: [cutPlane, secPlane] });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec3 aInfo; varying vec3 vInfo;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvInfo = aInfo;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vInfo; uniform float uXray; uniform float uSel; uniform vec3 uCut;')
      .replace('void main() {', `void main() {
  if (uXray > 0.5 && (vInfo.z < 0.5 || abs(vInfo.z - 5.0) < 0.5 || abs(vInfo.z - 1.0) < 0.5 && !gl_FrontFacing)) {
    vec2 q = floor(gl_FragCoord.xy);
    if (abs(vInfo.z - 1.0) > 0.5 && mod(q.x + q.y * 3.0, 4.0) > 0.5) discard;
  }`)
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>
  if (!gl_FrontFacing) gl_FragColor.rgb = uCut;
  if (abs(vInfo.x - uSel) < 0.5) gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.98, 0.72, 0.36), 0.28);`);
  };
  m.customProgramCacheKey = () => 'kwc-structure';
  return m;
}
const cityMat = cityMaterial();

function meshOf(arr) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(arr.position, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(arr.normal, 3));
  g.setAttribute('color', new THREE.BufferAttribute(arr.color, 3));
  g.setAttribute('aInfo', new THREE.BufferAttribute(arr.info, 3));
  g.setIndex(new THREE.BufferAttribute(arr.index, 1));
  g.computeBoundingSphere();
  const m = new THREE.Mesh(g, cityMat);
  m.castShadow = m.receiveShadow = true;
  return m;
}

// The ladders and the stools: each a mesh of its own, with a marker on each one for the
// highlight. The section does not cut them; the cut at height does.
const props = {};
function propsOf({ arrays, tops }, color) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(arrays.position, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(arrays.normal, 3));
  g.setAttribute('color', new THREE.BufferAttribute(arrays.color, 3));
  g.setIndex(new THREE.BufferAttribute(arrays.index, 1));
  const mesh = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, clippingPlanes: [cutPlane] }));
  mesh.castShadow = mesh.receiveShadow = true;
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.Float32BufferAttribute(tops.map(([x, y, z]) => [x, y + 0.4, z]).flat(), 3));
  const marks = new THREE.Points(pg, new THREE.PointsMaterial({ color, size: 11, sizeAttenuation: false, depthTest: false, transparent: true, clippingPlanes: [cutPlane] }));
  marks.renderOrder = 11;
  marks.visible = false;
  scene.add(mesh, marks);
  return { mesh, marks, color, n: tops.length };
}
// Highlight on or off: the bright colour on the props, and a marker on each one that shows
// through the buildings.
function highlight(kind, on) {
  const p = props[kind];
  p.mesh.material.emissive.set(on ? p.color : '#000000');
  p.marks.visible = on;
}

let S, shell, inner = null, ground, routeObj = null;
const state = { cut: OFF, secAxis: 'off', sec: 0, secFlip: false, open: false, sel: -1, pick: null, routeMode: false, start: null };

async function init() {
  const [plan0, biz, book, overlay0, context, terrain, fixes, fine, kept, sur] = await Promise.all(['plan', 'businesses', 'book', 'book_overlay', 'context', 'terrain', 'structure_fixes', 'plan_fine', 'structure_choices', 'surroundings']
    .map((n) => fetch(`./data/${n}.json`).then((r) => r.json())));
  // the corrections of data/structure_fixes.json (src/city/fixes.js); the footprints come
  // from the fine plan (data/plan_fine.json)
  const { plan, overlay } = applyFixes(plan0, overlay0, fixes, fine);
  book.overlay = overlay;
  const site = buildSite(plan);
  const L = buildLayout(site, plan, biz, book, null); // the City does not depend on its surroundings
  const T = new Terrain(terrain);
  const t0 = performance.now();
  // the kept random choices of the links (data/structure_choices.json, choices.js)
  S = buildStructure(L, T, { fixes, choices: makeChoices(kept) });
  const t1 = performance.now();
  shell = meshOf(buildMesh(S, { triangulate, props: false }));
  scene.add(shell);
  props.ladder = propsOf(buildProps(S, 'ladder'), '#ff3d00');
  props.stool = propsOf(buildProps(S, 'stool'), '#d400ff');
  ground = buildGround(T, context, cityGround(S), sur);
  // A section cuts the ground too, as in a section drawing.
  ground.terrain.material.clippingPlanes = [secPlane];
  ground.context.material.clippingPlanes = [secPlane];
  scene.add(ground.group);
  const center = new THREE.Vector3(0, 20, 0);
  const lighting = new Lighting(scene, center, site);
  lighting.setFocus(0, 0, 200);
  lighting.update(10.6, 0);
  camera.position.set(-150, 190, 230);
  controls.target.set(0, 22, 0);
  controls.update();
  const tris = shell.geometry.index.count / 3;
  $('stats').textContent = `${S.list.length} buildings · ${S.unitNode.size} rooms and flats · ${S.doors.length} doors and links · model ${Math.round(t1 - t0)} ms · ${(tris / 1e6).toFixed(2)} M triangles`;
  $('loading').remove();
  bindUI();
  resize();
  window.kwc = { S, camera, controls, state, scene, U, renderer, ground, routePick, showInfo, showNorthSouth, highlight }; // for the console
  requestAnimationFrame(frame);
}

// ---- the inside of the floors that the cut or the section shows ----
function rebuildInside() {
  if (inner) { scene.remove(inner); inner.geometry.dispose(); inner = null; }
  const secB = new Set();
  if (state.secAxis !== 'off')
    for (const b of S.list) {
      let lo = Infinity, hi = -Infinity;
      for (const r of b.phases[0].rings) for (const [x, z] of r.pts) { const v = state.secAxis === 'x' ? x : z; lo = Math.min(lo, v); hi = Math.max(hi, v); }
      if (lo - 1 <= state.sec && hi + 1 >= state.sec) secB.add(b.id);
    }
  const any = state.cut < OFF || secB.size || (state.open && state.sel >= 0);
  if (!any) return;
  const inside = (id, k) => {
    const b = S.list[id];
    if (secB.has(id) && b.y[k] < state.cut) return true;
    if (state.open && id === state.sel) return b.y[k] < state.cut;
    return state.cut < OFF && b.y[k] <= state.cut && b.y[k + 1] > state.cut - 0.01;
  };
  inner = meshOf(buildMesh(S, { triangulate, shell: false, inside }));
  scene.add(inner);
}
let insideDirty = false;
const markInside = () => { insideDirty = true; };

// ---- the panel ----
function bindUI() {
  const cut = $('cut'), cutOn = $('cutOn');
  const setCut = () => {
    state.cut = cutOn.checked ? +cut.value : OFF;
    cutPlane.constant = state.cut;
    $('cutVal').textContent = cutOn.checked ? `${(+cut.value).toFixed(1)} mPD` : 'off';
    markInside();
  };
  cut.oninput = setCut; cutOn.onchange = setCut;
  const sec = $('sec'), secAxis = $('secAxis'), secFlip = $('secFlip');
  const setSec = () => {
    state.secAxis = secAxis.value; state.sec = +sec.value; state.secFlip = secFlip.checked;
    const s = state.secFlip ? -1 : 1;
    if (state.secAxis === 'off') secPlane.constant = OFF;
    else {
      secPlane.normal.set(state.secAxis === 'x' ? s : 0, 0, state.secAxis === 'z' ? s : 0);
      secPlane.constant = -s * state.sec;
    }
    sec.min = state.secAxis === 'z' ? -80 : -125; sec.max = state.secAxis === 'z' ? 80 : 125;
    $('secVal').textContent = state.secAxis === 'off' ? 'off' : `${state.secAxis} = ${state.sec.toFixed(1)} m`;
    markInside();
  };
  sec.oninput = setSec; secAxis.onchange = setSec; secFlip.onchange = setSec;
  $('xray').onchange = (e) => { U.uXray.value = e.target.checked ? 1 : 0; };
  $('open').onchange = (e) => { state.open = e.target.checked; markInside(); };
  $('nsBtn').onclick = () => showNorthSouth();
  for (const kind of ['ladder', 'stool']) {
    const btn = $(`${kind}Btn`);
    btn.textContent = `Highlight the ${kind}s (${props[kind].n})`;
    btn.onclick = () => { const on = !btn.classList.contains('on'); btn.classList.toggle('on', on); highlight(kind, on); };
  }
  $('routeBtn').onclick = () => {
    state.routeMode = !state.routeMode;
    state.start = null;
    $('routeBtn').classList.toggle('on', state.routeMode);
    $('route').innerHTML = state.routeMode ? 'Click the start room.' : '';
    if (!state.routeMode && routeObj) { scene.remove(routeObj); routeObj = null; }
  };
  setCut(); setSec();
  let down = null;
  canvas.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 4) return;
    click(e);
  });
}

const ray = new THREE.Raycaster();
function pick(e) {
  const r = canvas.getBoundingClientRect();
  ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
  const hits = ray.intersectObjects([shell, inner].filter(Boolean), false);
  for (const h of hits) {
    if (h.point.y > state.cut + 0.01) continue;
    if (state.secAxis !== 'off' && secPlane.distanceToPoint(h.point) < 0) continue;
    const f = h.object.geometry.attributes.aInfo, v = h.face.a;
    const kind = f.getZ(v);
    if (U.uXray.value && (kind === KIND.WALL || kind === KIND.ROOF)) continue;
    return { b: Math.round(f.getX(v)), k: Math.round(f.getY(v)), kind, p: h.point };
  }
  return null;
}

function click(e) {
  const p = pick(e);
  if (!p) { state.sel = -1; U.uSel.value = -1; $('info').innerHTML = ''; markInside(); return; }
  const b = S.list[p.b];
  // the level at the point: the floor under it
  let k = Math.max(0, Math.min(b.n, levelAt(b, p.p.y + 0.05)));
  if (p.kind === KIND.ROOF || p.kind === KIND.HUT) k = b.n;
  if (state.routeMode) return routePick(b, k, p.p);
  state.sel = b.id; U.uSel.value = b.id;
  showInfo(b, k);
  if (state.open) markInside();
}

const fmt = (v) => v.toFixed(2);
function showInfo(b, k) {
  const from = { south: 'south face, Lambot 1990 elevation (SOURCED)',
    p132: 'north face: the range of p132 is SOURCED, the count of this building INFERRED',
    p336: 'north face: the range of p336 is SOURCED, the count of this building INFERRED',
    photo: `photo (SOURCED): ${b.fix?.why || ''}`,
    bronze: `bronze model in the park (${b.inferred ? 'INFERRED' : 'SOURCED'}): ${b.fix?.why || ''}`, aerial: `aerial photo (SOURCED): ${b.fix?.why || ''}`,
    sheet1987: `survey sheet 1987 (SOURCED): ${b.fix?.why || ''}`,
    photos: 'roofline of the sourced faces (INFERRED)', hut: 'hut (INFERRED)', named: 'named building', yamen: 'Yamen hall' }[b.from] || b.from;
  const st = b.stairs.map((s) => `${s.type === 'dogleg' ? 'dog-leg' : s.rmax > 0.2 ? 'steep straight' : 'straight'}${s.spine ? ' + corridor' : ''}`).join(', ') || (b.wingOf !== undefined ? `shares the stair of building ${b.wingOf}` : 'none');
  const links = S.doors.filter((d) => d.b === b.id || d.c === b.id);
  const lc = {};
  for (const d of links) lc[d.kind] = (lc[d.kind] || 0) + 1;
  const rows = [];
  for (let q = b.n - 1; q >= 0; q--) {
    const ph = b.phaseOf(q);
    const tags = [];
    if (ph.k0 === q && q > 0) tags.push(ph.key.includes('o') ? 'overhang' : '', ...b.annex.filter((a) => a.from === q).map((a) => `grows over ${a.id}`), ph.setback ? 'setback' : '');
    const lk = links.filter((d) => (d.b === b.id && d.k === q) || (d.c === b.id && d.kc === q)).map((d) => d.kind);
    const kinds = {};
    for (const u of ph.plan.units) kinds[u.kind] = (kinds[u.kind] || 0) + 1;
    const units = Object.entries(kinds).map(([q, n]) => `${n} ${n > 1 ? (q === 'factory' ? 'factories' : q + 's') : q}`).join(', ') || '0';
    rows.push(`<tr${q === k ? ' class="cur"' : ''}><td>${floorName(q)}</td><td>${fmt(b.y[q])}</td><td>${fmt(b.h[q])}</td><td>${units}</td><td>${[...tags.filter(Boolean), ...lk].join(', ')}</td></tr>`);
  }
  if (b.roofRoom) rows.unshift(`<tr><td>roof</td><td>${fmt(b.top)}</td><td>2.40</td><td>1 roof room</td><td></td></tr>`);
  $('info').innerHTML = `<b>${b.label}</b> <span class="dim">(no. ${b.id})</span><br>
    ${b.n} storeys · from ${from}<br>
    G/F floor ${fmt(b.g0)} mPD · roof ${fmt(b.top)} mPD · footprint ${b.area.toFixed(0)} m²<br>
    stairs: ${st}${b.over ? ` · building ${b.over.id} grows over its roof` : ''}${S.chain.includes(b.id) ? ' · on the SW-NE route' : ''}<br>
    links: ${Object.entries(lc).map(([q, n]) => `${n} ${q}`).join(', ') || 'none'}
    <table><tr><th>floor</th><th>mPD</th><th>height</th><th>units</th><th>changes, links</th></tr>${rows.join('')}</table>`;
}

// ---- routes ----
function nodeAt(b, k, p) {
  if (k >= b.n) return b.roofNode ?? null;
  let best = null, bd = Infinity;
  for (const u of b.phaseOf(k).plan.units) {
    const id = S.unitNode.get(`${b.id}:${k}:${u.id}`);
    const d = Math.hypot(u.x - p.x, u.z - p.z);
    if (id !== undefined && d < bd) { bd = d; best = id; }
  }
  return best;
}
function routePick(b, k, p) {
  const n = nodeAt(b, k, p);
  if (n === null) { $('route').innerHTML = 'No room there. Click a floor of a building.'; return; }
  if (state.start === null) {
    state.start = n;
    $('route').innerHTML = `Start: ${b.label}, ${k >= b.n ? 'roof' : floorName(k)}. Click the end room.`;
    return;
  }
  const r = route(S, state.start, n);
  state.start = null;
  drawRoute(r);
}

// The SW-NE route inside the buildings (links.js): from a flat of the first building of
// S.chain to one of the last, on the floors of the route there (S.chainEnds), with no lane and
// no roof.
const INSIDE = new Set(['lane', 'street', 'step', 'ladder', 'roofdoor', 'window']);
function showNorthSouth() {
  const unitOn = (b, k) => [...S.unitNode].find(([q]) => q.startsWith(`${b}:${k}:`))?.[1];
  const a = S.chainEnds ? unitOn(S.chain[0], S.chainEnds[0]) : undefined, z = S.chainEnds ? unitOn(S.chain.at(-1), S.chainEnds[1]) : undefined;
  drawRoute(a !== undefined && z !== undefined ? route(S, a, z, INSIDE) : null);
}

// Draws route r (from route()) as a thick line, and its counts in the route panel.
function drawRoute(r) {
  if (routeObj) { scene.remove(routeObj); routeObj = null; }
  if (!r) { $('route').innerHTML = 'No route.'; return; }
  const N = S.graph.nodes, pts = r.path.map((v) => new THREE.Vector3(N[v].x, N[v].y + 0.9, N[v].z));
  let len = 0, up = 0, down = 0, lo = Infinity;
  const bs = [];
  for (let q = 0; q < r.path.length; q++) {
    const a = N[r.path[q]];
    lo = Math.min(lo, a.y);
    if (a.b !== undefined && bs[bs.length - 1] !== a.b) bs.push(a.b);
    if (q) {
      const z = N[r.path[q - 1]];
      len += Math.hypot(a.x - z.x, a.z - z.z);
      if (a.y > z.y) up += a.y - z.y; else down += z.y - a.y;
    }
  }
  const kinds = {};
  r.kinds.forEach((x) => { if (x && x !== 'walk') kinds[x] = (kinds[x] || 0) + 1; });
  // a thick line: a thin box on each leg, drawn over all
  const geo = [];
  for (let q = 1; q < pts.length; q++) {
    const a = pts[q - 1], c = pts[q], l = a.distanceTo(c);
    if (l < 1e-3) continue;
    const g = new THREE.BoxGeometry(0.35, 0.35, l);
    g.lookAt(new THREE.Vector3().subVectors(c, a));
    g.translate((a.x + c.x) / 2, (a.y + c.y) / 2, (a.z + c.z) / 2);
    geo.push(g);
  }
  routeObj = new THREE.Group();
  for (const g of geo) {
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#ff6a1a', depthTest: false, transparent: true, opacity: 0.9 }));
    m.renderOrder = 10;
    routeObj.add(m);
  }
  scene.add(routeObj);
  const lanes = (kinds.lane || 0) + (kinds.street || 0) > 0;
  $('route').innerHTML = `Route: ${len.toFixed(0)} m on plan, ${up.toFixed(1)} m up, ${down.toFixed(1)} m down, through ${bs.length} buildings.<br>
    Lowest point ${lo.toFixed(1)} mPD · ${lanes ? 'goes down to the lanes' : 'stays off the lanes'}<br>
    <span class="dim">${Object.entries(kinds).map(([q, n]) => `${q} ${n}`).join(' · ')}</span>`;
}

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  const a = w / h;
  camera.left = (-VIEW_H * a) / 2; camera.right = (VIEW_H * a) / 2; camera.top = VIEW_H / 2; camera.bottom = -VIEW_H / 2;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);

let lastInside = 0;
function frame(t) {
  controls.update();
  if (insideDirty && t - lastInside > 120) { insideDirty = false; lastInside = t; rebuildInside(); }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

init().catch((e) => { $('loading').textContent = `Error: ${e.message}`; console.error(e); });
