# Former residents and officials remember the city (retrospective, 2009–2024)

Thirteen free web pages of 2026-10-29, and seven more from the room research
of 2026-11-05 (see "Added 2026-11-05" below). In each, a person who lived or
worked in the city, or went into it, tells what they saw. All are
retrospective: the person speaks years after the demolition. One item
(Posner) quotes a book of 1988.

- **Link:** https://www.hk01.com/社區專題/1033066/
- **Retrieved:** 2026-10-29. The first five files are the HTML as served, from
  a script request. The other eight pages I read in a browser on the same day.
  I did not save them (see "Files to save").
- **Copyright:** each page belongs to its publisher or writer (HK01 (香港01), Talk
  Irvine and its poster, Gwulo and Brian Coak, M+, SCMP, The Funambulist and
  Sharon Lam, Gerald Posner).
- **Stored in git:** no. The files are in `local/`, which git ignores.

## Why this is primary

Each item is first-hand testimony by a person who was there. Historians count
oral history as a primary source. Tag each item "retrospective": memory can
change over 20 to 50 years.

The writers' own background text (history, figures, captions) and Hugh Farmer's article are secondary: see [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).
A line in which a writer tells what a named witness did, saw or said stays here. The twins of
`wsj-kwc-2014/` and `hk01-kaifong-series-2016/` use the same rule, and the data marks such
lines "retrospective" (for example T27, T28, T58).

## Files in `local/`

| File | Who | Recorded | SHA-256 |
|---|---|---|---|
| `hk01-2024-07-20-1033066.html` | 林羅平 "平哥", fishball maker. Reporter 吳美松 | retrospective (2024) | `2e201921fe1f29fcabdace3905f39ac3c1d89a880e62cd4221185ac7ce7059f7` |
| `hk01-2016-08-28-39889.html` | "阿榮" (a pseudonym), born in the city, left at 20. Reporter 麥佩雯 | retrospective (2016) | `17951965128fcb5a04c156e8d596e3c53126d53be7a5f8f6e42ecf1a7496d586` |
| `talkirvine-2009-08-28-a-glimpse-of-my-life-experience.html` | forum user "bkshopr_IHB", who lived there as a child with his father | retrospective (2009) | `101b45c488c236fc9bd480a7ac8c8d6db5732d55d918dfd48e6fa0b6b52cf57d` |
| `gwulo-node-19851-coak.html` | Brian Coak, Housing Department (房屋署) squatter control officer | retrospective (posted 2014) | `31853accee12251c2aa4e5d627bf9335b9b5998f85cdd4da74a02a3eeb12a6c9` |
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
| `hk01-2016-11-10-53204.html` | 林財銳, tailor, 沙龍洋服 on South Wall Road (城南道), across the road from the city, from 1964. Reporter 陳銘智 | retrospective (2016) | not saved yet |
| `hk01-2022-01-31-730608.html` | the same tailor, 84, on his last day. Reporter 曾鳳婷 | retrospective (2022) | not saved yet |
| `scmp-2018-03-23-2138495-wayback.html` | Lau Chun-fat; Vivian Chan; Eric Lockeyear and another police officer. By Peace Chiu, Mary Ann Benitez, Cannix Yau | retrospective (2018) | not saved yet |
| `scmp-2013-01-04-1119265-wayback.html` | Albert Ng Kam-po (吳錦波); Yip Tak-wai (葉德偉). By Jennifer Cheng | retrospective (2013) | not saved yet |
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
  operator tapped government mains and the Water Supplies Department (水務署) cut the
  illegal pipes.
- Water by floor: "二、三樓可能於早上6、7點來水，然後8、9時就輪到三、四樓".
- Water fees: "住宅用戶每月繳交100元，開工場則每個月支付300元水費".
- Police: they patrolled the outside and signed a patrol book at his shop, but
  did not go deep inside. Teochew (潮州) people were "並非少數".

**"阿榮", childhood in 西頭村第一街 (HK01, 2016).**
- Family (the reporter's words): his parents came from the mainland in the early
  1950s, after the civil war. They were poor and lived in the City:
  "上世紀五十年代初，中國大陸剛打完內戰解放，阿榮的父母從內地來港生活".
- Housing: no title deeds. A purchase was cash and a stamp on paper at the
  kaifong association. Buildings had no piles, only brick "逐層向上蓋".
- Flood: "水位比當時的身高還高，阿爸就冒雨背我們離家到城寨外。"
- Power: "一條電線十多戶共用，晚晚失火".
- Water: drilled "科學井" gave water for only a few hours each afternoon.
  "常常只有低層住戶才裝到水，高層的可能要去地面打水擔上樓。"
- Drugs: heroin sold from a bed board in the back lane, "細雞" HK$3 and
  "大雞" HK$5. A police sergeant and three constables collected money from the
  stalls on a schedule. He says it got much better after the ICAC (廉政公署) (1974).
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
summary (secondary: see [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md)). The first-hand parts:
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
  Tau Tsuen Road (東頭村道), and his rent. See `wsj-kwc-2014/`.

**Lau Chun-fat, toy-factory worker (SCMP, 23 Mar 2018).** 83 in 2018, thus
born about 1935. He came from Fujian (福建) in 1974. His boss at a toy factory told
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
  City (九龍城): "regular uniformed patrols were conducted 16 hours a day, seven days a
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
  them. It was a happy time." See also `wsj-kwc-2014/` (7/F, 8 Sz Kung St. (社公街)).
- Yip Tak-wai, 57 in 2013. He "bought a 400 sq ft flat inside the walled city
  in 1976 for HK$30,000", half the price outside. He worked as an accountant
  in Central (中環). "You know the fishballs that Kowloon City is famous for? They
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
- Girard, first sight, near the Kai Tak (啓德) runway at night: "人們在煮食，聲音不斷傳出來"
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
- Their work (the reporter's words): from the announcement of 1987 to 1992, they
  photographed the narrow lanes and the corner shops, and recorded daily life:
  "拍攝當中狹窄小巷、轉角士多，紀錄居民日常".
- Light (the reporter's words, from Lambot): "單位裏的鎢絲燈、走廊的光管" [tungsten
  bulbs in the flats, fluorescent tubes in the corridors].
- Girard: at first residents gave them strange looks. Later a stranger with a
  camera and tripod became a usual sight. The residents were "十分容忍" [very
  tolerant] of the tripod and flash in the passages.

**林財銳, tailor beside the city (HK01, 2016 and 2022).** 84 in Jan 2022, thus
born about 1938. He opened 沙龍洋服 on South Wall Road (城南道), across the road from
the city, in 1964. He closed it on 31 Jan 2022. He was a neighbour, not a resident.
- The shop (the reporters' words): on South Wall Road near the corner of Carpenter
  Road (賈炳達道), "九龍城城南道近賈炳達道交界" (2016). It was one road away from the
  City: "店舖剛好與九龍城寨相隔一條馬路" (2022).
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
- The 2016 lines of the post, with a wrong year for the demolition, are secondary: see [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

## Room facts in `data/room_research.json` (pages above)

- 林羅平, HK01 2024: T26, T27, T28.
- Jackie Pullinger, HK01 2024: T35, T36.
- "阿榮", HK01 2016: T58, T59.
- SCMP 2018 (Lau Chun-fat, Vivian Chan, the police officers): T47–T51.
- SCMP 2013 (Albert Ng, Yip Tak-wai): T2, T3, T55, T56.
- bkshopr_IHB, Talk Irvine 2009: T52–T54.

## Added 2026-11-05: pages from the room research

Seven more free pages. The agents of the room research (2026-11-05) read
six of them. I opened these six again on 2026-11-05 and checked the titles,
the dates and the speakers. One (陳文龍) is behind a bot check: its facts come
from search-result extracts only. I did not save any of these pages.

| Page | Who | Recorded | Copyright | Fact ids |
|---|---|---|---|---|
| 明周文化 (Ming Pao Weekly), 梁伊琪, 【九龍城寨】黑暗之外 城寨人真實記憶…, 13 Jun 2024. https://www.mpweekly.com/culture/社會/黑暗之城-九龍城寨-城寨居民-239629 | Charles, born in the City in 1959, and his wife Maggie; 平哥 (林羅平), the fishball maker of HK01 2024 above, and his wife May姐 | retrospective (2024) | © One Media Group (萬華媒體集團) | Z1–Z6, Z21 |
| 大紀元時報（香港）, 袁家倫, 【紀載香港】九龍城寨飛出的「火鳳凰」, 5 May 2024. https://hk.epochtimes.com/news/2024-05-05/28556552 | 袁家倫, a painter who came from the mainland in the 1970s and rented a flat in the City. An extract of her memoir 《火鳳凰》 (白象文化, 2020) | retrospective (2020 book, posted 2024) | © the writer; reprinted with leave of 大紀元時報. No © line on the page | Z7 |
| Beijing Visitor, Christopher KL Lau, "Journey into the Soul of the Kowloon Walled City with Pastor Albert Ng". Undated. https://www.beijing-visitor.com/hong-kong-culture/kowloon-walled-city | Albert Ng Kam-po, in the City from the mid- or late 1970s to 1988 | retrospective (after 2013) | © Beijing Tourist Info | W2–W5 |
| The Travel Club, John Carney, "Kowloon Walled City: life in the City of Darkness", 3 Jan 2015. https://www.thetravelclub.org/articles/travelogues/664-kowloon-walled-city-life-in-the-city-of-darkness | Heung Yin-king and Ida Shum, former residents (and Albert Ng). The page says that its text and photos "are taken from www.scmp.com": SCMP article 1191748 (2013), which is blocked | retrospective (2013) | © The Travel Club; the text © SCMP | W8, W9 |
| Comment by Sharon McAuley, 11 Feb 2020, on Hugh Farmer, "Kowloon Walled City 2 – manufacturing", The Industrial History of Hong Kong Group, 16 May 2018. https://industrialhistoryhk.org/kowloon-walled-city-2 | Sharon McAuley, who went into the City several times in 1970 with her aunt, an expatriate nurse | retrospective (2020) | © The Industrial History of Hong Kong Group, and the commenter | W10–W12 |
| Shue Yan Newsletter (HKSYU), kyyan, "Love Your Neighbour: Jacqueline PULLINGER's selfless dedication in Hong Kong's forgotten corners", 29 Nov 2024 (January 2025 issue). https://newsletter.hksyu.edu/en/?p=11542 | Jackie Pullinger, in the City from 1966 | retrospective (2024) | © Hong Kong Shue Yan University (香港樹仁大學) | W13 |
| The News Lens (關鍵評論網), 陳文龍, 我的城寨童年回憶（上）and（下）, about 2018. https://www.thenewslens.com/article/98485 and /98486 (also /98591, /98607; a copy at https://crossing.cw.com.tw/article/18963) | 陳文龍, who grew up in the City. Publisher 久石文化 | retrospective (about 2018) | © The News Lens and the writer | Z8–Z10 |

**Not added.** Hugh Farmer's article (W6, W7) is secondary: see [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md). Only the comment below it is first-hand.

### Key facts

**Charles and 平哥 (明周 2024).**
- Charles's childhood home: a two-storey tin hut, "在城寨出世時住的是鐵皮屋，只有兩層樓高".
  He pointed at a photo, and said that most buildings of the 1950s and 1960s were low
  (the reporters give his words): "五、六十年代的城寨建築多數比較低矮". The family of
  seven rented the upper floor, 400-odd sq ft. Drug users sat on the stair: "有條樓梯直上二樓，以前的『道友』（吸毒者）就蹲在樓梯一邊吸毒" (Z2).
- As a young man he put in water and power in the homes and workshops:
  "到城寨的住宅、工場裏安裝水電". He was almost killed by a bare wire once.
- After his marriage: a fifth-floor flat with no windows, "他們婚後住的五樓「後座」單位全屋都沒有窗"
  (Z1). The couple moved out in about 1985.
- As a child he hid outside a cinema to watch the strip shows,
  "也躲在戲院外偷看艷舞表演" (Z21; 1960s–1970s).
- 平哥 (林羅平): his shop, 德興魚蛋公司, was on Kwong Ming Street (光明街). "店舖所在的「光明街」有好幾間魚蛋工場，除此之外還有豬紅、黐膠花和製衣工場等等"
  [Kwong Ming Street had several fishball workshops, and also pig-blood,
  plastic-flower gluing and garment workshops] (Z3–Z6).
- Power between neighbours: "譬如樓上突然間沒有電，便扔個插頭下來，我們就借電給他用。"
- Rent: "我講兩句潮州話，（業主）就立刻便宜二百元租金！"
- The reporters' background text and captions (water, standpipes, storeys, history) are secondary: see [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

**袁家倫 (大紀元 2024).**
- The editor's note: she was an educated youth (知青) from Guangzhou (廣州) in the
  1970s, "1970年代，廣州知青袁家倫". A note between the photos says that she had cancer
  from 2014 and died in 2021: "可惜袁氏於2014年患癌，2021年不敵病魔離開人世".
- "我看到九龍城寨十三樓一套房子，一廳三房，有廁有廚房" [a 13/F flat: a hall,
  three rooms, toilet and kitchen] (Z7). "我住的是十三樓，是頂樓。" She shared
  it with a colleague, Mr Li.
- No lift and no telephone: "可是卻沒有電梯，沒有電話".
- Water: "每天下午三點鐘才有水供應" [water came only from 3 pm each day].
- The roof: "可以上天臺做運動" [the roof was open to her for exercise].
- The page does not give her years in the City.

**Albert Ng (Beijing Visitor).** He left in 1988 for the University of Hong
Kong (香港大學). WSJ gives his flat as 7/F, 8 Sz Kung St (see `../wsj-kwc-2014/`).
- "I used to live in a one bedroom flat and it used to be about 200 square
  feet." The bedroom was for his mother and his younger sister.
- "I lived on the eighth floor and there was no elevator." (W2). In English
  usage the eighth floor can be 7/F, thus it agrees with WSJ.
- "The top floor was the thirteenth floor and there was no water and no
  elevator."
- "The wall was always wet and mouldy and it used to smell really, really bad."
- Water: "the supply was half an hour per week and there were times when there
  was no water for months". Every day the family went to the public water
  stations.
- "My mother's family had a store which sold rice, oil and necessities." (W4,
  no place given).
- On "Bright Light Street" (光明街, Kwong Ming Street) "there were lots of drug
  dens and people used candles to light up the tables" (W5).
- "the roof top was the only place to play". A dropped ball meant a run "from
  the eight floor all the way to the third floor" (W3).

**Heung Yin-king and Ida Shum (SCMP 2013, via The Travel Club).** The Heung
family of six moved into the City in the 1960s, "from a rooftop hut in Hung Hom".
The writer tells of the two homes in his own words (W8, W9). This narration tells
what the named witnesses did, thus it stays here. `data/room_research.json` marks
W8 and W9 "secondary": the data and this file disagree (2026-11-16).
- First home: "a 70 sq ft room in a two-storey house near Tung Tau Chuen
  Road" (W8), "which they shared with seven other families". "We ate from a board
  laid over the knitting machine and sat on the bed."
- Second home: "a two-bedroom flat on the fourth floor of a high-rise on Tai
  Cheng Street" (W9), that is Tai Chang Street (大井街). "The second house was all
  right but had no taps, so as the eldest daughter I had the responsibility of
  hauling buckets of water from the public taps".
- Ida Shum, 62 at the time of the article: "We all had very good
  relationships in very bad conditions."

**Sharon McAuley (comment, 2020).** "I visited KWC several times in 1970 with
my expat aunt." All her facts are of 1970, outside the period.
- "The expats ran a small clinic within KWC where some mothers with newborns
  would bring them to be weighed" (W10). They gave out donated baby clothes and
  rosehip drops.
- A Chinese primary-school teacher's classroom. "There was a small room near
  the classroom with a pile of plastic toy components" (W11, W12). "I was
  informed by the teacher that the children worked there after school."

**Jackie Pullinger (HKSYU 2024).** Her memories are of the late 1960s, outside
the period.
- The writer's words: "A year after arriving, she stepped into the Kowloon Walled
  City for the first time." She left the area only at the demolition, "after more
  than 20 years of service there".
- She founded St Stephen's Society (聖士提芬會) in 1981, "a community dedicated to
  supporting addicts and the poor across Hong Kong".
- "There was no water, not many people had electricity, and sewers were just
  opened. There were more rats than people".
- "One little school I was used to help in – charging $4 a month, many
  students just couldn't afford it." (W13).

**陳文龍 (The News Lens, about 2018).** Search-result extracts only. Read the
full pages before you use these facts.
- His family rented a 2/F home on Lung Chun Road (龍津道) near the corner of Lo Yan
  Street (老人街): "一家曾租了龍津道近老人街街口二樓的房子" (Z8).
- A café at the corner of Tung Ching Road (東正道) and Lung Chun Road, with a telephone
  at its door: "一間冰室，位於東正道和龍津道的交接處，門口掛了一支電話" (Z9).
- A rice-roll factory on Lung Shing Road (龍城路): "龍城路上有一間腸粉廠，蒸氣緲緲，工人把米漿倒在一塊發黃的布上" (Z10).

## More items: the source search of 2026-11 (catalogued, not read)

- **Status:** read: 41 of 41 items read by the reading of the source search of 2026-11.
  A checker checked a sample of the facts. Each fact gives its page and a short exact quote.

41 items. New first-hand memories of former residents, police, visitors and workers.

### repo-audit-15: My Friend Ah Meng (blog 'My Kowloon Walled City Story')

- **Status:** Read on 2026-11-17; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** KowloonWalledCityBoy (the blog author, identified in the repo as Albert Ng Kam-po), 'My Friend Ah Meng', My Kowloon Walled City Story (blog), 13 October 2016 (updated 14 October 2016), https://mykowloonwalledcityblog.wordpress.com/2016/10/13/my-friend-ah-meng/; and the About page of the blog, undated, https://mykowloonwalledcityblog.wordpress.com/about/
- **Class:** retrospective (First-hand memories of a resident, written in 2016: retrospective (2016). The events are 'at least 30 years ago', thus about the late 1970s to mid-1980s (INFERRED). The About page does not name the author; the link to Albert Ng is from the repo, not from these pages.)
- **Date of the record:** 2016-10-13
- **Note:** its 2 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| post, paragraphs 1, 2, 6 | The author last saw Ah Meng at least 30 years before 2016. They met as young teenagers, and the author was two years older. | "The last time I saw Ah Meng was at least 30 years ago." |
| post, paragraph 3 | Ah Meng's parents owned a grocery store inside the Walled City. Its main product was rice. | "His parents owned a grocery store inside the Walled City." |
| post, paragraph 3 | The rice came from different countries, mostly Thailand and mainland China. | "rice from different countries (mostly from Thailand and Mainland China)" |
| post, paragraph 3 | The store also sold cooking oil and condiments. | "They also sold cooking oil and all kinds of condiments." |
| post | One of its most important products was big cans of LPG gas. | "the most important products that they sold were big cans of LPG gas" |
| post, paragraph 11 | The store also sold soft drinks. | "Did I mention that Ah Meng's parent's "rice shop" also sold soft drinks?" |
| post, paragraph 4 | The author's family lived on the 8th floor of a building with no lift. | "I lived on the 8th Floor, and there was no elevator." |
| post, paragraph 5 | Ah Meng's older brother Ah Keung carried the deliveries up the stairs: two bags of rice of 10 pounds each and one LPG gas (can), perhaps with other small items. | "Climbing up the stairs, he would carry two huge bags of rice (10 pounds each) and one LPG gas" |
| post, paragraphs 4-5 | Ah Keung was about ten years older than Ah Meng; the author's family called him the home delivery man. | "Ah Meng has an older brother, Ah Keung, who was probably 10 years older than Ah Meng." |
| post, paragraphs 7-8 | The two boys played table tennis at shops that rented tables, all outside the City: San Po Kong, Tung Tau Estate, Lok Fu and Choi Hung. Ah Meng paid the rental. No price is given. | "We have been to San Po Long, Tung Tau Estate, Lok Fu, and Choi Hung." |
| post, paragraph 9 | They traded stamps. The author bought stamps from an old man outside the Kowloon City Christians' Church on Lung Kong Road. | "right outside of the Kowloon City Christians' Church at Lung Kong Road." |
| post, paragraph 11 | A returned empty soft-drink bottle gave a refund of 20 cents. | "If you return an empty bottle, you got a 20 cents refund." |
| post, paragraph 11 | The author found empty bottles in the dark alleys and rinsed them at one of the public water stations before he returned them. The text says 'public water stations', not standpipes. | "rinsed them clean from one of those public water stations." |
| post, paragraphs 12-13 | His mother forbade the bottle collecting, because people told her that her son earned 20 cents by picking up trash. | "She didn't want other people to tell her again that her son earned 20 cents by picking up trash." |
| About page | About page: the author's family moved into the City in the mid-1970s and lived there until it was demolished in the early 1990s. | "My family moved into the Kowloon Walled City in mid-70s and lived there until it was demolished in the early 90s." |

- **Leads:**
  - Other posts of the same blog: 'Strip Shows in the 70s' (2016-11-21) https://mykowloonwalledcityblog.wordpress.com/2016/11/21/strip-shows-70s/; 'A Brief History of the Kowloon Walled City' Parts I-II (2015-08-17, 2015-08-20); 'Where is the Kowloon Walled City?' (2015-08-01). Categories include Food, Home, Livelihood, Neighbor, Primary School, Prostitution, Tuberculosis.
  - A comment on the About page (2014-09-26) says that Sagacity Magazine planned an interview with the author for its Winter 2015 issue.
### zh-testimony-1: 黃賭毒以外 記憶中的九龍寨城

- **Status:** Read on 2026-11-17; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** 林靄怡 and 廖廸莎 (reporters), 吳映彤 (editor), 「黃賭毒以外 記憶中的九龍寨城」, 大學線 (CUHK School of Journalism and Communication student paper), issue 128, 2017-02-28, web pages 1-3, http://ubeat.com.cuhk.edu.hk/128_history/ (and /2/, /3/)
- **Class:** retrospective (Retrospective (2017): first-hand testimony of two former residents (林港輝, 侯麗紅) and of the former official Richard Margolis (馬德克), inside a student reporters' article. The narration and the background history are secondary. The item stays in primary-sources/.)
- **Date of the record:** 2017-02-28 (published); testimony given in 2017 about c.1972-1992
- **Files:**
  - `zh-testimony-1-page-b865e2ec.html` (in `local/`, not in git): HTML of page 1 (林港輝, background); http://ubeat.com.cuhk.edu.hk/128_history/; 100810 bytes; SHA-256 `2e7456dceb5179812938ca175e05d13330a4f93671fe09d5a0048c3ed37567f0`; licence: 本網站的影片及圖片，版權屬中文大學新聞與傳播學院所有，未經本院同意，不能擅自使用。 (site footer: copyright of the CUHK School of Journalism and Communication) (http://ubeat.com.cuhk.edu.hk/128_history/)
  - `zh-testimony-1-page-42c4c7b6.html` (in `local/`, not in git): HTML of page 2 (侯麗紅, 林港輝); http://ubeat.com.cuhk.edu.hk/128_history/2/; 100193 bytes; SHA-256 `518ef28096e0a0604eea8643daa2d7a28bf89ea42a000d3a0e9de7c194478e40`; licence: 本網站的影片及圖片，版權屬中文大學新聞與傳播學院所有，未經本院同意，不能擅自使用。 (site footer: copyright of the CUHK School of Journalism and Communication) (http://ubeat.com.cuhk.edu.hk/128_history/)
  - `zh-testimony-1-page-4526cd03.html` (in `local/`, not in git): HTML of page 3 (clearance, 馬德克); http://ubeat.com.cuhk.edu.hk/128_history/3/; 100671 bytes; SHA-256 `2091e4ac6f0d7c2d475a4f1b4baca202a3ffbdcfcf5f5604a3a9cb1436298ba7`; licence: 本網站的影片及圖片，版權屬中文大學新聞與傳播學院所有，未經本院同意，不能擅自使用。 (site footer: copyright of the CUHK School of Journalism and Communication) (http://ubeat.com.cuhk.edu.hk/128_history/)
- **Note:** its 41 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| page 2 | 林港輝's mother made extra New Year food and gave it to the neighbours. | "媽媽都會多做些賀年食品到處派" (mother would make extra New Year food to hand out everywhere) |
| page 3 | 馬德克 compares the clearance to tidying a house before you sell it. | "正如你賣房子給別人，也不會留下爛攤子" (just as when you sell a house to someone you would not leave a mess) |
| page 3 | 馬德克 says that 新華社 was very accepting of the plan. | "十分接受" (very accepting) |

- **Leads:**
  - 《往事》, a programme of 上海紀實頻道 (a Shanghai documentary TV channel), in which 喬宗淮 of Xinhua News Agency (新華社) talks about the clearance (cited on page 3; date not given)
  - Photos from Sing Tao Daily (星島日報) and from Ian Lambot used in the article (pages 1 and 3)
### top-blocked-a-1: The News Lens 98485: 我的城寨童年回憶（上）：「三不管」的香港九龍城寨

- **Status:** Read on 2026-11-19; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** 陳文龍 (publisher of 久石文化), '我的城寨童年回憶（上）：「三不管」的香港九龍城寨', The News Lens 關鍵評論網, article 98485, 2018/06/26, sections 一-四; Arquivo.pt copy of 2025-09-07, https://arquivo.pt/noFrame/replay/20250907213728/https://www.thenewslens.com/article/98485 (original https://www.thenewslens.com/article/98485)
- **Class:** retrospective (First-hand childhood memoir of a former resident: retrospective (2018). The treaty history, the 1987 census figure and the remark on foundations are secondary. About four years in the City, three homes; INFERRED about 1985-1989 from the 1986 sale offer.)
- **Date of the record:** 2018-06-26
- **Files:**
  - `top-blocked-a-1-98485.html` (in `local/`, not in git): HTML of the Arquivo.pt copy (2025-09-07) of The News Lens article 98485; the live page is 403; https://arquivo.pt/noFrame/replay/20250907213728/https://www.thenewslens.com/article/98485; 199028 bytes; SHA-256 `ee4ccca95f0e5b046aae87ed8a50a1d823b1afc51a949bbd13e4f8fc4d4dc616`; licence: no licence statement on the page; © The News Lens and the author (INFERRED, usual for the site) (https://arquivo.pt/noFrame/replay/20250907213728/https://www.thenewslens.com/article/98485)
- **Note:** its 2 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| section 一、三不管地帶, last paragraph | The author lived in the City for about four years and moved home three times, until the resettlement was arranged. | "直至安排調遷為止，我在城寨住了約四年，搬過三次家。" (Until the resettlement was arranged, I lived in the City about four years and moved home three times.) |
| part 1 (opening, before section 一) | He says the residents were mostly new immigrants or the poorest people of society. | "所住的「寨民」大多是新移民或社會最底層的草根" (The residents who lived there were mostly new immigrants or grassroots people at the bottom of society.) |
| section 一、三不管地帶 | In his years in the City he never saw people hacked with knives, arson or gang fights. He says life there was like that of poor people elsewhere, and neighbours lived in harmony. | "住在城寨的歲月，沒有見過砍人放火、圍毆逞凶的刀光劍影" (In my years in the City I never saw people hacked or houses burned, or gang beatings.) |
| section 一、三不管地帶 | The government collected no rates (差餉) from the buildings, but gave basic services: drinking water, electricity, street cleaning, refuse collection and postal delivery. | "還是提供了基本的民生服務，例如供應食水、電力、清掃街道、清理垃圾、郵差派信等" (It still provided basic services, for example drinking water, electricity, street sweeping, refuse clearance, postmen delivering letters, and so on.) |
| section 一、三不管地帶 | Before the clearance the buildings were about ten storeys high and stood one against the next. On the roofs a person could step across to the next building with one small step. | "大樓約十層高，一幢挨著一幢，密密麻麻，在天台上只要跨一小步，就能走到隔壁大樓。" (The buildings were about ten storeys high, packed one against the next; on the roof one small step took you to the next building.) |
| section 一、三不管地帶 | The roof parapets carried 'fishbone' TV aerials on water-pipe poles. After a typhoon the aerials were bent and had to be re-aimed, or the TV showed only snow. | "天台的女兒牆處處是用水管駕起俗稱「魚骨」的電視天線，颱風過後，天線被打得七歪八斜" (Everywhere on the roof parapets were TV aerials, called 'fishbones', set up on water pipes; after a typhoon they were knocked crooked.) |
| section 一、三不管地帶 | From the roofs he could see from Kowloon City to the Peak (太平山). Kai Tak airport was near, and the big planes passed close in front of him as they came down to the runway. | "巨無霸的飛機就在眼前掠過" (The jumbo planes swept past right in front of your eyes.) |
| section 一、三不管地帶 | The streets inside were dark. Overhead hung wires and water pipes that dripped day and night and that nobody repaired; walkers had to dodge the drips. | "頭頂可見的是看似欲墜的電線和水管，水管日夜滴水，無人修葺" (Overhead you saw wires and water pipes that looked about to fall; the pipes dripped day and night and nobody repaired them.) |
| section 一、三不管地帶 | The lanes were wet and very humid. Rats were everywhere and jumped out of dark corners past the walkers. | "街巷暗弄濕漉漉的，濕氣甚重，老鼠橫行" (The streets and dark lanes were soaking wet, very humid, and rats ran rampant.) |
| section 一、三不管地帶 | He describes the City as a rectangle on a slope, like a chessboard: 東頭村道 at the top, 龍津道 at the bottom, 東正道 on the left and 西城路 on the right. | "城寨沿坡而下，由上方的東頭村道至下方的龍津道，左邊的東正道至右邊的西城路，呈長方形如一座棋盤。" (The City runs down a slope, from 東頭村道 above to 龍津道 below, from 東正道 on the left to 西城路 on the right, a rectangle like a chessboard.) |
| section 一、三不管地帶 | Four streets ran through from 龍津道 to 東頭村道; from east to west he names 龍城路, 光明街, 老人街 and 大井街. | "城寨有四條路可以直通東頭村道，由東而西，分別是龍城路、光明街、老人街、大井街。" (Four roads in the City led straight through to 東頭村道; from east to west they were 龍城路, 光明街, 老人街, 大井街.) |
| section 一、三不管地帶 | Only one street, 龍津路, crossed the City from east to west, and several narrow lanes branched off it. | "貫穿東西的只有一條龍津路，龍津路又分叉出幾條細巷。" (Only 龍津路 ran through from east to west, and several narrow lanes branched off 龍津路.) |
| section 一、三不管地帶 | The lanes were a maze. A stranger needed time to find the exit. Criminals could escape by going up a building to the roof and down another building. | "或遁入任何一座大樓跑上天台，再從天台下樓隱身暗巷。" (Or slip into any building, run up to the roof, then go down from the roof and hide in a dark lane.) |
| section 一、三不管地帶 | Besides the signboards, almost every floor had illegally built iron cages and iron window frames that projected out from the walls. | "幾乎每一層樓都有向外潛建的鐵籠、鐵窗懸在牆壁，突出在外" (Almost every floor had illegally built iron cages and iron windows hanging on the walls, projecting outwards.) |
| section 二、食乜野 | First home: his father and a friend rented a room with wooden-board partitions on 東頭村道, for a few hundred HK dollars a month. | "一開始，父親在東頭村道和友人租了一間木板隔間，月租數百港元。" (At first my father and a friend rented a wooden-partitioned room on 東頭村道, at a monthly rent of a few hundred HK dollars.) |
| section 二、食乜野 | The room held a steel-tube double bunk (碌架床), which left only a narrow passage for odds and ends and a folding table. They ate sitting on the edge of the bed. | "只剩下窄窄的走道，堆放一些雜物，一張摺枱，吃飯要坐在床沿。" (Only a narrow passage was left, piled with odds and ends, a folding table; to eat you had to sit on the bed edge.) |
| section 二、食乜野 | Two families, eight or nine people, lived in this small home. | "小小的屋子住了兩家人，八、九個人擠在屋裡" (Two families lived in the small home, eight or nine people crammed in.) |
| section 二、食乜野 | 東頭村道 was the busiest street of the City, lined with eateries and stores (士多). The low outer walls hung with white signs with black characters for dentists and Western-medicine clinics, like a street of (illegal) medicine. | "掛滿白底黑字，全是牙醫和西醫診所的招牌" (Hung full of black-on-white signs, all for dentists' and Western doctors' clinics.) |
| section 二、食乜野 | Many of these doctors had practised in mainland China, fled to Hong Kong, could not pass the licence because they did not know English, and practised without a licence in the City. | "許多在大陸行醫的醫生逃難到香港謀生，不諳英文，無法考取證照合法執業" (Many doctors who had practised on the mainland fled to Hong Kong to make a living; not knowing English, they could not get licences to practise legally.) |
| section 二、食乜野 | The unlicensed doctors charged less, and patients came not only from the City but more from all over Hong Kong. A patient in a dispute had no legal recourse. | "這些無照醫生診金相對便宜，反而招來不少病患。病患不只侷限城寨居民，更多是來自港九新界" (These unlicensed doctors' fees were relatively cheap and drew many patients, not only City residents but more from all of Hong Kong, Kowloon and the New Territories.) |
| section 二、食乜野 | At dusk, food hawkers with pushcarts lined the City side of 東頭村道, from the mouth of 老人街 to 東正道, calling out '食乜野' (what will you eat). | "推著小車的熟食小販一攤接一攤從老人街街口延伸到東正道" (Cooked-food hawkers pushing small carts, stall after stall, stretched from the mouth of 老人街 to 東正道.) |
| section 二、食乜野 | The hawkers sold fresh coconut juice, roast chestnuts, fried snacks, beef offal, chives with pig's blood, imitation shark-fin soup with fish, red-braised chicken gizzards and feet, curry fish balls, cart noodles and soy-sauce fried noodles. | "有賣鮮榨椰汁、炒栗子、「炸野」（炸物）、牛什、韭菜豬紅、魚翅魚肉、紅雞腎紅雞腳、咖哩魚蛋、車仔麵、豉油王炒麵" (They sold fresh coconut juice, fried chestnuts, fried things, beef offal, chives and pig's blood, 'shark fin' with fish, red chicken gizzards and feet, curry fish balls, cart noodles, soy-sauce fried noodles.) |
| section 二、食乜野 | Buyers ate standing at the roadside and dropped their rubbish. Some hawkers served in china bowls and washed them in one or two buckets of water beside the cart, so the road was greasy and littered. | "有些小販的小吃是用瓷碗裝，車攤旁邊會放一兩桶水，用來洗碗" (Some hawkers served snacks in china bowls, with one or two buckets of water beside the cart to wash the bowls.) |
| section 二、食乜野 | The family ate all three meals at home and seldom ate in a restaurant. | "三餐都在家吃，少有到餐廳吃飯" (Three meals were eaten at home, and we seldom went to restaurants.) |
| section 二、食乜野 | Snack prices: HK$1 for a skewer of fish balls; HK$3 for a bowl of chives and pig's blood (韭菜豬紅). | "花一塊錢吃一串魚蛋、手頭較為闊綽，就花三塊錢吃一碗韭菜豬紅。" (Spend one dollar on a skewer of fish balls; when better off, three dollars on a bowl of chives and pig's blood.) |
| section 二、食乜野 | The fried-snack hawker, a thin man with long bamboo chopsticks, fried chicken legs and wings, and green peppers, red sausage and aubergine with fish paste, and wonton skins wrapped round fish paste. HK$1 bought any three pieces. | "當年一塊錢可選三件，自由搭配" (In those days one dollar let you pick three pieces, any combination.) |
| section 二、食乜野 | 東頭村道 was the main road for transport out of the City. He went to 新亞中學 in 土瓜灣 by bus 11K from the stop on 東頭村道; the fare was HK$1.20 a trip. | "我要去土瓜灣新亞中學上學，要在東頭村道的巴士站搭乘11K，每程是1.2元。" (To go to school at 新亞中學 in 土瓜灣 I took the 11K at the 東頭村道 bus stop, $1.2 a trip.) |
| section 二、食乜野 | Each morning he and two friends from the same school met at the bus stop and shared a taxi to school: HK$2 each, HK$6 in all, to avoid the crowded bus. | "一人湊兩塊，花六塊錢就免除「迫巴士」，一起共乘「的士」（計程車）去上學。" (Two dollars each, six dollars in all, and no squeezing on the bus: we shared a taxi to school.) |
| section 二、食乜野 | A cooked-food shop near the junction of 東頭村道 and 老人街 sold iced soy milk at its door: a big glass for HK$1. There were no paper cups; customers drank standing at the door and gave back the glass. | "在門口擺賣冰豆漿，大大一杯只賣一塊錢，那時不流行紙杯，裝在玻璃杯" (It sold iced soy milk at the door, a big cup for only one dollar; paper cups were not common then, it came in a glass.) |
| section 三、住城寨的人 | Second home: the whole family moved to the 10th floor of a building on 龍津路. Each landing had two flats; the neighbour across was from his father's home village. | "之後，我們舉家搬到龍津路的一幢大樓的十樓，一梯兩伙（戶），對面鄰居是父親的鄉里。" (Then our whole family moved to the tenth floor of a building on 龍津路, two flats to a landing; the neighbour opposite was from my father's home village.) |
| section 三、住城寨的人 | The 10/F flat was small: two rooms, a living room, a kitchen and a toilet. | "小小房子，兩房一廳，一間廚房和廁所。" (A small home: two rooms and a living room, a kitchen and a toilet.) |
| section 三、住城寨的人 | The building had no lift; people went up and down on foot. | "大樓沒有電梯，上下樓都要靠腳力。" (The building had no lift; going up and down depended on your legs.) |
| section 三、住城寨的人 | The rooms had windows, but the iron window cages let in no sun and no breeze. The windows opened only halfway; opened fully, drips from leaking pipes splashed in. | "窗戶只能半開，若全開，漏水的水管水滴會濺進屋內。" (The windows could only open halfway; fully open, drips from the leaking pipes would splash into the home.) |
| section 三、住城寨的人 | In daytime the flat was pitch dark without the electric light. When the power occasionally failed, they lit candles. | "白天不開電燈，伸手不見五指，偶爾停電，得點蠟燭。" (In the daytime without the lights on you couldn't see your hand; with an occasional power cut, we had to light candles.) |
| section 三、住城寨的人 | In summer the flat was like an oven. There was no air conditioning; they went shirtless and used an electric fan. | "炎夏如住在一個烤箱，沒有冷氣，汗流浹背，只能打赤膊，吹電風扇。" (In hot summer it was like living in an oven: no air conditioning, sweat pouring, only stripping to the waist and the electric fan.) |
| section 三、住城寨的人 | Power cuts did not often happen in the City, but water cuts were frequent and were the big problem. | "城寨停電不是常發生，停水則經常出現，這才是大問題。" (Power cuts did not often happen in the City; water cuts did, often, and that was the big problem.) |
| section 三、住城寨的人 | The water pressure often did not reach the upper floors, because the lower floors drew the water first. Street taps (街喉) stood at intervals round the City for residents to draw water and wash. | "城寨四周每隔一段距離，設有「街喉」，供居民取水和洗滌" (At intervals all round the City there were street taps for residents to draw water and do washing.) |
| section 三、住城寨的人 | Water was supplied by time slot and by zone. Almost every kitchen had a concrete storage tank, filled during the supply hours, or from the street tap when there was no supply. | "城寨的供水採時段性，分區供水。家家戶戶的廚房幾乎設了一個水泥蓄水池" (Water in the City was supplied by time period and by zone; nearly every household's kitchen had a concrete water tank.) |
| section 三、住城寨的人 | Every family needed buckets. The brothers carried full buckets from the street tap up ten floors of stairs, and set them down to rest several times on the way. | "提著沉甸甸的水桶爬十層樓的樓梯回家倒放，路程中間要放下水桶休息數次。" (Carrying heavy buckets up ten floors of stairs home to pour in, putting the buckets down to rest several times on the way.) |
| section 三、住城寨的人 | His father worked in a plastics factory and his mother was a factory worker. He says tenants were the poorest people in Hong Kong. | "父親是塑膠廠工人，母親是工廠女工。" (Father was a plastics-factory worker; mother was a factory girl.) |
| section 三、住城寨的人 | Furniture: the bunk, a folding table and a few folding chairs. There was no wardrobe; clothes were kept in an iron trunk, with the identity papers at the bottom. | "沒有衣櫃，衣服裝在一個鐵箱裡，證照就藏在箱底。" (No wardrobe; clothes were kept in an iron trunk, the papers hidden at the bottom.) |
| section 三、住城寨的人 | The only electric appliances were a ceiling fan and a rice cooker. There was no water heater: cold baths in summer; in winter they boiled a kettle and mixed it with cold water in a big red plastic basin. | "電器只有天花板的吊扇，還有一個電飯煲。沒有熱水爐" (The only appliances were the ceiling fan and a rice cooker. No water heater.) |
| section 三、住城寨的人 | One basin of water served for hair and body: he squatted and poured water over himself with a tooth mug. | "洗頭洗澡只用一盤水，先蹲著洗頭再洗澡，用一個漱口杯舀水" (One basin of water for hair and bath: squat to wash the hair first, then the body, scooping water with a tooth mug.) |
| section 三、住城寨的人 | The family had no TV; to watch TV they went to a neighbour's home. | "沒有電視機，要看電視就到鄰居家去看。" (No television; to watch TV we went to the neighbour's.) |
| section 三、住城寨的人 | They cooked on a kerosene stove (火水爐), not on LP gas or an electric hob. It was green, burned a ring of cotton wicks, was lit with a kerosene-soaked stick and refilled with a hand pump from a kerosene drum. If overturned it could start a fire. | "煮食的爐具不是石油氣或電磁爐，是火水爐（又叫煤油爐）。" (The cooking stove was not LP gas or induction, but a kerosene stove.) |
| section 三、住城寨的人 | He was the eldest of three brothers. Clothes passed down to the second and third brother. Fruit was rare: one apple was cut into quarters, and the last quarter into three. | "一個蘋果會切成四等份，三兄弟一人四分之一塊" (One apple would be cut into four equal parts, a quarter each for the three brothers.) |
| section 三、住城寨的人 | In 1986 the owner of the 10/F flat on 龍津路 wanted to sell it; the asking price was HK$80,000. | "住龍津路十樓，剛好屋主要賣屋，我記得開價是港幣八萬元，那年是1986年。" (Living on 10/F of 龍津路, the owner happened to want to sell; I remember the asking price was HK$80,000; that year was 1986.) |
| section 三、住城寨的人 | Homes in the City were sold by private contract: no tax, no official papers, no government registration, no bank loans, cash only. The only body that certified a sale was the 九龍城寨街坊事業促進福利會. | "買賣都是現金交易，唯一的認證機構是「九龍城寨街坊事業促進福利會」" (Sales were all cash deals; the only certifying body was the 九龍城寨街坊事業促進福利會.) |
| section 三、住城寨的人 | His parents together earned no more than HK$3,000-4,000 a month. This covered the daily costs, with no savings; HK$80,000 was a huge sum to them. | "父母努力工作，一個月收入合共不外乎三、四千元，剛好負擔一家日常開銷" (My parents worked hard; together their monthly income was no more than three or four thousand dollars, just enough for the family's daily costs.) |
| section 三、住城寨的人 | A neighbour offered to help them borrow the money, but they feared the debt and looked for another rented home. | "鄰居說可以幫忙籌借，但龐大的債務怕會影響到生活，所以後來只好另覓租處。" (A neighbour said he could help raise a loan, but we feared the huge debt would affect our life, so we looked for another rental.) |
| section 四、街口二樓的房子 | Third and last home: the 2nd floor of a building on 龍津道 near the mouth of 老人街. 龍津道 was a wide main street that faced Kowloon City; it was their only home in the City that faced the sun. | "父母找租了龍津道近老人街街口二樓的房子，這是我們在城寨最後一次搬家。" (My parents rented a second-floor home on 龍津道 near the mouth of 老人街; this was our last move in the City.) |
| section 四、街口二樓的房子 | The rent of the 2/F flat on 龍津道 was HK$1,400 a month, higher than before. | "環境改善了，租金相對貴一些，月租一千四百元。" (Conditions improved and the rent was a bit dearer: $1,400 a month.) |
| section 四、街口二樓的房子 | On the ground floor, left of the stairs, the landlord ran a Western-medicine shop (西藥房): wall cabinets to the ceiling and a low cabinet about 150 cm high, full of Western medicines, health products and milk powder. The owner or his wife served. | "樓梯左邊地鋪是房東開的西藥房" (The ground-floor shop left of the stairs was a Western pharmacy run by the landlord.) |
| section 四、街口二樓的房子 | On the ground floor, right of the stairs, was an unlicensed dentist's clinic, with dentures and tooth moulds in a glass window and one simple treatment chair. | "右邊是無照牙醫診所，透明的玻璃櫥窗，放置了許多假牙和齒模，店內有一台簡陋的治療椅。" (On the right was an unlicensed dentist's clinic: a clear glass window with many dentures and tooth moulds; inside, a simple treatment chair.) |
| section 四、街口二樓的房子 | A street tap stood in front of the dentist's clinic. On the 2nd floor the pressure was enough for tap water, but the kitchen still had a concrete tank because of the timed supply. His mother sometimes washed clothes at the street tap. | "住二樓有足夠水壓，扭開水龍頭就有自來水。但廚房還是有一個水泥蓄水池" (On the second floor there was enough pressure: turn the tap and water came. But the kitchen still had a concrete tank.) |
| section 四、街口二樓的房子 | Beside the street tap was a sweet-soup (糖水) stall: a pushcart made into a mobile stove, with two folding tables and a few chairs. It sold 湯圓 and 腐竹蛋, and opened at dusk until midnight. | "賣湯圓和腐竹蛋，黃昏開始營業，至半夜才歇。" (It sold glutinous rice balls and beancurd-skin egg soup, opening at dusk and closing at midnight.) |
| section 四、街口二樓的房子 | The owner of the sweet-soup stall came from his father's home district. People said he was a triad figure who also 'settled disputes' for people. | "攤主是父親的鄉親，據說是黑道人物，除了擺攤，還幫人圍事討公道。" (The stall owner was from my father's home area; he was said to be a gangster who, besides the stall, settled disputes for people.) |
| section 四、街口二樓的房子 | The stairs were steep, about 45 degrees, and went straight up to the 2nd floor with no turn. On the right wall hung the crooked mailboxes of the whole building, with a copper-coin pattern; the gaps were covered with small cards for unlicensed doctors and removal firms. | "樓梯頗為陡峭，斜度約四十五度，拾級而上，不必迴轉直達二樓。" (The stairs were quite steep, about 45 degrees, going straight up to the second floor without turning.) |
| section 四、街口二樓的房子 | The flat was a rectangle: three rooms, a living room, a kitchen and a toilet. The rooms and the living room had wooden-board partitions. | "房子呈長方型，三房一廳一廚一衛，三間房間和客廳皆以木板隔間。" (The home was rectangular: three rooms, a hall, a kitchen, a toilet; the three rooms and the hall were all partitioned with wooden boards.) |
| section 四、街口二樓的房子 | Two rooms had windows that looked across to 賈炳達道 and Kowloon City. A dark room off the living room was his and his second brother's (bunk: brother above, he below); the third brother and the parents slept in another room. | "連接客廳是一間暗房，是我和二弟的房間，二弟睡上舖，我睡下舖" (Off the living room was a dark room, mine and my second brother's; he slept on the upper bunk, I on the lower.) |
| section 四、街口二樓的房子 | To ease the rent the parents sublet one room to a young couple, for HK$800 a month. | "為了減輕租金壓力，父母把另一間房間分租給一對年輕夫妻。" (To ease the rent, my parents sublet another room to a young married couple.) |
| section 四、街口二樓的房子 | They advertised the room on red paper in black pen, with tear-off squares of the phone number, posted at places round the City where such notices went up. The room let quickly at HK$800 a month. | "房子很快租出去，租金是每個月港幣800元。" (The room let quickly; the rent was HK$800 a month.) |
| section 四、街口二樓的房子 | The site of today's 九龍城廣場 was then a temporary market (臨時街市). In Primary 5-6 he bought the food there and cooked, so his parents had a meal when they came home from work. | "小學五、六級的我要幫忙買菜，就是到臨時街市買菜，買了菜還要煮，等父母下班回家有飯可吃。" (In Primary 5 or 6 I had to help buy food, at the temporary market, and then cook it, so my parents had food when they got home from work.) |
| section 四、街口二樓的房子 | To reach the temporary market he crossed a squatter area of wooden huts, 西頭村. It was later cleared and became the cycling park on 賈炳達道, which they could see from their window while they still lived in the City. | "木屋區被拆後改建成單車公園，就是現在賈炳達道單車公園。" (After the squatter area was cleared it was rebuilt as a cycling park, today's 賈炳達道 cycling park.) |
| section 四、街口二樓的房子 | His father bought the boys a BMX bicycle, their dearest toy, to ride on the new cycle track. | "父親也買了一輛BMX的腳踏車給我們" (Father also bought us a BMX bicycle.) |
| section 四、街口二樓的房子 | A store in the small square of 西頭村 sold Calbee (卡樂B) crisps with letter cards in a prize promotion; he never got the robot. | "一有零錢就會往士多跑，去買卡樂B薯片" (Whenever I had small change I ran to the store to buy Calbee crisps.) |
| section 四、街口二樓的房子 | After 西頭村 was cleared the site was left unfenced. After school he collected scrap iron there and sold it at a recycling station on 打鼓嶺道: 20 cents a catty, HK$4-5 a trip. | "拿到打鼓嶺道的回收站變賣，廢鐵一斤是兩毛，一趟下來可以賺到四、五塊錢。" (Took it to the recycling station on 打鼓嶺道 to sell; scrap iron was 20 cents a catty, and one trip earned four or five dollars.) |
| section 四、街口二樓的房子 | 賈炳達道 had a football pitch and a row of basketball courts. He and a classmate tried to sell cold drinks there from a big bucket half-filled at the street tap, with ice, Vita lemon tea and Coke from a supermarket; it failed in a few days. | "大桶在街喉注入半桶水，加入一些冰塊，到超市買了一些維他檸檬茶和可樂放進桶裡" (Half-filled a big bucket with water at the street tap, added some ice, bought some Vita lemon tea and Coke at the supermarket and put them in.) |
| whole text | INFERRED: The years of residence: about four years, with the sale offer of 1986 during the second home and the move out at the resettlement. The order of school years in the text is not clear (secondary school at the first home, Primary 5-6 at the third). INFERRED: about 1985-1989. | "那年是1986年" (That year was 1986.) |

- **Leads:**
  - Part 2 of the memoir: The News Lens 98486, '我的城寨童年回憶（下）：九龍城寨，黑暗中有光' (named at the end of part 1; Arquivo.pt holds no copy, per the finder).
  - The News Lens 98591 and 98607 (same author, per the sources README; not checked here).
  - Records of the 九龍城寨街坊事業促進福利會, which the author names as the only body that certified sales of homes in the City.
### repo-audit-11: How a Hong Kong fish ball maker from Kowloon Walled City became a thriving family business (South China Morning Post), as reproduced on the Ha Ming Kee (夏銘記) site

- **Status:** Read on 2026-11-18; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** 'How a Hong Kong fish ball maker from Kowloon Walled City became a thriving family business', South China Morning Post (author and date not given on the copy; https://www.scmp.com/lifestyle/food-drink/article/3347100/how-hong-kong-fish-ball-maker-kowloon-walled-city-became-thriving-family-business), reproduced on the Ha Ming Kee (夏銘記) website, posted 20 March 2026, https://www.hamingkee.com.hk/about/media?blog_id=19
- **Class:** retrospective (retrospective (2026): Roger Ha's own memories of his childhood in the City (primary); the frame is the reporter's narration (secondary).)
- **Date of the record:** 2026-03-20 (date of the copy; SCMP date not given)
- **Files:**
  - `repo-audit-11-63f8b35536b246f675aa55f49e55f1f47d91b347.png` (in `local/`, not in git): Photo (courtesy of Roger Ha): people on a street outside the City before the demolition; https://hamingkee.mshop-app.com/image/catalog/blog_photo/blog-19/63f8b35536b246f675aa55f49e55f1f47d91b347.png; 3644462 bytes; SHA-256 `e38d4ca231e22749d3bc68edb8d89cc95bfffb03ce199e09ee7952d237ee325c`; licence: No licence stated; © the Ha family / SCMP (https://www.hamingkee.com.hk/about/media?blog_id=19)
- **Note:** its 7 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| hamingkee.com.hk blog 19 (SCMP text), Roger Ha | The family lived on the eighth floor of a building with no lift. | "We lived on the eighth floor, and there was no lift." |
| hamingkee.com.hk blog 19 (SCMP text), Roger Ha | From the open window he could touch the next building at arm's length. | "If I opened the window, I could touch the building next to us within arm's length," |
| hamingkee.com.hk blog 19 (SCMP text), Roger Ha | The neighbours could see right into the family's room. | "Our neighbours could see right into our room." |
| hamingkee.com.hk blog 19 (SCMP text), Roger Ha | Roger Ha: life was hard. | "It was a tough life," |
| hamingkee.com.hk blog 19 (SCMP text), Roger Ha | His mother gutted and cleaned all the fish at the street pump, in cold water. | "My mother would gut and clean all the fish by the pump, and the water was cold." |
| hamingkee.com.hk blog 19 (SCMP text), Roger Ha | The flat had no room for her to do that work. | "There was no room in our flat for her to do work like that" |
| hamingkee.com.hk blog 19 (SCMP text), Roger Ha | There was no running water in the buildings. The street pump was the family's only water supply. | "There was no running water in the buildings, and the pump was our only water supply." |
| hamingkee.com.hk blog 19 (SCMP text), Roger Ha | His father delivered the fish balls by bike, more than three runs a day; his mother made them at home. | "My father would make the deliveries on a bike while my mother made the fish balls at home;" |
| hamingkee.com.hk blog 19 (SCMP text), Roger Ha | At its height Ha Ming Kee supplied 70 per cent of the restaurants in Yau Tsim Mong. | "At its height, Ha Ming Kee was the supplier of 70 per cent of the restaurants in the Yau Tsim Mong district," |
| hamingkee.com.hk blog 19 (SCMP text), Roger Ha | Burnt foil and needles lay all around the building. | "We'd see burnt foil and needles scattered all around the place," |
| hamingkee.com.hk blog 19 (SCMP text), Roger Ha | Neighbourhood gangs fought with cleavers. | "Neighbourhood gangs would rumble with cleavers." |

- **Leads:**
  - SCMP original: https://www.scmp.com/lifestyle/food-drink/article/3347100/how-hong-kong-fish-ball-maker-kowloon-walled-city-became-thriving-family-business (author and date; HTTP 403 to the tool).
### top-gap-tv-news-archives-3: VIPS (EO) - Jackie Pullinger

- **Status:** Partly read on 2026-11-19; a checker checked a sample of the facts on 2026-11-19. Read the catalogue record with WebFetch. The 25-minute video itself was not watched (no video or audio in this reading), so Pullinger's own words are not in the facts.
- **Citation:** EO (Evangelische Omroep), VIPS, episode 'Jackie Pullinger', broadcast 31 July 1996, 25 min 31 s; catalogue record, Beeld en Geluid Schatkamer, https://schatkamer.beeldengeluid.nl/serie/2101608030022686931/vips-eo/aflevering/2101608130109785931
- **Class:** retrospective (A TV interview with Jackie Pullinger in 1996, after the clearance: her words are retrospective (1996). Only the catalogue text (secondary) was read.)
- **Date of the record:** 1996-07-31
- **Note:** the reader classed the whole item as retrospective: its 6 facts are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

- **Leads:**
  - The video of VIPS (EO), 'Jackie Pullinger', 31 July 1996 (Beeld en Geluid, Out of Commerce): watch it for her own account of the City.
### gwulo-1: City of Darkness Revisited - a new edition of the Kowloon Walled City classic

- **Status:** Read on 2026-11-18; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** David (Gwulo), with text by Ian Lambot, 'City of Darkness Revisited - a new edition of the Kowloon Walled City classic', Gwulo: Old Hong Kong, 29 March 2014, with comments by vanessa (30 Mar 2014), harryhktc (31 Mar 2014), Admin for Bill Griffiths (1 Apr 2014), Lawrence Tsui (1 Apr 2014), tngan (12 Aug 2015) and others, https://gwulo.com/node/19487
- **Class:** retrospective (retrospective (2014): Ian Lambot's words on what he saw while he photographed the City (about 1985-1993), and the readers' own memories (1949 to the 1970s). Some comments are hearsay (marked secondary).)
- **Date of the record:** 2014-03-29 (comments to 2015-08-12)
- **Files:**
  - `gwulo-1-19487.html` (in `local/`, not in git): HTML of the post and its comments (short page); https://gwulo.com/node/19487; 69701 bytes; SHA-256 `f650b837ec504d7d269a499e5af65ec851fcb7497d39b0298b07f08e0acb8a76`; licence: No licence stated on the page (Gwulo and the writers) (https://gwulo.com/node/19487)
- **Note:** its 4 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| gwulo.com/node/19487, post, Lambot | Lambot first came to Hong Kong in 1979. | "I first arrived in Hong Kong in 1979" |
| gwulo.com/node/19487, post, Lambot | The alleys were dark and damp, with very many water pipes and electric cables overhead. | "dark and dank alleys, lined above with the innumerable water pipes and electricity cables" |
| gwulo.com/node/19487, post, Lambot | Nobody could tell which of the pipes still carried water. | "It became impossible to work out which pipe still held running water" |
| gwulo.com/node/19487, post, Lambot | In the alleys there were drips from unknown sources, and the floor was always slippery. | "run the gauntlet of unknown drips and ever slippery alleyways." |
| gwulo.com/node/19487, post, Lambot | Caged balconies covered almost every surface, mostly on the south and east faces of the City. | "on the Walled City's south and east elevations in particular" |
| gwulo.com/node/19487, post, Lambot | The cages had pale green or orange anti-rust paint. | "their coatings of pale green or orange anti-rust paint" |
| gwulo.com/node/19487, post, Lambot | Each maker and workshop had its own style of cage; some had curlicues, arches and geometric patterns. | "each fabricator and workshop had their own particular style" |
| gwulo.com/node/19487, post, Lambot | The balconies held washing put out to dry, buckets, storage boxes, and flower pots, some with living plants. | "Here among the invariable washing put out to dry, were buckets and storage boxes" |
| gwulo.com/node/19487, post, Lambot | The caged balconies were the part of the City that Lambot photographed most. | "the one aspect of the City I photographed more than any other" |
| gwulo.com/node/19487, post, Lambot | Lambot took the aerial photo one misty evening, in 1989 as he thinks. | "the aerial image I took one misty evening in, I think, 1989" |
| gwulo.com/node/19487, comment, vanessa, 30 Mar 2014 | INFERRED: In 1972 or 1973 a group of school pupils ('kgvers') visited after school. The City looked like a worse Sham Shui Po. Two men in flip-flops at the entrance told them where to go. INFERRED: 'kgvers' are King George V School pupils, and 'told us where to go' means they were sent away. | "two guys in flip flops who told us all where to go" |
| gwulo.com/node/19487, comment, harryhktc, 31 Mar 2014 | harryhktc went in regularly for work in the early 1960s: first with a local colleague, then alone once people knew he was not police or an informer. | "First with a local colleague then alone after it was established I was not a copper nor a nark." |
| gwulo.com/node/19487, comment, harryhktc, 31 Mar 2014 | In the early 1960s crumpled tinfoil, drinking straws and spent matches (drug-use litter) lay in the wet, dark alleys. | "Crumpled tinfoil, drinking straws and clumps of spent 'free' matches" |
| gwulo.com/node/19487, comment, harryhktc, 31 Mar 2014 | He remembers running rats, a smell of sewage worse than an open nullah, spit everywhere, and thin residents. | "scurrying rats and stench of sewage worse than an open nullah" |
| gwulo.com/node/19487, comment, harryhktc, 31 Mar 2014 | harryhktc: the City was not glamorous. | "There was nothing glam about the Walled City." |
| gwulo.com/node/19487, comment, Lawrence Tsui, 1 Apr 2014 | In the mid-1950s Lawrence Tsui, then a toddler, lived briefly at Carpenter Road (賈炳達道) / Junction Road (聯合道), on the edge of the City. He watched large police raids on drug divans; opium pipes and lamps lay in the street below his flat. | "opium guns and lights were laid out in the street below our apartment" |
| gwulo.com/node/19487, comment, Lawrence Tsui, 1 Apr 2014 | In the mid-1950s Junction Road (聯合道) was a dead end, where the Holy Family School was being built. | "Junction Rd was a dead end where the Holy Family School was being built" |
| gwulo.com/node/19487, comment, Lawrence Tsui, 1 Apr 2014 | In the 1970s Tsui went in as a policeman: raids on vice dens with the '633' HQ Vice Squad, and bringing Blue Berets to protect Housing Department demolition teams. | "bringing in some Blue Berets to protect Housing Department demolition teams" |
| gwulo.com/node/19487, comment, Lawrence Tsui, 1 Apr 2014 | INFERRED: Jackie Pullinger took Tsui (off duty) and a friend to an old house in the middle of the City; they sat, talked, prayed and sang hymns. Young triads watched as lookouts for the vice dens. INFERRED: the 1970s, from the context. | "young Triads who were obviously playing 'Observers' for the Vice Dens." |

- **Leads:**
  - Fiona Hawthorne's Facebook album of her drawings, watercolours and photos made in the City in the 1980s (linked by vanessa; needs a login).
  - The Chinese edition of City of Darkness Revisited (August 2015, soft cover; comment by tngan) and the blog rnbhk.wordpress.com with its editor's preface (2015).
### top-citations-6: Kowloon Walled City as urban border. Community-based home and neighborhood building: an interview with Greg Girard

- **Status:** Read on 2026-11-19; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Anna Vincenza Nufrio (Universidad de Cuenca), 'Kowloon Walled City as urban border. Community-based home and neighborhood building: an interview with Greg Girard', Arte y Sociedad. Revista de investigación (ASRI), no. 8, April 2015 (Servicios Académicos Intercontinentales SL; RePEc:erv:aysays:y:2015:i:8:11), https://www.eumed.net/rev/ays/8/greg-girard.html
- **Class:** retrospective (Girard's own answers on his work in the City from 1986: retrospective (2015). The introduction, abstract and footnotes are the interviewer's (secondary). Date conflict: 1986 (Girard) vs 1985-1993 (introduction).)
- **Date of the record:** 2015-04
- **Files:**
  - `top-citations-6-greg-girard.html` (in `local/`, not in git): HTML of the interview (short page); https://www.eumed.net/rev/ays/8/greg-girard.html; 31014 bytes; SHA-256 `28bdefa5e1732298015d929ea6cd279afe94f5097539e32c66ff945cd8ae9563`; licence: no licence statement on the page or on the RePEc record (https://www.eumed.net/rev/ays/8/greg-girard.html)
- **Note:** its 4 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| interview, answer to question 3 of 22 ('Could you tell us how you heard...') | Girard says that a person who lived in Hong Kong in the mid-1980s heard of the Walled City, and that it had a reputation as dirty, dark and dangerous. | "Living in Hong Kong in the mid 1980s one heard about the Walled City" |
| interview, answer to question 3 of 22 ('Could you tell us how you heard...') | He found it by accident one night in 1986, while he photographed in the streets near the old airport. | "I stumbled across it by accident one night in 1986 while photographing in the streets near the HK’s old airport in Kowloon." |
| interview, answers to questions 6 and 7 of 22 ('Was it difficult to get in touch...'; 'How much did you know about life...') | It took time before people let him into their homes and shops (question 6). At some point the residents saw that he was serious about a fair record of life there (question 7). | "It took time before people would agree to let me into their homes and shops" |
| interview, answers to questions 2 and 6 of 22 | When he first started to visit, the demolition had not been decreed (question 2). Access got easier after the government announced the demolition, and residents got used to visitors (question 6). | "things got easier after the government announced that the place would be demolished" |
| interview, answer to question 14 of 22 ('The meaning of "proximity" and "permeability"...') | The City marketed its spaces by conventional commercial and residential real-estate rules. | "The Walled City marketed its spaces according to very conventional commercial and residential real estate considerations" |
| interview, answer to question 14 of 22 ('The meaning of "proximity" and "permeability"...') | Commercial rents were higher for a shop with 'street' access on a well-travelled corridor. | "commercial rents were higher if a shop had "street" access along a well-traveled corridor" |
| interview, answer to question 14 of 22 ('The meaning of "proximity" and "permeability"...') | Residential rents were higher for a place with windows that gave fresh air and light. | "residential rents were higher if a place had windows allowing fresh air and light" |
| interview, answer to question 14 of 22 ('The meaning of "proximity" and "permeability"...') | On at least two of its sides, at street level, the City looked much like the dense neighbourhood round it: shops at street level with flats above. | "shops at street level with apartments above" |
| interview, answer to question 14 of 22 ('The meaning of "proximity" and "permeability"...') | People who lived nearby might visit the City for medical or dental care, because its doctors and dentists were cheaper: Hong Kong law did not regulate their practices. | "the Walled City’s doctors and dentists were cheaper, as their practices weren’t regulated by Hong Kong law." |
| interview, answer to question 12 of 22 ('Did you ever have the feeling...') | People moved into the City by choice: rent was cheaper, and one could work mostly without government and regulatory oversight. | "People moved into the Walled City by choice, rent was cheaper there" |
| interview, answer to question 12 of 22 ('Did you ever have the feeling...') | He says the residents were for the most part industrious immigrants from outside Hong Kong. | "the residents themselves were for the most part industrious immigrants from outside Hong Kong" |
| interview, answer to question 14 of 22 ('The meaning of "proximity" and "permeability"...') | Residents moved freely in the streets round the City, to shop and to meet people. | "residents moved freely around the neighboring streets, shopping and socializing" |
| interview, answer to question 13 of 22 ('Looking at your photos...') | Domestic, commercial and even industrial work happened in the same space: small hives of activity. | "the domestic and the commercial, or even industrial, taking place in the same space" |
| interview, answer to question 11 of 22 ('What would have you liked to photograph...') | He photographed there for five years and took few pictures of the demolition; the book has a single picture of it. | "I didn’t photograph much of the demolition." |
| interview, answer to question 11 of 22 ('What would have you liked to photograph...') | He wishes he had found the City earlier. | "I wish I had “discovered” it earlier than I did." |
| interview, answer to question 3 of 22 ('Could you tell us how you heard...') | Girard had photographed in Hong Kong since he moved there in 1982. | "So yes I had been photographing in Hong Kong since I moved there in 1982." |
| interview, answer to question 7 of 22 ('How much did you know about life...') | For the book, Girard and Ian Lambot hired an undergraduate of the University of Hong Kong, Emmy Lung, to compile interviews and personal histories of residents. | "we hired an undergrad student, Emmy Lung, from the University of HK to work with us, compiling interviews and personal histories of residents." |

- **Leads:**
  - Ian Lambot and Greg Girard, City of Darkness: Life in Kowloon Walled City (cited in footnote 2 as the 1999 paperback).
  - Other Girard interviews named by the finder: invisiblephotographer.asia (26 January 2017); asiasociety.org/node/901 (not opened).
  - The interviews and personal histories of residents that Emmy Lung, an HKU undergraduate, compiled for Girard and Lambot (answer to question 7); not seen.
### top-depictions-2: Conversations with Peter Yung (New Publication: The Dream of a Lost Traveller: The Films & Photography of Peter Yung)

- **Status:** Read on 2026-11-19; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Peter Yung, 'Conversations with Peter Yung', collated by Vinci To and Sai Yee, translated by Johnny Ko, in 'New Publication: The Dream of a Lost Traveller: The Films & Photography of Peter Yung', Hong Kong Film Archive e-Newsletter 74, More English translation, November 2015, PDF pp. 2-8 (City on pp. 4-5), https://www.filmarchive.gov.hk/documents/18995340/19057014/newsletter74_e-more-translation.pdf
- **Class:** retrospective (Yung's own account of 1974, from interviews of 1998 and 2014: retrospective (1998-2014). Long before 1985, but it gives the drug scene of the City in the 1970s.)
- **Date of the record:** interviews of 30 October 1998, 20 April, 26 July and 3 December 2014; published November 2015
- **Files:**
  - `top-depictions-2-newsletter74_e-more-translation.pdf` (in `local/`, not in git): PDF, 8 pages: HKFA e-Newsletter 74, More English translation (Peter Yung interview on pp. 2-8); https://www.filmarchive.gov.hk/documents/18995340/19057014/newsletter74_e-more-translation.pdf; 273951 bytes; SHA-256 `c9055da9b4982c372b0041a2cddf84c75d6a51d685f219a4a09988f8cdb140ca`; licence: © 2015 Hong Kong Film Archive, all rights reserved (https://www.filmarchive.gov.hk/documents/18995340/19057014/newsletter74_e-more-translation.pdf)
- **Note:** its 1 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| PDF p. 4 | In 1974 Peter Yung was assistant producer and photographer for a British TV documentary on the Narcotics Bureau, the Golden Triangle and Lo Hsing-han, filmed in Hong Kong. | "which was filmed in Hong Kong in 1974" |
| PDF p. 4 | Narcotics Bureau agents used hidden cameras to film drug trading and the faces of drug lords. Yung joined the six surveillance teams and filmed them for 18 months. | "Agents of the Narcotics Bureau had to use concealed cameras to record the trading of drugs and the faces of drug lords" |
| PDF p. 4 | The crew rented a shop space on High Street. The text does not say which district. | "We rented a shop space on High Street" |
| PDF p. 4 | INFERRED: A lady who did missionary work in Kowloon Walled City and helped drug addicts helped the crew to live in the area. She is not named. INFERRED: Jackie Pullinger, who did this work in the City from 1966. | "a lady who did missionary work in Kowloon Walled City and specialised in helping drug addicts" |
| PDF p. 4 | With her help the crew lived in the area and became friends with some of the main persons of the documentary. | "With her help, we came to live in the area and became friends with some of the documentary’s main characters." |
| PDF p. 4 | Junkies could be found everywhere in the City in those days, and they did not mind the camera. | "Junkies could be found everywhere in Kowloon Walled City back in those days" |
| PDF p. 4 | The addicts were always ready to go to jail; each one was used to going in and out of prison. | "Every one of them was used to walking in and out of prison." |
| PDF p. 4 | The crew did not pay the addicts. They ate and lived together for more than half a year, to earn their trust. | "We ate and lived together for over half a year." |
| PDF p. 4 | INFERRED: Twenty years later the crew filmed the same people again, to see how their lives had changed. INFERRED: about 1994; the film is not named. | "Twenty years later, we filmed the lives of those same people again." |
| PDF pp. 4-5 | The footage of the 18 months became the film Opium: The White Powder Opera (1976). | "those 18 months resulted in Opium: The White Powder Opera (1976)." |
| PDF p. 5 | Yung's fiction film The System (1979) drew on the cases of the same 18 months; the key witness of a big case became the character Brother Wah. The text does not say if it has scenes in the City. | "the key witness of one of the bigger cases who was transformed into Brother Wah in the movie" |
| PDF p. 4 | Adrian Cowell and Chris Menges worked on the 1974 documentary. | "I was acquainted with two very well-known filmmakers, Adrian Cowell and Chris Menges." |

- **Leads:**
  - The book The Dream of a Lost Traveller: The Films & Photography of Peter Yung (Hong Kong Film Archive, 2015), source of the excerpt.
  - The 1974 British TV documentary on the Narcotics Bureau, the Golden Triangle and Lo Hsing-han (Adrian Cowell, Chris Menges; title not given in the text).
  - Opium: The White Powder Opera (1976), from the same 18 months of footage (see top-depictions-3).
  - The re-filming of the same people 'twenty years later' (about 1994; title not given).
### blocked-c-16: If these walls could talk: Kowloon Walled City captured by photographers Ian Lambot, Greg Girard

- **Status:** Read on 2026-11-18; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Oliver Giles, 'If these walls could talk: Kowloon Walled City captured by photographers Ian Lambot, Greg Girard', Tatler Asia (web version of the Tatler Hong Kong feature of October 2019), 17 October 2019, https://www.tatlerasia.com/lifestyle/arts/kowloon-walled-city-photography-ian-lambot-greg-girards
- **Class:** retrospective (retrospective (2019): the memories of the two photographers, Greg Girard and Ian Lambot, in their own words. The frame, the numbers and the photo captions are the writer's narration (secondary). Keep in primary-sources/.)
- **Date of the record:** 2019-10-17
- **Note:** its 9 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| Tatler Asia web page, Girard quote | Greg Girard first came on the City by chance, one night in 1985. Before that he did not know what it looked like. CNN (2023, en-testimony-20) gives 1986 for his first visit. | "before I stumbled across it one night in 1985 I had no idea what it looked like." |
| Tatler Asia web page, Girard quote | Girard remembers the wet: water dripped everywhere, and tubes and wires ran overhead in the alleys. | "The wetness, water dripping everywhere; the tubing and wiring running overhead in the alleys;" |
| Tatler Asia web page, Girard quote | Girard remembers the sounds: air conditioners, televisions, radios, and the noise of workshops and small factories. | "The sounds from air conditioners, and televisions and radios, and the noise from workshops and small factories." |
| Tatler Asia web page, Girard quote | Girard remembers people at work in the City who made low-tech items such as rubber plungers and wooden rulers, and food factories. The checker saw the paragraph: it is Girard's quote. | "people at work producing low-tech items like rubber plungers or wooden rulers, food factories" |
| Tatler Asia web page, Girard quote | Girard remembers children on their way home from school, as part of the normal life that went on in the City. The checker saw the paragraph: it is Girard's quote. | "kids on their way home from school" |
| Tatler Asia web page, Girard quote | Girard remembers narrow alleys that ran into other narrow alleys, like a maze. | "the narrow alleys running into other narrow alleys; the maze-like quality of the place." |
| Tatler Asia web page, Lambot quote | Lambot says that the buildings had no foundations, and nobody knew what held the City up. | "There were no foundations. Nobody knew what was holding it up." |
| Tatler Asia web page, Lambot quote | Lambot remembers very small buildings with very small stairways. | "tiny, tiny buildings with tiny stairways." |
| Tatler Asia web page, Lambot quote | Lambot says that the triads never had a big hold on the City, against the popular belief. | "The triads had never really had a big hold there, contrary to popular belief," |
| Tatler Asia web page, Lambot quote | Lambot was never threatened, although he explored the darkest and narrowest alleys a lot. | "I was never, ever threatened and I spent a lot of time exploring down the darkest, narrowest alleys." |
| Tatler Asia web page, Lambot quote | When the two photographers started, people thought that they were mad to go into the City. | "People thought we were mad" |
| Tatler Asia web page, Girard quote | Girard did not think that the City should have been saved. But he wishes that a small part of it remained. | "A sliver, a shard, a corner." |

- **Leads:**
  - Blue Lotus Gallery, Sheung Wan: exhibition 'City of Darkness: Kowloon's Lost Walled City', 8 Nov - 8 Dec 2019; its list of prints gives photo titles with years (for example Standpipe #2, 1991; Barbecued Meat Factory, 1989).
### gap-named-persons-records-6: The Dawn of Crime - A Minister in The Kowloon Walled City

- **Status:** Partly read on 2026-11-18; a checker checked a sample of the facts on 2026-11-19. Audio only (51 min). I read the Apple Podcasts page and the iTunes lookup API record (description, date, length, feed). I cannot hear audio; there is no transcript. Her years in the City are not in the text. One web search found nothing more on her.
- **Citation:** Roy Maloy (host), interview with Jen Darlow, 'The Dawn of Crime - A Minister in The Kowloon Walled City', The Dawn of Crime by Roy Maloy (podcast, Anchor), 4 September 2020, 51 min, https://podcasts.apple.com/us/podcast/the-dawn-of-crime-a-minister-in-the-kowloon-walled-city/id1525098475?i=1000490126675
- **Class:** retrospective (retrospective (2020): Jen Darlow tells of her own time in the City, in the audio. Only the description was read.)
- **Date of the record:** 2020-09-04
- **Note:** the reader classed the whole item as retrospective: its 2 facts are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

- **Leads:**
  - The podcast RSS feed, https://anchor.fm/s/2b691858/podcast/rss, episode of 4 Sep 2020 (audio, 3,067 s): listen for Jen Darlow's years and work in the City.
### zh-testimony-8: 九龍城寨賠償方案不容兼申請公屋　74歲前業主提覆核挑戰「天條」

- **Status:** Read on 2026-11-18; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** 鄧宇詩 (reporter), 「九龍城寨賠償方案不容兼申請公屋　74歲前業主提覆核挑戰「天條」」, HK01 (香港01), 熱話, published 2023-08-28 00:01, updated 08:47, https://www.hk01.com/%E7%A4%BE%E6%9C%83%E6%96%B0%E8%81%9E/932266/%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E8%B3%A0%E5%84%9F%E6%96%B9%E6%A1%88%E4%B8%8D%E5%AE%B9%E5%85%BC%E7%94%B3%E8%AB%8B%E5%85%AC%E5%B1%8B-74%E6%AD%B2%E5%89%8D%E6%A5%AD%E4%B8%BB%E6%8F%90%E8%A6%86%E6%A0%B8%E6%8C%91%E6%88%B0-%E5%A4%A9%E6%A2%9D
- **Class:** retrospective (Retrospective (2023): the first-hand account of 許先生, who owned a flat in the City from the 1980s to the clearance. Most of it is the reporter's paraphrase (secondary); his direct words are few.)
- **Date of the record:** 2023-08-28 (published); memories of the 1980s and the early 1990s
- **Files:**
  - `zh-testimony-8-_-74_-_.html` (in `local/`, not in git): HTML of the article; https://www.hk01.com/%E7%A4%BE%E6%9C%83%E6%96%B0%E8%81%9E/932266/%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E8%B3%A0%E5%84%9F%E6%96%B9%E6%A1%88%E4%B8%8D%E5%AE%B9%E5%85%BC%E7%94%B3%E8%AB%8B%E5%85%AC%E5%B1%8B-74%E6%AD%B2%E5%89%8D%E6%A5%AD%E4%B8%BB%E6%8F%90%E8%A6%86%E6%A0%B8%E6%8C%91%E6%88%B0-%E5%A4%A9%E6%A2%9D; 510633 bytes; SHA-256 `ce715ffd0e915f71c5492dc4080ea21223618275d7111df7df8459f6335f8c4b`; licence: 香港01有限公司版權所有 © 2026 (site footer) (https://www.hk01.com/%E7%A4%BE%E6%9C%83%E6%96%B0%E8%81%9E/932266/%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E8%B3%A0%E5%84%9F%E6%96%B9%E6%A1%88%E4%B8%8D%E5%AE%B9%E5%85%BC%E7%94%B3%E8%AB%8B%E5%85%AC%E5%B1%8B-74%E6%AD%B2%E5%89%8D%E6%A5%AD%E4%B8%BB%E6%8F%90%E8%A6%86%E6%A0%B8%E6%8C%91%E6%88%B0-%E5%A4%A9%E6%A2%9D)
- **Note:** its 8 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| web page, section 「就條例提出司法覆核」 | He says that the compensation was about the same as the price he had paid for the flat. | "當時政府所謂市值嘅樓價補償同我以前買嘅樓價相若" (the government's so-called market-value compensation was about the same as the price I paid back then) |

- **Leads:**
  - Housing Authority, 《公共租住房屋申請須知》, paragraph 2.2.5(a): the rule on City clearance compensation
  - Oriental Daily News (東方日報), 2023-07-11, 「曾獲補償金禁申公屋 劏房翁申覆核」 (same case; not opened)
  - SCMP article 3232455 (same case, English; not opened)
### zh-testimony-5: 《九龍城寨》大熱 街坊見證變遷 原居民變富翁「有業主手持28幢獲巨額賠償後即移民」

- **Status:** Read on 2026-11-18; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** 付佳琪 (reporter), 「《九龍城寨》大熱 街坊見證變遷 原居民變富翁「有業主手持28幢獲巨額賠償後即移民」」, Sing Tao Headline (星島頭條), 財經 / 商業創科, published 2024-05-08 16:52 HKT, https://www.stheadline.com/realtime-finance/3342626/%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E5%A4%A7%E7%86%B1-%E8%A1%97%E5%9D%8A%E8%A6%8B%E8%AD%89%E8%AE%8A%E9%81%B7-%E5%8E%9F%E5%B1%85%E6%B0%91%E8%AE%8A%E5%AF%8C%E7%BF%81%E6%9C%89%E6%A5%AD%E4%B8%BB%E6%89%8B%E6%8C%8128%E5%B9%A2%E7%8D%B2%E5%B7%A8%E9%A1%8D%E8%B3%A0%E5%84%9F%E5%BE%8C%E5%8D%B3%E7%A7%BB%E6%B0%91
- **Class:** retrospective (Retrospective (2024), but only a small part is first-hand: 敏叔 (李昇敏) was a visitor, not a resident (he went in twice; one visit was in 1963), and his father had a workshop there from 1959. His figures and the compensation history are a park guide's general statements and the reporter's background, thus secondary. The first-hand part is from 1959-1963, long before the peak.)
- **Date of the record:** 2024-05-08 (published); memories of 1959-1963 and of the clearance
- **Files:**
  - `zh-testimony-5-_-_-_28_.html` (in `local/`, not in git): HTML of the article; https://www.stheadline.com/realtime-finance/3342626/%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E5%A4%A7%E7%86%B1-%E8%A1%97%E5%9D%8A%E8%A6%8B%E8%AD%89%E8%AE%8A%E9%81%B7-%E5%8E%9F%E5%B1%85%E6%B0%91%E8%AE%8A%E5%AF%8C%E7%BF%81%E6%9C%89%E6%A5%AD%E4%B8%BB%E6%89%8B%E6%8C%8128%E5%B9%A2%E7%8D%B2%E5%B7%A8%E9%A1%8D%E8%B3%A0%E5%84%9F%E5%BE%8C%E5%8D%B3%E7%A7%BB%E6%B0%91; 230138 bytes; SHA-256 `3dbd284201bac2ffcd8560edf84edf72a5b1e8b209ea497f51437f7bdeee121e`; licence: Copyright © 2026 SingTao Ltd. All rights reserved. (site footer) (https://www.stheadline.com/realtime-finance/3342626/%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E5%A4%A7%E7%86%B1-%E8%A1%97%E5%9D%8A%E8%A6%8B%E8%AD%89%E8%AE%8A%E9%81%B7-%E5%8E%9F%E5%B1%85%E6%B0%91%E8%AE%8A%E5%AF%8C%E7%BF%81%E6%9C%89%E6%A5%AD%E4%B8%BB%E6%89%8B%E6%8C%8128%E5%B9%A2%E7%8D%B2%E5%B7%A8%E9%A1%8D%E8%B3%A0%E5%84%9F%E5%BE%8C%E5%8D%B3%E7%A7%BB%E6%B0%91)
- **Note:** its 11 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| web page, lead paragraph | He says that the film is wrong and exaggerated, and that the residents got on well together. | "這裏的居民相處都很融洽" (the residents here got along very well) |
| web page, section 「樓房距離很近 被稱「握手樓」」 | He says that the buildings had no piles, had only three walls, and kept growing upward. | "沒打樁，都只有3面墻，還不停往上搭建" (no piles, all with only 3 walls, and kept being built upward) |
| web page, section 「有大業主獲賠償後 隨即移民」, paragraph 1 | He says that a man he knew had owned 28 buildings in the City, took a large payout and soon emigrated as an investment immigrant (not checked). | "他當年就拿了一大堆金錢，清拆後馬上搞投資移民，移居到外國。" (he took a huge pile of money back then and right after the clearance emigrated abroad as an investor.) |
| web page, section 「有大業主獲賠償後 隨即移民」, paragraph 3 | He says that rich builders feared they would get no compensation, and urged residents to chain themselves to pillars with kerosene or LPG in front of them, ready to set it alight (his claim; not checked). | "如果有人要來動你，你就點火" (if anyone comes to move you, you light it) |

- **Leads:**
  - 星島頭條, 「九龍城寨昔日三不管經濟圈 外銷魚蛋 平價鑲牙 如今變成「小泰國」」 (related article linked at the foot; not opened)
### zh-testimony-2: 【香港角落】九龍城寨之圍城：跟末代城寨居民講故遊昔日三不管地帶

- **Status:** Read on 2026-11-17; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Hoiyan (text), Andrew and Hoiyan (photos), Kayan (design), 「【香港角落】九龍城寨之圍城：跟末代城寨居民講故遊昔日三不管地帶」, ACOO (acoo.hk), 2024-05-10, https://www.acoo.hk/acoohkcorner/%E3%80%90%E9%A6%99%E6%B8%AF%E8%A7%92%E8%90%BD%E3%80%91%E8%B7%9F%E6%9C%AB%E4%BB%A3%E5%9F%8E%E5%AF%A8%E5%B1%85%E6%B0%91%E8%AC%9B%E6%95%85%E9%81%8A%E6%98%94%E6%97%A5%E4%B8%89%E4%B8%8D%E7%AE%A1%E5%9C%B0/
- **Class:** retrospective (Retrospective (2024): the first-hand account of 吳先生, a resident from about 1972 (age 4-5). The writer says that he lived there about 10 years (thus about 1972-1982), but also that he watched the planes from the roofs until the City was cleared and he moved out, and the title calls him one of the last residents (末代城寨居民). Thus his years can be about 1972-1982 or about 1972 to the clearance (1987-1992); the article does not settle it. The narration of the writer is secondary.)
- **Date of the record:** 2024-05-10 (published); testimony about c.1972 on (to c.1982, or to the clearance; see cls_note)
- **Files:**
  - `zh-testimony-2-page.html` (in `local/`, not in git): HTML of the article; https://www.acoo.hk/acoohkcorner/%E3%80%90%E9%A6%99%E6%B8%AF%E8%A7%92%E8%90%BD%E3%80%91%E8%B7%9F%E6%9C%AB%E4%BB%A3%E5%9F%8E%E5%AF%A8%E5%B1%85%E6%B0%91%E8%AC%9B%E6%95%85%E9%81%8A%E6%98%94%E6%97%A5%E4%B8%89%E4%B8%8D%E7%AE%A1%E5%9C%B0/; 188015 bytes; SHA-256 `2f38c13a207ec251b653d12947501eba4fada64f3684a6e96ba76718e3cd7a26`; licence: No licence statement on the page (© ACOO assumed) (https://www.acoo.hk/acoohkcorner/%E3%80%90%E9%A6%99%E6%B8%AF%E8%A7%92%E8%90%BD%E3%80%91%E8%B7%9F%E6%9C%AB%E4%BB%A3%E5%9F%8E%E5%AF%A8%E5%B1%85%E6%B0%91%E8%AC%9B%E6%95%85%E9%81%8A%E6%98%94%E6%97%A5%E4%B8%89%E4%B8%8D%E7%AE%A1%E5%9C%B0/)
- **Note:** its 10 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| web page (one page) | 吳先生 lived in the City from about 1972, when he was about 4 or 5. | "我1972年左右已經喺城寨住" (I was already living in the Walled City around 1972) |
| web page (one page) | His mother said that the flat cost about HK$1,200. | "聽我媽講好似1200蚊" (I heard my mother say it was about 1,200 dollars) |
| web page (one page) | A month's wage was then about HK$180 and a bit. | "嗰陣一個月人工大概180幾蚊" (back then a month's wage was about 180-odd dollars) |
| web page (one page) | A normal window could open less than a third, because the next building was so close. | "如果正常一隻窗，你係開唔到三分一" (if it is a normal window, you can't open it a third) |
| web page (one page) | A neighbour could reach a hand into the kitchen of the next building. | "伸手去人哋廚房拎都得" (you could reach out and take things from someone else's kitchen) |
| web page (one page) | He says that from the roof of a building at the 東頭村 end you could jump from roof to roof as far as 賈炳達道, without going down to the street. | "可以喺東頭村某棟大廈天台，跳、跳、跳就到賈炳達道，唔使經地下。" (from the roof of a building at 東頭村 you could jump, jump, jump and reach 賈炳達道, without going via the ground.) |
| web page (one page) | Rats walked on the beams of the home but did not often come into the rooms. | "老鼠仔會喺屋企嘅橫樑上面行" (little rats would walk on the beams of the home) |
| web page (one page) | About 90% of the homes used dry toilets (night soil). | "9成住宅都係用乾廁" (90% of homes used dry toilets) |
| web page (one page) | Each home had two pots; at about 7 or 8 pm the residents went down to empty them into large central barrels. | "夜晚大約7、8點就落街倒落集中嘅大桶" (at about 7 or 8 at night go downstairs and pour it into the central big barrels) |
| web page (one page) | Later, water pipes were connected by tapping the government mains without permission. | "喺政府喉度分喉出嚟畀你" (branch a pipe off the government main for you) |
| web page (one page) | There was no water bill, but the residents paid a fee to the person who connected the pipe. | "但係你駁喉都已經收咗錢" (but you already paid money for the pipe connection) |
| web page (one page) | Workshops for sweets (malt sugar, candy floss, sesame and peanut sweets) worked beside the heroin stalls. | "一邊做糖膠、打棉貽、整糖酥糖嗰啲" (on one side making malt candy, candy floss, sugar-crisp sweets and such) |
| web page (one page) | The heroin stalls gave candles and matchboxes, and a worker injected customers whose hands shook. | "又有蠟燭、火柴盒供應" (also supplied candles and matchboxes) |
| web page (one page) | Unlicensed doctors could work inside the City but not outside. | "無牌行醫喺城寨做得，出面唔做得" (unlicensed practice was possible in the Walled City, not outside) |
| web page (one page) | Nobody dared to sell fake medicine in the City. | "冇人夠膽喺入面賣假藥" (nobody dared to sell fake medicine inside) |
| web page (one page) | The doctors could not get a Hong Kong licence; people called them 黃綠 (quacks). | "因為拎唔到牌，即係所謂嘅黃綠" (because they couldn't get a licence, the so-called 'quacks') |
| web page (one page) | He says that the City was once famous for its toilet pumps (plungers). | "以前最出名係出廁所泵" (in the past it was most famous for producing toilet plungers) |
### film-12: Kowloon Walled City: tales from Hong Kong's 'City of Darkness'

- **Status:** Partly read on 2026-11-18; a checker checked a sample of the facts on 2026-11-19. I read the video page with WebFetch: title, date, length, bylines and summary. I cannot watch video, the page has no transcript and does not name the speakers. The companion SCMP article (3262414) gave HTTP 403. A web search did not find a YouTube copy.
- **Citation:** Bryan Wood and Sophie Li (bylines), 'Kowloon Walled City: tales from Hong Kong's 'City of Darkness'' (video title 'Remembering Hong Kong's 'City of Darkness''), South China Morning Post video, 22 May 2024 18:25, 11 min 33 s, https://www.scmp.com/video/hong-kong/3262043/kowloon-walled-city-tales-hong-kongs-city-darkness
- **Class:** retrospective (retrospective (2024): the page says that former residents tell their memories. I could not check this, nor name them.)
- **Date of the record:** 2024-05-22
- **Note:** the reader classed the whole item as retrospective: its 2 facts are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

- **Leads:**
  - SCMP article 'Kowloon Walled City: tales from Hong Kong's 'City of Darkness'', https://www.scmp.com/news/hong-kong/article/3262414/kowloon-walled-city-tales-hong-kongs-city-darkness (May 2024; HTTP 403 to the tool): it probably names the speakers of the video.
### zh-testimony-15: 「城寨」當年的警政

- **Status:** Read on 2026-11-20; a checker checked a sample of the facts on 2026-11-20.
- **Citation:** 微塵, 「城寨」當年的警政, blog, HKGPAO.com, 23 May 2024, https://www.hkgpao.com/articles/1035604
- **Class:** retrospective (Retrospective (2024): memories of a police officer born in the City in the late 1950s and of a member of the 巡城隊 of the 1970s-1980s, relayed by the blogger; the blogger's own history is secondary.)
- **Date of the record:** 2024-05-23
- **Files:**
  - `zh-testimony-15-1035604-f8a2c304.html` (in `local/`, not in git): HTML of the blog post (short page); https://www.hkgpao.com/articles/1035604; 91620 bytes; SHA-256 `d7a8fcda28e06ebee73a682a12c53ee27362c795e0d1f7794a50ad2e5e861398`; licence: no licence stated; footer 'HKGPAO.COM LIMITED' (https://www.hkgpao.com/articles/1035604)
- **Note:** its 3 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| para. 6 | INFERRED: A police officer was born in the City in the late 1950s and lived there until he was 24 (INFERRED: to about the early 1980s). | "他在50年代末在城寨出生，直至24歲才搬離" (he was born in the City in the late 1950s and did not move out until he was 24) |
| para. 6 | The City had two wells, where residents washed clothes. | "城寨內有兩口井，也是居民洗衣服的地方" (inside the City there were two wells, which were also where residents washed clothes) |
| para. 6 | He says that tap water and electricity were not lacking. | "自來水及電力亦不缺" (tap water and electricity were not lacking either) |
| para. 6 | Vice was common: opium stalls, live sex shows and blue films were the most usual, but they declined in the early 1970s. | "最普遍是「鴉片煙檔」、「真人騷」及「小電影」…但在70年代初已告式微" (most common were opium stalls, live shows and blue films ... but by the early 1970s they had declined) |
| para. 6 | There were many unlicensed dentists and Western-style doctors, but accidents were almost unknown. | "也有不少沒有牌照的牙醫及西醫，但出事則絕無僅有" (there were also many unlicensed dentists and Western doctors, but incidents were extremely rare) |
| para. 8 | A former member of the 巡城隊 (City patrol team, 1970s-1980s) says that vice arrests in the City were tried at the 新蒲崗 magistracy (新蒲崗裁判法院). | "在城寨內拘捕的「黃賭毒」案件，也會在新蒲崗裁判法院審理" (vice, gambling and drug cases arrested in the City were also tried at the 新蒲崗 magistrates' court) |

- **Leads:**
  - Sing Tao (星島日報) online article https://std.stheadline.com/realtime/article/1996881/ , credited as the source of the image ('原圖：星島日報'); not opened.
### missions-27: 九龍城廣場簡約「城寨展」 舊街坊駐足懷緬：起碼畀人知道吓

- **Status:** Read on 2026-11-18; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Inmedia (獨立媒體), 「九龍城廣場簡約「城寨展」 舊街坊駐足懷緬：起碼畀人知道吓」, Yahoo新聞 Hong Kong, 24 May 2024 08:18, https://hk.news.yahoo.com/%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%BB%A3%E5%A0%B4%E7%B0%A1%E7%B4%84%E3%80%8C%E5%9F%8E%E5%AF%A8%E5%B1%95%E3%80%8D-%E8%88%8A%E8%A1%97%E5%9D%8A%E9%A7%90%E8%B6%B3%E6%87%B7%E7%B7%AC%EF%BC%9A%E8%B5%B7%E7%A2%BC%E7%95%80%E4%BA%BA%E7%9F%A5%E9%81%93%E5%90%93-121807512.html
- **Class:** retrospective (retrospective (2024): two old 街坊 tell their memories, but the reporter gives them mostly in indirect speech (secondary); only short phrases are their own words.)
- **Date of the record:** 2024-05-24
- **Note:** its 9 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| Yahoo copy of the 獨立媒體 report | At the clearance he thought it better to leave early. Then the family moved to private housing. | 「早走早著」 ('The earlier you leave, the better.') |
### zh-testimony-3: 九龍城寨小學有人未遺忘　城外人分享衝進去回憶：細細個入去做暑期工｜Yahoo

- **Status:** Read on 2026-11-17; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** 鄭美姿 (reporter), Nasha Chan (photos), 「九龍城寨小學有人未遺忘　城外人分享衝進去回憶：細細個入去做暑期工｜Yahoo」, Yahoo News Hong Kong (Yahoo新聞), 2024-06-03, https://hk.news.yahoo.com/%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E5%B0%8F%E5%AD%B8%E6%9C%89%E4%BA%BA%E6%9C%AA%E9%81%BA%E5%BF%98-%E5%9F%8E%E5%A4%96%E4%BA%BA%E5%88%86%E4%BA%AB%E8%A1%9D%E9%80%B2%E5%8E%BB%E5%9B%9E%E6%86%B6%EF%BC%9A%E7%B4%B0%E7%B4%B0%E5%80%8B%E5%85%A5%E5%8E%BB%E5%81%9A%E6%9A%91%E6%9C%9F%E5%B7%A5%EF%BD%9Cyahoo-044830368.html
- **Class:** retrospective (Retrospective (2024): the first-hand account of 阿平, who lived outside the City but worked each summer in a factory inside it, in the 1970s (to 1979). The narration and the school background are secondary.)
- **Date of the record:** 2024-06-03 (published); testimony about the 1970s
- **Files:**
  - `zh-testimony-3-_-_yahoo-044830368.html` (in `local/`, not in git): HTML of the article; https://hk.news.yahoo.com/%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E5%B0%8F%E5%AD%B8%E6%9C%89%E4%BA%BA%E6%9C%AA%E9%81%BA%E5%BF%98-%E5%9F%8E%E5%A4%96%E4%BA%BA%E5%88%86%E4%BA%AB%E8%A1%9D%E9%80%B2%E5%8E%BB%E5%9B%9E%E6%86%B6%EF%BC%9A%E7%B4%B0%E7%B4%B0%E5%80%8B%E5%85%A5%E5%8E%BB%E5%81%9A%E6%9A%91%E6%9C%9F%E5%B7%A5%EF%BD%9Cyahoo-044830368.html; 428633 bytes; SHA-256 `4d2ce8efbae13592921681035966a76b8c41e03a2ccdcd7e3bd5c325deaa61a1`; licence: © 2026 Yahoo. All rights reserved. (site footer) (https://hk.news.yahoo.com/%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E5%B0%8F%E5%AD%B8%E6%9C%89%E4%BA%BA%E6%9C%AA%E9%81%BA%E5%BF%98-%E5%9F%8E%E5%A4%96%E4%BA%BA%E5%88%86%E4%BA%AB%E8%A1%9D%E9%80%B2%E5%8E%BB%E5%9B%9E%E6%86%B6%EF%BC%9A%E7%B4%B0%E7%B4%B0%E5%80%8B%E5%85%A5%E5%8E%BB%E5%81%9A%E6%9A%91%E6%9C%9F%E5%B7%A5%EF%BD%9Cyahoo-044830368.html)
- **Note:** its 18 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| web page | His aunt had a plastics factory in the City that moulded toys. | "我伯娘在城寨開塑膠廠啤玩具" (my aunt ran a plastics factory in the Walled City moulding toys) |
| web page | He worked there each summer from Primary 4 to the summer before Form 1, four summers in all. | "我小學四年級開始，直到中一暑假" (from Primary 4 until the Form 1 summer holiday) |
| web page | The factory made plastic dolls and toy guns. | "啤膠公仔、膠槍等" (moulding plastic dolls, plastic guns, etc.) |
| web page | His job was to tear the gun shells and parts out of the plastic moulds. | "要把槍殻、零件自膠模中撕出來" (had to tear gun shells and parts out of the plastic moulds) |
| web page | The moulding machines were very loud and never stopped. | "啤機聲好嘈好嘈，從不間斷" (the moulding machines were very, very noisy, never stopping) |
| web page | He always entered the City by 光明街. | "光明街是我入寨的必經之路" (Kwong Ming Street was my necessary way into the Walled City) |
| web page | Each summer there were four or five 'burning wire' fires. | "總會發生四、五次「燒電線」事件" (there would always be four or five 'burning wire' incidents) |
| web page | At each alarm, everybody ran to the 東頭村道 entrance to wait. | "全部人跑去東頭村道那個入口位迴避" (everyone ran to the Tung Tau Tsuen Road entrance to take shelter) |
| web page | Patriots who came from the mainland set up 城寨坊眾學校. | "那間學校是當年大陸來港的愛國份子成立" (that school was set up by patriots who came to Hong Kong from the mainland) |
| web page | Its teachers had taught in the mainland and had no Hong Kong teaching licence. | "老師在大陸教書，來港後沒教師牌" (teachers taught in the mainland and had no teaching licence after coming to HK) |
| web page, opening section (before 「黑暗裏的光明街」) | 阿平 knew only the part of the City near the 東頭村道 entrance. From 橫頭磡 he walked through 摩士公園 to 美東邨, crossed the road, and came to 東頭村道. | "橫頭磡穿過摩士公園，去到美東邨過馬路，就是東頭村道。" (from 橫頭磡 through 摩士公園 to 美東邨, cross the road, and that is 東頭村道.) |
| web page, section 「黑暗裏的光明街」 | Almost all the buildings of the City were linked: the stairs to his aunt's factory also led on to the lobby of the next building. | "城寨的大廈幾乎全部互通。行樓梯去伯娘間廠，條樓梯又會通到去隔離大廈的 Lobby" (the City's buildings were almost all linked. The stairs to my aunt's factory also led to the lobby of the next building) |
| web page, section 「肥老闆的歡樂餅家」 | Before you reached the bakery 歡樂餅家 you smelled a very sweet smell of butter and coconut. | "未行到去餅家，而聞到一陣好甜好甜的味道，是牛油味，加上椰子味" (before you got to the bakery you smelled a very, very sweet smell, butter with coconut) |
| web page, section 「肥老闆的歡樂餅家」 | The owner of the bakery was a very fat man who half lay in a canvas chair, sometimes in a vest, sometimes bare-chested. | "老闆是個大肥佬，有時穿背心，有時赤膊，半躺在帆布椅上。" (the owner was a big fat man, sometimes in a vest, sometimes bare-chested, half lying in a canvas chair.) |
| web page, section 「肥老闆的歡樂餅家」 | He often bought 雞仔餅 at the bakery. | "經常在那裏買雞仔餅" (often bought 雞仔餅 there) |
| web page, section 「肥老闆的歡樂餅家」 | In the lanes water dripped on your head and face. It ran down the refuse and rags that hung on the electric wires overhead. | "電線上總勾着很多垃圾、爛布，滴水就是沿著這些東西滴下來，好污糟。" (lots of refuse and rags always hung on the wires, and the drips ran down them; very dirty.) |
| web page, section 「肥老闆的歡樂餅家」 | Everyone in the City spoke the local speech (本地話), but in the 1970s there were many new immigrants, and many accents were off. Thus nobody judged a person as a local or a new immigrant by accent. | "大家都是講本地話，七幾年香港有好多新移民，所以口音都係歪歪地" (everyone spoke the local speech; in the '70s Hong Kong had many new immigrants, so accents were all a bit off) |
| web page, section 「肥老闆的歡樂餅家」 | He remembers prostitutes standing at doorways. They were not revealingly dressed and were somewhat older. | "記得有妓女站在門口的畫面，穿衣並不暴露，也是有點年紀的。" (I remember prostitutes standing at the doors; their clothes were not revealing, and they were somewhat older.) |
| web page, section 「肥老闆的歡樂餅家」 | He remembers the tattoos of big strong men: crude blotches, not as fine as today's. | "紋身不如現在的咁靚，好唔 organized，一撻撻咁。" (the tattoos were not as nice as now, very un-organized, in blotches.) |
| web page, section 「肥老闆的歡樂餅家」 | He saw men come down the stairs and put small packets of heroin into their mouths for the moment. He saw many addicts with black legs. | "見到男人在樓梯走下來，把小包白粉暫且塞入口中，看見很多道友的腿是黑色的。" (I saw men come down the stairs and stuff small packets of white powder into their mouths for the moment; I saw many addicts whose legs were black.) |
| web page, section 「誰會入讀城寨的學校」 | His father thought that local schools had many delinquents, and that the boys of the City school had better character, all with shaved heads. | "我爸覺得本地學校多飛仔，城寨男仔品格仲好，個個飛到光頭仔咁。" (my dad thought the local schools had many delinquents; the City boys had better character, all with heads shaved bald.) |

- **Leads:**
  - RTHK (香港電台)《鏗鏘集》〈城寨〉, source of screenshots in the article (date not given)
  - The hand-drawn map of the factories on 光明街 that the article cites (maker and place not checked)
### repo-audit-26: 市民旅客看城寨電影場景

- **Status:** Read on 2026-11-17; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** 朱慧怡, '市民旅客看城寨電影場景', 香港文匯報 (Wen Wei Po), 7 October 2024, https://www.wenweipo.com/a/202410/07/AP6703ee26e4b0379ce1054821.html
- **Class:** retrospective (A news report that quotes a former resident, 陳先生 (over 60), in 2024: his words are retrospective (2024); the report is secondary. No years of residence are given.)
- **Date of the record:** 2024-10-07
- **Note:** its 1 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| article | The building had more than ten floors but no lift. | "樓有十多層高，但卻無電梯。" (The building was more than ten storeys high, but had no lift.) |
| article | The rent was cheap because there was no lift, but water cost HK$50 a month extra. He heard that private contractors ran the water meters in the City. | "房租特別便宜，惟水費每月另外需要交50元，據說是城寨內的水錶是由私人承包。" (The rent was especially cheap, but water cost $50 a month extra; it is said the water meters in the City were privately contracted.) |
| article | Before he went home he phoned his family to ask what food or daily goods to buy, to save trips up the stairs. | "每次回家前都會打電話給家人，看看還有什麼食品或日用品東西需要購置。" (Each time before going home he phoned his family to see what food or daily goods were needed.) |
### en-testimony-2: A fortress in the metaverse

- **Status:** Read on 2026-11-18; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Oasis Hu, 'A fortress in the metaverse', China Daily Hong Kong, 4 December 2024 09:56 (updated 17 December 2024), https://www.chinadailyhk.com/article/599329
- **Class:** retrospective (retrospective (2024) for the former resident Yim Chiu-tong, but the reporter gives most of his account in narration; only a few sentences are his direct words (marked primary). His years are the 1970s, before the peak. The main subject of the article is a game (a digital reconstruction), which is secondary.)
- **Date of the record:** 2024-12-04
- **Files:**
  - not downloaded (curl exit 28): Print page PDF of China Daily (4 December 2024), said by the finder to hold this article. I did not open it: it is larger than 10 MB (size not known; check it is under 30 MB).; https://www.chinadailyasia.com/upload/main/pdf/2024/12/04/503638fee43fce1e74120a324126c711.pdf; licence: © China Daily (no open licence stated) (https://www.chinadailyhk.com/article/599329)
- **Note:** its 15 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| chinadailyhk.com article 599329, Yim quote | Yim could put his hand through his window and shake hands with the people in the next building. | "I could extend my hand through the window and shake hands with residents in an adjacent building" |
| chinadailyhk.com article 599329, Yim quote | Yim says that he paid no rent and that the cost of living was low. This was his reason, and that of many others, to live in the City. | "You didn't have to pay rent. The cost of living was low." |
| chinadailyhk.com article 599329, Yim quote | The criminals did not interfere with ordinary residents, and the residents kept away from them. | "The criminals refrained from meddling with us, and we kept a distance from them" |
### zh-testimony-7: 陳慎芝專訪｜見證九龍城寨人間地獄　「狗同老鼠都有毒癮」

- **Status:** Read on 2026-11-18; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** 許育民 (reporter), 「陳慎芝專訪｜見證九龍城寨人間地獄　「狗同老鼠都有毒癮」」, HK01 (香港01), 電影, published 2025-01-19 08:00, updated 2025-01-27, https://www.hk01.com/%E9%9B%BB%E5%BD%B1/1095152/%E9%99%B3%E6%85%8E%E8%8A%9D%E5%B0%88%E8%A8%AA-%E8%A6%8B%E8%AD%89%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E4%BA%BA%E9%96%93%E5%9C%B0%E7%8D%84-%E7%8B%97%E5%90%8C%E8%80%81%E9%BC%A0%E9%83%BD%E6%9C%89%E6%AF%92%E7%99%AE
- **Class:** retrospective (Retrospective (2025): 陳慎芝's first-hand account of his three years (1972-74) as a stall master in the City's drug trade. This is before the police raids of the mid-1970s and before the peak period.)
- **Date of the record:** 2025-01-19 (published); memories of 1972-1974 and of a later film shoot
- **Files:**
  - `zh-testimony-7-_-_-_.html` (in `local/`, not in git): HTML of the article; https://www.hk01.com/%E9%9B%BB%E5%BD%B1/1095152/%E9%99%B3%E6%85%8E%E8%8A%9D%E5%B0%88%E8%A8%AA-%E8%A6%8B%E8%AD%89%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E4%BA%BA%E9%96%93%E5%9C%B0%E7%8D%84-%E7%8B%97%E5%90%8C%E8%80%81%E9%BC%A0%E9%83%BD%E6%9C%89%E6%AF%92%E7%99%AE; 492225 bytes; SHA-256 `d931402d020f458532acdc43fc427a0d472de5c7182184c449e45f9092d72fd7`; licence: 香港01有限公司版權所有 © 2026 (site footer) (https://www.hk01.com/%E9%9B%BB%E5%BD%B1/1095152/%E9%99%B3%E6%85%8E%E8%8A%9D%E5%B0%88%E8%A8%AA-%E8%A6%8B%E8%AD%89%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E4%BA%BA%E9%96%93%E5%9C%B0%E7%8D%84-%E7%8B%97%E5%90%8C%E8%80%81%E9%BC%A0%E9%83%BD%E6%9C%89%E6%AF%92%E7%99%AE)
- **Note:** its 7 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| web page, section 「《城寨》有張力，但冇揭秘性」 | When you went in, there were hundreds of people inside, divided by triad society (字頭). | "你一進去有幾百人在入面，分開各個字頭" (as soon as you go in there are several hundred people inside, divided into the various triad groups) |
| web page, section 「《城寨》有張力，但冇揭秘性」 | Each stall (棚) had its own unit. He was in the first row, as the stall master there. | "每個棚有個單位，我是第一排，代表那裡做棚主" (each stall had a unit; I was in the first row, the stall master there) |
| web page, section 「《城寨》有張力，但冇揭秘性」 | A boss (話事人) later made him a patrolman to keep order as well, for HK$30 a day, in 1972, 1973 and 1974. | "後來有位話事人叫我兼任巡場維持秩序，30元一日，做了72、73、74三年" (later a boss asked me to also patrol and keep order, $30 a day; I did it three years, '72, '73, '74) |
| web page, section 「明星和尚齊追龍」 | At about 1 or 2 am a customer woke him, bought a large portion and asked him to 'chase the dragon' for him first; he says it was a famous film actor of the time. | "有一次半夜點幾兩點，突然有人叫我︰『老友、 老友』" (once at one or two in the middle of the night, someone suddenly called me: 'pal, pal') |
| web page, section 「明星和尚齊追龍」 | A customer smoked in his stall until he fell asleep. As stall master he had to wake customers so that others could take their place. When he pushed this man's head, the hair fell off: the man was a monk. | "我有責任叫他快點吸完走，讓位給其他客人" (it was my duty to tell him to finish quickly and leave, to make room for other customers) |
| web page, section 「馬騮、狗、老鼠都染上毒癮」 | A customer brought a monkey and blew smoke at it. The man trained it to climb high and steal watches and money; the addiction made it easy to control. | "有位客人帶隻馬騮來食" (a customer brought a monkey along to smoke) |
| web page, section 「馬騮、狗、老鼠都染上毒癮」 | Later he took the RTHK producer 馮意清 into the City to film the drama 《香港香港》. They filmed a big rat that walked about without fear of people, craving the drug because no one was smoking (year not given). | "我見到一隻大老鼠，不怕人的周圍走" (I saw a big rat walking around, not afraid of people) |
| web page, section 「愛粉唔愛命」 | The City was low-lying and flooded whenever it rained. | "九龍城寨是低窪地帶，一下雨便水浸" (the Walled City was low-lying; as soon as it rained it flooded) |
| web page, section 「愛粉唔愛命」 | In a flood the sellers were meant to move to the back lane of Sa Po Road (沙埔道), but news travelled slowly, so they went on selling with the goods floating on a plastic tray. | "理應要搬上沙埔道的後巷賣，但通訊不發達未能及時通報，索性用個膠盤浮在水中繼續賣" (should have moved up to the back lane of Sa Po Road to sell, but communications were poor, so they just floated a plastic tray in the water and kept selling) |
| web page, section 「愛粉唔愛命」 | An old man who had bought goods fell into the flood water and was soaked, but held his hand up high to keep the drug dry. | "但他的手仍牢記要舉高，死都保護件貨不要濕" (but his hand still remembered to stay raised, protecting the goods from getting wet at all costs) |

- **Leads:**
  - 陳慎芝's autobiography (title not given in the article; its cover shows the City)
  - RTHK (香港電台) drama 《香港香港》, producer 馮意清, with scenes filmed in the City with 陳慎芝 (year not given)
  - Films on his life: 《慈雲山十三太保》 and 《毒‧誡》 (the article says 《毒‧誡》 made its City scenes by computer)
### top-zh-testimony-1: 《九龍城寨之圍城》城寨人親揭當中秘聞丨電影人的傳承故事丨住足十幾年城寨有聽過槍聲？大廈穿插會迷路？大井街排隊打水之謎

- **Status:** Read on 2026-11-18; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** 娛樂咁樣睇 (YouTube channel @Usdramalover, host not named), 「《九龍城寨之圍城》城寨人親揭當中秘聞丨電影人的傳承故事丨住足十幾年城寨有聽過槍聲？大廈穿插會迷路？大井街排隊打水之謎」, YouTube, published 2024-05-04, 24:57, https://www.youtube.com/watch?v=2mpctV0Rlbg
- **Class:** retrospective (Retrospective (2024): the host's own memories of his childhood home in the City through the 1980s (the peak period), given in a film review. The parts about the film are not about the City.)
- **Date of the record:** 2024-05-04 (published); memories of the 1980s
- **Note:** its 1 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| transcript (YouTube auto captions, zh-HK) 0:21-0:30 | The host says that he lived in the City for more than ten years. | "我身為一個住在城寨十幾年" (I, as someone who lived in the City for more than ten years) |
| transcript (YouTube auto captions, zh-HK) 20:26-20:34 | He says that he lived in the City for the whole of the 1980s. | "成個80年代都是在城寨住" (lived in the City through the whole 1980s) |
| transcript (YouTube auto captions, zh-HK) 24:30-24:39 | INFERRED: He lived at 147 Lung Chun Road (龍津道), on the 4th floor of the building next to Tai Chang Street (大井街), in the back block (後座). The number and the floor come from the auto captions (INFERRED: not checked against the sound). | "我當年是住在 龍津道147號在 大井街隔籬那棟大厦的四樓" (back then I lived at 147 Lung Chun Road, on the 4th floor of the building beside Tai Chang Street) |
| transcript (YouTube auto captions, zh-HK) 3:16-3:31 | From the window of his home he looked out on the well of Tai Chang Street (大井街). | "我屋企個窗望出去 就其實是大井街那個井那個位" (out of my home's window you saw the place of the well on Tai Chang Street) |
| transcript (YouTube auto captions, zh-HK) 24:39 | From the back block he could see toward Kowloon City and Tai Chang Street (大井街). | "我是住在後座的 所以我是望到九龍城的 我是望到大井街" (I lived in the back block, so I could see Kowloon City, I could see Tai Chang Street) |
| transcript (YouTube auto captions, zh-HK) 3:16-3:31 | People queued at the street standpipe (街喉) at Tai Chang Street (大井街) for water. | "大井街排街喉這個位" (the spot on Tai Chang Street where people queued at the standpipe) |
| transcript (YouTube auto captions, zh-HK) 3:31 | When he was a child, his father went down every day to get water there. | "我细個的時候 我爸爸就每日落去打水" (when I was small, my father went down every day to fetch water) |
| transcript (YouTube auto captions, zh-HK) 3:07 | Some streets in the City were wider, and there were a few small open squares. | "城寨都有些街是闊些 亦都有少少的廣場位" (the City did have some wider streets and a few square-like spaces) |
| transcript (YouTube auto captions, zh-HK) 3:38-3:54 | Passages between the buildings let you reach other places. You could get lost inside the buildings, not only in the streets. | "不是在街你容易會盪失路 其實是上到樓 都有可能會盪失路" (it is not only in the streets that you get lost; upstairs in the buildings you can get lost too) |
| transcript (YouTube auto captions, zh-HK) 3:54 | You could cross between buildings, not only on the roofs: for example at the 6th floor you could suddenly cross into the next building. | "可能去到6樓突然間就可以過到隔籬那棟大厦" (maybe at the 6th floor you could suddenly cross to the building next door) |
| transcript (YouTube auto captions, zh-HK) 22:36-22:44 | In his own building, at the 6th or 7th floor (he is not sure), you could cross into the next building. | "因為我自己住那棟大厦 不知去到6樓還是7樓 就可以過到第二棟大厦" (in the building I lived in, at the 6th or 7th floor I'm not sure, you could cross to the next building) |
| transcript (YouTube auto captions, zh-HK) 22:52-23:01 | As a child he was afraid of getting lost; he dared go only on his own floor, or with family. | "只是夠膽去自己那層樓度上 或者跟一些屋企人" (only dared to go on my own floor, or with family members) |
| transcript (YouTube auto captions, zh-HK) 4:12 | He says that the real ground was wetter than in the film, with rats and cockroaches running about. | "因為地下不夠濕 又沒有老鼠曱甴 那些周圍走來走去" (because the ground is not wet enough, and there are no rats or cockroaches running around) |
| transcript (YouTube auto captions, zh-HK) 2:24-2:33 | He says that the City had roast-meat stalls, fish-ball stalls and food workshops, as the film and Greg Girard's photographs show. | "包括了那些燒味檔魚蛋檔 食品加工場" (including the roast-meat stalls, fish-ball stalls, food processing workshops) |
| transcript (YouTube auto captions, zh-HK) 4:28-4:35 | He says that before 1987 there was a squatter area called Sai Tau Tsuen (西頭村) in front of the City. | "其實九龍城寨在1987年之前 還有一個叫做西頭村的寮屋區" (before 1987 the City also had a squatter area called Sai Tau Tsuen) |
| transcript (YouTube auto captions, zh-HK) 4:35-4:42 | Sai Tau Tsuen (西頭村) had two-storey tin houses, flour mills, timber yards and fish-ball stalls. | "是有兩層樓那些鐵皮屋 又有一些面粉廠 木廠魚蛋檔樣樣有的" (there were two-storey tin houses, some flour mills, timber yards, fish-ball stalls, all sorts) |
| transcript (YouTube auto captions, zh-HK) 4:42-4:51 | As a child he had his hair cut in a tin house in Sai Tau Tsuen (西頭村). | "是有在這個西頭村 那個鐵皮屋那兒剪頭髮的" (I had my hair cut at that tin house in Sai Tau Tsuen) |
| transcript (YouTube auto captions, zh-HK) 4:51-4:59 | There was a small open space there where children played marbles; he once lost half a bag of marbles. | "還有一塊小空地在那個地方的 所以有一些小朋友會在那兒玩" (there was also a small open space there, so some children played there) |
| transcript (YouTube auto captions, zh-HK) 5:07-5:24 | He says that the Yu Lan (Hungry Ghost) festival of the City was not held inside the City but at a ball court outside: the City had no open space big enough for a bamboo theatre. | "城寨的盂蘭盛會 就不是在城寨入面搭棚做的 其實就會是出了去另外一個球場那兒舉行" (the City's Yu Lan festival was not held in a matshed inside the City; it was held at another ball court outside) |
| transcript (YouTube auto captions, zh-HK) 5:24 | He says that the City's buildings had no piles, thus the tallest reached only 14 storeys. | "城寨樓本身就沒有打樁 所以最高 都只是起到14層樓高" (the City's buildings had no piles, so the tallest only reached 14 storeys) |
| transcript (YouTube auto captions, zh-HK) 5:33-5:41 | INFERRED: He says that from the roofs you could not see the runway of Kai Tak Airport (啟德機場); you looked toward Kowloon City or toward '信號山' (as the auto captions write it; the place is not checked). | "在天台望出去 其實就不會望到 啟德機場那條跑道的" (looking out from the roof you would not actually see the Kai Tak runway) |
| transcript (YouTube auto captions, zh-HK) 22:22-22:36 | As a child he went secretly to the roofs to play and to watch the planes. He did not jump from roof to roof. | "當然就沒有跳去第二個天台這麼誇張 都是睇下一些飛機這樣" (of course nothing as wild as jumping to another roof, just watching some planes) |
| transcript (YouTube auto captions, zh-HK) 20:42-21:06 | The film Long Arm of the Law (省港旗兵) was shot on location inside the City, at night, when he was about 10, with a big crew and much equipment brought in. | "那時真是唔知10歲左右 他是夜晚入來拍的 其實都幾大陣仗" (back then, around 10 I guess, they came in at night to shoot, quite a big production) |
| transcript (YouTube auto captions, zh-HK) 21:06-21:24 | INFERRED: The crew of 麥當雄 shot at Tai Chang Street (大井街) and at '西城街' (as the auto captions write it; INFERRED to be Sai Shing Road (西城路), the City street of that name). | "他們其實就在大井街 同埋西城街那邊去拍的" (they actually shot over at Tai Chang Street and 西城街) |
| transcript (YouTube auto captions, zh-HK) 21:24-21:40 | Each night from about 7 pm the shoot made very loud gunshots for its gunfight scenes. | "成晚 7點打後 一到夜晚開始 就聽到他一些開槍聲是好大聲的" (the whole night, after 7 o'clock, once night began you heard very loud gunshots) |
| transcript (YouTube auto captions, zh-HK) 21:40-21:56 | He says that there was never a real gunfight in the City in his childhood; the only gunshots he heard were the film's. | "细個其實都冇發生過 在城寨入面有槍戰" (when I was small there was never a gunfight inside the City) |
| transcript (YouTube auto captions, zh-HK) 20:58 | INFERRED: If Long Arm of the Law (省港旗兵) was shot in 1983-84 (its year is not in the video), he was born about 1973-74 (INFERRED from 'about 10' at the shoot). | "唔知10歲左右" (around 10, I guess) |
| transcript (YouTube auto captions, zh-HK) 23:01-23:18 | His paternal aunt (姑姐), his grand-aunt (姑婆) and his maternal uncle (舅父) also lived in the City, each with their own household. | "我姑姐屋企其實都是住城寨 跟住我姑婆屋企又是 還有我舅父都是住在城寨的" (my aunt's family lived in the City, my grand-aunt's family too, and my uncle also lived in the City) |
| transcript (YouTube auto captions, zh-HK) 23:18-23:34 | He says that the City was cheap: a unit cost a few tens of thousands of dollars, thus many people chose to live there. | "幾萬元就可以買到個單位 就可以在入面住" (with a few tens of thousands of dollars you could buy a unit and live inside) |
| transcript (YouTube auto captions, zh-HK) 23:34 | Because relatives lived inside, his family did not find the City frightening. | "所以都不會覺得入面是有幾恐怖" (so we didn't feel it was frightening inside) |
| transcript (YouTube auto captions, zh-HK) 23:42-23:49 | He often walked through the City by Tai Chang Street (大井街) up to Tung Tau Tsuen Road (東頭村道), to play in the park there. | "穿過我就會是大井街 一路穿上去 就穿到上去東頭村道那兒樣去" (I would go through by Tai Chang Street, all the way up to Tung Tau Tsuen Road) |
| transcript (YouTube auto captions, zh-HK) 7:47-7:54 | He says that some of his relatives came illegally from the mainland, and the family looked after them until they got an identity card (the place where they lived is not stated). | "偷渡落到來由屋企人照顧他 再去拿身份證" (came down illegally, were looked after by family, then got an ID card) |

- **Leads:**
  - Long Arm of the Law (省港旗兵), a feature film shot on location in the City at night at Tai Chang Street (大井街) and Sai Shing Road (西城路, INFERRED from the captions' 西城街); the host gives no year (20:42-21:24)
  - Earlier videos of the same channel in which the host says he already talked about living in the City ('我之前都有講過', 0:30); not identified
  - Greg Girard's photographs of the City, 1987-1990 (the host's dates, 2:15)
### en-testimony-14: Kowloon Walled City (99% Invisible, episode 66), transcript

- **Status:** Read on 2026-11-18; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Roman Mars and Nick van der Kolk, 'Kowloon Walled City', 99% Invisible, episode 66, 19 November 2012, transcript, https://99percentinvisible.org/episode/episode-66-kowloon-walled-city/transcript/
- **Class:** secondary (A radio feature: most of it is the hosts' narration (secondary). The words of the photographer Greg Girard (in the City from the late 1980s) are retrospective (2012) testimony and are marked primary. Aaron Tan (architect, thesis on the City, watched the demolition) speaks mostly as a researcher. It can move to secondary-sources/, with the Girard quotes kept as primary facts.)
- **Date of the record:** 2012-11-19
- **Files:**
  - `en-testimony-14-page.html` (in `local/`, not in git): HTML of the transcript page (short page); https://99percentinvisible.org/episode/episode-66-kowloon-walled-city/transcript/; 150218 bytes; SHA-256 `20e081b01aee1ed9d6cc3bc2b578af23ba2df379b4cf13022d3a0acedd23f07f`; licence: © 99% Invisible (no open licence stated) (https://99percentinvisible.org/episode/episode-66-kowloon-walled-city/transcript/)
- **Note:** the reader classed the whole item as secondary: its 26 facts are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

- **Leads:**
  - Aaron Tan's master's thesis on Kowloon Walled City, with interviews of residents (early 1990s; title and school not given in the transcript).
### top-blocked-c-12: Kowloon Walled City: Life in the City of Darkness

- **Status:** Partly read on 2026-11-19; a checker checked a sample of the facts on 2026-11-19. Arquivo.pt raw copy (2021-08-21, id_ form) read with WebFetch: header, standfirst and seven captions only. The Wayback copy (2026-05-14) opened in the Playwright browser gave the first seven paragraphs of the body; the rest of the '5-MIN READ' text did not render, and other pages took over the shared browser on two more tries. The testimony of Heung Yin-king and Ida Shum was not reached; the repo holds the body from The Travel Club copy.
- **Citation:** John Carney, 'Kowloon Walled City: Life in the City of Darkness', South China Morning Post, 16 March 2013 (updated 12 February 2015), https://www.scmp.com/news/hong-kong/article/1191748/kowloon-walled-city-life-city-darkness; copies: Arquivo.pt 2021-08-21, Wayback Machine https://web.archive.org/web/20260514003420/https://www.scmp.com/news/hong-kong/article/1191748/kowloon-walled-city-life-city-darkness
- **Class:** secondary (A reporter's feature of 2013: the narration and the captions are secondary. The quotes of former residents in the body are retrospective (2013), but this read did not reach them. The narration part belongs in secondary-sources/; the item can stay in this folder for its testimony.)
- **Date of the record:** 2013-03-16
- **Note:** the reader classed the whole item as secondary: its 13 facts are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

- **Leads:**
  - The full body of SCMP 1191748 with the testimony of Heung Yin-king and Ida Shum (repo: The Travel Club copy).
  - SCMP photo gallery 'What was it really like living in Kowloon Walled City?' (linked in paragraph 4; URL not seen).
### top-gap-tv-news-archives-7: Kowloon remembered

- **Status:** Partly read on 2026-11-18; a checker checked a sample of the facts on 2026-11-19. I opened the programme page (the old radionational URL redirects to https://www.abc.net.au/listen/programs/sundayextra/915-segment/5383124) with the Playwright browser and read its text and its JSON-LD metadata. The segment is audio only (13 min 35 s) and the page has no transcript, thus I did not hear what the guest says. The JSON-LD names the guest: Greg Girard, 'Canadian photographer' (his ABC contributor page). This checks the finder's guess (Girard or Lambot): it is Girard. All facts below come from the presenter's short text on the page, not from the audio.
- **Citation:** Jonathan Green (presenter), Jennifer Leake (producer), guest Greg Girard, 'Kowloon remembered', Sunday Extra, ABC Radio National, broadcast Sunday 13 April 2014, 9:15 am (AEST; the page gives datePublished 2014-04-12T23:15:00Z), 13 min 35 s, https://www.abc.net.au/listen/programs/sundayextra/915-segment/5383124
- **Class:** retrospective (Retrospective (2014), on the condition that the audio holds Greg Girard's first-hand memories of the City (he is the only guest the page names). The page text itself is the presenter's secondary summary. Keep it in primary-sources/ until someone transcribes the audio.)
- **Date of the record:** 2014-04-13 (broadcast)
- **Files:**
  - `top-gap-tv-news-archives-7-5383124.html` (in `local/`, not in git): HTML of the programme page (presenter's text and credits only; no transcript); https://www.abc.net.au/listen/programs/sundayextra/915-segment/5383124; 318039 bytes; SHA-256 `e439ef7eb93233955e0ed108ccf70209647dd355700592c123e183a02857312d`; licence: © 2026 ABC (site footer) (https://www.abc.net.au/listen/programs/sundayextra/915-segment/5383124)
- **Note:** the reader classed the whole item as retrospective: its 6 facts are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

- **Leads:**
  - The audio of the segment (13 min 35 s, ABC podcast file sra_20140413_0915.mp3, linked from https://www.abc.net.au/listen/programs/sundayextra/915-segment/5383124): Greg Girard's spoken account; not transcribed. Audio cannot go in the repo; a person must listen and take notes.
### zh-testimony-18: 【住在香港．二】從徙置區九龍城寨　聯想今天的共居與光房

- **Status:** Read on 2026-11-20; a checker checked a sample of the facts on 2026-11-20.
- **Citation:** 曹民偉, 【住在香港．二】從徙置區九龍城寨　聯想今天的共居與光房, HK01 (香港01), 6 Jul 2018 (from 香港01 周報 no. 118, 3 Jul 2018), https://www.hk01.com/%E6%B7%B1%E5%BA%A6%E5%A0%B1%E9%81%93/207256/%E4%BD%8F%E5%9C%A8%E9%A6%99%E6%B8%AF-%E4%BA%8C-%E5%BE%9E%E5%BE%99%E7%BD%AE%E5%8D%80%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8-%E8%81%AF%E6%83%B3%E4%BB%8A%E5%A4%A9%E7%9A%84%E5%85%B1%E5%B1%85%E8%88%87%E5%85%89%E6%88%BF
- **Class:** retrospective (Retrospective (2018): the writer's own visit to a classmate's home in the City in his secondary-school years. The year is not given; the writer says he has lived half a century, thus probably the 1970s or early 1980s (INFERRED).)
- **Date of the record:** 2018-07-06
- **Files:**
  - `zh-testimony-18-_-_-_-_-5cd58e60.html` (in `local/`, not in git): HTML of the article; https://www.hk01.com/%E6%B7%B1%E5%BA%A6%E5%A0%B1%E9%81%93/207256/%E4%BD%8F%E5%9C%A8%E9%A6%99%E6%B8%AF-%E4%BA%8C-%E5%BE%9E%E5%BE%99%E7%BD%AE%E5%8D%80%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8-%E8%81%AF%E6%83%B3%E4%BB%8A%E5%A4%A9%E7%9A%84%E5%85%B1%E5%B1%85%E8%88%87%E5%85%89%E6%88%BF; 521779 bytes; SHA-256 `9b30c58618e80a21de8448ffd652d9260008358b9035aa161ada2655d382c982`; licence: 香港01有限公司版權所有 © 2026 (page footer) (https://www.hk01.com/%E6%B7%B1%E5%BA%A6%E5%A0%B1%E9%81%93/207256/%E4%BD%8F%E5%9C%A8%E9%A6%99%E6%B8%AF-%E4%BA%8C-%E5%BE%9E%E5%BE%99%E7%BD%AE%E5%8D%80%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8-%E8%81%AF%E6%83%B3%E4%BB%8A%E5%A4%A9%E7%9A%84%E5%85%B1%E5%B1%85%E8%88%87%E5%85%89%E6%88%BF)

| Page | Fact | Words in the source |
|---|---|---|
| section 居於永遠黑夜的暗角, para. 3 (not counting the heading line) | In the writer's school years the City had a name as a 'den of demons'; tales of kidnappers kept children away, with dog slaughtering, brothel strip dances and heroin selling. | "還有劏狗、妓寨豔舞、賣白粉等非法勾當" (also illegal trades such as dog slaughtering, brothel strip dances and selling heroin) |
| section 居於永遠黑夜的暗角, para. 4 (not counting the heading line) | When a classmate who lived in the City was ill for a long time, the teacher took representatives of three classes to visit the classmate. | "老師組織三個班代表一起去探望" (the teacher organized representatives of three classes to visit together) |
| section 居於永遠黑夜的暗角, para. 4 (not counting the heading line) | In broad daylight the lanes were as dark as night, with waves of drain smell and water dripping from overhead. | "大白天一走進這些小巷已經如同黑夜，一陣陣坑渠味、頭頂不知何處總有水滴下來" (in broad daylight, stepping into these lanes was like night; waves of drain smell; water always dripping from somewhere overhead) |
| section 居於永遠黑夜的暗角, para. 4 (not counting the heading line) | Bunches of electric wires ran to unknown places, and the dark lanes had dirty water all over the ground. | "串串的電線不曉得通往何處，穿過滿地污水的暗巷" (strings of wires leading who knows where, through dark lanes with dirty water all over the ground) |
| section 居於永遠黑夜的暗角, para. 4 (not counting the heading line) | The classmate's home was among illegal tin-sheet huts stacked in layers; in summer the small tin huts were like ovens. | "走進那些僭建的層層疊疊鐵皮屋中間，夏日的小鐵皮屋如同烤箱一般" (walked in among those illegally built, layer-upon-layer tin huts; in summer the small tin huts were like ovens) |
| section 居於永遠黑夜的暗角, para. 4 (not counting the heading line) | The classmate sat on a bunk bed and took toys from a plastic bag beside him. | "見同學仔精神奕奕坐在碌架床，隨手從身邊膠袋摸出玩具來" (saw the classmate sitting lively on a bunk bed, pulling toys out of a plastic bag beside him) |
| section 居於永遠黑夜的暗角, para. 4 (not counting the heading line) | The classmate took them to the roof to watch aircraft; planes landing at Kai Tak seemed close enough to touch. | "同學仔帶我們上天台睇飛機，從啟德機場降落的飛機如此接近，幾乎可以用手觸摸得到" (the classmate took us up to the roof to watch planes; the planes landing at Kai Tak were so close we could almost touch them) |
### film-13: Witness History: Kowloon Walled City

- **Status:** Partly read on 2026-11-18; a checker checked a sample of the facts on 2026-11-19. Audio only. I read the show notes on playpodcasts.com with WebFetch. I cannot hear audio; there is no transcript. The fetch tool cannot open bbc.co.uk.
- **Citation:** Lucy Burns (presenter), 'Kowloon Walled City', Witness History, BBC World Service, 19 May 2020, 10 min 10 s, https://www.bbc.co.uk/programmes/w3cszmpc (listing: https://playpodcasts.com/podcasts/witness-history/kowloon-walled-city)
- **Class:** retrospective (retrospective (2020): Albert Ng grew up in the City; Suenn Ho studied it before the demolition. Both are already in the repo. Only the show notes were read (secondary).)
- **Date of the record:** 2020-05-19
- **Note:** the reader classed the whole item as retrospective: its 3 facts are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).
### en-testimony-11: Uncle Man｜The Living Dictionary in the Kowloon Walled City Park

- **Status:** Read on 2026-11-18; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Miff (text and photos), translated by Alex Rednaxela, 'Uncle Man｜The Living Dictionary in the Kowloon Walled City Park', We Are HKers, 30 November 2020 (also in Apple Daily, 28 November 2020), https://jellyfish-raspberry-d746.squarespace.com/main-english/uncle-man-the-living-dictionary-in-the-kowloon-walled-city-park
- **Class:** secondary (Lei Sing-man ('Uncle Man') did not live in the City: he moved to Kowloon in 1998. His only first-hand part is one visit as a child (year not given), retrospective (2020). The rest is lore that he tells as a guide, with no source given. It can move to secondary-sources/.)
- **Date of the record:** 2020-11-30
- **Note:** the reader classed the whole item as secondary: its 11 facts are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

- **Leads:**
  - The Chinese original of the article: We Are HKers, https://www.wearehkers.com/main-chinese/uncle-man-the-living-dictionary-in-the-kowloon-walled-city-park (30 Nov 2020); also printed in Apple Daily, 28 Nov 2020.
### en-testimony-18: The Dark Side: Opium and Lions (Nine Dragons, part 2)

- **Status:** Read on 2026-11-18; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Simon Ostheimer, 'The Dark Side: Opium and Lions' (Nine Dragons, part 2), Substack, 18 June 2021, https://simonostheimer.substack.com/p/nine-dragons-part-2
- **Class:** secondary (The writer was a baby in a push chair on the visit; he relays his mother's memory. This is second-hand, and the rest is a general history. It belongs in secondary-sources/.)
- **Date of the record:** 2021-06-18
- **Note:** the reader classed the whole item as secondary: its 7 facts are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).
### zh-testimony-17: 回憶，比燭光晚餐浪漫：九龍城和它「城寨」的流金故事，從潮州勢力說起

- **Status:** Read on 2026-11-20; a checker checked a sample of the facts on 2026-11-20.
- **Citation:** 李偉民, 回憶，比燭光晚餐浪漫：九龍城和它「城寨」的流金故事，從潮州勢力說起, Master Insight (灼見名家), master-insight.com, 5 Feb 2022, https://www.master-insight.com/article/25635
- **Class:** retrospective (Retrospective (2022): the writer's own visit as a secondary student at 英華書院 and a friend's quoted childhood in the City. Years not given; probably the 1960s-1970s (INFERRED: a black-and-white TV, his schooldays).)
- **Date of the record:** 2022-02-05
- **Files:**
  - `zh-testimony-17-25635-7f103a4d.html` (in `local/`, not in git): HTML of the article; https://www.master-insight.com/article/25635; 148280 bytes; SHA-256 `1fcf72ccd549e3270f528ab3deaf422cc45abbaec7b044f6c788ca29b264bb52`; licence: © Master Insight Media Limited 2026 All rights reserved (page footer) (https://www.master-insight.com/article/25635)

| Page | Fact | Words in the source |
|---|---|---|
| section 三不管與四類人 | As a secondary student the writer went into the City alone: dark lanes like a black maze with a strong smell of drains. | "那裏只有昏暗小巷，似黑色迷宮，地渠味道熏天" (there were only dim lanes, like a black maze, the stench of the drains filled the air) |
| section 三不管與四類人 | Shady men stood at the doors of old low houses selling drugs, and a pimp asked him if he wanted to see a live sex show. | "許多邪邪歪歪的人站在灰舊平房門口，兜售毒品" (many shady people stood at the doors of grey old single-storey houses, peddling drugs) |
| section 三不管與四類人 | Signs of unlicensed clinics and dentists were everywhere; the writer's father had his gold teeth made in the City. | "那裏舉目都是無牌診所和牙醫的招牌，我父親的金牙，是城裏的傑作" (everywhere you looked were signs of unlicensed clinics and dentists; my father's gold teeth were a work of the City) |
| section 三不管與四類人 | On the side of the City toward Carpenter Road (賈炳達道) were several tin-roofed snack shops that sold non-Cantonese food such as pot-stickers, 麵線糊 and oyster omelette. | "城寨向賈炳達道方向…有多家鐵皮小吃店，賣「外江」可口風味" (toward Carpenter Road the City had several tin-sheet snack shops selling tasty 'outside-province' food) |
| section 三不管與四類人 | A classmate remembers that the City sold pirated model kits, such as the Tiger I tank and the battleship Yamato, cheaper than outside. | "我記憶中的城寨，是賣『老翻』模型" (the City that I remember sold pirated models) |
| section 三不管與四類人 | A friend who grew up in the City says her home had only a bed, and a cloth curtain separated the 'kitchen' (a kerosene stove) from the 'toilet' (a chamber pot). | "一張布簾，分隔廚房（即一個火水爐）和廁所（即一個痰罐）" (a cloth curtain separated the kitchen (that is, a kerosene stove) and the toilet (that is, a pot)) |
| section 三不管與四類人 | They used hard 玉扣紙 paper, not soft toilet paper, and small children wore split trousers. | "用硬硬的玉扣紙。幼童多穿『開浪褲』" (used hard 玉扣 paper; small children mostly wore split-crotch trousers) |
| section 三不管與四類人 | The friend was often bullied by local thugs but the children had their own games: popsicle-stick models, jacks, marbles, card football and rubber-band rope skipping. | "雖然經常被惡霸『蝦』，但我們有自己的創意遊戲" (although often bullied by thugs, we had our own creative games) |
| section 三不管與四類人 | Each day her mother went out to draw well water for cooking and bathing; light came from kerosene lamps. | "每天媽媽外出打井水，用來煮飯、沖涼；而照明，便靠『火水燈』" (every day mother went out to draw well water for cooking and bathing; for light we relied on kerosene lamps) |
| section 三不管與四類人 | At the corner of her street were a quilt shop and the 保叔涼茶 herbal tea shop; a bowl of tea cost 1 毫 (10 cents), and children stood in the shop all evening to watch a black-and-white TV. | "一毫子買碗涼茶，小朋友整晚站在店內看黑白電視" (ten cents bought a bowl of herbal tea; the children stood in the shop all evening watching black-and-white TV) |
| section 三不管與四類人 | She went to 心如學校 on 獅子石道 in a rooftop class; when it rained there was no class on the roof. | "我們在獅子石道心如學校唸書，是『天台班』，下雨，大家便不用回天台上課" (we studied at 心如 School on 獅子石道 in a 'rooftop class'; when it rained nobody had to go up to the roof for class) |
### zh-testimony-9: 從寨城到龍城 林記臘味家第一代負責人靜看變幻半世紀 七十五歲仍每天開店：一日唔拆，一日都做落去

- **Status:** Read on 2026-11-18; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** 盧乙彬 and 周耀恩, 「從寨城到龍城 林記臘味家第一代負責人靜看變幻半世紀 七十五歲仍每天開店：一日唔拆，一日都做落去」, Ming Pao Weekly (明周文化), series 「九龍城 都市重建啟示錄」, 2022-08-23, https://www.mpweekly.com/culture/%e7%a4%be%e6%9c%83/%e4%b9%9d%e9%be%8d%e5%9f%8e-%e4%b9%9d%e9%be%8d%e5%9f%8e%e9%87%8d%e5%bb%ba-%e6%9e%97%e8%a8%98%e8%87%98%e5%91%b3%e5%ae%b6-210095
- **Class:** retrospective (Retrospective (2022): 何生 (75) lived as a child in Sai Tau Tsuen (西頭村) of the City (to 1972) and worked from 1964 at a stall and shop on Nga Tsin Long Road (衙前塱道), opposite the City. His memories are of the 1960s-70s; the narration and history are secondary.)
- **Date of the record:** 2022-08-23 (published); memories of the 1950s-1990s
- **Files:**
  - `zh-testimony-9-_-_-_-210095.html` (in `local/`, not in git): HTML of the article; https://www.mpweekly.com/culture/%e7%a4%be%e6%9c%83/%e4%b9%9d%e9%be%8d%e5%9f%8e-%e4%b9%9d%e9%be%8d%e5%9f%8e%e9%87%8d%e5%bb%ba-%e6%9e%97%e8%a8%98%e8%87%98%e5%91%b3%e5%ae%b6-210095; 117117 bytes; SHA-256 `1d6795d1c0e4ef9f26f4e4cd48b12a4eada7ca898d6ba355c908954af325dcdf`; licence: © 2026 One Media Group Limited. All rights reserved. (site footer) (https://www.mpweekly.com/culture/%e7%a4%be%e6%9c%83/%e4%b9%9d%e9%be%8d%e5%9f%8e-%e4%b9%9d%e9%be%8d%e5%9f%8e%e9%87%8d%e5%bb%ba-%e6%9e%97%e8%a8%98%e8%87%98%e5%91%b3%e5%ae%b6-210095)
- **Note:** its 14 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| web page, paragraph 4 | While the City stood, they slept on the street by the stall, for fear that heroin addicts would steal the goods; they covered the goods with canvas and slept on canvas cots. | "那時城寨還在，會喺度（街上）瞓覺，怕白粉佬偷嘢" (back then the City was still there; we slept here on the street, afraid heroin addicts would steal) |
| web page, section 「童稚年代 居於九龍城寨」 | He placed Sai Tau Tsuen (西頭村) 'further down from South Wall Road (城南道)'. | "喺城南道再落" (further down from South Wall Road) |
| web page, section 「童稚年代 居於九龍城寨」 | The lanes crossed left and right like a spider's web; you had to know the way. | "啲路左右交錯，要識行先得㗎，好似蜘蛛網" (the paths crossed every which way; you had to know how to walk them, like a spider's web) |
| web page, section 「童稚年代 居於九龍城寨」 | He says that the City was certainly not a good place to live: the wires were piled on each other, so people always feared fire and feared they could not get out in time. | "電線左疊右疊，所以成日驚火燭，怕走唔切" (the wires were piled up every which way, so we were always afraid of fire, afraid we couldn't get out in time) |
| web page, section 「童稚年代 居於九龍城寨」 | He says that the City had no water supply: people drilled their own wells, lowered a pipe and pumped up ground water. | "城寨冇水，自己打科學井，探條喉落去打水，抽地下水" (the City had no water; we sank our own wells, put a pipe down and drew ground water) |
| web page, section 「童稚年代 居於九龍城寨」 | In the water rationing of the 1960s there was a street standpipe in front of the village, and everybody queued at it. | "嗰時條村前面有條街喉，制水那陣子，大家都在排隊" (back then there was a standpipe in front of the village; during rationing everyone queued) |
| web page, section 「喧鬧的龍城」 | In the 1960s and 1970s Nga Tsin Long Road (衙前塱道) had few cars and no concrete or asphalt. | "六、七十年代冇乜車，呢度係爛路，冇石屎，冇瀝青" (in the sixties and seventies there were hardly any cars; this was a rough road, no concrete, no asphalt) |
| web page, section 「喧鬧的龍城」 | Opposite the shop there used to be a stone house and a garage with dump trucks; the next street had a sawmill. The market opposite has stood there only since 1988. | "以前這裏有間石屋、有間車房，會放幾架泥頭車喺度，隔離街有間𠝹木廠" (there used to be a stone house here, a garage with a few dump trucks, and a sawmill on the next street) |
| web page, section 「喧鬧的龍城」 | Hakka builders lived around South Wall Road (城南道). Each morning, after tea, a hundred to two hundred of them waited at the door of a 大眾銀行 on South Wall Road to be hired to dig for telephone lines and cables (period 'before'; not dated). | "以前城南道大眾銀行門口，工頭搵人一嗌就得，朝朝早百幾二百人喺度" (in the old days at the door of the 大眾銀行 on South Wall Road, a foreman just had to shout; every morning there were a hundred or two hundred people there) |
| web page, section 「喧鬧的龍城」 | He says that everyone scattered. | "個個都散" (everyone scattered) |
| web page, section 「貨物映照今昔變化」 | In the past the shop sold mostly salted fish; preserved sausage was cheap and good (Mrs 林's words). | "鹹魚最好賣，送到飯，所以成間舖都是鹹魚" (salted fish sold best, it goes with rice, so the whole shop was salted fish) |

- **Leads:**
  - British Airways calendar for 1985, December page: a photograph of 林記臘味家 on Nga Tsin Long Road (衙前塱道) (the shop keeps a copy)
  - Ming Pao Weekly (明周文化) series 「九龍城 都市重建啟示錄」 (2022-08), for example 「南角道的一場邂逅 六十歲魚蛋廠大叔遇上九十後咖啡店店主」 (not opened)
### repo-audit-27: 電影翻生 莊澄3億開拍《九龍城寨》「古仔可以鎮得住個場」

- **Status:** Read on 2026-11-17; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** 文嘉龍 (text), 鍾漢平 (photos), '電影翻生 莊澄3億開拍《九龍城寨》「古仔可以鎮得住個場」', 明周娛樂 (Ming Pao Weekly), 24 March 2023, https://www.mpweekly.com/entertainment/article/%E9%9B%BB%E5%BD%B1%E7%BF%BB%E7%94%9F-3%E5%84%84%E9%96%8B%E6%8B%8D%E3%80%8A%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E3%80%8B%E8%8E%8A%E6%BE%84%E3%80%8C%E5%8F%A4%E4%BB%94%E5%8F%AF%E4%BB%A5%E9%8E%AE%E5%BE%97
- **Class:** retrospective (Interview with the film producer 莊澄 about his childhood in the City: retrospective (2023). His childhood was long before 1985 (no years given).)
- **Date of the record:** 2023-03-24
- **Note:** its 1 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| article | He lived there for almost four years and left at age seven. | "我住到7歲先走，住咗差不多四年" (I lived there until I was 7, almost four years.) |
| article | Children were stopped from going to many places, the dens of vice, gambling and drugs; they went only to the main street and the corner shops. | "嗰啲黄賭毒竇口，所以我哋來來去去都係去大街、士多" (Those dens of vice, gambling and drugs; so we only went back and forth to the main street and the stores.) |
| article | Before he moved out the buildings were not yet tall: at most two or three storeys. | "我搬走之前未起高，最多都係兩、三層" (Before I moved away it wasn't built high yet; at most two or three storeys.) |
### en-testimony-20: What this playful photo reveals about Hong Kong's infamous 'Walled City'

- **Status:** Read on 2026-11-18; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Rebecca Cairns, 'What this playful photo reveals about Hong Kong's infamous 'Walled City'', CNN Style (Snap series), 8 June 2023, https://www.cnn.com/style/greg-girard-kowloon-walled-city-snap/index.html; CNN Newsource copy https://kesq.com/?p=1188361
- **Class:** retrospective (retrospective (2023): Greg Girard's own words in a video call (primary). The frame, the numbers and the captions are the reporter's narration (secondary). Keep in primary-sources/.)
- **Date of the record:** 2023-06-08
- **Note:** its 12 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| CNN article, paragraph 3 | Girard: in the City the line between private and public space was not always clear. | "wasn't always so clear" |
| CNN article, paragraph 3 | Girard: on the roof the view opened, it was cooler and there was a breeze. | "The vista opens up, and it's cooler, there's a breeze." |
| CNN article, paragraph 4 | Girard: nobody seemed to think the roofs dangerous, although they had no guardrails. | "No one seemed to think of it as a dangerous place, even though there were no guardrails" |
| CNN article, paragraph 7 | Girard: the day of the photo was an ordinary day on the roof. | "It was just quite an average day up on (there)." |
| CNN article, section 'A strange, vertical village' | By 1986 the triads' control had waned, and Girard calls the City's crime reputation 'very out of date'. | "very out of date." |
| CNN article, section 'A strange, vertical village' | Girard: the City was a place where people tried to get by, like any working-class district of Hong Kong. | "it's just a place where folks are trying to get by, like any other working-class part of Hong Kong." |
| CNN article, section 'A strange, vertical village' | Girard worked in colour with portable lights, because other photos of the City were in black and white and made it look as bad as possible. | "The only pictures you saw of the Walled City at the time tended to be in black and white" |
| CNN article, section 'A strange, vertical village' | At first residents did not welcome outsiders; later they let Girard into their small flats. | "there was a palpable unwelcomeness to outsiders" |
### repo-audit-12: 手打魚蛋老字號重生 二代延續蔡瀾至愛潮洲粉麵小店

- **Status:** Read on 2026-11-17; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Janice Hui (text), Tay Wong (photos), '手打魚蛋老字號重生 二代延續蔡瀾至愛潮洲粉麵小店', 好集慣 BetterMe Magazine, republished on Yahoo新聞 Hong Kong, 3 November 2023, https://hk.news.yahoo.com/%E6%89%8B%E6%89%93%E9%AD%9A%E8%9B%8B%E8%80%81%E5%AD%97%E8%99%9F%E9%87%8D%E7%94%9F-%E4%BA%8C%E4%BB%A3%E5%BB%B6%E7%BA%8C%E8%94%A1%E7%80%BE%E8%87%B3%E6%84%9B%E6%BD%AE%E6%B4%B2%E7%B2%89%E9%BA%B5%E5%B0%8F%E5%BA%97-094930914.html
- **Class:** secondary (A reporter's feature on the noodle shop 夏銘記. The City facts are the reporter's narration of the family history, not quoted words of a witness. The son Roger is the probable informant (INFERRED), thus at best second-hand retrospective (2023). It can move to secondary-sources/.)
- **Date of the record:** 2023-11-03
- **Note:** the reader classed the whole item as secondary: its 5 facts are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

- **Leads:**
  - The BetterMe Magazine (好集慣) original of the same article, 2023-11-03 (not opened).
  - 蔡瀾's newspaper columns that praise 夏銘記 (cited without dates).
### zh-testimony-6: 九龍城寨之圍城｜敏叔義務導賞九龍寨城公園足26年：我從未退休

- **Status:** Read on 2026-11-18; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** am730 (reporter not named), 「九龍城寨之圍城｜敏叔義務導賞九龍寨城公園足26年：我從未退休」, am730, 生活, published 2024-05-06 10:00, https://www.am730.com.hk/%E7%94%9F%E6%B4%BB/%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E4%B9%8B%E5%9C%8D%E5%9F%8E-%E6%95%8F%E5%8F%94%E7%BE%A9%E5%8B%99%E5%B0%8E%E8%B3%9E%E4%B9%9D%E9%BE%8D%E5%AF%A8%E5%9F%8E%E5%85%AC%E5%9C%92%E8%B6%B326%E5%B9%B4-%E6%88%91%E5%BE%9E%E6%9C%AA%E9%80%80%E4%BC%91/450380
- **Class:** retrospective (Retrospective (2024): 敏叔 (李昇敏)'s own story of one visit to a classmate in the City as a schoolboy (undated here; 星島頭條 gives a visit in 1963). He was not a resident.)
- **Date of the record:** 2024-05-06 (published); memory of a school-age visit, probably 1963 (INFERRED from zh-testimony-5)
- **Files:**
  - `zh-testimony-6-450380.html` (in `local/`, not in git): HTML of the article; https://www.am730.com.hk/%E7%94%9F%E6%B4%BB/%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E4%B9%8B%E5%9C%8D%E5%9F%8E-%E6%95%8F%E5%8F%94%E7%BE%A9%E5%8B%99%E5%B0%8E%E8%B3%9E%E4%B9%9D%E9%BE%8D%E5%AF%A8%E5%9F%8E%E5%85%AC%E5%9C%92%E8%B6%B326%E5%B9%B4-%E6%88%91%E5%BE%9E%E6%9C%AA%E9%80%80%E4%BC%91/450380; 376382 bytes; SHA-256 `cc19e5f6133ece1f703f7e14e2a66154629b8b890a664f987df370a43c3e75ef`; licence: 730媒體有限公司 © 2026 (site footer) (https://www.am730.com.hk/%E7%94%9F%E6%B4%BB/%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E4%B9%8B%E5%9C%8D%E5%9F%8E-%E6%95%8F%E5%8F%94%E7%BE%A9%E5%8B%99%E5%B0%8E%E8%B3%9E%E4%B9%9D%E9%BE%8D%E5%AF%A8%E5%9F%8E%E5%85%AC%E5%9C%92%E8%B6%B326%E5%B9%B4-%E6%88%91%E5%BE%9E%E6%9C%AA%E9%80%80%E4%BC%91/450380)
- **Note:** its 2 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| web page, paragraph 3 | As a schoolboy he went into the City to visit a classmate. Just inside, a drug user lying on the ground asked him for money. | "剛走入寨城就遇到了一位吸毒者躺在地上問我要錢" (just as I walked into the City I met a drug user lying on the ground asking me for money) |
| web page, paragraph 3 | He feared the man would hold his legs, so he hurried away and shouted his classmate's name. | "於是加快動作把他甩掉並大喊同學的名字" (so I moved faster to shake him off and shouted my classmate's name) |
| web page, paragraph 3 | The classmate answered from upstairs and told him the way. At the foot of the building he found no stairs, only a family eating a meal. | "卻不見上去的樓梯，反而見到一戶人家正在吃飯" (I could not see any stairs going up, but saw a family eating) |
| web page, paragraph 3 | He walked into the family's home. They paid no attention to him. At the back he found a staircase, and went up it to his classmate. | "入門之後走到後面才看見那裏有一條樓梯" (only after going in and walking to the back did I see a staircase) |
| web page, paragraph 4 | His classmate told him that a person who walked straight in was taken for an acquaintance and ignored, but a person who asked politely at the door drew more suspicion. | "像我這種直接進門的會被當作熟人而無視，而進門前禮貌詢問反而會引來更多懷疑" (someone like me who walks straight in is taken as an acquaintance and ignored; asking politely before entering draws more suspicion) |

- **Leads:**
  - am730, 「九龍城寨之圍城｜九龍寨城清拆回顧 香港三不管地帶歷史（多圖）」 (linked from the article; not opened)
### zh-testimony-4: 在城寨「食白麵」的人｜採訪手記｜Yahoo

- **Status:** Read on 2026-11-18; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** 鄭美姿 (reporter), Nasha Chan (photos), 「在城寨「食白麵」的人｜採訪手記｜Yahoo」, Yahoo News Hong Kong (Yahoo新聞), 2024-06-03, https://hk.news.yahoo.com/%E5%9C%A8%E5%9F%8E%E5%AF%A8%E3%80%8C%E9%A3%9F%E7%99%BD%E9%BA%B5%E3%80%8D%E7%9A%84%E4%BA%BA%EF%BD%9C%E6%8E%A1%E8%A8%AA%E6%89%8B%E8%A8%98%EF%BD%9Cyahoo-044840644.html
- **Class:** retrospective (Retrospective (2024): a reporter's note with first-hand memories of an unnamed old woman who lived at the edge of the City as a child (years not given) and of 阿平 (1970s). The narration is secondary.)
- **Date of the record:** 2024-06-03 (published); memories of the 1970s or earlier
- **Files:**
  - `zh-testimony-4-_yahoo-044840644.html` (in `local/`, not in git): HTML of the reporter's note; https://hk.news.yahoo.com/%E5%9C%A8%E5%9F%8E%E5%AF%A8%E3%80%8C%E9%A3%9F%E7%99%BD%E9%BA%B5%E3%80%8D%E7%9A%84%E4%BA%BA%EF%BD%9C%E6%8E%A1%E8%A8%AA%E6%89%8B%E8%A8%98%EF%BD%9Cyahoo-044840644.html; 391965 bytes; SHA-256 `ec6a88c69d1ff8b3e1e1136c9d500e0272ed0a8c8e4a61dc456a556d11c8f25a`; licence: © 2026 Yahoo. All rights reserved. (site footer) (https://hk.news.yahoo.com/%E5%9C%A8%E5%9F%8E%E5%AF%A8%E3%80%8C%E9%A3%9F%E7%99%BD%E9%BA%B5%E3%80%8D%E7%9A%84%E4%BA%BA%EF%BD%9C%E6%8E%A1%E8%A8%AA%E6%89%8B%E8%A8%98%EF%BD%9Cyahoo-044840644.html)
- **Note:** its 8 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| web page, paragraph 4 | She saw them hold a piece of foil with a lump like lard on it, and suck in through a matchbox. | "他們拿一張錫紙，上面有一堆豬油一樣的東西，拿着火柴盒大口大口吸" (they held a piece of foil with a lump of something like lard on it, and sucked in big gulps through a matchbox) |
| web page, paragraph 4 | At about 11 pm to midnight she saw from her home plainclothes detectives (雜差) arrest the dealers. | "半夜十一二點鐘，從我家望過去，會見到有雜差（便衣警員）去拉毒販" (at eleven or twelve at night, looking over from my home, you would see plainclothes detectives arrest the dealers) |
| web page, paragraph 4 | The arrested men walked out one by one, locked together with chains. | "一個個人用鎖鍊鎖住行出來" (one by one, locked with chains, they walked out) |
| web page, paragraph 6 | The smoke rose like a dragon, and they sucked it in through a matchbox. | "道友追住白煙來索，像追着一條龍。" (the addicts chased the white smoke to inhale it, like chasing a dragon.) |
| web page, paragraph 7 | There he learned to sing red songs such as 《大海航行靠舵手》, played games, and read Mao Zedong's quotations. | "我就去學唱紅歌，我仍記得​​《大海航行靠舵手》之類" (I went to learn red songs; I still remember 'Sailing the Seas Depends on the Helmsman' and the like) |
| web page, paragraph 8 | His elder siblings remembered almost nothing of the City, only that it was filthy. | "只籠統地話污糟邋遢囉" (they only said vaguely that it was filthy) |

- **Leads:**
  - RTHK (香港電台)《鏗鏘集》〈城寨〉: its film of addicts 'chasing the dragon' in the City (screenshot in the note; date not given)
  - The 'life stories' oral-history exhibition in Sham Shui Po (深水埗), 2023 (INFERRED year), curated by 鄭美姿, with elders' memories of the City
### zh-testimony-16: 周笑華／我的九龍城寨故事

- **Status:** Read on 2026-11-20; a checker checked a sample of the facts on 2026-11-20.
- **Citation:** 周笑華, 周笑華／我的九龍城寨故事, United Daily News (聯合報), 家庭副刊, 26 Dec 2024, https://reading.udn.com/read/story/7347/8443991
- **Class:** retrospective (Retrospective (2024) of the writer's walks through the City to school in the 1960s, at 13 or 14. The talk of dentists is second-hand (neighbours).)
- **Date of the record:** 2024-12-26
- **Files:**
  - `zh-testimony-16-8443991-ea7f7555.html` (in `local/`, not in git): HTML of the essay (short page); https://reading.udn.com/read/story/7347/8443991; 159304 bytes; SHA-256 `762a7687fa7641f7e8795ad603faeaf8e1a1aa852a3194384c96ea5de95350b8`; licence: 聯合線上公司 著作權所有 ©2025 (page footer) (https://reading.udn.com/read/story/7347/8443991)

| Page | Fact | Words in the source |
|---|---|---|
| para. 2 | In the 1960s the writer, a secondary student, walked through the City with a classmate as a short cut to school, because full buses did not stop. | "抄捷徑穿越九龍城寨到學校" (took a short cut through Kowloon Walled City to school) |
| para. 2 | Neighbours told her that the City had many dental clinics, where people had teeth pulled and dentures made, skilled and cheap (second-hand). | "那裡有多間牙醫診所，很多市民都在那裡拔牙、做假牙，技術好又便宜" (there are many dental clinics there; many people get teeth pulled and dentures made there, skilled and cheap) |
| para. 3 | The girls were 13 or 14 and wore cheongsam school uniforms. | "十三、四歲的我和Ｃ…穿著旗袍校服" (C and I, aged 13 or 14 ... wearing cheongsam school uniforms) |
| para. 3 | In the early morning the City's street was quiet, with few people and the shops not yet open. | "城寨街上很安靜，行人不多，商店未開門營業" (the City's street was very quiet, few pedestrians, the shops not yet open) |
| para. 3 | On both sides were many deep stairways and dim side lanes. | "只見兩側有多條深層樓梯及光線昏暗的橫巷" (on both sides there were many deep stairways and dimly lit side lanes) |
| para. 3 | A strong man of about forty stopped them and said quietly that the area was not safe and they must not come that way again; after that they did not. | "這區不安全，以後別走這兒" (this area is not safe; do not come this way again) |
### top-zh-testimony-6: 【留住龍城】EP.1 從城寨開始 陪伴九龍城走過半個世紀的崇麟鞋業

- **Status:** Read on 2026-11-18; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** ACOO (text Yanto, photos Hiuyan, design Owen), 「【留住龍城】EP.1 從城寨開始 陪伴九龍城走過半個世紀的崇麟鞋業」, acoo.hk (#ACOOPerson), 2025-01-07, https://www.acoo.hk/acooperson/%e3%80%90%e7%95%99%e4%bd%8f%e9%be%8d%e5%9f%8e%e3%80%91ep-1-%e5%be%9e%e5%9f%8e%e5%af%a8%e9%96%8b%e5%a7%8b-%e9%99%aa%e4%bc%b4%e4%b9%9d%e9%be%8d%e5%9f%8e%e8%b5%b0%e9%81%8e%e5%8d%8a%e5%80%8b%e4%b8%96/ ; with 集誌社, 「九龍城重建 3｜崇麟鞋業　58 年老店　原區覓舖自救　用賠償金賭一賭　現況如何？」, 2025-10-01, https://thecollectivehk.com/%e4%b9%9d%e9%be%8d%e5%9f%8e%e9%87%8d%e5%bb%ba-3%ef%bd%9c%e5%b4%87%e9%ba%9f%e9%9e%8b%e6%a5%ad%e3%80%8058-%e5%b9%b4%e8%80%81%e5%ba%97%e3%80%80%e5%8e%9f%e5%8d%80%e8%a6%93%e8%88%96%e8%87%aa%e6%95%91/
- **Class:** retrospective (Retrospective (2025): first-hand memories of Tella, who grew up from 1967 above her father's shop opposite the City. She was a neighbour, not a resident. The narration is secondary.)
- **Date of the record:** 2025-01-07 (ACOO); 2025-10-01 (集誌社); memories from 1967 on
- **Files:**
  - `top-zh-testimony-6-page.html` (in `local/`, not in git): HTML of the ACOO article; https://www.acoo.hk/acooperson/%e3%80%90%e7%95%99%e4%bd%8f%e9%be%8d%e5%9f%8e%e3%80%91ep-1-%e5%be%9e%e5%9f%8e%e5%af%a8%e9%96%8b%e5%a7%8b-%e9%99%aa%e4%bc%b4%e4%b9%9d%e9%be%8d%e5%9f%8e%e8%b5%b0%e9%81%8e%e5%8d%8a%e5%80%8b%e4%b8%96/; 192791 bytes; SHA-256 `0945d98e289125a0e7ca7dfc90f2e1856f8a05a1dc2b70c417bf9b0c61ca58e9`; licence: no licence or © statement found on the page; © ACOO assumed (https://www.acoo.hk/acooperson/%e3%80%90%e7%95%99%e4%bd%8f%e9%be%8d%e5%9f%8e%e3%80%91ep-1-%e5%be%9e%e5%9f%8e%e5%af%a8%e9%96%8b%e5%a7%8b-%e9%99%aa%e4%bc%b4%e4%b9%9d%e9%be%8d%e5%9f%8e%e8%b5%b0%e9%81%8e%e5%8d%8a%e5%80%8b%e4%b8%96/)
  - not downloaded (curl exit 56): HTML of the 集誌社 article on the same shop; https://thecollectivehk.com/%e4%b9%9d%e9%be%8d%e5%9f%8e%e9%87%8d%e5%bb%ba-3%ef%bd%9c%e5%b4%87%e9%ba%9f%e9%9e%8b%e6%a5%ad%e3%80%8058-%e5%b9%b4%e8%80%81%e5%ba%97%e3%80%80%e5%8e%9f%e5%8d%80%e8%a6%93%e8%88%96%e8%87%aa%e6%95%91/; licence: not stated on the text I read; © 集誌社 assumed (https://thecollectivehk.com/%e4%b9%9d%e9%be%8d%e5%9f%8e%e9%87%8d%e5%bb%ba-3%ef%bd%9c%e5%b4%87%e9%ba%9f%e9%9e%8b%e6%a5%ad%e3%80%8058-%e5%b9%b4%e8%80%81%e5%ba%97%e3%80%80%e5%8e%9f%e5%8d%80%e8%a6%93%e8%88%96%e8%87%aa%e6%95%91/)
- **Note:** its 13 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| ACOO web page, section 1 | Tella was 3 in 1967 and lived as a child in the flat above the shop. | "仲係小朋友嘅時候，就住喺呢度樓上" (when I was still a child I lived upstairs here) |
| second article: 集誌社 2025-10-01 (see status_note), paragraph 3 | Tella said that the stall had everything a home needed. | "屋企需要用嘅嘢乜都有" (it had everything a home needed) |
| second article: 集誌社 2025-10-01 (see status_note), paragraph 6 | Many people who had come illegally lived in Kowloon City, and the stall was always crowded. | "唔使點做都有生意" (you got business without doing much) |
| second article: 集誌社 2025-10-01 (see status_note), paragraph 6 | After the City and the airport were cleared, many people moved out, and the shop's trade fell. | "由非常之熱鬧、熱鬧之中團結嘅地方，一路一路睇住佢靜。" (from a very lively place, united in its liveliness, I watched it go quiet bit by bit.) |

- **Leads:**
  - 集誌社, 「圖輯｜九龍城重建｜56年鐵皮檔 街坊鞋店憂「冇得留低」」 (photo set on the same iron stall; linked from the 集誌社 article)
  - 集誌社, 「九龍城重建 4｜ 《九龍城寨》取景地 逾半世紀念敬佛社 標誌金柱、跛豪「題字」招牌帶不走」 (linked from the 集誌社 article; not opened)
### top-en-testimony-1: Steve Vickers' 50 years of battling Hong Kong's criminal underworld

- **Status:** Read on 2026-11-19; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Annemarie Evans, 'Steve Vickers' 50 years of battling Hong Kong's criminal underworld', South China Morning Post, Post Magazine; reproduced by Steve Vickers Associates, page dated Tuesday, 23 September 2025, https://stevevickersassociates.com/media/sv-interviewed-by-scmp-postmag-re-his-50-years-of-battling-hong-kongs-criminal-underworld
- **Class:** retrospective (A former police inspector's own words about his first posting (from 1975): retrospective (2025). The reporter's narration is secondary.)
- **Date of the record:** 2025-09-23
- **Note:** its 1 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| article | Steve Vickers started police training in February 1975, on a two-year contract. | "I was scooped up into police training in February 1975." |
| article | After training he went as a young inspector to Kowloon City, which then included the Walled City. | "I came out of training and was sent off (as a young inspector) to Kowloon City, which in those days included the" |
| article | He says of Kowloon City and the Walled City: 'All sorts of things went on there.' No detail of life inside the City follows. | "All sorts of things went on there." |
| article | On information from one of his policemen, he climbed the side of a building to a 4th-floor place, which was a drug store run by a gang; he seized drugs and paraphernalia. The article does not say if the place was in the Walled City. | "it turned out to be a proper drug storage centre run by some unpleasant-looking bods." |
| article | The local police, vice, regional units and the Narcotics Bureau each came to talk to him about the raid. He was then moved to Kai Tak airport security, which ended his first Kowloon City posting. | "So that was the end of my Kowloon City career and I was then sent to the airport (at Kai Tak)" |
| article | Later he went back to Kowloon City, then to the regional crime unit for homicide and armed crime. | "LATER, I WENT BACK to Kowloon City and then on to the regional crime unit dealing with homicides and armed crime." |

- **Leads:**
  - The SCMP Post Magazine original of the interview (URL and date not seen).
### zh-testimony-12: 【淑梅足跡】電影多面手林家棟

- **Status:** Read on 2026-11-20; a checker checked a sample of the facts on 2026-11-20.
- **Citation:** 車淑梅, 【淑梅足跡】電影多面手林家棟, Wen Wei Po (香港文匯報), 21 Apr 2026, https://www.wenweipo.com/a/202604/21/AP69e68722e4b0b49ad1b7b54b.html
- **Class:** retrospective (Retrospective (2026): the actor 林家棟 speaks of his own childhood in the City. The years are not given here.)
- **Date of the record:** 2026-04-21
- **Files:**
  - `zh-testimony-12-AP69e68722e4b0b49ad1b7b54b-f70ad2a4.html` (in `local/`, not in git): HTML of the column (short page); https://www.wenweipo.com/a/202604/21/AP69e68722e4b0b49ad1b7b54b.html; 120228 bytes; SHA-256 `ec2537f5f2cba2e53ea49bc992624fe3628cdf951b91300626f27706c5a99af5`; licence: 香港大公文匯傳媒集團香港文匯報版權所有 (page footer) (https://www.wenweipo.com/a/202604/21/AP69e68722e4b0b49ad1b7b54b.html)

| Page | Fact | Words in the source |
|---|---|---|
| para. 3 | 林家棟 lived in the City as a child. | "小時候住九龍城寨" (As a child I lived in Kowloon Walled City) |
| para. 3 | The makers of the film 《九龍城寨之圍城》 asked some former neighbours of the City for advice. | "《九龍城寨之圍城》也找來當年一些街坊給予意見" (the film also brought in some neighbours of those years to give advice) |
| para. 3 | He says the real City was worse than in the film: syringes all over the ground. | "真實中的城寨環境比電影更惡劣，滿地針筒" (the real City was worse than the film, with syringes all over the ground) |
| para. 3 | Many people had bent backs and legs and waited to inject or take heroin (the quote does not say that the heroin caused the bent backs). | "好多人背脊和雙腳彎曲等打針食白粉" (many people with bent backs and legs, waiting to inject or take heroin) |
| para. 3 | Inside the City one could not see the sky, and the gaps between buildings were not wider than two feet. | "裏面是不見天的，大廈之間不會闊過兩呎" (inside you could not see the sky; the gaps between the buildings were no wider than two feet) |
| para. 3 | As a child he loved to watch the aircraft in the sky. | "最愛望着天上的飛機" (loved most to watch the aircraft in the sky) |
### top-en-testimony-2: A varied and interesting career

- **Status:** Read on 2026-11-19; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Offbeat (newspaper of the Hong Kong Police Force), issue 754, 2-15 July 2003, 'A varied and interesting career', section 'Sojourn in the Walled City', https://www.police.gov.hk/offbeat/754/eng/n04.htm
- **Class:** secondary (A third-person career profile written in 2003, not the officer's own testimony; it has no fact on the City. It belongs in secondary-sources/ (or only as a lead).)
- **Date of the record:** 2003-07 (issue 754, 2-15 July 2003)
- **Note:** the reader classed the whole item as secondary: its 4 facts are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

- **Leads:**
  - Chan Chin-cheung, crime chief of Kowloon City Division from May 1982 to 1984: a possible person for an oral history of policing the City (no contact details recorded).
### repo-audit-16: About | ALBERT NG; About - Ps. Albert Ng's Blog; Pastor Albert Ng (Island ECC)

- **Status:** Read on 2026-11-17; a checker checked a sample of the facts on 2026-11-19.
- **Citation:** Albert Ng, 'About', Ps. Albert's Blog (Wix), ©2020, https://psalbertng.wixsite.com/blog/about; Albert Ng, 'About', https://pastoralbertng.wordpress.com/about/ (undated); Island Evangelical Community Church, 'Albert Ng', https://www.islandecc.hk/ministry-leaders-and-elders/albert-ng/ (undated)
- **Class:** retrospective (Self-descriptions of a former resident (Wix page ©2020): retrospective (2020 or later). The Island ECC page is a church's third-person biography (secondary narration).)
- **Date of the record:** undated (Wix page ©2020)
- **Note:** its 1 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| Wix About page | Albert Ng was born in a farming village in mainland China. His mother took him and his sister to Hong Kong when he was a young child. | "My mom took me and my sister to HK when I was a young kid." |
| Wix About page; WordPress About page | His family lived in the Walled City until it was demolished. | "We lived in the infamous Kowloon Walled City until it was demolished." |
| Wix About page; Island ECC page | He studied engineering at the University of Hong Kong; Island ECC says Electrical and Electronic Engineering. | "After studying Engineering at the University of Hong Kong, I served in a campus ministry." |
| WordPress About page (16 years, 2008); Island ECC page (Campus Crusade for Christ, 'as a pastor') | He worked 16 years in a campus ministry and joined Island ECC in 2008. The Island ECC page names the ministry, Campus Crusade for Christ, and says that he joined as a pastor. | "I worked in a campus ministry for 16 years before joining" |

- **Leads:**
  - Albert Ng's planned book about the Kowloon Walled City (Island ECC page; no title or date).

## More items: the leads of the reading of 2026-11 (catalogued, not read)

- **Status:** read: 8 of 8 items read by the reading of the source search of 2026-11.
  A checker checked a sample of the facts. Each fact gives its page and a short exact quote.

### lead-l0116: Interview: Photographing the 'Shabby, Squalid Dignity' of the Kowloon Walled City

- **Status:** Read on 2026-11-25; a checker checked a sample of the facts on 2026-11-25.
- **Citation:** Wilfred Chan, 'Interview: Photographing the 'Shabby, Squalid Dignity' of the Kowloon Walled City', Asia Blog, Asia Society, 7 February 2014 (interview by email with Greg Girard and Ian Lambot), https://asiasociety.org/blog/asia/interview-photographing-shabby-squalid-dignity-kowloon-walled-city ; read in the Wayback snapshot https://web.archive.org/web/20250214104319/https://asiasociety.org/blog/asia/interview-photographing-shabby-squalid-dignity-kowloon-walled-city
- **Class:** retrospective (First-hand memories of the two photographers of their work in the City (1986-1992), given in 2014: retrospective (2014). The introduction and the photo captions are by the blog (secondary).)
- **Date of the record:** 2014-02-07
- **Files:**
  - `lead-l0116-interview-photographing-shabby-squalid-dignity-kowloon-walle-ce11e159.html` (in `local/`, not in git): HTML of the interview page (Wayback snapshot of 14 Feb 2025); text only is wanted, the photos are Greg Girard's; https://web.archive.org/web/20250214104319/https://asiasociety.org/blog/asia/interview-photographing-shabby-squalid-dignity-kowloon-walled-city; 135992 bytes; SHA-256 `bf053eefe8a637bfbf405780f8a0e4508e6bfc11496889eb103fdff327af5891`; licence: ©2025 Asia Society (page footer); no open licence (https://web.archive.org/web/20250214104319/https://asiasociety.org/blog/asia/interview-photographing-shabby-squalid-dignity-kowloon-walled-city)
- **Note:** its 2 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| Wayback snapshot of 14 Feb 2025, answer of Girard to 'How did you start photographing' | Girard says that he found the City one night in 1986, while he photographed the streets of Kowloon City near Kai Tak airport. | "I "discovered" it one night in 1986 while photographing in the streets in Kowloon City near Kai Tak airport." |
| Wayback snapshot of 14 Feb 2025, answer of Girard to 'How did you start photographing' | Girard saw the City lit by the lights of its flats: not one building and not separate buildings, but a glowing mass of buildings joined and piled together. | "It was a glowing agglomeration of buildings joined and piled together." |
| Wayback snapshot of 14 Feb 2025, answer of Lambot to 'How did you start photographing' | Lambot says that in the early 1980s the City, seen from outside, looked like other old parts of Hong Kong, and that a large, well-established squatter settlement still surrounded it. | "especially in the early 1980s when it was still surrounded by the large and well-established squatter settlement there." |
| Wayback snapshot of 14 Feb 2025, answer of Lambot to 'How did you start photographing' | Lambot went back to the City only after the clearance was announced in January 1987. By then the squatter settlement around it had been cleared, and the City stood alone. | "the squatter settlement had been cleared away, so the Walled City was standing there alone in its shabby, almost squalid dignity." |
| Wayback snapshot of 14 Feb 2025, answer of Lambot to 'How did you start photographing' | Lambot worked from the outside in: first shots from a distance, then the larger alleys, then the smaller and more remote ones, then the staircases. | "the larger, more clearly defined ones to begin with, then the smaller and more remote, and then the various staircases." |
| Wayback snapshot of 14 Feb 2025, answer of Girard to 'What was it like to go inside?' | Girard says that before the demolition was announced in 1987 there was much hostility to cameras: people gave him the evil eye and slammed doors. He blames the sensational press of the time. | "people were giving you the evil eye and slamming doors if you were walking around with a camera at that time." |
| Wayback snapshot of 14 Feb 2025, answer of Girard to 'What was it like to go inside?' | Girard says that access became easier after the announcement of the demolition and the relocation, because people understood that the place's days were numbered. | "It got easier as people understood that the place's days were numbered." |
| Wayback snapshot of 14 Feb 2025, answer of Girard to 'What was it like to go inside?' | Girard's route: the airport express bus from Central to Kai Tak airport, then a walk of about four blocks to the City. | "take it to Kai Tak airport and then walk the four blocks or so to the Walled City" |
| Wayback snapshot of 14 Feb 2025, answer of Girard to 'What was it like to go inside?' | Girard gave prints to the people whom he had photographed. These visits led to introductions to neighbouring homes and businesses. | "I might have photographed someone on an earlier visit and made prints to give to them" |
| Wayback snapshot of 14 Feb 2025, answer of Girard to 'What was it like to go inside?' | In the public spaces Girard photographed the alleys, the shop fronts, the rooftops and the stairways. | "the alleys, the shop exteriors, the rooftops, or stairways." |
| Wayback snapshot of 14 Feb 2025, answer of Lambot to 'What was it like to go inside?' | Lambot says that the doors of premises were often wide open, so he could walk into shops, clinics, schools and factories. | "frequently wide open, allowing you to wander in to all sorts of locations normally out of bounds — shops, clinics, schools, and factories." |
| Wayback snapshot of 14 Feb 2025, answer of Lambot to 'What was it like to go inside?' | Lambot says that most people were more baffled than offended by his interest in their premises; he remembers only one place that refused him. | "And I only ever remember one place that specifically said no." |
| Wayback snapshot of 14 Feb 2025, answer of Lambot to 'What was it like to go inside?' | Lambot says that he saw almost no evidence of triads or drugs in the City. | "Despite all the stories of the triads and drugs, I had seen almost no evidence of this while I was in the City" |
| Wayback snapshot of 14 Feb 2025, answer of Lambot to 'What was it like to go inside?' | Lambot says that nearly everyone seemed happy to live or work in the City, in spite of the conditions. | "Despite the conditions, nearly everyone seemed to be happy living or working there." |
| Wayback snapshot of 14 Feb 2025, answer of Girard to 'What was it like to go inside?' | Girard says that the City never felt crowded: the alleys had constant traffic and activity, but they were never crowded. | "The alleys were never crowded, though there was constant traffic and activity." |
| Wayback snapshot of 14 Feb 2025, answer of Girard to 'What was it like to go inside?' | Girard says that living space was tight, but not as small as the cubicle and box homes of Hong Kong in 2014. | "living space was tight, but not as reduced as we see in Hong Kong today with people living in cubicles" |
| Wayback snapshot of 14 Feb 2025, answer of Girard to 'What was it like to go inside?' | Girard says that many flats had no window that opened onto air or light. | "Many apartments did, however, lack windows that opened into air or light" |
| Wayback snapshot of 14 Feb 2025, answer of Girard to 'What was it like to go inside?' | Girard says that for most people the way from the front door to the first daylight went down several floors of stairs and then along a series of alleys. | "usually involved a walk down several floors of stairs and then along a series of alleys before emerging into the light of day" |
| Wayback snapshot of 14 Feb 2025, answer of Lambot to 'So what insights did you take away' | Lambot says that the City mixed living, work and leisure closely, and that this closeness made it a community. | "how the proximity of life, work, and leisure creates a community." |
| Wayback snapshot of 14 Feb 2025, answer of Lambot to 'How have you seen Hong Kong change' | Lambot came to Hong Kong in 1979. | "I arrived in 1979" |
| Wayback snapshot of 14 Feb 2025, answer of Girard to 'How have you seen Hong Kong change' | INFERRED: Girard sees traces of the City in the walk-up buildings of Kowloon City in 2013: metal grille work on doors and mailboxes, use of the spaces between buildings, and illegal rooftop additions. He implies that the City had the same features. | "the metal grill work on the doors and mailboxes, the use of the spaces between the buildings, the illegal rooftop additions" |
| Wayback snapshot of 14 Feb 2025, answer of Girard to 'If you could go back' | Girard once saw a Cathay Pacific stewardess in uniform walk into the City pulling a suitcase, probably coming home after a flight. She disappeared into the alleys before he could photograph her. | "The Cathay Pacific stewardess who I saw, in uniform, one day walk into the Walled City pulling a suitcase, probably returning home after a flight." |

- **Leads:**
  - Asia Society Hong Kong panel video 'Inside Kowloon Walled City', 11/12/13, embedded in the post (probably the same event as the panel report top-blocked-a-7).
### lead-l1003: 夏銘記：做生意唔呃秤 真魚蛋唔彈牙

- **Status:** Read on 2026-11-26; a checker checked a sample of the facts on 2026-11-26.
- **Citation:** 陳嘉文 (text; photos 陳嘉文 and 劉焌陶), '夏銘記：做生意唔呃秤 真魚蛋唔彈牙', 評台 (Pentoy), 7 September 2015 (first printed in 明報副刊, Ming Pao supplement), https://www.pentoy.hk/?p=38215 (Wayback capture 20181128075143: https://web.archive.org/web/20181128075143/https://www.pentoy.hk/%e5%a4%8f%e9%8a%98%e8%a8%98%ef%bc%9a%e5%81%9a%e7%94%9f%e6%84%8f%e5%94%94%e5%91%83%e7%a7%a4-%e7%9c%9f%e9%ad%9a%e8%9b%8b%e5%94%94%e5%bd%88%e7%89%99/)
- **Class:** retrospective (Retrospective (2015): the owner's own words about his work from 1967; the reporter's narration (the dates of 1968, 1969 and 1983) is secondary. A later feature article: it stays in primary-sources/ as testimony, with the narration marked secondary.)
- **Date of the record:** 2015-09-07
- **Note:** its 4 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| section 自家製丸起家, para 1 | From the City home workshop he was known as the 'cuttlefish ball king' and supplied famous Chiu Chow restaurants: 金都, 興隆樓, 昇平 and 潮州城 (names in Chinese only). | 「人們說老夏是墨魚丸大王」……「金都呀、興隆樓呀、昇平呀、潮州城呀。 ('People said old Ha was the cuttlefish ball king' ... '金都, 興隆樓, 昇平, 潮州城.') |
| section 自家製丸起家, para 1 | After 1983 (at Victory Road, not in the City) a hired fish-ball master earned HK$300 a day, and owners bought him a bottle of brandy each day; this master gambled and borrowed HK$1,000 at a time. | "師傅人工三百元一日，有時問我借錢，一借就一千，當晚就輸清光" (The master's wage was 300 dollars a day; sometimes he borrowed from me, a thousand at a time, and lost it all that night) |
| section 讀書人 托幾十斤米搵食 | INFERRED: His first job (1967-68) was rice delivery: a man who could carry rice on his shoulder was paid 220, one who could not 200 (the article does not say per month; INFERRED monthly). He carried 30 catties of rice on one shoulder and a can of kerosene in the other hand up the stairs. | "識得托米，人工二百二；唔識托，二百……我一邊托住三十斤米，另一邊拿一罐火水，咁樣抽上去" (If you could carry rice, the wage was 220; if not, 200 ... I carried thirty catties of rice on one side and a can of kerosene on the other, up the stairs) |
| section 讀書人 托幾十斤米搵食 | His rice-shop boss cheated customers on weight: for an 18-catty order he wrote a second bill for 20 catties and gave it to homes that had no scale. The homes he delivered to were dark, with children crawling on the floor. | "客人訂十八斤米……老闆事先開兩張單，一張寫十八斤，一張寫二十斤" (A customer ordered 18 catties of rice ... the boss wrote two bills beforehand, one for 18 catties and one for 20) |
| section 讀書人 托幾十斤米搵食 | He said he worked 18 hours a day for many years without a break. | "日日做十八個鐘呀，咁多年來無停過" (Eighteen hours every day, without a stop for all these years) |
| section 慨嘆潮州魚蛋不再正宗; 本地鮮魚難求 | Fish balls in his craft used four fish: 黃鱔, 白䱛, 寶刀 and 九棍; in the past the fish came fresh from Aberdeen. | "打魚蛋要用四種魚，黃鱔、白䱛、寶刀、九棍" (To beat fish balls you must use four fish: 黃鱔, 白䱛, 寶刀, 九棍) |
| section 打魚蛋靠經驗; 自家製丸起家 | A hired master got about 75 catties of fish balls from 100 catties of fish; 夏藩銘 got about 5 catties more by scraping hard with a big spoon. He and his wife beat the paste with triangular iron bars. | "一百斤魚，師傅打的話，大約有七十五斤魚蛋，自己打，可以多打出五斤" (From a hundred catties of fish a master gets about seventy-five catties of fish balls; doing it myself I can get five catties more) |
| section 手打魚蛋食唔番; 慨嘆潮州魚蛋不再正宗 | INFERRED: 夏藩銘's family home town was Jieyang (揭陽), Shantou (汕頭); he was 78 and a half in 2015 (born about 1937, INFERRED). | "自言「今年七十八歲半」" (He says of himself 'seventy-eight and a half this year') |
| section 手打魚蛋食唔番; caption; 後記 | His workshop (in 2015, in Yau Ma Tei) was at least ten degrees hotter than the street, over 40 degrees inside; he fried fish cakes of half a catty each in a big wok on the floor, and replaced a third of the oil each day. | "工場裏，溫度比街外至少高十度" (In the workshop the temperature is at least ten degrees higher than outside) |

- **Leads:**
  - The original Ming Pao supplement (明報副刊) printing of the same article, early September 2015
  - The 1980s Hong Kong Tourist Association film on local food that featured Ha Ming Kee's fish balls (named in the article, no title)
### lead-l1017: My Kowloon Walled City Story (blog): the 24 posts other than 'My Friend Ah Meng', 2014-2016

- **Status:** Read on 2026-11-26; a checker checked a sample of the facts on 2026-11-26.
- **Citation:** KowloonWalledCityBoy (identified in the repo as Albert Ng Kam-po), My Kowloon Walled City Story (blog, WordPress.com), 25 posts, 11 April 2014 - 21 November 2016, https://mykowloonwalledcityblog.wordpress.com/ (post list: https://public-api.wordpress.com/rest/v1.1/sites/mykowloonwalledcityblog.wordpress.com/posts/)
- **Class:** retrospective (Retrospective (2014-2016): a former resident's own memories of his family's homes next to and inside the City, from June 1974 to the mid-1980s. The history posts and the 'Strip Shows' post are secondary (retold from other sources).)
- **Date of the record:** 2014-04-11 to 2016-11-21 (events 1974 to about 1986)
- **Files:**
  - `lead-l1017-page-301e50c8.html` (in `local/`, not in git): HTML of the post 'Where’s My Water?' (water fee, salt water, public water stations); text only, the photos are of unknown source; https://mykowloonwalledcityblog.wordpress.com/2014/06/24/where-my-water/; 96259 bytes; SHA-256 `a0790a922e34809d9ba690e4dfe7fc60370f29c2c85e855ba97ee316039055c3`; licence: No licence or copyright notice on the blog (all rights reserved by default) (https://mykowloonwalledcityblog.wordpress.com/)
  - `lead-l1017-page-6b1a4554.html` (in `local/`, not in git): HTML of the post 'Home in the Sin City' (Sam Fat Building, No. 8 Sz Kung Street, plan of the flat); text only; https://mykowloonwalledcityblog.wordpress.com/2014/06/17/home-in-sin-city/; 111443 bytes; SHA-256 `b4c055756bef2d599259149d55f2f7fc5b5cbaa367f42addfe5e16e000bceea6`; licence: No licence or copyright notice on the blog (all rights reserved by default) (https://mykowloonwalledcityblog.wordpress.com/)
- **Note:** its 3 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| 'The Road to Kowloon City' (2014-04-11), paras 7, 13, 14 | The author came to Hong Kong from a farming village near Shantou in June 1974, at the age of 7, with his mother and his sister Karen, who was two years younger. They crossed at Lo Wu and spoke only Teochew. | "In a hot summer day in June 1974, my mom walked through the immigration of the famous Lo Wu check point" |
| 'From the River to the Road' (2014-04-17), paras 12-13 | The family's first stop was the three-storey building of the Lam family on Lung Kong Road, Kowloon City, outside the City. Mr Lam ('big uncle') was from the same region of Shantou. | "The family who hosted us when we first arrived Hong Kong lived in a three-storey building in Lung Kong Road." |
| 'From the River to the Road', paras 15-16 | Mr Lam ran an embroidery business out of his building: a rented retail shop on the ground floor, storage and work area on the second floor, home, office and workshop on the third floor, and a small garden on the roof. The author's mother worked for him, at times late into the night. | "Big uncle owned a business which produced and distributed Chinese embroidery products." |
| 'Where is Dad?' (2014-04-22), paras 6, 8 | The father was born in Thailand in the mid-1930s, came to Hong Kong in the 1950s, worked as a floorman in a garment factory, then became a sailor on container ships for about four decades and came home about once a year. | "Dad was born in the mid-1930s. He came to Hong Kong to work some time in the 1950s." |
| 'Where is Dad?', para 11 | Because the father was an 'Overseas Chinese', he could apply legally for his family to move to Hong Kong. | "dad had the legal privilege of applying for his family to move to Hong Kong" |
| 'Our 50 sq. ft. home' (2014-04-26), paras 3-4 | The family's first rented home (1974) was a board-partitioned room (板間房) on the 2nd floor of a flat in the middle of Tak Ku Ling Road, just south of the City. At least three households shared the flat: the landlord, the family and a single man. | "Our home was situated right in the middle of Tak Ku Ling Road, which connected to the Kowloon Walled City in the north" |
| 'Our 50 sq. ft. home', para 3 | The author describes board-partitioned rooms as sub-divided units of a flat, 10-odd to over 100 sq ft, with thin wooden board walls; tenants were normally not allowed to cook inside their rooms. | "The size of these “cubicle apartments” range from 10 sq. ft. plus to over 100 sq. ft." |
| 'Our 50 sq. ft. home', para 5 | The room was about 6 by 8 feet, with a double bunk bed (mother below, the two children above), a treadle Singer sewing machine that the mother used for piecework for Mr Lam, and a small folding table for meals. | "Our “home” was a rectangular room of roughly 6 by 8 feet. We had a double bunk bed." |
| 'Our 50 sq. ft. home', paras 6-7 | The households shared one cooking area with at least three kerosene stoves side by side and big tin cans of spare kerosene; the boy pumped kerosene into the stove and changed the wick. | "I remember at least 3 kerosene stoves sitting next to one another and there were big tin cans containing extra kerosene for refill." |
| 'Our 50 sq. ft. home', para 8 | The board partition between rooms had two carved openings of about 1 by 2 feet near the ceiling, used for hanging clothes and for air, so there was no privacy. | "the partition had 2 big “holes” ( roughly 1 by 2 feet) at the top near the ceiling" |
| 'Our 50 sq. ft. home', paras 10, 13 | The author went to Ching Ching English-Chinese Kindergarten (菁菁中英文幼稚園), also on Tak Ku Ling Road, from about late 1974; a punishment there was to hold a stick over the head during recess. | "Ching Ching English-Chinese Kindergarten (菁菁中英文幼稚園)" |
| 'Our 50 sq. ft. home', para 15 | He then went to Ng Wah College in San Po Kong, from Primary 1 to Form 5. | "I was admitted to Ng Wah College which I studied from Primary 1 to Form 5." |
| 'Father on the 10th Floor' (2014-05-09), paras 1-2, 10 | The second home was a better sub-divided unit on the 10th floor of a building on Tak Ku Ling Road nearer Carpenter Road, with no lift. It had a window on the street with metal bars. | "We also upgraded ourselves from the 2nd floor to the 10th floor." |
| 'Father on the 10th Floor', paras 6-8 | In that 10th-floor flat the family's room was the smaller of two rooms; the other family's bigger room held their table, cupboard and a black-and-white TV. The family rented the shared front area as its 'living room', where its dining table and a small cupboard stood, and the landlord rented a telephone there for the two families. | "The landlord even rented a telephone unit and placed it in “my own” living room for the two families to use!" |
| 'Father on the 10th Floor', paras 14-15 | After a ship accident broke his leg, the father was sent home; the mother walked him down and up 10 floors to bone-setters (跌打), then bought the raw herbs and made the dressings at home to save money and trips. | "those Chinese practitioners specialized in broken bones" |
| 'Father on the 10th Floor', paras 18-19 | To see the father off, the family walked along Tak Ku Ling Road, through the tunnel, to the Kai Tak terminal; another level of the terminal let people watch the planes. | "We walked along Tak Ku Ling Road, cross the tunnel, exit on the left, and entered the airport terminal." |
| 'Home in the Sin City' (2014-06-17), paras 4-5 | The family then moved right into the City, to a new flat at No. 8 Sz Kung Street (社公街), in Sam Fat Building (三發樓). A small shrine to the deity 社公 stood next to the building and gave the street its name. | "We lived in no. 8, Sz Kung Street, and the name of the building was Sam Fat Building (三發樓)." |
| 'Home in the Sin City', para 3 | Before that move the family had always shared a flat with at least two other households; the Sz Kung Street flat was their own. | "Ever since we came to Hong Kong we had been sharing flat with at least 2 other families." |
| 'Home in the Sin City', para 7 | Sam Fat Building was 13 storeys high; the 14th level was the roof, with a water tank that was rarely or never used. The building had no lift, like every other building in the City. | "Sam is Fat building was 13 stories high. The 14th floor was the roof top where the rarely-to-never used water tank was." |
| 'Home in the Sin City', para 7; 'Rooftop' posts | The family lived on the 7th floor of Sam Fat Building. (A later post, 'My Friend Ah Meng', says the 8th floor; the two posts differ.) | "So, moving from 10th floor to 7th floor without an elevator was already an upgrade." |
| 'Home in the Sin City', para 8 | The flat had one bedroom made of wooden boards, big enough for a double bunk bed and a chest of drawers; the mother slept below and the sister above. | "It was a 1 bedroom flat. The bedroom was constructed by using wooden board" |
| 'Home in the Sin City', para 9 | The kitchen, next to the bedroom, held a kerosene stove, a refrigerator and some storage. | "big enough for a kerosene stove, refrigerator, and some storage space" |
| 'Home in the Sin City', para 10 | The toilet was a squat toilet on a floor raised about one foot; covered with a wooden plank it served as the shower and laundry room, and at New Year as the place to kill a live chicken. | "The floor was elevated above the ground by about 1 foot so as to accommodate the squat toilet." |
| 'Home in the Sin City', para 11 | The family ate at a square folding table, like those of street food stalls, and had no dining table. | "We didn’t have a dinning table. We had a square foldable table instead" |
| 'Home in the Sin City', para 12 | The boy slept on a wooden plank outside the bedroom wall, under a ceiling fan; in summer he wet the plank with a towel to cool it, and in winter he folded a duvet round himself. | "It was nothing more than a wooden plank which served as a sitting place during the day and the place where I slept during the night." |
| 'Home in the Sin City', para 13 | The flat had no air conditioner and no washing machine, and at first no TV. | "It was true that we didn’t have an air con unit at home, nor did we have a washing machine." |
| 'Happy Chinese New Year' (2015-02-19), 'Big Cleaning Day'; 'Happy Childhood - Fish Bones' (2015-04-25), para 4 | A later post gives the size of the Sz Kung Street home as about 200-250 sq ft (another says about 250 sq ft). | "As my home has quite a decent size, about 200-250 sq. ft." |
| 'Where’s My Water?' (2014-06-24), para 3 | A 'water lady' came to Sam Fat Building once a month to collect a water fee of HK$50 a month in the early 1980s. | "There was a “water lady” who would come to our building once a month to collect our “monthly water fee.” I still remember it was HKD 50 per month in the early 80s." |
| 'Where’s My Water?', para 4 | For that fee the building got water perhaps twice a month, or at most once a week, for about half an hour each time. At first the supply was constant, but it became rarer the longer they lived there. | "we got water supply perhaps twice a month (or at most once a week) for about half an hour each time" |
| 'Where’s My Water?', para 5 | The piped water was 'salt water', probably from underground, pumped to the roof tank; it was only for washing, cleaning and flushing. Water always came the day before the water lady's monthly visit. | "It was “salt water” which could only be used for washing, cleaning, and flushing the toilet." |
| 'Where’s My Water?', para 7 | Once the mother argued with the water lady and refused to pay; the water lady threatened to cut off the whole building. | "The water lady threatened to cut water supply to the whole building, but mom just didn’t budge." |
| 'Where’s My Water?', 'The Two Water Tanks at Home' | The flat had two big water tanks: one in the kitchen for fresh water for drinking and cooking, one outside the toilet for salt water (or fresh water when the supply stopped), plus buckets, bowls and pots. | "we had 2 huge water tanks at home, one outside the toilet and the other inside the kitchen" |
| 'Where’s My Water?', paras 9-10 | The government built several public water stations in the City, the only source of fresh drinking water. The nearest to Sz Kung Street was in 'Big Well Street', with rubbish all round it. | "the Hong Kong government built several public water supply stations throughout the City" |
| 'Where’s My Water?', para 11 | The boy's job was to carry a bucket down 7 floors to the Big Well Street water station and back up to fill the home tank; as a teenager he carried two buckets. | "My job as a boy was to take an empty bucket, walked down 7 floors, went to this particular water station" |
| 'Where’s My Water?', paras 13-14; 'Baby in a Cartoon Box', para 2 | The mother took laundry and two buckets to a cleaner, roomier water station farther away, washed the laundry and her hair there while talking with other women, and came back with one bucket of clean laundry and one of fresh water. | "she would fill the clean laundry in one bucket, fill another bucket with fresh water, and then she would happily walk home" |
| 'The Small Feet Old Lady from Qingdao (青島)' (2014-07-26), paras 1-3 | Sam Fat Building had the 'one stair, two flats' plan (一梯兩伙): each flat had an iron gate and a wooden door. The wooden door stayed open for air unless nobody was home, and most people slept with it open in summer. | "Sam Fat Building was a typical “one-stairway-two-families” (一梯兩伙) design." |
| 'The Small Feet Old Lady', para 4 | With the doors open, residents heard everyone on the stairs; the boy learned to tell neighbours by their footsteps. | "I could tell who was walking by simply by listening to the distinct sound of their steps!" |
| 'The Small Feet Old Lady', paras 5, 11 | A neighbour in the building was an old woman from Qingdao (青島), called 婆婆, who spoke Mandarin, made northern-style buns and dumplings, and had bound feet; she pulled herself up the stairs. | "One of the most interesting neighbors was an old lady from Qingdao (青島)." |
| 'Tung Tau Estate Block 23' (2014-08-30), paras 3-8 | A woman in Big Well Street paid the boy HK$2 to carry her groceries home; his mother feared it was a ruse to kidnap children for child labour. | “Son, can you help me carry these groceries home? I will give you 2 dollars.” |
| 'Tung Tau Estate Block 23', para 9 | Tung Shing Stationery (東成文具) in Block 23 of Tung Tau Estate (東頭村廿三座) sold stationery and toys; a model car cost HK$4. | "There was a stationary shop in Block 23 of Tung Tau Estate (東頭村廿三座) called 東成文具 (Tung Shing Stationary)." |
| 'Tung Tau Estate Block 23', paras 10-11, 'The Steamy Tunnel' | Block 23 of Tung Tau Estate, across the Kai Tak nullah from Ng Wah College, was the children's after-school meeting place, with free public table-tennis tables and a ground-floor passage lined with shops and noodle eateries that blew kitchen steam into it. | "For us, Block 23 was the agora, the meeting place, the center of our after school activities." |
| 'The Plain White Porridge (潮州白粥)' (2015-01-08), paras 3-6, 9 | The family ate Teochew plain white porridge (潮州白粥) every day, with fermented bean curd (腐乳), preserved vegetables, small salted crabs or shrimps, or a thumb-sized piece of salted fish; the mother shopped at the Kowloon City market. | "she cooked plain white porridge every day" |
| 'The Plain White Porridge', paras 13-16 | After the boy refused porridge, his mother bought cocktail buns and pineapple buns for breakfast almost every day from a bakery on Carpenter Road. | "This is the bakery from which we purchase our breakfast almost on a daily basis. (It is on Carpenter Road, Kowloon City.)" |
| 'The Plain White Porridge', para 17 | In the 1970s and 1980s Hong Kong phone numbers had 7 digits: a one-digit area code (3 for Kowloon) and six digits. | "The number “3” is the area code for Kowloon, “5” for Hong Kong Island, and “0” for New Territories." |
| 'Happy Chinese New Year' (2015-02-19), 'Big Cleaning Day' | Chinese New Year at home in the City (late 1970s and early 1980s): a big cleaning on lunar 28 December, when boxes stored under the beds were taken out, with cockroaches and rats found there. | "we made good use of the space under our beds. We packed everything that we don’t need for this month / season and stored them there." |
| 'Happy Chinese New Year', 'Family Reunion Dinner' | For the New Year's Eve reunion dinner the mother bought a live chicken several days before, kept it in the bathroom and fed it, then killed it; the meal had Teochew soup in a common bowl, fish and small oyster omelette (煎壕餅, as the post writes it). | "We kept it alive by placing it in our bathroom and fed it for several days." |
| 'Happy Chinese New Year', 'Lunar New Year Day' | On lunar New Year's Day the family went to a morning church service (the author sang in the choir), usually ate McDonald's for lunch, then visited family friends from the same region, as they had no true relatives in Hong Kong. | "My church always conduct a New Year service in the morning, and we will never miss it." |
| 'Happy Chinese New Year', 'The Wet Socks Chinese New Year' | The children wore their socks for three days before washing, because the mother washed all clothes by hand for three children and had no washing machine. | "mom did all the laundry by her bare hands and there were 3 kids at home" |
| 'Happy Chinese New Year', 'The Wet Socks Chinese New Year' | In wet weather the streets of the City had puddles everywhere, and laundry was hung on strings all over the flat ('flags of the nations', 掛萬國旗); in humid weather it did not dry in a week and the mother ironed it dry. | "The streets were wet with puddles all over the Kowloon Walled City." |
| 'Happy Childhood - Fish Bones' (2015-04-25), para 4 | The buildings stood so close that there was almost no air flow, and the flats were very hot in the warm months. | "as the buildings were cramped together with only a small space in between, air flow was virtually non existent" |
| 'Happy Childhood - Fish Bones', para 5 | The nearest playground, Kowloon Tsai Park, was about 20 minutes' walk away, so the children played on the roof. | "the nearest one, the Kowloon Tsai Park, is about 20 minutes walk away. So, instead of going out, we went up to the rooftop." |
| 'Happy Childhood - Fish Bones', 'The Fish Bone TV Antenna' | In the mid-to-late 1970s every family had its own 'fish bone' TV aerial on the roof, sometimes marked with its name. | "Back to the time of mid-late 70s, every family had their own Fish Bone. You could even put your name there" |
| 'Happy Childhood - Fish Bones', 'The Fish Bone TV Antenna' | To connect an aerial, a man on the roof lowered the cable down the outside of the building with a weight tied on, past other cables, water pipes and laundry, until someone in the flat caught it at the window. | "the father (or an older son) would go up to the rooftop, tied a heavy object to one end of the connecting cable" |
| 'Happy Childhood - Fish Bones' | The aerial was turned by hand for the best picture while people shouted between the roof (14th level) and the flat (7th floor); it had to be re-tuned after typhoons and new aerials. | "Yes, I mean they shouted between the 7th floor and the 14th floor." |
| 'Happy Childhood - Fish Bones' | Sound carried well between the close buildings: the boy heard a girl two floors up reciting her Chinese poems. | "I still remember hearing the girl 2 floors above us reciting her Chinese poems." |
| 'Chasing the Belly of an Airplane' (2015-04-30), para 1 | Most men worked during the day, and some at night, and seldom went to the roof except to fix the aerials. | "Most men were busy at work during day time (and some during the night time as well)." |
| 'Chasing the Belly of an Airplane', 'Rooftop Fun' | Some residents dumped big rubbish (mattresses, wooden items) on the roofs, because the nearest place to dispose of them in the City was through several dark, dripping alleys. | "you would have to drag your big times through 7 dark allies, with water dripping above your head and puddles below your feet" |
| 'Chasing the Belly of an Airplane', 'Rooftop Fun' | Children of 6 or 7 played on the roofs without adults; some rode bicycles along the roof. | "See, there was no adult around." |
| 'Chasing the Belly of an Airplane', 'Chasing the Belly' | The City was about 10 minutes' walk from Kai Tak airport. When a plane passed, teachers stopped talking, pupils covered their ears, TV pictures broke up and preachers stopped. | "Teachers in my school would stop talking and all students would cover their ears" |
| 'Chasing the Belly of an Airplane', 'The Kites and the Bellies' | Children flew kites from the roofs, cut each other's lines with sharp line, and tried to steer kites toward the low planes. | "When planes were flying by, we would try to steer the kites towards the planes" |
| 'The Rooftop Fear Factors' (2015-05-03), 'Rattan Cane' | The father beat the family's cotton duvet with a rattan cane on the roof, hung on a laundry line, to clean it in the sun. | "After we arrived the rooftop, dad hanged the duvet over a laundry string." |
| 'The Rooftop Fear Factors', 'Jumping Off the Rooftop' | Many roofs joined; some had gaps of a few feet. Next to Sam Fat Building was a building only two to three feet away, with one or two water pipes across the gap; older children jumped it. | "there was one building next to ours which was probably only two to three feet away" |
| 'Teacher, I Don’t Want to Jump !' (2015-05-28) | The author's primary class had over 40 pupils; P.E. was held in a covered playground (at Ng Wah College, outside the City). | "All through this time, all my classmates, over 40 of them, were watching me." |
| 'The Men in White Underpants' (2015-06-07), 'The Dragon and the Phoenix' | Two men ran a timber workshop in a flat on the 2nd floor of Sam Fat Building, carving dragons and phoenixes (for restaurant banquet halls) in the 1970s and 1980s, working on the floor in white underpants. | "The two men in underpants worked on the 2nd floor. They turned one of the residential units into a timber workshop." |
| 'The Men in White Underpants', 'The Hing’s Underpants Guys' | The workshop's sawdust came out of its door onto the stairs and corridor, which became slippery. | "There was so much saw dust on the stairs and corridor that the floor became slippery at times." |
| 'The Men in White Underpants', para 4 | The author's walk home: along Big Well Street, left into Sz Kung Street, right into Sam Fat Building. | "In most of my dreams I would walk on “Big Well Street,” turned left into “Sz Kung Street” and then turn right into the Sam Fat Building." |
| 'Baby in a Cartoon Box' (2015-06-26), para 2 | The mother had a part-time home job sewing pillowcases and blankets. | "She continued her part time job sewing pillow cases and blankets." |
| 'Baby in a Cartoon Box', para 4 | The children took turns mopping and washing dishes, and went with the mother to the Kowloon City wet market to carry groceries. | "We would rotate mopping the floor and doing dishes after dinner." |
| 'Baby in a Cartoon Box', paras 6-8 | Families used free apple cartons from the fruit hawkers of the Kowloon City wet market for storage under the beds; later, when demand was high, hawkers charged 50 cents a box. | "the hawkers started to charge 50 cents each" |
| 'Baby in a Cartoon Box', 'Going to the Hospital' | The mother saw an unlicensed woman doctor from the Mainland, a family friend who spoke Teochew, when she was unwell; she had no pre-natal check-up that the author remembers. | "Mom did go to a family friend who was an unlicensed female doctor (from Mainland China)." |
| 'Baby in a Cartoon Box', 'Going to the Hospital' | INFERRED: The mother went to hospital for three days to give birth to a third child, June, when the author was not yet 12 (about 1978-79, INFERRED from his age of 7 in June 1974); the Fong family one floor below watched the children. The baby slept in an apple carton. | "My mom did ask the Fong family one floor below us to keep an eye on us." |
| 'The Bloody Tuberculosis' (2015-07-03) | When the author coughed blood one evening, it took about 15 minutes to get out of the City to transport; they took a taxi from Carpenter Road to Queen Elizabeth Hospital, then he was referred to the East Kowloon Chest Clinic in Diamond Hill. | "It took us about 15 minutes or so just to get out of the Walled City to find any transportation." |
| 'The Bloody Tuberculosis' | The chest clinic diagnosed tuberculosis with a needle skin test and told him to use two pairs of chopsticks, one for serving and one for eating. | "you need 2 pairs of chopsticks: one pair for you to bring food to your bowl, the other pair for you to put food into your mouth" |
| 'Tuberculosis: The Treatment (Part 1 of 2)' (2015-07-10) | INFERRED: He chose the Kowloon Hospital Chest Clinic (Argyle Street and Waterloo Road) for its bus links; his patient code began '85E' (perhaps 1985, INFERRED from the code and the public examination the next year). | "I will never ever forget my patient code. It begins with “85E.”" |
| 'Tuberculosis: The Treatment (Part 1)' | TB treatment was free: the government paid for tests, X-rays, medicine and consultations. | "the treatment of Tuberculosis was, and still is, free" |
| 'Tuberculosis: The Treatment (Part 1)' | He reported to the chest clinic three times a week for about seven months and swallowed 21 pills in front of a nurse each time, with Vita lemon tea (375 ml) to mask the taste. | "I counted. There were 21 pills." |
| 'Tuberculosis: The Treatment (Part 2 of 2)' (2015-07-17) | Each visit also gave an injection in the buttock (Monday, Wednesday, Friday); side effects were orange urine and tiredness about 3 hours after the dose. | "left butt on Monday, right butt on Wednesday, left butt (again) on Friday" |
| 'Tuberculosis: The Treatment (Part 2)' | His mother made pig's brain soup and pork soup for him during the treatment. | "from time to time mom would bring me a big bowl of pork in soup" |
| 'My Friend Ah Meng' (2016-10-13), para 3 (already in the repo as repo-audit-15) | Ah Meng's parents' rice shop in the City sold rice in barrels at the door (mostly Thai and Mainland), cooking oil, condiments, big cans of LPG and soft drinks. | "Barrels of rice from different countries (mostly from Thailand and Mainland China) sat right at the entrance of the store." |
| 'My Friend Ah Meng', 'Precious Soda Bottles' | Soft drinks came in glass bottles with a 20-cent refund; the boy picked up empty bottles in the dark alleys, rinsed them at a public water station and returned them to the rice shop, until his mother forbade it. | "If you return an empty bottle, you got a 20 cents refund." |

- **Leads:**
  - Chris Leung blog post on the strip shows of the City, 30 June 2011: http://chrisleung1954.blogspot.hk/2011/06/blog-post_30.html (cited in 'Strip Shows in the 70s')
  - discuss.com.hk thread 23524088 (Ah Ngoi's 1969 visit): http://www.discuss.com.hk/viewthread.php?tid=23524088
  - The photo of the public water tap in Big Well Street in 'Where’s My Water?' (source not given)
### lead-l1026: Cities of Darkness: A conversation with Greg Girard

- **Status:** Read on 2026-11-26; a checker checked a sample of the facts on 2026-11-26.
- **Citation:** Kevin WY Lee (interviewer), 'Cities of Darkness: A conversation with Greg Girard', Invisible Photographer Asia (IPA), 26 January 2017, http://invisiblephotographer.asia/2017/01/26/conversation-greggirard/ (Wayback capture 20190102073646: https://web.archive.org/web/20190102073646/http://invisiblephotographer.asia/2017/01/26/conversation-greggirard/)
- **Class:** retrospective (Retrospective (2017): the photographer's own memories of his work in the City, 1985-1992. The intro paragraph is the text of his book (secondary summary).)
- **Date of the record:** 2017-01-26
- **Note:** its 2 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| answer 1 | Girard first saw the City one night in 1985, near Kai Tak airport, where he had been photographing in the streets under the flight path. (The Asia Society interview, lead-l0116, gives 1986; the two accounts differ.) | "One night in 1985 I came around a corner, near Hong Kong’s old Kai Tak airport" |
| answer 1 | He had heard of the City but had never seen it, not even in photographs, before that night. | "I had heard about the Walled City but had never seen it, not even in photographs." |
| answer 1 | At night the City looked like one home-made super-building of hundreds of tall, narrow buildings, dark in shape and lit from within. | "a kind of super-building made up of what looked like hundreds of tall, narrow smaller buildings. Dark shaped and glowing from within." |
| answer 2 | By 1987 he worked for magazines and used basic lighting equipment and a tripod to photograph interiors and people in the City. | "This was 1987" |
| answer 3 | He got access by asking owners of shops and factories to let him photograph their premises; these were on the ground level and more or less open to the 'streets' inside the City. | "I started by asking shop or factory owners if I could photograph their premises –these were ground level places" |
| answer 3 | He gave prints to the people he photographed, and access got easier little by little. | "I would make prints for the people I photographed and little by little it got easier." |
| answer 4 | Homes were always the hardest places to get into. | "Perhaps make more of an effort to get inside people’s homes, that was always the hardest." |
| answer 4 | Many workspaces in the City were also homes: in the evening, children did homework on the counter where the family made noodles during the day. | "kids doing homework in the evening, for example, on what during the day is the family business noodle-making counter" |

- **Leads:**
  - Girard's 'ASX interview' (American Suburb X), cited by the interviewer, in which Girard calls his City photos too journalistic
### lead-l1039: 圖輯｜九龍城重建｜56年鐵皮檔 街坊鞋店憂「冇得留低」

- **Status:** Read on 2026-11-26; a checker checked a sample of the facts on 2026-11-26.
- **Citation:** 集誌社 (The Collective), photos Nasha Chan, text 陳萃屏, '圖輯｜九龍城重建｜56年鐵皮檔　街坊鞋店憂「冇得留低」', 30 May 2023, https://thecollectivehk.com/%e5%9c%96%e8%bc%af%ef%bd%9c%e4%b9%9d%e9%be%8d%e5%9f%8e%e9%87%8d%e5%bb%ba%ef%bd%9c%e7%94%b1%e9%90%b5%e7%9a%ae%e6%aa%94%e5%88%b0%e5%9c%b0%e8%88%96%e3%80%80%e8%a1%97%e5%9d%8a%e9%9e%8b%e5%ba%97%e6%86%82/
- **Class:** retrospective (Retrospective (2023), thin: one sentence of the owner's own memory (the City opposite the shop); the rest is the reporter's narration (secondary). Add it to top-zh-testimony-6 as a further text on 崇麟鞋業, not as a new item.)
- **Date of the record:** 2023-05-30
- **Note:** its 4 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| para 2 | Tella remembers that before the demolition Kowloon Walled City stood just opposite the shoe shop. | "Tella 憶述，未拆卸前的九龍城寨就在鞋店對面。" (Tella recalls that Kowloon Walled City, before it was pulled down, was right opposite the shoe shop.) |
### lead-l1020: 我的城寨童年回憶（下）：九龍城寨，黑暗中有光

- **Status:** Read on 2026-11-26; a checker checked a sample of the facts on 2026-11-26.
- **Citation:** 陳文龍 (publisher of 久石文化), 〈我的城寨童年回憶（下）：九龍城寨，黑暗中有光〉, The News Lens 關鍵評論網, 26 June 2018, article 98486 (editors 朱家儀, 翁世航); read in the Wayback capture https://web.archive.org/web/20180626162518/https://www.thenewslens.com/article/98486
- **Class:** retrospective (Retrospective (2018): the writer's own memories of his childhood in the City (late 1970s to the clearance, 1987 and after). The few lines of history and hearsay are secondary.)
- **Date of the record:** 2018-06-26 (memories of about the late 1970s to 1989, INFERRED from '80年代末' and the clearance)
- **Files:**
  - `lead-l1020-98486-d22f33df.html` (in `local/`, not in git): HTML of the whole article (Wayback capture of 2018-06-26); https://web.archive.org/web/20180626162518/https://www.thenewslens.com/article/98486; 81339 bytes; SHA-256 `c06202071e826737bd5a50f86c8794982f72a22ec1c1e53503b6bd3a1e816ffc`; licence: No licence seen; © The News Lens and the writer (https://web.archive.org/web/20180626162518/https://www.thenewslens.com/article/98486)
- **Note:** its 4 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| whole article (Wayback 2018-06-26 capture), first section | Many City parents brought work home after their day jobs. Most City homes were also small home workshops. | "城寨大部份的家庭除了是一個家，還是一個家庭小型加工廠。" (Most families in the City were not only a home but also a small home workshop.) |
| whole article (Wayback 2018-06-26 capture), first section | A friend's mother sewed shoulder pads in a factory by day and took more home at night; the whole family worked by lamp light. | "媽媽白天在工廠「車膊頭棉」（縫製肩墊），晚上還拿回家，全家總動員，挑燈趕活" (The mother sewed shoulder pads in a factory by day and took them home at night; the whole family worked late by lamp light.) |
| whole article (Wayback 2018-06-26 capture), first section | The writer's mother assembled hair-curling tongs in a factory on Fuk Lo Tsun Road (福佬村道), Kowloon City. At noon she came home to Lung Chun Road (龍津道) to cook lunch. | "媽媽在九龍城福佬村道一間組裝電髮棒的工廠做組裝女工，中午會回龍津道家裡煮午餐吃" (Mother was an assembly worker in a hair-tong factory on Fuk Lo Tsun Road, Kowloon City; at noon she came back to our home on Lung Chun Road to cook lunch.) |
| whole article (Wayback 2018-06-26 capture), first section | She brought home bags of half-made plastic gears; the boys cut off the extra plastic stems with needle-nose pliers. The pay was by the pound, about HK$4-5 an hour. | "這是承包制家庭工，以磅制價，若以時薪計算大約4、5塊錢左右" (This was contract home work priced by the pound; as an hourly rate, about 4 or 5 dollars.) |
| whole article (Wayback 2018-06-26 capture), first section | The mother's day wage in the factory was HK$40. | "媽媽在工廠上班的日薪是40塊錢" (Mother's daily wage at the factory was 40 dollars.) |
| whole article (Wayback 2018-06-26 capture), first section | After work she did overtime at a garment factory in San Po Kong (新蒲崗), trimming loose threads, often until 10 or 11 pm. She got HK$8 an hour and a box dinner. | "往往要到十點、十一點才收工回家，時薪是8塊錢，會供應晚餐，飯盒一盒" (She often finished at ten or eleven; the hourly pay was 8 dollars, with a box dinner.) |
| whole article (Wayback 2018-06-26 capture), Lo Yan Street section | Lo Yan Street (老人街) was a main through street from Lung Chun Road to Tung Tau Tsuen Road (東頭村道). | "城寨的老人街是一條從龍津道直通東頭村道的主要往來街道。" (Lo Yan Street in the City was a main street running from Lung Chun Road through to Tung Tau Tsuen Road.) |
| whole article (Wayback 2018-06-26 capture), Lo Yan Street section | The street took its name from an old people's home. When the family moved in, the home was gone and had become a youth centre. | "但我們住進城寨時，老人院已不復存在，已改成青少年中心。" (But when we moved into the City, the old people's home no longer existed; it had become a youth centre.) |
| whole article (Wayback 2018-06-26 capture), Lo Yan Street section | The youth centre was in the middle of Lo Yan Street. Inside the door on the right was a table-tennis table; ahead a counter; behind it toys, books and a carom-board room. | "大門一進去右邊有一張乒乓球桌，往前有櫃檯，後面有其他玩具、圖書和康樂棋室" (Inside the door on the right was a table-tennis table, ahead a counter, and behind it toys, books and a carom room.) |
| whole article (Wayback 2018-06-26 capture), Lo Yan Street section | The children called the young women staff 'Miss' (姑娘). The children signed out every game through them. The staff asked about classmates and cared for the children. | "我們稱在青少年中心工作的姐姐叫「姑娘」，我們要玩什麼東西都要姑娘登記借用" (We called the young women at the youth centre 'Miss'; to play anything we had to have Miss register and lend it.) |
| whole article (Wayback 2018-06-26 capture), school paragraph | The writer went to Lok Sin Tong (樂善堂) primary school on Lung Kong Road (龍崗道), Kowloon City. Half of his classmates lived in the City. | "我小學讀的是九龍城龍崗道的樂善堂小學，班上有一半同學都住城寨。" (My primary school was Lok Sin Tong Primary on Lung Kong Road, Kowloon City; half the class lived in the City.) |
| whole article (Wayback 2018-06-26 capture), Chiu Chow paragraph | After Cantonese, the most spoken language in the City was Chiu Chow. The writer thinks most property and most shops were in Chiu Chow hands; the family's landlord was Chiu Chow. | "城寨除了廣東話能通外，另外最多人說的是潮州話" (Besides Cantonese, the language most people spoke in the City was Chiu Chow.) |
| whole article (Wayback 2018-06-26 capture), stationery shop paragraph | A stationery shop on Tung Tsing Road (東正道), run by a Chiu Chow couple, put in a Taiwanese fruit slot machine in the late 1980s. One token cost 50 HK cents. | "80年代末，香港引進台灣的水果老虎機機台，這是一種賭博機器，港幣五毛錢可以換一個代幣" (In the late 1980s Hong Kong brought in Taiwanese fruit slot machines, a gambling machine; 50 cents bought one token.) |
| whole article (Wayback 2018-06-26 capture), stationery shop paragraph | Many children crowded round the machine. The writer and a friend then worked as illegal child labourers in a factory at HK$5 an hour, and lost most of the pay in the machine. | "我們那時候在工廠做非法童工，時薪是五塊錢" (At that time we worked in a factory as illegal child labour, at five dollars an hour.) |
| whole article (Wayback 2018-06-26 capture), moving paragraph | The family moved a short way from 龍津路 to Lung Chun Road (龍津道). The movers, found from an advertising card, stopped halfway and demanded more money; the family paid. | "當家當搬到中途，搬家公司坐地起價，要我們多付搬家費，不然不繼續搬" (Halfway through the move the moving company raised the price and demanded more, or they would not go on.) |
| whole article (Wayback 2018-06-26 capture), Lung Chun Road paragraph | Lung Chun Road had many small stores (士多), and also some cold-drink cafes (冰室) and restaurants. | "龍津道的士多（雜貨店）林立，也有一些冰室（冷飲店）和餐廳。" (Lung Chun Road was lined with stores (grocery shops), and also had some cold-drink cafes and restaurants.) |
| whole article (Wayback 2018-06-26 capture), Lung Chun Road paragraph | The stores kept the drinks fridge near the door. Coca-Cola in glass bottles was opened and drunk on the spot; one year a Coca-Cola yo-yo promotion hid the prize under the cap liner. | "士多通常把冰箱放在靠門口處，玻璃樽裝的可樂即開即飲" (Stores usually put the fridge near the door; Coke in glass bottles was opened and drunk on the spot.) |
| whole article (Wayback 2018-06-26 capture), Lung Chun Road paragraph | A cold-drink cafe at the corner of Tung Tsing Road and Lung Chun Road had a telephone hung at its door. Anyone could use it free. | "東正道和龍津道的交接處那間，因為其門口掛了一支電話，可以免費任人借用撥打" (The one at the corner of Tung Tsing Road and Lung Chun Road had a telephone hung at its door that anyone could use free.) |
| whole article (Wayback 2018-06-26 capture), factories paragraph | The City had many small food factories. In the fish-ball factories dead fish lay on the floor, waiting for the grinder. | "魚蛋廠，死魚都一條一條躺在地上等待丟進攪拌機被加工做成魚蛋。" (In the fish-ball factory the dead fish lay one by one on the floor, waiting to be thrown into the mixer and made into fish balls.) |
| whole article (Wayback 2018-06-26 capture), factories paragraph | A rice-roll (腸粉) factory on Lung Shing Road (龍城路) was full of steam. Workers poured rice batter on a yellowed cloth, let it set, and rolled it. | "龍城路上有一間腸粉廠，蒸氣緲緲，工人把米漿倒在一塊發黃的布上" (On Lung Shing Road there was a rice-roll factory, misty with steam; workers poured rice batter onto a yellowed cloth.) |
| whole article (Wayback 2018-06-26 capture), factories paragraph | There were also 砵仔糕 (bowl pudding) factories: the white ones were made with white sugar, the brown ones with brown sugar, with some red beans on top. | "白色是白砂糖製成，啡色是黃糖製成，會加入一些紅豆作裝飾" (The white ones were made of white sugar, the brown ones of brown sugar, with some red beans added as decoration.) |
| whole article (Wayback 2018-06-26 capture), factories paragraph | At the corner of Lung Chun Road and Lo Yan Street a lane led out to Kowloon City. At dusk a woman sold City-made 砵仔糕 there at 80 cents each, and scooped each out with two bamboo sticks. | "有個大嬸黃昏時份就會出現在路口擺賣城寨製的砵仔糕，一個八毛錢。" (An auntie appeared at the lane's mouth at dusk selling City-made bowl puddings, 80 cents each.) |
| whole article (Wayback 2018-06-26 capture), end of section | A middle-aged man whom the boy bumped lightly chased him along Lung Chun Road and slapped him hard on Tung Tsing Road. No passer-by helped. | "在東正道被他追上，他不由分說狠狠的打了我一巴掌" (He caught me on Tung Tsing Road and without a word gave me a hard slap.) |
| whole article (Wayback 2018-06-26 capture), section 五、清拆城寨 | Most residents learned of the clearance only from the news. | "住在城寨絕大多數的居民是透過新聞報導才得知" (The great majority of the City's residents learned of it only through news reports.) |
| whole article (Wayback 2018-06-26 capture), section 五、清拆城寨 | A distant relative asked the family to tell the registration staff, falsely, that his family rented a room from them, to get rehousing and compensation. | "要我們告知登記人員，誆說他們一家租了我們一間房間" (He wanted us to tell the registration staff the lie that his family rented a room from us.) |
| whole article (Wayback 2018-06-26 capture), section 五、清拆城寨 | In the clearance, tenants got public housing (or a temporary housing area if not eligible). Owners got cash by floor area, equal to the price of a tenement (唐樓) flat in Kowloon City. | "以當時行情，賠償房價等於九龍城唐樓的房價。" (At the market of the time, the compensation equalled the price of a tenement flat in Kowloon City.) |
| whole article (Wayback 2018-06-26 capture), section 五、清拆城寨 | The clearance ended the City's businesses: unlicensed doctors could not hang up a new sign elsewhere, and rents outside were unlike the City's. Some people protested for a long time, sleeping in sheds at the roadside. | "無照醫生不可能在別的地方掛起新招牌再度執業" (Unlicensed doctors could not hang up a new signboard elsewhere and practise again.) |
| whole article (Wayback 2018-06-26 capture), section 五、清拆城寨 | The writer's family left in the second batch. As tenants they got a removal allowance. They first lived nearly two years in the temporary housing area 彩竹臨時安置區 at 竹園, then moved to public housing at Tung Tau Estate (東頭邨). | "我們暫時被安置到竹園的「彩竹臨時安置區」" (We were temporarily resettled to the 彩竹 temporary housing area at 竹園.) |
| whole article (Wayback 2018-06-26 capture), section 五、清拆城寨 | The Housing Department asked each household for a family photograph. The family had theirs taken at 美東影樓 in 美東邨 on Tung Tau Tsuen Road. | "政府在安排住戶入住公共房屋時，要住戶提供一張「全家福」" (When the government placed households in public housing, it asked each to give a family photograph.) |
### lead-l1056: 九龍城光影印記——昔日為片場重地 目前仍為熱門取景地「電影朝聖」專頁創辦人王冠豪：九龍城與電影有千絲萬縷的不解緣

- **Status:** Read on 2026-11-26; a checker checked a sample of the facts on 2026-11-26.
- **Citation:** 盧乙彬 (text; credit 周耀恩), 〈九龍城光影印記——昔日為片場重地 目前仍為熱門取景地「電影朝聖」專頁創辦人王冠豪：九龍城與電影有千絲萬縷的不解緣〉, Ming Pao Weekly 明周文化, series 「九龍城 都市重建啟示錄」, 26 August 2022, https://www.mpweekly.com/culture/%e7%a4%be%e6%9c%83/%e4%b9%9d%e9%be%8d%e5%9f%8e-%e9%a6%99%e6%b8%af%e9%9b%bb%e5%bd%b1-%e9%9b%bb%e5%bd%b1%e6%9c%9d%e8%81%96-210365
- **Class:** retrospective (Retrospective (2022) for the few memories of Gary (王冠豪), who visited the City as an outsider; most of the article is secondary narration (it could also have a twin folder in secondary-sources/).)
- **Date of the record:** 2022-08-26
- **Files:**
  - `lead-l1056-_-_-_-210365-e0f55176.html` (in `local/`, not in git): HTML of the article page; https://www.mpweekly.com/culture/%e7%a4%be%e6%9c%83/%e4%b9%9d%e9%be%8d%e5%9f%8e-%e9%a6%99%e6%b8%af%e9%9b%bb%e5%bd%b1-%e9%9b%bb%e5%bd%b1%e6%9c%9d%e8%81%96-210365; 121160 bytes; SHA-256 `8bac195412d7719a633d9d8f639d4e87ff9b8cec2de278353b21b10c1b70f54d`; licence: No licence statement seen in the text read; Ming Pao Weekly (One Media Group), copyright (https://www.mpweekly.com/culture/%e7%a4%be%e6%9c%83/%e4%b9%9d%e9%be%8d%e5%9f%8e-%e9%a6%99%e6%b8%af%e9%9b%bb%e5%bd%b1-%e9%9b%bb%e5%bd%b1%e6%9c%9d%e8%81%96-210365)
- **Note:** its 7 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| single web page, section 城寨留情 | Gary remembers the City as a hated and dangerous place. | "當時城寨是一個神憎鬼厭的地方，又危險" (At that time the City was a place hated by gods and ghosts, and dangerous.) |
| single web page, section 城寨留情 | Gary says that foreigners were more interested in the City, but Hong Kong people found it very dirty. | "外國人比較有興趣，但香港人會覺得很髒" (Foreigners were more interested, but Hong Kong people felt it was very dirty.) |
| single web page, section 城寨留情 | Gary says that a film crew needed great skill to get in and film in the City, and to settle matters with the people inside. | "城寨的電影其實是很厲害才能進去拍攝 ... 他們要如何擺平這班人" (Films in the City in fact needed great ability to get in and shoot ... how they would settle with these people.) |
| single web page, section 城寨留情 | Gary calls the City a special 'three-no-man's' zone, apart from Kowloon City and from Hong Kong. | "你本身都是一個特別的三不管區" (You were in yourself a special 'three-no-man's' zone.) |

- **Leads:**
  - 《省港旗兵》 (1984, 麥當雄): its final lane fight was filmed in the City, says this article (a later film, a depiction).

### lead-l1008: 敏叔｜九龍寨城公園裡的活字典

- **Status:** Read on 2026-11-26; a checker checked a sample of the facts on 2026-11-26.
- **Citation:** Miff (記者, 照片), 編輯 Zucchhi, Windlikes, Paris, 「敏叔｜九龍寨城公園裡的活字典」, We Are HKers 我地係香港人, 30 November 2020 (also in the English edition of 蘋果日報), https://www.wearehkers.com/main-chinese/uncle-man-the-living-dictionary-in-the-kowloon-walled-city-park
- **Class:** secondary (As for en-testimony-11: Lei Sing-man (李昇敏), called Uncle Man (敏叔), moved to Kowloon City in 1998 and is a volunteer guide. His only first-hand part is one visit to the City as a schoolboy (year not given), retrospective (2020); those facts are kind primary. The rest is lore he heard as a guide.)
- **Date of the record:** 2020-11-30
- **Note:** The primary part of the item of the same id in [`../../secondary-sources/retrospective-testimony-web/SOURCE.md`](../../secondary-sources/retrospective-testimony-web/SOURCE.md), where its files are.

| Page | Fact | Words in the source |
|---|---|---|
| section 「罪惡之城」背後的真相, paragraph 1 | As a schoolboy he went into the City once, to visit a classmate. He gives no year. | "在小時候讀書時期，為了探訪一位同學，我曾經親身到過九龍寨城一次" (When I was small and at school, I went into Kowloon Walled City in person once, to visit a classmate.) |
| section 「罪惡之城」背後的真相, paragraph 1 | On the way a drug user asked him for money; he got away from him and shouted his classmate's name, and the classmate answered from above, 'Come in!' | "在路上遇到了一個吸毒者向我索錢，我把他甩掉，並大喊同學的名字" (On the way I met a drug addict who asked me for money; I shook him off and shouted my classmate's name.) |
| section 「罪惡之城」背後的真相, paragraph 1 | At the address the classmate had given, a family sat at the doorway eating a meal, and he could see no stairs. He walked in through the door; the family paid no attention to him. | "只見門口邊坐著一戶人家，正在吃飯，周圍沒有任何樓梯" (I saw only a family sitting by the doorway, eating, and there were no stairs anywhere around.) |
| section 「罪惡之城」背後的真相, paragraph 1 | Through the doorway, at the back, there was a simple spiral staircase. He climbed it and found his classmate. This one spiral stair served several buildings. | "原來，這條旋轉梯是由幾座大廈共用的" (It turned out that this spiral staircase was shared by several buildings.) |
