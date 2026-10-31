/* KA_DUO: live two-phone play for turn-based games, on top of the linked Together connection.
   State object S must carry {mode:'two', gid, seq}. Whoever acts publishes the full state; the partner adopts it.
   Usage:  const D = KA_DUO.init({g:'td', key:'ka_td_v1', onState:(S, first)=>render(), onQuit:()=>render()}); */
(function () {
  'use strict';
  function LSget(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function LSset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function myName() { var c = LSget('ka_couple', {}) || {}; return c.p1 || 'Me'; }
  function toast(m) { if (window.KA && KA.toast) KA.toast(m); }
  function init(o) {
    var C = function () { return window.KA_CLOUD; };
    var D = { me: LSget(o.key + '_me', 0), partner: '', S: null, on: false };
    D.linked = function () { var c = C(), q = c ? c.state() : {}; return !!(q.user && q.vault === 'ready' && q.couple && q.couple.partnerJoined && q.couple.hasKey); };
    D.myName = myName;
    D.setMe = function (i) { D.me = i; LSset(o.key + '_me', i); };
    /* names in player order [p0, p1]; slot D.me is my own name */
    D.names = function (S) { var me = myName(), p = D.partner || 'Your partner'; return S && S.mode === 'two' ? (D.me === 0 ? [me, p] : [p, me]) : (S && S.names) || [(me && me !== 'Me' ? me : (LSget('ka_couple', {}) || {}).p1 || 'Partner 1'), (LSget('ka_couple', {}) || {}).p2 || 'Partner 2']; };
    D.publish = function (S) {
      if (!S || S.mode !== 'two' || !D.linked()) return;
      S.seq = (S.seq || 0) + 1;
      C().couple.send('fun', { g: o.g, st: S, n: myName() }).catch(function () { toast('Could not reach your partner. Check your connection.'); });
    };
    D.save = function (S) { LSset(o.key, S); D.publish(S); };
    D.load = function () { var s = LSget(o.key, null); return s && s.phase && s.phase !== 'end' ? s : null; };
    D.clear = function () { try { localStorage.removeItem(o.key); } catch (e) {} };
    D.quit = function (S) {
      if (!S) return; var id = S.gid, two = S.mode === 'two'; D.clear();
      if (two && D.linked() && id) C().couple.send('fun', { g: o.g, q: id, n: myName() }).catch(function () {});
    };
    function apply(e) {
      var b = e.body; if (!b || e.kind !== 'fun' || b.g !== o.g || e.mine) return;
      if (b.n) D.partner = b.n;
      var cur = o.get ? o.get() : D.S;
      if (b.q) { if (cur && cur.gid === b.q) { D.clear(); toast('Your partner ended the game.'); o.onQuit && o.onQuit(); } return; }
      var st = b.st; if (!st || st.mode !== 'two') return;
      if (Date.now() - new Date(e.at).getTime() > 8 * 3600e3) return;
      if (cur && cur.gid > st.gid) return;
      if (cur && cur.gid === st.gid && o.merge) { var mg = o.merge(cur, st); if (mg) { LSset(o.key, mg); o.onState && o.onState(mg, false); } return; }
      if (cur && cur.gid === st.gid && (cur.seq || 0) >= (st.seq || 0)) return;
      if (!cur && (st.phase === 'end' || st.phase === 'final')) return;
      var first = !cur || cur.gid !== st.gid; if (first) D.setMe(1);
      LSset(o.key, st);
      if (first) toast((D.partner || 'Your partner') + ' started a game. Joining!');
      o.onState && o.onState(st, first);
    }
    D.start = function () { if (D.on || !D.linked()) return; D.on = true; C().couple.live(apply, function () {}, myName()); };
    window.addEventListener('ka:cloud', function () { if (D.linked()) D.start(); else D.on = false; o.onLink && o.onLink(); });
    setTimeout(D.start, 400);
    return D;
  }
  window.KA_DUO = { init: init };
})();
