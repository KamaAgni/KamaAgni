/* 18+ gate + first-run welcome (names). Runs on every page. */
(function () {
  'use strict';
  var get = function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  var set = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  if (get('ka_adult') && get('ka_welcomed')) return;
  var css = document.createElement('style');
  css.textContent = '.kg{position:fixed;inset:0;z-index:2147483600;background:#05060fee;display:flex;align-items:center;justify-content:center;padding:20px;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}.kg-c{max-width:420px;width:100%;background:#0c0e1c;border:1px solid rgba(255,255,255,.15);border-radius:22px;padding:26px 22px;text-align:center;color:#dce9ff;font-family:"DM Sans",system-ui,sans-serif}.kg-c h2{font-family:Cinzel,serif;font-size:24px;margin-bottom:10px;color:#f4a0ae}.kg-c p{font-size:14px;line-height:1.6;color:#a8bcd8;margin-bottom:14px}.kg-c input{width:100%;background:#12152a;border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:12px;color:#dce9ff;font:inherit;margin-bottom:10px}.kg-b{display:block;width:100%;padding:13px;border-radius:999px;border:0;background:linear-gradient(135deg,#e8637a,#f07090);color:#fff;font:inherit;font-weight:700;cursor:pointer;margin-top:6px;min-height:46px}.kg-b.g{background:transparent;border:1px solid rgba(255,255,255,.15);color:#a8bcd8}';
  document.head.appendChild(css);
  function box(html) { var d = document.createElement('div'); d.className = 'kg'; d.innerHTML = '<div class="kg-c">' + html + '</div>'; document.body.appendChild(d); return d; }
  function welcome() {
    if (get('ka_welcomed')) return;
    var d = box('<h2>Welcome 🔥</h2><p>Who is playing? Games will use your names. Everything stays on this device.</p><input id="kg1" maxlength="20" placeholder="Your name"><input id="kg2" maxlength="20" placeholder="Partner\'s name"><button class="kg-b" id="kgok">Let\'s go</button><button class="kg-b g" id="kgsk">Skip for now</button>');
    var done = function (save) {
      if (save) { var a = d.querySelector('#kg1').value.trim(), b = d.querySelector('#kg2').value.trim(); if (a || b) set('ka_couple', { p1: a || 'Partner 1', p2: b || 'Partner 2' }); }
      set('ka_welcomed', 1); d.remove();
    };
    d.querySelector('#kgok').onclick = function () { done(true); };
    d.querySelector('#kgsk').onclick = function () { done(false); };
  }
  function start() {
    if (get('ka_adult')) return welcome();
    var d = box('<h2>Adults only · 18+</h2><p>KamaAgni contains explicit content for consenting adult couples. By entering you confirm you are 18 or older (or the legal age where you live) and want to see it. Consent is always required — pass or stop any time.</p><button class="kg-b" id="kgy">I am 18+ — enter</button><button class="kg-b g" id="kgn">Leave</button>');
    d.querySelector('#kgy').onclick = function () { set('ka_adult', 1); d.remove(); welcome(); };
    d.querySelector('#kgn').onclick = function () { location.href = 'https://www.google.com'; };
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
