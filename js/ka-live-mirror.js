/* Live two-phone mirror for roll-and-read games (Dice, Position selectors).
   Whoever's turn it is rolls; the result appears on both phones. Turns alternate. */
(function () {
  'use strict';
  var cfg = window.KA_MIRROR; if (!cfg || !window.KA_DUO) return;
  var doc = document, L = null, applying = false, res = doc.querySelector(cfg.res || '#results'), btn = doc.querySelector(cfg.btn || '#rollBtn');
  if (!res || !btn) return;
  var D = KA_DUO.init({ g: cfg.g, key: 'ka_mirror_' + cfg.g, get: function () { return L; },
    onState: function (m) { L = m; show(m); gate(); bar(); }, onQuit: function () { L = null; gate(); bar(); }, onLink: function () {} });
  L = D.load(); if (L && L.mode !== 'two') L = null;
  var extra = (cfg.extra || []).map(function (s) { return doc.querySelector(s); });
  function show(m) {
    if (!m.html) return; applying = true; res.innerHTML = m.html;
    extra.forEach(function (e, i) { if (e && m.ex && m.ex[i] != null) e.textContent = m.ex[i]; });
    // keep partner's result images from looking broken
    [].forEach.call(res.querySelectorAll('img'), function (im) { im.addEventListener('error', function () { im.style.display = 'none'; }); });
    setTimeout(function () { applying = false; }, 60);
  }
  function mine() { return !L || L.turn === D.me; }
  function gate() { setTimeout(function () { if (L) btn.disabled = !mine() ? true : btn.disabled && !mine(); }, 80); }
  btn.addEventListener('click', function (e) { if (L && !mine()) { e.stopImmediatePropagation(); e.preventDefault(); if (window.KX) KX.toast("It is your partner's turn to roll"); } }, true);
  function barEl() { return doc.getElementById('ka-mirror-bar'); }
  function bar() {
    var b = barEl(); if (!b) { b = doc.createElement('div'); b.id = 'ka-mirror-bar'; b.style.cssText = 'display:flex;gap:8px;align-items:center;justify-content:center;margin:10px auto;padding:8px 12px;font:14px DM Sans,system-ui,sans-serif;color:#f5ecff'; btn.parentNode.insertBefore(b, btn.nextSibling); }
    if (!L) { b.innerHTML = '<button type="button" id="kmb" style="padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.07);color:inherit;font:inherit;cursor:pointer">📱📱 Play live with partner</button>'; b.querySelector('#kmb').onclick = start; }
    else { var n = D.names(L); b.innerHTML = '<span>📱📱 Live · ' + (mine() ? 'your turn to roll' : n[L.turn] + ' rolls next') + '</span><button type="button" id="kms" style="padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.25);background:transparent;color:inherit;font:inherit;cursor:pointer">Stop</button>'; b.querySelector('#kms').onclick = function () { D.quit(L); L = null; btn.disabled = false; bar(); }; }
  }
  function start() { if (!D.linked()) { if (window.KX) KX.toast('Link your partner in Together first'); return; } L = { mode: 'two', gid: Date.now(), seq: 0, phase: 'play', turn: 0, html: null, ex: [] }; D.setMe(0); D.save(L); bar(); }
  new MutationObserver(function () {
    if (!L || applying) return; if (!res.innerHTML.trim()) return;
    L.html = res.innerHTML; L.ex = extra.map(function (e) { return e ? e.textContent : null; }); L.turn = 1 - D.me; D.save(L); bar(); setTimeout(function () { btn.disabled = !mine(); }, 900);
  }).observe(res, { childList: true, subtree: false });
  bar();
})();
