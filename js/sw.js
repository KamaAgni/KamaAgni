/* KamaAgni service worker — resilient offline-first cache */
const CACHE = 'kamaagni-v2';
const ASSETS = [
  './','./index.html','./ka-features.js','./app-shell.js','./fonts.css','./premium.css','./manifest.json',
  './intimacy_dice_game_single_page.html','./intimacy_cards_game_single_page.html',
  './intimacy_ludo_dice_game_single_page.html','./intimacy_Position_Selector_page.html',
  './intimacy_Oral_Position_Selector_page.html','./icon-192.png','./icon-512.png',
  './fonts/cinzel-latin-400-normal.woff2','./fonts/cinzel-latin-700-normal.woff2','./fonts/cinzel-latin-900-normal.woff2',
  './fonts/cormorant-garamond-latin-400-normal.woff2','./fonts/cormorant-garamond-latin-400-italic.woff2',
  './fonts/cormorant-garamond-latin-600-normal.woff2','./fonts/cormorant-garamond-latin-600-italic.woff2',
  './fonts/cormorant-garamond-latin-700-normal.woff2','./fonts/cormorant-garamond-latin-700-italic.woff2',
  './fonts/dm-sans-latin-400-normal.woff2','./fonts/dm-sans-latin-500-normal.woff2',
  './fonts/dm-sans-latin-600-normal.woff2','./fonts/dm-sans-latin-700-normal.woff2'
];
self.addEventListener('install', event => event.waitUntil(
  caches.open(CACHE).then(cache => Promise.allSettled(ASSETS.map(asset => cache.add(asset)))).then(() => self.skipWaiting())
));
self.addEventListener('activate', event => event.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    const network = fetch(event.request).then(response => {
      if (response && response.ok && response.type === 'basic') caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
      return response;
    }).catch(() => null);
    if (cached) { event.waitUntil(network); return cached; }
    return await network || (event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error());
  })());
});
