# Secondary sources

Secondary sources about Kowloon Walled City (九龍城寨). This folder is the
"everything else" folder. A source goes here if it passes two tests:

1. It is not a primary source. [`../primary-sources/README.md`](../primary-sources/README.md)
   gives the definition of a primary source.
2. It is at least plausibly credible.

Thus this folder holds histories, scholarship, later press features, essays,
captions written later, reference pages, reconstructions, later documentaries,
and films shot in the City. There are no sub-classes. These sources add detail
and flavour to the model. They do not have the claim of a primary source.

A record made at the time does not go here. First-hand testimony does not go
here, even if the person gave it years later. Put both in `../primary-sources/`.

## One rule for the two trees

**`../primary-sources/` holds only primary facts. This folder holds all the
other facts.** The tree of a `SOURCE.md` tells the claim of each fact in it.

Some sources have the two kinds of part. A book can print documents of the
time and also essays written later. An interview article has the words of the
witness and also the background text of the reporter. Such a source has two
folders with the same name, one in each tree:

- `../primary-sources/<name>/SOURCE.md` has the primary parts.
- `secondary-sources/<name>/SOURCE.md` has the secondary parts.

Each of the two files links to the other. The files of the source (scans,
downloads) stay in one place only: the primary folder.

## How to use a secondary source in the model

1. Use a primary source if one gives the fact.
2. Mark a fact that comes from this folder. In `data/room_research.json`,
   write `source_type: "secondary (year)"`. In the other data files, name the
   work in `source`, and write "secondary" with it.
3. Follow the citation. If the work names its own source, find that source. If
   you get it, put it in `../primary-sources/`, and cite it. If you cannot get
   it, add it to the leads.
4. If a secondary source and a primary source disagree, the primary source
   wins. Record the disagreement.
5. Fiction changes things for the story. If a film was shot in the real City,
   the real lanes, roofs and rooms that it shows are evidence. The plot, the
   sets and the props are not. Mark each detail from fiction INFERRED.
6. A reconstruction (a drawing, a model, a 3D model) shows what its maker
   believed. Use it for shapes and ideas. Do not use it for sizes, counts or
   addresses.

## Conventions

The conventions are those of `../primary-sources/README.md`, with these additions.

- One folder for each source, or for one set of like sources.
- Each folder has a `SOURCE.md`: citation, link, retrieval date, license, and
  the facts and details with page numbers. Write down each useful detail. Do
  not keep only the main points.
- Each `SOURCE.md` has a section "What it rests on": the sources that the work
  itself used. This shows how far to trust each fact.
- Each `SOURCE.md` has a section "Limits": known errors, guesses and gaps.
- Each `SOURCE.md` has a section "Leads to primary sources": the primary
  sources that the work cites and that the repo does not hold.
- Open-licensed files go in the folder, and git stores them. Copyrighted files
  go in `<folder>/local/`, which git ignores (see `/.gitignore`).
- Do not use a pirated copy of a book or a film. Do not open content that has
  a "NoAI" mark.

## Sources

The first 11 folders of this table are the secondary twins of the primary folders with the same
names. Each `SOURCE.md` names its twin, and the files of the source stay in the primary folder.
The folders after them come from the source search of 2026-11 and have no twin. They are
catalogued, not read: read each item on its source before you use one of its facts.

| Folder | What | Dates | In git | Link |
|---|---|---|---|---|
| [`city-of-darkness-revisited/`](city-of-darkness-revisited/SOURCE.md) | Girard and Lambot's book (2014 edition), the secondary parts: the 2014 essays (Popham, Wilkinson, Saywell, Resnick, Lui, Lambot, McHugh), the captions and standfirsts, the features with no speaker, the fold-out, the later studies. 1848 details (1843 checked by a second agent), 224 quoted records, 118 leads Catalogued 2026-11: 1 more items, not read. | written 1993–2014 (about 1845–1995) | notes only (© Girard, Lambot and others) | https://search.worldcat.org/search?q=bn:9781873200889 |
| [`wsj-kwc-2014/`](wsj-kwc-2014/SOURCE.md) | WSJ web interactive (April 2014), the secondary part: the narration, the history timeline, the captions, and the WSJ charts of old figures (Kai Fong trade count 1983, population, area, flat size 1988, rehousing 2002). The residents' words stay primary Catalogued 2026-11: 1 more items, not read. | Apr 2014 (tells of 1197–1995) | notes only | https://web.archive.org/web/20161228012123/http://projects.wsj.com/kwc/ |
| [`retrospective-testimony-web/`](retrospective-testimony-web/SOURCE.md) | The writers' background text around the witnesses of the twin: the reporters' history, figures and captions (HK01 (香港01), Ming Pao Weekly (明周), Beijing Visitor, The Travel Club), Brian Coak's history of the City, and Hugh Farmer's article on its factories | 2009–2024 (history from 1668) | notes only | https://www.hk01.com/社區專題/1033066/ |
| [`hk01-kaifong-series-2016/`](hk01-kaifong-series-2016/SOURCE.md) | HK01 (香港01) series, Aug 2016: the reporter's narration and captions. Water carried from 老虎岩, meters and cables, the 華聲 strip club, unlicensed dentists, peak figures, the 1987 cordon, the 1991 forced removals, demolition by hammer | 26–28 Aug 2016 (tells of about 1949–1993) | notes only | https://www.hk01.com/article/39194 |
| [`daizukai-kowloon-1997/`](daizukai-kowloon-1997/SOURCE.md) | 『大図解 九龍城』 (Iwanami Shoten (岩波書店), 1997): the cutaway panorama by Terasawa Hitomi (寺澤一美). It is a reconstruction. 24 room labels (Z39–Z62), 55 more labels on homes, roofs, water, rubbish and streets, and the English notes of rioleo.org | drawn 1997 from the survey of Jan–Feb 1993 | notes only | https://www.rioleo.org/kowloon/ |
| [`mplus-girard-lambot-photos/`](mplus-girard-lambot-photos/SOURCE.md) | M+ texts on the Girard and Lambot photos: the catalogue text of 2013.143 and 2018.4 (35,000 people, about 350 buildings, Sai Tau Tsuen (西頭村) cleared 1985) and the narration of audio guides 8038 and 9038 | written 2014 or later; photos 1987–1991 | notes only | https://www.mplus.org.hk/en/collection/makers/ian-lambot/ |
| [`upi-reports-1984-1987/`](upi-reports-1984-1987/SOURCE.md) | The history background in two UPI wire reports (Battenfeld 1984, Jones 1987): the fort of 1843 and its walls, the 1898 lease, the Japanese demolition, post-war building, the 1975 height law, earlier clearance plans | reports of 18 Dec 1984 and 15 Feb 1987 (tell of 1843–1975) | notes only | https://www.upi.com/Archives/1984/12/18/Walled-City-a-Place-of-Myths-and-Crime/5019472194000/ |
| [`press-articles-1959-1992/`](press-articles-1959-1992/SOURCE.md) | The history background of two press reports from inside the City, TIME (1959) and *The Baltimore Sun* (1992): the 1843 fort, the 1898 lease, the clearance attempts of 1947–48 and 1962, Triads, the 1987 decision | 7 Sep 1959 and 30 Jun 1992 | notes only | https://www.baltimoresun.com/1992/06/30/denizens-of-noted-hellhole-face-walled-city-eviction/ |
| [`commons-photos-1972-1993/`](commons-photos-1972-1993/SOURCE.md) | Later words on the Commons pages of the 11 photos: the uploaders' captions of the files credited to Lambot (Sai Tau Tsuen (西頭村), the 1989 park, the 1975 heights) and the editors' notes | captions 2017–2025 | notes only | https://commons.wikimedia.org/wiki/Category:Historical_images_of_Kowloon_Walled_City |
| [`mplus-suenn-ho-ca17/`](mplus-suenn-ho-ca17/SOURCE.md) | M+'s later description of Suenn Ho's (何巽) footage on the CA17 fonds page: dripping alleys, street-level shops and food makers, aeroplanes over the roofs, the residents' reluctance to leave | written 2015 or later (footage of 1988–1992) | notes only | https://www.mplus.org.hk/en/collection/archives/suenn-hos-kowloon-walled-city-research-archive-ca17/ |
| [`gwulo-suddaby-1987/`](gwulo-suddaby-1987/SOURCE.md) | One reader's comment (2020) on Andrew Suddaby's Gwulo photo 22836: the road and the place of the camera, an entrance into Tai Chang Street (大井街), and a family memory of the "illegal" dentists | 27 Dec 2020 (photos of 1 Nov 1987) | notes only | https://gwulo.com/media/22836 |
| [`press-and-web-features-1990-2026/`](press-and-web-features-1990-2026/SOURCE.md) | Later press and web features. Catalogued, not read: 30 items (value high) | 1987-2025 | catalogue only | https://2014.sopawards.com/wp-content/uploads/2014/06/City-of-anarchy.pdf |
| [`park-and-heritage-2006-2026/`](park-and-heritage-2006-2026/SOURCE.md) | Park, monuments and heritage displays (secondary). Catalogued, not read: 26 items (value high) | 2006-2026 | catalogue only | https://commons.wikimedia.org/wiki/File:Streets_in_Kowloon_Walled_City.jpg |
| [`depictions-film-and-tv-1966-2025/`](depictions-film-and-tv-1966-2025/SOURCE.md) | Depictions: films and TV shot in or set in the City. Catalogued, not read: 23 items (value high) | 1966-2025 | catalogue only | https://www.hk01.com/sns/article/1018365 |
| [`church-and-mission-histories/`](church-and-mission-histories/SOURCE.md) | Church and mission histories. Catalogued, not read: 14 items (value high) | 2013-2025 | catalogue only | https://www.cnec.org.hk/message_article/article/a4/ |
| [`scholarship-land-and-planning-1992-2026/`](scholarship-land-and-planning-1992-2026/SOURCE.md) | Scholarship: land, property rights and planning. Catalogued, not read: 13 items (value high) | 1996-2025 | catalogue only | https://mdpi-res.com/d_attachment/buildings/buildings-12-00757/article_deploy/buildings-12-00757.pdf |
| [`scholarship-history-law-society-1973-2026/`](scholarship-history-law-society-1973-2026/SOURCE.md) | Scholarship: history, law and society. Catalogued, not read: 19 items (value medium) | 1980-2026 | catalogue only | https://pmc.ncbi.nlm.nih.gov/articles/PMC5732597/ |
| [`documentaries-video-and-podcasts-1990-2026/`](documentaries-video-and-podcasts-1990-2026/SOURCE.md) | Later documentaries, video explainers and podcasts. Catalogued, not read: 19 items (value medium) | 2010-2026 | catalogue only | https://news.ifeng.com/c/8SjFo883Qbp |
| [`reference-and-web-histories/`](reference-and-web-histories/SOURCE.md) | Reference pages, wikis and web histories. Catalogued, not read: 17 items (value medium) | 2005-2026 | catalogue only | https://lichokiu.blogspot.com/2005/09/blog-post_112754459002873396.html |
| [`history-books-1988-2026/`](history-books-1988-2026/SOURCE.md) | History books on the City. Catalogued, not read: 5 items (value medium) | 1895-2026 | catalogue only | https://districtcouncils.gov.hk/kc/doc/2016_2019/en/dc_meetings_doc/15863/KCDC19_54cp_Annex.pdf |
| [`yoshida-ichiro-testimony-1985/`](yoshida-ichiro-testimony-1985/SOURCE.md) | The secondary parts of the items of the primary folder of the same name: narration, later captions and histories | see the items | no (notes only) | ../primary-sources/yoshida-ichiro-testimony-1985/SOURCE.md |
| [`hk-chinese-press-1985-1993/`](hk-chinese-press-1985-1993/SOURCE.md) | The secondary parts of the items of the primary folder of the same name: narration, later captions and histories | see the items | no (notes only) | ../primary-sources/hk-chinese-press-1985-1993/SOURCE.md |
| [`hk-chinese-press-1947-1984/`](hk-chinese-press-1947-1984/SOURCE.md) | The secondary parts of the items of the primary folder of the same name: narration, later captions and histories | see the items | no (notes only) | ../primary-sources/hk-chinese-press-1947-1984/SOURCE.md |
| [`maps-and-aerial-photos-1889-1994/`](maps-and-aerial-photos-1889-1994/SOURCE.md) | The secondary parts of the items of the primary folder of the same name: narration, later captions and histories | see the items | no (notes only) | ../primary-sources/maps-and-aerial-photos-1889-1994/SOURCE.md |
| [`hk-government-records-1899-1996/`](hk-government-records-1899-1996/SOURCE.md) | The secondary parts of the items of the primary folder of the same name: narration, later captions and histories | see the items | no (notes only) | ../primary-sources/hk-government-records-1899-1996/SOURCE.md |
| [`hko-weather-1986-1992/`](hko-weather-1986-1992/SOURCE.md) | The secondary parts of the items of the primary folder of the same name: narration, later captions and histories | see the items | no (notes only) | ../primary-sources/hko-weather-1986-1992/SOURCE.md |
| [`legco-and-urban-council-1919-1997/`](legco-and-urban-council-1919-1997/SOURCE.md) | The secondary parts of the items of the primary folder of the same name: narration, later captions and histories | see the items | no (notes only) | ../primary-sources/legco-and-urban-council-1919-1997/SOURCE.md |
| [`visitor-photos-1970-1993/`](visitor-photos-1970-1993/SOURCE.md) | The secondary parts of the items of the primary folder of the same name: narration, later captions and histories | see the items | no (notes only) | ../primary-sources/visitor-photos-1970-1993/SOURCE.md |

<!-- SOURCES-TABLE: the new secondary folders of the search of 2026-11 go above this line -->

## Leads not yet collected

<!-- LEADS -->

### Leads of the source search of 2026-11

The triage of the search (2026-11-17) did not make a folder for these 29 items: each one is behind a
paywall, print only, offline, or of less value. Each line gives the item, its access, the folder that
it can go in, and what the finder says that it gives (not checked).

**daizukai-kowloon-1997**
- 「伝説の魔窟」をまっぷたつ!シラミ潰しで描いた「九竜城断面図」; Geijutsu Shincho (芸術新潮), Shinchosha (新潮社); no author named in the record; 1997-09. Access: print-only. Planned folder: daizukai-kowloon-1997. Gives: A 4-page feature (vol. 48 no. 9, 通号 573, pp. 88-91) on the 九竜城断面図, the cutaway panorama of 『大図解 Iwanami, July 1997 (九龍城』). By its title, it tells how the artist drew the City room by room. It can reproduce the panorama l https://ndlsearch.ndl.go.jp/books/R000000004-I4288032

**guidebooks-and-travel-1975-1994**
- 地球の歩き方 35 香港 1988～89年版; 地球の歩き方編集室 (ダイヤモンド・ビッグ社 Diamond-Big; sold by ダイヤモンド社); 1988-02. Access: print-only. Planned folder: secondary-guidebooks-and-travel-1975-1994. Gives: The first separate Hong Kong volume of the series. The publisher's web magazine (6 Jan 2025) says: '80年代の『地球の歩き方　香港・マカオ』でも九龍城砦への行き方を掲載していた'. Thus it can give the route, the entrances and the warnings that Japanese backpa https://ndlsearch.ndl.go.jp/books/R100000002-I000001898521
- 地球の歩き方 35 香港, 1989～90年版 to 1993～94年版 (five yearly editions); 地球の歩き方編集室 (ダイヤモンド・ビッグ社 Diamond-Big); 1989-1993. Access: print-only. Planned folder: secondary-guidebooks-and-travel-1975-1994. Gives: Five editions, one each year from March 1989 to April 1993. Read beside the 1988 edition, they can show year by year how the guide changed its route and warnings, and when it reported the clearance of 1992-1993. https://ndlsearch.ndl.go.jp/books/R100000002-I000001963255
- Fodor's Hong Kong and Macau, 1988; Fodor's Travel Publications, New York; 1987. Access: print-only. Planned folder: secondary-guidebooks-and-travel-1975-1994. Gives: The edition for 1988: the City is 'just a few hundred yards from Kai Tak' (啓德); police 'hesitated to pursue criminals into the Walled City'; visitors can 'stroll past' the rows of dentists' and doctors' signs; religious https://archive.org/details/fodorshongkongma0000unse_z1x5
- Fodor's Hong Kong and Macau; Fodor's Travel Guides, New York; 1984. Access: print-only. Planned folder: secondary-guidebooks-and-travel-1975-1994. Gives: The same Walled City passage as the 1988 edition, three years earlier: near Kai Tak, police reluctance, the dentists' and doctors' rows, mission work with addicts, 'no place for tourists'. The two editions show that the https://archive.org/details/fodorshongkongma0000unse
- Hong Kong (Insight Guides); Hans Johannes Hoefer (director), Leonard Lueras and R. Ian Lloyd; Hong Kong editor Saul Lockhart (Apa Productions, Singa; 1989. Access: print-only. Planned folder: secondary-guidebooks-and-travel-1975-1994. Gives: A section 'The Walled City' (p. 160 in the contents): it tells visitors to 'stay out of the Walled City', but they 'might risk a stroll along Tung Tau Tsuen Street', on its edge; 'rows of illegal dentists' shops operated https://archive.org/details/hongkonginsightg00insi
- Hong Kong / directed by Hans Johannes Hoefer; produced, edited and designed by Leonard Lueras and R. Ian Lloyd; editor in Hong Kong, Saul Lockhart (Insight Guides); Apa Productions, Hong Kong; 1983. Access: print-only. Planned folder: secondary-guidebooks-and-travel-1975-1994. Gives: The 1983 form of the Insight text: a section 'The Walled City' (p. 162 in the contents); 'a few hundred yards away is the infamous Walled City. Although little remains of its original' [walls]; the stroll along Tung Tau https://archive.org/details/hongkongdirected00hoef
- Hong Kong, Macau & Canton: a travel survival kit; Carol Clewlow (Lonely Planet Publications, South Yarra, Vic.); 1986. Access: print-only. Planned folder: secondary-guidebooks-and-travel-1975-1994. Gives: Page 98, in the Kowloon chapter, has the section 'The Walled City'; the index gives 'Walled City 98'. It is the Lonely Planet text of the peak years. https://archive.org/details/hongkongmacaucan0000clew
- Hong Kong, Macau & Canton; Carol Clewlow (Lonely Planet, South Yarra, Vic.); 1981. Access: print-only. Planned folder: secondary-guidebooks-and-travel-1975-1994. Gives: The first Lonely Planet Hong Kong guide has a section 'The Walled City' in the Kowloon chapter (contents: 'Wong Tai Sin Temple — The Walled City — Museums'). It tells budget travellers of 1981 what the City is and is not https://archive.org/details/hongkongmacaucan00caro
- Making the most of Hong Kong: A do-it-yourself guide; R. C. Masefield (South China Morning Post); 1983. Access: print-only. Planned folder: secondary-guidebooks-and-travel-1975-1994. Gives: A guide by the local English newspaper. It warns: 'The visitor is advised not to enter the Walled City without an escort'; it describes how Kowloon City grew 'from a rural area with a walled city and a few villages into https://archive.org/details/makingmostofhong0000rcma
- Le Grand guide de Hong Kong; Gallimard, Paris; 1990. Access: print-only. Planned folder: secondary-guidebooks-and-travel-1975-1994. Gives: A French guide: north of Kai Tak airport lies 'l'inquiétante Cité murée (Walled City)'; 'curious tourists can go as far as Tung Tau Tsuen Street', where the Chinese dentists have their shops. It confirms the street front https://archive.org/details/legrandguidedeho0000unse

**history-books-1988-2026**
- 九龍城寨史話; 魯金; 1988. Access: print-only. Planned folder: secondary-history-books-1988-2026. Gives: Pp104-133: the places street by street, for example the big well at 8 Tai Chang Street (from the repo's lead).
- A Concise History of Kowloon Walled City (九龍城寨簡史); Lu Jin (魯金); 三聯書店(香港); 2018-04-01. Access: print-only. Planned folder: secondary-history-books-1988-2026. Gives: The history from old texts, archives and fieldwork: the 'dark period', the origin of the street names, and two appendices on the historic sites and on the demolition. https://books.google.com/books?id=UIOgDwAAQBAJ
- 國民政府的香港問題處置 (第七章 九龍寨城事件); 三聯書店(香港) (Joint Publishing); the author is not named in the sample pages; 2024. Access: print-only. Planned folder: secondary-history-books-1988-2026. Gives: A chapter (from p. 185) on the 1948 九龍寨城事件, which the introduction says is based on unpublished archives of the two states: the forced demolition, the burning of the British consulate at 沙面, and talks that lasted a year. https://www.jointpublishing.com/wp-content/uploads/2024/09/國民政府的香港問題處置_試讀頁.pdf
- Jiulongcheng zhai shi hua (九龍城寨史話); Lu Jin (魯金); 1988. Access: print-only. Planned folder: secondary-history-books-1988-2026. Gives: The places of the City street by street (pp. 104-133 per the repo's leads), for example the big well at 8 Tai Chang Street (大井街). Written in 1988, at the time of the clearance decision. https://openlibrary.org/isbn/9620406826

**Other**
- Not done in lens top-scholarship: Contents of 趙雨樂 and 鍾寶賢《九龍城》 (2001): Google Books API gave 429 and one search found no 目錄; not retried. Check HKPL or a university catalogue.

**press-and-web-features-1990-2026**
- 香港・九龍城砦--中国的住まい方の極限; 村松伸 (in 『東京人』, 都市出版); 1987-11. Access: print-only. Planned folder: secondary-press-and-web-features-1990-2026. Gives: Seven pages (pp. 128-134) on the City as 'the limit of the Chinese way of dwelling', in a Tokyo city magazine of November 1987, the year of the clearance decision. https://ndlsearch.ndl.go.jp/books/R100000002-I000000051494-d4424797

**scholarship-history-law-society-1973-2026**
- 喬健等 (1992), a study of the Walled City residents, pp1020-1034 (title not known); 喬健 and others; 1992. Access: print-only. Planned folder: secondary-scholarship-history-law-society-1973-2026. Gives: The Kai Fong Association survey of 745 premises (1983), from the repo's lead.
- Hong Kong's Dirty Little Secret: Clearing the Walled City of Kowloon; Seth Harter (University of Michigan); 2000-11. Access: paywall. Planned folder: secondary-scholarship-history-law-society-1973-2026. Gives: The main English-language history of the clearance decision and its execution, 1987-1993. Later works cite it for the food factories (noodles, dumplings, fishballs) at p. 98, for vice businesses, and for the Kai Fong (街坊 https://doi.org/10.1177/009614420002700106
- The Carceral City: Confinement and Order in Hong Kong's Forbidden Enclave; Alistair Fraser and Anna Schliehe; 2021-01-05. Access: paywall. Planned folder: secondary-scholarship-history-law-society-1973-2026. Gives: Order, corruption and daily life inside the City, from oral testimonies of police officers, triad members and residents. It describes the City as a 'quasi-carceral' site and a 'freestanding grey economy'. https://doi.org/10.1093/bjc/azaa087
- The walled city of Kowloon: historical and legal aspects; Peter Wesley-Smith; Hong Kong Law Journal, vol. 3 (1973); 1973. Access: paywall. Planned folder: secondary-scholarship-history-law-society-1973-2026. Gives: The legal status of the City and the government's policy towards it, 1898 to the early 1970s (pp. 67-96 per a search extract). https://web.law.hku.hk/hklj/1973-Vol-3.php

**scholarship-land-and-planning-1992-2026**
- Reinterpreting the Kowloon Walled City: From a "cesspool of iniquities" to an entrepreneurial discovery lab; David Emanuel Andersson, Lawrence WC Lai, Mark Hansley Chua, Nixon TH Leung, Vincent NH Chan, Stephen NG Davies; Plannin; 2026-01-11. Access: paywall. Planned folder: secondary-scholarship-land-and-planning-1992-2026. Gives: Two case studies of land assembly, from cadastral, census and archival records, that show how high-rise blocks replaced the older houses. It links the densification to the unlicensed medical and dental services. It is th https://doi.org/10.1177/14730952261415601
- "Ring up for an appointment": Empirical & oral evidence of commercial & other freedoms in the heyday of the City; Lawrence Wai Chung Lai, Stephen Nicholas Guy Davies, Prudence Leung Kwok Lau, Nixon Tit Hei Leung, Vincent Nok Hang Chan; 2023-04. Access: paywall. Planned folder: secondary-scholarship-land-and-planning-1992-2026. Gives: Commerce and other freedoms in the City's heyday, from oral evidence. Its references include the Hong Kong Government Staff Lists of 1978 and 1980 and the 1997 Daizukai panorama. https://doi.org/10.1016/j.cities.2023.104232
- An empirical Coasian study on the socio-economic profiles of two politically sensitive informal settlements: Kowloon Walled City and Rennie's Mill; Lawrence W.C. Lai, Prudence L.K. Lau, Mark Hansley Chua; 2020-09. Access: paywall. Planned folder: secondary-scholarship-land-and-planning-1992-2026. Gives: Socio-economic profiles of the City's residents. Its references show that it uses the Hong Kong 1981 Census Summary Results and the Hong Kong 1986 By-Census Summary Results, thus it can give data for the year of the mode https://doi.org/10.1016/j.landusepol.2020.104750
- Informal land registration under unclear property rights: witnessing contracts, redevelopment, and conferring property rights; Lawrence W.C. Lai, Frank T. Lorne, K.W. Chau, Ken S.T. Ching; 2016-01. Access: paywall. Planned folder: secondary-scholarship-land-and-planning-1992-2026. Gives: How the Kowloon Walled City Kaifong Welfare Promotion Association witnessed property contracts and acted as a de facto land registrar for sales and redevelopment. This explains who owned the flats and how they changed ha https://doi.org/10.1016/j.landusepol.2015.09.016
- Un-forgetting walls by lines on maps: A case study on property rights, cadastral mapping, and the landscape of the Kowloon Walled City; Lawrence W.C. Lai; 2016-11. Access: paywall. Planned folder: secondary-scholarship-land-and-planning-1992-2026. Gives: How maps and cadastral lines kept the line of the lost walls, and how the government treated the City as a planning unit after the walls were gone. It explains the official boundary of the City at the clearance. https://doi.org/10.1016/j.landusepol.2016.05.022
- The history of planning for Kowloon City; Lawrence W. C. Lai and Mark Hansley Chua; 2018-01-02. Access: paywall. Planned folder: secondary-scholarship-land-and-planning-1992-2026. Gives: Eight phases of planning for the site, from the 1930s plan to clear it for a garden to the park built after the 1984 Joint Declaration. It concludes that 'the City has always been planned'. https://scholars.ln.edu.hk/en/publications/the-history-of-planning-for-kowloon-city/
- Kowloon Walled City: A unique phenomenon comes to an end; Pascale Liotard; PACE Interior Architecture, v.39; 1992. Access: print-only. Planned folder: secondary-scholarship-land-and-planning-1992-2026. Gives: Sections: legal position, urban development, lack of amenities, 'a termite city', demolition, references; with illustrations, maps and plans (1992). https://hkapi.lib.cuhk.edu.hk/handle/msO8s77aBT/6111
- Kowloon Walled City (Master's thesis, Harvard University Graduate School of Design); Aaron Hee-Hung Tan; Harvard University, Department of Architecture, Graduate School of Design; 1993. Access: print-only. Planned folder: secondary-scholarship-land-and-planning-1992-2026. Gives: Subjects: architecture, dwellings, city planning, history, description (contents not seen). Can hold drawings or photos of 1992-93. https://openlibrary.org/works/OL43859253W

#### Sets of low value that the triage did not collect

**depictions-fiction-art-games-1984-2025** (not collected: Later works set in the City. All items are low value: do not collect now.)
- 九龍寨城外 (Ouside Kowloon City); Yip Wing-wai (葉永蔚, b. 1932); Art Museum, The Chinese University of Hong Kong; 1962. https://artsandculture.google.com/asset/ouside-kowloon-city-yip-wing–wai-b-1932/FwGSOC9VNF5owQ
- 九龍城寨 (Kowloon Walled City); Flickr kongkaiming (石頭大師); 1983. https://www.flickr.com/photos/kongkaiming/2294735205/
- 東頭村道 (Year: 1988) and 城寨外 (Year: 1984); Flickr kongkaiming (石頭大師). The same photostream shows the 2007 arts award of 江啟明 ('2007 香港藝術成就奬 - 江啟明'), thus the sketches are probably his; the sketch pages do not name the artist; 1984; 1988. https://www.flickr.com/photos/kongkaiming/2295547486/
- The Bourne Supremacy (novel); Robert Ludlum; Random House; 1986. https://en.wikipedia.org/wiki/Kowloon_Walled_City
- 城寨風情 Tales of the Walled City, 1994-1996 (Rupert Chan Collection 陳鈞潤特藏, 2018-003); 陳鈞潤 Rupert Chan; HKUL Special Collections; 1994. https://archivesspace.lib.hku.hk/repositories/2/archival_objects/1590
- Idoru (and the Bridge trilogy): the virtual Walled City, Hak Nam; William Gibson; G. P. Putnam's Sons; 1996. https://en.wikipedia.org/wiki/Idoru
- Kowloon's Gate (クーロンズゲート); Sony Music Entertainment Japan (New Media Department), with Zeque; art direction 井上幸喜; 1997-02-28. https://en.wikipedia.org/wiki/Kowloon%27s_Gate
- クーロンズ・ゲート -九龍風水傳-; Sony Music Entertainment (Japan); director 木村央志; 1997-02-28. https://ja.wikipedia.org/wiki/%E3%82%AF%E3%83%BC%E3%83%AD%E3%83%B3%E3%82%BA%E3%82%B2%E3%83%BC%E3%83%88
- Shenmue II (the Kowloon chapters); Sega AM2; Yu Suzuki, director; 2001-09-06. https://en.wikipedia.org/wiki/Shenmue_II
- City of Darkness (九龍城寨), novel, and the comic of the same name; Yuyi, born 余詠良 (余兒), novel; Andy Seto (司徒劍僑), comic; 2008. https://zh.wikipedia.org/wiki/九龍城寨_(小說)
- Postmodern Orientalism: William Gibson, Cyberpunk and Japan; Leonard Patrick Sanders, PhD thesis in English, Massey University, Albany, New Zealand; 2008. https://mro.massey.ac.nz/server/api/core/bitstreams/24c5461c-de68-472a-acf1-845b3d9ce61a/content
- Warehouse Kawasaki (ウェアハウス川崎, 電脳九龍城砦); Geo Corporation (Anata no Warehouse); design by Hoshino-Gumi; 2009 (Kowloon interior) - 2019-11-17 (closed). https://en.wikipedia.org/wiki/Kawasaki_Warehouse
- Call of Duty: Black Ops (campaign scene in the Walled City; multiplayer map Kowloon); Treyarch; Activision; 2010-11-09. https://en.wikipedia.org/wiki/Call_of_Duty:_Black_Ops
- Lost Cities: Kowloon Walled City, the Faux and the Real; LC Douglass, blog HISTORIES OF THINGS TO COME; 2014-04-07. https://historiesofthingstocome.blogspot.com/2014/04/lost-cities-kowloon-walled-city-faux.html
- Shadowrun: Hong Kong; Harebrained Schemes; Mitch Gitelman and Mike McCain, directors; 2015-08. https://en.wikipedia.org/wiki/Shadowrun:_Hong_Kong
- “我宁可他们拆掉的是金字塔”：影像和真实历史中的九龙寨城; 熊雄, The Paper (澎湃新闻); 2017-10-19. https://www.thepaper.cn/newsDetail_forward_1829774
- Kowloon Generic Romance (九龍ジェネリックロマンス); Jun Mayuzuki; Shueisha (Weekly Young Jump); anime by Arvo Animation; film by Chihiro Ikeda; 2019-11. https://en.wikipedia.org/wiki/Kowloon_Generic_Romance
- Farewell to Warehouse Kawasaki: Japan's Cyber Kowloon Walled City; Johann C. K., Frontline JP (on the arcade by Geo Corporation, design by Hoshino-Gumi); 2019-11-13. https://frontlinejp.net/2019/11/13/farewell-to-warehouse-kawasaki-japans-cyber-kowloon-walled-city/
- 編集者は漫画家を助ける“壁”――『恋は雨上がりのように』作者が最新作『九龍ジェネリックロマンス』を作るまで（1/3）; 眉月じゅん and editor 大熊八甲, interviewed by 高橋史彦 and 福田瑠千代; ITmedia (ねとらぼ); 2020-02-19. https://nlab.itmedia.co.jp/cont/articles/3301029/
- Stray; BlueTwelve Studio; Annapurna Interactive; 2022-07-19. https://en.wikipedia.org/wiki/Stray_(video_game)
- 《九龍城寨之圍城》掀熱潮 盤點寨城取景經典港產片; 黃皓頤, Our China Story (ourchinastory.com); 2024-05-30. https://www.ourchinastory.com/zh/11750
- Slitterhead; Bokeh Game Studio; Keiichiro Toyama and Junya Okura, directors; 2024-11-08. https://en.wikipedia.org/wiki/Slitterhead
- Watch a Timelapse of the Notorious Kowloon Walled City Built to Scale in Minecraft; Kate Mothes, Colossal (about the builds of Sluda Builds); 2025-09-05. https://www.thisiscolossal.com/2025/09/sluda-builds-minecraft-kowloon-walled-city/
- Category:Works set in Kowloon Walled City; Wikipedia (English) editors; 2026-11-16. https://en.wikipedia.org/wiki/Category:Works_set_in_Kowloon_Walled_City
- Only Two Films Were Ever Shot Inside the Kowloon Walled City; historik.org (author not named); unknown. https://www.historik.org/post/only-two-films-were-ever-shot-inside-the-kowloon-walled-city

#### Blocked links of the source search of 2026-11

A script can not get these pages. Open each link in a browser, then decide what to download.

| Site | Items and why they matter | Block | Link |
|---|---|---|---|
| hkmj.org | Healers in the maze: unravelling the myths of Kowloon Walled City practitioners (medium; planned folder secondary-scholarship-history-law-society-1973-2026) | blocked-bot | https://www.hkmj.org/node/11992 |
| hub.hku.hk | Drilling on the edge: the unregistered dentists in post-war Kowloon Walled City (medium; planned folder secondary-scholarship-history-law-society-1973-2026) | blocked-bot | https://hub.hku.hk/handle/10722/366214 |
| scmp.com | When the death knell sounded for Kowloon Walled City (medium; planned folder secondary-press-and-web-features-1990-2026); Growing up next to prostitutes and drug addicts in Hong Kong's Walled City, recruitment pi (medium; planned folder pullinger-circle-1966-2026); Inside Kowloon Walled City: an artist offers a different perspective on life in the infamo (medium; planned folder retrospective-testimony-web); Christian missionary Jackie Pullinger's 50 years of helping Hong Kong addicts beat drugs – (medium; planned folder pullinger-circle-1966-2026); SCMP 58392: Walled City diehards win brief reprieve (headline from the URL slug) (medium; planned folder hk-english-press-1899-1994) | blocked-bot | https://www.scmp.com/magazines/post-magazine/short-reads/article/2127786/when-death-knell-sounded-kowloon-walled-city |
| ocula.com | Voices of the Walls (exhibition: Ian Lambot, Greg Girard, Bianca Tse, Keeping Lee) (medium; planned folder secondary-press-and-web-features-1990-2026) | blocked-bot | https://ocula.com/art-galleries/blue-lotus-gallery/exhibitions/voices-of-the-walls/ |
| journal.eahn.org | The Architectural History of the Kowloon Walled City (medium; planned folder secondary-scholarship-land-and-planning-1992-2026) | blocked-bot | https://journal.eahn.org/article/id/8292/ |
| doi.org | Temporary Ruins: Miyamoto Ryūji's Architectural Photography in Postmodern Japan (medium; planned folder secondary-press-and-web-features-1990-2026); 4 Precarious Security: From Walled City to Walled Garden (medium; planned folder secondary-scholarship-history-law-society-1973-2026) | blocked-bot | https://doi.org/10.7916/D83B7GKG |
| cbc.ca | Dark tower of dreams: Inside the Walled City of Kowloon (medium; planned folder secondary-documentaries-video-and-podcasts-1990-2026) | blocked-bot | https://www.cbc.ca/radio/ideas/dark-tower-of-dreams-inside-the-walled-city-of-kowloon-1.4359114 |
| bloomberg.com | Rare Maps Show Life in Hong Kong's Vice-Filled 'Walled City' (medium; planned folder secondary-press-and-web-features-1990-2026) | blocked-bot | https://www.bloomberg.com/news/articles/2014-11-05/rare-maps-show-life-in-hong-kong-s-vice-filled-walled-city |
| medium.com | 所謂的「黑暗之城」其實相當五彩繽紛：《大圖解九龍城》 (medium; planned folder daizukai-kowloon-1997) | blocked-bot | https://medium.com/topophiliastudio/%E6%89%80%E8%AC%82%E7%9A%84-%E9%BB%91%E6%9A%97%E4%B9%8B%E5%9F%8E-%E5%85%B6%E5%AF%A6%E7%9B%B8%E7%95%B6%E4%BA%94%E5%BD%A9%E7%B9%BD%E7%B4%9B-%E5%A4%A7%E5%9C%96%E8%A7%A3%E4%B9%9D%E9%BE%8D%E5%9F%8E-49f8549bf6d0 |

