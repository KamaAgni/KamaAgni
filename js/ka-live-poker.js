/* Live two-phone layer + setup pickers for the original Poker game. Loaded after the page script. */
(function () {
  'use strict';
  if (typeof S === 'undefined' || typeof render !== 'function' || !window.KA_DUO) return;
  var L = null, applying = false, doc = document;
  var D = KA_DUO.init({ g: 'poker', key: 'ka_poker_duo', get: function () { return L; },
    onState: function (m) { L = m; applying = true; try { S = JSON.parse(JSON.stringify(m.snap)); } catch (e) {} window.render(); applying = false; },
    onQuit: function () { L = null; S = null; window.render(); }, onLink: function () {} });
  L = D.load(); if (L && L.mode !== 'two') L = null;
  var _render = render, _init = initGame;
  var CFG = { len: 'classic', clothes: 5, heat: (window.KX && KX.heat) ? KX.heat() : 2, strip: true, bet: true };
  window.PK_ME = function () { return L ? D.me : null; };
  var ORDERS = { quick: ['strip', 'cuddle', 'hot', 'climax'], classic: ['strip', 'strip', 'cuddle', 'nude', 'hot', 'hot', 'lust', 'climax'], slow: ['cuddle', 'strip', 'cuddle', 'strip', 'hot', 'cuddle', 'nude', 'hot', 'hot', 'cuddle', 'lust', 'climax'] };
  var ORIG = JSON.parse(JSON.stringify(REWARD_CONTENT));
  function applyCfg() {
    var ord = ORDERS[CFG.len].slice();
    if (!CFG.strip) ord = ord.map(function (t) { return t === 'strip' || t === 'nude' ? 'cuddle' : t; });
    if (CFG.heat <= 1) ord = ord.map(function (t) { return t === 'hot' || t === 'lust' ? 'cuddle' : t; });
    REWARD_ORDER.length = 0; ord.forEach(function (t) { REWARD_ORDER.push(t); });
    Object.keys(ORIG).forEach(function (k) { REWARD_CONTENT[k] = ORIG[k].slice(); });
    if (CFG.heat <= 1) REWARD_CONTENT.climax = ['End with a long, slow kiss and a big hug. You both won tonight.', 'Share a warm cuddle and tell each other your favourite moment of the game.', 'Dance one slow song together to finish the night.', 'Give each other a three-minute massage to finish.'];
    if (window.KA_FILTER) Object.keys(REWARD_CONTENT).forEach(function (k) { var f = KA_FILTER.keep(REWARD_CONTENT[k]); if (f && f.length) REWARD_CONTENT[k] = f; });
  }
  window.initGame = function (a, b, f) { applyCfg(); PK.bet = !!CFG.bet; PK.strip = !!CFG.strip; PK.heat = CFG.heat; _init(a, b, f); S.players[0].clothes = S.players[1].clothes = CFG.clothes; if (L) { L.gid = L.gid; } };
  function pub() { if (!L || applying || !S) return; try { L.snap = JSON.parse(JSON.stringify(S)); D.save(L); } catch (e) {} }
  function panel(html) { var d = doc.createElement('div'); d.className = 'panel'; d.innerHTML = html; return d; }
  function wait(msg) { var a = doc.getElementById('app'); a.appendChild(panel('<div class="badge">Two phones</div><div class="icon">⏳</div><h2>' + msg + '</h2><p class="muted">Your screen updates by itself.</p>')); }
  var GATES = { 'exchange1-nondealer-gate': 'nd', 'exchange1-dealer-gate': 'd', 'exchange2-nondealer-gate': 'nd', 'exchange2-dealer-gate': 'd' };
  var EX = { 'exchange1-nondealer': 'nd', 'exchange1-dealer': 'd', 'exchange2-nondealer': 'nd', 'exchange2-dealer': 'd' };
  var who = function (k) { return k === 'nd' ? nonDealer() : S.dealer; };
  window.render = function () {
    if (!L || !S) { _render(); if (!S) setupExtras(); return; }
    var me = D.me;
    if (GATES[S.phase]) { if (who(GATES[S.phase]) === me) { S.phase = S.phase.replace('-gate', ''); pub(); return window.render(); } pub(); _render(); trimGate(); return; }
    var ac = actorOf(S.phase); if (ac != null && ac !== me) { pub(); var a2 = doc.getElementById('app'); a2.innerHTML = ''; a2.appendChild(logo()); a2.appendChild(agniTrack()); wait('Waiting for ' + S.players[ac].name + ' to decide'); return; }
    if (EX[S.phase] && who(EX[S.phase]) !== me) { pub(); var a = doc.getElementById('app'); a.innerHTML = ''; a.appendChild(logo()); a.appendChild(agniTrack()); wait('Waiting for ' + S.players[who(EX[S.phase])].name + ' to choose cards'); return; }
    pub(); _render(); addTop();
    if (S.phase === 'reward') { var r = S.currentReward; if (r && me !== 1 - r.who) { [].forEach.call(doc.querySelectorAll('.btn-ghost'), function (b) { if (/Bail/.test(b.textContent)) b.remove(); }); } }
  };
  function trimGate() { var a = doc.getElementById('app'); a.innerHTML = ''; a.appendChild(logo()); a.appendChild(agniTrack()); wait('Waiting for ' + S.players[who(GATES[S.phase])].name); }
  function addTop() { var a = doc.getElementById('app'); var b = doc.createElement('button'); b.className = 'btn-ghost'; b.textContent = '📱📱 Live · stop'; b.style.cssText = 'width:100%;margin-top:14px'; b.onclick = function () { D.quit(L); L = null; window.render(); }; a.appendChild(b); }
  function chips(id, opts, cur) { return '<div id="' + id + '" style="display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 12px">' + opts.map(function (o) { return '<button type="button" class="btn-ghost" data-v="' + o[0] + '" style="flex:1;min-width:90px;' + (String(o[0]) === String(cur) ? 'border-color:#ff6a2b;color:#ffb84d' : '') + '">' + o[1] + '</button>'; }).join('') + '</div>'; }
  function setupExtras() {
    var a = doc.getElementById('app'), st = a.querySelector('#startBtn'); if (!st) return;
    var p = panel('<div class="eyebrow">Game options</div><label>How long should it run?</label>' + chips('c-len', [['quick', 'Quick (4)'], ['classic', 'Classic (8)'], ['slow', 'Slow burn (12)']], CFG.len) +
      '<label>Heat level</label>' + chips('c-heat', [[1, '🌸 Sweet'], [2, '🔥 Spicy'], [3, '🌋 Wild']], CFG.heat) + '<label>Clothing items each</label>' + chips('c-cl', [[3, '3'], [5, '5'], [7, '7']], CFG.clothes) + '<label>Chips and stakes</label>' + chips('c-bet', [[1, '🪙 Chips + markers'], [0, 'Classic draw only']], CFG.bet ? 1 : 0) + '<label>Clothes come off?</label>' + chips('c-st', [[1, 'Yes'], [0, 'No, keep clothes on']], CFG.strip ? 1 : 0) +
      '<label>Where are you playing?</label>' + chips('c-mode', [['one', '📱 One phone'], ['two', '📱📱 Two phones']], L ? 'two' : 'one'));
    st.parentNode.parentNode.insertBefore(p, st.parentNode);
    function bind(id, key, num) { [].forEach.call(p.querySelectorAll('#' + id + ' button'), function (b) { b.onclick = function () { var v = b.dataset.v; CFG[key] = num ? +v : v; if (key === 'strip') CFG.strip = v === '1'; if (key === 'bet') CFG.bet = v === '1'; [].forEach.call(p.querySelectorAll('#' + id + ' button'), function (x) { x.style.borderColor = ''; x.style.color = ''; }); b.style.borderColor = '#ff6a2b'; b.style.color = '#ffb84d'; }; }); }
    bind('c-len', 'len'); bind('c-heat', 'heat', 1); bind('c-cl', 'clothes', 1); bind('c-st', 'strip'); bind('c-bet', 'bet');
    [].forEach.call(p.querySelectorAll('#c-mode button'), function (b) { b.onclick = function () {
      [].forEach.call(p.querySelectorAll('#c-mode button'), function (x) { x.style.borderColor = ''; x.style.color = ''; }); b.style.borderColor = '#ff6a2b'; b.style.color = '#ffb84d';
      if (b.dataset.v === 'two') { if (!D.linked()) { if (window.KX) KX.toast('Link your partner in Together first'); [].forEach.call(p.querySelectorAll('#c-mode button'), function (x, i) { if (i === 0) { x.style.borderColor = '#ff6a2b'; x.style.color = '#ffb84d'; } else { x.style.borderColor = ''; x.style.color = ''; } }); return; } if (!L) { L = { mode: 'two', gid: Date.now(), seq: 0, phase: 'play', snap: null }; D.setMe(0); } }
      else if (L) { D.quit(L); L = null; } }; });
  }
  window.render();
})();
