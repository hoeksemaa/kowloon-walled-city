// One layer of labels for the buildings: the street names, the numbers of the places of the
// 1992 map, the names of the real roads round the City, the north arrow, the storey labels of
// the layered view and the cut tag. Each is the same plate, dark with light pixel ink, laid flat on a
// surface of the model ("plan lettering"). A plate is part of one storey (levels[k].group): it
// moves with its storey in the layered view, it dims with it (dim.js), and it never rises
// above the section of a cut.
//
// A plate lies on the highest open surface over its anchor:
// - In the normal view, a street name lies along its lane at the height of the roofs beside
//   it, with thin lines down to the lane floor. The lanes are 2-3 m wide between walls of
//   30-40 m, thus a name on the lane floor almost never shows. A number lies on the roof of
//   the building where the model puts its place.
// - With a cut storey, the names and the numbers lie on the section. A number on a lower
//   building lies on its roof.
// - In the layered view, the names lie on the section of the cut storey, or on the top of
//   G/F with no cut. A number lies on the top of its own storey; above the section it hides.
// - The name of a road outside the City lies on that road, in all views (placeRoad).
// A plate shows dim through a tower in front of it. Each frame sets the size of each plate, so
// that its text keeps a readable size on the screen at each zoom, and turns each name so that
// it does not read upside down.
import * as THREE from 'three';
import { STOREY } from './layout.js';
import { CUT_H } from './kinds.js';
import { withDim } from './dim.js';
import { NAME_STEP } from './context.js';
import { FADE_NEAR, FADE_FAR } from './env.js';
import { clamp, smoothstep } from './util.js';

// The ink stays under the threshold of the bloom (post.js), thus the plates do not glow at night.
const INK = '#ddd3b8', FRAME = 'rgba(221, 211, 184, 0.5)', PLATE = 'rgba(28, 27, 25, 0.92)';
const AMBER = '#e7a43c'; // the colour of the cut ring
const S = 4; // texels for each pixel of the design
const H = 11; // the height of a plate, in pixels of the design
const LATIN = `${8 * S}px Silkscreen, monospace`; // caps 5 px high
const CJK = `600 ${9 * S}px "PingFang TC", "Heiti TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif`;
const isCJK = (ch) => /[\u3400-\u9fff]/.test(ch);
const XRAY = 0.45; // the part of a plate that shows through a tower in front of it
// The plates draw as if this many metres nearer the camera: the aerials, tanks and huts of a
// roof, and the parapets of a lane, do not cut them. A tower in front still does. In units of
// the depth buffer (24 bits over the 6000 m of the camera, main.js).
const BIAS = 4 * (2 ** 24 / 6000);
const ON_ROOF = 1.0; // over the parapets (0.9 m, cityMesh.js)
const YAMEN_TOP = 6.6; // over the ridges of the Yamen halls (cityMesh.js)
const OVER = 0.08; // over the section, or over the top of a storey
const levelName = (k) => (k === 0 ? 'G/F' : `${k}/F`);
// The road names: two names of one road are at least SAME_ROAD metres apart. A name goes only
// where the camera sees nine tenths of the road under it (SEEN), and where other roads cross
// under no more than a third of it (CROSSED). It goes behind a ghost only if no place in clear
// view fits: the dither of the ghost blurs the small Chinese letters. ROAD_AGAIN: the seconds between two tests of what
// the camera sees, while the view moves; ROAD_MS: the milliseconds of a test in each frame.
const SAME_ROAD = 240, SEEN = 0.9, CROSSED = 0.34, ROAD_AGAIN = 0.12, ROAD_MS = 3;
// The level of a road name for the dim of the layered view (dim.js): above all storeys, thus it
// never dims. The roads under it do not dim either.
const NO_DIM = 1000;

// A plate with its words: the Latin in Silkscreen, the Chinese in a CJK face. bar: the amber
// bar of the cut tag. dashed: a dashed frame, for a place where the sources disagree.
function drawPlate(text, { bar = false, dashed = false, pad = 3 } = {}) {
  const runs = [];
  for (const ch of text) {
    const cjk = isCJK(ch), last = runs[runs.length - 1];
    if (last && last.cjk === cjk) last.t += ch;
    else runs.push({ cjk, t: ch });
  }
  const g0 = document.createElement('canvas').getContext('2d');
  let tw = 0;
  for (const r of runs) {
    g0.font = r.cjk ? CJK : LATIN;
    r.w = Math.ceil(g0.measureText(r.t).width / S);
    tw += r.w;
  }
  const left = bar ? pad + 4 : pad, w = tw + left + pad;
  const c = document.createElement('canvas');
  c.width = w * S;
  c.height = H * S;
  const g = c.getContext('2d');
  g.fillStyle = PLATE;
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = FRAME;
  const px = (x, y, a, b) => g.fillRect(x * S, y * S, a * S, b * S);
  if (dashed) {
    for (let x = 0; x < w; x += 4) { px(x, 0, 2, 1); px(x, H - 1, 2, 1); }
    for (let y = 0; y < H; y += 4) { px(0, y, 1, 2); px(w - 1, y, 1, 2); }
  } else {
    px(0, 0, w, 1); px(0, H - 1, w, 1); px(0, 1, 1, H - 2); px(w - 1, 1, 1, H - 2);
  }
  if (bar) { g.fillStyle = AMBER; px(2, 2, 2, H - 4); }
  g.fillStyle = INK;
  let x = left;
  for (const r of runs) {
    g.font = r.cjk ? CJK : LATIN;
    // the caps of the Latin from 3 to 8; the Chinese centred
    g.fillText(r.t, x * S, (r.cjk ? 8.7 : 8) * S);
    x += r.w;
  }
  return { canvas: c, w, h: H };
}

// The north arrow, on a square plate.
function drawNorth() {
  const n = 15, c = document.createElement('canvas');
  c.width = c.height = n * S;
  const g = c.getContext('2d');
  const px = (x, y, a, b) => g.fillRect(x * S, y * S, a * S, b * S);
  g.fillStyle = PLATE;
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = FRAME;
  px(0, 0, n, 1); px(0, n - 1, n, 1); px(0, 1, 1, n - 2); px(n - 1, 1, 1, n - 2);
  g.fillStyle = INK;
  // the arrow head, in rows of pixels, then the N
  for (let r = 0; r < 4; r++) px(7 - r, 2 + r, 1 + 2 * r, 1);
  g.font = LATIN;
  g.textAlign = 'center';
  g.fillText('N', 7.5 * S, 13 * S);
  return { canvas: c, w: n, h: n };
}

function texture(canvas, aniso) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter; // big pixels stay sharp when the view comes close
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.anisotropy = aniso;
  return t;
}

// Do two quads on the screen (corners in order) overlap, with a gap of pad pixels? The test of
// separating axes, on the normals of their edges.
function overlap(a, b, pad) {
  for (const q of [a, b])
    for (let e = 0; e < 2; e++) {
      const [x0, y0] = q[e], [x1, y1] = q[e + 1];
      const nx = y0 - y1, ny = x1 - x0, l = Math.hypot(nx, ny) || 1;
      let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity;
      for (const [x, y] of a) { const t = (x * nx + y * ny) / l; a0 = Math.min(a0, t); a1 = Math.max(a1, t); }
      for (const [x, y] of b) { const t = (x * nx + y * ny) / l; b0 = Math.min(b0, t); b1 = Math.max(b1, t); }
      if (a1 + pad < b0 || b1 + pad < a0) return false;
    }
  return true;
}

const UNIT = new THREE.PlaneGeometry(1, 1);
const _r = new THREE.Vector3(), _u = new THREE.Vector3(), _d = new THREE.Vector3(), _C = new THREE.Vector3();

// The share of a ground-plane line along (vx, vz) that the screen shows, never under 0.35: a
// plate that the view sees at a low angle grows, but only so far. _d: the view direction.
const fsOf = (vx, vz) => Math.max(0.35, Math.sqrt(Math.max(0, 1 - (vx * _d.x + vz * _d.z) ** 2)));

// The corners on the screen, in order, of a plate w by h metres with its centre at (x, y, z),
// its words along (ax, az).
function screenQuad(camera, view, x, y, z, ax, az, w, h) {
  const quad = [];
  for (const [i, j] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    _C.set(x + (ax * w * i + az * h * j) / 2, y, z + (az * w * i - ax * h * j) / 2).project(camera);
    quad.push([(_C.x * 0.5 + 0.5) * view.w, (-_C.y * 0.5 + 0.5) * view.h]);
  }
  return quad;
}

export class Labels {
  // levels: the storeys of main.js. runs: the runs of the real roads to name (roadRuns,
  // context.js). sight: what the camera sees of the ground (Sight, occlude.js). ghost: 1 for a
  // real building that is a ghost (Occlusion.hide). title(k): the words after the name of
  // storey k. mapStreets: the streets that only the 1992 map names (book_overlay.json). street:
  // the dark street round the City (context.js).
  constructor({ L, site, levels, runs, sight, ghost, mapStreets, title, aniso, street }) {
    this.L = L;
    this.mapStreets = mapStreets;
    this.levels = levels;
    this.aniso = aniso;
    this.title = title;
    this.list = [];
    this.on = true;
    this.mode = null;
    this.lit = null;
    this.cutTex = new Map();
    this.corners = [[L.x0, L.z0], [L.x0 + L.W, L.z0], [L.x0, L.z0 + L.D], [L.x0 + L.W, L.z0 + L.D]];
    this.polygon = site.polygon;
    this.sight = sight;
    this.ghost = ghost;
    this.clock = 0;
    this.frame = 0;
    // what the camera saw of the roads at the last test (seeRoads), and when
    this.road = { key: null, dir: new THREE.Vector3(), size: 0, at: -Infinity, ver: 0, dirty: true, pass: null };
    this.roads = [];

    for (const st of L.streets) this.addStreet(st);
    for (const p of L.places) this.addPlace(p);
    for (const run of runs) this.addRoad(run);
    // The north arrow lies on the street near its SE corner, clear of the roads; it turns with
    // true north.
    const north = this.add('north', drawNorth(), { prio: 9, solid: true });
    north.k = 0;
    north.y = OVER;
    north.x = L.x0 + L.W - 9;
    north.z = L.z0 + L.D - 9;
    while (street && north.x > 0 && !street.fits(north.x, north.z, 5.5)) north.x -= 0.5;
    north.axis = [-site.north[1], site.north[0]];
    // A storey label for each storey of the layered view, and the cut tag.
    for (const lv of levels) {
      const t = this.add('storey', drawPlate(`${levelName(lv.k)} ${title(lv.k)}`), { prio: 10, top: true });
      t.k = lv.k;
      t.y = lv.k * STOREY;
    }
    this.add('cut', drawPlate('CUT', { bar: true }), { prio: 10, top: true });
    this.order = [...this.list].sort((p, q) => q.prio - p.prio);
  }

  // A label: a plate mesh, and its second draw through what is in front of it.
  add(kind, plate, extra) {
    const uLevel = { value: 0 };
    const mat = (xray) => {
      const m = new THREE.MeshBasicMaterial({ map: plate.tex || texture(plate.canvas, this.aniso), transparent: true, depthWrite: false, fog: false });
      if (xray) m.depthFunc = THREE.GreaterDepth;
      m.polygonOffset = true;
      m.polygonOffsetUnits = -BIAS;
      m.onBeforeCompile = (s) => withDim(s, 'uLevel', uLevel);
      m.customProgramCacheKey = () => 'kwc-label';
      return m;
    };
    const mesh = new THREE.Mesh(UNIT, mat(false));
    const front = mesh.material;
    // The storey labels and the cut tag lie beside the City, among the blocks of the city
    // around it (env.js): those blocks do not hide them.
    if (extra.top) front.depthTest = false;
    plate.tex = front.map;
    const xray = new THREE.Mesh(UNIT, mat(true));
    xray.material.map = front.map;
    for (const m of [mesh, xray]) {
      m.matrixAutoUpdate = false;
      m.frustumCulled = false;
      m.visible = false;
    }
    mesh.renderOrder = 6;
    xray.renderOrder = 5;
    const lb = { kind, mesh, xray, uLevel, w: plate.w, h: plate.h, alpha: 0, want: false, flip: false, prio: 0, k: 0, y: 0, t: 0, ...extra };
    mesh.userData.label = lb;
    this.list.push(lb);
    return lb;
  }

  // A street name: on the straightest part of its lane near the place where its plan prints
  // it. Lung Chun Rd and Sai Shing Rd run on the old wall base (alley 3 in layout.js).
  addStreet(st) {
    const { L } = this, { W, D } = L;
    let cells = L.streetLanes[st.key];
    if (!cells || !cells.length) {
      cells = [];
      for (let k = 0; k < W * D; k++) {
        if (L.alley[k] !== 3) continue;
        const i = k % W, j = (k / W) | 0;
        const south = j > D * 0.62 || i >= W * 0.3; // as streetFrontages in layout.js
        if ((st.key === 'lcr') === south) cells.push(k);
      }
    }
    const ns = st.dir === 'ns';
    const along = (k) => (ns ? (k / W) | 0 : k % W), cross = (k) => (ns ? k % W : (k / W) | 0);
    const a0 = ns ? st.j : st.i, c0 = ns ? st.i : st.j;
    // The middle of the lane at each step along it, within 15 m of the name.
    const rows = new Map();
    for (const k of cells) {
      const a = along(k), c = cross(k);
      if (Math.abs(a - a0) > 15 || Math.abs(c - c0) > 12) continue;
      if (!rows.has(a)) rows.set(a, []);
      rows.get(a).push(c);
    }
    const pts = [...rows].map(([a, cs]) => [a, cs.reduce((s, v) => s + v, 0) / cs.length]);
    if (pts.length < 3) return;
    // A straight line through them (least squares), and the place on it nearest the name.
    const ma = pts.reduce((s, p) => s + p[0], 0) / pts.length, mc = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    let sxy = 0, sxx = 0;
    for (const [a, c] of pts) { sxy += (a - ma) * (c - mc); sxx += (a - ma) ** 2; }
    const slope = sxx ? sxy / sxx : 0;
    const lo = Math.min(...pts.map((p) => p[0])), hi = Math.max(...pts.map((p) => p[0]));
    const am = clamp(a0, lo + 4, hi - 4), cm = mc + slope * (am - ma);
    const [ci, cj] = ns ? [cm, am] : [am, cm];
    const x = L.x0 + ci + 0.5, z = L.z0 + cj + 0.5;
    const n = Math.hypot(1, slope), axis = ns ? [slope / n, 1 / n] : [1 / n, slope / n];
    // The name can slide along the lane, within the part of it that the line fits, to make room
    // for another label: metres along the axis from (x, z).
    const span = [(lo - am) * n, (hi - am) * n];
    const [en, zh] = [st.name.replace(/\s*[\u3400-\u9fff]+$/, ''), (st.name.match(/[\u3400-\u9fff]+$/) || [''])[0]];
    // The streets of the plan go before the numbers, and the numbers before the four streets
    // that only the 1992 map names.
    const lb = this.add('street', drawPlate(`${zh ? `${zh} ` : ''}${en.toUpperCase()}`), { prio: st.key in this.mapStreets ? 6 : 8.5, st, x, z, axis, span });
    lb.cells = cells;
    lb.roof = this.roofOver(x, z, axis, 15, 3);
    lb.lines = this.dropLines(2);
  }

  // A place of the 1992 map: on the building where the model puts it (layout.js bookPlaces),
  // or else on the building under its number on the map. A place in a lane lies over the lane.
  addPlace(p) {
    const { L } = this, B = L.buildings;
    const at = L.book[p.n] || (p.n === 29 && L.book.kindergarten);
    let b = at ? at.b : L.owner[p.k];
    let x = p.x, z = p.z, f = at ? at.f : p.floor ?? 0;
    if (p.n === 30 && L.standpipe) ({ x, z } = L.standpipe);
    if (b < 0 && p.n === 37) {
      // the Yamen: the hall nearest the number
      const halls = B.filter((q) => q.kind === 'yamen');
      b = halls.reduce((q, r) => (Math.hypot(r.cx - x, r.cz - z) < Math.hypot(q.cx - x, q.cz - z) ? r : q)).id;
    }
    if (b >= 0 && L.owner[Math.floor(z - L.z0) * L.W + Math.floor(x - L.x0)] !== b) ({ cx: x, cz: z } = B[b]);
    const lb = this.add('place', drawPlate(String(p.n), { dashed: !!p.conflict }), { prio: 8, p, b, x, z, f: b >= 0 ? Math.min(f, B[b].floors - 1) : 0 });
    // how far the map puts the number from here
    lb.off = Math.hypot(p.x - x, p.z - z);
    if (b < 0) {
      lb.roof = this.roofOver(x, z, [1, 0], 3, 3);
      lb.lines = this.dropLines(1);
    }
  }

  // The name of a run of a real road (roadRuns, context.js), with RD and ST for Road and Street
  // as in the street names of the City. Its place is new in each frame (placeRoad).
  addRoad(run) {
    const en = run.name.replace(/\bRoad\b/g, 'Rd').replace(/\bStreet\b/g, 'St').toUpperCase();
    const prefix = (a) => { const p = new Uint16Array(run.n + 1); for (let i = 0; i < run.n; i++) p[i + 1] = p[i] + a[i]; return p; };
    // The roads nearest the City go first. bad, veiled and crossed: running counts of the points
    // that the camera does not see, and that it does not see clear (seeRoads; none is seen
    // before the first test), and of the points at a junction. at: the point of
    // the run under the middle of the name, -1 for none.
    const lb = this.add('road', drawPlate(`${run.nameZh ? `${run.nameZh} ` : ''}${en}`), {
      prio: 4 - run.near / 1000, solid: true, run, k: 0, y: OVER, x: run.x[run.home], z: run.z[run.home],
      axis: [run.tx[run.home], run.tz[run.home]], bad: prefix(new Uint8Array(run.n).fill(1)), veiled: prefix(new Uint8Array(run.n).fill(1)), crossed: prefix(run.cross), at: -1, ver: -1, retry: 0,
    });
    this.roads.push(lb);
  }

  // The highest roof within r m of a line of half length h through (x, z).
  roofOver(x, z, [ax, az], h, r) {
    const { L } = this, B = L.buildings;
    let top = 0, k = 0;
    for (let dz = -h - r; dz <= h + r; dz++)
      for (let dx = -h - r; dx <= h + r; dx++) {
        const px = x + dx, pz = z + dz, t = dx * ax + dz * az;
        if (Math.abs(t) > h || Math.abs(dx * az - dz * ax) > r) continue;
        const o = L.owner[Math.floor(pz - L.z0) * L.W + Math.floor(px - L.x0)];
        if (o < 0 || o === undefined) continue;
        const y = B[o].kind === 'yamen' ? YAMEN_TOP : B[o].floors * STOREY + ON_ROOF;
        if (y > top) { top = y; k = B[o].floors - 1; }
      }
    return { y: Math.max(top, STOREY + ON_ROOF), k };
  }

  dropLines(n) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 6), 3));
    const m = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.7 }));
    m.frustumCulled = false;
    m.visible = false;
    return m;
  }

  // Where each plate lies, for the view: layered (the storeys apart) or not, and the cut.
  place(layered, cut) {
    const { levels } = this, B = this.L.buildings;
    const section = cut * STOREY + CUT_H + OVER;
    const topOf = (b, f) => (f === B[b].floors - 1 ? this.roofY(b) : (f + 1) * STOREY + OVER);
    // never above the section: the ridges of the Yamen rise over the section of 1/F
    const put = (lb, k, y) => {
      lb.k = k;
      lb.y = cut >= 0 ? Math.min(y, section) : y;
      lb.hidden = false;
    };
    for (const lb of this.list) {
      if (lb.kind === 'street' || (lb.kind === 'place' && lb.b < 0)) {
        if (cut >= 0) put(lb, cut, section);
        else if (layered) put(lb, 0, STOREY + OVER);
        else put(lb, lb.roof.k, lb.roof.y);
        lb.drop = !layered && cut < 0;
      } else if (lb.kind === 'place') {
        const top = B[lb.b].floors - 1;
        if (!layered) {
          if (cut >= 0 && cut <= top) put(lb, cut, section);
          else put(lb, top, this.roofY(lb.b));
        } else if (cut >= 0 && lb.f > cut) lb.hidden = true;
        else if (lb.f === cut) put(lb, cut, section);
        else put(lb, lb.f, topOf(lb.b, lb.f));
      } else if (lb.kind === 'cut') {
        if (cut >= 0) {
          if (!this.cutTex.has(cut)) {
            const plate = drawPlate(`CUT ${levelName(cut)} ${this.title(cut)}`, { bar: true });
            this.cutTex.set(cut, { w: plate.w, tex: texture(plate.canvas, this.aniso) });
          }
          const t = this.cutTex.get(cut);
          lb.mesh.material.map = lb.xray.material.map = t.tex;
          lb.w = t.w;
          put(lb, cut, layered ? cut * STOREY : section);
        }
      }
      const g = levels[lb.k].group;
      for (const o of [lb.mesh, lb.xray, lb.lines]) if (o && o.parent !== g) g.add(o);
      lb.uLevel.value = lb.kind === 'road' ? NO_DIM : lb.k;
    }
    if (this.lit) this.light(this.lit);
  }

  roofY(b) {
    const B = this.L.buildings[b];
    return B.kind === 'yamen' ? YAMEN_TOP : B.floors * STOREY + ON_ROOF;
  }

  // The height of the City on each of its cells, as it is drawn now: to the roof, to the section
  // of a cut, and with the storeys apart in the layered view (a storey and the gap under it
  // count as solid). For Sight (occlude.js).
  cityTops(cut) {
    const { L, levels } = this, B = L.buildings;
    if (!this.tops) this.tops = new Float32Array(L.W * L.D);
    const top = this.tops;
    let max = 0;
    for (let c = 0; c < top.length; c++) {
      const o = L.owner[c];
      let y = 0;
      if (o >= 0) {
        const last = B[o].floors - 1, k = cut >= 0 ? Math.min(last, cut) : last;
        y = levels[k].group.position.y + (k === cut ? k * STOREY + CUT_H : k === last ? this.roofY(o) : (k + 1) * STOREY);
      }
      top[c] = y;
      if (y > max) max = y;
    }
    return { x0: L.x0, z0: L.z0, W: L.W, D: L.D, top, max };
  }

  // Which points of each road the camera sees: the point in the middle of the road and a point
  // to each side of it, a quarter of the height of its name away (thus the words). A point of the
  // road is bad if the camera does not see one of the three, and veiled if it sees one only
  // through a ghost. A test (pass) runs over a few
  // frames, ROAD_MS milliseconds in each; it holds the view at its start. Returns true when the
  // test is done.
  seeRoads(pass) {
    const { ux, uz, k, city, size } = pass, t0 = performance.now();
    const look = (x, z) => this.sight.look(x, OVER, z, ux, uz, k, this.ghost, city);
    while (pass.next < this.roads.length) {
      const lb = this.roads[pass.next++], R = lb.run, { bad, veiled } = lb;
      for (let i = 0; i < R.n; i++) {
        const x = R.x[i], z = R.z[i], nx = -R.tz[i], nz = R.tx[i];
        const off = Math.max(1, (0.25 * lb.h * size) / fsOf(nx, nz));
        let v = look(x, z);
        if (v < 2) v = Math.max(v, look(x + nx * off, z + nz * off));
        if (v < 2) v = Math.max(v, look(x - nx * off, z - nz * off));
        bad[i + 1] = bad[i] + (v === 2 ? 1 : 0);
        veiled[i + 1] = veiled[i] + (v >= 1 ? 1 : 0);
      }
      if (performance.now() - t0 > ROAD_MS) return false;
    }
    return true;
  }

  // Test again what the camera sees of the roads when the view turns, the zoom changes the size
  // of the names, or the storeys move; not more often than each ROAD_AGAIN seconds. size:
  // metres for each pixel of the design, on a plate that faces the camera.
  watchRoads(view, size) {
    const r = this.road, key = `${view.cut}:${view.explode.toFixed(2)}`;
    if (key !== r.key || _d.distanceToSquared(r.dir) > 1e-10 || Math.abs(Math.log(size / r.size)) > 0.1) r.dirty = true;
    const hl = Math.hypot(_d.x, _d.z);
    if (!r.pass && r.dirty && this.clock - r.at >= ROAD_AGAIN && _d.y < 0 && hl > 1e-6) {
      r.pass = { ux: -_d.x / hl, uz: -_d.z / hl, k: -_d.y / hl, city: this.cityTops(view.cut), size, next: 0 };
      Object.assign(r, { key, size, at: this.clock, dirty: false });
      r.dir.copy(_d);
    }
    if (r.pass && this.seeRoads(r.pass)) {
      r.pass = null;
      r.ver++;
    }
  }

  // The place of a road name in this frame: where it was, if it still fits there, or else the
  // point nearest its home where it fits. A place in clear view goes before a place behind a
  // ghost. After a new test of what the camera sees, a name in clear view moves to a point in
  // clear view that is 20 m or more nearer home, if there is one; a name behind a ghost moves
  // to a point in clear view, if there is one. It fits where the road runs
  // straight for the length of the name, the camera sees nine tenths of the road under it, its
  // middle is not at a junction, it is on the screen and clear of the labels before it, and no
  // name of the same road is near. It keeps clear of the panels (view.panels, rects on the
  // screen). Sets lb.x, lb.z and lb.axis; false if it fits nowhere.
  // shown: the places of the road names so far in this frame, by name.
  placeRoad(lb, size, camera, view, boxes, shown) {
    const R = lb.run, others = shown.get(R.name) || [];
    // clear: the camera sees the road there clear of the ghosts
    const fit = (i, clear) => {
      if (i < 0 || i >= R.n || R.cross[i]) return null;
      const m = Math.ceil((lb.w * size) / fsOf(R.tx[i], R.tz[i]) / 2 / NAME_STEP), a = i - m, b = i + m, hid = clear ? lb.veiled : lb.bad;
      if (a < 0 || b >= R.n || hid[b + 1] - hid[a] > (1 - SEEN) * (2 * m + 1) || lb.crossed[b + 1] - lb.crossed[a] > CROSSED * (2 * m + 1)) return null;
      const ex = R.x[b] - R.x[a], ez = R.z[b] - R.z[a], l = Math.hypot(ex, ez) || 1, tol = Math.max(2, R.hw[i]);
      for (let q = a + 1; q < b; q++) if (Math.abs((R.x[q] - R.x[a]) * ez - (R.z[q] - R.z[a]) * ex) / l > tol) return null;
      const x = R.x[i], z = R.z[i], ax = ex / l, az = ez / l;
      if (Math.hypot(x, z) > FADE_FAR - 100) return null;
      for (const [u, v] of others) if (Math.hypot(u - x, v - z) < SAME_ROAD) return null;
      const quad = screenQuad(camera, view, x, lb.y, z, ax, az, (lb.w * size) / fsOf(ax, az), (lb.h * size) / fsOf(az, -ax));
      if (quad.some(([u, v]) => u < 0 || v < 0 || u > view.w || v > view.h) || boxes.some((q) => overlap(q, quad, 3))) return null;
      for (const p of view.panels || []) if (overlap([[p.left, p.top], [p.right, p.top], [p.right, p.bottom], [p.left, p.bottom]], quad, 3)) return null;
      return { i, x, z, ax, az, clear };
    };
    const H = R.home;
    const search = (clear, far) => {
      for (let d = 0; d < far; d += 3) {
        const got = fit(H - d, clear) || (d ? fit(H + d, clear) : null);
        if (got) return got;
      }
      return null;
    };
    const fresh = lb.ver !== this.road.ver;
    lb.ver = this.road.ver;
    let at = lb.at >= 0 ? fit(lb.at, true) || fit(lb.at, false) : null;
    if (!at || fresh) {
      if (!at && !fresh && this.frame < lb.retry) return false;
      at = search(true, at && at.clear ? Math.abs(lb.at - H) - 10 : R.n) || at || search(false, R.n);
      // a name that fits nowhere looks again a few frames on
      if (!at) { lb.at = -1; lb.retry = this.frame + 8; return false; }
    }
    lb.at = at.i;
    lb.x = at.x;
    lb.z = at.z;
    lb.axis = [at.ax, at.az];
    others.push([at.x, at.z]);
    shown.set(R.name, others);
    return true;
  }

  // Each frame. view: { explode, cut, dt, w, h, toolbar, panels }.
  update(camera, view) {
    const layered = view.explode > 0.5;
    const mode = `${layered}:${view.cut}`;
    if (mode !== this.mode) {
      this.mode = mode;
      this.place(layered, view.cut);
    }
    const e = camera.matrixWorld.elements;
    _r.set(e[0], e[1], e[2]);
    _u.set(e[4], e[5], e[6]);
    _d.set(-e[8], -e[9], -e[10]);
    // The camera's right, in the ground plane: the axis of the plates that have no lane.
    const rh = Math.hypot(_r.x, _r.z) > 1e-4 ? [_r.x / Math.hypot(_r.x, _r.z), _r.z / Math.hypot(_r.x, _r.z)] : [1, 0];
    // Metres for each pixel on the screen, and pixels on the screen for each pixel of the
    // design: 2 at the start, so that the words read when they lie at a slant, up to 3 close in.
    const mpp = (camera.top - camera.bottom) / camera.zoom / view.h;
    const s = clamp(2 * (camera.zoom / 1.15) ** 0.2, 1.7, 3), fs = fsOf;
    const tabs = smoothstep(0.35, 0.8, view.explode);
    const boxes = [], shown = new Map();
    this.frame++;
    this.clock += view.dt;
    if (this.on) this.watchRoads(view, s * mpp);
    for (const lb of this.order) {
      let want = !lb.hidden && this.levels[lb.k].group.visible, base = 1;
      if (lb.kind === 'street' || lb.kind === 'place' || lb.kind === 'road') want &&= this.on;
      if (lb.kind === 'road') {
        // on its road, where it fits; it fades with the haze, as the road does (env.js)
        want &&= this.placeRoad(lb, s * mpp, camera, view, boxes, shown);
        base = 1 - smoothstep(FADE_NEAR, FADE_FAR, Math.hypot(lb.x, lb.z));
      } else if (lb.kind === 'storey') {
        want &&= view.explode > 0.35 && lb.k !== view.cut;
        base = tabs;
      } else if (lb.kind === 'cut') want &&= view.cut >= 0;
      if (!want && lb.alpha < 0.01) {
        lb.mesh.visible = lb.xray.visible = false;
        if (lb.lines) lb.lines.visible = false;
        lb.alpha = 0;
        continue;
      }
      // The axes of the plate: X along the words, Y up the letters, both in the ground plane.
      let ax, az;
      if (lb.axis) {
        [ax, az] = lb.axis;
        if (lb.kind !== 'north') {
          // turn the words so that they do not read upside down (with some slack at the turn)
          const sx = ax * _r.x + az * _r.z, sy = ax * _u.x + az * _u.z;
          const ang = Math.atan2(sy, sx) + (lb.flip ? Math.PI : 0);
          const a = Math.atan2(Math.sin(ang), Math.cos(ang));
          if (Math.abs(a) > Math.PI * 0.56) lb.flip = !lb.flip;
          if (lb.flip) { ax = -ax; az = -az; }
        }
      } else [ax, az] = rh;
      const uX = (s * mpp) / fs(ax, az), uY = (s * mpp) / fs(az, -ax);
      const w = lb.w * uX, h = lb.h * uY;
      // The centre. A storey label and the cut tag sit just left of the corner of the storey
      // (or of the City, for the cut tag in the normal view) that is leftmost on the screen.
      let cx = lb.x, cz = lb.z;
      const gy = this.levels[lb.k].group.position.y;
      if (lb.kind === 'storey' || lb.kind === 'cut') {
        const pts = lb.kind === 'cut' && view.explode <= 0.5 ? this.polygon : this.corners;
        let best = Infinity;
        for (const [px, pz] of pts) {
          const sx = px * _r.x + pz * _r.z;
          if (sx < best) { best = sx; cx = px; cz = pz; }
        }
        const back = w / 2 + 3 * s * mpp;
        cx -= ax * back;
        cz -= az * back;
        // Keep the plate on the screen and clear of the toolbar (view.toolbar, a rect on the
        // screen): it slides to the right, over the City if it must.
        _C.set(cx - (ax * w) / 2, lb.y + gy, cz - (az * w) / 2).project(camera);
        const lx = (_C.x * 0.5 + 0.5) * view.w, ly = (-_C.y * 0.5 + 0.5) * view.h, tb = view.toolbar;
        const minX = tb && ly < tb.bottom + 12 ? tb.right + 12 : 14;
        if (lx < minX) {
          const m = ((minX - lx) * mpp) / (Math.hypot(_r.x, _r.z) || 1);
          cx += ax * m;
          cz += az * m;
        }
      }
      // Overlaps: a label gives way to the labels before it in the order. A street name first
      // slides along its lane, up to 12 m each way, to find room; it keeps the place it found.
      const quadAt = (x, z) => {
        const quad = screenQuad(camera, view, x, lb.y + gy, z, ax, az, w, h);
        return boxes.some((q) => overlap(q, quad, 3)) ? null : quad;
      };
      const [sx, sz] = lb.span ? lb.axis : [0, 0];
      if (want) {
        let quad = null;
        const slides = lb.span ? [lb.t, 0, -6, 6, -12, 12].map((t) => clamp(t, lb.span[0], lb.span[1])) : [0];
        for (const t of slides) {
          quad = quadAt(cx + sx * t, cz + sz * t);
          if (quad) { lb.t = t; break; }
        }
        if (quad) boxes.push(quad);
        else want = false;
        lb.screen = quad;
      }
      cx += sx * lb.t;
      cz += sz * lb.t;
      lb.mesh.matrix.set(
        ax * w, az * h, 0, cx,
        0, 0, 1, lb.y,
        az * w, -ax * h, 0, cz,
        0, 0, 0, 1);
      lb.xray.matrix.copy(lb.mesh.matrix);
      lb.mesh.matrixWorldNeedsUpdate = lb.xray.matrixWorldNeedsUpdate = true;
      lb.want = want;
      lb.alpha += ((want ? 1 : 0) - lb.alpha) * Math.min(1, view.dt * 10);
      const a = lb.alpha * base;
      lb.mesh.visible = a > 0.01;
      // the names on the ground are not seen through the City
      lb.xray.visible = lb.mesh.visible && !lb.solid && !lb.top;
      lb.mesh.material.opacity = a;
      lb.xray.material.opacity = a * XRAY;
      if (lb.lines) {
        lb.lines.visible = lb.mesh.visible && lb.drop && view.explode < 0.01;
        if (lb.lines.visible) {
          const P = lb.lines.geometry.attributes.position;
          const n = P.count / 2, half = n > 1 ? w * 0.38 : 0;
          for (let q = 0; q < n; q++) {
            const t = n > 1 ? (q ? half : -half) : 0;
            P.setXYZ(q * 2, cx + ax * t, lb.y, cz + az * t);
            P.setXYZ(q * 2 + 1, cx + ax * t, 0, cz + az * t);
          }
          P.needsUpdate = true;
          lb.lines.material.opacity = 0.7 * a;
        }
      }
    }
  }

  // The street name, road name or place number under the pointer, of those that show.
  pick(raycaster) {
    const meshes = [];
    for (const lb of this.list) if ((lb.kind === 'street' || lb.kind === 'place' || lb.kind === 'road') && lb.want && lb.alpha > 0.5) meshes.push(lb.mesh);
    const hit = raycaster.intersectObjects(meshes, false)[0];
    return hit ? hit.object.userData.label : null;
  }

  // Light the lane cells of a street (lb), or the run of a road, or none (null). The cells lie
  // under its name. A road outside the City is lit at its width; the buildings in front of it
  // hide the light.
  light(lb) {
    if (this.lane) this.lane.visible = false;
    this.lit = lb && (lb.cells || lb.run) ? lb : null;
    if (!this.lit) return;
    if (!lb.laneMesh) {
      const { L } = this, v = [], R = lb.run;
      if (R) {
        for (let i = 0; i + 1 < R.n; i++) {
          const p = [R.x[i] - R.tz[i] * R.hw[i], R.z[i] + R.tx[i] * R.hw[i]], q = [R.x[i] + R.tz[i] * R.hw[i], R.z[i] - R.tx[i] * R.hw[i]];
          const j = i + 1, r = [R.x[j] + R.tz[j] * R.hw[j], R.z[j] - R.tx[j] * R.hw[j]], t = [R.x[j] - R.tz[j] * R.hw[j], R.z[j] + R.tx[j] * R.hw[j]];
          for (const [x, z] of [p, q, r, p, r, t]) v.push(x, 0, z);
        }
      } else
        for (const k of lb.cells) {
          const x = L.x0 + (k % L.W), z = L.z0 + ((k / L.W) | 0);
          v.push(x, 0, z, x, 0, z + 1, x + 1, 0, z + 1, x, 0, z, x + 1, 0, z + 1, x + 1, 0, z);
        }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
      lb.laneMesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.35, depthTest: !!R, depthWrite: false, fog: false, side: THREE.DoubleSide }));
      lb.laneMesh.renderOrder = 4;
    }
    this.lane = lb.laneMesh;
    this.levels[lb.k].group.add(this.lane);
    this.lane.position.y = lb.y - 0.02;
    this.lane.visible = true;
  }

  setOn(on) {
    this.on = on;
    if (!on) this.light(null);
    return on;
  }
}
