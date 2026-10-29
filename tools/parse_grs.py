"""Parse the GRS business case-file titles (HKRS1255-3) into premises for the model.

Input:  primary-sources/grs-catalogue-kwc/grs-hkrs1255-3.csv (GRS catalogue data).
Output: data/businesses.json, one record for each premises: street, house number, floor,
        English and Chinese names, trade, and the GRS references of its files.

The titles were written by the clearance officers. Their form varies, so the parse is a
best effort: a title with no street or number is kept with the fields it has.

    python3 tools/parse_grs.py
"""
import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'primary-sources/grs-catalogue-kwc/grs-hkrs1255-3.csv'
OUT = ROOT / 'data/businesses.json'

STREETS = [
    ('ttt', r'T\.?\s?T\.?\s?T\.?\s*R|Tung\s*Tau\s*(Tsuen|Chuen|Tseun)|東頭村道'),
    ('lcr', r'Lung\s*Chu[n]?\s*R|L\.?\s?C\.?\s*R(oa)?d|龍津道'),
    ('lsr', r'Lung\s*Shing\s*R|L\.?\s?S\.?\s*R(oa)?d|龍城路'),
    ('ssr', r'Sai\s*Shing|S\.?\s?S\.?\s*R(oa)?d|SS\s*\[|西城路'),
    ('kms', r'Kwong\s*Ming|K\.?\s?M\.?\s*St|光明街'),
    ('tcs', r'Tai\s*(Chang|Tseng|Cheng)|T\.?\s?C\.?\s*St|TC\s*\[|大井街'),
    ('lys', r'Lo\s*Yan|L\.?\s?Y\.?\s*St|老人街'),
    ('tht', r'T\.?\s?H\.?\s?T\.?\s*Back|Tin\s*Hau\s*Temple\s*Back|天后廟後街'),
    ('skg', r'Sz\s*Kung|Sze\s*Kung|社公街'),
    ('lsg', r'Lung\s*Sing\s*St|龍城街'),
    ('kwg', r'Kwong\s*Wah|光華街'),
]
STREET_NAMES = {
    'ttt': 'Tung Tau Tsuen Road 東頭村道', 'lcr': 'Lung Chun Road 龍津道', 'lsr': 'Lung Shing Road 龍城路',
    'ssr': 'Sai Shing Road 西城路', 'kms': 'Kwong Ming Street 光明街', 'tcs': 'Tai Chang Street 大井街',
    'lys': 'Lo Yan Street 老人街', 'tht': 'Tin Hau Temple Back Street', 'skg': 'Sz Kung Street 社公街',
    'lsg': 'Lung Sing Street', 'kwg': 'Kwong Wah Street',
}

# Trade from words in the title; the first match wins.
TRADES = [
    ('kaifong', r'kai\s*fong|街坊'),
    ('temple', r'土地廟|福德|Fuk\s*Tak'),
    ('dentist', r'dent|牙'),
    ('bonesetter', r'bone\s*-?\s*setter|跌打|骨'),
    ('clinic', r'clinic|medical|醫務|診所|醫館|中醫|西醫|doctor|Dr\.'),
    ('medicine', r'medicine|藥|herb'),
    ('school', r'tuition|補習|school|學校|kindergarten|幼稚'),
    ('salon', r'hair|髮|美容|salon|barber'),
    ('catering', r'catering|伙食'),
    ('cafe', r'caf[eé]|冰室|茶餐'),
    ('plastics', r'plastic|塑膠|膠'),
    ('fishball', r'fish\s*ball|魚蛋|魚丸|fish'),
    ('noodles', r'noodle|麵|粉麵'),
    ('roastmeat', r'roast|燒臘|燒味|goose|鵝'),
    ('meat', r'meat|肉|beef|pork|牛|豬'),
    ('cakes', r'cake|餅|bak(ery|er)|饅頭|點心|点心|dim\s*sum|confection|糖果'),
    ('food', r'food|食品|bean|豆|soy|醬|sauce|egg|蛋|peanut|花生|瓜子'),
    ('eatinghouse', r'restaurant|飯店|酒家|snack|小食|茶檔|cooked'),
    ('shoes', r'shoe|鞋|leather|皮'),
    ('garment', r'garment|製衣|衣|sewing|tailor|knit|毛衣|cloth'),
    ('textile', r'weav|紡織|textile|織|dye|染'),
    ('toys', r'toy|玩具'),
    ('plumbing', r'水電|plumb'),
    ('metal', r'metal|五金|iron|鐵|steel|鋼|alumin|engineer|machin|機械|機器|lathe|車床|electroplat|電鍍|weld|模|mould|mold'),
    ('electrical', r'electric|電器|電子|battery|radio|watch|錶'),
    ('printing', r'print|印刷|paper|紙|carton|box|盒'),
    ('jewellery', r'jewel|首飾|寶石|gem|gold|金行|銀製品'),
    ('optical', r'optical|眼鏡'),
    ('gas', r'gas|石油氣'),
    ('transport', r'transport|運輸'),
    ('construction', r'construct|建築|drill'),
    ('laundry', r'laundry|洗衣'),
    ('furniture', r'furniture|傢俬|家私'),
    ('property', r'property|地產'),
    ('storage', r'storage|貨倉'),
    ('store', r'store|士多|grocer|雜貨|provision|rice|米|茶莊|tea|fruit|菓|果'),
    ('factory', r'fty|factory|廠|works|workshop|製品|工藝|industr|實業|mfg|manufact'),
    ('trading', r'trading|貿易|company|co\.|行|公司|號'),
]

FLOOR = re.compile(r'\b(G|M|[0-9]{1,2})\s*/\s*F', re.I)
NUM = re.compile(r'(?:No\.?\s*)?\b([0-9]{1,3})([A-Z]?)(?:\s*[-–&+]\s*([0-9]{1,3})[A-Z]?)?\b')


def street_of(t):
    for key, pat in STREETS:
        m = re.search(pat, t, re.I)
        if m:
            return key, m.start()
    return None, -1


def parse(title):
    t = title.replace('　', ' ')
    rec = {}
    key, at = street_of(t)
    if key:
        rec['street'] = key
        # The house number is the last number before the street name.
        head = t[:at]
        head = FLOOR.sub(' ', head)
        head = re.sub(r'flat\s*[A-Z0-9]+', ' ', head, flags=re.I)
        nums = list(NUM.finditer(head))
        lane = re.search(r'([0-9]+)(st|nd|rd|th)\s*Lane', head, re.I)
        if lane:
            rec['lane'] = int(lane.group(1))
            nums = [m for m in nums if m.start() != lane.start()]
        nums = [m for m in nums if not (key == 'lcr' and int(m.group(1)) > 200)]
        if nums:
            m = nums[-1]
            rec['num'] = int(m.group(1))
            rec['numText'] = m.group(0).strip()
    fm = FLOOR.search(t)
    if fm:
        f = fm.group(1).upper()
        rec['floor'] = 0 if f in ('G', 'M') else int(f)
        if f == 'M':
            rec['mezz'] = True
    if re.search(r'cockloft|閣', t, re.I):
        rec['cockloft'] = True
    zh = re.findall(r'[㐀-鿿][㐀-鿿（）()·\s]*[㐀-鿿]', t)
    zh = [z for z in zh if not re.search(r'東頭村道|龍津道|龍城路|西城路|光明街|大井街|老人街', z)]
    if zh:
        rec['nameZh'] = max(zh, key=len).strip()
    # English business name: the part after the address, in brackets or after a dash.
    en = None
    m = re.search(r'\(([^()㐀-鿿]{3,})\)', t)
    if m and not re.match(r'\s*(Ledger|Workings|Receipts)', m.group(1), re.I):
        en = m.group(1)
    if not en:
        m = re.search(r'(?:Road|Rd\.?\]?|Street|St\.?\]?|City\]?)[.,\s]*-?\s*([A-Z][A-Za-z&.\'\s]{3,}?)(?:\s*[\(\[（]|$)', t)
        if m:
            en = m.group(1)
    if en:
        en = re.sub(r'\s+', ' ', en).strip(' .,-')
        en = re.sub(r'\b(Fty)\b\.?', 'Factory', en)
        en = re.sub(r'\bCo\b\.?', 'Co.', en)
        rec['nameEn'] = en
    for trade, pat in TRADES:
        if re.search(pat, t, re.I):
            rec['trade'] = trade
            break
    return rec


def main():
    rows = list(csv.DictReader(open(SRC, encoding='utf-8')))
    premises = {}
    for r in rows:
        title = r['title']
        if re.search(r'attendance book|^\[?index', title, re.I):
            continue
        p = parse(title)
        if 'street' not in p or 'num' not in p:
            continue
        key = (p['street'], p.get('lane'), p['num'], p.get('floor'), p.get('nameZh') or p.get('nameEn'))
        rec = premises.get(key)
        if rec is None:
            rec = premises[key] = {**p, 'refs': [], 'title': title, 'dates': r['dates']}
        rec['refs'].append(r['ref'])
    out = sorted(premises.values(), key=lambda p: (p['street'], p['num'], p.get('floor', 0)))
    data = {
        'source': 'GRS catalogue HKRS1255-3, case files for business claimants of the Kowloon Walled '
                  'City clearance (Lands Department). Titles parsed by tools/parse_grs.py.',
        'streets': STREET_NAMES,
        'premises': out,
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=0))
    from collections import Counter
    print('premises', len(out))
    print('by street', Counter(p['street'] for p in out))
    print('by floor', sorted(Counter(p.get('floor', -1) for p in out).items()))
    print('by trade', Counter(p.get('trade', '?') for p in out).most_common())
    for s in STREET_NAMES:
        ns = [p['num'] for p in out if p['street'] == s]
        if ns:
            print(s, min(ns), max(ns), len(set(ns)))


if __name__ == '__main__':
    main()
