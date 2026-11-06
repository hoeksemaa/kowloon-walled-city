# Room uses, December 1986

This report tells how each room (unit) of the frozen 3D structure got a use for December 1986.
The structure does not change: the use is a label on the units of `src/city/`.

## Files

| File | What it holds |
| --- | --- |
| `data/room_research.json` | 771 research facts, each with its source, quote and cite. 585 are places, 186 are people (for the later work on people; the build does not use them). It also holds the disagreements, the leads and the coverage. |
| `data/room_uses.json` | The mask: one row per unit (`b`, `k`, `u`, `cat`, `basis`, `place`), the 18 categories, and the documented places with their sources. |
| `docs/room_places.md` | A table of the documented places and their units (generated). |
| `tools/build_room_uses.mjs` | The build. Run `node tools/build_room_uses.mjs`. |

A unit key is `b:k:u`: the building id, the floor (0 = G/F), and the unit id on that floor.
A roof room is `b:n:0`, where `n` is the number of storeys of the building.

## Sources and method

1. The GRS (政府檔案處) catalogue (HKRS1255-3, the clearance compensation files of 1987-1992) gives 459 premises with a street, a house number and usually a floor (`data/businesses.json`).
2. Agents read the sources in two sweeps (2026-11-04 and 2026-11-05):
   - every page of Girard and Lambot, *City of Darkness Revisited* (2014), with its interviews, photos, captions, the 1992 numbered map (pp352-353), Suenn Ho (何巽) (pp137-139), the Suzuki (鈴木隆行) survey (pp208-209), the 1968 Survey and Mapping Office (測繪處) map, and the clearance sketch-survey sheets (p340);
   - the GRS catalogue titles (HKRS1255-3, HKRS1078-1), with the address errors of `data/businesses.json`;
   - the LegCo (立法局) Hansard 1986-1993, UPI, the Baltimore Sun, TIME, and the HKU (香港大學) clippings;
   - the resident testimony on the web (WSJ 2014, HK01 (香港01), SCMP, M+, Gwulo, 明周 2024, lichokiu 2005, the Industrial History of Hong Kong pages);
   - an open web search in English, Chinese and Japanese (with the labels of the 大図解 九龍城 panorama at rioleo.org).
3. A second agent checked each verified fact against its source. It confirmed 8 facts of sweep 2, and corrected 2.
4. I merged the facts (`data/room_research.json`):
   - A fact that gives the same place as a GRS premises (the same file, or the same street, number, floor, category and name) is `same_as` that premises.
   - Two facts with the same Chinese name core and the same category are one place, if they do not give two different addresses.
   - A fact for a second premises of a GRS business (another street, number or floor) stays its own place.
   - A fact that corrects a GRS entry has `corrects`. The build uses the corrected street, number and floor.
   - 21 facts have `drop`: a passage, a well, or a general statement about many places ("drug dens", "dogmeat restaurants"). They are not one room.
5. The period is December 1986. Sources of 1983-1992 count, and the date nearest to December 1986 wins. 104 places are outside the period (1940-1975 and after the clearance began). They stay in the research file, and the build does not use them.
6. The build puts each documented place in a unit. Then it fills the other non-residential units from the counts of the sources. All other units are homes.

## Categories

| id | Label | Units | Holds |
| --- | --- | ---: | --- |
| home | flats | 8172 | homes: flats, divided flats, cubicles, roof huts |
| dentist | dentist | 86 | dental clinics and denture makers |
| clinic | doctor / clinic | 60 | doctors (mostly unlicensed, trained in China), clinics, bone-setters |
| medicine | herbalist / medicine shop | 15 | Chinese herbal doctors and medicine shops |
| plastics | plastics factory | 93 | plastics and rubber workshops |
| metal | metal + machine works | 65 | metal, machine, electrical and jewellery workshops |
| garment | garment, textile + shoe workshop | 74 | weaving, knitting, garments, shoes and leather |
| foodfac | food workshop | 105 | noodles, fishballs, meat, cakes, candy, catering |
| works | other workshop | 53 | wood, paper, printing, pigeon lofts, other factories |
| shop | shop | 81 | stores, groceries, stalls |
| eating | eating house | 28 | restaurants and cafés |
| office | office / company | 47 | trading, property and other company premises |
| storage | store room | 4 | store rooms and warehouses |
| services | services + utilities | 12 | barbers, laundries, water and power suppliers, toilets |
| school | school / kindergarten | 5 | schools, kindergartens, child care, tuition |
| religion | temple / church / mission | 11 | temples, shrines, churches, missions and their centres |
| community | association / community | 11 | the Kai Fong association (九龍城砦街坊福利事業促進委員會), clubs, youth and old people's centres |
| vice | gambling / drugs / sex | 4 | only where a source shows one room in the period |

## Basis

Each unit has one basis:

- **verified**: a source gives the street, the house number and the floor, or a named building and floor, or a drawn plan of the room.
- **likely**: a source gives the use and part of the place: the street, a number on the 1992 map, or a building with no floor.
- **guess**: the use comes from the counts of the sources, or the use or the place is uncertain.

A verified address gives a building through the house numbers of Suenn Ho's (何巽) route maps of
1991 (M+ CA17/2/1-3, `data/address_anchors.json`, `tools/addresses.mjs`). The base plan of these
maps prints the house number of most lots. The numbers were read from the 1000 px online images
and fitted to the plan of the model (median error 0.4 m). On each street the numbers must run
in order: a number out of order is dropped (a misreading, or a lot of the next street). Where the
map gives no building, the place takes the old house-number order of the layout (`src/layout.js`
`locate`), which is APPROXIMATE. The unit on that floor is the best fit for the use (a front unit
on G/F for a shop, a factory unit for a factory).

The route map and the 1992 map agree. For example, 82 Lung Chun Rd (龍津道) is 9 m from its number
on the 1992 map (the old order put it 121 m away), and the Kai Fong office at 16 Tung Tau Tsuen Rd
(東頭村道) is 1 m from it (17 m before).

## How the build places a documented place

The `how` column of `docs/room_places.md` gives the step:

1. **route map**: the building where the route map prints the house number on that street.
   **route map, between**: the map does not print the number: the frontage point between the two
   nearest numbers that it prints on that street (and on that side). **route map, beyond**: at
   most 4 numbers past the last number that it prints there. A numbered lane is not on the map:
   only its street is known.
2. **map**: the building nearest to the place's number on the 1992 map (pp352-353). If the route
   map's building is more than 25 m from that number, the 1992 map wins (with a note).
3. **address**: the building where the layout put the GRS premises, else the building at the
   address in the layout's house-number order (APPROXIMATE).
4. **clue**, **street**: a building that a clue names, or a building on the street that the source
   or its location clue names.
5. If the building is lower than the floor, the nearest building that is tall enough.
6. If the floor has no free unit: a verified place stays in its building and shares a unit; another
   place goes to the nearest building within 30 m that has one (the same street first).
7. If a source gives no floor: a home gets a floor above G/F; another place gets a floor from the GRS premises of its category (most dentists on G/F, most clinics on 1/F-2/F).

## The count model (guess units)

The total of each trade:

- dentists 86 (1987, p36); clinics 60 (p187); medicine shops and herbalists about 15;
- the other trades: the Kai Fong count of 1983 (WSJ 2014): plastics 93, shops 77, metal 56, garment and textile 74, other manufacturing 41, food 68, others 50. The others are split in the shares of the GRS offices, eating houses, services and store rooms.

The build does not scale these counts. The Kai Fong survey (745 premises, 1983) and Suenn Ho's
levels (about 740 units without the mezzanines, 1991-92) give about the same total.

The documented places count against these totals. The build adds guesses only for the rest.
The floors of the guesses come from the floor spread of the GRS premises of the same category
(the spread of all GRS premises for a category with fewer than 10). Then a weighted random pick
(seed 19861201) chooses the units on each floor:

- dentists, clinics and medicine ×4 on the edge roads (Tung Tau Tsuen Rd (東頭村道), Lung Chun Rd (龍津道), Lung Shing Rd (龍城路));
- dentists and eating houses ×4 in the temporary structures on Tung Tsing Rd (東正道) (p32);
- food workshops ×2 on Tai Chang St (大井街) and Kwong Ming St (光明街) (pp110, 290);
- factories ×0.5 on the west side (p12), and ×12 on the factory units of the model above G/F.

A factory unit of the model is an inference from the building's form. If the counts do not fill
it, it is a home: the factory totals come from the sources, not from the unit kinds.

The documented places pass the totals of food workshops (105 against 68), metal (65 against 56),
other workshops (53 against 41), shops, eating houses, offices, services and store rooms. Some of
these places can be from 1987-1992 and not from 1986.

## Counts

- Units: 8926. Verified 476, likely 132, guess 8318.
- Documented places in the period: 752 (458 GRS premises and 294 places from the other sources). 698 have a unit; 54 have none.
- Placed documented places: verified 476, likely 132, guess 90.
- 3 places share a unit with another place, because no free unit was near.

## Distribution check

| Measure | Sources | Labels |
| --- | --- | --- |
| Homes, share of all units | about 92% (8,800 households, LegCo Jan 1987) | 92% (8,172 of 8,926) |
| Homes, number | 8,800 | 8,172 (the model has 277 buildings; the sources say about 350) |
| Non-home units | 745 (Kai Fong 1983) to about 790 (Suenn Ho 1991-92) | 754 |
| Factories | 332 (Kai Fong 1983) | 390 (322 documented, 68 guesses) |
| Factories on G/F | about two thirds of the GRS factories | 245 of 390 (63%) |
| Factories on a top floor or a roof | almost none | 2 on top floors, 0 on roofs |

Non-home units by level, against Suenn Ho's drawing (p139, about ±20 %):

| Level | G/F | 1/F | 2/F | 3/F | 4/F+ |
| --- | ---: | ---: | ---: | ---: | ---: |
| Suenn Ho (何巽) | 350-450 | 160 | 110 | 70 | (none drawn; 40 GRS) |
| Labels | 471 | 104 | 78 | 43 | 58 |
| Factories in the labels | 245 | 56 | 36 | 25 | 28 |

G/F is a little above Suenn Ho's range, and 1/F-3/F are 28-39 % below her counts. The documented
places cause most of this: the sources (the GRS files, the street photos, the signs) show more G/F
rooms than rooms upstairs. The guesses are too few (about 100) to change the levels much.

A check of the documented factories (2026-11-05) found 7 duplicates (one room counted twice), and a
second agent confirmed them. It found no factory that a source dates outside December 1986.

## Disagreements with the model

`data/room_research.json` lists 63 disagreements, and 195 facts have a `model_conflict` note. The large ones:

- **House-number order.** The layout's house-number order is wrong on most streets. Suenn Ho's route map now gives the building of most addresses (see above). Kwong Ming Street (光明街) numbers "went somewhere else" after 43 (p146). Lung Chun Rd 1-70 are not on the route map (it prints 160 down to 72 along the south road): these places keep the layout's order.
- **Kai Fong office.** The GRS gives 2/F and 3/F of Wing Fat House, 16 Tung Tau Tsuen Rd. The layout puts it in building 25, `locate` gives building 31, and map 15 is near building 8.
- **Fuk Tak shrine (福德古廟).** The GRS gives the Fuk Tak Temple (福德土地廟) at 5 Tai Chang St 5th Lane. The book (p32) and map 12 put the later, simpler shrine on the east side.
- **Old School and Old People's Centre (老人中心).** The 1992 map draws map 28 (Old School) as a small building at the south-west corner of the Yamen (衙門) court. Model building 172 there is an 11-storey tenement, and `docs/structure.md` gives the Free School (義學) at about full height (pp20-21). Model building 100 has the label of the Old People's Centre, but map 27 puts the centre in the Yamen.
- **Building heights.** Chung Lo Ying's building and the Chung Fat Café building (11 storeys in the source, 12 in the model). The 12/F flat at 31 Tung Tau Tsuen Rd: the model now has 13 storeys there (`docs/structure.md`, 2026-11-05).
- **Streets that the model does not have.** "Kwong Wah Street" (model building 37) comes from the firm name Kwong Wah Weaving Factory (廣華布廠). Tung Tsing Road premises are the City's east edge, and one title makes 25A Tung Tsing Rd the same as 25A Lung Shing Rd. Tin Hau Temple Street (天后廟街) and Tin Hau Temple Back Street are two streets, but the model has one.
- **Lane numbers.** 33 GRS premises are in numbered lanes, but `data/businesses.json` files them as main-street numbers. The floor of one flat can also change with the entrance ("2/F, also known as 6/F").
- **Missing premises.** 39 addressed GRS premises are missing from `data/businesses.json`, because the parser does not read their street forms.
- **The number of buildings.** The model has 277 buildings. The sources give about 350 (the postman, M+, the Baltimore Sun 1992).

The model stays frozen. These disagreements are for John to decide.

## Unplaced places (54)

- 7 are on lanes that the model does not know: Cheung On Lane (3 flats on 5/F, from the clearance sketch survey), Shun Yi Lane (3 factories), Co Lane (a candy factory).
- 47 have no street, building or map number in any source. Examples: Jackie Pullinger's "The Well", the Hsin On Chapel of the Lutheran Church, the martial-arts school, several family flats on 5/F-13/F, and photos of clinic and workshop interiors.

`docs/room_places.md` lists them all.

## Leads

These sources can give more rooms, but I could not read them:

- 大図解 九龍城 (Iwanami (岩波書店) 1997): the room plans of the February 1993 survey. Only panorama pages 5-6 and 11-12 are on the web. Print only.
- Suenn Ho, 1992 Fulbright study (M+ CA17): the full "non-residential units by level" drawings and the plans of each level.
- 城寨福利會訊 (the Kai Fong newsletter), February 1987: a primary source; not online.
- 魯金《九龍城寨史話》(1988), pp104-133: the places street by street. Print only.
- 喬健等 (1992), pp1020-1034: the Kai Fong survey of 745 premises (1983). Print only.
- *City of Darkness* (1993) pp172 and 178: the Tung Tau Tsuen Rd facade with about 22 signs that can give the floors.
- Girard and Lambot's negatives or M+ prints: the address lines on the clinic signs are too small in the book.
- Hong Kong Medical Journal 2026 (Wu, a survey of 72 unregistered doctors) and HKU MA thesis 2025 (Wu, the unregistered dentists): blocked (403).
- Granta 29 (Zachmann, 1987-88) and the Magnum captions: blocked; the Internet Archive was offline on 2026-11-05.
- GRS HKRS1078-1-53 (Hsin On Centre, 1987-1992): can give the chapel's address.
- The Hong Kong Heritage Project oral history of 羅開祥, the Kai Fong secretary: blocked (403).
- Fiona Hawthorne's 1986 sketches: the book shows two of "dozens".
- The Sing Pao (成報) photo archive 1987-94 and the Ko Tim Keung (高添強) collection: not online.

`data/room_research.json` (`leads`) has all 44 leads with their links.

## Coverage

The agents read every page of *City of Darkness Revisited* that the scan has (pp84-85 are missing),
all five GRS catalogue CSVs, all 22 LegCo Hansard PDFs with a Walled City passage, and the open web
sources above. `data/room_research.json` (`coverage`) gives the pages of each part.

People (residents, their homes and their routines) are a separate, later process.
