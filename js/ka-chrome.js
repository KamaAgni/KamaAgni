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
    ['Tonight', [['🕯️', 'Guided Session', G + 'kamaagni-session.html'], ['🎓', 'Intimacy Experts', G + 'kamaagni-experts.html'], ['💞', 'Together (partner)', G + 'kamaagni-together.html'], ['💌', 'Invites & Wishes', G + 'kamaagni-invite.html'], ['🌍', 'Long-distance', G + 'kamaagni-apart.html'], ['🎉', 'Free-time Fun', G + 'kamaagni-fun.html'], ['💌', 'Secret Envelope', G + 'kamaagni-secret.html'], ['🗓️', 'Plan Tonight', G + 'kamaagni-tonight.html']]],
    ['Play', [['🎮', 'All Games (pick for me)', 'play.html'], ['🎲', 'Intimacy Dice', G + 'intimacy_dice_game_single_page.html'], ['🃏', 'Connection Cards', G + 'intimacy_cards_game_single_page.html'], ['🏁', 'Intimacy Ludo', G + 'intimacy_ludo_dice_game_single_page.html'], ['💘', 'Desire Match', G + 'kamaagni-desire-match.html'], ['⚖️', 'Would You Prefer', G + 'kamaagni-would-you-prefer.html'], ['🎭', 'Truth or Dare', G + 'kamaagni-truth-or-dare.html'], ['⚔️', 'Seduction Showdown', G + 'kamaagni-showdown.html'], ['🎩', 'Hornopoly', G + 'kamaagni-hornopoly.html'], ['🎲', 'Dice Sets', G + 'kamaagni-kinky-dice.html'], ['♠️', 'Quick Poker', G + 'kamaagni-poker-quick.html'], ['🌹', 'Connect & Foreplay', G + 'kamaagni-connect-foreplay.html'], ['🙋', 'Never Have I Ever', G + 'kamaagni-never-have-i-ever.html'], ['👉', "Who's Most Likely", G + 'kamaagni-whos-most-likely.html'], ['🔎', 'How Well Do You Know Me', G + 'kamaagni-know-me.html'], ['💬', 'Love Languages', G + 'kamaagni-love-languages.html'], ['🎬', 'Movie Night', G + 'kamaagni-movies.html'], ['🎓', 'Bedroom Skills', G + 'kamaagni-skills.html'], ['📖', 'Position Library', G + 'kamaagni-positions.html'], ['🎲', 'The Play Book', G + 'kamaagni-playbook.html'], ['🌟', 'New for Us', G + 'kamaagni-month.html'], ['📅', 'Date Planner', G + 'kamaagni-planner.html'], ['🗓️', 'Our week', G + 'kamaagni-week.html'], ['📖', 'Memory Book', G + 'kamaagni-memories.html'], ['🎵', 'Playlist', G + 'kamaagni-playlist.html'], ['🩺', 'Health & Wellbeing', G + 'kamaagni-health.html'], ['🌳', 'Life Stages', G + 'kamaagni-life-stages.html'], ['🗺️', 'Roadmap & Review', G + 'kamaagni-roadmap.html'], ['🔎', 'Search', G + 'kamaagni-search.html'], ['⏱️', 'Quick-Fire', G + 'kamaagni-quick-fire.html'], ['🎰', 'Intimate Bingo', G + 'kamaagni-bingo.html'], ['❌', 'Tic-Tac-Tease', G + 'kamaagni-tic-tac-tease.html'], ['🚪', 'Mystery Doors', G + 'kamaagni-mystery-doors.html'], ['🎟️', 'Scratch-Off Book', G + 'kamaagni-scratch-book.html']]],
    ['Rituals & plans', [['🧘', 'Connection Rituals', G + 'kamaagni-rituals.html'], ['🕯️', 'Date Night Kits', G + 'kamaagni-date-kits.html'], ['✍️', 'Our Own Cards', G + 'kamaagni-custom.html'], ['🍽️', 'Bedroom Menu', G + 'kamaagni-bedroom-menu.html'], ['🎁', 'Fantasy Box', G + 'kamaagni-fantasy-box.html'], ['🗺️', 'Body Map', G + 'kamaagni-body-map.html']]],
    ['Explore', [['🃏', 'Task Deck', G + 'kamaagni-task-deck.html'], ['⛓️', 'BDSM Journey', G + 'kamaagni-journey.html'], ['🏆', 'Challenges', G + 'kamaagni-challenges.html'], ['🎭', 'Roleplay Studio', G + 'kamaagni-roleplay.html'], ['🧭', 'Kink Explorer', G + 'kamaagni-kink-explorer.html'], ['🧘', 'Position Selector', G + 'intimacy_Position_Selector_page.html'], ['👄', 'Oral Selector', G + 'intimacy_Oral_Position_Selector_page.html']]],
    ['Keep & reflect', [['📓', 'Our Journal', G + 'kamaagni-journal.html'], ['📈', 'Monthly Check-in', G + 'kamaagni-checkin.html'], ['🗓️', 'Our Dates', G + 'kamaagni-dates.html'], ['🫶', 'Us at a glance', G + 'kamaagni-us.html'], ['🕘', 'History', G + 'kamaagni-history.html'], ['📈', 'Progress & Badges', G + 'kamaagni-progress.html'], ['🪣', 'Bucket List', G + 'kamaagni-bucket-list.html'], ['🌱', '30-Day Spark', G + 'kamaagni-spark-challenge.html'], ['🎟️', 'Love Coupons', G + 'kamaagni-love-coupons.html'], ['✍️', 'Reflection Prompts', G + 'kamaagni-prompts.html']]],
    ['Learn', [['💬', 'Talk Kit', G + 'kamaagni-talk.html'], ['🎛️', 'Brakes & Accelerators', G + 'kamaagni-brakes.html'], ['🛡️', 'Learn: consent & aftercare', G + 'kamaagni-learn.html'], ['📚', 'Printable Library', G + 'kamaagni-library.html'], ['🖨️', 'Print Studio', G + 'kamaagni-print.html'], ['⚙️', 'Settings (hide topics)', G + 'kamaagni-settings.html'], ['ℹ️', 'About & Privacy', 'about.html']]]
  ];
  var NAV = [['🎮', 'Games', 'play.html'], ['🕯️', 'Session', G + 'kamaagni-session.html'], ['🎉', 'Fun', G + 'kamaagni-fun.html'], ['💞', 'Together', G + 'kamaagni-together.html'], ['🎓', 'Experts', G + 'kamaagni-experts.html']];
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
    /* v43 comfort pass: finger-sized targets and readable small text on every page */
    '.kh-logo{display:inline-flex;align-items:center;min-height:44px}.kh-logo img{height:19px;width:auto;display:block;background:none}',
    '#kh-back{font-size:32px!important;font-weight:300;line-height:1;padding:0 10px;min-width:40px;margin-right:-4px}',
    '#ka-ftr a{display:inline-flex;align-items:center;min-height:40px;padding:0 6px}',
    '.kd-more{margin-top:14px;border-top:1px solid rgba(255,255,255,.1);padding-top:6px}.kd-more>summary{list-style:none;cursor:pointer;display:flex;flex-direction:column;gap:2px;min-height:48px;justify-content:center;padding:6px 2px}.kd-more>summary::-webkit-details-marker{display:none}.kd-more>summary b{display:flex;justify-content:space-between;font-size:15px}.kd-more>summary b::after{content:"+";opacity:.7;font-size:20px;line-height:1}.kd-more[open]>summary b::after{content:"\\2212"}.kd-more>summary span{font-size:13px;color:var(--kv-mute,#9aa3bd)}',
    '.kd-start{position:sticky;bottom:84px;z-index:30;padding:22px 0 8px;margin-left:-4px;background:linear-gradient(to bottom,transparent,rgba(10,8,20,.97) 18px,rgba(10,8,20,.97))}',
    '.kd-act{position:sticky;bottom:84px;z-index:40;padding:14px 0 8px;background:linear-gradient(to top,#07060f 65%,transparent)}',
    '.kx-check{position:relative;width:32px;height:32px;min-width:0;min-height:0;align-self:center}.kx-check::after{content:"";position:absolute;inset:-8px}.kx-check::after{content:"";position:absolute;inset:-9px}',
    '.kx-chip,.card-tag,.gc .new,.gc .cont,.hub-chips .lbl,.gc .meta span,.gc .meta,.kx-sec,.kx-heat-lbl,.kd-all button,.kd-grp,.kd-cat em{font-size:12px!important}',
    '.kd-all button,#kd-on,#kd-off,.cf-chip{min-height:36px;padding-left:12px;padding-right:12px}',
    '.kx-note a{display:inline-block;padding:8px 0}',
    'input[type=checkbox]:not(.filter-toggle):not(.folder-toggle),input[type=radio]{min-width:22px;min-height:22px}',
    'label:has(>input[type=checkbox]):not(.toggle-switch),label:has(>input[type=radio]){min-height:40px;display:inline-flex;align-items:center;gap:8px}',
    ':focus-visible{outline:2px solid #ffb27a;outline-offset:2px}',
    '@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}',
    '@media(max-width:480px){.kh-logo img{height:17px}}#ka-hdr .kh-logo{flex:0 1 auto;min-width:0;overflow:hidden}#ka-hdr .kh-logo img{max-width:100%;object-fit:contain;object-position:left center}@media(max-width:420px){#ka-hdr .kh-b{min-width:38px;padding:0 6px}#ka-hdr{gap:2px!important}}@media(max-width:350px){#ka-hdr .kh-b{min-width:34px;padding:0 4px}}'
  ].join('\n');
  doc.head.appendChild(css);
  root.classList.add('ka-chrome');
  /* back button: go back if we came from this site, otherwise to the games hub */
  (function () { var bk = doc.getElementById('kh-back'); if (!bk) return; bk.addEventListener('click', function (e) { try { if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) { e.preventDefault(); history.back(); } } catch (x) {} }); })();
  /* keep the screen awake while playing (phones dim and lock mid-game otherwise) */
  (function () {
    if (!/\/games\//.test(location.pathname) || !navigator.wakeLock) return;
    var lock = null;
    function get() { if (document.visibilityState !== 'visible') return; navigator.wakeLock.request('screen').then(function (l) { lock = l; l.addEventListener('release', function () { lock = null; }); }, function () {}); }
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && !lock) get(); });
    window.addEventListener('pointerdown', function once() { window.removeEventListener('pointerdown', once, true); if (!lock) get(); }, true);
    get();
  })();
  /* tick boxes without a name: make them real checkboxes for screen readers and keep aria-checked in sync */
  (function () {
    function fix(b) {
      if (b.getAttribute('role') !== 'checkbox') b.setAttribute('role', 'checkbox');
      b.setAttribute('aria-checked', b.classList.contains('on') ? 'true' : 'false');
      if (!b.getAttribute('aria-label') || b.getAttribute('aria-label') === 'Toggle' || b.getAttribute('aria-label') === 'Tick') {
        var it = b.parentNode && b.parentNode.querySelector('.kx-it'); var t = it ? it.textContent.trim().slice(0, 80) : '';
        if (t) b.setAttribute('aria-label', t); else if (!b.getAttribute('aria-label')) b.setAttribute('aria-label', 'Mark done');
      }
    }
    var pend = false;
    function scan() { pend = false; var l = doc.querySelectorAll('.kx-check'); for (var i = 0; i < l.length; i++) fix(l[i]); }
    new MutationObserver(function () { if (!pend) { pend = true; setTimeout(scan, 120); } }).observe(doc.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    scan();
  })();
  /* Velvet Night theme + motion kit, loaded last so every page shares one look */
  (function () { if (!doc.getElementById('ka-theme-css')) { var l = doc.createElement('link'); l.id = 'ka-theme-css'; l.rel = 'stylesheet'; l.href = BASE + 'css/ka-theme.css'; doc.head.appendChild(l); }
    var m = doc.createElement('script'); m.src = BASE + 'js/ka-motion.js'; m.defer = true; doc.head.appendChild(m);
    var x = doc.createElement('script'); x.src = BASE + 'js/ka-extras.js'; x.defer = true; doc.head.appendChild(x); })();

  /* ---- header ---- */
  var hdr = doc.createElement('header'); hdr.id = 'ka-hdr'; hdr.setAttribute('role', 'banner');
  hdr.innerHTML = '<button class="kh-b" id="kh-menu" type="button" aria-label="Open menu">☰</button>' +
    (/\/games\//.test(location.pathname) ? '<a class="kh-b" id="kh-back" href="' + u('play.html') + '" aria-label="Back to games" title="Back to games">‹</a>' : '') + '<a class="kh-logo" href="' + u('index.html') + '" aria-label="KamaAgni home"><img src="' + u('assets/logo/kamaagni-logo.svg') + '" alt="KamaAgni" width="120" height="18"></a><span class="kh-sp"></span>' +
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
        ((tab === 'up' && window.KA_CONFIG && KA_CONFIG.REQUIRE_INVITE) ? '<input class="ka-in" id="ka-iv" type="text" autocapitalize="characters" autocomplete="off" placeholder="Your invite code">' : '') + '<div class="ka-msg" id="ka-m"></div><button class="ka-bt" id="ka-go">' + (tab === 'in' ? 'Sign in' : 'Create account') + '</button>' + (tab === 'in' ? '<button class="ka-bt g" id="ka-fp" style="margin-top:8px">Forgot password</button>' : '');
    } else if (s.vault === 'new') {
      h += '<h2>One more step: your vault passphrase</h2><p>Your <b>password</b> signs you in. Your <b>vault passphrase</b> locks your data, so it\'s scrambled before it leaves this phone and nobody else (not even the server) can read it. Use something different from your password, like a short sentence only you know.</p><p style="font-size:13px;opacity:.9">⚠️ <b style="color:#ffb089">It can\'t be reset.</b> If you forget it, your cloud copy can\'t be opened. Write it down somewhere safe. Your partner sets their own.</p><input class="ka-in" id="ka-p1" type="password" autocomplete="new-password" placeholder="Vault passphrase (8+ characters)"><input class="ka-in" id="ka-p2" type="password" autocomplete="new-password" placeholder="Type it again"><label style="display:flex;gap:8px;align-items:center;min-height:40px;font-size:14px;cursor:pointer"><input type="checkbox" id="ka-show" style="width:20px;height:20px"> Show what I typed</label><div class="ka-msg" id="ka-m"></div><button class="ka-bt" id="ka-vk">Lock my data with it</button><button class="ka-bt g" id="ka-so" style="margin-top:8px">Sign out</button>';
    } else if (s.vault === 'locked') {
      h += '<h2>Unlock your vault</h2><p>Enter your vault passphrase (not your password) to open your data on this device.</p><input class="ka-in" id="ka-p1" type="password" autocomplete="current-password" placeholder="Vault passphrase"><label style="display:flex;gap:8px;align-items:center;min-height:40px;font-size:14px;cursor:pointer"><input type="checkbox" id="ka-show" style="width:20px;height:20px"> Show what I typed</label><div class="ka-msg" id="ka-m"></div><button class="ka-bt" id="ka-vk">Unlock</button><button class="ka-bt g" id="ka-so" style="margin-top:8px">Sign out</button>';
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
      busy(this, tab === 'in' ? C.signIn(em, pw) : C.signUp(em, pw, g('ka-iv') ? g('ka-iv').value : '')).then(function (r) { if (r && r.needsConfirm) { msg('Check your email to confirm, then sign in.', true); tab = 'in'; } else renderAcct(); }, function () {});
    };
    if (g('ka-fp')) g('ka-fp').onclick = function () { var em = g('ka-em').value.trim(); if (!em) return msg('Enter your email first.'); C.resetPassword(em).then(function () { msg('Reset email sent (if the account exists).', true); }, function (e) { msg(e.message); }); };
    if (g('ka-show')) g('ka-show').onchange = function () { var t = this.checked ? 'text' : 'password'; ['ka-p1', 'ka-p2'].forEach(function (id) { if (g(id)) g(id).type = t; }); };
    if (g('ka-vk')) g('ka-vk').onclick = function () {
      var p1 = g('ka-p1').value, p2 = g('ka-p2'); if (p1.length < 8) return msg('Passphrase needs 8+ characters.'); if (p2 && p2.value !== p1) return msg('Passphrases do not match.');
      busy(this, C.unlock(p1)).then(function () { renderAcct(); /* done: close the panel so the page underneath (e.g. Together's next step) shows */ setTimeout(closeAcct, 700); }, function () {});
    };
    if (g('ka-sy')) g('ka-sy').onclick = function () { busy(this, C.syncNow()).then(function (r) { msg(r ? 'Synced.' : 'Could not sync.', !!r); renderAcct(); }, function () {}); };
    if (g('ka-so')) g('ka-so').onclick = function () { C.signOut().then(renderAcct); };
    if (g('ka-bk')) g('ka-bk').onclick = function () { closeAcct(); var b = doc.querySelector('[aria-label*="ettings"],#ka-gear,.ka-gear'); if (b) b.click(); else if (window.KA && KA.openFavHub) KA.openFavHub(); };
  }

  /* ---- footer ---- */
  var ftr = doc.createElement('footer'); ftr.id = 'ka-ftr'; ftr.setAttribute('role', 'contentinfo');
  ftr.innerHTML = '<div><a href="' + u('index.html') + '">Home</a><a href="' + u(G + 'kamaagni-experts.html') + '">Experts</a><a href="' + u(G + 'kamaagni-together.html') + '">Together</a><a href="' + u(G + 'kamaagni-history.html') + '">History</a><a href="' + u(G + 'kamaagni-settings.html') + '">Settings</a><a href="' + u('about.html') + '">About &amp; Privacy</a></div><div>Made with ♡ for couples · 18+ · Consent first, always · <span id="kf-v" title="App version">v92</span></div><div><span class="fs" id="kf-s">💾 Saved on this device</span></div>';
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
  /* "what next", plans and untried features (v67) */
  var nx = doc.createElement('script'); nx.src = BASE + 'js/ka-next.js'; doc.body.appendChild(nx);
  /* printable originals: links to the source PDF folders on GitHub (v72) */
  var ksrc = doc.createElement('script'); ksrc.src = BASE + 'js/ka-sources.js'; doc.body.appendChild(ksrc);
  var kvo = doc.createElement('script'); kvo.src = BASE + 'js/ka-voice.js'; doc.body.appendChild(kvo);
  var ksh = doc.createElement('script'); ksh.src = BASE + 'js/ka-shared.js'; doc.body.appendChild(ksh);
  var kfb = doc.createElement('script'); kfb.src = BASE + 'js/ka-fb.js'; doc.body.appendChild(kfb);
  var klm = doc.createElement('script'); klm.src = BASE + 'js/ka-limits.js'; doc.body.appendChild(klm);
  var kaf = doc.createElement('script'); kaf.src = BASE + 'js/ka-after.js'; doc.body.appendChild(kaf);
  var kbo = doc.createElement('script'); kbo.src = BASE + 'js/ka-both.js'; doc.body.appendChild(kbo);
  var krm = doc.createElement('script'); krm.src = BASE + 'js/ka-remote.js'; doc.body.appendChild(krm);
  var kpu = doc.createElement('script'); kpu.src = BASE + 'js/ka-push.js'; doc.body.appendChild(kpu);
  if (/kamaagni-(poker-quick|connect-foreplay|showdown)\.html/.test(location.pathname)) { var ktd = doc.createElement('script'); ktd.src = BASE + 'js/ka-tidy.js'; doc.body.appendChild(ktd); }
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
      case 'inv': return { icon: '💌', title: n + ' invited you', text: b.t || 'Tonight?', kind: 'nudge', href: 'games/kamaagni-invite.html#inbox' };
      case 'rsvp': return { icon: b.r === 'yes' ? '🔥' : b.r === 'later' ? '🌙' : '📅', title: n + (b.r === 'yes' ? ' said yes!' : b.r === 'later' ? ': not tonight, but…' : ' wants to plan it'), text: b.t || (b.r === 'yes' ? 'See you soon 😉' : ''), kind: 'nudge', href: 'games/kamaagni-invite.html#inbox' };
      case 'plan': return { icon: '📅', title: n + ' shared a plan', text: b.t || '', href: 'games/kamaagni-invite.html#inbox' };
      case 'wish': return { icon: '🌠', title: n + ' updated their secret wishes', text: 'See if you have a new match', href: 'games/kamaagni-invite.html#wish' };
      case 'veto': return { icon: '↻', title: n + ' would rather skip one step', text: '“' + (b.t || 'a step') + '”. Swap it in Plan Tonight.', href: 'games/kamaagni-tonight.html' };
      case 'ldr': return { icon: '🌍', title: n, text: b.t || 'Thinking of you from afar', kind: 'nudge', href: 'games/kamaagni-apart.html' };
      case 'fun': return b.say ? { icon: b.ic || '🎉', title: n, text: b.say, href: 'games/kamaagni-fun.html' } : null;
      default: return null;
    }
  }
  var unseen = 0;
  function checkNudges() {
    var C = window.KA_CLOUD, s = C && C.state(); if (!s || !s.couple || !s.couple.partnerJoined || s.vault !== 'ready' || doc.hidden) return;
    C.couple.list(0).then(function (evs) {
      (window.KA_EV_HOOKS || []).forEach(function (f) { try { f(evs); } catch (e) {} });
      var seen = +localStorage.getItem('ka_cloud_nudge') || 0, tomb = {}, mx = 0, fresh = [];
      evs.forEach(function (e) { mx = Math.max(mx, e.id); if (e.kind === 'tomb' && e.body) tomb[e.body.x] = 1; });
      evs.forEach(function (e) { if (!e.mine && e.body && !tomb[e.id] && e.id > seen && describe(e)) fresh.push(e); });
      if (onTogether) { localStorage.setItem('ka_cloud_nudge', String(mx)); fresh = []; }
      var first = localStorage.getItem('ka_cloud_nudge') === null; if (first) fresh = fresh.slice(-5);
      var prev = unseen; unseen = calm().nudges ? fresh.length : 0;
      var pd = doc.getElementById('kh-pd'); if (pd) { pd.textContent = unseen ? (unseen > 9 ? '9+' : unseen) : ''; pd.classList.toggle('n', !!unseen); }
      if (unseen > prev && calm().nudges) { var last = fresh[fresh.length - 1], dsc = describe(last); notify(dsc); }
      /* v83: a partner's STOP always gets through, even with partner notifications muted */
      else { var ss = +localStorage.getItem('ka_stop_seen') || 0, stp = null; fresh.forEach(function (e) { if (e.kind === 'sig' && e.body && e.body.s === 'r' && e.id > ss) stp = e; }); if (stp && !calm().nudges) notify(describe(stp)); }
      fresh.forEach(function (e) { if (e.kind === 'sig' && e.body && e.body.s === 'r') localStorage.setItem('ka_stop_seen', String(Math.max(e.id, +localStorage.getItem('ka_stop_seen') || 0))); });
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
      var d = doc.createElement('div'); d.id = 'ka-pause'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Time to be together'); d.style.cssText = 'position:fixed;inset:0;z-index:2147483400;background:rgba(5,6,15,.92);display:flex;align-items:center;justify-content:center;padding:22px;font-family:"DM Sans",system-ui,sans-serif;color:#dce9ff;text-align:center';
      d.innerHTML = '<div class="ka-card" style="max-width:400px"><div style="font-size:44px">🕯️</div><h2>Time to be together</h2><p>You have spent about ' + min + ' minutes here today. The best part happens off the screen: put the phone down and enjoy each other.</p><button class="ka-bt" id="kp-ok">Good idea</button><button class="ka-bt g" id="kp-more" style="margin-top:8px">Keep going</button><p style="font-size:12px;margin-top:12px">You can change this reminder in Settings → Healthy use.</p></div>';
      doc.body.appendChild(d);
      d.querySelector('#kp-ok').onclick = function () { location.href = u('index.html'); d.remove(); };
      d.querySelector('#kp-more').onclick = function () { d.remove(); };
    }
  })();

  /* ---- v66 accessibility layer: one main region, one site header/footer, a name for every control ---- */
  (function () {
    function landmarks() {
      var kids = [].slice.call(doc.body.children).filter(function (e) { return !/^(ka-|kh-|kf-)/.test(e.id || '') && !/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE)$/.test(e.tagName) && !e.classList.contains('kg'); });
      [].forEach.call(doc.querySelectorAll('header:not(#ka-hdr), footer:not(#ka-ftr)'), function (e) { if (!e.hasAttribute('role')) e.setAttribute('role', 'none'); });
      if (!doc.querySelector('main, [role="main"]')) {
        var km = doc.getElementById('ka-main'); if (km && km.tagName !== 'A') { km.setAttribute('role', 'main'); return; }
        kids = kids.filter(function (e) { return !/^(A|CANVAS|SVG|IMG|BUTTON)$/.test(e.tagName) && !e.hasAttribute('role') && e.getAttribute('aria-hidden') !== 'true' && getComputedStyle(e).display !== 'none' && !/modal|overlay|toast|skip/i.test((e.className || '') + ' ' + (e.id || '')); });
        var best = null, bl = -1;
        kids.forEach(function (e) { var l = (e.textContent || '').length + e.querySelectorAll('button, a, input, canvas, svg').length * 40; if (l > bl) { bl = l; best = e; } });
        if (best) best.setAttribute('role', 'main');
      }
    }
    function nameOf(el) {
      var t = el.getAttribute('placeholder') || el.title || '';
      if (!t) { var lab = el.closest('label'); if (lab) { t = lab.textContent; if (!t.trim() && lab.nextElementSibling) t = lab.nextElementSibling.textContent; } }
      if (!t || !t.trim()) { var p = el.previousElementSibling; if (p && /^(LABEL|SPAN|B|STRONG|SMALL|P|DIV|H\d)$/.test(p.tagName)) t = p.textContent; }
      if (!t || !t.trim()) { var n = el.nextElementSibling; if (n && /^(LABEL|SPAN|B|SMALL)$/.test(n.tagName)) t = n.textContent; }
      if (!t || !t.trim()) { var pr = el.parentElement; if (pr && pr.textContent.trim().length < 60) t = pr.textContent; }
      if ((!t || !t.trim()) && el.tagName === 'SELECT' && el.options[0]) t = 'Choose: ' + el.options[0].text;
      return (t || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    }
    function controls() {
      [].forEach.call(doc.querySelectorAll('input:not([type=hidden]), select, textarea'), function (el) {
        if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || (el.id && doc.querySelector('label[for="' + el.id + '"]'))) return;
        var lab = el.closest('label'); if (lab && lab.textContent.trim()) return;
        var t = nameOf(el); if (t) el.setAttribute('aria-label', t);
      });
      [].forEach.call(doc.querySelectorAll('[role="dialog"]:not([aria-labelledby]), dialog:not([aria-labelledby])'), function (d) {
        if ((d.getAttribute('aria-label') || '').trim()) return;
        var h = d.querySelector('h1, h2, h3, [class*="title"], [class*="head"], b, strong'); if (h && h.textContent.trim()) d.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim().slice(0, 60));
      });
    }
    var pend = 0; function run() { pend = 0; try { landmarks(); controls(); } catch (e) {} }
    run(); setTimeout(run, 800);
    try { new MutationObserver(function () { if (!pend) pend = setTimeout(run, 400); }).observe(doc.body, { childList: true, subtree: true }); } catch (e) {}
  })();

  /* --hdr: the fixed header's height, for anything that sticks below it */
  (function () { function m() { var h = doc.getElementById('ka-hdr'); if (h) doc.documentElement.style.setProperty('--hdr', Math.round(h.getBoundingClientRect().bottom) + 'px'); }
    addEventListener('resize', m); addEventListener('load', m); setTimeout(m, 0); setTimeout(m, 600); })();

  /* ↑ back to top: appears on long pages after you've scrolled down a couple of screens */
  (function () {
    var t = doc.createElement('button'); t.type = 'button'; t.id = 'ka-totop'; t.textContent = '↑'; t.setAttribute('aria-label', 'Back to the top');
    t.style.cssText = 'position:fixed;right:12px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:7990;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.22);background:rgba(18,21,42,.92);color:#f4c58a;font:700 20px system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.45);opacity:0;pointer-events:none;transform:translateY(8px);transition:opacity .2s,transform .2s';
    t.onclick = function () { var r = matchMedia('(prefers-reduced-motion: reduce)').matches; scrollTo({ top: 0, behavior: r ? 'auto' : 'smooth' }); try { var h = doc.querySelector('main h1, h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } } catch (e) {} };
    var on = false, tick = 0;
    function upd() { tick = 0; var show = scrollY > innerHeight * 2.2 && doc.documentElement.scrollHeight > innerHeight * 4;
      if (show !== on) { on = show; t.style.opacity = show ? '1' : '0'; t.style.pointerEvents = show ? 'auto' : 'none'; t.style.transform = show ? 'none' : 'translateY(8px)'; t.tabIndex = show ? 0 : -1; } }
    t.tabIndex = -1;
    function add() { if (!doc.getElementById('ka-totop')) doc.body.appendChild(t); upd(); }
    if (doc.body) add(); else doc.addEventListener('DOMContentLoaded', add);
    addEventListener('scroll', function () { if (!tick) tick = requestAnimationFrame(upd); }, { passive: true });
  })();

  window.KA_CHROME = { openAccount: openAcct, MENU: MENU, notify: notify, describe: describe, check: checkNudges };
})();

