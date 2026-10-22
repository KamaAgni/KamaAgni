/* KamaAgni content filter. Topics switched OFF in Settings disappear everywhere:
   fetched data (packs, tasks, journey...), built-in decks (KA_DATA), embedded game decks, menus, and whole pages.
   Setting is stored in ka_filter and syncs with the account. */
(function () {
  'use strict';
  var TOPICS = [
    { id: 'anal', l: 'Anal play', d: 'Anal sex, rimming, plugs, pegging, prostate play', re: '\\banal\\b|\\banus\\b|\\bass(?:hole)?\\b|\\bbutt\\b|\\bbutts\\b|butt ?plug|rimming|rim ?job|\\brimjob|pegging|prostate|sodom|backdoor|back door' },
    { id: 'oral', l: 'Oral sex', d: 'Blowjobs, cunnilingus, 69, face-sitting, deep-throat', re: '\\boral\\b|blow ?job|cunnilingus|fellatio|deep-?throat|\\bsuck(?:s|ing|ed)?\\b|\\blick(?:s|ing|ed)?\\b|face-?sitting|\\b69\\b|sixty-?nine|going down on|eat (?:her|him|you|them) out|eating out' , pages: ['intimacy_Oral_Position_Selector_page'] },
    { id: 'bdsm', l: 'BDSM &amp; power play', d: 'Bondage, dominance and submission, obedience, restraints, collars, punishment', re: 'bdsm|\\bkink|bondage|\\bbound\\b|\\brope|restrain|handcuff|\\bcuffs?\\b|dominat|submissi|\\bsubmit|\\bslave|\\bmaster\\b|mistress|punish|obey|obedien|kneel|\\bcage|chastity|\\bgag(?:ged|ging)?\\b|shibari|tied up|tie (?:you|her|him|them|your)|\\bsir\\b|\\bdom\\b|\\bsubs?\\b|power exchange|pet play|puppy|dungeon|collar|leash|\\bowned\\b|\\bowner\\b|submissive|\\bdaddy\\b|femdom|maledom', pages: ['kamaagni-journey'], keys: ['bdsm', 'punish'], ids: ['hornobdsm', 'bdsm'] },
    { id: 'pain', l: 'Spanking &amp; impact / pain', d: 'Spanking, slapping, whips, paddles, clamps, wax, pinching', re: 'spank|\\bslap|\\bwhip|flog|\\bcane\\b|\\bcrop\\b|paddle|clamp|\\bwax\\b|candle wax|\\bpinch|bruis|\\bsting|\\bwelt|\\bpain\\b|painful|hard bit|\\bburn' },
    { id: 'breath', l: 'Choking &amp; breath play', d: 'Neck grabbing, choking, breath control (higher physical risk)', re: 'chok|strangl|breath ?play|breath control|neck grab|throat|asphyx|smother|\\bgasp for', defOff: 1 },
    { id: 'humil', l: 'Humiliation &amp; degradation', d: 'Insults, degrading names, verbal humiliation', re: 'humiliat|degrad|\\bslut|\\bwhore|worthless|insult|verbal abuse|belittl|\\bcuck|dirty names?|call (?:you|her|him|them) (?:a |my )?(?:slut|whore|bitch)' },
    { id: 'public', l: 'Public &amp; risky places', d: 'Outdoors, exhibitionism, voyeurism, getting caught', re: 'public|outdoor|exhibition|voyeur|\\bcaught\\b|stranger|elevator|car park|parking|in the car|\\bcar\\b.*\\b(?:sex|kiss|touch)|balcony|restaurant|cinema|\\bclub\\b|\\bbeach\\b|\\bhike\\b|forest|rooftop|changing room|fitting room|toilet|restroom' },
    { id: 'group', l: 'Third parties &amp; swinging', d: 'Threesomes, swinging, cuckolding, other people involved', re: 'threesome|three-?some|foursome|swing(?:er|ing)|cuckold|hot ?wife|orgy|group sex|gang ?bang|third person|another (?:man|woman|person|couple|girl|guy)|invite (?:a|another)|with a friend|dp\\b|bull\\b' },
    { id: 'toys', l: 'Sex toys', d: 'Vibrators, dildos, plugs, wands, cock rings, strap-ons', re: 'vibrat|dildo|\\bsex toys?\\b|\\btoys?\\b(?!\\s+with)|\\bwand\\b|\\bplug\\b|strap-?on|cock ring|\\bbullet\\b|massager|fleshlight|\\bbeads\\b|\\bhitachi|\\blovense|remote[- ]control' },
    { id: 'cum', l: 'Cum play', d: 'Swallowing, facials, creampies, cum on body', re: '\\bcum\\b|\\bcumming|swallow|creampie|\\bfacial|semen|ejaculat|squirt|\\bjizz|bukkake|finish (?:on|in)|\\bcome on\\b|\\bcome in\\b|\\bload\\b|\\bcumshot|\\bcum-?play' },
    { id: 'extreme', l: 'Extreme / bodily fluids', d: 'Piss, scat, needles, blood, fisting, sounding, suspension, electro', re: '\\bpiss|\\burin|golden shower|water ?sports?|\\bscat\\b|urethra|sounding|\\bfist(?:ing)?\\b|\\bblood|\\bknife|needle|branding|electro|\\bshock|\\bcbt\\b|ball ?bust|trampl|enema|catheter|suspension|mummif|straitjacket|gas ?mask|spit(?:ting)?\\b|\\bsaliva', defOff: 1 },
    { id: 'roleplay', l: 'Roleplay &amp; costumes', d: 'Characters, scenarios, costumes, uniforms', re: 'role-?play|role play|\\bpretend|\\bcostume|\\buniform|\\bpersona\\b|\\bscenario', pages: ['kamaagni-roleplay'] },
    { id: 'photo', l: 'Photos, videos &amp; sexting', d: 'Nudes, sexting, recording, camera and video play', re: '\\bnudes?\\b|sext|selfie|\\bphotos?\\b|\\bpics?\\b|\\bvideos?\\b|\\bcamera\\b|webcam|\\bfilm(?:ed|ing)?\\b|record(?:ing)? (?:yourself|us|a video|it)|live ?stream' },
    { id: 'alcohol', l: 'Alcohol', d: 'Wine, drinks and drunk play', re: '\\balcohol|\\bwine\\b|champagne|\\bdrunk|\\btipsy|\\bshots?\\b|\\bbeer\\b|cocktail|\\bwhisk' },
    { id: 'tease', l: 'Edging &amp; orgasm control', d: 'Edging, denial, orgasm control, forced orgasm', re: '\\bedging|\\bedge\\b|denial|orgasm control|orgasm denial|forced orgasm|ruined orgasm|\\bbegging|\\bbeg\\b|ruin(?:ed)? orgasm' }
  ];
  var FALLBACK = 'Share a slow, tender kiss and tell them one thing you love about them.';
  var LS = window.localStorage;
  var cache = null, cacheRaw = null;
  function read() { var raw = null; try { raw = LS.getItem('ka_filter'); } catch (e) {} if (raw === cacheRaw && cache) return cache; var f = {}; try { f = JSON.parse(raw) || {}; } catch (e) {} f.off = f.off || null; f.pages = f.pages || {}; f.words = f.words || []; if (!f.off) { f.off = {}; TOPICS.forEach(function (t) { if (t.defOff) f.off[t.id] = 1; }); } cacheRaw = raw; cache = f; cache.re = null; build(cache); return cache; }
  function build(f) { var parts = [], by = []; TOPICS.forEach(function (t) { if (f.off[t.id]) { parts.push(t.re); by.push(t); } }); f.words.forEach(function (w) { w = String(w).trim(); if (w) parts.push('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b'); }); try { f.re = parts.length ? new RegExp(parts.join('|'), 'i') : null; } catch (e) { f.re = null; } f.topics = by; }
  function save(f) { var o = { off: f.off, pages: f.pages, words: f.words, v: 1 }; LS.setItem('ka_filter', JSON.stringify(o)); cacheRaw = null; cache = null; try { window.dispatchEvent(new CustomEvent('ka:filter')); } catch (e) {} }
  function bad(s) { var f = read(); return !!(f.re && typeof s === 'string' && f.re.test(s)); }
  function leaf(el) { // text used to judge an array element
    if (typeof el === 'string') return el;
    if (Array.isArray(el)) return el.filter(function (x) { return typeof x === 'string'; }).join(' ');
    if (el && typeof el === 'object') { var out = []; for (var k in el) if (typeof el[k] === 'string' && k !== 'id' && k !== 'icon' && k !== 'code' && k !== 'tip' && k !== 'p' && k !== 'f' && k !== 'rarity' && k !== 'type') out.push(el[k]); return out.join(' '); }
    return '';
  }
  var SKIP_KEYS = { cats: 1, levels: 1, p_unused: 1 };
  function deep(x, key, safe) {
    var f = read(); if (!f.re) return x;
    if (Array.isArray(x)) {
      if (SKIP_KEYS[key]) return x;
      var out = [], idx = [], i, el, t;
      for (i = 0; i < x.length; i++) {
        el = x[i];
        if (typeof el === 'string') { if (!bad(el)) { out.push(el); idx.push(i); } continue; }
        if (Array.isArray(el)) { t = leaf(el); if (!bad(t)) { out.push(deep(el, null, safe)); idx.push(i); } continue; }
        if (el && typeof el === 'object') { t = leaf(el); if (bad(t)) continue; out.push(deep(el, null, safe)); idx.push(i); continue; }
        out.push(el); idx.push(i);
      }
      if (!out.length && x.length && safe) { out = typeof x[0] === 'string' ? [FALLBACK] : x.slice(0, 1); idx = [0]; }
      if (out.length !== x.length) out.__idx = idx;
      return out;
    }
    if (x && typeof x === 'object') {
      var o = {}, k;
      for (k in x) {
        if (/^(bdsm|punish)$/.test(k) && f.off.bdsm && Array.isArray(x[k])) continue;
        o[k] = deep(x[k], k, safe);
      }
      return o;
    }
    return x;
  }
  function topicOff(id) { return !!read().off[id]; }
  function pageHidden(name) { var f = read(); name = String(name || '').replace(/\.html.*$/, '').replace(/^.*\//, ''); if (f.pages[name]) return true; return TOPICS.some(function (t) { return f.off[t.id] && t.pages && t.pages.indexOf(name) > -1; }); }
  function origIdx(arr, i) { return arr && arr.__idx ? arr.__idx[i] : i; }
  function keep(arr) { return deep(arr, null, true); }

  /* fetched data */
  var of = window.fetch;
  if (of) window.fetch = function (u, o) {
    var url = typeof u === 'string' ? u : (u && u.url) || '';
    if (!/\/data\/[^?#]*\.json/.test(url) || /programs\.json|experts_qa\.json/.test(url) || !read().re) return of.apply(this, arguments);
    return of.apply(this, arguments).then(function (r) {
      if (!r.ok) return r;
      var id = (url.match(/\/([^\/?#]+)\.json/) || [])[1] || '';
      var f = read();
      return r.clone().json().then(function (j) {
        if (f.topics.some(function (t) { return t.ids && t.ids.indexOf(id) > -1; })) j = Array.isArray(j) ? [] : j;
        var res = deep(j, null, false);
        return { ok: true, status: 200, url: url, headers: r.headers, json: function () { return Promise.resolve(res); }, text: function () { return Promise.resolve(JSON.stringify(res)); }, clone: function () { return this; } };
      }, function () { return r; });
    });
  };

  /* hide links & block hidden pages */
  function sweep() {
    var as = document.querySelectorAll('a[href*=".html"]'), i, n, h, f = read();
    for (i = 0; i < as.length; i++) { h = as[i].getAttribute('href') || ''; n = (h.match(/([^\/?#]+)\.html/) || [])[1]; if (n && pageHidden(n)) as[i].style.display = 'none'; else if (as[i].style.display === 'none' && as[i].__kaH) as[i].style.display = ''; if (n && pageHidden(n)) as[i].__kaH = 1; }
    if (/kamaagni-learn/.test(location.pathname)) { var li = document.querySelectorAll('li'); for (i = 0; i < li.length; i++) li[i].style.display = bad(li[i].textContent) ? 'none' : ''; }
    var cur = (location.pathname.match(/([^\/]+)\.html/) || [])[1];
    if (cur && cur !== 'index' && cur !== 'about' && cur !== 'kamaagni-settings' && pageHidden(cur) && !document.getElementById('ka-blocked')) {
      var d = document.createElement('div'); d.id = 'ka-blocked'; d.style.cssText = 'position:fixed;inset:0;z-index:2147481000;background:#05060f;color:#dce9ff;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;font-family:"DM Sans",system-ui,sans-serif';
      d.innerHTML = '<div style="max-width:380px"><div style="font-size:44px">🔒</div><h2 style="font-family:Cinzel,serif;color:#f4a0ae">Hidden by your settings</h2><p style="color:#a8bcd8;line-height:1.6">You switched this topic off. Change it any time in Settings.</p><a href="' + (location.pathname.indexOf('/games/') > -1 ? '' : 'games/') + 'kamaagni-settings.html" style="display:inline-block;margin:6px;padding:12px 22px;border-radius:999px;background:linear-gradient(135deg,#e8637a,#f07090);color:#fff;font-weight:700;text-decoration:none">Open Settings</a><a href="' + (location.pathname.indexOf('/games/') > -1 ? '../' : '') + 'index.html" style="display:inline-block;margin:6px;padding:12px 22px;border-radius:999px;border:1px solid rgba(255,255,255,.2);color:#a8bcd8;text-decoration:none">Home</a></div>';
      document.body.appendChild(d);
    }
  }
  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  ready(function () { sweep(); setTimeout(sweep, 400); setTimeout(sweep, 1500); });
  window.addEventListener('ka:filter', sweep);

  window.KA_FILTER = { TOPICS: TOPICS, get: read, save: save, bad: bad, ok: function (s) { return !bad(s); }, deep: deep, keep: keep, topicOff: topicOff, pageHidden: pageHidden, origIdx: origIdx, sweep: sweep };
})();
