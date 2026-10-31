/* KamaAgni custom cards: your own cards/questions/faces, stored on this device (ka_custom) and merged into the decks. */
(function () {
  'use strict';
  var KEY = 'ka_custom';
  function all() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function get(id) { var a = all()[id]; return Array.isArray(a) ? a : []; }
  function set(id, arr) { var a = all(); a[id] = arr; try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} try { window.dispatchEvent(new CustomEvent('ka:custom')); } catch (e) {} }
  var DECKS = {
    truth: function (t) { return t; }, dare: function (t) { return t; }, nhie: function (t) { return t; }, who: function (t) { return t; }, coupons: function (t) { return t; },
    wyp: function (t) { var p = t.split('|'); return p.length > 1 ? [p[0].trim(), p.slice(1).join('|').trim()] : null; },
    know: function (t) { var p = t.split('|'); return p.length > 2 ? [p[0].trim(), p[1].trim(), p[2].trim()] : null; },
    conn: function (t) { var p = t.split('|'); return { n: p[0].trim().slice(0, 40), d: (p[1] || p[0]).trim(), h: 1 }; },
    scratch: function (t) { return { t: t, b: 'free', p: 'home', m: 'quick' }; }
  };
  var oldFetch = window.fetch;
  if (oldFetch) window.fetch = function (u) {
    var url = typeof u === 'string' ? u : (u && u.url) || '', m = url.match(/\/data\/deck\/([a-z]+)\.json/), isDice = /\/data\/dice_faces\.json/.test(url);
    var id = m ? m[1] : null, items = [];
    if (id && DECKS[id]) items = get(id).map(DECKS[id]).filter(Boolean);
    else if (isDice) items = get('dice');
    if (!items.length) return oldFetch.apply(this, arguments);
    return oldFetch.apply(this, arguments).then(function (r) {
      if (!r.ok) return r;
      return r.clone().json().then(function (j) {
        if (isDice) { j.custom = items.map(function (x) { return String(x).toUpperCase(); }); }
        else { j.cats = (j.cats || []).concat([{ id: 'custom', l: 'Our own', i: '✍️', h: 1, n: items.length, g: '✍️ Yours' }]); j.items = j.items || {}; j.items.custom = items; }
        return { ok: true, status: 200, url: url, headers: r.headers, json: function () { return Promise.resolve(j); }, text: function () { return Promise.resolve(JSON.stringify(j)); }, clone: function () { return this; } };
      }, function () { return r; });
    });
  };
  window.KA_CUSTOM = { get: get, set: set, all: all };
})();
