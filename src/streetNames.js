// The names of the streets of the City and of the roads round it, on the main app: one plate
// for each named lane of the plan (S.L.streets, with its Chinese name) and for each real road
// near the City (data/context.json). The clues of the mysteries name these streets.
//
// A plate is a sprite of the same look as the plates of the floor layers (dark, with light
// pixel ink), about 14 pixels high at each zoom. It shows through the buildings. A street name
// stands over its lane at the height of the roofs beside it; pulled apart, it goes down to the
// lane, with G/F; peeled, it stands at the peeled storey. A road name stands on its road, at the height of the roofs beside it (pulled apart: on the road).
import * as THREE from 'three';

const INK = '#ddd3b8', PLATE = 'rgba(28, 27, 25, 0.9)', ROAD_PLATE = 'rgba(28, 27, 25, 0.72)';
// Silkscreen is the one font of the app (John, 2026-11-07). It has no Chinese: the Chinese comes
// from the generic sans-serif of the browser, as in the panels.
const LATIN = (s) => `${8 * s}px Silkscreen, sans-serif`;
const CJK = (s) => `700 ${9 * s}px sans-serif`;
const isCJK = (ch) => /[㐀-鿿]/.test(ch);

// A plate with the text (Latin in the pixel font, Chinese in the sans-serif of the browser), as a sprite.
function plate(text, road) {
  const s = 4, c = document.createElement('canvas'), g = c.getContext('2d');
  // the runs of Latin and of Chinese
  const runs = [];
  for (const ch of text) {
    const cj = isCJK(ch);
    if (runs.length && runs[runs.length - 1].cj === cj) runs[runs.length - 1].t += ch;
    else runs.push({ cj, t: ch });
  }
  let w = 0;
  for (const r of runs) { g.font = r.cj ? CJK(s) : LATIN(s); r.w = g.measureText(r.t).width; w += r.w; }
  c.width = Math.ceil(w) + 10 * s; c.height = 13 * s;
  g.fillStyle = road ? ROAD_PLATE : PLATE;
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = INK; g.textBaseline = 'middle';
  let x = 5 * s;
  for (const r of runs) { g.font = r.cj ? CJK(s) : LATIN(s); g.fillText(r.t, x, c.height / 2 + (r.cj ? 0 : s / 2)); x += r.w; }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true, fog: false }));
  sp.renderOrder = 19;
  sp.userData.aspect = c.width / c.height;
  return sp;
}

export class StreetNames {
  // S: the structure; layers: CityLayers; context: data/context.json; heightAt(x, z): the ground.
  constructor(S, layers, context, heightAt) {
    this.S = S; this.layers = layers;
    this.group = new THREE.Group();
    this.list = [];
    const L = S.L, nodes = S.graph.nodes;
    // ---- the named lanes of the City ----
    for (const st of L.streets || []) {
      const cells = (L.streetLanes?.[st.key] || []).filter((k) => S.laneNode[k] >= 0);
      // the anchor: the lane cell nearest the anchor of the plan
      let best = -1, bd = Infinity;
      for (const k of cells) { const d = Math.hypot(L.cellX(k) - st.x, L.cellZ(k) - st.z); if (d < bd) { bd = d; best = k; } }
      const x = best >= 0 ? L.cellX(best) : st.x, z = best >= 0 ? L.cellZ(best) : st.z;
      const lane = best >= 0 ? nodes[S.laneNode[best]].y : heightAt(x, z);
      // the roofs and the storeys beside the lane
      const near = S.list.filter((B) => Math.hypot(B.cx - x, B.cz - z) < 14);
      const roof = near.length ? Math.max(...near.map((B) => B.top)) : lane + 10;
      const sp = plate(st.name, false);
      this.group.add(sp);
      this.list.push({ sp, x, z, lane, roof, near, street: true });
    }
    // ---- the real roads round the City: one plate for each road, where it is nearest ----
    const cx = L.x0 + L.W / 2, cz = L.z0 + L.D / 2, byName = new Map();
    for (const r of context?.roads || []) {
      if (!r.name || !r.line?.length) continue;
      for (const [x, z] of r.line) {
        const d = Math.hypot(x - cx, z - cz), o = byName.get(r.name);
        if (!o || d < o.d) byName.set(r.name, { d, x, z, r });
      }
    }
    const inner = new Set((L.streets || []).map((st) => st.name.split(/\s+[㐀-鿿]/)[0].replace(/ St$/, ' Street').replace(/ Rd$/, ' Road')));
    for (const [name, o] of byName) {
      // near the City box only, and not a road that is also a named lane of the plan
      const dx = Math.max(0, Math.abs(o.x - cx) - L.W / 2), dz = Math.max(0, Math.abs(o.z - cz) - L.D / 2);
      if (Math.hypot(dx, dz) > 60 || inner.has(name)) continue;
      const sp = plate(`${name}${o.r.nameZh ? ` ${o.r.nameZh}` : ''}`, true);
      this.group.add(sp);
      // beside the City, the plate stands at the height of the roofs next to the road: it
      // does not read as if the road ran through the City
      const y = heightAt(o.x, o.z), near = S.list.filter((B) => Math.hypot(B.cx - o.x, B.cz - o.z) < 22);
      this.list.push({ sp, x: o.x, z: o.z, lane: y, roof: near.length ? Math.max(y, ...near.map((B) => B.top)) : y, near, street: false });
    }
  }

  // Each frame: the height of each plate (with the spread and the peel of the layers), and its
  // size on the screen. heightPx: the height of the view, in pixels.
  update(camera, heightPx) {
    const Ly = this.layers, e = Ly.spread, c = Ly.peelK, a = THREE.MathUtils.smoothstep(e, 0.02, 0.5);
    const m = (camera.top - camera.bottom) / camera.zoom / heightPx, h = 14 * m;
    for (const t of this.list) {
      let top = t.roof;
      if (t.street && c >= 0) {
        // peeled: at the top of the peeled storey of the buildings beside the lane
        const ys = t.near.filter((B) => B.n > c).map((B) => B.y[c + 1]);
        top = ys.length ? Math.max(...ys) : t.lane + 3;
      }
      t.sp.position.set(t.x, (t.street ? top + (t.lane + 3 - top) * a : t.roof + (t.lane - t.roof) * a) + 1, t.z);
      t.sp.scale.set(h * t.sp.userData.aspect, h, 1);
    }
  }
}
