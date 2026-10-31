// Shop signs: vertical blade signs on the faces of the buildings, with the names from the
// clearance files (GRS HKRS1255-3) drawn into one texture atlas. A floor whose trade is
// INFERRED gets only the generic word for its trade (牙科, 五金 and so on), never a name.
// The dentists' signs crowd Tung Tau Tsuen Road, as in the 1987-90 photos of that face.
import * as THREE from 'three';
import { STOREY } from './layout.js';
import { OUTSIDE, ROAD } from './footprint.js';
import { wallFrame } from './geom.js';

// Generic words for each trade (GRS trade key) and each floor use.
const TRADE_ZH = {
  dentist: '牙科', clinic: '醫務所', bonesetter: '跌打', medicine: '藥行', plastics: '塑膠廠', metal: '五金廠',
  electrical: '電器', toys: '玩具廠', garment: '製衣廠', textile: '織造廠', shoes: '皮鞋', fishball: '魚蛋',
  noodles: '麵廠', meat: '肉食', roastmeat: '燒臘', cakes: '餅家', food: '食品廠', catering: '伙食',
  eatinghouse: '飯店', cafe: '冰室', store: '士多', jewellery: '金行', optical: '眼鏡', salon: '髮廊',
  gas: '石油氣', laundry: '洗衣', furniture: '傢俬', factory: '工廠', printing: '印刷', plumbing: '水電工程',
  construction: '建築', trading: '公司', property: '置業', transport: '運輸', storage: '貨倉', school: '補習社',
  kaifong: '街坊福利會', temple: '福德祠',
};
const USE_ZH = {
  dentist: '牙科', clinic: '醫務所', medicine: '藥行', plastics: '塑膠廠', metal: '五金', garment: '製衣',
  foodfac: '食品', eating: '冰室', shop: '士多', works: '工廠', office: '公司', school: '補習社', kaifong: '街坊福利會',
};

// A sign's words: the Chinese name in the file, cut at a bracket or a second business.
function nameText(p) {
  let t = (p.nameZh || '').split(/[(（]|及|暨/)[0].replace(/[^㐀-鿿]/g, '');
  if (t.length < 2) t = TRADE_ZH[p.trade] || '';
  return t.slice(0, 8);
}

// Board colours measured in the photos (pp8, 61, 285). Most boards are white or cream with
// black brush characters; about one in ten is red, yellow or blue. No neon: at dusk the
// boards glow as lit boxes (pp152, 284).
const STYLES = [
  { bg: '#f4f1ea', fg: '#2a211d', bd: '#2a211d' },
  { bg: '#e7d9c9', fg: '#3d2721', bd: '#3d2721' },
  { bg: '#fdfefd', fg: '#362a31', bd: '#8a7f78' },
  { bg: '#ece2cf', fg: '#7a1f17', bd: '#7a1f17' },
  { bg: '#a75a49', fg: '#f3dcc2', bd: '#f3dcc2' },
  { bg: '#d99f76', fg: '#4b2013', bd: '#4b2013' },
  { bg: '#6f6290', fg: '#f4ead2', bd: '#f4ead2' },
];
const PLAIN = 4; // styles before this are the white and cream boards
const pickStyle = (rng) => (rng() < 0.1 ? PLAIN + Math.floor(rng() * (STYLES.length - PLAIN)) : Math.floor(rng() * PLAIN));
const FONTS = [
  '900 {s}px "PingFang TC", "Heiti TC", "Noto Sans TC", "Microsoft JhengHei", sans-serif',
  '700 {s}px "Songti TC", "Noto Serif TC", "PMingLiU", serif',
  '400 {s}px "Kaiti TC", "BiauKai", "DFKai-SB", "Songti TC", serif',
];

const CW = 48, CH = 192, SIZE = 2048, COLS = Math.floor(SIZE / CW), ROWS = Math.floor(SIZE / CH);

// Plan where each sign hangs: a list of { b, s (storey), e (ring edge), u, text, style, font }.
export function planSigns(L, rng) {
  const out = [];
  const B = L.buildings;
  for (const b of B) {
    if (b.kind === 'yamen' || !b.rings.length) continue;
    for (let f = 0; f < b.floors; f++) {
      const use = b.uses[f];
      if (use === 'home' || use === 'youth' || use === 'temple') continue;
      const words = [];
      for (const p of b.prem[f] || []) {
        const t = nameText(p);
        if (t) words.push({ t, trade: p.trade });
      }
      if (!words.length && USE_ZH[use]) words.push({ t: USE_ZH[use], trade: use });
      if (!words.length) continue;
      // A ground-floor shop hangs its sign on the face of the first floor.
      const s = f === 0 && b.floors > 1 ? 1 : f;
      const edges = [];
      for (const ring of b.rings)
        for (const e of ring.edges) {
          if (e.other >= 0 && B[e.other].floors > s) continue;
          const fr = wallFrame(e);
          if (fr.len < 1.8 || e.other >= 0) continue;
          edges.push({ e, fr, street: e.other === OUTSIDE || e.other === ROAD });
        }
      if (!edges.length) continue;
      const pool = edges.some((x) => x.street) ? edges.filter((x) => x.street) : edges;
      let total = 0;
      for (const x of pool) total += x.fr.len;
      for (const w of words.slice(0, 3)) {
        const n = w.trade === 'dentist' && pool[0].street ? 2 : 1;
        for (let q = 0; q < n; q++) {
          let r = rng() * total, pick = pool[0];
          for (const x of pool) { r -= x.fr.len; if (r <= 0) { pick = x; break; } }
          out.push({
            b: b.id, s, e: pick.e, u: 0.7 + rng() * (pick.fr.len - 1.4), text: w.t,
            style: pickStyle(rng),
            font: Math.floor(rng() * FONTS.length), w: 0.75 + rng() * 0.4, o: 0.25 + rng() * 0.35,
          });
        }
      }
    }
  }
  return out;
}

// All sign faces drawn into one canvas. Each sign is one column of characters.
export class SignAtlas {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvas.height = SIZE;
    this.g = this.canvas.getContext('2d');
    this.cells = new Map();
  }
  // UV box [u0, v0, u1, v1] and the drawn height in cell widths, for a text in a style.
  cell(text, style, font) {
    const key = `${text}|${style}|${font}`;
    if (this.cells.has(key)) return this.cells.get(key);
    const n = this.cells.size;
    if (n >= COLS * ROWS) return this.cells.values().next().value;
    const col = n % COLS, row = Math.floor(n / COLS);
    const x = col * CW, y = row * CH, g = this.g, S = STYLES[style];
    const chars = [...text];
    const step = Math.min(44, (CH - 14) / chars.length);
    const used = Math.min(CH, Math.round(14 + step * chars.length));
    g.fillStyle = S.bg;
    g.fillRect(x, y, CW, used);
    g.strokeStyle = S.bd;
    g.lineWidth = 3;
    g.strokeRect(x + 4, y + 4, CW - 8, used - 8);
    g.fillStyle = S.fg;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = FONTS[font].replace('{s}', String(Math.round(Math.min(34, step * 0.86))));
    chars.forEach((ch, i) => g.fillText(ch, x + CW / 2, y + 7 + step * (i + 0.5)));
    const c = { uv: [x / SIZE, 1 - (y + used) / SIZE, (x + CW) / SIZE, 1 - y / SIZE], aspect: used / CW };
    this.cells.set(key, c);
    return c;
  }
  texture() {
    const t = new THREE.CanvasTexture(this.canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }
}

// A blade sign: two faces at right angles to the wall, each reading the right way round.
export function emitSign(S, sign, cell, white) {
  const fr = wallFrame(sign.e);
  const w = sign.w, h = w * cell.aspect;
  const o0 = sign.o, o1 = sign.o + w;
  const y0 = sign.s * STOREY + 0.45, y1 = y0 + h;
  const [u0, v0, u1, v1] = cell.uv;
  for (const side of [1, -1]) {
    const u = sign.u + side * 0.02;
    const P = (o, y) => [fr.A[0] + fr.t[0] * u + fr.n[0] * o, y, fr.A[1] + fr.t[1] * u + fr.n[1] * o];
    const N = [fr.t[0] * side, 0, fr.t[1] * side];
    // Seen from the +t side, the outer edge is on the left.
    const [oL, oR] = side > 0 ? [o1, o0] : [o0, o1];
    S.face([P(oL, y0), P(oR, y0), P(oR, y1), P(oL, y1)], N, white, [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], [0, 0, 0, 0]);
  }
}

export function makeSignMaterial(shared, map) {
  const m = new THREE.MeshLambertMaterial({ map });
  m.onBeforeCompile = (s) => {
    s.uniforms.uNight = shared.uNight;
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uNight;')
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * uNight * 0.9;');
  };
  m.customProgramCacheKey = () => 'kwc-sign';
  return m;
}
