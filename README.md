# KamaAgni

Private couples' app (static PWA). Host it as-is on GitHub Pages: put these files at the repo root, with `index.html` at the top.

## Structure
- `index.html` home + intro (plays once per app launch; short ember transition between pages)
- `games/` every game and tool (one HTML file each)
- `data/` content JSON (`tasks.json`, `kinks.json`, `library.json`, `extras.json`); `js/ka-data.js` holds the card decks
- `js/ka-features.js` PIN lock, timer, music, backup, settings · `js/ka-common.js` helpers for the newer pages
- `sw.js` offline cache. **Bump `CACHE` (e.g. `kamaagni-v6`) whenever you change files**, so phones refresh.

## Library links
`data/library.json` lists the PDFs. Files are served from `KamaAgni/KamaAgniPDF` (branch `main`). Change `REPO`/`BRANCH` at the top of `games/kamaagni-library.html` if the repo moves.

## Yearly chore
Navratri/Diwali dates change every year: add next year's entry to `LUNAR_FESTIVALS` in `js/ka-features.js`.

## v4
- 35 lazy-loaded task/card packs in `data/packs/` (index.json lists them); Task Deck uses your names.
- 18+ gate and name setup (`js/ka-gate.js`), About/Privacy/Share (`about.html`), Progress & badges, Daily Spark.
- `js/ka-config.js` switches. `noindex` is set, so search engines skip the site.

## v5
- Page-transition animation removed; intro plays only on the first launch ever (localStorage `ka_intro_seen`).
- Library: built-in PDF reader (`games/pdf-viewer.html`, bundled pdf.js in `js/vendor/`) and working Download buttons.
- Roleplay Studio (25 scenarios). Original games: couple names, how-to-play "?", haptics, extra dice and card content (`js/ka-enhance.js`).

## v6
- New pages: BDSM Journey (500 tasks), Challenges + Wish List, Dice Sets, Hornopoly, Reflection Prompts.
- New packs in the Task Deck (Porn Star 950, 28 Extreme, Revenge decks, Warm-ups, Hornopoly, questions). Task Deck has search and "Surprise me (all packs)".
- Roleplay Studio has story hooks.

## v7
- Home "Tonight" dashboard: greeting, streak, level/XP, mood shortcuts, continue + try-something-new, weekly date-night calendar reminder (.ics).
- Guided Session (mood + time, step-by-step with timers, aftercare, auto journal entry), Secret Envelope (private-link dares with optional time lock and reply).
- `js/ka-track.js`: local-only streak/XP/level tracking. Progress page shows levels and more badges.
- OCR-recovered card packs (BDSM truth/dare, foreplay, kinky) and more roleplay hooks.

## v8 — accounts, sync, partner, experts
- **Shared header + footer + menu on every page** (`js/ka-chrome.js`), with account button and partner status.
- **Login + multi-device sync** (`js/ka-cloud.js`, free Supabase): end-to-end encrypted with a vault passphrase. Setup: `SETUP-CLOUD.md`, SQL in `supabase/schema.sql`. Blank config = fully offline.
- **Together** (`games/kamaagni-together.html`): invite link, encrypted chat, live shared cards + synced timer, 🟢🟡🔴 signals with stop overlay, weekly check-ins, private yes/maybe/no Match.
- **Intimacy Experts** (`games/kamaagni-experts.html`): 5 four-week programmes, 20 Q&As, weekly Pulse with recommendations.
- **History** (`games/kamaagni-history.html`): recent activity, delete per item or per area, delete device data / cloud data / account.
- Home "This week" recap + next steps; Guided Session shows the same panel (`js/ka-focus.js`).
- Dev testing: `node dev/mock-server.js` and `MOCK_URL` (never ship with it set).
