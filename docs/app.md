# The main app and the structure viewer

This file tells what the two pages show and how they work. The README gives the folders.

## The structure viewer (`structure.html`)

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
  See [docs/rooms.md](rooms.md).

The two parts do not import each other. The structure has no colours: the viewer and the
main app give their placeholder colours (`src/structureColors.js`). Only the structure is
definitive. Each earlier 3D model of the City is superseded. The old 3D city of the main app
is deleted.

## The main app (`index.html`)

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
- **Peel to a storey.** Click a storey in the tool of the floors, or use the arrow keys. All
  the floors over that storey go, with all the roofs over it and all that is on them. The
  walls of that storey stay whole, to the slab of the next floor: the peel cuts nothing, it
  only takes the layers over the storey away. Thus every room of that storey shows from
  above, with all its mass. A lower building shows its roof. The peel works also with
  the floors apart. The RF button of the storeys, or Esc, takes it away.
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
- **Clock and light.** The week starts on Monday 15 December at 09:45, in real time. The
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
- **Loading screen.** While the City is built, a red screen shows the name of the City and
  the white bauhinia of the Hong Kong flag (as `favicon.svg`). Its five petals light one
  after the other, clockwise, as a spinner. Each petal is a box of its own, thus the
  browser can animate it while the script builds the City.
- **Layout, mobile first.** The app has one design, for the phone first (`src/style.css`). A
  title box at the top left gives the name of the City, the date and the time. The menu
  button at the top right is an icon only (key M). It opens the tools: a column of four icons,
  with no words, that comes down from it. A tap off the icons closes the column. Each tool
  opens its own sheet: the time (the weather, the day and the speeds), the floors (pull them
  apart, and peel the City to one storey), the mysteries, and the sources and notes. The
  title box is never wider than the space to the left of the menu button, thus the two never
  meet. The selected building or person also has a sheet. On a phone, a sheet comes up from
  the foot of the screen. A wide screen (more than 720 px, or a phone on its side) gives the
  same design more room: larger text and buttons, each sheet a card at the right under the
  menu button, and the storeys with no scroll. When a sheet is open, the view moves, thus the
  City stays in the part of the screen that shows.
- **Touch.** Drag to turn the City, pinch to zoom, and move two fingers to pan. A tap
  selects, but a gesture of two fingers never selects. A finger shows no tooltip.

The "Sources + notes" panel (`src/notes.js`) lists what the structure takes from each source,
and what it infers.

## The people and the things

The main app shows the people of the week of 15 to 21 December 1986 (`src/life/`). The crowd
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
2 or 3 am (p237). The food workshops work through Sunday night, the night before 冬至 (pp44, 289). Which
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
On Sunday, the day before 冬至, some old women help at the food workshops on a daily rate (p44).
On Sunday afternoon about 50 old people go to the annual Christmas party of the Kai Fong
Association (九龍城砦街坊福利事業促進委員會), in the large room off its office (p180). The source
gives no date: the day and the hours are INFERRED. Taxi
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

What each person does shows in the body (`src/life/acts.js`, `src/life/figures.js`). Each doing
of a plan gives one activity: sleep, eat, sew or pack, work at a bench, cook, carry, sweep, talk,
play mahjong, wash, play, pray, exercise, reach up, write or rest. A person "at the workshop"
does the work of its trade: a garment worker sews, a metal worker works at a bench. The doings
have their sources in the plans; the activity of each trade and how each activity moves are
INFERRED. At night a sleeper lies under a quilt in a bed of the room: a bed, a bunk, a bed space
or a cockloft (閣仔) of `data/furnishings.json`. The lower tier of a bunk fills first, because
the upper tier often holds bedding, not a sleeper (F53). When a room has more sleepers than
beds, the others sleep on the floor. Which sleeper takes which bed is INFERRED.

The rooms and the roofs hold the things of `data/furnishings.json` (`docs/furnishings.md`):
the recipe of each kind of room comes from the photos and the texts of the sources, and a
documented room has its own list. Where each thing stands is INFERRED. The things show where
the floors show (pulled apart, or the peeled storey), and the small things show only near
the camera. Click a thing to see what it is and its source; the panel of a room lists its
things and the people in it now. The outer walls of the flats have the caged balconies, one on
each floor, with laundry, pot plants and songbirds, and the bamboo laundry poles, awnings and
air-conditioners of the photos (`src/life/facades.js`). The shares come from the photos of the
outer facades; the cages over the inner lanes are INFERRED.

## The utilities

The water, the power, the post and the refuse of the City come from `data/utilities.json`
(`docs/utilities.md`), drawn by `src/life/utilities.js` with the things: the 67 roof tanks of
the wells and the floor hatches of their pumps, the one Government standpipe of Tai Chang
Street (大井街) with the hoses of the food factories, the seven standpipes outside the City, a
meter board at each G/F stair door (a meter for each flat), the letterboxes of the post, the
pipes and cables over the lanes and down the walls, the public lights of the Kaifong
Association (lit 24 hours a day), and the refuse points of the named lanes. The look of each
thing has a source; where each one stands is INFERRED. Click one to see what it is.

## The weather

The weather of each day of the week comes from the daily data of the Hong Kong Observatory
(香港天文台) (`data/weather.json`): the temperatures, the rain and the humidity of the
Observatory headquarters, and the sunshine of King's Park (京士柏).

| Day | Min–max °C | Rain | Sun (h) | Humidity |
|---|---|---|---|---|
| Mon 15 | 18.6–21.6 | trace | 9.3 | 73% |
| Tue 16 | 18.1–19.6 | trace | 1.4 | 79% |
| Wed 17 | 18.3–19.8 | trace | 0.0 | 83% |
| Thu 18 | 12.9–20.4 | 1.3 mm | 0.0 | 84% |
| Fri 19 | 10.1–16.6 | 0 | 9.4 | 55% |
| Sat 20 | 11.7–16.6 | 0 | 9.2 | 64% |
| Sun 21 | 13.0–19.5 | 0 | 9.5 | 66% |

The tool of the time gives the weather of the day. The hours of sun set the cloud of the sky
(`Lighting.setCloud` in `src/env.js`): on a grey day the sun is weak, the shadows are faint and
the sky is grey. The same cloud all day is INFERRED, and the app draws no rain. The effects on
life are INFERRED (`roofWeather` and `wet` in `src/life/sim.js`). On the wet Thursday, half of
the visits to the roofs for leisure do not happen, and the washing dries in the corridor. On
Friday and Saturday (a minimum under 12 °C), 3 in 10 of them do not happen.

## The mysteries

The tool of the mysteries (the magnifying glass) opens ten cases of `data/mysteries.json`:
ten real people of the week to find, from easy (1) to hard (10). Each case gives five clues,
one at a time; the last clue helps a lot but does not give the answer. Click the person in
the City (for case 10, the room) to solve the case: its circle is checked, and its story opens.
Until a case is solved, its person is "SOMEONE" in the box under the pointer, and the places of
the sources that would give the answer away show no name. The browser keeps the solved cases
(`src/life/mysteries.js`).

## The street names

A dark plate names each named lane of the plan, with its Chinese name, for example
Lung Shing Road (龍城路), and each real road beside the City, for example Tung Tsing Road
(東正道) (`src/streetNames.js`). A lane plate stands over its lane at the height of the roofs
beside it. When the floors are pulled apart, it goes down to the lane; when a storey is peeled,
it stands at that storey. The clues of the mysteries name these streets.

## Deleted with the old 3D city

On 2026-11-07 the code of the old 3D city of the main app was deleted (John: "delete all dead
code"): the old people of the week and their routes, the game Find them 尋人, the numbers of the
1992 map, the floor-use legend of a cut storey, the ghosts of the real buildings that hid the
City, the old drawing of the surroundings, and their checks. The people of `src/life/`, the
street names of `src/streetNames.js` and the surroundings of `src/surroundings/` replace them.
The git history keeps the old code.
