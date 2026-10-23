/* Local-only activity tracking: streaks, XP, levels. Nothing leaves the device. */
(function () {
  'use strict';
  var KEY = 'ka_act';
  function get() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function put(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) {} }
  function today(d) { d = d || new Date(); var m = d.getMonth() + 1, x = d.getDate(); return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (x < 10 ? '0' : '') + x; }
  var LEVELS = [[0, 'Spark', '✨'], [60, 'Ember', '🕯️'], [180, 'Flame', '🔥'], [400, 'Blaze', '🌟'], [800, 'Inferno', '🌋'], [1400, 'Eternal Fire', '👑']];
  function level(xp) {
    var i = 0; for (var k = 0; k < LEVELS.length; k++) if (xp >= LEVELS[k][0]) i = k;
    var nxt = LEVELS[i + 1];
    return { n: i + 1, name: LEVELS[i][1], icon: LEVELS[i][2], xp: xp, from: LEVELS[i][0], to: nxt ? nxt[0] : null, pct: nxt ? Math.round((xp - LEVELS[i][0]) / (nxt[0] - LEVELS[i][0]) * 100) : 100 };
  }
  function streak(a) {
    /* forgiving rhythm: one rest day in a row never breaks it (research: broken streaks make people quit) */
    var days = a.days || {}, d = new Date(), s = 0, gap = 0, n = 0;
    while (n++ < 400) { if (days[today(d)]) { s++; gap = 0; } else if (++gap > 1) break; d.setDate(d.getDate() - 1); }
    return s;
  }
  function award(name, xp) {                                   // call from any page: KA_TRACK.award('session', 25)
    var a = get(); a.days = a.days || {}; a.xp = (a.xp || 0) + xp; a.ev = a.ev || {}; a.ev[name] = (a.ev[name] || 0) + 1;
    a.days[today()] = (a.days[today()] || 0) + 1; put(a);
  }
  function visit() {
    var m = location.pathname.match(/\/games\/([^\/]+)\.html$/); if (!m) return;
    var a = get(); a.days = a.days || {}; a.pages = a.pages || {}; a.xp = a.xp || 0;
    var t = today(), first = !a.days[t];
    a.days[t] = (a.days[t] || 0) + 1;
    var p = a.pages[m[1]] || { n: 0 }; p.n++; p.last = Date.now(); a.pages[m[1]] = p;
    a.last = m[1]; a.lastAt = Date.now();
    a.seen = a.seen || {}; var key = t + ':' + m[1];
    if (!a.seen[key]) { a.seen[key] = 1; var ks = Object.keys(a.seen); if (ks.length > 80) ks.slice(0, ks.length - 80).forEach(function (x) { delete a.seen[x]; }); setTimeout(function () { log('play', 'Played ' + (document.title || m[1]).replace(/^KamaAgni\s*[—-]\s*/, '')); }, 0); }
    a.xp += first ? 15 : (p.n % 3 === 1 ? 4 : 1);             // daily bonus, small per-game credit
    put(a);
  }
  /* history log: KA_TRACK.log('session','Guided session','Playful') — viewable and deletable on the History page */
  function log(type, title, detail) {
    try {
      var h = []; try { h = JSON.parse(localStorage.getItem('ka_hist')) || []; } catch (e) {}
      h.unshift({ id: Date.now() + '' + Math.floor(Math.random() * 1000), t: Date.now(), y: type, a: String(title).slice(0, 120), b: detail ? String(detail).slice(0, 200) : '' });
      if (h.length > 400) h.length = 400;
      localStorage.setItem('ka_hist', JSON.stringify(h));
    } catch (e) {}
  }
  try { visit(); } catch (e) {}
  window.KA_TRACK = { log: log, get: get, level: level, streak: function () { return streak(get()); }, award: award, today: today, LEVELS: LEVELS };
})();
