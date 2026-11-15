/* KamaAgni setup tidy (v78): the older games with long setup screens (Poker, Connect Foreplay, Showdown) get the
   same layout as the shared setup screen: the choices that matter (how you play, heat) and Start stay on the first
   screen; everything else moves into a "⚙️ Customise" section that remembers if you keep it open. Loaded by ka-chrome. */
(function () {
  'use strict';
  var D = document;
  var MAP = {
    'kamaagni-poker-quick': { start: '#startBtn', keep: /heat level|where are you playing/i },
    'kamaagni-connect-foreplay': { start: '#startBtn', keep: /how do you want to play|naughtiness/i },
    'kamaagni-showdown': { start: '#go', keep: /how do you want to play|heat/i }
  };
  var page = (location.pathname.match(/([^\/]+)\.html$/) || [])[1], cfg = MAP[page];
  if (!cfg) return;
  function rd(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function isHead(e) { return e.nodeType === 1 && (e.tagName === 'LABEL' || /(^|\s)(eyebrow|kx-sec)(\s|$)/.test(e.className || '')) && !e.closest('.kd-more'); }
  function tidy() {
    var go = D.querySelector(cfg.start); if (!go || go.dataset.tidy) return;
    var root = D.getElementById('app') || D.querySelector('main') || D.body;
    /* headings that come before Start, in page order */
    var heads = [].slice.call(root.querySelectorAll('label, .eyebrow, .kx-sec')).filter(function (h) {
      return isHead(h) && h.offsetParent && (h.compareDocumentPosition(go) & Node.DOCUMENT_POSITION_FOLLOWING) && !h.closest('header,footer,.kh,#ka-hdr');
    });
    if (heads.length < 2) return;
    go.dataset.tidy = '1';
    var det = D.createElement('details'); det.className = 'kd-more'; det.id = 'kd-more'; if (rd('ka_setup_open', 0)) det.open = true;
    det.innerHTML = '<summary><b>⚙️ Customise</b><span></span></summary>';
    var moved = [];
    heads.forEach(function (h, i) {
      var txt = (h.textContent || '').trim();
      /* keep the section titles that sit directly above a kept choice */
      if (cfg.keep.test(txt)) return;
      if (/presents/i.test(txt) || (h.nextElementSibling && /^H[12]$/.test(h.nextElementSibling.tagName))) return;   /* page title area stays */
      var nextKeep = heads.slice(i + 1).find ? heads.slice(i + 1).find(function (x) { return !/eyebrow|kx-sec/.test(x.className || ''); }) : null;
      if (/eyebrow|kx-sec/.test(h.className || '') && nextKeep && cfg.keep.test(nextKeep.textContent || '') && h.parentNode === nextKeep.parentNode) return;
      var grp = [h], n = h.nextSibling;
      while (n && !(n.nodeType === 1 && (isHead(n) || n === go || n.contains(go) || /^H[12]$/.test(n.tagName)))) { grp.push(n); n = n.nextSibling; }
      /* a heading on its own inside a wrapper: move the wrapper's following content with it */
      grp.forEach(function (x) { moved.push(x); });
      moved.push(null);
    });
    if (!moved.length) return;
    var box = D.createElement('div');
    moved.forEach(function (x) { if (x) box.appendChild(x); });
    det.appendChild(box);
    /* summary: the labels inside, so you know what's there */
    det.querySelector('summary span').textContent = [].slice.call(box.querySelectorAll('label,.kx-sec')).map(function (l) { return (l.textContent || '').trim().replace(/[?:(].*$/, ''); }).filter(Boolean).slice(0, 4).join(' · ');
    var host = go.parentNode.classList && go.parentNode.classList.contains('kx-row') ? go.parentNode : go;
    host.parentNode.insertBefore(det, host.nextSibling);
    det.addEventListener('toggle', function () { try { localStorage.setItem('ka_setup_open', det.open ? 1 : 0); } catch (e) {} });
    /* hide empty panels left behind */
    [].slice.call(root.querySelectorAll('.panel, .kx-card')).forEach(function (p) { if (!p.contains(go) && !p.contains(det) && !(p.textContent || '').replace(/\s/g, '').length) p.style.display = 'none'; });
  }
  var t = 0, mo = new MutationObserver(function () { clearTimeout(t); t = setTimeout(tidy, 60); });
  function boot() { tidy(); mo.observe(D.body, { childList: true, subtree: true }); }
  if (D.readyState !== 'loading') boot(); else D.addEventListener('DOMContentLoaded', boot);
})();
