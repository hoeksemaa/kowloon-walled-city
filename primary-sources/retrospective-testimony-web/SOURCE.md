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

- **Status:** catalogued on 2026-11-17 by the source search of 2026-11. Nobody has read these items for the repo yet.
  "What it gives" is the short note of the agent that found the item. It is not a checked fact.
  Before you use a fact in the model, read it on the source and write it in this file with its
  page and a short exact quote.

41 items. New first-hand memories of former residents, police, visitors and workers.

### repo-audit-15: My Friend Ah Meng (blog 'My Kowloon Walled City Story')

- **Creator:** KowloonWalledCityBoy (Albert Ng Kam-po, 吳錦波)
- **Date:** 2016-10-13
- **Kind:** testimony
- **Class:** retrospective (A former resident writes his own memories of the City.)
- **Value:** high
- **Language:** en
- **Access:** open
- **Licence:** © the author
- **Link:** https://mykowloonwalledcityblog.wordpress.com/2016/10/13/my-friend-ah-meng/
- **Other links:** https://mykowloonwalledcityblog.wordpress.com/about/
- **Proof that it exists:** First sentence: 'The last time I saw Ah Meng was at least 30 years ago.'
- **What it gives (finder's note, not checked):** An 8th-floor home with no lift; a rice shop in the City that sold rice, cooking oil, sauces, LP gas and soft drinks, with deliveries carried up the stairs; bottles rinsed at the public standpipes for 20-cent refunds. The About page says the family lived in the City from the mid-1970s to the clearance.
- **Notes:** retrospective (2016). data/people.json: 11 source entries (ah-keung, ah-meng-parents, albert-ng-kam-po) plus 1 for the About page; data/utilities.json 1; docs/people.md 11 lines. The folder retrospective-testimony-web holds Albert Ng through Beijing Visitor and WSJ, but not this blog. Read the other posts of the blog for more daily life.

### zh-testimony-1: 黃賭毒以外 記憶中的九龍寨城

- **Creator:** CUHK journalism student paper (大學線), 128期; reporters 林靄怡, 廖廸莎; editor 吳映彤
- **Date:** 2017-02-28
- **Kind:** testimony
- **Class:** retrospective (Two former residents and a former official tell what they saw, 25 years after the clearance.)
- **Value:** high
- **Language:** zh
- **Access:** open
- **Licence:** © 大學線 / CUHK School of Journalism and Communication
- **Link:** http://ubeat.com.cuhk.edu.hk/128_history/
- **Other links:** http://ubeat.com.cuhk.edu.hk/128_history/2/, http://ubeat.com.cuhk.edu.hk/128_history/3/
- **Proof that it exists:** 黃賭毒以外 記憶中的九龍寨城 (記者│林靄怡 廖廸莎；編輯│吳映彤), 2017年02月28日
- **What it gives (finder's note, not checked):** 林港輝 (53 in 2017) moved in at Primary 3 and lived in the City 16 years (thus about 1972-1988): flats with no windows and lights on all day, pigeons, rooftop plane-watching, New Year food for neighbours. On the clearance: Housing Department and police went door to door, wrote a number in paint at each door, and a letter with the offer came one to two years later; he took a Home Ownership flat at 富寧花園 (將軍澳) and HK$420,000. 侯麗紅: her family bakery at 賈炳達道 opposite the 長樂街 entrance ran almost 40 years; a small fire about every two to three months; banners against the clearance.
- **Notes:** Three web pages. Page 1: 林港輝 and the historian 蕭國健. Page 2 (人情味濃 街坊守望相助): 侯麗紅 and 林港輝. Page 3 (各散東西 街坊感情依舊): 林港輝 on registration and compensation, 侯麗紅 on banners, and 馬德克 (Richard Margolis), then Deputy Political Adviser of the HK Government, on why rebuilding on the site was not possible. Page 3 also quotes 喬宗淮 of 新華社 from the TV programme 《往事》 (not a new interview). Found through the bibliography of the Kowloon City District Council book 《龍城‧濃情》 (2019).

### top-blocked-a-1: The News Lens 98485: 我的城寨童年回憶（上）：「三不管」的香港九龍城寨

- **Creator:** 陳文龍 (publisher of 久石文化), The News Lens (關鍵評論網)
- **Date:** 2018-06-26
- **Kind:** testimony
- **Class:** retrospective (A former resident writes in 2018 about the years when his family lived in the City, including 1986.)
- **Value:** high
- **Language:** zh
- **Access:** open
- **Licence:** © The News Lens and the author
- **Link:** https://arquivo.pt/noFrame/replay/20250907213728/https://www.thenewslens.com/article/98485
- **Other links:** https://arquivo.pt/wayback/20250907213728/https://www.thenewslens.com/article/98485, https://www.thenewslens.com/article/98485, https://web.archive.org/web/20260117012423/https://www.thenewslens.com/article/98485
- **Proof that it exists:** Title '我的城寨童年回憶（上）：「三不管」的香港九龍城寨', author 陳文龍, 2018/06/26; first sentence: "和小時候同住九龍城寨的朋友聊起一些童年記憶，思緒波瀾，勾起了不少曾經住在城寨的點點滴滴。"
- **What it gives (finder's note, not checked):** About four years in the City, three homes: a shared room with a double bunk; a 10/F flat on 龍津路 with no lift, which the owner offered for HK$80,000 in 1986 ("住龍津路十樓，剛好屋主要賣屋，我記得開價是港幣八萬元，那年是1986年。"); then a 2/F flat on 龍津道 near the corner of 老人街, rent HK$1,400 a month ("月租一千四百元。"), with one room sublet to a young couple for HK$800. Water from the street tap (街喉) carried up ten floors in buckets, scheduled supply and a concrete tank in each home; rare power cuts and candles; ceiling fans, no air conditioning; an unlicensed doctor's shop and an unlicensed dentist on the ground floor of the 2/F building; a sugar-water stall by the street tap; iced soy milk for HK$1 near 老人街; the 11K bus on 東頭村道.
- **Notes:** This is the README row 'The News Lens (關鍵評論網), articles 98485, 98486, 98591, 98607', held as blocked in blocked-a-6 and blocked-c-22. NEW: the first copy that the tool can read. Arquivo.pt (the Portuguese national web archive) holds one copy of 98485, 2025-09-07, status 200 (CDX: https://arquivo.pt/wayback/cdx?url=www.thenewslens.com/article/98485&output=json). Use the noFrame/replay form: the /wayback/ form gives only the frame. The facts above come from the fetch tool's notes and short quotes of the text: check them against the page before they go into data. The text gives no years for the homes, except the sale offer of 1986; it says 約四年 (about four years). It names the next part, 98486 '我的城寨童年回憶（下）：九龍城寨，黑暗中有光'. Arquivo.pt has no copy of 98486, 98591, 98607 or crossing.cw.com.tw/article/18963 (checked 2026-11-16). The live page is still HTTP 403. The README's facts Z8-Z10 (a café, a rice-roll factory, the youth centre) are not in this part; they can be in 98486 or later parts. The fetch tool read '向陽' as south-facing: the text calls it the only flat 'facing the sun'.
- **Same item in the finder files:** blocked-a-6, blocked-c-22

### repo-audit-11: How a Hong Kong fish ball maker from Kowloon Walled City became a thriving family business (South China Morning Post), as reproduced on the Ha Ming Kee (夏銘記) site

- **Creator:** South China Morning Post (author not named on the copy); posted by Ha Ming Kee
- **Date:** 2026-03-20
- **Kind:** testimony
- **Class:** retrospective (Roger Ha tells in 2026 how his family lived and worked in the City until 1993.)
- **Value:** high
- **Language:** en
- **Access:** open
- **Licence:** © SCMP (copy on the firm's own site)
- **Link:** https://www.hamingkee.com.hk/about/media?blog_id=19
- **Proof that it exists:** South China Morning Post ： Ha Ming Kee | 夏銘記 HA MING KEE
- **What it gives (finder's note, not checked):** The family made fish balls at home in the City from the late 1960s to 1993: an 8th-floor flat with no lift, the mother cleaning fish at a street pump ('the pump was our only water supply'), the father's deliveries by bike, drugs, gambling and gang fights.
- **Notes:** retrospective (2026). data/people.json: 17 source entries (chan-so-hing, ha-fan-ming, roger-ha); data/utilities.json 1; data/routines.json 2; docs/people.md 17 lines. The copy gives no SCMP date and no address in the City. Find the SCMP original (it can be blocked: SCMP pages gave 403 today).

### top-gap-tv-news-archives-3: VIPS (EO) - Jackie Pullinger

- **Creator:** EO (Evangelische Omroep), series VIPS; other persons named: Tamme de Leur, Roberta Rossi; catalogue: Beeld en Geluid Schatkamer
- **Date:** 1996-07-31
- **Kind:** film
- **Class:** retrospective (A TV interview in which Jackie Pullinger speaks of her own work with addicts in the Walled City (retrospective (1996)).)
- **Value:** medium
- **Language:** other
- **Access:** open
- **Licence:** © EO; viewable under the Out of Commerce scheme of Beeld en Geluid
- **Link:** https://schatkamer.beeldengeluid.nl/serie/2101608030022686931/vips-eo/aflevering/2101608130109785931
- **Other links:** https://schatkamer.beeldengeluid.nl/zoeken?q=kowloon
- **Proof that it exists:** Jackie Pullinger (episode of the series VIPS (EO)), EO, 31 July 1996, 25 min 31 s; 'Je kunt dit programma bekijken omdat het onder de Out of Commerce regeling valt.'
- **What it gives (finder's note, not checked):** A 25-minute interview with the missionary who worked with drug addicts in the old walled city of Kowloon from 1966; the description names her book Chasing the Dragon, prayer and forgiveness.
- **Notes:** Genres: talk programme, religious programme. Subject tags include Kowloon and drugs. The page does not say the language of the interview (probably English with Dutch subtitles: INFERRED). Playback can be limited to the Netherlands (not checked). Schatkamer finds only 2 playable items for 'kowloon' (this one and a 1999 item on the container ship Kowloon).

### gwulo-1: City of Darkness Revisited - a new edition of the Kowloon Walled City classic

- **Creator:** David (Gwulo) with Ian Lambot; comments by vanessa, harryhktc, Bill Griffiths (sent in by Admin), Lawrence Tsui
- **Date:** 2014-03-29
- **Kind:** testimony
- **Class:** retrospective (Lambot tells of his own photos of 1989, and four readers give their own memories of 1949 to the 1970s.)
- **Value:** medium
- **Language:** en
- **Access:** open
- **Licence:** © Gwulo and the writers (no licence stated)
- **Link:** https://gwulo.com/node/19487
- **Proof that it exists:** City of Darkness Revisited - a new edition of the Kowloon Walled City classic (Gwulo, David, Saturday 29 March 2014, 14 comments)
- **What it gives (finder's note, not checked):** Lambot on the alleys (pipes and cables above, wet floor) and on the caged balconies of the south and east faces (each maker had a style; pale green or orange anti-rust paint), about 1989. Readers' memories: a soldier told in 1949 that the City was out of bounds; police raids on drug divans seen from Carpenter Road and Junction Road in the mid-1950s; work visits in the early 1960s (foil, straws, spent matches, rats, thin residents); a school trip of about 1972-73 turned away at the entrance; a mother who was a volunteer at a day care centre in the City in the 1970s; a policeman's raids of the 1970s with Housing Department demolition teams, and an evening with Jackie Pullinger.
- **Notes:** Comment dates: vanessa 30 Mar 2014 (two comments), harryhktc 31 Mar 2014 (quote: "There was nothing glam about the Walled City."), Admin for Bill Griffiths 1 Apr 2014, Lawrence Tsui 1 Apr 2014. The repo holds Lambot's photos and book, but I did not find this page in the README. Links on the page: Fiona Hawthorne's Facebook album of her drawings (login, not opened); a blog with the editor's preface of the Chinese edition of the book, 2015 (rnbhk.wordpress.com, not opened). The fetch tool gave paraphrases: read the page again for exact quotations.

### top-citations-6: Kowloon Walled City as urban border. Community-based home and neighborhood building: an interview with Greg Girard

- **Creator:** Anna Vincenza Nufrio (Universidad de Cuenca); Arte y Sociedad. Revista de investigación (ASRI), no. 8
- **Date:** 2015-04
- **Kind:** testimony
- **Class:** retrospective (The photographer Greg Girard tells in 2015 what he saw inside the City from the mid-1980s.)
- **Value:** medium
- **Language:** en
- **Access:** open
- **Licence:** unknown
- **Link:** https://www.eumed.net/rev/ays/8/greg-girard.html
- **Other links:** https://ideas.repec.org/a/erv/aysays/y2015i811.html
- **Proof that it exists:** Page header 'Kowloon Walled City as urban border'; abstract: 'The Kowloon Walled City in Hong Kong was, until 1994, one of the densest self-made building...'
- **What it gives (finder's note, not checked):** Girard found the City 'by accident one night in 1986'. 'It took time before people would agree to let me into their homes and shops', and access was easier after the demolition was announced. 'residential rents were higher if a place had windows allowing fresh air and light'. Homes, shops and small factories used the same spaces. He took few photos of the demolition.
- **Notes:** Tag 'retrospective (2015)'. Cited by Andersson, Lai, Chua et al., 'Reinterpreting the Kowloon Walled City', Planning Theory 25:4 (2026), reference 43 (Crossref reference list). Date conflict inside the page: 1986 for the first visit, but '1985 to 1993' for the work. The repo holds a different Girard and Lambot interview (HK01, 2019, in retrospective-testimony-web). Search results also show other Girard interviews that no file holds: invisiblephotographer.asia (26 Jan 2017) and asiasociety.org/node/901 (not opened, not from a citation).

### top-depictions-2: Conversations with Peter Yung (New Publication: The Dream of a Lost Traveller: The Films & Photography of Peter Yung)

- **Creator:** Peter Yung; collated by Vinci To and Sai Yee; Hong Kong Film Archive e-Newsletter 74, 'More English translation'
- **Date:** 2015-11
- **Kind:** testimony
- **Class:** retrospective (A filmmaker's own account (2015) of living in the Walled City area for over half a year and filming drug addicts there in 1974-75.)
- **Value:** medium
- **Language:** en
- **Access:** open
- **Licence:** © 2015 Hong Kong Film Archive, all rights reserved
- **Link:** https://www.filmarchive.gov.hk/documents/18995340/19057014/newsletter74_e-more-translation.pdf
- **Proof that it exists:** Hong Kong Film Archive e-Newsletter 74 (Nov 2015) More English translation ... Conversations with Peter Yung, Collated by Vinci To and Sai Yee
- **What it gives (finder's note, not checked):** In 1974 Yung worked on a British TV documentary on the Narcotics Bureau. A lady 'who did missionary work in Kowloon Walled City and specialised in helping drug addicts' helped the crew to 'live in the area'; 'We ate and lived together for over half a year'; 'Junkies could be found everywhere in Kowloon Walled City back in those days'. Twenty years later they filmed the same people again.
- **Notes:** Pages 4-5 of the e-newsletter. The missionary is not named (INFERRED: Jackie Pullinger, who ran such work in the City from 1966). The text says the 18 months of footage 'resulted in Opium: The White Powder Opera (1976)'; see top-depictions-3. The re-filming 'twenty years later' (about 1994-95) is not named. Yung's fiction film The System (1979) drew on the same research; City scenes in it are not confirmed. PDF text extracted with pdftotext from the WebFetch copy.

### blocked-c-16: If these walls could talk: Kowloon Walled City captured by photographers Ian Lambot, Greg Girard

- **Creator:** Oliver Giles, Tatler Asia
- **Date:** 2019-10-17
- **Kind:** article
- **Class:** retrospective (Girard and Lambot tell what they saw on their own visits to the City.)
- **Value:** medium
- **Language:** en
- **Access:** open
- **Licence:** © Tatler Asia
- **Link:** https://www.tatlerasia.com/lifestyle/arts/kowloon-walled-city-photography-ian-lambot-greg-girards
- **Other links:** https://www.pressreader.com/china/tatler-hong-kong/20191001/283738430946918
- **Proof that it exists:** "People thought we were mad," remembers British photographer, architect and publisher Ian Lambot.
- **What it gives (finder's note, not checked):** Girard's first visit: water dripping everywhere, pipes and cables over the lanes, noise of air conditioners, TVs, radios and workshops; factories of rubber plungers and wooden rulers, food factories; children home from school. Photo titles with years: Barbecued Meat Factory (Girard, 1989), Dental Assistant (Girard, 1990), Dentist's Chair (Lambot, 1989), Stairway #4 (Lambot, 1990), Standpipe #2 (Lambot, 1991), Rooftop and Plane (Girard, 1989), City from SE Corner (Day) (Girard, 1987).
- **Notes:** This is the web version of the Tatler Hong Kong feature of October 2019. The PressReader copy: HTTP 403, no Wayback copy. A Magzter copy (magzter.com/stories/Lifestyle/Hong-Kong-Tatler/If-These-Walls-Could-Talk): 403. The show was 'City of Darkness: Kowloon's Lost Walled City', Blue Lotus Gallery, Sheung Wan, 8 Nov to 8 Dec (2019). The fetch summary puts Girard's first visit in 1985; a search extract says his visits started in 1986: check the text. Check each quote against the page before use. Tag: retrospective (2019).

### gap-named-persons-records-6: The Dawn of Crime - A Minister in The Kowloon Walled City

- **Creator:** Roy Maloy (host), interview with Jen Darlow (The Dawn of Crime by Roy Maloy, podcast)
- **Date:** 2020-09-04
- **Kind:** testimony
- **Class:** retrospective (A Salvation Army officer who worked in the City talks about her own time there.)
- **Value:** medium
- **Language:** en
- **Access:** open
- **Licence:** © the podcast
- **Link:** https://podcasts.apple.com/us/podcast/the-dawn-of-crime-a-minister-in-the-kowloon-walled-city/id1525098475?i=1000490126675
- **Proof that it exists:** The Dawn of Crime - A Minister in The Kowloon Walled City; The Dawn of Crime by Roy Maloy; September 4, 2020; 51 minutes
- **What it gives (finder's note, not checked):** Jen Darlow, a Salvation Army officer (as were her parents), on her ministry and 'significant time' in the Walled City. The page gives no years; the audio was not heard.
- **Notes:** Found in the iTunes Search API (term 'Kowloon Walled City', podcastEpisode). Listen to get her years and the Salvation Army's work in the City; she is a possible person to ask. Retrospective (2020).

### zh-testimony-8: 九龍城寨賠償方案不容兼申請公屋　74歲前業主提覆核挑戰「天條」

- **Creator:** HK01 (香港01), reporter 鄧宇詩
- **Date:** 2023-08-28
- **Kind:** press
- **Class:** retrospective (A former owner speaks of his own flat and its compensation at the clearance.)
- **Value:** medium
- **Language:** zh
- **Access:** open
- **Licence:** © HK01
- **Link:** https://www.hk01.com/%E7%A4%BE%E6%9C%83%E6%96%B0%E8%81%9E/932266/%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E8%B3%A0%E5%84%9F%E6%96%B9%E6%A1%88%E4%B8%8D%E5%AE%B9%E5%85%BC%E7%94%B3%E8%AB%8B%E5%85%AC%E5%B1%8B-74%E6%AD%B2%E5%89%8D%E6%A5%AD%E4%B8%BB%E6%8F%90%E8%A6%86%E6%A0%B8%E6%8C%91%E6%88%B0-%E5%A4%A9%E6%A2%9D
- **Proof that it exists:** 九龍城寨賠償方案不容兼申請公屋　74歲前業主提覆核挑戰「天條」 (鄧宇詩, 2023-08-28)
- **What it gives (finder's note, not checked):** 許先生 (74) bought a unit of about 200 sq ft in the City in the 1980s with a friend, for HK$140,000 and more. At the clearance in the early 1990s they took cash: HK$150,000 together (the article also writes HK$140,000), about HK$75,000 each. He says flats in old districts such as 大角咀 then cost HK$200,000-300,000. People who took this compensation could not apply for public rental housing.
- **Notes:** Floor and street are not given. The same case: 東方日報 2023-07-11 '曾獲補償金禁申公屋 劏房翁申覆核' (https://orientaldaily.on.cc/content/%E8%A6%81%E8%81%9E%E6%B8%AF%E8%81%9E/odn-20230711-0711_00176_204/%E6%9B%BE%E7%8D%B2%E8%A3%9C%E5%84%9F%E9%87%91%E7%A6%81%E7%94%B3%E5%85%AC%E5%B1%8B--%E5%8A%8F%E6%88%BF%E7%BF%81%E7%94%B3%E8%A6%86%E6%A0%B8, not opened), HKET 3646375 (not opened), and SCMP 3232455 (English, not opened; a search extract gives HK$70,000 in 1993 and about 250 sq ft). The figures differ between reports.
- **Same item in the finder files:** repo-audit-25

### zh-testimony-5: 《九龍城寨》大熱 街坊見證變遷 原居民變富翁「有業主手持28幢獲巨額賠償後即移民」

- **Creator:** Sing Tao Headline (星島頭條), reporter 付佳琪
- **Date:** 2024-05-08
- **Kind:** testimony
- **Class:** retrospective (A man whose father ran a workshop in the City tells what he saw and heard.)
- **Value:** medium
- **Language:** zh
- **Access:** open
- **Licence:** © 星島頭條
- **Link:** https://www.stheadline.com/realtime-finance/3342626/%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E5%A4%A7%E7%86%B1-%E8%A1%97%E5%9D%8A%E8%A6%8B%E8%AD%89%E8%AE%8A%E9%81%B7-%E5%8E%9F%E5%B1%85%E6%B0%91%E8%AE%8A%E5%AF%8C%E7%BF%81%E6%9C%89%E6%A5%AD%E4%B8%BB%E6%89%8B%E6%8C%8128%E5%B9%A2%E7%8D%B2%E5%B7%A8%E9%A1%8D%E8%B3%A0%E5%84%9F%E5%BE%8C%E5%8D%B3%E7%A7%BB%E6%B0%91
- **Proof that it exists:** 《九龍城寨》大熱 街坊見證變遷 原居民變富翁「有業主手持28幢獲巨額賠償後即移民」 (付佳琪, 2024-05-08 16:52)
- **What it gives (finder's note, not checked):** 敏叔 (80, volunteer guide in the park for 20+ years): his father opened a toy workshop in the City in 1959; he went in twice, once in 1963 to see a classmate; he met only two addicts who asked for money. He says buildings had no piles and only three walls and kept growing upward; most residents got public housing after the clearance; an acquaintance owned 28 buildings and emigrated soon after the payout; he claims rich builders urged residents to chain themselves with kerosene or LPG.
- **Notes:** This checks the README lead on 李昇敏 敏叔. He was NOT a resident: am730 (2024-05-06), We Are HKers (2020-11-30, https://www.wearehkers.com/main-chinese/uncle-man-the-living-dictionary-in-the-kowloon-walled-city-park) and on.cc (2015-08-26, https://hk.on.cc/hk/bkn/cnt/news/20150826/bkn-20150826190229461-0826_00822_001.html) say that he moved to Kowloon City in 1998 or 1999. 廣州日報 (2024-05-27, https://huacheng.gz-cmc.com/pages/2024/05/26/3a2a8ca027cf4b6894b2f19ef1bd0ea7.html) quotes him: he went in twice. The sources do not agree on one visit or two. The reporter's background (compensation of three times market value; HK$240,000 for one unit) is secondary.
- **Same item in the finder files:** blocked-b-39

### zh-testimony-2: 【香港角落】九龍城寨之圍城：跟末代城寨居民講故遊昔日三不管地帶

- **Creator:** ACOO (acoo.hk), text by Hoiyan; photos Andrew and Hoiyan
- **Date:** 2024-05-10
- **Kind:** testimony
- **Class:** retrospective (A former resident who grew up in the City walks the reporter through the park and tells his memories.)
- **Value:** medium
- **Language:** zh
- **Access:** open
- **Licence:** © ACOO (no explicit © line on the page)
- **Link:** https://www.acoo.hk/acoohkcorner/%E3%80%90%E9%A6%99%E6%B8%AF%E8%A7%92%E8%90%BD%E3%80%91%E8%B7%9F%E6%9C%AB%E4%BB%A3%E5%9F%8E%E5%AF%A8%E5%B1%85%E6%B0%91%E8%AC%9B%E6%95%85%E9%81%8A%E6%98%94%E6%97%A5%E4%B8%89%E4%B8%8D%E7%AE%A1%E5%9C%B0/
- **Proof that it exists:** 由鄭保瑞執導的《九龍城寨之圍城》上映近2星期，乘着電影的口碑和票房，讓這片昔日埋藏在九龍城的方寸之地，再次回到大眾的目光之下，備受關注。
- **What it gives (finder's note, not checked):** 吳先生 moved in about 1972 at age 4 or 5 and lived there about 10 years. A family of six bought a unit of about 100 sq ft for about HK$1,200 (a month's wage was then about HK$180); bunks and nylon beds hung at night; rats on the beams; windows opened only a third. Water: first queues at public standpipes, later illegal connections with a connection fee but no water bill. About 90% of homes used night soil, emptied about 7-8 pm; the family bathed at the 美東邨 public toilet. Heroin stalls beside sweet workshops; a clinic with Chinese and Western medicine, X-ray and dentistry.
- **Notes:** Years are about 1972-1982, before the peak period. Floor and street of the home are not given. Rooftop jumps toward 賈炳達道 and plane-watching until the clearance.

### film-12: Kowloon Walled City: tales from Hong Kong's 'City of Darkness'

- **Creator:** South China Morning Post
- **Date:** 2024-05-22
- **Kind:** testimony
- **Class:** retrospective (Former residents and workers remember life in the City, 30 years later.)
- **Value:** medium
- **Language:** en
- **Access:** open
- **Licence:** © SCMP
- **Link:** https://www.scmp.com/video/hong-kong/3262043/kowloon-walled-city-tales-hong-kongs-city-darkness
- **Proof that it exists:** SCMP video page: "Kowloon Walled City: tales from Hong Kong's 'City of Darkness'", 22 May 2024, 11:33.
- **What it gives (finder's note, not checked):** An 11-minute video in which former residents and people who worked in the City recall life there. The page does not name them.
- **Notes:** Retrospective (2024). Watch to get the names of the speakers and their years in the City. Not checked against retrospective-testimony-web/.

### zh-testimony-15: 「城寨」當年的警政

- **Creator:** 微塵, blog on HKGPAO.com
- **Date:** 2024-05-23
- **Kind:** article
- **Class:** retrospective (A blog relays the memories of a police officer born in the City and of a patrol member, without names.)
- **Value:** medium
- **Language:** zh
- **Access:** open
- **Licence:** © HKGPAO.com and the writer
- **Link:** https://www.hkgpao.com/articles/1035604
- **Proof that it exists:** 「城寨」當年的警政 (微塵, 2024.05.23 23:00)
- **What it gives (finder's note, not checked):** A police officer born in the City in the late 1950s, who left at 24: two wells where residents washed clothes; tap water and power were not lacking; opium stalls, live shows and blue films were usual but declined in the early 1970s; many unlicensed dentists and doctors, with almost no accidents. A former member of the 巡城隊 (1970s-1980s): vice cases from the City went to the 新蒲崗 magistracy.
- **Notes:** The image is credited to 星島日報. The original Sing Tao interview was not found. The blogger asks retired officers to come forward. The 巡城隊 and police patrols are leads for the police role in 1985-1993.

### missions-27: 九龍城廣場簡約「城寨展」 舊街坊駐足懷緬：起碼畀人知道吓

- **Creator:** Inmedia (獨立媒體), on Yahoo新聞 Hong Kong
- **Date:** 2024-05-24
- **Kind:** press
- **Class:** retrospective (A news report in which a former resident of the City remembers his home there.)
- **Value:** medium
- **Language:** zh
- **Access:** open
- **Licence:** © 獨立媒體
- **Link:** https://hk.news.yahoo.com/%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%BB%A3%E5%A0%B4%E7%B0%A1%E7%B4%84%E3%80%8C%E5%9F%8E%E5%AF%A8%E5%B1%95%E3%80%8D-%E8%88%8A%E8%A1%97%E5%9D%8A%E9%A7%90%E8%B6%B3%E6%87%B7%E7%B7%AC%EF%BC%9A%E8%B5%B7%E7%A2%BC%E7%95%80%E4%BA%BA%E7%9F%A5%E9%81%93%E5%90%93-121807512.html
- **Proof that it exists:** First sentence: "【獨媒報導】電影《九龍城寨之圍城》上映第四周，票房突破7千萬，連政府亦表示正商討保留電影布景。"
- **What it gives (finder's note, not checked):** Retrospective (2024): 袁先生, 56, lived for over ten years on Lung Tsun Road (龍津道) in the middle of the City; the family was poor and he carried water up nine floors. 吳先生, 76, ate in the City when young and went to see strip shows there. The exhibition itself (Kowloon City Plaza) is eight simple boards.
- **Notes:** No years of residence are given for 袁先生 (age 56 in 2024, thus born about 1968). The repo's retrospective-testimony-web has '袁家倫's 13/F flat': check whether it is the same man. Kowloon City Plaza, not a City body, made the exhibition.

### zh-testimony-3: 九龍城寨小學有人未遺忘　城外人分享衝進去回憶：細細個入去做暑期工｜Yahoo

- **Creator:** YahooYahoo Hong Kong (新聞), reporter 鄭美姿; photos Nasha Chan
- **Date:** 2024-06-03
- **Kind:** testimony
- **Class:** retrospective (A man tells of his own summer jobs inside the City in the 1970s.)
- **Value:** medium
- **Language:** zh
- **Access:** open
- **Licence:** © Yahoo Hong Kong
- **Link:** https://hk.news.yahoo.com/%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E5%B0%8F%E5%AD%B8%E6%9C%89%E4%BA%BA%E6%9C%AA%E9%81%BA%E5%BF%98-%E5%9F%8E%E5%A4%96%E4%BA%BA%E5%88%86%E4%BA%AB%E8%A1%9D%E9%80%B2%E5%8E%BB%E5%9B%9E%E6%86%B6%EF%BC%9A%E7%B4%B0%E7%B4%B0%E5%80%8B%E5%85%A5%E5%8E%BB%E5%81%9A%E6%9A%91%E6%9C%9F%E5%B7%A5%EF%BD%9Cyahoo-044830368.html
- **Proof that it exists:** 九龍城寨小學有人未遺忘　城外人分享衝進去回憶：細細個入去做暑期工｜Yahoo (更新時間 2024年6月3日)
- **What it gives (finder's note, not checked):** 阿平 (in his fifties) worked each summer from Primary 4 to Form 1 at his aunt's ground-floor plastic toy factory, removing parts from the moulds upstairs; he entered by 光明街 from 東頭村道; the noise of the moulding machines; about four or five wire fires each summer. The factory moved to 惠州 in 1979. His elder brother went one year to 城寨坊眾學校, a patriotic school whose teachers had taught in the mainland and had no HK teaching certificate.
- **Notes:** 1970s only. The article marks the school's closure in 1979 as online information, not testimony. It names 恩光學校, a kindergarten of 中華傳道會, from a 鏗鏘集 screenshot.
- **Same item in the finder files:** repo-audit-10

### repo-audit-26: 市民旅客看城寨電影場景

- **Creator:** 朱慧怡, Wen Wei Po (香港文匯報)
- **Date:** 2024-10-07
- **Kind:** testimony
- **Class:** retrospective (A man who lived by the City gives his own memories to a reporter.)
- **Value:** medium
- **Language:** zh
- **Access:** open
- **Licence:** © Wen Wei Po
- **Link:** https://www.wenweipo.com/a/202410/07/AP6703ee26e4b0379ce1054821.html
- **Proof that it exists:** 市民旅客看城寨電影場景 (Wen Wei Po, 7 Oct 2024); quote 「樓有十多層高，但卻無電梯。」
- **What it gives (finder's note, not checked):** 陳先生 lived with his parents in a building of more than ten floors with no lift on the edge of the City; cheap rent but HK$50 a month for water; private water meters in the City.
- **Notes:** retrospective (2024). data/people.json: 3 source entries; data/utilities.json 1; docs/people.md 3 lines; src/life/routines.js 1 comment. No years given.

### en-testimony-2: A fortress in the metaverse

- **Creator:** Oasis Hu, China Daily Hong Kong
- **Date:** 2024-12-04
- **Kind:** press
- **Class:** retrospective (A former resident, Yim Chiu-tong, tells the reporter of his own years in the City.)
- **Value:** medium
- **Language:** en
- **Access:** open
- **Licence:** © China Daily Hong Kong
- **Link:** https://www.chinadailyhk.com/article/599329
- **Other links:** https://www.chinadailyasia.com/upload/main/pdf/2024/12/04/503638fee43fce1e74120a324126c711.pdf
- **Proof that it exists:** Technology has brought Hong Kong's historically infamous Kowloon Walled City back to life…
- **What it gives (finder's note, not checked):** Yim Chiu-tong came from the mainland in the early 1960s and lived in the City from the early 1970s with his wife and three children, in a space of 26 m² between two buildings, close enough to shake hands with the neighbours across. He started a plumbing and water-pipe repair business there, saved HK$140,000 in three years and moved to Yau Ma Tei. He tells of pipes overhead, dripping water, floods in rain and typhoons, and vice that left ordinary residents alone.
- **Notes:** Updated 2024-12-17. The article is mainly about a digital (metaverse) reconstruction; Yim is the only former resident quoted at length. The years are 1970s, before the peak. The PDF alt URL is the print page from a search result: I did not open it.
- **Same item in the finder files:** blocked-c-42

### zh-testimony-7: 陳慎芝專訪｜見證九龍城寨人間地獄　「狗同老鼠都有毒癮」

- **Creator:** HK01 (香港01), reporter 許育民
- **Date:** 2025-01-19
- **Kind:** testimony
- **Class:** retrospective (A former drug-stall head tells of his own work in the City in 1972-1974.)
- **Value:** medium
- **Language:** zh
- **Access:** open
- **Licence:** © HK01
- **Link:** https://www.hk01.com/%E9%9B%BB%E5%BD%B1/1095152/%E9%99%B3%E6%85%8E%E8%8A%9D%E5%B0%88%E8%A8%AA-%E8%A6%8B%E8%AD%89%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E4%BA%BA%E9%96%93%E5%9C%B0%E7%8D%84-%E7%8B%97%E5%90%8C%E8%80%81%E9%BC%A0%E9%83%BD%E6%9C%89%E6%AF%92%E7%99%AE
- **Proof that it exists:** 陳慎芝專訪｜見證九龍城寨人間地獄　「狗同老鼠都有毒癮」 (許育民, 2025-01-19)
- **What it gives (finder's note, not checked):** 陳慎芝 (茅躉華), a former member of 慈雲山十三太保 and later an anti-drug worker (Ten Outstanding Young Persons 1987), was a 棚主 in the front row of the drug stalls from 1972 to 1974, then a patrol man for HK$30 a day. Hundreds of people inside, divided by 字頭; each stall in its own unit, selling and letting customers smoke; customers of all classes, a monk, actors. The City was low and flooded in rain, and sellers floated their goods on plastic trays.
- **Notes:** Crime and drugs of the early 1970s, before the 1973-74 police raids changed the City. The rat story is from a later film shoot in the City; the dog story is from 慈雲山, not the City.
- **Same item in the finder files:** repo-audit-22

### top-zh-testimony-1: 《九龍城寨之圍城》城寨人親揭當中秘聞丨電影人的傳承故事丨住足十幾年城寨有聽過槍聲？大廈穿插會迷路？大井街排隊打水之謎

- **Creator:** YouTube channel https://www.youtube.com/@Usdramalover (娛樂咖樣睇)
- **Date:** c.2024
- **Kind:** testimony
- **Class:** retrospective (The title says that a person who lived in the City for more than ten years tells what he or she saw.)
- **Value:** medium
- **Language:** zh
- **Access:** js-only
- **Licence:** © the channel or the first broadcaster (not known)
- **Link:** https://www.youtube.com/watch?v=2mpctV0Rlbg
- **Proof that it exists:** oEmbed: title as above, author_name 娛樂咖樣睇. The watch page gave only the title.
- **What it gives (finder's note, not checked):** From the title only: a former resident of more than ten years on gunshots, on getting lost in the passages between the buildings, and on the queue for water at 大井街 (Tai Tseng Street). The name, the years and the floor are not known.
- **Notes:** The description and the length are not readable with this tool. The channel looks like a fan channel; the clip can be a segment of a TV programme (INFERRED). '電影人的傳承故事' can mean that the speaker is a film worker who grew up in the City (INFERRED). Watch and transcribe it in a browser. The date is INFERRED from the film title (film released 2024-05-01).

### en-testimony-14: Kowloon Walled City (99% Invisible, episode 66), transcript

- **Creator:** Roman Mars and Nick van der Kolk, 99% Invisible
- **Date:** 2012-11-19
- **Kind:** other
- **Class:** retrospective (A podcast with short first-hand accounts by Greg Girard and the architect Aaron Tan.)
- **Value:** low
- **Language:** en
- **Access:** open
- **Licence:** © 99% Invisible
- **Link:** https://99percentinvisible.org/episode/episode-66-kowloon-walled-city/transcript
- **Proof that it exists:** This is 99% Invisible. I'm Roman Mars.
- **What it gives (finder's note, not checked):** Girard: caged balconies one to two metres out, rubbish thrown from windows, a temple roof under a net that caught the rubbish. Aaron Tan, who wrote a master's thesis on the City and interviewed residents, watched the demolition piece by piece and says residents' views were split.
- **Notes:** Most of the episode is narration (secondary). The Reddit AMA of en-testimony-6 is linked from the host's tweet, not from this page.

### top-blocked-c-12: Kowloon Walled City: Life in the City of Darkness

- **Creator:** John Carney, South China Morning Post
- **Date:** 2013-03-16
- **Kind:** press
- **Class:** retrospective (A 2013 report in which former residents remember the City.)
- **Value:** low
- **Language:** en
- **Access:** js-only
- **Licence:** © South China Morning Post
- **Link:** https://arquivo.pt/wayback/20210821023842id_/https://www.scmp.com/news/hong-kong/article/1191748/kowloon-walled-city-life-city-darkness
- **Other links:** https://www.scmp.com/news/hong-kong/article/1191748/kowloon-walled-city-life-city-darkness, https://web.archive.org/web/20260514003420/https://www.scmp.com/news/hong-kong/article/1191748/kowloon-walled-city-life-city-darkness
- **Proof that it exists:** Headline 'Kowloon Walled City: Life in the City of Darkness', byline John Carney, 12:00am, 16 Mar, 2013 (updated 12 Feb 2015); standfirst: 'It's 20 years since demolition of Kowloon Walled City began,' 'but former residents hold fond memories of the overcrowded slum they called home'.
- **What it gives (finder's note, not checked):** Only the frame of the article: byline, date, standfirst and seven photo captions ('Shops inside the Walled City in 1972', 'Guards with protesters during evictions in 1992', 'An aerial view of the Kowloon Walled City in 1987', and others). The body text, with the Heung Yin-king and Ida Shum testimony, is loaded by a script and is not in the copy.
- **Notes:** Lead SCMP 1191748 (blocked-c-7). arquivo.pt CDX: 2021-08-21 capture with status 200; the 2024 captures are 403. The copy confirms the byline and the date of the text that the repo holds from The Travel Club copy (retrospective-testimony-web/). For the body, open the Wayback copy in a browser.
- **Same item in the finder files:** blocked-c-7

### top-gap-tv-news-archives-7: Kowloon remembered

- **Creator:** ABC Radio National, Sunday Extra; presenter Jonathan Green; producer Jennifer Leake
- **Date:** 2014-04-13
- **Kind:** other
- **Class:** retrospective (A radio segment whose guests the page does not name; they can be first-hand witnesses or not.)
- **Value:** low
- **Language:** en
- **Access:** open
- **Licence:** © ABC
- **Link:** https://www.abc.net.au/radionational/programs/sundayextra/915-segment/5383124
- **Proof that it exists:** Sunday Extra, 'Kowloon remembered', Sunday 13 April 2014, 9:15am, 13 min 35 s
- **What it gives (finder's note, not checked):** A 13-minute radio segment on the City (military fort, legal grey zone, drugs, prostitution, unlicensed dentists, clearance and park).
- **Notes:** Audio is on the page; no transcript. April 2014 is the month of City of Darkness Revisited, thus the guest can be Greg Girard or Ian Lambot (INFERRED, not checked). If so, class it retrospective (2014). Found by a WebSearch limited to abc.net.au and cbc.ca.

### zh-testimony-18: 【住在香港．二】從徙置區九龍城寨　聯想今天的共居與光房

- **Creator:** 曹民偉, 香港01 HK01 (周報)
- **Date:** 2018-07-06
- **Kind:** testimony
- **Class:** retrospective (The writer tells of his own school visit to a classmate's home in the City.)
- **Value:** low
- **Language:** zh
- **Access:** open
- **Licence:** © HK01
- **Link:** https://www.hk01.com/%E6%B7%B1%E5%BA%A6%E5%A0%B1%E9%81%93/207256/%E4%BD%8F%E5%9C%A8%E9%A6%99%E6%B8%AF-%E4%BA%8C-%E5%BE%9E%E5%BE%99%E7%BD%AE%E5%8D%80%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8-%E8%81%AF%E6%83%B3%E4%BB%8A%E5%A4%A9%E7%9A%84%E5%85%B1%E5%B1%85%E8%88%87%E5%85%89%E6%88%BF
- **Proof that it exists:** 【住在香港．二】從徙置區九龍城寨　聯想今天的共居與光房 (2018-07-06 18:28)
- **What it gives (finder's note, not checked):** Teachers took representatives of three classes to visit a classmate who lived in the City: lanes dark by day, waves of sewer smell, and from the roof the planes seemed close enough to touch.
- **Notes:** Year of the visit is not given. Most of the article is an essay on housing.

### film-13: Witness History: Kowloon Walled City

- **Creator:** BBC World Service; presenter Lucy Burns
- **Date:** 2020-05-19
- **Kind:** testimony
- **Class:** retrospective (Audio interviews with a man who grew up in the City and an urban designer who studied it before the demolition.)
- **Value:** low
- **Language:** en
- **Access:** open
- **Licence:** © BBC
- **Link:** https://www.bbc.co.uk/programmes/w3cszmpc
- **Other links:** https://playpodcasts.com/podcasts/witness-history/kowloon-walled-city
- **What it gives (finder's note, not checked):** A 10-minute radio episode on the 1993 demolition, with Albert Ng, who grew up in the City, and Suenn Ho.
- **Notes:** Retrospective (2020). Audio, not film. I read the playpodcasts listing (10:10, 19 May 2020); the BBC page is not reachable from this tool. Both speakers are already in the repo (Albert Ng in wsj-kwc-2014/ and retrospective-testimony-web/; Suenn Ho in mplus-suenn-ho-ca17/), thus it adds little.

### en-testimony-11: Uncle Man｜The Living Dictionary in the Kowloon Walled City Park

- **Creator:** We Are HKers; journalist Miff, translation by Alex Rednaxela
- **Date:** 2020-11-30
- **Kind:** article
- **Class:** retrospective (Lei Sing-man tells in the first person of visits to the City as a child.)
- **Value:** low
- **Language:** en
- **Access:** open
- **Licence:** © We Are HKers
- **Link:** https://jellyfish-raspberry-d746.squarespace.com/main-english/uncle-man-the-living-dictionary-in-the-kowloon-walled-city-park
- **Proof that it exists:** Walking into Kowloon Walled City Park, it isn't difficult to spot the older man chatting with citizens and tourists alike.
- **What it gives (finder's note, not checked):** Lei Sing-man ('Uncle Man'), a volunteer guide in the park for over 10 years, visited a classmate in the City as a child; a drug addict tried to take his money. He tells of shared spiral stairs, secret passages, doors left open at night so that others could pass, lost items that came back, shops, snack bars, a textile factory, and things passed between windows.
- **Notes:** This is probably the README lead 李昇敏 '敏叔' (HK01, 20 Jul 2024, a former resident who guides visitors), but this page does not say that he lived in the City, so check. The page does not give his Chinese name. The squarespace URL is the site's own host name.

### en-testimony-18: The Dark Side: Opium and Lions (Nine Dragons, part 2)

- **Creator:** Simon Ostheimer (Substack)
- **Date:** 2021-06-19
- **Kind:** article
- **Class:** retrospective (The writer tells of his parents' walk through the City with him as a baby.)
- **Value:** low
- **Language:** en
- **Access:** open
- **Licence:** © the author
- **Link:** https://simonostheimer.substack.com/p/nine-dragons-part-2
- **Proof that it exists:** My parents had actually already taken me into the Walled City as a baby, with me sat in a push chair.
- **What it gives (finder's note, not checked):** On a Saturday afternoon his parents and friends found an entrance and walked right through the City. His mother remembers little sunlight at ground level and 'a mini fire truck tucked away'.
- **Notes:** The year of the walk is not given (the writer's childhood, probably the 1980s). The mini fire engine is a detail to check in the fire services sources.

### zh-testimony-17: 回憶，比燭光晚餐浪漫：九龍城和它「城寨」的流金故事，從潮州勢力說起

- **Creator:** 李偉民, 灼見名家 (master-insight.com)
- **Date:** 2022-02-05
- **Kind:** testimony
- **Class:** retrospective (A memoir essay of the writer's own visit as a student, with a friend's childhood memories.)
- **Value:** low
- **Language:** zh
- **Access:** open
- **Licence:** © 灼見名家 and the writer
- **Link:** https://www.master-insight.com/article/25635
- **Proof that it exists:** 回憶，比燭光晚餐浪漫：九龍城和它「城寨」的流金故事，從潮州勢力說起 (李偉民)
- **What it gives (finder's note, not checked):** As a secondary student 李偉民 went in alone: dark maze-like lanes, signs of unlicensed clinics and dentists everywhere, men at doorways who sold drugs. His father had gold teeth made in the City. An unnamed friend's childhood there: only a bed in the home, a cloth curtain between the kerosene stove and the chamber pot, the mother fetched well water each day, kerosene lamps, a quilt shop and a herbal tea shop at the street corner.
- **Notes:** Years are not given; probably the 1960s-1970s (INFERRED). The friend's words are second-hand.

### zh-testimony-9: 從寨城到龍城 林記臘味家第一代負責人靜看變幻半世紀 七十五歲仍每天開店：一日唔拆，一日都做落去

- **Creator:** Ming Pao Weekly (明周文化), 盧乙彬 and 周耀恩
- **Date:** 2022-08-23
- **Kind:** testimony
- **Class:** retrospective (A shopkeeper who worked beside the City from 1964 tells what he saw.)
- **Value:** low
- **Language:** zh
- **Access:** open
- **Licence:** © One Media Group (萬華媒體集團)
- **Link:** https://www.mpweekly.com/culture/%e7%a4%be%e6%9c%83/%e4%b9%9d%e9%be%8d%e5%9f%8e-%e4%b9%9d%e9%be%8d%e5%9f%8e%e9%87%8d%e5%bb%ba-%e6%9e%97%e8%a8%98%e8%87%98%e5%91%b3%e5%ae%b6-210095
- **Proof that it exists:** 從寨城到龍城 林記臘味家第一代負責人靜看變幻半世紀 七十五歲仍每天開店：一日唔拆，一日都做落去 (23.08.2022)
- **What it gives (finder's note, not checked):** 何生 (75) has worked at the shop for six decades: stalls on 衙前塱道 from 1964, then 64 衙前塱道 from the late 1960s, then 70 衙前塱道 from 2007. He says the City had no piped water and people drilled their own wells for ground water ('城寨冇水，自己打科學井'), and that the wires were piled up and people always feared fire. After the clearance of 1993 the residents scattered.
- **Notes:** The shop was on 衙前塱道, south of the City, not inside it. Thus his words about the City are those of a neighbour. Most of the article is on the 2022 urban renewal of Kowloon City.
- **Same item in the finder files:** repo-audit-21

### repo-audit-27: 電影翻生 莊澄3億開拍《九龍城寨》「古仔可以鎮得住個場」

- **Creator:** 文嘉龍, Ming Pao Weekly (明周娛樂)
- **Date:** 2023-03-24
- **Kind:** testimony
- **Class:** retrospective (The film producer tells his own memories of a childhood in the City.)
- **Value:** low
- **Language:** zh
- **Access:** open
- **Licence:** © Ming Pao Weekly
- **Link:** https://www.mpweekly.com/entertainment/article/%E9%9B%BB%E5%BD%B1%E7%BF%BB%E7%94%9F-3%E5%84%84%E9%96%8B%E6%8B%8D%E3%80%8A%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E3%80%8B%E8%8E%8A%E6%BE%84%E3%80%8C%E5%8F%A4%E4%BB%94%E5%8F%AF%E4%BB%A5%E9%8E%AE%E5%BE%97
- **Proof that it exists:** 電影翻生 莊澄3億開拍《九龍城寨》「古仔可以鎮得住個場」 (2023.03.24)
- **What it gives (finder's note, not checked):** 莊澄 lived in the City for about four years until he was seven; the buildings were then of two or three storeys; children kept to the main street and the corner shops.
- **Notes:** retrospective (2023). data/people.json: 5 source entries (chong-ching); docs/people.md 9 lines. His childhood was long before 1985.

### en-testimony-20: What this playful photo reveals about Hong Kong's infamous 'Walled City'

- **Creator:** Rebecca Cairns, CNN
- **Date:** 2023-06-08
- **Kind:** article
- **Class:** retrospective (Greg Girard tells the story of a rooftop photo that he took in the summer of 1989.)
- **Value:** low
- **Language:** en
- **Access:** open
- **Licence:** © CNN
- **Link:** https://www.cnn.com/style/greg-girard-kowloon-walled-city-snap/index.html
- **Other links:** https://kesq.com/?p=1188361
- **Proof that it exists:** It was the summer of 1989.
- **What it gives (finder's note, not checked):** Girard: residents used the rooftops to relax, dry laundry and watch planes land at Kai Tak; children played on the narrow gaps between buildings; outsiders were unwelcome at first, then residents let him into their homes; the old reputation for crime was out of date by 1986.
- **Notes:** I read the CNN Newsource copy on kesq.com; the cnn.com URL is from a search result (another CNN page gave 451). Girard is already in the repo.

### repo-audit-12: 手打魚蛋老字號重生 二代延續蔡瀾至愛潮洲粉麵小店

- **Creator:** Janice Hui (text), Tay Wong (photos), 好集慣 BetterMe; republished on Yahoo新聞 Hong Kong
- **Date:** 2023-11-03
- **Kind:** article
- **Class:** retrospective (The second-generation owner tells his parents' story of their home workshop in the City.)
- **Value:** low
- **Language:** zh
- **Access:** open
- **Licence:** © BetterMe / Yahoo
- **Link:** https://hk.news.yahoo.com/%E6%89%8B%E6%89%93%E9%AD%9A%E8%9B%8B%E8%80%81%E5%AD%97%E8%99%9F%E9%87%8D%E7%94%9F-%E4%BA%8C%E4%BB%A3%E5%BB%B6%E7%BA%8C%E8%94%A1%E7%80%BE%E8%87%B3%E6%84%9B%E6%BD%AE%E6%B4%B2%E7%B2%89%E9%BA%B5%E5%B0%8F%E5%BA%97-094930914.html
- **Proof that it exists:** First sentence: 「我人在香港，想到魚餅，也只有『夏銘記』，不作他選。」
- **What it gives (finder's note, not checked):** In the 1960s the parents lived in the City and used the home as a workshop for squid and pork balls, sold to Chiu Chow restaurants in Tsim Sha Tsui East; the shop opened in Ho Man Tin in 1983.
- **Notes:** retrospective (2023). data/people.json: 3 source entries (Ha Ming Kee family); docs/people.md 3 lines. The reporter relays Roger's words. No folder.

### zh-testimony-6: 九龍城寨之圍城｜敏叔義務導賞九龍寨城公園足26年：我從未退休

- **Creator:** am730
- **Date:** 2024-05-06
- **Kind:** testimony
- **Class:** retrospective (The volunteer guide tells of his own visit to a classmate inside the City.)
- **Value:** low
- **Language:** zh
- **Access:** open
- **Licence:** © am730
- **Link:** https://www.am730.com.hk/%E7%94%9F%E6%B4%BB/%E4%B9%9D%E9%BE%8D%E5%9F%8E%E5%AF%A8%E4%B9%8B%E5%9C%8D%E5%9F%8E-%E6%95%8F%E5%8F%94%E7%BE%A9%E5%8B%99%E5%B0%8E%E8%B3%9E%E4%B9%9D%E9%BE%8D%E5%AF%A8%E5%9F%8E%E5%85%AC%E5%9C%92%E8%B6%B326%E5%B9%B4-%E6%88%91%E5%BE%9E%E6%9C%AA%E9%80%80%E4%BC%91/450380
- **Proof that it exists:** 九龍城寨之圍城｜敏叔義務導賞九龍寨城公園足26年：我從未退休 | am730
- **What it gives (finder's note, not checked):** On a student visit (undated) a man lying on the ground asked him for money; he could not find the stairs and walked through a family's home during their meal to reach them; his classmate said that people who walk straight in are taken as acquaintances and ignored.
- **Notes:** Says he moved to Kowloon City in 1999. See zh-testimony-5 for the other 敏叔 interviews.

### zh-testimony-4: 在城寨「食白麵」的人｜採訪手記｜Yahoo

- **Creator:** YahooYahoo Hong Kong (新聞), reporter 鄭美姿; photos Nasha Chan
- **Date:** 2024-06-03
- **Kind:** testimony
- **Class:** retrospective (Two people tell what they saw of drug use and arrests at the edge of the City.)
- **Value:** low
- **Language:** zh
- **Access:** open
- **Licence:** © Yahoo Hong Kong
- **Link:** https://hk.news.yahoo.com/%E5%9C%A8%E5%9F%8E%E5%AF%A8%E3%80%8C%E9%A3%9F%E7%99%BD%E9%BA%B5%E3%80%8D%E7%9A%84%E4%BA%BA%EF%BD%9C%E6%8E%A1%E8%A8%AA%E6%89%8B%E8%A8%98%EF%BD%9Cyahoo-044840644.html
- **Proof that it exists:** 在城寨「食白麵」的人｜採訪手記｜Yahoo (更新時間 2024年6月3日)
- **What it gives (finder's note, not checked):** 阿平 (grew up in 橫頭磡邨) watched addicts heat heroin on foil with a candle and inhale through a matchbox; in 1974-75 he went with former pupils of 城寨坊眾學校 to patriotic classes at 國華商業銀行. An unnamed old woman who lived at the edge of the City saw addicts at the drain by the 東頭村道 entrance, and plainclothes police take dealers away in chains at 11 pm to midnight.
- **Notes:** A reporter's note that goes with zh-testimony-3. 1970s. The old woman's years are not given.

### zh-testimony-16: 周笑華／我的九龍城寨故事

- **Creator:** 周笑華, United Daily News (聯合報) 家庭副刊
- **Date:** 2024-12-26
- **Kind:** testimony
- **Class:** retrospective (A memoir essay of the writer's own walks through the City as a schoolgirl.)
- **Value:** low
- **Language:** zh
- **Access:** open
- **Licence:** © 聯合報 and the writer
- **Link:** https://reading.udn.com/read/story/7347/8443991
- **Proof that it exists:** 周笑華／我的九龍城寨故事 (2024/12/26)
- **What it gives (finder's note, not checked):** In the 1960s, at 13 or 14, she took a short cut through the City to school with a classmate, reading English words as they walked. The lanes were quiet in the early morning, with few people and shops not yet open. A man in his forties warned the girls not to come that way again.
- **Notes:** 1960s. Neighbours told her (second-hand) that the City's dentists were skilled and cheap.

### top-zh-testimony-6: 【留住龍城】EP.1 從城寨開始 陪伴九龍城走過半個世紀的崇麟鞋業

- **Creator:** ACOO (acoo.hk); text Yanto, photos Hiuyan, design Owen
- **Date:** 2025-01-07
- **Kind:** article
- **Class:** retrospective (The second-generation owner of a shop that faced the City from 1967 tells of her family and the street.)
- **Value:** low
- **Language:** zh
- **Access:** open
- **Licence:** © ACOO
- **Link:** https://www.acoo.hk/?p=24432
- **Other links:** https://www.acoo.hk/wp-json/wp/v2/posts/24432
- **Proof that it exists:** Read with the WordPress API (post 24432): title as above, date 2025-01-07T18:18:16.
- **What it gives (finder's note, not checked):** The shoe shop 崇麟 opened in 1967 opposite the City (now the park): 「位於九龍寨城公園正對面……於1967年開業」. The owner Tella lived upstairs as a child. Neither article says that the shop or the family was inside the City.
- **Notes:** Same shop: 集誌社, 「九龍城重建 3｜崇麟鞋業　58 年老店　原區覓舖自救　用賠償金賭一賭　現況如何？」 (2025-10-01), https://thecollectivehk.com/%e4%b9%9d%e9%be%8d%e5%9f%8e%e9%87%8d%e5%bb%ba-3%ef%bd%9c%e5%b4%87%e9%ba%9f%e9%9e%8b%e6%a5%ad%e3%80%8058-%e5%b9%b4%e8%80%81%e5%ba%97%e3%80%80%e5%8e%9f%e5%8d%80%e8%a6%93%e8%88%96%e8%87%aa%e6%95%91/ . It gives the address 衙前塱道 82-84 and says 「未拆卸前的九龍城寨，正正位於崇麟鞋業對面。」 The first stall was 「一個由鐵皮搭建的小檔口」 (place not stated). The ACOO slug from the API had a broken byte, thus the ?p= link.

### top-en-testimony-1: Steve Vickers' 50 years of battling Hong Kong's criminal underworld

- **Creator:** Annemarie Evans, South China Morning Post, Post Magazine (reproduced on the site of Steve Vickers Associates)
- **Date:** 2025-09-23
- **Kind:** article
- **Class:** retrospective (A 2025 interview in which a former Royal Hong Kong Police inspector speaks of his own first posting to Kowloon City, which then included the Walled City.)
- **Value:** low
- **Language:** en
- **Access:** open
- **Licence:** © South China Morning Post / Steve Vickers Associates
- **Link:** https://stevevickersassociates.com/media/sv-interviewed-by-scmp-postmag-re-his-50-years-of-battling-hong-kongs-criminal-underworld
- **Proof that it exists:** Page title 'SV interviewed by SCMP PostMag, re: his 50… | Steve Vickers Associates'; quote: 'I came out of training and was sent off (as a young inspector) to Kowloon City, which in those days included the…'
- **What it gives (finder's note, not checked):** Steve Vickers started police training in February 1975 and, after nine or ten months, went as a young inspector to Kowloon City division, which then included the Walled City. He says of the City: 'All sorts of things went on there.' The read part gives no more detail of life inside; about 1975-1976.
- **Notes:** The date 2025-09-23 is the date on the Steve Vickers Associates page; the SCMP publication date and the SCMP URL were not seen (SCMP blocks scripts), so no SCMP URL is given. A photo on the page is a 1972 view of the Walled City credited to C. Y. Yu. The fetch tool gave only two sentences on the City; a full read by a person can find more lines. Not in any file of research/sources-2026-11/ (checked by grep for 'vickers').

### zh-testimony-12: 【淑梅足跡】電影多面手林家棟

- **Creator:** 車淑梅, Wen Wei Po (香港文匯報)
- **Date:** 2026-04-21
- **Kind:** testimony
- **Class:** retrospective (The actor 林家棟 tells of his childhood in the City in an interview column.)
- **Value:** low
- **Language:** zh
- **Access:** open
- **Licence:** © 香港文匯報
- **Link:** https://www.wenweipo.com/a/202604/21/AP69e68722e4b0b49ad1b7b54b.html
- **Proof that it exists:** 【淑梅足跡】電影多面手林家棟 (車淑梅, 2026-04-21)
- **What it gives (finder's note, not checked):** 林家棟 lived in the City as a child: the gaps between buildings were not wider than two feet ('大廈之間不會闊過兩呎'), the inside had no sky ('裏面是不見天的'), the real City was worse than the film with syringes on the ground, and addicts with bent backs and legs.
- **Notes:** Years are not given here. zh-testimony-13 relays that he moved in before age 10 and lived four years on a 12th floor with no lift. He found former neighbours for the 2024 film (zh-testimony-14).

### top-en-testimony-2: A varied and interesting career

- **Creator:** Offbeat, the newspaper of the Hong Kong Police Force
- **Date:** c.2003
- **Kind:** article
- **Class:** retrospective (A third-person retirement profile of a police officer, probably from his own account, with a section on his Kowloon City posting but no observation of the City.)
- **Value:** low
- **Language:** en
- **Access:** open
- **Licence:** © Hong Kong Police Force
- **Link:** https://www.police.gov.hk/offbeat/754/eng/n04.htm
- **Proof that it exists:** Headline 'A varied and interesting career'; section 'Sojourn in the Walled City': 'In May 1982 he went to Kowloon City Division Acting Divisional Commander (Crime).'
- **What it gives (finder's note, not checked):** Names Chan Chin-cheung, who joined the Force in 1971: Acting Divisional Commander (Crime) of Kowloon City Division from May 1982, Chief Inspector from July 1982, then to Tsim Sha Tsui Division in 1984. The section has the heading 'Sojourn in the Walled City', but its text gives no fact about the City.
- **Notes:** The page does not show the issue date. The date c.2003 is INFERRED from 'joined the Force in 1971' and 'retiring after more than three decades of service'; it is not sure. He retired as Senior Superintendent (Administration), Kowloon West. Value as a lead: he was the crime chief of the division of the City in 1982-1984, thus a possible person for an oral history. Offbeat 903 'Nostalgic visit to EU KW' (https://www.police.gov.hk/offbeat/903/eng/n20.htm) was also read: it names Guy Shirra and Stewart Kavanagh (Emergency Unit Kowloon West, 1977-1979) but has no sentence on the City.

### repo-audit-16: About | ALBERT NG; About - Ps. Albert Ng's Blog; Pastor Albert Ng (Island ECC)

- **Creator:** Albert Ng (own sites); Island Evangelical Community Church
- **Date:** undated
- **Kind:** testimony
- **Class:** retrospective (Short bios that the former resident wrote of himself, and one by his church.)
- **Value:** low
- **Language:** en
- **Access:** open
- **Licence:** © the author / Island ECC
- **Link:** https://psalbertng.wixsite.com/blog/about
- **Other links:** https://pastoralbertng.wordpress.com/about/, https://www.islandecc.hk/ministry-leaders-and-elders/albert-ng/
- **Proof that it exists:** About | ALBERT NG: 'I was born in a farming village in Mainland China.'
- **What it gives (finder's note, not checked):** Born in a village in China, brought to Hong Kong as a child; the family lived in the City until it was demolished; Island ECC says he lived there more than ten years.
- **Notes:** data/people.json: 7 source entries (albert-ng-kam-po) over the three pages (wixsite 3, Island ECC 2, wordpress 1, plus the blog About page in repo-audit-15); docs/people.md 7 lines. No dates of residence in these pages.
