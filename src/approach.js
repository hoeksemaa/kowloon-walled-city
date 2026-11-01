// The track of the planes on the approach to Kai Tak runway 13, in plan metres (the frame of
// data/context.json; x, z as in the plan, y up). No three.js here, so that
// tools/check_context.mjs can use the same track.
//
// SOURCED:
// - The runway. The 1:1000 survey sheet 11-NE-11C of 1987-06 (LandsD) draws the north-west end
//   of runway 13/31. On that scan, the centre of the end is at HK1980 Grid E 837847.1,
//   N 820728.3, the runway is 61.9 m wide, and its south-west edge runs on a bearing of
//   134.0° (a line fit, 0.12 m rms). English Wikipedia ("Kai Tak Airport") gives 134° true.
//   Thus the end of the runway is 763 m SSE of the centre of the City, and its centre line,
//   drawn on to the north-west, passes 388 m SW of the City.
// - The approach. The IGS beam was offset 47° from the runway heading. Pilots flew it towards
//   Checkerboard Hill at Kowloon Tsai (22°20′09″N 114°11′03″E), then made a 47° right turn
//   by eye, from about 650 ft (198 m) down to 140 ft (43 m), where they lined up with the
//   runway (English Wikipedia, "Kai Tak Airport" and "Checkerboard Hill").
// INFERRED: the beam passes over the hill; the turn is one circle that starts at 650 ft and
// ends on the centre line at 140 ft; the glide is 3.1° all the way (flight-simulator notes of
// the IGS chart; not checked). The circle then has a radius of 3.5 km, and the bank at 75 m/s
// is 9°. The plane passes the City on its left, about 430 m off, at about 70 m.
import { PLAN_BEARING } from './site.js';

const FT = 0.3048;
// HK1980 Grid points: the centre of the runway end on sheet 11-NE-11C (1987-06), and
// Checkerboard Hill (± 30 m, from its latitude and longitude).
export const GRID = { runwayEnd: [837847.1, 820728.3], hill: [837019.6, 821863.9] };
export const RUNWAY_END = [-144.8, 749.4]; // GRID.runwayEnd in the plan
export const HILL = [-381.7, -635.5]; // GRID.hill in the plan
export const RUNWAY_BEARING = 134.0;
export const OFFSET = 47; // degrees between the IGS beam and the runway
export const GLIDE = Math.tan((3.1 * Math.PI) / 180);
export const TURN_IN = 650 * FT, LINE_UP = 140 * FT;
export const SPEED = 75; // m/s, about 145 knots
export const S0 = -1500, S1 = 950; // metres along the track, 0 = nearest the City
// The clearance (INFERRED, a rule of the model, not of the CAD): the track stays at least CLEAR
// metres (about 100 ft) over the roof of each building within SIDE metres of it, to either side.
// The plane's wing tip is 30 m from the track and, in the bank, 6 m under it; its engines are
// 5 m under it. Thus at least 24 m of air stays under the plane. tools/check_context.mjs fails
// if a building, or the City with its aerials, comes closer.
export const CLEAR = 30, SIDE = 60;

const dir = (bearing) => {
  const a = ((bearing - PLAN_BEARING) * Math.PI) / 180;
  return [Math.cos(a), Math.sin(a)];
};
const u = dir(RUNWAY_BEARING), v = dir(RUNWAY_BEARING - OFFSET);
// X: where the beam over the hill meets the centre line. HILL + a v = RUNWAY_END - b u.
const det = v[0] * u[1] - v[1] * u[0];
const rx = RUNWAY_END[0] - HILL[0], rz = RUNWAY_END[1] - HILL[1];
const back = (v[0] * rz - v[1] * rx) / det; // metres from X on to the runway end
const X = [RUNWAY_END[0] - back * u[0], RUNWAY_END[1] - back * u[1]];
const D = (OFFSET * Math.PI) / 180;
const ARC = (TURN_IN - LINE_UP) / GLIDE;
export const RADIUS = ARC / D;
const L = RADIUS * Math.tan(D / 2);
const A = [X[0] + L * u[0], X[1] + L * u[1]]; // the plane lines up here
const C = [A[0] - RADIUS * u[1], A[1] + RADIUS * u[0]]; // the centre of the turn, on the right
const T0 = Math.atan2(v[1], v[0]); // the plan angle of the beam
export const BANK = Math.atan((SPEED * SPEED) / (9.81 * RADIUS));
const ROLL = 150; // metres to roll into and out of the bank

// p: metres along the track from where the plane lines up (A), negative before.
function at(p) {
  let x, z, a, bank = 0;
  if (p >= 0) {
    [x, z, a] = [A[0] + p * u[0], A[1] + p * u[1], T0 + D];
  } else if (p >= -ARC) {
    const q = p + ARC;
    a = T0 + q / RADIUS;
    [x, z] = [C[0] + RADIUS * Math.sin(a), C[1] - RADIUS * Math.cos(a)];
    bank = BANK * Math.min(1, q / ROLL, -p / ROLL);
  } else {
    const q = p + ARC; // negative: on the beam, before the turn
    [x, z, a] = [C[0] + RADIUS * Math.sin(T0) + q * v[0], C[1] - RADIUS * Math.cos(T0) + q * v[1], T0];
  }
  return { x, y: LINE_UP - p * GLIDE, z, dx: Math.cos(a), dz: Math.sin(a), bank };
}

// The point of the track nearest the centre of the City: s = 0.
let P0 = 0;
for (let p = -ARC, best = Infinity; p < 1000; p += 1) {
  const t = at(p), d = Math.hypot(t.x, t.z);
  if (d < best) [best, P0] = [d, p];
}

// s: metres along the track, 0 = nearest the City. Returns the position, the unit direction in
// the plan (dx, dz) and the bank to the right in radians.
export const track = (s) => at(s + P0);
