// The figures of the people (people.js, crowd.js), and the pigeon breeder's flock.
import * as THREE from 'three';
import { STOREY } from './layout.js';

// Each figure is a jointed body: legs with shoes, hips, a chest, arms with hands, a neck, a
// head with eyes and hair, and what goes with it: a hat, a thing to carry, a stool or a mat,
// and the marker over a real person. The vertex shader bends the joints, by the gait and the
// pose (people.js aM), and puts the figure in place. Part numbers:
export const PART = {
  thighL: 0, thighR: 1, shinL: 2, shinR: 3, shoeL: 4, shoeR: 5, pelvis: 6, torso: 7,
  armL: 8, armR: 9, foreL: 10, foreR: 11, handL: 12, handR: 13, neck: 14, head: 15, eyes: 16,
  hair: 17, hair2: 18, hat: 19, brim: 20, prop: 21, seat: 22, mat: 23, marker: 24, quilt: 25,
};
// The joints of a standing adult, in metres; the figure faces +z, its left side is +x.
const J = { hipY: 0.84, hipX: 0.085, kneeY: 0.46, ankY: 0.075, shoY: 1.34, shoX: 0.2, elbY: 1.07, wriY: 0.84, neckY: 1.4, headY: 1.53 };

function shapes() {
  const pos = [], nor = [], part = [], idx = [];
  const vert = (p, n, k) => { pos.push(...p); nor.push(...n); part.push(k); return pos.length / 3 - 1; };
  const quad = (a, b, c, d) => idx.push(a, b, c, a, c, d);
  const S = {
    box(x0, y0, z0, x1, y1, z1, k) {
      const F = [
        [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [0, 1, 0]],
        [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0]],
        [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]],
        [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1]],
        [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0]],
        [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0]],
      ];
      for (const f of F) { const v = f.slice(0, 4).map((p) => vert(p, f[4], k)); quad(...v); }
    },
    // A tapered, elliptic prism along y with smooth sides, and caps.
    prism(cx, cz, y0, y1, rx0, rz0, rx1, rz1, n, k, top = true, bot = true) {
      const ring = (y, rx, rz) => {
        const out = [];
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
          out.push(vert([cx + c * rx, y, cz + s * rz], [c / rx, (rx0 - rx1) / (y1 - y0) * 0.5, s / rz].map((v, j, A) => v / Math.hypot(...A)), k));
        }
        return out;
      };
      const A = ring(y0, rx0, rz0), B = ring(y1, rx1, rz1);
      for (let i = 0; i < n; i++) { const j = (i + 1) % n; quad(A[i], B[i], B[j], A[j]); }
      const cap = (y, rx, rz, up) => {
        const v = [];
        for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; v.push(vert([cx + Math.cos(a) * rx, y, cz + Math.sin(a) * rz], [0, up, 0], k)); }
        for (let i = 1; i + 1 < n; i++) up > 0 ? idx.push(v[0], v[i + 1], v[i]) : idx.push(v[0], v[i], v[i + 1]);
      };
      if (top) cap(y1, rx1, rz1, 1);
      if (bot) cap(y0, rx0, rz0, -1);
    },
    // An ellipsoid; squash(d) can pull parts of it in (the face out of the hair).
    ball(cx, cy, cz, rx, ry, rz, nu, nv, k, squash = () => 1) {
      const rows = [];
      for (let j = 0; j <= nv; j++) {
        const th = (j / nv) * Math.PI, row = [];
        for (let i = 0; i <= nu; i++) {
          const ph = (i / nu) * Math.PI * 2;
          const d = [Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph)];
          const m = squash(d);
          row.push(vert([cx + d[0] * rx * m, cy + d[1] * ry * m, cz + d[2] * rz * m], [d[0] / rx, d[1] / ry, d[2] / rz].map((v, q, A) => v / Math.hypot(...A)), k));
        }
        rows.push(row);
      }
      for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) quad(rows[j][i], rows[j][i + 1], rows[j + 1][i + 1], rows[j + 1][i]);
    },
    geometry() {
      const g = new THREE.InstancedBufferGeometry();
      g.setIndex(idx);
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      g.setAttribute('aPart', new THREE.Float32BufferAttribute(part, 1));
      return g;
    },
  };
  return S;
}

// The full figure, for a close view.
function fineFigure() {
  const S = shapes(), P = PART;
  for (const s of [1, -1]) {
    const x = s * J.hipX, L = s > 0;
    S.prism(x, 0, J.kneeY, J.hipY + 0.03, 0.056, 0.058, 0.074, 0.074, 7, L ? P.thighL : P.thighR);
    S.prism(x, 0, J.ankY, J.kneeY + 0.02, 0.04, 0.042, 0.054, 0.056, 7, L ? P.shinL : P.shinR);
    S.box(x - 0.046, 0, -0.06, x + 0.046, J.ankY + 0.01, 0.135, L ? P.shoeL : P.shoeR);
    const ax = s * J.shoX;
    S.prism(ax, 0, J.elbY, J.shoY + 0.04, 0.044, 0.046, 0.052, 0.054, 6, L ? P.armL : P.armR);
    S.prism(ax, 0.005, J.wriY, J.elbY + 0.02, 0.036, 0.038, 0.044, 0.046, 6, L ? P.foreL : P.foreR);
    S.box(ax - 0.026, J.wriY - 0.095, -0.035, ax + 0.026, J.wriY + 0.005, 0.04, L ? P.handL : P.handR);
  }
  S.prism(0, 0, 0.76, 0.97, 0.15, 0.1, 0.155, 0.1, 8, P.pelvis);
  S.prism(0, -0.005, 0.93, J.shoY + 0.07, 0.15, 0.098, 0.19, 0.11, 8, P.torso);
  S.prism(0, 0.0, 1.38, 1.47, 0.045, 0.045, 0.042, 0.042, 6, P.neck, false, false);
  S.ball(0, J.headY, 0.008, 0.102, 0.122, 0.113, 9, 6, P.head);
  for (const s of [1, -1]) S.box(s * 0.04 - 0.014, 1.532, 0.098, s * 0.04 + 0.014, 1.552, 0.123, P.eyes);
  // Hair: a shell over the head, pulled in over the face.
  S.ball(0, J.headY + 0.022, -0.012, 0.114, 0.128, 0.128, 9, 6, P.hair, (d) => (d[2] > 0.3 && d[1] < 0.42 ? 0.78 : d[1] < -0.5 && d[2] > -0.4 ? 0.8 : 1));
  S.box(-0.1, 1.36, -0.15, 0.1, 1.58, -0.05, P.hair2);
  S.prism(0, -0.01, J.headY + 0.075, J.headY + 0.165, 0.122, 0.13, 0.118, 0.126, 8, P.hat, true, false);
  S.box(-0.095, J.headY + 0.07, 0.06, 0.095, J.headY + 0.09, 0.2, P.brim);
  S.box(-0.5, -0.5, -0.5, 0.5, 0.5, 0.5, P.prop);
  S.prism(0, 0, 0, 1, 0.15, 0.15, 0.13, 0.13, 8, P.seat, true, false);
  S.box(-0.35, 0, -0.92, 0.35, 0.025, 0.88, P.mat);
  S.ball(0, 2.08, 0, 0.11, 0.17, 0.11, 4, 2, P.marker);
  S.ball(0, 0.12, 0.16, 0.3, 0.16, 0.66, 10, 6, P.quilt);
  return S.geometry();
}

// A plain figure of boxes, for a far view with many people.
function plainFigure() {
  const S = shapes(), P = PART;
  for (const s of [1, -1]) {
    const x = s * J.hipX, L = s > 0;
    S.box(x - 0.07, J.kneeY, -0.07, x + 0.07, J.hipY, 0.07, L ? P.thighL : P.thighR);
    S.box(x - 0.055, 0, -0.06, x + 0.055, J.kneeY, 0.08, L ? P.shinL : P.shinR);
    S.box(s * J.shoX - 0.05, J.wriY - 0.05, -0.05, s * J.shoX + 0.05, J.shoY + 0.04, 0.05, L ? P.armL : P.armR);
  }
  S.box(-0.16, 0.76, -0.11, 0.16, J.shoY + 0.07, 0.11, P.torso);
  S.box(-0.105, 1.4, -0.11, 0.105, 1.64, 0.115, P.head);
  S.box(-0.115, 1.6, -0.125, 0.115, 1.67, 0.125, P.hair);
  S.box(-0.12, J.headY + 0.075, -0.13, 0.12, J.headY + 0.165, 0.12, P.hat);
  S.box(-0.5, -0.5, -0.5, 0.5, 0.5, 0.5, P.prop);
  S.box(-0.15, 0, -0.15, 0.15, 1, 0.15, P.seat);
  S.box(-0.35, 0, -0.92, 0.35, 0.025, 0.88, P.mat);
  S.box(-0.11, 1.95, -0.11, 0.11, 2.17, 0.11, P.marker);
  S.box(-0.3, 0, -0.5, 0.3, 0.27, 0.82, P.quilt);
  return S.geometry();
}

// The rig, in GLSL: rig(position, normal, out normal) gives the posed point in the frame of
// the scene. Shared by the figure and its shadow.
const RIG = /* glsl */ `
attribute vec4 aP; attribute vec4 aM; attribute vec3 aC; attribute vec3 aB; attribute vec4 aL; attribute float aPart;
uniform float uOff[16]; uniform float uPeopleScale; uniform float uMarkers; uniform float uWalk; uniform float uIdle;
varying vec3 vAC; varying float vIn;
vec3 turnY(vec3 v, float a) { float c = cos(a), s = sin(a); return vec3(c * v.x + s * v.z, v.y, -s * v.x + c * v.z); }
// Swing about x: a positive angle swings a hanging limb forward (+z).
vec3 fwdX(vec3 v, float a) { float c = cos(a), s = sin(a); return vec3(v.x, c * v.y + s * v.z, -s * v.y + c * v.z); }
// Swing about z: a positive angle swings a hanging limb out to +x.
vec3 outZ(vec3 v, float a) { float c = cos(a), s = sin(a); return vec3(c * v.x + s * v.y, -s * v.x + c * v.y, v.z); }
float h11(float x) { return fract(sin(x * 91.3458) * 47453.5453); }
vec3 rig(vec3 p, vec3 n, out vec3 nOut) {
  const float HIPY = ${J.hipY}, HIPX = ${J.hipX}, KNEEY = ${J.kneeY}, ANKY = ${J.ankY};
  const float SHOY = ${J.shoY}, SHOX = ${J.shoX}, ELBY = ${J.elbY}, NECKY = ${J.neckY}, HEADY = ${J.headY};
  int part = int(aPart + 0.5);
  float hdg = aM.x, gait = aM.y, pose = mod(aM.z, 16.0), seed = aM.w;
  bool furn = mod(aM.z, 32.0) > 15.5;
  float size = aL.x, prop = aL.y, real = mod(aL.z, 2.0), hat = floor(aL.z / 2.0);
  float t = uIdle + seed * 97.0;
  // hair: 0 and 3 short, 1 long, 2 a bun
  float style = floor(h11(seed * 13.0) * 4.0);
  if (size > 1.5) style = seed > 0.5 ? 2.0 : 0.0;
  if (size < 0.5) style = seed > 0.6 ? 1.0 : 0.0;
  if (part == 18 && style == 2.0) p = vec3(0.0, 1.6, -0.145) + (p - vec3(0.0, 1.47, -0.1)) * vec3(0.42, 0.38, 0.9);
  float hipL = 0.0, hipR = 0.0, kneeL = -0.04, kneeR = -0.04;
  float shL = 0.05, shR = 0.05, elL = 0.14, elR = 0.14, abL = 0.07, abR = 0.07;
  float lean = 0.0, nod = 0.0, turn = 0.0, lie = 0.0, twist = 0.0;
  if (gait > 0.5) {
    float cad = size < 0.5 ? 7.4 : size > 1.5 ? 4.8 : 6.0;
    float ph = uWalk * cad + seed * 6.2832, s = sin(ph), c = cos(ph);
    if (gait < 1.5) {
      hipL = 0.4 * s; hipR = -0.4 * s;
      kneeL = -0.06 - 0.75 * max(0.0, c); kneeR = -0.06 - 0.75 * max(0.0, -c);
      shL = -0.32 * s; shR = 0.32 * s; elL = elR = 0.3;
      lean = 0.07; twist = 0.08 * s;
    } else if (gait < 2.5) {
      hipL = 0.45 + 0.4 * s; hipR = 0.45 - 0.4 * s;
      kneeL = -0.35 - 0.7 * max(0.0, c); kneeR = -0.35 - 0.7 * max(0.0, -c);
      shL = -0.22 * s; shR = 0.22 * s; elL = elR = 0.4;
      lean = 0.2;
    } else {
      hipL = 0.6 + 0.35 * s; hipR = 0.6 - 0.35 * s; kneeL = -1.0 - 0.3 * s; kneeR = -1.0 + 0.3 * s;
      shL = 2.75 + 0.25 * s; shR = 2.75 - 0.25 * s; elL = elR = 0.3;
    }
  } else if (pose < 0.5) {
    // standing: a shift of weight, a look round, a hand when talking
    float w = sin(t * 0.6);
    hipL = 0.03 * w; hipR = -0.03 * w; shL += 0.03 * w; shR -= 0.03 * w;
    turn = 0.45 * sin(t * 0.21) * smoothstep(0.2, 0.6, sin(t * 0.13 + 1.0));
    float g = max(0.0, sin(t * 0.47 + seed * 5.0)); g *= g;
    shR += 0.55 * g; elR += 1.0 * g;
    if (seed > 0.6) { abL = abR = 0.32; elL = elR = 1.9; shL = shR = 0.25; } // arms folded
  } else if (pose < 2.5) {
    hipL = hipR = 1.5 + 0.08 * (seed - 0.5); kneeL = kneeR = -1.5;
    if (pose < 1.5) {
      shL = shR = 0.38; elL = elR = 0.95; lean = -0.04 + 0.12 * seed;
      float g = max(0.0, sin(t * 0.8 + seed * 7.0)); g *= g;
      shR += 0.45 * g; elR += 0.85 * g;
      turn = 0.35 * sin(t * 0.17 + seed * 3.0);
      if (seed > 0.7) { kneeL = -1.2; hipL = 1.75; } // one leg out
    } else {
      lean = 0.3; nod = 0.32; shL = shR = 0.78; elL = elR = 0.62;
      float w1 = sin(t * 8.0), w2 = sin(t * 6.3 + 1.3);
      shL += 0.05 * w1; shR += 0.05 * w2; elL += 0.09 * w2; elR += 0.09 * w1;
    }
  } else if (pose < 3.5) {
    lie = 1.0; abL = abR = 0.14; elL = elR = 0.12; shL = shR = 0.0; kneeL = kneeR = -0.05;
    if (seed < 0.25) { shR = 2.9; elR = 1.6; } // an arm under the head
  } else if (pose < 4.5) {
    lean = 0.24; nod = 0.35;
    shL = 0.72 + 0.2 * sin(t * 2.9); shR = 0.72 + 0.2 * sin(t * 2.9 + 2.2); elL = elR = 0.9;
    hipL = 0.05; hipR = -0.05; turn = 0.15 * sin(t * 0.4);
  } else if (pose < 5.5) {
    float e = 0.5 + 0.5 * sin(t * 0.9);
    shL = shR = 0.25 + 2.1 * e; abL = abR = 0.15 + 0.35 * (1.0 - e); elL = elR = 0.2;
    hipL = 0.12; hipR = -0.1; kneeL = kneeR = -0.35 * (1.0 - e); hipL += 0.17 * (1.0 - e); hipR += 0.17 * (1.0 - e);
  } else {
    hipL = hipR = 2.1; kneeL = kneeR = -2.45; lean = 0.5; shL = shR = 0.85; elL = elR = 0.7; nod = -0.25;
  }
  // a load in the right hand, or a sack on the shoulder
  bool held = prop == 2.0 || prop == 3.0 || prop == 4.0 || prop == 6.0;
  if (held && lie < 0.5) { shR = 0.06; elR = 0.1; abR = 0.2; }
  if (prop == 1.0 && lie < 0.5) { shR = 2.5; elR = 1.8; abR = 0.15; }
  if (size > 1.5 && lie < 0.5) { lean += 0.24; nod -= 0.18; }

  // the feet on the floor: how far the lowest ankle is above its place when standing
  vec3 kL = fwdX(vec3(0.0, KNEEY - HIPY, 0.0), hipL), aLk = kL + fwdX(vec3(0.0, ANKY - KNEEY, 0.0), hipL + kneeL);
  vec3 kR = fwdX(vec3(0.0, KNEEY - HIPY, 0.0), hipR), aRk = kR + fwdX(vec3(0.0, ANKY - KNEEY, 0.0), hipR + kneeR);
  float drop = lie > 0.5 ? 0.0 : min(aLk.y, aRk.y) - (ANKY - HIPY);

  if (lie > 0.5 && (part == 4 || part == 5)) p.z *= 0.6; // bare feet in bed
  vec3 q = p, m = n;
  bool upper = part >= 7 && part != 22 && part != 23 && part != 24 && part != 25;
  if (part <= 5) {
    bool L = part == 0 || part == 2 || part == 4;
    float sd = L ? 1.0 : -1.0, a = L ? hipL : hipR, k = L ? kneeL : kneeR;
    vec3 H = vec3(sd * HIPX, HIPY, 0.0);
    if (part <= 1) { q = H + fwdX(p - H, a); m = fwdX(n, a); }
    else { vec3 K = vec3(sd * HIPX, KNEEY, 0.0); q = H + fwdX(K - H, a) + fwdX(p - K, a + k); m = fwdX(n, a + k); }
  } else if ((part >= 8 && part <= 13) || (part == 21 && held)) {
    bool L = part == 8 || part == 10 || part == 12;
    float sd = L ? 1.0 : -1.0, a = L ? shL : shR, e = L ? elL : elR, ab = L ? abL : -abR;
    vec3 S = vec3(sd * SHOX, SHOY, 0.0);
    if (part == 8 || part == 9) { q = S + fwdX(outZ(p - S, ab), a); m = fwdX(outZ(n, ab), a); }
    else { vec3 E = vec3(sd * SHOX, ELBY, 0.0); q = S + fwdX(outZ(E - S, ab), a) + fwdX(outZ(p - E, ab), a + e); m = fwdX(outZ(n, ab), a + e); }
  }
  if (part >= 15 && part <= 20) {
    vec3 N = vec3(0.0, NECKY, 0.0);
    if (size < 0.5) q = vec3(0.0, HEADY, 0.0) + (q - vec3(0.0, HEADY, 0.0)) * 1.22;
    q = N + fwdX(turnY(q - N, turn), -nod); m = fwdX(turnY(m, turn), -nod);
  }
  if (upper) {
    vec3 C = vec3(0.0, HIPY, 0.0);
    q = C + fwdX(turnY(q - C, twist), -lean); m = fwdX(turnY(m, twist), -lean);
  }
  if (part != 22 && part != 23 && part != 25) q.y -= drop;
  if (part == 25) q.y += furn ? 0.0 : 0.03; // the quilt over a sleeper
  if (part == 22) q = vec3(q.x, q.y * (0.76 - drop), q.z - 0.03); // the stool, up to the seat
  if (part == 24) q.y += 0.06 * sin(uIdle * 3.0) - (lie > 0.5 ? 1.25 : 0.0);
  if (lie > 0.5 && part != 23 && part != 24 && part != 25) {
    q = fwdX(q, 1.5708) + vec3(0.0, furn ? 0.11 : 0.14, 0.78); m = fwdX(m, 1.5708);
  }
  // what is not there: no stool unless sitting on nothing; no mat unless lying on the floor
  bool sitting = gait < 0.5 && (pose > 0.5 && pose < 2.5);
  if (part == 22 && (!sitting || furn)) q = vec3(0.0);
  if (part == 23 && (lie < 0.5 || furn)) q = vec3(0.0);
  if (part == 25 && lie < 0.5) q = vec3(0.0);
  if (part == 21 && (prop < 0.5 || lie > 0.5)) q = vec3(0.0);
  if ((part == 19 || part == 20) && hat < 0.5) q = vec3(0.0);
  if (part == 18 && (style == 0.0 || style == 3.0 || hat > 0.5)) q = vec3(0.0);
  if (part == 24 && (real < 0.5 || uMarkers < 0.5)) q = vec3(0.0);
  // size: a child is smaller with a bigger head; an old person a little shorter
  if (size < 0.5) q *= vec3(0.8, 0.68, 0.8);
  else if (size > 1.5) q *= vec3(1.0, 0.96, 1.0);
  nOut = turnY(m, hdg);
  // the lift of the storey the person stands on (aP.w, a whole storey: people.js)
  float off = uOff[int(clamp(aP.w, 0.0, 15.0))];
  return turnY(q, hdg) * uPeopleScale + vec3(aP.x, aP.z + off, aP.y);
}
`;

// The colours of the parts, in linear RGB.
const PAINT = /* glsl */ `
vec3 paint() {
  int part = int(aPart + 0.5);
  float seed = aM.w, size = aL.x, prop = aL.y, hat = floor(aL.z / 2.0);
  vec3 skin = vec3(0.45, 0.25, 0.16) * (0.82 + 0.3 * h11(seed * 7.0));
  vec3 hairC = h11(seed * 3.0) < 0.8 ? vec3(0.012, 0.01, 0.008) : vec3(0.035, 0.022, 0.014);
  if (size > 1.5) hairC = h11(seed * 5.0) < 0.5 ? vec3(0.33, 0.31, 0.29) : vec3(0.6, 0.58, 0.55);
  vec3 hatC = hat < 1.5 ? vec3(0.03, 0.03, 0.045) : hat < 2.5 ? vec3(0.38, 0.37, 0.35) : vec3(0.03, 0.04, 0.16);
  float sh = h11(seed * 11.0);
  vec3 shoe = sh < 0.5 ? vec3(0.02, 0.018, 0.016) : sh < 0.75 ? vec3(0.09, 0.05, 0.03) : sh < 0.9 ? vec3(0.32, 0.3, 0.27) : vec3(0.5, 0.06, 0.04);
  float st = h11(seed * 17.0);
  vec3 stool = st < 0.3 ? vec3(0.58, 0.04, 0.03) : st < 0.55 ? vec3(0.03, 0.13, 0.4) : st < 0.75 ? vec3(0.8, 0.77, 0.66) : st < 0.9 ? vec3(0.05, 0.27, 0.1) : vec3(0.15, 0.08, 0.04);
  bool asleep = aM.y < 0.5 && abs(mod(aM.z, 16.0) - 3.0) < 0.5;
  if (part <= 3 || part == 6) return aB;
  if (part <= 5) return asleep ? skin : shoe;
  if (part <= 11) return aC;
  if (part <= 15) return skin;
  if (part == 16) return vec3(0.01);
  if (part <= 18) return hairC;
  if (part == 19) return hatC;
  if (part == 20) return hatC * 0.4;
  if (part == 21) {
    if (prop == 1.0) return vec3(0.8, 0.8, 0.75);
    if (prop == 2.0) return vec3(0.28, 0.33, 0.4);
    if (prop == 3.0) return vec3(0.45, 0.3, 0.12);
    if (prop == 4.0) return vec3(0.6, 0.08, 0.04);
    if (prop == 5.0) return vec3(0.26, 0.15, 0.06);
    return vec3(0.9, 0.3, 0.05);
  }
  if (part == 22) return stool;
  if (part == 23) return h11(seed * 23.0) < 0.6 ? vec3(0.45, 0.36, 0.17) : vec3(0.5, 0.18, 0.12);
  if (part == 25) {
    float qc = h11(seed * 29.0);
    return qc < 0.2 ? vec3(0.48, 0.095, 0.07) : qc < 0.4 ? vec3(0.69, 0.22, 0.13) : qc < 0.6 ? vec3(0.11, 0.24, 0.39)
      : qc < 0.75 ? vec3(0.69, 0.46, 0.07) : qc < 0.9 ? vec3(0.16, 0.27, 0.1) : vec3(0.79, 0.76, 0.69);
  }
  return vec3(0.81, 0.54, 0.066);
}
// The shape and place of the thing someone carries, around the right hand, the shoulder or
// the hip: a unit box, moved and sized.
vec3 propShape(vec3 p) {
  float prop = aL.y;
  vec3 c = vec3(0.0), z = vec3(0.0);
  if (prop == 1.0) { c = vec3(-0.1, 1.48, -0.04); z = vec3(0.5, 0.22, 0.34); }
  else if (prop == 2.0) { c = vec3(-0.2, 0.62, 0.02); z = vec3(0.24, 0.27, 0.24); }
  else if (prop == 6.0) { c = vec3(-0.2, 0.6, 0.02); z = vec3(0.26, 0.3, 0.26); }
  else if (prop == 3.0) { c = vec3(-0.26, 0.66, 0.02); z = vec3(0.34, 0.2, 0.3); }
  else if (prop == 4.0) { c = vec3(-0.2, 0.5, 0.04); z = vec3(0.26, 0.56, 0.26); }
  else if (prop == 5.0) { c = vec3(0.25, 0.92, 0.02); z = vec3(0.1, 0.32, 0.3); }
  return c + p * z;
}
`;

const VERT_MAIN = /* glsl */ `
vec3 pIn = int(aPart + 0.5) == 21 ? propShape(position) : position;
vec3 rigN;
vec3 rigP = rig(pIn, normal, rigN);
vec3 objectNormal = rigN;`;

export function makeFigureMaterial(uniforms, plain) {
  const m = new THREE.MeshLambertMaterial({ color: 0xffffff });
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, uniforms);
    s.vertexShader = s.vertexShader
      .replace('#include <common>', `#include <common>\n${RIG}\n${PAINT}`)
      .replace('#include <beginnormal_vertex>', VERT_MAIN)
      .replace('#include <begin_vertex>', `
vec3 transformed = rigP;
vec3 col = paint();
// a little darker low down and under the chin, for depth
float y0 = position.y;
vAC = int(aPart + 0.5) == 24 ? col : col * aL.w * (0.82 + 0.18 * smoothstep(0.0, 0.9, y0));
vIn = aM.z > 31.5 ? 1.0 : 0.0;
vLamp = aM.z > 63.5 ? texture2D(uLampMap, (aP.xy - uLampBox.xy) * uLampBox.zw).rgb : vec3(-1.0);`)
      .replace('#include <uv_pars_vertex>', `#include <uv_pars_vertex>
uniform sampler2D uLampMap; uniform vec4 uLampBox; varying vec3 vLamp;`);
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vAC; varying float vIn; varying vec3 vLamp; uniform float uNight;`)
      .replace('#include <color_fragment>', `#include <color_fragment>\ndiffuseColor.rgb *= vAC;`)
      // At night, the tubes of the lanes light the people outdoors. In the rooms of the cut
      // storey, the lamp of the room lights them (lamps.js), and they are dim if it is off.
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
totalEmissiveRadiance += vAC * uNight * (vLamp.x < -0.5 ? vec3(0.1 + 0.34 * vIn) : 0.07 + 0.6 * min(vLamp, vec3(1.0)));`);
  };
  m.customProgramCacheKey = () => (plain ? 'kwc-people-plain' : 'kwc-people');
  return m;
}

// The shadow of a figure: the same rig.
export function makeFigureDepth(uniforms, plain) {
  const m = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, uniforms);
    s.vertexShader = s.vertexShader
      .replace('#include <common>', `#include <common>\n${RIG}\n${PAINT}`)
      .replace('#include <begin_vertex>', `vec3 pIn = int(aPart + 0.5) == 21 ? propShape(position) : position;
vec3 rigN;
vec3 transformed = rig(pIn, normal, rigN);`);
  };
  m.customProgramCacheKey = () => (plain ? 'kwc-people-depth-plain' : 'kwc-people-depth');
  return m;
}

export const figureGeometry = { fine: fineFigure, plain: plainFigure };

// Chan Kwan Leung's racing pigeons circle over his roof while he flies them, "usually in
// mid-afternoon when there was a lull in the number of landings at Kai Tak" (City of Darkness
// Revisited, p321). The size of the flock and its circle are INFERRED.
export class Flock {
  constructor(sim) {
    this.sim = sim;
    this.keeper = sim.agents.find((a) => a.role === 'pigeons') || null;
    this.n = 34;
    // Larger than a bird (0.34 m), thus the flock reads at the usual zoom.
    const g = new THREE.BoxGeometry(0.9, 0.12, 0.5);
    this.mesh = new THREE.InstancedMesh(g, new THREE.MeshLambertMaterial({ color: '#d9d6cf' }), this.n);
    this.mesh.frustumCulled = false;
    this.mesh.visible = false;
    this.seed = Array.from({ length: this.n }, (_, i) => [Math.sin(i * 12.9898) * 0.5 + 0.5, Math.sin(i * 78.233) * 0.5 + 0.5, Math.sin(i * 39.425) * 0.5 + 0.5]);
    this.m = new THREE.Matrix4();
  }
  get flying() {
    const a = this.keeper;
    return !!(a && a.act && a.act.startsWith('flying the pigeons') && !a.trip);
  }
  update(t, offsets) {
    const a = this.keeper;
    this.mesh.visible = this.flying;
    if (!this.mesh.visible) return;
    // over the keeper's roof, which is part of the block's top storey
    const b = this.sim.L.buildings[a.work.b];
    const y0 = b.floors * STOREY + offsets[Math.min(15, b.floors - 1)] + 9;
    for (let i = 0; i < this.n; i++) {
      const [r1, r2, r3] = this.seed[i];
      const ang = t * (0.55 + 0.1 * r1) + r2 * 1.4, rad = 16 + 9 * r3;
      const x = b.cx + Math.cos(ang) * rad, z = b.cz + Math.sin(ang) * rad * 0.8;
      const y = y0 + 5 * r1 + Math.sin(t * 2 + i) * 1.2;
      this.m.makeRotationY(-ang);
      this.m.setPosition(x, y, z);
      this.mesh.setMatrixAt(i, this.m);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
