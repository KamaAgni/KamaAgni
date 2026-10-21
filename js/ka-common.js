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
  const heat = () => { const h = LS.get('ka_heat', 2); return h >= 1 && h <= 3 ? h : 2; };
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
    return `<div class="kx-top"><a class="kx-back" href="../index.html">← Home</a></div>
      <h1 class="kx-title"><span>${esc(title)}</span></h1><p class="kx-sub">${esc(sub)}</p>`;
  }
  window.KX = { LS, esc, pick, shuffle, names, heat, heatBar, top, toast, fav, HEAT };
})();
