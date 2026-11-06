// The main app (index.html): Kowloon Walled City (九龍城寨) in December 1986, on the definitive
// 3D structure (src/city/ for the City, src/surroundings/ for the ground and the buildings round
// it; docs/structure.md). The City is drawn as floor layers (cityLayers.js): the tool E pulls
// the floors apart, and the storey rail peels the City to one storey. A click on a building
// gives its facts and the uses of its rooms in December 1986 (data/room_uses.json).
// The people, the street names, the numbers of the 1992 map and the game Find them sat on the
// old city of the main app. They come back when they move onto this structure.
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
import { RoomUses } from './roomUses.js';
import { panelHtml, buildingTip, roomTip, placesByBuilding } from './buildingPanel.js';
import { notesHtml } from './notes.js';
import { Lighting } from './env.js';
import { Post } from './post.js';
import { Planes } from './planes.js';
import { clamp, fmtClock } from './util.js';

const START_MINUTE = 9 * 60 + 45;
// The speeds of the clock: pause, then one, two and three arrows.
const SPEEDS = [0, 1, 60, 2400];
const DONGZHI = 6; // the day of 冬至 (the winter solstice), Monday 22 December 1986
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
  camera.zoom = 1.15;
}

// explode: the floors apart, 0 to 1 (eased toward explodeTarget); peel: the storey that the
// City is peeled to, -1 for none; sel: the selected building, -1 for none, with its room
// (selRoom: { k, u } or null); hover: the building under the pointer.
const state = { explode: 0, explodeTarget: 0, lift: 0, zf: 1, peel: -1, speed: SPEEDS[1], lastSpeed: SPEEDS[1], sel: -1, selRoom: null, hover: -1, dark: false };
// The clock of the week: day 0 is Tuesday 16 December 1986.
const clock = { minute: START_MINUTE, day: 0 };
let S, layers, uses, places, lighting, planes, maxStorey = 0, storeyCount = [];

async function init() {
  await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 20)));
  const names = ['plan', 'businesses', 'book', 'book_overlay', 'context', 'terrain', 'structure_fixes', 'plan_fine', 'structure_choices', 'surroundings', 'room_uses'];
  const D = Object.fromEntries(await Promise.all(names.map((n) => fetch(`./data/${n}.json`).then((r) => r.json()).then((j) => [n, j]))));
  // the structure, as the structure viewer builds it (structureViewer.js): the corrections of
  // data/structure_fixes.json on the fine plan, and the kept random choices
  const { plan, overlay } = applyFixes(D.plan, D.book_overlay, D.structure_fixes, D.plan_fine);
  D.book.overlay = overlay;
  const site = buildSite(plan);
  const L = buildLayout(site, plan, D.businesses, D.book, null); // the City does not depend on its surroundings
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
  lighting = new Lighting(scene, new THREE.Vector3(0, 20, 0), site);
  planes = new Planes(scene);

  // The plates of the floor layers use the pixel font: wait for it, but not for ever.
  await Promise.race([document.fonts.load('32px Silkscreen'), new Promise((r) => setTimeout(r, 3000))]).catch(() => {});
  layers.makeTags('Silkscreen, monospace');

  buildUI();
  resize();
  setOffsets(0);
  $('loading').classList.add('done');
  window.kwc = { S, layers, uses, state, clock, camera, controls, renderer, setPeel, setExplode, selectBuilding };
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
function selectBuilding(b, room = null) {
  state.sel = b;
  state.selRoom = b >= 0 ? room : null;
  layers.setSelected(b);
  renderPanel();
}

function renderPanel() {
  const el = $('bld');
  el.hidden = state.sel < 0;
  if (el.hidden) { delete el.dataset.id; return; }
  const body = $('bld-body'), top = body.scrollTop, same = el.dataset.id === String(state.sel);
  body.innerHTML = panelHtml(S, uses, places, state.sel, state.peel, state.selRoom);
  body.scrollTop = same ? top : 0;
  el.dataset.id = state.sel;
  placePanel();
}

// The panel goes at the foot of the screen, right of the clock; on a narrow screen, above the
// clock. It never covers the clock or the rail, and a long panel scrolls.
function placePanel() {
  const el = $('bld');
  if (el.hidden) return;
  const box = (id) => $(id).getBoundingClientRect();
  const clk = box('clock'), rail = box('rail'), tools = box('toolbar'), s = el.style, gap = 14;
  const from = clk.right + gap, right = rail.left - gap;
  if (right - from >= 240) {
    Object.assign(s, { left: `${from}px`, width: `${Math.min(440, right - from)}px`, bottom: `${gap}px` });
    s.maxHeight = `${Math.min(innerHeight * 0.55, innerHeight - 120)}px`;
  } else {
    const bottom = innerHeight - clk.top + 8, left = clk.left, top = tools.bottom + 8;
    Object.assign(s, { left: `${left}px`, width: `${Math.min(rail.left - 8, clk.right) - left}px`, bottom: `${bottom}px` });
    s.maxHeight = `${Math.max(120, innerHeight - bottom - top)}px`;
  }
}

// ---- picking ----------------------------------------------------------------------------------
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const mouse = { x: -1, y: -1, moved: false, inside: false };

// What is under the pointer: { b, k, kind, room } or null. room: the room of a floor that
// shows from above (pulled apart, or the peeled storey), { k, u }.
function pickAt() {
  const hit = layers.pick(renderer, camera, mouse.x, mouse.y, innerWidth, innerHeight);
  if (!hit) return null;
  const B = S.list[hit.b];
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
  state.hover = hit ? hit.b : -1;
  layers.setHover(state.hover);
  if (!hit) { hideTooltip(); return; }
  const click = `<div class="tt-s">${hit.b === state.sel ? 'click to deselect the building' : 'click to select the building and see its floors'}</div>`;
  showTooltip((hit.room ? roomTip(S, uses, hit.b, hit.room) : buildingTip(S, hit.b)) + click);
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
function buildUI() {
  $('src-body').innerHTML = notesHtml(S, uses);
  $('t-explode').onclick = () => setExplode(state.explodeTarget < 0.5);
  $('src-btn').onclick = () => ($('sources').hidden = !$('sources').hidden);
  $('src-close').onclick = () => ($('sources').hidden = true);
  // The panel of the selected building: the x deselects it, and a storey peels the City there.
  $('bld-close').onclick = () => selectBuilding(-1);
  $('bld-body').addEventListener('click', (ev) => {
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
  $('clk-stats').innerHTML = `<b>${S.list.length}</b> buildings · <b>${S.unitNode.size.toLocaleString()}</b> rooms and flats · <b>${S.doors.length.toLocaleString()}</b> doors and links`
    + '<br>The people of the week come back later, on this structure.';

  buildRail();
  renderRail();

  const pointAt = (ev) => {
    mouse.x = ev.clientX; mouse.y = ev.clientY;
    ndc.set((ev.clientX / innerWidth) * 2 - 1, -(ev.clientY / innerHeight) * 2 + 1);
  };
  canvas.addEventListener('pointermove', (ev) => { pointAt(ev); mouse.moved = true; mouse.inside = true; });
  canvas.addEventListener('pointerleave', () => { mouse.inside = false; state.hover = -1; hideTooltip(); });
  let down = null;
  canvas.addEventListener('pointerdown', (ev) => { down = [ev.clientX, ev.clientY]; });
  // A click selects the building under the pointer (and the room, where the floor shows), and a
  // click on the ground or the sky lets go. Only the main button clicks: the right one pans.
  canvas.addEventListener('pointerup', (ev) => {
    if (!down || ev.button !== 0 || Math.hypot(ev.clientX - down[0], ev.clientY - down[1]) > 4) return;
    pointAt(ev); // a tap has no move before it
    const hit = pickAt();
    if (!hit) selectBuilding(-1);
    else if (hit.b === state.sel && !hit.room) selectBuilding(-1);
    else selectBuilding(hit.b, hit.room || null);
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
    else if (k === 'escape') {
      // the first Esc closes the sources panel if it is open, or else lets go of the selected
      // building; the next one takes the peel away
      if (!$('sources').hidden) $('sources').hidden = true;
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
  $('clock').classList.toggle('run', s > 0);
}

// How long a day of the clock takes at speed s, in words.
function dayIn(s) {
  const t = 86400 / s;
  return t >= 3600 ? `${+(t / 3600).toFixed(1)} hours` : t >= 60 ? `${+(t / 60).toFixed(1)} minutes` : `${Math.round(t)} seconds`;
}

// The storey rail: the whole City (RF), then each storey. The bar of a storey: the share of the
// buildings that have it.
const railRows = [];
function buildRail() {
  const ol = $('levels');
  const row = (label, k) => {
    const li = document.createElement('li'), b = document.createElement('button');
    b.innerHTML = `<span>${label}</span><span class="occ"><i></i></span>`;
    b.onclick = () => setPeel(k === -1 || k === state.peel ? -1 : k);
    li.appendChild(b);
    ol.appendChild(li);
    railRows.push({ k, label, b, bar: b.querySelector('i') });
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
    r.bar.style.height = `${Math.round((n / S.list.length) * 100)}%`;
    r.b.title = r.k === -1 ? 'The whole City, to the roofs (Esc).' : `${r.label}: ${n} of ${S.list.length} buildings have this storey. Click to peel the City to it (arrow keys: up and down).`;
  }
}

// The day under the clock: the night shaded, the hours marked. A click sets the time.
function drawDay() {
  const c = $('spark-c'), g = c.getContext('2d');
  g.clearRect(0, 0, c.width, c.height);
  g.fillStyle = 'rgba(40,40,60,0.14)';
  g.fillRect(0, 0, (6.95 / 24) * c.width, c.height); // sunrise about 06:57 (env.js)
  g.fillRect((17.75 / 24) * c.width, 0, c.width, c.height); // sunset about 17:45
  g.fillStyle = '#6b6457';
  g.font = '9px "IBM Plex Mono", monospace';
  for (let h = 0; h < 24; h++) g.fillRect((h / 24) * c.width, c.height - (h % 6 ? 4 : 9), 1, h % 6 ? 4 : 9);
  for (const h of [6, 12, 18]) g.fillText(String(h).padStart(2, '0'), (h / 24) * c.width + 2, 10);
}

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
function updateClock() {
  const [hh, mm] = fmtClock(clock.minute).split(':');
  $('clk-h').textContent = hh;
  $('clk-m').textContent = mm;
  const d = new Date(Date.UTC(1986, 11, 16 + (clock.day % 7)));
  $('clk-date').textContent = `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}${clock.day % 7 === DONGZHI ? ' · 冬至' : ''}`;
  $('playhead').style.left = `${(clock.minute / 1440) * 100}%`;
}

function resize() {
  const w = innerWidth, h = innerHeight, a = w / h;
  renderer.setSize(w, h);
  post.setSize(w, h);
  camera.left = (-VIEW_H * a) / 2; camera.right = (VIEW_H * a) / 2;
  camera.top = VIEW_H / 2; camera.bottom = -VIEW_H / 2;
  camera.updateProjectionMatrix();
  placePanel();
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

  clock.minute += (dt * state.speed) / 60;
  while (clock.minute >= 1440) { clock.minute -= 1440; clock.day++; }
  const hour = clock.minute / 60;
  {
    // The shadow box fits the view: a texel of the shadow map stays smaller than a pixel.
    const vw = (camera.right - camera.left) / camera.zoom, vh = (camera.top - camera.bottom) / camera.zoom;
    lighting.setFocus(controls.target.x, controls.target.z, clamp(0.5 * Math.max(vw, vh / 0.55) * 0.9 + 12, 28, 400));
  }
  const night = lighting.update(hour, state.lift);
  planes.update(clock.day % 7, clock.minute, dt, state.speed, state.explode > 0.3, night);
  const dark = night > 0.55;
  if (dark !== state.dark) {
    state.dark = dark;
    document.documentElement.style.setProperty('--title-ink', dark ? '#e9e1cf' : '#1c1b19');
    document.documentElement.style.setProperty('--title-ink-2', dark ? '#b9b2a2' : '#3f3b34');
  }

  controls.update();
  camera.updateMatrixWorld();
  layers.sizeTags(camera, innerHeight);
  if (frameN % 3 === 0 && mouse.moved) updateHover();
  clockT += dt;
  if (clockT > 0.25) { clockT = 0; updateClock(); }
  post.render(night);
  requestAnimationFrame(frame);
}

init().catch((err) => {
  console.error(err);
  $('loading').textContent = `FAILED TO BUILD: ${err.message}`;
});
