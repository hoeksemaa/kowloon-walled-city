# Notes for agents

- The 3D structure of `structure.html` is the DEFINITIVE structure of Kowloon Walled City
  (`src/city/`) and of its surroundings (`src/surroundings/`), frozen on 2026-11-04. Do not
  change it. `node tools/check_structure.mjs` fails if anything changes its geometry
  (`data/structure_frozen.json`). Change the structure only when John explicitly approves the
  change, for a large error that a new source shows. Then run
  `node tools/check_structure.mjs --refreeze`, and write the change, its source and the date
  in `docs/structure.md`.
- The structure has no colours. `src/city/` and `src/surroundings/` name the parts of the
  structure; the code that draws them gives the colours (`colorOf` in `buildMesh`, `colors` in
  `buildGround`). The structure viewer and the main app keep their placeholder colours in
  `src/structureColors.js`. Do not put colours in the structure or in the data.
- Build new work (art, visuals, simulation) on this structure. Keep the City and the
  surroundings separate: `src/city/` and `src/surroundings/` do not import each other.
- The main app (`index.html`, `src/main.js`) draws this structure as floor layers
  (`src/cityLayers.js`), since 2026-11-06. The code of the old 3D city (its people, labels,
  game, floor plans and checks) was deleted on 2026-11-07; the git history keeps it.
  `src/layout.js` (with `src/footprint.js`) still reads the plan for the structure: a change to
  it must keep `node tools/check_structure.mjs` at ok.
- The life of the main app is in `src/life/` (since 2026-11-06): the people and their
  households and days, the things in the rooms, the utilities, the ten mysteries and the lit
  windows. `src/streetNames.js` gives the street names. John's aim for it: a rich and accurate
  simulation of how the people of the City lived. Give each fact its source, and mark each
  guess INFERRED.
- See `docs/structure.md` for the sources and the inferences of the structure.
- Chinese names (a permanent rule of John's, for the whole repo): English is the main language
  of the repo. The Chinese names are flavour beside the English names, not a new label. Beside
  the English name of each place, street, building, temple, school, organization, business,
  person and source that has a Chinese original, write the Chinese name in traditional
  characters, for example Tin Hau Temple (天后廟) or Lung Shing Road (龍城路). For a Japanese
  source, give its original title (『大図解 九龍城』). Do this in `primary-sources/`, in the docs
  and in each description in the repo, at the first mention in each file and where the name
  is the subject of a heading or a table row. Put the English name first ("Sang Kee
  Restaurant (生記飯店)"). If the sources give only a Chinese name, keep the Chinese name: do
  not make up an English translation. Quotations of sources stay as the source wrote them. Do
  not guess characters from a romanization: use a source (the repo's sources and data, or a
  checked outside source). If you cannot find the characters, write the English name only.
