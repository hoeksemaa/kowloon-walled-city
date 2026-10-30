# Greg Girard and Ian Lambot, *City of Darkness Revisited* (2014)

The 2014 new edition of *City of Darkness* (1993). Girard and Lambot photographed the Walled City in its last years. Their team interviewed residents and workers before the clearance. The 2014 edition adds new essays, new interviews and many reproduced historical documents.

- **Citation:** Greg Girard and Ian Lambot, *City of Darkness Revisited*. Watermark Publications, 2014. ISBN 978-1-873200-88-9. 356 pages and a fold-out.
- **Link:** https://search.worldcat.org/search?q=bn:9781873200889 (library record; the book is not online).
- **Credits in the book (p4):** original interviews arranged and conducted by Emmy Lung; new interviews by Eunice Chu; captions and commentary by Charles Goddard, Ian Lambot and Greg Girard. The photographs are by Girard and Lambot "unless otherwise indicated". The Credits page (p356) lists every other image by page.
- **Copy used:** John's own copy. He photographed each spread on 2026-10-30 (190 photos). I flattened and cropped each page and corrected the colour. The photos were then deleted, as John asked; he keeps them in his Photos library.
- **Copyright:** © Greg Girard and Ian Lambot. The other images belong to the owners on p356. The fold-out is © 2014 Hitomi Terasawa; the book says that it "must not be copied or reproduced in any form".
- **Stored in git:** no. All images are in `local/`, which git ignores. Only this file is in git.
- **Checksums:** none. The files are not a download from a host. They are derived files, and they will change when pages 84–85 are added.

## Files in `local/`

| Folder | Contents |
|---|---|
| `final/pages/` | 371 images, one for each surface, in book order: `NNN_label.png`. The label is the printed page number (`p001`–`p356`) or a part name (jacket, cover, endpapers, fold-out panels). |
| `final/spreads/` | 180 images of two facing pages, plus `215_foldout-full.png` (the full fold-out, 8125 × 1746 px). |
| `final/index.json` | Position, label and source photo of each page. `final/README.md` tells how the images were made and gives their limits. |
| `extracts/` | 60 cut-outs of the reproduced documents, old photos, maps and plans, and the 1992 map. `extracts/index.json` gives the pages, the caption and the credit of each. The photos by Girard and Lambot are not cut out: the page images hold them. |
| `pipeline/` | The code and the hand marks. Its `README.md` tells how to add pages 84–85 from a new photo. |
| `draft-v1/`, `sample/` | Old test outputs. You can delete them. |

To find a printed page N in `final/pages/`: for N ≤ 83 the file is `NNN = N + 7`; for 86 ≤ N ≤ 209 it is `N + 5`; for 210 ≤ N ≤ 356 it is `N + 11`. A copy for reading is on John's Desktop (`City of Darkness Revisited/`).

## Gaps

- Pages 84–85 are missing: two leaves were turned together. Chan Pui Yin's interview (p82) continues on them. John will photograph them.
- Near the spine, a strip of some left pages is hidden in the binding. The images do not invent the hidden part.

## Which parts are primary

Use the usual meaning that historians give the term (see `../README.md`). This book mixes material from six decades. Judge each part by when it was made and by whom, not by the book's date.

### Primary: made at the time

1. **Photographs by Girard and Lambot.** They worked in the City for about five years before the clearance; Lambot writes "when Greg and I first visited the City in the early 1980s" (pp270–283). Most images in the book are theirs (list on p356). The book does not give a date for each photo. Some captions give a year (for example, the south elevation "photographed in 1989", p39). Treat an undated photo as about 1987–1992.
2. **The original interviews (Emmy Lung, about 1989–1992).** 32 residents and workers speak in the first person: shopkeepers, factory owners, dentists, doctors, a postman, a policeman, a China Light and Power engineer, Kai Fong officers. Almost all were made after the clearance was announced (14 January 1987), while the City still stood. Thus the people often talk about compensation. Two are dated in the book: Hui Kwong "in 1991" (p40) and Kwok Lau Hing "in 1989" (p308). The others are dated from their own words (for example, "When I first arrived 62 years ago", arrival 1928, p23). These are not "retrospective": they were spoken at the time.
3. **Reproduced documents and old photos** (each primary for its own date). See the table below and `local/extracts/`.
4. **Cathie Breslin, "The World's Wickedest City" (pp264–269).** A magazine article from *The Star Weekly* (Toronto), November 1963, about her own visit on "last Good Friday" (probably 1963). The 2014 introduction is not primary.
5. **Fiona Hawthorne's sketches (p210),** made during "her three-month exploration of the Walled City in 1986, well before the clearance had been announced". These are the closest items in the book to December 1986.
6. **Suenn Ho's drawings (pp137–139, p340),** from her field study of 1991–1992 (see `../mplus-suenn-ho-ca17/`). The p340 sheets are the Government's handwritten sketch-survey plans of the clearance, measured in November 1987.
7. **The Map (pp352–353, caption on p353),** drawn by Anna Dalgliesh for the 1993 book in 1992. It shows the layout "in the late 1980s, at about the time that the City's clearance was announced", with the place of 40 people and places from the book. The book says that it "cannot be considered entirely accurate".
8. **The survey of the empty City (pp208–209).** Takayuki Suzuki and 10 students surveyed one slice of the City in January 1993, after the residents had left. The pages reproduce their photos, sketches and plans from *Large-scale Illustrated Kowloon City* (Iwanami Shoten, 1997). Primary for rooms and stairs, not for life in the City. The book gives both "January 1993" (p209) and "February 1993" (p204).

### Retrospective: first-hand, but told later

Tag these "retrospective (2014)".

- **Lam Po Chun, postman (pp144–149).** A new interview for the 2014 edition ("while researching this new edition", p145). He tells of his years as a postman in the City, 1979–1989. The photos of postman Lui on these pages are from the original project.
- **Wong Wai Chung, former heroin addict (pp258–261).** Probably a new 2014 interview: he looks back on the 1970s, and he is not in the 1992 map key. The book does not say.
- **The authors' own memories** inside the 2014 essays: Ian Lambot (pp270–283), Peter Popham (pp6–19, who visited "not long before its demolition"), Jon Resnick (pp192–217, who visited in 1983).

### Secondary: do not use as a source of facts

- **The 2014 essays:** Peter Popham, "Kowloon Walled City – the Reality" (p6); Julia Wilkinson, "A Chinese Magistrate's Fort" (p62, history to 1940); James Saywell, "The Architecture of a Mini City" (p116; he "was too young to visit the Walled City"); Jon Resnick, "Popular Culture and the Walled City" (p192); Lui Tai Lok, "A Triply Neglected City" (p220); Ian Lambot, "Myth and Reality" (p270); Fionnuala McHugh, "The Walled City Clearances" (p328). McHugh and Lambot quote Government files (CO, FCO, police reports) at length. Use their quotes as leads to the files, not as the files.
- **Captions and standfirsts** (Goddard, Lambot, Girard). They were written in 1993 or 2014. Some tell what happened later ("moved out in 1990", "where it remains to this day", Kai Tak closed "in 1998").
- **The short features with no speaker** (Fuk Tak Shrine, Refuse Collection, The Water Supply, Life in the Alleys, Life on the Roof, Tin Hau Temple). Their text is commentary; their photos are primary.
- **The fold-out,** Hitomi Terasawa, "Grand Panorama of the Kowloon Walled City" (© 2014). An artist's cross-section based on the 1993 survey of the empty City. The book says that it "is far from accurate", "but it captures the full majesty of life in the City".
- **Popular culture (pp192–217):** film stills, games, manga, art and models from 1984–2014.
- **Later studies and modern views:** Urbanus (p136), University of Waterloo (pp121, 140), Adolfo Arranz's *SCMP* drawing of March 2013 (p141), Shibam and Rio (p135), the park today (pp348–351).
- **The jacket, the flaps and the acknowledgements.**

## Contents

Type: E = essay, I = interview, F = feature (photos with captions or commentary). "When" is when the words were made.

| Page | Section | Type | When | Primary? |
|---|---|---|---|---|
| 6 | Peter Popham, "Kowloon Walled City – the Reality" | E | 2014 (quotes his 1993 introduction) | no |
| 23 | Yau Lap Cheong, retired storekeeper | I | about 1990 | yes |
| 28 | Ho Chi Kam, hairdresser | I | about 1990 | yes |
| 32 | Fuk Tak Shrine | F | after the clearance | photos |
| 34 | Wong Yu Ming, dentist | I | about 1988–1990 | yes |
| 40 | Hui Kwong, Chiu Chow Music Club | I | 1991 (printed) | yes |
| 44 | Jetly Chau Sau Yee, Chiu Chow cake maker | I | 1987–1992 | yes |
| 48 | Lau Yeung Yin, weaving factory | I | about 1990–1991 | yes |
| 54 | Mrs Law, grandmother | F | unclear | photos |
| 56 | Ng Kam Mui, Chung Fat café | I | about 1990–1991 | yes |
| 62 | Julia Wilkinson, "A Chinese Magistrate's Fort" | E | unclear (captions 2014) | no; the maps and photos of 1845–1924 are |
| 76 | Lee Yu Chun, candy factory | I | 1987–1992 | yes |
| 80 | Law Yu Yi, retired maid | F | unclear | photos |
| 82 | Chan Pui Yin, herbal doctor and pharmacist | I | probably original (pp84–85 missing) | yes |
| 88 | Chan Kwong, golf-ball maker | I | about 1989–1990 | yes |
| 92 | Lee Pui Yuen, shopkeeper | I | about 1991 | yes |
| 98 | The Electricity Supply: Mok Chung Yuk, China Light and Power engineer | I | 1987–1992 | yes |
| 104 | Refuse Collection | F | unclear | photos |
| 106 | The Water Supply | F | unclear | photos |
| 112 | Chu Yiu Shan, private water supplier | I | 1987–1992 | yes |
| 116 | James Saywell, "The Architecture of a Mini City" | E | 2014 | no; the photos, documents and plans of 1949–1992 are |
| 144 | Lam Po Chun, postman | I | 2014 | retrospective |
| 153 | Lam Shu Chuen, Kai Fong officer | I | 1987–1992 (standfirst 2014) | yes |
| 156 | Chung Lo Ying, resident | I | about 1990 | yes |
| 159 | Chung Yuk Yee, resident | I | about 1990–1991 | yes |
| 168 | Cheng San, wooden ruler maker | I | about 1990 | yes |
| 170 | Hui Tung Choy, noodle maker | I | about 1992 | yes |
| 178 | Chan Hip Ping, Kai Fong vice-president | I | 1987–1992 | yes |
| 184 | Tsin Mu Lam, doctor | I | 1987–1992 | yes |
| 192 | Jon Resnick, "Popular Culture and the Walled City" | E | 2014 | no (pp208–210 hold primary items) |
| fold-out | Hitomi Terasawa, "Grand Panorama of the Kowloon Walled City" | drawing | after 1993, © 2014 | no |
| 220 | Lui Tai Lok, "A Triply Neglected City" | E | 2014 | no |
| 226 | Chan Wai Shui, noodle maker | I | 1987–1992 | yes |
| 232 | Wong Hoi Ming, herbal doctor | I | 1987–1992 | yes |
| 237 | To Gui Bon, rubber factory owner | I | 1987–1992 | yes |
| 240 | Tin Hau Temple | F | captions later | photos |
| 242 | Cheng Koon Yiu, dentist | I | about 1989 | yes |
| 246 | Life in the Alleys | F | captions 2014 | photos |
| 250 | A Policeman's Story | I | about 1990 | yes |
| 258 | Wong Wai Chung, former heroin addict | I | probably 2014 | retrospective |
| 262 | Jackie Pullinger, St Stephen's Society | F | 2014 | photos |
| 264 | Cathie Breslin, "The World's Wickedest City" | article | November 1963 (introduction 2014) | yes (1963) |
| 270 | Ian Lambot, "Myth and Reality" | E | 2014 | no; the 1955 police memo and old photos are |
| 286 | Yim Kwok Yuen, cooked meat factory | I | 1987–1992 | yes |
| 292 | Lam Leung Po, fishball factory | I | about 1991–1992 | yes |
| 296 | Lam Tseng Yat, shopkeeper | I | about 1987–1990 | yes |
| 300 | Simon Wong, Salvation Army kindergarten | I | 1987–1992 | yes |
| 304 | Reverend Isaac Liu, missionary | I | about 1991 | yes |
| 308 | Kwok Lau Hing, retired office cleaner | I | 1989 (printed) | yes |
| 310 | Yu Hing Wan, muslin maker | F | captions later | photos |
| 318 | Chan Kwan Leung, pigeon breeder | I | 1987–1992 | yes |
| 322 | Life on the Roof | F | captions later | photos |
| 328 | Fionnuala McHugh, "The Walled City Clearances" | E | 2014 | no; the documents and news photos of 1898–1994 are |
| 352 | The Map | map | 1992 | yes (with care) |
| 355 | Acknowledgements; 356 Credits | | 2014 | no |

## Reproduced documents and old photos

All are cut out in `local/extracts/` (file names start with the page). The credit is from p356.

| Page | Item | Date | Credit |
|---|---|---|---|
| 62 | Plan of the Walled City as proposed by the Viceroy of Canton (a modern drawing) | 1847 | Internet |
| 63 | View from Lung Chun Pier | 1898 | National Archives, UK |
| 64 | Survey map of Hong Kong, with the stone fort | 1845 | National Archives, UK |
| 66–67 | The City from the hill behind the fort | 1865 | Arthur Hacker |
| 68, 70 | Paper-burning pavilion; cannon by the yamen (early 1920s); alley off Kau Lung Gai (about 1910) | 1910s–1920s | HK Museum of History |
| 68–69 | Kowloon City from Lung Chun Pier | undated | National Archives, UK |
| 71 | Draft map of the Walled City and Kowloon City | 1923 | Survey and Mapping Office |
| 72–73 | Paddy fields and the Walled City | 1924 | Public Records Office, HK |
| 116 | Handwritten sale contract for two buildings, $2200 | 14 Dec 1960 | KWC Residents' Association |
| 116–133 | Street views and aerials | 1949–1976 | Mak Fung, Ko Tim Keung, GIS, Survey and Mapping Office |
| 126–127 | Survey and Mapping Office map of the City, with lots, factories and schools | 1968 | Survey and Mapping Office |
| 130 | *Hong Kong Standard*, "Walled City gets a face-lift / Big building boom is on" | 11 Jan 1963 | Public Records Office, HK |
| 134 | Plans of the building footprints | 1962, 1987 | William McElhinney |
| 137–139 | Suenn Ho's drawings: one building level by level, an alley, staircases and corridors, factories on each level | 1992 | Suenn Ho |
| 208–209 | Suzuki survey of the empty City: photos, sketches, plans | Jan 1993 | Iwanami Shoten |
| 210 | Fiona Hawthorne's sketches | 1986 | Fiona Hawthorne |
| 266–267 | *The Star Weekly*, "The world's wickedest city" | Nov 1963 | Public Records Office, HK |
| 272 | Opium smokers in Hong Kong | early 1950s | Getty Images/Hulton Archive |
| 274–275 | Memorandum of the Commissioner of Police for the Governor, sent to London | 4 Mar 1955 | Public Records Office, HK |
| 277 | Triad ceremony | undated | HK Police Museum |
| 278–279 | Tung Tau Tsuen Road; Sai Tau Tsuen squatter area | 1963, 1978 | Ko Tim Keung |
| 280–281 | Police surveillance photos | undated | Nicholas Millman |
| 328–329 | Roofs of old Kowloon City; the Walled City | 1898, 1933 | National Archives, UK; Public Records Office, HK |
| 330 | *China Mail* front page, "Kowloon Hut City Incident" | 13 Jan 1948 | probably Public Records Office, HK (the p356 line is cut at the binding) |
| 332–333 | Kai Fong committee dinner; view to Kai Tak | 1964, 1962 | Frankie Lam; Ko Tim Keung |
| 334 | *Hong Kong Standard*, "Walled City: 'cause for disquiet'" | 19 Jan 1963 | probably Public Records Office, HK (the p356 line is cut at the binding) |
| 335–336 | Aerial view; a 14-storey building on Tung Tau Tsuen Road | 1973, 1975 | GIS |
| 337–339, 346–347 | News photos of the clearance and the demolition; the cleared site | 1987–1994 | *Sing Pao Daily News* |
| 340 | Handwritten clearance sketch-survey plans of 6 Sai Shing Road, 4/F (BLD/SDU/COMP/SS 642(A); "SS" is handwritten and can also be "55") | 9 Nov 1987 | Suenn Ho |
| 352–353 | The Map | 1992 | Anna Dalgliesh |

## Key facts

On 2026-10-30, a second agent checked each fact below against a full-resolution crop of the page. The words in quotes are exact. Page numbers are the printed numbers.

### Records made at the time (primary)

**Police memorandum of 4 March 1955 (pp274–275).** The Commissioner of Police wrote it for the Governor, who sent it to London.

| Page | Fact | Words in the book |
|---|---|---|
| 274 | Population | about 2,000 "after the reoccupation of the Colony and up to 1949/50"; "the present population is estimated at approximately 13,000, with a floating population of about 5,000" |
| 274 | Buildings, November 1954 | "a police reconnaissance of buildings in the area showed 648 stone buildings and 152 wooden huts" |
| 274 | Uses, November 1954 | 120 narcotic divans, 20 brothels, 5 gambling houses, 18 eating houses, 9 weaving factories, 9 dentists, 94 shops "dealing in miscellaneous goods", 4 schools (3 right wing, 1 left wing) |
| 275 | Uses, late 1952 | 154 drug divans, 7 gambling dens, 13 dog meat shops, 11 brothels, 1 theatre for 300 people |
| 275 | Fire | "On 24.2.53. a large fire occurred in the Walled City, destroying some 390 buildings." |
| 275 | Theatres | by 17.3.53, eight new theatres on the old fire site, and four shops made into theatres "for strip-tease acts, making a total of 16" |

The memo's typewriter "3" looks like a "5" at low zoom. The checker compared each of these digits with the other glyphs on the page.

**Clearance plan (p340).** The plan gives "Measurement Date: 9 NOV 1987" and the address "NO. 6, SAI SHING RD., 4/F, TAI HING BLDG." The references are "BLD Ref.: BLD/SDU/COMP/SS 642(A)" and "H.D. Structure Ref.: A 19/57 (1-4)". The part "SS 642(A)" is handwritten, and "SS" can also be "55".

**Cathie Breslin (p264).** Her article was "published in the Toronto-based magazine The Star Weekly in November 1963". Her visit started "at 2.50pm last Good Friday".

**Fiona Hawthorne (p210).** The caption tells of "the dozens of sketches that Fiona Hawthorne completed during her three-month exploration of the Walled City in 1986".

### The original interviews (primary, about 1989–1992)

In these interviews, "now" means the time of the interview, not 2014.

| Page | Person | Facts |
|---|---|---|
| 11 | Lam Mei Kwong, dentist (caption) | clinic at 4A Lung Shing Road; in the City since 1949 |
| 23–24 | Yau Lap Cheong | arrived in 1928, at age 20, from Chiu Yeung; "When I first arrived 62 years ago" (thus about 1990); "We took over a store for $13,000"; a fifth-floor flat "pays me $1000 in rent each month"; moved out in 1990 |
| 28–29 | Ho Chi Kam | moved in "at the beginning of 1974"; barber's shop at 10 Tai Chang Street from 1985; the shop closed in 1991 |
| 35 | Wong Yu Ming | born in 1930; came to Hong Kong in the late 1950s; dental clinic on Lung Shing Road a few months later |
| 40 | Hui Kwong | 75 "at the time of the interview (in 1991)"; in the City since 1961; Chiu Chow Music Club |
| 44 | Jetly Chau Sau Yee | "The water here costs $100 a month"; the Kai Fong Association charged "a handling fee of $200" for a purchase agreement |
| 48–50 | Lau Yeung Yin | family weaving business on Sai Shing (West City) Road from 1982; "I'll be paid about $103,000 in compensation" |
| 57 | Ng Kam Mui | Chung Fat café on Tung Tau Tsuen Road "for nearly 30 years", closed in 1991 |
| 76–78 | Lee Yu Chun | in the City from 1967; bought the place for $40,000; last site at 12 Sai Shing (West City) Road from the early 1970s; "our price is $5" (p78) |
| 88 | Chan Kwong | golf-ball factory from 1970, on Tai Chang Street from 1972; "12 dozen in a bucket and we sell at $30 per bucket"; "$300,000 compensation for my site and $30,000 for relocation" |
| 93 | Lee Pui Yuen | store at 12 Tai Chang Street from 1979; "This place costs $3000 a month to rent nowadays"; "turnover of $4000 to $5000 every day"; moved out in 1991 |
| 98–99 | Mok Chung Yuk, China Light and Power engineer | supply "in a major way in 1977" (p98); "before we drew up our master plan about 20 per cent of households already had some sort of supply" (p99); "The years 1977 to '85 were years of drastic transformation" (p99) |
| 157 | Chung Lo Ying | moved in in 1958; flat on the fourth floor of 82 Lung Chun Road; "A unit like the one we are now in cost around $120,000"; the units in the middle "were only worth $80,000" |
| 169 | Cheng San | wooden rulers on Tai Chang Street, 1968–1990; "about 600 square feet" |
| 172–173 | Hui Tung Choy | noodle factory at the back of 2 Kwong Ming Street from 1965; "around 1000 discs a day" at the 1980 peak; now "around 300 individual 'discs'" for each worker; rent "a little over $100 a month" at first, "now it's about $1300" |
| 178 | Kai Fong Association | "established on 1 May 1963"; "We are now responsible for more than 200 lights which are switched on 24 hours a day" |
| 184–187 | Tsin Mu Lam, doctor | clinic on the second floor of 10 Tung Tau Tsuen Road from 1973 until 1992 (third phase of the clearance); "there were more than 80 of us – both doctors and dentists – and 60 clinics!" (p187) |
| 251 | A policeman | "I was posted to the City in 1985, and have patrolled there now for five years"; in 1985, "just six of us" for the Walled City area |
| 292 | Lam Leung Po | partner in the minced-fish factory from 1983; "about 300 catties of minced fish a day"; "around 480 square feet" |
| 305 | Reverend Isaac Liu | the school closed in 1978; the Old People's Centre started in 1979; "Now we have 184 members." |
| 308 | Kwok Lau Hing | "At the time of the interview (in 1989), she was 73 years old." |
| 320 | Chan Kwan Leung (name on p318) | "The roof costs $1500 a month to rent" |

**Retrospective.** Lam Po Chun (p145): "From 1979 to 1989 – that is, from my 19th to 29th year – I was a postman in the Walled City." The book says "while researching this new edition"; it does not print "2014".

### Captions and essays (secondary: use as leads)

The writers used records that the book does not show. Find the record before you use one of these numbers as a fact.

| Page | Where | Fact |
|---|---|---|
| 36 | caption | "more than 150 illegal dentists were thought to be practising in the City", but "the figure had dropped to 86 by 1987" |
| 104 | caption | "the two tons of rubbish that accumulated each day"; "the 10 sweepers who patrolled the City"; Urban Services Department (USD) refuse collectors |
| 107 | The Water Supply | "By 1987, just eight stand-pipes were in place to supply up to 35,000 residents and hundreds of factories"; "Only one of these was located within the City"; "The first stand-pipe was installed in 1963"; in 1987, Government surveyors "identified 67 working wells owned by some 40 suppliers" |
| 129 | Saywell | 1954: "about 800 in total, 648 of stone and 152 wood 'huts', according to a Government survey"; 1949: "some 2000 residents"; "The 1950s added 8000 people, the 1960s some 17,000 more"; 1980, at the peak: "an estimated total of 40,000" |
| 134 | caption | "well over 650 individual buildings" in 1962; "around 300" by 1987 |
| 249 | caption | "35,000 or so residents and factory workers"; "some 900 factories, restaurants and shops"; "around 30 main streets and alleys"; "one of the eight Government stand-pipes" |
| 334 | caption (for the 1973 aerial view on p335) | buildings "rising to the maximum height of 12, 13 and 14 storeys"; population "from around 10,000 in 1960 to well over 30,000 in 1973" |
| 336 | caption | "a 14-storey building appeared on Tung Tau Tsuen Road in 1975", over the height limit near the flight path into Kai Tak Airport |
| 339 | McHugh | Wednesday 14 January 1987: 360 staff of the Housing Department's Clearance and Squatter Control sections and "nearly an equal number of policemen"; "83 entrances were cordoned off"; "60 teams of six"; first day: "19,606 people from 5116 families", "22 families had refused"; after the second day, "just over 33,000", with the people who worked in the City but lived elsewhere |
| 340 | McHugh | "28,200 occupants residing in 8800 separate apartments"; "some 300 individual buildings, each rising up to a possible 15 storeys" |
| 346 | McHugh | "At 6am on 1 July 1992, 200 police"; "158 vacant flats were repossessed"; the clearance "from 14 January 1987 until 2 July 1992" took "1997 days" |
| 347 | caption | "the whole demolition taking over a year from January 1993 to March 1994" |
| 353 | Map caption | "Drawn specially for the original edition of City of Darkness in 1992"; the layout "in the late 1980s"; it "cannot be considered entirely accurate" |

### Agreements and conflicts

- **Buildings in 1954.** Saywell's count (p129) agrees with the police count of November 1954 (p274): 648 stone buildings and 152 huts.
- **Population in the 1950s.** The 1955 memo gives about 13,000, plus a floating population of 5,000 (p274). The captions give around 10,000 in 1960 (p334). Saywell gives 2000 + 8000 by 1960 (p129).
- **Population in 1987.** The registration of 14–15 January 1987 gives the best figure: just over 33,000, with the day workers (p339). The book also gives "35,000 or so" (p249) and "up to 35,000" (p107). Saywell's 1980 peak of 40,000 is an estimate (p129).
- **Buildings in 1987.** Two places give about 300 (p134, p340).
- **Dentists.** The police count gives 9 in November 1954 (p274). A caption gives "more than 150" at the peak and 86 by 1987 (p36).
- **The survey of the empty City.** p204 says "February 1993", but the p209 caption says "January 1993". If you use this date, give both months.
