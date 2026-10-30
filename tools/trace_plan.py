"""Trace the street and plot plan of Kowloon Walled City into a 1 m grid.

Input: a PNG of "Streets in Kowloon Walled City.jpg" by Lord Jaraxxus (Wikimedia Commons,
CC BY-SA 4.0) at its natural size, 2337 x 1525 px. It is a photo of the 1980s street plan
on display in Kowloon Walled City Park.

Output: plan.json (read by src/layout.js) and preview PNGs, in OUTDIR.

    python3 tools/trace_plan.py plan.png OUTDIR [PX_PER_M] [GAP]

PX_PER_M defaults to the value that makes plots plus lanes 26,000 m2. I use 8.43: it gives
26,000 m2 and a long side of about 209 m (213 m incl. Sai Shing Road; 700 ft in 1898).
"""
import json
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

src, outdir = sys.argv[1], sys.argv[2]
a = np.asarray(Image.open(src).convert('RGB')).astype(np.int32)
H, W = a.shape[:2]
r, g, b = a[..., 0], a[..., 1], a[..., 2]
lum = (r * 3 + g * 6 + b) / 10
sat = a.max(-1) - a.min(-1)

OTHER, CREAM, LINE, STREET, PINK, RED, GREEN = range(7)
cls = np.zeros((H, W), np.uint8)
cls[(sat < 40) & (lum > 180)] = CREAM
cls[(sat < 60) & (lum <= 165)] = LINE
cls[(r - g > 30) & (b - g > 5) & (r - b > 5) & (r - g < 110)] = STREET
cls[(r - g > 95) & (b - g > 25)] = PINK
cls[(r - g > 80) & (abs(b - g) < 22)] = RED
cls[(g - r > 25) & (g - b > 10)] = GREEN

# ---- remove the caption leader lines that cross the plan --------------------------------
S = W / 1600  # the positions below were read off a 1600 px wide preview
erased = np.zeros((H, W), bool)
for xp, y0, y1 in [(362, 165, 905), (690, 625, 930), (862, 740, 1000)]:
    xc = float(xp * S)
    for y in range(int(y0 * S), int(y1 * S)):
        lo, hi = int(xc) - 5, int(xc) + 6
        xs = np.nonzero(cls[y, lo:hi] == LINE)[0]
        if len(xs):
            xc = 0.8 * xc + 0.2 * (lo + xs.mean())
        xi = int(round(xc))
        left, right = cls[y, xi - 7], cls[y, xi + 7]
        cls[y, xi - 4:xi + 5] = left if (left == right or right == LINE) else right
        erased[y, xi - 4:xi + 5] = True

# ---- the city: everything inside the red ground ------------------------------------------
B = 8  # decide city / not city on 8 px blocks, so thin white lines on the red do not count
hb, wb = H // B, W // B
redfrac = (cls[:hb * B, :wb * B] == RED).reshape(hb, B, wb, B).mean((1, 3))
blk = ndi.binary_opening(redfrac < 0.35, iterations=2)
lab, n = ndi.label(blk)
blk = ndi.binary_fill_holes(lab == lab[hb // 2, wb // 2])
city = np.zeros((H, W), bool)
city[:hb * B, :wb * B] = np.repeat(np.repeat(blk, B, 0), B, 1)
city &= ~(cls == RED) | ndi.binary_erosion(city, iterations=6)

# ---- plots: cream regions closed off by drawn lines ---------------------------------------
lumf = lum.astype(float)
tophat = ndi.grey_closing(lumf, size=(7, 7)) - lumf
barrier = (tophat > 22) & (cls != PINK) & (cls != STREET)
barrier = (barrier & ~erased) | (erased & (cls == LINE))
# Close the gaps in dashed lot lines (dash ~22 px, gap ~7 px) and in faint plot lines.
GAP = int(sys.argv[4]) if len(sys.argv) > 4 else 11
barrier = ndi.binary_closing(barrier, structure=np.ones((GAP, GAP), bool))
interior = ((cls == CREAM) | (cls == GREEN) | (cls == OTHER)) & ~barrier & city
interior = ndi.binary_erosion(interior, structure=ndi.generate_binary_structure(2, 1), iterations=1)
plab, pn = ndi.label(interior)
sizes = ndi.sum(np.ones_like(plab), plab, index=np.arange(pn + 1))

# The blank margin between the outer plot line and the edge of the drawing touches the
# edge of the city; no plot does. Leader lines and the dashed lot line cut it in parts.
edge = city & ~ndi.binary_erosion(city, iterations=10)
touch = np.bincount(plab[edge], minlength=pn + 1)
touch[0] = 0
margins = set(int(k) for k in np.nonzero(touch > 150)[0])
print('components', pn, 'margin parts', len(margins), 'px', int(sum(sizes[k] for k in margins)))
is_margin = np.isin(plab, list(margins))

street = (cls == STREET) & city
# pink lines over a street count as street
pink = (cls == PINK) & city
street |= pink & (ndi.uniform_filter(street.astype(float), 9) > 0.25)

plots_px = (plab > 0) & ~is_margin
built = ndi.binary_closing(plots_px | street, iterations=4) & city & ~is_margin
bl, bn = ndi.label(built)
bs = ndi.sum(np.ones_like(bl), bl, index=np.arange(1, bn + 1))
built = bl == (1 + int(np.argmax(bs)))
built = ndi.binary_fill_holes(built) & ~is_margin

dbg = np.zeros((H, W, 3), np.uint8)
rng0 = np.random.default_rng(5)
cols = rng0.integers(90, 255, (pn + 1, 3)).astype(np.uint8); cols[0] = 0
for k in margins:
    cols[k] = (255, 0, 0)
dbg[:] = cols[plab]; dbg[street] = (150, 80, 200); dbg[~built & ~is_margin] //= 3
Image.fromarray(dbg).resize((1600, int(1600 * H / W))).save(f'{outdir}/trace-plots.png')

# ---- scale --------------------------------------------------------------------------------
ys, xs = np.nonzero(built)
area_px = len(ys)
ppm_area = np.sqrt(area_px / 26000.0)
rows_w = [np.ptp(xs[ys == y]) for y in range(ys.min() + 40, ys.max() - 40, 20)]
print('built px', area_px, 'ppm if 26,000 m2', round(ppm_area, 3),
      'bbox px', xs.min(), xs.max(), ys.min(), ys.max(), 'median row width px', np.median(rows_w))
PPM = float(sys.argv[3]) if len(sys.argv) > 3 else ppm_area
ppm = PPM
margin = -1

# ---- resample to 1 m cells ----------------------------------------------------------------
# codes while working: 0 out, 1 lane, 2 unresolved, 5 margin, >= 10 plot label + 10
PAD = 12
x0, y0 = xs.min() - PAD * ppm, ys.min() - PAD * ppm
GW = int(np.ceil((xs.max() - x0) / ppm)) + PAD
GD = int(np.ceil((ys.max() - y0) / ppm)) + PAD
cell = np.zeros((GD, GW), np.int32)
in_margin = city & is_margin
for j in range(GD):
    for i in range(GW):
        X0 = max(0, int(x0 + i * ppm)); X1 = min(W, int(x0 + (i + 1) * ppm))
        Y0 = max(0, int(y0 + j * ppm)); Y1 = min(H, int(y0 + (j + 1) * ppm))
        if X1 <= X0 or Y1 <= Y0:
            continue
        blk_b = built[Y0:Y1, X0:X1]
        if blk_b.mean() < 0.5:
            if city[Y0:Y1, X0:X1].mean() > 0.6:
                cell[j, i] = 5
            continue
        st = street[Y0:Y1, X0:X1].mean()
        lb = plab[Y0:Y1, X0:X1][blk_b]
        lb = lb[(lb > 0) & ~np.isin(lb, list(margins))]
        if st > 0.3 or len(lb) == 0:
            cell[j, i] = 1 if st > 0.12 else (2 if blk_b.mean() > 0.9 else 0)
            continue
        vals, cnts = np.unique(lb, return_counts=True)
        cell[j, i] = int(vals[np.argmax(cnts)]) + 10

def nearest_plot(mask, cell):
    """For each True cell in mask, the label of the nearest plot cell."""
    d, (jj, ii) = ndi.distance_transform_edt(cell < 10, return_indices=True)
    out = cell.copy()
    out[mask] = cell[jj[mask], ii[mask]]
    return out, d

# unresolved cells join the nearest plot
cell, _ = nearest_plot(cell == 2, cell)

# Smooth the outline of the built city at the cell level: fill notches and pinholes.
body = (cell == 1) | (cell >= 10)
smooth = ndi.binary_opening(ndi.binary_fill_holes(ndi.binary_closing(body, iterations=2)), iterations=1)
cell[body & ~smooth] = 0
cell, _ = nearest_plot(smooth & ~body, cell)

# ---- clean plots ----------------------------------------------------------------------------
def relabel(cell):
    out = cell.copy()
    nid = 10
    for v in np.unique(cell[cell >= 10]):
        comp, nc = ndi.label(cell == v)
        for c in range(1, nc + 1):
            out[comp == c] = nid
            nid += 1
    return out

cell = relabel(cell)
MIN = 9
for it in range(8):
    ids, cnt = np.unique(cell[cell >= 10], return_counts=True)
    small = ids[cnt < MIN]
    if not len(small):
        break
    size = dict(zip(ids, cnt))
    for v in small:
        m = cell == v
        ring = ndi.binary_dilation(m) & ~m
        nb = cell[ring]
        nb = nb[nb >= 10]
        if len(nb):
            vals, c = np.unique(nb, return_counts=True)
            cell[m] = vals[np.argmax(c)]
        elif size[v] < 4:
            cell[m] = 1

# ---- roads on the old wall bases ------------------------------------------------------------
# The cream band outside the plots on the south and west sides carries the names 龍津道
# (Lung Chun Road) and 西城路 (Sai Shing Road), with house numbers and doors facing it.
# On the north and east the band is the outside pavement of Tung Tau Tsuen Road and
# Tung Tsing Road, which stay outside the city.
body = (cell == 1) | (cell >= 10)
d, (jj, ii) = ndi.distance_transform_edt(~body, return_indices=True)
J, I = np.mgrid[0:GD, 0:GW]
dj, di = jj - J, ii - I
road = (cell == 5) & (d <= 7.5) & (((dj < 0) & (-dj >= np.abs(di))) | ((di > 0) & (di >= np.abs(dj))))
road = ndi.binary_closing(road, iterations=2) & (cell == 5)
lab_r, nr = ndi.label(road)
if nr:
    rs = ndi.sum(np.ones_like(lab_r), lab_r, index=np.arange(1, nr + 1))
    road = np.isin(lab_r, 1 + np.nonzero(rs >= 60)[0])
cell[cell == 5] = 0
cell[road] = 3

# ---- green dots: factory sites on Kwong Ming Street (caption on the plan) --------------------
def cell_at(xp, yp):
    """Cell (i, j) of a point given in preview px."""
    return int((xp * S - x0) / ppm), int((yp * S - y0) / ppm)

gl, gn = ndi.label((cls == GREEN) & city)
gs = ndi.sum(np.ones_like(gl), gl, index=np.arange(1, gn + 1))
gc = ndi.center_of_mass(np.ones_like(gl), gl, index=np.arange(1, gn + 1))
factories = set()
for s_, (cy, cx) in zip(gs, gc):
    if 25 <= s_ <= 400:
        i = int((cx - x0) / ppm); j = int((cy - y0) / ppm)
        if 0 <= i < GW and 0 <= j < GD and cell[j, i] >= 10:
            factories.add(int(cell[j, i]))
print('green dots ->', len(factories), 'plots')

# ---- named places, read off the plan by hand (preview px) -----------------------------------
def plot_at(xp, yp):
    i, j = cell_at(xp, yp)
    v = cell[j, i]
    if v < 10:  # take the nearest plot
        dd, (pj, pi) = ndi.distance_transform_edt(cell < 10, return_indices=True)
        v = cell[pj[j, i], pi[j, i]]
    return int(v)

COMPOUND = [(712, 333), (918, 333), (918, 700), (712, 700)]  # the Yamen compound wall
ci0, cj0 = cell_at(*COMPOUND[0]); ci1, cj1 = cell_at(*COMPOUND[2])
yard_ids = {plot_at(725, 400), plot_at(785, 666)}
named = {
    'youthCentre': plot_at(800, 352),
    'freeSchool': plot_at(662, 520),
    'tinHau': plot_at(997, 268),
    'kaifong': plot_at(902, 178),
}
yamen_ids = set()
for v in np.unique(cell[cj0:cj1, ci0:ci1]):
    if v < 10 or v in yard_ids or v in named.values():
        continue
    m = cell == v
    inside = m[cj0:cj1, ci0:ci1].sum() / m.sum()
    if inside > 0.6:
        yamen_ids.add(int(v))
for v in yard_ids:
    cell[cell == v] = 2
cell[(cell == 1) & (np.pad(np.ones((cj1 - cj0, ci1 - ci0), bool), ((cj0, GD - cj1), (ci0, GW - ci1))))] = 2

# ---- crop and encode ------------------------------------------------------------------------
nz = np.argwhere(cell > 0)
(j0, i0), (j1, i1) = nz.min(0) - 1, nz.max(0) + 2
cell = cell[j0:j1, i0:i1]
x0 += i0 * ppm; y0 += j0 * ppm
GD, GW = cell.shape

ids = np.unique(cell[cell >= 10])
remap = {int(v): k + 4 for k, v in enumerate(ids)}
grid = np.zeros_like(cell)
grid[cell == 1] = 1   # lane
grid[cell == 2] = 2   # open yard
grid[cell == 3] = 3   # road
for v, k in remap.items():
    grid[cell == v] = k

# Outline of the city (plots, lanes, yard and the two roads), in cell units.
from skimage.measure import find_contours, approximate_polygon
mask = np.pad(grid > 0, 1)
cs = max(find_contours(mask.astype(float), 0.5), key=len)
poly = approximate_polygon(cs, tolerance=0.7)
outline = [[round(float(c) - 1 + 0.5, 1), round(float(r) - 1 + 0.5, 1)] for r, c in poly[:-1]]

ALPH = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'
def enc(v):
    return ALPH[v // 64] + ALPH[v % 64]
rows = [''.join(enc(int(v)) for v in row) for row in grid]

data = {
    'source': '"Streets in Kowloon Walled City.jpg" by Lord Jaraxxus, Wikimedia Commons, CC BY-SA 4.0. '
              'https://commons.wikimedia.org/wiki/File:Streets_in_Kowloon_Walled_City.jpg',
    'note': 'Traced by tools/trace_plan.py from a photo of the 1980s street plan on display in '
            'Kowloon Walled City Park. 1 cell = 1 m; +x is plan right (ENE), +z is plan down (SSE). '
            'Codes: 0 outside, 1 lane, 2 open yard, 3 road on the old wall base, 4+ plot. '
            'This derived data is shared under CC BY-SA 4.0.',
    'W': int(GW), 'D': int(GD), 'pxPerM': round(float(ppm), 4),
    'plots': len(remap),
    'factoryPlots': sorted(remap[v] for v in factories if v in remap),
    'yamenPlots': sorted(remap[v] for v in yamen_ids if v in remap),
    'named': {k: remap.get(v) for k, v in named.items()},
    'streets': {
        # label anchor (cell units) and direction for the street names on the plan
        'Kwong Ming St 光明街': [*cell_at(1150, 420), 'ns'],
        'Lo Yan St 老人街': [*cell_at(925, 520), 'ns'],
        'Tai Chang St 大井街': [*cell_at(432, 765), 'ns'],
        'Sz Kung St 社公街': [*cell_at(520, 734), 'ew'],
        'Lung Shing Rd 龍城路': [*cell_at(1262, 360), 'ns'],
        'Lung Chun Rd 龍津道': [*cell_at(900, 888), 'ew'],
        'Sai Shing Rd 西城路': [*cell_at(98, 560), 'ns'],
    },
    'outline': outline,
    'rows': rows,
}
with open(f'{outdir}/plan.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
area = int((grid > 0).sum())
print('grid', GW, GD, 'plots', len(remap), 'lanes', int((grid == 1).sum()), 'yard', int((grid == 2).sum()),
      'road', int((grid == 3).sum()), 'plot cells', int((grid >= 4).sum()), 'total', area,
      'outline pts', len(outline), 'named', data['named'], 'yamen plots', data['yamenPlots'])

# preview
rng = np.random.default_rng(3)
pal = np.zeros((grid.max() + 1, 3), np.uint8)
pal[4:] = rng.integers(110, 245, (grid.max() - 3, 3))
pal[0] = (40, 40, 40); pal[1] = (150, 80, 200); pal[2] = (90, 90, 70); pal[3] = (200, 200, 200)
for k in data['factoryPlots']:
    pal[k] = (30, 170, 60)
for k in data['yamenPlots']:
    pal[k] = (240, 120, 40)
for k in data['named'].values():
    pal[k] = (255, 255, 255)
img = Image.fromarray(pal[grid]).resize((GW * 6, GD * 6), Image.NEAREST)
img.save(f'{outdir}/trace-grid.png')
