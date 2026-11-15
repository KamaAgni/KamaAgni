/* KamaAgni next-day aftercare (v79). Finishing a Guided Session, reaching a role-play's afterglow step or ticking off
   tonight's whole plan sets a gentle reminder for the next day: "💗 How did last night feel?" on Home, which opens
   games/kamaagni-afterglow.html. When linked, the partner's phone gets the same reminder (couple event 'aft').
   Stored in ka_after {at, what, u, done}. Loaded on every page by ka-chrome.js. */
(function () {
  'use strict';
  if (window.KA_AFTER) return;
  function rd(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function wr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function day(t) { var d = new Date(t); return d.getFullYear() * 1e4 + (d.getMonth() + 1) * 100 + d.getDate(); }
  function linked() { var c = window.KA_CLOUD, s = c && c.state(); return s && s.couple && s.couple.partnerJoined && s.vault === 'ready'; }
  function mark(what) {
    var cur = rd('ka_after', null), now = Date.now();
    /* one reminder per night: keep the first thing you did, add the rest */
    if (cur && !cur.done && day(cur.at) === day(now)) { if (cur.what.indexOf(what) < 0) cur.what.push(what); wr('ka_after', cur); }
    else wr('ka_after', { at: now, what: [what], done: 0 });
    if (linked()) try { window.KA_CLOUD.couple.send('aft', { at: now, what: what }).catch(function () {}); } catch (e) {}
  }
  /* due the next day, for 3 days, until answered */
  function due() { var a = rd('ka_after', null); if (!a || a.done) return null; var n = Date.now(); return day(n) > day(a.at) && n - a.at < 3 * 864e5 ? a : null; }
  function done() { var a = rd('ka_after', null); if (a) { a.done = 1; wr('ka_after', a); } }
  (window.KA_EV_HOOKS = window.KA_EV_HOOKS || []).push(function (evs) {
    var e = evs.filter(function (x) { return x.kind === 'aft' && !x.mine && x.body; }).pop(); if (!e) return;
    var cur = rd('ka_after', null), seen = rd('ka_after_seen', 0); if (e.id <= seen) return; wr('ka_after_seen', e.id);
    if (cur && day(cur.at) === day(e.body.at)) { if (cur.what.indexOf(e.body.what) < 0) { cur.what.push(e.body.what); wr('ka_after', cur); } return; }
    if (!cur || cur.at < e.body.at) wr('ka_after', { at: e.body.at, what: [e.body.what], done: 0 });
  });
  window.KA_AFTER = { mark: mark, due: due, done: done };
})();
