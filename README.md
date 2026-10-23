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

## v9 — settings, content filter, evidence-based flow
- **Settings** (`games/kamaagni-settings.html`): switch topics on/off (anal, oral, BDSM, pain, breath play, humiliation, public, third parties, toys, cum play, extreme, roleplay, photos/sexting, alcohol, edging), presets, your own hide-words, hide individual games. Implemented in `js/ka-filter.js`: filters fetched data, built-in decks, embedded game decks, menus and whole pages. Breath play and extreme topics are off by default. Saved in `ka_filter` and synced with the account.
- Sessions follow Talk → Touch → Play → Afterglow → Reflect; new Slow Touch (sensate focus) programme; "The science" tab in Experts lists the research used and its limits.
- The Position Selector is illustration-only and cannot be filtered by topic; hide the whole game instead.

## v10 — healthy return loop
- Partner **Nudges** (one-tap encrypted sparks) with a header badge and soft banner; mute in Settings → Healthy use.
- Forgiving **rhythm** (one rest day never breaks it); no lost-streak screens or guilt messages.
- **Balance guard**: one gentle skippable "time to be together" pause per day (30/60/90 min, can be turned off).
- Home: "Remember this" (a past great night) and "Make it a ritual" prompts. Science tab lists the habit research used.

## v11 — live games, animated notifications, Fun hub
- **Notifications** (`KA_CHROME.notify`): animated banner (bounce-in, glow, floating hearts for nudges/check-ins, red pulse for STOP), header 💞 wobble, soft chime + vibration (toggle in Settings → Healthy use). Fires for messages, nudges, shared draws, check-ins, STOP/slow-down signals and Fun-hub moves, on any page.
- **Together → Play**: shared Card, Truth or Dare, Would You Prefer (reveal when both chose), Dice, Roleplay parts, with Done/Pass and history logging. The original single-page Ludo/Dice-board/Cards/Poker/Position games keep their own layouts and are not mirrored live.
- **Free-time Fun** (`games/kamaagni-fun.html`, `data/fun.json`): Date wheel, Deep questions, Fantasy builder, Story builder, Know-me quiz, Two truths & a lie. Solo/face-to-face when not linked; live and synced when linked. All content respects Settings filters.

## v11.1 — updates show immediately
Service worker is now network-first (bypasses the HTTP cache, 5 s timeout, offline fallback) and the page reloads once when a new version installs. The footer shows the app version (`v11`) so you can confirm which version you are running. GitHub Pages itself can take 1-10 minutes to publish a commit.

## v12 — realistic animations + Together game fix
- `js/ka-fx.js`: card pile + lift/flip deal (automatic for every `.kx-play` card, with a deck graphic and shuffle sound), 3D dice with pips that tumble and bounce (Together dice, Dice Sets), spinning prize wheel (Date wheel). Respects reduced-motion and the sound setting.
- Together → Play: each game keeps its own prompt; switching games no longer shows the previous game's card, and your partner's screen switches to the game you draw.
- Note: `kamaagni-kinky-dice.html` was edited by hand; do not regenerate it with `build/pages5.py`.
