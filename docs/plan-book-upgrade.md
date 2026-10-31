# Plan: upgrade the model with *City of Darkness Revisited*

Written 2026-10-30. Status: PRs 1 and 2 are merged (#11, #12). On 2026-10-31 John answered decisions 1–3: yes to the head count, one postman with no look-alike, and sound now. Page numbers are printed pages of the book.

## Goal

The model will show the City from the inside: towers, stairs, corridors, roofs and flats. People from the book work at their recorded addresses and hours. The light and the colours match the photos. A new game asks you to find three real people, with stronger hints at each step.

## Rules that stay

- One week, Tue 16 to Mon 22 Dec 1986, which ends on 冬至. The pixel UI stays.
- Each item is SOURCED, APPROXIMATE or INFERRED, and the app says which.
- Real people say only recorded words. The interviews of about 1990 describe "now". For 1986, I use only what people say about their life before the clearance announcement (14 Jan 1987).
- No book image goes into git or into the app. I use facts, short quotes, page numbers and measured colours.
- When sources conflict, the printed text wins, then the clearance file (GRS), then the 1992 map. The map disagrees with the printed address for markers 19, 21, 24, 25 and 40.

## 1. Evidence data (PR 1, small)

- **`data/book.json` (new).** It holds the facts that the code uses, each with its page:
  - the 40 places of the 1992 map (pp352–353), placed on the plan grid;
  - the street names and the numbered lanes;
  - the real addresses and opening hours;
  - the 4/F flat plan of 6 Sai Shing Road (p340).
- **`tools/book_overlay.py` (new).** It lays the 1992 map and the 1987 figure-ground plan (p134) over `data/plan.json`. It reads the scans in `local/` and writes only numbers.
- **Street names.**
  - Rename "Tai Tseng St" to "Tai Chang St 大井街". The clearance files and the book both use that name.
  - Add the four streets that the model does not name: Almshouse Back St, Tin Hau Temple St, Lung Chun Back Road, and the north-west leg of Tai Chang St.
  - Add the numbered lanes from the files, for example "Tai Chang Street, 7th Lane" and "Sai Shing Road, Second Lane".
- **Address matches.** The book and the clearance files agree on four places:
  - Chung Fat Café, 19A Tung Tau Tsuen Road (p57);
  - the noodle factory at the back of 2 Kwong Ming Street (p170; file: 宏發麵廠, 1st Lane);
  - the store at 12 Tai Chang Street (p93; file: 順發士多);
  - the candy factory at 12 Sai Shing Road (p76; file: Shui Tung Confectionery, Second Lane).

## 2. Towers, floor plans and routes (PRs 2 and 3, large)

The model has 474 plots now. Each storey is one open floor with one stair, and people walk only on the ground. The book gives "around 300" buildings in 1987 (p134, p340). Lam Po-chun counted 350 (WSJ, 2014).

- **Towers.** Join the 474 plots into about 300–350 towers. Use the 1987 figure-ground where the overlay fits. Elsewhere, join neighbours that have no lane between them. Each tower keeps its plots as blocks, as in the file addresses ("Front Block", "Rear Block").
- **Heights.** Keep the 1990 south elevation. On the north side, use "12 storeys and more" (p132). Keep 14 as the usual top, with a few towers at 15 ("a possible 15 storeys", p340). Let the upper floors of a tall tower spread over a lower neighbour's roof (p137).
- **Stairs.** Give each tower one of Suenn Ho's stair types (pp138–139): centre, side, corner, strip, outside with a bridge, or a corridor with a stair at each end. Where two or three towers meet, let them share one stair. Only two buildings have lifts (p146; WSJ).
- **Floor plans.** Divide each storey into units along a corridor from the stair:
  - Flats are 200–300 sq ft (19–28 m²). They are cut into cubicles and bed spaces as on the 1987 plan (p340): living room 9.65 m², two cubicles of 3.54 m², kitchen 2.0 m², toilet, two bed spaces.
  - Workshops are 480–600 sq ft (pp169, 292), on G/F to 3/F.
  - Shops get a mezzanine ("M/F" in the files; Suenn Ho's mezzanine plan, p139).
  - Units get names in the style of the files, for example "Flat B, 4/F".
- **Two real floors.**
  - Build 4/F of the Tai Hing Building, 6 Sai Shing Road, from the 1987 plan (p340).
  - Build the shared 5/F of 3 Cheung On Lane and 31B Tung Tau Tsuen Road, where three stairs share landings (p340).
- **Links between towers.**
  - Add corridors between towers on the upper floors (p131; Chan Cheung-chuen, M+ audio guide).
  - Add ladders where two roofs differ by one storey, and corridor windows with a stool under them (p145).
  - Make the roofs one walkable surface with steps.
- **Routes.** Replace the ground-only route with a 3D network: alley grid, stairs, corridors, links and roofs. Then people cross the roofs and use the links, as the postmen did. For speed, I will route between towers on a small graph and use the grid only in the alleys.
- **Moved to PR 5 (visual style).** The alley and ground-floor items below are visual. PR 3 builds the routes, links and roofs.
- **Alleys.**
  - Narrow some lanes to 0.9 m ("no more than three feet across", p249).
  - Let the upper floors overhang the alleys (p131).
  - Add plastic and metal sheets, pipe and cable bundles, and drips overhead (p249).
- **Ground floor.**
  - Add postbox walls in the main entrances (p188) and meter banks at the stairs (p101).
  - Move the one inside standpipe to Tai Chang Street (pp106–108; map no. 30), with the well near it (map no. 34). This changes `wires.js`.
- **Plan view.** The cut view will draw the walls, doors, stairs, corridors, links and unit names. A click on a unit shows its address.

## 3. Businesses (PR 4)

- **Book places at their addresses.**
  - Tai Chang Street: the barber at no. 10 (p28), the store at no. 12 (p93), Lam Tseng Yat's shop at no. 25 (p296), the fishball workshop in an alley off it (p292).
  - Sai Shing Road: the candy factory at no. 12 (p76) and the weaving workshop (p48).
  - Tung Tau Tsuen Road: Chung Fat Café at 19A (p57), the doctor's clinic on 2/F of no. 10 (p184), the Kai Fong office on 3/F of no. 16 (p180).
  - Lung Shing Road: the dentists, one at 4A (pp11, 34).
  - Lung Chun Road: the herbal store (p82) and the muslin maker (p311).
  - Kwong Ming Street: the noodle factory at the back of no. 2 (p170).
  - Lo Yan Street: a noodle factory (p226), roast meat (p286), and the Tin Hau Temple in an alley off it (p241).
  - Lung Chun Back Road: the rubber-plunger workshop (p237) and the Salvation Army kindergarten (p300).
  - The Yamen: the church and the Old People's Centre (p304).
- **Floors.** Heavy metal shops stay on G/F (p257). Most workshops are on G/F to 3/F (p139). Dentists and doctors stay on the outer roads, so that patients do not enter the City (p242).
- **Hours.** These are from about 1990; for 1986 they are APPROXIMATE.

| Place | Hours | Page |
|---|---|---|
| Herbal store, Lung Chun Road | 8am–11pm, "officially" | 82 |
| Store, 12 Tai Chang Street | 8am–midnight, busiest 5–9pm | 93 |
| Candy factory | 7am–6pm, wrapping to 9pm | 76 |
| Noodle factory, Lo Yan Street | from 8am, about nine hours | 228 |
| Chung Fat Café | 9am to "very late at night" | 57 |
| Barber, 10 Tai Chang Street | 9am until the customers stop | 28 |
| Doctor, 2/F, 10 Tung Tau Tsuen Road | 9–1 and 3.30–8, Mon–Sat; Sunday morning | 187 |
| Dentist (Cheng Koon Yiu) | 10am to 6 or 7pm; Saturday off | 245 |
| Roast meat, Lo Yan Street | from 4am; market 6.15–8am | 286–289 |
| Rubber plungers | also after dinner to 2 or 3am, in a rush | 237 |
| Kai Fong office | weekdays, office hours | 180 |
| Old People's Centre | afternoons Mon–Sat; worship on Sunday | 305 |

- **Open and shut.** Steel gates open and shut with the hours. Sign boxes light at dusk. Light from open shops falls into the alley.
- **Goods.** Flour sacks, pigs for the roast-meat shop (p289), frozen fish thawed at the standpipe (p108), noodles out by car and candy by van at the edge (pp78, 228), rice and kerosene carried up the stairs (p93), and LP gas cylinders (p179).

## 4. People and their week (PR 4)

- **Head count.** The 33,000 of the January 1987 count includes people who worked in the City but lived outside (p339). The same count gives 28,200 occupants in 8,800 apartments (p340). The model will have about 28,200 residents in 8,800 households. About 4,800 workers will come in each morning and leave at night.
- **Old people.** "About a third" of residents were over 60 in about 1990 (p178). The model has 10 % now. I will raise the share, mark it INFERRED, and keep it below a third for 1986.
- **New routines from the book:**
  - one postman, Lam Po Chun (John, 2026-10-31: "just one postman, no lookalike");
  - police: two officers on each of three beats a day, 8-hour shifts, some patrols on the roofs (pp251, 283);
  - refuse: collectors on Tai Chang Street at 4am (p93); 10 USD sweepers with orange buckets (p104);
  - water: people with containers at the standpipe all day (p108); the well pumps run at noon and midnight (p107);
  - meter readers with torches (p98);
  - the Old People's Centre: afternoon tea and TV, Monday to Saturday (pp305–306);
  - the kindergarten on Lung Chun Back Road (p300);
  - children wrap candy in the alley after school (p77);
  - families on the roofs in the early evening (p322); old people air their bedding in the Yamen court on sunny days (p299);
  - patients from outside visit the clinics on the outer roads in the day.
- **December.**
  - People wear jackets and cardigans ("Bundled up against the chill of a Hong Kong winter", p293).
  - Fishball makers make more as the weather cools (p292).
  - The Kai Fong's Christmas party for elderly residents (p180) has no recorded date, so I will not put it in the week.

## 5. Visual style (PR 5)

These come from about 110 colour patches measured in the photos. They are in order of visual effect.

1. **Window cages.** Make 40–60 % of each open face, from 2/F up, a dark cage void. Use dark-green, rust-orange or pale-blue grilles ("dark green or orange rust-preventing paint", p150).
2. **Colour strips.** Give each building its own colour from the measured palette. Do not align its floor bands with its neighbours' (p143). The walking grid does not change.
3. **Stains.** Add grime and rust streaks under each slab edge, window, cage and sign (pp14, 96–97).
4. **Roofs.** Add tilted aerials every 1–3 m, joined by wires, with corrugated sheds and laundry (pp314–327).
5. **Signs on Tung Tau Tsuen Road.** Hang more than 50 boards up to 5/F. Most are white or cream with black characters, and about one in ten is coloured. At dusk they light as boxes. There is no neon (pp8–9, 152, 284).
6. **Alleys.** Make them 10–35 % as bright as the outer faces, with pools of tube and bulb light. Daylight reaches only the gaps and Lo Yan Street (pp23, 103).
7. **December sun.** The sun is 44° high at noon. The north face never gets direct sun. The south and west faces get warm, low light (pp12–13).
8. **Night.** Fluorescent tubes are near-white (#f4f6f1), and windows at dusk are blue-white (#b4dcfa), not yellow. Some rooms have warm bulbs. Kowloon beyond is sodium amber (pp16–17, 316).
9. **Inside, in the cut view.** Whitewashed corridors, mosaic stairs, checker floors and red painted signs (pp30, 156, 164–165, 177).
10. **Game cards.** Use the style of the 1992 map (coloured pencil, spaced capitals, numbered discs) and Hawthorne's 1986 sketches (mauve wash, grille hatch, one yellow light). The pixel frame stays.

Most photos are from 1987–92. I will not copy clearance notices, empty flats or tour groups into 1986.

## 6. How people look (PR 6)

- **The crowd.**
  - Three body sizes: child, adult, and old with a stoop.
  - A top colour and a bottom colour.
  - December clothes from the photos: navy or black padded jackets for old people (p306), white blouse and navy skirt for schoolgirls (p322), singlets in the workshops, pale shirts and grey trousers.
- **Props.** Flour sacks, buckets, baskets, gas cylinders and mail bags.
- **Real people.** Each gets their own parts from the photos, for example:
  - Hui Tung Choy: a grey flat cap dusted with flour and a beige sweater (p171);
  - Chan Kwan Leung: a black polo, jeans and white trainers (p321);
  - Reverend Liu: a clerical collar and large glasses (p304);
  - Yu Hing Wan: a tan sweater and glasses (p311).
- **Markers.** In the game, real people are not gold. In the story, a small marker shows them.
- **Speed.** The crowd stays one instanced mesh with a "look" attribute. The real people get a small mesh of their own. I will measure the frame rate before and after; the target is no drop.

## 7. The mystery: "Find them" 尋人 (PR 7)

A FIND button opens three cases. The model runs as usual, and you can play a case at any hour of the week.

### The cases

1. **The postman, Lam Po Chun.**
   - Lam wears a navy hat against "the constant dripping" (pp148–149) and carries a brown canvas bag (p144). The case has one postman only, with no look-alike (John, 2026-10-31).
   - Lam "had a small moustache and was nicknamed by the locals 'hu xu zi' (beardie), or postman Ah-Po" (p146).
   - His day (the book gives no times; WSJ gives an 8-hour shift, so the times are INFERRED):
     - sort the mail at the Lung Kong Road Post Office, outside the City (p146);
     - start at a store on Lo Yan Street (p146);
     - work one north–south lane, then the side alleys (p146);
     - climb one stair, cross the roofs by ladders and windows, and go down another (pp145–146);
     - fill the postbox walls, and meet some residents at 4/F or 5/F (p146);
     - deliver outside the City for part of the day (p146).
2. **The pigeon breeder, Chan Kwan Leung.**
   - He moved in in 1981, left his job and bred racing pigeons on a roof that he rented for HK$1500 a month (pp318–320). He closed the business on registration day in January 1987, so it ran in December 1986.
   - He flew the birds "usually in mid-afternoon when there was a lull in the number of landings at Kai Tak" (p321). A flock will circle over his roof, and the Kai Tak landings will thin at that hour (INFERRED from the caption).
   - Place: map no. 1, at the north end of Lo Yan Street. The text gives no address, so the place is APPROXIMATE.
3. **The noodle maker, Hui Tung Choy.**
   - His factory is at the back of 2 Kwong Ming Street, from 1965. It is "barely 200 square feet", with no windows and a narrow door on to Kwong Ming Street (p170). His family's flat is above it.
   - He wears a grey flat cap dusted with flour (p171).
   - His daughters were young in 1992 (p172), so I leave them out of 1986.

### Hints

Each case has five hints. Each hint is stronger than the one before, and each one cites its page.

| Step | What it gives | Example for the postman |
|---|---|---|
| 1. Who | A recorded fact about the person | "Locals called him 'hu xu zi' (beardie)." (p146) |
| 2. How | The routine, and what the person does now in the model | "His round starts at a store on Lo Yan Street. Now he is on the roofs." |
| 3. Where | A part of the City, on a map in the 1992 style | "Between Kwong Ming Street and Lo Yan Street." |
| 4. Which | The building glows, and the floors show | "Above 6/F in this tower." |
| 5. Show | The storey opens, and a ring marks the person | — |

- If the person is outside the City, the hint says so and gives the time of return. You can move the clock.
- A click on the right person closes the case. A card shows the person's facts and words, the hints used and the time taken.
- A wrong click names the person, with no penalty.
- A notebook keeps the hints and the facts for each case.
- A test checks every 10 minutes of the week. Each hint must point at the right place, and each person must be visible in one view (whole, cut or exploded).

## 8. Story, sources and README (PR 8)

- Update the story with the book: the postman and the start on Lo Yan Street, the standpipe on Tai Chang Street, the Kai Fong office, pigeons in the mid-afternoon, and families on the roofs at dusk.
- Add the book to the sources panel, with the page for each item.
- Lam Po-chun's years differ: 1979–1991 (WSJ) and 1979–1989 (p145). Both include 1986, and the app will give both.
- Update the counts in the README.

## Order of work

| PR | Content | Size | Status |
|---|---|---|---|
| 1 | Evidence data, street names, addresses | small | merged (#11) |
| 2 | Towers, stairs, floor plans, plan view | large | merged (#12) |
| 3 | 3D route network, links, roofs | large | merged (#13) |
| — | Sound (decision 3) | small | merged (#14) |
| 4 | Businesses, people, routines | medium | merged (#15) |
| 5 | Visual style | medium | merged (#16) |
| 6 | How people look | medium | merged (#17) |
| 7 | The mystery game | medium | merged (#18) |
| 8 | Story, sources, README | small |  |

PR 5 does not depend on PRs 2–4, so it can go in parallel. The game needs PRs 3, 4 and 6.

## How I will check each step

- Screenshots of the same views before and after each PR.
- A photo sheet: model views next to the matching book photos. It stays in `local/` because of copyright.
- A colour check: the model's faces, alleys and roofs against the measured patches.
- Frame rate and load time before and after, on this Mac.
- Route tests: each unit can be reached, the postman crosses roofs, and nobody walks through a wall.
- The game test above, and a full play of each case.

## Risks

- The 1987 figure-ground is small in the book, so the overlay can be off. If the error is more than about 3 m, I will join plots by rule.
- 3D routes for 33,000 people can be slow. I will plan routes over several frames and keep a cache for each tower.
- Most photos are from 1987–92, and most show summer clothes. For December, I use the few winter photos and mark the rest INFERRED.
- The book disagrees with itself on the Chiu Chow share ("about a third", p44; "more than 70 per cent", p183) and on the month of the 1993 survey. I will give both values or not use them.

## Decisions for John

1. **Head count:** 28,200 residents and about 4,800 day workers, in place of 33,000 residents. **John: yes.** This goes into PR 4.
2. **Postman case:** Lam Po Chun. **John: one postman only, no look-alike.** This goes into PR 7.
3. **Sound:** the model has none. Chan Kwan Leung whistled before he fed the pigeons (p320), and the planes were loud. I recommend a small sound layer later, in a separate PR. **John: add it now; gentle, with occasional clear sounds.** It is a separate small PR.
4. **Fewer, larger towers:** about 300–350 towers in place of 474 plots. This changes the look of the model. I recommend it.
