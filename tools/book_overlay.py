"""Lay two plans from *City of Darkness Revisited* (2014) over the traced plan grid.

- The 1987 figure-ground plan (p134): which plots stood as one building in 1987.
- The 1992 map by Anna Dalgliesh (pp352-353): its 40 numbered places and street names.

The scans are copyrighted and stay in primary-sources/city-of-darkness-revisited/local/
(git ignores it). This tool writes only numbers: data/book_overlay.json. Previews go to
local/overlay/.

    .venv/bin/python -I tools/book_overlay.py [REPO]

Run it with the pipeline venv (OpenCV, NumPy):
primary-sources/city-of-darkness-revisited/local/pipeline/.venv/bin/python.

Method. Each scan is fitted to the plot mask of data/plan.json with a homography (OpenCV
ECC on blurred masks, from four corner points read by hand). The figure-ground plan is cut
into buildings by its shades and outlines. Each plot then votes for the 1987 building
under most of its cells. Touching plots with the same building, each with at least
SHARE of its cells on it, join into one tower. The map's discs are found by template
match near the places read by eye, and two are set by hand.
"""
import json
import os
import sys
from collections import Counter, defaultdict

import cv2
import numpy as np

REPO = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..'))
BOOK = os.path.join(REPO, 'primary-sources/city-of-darkness-revisited/local')
EX = os.path.join(BOOK, 'extracts')
PREVIEW = os.path.join(BOOK, 'overlay')
S = 4  # px per plan cell in the fit
SHARE = 0.6  # 0.6 gives 296 towers; the book gives "around 300" (p134, p340)

ALPH = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'


def decode(plan):
    val = {c: i for i, c in enumerate(ALPH)}
    code = np.zeros((plan['D'], plan['W']), np.int32)
    for j, row in enumerate(plan['rows']):
        code[j] = [val[row[2 * i]] * 64 + val[row[2 * i + 1]] for i in range(plan['W'])]
    return code


def fit(tmpl, img, pts_plan, pts_img):
    """Homography from plan px (S per cell) to scan px, and the IoU of the two masks."""
    src = np.float32([[x * S, y * S] for x, y in pts_plan])
    H = cv2.getPerspectiveTransform(src, np.float32(pts_img)).astype(np.float32)
    crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6)
    for sig in (9, 5, 3):
        t, i = cv2.GaussianBlur(tmpl, (0, 0), sig), cv2.GaussianBlur(img, (0, 0), sig)
        _, H = cv2.findTransformECC(t, i, H, cv2.MOTION_HOMOGRAPHY, crit, None, 5)
    h, w = tmpl.shape
    warped = cv2.warpPerspective(img, H, (w, h), flags=cv2.INTER_LINEAR + cv2.WARP_INVERSE_MAP)
    iou = ((warped > 0.5) & (tmpl > 0.5)).sum() / ((warped > 0.5) | (tmpl > 0.5)).sum()
    return H, float(iou), warped


def cell_samples(H, D, W):
    """Scan px under the centre of each plan cell."""
    ii, jj = np.meshgrid(np.arange(W), np.arange(D))
    p = np.stack([(ii + 0.5) * S, (jj + 0.5) * S, np.ones((D, W))], -1) @ H.T
    return np.round(p[..., 0] / p[..., 2]).astype(int), np.round(p[..., 1] / p[..., 2]).astype(int)


def sample(img, fx, fy):
    ok = (fx >= 0) & (fy >= 0) & (fx < img.shape[1]) & (fy < img.shape[0])
    out = np.zeros(fx.shape, img.dtype)
    out[ok] = img[fy[ok], fx[ok]]
    return out


def to_plan(H, x, y):
    p = np.linalg.inv(H) @ [x, y, 1]
    return p[0] / p[2] / S, p[1] / p[2] / S


def segment_figure_ground(g):
    """Label each building of the 1987 figure-ground plan. Buildings are grey tones in
    black outlines; neighbours differ in tone or are split by an outline."""
    bld = g < 234
    bh = cv2.morphologyEx(g, cv2.MORPH_BLACKHAT, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)))
    outline = (bh > 9) | (g < 70)
    tone = np.digitize(cv2.medianBlur(g, 3), [104, 148, 196, 234])
    inner = bld & ~outline
    lab = np.zeros(g.shape, np.int32)
    nxt = 1
    for c in range(4):
        m = (inner & (tone == c)).astype(np.uint8)
        n, l = cv2.connectedComponents(m, connectivity=4)
        l[l > 0] += nxt - 1
        lab[m > 0] = l[m > 0]
        nxt += n
    small = np.bincount(lab.ravel()) < 40
    small[0] = True
    lab[small[lab]] = 0
    # Outline pixels go to the nearest building, up to 4 px away.
    free = (lab == 0).astype(np.uint8)
    dist, idx = cv2.distanceTransformWithLabels(free, cv2.DIST_L2, 5, labelType=cv2.DIST_LABEL_PIXEL)
    ys, xs = np.nonzero(free == 0)
    lut = np.zeros(idx.max() + 1, np.int32)
    lut[idx[ys, xs]] = lab[ys, xs]
    full = lut[idx]
    full[~bld | (dist > 4)] = 0
    return bld, full


# The 40 discs of the 1992 map, read by eye on a 2000 px wide copy (x 3290/2000 for the scan).
DISCS = {1: (866, 286), 2: (494, 534), 3: (775, 775), 4: (900, 286), 5: (1031, 690), 6: (247, 146), 7: (1259, 800),
         8: (587, 285), 9: (1105, 590), 10: (1098, 813), 11: (807, 190), 12: (1302, 367), 13: (487, 637), 14: (1153, 710),
         15: (918, 171), 16: (781, 443), 17: (334, 523), 18: (1233, 762), 19: (502, 410), 20: (260, 358), 21: (1153, 750),
         22: (1199, 748), 23: (497, 605), 24: (275, 535), 25: (834, 492), 26: (788, 425), 27: (748, 550), 28: (689, 591),
         29: (1009, 686), 30: (478, 703), 31: (980, 302), 32: (915, 666), 33: (988, 160), 34: (535, 715), 35: (339, 391),
         36: (1263, 570), 37: (815, 593), 38: (1268, 716), 39: (872, 615), 40: (567, 592)}
# Template match fails on these two (26 finds disc 16; 38 is under a label): scan px by hand.
DISC_FIX = {26: (1296, 699), 38: (2087, 1180)}
# Street names on the map, read the same way. The first group is not in data/plan.json.
STREET_LABELS = {
    'abs': ((745, 318), 'ew'),  # Almshouse Back Street
    'tts': ((1012, 280), 'ns'),  # Tin Hau Temple Street
    'lcb': ((800, 650), 'ew'),  # Lung Chun Back Road
    'tcn': ((340, 236), 'ew'),  # Tai Chang Street, north-west leg
    # Check: these are in data/plan.json already.
    'tcs': ((472, 640), 'ns'), 'lys': ((900, 480), 'ns'), 'kms': ((1115, 400), 'ns'), 'lsr': ((1232, 430), 'ns'),
    'ssr': ((242, 390), 'ns'),
}
PLAN_LABEL = {'tcs': 'Tai Chang St 大井街', 'lys': 'Lo Yan St 老人街', 'kms': 'Kwong Ming St 光明街',
              'lsr': 'Lung Shing Rd 龍城路', 'ssr': 'Sai Shing Rd 西城路'}
MAP_SCALE = 3290 / 2000


def main():
    plan = json.load(open(os.path.join(REPO, 'data/plan.json')))
    code = decode(plan)
    D, W = code.shape
    os.makedirs(PREVIEW, exist_ok=True)
    plot = cv2.resize((code >= 4).astype(np.float32), (W * S, D * S), interpolation=cv2.INTER_NEAREST)
    corners = [(14, 14), (222, 8), (237, 148), (22, 147)]

    # ---- the 1987 figure-ground plan ----
    fg = cv2.imread(os.path.join(EX, 'p134_1987-figure-ground-plan.png'))
    fg[:40, :400] = 255  # a corner of the 1962 plan above it
    g = cv2.cvtColor(fg, cv2.COLOR_BGR2GRAY)
    bld, lab = segment_figure_ground(g)
    Hfg, iou_fg, warped = fit(plot, bld.astype(np.float32), corners, [(25, 285), (830, 45), (1050, 545), (215, 778)])
    fx, fy = cell_samples(Hfg, D, W)
    cell_lab, cell_bld = sample(lab, fx, fy), sample(bld.astype(np.uint8), fx, fy)

    # ---- the 1992 map: its orange blocks ----
    mp = cv2.imread(os.path.join(EX, 'p352-353_1992-the-map.png'))
    hsv = cv2.cvtColor(mp, cv2.COLOR_BGR2HSV)
    orange = ((hsv[..., 1] > 45) & (hsv[..., 0] < 28) & (hsv[..., 2] > 120)).astype(np.float32)
    orange[:, 2540:] = 0  # the key
    Hmp, iou_mp, warped_mp = fit(plot, orange, corners, [(337, 178), (1941, 222), (2130, 1365), (345, 1225)])
    mx, my = cell_samples(Hmp, D, W)
    cell_orange = sample(orange.astype(np.uint8), mx, my)

    # ---- plots -> towers ----
    votes, cover, orng, size = defaultdict(Counter), Counter(), Counter(), Counter()
    for c, l, b, o in zip(code.ravel(), cell_lab.ravel(), cell_bld.ravel(), cell_orange.ravel()):
        if c < 4:
            continue
        votes[c][l] += 1
        size[c] += 1
        cover[c] += int(b)
        orng[c] += int(o)
    best, share = {}, {}
    for c, v in votes.items():
        l, m = max(((l, m) for l, m in v.items() if l > 0), key=lambda t: t[1], default=(0, 0))
        best[c], share[c] = int(l), m / size[c]
    keep = set(plan['yamenPlots']) | set(plan['named'].values())
    parent = {c: c for c in votes}

    def find(c):
        while parent[c] != c:
            parent[c] = parent[parent[c]]
            c = parent[c]
        return c
    ok = {c for c in votes if best[c] > 0 and share[c] >= SHARE and c not in keep}
    for a, b in ((code[:, :-1], code[:, 1:]), (code[:-1, :], code[1:, :])):
        m = (a != b) & (a >= 4) & (b >= 4)
        for p, q in set(zip(a[m].tolist(), b[m].tolist())):
            if p in ok and q in ok and best[p] == best[q]:
                parent[find(p)] = find(q)
    groups = defaultdict(list)
    for c in votes:
        groups[find(c)].append(int(c))
    towers = sorted(sorted(v) for v in groups.values())
    # Plots with no building in 1987 and no block on the 1992 map: low huts or open sheds.
    low = sorted(int(c) for c in votes if c not in keep and cover[c] / size[c] < 0.3 and orng[c] / size[c] < 0.35)

    # ---- the map's discs ----
    gm = cv2.cvtColor(mp, cv2.COLOR_BGR2GRAY)
    T = np.full((31, 31), 200, np.uint8)
    cv2.circle(T, (15, 15), 11, 30, -1)
    markers, px = {}, {}
    for n, (dx, dy) in DISCS.items():
        if n in DISC_FIX:
            x, y = DISC_FIX[n]
        else:
            x0, y0 = int(dx * MAP_SCALE - 45), int(dy * MAP_SCALE - 45)
            r = cv2.matchTemplate(gm[y0:y0 + 90, x0:x0 + 90], T, cv2.TM_CCOEFF_NORMED)
            loc = cv2.minMaxLoc(r)[3]
            x, y = x0 + loc[0] + 15, y0 + loc[1] + 15
        px[n] = (x, y)
        i, j = to_plan(Hmp, x, y)
        markers[str(n)] = [round(i, 1), round(j, 1)]

    # ---- street names, snapped to the nearest lane cell ----
    lane = np.argwhere(code == 1)
    streets, check = {}, {}
    for key, ((dx, dy), d) in STREET_LABELS.items():
        i, j = to_plan(Hmp, dx * MAP_SCALE, dy * MAP_SCALE)
        jj, ii = lane[np.argmin((lane[:, 0] - j) ** 2 + (lane[:, 1] - i) ** 2)]
        if key in PLAN_LABEL:
            pi, pj, _ = plan['streets'][PLAN_LABEL[key]]
            check[key] = round(float(np.hypot(ii - pi, jj - pj)), 1)
        else:
            streets[key] = [int(ii), int(jj), d]

    out = {
        'source': 'City of Darkness Revisited (2014): the 1987 figure-ground plan (p134) and the 1992 map by '
                  'Anna Dalgliesh (pp352-353). Fitted to data/plan.json by tools/book_overlay.py.',
        'note': 'Numbers only. Cells are plan cells of data/plan.json (i right, j down). APPROXIMATE: the map '
                '"cannot be considered entirely accurate" (p353), and the 1987 plan is small in the book.',
        'fit': {'figureGroundIoU': round(iou_fg, 3), 'mapIoU': round(iou_mp, 3),
                'streetLabelError_m': check},
        'towers': {'share': SHARE, 'count': len(towers), 'groups': [t for t in towers if len(t) > 1]},
        'low': low,
        'markers': markers,
        'streets': streets,
    }
    with open(os.path.join(REPO, 'data/book_overlay.json'), 'w') as f:
        json.dump(out, f, separators=(',', ':'))
        f.write('\n')
    print('fit IoU: figure-ground', out['fit']['figureGroundIoU'], 'map', out['fit']['mapIoU'])
    print('street label error (m):', check)
    print('towers', len(towers), 'joined groups', len(out['towers']['groups']), 'low', low)

    # ---- previews (local only) ----
    vis = np.zeros((D * S, W * S, 3), np.uint8)
    vis[..., 2] = (plot * 255).astype(np.uint8)
    vis[..., 1] = (np.clip(warped, 0, 1) * 255).astype(np.uint8)
    cv2.imwrite(os.path.join(PREVIEW, 'fit_figure_ground.png'), vis)
    vis[..., 1] = (np.clip(warped_mp, 0, 1) * 255).astype(np.uint8)
    for n, (i, j) in markers.items():
        cv2.circle(vis, (int(i * S), int(j * S)), 6, (255, 255, 255), 1)
        cv2.putText(vis, n, (int(i * S) + 7, int(j * S) - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
    for k, (i, j, _) in streets.items():
        cv2.putText(vis, k, (i * S, j * S), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 200, 0), 1)
    cv2.imwrite(os.path.join(PREVIEW, 'fit_map.png'), vis)
    rng = np.random.default_rng(1)
    col = {t[0]: rng.integers(70, 230, 3) for t in towers}
    tid = {c: t[0] for t in towers for c in t}
    img = np.full((D, W, 3), 255, np.uint8)
    for c, t in tid.items():
        img[code == c] = col[t]
    for c in low:
        img[code == c] = (40, 40, 40)
    img = cv2.resize(img, (W * S, D * S), interpolation=cv2.INTER_NEAREST)
    cv2.imwrite(os.path.join(PREVIEW, 'towers.png'), img)


if __name__ == '__main__':
    main()
