// The outline of the selected building (main.js): a line round it on each of its storeys, in
// the group of that storey, thus each slice of the layered view has its own outline. The line
// runs round the floor and the top of the storey and up its corners, on the walls as cityMesh.js
// draws them (also round an overhang over a lane). On the cut storey it runs at the section.
// A solid line shows where nothing is in front of it; a faint line shows it through the rest
// of the city. The lines round the floors between two storeys of the building come in only as
// the storeys move apart, thus the normal view shows the outline of the whole building.
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { STOREY, footprintAt } from './layout.js';
import { CUT_H, overhangAt } from './cityMesh.js';

const COLOR = '#fff0cc';
// The solid line comes this far toward the camera before the depth test, so that it is not in
// the wall that it is on, or behind a slab ledge. The camera is orthographic, thus the line
// stays at its place on the screen.
const LIFT = 0.35;
// A vertical line goes up a corner that turns more than this, in radians.
const CORNER = 0.25;
const GHOST = 0.35; // the opacity of the faint line

export class Outline {
  constructor(L, levels) {
    this.L = L;
    this.levels = levels;
    this.solid = new LineMaterial({ color: COLOR, linewidth: 2.5, worldUnits: false });
    this.solid.onBeforeCompile = (s) => {
      s.vertexShader = s.vertexShader.replace('vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );',
        `vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );\nstart.z += ${LIFT.toFixed(2)}; end.z += ${LIFT.toFixed(2)};`);
    };
    this.solid.customProgramCacheKey = () => 'kwc-outline';
    this.ghost = new LineMaterial({ color: COLOR, linewidth: 1.5, worldUnits: false, transparent: true, opacity: GHOST, depthTest: false, depthWrite: false });
    // the same for the lines between two storeys (apart)
    this.solidIn = this.solid.clone();
    this.solidIn.onBeforeCompile = this.solid.onBeforeCompile;
    this.solidIn.customProgramCacheKey = this.solid.customProgramCacheKey;
    this.solidIn.transparent = true;
    this.ghostIn = this.ghost.clone();
    this.parts = [];
    this.apart(0);
  }

  // a: 0 in the normal view, 1 with the storeys fully apart.
  apart(a) {
    this.solidIn.opacity = a;
    this.ghostIn.opacity = GHOST * a;
    this.solidIn.visible = this.ghostIn.visible = a > 0.01;
  }

  // Outline building id (bldgOf; -1 for none), with cut storey c (-1 for none).
  show(id, c) {
    for (const l of this.parts) {
      l.parent.remove(l);
      l.geometry.dispose();
    }
    this.parts = [];
    if (id < 0) return;
    for (const lv of this.levels) {
      if (c >= 0 && lv.k > c) break;
      const { out, inner } = this.storey(id, lv.k, lv.k === c);
      for (const [pos, solid, ghost] of [[out, this.solid, this.ghost], [inner, this.solidIn, this.ghostIn]]) {
        if (!pos.length) continue;
        const g = new LineSegmentsGeometry();
        g.setPositions(pos);
        for (const [m, order] of [[solid, 4], [ghost, 9]]) {
          const l = new LineSegments2(g, m);
          l.frustumCulled = false;
          l.renderOrder = order;
          lv.group.add(l);
          this.parts.push(l);
        }
      }
    }
  }

  // The segments of the outline on storey k, as x, y, z pairs: round the floor and the top
  // (the section, on the cut storey), and up each corner. out: the lines of the whole
  // building; inner: the lines round a floor between two of its storeys.
  storey(id, k, cut) {
    const L = this.L, y0 = k ? k * STOREY : 0.03, y1 = cut ? k * STOREY + CUT_H + 0.05 : (k + 1) * STOREY;
    const E = footprintAt(L, id, k);
    if (!E.length) return { out: [], inner: [] };
    const below = k > 0, above = !cut && footprintAt(L, id, k + 1).length > 0;
    const out = [], inner = [], ins = new Map(), outs = new Map(), key = (p) => `${p[0].toFixed(3)},${p[1].toFixed(3)}`;
    for (const { e, b } of E) {
      // the ring runs from a to b with the building on its right; out is to its left
      const ov = overhangAt(L, b, e, k), dx = e.b[0] - e.a[0], dz = e.b[1] - e.a[1], len = Math.hypot(dx, dz) || 1;
      const nx = (dz / len) * ov, nz = (-dx / len) * ov;
      const path = ov ? [e.a, [e.a[0] + nx, e.a[1] + nz], [e.b[0] + nx, e.b[1] + nz], e.b] : [e.a, e.b];
      for (let i = 0; i + 1 < path.length; i++) {
        const p = path[i], q = path[i + 1];
        (below ? inner : out).push(p[0], y0, p[1], q[0], y0, q[1]);
        (above ? inner : out).push(p[0], y1, p[1], q[0], y1, q[1]);
        const d = Math.atan2(q[1] - p[1], q[0] - p[0]);
        outs.set(key(p), [p, d]);
        ins.set(key(q), d);
      }
    }
    for (const [kp, [p, d]] of outs) {
      const turn = Math.abs(((d - ins.get(kp) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
      if (!ins.has(kp) || turn > CORNER) out.push(p[0], y0, p[1], p[0], y1, p[1]);
    }
    return { out, inner };
  }

  setResolution(w, h) {
    for (const m of [this.solid, this.ghost, this.solidIn, this.ghostIn]) m.resolution.set(w, h);
  }
}
