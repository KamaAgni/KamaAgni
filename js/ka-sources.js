/* KamaAgni "Printable originals" (v72): at the bottom of a game, link to the GitHub folder(s) that game comes from
   and list every PDF in those folders, each openable in the in-app Reader or on GitHub.
   Folder list per page is below; PDF names come from data/library.json. */
(function () {
  'use strict';
  var D = document;
  if (window.KA_SOURCES) return;
  var me = D.currentScript && D.currentScript.src || '';
  var BASE = me ? me.replace(/js\/ka-sources\.js.*$/, '') : (/\/games\//.test(location.pathname) ? '../' : '');
  var REPO = 'KamaAgni/KamaAgniPDF', BR = 'main';
  /* page (file name without .html) -> folders in the KamaAgniPDF repo (a path ending in .pdf means a single file) */
  var MAP = {
    'kamaagni-hornopoly': ['9 Kinky Games/Hornopoly_Board_and_Rules.pdf_and_3_other_files'],
    'kamaagni-truth-or-dare': ['9 Kinky Games/280_truth_or_dare_cards'],
    'kamaagni-would-you-prefer': ['9 Kinky Games/Would_you_prefer_-_sex_cards'],
    'kamaagni-roleplay': ['9 Kinky Games/Roleplay_Cards'],
    'kamaagni-kinky-dice': ['9 Kinky Games/BDSM_Sex_Dice', '9 Kinky Games/Sexdicegame.pdf', '8 Christmas Games/Christmas Sex dice game.pdf'],
    'intimacy_dice_game_single_page': ['9 Kinky Games/Sexdicegame.pdf', '9 Kinky Games/BDSM_Sex_Dice'],
    'kamaagni-kink-explorer': ['1 Kink Lists/Kink_List_4.0'],
    'kamaagni-desire-match': ['1 Kink Lists/Kink_List_4.0'],
    'kamaagni-spark-challenge': ['9 Kinky Games/Whole_Week_Sex_Cards'],
    'kamaagni-bucket-list': ['9 Kinky Games/Cum_bucket_list', '9 Kinky Games/SexWishList (1).pdf'],
    'kamaagni-match-reward': ['9 Kinky Games/Punishment_and_Reward_Tracker'],
    'kamaagni-love-coupons': ['6 Sex Coupons'],
    'kamaagni-prompts': ['5 Submissive Woman'],
    'kamaagni-journey': ['11 Slut Tasks Set/500_BDSM_Tasks_for_Beginners', '5 Submissive Woman/Certification_and_Contract'],
    'kamaagni-challenges': ['9 Kinky Games/BraveCards2nd.pdf', '9 Kinky Games/BDSMSexgame2.0.pdf', '9 Kinky Games/BDSMsexGameAll.pdf'],
    'kamaagni-planner': ['9 Kinky Games/Sex_Calendar_2026_27', '7 Naughty Games/ValentinesSexyCalendar.pdf', '2 Exclusive Products'],
    'kamaagni-task-deck': ['12 2026 Releases', '11 Slut Tasks Set', '10 2025 Releases', '8 Christmas Games', '9 Kinky Games/ALL_REVENGE_CARDS', '9 Kinky Games/69_Sex_Game', '9 Kinky Games/Hornopoly_Board_and_Rules.pdf_and_3_other_files'],
    'intimacy_Position_Selector_page': ['9 Kinky Games/Sex PositionsCardsAll.pdf'],
    'kamaagni-skills': ['11 Slut Tasks Set/650_Blowjob_tasks', '11 Slut Tasks Set/Anal_Sex_Tasks___Guide', '3 Exclusive Games'],
    'kamaagni-learn': ['11 Slut Tasks Set/Ebook_Master_-_Full_Size', '11 Slut Tasks Set/From_0_to_Mistress_-_Ebook_FULL_SIZE', '5 Submissive Woman/How_to_be_a_good_submissive_woman_-_Ebook'],
    'kamaagni-crazy-sex': ['7 Naughty Games'],
    'kamaagni-scratch-book': ['8 Christmas Games/Naughty_Advent_Calendar', '8 Christmas Games/Christmas Advent Calendar.pdf']
  };
  function enc(p) { return p.split('/').map(encodeURIComponent).join('/'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function slug() { var m = location.pathname.match(/([^\/]+)\.html$/); return m ? m[1] : ''; }
  function folderUrl(f, isFile) { return isFile ? 'https://github.com/' + REPO + '/blob/' + BR + '/' + enc(f) : 'https://github.com/' + REPO + '/tree/' + BR + '/' + enc(f); }
  function label(f) { return f.split('/').pop().replace(/_and_\d+_other_files$/i, '').replace(/\.pdf$/i, '').replace(/_/g, ' ').replace(/\(\d+\)/g, '').replace(/\s+/g, ' ').trim(); }
  var css = '.ks-wrap{max-width:760px;margin:26px auto 4px;padding:0 16px}.ks-wrap h2{font-family:"Cormorant Garamond",serif;font-size:24px;margin:0 0 4px;color:#fff}.ks-s{color:var(--muted,#9aa3bd);font-size:14px;margin:0 0 12px}' +
    '.ks-f{border:1px solid rgba(255,255,255,.12);border-radius:16px;background:rgba(255,255,255,.035);padding:12px 14px;margin:0 0 10px}' +
    '.ks-fh{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.ks-fh b{flex:1;min-width:150px;color:#fff;font-size:15px}' +
    '.ks-btn{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:6px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.2);color:#fff;text-decoration:none;font-size:13px;font-weight:700}' +
    '.ks-btn:hover,.ks-btn:focus-visible{border-color:rgba(232,99,122,.7);background:rgba(232,99,122,.1)}' +
    '.ks-l{list-style:none;margin:8px 0 0;padding:0}.ks-l li{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:8px 0;border-top:1px solid rgba(255,255,255,.06);font-size:14px}.ks-l li span{flex:1;min-width:160px;color:#dce9ff}.ks-l small{color:var(--muted,#9aa3bd);font-size:12px}';
  function render(lib) {
    var s = slug(), F = MAP[s]; if (!F || D.getElementById('ks-src')) return;
    var html = '<h2>📂 Printable originals</h2><p class="ks-s">The PDFs this game is based on, in your KamaAgniPDF library. Open the whole folder on GitHub, or read any file here.</p>';
    F.forEach(function (f) {
      var isFile = lib.some(function (x) { return x.p === f; });
      var files = lib.filter(function (x) { return isFile ? x.p === f : (x.p.indexOf(f + '/') === 0); });
      html += '<div class="ks-f"><div class="ks-fh"><b>' + (isFile ? '📄 ' : '📁 ') + esc(isFile && files[0] ? files[0].t : label(f)) + '</b><a class="ks-btn" href="' + folderUrl(f) + '" target="_blank" rel="noopener">' + (isFile ? 'View on GitHub ↗' : 'Open folder on GitHub ↗') + '</a></div>';
      if (files.length) {
        html += '<ul class="ks-l">' + files.map(function (x) {
          return '<li><span>' + esc(x.t) + (x.pg ? ' <small>· ' + x.pg + ' pages' + (x.mb ? ', ' + x.mb + ' MB' : '') + '</small>' : '') + '</span>' +
            '<a class="ks-btn" href="' + BASE + 'games/pdf-viewer.html?p=' + encodeURIComponent(x.p) + '&n=' + encodeURIComponent(x.t) + '">📖 Read</a>' +
            '<a class="ks-btn" href="https://github.com/' + REPO + '/blob/' + BR + '/' + enc(x.p) + '" target="_blank" rel="noopener" aria-label="' + esc(x.t) + ' on GitHub">↗</a></li>';
        }).join('') + '</ul>';
      }
      html += '</div>';
    });
    if (!D.getElementById('ks-css')) { var st = D.createElement('style'); st.id = 'ks-css'; st.textContent = css; D.head.appendChild(st); }
    var wrap = D.createElement('section'); wrap.id = 'ks-src'; wrap.className = 'ks-wrap'; wrap.setAttribute('aria-label', 'Printable originals'); wrap.innerHTML = html;
    var anchor = D.getElementById('kn-next') || D.getElementById('ka-ftr');
    if (anchor) anchor.parentNode.insertBefore(wrap, anchor); else D.body.appendChild(wrap);
  }
  function load() {
    if (!MAP[slug()]) return;
    if (window.KA_CONFIG && KA_CONFIG.LIBRARY === false) return;
    if (window.KA_EMBED && KA_EMBED['data/library.json']) return render(KA_EMBED['data/library.json']);
    fetch(BASE + 'data/library.json').then(function (r) { return r.json(); }).then(render).catch(function () { render([]); });
  }
  window.KA_SOURCES = { map: MAP };
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', function () { setTimeout(load, 900); }); else setTimeout(load, 900);
})();
