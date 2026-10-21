/* KamaAgni dev mock backend — in-memory, for trying cloud sync + partner linking WITHOUT Supabase.
   Run:  node dev/mock-server.js   then set MOCK_URL: 'http://localhost:8787' in js/ka-config.js
   NOT for production (no real security, data lost on restart). */
const http = require('http'), crypto = require('crypto');
const users = {}, tokens = {}, vault = {}, couples = [], events = [], presence = {};
let evId = 0;
const uid = () => crypto.randomUUID();
const ok = (res, body, code = 200) => { res.writeHead(code, { 'content-type': 'application/json', 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' }); res.end(JSON.stringify(body)); };
const ops = {
  signUp: ({ email, password }) => { if (users[email]) throw 'User already registered'; const u = { id: uid(), email, password }; users[email] = u; const t = uid(); tokens[t] = u; return { token: t, user: { id: u.id, email } }; },
  signIn: ({ email, password }) => { const u = users[email]; if (!u || u.password !== password) throw 'Invalid login credentials'; const t = uid(); tokens[t] = u; return { token: t, user: { id: u.id, email } }; },
  user: (a, u) => ({ user: { id: u.id, email: u.email } }),
  vaultList: (a, u) => Object.entries(vault[u.id] || {}).map(([k, r]) => ({ k, v: r.v, updated_at: r.t })),
  vaultUpsert: ({ rows }, u) => { vault[u.id] = vault[u.id] || {}; rows.forEach(r => { vault[u.id][r.k] = { v: r.v, t: r.updated_at }; }); return true; },
  vaultDelete: ({ keys }, u) => { if (!keys) vault[u.id] = {}; else keys.forEach(k => delete (vault[u.id] || {})[k]); return true; },
  myCouple: (a, u) => couples.find(c => c.a === u.id || c.b === u.id) || null,
  createCouple: ({ code }, u) => { if (couples.find(c => c.a === u.id || c.b === u.id)) throw 'Already linked'; const c = { id: uid(), code, a: u.id, b: null }; couples.push(c); return c; },
  joinCouple: ({ code }, u) => { const c = couples.find(x => x.code === code && !x.b && x.a !== u.id); if (!c) throw 'Invite not found or already used'; c.b = u.id; return c.id; },
  leaveCouple: ({ id }, u) => { const i = couples.findIndex(c => c.id === id); if (i < 0) return true; const c = couples[i]; if (c.a === u.id) { couples.splice(i, 1); for (let k = events.length - 1; k >= 0; k--) if (events[k].couple_id === id) events.splice(k, 1); } else if (c.b === u.id) c.b = null; return true; },
  sendEvent: ({ couple_id, kind, body }, u) => { const c = couples.find(x => x.id === couple_id && (x.a === u.id || x.b === u.id)); if (!c) throw 'Not in this couple'; const e = { id: ++evId, couple_id, sender: u.id, kind, body, created_at: new Date().toISOString() }; events.push(e); return { id: e.id }; },
  listEvents: ({ couple_id, since }, u) => { const c = couples.find(x => x.id === couple_id && (x.a === u.id || x.b === u.id)); if (!c) return []; return events.filter(e => e.couple_id === couple_id && e.id > (since || 0)).slice(0, 300); },
  deleteEvent: ({ id }, u) => { const i = events.findIndex(e => e.id === id && e.sender === u.id); if (i >= 0) events.splice(i, 1); return true; },
  presence: ({ couple_id, meta }, u) => { presence[couple_id] = presence[couple_id] || {}; presence[couple_id][u.id] = { meta, ts: Date.now() }; return Object.entries(presence[couple_id]).filter(([id, p]) => id !== u.id && Date.now() - p.ts < 20000).map(([, p]) => p.meta); },
  deleteAccount: (a, u) => { delete vault[u.id]; for (let i = couples.length - 1; i >= 0; i--) if (couples[i].a === u.id || couples[i].b === u.id) { const id = couples[i].id; couples.splice(i, 1); for (let k = events.length - 1; k >= 0; k--) if (events[k].couple_id === id) events.splice(k, 1); } delete users[u.email]; return true; }
};
http.createServer((req, res) => {
  if (req.method === 'OPTIONS') return ok(res, {});
  let b = ''; req.on('data', c => b += c); req.on('end', () => {
    try {
      const { op, args } = JSON.parse(b || '{}'); const t = (req.headers.authorization || '').replace('Bearer ', '');
      const u = tokens[t]; if (!['signUp', 'signIn'].includes(op) && !u) return ok(res, { error: 'Not signed in' }, 401);
      if (!ops[op]) return ok(res, { error: 'Unknown op' }, 400);
      ok(res, { data: ops[op](args || {}, u) });
    } catch (e) { ok(res, { error: String(e) }, 400); }
  });
}).listen(process.env.PORT || 8787, () => console.log('KamaAgni mock backend on :' + (process.env.PORT || 8787)));
