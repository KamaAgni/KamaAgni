/* KamaAgni "never forget what you can do" layer (v67).
   Research behind it:
   - Recognition over recall: show the options, don't make people remember them (Nielsen heuristic #6).
   - A behaviour needs a prompt at the right moment (Fogg, B = MAP): suggestions appear when a game ends, not as pop-ups.
   - If-then plans ("When X, we'll do Y") roughly double follow-through (Gollwitzer & Sheeran meta-analysis, d = 0.65).
   - Novel shared activities raise desire in long-term couples (Muise et al., 2019): we favour things you haven't tried.
   Everything is stored in ka_* keys, so it syncs between your devices with the rest of your data. */
(function () {
  'use strict';
  var D = document;
  if (window.KA_NEXT) return;
  var me = D.currentScript && D.currentScript.src || '';
  var BASE = me ? me.replace(/js\/ka-next\.js.*$/, '') : (/\/games\//.test(location.pathname) ? '../' : '');
  var PLAN = 'ka_ifthen';
  function rd(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function wr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function slug(u) { var m = String(u || '').match(/([^\/]+)\.html$/); return m ? m[1] : ''; }
  function here() { return slug(location.pathname); }
  function visits() { var a = rd('ka_act', {}) || {}; return a.pages || {}; }
  function catalog(cb) {
    if (window.KA_CATALOG) return cb(window.KA_CATALOG);
    var s = D.createElement('script'); s.src = BASE + 'js/ka-catalog.js';
    s.onload = function () { cb(window.KA_CATALOG || []); }; s.onerror = function () { cb([]); }; D.head.appendChild(s);
  }
  function heatOK(c) { var h = rd('ka_heat', 3); return !c.h || c.h[0] <= h; }
  /* untried first, then least recently used; related (same vibe or tag) ranked higher */
  function suggest(C, cur, n) {
    var v = visits(), me = C.filter(function (c) { return slug(c.u) === cur; })[0];
    var L = C.filter(function (c) { return c.u && slug(c.u) !== cur && heatOK(c) && !/settings|history|about/.test(c.u); });
    var day = new Date(); var seed = day.getFullYear() * 400 + day.getMonth() * 32 + day.getDate();
    L.forEach(function (c, i) {
      var p = v[slug(c.u)], s = 0;
      if (!p) s += 100; else s += Math.min(60, (Date.now() - (p.last || 0)) / 864e5);
      if (me && c.v === me.v) s += 25; if (me && c.tag === me.tag) s += 10;
      s += ((seed + i * 7919) % 13);
      c._s = s;
    });
    return L.sort(function (a, b) { return b._s - a._s; }).slice(0, n);
  }
  function card(c, tried) {
    return '<a class="kn-c" href="' + BASE + c.u + '"><span class="kn-i" aria-hidden="true">' + (c.i || '✨') + '</span><span class="kn-t"><b>' + esc(c.t) + '</b><span>' + esc(c.d || '') + '</span>' +
      (tried ? '' : '<em>Not tried yet</em>') + '</span></a>';
  }
  var css = '.kn-wrap{max-width:760px;margin:26px auto 8px;padding:0 16px}.kn-wrap h2{font-family:"Cormorant Garamond",serif;font-size:24px;margin:0 0 4px;color:#fff}.kn-wrap p.kn-s{color:var(--muted,#9aa3bd);margin:0 0 12px;font-size:14px}' +
    '.kn-g{display:grid;gap:10px}@media(min-width:700px){.kn-g{grid-template-columns:repeat(3,1fr)}}' +
    '.kn-c{display:flex;gap:12px;align-items:flex-start;padding:12px 14px;border-radius:16px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.035);color:inherit;text-decoration:none;min-height:56px}' +
    '.kn-c:hover,.kn-c:focus-visible{border-color:rgba(232,99,122,.6);background:rgba(232,99,122,.08)}.kn-i{font-size:26px;line-height:1.1;flex:none}' +
    '.kn-t b{display:block;font-size:15px;color:#fff}.kn-t span{display:block;font-size:13px;color:var(--muted,#9aa3bd);line-height:1.45;margin-top:2px}.kn-t em{display:inline-block;margin-top:6px;font-style:normal;font-size:12px;font-weight:700;color:#f4a0ae}' +
    '.kn-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.kn-b{min-height:44px;padding:8px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:transparent;color:#fff;font:inherit;font-size:14px;font-weight:700;cursor:pointer}.kn-b.p{background:linear-gradient(135deg,#e8637a,#c94f8a);border:none}' +
    '.kn-pl{display:flex;gap:10px;align-items:center;padding:10px 14px;border-radius:14px;background:rgba(232,99,122,.1);border:1px solid rgba(232,99,122,.35);margin:6px 0}.kn-pl a{color:#fff;font-weight:700;text-decoration:none;flex:1}.kn-pl a span{display:block;font-weight:400;font-size:13px;color:#c3c9dc}.kn-pl.now{background:rgba(240,190,60,.14);border-color:rgba(240,190,60,.55)}' +
    '.kn-pl button{min-width:40px;min-height:40px;border-radius:10px;border:none;background:rgba(255,255,255,.06);color:#fff;cursor:pointer}' +
    '.kn-bar{height:8px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;margin:6px 0 12px}.kn-bar i{display:block;height:100%;background:linear-gradient(90deg,#e8637a,#f3d27a)}' +
    '.kn-dlg{position:fixed;inset:0;z-index:2147483100;background:rgba(5,6,15,.88);display:flex;align-items:center;justify-content:center;padding:18px}.kn-box{background:#12152a;border:1px solid rgba(255,255,255,.14);border-radius:20px;padding:20px;max-width:440px;width:100%;color:#dce9ff}' +
    '.kn-box h3{margin:0 0 4px;font-size:20px;color:#fff}.kn-box label{display:block;font-size:13px;color:var(--muted,#9aa3bd);margin:12px 0 4px}.kn-box select,.kn-box input{width:100%;min-height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:#0b0d1c;color:#fff;font:inherit;padding:8px 10px;box-sizing:border-box}' +
    '.kn-sent{font-family:"Cormorant Garamond",serif;font-size:21px;font-style:italic;margin:14px 0 4px;color:#fff}';
  function style() { if (D.getElementById('kn-css')) return; var s = D.createElement('style'); s.id = 'kn-css'; s.textContent = css; D.head.appendChild(s); }

  var WHEN = [['fri', 'Friday night', 5], ['sat', 'Saturday night', 6], ['sun', 'Sunday morning', 0], ['wed', 'Midweek (Wednesday)', 3], ['date', 'Our next date night', null], ['bed', 'Tonight, after dinner', 'today'], ['custom', 'Something else…', null]];
  function plans() { return rd(PLAN, []) || []; }
  function dueToday(p) { var d = new Date().getDay(); if (p.day === 'today') return new Date(p.at).toDateString() === new Date().toDateString(); return typeof p.day === 'number' && p.day === d; }
  function planDialog(C, pre) {
    style();
    var opts = C.filter(function (c) { return c.u && heatOK(c); });
    var d = D.createElement('div'); d.className = 'kn-dlg'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Make it a plan');
    d.innerHTML = '<div class="kn-box"><h3>📅 Make it a plan</h3>' + (pre && pre.d ? '<div style="margin:4px 0;font-weight:700">' + esc(pre.d) + '</div>' : '') + '<div style="font-size:14px;color:var(--muted,#9aa3bd)">Couples who decide <i>when</i> are far more likely to actually do it. We’ll remind you on the day.</div>' +
      '<label for="kn-w">When…</label><select id="kn-w">' + WHEN.map(function (w) { return '<option value="' + w[0] + '">' + w[1] + '</option>'; }).join('') + '</select>' +
      '<input id="kn-wc" placeholder="e.g. after the kids are asleep on Thursday" style="display:none;margin-top:8px" aria-label="Your own when">' +
      '<label for="kn-a">…we’ll open</label><select id="kn-a">' + opts.map(function (c) { return '<option value="' + esc(c.u) + '"' + (pre && c.u === pre.u ? ' selected' : '') + '>' + (c.i || '') + ' ' + esc(c.t) + '</option>'; }).join('') + '</select>' +
      '<div class="kn-sent" id="kn-s"></div><div class="kn-row"><button class="kn-b p" id="kn-ok">Save our plan</button><button class="kn-b" id="kn-x">Cancel</button></div></div>';
    D.body.appendChild(d);
    var w = d.querySelector('#kn-w'), wc = d.querySelector('#kn-wc'), a = d.querySelector('#kn-a'), s = d.querySelector('#kn-s');
    function txt() { var W = WHEN.filter(function (x) { return x[0] === w.value; })[0]; var c = opts.filter(function (x) { return x.u === a.value; })[0]; wc.style.display = w.value === 'custom' ? '' : 'none'; s.textContent = '“' + (w.value === 'custom' ? (wc.value || 'When…') : W[1]) + ', we’ll ' + (c ? 'open ' + c.t : '…') + '.”'; }
    w.onchange = txt; a.onchange = txt; wc.oninput = txt; txt();
    d.querySelector('#kn-x').onclick = function () { d.remove(); };
    d.addEventListener('click', function (e) { if (e.target === d) d.remove(); });
    d.querySelector('#kn-ok').onclick = function () {
      var W = WHEN.filter(function (x) { return x[0] === w.value; })[0], c = opts.filter(function (x) { return x.u === a.value; })[0];
      if (!c) return;
      var sp = pre && pre.d && pre.href && c.u === pre.u; var L = plans(); L.unshift({ id: Date.now(), u: sp ? pre.href : c.u, t: sp ? c.t + ': ' + pre.d : c.t, i: c.i, when: w.value === 'custom' ? (wc.value.trim() || 'Soon') : W[1], day: W[2], at: Date.now() });
      wr(PLAN, L.slice(0, 12)); d.remove();
      try { window.KA && KA.toast ? KA.toast('Plan saved 📅') : null; } catch (e) {}
      if (window.KA_NEXT && KA_NEXT._home) KA_NEXT._home();
    };
    try { w.focus(); } catch (e) {}
  }

  /* --- end-of-page panel on every game page --- */
  function pagePanel(C) {
    var cur = here(); if (!cur || /^(kamaagni-(settings|history|about|search|progress|week|mission-week)|pdf-viewer)$/.test(cur)) return;
    if (D.getElementById('kn-next')) return;
    var S = suggest(C, cur, 3); if (!S.length) return;
    var v = visits(), meC = C.filter(function (c) { return slug(c.u) === cur; })[0];
    var wrap = D.createElement('section'); wrap.id = 'kn-next'; wrap.className = 'kn-wrap'; wrap.setAttribute('aria-label', 'What next');
    wrap.innerHTML = '<h2>What next?</h2><p class="kn-s">Picked for you, starting with things you haven’t tried. New experiences together keep desire alive.</p><div class="kn-g">' +
      S.map(function (c) { return card(c, !!v[slug(c.u)]); }).join('') + '</div>' +
      '<div class="kn-row"><button class="kn-b" id="kn-plan">📅 Plan ' + (meC ? esc(meC.t) : 'this') + ' for another night</button><a class="kn-b" style="display:inline-flex;align-items:center;text-decoration:none" href="' + BASE + 'play.html">All ' + C.length + ' games</a></div>';
    var ftr = D.getElementById('ka-ftr');
    if (ftr) ftr.parentNode.insertBefore(wrap, ftr); else D.body.appendChild(wrap);
    wrap.querySelector('#kn-plan').onclick = function () { planDialog(C, meC); };
  }

  /* --- home page: plans, untried shelf, explored progress --- */
  function homePanel(C) {
    var dash = D.getElementById('dash'); if (!dash) return;
    var box = D.getElementById('kn-home');
    if (!box) { box = D.createElement('section'); box.id = 'kn-home'; box.className = 'kn-wrap'; box.setAttribute('aria-label', 'Your plans and ideas'); dash.parentNode.insertBefore(box, dash.nextSibling); }
    var v = visits(), all = C.filter(function (c) { return c.u; }), tried = all.filter(function (c) { return v[slug(c.u)]; }).length;
    var P = plans(), due = P.filter(dueToday);
    var untried = all.filter(function (c) { return !v[slug(c.u)] && heatOK(c); });
    var day = new Date(); var seed = day.getFullYear() * 400 + day.getMonth() * 32 + day.getDate();
    var pickU = untried.slice().sort(function (a, b) { return ((seed * 31 + a.t.length * 17) % 97) - ((seed * 31 + b.t.length * 17) % 97); }).slice(0, innerWidth < 600 ? 2 : 4);
    var h = '';
    /* ---- Today: everything that matters today, in one card ---- */
    var T = [], row = function (ic, u, t, sub, now) { return '<div class="kn-pl' + (now ? ' now' : '') + '"><span aria-hidden="true" style="font-size:24px">' + ic + '</span><a href="' + BASE + u + '">' + esc(t) + '<span style="display:block;font-size:13px;font-weight:400;color:#c3c9dc">' + esc(sub) + '</span></a></div>'; };
    /* weekly date night (Our Dates): on the day */
    var dnt = rd('ka_datenight', null);
    if (dnt && dnt.on && dnt.dow === day.getDay()) T.push(row('🌹', 'games/kamaagni-tonight.html', 'Date night tonight' + (dnt.t ? ' at ' + dnt.t : ''), 'Plan it now so you’re both looking forward to it', 1));
    /* morning after: a gentle check-in the day after a session, story or completed plan (js/ka-after.js) */
    var af = rd('ka_after', null), dn = function (t) { var x = new Date(t); return x.getFullYear() * 1e4 + (x.getMonth() + 1) * 100 + x.getDate(); };
    if (af && !af.done && dn(Date.now()) > dn(af.at) && Date.now() - af.at < 3 * 864e5) T.push(row('💗', 'games/kamaagni-afterglow.html', 'How did last night feel?', 'A one-minute check-in about ' + ((af.what || [])[0] || 'your night'), 1));
    /* Continue: the game, story or session you were in the middle of (last 12 hours) */
    var rs = rd('ka_resume', null);
    if (rs && rs.u && Date.now() - (rs.at || 0) < 12 * 36e5) T.push(row('▶️', rs.u, 'Continue: ' + (rs.t || 'where you left off'), rs.s || 'Pick up where you stopped', 1));
    due.forEach(function (p) { T.push(row(p.i || '📅', p.u, p.t, 'Planned for today · ' + (p.when || ''), 1)); });
    var tp = rd('ka_plan', null);
    if (tp && tp.steps && new Date(tp.made).toDateString() === day.toDateString()) { var left = tp.steps.filter(function (x) { return !x.done; }); if (left.length) T.push(row('✨', 'games/kamaagni-tonight.html', 'Tonight’s plan', left.length + ' of ' + tp.steps.length + ' steps left · next: ' + left[0].t, 1)); }
    var DT = (rd('ka_dates', {}) || {}).e || [], t0 = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    DT.forEach(function (e) { var q = (e.d || '').split('-').map(Number); if (q.length < 3) return; var n = e.y ? new Date(t0.getFullYear(), q[1] - 1, q[2]) : new Date(q[0], q[1] - 1, q[2]); if (e.y && n < t0) n = new Date(t0.getFullYear() + 1, q[1] - 1, q[2]); var dd = Math.round((n - t0) / 864e5);
      if (dd >= 0 && dd <= 7) T.push(row(dd ? '🗓️' : '🎉', 'games/kamaagni-dates.html', e.t || 'A special date', dd ? 'In ' + dd + (dd === 1 ? ' day' : ' days') + ' · see ideas' : 'Today! Make it special', !dd)); });
    var ck = rd('ka_checkin', {}) || {}, mo = day.toISOString().slice(0, 7), cm = (ck.m || {})[mo];
    var ckDone = cm && cm.a && cm.a[0] && Object.keys(cm.a[0]).length && cm.a[1] && Object.keys(cm.a[1]).length;
    if (!ckDone && (day.getDate() >= 25 || !Object.keys(ck.m || {}).length && v['kamaagni-together'])) T.push(row('📈', 'games/kamaagni-checkin.html', 'Monthly check-in', cm ? 'Finish this month’s answers' : 'Ten minutes to see how you two are doing'));
    /* New for Us: this month's position, game and skill (games/kamaagni-month.html) */
    var nm = rd('ka_month', null), mo2 = day.toISOString().slice(0, 7);
    if (!nm || nm.m !== mo2 || !(nm.won || {})[mo2]) { var nd = 0, nt = 0; if (nm && nm.m === mo2) { var tp2 = (rd('ka_pos', {}) || {}).tried || {}, dp2 = (rd('ka_playbook', {}) || {}).done || {}, ds2 = rd('ka_skills_done', []) || []; if (nm.pos) { nt++; if (tp2[nm.pos]) nd++; } if (nm.game) { nt++; if (dp2[nm.game]) nd++; } if (nm.skill != null) { nt++; if (ds2.indexOf(nm.skill) >= 0) nd++; } }
      T.push(row('🌟', 'games/kamaagni-month.html', 'New for us this month', nt ? nd + ' of ' + nt + ' done · a badge for all three' : 'A new position, game and skill to try')); }
    var ap = rd('ka_apart', null);
    if (ap && (ap.tz || ap.meet) && !(ap.done || {})[day.toISOString().slice(0, 10)]) T.push(row('🌍', 'games/kamaagni-apart.html', 'Today’s long-distance task', ap.meet ? 'And your countdown to ' + ap.meet : 'One small thing for the two of you'));
    /* Today rows go to the top of Home, inside the "Today, for the two of you" card (falls back to this panel) */
    var top = D.getElementById('ka-today'), tbox = D.getElementById('kn-today');
    if (!tbox) { tbox = D.createElement('div'); tbox.id = 'kn-today'; }
    tbox.innerHTML = T.join(''); tbox.style.marginBottom = T.length ? '12px' : '0';
    if (top) { if (tbox.parentNode !== top) top.insertBefore(tbox, top.children[1] || null); }
    else if (T.length) h += '<h2>Today</h2>';
    if (P.length) {
      h += '<h2 style="margin-top:' + (T.length && !top ? '20px' : '0') + '">Your plans</h2>' + P.slice(0, 4).map(function (p) {
        return '<div class="kn-pl' + (dueToday(p) ? ' now' : '') + '"><span aria-hidden="true" style="font-size:24px">' + (p.i || '📅') + '</span><a href="' + BASE + p.u + '">' + esc(p.t) + '<span>' + (dueToday(p) ? 'Today! ' : '') + esc(p.when) + '</span></a><button data-del="' + p.id + '" aria-label="Remove plan">✕</button></div>';
      }).join('');
    }
    h += '<h2 style="margin-top:' + (P.length || (T.length && !top) ? '20px' : '0') + '">Still to discover</h2><p class="kn-s">You’ve explored <b>' + tried + ' of ' + all.length + '</b> games and tools.</p><div class="kn-bar" role="progressbar" aria-valuenow="' + tried + '" aria-valuemin="0" aria-valuemax="' + all.length + '" aria-label="Explored"><i style="width:' + Math.round(tried / Math.max(1, all.length) * 100) + '%"></i></div>';
    h += pickU.length ? '<div class="kn-g">' + pickU.map(function (c) { return card(c, false); }).join('') + '</div>' : '<p class="kn-s">You’ve tried everything! Revisit an old favourite or write your own cards.</p>';
    h += '<div class="kn-row"><button class="kn-b p" id="kn-hplan">📅 Make a plan</button><a class="kn-b" style="display:inline-flex;align-items:center;text-decoration:none" href="play.html">Browse all</a></div>';
    box.innerHTML = h;
    if (!top) box.insertBefore(tbox, box.querySelector('h2') ? box.querySelector('h2').nextSibling : box.firstChild);
    if (!top) setTimeout(function () { var t2 = D.getElementById('ka-today'); if (t2 && tbox.parentNode !== t2) { t2.insertBefore(tbox, t2.children[1] || null); var hh = box.querySelector('h2'); if (hh && hh.textContent === 'Today') hh.remove(); } }, 600);
    /* invitations or plans from your partner you haven't answered yet (only when linked) */
    try { var KC = window.KA_CLOUD, cs = KC && KC.state && KC.state(); if (cs && cs.couple && cs.couple.partnerJoined && cs.vault === 'ready') KC.couple.list(0).then(function (ev) {
      var R = {}; ev.forEach(function (e) { if (e.kind === 'rsvp' || e.kind === 'veto') R[e.body && e.body.to] = 1; });
      var w = ev.filter(function (e) { return !e.mine && (e.kind === 'inv' || e.kind === 'plan') && !R[e.id] && Date.now() - new Date(e.at).getTime() < 3 * 864e5; });
      var el = D.getElementById('kn-today'); if (!w.length || !el) return;
      el.style.marginBottom = '12px';
      el.insertAdjacentHTML('afterbegin', row('💌', 'games/kamaagni-invite.html', w.length === 1 ? 'An invitation is waiting for you' : w.length + ' invitations are waiting', 'Tap to answer', 1));
    }).catch(function () {}); } catch (e) {}
    box.querySelectorAll('[data-del]').forEach(function (b) { b.onclick = function () { wr(PLAN, plans().filter(function (p) { return String(p.id) !== b.dataset.del; })); homePanel(C); }; });
    box.querySelector('#kn-hplan').onclick = function () { planDialog(C, pickU[0]); };
  }

  /* gentle same-day reminder on any page, once per day */
  function remind() {
    /* weekly date night: one toast on the day */
    try { var dn2 = rd('ka_datenight', null), ds2 = new Date().toDateString(); if (dn2 && dn2.on && dn2.dow === new Date().getDay() && rd('ka_dn_seen', '') !== ds2 && !/kamaagni-(dates|tonight)/.test(location.pathname)) { wr('ka_dn_seen', ds2); setTimeout(function () { try { window.KA && KA.toast && KA.toast('🌹 Date night tonight' + (dn2.t ? ' at ' + dn2.t : '') + '. Plan it in Plan Tonight.'); } catch (e) {} }, 5000); } } catch (e) {}
    /* a special date today (Our Dates): one gentle toast per day */
    try { var td = new Date(), md = '-' + String(td.getMonth() + 1).padStart(2, '0') + '-' + String(td.getDate()).padStart(2, '0'), ds = td.toDateString();
      var hit = ((rd('ka_dates', {}) || {}).e || []).filter(function (e) { return e.y ? (e.d || '').slice(4) === md : e.d === td.getFullYear() + md; })[0];
      if (hit && rd('ka_dates_seen', '') !== ds && !/kamaagni-dates/.test(location.pathname)) { wr('ka_dates_seen', ds); setTimeout(function () { try { window.KA && KA.toast && KA.toast('🎉 Today: ' + (hit.t || 'a special date') + '. Ideas in Our Dates.'); } catch (e) {} }, 3500); } } catch (e) {}
    var due = plans().filter(dueToday); if (!due.length) return;
    var k = 'ka_ifthen_seen', t = new Date().toDateString(); if (rd(k, '') === t) return;
    if (here() && slug(due[0].u) === here()) return;
    wr(k, t);
    setTimeout(function () { try { window.KA && KA.toast && KA.toast('📅 Your plan for today: ' + due[0].t + ' (' + due[0].when + ')'); } catch (e) {} }, 2500);
  }

  function run() {
    style();
    catalog(function (C) {
      if (!C.length) return;
      if (D.getElementById('dash')) { homePanel(C); window.KA_NEXT._home = function () { homePanel(C); }; }
      else pagePanel(C);
      remind();
    });
  }
  /* ---- Smarter "Surprise me" (v79): weighs what you've liked (👍 per game), what you haven't tried, what you
     played very recently (variety), your favourites, the time you have, your mood and this month's lowest check-in
     area, then picks among the best few so it still feels like a surprise. Returns the game plus a short "why". */
  var NOPICK = /kamaagni-(settings|history|search|print|dates|checkin|invite|us|library|week|progress|journal|memories|planner|roadmap|custom|afterglow|health|life-stages|about)\.html|pdf-viewer/;
  var AREA = { close: [/rituals|connection|eight-dates|love-languages|kama-studio/, 'closeness'], desire: [/brakes|fantasy|roleplay|kink|desire/, 'desire'], sex: [/tonight|session|quickies|position|task-deck/, 'your sex life'],
    talk: [/talk|ask-tell|fun|know-me/, 'talking'], wanted: [/love-languages|talk|coupons|secret/, 'feeling wanted'], fun: [/playful/, 'fun together'], calm: [/massage|pamper|rituals|sensory/, 'calm'] };
  function smart(C, o) {
    o = o || {};
    var heat = +rd('ka_heat', 3) || 3, fb = (rd('ka_fb', {}) || {}).pg || {}, act = (rd('ka_act', {}) || {}).pages || {}, favs = rd('ka_favs', []) || [], hidden = (rd('ka_filter', {}) || {}).pages || {};
    var ck = (rd('ka_checkin', {}) || {}).m || {}, mo = Object.keys(ck).sort().pop(), low = null;
    if (mo) { var A = ck[mo].a || [], av = function (k) { var v = [A[0] && A[0][k], A[1] && A[1][k]].filter(function (x) { return x > 0; }); return v.length ? v.reduce(function (p, q) { return p + q; }, 0) / v.length : 0; };
      var ks = Object.keys(AREA).filter(function (k) { return av(k) > 0; }).sort(function (x, y) { return av(x) - av(y); }); if (ks.length > 1 && av(ks[0]) < 3.5) low = ks[0]; }
    var mins = o.mins || 0, now = Date.now();
    var L = (C || []).filter(function (g) { var sl = slug(g.u); return g.u && !NOPICK.test(g.u) && !hidden[sl] && (!g.h || g.h[0] <= heat) && (!o.exclude || g.id !== o.exclude) && (!o.mood || o.mood === 'any' || g.v === o.mood); });
    if (!L.length) return null;
    var sc = L.map(function (g) {
      var sl = slug(g.u), a = act[sl], why = [], s = Math.random() * 3.5;
      var likes = (fb[sl] && fb[sl].u) || 0, nope = (fb[sl] && fb[sl].d) || 0;
      if (likes) { s += Math.min(6, likes * 2); why.push([likes * 2, 'you’ve loved cards in it']); }
      if (nope) s -= Math.min(4, nope * 1.5);
      if (!a) { s += 1.5; why.push([1.5, 'you haven’t tried it yet']); }
      else if (now - (a.last || 0) < 2 * 864e5) s -= 3;
      else if (a.n >= 3) { s += 1; why.push([1, 'it’s one you come back to']); }
      if (favs.some(function (f) { return f.u && f.u.indexOf(sl + '.html') >= 0; })) { s += 2; why.push([2, 'it’s in your favourites']); }
      if (mins && g.m && g.m > mins) s -= 3;
      if (o.mood && o.mood !== 'any' && g.v === o.mood) s += 1;
      if (low && (AREA[low][0].test(g.u) || AREA[low][0].test(g.v || ''))) { s += 3; why.push([3, AREA[low][1] + ' was your lowest this month']); }
      why.sort(function (x, y) { return y[0] - x[0]; });
      return { g: g, s: s, why: why.length ? 'Picked because ' + why[0][1] + '.' : '' };
    }).sort(function (x, y) { return y.s - x.s; });
    var top = sc.slice(0, Math.min(9, sc.length)), tw = top.reduce(function (p, x) { return p + Math.max(.5, x.s); }, 0), r = Math.random() * tw;
    for (var i = 0; i < top.length; i++) { r -= Math.max(.5, top[i].s); if (r <= 0) return top[i]; }
    return top[0];
  }
  /* after a Surprise me jump: say why this one was picked */
  try { var sw = sessionStorage.getItem('ka_surprise_why'); if (sw !== null) { sessionStorage.removeItem('ka_surprise_why'); if (sw) setTimeout(function () { try { window.KA && KA.toast && KA.toast('🎲 ' + sw); } catch (e) {} }, 1200); } } catch (e) {}
  window.KA_NEXT = { smart: smart, plan: function (pre) { catalog(function (C) { planDialog(C, pre); }); }, plans: plans };
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', function () { setTimeout(run, 600); }); else setTimeout(run, 600);
})();
