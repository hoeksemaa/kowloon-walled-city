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

## Sources

| Folder | What | Dates | In git | Link |
|---|---|---|---|---|
| [`commons-photos-1972-1993/`](commons-photos-1972-1993/SOURCE.md) | 11 original photos: Lambot, Jidanni, Roger Price, ken93110 | 1972–1993 | yes (CC BY / CC BY-SA) | https://commons.wikimedia.org/wiki/Category:Historical_images_of_Kowloon_Walled_City |
| [`legco-hansard-1986-1993/`](legco-hansard-1986-1993/SOURCE.md) | LegCo Hansard: 22 sittings that name the Walled City | Dec 1986 – Jul 1993 | no (LegCo copyright) | https://www.legco.gov.hk/yr86-87/english/lc_sitg/yr8687.htm |
| [`mplus-suenn-ho-ca17/`](mplus-suenn-ho-ca17/SOURCE.md) | M+ catalogue of Suenn Ho's field research: 11 video cassettes, 3 route maps on a detailed city plan, 1 video still | 1988–1992 | no (© Suenn Ho, M+) | https://www.mplus.org.hk/en/collection/archives/suenn-hos-kowloon-walled-city-research-archive-ca17/ |
| [`mplus-girard-lambot-photos/`](mplus-girard-lambot-photos/SOURCE.md) | M+ photos by Girard and Lambot: south elevation, alleys, roofs, stairs, aerial | 1987–1991 | no (© Girard, © Lambot) | https://www.mplus.org.hk/en/collection/makers/ian-lambot/ |
| [`uk-lords-hansard-1974/`](uk-lords-hansard-1974/SOURCE.md) | House of Lords debate: a first-hand account of lanes, drains, water, power | 11 Jun 1974 | yes (Open Parliament Licence) | https://api.parliament.uk/historic-hansard/lords/1974/jun/11/walled-city-of-kowloon |
| [`upi-reports-1984-1987/`](upi-reports-1984-1987/SOURCE.md) | UPI wire reports from Hong Kong: Battenfeld (1984), Jones (1987) | 18 Dec 1984, 15 Feb 1987 | no (© UPI) | https://www.upi.com/Archives/1984/12/18/Walled-City-a-Place-of-Myths-and-Crime/5019472194000/ |
| [`gwulo-suddaby-1987/`](gwulo-suddaby-1987/SOURCE.md) | Andrew Suddaby's four street photos: north face on Tung Tau Tsuen Road, and the south side | 1 Nov 1987 | no (photographer's rights) | https://gwulo.com/photos/by-gallery?gallery=8687&page=1 |
| [`gwulo-other-photos/`](gwulo-other-photos/SOURCE.md) | Other Gwulo photos: David Brian's dentist's shop | about 1987/88 | no (photographer's rights) | https://gwulo.com/media/19655 |
| [`grs-catalogue-kwc/`](grs-catalogue-kwc/SOURCE.md) | GRS catalogue: 692 business compensation files with address, floor and trade; 87 clearance files; 274 search results | 1963–1997 | yes (catalogue only) | https://search.grs.gov.hk/en/search.xhtml?q=%22Kowloon+Walled+City%22 |
| [`hku-newspaper-clippings/`](hku-newspaper-clippings/SOURCE.md) | Index of 334 SCMP and *Hong Kong Standard* clippings (HKU login to read them) | 1969–1997 | yes (index only) | https://digitalrepository.lib.hku.hk/hkclippings?q=%22walled+city%22 |
| [`press-articles-1959-1992/`](press-articles-1959-1992/SOURCE.md) | Free press reports from inside the city: TIME (1959), *Baltimore Sun* (1992) | 7 Sep 1959, 30 Jun 1992 | no (© publishers) | https://www.baltimoresun.com/1992/06/30/denizens-of-noted-hellhole-face-walled-city-eviction/ |
| [`retrospective-testimony-web/`](retrospective-testimony-web/SOURCE.md) | Former residents and an official remember: fishball maker, a childhood, water and power, squatter control | retrospective (2009–2024) | no (© publishers) | https://www.hk01.com/社區專題/1033066/ |

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
| WSJ 2014 project, Wayback copies | Clips of the Suenn Ho footage | Wayback was offline (503) on 2026-10-29; try again | https://web.archive.org/web/2016/http://projects.wsj.com/kwc/ |
| Library of Congress, Paul Rudolph slide | Photo, 1960–1980 | "Publication may be restricted" | https://www.loc.gov/item/2010648314/ |
| Erich Tsang Shu-ming 曾樹明, "Community approach to youth work: working experience in Kowloon Walled City", MSW thesis, HKU, 1979 | A social worker's own account of his work in the city. DOI 10.5353/th_b3124685. Check for a full-text PDF | Cloudflare bot check | https://hub.hku.hk/handle/10722/35397 |
| *Journal of the Royal Asiatic Society Hong Kong Branch* 27 (1987), p. 70 | A 1987 reference list on the city. It cites Michael Chiang's HKU architecture thesis (below) | Cloudflare bot check | https://hkintexts.histsyn.com/series/histsyn-rashkb-journal-engine/items/RAS-1987?p=70 |
| Betty Ho Siu-fong, "Redevelopment of Kowloon City: A Feasibility Study", MSc Urban Planning thesis, HKU, 1986 | Figures of standpipes, drains, power and water pipes, 1981 census blocks, dentists. Find the HKU Scholars Hub handle | Cloudflare bot check | https://hub.hku.hk/simple-search?query=%22Redevelopment+of+Kowloon+City%22 |
| FCO 40/157 "Kowloon walled city and adjoining areas" (1970) | 1970 fire report: two heavy cables and "an overhead entanglement of wires" | Cloudflare bot check | https://hkintexts.histsyn.com/series/histsyn-fco40-engine/items/TNAG-0121-FCO40-157-Kowloon-walled-city-and-adjoining-areas-1970?p=37 |
| FCO 40/510 (1974) | The PWD plan C-180-NW-1 of Jan 1974 with 563 buildings | Cloudflare bot check | https://hkintexts.histsyn.com/series/histsyn-fco40-engine/items/TNAG-0445-FCO40-510-Discussions-with-Sir-Murray-MacLehose--Governor-of-Hong-Kong-1974?p=187 |
| HKU clippings (see `hku-newspaper-clippings/`) | 334 local reports, 1969–1997 | HKU login | https://digitalrepository.lib.hku.hk/hkclippings?q=%22walled+city%22 |
| Trove: *The Canberra Times*, 1970–1994 | Free scans of wire stories | Anubis bot check | https://trove.nla.gov.au/search/category/newspapers?keyword=%22walled%20city%22%20kowloon |
| HK Public Libraries old newspapers (華僑日報 to 1991) | Chinese-language reports of the survey and clearance. Search 九龍城寨 | queue-it waiting room | https://mmis.hkpl.gov.hk/old-hk-collection |
| NewspaperSG: *Straits Times*, 2 Jul 1992 and other issues | "Last of HK Walled City residents evicted" | page needs JavaScript | https://eresources.nlb.gov.sg/newspapers/digitised/issue/straitstimes19920702-1 |
| *Washington Post*, 22 Sep 1983 and 29 Nov 1991 | Reports from the city and from the first evictions | 403 to scripts | https://www.washingtonpost.com/archive/politics/1991/11/29/hong-kong-begins-effort-to-clear-walled-city-slum/8a714cb8-5413-4f46-bb9c-5d73e827d311/ |
| SCMP reports, 1993–94 | "Walled City protest ends" and others (article ids 16808, 54450, 58392, 27691, 52237, 23347) | 403 to scripts | https://www.scmp.com/article/16808/walled-city-protest-ends |
| Hong Kong Heritage Project, oral history I200, LAW Hoi-cheung 羅開祥 (2008) | Lived in the city from 1952 to the clearance; kaifong secretary. Retrospective (2008) | 403 to scripts | https://www.hongkongheritage.org/nodes/view/22115 |
| Patrick Zachmann, "Walled City of Hong Kong", *Granta* 29 | Photos and text from 1987–88 | 403 to scripts | https://granta.com/walled-city-of-hong-kong |
| Plane-spotter photos at Kai Tak | Views of the roofs from the approach to runway 13 | bot gates (airliners.net, jetphotos) | https://www.airliners.net/photo-albums/view/Kai-Tak-Landings/16154 |
| Wayback copy of "Internet 九龍城砦" (1997) | Web exhibit of the Japanese team's February 1993 survey drawings | Wayback 429 | https://web.archive.org/web/1997/http://www.flex.co.jp/kowloon/ |

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
- The plan on display in Kowloon Walled City Park, which `data/plan.json` is
  traced from. Maker and date unknown. Not yet confirmed as primary. Check
  *City of Darkness Revisited* for its origin.
- HK Lands Department (Survey and Mapping Office) aerial photos of the 1980s.
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
  water supply (1987–92). Physical only, in Kwun Tong.
- Pascale Liotard, "Kowloon Walled City: A unique phenomenon comes to an end",
  *PACE Interior Architecture* 39 (1992), 55–62, with maps and plans. At the
  CUHK Architecture Library. https://hkapi.lib.cuhk.edu.hk/handle/msO8s77aBT/6111
- Chan Cheung Chuen's own map of the streets and upper walkways, drawn before
  the demolition (see `retrospective-testimony-web/`). Ask M+.
- HK Yellow Pages 1980s–1992 and the 1981 and 1986 census street-block tables:
  business addresses and households by block. Physical, at HK libraries.
- Terasawa Kazumi 寺澤一美 (drawings) and Kani Hiroaki 可児弘明 (editor),
  『大図解 九龍城』 (Iwanami Shoten, 10 Jul 1997, ISBN 9784000080705). It is the
  large cutaway panorama of the city. A Japanese team (九龍城探検隊) surveyed
  the city before the demolition. The drawing is a reconstruction, so it is
  primary only for what the team recorded. One review says the team's photos
  show interiors that were almost empty, thus after the clearance. Buy a used
  copy. https://www.kinokuniya.co.jp/f/dsg-01-9784000080705
- Michael Chiang, "The Development of the Kowloon Walled City", student
  thesis, HKU School of Architecture, 1979–80. Known only from the JRASHKB
  1987 reference list. No copy online found yet.

**Government files**
- FCO 40/2214 (1987, LegCo Hansards). No link found yet.
- The LegCo Finance Committee paper of 9 Dec 1987 and the 1993 Director of
  Audit report on the compensation.

**Photos, film and first-hand reports**
- *City of Darkness: Life in Kowloon Walled City* (Girard and Lambot, 1993):
  photos and resident interviews from 1987–1992. It is the strongest source
  for daily life. It is still in print as *City of Darkness Revisited*, so buy
  it. An archive.org copy exists, but it looks unauthorised, and I did not
  download it.
- Full-size scans of the M+ route maps (CA17/2/1–3) and the M+ photos. Ask M+.
- RTHK documentary "Kowloon Walled City Stories" (1988). A copy is in M+ CA17/1/3.
- hkmemory.hk photos of the area, 1968 and 1982.
- Ryuji Miyamoto 宮本隆司, photos of 1987, some from a helicopter. Book
  『九龍城砦』 (Atelier Peyotl, 1988; Heibonsha, 1997, ISBN 4582277365).
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
  Story (1992, in the empty city). Scene notes:
  https://hkmacaufilmtvlocations.blogspot.com/search/label/Kowloon%20Walled%20City
- Whicker's Orient (1972, Alan Whicker), with Gladys Donnithorne.
- PolyU Library: Patrick Fong, 27 colour slides of the city, 1988, call no.
  DS796.H76 K68. https://dc.lib.polyu.edu.hk/concern/works/mg74qq83k
- Fiona Hawthorne, *Drawing on the Inside: Kowloon Walled City 1985*
  (Blacksmith Books, 2021): drawings made on site in 1985.
- Paid photo archives: Nik Wheeler 1979/80 roofs (Getty 1219604119), Robert
  Ng / SCMP demolition 23 Mar 1993 (Getty 1126363008), Patrick Zachmann 1987
  (Magnum).
- Gerald Posner's account of his 1987 visit with a police escort
  (https://posner.com/geraldposner/2016/05/tbt-reminder-of-my-1987-police-escort.html).
  First-hand, but written in 2016.

**Secondary works with useful references**
- Lai, Chua and Chua, "The History of Planning for Kowloon City", *Planning
  Perspectives* 33:1 (2018), 97–112. Read its references for government
  planning records. https://doi.org/10.1080/02665433.2017.1331751
