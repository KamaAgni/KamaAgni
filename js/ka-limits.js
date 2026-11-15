/* KamaAgni limits (v79): anything you mark "🚫 Not for me" in the Kink Explorer disappears from every game, deck and
   task pack, the same way a 👎 does. Saved as ka_filter.auto.me = {off: {topic: 1}, rx: [patterns], n: [kink names]}.
   When you're linked, js/ka-shared.js sends it to your partner's phone as auto.you, so it's hidden on both phones.
   Your partner's phone only shows how many things are hidden, never which ones or why.
   Desire Match answers are NOT used: that game promises never to reveal a "no". Loaded on every page by ka-chrome. */
(function () {
  'use strict';
  if (window.KA_LIMITS) return;
  /* kink (as named in data/kinks.json) -> topic switches and word patterns that identify it on a card */
  var MAP = {
    'Spanking': { rx: ['spank'] }, 'Face slapping': { rx: ['slap\\w* (?:her|his|my|your) face', 'face.?slap'] }, 'CMNF': { rx: ['\\bcmnf\\b'] },
    'Anal sex': { off: ['anal'] }, 'Spitting': { rx: ['\\bspit'] }, 'Deepthroat': { rx: ['deep.?throat'] }, 'Face-fucking': { rx: ['face.?fuck'] },
    'Bondage': { rx: ['\\bbondage', '\\btie (?:him|her|you|me) up', '\\brope', 'restrain', '\\bcuff'] }, 'Bondage for a male sub': { rx: ['\\bbondage', '\\btie (?:him|you|me) up', 'restrain'] },
    'Drooling': { rx: ['\\bdrool'] }, 'Eye contact': { rx: ['eye contact'] }, 'Dick worship': { rx: ['(?:cock|dick) worship', 'worship (?:his|my|your) (?:cock|dick)'] },
    'Choking': { off: ['breath'], rx: ['\\bchok'] }, 'Dirty talk': { rx: ['dirty talk', 'talk dirty'] }, 'Forcing': { rx: ['\\bforc(?:e|ed|ing)\\b'] },
    'A sloppy blowjob': { rx: ['\\bsloppy'] }, 'Mouth stuffing': { rx: ['mouth.?stuff', 'stuff (?:your|her|his|my) mouth'] }, 'Hair pulling': { rx: ['hair.?pull', 'pull (?:her|his|your|my) hair'] },
    'A footjob': { rx: ['foot.?job'] }, 'Food play': { rx: ['food play', 'whipped cream', 'chocolate sauce', 'honey'] }, 'Roleplay': { off: ['roleplay'] },
    'Master/Sub': { rx: ['\\bmaster\\b'] }, 'DDLG': { rx: ['\\bddlg\\b', '\\bdaddy\\b', 'little girl'] }, 'Pet Play': { rx: ['pet play', '\\bpuppy', '\\bkitten', '\\bleash', '\\bcollar'] },
    'Humiliation': { off: ['humiliation'] }, 'Punishments': { rx: ['\\bpunish'] }, 'Punishment in femdom': { rx: ['\\bpunish'] }, 'Name calling': { rx: ['name.?call', '\\bslut', '\\bwhore', '\\bbitch'] },
    'Begging': { rx: ['\\bbeg(?:s|ging|ged)?\\b'] }, 'Bratting': { rx: ['\\bbrat'] }, 'Following orders': { rx: ['\\bobey', 'follow (?:my|his|her|your) orders'] },
    'Edging': { off: ['edging'] }, 'Rough sex': { rx: ['\\brough'] }, 'The vibrator kink': { rx: ['vibrat'] }, 'Being filmed': { off: ['photos'], rx: ['\\bfilm', '\\brecord'] },
    'Facesitting': { rx: ['face.?sit'] }, 'Foot worship': { rx: ['foot worship', 'worship (?:her|his|my|your) feet', 'lick (?:her|his|my|your) (?:feet|toes)', 'suck (?:her|his|my|your) toes'] },
    'Mistress/Sub': { rx: ['\\bmistress\\b'] }, 'SPH': { rx: ['\\bsph\\b', 'small penis', 'tiny (?:cock|dick)'] }, 'Watching her': { rx: ['watch (?:her|me) (?:touch|masturbat|play)'] },
    'Chastity': { rx: ['chastity', '\\bcage'] }, 'Pegging': { rx: ['\\bpegg', 'strap.?on'] }, 'Pussy worship': { rx: ['pussy worship', 'worship (?:her|my|your) pussy'] },
    'Prostate milking': { rx: ['prostate', '\\bmilking'] }, 'CBT': { rx: ['\\bcbt\\b', 'ball.?bust', 'cock and ball'] }, 'Servitude': { rx: ['servitude', '\\bservant'] },
    'Impact play': { rx: ['\\bpaddle', '\\bcrop\\b', '\\bcane', '\\bflog', '\\bwhip(?!ped cream)', 'impact play'] }, 'High-heel worship': { rx: ['heel worship', 'worship (?:her|my|your) heels', 'lick (?:her|my|your) heels'] },
    'Sounding': { rx: ['sounding', 'urethra'] }, 'Feminization': { rx: ['feminiz', '\\bsissy'] }, 'Praising a male sub': { rx: ['good boy'] },
    'Being used': { rx: ['being used', '\\buse me\\b', 'use (?:her|him|you) like'] }, 'Cold play': { rx: ['ice cube', 'cold play'] }
  };
  function rd(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function compute() {
    var st = rd('ka_kinkex', {}) || {}, off = {}, rx = [], n = [];
    Object.keys(st).forEach(function (k) { if (st[k] !== 'n' || !MAP[k]) return; n.push(k); (MAP[k].off || []).forEach(function (t) { off[t] = 1; }); (MAP[k].rx || []).forEach(function (r) { if (rx.indexOf(r) < 0) rx.push(r); }); });
    return n.length ? { off: off, rx: rx.length ? ['(?:' + rx.join('|') + ')'] : [], n: n } : null;
  }
  function sync() {
    var on = rd('ka_limits_on', true);
    var f = rd('ka_filter', null) || {}, cur = (f.auto && f.auto.me) || null, nx = on ? compute() : null;
    if (JSON.stringify(cur) === JSON.stringify(nx)) return;
    f.auto = f.auto || {}; if (nx) f.auto.me = nx; else delete f.auto.me;
    if (!f.auto.me && !f.auto.you) delete f.auto;
    try { localStorage.setItem('ka_filter', JSON.stringify(f)); window.dispatchEvent(new CustomEvent('ka:filter')); } catch (e) {}
  }
  /* Settings: what's hidden by "Not for me" (yours by name, your partner's only as a count) */
  function settings() {
    if (!/kamaagni-settings\.html/.test(location.pathname)) return;
    var app = document.getElementById('app'); if (!app || !app.children.length || document.getElementById('ka-lim-set')) return;
    var box = document.createElement('div'); box.id = 'ka-lim-set'; box.className = 'kx-card';
    function draw() {
      var f = rd('ka_filter', {}) || {}, au = f.auto || {}, me = au.me, you = au.you, on = rd('ka_limits_on', true);
      box.innerHTML = '<h2 style="font-size:1.1rem;margin:0 0 6px">🚫 Your “Not for me” list</h2><p class="kx-muted" style="margin:0 0 8px;font-size:14px">Anything you mark 🚫 Not for me in the <a href="kamaagni-kink-explorer.html" style="color:#ffc861">Kink Explorer</a> is hidden from every game, deck and pack. When you’re linked it’s hidden on your partner’s phone too; they only see how many things are hidden, never which.</p>' +
        (on && me ? '<p style="margin:0 0 8px;font-size:14px"><b>Hidden for you:</b> ' + me.n.map(function (x) { return String(x).replace(/[<>&]/g, ''); }).join(', ') + '</p>' : on ? '<p class="kx-muted" style="margin:0 0 8px;font-size:14px">Nothing marked yet.</p>' : '') +
        (you && (you.c || (you.n || []).length) ? '<p style="margin:0 0 8px;font-size:14px">🔒 Also hidden for your partner’s comfort: ' + (you.c || you.n.length) + ((you.c || you.n.length) === 1 ? ' thing' : ' things') + '.</p>' : '') +
        '<button class="kx-btn sm ghost" id="lim-t" aria-pressed="' + on + '">' + (on ? 'Stop using my answers to hide content' : 'Use my answers to hide content') + '</button>';
      box.querySelector('#lim-t').onclick = function () { try { localStorage.setItem('ka_limits_on', JSON.stringify(!on)); } catch (e) {} sync(); draw(); };
    }
    draw(); var ref = document.getElementById('ka-fb-set'); if (ref) ref.parentNode.insertBefore(box, ref); else app.appendChild(box);
  }
  sync();
  window.addEventListener('storage', function (e) { if (e.key === 'ka_kinkex') sync(); });
  var orig = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) { var r = orig.apply(this, arguments); if (k === 'ka_kinkex' && this === localStorage) setTimeout(sync, 0); return r; };
  var t = 0; (function wait() { settings(); if (++t < 30) setTimeout(wait, 400); })();
  window.KA_LIMITS = { compute: compute, sync: sync, MAP: MAP };
})();
