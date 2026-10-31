// The layered view with a cut storey: each storey below the cut is darker and greyer than the
// one above it, so the shapes of the cut storey stand out. The dim comes in as the storeys move
// apart. In the normal view there is none: the light is that of the sun and the lamps.
//
// The values are uniforms, thus they can be tuned from the console with no new shader, for
// example kwc.dim.uDimKeep.value[0] = 0.35. The lines and labels read them on their next update.
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
export function withDim(s, level, uLevel) {
  Object.assign(s.uniforms, DIM);
  if (uLevel) s.uniforms.uLevel = uLevel;
  s.fragmentShader = s.fragmentShader
    .replace('#include <common>', `#include <common>\n${uLevel ? 'uniform float uLevel;' : ''}${DIM_GLSL}`)
    .replace('#include <opaque_fragment>', `outgoingLight = layerDim(outgoingLight, ${level});\n#include <opaque_fragment>`);
}

// The same on the CPU, for the wires and the storey labels: [light kept, grey] on storey k.
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
