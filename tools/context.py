"""Build data/context.json: the real buildings and roads round the City in December 1986.

Sources (Hong Kong government open data; see data/CONTEXT-NOTICE.md):
- LandsD 1:1000 Old Survey Sheets (series HP1C, GeoTIFF scans, HK1980 Grid). The model's
  week is December 1986. I use the 1987 editions (11-NE-11A 1987-05, 11-NE-6C 1987-09, ...)
  for what stood, and the 1984-85 editions to see what changed. For 11-NW-15B and 15D the
  editions are 1985 and 1988.
- CSDI Building (LandsD): today's footprints, with BaseHeight and TopHeight (mPD), and the
  Buildings Department occupation permit (OP) dates and completion dates.
- CSDI Road Network (Transport Department): today's road centre lines, with English and
  Chinese names.

Steps:

    python3 -I tools/context.py fetch DL       # download the sheets and the CSDI data to DL
    python3 -I tools/context.py fit DL         # fit the 1987 outline of the City to plan.json
    python3 -I tools/context.py register DL    # check each sheet on standing buildings
    python3 -I tools/context.py trace DL OUT   # candidate outlines from the 1987 sheets
    python3 -I tools/context.py build DL       # write data/context.json

DL is a download folder outside the repository. No scan and no download is committed.
`fit` gives the City fit; `register` writes DL/register.json, which `build` reads.

`trace` finds the regions that the ink of the 1987 sheets closes, outside the City plate and
not under a kept CSDI footprint. I reviewed each candidate by eye on the sheet. The review
kept the outlines of buildings, joined the pieces of the resettlement blocks, and rejected
parks, slopes, roads and yards. I traced Mei Tung House and Block 23 by hand (the east wing
of Mei Tung House by a seed fill). The result is in tools/context_input.json: `named`
(buildings that are gone, with a name and storeys) and `traced` (buildings that are gone,
with no name; `storeys` and `what` mark the small structures that the sheet names, such as
an ET). That file also holds the City fit, the CSDI footprints that are left out, the road
rules and the open ground. `build` reads only DL and that file.

The plan frame. HK1980 Grid (E, N) goes to plan metres (x, z) in two steps:
1. T0, from src/site.js: dE = E - E0, dN = N - N0 with the anchor E0 837649.05,
   N0 821463.67 (22.33222 N, 114.19028 E, the centre of the plan box); then
   x = sin(b) dE + cos(b) dN, z = cos(b) dE - sin(b) dN, with b = PLAN_BEARING = 60 deg.
2. The City fit: the 1987 sheet's outline of the City meets the outline of plan.json when
   the plan is turned by `th` and moved by (dx, dz). Thus p = R(-th) (T0(E, N) - (dx, dz)).
   The fit keeps the scale at 1 (a free scale gives 0.996-1.010).
"""
import glob
import json
import math
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

Image.MAX_IMAGE_PIXELS = None
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
INPUT = os.path.join(REPO, 'tools/context_input.json')
E0, N0 = 837649.05, 821463.67
BEARING = 60.0
RADIUS = 600.0  # metres from the centre of the plan box
FETCH_R = 680.0
SHEETS = ['11-NE-11A', '11-NE-11B', '11-NE-11C', '11-NE-6C', '11-NE-6D', '11-NW-10D', '11-NW-15B', '11-NW-15D']
LATE = {'11-NE-11A': 11, '11-NE-11B': 7, '11-NE-11C': 8, '11-NE-6C': 8, '11-NE-6D': 8, '11-NW-10D': 7,
        '11-NW-15B': 9, '11-NW-15D': 9}
EARLY = {'11-NE-11A': 10, '11-NE-11B': 6, '11-NE-11C': 7, '11-NE-6C': 7, '11-NE-6D': 7, '11-NW-10D': 6,
         '11-NW-15B': 8, '11-NW-15D': 8}
SHEET_INDEX = 'https://portal.csdi.gov.hk/server/rest/services/common/landsd_rcd_1640047456225_68329/FeatureServer/0/query'
BUILDING = 'https://portal.csdi.gov.hk/server/rest/services/common/landsd_rcd_1637211194312_35158/FeatureServer'
ROADS = 'https://portal.csdi.gov.hk/server/rest/services/common/td_rcd_1638949160594_2844/FeatureServer/10/query'
NATIVE = 0.0635  # m per scan pixel (400 dpi at 1:1000)
OUT = 254  # window value outside the sheet frames


# ---- geometry ---------------------------------------------------------------------------------
def load_input():
    return json.load(open(INPUT)) if os.path.exists(INPUT) else {}


def t0(E, N):
    b = math.radians(BEARING)
    dE, dN = E - E0, N - N0
    return math.sin(b) * dE + math.cos(b) * dN, math.cos(b) * dE - math.sin(b) * dN


def t0_inv(x, z):
    b = math.radians(BEARING)
    return E0 + math.sin(b) * x + math.cos(b) * z, N0 + math.cos(b) * x - math.sin(b) * z


def to_plan(fit):
    """Grid (E, N) -> plan (x, z), with the City fit."""
    c, s = math.cos(-fit['th']), math.sin(-fit['th'])

    def f(E, N):
        x, z = t0(E, N)
        x, z = x - fit['dx'], z - fit['dz']
        return c * x - s * z, s * x + c * z
    return f


def area(ring):
    return 0.5 * sum(a[0] * b[1] - b[0] * a[1] for a, b in zip(ring, ring[1:] + ring[:1]))


def densify(ring, step):
    out = []
    for a, b in zip(ring, ring[1:] + ring[:1]):
        n = max(1, int(math.hypot(b[0] - a[0], b[1] - a[1]) / step))
        out += [(a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n) for k in range(n)]
    return np.array(out)


def plan_outline():
    p = json.load(open(os.path.join(REPO, 'data/plan.json')))
    return [(x - p['W'] / 2, z - p['D'] / 2) for x, z in p['outline']], p


# ---- download ---------------------------------------------------------------------------------
def http(url, params=None, post=False):
    q = urllib.parse.urlencode(params or {})
    req = urllib.request.Request(url if post or not q else url + '?' + q, data=q.encode() if post else None,
                                 headers={'User-Agent': 'Mozilla/5.0'})
    for k in range(5):
        try:
            return urllib.request.urlopen(req, timeout=300).read()
        except urllib.error.HTTPError as e:
            print('retry', url, e.code, flush=True)
            time.sleep(3 + 3 * k)
    raise SystemExit('failed: ' + url)


def fetch(dl):
    """Download the sheet index, 16 sheet editions and the CSDI buildings and roads."""
    os.makedirs(dl, exist_ok=True)
    where = 'SHEETNO IN (%s)' % ','.join("'%s'" % s for s in SHEETS)
    idx = json.loads(http(SHEET_INDEX, dict(where=where, outFields='*', f='json', outSR=2326)))
    json.dump(idx, open(os.path.join(dl, 'sheet_index.json'), 'w'))
    # open.hkmapservice.gov.hk does not send its intermediate certificate. Put the
    # Hongkong Post e-Cert SSL CA 3 - 17 certificate (PEM) next to the CA bundle in
    # DL/bundle.pem if the download fails with CERTIFICATE_VERIFY_FAILED.
    import ssl
    bundle = os.path.join(dl, 'bundle.pem')
    ctx = ssl.create_default_context(cafile=bundle) if os.path.exists(bundle) else None
    for f in idx['features']:
        a = f['attributes']
        if a['EDITION'] not in (LATE[a['SHEETNO']], EARLY[a['SHEETNO']]):
            continue
        out = os.path.join(dl, 'sheets', '%s_ed%d.zip' % (a['SHEETNO'], a['EDITION']))
        if not os.path.exists(out):
            os.makedirs(os.path.dirname(out), exist_ok=True)
            req = urllib.request.Request(a['GeoTiff'], headers={'User-Agent': 'Mozilla/5.0'})
            open(out, 'wb').write(urllib.request.urlopen(req, timeout=600, context=ctx).read())
            print('sheet', a['SHEETNO'], a['EDITION'], flush=True)
        import zipfile
        zipfile.ZipFile(out).extractall(out[:-4])
    g = json.loads(http(BUILDING + '/0/query', dict(
        where='1=1', geometry='%f,%f' % (E0, N0), geometryType='esriGeometryPoint', inSR=2326,
        spatialRel='esriSpatialRelIntersects', distance=FETCH_R, units='esriSRUnit_Meter', outFields='*',
        outSR=2326, returnGeometry='true', f='geojson'), post=True))
    ids = sorted({f['properties']['BuildingCSUID'] for f in g['features']})

    def rows(table, field, vals, quote=True, n=40):
        res = []
        for i in range(0, len(vals), n):
            inl = ','.join(("'%s'" % v) if quote else str(v) for v in vals[i:i + n])
            d = json.loads(http(BUILDING + '/%d/query' % table, dict(where='%s IN (%s)' % (field, inl),
                                                                       outFields='*', f='json')))
            res += [r['attributes'] for r in d['features']]
        return res
    rel = rows(1002, 'BuildingCSUID', ids)
    ops = rows(1003, 'BuildingStructureID', sorted({r['BuildingStructureID'] for r in rel}), quote=False)
    op = rows(1004, 'OPNo', sorted({r['OPNo'] for r in ops if r['OPNo']}))
    works = rows(1000, 'BuildingCSUID', ids)
    names = rows(1001, 'BuildingCSUID', ids)
    json.dump({'anchor': [E0, N0], 'radius': FETCH_R, 'buildings': g, 'rel': rel, 'opstructure': ops, 'op': op,
               'works': works, 'names': names}, open(os.path.join(dl, 'csdi_buildings.json'), 'w'))
    r = json.loads(http(ROADS, dict(
        where='1=1', geometry='%f,%f' % (E0, N0), geometryType='esriGeometryPoint', inSR=2326,
        spatialRel='esriSpatialRelIntersects', distance=FETCH_R, units='esriSRUnit_Meter', outFields='*',
        outSR=2326, returnGeometry='true', f='geojson'), post=True))
    json.dump(r, open(os.path.join(dl, 'csdi_roads.json'), 'w'))
    print('buildings', len(g['features']), 'roads', len(r['features']))


# ---- the survey sheets ------------------------------------------------------------------------
class Sheets:
    """One edition set (LATE or EARLY) of the sheets, read on demand."""

    def __init__(self, dl, editions):
        idx = json.load(open(os.path.join(dl, 'sheet_index.json')))
        self.sheets = []
        for f in idx['features']:
            a = f['attributes']
            if a['EDITION'] != editions.get(a['SHEETNO']):
                continue
            r = f['geometry']['rings'][0]
            frame = (min(p[0] for p in r), min(p[1] for p in r), max(p[0] for p in r), max(p[1] for p in r))
            tif = glob.glob(os.path.join(dl, 'sheets', '%s_ed%d*' % (a['SHEETNO'], a['EDITION']), '*.tif'))[0]
            tfw = [float(v) for v in open(tif[:-4] + '.tfw').read().split()]
            date = time.strftime('%Y-%m', time.gmtime(a['EDITION_DATE'] / 1000 + 8 * 3600))
            self.sheets.append(dict(no=a['SHEETNO'], ed=a['EDITION'], date=date, frame=frame, tif=tif, tfw=tfw))
        self.cache = {}

    def array(self, s):
        if s['tif'] not in self.cache:
            if len(self.cache) > 3:
                self.cache.pop(next(iter(self.cache)))
            self.cache[s['tif']] = np.asarray(Image.open(s['tif']))
        return self.cache[s['tif']]

    def sheet_at(self, E, N):
        for s in self.sheets:
            x0, y0, x1, y1 = s['frame']
            if x0 <= E < x1 and y0 <= N < y1:
                return s
        return None

    def window(self, e0, n0, e1, n1, res, shift=None):
        """Gray window, north up, `res` m per px; OUT (254) outside the frames. The scans are
        black and white (0, 255). Ink is kept when reducing: each output pixel is the darkest
        scan pixel near it. `shift` maps a sheet number to its (dE, dN) correction."""
        W, H = int(round((e1 - e0) / res)), int(round((n1 - n0) / res))
        out = np.full((H, W), OUT, np.uint8)
        E = e0 + (np.arange(W) + 0.5) * res
        N = n1 - (np.arange(H) + 0.5) * res
        for s in self.sheets:
            x0, y0, x1, y1 = s['frame']
            if x1 <= e0 or x0 >= e1 or y1 <= n0 or y0 >= n1:
                continue
            a = self.array(s)
            A, _, _, D, C, F = s['tfw']
            dE, dN = (shift or {}).get(s['no'], (0, 0))
            cols = np.round((E - dE - C) / A).astype(int)
            rows = np.round((N - dN - F) / D).astype(int)
            k = max(1, int(round(res / A)))
            jm = (E >= x0) & (E < x1)
            im = (N >= y0) & (N < y1)
            if not jm.any() or not im.any():
                continue
            c0, c1 = max(0, cols[jm].min() - k), min(a.shape[1], cols[jm].max() + k + 1)
            r0, r1 = max(0, rows[im].min() - k), min(a.shape[0], rows[im].max() + k + 1)
            sub = a[r0:r1, c0:c1]
            if k > 1:
                sub = ndi.minimum_filter(sub, size=k)
            cc = np.clip(cols - c0, 0, sub.shape[1] - 1)
            rr = np.clip(rows - r0, 0, sub.shape[0] - 1)
            out[np.ix_(im, jm)] = sub[np.ix_(rr[im], cc[jm])]
        return out


# ---- the City fit -----------------------------------------------------------------------------
def city_mask(late, res=0.127):
    """The City's ground on the 1987 sheet: thick lines (permanent buildings), with gaps under
    0.8 m closed so that the lanes are sealed, filled from outside."""
    e0, n0, e1, n1 = 837480, 821300, 837900, 821620
    gray = ndi.uniform_filter(late.window(e0, n0, e1, n1, NATIVE).astype(np.float32), size=3)
    thick = ndi.binary_opening(gray < 128, structure=np.ones((5, 5), bool))
    H, W = thick.shape
    t2 = thick[:H // 2 * 2, :W // 2 * 2].reshape(H // 2, 2, W // 2, 2).any((1, 3))
    r = 6
    disk = np.hypot(*np.mgrid[-r:r + 1, -r:r + 1]) <= r
    lab, _ = ndi.label(~ndi.binary_closing(t2, structure=disk))
    border = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    inside = ~np.isin(lab, border[border > 0])
    lab, _ = ndi.label(inside)
    ci, cj = int((n1 - N0) / res), int((E0 - e0) / res)
    city = ndi.binary_fill_holes(lab == lab[ci, cj])
    # Fences and kerbs that touch the City are thin: an opening of 3 m takes them off.
    r = int(1.5 / res)
    city = ndi.binary_opening(city, structure=np.hypot(*np.mgrid[-r:r + 1, -r:r + 1]) <= r)
    lab, _ = ndi.label(city)
    return lab == lab[ci, cj], (e0, n1, res)


def fit_city(dl):
    late = Sheets(dl, LATE)
    mask, (e0, n1, res) = city_mask(late)
    O, _ = plan_outline()
    H, W = mask.shape

    def raster(dx, dz, th):
        c, s = math.cos(th), math.sin(th)
        pts = []
        for x, z in O:
            E, N = t0_inv(c * x - s * z + dx, s * x + c * z + dz)
            pts.append(((E - e0) / res, (n1 - N) / res))
        im = Image.new('L', (W, H), 0)
        ImageDraw.Draw(im).polygon(pts, fill=1)
        return np.asarray(im, bool)

    def iou(t):
        r = raster(*t)
        return (r & mask).sum() / (r | mask).sum()
    best = (iou((0, 0, 0)), (0.0, 0.0, 0.0))
    for step in (2, 1, 0.5, 0.25, 0.1):
        improved = True
        while improved:
            improved = False
            dx, dz, th = best[1]
            for d in [(step, 0, 0), (-step, 0, 0), (0, step, 0), (0, -step, 0),
                      (0, 0, math.radians(step / 2)), (0, 0, -math.radians(step / 2))]:
                t = (dx + d[0], dz + d[1], th + d[2])
                v = iou(t)
                if v > best[0] + 1e-6:
                    best, improved = (v, t), True
    dx, dz, th = best[1]
    # Mean distance from the fitted plan outline to the edge of the mask.
    edge = mask & ~ndi.binary_erosion(mask)
    dt = ndi.distance_transform_edt(~edge) * res
    c, s = math.cos(th), math.sin(th)
    d = []
    for x, z in densify(O, 0.5):
        E, N = t0_inv(c * x - s * z + dx, s * x + c * z + dz)
        d.append(dt[min(H - 1, int((n1 - N) / res)), min(W - 1, int((E - e0) / res))])
    d = np.array(d)
    print('City fit: IoU %.3f -> %.3f; turn %.2f deg, move dx %.2f m, dz %.2f m' % (
        iou((0, 0, 0)), best[0], math.degrees(th), dx, dz))
    print('outline to sheet edge: median %.2f m, 90%% %.2f m' % (np.median(d), np.percentile(d, 90)))
    return dict(th=round(th, 5), dx=round(dx, 2), dz=round(dz, 2), iou=round(best[0], 3),
                median=round(float(np.median(d)), 2), p90=round(float(np.percentile(d, 90)), 2))


# ---- CSDI -------------------------------------------------------------------------------------
def ms_date(t):
    return time.strftime('%Y-%m-%d', time.gmtime(t / 1000 + 8 * 3600))


def load_csdi(dl):
    d = json.load(open(os.path.join(dl, 'csdi_buildings.json')))
    rel = {}
    for r in d['rel']:
        rel.setdefault(r['BuildingCSUID'], set()).add(r['BuildingStructureID'])
    ops = {}
    for r in d['opstructure']:
        ops.setdefault(r['BuildingStructureID'], []).append(r)
    opd = {r['OPNo']: ms_date(r['OPDate']) for r in d['op'] if r['OPDate'] is not None}
    comp = {}
    for w in d['works']:
        if w['WorksType'] == 'Completion Date':
            dd, mm, yy = w['WorksDate'].split('/')
            comp.setdefault(w['BuildingCSUID'], []).append('%s-%s-%s' % (yy, mm, dd))
    out = []
    for f in d['buildings']['features']:
        p = f['properties']
        rings = [[tuple(pt) for pt in r[:-1]] for r in f['geometry']['coordinates']]
        if area(rings[0]) < 0:
            rings[0].reverse()
        sids = rel.get(p['BuildingCSUID'], ())
        st = [o for s in sids for o in ops.get(s, [])]
        dates = sorted(opd[o['OPNo']] for o in st if o['OPNo'] in opd)
        out.append(dict(
            id=p['BuildingCSUID'], type=p['BuildingBlockType'], rings=rings,
            op=dates[0] if dates else None, opno=sorted({o['OPNo'] for o in st if o['OPNo']}),
            completed=min(comp.get(p['BuildingCSUID'], [None]) or [None]) if comp.get(p['BuildingCSUID']) else None,
            name=p['BuildingNameEN'], nameZh=p['BuildingNameTC'], base=p['BaseHeight'], top=p['TopHeight'],
            storeys=p['Storeys'] or max([o['Storeys'] or 0 for o in st] or [0]) or None))
    return out


def built(b):
    return b['op'] or b['completed']


def select_csdi(dl, inp, shares):
    """Sort the CSDI footprints. `shares` maps an id to its edge share on the late and the
    early sheets. Returns {id: (kind, building)} for the kept ones:
    - 'dated': an OP or completion date before 1987 (Buildings Department).
    - 'undated': no date, but the outline is on the 1984-85 and the 1987 sheets (share 0.8 or
      more on both) and in the 2005 load of the data (id suffix T20050430).
    - 'lot': a building from 1987 on, under 400 m2 and not a thin strip (2 area / perimeter
      1.5 m or more), whose outline is on both sheets (share 0.9 or more): the 1986 building
      stood on the same lot lines. Height INFERRED.
    Open-sided and temporary structures are left out. `csdiDrop` in the input file drops
    others by hand, with the reason."""
    drop = inp.get('csdiDrop', {})
    out = {}
    for b in load_csdi(dl):
        s = shares.get(b['id'])
        if not s or b['id'] in drop or b['type'] not in ('Tower', 'Podium'):
            continue
        d, L, E = built(b), s['late'] or 0, s['early'] or 0
        if d and d < '1987-01-01':
            out[b['id']] = ('dated', b)
        elif d:
            r = b['rings'][0]
            wide = 2 * area(r) / sum(math.hypot(q[0] - p[0], q[1] - p[1]) for p, q in zip(r, r[1:] + r[:1])) >= 1.5
            if area(r) < 400 and wide and L >= 0.9 and E >= 0.9:
                out[b['id']] = ('lot', b)
        elif L >= 0.8 and E >= 0.8 and b['id'].endswith('T20050430'):
            out[b['id']] = ('undated', b)
    return out


def shares_of(dl):
    """Edge shares of every CSDI footprint within FETCH_R on both sheet sets (cached in DL)."""
    path = os.path.join(dl, 'shares.json')
    if os.path.exists(path):
        return json.load(open(path))
    late, early = Sheets(dl, LATE), Sheets(dl, EARLY)
    out = {}
    for b in load_csdi(dl):
        r = b['rings'][0]
        if math.hypot(sum(p[0] for p in r) / len(r) - E0, sum(p[1] for p in r) / len(r) - N0) <= RADIUS + 40:
            out[b['id']] = dict(late=edge_share(late, r), early=edge_share(early, r))
    json.dump(out, open(path, 'w'))
    return out


# ---- registration -----------------------------------------------------------------------------
def edge_fit(sheets, ring, shift=None, search=4.0, step=0.125, pad=6.0):
    """Best (dE, dN) of a footprint on the sheet ink, the mean distance there, and the share
    of its edge within 0.75 m of ink with no shift."""
    xs, ys = [p[0] for p in ring], [p[1] for p in ring]
    e0, n0, e1, n1 = min(xs) - pad, min(ys) - pad, max(xs) + pad, max(ys) + pad
    res = NATIVE
    a = sheets.window(e0, n0, e1, n1, res, shift)
    ink = a < 128
    if not ink.any():
        return None
    dt = ndi.distance_transform_edt(~ink) * res
    P = densify(ring, 0.25)
    H, W = dt.shape

    def cost(dE, dN, trunc=1.5):
        j = np.clip(((P[:, 0] + dE - e0) / res).astype(int), 0, W - 1)
        i = np.clip(((n1 - P[:, 1] - dN) / res).astype(int), 0, H - 1)
        d = dt[i, j]
        return np.minimum(d, trunc).mean(), (d < 0.75).mean()
    best = None
    rng = np.arange(-search, search + 1e-9, step)
    for dE in rng:
        for dN in rng:
            c, _ = cost(dE, dN)
            if best is None or c < best[0]:
                best = (c, dE, dN)
    c0, share0 = cost(0, 0)
    return dict(dE=best[1], dN=best[2], cost=best[0], cost0=c0, share0=share0)


def edge_share(sheets, ring, pad=3.0):
    """Share of a footprint's edge within 0.75 m of ink on the sheet (best of shifts up to
    0.5 m), or None outside the sheets."""
    xs, ys = [p[0] for p in ring], [p[1] for p in ring]
    e0, n0, e1, n1 = min(xs) - pad, min(ys) - pad, max(xs) + pad, max(ys) + pad
    if not all(sheets.sheet_at(E, N) for E, N in ((e0, n0), (e1, n1), (e0, n1), (e1, n0))):
        return None
    res = NATIVE
    ink = sheets.window(e0, n0, e1, n1, res) < 128
    dt = ndi.distance_transform_edt(~ink) * res
    P = densify(ring, 0.25)
    H, W = dt.shape
    best = 0
    for dE in (-0.5, -0.25, 0, 0.25, 0.5):
        for dN in (-0.5, -0.25, 0, 0.25, 0.5):
            j = np.clip(((P[:, 0] + dE - e0) / res).astype(int), 0, W - 1)
            i = np.clip(((n1 - P[:, 1] - dN) / res).astype(int), 0, H - 1)
            best = max(best, float((dt[i, j] < 0.75).mean()))
    return round(best, 3)


def plate_of():
    """The City plate in plan metres: the plan box with layout.js's MARGIN of street."""
    _, p = plan_outline()
    m = int(open(os.path.join(REPO, 'src/layout.js')).read().split('export const MARGIN = ')[1].split(';')[0])
    return (-p['W'] / 2 - m, -p['D'] / 2 - m, p['W'] / 2 + m, p['D'] / 2 + m)


def trace(dl, keep, fit, core=200.0, pad=40.0):
    """Candidate outlines on the late sheets: the regions that ink closes, with no more than
    30% under a kept CSDI footprint, outside the City plate, within RADIUS + 10 m.

    For each region: its area, `wall` (the median half width of the lines round it, in m:
    walls of permanent buildings are drawn thick, kerbs and fences thin), `straight` (the
    share of its edge in straight runs of 2 m or more), `core` (it is 1.6 m wide or more
    somewhere) and `covered`. The outline is the region grown by 0.13 m, about half a line,
    so that the outlines of neighbours meet."""
    from skimage import measure
    late = Sheets(dl, LATE)
    plan = to_plan(fit)
    x0, z0, x1, z1 = plate_of()
    res = NATIVE
    out = []
    n = int(round(2 * RADIUS / core))
    for ti in range(n):
        for tj in range(n):
            ce0, cn1 = E0 - RADIUS + tj * core, N0 + RADIUS - ti * core
            e0, n1, e1, n0 = ce0 - pad, cn1 + pad, ce0 + core + pad, cn1 - core - pad
            gray = late.window(e0, n0, e1, n1, res)
            if (gray == OUT).all():
                continue
            ink = gray < 128
            # Close gaps of one or two pixels (scan dropouts, dashed lines).
            closed = ndi.binary_closing(ink, structure=np.ones((3, 3), bool)) | ink
            half = ndi.maximum_filter(ndi.distance_transform_edt(ink), size=9)
            lab, _ = ndi.label(~closed)
            H, W = lab.shape
            cov = Image.new('L', (W, H), 0)
            dr = ImageDraw.Draw(cov)
            for r in keep:
                if max(p[0] for p in r) < e0 or min(p[0] for p in r) > e1 or max(p[1] for p in r) < n0 or min(p[1] for p in r) > n1:
                    continue
                dr.polygon([((E - e0) / res, (n1 - N) / res) for E, N in r], fill=1)
            cov = np.asarray(cov, bool)
            sizes = np.bincount(lab.ravel())
            for k, sl in enumerate(ndi.find_objects(lab), 1):
                A = sizes[k] * res * res
                if sl is None or A < 8 or A > 12000:
                    continue
                i0, i1, j0, j1 = sl[0].start, sl[0].stop, sl[1].start, sl[1].stop
                if i0 == 0 or j0 == 0 or i1 == H or j1 == W:
                    continue
                i0, i1, j0, j1 = max(0, i0 - 4), min(H, i1 + 4), max(0, j0 - 4), min(W, j1 + 4)
                m = ndi.binary_fill_holes(lab[i0:i1, j0:j1] == k)
                ci, cj = ndi.center_of_mass(m)
                cE, cN = e0 + (j0 + cj + 0.5) * res, n1 - (i0 + ci + 0.5) * res
                if not (ce0 <= cE < ce0 + core and cn1 - core <= cN < cn1):
                    continue
                if math.hypot(cE - E0, cN - N0) > RADIUS + 10 or (gray[i0:i1, j0:j1][m] == OUT).mean() > 0.05:
                    continue
                px, pz = plan(cE, cN)
                if x0 <= px <= x1 and z0 <= pz <= z1:
                    continue
                ring = ndi.binary_dilation(m, iterations=2) & ~m
                wall = float(np.median(half[i0:i1, j0:j1][ring])) * res
                grown = np.pad(ndi.binary_dilation(m, iterations=2), 1)
                c = max(measure.find_contours(grown.astype(np.uint8), 0.5), key=len)
                fine = measure.approximate_polygon(c, tolerance=0.2 / res)
                seg = np.hypot(*np.diff(fine, axis=0).T) * res
                straight = float(seg[seg >= 2].sum() / max(seg.sum(), 1e-9))
                c = measure.approximate_polygon(c, tolerance=0.25 / res)
                pts = [(round(e0 + (j0 + q[1] - 1 + 0.5) * res, 2), round(n1 - (i0 + q[0] - 1 + 0.5) * res, 2)) for q in c[:-1]]
                if len(pts) < 3:
                    continue
                out.append(dict(ring=pts, area=round(A, 1), wall=round(wall, 3), straight=round(straight, 3),
                                core=bool(ndi.binary_erosion(m, iterations=int(0.8 / res)).any()),
                                covered=round(float(cov[i0:i1, j0:j1][m].mean()), 3), c=[round(cE, 1), round(cN, 1)]))
            print('trace', ti, tj, len(out), flush=True)
    for i, c in enumerate(out):
        c['id'] = i
    return out


def register(dl):
    """For each sheet, the best shift of each control building (CSDI towers with an OP or a
    completion date at least two years before the edition, 60-2500 m2, inside the frame)."""
    csdi = load_csdi(dl)
    report = {}
    for name, eds in (('late', LATE), ('early', EARLY)):
        sh = Sheets(dl, eds)
        for s in sh.sheets:
            x0, y0, x1, y1 = s['frame']
            year = int(s['date'][:4])
            ctl = []
            for b in csdi:
                r = b['rings'][0]
                if b['type'] != 'Tower' or not built(b) or int(built(b)[:4]) > year - 2:
                    continue
                if not 60 <= area(r) <= 2500:
                    continue
                if min(p[0] for p in r) < x0 + 5 or max(p[0] for p in r) > x1 - 5:
                    continue
                if min(p[1] for p in r) < y0 + 5 or max(p[1] for p in r) > y1 - 5:
                    continue
                if math.hypot(sum(p[0] for p in r) / len(r) - E0, sum(p[1] for p in r) / len(r) - N0) > FETCH_R:
                    continue
                f = edge_fit(sh, r)
                if f and f['cost'] < 0.35:  # the footprint is on the sheet
                    ctl.append(dict(id=b['id'], **f))
            if len(ctl) < 4:
                print(name, s['no'], s['date'], 'controls', len(ctl))
                continue
            dE = float(np.median([c['dE'] for c in ctl]))
            dN = float(np.median([c['dN'] for c in ctl]))
            resid = np.array([math.hypot(c['dE'] - dE, c['dN'] - dN) for c in ctl])
            report.setdefault(name, {})[s['no']] = dict(
                date=s['date'], controls=len(ctl), dE=round(dE, 3), dN=round(dN, 3),
                rms=round(float(np.sqrt((resid ** 2).mean())), 3), p90=round(float(np.percentile(resid, 90)), 3),
                points=[[c['id'], round(c['dE'], 3), round(c['dN'], 3)] for c in ctl])
            print('%-5s %-10s %s controls %3d  shift dE %+.2f dN %+.2f  residual rms %.2f m, 90%% %.2f m' % (
                name, s['no'], s['date'], len(ctl), dE, dN, report[name][s['no']]['rms'],
                report[name][s['no']]['p90']), flush=True)
    return report


def dump_lines(data, path):
    """JSON with one line for each key, and one line for each item of a list of objects."""
    with open(path, 'w') as fh:
        fh.write('{\n')
        keys = list(data)
        for i, k in enumerate(keys):
            v = data[k]
            end = ',\n' if i < len(keys) - 1 else '\n'
            if isinstance(v, list) and v and isinstance(v[0], dict):
                fh.write('"%s": [\n' % k + ',\n'.join(json.dumps(x, ensure_ascii=False, separators=(',', ':')) for x in v) + '\n]' + end)
            else:
                fh.write('"%s": %s' % (k, json.dumps(v, ensure_ascii=False, separators=(',', ':'))) + end)
        fh.write('}\n')


# ---- build ------------------------------------------------------------------------------------
NOTICE = ('Contains data from the Government of the Hong Kong SAR and the CSDI Portal: the Lands '
          'Department 1:1000 survey sheets and Building data, the Buildings Department occupation '
          'permits, and the Transport Department Road Network. See data/CONTEXT-NOTICE.md.')


def half_plane(ring, a, b, c):
    """The part of a ring where a x + b z + c >= 0 (one Sutherland-Hodgman pass)."""
    out = []
    for i in range(len(ring)):
        P, Q = ring[i], ring[(i + 1) % len(ring)]
        fp, fq = a * P[0] + b * P[1] + c, a * Q[0] + b * Q[1] + c
        if fp >= 0:
            out.append(P)
        if (fp >= 0) != (fq >= 0):
            t = fp / (fp - fq)
            out.append((P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])))
    return out


def on_plate(ring, plate):
    """Area of a ring (plan) that lies on the City plate."""
    x0, z0, x1, z1 = plate
    r = ring
    for h in ((1, 0, -x0), (-1, 0, x1), (0, 1, -z0), (0, -1, z1)):
        r = half_plane(r, *h)
        if len(r) < 3:
            return 0.0
    return abs(area(r))


def off_plate(ring, plate, res=0.05, grow=0.1):
    """The parts of a ring (plan) off the City plate, largest first. The ring is drawn on a grid
    of `res` m, the plate is cut out `grow` m wider (thus no part touches it), and each part is
    traced again. A ring can leave the plate on two sides, or twice on one side."""
    from skimage import measure
    x0, z0, x1, z1 = plate
    xs, zs = [p[0] for p in ring], [p[1] for p in ring]
    ox, oz = min(xs) - 1, min(zs) - 1
    W, H = int((max(xs) + 1 - ox) / res) + 1, int((max(zs) + 1 - oz) / res) + 1
    im = Image.new('L', (W, H), 0)
    dr = ImageDraw.Draw(im)
    dr.polygon([((x - ox) / res, (z - oz) / res) for x, z in ring], fill=1)
    dr.rectangle(((x0 - grow - ox) / res, (z0 - grow - oz) / res, (x1 + grow - ox) / res, (z1 + grow - oz) / res), fill=0)
    lab, n = ndi.label(np.asarray(im, bool))
    parts = []
    for k in range(1, n + 1):
        m = lab == k
        if m.sum() * res * res < 1:
            continue
        c = max(measure.find_contours(np.pad(m, 1).astype(np.uint8), 0.5), key=len)
        c = measure.approximate_polygon(c, tolerance=1.0)  # one grid cell
        r = [(ox + (q[1] - 1) * res, oz + (q[0] - 1) * res) for q in c[:-1]]
        parts.append(r[::-1] if area(r) < 0 else r)
    return sorted(parts, key=lambda r: -area(r))


def centroid(r):
    return sum(p[0] for p in r) / len(r), sum(p[1] for p in r) / len(r)


def inside(p, r):
    x, y = p
    c = False
    for (x1, y1), (x2, y2) in zip(r, r[1:] + r[:1]):
        if (y1 > y) != (y2 > y) and x < x1 + (y - y1) * (x2 - x1) / (y2 - y1):
            c = not c
    return c


def road_check(late, line, built_mask, step=1.0, reach=30.0, res=0.125):
    """On the 1987 sheet: the share of a centre line that is 0.4 m or more from any line, the
    share that runs through a building of December 1986, and the median kerb-to-kerb width
    (rays to the first line on each side). `built_mask` is (mask, e0, n1, res) of the buildings."""
    P = []
    for a, b in zip(line, line[1:]):
        n = max(1, int(math.hypot(b[0] - a[0], b[1] - a[1]) / step))
        P += [(a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n) for k in range(n)]
    P = np.array(P + [line[-1]])
    xs, ys = P[:, 0], P[:, 1]
    e0, n0, e1, n1 = xs.min() - reach - 2, ys.min() - reach - 2, xs.max() + reach + 2, ys.max() + reach + 2
    g = late.window(e0, n0, e1, n1, res)
    ink = (g < 128)
    dt = ndi.distance_transform_edt(~ink) * res
    H, W = ink.shape
    ij = lambda E, N: (np.clip(((n1 - N) / res).astype(int), 0, H - 1), np.clip(((E - e0) / res).astype(int), 0, W - 1))
    i, j = ij(xs, ys)
    known = g[i, j] != OUT
    open_share = float((dt[i, j][known] >= 0.4).mean()) if known.any() else None
    bm, be0, bn1, bres = built_mask
    bi = np.clip(((bn1 - ys) / bres).astype(int), 0, bm.shape[0] - 1)
    bj = np.clip(((xs - be0) / bres).astype(int), 0, bm.shape[1] - 1)
    in_building = float(bm[bi, bj].mean())
    d = np.gradient(P, axis=0)
    d /= np.maximum(np.hypot(d[:, 0], d[:, 1]), 1e-9)[:, None]
    nrm = np.stack([-d[:, 1], d[:, 0]], 1)
    t = np.arange(0, reach, res)
    widths = []
    for k in range(len(P)):
        side = []
        for sgn in (1, -1):
            E = P[k, 0] + sgn * nrm[k, 0] * t
            N = P[k, 1] + sgn * nrm[k, 1] * t
            ii, jj = ij(E, N)
            hit = np.nonzero(ink[ii, jj])[0]
            side.append(t[hit[0]] if len(hit) else None)
        if None not in side:
            widths.append(side[0] + side[1])
    return open_share, in_building, (float(np.median(widths)) if len(widths) >= 3 else None)


def clip_circle(line, R):
    """Parts of a polyline (plan) within R of the origin."""
    parts, cur = [], []
    for a, b in zip(line, line[1:]):
        ina, inb = math.hypot(*a) <= R, math.hypot(*b) <= R
        if ina and not cur:
            cur = [a]
        if ina != inb:
            # point where the segment crosses the circle
            dx, dz = b[0] - a[0], b[1] - a[1]
            A, B, Cc = dx * dx + dz * dz, 2 * (a[0] * dx + a[1] * dz), a[0] ** 2 + a[1] ** 2 - R * R
            disc = math.sqrt(max(0.0, B * B - 4 * A * Cc))
            ts = [t for t in ((-B - disc) / (2 * A), (-B + disc) / (2 * A)) if 0 <= t <= 1]
            t = ts[0] if ina is False else ts[-1]
            q = (a[0] + t * dx, a[1] + t * dz)
            if ina:
                cur.append(q)
                parts.append(cur)
                cur = []
            else:
                cur = [q]
        if inb and cur:
            cur.append(b)
    if len(cur) > 1:
        parts.append(cur)
    return [p for p in parts if len(p) > 1]


def build(dl):
    inp = load_input()
    fit = inp['fit']
    plan = to_plan(fit)
    plate = plate_of()
    late, early = Sheets(dl, LATE), Sheets(dl, EARLY)
    H0 = inp['storeyHeight']
    sel = select_csdi(dl, inp, shares_of(dl))
    csdi = {b['id']: b for b in load_csdi(dl)}

    # Heights of the dated CSDI buildings, for the neighbour rule.
    ref = []
    for kind, b in sel.values():
        if kind == 'dated' and b['top'] is not None and b['base'] is not None and b['top'] > b['base']:
            ref.append((*centroid(b['rings'][0]), b['top'] - b['base']))
    ref = np.array(ref)

    def neighbours(E, N):
        d = np.hypot(ref[:, 0] - E, ref[:, 1] - N)
        for r in (60, 120):
            if (d <= r).sum() >= 3:
                return float(np.median(ref[d <= r, 2])), 'INFERRED: the median height of the CSDI buildings with an OP before 1987 within %d m' % r
        return 15.0, 'INFERRED: no dated CSDI building within 120 m; 15 m'

    def sheet_note(ring):
        E, N = centroid(ring)
        s, e = late.sheet_at(E, N), early.sheet_at(E, N)
        share = edge_share(early, ring)
        on_early = share is not None and share >= 0.7
        built = ('by %s' % e['date']) if on_early and e else ('%s to %s' % (e['date'], s['date']) if e else None)
        return 'LandsD 1:1000 sheet %s (%s)' % (s['no'], s['date']), on_early, built, share

    out, dropped, clipped = [], {'plate': [], 'radius': 0}, []
    rings1986 = []
    rnd = lambda P: [[round(x, 2), round(z, 2)] for x, z in P]

    def add(b, ring):
        rings1986.append(ring)
        P = [plan(E, N) for E, N in ring]
        if area(P) < 0:
            P.reverse()
        if any(math.hypot(x, z) > RADIUS for x, z in P):
            dropped['radius'] += 1
            return
        A = abs(area(P))
        o = on_plate(P, plate)
        if o > 0.01:
            if o >= 0.98 * A:
                dropped['plate'].append(b.get('name') or b['id'])
                return
            # One record for each part off the plate; plateClipped keeps the whole outline.
            parts = off_plate(P, plate)
            ids = [b['id']] + ['%s/%d' % (b['id'], k + 1) for k in range(1, len(parts))]
            clipped.append(dict(id=b['id'], name=b.get('name'), nameZh=b.get('nameZh'), height=b['height'],
                                onPlate=round(o / A, 2), parts=ids, ring=rnd(P)))
            for k, part in enumerate(parts):
                out.append(dict(b, id=ids[k], ring=rnd(part), base=0, clipped=(
                    'The City plate covers %.0f%% of the 1987 footprint. This is part %d of %d off the plate; '
                    'plateClipped in the header has the whole outline.' % (100 * o / A, k + 1, len(parts)))))
            return
        b['ring'] = rnd(P)
        b['base'] = 0
        out.append(b)

    # 1. CSDI footprints.
    for cid, (kind, b) in sorted(sel.items()):
        r = b['rings'][0]
        e = dict(id='csdi:' + cid, kind=kind)
        if kind == 'lot':
            h, rule = neighbours(*centroid(r))
            e.update(name=None, nameZh=None, height=round(h, 1), storeys=max(1, round(h / H0)), confidence='inferred',
                     heightRule=rule, built=None, demolished='after 1986: the CSDI building on the lot has OP %s' % built(b),
                     source='Outline: CSDI Building %s (LandsD), on the 1984-85 and 1987 sheets; the 1986 building stood on the same lot lines' % cid)
        else:
            if b['top'] is not None and b['base'] is not None and b['top'] > b['base']:
                h, rule, conf = b['top'] - b['base'], 'CSDI TopHeight - BaseHeight', 'sourced'
            elif b['storeys']:
                h, rule, conf = b['storeys'] * H0, 'CSDI storeys x %.1f m' % H0, 'sourced'
            else:
                h, rule = neighbours(*centroid(r))
                conf = 'inferred'
            src = 'CSDI Building %s (LandsD)' % cid
            if b['opno']:
                src += '; OP %s (Buildings Department)' % ', '.join(b['opno'])
            e.update(name=b['name'], nameZh=b['nameZh'], height=round(h, 1),
                     storeys=b['storeys'] or (max(1, round(h / H0)) if conf == 'inferred' else None),
                     confidence=conf, heightRule=rule, demolished=None, source=src,
                     built=built(b) if kind == 'dated' else 'by %s (on the 1984-85 sheet; no date in CSDI)' % early.sheet_at(*centroid(r))['date'])
        add(e, r)

    # 2. Named buildings that are gone, traced on the sheets.
    for i, t in enumerate(inp['named']):
        src, on_early, b_, share = sheet_note(t['ring'])
        e = dict(id='named:%d' % i, kind='traced', name=t['name'], nameZh=t.get('nameZh'))
        if t.get('storeys'):
            h, rule = t['storeys'] * H0, ('%d storeys x %.1f m' % (t['storeys'], H0)) + ('; ' + t['rule'] if t.get('rule') else '')
            conf = t['confidence']
        else:
            h, rule = neighbours(*centroid(t['ring']))
            conf = 'inferred'
        e.update(height=round(h, 1), storeys=t.get('storeys') or max(1, round(h / H0)), confidence=conf, heightRule=rule,
                 built=t.get('built') or b_, demolished=t.get('demolished'),
                 source=('Outline: %s%s. %s' % (src, ', ' + t['traced'] if t.get('traced') else '', t.get('source', ''))).strip(),
                 onEarlySheet=on_early)
        if t.get('note'):
            e['note'] = t['note']
        add(e, t['ring'])

    # 3. Unnamed buildings that are gone: the reviewed outlines of `trace`.
    for i, t in enumerate(inp['traced']):
        src, on_early, b_, share = sheet_note(t['ring'])
        A = abs(area(t['ring']))
        if t.get('storeys'):  # a small structure that the review named on the sheet
            n = t['storeys']
            rule = 'INFERRED: %s on the sheet, %s' % (t['what'], 'one storey' if n == 1 else '%d storeys' % n)
        elif A < 30:
            n, rule = 1, 'INFERRED: under 30 m2, one storey'
        elif t['zone'] == 'cottage':
            n, rule = (1, 'INFERRED: a cottage area, under 80 m2, one storey') if A < 80 else (2, 'INFERRED: a cottage area, 80 m2 or more, two storeys')
        else:
            n = None
        if n:
            h = n * H0
        else:
            h, rule = neighbours(*centroid(t['ring']))
            n = max(1, round(h / H0))
        add(dict(id='traced:%d' % i, kind='traced', name=None, nameZh=None, height=round(h, 1), storeys=n,
                 confidence='inferred', heightRule=rule, built=b_, demolished=None,
                 source='Outline: ' + src + '; not in CSDI now', onEarlySheet=on_early), t['ring'])

    # 4. Roads: today's centre lines, kept where they fit the 1987 sheet.
    bres, be0, bn1 = 0.5, E0 - RADIUS - 100, N0 + RADIUS + 100
    n = int(2 * (RADIUS + 100) / bres)
    im = Image.new('L', (n, n), 0)
    dr = ImageDraw.Draw(im)
    for r in rings1986:
        dr.polygon([((E - be0) / bres, (bn1 - N) / bres) for E, N in r], fill=1)
    bmask = (ndi.binary_erosion(np.asarray(im, bool), iterations=2), be0, bn1, bres)  # 1 m inside the walls
    roads, rdrop = [], []
    for f in json.load(open(os.path.join(dl, 'csdi_roads.json')))['features']:
        p = f['properties']
        line = [tuple(c) for c in f['geometry']['coordinates']]
        name = p['STREET_ENAME'].title() if p['STREET_ENAME'] and p['STREET_ENAME'] != '-99' else None
        if all(math.hypot(E - E0, N - N0) > RADIUS + 20 for E, N in line):
            continue
        why = inp['roadDrop']['names'].get(p['STREET_ENAME'])
        if not why and any(inside(centroid(line), z) for z in inp['roadDrop']['zones'].values()):
            why = inp['roadDrop']['zoneReason']
        share, inb, width = road_check(late, line, bmask)
        if not why and (share is None or share < 0.4):
            why = 'under 40% of the centre line is clear of the lines of the 1987 sheet'
        if not why and inb > 0.1:
            why = 'it runs through a building of December 1986'
        if why:
            rdrop.append(dict(id=p['OBJECTID'], name=name, open=share, inBuilding=inb, why=why))
            continue
        for part in clip_circle([plan(E, N) for E, N in line], RADIUS):
            roads.append(dict(id='road:%d' % p['OBJECTID'], name=name, nameZh=p['STREET_CNAME'], level=p['ELEVATION'],
                              line=[[round(x, 2), round(z, 2)] for x, z in part],
                              width=round(width, 1) if width else None,
                              widthRule='kerb to kerb on the 1987 sheet, median of the cross sections' if width else 'not measured'))

    # 5. Open ground of note.
    ground = []
    for g in inp['openGround']:
        ring = g.get('ring') or csdi[g['csdi']]['rings'][0]
        P = [plan(E, N) for E, N in ring]
        if area(P) < 0:
            P.reverse()
        o = on_plate(P, plate)
        for part in (off_plate(P, plate, res=0.1) if o > 0.01 else [P]):
            ground.append(dict(name=g['name'], nameZh=g.get('nameZh'), kind=g['kind'], ring=rnd(part),
                               note=g['note'] + (' The part on the City plate is left out.' if o > 0.01 else ''),
                               outline='CSDI footprint' if g.get('csdi') else 'hand-drawn on the 1987 sheet, to about 3 m'))

    reg = json.load(open(os.path.join(dl, 'register.json')))
    registration = {}
    for k, v in reg.items():
        for no, s in v.items():
            res = [math.hypot(dE - s['dE'], dN - s['dN']) for _, dE, dN in s['points']]
            registration['%s %s' % (no, s['date'])] = dict(set=k, controls=s['controls'], dE=s['dE'], dN=s['dN'], rms=s['rms'],
                                                           p90=s['p90'], max=round(max(res), 2))
    near = lambda r, R: all(math.hypot(x, z) <= R for x, z in r)
    count = lambda R, pred=lambda b: True: sum(1 for b in out if near(b['ring'], R) and pred(b))
    head = dict(
        about='The buildings, roads and open ground round Kowloon Walled City as they stood in December 1986, '
              'within %d m of the centre of the plan box. Data only: the app does not draw it yet.' % RADIUS,
        notice=NOTICE,
        units='metres', frame='plan: x and z as in data/plan.json, with the origin at the centre of the plan box '
              '(the scene frame of src/layout.js); y up; base 0 for every building',
        transform=dict(E0=E0, N0=N0, bearingDeg=BEARING, th=fit['th'], dx=fit['dx'], dz=fit['dz'],
                       formula='dE = E - E0, dN = N - N0; x0 = sin(b) dE + cos(b) dN, z0 = cos(b) dE - sin(b) dN; '
                               'x = cos(th) (x0 - dx) + sin(th) (z0 - dz), z = -sin(th) (x0 - dx) + cos(th) (z0 - dz)',
                       grid='HK1980 Grid (EPSG:2326)', cityFit=fit),
        plate=dict(x0=plate[0], z0=plate[1], x1=plate[2], z1=plate[3], note='the City plate: the plan box and MARGIN of src/layout.js'),
        plateClipped=clipped,
        sheets=dict(late={s['no']: s['date'] for s in late.sheets}, early={s['no']: s['date'] for s in early.sheets}),
        registration=registration,
        storeyHeight=H0,
        rules={
            'dated': 'CSDI footprint with an OP or a completion date before 1987 (Buildings Department)',
            'undated': 'CSDI footprint with no date, on the 1984-85 and the 1987 sheets (edge share 0.8 or more on both)',
            'lot': 'CSDI footprint from 1987 on, under 400 m2 and not a thin strip, on both sheets (edge share 0.9 or more): the 1986 building on the same lot lines',
            'traced': 'outline traced on the 1987 sheet and checked by eye; not in CSDI now',
            'plate': 'a building that the City plate partly covers has one record for each part off the plate; '
                     'plateClipped has its whole 1987 outline (ring), which stands partly on the plate',
            'height': 'CSDI TopHeight - BaseHeight; else storeys x %.1f m; else INFERRED by the stated rule' % H0},
        counts=dict(buildings=len(out), within400=count(400), within600=count(600),
                    byKind={k: sum(1 for b in out if b['kind'] == k) for k in ('dated', 'undated', 'lot', 'traced')},
                    sourcedHeight=sum(1 for b in out if b['confidence'] == 'sourced'),
                    clippedByPlate=len(clipped),
                    droppedOnPlate=dropped['plate'], droppedBeyondRadius=dropped['radius'],
                    roads=len(roads), roadsLeftOut={w: sum(1 for d in rdrop if d['why'] == w) for w in sorted({d['why'] for d in rdrop})},
                    openGround=len(ground)),
        leftOut=inp.get('leftOut', []))
    data = dict(head, buildings=out, roads=roads, openGround=ground)
    dump_lines(data, os.path.join(REPO, 'data/context.json'))
    print(json.dumps(head['counts'], ensure_ascii=False))
    json.dump(rdrop, open(os.path.join(dl, 'roads_left_out.json'), 'w'), indent=0)
    print('roads left out:', len(rdrop), sorted({d['name'] or '-' for d in rdrop}))


def main():
    cmd, dl = sys.argv[1], sys.argv[2]
    if cmd == 'fetch':
        fetch(dl)
    elif cmd == 'fit':
        print(json.dumps(fit_city(dl)))
    elif cmd == 'register':
        rep = register(dl)
        json.dump(rep, open(os.path.join(dl, 'register.json'), 'w'), indent=1)
    elif cmd == 'trace':
        sel = select_csdi(dl, load_input(), shares_of(dl))
        cands = trace(dl, [b['rings'][0] for _, b in sel.values()], load_input()['fit'])
        json.dump(cands, open(sys.argv[3], 'w'))
        print(len(cands), 'candidate outlines in', sys.argv[3])
    elif cmd == 'build':
        build(dl)


if __name__ == '__main__':
    main()
