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
