import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildSite } from './site.js';
import { buildLayout, buildingName, STOREY, MAX_FLOORS, USE_LABEL, TRADE_LABEL } from './layout.js';
import { unitAt, unitName } from './floorplan.js';
import { buildLevels, buildPlan, makeBuildingMaterial, CUT_H, USE_COLORS } from './cityMesh.js';
import { makeSignMaterial } from './signs.js';
import { buildWires, WireLayer, WIRE_TYPES } from './wires.js';
import { createPopulation, Sim, makePeopleMesh } from './people.js';
import { buildRoutes } from './routes.js';
import { buildEnvironment, addStreetLabels, Lighting, PLINTH_DEPTH } from './env.js';
import { clamp, smoothstep, fmtClock } from './util.js';
import { SOURCES_HTML } from './sources.js';
import { BEATS, CHAPTERS, beatAt } from './story.js';
import { Planes } from './planes.js';
import { Sound } from './sound.js';
import { WEEK, DONGZHI } from './people.js';

const NO_HI = -100; // highlight id meaning "nothing hovered"
const GAP = 13; // extra metres between storeys when fully exploded
const POPULATION = 33000;
const START_MINUTE = 5 * 60 + 20;
const $ = (id) => document.getElementById(id);
const levelName = (k) => (k === 0 ? 'G/F' : `${k}/F`);
// Roads outside the city, by side of the plan. Only these two touched the city directly;
// Sai Tau Tsuen lay to the south and west until 1985 (research/kwc-research.md, 1.3).
const STREETS = { top: 'TUNG TAU TSUEN ROAD 東頭村道', right: 'TUNG TSING ROAD 東正道' };

// Haze: things fade with depth below the plinth top and with distance from the city, the
// way the city below the model dissolves in the reference video.
THREE.ShaderChunk.fog_pars_vertex = `#ifdef USE_FOG
varying float vFogDepth; varying vec3 vFogW;
#endif`;
THREE.ShaderChunk.fog_vertex = `#ifdef USE_FOG
vFogDepth = - mvPosition.z;
vFogW = (inverse(viewMatrix) * mvPosition).xyz;
#endif`;
THREE.ShaderChunk.fog_pars_fragment = `#ifdef USE_FOG
uniform vec3 fogColor; varying float vFogDepth; varying vec3 vFogW;
uniform float fogNear; uniform float fogFar;
#endif`;
THREE.ShaderChunk.fog_fragment = `#ifdef USE_FOG
float fogH = smoothstep(2.0, -${PLINTH_DEPTH.toFixed(1)}, vFogW.y) * 0.86;
float fogR = smoothstep(260.0, 1400.0, length(vFogW.xz));
float fogFactor = max(fogH, fogR);
gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
#endif`;

const canvas = $('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();

const VIEW_H = 250;
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 6000);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.09;
controls.screenSpacePanning = true;
controls.zoomToCursor = true;
controls.minZoom = 0.45;
controls.maxZoom = 14;
controls.minPolarAngle = 0.12;
controls.maxPolarAngle = 1.42;
{
  const az = Math.PI * 0.25, el = 0.58, d = 1400;
  controls.target.set(0, 14, 0);
  camera.position.set(Math.sin(az) * Math.cos(el) * d, 14 + Math.sin(el) * d, Math.cos(az) * Math.cos(el) * d);
  camera.zoom = 1.15;
}

const state = {
  explode: 0, explodeTarget: 0, lift: 0, cut: -1, mapPins: false,
  speed: 60, hoverAgent: -1, hoverBld: -1, follow: false,
  storyCam: true, camGoal: null, storySel: false, storyCut: false,
};
const offsets = new Float32Array(16);
const shared = {
  uHour: { value: START_MINUTE / 60 }, uNight: { value: 0 }, uHi: { value: NO_HI }, uCutH: { value: CUT_H },
};
const peopleU = { uOff: { value: offsets }, uCutY: { value: 1e5 }, uPeopleScale: { value: 1.15 } };

let L, site, levels, wires, sim, people, lighting, labels, residents, cutRing, planes;
const unitRes = new Map();
const unitReal = new Map(); // a unit -> the real person whose home it is, with a recorded flat size
const sound = new Sound(); // off until the user turns it on

async function init() {
  await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 20)));
  const [plan, biz, book, overlay] = await Promise.all(['./data/plan.json', './data/businesses.json', './data/book.json', './data/book_overlay.json']
    .map((u) => fetch(u).then((r) => r.json())));
  book.overlay = overlay;
  site = buildSite(plan);
  L = buildLayout(site, plan, biz, book);
  L.routes = buildRoutes(L);
  const center = new THREE.Vector3(L.x0 + L.W / 2, 0, L.z0 + L.D / 2);
  lighting = new Lighting(scene, center, site);
  const env = buildEnvironment(scene, L);
  addStreetLabels(scene, site, env.roadOutline, STREETS);
  addNorthArrow();

  // ---- storeys ----
  const antMat = new THREE.LineBasicMaterial({ color: '#3a3935' });
  const slabGeo = new THREE.PlaneGeometry(L.W, L.D).rotateX(-Math.PI / 2).translate(center.x, 0, center.z);
  const slabEdge = new THREE.EdgesGeometry(slabGeo);
  const built = buildLevels(L);
  const signMat = makeSignMaterial(shared, built.signTexture);
  levels = built.levels.map((d) => {
    const group = new THREE.Group();
    const mat = makeBuildingMaterial(shared);
    const mesh = new THREE.Mesh(d.geometry, mat);
    mesh.castShadow = mesh.receiveShadow = true;
    group.add(mesh);
    let signs = null;
    if (d.signs) {
      signs = new THREE.Mesh(d.signs, signMat);
      signs.castShadow = true;
      group.add(signs);
    }
    const ag = new THREE.BufferGeometry();
    ag.setAttribute('position', new THREE.BufferAttribute(d.antennas, 3));
    const antennas = new THREE.LineSegments(ag, antMat);
    group.add(antennas);
    const slab = new THREE.Mesh(slabGeo, new THREE.MeshBasicMaterial({ color: '#1c1b18', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
    slab.position.y = d.k * STOREY - 0.06;
    slab.renderOrder = 1;
    const edge = new THREE.LineSegments(slabEdge, new THREE.LineBasicMaterial({ color: '#efe8d6', transparent: true, opacity: 0 }));
    edge.position.y = slab.position.y;
    slab.visible = edge.visible = false;
    group.add(slab, edge);
    scene.add(group);
    return { k: d.k, group, mesh, mat, antennas, signs, slab, edge, plan: null };
  });

  // Dotted corner posts that appear when the storeys are pulled apart.
  const postGeo = new THREE.BufferGeometry();
  const pp = [];
  for (const [x, z] of [[L.x0, L.z0], [L.x0 + L.W, L.z0], [L.x0, L.z0 + L.D], [L.x0 + L.W, L.z0 + L.D]]) pp.push(x, 0, z, x, 1, z);
  postGeo.setAttribute('position', new THREE.Float32BufferAttribute(pp, 3));
  const posts = new THREE.LineSegments(postGeo, new THREE.LineDashedMaterial({ color: '#efe8d6', dashSize: 0.012, gapSize: 0.012, transparent: true, opacity: 0 }));
  posts.computeLineDistances();
  posts.visible = false;
  scene.add(posts);
  state.posts = posts;

  // Dashed ring marking the cut height.
  const ringPts = site.polygon.map(([x, z]) => new THREE.Vector3(x, 0, z));
  cutRing = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(ringPts), new THREE.LineDashedMaterial({ color: '#e7a43c', dashSize: 1.6, gapSize: 1.1 }));
  cutRing.computeLineDistances();
  cutRing.visible = false;

  // ---- wires ----
  wires = new WireLayer(L, buildWires(L));
  scene.add(wires.object);

  // ---- Kai Tak: the runway 13 final, NE of the city (planes.js) ----
  planes = new Planes(scene, [0.2756, 0.9613], [182, -52], 62, BEATS.filter((b) => b.plane).map((b) => b.minute + 0.05));

  // ---- people ----
  const agents = createPopulation(L, POPULATION);
  sim = new Sim(L, agents);
  sim.setTime(START_MINUTE);
  people = makePeopleMesh(sim, peopleU);
  scene.add(people.mesh);
  residents = new Map();
  for (const a of agents) residents.set(a.home.b, (residents.get(a.home.b) || 0) + 1);
  for (const a of agents) if (a.home.m !== undefined) { const key = `${a.home.b}:${a.home.f}:${a.home.m}`; unitRes.set(key, (unitRes.get(key) || 0) + 1); }
  for (const a of agents) if (a.real && a.real.home && a.real.home.size && a.home.m !== undefined) unitReal.set(`${a.home.b}:${a.home.f}:${a.home.m}`, a.real);

  buildUI();
  buildStreetTags();
  buildPins();
  resize();
  setOffsets(0);
  $('loading').classList.add('done');
  window.kwc = { L, sim, state, setCut, setSpeed, camera, controls, levels, planes, jumpBeat };
  requestAnimationFrame(frame);
}

function addNorthArrow() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#e9e1cf';
  g.beginPath(); g.moveTo(64, 8); g.lineTo(88, 64); g.lineTo(64, 52); g.lineTo(40, 64); g.closePath(); g.fill();
  g.font = '34px Silkscreen, monospace'; g.textAlign = 'center'; g.fillText('N', 64, 108);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  // Point the arrow at true north.
  m.rotation.z = Math.atan2(-site.north[0], -site.north[1]);
  m.position.set(L.x0 + L.W - 9, 0.05, L.z0 + L.D - 9);
  scene.add(m);
  document.fonts.ready.then(() => {
    g.clearRect(0, 0, 128, 128);
    g.beginPath(); g.moveTo(64, 8); g.lineTo(88, 64); g.lineTo(64, 52); g.lineTo(40, 64); g.closePath(); g.fill();
    g.fillText('N', 64, 108);
    tex.needsUpdate = true;
  });
}

// ---- explode + cut --------------------------------------------------------------------------
const ease = (t) => t * t * (3 - 2 * t);

function setOffsets(e) {
  for (let k = 0; k < 16; k++) offsets[k] = Math.min(k, MAX_FLOORS - 1) * GAP * e;
  const show = state.explode > 0.01;
  const a = smoothstep(0.05, 0.7, state.explode);
  for (const lv of levels) {
    lv.group.position.y = offsets[lv.k];
    lv.slab.visible = lv.edge.visible = show;
    lv.slab.material.opacity = 0.26 * a;
    lv.edge.material.opacity = 0.55 * a;
  }
  const top = (MAX_FLOORS - 1) * GAP * e + MAX_FLOORS * STOREY;
  state.posts.visible = show;
  state.posts.scale.y = Math.max(top, 0.01);
  state.posts.material.opacity = 0.5 * a;
  state.posts.material.dashSize = state.posts.material.gapSize = 0.8 / Math.max(top, 1);
  wires.update(offsets, state.cut);
  // Keep the model framed as it grows: lift the view and zoom out, relative to the
  // user's own zoom.
  const lift = e * GAP * (MAX_FLOORS - 1) * 0.5;
  const d = lift - state.lift;
  state.lift = lift;
  camera.position.y += d;
  controls.target.y += d;
  const zf = 1 / (1 + 1.25 * e);
  camera.zoom *= zf / (state.zf || 1);
  state.zf = zf;
  camera.updateProjectionMatrix();
  if (state.cut >= 0) cutRing.position.y = state.cut * STOREY + CUT_H + 0.05;
}

function setCut(c) {
  state.cut = c;
  for (const lv of levels) {
    lv.group.visible = c < 0 || lv.k <= c;
    lv.mat.userData.uIsCut.value = lv.k === c ? 1 : 0;
    lv.antennas.visible = lv.k !== c;
    if (lv.signs) lv.signs.visible = lv.k !== c;
    if (lv.plan) {
      lv.group.remove(lv.plan.mesh, lv.plan.lines);
      lv.plan.mesh.geometry.dispose();
      lv.plan.lines.geometry.dispose();
      lv.plan = null;
    }
  }
  if (cutRing.parent) cutRing.parent.remove(cutRing);
  if (c >= 0) {
    const p = buildPlan(L, c);
    const mesh = new THREE.Mesh(p.geometry, levels[c].mat);
    const lines = new THREE.LineSegments(p.lines, new THREE.LineDashedMaterial({ color: '#f1ead8', dashSize: 0.42, gapSize: 0.3 }));
    lines.computeLineDistances();
    levels[c].group.add(mesh, lines);
    levels[c].plan = { mesh, lines };
    levels[c].group.add(cutRing);
    cutRing.position.y = c * STOREY + CUT_H + 0.05;
    cutRing.visible = true;
  }
  peopleU.uCutY.value = c < 0 ? 1e5 : c * STOREY + 0.4;
  wires.update(offsets, c);
  renderRail();
  renderLegend();
}

// ---- picking ----------------------------------------------------------------------------------
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const mouse = { x: -1, y: -1, moved: false, inside: false };

function pickBuilding() {
  raycaster.setFromCamera(ndc, camera);
  const { origin: o, direction: d } = raycaster.ray;
  if (Math.abs(d.y) < 1e-6) return null;
  let best = null;
  const hd = Math.hypot(d.x, d.z);
  for (const lv of levels) {
    if (!lv.group.visible) continue;
    const k = lv.k;
    const yb = k * STOREY + offsets[k], yt = yb + (k === state.cut ? CUT_H : STOREY);
    let t0 = (yt - o.y) / d.y, t1 = (yb - o.y) / d.y;
    if (t0 > t1) [t0, t1] = [t1, t0];
    if (best && t0 > best.t) continue;
    const steps = Math.ceil(((t1 - t0) * hd) / 0.3) + 1;
    for (let s = 0; s <= steps; s++) {
      const t = t0 + ((t1 - t0) * s) / steps;
      const i = Math.floor(o.x + d.x * t - L.x0), j = Math.floor(o.z + d.z * t - L.z0);
      if (i < 0 || j < 0 || i >= L.W || j >= L.D) continue;
      const b = L.owner[j * L.W + i];
      if (b >= 0 && L.buildings[b].floors > k) {
        if (!best || t < best.t) best = { t, b, k, cell: j * L.W + i };
        break;
      }
    }
  }
  return best;
}

const _v = new THREE.Vector3();
function agentScreen(a) {
  const o = a.id * 4, P = sim.aP;
  const lv = clamp(P[o + 3], 0, 14.99), i0 = Math.floor(lv);
  const off = offsets[i0] + (offsets[i0 + 1] - offsets[i0]) * (lv - i0);
  _v.set(P[o], P[o + 2] + off + 1.0, P[o + 1]).project(camera);
  return [(_v.x * 0.5 + 0.5) * innerWidth, (-_v.y * 0.5 + 0.5) * innerHeight];
}

function pickAgent() {
  if (!people.mesh.visible) return -1;
  let best = -1, bd = 81;
  const P = sim.aP;
  for (const a of sim.agents) {
    const o = a.id * 4;
    if (P[o + 3] < 0 || P[o + 2] > peopleU.uCutY.value) continue;
    const cellK = Math.floor(P[o + 1] - L.z0) * L.W + Math.floor(P[o] - L.x0);
    const outdoors = !L.inside[cellK] || L.alley[cellK] > 0 || (a.loc && a.loc.type === 'roof');
    const lvl = Math.round(P[o + 2] / STOREY);
    if (!(outdoors || state.explode > 0.5 || (state.cut >= 0 && lvl === state.cut))) continue;
    const [sx, sy] = agentScreen(a);
    const dd = (sx - mouse.x) ** 2 + (sy - mouse.y) ** 2;
    if (dd < bd) { bd = dd; best = a.id; }
  }
  return best;
}

// ---- UI -------------------------------------------------------------------------------------------
function buildUI() {
  $('src-body').innerHTML = SOURCES_HTML;
  const tool = (id, on, fn) => {
    const el = $(id);
    el.onclick = () => {
      const v = fn();
      el.classList.toggle('on', v);
      el.setAttribute('aria-pressed', String(v));
    };
    el.classList.toggle('on', on);
  };
  tool('t-explode', false, () => { state.explodeTarget = state.explodeTarget > 0.5 ? 0 : 1; return state.explodeTarget > 0.5; });
  tool('t-wires', true, () => {
    wires.object.visible = !wires.object.visible;
    renderLegend();
    return wires.object.visible;
  });
  tool('t-people', true, () => (people.mesh.visible = !people.mesh.visible));
  tool('t-map', false, () => (state.mapPins = !state.mapPins));
  tool('t-sound', false, () => sound.toggle());
  $('rail-clear').onclick = () => setCut(-1);
  $('st-prev').onclick = () => jumpBeat(-1);
  $('st-next').onclick = () => jumpBeat(1);
  $('st-cam').onclick = () => {
    state.storyCam = !state.storyCam;
    $('st-cam').classList.toggle('on', state.storyCam);
    if (state.storyCam && storyIdx >= 0) focusBeat(BEATS[storyIdx]);
  };
  $('src-btn').onclick = () => ($('sources').hidden = !$('sources').hidden);
  $('src-close').onclick = () => ($('sources').hidden = true);

  for (const b of $('speeds').querySelectorAll('button'))
    b.onclick = () => setSpeed(Number(b.dataset.speed));

  $('spark').onclick = (ev) => {
    const r = $('spark').getBoundingClientRect();
    sim.setTime(clamp((ev.clientX - r.left) / r.width, 0, 0.999) * 1440);
  };

  // Storey labels for the exploded view.
  labels = levels.map((lv) => {
    const el = document.createElement('div');
    el.className = 'stratum';
    el.textContent = `${levelName(lv.k)} ${levelTitle(lv.k)}`;
    $('strata').appendChild(el);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', '#2a2722');
    line.setAttribute('stroke-width', '1');
    $('overlay').appendChild(line);
    return { el, line };
  });

  buildRail();
  renderRail();
  renderLegend();
  drawSpark();

  canvas.addEventListener('pointermove', (ev) => {
    mouse.x = ev.clientX; mouse.y = ev.clientY; mouse.moved = true; mouse.inside = true;
    ndc.set((ev.clientX / innerWidth) * 2 - 1, -(ev.clientY / innerHeight) * 2 + 1);
  });
  canvas.addEventListener('pointerleave', () => { mouse.inside = false; hideTooltip(); });
  let down = null;
  canvas.addEventListener('pointerdown', (ev) => { down = [ev.clientX, ev.clientY]; state.camGoal = null; });
  canvas.addEventListener('wheel', () => (state.camGoal = null), { passive: true });
  canvas.addEventListener('pointerup', (ev) => {
    if (!down || Math.hypot(ev.clientX - down[0], ev.clientY - down[1]) > 4) return;
    const id = pickAgent();
    sim.select(id);
    state.follow = false;
  });
  addEventListener('keydown', (ev) => {
    if (ev.target.closest && ev.target.closest('input, textarea')) return;
    const k = ev.key.toLowerCase();
    if (k === 'e') $('t-explode').click();
    else if (k === 'w') $('t-wires').click();
    else if (k === 'p') $('t-people').click();
    else if (k === 'm') $('t-map').click();
    else if (k === 's') $('t-sound').click();
    else if (k === 'f' && sim.selected >= 0) state.follow = !state.follow;
    else if (k === 'escape') { setCut(-1); sim.select(-1); }
    else if (k === ' ') { ev.preventDefault(); setSpeed(state.speed ? 0 : state.lastSpeed || 60); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); setCut(state.cut < 0 ? -1 : state.cut + 1 >= MAX_FLOORS ? -1 : state.cut + 1); }
    else if (ev.key === 'ArrowDown') { ev.preventDefault(); setCut(state.cut < 0 ? MAX_FLOORS - 1 : Math.max(0, state.cut - 1)); }
  });
  addEventListener('resize', resize);
}

function setSpeed(s) {
  if (state.speed) state.lastSpeed = state.speed;
  state.speed = s;
  for (const b of $('speeds').querySelectorAll('button')) b.classList.toggle('on', Number(b.dataset.speed) === s);
}

function levelTitle(k) {
  if (k === 0) return 'STREET · SHOPS + FACTORIES';
  let total = 0, work = 0, roofs = 0;
  for (const b of L.buildings) {
    if (b.floors > k) { total++; if (b.uses[k] !== 'home') work++; }
    if (b.floors === k + 1) roofs++;
  }
  const t = work / Math.max(1, total) > 0.06 ? 'WORKSHOPS + FLATS' : 'HABITATION';
  return roofs / Math.max(1, total + roofs) > 0.25 ? `${t} · ROOFS` : t;
}

let occ = new Map();
const railRows = [];
function buildRail() {
  const ol = $('levels');
  const row = (label, k) => {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.innerHTML = `<span>${label}</span><span class="occ"><i></i></span>`;
    b.onclick = () => setCut(k === -1 || k === state.cut ? -1 : k);
    li.appendChild(b);
    ol.appendChild(li);
    railRows.push({ k, label, b, bar: b.querySelector('i') });
  };
  row('RF', -1);
  for (let k = MAX_FLOORS - 1; k >= 0; k--) {
    row(levelName(k), k);
    if (k === 1) {
      const sep = document.createElement('li');
      sep.className = 'sep';
      ol.appendChild(sep);
    }
  }
}

function renderRail() {
  const maxOcc = Math.max(1, ...occ.values());
  for (const r of railRows) {
    const n = occ.get(r.k === -1 ? 'RF' : r.k) || 0;
    r.b.className = ['has', (r.k === -1 ? state.cut < 0 : r.k === state.cut) ? 'sel' : '', state.cut >= 0 && r.k > state.cut ? 'above' : ''].join(' ');
    r.bar.style.height = `${Math.round((n / maxOcc) * 100)}%`;
    r.b.title = r.k === -1 ? `Roofs: ${n} people now. Click to show every storey.` : `${r.label}: ${n} people now. Click to cut the city at this storey.`;
  }
}

function renderLegend() {
  const g = [];
  if (state.cut >= 0) {
    const here = new Set(L.buildings.filter((b) => b.floors > state.cut).map((b) => b.uses[state.cut]));
    const uses = Object.keys(USE_LABEL).filter((u) => here.has(u));
    g.push(`<div class="grp"><h3>${levelName(state.cut)} PLAN · FLOOR USE</h3>${uses
      .map((u) => `<div class="row"><span class="sq" style="background:${USE_COLORS[u]}"></span>${USE_LABEL[u]}</div>`)
      .join('')}<div class="row"><span class="sq" style="background:#d6d0c1"></span>corridor, door to the next block</div>
      <div class="row"><span class="sq" style="background:#c9a35c"></span>link to the next building (place inferred)</div></div>`);
  }
  if (wires && wires.object.visible) {
    const seen = new Set();
    const rows = WIRE_TYPES.filter((t) => (seen.has(t.label) ? false : seen.add(t.label)))
      .map((t) => `<div class="row"><span class="sw" style="background:${t.color}"></span>${t.label}</div>`)
      .join('');
    g.push(`<div class="grp"><h3>UTILITIES (SCHEMATIC)</h3>${rows}</div>`);
  }
  $('legend').innerHTML = g.join('');
}

function drawSpark() {
  const c = $('spark-c'), g = c.getContext('2d');
  g.clearRect(0, 0, c.width, c.height);
  g.fillStyle = 'rgba(40,40,60,0.12)';
  g.fillRect(0, 0, (6.5 / 24) * c.width, c.height);
  g.fillRect((18.5 / 24) * c.width, 0, c.width, c.height);
  const max = Math.max(1, ...sim.activity);
  g.fillStyle = '#26231f';
  for (let i = 0; i < 144; i++) {
    const h = Math.round((sim.activity[i] / max) * (c.height - 4));
    g.fillRect(i * 2, c.height - h, 2, h);
  }
  g.fillStyle = '#6b6457';
  g.font = '9px "IBM Plex Mono", monospace';
  for (const h of [6, 12, 18]) g.fillText(String(h).padStart(2, '0'), (h / 24) * c.width + 2, 10);
}

function showTooltip(html) {
  const t = $('tooltip');
  t.innerHTML = html;
  t.style.display = 'block';
  const w = t.offsetWidth, h = t.offsetHeight;
  let x = mouse.x + 16, y = mouse.y + 14;
  if (x + w > innerWidth - 90) x = mouse.x - w - 16;
  if (y + h > innerHeight - 10) y = mouse.y - h - 14;
  t.style.left = `${x}px`;
  t.style.top = `${y}px`;
}
function hideTooltip() {
  $('tooltip').style.display = 'none';
  shared.uHi.value = NO_HI;
}

function buildingTooltip(b, k) {
  const B = L.buildings[b];
  if (B.kind === 'yamen')
    return `<div class="tt-h">YAMEN 衙門 · HALL</div><div>Qing-era official compound, the one old building left in the city</div><div>in the 1980s: old people’s centre (老人中心), per the exhibit plan</div><div class="tt-s">walls and roof from the traced plot · roof form is generic</div>`;
  const runs = [];
  for (let f = 0; f < B.floors; f++) {
    const u = B.uses[f], inf = !!(B.inferred && B.inferred[f]);
    const last = runs[runs.length - 1];
    if (last && last.u === u && last.inf === inf && !B.prem[f]) last.to = f;
    else runs.push({ u, inf, from: f, to: f });
  }
  const rows = runs
    .map((r) => `<div><span class="tt-k">${r.from === r.to ? levelName(r.from) : `${levelName(r.from)}–${levelName(r.to)}`}</span> ${USE_LABEL[r.u]}${r.inf ? ' *' : ''}${r.u === 'home' ? ` · ${B.flats} per floor` : ''}</div>`)
    .join('');
  const recs = [];
  for (const f of Object.keys(B.prem).map(Number).sort((x, y) => x - y))
    for (const p of B.prem[f]) recs.push(`<div class="tt-r"><span class="tt-k">${levelName(f)}</span> ${p.nameZh || ''} ${p.nameEn || ''} <i>${TRADE_LABEL[p.trade] || ''}</i></div>`);
  const prem = recs.length ? `<div class="tt-s">in the clearance files (GRS HKRS1255-3):</div>${recs.slice(0, 6).join('')}${recs.length > 6 ? `<div class="tt-s">and ${recs.length - 6} more</div>` : ''}` : '';
  const title = buildingName(B).toUpperCase();
  const front = B.front === 'top' ? '<div class="tt-s">fronts Tung Tau Tsuen Road</div>' : B.front === 'road' ? '<div class="tt-s">fronts a road on the old wall base</div>' : '';
  const fact = B.factory ? '<div class="tt-s">factory site marked on the exhibit plan</div>' : '';
  const inf = B.inferred ? '<div class="tt-s">* trade inferred from the Kai Fong count of 1983, not from a file</div>' : '';
  return `<div class="tt-h">${title} · ${B.floors} STOREY${B.floors > 1 ? 'S' : ''}</div>${rows}${prem}${front}${fact}
    <div class="tt-s">≈ ${residents.get(b) || 0} residents (simulated) · pointing at ${levelName(k)}</div>${inf}
    <div class="tt-s">plot from the 1980s plan${B.block ? `, one of ${L.towers[B.tower].blocks.length} blocks of a tower on the 1987 plan` : ''} · ${B.front === 'road' && B.cz > 0 ? 'storeys from the 1990 south elevation' : B.front === 'top' ? '“12 storeys and more” on this road (p132)' : 'storeys inferred from photos'} · place on street from house-number order</div>
    <div class="tt-s">${B.cores.length ? `${B.cores.length} stair${B.cores.length > 1 ? 's' : ''}` : B.shareWith >= 0 ? 'no stair: shares the stair of the next block' : 'no stair drawn'} · cut a storey to see the plan</div>`;
}

// A unit of the cut storey: its name, size, and who lives or works there.
function unitTooltip(bid, f, cell) {
  const B = L.buildings[bid];
  const hit = unitAt(B, f, cell);
  if (!hit) return null;
  const src = '<div class="tt-s">plan inferred: stairs and corridors after Suenn Ho’s types (pp138–139); flats sized so the city holds 8,800 (p340)</div>';
  if (!hit.u) {
    const what = hit.part === 'stair' ? 'STAIR' : 'CORRIDOR';
    const shares = L.buildings.filter((x) => x.shareWith === bid).length;
    return `<div class="tt-h">${what} · ${levelName(f)}</div><div>${buildingName(B)}</div>
      ${hit.part === 'stair' && shares ? `<div class="tt-s">shared with ${shares} block${shares > 1 ? 's' : ''} that have no stair of their own</div>` : ''}${src}`;
  }
  const u = hit.u, P = hit.plan;
  const note = B.unitNotes && B.unitNotes[`${f}:${u.id}`];
  const who = unitRes.get(`${bid}:${f}:${u.id}`) || 0;
  const rows = P.kind === 'home'
    ? `<div><span class="tt-k">flat</span> about ${u.area} m² (${Math.round(u.area * 10.76)} sq ft)</div><div><span class="tt-k">home of</span> ${who} ${who === 1 ? 'person' : 'people'} (simulated)</div>`
    : `<div><span class="tt-k">${USE_LABEL[B.uses[f]]}</span> about ${u.area} m² (${Math.round(u.area * 10.76)} sq ft)</div>`;
  const prem = (B.prem[f] || []).slice(0, 3).map((p) => `<div class="tt-r">${p.nameZh || ''} ${p.nameEn || ''} <i>${TRADE_LABEL[p.trade] || ''}</i></div>`).join('')
    + ((B.prem[f] || []).some((p) => p.mezz) ? '<div class="tt-s">the files name a mezzanine (M/F) on this floor</div>' : '');
  const flatNote = P.kind === 'home' && !note ? '<div class="tt-s">cubicles and bed spaces after the 1987 survey plan of a flat (p340), inferred</div>' : '';
  const R = P.kind === 'home' && unitReal.get(`${bid}:${f}:${u.id}`);
  const recorded = R ? `<div class="tt-real">REAL PERSON</div><div class="tt-r">The home of ${R.name}: ${R.home.size}. The model draws this flat smaller.</div>` : '';
  return `<div class="tt-h">${unitName(B, f, u).toUpperCase()}</div><div>${buildingName(B)}</div>${rows}
    ${prem ? `<div class="tt-s">on this floor, in the clearance files:</div>${prem}` : ''}
    ${recorded}${note ? `<div class="tt-real">FROM THE 1987 SURVEY</div><div class="tt-r">${note.note}</div>` : flatNote}${src}`;
}

function agentTooltip(id) {
  const a = sim.agents[id];
  const d = sim.describe(a);
  const head = `<div class="tt-h">${d.title}${d.age ? ` · ${d.age}` : ''}</div><div>${d.role}</div>
    <div><span class="tt-k">now</span> ${d.now}</div>${d.at ? `<div><span class="tt-k">at</span> ${d.at}</div>` : ''}
    <div><span class="tt-k">home</span> ${d.home}</div>`;
  if (!a.real) return `${head}<div class="tt-s">a composite resident, not a real person · click to follow</div>`;
  const facts = a.real.facts.slice(0, 2).map(([t, src]) => `<div class="tt-r">${t} <i>${src}</i></div>`).join('');
  return `<div class="tt-real">REAL PERSON</div>${head}${facts}
    <div class="tt-s">words and facts from the sources named · hours of the week inferred · click to follow</div>`;
}

function updateHover() {
  if (!mouse.inside) return;
  const pin = pickPin();
  if (pin) {
    shared.uHi.value = NO_HI;
    showTooltip(pinTooltip(pin));
    return;
  }
  const id = pickAgent();
  if (id >= 0) {
    shared.uHi.value = NO_HI;
    showTooltip(agentTooltip(id));
    return;
  }
  const hit = pickBuilding();
  if (hit) {
    shared.uHi.value = L.buildings[hit.b].tower;
    const unit = hit.k === state.cut ? unitTooltip(hit.b, hit.k, hit.cell) : null;
    showTooltip(unit || buildingTooltip(hit.b, hit.k));
  } else hideTooltip();
}

const _w = new THREE.Vector3();
function updateLabels() {
  const show = state.explode > 0.35;
  const svg = $('overlay');
  levels.forEach((lv, k) => {
    const { el, line } = labels[k];
    const visible = show && lv.group.visible;
    el.style.display = visible ? 'block' : 'none';
    line.style.display = visible ? 'block' : 'none';
    if (!visible) return;
    let bx = Infinity, by = 0;
    for (const [x, z] of [[L.x0, L.z0], [L.x0 + L.W, L.z0], [L.x0, L.z0 + L.D], [L.x0 + L.W, L.z0 + L.D]]) {
      _w.set(x, k * STOREY + offsets[k], z).project(camera);
      const sx = (_w.x * 0.5 + 0.5) * innerWidth, sy = (-_w.y * 0.5 + 0.5) * innerHeight;
      if (sx < bx) { bx = sx; by = sy; }
    }
    // Sit just left of the slab's outer corner, clear of the toolbar.
    const w = el.offsetWidth;
    const minX = by < 330 ? 96 : 14;
    const lx = Math.max(minX, bx - w - 36);
    el.style.left = `${lx}px`;
    el.style.top = `${by}px`;
    el.style.opacity = String(smoothstep(0.35, 0.8, state.explode));
    const right = lx + w;
    line.setAttribute('x1', right); line.setAttribute('y1', by);
    line.setAttribute('x2', Math.max(right, bx)); line.setAttribute('y2', by);
  });
  svg.style.opacity = String(smoothstep(0.35, 0.8, state.explode));
}

function updateTags() {
  const tag = $('tag');
  if (sim.selected >= 0 && people.mesh.visible) {
    const a = sim.agents[sim.selected];
    const lv = sim.levelOf(a);
    if (lv === null) {
      tag.textContent = `${a.name} · outside the city`;
      tag.style.display = 'block';
      tag.style.left = '50%'; tag.style.top = '64px';
    } else {
      const [sx, sy] = agentScreen(a);
      tag.textContent = `${a.name} · ${lv === 'RF' ? 'roof' : levelName(lv)}`;
      tag.style.display = 'block';
      tag.style.left = `${sx}px`; tag.style.top = `${sy}px`;
      if (state.follow) {
        const o = a.id * 4;
        controls.target.x += (sim.aP[o] - controls.target.x) * 0.06;
        controls.target.z += (sim.aP[o + 1] - controls.target.z) * 0.06;
      }
    }
  } else tag.style.display = 'none';

  const ct = $('cut-tag');
  if (state.cut >= 0) {
    let bx = Infinity, by = 0;
    for (const [x, z] of site.polygon) {
      _w.set(x, state.cut * STOREY + CUT_H + offsets[state.cut], z).project(camera);
      const sx = (_w.x * 0.5 + 0.5) * innerWidth, sy = (-_w.y * 0.5 + 0.5) * innerHeight;
      if (sx < bx) { bx = sx; by = sy; }
    }
    ct.textContent = `CUT ${levelName(state.cut)} ${levelTitle(state.cut)}`;
    ct.style.display = state.explode > 0.35 ? 'none' : 'block';
    ct.style.left = `${bx - 10}px`; ct.style.top = `${by}px`;
  } else ct.style.display = 'none';
}

// Street names from the exhibit plan, tagged above the lanes with a leader to the ground.
let streetTags = [];
function buildStreetTags() {
  streetTags = L.streets.map((st) => {
    const el = document.createElement('div');
    el.className = 'street-tag';
    const [en, zh] = [st.name.replace(/\s*[\u3400-\u9fff]+$/, ''), (st.name.match(/[\u3400-\u9fff]+$/) || [''])[0]];
    el.innerHTML = `<b>${zh}</b> ${en.toUpperCase()}`;
    document.body.insertBefore(el, $('title')); // under the panels
    // Lift the tag above the tallest building within 12 m.
    let top = 0;
    for (const b of L.buildings) if (Math.hypot(b.cx - st.x, b.cz - st.z) < 12) top = Math.max(top, b.floors);
    return { st, el, y: top * STOREY + 7 };
  });
}
function updateStreetTags() {
  const show = state.explode < 0.3;
  for (const t of streetTags) {
    t.el.style.display = show ? 'block' : 'none';
    if (!show) continue;
    const y = state.cut >= 0 ? state.cut * STOREY + 7 : t.y;
    _w.set(t.st.x, y, t.st.z).project(camera);
    const sx = (_w.x * 0.5 + 0.5) * innerWidth, sy = (-_w.y * 0.5 + 0.5) * innerHeight;
    _w.set(t.st.x, 0, t.st.z).project(camera);
    const gy = (-_w.y * 0.5 + 0.5) * innerHeight;
    t.el.style.left = `${sx}px`;
    t.el.style.top = `${sy}px`;
    t.el.style.setProperty('--lead', `${Math.max(0, gy - sy)}px`);
  }
}

// The 40 numbered places of the 1992 map in City of Darkness Revisited (pp352-353).
let pins = [];
function buildPins() {
  pins = L.places.map((p) => {
    const el = document.createElement('div');
    el.className = `map-pin${p.conflict ? ' conflict' : ''}`;
    el.textContent = p.n;
    document.body.insertBefore(el, $('title'));
    const b = L.owner[p.k];
    return { p, el, floors: b >= 0 ? L.buildings[b].floors : 0, sx: -1e4, sy: -1e4 };
  });
}
function updatePins() {
  const show = state.mapPins && state.explode < 0.3;
  for (const t of pins) {
    t.el.style.display = show ? 'block' : 'none';
    if (!show) { t.sx = -1e4; continue; }
    const y = state.cut >= 0 ? state.cut * STOREY + CUT_H + 0.5 : t.floors * STOREY + 1.5;
    _w.set(t.p.x, y, t.p.z).project(camera);
    t.sx = (_w.x * 0.5 + 0.5) * innerWidth;
    t.sy = (-_w.y * 0.5 + 0.5) * innerHeight;
    t.el.style.left = `${t.sx}px`;
    t.el.style.top = `${t.sy}px`;
  }
}
function pickPin() {
  let best = null, bd = 100;
  for (const t of pins) {
    const d = (t.sx - mouse.x) ** 2 + (t.sy - mouse.y) ** 2;
    if (d < bd) { bd = d; best = t.p; }
  }
  return best;
}
function pinTooltip(p) {
  return `<div class="tt-h">${p.n} · ${p.name.toUpperCase()}</div><div>${p.what}</div>
    ${p.where ? `<div><span class="tt-k">at</span> ${p.where}</div>` : ''}
    ${p.conflict ? `<div class="tt-r"><span class="tt-k">note</span> ${p.conflict}</div>` : ''}
    ${p.note ? `<div class="tt-s">${p.note}</div>` : ''}
    <div class="tt-s">the 1992 map, City of Darkness Revisited pp352–353${p.page ? ` · text p${p.page}` : ''} · place approximate</div>`;
}

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
let lastDay = -1;
function updateClock() {
  $('clk-time').textContent = fmtClock(sim.minute);
  const d = new Date(Date.UTC(1986, 11, 16 + (sim.day % 7)));
  $('clk-date').textContent = `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}${sim.day % 7 === DONGZHI ? ' · 冬至' : ''}`;
  $('playhead').style.left = `${(sim.minute / 1440) * 100}%`;
  const s = sim.stats();
  occ = s.perLevel;
  $('clk-stats').innerHTML = `<b>${sim.agents.length.toLocaleString()}</b> residents (simulated) · <b>${s.away.toLocaleString()}</b> outside the walls · <b>${s.moving.toLocaleString()}</b> on the move`;
  if (sim.day !== lastDay) { lastDay = sim.day; drawSpark(); }
  renderRail();
}

function resize() {
  const w = innerWidth, h = innerHeight, a = w / h;
  renderer.setSize(w, h);
  camera.left = (-VIEW_H * a) / 2; camera.right = (VIEW_H * a) / 2;
  camera.top = VIEW_H / 2; camera.bottom = -VIEW_H / 2;
  camera.updateProjectionMatrix();
  wires.setResolution(w, h);
}

// ---- story -----------------------------------------------------------------------------------------
let storyIdx = -2;
const dateOf = (day) => {
  const d = new Date(Date.UTC(1986, 11, 16 + day));
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} DEC 1986`;
};
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function updateStory() {
  const i = beatAt(sim.day % 7, sim.minute);
  if (i === storyIdx) return;
  storyIdx = i;
  renderBeat(i);
  if (i >= 0) focusBeat(BEATS[i]);
}

function renderBeat(i) {
  const b = BEATS[i];
  if (!b) {
    $('st-chap').textContent = `DAY 1 · ${dateOf(0)} · ${CHAPTERS[0]}`;
    $('st-time').textContent = '';
    $('st-text').textContent = 'One ordinary week in the city, from Tuesday 16 December 1986 to the winter solstice. Press ▶ to start at the first scene.';
    $('st-quote').innerHTML = '';
    $('st-cite').textContent = '';
    return;
  }
  $('st-chap').textContent = `DAY ${b.day + 1} · ${dateOf(b.day)} · ${CHAPTERS[b.day]}`;
  const tags = [];
  if (b.focus && b.focus.person) tags.push('<span class="chip real">REAL PERSON</span>');
  if (b.inferred) tags.push('<span class="chip inf">INFERRED</span>');
  $('st-time').innerHTML = `${b.t} ${tags.join('')}`;
  $('st-text').textContent = b.text;
  if (b.quote && b.quote.t) {
    const [main, gloss] = b.quote.t.split(' [');
    $('st-quote').innerHTML = `<div class="q">“${esc(main)}”</div>${gloss ? `<div class="g">[${esc(gloss)}</div>` : ''}<div class="w">— ${esc(b.quote.who)} · ${esc(b.quote.src)} · ${esc(b.quote.tag)}</div>`;
  } else $('st-quote').innerHTML = '';
  $('st-cite').textContent = b.cite ? `source: ${b.cite}` : '';
}

function jumpBeat(step) {
  const n = BEATS.length;
  const i = storyIdx < 0 ? (step > 0 ? 0 : n - 1) : (storyIdx + step + n) % n;
  const b = BEATS[i];
  sim.day = sim.day - (sim.day % 7) + b.day;
  sim.setTime(b.minute);
  lastDay = -1;
  storyIdx = -2;
}

function focusBeat(b) {
  // Cut and utilities as the scene asks; undo what an earlier scene set.
  if (b.cut !== undefined) { setCut(b.cut); state.storyCut = true; }
  else if (state.storyCut) { setCut(-1); state.storyCut = false; }
  if (b.wires && !wires.object.visible) $('t-wires').click();
  if (state.storySel && !(b.focus && b.focus.person)) { sim.select(-1); state.follow = false; state.storySel = false; }
  if (!state.storyCam || !b.focus) return;
  const f = b.focus;
  let p = null, zoom = 5;
  if (f.person) {
    const a = sim.agents.find((x) => x.real && x.real.key === f.person);
    if (a) {
      sim.select(a.id);
      state.follow = !!b.follow;
      state.storySel = true;
      const o = a.id * 4;
      if (sim.aP[o + 3] >= 0) { p = [sim.aP[o], sim.aP[o + 2], sim.aP[o + 1]]; zoom = 6.5; }
    }
  } else if (f.street) {
    if (f.street === 'ttt') {
      const ids = L.frontage.ttt;
      const c = ids.reduce((s, id) => [s[0] + L.buildings[id].cx, s[1] + L.buildings[id].cz], [0, 0]).map((v) => v / ids.length);
      p = [c[0], 6, c[1] - 6];
    } else {
      const cells = L.streetLanes[f.street];
      if (cells && cells.length) { const k = cells[Math.floor(cells.length / 2)]; p = [L.cellX(k), 4, L.cellZ(k)]; }
    }
    zoom = 6;
  } else if (f.building) {
    const B = L.buildings;
    const b2 = f.building === 'yamen' ? B[L.yamenId] : f.building === 'temple'
      ? B.find((x) => Object.values(x.prem).some((list) => list.some((pp) => pp.trade === 'temple')))
      : B.find((x) => x.name === f.building);
    if (b2) p = [b2.cx, b2.floors * STOREY * 0.5, b2.cz];
    zoom = 6;
  } else if (f.standpipe !== undefined) {
    const sp = wires.standpipes[f.standpipe];
    if (sp) p = [sp[0], 2, sp[1]];
    zoom = 7;
  } else if (f.view === 'plane') {
    p = [150, 30, -40]; zoom = 2.2;
  }
  if (!p) { p = [0, 14, 0]; zoom = 1.15; }
  state.camGoal = { x: p[0], y: p[1], z: p[2], zoom };
}

function glideCamera(dt) {
  const g = state.camGoal;
  if (!g) return;
  const k = 1 - Math.exp(-dt * 1.6);
  const dx = (g.x - controls.target.x) * k, dy = (g.y - controls.target.y) * k, dz = (g.z - controls.target.z) * k;
  controls.target.x += dx; controls.target.y += dy; controls.target.z += dz;
  camera.position.x += dx; camera.position.y += dy; camera.position.z += dz;
  const zg = g.zoom * (state.zf || 1);
  camera.zoom += (zg - camera.zoom) * k;
  camera.updateProjectionMatrix();
  if (Math.abs(g.x - controls.target.x) + Math.abs(g.z - controls.target.z) < 0.3 && Math.abs(zg - camera.zoom) < 0.02) state.camGoal = null;
}

// ---- loop -------------------------------------------------------------------------------------------
let last = performance.now(), frameN = 0, clockT = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  frameN++;
  const prev = state.explode;
  state.explode += (state.explodeTarget - state.explode) * (1 - Math.exp(-dt * 3.0));
  if (Math.abs(state.explodeTarget - state.explode) < 1e-3) state.explode = state.explodeTarget;
  if (state.explode !== prev) setOffsets(ease(state.explode));

  sim.step(dt * state.speed);
  people.aP.needsUpdate = true;
  if (sim.colorsDirty) { people.aC.needsUpdate = true; sim.colorsDirty = false; }

  const hour = sim.minute / 60;
  shared.uHour.value = hour;
  shared.uNight.value = lighting.update(hour, state.lift);
  wires.tick(hour, state.speed ? dt : 0);
  planes.update(sim.day % 7, sim.minute, state.speed ? dt : 0, state.explode > 0.3);
  sound.update(sim.day % 7, sim.minute, state.speed, planes);
  updateStory();
  glideCamera(dt);
  const dark = shared.uNight.value > 0.55;
  if (dark !== state.dark) {
    state.dark = dark;
    document.documentElement.style.setProperty('--title-ink', dark ? '#e9e1cf' : '#1c1b19');
    document.documentElement.style.setProperty('--title-ink-2', dark ? '#b9b2a2' : '#3f3b34');
  }

  controls.update();
  if (frameN % 3 === 0 && mouse.moved) updateHover();
  updateLabels();
  updateTags();
  updateStreetTags();
  updatePins();
  clockT += dt;
  if (clockT > 0.25) { clockT = 0; updateClock(); }
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

init().catch((err) => {
  console.error(err);
  $('loading').textContent = `FAILED TO BUILD: ${err.message}`;
});
