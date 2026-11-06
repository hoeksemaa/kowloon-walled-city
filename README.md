# Kowloon Walled City (九龍城寨) · 1986

An explorable, real-time 3D model of Kowloon Walled City (九龍城寨) at its height. It
shows one ordinary week, Tuesday 16 to Monday 22 December 1986, which ends on 冬至.

## What the folders hold

- `src/`: the JavaScript of the two pages. The browser loads the modules as they are, with
  three.js from a CDN. There is no build step.
  - `src/city/`: **the City** of the definitive 3D structure, frozen on 2026-11-04.
    `model.js` (buildings, storeys, roofs), `plan.js` (stairs, corridors and units of each
    floor), `links.js` (doors, bridges, ladders, the route), `mesh.js` (the triangles),
    `fixes.js` and `choices.js` (they apply the two structure data files), `poly.js`.
  - `src/surroundings/`: **the surroundings** of the structure. `ground.js` (the terrain,
    roads, paths, courts and the real buildings of 1986) and `shapes.js` (their solids).
  - `src/structureViewer.js` and `src/roomUses.js`: the viewer of `structure.html`, with the
    room uses of December 1986. `src/structureColors.js`: the placeholder colours of the
    viewer and the main app.
  - The main app of `index.html`: `main.js`, `cityLayers.js` (the structure as floor layers),
    `buildingPanel.js`, `notes.js`, `planes.js` with `approach.js`, `post.js` and
    `style.css`. The structure, the viewer and the main app also use `layout.js`,
    `footprint.js`, `floorplan.js`, `context.js`, `residents.js`, `terrain.js`, `site.js`,
    `env.js` (the light) and `util.js`.
  - Not loaded now: the people, the labels and the game of the main app (`people.js`,
    `routes.js`, `crowd.js`, `figures.js`, `game.js`, `labels.js`, `occlude.js`, `useMap.js`,
    `dim.js`, `kinds.js`, `geom.js`). They sat on the old 3D city of the main app, and wait
    to move onto the structure (see "Not yet on the structure" below).
- `data/`: the data that the code reads, mostly JSON.
  - The plan: `plan.json` (the 1980s street plan, traced on 1 m cells: lanes and 474 plots)
    and `plan_fine.json` (the same plan on 0.25 m cells, for the outlines of the structure).
  - The structure: `structure_fixes.json` (corrections to the plan and the towers, each with
    its source), `structure_choices.json` (the kept random choices) and
    `structure_frozen.json` (the fingerprint of the frozen structure).
  - The book and the clearance: `book.json` (facts, pages and short quotes from *City of
    Darkness Revisited*), `book_overlay.json` (numbers measured on its 1987 plan and 1992
    map) and `businesses.json` (459 premises from the GRS 政府檔案處 clearance files).
  - The room uses: `room_research.json` (771 research facts, each with its source and quote,
    and the disagreements and leads) and `room_uses.json` (the use of each of the 8,926
    units, with its basis: verified, likely or guess).
  - The people: `people.json` (183 real residents and workers of the City, each with a short
    description, their story, the facts of their life and the quotes of their sources, and
    the links between the people of one family or workplace). It is separate from the rooms:
    each person links to the research facts of the places where they lived or worked.
  - The ground and the surroundings: `terrain.json` (the height of the ground, out to 640 m),
    `context.json` (the real buildings, roads and open ground of December 1986, out to
    600 m), `surroundings.json` (streets, dirt paths, courts and fences round the City) and
    `CONTEXT-NOTICE.md` (the source and licence of the government data).
- `docs/`: reports in Markdown.
  - `structure.md`: the definitive 3D structure: the freeze, the fixes, the outlines, the
    kept choices and the model, with their sources and inferences.
  - `rooms.md`: how each room got its use: the sources, the method, the categories, the
    basis, the counts, the disagreements and the leads.
  - `people.md`: a generated list of the people of `data/people.json`, with their stories
    and the rooms of the model where they lived or worked.
  - `room_places.md`: a generated table of the 698 documented places and their units, and of
    the 54 places with no unit.
  - `plan-book-upgrade.md`: the plan of 2026-10-30 to upgrade the main app with *City of
    Darkness Revisited*.
- `tools/`: scripts that build the data and check the model. The top of each file tells what
  it does and how to run it.
  - `check_structure.mjs` fails if the frozen structure changes (with
    `structure_fingerprint.mjs`).
  - `build_room_uses.mjs` writes `data/room_uses.json` and `docs/room_places.md`.
  - `build_people.mjs` checks `data/people.json` and writes `docs/people.md`.
  - The builders of the data: `trace_plan.py` (the plan), `parse_grs.py`
    (`data/businesses.json`), `book_overlay.py` (`data/book_overlay.json`), `context.py`
    with its input `context_input.json` (`data/context.json`), and `terrain.py`
    (`data/terrain.json`).
  - `check_stack.js` checks the floor layers of the main app (it runs in the browser).
  - The checks of the layout, the surroundings data and the code that waits to move onto the
    structure: `check_layout.mjs`, `check_context.mjs` and `check_game.mjs`.
- `primary-sources/`: the evidence. One folder for each primary source: a record made at the
  time, or a first-hand account given later. Each folder has a `SOURCE.md` with the citation,
  link, licence, why the source is primary, and the key facts with their pages. If facts of
  `data/room_research.json` come from the source, the `SOURCE.md` also gives their ids.
  Open-licensed copies (photos, CSVs, HTML) are in git. Copyrighted copies stay in `local/`
  folders, which git ignores: they are on John's Mac only. `primary-sources/README.md` is the
  index: a table of the sources, the blocked links, and the leads not yet collected.
  - `city-of-darkness-revisited/`: Girard and Lambot's book (2014): photos, interviews, the
    1992 map, old documents and the clearance sheets.
  - `commons-photos-1972-1993/`: 11 open-licensed photos from Wikimedia Commons, in git.
  - `daizukai-kowloon-1997/`: 24 room labels of the cutaway panorama of 『大図解 九龍城』
    (1997). The panorama is a reconstruction, thus each label is a guess.
  - `grs-catalogue-kwc/`: the Government Records Service catalogue (CSV): the clearance
    files and the business compensation files.
  - `gwulo-suddaby-1987/` and `gwulo-other-photos/`: street and shop photos of 1987-88 on
    Gwulo.
  - `hk01-kaifong-series-2016/`: five members of the residents' association remember (HK01 香港01).
  - `hku-newspaper-clippings/`: an index of 334 SCMP (南華早報) and *Hong Kong Standard* (英文虎報) clippings,
    1969-97.
  - `legco-hansard-1986-1993/`: 22 sittings of the Legislative Council (立法局) that name the City.
  - `mplus-girard-lambot-photos/`: Girard's and Lambot's photos at M+, 1987-91.
  - `mplus-suenn-ho-ca17/`: the M+ catalogue of Suenn Ho's (何巽) field research, 1988-92.
  - `press-articles-1959-1992/`: TIME (1959) and *Baltimore Sun* (1992) reports.
  - `retrospective-testimony-web/`: former residents, workers and visitors remember, on the
    web (2009-2024).
  - `uk-lords-hansard-1974/`: a House of Lords debate of 1974, with a first-hand account.
  - `upi-reports-1984-1987/`: UPI wire reports of 1984 and 1987.
  - `wsj-kwc-2014/`: the WSJ interactive of 2014: residents, rents and the 1983 trade count.
- The root files: `index.html` (the main app), `structure.html` (the viewer of the
  definitive 3D structure), `serve.py` (a local server that turns off the browser cache),
  `CLAUDE.md` (notes for agents), `.gitignore` and `.vercelignore`.
- Local folders that git does not hold: `.playwright-mcp/` (screenshots and logs of browser
  sessions), `.claude/` (files of Claude Code) and `.vercel/` (the Vercel project link).

## The definitive 3D structure

**The 3D structure of `structure.html` is the definitive 3D structure of the City and of the
terrain and city round it (2026-11-04).** All later work (art, visuals, simulation) builds on
it. It is frozen: `node tools/check_structure.mjs` fails if anything changes its geometry
(the structure has no colours: the viewer gives them). Change it
only for a large error that a new source shows, and only when John approves it. See
[docs/structure.md](docs/structure.md).

- `src/city/`: **the City**, the focus of the work: each building, its storeys, floors,
  stairs, rooms and roofs, the links between buildings, and a route inside the buildings
  from the SW corner to the NE corner.
- `src/surroundings/`: **the surroundings**, context only: the terrain, the roads, paths and
  courts, and the real buildings of 1986 round the City.
- `src/structureViewer.js` (`structure.html`): the viewer, which puts the two together. The
  main app (below) puts them together too. Its "Room uses" panel (`src/roomUses.js`, `data/room_uses.json`) shows one floor of
  each building at a time, colours each room by its use in December 1986 or by its certainty
  (verified, likely, guess), filters the rooms by category and certainty, and finds a
  documented place by name. A click on a room gives its use, its certainty and its sources.
  See [docs/rooms.md](docs/rooms.md).

The two parts do not import each other. The structure has no colours: the viewer and the
main app give their placeholder colours (`src/structureColors.js`). Only the structure is
definitive. Each earlier 3D model of the City is superseded. The old 3D city of the main app
is deleted.

## Run

```sh
python3 serve.py 8173
# open http://127.0.0.1:8173/structure.html   the definitive 3D structure
# open http://127.0.0.1:8173/                 the main app
```

## The main app

The main app (`index.html`, `src/main.js`) shows the definitive structure: the City
(`src/city/`) on its surroundings (`src/surroundings/`), built as the viewer builds it. It
was made new on 2026-11-06, when John chose to start fresh with the structure. The 3D city
that it showed before (`cityMesh.js`, `facades.js`, `roofs.js`, `interiors.js`, `signs.js`) is
deleted.

- **Floor layers.** `src/cityLayers.js` draws the City as one layer for each floor index.
  Layer k holds the slab at floor k of each building and all that stands on it up to the
  next slab: the walls, rooms, partitions, stairs and links of that storey. The roof of a
  building of n storeys, with all that is on it (parapets, stair huts, roof rooms, ladders),
  is layer n.
- **Pull the floors apart (E).** All the G/F floors go in one layer, all the 1/F floors in
  the next, and so on. Each floor keeps its true place in its layer. The G/F floors range
  over 15 m of the slope (7.9 to 23.2 mPD), thus the G/F of a building up the slope can
  stand higher than the 1/F of a building lower down. Between the highest point of each
  layer and the lowest point of the next there are at least 6 m of clear air (`GAP`). A
  plate at the west end names each layer.
- **Peel to a storey.** Click a storey on the rail at the right, or use the arrow keys. All
  the floors over that storey go, with all the roofs over it and all that is on them. The
  walls of that storey end 1.2 m over each building's own floor (`PEEL_H`). Thus every room
  of that storey shows from above. A lower building shows its roof. The peel works also with
  the floors apart. Esc takes it away.
- **Select a building.** Point at a building to see its name and storeys. Click it to select
  it: it takes a warm tint, and a panel gives its facts from the structure (where its storeys
  come from, its heights in mPD, its footprint, its stairs and links). The panel lists each
  storey with the uses of its rooms in December 1986 (`data/room_uses.json`), and the places
  that the sources put in the building. Click a storey in the panel to peel the City to it.
  Click the x, the building again, or the ground to deselect it.
- **Rooms.** On a floor that shows from above (with the floors apart, or on the peeled
  storey), point at a room to see its storey, its use and its basis. Click it to see its
  documented place and its sources in the panel.
- **Picking.** The pick draws the building, the layer and the kind of each piece into one
  pixel under the pointer (`CityLayers.pick`). The real buildings and the ground round the
  City stop it.
- **Clock and light.** The week starts on Tuesday 16 December at 09:45, in real time. The
  arrows set the speed: one arrow is real time (1×), two arrows are 60× and three arrows are
  2400×, a day in 36 seconds. Space stops the clock and starts it again, and the keys 1, 2
  and 3 choose the arrows. A click on the day bar sets the time. The sun follows the clock
  (`Lighting` in `src/env.js`), and at night a glow comes round the bright things
  (`src/post.js`).
- **Planes.** Airliners land on Kai Tak (啓德) runway 13, about 89 a day, from 06:30 to 23:50. They
  turn right from the IGS beam on to the line of the runway. They pass the City on their
  left, about 430 m to the south-west, at about 70 m. Zoom out to see them. The end of the
  runway comes from the 1987 survey sheet; the turn and the glide are inferred
  (`src/approach.js`). At night the planes are dark like the buildings round the City, with
  their wing-tip lights and landing light.
- **Colours.** The structure has no colours. The main app uses the placeholder colours of
  `src/structureColors.js`, as the viewer does.

The "Sources + notes" panel (`src/notes.js`) lists what the structure takes from each source,
and what it infers.

### Not yet on the structure

These parts sat on the old 3D city of the main app. They come back when they move onto the
structure. Until then the main app does not load them. Their code stays in `src/`, except
the lit windows of the night, which must be made again:

- the people of the week (`people.js`, `routes.js`, `residents.js`, `crowd.js`,
  `figures.js`), the pigeons (`figures.js`) and the game Find them 尋人 (`game.js`);
- the street names, the numbers of the 1992 map and the road names (`labels.js`,
  `occlude.js`, `roadRuns` in `context.js`);
- the floor-use legend of a cut storey (`useMap.js`), and the ghosts of the real buildings
  that hide the City (`Ghosts` in `env.js`).

`node tools/check_layout.mjs`, `node tools/check_context.mjs` and
`node tools/check_game.mjs` still check this code.

## Sources

`primary-sources/` has one folder for each primary source, with notes and short quotes.
Copyrighted scans and downloads stay in `primary-sources/**/local/`, which git ignores.

## Data

The street plan in `data/plan.json` (1 m cells) and `data/plan_fine.json` (0.25 m cells) is
traced from
["Streets in Kowloon Walled City.jpg"](https://commons.wikimedia.org/wiki/File:Streets_in_Kowloon_Walled_City.jpg)
by Lord Jaraxxus, CC BY-SA 4.0. The traced data is shared under the same license.

`data/book.json` holds facts, page numbers and short quotes from *City of Darkness
Revisited* (2014). `data/book_overlay.json` holds numbers that `tools/book_overlay.py`
measures on the book's 1987 figure-ground plan and 1992 map. No image from the book is in
the repository or the app.

`data/terrain.json` holds the height of the ground round the City, out to 640 m, from the
Lands Department (地政總署) 5 m Digital Terrain Model and the spot heights of the 1987 survey sheet
11-NE-11A (`tools/terrain.py`; see `data/CONTEXT-NOTICE.md`).

`data/context.json` holds the real buildings, roads and open ground round the City as they
stood in December 1986, within 600 m of the centre of the plan box, in plan metres. Each
building has an outline, a height, its storeys, its dates, a source, and "sourced" or
"inferred". `tools/context.py` makes it from the Lands Department 1:1000 survey sheets of
1987 (the editions of 1981-85 are a check) and the CSDI Building and Road Network data.
Source: the Government of the Hong Kong SAR (香港特別行政區政府) and the CSDI Portal
(空間數據共享平台入門網站); see
`data/CONTEXT-NOTICE.md`. This data does not have a Creative Commons licence. No scan or
download is in the repository. The City plate of the model covers 59% of Mei Tung House (美東樓),
the long slab north of the City. The data keeps the parts off the plate as buildings, and
`plateClipped` keeps the whole outline.

The main app and the viewer draw this data with `src/surroundings/ground.js`. The old main
app drew it with `src/context.js` and `src/env.js`; the next paragraphs tell how, for the code
that waits to move onto the structure.
`src/context.js` picks the outlines that the old app drew, and `src/env.js` draws them. For a
building that the plate cuts, the app draws the whole outline from `plateClipped`. Thus
Mei Tung House stands whole. Of the 1,263 drawn buildings, 612 have a sourced height and
651 an inferred height. The colours, the lit windows at night and the 7 m width of the 9 road
segments with no measured width are inferred. The fit of the City on the 1987 sheet turns the
model 3.6°: plan +x points along the bearing 63.6° (`PLAN_BEARING`, `src/site.js`).

`src/occlude.js` finds the buildings that hide the City. The camera is orthographic and
always looks down. The test pushes the outline of each building away from the camera by its
height / tan(view angle). The building hides a part of the City exactly when this outline
touches the City outline. The zoom, the pan, the cut and the layered view do not change the
result, thus the test runs only when the view direction changes. It takes about 0.03 ms.
`src/env.js` keeps the fade of each building in a small texture, and the shader eases it.

`roadRuns` in `src/context.js` gives the road names. It joins the segments of each named road
into runs. A run of 100 m or more that comes within 430 m of the centre gets a name. The two
carriageways of a road give one name. The English names of the data are those of today. I
compared each of the 23 with the 1987-88 sheets, and the sheets print the same names. The
Chinese names are those of the data of today (not compared). `Sight` in `src/occlude.js` keeps
the real buildings on a grid of 2 m. A ray from a point of a road goes back to the camera
across this grid and over the City. `src/labels.js` puts a name only where the camera sees
nine tenths of the road under it. At places the road line of today runs under the edge of the
City, thus the words of a name must also keep off the City and the drawn buildings. A ghost
does not stop the ray. But the dither of a ghost blurs the small Chinese letters, thus a name
goes behind a ghost only if no clear place fits.

`node tools/check_layout.mjs` builds the layout and the route network without a browser. It
prints the counts of towers, stairs, flats and links. It fails if a unit does not meet a
corridor or a stair, if a storey has no way down, or if walks go through other rooms.

`node tools/check_context.mjs` checks `data/context.json`. It fails if a building is on the
City plate or beyond 600 m, if a building has no source, or if a survey sheet does not
register on the standing buildings. It also fails if a whole outline in `plateClipped`
reaches onto the City itself. It fails if the track of the planes (`src/approach.js`) is less
than 30 m over a roof within 60 m of the track, or over the City. It prints the five
buildings with the least clearance.

Then `check_context.mjs` checks what the app draws. It fails if a drawn outline covers a
cell of the City, or if the dark street reaches under a drawn building. It also fails if an
exit of the people is not on the street or a road. It fails if a walk between an exit
and the lanes of the City goes through a drawn building. Last, in 48 views, it casts rays from
the City wall back to the camera. It fails if a building that a ray meets does not fade.
It fails if Tung Tau Tsuen Road (東頭村道), Tung Tsing Road (東正道) or Carpenter Road
(賈炳達道) has no name, or if a road
name is not one of the 23 compared with the 1987 sheets. It also fails if `Sight` and the
exact rays disagree on more than 5% of the points of the roads.

`node tools/check_game.mjs` runs the week in steps of 10 minutes. At each step it checks
that each hint of the game points at the person, and that one view shows the person.

`tools/check_stack.js` checks the floor layers of the main app (`src/cityLayers.js`). The
check runs in the browser, because the meshes need one. Serve the repository, open the page,
and type this in the console of the page:

```js
(await import('./tools/check_stack.js')).checkStack(kwc)
```

It returns `ok`, or a list of problems. It checks four things:

- Each vertex of layer k has layer k, and lies in the storey k of its building: from its floor
  to its next floor. A link (a bridge, the steps at a door) can reach down to the other end of
  its doors, and a roof holds what stands on it.
- Each building has its G/F in layer 0 and its roof in layer n.
- With the floors apart, each layer is at least `GAP` m under the next one.
- Peeled to a storey, the layers over it are hidden, and the walls of that storey end `PEEL_H`
  m over each building's floor.
