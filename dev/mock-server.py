"""Tiny in-memory stand-in for the KamaAgni cloud backend (dev testing only).
Speaks the same ops as js/ka-cloud.js mockAdapter(). Run: python3 mock-server.py  (port 8787)"""
import json, uuid, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

USERS, TOKENS, VAULT, COUPLES, EVENTS, PRES, PUSH = {}, {}, {}, {}, [], {}, {}
NEXT = [1]

def op_call(op, a, uid):
    if op in ('signUp', 'signIn'):
        e = a['email'].lower()
        if op == 'signUp':
            if e in USERS: raise Exception('Already registered')
            USERS[e] = {'id': str(uuid.uuid4()), 'email': e, 'pw': a['password']}
        u = USERS.get(e)
        if not u or u['pw'] != a['password']: raise Exception('Wrong email or password')
        t = uuid.uuid4().hex; TOKENS[t] = u['id']
        return {'token': t, 'user': {'id': u['id'], 'email': e}}
    if not uid: raise Exception('Not signed in')
    if op == 'user':
        e = next(k for k, v in USERS.items() if v['id'] == uid); return {'user': {'id': uid, 'email': e}}
    if op == 'vaultList': return list(VAULT.get(uid, {}).values())
    if op == 'vaultUpsert':
        V = VAULT.setdefault(uid, {})
        for r in a['rows']: V[r['k']] = {'k': r['k'], 'v': r['v'], 'updated_at': r.get('updated_at')}
        return True
    if op == 'vaultDelete':
        if a.get('keys') is None: VAULT[uid] = {}
        else:
            for k in a['keys']: VAULT.get(uid, {}).pop(k, None)
        return True
    if op == 'myCouple':
        for c in COUPLES.values():
            if uid in (c['a'], c['b']): return c
        return None
    if op == 'createCouple':
        c = {'id': str(uuid.uuid4()), 'code': a['code'], 'a': uid, 'b': None}; COUPLES[c['id']] = c; return c
    if op == 'joinCouple':
        for c in COUPLES.values():
            if c['code'] == a['code']:
                if c['b'] and c['b'] != uid: raise Exception('This invite was already used')
                if c['a'] == uid: raise Exception('That is your own invite')
                c['b'] = uid; return c['id']
        raise Exception('Invite not found')
    if op == 'leaveCouple': COUPLES.pop(a['id'], None); return True
    if op == 'sendEvent':
        e = {'id': NEXT[0], 'couple_id': a['couple_id'], 'sender': uid, 'kind': a['kind'], 'body': a['body'], 'created_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())}
        NEXT[0] += 1; EVENTS.append(e); return {'id': e['id']}
    if op == 'listEvents':
        return [{k: e[k] for k in ('id', 'sender', 'kind', 'body', 'created_at')} for e in EVENTS if e['couple_id'] == a['couple_id'] and e['id'] > (a.get('since') or 0)][-300:]
    if op == 'deleteEvent':
        EVENTS[:] = [e for e in EVENTS if e['id'] != a['id']]; return True
    if op == 'presence':
        P = PRES.setdefault(a['couple_id'], {}); P[uid] = (time.time(), a.get('meta'))
        return [m for u, (t, m) in P.items() if u != uid and time.time() - t < 15]
    if op == 'pushSave': PUSH[a['sub']['endpoint']] = (uid, a['sub']); return True
    if op == 'pushDel': PUSH.pop(a.get('endpoint'), None); return True
    if op == 'deleteAccount': return True
    raise Exception('Unknown op ' + op)

class H(BaseHTTPRequestHandler):
    def cors(self):
        self.send_header('Access-Control-Allow-Origin', '*'); self.send_header('Access-Control-Allow-Headers', '*'); self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
    def do_OPTIONS(self): self.send_response(204); self.cors(); self.end_headers()
    def do_POST(self):
        n = int(self.headers.get('content-length', 0)); j = json.loads(self.rfile.read(n) or b'{}')
        uid = TOKENS.get((self.headers.get('authorization') or '').replace('Bearer ', ''))
        try: out = {'data': op_call(j.get('op'), j.get('args') or {}, uid)}
        except Exception as e: out = {'error': str(e)}
        b = json.dumps(out).encode(); self.send_response(200); self.cors(); self.send_header('content-type', 'application/json'); self.end_headers(); self.wfile.write(b)
    def log_message(self, *a): pass

ThreadingHTTPServer(('127.0.0.1', 8787), H).serve_forever()
