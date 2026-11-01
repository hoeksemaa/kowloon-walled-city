# Kowloon Walled City · 1986

An explorable, real-time 3D model of Kowloon Walled City (九龍城寨) at its height. It
shows one ordinary week, Tuesday 16 to Monday 22 December 1986, which ends on 冬至.

## Run

```sh
python3 serve.py 8173
# open http://127.0.0.1:8173/
```

## What is in the model

- **Buildings.** 474 plots from the 1980s street plan, drawn as polygons with window
  cages, signs, roof tanks and aerials. The 1987 figure-ground plan joins them into 286
  towers (270 if the 17 Yamen halls count as one). A check by eye against that plan
  changed 27 of them. The heights on the south face come from Lambot's 1990 south elevation.
- **Select a building.** Click a building to select it, and click it again to deselect it. A
  building is one tower of the 1987 plan, and the 17 halls of the Yamen are one building: 270 in
  all. A line marks its outline on each storey, and a faint line shows the outline through the
  buildings in front. The building takes a light warm tint, and the rest of the city keeps its
  light. In the layered view each storey has its own outline, and in a cut the line runs at the
  section. Point at a building to see its name and storeys.
- **Building panel.** The selected building has a panel at the foot of the screen, with facts
  about the building only and no list of people. It gives the name, the storeys, the footprint,
  the blocks with their addresses, and the use of each storey in the colours of the legend. It
  also gives the premises of the clearance files and the book, the flats and the number of
  simulated residents. It gives the stairs, the links to other buildings and the sources. Click a
  storey in the panel to cut the city there, or click the x to deselect the building.
- **Clicks.** A click on a label opens its card. Else a click tests a person first, then a
  building. Only one thing at a time is selected: a click on a person deselects the building,
  and a click on a building deselects the person. A click on the ground or the sky deselects
  both. Only the left button clicks: the right button pans, and a right click selects nothing.
  If the sources panel is open, the first Esc closes it. Else the first Esc deselects all that
  is selected, and the next Esc clears the cut. In an open case of the game, a click on a
  building only selects it and is not a guess.
- **Floor plans.** Stairs, corridors and units on each storey, after Suenn Ho's stair
  types. The model has 260 stairs, and its home floors hold 8,725 flats, against the book's
  8,800. Cut a storey (the floor list on the right) to see the plan, and point at a unit to
  see its name and size. The cut is a level section 1.1 m above the floor of that storey.
  It removes all that rises higher, on every storey: also the signs, aerials, roof huts and
  lines of the lower storeys. In the layered view (key E), each storey below the cut is
  darker and greyer than the storey above it, thus the plan stands out. The normal view has
  no such dim: only the sun, the sky and the lamps light it.
- **Floor uses.** The legend lists the floor uses of the cut storey. Point at a use to light
  it on the plan, and click it to keep it lit. The use stays lit when you step through the
  storeys, until you press Esc. The rest of the cut storey goes grey, but the other storeys and
  the light of the normal view do not change. A solid outline marks a recorded trade, and a
  dashed outline marks a trade inferred from the 1983 Kai Fong count. Shop, workshop and
  clinic floors have a light tint of their legend colour; the floors of flats keep their own
  colours.
- **Businesses.** 459 premises from the clearance files (GRS HKRS1255-3), with their real
  names on the signs. Inferred floors fill the total to the 1983 Kai Fong count of 645.
- **Routes.** People walk from their room to the door, along the corridor and up or down
  the stair. They cross to other buildings through links and bridges and over the roofs,
  or go down to the lanes, whichever is quicker. The network has 560 links between towers,
  36 bridges over lanes and 216 roof crossings.
- **Style.** Colours, cages, stains, signs and light come from about 110 patches measured in
  the photos of City of Darkness Revisited. The lanes are dark, with pools of light under
  the tubes; at night the windows are blue-white, and Kowloon beyond is dark, with a faint
  sodium glow.
- **Surroundings.** The real buildings, roads and open ground of December 1986 stand round
  the City, at one level with it. The buildings rise to their heights in light warm greys,
  cast shadows, and show a few lit windows at night. The roads have their widths, kerbs, and
  centre-line dashes near the City. The dark street under the City ends at the road kerbs.
  A building that hides any part of the City fades in 0.25 s to a faint dotted ghost. It
  comes back when it no longer hides the City. Its shadow does not change. A click through a
  ghost reaches the City; a click on a solid building does not.
  All of it is clear out to 350 m from the centre, fades slowly into the haze, and is gone
  at 600 m. The sky and the haze follow the light of the city: pale grey by day, warm at
  dusk, dark slate at night.
- **Planes.** Airliners land on Kai Tak runway 13, about 89 a day, from 06:30 to 23:50. They
  turn right from the IGS beam on to the line of the runway. They pass the City on their
  left, about 430 m to the south-west, at about 70 m. Zoom out to see them. The end of the
  runway comes from the 1987 survey sheet; the turn and the glide are inferred
  (`src/approach.js`). At night the planes are dark like the buildings round the City, with
  their wing-tip lights and landing light.
- **Utilities.** Power, water, phone and TV lines. Low floors get water only in the hours
  that a resident recorded.
- **People.** 28,200 residents in about 8,800 flats, and 4,800 workers who come in from outside
  each day (City of Darkness Revisited, pp339–340). Point at one of the nine real people to
  see their facts and one recorded quote, with the source of each. Sixteen people of the book
  work at their places, in the hours that the book gives. Police, sweepers, refuse
  collectors, meter readers and patients come in from outside. All the others are
  composites. They wear the December clothes of the book's photos and carry sacks, buckets
  and baskets; a small gold marker shows each real person. Each body has joints: people
  walk, climb the stair flights, sit at tables and machines, work at stoves and benches, and
  sleep in beds or on mats under a quilt.
- **Labels.** The street names and the numbers of the places of the 1992 map lie on the
  model, as dark plates with light pixel letters. A street name lies along its lane at the
  height of the roofs, with thin lines down to the lane floor. In a cut, or in the layered
  view, it lies on the cut storey, or on G/F with no cut. A number lies on the building of
  its place. Each label moves and dims with its storey. Point at a number to see its card,
  or at a street name to light its lane. The names of 23 real roads round the City lie on
  those roads, as plates of the same kind. A road name lies on a straight part of its road
  that the camera sees, as near the City as it can. Its words do not lie on the City or on a
  building. It moves along the road when the view changes, and fades with the haze. It does
  not dim in the layered view. Point at a road name to light its road. The key M turns all of
  these off and on. The storey labels of the layered view and the cut tag are plates of the
  same kind. No plate lies on the title at the top left: a street name moves along its lane to
  find room, and a storey label with no room hides.
- **Find them 尋人.** A game with three cases: the postman Lam Po Chun, the pigeon breeder
  Chan Kwan Leung and the noodle maker Hui Tung Choy. Open it with the magnifier tool or the
  key G. Each case has five hints, each stronger than the one before: Who, How, Where, Which
  and Show. The first hints quote the book with its page. A click on the right person closes
  the case. If the person is outside the City, the hint gives the time of return.
- **Clock.** The week starts on Tuesday 16 December at 09:45, in real time. The curve in the
  clock panel shows the people away from home through the day. A click on the curve moves the
  clock to that time, with the people already on their way. The arrows under the curve set the
  speed. One arrow is real time (1×), two arrows are 60× and three arrows are 2400×, a day in
  36 seconds. Space stops the clock and starts it again, also after a click on a button. The
  keys 1, 2 and 3 choose the arrows. A button that has the keyboard focus (from the Tab key)
  takes Space and Enter, and the clock does not change.
- **Sound.** It is off at first: turn it on with the speaker tool or the key S. A soft bed
  follows the hour, with occasional clear sounds over it, for example drips, a plane and the
  pigeon breeder's whistle. The sound fades out when the clock stops. At three arrows, you hear
  only the soft bed. The browser makes each sound, and the repository has no audio files.

The "Sources + notes" panel in the app lists each source and each inference.

## Sources

`primary-sources/` has one folder for each primary source, with notes and short quotes.
Copyrighted scans and downloads stay in `primary-sources/**/local/`, which git ignores.

## Data

The street plan in `data/plan.json` is traced from
["Streets in Kowloon Walled City.jpg"](https://commons.wikimedia.org/wiki/File:Streets_in_Kowloon_Walled_City.jpg)
by Lord Jaraxxus, CC BY-SA 4.0. The traced data is shared under the same license.

`data/book.json` holds facts, page numbers and short quotes from *City of Darkness
Revisited* (2014). `data/book_overlay.json` holds numbers that `tools/book_overlay.py`
measures on the book's 1987 figure-ground plan and 1992 map. No image from the book is in
the repository or the app.

`data/context.json` holds the real buildings, roads and open ground round the City as they
stood in December 1986, within 600 m of the centre of the plan box, in plan metres. Each
building has an outline, a height, its storeys, its dates, a source, and "sourced" or
"inferred". `tools/context.py` makes it from the Lands Department 1:1000 survey sheets of
1987 (the editions of 1981-85 are a check) and the CSDI Building and Road Network data.
Source: the Government of the Hong Kong SAR and the CSDI Portal; see
`data/CONTEXT-NOTICE.md`. This data does not have a Creative Commons licence. No scan or
download is in the repository. The City plate of the model covers 59% of Mei Tung House,
the long slab north of the City. The data keeps the parts off the plate as buildings, and
`plateClipped` keeps the whole outline.

`src/context.js` picks the outlines that the app draws, and `src/env.js` draws them. For a
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
It fails if Tung Tau Tsuen Road, Tung Tsing Road or Carpenter Road has no name, or if a road
name is not one of the 23 compared with the 1987 sheets. It also fails if `Sight` and the
exact rays disagree on more than 5% of the points of the roads.

`node tools/check_game.mjs` runs the week in steps of 10 minutes. At each step it checks
that each hint of the game points at the person, and that one view shows the person.

`tools/check_stack.js` checks that the storeys stack. Each drawn piece is part of one storey
and moves only with that storey. Thus the normal view is the layered view (key E) with its
storeys put back together, and nothing stretches. The check runs in the browser, because the
meshes need one. Serve the repository, open the page, and type this in the console of the
page:

```js
(await import('./tools/check_stack.js')).checkStack(kwc)
```

It returns `ok`, or a list of problems. It checks five things:

- Each vertex, sign and aerial is on its own storey.
- Each segment of a line moves with one storey.
- No line rises above the section of a cut.
- Each person moves with one whole storey.
- Each label is on its own storey, and no label rises above the section of a cut.
