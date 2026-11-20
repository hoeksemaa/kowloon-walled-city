"""Write docs/source-images.md: an index of the images of the source folders.

    python3 -I tools/source_images.py

It reads the "Files" lines that the reading of 2026-11 wrote under each item of each SOURCE.md
(primary-sources/ and secondary-sources/), and keeps the images (jpg, png, gif, webp, tif) and the
scans in PDF. For each it gives the date of the record, what it shows, the folder and item, and where
the file is: in git, in local/ (on the machine that downloaded it; git ignores local/), or only at its
URL. It also counts the other images in each local/ folder: the SOURCE.md of that folder describes
them. Run it again after each assembly of the reading.
"""
import os, re, glob, collections

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT = os.path.join(ROOT, 'docs', 'source-images.md')
IMG = re.compile(r'\.(jpe?g|png|gif|webp|tiff?)(\?|$)', re.I)
PDF = re.compile(r'\.pdf(\?|$)', re.I)
DL = re.compile(r'^  - `([^`]+)` \((in git|in `local/`, not in git)\): (.*?); (https?://\S+?); (\d+|\?) bytes;')
ND = re.compile(r'^  - not downloaded(?: \(([^)]*)\))?: (.*?); (https?://\S+?); licence:')


def kind(name, url):
    for s in (name or '', url or ''):
        if IMG.search(s):
            return 'image'
        if PDF.search(s):
            return 'pdf'
    return None


rows, listed = [], set()
for src in sorted(glob.glob(os.path.join(ROOT, '*-sources', '*', 'SOURCE.md'))):
    folder = os.path.relpath(os.path.dirname(src), ROOT)
    item = date = None
    in_files = False
    for line in open(src, encoding='utf-8'):
        line = line.rstrip('\n')
        if line.startswith('### '):
            item = line[4:].split(':', 1)[0]
            date, in_files = None, False
        elif line.startswith('- **Date of the record:**'):
            date = line.split(':**', 1)[1].strip()
        elif line.startswith('- **Files:**'):
            in_files = True
        elif in_files and line.startswith('  - '):
            m = DL.match(line)
            if m:
                name, where, what, url = m.group(1), m.group(2), m.group(3), m.group(4)
                k = kind(name, url)
                if k:
                    path = os.path.join(folder, name) if where == 'in git' else os.path.join(folder, 'local', name)
                    listed.add(os.path.normpath(path))
                    rows.append((date or '', folder, item, k, what, '`' + path + '`' + (' (git)' if where == 'in git' else ' (local)')))
                continue
            m = ND.match(line)
            if m:
                what, url = m.group(2), m.group(3)
                k = kind('', url)
                if k:
                    rows.append((date or '', folder, item, k, what, url + ' (not downloaded)'))
        else:
            in_files = False

# images in local/ folders that no reading block names (older folders describe them in their SOURCE.md)
other = collections.Counter()
for p in glob.glob(os.path.join(ROOT, '*-sources', '*', 'local', '**', '*'), recursive=True):
    if os.path.isfile(p) and IMG.search(p):
        rel = os.path.relpath(p, ROOT)
        if os.path.normpath(rel) not in listed:
            other[os.path.relpath(p, ROOT).split('/local/')[0]] += 1


def year(d):
    m = re.search(r'(1[89]\d\d|20\d\d)', d)
    return m.group(1) if m else '9999'


rows.sort(key=lambda r: (year(r[0]), r[1], r[2] or '', r[4]))
cell = lambda s: (s or '').replace('|', '\\|')
n_img = sum(r[3] == 'image' for r in rows)
lines = [
    '# Source images',
    '',
    'An index of the images and PDF scans of the source folders, made by `tools/source_images.py` from the',
    '"Files" lines of the reading of 2026-11. Do not edit it by hand: run the script again.',
    '',
    f'- {n_img} images and {len(rows) - n_img} PDFs, sorted by the year of the record.',
    '- "(git)": the file is in the repo, with an open licence. "(local)": the file is in the `local/` folder of',
    '  its source, which git ignores: it exists only on the machine that downloaded it, and its licence does',
    '  not allow a copy in git. "(not downloaded)": only the URL.',
    '- The facts of each item are in the SOURCE.md of its folder, under the item id.',
    '',
    '| Date of the record | What it shows | Source (folder, item) | Kind | File |',
    '|---|---|---|---|---|',
]
for d, folder, item, k, what, where in rows:
    lines.append(f'| {cell(d)} | {cell(what)} | [`{folder}`](../{folder}/SOURCE.md), {cell(item)} | {k} | {cell(where)} |')
if other:
    lines += ['', '## Other images in local/ folders', '',
              'The SOURCE.md of each of these folders describes its images (they are older than the reading of 2026-11).', '',
              '| Folder | Images |', '|---|---|']
    for f, n in sorted(other.items(), key=lambda x: -x[1]):
        lines.append(f'| [`{f}`](../{f}/SOURCE.md) | {n} |')
open(OUT, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print(f'{os.path.relpath(OUT, ROOT)}: {n_img} images, {len(rows) - n_img} PDFs; other local images: {sum(other.values())} in {len(other)} folders')
