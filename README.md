# Kowloon Walled City · 1986

An explorable, real-time 3D model of Kowloon Walled City (九龍城寨) at its height. It
shows one ordinary week, Tuesday 16 to Monday 22 December 1986, which ends on 冬至.

## Run

```sh
python3 serve.py 8173
# open http://127.0.0.1:8173/
```

## What is in the model

- **Buildings.** 474 plots from the 1980s street plan, drawn as polygons with window
  cages, signs, roof tanks and aerials. The heights on the south face come from Lambot's
  1990 south elevation.
- **Businesses.** 459 premises from the clearance files (GRS HKRS1255-3), with their real
  names on the signs. Inferred floors fill the total to the 1983 Kai Fong count of 645.
- **Utilities.** Power, water, phone and TV lines. Low floors get water only in the hours
  that a resident recorded.
- **People.** About 33,000 residents. Nine are real people who say only their own recorded
  words. All the others are composites.
- **Story.** Seven chapters, one for each day, with a camera that follows each scene.

The "Sources + notes" panel in the app lists each source and each inference.

## Sources

`primary-sources/` has one folder for each primary source, with notes and short quotes.
Copyrighted scans and downloads stay in `primary-sources/**/local/`, which git ignores.

## Data

The street plan in `data/plan.json` is traced from
["Streets in Kowloon Walled City.jpg"](https://commons.wikimedia.org/wiki/File:Streets_in_Kowloon_Walled_City.jpg)
by Lord Jaraxxus, CC BY-SA 4.0. The traced data is shared under the same license.

`data/book.json` holds facts, page numbers and short quotes from *City of Darkness
Revisited* (2014). `data/book_overlay.json` holds numbers that `tools/book_overlay.py`
measures on the book's 1987 figure-ground plan and 1992 map. No image from the book is in
the repository or the app.
