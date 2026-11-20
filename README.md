# Kowloon Walled City (九龍城寨) · 1986

An explorable, real-time 3D model of Kowloon Walled City (九龍城寨) at its height. It shows one
ordinary week, Monday 15 to Sunday 21 December 1986. The buildings, rooms, people, water, light
and weather of the week come from sources of the time. The model marks each guess INFERRED.

**Claude wrote this project, and Claude runs it and owns it.** Claude (Anthropic's AI model, in
Claude Code) makes all of the code, the data, the research and the notes, and makes the decisions
of the work. John Hoeksema is the creative director: he sets the aims and the taste.

## Run

```sh
python3 serve.py 8173
# open http://127.0.0.1:8173/                 the main app
# open http://127.0.0.1:8173/structure.html   the definitive 3D structure
```

There is no build step. The browser loads the modules as they are, with three.js from a CDN.

## Folders

| Folder | What it holds |
|---|---|
| `src/city/`, `src/surroundings/` | The definitive 3D structure: the City, and the terrain, roads and buildings round it. Frozen since 2026-11-04. |
| `src/life/` | The life of the week: the people and their households and days, the things in the rooms, the utilities, the lit windows and the mysteries. |
| `src/` | The rest of the main app (`index.html`) and of the structure viewer (`structure.html`). |
| `data/` | The JSON that the code reads: the plan, the structure, the rooms, the people, the surroundings and the weather. |
| `docs/` | How each part was made, and from which sources. |
| `tools/` | Scripts that build the data and check the model. The top of each file tells what it does. |
| `primary-sources/` | Records made at the time, and first-hand testimony. One folder for each source, with a `SOURCE.md`. |
| `secondary-sources/` | Later histories, essays, captions and films, with the same layout. |

Copyrighted copies of the sources stay in `local/` folders, which git ignores. The `README.md` of
each source tree is its index.

## The definitive 3D structure

The 3D structure of `src/city/` and `src/surroundings/` is the base of all other work. It is frozen:
`node tools/check_structure.mjs` fails if anything changes its geometry. A change needs a large
error that a new source shows, and John's approval. The structure has no colours: the code that
draws it gives them. See [docs/structure.md](docs/structure.md).

## More

- [docs/app.md](docs/app.md): what the main app and the viewer show, and how to use them.
- [docs/data.md](docs/data.md): where the data comes from, its licences and its checks.
- [docs/rooms.md](docs/rooms.md), [docs/people.md](docs/people.md),
  [docs/furnishings.md](docs/furnishings.md), [docs/utilities.md](docs/utilities.md): the rooms,
  the people, the things and the utilities.
- [docs/source-images.md](docs/source-images.md): an index of the images and scans of the sources, by
  date (made by `tools/source_images.py`).

## Licences of the data

The street plan (`data/plan.json`, `data/plan_fine.json`) is traced from
["Streets in Kowloon Walled City.jpg"](https://commons.wikimedia.org/wiki/File:Streets_in_Kowloon_Walled_City.jpg)
by Lord Jaraxxus, CC BY-SA 4.0. The traced data is shared under the same licence. The terrain and
the surroundings come from the Government of the Hong Kong SAR (香港特別行政區政府) and the CSDI
Portal (空間數據共享平台入門網站), with no Creative Commons licence (see `data/CONTEXT-NOTICE.md`).
No image from *City of Darkness Revisited* is in the repository or the app.
