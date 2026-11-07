// The real surroundings of December 1986 (data/context.json): which outlines are drawn.
// src/surroundings/ draws them; tools/check_context.mjs checks them. No three.js here, so that
// the check runs in node.

// The 9 road segments with no measured width (each 280 m or more from the centre of the plan
// box) are drawn this wide.
export const ROAD_WIDTH = 7; // INFERRED

// The buildings to draw. The data has a building that the City plate partly covers as its parts
// off the plate; plateClipped holds its whole outline, and that is what is drawn. Thus Mei Tung
// House stands whole.
export function drawnBuildings(C) {
  const parts = new Set(C.plateClipped.flatMap((c) => c.parts));
  const out = C.buildings.filter((b) => !parts.has(b.id));
  for (const c of C.plateClipped) {
    const b = C.buildings.find((q) => q.id === c.parts[0]);
    out.push({ ...b, id: c.id, ring: c.ring, clipped: undefined });
  }
  return out;
}

// The solids that src/surroundings/ draws, in the order of drawnBuildings: for each building its
// outline (ring) and its height h. The outline is clockwise in (x, z), with no two points closer
// than 5 cm. null for an outline of fewer than 3 points, which is not drawn.
export function buildingPrisms(C) {
  return drawnBuildings(C).map((b) => {
    let ring = b.ring.filter((p, i, r) => Math.hypot(p[0] - r[(i + 1) % r.length][0], p[1] - r[(i + 1) % r.length][1]) > 0.05);
    if (ring.length < 3) return null;
    if (ring.reduce((s, p, i) => { const q = ring[(i + 1) % ring.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) > 0) ring = ring.slice().reverse();
    return { ring, h: b.height };
  });
}
