/* KamaAgni shared settings (v78). When you are linked, both phones use the SAME settings:
   heat level (ka_heat), topic filters + hide-words + hidden games (ka_filter), and names & genders (ka_couple, mirrored:
   my "p1" is your "p2"). A change on either phone is sent as an encrypted couple event ('cfg') and applied on the other.
   First link: the two sets are merged the safe way (lower heat, every topic either of you switched off, all hide-words,
   all hidden games), then both phones use the result. Loaded on every page by ka-chrome.js. */
(function () {
  'use strict';
  if (window.KA_SHARED) return;
  var KEYS = { ka_heat: 1, ka_filter: 1, ka_couple: 1, ka_datenight: 1 }, applying = false, dirty = 0;
  var LS = window.localStorage;
  function rd(k, d) { try { var v = LS.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function wr(k, v) { applying = true; try { LS.setItem(k, JSON.stringify(v)); } catch (e) {} applying = false; }
  function C() { return window.KA_CLOUD; }
  function linked() { var s = C() && C().state(); return s && s.couple && s.couple.partnerJoined && s.vault === 'ready' ? s.couple : null; }
  function meta() { return rd('ka_shared', {}) || {}; }
  function setMeta(m) { applying = true; try { LS.setItem('ka_shared', JSON.stringify(m)); } catch (e) {} applying = false; }
  function filt() { var f = rd('ka_filter', null); return f && typeof f === 'object' ? { off: f.off || null, pages: f.pages || {}, words: f.words || [], lim: f.auto && f.auto.me ? { off: f.auto.me.off, rx: f.auto.me.rx, c: (f.auto.me.n || []).length } : null } : null; }   /* names never leave this phone, only the hiding patterns and a count */
  function mine() {
    var c = rd('ka_couple', {}) || {};
    return { heat: rd('ka_heat', 3), filter: filt(), me: { n: c.p1 || '', g: c.g1 || '' }, you: { n: c.p2 || '', g: c.g2 || '' }, dn: rd('ka_datenight', null), at: meta().last || Date.now() };
  }
  /* watch local changes to the shared keys */
  var orig = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    var r = orig.apply(this, arguments);
    if (this === LS && KEYS[k] && !applying) { var m = meta(); m.last = Date.now(); setMeta(m); clearTimeout(dirty); dirty = setTimeout(send, 1500); }
    return r;
  };
  function send(extra) {
    var c = linked(); if (!c) return Promise.resolve();
    var b = mine(); b.at = meta().last || Date.now(); if (extra) for (var k in extra) b[k] = extra[k];
    return C().couple.send('cfg', b).catch(function () {});
  }
  function partnerName() { var c = rd('ka_couple', {}) || {}; return c.p2 || 'Your partner'; }
  function union(a, b) { var o = {}; [a || {}, b || {}].forEach(function (x) { for (var k in x) if (x[k]) o[k] = 1; }); return o; }
  function apply(b, merge) {
    var f0 = filt(), heat0 = rd('ka_heat', 3), f1 = b.filter || null, nf;
    if (merge) {
      var off0 = (f0 && f0.off) || null, off1 = (f1 && f1.off) || null;
      nf = { off: off0 || off1 ? union(off0, off1) : null, pages: union(f0 && f0.pages, f1 && f1.pages), words: [], v: 1 };
      var seen = {}; ((f0 && f0.words) || []).concat((f1 && f1.words) || []).forEach(function (w) { var k = String(w).toLowerCase().trim(); if (k && !seen[k]) { seen[k] = 1; nf.words.push(w); } });
      if (!nf.off) delete nf.off;
      wr('ka_heat', Math.max(1, Math.min(+heat0 || 3, +b.heat || 3)));
    } else {
      nf = f1 ? { off: f1.off, pages: f1.pages || {}, words: f1.words || [], v: 1 } : null;
      if (!nf || !nf.off) { if (nf) delete nf.off; }
      if (b.heat) wr('ka_heat', +b.heat);
    }
    /* "Not for me" layers: keep my own (auto.me), take my partner's own list as auto.you */
    if (nf) { var cur = rd('ka_filter', {}) || {}, au = {}; if (cur.auto && cur.auto.me) au.me = cur.auto.me; if (f1 && f1.lim) au.you = f1.lim; if (au.me || au.you) nf.auto = au; delete nf.lim; wr('ka_filter', nf); }
    /* weekly date night: newest wins; on first link keep whichever of you set one */
    if (b.dn && (!merge || !rd('ka_datenight', null) || !rd('ka_datenight', {}).on)) wr('ka_datenight', b.dn);
    /* names mirrored: their "me" is my "you" */
    var c = rd('ka_couple', {}) || {};
    if (b.me && b.me.n) { c.p2 = b.me.n; if (b.me.g) c.g2 = b.me.g; }
    if (!merge && b.you && b.you.n) { c.p1 = b.you.n; if (b.you.g) c.g1 = b.you.g; }
    wr('ka_couple', c);
    try { window.dispatchEvent(new CustomEvent('ka:filter')); window.dispatchEvent(new CustomEvent('ka:shared')); } catch (e) {}
  }
  /* incoming: called by ka-chrome with the latest couple events */
  function onEvents(evs) {
    var c = linked(); if (!c) return;
    var m = meta(), first = m.cid !== c.id;
    var theirs = evs.filter(function (e) { return e.kind === 'cfg' && !e.mine && e.body; });
    var last = theirs[theirs.length - 1];
    if (first) {
      m.cid = c.id; m.seen = last ? last.id : 0;
      if (last) { apply(last.body, true); m.last = Date.now(); setMeta(m); send({ merged: 1 }); toast('⚙️ Settings now shared with ' + partnerName() + '. We kept the safer choice of each.'); }
      else { m.last = m.last || Date.now(); setMeta(m); send({ hello: 1 }); }
      return;
    }
    if (!last || last.id <= (m.seen || 0)) return;
    m.seen = last.id; setMeta(m);
    if (last.body.hello && !last.body.merged) { apply(last.body, true); m.last = Date.now(); setMeta(m); send({ merged: 1 }); return; }
    if ((+last.body.at || 0) > (+m.last || 0)) {
      var h0 = rd('ka_heat', 3); apply(last.body, false); m.last = +last.body.at; setMeta(m);
      var HN = { 1: 'Sweet', 2: 'Spicy', 3: 'Wild' };
      if (!last.body.merged) toast('⚙️ ' + (last.body.me && last.body.me.n || partnerName()) + ' updated your shared settings' + (+last.body.heat !== +h0 ? ' (heat: ' + (HN[last.body.heat] || last.body.heat) + ')' : '') + '.');
    }
  }
  function toast(t) { setTimeout(function () { try { window.KA && KA.toast && KA.toast(t); } catch (e) {} }, 400); }
  (window.KA_EV_HOOKS = window.KA_EV_HOOKS || []).push(onEvents);
  /* Settings page: say clearly that these settings are shared */
  function note() {
    if (!/kamaagni-settings\.html/.test(location.pathname)) return;
    var app = document.getElementById('app'), sub = app && app.querySelector('.kx-sub'); if (!sub) return;
    var n = document.getElementById('ka-shared-note'), on = !!linked();
    if (!on) { if (n) n.remove(); return; }
    if (!n) { n = document.createElement('div'); n.id = 'ka-shared-note'; n.className = 'kx-card'; n.style.cssText = 'padding:12px 14px;border-color:rgba(74,222,128,.45);background:rgba(74,222,128,.07)'; sub.parentNode.insertBefore(n, sub.nextSibling); }
    n.innerHTML = '🔗 <b>Shared with ' + String(partnerName()).replace(/[<>&"]/g, '') + '.</b> Heat level, topics, hide-words, hidden games and your names are the same on both phones. A change here changes it for both of you.';
  }
  var nt = 0; (function wait() { note(); if (++nt < 30) setTimeout(wait, 400); })();
  window.addEventListener('ka:cloud', note);
  window.KA_SHARED = { linked: function () { return !!linked(); }, partner: partnerName, sendNow: function () { return send(); }, _apply: apply, _on: onEvents };
})();
