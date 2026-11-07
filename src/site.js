// The site: the city outline and its orientation.
//
// The outline comes from the traced 1980s street plan (data/plan.json, see
// tools/trace_plan.py). The plan's "up" is the Tung Tau Tsuen Road side, its "right" the Tung
// Tsing Road side, and its "down" faces Carpenter Road. The bearing of the plan's "right" comes
// from the City on the 1:1000 survey sheet 11-NE-11A of 1987-05: tools/context.py first took
// 60° (from the roads in OSM), then fitted the plan outline to the City on the sheet. The fit
// turns the plan by th = 0.06327 rad (3.63°) more (cityFit in data/context.json). Thus the
// plan's "right" points along a bearing of 63.63°. data/context.json is in this frame. Check:
// in that data Tung Tau Tsuen Road runs at about 60-67° beside the City, Tung Tsing Road at
// about 132-157° and Carpenter Road at about 92°.
import { polygonArea } from './util.js';

export const PLAN_BEARING = 63.63; // degrees from north, of the plan's +x axis: 60° + th
export const CENTRE_LATLON = [22.33222, 114.19028]; // EN Wikipedia

// Returns the footprint in local metres: x runs to the plan's right (ENE), z down the plan
// (SSE), y is up. `north` and `east` are unit vectors in that frame.
export function buildSite(plan) {
  const polygon = plan.outline.map(([x, z]) => [x - plan.W / 2, z - plan.D / 2]);
  const b = (PLAN_BEARING * Math.PI) / 180;
  return {
    polygon,
    bearing: PLAN_BEARING,
    north: [Math.cos(b), -Math.sin(b)],
    east: [Math.sin(b), Math.cos(b)],
    area: polygonArea(polygon),
    lat0: CENTRE_LATLON[0],
    lon0: CENTRE_LATLON[1],
  };
}
