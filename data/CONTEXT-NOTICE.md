# Notice: data/context.json

Source: the Government of the Hong Kong SAR and the CSDI Portal.

`data/context.json` and `tools/context_input.json` hold data that `tools/context.py` takes
from these government sources:

- **Lands Department, 1:1000 survey sheets** (the old editions, as GeoTIFF scans). Sheets
  11-NE-11A, 11-NE-11B, 11-NE-11C, 11-NE-6C, 11-NE-6D, 11-NW-10D, 11-NW-15B and 11-NW-15D.
  The tool uses the editions of 1987 (1988 for 11-NW-15B and 15D) and of 1981-85. The
  outlines of the buildings that are gone, the road widths and the open ground come from
  these sheets. The sheet index is from the CSDI Portal; the scans are from
  open.hkmapservice.gov.hk.
- **Lands Department, Building data** on the CSDI Portal
  (`landsd_rcd_1637211194312_35158`): footprints, BaseHeight and TopHeight, storeys, names,
  and completion dates.
- **Buildings Department, occupation permits** (OP number and OP date), in the same service.
- **Transport Department, Road Network** on the CSDI Portal (`td_rcd_1638949160594_2844`):
  road centre lines with English and Chinese names.

This data is free to use with the attribution above. It does not have a Creative Commons
licence, and the licence of the traced plan (CC BY-SA 4.0) does not apply to it.

No scan, image or download is in the repository. Run `tools/context.py fetch` to download
them again (see the steps at the top of that file).

Some storeys and dates of named buildings are facts from Chinese Wikipedia (樂富邨, 東頭邨,
美東邨). The `source` field of each building gives them. OpenStreetMap data is not in this
file.
