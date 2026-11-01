// The layered view with a cut storey: each storey below the cut is darker and greyer than the
// one above it, so the shapes of the cut storey stand out. The dim comes in as the storeys move
// apart. In the normal view there is none: only the sun, the sky and the lamps light the city.
//
// The values are uniforms, thus you can tune them from the console with no new shader, for
// example kwc.dim.uDimKeep.value[0] = 0.35. The labels read them in each frame. The wires read
// them at their next update, that is, at the next cut or change of the explode.
export const DIM = {
  uDimCut: { value: -1 }, // the cut storey; -1 with no cut
  uDimOn: { value: 0 }, // 0 in the normal view, 1 with the storeys fully apart
  // The light kept one, two, three, and four or more storeys below the cut, in linear light.
  // Tuned by eye: with 0.42 one storey down, the sunlit roofs of the storey below were nearly
  // as bright as the plan of the cut storey (median 64 against 84 in sRGB).
  uDimKeep: { value: [0.3, 0.18, 0.13, 0.12] },
  // The grey mixed in for each storey below the cut, and the most grey.
  uDimGrey: { value: [0.3, 0.6] },
};

const LUMA = [0.2126, 0.7152, 0.0722];

// The dim in GLSL: layerDim(colour, storey) gives the colour in linear light.
export const DIM_GLSL = /* glsl */ `
uniform float uDimCut; uniform float uDimOn; uniform vec4 uDimKeep; uniform vec2 uDimGrey;
vec3 layerDim(vec3 c, float lvl) {
  float d = uDimCut < 0.0 ? 0.0 : floor(uDimCut - lvl + 0.5);
  if (d < 0.5 || uDimOn <= 0.0) return c;
  float keep = d < 1.5 ? uDimKeep.x : d < 2.5 ? uDimKeep.y : d < 3.5 ? uDimKeep.z : uDimKeep.w;
  c = mix(c, vec3(dot(c, vec3(${LUMA.join(', ')}))), min(uDimGrey.y, uDimGrey.x * d) * uDimOn);
  return c * mix(1.0, keep, uDimOn);
}`;

// For onBeforeCompile: dim the final light of a built-in material (lit, emissive and all, so
// that a lit window or a sign below the cut drops under the bloom) by the storey level, a GLSL
// expression. uLevel: a uniform { value } that level can name, for a material of one storey.
// A material of dimSwitch has the dim code only while setDimCode(true).
export function withDim(s, level, uLevel) {
  Object.assign(s.uniforms, DIM);
  if (uLevel) s.uniforms.uLevel = uLevel;
  s.fragmentShader = s.fragmentShader
    .replace('#include <common>', `#include <common>\n${uLevel ? 'uniform float uLevel;' : ''}${DIM_GLSL}`)
    .replace('#include <opaque_fragment>', `#if !defined(DIM_SWITCH) || defined(DIM_ON)
outgoingLight = layerDim(outgoingLight, ${level});
#endif
#include <opaque_fragment>`);
}

// The dim code costs the shader of the buildings 0.6-0.9 ms of the 29 ms of GPU time of a
// night frame, also with the dim off. By day, and in the other shaders, the cost is too small
// to measure. Thus the materials of the buildings have two programs: one with the dim code,
// for the layered view, and one with none, for the normal view. Both compile at the start
// (compileDim), thus the first layered view does not stall: the change of program then adds
// about 2 ms to one frame.
const SWITCHED = new Set();
let codeOn = false;

// Give material m the two programs.
export function dimSwitch(m) {
  m.defines = { ...m.defines, DIM_SWITCH: '' };
  if (codeOn) m.defines.DIM_ON = '';
  SWITCHED.add(m);
  return m;
}

// The dim code: on in the layered view, off in the normal view.
export function setDimCode(on) {
  if (on === codeOn) return;
  codeOn = on;
  for (const m of SWITCHED) {
    if (on) m.defines.DIM_ON = '';
    else delete m.defines.DIM_ON;
    m.needsUpdate = true;
  }
}

// Compile the programs with the dim code of the meshes now, for each render target (null: the
// screen), in the scene that gives the lights and the fog.
export function compileDim(renderer, scene, camera, meshes, targets) {
  const was = renderer.getRenderTarget();
  setDimCode(true);
  for (const t of targets) {
    renderer.setRenderTarget(t);
    for (const m of meshes) renderer.compile(m, camera, scene);
  }
  renderer.setRenderTarget(was);
  setDimCode(false);
}

// The same on the CPU, for the wires: [light kept, grey] on storey k.
export function dimOf(k) {
  const cut = DIM.uDimCut.value, on = DIM.uDimOn.value, d = cut < 0 ? 0 : Math.round(cut - k);
  if (d < 1 || on <= 0) return [1, 0];
  const keep = DIM.uDimKeep.value[Math.min(d, 4) - 1];
  return [1 + (keep - 1) * on, Math.min(DIM.uDimGrey.value[1], DIM.uDimGrey.value[0] * d) * on];
}

// Colour c ({ r, g, b } in linear light) as it is on storey k, written to out.
export function dimColor(c, k, out) {
  const [keep, grey] = dimOf(k);
  const y = LUMA[0] * c.r + LUMA[1] * c.g + LUMA[2] * c.b;
  out.r = (c.r + (y - c.r) * grey) * keep;
  out.g = (c.g + (y - c.g) * grey) * keep;
  out.b = (c.b + (y - c.b) * grey) * keep;
  return out;
}
