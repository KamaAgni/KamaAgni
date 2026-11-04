/* KamaAgni duplicate guard: before you add your own idea, check it against everything already in the site. */
(function () {
  'use strict';
  var SRC = ['deck/truth','deck/dare','deck/nhie','deck/who','deck/wyp','deck/know','deck/conn','deck/coupons','deck/scratch','deck/nhie','tasks','bdsm500','challenges','fun','journal_prompts','extras','pagetext','roleplay','roleplay_hooks'];
  var STOP = {the:1,a:1,an:1,and:1,or:1,to:1,of:1,in:1,on:1,at:1,for:1,with:1,your:1,you:1,her:1,his:1,their:1,my:1,me:1,we:1,our:1,is:1,are:1,be:1,it:1,that:1,this:1,then:1,as:1,by:1,from:1,them:1,they:1,him:1,she:1,he:1,until:1,while:1,each:1,every:1,one:1,take:1,have:1,has:1,minutes:1,minute:1,a1:1};
  var idx = null, loading = null;
  function toks(s) {
    var o = {}, w = String(s).toLowerCase().replace(/\{[ab]\}/g, ' ').replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/), n = 0;
    for (var i = 0; i < w.length; i++) { var t = w[i]; if (t.length < 3 || STOP[t]) continue; t = t.replace(/(ing|ed|es|s|ly)$/, ''); if (t.length < 3) continue; if (!o[t]) { o[t] = 1; n++; } }
    return { s: o, n: n };
  }
  function sim(a, b) {
    if (!a.n || !b.n) return 0; var c = 0, k;
    for (k in a.s) if (b.s[k]) c++;
    var jac = c / (a.n + b.n - c), cont = c / Math.min(a.n, b.n);
    return Math.max(jac, cont * 0.85 - (Math.abs(a.n - b.n) > 6 ? 0.2 : 0));
  }
  function walk(x, out) {
    if (typeof x === 'string') { if (x.length > 14 && x.length < 400) out.push(x); }
    else if (Array.isArray(x)) for (var i = 0; i < x.length; i++) walk(x[i], out);
    else if (x && typeof x === 'object') for (var k in x) walk(x[k], out);
  }
  function load(f) { return fetch(base() + 'data/' + f + '.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }
  function base() { var s = document.currentScript, sc = document.querySelector('script[src*="ka-dedup.js"]'); var u = (sc && sc.getAttribute('src')) || 'js/ka-dedup.js'; return u.replace(/js\/ka-dedup\.js.*$/, ''); }
  function build() {
    if (idx) return Promise.resolve(idx);
    if (loading) return loading;
    loading = load('packs/index').then(function (ix) {
      var files = SRC.slice(), packs = (ix || []).map(function (p) { return 'packs/' + p.id; });
      return Promise.all(files.concat(packs).map(load));
    }).then(function (all) {
      var seen = {}, list = [];
      all.forEach(function (j) { var out = []; if (j) walk(j, out); out.forEach(function (t) { var k = t.toLowerCase().replace(/[^a-z0-9]+/g, ''); if (seen[k]) return; seen[k] = 1; list.push({ t: t, k: toks(t) }); }); });
      idx = list; return idx;
    });
    return loading;
  }
  function find(text, extra, th) {
    th = th || 0.62; var q = toks(text), best = null, bs = 0, i, s;
    if (q.n < 2) return null;
    var pools = [idx || [], (extra || []).map(function (t) { return { t: t, k: toks(t) }; })];
    for (var p = 0; p < pools.length; p++) for (i = 0; i < pools[p].length; i++) { s = sim(q, pools[p][i].k); if (s > bs) { bs = s; best = pools[p][i].t; } }
    return bs >= th ? { text: best, score: bs } : null;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  /* check(lines, mine) -> Promise({fresh:[...], dups:[{t,like}]}) */
  function check(lines, mine) {
    return build().then(function () {
      var fresh = [], dups = [], seen = [];
      lines.forEach(function (t) { var m = find(t, (mine || []).concat(seen)); if (m) dups.push({ t: t, like: m.text }); else fresh.push(t); seen.push(t); });
      return { fresh: fresh, dups: dups };
    });
  }
  /* guard(lines, mine, done): shows a choice when similar ideas exist; calls done(linesToAdd) */
  function guard(lines, mine, done) {
    check(lines, mine).then(function (r) {
      if (!r.dups.length) return done(lines);
      var d = document.createElement('div'); d.id = 'ka-dd';
      d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
      d.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;padding:16px';
      d.innerHTML = '<div style="background:#14101f;color:#f3eefc;border:1px solid #7a5cff;border-radius:16px;max-width:520px;width:100%;max-height:85vh;overflow:auto;padding:18px;font:15px/1.4 system-ui,sans-serif"><h3 style="margin:0 0 6px">We already have something like this</h3><p style="margin:0 0 10px;opacity:.8">' + r.dups.length + ' of ' + lines.length + ' look like ideas already in the site, so adding them would give you repeats.</p>' +
        r.dups.map(function (x) { return '<div style="margin:8px 0;padding:8px 10px;border-radius:10px;background:#201a33"><div style="opacity:.7;font-size:12px">You wrote</div>' + esc(x.t) + '<div style="opacity:.7;font-size:12px;margin-top:6px">Already in the site</div>' + esc(x.like) + '</div>'; }).join('') +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button data-a="skip" style="flex:1;padding:10px;border-radius:10px;border:0;background:#7a5cff;color:#fff;font-weight:600">Use what we have' + (r.fresh.length ? ' (add the ' + r.fresh.length + ' new)' : '') + '</button><button data-a="all" style="flex:1;padding:10px;border-radius:10px;border:1px solid #7a5cff;background:none;color:#f3eefc">Add anyway</button><button data-a="no" style="padding:10px;border-radius:10px;border:0;background:none;color:#f3eefc;opacity:.7">Cancel</button></div></div>';
      document.body.appendChild(d);
      d.addEventListener('click', function (e) { var a = e.target && e.target.getAttribute && e.target.getAttribute('data-a'); if (!a) return; d.remove(); if (a === 'skip') done(r.fresh); else if (a === 'all') done(lines); });
      var b = d.querySelector('button'); if (b) b.focus();
    });
  }
  window.KA_DEDUP = { check: check, guard: guard, find: find, build: build, sim: function (a, b) { return sim(toks(a), toks(b)); } };
})();
