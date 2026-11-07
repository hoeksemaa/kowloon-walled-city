// The viewer of the definitive 3D structure (structure.html): the City (src/city/) on its
// surroundings (src/surroundings/), a cut at any height, a vertical section, x-ray walls, the
// facts of each building, the cheapest route from one room to another, and the use of each
// room in December 1986 (src/roomUses.js, data/room_uses.json) floor by floor. This is the one
// place that puts the City and its surroundings together. The structure has no colours: the
// viewer gives its placeholder colours (src/structureColors.js). The simulation of main.js does not run here.
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
import { UNIT } from './city/plan.js';
import { RoomUses, GROUPS, BASIS, CAT_HEX, esc, swatch, tag } from './roomUses.js';
import { buildGround } from './surroundings/ground.js';
import { cityColors, groundColors } from './structureColors.js';

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
const U = { uXray: { value: 0 }, uSel: { value: -1 }, uCut: { value: new THREE.Color('#4a4540') },
  uFloorOn: { value: 0 }, uFloor: { value: -1 } };
// The floor view, as the peel of the main app (src/cityLayers.js): all over storey F of each
// building goes (the floors over it, its roof and all on the roof). Storey F keeps its whole
// walls, up to the slab of the next floor: the view cuts nothing. A building of F storeys or
// fewer stays whole. The level of each face is aInfo.y (src/city/mesh.js).

const triangulate = (outer, holes) => {
  const v = (p) => new THREE.Vector2(p[0], p[1]);
  const tris = THREE.ShapeUtils.triangulateShape(outer.map(v), holes.map((h) => h.map(v)));
  return { pts: [...outer, ...holes.flat()], idx: tris.flat() };
};

// The City material: a cut shows the inside faces, drawn dark; x-ray takes most of the outer
// walls away; the selected building is a little warmer (not its floors, which show the room uses).
function cityMaterial() {
  const m = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, clippingPlanes: [cutPlane, secPlane] });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec3 aInfo; varying vec3 vInfo;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvInfo = aInfo;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vInfo; uniform float uXray; uniform float uSel; uniform vec3 uCut; uniform float uFloorOn; uniform float uFloor;')
      .replace('void main() {', `void main() {
  if (uFloorOn > 0.5 && vInfo.y > uFloor + 0.5) discard;
  if (uXray > 0.5 && (vInfo.z < 0.5 || abs(vInfo.z - 5.0) < 0.5 || abs(vInfo.z - 1.0) < 0.5 && !gl_FrontFacing)) {
    vec2 q = floor(gl_FragCoord.xy);
    if (abs(vInfo.z - 1.0) > 0.5 && mod(q.x + q.y * 3.0, 4.0) > 0.5) discard;
  }`)
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>
  if (!gl_FrontFacing) gl_FragColor.rgb = uCut;
  if (abs(vInfo.x - uSel) < 0.5 && abs(vInfo.z - 4.0) > 0.5) gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.98, 0.72, 0.36), 0.28); // not the floors: they show the room uses`);
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

let S, shell, inner = null, ground, routeObj = null, uses = null, marker = null;
const state = { cut: OFF, secAxis: 'off', sec: 0, secFlip: false, open: false, sel: -1, pick: null, routeMode: false, start: null, floor: -1 };

async function init() {
  const [plan0, biz, book, overlay0, context, terrain, fixes, fine, kept, sur, roomUses] = await Promise.all(['plan', 'businesses', 'book', 'book_overlay', 'context', 'terrain', 'structure_fixes', 'plan_fine', 'structure_choices', 'surroundings', 'room_uses']
    .map((n) => fetch(`./data/${n}.json`).then((r) => r.json())));
  uses = new RoomUses(roomUses);
  // the corrections of data/structure_fixes.json (src/city/fixes.js); the footprints come
  // from the fine plan (data/plan_fine.json)
  const { plan, overlay } = applyFixes(plan0, overlay0, fixes, fine);
  book.overlay = overlay;
  const site = buildSite(plan);
  const L = buildLayout(plan, biz, book); // the City does not depend on its surroundings
  const T = new Terrain(terrain);
  const t0 = performance.now();
  // the kept random choices of the links (data/structure_choices.json, choices.js)
  S = buildStructure(L, T, { fixes, choices: makeChoices(kept) });
  const t1 = performance.now();
  marker = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0], 3)),
    new THREE.PointsMaterial({ color: '#ff3d00', size: 14, sizeAttenuation: false, depthTest: false, transparent: true }));
  marker.renderOrder = 12;
  marker.visible = false;
  scene.add(marker);
  const arr = buildMesh(S, { triangulate, props: false, colorOf: cityColors() });
  // The parapet round the terrace of a setback stands on the floor under the top storey, not
  // on the roof: it goes with that floor (as in src/cityLayers.js).
  for (let v = 0; v < arr.info.length; v += 3) {
    const b = S.list[arr.info[v]];
    if (arr.info[v + 2] === KIND.ROOF && arr.info[v + 1] === b.n && arr.position[v + 1] < b.y[b.n] - 0.3) arr.info[v + 1] = b.n - 1;
  }
  shell = meshOf(arr);
  scene.add(shell);
  props.ladder = propsOf(buildProps(S, 'ladder', { colorOf: cityColors() }), '#ff3d00');
  props.stool = propsOf(buildProps(S, 'stool', { colorOf: cityColors() }), '#d400ff');
  ground = buildGround(T, context, cityGround(S), sur, groundColors);
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
  window.kwc = { S, camera, controls, state, scene, U, renderer, ground, routePick, showInfo, showNorthSouth, highlight, uses, setFloor, findPlace, pick }; // for the console
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
  const F = state.floor;
  const any = state.cut < OFF || secB.size || (state.open && state.sel >= 0) || F >= 0;
  if (!any) return;
  const inside = (id, k) => {
    const b = S.list[id];
    if (F >= 0 && b.n > F && k === F) return true;
    if (secB.has(id) && b.y[k] < state.cut) return true;
    if (state.open && id === state.sel) return b.y[k] < state.cut;
    return state.cut < OFF && b.y[k] <= state.cut && b.y[k + 1] > state.cut - 0.01;
  };
  inner = meshOf(buildMesh(S, { triangulate, shell: false, inside, colorOf: cityColors((b, k, u) => uses.color(b, k, u)) }));
  inner.castShadow = state.floor < 0;
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
  bindUses();
  let down = null;
  canvas.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerup', (e) => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 4) return;
    click(e);
  });
}

// ---- the room uses: floor by floor, a colour by use or by basis, a filter, a search ----
function setFloor(F) {
  state.floor = F;
  const on = F >= 0;
  U.uFloor.value = F;
  U.uFloorOn.value = on ? 1 : 0;
  for (const p of Object.values(props)) p.mesh.visible = !on; // the ladders and stools stand on the roofs
  // the shadow pass does not see the floor view: the hidden floors would still cast shadows
  shell.castShadow = !on;
  if (inner) inner.castShadow = !on;
  $('floorSel').value = String(F);
  markInside();
}
function bindUses() {
  const maxN = Math.max(...S.list.map((b) => b.n));
  const sel = $('floorSel');
  sel.innerHTML = '<option value="-1">off: whole buildings</option>' +
    Array.from({ length: maxN }, (_, k) => `<option value="${k}">${floorName(k)} of each building (${S.list.filter((b) => b.n > k).length} buildings)</option>`).join('');
  sel.onchange = () => setFloor(+sel.value);
  $('floorDown').onclick = () => setFloor(Math.max(-1, state.floor - 1));
  $('floorUp').onclick = () => setFloor(Math.min(maxN - 1, state.floor + 1));
  $('useMode').onchange = (e) => { uses.mode = e.target.value; drawLegend(); markInside(); };
  drawLegend();
  // the documented places, for the search
  const list = [...uses.places.values()];
  $('placeList').innerHTML = list.map((p) => `<option value="${esc(`${p.name}${p.address ? ' · ' + p.address : ''} · ${p.id}`)}"></option>`).join('');
  $('findPlace').onchange = (e) => {
    const id = e.target.value.split(' · ').at(-1);
    if (uses.places.has(id)) findPlace(id);
  };
}
function drawLegend() {
  const d = uses.data, byCat = new Map(d.categories.map((c) => [c.id, c.units]));
  const basisRow = BASIS.map((b) => `<label class="li" title="${esc(d.basis[b.id])}"><input type="checkbox" data-basis="${b.id}" ${uses.basisOn.has(b.id) ? 'checked' : ''}>
    ${uses.mode === 'basis' ? swatch(b.hex) : ''}${tag(b.id)} <span class="dim">${d.counts.basis[b.id]}</span></label>`).join('');
  const groups = GROUPS.map((g) => `<div class="grp">${g.label}</div>` + g.cats.map((c) => `<label class="li" title="${esc(uses.cats.get(c)?.note)}">
    <input type="checkbox" data-cat="${c}" ${uses.catOn.has(c) ? 'checked' : ''}>${uses.mode === 'use' ? swatch(CAT_HEX[c]) : ''}${esc(uses.label(c))}
    <span class="dim">${byCat.get(c) || 0}</span></label>`).join('')).join('');
  $('legend').innerHTML = `<div class="grp">Certainty (basis)</div>${basisRow}${groups}
    <button id="catAll">all uses</button> <button id="catNone">no uses</button>`;
  for (const el of $('legend').querySelectorAll('input[data-basis]')) el.onchange = () => { el.checked ? uses.basisOn.add(el.dataset.basis) : uses.basisOn.delete(el.dataset.basis); markInside(); };
  for (const el of $('legend').querySelectorAll('input[data-cat]')) el.onchange = () => { el.checked ? uses.catOn.add(el.dataset.cat) : uses.catOn.delete(el.dataset.cat); markInside(); };
  $('catAll').onclick = () => { uses.catOn = new Set(uses.cats.keys()); drawLegend(); markInside(); };
  $('catNone').onclick = () => { uses.catOn = new Set(); drawLegend(); markInside(); };
}
// the unit of floor k of building b at point p: the plan cell under it, else the nearest unit
function unitAt(b, k, p) {
  if (k >= b.n) return b.roofRoom ? 0 : null;
  const plan = b.phaseOf(k).plan, c = plan.R.cellXZ(p.x, p.z), v = c >= 0 ? plan.code[c] : -1;
  if (v >= UNIT) return v - UNIT;
  let best = null, bd = 3;
  for (const u of plan.units) { const d = Math.hypot(u.x - p.x, u.z - p.z); if (d < bd) { bd = d; best = u.id; } }
  return best;
}
function unitCentre(b, k, u) {
  if (k >= b.n) return new THREE.Vector3(b.cx, b.top + 1.4, b.cz);
  const q = b.phaseOf(k).plan.units[u];
  return new THREE.Vector3(q.x, b.y[k] + 0.9, q.z);
}
function showMarker(b, k, u) {
  if (u === null || u === undefined) { marker.visible = false; return; }
  marker.geometry.attributes.position.setXYZ(0, ...unitCentre(b, k, u).toArray());
  marker.geometry.attributes.position.needsUpdate = true;
  marker.visible = true;
}
// a documented place: its floor in the floor view, its building selected, the view on it
function findPlace(id) {
  const p = uses.places.get(id);
  if (!p?.at) return;
  const [bid, k, u] = p.at[0], b = S.list[bid];
  setFloor(k < b.n ? k : -1);
  state.sel = bid; U.uSel.value = bid;
  showInfo(b, k, u);
  showMarker(b, k, u);
  const d = unitCentre(b, k, u).sub(controls.target);
  controls.target.add(d); camera.position.add(d);
  camera.zoom = Math.max(camera.zoom, 4); camera.updateProjectionMatrix();
  if (state.open) markInside();
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
    if (U.uFloorOn.value && f.getY(v) > state.floor + 0.5) continue;
    if (U.uXray.value && (kind === KIND.WALL || kind === KIND.ROOF)) continue;
    return { b: Math.round(f.getX(v)), k: Math.round(f.getY(v)), kind, p: h.point };
  }
  return null;
}

function click(e) {
  const p = pick(e);
  if (!p) { state.sel = -1; U.uSel.value = -1; $('info').innerHTML = ''; marker.visible = false; markInside(); return; }
  const b = S.list[p.b];
  // the level at the point: the floor under it
  let k = Math.max(0, Math.min(b.n, levelAt(b, p.p.y + 0.05)));
  if (p.kind === KIND.ROOF || p.kind === KIND.HUT) k = b.n;
  if (state.routeMode) return routePick(b, k, p.p);
  state.sel = b.id; U.uSel.value = b.id;
  // a room: a click on a floor or a partition inside, or on a roof hut (the roof room)
  const opened = state.floor >= 0 || state.cut < OFF; // a low wall of an opened floor: the room behind it
  const u = p.kind === KIND.FLOOR || p.kind === KIND.PART || (p.kind === KIND.WALL && opened) || (p.kind === KIND.HUT && b.roofRoom) ? unitAt(b, k, p.p) : null;
  showInfo(b, k, u);
  showMarker(b, k, u);
  if (state.open) markInside();
}

const fmt = (v) => v.toFixed(2);
// the use of one room, its basis, and its documented place with the sources
function roomInfo(b, k, u) {
  const r = uses.get(b.id, k, u);
  if (!r) return '';
  const p = r.place ? uses.places.get(r.place) : null;
  const where = `${b.label}, ${k >= b.n ? 'roof room' : floorName(k)}, room ${u}`;
  let html = `<div class="room">${swatch(CAT_HEX[r.cat])}<b>${esc(uses.label(r.cat))}</b> ${tag(r.basis)} <span class="dim">${esc(where)} (${b.id}:${k}:${u})</span><br>`;
  if (!p) return html + `<span class="dim">No source names this room. Its use is a guess from the counts of the sources (docs/rooms.md).</span></div>`;
  const zh = p.nameZh && !String(p.name).includes(p.nameZh) ? ` ${esc(p.nameZh)}` : '';
  const addr = [p.address, p.floor != null ? floorName(Math.max(0, p.floor)) : '', p.map_pin != null ? `1992 map no. ${p.map_pin}` : ''].filter(Boolean).join(', ');
  html += `<b>${esc(p.name)}</b>${zh}<br>${esc(p.use)}<br>
    <span class="dim">In the source: ${esc(addr || 'no address')} · placed by ${esc(p.how)}${p.note ? ` (${esc(p.note)})` : ''}</span>
    <details><summary>${p.sources.length} source${p.sources.length > 1 ? 's' : ''}</summary><ul>${p.sources.map((x) => `<li>${esc(x.source)}${x.cite ? ', ' + esc(x.cite) : ''}${x.date ? ` <span class="dim">(${esc(x.date)})</span>` : ''}${x.quote ? `<br><i>${esc(String(x.quote).slice(0, 400))}</i>` : ''}</li>`).join('')}</ul></details>`;
  return html + '</div>';
}
// the uses of the units of one floor, in words
function floorUses(b, q) {
  const c = {};
  for (const u of b.phaseOf(q).plan.units) { const r = uses.get(b.id, q, u.id); if (r) c[r.cat] = (c[r.cat] || 0) + 1; }
  return Object.entries(c).sort((x, y) => y[1] - x[1]).map(([cat, n]) => `${swatch(CAT_HEX[cat])}${n} ${esc(cat === 'home' ? (n === 1 ? 'flat' : 'flats') : uses.label(cat))}`).join(' ');
}
function showInfo(b, k, u = null) {
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
    rows.push(`<tr${q === k ? ' class="cur"' : ''}><td>${floorName(q)}</td><td>${fmt(b.y[q])}</td><td>${fmt(b.h[q])}</td><td>${units}</td><td>${floorUses(b, q)}</td><td>${[...tags.filter(Boolean), ...lk].join(', ')}</td></tr>`);
  }
  if (b.roofRoom) {
    const r = uses.get(b.id, b.n, 0);
    rows.unshift(`<tr${k >= b.n ? ' class="cur"' : ''}><td>roof</td><td>${fmt(b.top)}</td><td>2.40</td><td>1 roof room</td><td>${r ? `${swatch(CAT_HEX[r.cat])}${esc(uses.label(r.cat))}` : ''}</td><td></td></tr>`);
  }
  $('info').innerHTML = `${u !== null && u !== undefined ? roomInfo(b, k, u) : ''}<b>${b.label}</b> <span class="dim">(no. ${b.id})</span><br>
    ${b.n} storeys · from ${from}<br>
    G/F floor ${fmt(b.g0)} mPD · roof ${fmt(b.top)} mPD · footprint ${b.area.toFixed(0)} m²<br>
    stairs: ${st}${b.over ? ` · building ${b.over.id} grows over its roof` : ''}${S.chain.includes(b.id) ? ' · on the SW-NE route' : ''}<br>
    links: ${Object.entries(lc).map(([q, n]) => `${n} ${q}`).join(', ') || 'none'}
    <table><tr><th>floor</th><th>mPD</th><th>height</th><th>units</th><th>uses (Dec 1986)</th><th>changes, links</th></tr>${rows.join('')}</table>`;
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
