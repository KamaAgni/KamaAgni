/* Non-invasive upgrades for the original games: couple names, how-to-play help, haptics, extra content. */
(function () {
  'use strict';
  var file = location.pathname.split('/').pop();
  var c; try { c = JSON.parse(localStorage.getItem('ka_couple')) || {}; } catch (e) { c = {}; }
  var N1 = c.p1 || '', N2 = c.p2 || '';

  /* 1. Couple names instead of "Player 1/2" */
  if (N1 || N2) {
    var swap = function (root) {
      var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
      while ((n = w.nextNode())) if (/Player\s?[12]/i.test(n.nodeValue)) list.push(n);
      list.forEach(function (t) { t.nodeValue = t.nodeValue.replace(/Player\s?1/gi, N1 || 'Partner 1').replace(/Player\s?2/gi, N2 || 'Partner 2'); });
    };
    var run = function () { swap(document.body); new MutationObserver(function (ms) { ms.forEach(function (m) { m.addedNodes.forEach(function (a) { if (a.nodeType === 1) swap(a); else if (a.nodeType === 3 && /Player\s?[12]/i.test(a.nodeValue)) a.nodeValue = a.nodeValue.replace(/Player\s?1/gi, N1 || 'Partner 1').replace(/Player\s?2/gi, N2 || 'Partner 2'); }); if (m.type === 'characterData' && /Player\s?[12]/i.test(m.target.nodeValue)) m.target.nodeValue = m.target.nodeValue.replace(/Player\s?1/gi, N1 || 'Partner 1').replace(/Player\s?2/gi, N2 || 'Partner 2'); }); }).observe(document.body, { childList: true, subtree: true, characterData: true }); };
    if (document.body) run(); else document.addEventListener('DOMContentLoaded', run);
  }

  /* 2. Haptics */
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('button') && navigator.vibrate) { try { navigator.vibrate(8); } catch (x) {} } }, true);

  /* 3. How-to-play */
  var HELP = {
    'intimacy_dice_game_single_page.html': ['Intimacy Dice', 'Choose a heat level, then roll. Three dice give you an action, a place on the body and a style. Do it together for about a minute. Save favourites with the heart. Pass any roll you do not both want.'],
    'intimacy_cards_game_single_page.html': ['Intimacy Cards', 'Draw cards, do what they say, and earn connection points. Chain card types (touch, gaze, vocal, sensory) for combo bonuses. Raise the level when you both feel ready. Save your favourite cards with the heart.'],
    'intimacy_ludo_dice_game_single_page.html': ['Intimacy Ludo', 'Take turns rolling the dice and moving your pieces round the board. Land on a square and do the challenge for your partner. First to get home wins — and picks the reward.'],
    'intimacy_Position_Selector_page.html': ['Position Selector', 'Filter by what you like, spin, and try the position that comes up. Mark favourites to build your own list. Skip anything uncomfortable.'],
    'intimacy_Oral_Position_Selector_page.html': ['Oral Selector', 'Filter, spin, and take turns. Communicate, go slowly and stop any time you need to.'],
    'kamaagni-connect-foreplay.html': ['Connect & Foreplay', 'Follow the guided steps together, slowly. Start with connection, then build up. No rush and no goal.'],
    'kamaagni-poker-quick.html': ['Quick Poker', 'Play a short hand of strip-style poker. The loser of each hand takes the forfeit. Change the stakes to suit you.']
  };
  var h = HELP[file];
  if (h) {
    var add = function () {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = '?'; b.setAttribute('aria-label', 'How to play');
      b.style.cssText = 'position:fixed;right:14px;bottom:150px;z-index:9990;width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:#12152a;color:#f4a0ae;font:700 18px DM Sans,system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.4)';
      b.onclick = function () {
        var d = document.createElement('div'); d.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:rgba(5,6,15,.88);display:flex;align-items:center;justify-content:center;padding:20px';
        var i = document.createElement('div'); i.style.cssText = 'max-width:420px;background:#0c0e1c;border:1px solid rgba(255,255,255,.15);border-radius:20px;padding:22px;color:#dce9ff;font-family:DM Sans,system-ui,sans-serif;line-height:1.6;font-size:14px';
        var t = document.createElement('div'); t.textContent = 'How to play · ' + h[0]; t.style.cssText = 'font:700 18px Cinzel,serif;color:#f4a0ae;margin-bottom:10px';
        var p = document.createElement('p'); p.textContent = h[1]; var q = document.createElement('p'); q.textContent = 'Agree on a safe word first. Pass on anything you do not both want.'; q.style.cssText = 'color:#8a99b8;margin-top:10px;font-size:13px';
        var x = document.createElement('button'); x.textContent = 'Got it'; x.style.cssText = 'margin-top:14px;width:100%;padding:12px;border-radius:999px;border:0;background:#e8637a;color:#fff;font:700 14px DM Sans,sans-serif;cursor:pointer'; x.onclick = function () { d.remove(); };
        i.appendChild(t); i.appendChild(p); i.appendChild(q); i.appendChild(x); d.appendChild(i); d.onclick = function (e) { if (e.target === d) d.remove(); }; document.body.appendChild(d);
      };
      document.body.appendChild(b);
    };
    if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
  }

  /* 4. Extra content (same data shape, merged only if the game's arrays exist) */
  try {
    if (typeof pools !== 'undefined' && pools.soft) {
      var more = {
        soft:  { a: ['NUZZLE', 'BREATHE ON', 'PLANT SOFT KISSES ON', 'CARESS'], b: ['INNER WRIST', 'SHOULDER BLADES', 'HAIRLINE', 'CALVES'], m: ['LIKE IT IS YOUR FIRST TIME', 'IN TOTAL SILENCE', 'WHILE SAYING WHAT YOU LOVE ABOUT THEM'] },
        wild:  { a: ['PRESS DOWN ON', 'TRAIL KISSES ALONG', 'GRIP', 'WORSHIP'], b: ['INNER THIGHS', 'EARLOBE', 'SIDE OF THE NECK'], m: ['AND NOT LET THEM MOVE', 'LIKE YOU OWN THEM', 'UNTIL THEY ASK POLITELY'] }
      };
      Object.keys(more).forEach(function (k) { if (pools[k]) { pools[k].actions.push.apply(pools[k].actions, more[k].a); pools[k].bodies.push.apply(pools[k].bodies, more[k].b); pools[k].manners.push.apply(pools[k].manners, more[k].m); } });
    }
  } catch (e) {}
  try {
    if (typeof CARD_DB !== 'undefined' && window.KA_DATA && KA_DATA.wyp) {
      var types = ['touch', 'sensory'], id = 1000;
      KA_DATA.wyp.forEach(function (w, i) {
        var t = Array.isArray(w) ? w[0] : w; if (!t || t.length > 140) return;
        CARD_DB.push({ id: id++, name: t.split(' ').slice(0, 3).join(' '), level: i % 2 ? 2 : 3, rarity: 'COMMON', xp: 12, desc: t + '.', type: types[i % 2] });
      });
    }
  } catch (e) {}
})();
