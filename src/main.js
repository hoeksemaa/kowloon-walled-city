import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildSite } from './site.js';
import { buildLayout, buildingName, STOREY, MAX_FLOORS, USE_LABEL, TRADE_LABEL } from './layout.js';
import { unitAt, unitName, planAt } from './floorplan.js';
import { buildLevels, buildPlan, makeBuildingMaterial, makeCutoutMaterial, makeBuildingDepth, CUT_H, USE_COLORS, PLAN_COLORS } from './cityMesh.js';
import { withSection } from './kinds.js';
import { DIM, withDim } from './dim.js';
import { makeSignMaterial, makeSignDepth } from './signs.js';
import { buildWires, WireLayer, WIRE_TYPES } from './wires.js';
import { createPopulation, Sim } from './people.js';
import { Flock } from './figures.js';
import { Crowd } from './crowd.js';
import { Post } from './post.js';
import { Lamps } from './lamps.js';
import { USE, UseMap, withUse } from './useMap.js';
import { CASES, STEPS, hint as gameHint } from './game.js';
import { buildRoutes } from './routes.js';
import { buildEnvironment, Lighting } from './env.js';
import { Labels } from './labels.js';
import { clamp, smoothstep, fmtClock } from './util.js';
import { sourcesHtml } from './sources.js';
import { Planes } from './planes.js';
import { Sound } from './sound.js';
import { WEEK, DONGZHI } from './people.js';

const NO_HI = -100; // highlight id meaning "nothing hovered"
const NO_CUT = 1e5; // uCutTop with no cut storey: above everything
const GAP = 13; // extra metres between storeys when fully exploded
const POPULATION = 28200; // occupants in January 1987 (p340); people from outside come on top (people.js)
const START_MINUTE = 9 * 60 + 45;
// The speeds of the clock: pause, then one, two and three arrows. Above two arrows the sound
// plays only its bed (sound.js) and people take the plain way (people.js).
const SPEEDS = [0, 1, 60, 2400];
const $ = (id) => document.getElementById(id);
const levelName = (k) => (k === 0 ? 'G/F' : `${k}/F`);
// Roads outside the city, by side of the plan. Only these two touched the city directly;
// Sai Tau Tsuen lay to the south and west until 1985 (research/kwc-research.md, 1.3).
const STREETS = { top: 'TUNG TAU TSUEN ROAD 東頭村道', right: 'TUNG TSING ROAD 東正道' };
// A padlock in pixels, on the row of the legend whose floor use a click keeps lit.
const LOCK_ICON = '<svg class="lk" viewBox="0 0 7 8" width="7" height="8" shape-rendering="crispEdges" aria-hidden="true"><path d="M2 0h3v1H2z M1 1h1v2H1z M5 1h1v2H5z M0 3h7v5H0z M3 5h1v1H3z" fill="currentColor" fill-rule="evenodd"/></svg>';

// Haze: things fade into the sky with distance from the centre of the city, from fogNear to
// fogFar (env.js), the same at every height. The world position comes from the view matrix,
// which has no scale: its inverse is the transpose of its rotation.
THREE.ShaderChunk.fog_pars_vertex = `#ifdef USE_FOG
varying vec2 vFogXZ;
#endif`;
THREE.ShaderChunk.fog_vertex = `#ifdef USE_FOG
vFogXZ = ((mvPosition.xyz - viewMatrix[3].xyz) * mat3(viewMatrix)).xz;
#endif`;
THREE.ShaderChunk.fog_pars_fragment = `#ifdef USE_FOG
uniform vec3 fogColor; varying vec2 vFogXZ;
uniform float fogNear; uniform float fogFar;
#endif`;
THREE.ShaderChunk.fog_fragment = `#ifdef USE_FOG
float fogFactor = smoothstep(fogNear, fogFar, length(vFogXZ));
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
const post = new Post(renderer, scene, camera);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.09;
controls.screenSpacePanning = true;
controls.zoomToCursor = true;
controls.minZoom = 0.45;
controls.maxZoom = 28;
controls.minPolarAngle = 0.12;
controls.maxPolarAngle = 1.42;
{
  const az = Math.PI * 0.25, el = 0.58, d = 1400;
  controls.target.set(0, 14, 0);
  camera.position.set(Math.sin(az) * Math.cos(el) * d, 14 + Math.sin(el) * d, Math.cos(az) * Math.cos(el) * d);
  camera.zoom = 1.15;
}

// useHover, useFocus, useLock: the floor use that the pointer is on, that has the keyboard focus,
// and that a click keeps lit, in the legend (useMap.js).
const state = {
  explode: 0, explodeTarget: 0, lift: 0, cut: -1,
  speed: SPEEDS[1], hoverAgent: -1, hoverBld: -1, follow: false, camGoal: null,
  useHover: null, useFocus: null, useLock: null,
};
const offsets = new Float32Array(16);
const shared = {
  uHour: { value: START_MINUTE / 60 }, uNight: { value: 0 }, uHi: { value: NO_HI }, uHint: { value: NO_HI }, uCutTop: { value: NO_CUT },
};
// uMarkers: the gold marker over each real person (people.js), off while a case of the game is
// open. uWalk and uIdle: the clocks of the steps and of the other moves (figures.js).
const peopleU = { uOff: { value: offsets }, uPeopleScale: { value: 1.15 }, uMarkers: { value: 1 }, uWalk: { value: 0 }, uIdle: { value: 0 }, uNight: shared.uNight };

let L, site, levels, wires, sim, people, lighting, labels, residents, cutRing, planes, flock, useMap;
let bookStreets = {}, mapStreets = {}; // the street notes of book.json, and the streets that the 1992 map names
let toolbarBox = null; // the toolbar on the screen: the storey labels keep clear of it (labels.js)
const lamps = new Lamps(shared.uNight, renderer);
Object.assign(shared, { uLampMap: lamps.uMap, uLampBox: lamps.uBox }, USE);
Object.assign(peopleU, { uLampMap: lamps.uMap, uLampBox: lamps.uBox }, USE);
const unitRes = new Map();
const sound = new Sound(); // off until the user turns it on

async function init() {
  await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 20)));
  const [plan, biz, book, overlay] = await Promise.all(['./data/plan.json', './data/businesses.json', './data/book.json', './data/book_overlay.json']
    .map((u) => fetch(u).then((r) => r.json())));
  book.overlay = overlay;
  bookStreets = book.streets;
  mapStreets = overlay.streets;
  site = buildSite(plan);
  L = buildLayout(site, plan, biz, book);
  L.routes = buildRoutes(L);
  lamps.setBox(L);
  useMap = new UseMap(L);
  const center = new THREE.Vector3(L.x0 + L.W / 2, 0, L.z0 + L.D / 2);
  lighting = new Lighting(scene, center, site);
  const env = buildEnvironment(scene, L);

  // ---- storeys ----
  // Each storey is one group, moved only up and down: the normal view is the storeys of the
  // exploded view put back together. The aerials, signs and slab edges of a storey have their
  // own materials, so the layered view can dim them with the storey (dim.js).
  const storeyLines = (k, color, opts, section) => {
    const m = new THREE.LineBasicMaterial({ color, ...opts });
    const uLevel = { value: k };
    m.onBeforeCompile = (s) => {
      if (section) withSection(s, shared.uCutTop);
      withDim(s, 'uLevel', uLevel);
    };
    m.customProgramCacheKey = () => (section ? 'kwc-aerial' : 'kwc-slab-edge');
    return m;
  };
  const slabGeo = new THREE.PlaneGeometry(L.W, L.D).rotateX(-Math.PI / 2).translate(center.x, 0, center.z);
  const slabEdge = new THREE.EdgesGeometry(slabGeo);
  const built = buildLevels(L);
  const signDepth = makeSignDepth(shared);
  levels = built.levels.map((d) => {
    const group = new THREE.Group();
    const mat = makeBuildingMaterial(shared);
    const mesh = new THREE.Mesh(d.geometry, mat);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.customDepthMaterial = makeBuildingDepth(mat, shared);
    group.add(mesh);
    let cutout = null;
    if (d.cutout) {
      // the see-through cages, plants and pipes (cityMesh.js)
      cutout = new THREE.Mesh(d.cutout, makeCutoutMaterial(mat, shared));
      cutout.castShadow = cutout.receiveShadow = true;
      cutout.customDepthMaterial = mesh.customDepthMaterial;
      group.add(cutout);
    }
    let signs = null;
    if (d.signs) {
      signs = new THREE.Mesh(d.signs, makeSignMaterial(shared, built.signTexture, d.k));
      signs.castShadow = true;
      signs.customDepthMaterial = signDepth;
      group.add(signs);
    }
    const ag = new THREE.BufferGeometry();
    ag.setAttribute('position', new THREE.BufferAttribute(d.antennas, 3));
    const antennas = new THREE.LineSegments(ag, storeyLines(d.k, '#3a3935', {}, true));
    group.add(antennas);
    const slab = new THREE.Mesh(slabGeo, new THREE.MeshBasicMaterial({ color: '#1c1b18', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
    slab.position.y = d.k * STOREY - 0.06;
    slab.renderOrder = 1;
    const edge = new THREE.LineSegments(slabEdge, storeyLines(d.k, '#efe8d6', { transparent: true, opacity: 0 }, false));
    edge.position.y = slab.position.y;
    slab.visible = edge.visible = false;
    group.add(slab, edge);
    scene.add(group);
    return { k: d.k, group, mesh, cutout, mat, antennas, signs, slab, edge, plan: null };
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

  // ---- labels: street names, place numbers, storey labels (labels.js) ----
  // The plates draw their words on canvases: wait for the pixel font, but not for ever.
  await Promise.race([document.fonts.load('32px Silkscreen'), new Promise((r) => setTimeout(r, 3000))]).catch(() => {});
  labels = new Labels({ L, site, levels, road: env.roadOutline, roads: STREETS, mapStreets, title: levelTitle, aniso: renderer.capabilities.getMaxAnisotropy() });

  // ---- wires ----
  wires = new WireLayer(L, buildWires(L));
  scene.add(wires.object);

  // ---- Kai Tak: the runway 13 final, NE of the city (planes.js) ----
  planes = new Planes(scene, [0.2756, 0.9613], [182, -52], 62);

  // ---- people ----
  const agents = createPopulation(L, POPULATION);
  sim = new Sim(L, agents);
  sim.jumpTo(START_MINUTE);
  people = new Crowd(sim, L, peopleU);
  scene.add(people.group);
  flock = new Flock(sim);
  scene.add(flock.mesh);
  makeGameRings();
  residents = new Map();
  for (const a of agents) if (a.home.type === 'in') residents.set(a.home.b, (residents.get(a.home.b) || 0) + 1);
  for (const a of agents) if (a.home.m !== undefined) { const key = `${a.home.b}:${a.home.f}:${a.home.m}`; unitRes.set(key, (unitRes.get(key) || 0) + 1); }

  buildUI();
  resize();
  setOffsets(0);
  $('loading').classList.add('done');
  window.kwc = { L, sim, state, setCut, setSpeed, camera, controls, levels, planes, flock, people, peopleU, post, lamps, renderer, wires, offsets, labels, dim: DIM, useMap, showUse };
  requestAnimationFrame(frame);
}

// ---- explode + cut --------------------------------------------------------------------------
const ease = (t) => t * t * (3 - 2 * t);

// The slabs between the storeys, in the layered view, and the dim (dim.js), which comes in with
// them. With no cut storey, each storey shows through the dark slab of the storey above it. With
// a cut storey, the dim of the storeys below it takes the place of the slabs; the edges stay,
// and dim with their storey. In the normal view there is neither.
function setSlabs() {
  const show = state.explode > 0.01;
  const a = smoothstep(0.05, 0.7, state.explode);
  DIM.uDimOn.value = a;
  for (const lv of levels) {
    lv.slab.visible = show && state.cut < 0;
    lv.edge.visible = show;
    lv.slab.material.opacity = 0.26 * a;
    lv.edge.material.opacity = 0.55 * a;
  }
}

function setOffsets(e) {
  for (let k = 0; k < 16; k++) offsets[k] = Math.min(k, MAX_FLOORS - 1) * GAP * e;
  const show = state.explode > 0.01;
  const a = smoothstep(0.05, 0.7, state.explode);
  for (const lv of levels) lv.group.position.y = offsets[lv.k];
  setSlabs();
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

// A cut storey is a level section, the same in both views: it hides the storeys above it, and
// on every storey it drops all that rises above CUT_H over its floor (cityMesh.js).
function setCut(c) {
  state.cut = c;
  // The floor use kept lit stays from storey to storey, until the cut goes.
  if (c < 0) state.useLock = state.useHover = state.useFocus = null;
  shared.uCutTop.value = c >= 0 ? c * STOREY + CUT_H + 0.05 : NO_CUT;
  DIM.uDimCut.value = c;
  setSlabs();
  for (const lv of levels) {
    lv.group.visible = c < 0 || lv.k <= c;
    lv.mat.userData.uIsCut.value = lv.k === c ? 1 : 0;
    if (lv.plan) {
      lv.group.remove(lv.plan.mesh, lv.plan.lines);
      lv.plan.mesh.geometry.dispose();
      lv.plan.lines.geometry.dispose();
      lv.plan = null;
    }
  }
  if (cutRing.parent) cutRing.parent.remove(cutRing);
  if (useMap.object.parent) useMap.object.parent.remove(useMap.object);
  people.setSpots(-1, []);
  lamps.set(-1, []);
  useMap.set(-1);
  if (c >= 0) {
    const p = buildPlan(L, c);
    people.setSpots(c, p.spots);
    lamps.set(c, p.lamps);
    useMap.set(c, p);
    levels[c].group.add(useMap.object);
    const mesh = new THREE.Mesh(p.geometry, levels[c].mat);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.customDepthMaterial = levels[c].mesh.customDepthMaterial;
    const lines = new THREE.LineSegments(p.lines, new THREE.LineDashedMaterial({ color: '#f1ead8', dashSize: 0.42, gapSize: 0.3 }));
    lines.material.onBeforeCompile = withUse;
    lines.material.customProgramCacheKey = () => 'kwc-plan-lines';
    lines.computeLineDistances();
    levels[c].group.add(mesh, lines);
    levels[c].plan = { mesh, lines };
    levels[c].group.add(cutRing);
    cutRing.position.y = c * STOREY + CUT_H + 0.05;
    cutRing.visible = true;
  }
  wires.update(offsets, c);
  renderRail();
  renderLegend();
}

// ---- floor-use highlight (useMap.js) ----------------------------------------------------------
// The use lit on the plan: the row that the pointer is on, else the row with the keyboard focus,
// else the row kept lit with a click.
const shownUse = () => (state.cut < 0 ? null : state.useHover || state.useFocus || state.useLock);
const useColor = (key) => USE_COLORS[key] || PLAN_COLORS[key];

function showUse() {
  const key = shownUse();
  useMap.show(key, key && useColor(key));
  const fade = key ? 0.25 : 1;
  if (fade !== wires.cutFade) {
    wires.cutFade = fade;
    wires.update(offsets, state.cut);
  }
  const box = $('legend');
  for (const el of box.querySelectorAll('[data-key]')) {
    const k = el.dataset.key;
    el.classList.toggle('on', k === key);
    el.classList.toggle('lock', k === state.useLock);
    el.setAttribute('aria-pressed', String(k === state.useLock));
  }
  const n = box.querySelector('.use-n');
  if (n) n.innerHTML = useCount(key);
}

// After a change of the use kept lit: the row of a use that this storey does not have goes.
function relock() {
  if ($('legend').querySelector('.none')) renderLegend();
  else showUse();
}

// The foot of the floor-use legend: what the lit use holds on the cut storey, or how to use it.
// It has three lines, always, so that the rows do not move under the pointer. The outline of a
// block is solid if its trade is recorded, and dashed if it is inferred from the Kai Fong count
// of 1983 (layout.js).
function useCount(key) {
  const lv = levelName(state.cut);
  const line = (t) => `<div>${t}</div>`, px = (t) => `<div class="px">${t}</div>`;
  if (!key) return px('POINT AT A USE TO LIGHT IT ON THE PLAN') + px('CLICK TO KEEP IT LIT');
  const keep = px(state.useLock ? 'KEPT LIT · CLICK IT OR ESC TO CLEAR' : 'CLICK TO KEEP IT LIT');
  if (key === 'corridor' || key === 'link') {
    const p = useMap.plan, doors = p.doors.filter((d) => d.link === (key === 'link')).length;
    if (key === 'link') return line(`<b>${doors} link${doors === 1 ? '' : 's'}</b> to the next building on ${lv}`) + line('places inferred') + keep;
    return line(`<b>corridors</b> in ${new Set(p.corridors.map((q) => q.b)).size} blocks on ${lv}`) + line(`${doors} doors to the next block · plan inferred`) + keep;
  }
  const bs = useMap.blocks(key), n = bs.length, inf = bs.filter((b) => b.inferred && b.inferred[state.cut]).length;
  const head = line(`<b>${n ? `${n} block${n === 1 ? '' : 's'}` : 'none'}</b> on ${lv} · ${USE_LABEL[key]}`);
  const split = key === 'home' || !n ? line('') : line(`<span class="ln"></span>${n - inf} recorded${inf ? ` <span class="ln d"></span>${inf} inferred (1983 count)` : ''}`);
  return head + split + keep;
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
// Where someone is on the screen: where the crowd draws them (at a bed or a seat, crowd.js),
// or else where they are. A person moves with the storey they stand on (people.js).
function agentScreen(a) {
  const o = a.id * 4, P = sim.aP, s = people.shown(a.id);
  const [x, y, z, lv] = s || [P[o], P[o + 2], P[o + 1], P[o + 3]];
  _v.set(x, y + offsets[clamp(lv, 0, 15) | 0] + 1.0, z).project(camera);
  return [(_v.x * 0.5 + 0.5) * innerWidth, (-_v.y * 0.5 + 0.5) * innerHeight];
}

function pickAgent() {
  if (!people.group.visible) return -1;
  return people.pick(mouse.x, mouse.y, camera, offsets, 9, innerWidth, innerHeight);
}

// ---- UI -------------------------------------------------------------------------------------------
function buildUI() {
  $('src-body').innerHTML = sourcesHtml(L.mapPeople.filter((p) => !L.book[p.n]));
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
  tool('t-people', true, () => (people.group.visible = !people.group.visible));
  tool('t-map', true, () => labels.setOn(!labels.on));
  tool('t-sound', false, () => sound.toggle());
  tool('t-find', false, () => {
    $('game').hidden = !$('game').hidden;
    if ($('game').hidden) closeCase();
    renderGame();
    return !$('game').hidden;
  });
  $('game-close').onclick = () => $('t-find').click();
  $('rail-clear').onclick = () => setCut(-1);
  $('src-btn').onclick = () => ($('sources').hidden = !$('sources').hidden);
  $('src-close').onclick = () => ($('sources').hidden = true);

  $('speeds').querySelectorAll('button').forEach((b, i) => {
    const s = SPEEDS[i], t = s ? `${s}×: ${s === 1 ? 'real time' : `a day in ${dayIn(s)}`} (${i})` : 'Pause (Space)';
    b.title = t;
    b.setAttribute('aria-label', t);
    b.onclick = () => setSpeed(s);
  });
  setSpeed(state.speed);

  $('spark').onclick = (ev) => {
    const r = $('spark').getBoundingClientRect();
    sim.jumpTo(clamp((ev.clientX - r.left) / r.width, 0, 0.999) * 1440);
  };

  buildRail();
  renderRail();
  renderLegend();
  drawSpark();

  // The floor-use legend: a point at a row (or the keyboard focus on it) lights its use; a
  // click keeps it lit, and a click on the row kept lit lets it go. A touch only clicks.
  const legend = $('legend');
  const keyOf = (ev) => { const el = ev.target.closest && ev.target.closest('[data-key]'); return el ? el.dataset.key : null; };
  legend.addEventListener('pointerover', (ev) => {
    if (ev.pointerType === 'touch') return;
    const k = keyOf(ev);
    if (k !== state.useHover) { state.useHover = k; showUse(); }
  });
  legend.addEventListener('pointerleave', () => { if (state.useHover) { state.useHover = null; showUse(); } });
  legend.addEventListener('focusin', (ev) => { state.useFocus = ev.target.matches(':focus-visible') ? keyOf(ev) : null; showUse(); });
  legend.addEventListener('focusout', () => { state.useFocus = null; showUse(); });
  legend.addEventListener('click', (ev) => {
    const k = keyOf(ev);
    if (!k) return;
    state.useLock = state.useLock === k ? null : k;
    relock();
  });

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
    if (game.c && !game.solved) { if (id >= 0) checkPick(id); return; }
    // A click on a street name or a place number opens its card, as a hover does. In the game,
    // a click is for the people, also under a label.
    if (showLabel(pickLabel())) return;
    sim.select(id);
    state.follow = false;
  });
  addEventListener('keydown', (ev) => {
    if (ev.target.closest && ev.target.closest('input, textarea')) return;
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    const k = ev.key.toLowerCase();
    if (k === 'e') $('t-explode').click();
    else if (k === 'w') $('t-wires').click();
    else if (k === 'p') $('t-people').click();
    else if (k === 'm') $('t-map').click();
    else if (k === 's') $('t-sound').click();
    else if (k === 'g') $('t-find').click();
    else if (k === 'f' && sim.selected >= 0) state.follow = !state.follow;
    else if (k === 'escape') {
      // the first Esc lets go of the floor use kept lit, the next one clears the cut
      if (state.useLock) { state.useLock = null; relock(); }
      else { setCut(-1); sim.select(-1); }
    }
    else if (k === ' ') { ev.preventDefault(); setSpeed(state.speed ? 0 : state.lastSpeed || SPEEDS[1]); }
    else if (k === '1' || k === '2' || k === '3') setSpeed(SPEEDS[Number(k)]);
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); setCut(state.cut < 0 ? -1 : state.cut + 1 >= MAX_FLOORS ? -1 : state.cut + 1); }
    else if (ev.key === 'ArrowDown') { ev.preventDefault(); setCut(state.cut < 0 ? MAX_FLOORS - 1 : Math.max(0, state.cut - 1)); }
  });
  addEventListener('resize', resize);
}

function setSpeed(s) {
  if (state.speed) state.lastSpeed = state.speed;
  state.speed = s;
  sim.fast = s > SPEEDS[2];
  $('speeds').querySelectorAll('button').forEach((b, i) => {
    b.classList.toggle('on', SPEEDS[i] === s);
    b.setAttribute('aria-pressed', String(SPEEDS[i] === s));
  });
  $('clock').classList.toggle('run', s > 0);
}

// How long a simulated day takes at speed s, in words.
function dayIn(s) {
  const t = 86400 / s;
  return t >= 3600 ? `${+(t / 3600).toFixed(1)} hours` : t >= 60 ? `${+(t / 60).toFixed(1)} minutes` : `${Math.round(t)} seconds`;
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

// The legend. Each row of the floor uses is a button: a point at it lights that use on the plan,
// and a click keeps it lit (showUse). The rows are made again on each call; one set of
// listeners on #legend serves them all (buildUI).
function renderLegend() {
  const g = [];
  // A row with the keyboard focus keeps it, if this storey has the row.
  const focusKey = state.useFocus;
  state.useHover = state.useFocus = null;
  if (state.cut >= 0) {
    const here = new Set(L.buildings.filter((b) => b.floors > state.cut).map((b) => b.uses[state.cut]));
    const uses = Object.keys(USE_LABEL).filter((u) => here.has(u));
    const row = (key, label, extra = '') => `<button class="row${extra}" data-key="${key}" aria-pressed="false"><span class="sq" style="background:${useColor(key)}"></span><span class="lb">${label}</span>${LOCK_ICON}</button>`;
    // A use kept lit that this storey does not have stays at the top, in grey.
    const gone = state.useLock && USE_LABEL[state.useLock] && !here.has(state.useLock) ? row(state.useLock, `${USE_LABEL[state.useLock]} · none on this storey`, ' none') : '';
    g.push(`<div class="grp"><h3>${levelName(state.cut)} PLAN · FLOOR USE</h3>${gone}${uses.map((u) => row(u, USE_LABEL[u])).join('')}
      ${row('corridor', 'corridor, door to the next block')}${row('link', 'link to the next building (place inferred)')}
      <div class="use-n"></div></div>`);
  }
  if (wires && wires.object.visible) {
    const seen = new Set();
    const rows = WIRE_TYPES.filter((t) => (seen.has(t.label) ? false : seen.add(t.label)))
      .map((t) => `<div class="row"><span class="sw" style="background:${t.color}"></span>${t.label}</div>`)
      .join('');
    g.push(`<div class="grp"><h3>UTILITIES (SCHEMATIC)</h3>${rows}</div>`);
  }
  $('legend').innerHTML = g.join('');
  if (focusKey) { const el = $('legend').querySelector(`[data-key="${focusKey}"]`); if (el) el.focus(); }
  showUse();
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
  labels.light(null);
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
  const recs = [], bookRecs = [];
  for (const f of Object.keys(B.prem).map(Number).sort((x, y) => x - y))
    for (const p of B.prem[f]) (p.refs ? recs : bookRecs).push(`<div class="tt-r"><span class="tt-k">${levelName(f)}</span> ${premLine(p)}</div>`);
  const prem = (recs.length ? `<div class="tt-s">in the clearance files (GRS HKRS1255-3):</div>${recs.slice(0, 6).join('')}${recs.length > 6 ? `<div class="tt-s">and ${recs.length - 6} more</div>` : ''}` : '')
    + (bookRecs.length ? `<div class="tt-s">in City of Darkness Revisited (2014), place by address:</div>${bookRecs.join('')}` : '');
  const title = buildingName(B).toUpperCase();
  const front = B.front === 'top' ? '<div class="tt-s">fronts Tung Tau Tsuen Road</div>' : B.front === 'road' ? '<div class="tt-s">fronts a road on the old wall base</div>' : '';
  const fact = B.factory ? '<div class="tt-s">factory site marked on the exhibit plan</div>' : '';
  const inf = B.inferred ? '<div class="tt-s">* trade inferred from the Kai Fong count of 1983, not from a file</div>' : '';
  return `<div class="tt-h">${title} · ${B.floors} STOREY${B.floors > 1 ? 'S' : ''}</div>${rows}${prem}${front}${fact}
    <div class="tt-s">≈ ${residents.get(b) || 0} residents (simulated) · pointing at ${levelName(k)}</div>${inf}
    <div class="tt-s">plot from the 1980s plan${B.block ? `, one of ${L.towers[B.tower].blocks.length} blocks of a tower on the 1987 plan` : ''} · ${B.front === 'road' && B.cz > 0 ? 'storeys from the 1990 south elevation' : B.front === 'top' ? '“12 storeys and more” on this road (p132)' : 'storeys inferred from photos'} · place on street from house-number order</div>
    <div class="tt-s">${B.cores.length ? `${B.cores.length} stair${B.cores.length > 1 ? 's' : ''}` : B.shareWith >= 0 ? 'no stair: shares the stair of the next block' : 'no stair drawn'} · cut a storey to see the plan</div>`;
}

// One premises of a floor: its names and trade, and the page of the book that names it. The
// trade is left out when the name says it.
function premLine(p) {
  const book = p.book ? ` · <span class="tt-book">BOOK p${p.page}</span>${p.inferred ? ' (INFERRED for 1986)' : ''}` : '';
  const trade = TRADE_LABEL[p.trade] || '';
  return `${p.nameZh || ''} ${p.nameEn || ''} <i>${(p.nameEn || '').toLowerCase().includes(trade.toLowerCase()) ? '' : trade}</i>${book}`;
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
  const prem = (B.prem[f] || []).slice(0, 3).map((p) => `<div class="tt-r">${premLine(p)}</div>`).join('')
    + ((B.prem[f] || []).some((p) => p.mezz) ? '<div class="tt-s">the files name a mezzanine (M/F) on this floor</div>' : '');
  const flatNote = P.kind === 'home' && !note ? '<div class="tt-s">cubicles and bed spaces after the 1987 survey plan of a flat (p340), inferred</div>' : '';
  return `<div class="tt-h">${unitName(B, f, u).toUpperCase()}</div><div>${buildingName(B)}</div>${rows}
    ${prem ? `<div class="tt-s">on this floor, in the clearance files or the book:</div>${prem}` : ''}
    ${note ? `<div class="tt-real">FROM THE 1987 SURVEY</div><div class="tt-r">${note.note}</div>` : flatNote}${src}`;
}

function agentTooltip(id) {
  const a = sim.agents[id];
  const d = sim.describe(a);
  const head = `<div class="tt-h">${d.title}${d.age ? ` · ${d.age}` : ''}</div><div>${d.role}</div>
    <div><span class="tt-k">now</span> ${d.now}</div>${d.at ? `<div><span class="tt-k">at</span> ${d.at}</div>` : ''}
    <div><span class="tt-k">home</span> ${d.home}</div>${homeSize(a)}`;
  if (!a.real) return `${head}<div class="tt-s">${a.home.type === 'in' ? 'a composite resident' : 'a composite person from outside the city'}, not a real person · click to follow</div>`;
  const facts = a.real.facts.slice(0, 2).map(([t, src]) => `<div class="tt-r">${t} <i>${src}</i></div>`).join('');
  if (a.real.book)
    return `<div class="tt-real">REAL PERSON · CITY OF DARKNESS REVISITED</div>${head}${facts}${mapFacts(L.bookPlaces[a.real.book])}
    <div class="tt-s">met by the book in about 1990 · says no words in the model · hours approximate for 1986 · click to follow</div>`;
  // The first recorded quote, with its source and its tag. A Chinese quote carries its gloss in [].
  const q = a.real.quotes[0];
  const [said, gloss] = q ? q.t.split(' [') : [];
  const quote = q ? `<div class="tt-q">“${said}”${gloss ? `<div class="g">[${gloss}</div>` : ''}<div class="w">${q.src} · ${q.tag}</div></div>` : '';
  return `<div class="tt-real">REAL PERSON</div>${head}${facts}${quote}
    <div class="tt-s">words and facts from the sources named · hours of the week inferred · click to follow</div>`;
}

// The size of a real person's home that a source records, and the size of the model's flat.
function homeSize(a) {
  const size = a.real && a.real.home && a.real.home.size;
  const P = size && a.home.type === 'in' && planAt(L.buildings[a.home.b], a.home.f), u = P && P.units[a.home.m];
  if (!u) return '';
  const sqft = Math.round(u.area * 10.76), smaller = sqft < +(size.match(/\d+/) || [0])[0];
  return `<div class="tt-r"><span class="tt-k">home size</span> ${size} recorded; the model’s flat is ${smaller ? 'smaller, ' : ''}about ${u.area} m² (${sqft} sq ft)</div>`;
}

// What the 1992 map says of a person of the book: the number, the words of the key and the
// page. The map tool shows only places, thus the number of a person is here.
function mapFacts(p) {
  if (!p) return '';
  return `<div class="tt-r"><span class="tt-k">1992 map</span> no. ${p.n}${p.key ? `, “${p.key}”` : ''}${p.page ? `, p${p.page}` : ''} <i>the key of the map, pp352–353</i></div>
    ${p.conflict ? `<div class="tt-r"><span class="tt-k">map note</span> ${p.conflict} The model uses the address in the text.</div>` : ''}${p.note ? `<div class="tt-s">${p.note}</div>` : ''}`;
}

function updateHover() {
  if (!mouse.inside) return;
  if (showLabel(pickLabel())) return;
  labels.light(null);
  const id = pickAgent();
  if (id >= 0) {
    shared.uHi.value = NO_HI;
    showTooltip(game.c && !game.solved ? '<div class="tt-h">A PERSON</div><div class="tt-s">click to check · Find them 尋人</div>' : agentTooltip(id));
    return;
  }
  const hit = pickBuilding();
  if (hit) {
    const hb = L.buildings[hit.b];
    shared.uHi.value = hb.kind === 'yamen' ? L.buildings[L.yamenId].tower : hb.tower;
    const unit = hit.k === state.cut ? unitTooltip(hit.b, hit.k, hit.cell) : null;
    showTooltip(unit || buildingTooltip(hit.b, hit.k));
  } else hideTooltip();
}

function updateTags() {
  const tag = $('tag');
  if (sim.selected >= 0 && people.group.visible) {
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
}

// The street name or place number under the pointer (labels.js).
function pickLabel() {
  raycaster.setFromCamera(ndc, camera);
  return labels.pick(raycaster);
}

// The card of a label: a place lights its tower, a street its lane cells.
function showLabel(lb) {
  if (!lb) return false;
  if (lb.kind === 'place') {
    const B = lb.b >= 0 && L.buildings[lb.b];
    shared.uHi.value = !B ? NO_HI : B.kind === 'yamen' ? L.buildings[L.yamenId].tower : B.tower;
    labels.light(null);
    showTooltip(placeCard(lb));
  } else {
    shared.uHi.value = NO_HI;
    labels.light(lb);
    showTooltip(lb.kind === 'road' ? roadCard(lb) : streetCard(lb.st));
  }
  return true;
}

// A place of the 1992 map. The number lies where the model puts the place; the card says
// where the map puts it, if that is more than 8 m away.
const COMPASS = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'];
function placeCard(lb) {
  const p = lb.p, B = lb.b >= 0 && L.buildings[lb.b];
  const dx = p.x - lb.x, dz = p.z - lb.z;
  const dir = COMPASS[(Math.round(Math.atan2(dx * site.east[0] + dz * site.east[1], dx * site.north[0] + dz * site.north[1]) / (Math.PI / 4)) + 8) % 8];
  return `<div class="tt-h">${p.place.toUpperCase()}</div><div>no. ${p.n} on the 1992 map</div>
    ${p.what.toLowerCase() !== p.place.toLowerCase() ? `<div>${p.what}</div>` : ''}
    ${p.where ? `<div><span class="tt-k">at</span> ${p.where}</div>` : ''}
    ${B && B.floors > 1 ? `<div><span class="tt-k">storey</span> ${levelName(lb.f)}${p.floor == null ? ' (inferred)' : ''}</div>` : ''}
    ${lb.off > 8 ? `<div class="tt-r"><span class="tt-k">1992 map</span> no. ${p.n} is about ${Math.round(lb.off / 5) * 5} m ${dir} of here</div>` : ''}
    ${p.conflict ? `<div class="tt-r"><span class="tt-k">note</span> ${p.conflict}</div>` : ''}
    ${p.note ? `<div class="tt-s">${p.note}</div>` : ''}
    <div class="tt-s">City of Darkness Revisited pp352–353${p.page ? ` · text p${p.page}` : ''} · place approximate</div>`;
}

// A street of the City, and the lane that the model lights for it.
function streetCard(st) {
  const note = bookStreets[st.key] && bookStreets[st.key].note, wall = st.key === 'lcr' || st.key === 'ssr';
  return `<div class="tt-h">${st.name.toUpperCase()}</div>
    <div class="tt-s">${st.key in mapStreets ? 'named on the 1992 map, City of Darkness Revisited p352' : 'named on the 1980s street plan'}</div>
    ${note ? `<div class="tt-s">${note}</div>` : ''}
    <div class="tt-s">${wall ? 'lit: the road on the old wall base' : 'lit: its lane, traced along the plan from the name (inferred)'}</div>`;
}

function roadCard(lb) {
  return `<div class="tt-h">${lb.text}</div><div class="tt-s">a road outside the City, on this side of it</div>
    <div class="tt-s">the road line is schematic: the outline of the City, pushed out by about 10 m</div>`;
}

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
let lastDay = -1;
function updateClock() {
  const [hh, mm] = fmtClock(sim.minute).split(':');
  $('clk-h').textContent = hh;
  $('clk-m').textContent = mm;
  const d = new Date(Date.UTC(1986, 11, 16 + (sim.day % 7)));
  $('clk-date').textContent = `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}${sim.day % 7 === DONGZHI ? ' · 冬至' : ''}`;
  $('playhead').style.left = `${(sim.minute / 1440) * 100}%`;
  const s = sim.stats();
  occ = s.perLevel;
  $('clk-stats').innerHTML = `<b>${sim.residents.toLocaleString()}</b> residents + <b>${(sim.agents.length - sim.residents).toLocaleString()}</b> from outside (simulated) · <b>${(sim.agents.length - s.away).toLocaleString()}</b> in the city now · <b>${s.moving.toLocaleString()}</b> on the move`;
  if (sim.day !== lastDay) { lastDay = sim.day; drawSpark(); }
  renderRail();
}

function resize() {
  const w = innerWidth, h = innerHeight, a = w / h;
  renderer.setSize(w, h);
  post.setSize(w, h);
  camera.left = (-VIEW_H * a) / 2; camera.right = (VIEW_H * a) / 2;
  camera.top = VIEW_H / 2; camera.bottom = -VIEW_H / 2;
  camera.updateProjectionMatrix();
  wires.setResolution(w, h);
  useMap.setResolution(w, h);
  toolbarBox = $('toolbar').getBoundingClientRect();
}

// ---- camera -----------------------------------------------------------------------------------------
// The Find them game sets state.camGoal; the camera glides there until the user drags or scrolls.
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
  if (state.speed) {
    peopleU.uIdle.value += dt;
    peopleU.uWalk.value += dt * clamp(state.speed / 20, 1, 3);
  }

  const hour = sim.minute / 60;
  shared.uHour.value = hour;
  {
    // The shadow box fits the view. Far out, it covers the ground in view up to the haze, so
    // that the shadows of the city and of the planes do not end in plain view; a texel of the
    // shadow map then stays smaller than a pixel.
    const vw = (camera.right - camera.left) / camera.zoom, vh = (camera.top - camera.bottom) / camera.zoom;
    lighting.setFocus(controls.target.x, controls.target.z, clamp(0.5 * Math.max(vw, vh / 0.55) * 0.9 + 12, 28, 400));
  }
  shared.uNight.value = lighting.update(hour, state.lift);
  wires.tick(hour, state.speed ? dt : 0);
  planes.update(sim.day % 7, sim.minute, dt, state.speed, state.explode > 0.3);
  flock.update(now / 1000, offsets, state.cut);
  updateGameRings();
  sound.update(sim.day % 7, sim.minute, state.speed, planes);
  glideCamera(dt);
  const dark = shared.uNight.value > 0.55;
  if (dark !== state.dark) {
    state.dark = dark;
    document.documentElement.style.setProperty('--title-ink', dark ? '#e9e1cf' : '#1c1b19');
    document.documentElement.style.setProperty('--title-ink-2', dark ? '#b9b2a2' : '#3f3b34');
  }

  controls.update();
  camera.updateMatrixWorld();
  peopleU.uPeopleScale.value = clamp(1.5 - 0.075 * camera.zoom, 1, 1.4);
  people.update(camera, state.cut, state.explode > 0.01, offsets);
  lamps.update(people.lit, dt);
  if (frameN % 3 === 0 && mouse.moved) updateHover();
  labels.update(camera, { explode: state.explode, cut: state.cut, dt, w: innerWidth, h: innerHeight, toolbar: toolbarBox });
  updateTags();
  clockT += dt;
  if (clockT > 0.25) { clockT = 0; updateClock(); }
  post.render(shared.uNight.value);
  requestAnimationFrame(frame);
}

// ---- Find them 尋人 (game.js) -----------------------------------------------------------------------
// A case keeps running with the model. The hints, the time taken and the found cases stay in
// this browser only (localStorage).
const game = { c: null, a: null, n: 0, t0: 0, solved: false, msg: '', back: null, notes: loadNotes(), ring: null, follow: null, following: false };
function loadNotes() { try { return JSON.parse(localStorage.getItem('kwc-find-v1')) || {}; } catch { return {}; } }
function saveNotes() { try { localStorage.setItem('kwc-find-v1', JSON.stringify(game.notes)); } catch { /* storage off */ } }
const when = () => `${WEEK[sim.day % 7]} ${fmtClock(sim.minute)}`;

// Flat rings of radius 1, scaled to the hint; they draw over the buildings.
function makeGameRings() {
  const circle = (color, inner) => {
    const m = new THREE.Mesh(new THREE.RingGeometry(inner, 1, 96).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true, opacity: 0.85 }));
    m.renderOrder = 10;
    m.visible = false;
    scene.add(m);
    return m;
  };
  game.ring = circle('#e7a43c', 0.97);
  game.follow = circle('#ff5c38', 0.72);
}

function clearHintMarks() {
  game.ring.visible = game.follow.visible = game.following = false;
  shared.uHint.value = NO_HI;
}

function openCase(c) {
  game.c = c;
  game.a = sim.agents.find(c.find);
  game.n = 0;
  game.t0 = performance.now();
  game.solved = false;
  game.msg = '';
  game.back = null;
  game.notes[c.key] = { hints: [], found: (game.notes[c.key] || {}).found || null };
  saveNotes();
  // The markers would give the person away.
  peopleU.uMarkers.value = 0;
  sim.select(-1);
  state.follow = false;
  clearHintMarks();
  setCut(-1);
  renderGame();
}

function closeCase() {
  if (!game.c) return;
  game.c = null;
  peopleU.uMarkers.value = 1;
  clearHintMarks();
}

function nextHint() {
  const c = game.c, h = gameHint(L, sim, c, game.a, game.n, sim.minute);
  game.notes[c.key].hints.push({ step: STEPS[game.n], text: h.text, page: h.page, at: when() });
  saveNotes();
  game.back = h.away ? h.back : null;
  if (h.away) { renderGame(); return; } // a hint that only says "outside" does not count
  if (h.ring) {
    game.ring.position.set(h.ring.x, 0.6, h.ring.z);
    game.ring.scale.set(h.ring.r, 1, h.ring.r);
    game.ring.visible = true;
    state.camGoal = { x: h.ring.x, y: 6, z: h.ring.z, zoom: 3.4 };
  }
  if (h.tower !== undefined) {
    shared.uHint.value = h.tower;
    const t = L.towers[h.tower], b = L.buildings[t.blocks[0]];
    state.camGoal = { x: b.cx, y: 10, z: b.cz, zoom: 5 };
  }
  if (h.cut !== undefined) setCut(h.cut);
  if (h.follow) game.following = true;
  game.n++;
  renderGame();
}

function checkPick(id) {
  if (id === game.a.id) {
    game.solved = true;
    const c = game.c;
    game.notes[c.key].found = { hints: game.n, ms: Math.round(performance.now() - game.t0), at: when() };
    saveNotes();
    clearHintMarks();
    peopleU.uMarkers.value = 1;
    sim.select(id);
    game.msg = '';
  } else {
    const d = sim.describe(sim.agents[id]);
    game.msg = `That is ${d.title}, ${d.role}. Look again: a wrong click costs nothing.`;
  }
  renderGame();
}

function updateGameRings() {
  if (!game.following || !game.a) return;
  const o = game.a.id * 4, P = sim.aP;
  game.follow.visible = P[o + 3] >= 0;
  if (!game.follow.visible) return;
  game.follow.position.set(P[o], P[o + 2] + offsets[clamp(P[o + 3], 0, 15) | 0] + 0.1, P[o + 1]);
  game.follow.scale.set(1.4, 1, 1.4);
}

function renderGame() {
  const body = $('game-body');
  if (!body) return;
  const esc = (t) => String(t).replace(/[&<>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[m]);
  const mmss = (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
  if (!game.c) {
    body.innerHTML = `<div>Three people of <i>City of Darkness Revisited</i> are somewhere in the City this week. Pick a case. The clock keeps running; you can stop it or move it.</div>
      ${CASES.map((c, i) => {
        const f = (game.notes[c.key] || {}).found;
        return `<button class="case${f ? ' done' : ''}" data-case="${i}"><b>${c.title.toUpperCase()} ${c.zh}</b><br>${c.name}${f ? ` · found ${f.at}, ${f.hints} hint${f.hints === 1 ? '' : 's'}, ${mmss(f.ms)}` : ''}</button>`;
      }).join('')}
      <div class="tt-s">Each case has five hints, each stronger than the one before. A click on the right person closes the case.</div>`;
    for (const el of body.querySelectorAll('[data-case]')) el.onclick = () => openCase(CASES[Number(el.dataset.case)]);
    return;
  }
  const c = game.c, notes = game.notes[c.key];
  const hints = notes.hints.map((h) => `<div class="hint"><span class="k">${h.step.toUpperCase()}</span>${esc(h.text)}${h.page ? ` <i>(${h.page})</i>` : ''} <i>· ${h.at}</i></div>`).join('');
  let foot;
  if (game.solved) {
    const r = game.a.real, f = notes.found;
    foot = `<div class="found">FOUND · ${esc(c.name)}</div>
      ${[c.who, c.looks, c.how].map(([t, page]) => `<div class="fact">${esc(t)} <i>(${page})</i></div>`).join('')}
      ${r.quotes.map((q) => `<div class="fact">“${esc(q.t)}” <i>${esc(q.src)}, ${esc(q.tag)}</i></div>`).join('')}
      ${c.place ? `<div class="fact"><i>${esc(c.place)}</i></div>` : ''}
      <div class="tt-s">hints used: ${f.hints} of 5 · time taken: ${mmss(f.ms)} · found ${f.at}</div>
      <div class="row"><button data-act="cases">ALL CASES</button></div>`;
  } else {
    foot = `<div class="row">
      ${game.n < 5 ? `<button data-act="hint">HINT ${game.n + 1}/5 · ${STEPS[game.n].toUpperCase()}</button>` : ''}
      ${game.back !== null ? `<button data-act="go">GO TO ${fmtClock(game.back)}</button>` : ''}
      <button data-act="cases">ALL CASES</button></div>
      ${game.msg ? `<div class="msg">${esc(game.msg)}</div>` : ''}`;
  }
  body.innerHTML = `<h3>${c.title.toUpperCase()} ${c.zh} · ${esc(c.name)}</h3>
    ${hints || '<div class="tt-s">No hints yet. Look for him, or ask for the first hint.</div>'}${foot}`;
  $('game').scrollTop = $('game').scrollHeight;
  for (const el of body.querySelectorAll('[data-act]'))
    el.onclick = () => {
      const act = el.dataset.act;
      if (act === 'hint') nextHint();
      else if (act === 'go') { sim.jumpTo(game.back + 1); game.back = null; renderGame(); }
      else { closeCase(); renderGame(); }
    };
}

init().catch((err) => {
  console.error(err);
  $('loading').textContent = `FAILED TO BUILD: ${err.message}`;
});
