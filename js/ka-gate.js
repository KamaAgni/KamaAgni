/* KamaAgni gate: sign in before anything is shown. Used within the last hour? Just a PIN.
   Then the 18+ confirmation and first-run welcome (names). Runs on every page. */
(function () {
  'use strict';
  var CFG = window.KA_CONFIG || {}, HOUR = 3600000, MAXTRY = 5;
  var get = function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  var set = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  var del = function (k) { try { localStorage.removeItem(k); } catch (e) {} };
  var gateOn = CFG.GATE_LOGIN !== false && !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY || CFG.MOCK_URL);
  var css = document.createElement('style');
  css.textContent = '.kg{position:fixed;inset:0;z-index:2147483600;background:#05060f;display:flex;align-items:center;justify-content:center;padding:20px}.kg-c{max-width:420px;width:100%;background:#0c0e1c;border:1px solid rgba(255,255,255,.15);border-radius:22px;padding:26px 22px;text-align:center;color:#dce9ff;font-family:"DM Sans",system-ui,sans-serif}.kg-c h2{font-family:Cinzel,serif;font-size:24px;margin:0 0 10px;color:#f4a0ae}.kg-c p{font-size:14px;line-height:1.6;color:#a8bcd8;margin:0 0 14px}.kg-c input{width:100%;box-sizing:border-box;background:#12152a;border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:12px;color:#dce9ff;font:inherit;margin-bottom:10px}.kg-c input.pin{text-align:center;letter-spacing:.5em;font-size:24px}.kg-b{display:block;width:100%;padding:13px;border-radius:999px;border:0;background:linear-gradient(135deg,#e8637a,#f07090);color:#fff;font:inherit;font-weight:700;cursor:pointer;margin-top:6px;min-height:46px}.kg-b.g{background:transparent;border:1px solid rgba(255,255,255,.15);color:#a8bcd8}.kg-e{color:#ff9aa8;font-size:13px;min-height:18px;margin:0 0 6px}.kg-l{background:none;border:0;color:#a8bcd8;text-decoration:underline;cursor:pointer;font:inherit;font-size:13px;margin-top:10px}';
  document.head.appendChild(css);
  function unhide() { var x = document.getElementById('ka-hide'); if (x) x.remove(); }
  function box(html) { var o = document.querySelector('.kg'); if (o) o.remove(); var d = document.createElement('div'); d.className = 'kg'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.innerHTML = '<div class="kg-c">' + html + '</div>'; document.body.appendChild(d); unhide(); var i = d.querySelector('input'); if (i) try { i.focus(); } catch (e) {} return d; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---- activity clock: any use refreshes the hour ---- */
  var lastTouch = 0;
  function touch() { var n = Date.now(); if (n - lastTouch < 15000) return; lastTouch = n; try { localStorage.setItem('ka_last', String(n)); } catch (e) {} }
  function openSession() { try { sessionStorage.setItem('ka_ok', '1'); } catch (e) {} lastTouch = 0; touch(); window.KA_GATE = window.KA_GATE || {}; }
  function closeSession() { try { sessionStorage.removeItem('ka_ok'); } catch (e) {} del('ka_last'); }
  ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(function (ev) { window.addEventListener(ev, touch, { passive: true, capture: true }); });
  window.addEventListener('pagehide', function () { var ok; try { ok = sessionStorage.getItem('ka_ok') === '1'; } catch (e) {} if (ok) { lastTouch = 0; touch(); } });

  /* ---- PIN (stored as a salted PBKDF2 hash, per device) ---- */
  try { if (typeof JSON.parse(localStorage.getItem('ka_pin')) === 'string') { ['ka_pin', 'ka_pin_salt', 'ka_pin_lock', 'ka_autolock'].forEach(del); } } catch (e) { del('ka_pin'); }
  var subtle = window.crypto && crypto.subtle;
  function hashPin(pin, saltB64) {
    var salt = saltB64 ? Uint8Array.from(atob(saltB64), function (c) { return c.charCodeAt(0); }) : crypto.getRandomValues(new Uint8Array(16));
    return subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits']).then(function (k) {
      return subtle.deriveBits({ name: 'PBKDF2', salt: salt, iterations: 150000, hash: 'SHA-256' }, k, 256);
    }).then(function (bits) { var b = function (a) { var s = ''; new Uint8Array(a).forEach(function (x) { s += String.fromCharCode(x); }); return btoa(s); }; return { s: b(salt), h: b(bits) }; });
  }
  function uid() { var C = window.KA_CLOUD; var u = C && C.state().user; return u && u.id || ''; }

  /* ---- screens ---- */
  function loginScreen(note) {
    var inv = !!CFG.REQUIRE_INVITE, mode = 'in';
    var d = box('<h2>Welcome back 🔥</h2><p id="kgn">' + esc(note || 'Sign in to open KamaAgni.') + '</p><input id="kge" type="email" autocomplete="username" placeholder="Email"><input id="kgp" type="password" autocomplete="current-password" placeholder="Password">' + (inv ? '<input id="kgi" type="text" autocapitalize="characters" placeholder="Invite code (new accounts only)" style="display:none">' : '') + '<div class="kg-e" id="kgx"></div><button class="kg-b" id="kgs">Sign in</button><button class="kg-l" id="kgm">New here? Create an account</button> <button class="kg-l" id="kgf">Forgot password</button>');
    var q = function (id) { return d.querySelector('#' + id); }, err = function (m) { q('kgx').textContent = m || ''; };
    q('kgm').onclick = function () { mode = mode === 'in' ? 'up' : 'in'; q('kgs').textContent = mode === 'in' ? 'Sign in' : 'Create account'; q('kgm').textContent = mode === 'in' ? 'New here? Create an account' : 'Have an account? Sign in'; if (q('kgi')) q('kgi').style.display = mode === 'up' ? '' : 'none'; q('kgp').autocomplete = mode === 'in' ? 'current-password' : 'new-password'; err(''); };
    q('kgf').onclick = function () { var em = q('kge').value.trim(); if (!em) return err('Type your email first.'); KA_CLOUD.resetPassword(em).then(function () { err(''); q('kgn').textContent = 'Check your email for a reset link.'; }, function (e) { err(e.message || 'Could not send the email.'); }); };
    var go = function () {
      var em = q('kge').value.trim(), pw = q('kgp').value; if (!em || !pw) return err('Enter your email and password.');
      var b = q('kgs'); b.disabled = true; err('');
      var p = mode === 'in' ? KA_CLOUD.signIn(em, pw) : KA_CLOUD.signUp(em, pw, q('kgi') ? q('kgi').value : '');
      p.then(function (r) {
        if (r && r.needsConfirm) { b.disabled = false; q('kgn').textContent = 'Check your email to confirm, then sign in.'; mode = 'up'; q('kgm').click(); return; }
        pinSetup(function () { openSession(); next(); });
      }, function (e) { b.disabled = false; err((e && e.message) || 'That did not work.'); });
    };
    q('kgs').onclick = go; d.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
  }
  function pinSetup(done, optional) {
    if (!subtle) return done();
    var d = box('<h2>Set a PIN</h2><p>Choose 4 to 8 digits. If you were using KamaAgni in the last hour, the PIN is all you need to carry on.</p><input class="pin" id="kg1" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="off" placeholder="PIN"><input class="pin" id="kg2" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="off" placeholder="Again"><div class="kg-e" id="kgx"></div><button class="kg-b" id="kgok">Save PIN</button>' + (optional ? '<button class="kg-b g" id="kgcx">Cancel</button>' : ''));
    if (optional) d.querySelector('#kgcx').onclick = function () { d.remove(); };
    var go = function () {
      var a = d.querySelector('#kg1').value, b = d.querySelector('#kg2').value, e = d.querySelector('#kgx');
      if (!/^\d{4,8}$/.test(a)) { e.textContent = 'Use 4 to 8 digits.'; return; }
      if (a !== b) { e.textContent = 'The two PINs do not match.'; return; }
      hashPin(a).then(function (h) { set('ka_gpin', { u: uid(), s: h.s, h: h.h }); done(); });
    };
    d.querySelector('#kgok').onclick = go; d.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
  }
  function askPin(ok, cancel) {
    var rec = get('ka_gpin'), d = box('<h2>Enter your PIN</h2><p>Enter your PIN to unlock.</p><input class="pin" id="kg1" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="off" placeholder="••••"><div class="kg-e" id="kgx"></div><button class="kg-b" id="kgok">Unlock</button><button class="kg-b g" id="kgcx">Back</button>'), tries = 0;
    var inp = d.querySelector('#kg1'), e = d.querySelector('#kgx');
    d.querySelector('#kgcx').onclick = function () { d.remove(); cancel && cancel(); };
    var go = function () {
      if (!inp.value) return;
      hashPin(inp.value, rec.s).then(function (h) {
        if (h.h === rec.h) { openSession(); d.remove(); ok(); return; }
        tries++; inp.value = '';
        if (tries >= MAXTRY) { d.remove(); cancel && cancel(); lockNow('Too many wrong PINs. Please sign in again.'); return; }
        e.textContent = 'Wrong PIN. ' + (MAXTRY - tries) + ' tries left.';
      });
    };
    d.querySelector('#kgok').onclick = go; d.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') go(); });
  }
  function pinScreen() {
    var d = box('<h2>Enter your PIN</h2><p>Welcome back. Enter your PIN to pick up where you left off.</p><input class="pin" id="kg1" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="off" placeholder="••••"><div class="kg-e" id="kgx"></div><button class="kg-b" id="kgok">Unlock</button><button class="kg-l" id="kgpw">Use email and password instead</button>');
    var tries = 0, e = d.querySelector('#kgx'), inp = d.querySelector('#kg1');
    var full = function (why) { closeSession(); KA_CLOUD.signOut().catch(function () {}).then(function () { loginScreen(why); }); };
    d.querySelector('#kgpw').onclick = function () { full('Sign in with your email and password.'); };
    var go = function () {
      var pin = inp.value, rec = get('ka_gpin'); if (!pin) return;
      hashPin(pin, rec.s).then(function (h) {
        if (h.h === rec.h) { openSession(); d.remove(); next(); return; }
        tries++; inp.value = '';
        if (tries >= MAXTRY) return full('Too many wrong PINs. Please sign in again.');
        e.textContent = 'Wrong PIN. ' + (MAXTRY - tries) + ' tries left.';
      });
    };
    d.querySelector('#kgok').onclick = go; d.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') go(); });
  }

  /* ---- 18+ confirmation and welcome (unchanged) ---- */
  function welcome() {
    if (get('ka_welcomed')) return unhide();
    var d = box('<h2>Welcome 🔥</h2><p>Who is playing? Games will use your names. Everything stays on this device.</p><input id="kg1" maxlength="20" placeholder="Your name"><input id="kg2" maxlength="20" placeholder="Partner\'s name"><button class="kg-b" id="kgok">Let\'s go</button><button class="kg-b g" id="kgsk">Skip for now</button>');
    var done = function (save) {
      if (save) { var a = d.querySelector('#kg1').value.trim(), b = d.querySelector('#kg2').value.trim(); if (a || b) set('ka_couple', { p1: a || 'Partner 1', p2: b || 'Partner 2' }); }
      set('ka_welcomed', 1); d.remove();
    };
    d.querySelector('#kgok').onclick = function () { done(true); };
    d.querySelector('#kgsk').onclick = function () { done(false); };
  }
  function age() {
    if (get('ka_adult')) return welcome();
    var d = box('<h2>Adults only · 18+</h2><p>KamaAgni contains explicit content for consenting adult couples. By entering you confirm you are 18 or older (or the legal age where you live) and want to see it. Consent is always required — pass or stop any time.</p><button class="kg-b" id="kgy">I am 18+ — enter</button><button class="kg-b g" id="kgn">Leave</button>');
    d.querySelector('#kgy').onclick = function () { set('ka_adult', 1); d.remove(); welcome(); };
    d.querySelector('#kgn').onclick = function () { location.href = 'https://www.google.com'; };
  }
  function next() { var o = document.querySelector('.kg'); if (o) o.remove(); age(); }

  /* ---- decide ---- */
  function decide() {
    var ok = false; try { ok = sessionStorage.getItem('ka_ok') === '1'; } catch (e) {}
    var last = +localStorage.getItem('ka_last') || 0, fresh = Date.now() - last < HOUR;
    if (ok && fresh) { touch(); window.KA_GATE = {}; return next(); }
    var u = window.KA_CLOUD && KA_CLOUD.state().user, rec = get('ka_gpin');
    if (u && fresh && rec && rec.u === u.id && subtle) return pinScreen();
    closeSession();
    if (u) return KA_CLOUD.signOut().catch(function () {}).then(function () { loginScreen(last ? 'It has been over an hour. Please sign in again.' : ''); });
    loginScreen(last ? 'It has been over an hour. Please sign in again.' : '');
  }
  function lockNow(why) { closeSession(); var u = window.KA_CLOUD && KA_CLOUD.state().user; (u ? KA_CLOUD.signOut().catch(function () {}) : Promise.resolve()).then(function () { loginScreen(why || 'Signed out.'); }); }
  function start() {
    window.KA_GATE = {
      lock: function () { lockNow('Locked.'); },
      hasPin: function () { var r = get('ka_gpin'), u = window.KA_CLOUD && KA_CLOUD.state().user; return !!(subtle && r && u && r.u === u.id); },
      seal: function () { try { sessionStorage.removeItem('ka_ok'); } catch (e) {} },   /* hide screen: a reload now asks for the PIN */
      askPin: askPin,
      changePin: function () { pinSetup(function () { var o = document.querySelector('.kg'); if (o) o.remove(); }, true); }
    };
    if (!gateOn) { unhide(); return next(); }
    var run = function () { decide(); };
    var C = window.KA_CLOUD;
    if (C && C.state().ready) return run();
    var done = false, fin = function () { if (done) return; done = true; window.removeEventListener('ka:cloud', onc); run(); };
    var onc = function () { if (window.KA_CLOUD && KA_CLOUD.state().ready) fin(); };
    window.addEventListener('ka:cloud', onc); setTimeout(fin, 5000);
    /* ka-cloud.js loads after this file on most pages: poll briefly in case the event fired already */
    var n = 0, t = setInterval(function () { if (window.KA_CLOUD && KA_CLOUD.state().ready) { clearInterval(t); fin(); } else if (++n > 50) clearInterval(t); }, 100);
  }
  /* idle for an hour with the page open, or signed out elsewhere: lock */
  setInterval(function () {
    if (!gateOn || !window.KA_GATE || document.querySelector('.kg')) return;
    var ok; try { ok = sessionStorage.getItem('ka_ok') === '1'; } catch (e) {}
    if (ok && Date.now() - (+localStorage.getItem('ka_last') || 0) >= HOUR) lockNow('It has been over an hour. Please sign in again.');
  }, 30000);
  window.addEventListener('ka:cloud', function (e) { var s = e.detail; if (gateOn && window.KA_GATE && s && s.ready && !s.user && !s.err && !document.querySelector('.kg')) { var ok; try { ok = sessionStorage.getItem('ka_ok') === '1'; } catch (x) {} if (ok) { closeSession(); loginScreen('You have been signed out.'); } } });
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
