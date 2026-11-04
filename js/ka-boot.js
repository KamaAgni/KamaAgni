/* KamaAgni boot (runs in <head>):
   1. the intro plays only on the very first launch ever
   2. tracks which saved settings changed so cloud sync can upload them */
(function () {
  var d = document.documentElement, seen = false;
  /* login gate: keep the page hidden until ka-gate.js has checked the sign-in (failsafe after 6s) */
  try {
    var _ok = sessionStorage.getItem('ka_ok') === '1' && Date.now() - (+localStorage.getItem('ka_last') || 0) < 3600000;
    if (!_ok) {
      var _st = document.createElement('style'); _st.id = 'ka-hide'; _st.textContent = 'html{visibility:hidden!important}'; (document.head || d).appendChild(_st);
      setTimeout(function () { var x = document.getElementById('ka-hide'); if (x && !window.KA_GATE) x.remove(); }, 6000);
    }
  } catch (e) {}
  /* load the shared theme in <head> before first paint (no flash of the old look) */
  var cs = document.currentScript, base = (cs && cs.src || '').replace(/js\/ka-boot\.js.*$/, '');
  try {
    if (base && !document.getElementById('ka-theme-css')) { var l = document.createElement('link'); l.id = 'ka-theme-css'; l.rel = 'stylesheet'; l.href = base + 'css/ka-theme.css'; document.head.appendChild(l); d.classList.add('ka-chrome'); } } catch (e) {}
  /* Opened straight from a folder or pen drive (file://): there is no web server, so data files are served from js/ka-embed.js */
  try {
    if (location.protocol === 'file:' && cs) {
      document.write('<script src="' + base + 'js/ka-embed.js"><\/script>');
      var realFetch = window.fetch;
      window.fetch = function (u) {
        try { var m = String(u && u.url || u).match(/(?:^|\/)(data\/[^?#]+\.json)/); if (m && window.KA_EMBED && window.KA_EMBED[m[1]] !== undefined) return Promise.resolve(new Response(JSON.stringify(window.KA_EMBED[m[1]]), { status: 200, headers: { 'Content-Type': 'application/json' } })); } catch (e) {}
        return realFetch.apply(this, arguments);
      };
    }
  } catch (e) {}
  try { if (cs && base) document.write('<script src="' + base + 'js/ka-auto.js"><\/script><script src="' + base + 'js/ka-spark.js"><\/script>'); } catch (e) {}
  try { seen = !!(localStorage.getItem('ka_intro_seen') || sessionStorage.getItem('ka_intro_seen')); } catch (e) {}
  if (seen) d.classList.add('ka-skip-intro');

  /* ---- sync hook: records changed ka_* keys (values are only read later, by ka-cloud.js) ---- */
  try {
    var S = Storage.prototype, rawSet = S.setItem, rawRem = S.removeItem, rawGet = S.getItem;
    var LOCAL_ONLY = /^(ka_pin|ka_vkey|ka_adult|ka_sync|ka_cloud|ka_mock|ka_lib_recent|ka_act_dev)/;
    var ok = function (k) { return typeof k === 'string' && (k.indexOf('ka_') === 0 || k === 'dice_favorites') && !LOCAL_ONLY.test(k); };
    var meta = function () { try { return JSON.parse(rawGet.call(localStorage, 'ka_sync_meta')) || {}; } catch (e) { return {}; } };
    var mark = function (k, del) {
      if (window.KA_SYNC && KA_SYNC.applying) return;
      var m = meta(); m[k] = { t: Date.now(), p: 1, d: del ? 1 : 0 };
      rawSet.call(localStorage, 'ka_sync_meta', JSON.stringify(m));
      try { window.dispatchEvent(new Event('ka:dirty')); } catch (e) {}
    };
    S.setItem = function (k, v) { rawSet.call(this, k, v); if (this === localStorage && ok(k)) mark(k, false); };
    S.removeItem = function (k) { rawRem.call(this, k); if (this === localStorage && ok(k)) mark(k, true); };
    window.KA_SYNC = {
      applying: false, syncable: ok, meta: meta,
      setMeta: function (m) { rawSet.call(localStorage, 'ka_sync_meta', JSON.stringify(m)); },
      raw: { set: function (k, v) { rawSet.call(localStorage, k, v); }, remove: function (k) { rawRem.call(localStorage, k); }, get: function (k) { return rawGet.call(localStorage, k); } }
    };
  } catch (e) {}
})();
