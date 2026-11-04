# Notes for agents

- The 3D structure of `structure.html` is the DEFINITIVE structure of Kowloon Walled City
  (`src/city/`) and of its surroundings (`src/surroundings/`), frozen on 2026-11-04. Do not
  change it. `node tools/check_structure.mjs` fails if anything changes its geometry
  (`data/structure_frozen.json`). The colours are placeholders and can change. Change the
  structure only when John explicitly approves the change, for a large error that a new
  source shows. Then run
  `node tools/check_structure.mjs --refreeze`, and write the change, its source and the date
  in `docs/structure.md`.
- Build new work (art, visuals, simulation) on this structure. Keep the City and the
  surroundings separate: `src/city/` and `src/surroundings/` do not import each other.
- The old 3D city of the main app (`src/cityMesh.js`, `src/floorplan.js`, `src/facades.js`,
  `src/roofs.js`, `src/interiors.js`) is superseded. Do not build new work on it. Do not
  delete `src/floorplan.js`: `src/layout.js` still uses it.
- See `docs/structure.md` for the sources and the inferences of the structure.
