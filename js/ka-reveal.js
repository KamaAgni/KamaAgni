/* KA_REVEAL: "both answer privately, then reveal" party-game engine. Powers Would You Prefer and Never Have I Ever.
   One phone: hand-over screens. Two phones: both answer at the same time on their own phone, reveal when both are in. */
(function () {
  'use strict';
  var U = window.KA_UI, esc = U.esc;
  function LSget(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  /* cfg: {id,key,g,title,sub,icon,deckUrl,card(item)->{q,opts:[a,b]},same,diff,scoreLabel,guide,guideTitle,note,startLabel} */
  function run(app, cfg) {
    var DECK = null, S = null, pool = [], pi = 0, cover = null; /* cover = player index who must tap to reveal (one phone) */
    var D = KA_DUO.init({
      g: cfg.g, key: cfg.key, get: function () { return S; },
      onState: function (st) { S = st; render(); }, onQuit: function () { S = null; render(); }, onLink: function () { if (!S) render(); },
      merge: function (cur, st) {
        if (st.n < cur.n) return null; if (st.n > cur.n) return st;
        var m = JSON.parse(JSON.stringify(cur)), ch = false;
        for (var i = 0; i < 2; i++) if (m.ans[i] == null && st.ans[i] != null) { m.ans[i] = st.ans[i]; ch = true; }
        if (m.phase === 'ask' && m.ans[0] != null && m.ans[1] != null) { m.phase = 'reveal'; ch = true; }
        if (st.phase === 'end' && m.phase !== 'end') { m.phase = 'end'; ch = true; }
        if (ch) { m.seq = Math.max(cur.seq || 0, st.seq || 0); recordHist(m); }
        return ch ? m : null;
      }
    });
    var two = function () { return !!(S && S.mode === 'two'); };
    var KNOW = !!cfg.know, pend = null;
    function optsOf(c) { return cfg.who ? D.names(S) : c.opts; }
    var names = function () { return D.names(S); };
    function recordHist(st) { if (st.phase === 'reveal' && !st.hist[st.n]) st.hist[st.n] = { q: st.card.q, o: cfg.who ? D.names(S) : st.card.opts, a: st.ans.slice(), c: st.card.c }; }
    function own(a) { return KNOW ? a % 10 : a; } function gs(a) { return Math.floor(a / 10); }
    function rights(st) { var r = [0, 0], t = 0; st.hist.forEach(function (h) { if (h) { t++; if (gs(h.a[0]) === own(h.a[1])) r[0]++; if (gs(h.a[1]) === own(h.a[0])) r[1]++; } }); return [r, t]; }
    function matches(st) { if (KNOW) { var q = rights(st); return [q[0][0] + q[0][1], q[1] * 2]; } var m = 0, t = 0; st.hist.forEach(function (h) { if (h) { t++; if (h.a[0] === h.a[1]) m++; } }); return [m, t]; }
    function build() {
      var sel = new Set(S.cats), out = [];
      DECK.cats.forEach(function (c) { if (!sel.has(c.id) || c.h > S.heat) return; (DECK.items[c.id] || []).forEach(function (it, i) { var cd = cfg.card(it); cd.c = c.l; cd.h = c.h; cd.k = c.id + ':' + i; out.push(cd); }); });
      pool = shuffle(out); pi = 0;
    }
    function nextCard() {
      if (!pool.length) build();
      if (!pool.length) return { q: 'No cards left. Turn on more categories.', opts: ['OK', 'OK'], c: '', h: 1 };
      if (pi >= pool.length) { pool = shuffle(pool); pi = 0; }
      return pool[pi++];
    }
    function start(o) {
      S = { mode: o.mode, gid: Date.now(), seq: 0, phase: 'ask', n: 0, cats: o.cats, heat: o.heat, total: o.extras.len === 'free' ? 0 : +o.extras.len, ans: [null, null], hist: [], card: null };
      D.setMe(0); build(); S.card = nextCard(); cover = S.mode === 'one' ? 0 : null; D.save(S); render();
    }
    function setup() {
      KA_UI.setup(app, {
        id: cfg.id, title: cfg.title, sub: cfg.sub, modes: ['one', 'two'], duo: D, catsLabel: 'Card categories', cats: DECK.cats.map(function (c) { return { id: c.id, l: c.l, i: c.i, n: c.n, h: c.h }; }),
        extras: [{ id: 'len', label: 'How many cards?', def: 'free', opts: [['free', 'Free play'], ['10', '10 cards'], ['20', '20 cards'], ['40', '40 cards']] }],
        startLabel: cfg.startLabel || 'Start', guideTitle: cfg.guideTitle, guide: cfg.guide, start: start, note: cfg.note
      });
    }
    function bar() {
      var m = matches(S), n = S.n + (S.phase === 'ask' ? 1 : 1);
      return U.bar([['Card ' + (S.n + 1) + (S.total ? '/' + S.total : ''), ''], [cfg.scoreLabel + ' ' + m[0] + '/' + m[1], 'h2'], two() ? ['📱📱 Two phones', 'h1'] : ['', '']].filter(function (x) { return x[0]; }), { guide: true, quit: true });
    }
    function head() { return '<h1 class="kx-title"><span>' + esc(cfg.title) + '</span></h1>'; }
    function bindCommon() { U.bindBar(app, { guide: cfg.guide, guideTitle: cfg.guideTitle, two: two(), quit: function () { D.quit(S); S = null; cover = null; render(); } }); }

    function render() {
      if (!DECK) return;
      if (!S) return setup();
      if (!pool.length) build();
      if (S.phase === 'end') return endView();
      var n = names(), c = S.card, me = two() ? D.me : (cover == null ? (S.ans[0] == null ? 0 : 1) : cover);
      if (S.phase === 'ask') {
        if (!two() && cover != null && S.ans[cover] == null && !S.shown) {
          app.innerHTML = head() + bar() + '<div class="kx-card" data-nofx="1" style="text-align:center"><div class="kx-turn">Private answer</div><div class="kx-big" style="margin:12px auto">Pass the phone to ' + esc(n[cover]) + '</div><p class="kx-muted">Answer honestly. Your partner will not see it until both of you have answered.</p><button class="kx-btn gold" id="rv">I am ' + esc(n[cover]) + ', show me</button></div>';
          bindCommon(); document.getElementById('rv').onclick = function () { S.shown = true; render(); }; return;
        }
        var mineDone = S.ans[me] != null;
        if (two() && mineDone) {
          app.innerHTML = head() + bar() + '<div class="kx-card" data-nofx="1" style="text-align:center"><div class="kx-turn">Locked in</div><div class="kx-big" style="margin:12px auto">Waiting for ' + esc(n[1 - me]) + '…</div><p class="kx-muted">Your answer is hidden until they choose.</p></div>';
          bindCommon(); return;
        }
        app.innerHTML = head() + bar() + '<div class="kx-card" data-nofx="1" style="text-align:center"><div class="kx-turn">' + esc(n[me]) + (two() ? ', your pick' : '') + '</div>' +
          U.card('<span>' + cfg.icon + '</span>', '<span class="kx-chip h' + c.h + '">' + esc(c.c) + '</span><div class="kx-big" style="font-size:' + (c.q.length > 70 ? '19px' : '22px') + '">' + esc(c.q) + '</div>', 'tone-' + c.h) +
          '<div class="kd-opts2">' + optsOf(c).map(function (o, i) { return '<button class="kx-opt" data-a="' + i + '">' + esc(o) + '</button>'; }).join('<div class="kx-or">' + (cfg.or || 'OR') + '</div>') + '</div></div>';
        bindCommon(); U.flip(app, 100);
        app.querySelectorAll('[data-a]').forEach(function (b) { b.onclick = function () {
          if (KNOW) { if (pend == null) { pend = +b.dataset.a; render(); return; } S.ans[me] = pend + 10 * (+b.dataset.a); pend = null; } else S.ans[me] = +b.dataset.a;
          if (!two()) { S.shown = false; if (S.ans[0] != null && S.ans[1] != null) { S.phase = 'reveal'; recordHist(S); cover = null; } else cover = 1 - me; D.save(S); render(); return; }
          if (S.ans[0] != null && S.ans[1] != null) { S.phase = 'reveal'; recordHist(S); }
          D.save(S); render();
        }; });
        return;
      }
      /* reveal */
      var a = S.ans, host = !two() || D.me === 0, oc = optsOf(c), same, boxes, verdict, sub;
      if (KNOW) {
        var ok = [gs(a[0]) === own(a[1]), gs(a[1]) === own(a[0])]; same = ok[0] && ok[1];
        boxes = [0, 1].map(function (i) { return '<div class="kd-rv ' + (ok[i] ? 'same' : '') + '"><span class="kx-turn">' + esc(n[i]) + '</span><b>' + esc(oc[own(a[i])]) + '</b><span class="kx-muted" style="font-size:12px">guessed ' + esc(n[1 - i]) + ': ' + esc(oc[gs(a[i])]) + ' ' + (ok[i] ? '✅' : '❌') + '</span></div>'; }).join('');
        verdict = same ? cfg.same : (ok[0] || ok[1] ? cfg.half || '😏 One of you knows the other well.' : cfg.diff); sub = same ? '' : cfg.ask || 'Tell each other why.';
      } else {
        same = a[0] === a[1];
        boxes = [0, 1].map(function (i) { return '<div class="kd-rv ' + (same ? 'same' : '') + '"><span class="kx-turn">' + esc(n[i]) + '</span><b>' + esc(oc[a[i]]) + '</b></div>'; }).join('');
        verdict = same ? cfg.same : cfg.diff; sub = same ? '' : cfg.ask || 'Ask each other why.';
      }
      app.innerHTML = head() + bar() + '<div class="kx-card" data-nofx="1" style="text-align:center"><div class="kx-big" style="font-size:19px;margin-bottom:10px">' + esc(c.q) + '</div>' +
        '<div class="kd-rev">' + boxes + '</div>' +
        '<div class="kx-big" style="font-size:22px;margin:14px auto 4px">' + verdict + '</div><p class="kx-muted">' + sub + '</p>' +
        '<div class="kd-pass">' + (host ? '<button class="kx-btn gold" id="nx">' + (S.total && S.n + 1 >= S.total ? 'See results' : 'Next card') + '</button>' : '<span class="kx-muted">Waiting for ' + esc(n[0]) + ' to continue…</span>') + '<button class="kx-btn ghost" id="sv">♡ Save</button></div></div>';
      bindCommon();
      if (same) window.KA_MOTION && KA_MOTION.burst({ kind: 'hearts', n: 22, y: innerHeight * .35 });
      document.getElementById('sv').onclick = function (e) { KX.fav('cards', c.q + ' — ' + oc.join(' / ')); e.target.textContent = '♥ Saved'; };
      var nx = document.getElementById('nx');
      if (nx) nx.onclick = function () {
        try { KA_TRACK.log('play', cfg.title, c.q.slice(0, 70)); } catch (e) {}
        if (S.total && S.n + 1 >= S.total) { S.phase = 'end'; D.save(S); return render(); }
        S.n++; S.ans = [null, null]; S.phase = 'ask'; S.card = nextCard(); S.shown = false; cover = two() ? null : 0; D.save(S); render();
      };
    }
    function endView() {
      var rk = KNOW ? rights(S) : null, m = matches(S), pct = m[1] ? Math.round(m[0] / m[1] * 100) : 0, diff = KNOW ? [] : S.hist.filter(function (h) { return h && h.a[0] !== h.a[1]; }).slice(-6), n = names();
      app.innerHTML = head() + '<div class="kx-card" data-nofx="1" style="text-align:center"><div class="kx-turn">Results</div><div class="kx-big" style="margin:8px auto;font-size:42px">' + pct + '%</div><p class="kx-muted">' + m[0] + ' of ' + m[1] + ' ' + esc(cfg.scoreLabel.toLowerCase()) + '. ' + (KNOW ? (rk[0][0] === rk[0][1] ? 'A tie! You know each other equally well. 💞' : esc(n[rk[0][0] > rk[0][1] ? 0 : 1]) + ' knows their partner best: ' + Math.max(rk[0][0], rk[0][1]) + ' vs ' + Math.min(rk[0][0], rk[0][1]) + '. 🏆') : pct >= 70 ? 'You two are in sync. 💞' : pct >= 40 ? 'A nice mix of alike and different. 😏' : 'Opposites attract. Lots to talk about. 🔥') + '</p>' +
        (diff.length ? '<div class="kx-sec">Worth a chat</div><div class="kx-list" style="text-align:left">' + diff.map(function (h) { return '<div class="kx-item"><span class="kx-it"><b>' + esc(h.q) + '</b><br><span class="kx-muted">' + esc(n[0]) + ': ' + esc(h.o[h.a[0]]) + ' · ' + esc(n[1]) + ': ' + esc(h.o[h.a[1]]) + '</span></span></div>'; }).join('') + '</div>' : '') +
        '<div class="kx-row" style="justify-content:center;margin-top:16px"><button class="kx-btn gold" id="ag">Play again</button><a class="kx-btn ghost" href="../play.html">More games</a></div></div>';
      window.KA_MOTION && KA_MOTION.burst({ kind: 'confetti', n: 50 });
      document.getElementById('ag').onclick = function () { D.clear(); S = null; render(); };
    }
    S = D.load(); if (S && !S.hist) S = null;
    fetch(cfg.deckUrl).then(function (r) { return r.json(); }).then(function (d) { DECK = d; render(); }, function () { app.innerHTML = '<div class="kx-card">Could not load the cards. Open this page from your hosted site.</div>'; });
  }
  window.KA_REVEAL = { run: run };
})();
