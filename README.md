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

## v13
- Position Selector and Oral Position Selector: "Load More" replaced by automatic infinite scroll (loads ~900px before the bottom).
- Free-time Fun: no more repeated flashing. The page only redraws when content actually changes, entrance animations play once per new item, and scroll position is kept.

## v14 (deploy-ready clean-up)
- Removed the old browser-only "Sign Up / Login" demo (it stored plaintext passwords) from both Position Selector pages. Accounts now live only in the shared header. Any history a demo user had is kept; the demo users are deleted on first load.
- Removed every duplicate "← Home" / back-to-home button (old game pages, About, shared page titles). Home is the logo/menu in the shared header; in-game "← Back" buttons that move between steps stay.
- Verified: all pages x 3 screen sizes have one header + footer, no JS errors, no 404s, no horizontal overflow.

## v15
- New game: **Seduction Showdown** (games/kamaagni-showdown.html), a two-player card battle on one phone: draft cards, build contender line-ups with add-ons and twists, winner of each round claims reward challenges, partner can bail twice, final reward for the overall winner. All card text is original; heat level and topic filters apply to rewards.

## v16
- Seduction Showdown: choose **One phone** (hand-over screens) or **Two phones** (live over your linked Together connection; each phone shows only its own hand, the other shows "waiting"). Added a full **How to play** guide (setup screen and 📖 Guide during a game) and an ✕ End game button that ends it for both.

## v17
- Connect Foreplay: **One phone** or **Two phones** (live over Together, only the player whose turn it is can drop a disc, challenges are identical on both screens), How to Play now opens as an overlay at any time, End game for both, challenge text follows your heat level and topic filters.

## v18
- Connect Foreplay gameplay upgrade (ideas from the published description of the commercial app, all content original): **winner's advantage** (winner decides who does each challenge and can re-draw one; the other player can always pass), **Naughtiness** setting (Sweet = 2 rounds, Spicy = 3, Wild = hottest 2), **challenge type toggles**, and an optional **self-control finale** ("who held out longest"). Works in one-phone and two-phone modes.

## v19 (stage 1 of the quality overhaul)
- **Velvet Night theme** (css/ka-theme.css) and **motion kit** (js/ka-motion.js) load on every page: aurora background, glass cards, gradient buttons with ripple + haptics, one-time page reveal (never replays on re-render), particle bursts (`KA_MOTION.burst`).
- **Games hub** (play.html + js/ka-catalog.js): mood buttons, "Surprise me" slot reveal, search, filters (players, vibe, time, heat), favourites, Continue row. Add new games by adding one line to the catalogue.


## v20: Games overhaul, stage 2 and 3
- New shared engine: `js/ka-reveal.js` (both answer privately, then reveal), plus `js/ka-duo.js` / `js/ka-ui.js`. Every card game now has: mode choice (one phone / two phones live), heat level, category or pack picker, how-to-play guide, flip cards, timers where needed, and a results screen.
- Rebuilt on the engine: Truth or Dare (316 truths + 300 dares in 8+8 categories), Would You Prefer (171 pairs, 7 categories), Never Have I Ever (new, 77 statements), Hornopoly (6 packs, scoring, timers), Kinky Dice (5 sets incl. new gentle Love dice, 1 to 3 dice), Love Coupons (98 coupons, 5 categories, write your own), Desire Match (two-phone private answers; only a scrambled yes/maybe summary is shared, limits never), Connection Cards (90 original cards, pick 1 of 3, combos and levels).
- Content decks live in `data/deck/*.json` and are generated from `build/content/*.py`.
- Fixes: Connection Cards phone layout, stray "Offline mode" label, Ludo uses your couple names.


## v22: New games, rituals and plans (research-driven)
Research sources reviewed: the 75-games round-up, 30 intimate games for couples, Adventure Challenge In Bed (scratch-off + hints + keepsake), Sexopoly and Monogamy (levels + winner's fantasy), Foreplay in a Row (Connect), Date Night Poker, 5 Second Rule, Tapple After Dark, the Aron-style closeness questions, Gottman rituals, sensate focus, soul gazing, the 6-second kiss and the 20-second hug.
New pages: Connection Rituals (24 guided timers, streaks, 7-day plan, calendar export), Date Night Kits (16 plans, calendar export), Scratch-Off Book (104 challenges with budget/place/time hints and a Memory Book), Who's Most Likely To, How Well Do You Know Me, Quick-Fire (Name Three, Letter Rush, Charades, Touch Twister), Fantasy Box, Mystery Doors, Bedroom Menu, Intimate Bingo, Tic-Tac-Tease, Body Map. The Games hub has a Today strip (ritual, question, streak).
Hidden-topic filters (Settings) apply to the inline content of every new page.
Page titles no longer have a dash after KamaAgni.

## v23
- Pause / safe-word button (⏸) in the header on every page: green / slow down / stop check-in, aftercare link, sound toggle. Local only, nothing is sent to the partner.
- Sound effects on celebrations (generated in-browser, mute in the pause panel).
- Home-screen install prompt (Android/desktop banner, iOS how-to hint) after a few visits.
- Share-as-image card (`KA_SHARE`), used by the Progress page.
- Progress page: "your year together" recap and extra badges.

## v24
- **Our Own Cards** (games/kamaagni-custom.html): write your own cards for Truth or Dare, Would You Prefer, Never Have I Ever, Who's Most Likely, Know Me, Connection Cards, Love Coupons, Scratch-Off, Kinky Dice, Bedroom Menu, Bingo, Quick-Fire and Task Deck. Stored in `ka_custom`, merged into decks by `js/ka-custom.js`.
- Truth or Dare: forfeit ladder and forfeit tokens when passes run out.
- Love Coupons: expiry dates and printable wallet. Tic-Tac-Tease: 3×3, 4×4, 5×5 boards.
- Rituals: voice guidance, calming music, 8 more rituals. Date Kits: 8 more kits, venue finder, print.
- Scratch Book: seasonal tickets. Desire Match: "plan this" button and earlier rounds. Bingo: themes.
- Hornopoly: optional board with dice. Kinky Dice: "Plan my night".
- Fantasy Box: shared two-phone box with a consent check. Kink Explorer, Body Map, Bedroom Menu: compare with partner via codes (no server needed).
- Task Deck: custom pack and Task of the day. Walkthrough (❓) for Showdown, Connect, Ludo, Dice, Poker, Position selectors.

## v25
- **Live in Together:** Poker (own hand private per phone, setup options for length, heat, clothing), Couples Ludo (shared board, turn lock, pop-ups mirrored), Intimacy Dice and both Position Selectors (shared roll, alternating turns). Layers: `js/ka-live-poker.js`, `ka-live-ludo.js`, `ka-live-mirror.js`.
- **Showdown and Connect Foreplay** now use the shared `KA_DUO` engine instead of their own network code.
- **Quick-Fire** two-phone (Name Three, Letter Rush, Charades with hidden card) and custom categories.
- **Mystery Doors** rebuilt: two-phone contestant and banker (banker sees prizes and chooses offers), door-swap offers.
- **Scratch Book:** photo attachments in the Memory Book (stored on the device), shared book across two phones, "scratch one together".
- **Rituals:** guided sessions run in sync on both phones.
- **Body Map:** redrawn figure, custom zones, "over time" chart.
- **Progress:** weekly, weekday and activity charts.
