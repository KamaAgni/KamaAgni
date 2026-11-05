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

## v26: Poker rebuilt, auto-start timers

- **Auto-start timers** (`js/ka-auto.js`, loaded by `ka-boot.js` on every page): a short reading pause sized to the task, then the timer starts itself. Works in Truth or Dare, Hornopoly, Task Deck, Session and Journey. Settings has an "Auto-start timers" switch.
- **Poker for Couples**: real 3D cards that deal from a pile, flip face up, and fly away when swapped; chip stacks for each player and the pot; showdown cards turn over one by one; hand names, winner glow and chips floating to the winner.
- **New rules from the research**: chips and stakes (check, bet, fold), one foreplay marker per hand that the loser performs, going bust means taking off an item and resetting chips, an agreed finale, "write your own wish", Why Not?-style reading pause then timer.
- Poker runs itself: showdown reveals after a 3-second countdown, rewards pick a timed task, the timer starts by itself, and the next hand deals when it ends. Everything can be tapped to go faster.
- Works on one phone and live on two phones. Only the player whose turn it is advances the game.

## v27: Start over, three new games

- Every timer has **↺ Start over** (the ring, the card timers and the floating timer). It replays the reading pause, then starts the timer again.
- New games, adapted from ideas on games-for-couples.com: **Match and Reward** (memory game), **Smack That** (reaction game, phone flat between you), **Drop Dead Dice** (5 dice, every 2 or 5 costs a forfeit that escalates each round).
- Shared `js/ka-perform.js` shows a reward with a reading pause and an auto-starting timer.

## v28: more from games-for-couples.com

- **Card Menu** (`games/kamaagni-card-menu.html`, `js/ka-cards.js`): an activity for each of the 52 cards in four tiers (Romantic, Sensual, Sexual, Wild). Edit, reset or print them.
- New card games that run on it: **Go Bleep Yourself** (Go Fish), **Crazy Sex** (Crazy Eights), **Snap Heat** (Snap), **Tied Up** (War). One phone, pass-the-phone privacy for hands.
- Six new Roleplay Studio scenarios (doctor's prescription, vampire, Arabian Nights, wild west, witches, first time again) and four new Experts answers (designing your own games, busy couples, shy strip games, flat games).

## v29: Sexual Peak and the playful layer

- **Sexual Peak** (`games/kamaagni-sexual-peak.html`): pyramid solitaire for two. Pairs adding to 13, Kings alone, one stock recycle. When you run out of moves, your partner performs the last cards you cleared. Clear the whole pyramid to win the match on the spot.
- **Playful layer** (`js/ka-spark.js`, loaded from `ka-boot.js`): a flirty line under every page title using your names, and a sparkle burst on taps. Switch off in Settings, Playful extras.

## v30: ideas from your PDFs (original wording)
- 12-Minute Quickies: 30 scenarios in four categories, three timed phases (spark, peak, glow) with auto-start timers.
- Ask and Tell: conversation game, three levels, comfort thermometer, bonus and action cards.
- 30-Day Spark: daily challenge with a bonus, four date nights, progress grid, plus a Cherish checklist.
- Hack of the Day: 60 short tips in six categories, with save.
- Role-play: six new adult scenarios (strangers at a bar, private dancer, massage, boss and assistant, hotel concierge, old flames).

## v31: Experts grows
- 20 new Q&As (pace, foreplay, dirty talk, fantasies, mistakes, mood, lube, aftercare, desire change, long distance), original wording.

## v32: massage, Kama Sutra and fitness
- Sensual Massage Studio (guided, timed, swap roles, breathing opening), Kama Sutra Studio (8 embraces, 8 kisses, evening arts), Fit for Fun (partner workouts), 12 new tips, 6 new Experts Q&As. All original wording.

## v33: Eight Dates, Sensory Night, Pamper Prelude, Myths vs Facts
- Four new pages plus 20 more Experts Q&As (original wording).

## v34: Position Families and 28 more Experts Q&As

## v37: plain folder for friends, invite codes, more content
- The lock-screen vault from v35/v36 is removed from this build (kept in the v36 zip if you ever want to host it).
- The site now opens straight from a folder or pen drive by double-clicking index.html (data is embedded in js/ka-embed.js; run `python3 tools/embed-data.py` after editing anything in data/).
- Optional one-per-friend invite codes on your single Supabase: supabase/invites.sql + REQUIRE_INVITE in js/ka-config.js. See FRIENDS.md.
- More content: Ask and Tell (+34), 12-Minute Quickies (+14), Hack of the Day (+30), Myths vs Facts (+16), role-plays (+6, 43 total), Experts Q&As (+10, 113 total).

## v38: explicit adult content, personal use
- 22 new adult role-play scenarios (professor and mature student, personal trainer, nurse, traffic stop, landlord, plumber, maid and master, captor and captive, interrogation, yoga, lawyer, pool attendant, bodyguard, married stranger, mistress and sub, thief, genie, pirate, alien, hotel maid, sleeping beauty, private-space fantasies) plus 10 hooks. All characters are adults.
- Default heat is now the highest level on a fresh install.

## v39: no repeats
- **Duplicate guard** (`js/ka-dedup.js`): when you add your own card, fantasy slip or bucket-list idea, the site compares it with everything already in it. If something similar exists you can use that, or add anyway.
- **Content de-duplication** (`tools/dedupe_data.py`): the Task Deck's built-in packs were folded into the lazy-loaded packs, repeated tasks now live in only one pack (the smaller, more specific one keeps it), and repeats inside Journal, Know Me, Coupons, Challenges and Dare/Truth/g69 were removed.
- **Merged**: Mission Week is now part of 30-Day Spark (the old link redirects). The BDSM task pack that duplicated BDSM Journey was removed.
- **New content**, each checked against the existing site first (similar items were skipped): journal prompts, a Would You Prefer category, expert answers, hack-of-the-day tips.
- Task Deck "done" ticks may reset for packs whose lists changed.

### v40
- `tools/pagetext.py` gathers the text built into game pages (tips, rituals, quickies, ask-tell and more, about 1,600 lines) into `data/pagetext.json`, so the duplicate guard now sees it. Re-run it after editing page text.
- Near-identical questions that appeared both in Ask and Tell and in the data decks were replaced with fresh ones.

### v41: sign in first
- Every page now stays hidden until you sign in (`js/ka-gate.js`). Set `GATE_LOGIN: false` in `js/ka-config.js` to turn it off.
- Used in the last hour and not signed out: a PIN is all that is asked, and you carry on where you were. Opening another page in the same tab never asks again.
- More than an hour idle, a signed-out account, or 5 wrong PINs: full email and password sign-in again.
- The PIN (4 to 8 digits) is stored on that device only, as a salted hash. Each device sets its own at first sign-in.
- Honest limit: this is a lock on the screen, not encryption. Anyone who holds the files can still read them directly. For real protection keep `REQUIRE_INVITE: true` (see FRIENDS.md) so strangers cannot create accounts.

### v42: hide screen needs the PIN
- The old Quick Lock button and the old separate PIN (and auto-lock) were removed. Sign-in now has the one PIN (Settings, "Change my PIN").
- The 🕶 hide screen (or Esc twice) stays. Double-tap it and you must enter your PIN to get back. Reloading the page while hidden asks for the PIN too. Five wrong PINs sign you out.

### v43: comfort pass (found by auditing all pages at phone size)
- Finger-sized tap targets: logo, footer links, tick boxes, chips and All/None buttons. Tick boxes are now proper labelled checkboxes for screen readers, and keyboard focus is visible.
- Small text raised to a readable 12px; animations reduce when the phone asks for less motion.
- Task Deck: the Draw button stays at the bottom of the screen and shows how many packs are chosen, so you no longer scroll past 48 packs to start.
- Back arrow in the header on every game page; the screen stays awake while a game page is open.

### v44: page-by-page review
- Opened and started all 70 pages at phone size and checked for errors, broken text and layout problems; none were broken.
- Every game's setup screen now keeps its Start button at the bottom of the screen, so you do not scroll past long category lists to begin.
- History no longer logs pages you merely opened (Settings, Journal, Library, Progress and so on) as "Played"; only games are listed, with clean names.

### v45: PDF reader
- The first page now renders straight away instead of sitting blank, unrendered pages show a "loading" shimmer, a page that fails to load can be tapped to retry, and the reader reopens a book at the page you reached.

### v46: new logo
- The KamaAgni wordmark is now a vector logo in `assets/logo/` (`kamaagni-logo.svg`, plus transparent PNGs at 1024, 2048 and 4096 px wide, and a 1024 px square "K" icon). It is used in the header, the home screen, the sign-in and PIN screens, and the app icons.

## v47
Oral Position Selector: the Alt image set now has a name per position ("NN - Name.jpg"); names show on the result, grid and modal when the Alt images are on. Mapping ships in KamaAgni-OralPositions-Alt.zip (positions.json).

## v48
Position Selector: the Sex Position Alt image set now has a name per position ("NNN - Name.jpg"); names show on the result, grid and modal when Alt images are on. Mapping/duplicates report ship in KamaAgni-Positions-Alt.zip.

## v49
Fixes: Position Selector toggles drew as big circles (global checkbox sizing hit the hidden switch inputs); image popup now sizes to the screen and clears the header and dock; the PIN is only asked for when none is set on the device for this account, not on every sign-in (change it any time from Settings).

## v50
Position Selector: the base "Sex Position" folder can now use the same "NNN - Name.jpg" names as Alt (falls back to the old numbered names until renamed).
