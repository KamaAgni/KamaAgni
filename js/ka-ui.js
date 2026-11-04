/* KA_UI: shared building blocks for KamaAgni games (setup screen, guide overlay, flip card, timer ring, status bar). */
(function () {
  'use strict';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  function LSget(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function LSset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function heat() { var h = LSget('ka_heat', 3); return h >= 1 && h <= 3 ? h : 3; }
  function tick(n) { window.KA_MOTION && KA_MOTION.tick(n); }

  /* ---------- guide overlay ---------- */
  function guide(title, html) {
    var g = document.getElementById('kd-guide'); if (g) g.remove();
    g = document.createElement('div'); g.id = 'kd-guide'; g.setAttribute('role', 'dialog'); g.setAttribute('aria-label', 'How to play');
    g.innerHTML = '<div class="kd-gin"><button class="kd-gx" aria-label="Close">✕</button><h2>' + esc(title) + '</h2>' + html + '<button class="kx-btn gold" style="margin-top:16px" id="kd-gc">Got it</button></div>';
    document.body.appendChild(g); document.body.style.overflow = 'hidden';
    var close = function () { g.remove(); document.body.style.overflow = ''; };
    g.querySelector('.kd-gx').onclick = close; g.querySelector('#kd-gc').onclick = close; g.onclick = function (e) { if (e.target === g) close(); };
  }

  /* ---------- setup screen ----------
     cfg: {id,title,sub,icon,modes:['one','two'],duo,cats:[{id,l,i,n,h}],catsLabel,extras:[{id,label,opts:[[v,label]],def}],guideTitle,guide,start(opts),note} */
  function setup(app, cfg) {
    var saved = LSget('ka_setup_' + cfg.id, {}) || {};
    var mode = saved.mode === 'two' && cfg.duo && cfg.duo.linked() ? 'two' : 'one';
    var sel = new Set((saved.cats && saved.cats.length ? saved.cats : cfg.cats.map(function (c) { return c.id; })).filter(function (id) { return cfg.cats.some(function (c) { return c.id === id; }); }));
    if (!sel.size) cfg.cats.forEach(function (c) { sel.add(c.id); });
    var ex = Object.assign({}, (cfg.extras || []).reduce(function (a, e) { a[e.id] = e.def; return a; }, {}), saved.extras || {});
    var canTwo = cfg.modes.indexOf('two') >= 0, linked = cfg.duo && cfg.duo.linked();
    function draw() {
      var h = heat();
      app.innerHTML = '<h1 class="kx-title"><span>' + esc(cfg.title) + '</span></h1><p class="kx-sub">' + esc(cfg.sub || '') + '</p>' +
        '<div class="kx-card kd-setup" data-nofx="1">' +
        (canTwo ? '<div class="kx-sec" style="margin-top:0">How do you want to play?</div><div class="kd-modes"><button type="button" data-m="one" class="' + (mode === 'one' ? 'on' : '') + '"><b>📱 One phone</b><span>Share this phone and take turns.</span></button>' +
          '<button type="button" data-m="two" class="' + (mode === 'two' ? 'on' : '') + '" ' + (linked ? '' : 'disabled') + '><b>📱📱 Two phones</b><span>' + (linked ? 'Each on your own phone, live. Your partner joins by themselves.' : 'Needs a linked partner. Link once in Together.') + '</span></button></div>' +
          (linked ? '' : '<p class="kx-note" style="margin-top:6px"><a href="kamaagni-together.html" style="color:var(--kv-rose2)">Open Together to link</a></p>') : '') +
        '<div class="kx-sec">Heat level</div><div id="kd-heat"></div>' +
        '<div class="kx-sec">' + esc(cfg.catsLabel || 'Categories') + ' <span class="kd-all"><button type="button" id="kd-on">All</button><button type="button" id="kd-off">None</button></span></div>' +
        '<div class="kd-cats">' + cfg.cats.map(function (c, ci) { var dis = c.h > h; var gh = c.g && (ci === 0 || cfg.cats[ci - 1].g !== c.g) ? '<div class="kd-grp">' + esc(c.g) + '</div>' : ''; return gh + '<button type="button" class="kd-cat ' + (sel.has(c.id) && !dis ? 'on' : '') + '" data-c="' + c.id + '" ' + (dis ? 'disabled title="Needs a higher heat level"' : '') + '><span class="i">' + (c.i || '•') + '</span><b>' + esc(c.l) + '</b>' + (c.n ? '<em>' + c.n + '</em>' : '') + '</button>'; }).join('') + '</div>' +
        (cfg.extras || []).map(function (e) { return '<div class="kx-sec">' + esc(e.label) + '</div><div class="kd-opts" data-x="' + e.id + '">' + e.opts.map(function (o) { return '<button type="button" data-v="' + esc(o[0]) + '" class="' + (String(ex[e.id]) === String(o[0]) ? 'on' : '') + '">' + esc(o[1]) + '</button>'; }).join('') + '</div>'; }).join('') +
        '<div class="kx-row kd-start" style="margin-top:20px"><button class="kx-btn gold" id="kd-go">' + esc(cfg.startLabel || 'Start') + '</button>' + (cfg.guide ? '<button class="kx-btn ghost" id="kd-gd">📖 How to play</button>' : '') + '</div>' +
        (cfg.note ? '<p class="kx-note">' + esc(cfg.note) + '</p>' : '') + '</div>';
      window.KX && KX.heatBar(document.getElementById('kd-heat'), function () { draw(); });
      app.querySelectorAll('[data-m]').forEach(function (b) { b.onclick = function () { if (b.disabled) return; mode = b.dataset.m; draw(); }; });
      app.querySelectorAll('[data-c]').forEach(function (b) { b.onclick = function () { if (b.disabled) return; var id = b.dataset.c; if (sel.has(id)) sel.delete(id); else sel.add(id); b.classList.toggle('on'); tick(); }; });
      document.getElementById('kd-on').onclick = function () { cfg.cats.forEach(function (c) { if (c.h <= heat()) sel.add(c.id); }); draw(); };
      document.getElementById('kd-off').onclick = function () { sel.clear(); draw(); };
      app.querySelectorAll('[data-x] button').forEach(function (b) { b.onclick = function () { var id = b.parentElement.dataset.x; ex[id] = b.dataset.v; b.parentElement.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); }); tick(); }; });
      if (cfg.guide) document.getElementById('kd-gd').onclick = function () { guide(cfg.guideTitle || 'How to play', cfg.guide); };
      document.getElementById('kd-go').onclick = function () {
        var cats = cfg.cats.filter(function (c) { return sel.has(c.id) && c.h <= heat(); }).map(function (c) { return c.id; });
        if (!cats.length) return window.KX && KX.toast('Pick at least one category');
        if (mode === 'two' && !linked) return window.KX && KX.toast('Link with your partner in Together first');
        LSset('ka_setup_' + cfg.id, { mode: mode, cats: cats, extras: ex });
        cfg.start({ mode: mode, heat: heat(), cats: cats, extras: ex });
      };
    }
    draw();
  }

  /* status bar with guide + end buttons */
  function bar(chips, o) {
    return '<div class="kd-bar">' + chips.map(function (c) { return '<span class="kx-chip ' + (c[1] || '') + '">' + c[0] + '</span>'; }).join('') +
      (o && o.guide ? '<button class="kx-chip kd-b" data-kd="guide">📖 Guide</button>' : '') + (o && o.quit ? '<button class="kx-chip kd-b" data-kd="quit">✕ End game</button>' : '') + '</div>';
  }
  function bindBar(root, o) {
    root.querySelectorAll('[data-kd]').forEach(function (b) { b.onclick = function () { if (b.dataset.kd === 'guide' && o.guide) guide(o.guideTitle || 'How to play', o.guide); else if (b.dataset.kd === 'quit' && o.quit) { if (confirm('End this game' + (o.two ? ' for both players' : '') + '?')) o.quit(); } }; });
  }

  /* 3D flip card: returns html. Add class 'back' (via flip()) to reveal. */
  function card(front, back, cls) { return '<div class="kd-fc ' + (cls || '') + '"><div class="kd-fi"><div class="kd-ff">' + front + '</div><div class="kd-fb">' + back + '</div></div></div>'; }
  function flip(host, delay) { var fc = host.querySelector('.kd-fc'); if (!fc) return; var r = window.KA_MOTION && KA_MOTION.reduced; setTimeout(function () { fc.classList.add('back'); if (window.KA_FX && KA_FX.clack) try { KA_FX.clack(); } catch (e) {} tick(10); }, r ? 0 : (delay == null ? 250 : delay)); }

  /* countdown ring: timer(el, seconds, onDone) */
  function timer(el, secs, done, opts) {
    var R = 38, L = 2 * Math.PI * R, t = secs, id = 0, run = false;
    el.innerHTML = '<div class="kd-ring"><svg viewBox="0 0 90 90"><circle cx="45" cy="45" r="' + R + '" class="bg"/><circle cx="45" cy="45" r="' + R + '" class="fg" stroke-dasharray="' + L + '" stroke-dashoffset="0"/></svg><b>' + t + '</b></div><button class="kx-btn ghost sm" type="button">▶ Start timer</button>';
    var fg = el.querySelector('.fg'), num = el.querySelector('b'), btn = el.querySelector('button');
    function draw() { num.textContent = t; fg.style.strokeDashoffset = String(L * (1 - t / secs)); }
    btn.onclick = function () {
      if (run) { clearInterval(id); run = false; btn.textContent = '▶ Resume'; return; }
      run = true; btn.textContent = '⏸ Pause'; tick();
      id = setInterval(function () { t--; draw(); if (t <= 0) { clearInterval(id); run = false; btn.textContent = '↺ Again'; t = secs; tick(40); window.KA_MOTION && KA_MOTION.burst({ kind: 'embers', n: 20 }); done && done(); setTimeout(draw, 600); } }, 1000);
    };
    var stopLead = window.KA_AUTO ? KA_AUTO.lead(btn, (opts && opts.text) || '') : function () {};
    var re = document.createElement('button'); re.type = 'button'; re.className = 'kx-btn ghost sm'; re.textContent = '↺ Start over'; re.style.marginLeft = '6px'; btn.parentNode.appendChild(re);
    re.onclick = function () { clearInterval(id); run = false; t = secs; draw(); btn.textContent = '▶ Start timer'; stopLead(); stopLead = window.KA_AUTO ? KA_AUTO.lead(btn, (opts && opts.text) || '') : function () {}; };
    return function () { clearInterval(id); stopLead(); };
  }
  function parseSecs(text) { var m = /\((\d+)\s*(sec|s|seconds|min|minutes|m)\b/i.exec(text) || /\bfor\s+(\d+)\s*(seconds?|secs?|minutes?|mins?)\b/i.exec(text) || /\b(\d+)\s*(seconds?|minutes?|mins?)\b/i.exec(text); if (!m) return 0; var n = +m[1], u = m[2].toLowerCase(); n = /^m/.test(u) ? n * 60 : n; return n >= 10 && n <= 600 ? n : 0; }

  window.KA_UI = { setup: setup, guide: guide, bar: bar, bindBar: bindBar, card: card, flip: flip, timer: timer, parseSecs: parseSecs, esc: esc, heat: heat };
})();
