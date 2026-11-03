# The 3D structure (draft)

`structure.html` shows a new 3D model of the City. It is a clean start: it does not use the
3D geometry of the main app (`src/cityMesh.js`, `src/floorplan.js`). It uses only these
inputs, and marks each inference.

It is a structural model only: walls, floors, stairs, rooms, the ways between them and the
paving of the routes. It has no furniture, signs, window cages or TV masts. A later pass can
add the art, and the movement of people can run on the route graph.

| Input | What it gives | Status |
| --- | --- | --- |
| `data/plan.json` (the traced 1980s street plan) | the plots, the lanes, the yards, the Yamen | SOURCED |
| `data/plan_fine.json` (the same trace on 0.25 m cells) | the outlines of the buildings and of the lanes | SOURCED |
| `data/book_overlay.json` (the 1987 figure-ground plan, p134) | which plots stood as one building | SOURCED |
| `data/structure_fixes.json` | corrections to the two files above, and storeys from photos, each with its source | SOURCED |
| Lambot's 1990 south elevation | the storeys on the east half of the south face (plan x -0.6 to 104.9) | SOURCED |
| City of Darkness Revisited, pp132, 336 | the range of 12-13 storeys on Tung Tau Tsuen Road, one of 14 | SOURCED as a range |
| Survey sheet 11-NE-11A (May 1987) | the low temporary structures on the east edge, the Fuk Tak shrine | SOURCED |
| The park's plan of the City (the photo that the trace reads) | the outlines of the Yamen halls, the Youth Centre, the Old People's Centre | SOURCED |
| Photos of the bronze model of the City in the park (Alamy stock photo 53451363; two screenshots on John's Mac, not in git). The model was made after the clearance and is a sculpture: its sizes do not agree with the plans | which buildings of the Yamen compound are one building, the sloped roofs, the low east strip, the huts on the east edge | secondary: shapes only, not sizes |
| `data/terrain.json` (LandsD DTM, sheet 11-NE-11A of 1987) | the ground: 7.6 m to 23 m in the City | SOURCED round the City, INFERRED inside it |
| pp137-139, pp145-146, p164, p167, p175, p179, p209, p249, p253, p340, Terasawa's fold-out | the types of stairs, shared stairs, buildings over buildings, stair huts, bridges, ladders between roofs, corridor windows, no lifts, the north-south route | SOURCED as types |

## Run

```sh
python3 serve.py 8173
# open http://127.0.0.1:8173/structure.html
node tools/check_structure.mjs   # counts and checks
node tools/check_structure.mjs --record   # make data/structure_choices.json again (see below)
COARSE=1 node tools/check_structure.mjs   # the outlines of the 1 m plan
```

## The fixes (`data/structure_fixes.json`, `src/structure/fixes.js`)

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
  - The thin plots on the north side of the Youth Centre (27B Lo Yan Street and the plot
    beside it, 2.6 m deep) are lane. The trace read part of the lane there as plots.
  - The Old People's Centre (1 storey) is the long rectangle marked 老人中心. The strip west
    of it is a low range of 1 storey with a flat roof (INFERRED; the 1987 sheet draws the
    'School' over both).
  - A low building of 1 storey with a flat roof stands in the strip east of the east side
    range and of the middle hall: a light, flat roof on the bronze model (INFERRED).
  - The Youth Centre (2 storeys) is low too. No building stands over the Yamen or the courts.
- Storeys counted on photos: five buildings on the west face, two on aerial photos.
- The south face: the steps of Lambot's elevation go on plan x -0.6 to 104.9 only, as fitted
  to the lot lines of the 1987 sheet. Each building takes the median step over its width.
  The west half of the south face takes its storeys from the roofline (INFERRED).
- The east edge: six temporary structures of one storey and the Fuk Tak shrine, from the
  dashed outlines of the 1987 sheet. Their inner side moves 3 m west, because the plan's east
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

## The kept choices (`src/structure/choices.js`, `data/structure_choices.json`)

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
40 % of the holes, and 15 of the 19 links of the route.

`--record` makes the file again from the old random sequence, with the fixes and outlines
of the time: thus a record run with `COARSE=1` and the fixes of 2026-11-03 gives the
approved model exactly.

## The model (`src/structure/`)

- `model.js`: the buildings. Each one has its own G/F floor level: the ground at its main
  door plus one step of 0.15 m. Each one has its own storey heights: G/F 3.3-3.9 m, the
  floors above 2.7-3.0 m, each floor within 4 cm of that (INFERRED). Thus the floors of two
  neighbours seldom line up. Walls are 0.2 m thick and each building has its own (p209).
  Slabs are 0.15 m thick.
- Storeys: the sourced faces keep their storeys. On Tung Tau Tsuen Road the source gives a
  range (12-13, one of 14); the count of each building in that range is INFERRED. The other
  buildings take their storeys from the roofline of the sourced faces. That roofline rises
  to the north with the ground: about 34-51 mPD on the south face and 51-60 mPD on Tung Tau
  Tsuen Road. It is lower near the Yamen (INFERRED): within 16-50 m of a fixed centre
  (fixes.yamenCentre, the centre of the halls as John approved them), so that a new outline
  of a hall does not change the storeys round it.
- The footprint can change with height:
  - a building grows over the roof of a neighbour that is 3 or more storeys lower (p137);
  - overhangs of up to 0.6 m over lanes of 2.2 m or more, from 1/F or 2/F up;
  - a setback top storey on some tall buildings (not where a wing reaches that floor).
- Sloped roofs: the five halls of the Yamen have pitched roofs of tiles. The Old People's
  Centre, the Youth Centre and the temporary structures on the east edge have hipped roofs,
  from the bronze model in the park (fixes.storeys: roof "pitched"). The hipped roof follows the outline: its height over a
  point is 0.55 times the distance to the nearest outer wall, up to 3.4 m (INFERRED). No
  one walks on a sloped roof, thus it has no stair hut and no links.
- Roof rooms: a room of one storey beside the stair hut on about 16 % of the tenements, and
  on the one building that a photo gives one (INFERRED from the 1987 aerial photos).
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
  - Bridges over lanes of 3.5 m or less.
  - One route inside the buildings from the north face to the south face, near 3/F-4/F
    (p164). It goes through 20 buildings, with doors and bridges. Which buildings is
    INFERRED.
  - From roof to roof: over the parapet where the roofs differ by 0.5 m or less; a ladder for
    30 % of the pairs up to one storey apart. The ladder is SOURCED: "When it was only one
    floor, people... bridged the gap with the help of a ladder" (Lam Po Chun, p145). The 30 %
    is INFERRED: most people used the lanes (p249). No source shows a plank from roof to
    roof, thus the model has none.
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
- `mesh.js`: the triangles. Ladders and stools are plain boxes. `ground.js`: the terrain with
  the roads painted on it, and the real buildings of 1986 on it. The ground fades into the
  haze from 350 m to 600 m, as in the main app. There is no plate under the City.
- `viewer.js`: the viewer. A cut at any height, a vertical section, x-ray walls, the floors
  of a building on a click (with its units by kind and its source), and routes.

## Not done yet

- The simulation (people, sounds, labels) still runs only on the old model.
- Mezzanines (p209), rooms inside a flat, and lanes with steps.
- The rates of doors, bridges, holes, ladders and windows are guesses. More sources can set
  them.
- The two buildings with lifts (pp146, 179).
- The survey sheet of 1987 shows three small buildings at the north-east corner (plan x
  87-96, z -73 to -62) that the plan does not have. Two buildings on the east face stand
  about 3 m into the sheet's strip of temporary structures (z 32-50).
- The address labels of the south row do not agree with the 1987 sheet.
- The bronze model in the park shows one thin tower far above the other roofs, near the
  middle of the City. Its place is not known yet, and the texts give "up to a possible 15
  storeys" (p340).
- The fine trace still bends at the text in a few places, and the strip of the west face is
  less clean than the rest.
- A wing whose host has its stair on each shared wall opens onto another neighbour
  (`links.js`); a better plan of the host can give it a door to the host.
