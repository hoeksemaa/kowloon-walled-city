// The main app (index.html): Kowloon Walled City (九龍城寨) in December 1986, on the definitive
// 3D structure (src/city/ for the City, src/surroundings/ for the ground and the buildings round
// it; docs/structure.md). The City is drawn as floor layers (cityLayers.js): the tool of the
// floors (key E) pulls the floors apart, and a storey of it peels the City to that storey. A click on a building gives
// its facts and the uses of its rooms in December 1986 (data/room_uses.json). One design for
// every screen, mobile first (style.css).
// The people of the week walk on the structure (src/life/): the real people of data/people.json
// with their days (data/routines.json), and an anonymous crowd that follows the counts of the
// sources. A click on a person gives their day; a real person also their story and sources.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildSite } from './site.js';
import { buildLayout } from './layout.js';
import { Terrain } from './terrain.js';
import { buildStructure, cityGround, floorName } from './city/model.js';
import { applyFixes } from './city/fixes.js';
import { makeChoices } from './city/choices.js';
import { KIND } from './city/mesh.js';
import { buildGround } from './surroundings/ground.js';
import { cityColors, groundColors } from './structureColors.js';
import { CityLayers } from './cityLayers.js';
import { RoomUses, esc } from './roomUses.js';
import { panelHtml, buildingTip, roomTip, placesByBuilding } from './buildingPanel.js';
import { notesHtml } from './notes.js';
import { Lighting } from './env.js';
import { Post } from './post.js';
import { Planes } from './planes.js';
import { clamp, fmtClock } from './util.js';
import { Nav } from './life/nav.js';
import { buildPopulation } from './life/population.js';
import { Life } from './life/sim.js';
import { Figures } from './life/figures.js';
import { LitWindows } from './life/windows.js';
import { Furnish, ITEM_KIND, thingsHtml } from './life/furnish.js';
import { Casebook } from './life/mysteries.js';
import { StreetNames } from './streetNames.js';
import { personHtml, personTip, homeHtml } from './life/personPanel.js';

const START_MINUTE = 9 * 60 + 45;
// The speeds of the clock: pause, then one, two and three arrows.
const SPEEDS = [0, 1, 60, 2400];
const $ = (id) => document.getElementById(id);

// Haze: things fade into the sky with distance from the centre of the City, from fogNear to
// fogFar (env.js), the same at every height. The world position comes from the view matrix,
// which has no scale: its inverse is the transpose of its rotation.
THREE.ShaderChunk.fog_pars_vertex = '#ifdef USE_FOG\nvarying vec2 vFogXZ;\n#endif';
THREE.ShaderChunk.fog_vertex = '#ifdef USE_FOG\nvFogXZ = ((mvPosition.xyz - viewMatrix[3].xyz) * mat3(viewMatrix)).xz;\n#endif';
THREE.ShaderChunk.fog_pars_fragment = '#ifdef USE_FOG\nuniform vec3 fogColor; varying vec2 vFogXZ;\nuniform float fogNear; uniform float fogFar;\n#endif';
THREE.ShaderChunk.fog_fragment = '#ifdef USE_FOG\nfloat fogFactor = smoothstep(fogNear, fogFar, length(vFogXZ));\ngl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);\n#endif';

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
controls.minZoom = 0.2;
controls.maxZoom = 28;
controls.minPolarAngle = 0.12;
controls.maxPolarAngle = 1.42;
const TARGET_Y = 28; // about the middle of the roofs, in mPD
{
  const az = Math.PI * 0.25, el = 0.58, d = 1400;
  controls.target.set(0, TARGET_Y, 0);
  camera.position.set(Math.sin(az) * Math.cos(el) * d, TARGET_Y + Math.sin(el) * d, Math.cos(az) * Math.cos(el) * d);
  // a tall screen (a phone) zooms out, thus the whole City shows across it
  camera.zoom = 1.15 * clamp(innerWidth / innerHeight / 1.1, 0.4, 1);
}

// explode: the floors apart, 0 to 1 (eased toward explodeTarget); peel: the storey that the
// City is peeled to, -1 for none; sel: the selected building, -1 for none, with its room
// (selRoom: { k, u } or null); hover: the building under the pointer.
// person: the selected person, -1 for none; follow: the view follows them.
const state = { explode: 0, explodeTarget: 0, lift: 0, zf: 1, peel: -1, speed: SPEEDS[1], lastSpeed: SPEEDS[1], sel: -1, selRoom: null, hover: -1, person: -1, follow: false };
// The clock of the week: day 0 is Monday 15 December 1986, day 6 Sunday 21 December.
const clock = { minute: START_MINUTE, day: 0 };
let S, layers, uses, places, lighting, planes, maxStorey = 0, storeyCount = [];
let pop, life, figures, furnish, cases, streets, windows, weather;

async function init() {
  await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 20)));
  const names = ['plan', 'businesses', 'book', 'book_overlay', 'context', 'terrain', 'structure_fixes', 'plan_fine', 'structure_choices', 'surroundings', 'room_uses', 'people', 'routines', 'furnishings', 'mysteries', 'utilities', 'weather'];
  const D = Object.fromEntries(await Promise.all(names.map((n) => fetch(`./data/${n}.json`).then((r) => r.json()).then((j) => [n, j]))));
  // the structure, as the structure viewer builds it (structureViewer.js): the corrections of
  // data/structure_fixes.json on the fine plan, and the kept random choices
  const { plan, overlay } = applyFixes(D.plan, D.book_overlay, D.structure_fixes, D.plan_fine);
  D.book.overlay = overlay;
  const site = buildSite(plan);
  const L = buildLayout(plan, D.businesses, D.book); // the City does not depend on its surroundings
  const T = new Terrain(D.terrain);
  S = buildStructure(L, T, { fixes: D.structure_fixes, choices: makeChoices(D.structure_choices) });
  uses = new RoomUses(D.room_uses);
  places = placesByBuilding(uses);
  maxStorey = Math.max(...S.list.map((b) => b.n)) - 1;
  storeyCount = Array.from({ length: maxStorey + 1 }, (_, k) => S.list.filter((b) => b.n > k).length);

  layers = new CityLayers(S, cityColors());
  scene.add(layers.group);
  const ground = buildGround(T, D.context, cityGround(S), D.surroundings, groundColors);
  scene.add(ground.group);
  layers.addOccluders([ground.terrain, ground.context]);
  // the things in the rooms and on the roofs (data/furnishings.json)
  furnish = new Furnish(S, uses, D.furnishings, layers, D.utilities);
  scene.add(furnish.group);
  // the people of the week
  const nav = new Nav(S);
  pop = buildPopulation(S, uses, nav, D.routines, D.people);
  weather = D.weather;
  life = new Life(S, uses, pop, { nav, utilities: D.utilities, weather });
  life.bedSlots = (key) => furnish.bedSlots(key); // the sleepers lie in the beds of their rooms
  figures = new Figures(life, layers);
  // the lit windows at night: a window glows where someone is awake in the room behind it
  windows = new LitWindows(S, life, uses);
  scene.add(windows.mesh);
  // the ten mysteries (data/mysteries.json)
  cases = new Casebook(D.mysteries, D.people, uses, life);
  scene.add(figures.mesh);
  lighting = new Lighting(scene, new THREE.Vector3(0, 20, 0), site);
  planes = new Planes(scene);

  // The plates of the floor layers use the pixel font: wait for it, but not for ever.
  await Promise.race([document.fonts.load('32px Silkscreen'), new Promise((r) => setTimeout(r, 3000))]).catch(() => {});
  layers.makeTags('Silkscreen, sans-serif');
  // the names of the streets of the City and of the roads round it (after the font: the plates use it)
  streets = new StreetNames(S, layers, D.context, (x, z) => T.h(x, z));
  scene.add(streets.group);

  buildUI();
  resize();
  setOffsets(0);
  const ld = $('loading');
  ld.classList.add('done');
  ld.addEventListener('transitionend', () => (ld.hidden = true), { once: true });
  $('theme-color').remove(); // the browser takes the colour of its bar from the page again
  window.kwc = { S, layers, uses, state, clock, camera, controls, renderer, setPeel, setExplode, selectBuilding, selectPerson, life, figures, pop, furnish, cases, windows };
  requestAnimationFrame(frame);
}

// ---- pull the floors apart ------------------------------------------------------------------
const ease = (t) => t * t * (3 - 2 * t);
function setExplode(on) {
  state.explodeTarget = on ? 1 : 0;
  $('t-explode').classList.toggle('on', on);
  $('t-explode').setAttribute('aria-pressed', String(on));
}

function setOffsets(e) {
  layers.setSpread(e);
  // Keep the model framed as it grows: lift the view and zoom out, relative to the user's own
  // zoom. Peeled, only the layers up to the peeled storey show.
  const H = state.peel >= 0 ? layers.lift[state.peel] : layers.maxLift;
  const lift = e * H * 0.5, d = lift - state.lift;
  state.lift = lift;
  camera.position.y += d;
  controls.target.y += d;
  const zf = 1 / (1 + (e * H) / 300);
  camera.zoom *= zf / state.zf;
  state.zf = zf;
  camera.updateProjectionMatrix();
}

// ---- peel to one storey ---------------------------------------------------------------------
// The storeys over c go, with all the roofs over storey c and all that is on them; the walls of
// storey c end a little over its floor (cityLayers.js). c = -1: the whole City.
function setPeel(c) {
  state.peel = c;
  layers.setPeel(c);
  if (state.explode > 0) setOffsets(ease(state.explode)); // frame the layers that show
  renderRail();
  renderPanel();
}

// Select building b, or none with -1; room: { k, u } of a room in it, or null.
function selectBuilding(b, room = null, thing = null) {
  state.sel = b;
  state.selRoom = b >= 0 ? room : null;
  state.thing = thing;
  const c = room && !room.roof && !room.out && cases.tryRoom(`${b}:${room.k}:${room.u}`);
  if (c) found(c);
  layers.setSelected(b);
  if (b >= 0) selectPerson(-1, false);
  renderPanel();
}

// Select person i, or none with -1.
function selectPerson(i, render = true) {
  state.person = i;
  state.follow = false;
  state.autoPeel = false;
  figures.select(i);
  const c = i >= 0 && cases.tryPerson(i);
  if (c) found(c);
  if (i >= 0 && state.sel >= 0) { state.sel = -1; state.selRoom = null; layers.setSelected(-1); }
  if (render) renderPanel();
}

function renderPanel() {
  const el = $('bld');
  const person = state.person >= 0;
  el.hidden = state.sel < 0 && !person;
  if (el.hidden) { delete el.dataset.id; return; }
  const id = person ? `p${state.person}` : String(state.sel);
  const body = $('bld-body'), top = body.scrollTop, same = el.dataset.id === id;
  $('bld-head').textContent = person ? 'SELECTED PERSON' : 'SELECTED BUILDING';
  body.innerHTML = person ? personHtml({ life, S, uses, pop, follow: state.follow }, state.person)
    : panelHtml(S, uses, places, state.sel, state.peel, state.selRoom?.roof || state.selRoom?.out ? null : state.selRoom, roomExtra());
  body.scrollTop = same ? top : 0;
  el.dataset.id = id;
}

// ---- the mysteries ----------------------------------------------------------------------------
// A case is solved: its circle is checked, a note says who was found, and the casebook opens at
// the story of the case.
function found(c) {
  const t = $('found');
  t.innerHTML = `<div class="f-h">FOUND · CASE ${c.n} OF ${cases.cases.length}</div><div>${cases.nameOf(c)}</div>`;
  t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
  clearTimeout(found.t);
  found.t = setTimeout(() => t.classList.remove('show'), 5000);
  cases.open = c.n;
  setTool('cases');
}

function renderCases() {
  if (!$('cases').hidden) $('cases-body').innerHTML = cases.html();
}

// "Show me": follow the person of a solved case, or peel to the room of a case of a room.
function showCase(c) {
  if (c.answer.type === 'room') {
    const [b, k, u] = c.answer.rooms[0].split(':').map(Number), B = S.list[b], unit = B.phaseOf(k).plan.units.find((x) => x.id === u);
    selectBuilding(b, { k, u });
    setPeel(k);
    if (unit) state.flyTo = new THREE.Vector3(unit.x, B.y[k], unit.z);
    return;
  }
  const i = cases.personOf(c);
  if (i < 0) return;
  selectPerson(i);
  state.follow = true;
  renderPanel();
}

// The things and the people of the selected room (or roof) for its panel.
function roomExtra() {
  const R = state.selRoom;
  const cut = state.sel >= 0 && life.cutsNow()?.has(state.sel) ? '<div class="sub">A power cut: the lights of this building are out. "The Walled City was often hit by power cuts" (Lam Po Chun (林寶鎮), p145), and houses shared one cable (p44). When, and for how long, is INFERRED.</div>' : '';
  if (!R) return cut;
  const B = S.list[state.sel], key = R.roof ? `roof:${B.id}` : R.out ? `out:${B.id}` : `${B.id}:${R.k}:${R.u}`;
  let html = R.roof ? `<h3>THE ROOF OF ${esc(B.label).toUpperCase()}</h3>` : '';
  html += thingsHtml(furnish, key, state.thing, esc);
  html = cut + html + homeHtml(life, pop, key, life.day);
  // a standpipe by the building (out:b): the people at it now
  const pipes = R.out ? life.pipes.filter((q) => q.b === B.id).map((q) => q.key) : [];
  const here = [];
  for (let i = 0; i < life.N; i++) { const s = life.state[i]; if (!s.trip && s.cur && (s.cur.key === key || pipes.includes(s.cur.key))) here.push(i); }
  if (here.length) {
    html += `<h3>${pipes.length ? 'AT THE STANDPIPE NOW' : 'WHO IS HERE NOW'} (${here.length})</h3>`;
    for (const i of here.slice(0, 8)) html += `<button class="who" data-person="${i}">${personTip(life, i, cases.hidden(i))}</button>`;
    if (here.length > 8) html += `<div class="sub">and ${here.length - 8} more</div>`;
  }
  return html;
}

// ---- picking ----------------------------------------------------------------------------------
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const mouse = { x: -1, y: -1, moved: false, inside: false };

// What is under the pointer: { b, k, kind, room } or null. room: the room of a floor that
// shows from above (pulled apart, or the peeled storey), { k, u }.
function pickAt() {
  const hit = layers.pick(renderer, camera, mouse.x, mouse.y, innerWidth, innerHeight);
  if (!hit || hit.person !== undefined) return hit;
  const B = S.list[hit.b];
  if (hit.kind === ITEM_KIND) {
    raycaster.setFromCamera(ndc, camera);
    const t = furnish.pick(layers, raycaster.ray, hit.b, hit.k);
    if (t) { hit.thing = t.thing; hit.thingKey = t.key; if (t.room) hit.room = t.room; }
    return hit;
  }
  const open = state.explode > 0.01 || hit.k === state.peel;
  const onFloor = hit.kind === KIND.FLOOR || hit.kind === KIND.PART || hit.kind === KIND.STAIR || (hit.kind === KIND.WALL && hit.k === state.peel);
  if (open && onFloor && hit.k < B.n) {
    raycaster.setFromCamera(ndc, camera);
    const p = layers.floorPoint(raycaster.ray, hit.b, hit.k), u = p && layers.roomAt(hit.b, hit.k, p);
    if (u !== null && u !== undefined) hit.room = { k: hit.k, u };
  } else if (hit.kind === KIND.HUT && B.roofRoom) hit.room = { k: B.n, u: 0 };
  return hit;
}

function updateHover() {
  if (!mouse.inside) return;
  mouse.moved = false;
  const hit = pickAt();
  state.hover = hit && hit.b !== undefined ? hit.b : -1;
  layers.setHover(state.hover);
  if (!hit) { hideTooltip(); return; }
  if (hit.person !== undefined) {
    showTooltip(`${personTip(life, hit.person, cases.hidden(hit.person))}<div class="tt-s">${hit.person === state.person ? 'click to let go of this person' : 'click to see their day'}</div>`);
    return;
  }
  const click = `<div class="tt-s">${hit.b === state.sel && !hit.room ? 'click to deselect the building' : hit.room ? 'click to see the room' : 'click to select the building and see its floors'}</div>`;
  const thing = hit.thing ? `<div class="tt-r">${esc(furnish.describe(hit.thing).label)}</div>` : '';
  showTooltip(thing + (hit.room ? roomTip(S, uses, hit.b, hit.room) : buildingTip(S, hit.b)) + click);
}

function showTooltip(html) {
  const t = $('tooltip');
  t.innerHTML = html;
  t.style.display = 'block';
  const w = t.offsetWidth, h = t.offsetHeight;
  let x = mouse.x + 16, y = mouse.y + 14;
  if (x + w > innerWidth - 90) x = mouse.x - w - 16;
  if (y + h > innerHeight - 10) y = mouse.y - h - 14;
  t.style.left = `${clamp(x, 8, Math.max(8, innerWidth - w - 8))}px`;
  t.style.top = `${clamp(y, 8, Math.max(8, innerHeight - h - 8))}px`;
}
function hideTooltip() {
  $('tooltip').style.display = 'none';
  layers.setHover(-1);
}

// ---- UI -------------------------------------------------------------------------------------------
// The menu button opens and closes the column of the tools (style.css: it comes down from the
// button). Each tool opens its own sheet, and one sheet of a tool is open at a time. The panel
// of the selected building or person stays under it.
const TOOLS = ['time', 'floors', 'cases', 'sources']; // each tool: the id of its sheet
const toolsOpen = () => document.body.classList.contains('tools-open');
function setTools(open) {
  document.body.classList.toggle('tools-open', open);
  $('menu-btn').setAttribute('aria-expanded', String(open));
}
let tool = null; // the tool whose sheet is open, or null
function setTool(name) {
  tool = name;
  for (const t of TOOLS) {
    $(t).hidden = t !== name;
    $(`ti-${t}`).setAttribute('aria-expanded', String(t === name));
  }
  setTools(false);
  if (name === 'cases') { renderCases(); $('cases').scrollTop = 0; }
  if (name === 'floors') railToSel();
}

function buildUI() {
  $('src-body').innerHTML = notesHtml(S, uses);
  $('t-explode').onclick = () => setExplode(state.explodeTarget < 0.5);
  // The menu button: from the keyboard, the focus goes to the first tool.
  $('menu-btn').onclick = (ev) => {
    setTools(!toolsOpen());
    if (toolsOpen() && ev.detail === 0) $(`ti-${TOOLS[0]}`).focus();
  };
  // A tool opens its sheet, or closes it if it is open; the column closes. From the keyboard,
  // the focus goes to the x of the sheet.
  for (const t of TOOLS) {
    $(`ti-${t}`).onclick = (ev) => {
      setTool(tool === t ? null : t);
      if (ev.detail === 0) (tool ? $(tool).querySelector('[data-close]') : $('menu-btn')).focus();
    };
  }
  document.querySelectorAll('.sheet [data-close]').forEach((b) => (b.onclick = (ev) => {
    setTool(null);
    if (ev.detail === 0) $('menu-btn').focus();
  }));
  // A touch or a click off the icons closes the column. The touch or the click then does its own
  // work (a tap on the City still selects).
  addEventListener('pointerdown', (ev) => {
    if (toolsOpen() && !ev.target.closest?.('#tools, #menu-btn')) setTools(false);
  }, true);
  addEventListener('focusin', (ev) => {
    if (toolsOpen() && !ev.target.closest?.('#tools, #menu-btn')) setTools(false);
  });
  // The panel of the selected building: the x deselects it, and a storey peels the City there.
  $('bld-close').onclick = () => { selectBuilding(-1); selectPerson(-1); };
  // The mysteries: a case shows its clues one at a time.
  $('cases-body').addEventListener('click', (ev) => {
    const el = ev.target.closest && ev.target.closest('[data-case], [data-more], [data-show]');
    if (!el) return;
    if (el.dataset.case !== undefined) cases.open = +el.dataset.case || null;
    else if (el.dataset.more) cases.more(+el.dataset.more);
    else if (el.dataset.show) {
      showCase(cases.cases.find((x) => x.n === +el.dataset.show));
      setTool(null); // the sheet goes, thus the City shows
    }
    renderCases();
    if (el.dataset.case !== undefined) $('cases').scrollTop = 0;
  });
  renderCases();
  $('bld-body').addEventListener('click', (ev) => {
    if (ev.target.closest && ev.target.closest('[data-follow]')) { state.follow = !state.follow; renderPanel(); return; }
    const who = ev.target.closest && ev.target.closest('[data-person]');
    if (who) { selectPerson(+who.dataset.person); return; }
    const el = ev.target.closest && ev.target.closest('[data-k]');
    if (el) setPeel(+el.dataset.k === state.peel ? -1 : +el.dataset.k);
  });

  $('speeds').querySelectorAll('button').forEach((b, i) => {
    const s = SPEEDS[i], t = s ? `${s}×: ${s === 1 ? 'real time' : `a day in ${dayIn(s)}`} (${i})` : 'Pause (Space)';
    b.title = t;
    b.setAttribute('aria-label', t);
    b.onclick = () => setSpeed(s);
  });
  setSpeed(state.speed);
  $('spark').onclick = (ev) => {
    const r = $('spark').getBoundingClientRect();
    clock.minute = clamp((ev.clientX - r.left) / r.width, 0, 0.999) * 1440;
  };
  drawDay();
  $('src-stats').innerHTML = `<b>${S.list.length}</b> buildings · <b>${S.unitNode.size.toLocaleString()}</b> rooms and flats · <b>${S.doors.length.toLocaleString()}</b> doors and links`
    + `<br><b>${pop.persons.length.toLocaleString()}</b> people of the week: ${pop.persons.filter((p) => p.kind === 'real').length} of them real people of the sources`;

  buildRail();
  renderRail();

  const pointAt = (ev) => {
    mouse.x = ev.clientX; mouse.y = ev.clientY;
    ndc.set((ev.clientX / innerWidth) * 2 - 1, -(ev.clientY / innerHeight) * 2 + 1);
  };
  // A finger has no hover: only a mouse or a pen shows the tooltip.
  canvas.addEventListener('pointermove', (ev) => { if (ev.pointerType === 'touch') return; pointAt(ev); mouse.moved = true; mouse.inside = true; });
  canvas.addEventListener('pointerleave', () => { mouse.inside = false; state.hover = -1; hideTooltip(); });
  // The pointers that are down, and whether two of them were down at one time (a pinch or a
  // two-finger pan): a gesture of two fingers is never a tap.
  const downs = new Map();
  let multi = false;
  canvas.addEventListener('pointerdown', (ev) => {
    if (ev.isPrimary) { downs.clear(); multi = false; } // a new gesture
    downs.set(ev.pointerId, [ev.clientX, ev.clientY]);
    if (downs.size > 1) multi = true;
  });
  canvas.addEventListener('pointercancel', (ev) => downs.delete(ev.pointerId));
  // A click selects the building under the pointer (and the room, where the floor shows), and a
  // click on the ground or the sky lets go. Only the main button clicks: the right one pans. A
  // finger can move a little more than a mouse in a tap. A tap that selects a building or a
  // person closes the sheet of the tool, thus the panel of the selection shows.
  canvas.addEventListener('pointerup', (ev) => {
    const down = downs.get(ev.pointerId);
    downs.delete(ev.pointerId);
    const slop = ev.pointerType === 'touch' ? 10 : 4;
    if (!down || multi || ev.button !== 0 || Math.hypot(ev.clientX - down[0], ev.clientY - down[1]) > slop) return;
    pointAt(ev); // a tap has no move before it
    const hit = pickAt();
    if (hit && tool) setTool(null);
    if (hit && hit.person !== undefined) selectPerson(hit.person === state.person ? -1 : hit.person);
    else if (!hit) { selectBuilding(-1); selectPerson(-1); }
    else if (hit.b === state.sel && !hit.room) selectBuilding(-1);
    else selectBuilding(hit.b, hit.room || (hit.thingKey?.startsWith('roof:') ? { k: S.list[hit.b].n, roof: true } : hit.thingKey?.startsWith('out:') ? { k: 0, out: true } : null), hit.thing || null);
  });
  // A mouse click on a button does not keep the keyboard focus on it, thus Space then runs or
  // stops the clock and does not press the button again.
  addEventListener('click', (ev) => {
    const el = document.activeElement;
    if (ev.detail > 0 && el && el !== document.body && el.matches('button')) el.blur();
  });
  addEventListener('keydown', (ev) => {
    if (ev.target.closest && ev.target.closest('input, textarea')) return;
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    const k = ev.key.toLowerCase();
    if ((k === ' ' || k === 'enter') && ev.target.closest && ev.target.closest('button')) return;
    if (k === 'e') $('t-explode').click();
    else if (k === 'm') setTools(!toolsOpen());
    else if (k === 'escape') {
      // the first Esc closes the column of the tools or the sheet of a tool if one is open, or
      // else lets go of the selected person or building; the next one takes the peel away
      if (toolsOpen()) { setTools(false); $('menu-btn').focus(); }
      else if (tool) setTool(null);
      else if (state.person >= 0) selectPerson(-1);
      else if (state.sel >= 0) selectBuilding(-1);
      else setPeel(-1);
    } else if (k === ' ') { ev.preventDefault(); setSpeed(state.speed ? 0 : state.lastSpeed); }
    else if (k === '1' || k === '2' || k === '3') setSpeed(SPEEDS[Number(k)]);
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); setPeel(state.peel < 0 ? -1 : state.peel + 1 > maxStorey ? -1 : state.peel + 1); }
    else if (ev.key === 'ArrowDown') { ev.preventDefault(); setPeel(state.peel < 0 ? maxStorey : Math.max(0, state.peel - 1)); }
  });
  addEventListener('resize', resize);
}

function setSpeed(s) {
  if (state.speed) state.lastSpeed = state.speed;
  state.speed = s;
  $('speeds').querySelectorAll('button').forEach((b, i) => {
    b.classList.toggle('on', SPEEDS[i] === s);
    b.setAttribute('aria-pressed', String(SPEEDS[i] === s));
  });
  $('title').classList.toggle('run', s > 0);
}

// How long a day of the clock takes at speed s, in words.
function dayIn(s) {
  const t = 86400 / s;
  return t >= 3600 ? `${+(t / 3600).toFixed(1)} hours` : t >= 60 ? `${+(t / 60).toFixed(1)} minutes` : `${Math.round(t)} seconds`;
}

// The storey rail: the whole City (RF), then each storey.
const railRows = [];
function buildRail() {
  const ol = $('levels');
  const row = (label, k) => {
    const li = document.createElement('li'), b = document.createElement('button');
    b.innerHTML = `<span>${label}</span>`;
    b.onclick = () => setPeel(k === -1 || k === state.peel ? -1 : k);
    li.appendChild(b);
    ol.appendChild(li);
    railRows.push({ k, label, b });
  };
  row('RF', -1);
  for (let k = maxStorey; k >= 0; k--) {
    row(floorName(k), k);
    if (k === 1) {
      const sep = document.createElement('li');
      sep.className = 'sep';
      ol.appendChild(sep);
    }
  }
}
function renderRail() {
  for (const r of railRows) {
    const n = r.k === -1 ? S.list.length : storeyCount[r.k];
    r.b.className = ['has', (r.k === -1 ? state.peel < 0 : r.k === state.peel) ? 'sel' : '', state.peel >= 0 && r.k > state.peel ? 'above' : ''].join(' ');
    r.b.title = r.k === -1 ? 'The whole City, to the roofs (Esc).' : `${r.label}: ${n} of ${S.list.length} buildings have this storey. Click to peel the City to it (arrow keys: up and down).`;
  }
  railToSel();
}
// The storeys are one row that scrolls: the selected storey goes to its middle.
function railToSel() {
  const ol = $('levels'), li = ol.querySelector('button.sel')?.parentElement;
  if (tool !== 'floors' || !li) return;
  ol.scrollTo({ left: li.offsetLeft - ol.offsetLeft - (ol.clientWidth - li.offsetWidth) / 2, behavior: 'smooth' });
}

// The day under the clock: the night shaded, the hours marked. A click sets the time.
function drawDay() {
  const c = $('spark-c'), g = c.getContext('2d');
  g.clearRect(0, 0, c.width, c.height);
  g.fillStyle = 'rgba(40,40,60,0.14)';
  g.fillRect(0, 0, (6.95 / 24) * c.width, c.height); // sunrise about 06:57 (env.js)
  g.fillRect((17.75 / 24) * c.width, 0, c.width, c.height); // sunset about 17:45
  g.fillStyle = '#6b6457';
  g.font = '8px Silkscreen, sans-serif';
  for (let h = 0; h < 24; h++) g.fillRect((h / 24) * c.width, c.height - (h % 6 ? 4 : 9), 1, h % 6 ? 4 : 9);
  for (const h of [6, 12, 18]) g.fillText(String(h).padStart(2, '0'), (h / 24) * c.width + 2, 10);
}

// ---- the weather of the day (data/weather.json: the Hong Kong Observatory (香港天文台)) ----
// The cloud: the share of the day without sun, 1 - hours of sun / 10.8 (the length of the day
// in this week, env.js). The same cloud all day is INFERRED.
const DAY_H = 10.8;
const cloudOf = (dow) => { const w = weather?.days?.[dow]; return w ? clamp(1 - w.sunH / DAY_H, 0, 1) : 0; };
// The line of the tool of the time: the sky, the temperatures, the rain and the humidity of the day.
function weatherLine(dow) {
  const w = weather?.days?.[dow];
  if (!w) return '';
  const sky = w.sunH >= 7 ? `sunny, ${w.sunH} h of sun` : w.sunH > 0 ? `mostly grey, ${w.sunH} h of sun` : 'grey, no sun';
  const rain = w.rain === 'trace' ? 'a trace of rain' : w.rain > 0 ? `${w.rain} mm of rain` : 'dry';
  return `<b>${w.minC}–${w.maxC} °C</b> · ${sky} · ${rain} · humidity ${w.rh}%`;
}

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
function updateClock() {
  const [hh, mm] = fmtClock(clock.minute).split(':');
  $('t-h').textContent = hh;
  $('t-m').textContent = mm;
  const d = new Date(Date.UTC(1986, 11, 15 + (clock.day % 7)));
  $('t-date').textContent = `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  $('t-paused').textContent = state.speed ? '' : ' · PAUSED';
  const dow = clock.day % 7;
  if (updateClock.dow !== dow) { updateClock.dow = dow; $('wx').innerHTML = weatherLine(dow); }
  $('playhead').style.left = `${(clock.minute / 1440) * 100}%`;
}

function resize() {
  const w = innerWidth, h = innerHeight, a = w / h;
  renderer.setSize(w, h);
  post.setSize(w, h);
  camera.left = (-VIEW_H * a) / 2; camera.right = (VIEW_H * a) / 2;
  camera.top = VIEW_H / 2; camera.bottom = -VIEW_H / 2;
  camera.updateProjectionMatrix();
}

// An open sheet (of a tool, or of the selected building or person) covers the foot of the
// screen (on a wide screen, the right of it). The view moves by half of it, thus the middle of
// the view is the middle of the part of the screen that shows. [x, y] in pixels: the City moves
// left by x / 2 and up by y / 2. The title box and the menu button are small: the City shows
// round them.
const shift = [0, 0];
function sheetCover() {
  const c = [0, 0];
  for (const id of ['bld', ...TOOLS]) {
    const el = $(id);
    if (el.hidden) continue;
    const r = el.getBoundingClientRect();
    if (r.left > 1) c[0] = Math.max(c[0], innerWidth - r.left);
    else c[1] = Math.max(c[1], innerHeight - r.top);
  }
  return c;
}
// The frustum of the camera, moved by shift. The middle of a frustum does not change with the
// zoom, thus the move in world units is the move in pixels times the world units in a pixel.
function frameView(dt) {
  const c = sheetCover(), k = 1 - Math.exp(-dt * 8);
  for (const i of [0, 1]) shift[i] = Math.abs(c[i] - shift[i]) < 0.5 ? c[i] : shift[i] + (c[i] - shift[i]) * k;
  const a = innerWidth / innerHeight, u = VIEW_H / (innerHeight * camera.zoom);
  const ox = (shift[0] / 2) * u, oy = -(shift[1] / 2) * u;
  camera.left = (-VIEW_H * a) / 2 + ox; camera.right = (VIEW_H * a) / 2 + ox;
  camera.top = VIEW_H / 2 + oy; camera.bottom = -VIEW_H / 2 + oy;
  camera.updateProjectionMatrix();
}

// ---- loop -------------------------------------------------------------------------------------------
let last = performance.now(), frameN = 0, clockT = 0, personT = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  frameN++;
  const prev = state.explode;
  state.explode += (state.explodeTarget - state.explode) * (1 - Math.exp(-dt * 3.0));
  if (Math.abs(state.explodeTarget - state.explode) < 1e-3) state.explode = state.explodeTarget;
  if (state.explode !== prev) setOffsets(ease(state.explode));

  clock.minute += (dt * state.speed) / 60;
  while (clock.minute >= 1440) { clock.minute -= 1440; clock.day++; }
  const hour = clock.minute / 60;
  {
    // The shadow box fits the view: a texel of the shadow map stays smaller than a pixel.
    const vw = (camera.right - camera.left) / camera.zoom, vh = (camera.top - camera.bottom) / camera.zoom;
    lighting.setFocus(controls.target.x, controls.target.z, clamp(0.5 * Math.max(vw, vh / 0.55) * 0.9 + 12, 28, 400));
  }
  lighting.setCloud(cloudOf(clock.day % 7));
  const night = lighting.update(hour, state.lift);
  planes.update(clock.day % 7, clock.minute, dt, state.speed, state.explode > 0.3, night);

  // the people: where each one is at this minute
  life.update(clock.day % 7, clock.minute, 4);
  figures.update(now / 1000);
  const mPerPx = (camera.top - camera.bottom) / camera.zoom / innerHeight;
  const done = furnish.doneTo;
  furnish.update(mPerPx);
  if (furnish.doneTo !== done) life.refreshBeds(); // more rooms have their beds
  layers.setTier(mPerPx);
  windows.update(night, layers.spread < 0.01 && layers.peelK < 0);
  if (state.person >= 0 && state.follow) {
    const h = figures.head(state.person);
    if (h) {
      const d = h.sub(controls.target).multiplyScalar(1 - Math.exp(-dt * 4));
      controls.target.add(d); camera.position.add(d);
    }
    // Inside a building the view peels the City to the person's storey, and lets go of the
    // peel when they come out to the lanes or the roofs.
    const i = state.person, k = Math.round(life.misc[i * 4 + 1]), inside = life.misc[i * 4 + 3] === 1;
    if (state.explode < 0.5) {
      if (inside && state.peel !== k) { state.autoPeel = true; setPeel(k); }
      else if (!inside && state.autoPeel && state.peel >= 0) { state.autoPeel = false; setPeel(-1); }
    }
  }
  if (state.flyTo) {
    const d = state.flyTo.clone().sub(controls.target);
    if (d.length() < 0.2) state.flyTo = null;
    else { d.multiplyScalar(1 - Math.exp(-dt * 4)); controls.target.add(d); camera.position.add(d); }
  }
  personT += dt;
  if ((state.person >= 0 && personT > 0.5) || (state.selRoom && personT > 2)) { personT = 0; renderPanel(); }

  controls.update();
  frameView(dt);
  camera.updateMatrixWorld();
  layers.sizeTags(camera, innerHeight);
  streets.update(camera, innerHeight);
  if (frameN % 3 === 0 && mouse.moved) updateHover();
  clockT += dt;
  if (clockT > 0.25) { clockT = 0; updateClock(); }
  post.render(night);
  requestAnimationFrame(frame);
}

init().catch((err) => {
  console.error(err);
  $('loading').classList.add('failed');
  $('ld-text').textContent = `FAILED TO BUILD THE CITY: ${err.message}`;
});
