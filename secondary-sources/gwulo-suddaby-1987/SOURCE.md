# Gwulo: Andrew Suddaby's photos of 1987, the secondary part

This file holds the secondary part of the four Gwulo pages of Andrew Suddaby's
photos of Kowloon Walled City (九龍城寨), taken on 1 Nov 1987. That part is
one comment by a reader, written in 2020. The photos, Suddaby's own captions,
the files and their checksums are primary. They are in the twin file
[`../../primary-sources/gwulo-suddaby-1987/SOURCE.md`](../../primary-sources/gwulo-suddaby-1987/SOURCE.md).

- **Citation:** "cornwell", comment "Tung Tau Tsuen Road", Sun 27 Dec 2020,
  22:02, on Gwulo media 22836, "Kowloon Walled City" (photo by Andrew
  Suddaby, 1 Nov 1987; uploaded 14 Oct 2015).
- **Link:** https://gwulo.com/media/22836 (the gallery "1987 Andrew Suddaby's
  photos": https://gwulo.com/photos/by-gallery?gallery=8687&page=1).
- **Retrieved:** 2026-10-29 (John saved the page). On 2026-11-16 I read the
  four live pages (22835–22838) again. The comment is the same, and the four
  pages have no other comment.
- **Copyright:** the pages give no license. The comment belongs to the person
  who wrote it.
- **Files:** in the primary folder only. The saved page is
  `../../primary-sources/gwulo-suddaby-1987/local/gwulo-22836.html`. Git
  ignores it. The twin file gives its SHA-256.

## Why this is secondary

The writer posted the comment 33 years after the photo. The writer does not
say that they saw the place in 1987. The dentist part is a family memory: the
writer's mother went to the dentist, not the writer. Thus the comment is a
later identification of the place and a second-hand memory.

## What it rests on

- The writer's knowledge of the roads near the City. The comment names no map
  and no other source.
- The memory of the writer's mother. The comment gives no date for her visit.
- Suddaby's caption on the same page. The comment answers it ("Yes, one of
  the entrance ...").

## Limits

- "cornwell" is a user name only. The comment gives no age of the writer and
  no tie of the writer to the City.
- The writer gives the place with "should be". It is an identification from
  the photo, not a record.
- Junction Road (聯合道) comes no nearer to the City than about 190 m. I
  measured this on the roads of `data/context.json` and the outline of
  `data/plan.json`. Photo 22836 shows the facade from across the road. Thus
  "just behind" is loose: Junction Road was behind the photographer, but far
  from him.
- "Tai Tseng street" is the writer's romanization. The repo uses Tai Chang
  Street (大井街), as in `src/layout.js`. *City of Darkness Revisited* (p. 296,
  in `data/book.json`) also gives the meaning Big Well Street.
- The comment does not name the shop or the dentist. It does not say when the
  mother went: the visit can be before 1987 or after it.
- "illegal" is the writer's word for the dentists. The comment gives no
  source for it.

## Leads to primary sources

The comment cites no source. Thus it gives no new lead. Primary sources in
the repo can check its points:

- The entrance and Tai Chang Street (大井街): the Suenn Ho (何巽) base plan in
  [`../../primary-sources/mplus-suenn-ho-ca17/`](../../primary-sources/mplus-suenn-ho-ca17/SOURCE.md),
  and the exhibit plan.
- The same: the 1992 map in
  [`../../primary-sources/city-of-darkness-revisited/`](../../primary-sources/city-of-darkness-revisited/SOURCE.md)
  (pp. 352–353). It names a north-west leg of Tai Chang Street
  (`data/book.json`, key `tcn`).
- The dentists on Tung Tau Tsuen Road (東頭村道): the GRS (政府檔案處)
  business compensation files in
  [`../../primary-sources/grs-catalogue-kwc/`](../../primary-sources/grs-catalogue-kwc/SOURCE.md).

## The comment

Moved from the primary file on 2026-11-16. Only 22836 has a comment. It is
not primary: it is from 2020, and the dentist part is a family memory. Use it
as a lead for the street plan.

- 22836, "cornwell", 27 Dec 2020: "The location should be Tung Tau Tsuen
  Road, and Junction Road should be just behind the photographer's back. Yes,
  one of the entrance should be at the centre of the pic, and join Tai Tseng
  street (literally big well street). My mom used to visit those illegal
  dentist once as she suffered from toothache at night."
- Tai Tseng Street is 大井街. Check it against the street names on the
  exhibit plan and the Suenn Ho (何巽) base plan.

## Details

Each detail comes from the comment above. Mark each one secondary (2020) in
the data.

| Detail | Quote |
|---|---|
| Photo 22836 looks along Tung Tau Tsuen Road (東頭村道), at the north face of the City. This agrees with Suddaby's caption of 22835. | "The location should be Tung Tau Tsuen Road" |
| Junction Road (聯合道) was behind the photographer. INFERRED: the City is on the right of the photo, thus he faced east along the road. Junction Road was far behind him (see "Limits"). | "Junction Road should be just behind the photographer's back" |
| The writer puts an entrance to the City at the centre of photo 22836. This agrees with Suddaby's caption of 22836. | "Yes, one of the entrance should be at the centre of the pic" |
| The writer says that this entrance joined Tai Chang Street (大井街). | "and join Tai Tseng street" |
| The writer gives the meaning of the street name: big well street. | "(literally big well street)" |
| The writer calls "those" dentists illegal. INFERRED: "those" are the dentists of the shops on Tung Tau Tsuen Road, as in Suddaby's caption of 22835. | "those illegal dentist" |
| The writer's mother went to one of these dentists once, for a toothache at night. INFERRED: she went at night, thus a dentist was open at night. The comment does not give the hour of the visit. | "My mom used to visit those illegal dentist once as she suffered from toothache at night." |
| The writer gave the comment the title of the road. | "Tung Tau Tsuen Road" |

## Room facts in `data/room_research.json` (2026-11-16)

None. The three facts from these pages (T39, T45, T46) have the source type
"primary (1987)". The twin file lists them. No other data file uses the
comment: I searched `data/`, `src/` and `docs/` on 2026-11-16.

## Check (2026-11-16)

I compared the old primary file line by line with the two new files
(`research/sources-2026-11/tmp/check_split_gwulo_suddaby.py`): nothing is lost.
The comment is secondary, and each quote matches the saved page and the four
live pages. The photo and `data/context.json` show that the photographer stood
far from Junction Road, thus I replaced the guess that he stood at its corner.
I also reworded five details, added a limit and a lead, and tagged Suddaby's
captions "retrospective (2015)" in the twin file.
