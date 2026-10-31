/* Live two-phone layer for the original Ludo board game. Syncs the saved game state and mirrors pop-ups. */
(function () {
  'use strict';
  window.KA_LIVE_LUDO = function (E) {
  var state = E.state, STORAGE_KEY = E.KEY;
  if (!window.KA_DUO) return;
  var doc = document, L = null, applying = false, lastModal = 0;
  var D = KA_DUO.init({ g: 'ludo', key: 'ka_ludo_duo', get: function () { return L; },
    onState: function (m) { L = m; applying = true; try { apply(m); } catch (e) {} applying = false; bar(); }, onQuit: function () { L = null; try { setControlsEnabled(true); } catch (e) {} bar(); }, onLink: function () {} });
  L = D.load(); if (L && L.mode !== 'two') L = null;
  var _save = E.getSave(), _modal = E.getModal(), _set = E.getCtl();
  E.setSave(function () { _save(); if (L && !applying) { L.snap = localStorage.getItem(STORAGE_KEY); D.save(L); } });
  E.setModal(function (t, h, cb) { if (L && !applying) { L.modal = { t: t, h: h, at: Date.now(), by: D.me }; D.save(L); } return _modal(t, h, cb); });
  var setControlsEnabled = function (e) { E.callCtl(e); };
  E.setCtl(function (e) { _set(e && (!L || state.currentPlayer === D.me)); });
  function apply(m) {
    if (m.snap) { localStorage.setItem(STORAGE_KEY, m.snap); E.loadState(); E.renderTokens(); E.updateUI(); setControlsEnabled(!!state.setupDone); if (state.setupDone) { var mr = doc.getElementById('modalRoot'); if (mr && /Game Setup/.test(mr.textContent)) mr.innerHTML = ''; } }
    if (m.modal && m.modal.at !== lastModal && m.modal.by !== D.me) { lastModal = m.modal.at; _modal(m.modal.t, m.modal.h); }
  }
  function bar() {
    var b = doc.getElementById('ka-ludo-bar');
    if (!b) { b = doc.createElement('div'); b.id = 'ka-ludo-bar'; b.style.cssText = 'display:flex;gap:8px;align-items:center;justify-content:center;margin:10px auto;font:14px DM Sans,system-ui,sans-serif;color:#f5ecff'; var r = doc.getElementById('result'); r.parentNode.insertBefore(b, r.nextSibling); }
    if (!L) { b.innerHTML = '<button type="button" id="klb" style="padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.07);color:inherit;font:inherit;cursor:pointer">📱📱 Play live with partner</button>'; b.querySelector('#klb').onclick = start; }
    else { b.innerHTML = '<span>📱📱 Live · you are ' + esc(state.players[D.me].name) + '</span><button type="button" id="kls" style="padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.25);background:transparent;color:inherit;font:inherit;cursor:pointer">Stop</button>'; b.querySelector('#kls').onclick = function () { D.quit(L); L = null; setControlsEnabled(true); bar(); }; }
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function start() {
    if (!D.linked()) { if (window.KX) KX.toast('Link your partner in Together first'); return; }
    L = { mode: 'two', gid: Date.now(), seq: 0, phase: 'play', snap: localStorage.getItem(STORAGE_KEY), modal: null }; D.setMe(0);
    if (D.partner && state.players[1].name !== D.partner) { /* names come from each phone's own profile */ }
    D.save(L); setControlsEnabled(!!state.setupDone); bar();
  }
  bar(); if (L) setControlsEnabled(!!state.setupDone);
  };
})();
