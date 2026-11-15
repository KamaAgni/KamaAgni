/* KamaAgni extras: pause / safe-word button, sound with mute, install prompt, share-as-image cards. */
(function () {
  'use strict';
  var doc = document;
  function LSget(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function LSset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---------- sound ---------- */
  var ac = null;
  function ctx() { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } return ac; }
  function tone(f, t0, d, v, type) { var a = ctx(); if (!a) return; var o = a.createOscillator(), g = a.createGain(); o.type = type || 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0, a.currentTime + t0); g.gain.linearRampToValueAtTime(v || .05, a.currentTime + t0 + .02); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + t0 + d); o.connect(g); g.connect(a.destination); o.start(a.currentTime + t0); o.stop(a.currentTime + t0 + d + .05); }
  var SND = {
    on: function () { return LSget('ka_snd', 1) !== 0; },
    set: function (v) { LSset('ka_snd', v ? 1 : 0); },
    play: function (kind) {
      if (!SND.on()) return; var a = ctx(); if (!a) return; if (a.state === 'suspended') try { a.resume(); } catch (e) {}
      if (kind === 'confetti') [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * .09, .35, .05); });
      else if (kind === 'hearts') { tone(660, 0, .3, .04); tone(880, .12, .4, .04); }
      else if (kind === 'embers') { tone(196, 0, .5, .05, 'triangle'); tone(294, .08, .5, .03, 'triangle'); }
      else if (kind === 'tick') tone(900, 0, .06, .03);
      else tone(660, 0, .2, .04);
    }
  };
  window.KA_SND = SND;
  var hookTry = 0;
  (function hook() { if (window.KA_MOTION && !KA_MOTION._snd) { var b = KA_MOTION.burst; KA_MOTION.burst = function (o) { try { SND.play(o && o.kind); } catch (e) {} return b.apply(this, arguments); }; KA_MOTION._snd = 1; } else if (++hookTry < 40) setTimeout(hook, 250); })();

  /* ---------- pause / safe word ---------- */
  function openPause() {
    var o = doc.getElementById('kx-pause'); if (o) return;
    o = doc.createElement('div'); o.id = 'kx-pause'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Pause');
    o.innerHTML = '<div class="kp-in"><div class="kp-t">⏸ Pause</div><p>Everything is paused. How are you both doing?</p>' +
      '<div class="kp-row"><button data-k="g" class="kp-g">🟢 I am good, continue</button><button data-k="a" class="kp-a">🟡 Slow down</button><button data-k="r" class="kp-r">🔴 Stop</button></div><div id="kp-msg" class="kp-msg"></div>' +
      '<div class="kp-row"><button data-k="snd" class="kp-s">' + (SND.on() ? '🔊 Sound on' : '🔇 Sound off') + '</button><button data-k="dk" class="kp-s">' + (window.KA_DARK && KA_DARK.on() ? '🌙 Dark room on' : '🌙 Dark room off') + '</button><button data-k="x" class="kp-s">Close</button></div></div>';
    doc.body.appendChild(o); doc.body.style.overflow = 'hidden';
    function close() { o.remove(); doc.body.style.overflow = ''; }
    o.onclick = function (e) { if (e.target === o) close(); };
    o.querySelectorAll('button').forEach(function (b) { b.onclick = function () {
      var k = b.dataset.k, m = o.querySelector('#kp-msg');
      if (k === 'g' || k === 'x') close();
      else if (k === 'a') m.innerHTML = '<b>Slower is fine.</b> Take a breath. Say what you would like more or less of. Continue only when you both feel good.';
      else if (k === 'r') m.innerHTML = '<b>Stop. Thank you for saying so.</b> Pause everything, hold each other if you both want, and talk when you are ready. No explanations needed. A "no" is always respected.<br><br><a href="' + (window.KA_BASE || '') + 'games/kamaagni-learn.html" style="color:#ff8fb0">Open aftercare tips</a>';
      else if (k === 'dk' && window.KA_DARK) { KA_DARK.set(!KA_DARK.on()); b.textContent = KA_DARK.on() ? '🌙 Dark room on' : '🌙 Dark room off'; }
      else if (k === 'snd') { SND.set(!SND.on()); b.textContent = SND.on() ? '🔊 Sound on' : '🔇 Sound off'; if (SND.on()) SND.play('hearts'); }
    }; });
  }
  function addPause() {
    if (doc.getElementById('kh-pause')) return; var acct = doc.getElementById('kh-acct'); if (!acct) return;
    var b = doc.createElement('button'); b.className = 'kh-b'; b.id = 'kh-pause'; b.type = 'button'; b.setAttribute('aria-label', 'Pause or safe word'); b.title = 'Pause / safe word'; b.textContent = '⏸'; b.onclick = openPause; acct.parentNode.insertBefore(b, acct);
  }
  var pt = 0; (function wait() { if (doc.getElementById('kh-acct')) addPause(); else if (++pt < 40) setTimeout(wait, 150); })();

  /* ---------- install prompt ---------- */
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; setTimeout(showInstall, 4000); });
  function standalone() { return window.matchMedia && matchMedia('(display-mode: standalone)').matches || navigator.standalone; }
  function showInstall() {
    if (standalone() || LSget('ka_inst_no', 0) || doc.getElementById('kx-inst')) return;
    var visits = LSget('ka_visits', 0); if (visits < 2) return;
    var d = doc.createElement('div'); d.id = 'kx-inst'; d.innerHTML = '<span>📲 Add KamaAgni to your home screen for quick, private access.</span><button id="kxi-y">Install</button><button id="kxi-n" aria-label="Dismiss">✕</button>';
    doc.body.appendChild(d);
    d.querySelector('#kxi-y').onclick = function () { if (deferred) { deferred.prompt(); deferred = null; } d.remove(); };
    d.querySelector('#kxi-n').onclick = function () { LSset('ka_inst_no', 1); d.remove(); };
  }
  LSset('ka_visits', (LSget('ka_visits', 0) || 0) + 1);
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone();
  if (ios) setTimeout(function () {
    if (LSget('ka_inst_no', 0) || LSget('ka_visits', 0) < 3 || doc.getElementById('kx-inst')) return;
    var d = doc.createElement('div'); d.id = 'kx-inst'; d.innerHTML = '<span>📲 To install: tap Share, then "Add to Home Screen".</span><button id="kxi-n" aria-label="Dismiss">Got it</button>'; doc.body.appendChild(d); d.querySelector('#kxi-n').onclick = function () { LSset('ka_inst_no', 1); d.remove(); };
  }, 5000);

  /* ---------- share as image ---------- */
  function wrap(g, text, x, y, w, lh) { var words = String(text).split(' '), line = '', n = 0; for (var i = 0; i < words.length; i++) { var t = line ? line + ' ' + words[i] : words[i]; if (g.measureText(t).width > w && line) { g.fillText(line, x, y); y += lh; line = words[i]; n++; } else line = t; } g.fillText(line, x, y); return y + lh; }
  var SHARE = {
    card: function (o) {
      var W = 1080, H = 1350, c = doc.createElement('canvas'); c.width = W; c.height = H; var g = c.getContext('2d');
      var gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#2a0a24'); gr.addColorStop(.55, '#150a2e'); gr.addColorStop(1, '#07060f'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      var rg = g.createRadialGradient(W * .8, H * .15, 20, W * .8, H * .15, 700); rg.addColorStop(0, 'rgba(255,93,143,.45)'); rg.addColorStop(1, 'rgba(255,93,143,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, H);
      g.textAlign = 'center'; g.fillStyle = '#ffb84d'; g.font = '600 38px Georgia, serif'; g.fillText('🔥 KAMAAGNI', W / 2, 130);
      g.fillStyle = '#ff8fb0'; g.font = '700 34px sans-serif'; g.fillText(String(o.kicker || '').toUpperCase(), W / 2, 260);
      g.fillStyle = '#fff'; g.font = '700 96px Georgia, serif'; var y = wrap(g, o.title || '', W / 2, 420, 900, 110);
      if (o.big) { g.fillStyle = '#ffb84d'; g.font = '700 180px Georgia, serif'; g.fillText(o.big, W / 2, y + 120); y += 220; }
      g.fillStyle = 'rgba(255,255,255,.85)'; g.font = '400 46px sans-serif';
      (o.lines || []).forEach(function (l) { y = wrap(g, l, W / 2, y + 60, 880, 62); });
      g.fillStyle = 'rgba(255,255,255,.4)'; g.font = '400 32px sans-serif'; g.fillText(o.foot || 'Private, consent-first games for couples', W / 2, H - 80);
      return c;
    },
    share: function (o) {
      var c = SHARE.card(o);
      c.toBlob(function (b) {
        var f = new File([b], 'kamaagni.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], title: o.title }).catch(function () {});
        else { var a = doc.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'kamaagni-result.png'; a.click(); if (window.KX) KX.toast('Image saved'); }
      }, 'image/png');
    }
  };
  window.KA_SHARE = SHARE;


  /* ---------- step-by-step walkthrough for older games ---------- */
  var HOW = {
    'kamaagni-showdown': ['Seduction Showdown', ['Each round you both build a line-up: contenders, then add-ons (+ or −) and twists.', 'Play one card or pass each turn. When both pass in a row, the higher total wins the round.', 'The round winner picks a prize challenge; the other partner can bail twice per game.', 'Most rounds won takes the final reward. Pass is always allowed.']],
    'kamaagni-connect-foreplay': ['Connect Foreplay', ['Take turns dropping a disc into a column, like Connect Four.', 'Four in a row (across, down or diagonal) wins the round and unlocks a challenge.', 'The winner decides who does each challenge and can re-draw one. The other can always pass.', 'Rounds get hotter as you go. Choose Sweet, Spicy or Wild before you start.']],
    'kamaagni-task-deck': ['Task Deck', ['Tick the packs you both want (each shows its heat), or tap Surprise me.', 'Draw a task. The chip says who it’s for when a task is written for one of you.', 'Done ✓ removes it from the deck; Pass draws another. Timed tasks get a timer.', 'Task of the day stays the same all day. Pass or stop any time.']],
    'kamaagni-secret': ['Secret Envelope', ['Write a dare, promise or message, or tap the dice for an idea.', 'Optionally lock it until a date and time.', 'Seal & share sends a private link. It opens only on their phone, never stored online in plain text.', 'They can reply from the envelope.']],
    'kamaagni-challenges': ['Challenges', ['Pick Couple, For him or For her, and set a start date if you like.', 'Do them in order (easiest first) or jump to any one. Tick each one when done.', 'Add things you both want to the Wish list.', 'A safe word always stops the challenge.']],
    'kamaagni-journey': ['BDSM Journey', ['500 beginner tasks in 10 categories and 5 levels.', 'Agree a reward for finishing each level before you start.', 'Tap Pick a task, or choose from the list. Tick it when done.', 'Agree a safe word first. Stop or skip any time.']],
    'kamaagni-fun': ['Free-time Fun', ['Pick an activity at the top: date wheel, questions, fantasy or story builder, quiz, two truths.', 'Play face to face on one phone, or live on two phones when linked in Together.', 'Everything follows your heat level and topic filters.']],
    'kamaagni-love-languages': ['Love Languages', ['Each of you answers 15 either-or questions on your own.', 'See your top love language, then compare side by side.', 'Try the “speak their language this week” idea.']],
    'kamaagni-invite': ['Invites & Secret Wishes', ['Invite: pick a line worded the way your partner likes to be asked (from the Talk Kit), or write your own, then send or copy.', 'Inbox: answer Yes, Not tonight but…, or Let’s plan. On a shared plan you can skip one step.', 'Secret wishes: tick what you’d love. You only ever see the wishes you both picked.', 'Sending to their phone needs you to be linked; otherwise copy and share.']],
    'kamaagni-print': ['Print Studio', ['Choose what to print: a deck, a task pack, your favourites, your own cards or a gift box.', 'Pick a size (12, 8 or 4 per A4), how many, and whether to print card backs.', 'Print at “Actual size”. For backs, print double-sided and flip on the long edge.']],
    'kamaagni-dates': ['Our Dates', ['Add anniversaries, birthdays and firsts. Tick “Every year” for yearly dates.', 'Each date shows a countdown and how many years.', 'In the last week you get ideas for the day and a one-tap Memory Book page. Home reminds you too.']],
    'kamaagni-apart': ['Long-distance', ['Set your partner’s time zone to see both clocks and whether it’s a good time to call.', 'Set the date you next meet for a countdown.', 'Do today’s task and ritual together, then mark it done.', 'Send a quick nudge, or play a story or two-phone game apart.']],
    'kamaagni-memories': ['Memory Book', ['Tap + New after a special night, trip or moment.', 'Add a date, notes, tags and a rating from each of you.', 'Search and filter later, and mark ones you want to do again.']],
    'kamaagni-movies': ['Movie Night', ['Filter by mood, heat and length, or search a title.', 'Tap Pick one for us, or add films to Our list with ♡.', 'Each of you stars films you want; Together shows the ones you both want.', 'Mark watched and rate it together.']],
    'kamaagni-playlist': ['Our Playlist', ['Filter songs by mood, or search.', 'Tap Play to open the song; ♡ saves it to your list.', 'Make tonight’s set picks five songs for the mood.']],
    'intimacy_ludo_dice_game_single_page': ['Ludo Dice', ['Roll the dice and move your token around the board.', 'Landing on a tile gives you a card to do together.', 'Your heat level in Settings decides how spicy cards can be.', 'Pass any card you do not both want. First home wins.']],
    'intimacy_dice_game_single_page': ['Dice', ['Roll the dice. Each face is an action or a place.', 'Do what the faces say together, or pass.', 'Turn the heat down in Settings any time.']],
    'kamaagni-poker-quick': ['Poker Night', ['Play a hand of poker. Winners choose a forfeit from the list.', 'The loser carries it out, or both pass.', 'Everything is optional. Pause any time.']],
    'intimacy_Position_Selector_page': ['Position Selector', ['Tap Roll to draw a position that fits your heat level.', 'Mark it as done or save it with the heart.', 'Use the history and Liked tabs to find favourites again.']],
    'intimacy_Oral_Position_Selector_page': ['Oral Selector', ['Tap Roll to draw an idea at your heat level.', 'Mark it done or save it with the heart.', 'Check in with each other. Slow down or stop any time.']]
  };
  var pageKey = (location.pathname.match(/([^\/]+)\.html/) || [])[1];
  function addHow() {
    if (!HOW[pageKey] || doc.getElementById('kh-how')) return; var p = doc.getElementById('kh-pause'); if (!p) return;
    var b = doc.createElement('button'); b.className = 'kh-b'; b.id = 'kh-how'; b.type = 'button'; b.title = 'How to play'; b.setAttribute('aria-label', 'How to play'); b.textContent = '❓';
    b.onclick = function () {
      var h = HOW[pageKey], i = 0, o = doc.createElement('div'); o.id = 'kx-pause';
      function draw() { o.innerHTML = '<div class="kp-in"><div class="kp-t">' + esc(h[0]) + '</div><p style="font-size:13px;opacity:.7">Step ' + (i + 1) + ' of ' + h[1].length + '</p><p style="font-size:17px;line-height:1.5">' + esc(h[1][i]) + '</p><div class="kp-row"><button data-k="n">' + (i < h[1].length - 1 ? 'Next' : 'Got it') + '</button>' + (i ? '<button data-k="b" class="kp-s">Back</button>' : '') + '</div></div>';
        o.querySelectorAll('button').forEach(function (x) { x.onclick = function () { if (x.dataset.k === 'b') i--; else if (i < h[1].length - 1) i++; else { o.remove(); return; } draw(); }; }); }
      draw(); doc.body.appendChild(o); o.onclick = function (e) { if (e.target === o) o.remove(); };
    };
    p.parentNode.insertBefore(b, p);
  }
  var ht = 0; (function w2() { if (doc.getElementById('kh-pause')) addHow(); else if (++ht < 40) setTimeout(w2, 200); })();

  /* ---------- styles ---------- */
  var s = doc.createElement('style'); s.textContent =
    '#kx-pause{position:fixed;inset:0;z-index:100000;background:rgba(5,3,12,.86);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:16px}' +
    '.kp-in{width:100%;max-width:420px;border-radius:24px;border:1px solid rgba(255,255,255,.18);background:#120a22;padding:22px;text-align:center;color:#f5ecff;font-family:DM Sans,system-ui,sans-serif}' +
    '.kp-t{font-family:Cormorant Garamond,serif;font-size:32px;margin-bottom:4px}.kp-in p{opacity:.8;margin:6px 0 14px}' +
    '.kp-row{display:flex;flex-direction:column;gap:8px;margin:10px 0}.kp-row button{padding:13px;border-radius:14px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.06);color:inherit;font:inherit;font-weight:600;cursor:pointer}' +
    '.kp-g{background:rgba(60,200,120,.2)!important}.kp-a{background:rgba(255,184,77,.2)!important}.kp-r{background:rgba(255,80,90,.25)!important}.kp-msg{font-size:14px;line-height:1.5;text-align:left;margin-top:6px}' +
    '#kh-pause{font-size:16px}' +
    '#kx-inst{position:fixed;left:12px;right:12px;bottom:92px;z-index:9999;display:flex;gap:10px;align-items:center;padding:12px 14px;border-radius:16px;background:#1a1030;border:1px solid rgba(255,255,255,.2);color:#f5ecff;font:14px DM Sans,system-ui,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,.5)}#kx-inst span{flex:1}#kx-inst button{padding:8px 12px;border-radius:999px;border:0;background:linear-gradient(135deg,#ff5d8f,#8b6cff);color:#fff;font:inherit;font-weight:700;cursor:pointer}#kx-inst #kxi-n{background:transparent;border:1px solid rgba(255,255,255,.25)}';
  doc.head.appendChild(s);
})();
