/* KA_PERF: show a task, give time to read it, start the timer by itself (when the text has a time), with start-over. */
(function () {
  'use strict';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var stop = null;
  window.KA_PERF = {
    show: function (host, o) {
      if (stop) { try { stop(); } catch (e) {} stop = null; }
      var secs = window.KA_AUTO ? KA_AUTO.secsOf(o.text) : 0, fin = false;
      host.innerHTML = '<div class="kx-card" data-nofx="1" style="text-align:center"><div class="kx-turn">' + esc(o.badge) + '</div>' + (o.sub ? '<p class="kx-muted" style="margin-top:4px">' + esc(o.sub) + '</p>' : '') +
        '<div class="kx-big" style="margin:12px auto">' + esc(o.text) + '</div><div id="kp-r"></div><div class="kx-row" style="justify-content:center;margin-top:12px"><button class="kx-btn gold" id="kp-d">' + esc(o.doneLabel || (secs ? 'Done early' : 'Done')) + '</button>' + (o.extra || '') + '</div></div>';
      var done = function () { if (fin) return; fin = true; if (stop) { try { stop(); } catch (e) {} stop = null; } o.onDone && o.onDone(); };
      document.getElementById('kp-d').onclick = done;
      var r = document.getElementById('kp-r');
      if (secs && window.KA_AUTO) { stop = KA_AUTO.ring(r, { secs: secs, text: o.text, onNext: done, next: 5 }); setTimeout(function () { try { r.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {} }, 250); }
      else r.innerHTML = '<p class="kx-muted">Take as long as you both like. Tap Done when you are ready.</p>';
      return done;
    },
    stop: function () { if (stop) { try { stop(); } catch (e) {} stop = null; } }
  };
})();
