/* KA_AUTO: give people a moment to read a task, then start its timer by itself.
   - readSecs(text)   how long a card takes to read (4 to 10 seconds)
   - secsOf(text)     finds a duration inside a task ("90-second massage", "one full minute")
   - lead(btn, text)  turns an existing "start timer" button into "Starting in 5…" that clicks itself
   - ring(host, o)    self-contained countdown ring with reading pause, auto start and optional auto continue */
(function () {
  'use strict';
  if (window.KA_AUTO) return;
  var doc = document;
  function on() { try { var c = JSON.parse(localStorage.getItem('ka_calm')) || {}; return c.autotimer !== false; } catch (e) { return true; } }
  function reduced() { return window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function readSecs(text) { var w = String(text || '').trim().split(/\s+/).filter(Boolean).length; return Math.max(4, Math.min(10, Math.round(w / 3.2) + 2)); }
  var NUM = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, fifteen: 15, twenty: 20, thirty: 30, sixty: 60, ninety: 90 };
  function secsOf(text) {
    var t = String(text || '').toLowerCase(), m = /(\d+|\b(?:an?|one|two|three|four|five|six|seven|eight|nine|ten|fifteen|twenty|thirty|sixty|ninety)\b)(?:\s+full)?[\s-]*(seconds?|secs?|minutes?|mins?)\b/.exec(t);
    if (!m) return 0; var n = /^\d+$/.test(m[1]) ? +m[1] : NUM[m[1]]; if (!n) return 0; if (/^m/.test(m[2])) n *= 60; return n >= 10 && n <= 900 ? n : 0;
  }
  var css = doc.createElement('style');
  css.textContent = '.kauto-ring{display:flex;flex-direction:column;align-items:center;gap:8px;margin:12px 0}.kauto-ring .r{position:relative;width:96px;height:96px}.kauto-ring svg{width:100%;height:100%;transform:rotate(-90deg)}' +
    '.kauto-ring circle{fill:none;stroke-width:6}.kauto-ring .bg{stroke:rgba(255,255,255,.12)}.kauto-ring .fg{stroke:#ff9c3d;stroke-linecap:round;transition:stroke-dashoffset 1s linear;filter:drop-shadow(0 0 6px rgba(255,140,60,.7))}' +
    '.kauto-ring.lead .fg{stroke:#9ad7ff;filter:none}.kauto-ring b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:700 26px Cinzel,serif;color:#fff}' +
    '.kauto-ring .st{font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.85}.kauto-ring.run .r{animation:kautop 1.6s ease-in-out infinite}.kauto-ring.done .fg{stroke:#7be0a6}' +
    '@keyframes kautop{50%{transform:scale(1.04)}}.kauto-row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}.kauto-row button{background:transparent;border:1px solid rgba(255,255,255,.3);color:inherit;border-radius:999px;padding:7px 14px;font:inherit;font-size:13px;cursor:pointer}' +
    '.kauto-next{height:4px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden;width:min(260px,80%)}.kauto-next i{display:block;height:100%;width:0;background:#7be0a6}';
  doc.head.appendChild(css);
  function beep(f, d) { try { var a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain(); o.frequency.value = f; g.gain.value = .12; o.connect(g); g.connect(a.destination); o.start(); setTimeout(function () { o.stop(); a.close(); }, d || 160); } catch (e) {} }
  function buzz(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} }

  /* ---- turn an existing start button into a self-starting one ---- */
  function lead(btn, text, o) {
    if (!btn || !on()) return function () {}; o = o || {};
    var label = btn.textContent, left = o.secs || readSecs(text), id = 0, cancel = doc.createElement('button');
    cancel.type = 'button'; cancel.textContent = 'Not yet'; cancel.className = btn.className; cancel.style.cssText = 'margin-left:6px;opacity:.75';
    function stop(restore) { clearInterval(id); id = 0; if (cancel.parentNode) cancel.remove(); if (restore) btn.textContent = label; btn.removeEventListener('click', manual, true); }
    function manual() { stop(true); }
    function show() { btn.textContent = '⏱ Starts in ' + left + ' · tap to start now'; }
    btn.addEventListener('click', manual, true);
    btn.parentNode && btn.parentNode.insertBefore(cancel, btn.nextSibling);
    cancel.onclick = function () { stop(true); };
    show();
    id = setInterval(function () {
      if (!doc.body.contains(btn)) return stop(false);
      left--; if (left <= 0) { stop(true); beep(660, 120); buzz(40); btn.click(); } else show();
    }, 1000);
    return function () { stop(true); };
  }

  /* ---- full ring ----
     o: {secs, text, auto (default true), lead (seconds to read), onStart, onDone, next (seconds before onNext), onNext, label} */
  function ring(host, o) {
    o = o || {}; var secs = o.secs, R = 40, L = 2 * Math.PI * R, t = secs, id = 0, state = 'idle', stopped = false, nextId = 0;
    var auto = o.auto !== false && on(), ld = o.lead || readSecs(o.text);
    host.innerHTML = '<div class="kauto-ring"><div class="r"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="' + R + '" class="bg"/><circle cx="50" cy="50" r="' + R + '" class="fg" stroke-dasharray="' + L + '" stroke-dashoffset="0"/></svg><b></b></div><div class="st"></div>' +
      '<div class="kauto-row"><button type="button" class="go"></button><button type="button" class="more">+30s</button><button type="button" class="re">↺ Start over</button></div><div class="kauto-next" hidden><i></i></div></div>';
    var box = host.firstChild, fg = box.querySelector('.fg'), num = box.querySelector('b'), st = box.querySelector('.st'), go = box.querySelector('.go'), more = box.querySelector('.more'), re = box.querySelector('.re'), nx = box.querySelector('.kauto-next'), nxi = nx.firstChild;
    function fmt(n) { return n >= 60 ? Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0') : String(n); }
    function draw() { num.textContent = state === 'lead' ? ld : fmt(t); fg.style.strokeDashoffset = String(L * (state === 'lead' ? 1 - ld / (o.leadTotal || ld) : 1 - t / secs)); }
    function tickEnd() {
      clearInterval(id); state = 'done'; box.className = 'kauto-ring done'; st.textContent = o.doneLabel || "Time's up"; go.textContent = '↺ Again'; t = secs; num.textContent = '✓'; fg.style.strokeDashoffset = '0';
      beep(880, 220); buzz([200, 100, 200]); window.KA_MOTION && KA_MOTION.burst && KA_MOTION.burst({ kind: 'embers', n: 20 }); o.onDone && o.onDone();
      if (o.onNext && !stopped) { nx.hidden = false; var n = o.next || 4, s = Date.now(); nextId = setInterval(function () { var f = (Date.now() - s) / (n * 1000); nxi.style.width = Math.min(100, f * 100) + '%'; if (f >= 1) { clearInterval(nextId); if (!stopped) o.onNext(); } }, 100); }
    }
    function run() {
      clearInterval(id); clearInterval(nextId); nx.hidden = true; state = 'run'; box.className = 'kauto-ring run'; st.textContent = o.label || 'Go. Stay close'; go.textContent = '⏸ Pause'; o.onStart && o.onStart(); beep(520, 120); buzz(40); draw();
      id = setInterval(function () { t--; draw(); if (t <= 5 && t > 0) beep(440, 60); if (t <= 0) tickEnd(); }, 1000);
    }
    function startLead() {
      o.leadTotal = ld; state = 'lead'; box.className = 'kauto-ring lead'; st.textContent = 'Read it first. Timer starts by itself'; go.textContent = '▶ Start now'; draw();
      id = setInterval(function () { ld--; if (ld <= 0) { ld = o.leadTotal; run(); } else draw(); }, 1000);
    }
    go.onclick = function () {
      if (state === 'lead' || state === 'idle' || state === 'done') { ld = o.leadTotal || ld; t = secs; run(); }
      else if (state === 'run') { clearInterval(id); state = 'pause'; box.className = 'kauto-ring'; st.textContent = 'Paused'; go.textContent = '▶ Resume'; }
      else if (state === 'pause') { run(); }
    };
    more.onclick = function () { t += 30; secs += 30; draw(); };
    re.onclick = function () { clearInterval(id); clearInterval(nextId); nx.hidden = true; secs = o.secs; t = secs; ld = o.lead || readSecs(o.text); o.leadTotal = ld; fg.style.strokeDashoffset = '0'; box.className = 'kauto-ring'; if (auto) startLead(); else { state = 'idle'; num.textContent = fmt(t); st.textContent = ''; go.textContent = '▶ Start timer'; } };
    state = 'idle'; t = secs; num.textContent = fmt(t); st.textContent = ''; go.textContent = '▶ Start timer';
    if (auto) startLead(); else draw();
    return function () { stopped = true; clearInterval(id); clearInterval(nextId); };
  }
  window.KA_AUTO = { on: on, readSecs: readSecs, secsOf: secsOf, lead: lead, ring: ring, reduced: reduced };
})();
