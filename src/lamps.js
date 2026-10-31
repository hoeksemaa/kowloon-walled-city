// Pools of lamplight on the floors of the cut storey at night: one for each unit, on while
// someone in it is awake (crowd.js). "Tungsten bulbs light the flats, and fluorescent tubes
// light the corridors" (story.js); the workshops get tubes too. Where each lamp hangs is
// INFERRED: over the middle of the unit.
import * as THREE from 'three';
import { STOREY } from './layout.js';

const WARM = new THREE.Color('#ffb35c'), COOL = new THREE.Color('#d9ecff');

export class Lamps {
  constructor(night) {
    this.night = night; // the shared uNight uniform
    this.mesh = null;
    this.on = null;
    this.keys = [];
  }

  // The lamps of storey c (cityMesh.js buildPlan), in the group of that storey.
  set(c, lamps, group) {
    if (this.mesh) { this.mesh.parent.remove(this.mesh); this.mesh.geometry.dispose(); this.mesh = null; }
    if (c < 0 || !lamps.length) return;
    const n = lamps.length;
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1], 3));
    g.setIndex([0, 2, 1, 0, 3, 2]);
    const at = new Float32Array(n * 4), size = new Float32Array(n * 2), axis = new Float32Array(n * 4), col = new Float32Array(n * 3);
    this.on = new Float32Array(n);
    this.keys = lamps.map((l, i) => {
      at.set([l.x, c * STOREY + 0.07, l.z, 0], i * 4);
      size.set([l.ra * 0.95, l.rw * 0.95], i * 2);
      axis.set(l.axis, i * 4);
      (l.warm ? WARM : COOL).toArray(col, i * 3);
      return l.b * 4096 + l.u;
    });
    g.setAttribute('aAt', new THREE.InstancedBufferAttribute(at, 4));
    g.setAttribute('aSize', new THREE.InstancedBufferAttribute(size, 2));
    g.setAttribute('aAxis', new THREE.InstancedBufferAttribute(axis, 4));
    g.setAttribute('aCol', new THREE.InstancedBufferAttribute(col, 3));
    const on = new THREE.InstancedBufferAttribute(this.on, 1);
    on.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('aOn', on);
    g.instanceCount = n;
    const m = new THREE.ShaderMaterial({
      uniforms: { uNight: this.night },
      vertexShader: /* glsl */ `
attribute vec4 aAt; attribute vec2 aSize; attribute vec4 aAxis; attribute vec3 aCol; attribute float aOn;
varying vec2 vQ; varying vec3 vCol;
void main() {
  vQ = position.xz; vCol = aCol * aOn;
  vec2 xz = aAt.xz + aAxis.xy * position.x * aSize.x + aAxis.zw * position.z * aSize.y;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(xz.x, aAt.y, xz.y, 1.0);
}`,
      fragmentShader: /* glsl */ `
uniform float uNight; varying vec2 vQ; varying vec3 vCol;
void main() {
  // brightest under the lamp, fading to the walls of the unit
  float r = length(vQ);
  float a = (1.0 - smoothstep(0.0, 1.0, r)) * (0.55 + 0.45 * (1.0 - smoothstep(0.0, 0.5, r)));
  gl_FragColor = vec4(vCol * a * 0.7 * uNight, 1.0);
}`,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(g, m);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 2;
    group.add(this.mesh);
  }

  // Fade each lamp toward on (someone awake in its unit) or off.
  update(lit, dt) {
    if (!this.mesh) return;
    const k = 1 - Math.exp(-dt * 4);
    for (let i = 0; i < this.on.length; i++) this.on[i] += ((lit.has(this.keys[i]) ? 1 : 0) - this.on[i]) * k;
    this.mesh.geometry.attributes.aOn.needsUpdate = true;
  }
}
