# M+ CA17: Suenn Ho's Kowloon Walled City Research Archive (1988–1992)

Field research by the architect Suenn Ho (何巽), inside the city during the
last years before the clearance. The archive has 12 VHS cassettes (11 are
listed online) and 3 route maps. Suenn Ho gave it to M+, Hong Kong (香港), in 2015.

- **Holder:** M+, Hong Kong. Object number CA17.
- **Record:** https://www.mplus.org.hk/en/collection/archives/suenn-hos-kowloon-walled-city-research-archive-ca17/
- **Retrieved:** 2026-10-29.
- **Credit line:** "M+, Hong Kong. Gift of Suenn Ho, 2015". Copyright: "© Suenn Ho".
  The fonds page says "© All Rights Reserved. Courtesy of Suenn Ho".
- **Stored in git:** no. The catalogue pages and images are in `local/`, which git ignores.
- **Access to the originals:** "Available to view by appointment at the M+ Research Centre".

## Why this is primary

Suenn Ho made the videos and drew the routes on site. The catalogue dates
her own footage and maps from Oct 1991 to 3 Mar 1992. Cassette CA17/1/6
also has footage by Po-Chih Leong (梁普智) of Nov 1989.
The cassettes have dated footage of the alleys, the shops and the roofs,
and interviews with residents and shopkeepers. The M+ pages are only the
catalogue.

The M+ fonds description dates her research "between 1989 and 1992" (the old
text of this file said "from 1989 to 1992"). That description is secondary:
see [`../../secondary-sources/mplus-suenn-ho-ca17/SOURCE.md`](../../secondary-sources/mplus-suenn-ho-ca17/SOURCE.md).

## What is in `local/`

- `CA17*.html`: the raw M+ catalogue page for each record (16 pages).
- `CA17-1-1_011813_001.jpg`: a video still from cassette 1. The camera
  timestamp is "13:57 20.11.91". It shows an alley beside a lit shop. 1000×625.
- `CA17-2-1_011826_003.jpg`, `CA17-2-2_011827_003.jpg`, `CA17-2-3_011828_003.jpg`:
  the three route maps, about 1000×720 each. This is the largest size that M+
  stores online. I took the untransformed URL, not an upscale.

I deleted the fonds-page image. It is a recent photo of Suenn Ho at work, not
a record of the city.

## The route maps: high value for the model

Each map is a photocopy of a detailed plan of the whole city, with Suenn Ho's
routes drawn on it in colour. The base plan shows:

- the building name (樓 names) and house numbers on most plots,
- marks that look like entrances (triangles) and points on the lanes,
- Tung Tau Tsuen Road (東頭村道) along the top edge,
- "Tung Tsing Road Sitting Out Area" at the right.

This base plan has more detail than the exhibit plan that `data/plan.json`
comes from. The maker and date of the base plan are not given. At 1000 px,
many labels are hard to read. A scan at full size from M+ will make them clear.

### The house numbers (2026-11-05)

`data/address_anchors.json` has the labels read from the 1000 px images
(numbers only, no image), each with its pixel on copy CA17/2/3 and its point
on `data/plan.json`. `tools/route_map_fit.py` fits the plan to the map (median
error 0.4 m), and `tools/addresses.mjs` gives the model building of an address.
What the map shows:

- Tung Tau Tsuen Road: 40 at the west end down to 2 at the east end, one side.
- Lung Chun Road (龍津道), the south road: 160 at the west end down to 72 at the
  south-east corner, even numbers only. Lung Chun Road 1-70 (odd and even, in
  the GRS files) are not on this map.
- Sai Shing Road (西城路): falling from north to south.
- Kwong Ming Street (光明街): 1-3 at the south end up to 52 in the north, even
  numbers on the east side and odd numbers on the west side.
- Lung Shing Road (龍城路): 7 in the south up to 69 in the north, odd numbers on
  the east side and even numbers on the west side.

The inner streets of the south half (Lo Yan Street (老人街), Tai Chang Street
(大井街), Sz Kung Street (社公街)) are faint at 1000 px and are only partly read.

| Object | Date | Medium, size | Notes |
|---|---|---|---|
| CA17/2/1 | 20 Nov 1991 – 24 Feb 1992 | photocopy, ink, marker; 29.7 × 41.6 cm | "City route I, Nov. 20 91, shot #1 #2" and "Route #4,5,6 shot 24/2". Note on the back about *Family and Kinship in East London* (1957). |
| CA17/2/2 | 20 Nov 1991 | electrophotographic print, coloured pen; 29.8 × 42.7 cm | Routes 1–6. On show in "Things, Spaces, Interactions" at M+ from 12 Nov 2021. |
| CA17/2/3 | 21 Nov 1991 | photocopy, ink, marker; 29.7 × 42.7 cm | Routes 1–5. |

## The cassettes (from the catalogue)

| Object | Recorded | Length | Content |
|---|---|---|---|
| CA17/1/1 | 20–21 Nov 1991, 24 Feb 1992 | 90:22 | Routes 1–6 and a roof garden. |
| CA17/1/2 | 24 Feb 1992 | 34:18 | Copy of the 24 Feb 1992 footage in cassette 1. Routes 2–5, roof garden. |
| CA17/1/3 | 1988 | 27:39 | RTHK (香港電台) documentary "Kowloon Walled City Stories" (九龍城寨的故事) (1988), and demolition videos labelled "Bristol" and "Sydney". |
| CA17/1/4 | 19 Nov 1991 | 78:42 | Interview with K.K. Siu (蕭國健). |
| CA17/1/6 | 15 and 17 Nov 1989; 22 Oct 1991 | 83:29 | Footage by Po-Chih Leong (梁普智) in 1989, and by Suenn Ho in 1991. |
| CA17/1/7 | Oct 1991 | 81:48 | Interview in English with Michael Chang, a feng shui expert, "on the history and spatial formation of the city". Part 1. |
| CA17/1/8 | 29 Oct 1991 | 35:08 | Interview with Liang Tao (梁濤). |
| CA17/1/9 | 14 Nov 1991 | 17:26 | Interviews with residents. |
| CA17/1/10 | [1991] | 38:28 | Michael Chang interview, part 2. |
| CA17/1/11 | 23 Feb – 3 Mar 1992 | 68:55 | Alleys and shop interiors (24 Feb and 2 Mar 1992). Police and media at the edge of the city (3 Mar 1992). Also Tao Ho's (何弢) office in Kowloon Tong (九龍塘). |
| CA17/1/12 | 21 Nov 1991 | 52:17 | Phase one clearance: "remaining shops before clearance, and interviews with remaining shopkeepers and food manufacturers". |

Cassette 5 is not listed online.

The M+ description of what the footage shows is secondary. The guess of the
CA17/1/11 page about a phase of the clearance is also secondary. Both are in
[`../../secondary-sources/mplus-suenn-ho-ca17/SOURCE.md`](../../secondary-sources/mplus-suenn-ho-ca17/SOURCE.md).
The fonds description also says that part of the footage went to the Wall Street
Journal Asia for its 2014 online exhibition.

## Next steps

- Ask M+ for full-size scans of CA17/2/1–3 and for terms of use.
- Book a viewing of the cassettes at the M+ Research Centre.
- Find the WSJ 2014 clips of this footage in the Wayback Machine.
- Find the source of the base plan. It can be the 1987 government survey.

## More items: the source search of 2026-11 (catalogued, not read)

- **Status:** read: 1 of 1 items read by the reading of the source search of 2026-11.
  A checker checked a sample of the facts. Each fact gives its page and a short exact quote.

1 items. New parts of the Suenn Ho records.

### top-gap-tv-news-archives-2: Exploring Kowloon Walled City In An Afternoon – Vlog ( 1991) By Suenn Ho

- **Status:** Partly read on 2026-11-20; a checker checked a sample of the facts on 2026-11-20. I did not watch the video (no video tool). I read the archive.org metadata of the three copies and the YouTube metadata file (_reCv-ix-So.info.json) that the third copy keeps, and I viewed the 13 still frames that archive.org made from the video. The frames show the camcorder date, burnt-in English subtitles and a WSJ Live logo. NEW: the clip is a re-upload of a Wall Street Journal (WSJ Live) edit with the hashtag #wsjkwc, which fits the M+ note that part of the footage went to the Wall Street Journal Asia for its 2014 online exhibition. The sound, the full subtitles and most scenes are not read.
- **Citation:** Suenn Ho (何巽), footage of Kowloon Walled City, 20 Nov 1991, in a Wall Street Journal (WSJ Live) edit with English subtitles (#wsjkwc), re-uploaded as "Exploring Kowloon Walled City in an Afternoon – Vlog (1991) by Suenn Ho" by Johny Bobbles Archives on YouTube (_reCv-ix-So, 2 Jun 2023, 6:31) and copied to the Internet Archive, https://archive.org/details/youtube-_reCv-ix-So (and two other copies), read 2026-11-20.
- **Class:** primary (The footage is primary: shot in the City on 20 Nov 1991 (camcorder date). The subtitles and at least one voice-over line are a later WSJ edit (2014, INFERRED from the M+ note); the voice-over is retrospective (about 2014). The tree primary is correct for the footage.)
- **Date of the record:** 20 Nov 1991, 13:31 to 14:12 (camcorder timestamp); edited about 2014 (INFERRED); uploaded 2 Jun 2023
- **Note:** its 2 secondary facts (narration, later captions) are in the secondary twin, [`../../secondary-sources/mplus-suenn-ho-ca17/SOURCE.md`](../../secondary-sources/mplus-suenn-ho-ca17/SOURCE.md).

| Page | Fact | Words in the source |
|---|---|---|
| archive.org still frame (youtube-_reCv-ix-So.thumbs/_reCv-ix-So_000001.jpg) to _000387 | INFERRED: The camcorder timestamp in the frames reads 20.11.91, from 13:31 to 14:12: the footage is of the afternoon of 20 Nov 1991. M+ dates cassette CA17/1/1 (routes 1-6) and route map CA17/2/2 to 20 Nov 1991; I take the clip to come from that cassette. | "13:31 20.11.91" |
| archive.org still frame (youtube-_reCv-ix-So.thumbs/_reCv-ix-So_000001.jpg) | The camera has a fisheye lens. At 13:31 the filmmaker asks men in a small room if she can film them playing Chinese chess. | "Do you mind if I film you playing Chinese chess?" |
| archive.org still frame (youtube-_reCv-ix-So.thumbs/_reCv-ix-So_000057.jpg) | At 13:32 she asks people in a cluttered room with fluorescent lights whether water leaks in when it rains. | "Does water leak in when it rains?" |
| archive.org still frame (youtube-_reCv-ix-So.thumbs/_reCv-ix-So_000118.jpg) | INFERRED: At 13:35 a man working at a machine in a small workshop says that they will receive compensation (for the clearance). | "Yes, we will receive compensation." |
| archive.org still frame (youtube-_reCv-ix-So.thumbs/_reCv-ix-So_000208.jpg) and _000237 | INFERRED: At 13:43 a worker runs orange pieces through a small machine with a row of blades on a tray; at 13:52 there are trays of small green balls. The filmmaker asks "Were they from Osaka?" (I take it to be a question about the machines). These look like a small food or sweets workshop; the product is not clear. | "Were they from Osaka?" |
| archive.org still frame (youtube-_reCv-ix-So.thumbs/_reCv-ix-So_000267.jpg) | INFERRED: At 13:57 a voice-over says that an angry old man suddenly wanted to take her film. I take this line to be a later narration. | "suddenly this angry old man wanted to take my film." |
| archive.org still frame (youtube-_reCv-ix-So.thumbs/_reCv-ix-So_000329.jpg) and _000360 | At 14:05 a barber cuts a man's hair in a shop with a row of chairs; the filmmaker asks if they have been there long. At 14:06 a man in a shop says that he has no plans. | "I don't have any plans." |
| archive.org still frame (youtube-_reCv-ix-So.thumbs/_reCv-ix-So_000089.jpg), _000180, _000297, _000387 | The other frames show a dark, narrow alley (13:36 and 14:12), a small room with hanging clothes (13:34), and a shop front with a lit sign (13:57). | "14:12 20.11.91" |

- **Leads:**
  - The Wall Street Journal (WSJ Asia) 2014 online exhibition on Kowloon Walled City and its WSJ Live clips of Suenn Ho's footage (hashtag #wsjkwc), with the full subtitles
  - M+ CA17/1/1, Video footage, Kowloon Walled City research project, cassette 1, routes 1-6 and roof garden (20-21 Nov 1991): the likely source tape
