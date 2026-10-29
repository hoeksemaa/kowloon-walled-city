# Former residents and officials remember the city (retrospective, 2009–2024)

Thirteen free web pages. In each, a person who lived or worked in the city,
or went into it, tells what they saw. All are retrospective: the person speaks
years after the demolition. One item (Posner) quotes a book of 1988.

- **Link:** https://www.hk01.com/社區專題/1033066/
- **Retrieved:** 2026-10-29. The first five files are the HTML as served, from
  a script request. The other eight pages I read in a browser on the same day.
  I did not save them (see "Files to save").
- **Copyright:** each page belongs to its publisher or writer (HK01, Talk
  Irvine and its poster, Gwulo and Brian Coak, M+, SCMP, The Funambulist and
  Sharon Lam, Gerald Posner).
- **Stored in git:** no. The files are in `local/`, which git ignores.

## Why this is primary

Each item is first-hand testimony by a person who was there. Historians count
oral history as a primary source. Tag each item "retrospective": memory can
change over 20 to 50 years.

## Files in `local/`

| File | Who | Recorded | SHA-256 |
|---|---|---|---|
| `hk01-2024-07-20-1033066.html` | 林羅平 "平哥", fishball maker. Reporter 吳美松 | retrospective (2024) | `2e201921fe1f29fcabdace3905f39ac3c1d89a880e62cd4221185ac7ce7059f7` |
| `hk01-2016-08-28-39889.html` | "阿榮" (a pseudonym), born in the city, left at 20. Reporter 麥佩雯 | retrospective (2016) | `17951965128fcb5a04c156e8d596e3c53126d53be7a5f8f6e42ecf1a7496d586` |
| `talkirvine-2009-08-28-a-glimpse-of-my-life-experience.html` | forum user "bkshopr_IHB", who lived there as a child with his father | retrospective (2009) | `101b45c488c236fc9bd480a7ac8c8d6db5732d55d918dfd48e6fa0b6b52cf57d` |
| `gwulo-node-19851-coak.html` | Brian Coak, Housing Department squatter control officer | retrospective (posted 2014) | `31853accee12251c2aa4e5d627bf9335b9b5998f85cdd4da74a02a3eeb12a6c9` |
| `mplus-audio-guide-8038-english.html` | Chan Cheung Chuen, resident, in an M+ audio guide | retrospective (after 2021) | `908bf589885df60eb6bb2844a3c3067b3fe881b65862125213e72288cc682963` |

Links: https://www.hk01.com/社區專題/39889/,
https://www.talkirvine.com/threads/a-glimpse-of-my-life-experience.10174/,
https://gwulo.com/node/19851, https://www.mplus.org.hk/tc/audio-guide/8038-english/

## Files to save

`curl` was not permitted in the session of 2026-10-29. Thus these eight pages
are not yet in `local/`. Run these commands from this folder, then move each
row into the table above with its SHA-256. The `id_` form of a Wayback URL
gives the archived bytes without the Wayback toolbar.

```
W='https://web.archive.org/web'
curl -sL -A 'Mozilla/5.0' -o local/hk01-2024-07-20-1033063.html 'https://www.hk01.com/article/1033063'
curl -sL -A 'Mozilla/5.0' -o local/hk01-2024-05-08-1017698.html 'https://www.hk01.com/article/1017698'
curl -sL -A 'Mozilla/5.0' -o local/hk01-2016-11-10-53204.html 'https://www.hk01.com/article/53204'
curl -sL -A 'Mozilla/5.0' -o local/hk01-2022-01-31-730608.html 'https://www.hk01.com/article/730608'
curl -sL -A 'Mozilla/5.0' -o local/scmp-2018-03-23-2138495-wayback.html "$W/20191223043753id_/https://www.scmp.com/news/hong-kong/community/article/2138495/rats-were-something-else-25-years-hong-kongs-kowloon-walled"
curl -sL -A 'Mozilla/5.0' -o local/scmp-2013-01-04-1119265-wayback.html "$W/20200803125015id_/https://www.scmp.com/news/hong-kong/article/1119265/kowloon-city-den-evil-lush-gardens"
curl -sL -A 'Mozilla/5.0' -o local/funambulist-2018-03-09-lam-wayback.html "$W/20241213100020id_/https://thefunambulist.net/magazine/16-proletarian-fortresses/interview-far-from-the-western-fetish-the-kowloon-walled-city-between-extraordinary-space-and-normal-lives-by-sharon-lam-and-her-dad"
curl -sL -A 'Mozilla/5.0' -o local/posner-2016-05-26-police-escort.html 'https://www.posner.com/geraldposner/2016/05/tbt-reminder-of-my-1987-police-escort.html'
shasum -a 256 local/*
```

| File | Who | Recorded | SHA-256 |
|---|---|---|---|
| `hk01-2024-07-20-1033063.html` | Jackie Pullinger 潘靈卓, missionary, in the city from 1966; with Winson and 阿賢. Reporter 吳美松 | retrospective (2024) | not saved yet |
| `hk01-2024-05-08-1017698.html` | Greg Girard and Ian Lambot, photographers, 1987–1992. Interview of 5 Nov 2019, published by 蘇煒然 | retrospective (2019) | not saved yet |
| `hk01-2016-11-10-53204.html` | 林財銳, tailor, 沙龍洋服 on 城南道, across the road from the city, from 1964. Reporter 陳銘智 | retrospective (2016) | not saved yet |
| `hk01-2022-01-31-730608.html` | the same tailor, 84, on his last day. Reporter 曾鳳婷 | retrospective (2022) | not saved yet |
| `scmp-2018-03-23-2138495-wayback.html` | Lau Chun-fat; Vivian Chan; Eric Lockeyear and another police officer. By Peace Chiu, Mary Ann Benitez, Cannix Yau | retrospective (2018) | not saved yet |
| `scmp-2013-01-04-1119265-wayback.html` | Albert Ng Kam-po; Yip Tak-wai. By Jennifer Cheng | retrospective (2013) | not saved yet |
| `funambulist-2018-03-09-lam-wayback.html` | Sharon Lam's father, a schoolboy who went in; translated from Cantonese by Felicia Yong | retrospective (2018) | not saved yet |
| `posner-2016-05-26-police-escort.html` | Gerald Posner, writer, visit with a police escort in 1987. Quotes his book *Warlords of Crime* (1988) | 1988 book, posted 2016 | not saved yet |

## Key facts

**林羅平, fishball workshop (HK01, 2024).**
- From Primary 3, he scraped fish by hand after school in his brother's
  ground-floor workshop. The fishballs went to markets and restaurants in
  other districts.
- In 1983, at 24, he opened his own wholesale shop with HK$6,000. The rent was
  low because the landlord came from his home town.
- Power and water: "城寨內有兩戶業主，一人專門供電，另一人專門供水". His shop
  was near the outer street, so he had a power-company meter. The water
  operator tapped government mains and the Water Supplies Department cut the
  illegal pipes.
- Water by floor: "二、三樓可能於早上6、7點來水，然後8、9時就輪到三、四樓".
- Water fees: "住宅用戶每月繳交100元，開工場則每個月支付300元水費".
- Police: they patrolled the outside and signed a patrol book at his shop, but
  did not go deep inside. Teochew (潮州) people were "並非少數".

**"阿榮", childhood in 西頭村第一街 (HK01, 2016).**
- Housing: no title deeds. A purchase was cash and a stamp on paper at the
  kaifong association. Buildings had no piles, only brick "逐層向上蓋".
- Flood: "水位比當時的身高還高，阿爸就冒雨背我們離家到城寨外。"
- Power: "一條電線十多戶共用，晚晚失火".
- Water: drilled "科學井" gave water for only a few hours each afternoon.
  "常常只有低層住戶才裝到水，高層的可能要去地面打水擔上樓。"
- Drugs: heroin sold from a bed board in the back lane, "細雞" HK$3 and
  "大雞" HK$5. A police sergeant and three constables collected money from the
  stalls on a schedule. He says it got much better after the ICAC (1974).
- Schools: two small unlicensed primary schools inside. His parents sent him
  to a school outside.

**bkshopr_IHB, childhood with his father (2009).**
- "Our house (room) was 10'x10' with a folding table where I did my homework".
- "20 families shared one toilet and a communal kitchen. We had a chamber pot
  where we had to empty out twice a day. We lived on the 8th floor with no elevator."
- "4 foot deep Metal cages from floor to ceiling were bolted to the exterior
  like balconies for renting to old men without a family."
- "Kids played at the roof decks without safety rail or walls. Several kids I
  knew fell to the death 10 stories below."

**Brian Coak, squatter control (Gwulo, 2014).** Most of his page is a history
summary (secondary). The first-hand parts:
- 1970: a tour with the Assistant District Officer "inside that squalid,
  fetid, smelly water pipe dripping Walled City".
- 1974: his squatter control men took down an illegal extension of a building
  "brick by brick". He says a photo on the page shows that building, "a white
  building just off centre much shorter sandwiched between taller ones".

**Chan Cheung Chuen (M+ audio guide).**
- He moved into the city after he married. His work was mechanical drawing,
  and before the demolition he drew a map of "the intertwined streets, and the
  upper-level walkways connecting different buildings". Ask M+ whether this map
  survives.
- Neighbours swapped soy sauce through windows, and raised the alarm for fires.
- The WSJ project of 2014 gives his years (1985–1991), two addresses on Tung
  Tau Tsuen Road, and his rent. See `wsj-kwc-2014/`.

**Lau Chun-fat, toy-factory worker (SCMP, 23 Mar 2018).** 83 in 2018, thus
born about 1935. He came from Fujian in 1974. His boss at a toy factory told
him about cheap homes in the city.
- He bought a flat "in the late 1980s for around HK$40,000".
- Water: "We had to go to a nearby public tap to draw buckets of water for
  drinking and cooking". Well water was for washing clothes and flushing
  toilets (the reporter's words).
- Safety: "Those hooligans didn't dare come in because it was not their
  neighbourhood". He felt "even safer" there.
- "Everyone stayed there for so long and no building collapsed … I didn't see
  any fires either."
- Neighbours: "The kaifong were very close". The store downstairs offered to
  carry his soy sauce up. He said: "I am still young and have my arms and
  legs, so I don't need the help."
- He got about HK$120,000 in compensation and bought a flat nearby.

**Vivian Chan, a child in the city (SCMP, 2018).** A family doctor in the USA,
"in her 40s" in 2018. She spent "more than 10 years" there as a child and a
teenager, in "a 600 sq ft flat on the 10th floor".
- "I often came across junkies who slept under the stairs and would do
  anything just to get money to buy drugs."
- "when I was still a primary school kid, a young junkie held me at knife
  point asking for money". She burst into tears and he ran.
- "My neighbours would tell me a lot of their stories and anecdotes, about who
  was being beaten up, who was taking drugs and who was being sexually
  assaulted or raped."
- "Do I miss this place? I don't think so because it was really unhygienic,
  dirty and seedy. But I do admit that it had a unique culture that you won't
  find outside."

**Two police officers (SCMP, 2018).**
- Eric Lockeyear, in the police 1963–1996, first a beat officer in Kowloon
  City: "regular uniformed patrols were conducted 16 hours a day, seven days a
  week" (from 1963). People lived "with only a standpipe water supply, little
  or no legal electricity and no drainage".
- An officer, not named, "posted to Kowloon City in 1987": "I occasionally
  went to the roofs to watch the planes skim over the top and land at Kai
  Tak". "Night and day within the Walled City were the same, with buzzing
  electrical wires, dripping pipes". "The rats were something else and often
  ran down the streets with their eyes shining red under my torch." "Kids
  going to school always emerged from the place in their pristine white
  uniforms". "One of my best sergeants lived and grew up inside."

**Albert Ng Kam-po and Yip Tak-wai (SCMP, 4 Jan 2013).**
- Albert Ng, 45 in 2013, a pastor. He and his friends flew kites from the roof
  that "could almost scrape the bellies of airliners" (the reporter's words).
  Ng: "We didn't know it was so dangerous". "We would just play ping pong in
  the hallway … The kids would go onto the roofs and leap from building to
  building, or we would drag discarded mattresses to the roof and jump on
  them. It was a happy time." See also `wsj-kwc-2014/` (7/F, 8 Sz Kung St.).
- Yip Tak-wai, 57 in 2013. He "bought a 400 sq ft flat inside the walled city
  in 1976 for HK$30,000", half the price outside. He worked as an accountant
  in Central. "You know the fishballs that Kowloon City is famous for? They
  would be made in the walled city and sold outside." At the demolition "a lot
  of the homes were quite nicely furnished".

**Jackie Pullinger 潘靈卓, missionary (HK01, 20 Jul 2024).** 80 in 2024. She
came in 1966, at 22, and ran a youth club in the city. Most of her memories
are of the late 1960s and 1970s, not of 1986.
- On first going in: "好似入咗老鼠籠一樣，冇水、冇電" [like going into a rat cage, no
  water, no power]. People used 火水燈 [kerosene lamps]; dentist signs hung on
  the buildings (the reporter's words).
- "我遲啲知道警察肯定有入嚟，佢哋有自己貪污嘅嘢。" [later I learned the police
  certainly came in; they had their own corruption].
- At the club, people played 康樂琪 [carrom] and table tennis. When she
  preached, they went out to smoke.
- Her later fruit (the reporter's words): children without warm homes began to
  get their parents' care; parents who beat their children learned to love
  them.
- Winson and 阿賢, former gang members (the reporter's words): 4 bosses ran 10
  heroin stalls each, with two pipes each; there were 牌九, 十三張 and 番攤
  stalls, "兩間麻雀館" [two mahjong parlours], and 4 dog-meat stalls. At about 10,
  阿賢 earned HK$10 a day to throw glass bottles from roofs at raiding police.
- She founded 聖士提芬會 [St Stephen's Society] in 1981.
- The page also names 李昇敏 "敏叔", a former resident who guides visitors in the
  park. He is a lead for a new interview.

**Greg Girard and Ian Lambot (HK01, 8 May 2024; interview 2019).** The page
gives their words in Chinese, translated by HK01.
- Girard, first sight, near the Kai Tak runway at night: "人們在煮食，聲音不斷傳出來"
  [people were cooking; sounds came out all the time].
- Lambot: "在較高的樓層，你也能找到商店和工廠，因為居民不想為了買包煙都要走到地下。在約六樓七樓，
  有一個通道可以貫穿整個九龍城寨。" [on higher floors there were shops and factories,
  because residents did not want to go down to buy a pack of cigarettes; at
  about the 6th–7th floor, a passage crossed the whole city].
- Girard: "電線從一座大廈接到另一座大廈，頭上掛着水管，有水滴漏出" [wires from building
  to building, water pipes overhead, dripping].
- Lambot: "裏面不會出現『繁忙時間』" [there was no rush hour inside]. "通道從來不見擠擁，
  即使是放工放學時間也一樣" [the passages were never crowded, even when work and
  school let out]. Girard: "郵差和送貨員是例外。" [postmen and delivery men were
  the exception].
- Light (the reporter's words, from Lambot): "單位裏的鎢絲燈、走廊的光管" [tungsten
  bulbs in the flats, fluorescent tubes in the corridors].
- Girard: at first residents gave them strange looks. Later a stranger with a
  camera and tripod became a usual sight. The residents were "十分容忍" [very
  tolerant] of the tripod and flash in the passages.

**林財銳, tailor beside the city (HK01, 2016 and 2022).** 84 in Jan 2022, thus
born about 1938. He opened 沙龍洋服 on 城南道, across the road from the city, in
1964. He closed it on 31 Jan 2022. He was a neighbour, not a resident.
- Season: winter, "尤其聖誕節前後是生意高峰期" [especially around Christmas, the
  busiest time], "做到唔使瞓" [so busy, no time to sleep] (2016).
- Planes: "基本一有飛機飛過，就好大聲，講嘢會聽唔到，所以我哋都會等飛機走咗先再講嘢" [whenever a
  plane flew over, the noise was so loud that nobody heard what people said;
  we waited for the plane to pass, then spoke] (2022). The reporter adds that the planes flew
  "由西邊飛到東邊降落" [from west to east to land].
- The rear of the city, before the clearance (2022): "冇打樁、得木柱支撐住兩三層高嘅樓房"
  [two- or three-storey buildings with no piles, held up by wooden posts].
  "啲街坊一直都好怕會有意外發生" [the neighbours always feared an accident].
- Safety (2022): "入面係人流複雜嘅，只係外面啲人唔敢人去，都係各有各搵食" [inside, all sorts
  came and went; outsiders did not dare go in; everyone made their own
  living].
- "以前成條城南道有20幾間洋服店。" [all along 城南道 there were 20-odd tailor
  shops] (2016).

**Sharon Lam's father (The Funambulist, 9 Mar 2018).** He went to a primary
school across the street at 11 or 12 and sometimes went inside. He never lived
there. The year is not given.
- "Fire engines could never get in." "inside, there's fire prevention stuff,
  such as a make-shift fire trolley with sand & buckets of water. There were
  self-organized patrol teams." "'Who's on duty today?' 'So and so are on
  duty!'"
- "You'd look up, and they were all dentists."
- "There were temples. Small temples."
- At the clearance: "People did not want to leave. They chained themselves
  and locked the doors or tied themselves to the doors."

**Gerald Posner, writer (blog, 26 May 2016).** In 1987 he and Trisha Posner
went in with a police escort, while he researched *Warlords of Crime*. The
post quotes chapter 10, "White Powder Ma".
- "Three police were in front of me and another two stepped in just behind."
- "The ceiling was low and covered by a bewildering jumble of knotted wires,
  dangling electric cables, and exposed fuses and sockets, all hanging less
  than a foot from the tallest cop's head."
- "an occasional naked bulb providing the barest light". "Within a hundred
  yards the walls had narrowed so that we had to proceed single file".
- A police escort, at a street sign: "it says the name of that street is
  Rats' Piss."
- The post says "The Walled City was torn down in 1992". That is wrong: the
  demolition was 1993–94.
