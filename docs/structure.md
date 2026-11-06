# The 3D structure (DEFINITIVE)

**This is the definitive 3D structure of Kowloon Walled City (九龍城寨) and of the terrain and city round
it (John, 2026-11-04).** It is the structural foundation of all later work: the art, the
visuals and the simulation build on it. Each earlier 3D model of the City is superseded. The
3D city of the main app (`index.html`: `src/cityMesh.js`, `src/floorplan.js`,
`src/facades.js`, `src/roofs.js`, `src/interiors.js`, and the surroundings in `src/env.js`) is
no longer the model of the City. Its code stays only so that the main app runs until it
moves to this structure.

It is a structural model only: walls, floors, stairs, rooms, the ways between them and the
paving of the routes. It has no furniture, signs, window cages or TV masts. It has no
colours: `src/city/` and `src/surroundings/` name the parts, and the code that draws them gives
the colours (`colorOf` in `buildMesh` and `buildProps`, `colors` in `buildGround`). The viewer
keeps its placeholder colours in `src/structureColors.js`. Only the structure is definitive.

## The structure is frozen

`node tools/check_structure.mjs` fails if the structure changes. It compares these
fingerprints with `data/structure_frozen.json` (`tools/structure_fingerprint.mjs`), all
rounded to 1 cm:

- `city`: a SHA-256 of the City model: each building with its storeys, floor levels, roof,
  outlines on each storey band, stairs and rooms; each door, bridge, ladder, step, hole,
  window and stool; the route; and the ground plan of the City (`cityGround()`);
- `mesh`: a SHA-256 of the geometry that `src/city/mesh.js` makes of the model, as the viewer
  draws it: every vertex of the walls, slabs, roofs, huts, parapets, stairs, partitions,
  bridges, ladders and stools (wall thickness, door heights and stair treads too);
- `surroundings`: a SHA-256 of each of `data/context.json`, `data/surroundings.json` and
  `data/terrain.json`, and of the shapes of `src/surroundings/shapes.js` (how far the ground
  reaches, and the solid of each real building of 1986).

Thus a change to the code or to the data that moves the structure fails the check. A
change of colour does not: the structure has no colours, and the art gives its own. Do not
change the structure. Change it only for a large error that a new source shows, and only
when John approves it. Then run `node tools/check_structure.mjs --refreeze`, and write the
change, its source and the date in this file. `--record` (make the kept choices again) runs
only with `--refreeze`.

## Changes since the freeze

John approved changes "to correctly match the historical presence of verified rooms" on
2026-11-05. On 2026-11-06 John kept the other heights that one source disagrees with (the
Chung Fat Café building, and the buildings of Chan Pui Yin and Lam Tseng Yat in
`docs/rooms.md`): a height changes only when a verified room cannot fit in the model. Each
change and its source:

- 2026-11-05: codes 62 and 51 (31 and 28-29 Tung Tau Tsuen Road (東頭村道)) have 13 storeys,
  not 12. Chan Cheung-chuen (陳祥全) lived at "12/F, Room B, 31 Tung Tau Tsuen Rd." from
  1985 (WSJ 2014, People chapter), and Suenn Ho's (何巽) route map of 1991 (M+ CA17/2) prints
  31 on code 62. A 12/F needs 13 storeys. The book gives 12-13 storeys for this row (p132).
  Code 62 shares the stair of code 51 in the model, thus code 51 has 13 storeys too
  (INFERRED). No other building changed. The model has one door fewer (2,256).
- 2026-11-05: the names of 96 buildings (`data/structure_choices.json`, layout names; not part of
  the geometry). The old names came from the layout's even spread of the GRS house numbers along
  each street, which the route map shows to be wrong on most streets. A building on which Suenn
  Ho's route map prints house numbers takes them ("30, 31 Tung Tau Tsuen Road"); a building whose
  old number the map puts on another building takes "Building <id>" (`tools/route_map_names.mjs`).

## Two parts: the City and its surroundings

The City is the focus of the work. The surroundings are context only. The two parts are
separate in the code:

| Part | Code | Data | What it is |
| --- | --- | --- | --- |
| The City | `src/city/` | `data/plan.json`, `data/plan_fine.json`, `data/book_overlay.json`, `data/structure_fixes.json`, `data/structure_choices.json` | every building of the City, its storeys, floors, stairs, rooms, roofs, the links between them, and the SW-NE route |
| The surroundings | `src/surroundings/` (`shapes.js`: the shapes, no three.js; `ground.js`: draws them) | `data/context.json`, `data/surroundings.json` | context: the roads, the paths, the courts and the real buildings of 1986 round the City |
| Shared input | `src/terrain.js`, `src/layout.js` (with `src/footprint.js`, `src/floorplan.js`, `src/residents.js`, `src/context.js`), `src/util.js` | `data/terrain.json`, `data/book.json`, `data/businesses.json` | the ground levels, and the reader of the plan (the main app uses them too) |
| The viewer | `src/structureViewer.js`, `structure.html` | | the one place that puts the two parts together |

`src/city/` does not import `src/surroundings/`, and `src/surroundings/` does not import
`src/city/`. The City model does not read the data of the surroundings: with or without
`data/context.json`, it has the same fingerprint. The surroundings know the City only by the
plain rings of `cityGround()` (`src/city/model.js`): its lanes, its yards and the G/F outline
of each building, which the viewer passes in. With those, the ground shows the lanes of the
City, and no ground shows under its buildings.

| Input | What it gives | Status |
| --- | --- | --- |
| `data/plan.json` (the traced 1980s street plan) | the plots, the lanes, the yards, the Yamen (衙門) | SOURCED |
| `data/plan_fine.json` (the same trace on 0.25 m cells) | the outlines of the buildings and of the lanes | SOURCED |
| `data/book_overlay.json` (the 1987 figure-ground plan, p134) | which plots stood as one building | SOURCED |
| `data/structure_fixes.json` | corrections to the two files above, and storeys from photos, each with its source | SOURCED |
| Lambot's 1990 south elevation | the storeys on the east half of the south face (plan x -0.6 to 104.9) | SOURCED |
| City of Darkness Revisited, pp132, 336 | the range of 12-13 storeys on Tung Tau Tsuen Road (東頭村道), one of 14 | SOURCED as a range |
| Survey sheet 11-NE-11A (May 1987) | the low temporary structures on the east edge | SOURCED |
| The park's plan of the City (the photo that the trace reads) | the outlines of the Yamen halls, the Youth Centre (青年中心), the Old People's Centre (老人中心) | SOURCED |
| Photos of the bronze model of the City in the park, scale 1:200 (Alamy 49828257, 53451363 and similar stock photos; screenshots on John's Mac, not in git). The model was made after the clearance and is a sculpture: its outlines do not agree exactly with the plans | the storeys of the buildings that no photo of the City shows (John, 2026-11-03: the main source for heights); which buildings of the Yamen compound are one building, the sloped roofs, the low east strip, the huts on the east edge, the thin tower, the yard east of the Yamen | SOURCED for storeys where counted (`from: "bronze"`); shapes only for outlines |
| City of Darkness Revisited, pp20-21 (Lambot) and the 1989 aerial (Lambot, Wikimedia Commons) | the storeys on the west half of the south face (12-13); a deep Yamen court with tall walls; the Free School (義學) at about full height | SOURCED for the counts; which buildings: INFERRED |
| `data/terrain.json` (LandsD 地政總署 DTM, sheet 11-NE-11A of 1987) | the ground: 7.6 m to 23 m in the City | SOURCED round the City, INFERRED inside it |
| pp137-139, pp145-146, p164, p167, p175, p179, p209, p249, p253, p340, Terasawa's (寺澤一美) fold-out | the types of stairs, shared stairs, buildings over buildings, stair huts, bridges, ladders between roofs, corridor windows, no lifts, a route from one end of the City to the other | SOURCED as types |

## Run

```sh
python3 serve.py 8173
# open http://127.0.0.1:8173/structure.html
node tools/check_structure.mjs   # counts and checks, and the freeze
COARSE=1 node tools/check_structure.mjs   # the outlines of the 1 m plan (not frozen)
node tools/check_structure.mjs --refreeze   # ONLY WITH JOHN'S APPROVAL (see above)
```

## The fixes (`data/structure_fixes.json`, `src/city/fixes.js`)

`applyFixes()` changes the plan and the towers before `buildLayout()`. Each rule has a "why"
with its source.

- Strips of pavement that the trace made into plots are open again. Two plots in the
  "Garden" of the 1987 sheet are open ground.
- The Yamen compound takes the rectangles that the park's plan draws, measured on its lines
  (a frame turned 12.5 degrees, along the compound). A photo of the bronze model in the park
  shows the same buildings and courts. The 1987 sheet and the CSDI footprints draw the halls
  as they stand today, which are shorter.
  - Five halls with the courts open between them: the west and east side ranges by the rear
    court (the east one runs from the Youth Centre to the middle hall), the middle hall, and
    the two ranges of the front court, which reach as far south as the Old People's Centre.
  - The Youth Centre is one rectangle of 36.4 x 9.0 m with one sloped roof, from the lane on
    the west to the lane on the east (the band 青年中心). The rear hall of today stands in
    it: the park's plan and the bronze model do not show it as a hall of its own.
  - The thin plots on the north side of the Youth Centre (27B Lo Yan Street 老人街 and the plot
    beside it, 2.6 m deep) are lane. The trace read part of the lane there as plots.
  - The Old People's Centre (1 storey) is the long rectangle marked 老人中心. The strip west
    of it is a low range of 1 storey with a flat roof (INFERRED; the 1987 sheet draws the
    'School' over both).
  - A low building of 1 storey with a flat roof stands in the strip east of the east side
    range and of the middle hall: a light, flat roof on the bronze model (INFERRED).
  - The Youth Centre (2 storeys) is low too. No building stands over the Yamen or the courts.
- Storeys counted on photos of the City: five buildings on the west face, and six on the
  west half of the south face (12-13, pp20-21 and the 1989 aerial; which buildings is
  INFERRED).
- Storeys counted on the bronze model in the park (`from: "bronze"`): 24 buildings that no
  photo counts, on the west face, round the Yamen court and at the north-east corner. Four
  agents counted the window rows on four views (north, north-east, west, and down into the
  court); four more agents counted each difference again. A row on the bronze is not always
  a storey: on the west face, 5 blocks with photo counts give 1.1 storeys a row; on the north
  face the rows agree with p132; in the court the camera fits the storeys of the model. Each
  "why" gives the counts. The real photos rank above the bronze: on Tung Tau Tsuen Road the
  bronze only chooses 12 or 13 inside the range of p132 (the 1987 and 1989 photos agree with
  12-13 there).
- The thin tower of the bronze (John circled it on the view from Tung Tau Tsuen Road): the
  narrow strip of plots 267 and 276 (plan x 62.5-68.5, z 7.5-16.5) stands alone, 15 storeys
  (p340: "up to a possible 15 storeys"). The north and north-east views put it at x 62-66;
  they do not fix its depth (INFERRED: which plots). It does not grow over a neighbour's roof
  (fixes.storeys `annex: false`).
- Plot 210, between the Yamen's east side range and 23 Lo Yan Street, is a yard: the bronze
  shows trees there and no building (two counts). The trace had it as part of the Yamen.
- The south face: the steps of Lambot's elevation go on plan x -0.6 to 104.9 only, as fitted
  to the lot lines of the 1987 sheet. Each building takes the median step over its width.
- The east edge: six temporary structures of one storey, from the dashed outlines of the
  1987 sheet. The sheet also draws the Fuk Tak shrine (福德古廟), free-standing east of the City: the
  model leaves it out (John, 2026-11-04). Their inner side moves 3 m west, because the plan's east
  face is 1-3 m west of the sheet's. A lane that ends at the strip goes on through it.

## The outlines (`tools/trace_plan.py`, `data/plan_fine.json`)

The 1 m plan gives each cell to one plot, thus a plot line at an angle was a staircase of
1 m steps, and the text on the photo bent some plot lines. The trace now also writes
`data/plan_fine.json`: the same codes on cells of 0.25 m. `data/plan.json` does not change.

- Each pixel of the photo takes a code. The 1 m codes say which plot is which; the drawn
  lines say where one plot stops (a watershed from the inner part of each 1 m plot, which
  meets on the drawn lines first, then on the text). The lanes are the purple of the photo.
- The text is not a line: a mark is a line if it is long or thin, and a block of strokes
  that fills its box is a character.
- A boundary between two plots that bends and has no drawn line on it follows the text. It
  becomes a straight line, at the angle of the drawn walls round it or at a right angle to
  them.
- `buildLayout()` takes the outlines of the buildings and of the lanes from the fine plan
  when `plan.fine` is there (the structure only; the main app does not change). A building
  has no part narrower than 0.75 m and is one piece; the outlines are simplified to 0.75 m.
- The result: 56 % of the length of the walls lies on the axis of its building (46 % with
  the 1 m plan), and 18 % is oblique (26 %). The lanes have about 8 % less area (5326 m², 5759 m²
  before), thus more lanes are narrow enough for a bridge (about 95 bridges, 70 before).
- Exact polygons (`src/footprint.js`, fine plan only): a building that a cell rule draws as
  a polygon (the Yamen halls, the Youth Centre, the Old People's Centre, the low range, the
  temporary structures on the east edge) takes that polygon, not the staircase of its cells.
  Its neighbours meet it with no gap.
- Straight walls (`regularise()` in `src/footprint.js`, fine plan only): a least-squares pass
  moves the corners of the outlines, by 0.75 m at most, so that a wall lies on the axes of its
  building, on a long wall next to it, or straight through a corner. A wall that fits the
  drawn line of the plan photo closely (RMS 0.15 m or less) can turn by 3 degrees at most;
  other walls by 8 degrees (5 degrees for walls of 4 m or more). Guards: no new crossings, a
  lane keeps its width or 0.9 m, a party wall of 1.2 m or more keeps 1.2 m, a building keeps
  its area within 10 %. Result (2026-11-03): 62 % of the walls lie within 2 degrees of the
  plan photo (48 % before), 65 % of the wall length within 5 degrees of the building's axes
  (59 %), and kinks went from 338 to 216. The curve of the NE corner keeps its bends. The 1 m
  plan (`COARSE=1`) does not change.

## The kept choices (`src/city/choices.js`, `data/structure_choices.json`)

The model draws many random choices: the rate of doors of each pair of buildings, which
floors get a door or a bridge, the ladders, the windows, the holes, the flats in two
buildings, and the route from north to south. Before, they came from one random sequence,
thus a change of one outline moved them all. Now each choice has a key: its kind, its
buildings (by the lowest plot code of each) and its floor. `data/structure_choices.json`
keeps the choices of the model as John approved it on 2026-11-03 (the 1 m outlines), and the
seed, the storeys and the name that each building had then. It also keeps the storeys that
the roofline gave each building with no source for its storeys: the roofline is read at the
centre of a building, thus a new outline moved some of them by a storey. The model uses a kept choice
where its key comes up again; a new key takes a number from a hash of the key. The route
prefers the kept chain of buildings and its floors. With the new outlines, 50-77 % of the
kept doors, bridges, ladders, steps and windows stay, 63 % of the flats in two buildings,
40 % of the holes, and 15 of the 19 links of the route. The route changed on purpose on
2026-11-04 (SW corner to NE corner, 5/F-7/F): its kept chain and floors (`chain`,
`chainLinks`) were made again with no kept route, then kept.

When the roofline changes on purpose, each kept storey moves by the change of the roofline's
value at its building, and a building that a source now counts loses its kept storey. That
was done once (2026-11-03: no lower ring round the Yamen, the new photo counts): 73 kept
storeys moved, most by +1 or +2 near the court, and 27 left.

`--record` makes the file again from the old random sequence, with the fixes and outlines
of the time: thus a record run with `COARSE=1` and the fixes of 2026-11-03 gives the
approved model exactly. Since the freeze, `--record` runs only with `--refreeze`, and only
with John's approval.

## The model (`src/city/`)

- `model.js`: the buildings. Each one has its own G/F floor level: the ground at its main
  door plus one step of 0.15 m. Each one has its own storey heights: G/F 3.3-3.9 m, the
  floors above 2.7-3.0 m, each floor within 4 cm of that (INFERRED). Thus the floors of two
  neighbours seldom line up. Walls are 0.2 m thick and each building has its own (p209).
  Slabs are 0.15 m thick.
- Storeys: the sourced faces keep their storeys. On Tung Tau Tsuen Road the source gives a
  range (12-13, one of 14); the count of each building in that range is INFERRED (from the
  bronze where it shows a lower or a higher block). The buildings that the bronze counts take
  its counts. The other buildings take their storeys from the roofline of the faces that
  photos count; the bronze counts are not part of that roofline, because the bronze
  simplifies. That roofline rises to the north with the ground: about 34-51 mPD on the south
  face and 51-60 mPD on Tung Tau Tsuen Road. It is not lower near the Yamen: the 1989 aerial
  photos and the bronze show the court as a deep shaft with walls of 10-13 storeys. (Before
  2026-11-03 the model made the ring round the court 3-5 storeys lower.)
- The footprint can change with height:
  - a building grows over the roof of a neighbour that is 3 or more storeys lower (p137);
  - overhangs of up to 0.6 m over lanes of 2.2 m or more, from 1/F or 2/F up;
  - a setback top storey on some tall buildings (not where a wing reaches that floor). The
    top storey keeps every stair, thus each stair hut stands on the top roof.
- Sloped roofs: the five halls of the Yamen have pitched roofs of tiles. The Old People's
  Centre, the Youth Centre and the temporary structures on the east edge have hipped roofs,
  from the bronze model in the park (fixes.storeys: roof "pitched"). The hipped roof follows the outline: its height over a
  point is 0.55 times the distance to the nearest outer wall, up to 3.4 m (INFERRED). No
  one walks on a sloped roof, thus it has no stair hut and no links.
- Roof rooms: a room of one storey beside the stair hut on about 16 % of the tenements, and
  on the one building that a photo gives one (INFERRED from the 1987 aerial photos).
- Parapets: a wall of 1 m round about 20 % of the flat roofs (`PARAPET_RATE`; John's
  estimate, 2026-11-03). The other roofs end at the slab. Which roofs have one is INFERRED
  (a hash of the building's key).
- `plan.js`: the plan of each floor, on a raster of 0.25 m.
  - A dog-leg stair at the side with a corridor of 1.0 m beside it, or a straight stair in
    a strip of 1.0 m in a narrow building, or a steep stair in a very small one. The stair
    goes where it leaves no strip of floor less than 2 m deep against a wall, if it can.
  - A small floor (less than 45 m2) has no corridor: the landing opens into the flat.
  - The corridor ends at the last unit that it serves. A passage goes from the corridor to
    each door in a party wall.
  - A building too small for a stair (less than 14 m2 inside) is a wing of a neighbour: it
    shares that stair, and its floors are at the neighbour's levels (pp138-139).
  - Units (INFERRED from flats of about 200 sq ft, p130; 200-600 sq ft, WSJ 2014; factories
    of 480-600 sq ft, pp169, 292): each building has its own flat size, about 21 m2 with a
    spread. Flats: median 17 m2, 10 % over 27 m2, about 80 over 40 m2. Shops and workshops on
    G/F, about 30 m2. Factories on the low floors of some buildings, about 50 m2. A room of
    less than 7.5 m2 off the corridor is kind "room" (a cubicle or a store). A strip less
    than 1.2 m wide joins a neighbour unit or the corridor.
- `links.js`: the ways between the spaces. All of these make one graph with the lanes;
  `route()` finds the cheapest way from one room to another. A metre up a stair costs 3.5 m
  of level walking, a metre down 2.5 m (INFERRED).
  - Doors to the lanes on G/F, and on an upper floor where the lane rises to it.
  - Doors through party walls where two floors are within 0.95 m of each other, with steps.
    The rate of a door on a floor goes down with height: 0.35 on 1/F-5/F, 0.15 on 6/F-9/F,
    0.05 higher, times a factor for each pair of buildings (INFERRED from pp164, 175).
  - Doors from the half landings of dog-leg stairs (p340), up to 1.2 m of steps.
  - Bridges over lanes of 3.5 m or less, one at each place at most (John, 2026-11-04): 38
    bridges, each between one pair of buildings, 13 of them on the SW-NE route. Before, a
    place got a bridge on about half the floors that line up, thus stacks of 2-6 bridges
    between the same two buildings (89 in all). A bridge is a deck 0.9 m wide with two rails
    1.0 m high (p167; Terasawa's cut-away; the shape and the places are INFERRED).
  - One route inside the buildings, the full way from the SW corner of the City to the NE
    corner. p164 has a route on 3/F-4/F from one end of the City to the other. At John's
    request (2026-11-04) the route goes from corner to corner at the middle of the City's
    height (the median building has 12 storeys): an artistic choice, not SOURCED. In
    `model.js`, `CHAIN_FLOORS` (5/F-7/F) sets its floors, and `routeCorners()` its two ends:
    the building nearest each corner of the outlines (250 at the SW, 0 at the NE). A link off
    those floors costs 15 m of walking a floor, thus the route goes round a link that only
    lines up on 3/F-4/F. It goes through 23 buildings, with 9 doors and 13 bridges, on
    6/F-8/F, and starts and ends on 6/F. Which buildings is INFERRED.
  - From roof to roof: about 20 % of the flat roofs have a 1 m parapet (John's estimate,
    2026-11-03; which roofs is INFERRED). Two nearly level roofs (0.3 m or less) with no parapet
    make one open roof and always join. Elsewhere a step, where the wall to climb (the step,
    with a parapet on it) is 1.5 m or less, for 90 % of the pairs; a ladder for 30 % of the
    pairs with a higher wall, up to one storey apart. The ladder is SOURCED: "When it was only
    one floor, people... bridged the gap with the help of a ladder" (Lam Po Chun 林寶鎮, p145). The
    30 % is INFERRED: most people used the lanes (p249). No source shows a plank from roof to
    roof, thus the model has none. A step or a ladder needs the top roof of the lower building
    at the wall: a setback terrace below it does not count. The ladder stands flat against the
    wall of the higher building, on the lower roof (against its parapet, where it has one).
  - From a roof into a taller building (50 % of the pairs): a corridor window with a stool
    under it, in the corridor (p145: where the gap was two or three floors, the residents
    opened or broke a corridor window and put a stool under it). Where the floor is more
    than 0.3 m over the roof, a door with steps down onto the roof (INFERRED).
  - The postmen, the police and the children crossed the roofs (pp146, 253, 283; p324 for the
    1950s), but the lanes carried most trips and all heavy loads (pp93, 249, 260).
  - Informal links (INFERRED; the residents built at will, pp145, 209): 40 flats with a room
    in each of two buildings, and 40 holes through party walls. A hole joins two floors
    within 0.3 m of each other, thus it needs no stool. The broken walls of p209 were seen
    in the empty City of 1993, thus they can be damage from the clearance.
  - No lifts: only two buildings had lifts (pp146, 179), and no source names them.
- `mesh.js`: the triangles. Ladders and stools are plain boxes.
- `src/surroundings/ground.js` (the surroundings, not the City): the terrain with the roads,
  paths and courts painted on it, and the real buildings of 1986 on it. The ground fades
  into the haze from 350 m to 600 m, as in the main app. There is no plate under the City.
- `src/structureViewer.js`: the viewer. A cut at any height, a vertical section, x-ray
  walls, the floors of a building on a click (with its units by kind and its source), and
  routes. `src/structureColors.js`: its placeholder colours.

## Not done yet

- The simulation (people, labels) still runs only on the old, superseded model of
  the main app. It must move to this structure.
- Mezzanines (p209), rooms inside a flat, and lanes with steps.
- The rates of doors, bridges, holes, ladders and windows are guesses. More sources can set
  them.
- The two buildings with lifts (pp146, 179).
- The survey sheet of 1987 shows three small buildings at the north-east corner (plan x
  87-96, z -73 to -62) that the plan does not have. Two buildings on the east face stand
  about 3 m into the sheet's strip of temporary structures (z 32-50).
- The address labels of the south row do not agree with the 1987 sheet.
- What the bronze shows and the model does not have yet (outlines, not storeys): the court
  is 1-3.5 m wider at its south-east; the Free School covers the open south-west part of the
  court; building 81 and 23 Lo Yan Street each have two heights (11 and 9 rows; 10-12 and
  4-7); a tower of about 12 rows stands about 8 m behind the low block at the south-west
  corner; a narrow stair tower stands in the notch of the west face at plan z 13-16.
- The thin tower stands on plots 267 and 276; the bronze puts it about 2.5 m further west,
  and its depth is not known.
- The fine trace still bends at the text in a few places, and the strip of the west face is
  less clean than the rest.
- A wing whose host has its stair on each shared wall opens onto another neighbour
  (`links.js`); a better plan of the host can give it a door to the host.
