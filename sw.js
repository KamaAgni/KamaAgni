/* KamaAgni Service Worker — full offline cache */
const CACHE = 'kamaagni-v1';

const ASSETS = [
  '/',
  '/index.html',
  '/ka-features.js',
  '/fonts.css',
  '/intimacy_dice_game_single_page.html',
  '/intimacy_cards_game_single_page.html',
  '/intimacy_ludo_dice_game_single_page.html',
  '/intimacy_Position_Selector_page.html',
  '/intimacy_Oral_Position_Selector_page.html',
  '/fonts/cinzel-latin-400-normal.woff2',
  '/fonts/cinzel-latin-700-normal.woff2',
  '/fonts/cinzel-latin-900-normal.woff2',
  '/fonts/cormorant-garamond-latin-400-normal.woff2',
  '/fonts/cormorant-garamond-latin-400-italic.woff2',
  '/fonts/cormorant-garamond-latin-600-normal.woff2',
  '/fonts/cormorant-garamond-latin-600-italic.woff2',
  '/fonts/cormorant-garamond-latin-700-normal.woff2',
  '/fonts/cormorant-garamond-latin-700-italic.woff2',
  '/fonts/dm-sans-latin-400-normal.woff2',
  '/fonts/dm-sans-latin-500-normal.woff2',
  '/fonts/dm-sans-latin-600-normal.woff2',
  '/fonts/dm-sans-latin-700-normal.woff2',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
