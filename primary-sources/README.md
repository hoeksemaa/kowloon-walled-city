# Primary sources

Primary sources about Kowloon Walled City (九龍城寨), with a focus on the
city at peak density, from about 1985 to the clearance in 1991–1993. The
model must use these sources for its facts.

A source is primary if it was made at the time, by a person or body that saw
the city or ran its clearance. Books and articles that tell the story later
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

## Blocked: links for John to look at

I can not get these with a script. Open each link in a browser, then we
can decide what to download.

| Source | Why it matters | Block | Link |
|---|---|---|---|
| FCO 40/2253 "Future of Hong Kong: Kowloon Walled City" (1987) | UK file on the clearance decision | Cloudflare bot check | https://hkintexts.histsyn.com/series/histsyn-fco40-engine/items/TNAG-1637-FCO40-2253-Future-of-Hong-Kong-Kowloon-Walled-City-1987 |
| FCO 40/1511 "Compulsory acquisition of land in the Kowloon Walled City" (1982) | Land and buildings just before the peak | Cloudflare bot check | https://hkintexts.histsyn.com/series/histsyn-fco40-engine/items/TNAG-1208-FCO40-1511-Compulsory-acquisition-of-land-in-the-Kowloon-Walled-City-1982 |
| FCO 40/790 "Kowloon Walled City and aircraft safety" (1977) | Height limits; 6 standpipes for 27,000 people | Cloudflare bot check | https://hkintexts.histsyn.com/series/histsyn-fco40-engine/items/TNAG-0642-FCO40-790-Kowloon-Walled-City-and-aircraft-safety-in-Hong-Kong-1977 |
| FCO 40/980, same subject (1978) | Height limits | Cloudflare bot check | https://hkintexts.histsyn.com/series/histsyn-fco40-engine/items/TNAG-0776-FCO40-980-Kowloon-Walled-City-and-aircraft-safety-in-Hong-Kong-1978 |
| UK Hansard search, 1980–1994 | Commons and Lords items on the clearance | Cloudflare bot check | https://hansard.parliament.uk/search/Contributions?searchTerm=%22walled%20city%22&startDate=1980-01-01&endDate=1994-12-31 |
| WSJ 2014 project, Wayback copies | Clips of the Suenn Ho footage | Wayback was offline (503) on 2026-10-29; try again | https://web.archive.org/web/2016/http://projects.wsj.com/kwc/ |
| Library of Congress, Paul Rudolph slide | Photo, 1960–1980 | "Publication may be restricted" | https://www.loc.gov/item/2010648314/ |

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
  They are for sale at full resolution.

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
- Gerald Posner's account of his 1987 visit with a police escort
  (https://posner.com/geraldposner/2016/05/tbt-reminder-of-my-1987-police-escort.html).
  First-hand, but written in 2016.
