(() => {
  'use strict';
  const doc = document;
  doc.documentElement.classList.add('js');

  const skip = doc.createElement('a');
  skip.className = 'ka-skip-link';
  skip.href = '#ka-main';
  skip.textContent = 'Skip to main content';
  doc.body.prepend(skip);

  const main = doc.querySelector('main, .app, #main-content, .container');
  if (main) {
    if (!main.id) main.id = 'ka-main';
    main.setAttribute('tabindex', '-1');
  } else {
    skip.remove();
  }

  const badge = doc.createElement('div');
  badge.className = 'ka-offline-badge';
  badge.setAttribute('role', 'status');
  badge.textContent = 'Offline mode';
  doc.body.appendChild(badge);
  const updateOnline = () => badge.classList.toggle('show', !navigator.onLine);
  addEventListener('online', updateOnline);
  addEventListener('offline', updateOnline);
  updateOnline();

  doc.querySelectorAll('a[target="_blank"]').forEach(a => {
    const rel = new Set((a.rel || '').split(/\s+/).filter(Boolean));
    rel.add('noopener'); rel.add('noreferrer'); a.rel = [...rel].join(' ');
  });

  doc.querySelectorAll('button:not([type])').forEach(b => b.type = 'button');
  doc.querySelectorAll('[onclick]:not(button):not(a):not(input)').forEach(el => {
    if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
    if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
    });
  });

  let lastFocused = null;
  const focusable = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const observer = new MutationObserver(() => {
    const modal = [...doc.querySelectorAll('.ka-overlay,.modal-overlay,[role="dialog"]')].find(el => {
      const s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden';
    });
    if (!modal || modal.dataset.kaA11y === '1') return;
    modal.dataset.kaA11y = '1'; modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true');
    lastFocused = doc.activeElement;
    const first = modal.querySelector(focusable); if (first) setTimeout(() => first.focus(), 0);
    modal.addEventListener('keydown', e => {
      if (e.key === 'Escape') { const close = modal.querySelector('[data-close],.close,.ka-close'); if (close) close.click(); }
      if (e.key !== 'Tab') return;
      const items = [...modal.querySelectorAll(focusable)].filter(x => x.offsetParent !== null);
      if (!items.length) return;
      const i = items.indexOf(doc.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); items.at(-1).focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    });
  });
  observer.observe(doc.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});

  addEventListener('error', e => console.error('[KamaAgni]', e.error || e.message));
  addEventListener('unhandledrejection', e => console.error('[KamaAgni promise]', e.reason));

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    // app-shell.js always lives in /js/, one folder below the site root,
    // regardless of which page (root or /games/*) included it — so the
    // root is always "one directory up" from this script's own URL.
    const scriptURL = doc.currentScript && doc.currentScript.src;
    const siteRoot = scriptURL ? new URL('../', scriptURL).href : './';
    addEventListener('load', () => navigator.serviceWorker.register(siteRoot + 'sw.js', {scope: siteRoot}).catch(console.warn), {once:true});
  }
})();
