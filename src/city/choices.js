// The random choices of the structure that stay put: the rate of doors of each pair of
// buildings, which floors get a door or a bridge, the ladders, the holes, and the SW-NE
// route. Each choice has a key: the kind of choice, the buildings (by the lowest plot code of
// each, thus a key does not change when an outline changes) and the floor.
//
// data/structure_choices.json keeps the choices of the model as John approved it (2026-11-03,
// the outlines of the 1 m plan). The model uses a kept choice where its key comes up again.
// A choice that has no kept value takes a number from a hash of its key, thus it does not
// change when another choice changes. Make a new file with
//
//     node tools/check_structure.mjs --record
//
// In record mode, each choice takes the next number of the old random sequence (as before this
// file), and the model saves the choice under its key. No three.js here.
import { mulberry32 } from '../util.js';

// A number in [0, 1) from a string.
function hash01(seed, s) {
  let h = (2166136261 ^ seed) >>> 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  h = Math.imul(h ^ (h >>> 15), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// kept: the parsed data/structure_choices.json, or null. record: true to make a new file.
export function makeChoices(kept = null, record = false) {
  const u = kept && !record ? kept.u || {} : {};
  const out = { u: {}, take: {}, chain: null, seeds: {}, layout: {}, storeys: {} };
  const streams = new Map();
  return {
    record,
    kept: kept && !record ? kept : null,
    out,
    // A number in [0, 1) for the choice with this key. stream: the seed of the old random
    // sequence of this choice (record mode only).
    num(key, stream) {
      let v;
      if (record) {
        if (!streams.has(stream)) streams.set(stream, mulberry32(stream));
        v = streams.get(stream)();
      } else v = key in u ? u[key] : hash01(stream, key);
      out.u[key] = v;
      return v;
    },
    // The seed of the own random numbers of a building (its heights, its flats): the kept seed
    // of this key, or else v.
    seed(key, v) {
      const s = record || !kept?.seeds || !(key in kept.seeds) ? v : kept.seeds[key];
      out.seeds[key] = s;
      return s;
    },
    // What the layout gave a building (src/layout.js draws it in one sequence over the towers,
    // thus a new tower moves it): its storeys, its kind, the source of its storeys and its
    // name. The kept value of this key, or else v.
    layout(key, v) {
      const s = record || !kept?.layout || !(key in kept.layout) ? v : kept.layout[key];
      out.layout[key] = s;
      return s;
    },
    // The storeys that the roofline gave a building with no source for its storeys (model.js).
    // The roofline is read at the centre of the building, thus a new outline can move it by a
    // storey. The kept value of this key, or else v.
    storeys(key, v) {
      const s = record || !kept?.storeys || !(key in kept.storeys) ? v : kept.storeys[key];
      out.storeys[key] = s;
      return s;
    },
    // The old sequence itself (record mode), or a hash of the key: for an order of candidates.
    order(key, stream) {
      if (record) {
        if (!streams.has(stream)) streams.set(stream, mulberry32(stream));
        return streams.get(stream)();
      }
      return hash01(stream, key);
    },
  };
}

// The file to save after a record run.
export function choicesFile(C) {
  const u = {};
  for (const k of Object.keys(C.out.u).sort()) u[k] = Math.round(C.out.u[k] * 1e6) / 1e6;
  return {
    about: 'The random choices of the 3D structure (src/city/choices.js), kept so that a change of the '
      + 'outlines keeps the links. u: a number in [0, 1) for each choice (a choice is made where u is less '
      + 'than its rate); take: the flats in two buildings and the holes, in order; chain: the buildings of '
      + 'the SW-NE route, SW to NE; chainLinks: its links (two buildings and a floor); seeds: the '
      + 'seed of the own random numbers of each building (its heights, its flats); layout: the storeys, kind, '
      + 'source of the storeys and name that the layout gave each building; storeys: the storeys that the roofline gave each '
      + 'building with no source for its storeys. Each building is the lowest code of its plots. INFERRED: all '
      + 'of these are random draws, not sources.',
    made: C.out.made || null,
    u, take: C.out.take, chain: C.out.chain, chainLinks: C.out.chainLinks, seeds: C.out.seeds, layout: C.out.layout,
    storeys: C.out.storeys,
  };
}
