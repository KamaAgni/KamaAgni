#!/usr/bin/env python3
"""One-off content de-duplication (v39). Safe to re-run: second run changes nothing."""
import json, re, os, sys
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
def key(t): return re.sub(r'[^a-z0-9]+', '', t.lower())
def rd(p): return json.load(open(p, encoding='utf-8'))
def wr(p, o): open(p, 'w', encoding='utf-8').write(json.dumps(o, ensure_ascii=False, separators=(',', ':')))
idx = rd('data/packs/index.json'); tasks = rd('data/tasks.json')
pk = {p['id']: rd(f'data/packs/{p["id"]}.json') for p in idx}
meta = {p['id']: p for p in idx}
# 1. fold tasks.json packs into packs/
drop_tasks = {'bdsm500'}  # same content as the BDSM Journey path
for t in tasks:
    if t['id'] in drop_tasks: continue
    if t['id'] in pk: pk[t['id']] = pk[t['id']] + t['items']
    else:
        pk[t['id']] = t['items']
        m = {'id': t['id'], 'g': 'Gentle starts' if t['heat'] <= 2 else 'Spicy', 'l': t['label'], 'd': t['desc'], 'h': t['heat'], 'n': 0, 'kb': 0}
        idx.append(m); meta[t['id']] = m
tasks = []
# 2. global de-dup across packs: the smaller (more specific) pack keeps the task
seen = {}
for pid in sorted(pk, key=lambda i: (len(pk[i]), i)):
    keep = []
    for x in pk[pid]:
        k = key(x)
        if not k or k in seen: continue
        seen[k] = pid; keep.append(x)
    pk[pid] = keep
# 3. packs/questions vs the Truth or Dare deck
tr = rd('data/deck/truth.json'); tk = {key(x) for v in tr['items'].values() for x in v}
if 'questions' in pk: pk['questions'] = [x for x in pk['questions'] if key(x) not in tk]
# 4. drop packs that became tiny, write out
out = []
for m in idx:
    items = pk[m['id']]
    if len(items) < 8:
        if os.path.exists(f'data/packs/{m["id"]}.json'): os.remove(f'data/packs/{m["id"]}.json')
        print('dropped pack', m['id'], len(items)); continue
    wr(f'data/packs/{m["id"]}.json', items)
    m['n'] = len(items); m['kb'] = max(1, round(os.path.getsize(f'data/packs/{m["id"]}.json') / 1024)); out.append(m)
wr('data/packs/index.json', out); wr('data/tasks.json', tasks)
# 5. other files: remove exact repeats inside the file
def dd_list(l, f=lambda x: x):
    s = set(); r = []
    for x in l:
        k = key(f(x))
        if k in s: continue
        s.add(k); r.append(x)
    return r
jp = rd('data/journal_prompts.json')
for e in jp: e['p'] = dd_list(e['p'])
wr('data/journal_prompts.json', jp)
for fn in ['deck/coupons', 'deck/know', 'challenges', 'bdsm500', 'library']:
    pass
print('packs', len(out), 'tasks total', sum(m['n'] for m in out))
