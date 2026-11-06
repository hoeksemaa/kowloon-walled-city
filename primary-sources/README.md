# Primary sources

Primary sources about Kowloon Walled City (九龍城寨), with a focus on the
city at peak density, from about 1985 to the clearance in 1991–1993. The
model must use these sources for its facts.

A source is primary if it was made at the time, by a person or body that saw
the city or ran its clearance. Use the usual meaning that historians give the
term. First-hand accounts given later (oral history, memoirs) also count, but
tag them "retrospective (year)". Books and articles that tell the story later
are not primary. Do not put them here.

## Conventions

- One folder for each source.
- Each folder has a `SOURCE.md`: citation, link, retrieval date, license, why
  the source is primary, the key facts with page numbers, and checksums.
- Each source has one main link in the table below.
- Open-licensed files go in the folder and git stores them.
- Copyrighted files go in `<folder>/local/`. Git ignores every `local/`
  folder (see `/.gitignore`). These files are on John's Mac only. The
  `SOURCE.md` gives the URL and the SHA-256, so you can get the same file again.
- Copies are byte-identical to what the host gives. Do not crop, convert or
  re-encode them. If a host gives only a derived file, say so in `SOURCE.md`.
- Before a commit, run `git status --ignored primary-sources` and make sure
  that no `local/` file is staged.
- If facts in `data/room_research.json` come from a source, its `SOURCE.md`
  ends with their ids (section "Room facts").

## Sources

| Folder | What | Dates | In git | Link |
|---|---|---|---|---|
| [`commons-photos-1972-1993/`](commons-photos-1972-1993/SOURCE.md) | 11 original photos: Lambot, Jidanni, Roger Price, ken93110 | 1972–1993 | yes (CC BY / CC BY-SA) | https://commons.wikimedia.org/wiki/Category:Historical_images_of_Kowloon_Walled_City |
| [`legco-hansard-1986-1993/`](legco-hansard-1986-1993/SOURCE.md) | LegCo (立法局) Hansard: 22 sittings that name the Walled City | Dec 1986 – Jul 1993 | no (LegCo copyright) | https://www.legco.gov.hk/yr86-87/english/lc_sitg/yr8687.htm |
| [`mplus-suenn-ho-ca17/`](mplus-suenn-ho-ca17/SOURCE.md) | M+ catalogue of Suenn Ho's (何巽) field research: 11 video cassettes, 3 route maps on a detailed city plan, 1 video still | 1988–1992 | no (© Suenn Ho, M+) | https://www.mplus.org.hk/en/collection/archives/suenn-hos-kowloon-walled-city-research-archive-ca17/ |
| [`mplus-girard-lambot-photos/`](mplus-girard-lambot-photos/SOURCE.md) | M+ photos by Girard and Lambot: south elevation, alleys, roofs, stairs, aerial | 1987–1991 | no (© Girard, © Lambot) | https://www.mplus.org.hk/en/collection/makers/ian-lambot/ |
| [`city-of-darkness-revisited/`](city-of-darkness-revisited/SOURCE.md) | Girard and Lambot's book (2014 edition), flat scans of John's copy. Primary parts: their photos, 32 interviews with residents and workers, the 1992 map, and 60 reproduced documents and old photos (1845–1994). The 2014 essays are secondary | about 1987–1992 (and 1845–1994) | no (© Girard, Lambot and others) | https://search.worldcat.org/search?q=bn:9781873200889 |
| [`uk-lords-hansard-1974/`](uk-lords-hansard-1974/SOURCE.md) | House of Lords debate: a first-hand account of lanes, drains, water, power | 11 Jun 1974 | yes (Open Parliament Licence) | https://api.parliament.uk/historic-hansard/lords/1974/jun/11/walled-city-of-kowloon |
| [`upi-reports-1984-1987/`](upi-reports-1984-1987/SOURCE.md) | UPI wire reports from Hong Kong (香港): Battenfeld (1984), Jones (1987) | 18 Dec 1984, 15 Feb 1987 | no (© UPI) | https://www.upi.com/Archives/1984/12/18/Walled-City-a-Place-of-Myths-and-Crime/5019472194000/ |
| [`gwulo-suddaby-1987/`](gwulo-suddaby-1987/SOURCE.md) | Andrew Suddaby's four street photos: north face on Tung Tau Tsuen Road (東頭村道), and the south side | 1 Nov 1987 | no (photographer's rights) | https://gwulo.com/photos/by-gallery?gallery=8687&page=1 |
| [`gwulo-other-photos/`](gwulo-other-photos/SOURCE.md) | Other Gwulo photos: David Brian's dentist's shop | about 1987/88 | no (photographer's rights) | https://gwulo.com/media/19655 |
| [`grs-catalogue-kwc/`](grs-catalogue-kwc/SOURCE.md) | GRS (政府檔案處) catalogue: 692 business compensation files with address, floor and trade; 87 clearance files; 274 search results | 1963–1997 | yes (catalogue only) | https://search.grs.gov.hk/en/search.xhtml?q=%22Kowloon+Walled+City%22 |
| [`hku-newspaper-clippings/`](hku-newspaper-clippings/SOURCE.md) | Index of 334 SCMP and *Hong Kong Standard* clippings (HKU (香港大學) login to read them) | 1969–1997 | yes (index only) | https://digitalrepository.lib.hku.hk/hkclippings?q=%22walled+city%22 |
| [`press-articles-1959-1992/`](press-articles-1959-1992/SOURCE.md) | Free press reports from inside the city: TIME (1959), *Baltimore Sun* (1992) | 7 Sep 1959, 30 Jun 1992 | no (© publishers) | https://www.baltimoresun.com/1992/06/30/denizens-of-noted-hellhole-face-walled-city-eviction/ |
| [`retrospective-testimony-web/`](retrospective-testimony-web/SOURCE.md) | Former residents, workers and visitors remember: fishball maker, childhoods, water and power, police, Jackie Pullinger, Girard and Lambot, a tailor next door, Posner's 1987 visit. Added 2026-11-05: Charles and 平哥 (明周), 袁家倫's 13/F flat, Albert Ng (吳錦波), the Heung family (SCMP 2013, from a copy), a 1970 baby clinic, 陳文龍 (search extracts only) | retrospective (2009–2024) | no (© publishers) | https://www.hk01.com/社區專題/1033066/ |
| [`hk01-kaifong-series-2016/`](hk01-kaifong-series-2016/SOURCE.md) | HK01 (香港01) series: five members of the residents' association on homes, water, power, fire, deeds and the survey day of 14 Jan 1987 | retrospective (2016) | no (© HK01) | https://www.hk01.com/article/39194 |
| [`wsj-kwc-2014/`](wsj-kwc-2014/SOURCE.md) | WSJ interactive: six residents and workers with address, floor, years, rent; more quotes; the Kai Fong Association (九龍城砦街坊福利事業促進委員會) trade count of 1983 | retrospective (2014) | no (© Dow Jones) | https://web.archive.org/web/20161228012123/http://projects.wsj.com/kwc/ |
| [`daizukai-kowloon-1997/`](daizukai-kowloon-1997/SOURCE.md) | 『大図解 九龍城』 (Iwanami (岩波書店) 1997): 24 room labels of its cutaway panorama, read on rioleo.org. The team's survey of the empty City is primary; the panorama is a reconstruction, thus every label is a guess | survey Jan–Feb 1993; book 1997 | no (© the artist, Iwanami Shoten) | https://www.rioleo.org/kowloon/ |

## Blocked: links for John to look at

I can not get these with a script. Open each link in a browser, then we
can decide what to download.

| Source | Why it matters | Block | Link |
|---|---|---|---|
| FCO 40/2253 "Future of Hong Kong: Kowloon Walled City" (1987) | UK file on the clearance decision | Cloudflare bot check | https://hkintexts.histsyn.com/series/histsyn-fco40-engine/items/TNAG-1637-FCO40-2253-Future-of-Hong-Kong-Kowloon-Walled-City-1987 |
| FCO 40/1511 "Compulsory acquisition of land in the Kowloon Walled City" (1982) | Land and buildings just before the peak | Cloudflare bot check | https://hkintexts.histsyn.com/series/histsyn-fco40-engine/items/TNAG-1208-FCO40-1511-Compulsory-acquisition-of-land-in-the-Kowloon-Walled-City-1982 |
| FCO 40/790 "Kowloon Walled City and aircraft safety" (1977) | Height limits; 6 standpipes for 27,000 people | Cloudflare bot check | https://hkintexts.histsyn.com/series/histsyn-fco40-engine/items/TNAG-0642-FCO40-790-Kowloon-Walled-City-and-aircraft-safety-in-Hong-Kong-1977 |
| FCO 40/980, same subject (1978) | Height limits | Cloudflare bot check | https://hkintexts.histsyn.com/series/histsyn-fco40-engine/items/TNAG-0776-FCO40-980-Kowloon-Walled-City-and-aircraft-safety-in-Hong-Kong-1978 |
| UK Hansard search for "Kowloon", 1980–1994 | Commons and Lords items on the clearance. A search for "walled city" finds York and Chester (checked 2026-10-29) | Cloudflare bot check | https://hansard.parliament.uk/search/Contributions?searchTerm=Kowloon&startDate=1980-01-01&endDate=1994-12-31 |
| The News Lens (關鍵評論網), articles 98485, 98486, 98591, 98607 | 陳文龍 writes about his childhood in the city: the family's homes on Lung Chun Road (龍津道), a café, a rice-roll factory, the youth centre. Facts Z8–Z10 rest on search extracts only (see `retrospective-testimony-web/`). A copy at https://crossing.cw.com.tw/article/18963 is also blocked | Cloudflare block (403), again on 2026-11-05 | https://www.thenewslens.com/article/98485 |
| Asia Society, "Life in Kowloon Walled City" | Interview with Albert Ng, a former resident (see `wsj-kwc-2014/`). No Wayback copy of this URL | Cloudflare bot check | https://asiasociety.org/node/17291 |
| Kai Tak (啓德) traffic figures, 1986–87, on hkintexts | Search extracts give 64,874 aircraft movements in 1986 and 73,643 in 1987 (Appendix 37), and a curfew "between midnight and 6.30 am" (undated). Not checked | Cloudflare bot check | https://hkintexts.histsyn.com/page/1731971 (also pages 1388492, 1392360, 965582) |
| Library of Congress, Paul Rudolph slide | Photo, 1960–1980 | "Publication may be restricted" | https://www.loc.gov/item/2010648314/ |
| Erich Tsang Shu-ming 曾樹明, "Community approach to youth work: working experience in Kowloon Walled City", MSW thesis, HKU, 1979 | A social worker's own account of his work in the city. DOI 10.5353/th_b3124685. Check for a full-text PDF | Cloudflare bot check | https://hub.hku.hk/handle/10722/35397 |
| *Journal of the Royal Asiatic Society Hong Kong Branch* 27 (1987), p. 70 | A 1987 reference list on the city. It cites Michael Chiang's HKU architecture thesis (below) | Cloudflare bot check | https://hkintexts.histsyn.com/series/histsyn-rashkb-journal-engine/items/RAS-1987?p=70 |
| Betty Ho Siu-fong, "Redevelopment of Kowloon City: A Feasibility Study", MSc Urban Planning thesis, HKU, 1986 | Figures of standpipes, drains, power and water pipes, 1981 census blocks, dentists. Find the HKU Scholars Hub handle | Cloudflare bot check | https://hub.hku.hk/simple-search?query=%22Redevelopment+of+Kowloon+City%22 |
| FCO 40/157 "Kowloon walled city and adjoining areas" (1970) | 1970 fire report: two heavy cables and "an overhead entanglement of wires" | Cloudflare bot check | https://hkintexts.histsyn.com/series/histsyn-fco40-engine/items/TNAG-0121-FCO40-157-Kowloon-walled-city-and-adjoining-areas-1970?p=37 |
| FCO 40/510 (1974) | The PWD (工務司署) plan C-180-NW-1 of Jan 1974 with 563 buildings | Cloudflare bot check | https://hkintexts.histsyn.com/series/histsyn-fco40-engine/items/TNAG-0445-FCO40-510-Discussions-with-Sir-Murray-MacLehose--Governor-of-Hong-Kong-1974?p=187 |
| HKU clippings (see `hku-newspaper-clippings/`) | 334 local reports, 1969–1997 | HKU login | https://digitalrepository.lib.hku.hk/hkclippings?q=%22walled+city%22 |
| Trove: *The Canberra Times*, 1970–1994 | Free scans of wire stories | Anubis bot check | https://trove.nla.gov.au/search/category/newspapers?keyword=%22walled%20city%22%20kowloon |
| HK Public Libraries (香港公共圖書館) old newspapers (華僑日報 to 1991) | Chinese-language reports of the survey and clearance. Search 九龍城寨 | queue-it waiting room | https://mmis.hkpl.gov.hk/old-hk-collection |
| NewspaperSG: *Straits Times*, 2 Jul 1992 and other issues | "Last of HK Walled City residents evicted" | page needs JavaScript | https://eresources.nlb.gov.sg/newspapers/digitised/issue/straitstimes19920702-1 |
| *Washington Post*, 22 Sep 1983 and 29 Nov 1991 | Reports from the city and from the first evictions | 403 to scripts | https://www.washingtonpost.com/archive/politics/1991/11/29/hong-kong-begins-effort-to-clear-walled-city-slum/8a714cb8-5413-4f46-bb9c-5d73e827d311/ |
| SCMP reports, 1993–94 | "Walled City protest ends" and others (article ids 16808, 54450, 58392, 27691, 52237, 23347). Wayback copies of SCMP pages work: `retrospective-testimony-web/` uses two | 403 to scripts | https://www.scmp.com/article/16808/walled-city-protest-ends |
| Hong Kong Heritage Project, oral history I200, LAW Hoi-cheung 羅開祥 (2008) | Lived in the city from 1952 to the clearance; kaifong secretary. Retrospective (2008). Also node 22246 (not checked) | 403 to scripts, again on 2026-11-05 | https://www.hongkongheritage.org/nodes/view/22115 |
| Patrick Zachmann, "Walled City of Hong Kong", *Granta* 29 | Photos and text from 1987–88 | 403 to scripts; Wayback offline (503) on 2026-11-05 | https://granta.com/walled-city-of-hong-kong |
| Plane-spotter photos at Kai Tak | Views of the roofs from the approach to runway 13 | bot gates (airliners.net, jetphotos) | https://www.airliners.net/photo-albums/view/Kai-Tak-Landings/16154 |
| Wayback copy of "Internet 九龍城砦" (1997) | Web exhibit of the Japanese team's February 1993 survey drawings (see `daizukai-kowloon-1997/`) | live site 404; Wayback 429, and 503 on 2026-11-05 | https://web.archive.org/web/1997/http://www.flex.co.jp/kowloon/ |

The LA Times, NYT, AP, Chicago Tribune, Guardian and Independent block this
tool's crawler. A library database (ProQuest, NewsBank) gives access to their
1984–1993 reports. ProQuest Historical Newspapers also has the SCMP archive.

## Other leads not yet collected

**Plans and surveys**
- The 1987 pre-clearance survey by the HK government, which counted residents,
  businesses, doctors and dentists. No copy online found yet.
- PWD plan C-180-N7-1 (Jan 1974), which showed 563 buildings. Known only from
  search extracts on hkintexts.histsyn.com.
- The base plan under the Suenn Ho route maps. Maker and date unknown.
- The plan on display in Kowloon Walled City Park (九龍寨城公園), which `data/plan.json` is
  traced from. Maker and date unknown. Not yet confirmed as primary. Check
  *City of Darkness Revisited* for its origin.
- HK Lands Department (地政總署) (Survey and Mapping Office (測繪處)) aerial photos of the 1980s.
  They are for sale at full resolution. The free Aerial Photo Flight Index
  gives each frame's date and position:
  https://data.gov.hk/en-data/dataset/hk-landsd-openmap-aerial-photo-flight-index
- Lands Department old survey sheets, free GeoTIFF open data. The city is on
  1:1000 sheet **11-NE-11A** (HK1980 Grid E 837500–838250, N 821000–821600)
  and 1:600 sheet **180-NW-1**. The 1:600 sheet number matches the 1974 PWD
  plan "C-180-NW-1". Get the 1980s–1990s editions from HKMS 2.0, series
  "1:1 000 (1960s - current)": https://www.hkmapservice.gov.hk/OneStopSystem/map-search?product=OSSCatB&series=AB
- Lands Department Digital Orthophoto DOP1000-1982 (and 1976, 1963), on HKMS
  2.0 under "Aerial Photo And Image Product". Check the price and the license.
- USGS declassified KH-9 satellite images, 1971–84, public domain. Search
  EarthExplorer at 22.3321 N, 114.1903 E.
- GRS Search Room files (see `grs-catalogue-kwc/`): HKRS2298-1-171 floor
  areas of structures (1990–93), HKRS2704-1-1 lots (1987–91), HKRS1078-1-50
  water supply (1987–92). Physical only, in Kwun Tong (觀塘).
- Pascale Liotard, "Kowloon Walled City: A unique phenomenon comes to an end",
  *PACE Interior Architecture* 39 (1992), 55–62, with maps and plans. At the
  CUHK (香港中文大學) Architecture Library. https://hkapi.lib.cuhk.edu.hk/handle/msO8s77aBT/6111
- Chan Cheung Chuen's (陳祥全) own map of the streets and upper walkways, drawn before
  the demolition (see `retrospective-testimony-web/`). WSJ says he finished it
  in March 1987, after four months (see `wsj-kwc-2014/`). Ask M+.
- HK Yellow Pages 1980s–1992 and the 1981 and 1986 census street-block tables:
  business addresses and households by block. Physical, at HK libraries.
- 『大図解 九龍城』 (Iwanami Shoten, 1997), drawings by 寺澤一美 Terasawa Hitomi:
  see `daizukai-kowloon-1997/`. The web shows only panorama pages 5–6 and
  11–12. The rest of the book, with the room plans of the team's survey, is
  print only. One review says the team's photos show interiors that were
  almost empty, thus after the clearance. Buy a used copy.
  https://www.kinokuniya.co.jp/f/dsg-01-9784000080705
- Michael Chiang, "The Development of the Kowloon Walled City", student
  thesis, HKU School of Architecture, 1979–80. Known only from the JRASHKB
  1987 reference list. No copy online found yet.

**Government files**
- FCO 40/2214 (1987, LegCo Hansards). No link found yet.
- The LegCo Finance Committee (財務委員會) paper of 9 Dec 1987 and the 1993 Director of
  Audit (核數署署長) report on the compensation.

**Photos, film and first-hand reports**
- *City of Darkness: Life in Kowloon Walled City* (Girard and Lambot, 1993):
  photos and resident interviews from 1987–1992. It is the strongest source
  for daily life. It is still in print as *City of Darkness Revisited*, so buy
  it. An archive.org copy exists, but it looks unauthorised, and I did not
  download it.
- Full-size scans of the M+ route maps (CA17/2/1–3) and the M+ photos. Ask M+.
- RTHK (香港電台) documentary "Kowloon Walled City Stories" (九龍城寨的故事) (1988). A copy is in M+ CA17/1/3.
- hkmemory.hk photos of the area, 1968 and 1982.
- Ryuji Miyamoto 宮本隆司, photos of 1987, some from a helicopter. Book
  『九龍城砦』 (Atelier Peyotl (ペヨトル工房), 1988; Heibonsha (平凡社), 1997, ISBN 4582277365).
  https://en.wikipedia.org/wiki/Ry%C5%ABji_Miyamoto
- "Hong Kong's Secret City" (1988, 45 min), Hawke Productions and ORF, with
  Hugo Portisch. Footage from inside the city. No copy found yet.
  https://www.themoviedb.org/movie/416270
- "The Law of Love: The Jackie Pullinger Story" (Channel 4, 1989, dir. Paul
  Lee). Footage from 1989. No copy found yet.
- Jackie Pullinger, *Crack in the Wall: Life and Death in Kowloon Walled
  City* (Hodder & Stoughton, 1989). A memoir of her work in the city from 1966.
- SCMP photo archive. The SCMP gallery "Hong Kong's Kowloon Walled City, from
  the 1970s to demolition" has staff photos. Find the dates and photographers.
- HKU Image Database: "Aerial view of Kowloon City", 1982, three wide scans
  (about 2760×930), and Heather Coulson's photos, about 1986 (about
  3750×2950). Open access, no license stated. Records `bc386k99q`,
  `rv042v600`, `ff3657144`, `xw42tt421`, `66833n60r` at
  https://digitalrepository.lib.hku.hk/catalog/
- Rob Frost, "Kowloon Walled City, Hong Kong. 1990", his own 5-minute video of
  a walk inside: https://www.youtube.com/watch?v=TmqlxjTSc8w
- German-language TV documentary, 1988/89, 4 parts, unofficial uploads (can be
  "Hong Kong's Secret City"): https://www.youtube.com/watch?v=Lby9P3ms11w
- Films shot at the city: Bloodsport (1987), Shadow of China (1989),
  Yellowthread Street (1990), Baraka (1992, 65 mm, the south face), Crime
  Story (重案組) (1992, in the empty city). Scene notes:
  https://hkmacaufilmtvlocations.blogspot.com/search/label/Kowloon%20Walled%20City
- Whicker's Orient (1972, Alan Whicker), with Gladys Donnithorne.
- PolyU (香港理工大學) Library: Patrick Fong, 27 colour slides of the city, 1988, call no.
  DS796.H76 K68. https://dc.lib.polyu.edu.hk/concern/works/mg74qq83k
- Fiona Hawthorne, *Drawing on the Inside: Kowloon Walled City 1985*
  (Blacksmith Books, 2021): drawings made on site in 1985.
- Paid photo archives: Nik Wheeler 1979/80 roofs (Getty 1219604119), Robert
  Ng / SCMP demolition 23 Mar 1993 (Getty 1126363008), Patrick Zachmann 1987
  (Magnum).
- The six WSJ resident videos of 2014 (52–92 s each). Transcribe them. Links
  are in `wsj-kwc-2014/`.
- Rod A. L. Mason, Hong Kong Police, a report on the city of 1985, made at the
  time. WSJ quotes it (see `wsj-kwc-2014/`). Find the report.
- The Kai Fong Association count of shops, factories and clinics, 1983. WSJ
  charts it (645 in all, 97 dentists). Ask the former residents' association
  (九龍城寨街坊福利事業延續促進會) for the original.
- Gerald Posner, *Warlords of Crime* (1988), chapter 10, "White Powder Ma". A
  visit of 1987 with a police escort. Only an extract is collected.
- SCMP, 23 Mar 2018, "How the dark legacy of the Kowloon Walled City lives on
  in modern-day Hong Kong" (article 2138468). Not yet read. Try a Wayback
  copy. The text of SCMP 2013, article 1191748, is in a copy on The Travel
  Club (see `retrospective-testimony-web/`). The SCMP page itself is blocked.
- 李昇敏 "敏叔", a former resident who guides visitors in Kowloon Walled City
  Park (named in HK01, 20 Jul 2024). A possible new interview.
- 中華書局, 《九龍寨城》 (2026), sample PDF with chapters on Kai Tak and on
  community networks. It cites 《城寨福利會訊》 of Feb 1987 and a 1978 Urban
  Services Department (市政事務署) document. Not yet checked for testimony:
  https://www.chunghwabook.com.hk/upload/files/2026/07_09/8961d31fc1bbfcc1dbd8f8cb3e13d50a.pdf

**Secondary works with useful references**
- Lai, Chua and Chua, "The History of Planning for Kowloon City", *Planning
  Perspectives* 33:1 (2018), 97–112. Read its references for government
  planning records. https://doi.org/10.1080/02665433.2017.1331751

## Leads from the room research (2026-11-05)

The two sweeps of the room research (2026-11-04 and 2026-11-05) did not get
these sources: each one is blocked, print only or offline. `data/room_research.json` (`leads`) gives the full notes.
This list does not repeat the leads in the tables above (Granta 29, The News
Lens, the Hong Kong Heritage Project, flex.co.jp).

**Blocked on the web**
- Magnum, Patrick Zachmann's 1987 photos, with captions such as "Atelier de tissage": 403. https://pro.magnumphotos.com/Package/2TYRYD1A3SGY
- SCMP 1191748 (2013), the original of the Heung Yin-king testimony: Cloudflare; Wayback offline. https://www.scmp.com/news/hong-kong/article/1191748/kowloon-walled-city-life-city-darkness
- SCMP 2127786 ("When the death knell sounded for Kowloon Walled City"), 355483 ("Shady deals colour walled city's past"), 617754 ("Hallowed halls and tainted walls", a school beside the City) and 296184: Cloudflare. Search the ids on scmp.com.
- WSJ interactive, "life" chapter: the captions of Suenn Ho's clips ("Visit a factory", "Candy factory", "Look at a well"). Wayback 503. https://web.archive.org/web/2016id_/http://projects.wsj.com/kwc/getData.php?f=grabChapter&chapter=life
- cityofdarkness.co.uk, old posts (?p=560 "A Clinic for Heroin", ?p=1228 "A Policeman's Story", ?p=791 "Government Interventions", and others): 404; Wayback offline. Probably the book's interviews.
- Blue Lotus Gallery, Girard's photo titles ("Cafe, Tung Tau Tsuen Road, 1989", "Dentist's Window, 1989", "Barbecued Meat Factory"): pages 404 or built by JavaScript. https://bluelotus-gallery.com/greg-girard-1/city-of-darkness
- *Tatler Hong Kong*, Oct 2019, "If these walls could talk", with Girard and Lambot: 403. https://www.pressreader.com/china/tatler-hong-kong/20191001/283738430946918
- Blacksmith Books, 2021, Fiona Hawthorne on her drawings of the City: 403. https://blacksmithbooks.com/2021/08/an-artist-reveals-what-life-was-like-inside-the-legendary-walled-city-of-kowloon
- Gale Primary Sources (Colonial Office papers, newspapers), shown at a CUHK workshop on 16 Jan 2025: login only. https://www.lib.cuhk.edu.hk/tc/about/events/ls-workshop-20250116-kowloon-walled-city/
- M+ collection: no keyword search, and Ryuji Miyamoto's 9 objects have generic titles only. The guide https://mplus.libguides.com/kowloon-walled-city is 404.
- A Japanese post on the City: it redirects to a Hatena login. https://reibun.hateblo.jp/entry/2019/07/19/232614
- 立場新聞 and 蘋果日報 retrospectives: both sites are closed, and the Internet Archive was offline (503) on 2026-11-05.

**Print, archives and photo collections**
- 《城寨福利會訊》, the Kai Fong newsletter, Feb 1987: primary. Not found online. 中華書局 (2026) cites it.
- *City of Darkness* (1993), pp172 and 178: photos of the Tung Tau Tsuen Road facade with about 22 named signs (Z22–Z38). The photos can give the floors. A blog of 2005 (secondary) lists the names: https://lichokiu.blogspot.com/2005/09/blog-post_112754459002873396.html
- 『九龍城探訪 完全版』 (2026), the Japanese edition of *City of Darkness Revisited*, ed. 吉田一郎: new maps and resident interviews. Print only.
- Jackie Pullinger, *Chasing the Dragon* (1980): her youth club and the school where she taught. No free text found; archive.org was offline.
- UK National Archives CO 1030/394 (police report, Mar 1953) and CO 1030/934 (Savingram, 11 Mar 1955): the Lung Kung theatre, the 16 strip-tease theatres, dog-meat shops and divans of 1952–55. Lambot quotes them (CoDR p273). Not found online.
- GRS HKRS1078-1-53, "Hsin On Centre of the Hong Kong and Macau Lutheran Church" (1987–1992): can give the address of the chapel on CoDR p252. Not digitised. https://search.grs.gov.hk/en/arcview.xhtml?eid=Kt4AVzZhTddf1jxuRF2XuQ%3D%3D
- *Sing Pao Daily News* (成報) photo archive, 1987–94 (CoDR pp337–347): street photos with readable shop and clinic signs. Not online.
- Ko Tim Keung's (高添強) photo collection (Tung Tau Tsuen Road, 1962–72): larger prints can show more signs. Not online.
- HK Government Information Services (政府新聞處) photo library: the 1975 photo of the 14-storey building on Tung Tau Tsuen Road (CoDR p336). A large copy can show the building and more signs.
- SCMP, 1993, on the landlord Chang Kat Kong (HK$34.6m for about 100 flats; an air-conditioner repair shop), quoted in CoDR p344. Paywall.
- Suenn Ho, 1992 Fulbright study (M+ CA17): the full drawings of "factories and other non-residential units by level" and the plan of each level. CoDR shows only small copies.
- Survey and Mapping Office map of 1968: a full-size copy gives every lot number and label. The copy in CoDR (pp126–127) is small.
- Girard and Lambot's negatives or the M+ prints: the address lines on the clinic signs of CoDR p8 are too small in the book.
- Fiona Hawthorne's 1986 sketches: CoDR (p210) shows two of "dozens".
- *City of Darkness Revisited* pp84–85: missing from the scan.
- Hong Kong Yearbook 1970 (1970 年香港年鑑): addresses of dentists, for example 黃景志 at 25 Tung Tau Tsuen Rd. A Gwulo caption cites it (W1). https://gwulo.com/media/44692

**Secondary works (leads only, not sources)**
- 喬健等 (1992), pp1020–1034: a study of the residents, with the Kai Fong survey of 745 premises (1983). Print only.
- 魯金《九龍城寨史話》(1988), pp104–133: the places street by street, for example the big well at 8 Tai Chang St (大井街). Print only.
- Stephen CP Wu, "Healers in the maze", *Hong Kong Medical Journal* 2026: a survey of 72 unregistered doctors. Cloudflare. https://www.hkmj.org/node/11992 (PDF: https://www.hkmj.org/system/files/hkmj-SA202606.pdf)
- Wu Chun Pong (胡震邦), "Drilling on the edge: the unregistered dentists in post-war Kowloon Walled City", HKU MA thesis, 2025: 403. https://hub.hku.hk/handle/10722/366214
- "Kowloon Walled City Revisited: Photography and Postcoloniality", University of Michigan, with Girard's photo titles: 403. https://quod.lib.umich.edu/t/tap/7977573.0006.202
- University of Waterloo study of the links between buildings (Tramontini, Dalla-Ali, Dai, Glebe; a Vimeo talk), in CoDR pp121 and 140. No link found.
