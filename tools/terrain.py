"""Build data/terrain.json: the height of the ground round the City, in the plan frame.

Sources (Hong Kong government open data; see data/CONTEXT-NOTICE.md):
- LandsD Digital Terrain Model, 5 m grid, HK1980 Grid, heights in metres above Principal
  Datum (mPD): https://www.landsd.gov.hk/landsd_psi_data/SMO/data/Whole_HK_DTM_5m.zip
  (data.gov.hk dataset hk-landsd-openmap-5m-grid-dtm; the file in the zip is dated 2019-03-11).
  The grid is the ground of today, not of 1986. Its accuracy is +-5 m, and over trees it
  gives the top of the trees.
- The spot heights of the 1:1000 survey sheet 11-NE-11A, edition of May 1987 (SPOTS below).
  I read each one by eye on the scan. On the roads round the City, the grid of today agrees
  with them to 1 m.

Steps:

    python3 -I tools/terrain.py DTM.asc        # writes data/terrain.json

DTM.asc is the file in the zip, outside the repository. No download is committed.

What the file holds:
- `h`: the ground in decimetres above Principal Datum, on a square lattice of RES metres in
  the plan frame of data/context.json (x right, z down the plan), from (X0, Z0), row by row in
  z. It reaches 640 m from the centre of the plan box: the haze hides all beyond 600 m.
- The grid of today, sampled at each point (bilinear), plus a smooth correction that makes it
  meet the 1987 spot heights (a Gaussian of SIGMA_SPOT metres round each spot).
- Inside the City and in a band of CITY_BAND metres round it, the ground is the grid smoothed
  with a Gaussian of SIGMA_CITY metres. The park of today has paths, steps and trees that the
  City did not have. The smooth ground keeps only the slope: up to the north-west, down to
  the south-east. INFERRED: no survey of 1987 gives a height inside the City. The slope agrees
  with Lambot's own words: the alleys ran "up the hill northwards to Tung Tau Tsuen Road and
  down towards Lung Chun Road" (cityofdarkness.co.uk, "Dark Alleys").
"""
import json
import math
import os
import sys

import numpy as np
from scipy import ndimage as ndi

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT = os.path.join(REPO, 'data/terrain.json')
CONTEXT = os.path.join(REPO, 'data/context.json')
PLAN = os.path.join(REPO, 'data/plan.json')
RES = 5.0
REACH = 640.0
OPEN, RIDGE = 35.0, 2.5
SIGMA_SPOT = 30.0
SIGMA_CITY = 8.0
CITY_BAND = 6.0

# The spot heights of sheet 11-NE-11A, May 1987, in metres above Principal Datum. E and N come
# from the scan pixel of the "+" (0.0635 m per pixel; the sheet registers on standing buildings
# to 0.9 m rms, data/context.json). `where` says where each one stands.
SPOTS = [
    dict(h=22.3, E=837539.9, N=821490.2, where='Tung Tau Tsuen Road, west of the City'),
    dict(h=22.9, E=837607.7, N=821508.0, where='Tung Tau Tsuen Road, at No. 24'),
    dict(h=17.7, E=837661.7, N=821561.3, where='Tung Tau Tsuen Road, north of the Tin Hau temple'),
    dict(h=17.5, E=837676.8, N=821564.1, where='Tung Tau Tsuen Road, at No. 1B'),
    dict(h=14.6, E=837724.0, N=821580.6, where='Tung Tsing Road, north of the City'),
    dict(h=6.6, E=837791.3, N=821440.2, where='Tung Tsing Road, at the south-east corner of the City'),
]


def read_asc(path, e0, n0, e1, n1):
    """The part of an ESRI ASCII grid that covers E e0..e1, N n0..n1: (array, E of col 0,
    N of row 0, cell). Rows run north to south. Only the rows in the window are parsed."""
    head = {}
    with open(path) as f:
        for _ in range(6):
            k, v = f.readline().split()
            head[k.lower()] = float(v)
        cell = head['cellsize']
        ncols, nrows = int(head['ncols']), int(head['nrows'])
        # The centre of the cell in col 0, and of the cell in row 0 (the north row).
        ex0 = head['xllcorner'] + cell / 2
        ny0 = head['yllcorner'] + cell * nrows - cell / 2
        c0, c1 = max(0, int((e0 - ex0) / cell) - 2), min(ncols, int((e1 - ex0) / cell) + 3)
        r0, r1 = max(0, int((ny0 - n1) / cell) - 2), min(nrows, int((ny0 - n0) / cell) + 3)
        rows = []
        for r, line in enumerate(f):
            if r < r0:
                continue
            if r >= r1:
                break
            rows.append(np.array(line.split()[c0:c1], dtype=np.float64))
    a = np.array(rows)
    a[a == head['nodata_value']] = np.nan
    return a, ex0 + c0 * cell, ny0 - r0 * cell, cell


def main(dtm_path):
    ctx = json.load(open(CONTEXT))
    T = ctx['transform']
    E0, N0, b, th, dx, dz = T['E0'], T['N0'], math.radians(T['bearingDeg']), T['th'], T['dx'], T['dz']

    def to_grid(x, z):
        """Plan (x, z) -> HK1980 Grid (E, N): the inverse of the transform of context.json."""
        c, s = math.cos(th), math.sin(th)
        X, Z = c * x - s * z + dx, s * x + c * z + dz
        return E0 + math.sin(b) * X + math.cos(b) * Z, N0 + math.cos(b) * X - math.sin(b) * Z

    def to_plan(E, N):
        dE, dN = E - E0, N - N0
        x0, z0 = math.sin(b) * dE + math.cos(b) * dN, math.cos(b) * dE - math.sin(b) * dN
        c, s = math.cos(th), math.sin(th)
        return c * (x0 - dx) + s * (z0 - dz), -s * (x0 - dx) + c * (z0 - dz)

    pad = REACH * 1.5 + 20
    a, ex0, ny0, cell = read_asc(dtm_path, E0 - pad, N0 - pad, E0 + pad, N0 + pad)
    if np.isnan(a).any():
        a = np.where(np.isnan(a), np.nanmean(a), a)

    def sample(arr, E, N):
        c = (np.asarray(E) - ex0) / cell
        r = (ny0 - np.asarray(N)) / cell
        return ndi.map_coordinates(arr, [r, c], order=1, mode='nearest')

    n = int(round(2 * REACH / RES)) + 1
    X0 = Z0 = -REACH
    xs = X0 + RES * np.arange(n)
    zs = Z0 + RES * np.arange(n)
    PX, PZ = np.meshgrid(xs, zs)
    c, s = math.cos(th), math.sin(th)
    GX, GZ = c * PX - s * PZ + dx, s * PX + c * PZ + dz
    GE = E0 + math.sin(b) * GX + math.cos(b) * GZ
    GN = N0 + math.cos(b) * GX - math.sin(b) * GZ
    H = sample(a, GE, GN)
    # The grid keeps raised roads and bridges. A ridge narrower than OPEN metres that stands
    # more than RIDGE metres over the ground on both sides is taken out. A wide hill stays.
    opened = ndi.grey_opening(H, size=(int(OPEN / RES), int(OPEN / RES)))
    H = np.where(H - opened > RIDGE, opened, H)

    # The City: inside its outline (data/plan.json, in plan metres), and a band round it.
    plan = json.load(open(PLAN))
    poly = [(x - plan['W'] / 2, z - plan['D'] / 2) for x, z in plan['outline']]
    inside = np.zeros(PX.shape, bool)  # even-odd test of each lattice point
    for (xa, za), (xb, zb) in zip(poly, poly[1:] + poly[:1]):
        if za == zb:
            continue
        cross = (za > PZ) != (zb > PZ)
        xi = xa + (PZ - za) * (xb - xa) / (zb - za)
        inside ^= cross & (PX < xi)
    dist = ndi.distance_transform_edt(~inside) * RES
    smooth = ndi.gaussian_filter(sample(a, GE, GN), SIGMA_CITY / RES, mode='nearest')
    w = np.clip(1 - (dist - CITY_BAND) / (2 * RES), 0, 1)  # 1 in the City and the band, 0 beyond
    H = H * (1 - w) + smooth * w

    # The 1987 spot heights: each pulls the ground near it to its height.
    spots = []
    num = np.zeros_like(H)
    den = np.ones_like(H) * 0.15  # far from all spots, the correction goes to 0
    for sp in SPOTS:
        x, z = to_plan(sp['E'], sp['N'])
        grid_h = float(sample(a, [sp['E']], [sp['N']])[0])
        here = float(ndi.map_coordinates(H, [[(z - Z0) / RES], [(x - X0) / RES]], order=1)[0])
        g = np.exp(-((PX - x) ** 2 + (PZ - z) ** 2) / (2 * SIGMA_SPOT ** 2))
        num += g * (sp['h'] - here)
        den += g
        spots.append(dict(sp, x=round(x, 2), z=round(z, 2), dtm=round(grid_h, 2)))
    H = H + num / den
    for sp in spots:
        sp['model'] = round(float(ndi.map_coordinates(H, [[(sp['z'] - Z0) / RES], [(sp['x'] - X0) / RES]], order=1)[0]), 2)

    out = dict(
        about='The height of the ground round Kowloon Walled City, as in December 1986, out to 640 m '
              'from the centre of the plan box. src/terrain.js reads it.',
        notice='Contains data from the Government of the Hong Kong SAR: the Lands Department 5 m Digital '
               'Terrain Model and the 1:1000 survey sheet 11-NE-11A (May 1987). See data/CONTEXT-NOTICE.md.',
        frame='plan: x and z as in data/context.json, origin at the centre of the plan box; '
              'heights in metres above Principal Datum (mPD)',
        source=dict(dtm='LandsD Digital Terrain Model, 5 m grid (Whole_HK_DTM_5m.asc, 2019-03-11), '
                        'https://data.gov.hk/en-data/dataset/hk-landsd-openmap-5m-grid-dtm',
                    spots='LandsD 1:1000 survey sheet 11-NE-11A, edition 11, May 1987: spot heights read by eye'),
        method=dict(sigmaSpot=SIGMA_SPOT, sigmaCity=SIGMA_CITY, cityBand=CITY_BAND,
                    city='INFERRED: inside the City the ground is the grid of today smoothed; no 1987 survey '
                         'gives a height inside the City.'),
        res=RES, x0=X0, z0=Z0, nx=n, nz=n, unit='dm',
        spots=spots,
        h=[[int(round(v * 10)) for v in row] for row in H],
    )
    with open(OUT, 'w') as f:
        json.dump(out, f, separators=(',', ':'))
    inner = H[inside]
    print('terrain %dx%d, %.0f..%.0f m; City %.1f..%.1f m' % (n, n, H.min(), H.max(), inner.min(), inner.max()))
    for sp in spots:
        print('  spot %.1f  grid %.1f  model %.1f  (%s)' % (sp['h'], sp['dtm'], sp['model'], sp['where']))


if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
