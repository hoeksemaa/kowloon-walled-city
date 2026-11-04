// The fingerprint of the definitive 3D structure (docs/structure.md, data/structure_frozen.json).
// tools/check_structure.mjs fails when the fingerprint changes. Thus no change to the code or to
// the data can move the structure without notice. The colours are not part of it: they are
// placeholders.
//
// cityFingerprint(S): a SHA-256 of the City model of src/city/ (buildStructure): each building
// (its storeys, floor levels, roof, outlines on each storey band, stairs and rooms), each door,
// bridge, ladder, step, hole and window, the route, and the ground plan of cityGround().
// meshFingerprint(S): a SHA-256 of the geometry that src/city/mesh.js makes of it, as the viewer
// draws it: the shell (walls, slabs, roofs, huts, parapets, links), the inside of every floor
// (partitions, stairs), the ladders and the stools. Each vertex, not its colour.
// surroundingsFingerprint(root, T): a SHA-256 of each data file of the surroundings, and of the
// shapes that src/surroundings/shapes.js makes of them (the reach, and the solid of each real
// building of 1986).
// All lengths are rounded to 1 cm.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { cityGround } from '../src/city/model.js';
import { buildMesh, buildProps } from '../src/city/mesh.js';
import { REACH, contextSolids } from '../src/surroundings/shapes.js';

const sha = (s) => createHash('sha256').update(s).digest('hex');
const cm = (v) => (typeof v === 'number' ? Math.round(v * 100) / 100 : v ?? null);
const ringsCm = (rings) => rings.map((r) => r.map((p) => p.map(cm)));

export const SURROUNDINGS_FILES = ['data/context.json', 'data/surroundings.json', 'data/terrain.json'];

export function cityFingerprint(S) {
  const G = cityGround(S);
  const shape = {
    buildings: S.list.map((b) => ({
      key: b.key, kind: b.kind, n: b.n, y: b.y.map(cm), top: cm(b.top), wingOf: b.wingOf ?? null,
      parapet: !!b.parapet, pitched: !!b.pitched, roofOpen: !!b.roofOpen,
      roofRoom: b.roofRoom ? [b.roofRoom.a0, b.roofRoom.a1, b.roofRoom.w0, b.roofRoom.w1].map(cm) : null,
      stairs: b.stairs.map((s) => [s.type, s.a0, s.a1, s.w0, s.w1, s.dir, s.side, !!s.spine].map(cm)),
      phases: b.phases.map((ph) => ({
        k0: ph.k0, k1: ph.k1,
        rings: ph.rings.map((r) => r.pts.map((p) => p.map(cm))),
        units: ph.plan.units.map((u) => [u.kind, cm(u.area), u.cells.join(',')]),
      })),
    })),
    doors: S.doors.map((d) => [d.kind, d.b, d.k, d.c, d.kc, d.x, d.z, d.x2, d.z2, d.y, d.yc, d.w, d.ground, ...(d.n || []),
      ...(d.stool ? [d.stool.x, d.stool.z, d.stool.y, d.stool.h] : [])].map(cm)),
    chain: S.chain, chainEnds: S.chainEnds,
    graph: [S.graph.nodes.length, S.graph.to.length],
    ground: { lanes: ringsCm(G.lanes), yards: ringsCm(G.yards), box: Object.values(G.box).map(cm) },
  };
  return sha(JSON.stringify(shape));
}

// A triangulation for the fingerprint only: no triangles. The slabs and roofs then give only
// their edges, but their outlines and levels are in cityFingerprint.
const noTriangles = (outer, holes) => ({ pts: [...outer, ...holes.flat()], idx: [] });

export function meshFingerprint(S) {
  const h = createHash('sha256');
  const add = (a) => {
    const q = new Int32Array(a.position.length);
    for (let i = 0; i < q.length; i++) q[i] = Math.round(a.position[i] * 100);
    h.update(new Uint8Array(q.buffer));
    h.update(`|${a.index.length}|`);
  };
  add(buildMesh(S, { triangulate: noTriangles, props: false }));
  add(buildMesh(S, { triangulate: noTriangles, shell: false, inside: () => true }));
  for (const kind of ['ladder', 'stool']) add(buildProps(S, kind).arrays);
  return h.digest('hex');
}

export function surroundingsFingerprint(root, T) {
  const ctx = JSON.parse(readFileSync(root + 'data/context.json', 'utf8'));
  const solids = contextSolids(ctx, T).map((s) => [s.id, cm(s.y0), cm(s.y1), s.ring.map((p) => p.map(cm))]);
  return {
    ...Object.fromEntries(SURROUNDINGS_FILES.map((f) => [f, sha(readFileSync(root + f))])),
    shapes: sha(JSON.stringify({ reach: REACH, solids })),
  };
}
