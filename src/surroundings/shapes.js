// The shapes of the surroundings, with no three.js, thus tools/structure_fingerprint.mjs can
// hash them in node: how far the ground and the buildings round the City reach, and the solid
// of each real building of 1986. src/surroundings/ground.js draws them. Part of the definitive
// structure (docs/structure.md): do not change them.
import { buildingPrisms } from '../context.js';

// m from the centre of the plan: the terrain and the buildings round the City end here. The
// haze of the main app (FADE_FAR, src/env.js) ends at the same radius, but this one is fixed.
export const REACH = 600;

// The solid of each real building of 1986 (data/context.json) within REACH: its outline (ring,
// clockwise in x, z), and its foot y0 (1 m under its lowest ground) and top y1 (its lowest
// ground plus its height), in mPD on the terrain T. id: its place in buildingPrisms().
export function contextSolids(ctx, T) {
  const out = [];
  buildingPrisms(ctx).forEach((p, id) => {
    if (!p) return;
    let lo = Infinity, sx = 0, sz = 0;
    for (const [x, z] of p.ring) { lo = Math.min(lo, T.h(x, z)); sx += x; sz += z; }
    if (Math.hypot(sx / p.ring.length, sz / p.ring.length) > REACH + 20) return;
    out.push({ id, ring: p.ring, y0: lo - 1, y1: lo + p.h });
  });
  return out;
}
