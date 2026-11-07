// The light and the time of day of the main app and of the structure viewer: the sun over Hong
// Kong in the week of the model, the sky, and the haze. The surroundings themselves are in
// src/surroundings/ (docs/structure.md).
import * as THREE from 'three';
import { clamp, smoothstep } from './util.js';

// The haze (main.js, structureViewer.js): all is clear out to FADE_NEAR metres from the centre
// of the City, then fades slowly into the sky, and is gone at FADE_FAR. Nothing is drawn beyond.
const FADE_NEAR = 350, FADE_FAR = 600;

// ---- light and time of day ----------------------------------------------------------------
// The sky, which is also the colour of the haze, in sRGB by the height of the sun in degrees.
// By day a pale grey, a little lighter than the lit ground, so that the city around melts into
// it; warmer as the sun goes down. At night a dark slate, darker than the walls, so that the lit
// windows stand out, with a dark afterglow near sunset and sunrise. Lighting mixes the two on
// the curve of the night (the value that update returns).
const SKY_DAY = [[-6, '#9c8174'], [4, '#b39b88'], [14, '#bfb8aa'], [30, '#c9c7c0'], [45, '#d0cfc9']];
const SKY_NIGHT = [[-14, '#1e1f26'], [-5, '#28262c'], [3, '#3b3334']];
const rgbOf = (t) => t.map(([a, c]) => [a, new THREE.Color(c).getRGB({}, THREE.SRGBColorSpace)]);
const skyDay = rgbOf(SKY_DAY), skyNight = rgbOf(SKY_NIGHT);

function skyAt(table, alt) {
  if (alt <= table[0][0]) return table[0][1];
  for (let i = 0; i < table.length - 1; i++) {
    const [a0, c0] = table[i], [a1, c1] = table[i + 1];
    if (alt <= a1) {
      const t = (alt - a0) / (a1 - a0);
      return { r: c0.r + (c1.r - c0.r) * t, g: c0.g + (c1.g - c0.g) * t, b: c0.b + (c1.b - c0.b) * t };
    }
  }
  return table[table.length - 1][1];
}

export class Lighting {
  constructor(scene, center, site) {
    this.scene = scene;
    this.center = center;
    this.north = site.north;
    this.east = site.east;
    this.hemi = new THREE.HemisphereLight('#dcd9cc', '#4a4540', 1.2);
    scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight('#fff3df', 1.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(4096, 4096);
    const s = this.sun.shadow.camera;
    s.left = -190; s.right = 190; s.top = 190; s.bottom = -190; s.near = 10; s.far = 900;
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.05;
    scene.add(this.sun, this.sun.target);
    this.sky = new THREE.Color();
    scene.background = this.sky;
    // fogNear and fogFar carry the radii of the haze (main.js).
    scene.fog = new THREE.Fog(this.sky, FADE_NEAR, FADE_FAR);
  }

  // Fit the shadow map to the part of the city in view (x, z, half size r): close up, the
  // shadows of furniture and people are sharp.
  setFocus(x, z, r) {
    this.focus = [x, z];
    const s = this.sun.shadow.camera;
    if (Math.abs(s.right - r) > 0.5) { s.left = -r; s.right = r; s.top = r; s.bottom = -r; s.updateProjectionMatrix(); }
  }

  // The sun over Hong Kong in the week of 16-22 Dec 1986: latitude 22.33° N, declination
  // -23.4°, solar noon at about 12:22 HKT. Sunrise about 06:57, sunset about 17:45.
  update(hour, explodeLift) {
    const D = Math.PI / 180, phi = 22.33 * D, dec = -23.4 * D;
    const H = (hour - 12.37) * 15 * D;
    const sinAlt = Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H);
    const alt = Math.asin(sinAlt) + 0.83 * D; // with refraction
    let az = Math.acos(clamp((Math.sin(dec) - sinAlt * Math.sin(phi)) / (Math.cos(Math.asin(sinAlt)) * Math.cos(phi)), -1, 1));
    if (H > 0) az = 2 * Math.PI - az; // bearing from north
    const elev = clamp(alt / (44.3 * D), 0, 1);
    const light = smoothstep(0.0, 0.25, elev) * (alt > 0 ? 1 : 0);
    const r = 420;
    const e = Math.max(0.16, alt);
    const c = this.focus ? { x: this.focus[0], y: this.center.y, z: this.focus[1] } : this.center, N = this.north, E = this.east;
    const hx = E[0] * Math.sin(az) + N[0] * Math.cos(az), hz = E[1] * Math.sin(az) + N[1] * Math.cos(az);
    this.sun.position.set(c.x + hx * r * Math.cos(e), c.y + explodeLift * 0.5 + Math.sin(e) * r, c.z + hz * r * Math.cos(e));
    this.sun.target.position.set(c.x, c.y + explodeLift * 0.5, c.z);
    this.sun.intensity = 0.15 + 1.5 * light;
    this.sun.color.setHSL(0.09, 0.5 - 0.35 * elev, 0.82 + 0.1 * elev);
    this.hemi.intensity = 0.62 + 0.7 * smoothstep(-0.05, 0.3, elev);
    this.hemi.color.set(light > 0.05 ? '#dcd9cc' : '#8e96b0');
    const night = 1 - smoothstep(0.02, 0.35, elev);
    // The sky and the haze: day and night mixed by the night.
    const d = skyAt(skyDay, alt / D), n = skyAt(skyNight, alt / D);
    this.sky.setRGB(d.r + (n.r - d.r) * night, d.g + (n.g - d.g) * night, d.b + (n.b - d.b) * night, THREE.SRGBColorSpace);
    this.scene.fog.color.copy(this.sky);
    return night;
  }
}
