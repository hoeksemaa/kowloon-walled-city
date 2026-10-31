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
  cages, signs, roof tanks and aerials. The 1987 figure-ground plan joins them into 311
  towers. The heights on the south face come from Lambot's 1990 south elevation.
- **Floor plans.** Stairs, corridors and units on each storey, after Suenn Ho's stair
  types. The home floors hold the book's 8,800 flats. Cut a storey (the floor list on the
  right) to see the plan, and point at a unit to see its name and size.
- **Businesses.** 459 premises from the clearance files (GRS HKRS1255-3), with their real
  names on the signs. Inferred floors fill the total to the 1983 Kai Fong count of 645.
- **Routes.** People walk from their room to the door, along the corridor and up or down
  the stair. They cross to other buildings through links and bridges and over the roofs,
  or go down to the lanes, whichever is quicker.
- **Utilities.** Power, water, phone and TV lines. Low floors get water only in the hours
  that a resident recorded.
- **People.** About 33,000 residents. Nine are real people who say only their own recorded
  words. All the others are composites.
- **Story.** Seven chapters, one for each day, with a camera that follows each scene.
- **Sound.** It is off at first: turn it on with the speaker tool or the key S. A soft bed
  follows the hour, with occasional clear sounds over it, for example drips, a plane and the
  pigeon breeder's whistle. The browser makes each sound, and the repository has no audio files.

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

`node tools/check_layout.mjs` builds the layout and the route network without a browser. It
prints the counts of towers, stairs, flats and links. It fails if a unit does not meet a
corridor or a stair, if a storey has no way down, or if walks go through other rooms.
