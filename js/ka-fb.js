/* KamaAgni card feedback (v78): 👍 / 👎 under every card in the card games, Task Deck and Guided Session.
   👎 hides that card everywhere from now on (js/ka-filter.js skips it in every deck, pack and game).
   👍 saves it to your favourites (Saved Moments, Print Studio "favourites") and marks it as one you love.
   Stored in ka_fb {up:{fp:text}, down:{fp:text}}, synced to your account. Settings lists hidden cards to restore. */
(function () {
  'use strict';
  if (window.KA_FB) return;
  var D = document;
  function rd() { try { var o = JSON.parse(localStorage.getItem('ka_fb')) || {}; o.up = o.up || {}; o.down = o.down || {}; return o; } catch (e) { return { up: {}, down: {} }; } }
  function wr(o) { try { localStorage.setItem('ka_fb', JSON.stringify(o)); } catch (e) {} }
  function fp(t) { return window.KA_FILTER && KA_FILTER.fp ? KA_FILTER.fp(t) : String(t).toLowerCase().replace(/[^a-z]+/g, '').slice(0, 90); }
  function toast(m) { try { window.KA && KA.toast && KA.toast(m); } catch (e) {} }
  var css = D.createElement('style');
  css.textContent = '.ka-fb{display:flex;gap:8px;justify-content:center;align-items:center;margin:10px 0 2px;flex-wrap:wrap}.ka-fb button{min-width:46px;min-height:40px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.04);color:inherit;font-size:18px;cursor:pointer;line-height:1}.ka-fb button[aria-pressed="true"]{background:rgba(232,99,122,.22);border-color:rgba(232,99,122,.7)}.ka-fb small{font-size:12px;opacity:.75;flex-basis:100%;text-align:center}.ka-fb small button{min-width:0;min-height:30px;font-size:12px;padding:2px 10px;margin-left:6px}';
  D.head.appendChild(css);
  function bar(el) {
    var t = (el.innerText || el.textContent || '').trim(); if (t.length < 12) return;
    var k = fp(t), o = rd(), b = D.createElement('div'); b.className = 'ka-fb'; b.setAttribute('role', 'group'); b.setAttribute('aria-label', 'Do you like this card?');
    function paint() { var o = rd(), up = !!o.up[k], dn = !!o.down[k];
      b.innerHTML = '<button type="button" data-f="up" aria-pressed="' + up + '" aria-label="I love this one" title="Love it: save to favourites">👍</button><button type="button" data-f="down" aria-pressed="' + dn + '" aria-label="Not for us: never show again" title="Not for us: never show again">👎</button>' +
        (dn ? '<small>Hidden from now on.<button type="button" data-f="undo">Undo</button></small>' : up ? '<small>Saved to favourites 💞</small>' : '');
    }
    b.addEventListener('click', function (e) {
      var x = e.target.closest('[data-f]'); if (!x) return; e.stopPropagation();
      var o = rd(), f = x.dataset.f;
      if (f === 'up') { if (o.up[k]) delete o.up[k]; else { o.up[k] = t.slice(0, 300); delete o.down[k]; try { window.KA && KA.saveFav ? KA.saveFav('cards', t) : null; } catch (er) {} } }
      else if (f === 'down') { o.down[k] = t.slice(0, 300); delete o.up[k]; toast('👎 It won’t come up again. Undo any time in Settings.'); }
      else if (f === 'undo') delete o.down[k];
      /* per game tally, used by the smarter Surprise me */
      var sl = (location.pathname.match(/([^\/]+)\.html$/) || [])[1]; if (sl && (f === 'up' || f === 'down')) { o.pg = o.pg || {}; var g = o.pg[sl] = o.pg[sl] || { u: 0, d: 0 }; if (f === 'up' && o.up[k]) g.u++; if (f === 'down') g.d++; }
      wr(o); paint();
    });
    paint(); el.parentNode.insertBefore(b, el.nextSibling);
  }
  function scan() {
    D.querySelectorAll('.kd-fb .kx-big, .kx-play .kx-big').forEach(function (el) {
      var nx = el.nextElementSibling; if (nx && nx.classList.contains('ka-fb')) return;
      if (el.closest('header,footer,#ka-next,.kn-wrap')) return;
      bar(el);
    });
  }
  /* Settings: list hidden cards so they can be restored */
  function settings() {
    if (!/kamaagni-settings\.html/.test(location.pathname)) return;
    var app = D.getElementById('app'); if (!app || !app.children.length || D.getElementById('ka-fb-set')) return;
    var o = rd(), L = Object.keys(o.down); var box = D.createElement('div'); box.id = 'ka-fb-set'; box.className = 'kx-card';
    function draw() { var o = rd(), L = Object.keys(o.down);
      box.innerHTML = '<h2 style="font-size:1.1rem;margin:0 0 6px">👎 Cards you’ve hidden (' + L.length + ')</h2>' + (L.length ? '<p class="kx-muted" style="margin:0 0 8px;font-size:14px">These never come up in any game. Tap Restore to bring one back.</p>' + L.slice(0, 50).map(function (k) { return '<div style="display:flex;gap:8px;align-items:center;justify-content:space-between;padding:6px 0;border-top:1px solid rgba(255,255,255,.08)"><span style="font-size:14px">' + String(o.down[k]).replace(/[<>&]/g, '').slice(0, 120) + '</span><button class="kx-btn sm ghost" data-r="' + k + '">Restore</button></div>'; }).join('') + '<button class="kx-btn sm ghost" id="fb-all" style="margin-top:8px">Restore all</button>' : '<p class="kx-muted" style="margin:0;font-size:14px">Tap 👎 under any card in a game and it disappears for good. They’ll be listed here.</p>');
      box.querySelectorAll('[data-r]').forEach(function (b) { b.onclick = function () { var o = rd(); delete o.down[b.dataset.r]; wr(o); draw(); }; });
      var all = box.querySelector('#fb-all'); if (all) all.onclick = function () { if (!confirm('Bring back every hidden card?')) return; var o = rd(); o.down = {}; wr(o); draw(); };
    }
    draw(); var ref = D.getElementById('ka-comfort'); if (ref) ref.parentNode.insertBefore(box, ref.nextSibling); else app.appendChild(box);
  }
  var t = 0, mo = new MutationObserver(function () { clearTimeout(t); t = setTimeout(function () { scan(); settings(); }, 80); });
  function boot() { scan(); settings(); mo.observe(D.body, { childList: true, subtree: true }); }
  if (D.readyState !== 'loading') boot(); else D.addEventListener('DOMContentLoaded', boot);
  window.KA_FB = { get: rd, fp: fp };
})();
