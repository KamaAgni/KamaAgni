"""KamaAgni view clean-up list for the Library PDFs (v87, v88: boxes on every page, as the view now shows original pages).

G&J Passionate Press gave KamaAgni written permission (16/08/2026) to rebrand their PDFs. This tool scans every
page of every PDF in data/library.json and writes data/pdf-clean.json, which the KamaAgni view in
games/pdf-viewer.html uses to leave out everything that isn't KamaAgni content:
  s: pages to skip (thank-you / review / shop pages, advert pages for other products (v90), pages that are only a
     logo or a copyright notice)
  m: {page: [[x0, y0, x1, y1], ...]}  boxes (fractions of the page) to cover on any page: the G&J round logo
     (found by its shape, also when it stands alone), their name, Instagram handle, copyright small print, Etsy and
     shop lines, signatures and advert blocks. The viewer draws each original page and paints over these boxes.

Run (needs PyMuPDF and tesseract):  python3 tools/pdf-clean.py /folder/with/the/pdfs
The PDFs are expected as 00.pdf, 01.pdf ... in data/library.json order (download them from KamaAgni/KamaAgniPDF).
"""
import csv, json, os, re, subprocess, sys, tempfile
from concurrent.futures import ProcessPoolExecutor

import pymupdf

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else '/tmp/lib'

# lines that are the shop's branding, removed from text pages (kept in step with BRAND in pdf-viewer.html)
BRAND = re.compile(r'G\s*&\s*J(\s*P\s*A\s*S|\b)|passionate\s*_?press|copyright|©|all rights reserved|no part of this publication'
                   r'|in any form or by any means|prior written permission|etsy|gjpassionatepress|use code\s*:|discount code'
                   r'|files\.fm|doxzoo|@\s*gj_|gabriella|G\s*A\s*B\s*R\s*I\s*E\s*L\s*L\s*A', re.I)
# a page that is about the shop rather than the content
SHOP = re.compile(r'etsy|discount|future\s*updates|after\s*purchasing|cl(ic|ci)k\s*here|prepared\s*the\s*perfect\s*product|find\s*them\s*in\s*this\s*product|find\s*such\s*a\s*\w+\s*in\s*our|great\s*prizes\s*for|that.?s\s*why\s*i.?ve\s*prepared|as\s*part\s*of\s*a\s*bundle|co-?founder|thank\s*you\s*(so\s*much\s*)?(for\s*(your\s*)?(order|purchas|choosing|reading|trusting|shopping))'
                  r'|thank\s*you\s*once\s*again|files\.fm|doxzoo|our\s*(etsy\s*)?(shop|store)|in\s*our\s*shop|give\s*us\s*feedback'
                  r'|leave\s*(us\s*)?(a\s*)?(review|feedback)|feedback\s*if|you\s*made\s*our\s*day|downloads\s*are\s*not\s*available'
                  r'|click\s*on\s*any\s*product|very\s*proud\s*to\s*present|welcome\s*to\s*g\s*&\s*j|g\s*&\s*j\s*passionate\s*press\s*(was\s*born|store)'
                  r'|@\s*gj_|instagram|put\s*your\s*knowledge\s*into\s*practice|click\s*here\s*to\s*try|gabriella|need\s*help\s*with\s*any\s*of\s*your'
                  r'|share\s*your\s*progress|we\s*believe\s*in\s*creating\s*products|always\s*improving\s*our\s*products|leaderboard', re.I)
# a whole page about the shop (thank-you-for-your-order, "we're always improving our products", product promotion)
SHOPPAGE = re.compile(r'thank\s*you\W+for\s*your\s*order|we\s*believe\s*in\s*creating\s*products|always\s*improving\s*our\s*products'
                      r'|would\s*you\s*like\s*to\s*explore|files\.fm|discount\s*code|very\s*proud\s*to\s*present|click\s*here\s*an[d]?\s*get\s*it|so\s*we\s*promise\s*th', re.I)
# pages left out by hand, where the whole section is about the shop rather than the content
MANUAL = {
    # The Complete Naughty Guide: contents, about us, product FAQ, printing services and discount codes,
    # "our sex games" and Kink List product catalogues, "our task lists" catalogue, thank-you page
    # Whole Shop Bundle Overview: only the shop's download links for its products
    'WholeShopBundleFiles.pdf': list(range(1, 8)),
    'TheCompleteNaughtyGuide.pdf': [2] + list(range(3, 20)) + list(range(29, 44)) + list(range(54, 63)) + [74],
}
# files whose layout is the content (calendars, boards, dice nets, fill-in trackers): shown as cleaned pictures ('p': 1)
PICTURE = {'Naughty Board Game: Board (A4)', 'Escape the Dungeon: Board', 'BDSM Sex Dice', 'Sex Dice Game (A4)', 'Sex Wish List',
           'Punishment & Reward Tracker', '2026 Calendar (Sunday start)', '2026 Calendar (Monday start)', '2027 Calendar (Sunday start)',
           '2027 Calendar (Monday start)', 'Valentine’s Calendar', 'Christmas Advent Calendar', 'Naughty Advent Calendar',
           'Christmas Dice Game', 'Valentine’s Calendar (exclusive)'}
# v90: advert pages for the shop's other products (often the last pages): skipped so they aren't printed either
ADPAGE = re.compile(r"recommendations\s*for\s*the\s*best|what.?s\s*next\W|in\s*our\s*store|our\s*bestselling|explore\s*the\s*ultimate"
                    r"|we\s*have\s*created\s*cards\s*for\s*you|bundle\s*and\s*save", re.I)
SENT = re.compile(r'(?<=[.!?])\s+|\n{2,}')
WORD = re.compile(r"[A-Za-z][A-Za-z'’]+")


def words(t):
    t = re.sub(r'(?<=\b\w) (?=\w\b)', '', t)  # 'T a s k s' -> 'Tasks'
    return WORD.findall(t)


NAMEPAT = re.compile(r'G\s*&\s*J(\s*P\s*A\s*S|\b)|passionate\s*_?press', re.I)


def text_masks(pg):
    """v88 boxes (fractions of the page) to cover on a text page shown in its original layout: the G&J name with the
    round mark drawn above it, copyright / Etsy / email / Instagram lines, and shop sentences inside paragraphs."""
    W, H = pg.rect.width, pg.rect.height
    draws = None
    out = []
    def add(r, pad=2):
        out.append([round(max(0, r[0] - pad) / W, 4), round(max(0, r[1] - pad) / H, 4), round(min(W, r[2] + pad) / W, 4), round(min(H, r[3] + pad) / H, 4)])
    blocks = [b for b in pg.get_text('dict')['blocks'] if b.get('type') == 0]
    shopbb, whole = [], []
    for b in blocks:
        lines = [(''.join(s['text'] for s in l['spans']), l['bbox']) for l in b['lines']]
        lines = [(t, bb) for t, bb in lines if t.strip()]
        col = lambda x: re.sub(r'(?<=\b\w) (?=\w\b)', '', x)  # 'F U T U R E' -> 'FUTURE'
        btxt = col(' '.join(t for t, _ in lines))
        body = col(' '.join(t for t, _ in lines if not BRAND.search(t)))  # brand lines are covered on their own
        marked = set()
        for k, (t, bb) in enumerate(lines):
            if BRAND.search(t): marked.add(k)
        # shop sentences: cover the lines they sit on (a short shop-only block is covered whole)
        if SHOP.search(btxt):
            shopw = sum(len(words(x)) for x in SENT.split(body) if SHOP.search(x))
            # short shop-only blocks, and paragraphs that are mostly a plug, are covered whole (no half sentences left)
            if SHOP.search(body) and ((len(words(body)) <= 45 and shopw >= .4 * len(words(body))) or shopw >= .5 * len(words(body))):
                marked.update(range(len(lines))); whole.append(b['bbox'])
            else:
                for sen in SENT.split(body):
                    if not SHOP.search(sen): continue
                    for k, (t, _) in enumerate(lines):
                        tt = ' '.join(t.split())
                        if len(tt) > 3 and tt in sen: marked.add(k)
        if SHOP.search(btxt): shopbb.append(b['bbox'])
        for k in sorted(marked):
            t, bb = lines[k]
            x0, y0, x1, y1 = bb
            if NAMEPAT.search(t):  # the round mark is drawn just above the name
                tw = x1 - x0
                if draws is None: draws = [d['rect'] for d in pg.get_drawings()] + [pymupdf.Rect(i['bbox']) for i in pg.get_image_info()]
                zone = pymupdf.Rect(x0 - tw * .1, y0 - tw * .6, x1 + tw * .1, y0 + 1)
                near = [r for r in draws if zone.contains(r) and r.width < tw * .8 and r.height < tw * .8]
                if near:
                    x0 = min([x0] + [r.x0 for r in near]); y0 = min([y0] + [r.y0 for r in near]); x1 = max([x1] + [r.x1 for r in near])
                # (no guessing upward otherwise: the round logo is found by its shape in logo_masks)
            add((x0, y0, x1, y1), 3)
    # shop sentences that run across several lines or blocks: cover every line any part of them sits on
    allL = []
    for b in blocks:
        for l in b['lines']:
            t = ''.join(sp['text'] for sp in l['spans'])
            if t.strip(): allL.append((' '.join(t.split()), l['bbox']))
    full, offs = '', []
    for t, bb in allL:
        if BRAND.search(t) and not SHOP.search(t):  # name/copyright lines are covered on their own and end a sentence
            full += '. '; continue
        offs.append((len(full), len(full) + len(t), bb))
        letters = re.sub(r'[^A-Za-z]', '', t)
        full += t + ('. ' if letters and letters.isupper() and not re.search(r'[.!?]$', t) else ' ')  # a heading ends its own sentence
    pos = 0
    for sen in re.split(r'(?<=[.!?])\s+|(?<=[.!?;:]\))\s+(?=[A-Z])', full):
        st = full.find(sen, pos); en = st + len(sen); pos = en
        if st < 0 or not SHOP.search(re.sub(r'(?<=\b\w) (?=\w\b)', '', sen)) or len(words(sen)) > 60: continue
        for a0, a1, bb in offs:
            if not (a0 < en and a1 > st): continue
            if a0 >= st and a1 <= en: add(bb, 3); continue
            # only part of this line belongs to the sentence: cover just those words
            part = full[max(a0, st):min(a1, en)].strip()
            hits = [h for h in pg.search_for(part, clip=pymupdf.Rect(0, bb[1] - 3, W, bb[3] + 3)) if h.width > 4] if len(part) > 2 else []
            if hits:
                for h in hits: add((h.x0, h.y0, h.x1, h.y1), 2)
            else: add(bb, 3)
    def heads(r):
        # a small picture sitting just above text that is kept is that section's icon, not part of the shop text
        for b in blocks:
            t = ' '.join(''.join(s['text'] for s in l['spans']) for l in b['lines'])
            if re.fullmatch(r'\s*\d{1,3}\s*', t): continue  # a page number
            if t.strip() and not SHOP.search(re.sub(r'(?<=\b\w) (?=\w\b)', '', t)) and not BRAND.search(t) and -15 <= b['bbox'][1] - r[3] < 45 and b['bbox'][0] < r[2] + 60 and b['bbox'][2] > r[0] - 60: return True
        return False
    # around a shop line: the short question just above it ("Do you have any questions?") and a small picture just
    # below it (a contact card)
    for sb in shopbb:
        for b in blocks:
            t = ' '.join(''.join(s['text'] for s in l['spans']) for l in b['lines']).strip()
            bb = b['bbox']
            if t.endswith('?') and len(words(t)) <= 15 and -12 <= sb[1] - bb[3] < 30 and bb[1] < sb[1]: add(bb, 3)
        for im in pg.get_image_info():
            r = im['bbox']
            if 0 <= r[1] - sb[3] < 150 and (r[2] - r[0]) < W * .4 and not heads(r): add(r, 3)
        for d in pg.get_drawings():
            r = d['rect']
            if 0 <= r.y0 - sb[3] < 150 and r.width < W * .4 and r.height < 160 and not heads(r): add(r, 2)
    # the icon just above a covered heading ("FREE FUTURE UPDATES")
    for wb in whole:
        cx = (wb[0] + wb[2]) / 2
        items = [pymupdf.Rect(i['bbox']) for i in pg.get_image_info()] + [d['rect'] for d in pg.get_drawings()]
        for r in items:
            if 0 <= wb[1] - r.y1 < 40 and r.x0 - 20 < cx < r.x1 + 20 and r.width < W * .3 and r.height < 120: add(r, 2)
    return out


def text_page(pg):
    """Skip a text page only when what's left after dropping brand lines and shop sentences is (almost) nothing,
    or when shop sentences are most of the page. Otherwise the viewer drops just those lines and sentences."""
    t = pg.get_text()
    all_lines = [l for l in t.split('\n') if l.strip()]
    lines = [l for l in all_lines if not BRAND.search(l)]
    branded = len(lines) < len(all_lines)
    body = '\n'.join(lines)
    sents = [x for x in SENT.split(body) if x.strip()]
    shop = sum(len(words(x)) for x in sents if SHOP.search(x))
    left = sum(len(words(x)) for x in sents if not SHOP.search(x))
    if branded and left < 1:
        return 'skip', 'only branding'
    joined = re.sub(r'(?<=\b\w) (?=\w\b)', '', ' '.join(t.split()))  # 'F O R Y O U R' -> 'FORYOUR'
    ad = ADPAGE.findall(joined) or ADPAGE.findall(' '.join(t.split()))
    if ad and left < 320:
        return 'skip', 'advert page'
    if shop > left * 2 or (SHOPPAGE.search(joined) and left < 80):
        return 'skip', 'shop text'
    return 'keep', ''


def ocr(png):
    out = png[:-4]
    if not os.path.exists(out + '.tsv'):
        subprocess.run(['tesseract', png, out, '--psm', '11', 'tsv'], capture_output=True)
    rows = []
    with open(out + '.tsv', encoding='utf-8', errors='ignore') as f:
        for r in csv.DictReader(f, delimiter='\t', quoting=csv.QUOTE_NONE):
            if (r.get('text') or '').strip() and float(r.get('conf') or -1) > 30:
                rows.append({k: (int(r[k]) if k in ('left', 'top', 'width', 'height', 'block_num', 'par_num', 'line_num') else r[k]) for k in r})
    return rows


def picture_page(job):
    i, p, png, W, H = job
    rows = ocr(png)
    txt = ' '.join(r['text'] for r in rows)
    # group words into OCR lines
    L = {}
    for r in rows:
        L.setdefault((r['block_num'], r['par_num'], r['line_num']), []).append(r)
    boxes = []
    brand_words = 0
    shop_words = 0
    ads = []
    for ws in L.values():
        line = ' '.join(w['text'] for w in ws)
        is_name = re.search(r'G\s*&\s*J|PASSIONATE\s*_?PRESS|PASSIONAT\w*\s+PRESS', line, re.I)
        is_small = re.search(r'copyright|rights\s*reserved|reproduc|publication|prior\s*written|any\s*means|photocopy|@\s*\w*gj_|egj_', line, re.I)
        is_shop = SHOP.search(line) or re.search(r'^\W*-?\s*Gabriella|co-?\s*founder|course\s*creator', line, re.I)
        if re.search(r'want\s*to\s*know\s*even\s*more|try\s*out|kink\s*list\s*\d|click\s*here|try\s*it\s*!?$|bestseller', line, re.I):
            ads.append(ws); continue
        if is_shop: shop_words += len(ws)
        if not (is_name or is_small or is_shop):
            continue
        brand_words += len(ws)
        x0 = min(w['left'] for w in ws); x1 = max(w['left'] + w['width'] for w in ws)
        y0 = min(w['top'] for w in ws); y1 = max(w['top'] + w['height'] for w in ws)
        tw, th = x1 - x0, y1 - y0
        if is_shop and re.search(r'gabriella|founder|creator', line, re.I):  # a handwritten signature sits above the name
            y0 = y0 - th * 6; x0 -= th * 2.5; x1 += th * 2.5
        if is_name:  # the round mark sits just above the name, about 0.4x its width across
            d = tw * 0.48
            cx = (x0 + x1) / 2
            x0, x1 = min(x0, cx - d / 2), max(x1, cx + d / 2)
            y0 = y0 - d - th * 1.2
        pad = max(4, th * .6)
        boxes.append([max(0, x0 - pad) / W, max(0, y0 - pad) / H, min(W, x1 + pad) / W, min(H, y1 + pad) / H])
    n = len(rows)
    if ads:  # an advert block for another product: cover it across the page, from its first to its last line
        ya = min(w['top'] for ws in ads for w in ws); yb = max(w['top'] + w['height'] for ws in ads for w in ws)
        boxes.append([0.03, max(0, ya - 10) / H, 0.97, min(H, yb + 10) / H]); brand_words += sum(len(ws) for ws in ads)
    if re.search(r'\bLINK\b.*\bLINK\b|BUNDLE|PRODUCTS\s*:|put\s*your\s*knowledge|in\s*our\s*store', txt, re.I):
        return i, p, 'skip', 'shop picture', []
    if re.search(r'thank\s*you\W*(for\s*your)?\W*(order|purchase)|feedback|you\s*made\s*our\s*day', txt, re.I) and shop_words + brand_words > (n - brand_words) * 0.3:
        return i, p, 'skip', 'shop picture', []
    real = lambda ws: sum(1 for w in ws if re.fullmatch(r"[A-Za-z][A-Za-z'’.,!?:-]{2,}", w['text']))
    branded_rows = {id(w) for ws in L.values() if re.search(r'G\s*&\s*J|PASSIONAT|copyright|rights\s*reserved|reproduc|publication|prior\s*written|any\s*means|photocopy', ' '.join(x['text'] for x in ws), re.I) for w in ws}
    has_small = re.search(r'copyright|rights\s*reserved|no\s*part\s*of\s*this', txt, re.I)
    if has_small and real([w for w in rows if id(w) not in branded_rows]) < 6:
        return i, p, 'skip', 'only branding', []
    return i, p, 'mask' if boxes else 'keep', '', [[round(v, 4) for v in b] for b in boxes]


# The G&J round logo (a ring with three curved shapes inside) is a vector drawing that often appears without their
# name beside it. Find it by its shape: a ring (9 path pieces) and three shapes (4-6 pieces) at the same spots inside.
_LOGO = ((.33, .59), (.56, .64), (.69, .48))
def logo_masks(pg):
    W, H = pg.rect.width, pg.rect.height; out = []
    try: dr = pg.get_drawings()
    except Exception: return out
    for d in dr:
        r = d['rect']
        if not (8 < r.width < 200 and 0.85 < r.width / max(r.height, .1) < 1.18 and len(d['items']) == 9): continue
        kids = [((e['rect'].x0 + e['rect'].x1) / 2, (e['rect'].y0 + e['rect'].y1) / 2) for e in dr
                if e is not d and 4 <= len(e['items']) <= 6 and r.contains(e['rect']) and e['rect'].width < r.width * .7]
        rel = [((x - r.x0) / r.width, (y - r.y0) / r.height) for x, y in kids]
        if not all(any(abs(u - cx) < .13 and abs(v - cy) < .13 for u, v in rel) for cx, cy in _LOGO): continue
        m = r.width * .12
        bx = [round(max(0, (r.x0 - m) / W), 4), round(max(0, (r.y0 - m) / H), 4), round(min(1, (r.x1 + m) / W), 4), round(min(1, (r.y1 + m) / H), 4)]
        if not any(abs(bx[0] - o[0]) < .01 and abs(bx[1] - o[1]) < .01 for o in out): out.append(bx)
    return out

def main():
    lib = json.load(open(os.path.join(ROOT, 'data/library.json'), encoding='utf-8'))
    out, report, jobs = {}, [], []
    tmp = os.path.join(tempfile.gettempdir(), 'ka-pdfclean'); os.makedirs(tmp, exist_ok=True)
    for i, x in enumerate(lib):
        d = pymupdf.open(os.path.join(SRC, f'{i:02d}.pdf'))
        e = out.setdefault(x['p'], {'s': [], 'm': {}})
        pic = x['t'] in PICTURE
        if pic: e['p'] = 1
        for pn, pg in enumerate(d, 1):
            if not pic and len(re.sub(r'\s', '', pg.get_text())) >= 15:
                act, why = text_page(pg)
                if act == 'skip':
                    e['s'].append(pn); report.append((i, x['t'], pn, why, ' '.join(pg.get_text().split())[:90]))
                else:
                    mk = text_masks(pg)
                    if mk: e['m'][str(pn)] = mk
            else:
                png = os.path.join(tmp, f'{i:02d}-{pn:03d}.png')
                pix = pg.get_pixmap(dpi=220)
                if not os.path.exists(png): pix.save(png)
                jobs.append((i, pn, png, pix.width, pix.height))
    with ProcessPoolExecutor(8) as ex:
        for i, p, act, why, boxes in ex.map(picture_page, jobs):
            e = out[lib[i]['p']]
            if act == 'skip':
                e['s'].append(p); report.append((i, lib[i]['t'], p, why, '(picture)'))
            elif act == 'mask':
                e['m'][str(p)] = boxes
    nlogo = 0
    for i, x in enumerate(lib):
        e = out[x['p']]; d = pymupdf.open(os.path.join(SRC, f'{i:02d}.pdf'))
        for pn, pg in enumerate(d, 1):
            if pn in e['s']: continue
            lm = logo_masks(pg)
            if lm: e['m'].setdefault(str(pn), []).extend(lm); nlogo += len(lm)
    print(f'{nlogo} round logos found and covered')
    for path, pages in MANUAL.items():
        e = out.setdefault(path, {'s': [], 'm': {}})
        for pn in pages:
            if pn not in e['s']: e['s'].append(pn); report.append((-1, path, pn, 'by hand', ''))
    for e in out.values(): e['s'] = sorted(set(e['s']))
    out = {k: v for k, v in out.items() if v['s'] or v['m'] or v.get('p')}
    json.dump(out, open(os.path.join(ROOT, 'data/pdf-clean.json'), 'w', encoding='utf-8'), separators=(',', ':'))
    print(f"{sum(len(v['s']) for v in out.values())} pages skipped, {sum(len(v['m']) for v in out.values())} picture pages with logos covered, in {len(out)} PDFs")
    for r in report: print(f'{r[0]:02d} p{r[2]:<4} {r[3]:14} {r[1][:30]:30} | {r[4]}')


if __name__ == '__main__':
    main()
