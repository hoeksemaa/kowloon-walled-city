// Mesh building blocks shared by the storeys, the signs and the utilities: a vertex
// builder, flat polygons with holes, wall frames on polygon edges, and point tests.
import * as THREE from 'three';
import { FloatBuf, pointInPolygon } from './util.js';
import { signedArea } from './footprint.js';

export class Builder {
  // uvName: 'aWall' for the facade shader (u along the wall, v up in metres), 'uv' for maps.
  constructor(uvName = 'aWall') {
    this.uvName = uvName;
    this.pos = new FloatBuf(); this.nor = new FloatBuf(); this.col = new FloatBuf();
    this.uv = new FloatBuf(); this.info = new FloatBuf();
    this.idx = []; this.nv = 0;
  }
  vert(p, n, c, uv, info) {
    this.pos.p3(p[0], p[1], p[2]);
    this.nor.p3(n[0], n[1], n[2]);
    this.col.p3(c.r, c.g, c.b);
    this.uv.p2(uv[0], uv[1]);
    this.info.p4(info[0], info[1], info[2], info[3]);
  }
  // A flat face of 3 or 4 corners. The winding is set so that the front face looks along n.
  face(p, n, c, uv, info) {
    let nx = 0, ny = 0, nz = 0;
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length];
      nx += (a[1] - b[1]) * (a[2] + b[2]);
      ny += (a[2] - b[2]) * (a[0] + b[0]);
      nz += (a[0] - b[0]) * (a[1] + b[1]);
    }
    const flip = nx * n[0] + ny * n[1] + nz * n[2] < 0;
    const v = this.nv;
    for (let i = 0; i < p.length; i++) this.vert(p[i], n, c, uv[i], info);
    if (p.length === 3) {
      if (flip) this.idx.push(v, v + 2, v + 1); else this.idx.push(v, v + 1, v + 2);
    } else if (flip) this.idx.push(v, v + 2, v + 1, v, v + 3, v + 2);
    else this.idx.push(v, v + 1, v + 2, v, v + 2, v + 3);
    this.nv += p.length;
  }
  // Vertical wall from A to B ([x, z]). u runs from uA at A to uB at B; v is metres up.
  vwall(A, B, y0, y1, n, c, uA, uB, info) {
    const h = y1 - y0;
    this.face([[A[0], y0, A[1]], [B[0], y0, B[1]], [B[0], y1, B[1]], [A[0], y1, A[1]]], n, c,
      [[uA, 0], [uB, 0], [uB, h], [uA, h]], info);
  }
  hrect(xa, za, xb, zb, y, c, info) {
    this.face([[xa, y, za], [xa, y, zb], [xb, y, zb], [xb, y, za]], [0, 1, 0], c,
      [[xa, za], [xa, zb], [xb, zb], [xb, za]], info);
  }
  // A box in a wall frame: from origin O ([x, z]), u0..u1 along t and o0..o1 along n (t and
  // n are unit and at right angles). The back face (at o0) is left out unless asked for.
  obox(O, t, n, u0, u1, o0, o1, y0, y1, c, info, back = false) {
    const P = (u, o, y) => [O[0] + t[0] * u + n[0] * o, y, O[1] + t[1] * u + n[1] * o];
    const N = [n[0], 0, n[1]], T = [t[0], 0, t[1]];
    const h = y1 - y0;
    this.face([P(u0, o0, y1), P(u1, o0, y1), P(u1, o1, y1), P(u0, o1, y1)], [0, 1, 0], c,
      [[u0, o0], [u1, o0], [u1, o1], [u0, o1]], info);
    this.face([P(u0, o1, y0), P(u1, o1, y0), P(u1, o1, y1), P(u0, o1, y1)], N, c,
      [[u0, 0], [u1, 0], [u1, h], [u0, h]], info);
    this.face([P(u1, o0, y0), P(u1, o1, y0), P(u1, o1, y1), P(u1, o0, y1)], T, c,
      [[o0, 0], [o1, 0], [o1, h], [o0, h]], info);
    this.face([P(u0, o1, y0), P(u0, o0, y0), P(u0, o0, y1), P(u0, o1, y1)], [-T[0], 0, -T[2]], c,
      [[o1, 0], [o0, 0], [o0, h], [o1, h]], info);
    if (back)
      this.face([P(u1, o0, y0), P(u0, o0, y0), P(u0, o0, y1), P(u1, o0, y1)], [-N[0], 0, -N[2]], c,
        [[u1, 0], [u0, 0], [u0, h], [u1, h]], info);
  }
  box(x0, y0, z0, x1, y1, z1, c, info) {
    this.obox([x0, z0], [1, 0], [0, 1], 0, x1 - x0, 0, z1 - z0, y0, y1, c, info, true);
  }
  // An upright prism of `sides` sides (a round water tank, a drum) with a top.
  prism(x, z, r, y0, y1, sides, c, info) {
    const P = (q, y) => [x + Math.cos((q / sides) * 2 * Math.PI) * r, y, z + Math.sin((q / sides) * 2 * Math.PI) * r];
    for (let q = 0; q < sides; q++) {
      const a = (q + 0.5) / sides * 2 * Math.PI;
      const u0 = (q / sides) * 2 * Math.PI * r, u1 = ((q + 1) / sides) * 2 * Math.PI * r;
      this.face([P(q, y0), P(q + 1, y0), P(q + 1, y1), P(q, y1)], [Math.cos(a), 0, Math.sin(a)], c,
        [[u0, 0], [u1, 0], [u1, y1 - y0], [u0, y1 - y0]], info);
      this.face([[x, y1, z], P(q, y1), P(q + 1, y1)], [0, 1, 0], c, [[x, z], [0, 0], [0, 0]], info);
    }
  }
  // A triangulated flat polygon (from triangulate) at height y, facing up.
  flat(tri, y, c, info) {
    const v = this.nv;
    for (const [x, z] of tri.pts) this.vert([x, y, z], [0, 1, 0], c, [x, z], info);
    for (const i of tri.idx) this.idx.push(v + i);
    this.nv += tri.pts.length;
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos.view().slice(), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(this.nor.view().slice(), 3));
    g.setAttribute('color', new THREE.BufferAttribute(this.col.view().slice(), 3));
    g.setAttribute(this.uvName, new THREE.BufferAttribute(this.uv.view().slice(), 2));
    if (this.uvName === 'aWall') g.setAttribute('aInfo', new THREE.BufferAttribute(this.info.view().slice(), 4));
    g.setIndex(new THREE.BufferAttribute(this.nv > 65535 ? new Uint32Array(this.idx) : new Uint16Array(this.idx), 1));
    g.computeBoundingSphere();
    return g;
  }
}

// Even-odd test over all rings of a region.
export function insideRings(rings, x, z) {
  let n = 0;
  for (const r of rings) if (pointInPolygon(x, z, r.pts)) n++;
  return n % 2 === 1;
}

// True when a disc of radius m round (x, z) is inside the region (tested at 8 points).
export function insideWithMargin(rings, x, z, m) {
  if (!insideRings(rings, x, z)) return false;
  for (let q = 0; q < 8; q++) {
    const a = (q / 8) * 2 * Math.PI;
    if (!insideRings(rings, x + Math.cos(a) * m, z + Math.sin(a) * m)) return false;
  }
  return true;
}

// Group the rings of one region into polygons: each outer ring with the holes inside it.
export function polygonsOf(rings) {
  const outers = rings.filter((r) => !r.hole).map((r) => ({ outer: r.pts, holes: [], area: Math.abs(signedArea(r.pts)) }));
  for (const r of rings) {
    if (!r.hole) continue;
    // A point just inside the region, beside the hole's first edge.
    const e = r.edges[0];
    const dx = e.b[0] - e.a[0], dz = e.b[1] - e.a[1], l = Math.hypot(dx, dz) || 1;
    const px = (e.a[0] + e.b[0]) / 2 - (dz / l) * 0.05, pz = (e.a[1] + e.b[1]) / 2 + (dx / l) * 0.05;
    let best = null;
    for (const o of outers) if (pointInPolygon(px, pz, o.outer) && (!best || o.area < best.area)) best = o;
    if (best) best.holes.push(r.pts);
  }
  return outers;
}

// Triangles of a polygon with holes, wound to face up (+y).
export function triangulate(poly) {
  const contour = poly.outer.map(([x, z]) => new THREE.Vector2(x, z));
  const holes = poly.holes.map((h) => h.map(([x, z]) => new THREE.Vector2(x, z)));
  const tris = THREE.ShapeUtils.triangulateShape(contour, holes);
  const pts = [...contour, ...holes.flat()].map((v) => [v.x, v.y]);
  const idx = [];
  for (const [a, b, c] of tris) {
    const A = pts[a], B = pts[b], C = pts[c];
    const up = (B[1] - A[1]) * (C[0] - A[0]) - (B[0] - A[0]) * (C[1] - A[1]);
    if (up >= 0) idx.push(a, b, c); else idx.push(a, c, b);
  }
  return { pts, idx };
}

// The frame of a wall on ring edge e (the region is on the right of a -> b). A is the
// wall's left end as seen from outside; t runs from A to B; n points out of the region.
export function wallFrame(e) {
  const dx = e.a[0] - e.b[0], dz = e.a[1] - e.b[1], len = Math.hypot(dx, dz) || 1e-6;
  const t = [dx / len, dz / len];
  return { A: e.b, B: e.a, t, n: [-t[1], t[0]], len };
}
