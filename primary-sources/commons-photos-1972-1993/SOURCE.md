# Wikimedia Commons photographs, 1972–1993

Original photographs of Kowloon Walled City (九龍城寨), as uploaded to Wikimedia Commons.
Each file is a byte-identical copy of the Commons original. Its SHA-1 matches
the `sha1` value that the Commons API gives.

- **Where:** https://commons.wikimedia.org/wiki/Category:Historical_images_of_Kowloon_Walled_City
- **Retrieved:** 2026-10-29, through the Commons API (`prop=imageinfo|revisions`).
- **Stored in git:** yes. All licenses below permit redistribution.
- **Metadata:** each `<name>.commons.json` is the full API answer for that
  file: wikitext of the file page, uploader, `extmetadata` (author, date,
  license) and `sha1`.

## Why these are primary

Each photo was made at the city by the photographer, at the date given. The
photos record the city as it was. Commons is only the host.

## Files

| File | Date | Author | License | What it shows |
|---|---|---|---|---|
| `KWC - 1972 Sing Tao.jpg` | 1972 | Ian Lambot (as credited) | CC BY 4.0 | Aerial view, city and the village beside it. 800×392. |
| `KWC - 1973 Aerial.jpg` | 1973 | Ian Lambot (as credited) | CC BY 4.0 | Aerial view, city and the village beside it. 800×800. |
| `KWC - 1975.jpg` | 1975 | Ian Lambot (as credited) | CC BY 4.0 | South side of the city. 2896×1999. |
| `Kowloon Walled City - 1989 Aerial.jpg` | 1989 | Ian Lambot | CC BY-SA 4.0 | Aerial view of the whole city, with a park to the south. 1942×1466. The best single image of the city at peak. |
| `Aerial view of Kowloon Walled City in Hong Kong on 1989-03-27.jpg` | 1989-03-27 | Jidanni | CC BY-SA 3.0 (GFDL) | Oblique view from an aeroplane, heading NE. 711×514. |
| `九龍城寨 - Kowloon Walled City in 1991 (2350913856).jpg` | Sept 1991 | Roger Price | CC BY 2.0 | Edge of the city, 1991. 2354×3454. Flickr original. |
| `九龍城寨 - Kowloon Walled City in 1991 (2350918226).jpg` | Sept 1991 | Roger Price | CC BY 2.0 | Edge of the city, 1991. 3436×2372. Flickr original. |
| `KWC - Alley.jpg` | "1993" | Ian Lambot | CC BY 4.0 | An alley inside the city. 800×1049. |
| `KWC - Night.jpg` | "1993" | Ian Lambot | CC BY-SA 4.0 | A street at the edge of the city at night. 800×631. |
| `KWC - Playground.jpg` | "1993" | Ian Lambot | CC BY 4.0 | A playground at the edge of the city. 800×632. |
| `啓德,九龍城，黃大仙 - panoramio.jpg` | before 1994 | ken93110 | CC BY-SA 3.0 | Wide aerial view over Wong Tai Sin (黃大仙) and Kowloon City (九龍城) to Kai Tak (啓德). The city is in the middle distance. 3072×2048. |

Later words on the Commons pages are secondary: the captions of the files credited to Lambot,
the image notes and the place categories. They are in
[`../../secondary-sources/commons-photos-1972-1993/SOURCE.md`](../../secondary-sources/commons-photos-1972-1993/SOURCE.md),
with the name of the village and the site of the park.

Attribution text for reuse: "Photo: <Author>, <License>, via Wikimedia
Commons". For CC BY-SA files, a derived image must use the same license.

## Notes on reliability

- The Lambot files carry Wikimedia VRT permission ticket 2017021410015271.
  Thus the rights holder confirmed the license to Wikimedia.
- Commons dates three Lambot photos to "1993". That is the year that the book
  *City of Darkness* was published. The file pages give no shoot date. The
  photos are from before the demolition, which started in 1993.
- The 1972 photo is titled "Sing Tao", and Sing Tao (星島日報) is a Hong Kong (香港) newspaper.
  The photographer can be a Sing Tao photographer, not Lambot. The VRT
  ticket still covers the license.
- Two files hold the catalogue data of a press archive (IPTC, XMP and EXIF). I
  read it with Python on 2026-11-16. The 1972 file stores its Chinese text as
  Big5 read as Mac Roman, and I decoded it.
  - `KWC - 1972 Sing Tao.jpg`: source "星島日報 (Sing Tao Daily)", credit
    "星島新聞集團有限公司", by-line "資料室珍貴圖片", copyright field "20798652". The
    title is "香港歷史圖片(地貌): 九龍城寨(Kowloon Walled City)". The scan is from a
    CanoScan 9000F, on 2011-02-08 (EXIF `DateTimeDigitized`).
  - The first line of its caption is
    "十年前城寨己開始有洋房建築，但木屋隨處可見，較諸戰後早期，已完全不同。1972/12/25星島日報A18".
    Thus the Sing Tao Daily printed the photo on 25 Dec 1972, page A18. If
    "十年前" ("ten years ago") gives the age of the photo, it shows the City of
    about 1962. The second line, by the archive, is
    "七十年代九龍城寨舊貌Kowloon Walled City in 70s。(資料室珍貴圖片、黑白照)".
  - `KWC - 1975.jpg`: credit "SCMP", by-line "Post Staff Photographer", EXIF
    artist "SCMP Picture", reference "MPID8221639", file name "SCMP 16AUG04 SR
    CITY3.jpg". The caption is "Kowloon Walled City with Squatter Village in
    front in 1970s." The date field is "19700101". Thus the SCMP gives only
    "1970s". Only the later Commons caption gives "1975" (see the twin). The
    room facts P8–P11 and P31 use that year.
  - Thus the credit "Ian Lambot" on these two pages names the book that
    printed the photos, not the photographer. Git stores the two files under
    the license of VRT ticket 2017021410015271, but their data names the two
    papers as the sources.
- Three stored files are later versions on Commons (file histories, read on
  2026-11-16). Commons keeps the earlier versions.
  - `Kowloon Walled City - 1989 Aerial.jpg`: ShockD uploaded 800×597 on
    14 Feb 2017 and 1942×1466 on 14 Mar 2017 ("contrast"). Bammesk removed a
    scratch on 11 Jun 2023. Cmglee reduced a colour cast on 17 Feb 2025. Git
    stores the 2025 version.
  - `KWC - 1975.jpg`: ShockD uploaded 800×552 on 14 Feb 2017 and 2896×1999 on
    14 Mar 2017 ("contrast"). Git stores the second version.
  - `Aerial view of Kowloon Walled City in Hong Kong on 1989-03-27.jpg`: Jidanni
    uploaded it on 27 Apr 2006. Interiot uploaded a new version on 20 Aug 2007
    ("adjust white-balance, sharpen a bit"). Git stores the 2007 version.
- Roger Price wrote his own caption on Flickr (uploaded 21 Mar 2008;
  retrospective (2008)): "this was in September 1991 shortly before they
  demolished the place and replaced it with quite a nice park". It gives the
  date "Sept 1991" of the two photos.
- The Jidanni caption says the city was "being dismanteled" in March 1989.
  LegCo (立法局) records show that Phase I clearance started on 27 Nov 1991 (see
  `../legco-hansard-1986-1993/`). Do not use that caption as a fact.
- The panoramio date is only "before 1994", from the uploader.

## Left out on purpose

These Commons files are edits, not originals. I removed them:

- `Kowloon Walled City.jpg`: an edit by User:Stevage of the Jidanni photo.
- `Kowloon Walled City - 1991.jpg`: a crop and colour edit of Flickr 2350918226.
- `Kowloon Walled City 1991.jpg`: a crop and colour edit of Flickr 2350913856.
- `KWC - 1989 Aerial (cropped).jpg`: a crop of the 1989 aerial.

I also removed `Kai Tak Arial Photo in 80s of the 20th Century.jpg`. It is a
vertical survey photo with no date. The city is only a few pixels in it. The
"own work, public domain" claim is doubtful for a survey photo.

## More to collect here

- Nothing more from Roger Price. I checked his album "Hong Kong - September
  1991" (https://www.flickr.com/photos/rwp-roger/albums/72157604194155789),
  which has 24 photos. Only the two above show the city. Flickr now gives the
  album as CC BY-NC-SA 2.0. The Commons copies stay CC BY 2.0, because
  Commons reviewed them under that license in 2009 and 2012.
- I checked the full category on 2026-10-29. The other files are from before
  1960, or are crops, or show models. The one exception is Paul Rudolph's
  photo (`Kowloon Walled City, Kowloon, China.tif`, 57.7 MB, "between 1960 and
  1980"). Its source, the Library of Congress, says "Publication may be
  restricted" (https://www.loc.gov/item/2010648314/). Thus I left it out for now.
- On 2026-11-16 the category also listed `CO 1069-453-07.jpg`, `-08`, `-09`,
  `-10`, `-11`, `-12` and `-17` (and crops of `-09` and `-10`), and
  `Kowloon Walled City2.jpg`. I did not check their dates or sources.

## Room facts in `data/room_research.json` (2026-11-05)

An agent zoomed on the signs in four photos. The facts are P1–P13 and P31.

- **Roger Price, Sept 1991, `九龍城寨 - Kowloon Walled City in 1991 (2350913856).jpg`**
  (P1–P7). G/F shops on Lung Shing Road (龍城路): "黃美如牙科" (21 Lung Shing Rd in the
  GRS 政府檔案處, HKRS1255-3-374); "牙科麥汝鋆" with a hanging sign "東正道11號" (17 Lung
  Shing Rd in the GRS, HKRS1255-3-376); "世界牙科" with "陳發牙醫"; and a clinic
  "…正診療所" (the first character is cut off). The last two are not in
  `data/businesses.json`. In the photo, 17 is nearer the camera than 21. This
  can show the direction of the Lung Shing Road numbers (a disagreement in
  `data/room_research.json`).
- **`KWC - 1975.jpg`** (P8–P11, P31). Window signs "廖廣森 … 跌打中醫診所" on an upper
  floor at 1 Lung Chun Rd (龍津道) (P8, P9); two signs "麗光牙科" high on a new tower
  under bamboo scaffolding (P10); "東成樓" painted on a facade (P11); and the
  signs of iron works in one-storey sheds south of the City, outside it (P31).
- **`KWC - Playground.jpg`** (P12). "東發樓" painted under the roof of a
  tenement at 82–84 Lung Chun Rd, with laundry on nearly every upper floor.
- **`KWC - Night.jpg`** (P13). At least four vertical dentist signs at
  upper-floor level. The names are too small to read.
