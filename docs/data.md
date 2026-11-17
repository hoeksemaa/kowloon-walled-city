# The data: sources, licences and checks

This file tells where the data of `data/` comes from, under which licence, and how the tools
check it.

The street plan in `data/plan.json` (1 m cells) and `data/plan_fine.json` (0.25 m cells) is
traced from
["Streets in Kowloon Walled City.jpg"](https://commons.wikimedia.org/wiki/File:Streets_in_Kowloon_Walled_City.jpg)
by Lord Jaraxxus, CC BY-SA 4.0. The traced data is shared under the same license.

`data/book.json` holds facts, page numbers and short quotes from *City of Darkness
Revisited* (2014). `data/book_overlay.json` holds numbers that `tools/book_overlay.py`
measures on the book's 1987 figure-ground plan and 1992 map. No image from the book is in
the repository or the app.

`data/terrain.json` holds the height of the ground round the City, out to 640 m, from the
Lands Department (地政總署) 5 m Digital Terrain Model and the spot heights of the 1987 survey sheet
11-NE-11A (`tools/terrain.py`; see `data/CONTEXT-NOTICE.md`).

`data/context.json` holds the real buildings, roads and open ground round the City as they
stood in December 1986, within 600 m of the centre of the plan box, in plan metres. Each
building has an outline, a height, its storeys, its dates, a source, and "sourced" or
"inferred". `tools/context.py` makes it from the Lands Department 1:1000 survey sheets of
1987 (the editions of 1981-85 are a check) and the CSDI Building and Road Network data.
Source: the Government of the Hong Kong SAR (香港特別行政區政府) and the CSDI Portal
(空間數據共享平台入門網站); see
`data/CONTEXT-NOTICE.md`. This data does not have a Creative Commons licence. No scan or
download is in the repository. The City plate of the model covers 59% of Mei Tung House (美東樓),
the long slab north of the City. The data keeps the parts off the plate as buildings, and
`plateClipped` keeps the whole outline.

The main app and the viewer draw this data with `src/surroundings/`. `src/context.js` picks
the outlines to draw. For a building that the plate cuts, they draw the whole outline from
`plateClipped`. Thus Mei Tung House stands whole. Of the 1,263 drawn buildings, 612 have a
sourced height and 651 an inferred height. The colours and the 7 m width of the 9 road
segments with no measured width are inferred. The fit of the City on the 1987 sheet turns the
model 3.6°: plan +x points along the bearing 63.6° (`PLAN_BEARING`, `src/site.js`).

`node tools/check_context.mjs` checks `data/context.json`. It fails if a building is on the
City plate or beyond 600 m, if a building has no source, or if a survey sheet does not
register on the standing buildings. It also fails if a whole outline in `plateClipped`
reaches onto the City itself. It fails if the track of the planes (`src/approach.js`) is less
than 30 m over a roof within 60 m of the track, or over the City. It prints the five
buildings with the least clearance.

Last, `check_context.mjs` fails if an outline that `src/surroundings/` draws covers a cell
of the City.

`tools/check_stack.js` checks the floor layers of the main app (`src/cityLayers.js`). The
check runs in the browser, because the meshes need one. Serve the repository, open the page,
and type this in the console of the page:

```js
(await import('./tools/check_stack.js')).checkStack(kwc)
```

It returns `ok`, or a list of problems. It checks four things:

- Each vertex of layer k has layer k, and lies in the storey k of its building: from its floor
  to its next floor. A link (a bridge, the steps at a door) can reach down to the other end of
  its doors, and a roof holds what stands on it.
- Each building has its G/F in layer 0 and its roof in layer n.
- With the floors apart, each layer is at least `GAP` m under the next one.
- Peeled to a storey, the layers over it are hidden, and the layers up to it show.
