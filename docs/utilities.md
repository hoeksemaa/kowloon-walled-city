# Utilities of Kowloon Walled City (九龍城寨), December 1986

This report gives the utilities of the City for the model week, Mon 15 to Sun
21 December 1986. The systems are water, power, refuse, drains and toilets,
fire, gas and fuel, and post.
The data is in `data/utilities.json`. Each fact there has an id (U1, U2 ...),
a source, a page or URL, and the exact words of the source.

Status (2026-11-06): the work is complete for the sources that I read. The JSON
has 202 facts, 34 places, 24 schedule items, 29 visuals, 21 people and
14 disagreements. It also has placement rules for the drawing code and 20 finds
for a curious viewer. The open work is in "Still to do" at the end, and in
`notes` of the JSON.

Source types. The interviews in *City of Darkness Revisited* (2014, "the book")
were made about 1987-92: they are primary. The captions and the feature texts
of the book (pp104-113, p249) are secondary. Testimony on the web from 2009-2026
is retrospective. "Inferred" marks a value that no source gives.

## 1. Water

### What the sources say

- The Government gave safe drinking water from **eight standpipes**. **One**
  was inside the City, on Tai Chang Street (大井街). Seven were outside the
  perimeter (book p106 caption; p107; WSJ 2014). Yip Tak-wai (葉德偉) puts the
  outside standpipes on the edge, at Tung Tau Tsuen Road (東頭村道) and Tung
  Tsing Road (東正道) (HK01, 27 Aug 2016). (U1-U4)
- The well water was not fit to drink. People carried drinking water from the
  standpipes "till the end" (p108). (U21)
- In 1987 the Government surveyors found **67 working wells** of **about 40
  suppliers** (p107). Up to **300** wells were sunk over the years. The recent
  wells went down to **100 m**. (U11-U13)
- Pumps lifted the water to **tanks on the roofs**. Pipes ran down from the
  tanks into the blocks and flats (p107). The pump was usually **under a floor
  panel** (p112 caption, beside the interview of Chan Shing). (U15, U45)
- Many pumps ran at **noon and midnight**, and each run gave "a few hours'
  supply". Residents stored water in baths and buckets. **About 20 people**
  controlled the supply for the well owners (p107). (U16, U17)
- Some blocks had a 24-hour supply, but most did not (p113, Chu Yiu Shan
  (朱耀山)). (U41)
- Yim Kwok Yuen (嚴國源) thinks that half of his water comes from the mains
  (stolen) and half from a well. He drinks the mains water (p289). (U216)
- A household paid **$50-70 a month** in the late 1980s (p107). A shop paid a
  flat $100 (p44). 林羅平 gives $100 for a home and $300 for a workshop, not by
  meter (HK01, 20 Jul 2024). (U19, U55, U61)
- Water mains were also tapped illegally outside the City, at Sai Tau Tsuen
  (西頭村) and the Mei Tung Estate (美東邨) (p108). The largest stolen main ran
  under the Lung Heung café (濃香冰室) (p113). Staff of the Water Supplies
  Department (水務署) came in from time to time and cut illegal pipes (HK01
  2024). (U34-U36, U59)
- Food factories round the standpipe ran their own hoses to it and filled a
  tank in the factory "every once in a while" (p110). (U24, U25)
- The last natural ground well was in an alley off Tai Chang (Big Well) Street
  (p120). (U49)

### Numbers

| Item | Number | Date | Fact |
|---|---|---|---|
| Government standpipes | 8 (1 inside, 7 outside) | 1987 | U1-U3 |
| Working wells | 67 | 1987 | U11 |
| Well suppliers | about 40 (p112 says "70 or so") | 1987 | U11, U44 |
| Wells sunk over the years | up to 300 | 1960s-1987 | U12 |
| Supply controllers | about 20 | late 1980s | U17 |
| Charge per household | $50-70 a month | late 1980s | U19 |
| Compensation per well owner | $200,000 | c.1987-92 | U43 |

### Water times

| What | When | Basis | Fact |
|---|---|---|---|
| Pumps fill the roof tanks | about 12:00 and 00:00, every day | sourced (times); run length inferred | U16 |
| Taps run after a pump run | "a few hours" (3 h inferred) | sourced and inferred | U16 |
| One building: 2/F-3/F | about 06:00-07:00 | sourced (one example) | U60 |
| One building: 3/F-4/F | about 08:00-09:00 | sourced (one example) | U60 |
| A 13/F top floor | from 15:00 | sourced (year not given) | U62 |
| Standpipe in use | "throughout the day", also at night | sourced | U22 |

Rule for the model: each block has its own times. The default is a pump run
at noon and at midnight, and the low floors get water first. People wake up at
night when they hear the water, and do the washing (Tam Sau-kuen (譚秀娟),
WSJ 2014, U67).

### Places

| Place | Unit or point | Basis | Fact |
|---|---|---|---|
| Government standpipe, Tai Chang Street | 216:0:1; x -48.5, z 53, on the wall of building 235 | likely | U1, U26 |
| Hose bundle and the factory tanks | 216:0:1 to 216:0:4 (path in `placement.hose_path`) | likely | U24, U25 |
| USD notice 此井水不適宜飲用 (this well water is not fit to drink) | 216:0:1 | likely | U27 |
| Natural ground well off Tai Chang Street | 233:0:0; x -37.5, z 53 | likely | U49 |
| Big well beside 興發樓, No. 8 Tai Chang Street | no unit (90, 216 or 233) | guess | U53 |
| Stolen main under the Lung Heung café | 252:0:0 | likely | U36 |
| Roof tank of Chung Yuk Yee's building | roof of building 263 (in the tank list) | guess | U56 |
| Jetly Chau's (周秀儀) well-water meter | 11:2:0 | likely | U54 |
| The 7 outside standpipes | 7 points in `placement.outside_standpipes` | guess | U4, U5 |

The big well (inferred). The standpipe yard has a painted notice of the Urban
Services Department (市政總署): "此井水不適宜飲用". It also has the painted
characters 興發 (photos pp106, 109, 111). A 1988 book (魯金, through a 2005 blog)
puts the big well beside 興發樓 at No. 8 Tai Chang Street. In the model, the
natural well (233) is 11 m from the standpipe (x -37.5 and x -48.5, z 53). Thus the big well in use, the
natural well and the standpipe can be at one corner. The model's building 90
has the label 8 Tai Chang Street, but it is about 70 m away. The house numbers
of Tai Chang Street run the wrong way in the model.

### How the model will draw water

- Standpipe: a galvanised pipe frame about 1 m long at 0.9 m, with 3-4 brass
  taps. A rounded concrete cylinder (about 0.6 m wide, 1 m high) stands beside
  it. The floor is tiled, with a low kerb (photos pp106-111).
- A bundle of 40-60 rubber and plastic hoses rises up the wall and runs along
  the alley ceiling at 2.5-4 m to the factories.
- The well-head off Tai Chang Street: round concrete, about 1 m wide and 0.5 m
  high (p120).
- Pumps: a floor hatch of about 0.8 x 0.6 m in G/F rooms, one for each working
  well (67, inferred) (p112).
- Roof tanks: no source gives the size. A concrete box of about 2.5 x 2.5 x 2 m
  stands on a roof in photo p324 (use not stated). The model uses 67 tanks
  (inferred). See "Placement for the drawing code".
- People carry jerry cans (about 20 l), buckets and bottles from the standpipe
  up the stairs all day (pp108, 249).

## 2. Power

### What the sources say

All from Mok Chung Yuk, a China Light and Power (中華電力有限公司) engineer,
pp98-100, unless the list says otherwise.

- CLP supplied the City "in a major way" from **1977**. Before that, three
  supply points on Tung Tau Tsuen Road and "United Road" fed a few places on
  the edge. (U80, U81)
- Before the master plan, about **20%** of households had some supply, often
  illegal. In 1977-85 the supply grew fast. (U84, U85)
- CLP brought the cable in from the outside. Where rock stopped the digging,
  CLP raised the pavement over the cable. (U87, U88)
- CLP rented about **250 sq ft** (about 23 m²) from the church in the City for a
  **transformer** for **two high-density cables**. (U90, U91)
- CLP built "**a couple**" more **substations** on sites that fires had
  cleared. Permission came in 1984; the work took three years. (U92, U93)
- "By this time almost every flat had electricity." Theft went on in
  factories. Thieves were only disconnected. (U94, U95)
- Meter boards on G/F fed the flats by wiring tacked to the walls (p100
  caption). The photos show three boards. A wall of meters and fuse boxes is at a
  stair landing (p98). A board about 6 m long has two rows of about 40 meters
  (p99). A board of about 20 meters is at a stair entrance (p101). (U96, U98)
- Meter readers carried torches and dog repellent. They read "400 to 5[..]"
  meters a day (p98 caption). A smear in the scan itself hides the last two
  digits; "500" fits the shape. (U97)
- The Kai Fong Association (九龍城寨街坊福利會) paid for **more than 200 public
  lights**, on **24 hours a day** (p178, Chan Hip Ping (陳協平)). Many small
  alleys in the middle had light only here and there (p103). (U106, U108)
- Lam Po Chun (林寶鎮) was a postman in the City from 1979 to 1989 (p145). He
  says that power cuts were frequent. Then he took children and old people up
  the stairs with a torch. (U213, U105)
- Yim Kwok Yuen says that his workshop never had a power failure (p289). His
  flat has an air-conditioner, a television and a washing machine. (U217, U218)
- Flats had tungsten bulbs; corridors had fluorescent tubes (Lambot, HK01
  2024). In 1987 Posner saw wires, cables and fuses at head height and "an
  occasional naked bulb". (U109-U111)
- Neighbours lent power: when the flat above lost power, it let a plug down
  (MP Weekly). (U116)

### Places and drawing

| Place | Unit | Basis | Fact |
|---|---|---|---|
| CLP transformer room in church premises | 129:0:2 | guess | U90 |
| CLP substations on fire-cleared sites (2) | no unit | guess | U92 |
| 林羅平's own CLP meter, Kwong Ming Street (光明街) | 66:0:0 | likely | U115 |
| Kai Fong Association office (lights, clean-ups, notices) | 8:3:2 | verified | U106 |

- Meter boards: one at each G/F stair door, 27 meters on the median board.
  See "Placement for the drawing code".
- Overhead: a layer of pipes and cables along every covered alley. It is
  denser on the named lanes (pp102, 105, 144).
- Lamps: fluorescent tubes about 1.2 m long on walls at about 2.5 m on the
  main alleys; bare bulbs in some stairs. More than 200 public lamps, always on.
- Meter readers: in the City on most working days (inferred from about 8000
  meters at 400-500 a day).

## 3. Refuse

### What the sources say

- The Urban Services Department (市政總署, USD) collected **two tons** of refuse
  a day. **10 sweepers** patrolled the City. "Numerous" refuse collection
  points served them. USD buckets were everywhere (p104). (U120, U122)
- The refuse collectors came at **about 4 am** on Tai Chang Street "crashing
  and banging" (p93, Lee Pui Yuen (李培元)). This confirms the old code's
  "refuse at 4am (p93)". (U125)
- The KFA asked residents to take their garbage to "the refuse collection
  station" before work. Few did. Only two buildings had lifts (p179). (U127,
  U128)
- Every year the KFA ran a clean-up of roofs, alleys, pipes and cables (p104).
  The KFA and the USD cleaned together for Chinese New Year (p179). Chinese New
  Year 1987 was on 29 Jan 1987, thus not in the model week (inferred). (U123,
  U126)
- A metal grill over the Tin Hau Temple (天后廟) caught refuse thrown from the
  flats. It was cleared once a year (p241). (U131, U132)
- Rubbish filled the gaps between buildings (p103; Suzuki survey 1993, p209).
  Unwanted furniture and fittings lay on the roofs (p322). (U134-U136)
- A USD notice in an alley warns of poisonous rat-bait (photo p144). (U137)

### Places and drawing

| Place | Unit or point | Basis | Fact |
|---|---|---|---|
| Tin Hau Temple grill | 54:0:0; grill at y 24.1 over the light well | likely | U131 |
| Gap used as a dump | 13:0:0 | likely | U135 |
| Lee Pui Yuen's store, where the collectors pass at 4 am | 137:0:1 | verified | U125 |
| Tung Tsing Road Refuse Collection Point (outside) | plan x 117, z 132 | guess (role) | U142 |

- Refuse buckets of the USD: round plastic, about 0.6 m wide and 0.65 m high,
  stacked 5-8 high by stairs (p105).
- Refuse points: a recess about 2 x 1.2 m in an alley wall. It holds a low
  wooden bin full of plastic bags, and a broom (p104). The model has 23 points along
  the named lanes (inferred).
- The Tin Hau grill: steel mesh of about 5 cm squares over a light well about
  6-8 m wide, with refuse 0.3-0.5 m deep (p241).
- Refuse heaps on roofs and at the bottom of gaps.

## 4. Drains and toilets

- In the 1970s the Government and the Kai Fong put in a mains sewer. Before
  that, sewage ran in open drains (p108; Hansard 1974 c463). (U150, U153)
- In 1974 the USD cleared the open ditches twice a day and put in
  pumphouses. It also chlorinated the wells every day and kept public latrines
  (Hansard 1974 c472). (U154, U155)
- In the 1980s many flats had a toilet. Some floors shared one: "20 families
  shared one toilet" and emptied a chamber pot twice a day (Talk Irvine 2009,
  year not given). (U157-U159)
- Water dripped from the pipes in the alleys all the time. The postman got a
  hat against it. Plastic and metal sheets over the alleys gave a little
  protection (pp145, 149, 249). (U160-U162)
- The City flooded in storms (阿榮, HK01 2016; Ida Shum). (U144, U166)

| Place | Unit or point | Basis | Fact |
|---|---|---|---|
| Toilets and "P.H." opposite 12 Lo Yan Back Street | 125:0:1 | likely | U156 |
| Toilet of a 4/F flat, Tai Hing Building, 6 Sai Shing Road (西城路) | 138:4:0 | verified | U157 |
| Shared toilet, Suzuki gap building (1993) | 52:1:0 | guess | U169 |
| Tung Tsing Road Public Toilet (東正道公廁) (outside) | plan x 116, z 126 | guess (use) | U168 |

Drawing: put drip sheets of plastic or metal over the named lanes at 2.2-2.6
m. Put drain pipes about 0.1 m wide down the alley walls. Put boards on the wet
floors.

## 5. Fire

- The 1953-54 fire burned more than 3000 huts (p153). 1977 was "the year of the
  big fire" (p99). Gordon Jones says there were no significant fires in the
  high-rise years (WSJ). (U171, U83, U180)
- The KFA night patrol (11 pm to dawn) stopped in the 1970s. The KFA bought
  some fire-fighting equipment and put up fire notices (pp178-179). (U172-U174)
- Residents feared the wiring (p161). A rattan-shop fire: a family went down to
  3/F and stepped across to the next building (HK01 2016). (U175, U177)
- Fire engines did not get in. Inside there was a trolley with sand and
  buckets of water (Sharon Lam's father, 2018; year not given). (U176)
- No source gives fire hydrants in 1986. Four emergency hydrants were removed
  in 1964 (p107). (U182)

Drawing: no fire points are placed. A sand-and-bucket trolley is an inferred
item with no place.

## 6. Gas and fuel

- "Every family here uses an LP gas cylinder, which is a bit like keeping a
  bomb in your home" (p179, Chan Hip Ping). The KFA ran a safety campaign.
  (U190)
- Photo p288 shows Yim Kwok Yuen's workshop. A metal LP gas cylinder (about
  0.3 m wide, 0.6 m high) stands by the stove. (U219)
- Lee Pui Yuen sold rice, fuel and cigarettes at 12 Tai Chang Street, 8 am to
  midnight. He carried kerosene drums up 10 or more storeys (p93). (U191, U192)
- Tak Sang LP Gas Hong (德生行) was at 9 Tung Tau Tsuen Road, G/F (GRS). (U193)
- In one 13/F flat, each family had one kerosene stove in a shared kitchen,
  and rice cookers in the rooms (袁家倫, 2024). (U194)
- Town gas: I found no source.

| Place | Unit | Basis | Fact |
|---|---|---|---|
| Tak Sang LP Gas Hong (德生行) | 2:0:3 | verified | U193 |
| 順發士多, Lee Pui Yuen's store | 137:0:1 | verified | U191 |
| LP gas cylinder in Yim Kwok Yuen's workshop | 169:1:0 | likely | U190, U219 |

Drawing: a steel cylinder about 0.3 m wide and 0.6 m high, one in each kitchen
and workshop (not visible from the alleys).

## 7. Post

- Lam Po Chun was a postman in the City from 1979 to 1989 (p145). (U213)
- The postmen worked from the Lung Kong Road Post Office in Kowloon City. A
  sorting desk with 48 slots was too small (p146). There were **two postmen**
  from 1982. (U200-U202)
- The round began at a store on Lo Yan Street (老人街). It went to collective
  mail-banks, up dark stairwells and across the roofs (p146 caption).
  (U203, U204)
- Between roofs, people put a ladder. Where the roofs differed by two or three
  floors, they broke a corridor window and put a stool under it (p145). (U215)
- Photo p145: many small wooden letterboxes (about 0.25-0.3 m) on both walls
  of a narrow alley at 1.6-2.2 m. The postman wears a cloth hat. Single metal
  letterboxes of about 0.25 x 0.4 m hang at about 1.8 m (pp102, 148). (U205)

| Place | Unit | Basis | Fact |
|---|---|---|---|
| Store on Lo Yan Street (postman's base) | 45:0:2 | likely | U203 |
| Postbox of 94 Lung Chun Road, 5/F front | 257:5:0 | likely | U206 |
| Lung Kong Road Post Office (outside), on Lung Kong Road (龍崗道) | plan x -94, z 280 | likely | U200 |

## 8. Others

- Only two buildings had lifts (pp146, 179). Lam Po Chun also says "there were
  no lifts in the high-rise buildings!" (p145). (U210, U214)
- TV aerials stood on the roofs at a child's eye level (p324). TV cables,
  telephone lines and plastic pipes filled the lanes (HK01 2016). (U211, U74)
  The structure rule keeps TV masts out of the structure. They are in the JSON
  for a later art layer only.

## Placement for the drawing code

All points are in the scene frame of `src/layout.js`, in metres. This is the
frame of `S.list[b].cx/cz`, `S.graph.nodes`, `S.doors`, `data/context.json` and
`data/surroundings.json`. A unit key is `b:k:u` (building, floor, unit), as in
`S.unitNode`. The full lists are in `placement` of the JSON. All positions are
inferred; the look of each item has a source.

### Roof tanks and pipes

- Put one tank on each roof in the list: 67 tanks, one for each working well
  (U11, U15).
- A tank is a box of concrete or steel, 2.5 x 2.5 x 2 m, with its base at
  `b.top`. Each list item gives x, z and y.
- A greedy spread over all 277 buildings gives the list. A candidate has 8 or
  more storeys and no roof room. Every building centroid is at most 17.1 m
  from a tank (mean 8.5 m).
- Building ids: `0, 7, 13, 17, 18, 24, 25, 31, 32, 34, 37, 39, 41, 48, 51, 56, 57, 58, 59, 60, 65, 68, 72, 76, 85, 96, 98, 99, 102, 103, 108, 109, 112, 116, 118, 122, 123, 128, 129, 132, 139, 144, 147, 153, 160, 164, 166, 167, 170, 173, 180, 181, 186, 191, 193, 205, 212, 213, 219, 224, 228, 229, 243, 247, 250, 262, 263`.
- Pipes: 2-4 pipes go down the stair shaft of the tank building. 1-2 pipes run
  across the roof slab to each building in `feeds` (photo p323).
- Where two roofs differ by more than 3 m, the pipe goes down the facade.

### Pump hatches

Put one floor panel (0.8 x 0.6 m) in the largest G/F unit of each tank
building: 67 hatches (U45). Put it at the unit centre. Under it, put a pipe, a
valve with a hand wheel and an elbow. Examples: 0:0:3, 7:0:2, 13:0:1.

### Standpipe inside and the hoses

The standpipe is at x -48.5, z 53 (`S.L.standpipe`, cell 40640), on the wall of
building 235. The hoses run from it along the lane at 2.5-4 m to the factory
216:0:4. Path: (-48.5, 53), (-50.5, 53), (-50.5, 43), (-46.5, 43), (-46.5, 45).

### Standpipes outside

No source gives the exact points. The 3 on Tung Tau Tsuen Road follow Ng Kam
Mui's "taps at either end of the street" (U5). All 7 points are outside the
City (`S.L.inside` 0).

| # | Road | Point | Nearest building |
|---|---|---|---|
| 1 | Tung Tau Tsuen Road (東頭村道), south footway, west end | x -112, z -65.5 | north of building 5, about 8 m away |
| 2 | Tung Tau Tsuen Road, south footway, middle | x -20, z -52.3 | north of building 34, 0.6 m away, by its stair door |
| 3 | Tung Tau Tsuen Road, south footway, east end | x 52, z -66.5 | north of building 2, 2.2 m away |
| 4 | Tung Tsing Road (東正道), west kerb | x 119.5, z -30 | east of building 273 (temporary structure TS-E1), 12.7 m away |
| 5 | Tung Tsing Road, west kerb | x 118.9, z 0 | east of building 274 (temporary structure TS-E2), 6.9 m away |
| 6 | Tung Tsing Road, west kerb | x 118.5, z 30 | east of building 183, 3.5 m away |
| 7 | Tung Tsing Road, west kerb | x 118.2, z 60 | east of building 249, 0.6 m away |

### Meter boards and cables

- Put one board at each G/F stair door (`S.doors` kind "street", k 0): 226
  boards.
- Fix it on the entrance wall beside the door. Put its bottom edge at
  `b.y[0]` + 1.8 m.
- The number of meters m is the number of units of the building, all floors.
  The KFA had a meter fitted in each unit (U114). Total: 8352 meters.
- Put the meters in rows of up to 40, 0.15 m apart (p99). Put at most 3 rows
  on one board.
- If m > 120, put a second board on the other side of the door.
- Board width = 0.15 x min(m, 40) + 0.3 m (fuse boxes). Height = 0.3 m for each
  row.
- Median m is 27; the largest is 233. 75 buildings have more than 40
  meters, and 16 have more than 80.
- 51 buildings have no street door (`no_door_ids`). They get no board.
- From the board, a bundle of flex goes up the stair shaft, tacked to the wall.
  At each landing, wires split off to the units of that floor (p100).
- On named lanes, put a board with m of 40 or more on the lane wall outside the
  door (p99).

### Overhead pipes and cables

- Named lanes are the cells of `S.L.streetLanes`, about 634 m in all. Keys:
  kms Kwong Ming St, lys Lo Yan St, tcs Tai Chang St, skg Sz Kung St (社公街).
  Also: lsr Lung Shing Rd (龍城路), abs Almshouse Back St, tts Tin Hau Temple St
  (天后廟街). Also: lcb Lung Chun Back Rd and tcn (north part of Tai Chang St).
- On the named lanes, put 30-40 pipes and cables at 2.6-3.5 m, on wall brackets
  every 1.5-2 m.
- On the other lanes inside the City (`S.L.alley` 1, `S.L.inside` 1, about 2250
  m), put 10-20 pipes and cables at 2.3-3 m.
- Where a building covers the lane, fix them to its ceiling.
- On each facade that faces a lane, put 2-6 pipes and cables from the roof to
  the G/F (pp114-115).
- Between roofs, string 1-4 cables at 2-4 m (pp322-323).
- On the named lanes, put a drip sheet about every 6 m, at 2.2-2.6 m, slanted to
  one wall (p249).

How the main app draws them (`src/life/pipes.js`, since 2026-11-07, INFERRED):

- The pipes are tubes along the lane walls of each building, not boxes on the 1 m
  lane plan. `src/life/walls.js` casts rays at the walls themselves, thus no pipe
  goes through a wall or over a room.
- Each wall of a named lane has 14 slots, and each wall of a small lane has 6.
  The two walls of a lane and the cables across it give about 30 and 12.
- A slot keeps its height and its depth on each wall, thus a pipe goes on from
  one building to the next. A pipe often runs only part of a wall, and turns into
  the wall at its ends (U74: a new pipe beside a broken one).
- The rigid pipes bend at round elbows. The hoses, the cables and the flex sag
  between the brackets, and some flex hangs in loops.
- The overhead layer stays under the 1/F slab of the building.
- The risers are 1-4 groups on each building, between the windows: a drain to
  the lane, and pipes and cables that turn into the wall. They go round the
  setbacks, with a clamp on each second storey and a gooseneck over the roof.
- The cables and the flex are thin: they show only near the camera
  (`CityLayers.setTier`). The wires between buildings and the cables from roof
  to roof show only in the normal view (`CityLayers.addSpan`).

### Lamps

- These are the KFA public lights: more than 200, on 24 hours a day (U106).
- Put one fluorescent tube every 8 m on the named lanes, on alternating walls at
  2.5 m (84 lamps).
- Put one every 20 m on the other lanes (about 120 lamps).
- More than 30 m from the City edge, leave one in four of the small-lane lamps
  dark (p103).
- On each stair landing, put one bare bulb or one tube.

### Refuse points, roofs and gaps

Put 23 refuse points, one about every 32 m along each named lane. At each
point, put a wall bay with a low wooden bin (2 x 1.2 x 0.6 m) and 2-6 USD
buckets. At the 10 points nearest a stair door, also put a stack of 5-8
buckets.

| Lane | Points (nearest stair door of building) |
|---|---|
| kms | x 69.5, z -62 (door of 6); x 71.5, z -30 (door of 79); x 76.5, z 2 (door of 122); x 80.5, z 34 (door of 176) |
| lys | x 27.5, z -52 (door of 31); x 36.5, z -20 (door of 72); x 36.5, z 12 (door of 103) |
| tcs | x -32.5, z -39 (door of 55); x -42.5, z -7 (door of 111); x -49.5, z 25 (door of 152); x -53.5, z 57 (door of 235) |
| skg | x -85.5, z 39 (door of 206); x -53.5, z 42 (door of 182); x -21.5, z 47 (door of 193) |
| lsr | x 87.5, z -68 (door of 0); x 92.5, z -36 (door of 64); x 98.5, z -4 (door of 98) |
| abs | x 5.5, z -28 (door of 57); x 37.5, z -24 (door of 78) |
| tts | x 52.5, z -49 (door of 37); x 58.5, z -17 (door of 72) |
| lcb | x 12.5, z 37 (door of 202) |
| tcn | x -95.5, z -40 (door of 63) |

On each roof, put 1-3 heaps (about 2 x 2 x 0.4 m) of boards, plastic sheet and
broken furniture. Keep them away from the stair node (U136). In each gap between
buildings narrower than 1.5 m, put rubbish 0.3-0.5 m deep (U134, U135).

### Letterboxes

At each G/F stair door with m of 20 or more, put 8-20 small wooden letterboxes
at 1.6-2.2 m (p145). At the other doors, put 1-3 metal letterboxes at about
1.8 m (pp102, 148). (U205)

## Finds for a curious viewer

These are small details that a viewer can find if they stay and look. Each has
a source. The places and times come from the parts above.

| Find | Where | When | Facts |
|---|---|---|---|
| A floor panel in a G/F room. Under it: the pump pipe, a valve with a hand wheel and an elbow. | placement.pumps (67 rooms) | always; the pump runs at about 12:00 and 00:00 | U45, U16 |
| The standpipe: brass taps on a pipe frame, a concrete cylinder, a tiled floor, and 40-60 hoses that climb the wall to the food factories. | x -48.5, z 53 (P1, P2) | all day and night | U26, U25, U24 |
| A worker comes now and then to connect his factory's hose to the standpipe. | P1 and the factory 216:0:4 | in working hours | U24 |
| A man washes his hair at the standpipe; water runs on a basket of frozen eels for fishballs. | P1 | day | U23, U25 |
| The painted notice 此井水不適宜飲用 (this well water is not fit to drink) over the taps. | P4 | always | U27 |
| The last natural well: a round concrete well-head with buckets. | x -37.5, z 53 (P5) | always | U49 |
| A meter board with dozens of meters and a mass of flex that climbs the stair. | placement.meter_boards (226 stair doors) | always | U96, U98 |
| Meter readers with torches (and dog repellent) going from board to board. | meter boards | working days (inferred) | U97 |
| The USD refuse collectors, loud, on Tai Chang Street. | Tai Chang Street, past 12 Tai Chang Street (P26) | from about 04:00 | U125 |
| The grill over the Tin Hau Temple, under a year's refuse. | P19, y 24.1 | always | U131, U132 |
| A roof tank. A top-floor resident dips water from it with a small bucket. | placement.roof_tanks | when the taps are dry | U63, U15 |
| Water comes at night: lights go on and people start the washing. | flats | after the midnight pump run | U67, U16 |
| Two thin pipes across a roof slab, and cables strung between roofs. | roofs (placement.roof_tanks.pipes) | always | U74, U76 |
| A ladder or a stool under a broken corridor window: the way from roof to roof. | roofs | always | U215 |
| The postman in a cloth hat, sorting letters at a wall of small wooden letterboxes. | placement.letterboxes; his round starts at P32 | Mon-Sat (inferred) | U205, U161, U203 |
| A metal LP gas cylinder by the stove in a kitchen or workshop: 'a bit like keeping a bomb in your home'. | kitchens; P28 | always | U190, U219 |
| A drip sheet over the alley, and water dripping from the pipes above. | named lanes (placement.overhead.drips) | always | U162, U160 |
| The USD rat-bait warning on an alley wall. | alley walls | always | U137 |
| A dark small alley in the middle of the City, then a KFA lamp at the next corner. | placement.lamps | always | U108, U106 |
| A plug on a wire, let down from the flat above to borrow power. | G/F shops | in a power cut (rare event) | U116 |

## Schedule for the model week

| System | What | Days | From | To | Basis | Facts |
|---|---|---|---|---|---|---|
| refuse | USD refuse collectors take the refuse away, with noise, along Tai Chang Street | every day | 04:00 | 05:30 | inferred | U125, U120 |
| refuse | 10 USD sweepers patrol the alleys and the refuse collection points | Mon-Sat | 07:00 | 15:00 | inferred | U122, U138 |
| refuse | Some residents carry their garbage to the refuse collection station before work | Mon-Sat | 06:30 | 09:00 | inferred | U128 |
| water | Well owners' pumps run to fill the roof tanks (first run) | every day | 12:00 | 13:00 | inferred | U16, U17, U45 |
| water | Well owners' pumps run to fill the roof tanks (second run) | every day | 00:00 | 01:00 | inferred | U16, U67 |
| water | Taps run from the roof tanks after each pump run; residents fill baths, buckets and plastic drums | every day | 12:00 | 15:00 | inferred | U16, U17, U65 |
| water | Water by floors in one building: 2/F-3/F | every day | 06:00 | 07:00 | sourced | U60 |
| water | Water by floors in one building: 3/F-4/F | every day | 08:00 | 09:00 | sourced | U60 |
| water | Water reaches a 13/F top-floor flat | every day | 15:00 | 18:00 | inferred | U62, U63 |
| water | Some blocks have water all day (several connections) | every day | 00:00 | 24:00 | sourced | U41 |
| water | Residents and paid carriers fill containers at the Tai Chang Street standpipe; some wash clothes and bathe there | every day | 06:00 | 24:00 | inferred | U22, U23, U29 |
| water | Water carrying: people carry drinking water from the standpipes up the stairs | every day | 06:00 | 22:00 | inferred | U21, U30, U31, U7 |
| water | Food-factory workers connect their hose at the standpipe and fill the factory tank | Mon-Sat | 06:00 | 19:00 | inferred | U24 |
| water | Water charges are collected (by the supplier, by collectors, or at offices) | once a month | 10:00 | 18:00 | inferred | U19, U37, U44, U46 |
| power | KFA public lights are on | every day | 00:00 | 24:00 | sourced | U106 |
| power | CLP meter readers go round the meter boards with torches | Mon-Fri | 09:30 | 16:30 | inferred | U97, U112 |
| power | Power cuts (events, not a timetable) | random | - | - | inferred | U105, U217 |
| refuse | KFA communal clean-up of roofs, alleys, pipes and cables; USD cleaning for Chinese New Year | once a year | - | - | inferred | U123, U126 |
| refuse | Tin Hau Temple grill cleared | once a year | - | - | inferred | U132 |
| post | Postman's round from the store on Lo Yan Street, up stairwells and across roofs | Mon-Sat | 08:20 | 14:00 | inferred | U203, U204, U202 |
| gas | Lee Pui Yuen's store open; he delivers rice and kerosene up the stairs | every day | 08:00 | 24:00 | sourced | U191, U192 |
| drain | Chamber pots emptied (in flats without a toilet) | every day | 07:00 | 07:30 | inferred | U158 |
| fire | No KFA night fire patrol in 1986 | none | - | - | sourced | U172 |
| water | Water Supplies Department staff come in and cut illegal pipes (events) | random | - | - | inferred | U59 |

## Disagreements

1. Water suppliers: some 40 (p107) or "70 or so" (p112, Gordon Jones). The
   counts use about 40.
2. Standpipes: 8 (p106, p107, WSJ) or "about seven" (Albert Ng). 5 in 1964.
   The model uses 8.
3. Water times: see the table in part 1. Each block has its own times.
4. Water charges: $50-70, $100, or $100 and $300 a month.
5. Water meters: some links had a meter (p44); most paid a flat fee (HK01 2024).
6. Chu Yiu Shan (朱耀山): this is not settled here. The task brief and the
   SOURCE.md table (row p112) call him a private water supplier. The p113
   standfirst says: "He operated as a property developer and estate agent for
   many years" (U220). The p112 caption names Chan Shing as one of the "70 or
   so private water suppliers" (U44). The people agent reads p112 and decides.
7. The big wells: see part 1.
8. Power before 1977: 20% of households, or each family by itself, or none.
9. Drains: a sewer from the 1970s (p108), but "open sewers" in 1992 (Baltimore
   Sun) and "no drainage" (Lockeyear, SCMP 2018).
10. Lifts: two (book, WSJ). UPI 1987 says "all without elevators". Lam Po Chun
    says "no lifts" on p145, but "two buildings" on p146.
11. Meter readings: "400 to 5[..]" a day. The smear is in the scan; "500" fits.
12. Refuse: "the refuse collection station" (one, p179) or "numerous refuse
    collection points" (p104). The model has many points inside and one
    station outside.
13. Power cuts: "often hit by power cuts" (Lam Po Chun, p145). "We have never
    had a power failure" (Yim Kwok Yuen, p289). The model makes power cuts rare
    events, and some blocks never get them.
14. Drinking water: from the standpipes (p108), or mains water from the tap
    (Yim Kwok Yuen, p289; U40). Most flats carry it from the standpipes.

## Still to do

1. Check 魯金 (1988) on the big well: is it the well in use or the sealed well?
2. Follow the GRS leads (HKRS1078-1-50 and -58) for the real places of the 67
   wells.
3. Check if Lee Pui Yuen's store (12 Tai Chang Street) and the corner store at
   Lung Chun Back Road (龍津後街) (p91) are one store.
4. Chu Yiu Shan's trade: the people agent decides (disagreement 6).
5. Save local copies of the HK01 2016 series (the local folder is empty).
6. No source gives the material and size of the roof tanks, or the hours of the
   sweepers and the meter readers.
7. Add Mok Chung Yuk, 袁家倫 and Tam Sau-kuen (譚秀娟) to `data/people.json`.
8. Proposed new kinds: notice, refuse_gap, drip_sheet, water_container,
   lpg_cylinder, fuel_shop, trade_shop, office, post_point, tv_aerial.
