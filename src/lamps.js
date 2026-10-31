// The lamps of the cut storey at night: one for each unit, on while someone in it is awake
// (crowd.js). Tungsten bulbs in the flats and fluorescent tubes in the corridors (HK01 2024:
// the reporter's words, from Lambot; primary-sources/retrospective-testimony-web); the
// workshops get tubes too. Where each lamp hangs is INFERRED: over the middle of the unit.
//
// Each frame the lamps draw their light into a map in plan (uLampMap over the box
// uLampBox = [x0, z0, 1 / width, 1 / depth]). The storey shader (cityMesh.js) and the people
// (figures.js) read it: a room with its lamp on is warm, and a room with no one awake is dim.
import * as THREE from 'three';

const WARM = new THREE.Color('#ffc887'), COOL = new THREE.Color('#e3eefc');

const VERT = /* glsl */ `
attribute vec4 aAt; attribute vec2 aSize; attribute vec4 aAxis; attribute vec3 aCol; attribute float aOn;
uniform vec4 uBox;
varying vec2 vQ; varying vec3 vCol;
void main() {
  vQ = position.xz; vCol = aCol * aOn;
  vec2 xz = aAt.xz + aAxis.xy * position.x * aSize.x + aAxis.zw * position.z * aSize.y;
  gl_Position = vec4((xz - uBox.xy) * uBox.zw * 2.0 - 1.0, 0.0, 1.0);
}`;
const FRAG = /* glsl */ `
varying vec2 vQ; varying vec3 vCol;
void main() {
  // full over the unit, a little brighter under the lamp, half at the walls, and none a hand
  // past them
  vec2 q = abs(vQ);
  float a = (1.0 - smoothstep(0.84, 1.0, max(q.x, q.y))) * (0.7 + 0.3 * (1.0 - smoothstep(0.0, 1.0, length(vQ))));
  gl_FragColor = vec4(vCol * a, 1.0);
}`;

export class Lamps {
  constructor(night, renderer) {
    this.night = night; // the shared uNight uniform
    this.renderer = renderer;
    this.mesh = null;
    this.on = null;
    this.keys = [];
    this.uMap = { value: null };
    this.uBox = { value: new THREE.Vector4(0, 0, 1, 1) };
    this.target = null;
    this.scene = new THREE.Scene();
    this.cam = new THREE.Camera();
    this.blank = false;
    this._c = new THREE.Color();
  }

  // The map covers the grid of layout L, at 4 texels a metre.
  setBox(L) {
    const w = Math.min(2048, Math.ceil(L.W * 4)), h = Math.min(2048, Math.ceil(L.D * 4));
    this.target = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, depthBuffer: false });
    this.uMap.value = this.target.texture;
    this.uBox.value.set(L.x0, L.z0, 1 / L.W, 1 / L.D);
    this.draw();
  }

  // The lamps of storey c (cityMesh.js buildPlan).
  set(c, lamps) {
    if (this.mesh) { this.scene.remove(this.mesh); this.mesh.geometry.dispose(); this.mesh = null; }
    this.blank = false;
    if (c < 0 || !lamps.length) return;
    const n = lamps.length;
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([-1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1], 3));
    g.setIndex([0, 2, 1, 0, 3, 2]);
    const at = new Float32Array(n * 4), size = new Float32Array(n * 2), axis = new Float32Array(n * 4), col = new Float32Array(n * 3);
    this.on = new Float32Array(n);
    this.keys = lamps.map((l, i) => {
      at.set([l.x, 0, l.z, 0], i * 4);
      size.set([l.ra + 0.12, l.rw + 0.12], i * 2);
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
      uniforms: { uBox: this.uBox },
      vertexShader: VERT,
      fragmentShader: FRAG,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(g, m);
    this.mesh.frustumCulled = false;
    this.scene.add(this.mesh);
  }

  // Fade each lamp toward on (someone awake in its unit) or off.
  update(lit, dt) {
    if (this.mesh) {
      const k = 1 - Math.exp(-dt * 4);
      for (let i = 0; i < this.on.length; i++) this.on[i] += ((lit.has(this.keys[i]) ? 1 : 0) - this.on[i]) * k;
      this.mesh.geometry.attributes.aOn.needsUpdate = true;
    }
    this.draw();
  }

  // Draw the light into the map; by day, or with no cut storey, clear it once.
  draw() {
    if (!this.target) return;
    const on = this.mesh && this.night.value > 0.005;
    if (!on && this.blank) return;
    const r = this.renderer, prev = r.getRenderTarget(), alpha = r.getClearAlpha();
    r.getClearColor(this._c);
    r.setRenderTarget(this.target);
    r.setClearColor(0x000000, 1);
    r.clear(true, false, false);
    if (on) r.render(this.scene, this.cam);
    r.setRenderTarget(prev);
    r.setClearColor(this._c, alpha);
    this.blank = !on;
  }
}
