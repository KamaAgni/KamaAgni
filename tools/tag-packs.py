"""Tag every task in data/packs/*.json with who it is written to ('f' woman, 'm' man, 'x' either).
Writes data/packs/who.json: {pack_id: "fmx..." one letter per task}. Re-run after editing packs."""
import json, re, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = os.path.join(ROOT, 'data', 'packs')
SLASH = re.compile(r'\b(\w+)\s*/\s*(\w+)\b')
# the OTHER person is a man -> card is written to her
OTH_M = re.compile(r"\b(him|his|he|he's|himself|master|sir|daddy|boyfriend|husband|king)\b", re.I)
OTH_F = re.compile(r"\b(her|hers|she|she's|herself|mistress|goddess|queen|girlfriend|wife|princess)\b", re.I)
OWN_F = re.compile(r"\byour (own )?(pussy|clit|clitoris|vagina|labia|breasts?|tits|boobs|cleavage|lingerie|panties|knickers|bra|heels|skirt|dress|stockings|thong|lipstick|make-?up|bikini)\b|\b(the|my|your) lush\b|\bwear(ing)? (sexy |your |a |some )*(lingerie|panties|bra|heels|skirt|dress|stockings|thong|bikini)\b", re.I)
OWN_M = re.compile(r"\byour (own )?(cock|dick|penis|balls|testicles|erection|shaft|boxers|briefs)\b|\b(stroke|jerk) (off|yourself)\b", re.I)
MY_M = re.compile(r"\bmy (cock|dick|penis|balls|erection|shaft)\b", re.I)   # speaker is a man -> written to her
MY_F = re.compile(r"\bmy (pussy|clit|breasts|tits|boobs|panties|lingerie|heels|stockings)\b", re.I)
def tag(t):
    s = SLASH.sub(' ', str(t))
    if '{A}' in s or '{B}' in s: return 'x', 0
    f = len(OTH_M.findall(s)) + 2 * len(OWN_F.findall(s)) + 2 * len(MY_M.findall(s))
    m = len(OTH_F.findall(s)) + 2 * len(OWN_M.findall(s)) + 2 * len(MY_F.findall(s))
    if f > m: return 'f', 1
    if m > f: return 'm', 1
    return 'x', 0
# who most untagged tasks in a pack are written to, from the pack's own name and description
MANUAL = {'slut700': 'f', 'humil650': 'f', 'blowjob650': 'f', 'solo400': 'f', 'subcards1': 'f', 'subcards2': 'f', 'subcards3': 'f', 'revher': 'f',
          'femdomcards': 'm', 'footcards': 'm', 'revhim': 'm', 'cei': 'm', 'sub121': 'm'}
out, rep = {}, []
idx = json.load(open(os.path.join(P, 'index.json'), encoding='utf-8'))
for p in idx:
    L = json.load(open(os.path.join(P, p['id'] + '.json'), encoding='utf-8'))
    T = [tag(t) for t in L]
    sig = [a for a, s in T if s]
    nf, nm = sig.count('f'), sig.count('m')
    dflt = 'x'
    strong = sig and len(sig) / len(L) >= .6
    if strong and nf / len(sig) >= .9 and nf >= 3: dflt = 'f'
    elif strong and nm / len(sig) >= .9 and nm >= 3: dflt = 'm'
    if dflt == 'x' and p['id'] in MANUAL: dflt = MANUAL[p['id']]
    if p['id'] in ('hornopoly', 'hornobdsm', 'questions', 'switch', 'roles'): dflt = 'x'
    s = ''.join(a if sc else dflt for a, sc in T)
    out[p['id']] = s
    rep.append((p['id'], len(L), s.count('f'), s.count('m'), s.count('x'), dflt))
json.dump(out, open(os.path.join(P, 'who.json'), 'w', encoding='utf-8'), separators=(',', ':'))
for r in rep: print('%-14s n=%4d  f=%4d m=%4d x=%4d  default=%s' % r)
