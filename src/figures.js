// The figures of the people (people.js), and the pigeon breeder's flock.
import * as THREE from 'three';
import { STOREY } from './layout.js';

// Instanced figures, positioned in the vertex shader so that storeys can be lifted apart
// without touching per-person data. Each figure is boxes with a part number: legs (bottom
// colour), body (top colour), head, hair, a prop, a hat, and a marker over a real person.
// A box has no bottom face, because the camera looks down.
const PART = { legs: 0, body: 1, head: 2, hair: 3, prop: 4, hat: 5, marker: 6 };
function figureGeometry() {
  const pos = [], nor = [], part = [], idx = [];
  const box = (x0, y0, z0, x1, y1, z1, p) => {
    const faces = [
      [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [0, 1, 0]],
      [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]],
      [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1]],
      [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0]],
      [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0]],
    ];
    for (const f of faces) {
      const v = pos.length / 3;
      for (let q = 0; q < 4; q++) { pos.push(...f[q]); nor.push(...f[4]); part.push(p); }
      idx.push(v, v + 1, v + 2, v, v + 2, v + 3);
    }
  };
  box(-0.2, 0, -0.14, 0.2, 0.62, 0.14, PART.legs);
  box(-0.25, 0.62, -0.17, 0.25, 1.22, 0.17, PART.body);
  box(-0.15, 1.24, -0.15, 0.15, 1.47, 0.15, PART.head);
  box(-0.16, 1.47, -0.16, 0.16, 1.56, 0.16, PART.hair);
  box(-0.5, -0.5, -0.5, 0.5, 0.5, 0.5, PART.prop);
  box(-0.19, 1.53, -0.19, 0.19, 1.61, 0.19, PART.hat);
  box(-0.11, 1.95, -0.11, 0.11, 2.17, 0.11, PART.marker);
  const g = new THREE.InstancedBufferGeometry();
  g.setIndex(idx);
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('aPart', new THREE.Float32BufferAttribute(part, 1));
  return g;
}

export function makePeopleMesh(sim, shared) {
  const n = sim.agents.length;
  const g = figureGeometry();
  const aP = new THREE.InstancedBufferAttribute(sim.aP, 4);
  aP.setUsage(THREE.DynamicDrawUsage);
  const aC = new THREE.InstancedBufferAttribute(sim.aC, 3);
  aC.setUsage(THREE.DynamicDrawUsage);
  const aL = new THREE.InstancedBufferAttribute(sim.aL, 4);
  aL.setUsage(THREE.DynamicDrawUsage);
  g.setAttribute('aP', aP);
  g.setAttribute('aC', aC);
  g.setAttribute('aB', new THREE.InstancedBufferAttribute(sim.aB, 3));
  g.setAttribute('aL', aL);
  g.instanceCount = n;
  const m = new THREE.MeshLambertMaterial({ color: 0xffffff });
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, shared);
    s.vertexShader = s.vertexShader
      .replace('#include <common>', `#include <common>
attribute vec4 aP; attribute vec3 aC; attribute vec3 aB; attribute vec4 aL; attribute float aPart;
varying vec3 vAC;
uniform float uOff[16]; uniform float uCutY; uniform float uPeopleScale; uniform float uMarkers;
vec3 turnY(vec3 v, float a) { float c = cos(a), s = sin(a); return vec3(c * v.x + s * v.z, v.y, -s * v.x + c * v.z); }`)
      .replace('#include <beginnormal_vertex>', `
float yaw = fract(sin(float(gl_InstanceID) * 12.9898) * 43758.5453) * 6.2832;
vec3 objectNormal = turnY(normal, yaw);`)
      .replace('#include <begin_vertex>', `
float size = aL.x, prop = aL.y, real = mod(aL.z, 2.0), hat = floor(aL.z / 2.0);
vec3 p = position;
vec3 col = aC;
if (aPart < 0.5) col = aB;
else if (aPart < 1.5) col = aC;
else if (aPart < 2.5) col = vec3(0.448, 0.239, 0.151);
else if (aPart < 3.5) col = size > 1.5 ? vec3(0.33, 0.31, 0.29) : vec3(0.012, 0.009, 0.007);
else if (aPart < 4.5) {
  // the prop: a unit box, moved and sized by its kind
  vec3 c = vec3(0.0), z = vec3(0.0);
  if (prop == 1.0) { c = vec3(0.1, 1.33, 0.0); z = vec3(0.52, 0.22, 0.34); col = vec3(0.8, 0.8, 0.75); }
  else if (prop == 2.0) { c = vec3(0.36, 0.17, 0.0); z = vec3(0.24, 0.28, 0.24); col = vec3(0.28, 0.33, 0.4); }
  else if (prop == 6.0) { c = vec3(0.36, 0.17, 0.0); z = vec3(0.26, 0.3, 0.26); col = vec3(0.9, 0.3, 0.05); }
  else if (prop == 3.0) { c = vec3(0.37, 0.42, 0.0); z = vec3(0.36, 0.2, 0.3); col = vec3(0.45, 0.3, 0.12); }
  else if (prop == 4.0) { c = vec3(0.36, 0.3, 0.0); z = vec3(0.26, 0.56, 0.26); col = vec3(0.6, 0.08, 0.04); }
  else if (prop == 5.0) { c = vec3(0.3, 0.72, 0.0); z = vec3(0.12, 0.36, 0.32); col = vec3(0.26, 0.15, 0.06); }
  p = c + p * z;
} else if (aPart < 5.5) {
  if (hat < 0.5) p = vec3(0.0);
  col = hat < 1.5 ? vec3(0.03, 0.03, 0.045) : hat < 2.5 ? vec3(0.38, 0.37, 0.35) : vec3(0.03, 0.04, 0.16);
} else {
  // the marker of a real person, in the story only
  if (real < 0.5 || uMarkers < 0.5) p = vec3(0.0);
  col = vec3(0.81, 0.54, 0.066);
}
if (size < 0.5) p *= vec3(0.8, 0.66, 0.8);
else if (size > 1.5 && aPart < 5.5) { p.y *= 0.93; p.x += max(p.y - 0.8, 0.0) * 0.3; }
vec3 transformed = turnY(p, yaw) * uPeopleScale;
float lv = clamp(aP.w, 0.0, 14.99);
int i0 = int(floor(lv));
int i1 = min(i0 + 1, 15);
float off = mix(uOff[i0], uOff[i1], fract(lv));
transformed += vec3(aP.x, aP.z + off, aP.y);
vAC = aPart > 5.5 ? col : col * aL.w;
if (aP.w < -0.5 || aP.z > uCutY) transformed = vec3(0.0, -1.0e5, 0.0);`);
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>
varying vec3 vAC;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
diffuseColor.rgb *= vAC;`);
  };
  m.customProgramCacheKey = () => 'kwc-people';
  const mesh = new THREE.Mesh(g, m);
  mesh.frustumCulled = false;
  return { mesh, aP, aC, aL };
}

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
    const b = this.sim.L.buildings[a.work.b], k = Math.min(15, b.floors);
    const y0 = b.floors * STOREY + offsets[Math.min(15, k)] + 9;
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
