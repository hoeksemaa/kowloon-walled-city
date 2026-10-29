// The site: the city outline and its orientation.
//
// The outline comes from the traced 1980s street plan (data/plan.json, see
// tools/trace_plan.py). The plan's "up" is the Tung Tau Tsuen Road side. That road runs at a
// bearing of about 59.5° beside the park, and Tung Tsing Road on the short side at about
// 148° (OSM). Thus the plan's "right" points along a bearing of about 60°.
//
// The park outline below (OpenStreetMap relation 1650915, "Kowloon Walled City Park",
// © OpenStreetMap contributors, ODbL) is kept for reference only. The park is larger than
// the city, because it also covers former Sai Tau Tsuen land on the south and west.
import { polygonArea } from './util.js';

export const PLAN_BEARING = 60; // degrees from north, of the plan's +x axis
export const CENTRE_LATLON = [22.33222, 114.19028]; // EN Wikipedia

export const PARK_OUTLINE_LONLAT = [
  [114.188936, 22.3322979], [114.1889772, 22.3322293], [114.1889912, 22.332194], [114.1890001, 22.332074],
  [114.1890383, 22.3320035], [114.1891573, 22.3317843], [114.1892142, 22.3318091], [114.1893675, 22.3314787],
  [114.1892996, 22.3314471], [114.1895766, 22.3311743], [114.1896494, 22.3311442], [114.18974, 22.3311479],
  [114.1898176, 22.3311791], [114.1899984, 22.3312993], [114.1900849, 22.3313347], [114.1901729, 22.3313613],
  [114.1903127, 22.3313997], [114.1904235, 22.3314522], [114.1904971, 22.331511], [114.1905439, 22.3315767],
  [114.1905351, 22.3316429], [114.1905701, 22.3316563], [114.1905967, 22.3316664], [114.1906294, 22.3316803],
  [114.1906437, 22.3316863], [114.1906923, 22.3316167], [114.1907186, 22.3316077], [114.1908821, 22.3316713],
  [114.1915303, 22.3319236], [114.1915995, 22.3319493], [114.1914602, 22.3321847], [114.1913597, 22.3323613],
  [114.1913725, 22.3324501], [114.1913398, 22.3325014], [114.191301, 22.3325622], [114.1910457, 22.3330207],
  [114.1908216, 22.3332202], [114.1908027, 22.3332219], [114.1907579, 22.3332177], [114.1906916, 22.3331936],
  [114.1905322, 22.3330683], [114.1905321, 22.3330271], [114.1903371, 22.3328718], [114.1902619, 22.3328521],
  [114.1900666, 22.3326998], [114.1899607, 22.3326402], [114.1897917, 22.3325534], [114.18962, 22.3324914],
  [114.1890046, 22.3323175],
];

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
