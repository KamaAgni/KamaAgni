/* KamaAgni "we both love it" (v81). Shares each partner's favourites for a list (Position Library 'pos', Play Book 'pb')
   over the encrypted couple events (kind 'favs'), so a page can show what you've BOTH starred.
   A page calls KA_BOTH.sync(key, names) on load and after each change; KA_BOTH.partner(key) returns the partner's list.
   Partner lists are stored in ka_both_<key>. Only favourites are shared, never "tried" ticks. Loaded on every page by ka-chrome.js. */
(function () {
  'use strict';
  if (window.KA_BOTH) return;
  function rd(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function wr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function linked() { var c = window.KA_CLOUD, s = c && c.state && c.state(); return !!(s && s.couple && s.couple.partnerJoined && s.vault === 'ready'); }
  var waiting = {};
  function send(k) {
    var list = waiting[k]; if (!list || !linked()) return;
    var sig = JSON.stringify(list.slice().sort());
    if (rd('ka_both_sent_' + k, '') === sig) { delete waiting[k]; return; }
    try { window.KA_CLOUD.couple.send('favs', { k: k, v: list, at: Date.now() }).then(function () { wr('ka_both_sent_' + k, sig); delete waiting[k]; }).catch(function () {}); } catch (e) {}
  }
  function sync(k, list) { waiting[k] = (list || []).slice(0, 400); setTimeout(function () { send(k); }, 1200); }
  function partner(k) { var o = rd('ka_both_' + k, null); return o && Array.isArray(o.v) ? o.v : []; }
  (window.KA_EV_HOOKS = window.KA_EV_HOOKS || []).push(function (evs) {
    var seen = rd('ka_both_seen', 0), top = seen, got = {};
    evs.forEach(function (e) { if (e.kind === 'favs' && !e.mine && e.body && e.body.k && e.id > seen) { got[e.body.k] = e.body; top = Math.max(top, e.id); } });
    if (top === seen) return;
    wr('ka_both_seen', top);
    Object.keys(got).forEach(function (k) { var cur = rd('ka_both_' + k, null); if (!cur || (cur.at || 0) <= (got[k].at || 0)) wr('ka_both_' + k, { v: got[k].v || [], at: got[k].at || Date.now() }); });
    try { window.dispatchEvent(new CustomEvent('ka:both')); } catch (e) {}
  });
  /* retry pending sends when the account becomes ready */
  window.addEventListener('ka:cloud', function () { Object.keys(waiting).forEach(send); });
  /* v84: yearly review across both phones. Each phone sends its own year summary once a day when linked
     (couple event 'yr'); the partner's copy is kept in ka_year_p.<year>. merged(Y) combines both, counting a game
     both phones logged within 3 hours only once, and positions, games, badges and months only once. */
  function yearData(Y) {
    var inY = function (t) { return t && new Date(+t).getFullYear() === Y; };
    var H = (rd('ka_hist', []) || []).filter(function (e) { return inY(e.t) && e.y !== 'open'; }).map(function (e) { return [e.t, e.a]; });
    var pos = rd('ka_pos', {}) || {}, pb = rd('ka_playbook', {}) || {}, mm = rd('ka_mem_v1', {}) || {};
    var ent = function (o) { return Object.keys(o || {}).filter(function (n) { return inY(o[n]); }).map(function (n) { return [n, o[n]]; }); };
    return { Y: Y, h: H.slice(0, 400), pos: ent(pos.tried), pb: ent(pb.done), won: Object.keys((rd('ka_month', {}) || {}).won || {}).filter(function (m) { return m.slice(0, 4) === String(Y); }),
      mem: (Array.isArray(mm.e) ? mm.e : []).filter(function (m) { return m && m.d && String(m.d).slice(0, 4) === String(Y); }).length };
  }
  function merged(Y) {
    var me = yearData(Y), pa = (rd('ka_year_p', {}) || {})[Y];
    if (!pa) return { d: me, both: false };
    var H = me.h.slice();
    (pa.h || []).forEach(function (x) { if (!H.some(function (y) { return y[1] === x[1] && Math.abs(y[0] - x[0]) < 3 * 36e5; })) H.push(x); });
    var uni = function (a, b) { var m = {}; a.concat(b || []).forEach(function (x) { if (!m[x[0]] || m[x[0]] < x[1]) m[x[0]] = x[1]; }); return Object.keys(m).map(function (n) { return [n, m[n]]; }); };
    var won = me.won.slice(); (pa.won || []).forEach(function (m) { if (won.indexOf(m) < 0) won.push(m); });
    return { d: { Y: Y, h: H, pos: uni(me.pos, pa.pos), pb: uni(me.pb, pa.pb), won: won.sort(), mem: Math.max(me.mem, pa.mem || 0) }, both: true, at: pa.at };
  }
  function sendYear() {
    if (!linked()) return;
    var Y = new Date().getFullYear(), day = new Date().toISOString().slice(0, 10), d = yearData(Y), sig = day + ':' + d.h.length + ':' + d.pos.length + ':' + d.pb.length + ':' + d.won.length + ':' + d.mem;
    if (rd('ka_year_sent', '') === sig) return;
    try { window.KA_CLOUD.couple.send('yr', { d: d, at: Date.now() }).then(function () { wr('ka_year_sent', sig); }).catch(function () {}); } catch (e) {}
  }
  (window.KA_EV_HOOKS = window.KA_EV_HOOKS || []).push(function (evs) {
    var seen = rd('ka_year_seen', 0), top = seen, P = rd('ka_year_p', {}) || {}, ch = false;
    evs.forEach(function (e) { if (e.kind === 'yr' && e.id > seen) { top = Math.max(top, e.id); if (!e.mine && e.body && e.body.d && e.body.d.Y) { var o = P[e.body.d.Y]; if (!o || (o.at || 0) <= (e.body.at || 0)) { P[e.body.d.Y] = Object.assign({}, e.body.d, { at: e.body.at }); ch = true; } } } });
    if (top > seen) wr('ka_year_seen', top);
    if (ch) { wr('ka_year_p', P); try { window.dispatchEvent(new CustomEvent('ka:year')); } catch (e) {} }
    sendYear();
  });
  window.KA_BOTH = { sync: sync, partner: partner, linked: linked, yearData: yearData, merged: merged, sendYear: sendYear };
})();
