/* KamaAgni common helpers for the Together pack */
(function () {
  'use strict';
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem(k); } catch {} }
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const names = () => { const c = LS.get('ka_couple', {}) || {}; return [c.p1 || 'Partner 1', c.p2 || 'Partner 2']; };
  const HEAT = [null, 'Sweet', 'Spicy', 'Wild'];
  /* genders: 'm' | 'f' | 'x'. Default: partner 1 = man, partner 2 = woman (changeable in Settings). */
  const genders = () => { const c = LS.get('ka_couple', {}) || {}; const ok = g => ['m', 'f', 'x'].includes(g); return [ok(c.g1) ? c.g1 : 'm', ok(c.g2) ? c.g2 : 'f']; };
  /* Resolve "him/her"-style text for a person of gender g (the person the words refer to). 'x' keeps both forms. */
  const GP = [['him', 'her'], ['he', 'she'], ['his', 'her'], ['himself', 'herself'], ['his', 'hers'], ['boyfriend', 'girlfriend'], ['husband', 'wife'], ['Master', 'Mistress'], ['Sir', 'Madam'], ['dick', 'pussy'], ['penis', 'pussy'], ['testicles', 'pussy'], ['king', 'queen'], ['man', 'woman'], ['boy', 'girl']];
  const gfix = (t, g) => {
    if (!t || g === 'x' || (g !== 'm' && g !== 'f')) return t;
    let out = String(t);
    GP.forEach(([m, f]) => {
      const rx = new RegExp('\\b(' + m + '\\s*/\\s*' + f + '|' + f + '\\s*/\\s*' + m + ')\\b', 'gi');
      out = out.replace(rx, w => { const pick = g === 'm' ? m : f; return /^[A-Z]/.test(w) ? pick[0].toUpperCase() + pick.slice(1) : pick; });
    });
    return out;
  };
  /* Who a task is written to (data/packs/who.json, made by tools/tag-packs.py): 'f' her, 'm' him, 'x' either.
     forTag(tag) -> index of the partner it's for, or -1 when either of you can do it (or you share a gender). */
  let WHO = null;
  const whoLoad = () => WHO || (WHO = fetch((/\/games\//.test(location.pathname) ? '../' : '') + 'data/packs/who.json').then(r => r.json()).catch(() => ({})));
  const forTag = tag => { const G = genders(); if (tag !== 'f' && tag !== 'm') return -1; const i = G.indexOf(tag); return i >= 0 && G.lastIndexOf(tag) === i ? i : -1; };
  /* text for the partner it's written to: him/her resolved for the OTHER person */
  const forText = (t, tag) => { const i = forTag(tag); return i < 0 ? t : gfix(t, genders()[1 - i]); };
  const heat = () => { const h = LS.get('ka_heat', 3); return h >= 1 && h <= 3 ? h : 3; };
  const toast = m => (window.KA && KA.toast) ? KA.toast(m) : null;
  const fav = (type, text) => { if (window.KA && KA.saveFav) { KA.saveFav(type, text); toast('Saved to Saved Moments'); } };

  /* Heat selector: renders into el, calls cb(level) when changed */
  function heatBar(el, cb) {
    el.className = 'kx-heat';
    const draw = () => {
      const h = heat();
      el.innerHTML = '<span class="kx-heat-lbl">Heat up to</span>' +
        [1, 2, 3].map(n => `<button type="button" data-h="${n}" class="${n === h ? 'on' : ''}">${n === 1 ? '🌸' : n === 2 ? '🔥' : '🌋'} ${HEAT[n]}</button>`).join('');
    };
    draw();
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-h]'); if (!b) return;
      LS.set('ka_heat', +b.dataset.h); draw(); cb && cb(+b.dataset.h);
    });
  }
  function top(title, sub) {
    return `<h1 class="kx-title"><span>${esc(title)}</span></h1><p class="kx-sub">${esc(sub)}</p>`;
  }
  /* Resume (v78): the last thing you were in the middle of, shown as "Continue" on Home for 12 hours.
     KA_RESUME.set({u: 'games/x.html?...', t: 'Title', s: 'Round 3'}) / KA_RESUME.clear('games/x.html') / KA_RESUME.get() */
  if (!window.KA_RESUME) window.KA_RESUME = {
    set: function (o) { try { o.at = Date.now(); localStorage.setItem('ka_resume', JSON.stringify(o)); } catch (e) {} },
    clear: function (u) { try { const r = JSON.parse(localStorage.getItem('ka_resume')); if (r && (!u || String(r.u).split('?')[0] === String(u).split('?')[0])) localStorage.removeItem('ka_resume'); } catch (e) {} },
    get: function () { try { const r = JSON.parse(localStorage.getItem('ka_resume')); return r && Date.now() - r.at < 12 * 36e5 ? r : null; } catch (e) { return null; } }
  };
  const herePath = () => 'games/' + (location.pathname.split('/').pop() || '');
  window.KX = { LS, esc, pick, shuffle, names, genders, gfix, whoLoad, forTag, forText, heat, heatBar, top, toast, fav, HEAT };
})();
