"""Fit the base plan of Suenn Ho's (何巽) route maps (M+ CA17/2/1-3, 1991) to data/plan.json.

The base plan prints the house number of most lots. The reading is in data/address_anchors.json
(text and pixel of copy CA17/2/3): two readers read each tile of the north half on the three
copies side by side (reader A and B; where they differ, the reading with the higher confidence,
"disputed"), and the street frontages of the south half were read on 5x crops of the copies
(reader C). This tool:

1. aligns copies CA17/2/1 and CA17/2/2 to CA17/2/3 (OpenCV ECC homography on the black ink),
2. fits data/plan.json to copy CA17/2/3 (ECC homography of the plot edges on the ink, from four
   corner points read by hand), and measures the local drift in 40 m squares,
3. writes the reading tiles (copy CA17/2/3 with the other two aligned under it, 4x, with a grid
   in map pixels) to primary-sources/mplus-suenn-ho-ca17/local/tiles/ (git ignores it), and
4. writes the plan point (metres, plan cells) of each label into data/address_anchors.json.

The scans stay in primary-sources/mplus-suenn-ho-ca17/local/ (git ignores it). The data file has
numbers only. Run it with the pipeline venv (OpenCV, NumPy):

    primary-sources/city-of-darkness-revisited/local/pipeline/.venv/bin/python -I tools/route_map_fit.py [REPO]
"""
import json
import os
import sys

import cv2
import numpy as np

REPO = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.join(REPO, 'tools'))
from book_overlay import decode  # noqa: E402

SRC = os.path.join(REPO, 'primary-sources/mplus-suenn-ho-ca17/local')
COPIES = {'1': 'CA17-2-1_011826_003.jpg', '2': 'CA17-2-2_011827_003.jpg', '3': 'CA17-2-3_011828_003.jpg'}
S = 4  # px per plan cell in the fit
PLAN_CORNERS = [(14, 14), (222, 8), (237, 148), (22, 147)]  # the corners of the City in data/plan.json
MAP_CORNERS = [(232, 72), (948, 60), (948, 560), (225, 548)]  # the same corners on copy CA17/2/3, read by hand
CRIT = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 400, 1e-7)


def ink(bgr):
    """The black ink of the plan, not the coloured routes."""
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    return ((g < 110) & (hsv[..., 1] < 90)).astype(np.float32)


def align_copies(img):
    ref = ink(img['3'])
    out = {'3': img['3']}
    for k in ('1', '2'):
        h = np.eye(3, dtype=np.float32)
        for sig in (12, 7, 4, 2):
            _, h = cv2.findTransformECC(cv2.GaussianBlur(ref, (0, 0), sig), cv2.GaussianBlur(ink(img[k]), (0, 0), sig), h,
                                        cv2.MOTION_HOMOGRAPHY, CRIT, None, 5)
        out[k] = cv2.warpPerspective(img[k], h, (ref.shape[1], ref.shape[0]), flags=cv2.INTER_LINEAR + cv2.WARP_INVERSE_MAP,
                                     borderValue=(255, 255, 255))
    return out


def plan_edges(code):
    D, W = code.shape
    big = cv2.resize(code.astype(np.float32), (W * S, D * S), interpolation=cv2.INTER_NEAREST).astype(np.int32)
    return ((np.abs(np.diff(big, axis=0, prepend=big[:1])) > 0) | (np.abs(np.diff(big, axis=1, prepend=big[:, :1])) > 0)).astype(np.float32)


def fit_plan(edge, m):
    src = np.float32([[x * S, y * S] for x, y in PLAN_CORNERS])
    H = cv2.getPerspectiveTransform(src, np.float32(MAP_CORNERS)).astype(np.float32)
    for sig in (14, 9, 6, 4, 3):
        _, H = cv2.findTransformECC(cv2.GaussianBlur(edge, (0, 0), sig), cv2.GaussianBlur(m, (0, 0), sig / 2.5), H,
                                    cv2.MOTION_HOMOGRAPHY, CRIT, None, 5)
    return H


def drift(edge, m, H, D, W):
    """The shift (metres) that best lays the map ink on the plot edges, in 60 m squares every 40 m."""
    inkP = cv2.warpPerspective(m, H, (W * S, D * S), flags=cv2.INTER_LINEAR + cv2.WARP_INVERSE_MAP)
    crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6)
    out = []
    for j0 in range(0, D, 40):
        for i0 in range(0, W, 40):
            a, b = edge[j0 * S:(j0 + 60) * S, i0 * S:(i0 + 60) * S], inkP[j0 * S:(j0 + 60) * S, i0 * S:(i0 + 60) * S]
            if a.sum() < 200 or b.sum() < 200:
                continue
            w = np.eye(2, 3, dtype=np.float32)
            try:
                for sig in (8, 5, 3):
                    _, w = cv2.findTransformECC(cv2.GaussianBlur(a, (0, 0), sig), cv2.GaussianBlur(b, (0, 0), sig), w, cv2.MOTION_TRANSLATION, crit, None, 5)
                out.append([i0 + 30, j0 + 30, round(float(w[0, 2]) / S, 2), round(float(w[1, 2]) / S, 2)])
            except cv2.error:
                pass
    return out


def tiles(al, dest):
    X0, X1, Y0, Y1, TW, TH, OV, Z, M = 200, 965, 35, 580, 190, 150, 35, 4, 44
    os.makedirs(dest, exist_ok=True)
    for ty, y in enumerate(range(Y0, Y1 - OV, TH - OV)):
        for tx, x in enumerate(range(X0, X1 - OV, TW - OV)):
            x1, y1 = min(x + TW, 1000), min(y + TH, 724)
            panels = []
            for k in ('3', '2', '1'):
                c = cv2.resize(al[k][y:y1, x:x1], None, fx=Z, fy=Z, interpolation=cv2.INTER_LANCZOS4)
                c = cv2.addWeighted(c, 1.6, cv2.GaussianBlur(c, (0, 0), 2), -0.6, 0)
                h, w = c.shape[:2]
                p = np.full((h + M, w + M, 3), 255, np.uint8)
                p[M:, M:] = c
                for gx in range((x // 10 + 1) * 10, x1, 10):
                    X = M + (gx - x) * Z
                    cv2.line(p, (X, M), (X, M + h), (230, 120, 40) if gx % 50 == 0 else (255, 170, 120), 1)
                    if gx % 20 == 0 or gx % 50 == 0:
                        cv2.putText(p, str(gx), (X - 14, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (200, 60, 0), 1)
                for gy in range((y // 10 + 1) * 10, y1, 10):
                    Y = M + (gy - y) * Z
                    cv2.line(p, (M, Y), (M + w, Y), (230, 120, 40) if gy % 50 == 0 else (255, 170, 120), 1)
                    if gy % 20 == 0 or gy % 50 == 0:
                        cv2.putText(p, str(gy), (2, Y + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (200, 60, 0), 1)
                cv2.putText(p, f'copy CA17/2/{k}', (M + 4, M + 22), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 220), 2)
                panels.append(p)
            im = np.vstack([np.vstack([q, np.full((12, q.shape[1], 3), 90, np.uint8)]) for q in panels])
            cv2.imwrite(os.path.join(dest, f'tile_r{ty}_c{tx}.png'), im)


def main():
    img = {k: cv2.imread(os.path.join(SRC, v)) for k, v in COPIES.items()}
    al = align_copies(img)
    plan = json.load(open(os.path.join(REPO, 'data/plan.json')))
    code = decode(plan)
    D, W = code.shape
    edge, m = plan_edges(code), ink(img['3'])
    H = fit_plan(edge, m)
    dr = drift(edge, m, H, D, W)
    tiles(al, os.path.join(SRC, 'tiles'))
    path = os.path.join(REPO, 'data/address_anchors.json')
    data = json.load(open(path))
    Hi = np.linalg.inv(H.astype(np.float64))
    for a in data['labels']:
        p = Hi @ [a['px'][0], a['px'][1], 1]
        a['plan'] = [round(p[0] / p[2] / S, 2), round(p[1] / p[2] / S, 2)]
    inner = [d for d in dr if max(abs(d[2]), abs(d[3])) < 3]
    data['fit'] = {
        'planToMap': [[round(float(v), 6) for v in r] for r in H.tolist()], 'pxPerCell': S,
        'mapPxPerMetre': round(float(np.linalg.norm((H @ [S * 100, 0, 1])[:2] / (H @ [S * 100, 0, 1])[2] - H[:2, 2] / H[2, 2]) / 100), 3),
        'drift_m': dr,
        'medianDrift_m': round(float(np.median([np.hypot(d[2], d[3]) for d in inner])), 2) if inner else None,
    }
    json.dump(data, open(path, 'w'), ensure_ascii=False, indent=1)
    print('labels', len(data['labels']), 'median drift (m)', data['fit']['medianDrift_m'])


if __name__ == '__main__':
    main()
