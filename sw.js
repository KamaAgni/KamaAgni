/* KamaAgni service worker — resilient offline-first cache */
const CACHE = 'kamaagni-v3';

/* Resolve every asset relative to this file's own scope so the cache
   still works correctly if the site is deployed under a sub-path
   (e.g. https://example.com/kamaagni/) instead of a domain root. */
const BASE = new URL('./', self.registration.scope).pathname;
const p = (path) => BASE + path;

const ASSETS = [
  p(''), p('index.html'), p('manifest.json'),
  p('css/fonts.css'), p('css/premium.css'),
  p('js/app-shell.js'), p('js/ka-features.js'),
  p('assets/icons/icon-192.png'), p('assets/icons/icon-512.png'),

  p('games/intimacy_dice_game_single_page.html'),
  p('games/intimacy_cards_game_single_page.html'),
  p('games/intimacy_ludo_dice_game_single_page.html'),
  p('games/intimacy_Position_Selector_page.html'),
  p('games/intimacy_Oral_Position_Selector_page.html'),
  p('games/kamaagni-connect-foreplay.html'),
  p('games/kamaagni-poker-quick.html'),

  p('css/fonts/cinzel-latin-400-normal.woff2'),
  p('css/fonts/cinzel-latin-700-normal.woff2'),
  p('css/fonts/cinzel-latin-900-normal.woff2'),
  p('css/fonts/cormorant-garamond-latin-400-normal.woff2'),
  p('css/fonts/cormorant-garamond-latin-400-italic.woff2'),
  p('css/fonts/cormorant-garamond-latin-600-normal.woff2'),
  p('css/fonts/cormorant-garamond-latin-600-italic.woff2'),
  p('css/fonts/cormorant-garamond-latin-700-normal.woff2'),
  p('css/fonts/cormorant-garamond-latin-700-italic.woff2'),
  p('css/fonts/dm-sans-latin-400-normal.woff2'),
  p('css/fonts/dm-sans-latin-500-normal.woff2'),
  p('css/fonts/dm-sans-latin-600-normal.woff2'),
  p('css/fonts/dm-sans-latin-700-normal.woff2'),
];

self.addEventListener('install', event => event.waitUntil(
  caches.open(CACHE)
    .then(cache => Promise.allSettled(ASSETS.map(asset => cache.add(asset))))
    .then(() => self.skipWaiting())
));

self.addEventListener('activate', event => event.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim())
));

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    const network = fetch(event.request).then(response => {
      if (response && response.ok && response.type === 'basic') {
        caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
      }
      return response;
    }).catch(() => null);
    if (cached) { event.waitUntil(network); return cached; }
    return (await network) || (event.request.mode === 'navigate' ? caches.match(p('index.html')) : Response.error());
  })());
});
