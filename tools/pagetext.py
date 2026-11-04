#!/usr/bin/env python3
"""Collect user-facing text that lives inside game pages into data/pagetext.json so the duplicate guard can see it."""
import re, json, glob, os
os.chdir(os.path.join(os.path.dirname(__file__), '..'))
LIT = re.compile(r'"((?:[^"\\\n]|\\.){28,300})"|\'((?:[^\'\\\n]|\\.){28,300})\'')
BAD = re.compile(r'<|>|=>|\$\{|function|\bvar |\bconst |\.js|\.css|\.json|localStorage|http|px|#[0-9a-f]{3,6}|\bfetch\b|querySelector|\{[a-z]+:', re.I)
out = {}
for f in sorted(glob.glob('games/kamaagni-*.html')):
    s = open(f, encoding='utf-8').read()
    seg = '\n'.join(re.findall(r'<script>(.*?)</script>', s, re.S))
    L = []
    for m in LIT.finditer(seg):
        t = (m.group(1) or m.group(2)).replace('\\"', '"').replace("\\'", "'").replace('\\n', ' ')
        if BAD.search(t) or t.count(' ') < 4 or not t[0].isalpha(): continue
        L.append(t)
    seen = set(); L = [x for x in L if not (x.lower() in seen or seen.add(x.lower()))]
    if L: out[os.path.basename(f)[9:-5]] = L
open('data/pagetext.json', 'w', encoding='utf-8').write(json.dumps(out, ensure_ascii=False, separators=(',', ':')))
print(len(out), 'pages', sum(len(v) for v in out.values()), 'strings')
