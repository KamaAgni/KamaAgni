/* KamaAgni service worker — resilient offline-first cache */
const CACHE = 'kamaagni-v66';

/* Resolve every asset relative to this file's own scope so the cache
   still works correctly if the site is deployed under a sub-path
   (e.g. https://example.com/kamaagni/) instead of a domain root. */
const BASE = new URL('./', self.registration.scope).pathname;
const p = (path) => BASE + path;

const ASSETS = [
  p(''), p('index.html'), p('manifest.json'),
  p('css/fonts.css'), p('css/premium.css'),
  p('css/ka-shared.css'),
  p('css/ka-theme.css'),
  p('js/ka-motion.js'),
  p('js/ka-catalog.js'),
  p('js/ka-duo.js'),
  p('js/ka-ui.js'),
  p('play.html'),
  p('js/ka-chrome.js'),
  p('js/ka-cloud.js'),
  p('js/ka-focus.js'),
  p('data/programs.json'),
  p('data/experts_qa.json'),
  p('games/kamaagni-history.html'),
  p('games/kamaagni-together.html'),
  p('games/kamaagni-experts.html'),
  p('js/ka-filter.js'),
  p('games/kamaagni-settings.html'),
  p('data/fun.json'),
  p('games/kamaagni-fun.html'),
  p('js/ka-fx.js'),
  p('js/ka-boot.js'), p('js/app-shell.js'), p('js/ka-features.js'), p('js/ka-common.js'), p('js/ka-data.js'),
  p('assets/logo/kamaagni-logo.svg'), p('assets/logo/kamaagni-logo-1024.png'),
  p('assets/icons/icon-192.png'), p('assets/icons/icon-512.png'), p('assets/icons/icon-maskable-512.png'),

  p('games/intimacy_dice_game_single_page.html'),
  p('games/intimacy_cards_game_single_page.html'),
  p('games/intimacy_ludo_dice_game_single_page.html'),
  p('games/intimacy_Position_Selector_page.html'),
  p('games/intimacy_Oral_Position_Selector_page.html'),
  p('games/kamaagni-connect-foreplay.html'),
  p('games/kamaagni-poker-quick.html'),
  p('games/kamaagni-desire-match.html'),
  p('games/kamaagni-would-you-prefer.html'),
  p('games/kamaagni-showdown.html'),
  p('games/kamaagni-never-have-i-ever.html'),
  p('js/ka-reveal.js'),
  p('js/ka-extras.js'),
  p('data/deck/coupons.json'),
  p('data/deck/conn.json'),
  p('data/deck/who.json'),
  p('games/kamaagni-rituals.html'),
  p('games/kamaagni-body-map.html'),
  p('games/kamaagni-bingo.html'),
  p('games/kamaagni-tic-tac-tease.html'),
  p('games/kamaagni-go-bleep-yourself.html'),
  p('games/kamaagni-crazy-sex.html'),
  p('games/kamaagni-snap-heat.html'),
  p('games/kamaagni-tied-up.html'),
  p('games/kamaagni-card-menu.html'),
  p('js/ka-cards.js'),
  p('js/ka-spark.js'),
  p('games/kamaagni-sexual-peak.html'),
  p('games/kamaagni-quickies.html'),
  p('games/kamaagni-position-families.html'),
  p('games/kamaagni-eight-dates.html'),
  p('games/kamaagni-sensory-night.html'),
  p('games/kamaagni-pamper.html'),
  p('games/kamaagni-myths.html'),
  p('games/kamaagni-massage.html'),
  p('games/kamaagni-kama-studio.html'),
  p('games/kamaagni-fit.html'),
  p('games/kamaagni-ask-tell.html'),
  p('games/kamaagni-spark-challenge.html'),
  p('games/kamaagni-tips.html'),
  p('games/kamaagni-match-reward.html'),
  p('games/kamaagni-smack-that.html'),
  p('games/kamaagni-drop-dead-dice.html'),
  p('js/ka-perform.js'),
  p('games/kamaagni-quick-fire.html'),
  p('games/kamaagni-fantasy-box.html'),
  p('games/kamaagni-mystery-doors.html'),
  p('games/kamaagni-bedroom-menu.html'),
  p('games/kamaagni-scratch-book.html'),
  p('games/kamaagni-custom.html'),
  p('js/ka-custom.js'),
  p('js/ka-dedup.js'),
  p('js/ka-live-poker.js'),
  p('js/ka-auto.js'),
  p('js/ka-live-ludo.js'),
  p('js/ka-live-mirror.js'),
  p('data/deck/scratch.json'),
  p('games/kamaagni-date-kits.html'),
  p('data/deck/know.json'),
  p('games/kamaagni-whos-most-likely.html'),
  p('games/kamaagni-know-me.html'),
  p('games/kamaagni-love-languages.html'),
  p('games/kamaagni-movies.html'),
  p('games/kamaagni-skills.html'),
  p('games/kamaagni-planner.html'),
  p('games/kamaagni-memories.html'),
  p('games/kamaagni-week.html'),
  p('games/kamaagni-playlist.html'),
  p('games/kamaagni-health.html'),
  p('games/kamaagni-life-stages.html'),
  p('games/kamaagni-roadmap.html'),
  p('games/kamaagni-search.html'),
  p('data/deck/truth.json'),
  p('data/deck/dare.json'),
  p('data/deck/wyp.json'),
  p('data/deck/nhie.json'),
  p('games/kamaagni-truth-or-dare.html'),
  p('games/kamaagni-bucket-list.html'),
  p('games/kamaagni-love-coupons.html'),
  p('games/kamaagni-task-deck.html'),
  p('games/kamaagni-kink-explorer.html'),
  p('games/kamaagni-learn.html'),
  p('games/kamaagni-tonight.html'),
  p('games/kamaagni-journal.html'),
  p('games/kamaagni-library.html'), p('games/kamaagni-progress.html'), p('games/kamaagni-roleplay.html'), p('games/kamaagni-session.html'), p('games/kamaagni-secret.html'), p('js/ka-track.js'), p('games/kamaagni-journey.html'), p('games/kamaagni-challenges.html'), p('games/kamaagni-kinky-dice.html'), p('games/kamaagni-hornopoly.html'), p('games/kamaagni-prompts.html'), p('data/bdsm500.json'), p('data/challenges.json'), p('data/wishlist.json'), p('data/dice_faces.json'), p('data/journal_prompts.json'), p('data/roleplay_hooks.json'), p('data/roleplay.json'), p('about.html'), p('games/pdf-viewer.html'), p('js/vendor/pdf.min.js'), p('js/vendor/pdf.worker.min.js'), p('js/ka-config.js'), p('js/ka-enhance.js'), p('js/ka-gate.js'), p('data/packs/index.json'),
  p('data/tasks.json'), p('data/pagetext.json'), p('data/kinks.json'), p('data/library.json'), p('data/extras.json'),

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

/* Network-first: always try the live site (bypassing the browser's HTTP cache) so updates show on the next load;
   fall back to the saved copy when offline or very slow. */
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;                       // let the browser handle third-party requests
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const fresh = await Promise.race([
        fetch(req, { cache: 'no-cache' }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), 5000))
      ]);
      if (fresh && fresh.ok && fresh.type === 'basic') cache.put(req, fresh.clone());
      return fresh;
    } catch (e) {
      const hit = await cache.match(req, { ignoreSearch: req.mode === 'navigate' });
      if (hit) return hit;
      if (req.mode === 'navigate') { const home = await cache.match(p('index.html')); if (home) return home; }
      return Response.error();
    }
  })());
});
