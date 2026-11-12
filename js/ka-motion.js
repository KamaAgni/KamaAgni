/* KamaAgni motion kit: press ripple, haptics, first-paint reveal, particle bursts. No dependencies. */
(function () {
  'use strict';
  if (window.KA_MOTION) return;
  var doc = document, reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function calm() { try { return JSON.parse(localStorage.getItem('ka_calm') || '{}') || {}; } catch (e) { return {}; } }
  function tick(ms) { try { if (!calm().noHaptic && navigator.vibrate) navigator.vibrate(ms || 8); } catch (e) {} }

  /* ripple + haptic on any button-like press */
  doc.addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('.kx-btn,.btn-primary,.btn,.card-cta,button.kx-opt');
    if (!b || b.disabled) return;
    tick(6);
    if (reduce) return;
    var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2, sp = doc.createElement('span');
    sp.className = 'ka-rip'; sp.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
    var cs = getComputedStyle(b); if (cs.position === 'static') b.style.position = 'relative'; if (cs.overflow === 'visible') b.style.overflow = 'hidden';
    b.appendChild(sp); setTimeout(function () { sp.remove(); }, 600);
  }, { passive: true });

  /* reveal main content once on first paint (never on re-render, so nothing flashes) */
  function reveal(host) {
    if (reduce || !host || host.__kaIn) return;
    var kids = Array.prototype.slice.call(host.children).filter(function (c) { return !/^(SCRIPT|STYLE|HEADER|FOOTER)$/.test(c.tagName) && c.id !== 'ka-hdr' && c.id !== 'ka-ftr'; });
    if (!kids.length) return; host.__kaIn = 1;
    kids.slice(0, 8).forEach(function (c, i) { c.style.setProperty('--i', i); c.classList.add('ka-in'); setTimeout(function () { c.classList.remove('ka-in'); }, 900 + i * 70); });
  }
  function boot() {
    var host = doc.querySelector('main.kx,#app,main,.app,.container'); if (!host) return;
    reveal(host);
    if (!host.__kaIn) { var mo = new MutationObserver(function () { reveal(host); if (host.__kaIn) mo.disconnect(); }); mo.observe(host, { childList: true }); setTimeout(function () { mo.disconnect(); }, 2500); }
  }
  if (doc.readyState !== 'loading') boot(); else doc.addEventListener('DOMContentLoaded', boot);

  /* particle burst: kind = confetti | hearts | embers */
  var cv, cx, parts = [], raf = 0;
  function ensure() { if (cv) return; cv = doc.createElement('canvas'); cv.className = 'ka-fx-canvas'; cv.setAttribute('aria-hidden', 'true'); doc.body.appendChild(cv); cx = cv.getContext('2d'); size(); window.addEventListener('resize', size); }
  function size() { if (!cv) return; var d = Math.min(window.devicePixelRatio || 1, 2); cv.width = innerWidth * d; cv.height = innerHeight * d; cx.setTransform(d, 0, 0, d, 0, 0); }
  function step() {
    cx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter(function (p) { return p.life > 0; });
    parts.forEach(function (p) {
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.life -= 1; p.r += p.vr;
      cx.save(); cx.globalAlpha = Math.max(0, Math.min(1, p.life / 30)); cx.translate(p.x, p.y); cx.rotate(p.r);
      if (p.ch) { cx.font = p.s + 'px serif'; cx.textAlign = 'center'; cx.fillText(p.ch, 0, 0); }
      else { cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .6); }
      cx.restore();
    });
    if (parts.length) raf = requestAnimationFrame(step); else { raf = 0; cx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  function burst(o) {
    if (reduce || calm().noFx) return; o = o || {}; ensure();
    var kind = o.kind || 'confetti', n = o.n || 46, x = o.x != null ? o.x : innerWidth / 2, y = o.y != null ? o.y : innerHeight * .55;
    var cols = ['#ff5d8f', '#ffc861', '#8b6cff', '#46d7c6', '#ff7a3d'], em = kind === 'hearts' ? ['💗', '💖', '💕', '❤️'] : kind === 'embers' ? ['🔥', '✨', '🧡'] : null;
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, sp = 3 + Math.random() * 7;
      parts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 5, g: .22, life: 60 + Math.random() * 40, r: Math.random() * 6, vr: (Math.random() - .5) * .3,
        s: em ? 14 + Math.random() * 12 : 6 + Math.random() * 6, c: cols[i % cols.length], ch: em ? em[i % em.length] : null });
    }
    if (!raf) raf = requestAnimationFrame(step);
    tick(18);
  }
  window.KA_MOTION = { burst: burst, tick: tick, reveal: reveal, reduced: reduce };
})();

/* v56: accessibility fill-ins. Every button/link gets a name, every page gets one h1. */
(function () {
  function fix() {
    try {
      document.querySelectorAll('button:not([aria-label]),a:not([aria-label])').forEach(function (e) {
        if ((e.innerText || '').trim() || e.title || e.querySelector('img[alt]')) return;
        var t = (e.textContent || '').trim() || e.getAttribute('data-t') || e.getAttribute('data-v') || e.getAttribute('data-mood');
        if (t) e.setAttribute('aria-label', t);
      });
      if (!document.querySelector('h1')) {
        var h = document.createElement('h1'); h.className = 'ka-sr'; h.textContent = (document.title || 'KamaAgni').replace(/\s*[|:·-].*$/, '') || 'KamaAgni';
        document.body.insertBefore(h, document.body.firstChild);
      }
    } catch (e) {}
  }
  var tm; function later() { clearTimeout(tm); tm = setTimeout(fix, 300); }
  if (document.readyState !== 'loading') later(); else document.addEventListener('DOMContentLoaded', later);
  try { new MutationObserver(later).observe(document.body || document.documentElement, { childList: true, subtree: true }); } catch (e) {}
})();

/* v60: favourites star in the header of every game page, plus "Continue" and "Favourites" rows on the home page. */
(function () {
  var FK = 'ka_favs', LK = 'ka_lastpage';
  function rd(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function wr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var path = location.pathname, m = path.match(/\/(games\/[^\/]+\.html)$/), here = m && m[1];
  function title() { return (document.title || '').replace(/^KamaAgni\s*/, '').trim() || 'Page'; }
  if (here && !/pdf-viewer/.test(here)) {
    wr(LK, { u: here, t: title(), at: Date.now() });
    var tries = 0, iv = setInterval(function () {
      var acct = document.getElementById('kh-acct');
      if (!acct && ++tries < 40) return; clearInterval(iv); if (!acct || document.getElementById('kh-fav')) return;
      var b = document.createElement('button'); b.id = 'kh-fav'; b.type = 'button'; b.className = 'kh-b';
      function paint() { var on = rd(FK, []).some(function (f) { return f.u === here; }); b.textContent = on ? '★' : '☆'; b.setAttribute('aria-label', on ? 'Remove from favourites' : 'Add to favourites'); b.title = b.getAttribute('aria-label'); b.style.color = on ? '#ffc861' : ''; }
      b.onclick = function () { var f = rd(FK, []); var i = f.findIndex(function (x) { return x.u === here; }); if (i >= 0) f.splice(i, 1); else f.push({ u: here, t: title() }); wr(FK, f); paint(); };
      paint(); acct.parentNode.insertBefore(b, acct);
    }, 150);
  }
  if (/\/(index\.html)?$/.test(path) && !here) {
    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function row() {
      var dash = document.getElementById('dash'); if (!dash || document.getElementById('ka-fav-row')) return;
      var favs = rd(FK, []), last = rd(LK, null);
      if (!favs.length && !last) return;
      var d = document.createElement('div'); d.id = 'ka-fav-row'; d.style.cssText = 'max-width:960px;margin:12px auto 0;padding:0 16px';
      var h = '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">';
      if (last) h += '<a href="' + esc(last.u) + '" style="display:inline-flex;align-items:center;min-height:44px;padding:8px 16px;border-radius:999px;border:1px solid #ffb066;background:rgba(255,160,90,.14);color:inherit;text-decoration:none;font-size:14px">▶ Continue: ' + esc(last.t) + '</a>';
      favs.slice(0, 8).forEach(function (f) { h += '<a href="' + esc(f.u) + '" style="display:inline-flex;align-items:center;min-height:44px;padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.2);color:inherit;text-decoration:none;font-size:14px">★ ' + esc(f.t) + '</a>'; });
      d.innerHTML = h + '</div>'; dash.parentNode.insertBefore(d, dash);
    }
    if (document.readyState !== 'loading') row(); else document.addEventListener('DOMContentLoaded', row);
  }
})();

/* v61: if you are signed in but the vault is not set up or locked, nothing syncs. Say so, once per visit. */
(function () {
  if (sessionStorage.getItem('ka_vnag')) return;
  var n = 0, iv = setInterval(function () {
    var C = window.KA_CLOUD; if (++n > 40) return clearInterval(iv);
    if (!C || !C.state) return; var s = C.state();
    if (!s || !s.enabled || !s.user || !s.ready && s.vault === 'none') return;
    clearInterval(iv);
    if (s.vault !== 'new' && s.vault !== 'locked') return;
    var d = document.createElement('div'); d.id = 'ka-vnag'; d.setAttribute('role', 'status');
    d.style.cssText = 'position:fixed;left:12px;right:12px;bottom:84px;z-index:9500;max-width:520px;margin:0 auto;padding:12px 14px;border-radius:14px;background:#2a1d14;border:1px solid #ffb066;color:#f6e9d6;font:14px/1.4 system-ui,sans-serif;display:flex;gap:10px;align-items:center';
    d.innerHTML = '<span style="flex:1">☁️ ' + (s.vault === 'new' ? 'Your data is not syncing yet. Create your vault passphrase to back it up and see it on every device.' : 'Unlock your vault with your passphrase to load your data on this device.') + '</span><button type="button" id="ka-vgo" style="min-height:44px;padding:8px 14px;border-radius:10px;border:0;background:#ffb066;color:#1d140e;font:inherit;font-weight:700;cursor:pointer">Set up</button><button type="button" id="ka-vx" aria-label="Dismiss" style="min-height:44px;min-width:44px;border:0;background:none;color:inherit;font-size:20px;cursor:pointer">✕</button>';
    document.body.appendChild(d);
    document.getElementById('ka-vx').onclick = function () { sessionStorage.setItem('ka_vnag', '1'); d.remove(); };
    document.getElementById('ka-vgo').onclick = function () { sessionStorage.setItem('ka_vnag', '1'); d.remove(); var a = document.getElementById('kh-acct'); if (a) a.click(); };
  }, 500);
})();

/* v62: "Today" card on the home page: one question, one tiny mission, one link. Same for both of you, new every day. */
(function () {
  if (!/\/(index\.html)?$/.test(location.pathname) || /\/games\//.test(location.pathname)) return;
  var Q = ['What made you smile about us this week?', 'What is one small thing I do that you love?', 'Where would you like us to go for a weekend, just us?', 'What is a memory of us you replay?', 'What would make tonight feel special?', 'What song reminds you of us?', 'What is something new you would like to try together?', 'When did you last feel really close to me?', 'What is your favourite way to be touched when you are tired?', 'What is one thing I could do to help you relax?', 'What do you appreciate about how we handle hard days?', 'If we had a free day, how would we spend it?', 'What is a compliment you would like to hear more?', 'What is your favourite thing about our mornings?', 'What is a dream you have not told me yet?', 'What is something I did recently that made you feel loved?', 'What kind of date would you like us to have next?', 'When do you feel most attractive?', 'What is one thing we should do more often?', 'What was the best moment of your day?', 'What is something we have never done but you would like to?', 'What does a perfect evening together look like?', 'What is one thing you want me to know today?', 'What would you like me to ask you more often?', 'What is your favourite photo of us, and why?', 'Which of our rituals do you love most?', 'What made you fall for me?', 'How can I make your week easier?', 'What is a place that feels like ours?', 'What are you looking forward to in the next month?', 'Describe our best kiss.', 'What is something about my body or voice you love?', 'What would you like to be teased about tonight?', 'What smell or taste reminds you of us?', 'What touch makes you melt?', 'What is a secret wish you are shy to share?', 'What would make you feel most adored this week?', 'What is a skill you would like to learn together?', 'What do you miss from when we first met?', 'What do you love about how we laugh together?'];
  var M = ['Hug for a full 20 seconds.', 'Send a loving message in the middle of the day.', 'Give a 5-minute shoulder rub, no strings.', 'Cook or order your partner’s favourite food.', 'Put phones away for one hour tonight.', 'Leave a small note where they will find it.', 'Kiss for one full minute before dinner.', 'Say three things you appreciate, out loud.', 'Dance to one song in the kitchen.', 'Take a 10-minute walk together after dinner.', 'Pick one thing from your bucket list and plan a date for it.', 'Hold hands during a film tonight.', 'Run a bath or light a candle for your partner.', 'Give a compliment about their body, specifically.', 'Whisper something flirty when you pass.', 'Trade a foot rub each.', 'Look into each other’s eyes for two minutes without talking.', 'Watch the sunset or sunrise together.', 'Plan a surprise for the weekend.', 'Fall asleep in each other’s arms tonight.', 'Share one fantasy in a sentence, no judging.', 'Make breakfast for the other.', 'Wear something your partner loves.', 'Try a new position or a new room.', 'Do a 10-minute sensory game: blindfold, feather, silk.', 'Slow-kiss the neck and shoulders for five minutes.', 'Take turns saying what felt best last time.', 'Write a love note and read it aloud.', 'Take a shower together.', 'Pick a movie from Movie Night.'];
  var LINKS = [['games/kamaagni-ask-tell.html', 'Ask & Tell'], ['games/kamaagni-tonight.html', 'Tonight'], ['games/kamaagni-massage.html', 'Massage'], ['games/kamaagni-rituals.html', 'Rituals'], ['games/kamaagni-movies.html', 'Movie Night'], ['games/kamaagni-playlist.html', 'Playlist'], ['games/kamaagni-planner.html', 'Date Planner'], ['games/kamaagni-tips.html', 'Hack of the Day'], ['games/kamaagni-spark-challenge.html', 'Spark Challenge']];
  var d = Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5), q = Q[d % Q.length], m = M[(d * 7) % M.length], l = LINKS[d % LINKS.length];
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function put() {
    var dash = document.getElementById('dash'); if (!dash || document.getElementById('ka-today')) return;
    var c = document.createElement('section'); c.id = 'ka-today'; c.setAttribute('aria-label', 'Today');
    c.style.cssText = 'max-width:960px;margin:14px auto 0;padding:16px;border:1px solid rgba(255,255,255,.14);border-radius:16px;background:rgba(255,255,255,.04)';
    c.innerHTML = '<div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.7;margin-bottom:8px">Today, for the two of you</div>' +
      '<div style="font-size:17px;line-height:1.45;margin-bottom:8px">💬 ' + esc(q) + '</div>' +
      '<div style="font-size:15px;line-height:1.45;opacity:.9;margin-bottom:10px">✨ Mini-mission: ' + esc(m) + '</div>' +
      '<a href="' + l[0] + '" style="display:inline-flex;align-items:center;min-height:44px;padding:8px 16px;border-radius:999px;border:1px solid #ffb066;color:inherit;text-decoration:none;font-size:14px">Try today: ' + esc(l[1]) + ' →</a>';
    dash.parentNode.insertBefore(c, dash);
  }
  if (document.readyState !== 'loading') put(); else document.addEventListener('DOMContentLoaded', put);
})();

/* ---- Partner sharing: Date Planner, Memory Book, Movie Night, yearly review, playlist favourites ---- */
(function () {
  var LISTK = { ka_plan_v1: 1, ka_mem_v1: 1 }, LWW = { ka_movies_v1: 1, ka_review_v1: 1 }, ARR = { ka_songs_v1: 1 };
  var KEYS = Object.keys(LISTK).concat(Object.keys(LWW), Object.keys(ARR));
  var S = window.localStorage, set0 = Storage.prototype.setItem, applying = false, timers = {};
  var J = function (s, d) { try { var v = JSON.parse(s); return v == null ? d : v; } catch (e) { return d; } };
  var rd = function (k) { return S.getItem(k); };
  var wr = function (k, v) { applying = true; try { set0.call(S, k, typeof v === 'string' ? v : JSON.stringify(v)); } finally { applying = false; } };
  var ready = function () { var C = window.KA_CLOUD; if (!C) return null; var s = C.state(); return (s && s.user && s.vault === 'ready' && s.couple && s.couple.partnerJoined && s.couple.hasKey) ? C : null; };

  function stamp(k) {                       /* mark changed items with u, record deletions in x */
    var o = J(rd(k), null); if (!o) return;
    var now = Date.now();
    if (LISTK[k]) {
      var base = J(S.getItem('ka_share_b_' + k), {}), nb = {}, x = o.x || [];
      (o.e || []).forEach(function (it) {
        var c = JSON.stringify(Object.assign({}, it, { u: 0 })); nb[it.id] = c;
        if (base[it.id] !== c) it.u = now;
      });
      Object.keys(base).forEach(function (id) { if (!nb[id] && x.indexOf(id) < 0) x.push(id); });
      o.x = x; wr(k, o); set0.call(S, 'ka_share_b_' + k, JSON.stringify(nb));
    } else if (LWW[k]) { o._u = now; wr(k, o); }
  }
  function merge(k, r) {
    var l = J(rd(k), null);
    if (ARR[k]) { var a = Array.isArray(l) ? l : [], u = a.slice(); (r || []).forEach(function (v) { if (u.indexOf(v) < 0) u.push(v); }); return JSON.stringify(u) === JSON.stringify(a) ? null : u; }
    if (LWW[k]) { if (!l || (r && (r._u || 0) > (l._u || 0))) return r; return null; }
    if (!r) return null; l = l || { e: [] };
    var x = {}; (l.x || []).concat(r.x || []).forEach(function (i) { x[i] = 1; });
    var m = {}; (l.e || []).concat(r.e || []).forEach(function (it) { if (x[it.id]) return; var p = m[it.id]; if (!p || (it.u || 0) > (p.u || 0)) m[it.id] = it; });
    var out = Object.assign({}, l, { e: Object.keys(m).map(function (i) { return m[i]; }), x: Object.keys(x) });
    return JSON.stringify(out) === JSON.stringify(l) ? null : out;
  }
  function push(k) {
    var C = ready(); if (!C) return;
    var v = J(rd(k), null); if (v == null) return;
    C.couple.send('share', { k: k, v: v }).catch(function () {});
  }
  Storage.prototype.setItem = function (k, v) {
    var r = set0.apply(this, arguments);
    if (!applying && this === S && KEYS.indexOf(k) >= 0) {
      try { stamp(k); } catch (e) {}
      clearTimeout(timers[k]); timers[k] = setTimeout(function () { push(k); }, 2000);
    }
    return r;
  };
  var busy = false;
  function pull() {
    var C = ready(); if (!C || busy) return; busy = true;
    var since = parseInt(S.getItem('ka_share_since') || '0', 10) || 0;
    C.couple.list(since).then(function (ev) {
      var last = since, latest = {};
      ev.forEach(function (e) { last = Math.max(last, e.id); if (e.kind === 'share' && !e.mine && e.body && e.body.k && KEYS.indexOf(e.body.k) >= 0) (latest[e.body.k] = latest[e.body.k] || []).push(e.body.v); });
      var changed = false;
      Object.keys(latest).forEach(function (k) {
        latest[k].forEach(function (v) { var m = merge(k, v); if (m != null) { wr(k, m); if (LISTK[k]) { var b = {}; (m.e || []).forEach(function (it) { b[it.id] = JSON.stringify(Object.assign({}, it, { u: 0 })); }); set0.call(S, 'ka_share_b_' + k, JSON.stringify(b)); } changed = true; } });
      });
      set0.call(S, 'ka_share_since', String(last));
      if (!S.getItem('ka_share_first')) { set0.call(S, 'ka_share_first', '1'); KEYS.forEach(function (k) { if (rd(k)) { if (LISTK[k]) try { stamp(k); } catch (e) {} push(k); } }); }
      else if (changed) KEYS.forEach(function (k) { if (latest[k]) push(k); });
      if (changed) {
        var ae = document.activeElement;
        if (ae && /INPUT|TEXTAREA|SELECT/.test(ae.tagName)) return;
        if (sessionStorage.getItem('ka_share_rl') === String(last)) return;
        sessionStorage.setItem('ka_share_rl', String(last)); location.reload();
      }
    }).catch(function () {}).then(function () { busy = false; });
  }
  setInterval(function () { if (!document.hidden) pull(); }, 15000);
  window.addEventListener('ka:cloud', function () { setTimeout(pull, 800); });
  setTimeout(pull, 2500);
  window.KA_SHARE = { pull: pull, keys: KEYS };
})();

/* ---- Comfort settings (text size, high contrast), iPhone install hint, Start here, Surprise me ---- */
(function () {
  var D = document, rd = function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  var wr = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  var root = D.documentElement;
  function applyComfort() {
    var z = rd('ka_textsize', 100); root.style.fontSize = z === 100 ? '' : z + '%';
    root.classList.toggle('ka-hc', !!rd('ka_hicontrast', false));
  }
  applyComfort();
  var st = D.createElement('style');
  st.textContent = '.ka-hc body,.ka-hc .kx{color:#fff!important}.ka-hc .g-m,.ka-hc p,.ka-hc small,.ka-hc .card-desc{color:#f2f2f2!important;opacity:1!important}.ka-hc a{text-decoration:underline}.ka-hc button,.ka-hc .g-card,.ka-hc .game-card{border-color:rgba(255,255,255,.7)!important}' +
    '.ka-box{margin:12px auto;max-width:720px;padding:16px;border-radius:16px;border:1px solid rgba(255,176,102,.4);background:rgba(20,12,24,.85);color:#fff}.ka-box h3{margin:0 0 8px;font-size:1.1rem}.ka-box .r{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}.ka-box button,.ka-box a.b{min-height:44px;padding:8px 14px;border-radius:999px;border:1px solid #ffb066;background:transparent;color:inherit;font:inherit;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center}.ka-row button,.ka-row a.b{padding:8px 11px;font-size:.92rem}.ka-box button.on{background:#ffb066;color:#1a0f12}';
  D.head.appendChild(st);
  function ready(f) { if (D.readyState !== 'loading') f(); else D.addEventListener('DOMContentLoaded', f); }

  /* Settings page: comfort controls */
  if (/kamaagni-settings\.html$/.test(location.pathname)) ready(function () {
    var n = 0, iv = setInterval(function () {
      var app = D.getElementById('app'); if (!app || !app.children.length) { if (++n > 40) clearInterval(iv); return; }
      clearInterval(iv); if (D.getElementById('ka-comfort')) return;
      var b = D.createElement('div'); b.id = 'ka-comfort'; b.className = 'ka-box';
      function paint() {
        var z = rd('ka_textsize', 100), hc = rd('ka_hicontrast', false);
        b.innerHTML = '<h3>Comfort: text size and contrast</h3><div class="r" role="group" aria-label="Text size">' +
          [[100, 'Normal'], [115, 'Large'], [130, 'Extra large']].map(function (o) { return '<button data-z="' + o[0] + '" class="' + (z === o[0] ? 'on' : '') + '" aria-pressed="' + (z === o[0]) + '">' + o[1] + '</button>'; }).join('') +
          '</div><div class="r"><button data-hc="1" class="' + (hc ? 'on' : '') + '" aria-pressed="' + hc + '">High contrast: ' + (hc ? 'on' : 'off') + '</button></div>';
        b.querySelectorAll('[data-z]').forEach(function (x) { x.onclick = function () { wr('ka_textsize', +x.dataset.z); applyComfort(); paint(); }; });
        b.querySelector('[data-hc]').onclick = function () { wr('ka_hicontrast', !rd('ka_hicontrast', false)); applyComfort(); paint(); };
      }
      paint(); app.insertBefore(b, app.children[1] || null);
    }, 150);
  });

  /* iPhone/iPad Safari has no install prompt: show a one-time hint after a few visits */
  ready(function () {
    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream, stand = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
    if (!ios || stand || rd('ka_inst_ios', 0) || (rd('ka_visits', 0) || 0) < 3 || D.getElementById('kx-inst')) return;
    setTimeout(function () {
      var d = D.createElement('div'); d.className = 'ka-box'; d.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:9998;margin:0';
      d.innerHTML = '📲 Add KamaAgni to your Home Screen: tap <b>Share</b>, then <b>Add to Home Screen</b>. It opens like an app, with no browser bars.<div class="r"><button>Got it</button></div>';
      d.querySelector('button').onclick = function () { wr('ka_inst_ios', 1); d.remove(); };
      D.body.appendChild(d);
    }, 5000);
  });

  /* Home page only */
  var home = location.pathname.replace(/\/+$/, '').split('/').pop();
  if (home !== '' && home !== 'index.html' && !/\/$/.test(location.pathname) && home.indexOf('.') >= 0) return;
  if (D.getElementById('dash') === null && !/index\.html$|\/$/.test(location.pathname)) return;
  var VIBE = { sweet: 'Tender', playful: 'Playful', wild: 'Adventurous', learn: 'Learn', plan: 'Plan' };
  function cat(cb) {
    if (window.KA_CATALOG) return cb(window.KA_CATALOG);
    var s = D.createElement('script'); s.src = 'js/ka-catalog.js'; s.onload = function () { cb(window.KA_CATALOG || []); }; D.head.appendChild(s);
  }
  function match(C, mood, mins, heat) {
    var ok = function (c) { return c.u && c.v === mood && c.h && c.h[0] <= heat && c.m <= mins; };
    var L = C.filter(ok);
    if (L.length < 3) L = C.filter(function (c) { return c.u && c.v === mood && c.h && c.h[0] <= heat; });
    if (L.length < 3) L = C.filter(function (c) { return c.u && c.h && c.h[0] <= heat && c.m <= mins; });
    return L;
  }
  function shuf(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pinned(u) { return rd('ka_favs', []).some(function (f) { return f.u === u; }); }
  function pin(c) { var f = rd('ka_favs', []); if (!f.some(function (x) { return x.u === c.u; })) { f.push({ u: c.u, t: c.t }); wr('ka_favs', f); } }

  function guide(force) {
    if (D.getElementById('ka-start')) return;
    var dash = D.getElementById('dash'); if (!dash) return;
    var a = { mood: '', mins: 0, heat: 0 };
    var box = D.createElement('section'); box.id = 'ka-start'; box.className = 'ka-box'; box.setAttribute('aria-label', 'Start here');
    function step() {
      if (!a.mood) {
        box.innerHTML = '<h3>👋 Start here: 3 quick questions</h3><p>What mood are you in tonight?</p><div class="r">' +
          Object.keys(VIBE).map(function (k) { return '<button data-m="' + k + '">' + VIBE[k] + '</button>'; }).join('') + '</div><div class="r"><button data-skip>Not now</button></div>';
        box.querySelectorAll('[data-m]').forEach(function (b) { b.onclick = function () { a.mood = b.dataset.m; step(); }; });
      } else if (!a.mins) {
        box.innerHTML = '<h3>How much time do you have?</h3><div class="r">' + [[10, '10 minutes'], [30, 'About 30'], [90, 'All evening']].map(function (o) { return '<button data-t="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>';
        box.querySelectorAll('[data-t]').forEach(function (b) { b.onclick = function () { a.mins = +b.dataset.t; step(); }; });
      } else if (!a.heat) {
        box.innerHTML = '<h3>How spicy?</h3><p>You can change this any time. Nothing here is a promise.</p><div class="r">' + [[1, '🌸 Sweet'], [2, '🔥 Warm'], [3, '🌶️ Hot']].map(function (o) { return '<button data-h="' + o[0] + '">' + o[1] + '</button>'; }).join('') + '</div>';
        box.querySelectorAll('[data-h]').forEach(function (b) { b.onclick = function () { a.heat = +b.dataset.h; step(); }; });
      } else {
        cat(function (C) {
          var L = shuf(match(C, a.mood, a.mins, a.heat)).slice(0, 3);
          box.innerHTML = '<h3>Good places to begin</h3>' + (L.length ? L.map(function (c, i) { return '<div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.1)"><b>' + c.i + ' ' + c.t + '</b><div style="opacity:.85;font-size:.92em">' + c.d + '</div><div class="r"><a class="b" href="' + c.u + '">Open</a><button data-p="' + i + '">' + (pinned(c.u) ? '★ Saved' : '☆ Save to favourites') + '</button></div></div>'; }).join('') : '<p>Try the All Games page: it has everything.</p>') +
            '<div class="r"><button data-again>Try different answers</button><button data-done>Done</button></div>';
          box.querySelectorAll('[data-p]').forEach(function (b) { b.onclick = function () { pin(L[+b.dataset.p]); b.textContent = '★ Saved'; }; });
          box.querySelector('[data-again]').onclick = function () { a = { mood: '', mins: 0, heat: 0 }; step(); };
          box.querySelector('[data-done]').onclick = function () { wr('ka_started', 1); box.remove(); };
          wr('ka_started', 1);
        });
        return;
      }
      var sk = box.querySelector('[data-skip]'); if (sk) sk.onclick = function () { wr('ka_started', 1); box.remove(); };
    }
    step(); dash.parentNode.insertBefore(box, dash);
    if (force) box.scrollIntoView({ block: 'center' });
  }

  function surprise() {
    var dash = D.getElementById('dash'); if (!dash || D.getElementById('ka-surp')) return;
    var w = D.createElement('div'); w.id = 'ka-surp'; w.className = 'r'; w.style.cssText = 'max-width:720px;margin:8px auto;display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding:0 16px';
    w.className = 'ka-box ka-row'; w.style.cssText += ';background:none;border:0;padding:0';
    w.innerHTML = '<button id="ka-sp">🎁 Surprise me</button><button id="ka-sh">👋 Start</button><a class="b" href="games/kamaagni-week.html">🗓️ Week</a>';
    dash.parentNode.insertBefore(w, dash);
    w.querySelector('#ka-sh').onclick = function () { guide(true); };
    w.querySelector('#ka-sp').onclick = function () {
      cat(function (C) {
        var heat = 2, mood = '';
        try { var mt = JSON.parse(localStorage.getItem('ka_mood') || 'null'); if (mt && mt.v) mood = mt.v; } catch (e) {}
        var L = C.filter(function (c) { return c.u && c.h && c.h[0] <= heat && (!mood || c.v === mood) && !/kamaagni-(settings|history|search)/.test(c.u); });
        if (!L.length) L = C.filter(function (c) { return c.u; });
        var c = shuf(L)[0]; if (c) location.href = c.u;
      });
    };
  }
  ready(function () { surprise(); if (!rd('ka_started', 0) && rd('ka_welcomed', 0)) setTimeout(function () { guide(false); }, 600); });
})();
