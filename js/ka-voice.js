/* KamaAgni read-aloud (v74): a 🗣 button in the header on reading pages. Tap it and the phone reads out the card
   you are looking at (the one most on screen), so nobody has to hold the phone. Tap again to stop.
   Uses the phone's own speech voices (speechSynthesis): nothing is sent anywhere. Also KA_VOICE.say(text). */
(function () {
  'use strict';
  if (window.KA_VOICE || !('speechSynthesis' in window)) return;
  var D = document, S = window.speechSynthesis, btn = null, on = false;
  var PAGES = /kamaagni-(roleplay|talk|tonight|experts|learn|session|quickies|skills|kama-studio|massage|ask-tell|tips|myths|health|life-stages|brakes|rituals|journey|task-deck|truth-or-dare|sensory-night|pamper|eight-dates|position-families|prompts|challenges|apart|secret|spark-challenge|fun|date-kits|whos-most-likely|would-you-prefer|never-have-i-ever|hornopoly)\.html/;
  function rd(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function voice() {
    var V = S.getVoices() || [], lang = (navigator.language || 'en').slice(0, 2), want = rd('ka_voice', '');
    return V.find(function (v) { return v.name === want; }) ||
      V.find(function (v) { return v.lang.slice(0, 2) === lang && /natural|neural|premium|enhanced|samantha|karen|daniel|google/i.test(v.name); }) ||
      V.find(function (v) { return v.lang.slice(0, 2) === lang; }) || null;
  }
  function clean(t) { return String(t || '').replace(/[\u{1F300}-\u{1FAFF}☀-➿️]/gu, ' ').replace(/[←→↻✓★☆♡♥⏱•·|]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function stop() { on = false; S.cancel(); paint(); }
  function say(text) {
    S.cancel(); var t = clean(text); if (!t) return;
    /* split into sentences: long utterances get cut off on some phones */
    var parts = t.match(/[^.!?…]+[.!?…]*/g) || [t];
    on = true; paint();
    parts.forEach(function (p, i) {
      var u = new SpeechSynthesisUtterance(p.trim()); var v = voice(); if (v) { u.voice = v; u.lang = v.lang; }
      u.rate = +rd('ka_voice_rate', 0.95) || 0.95; u.pitch = 1;
      if (i === parts.length - 1) { u.onend = function () { on = false; paint(); }; u.onerror = u.onend; }
      S.speak(u);
    });
  }
  /* the readable block most visible on screen */
  function target() {
    var root = D.getElementById('app') || D.querySelector('main') || D.body;
    var C = [].slice.call(root.querySelectorAll('.kx-card,.kx-play,.g-card,.card,article,section,.kx-item'))
      .filter(function (e) { return e.offsetParent && !e.closest('header,footer,nav,#ka-next,.kn-wrap,#ka-src') && !e.querySelector('.kx-card,.g-card') && (e.innerText || '').trim().length > 20; });
    var vh = innerHeight, best = null, bs = 0;
    C.forEach(function (e) { var r = e.getBoundingClientRect(), vis = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 56)); if (vis > bs) { bs = vis; best = e; } });
    return best;
  }
  function text(el) {
    var c = el.cloneNode(true);
    c.querySelectorAll('button,select,input,textarea,script,style,[aria-hidden="true"],.kx-chip,.kx-row').forEach(function (x) { x.remove(); });
    return c.innerText || c.textContent || '';
  }
  function paint() { if (!btn) return; btn.textContent = on ? '⏹' : '🗣'; btn.setAttribute('aria-pressed', on); btn.setAttribute('aria-label', on ? 'Stop reading' : 'Read aloud'); btn.title = on ? 'Stop reading' : 'Read this card aloud'; }
  function add() {
    if (D.getElementById('kh-voice')) return; var ref = D.getElementById('kh-pause') || D.getElementById('kh-acct'); if (!ref) return;
    btn = D.createElement('button'); btn.className = 'kh-b'; btn.id = 'kh-voice'; btn.type = 'button';
    btn.onclick = function () { if (on) return stop(); var t = target(); if (!t) return window.KA && KA.toast && KA.toast('Scroll to a card to read it aloud'); t.style.outline = '2px solid rgba(243,210,122,.6)'; setTimeout(function () { t.style.outline = ''; }, 1500); say(text(t)); };
    ref.parentNode.insertBefore(btn, ref); paint();
  }
  window.addEventListener('pagehide', function () { S.cancel(); });
  window.KA_VOICE = { say: say, stop: stop, speaking: function () { return on; } };
  if (PAGES.test(location.pathname)) { var n = 0; (function wait() { if (D.getElementById('kh-pause') || D.getElementById('kh-acct')) add(); else if (++n < 50) setTimeout(wait, 150); })(); }
})();
