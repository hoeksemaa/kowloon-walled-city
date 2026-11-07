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
    `style.css`. The structure, the viewer and the main app also use `layout.js` and
    `footprint.js` (the reader of the plan), `context.js` (the outlines round the City),
    `terrain.js`, `site.js`, `env.js` (the light) and `util.js`.
  - The life of the main app, on the structure: `src/life/`. `nav.js` finds the ways through
    the route graph of the structure (A* with landmarks); `population.js` makes the people of
    the week (28,200 residents and about 4,800 day workers, pp339-340, the services of the
    Government, and the real people of `data/routines.json`); `routines.js` plans the day of
    each person; `sim.js` moves them; `figures.js` draws them (instanced); `personPanel.js`
    gives the panel of a person. `furnish.js` puts the things of `data/furnishings.json` in
    the rooms and on the roofs (instanced, one mesh for each kind). `mysteries.js`: the ten
    cases of `data/mysteries.json`. `utilities.js`: the water, power, post and refuse of
    `data/utilities.json`.
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
  - `check_context.mjs` checks the surroundings data and the track of the planes.
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
  layer and the lowest point of the next there are at least 6 m of clear air (`GAP`). In the
  middle of each gap lies a dark see-through plate with a light edge, as in the old app: each
  layer shows through the plate over it. The name of each layer lies on the west edge of the
  plate under it (G/F on the ground).
- **Peel to a storey.** Click a storey on the rail at the right, or use the arrow keys. All
  the floors over that storey go, with all the roofs over it and all that is on them. The
  walls of that storey stay whole, to the slab of the next floor: the peel cuts nothing, it
  only takes the layers over the storey away. Thus every room of that storey shows from
  above, with all its mass. A lower building shows its roof. The peel works also with
  the floors apart. The RF row of the rail, or Esc, takes it away.
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

### The people and the things

The main app shows the people of the week of 16 to 22 December 1986 (`src/life/`). The crowd
follows the counts of the sources: 28,200 residents (City of Darkness Revisited, p340) and
about 4,800 people who came in to work (p339). The crowd has no names, because no source
names these people; their roles, homes, workplaces and hours are INFERRED. The 120 real
people of `data/routines.json` have names, stories and days from the sources: each hour of
their day says if it is sourced or inferred. Click a person to see their day, and FOLLOW
them: the City peels to their storey when they go in.

The crowd lives in households: families (parents, children and, in a big household, a
grandparent), couples, old couples, old women who share a flat (p178), workers who share a
room (p289), and people alone. About 10,000 families lived in 8,800 flats (Legislative Council
(立法局), 18 February 1987; p340): here about 1 flat in 7 holds a lodger household that rents a
room (p157). A few families live in their shop (p94) or sleep on the floor of their clinic
(p245). Some families spend the evening in their workshop and sleep in the flat (p173), and some
owners sleep in the workshop to guard it (p169). The shares are INFERRED. A household
eats dinner together, goes out together on Sunday, and shares its water. The well water comes
to each floor at set hours: in some blocks all day (p113), in many after the noon and the
midnight pump runs (p107), in others by floors, low floors first (林羅平, HK01). Someone at home
fills the drums and the bath then; after the midnight run, some wake to do the washing
(Tam Sau-kuen (譚秀娟), WSJ). The well water was not fit to drink (p108): about half the blocks
have an illegal tap of the mains (p110), and in the others someone carries the drinking water
home each day from the nearest of the eight Government standpipes (p249), or the household pays
a water carrier (p108). The rubbish: "the City's residents were not exactly model citizens in this regard" (p104). A
few take it to a refuse point before work (p179), some leave it in the orange buckets of the
Urban Services Department (p104), and the others throw it from the window into the gap between
the buildings (pp103, 209). The three refuse collectors clear the 23 refuse points from about
04:00 (p93), and the ten sweepers go round the lanes and the points (p104). The jobs of the 4,800 who come in and of the residents who work in the
City fill the "700 businesses" (p110). The make-up of the households, the hours and the shares
are INFERRED. The panel of a person shows their household and their water; the panel of a
flat shows who lives there.

Each trade keeps its own hours. The stores open from 6 or 8 am to midnight, seven days a week
(pp91, 93), and a café stays open until very late (p57). A doctor sees patients from 9 am to
1 pm and from 3.30 to 8 pm, and on Sunday mornings (p187). A dentist works from 10 am to 6 or
7 pm, with a day off (p245). A roast-meat maker starts at 4 am (p286), and the Kai Fong office
keeps office hours (p180). The other hours are INFERRED.

On some nights a workshop has a rush order: its workers come back after dinner and work until
2 or 3 am (p237). The food workshops work through the night before 冬至 (pp44, 289). Which
night, and which workshop, is INFERRED. Members of a family often work in the family workshop
or shop. After school, a child of such a family helps there until about 9 or 10 pm (林羅平,
HK01). Some women do outwork at home for the workshops of the City (pp88, 176). Other women
help a food workshop near their home in the afternoon, in coats against the cold of its air
conditioning: "A few neighbours - ladies - help me with the fish dumplings" (Lam Leung Po
(林良寶), pp292-293). Which women, and the hours, are INFERRED.

The 184 members of the Old People's Centre (老人中心) go there for tea and television in the
afternoon (pp305-306), and the Christians among them go to the Sunday worship (p305). On two
afternoons, women who never learned to write go to a calligraphy class there (p306). When a
member stays away, a friend from the Centre calls at the home (p306). Some old
people seldom leave the room (p24). A grandmother minds the grandchildren, takes them home from
school (p54) and watches them on the roof in the early evening (p322). When no one of a family
is at home by day, its young children stay with a household of the same building that has a
homemaker or an old person, and a parent picks them up on the way home from work (p54). Most parents keep the
small children in the flat (p300), and the children play on the stairs and the landings (p54).
The tea houses outside the City and the morning exercise on the roofs are INFERRED.

After dinner, most people watch television (p160). Some play mahjong at a neighbour's flat
(p15), and some have a quiet chat in the lane in the cool night air (p316). Children wrap the
candies of the candy workshop after school, at tables in the alley (pp76-77). Patients come
in from outside to the doctors and the dentists (pp187, 242), and factory workers come to the
Sunday surgery (p187). Six constables walk the beats, two on each of three shifts, with at
least one patrol in each shift (pp251, 283).

The errands and the meeting places. People buy at the nearest store of the City, most from 5 to
9 pm (p93), and the small stores on the upper floors are places to stop and chat (p175). Old
people go to the park next to the City in the morning (p80). Some residents bring chairs to the
Yamen courtyard to chat or to prepare vegetables (p299). On Sunday 10 to 20 people go to the
service of the Salvation Army (救世軍) chapel (p301), and some men ask the gods for luck at the
Tin Hau Temple (天后廟) (p15). The amateur Chinese orchestra plays on two evenings (p15). The
children of the Salvation Army kindergarten go on an outing to Kowloon Park on Thursday (p300).
On the day before 冬至, some old women help at the food workshops on a daily rate (p44). Taxi
drivers eat at the cafés by Tung Tsing Road (東正道) (p294). Porters carry sacks of flour in
from the road to the food workshops in the morning, and the packed goods of the workshops out
on delivery trolleys in the afternoon (pp176, 249). Who goes, when, and the days are INFERRED.

Ho Chi Kam (何智錦) and his wife cut hair at "the only hairparlour inside the City", from 9 am
until "there were no more customers", and "my customers are people living nearby" (p28). The
people who live within 20 m of the shop get a haircut about once in five weeks: about 12 to 19 a
day, most on a free afternoon. Women wash the clothes in the well water of the pipes, which
"could only be deployed for bathing and laundry" (p14), then hang them out in the corridor
(p176) or on the roof. Some police beats cross the roofs, where the constables, "often new to
the Walled City", ask the pigeon keeper the way (Chan Kwan Leung (陳昆亮), p319). Who is near, how
often, and the hours are INFERRED.

The patients of the City's doctors "come from both inside and outside the City, though mostly
from outside", often on "a recommendation by their friends or relatives" (Tsin Mu Lam (錢茂林),
pp186-187). About 300 residents a day, most of them old, see a doctor or a dentist near home, in
the hours of the clinics (pp187, 245). How many and when is INFERRED.

"Chung Lo Ying's daughter, Chung Yuk Yee, often joined her mother for dinner and helped with the
cooking" (p158). About half of the old women who live without a family have a daughter with a
family in the same building: on about 2 days in 5 she cooks for her own family first, then helps
her mother cook, and eats with her. At dinner time a woman asks her neighbour through the window
for some soy sauce: "Swapping ingredients through windows like this happened regularly" (Chan
Cheung-chuen (陳祥全), M+ audio guide 8038). Some owners of workshops and shops play mahjong with
other bosses after work (林羅平, HK01, 20 July 2024). Which families, and how often, are INFERRED.

Beside the free-school centre was the youth centre of the Hong Kong Federation of Youth Groups
(香港青年協會), "有不少年青人流連" (many young people spent their time there; HK01, 2016). Some
secondary-school students go there after school, and some young workers in the evening. On a
few nights a teenager stays there until about 10 pm; now and then the mother goes to fetch them:
"When they were out late at night, I might occasionally go out to fetch them and accompany them
home" (Chung Lo Ying (鍾太), p158). How many, and the hours, are INFERRED.

On a Sunday or a day off, some workers spend the afternoon at mahjong in a neighbour's flat
("The alleys were alive with the clacking of mahjong tiles", p15), on a walk in the park next to
the City (p80), or on the roof. The shares and the hours are INFERRED.

"A few heroin addicts remained in the City until the end" (p260). Twelve addicts beg the dealers
in the lanes for "a little" of the white powder (Wong Wai Chung, pp258-259), inject in a quiet
corner (p259), ask the workshops for a few dollars (Cheng San (鄭山), p169) and the doctors for
heroin substitutes (Tsin Mu Lam (錢茂林), p187). Most of them sleep on the streets outside the
City (p259). Some try to give up at the Shuiyuan youth centre of Jackie Pullinger (潘靈卓) on Tai
Chang Street (pp259-260) and at the daily prayer of the St Stephen's Society, with ten former
addicts who come back "to pray for drug addicts, and pay them visits" (pp261, 263). How many,
the hours and the places in the lanes are INFERRED.

At night a window glows where someone is awake in the room behind it (`src/life/windows.js`):
most flats in the evening, a few after midnight when the water comes, many again before dawn.
The flats have tungsten bulbs and the corridors fluorescent tubes (Girard and Lambot to HK01);
a corridor is lit here and there (INFERRED). "The Walled City was often hit by power cuts"
(Lam Po Chun (林寶鎮), p145), and houses shared one cable (p44): on some evenings a few
buildings near each other go dark for half an hour or more. When, and for how long, is
INFERRED.

The rooms and the roofs hold the things of `data/furnishings.json` (`docs/furnishings.md`):
the recipe of each kind of room comes from the photos and the texts of the sources, and a
documented room has its own list. Where each thing stands is INFERRED. The things show where
the floors show (pulled apart, or the peeled storey), and the small things show only near
the camera. Click a thing to see what it is and its source; the panel of a room lists its
things and the people in it now.

### The utilities

The water, the power, the post and the refuse of the City come from `data/utilities.json`
(`docs/utilities.md`), drawn by `src/life/utilities.js` with the things: the 67 roof tanks of
the wells and the floor hatches of their pumps, the one Government standpipe of Tai Chang
Street (大井街) with the hoses of the food factories, the seven standpipes outside the City, a
meter board at each G/F stair door (a meter for each flat), the letterboxes of the post, the
pipes and cables over the lanes and down the walls, the public lights of the Kaifong
Association (lit 24 hours a day), and the refuse points of the named lanes. The look of each
thing has a source; where each one stands is INFERRED. Click one to see what it is.

### The mysteries

The MYSTERIES button (top left, under the tools) opens ten cases of `data/mysteries.json`:
ten real people of the week to find, from easy (1) to hard (10). Each case gives five clues,
one at a time; the last clue helps a lot but does not give the answer. Click the person in
the City (for case 10, the room) to solve the case: its circle is checked, and its story opens.
Until a case is solved, its person is "SOMEONE" in the box under the pointer, and the places of
the sources that would give the answer away show no name. The browser keeps the solved cases
(`src/life/mysteries.js`).

### The street names

A dark plate names each named lane of the plan, with its Chinese name, for example
Lung Shing Road (龍城路), and each real road beside the City, for example Tung Tsing Road
(東正道) (`src/streetNames.js`). A lane plate stands over its lane at the height of the roofs
beside it. When the floors are pulled apart, it goes down to the lane; when a storey is peeled,
it stands at that storey. The clues of the mysteries name these streets.

### Deleted with the old 3D city

On 2026-11-07 the code of the old 3D city of the main app was deleted (John: "delete all dead
code"): the old people of the week and their routes, the game Find them 尋人, the numbers of the
1992 map, the floor-use legend of a cut storey, the ghosts of the real buildings that hid the
City, the old drawing of the surroundings, and their checks. The people of `src/life/`, the
street names of `src/streetNames.js` and the surroundings of `src/surroundings/` replace them.
The git history keeps the old code.

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

The main app and the viewer draw this data with `src/surroundings/`. `src/context.js` picks
the outlines to draw. For a building that the plate cuts, they draw the whole outline from
`plateClipped`. Thus Mei Tung House stands whole. Of the 1,263 drawn buildings, 612 have a
sourced height and 651 an inferred height. The colours and the 7 m width of the 9 road
segments with no measured width are inferred. The fit of the City on the 1987 sheet turns the
model 3.6°: plan +x points along the bearing 63.6° (`PLAN_BEARING`, `src/site.js`).

`node tools/check_context.mjs` checks `data/context.json`. It fails if a building is on the
City plate or beyond 600 m, if a building has no source, or if a survey sheet does not
register on the standing buildings. It also fails if a whole outline in `plateClipped`
reaches onto the City itself. It fails if the track of the planes (`src/approach.js`) is less
than 30 m over a roof within 60 m of the track, or over the City. It prints the five
buildings with the least clearance.

Last, `check_context.mjs` fails if an outline that `src/surroundings/` draws covers a cell
of the City.

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
- Peeled to a storey, the layers over it are hidden, and the layers up to it show.
