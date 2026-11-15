/* KamaAgni partner nudges (v73): invitations in your partner's favourite style, replies, shared plans and secret wishes.
   Rides on the existing encrypted couple events (KA_CLOUD.couple.send). Event kinds: inv, rsvp, plan, wish, veto, ldr. */
(function () {
  'use strict';
  if (window.KA_NUDGE) return;
  function C() { return window.KA_CLOUD; }
  function st() { var c = C(); return c && c.state ? c.state() : null; }
  function linked() { var s = st(); return !!(s && s.couple && s.couple.partnerJoined && s.vault === 'ready'); }
  function rd(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function names() { var c = rd('ka_couple', {}) || {}; return [c.p1 || 'Me', c.p2 || 'My love']; }
  function send(kind, body) {
    if (!linked()) return Promise.reject(new Error('Link with your partner first (Account → Link partner).'));
    body = body || {}; body.n = body.n || names()[0];
    return C().couple.send(kind, body);
  }
  /* Invitation templates, one set per "How I like to be asked" style (Talk Kit). Wording is KamaAgni's own. */
  var STYLE = {
    'A text earlier in the day': ['I can’t stop thinking about you. Tonight? 🔥', 'Clear your evening. I have plans for you.', 'Counting the hours until I can get my hands on you.'],
    'A long, slow kiss': ['Come here. I owe you a very long kiss… and maybe more.', 'Meet me for one slow kiss. Then we’ll see.'],
    'Say it out loud, plainly': ['I want you tonight. Are you in?', 'Sex tonight? I’d really love that.'],
    'A touch while we’re busy': ['Next time I walk past you, that’s your invitation 😉', 'Expect a hand on your waist later. It means what you think.'],
    'Put it in our plans': ['Booking you for tonight at 9. Just us, phones away.', 'Saturday night is ours. Block it out.'],
    'A playful dare': ['Dare: meet me in the bedroom in 15 minutes, wearing less than now.', 'I dare you to say yes to whatever I have planned.'],
    'Start with a massage': ['Massage tonight. Oil’s ready. Where it goes from there is up to you.'],
    'Ask “Do you want to…?”': ['Do you want to make tonight about us?', 'Do you want to try something new with me tonight?'],
    'Send a song or a photo': ['Listen to this and think of me tonight 🎵', 'This song is my invitation. Play it later.'],
    'Run a bath for us': ['I’m running a bath for two. Come and get in.'],
    '_': ['Tonight, just you and me? 💞', 'I’ve missed you. Make some time for me tonight?', 'Fancy an early night… together?']
  };
  function templates(partnerAsk) {
    var out = [], pick = (partnerAsk && partnerAsk.yes) || [];
    pick.forEach(function (s) { (STYLE[s] || []).forEach(function (t) { out.push({ s: s, t: t }); }); });
    STYLE._.forEach(function (t) { out.push({ s: '', t: t }); });
    return out;
  }
  /* Secret wishes: shown only when both of you picked the same one. */
  var WISHES = ['A whole evening of slow kissing', 'Being undressed slowly', 'A long massage that turns into more', 'Trying a new position', 'Morning sex', 'Shower sex', 'Using a blindfold', 'Being tied up (gently)', 'Tying you up', 'Watching you touch yourself', 'Talking dirty', 'Sex somewhere new in the house', 'A hotel night', 'Role-play night', 'A striptease', 'Taking turns being in charge', 'Oral, with no rush at all', 'A quickie', 'Toys together', 'Making a sexy photo set (just for us)', 'A night where only one of us receives', 'Edging: build up, stop, repeat', 'Candles, music, the full romance', 'Something we’ve never tried'];
  function wishKey(w) { var h = 0; for (var i = 0; i < w.length; i++) h = (h * 31 + w.charCodeAt(i)) | 0; return 'w' + (h >>> 0).toString(36); }
  window.KA_NUDGE = { linked: linked, send: send, templates: templates, STYLE: STYLE, WISHES: WISHES, wishKey: wishKey };
})();
