# Primary sources

Primary sources about Kowloon Walled City (九龍城寨), with a focus on the
city at peak density, from about 1985 to the clearance in 1991–1993. The
model must use these sources for its facts.

A source is primary if it was made at the time, by a person or body that saw
the city or ran its clearance. Books and articles that tell the story later
are not primary. Do not put them here.

## Conventions

- One folder for each source.
- Each folder has a `SOURCE.md`: citation, URL, retrieval date, license, why
  the source is primary, the key facts with page numbers, and checksums.
- Open-licensed files go in the folder and git stores them.
- Copyrighted files go in `<folder>/local/`. Git ignores every `local/`
  folder (see `/.gitignore`). These files are on John's Mac only. The
  `SOURCE.md` gives the URL and the SHA-256, so you can get the same file again.
- Copies are byte-identical to what the host gives. Do not crop, convert or
  re-encode them. If a host gives only a derived file, say so in `SOURCE.md`.
- Before a commit, run `git status --ignored primary-sources` and make sure
  that no `local/` file is staged.

## Sources

| Folder | What | Dates | Files | In git | Link |
|---|---|---|---|---|---|
| [`commons-photos-1972-1993/`](commons-photos-1972-1993/SOURCE.md) | 11 original photos: Lambot, Jidanni, Roger Price, ken93110 | 1972–1993 | JPG + Commons metadata JSON | yes (CC BY / CC BY-SA) | https://commons.wikimedia.org/wiki/Category:Historical_images_of_Kowloon_Walled_City |
| [`legco-hansard-1986-1993/`](legco-hansard-1986-1993/SOURCE.md) | LegCo Hansard: 22 sittings that name the Walled City | Dec 1986 – Jul 1993 | PDF | no (LegCo copyright) | https://www.legco.gov.hk/yr86-87/english/lc_sitg/yr8687.htm |
| [`mplus-suenn-ho-ca17/`](mplus-suenn-ho-ca17/SOURCE.md) | M+ catalogue of Suenn Ho's field research: 11 video cassettes, 3 route maps on a detailed city plan, 1 video still | 1988–1992 | HTML + JPG | no (© Suenn Ho, M+) | https://www.mplus.org.hk/en/collection/archives/suenn-hos-kowloon-walled-city-research-archive-ca17/ |

## Leads not yet collected

Primary sources that I found but did not get. The reason is given for each.

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
- UK National Archives: FCO 40/2253 "Future of Hong Kong: Kowloon Walled
  City" (1987), FCO 40/2214 (1987), FCO 40/790 (1977, aircraft safety and
  building heights). The online copies on hkintexts.histsyn.com are behind a
  Cloudflare bot check, so I did not collect them. TNA Kew sells copies.
- UK House of Lords Hansard, 11 Jun 1974, "Walled City of Kowloon"
  (https://api.parliament.uk/historic-hansard/lords/1974/jun/11/walled-city-of-kowloon).
  It is open under the Open Parliament Licence, so git can store it. It is
  before the peak, but it gives lane widths, drains and wiring.
- The LegCo Finance Committee paper of 9 Dec 1987 and the 1993 Director of
  Audit report on the compensation.

**Photos, film and first-hand reports**
- *City of Darkness: Life in Kowloon Walled City* (Girard and Lambot, 1993):
  photos and resident interviews from 1987–1992. It is the strongest source
  for daily life. It is still in print as *City of Darkness Revisited*, so buy
  it. An archive.org copy exists, but it looks unauthorised, and I did not
  download it.
- M+ photo objects: Lambot 1989 aerial print (2013.143), Lambot 1991 "Shared
  staircase linking three buildings" (2017.411), Girard 1987 Tung Tau Tsuen
  Road facade (20184).
- RTHK documentary "Kowloon Walled City Stories" (1988). A copy is in M+ CA17/1/3.
- Gwulo media 22835: Suddaby photo, 1 Nov 1987, dentists' shops on Tung Tau
  Tsuen Road. License not yet checked.
- hkmemory.hk photos of the area, 1968 and 1982.
- More Roger Price photos from Sept 1991 on Flickr (CC BY 2.0).
- Gerald Posner's account of his 1987 visit with a police escort (posner.com,
  posted 2016). First-hand, but written later.

**Press, 1984–1993**
- UPI: "Walled City a Place of Myths and Crime" (18 Dec 1984) and "Kowloon's
  walled city to come tumbling down" (15 Feb 1987). upi.com returns 403 to
  scripts, so I did not collect them. Open them in a browser and save them by hand.
- LA Times, NYT, AP, Chicago Tribune, Guardian and Independent block this
  tool's crawler, so I did not search them. A library database
  (ProQuest, NewsBank) gives access.
- SCMP 1987–1993 reports. ProQuest Historical Newspapers has the SCMP archive.
