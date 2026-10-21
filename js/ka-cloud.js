/* KamaAgni cloud layer: login, end-to-end-encrypted sync across devices, partner linking.
   Everything personal is encrypted in the browser (AES-GCM) before upload; the server only stores ciphertext.
   Backends: Supabase (production) or dev/mock-server.js (local testing). No config = fully offline. */
(function () {
  'use strict';
  var CFG = window.KA_CONFIG || {};
  var SY = window.KA_SYNC, LS = localStorage;
  var BASE = (document.currentScript && document.currentScript.src || '').replace(/js\/ka-cloud\.js.*$/, '') || './';
  var kind = CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY ? 'supabase' : (CFG.MOCK_URL ? 'mock' : null);
  var st = { enabled: !!kind, backend: kind, user: null, vault: 'none', couple: null, syncing: false, last: +(SY && SY.raw.get('ka_sync_last') || 0), err: '', ready: false };
  var A = null, vk = null, listeners = [];
  function emit() { try { window.dispatchEvent(new CustomEvent('ka:cloud', { detail: st })); } catch (e) {} }
  function setErr(e) { st.err = e ? String(e.message || e) : ''; emit(); return e; }

  /* ---------------- crypto ---------------- */
  var enc = new TextEncoder(), dec = new TextDecoder();
  function b64(buf) { var a = new Uint8Array(buf), s = ''; for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); }
  function unb64(s) { var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function b64u(buf) { return b64(buf).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function unb64u(s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return unb64(s); }
  function deriveKey(pass, salt) {
    return crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']).then(function (base) {
      return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: enc.encode('kamaagni:' + salt), iterations: 250000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
    });
  }
  function seal(key, str) { var iv = crypto.getRandomValues(new Uint8Array(12)); return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, enc.encode(str)).then(function (ct) { return 'v1.' + b64(iv) + '.' + b64(ct); }); }
  function open(key, s) { var p = String(s).split('.'); if (p[0] !== 'v1') return Promise.reject(new Error('format')); return crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(p[1]) }, key, unb64(p[2])).then(function (pt) { return dec.decode(pt); }); }
  function exportKey(k) { return crypto.subtle.exportKey('raw', k).then(b64u); }
  function importRaw(b) { return crypto.subtle.importKey('raw', unb64u(b), 'AES-GCM', true, ['encrypt', 'decrypt']); }
  function randomB64u(n) { return b64u(crypto.getRandomValues(new Uint8Array(n))); }
  function loadScript(src) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = function () { rej(new Error('Could not load ' + src)); }; document.head.appendChild(s); }); }

  /* ---------------- backends ---------------- */
  function supabaseAdapter() {
    var c, uid = function () { return st.user && st.user.id; };
    function chk(r) { if (r.error) throw new Error(r.error.message || r.error); return r.data; }
    return {
      init: function () {
        return loadScript(BASE + 'js/vendor/supabase.js').then(function () {
          c = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
        });
      },
      user: function () { return c.auth.getSession().then(function (r) { var s = r.data && r.data.session; return s ? { id: s.user.id, email: s.user.email } : null; }); },
      signUp: function (e, p) { return c.auth.signUp({ email: e, password: p }).then(function (r) { if (r.error) throw r.error; return { user: r.data.user ? { id: r.data.user.id, email: e } : null, needsConfirm: !r.data.session }; }); },
      signIn: function (e, p) { return c.auth.signInWithPassword({ email: e, password: p }).then(function (r) { if (r.error) throw r.error; return { user: { id: r.data.user.id, email: r.data.user.email } }; }); },
      signOut: function () { return c.auth.signOut(); },
      resetPassword: function (e) { return c.auth.resetPasswordForEmail(e, { redirectTo: location.origin + location.pathname }).then(chk0); },
      vaultList: function () { return c.from('vault').select('k,v,updated_at').then(chk); },
      vaultUpsert: function (rows) { return c.from('vault').upsert(rows.map(function (r) { return { user_id: uid(), k: r.k, v: r.v, updated_at: r.updated_at }; }), { onConflict: 'user_id,k' }).then(chk0); },
      vaultDelete: function (keys) { var q = c.from('vault').delete().eq('user_id', uid()); if (keys) q = q.in('k', keys); return q.then(chk0); },
      myCouple: function () { return c.from('couples').select('*').or('a.eq.' + uid() + ',b.eq.' + uid()).maybeSingle().then(chk); },
      createCouple: function (code) { return c.from('couples').insert({ code: code, a: uid() }).select().single().then(chk); },
      joinCouple: function (code) { return c.rpc('join_couple', { p_code: code }).then(chk); },
      leaveCouple: function (id) { return c.rpc('leave_couple', { p_id: id }).then(chk0); },
      sendEvent: function (cid, k, body) { return c.from('couple_events').insert({ couple_id: cid, kind: k, body: body }).select('id').single().then(chk); },
      listEvents: function (cid, since) { return c.from('couple_events').select('id,sender,kind,body,created_at').eq('couple_id', cid).gt('id', since || 0).order('id', { ascending: true }).limit(300).then(chk); },
      deleteEvent: function (id) { return c.from('couple_events').delete().eq('id', id).then(chk0); },
      subscribe: function (cid, cb) { var ch = c.channel('ev:' + cid).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'couple_events', filter: 'couple_id=eq.' + cid }, function (p) { cb(p.new); }).subscribe(); return function () { c.removeChannel(ch); }; },
      presence: function (cid, meta, cb) {
        var ch = c.channel('pr:' + cid, { config: { presence: { key: uid() } } });
        ch.on('presence', { event: 'sync' }, function () { var s = ch.presenceState(), out = []; Object.keys(s).forEach(function (k) { if (k !== uid()) s[k].forEach(function (m) { out.push(m); }); }); cb(out); })
          .subscribe(function (status) { if (status === 'SUBSCRIBED') ch.track(meta); });
        return function () { c.removeChannel(ch); };
      },
      deleteAccount: function () { return c.rpc('delete_my_account').then(chk0); }
    };
    function chk0(r) { if (r && r.error) throw new Error(r.error.message || r.error); return true; }
  }
  function mockAdapter() {
    var tok = SY.raw.get('ka_cloud_mock') || '';
    function call(op, args) {
      return fetch(CFG.MOCK_URL, { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + tok }, body: JSON.stringify({ op: op, args: args || {} }) })
        .then(function (r) { return r.json(); }).then(function (j) { if (j.error) throw new Error(j.error); return j.data; });
    }
    function auth(op, e, p) { return call(op, { email: e, password: p }).then(function (d) { tok = d.token; SY.raw.set('ka_cloud_mock', tok); return d; }); }
    return {
      init: function () { return Promise.resolve(); },
      user: function () { return tok ? call('user').then(function (d) { return d.user; }, function () { return null; }) : Promise.resolve(null); },
      signUp: function (e, p) { return auth('signUp', e, p).then(function (d) { return { user: d.user, needsConfirm: false }; }); },
      signIn: function (e, p) { return auth('signIn', e, p).then(function (d) { return { user: d.user }; }); },
      signOut: function () { tok = ''; SY.raw.remove('ka_cloud_mock'); return Promise.resolve(); },
      resetPassword: function () { return Promise.resolve(true); },
      vaultList: function () { return call('vaultList'); },
      vaultUpsert: function (rows) { return call('vaultUpsert', { rows: rows }); },
      vaultDelete: function (keys) { return call('vaultDelete', { keys: keys || null }); },
      myCouple: function () { return call('myCouple'); },
      createCouple: function (code) { return call('createCouple', { code: code }); },
      joinCouple: function (code) { return call('joinCouple', { code: code }); },
      leaveCouple: function (id) { return call('leaveCouple', { id: id }); },
      sendEvent: function (cid, k, body) { return call('sendEvent', { couple_id: cid, kind: k, body: body }); },
      listEvents: function (cid, since) { return call('listEvents', { couple_id: cid, since: since }); },
      deleteEvent: function (id) { return call('deleteEvent', { id: id }); },
      subscribe: function () { return function () {}; },                               /* mock relies on polling */
      presence: function (cid, meta, cb) { var go = function () { call('presence', { couple_id: cid, meta: meta }).then(cb, function () {}); }; go(); var t = setInterval(go, 5000); return function () { clearInterval(t); }; },
      deleteAccount: function () { return call('deleteAccount'); }
    };
  }

  /* ---------------- vault (device key) ---------------- */
  function uidSalt() { return st.user.id; }
  function loadDeviceKey() {
    var raw = SY.raw.get('ka_vkey'); if (!raw) return Promise.resolve(null);
    return importRaw(raw).then(function (k) { return k; }, function () { return null; });
  }
  function afterLogin() {
    return loadDeviceKey().then(function (k) { vk = k; return A.vaultList(); }).then(function (rows) {
      var chkRow = rows.filter(function (r) { return r.k === '__check'; })[0];
      st.hasCheck = !!chkRow;
      if (vk && chkRow) return open(vk, chkRow.v).then(function () { st.vault = 'ready'; }, function () { vk = null; SY.raw.remove('ka_vkey'); st.vault = 'locked'; });
      st.vault = chkRow ? 'locked' : 'new';
    });
  }
  /* Unlock (existing cloud data) or create (first time) the vault with a passphrase. */
  function unlock(pass, remember) {
    if (!st.user) return Promise.reject(new Error('Sign in first'));
    return deriveKey(pass, uidSalt()).then(function (k) {
      return A.vaultList().then(function (rows) {
        var c = rows.filter(function (r) { return r.k === '__check'; })[0];
        if (c) return open(k, c.v).then(function () { return k; }, function () { throw new Error('Wrong passphrase'); });
        return seal(k, JSON.stringify({ ok: 1 })).then(function (v) { return A.vaultUpsert([{ k: '__check', v: v, updated_at: Date.now() }]).then(function () { return k; }); });
      });
    }).then(function (k) { vk = k; st.vault = 'ready'; return exportKey(k).then(function (raw) { if (remember !== false) SY.raw.set('ka_vkey', raw); }); })
      .then(function () { emit(); return syncNow(); }).then(function () { return refreshCouple(); });
  }

  /* ---------------- sync ---------------- */
  function applyRemote(k, val) {
    SY.applying = true;
    try { if (val === null) SY.raw.remove(k); else SY.raw.set(k, val); } finally { SY.applying = false; }
  }
  function mergeArrays(a, b) {      // first-link merge for arrays of {id} objects: union, newest first
    try {
      var x = JSON.parse(a), y = JSON.parse(b);
      if (!Array.isArray(x) || !Array.isArray(y)) return null;
      var seen = {}, out = [];
      x.concat(y).forEach(function (it) { var id = it && (it.id != null ? it.id : null); if (id === null) { out.push(it); return; } if (!seen[id]) { seen[id] = 1; out.push(it); } });
      if (out.some(function (i) { return !i || i.id == null; })) return null;
      return JSON.stringify(out);
    } catch (e) { return null; }
  }
  var syncing = null;
  function syncNow() {
    if (!ready()) return Promise.resolve(false);
    if (syncing) return syncing;
    st.syncing = true; emit();
    syncing = A.vaultList().then(function (rows) {
      var remote = {}; rows.forEach(function (r) { remote[r.k] = r; });
      var meta = SY.meta(), linkKey = 'ka_sync_linked_' + st.user.id, first = !SY.raw.get(linkKey), changed = false, push = [];
      var tasks = Object.keys(remote).filter(function (k) { return k !== '__check'; }).map(function (k) {
        var r = remote[k], lm = meta[k], local = LS.getItem(k);
        return open(vk, r.v).then(function (plain) {
          var o = JSON.parse(plain), isDel = !!o.__del, rv = isDel ? null : o.v;
          if (first && local !== null && !isDel) {
            var m = mergeArrays(local, rv); var final = m !== null ? m : rv;
            if (final !== local) { applyRemote(k, final); changed = true; }
            if (final !== rv) { meta[k] = { t: Date.now(), p: 1, d: 0 }; } else meta[k] = { t: r.updated_at, p: 0, d: 0 };
          } else if (!lm || r.updated_at > (lm.t || 0)) {
            if ((local || null) !== rv) { applyRemote(k, rv); changed = true; }
            meta[k] = { t: r.updated_at, p: 0, d: isDel ? 1 : 0 };
          }
        }, function () { /* undecryptable row (other passphrase) -> ignore */ });
      });
      return Promise.all(tasks).then(function () {
        // local-only keys (or pending changes) -> push
        for (var i = 0; i < LS.length; i++) { var k = LS.key(i); if (SY.syncable(k) && !remote[k] && !(meta[k] && meta[k].d)) { meta[k] = meta[k] && meta[k].p ? meta[k] : { t: Date.now(), p: 1, d: 0 }; } }
        SY.setMeta(meta);
        return pushDirty();
      }).then(function () { SY.raw.set(linkKey, '1'); st.last = Date.now(); SY.raw.set('ka_sync_last', String(st.last)); st.err = ''; return changed; });
    }).then(function (changed) {
      if (changed) { var lastReload = +(sessionStorage.getItem('ka_sync_reload') || 0); if (Date.now() - lastReload > 20000 && document.visibilityState === 'visible') { sessionStorage.setItem('ka_sync_reload', String(Date.now())); location.reload(); } }
      return true;
    }, function (e) { setErr(e); return false; }).then(function (v) { syncing = null; st.syncing = false; emit(); return v; });
    return syncing;
  }
  function pushDirty() {
    if (!ready()) return Promise.resolve();
    var meta = SY.meta(), keys = Object.keys(meta).filter(function (k) { return meta[k].p; });
    if (!keys.length) return Promise.resolve();
    return Promise.all(keys.map(function (k) {
      var del = meta[k].d || LS.getItem(k) === null, val = LS.getItem(k), ts = meta[k].t;
      return seal(vk, JSON.stringify(del ? { __del: 1 } : { v: val })).then(function (v) { return { k: k, v: v, updated_at: ts }; });
    })).then(function (rows) {
      var chunks = []; for (var i = 0; i < rows.length; i += 25) chunks.push(rows.slice(i, i + 25));
      return chunks.reduce(function (p, c) { return p.then(function () { return A.vaultUpsert(c); }); }, Promise.resolve());
    }).then(function () { var m = SY.meta(); keys.forEach(function (k) { if (m[k] && m[k].t === meta[k].t) m[k].p = 0; }); SY.setMeta(m); st.last = Date.now(); SY.raw.set('ka_sync_last', String(st.last)); emit(); }, setErr);
  }
  var pushTimer = null;
  window.addEventListener('ka:dirty', function () { if (!ready()) return; clearTimeout(pushTimer); pushTimer = setTimeout(pushDirty, 1800); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && ready() && Date.now() - st.last > 30000) syncNow(); else if (document.visibilityState === 'hidden' && ready()) pushDirty(); });
  function ready() { return !!(A && st.user && vk && st.vault === 'ready'); }

  /* ---------------- couple ---------------- */
  function linkInfo() { try { return JSON.parse(LS.getItem('ka_couple_link')); } catch (e) { return null; } }
  var coupleKey = null;
  function ckey() { var l = linkInfo(); if (!l || !l.key) return Promise.resolve(null); if (coupleKey && coupleKey.raw === l.key) return Promise.resolve(coupleKey.k); return importRaw(l.key).then(function (k) { coupleKey = { raw: l.key, k: k }; return k; }); }
  function refreshCouple() {
    if (!A || !st.user) { st.couple = null; emit(); return Promise.resolve(null); }
    return A.myCouple().then(function (c) {
      var l = linkInfo();
      if (!c) { if (l) LS.removeItem('ka_couple_link'); st.couple = null; }
      else st.couple = { id: c.id, code: c.code, partnerJoined: !!(c.a && c.b), hasKey: !!(l && l.key && l.id === c.id), role: c.a === st.user.id ? 'a' : 'b' };
      emit(); return st.couple;
    }, function (e) { setErr(e); return null; });
  }
  function createInvite() {
    var code = randomB64u(9).replace(/[-_]/g, 'x'), key = randomB64u(32);
    return A.createCouple(code).then(function (c) {
      LS.setItem('ka_couple_link', JSON.stringify({ id: c.id, code: code, key: key, role: 'a', since: Date.now() }));
      return refreshCouple().then(function () { return inviteLink(); });
    });
  }
  function inviteLink() { var l = linkInfo(); if (!l) return ''; return location.origin + location.pathname.replace(/[^\/]*$/, '') + (location.pathname.indexOf('/games/') > -1 ? '' : 'games/') + 'kamaagni-together.html#join=' + l.code + '.' + l.key; }
  function joinInvite(text) {
    var m = String(text).match(/join=([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)/) || String(text).trim().match(/^([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]{30,})$/);
    if (!m) return Promise.reject(new Error('That does not look like an invite link.'));
    var code = m[1], key = m[2];
    return A.joinCouple(code).then(function (id) {
      LS.setItem('ka_couple_link', JSON.stringify({ id: id, code: code, key: key, role: 'b', since: Date.now() }));
      return refreshCouple();
    });
  }
  function leave() {
    var l = linkInfo(), id = (st.couple && st.couple.id) || (l && l.id); if (!id) return Promise.resolve();
    return A.leaveCouple(id).then(function () { LS.removeItem('ka_couple_link'); coupleKey = null; st.couple = null; stopLive(); emit(); });
  }
  function sendEvent(k, obj) { return ckey().then(function (key) { if (!key || !st.couple) throw new Error('Not linked'); return seal(key, JSON.stringify(obj)).then(function (b) { return A.sendEvent(st.couple.id, k, b); }); }); }
  function decodeEvent(e) {
    return ckey().then(function (key) { return open(key, e.body); }).then(function (p) { return { id: e.id, kind: e.kind, mine: e.sender === st.user.id, at: e.created_at, body: JSON.parse(p) }; }, function () { return { id: e.id, kind: e.kind, mine: e.sender === st.user.id, at: e.created_at, body: null }; });
  }
  function listEvents(since) { if (!st.couple) return Promise.resolve([]); return A.listEvents(st.couple.id, since || 0).then(function (rows) { return Promise.all(rows.map(decodeEvent)); }); }
  function deleteEvent(id) { return A.deleteEvent(id); }

  /* live: realtime subscription + polling fallback; presence */
  var liveStop = [], liveCb = [], lastId = 0, pollT = null, seen = {};
  function startLive(onEvent, onPresence, myName) {
    stopLive();
    if (!st.couple) return;
    var dispatch = function (list) { list.forEach(function (ev) { if (seen[ev.id]) return; seen[ev.id] = 1; lastId = Math.max(lastId, ev.id); onEvent(ev); }); };
    listEvents(0).then(function (l) { dispatch(l); });
    var poll = function () { listEvents(lastId).then(dispatch, function () {}); };
    pollT = setInterval(poll, kind === 'mock' ? 1500 : 7000);
    liveStop.push(function () { clearInterval(pollT); });
    liveStop.push(A.subscribe(st.couple.id, function (row) { decodeEvent(row).then(function (ev) { dispatch([ev]); }); }));
    ckey().then(function (key) {
      if (!key) return;
      seal(key, JSON.stringify({ n: myName || '' })).then(function (meta) {
        liveStop.push(A.presence(st.couple.id, { m: meta }, function (others) {
          Promise.all(others.map(function (o) { return open(key, o.m).then(function (p) { return JSON.parse(p); }, function () { return { n: '' }; }); })).then(function (names) { onPresence && onPresence(names); });
        }));
      });
    });
  }
  function stopLive() { liveStop.forEach(function (f) { try { f(); } catch (e) {} }); liveStop = []; seen = {}; lastId = 0; }

  /* ---------------- account ---------------- */
  function signUp(email, pass) {
    return A.signUp(email, pass).then(function (r) { if (r.needsConfirm) return { needsConfirm: true }; st.user = r.user; return afterLogin().then(function () { emit(); return { ok: true }; }); });
  }
  function signIn(email, pass) { return A.signIn(email, pass).then(function (r) { st.user = r.user; return afterLogin().then(function () { return refreshCouple(); }).then(function () { emit(); if (st.vault === 'ready') return syncNow(); }); }); }
  function signOut() {
    return pushDirty().catch(function () {}).then(function () { return A.signOut(); }).then(function () {
      stopLive(); st.user = null; st.vault = 'none'; st.couple = null; vk = null;
      SY.raw.remove('ka_vkey'); emit();
    });
  }
  /* Delete everything this account stored in the cloud (device data stays). */
  function wipeCloud(alsoAccount) {
    return (st.couple ? A.leaveCouple(st.couple.id).catch(function () {}) : Promise.resolve()).then(function () { return A.vaultDelete(null); })
      .then(function () { return alsoAccount ? A.deleteAccount() : null; })
      .then(function () { SY.raw.remove('ka_sync_linked_' + st.user.id); LS.removeItem('ka_couple_link'); st.couple = null; if (alsoAccount) return signOut(); emit(); });
  }
  function resetPassword(email) { return A.resetPassword(email); }

  function init() {
    if (!kind) { st.ready = true; emit(); return Promise.resolve(); }
    A = kind === 'supabase' ? supabaseAdapter() : mockAdapter();
    return A.init().then(function () { return A.user(); }).then(function (u) {
      if (!u) return; st.user = u; return afterLogin().then(function () { if (st.vault === 'ready') return syncNow().then(refreshCouple); });
    }).catch(setErr).then(function () { st.ready = true; emit(); });
  }
  window.KA_CLOUD = {
    state: function () { return st; }, init: init, signUp: signUp, signIn: signIn, signOut: signOut, resetPassword: resetPassword, unlock: unlock,
    syncNow: syncNow, pushDirty: pushDirty, wipeCloud: wipeCloud,
    couple: { create: createInvite, join: joinInvite, leave: leave, link: inviteLink, info: linkInfo, refresh: refreshCouple, send: sendEvent, list: listEvents, del: deleteEvent, live: startLive, stop: stopLive }
  };
  /* notice when the partner joins/leaves: poll while a couple exists */
  setInterval(function () {
    if (document.hidden || !st.user || st.vault !== 'ready') return;
    var c = st.couple; if (!c) return;
    var was = c.partnerJoined; refreshCouple();
  }, 4000);
  init();
})();
