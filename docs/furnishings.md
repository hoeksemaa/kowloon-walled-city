# Furnishings of Kowloon Walled City (九龍城寨), December 1986

This report tells what stood in each kind of room (unit) of Kowloon Walled City in December 1986. The data is in `data/furnishings.json`. The report gives the item kinds and a recipe for each room category. It also gives the home types, the documented rooms, the roofs, the outside of the buildings and the December items. The data has no colours: the drawing code gives them.

## The aim

John wants a visitor to feel a mild awe, and a sense that more lies under the surface. Thus the recipes keep the counts low. Each recipe names its telling items: the right machine in the right workshop, the altar, the calendar. Put these items first. Add the other items only if there is room.

## Sources

- Girard and Lambot, *City of Darkness Revisited* (2014): the photos, the captions and the interviews. Four agents read each photo spread against the page image. I read the text with OCR.
- The open photos and the testimony that the repo already holds: M+ (2017.410, 2018.2, 2018.4, CA17/1/1), Wikimedia Commons, Gwulo and the notes in `primary-sources/`.
- Hong Kong Memory (香港記憶) for the Hong Kong custom of the Winter Solstice.
- `data/room_uses.json` for the trades of the named places, and the model (`tools/build_room_uses.mjs`) for the count and the area of the home units.

I checked each quote from the book against the OCR text. Where the OCR missed a quote, I checked the quote on a crop of the page image. Two quotes had characters that are not clear (pp188 and 209). I replaced them with captions of the same pages.

Most photos date from 1987 to 1992. Four wall calendars give 10 March 1989, 31 March 1989, 21 July 1989 and 27 October 1990. I use the photos for December 1986 because the fittings changed slowly. The number of air-conditioners grew in the late 1980s.

Each fact has an id (F1, F2 and so on). The full list is at the end. An item with basis `inferred` has a note that tells why.

## Home types

The model has 8,218 home units. The median area is 16.4 m². Apply the rules in this order.

| Type | Rule | Share | Basis | Recipe | Facts |
|---|---|---:|---|---|---|
| roof_hut | a home unit of kind 'roofroom' (k = n) | 0.005 | 37 of 8,218 home units in the model; furnishing inferred | home_roof_hut | F106 |
| ground_home | a home unit on G/F (k = 0) | 0.031 | 252 home units in the model; sourced from the living area behind Lee Pui Yuen's (李培元) store | home_ground | F57, F108 |
| one_room | a home unit above G/F of kind 'room', or of area under 10 m2 | 0.193 | 1,584 home units in the model (median 6.6 m2); sourced: Yau Lap Cheong (邱立昌) (11 m2), the 10 x 10 ft room, Law Yu Yi (羅婉儀) | home_one_room | F1, F19, F3 |
| bedspace_room | a home unit above G/F of area 15-25 m2, picked at random with p = 0.03 | 0.02 | inferred share; sourced type (eight single men in 200 sq ft, before about 1981) | home_bedspace_room | F11, F107 |
| family_flat | a home unit above G/F of area 10-25 m2 (not a bedspace_room) | 0.631 | 5,350 home units in the model (median 17 m2), less the bedspace rooms; sourced: most flats were about 200 sq ft (19 m2) | home_family_flat | F4, F5, F6 |
| divided_flat | a home unit above G/F of area 25 m2 or more, picked at random with p = 0.5 | 0.06 | inferred share (half of 995 large units); sourced type: the Tai Hing 4/F plan, a 13/F flat of a hall and three rooms | home_divided_flat | F24, F12 |
| large_family_flat | a home unit above G/F of area 25 m2 or more, not a divided_flat | 0.06 | inferred share; use the family_flat recipe with one more bed and one more partition | home_family_flat | F12 |

## How to use a recipe

1. If the recipe has variants, pick one variant for the unit by its share.
2. Put the telling items first.
3. Add the common items, then the variant items. Use the probability `p` for each item.
4. For a `per_m2` item, multiply by the unit area and round. Use at least 1.
5. If an item says 'Only in a room of N m2 or more', skip it in a smaller room.

Places: `door` is beside the unit door, `window` is at an outside wall, `outside_window` is on the outside of the outside wall.

## Recipes

### home_one_room

Facts: F1, F52, F19, F50, F123.

Telling items: bed, altar, calendar, fan. A bed against the wall, a high altar shelf, a tear-off calendar and a wall fan.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| bed | 1 | wall | 0.75 | sourced |  | F52, F87 |
| bunk | 1 | wall | 0.25 | sourced | Use a bunk instead of the bed in this share. | F50, F123 |
| shelf | 1 | wall | 0.9 | sourced | A wall shelf or an angle-iron rack over the bed. | F50 |
| stool | 1-2 | wall | 0.8 | sourced |  | F103 |
| chair | 0-1 | wall | 0.4 | sourced | Folding chair or rattan armchair. | F52, F50 |
| table | 1 | wall | 0.6 | sourced | Folding table. Only in a room of 6 m2 or more. | F19, F50 |
| stove | 1 | corner | 0.6 | sourced | Only in a room of 6 m2 or more. | F52, F19, F92 |
| fan | 1 | wall | 0.8 | sourced |  | F52, F50 |
| tv | 1 | wall | 0.5 | sourced |  | F2, F50 |
| radio | 1 | wall | 0.3 | sourced |  | F2 |
| altar | 1 | wall | 0.5 | sourced |  | F9, F50 |
| calendar | 1-2 | wall | 0.6 | sourced |  | F51 |
| clock | 1 | wall | 0.4 | sourced |  | F51 |
| clothes_rack | 1 | wall | 0.7 | sourced | Clothes on hooks or a rail. | F52 |
| bucket | 1-2 | corner | 0.8 | inferred | Inferred: water was carried up from the stand-pipes. | F61 |
| lamp | 1 | ceiling | 1.0 | sourced |  | F18 |

### home_family_flat

Facts: F4, F5, F6, F56, F23, F123.

Telling items: bunk, altar, tv, shrine_door, calendar. A bunk with quilts on the upper tier, a high altar, a TV on a cabinet or the fridge, a shrine at the door.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| bed | 1 | wall | 0.95 | sourced |  | F57, F52 |
| bunk | 1 | wall | 0.7 | sourced | About 3.2 people for each flat. | F53, F50 |
| partition | 1 | centre | 0.4 | sourced | Only in a flat of 15 m2 or more: a bedroom and a living room. | F6 |
| table | 1 | wall | 0.9 | sourced |  | F50, F56 |
| mahjong_table | 1 | centre | 0.1 | sourced | Instead of the table in this share. | F54 |
| stool | 2-4 | wall | 1.0 | sourced |  | F56 |
| chair | 0-2 | wall | 0.6 | sourced |  | F56, F57 |
| cabinet | 1-2 | wall | 0.9 | sourced | Wardrobe, chest of drawers or glass display cabinet. | F57, F56 |
| shelf | 1-2 | wall | 0.8 | sourced |  | F50 |
| sofa | 1 | wall | 0.15 | sourced |  | F56 |
| tv | 1 | wall | 0.8 | sourced | On a cabinet, a chest of drawers or the fridge. | F7, F56, F50, F103, F12 |
| fridge | 1 | wall | 0.5 | sourced |  | F50, F56, F103 |
| fan | 1-3 | wall | 1.0 | sourced |  | F7, F53 |
| aircon | 1 | window | 0.25 | sourced | Only in a unit with an outside wall. | F12, F93 |
| altar | 1 | wall | 0.7 | sourced |  | F9, F56, F50 |
| shrine_door | 1 | door | 0.5 | sourced |  | F91, F56 |
| couplet | 1 | door | 0.6 | sourced | On the outside of the door. | F10, F91 |
| calendar | 1-2 | wall | 0.8 | sourced |  | F51 |
| clock | 1 | wall | 0.6 | sourced |  | F51, F8 |
| stove | 1 | corner | 1.0 | sourced | Kitchen corner: gas ring and a gas cylinder. | F56, F55, F92 |
| sink | 1 | corner | 0.7 | inferred | Inferred from the tiled kitchen benches. | F56 |
| water_drum | 1 | corner | 0.6 | sourced | A drum or jerry can of drinking water. | F61, F55 |
| washtub | 1 | corner | 0.6 | sourced |  | F55 |
| clothes_rack | 1-2 | wall | 0.8 | sourced |  | F54, F56 |
| telephone | 1 | wall | 0.2 | inferred | Inferred share. | F123, F67 |
| lamp | 1-2 | ceiling | 1.0 | sourced |  | F18, F105 |
| washing_machine | 1 | corner | 0.15 | sourced | Twin-tub, in the kitchen corner. | F55, F12 |

### home_divided_flat

Facts: F11, F24.

Telling items: partition, cot, altar. Thin partitions and bed spaces with curtains in the living room.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| partition | 2-3 | centre | 1.0 | sourced | Two cubicles and the kitchen; see the Tai Hing flat in rooms. | F6 |
| bed | 2 | wall | 1.0 | sourced | One in each cubicle. | F57 |
| cot | 1-2 | wall | 0.8 | sourced | Bed spaces in the living room (the Tai Hing plan draws two). | F5 |
| table | 1 | wall | 1.0 | sourced |  | F50 |
| stool | 2-4 | wall | 1.0 | sourced |  | F56 |
| cabinet | 1-2 | wall | 0.9 | sourced |  | F57 |
| tv | 1 | wall | 0.7 | sourced |  | F50 |
| fan | 2-3 | wall | 1.0 | sourced |  | F7 |
| altar | 1 | wall | 0.7 | sourced |  | F9 |
| stove | 1 | corner | 1.0 | sourced |  | F92 |
| sink | 1 | corner | 0.8 | inferred |  | F56 |
| toilet | 1 | corner | 0.8 | sourced |  | F24 |
| water_drum | 1 | corner | 0.6 | sourced |  | F55 |
| lamp | 2-3 | ceiling | 1.0 | sourced |  | F18 |
| washing_machine | 1 | corner | 0.15 | sourced |  | F55, F12 |

### home_bedspace_room

Facts: F11, F107.

Telling items: bunk, shelf. Bunks along every wall, bags and boxes on the upper tiers.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| bunk | 0.22/m² | wall | 1.0 | sourced | One bunk for each 4-5 m2: eight men in 200 sq ft. | F11 |
| shelf | 1-2 | wall | 0.8 | inferred |  | F135 |
| stool | 1-3 | wall | 0.8 | inferred |  | F135 |
| fan | 1-2 | wall | 0.9 | inferred |  | F7 |
| lamp | 1 | ceiling | 1.0 | sourced |  | F18 |

### home_roof_hut

Facts: F106.

Telling items: bed, bucket. A bed and water carried up in buckets.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| bed | 1 | wall | 0.9 | inferred |  | F135 |
| stool | 1 | wall | 0.8 | inferred |  | F135 |
| bucket | 1-2 | corner | 0.9 | inferred |  | F135 |
| lamp | 1 | ceiling | 1.0 | sourced |  | F18 |

### home_ground

Facts: F57, F108.

Telling items: partition, bed, tv. A bed behind a partition at the back of the shop.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| bed | 1 | wall | 0.95 | sourced |  | F57 |
| partition | 1 | centre | 0.5 | sourced |  | F57 |
| cabinet | 1 | wall | 0.9 | sourced |  | F57 |
| table | 1 | wall | 0.9 | sourced |  | F50 |
| stool | 2-3 | wall | 1.0 | sourced |  | F62 |
| tv | 1 | wall | 0.7 | sourced |  | F109 |
| fan | 1-2 | wall | 1.0 | sourced |  | F57 |
| altar | 1 | wall | 0.7 | sourced |  | F9 |
| shrine_door | 1 | door | 0.8 | sourced |  | F91, F61 |
| stove | 1 | corner | 1.0 | sourced |  | F92 |
| water_drum | 1 | corner | 0.7 | sourced |  | F55 |
| lamp | 1-2 | ceiling | 1.0 | sourced |  | F18 |

### dentist

Facts: F45, F83, F84, F116, F117.

Telling items: dental_chair, glass_case, sign. The chair in the middle, dentures in a case at the street window, a sign outside.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| dental_chair | 1 | centre | 1.0 | sourced |  | F45, F83, F116, F117 |
| dental_light | 1 | centre | 1.0 | sourced |  | F45, F83, F116, F117 |
| shelf | 1-2 | wall | 0.9 | sourced | Glass wall shelves of bottles. | F45, F83 |
| glass_case | 1-4 | window | 0.6 | sourced | Dentures on show at the street window. | F84, F45, F117 |
| cabinet | 1 | wall | 0.8 | sourced |  | F45 |
| stool | 1-2 | wall | 0.9 | sourced |  | F83 |
| sofa | 1 | wall | 0.3 | sourced | Waiting seat. | F117 |
| clock | 1 | wall | 0.7 | sourced |  | F83, F116, F117 |
| calendar | 1 | wall | 0.7 | sourced |  | F83 |
| altar | 1 | wall | 0.5 | sourced |  | F83 |
| shrine_door | 1 | door | 0.5 | sourced |  | F83 |
| aircon | 1 | wall | 0.4 | sourced |  | F83 |
| sign | 1-2 | outside_window | 1.0 | sourced |  | F98, F40 |
| lamp | 1-2 | ceiling | 1.0 | sourced |  | F45 |
| tv | 1 | wall | 0.3 | sourced |  | F117 |
| bed | 1 | wall | 0.3 | sourced | Many dentists lived in the clinic; some slept on the floor. | F118, F85 |

### clinic

Facts: F81, F82.

Telling items: desk, calendar, sign. A small desk, a chart and certificates on the wall, a sign outside.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| desk | 1 | wall | 1.0 | sourced |  | F81 |
| stool | 1-2 | wall | 1.0 | sourced |  | F81 |
| chair | 1 | wall | 0.8 | inferred |  | F135 |
| clinic_bed | 1 | wall | 0.6 | inferred | Inferred: an examination couch; no photo shows one. | F135 |
| cabinet | 1 | wall | 0.8 | inferred |  | F135 |
| calendar | 1-2 | wall | 0.9 | sourced | Also framed certificates and an acupuncture chart. | F81 |
| fan | 1 | wall | 0.9 | sourced |  | F81 |
| bed | 1 | wall | 0.4 | sourced | Many doctors lived in the clinic. | F82 |
| sign | 1-2 | outside_window | 1.0 | sourced |  | F98 |
| lamp | 1-2 | ceiling | 1.0 | sourced |  | F18 |

### medicine

Facts: F60, F87.

Telling items: glass_case, jars, drawers. Glass cases and jars of medicine; a cabinet of many drawers.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| drawers | 1-2 | wall | 0.8 | inferred | Inferred: the usual herbal cabinet of many drawers (百子櫃); the p83 photo shows only the Western side. | F60 |
| shelf | 2-3 | wall | 1.0 | sourced |  | F60 |
| glass_case | 1-2 | centre | 1.0 | sourced |  | F60 |
| jars | 2-4 | wall | 1.0 | sourced |  | F60 |
| counter | 1 | door | 0.8 | sourced |  | F60 |
| fan | 1 | wall | 1.0 | sourced |  | F60 |
| altar | 1 | wall | 0.6 | sourced |  | F87 |
| lamp | 1-2 | ceiling | 1.0 | sourced |  | F60 |

### plastics

Facts: F65, F66, F76, F64.

Telling items: press, sacks, vat. Moulding machines in a row, sacks of pellets, an oil drum.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| press | 0.1/m² | wall | 1.0 | sourced | Injection-moulding machines in a row; at least 1. | F65, F66, F76 |
| sacks | 4-10 | wall | 1.0 | sourced |  | F66, F65 |
| vat | 1 | corner | 0.6 | sourced | A 200 L oil drum. | F65, F66 |
| crates | 2-6 | wall | 0.8 | sourced |  | F65 |
| workbench | 1 | wall | 0.8 | sourced |  | F76 |
| stool | 1-3 | wall | 0.9 | sourced |  | F76 |
| fan | 1-2 | wall | 1.0 | sourced |  | F65, F76 |
| clock | 1 | wall | 0.5 | sourced |  | F65 |
| calendar | 1-2 | wall | 0.6 | sourced |  | F76 |
| lamp | 2-4 | ceiling | 1.0 | sourced |  | F65 |

### metal

Facts: F144, F77, F78, F80.

Common items:

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| workbench | 1-2 | wall | 1.0 | sourced |  | F77 |
| shelf | 1 | wall | 0.8 | sourced | A tool rack. | F77 |
| stool | 1-2 | wall | 0.9 | sourced |  | F77 |
| altar | 1 | wall | 0.4 | sourced |  | F79 |
| calendar | 1 | wall | 0.6 | sourced |  | F76 |
| fan | 1 | wall | 1.0 | sourced |  | F80 |
| lamp | 1-2 | ceiling | 1.0 | sourced |  | F18 |

**Variant `metalwork`**: share 0.55 (share from the place names). Telling items: lathe, press, birdcage. Facts: F144, F77, F78.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| lathe | 1 | wall | 0.6 | sourced |  | F77 |
| press | 1-2 | wall | 0.5 | sourced | Power presses: only on G/F. | F77 |
| birdcage | 1 | ceiling | 0.25 | sourced | A songbird in a cage hung from the ceiling. | F78 |
| desk | 1 | door | 0.4 | sourced |  | F80 |

**Variant `jewellery`**: share 0.25 (share from the place names; the items are inferred (no photo)). Telling items: desk, glass_case. Facts: F144, F135.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| desk | 2-4 | wall | 1.0 | inferred | Inferred: one bench for each worker, with a desk lamp. | F135 |
| glass_case | 1 | wall | 0.3 | inferred |  | F135 |

**Variant `electrical`**: share 0.14 (share from the place names; the items are inferred (no photo)). Telling items: shelf, boxes. Facts: F144, F135.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| shelf | 1-2 | wall | 1.0 | inferred | Inferred: shelves of parts. | F135 |
| boxes | 2-4 | wall | 0.8 | inferred |  | F135 |

**Variant `plating`**: share 0.06 (share from the place names; the items are inferred (no photo)). Telling items: vat. Facts: F144, F135.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| vat | 2-4 | wall | 1.0 | inferred | Inferred: plating tanks in a row. | F135 |

### garment

Facts: F144, F122, F131, F22, F13.

Common items:

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| stool | 1-3 | wall | 0.9 | inferred | Inferred: each machine has an operator. | F135 |
| boxes | 2-4 | wall | 0.8 | sourced |  | F122 |
| calendar | 1 | wall | 0.6 | inferred | Inferred: every workshop photo shows one. | F135 |
| fan | 1-2 | wall | 1.0 | sourced |  | F131 |
| lamp | 1-2 | ceiling | 1.0 | sourced |  | F122, F131 |

**Variant `shoes`**: share 0.32 (share from the place names; the items are inferred (no photo of a shoe workshop)). Telling items: workbench, shelf. Facts: F144, F135.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| workbench | 1-2 | wall | 1.0 | inferred | Inferred: a cutting and lasting bench. | F135 |
| sewing_machine | 1-2 | wall | 0.6 | inferred | Inferred: a machine for the uppers. | F135 |
| shelf | 1-2 | wall | 0.8 | inferred | Inferred: shelves of lasts and soles. | F135 |

**Variant `knitting`**: share 0.18 (share from the place names). Telling items: knitting_machine. Facts: F144, F22.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| knitting_machine | 2-4 | wall | 1.0 | sourced |  | F22 |
| table | 1 | centre | 0.6 | inferred | Inferred: a table to fold the pieces. | F135 |

**Variant `weaving`**: share 0.16 (share from the place names). Telling items: loom, rack. Facts: F144, F122, F131, F13.

The family can sleep on the floor between the yarn (p48).

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| loom | 1-2 | wall | 1.0 | sourced |  | F122, F131 |
| rack | 1 | wall | 0.6 | sourced | A creel of yarn cones, about 2.5 m high. | F122 |
| shelf | 1 | wall | 0.6 | sourced | A high shelf of yarn cones. | F122 |
| desk | 1 | wall | 0.4 | sourced | A desk under a mirror, with scissors and tins. | F131 |

**Variant `sewing`**: share 0.34 (share from the place names; the items are inferred (no photo of a sewing workshop)). Telling items: sewing_machine, clothes_rack. Facts: F144, F135.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| sewing_machine | 0.1/m² | wall | 1.0 | inferred | Inferred: rows along the walls; at least 2. | F135 |
| workbench | 1 | centre | 0.8 | inferred | Inferred: a cutting table. | F135 |
| clothes_rack | 1-2 | wall | 0.8 | inferred |  | F135 |

### foodfac

Facts: F144, F72, F69, F73, F113, F126, F62.

Common items:

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| workbench | 1 | centre | 1.0 | sourced |  | F67, F69 |
| stool | 1-3 | wall | 0.8 | sourced |  | F127, F73 |
| altar | 1 | wall | 0.6 | sourced | A tall god cabinet on the floor, or a shelf high on the wall. | F69 |
| calendar | 1 | wall | 0.8 | sourced |  | F72, F69 |
| tv | 1 | wall | 0.2 | sourced | On a high shelf or a cabinet. | F67, F127 |
| fan | 1-2 | wall | 1.0 | sourced |  | F67, F115 |
| lamp | 1-2 | ceiling | 1.0 | sourced |  | F18 |

**Variant `noodle`**: share 0.17 (share from the place names). Telling items: noodle_machine, sacks, altar. Facts: F144, F67, F69, F72.

Flour covers every surface (p89). The family can eat and wash here at night (p173).

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| noodle_machine | 1-2 | wall | 1.0 | sourced |  | F67, F69 |
| sacks | 4-8 | wall | 1.0 | sourced |  | F69 |
| desk | 1 | wall | 0.4 | sourced | Two telephones, ledgers and an abacus on it. | F71 |
| ladder | 1 | wall | 0.3 | sourced |  | F69 |

**Variant `cake`**: share 0.16 (share from the place names). Telling items: wok_stove, steamer, rack. Facts: F144, F73, F121.

Walls coated in soot over the range (pp182-183).

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| wok_stove | 1 | wall | 0.9 | sourced | A long masonry fire range, up to 3 m. | F73 |
| steamer | 3-5 | wall | 1.0 | sourced |  | F73, F121 |
| rack | 1 | wall | 0.7 | sourced | Trays of small cake bowls. | F73 |
| sacks | 2-4 | wall | 0.8 | sourced |  | F73 |
| shelf | 1-2 | wall | 0.4 | sourced | Shelves of offering cakes when the unit sells at the front. | F121 |

**Variant `roast_meat`**: share 0.16 (share from the place names). Telling items: oven, washtub, fridge. Facts: F144, F113, F114, F115.

Meat hangs on hooks from a ceiling rail. Walls coated in grease (p287).

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| oven | 1-2 | wall | 1.0 | sourced |  | F113, F114 |
| washtub | 1-2 | centre | 0.8 | sourced |  | F113, F114 |
| bucket | 1-3 | corner | 0.8 | sourced |  | F114 |
| fridge | 1 | wall | 0.8 | sourced |  | F115 |
| bench | 1 | wall | 0.5 | sourced |  | F114 |

**Variant `fishball`**: share 0.07 (share from the place names). Telling items: wok_stove, mixer, crates. Facts: F144, F126, F127, F142.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| wok_stove | 1 | wall | 1.0 | sourced | A large frying wok in a concrete stove. | F126 |
| mixer | 1 | wall | 0.7 | sourced |  | F142 |
| crates | 2-4 | wall | 0.8 | sourced |  | F126, F127 |
| table | 1 | centre | 0.6 | sourced | A long low table for hand work, with low stools. | F127 |
| aircon | 1 | window | 0.4 | sourced |  | F127 |

**Variant `other`**: share 0.44 (share from the place names ('Food Company' with no trade word)). Telling items: machine, sacks, boxes. Facts: F144, F62, F63.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| machine | 1-2 | wall | 0.6 | sourced |  | F62, F63 |
| sacks | 2-6 | wall | 0.9 | sourced |  | F62 |
| boxes | 2-6 | wall | 0.8 | sourced |  | F62 |
| table | 1-2 | centre | 0.4 | sourced | Packing tables; they can stand out in the alley. | F62 |

### works

Facts: F144, F74, F79, F80.

Common items:

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| workbench | 1-2 | wall | 1.0 | sourced |  | F74 |
| shelf | 1 | wall | 0.8 | sourced |  | F74, F79 |
| boxes | 2-6 | wall | 0.8 | sourced |  | F74 |
| desk | 1 | wall | 0.5 | sourced | Two telephones on it. | F79, F80 |
| telephone | 1 | wall | 0.4 | sourced |  | F79 |
| altar | 1 | wall | 0.5 | sourced | A god niche with electric candles on a top shelf. | F79 |
| couplet | 1-2 | wall | 0.4 | sourced |  | F79 |
| calendar | 1 | wall | 0.8 | sourced |  | F79 |
| ladder | 1 | wall | 0.3 | sourced |  | F79 |
| fan | 1-2 | wall | 1.0 | sourced |  | F74 |
| bed | 1 | wall | 0.15 | sourced | Owners who sleep in the workshop against thieves. | F75 |
| lamp | 1-2 | ceiling | 1.0 | sourced |  | F74 |

**Variant `handbag`**: share 0.11 (share from the place names; the items are inferred). Telling items: sewing_machine. Facts: F144, F135.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| sewing_machine | 1-3 | wall | 1.0 | inferred |  | F135 |

**Variant `paper`**: share 0.08 (share from the place names; the items are inferred). Telling items: machine, boxes. Facts: F144, F135.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| machine | 1 | wall | 1.0 | inferred |  | F135 |
| boxes | 4-8 | wall | 1.0 | inferred |  | F135 |

**Variant `other`**: share 0.81 (share from the place names (toys, printing, rulers, rubber, crafts and others)). Telling items: machine, workbench. Facts: F144, F74, F76.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| machine | 1-2 | wall | 0.8 | sourced | A table saw, a heated press or a drill on a stand. | F74, F76 |

### shop

Facts: F58, F59, F100, F128.

Telling items: counter, shelf, crates. A counter at the door, shelves to the ceiling, crates of drinks.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| counter | 1 | door | 1.0 | sourced | A wood counter, or a chest freezer (then use 'freezer'). | F58, F100, F128 |
| shelf | 2-4 | wall | 1.0 | sourced |  | F58, F59 |
| fridge | 1-2 | wall | 0.8 | sourced |  | F59, F58 |
| glass_case | 1 | wall | 0.6 | sourced |  | F58 |
| sacks | 2-4 | wall | 0.6 | sourced |  | F128 |
| crates | 2-4 | door | 0.8 | sourced |  | F59, F100 |
| jars | 1-3 | centre | 0.8 | sourced |  | F58 |
| stool | 1 | door | 0.8 | sourced |  | F59 |
| tv | 1 | wall | 0.4 | sourced |  | F109 |
| clock | 1 | wall | 0.5 | sourced |  | F57 |
| fan | 1 | wall | 1.0 | sourced |  | F57 |
| bed | 1 | wall | 0.3 | sourced | Behind a partition at the back. | F108, F128 |
| lamp | 1-2 | ceiling | 1.0 | sourced |  | F57 |
| freezer | 1 | door | 0.4 | sourced | A chest freezer can make the counter. | F58, F128 |

### office

Facts: F79.

Telling items: desk, telephone, altar. A desk with two telephones and a god niche on a shelf.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| desk | 1-2 | wall | 1.0 | sourced |  | F79 |
| chair | 1-3 | wall | 1.0 | sourced |  | F80 |
| cabinet | 1-2 | wall | 0.9 | sourced |  | F79 |
| telephone | 1-2 | wall | 0.9 | sourced |  | F79 |
| altar | 1 | wall | 0.6 | sourced |  | F79 |
| calendar | 1 | wall | 0.9 | sourced |  | F79 |
| fan | 1 | wall | 1.0 | sourced |  | F80 |
| lamp | 1-2 | ceiling | 1.0 | sourced |  | F18 |

### community

Facts: F17, F136, F137, F139, F140, F46.

Telling items: chair, tv, cabinet. Mixed chairs along the walls, a TV, a 'No smoking' sign.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| chair | 0.2/m² | wall | 1.0 | sourced | Folding chairs and old office chairs. | F47, F136 |
| table | 1-3 | centre | 1.0 | inferred |  | F135 |
| tv | 1 | wall | 0.8 | sourced |  | F17 |
| desk | 1-2 | wall | 0.6 | sourced | Office desks (Kai Fong office). | F139, F140 |
| fan | 1-3 | wall | 1.0 | inferred |  | F135 |
| lamp | 2-4 | ceiling | 1.0 | sourced |  | F18 |
| cabinet | 1 | wall | 0.7 | sourced | A tall wood cabinet with a padlock, or a cabinet for the register. | F136, F141 |
| calendar | 1-2 | wall | 0.8 | sourced | Notices and a 'No smoking' sign. | F136, F44 |

Hui Kwong's (許光) Chiu Chow Music Club (p41) had a fridge and a kettle (data/room_research.json A19); not yet checked in the photo.

### religion

Facts: F144, F120, F90, F88, F130.

Common items:

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| fan | 1-2 | wall | 1.0 | sourced |  | F88 |
| lamp | 1-3 | ceiling | 1.0 | sourced |  | F18 |

**Variant `temple`**: share 0.45 (share from the place names). Telling items: altar, incense_burner, lantern. Facts: F144, F120, F90.

Smoky and dark.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| altar | 1 | wall | 1.0 | sourced |  | F120, F90 |
| incense_burner | 1-3 | centre | 1.0 | sourced | Stone urns in front of the altar. | F120 |
| table | 1 | centre | 0.8 | sourced | An offering table with fruit. | F120 |
| lantern | 1-2 | door | 0.6 | sourced | With incense coils hung from the ceiling. | F120 |

**Variant `church`**: share 0.55 (share from the place names). Telling items: chair, calendar. Facts: F144, F88, F130.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| chair | 0.4/m² | centre | 1.0 | sourced | Rows of folding chairs. | F88 |
| calendar | 1-2 | wall | 0.8 | sourced | Hymn sheets and a fabric hanging with a cross. | F88 |
| lectern | 1 | wall | 0.4 | inferred | Inferred: a stand for the preacher. | F135 |

### school

Facts: F110, F129, F130.

Telling items: blackboard, school_desk. A blackboard and small shared desks; drawings on the walls.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| school_desk | 0.4/m² | centre | 1.0 | sourced | Shared desks for 2-3 pupils. | F110, F129 |
| stool | 1.2/m² | centre | 1.0 | sourced | Small chairs or stools, one for each pupil. | F110, F129 |
| blackboard | 1 | wall | 1.0 | sourced |  | F129 |
| desk | 1 | wall | 1.0 | inferred |  | F135 |
| fan | 1-2 | wall | 1.0 | inferred |  | F135 |
| lamp | 2-4 | ceiling | 1.0 | sourced |  | F18 |
| aircon | 1-2 | window | 0.5 | sourced |  | F130 |

### eating

Facts: F144, F125, F124, F143, F104.

Common items:

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| fan | 1-2 | wall | 1.0 | sourced |  | F125 |
| calendar | 1-2 | wall | 0.8 | sourced | A tear-off calendar or framed pictures. | F124, F125 |
| crates | 1-2 | wall | 0.7 | sourced | Crates of soft-drink bottles. | F125, F124 |
| lamp | 1-2 | ceiling | 1.0 | sourced |  | F125, F104 |

**Variant `cafe`**: share 0.39 (share from the place names). Telling items: counter, glass_case, telephone. Facts: F144, F124.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| counter | 1 | door | 1.0 | sourced | The cashier's desk. | F124 |
| glass_case | 1 | wall | 0.8 | sourced | Cups on the shelves. | F124 |
| telephone | 1 | wall | 0.8 | sourced |  | F124 |
| shelf | 1 | corner | 0.6 | sourced | Cartons of cigarettes. | F124 |
| table | 2-5 | centre | 1.0 | sourced |  | F104 |
| stool | 0.4/m² | centre | 1.0 | sourced | About four for each table. | F104 |
| cockloft | 1 | wall | 0.2 | sourced | With a ladder in the corner. | F124 |
| ladder | 1 | corner | 0.2 | sourced | Only with a cockloft. | F124 |

**Variant `restaurant`**: share 0.5 (share from the place names). Telling items: table, stool, counter. Facts: F144, F125.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| table | 3-6 | centre | 1.0 | sourced | Square folding tables. | F125 |
| stool | 0.4/m² | centre | 1.0 | sourced | About four for each table. | F125 |
| chair | 0-3 | wall | 0.5 | sourced | Folding chairs. | F125 |
| counter | 1 | wall | 0.6 | sourced | A stainless counter at the back. | F125 |
| wok_stove | 1 | wall | 0.8 | inferred | Inferred: the kitchen at the back. | F135 |

**Variant `dai_pai_dong`**: share 0.11 (share from the place names). Telling items: counter, steamer, stool. Facts: F144, F143.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| counter | 1-2 | wall | 1.0 | sourced | Metal stall carts. | F143 |
| steamer | 1-3 | wall | 0.8 | sourced |  | F143 |
| table | 2-3 | outside_window | 0.8 | sourced | Folding tables on the pavement. | F143, F98 |
| stool | 4-8 | outside_window | 1.0 | sourced |  | F143 |
| bucket | 1-2 | wall | 0.8 | sourced |  | F143 |

### services

Facts: F144, F119.

**Variant `hair`**: share 0.58 (share from the place names). Telling items: barber_chair, mirror, counter. Facts: F144, F119.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| barber_chair | 1-3 | wall | 1.0 | sourced | In a row along the mirror. | F119 |
| mirror | 1 | wall | 1.0 | sourced | One long mirror over the counter. | F119 |
| counter | 1 | wall | 1.0 | sourced |  | F119 |
| stool | 1 | wall | 0.8 | sourced |  | F119 |
| clock | 1 | wall | 0.6 | sourced |  | F119 |
| calendar | 1 | wall | 0.8 | sourced |  | F119 |
| fan | 1 | wall | 1.0 | sourced |  | F119 |
| lamp | 1-2 | ceiling | 1.0 | sourced |  | F119 |

**Variant `utility`**: share 0.42 (share from the place names). Telling items: none. Facts: F144.

Standpipes, wells, toilets and transformer rooms. The utilities agent gives their contents (data/utilities.json).

### storage

Facts: F106.

Telling items: boxes, sacks. Stacks of boxes and sacks.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| boxes | 0.4/m² | wall | 1.0 | inferred |  | F135 |
| sacks | 2-8 | wall | 0.6 | inferred |  | F135 |
| lamp | 1 | ceiling | 1.0 | sourced |  | F18 |

### vice

Facts: F16.

Telling items: mahjong_table, stool. Mahjong tables under bright lights.

| Kind | n | Place | p | Basis | Note | Facts |
|---|---|---|---:|---|---|---|
| mahjong_table | 2-4 | centre | 0.7 | sourced |  | F16 |
| stool | 8-16 | centre | 1.0 | inferred | Four for each mahjong table. | F135 |
| lamp | 1-3 | ceiling | 1.0 | sourced |  | F18 |

## Documented rooms

These units have a photo or a plan in a source. The key is `building:storey:unit`.

| Unit | Place | Items | Note |
|---|---|---|---|
| 186:3:0 | A50 | bed x1, shelf x2, fan x1, table x1, chair x1, bench x1, altar x1, fridge x1, tv x1, counter x1, clock x2, calendar x4, lamp x1 | Law Yu Yi's flat: the two women share the lower bed; the angle-iron racks above it hold quilts (photo p81). |
| 218:6:1 | A3 | bed x1, chair x1, fan x1, clothes_rack x1, lamp x1, stove x1, shelf x1, tv x1, radio x1 | Yau Lap Cheong's one room of about 11 m2; the chair is a rattan armchair (material rattan). |
| 263:12:0 | A88 | partition x1, bunk x1, cot x1, cabinet x1, tv x1, fan x3, mahjong_table x1, stool x4, clothes_rack x1, stove x1, washtub x1, washing_machine x1, shelf x1, clock x1 | Chung Yuk Yee's 230 sq ft flat. A thin wooden partition makes a bedroom and a living room. The 'cot' is a child's crib. |
| 263:4:2 | A84 | table x1, stool x4, chair x2, sofa x1, cabinet x3, tv x1, counter x1, fridge x1, fan x1, altar x1, shrine_door x1, partition x1, calendar x2, stove x1, washtub x1 | Chung Lo Ying's flat, 4/F, 82 Lung Chun Road (龍津道): wall tiles; a window to the park; one room with a window was once let. |
| 152:0:0 | A65 | bed x1, cabinet x1, chair x1, fan x1, shelf x1, partition x1, clothes_rack x1 | The living area behind Lee Pui Yuen's store. The store is at the same building (see data/room_uses.json); the store items are in the 'shop' recipe. |
| 104:0:0 | B21 | bed x1, altar x1, table x1, cabinet x1, glass_case x1, plant_pot x1, telephone x1, aircon x2, fan x1, stove x1 | Wong Hoi Ming's (王海明) one-room home and clinic; wood-panelled walls. |
| 138:4:0 | M74 | partition x3, bed x2, cot x2, table x1, stool x4, tv x1, altar x1, stove x1, sink x1, toilet x1 | Tai Hing Building 4/F, from the plan of 9 Nov 1987 (p340, data/book.json flats.taiHing4F). A is the living room. B and C are cubicles of 3.54 m2, with a bed in each. D is the kitchen (2.0 m2) and E is the toilet (1.7 m2). F (1.72 x 1.17 m) and G (1.76 x 0.69 m) are bed spaces in the living room. Use the rects in data/book.json. The items other than the beds, the stove and the toilet are inferred. |
| 78:0:0 | B18 | noodle_machine x3, workbench x1, table x1, sacks x10, altar x1, fridge x1, desk x1, calendar x1, ladder x1 | Chan Wai Shui's (陳偉瑞) noodle factory; flour on every surface. The altar is a tall floor-standing god cabinet (0.5 x 0.4 x 2.0 m, lacquer). |
| 195:0:0 | B24 | press x1, table x1, fan x1, machine x1, workbench x1, stool x1, calendar x2 | To Gui Bon's (杜古邦) rubber factory: the heated press stamps plungers out of rubber sheets. |
| 219:0:0 | B13 | wok_stove x1, steamer x5, rack x1, sacks x5, stool x1 | Law Kim Kwong's (羅儉光) bakery: a long masonry fire range (use wok_stove, 3 m long) with steamer pots; walls coated in soot. |
| 4:2:3 | B15 | desk x1, stool x1, calendar x3, fan x1, shelf x1, bed x1 | Dr Tsin Mu Lam's (錢茂林) clinic, 2/F, 10 Tung Tau Tsuen Road (東頭村道); he lived there with his wife and son. The calendars stand for the acupuncture chart and the certificates. |
| 254:0:4 | T37 | dental_chair x1, dental_light x1, glass_case x1, shelf x1, cabinet x1, lamp x1, sign x1 | Ling Sang Dentistry (凌生牙科): wall tiles, terrazzo floor. |
| 187:0:0 | B32 | dental_chair x1, dental_light x1, shelf x3, mirror x1, clock x1, calendar x1, aircon x1, altar x1, shrine_door x1, stool x1 | The clean clinic on Lung Chun Road (p243). |
| 243:0:0 | A54 | shelf x3, glass_case x2, rack x1, jars x4, fan x1, lantern x1 | Chan Pui Yin's (陳沛然) shop: medicines on one side, toiletries on the other. |
| 186:0:1 | A63 | fridge x1, rack x2, shelf x1, crates x2, boxes x2, stool x1 | The busy corner store at Lung Chun Back Road (龍津後街) and Tai Chang Street (大井街). |
| 201:0:0 | A8 | barber_chair x3, mirror x1, counter x1, stool x1, clock x1, calendar x1, fan x1, lamp x2 | Ho Chi Kam's (何智錦) barber's shop, 10 Tai Chang Street; it closed in 1991. Wood boards and tiles to about 1.2 m; a perm trolley and a wall water heater. |
| 101:0:0 | A1 | dental_chair x1, dental_light x1, cabinet x2, chair x1, sink x1, calendar x2, clock x1, lamp x1 | Lam Mei Kwong's clinic, 4A Lung Shing Road (龍城路): 'spacious by Walled City standards'. The two 'calendar' items stand for the two framed charts. |
| 140:0:0 | C30 | dental_chair x1, dental_light x1, glass_case x5, sofa x1, tv x1, clock x1, calendar x1 | Wong Yu Ming's (黃如明) dental surgery; he lived there. Four glass cases hang high on the wall; one tall case at the door is the shop front. |
| 31:0:0 | A33 | desk x1, telephone x1, chair x1, glass_case x1, crates x1, shelf x1, clock x1, calendar x1, table x4, stool x12, ladder x1 | Chung Fat Café (松發冰室), Tung Tau Tsuen Road. The cashier's desk is sourced. The dining tables and stools are inferred. The walls have a tile dado and floral wallpaper. |
| 31:0:2 | A34 | cockloft x1, bed x1 | The small cockloft of the Chung Fat Café; Ng Kam Mui's (吳錦妹) mother sometimes slept there. |
| 263:2:2 | A38 | table x4, stool x6, chair x3, fan x1, counter x1, crates x2, calendar x2, lamp x1 | Chiu Chow restaurant off Lung Chun Road: painted dado about 1.2 m, mosaic floor. The 'calendar' items stand for two framed pictures. |
| 11:2:0 | A25 | shelf x2, steamer x3, table x1, vat x1 | Jetly Chau's (周秀儀) Chiu Chow cake shop: shelves of offering figures; the 'vat' is the soy-milk urn (0.4 x 0.4 x 0.6 m). |
| 232:2:1 | A28 | loom x1, rack x1, shelf x1, boxes x3, table x1, lamp x1 | Lau Yeung Yin's (劉陽賢) weaving factory: the 'rack' is the creel of yarn cones (about 2.5 m high); there were no beds (p48). |
| 273:0:0 | A13 | incense_burner x3, table x1, altar x1, lantern x1 | Fuk Tak shrine (福德古廟): incense coils hang from the ceiling; smoky and dark. |
| 185:0:1 | A23 | school_desk x6, stool x12, blackboard x1, calendar x4, aircon x1 | Salvation Army (救世軍) kindergarten, Lung Chun Back Road (龍津後街); the 'stool' items are small chairs; the 'calendar' items are cork boards of drawings. December: see 'seasonal'. |
| 169:1:0 | B41 | oven x2, bench x1, washtub x2, bucket x3, fridge x1, fan x1, lamp x2 | Yim Kwok Yuen's (嚴國源) cooked-meat workshop on Lo Yan Street (老人街) (opened 1981): meat hooks on a ceiling rail; walls coated in grease. |
| 84:0:2 | B51 | glass_case x1, shelf x3, jars x3, stool x1, sacks x6, calendar x1, bed x1, freezer x1 | Lam family grocery, 25 Tai Chang Street. The owner lives in the shop. |
| 174:0:0 | B69 | loom x1, workbench x1, fan x1, mirror x1, shelf x1, boxes x3, lamp x1, desk x1 | Yu Hing Wan's (余慶雲) muslin factory, Lung Chun Road: noisy old machines, no ventilation (p311). |
| 237:0:0 | M18 | chair x14, fan x2, calendar x2, lamp x2 | 'The Well', the mission of the St Stephen's Society (Jackie Pullinger (潘靈卓)). The map of the book points to p262 for place 18. December: see 'seasonal'. |
| 172:2:1 | B56 | chair x10, chair x1, tv x1, cabinet x1, calendar x1, table x2, lamp x2 | Old People's Centre (老人中心). The photo (p309) shows a pedal exerciser on the floor, curtains at a steel-framed window and a checkerboard tile floor. The text puts the Centre in the old magistrate's buildings (opc_place); data/room_uses.json puts it at this unit. |
| 8:3:2 | B10 | desk x2, chair x4, cabinet x1, calendar x2, lamp x2 | Kai Fong Association (九龍城寨街坊福利會) office, 3/F, 16 Tung Tau Tsuen Road. A steel grille door opens from the stair. The floor is terrazzo. The large function room is next to the office (see 'seasonal'). |

## Roofs

| Kind | What | Where | Share | Basis | Facts |
|---|---|---|---|---|---|
| tv_aerial | TV aerials on bamboo or metal poles, very dense, with cables | every roof | every roof (13 of 14 roof photos); 3-10 for each roof | sourced (count is inferred) | F25, F29, F31, F27, F132 |
| laundry_pole | washing lines and poles between the aerials | most roofs | 0.45 of roofs (about 6 of 14 photos) | sourced (share from a photo count) | F25, F27, F132 |
| plant_pot | small private gardens of pot plants | some roofs | 0.45 of roofs, 3-12 pots each (about 6 of 14 photos) | sourced (share from a photo count) | F27, F32, F132 |
| chair | folding chairs and folding loungers | some roofs | 0.2 of roofs, 1-2 seats (3 of 14 photos) | sourced (share from a photo count) | F30, F31, F132, F133 |
| boxes | junk: old TV sets, broken furniture, bedsprings, mattresses | most roofs | 0.3 of roofs, 1-4 heaps (about 4 of 14 photos) | sourced (share from a photo count) | F26, F132 |
| pigeon_loft | Chan Kwan Leung's (陳昆亮) two pigeon cages (over 1000 birds at one stage); in use in December 1986 | only the roof of his own building, 59 (his flat: place B72, 59:2:2; pp318-321). The map pin of the lofts (place B71, 75:0:0) is on the next building, 75. | 2 lofts, one roof | sourced | F33, F34, F35, F36 |
| roof_hut | roof hut: a small home-made hut with a door and a barred window | some roofs | 0.3 of roofs (about 4 of 14 photos); size about 3 x 2 x 2 m | sourced (share from a photo count) | F145, F132 |

## Outside the buildings

| Kind | What | Where | Share | Basis | Facts |
|---|---|---|---|---|---|
| window_cage | caged balconies: steel grille boxes outside the windows ('buildings on buildings') | flats with an outside wall above G/F | 0.7 of outside windows | sourced (share estimated by eye from the facade photos) | F38, F39, F41, F20, F134 |
| clothes_rack | laundry hung in the cages and on the rails | on the window cages | 0.6 of cages | sourced (share estimated by eye) | F38, F94, F41, F134 |
| laundry_pole | bamboo poles with laundry out of the windows | windows without a cage | 0.4 of windows without a cage | sourced (share inferred) | F96 |
| plant_pot | pot plants on the cage floors and rails | on the window cages | 0.4 of cages, 1-6 pots | sourced (share estimated by eye) | F95, F40, F41, F134 |
| birdcage | songbirds in bamboo cages hung in the balcony cages | on the window cages | 0.05 of cages | sourced (share inferred) | F94, F38 |
| awning | canvas or corrugated awnings over the cages and the alleys | top of a cage; over lanes | 0.3 of cages | sourced (share inferred) | F39, F111 |
| aircon | window air-conditioners | outside walls | 0.25 of flats with an outside wall | sourced (share inferred) | F40, F43, F93 |
| sign | vertical and horizontal signs of dentists, clinics, shops; painted direction signs in the lanes and stairs | edge roads (Tung Tau Tsuen Road, Lung Chun Road, Lung Shing Road) on G/F-3/F for each dentist, clinic and shop; painted signs on lane walls | 1-2 per dentist, clinic and shop unit | sourced | F98, F40, F99 |
| calendar | Kai Fong posters in the lanes | lane walls | a few | sourced | F44 |
| letterbox | postboxes in rows, or single boxes on the wall | G/F entrances | one group for each entrance, 4-20 boxes | sourced | F102, F42 |
| lamp | fluorescent tubes and bulbs in the corridors and alleys | corridors, alleys | one per 5-10 m of corridor | sourced (spacing inferred) | F18, F42 |

## December 1986

16 December 1986 was a Tuesday. The Winter Solstice was Monday 22 December. Christmas Day was a Thursday.

| Kind | What | Where | When | Basis | Facts |
|---|---|---|---|---|---|
| lantern | Christmas decorations: tinsel garlands and a foil 'Merry Christmas' banner | The Well (M18) and the other missions and churches (religion units of Christian bodies) | 16-22 Dec 1986 | sourced for The Well (photo undated); inferred for the others | F88 |
| lantern | Christmas decorations in the kindergarten: a tinsel 'MERRY CHRISTMAS' banner, a paper Santa, about 17 paper angels, balloons | Salvation Army kindergarten (A23) | December (photo year not given) | sourced | F129 |
| table | The annual Christmas party for elderly residents in the large room next to the Kai Fong office: folding tables and chairs. | Kai Fong Association, 3/F, 16 Tung Tau Tsuen Road (B10) | date of the party not given | sourced | F46, F140 |
| boxes | Christmas gifts of the Rotary Club | Old People's Centre (B56) | each year; date not given | sourced | F47 |
| altar | Winter Solstice (冬至), Mon 22 Dec 1986: food offerings and incense at the household altar, and a family dinner (a round_table can come out) | homes with an altar | 22 Dec 1986 | inferred for the City (Hong Kong custom from an outside source) | F49, F9 |
| couplet | New Year papers stay on the doors the whole year | flat doors | all year | sourced | F10, F91 |

## Kinds

Size is width x depth x height in metres. Material is words only.

| Kind | Label | Size (m) | Material | Shape | Note | Facts |
|---|---|---|---|---|---|---|
| bed | bed (iron or wood frame, board base, quilt) | 1.9 x 1.1 x 0.5 | metal, quilt | frame + board + quilt |  | F52, F50, F57, F87 |
| bunk | two-tier bunk bed (碌架床) | 1.9 x 0.95 x 1.65 | metal, quilt | frame + 2 boards | The upper tier often holds bedding, bags and boxes, not a sleeper. | F53, F50 |
| cot | bed space: a narrow bed with a curtain on a rail | 1.8 x 0.8 x 1.9 | metal, cloth | bed + curtain rail + curtain |  | F5 |
| cockloft | cockloft (閣仔): a timber platform high in the room, with a ladder | 2.4 x 1.5 x 0.12 | wood | platform on posts + ladder | Put the top of the platform at about 1.9-2.1 m. Use the full width of one wall. The ladder is 0.4 m wide. | F11 |
| partition | thin wooden partition wall | 2.4 x 0.03 x 2.1 | wood | board panel | Divides a flat into a bedroom and a living room, or into cubicles. It stops below the ceiling. | F6, F57 |
| table | small table (folding, with a laminate top) | 0.9 x 0.6 x 0.75 | wood, metal | top + legs |  | F50, F19, F67 |
| round_table | folding round table | 1.0 x 1.0 x 0.75 | wood | round top + legs | Size is the diameter. |  |
| desk | desk with a drawer | 1.2 x 0.6 x 0.76 | wood | top + drawer box + legs |  |  |
| stool | stool | 0.3 x 0.3 x 0.45 | plastic | seat + legs | Plastic or wood. | F56, F62, F103 |
| chair | chair (metal folding chair, wood chair or rattan armchair) | 0.45 x 0.45 x 0.85 | metal | seat + back |  | F52, F50, F57 |
| bench | bench | 1.2 x 0.35 x 0.45 | wood | seat + legs |  |  |
| sofa | sofa (vinyl) | 1.7 x 0.75 x 0.8 | plastic, wood | seat + back + arms |  |  |
| cabinet | wardrobe or tall cabinet | 0.9 x 0.5 x 1.8 | wood | box + doors |  | F57, F56 |
| shelf | open shelf unit (on the floor) or wall shelf | 1.0 x 0.35 x 1.8 | metal | frame + 4 boards | A wall shelf is one board 1.0 x 0.3 m at 1.5-1.9 m height. | F60, F59, F58 |
| counter | shop or cashier counter | 1.5 x 0.6 x 0.95 | wood | box + top |  |  |
| glass_case | glass display case | 1.2 x 0.5 x 1.0 | glass, aluminium | frame + glass box |  | F60, F84 |
| boxes | stack of cardboard boxes | 0.5 x 0.4 x 0.4 | paper | box (stack 1-4) |  |  |
| crates | crates or baskets | 0.6 x 0.4 x 0.3 | plastic | open box (stack 1-4) | Plastic, wood or rattan. |  |
| sacks | sacks (flour, rice, grain) | 0.5 x 0.35 x 0.8 | cloth | rounded box (stack 1-6) |  | F69, F66, F62 |
| jars | jars or tins on a shelf or counter | 0.25 x 0.25 x 0.35 | glass | cylinder (row of 3-8) |  |  |
| drawers | herbal medicine cabinet of many drawers (百子櫃) | 1.8 x 0.45 x 2.0 | wood | box + drawer grid |  |  |
| shrine_door | earth-god shrine at the door (土地) | 0.3 x 0.2 x 0.35 | lacquer | box with open front + incense cup | On the floor beside the door, outside or just inside. | F91, F83, F61 |
| altar | household altar shelf (ancestors or a god) | 0.6 x 0.3 x 0.45 | lacquer | shelf box + lamp + incense cup | High on a wall, top at about 2.0 m. In a shop or workplace it can stand on a cabinet. | F9, F50, F56, F87, F79 |
| calendar | wall calendar, poster, chart, sign or framed photos | 0.35 x 0.01 x 0.5 | paper | flat panel |  | F51, F72 |
| couplet | paper on a door: couplets, a door god or a Fai Chun (揮春) | 0.25 x 0.01 x 1.2 | paper | 2 strips + 1 square | One strip each side of the door and a square on the door. | F10, F91 |
| clock | wall clock | 0.3 x 0.05 x 0.3 | plastic | disc |  | F51, F8 |
| mirror | wall mirror | 1.2 x 0.03 x 0.9 | glass | flat panel |  |  |
| lantern | paper lantern | 0.35 x 0.35 x 0.45 | paper | cylinder |  |  |
| stove | kerosene or gas ring on a tiled bench | 0.8 x 0.5 x 0.85 | tile, metal | bench + ring + pot |  | F52, F56, F92, F19 |
| wok_stove | restaurant wok stove | 1.2 x 0.8 x 0.85 | stainless | box + 2 rings |  |  |
| sink | sink on a tiled bench | 0.6 x 0.45 x 0.85 | tile, stainless | bench + basin |  |  |
| toilet | toilet (squat pan or pedestal) | 0.4 x 0.55 x 0.4 | porcelain | box |  |  |
| washtub | wash basin or tub on the floor | 0.6 x 0.6 x 0.25 | plastic | cylinder |  |  |
| water_drum | drum or tall bucket of stored water | 0.5 x 0.5 x 0.7 | plastic | cylinder |  |  |
| bucket | bucket | 0.3 x 0.3 x 0.35 | plastic | cylinder |  |  |
| tv | television set (CRT) | 0.55 x 0.45 x 0.45 | plastic, wood | box | Stands on a cabinet, a shelf or a fridge. | F2, F7, F50, F103, F12 |
| radio | radio or cassette radio | 0.35 x 0.15 x 0.2 | plastic | box |  |  |
| fan | electric fan (wall fan or stand fan) | 0.45 x 0.3 x 0.5 | metal, plastic | disc + motor + bracket | A wall fan hangs at about 2.0 m. A stand fan is 1.2 m high. | F7, F50, F14 |
| lamp | light: fluorescent tube or bare bulb | 1.2 x 0.08 x 0.08 | glass | tube | Ceiling light. A desk lamp is 0.3 x 0.3 x 0.5 m. | F18, F105 |
| fridge | refrigerator | 0.55 x 0.6 x 1.4 | enamel | box |  | F50, F56, F103, F70 |
| aircon | window air-conditioner | 0.6 x 0.55 x 0.4 | metal | box | In a window or a hole in the outside wall; it sticks out about 0.3 m. | F12, F14, F93, F40 |
| telephone | wall telephone | 0.2 x 0.1 x 0.25 | plastic | box |  | F123, F124, F79 |
| sewing_machine | sewing machine on its table | 1.1 x 0.55 x 0.75 | metal, wood | table + head |  |  |
| machine | generic workshop machine | 1.0 x 0.8 x 1.3 | steel | box + head |  |  |
| press | injection-moulding or heated press | 0.9 x 1.2 x 1.8 | steel | frame + box + hopper |  | F76, F65, F77 |
| lathe | lathe | 1.6 x 0.6 x 1.2 | steel | bed + head + legs |  |  |
| loom | power loom | 1.8 x 1.2 x 1.4 | steel | frame + rollers |  | F122, F131 |
| knitting_machine | knitting or weaving machine | 1.2 x 0.5 x 1.0 | steel | table + bed |  |  |
| noodle_machine | noodle rolling and cutting machine | 1.8 x 0.8 x 1.2 | steel | frame + rollers |  | F67, F69 |
| mixer | dough or meat mixer | 0.8 x 0.8 x 1.0 | steel | bowl + motor |  |  |
| vat | vat or large tub | 0.8 x 0.8 x 0.8 | plastic | cylinder | Plastic, enamel or steel. |  |
| rack | drying rack or tray rack | 1.2 x 0.6 x 1.8 | metal | frame + bars |  |  |
| workbench | work table | 1.8 x 0.7 x 0.85 | wood | top + legs |  |  |
| oven | roasting oven (tall drum) or baker's oven | 1.0 x 1.0 x 1.8 | metal | cylinder | Size is the diameter for the round oven. A roast-meat oven is a tall drum. | F113, F114 |
| steamer | stack of bamboo steamers | 0.5 x 0.5 x 0.4 | bamboo | cylinder stack |  | F73 |
| dental_chair | dental chair | 0.7 x 1.6 x 1.1 | metal, plastic | base + seat + back |  | F45, F83 |
| dental_light | dental unit: lamp and tools on an arm | 0.6 x 0.4 x 1.8 | metal | post + arm + lamp |  | F45, F83 |
| clinic_bed | examination couch | 1.8 x 0.65 x 0.75 | metal, plastic | frame + pad |  |  |
| barber_chair | barber's chair | 0.65 x 0.9 x 1.1 | metal, plastic | base + seat + back |  | F119 |
| mahjong_table | square mahjong table | 0.85 x 0.85 x 0.75 | wood | top + legs |  | F54, F16 |
| pews | pew or long bench with a back | 2.0 x 0.45 x 0.85 | wood | seat + back |  |  |
| lectern | lectern or pulpit | 0.6 x 0.45 x 1.15 | wood | box + slope |  |  |
| incense_burner | incense burner (urn) | 0.35 x 0.35 x 0.3 | metal | cylinder |  | F120 |
| school_desk | small school desk | 1.0 x 0.45 x 0.6 | wood | top + legs |  | F110, F129 |
| blackboard | blackboard | 2.0 x 0.05 x 1.0 | wood | flat panel |  | F129 |
| pigeon_loft | pigeon loft (wood frame, wire mesh) | 3.1 x 1.5 x 2.0 | wood, metal | frame + mesh box |  | F33, F34, F37 |
| birdcage | bird cage | 0.3 x 0.3 x 0.45 | bamboo | cylinder + hook |  | F78, F94 |
| clothes_rack | clothes hung on a rail or hooks | 1.0 x 0.4 x 1.0 | cloth | rail + hanging cloth |  |  |
| laundry_pole | bamboo pole with laundry | 2.0 x 0.04 x 0.04 | bamboo, cloth | pole + hanging cloth |  | F96, F25 |
| plant_pot | potted plant | 0.3 x 0.3 x 0.45 | concrete | pot + plant | Clay, concrete, a tin or a polystyrene box. | F95, F27 |
| tv_aerial | TV aerial on a pole | 1.2 x 0.1 x 3.0 | aluminium | pole + cross bars |  | F25, F29, F31 |
| sign | shop or clinic sign (vertical or horizontal board) | 0.6 x 0.05 x 2.0 | metal | flat panel | A horizontal sign is 1.5 x 0.5 m. | F98, F99, F40 |
| window_cage | metal cage (grille box) outside a window or balcony | 2.0 x 0.6 x 2.4 | steel | open frame + bars |  | F38, F39, F20, F134 |
| awning | awning: canvas or corrugated sheet | 2.0 x 0.8 x 0.05 | cloth | sloped panel |  | F111, F39 |
| washing_machine | twin-tub washing machine | 0.75 x 0.45 x 0.9 | plastic, metal | box + 2 lids | It stands in the kitchen corner. | F55, F12 |
| freezer | chest freezer | 1.2 x 0.65 x 0.9 | metal | box + lid | In a store it often makes the counter. | F58, F128 |
| ladder | ladder: a straight ladder to a cockloft, or an A-frame step ladder | 0.45 x 0.6 x 2.2 | aluminium | 2 rails + rungs | Wood or bamboo also. A straight ladder leans on the wall: 0.45 x 0.1 x 2.4 m. | F124, F79, F69, F112 |
| letterbox | postbox | 0.25 x 0.12 x 0.3 | metal | box + slot | In rows of 4-20 on the wall of a G/F entrance, or as single boxes. | F102 |
| roof_hut | roof hut (home-made annexe) | 3.0 x 2.0 x 2.1 | concrete, wood, corrugated sheet | box + door + barred window + sheet roof |  | F145, F132 |

## Notes and open items

STATUS (2026-11-06, second pass): the main parts are done. The open items are at the end.

Method: I read the book text with OCR, and four agents read each photo spread against the page image. I checked every quote from the book against the OCR text. Where the OCR missed a quote, I checked the quote on a crop of the page image.

Second pass: all quotes of pp1-61 and pp264-327 match the pages word for word. Two quotes had characters that are not clear (pp188 and 209). I replaced them with captions of the same pages. I loaded pp304-310 again: p309 shows the inside of the Old People's Centre (B56). p310 shows the muslin factory (B69). pp304, 306 and 307 show only doorways and portraits. The Kai Fong office (B10) comes from pp180-181 and p40. The photos of 'The Well' (pp262-263) belong to M18, not B33: the map of the book gives p262 for place 18.

How to use a recipe: put the 'telling' items first, then the other items. If a recipe has 'variants', pick one variant for each unit by its share, then use the common 'items' and the variant 'items'. For a 'per_m2' item, multiply by the unit area and round. Use at least 1. If an item says 'Only in a room of N m2 or more', skip it in a smaller room. Place 'door' = beside the unit door; 'window' = at an outside wall; 'outside_window' = on the outside of the outside wall. In 'rooms', an item that stands for another thing says so in its note.

Keep the counts low. A room with the right machine, the altar and the calendar tells more than a full room.

Date of the photos: most are 1987-1992 (calendars: 10 March 1989, 31 March 1989, 21 July 1989, 27 October 1990; a 1987 calendar). I use them for December 1986 because the fittings changed slowly. The number of air-conditioners grew in the late 1980s (p228).

Still open:

1. The home shares of TV, fridge, washing machine and air-conditioner come from about 10 home photos. More photos can change them.

2. The share of the bedspace_room and the split of large flats are inferred.

3. The items of the shoe, sewing, jewellery, electrical, plating, handbag and paper variants are inferred: no photo shows these trades.

4. The book puts the Old People's Centre in the old magistrate's buildings, but data/room_uses.json puts B56 at 172:2:1. I did not change data/room_uses.json.

Sources not used: the fold-out panorama and the 大図解 panorama (reconstructions); rioleo.org (an unofficial copy of part of the book).

## Facts

| Id | Fact | Source | Cite | Quote | Basis |
|---|---|---|---|---|---|
| F1 | Yau Lap Cheong (邱立昌), an old man, lived alone in a one-room flat of about 120 sq ft (11 m2). It had a tiny kitchen and a washroom, and no windows. | Girard and Lambot, City of Darkness Revisited (2014), photo caption | p24 | "his simple one-room apartment that probably measured no more than 120 square feet, including the tiny kitchen and an even smaller washroom/lavatory" | sourced |
| F2 | Yau Lap Cheong had a radio and a television in his room. | Girard and Lambot, City of Darkness Revisited (2014), photo caption | p24 | "with only his radio and television for diversion" | sourced |
| F3 | Law Yu Yi (羅婉儀) (90) and her daughter-in-law lived in a small, windowless third-floor flat off Lung Chun First Alley. | Girard and Lambot, City of Darkness Revisited (2014), photo caption | p80 | "lived in a small, windowless and exceptionally humid third-floor apartment off Lung Chun First Alley with her 68-year-old daughter-in-law" | sourced |
| F4 | The Kai Fong vice-president said that most residents lived in small flats of about 200 sq ft (19 m2). | Girard and Lambot, City of Darkness Revisited (2014), interview with Chan Hip Ping (陳協平) (1987-1992) | p180 | "most of the residents live in relatively small flats, around 200 square feet." | sourced |
| F5 | In 1987 the clearance survey counted 28,200 occupants in 8,800 separate flats: about 3.2 people for each flat. | Girard and Lambot, City of Darkness Revisited (2014), McHugh essay quoting the 1987 figures | p340 | "28,200 occupants residing in 8800 separate apartments" | sourced |
| F6 | Chung Yuk Yee's flat of 230 sq ft (21 m2) had no windows. A thin wooden partition made two rooms: a bedroom for four people and a living room for mahjong. | Girard and Lambot, City of Darkness Revisited (2014), photo caption | p159 | "Just 230 square feet in area, it was divided into two rooms by a thin wooden partition." | sourced |
| F7 | In Chung Yuk Yee's bedroom the children watched television; electric fans were the only relief against the heat. | Girard and Lambot, City of Darkness Revisited (2014), photo caption | p160 | "watch television in the small bedroom they share with their parents, with electric fans the only relief against the summer heat." | sourced |
| F8 | Chung Yuk Yee's flat was so dark that she looked at a clock to know the time. | Girard and Lambot, City of Darkness Revisited (2014), interview with Chung Yuk Yee (about 1990-1991) | p161 | "I have to look at the clock to work out what the time is." | sourced |
| F9 | Many flats had a small family shrine with offerings of food and incense. | Girard and Lambot, City of Darkness Revisited (2014), photo caption | p154 | "many of the City's apartments were protected by a small family shrine, which was regularly blessed with fresh offerings of food and incense" | sourced |
| F10 | Printed posters on the flat doors were put up at Chinese New Year and stayed for the whole year. | Girard and Lambot, City of Darkness Revisited (2014), photo caption | p154 | "The printed posters seen in these photographs had been put up to mark the beginning of the Chinese New Year and to ensure a harmonious and safe household over the coming 12 months." | sourced |
| F11 | Before he bought a flat (before about 1981), Yim Kwok Yuen (嚴國源) rented a room in the City. Eight single men lived in its 200 sq ft. | Girard and Lambot, City of Darkness Revisited (2014), interview with Yim Kwok Yuen (1987-1992) | p289 | "I rented a place here in the City - eight single men lived in a room of 200 square feet." | sourced |
| F12 | Yim Kwok Yuen owned two flats in the City; in his home he had an air-conditioner, a television and a washing machine. | Girard and Lambot, City of Darkness Revisited (2014), interview with Yim Kwok Yuen (1987-1992) | p289 | "We have an air-conditioner, though we only use it on the hottest days; we also have a television and a washing machine." | sourced |
| F13 | Lau Yeung Yin's (劉陽賢) family lived in their weaving factory when he was a child (1960s); they slept on the floor among the yarn. | Girard and Lambot, City of Darkness Revisited (2014), interview with Lau Yeung Yin (about 1990-1991) | p48 | "We lived in the factory. There were no beds; we just moved the yarn and cleared a space when we wanted to sleep." | sourced |
| F14 | Wong Hoi Ming (王海明), the bonesetter, lived and cooked in his clinic; he had two air-conditioners and a fan, and shared a bathroom outside. | Girard and Lambot, City of Darkness Revisited (2014), interview with Wong Hoi Ming (1987-1992) | p233 | "Both air-conditioners work, but one's too noisy so I normally only use the one and keep the fan on all day instead." | sourced |
| F15 | Wong Hoi Ming cooked his own food in his clinic flat. | Girard and Lambot, City of Darkness Revisited (2014), interview with Wong Hoi Ming (1987-1992) | p233 | "It's alright to cook here as well; I always prepare my own food." | sourced |
| F16 | Wong Hoi Ming's clinic once held two mahjong tables; he stopped this a few years before the interview. | Girard and Lambot, City of Darkness Revisited (2014), interview with Wong Hoi Ming (1987-1992) | p233 | "There was a time when I let people play mahjong here. There was room for two tables" | sourced |
| F17 | The Old People's Centre (老人中心) gave a daily afternoon tea and television. | Girard and Lambot, City of Darkness Revisited (2014), caption | p306 | "a daily afternoon tea, and television - for many an unaffordable luxury." | sourced |
| F18 | Lambot (2019): tungsten bulbs lit the flats and fluorescent tubes lit the corridors (reporter's words). | HK01 (香港01), interview with Girard and Lambot, 8 May 2024 (retrospective) | primary-sources/retrospective-testimony-web/SOURCE.md | "單位裏的鎢絲燈、走廊的光管" | sourced |
| F19 | A boy and his father lived in a windowless room of 10 x 10 ft. It had a folding table and an electric table-top stove. 20 families shared one toilet and a kitchen (year not given). | Talk Irvine forum, bkshopr_IHB, 28 Aug 2009 (retrospective) | https://www.talkirvine.com/threads/a-glimpse-of-my-life-experience.10174/ | "Our house (room) was 10'x10' with a folding table where I did my homework, father cooked our meals with an electric table top camp stove" | sourced |
| F20 | Metal cages 4 ft deep were bolted to the outside walls and let to old men (year not given). | Talk Irvine forum, bkshopr_IHB, 28 Aug 2009 (retrospective) | https://www.talkirvine.com/threads/a-glimpse-of-my-life-experience.10174/ | "4 foot deep Metal cages from floor to ceiling were bolted to the exterior like balconies for renting to old men without a family." | sourced |
| F21 | Yip Tak-wai: at the demolition many homes were nicely furnished. | SCMP, 4 Jan 2013 (retrospective), as noted in primary-sources/retrospective-testimony-web/SOURCE.md | retrospective-testimony-web/SOURCE.md (Albert Ng and Yip Tak-wai) | "a lot of the homes were quite nicely furnished" | sourced |
| F22 | In the 1960s the Heung family of six lived in a room of 70 sq ft. They ate from a board over a knitting machine and sat on the bed. | The Travel Club (text from SCMP 2013), Heung Yin-king (retrospective) | https://www.thetravelclub.org/articles/travelogues/664-kowloon-walled-city-life-in-the-city-of-darkness | "We ate from a board laid over the knitting machine and sat on the bed." | sourced |
| F23 | Albert Ng's family flat (7/F, 8 Sz Kung St) had one bedroom and about 200 sq ft. The bedroom was for his mother and sister. | Beijing Visitor, Albert Ng (retrospective, after 2013) | https://www.beijing-visitor.com/hong-kong-culture/kowloon-walled-city | "I used to live in a one bedroom flat and it used to be about 200 square feet." | sourced |
| F24 | A 13/F (top floor) flat had a hall, three rooms, a toilet and a kitchen. | 大紀元時報（香港）, 袁家倫, 5 May 2024 (retrospective) | https://hk.epochtimes.com/news/2024-05-05/28556552 | "一廳三房，有廁有廚房" | sourced |
| F25 | Popham (who visited before the demolition): washing hung between the TV aerials; old TV sets, furniture and bedsprings were left on the roofs. | Girard and Lambot, City of Darkness Revisited (2014), Peter Popham essay (2014, his memory) | p6 | "Washing was strung up between the thousand television aerials." | sourced |
| F26 | Broken furniture and old TV sets were carried up to the roofs and left there. | Girard and Lambot, City of Darkness Revisited (2014), Peter Popham essay (2014, his memory) | p6 | "old television sets, broken furniture, worn-out clothes, bedsprings and the like - they lugged up to the roof and abandoned." | sourced |
| F27 | The roofs held small private gardens, tangles of TV aerials and cables, washing lines and illegal structures. | Girard and Lambot, City of Darkness Revisited (2014), caption (Life on the Roof) | p312 | "There were small private gardens, tangles of television aerials and cabling, washing lines, makeshift water tanks" | sourced |
| F28 | Children played and did homework on the roofs after school. | Girard and Lambot, City of Darkness Revisited (2014), caption (Life on the Roof) | p322 | "the roof thronged with children out of school hours, either playing noisily or sitting quietly to one side doing their homework." | sourced |
| F29 | TV antennae stood at the eye level of a child on the roofs. | Girard and Lambot, City of Darkness Revisited (2014), caption | p324 | "Children at play on the roof of the Walled City, among television antennae precariously positioned at the eye level of a six year old." | sourced |
| F30 | Residents went up to the roofs for a chat and the cool night air. | Girard and Lambot, City of Darkness Revisited (2014), caption | p316 | "for a quiet chat and to enjoy the cool night air" | sourced |
| F31 | Girard's 1989 photo of a roof shows dense TV aerials on poles, cables, a folding chair and a pillow. | M+ 2018.2, Greg Girard, Children on Rooftop (1989) | primary-sources/mplus-girard-lambot-photos/local/mplus-20182_008351_003.jpg | "Kowloon Walled City—Children on Rooftop (1989, printed 2015)" | sourced |
| F32 | Suenn Ho filmed a roof garden in 1991-1992. | M+ CA17/1/1, Suenn Ho, video cassette 1 | primary-sources/mplus-suenn-ho-ca17/local/CA17-1-1.html | "Video footage, Kowloon Walled City research project, cassette 1, routes 1- 6 and roof garden" | sourced |
| F33 | Chan Kwan Leung (陳昆亮) built pigeon cages on the roof in about 1981-82. | Girard and Lambot, City of Darkness Revisited (2014), interview with Chan Kwan Leung (1987-1992) | p319 | "I think it was around 1981 or '82 when I built my pigeon cages on the roof." | sourced |
| F34 | He had two cages on the roof; the roof cost $1500 a month; he closed the business in January 1987. | Girard and Lambot, City of Darkness Revisited (2014), interview with Chan Kwan Leung (1987-1992) | p320 | "Government officials say they will only compensate me $4000 for the two cages" | sourced |
| F35 | At one stage he kept more than 1000 pigeons. | Girard and Lambot, City of Darkness Revisited (2014), interview with Chan Kwan Leung (1987-1992) | p319 | "At one stage, I had more than 1000." | sourced |
| F36 | He closed the pigeon business in January 1987, on the day of the clearance survey. Thus the lofts were in use in December 1986. | Girard and Lambot, City of Darkness Revisited (2014), interview with Chan Kwan Leung (1987-1992) | p320 | "I decided to close my pigeon business in January 1987" | sourced |
| F37 | Before the roof lofts, he had a pigeon cage more than 10 ft long built in his flat. | Girard and Lambot, City of Darkness Revisited (2014), interview with Chan Kwan Leung (1987-1992) | p319 | "I had a cage built in my apartment that was more than 10 feet long." | sourced |
| F38 | Caged balconies, called 'buildings on buildings', held bedding, washing, plants, birdcages and seats. | Girard and Lambot, City of Darkness Revisited (2014), caption | p19 | "Bedding out to air, washing out to dry, plants being tended, birdcages and seats for taking in the view, whatever use these 'buildings on buildings' - as the caged balconies were known" | sourced |
| F39 | Lambot's 1990 photo shows a facade with a full-width grille cage on each floor, with laundry, plants, awnings, buckets and a bicycle. | M+ 2017.410, Ian Lambot, Caged Balconies (1990) | primary-sources/mplus-girard-lambot-photos/local/mplus-2017410_008347_003.jpg | "Kowloon Walled City—Caged Balconies (1990, printed 2015)" | sourced |
| F40 | Girard's 1987 photo of the Tung Tau Tsuen Road (東頭村道) facade. It shows many hanging signs on the lower floors, potted plants on the balconies and window air-conditioners and grilles. | M+ 2018.4, Greg Girard, Tung Tau Tsuen Road facade (1987) | primary-sources/mplus-girard-lambot-photos/local/mplus-20184_008349_003.jpg | "Kowloon Walled City—Tung Tau Tsuen Road facade (1987, printed 2015)" | sourced |
| F41 | Lambot's photo of the south-east facades shows grilles, laundry and plants at most upper-floor windows, and TV aerials on the roofs. | Wikimedia Commons, Ian Lambot, KWC - Playground | primary-sources/commons-photos-1972-1993/KWC - Playground.jpg | "A playground at the edge of the city." | sourced |
| F42 | Lambot's alley photo shows letterboxes on the wall, a fluorescent tube, corrugated awnings and stacked baskets in the lane. | Wikimedia Commons, Ian Lambot, KWC - Alley | primary-sources/commons-photos-1972-1993/KWC - Alley.jpg | "KWC - Alley" | sourced |
| F43 | Lambot's night photo shows lit fluorescent tubes in many flats, window air-conditioners and grilles, and signs on the low floors. | Wikimedia Commons, Ian Lambot, KWC - Night | primary-sources/commons-photos-1972-1993/KWC - Night.jpg | "A street at the edge of the city at night." | sourced |
| F44 | The Kai Fong Association (九龍城寨街坊福利會) put up posters in the lanes, for example against fire and for clean streets (WSJ narration). | Wall Street Journal, Kowloon Walled City project, 2014 (narration) | primary-sources/wsj-kwc-2014/SOURCE.md | "Prevent Fire: Protect Your Life and Property" | sourced |
| F45 | David Brian's photo (about 1987/88) of the G/F dentist 凌生牙科. It shows a dental chair, a dental unit with a lamp arm and a ceiling light. It also shows glass shelves and a glass case, a cabinet and wall tiles and a terrazzo floor. | Gwulo media 19655, David Brian | https://gwulo.com/media/19655 | "Dentist on the ground floor of the former Kowloon Walled city - taken around 1987/88" | sourced |
| F46 | The Kai Fong Association held an annual Christmas party for elderly residents in a large room off its office (3/F, 16 Tung Tau Tsuen Road). | Girard and Lambot, City of Darkness Revisited (2014), caption | p180 | "A large room off the office itself was the scene of many official functions, including an annual Christmas party for elderly residents." | sourced |
| F47 | The Rotary Club came each year with Christmas gifts to the Old People's Centre, and bought chairs for it. | Girard and Lambot, City of Darkness Revisited (2014), interview with Reverend Isaac Liu (劉知三) (about 1991) | p305 | "each year, they come with Christmas gifts. They still buy us chairs and pay for necessary repairs." | sourced |
| F48 | A family on 12/F gave the postman a Christmas card every year. | Girard and Lambot, City of Darkness Revisited (2014), interview with Lam Po Chun (林寶鎮) (2014, retrospective) | p149 | "every year they gave me a Christmas card." | sourced |
| F49 | In Hong Kong, ancestral worship takes place on the Winter Solstice among other dates, and it can take place at home. | Hong Kong Memory (香港記憶), Leisure and Cultural Services Department, 'Ancestral Worship' (Intangible Cultural Heritage of Hong Kong) | https://www.hkmemory.hk/en/collections-ichhk_ii-spring_and_autumn_ancestral_worship_of_clans-ancestral_worship.html | "Ancestral worship may take place at home, at the ancestral hall or at the graveyard." | sourced |
| F50 | Photo of Law Yu Yi's flat. It shows a metal bed with angle-iron racks above it for quilts and boxes. It also shows a wall fan over the door, a folding table, a folding chair and a bench. A high wall altar holds 3 offering cups. A small TV stands on a small fridge. It also shows a wood counter with bowls and pots, and bags on hooks. The walls are painted and the floor is mosaic. A tiled door leads to the kitchen or the washroom. | Girard and Lambot, City of Darkness Revisited (2014), photo | p81 | "Law Yu Yi, aged 90, lived in a small, windowless and exceptionally humid third-floor apartment" | sourced |
| F51 | Photo of a wall in Law Yu Yi's flat: two wall clocks, three framed photo collages and a tear-off calendar. The day sheet reads Friday 31, lunar day 24: 31 March 1989. | Girard and Lambot, City of Darkness Revisited (2014), photo | p80 | "31 FRIDAY 星期五 廿四日" | sourced |
| F52 | Photo of Yau Lap Cheong's room. It shows a bed with a quilt, a rattan armchair, a wall fan, clothes on hooks and a table lamp. It also shows a small kitchen with a gas ring and pots on a tiled bench and a hexagon mosaic floor. | Girard and Lambot, City of Darkness Revisited (2014), photo | p25 | "Yau Lap Cheong in his simple one-room apartment" | sourced |
| F53 | Photo of Chung Yuk Yee's bedroom. It shows a metal bunk (the upper tier holds quilts and a suitcase) and a child's crib. It also shows a chest of drawers with a small TV on it and three electric fans. It also shows laundry on a peg hanger. | Girard and Lambot, City of Darkness Revisited (2014), photo | p160 | "Chung Yuk Yee's two small children watch television in the small bedroom they share with their parents" | sourced |
| F54 | Photo of Chung Yuk Yee's living room. It shows a square mahjong table with stools and a plywood partition with a poster. It also shows a rail of clothes on hangers and a diamond paper. | Girard and Lambot, City of Darkness Revisited (2014), photo | p159 | "a living room where family and friends gathered occasionally to play mahjong." | sourced |
| F55 | Photo of Chung Yuk Yee's kitchen corner. It shows a twin-tub washing machine, a stove with a pot on a tiled bench and a shelf of bowls. It also shows a plastic tub (a bath for her son), a small plastic chair and a jerry can. | Girard and Lambot, City of Darkness Revisited (2014), photo | p161 | "bathing her son and daughter in the murky water" | sourced |
| F56 | Photos of Chung Lo Ying's flat (4/F, 82 Lung Chun Road (龍津道)). They show a dinner table with stools and chairs and a sofa or bench. They also show a TV on a chest of drawers, a wood sideboard, a glass display cabinet and a fridge. They also show a ceiling fan, a high wall altar with 3 electric candles and a floor shrine with fruit. They also show a god picture and New Year papers. They also show wall tiles. They also show a gas ring on a tiled kitchen bench with a small shrine shelf. | Girard and Lambot, City of Darkness Revisited (2014), photos | pp156-158 | "Chung Lo Ying's small but tidy apartment opened onto fresh air and views of the park" | sourced |
| F57 | Photo of the living area behind Lee Pui Yuen's (李培元) store. It shows a double bed with a wood headboard, a wood cabinet, a folding chair and a wall fan. It also shows a long high shelf of stock and clothes on hooks on a plywood partition. | Girard and Lambot, City of Darkness Revisited (2014), photo | pp94-95 | "Just a simple partition separated Lee Pui Yuen's store from a small living area at the back of the shop, where Lee slept with his wife and son." | sourced |
| F58 | Photo of Lee Pui Yuen's store counter. It shows two chest freezers as the counter, a cigarette cabinet with a glass front and a telephone. It also shows wooden wall shelves with toilet rolls and tins, sweet jars and a wall clock. | Girard and Lambot, City of Darkness Revisited (2014), photo | p92 | "selling the basic necessities - rice, tinned fish, condensed milk and toilet paper" | sourced |
| F59 | Photo of the corner store at Lung Chun Back Road (龍津後街) and Tai Chang Street (大井街). It shows a lit glass-front drinks fridge, slotted-angle shelves of bottles, snack bags on ceiling hooks, crates and boxes. It also shows a folding stool. | Girard and Lambot, City of Darkness Revisited (2014), photo | pp90-91 | "this was one of the City's busiest stores" | sourced |
| F60 | Photo of Chan Pui Yin's (陳沛然) shop. It shows floor-to-ceiling glass-front shelves, two glass counter cases, a metal rack, a wall fan and a fluorescent tube. It also shows glass medicine jars on the herbal side. | Girard and Lambot, City of Darkness Revisited (2014), photo and caption | pp82-83 | "Chan Pui Yin's shop was divided into two parts, with Chinese medicines on one side and Western toiletries on the other." | sourced |
| F61 | Photo of the water supplier's room. It shows a floor hatch over the pump and a display cabinet with a lamp-lit floor shrine in its base. It also shows kettles. It also shows wall tiles, mosaic floor and a fluorescent tube. | Girard and Lambot, City of Darkness Revisited (2014), photo | p112 | "Usually concealed behind a floor panel, the pump would be switched on" | sourced |
| F62 | Photos of Lee Yu Chun's (李玉珍) candy factory. They show a candy machine with a cooling tray, and sugar sacks and boxes stacked to the ceiling. Outside, a row of wooden tables and stools stands in the alley for wrapping. They also show aluminium trays, a desk fan and a radio-cassette. | Girard and Lambot, City of Darkness Revisited (2014), photos and caption | pp77-79 | "all the wrapping and packaging took place on tables set out along the alley" | sourced |
| F63 | The candy factory had six automatic machines. | Girard and Lambot, City of Darkness Revisited (2014), interview with Lee Yu Chun (1987-1992) | p76 | "We actually have six of them which are worth quite a lot of money" | sourced |
| F64 | Chan Kwong's golf-ball factory used automatic machines, at times 24 hours a day. | Girard and Lambot, City of Darkness Revisited (2014), interview with Chan Kwong (about 1989-1990) | p88 | "after a few years I started to use automatic machines. At times, I was operating 24 hours a day." | sourced |
| F65 | Photo of a plastics workshop. It shows 5-6 injection-moulding machines (about 2-3 x 0.8 x 1.5 m) in rows and resin sacks. It also shows a 200 L oil drum, crates, an extractor fan in the wall and a wall fan. It also shows a wall clock. It also shows 6+ fluorescent tubes on a low ceiling. | Girard and Lambot, City of Darkness Revisited (2014), photo | pp162-163 | "Plastics factories were abundant in the City, particularly those pressing simple moulds or tooling cheap toys." | sourced |
| F66 | Photo of a plastics factory aisle. It shows 40+ woven sacks of pellets stacked about 1.5 m high and an oil drum. It also shows 2-3 moulding machines with hoppers and a high shelf. | Girard and Lambot, City of Darkness Revisited (2014), photo | p231 | "Small family-run factories, whether for the making of noodles (left) or plastic components (right) were to be found throughout the City" | sourced |
| F67 | Photos of Hui Tung Choy's (許東財) noodle factory (about 200 sq ft). They show a noodle machine with steel rollers, flour sacks on a shelf and a flour-crusted workbench. They also show a steel cabinet with a small TV, a wall telephone, a wall fan, a folding table and stools. The family used the factory as a living room at night. | Girard and Lambot, City of Darkness Revisited (2014), photos and captions | pp170-173 | "A workplace during the day became a living room at night" | sourced |
| F68 | Hui Tung Choy's family had a flat upstairs, but cooked, showered and did homework in the factory. | Girard and Lambot, City of Darkness Revisited (2014), interview with Hui Tung Choy (about 1992) | p173 | "We have a flat up above but we cook and take our showers here" | sourced |
| F69 | Photos of Chan Wai Shui's (陳偉瑞) noodle factory. They show stacked flour sacks, a flour-coated workbench and 2-3 noodle machines. They also show a long pastry table and a bamboo press pole. They also show a tall floor-standing god cabinet with an incense burner and an earth-god niche and a couplet. They also show a tear-off calendar. An A-frame ladder stands against the wall. | Girard and Lambot, City of Darkness Revisited (2014), photos | pp226-228 | "We use a machine to stir the flour, but rub it manually and flatten it by pressing on a long pole." | sourced |
| F70 | Chan Wai Shui's noodle factory had a big fridge for the ingredients. | Girard and Lambot, City of Darkness Revisited (2014), interview with Chan Wai Shui (1987-1992) | p228 | "We have a big fridge, that cost more than $70,000, in which we store all the ingredients." | sourced |
| F71 | Chan Wai Shui's office was a flour-dusted desk with two telephones, ledgers and an abacus. | Girard and Lambot, City of Darkness Revisited (2014), photo caption | p229 | "a liberal dusting of flour coated the desk that served as Chan Wai Shui's office." | sourced |
| F72 | Flour covered every surface in a noodle-maker's premises; a tear-off calendar on its wall reads Saturday 27 October 1990. | Girard and Lambot, City of Darkness Revisited (2014), photo caption | p89 | "A close-up view inside a noodle-maker's premises reveals the dusting of flour that covered every surface." | sourced |
| F73 | Photos of Law Kim Kwong's (羅儉光) bakery. They show a long masonry fire range, 5 large steamer pots and a steel rack of bamboo trays. They also show metal trays of small porcelain cake bowls, flour sacks and tins. | Girard and Lambot, City of Darkness Revisited (2014), photos and caption | pp182-183 | "Baker Law Kim Kwong had worked overnight to finish these steamed sweet cakes for a Chiu Chow festival." | sourced |
| F74 | Photo of Cheng San's (鄭山) ruler workshop (about 600 sq ft). It shows a table saw, 2 pedestal fans, timber stacks to the ceiling, a wall shelf, sacks and a handcart. It also shows 2 fluorescent tubes. | Girard and Lambot, City of Darkness Revisited (2014), photo and interview | pp168-169 | "I have about 600 square feet." | sourced |
| F75 | Cheng San slept in his workshop at night against thieves. | Girard and Lambot, City of Darkness Revisited (2014), interview with Cheng San (about 1990) | p169 | "I have to stay here at night otherwise the drug addicts would steal everything." | sourced |
| F76 | Photos of To Gui Bon's (杜古邦) rubber factory. They show a heated press, a table for cutting the rubber sheets and an old electric fan on a stand. They also show a drill on a stand, a workbench with drawers, two calendars and a fire extinguisher. They also show stacks of rubber sheets. | Girard and Lambot, City of Darkness Revisited (2014), photos and caption | pp237-239 | "To Gui Bon's part-time assistant works the heated press that stamps out the individual plungers" | sourced |
| F77 | Photos of metal workshops: a lathe with a work lamp and a tool rack; two power presses with a stool and a basket of parts. | Girard and Lambot, City of Darkness Revisited (2014), photos and caption | pp256-257 | "Metal workshops employing large machinery were almost invariably located on the ground floor" | sourced |
| F78 | Many workers kept a bird in a cage in their workshop. | Girard and Lambot, City of Darkness Revisited (2014), photo caption | p256 | "Machine repairer Yu Kwok Fai (below) was one of the many workers who kept a bird in his small workshop." | sourced |
| F79 | Photo of a factory office (1987 calendar). It shows a desk with two telephones. It also shows a wooden shelf unit with a god niche and electric candles on the top shelf. It also shows paper couplets on a cabinet, a ladder and a hanging-scroll calendar. | Girard and Lambot, City of Darkness Revisited (2014), photo and caption | pp250-251 | "stop by at one of the Walled City's factories to make a call back to the police station." | sourced |
| F80 | Photo of a factory doorway on Lo Yan Street (老人街). It shows a metal desk with a newspaper and a telephone, a chrome chair and a tall steel cabinet. It also shows a caged wall fan and a collapsible gate. | Girard and Lambot, City of Darkness Revisited (2014), photo and caption | p236 | "A factory on Lo Yan Street, the City's main north-south artery." | sourced |
| F81 | Photos of Dr Tsin Mu Lam's (錢茂林) clinic (2/F, 10 Tung Tau Tsuen Road). They show a glass-topped desk with an X-ray light box and a desk fan and a stool for the patient. They also show a framed acupuncture chart, framed certificates and a wall calendar. They also show the room is small (about 2 x 2.5 m). | Girard and Lambot, City of Darkness Revisited (2014), photos and captions | pp184-186 | "An acupuncture chart and an X-ray: like all China-trained doctors, Tsin Mu Lam combined traditional Chinese and Western medical practices." | sourced |
| F82 | Dr Tsin Mu Lam worked and lived in his clinic with his wife and son. | Girard and Lambot, City of Darkness Revisited (2014), caption | p184 | "worked and lived there with his wife and son until it was closed in 1992" | sourced |
| F83 | Photo of a clean dental clinic on Lung Chun Road. It shows a dental chair, a dental light on an arm and a dental unit with a spittoon. It also shows glass wall shelves, mirror panels, a wall clock, a floor air-conditioner and a small altar shelf with offerings. It also shows a floor shrine with oranges, a stool and glass partitions. | Girard and Lambot, City of Darkness Revisited (2014), photo and caption | p243 | "An unusually clean clinic (not Cheng Koon Yiu's) on Lung Chun Road" | sourced |
| F84 | Dentists showed dentures in a glass case in the street window (a March 1989 calendar shows). | Girard and Lambot, City of Darkness Revisited (2014), photo and caption | p244 | "False teeth were usually made to measure, but it was not unusual for poorer patients to buy a used set" | sourced |
| F85 | Dentist Cheng Koon Yiu's (鄭冠耀) family slept on the floor of the clinic. | Girard and Lambot, City of Darkness Revisited (2014), interview with Cheng Koon Yiu (about 1989) | p245 | "We have to sleep on the floor" | sourced |
| F86 | The dental equipment cost just over $5000. Hire purchase was possible. | Girard and Lambot, City of Darkness Revisited (2014), interview with Cheng Koon Yiu (about 1989) | p245 | "the equipment cost just over $5000 and could be obtained on hire purchase." | sourced |
| F87 | Photo of Wong Hoi Ming's one-room home and clinic. It shows a bed and a high wall altar with 4-5 god figures and 2 electric candles. It also shows a wood table with a teapot and a telephone and a cabinet with New Year papers. It also shows a glass case with a lamp, a tall porcelain vase and a potted palm. It also shows wood-panelled walls. | Girard and Lambot, City of Darkness Revisited (2014), photo | p232 | "Born in the Chiu Chow region of Guandong Province in 1920" | sourced |
| F88 | Photos of 'The Well', the mission of Jackie Pullinger's (潘靈卓) St Stephen's Society (M18). They show rows of folding chairs, wall fans, hymn sheets on the wall and a fabric hanging with a cross. Tinsel garlands hang from the ceiling. A foil-letter banner reads '...CHRIST...' (a Christmas banner, partly hidden). | Girard and Lambot, City of Darkness Revisited (2014), photos and caption | pp262-263 | "Healing hands, hymns and open confession to God were the essential elements of daily prayer at 'The Well'" | sourced |
| F89 | An alley sign names the Norwegian Lutheran Mission, Hsin On Chapel and Hsin On School, with a cross. | Girard and Lambot, City of Darkness Revisited (2014), photo | p252 | "NORWEGIAN LUTHERAN MISSION / HSIN ON CHAPEL / HSIN ON SCHOOL" | sourced |
| F90 | Tin Hau Temple (天后廟) had a tiled roof under a metal mesh grill that caught the refuse from the flats around it. | Girard and Lambot, City of Darkness Revisited (2014), photo and caption | pp240-241 | "the metal grill protecting it from all manner of refuse dispatched from the surrounding apartments" | sourced |
| F91 | Photos of a Tung Tau Tsuen Road stair landing. They show steel grille doors and a floor shrine with oranges and an incense pot by a door. They also show incense tins on the wall and couplets 平安二字值千金 / 和順滿門添百福 and a head paper 鴻禧高照 on a door. | Girard and Lambot, City of Darkness Revisited (2014), photos | pp154-155 | "many of the City's apartments were protected by a small family shrine" | sourced |
| F92 | Every family used an LP gas cylinder for cooking. | Girard and Lambot, City of Darkness Revisited (2014), interview with Chan Hip Ping (1987-1992) | p179 | "Every family here uses an LP gas cylinder, which is a bit like keeping a bomb in your home." | sourced |
| F93 | By about 1990 there were many air-conditioners in the City. | Girard and Lambot, City of Darkness Revisited (2014), interview with Chan Wai Shui (1987-1992) | p228 | "Now there are too many of them and their exhausts pollute the environment." | sourced |
| F94 | The caged balconies showed songbirds in bamboo cages, pot plants and washing. | Girard and Lambot, City of Darkness Revisited (2014), caption | p150 | "whether songbirds in bamboo cages or pot-plants. Even the washing helped identify the make-up of a family or their age." | sourced |
| F95 | Photo of caged balconies: 20+ clay plant pots, laundry on the rails, small fishbone TV aerials fixed to the balconies, corrugated awnings. | Girard and Lambot, City of Darkness Revisited (2014), photo | p96 | "(no caption)" | sourced |
| F96 | Photo of older brick buildings with rows of laundry poles out of the windows and a cage box on one window. | Girard and Lambot, City of Darkness Revisited (2014), photo | p97 | "Inevitably, the rusty sign advertised a dental practice." | sourced |
| F97 | Washing hung in the alleys where there was room. | Girard and Lambot, City of Darkness Revisited (2014), caption | p103 | "Where space permitted, washing would be hung out to dry." | sourced |
| F98 | At dusk on Tung Tau Tsuen Road more than 20 vertical and horizontal signs hung on the facade, many for dentists and clinics. | Girard and Lambot, City of Darkness Revisited (2014), photo and caption | p152 | "Dusk on the Tung Tau Tsuen Road side of the City." | sourced |
| F99 | Signs painted on walls and beams gave directions to buildings and businesses. | Girard and Lambot, City of Darkness Revisited (2014), caption | p175 | "Signs painted directly on to the walls and beams offered directions to other buildings and nearby businesses." | sourced |
| F100 | Small stores opened on the upper floors; one corridor store had a concrete counter with a window, shelves of goods and soft-drink crates. | Girard and Lambot, City of Darkness Revisited (2014), photo and caption | pp174-175 | "enterprising residents opened small convenience stores at different floor levels" | sourced |
| F101 | Corridors held packing of factory goods and family washing. | Girard and Lambot, City of Darkness Revisited (2014), caption | p176 | "In one corridor, you might find the products of a local plastics factory being packaged for delivery, while in another the family washing would have been put out to dry." | sourced |
| F102 | Postboxes were in the main G/F entrances of the high-rise buildings. Some stood in rows. Others were single boxes on the wall, as at 94 Lung Chun Road. | Girard and Lambot, City of Darkness Revisited (2014), photos and caption | p188 | "Postboxes were usually found at street level in the main entrances of the high-rise buildings, either in organised ranks (below) or - as at 94 Lung Chun Road (opposite) - as individual boxes tacked haphazardly to the wall." | sourced |
| F103 | Photo of a home in the late 1980s: a fridge with a small TV on top, a stand fan, a plastic stool. | Girard and Lambot, City of Darkness Revisited (2014), photo and caption | p259 | "The younger generation of addicts found in the City in the late '80s preferred to inject the drug." | sourced |
| F104 | Fiona Hawthorne's 1986 sketch shows about six people round a table under one warm light, seen through a diagonal steel lattice. | Girard and Lambot, City of Darkness Revisited (2014), sketch by Fiona Hawthorne (1986) | p210 | "Just two of the dozens of sketches that Fiona Hawthorne completed during her three-month exploration of the Walled City in 1986" | sourced |
| F105 | The Suzuki survey (January 1993) found the empty rooms lit by many fluorescent lights, with painted walls, mosaic tiles and wallpaper. | Girard and Lambot, City of Darkness Revisited (2014), Suzuki survey pages from 『大図解 九龍城』 | p208 | "室内は過剰なほどの蛍光灯に照らされていた" | sourced |
| F106 | The Suzuki survey (January 1993) drew plans of some empty rooms. A small Japanese note on one plan says that 1/F (ceiling about 1.6 m) was probably a bedroom. Some characters of the note are not clear, thus I do not quote it. | Girard and Lambot, City of Darkness Revisited (2014), Suzuki survey pages from 『大図解 九龍城』 | p209 | "a montage of sketches, plans and photographs made by Suzuki and his team during their one-week survey of the then empty City in January 1993" | sourced |
| F107 | In 1964 Lee Pui Yuen shared 300 sq ft with four families, more than 20 people, and had no proper bed space. | Girard and Lambot, City of Darkness Revisited (2014), interview with Lee Pui Yuen (about 1991) | p93 | "Four families, more than 20 people, lived there, in an area of around 300 square feet." | sourced |
| F108 | Lee Pui Yuen and his family slept in the store. | Girard and Lambot, City of Darkness Revisited (2014), interview with Lee Pui Yuen (about 1991) | p93 | "We sleep here in the store" | sourced |
| F109 | Lee Pui Yuen and his wife watched television in the store until they shut it at night. | Girard and Lambot, City of Darkness Revisited (2014), caption | p94 | "the business effectively remained open until Lee and his wife turned off the television, shuttered the shop and went to bed" | sourced |
| F110 | Cheng Koon Yiu's old school on Lung Chun Road had classrooms of about 150 sq ft with 20 to 30 students each. | Girard and Lambot, City of Darkness Revisited (2014), interview with Cheng Koon Yiu (about 1989) | p242 | "Each classroom had an area of about 150 square feet, and there were 20 to 30 students in each class." | sourced |
| F111 | Plastic and metal sheets over the alleys kept off some of the water from above. | Girard and Lambot, City of Darkness Revisited (2014), caption | p249 | "Crudely installed plastic and metal sheeting barely protected passers-by from the worst of the water coursing down from above" | sourced |
| F112 | Where a roof was two or three floors below the next, residents broke a corridor window and put a stool under it. A ladder bridged a one-floor gap. | Girard and Lambot, City of Darkness Revisited (2014), interview with Lam Po Chun (2014, retrospective) | p145 | "bridged the gap with the help of a ladder" | sourced |
| F113 | Photo of a barbecue-meat factory. It shows 2 upright drum ovens (about 1 m across, 1.8 m high). It also shows roast birds and pig halves on a ceiling rail and a tub and a drum of raw meat. It also shows 3 gas cylinders. It also shows walls coated in soot. | Girard and Lambot, City of Darkness Revisited (2014), photo and caption | pp6-7 | "Food factories, like this one preparing barbecued meat, were a dramatic yet utterly commonplace example of the Walled City's unregulated reality." | sourced |
| F114 | Huge drum ovens were standard in the City's roast-meat workshops; Yim Kwok Yuen's workshop had 1-2 ovens, a wall fan, a bench, tubs and buckets. | Girard and Lambot, City of Darkness Revisited (2014), photos and caption | pp286-288 | "Huge cylindrical ovens were standard for the commercial roasting of chicken, geese and pigs." | sourced |
| F115 | Yim Kwok Yuen kept the meat in a refrigerator and had fans in the workshop. | Girard and Lambot, City of Darkness Revisited (2014), interview with Yim Kwok Yuen | p289 | "we cut it, wash it and put it in the refrigerator. We normally have 10 or more pigs in stock." | sourced |
| F116 | Photo of Lam Mei Kwong's dental clinic, 4A Lung Shing Road (龍城路). It shows an enamel dental unit with a spittoon, a dental light on an arm and an instrument cabinet. It also shows a carved chair, a counter with a tap, two framed charts, a clock and a glass-front cabinet. It also shows a fluorescent tube. | Girard and Lambot, City of Darkness Revisited (2014), photo and caption | p11 | "Lam Mei Kwong in his dental clinic - spacious by Walled City standards - at 4A Lung Shing Road" | sourced |
| F117 | Photos of Wong Yu Ming's (黃如明) dental clinic. They show 4-5 glass cases of dentures, a sofa and a CRT TV on a stand. They also show a dental chair and a dental light, a pendulum clock and a tear-off calendar (21 July 1989). They also show tiles to about 2 m. | Girard and Lambot, City of Darkness Revisited (2014), photos and captions | pp34-37 | "In the City's heyday more than 150 illegal dentists were thought to be practising in the City, though the figure had dropped to 86 by 1987." | sourced |
| F118 | Wong Yu Ming worked and lived in his clinic. | Girard and Lambot, City of Darkness Revisited (2014), interview with Wong Yu Ming | p35 | "I work and live here 24 hours a day." | sourced |
| F119 | Photos of Ho Chi Kam's (何智錦) barber's shop, 10 Tai Chang Street (大井街). They show 2-3 barber chairs, a long mirror over a wood counter, a cushioned stool and a perm trolley. They also show a wall water heater, a clock, a tear-off calendar and a 福 paper. They also show 2 fluorescent tubes. | Girard and Lambot, City of Darkness Revisited (2014), photos and caption | pp28-31 | "Ho Chi Kam's barber's shop was a small but prosperous business." | sourced |
| F120 | Photos of the Fuk Tak shrine (福德古廟). They show 3 stone incense burners, 10+ incense coils from the ceiling and an offering table with fruit. They also show a lantern at the opening. | Girard and Lambot, City of Darkness Revisited (2014), photos and caption | pp32-33 | "Women comprised the majority of visitors" | sourced |
| F121 | Photo of Jetly Chau's (周秀儀) Chiu Chow cake shop. It shows 2 wall shelves of about 40 offering figures, 3 large steamers on a table and aluminium trays. It also shows a soy-milk urn and a tray of glasses. | Girard and Lambot, City of Darkness Revisited (2014), photo and caption | pp44-45 | "Most of the cakes are cooked by steaming, although some are baked." | sourced |
| F122 | Photos of Lau Yeung Yin's (劉陽賢) weaving factory. They show a cast-iron beam machine with cloth rolls, a yarn beam and 2 motors. They also show a creel of hundreds of yarn cones, 50+ cones on a high shelf and boxes of cones. They also show one fluorescent tube. | Girard and Lambot, City of Darkness Revisited (2014), photos and caption | pp49-51 | "Lau Yeung Yin sits among the giant spindles of his weaving and threading factory with his baby son." | sourced |
| F123 | Photos of Mrs Law's flat. They show a metal bunk, a wall telephone and a tiled kitchen bench with a burner. They also show a wall rack of pans, a glass-door cabinet, a folding chair, a stool and plastic bags on nails. They also show 2 basins. | Girard and Lambot, City of Darkness Revisited (2014), photos and caption | pp54-55 | "they often did their homework on her bed while kneeling on the floor." | sourced |
| F124 | Photo of the cashier's desk of the Chung Fat Café (松發冰室). It shows a desk with a rotary telephone, a chair and a glass case of cups. It also shows a crate of soft drinks, a corner shelf of cigarettes and an aluminium ladder to a cockloft. It also shows a clock and a tear-off calendar (10 March 1989). | Girard and Lambot, City of Darkness Revisited (2014), photo and caption | p56 | "the ladder in the corner leading to a small cockloft where Ng Kam Mui's mother occasionally spent the night." | sourced |
| F125 | Photo of a Chiu Chow restaurant. It shows 4+ square folding tables, 6+ stools, 3 folding chairs, a wall fan, a stainless counter and crates. It also shows a diner in a padded winter jacket. | Girard and Lambot, City of Darkness Revisited (2014), photo and caption | pp58-59 | "A little more basic, though no less popular among its solidly male clientele, was this Chiu Chow restaurant on the south side of the City, just off Lung Chun Road." | sourced |
| F126 | Photo of a fishball factory. It shows a large frying wok in a concrete stove and a wall shelf with a scale. It also shows 4 baskets of fishballs, crates and a stainless tank. | Girard and Lambot, City of Darkness Revisited (2014), photo and caption | p290 | "a small factory off Kwong Ming Street, where most of the City's fishball operators were located." | sourced |
| F127 | Photos of Lam Leung Po's (林良寶) minced-fish workshop (about 480 sq ft). They show a long low table with 4 workers on low stools and a TV on a wall shelf. They also show a folding table, folding chairs, a scale, foam boxes and basins. They also show air-conditioning. They also show a collapsible gate. | Girard and Lambot, City of Darkness Revisited (2014), photos and caption | pp292-293 | "Bundled up against the chill of a Hong Kong winter and the workshop's air-conditioning, female part-time workers prepare minced fish dumplings." | sourced |
| F128 | Lam Tseng Yat's (林俊逸) grocery at 25 Tai Chang Street. It shows a glass case on a cabinet, floor-to-ceiling shelves and about 10 glass jars. It also shows a chest freezer as the counter, a stool and rice sacks. It also shows the owner lived in the shop. | Girard and Lambot, City of Darkness Revisited (2014), photo and interview | pp296-297 | "beer in crates and 50 to 60 sacks of rice at a time" | sourced |
| F129 | Photos of the Salvation Army (救世軍) kindergarten. They show a blackboard, 4+ shared school desks, about 10 small chairs and cork boards of drawings. For Christmas there is a tinsel 'MERRY CHRISTMAS' banner, a paper Santa, about 17 paper angels and balloons. | Girard and Lambot, City of Darkness Revisited (2014), photos and caption | pp300-301 | "the Salvation Army ran a well-attended kindergarten at its premises on Lung Chun Back Road for many years." | sourced |
| F130 | The kindergarten had about 80 pupils and kept the air-conditioning on all year; on Sundays it was a chapel. | Girard and Lambot, City of Darkness Revisited (2014), interview with Simon Wong (王國清) | pp300-301 | "On Sundays, our premises become a chapel and we usually have 10 to 20 people attending our services." | sourced |
| F131 | Photos of Yu Hing Wan's (余慶雲) muslin factory. A large old loom with a belt drive stands in the middle. There are rolls and heaps of muslin, a worktable and a pedestal fan. A wood desk with a drawer holds scissors, tins and bottles, under a framed mirror. The plaster walls peel. One fluorescent tube lights the room. | Girard and Lambot, City of Darkness Revisited (2014), photos and caption | pp310-311 | "his need to accommodate large machinery and store cloth." | sourced |
| F132 | I counted the items in 14 roof photos (pp283-327). TV aerials are in 13 photos, laundry in about 6 and pot plants or gardens in about 6. Roof huts are in about 4, junk in about 4, chairs or loungers in 3 and children in 5. No roof shrine is visible. | Girard and Lambot, City of Darkness Revisited (2014), photos | pp283-327 | "An exciting playground despite the detritus of people's unwanted fittings and furniture, the roof thronged with children out of school hours" | sourced |
| F133 | Photo of a roof: a folding lounge chair, a pot plant, a roof hut, washing lines and many TV aerials. | Girard and Lambot, City of Darkness Revisited (2014), photo and caption | pp14-15 | "the roof was an invaluable sanctuary: a quiet oasis where they could breathe fresh air" | sourced |
| F134 | Photo of caged balconies: steel grille cages 0.6-0.8 m deep across each flat, 15+ pot plants, laundry, a quilt airing, crates and basins, corrugated awnings. | Girard and Lambot, City of Darkness Revisited (2014), photo and caption | pp18-19 | "Bedding out to air, washing out to dry, plants being tended, birdcages and seats for taking in the view" | sourced |
| F135 | Counts of items in the recipes come from the room sizes of the model and the photos above. They are not from a count in a source. | lead agent | this file |  | inferred |
| F136 | Photo of the Old People's Centre. It shows two metal folding chairs, an old swivel office chair and a pedal exerciser on the floor. A tall wood cabinet has a padlock and a 'No smoking' sign (嚴禁吸煙). A steel-framed window has curtains. The floor has checkerboard tiles. | Girard and Lambot, City of Darkness Revisited (2014), photo and caption | p309 | "Kwok Lau Hing (centre) at the Old People's Centre. A high proportion of the regulars there were elderly women, many of whom lived alone or in small shared apartments." | sourced |
| F137 | The Old People's Centre gave afternoon tea with biscuits. | Girard and Lambot, City of Darkness Revisited (2014), interview with Reverend Isaac Liu (about 1991) | p305 | "We provide afternoon tea including biscuits." | sourced |
| F138 | The Old People's Centre used the old magistrate's buildings at the centre of the City, once a home for the elderly. The yamen photos (pp306-307) show brick walls and timber door frames. | Girard and Lambot, City of Darkness Revisited (2014), interview with Reverend Isaac Liu (about 1991) | pp305-307 | "In 1971 we moved to our present premises, which were previously a home for the elderly, in the centre of the City." | sourced |
| F139 | Photo down a stair into the Kai Fong offices. Through an open steel grille door, a wood desk with papers stands on a terrazzo floor. On the landing there is a plastic bin with a lid. | Girard and Lambot, City of Darkness Revisited (2014), photo and caption | pp180-181 | "Looking down into the Kai Fong's offices on the third floor of 16 Tung Tau Tsuen Road." | sourced |
| F140 | The Kai Fong offices opened every weekday, with two full-time secretaries. | Girard and Lambot, City of Darkness Revisited (2014), caption | p180 | "These were open every weekday, during normal working hours, with two full-time secretaries ready to help with residents' problems and concerns." | sourced |
| F141 | The Kai Fong Association kept a register of property deals at its office. | Girard and Lambot, City of Darkness Revisited (2014), interview (1991) | p40 | "Each transaction would be entered into a register which was kept at the Association office." | sourced |
| F142 | Lam Leung Po's minced-fish workshop used an electric mixer. | Girard and Lambot, City of Darkness Revisited (2014), interview with Lam Leung Po | p292 | "I used to mix things by hand, but now I use this mixer." | sourced |
| F143 | Photo of a dai pai dong (streetside restaurant) on Tung Tsing Road (東正道). It shows 2 metal stall carts, a stack of bamboo steamers, a rack with a pot, a folding stool, 2 buckets and 2 fluorescent tubes. | Girard and Lambot, City of Darkness Revisited (2014), photo and caption | pp294-295 | "A dai pai dong (streetside restaurant) further down Tung Tsing Road (opposite) was typical of the numerous cafés and restaurants" | sourced |
| F144 | I sorted the named places of each category in data/room_uses.json by trade words in the names. Food factories (107): noodles 18, cakes and buns 17, roast meat and other meat 17, fishballs 7, other 48. Garment (50): shoes 16, knitting 9, weaving 8, other sewing 17. Metal (65): jewellery and watches 16, electrical 9, plating 4, other metalwork 36. Eating (28): cafés 11, dai pai dongs and canteens 3, restaurants 14. Religion (11): temples and shrines 5, churches and missions 6. Services (12): hair 7, utilities 5. Works (53): handbags 6, paper 4, other 43. | data/room_uses.json (names from the GRS clearance records HKRS1255-3 and the repo's other sources) | data/room_uses.json, field 'name' |  | derived |
| F145 | Roof huts of concrete, timber or corrugated sheet stand on some roofs. They have a door and a barred window. | Girard and Lambot, City of Darkness Revisited (2014), photos | p6 (text); pp14, 313, 322 (photos) | "Some had home-made annexes of brick or iron or plastic on the roofs" | sourced |
