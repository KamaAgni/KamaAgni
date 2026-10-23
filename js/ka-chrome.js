/* KamaAgni shared header + footer + account menu. One look on every page. */
(function () {
  'use strict';
  if (window.__kaChrome) return; window.__kaChrome = 1;
  var doc = document, root = doc.documentElement;
  var BASE = (doc.currentScript && doc.currentScript.src || '').replace(/js\/ka-chrome\.js.*$/, '') || './';
  var file = location.pathname.split('/').pop() || 'index.html';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var G = 'games/';
  var MENU = [
    ['Tonight', [['🕯️', 'Guided Session', G + 'kamaagni-session.html'], ['🎓', 'Intimacy Experts', G + 'kamaagni-experts.html'], ['💞', 'Together (partner)', G + 'kamaagni-together.html'], ['🎉', 'Free-time Fun', G + 'kamaagni-fun.html'], ['💌', 'Secret Envelope', G + 'kamaagni-secret.html'], ['🗓️', 'Plan Tonight', G + 'kamaagni-tonight.html']]],
    ['Play', [['🎲', 'Intimacy Dice', G + 'intimacy_dice_game_single_page.html'], ['🃏', 'Intimacy Cards', G + 'intimacy_cards_game_single_page.html'], ['🏁', 'Intimacy Ludo', G + 'intimacy_ludo_dice_game_single_page.html'], ['💘', 'Desire Match', G + 'kamaagni-desire-match.html'], ['⚖️', 'Would You Prefer', G + 'kamaagni-would-you-prefer.html'], ['🎭', 'Truth or Dare', G + 'kamaagni-truth-or-dare.html'], ['🎩', 'Hornopoly', G + 'kamaagni-hornopoly.html'], ['🎲', 'Dice Sets', G + 'kamaagni-kinky-dice.html'], ['♠️', 'Quick Poker', G + 'kamaagni-poker-quick.html'], ['🌹', 'Connect & Foreplay', G + 'kamaagni-connect-foreplay.html']]],
    ['Explore', [['🃏', 'Task Deck', G + 'kamaagni-task-deck.html'], ['⛓️', 'BDSM Journey', G + 'kamaagni-journey.html'], ['🏆', 'Challenges', G + 'kamaagni-challenges.html'], ['🎭', 'Roleplay Studio', G + 'kamaagni-roleplay.html'], ['🧭', 'Kink Explorer', G + 'kamaagni-kink-explorer.html'], ['🧘', 'Position Selector', G + 'intimacy_Position_Selector_page.html'], ['👄', 'Oral Selector', G + 'intimacy_Oral_Position_Selector_page.html']]],
    ['Keep & reflect', [['📓', 'Our Journal', G + 'kamaagni-journal.html'], ['🕘', 'History', G + 'kamaagni-history.html'], ['📈', 'Progress & Badges', G + 'kamaagni-progress.html'], ['🪣', 'Bucket List', G + 'kamaagni-bucket-list.html'], ['📅', 'Mission Week', G + 'kamaagni-mission-week.html'], ['🎟️', 'Love Coupons', G + 'kamaagni-love-coupons.html'], ['✍️', 'Reflection Prompts', G + 'kamaagni-prompts.html']]],
    ['Learn', [['🛡️', 'Learn: consent & aftercare', G + 'kamaagni-learn.html'], ['📚', 'Printable Library', G + 'kamaagni-library.html'], ['⚙️', 'Settings (hide topics)', G + 'kamaagni-settings.html'], ['ℹ️', 'About & Privacy', 'about.html']]]
  ];
  var NAV = [['🕯️', 'Session', G + 'kamaagni-session.html'], ['🎉', 'Fun', G + 'kamaagni-fun.html'], ['💞', 'Together', G + 'kamaagni-together.html'], ['🎓', 'Experts', G + 'kamaagni-experts.html']];
  var u = function (p) { return BASE + p; };
  var hideLib = window.KA_CONFIG && window.KA_CONFIG.LIBRARY === false;

  var css = doc.createElement('style');
  css.textContent = [
    'html.ka-chrome body{padding-top:60px}',
    '#ka-hdr{position:fixed;top:0;left:0;right:0;z-index:9000;height:56px;display:flex;align-items:center;gap:8px;padding:0 max(12px,env(safe-area-inset-right)) 0 max(12px,env(safe-area-inset-left));background:rgba(8,10,22,.88);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,.09);font-family:"DM Sans",system-ui,sans-serif}',
    '#ka-hdr a,#ka-hdr button{font:inherit;color:#dce9ff;text-decoration:none}',
    '.kh-b{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:42px;height:42px;padding:0 12px;border-radius:999px;border:1px solid transparent;background:transparent;cursor:pointer;font-size:13px;font-weight:700;color:#a8bcd8!important;position:relative}',
    '.kh-b:hover,.kh-b.on{background:rgba(232,99,122,.14);color:#fff!important;border-color:rgba(232,99,122,.35)}',
    '.kh-logo{font-family:Cinzel,serif;font-weight:900;letter-spacing:.08em;font-size:16px;background:linear-gradient(135deg,#ffb27a,#ff6b35 50%,#e8637a);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent!important;padding:0 6px;white-space:nowrap}',
    '.kh-sp{flex:1}',
    '.kh-nav{display:none;gap:2px}@media(min-width:820px){.kh-nav{display:flex}}',
    '.kh-dot{position:absolute;top:6px;right:6px;width:9px;height:9px;border-radius:50%;background:#6c7a95;border:2px solid #0a0c1a}.kh-dot.ok{background:#4ade80}.kh-dot.warn{background:#f5c842}',
    '#ka-menu,#ka-acct{position:fixed;inset:0;z-index:2147482000;background:rgba(5,6,15,.94);overflow:auto;padding:70px 14px 40px;font-family:"DM Sans",system-ui,sans-serif;color:#dce9ff;display:none}',
    '#ka-menu.show,#ka-acct.show{display:block}',
    '.km-in{max-width:880px;margin:0 auto}.km-g{margin-bottom:22px}.km-g h3{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8a99b8;margin:0 0 10px}',
    '.km-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px}',
    '.km-grid a{display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:14px;border:1px solid rgba(255,255,255,.1);background:#0c0e1c;color:#dce9ff;text-decoration:none;font-size:14px;font-weight:600}.km-grid a:hover,.km-grid a.cur{border-color:rgba(232,99,122,.6);background:rgba(232,99,122,.1)}',
    '.km-x{position:fixed;top:12px;right:14px;z-index:2147482100;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:#12152a;color:#fff;font-size:20px;cursor:pointer}',
    '.ka-card{max-width:440px;margin:0 auto;background:#0c0e1c;border:1px solid rgba(255,255,255,.15);border-radius:22px;padding:24px 22px}',
    '.ka-card h2{font-family:Cinzel,serif;font-size:22px;color:#f4a0ae;margin:0 0 6px}.ka-card p{font-size:13.5px;line-height:1.6;color:#a8bcd8;margin:0 0 12px}',
    '.ka-in{width:100%;background:#12152a;border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:12px 14px;color:#dce9ff;font:inherit;font-size:15px;margin-bottom:10px;outline:none}.ka-in:focus{border-color:rgba(232,99,122,.6)}',
    '.ka-bt{display:block;width:100%;padding:13px;border-radius:999px;border:0;background:linear-gradient(135deg,#e8637a,#f07090);color:#fff;font:700 14px "DM Sans",system-ui,sans-serif;cursor:pointer;margin-top:4px;min-height:46px}.ka-bt.g{background:transparent;border:1px solid rgba(255,255,255,.18);color:#a8bcd8}.ka-bt.d{background:transparent;border:1px solid rgba(255,107,53,.5);color:#ffb089}',
    '.ka-tabs{display:flex;gap:6px;margin-bottom:14px}.ka-tabs button{flex:1;padding:10px;border-radius:12px;border:1px solid rgba(255,255,255,.15);background:transparent;color:#a8bcd8;font:700 13px "DM Sans",sans-serif;cursor:pointer}.ka-tabs button.on{background:rgba(232,99,122,.16);border-color:#e8637a;color:#fff}',
    '.ka-msg{font-size:13px;margin:4px 0 10px;min-height:18px;color:#ffb089}.ka-msg.ok{color:#86efac}',
    '.ka-row{display:flex;justify-content:space-between;gap:10px;font-size:13px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.07);color:#a8bcd8}.ka-row b{color:#dce9ff}',
    '#ka-ftr{box-sizing:border-box;width:100%;max-width:100vw;overflow:hidden;margin:40px auto 0;padding:26px 16px 120px;max-width:880px;border-top:1px solid rgba(255,255,255,.08);text-align:center;font-family:"DM Sans",system-ui,sans-serif;color:#8a99b8;font-size:12.5px;line-height:1.8;position:relative;z-index:1}',
    '#ka-ftr a{color:#a8bcd8;text-decoration:none;margin:0 8px;white-space:nowrap;font-weight:600}#ka-ftr a:hover{color:#f4a0ae}',
    '#ka-ftr .fs{display:inline-block;margin-top:6px;padding:4px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.12);font-size:11.5px}',
    '.kx-top{display:none!important}',
    '@media(max-width:480px){.kh-logo{font-size:14px}}'
  ].join('\n');
  doc.head.appendChild(css);
  root.classList.add('ka-chrome');

  /* ---- header ---- */
  var hdr = doc.createElement('header'); hdr.id = 'ka-hdr'; hdr.setAttribute('role', 'banner');
  hdr.innerHTML = '<button class="kh-b" id="kh-menu" type="button" aria-label="Open menu">☰</button>' +
    '<a class="kh-logo" href="' + u('index.html') + '">🔥 KAMAAGNI</a><span class="kh-sp"></span>' +
    '<nav class="kh-nav" aria-label="Main">' + NAV.map(function (n) { return '<a class="kh-b' + (file === n[2].split('/').pop() ? ' on' : '') + '" href="' + u(n[2]) + '">' + n[0] + ' ' + n[1] + '</a>'; }).join('') + '</nav>' +
    '<a class="kh-b" id="kh-pt" href="' + u(G + 'kamaagni-together.html') + '" aria-label="Partner" style="display:none">💞<span class="kh-dot" id="kh-pd"></span></a>' +
    '<button class="kh-b" id="kh-acct" type="button" aria-label="Account"><span id="kh-ai">👤</span><span class="kh-dot" id="kh-ad"></span></button>';
  doc.body.insertBefore(hdr, doc.body.firstChild);

  /* ---- menu ---- */
  var menu = doc.createElement('div'); menu.id = 'ka-menu'; menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-label', 'Site menu');
  menu.innerHTML = '<button class="km-x" type="button" aria-label="Close">✕</button><div class="km-in"><div class="km-g"><div class="km-grid"><a href="' + u('index.html') + '" class="' + (file === 'index.html' ? 'cur' : '') + '"><span>🏠</span>Home</a></div></div>' +
    MENU.map(function (g) { return '<div class="km-g"><h3>' + g[0] + '</h3><div class="km-grid">' + g[1].filter(function (i) { return !(hideLib && /library/.test(i[2])) && !(window.KA_FILTER && KA_FILTER.pageHidden(i[2])); }).map(function (i) { return '<a href="' + u(i[2]) + '" class="' + (file === i[2].split('/').pop() ? 'cur' : '') + '"><span>' + i[0] + '</span>' + i[1] + '</a>'; }).join('') + '</div></div>'; }).join('') + '</div>';
  doc.body.appendChild(menu);
  var toggleMenu = function (v) { menu.classList.toggle('show', v); doc.body.style.overflow = v ? 'hidden' : ''; };
  hdr.querySelector('#kh-menu').onclick = function () { toggleMenu(true); };
  menu.querySelector('.km-x').onclick = function () { toggleMenu(false); };
  menu.addEventListener('click', function (e) { if (e.target === menu) toggleMenu(false); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') { toggleMenu(false); closeAcct(); } });

  /* ---- account modal ---- */
  var acct = doc.createElement('div'); acct.id = 'ka-acct'; acct.setAttribute('role', 'dialog'); acct.setAttribute('aria-label', 'Account');
  doc.body.appendChild(acct);
  var tab = 'in';
  function closeAcct() { acct.classList.remove('show'); doc.body.style.overflow = ''; }
  function openAcct() { renderAcct(); acct.classList.add('show'); doc.body.style.overflow = 'hidden'; }
  hdr.querySelector('#kh-acct').onclick = openAcct;
  function ago(t) { if (!t) return 'never'; var s = Math.round((Date.now() - t) / 1000); return s < 60 ? 'just now' : s < 3600 ? Math.round(s / 60) + ' min ago' : s < 86400 ? Math.round(s / 3600) + ' h ago' : Math.round(s / 86400) + ' d ago'; }
  function renderAcct() {
    var C = window.KA_CLOUD, s = C ? C.state() : { enabled: false };
    var h = '<button class="km-x" type="button" aria-label="Close" id="ka-ax">✕</button><div class="ka-card">';
    if (!s.enabled) {
      h += '<h2>Saved on this device</h2><p>Your data is stored privately in this browser. To use the same account on your phone, laptop and with your partner, the site owner needs to switch on cloud sync (free, see SETUP-CLOUD.md).</p><button class="ka-bt g" id="ka-bk">⚙️ Backup / restore</button>';
    } else if (!s.ready) {
      h += '<h2>Connecting…</h2><p>One moment.</p>';
    } else if (!s.user) {
      h += '<h2>Your KamaAgni account</h2><p>Sign in to keep your data on every device and link with your partner. Everything personal is encrypted on your device before it is uploaded.</p>' +
        '<div class="ka-tabs"><button data-t="in" class="' + (tab === 'in' ? 'on' : '') + '">Sign in</button><button data-t="up" class="' + (tab === 'up' ? 'on' : '') + '">Create account</button></div>' +
        '<input class="ka-in" id="ka-em" type="email" autocomplete="email" placeholder="Email"><input class="ka-in" id="ka-pw" type="password" autocomplete="' + (tab === 'in' ? 'current-password' : 'new-password') + '" placeholder="Password (8+ characters)">' +
        '<div class="ka-msg" id="ka-m"></div><button class="ka-bt" id="ka-go">' + (tab === 'in' ? 'Sign in' : 'Create account') + '</button>' + (tab === 'in' ? '<button class="ka-bt g" id="ka-fp" style="margin-top:8px">Forgot password</button>' : '');
    } else if (s.vault === 'new') {
      h += '<h2>Create your vault passphrase</h2><p>This passphrase encrypts your data before it leaves your device. <b style="color:#ffb089">We cannot reset it.</b> If you forget it, your cloud data cannot be recovered. Write it down somewhere safe.</p><input class="ka-in" id="ka-p1" type="password" autocomplete="new-password" placeholder="Passphrase (8+ characters)"><input class="ka-in" id="ka-p2" type="password" autocomplete="new-password" placeholder="Repeat passphrase"><div class="ka-msg" id="ka-m"></div><button class="ka-bt" id="ka-vk">Create vault</button><button class="ka-bt g" id="ka-so" style="margin-top:8px">Sign out</button>';
    } else if (s.vault === 'locked') {
      h += '<h2>Unlock your vault</h2><p>Enter your vault passphrase to load your data on this device.</p><input class="ka-in" id="ka-p1" type="password" autocomplete="current-password" placeholder="Vault passphrase"><div class="ka-msg" id="ka-m"></div><button class="ka-bt" id="ka-vk">Unlock</button><button class="ka-bt g" id="ka-so" style="margin-top:8px">Sign out</button>';
    } else {
      h += '<h2>Account</h2><div class="ka-row"><span>Signed in</span><b>' + esc(s.user.email) + '</b></div><div class="ka-row"><span>Cloud sync</span><b>' + (s.syncing ? 'syncing…' : ago(s.last)) + '</b></div><div class="ka-row"><span>Partner</span><b>' + (s.couple ? (s.couple.partnerJoined ? 'linked 💞' : 'invite waiting') : 'not linked') + '</b></div>' +
        (s.err ? '<div class="ka-msg">' + esc(s.err) + '</div>' : '<div class="ka-msg" id="ka-m"></div>') +
        '<button class="ka-bt" id="ka-sy">Sync now</button><a class="ka-bt g" style="text-align:center;text-decoration:none;margin-top:8px;display:block;line-height:20px" href="' + u(G + 'kamaagni-together.html') + '">💞 Partner &amp; Together</a><a class="ka-bt g" style="text-align:center;text-decoration:none;margin-top:8px;display:block;line-height:20px" href="' + u(G + 'kamaagni-history.html') + '">🕘 My history &amp; delete data</a><button class="ka-bt g" id="ka-so" style="margin-top:8px">Sign out</button>';
    }
    h += '</div>';
    acct.innerHTML = h;
    var g = function (i) { return acct.querySelector('#' + i); }, msg = function (t, ok) { var m = g('ka-m'); if (m) { m.textContent = t; m.className = 'ka-msg' + (ok ? ' ok' : ''); } };
    g('ka-ax').onclick = closeAcct;
    acct.onclick = function (e) { if (e.target === acct) closeAcct(); };
    acct.querySelectorAll('[data-t]').forEach(function (b) { b.onclick = function () { tab = b.dataset.t; renderAcct(); }; });
    var busy = function (btn, p, okText) { var o = btn.textContent; btn.disabled = true; btn.textContent = 'Please wait…'; return p.then(function (r) { btn.disabled = false; btn.textContent = o; return r; }, function (e) { btn.disabled = false; btn.textContent = o; msg(e.message || String(e)); throw e; }); };
    if (g('ka-go')) g('ka-go').onclick = function () {
      var em = g('ka-em').value.trim(), pw = g('ka-pw').value;
      if (!/^\S+@\S+\.\S+$/.test(em)) return msg('Enter a valid email.'); if (pw.length < 8) return msg('Password needs 8+ characters.');
      busy(this, tab === 'in' ? C.signIn(em, pw) : C.signUp(em, pw)).then(function (r) { if (r && r.needsConfirm) { msg('Check your email to confirm, then sign in.', true); tab = 'in'; } else renderAcct(); }, function () {});
    };
    if (g('ka-fp')) g('ka-fp').onclick = function () { var em = g('ka-em').value.trim(); if (!em) return msg('Enter your email first.'); C.resetPassword(em).then(function () { msg('Reset email sent (if the account exists).', true); }, function (e) { msg(e.message); }); };
    if (g('ka-vk')) g('ka-vk').onclick = function () {
      var p1 = g('ka-p1').value, p2 = g('ka-p2'); if (p1.length < 8) return msg('Passphrase needs 8+ characters.'); if (p2 && p2.value !== p1) return msg('Passphrases do not match.');
      busy(this, C.unlock(p1)).then(function () { renderAcct(); }, function () {});
    };
    if (g('ka-sy')) g('ka-sy').onclick = function () { busy(this, C.syncNow()).then(function (r) { msg(r ? 'Synced.' : 'Could not sync.', !!r); renderAcct(); }, function () {}); };
    if (g('ka-so')) g('ka-so').onclick = function () { C.signOut().then(renderAcct); };
    if (g('ka-bk')) g('ka-bk').onclick = function () { closeAcct(); var b = doc.querySelector('[aria-label*="ettings"],#ka-gear,.ka-gear'); if (b) b.click(); else if (window.KA && KA.openFavHub) KA.openFavHub(); };
  }

  /* ---- footer ---- */
  var ftr = doc.createElement('footer'); ftr.id = 'ka-ftr'; ftr.setAttribute('role', 'contentinfo');
  ftr.innerHTML = '<div><a href="' + u('index.html') + '">Home</a><a href="' + u(G + 'kamaagni-experts.html') + '">Experts</a><a href="' + u(G + 'kamaagni-together.html') + '">Together</a><a href="' + u(G + 'kamaagni-history.html') + '">History</a><a href="' + u(G + 'kamaagni-settings.html') + '">Settings</a><a href="' + u('about.html') + '">About &amp; Privacy</a></div><div>Made with ♡ for couples · 18+ · Consent first, always · <span id="kf-v" title="App version">v11</span></div><div><span class="fs" id="kf-s">💾 Saved on this device</span></div>';
  doc.body.appendChild(ftr);

  /* ---- live status ---- */
  function paint() {
    var C = window.KA_CLOUD, s = C ? C.state() : null, dot = doc.getElementById('kh-ad'), ic = doc.getElementById('kh-ai'), fs = doc.getElementById('kf-s'), pt = doc.getElementById('kh-pt'), pd = doc.getElementById('kh-pd');
    if (!s || !s.enabled) { dot.style.display = 'none'; fs.textContent = '💾 Saved on this device'; return; }
    dot.style.display = '';
    if (s.user) { ic.textContent = (s.user.email || '?').charAt(0).toUpperCase(); dot.className = 'kh-dot ' + (s.vault === 'ready' && !s.err ? 'ok' : 'warn'); fs.textContent = s.vault === 'ready' ? (s.syncing ? '☁️ Syncing…' : '☁️ Encrypted & synced ' + ago(s.last)) : '🔒 Vault locked: open account menu'; }
    else { ic.textContent = '👤'; dot.className = 'kh-dot'; fs.textContent = '💾 Saved on this device · sign in to sync'; }
    pt.style.display = s.couple ? '' : 'none'; pd.className = 'kh-dot ' + (s.couple && s.couple.partnerJoined ? 'ok' : 'warn') + (typeof unseen !== 'undefined' && unseen ? ' n' : '');
    if (acct.classList.contains('show') && !acct.querySelector('input:focus')) renderAcct();
  }
  window.addEventListener('ka:cloud', paint);
  /* load the cloud layer (skips itself when no backend is configured) */
  var sc = doc.createElement('script'); sc.src = BASE + 'js/ka-cloud.js'; sc.onload = paint; doc.body.appendChild(sc);
  paint();

  /* ---- calm settings ---- */
  function calm() { try { var c = JSON.parse(localStorage.getItem('ka_calm')) || {}; return { guard: c.guard !== false, limit: c.limit || 60, nudges: c.nudges !== false, sound: c.sound !== false }; } catch (e) { return { guard: true, limit: 60, nudges: true, sound: true }; } }
  /* ---- animated partner notifications ---- */
  var ncss = doc.createElement('style');
  ncss.textContent = '@keyframes kn-in{0%{transform:translate(-50%,-140%) scale(.9);opacity:0}60%{transform:translate(-50%,6px) scale(1.03);opacity:1}100%{transform:translate(-50%,0) scale(1)}}@keyframes kn-glow{0%,100%{box-shadow:0 8px 30px rgba(0,0,0,.5),0 0 0 0 rgba(232,99,122,.55)}50%{box-shadow:0 8px 30px rgba(0,0,0,.5),0 0 0 12px rgba(232,99,122,0)}}@keyframes kn-ico{0%,100%{transform:rotate(0) scale(1)}20%{transform:rotate(-14deg) scale(1.25)}40%{transform:rotate(12deg) scale(1.25)}60%{transform:rotate(-8deg)}80%{transform:rotate(6deg)}}@keyframes kn-float{0%{transform:translateY(0) scale(.6);opacity:0}15%{opacity:1}100%{transform:translateY(-130px) scale(1.2);opacity:0}}@keyframes kn-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-4px) rotate(-8deg)}40%{transform:translateX(4px) rotate(8deg)}60%{transform:translateX(-3px) rotate(-5deg)}80%{transform:translateX(3px) rotate(5deg)}}@keyframes kn-stop{0%,100%{background:#2a0d12}50%{background:#7f1d1d}}' +
    '.kn{position:fixed;top:66px;left:50%;transform:translateX(-50%);z-index:2147483200;width:min(92vw,380px);display:flex;gap:12px;align-items:center;padding:12px 14px;border-radius:18px;background:#12152a;border:1px solid rgba(232,99,122,.65);color:#fff;font:600 14px "DM Sans",system-ui,sans-serif;animation:kn-in .55s cubic-bezier(.2,.9,.3,1.2) both,kn-glow 1.6s ease-out 2;cursor:pointer;box-sizing:border-box}.kn.stop{border-color:#ef4444;animation:kn-in .55s both,kn-stop .7s 4}' +
    '.kn .i{font-size:30px;line-height:1;animation:kn-ico 1s ease .3s 2;flex:none}.kn .t{min-width:0}.kn .t b{display:block;font-size:12px;color:#f4a0ae;letter-spacing:.04em;margin-bottom:2px;font-weight:700}.kn .t span{display:block;color:#dce9ff;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.kn .f{position:absolute;bottom:60%;font-size:18px;pointer-events:none;animation:kn-float 1.8s ease-out forwards}' +
    '#kh-pt.ring{animation:kn-shake .6s ease 3}';
  doc.head.appendChild(ncss);
  var actx = null;
  function chime(kind) { if (!calm().sound) return; try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime, f = kind === 'stop' ? [440, 330] : [660, 880]; o.type = 'sine'; o.frequency.setValueAtTime(f[0], t); o.frequency.setValueAtTime(f[1], t + .12); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.12, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .45); o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + .5); } catch (e) {} }
  function notify(o) {
    var old = doc.querySelectorAll('.kn'); old.forEach(function (n) { n.remove(); });
    var d = doc.createElement('div'); d.className = 'kn' + (o.kind === 'stop' ? ' stop' : ''); d.setAttribute('role', 'status'); d.setAttribute('aria-live', 'polite');
    d.innerHTML = '<span class="i">' + esc(o.icon || '💌') + '</span><div class="t"><b>' + esc(o.title || 'Your partner') + '</b><span>' + esc(o.text || '') + '</span></div>';
    if (o.kind === 'nudge' || o.kind === 'chk') { for (var k = 0; k < 7; k++) { var h = doc.createElement('i'); h.className = 'f'; h.textContent = ['💗', '💖', '✨', '💞'][k % 4]; h.style.left = (12 + k * 12) + '%'; h.style.animationDelay = (k * .12) + 's'; d.appendChild(h); } }
    d.onclick = function () { if (o.href) location.href = u(o.href); else d.remove(); };
    doc.body.appendChild(d);
    var pt = doc.getElementById('kh-pt'); if (pt) { pt.classList.remove('ring'); void pt.offsetWidth; pt.classList.add('ring'); }
    chime(o.kind); try { if (navigator.vibrate) navigator.vibrate(o.kind === 'stop' ? [200, 80, 200, 80, 200] : [60, 40, 90]); } catch (e) {}
    setTimeout(function () { if (d.parentNode) { d.style.transition = 'opacity .4s,transform .4s'; d.style.opacity = '0'; d.style.transform = 'translate(-50%,-30px)'; setTimeout(function () { d.remove(); }, 450); } }, o.kind === 'stop' ? 9000 : 5500);
  }
  var TOG = 'games/kamaagni-together.html';
  function describe(e) {
    var b = e.body || {}, n = b.n || 'Your partner';
    switch (e.kind) {
      case 'nudge': return { icon: b.e || '💌', title: n, text: b.t || 'Thinking of you', kind: 'nudge', href: TOG };
      case 'msg': return { icon: '💬', title: n + ' wrote', text: b.t, href: TOG };
      case 'draw': return { icon: '🔥', title: n + ' drew a card', text: 'Join in. Open Together → Play', href: TOG };
      case 'chk': return { icon: '💗', title: n + ' checked in', text: 'See how you both feel this week', kind: 'chk', href: TOG };
      case 'sig': return b.s === 'r' ? { icon: '🛑', title: n + ' pressed STOP', text: 'Pause and check in', kind: 'stop', href: TOG } : (b.s === 'y' ? { icon: '🟡', title: n, text: 'Slow down a little', href: TOG } : null);
      case 'fun': return b.say ? { icon: b.ic || '🎉', title: n, text: b.say, href: 'games/kamaagni-fun.html' } : null;
      default: return null;
    }
  }
  var unseen = 0;
  function checkNudges() {
    var C = window.KA_CLOUD, s = C && C.state(); if (!s || !s.couple || !s.couple.partnerJoined || s.vault !== 'ready' || doc.hidden) return;
    C.couple.list(0).then(function (evs) {
      var seen = +localStorage.getItem('ka_cloud_nudge') || 0, tomb = {}, mx = 0, fresh = [];
      evs.forEach(function (e) { mx = Math.max(mx, e.id); if (e.kind === 'tomb' && e.body) tomb[e.body.x] = 1; });
      evs.forEach(function (e) { if (!e.mine && e.body && !tomb[e.id] && e.id > seen && describe(e)) fresh.push(e); });
      if (onTogether) { localStorage.setItem('ka_cloud_nudge', String(mx)); fresh = []; }
      var first = localStorage.getItem('ka_cloud_nudge') === null; if (first) fresh = fresh.slice(-5);
      var prev = unseen; unseen = calm().nudges ? fresh.length : 0;
      var pd = doc.getElementById('kh-pd'); if (pd) { pd.textContent = unseen ? (unseen > 9 ? '9+' : unseen) : ''; pd.classList.toggle('n', !!unseen); }
      if (unseen > prev && calm().nudges) { var last = fresh[fresh.length - 1], dsc = describe(last); notify(dsc); }
    }, function () {});
  }
  var onTogether = /kamaagni-together|kamaagni-fun/.test(location.pathname);
  var st2 = doc.createElement('style'); st2.textContent = '.kh-dot.n{width:auto;min-width:16px;height:16px;border-radius:9px;background:#e8637a;color:#fff;font:700 10px "DM Sans",sans-serif;line-height:12px;text-align:center;padding:0 3px;top:2px;right:2px}'; doc.head.appendChild(st2);
  setInterval(checkNudges, 9000); setTimeout(checkNudges, 3500); window.addEventListener('ka:cloud', function () { setTimeout(checkNudges, 800); });

  /* ---- balance guard: one gentle, skippable pause per day ---- */
  (function () {
    var tick = setInterval(function () {
      if (doc.hidden) return; var c = calm(); if (!c.guard) return;
      var u; try { u = JSON.parse(localStorage.getItem('ka_cloud_use')) || {}; } catch (e) { u = {}; }
      var day = new Date().toDateString(); if (u.d !== day) u = { d: day, s: 0, shown: 0 };
      u.s += 10; localStorage.setItem('ka_cloud_use', JSON.stringify(u));
      if (u.s >= c.limit * 60 && u.shown < 1) { u.shown = 1; localStorage.setItem('ka_cloud_use', JSON.stringify(u)); showPause(c.limit); }
    }, 10000);
    function showPause(min) {
      if (doc.getElementById('ka-pause')) return;
      var d = doc.createElement('div'); d.id = 'ka-pause'; d.setAttribute('role', 'dialog'); d.style.cssText = 'position:fixed;inset:0;z-index:2147483400;background:rgba(5,6,15,.92);display:flex;align-items:center;justify-content:center;padding:22px;font-family:"DM Sans",system-ui,sans-serif;color:#dce9ff;text-align:center';
      d.innerHTML = '<div class="ka-card" style="max-width:400px"><div style="font-size:44px">🕯️</div><h2>Time to be together</h2><p>You have spent about ' + min + ' minutes here today. The best part happens off the screen: put the phone down and enjoy each other.</p><button class="ka-bt" id="kp-ok">Good idea</button><button class="ka-bt g" id="kp-more" style="margin-top:8px">Keep going</button><p style="font-size:12px;margin-top:12px">You can change this reminder in Settings → Healthy use.</p></div>';
      doc.body.appendChild(d);
      d.querySelector('#kp-ok').onclick = function () { location.href = u('index.html'); d.remove(); };
      d.querySelector('#kp-more').onclick = function () { d.remove(); };
    }
  })();

  window.KA_CHROME = { openAccount: openAcct, MENU: MENU, notify: notify, describe: describe };
})();
