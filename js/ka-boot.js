/* KamaAgni boot (runs in <head>):
   1. the intro plays only on the very first launch ever
   2. tracks which saved settings changed so cloud sync can upload them */
(function () {
  var d = document.documentElement, seen = false;
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
