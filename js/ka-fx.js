/* KamaAgni FX: realistic card deal (pile + lift + flip), 3D dice with pips, spinning wheel, tiny sounds.
   Generic: any newly shown ".kx-play" card is dealt from a pile automatically. */
(function () {
  'use strict';
  if (window.KA_FX) return;
  var doc = document, reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function soundOn() { try { var c = JSON.parse(localStorage.getItem('ka_calm')) || {}; return c.sound !== false; } catch (e) { return true; } }
  var ctx = null;
  function ac() { try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); return ctx; } catch (e) { return null; } }
  function noise(dur, vol, freq, when) {          // short filtered noise burst: card flick / dice clack
    if (!soundOn()) return; var a = ac(); if (!a) return;
    try { var t = a.currentTime + (when || 0), n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0), i;
      for (i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
      var s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(); s.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq || 2200; g.gain.value = vol || .15; s.connect(f); f.connect(g); g.connect(a.destination); s.start(t); } catch (e) {}
  }
  function shuffleSound() { for (var i = 0; i < 5; i++) noise(.05, .1, 1800 + Math.random() * 1200, i * .06); noise(.08, .16, 900, .34); }
  function clack(n) { for (var i = 0; i < (n || 4); i++) noise(.035, .2, 1400 + Math.random() * 900, .12 + i * (.12 + Math.random() * .12)); }

  var css = doc.createElement('style');
  css.textContent = [
    '.kfx-stage{perspective:1100px}',
    /* pile under every dealt card */
    '.kx-play.kfx-pile{position:relative;isolation:isolate}',
    '.kx-play.kfx-pile::before,.kx-play.kfx-pile::after{content:"";position:absolute;inset:0;border-radius:inherit;z-index:-1;background:#0e1124;border:1px solid rgba(255,255,255,.12)}',
    '.kx-play.kfx-pile::before{transform:translate(5px,7px) rotate(1.1deg);opacity:.9}',
    '.kx-play.kfx-pile::after{transform:translate(-4px,12px) rotate(-1.5deg);opacity:.75}',
    /* deal animation */
    '@keyframes kfx-deal{0%{transform:translate(70px,60px) rotateZ(10deg) rotateY(180deg) scale(.78);opacity:0}12%{opacity:1}30%{transform:translate(48px,-26px) rotateZ(6deg) rotateY(160deg) scale(.9)}70%{transform:translate(0,-8px) rotateZ(-1deg) rotateY(20deg) scale(1.03)}100%{transform:none}}',
    '.kx-play.kfx-deal{animation:kfx-deal .95s cubic-bezier(.22,.8,.3,1) both;transform-style:preserve-3d;box-shadow:0 20px 40px rgba(0,0,0,.45)}',
    '@keyframes kfx-back{0%,49%{opacity:1}50%,100%{opacity:0;visibility:hidden}}',
    '.kfx-back{position:absolute;inset:0;border-radius:inherit;z-index:3;pointer-events:none;transform:scaleX(-1);background:radial-gradient(circle at 50% 50%,rgba(232,99,122,.35),transparent 55%),repeating-linear-gradient(45deg,#1a1230 0 10px,#241743 10px 20px);border:2px solid rgba(244,160,174,.55);display:flex;align-items:center;justify-content:center;font-size:54px;animation:kfx-back .95s linear both}',
    '.kfx-back::before{content:"";position:absolute;inset:10px;border:1px solid rgba(244,160,174,.4);border-radius:12px}',
    /* deck graphic */
    '.kfx-deck{position:relative;width:54px;height:74px;flex:none;display:inline-block;vertical-align:middle}',
    '.kfx-deck i{position:absolute;inset:0;border-radius:8px;background:repeating-linear-gradient(45deg,#1a1230 0 5px,#241743 5px 10px);border:1.5px solid rgba(244,160,174,.55);box-shadow:0 2px 4px rgba(0,0,0,.5)}',
    '.kfx-deck i:nth-child(1){transform:translate(0,0)}.kfx-deck i:nth-child(2){transform:translate(-2px,-2px)}.kfx-deck i:nth-child(3){transform:translate(-4px,-4px)}.kfx-deck i:nth-child(4){transform:translate(-6px,-6px)}',
    '.kfx-deck.pulse{animation:kfx-shuf .5s ease}',
    '@keyframes kfx-shuf{0%,100%{transform:none}25%{transform:translateX(-5px) rotate(-4deg)}75%{transform:translateX(5px) rotate(4deg)}}',
    /* 3D dice */
    '.kfx-dice{display:flex;gap:34px;justify-content:center;align-items:center;min-height:110px;perspective:700px;padding:14px 0}',
    '.kfx-die{width:64px;height:64px;position:relative;transform-style:preserve-3d;transition:transform 1.5s cubic-bezier(.15,.7,.2,1)}',
    '.kfx-wrap{transform-style:preserve-3d}',
    '@keyframes kfx-throw{0%{transform:translate3d(-150px,-140px,200px) scale(1.4)}35%{transform:translate3d(-40px,10px,0) scale(.95)}50%{transform:translate3d(-10px,-34px,0)}68%{transform:translate3d(6px,2px,0)}80%{transform:translate3d(2px,-12px,0)}100%{transform:translate3d(0,0,0)}}',
    '.kfx-wrap.go{animation:kfx-throw 1.5s ease-out both}',
    '.kfx-face{position:absolute;inset:0;border-radius:11px;background:linear-gradient(145deg,#fff,#e8e2ef);border:1px solid #b9aec8;display:grid;grid-template:repeat(3,1fr)/repeat(3,1fr);padding:9px;box-shadow:inset 0 0 12px rgba(120,90,150,.25);backface-visibility:hidden}',
    '.kfx-face b{width:11px;height:11px;border-radius:50%;background:#2a1233;align-self:center;justify-self:center;box-shadow:inset 0 2px 3px rgba(0,0,0,.5)}',
    '.kfx-face.f1 b{background:#c81e3a}',
    '.kfx-face.f1{transform:rotateY(0) translateZ(32px)}.kfx-face.f6{transform:rotateY(180deg) translateZ(32px)}.kfx-face.f2{transform:rotateY(90deg) translateZ(32px)}.kfx-face.f5{transform:rotateY(-90deg) translateZ(32px)}.kfx-face.f3{transform:rotateX(90deg) translateZ(32px)}.kfx-face.f4{transform:rotateX(-90deg) translateZ(32px)}',
    '.kfx-shadow{position:absolute;left:50%;bottom:-18px;width:56px;height:12px;margin-left:-28px;border-radius:50%;background:rgba(0,0,0,.45);filter:blur(5px)}',
    /* wheel */
    '.kfx-wheel{position:relative;width:min(300px,78vw);margin:6px auto}',
    '.kfx-wheel svg{width:100%;height:auto;display:block;filter:drop-shadow(0 8px 14px rgba(0,0,0,.5))}',
    '.kfx-wheel .rot{transform-origin:150px 150px;transition:transform 4.2s cubic-bezier(.12,.62,.08,1)}',
    '.kfx-wheel svg.kfx-ptr{width:26px;height:34px}.kfx-ptr{position:absolute;left:50%;top:-8px;margin-left:-13px;width:26px;height:34px;z-index:2;filter:drop-shadow(0 3px 3px rgba(0,0,0,.5))}',
    '@media (prefers-reduced-motion:reduce){.kx-play.kfx-deal{animation:none}.kfx-back{display:none}.kfx-die{transition:none}.kfx-wrap.go{animation:none}.kfx-wheel .rot{transition:none}}'
  ].join('\n');
  doc.head.appendChild(css);

  /* ---------- generic deal ---------- */
  var seenKeys = {};
  function deal(el) {
    if (!el || el.__kfx) return; el.__kfx = 1;
    var key = el.getAttribute('data-fx-key'); el.classList.add('kfx-pile');
    if (key) { if (seenKeys[key]) return; seenKeys[key] = 1; }
    if (reduce || el.hasAttribute('data-nofx')) return;
    if (el.offsetHeight < 60) return;                       // skip tiny status cards
    el.classList.add('kfx-deal');
    var b = doc.createElement('div'); b.className = 'kfx-back'; b.textContent = '🔥'; el.appendChild(b);
    shuffleSound();
    setTimeout(function () { el.classList.remove('kfx-deal'); if (b.parentNode) b.remove(); }, 1000);
  }
  function scan(n) { if (n.nodeType !== 1) return; if (n.matches && n.matches('.kx-play')) deal(n); var l = n.querySelectorAll ? n.querySelectorAll('.kx-play') : []; for (var i = 0; i < l.length; i++) deal(l[i]); }
  function boot() {
    scan(doc.body);
    new MutationObserver(function (ms) { ms.forEach(function (m) { m.addedNodes.forEach(scan); }); }).observe(doc.body, { childList: true, subtree: true });
  }
  if (doc.readyState !== 'loading') boot(); else doc.addEventListener('DOMContentLoaded', boot);

  /* ---------- 3D dice ---------- */
  var PIPS = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
  var ORI = { 1: [0, 0], 6: [0, 180], 2: [0, -90], 5: [0, 90], 3: [-90, 0], 4: [90, 0] };   // [rotateX, rotateY] that brings face v to the front
  function faceHTML(v) { var s = '<div class="kfx-face f' + v + '">', i, p = PIPS[v]; for (i = 1; i <= 9; i++) s += p.indexOf(i) > -1 ? '<b style="grid-area:' + Math.ceil(i / 3) + '/' + (((i - 1) % 3) + 1) + '"></b>' : ''; return s + '</div>'; }
  function dice(host, values, opts) {
    opts = opts || {}; host.classList.add('kfx-dice');
    host.innerHTML = values.map(function () { return '<div class="kfx-wrap"><div class="kfx-die">' + [1, 2, 3, 4, 5, 6].map(faceHTML).join('') + '</div><div class="kfx-shadow"></div></div>'; }).join('');
    var dies = host.querySelectorAll('.kfx-die'), wraps = host.querySelectorAll('.kfx-wrap');
    function set(i, instant) { var o = ORI[values[i]], ex = o[0] + (instant ? 0 : 360 * (2 + Math.floor(Math.random() * 2)) * (Math.random() < .5 ? 1 : -1)), ey = o[1] + (instant ? 0 : 360 * (2 + Math.floor(Math.random() * 2)) * (Math.random() < .5 ? 1 : -1)); dies[i].style.transform = 'rotateX(' + (ex - 18) + 'deg) rotateY(' + (ey + 14) + 'deg)'; }
    if (opts.instant || reduce) { for (var k = 0; k < dies.length; k++) { dies[k].style.transition = 'none'; set(k, true); } return Promise.resolve(); }
    for (var j = 0; j < dies.length; j++) { dies[j].style.transform = 'rotateX(' + (Math.random() * 360) + 'deg) rotateY(' + (Math.random() * 360) + 'deg)'; wraps[j].style.animationDelay = (j * .12) + 's'; dies[j].style.transitionDelay = (j * .12) + 's'; }
    void host.offsetWidth;
    return new Promise(function (res) {
      clack(5 + values.length);
      requestAnimationFrame(function () { for (var j = 0; j < dies.length; j++) { wraps[j].classList.add('go'); set(j, false); } });
      setTimeout(res, 1700 + values.length * 130);
    });
  }
  function rnd(n) { return 1 + Math.floor(Math.random() * (n || 6)); }

  /* ---------- wheel ---------- */
  function wheel(host, labels, target, opts) {
    opts = opts || {}; var n = labels.length, R = 140, cx = 150, cy = 150, cols = ['#e8637a', '#7c3aed', '#f5a524', '#0ea5a4', '#ec4899', '#3b82f6'], svg = '', i;
    for (i = 0; i < n; i++) {
      var a0 = (i / n) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2, x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0), x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1), mid = (a0 + a1) / 2;
      svg += '<path d="M' + cx + ',' + cy + ' L' + x0 + ',' + y0 + ' A' + R + ',' + R + ' 0 0 1 ' + x1 + ',' + y1 + ' Z" fill="' + cols[i % cols.length] + '" stroke="#12152a" stroke-width="2"/>';
      svg += '<text x="' + (cx + R * .68 * Math.cos(mid)) + '" y="' + (cy + R * .68 * Math.sin(mid) + 8) + '" text-anchor="middle" font-size="22" transform="rotate(' + (mid * 180 / Math.PI + 90) + ' ' + (cx + R * .68 * Math.cos(mid)) + ' ' + (cy + R * .68 * Math.sin(mid)) + ')">' + labels[i] + '</text>';
    }
    host.innerHTML = '<div class="kfx-wheel"><svg viewBox="0 0 300 300"><circle cx="150" cy="150" r="147" fill="#12152a" stroke="#f4a0ae" stroke-width="3"/><g class="rot" id="kfx-rot">' + svg + '</g><circle cx="150" cy="150" r="20" fill="#12152a" stroke="#f4a0ae" stroke-width="3"/><text x="150" y="157" text-anchor="middle" font-size="18">🔥</text></svg><svg class="kfx-ptr" viewBox="0 0 26 34"><path d="M13 34 L1 6 Q13 -4 25 6 Z" fill="#f5c842" stroke="#12152a" stroke-width="2"/></svg></div>';
    var rot = host.querySelector('#kfx-rot'); if (target == null) return Promise.resolve();
    var deg = 360 * (5 + Math.floor(Math.random() * 3)) + (360 - ((target + .5) / n) * 360);
    if (reduce || opts.instant) { rot.style.transition = 'none'; rot.style.transform = 'rotate(' + deg + 'deg)'; return Promise.resolve(); }
    void rot.getBoundingClientRect();
    return new Promise(function (res) { for (var t = 0; t < 28; t++) noise(.03, .1, 2500, t * (.06 + t * .008)); requestAnimationFrame(function () { rot.style.transform = 'rotate(' + deg + 'deg)'; }); setTimeout(res, 4300); });
  }
  function deckHTML(label) { return '<span class="kfx-deck"><i></i><i></i><i></i><i></i></span>' + (label ? '<span class="kx-muted" style="font-size:12px;margin-left:8px">' + label + '</span>' : ''); }
  function pulseDeck(root) { var d = (root || doc).querySelector('.kfx-deck'); if (d) { d.classList.remove('pulse'); void d.offsetWidth; d.classList.add('pulse'); } shuffleSound(); }
  window.KA_FX = { deal: deal, dice: dice, wheel: wheel, rnd: rnd, deckHTML: deckHTML, pulseDeck: pulseDeck, clack: clack, shuffle: shuffleSound };
})();
