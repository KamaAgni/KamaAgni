/* KamaAgni remote (v82, shared in v83). One partner taps a message and the other partner's phone shows it straight away.
   Sets: massage, session (Guided Session), roleplay. Messages travel as the encrypted couple event 'mrm';
   🟢🟡🔴 reuse Together's 'sig' event, so a red is the same full STOP alert everywhere.
   KA_REMOTE.open(set) shows the remote screen. On pages where it's used the phone checks every 3 seconds
   (KA_CHROME.check), elsewhere the normal 9-second check. Loaded on every page by ka-chrome.js. */
(function () {
  'use strict';
  if (window.KA_REMOTE) return;
  var MSG = {
    lighter: ['🪶', 'Lighter, please'], firmer: ['💪', 'Firmer, please'], slower: ['🐢', 'Slower'], faster: ['⚡', 'A little faster'],
    stay: ['💗', 'Stay right there'], next: ['➡️', 'Move on to the next spot'], warm: ['🔥', 'More oil or warmer hands'], love: ['😍', 'That feels amazing'],
    more: ['🔥', 'More of that'], pause: ['⏸', 'Pause for a moment'], change: ['🔄', 'Let’s change it up'], water: ['💧', 'Water break'],
    cuddle: ['🤗', 'I need a cuddle'], kiss: ['💋', 'Kiss me'], nextstep: ['⏭', 'Ready for the next step'],
    scene: ['🎬', 'Next scene'], stayin: ['🎭', 'Stay in character'], breakc: ['🙂', 'Step out of character for a sec']
  };
  var SETS = {
    massage: ['lighter', 'firmer', 'slower', 'faster', 'stay', 'next', 'warm', 'love'],
    session: ['more', 'slower', 'stay', 'change', 'kiss', 'cuddle', 'water', 'nextstep'],
    roleplay: ['more', 'slower', 'stayin', 'breakc', 'scene', 'kiss', 'water', 'love']
  };
  var SIG = { g: ['🟢', 'Green: I love this'], y: ['🟡', 'Yellow: slow down'], r: ['🔴', 'Red: STOP'] };
  function rd(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function wr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function linked() { var c = window.KA_CLOUD, s = c && c.state && c.state(); return !!(s && s.couple && s.couple.partnerJoined && s.vault === 'ready'); }
  /* v84: remote history for the morning-after check-in, on this phone only (ka_remote_log, last 300, 30 days) */
  function log(v, dir) { var L = rd('ka_remote_log', []); if (!Array.isArray(L)) L = []; var now = Date.now(); L.push({ t: now, v: v, d: dir }); L = L.filter(function (x) { return now - x.t < 30 * 864e5; }).slice(-300); wr('ka_remote_log', L); }
  function show(v, from) {
    var m = MSG[v]; if (!m) return;
    try { if (navigator.vibrate) navigator.vibrate([60, 40, 60]); } catch (e) {}
    if (window.KA_CHROME && KA_CHROME.notify) KA_CHROME.notify({ icon: m[0], title: (from || 'Your partner') + ' says', text: m[1], kind: 'remote' });
    try { window.dispatchEvent(new CustomEvent('ka:remote', { detail: { v: v, text: m[1], icon: m[0] } })); } catch (e) {}
  }
  function send(v) {
    if (!linked() || !(MSG[v] || SIG[v])) return Promise.resolve(false);
    var p; try { p = SIG[v] ? window.KA_CLOUD.couple.send('sig', { s: v }) : window.KA_CLOUD.couple.send('mrm', { v: v, at: Date.now() }); } catch (e) { return Promise.resolve(false); }
    return p.then(function () { log(v, 'out'); return true; }, function () { return false; });
  }
  function handle(evs) {
    var seen = rd('ka_remote_seen', 0), top = seen, names = (window.KX && KX.names) ? KX.names() : null;
    evs.forEach(function (e) {
      if (e.kind !== 'mrm' || e.mine || !e.body || e.id <= seen) return;
      top = Math.max(top, e.id);
      if (Date.now() - (e.body.at || 0) < 120000) { log(e.body.v, 'in'); show(e.body.v, names ? names[1] : ''); }
    });
    /* received traffic-light signals go in the history too */
    var ss = rd('ka_remote_sigseen', 0), stop2 = ss;
    evs.forEach(function (e) { if (e.kind === 'sig' && !e.mine && e.body && e.id > ss) { stop2 = Math.max(stop2, e.id); if (Date.now() - (+new Date(e.at || e.created_at || Date.now())) < 864e5) log(e.body.s, 'in'); } });
    if (stop2 > ss) wr('ka_remote_sigseen', stop2);
    if (top > seen) wr('ka_remote_seen', top);
  }
  (window.KA_EV_HOOKS = window.KA_EV_HOOKS || []).push(handle);
  /* a partner's dice roll in the Play Book, when you're on another page */
  if (!/kamaagni-playbook/.test(location.pathname)) (window.KA_EV_HOOKS).push(function (evs) {
    var seen = rd('ka_dice_seen', 0), top = seen, last = null;
    evs.forEach(function (e) { if (e.kind === 'dice' && e.id > seen) { top = Math.max(top, e.id); if (!e.mine && e.body && Date.now() - (e.body.at || 0) < 120000) last = e.body; } });
    if (top > seen) wr('ka_dice_seen', top);
    if (last && window.KA_CHROME) { var nm = (window.KX && KX.names) ? KX.names()[1] : 'Your partner';
      KA_CHROME.notify({ icon: '🎲', title: nm + ' rolled the dice', text: last.n + ' · ' + (last.v === 'sp' ? 'spicy' : 'sweet') + ' · ' + last.t, kind: 'remote', href: 'games/kamaagni-playbook.html?g=' + encodeURIComponent(last.n) }); }
  });
  /* a partner's shared position walkthrough, when you're on another page */
  if (!/kamaagni-positions/.test(location.pathname)) (window.KA_EV_HOOKS).push(function (evs) {
    var seen = rd('ka_walk_seen', 0), top = seen, last = null;
    evs.forEach(function (e) { if (e.kind === 'walk' && e.id > seen) { top = Math.max(top, e.id); if (!e.mine && e.body && !e.body.end && Date.now() - (e.body.at || 0) < 90000) last = e.body; } });
    if (top > seen) wr('ka_walk_seen', top);
    if (last && window.KA_CHROME) { var nm = (window.KX && KX.names) ? KX.names()[1] : 'Your partner';
      KA_CHROME.notify({ icon: '👣', title: nm + ' started a walkthrough', text: last.n + ' · tap to join', kind: 'remote', href: 'games/kamaagni-positions.html?p=' + encodeURIComponent(last.n) + '&walk=' + (last.i || 0) }); }
  });
  /* the account can still be loading when the remote opens, so wait up to 5 seconds at each tap */
  function ready() { return new Promise(function (res) { var n = 0; (function t() { if (linked()) return res(true); if (++n > 20) return res(false); setTimeout(t, 250); })(); }); }
  function open(set) {
    var keys = SETS[set] || SETS.session, old = document.getElementById('ka-rm'); if (old) old.remove();
    var back = document.activeElement;
    var d = document.createElement('div'); d.id = 'ka-rm'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'Remote');
    d.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(5,6,15,.95);display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto';
    var intro = function (l) { return l ? 'Tap and your partner’s phone shows it within a few seconds. No need to say it out loud.' : 'Link your phones on the Together page to send these to your partner. Until then, show them this screen.'; };
    var btn = function (k, m, extra) { return '<button class="kx-btn ghost" data-rm="' + k + '" style="min-height:60px;font-size:15px;' + (extra || '') + '">' + m[0] + ' ' + esc(m[1]) + '</button>'; };
    d.innerHTML = '<div style="max-width:440px;width:100%"><h2 style="margin:0 0 4px;font-family:\'Cormorant Garamond\',serif;font-size:28px">📲 Remote</h2><p class="kx-muted" id="rm-in" style="margin:0 0 12px">' + intro(linked()) + '</p>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">' + Object.keys(SIG).map(function (k) { return btn(k, SIG[k], k === 'r' ? 'border-color:rgba(255,90,110,.8);color:#ffb3bd' : ''); }).join('') + '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' + keys.map(function (k) { return btn(k, MSG[k]); }).join('') + '</div>' +
      '<p id="rm-st" role="status" style="min-height:22px;margin:10px 0 0;text-align:center;color:#f0be3c"></p><button class="kx-btn" id="rm-x" style="display:block;margin:8px auto 0">Close</button></div>';
    document.body.appendChild(d);
    var st = d.querySelector('#rm-st');
    if (!linked()) ready().then(function (l) { if (l) d.querySelector('#rm-in').textContent = intro(true); });
    Array.prototype.forEach.call(d.querySelectorAll('[data-rm]'), function (b) {
      b.onclick = function () {
        var k = b.getAttribute('data-rm'), m = MSG[k] || SIG[k]; st.textContent = 'Sending…';
        ready().then(function (l) {
          if (!l) { st.textContent = m[0] + ' ' + m[1] + ' (not linked, so show your partner this screen)'; return; }
          send(k).then(function (r) { st.textContent = r ? '✓ Sent: ' + m[1] : 'Couldn’t send. Check your connection.'; });
        });
      };
    });
    var close = function () { d.remove(); document.removeEventListener('keydown', onk); try { back && back.focus(); } catch (e) {} };
    var onk = function (e) { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onk);
    d.querySelector('#rm-x').onclick = close; d.querySelector('#rm-x').focus();
  }
  /* faster checks on pages that use the remote */
  if (/kamaagni-(massage|session|roleplay|playbook)/.test(location.pathname)) setInterval(function () {
    if (document.hidden || !linked() || !(window.KA_CHROME && KA_CHROME.check)) return;
    try { KA_CHROME.check(); } catch (e) {}
  }, 3000);
  /* summary of the remote over a time window: [{v, icon, text, out, in}] most used first */
  function history(from, to) {
    var L = rd('ka_remote_log', []), c = {};
    (Array.isArray(L) ? L : []).forEach(function (x) { if (x.t < from || x.t > to) return; var m = MSG[x.v] || SIG[x.v]; if (!m) return; c[x.v] = c[x.v] || { v: x.v, icon: m[0], text: m[1], out: 0, 'in': 0 }; c[x.v][x.d === 'out' ? 'out' : 'in']++; });
    return Object.keys(c).map(function (k) { return c[k]; }).sort(function (a, b) { return (b.out + b['in']) - (a.out + a['in']); });
  }
  window.KA_REMOTE = { send: send, show: show, open: open, history: history, MSG: MSG, SIG: SIG, SETS: SETS, linked: linked };
})();
