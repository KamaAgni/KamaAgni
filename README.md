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

## v51
Position and Oral selectors: names show whether or not the Alt/filter set is on; position numbers shown from #001 (match the file numbers). Oral page now includes the owner-edited version with the base-folder name fallback.

## v52
Home: removed a leftover empty card (from the merged Mission Week) that left a div open and pushed the Explore, Keep & plan and Learn sections into the wrong columns on wide screens.

## v53
- Mined the uploaded books: 6 new adult role-play scenarios (restaurant strangers, call girl, roadside, costume party, rope lesson, switch night), 12 new massage techniques (hacking, knuckle glide, feather and fur, blindfold touch, bath massage and more) and a "Cherishing Each Other" journal set.
- Skipped anything with minors, teacher/student and non-consent themes.

## v54
- New page: Love Languages. A 15-question either-or quiz for each partner, a personal result, a side-by-side comparison and a "speak their language this week" idea. Added after comparing the top couples apps (Paired, Kindu, Spicer, Fck, Between/Lovewick).

## v55
- Touch screens: no sticky hover lift or press-scale jump, so taps no longer make the screen shake.
- Smack That and Snap Heat fit a phone screen and can be played from a keyboard (A and L).

## v56
- UX pass from a 74-page audit: bigger tap areas on checkmarks, filters and footer links, 12px minimum small text, a visible keyboard focus ring, reduced-motion support, names for unlabeled buttons, one heading on every page.

## v57
- Checked every game on small phone, phone sideways, tablet and laptop (no overflow, no errors).
- Phone sideways: tool buttons move to a slim bottom row and the header and titles shrink, so the game starts higher on screen.

## v58
- New page: Movie Night (106 films by mood, heat and length; pick-one-for-us; shared watchlist; both partners rate; talk prompts and a movie-night add-on idea).

## Roadmap (agreed with owner)
1. Movie Night (done v58)
2. Health & Wellbeing hub: contraception, testing, common problems, pelvic floor, when to see a doctor
3. Life-stage guides: new couples, long-term, after a baby, 40s and beyond, long distance
4. "Today" home screen and site-wide search
5. Year-by-year relationship roadmap and private yearly review

## v59 (roadmap stages 2 to 5)
- Health & Wellbeing: 21 plain-language topics with "what helps" and "when to get help".
- Life Stages: nine guides from new love to later life, long distance and rebuilding, each with page links and talk prompts.
- Search: finds any game, guide or tool by word (also a search box on the home page).
- Roadmap & Yearly Review: a 10-year roadmap and a private yearly review with both partners' ratings and year-on-year comparison.
- Five new cards on the home page and four new menu entries.

## v60
- Tips: 57 new hack-of-the-day tips (167 in total) from Sex Hacks, Tips.pdf, Every Man's Guide and the Kama Sutra books, written in our own words.
- Favourites: a star in the header of every game page. The home page shows "Continue" and your favourites.

## v61
- New page: Bedroom Skills (16 how-to guides with a "we tried this" tick).
- Sync: every new page and the older position, ludo and filter settings now sync to the account. Device-only items (PIN, last page, session time) stay local.
- Sign-in reminder: if you are signed in but have not created or unlocked the vault passphrase, a bar says nothing is syncing yet and opens the account panel.

## v62
- New pages: Date Planner, Memory Book, Our Playlist (82 songs). Movie Night: 16 more films and a "Together" shortlist of films you both starred. Health: 8 more topics. Home: a daily question and mini-mission card.

## v63
- **Partner sharing**: Date Planner, Memory Book, Movie Night, yearly review and playlist favourites now merge between couple-linked accounts (js/ka-motion.js, KA_PSHARE). Item lists merge by id with update times and deletion markers; Movies/Review use last-write-wins; favourites are unioned. Needs both partners signed in, vault unlocked and linked on the Together page.
- **Start here**: 3-question guide on first home visit (mood, time, spice), suggests 3 pages with "Save to favourites". Reopen from the home buttons.
- **Our week**: games/kamaagni-week.html weekly recap (history, memories, next-week idea).
- **Surprise me** button on home. **Comfort**: text size and high contrast in Settings (synced). iPhone "Add to Home Screen" hint.
- tools/compress-images.py: WebP converter for position images (run it yourself on the repo images).

## v64
- Home quick-action buttons fit one row on phones.

## v65: full-site bug and comfort audit
Every page (84) was loaded at phone, phone sideways, tablet and laptop size, buttons were tapped through on phone size, and screenshots were reviewed.
- **Fixed: "Share as image" on Progress did nothing.** The partner-sharing layer from v63 reused the name `KA_SHARE` and replaced the share-card tool. Partner sharing is now `KA_PSHARE` (js/ka-motion.js).
- **Floating timer no longer covers page titles.** While a timer runs, the page makes room for it (a 52px spacer), long labels are shortened with "…", and its buttons are larger with screen-reader names.
- **Timer window:** cannot open twice, Enter starts it, empty or zero minutes highlights the box instead of doing nothing, capped at 180 minutes.
- **Home page on phones:** game cards are now compact rows (icon, name, two-line description, whole card tappable). The page is about half as long. The "loop that works" tiles no longer squeeze "Afterglow".
- **Task Deck:** at Sweet heat it explains that every pack is Spicy or Wild instead of "No packs match"; a search with no result says so; the Draw button counts only packs that can be drawn at the current heat; double-taps on "Surprise me" and "Task of the day" are ignored safely.
- **PDF reader** opened without a book: shows "Pick a book in the Library" with a button, instead of a stuck "Loading…".
- **Connection Cards:** double-taps on Save/Done before a card is picked no longer throw errors.
- **PDF reader:** the flirty line no longer sits against the screen edge (it skips hidden headings). Guided Session "This week" link is easier to tap.
- **Readability:** labels under 12px raised to 12px (dice and Ludo labels, Date Kits and Rituals meta lines, Scratch Book, Rituals stats, Progress chart labels). Pill buttons (Guide, Journal filters) are at least 36px tall.

## v66: quality pass (content, accessibility)
All 16,000+ pieces of text in `data/` were scanned for scrambled text, junk, duplicates, typos and formatting slips.
- **Scrambled cards repaired or removed.** Some packs were copied from PDFs and had broken text ("Submissive Sub e v m i s s i…", stray "R ’ S A M CARD" letters, card headings glued to tasks). 21 cards rebuilt by hand; garbled copies of cards that already existed cleanly were removed.
- **Source branding and leaflet text removed:** "🖤28 EXTREME SLUT TASKS🖤", "HUMILIATION & PUNISHMENT TASKS FOR MAN", "SUBMISSIVE WOMAN", section numbers, the Etsy "we're always improving our products" blurb, and the Revenge game's rulebook (scoring, "the player with the higher score wins", design notes) that had been mixed in as tasks. The Revenge packs' descriptions now say to agree a safe word and hard limits first.
- **Cut-off cards completed** (Discover Your Kink, Roles, Public play and others that stopped mid-sentence).
- **Rewritten for clear English:** Spicy and kinky cards (all 28) and Foreplay cards (all 18); 69 game cards, Foot fetish cards, Femdom cards and Submissive woman cards I cleaned up, with board-game rules ("go back 4 spaces", "roll again") removed.
- **Christmas pack:** card titles now read "Candy Cane Kneel: Kneel naked…" instead of running into the task.
- **Duplicates:** 53 near-identical cards across packs removed (the smaller, more specific pack keeps its copy, as with tools/dedupe_data.py). Cards that differ in who does what (him/her) or in numbers were kept. Two Fun questions and one date-wheel idea that repeated other decks were swapped for new ones.
- **Typos and style:** 41 confirmed typos fixed (e.g. blindforld, messneger, cogtinue, Satna), stray "You/Your/Partner/Sex Toy" capitals lowered mid-sentence across imported packs, doubled words ("than than", "a a"), spaces before punctuation.
- **Dice:** junk faces removed from the dice data (an empty face, "RULES", "ROLL THE DICE TO DECIDE WHO GOES FIRST").
- One Femdom card that said a safe word can't be used now asks you to agree a stop signal before the tape goes on.
- Task packs: 8,318 → 8,173 tasks (the difference is garbled copies, duplicates and non-task text). `js/ka-embed.js` regenerated.

Accessibility (axe-core on every page): every page now has one main region and one site header/footer for screen readers; switches, sliders and dropdowns that had no name get one from their visible label; dialogs are named from their title; Ludo hint text is readable (contrast). All done once in `js/ka-chrome.js`, so new pages get it automatically.

Speed was measured (home page first paint ~0.4 s, other pages ~0.25 s on a simulated phone; the 1.6 MB offline data bundle loads only when opened from a folder) and needed no changes.

## v67: research-based content and "never forget what you can do"
See **WRITING-GUIDE.md** for the research behind every rule (Muise et al. 2019 on novelty; Mallory et al. 2019 on sexual communication; Birnbaum et al. 2016 on responsiveness; Nagoski / dual control model; Gottman soft start-up; Gollwitzer & Sheeran if-then plans; Fogg B = MAP; Nielsen recognition over recall; kink-community negotiate, safe word, aftercare).
- **Roleplay Studio rebuilt as a 4-step flow:** 1) Agree: who plays whom, "one thing I'd love / one thing off-limits", green/yellow/red safe words (or a hand signal). 2) Set the scene: a scene-specific setup line plus a "clear the brakes" checklist. 3) Play: the story, an **opening line** for the first character, and **three beats** (tease, build, peak) revealed one at a time, with a "Colour?" check-in between beats and a 7-minute beat timer. 4) Afterglow: step out of character, aftercare options, and a two-line debrief ("one thing I loved / one thing to try next time") saved per story.
- All 70 stories now have named roles, a setup line, an opening line, three beats and a heat level (filter by Sweet / Spicy / Wild).
- **New js/ka-next.js (loaded on every page by ka-chrome.js):** a "What next?" panel at the end of every game (untried first, related ones ranked higher); on Home, "Still to discover" with "explored X of 71" and four untried picks; **Make a plan** ("When Friday night, we'll open Roleplay Studio"), shown on Home with a "Today!" badge and a once-a-day reminder on the day. Plans are stored in `ka_ifthen` and sync like everything else.
- Removed the "Nanny" role-play, its hook, and three cards built on childlike presentation.

## v68: ideas from the reading list
Books read (ideas only, all wording is KamaAgni's own; nothing is copied from them): Emily Nagoski, *Come As You Are*; Stella Harris, *Tongue Tied*; Kenneth Play, *Beyond Satisfied*; Laura Berman, *Loving Sex*; *Kama Sutra: A Modern Guide*; Amia Srinivasan, *The Right to Sex*.
- **New: Talk Kit** (games/kamaagni-talk.html, key `ka_talk`). 8 guided conversations (trying something new, saying and hearing no, asking for more or less, pace, how we start sex, after-play debrief, compliments, our sexual stories), each with when to have it, turn-taking questions, words to borrow and a listening tip. "Our words": each partner marks words they love or don't want to hear, shown side by side. "How I like to be asked": invitations that work, ones to avoid, and an easy "not tonight, but…". "Touch calibration": the receiver answers with pressure and speed numbers; favourites are saved. (Tongue Tied, Loving Sex, Beyond Satisfied.)
- **New: Brakes & Accelerators** (games/kamaagni-brakes.html, key `ka_brakes`). A private check-in for each partner across 37 of our own items (me, you, us, the setting, what we do), side-by-side results with things you have in common, a "remember a really good time" note, a 4-step "turn off one brake" plan (brake, concrete steps, obstacle, if-then fix) and "Unwind first" ways to close out stress, with breathing and hug timers. (Come As You Are: dual control model, stress, responsive desire.)
- **Myths vs Facts:** 5 new cards: porn as performance, body vs mind arousal, mind-reading, no as information, closing the stress cycle. (The Right to Sex, Come As You Are, Tongue Tied.)
- Both pages are in the Learn menu, the Games hub and the offline cache.
- Already covered, so not duplicated: classical embraces and kisses (Kama Studio), want/maybe lists (Kink Explorer, Desire Match), daily rituals (Connection Rituals).

## v69: the rest of the reading list
Everything still useful from the six books, written in KamaAgni's own words. Ideas already covered elsewhere were skipped: senses and textures (Sensory Night), bathing (Pamper Prelude), fitness and pelvic floor (Fit for Fun, Health), daily appreciation (Connection Rituals), classical embraces and kisses (Kama Studio).
- **Talk Kit, 4 more conversations:** when we want different things (with a tiebreaker), our future perfect (sex life a year from now, then one first step), planning sex without killing the mood (with a plan B), and when to get outside help. (Tongue Tied, Loving Sex.)
- **Talk Kit, new tab "Notice & love":** each partner writes a specific compliment across 9 sides of the other (body, touch, mind, work, energy, values, care, dreams, desire), then you read them to each other. (Beyond Satisfied.)
- **Talk Kit, "Follow my lead" kiss game** added to Touch calibration: one leads for two minutes, the other mirrors, then swap. (Beyond Satisfied.)
- **Brakes & Accelerators, new tab "Be kind to yourself":** handling a hard feeling in four steps, talking to yourself like a friend would, old messages about sex rewritten as new beliefs, and three minutes of body kindness with a timer. (Come As You Are, Loving Sex.)

## v70: 20 new role-plays, characters, scripts and costumes
- **20 new, original, spicy role-plays (#72–91, marked NEW, plus a "✨ New" filter):** The Sommelier's Private Tasting, Last Night on Earth, The Tattoo Artist, The Escape Room, The Cabin in the Storm, The Fitting Room, The Fortune Teller, Last Hour on the Space Station, The Heist, The Night Train, The Chef's Table, The Mermaid and the Sailor, The Wedding Night, The Oil Wrestling Championship, The Empress and the Gladiator, The Secret Admirer, The Full Moon, The Strict Librarian, The Dating App Match, The Private Show. Each has two story versions, roles, a setup, props, an opening line and three beats.
- **Character briefs** (new stories): what each character wants and how to play them (voice, attitude), shown at step 1.
- **Conversation guide:** at step 3, under the current beat, two or more natural lines each role can say.
- **Costume ideas for all 90 stories:** illustrated costume cards for each role at step 2 (the 70 older stories get ideas matched to their roles), with the props list.
- **Our costume photo:** add a photo of your look to any story. It's resized and kept on this device only (`rp_photo_<n>`, deliberately not synced).
- Data fields added to data/roleplay.json: `ch` (characters), `g` (lines per beat), `c` (costumes), `nw` (new). js/ka-embed.js regenerated.

## v71: names and genders you can change, gender-aware wording
- **Names & genders** can be changed any time: Settings → "Names & genders", or the couple profile in the ⚙️ menu. Each partner is Man, Woman or Other (defaults: Partner 1 man, Partner 2 woman). The welcome screen now asks too. Stored in `ka_couple` as `g1`/`g2`; syncs.
- **Shared helpers** (js/ka-common.js): `KX.genders()` and `KX.gfix(text, g)`, which turns "him/her", "he/she", "his/her", "Master/Mistress", "dick/pussy" and similar into the right word for that person ('x' keeps both).
- **Roleplay Studio:** each story version now knows which role is a man or a woman (`pg` in data/roleplay.json; 48 stories tagged, the rest work either way), and gives each partner the matching role automatically. Swap still works. "Another version" re-matches.
- **Costumes follow the person, not the role:** 154 gendered costume ideas now have a version for the other gender (e.g. Private Dancer: lingerie and heels for a woman, fitted briefs and an open shirt for a man).
- **Hornopoly and Truth or Dare** show the right pronoun for your partner on each card.

## v72: "Printable originals" at the bottom of games
- **New js/ka-sources.js** (loaded on every page by ka-chrome.js): on 22 games, a "📂 Printable originals" section above "What next?" links to the **whole GitHub folder** in KamaAgni/KamaAgniPDF that the game comes from ("Open folder on GitHub ↗") and lists **every PDF in that folder**, each with "📖 Read" (in-app Reader) and "↗" (GitHub). File names, page counts and sizes come from data/library.json.
- Pages and folders: Hornopoly, Truth or Dare, Would You Prefer, Roleplay Studio, Kinky Dice and Intimacy Dice (dice games), Kink Explorer and Desire Match (Kink List 4.0), 30-Day Spark (Whole Week cards), Bucket List, Match & Reward (reward tracker), Love Coupons (all of 6 Sex Coupons), Prompts (5 Submissive Woman), BDSM Journey, Challenges (Brave cards, BDSM games), Date Planner (calendars), Task Deck (all task-book folders), Position Selector, Bedroom Skills and Learn (guides and ebooks), Crazy Sex (Naughty Games), Scratch-Off Book (advent calendars). Edit the `MAP` at the top of js/ka-sources.js to change any of these.
- Follows the `LIBRARY` switch in js/ka-config.js: set it to false and the section disappears with the Library.

## v73: plan tonight, partner nudges, check-ins, print, reader, long-distance
- **Plan Tonight upgraded** (games/kamaagni-tonight.html): builds a whole evening: Unwind (when you're tired or have an hour or more), Connect (a question for the mood), Warm up, Main event (a role-play suited to your heat level, unplayed first, opened straight from `kamaagni-roleplay.html?n=N`, or a game), Turn it up (90+ minutes) and Afterglow. Swap re-picks the story. When you're linked, "Invite" sends the plan to your partner's phone.
- **Invites & Secret Wishes** (games/kamaagni-invite.html, js/ka-nudge.js): invitations worded the way your partner said they like to be asked (from the Talk Kit), RSVP "Yes / Later / Let's plan", an inbox, and 24 secret wishes where you only ever see the ones you **both** picked. Uses the existing encrypted couple events. New notification types: inv, rsvp, plan, wish, ldr.
- **Monthly Check-in** (games/kamaagni-checkin.html): seven 1–5 questions each (closeness, desire, sex, talking, feeling wanted, fun, calm) plus a note. Results side by side with change vs last month, a suggestion for your lowest area, and a Trends chart for both of you. Home shows a reminder from the 25th until you've both answered.
- **Print Studio** (games/kamaagni-print.html): any card deck (by category), any task pack, your saved favourites or your own cards → A4 cut-out cards at 12, 8 or 4 per page, random mix, cut lines and optional card backs (mirrored for double-sided printing). Your topic filters apply.
- **Better reader and Library:** ☆ bookmarks per page with a jump list, reading progress saved per PDF (`ka_pdf_meta`, `ka_pdf_bm`). The Library has a "📖 Continue reading" shelf with progress bars, "You read up to page N" on each book, and "Used in:" links to the games that use each PDF.
- **Long-distance** (games/kamaagni-apart.html): both clocks with "good time to call?", your partner's time zone, a countdown to your next visit, a daily task (the same for both of you, labelled with who it's for) plus a daily ritual, one-tap nudges to their phone (or copy/share), stories to play apart, and every two-phone game.
- All four new pages are in the menu, the catalogue (marked New) and the offline cache. Version v73, cache kamaagni-v75.

## v74: Today card, saved evenings, dates, veto, quick start, dark room, read aloud, gift box, offline PDFs, who-does-it tags
- **Today on Home** (js/ka-next.js): one card with what matters today: plans due, Plan Tonight progress ("1 of 5 steps left · next: Connect"), special dates in the next 7 days, the monthly check-in from the 25th, today's long-distance task, and (when linked) invitations from your partner you haven't answered.
- **Saved evenings** (Plan Tonight): "★ Save this evening" with a name, then repeat it in one tap from the top of the page (up to 12, key `ka_plan_saved`).
- **Our Dates** (games/kamaagni-dates.html, key `ka_dates`): anniversaries, wedding, birthdays, first date/kiss, moving in, engagement or anything else, yearly or one-off. Countdown and years for each; in the last week, ideas from KamaAgni (e.g. The Wedding Night, Old Flames Reunited, Secret Envelope, the gift box) and "Add a Memory Book page" (Memory Book now accepts `?new=1&t=&d=&g=`). Home shows it a week ahead, with a toast on the day.
- **Partner veto** (Plan Tonight + Invites): a shared plan now carries its steps. Your partner can tap "✗ Not this one" on one step; your Plan Tonight marks it ("would rather skip this one") so you swap it. New event kind `veto`, with a notification.
- **Quick start** (js/ka-ui.js): every game using the shared setup screen (22 games) shows "⚡ Same as last time" with your last mode and categories. One tap starts.
- **Dark-room mode** (Settings → Comfort, or the ⏸ panel): dims the screen warm, text 112%, stops animations, and silences all sounds, music and vibration. Key `ka_darkroom`.
- **Read aloud** (new js/ka-voice.js, loaded by ka-chrome.js): a 🗣 button in the header on 35 reading and game pages reads the card most on screen with the phone's own voice; tap ⏹ to stop. Nothing leaves the phone. `KA_VOICE.say(text)` for other pages.
- **Gift box** (Print Studio → "🎁 Gift box"): a letter page in your own words (with starters), 4–8 love coupons and 0–4 role-play invitations at your heat level ("Redeem for one night of…" plus the opening line), with optional card backs.
- **Our Week** shows the latest check-in: overall score, your win and one thing to try, with a link. Cards there now have proper padding and heading levels.
- **Keep PDFs offline** (Library): "📥 Keep offline" on every book saves it on the device (Cache Storage `ka-pdf-offline`, kept across updates). The Reader opens the saved copy first. New tab "📥 On this device".
- **Who each task is for:** new tools/tag-packs.py tags all 8,171 tasks in data/packs as written to her (4,477), him (2,581) or either (1,113), from the words in each task plus a default per pack. Saved in data/packs/who.json (re-run the script after editing packs). Shared helpers `KX.whoLoad()`, `KX.forTag()`, `KX.forText()`. Task Deck, Guided Session, Together's shared card, Long-distance and Print Studio show "For {name}" and word him/her for the right person. Same-gender couples see these as "either of you".
- Fixed: Role-play "NEW" badge raised to 12px.
- Version v74, cache kamaagni-v76. js/ka-embed.js regenerated.

## v75: full-site UX sweep
All 91 pages were opened at four screen sizes with random tapping (no script errors anywhere), scanned with axe-core, and reviewed page by page from phone screenshots, including the first-run screens.
- **History and Our Week are honest:** a game counts as "Played" only after you actually play (three taps inside the game, or three minutes on the page). Just opening a page to look no longer logs it. Tool pages (dates, print, check-in, invites, search, planner and so on) never log as games.
- **Home:** the Today rows (plans, tonight's progress, upcoming dates, check-in, long-distance, waiting invitations) now sit at the top inside "Today, for the two of you" instead of a screen and a half down. New section **Closer together** links Invites & Wishes, Talk Kit, Brakes & Accelerators, Monthly Check-in, Our Dates, Long-distance and Print Studio. Out-of-date descriptions corrected (Role-play 90 stories, Task Deck 8,000+ tasks in 48 packs, Truth or Dare 312/300, Bucket List 124, Challenges 92).
- **Games hub:** "NEW" was on 52 of 78 games. Now only the 7 newest pages carry it, and only until you've opened them.
- **Header on small phones (360px):** on games with the ❓ guide, the ☆ and account buttons were pushed off-screen. The header now tightens and the logo shrinks so everything fits.
- **❓ guides:** Connect Foreplay's guide described a different game and Showdown's didn't match its rules. Both rewritten. New step-by-step guides for Task Deck, Secret Envelope, Challenges, BDSM Journey, Free-time Fun, Love Languages, Invites, Print Studio, Our Dates, Long-distance, Memory Book, Movie Night and Our Playlist.
- **Welcome screen:** the two gender pickers were tiny unstyled browser boxes. Now full-width and styled like the name boxes.
- **Settings:** the Comfort box sat above the page title. Now it's below Names & genders.
- **Poker:** player names fill in from your couple names.
- **Long-distance:** the daily task now follows your heat level (Sweet hides explicit tasks, Spicy hides the intense ones).
- **Long lists:** Love Coupons shows 12 at a time and Movie Night 15, each with "Show more". These were 19,000px and 14,000px long on a phone.
- **Readability and taps:** tick buttons are bigger (32px, with a larger hit area); dice-face text in the Position selectors, Ludo key hints and "WIN" labels, and Progress chart labels raised to at least 12px; five pages had headings that skipped a level (Home, Learn, Roadmap, Search, Settings). Fixed.
- Version v75, cache kamaagni-v77.

## v76: more steamy and explicit films
- **Movie Night:** 51 new films, 174 in total. The Steamy heat level went from 14 to 53 films, and the Steamy mood from 24 to 75. Added: Love, 9 Songs, Shortbus, Babygirl, the Fifty Shades trilogy, Below Her Mouth, Sex and Lucía, In the Realm of the Senses, Henry & June, Bitter Moon, Belle de Jour, The Duke of Burgundy, Venus in Fur, Showgirls, Original Sin, Damage, Swimming Pool, Stranger by the Lake, Don Jon, Love & Other Drugs, Saltburn, Challengers, Passages, Queer, Love Lies Bleeding, Anora, Fair Play, Magic Mike’s Last Dance, Deep Water, Fatal Attraction, Indecent Proposal, Disobedience, Room in Rome, Newness, Crash, Hustlers, Emmanuelle (2024), Pleasure, Sliver, Lady Chatterley’s Lover (2022), The Housemaid, Kama Sutra: A Tale of Love, Sex Tape, Carol, and Bollywood: Gehraiyaan, Lust Stories 1 and 2, Aitraaz, Murder 2. Descriptions are KamaAgni’s own.
- Left out on purpose: films with sexual content involving characters under 18, and films that present non-consent as romance.
- Movie Night is now listed up to Wild heat in the Games hub. Version v76, cache kamaagni-v78.

## v77: shorter Home, easy partner linking, instant game start
- **Home is 40% shorter on a phone** (about 7,450px → 4,300px). The full list of games, tools and guides now sits in one **🗂️ Browse everything** section, closed by default (it remembers if you open it), with a link to the Games hub. The top of Home is Today, Plan Tonight, Start here (first visit) and the tonight dashboard. "Still to discover" shows 2 picks on phones instead of 4.
- **Partner linking is guided** (Together): a 4-step tracker (Sign in → Unlock your vault → Invite or join → Partner joins) and a "What linking unlocks" list on every step. Creating an invite now shows a **QR code**: your partner points their phone camera at it and taps the link. Share and Copy are still there. The page checks every 5 seconds and celebrates when they join. Someone who opens an invite link gets a single "Join my partner" button. Opening a new invite link while Together is already open now works.
  - The invite can't be a short 6-digit code: the link carries the key that end-to-end encrypts what you share, and a short code would weaken that.
  - New `js/vendor/qrcode.min.js` (qrcode-generator 1.4.4, MIT).
  - Tested end to end with two simulated phones on a mock backend: link, shared plan, skip a step, invitation, reply and secret wishes (only shared wishes are revealed).
- **Games start in one tap** (the 22 games on the shared setup screen): mode, heat and a big Start button are on the first screen. Categories and options moved into **⚙️ Customise** (closed by default, remembers if you prefer it open), with a one-line summary such as "All 18 categories · Free play · 3 passes per person".
- `dev/mock-server.py`: a small in-memory stand-in for the cloud backend (port 8787) for testing two-phone features. Set `MOCK_URL` in js/ka-config.js only while testing, never on the live site.
- Version v77, cache kamaagni-v79.

## v78: shared settings, 👍/👎 on cards, resume anything, partner alerts, older games tidied
- **One set of settings for both phones** (new js/ka-shared.js, loaded on every page). When you're linked, heat level, topic switches, hide-words, hidden games and names & genders are the same on both phones. Names are mirrored: your "me" is their "partner".
  - **On linking:** the two sets are merged the safe way (the lower heat, every topic either of you switched off, both hide-word lists, all hidden games). A toast says so.
  - **After that:** a change on either phone reaches the other within seconds (an encrypted `cfg` couple event; newest change wins), with a short toast ("Riya updated your shared settings (heat: Sweet)").
  - Settings shows "🔗 Shared with Riya…" while linked.
  - Two-phone games therefore always use the same heat and topics.
  - Tested on two simulated phones: merge on link, heat and topic changes both ways, renaming.
- **👍 / 👎 under every card** (new js/ka-fb.js): the card games, Task Deck, Guided Session and Together. 👎 hides that card everywhere from now on: js/ka-filter.js skips it in every deck, task pack and game, however it was worded for you (names and him/her are ignored when matching). 👍 saves it to favourites. Settings → "Cards you've hidden" lists them, with Restore and Restore all. Stored in `ka_fb`, synced to your account.
- **Resume anything:** a "▶️ Continue" row in Today on Home for whatever you were in the middle of in the last 12 hours.
  - Role-play reopens at the same step and beat (deep link `?n=&pi=&sw=&s=&b=`).
  - The Guided Session saves each step and offers "Pick up where you left off".
  - The 13 games on the two-phone engine (Truth or Dare and others) resume their round.
  - Store: `KA_RESUME` in js/ka-common.js.
- **Partner alerts** (phone notifications when KamaAgni is closed): a 🔔 switch in Settings and a one-time prompt on Together once linked.
  - What triggers them: invitations, plans, replies, a skipped step, wish updates, nudges, messages, check-ins and pause signals. The alert never shows the content, only that something arrived (everything stays end-to-end encrypted).
  - Server side: supabase/push.sql (table) and supabase/functions/notify-partner (edge function, type-checked with Deno), called by a database webhook. Steps are in **SETUP-PUSH.md**.
  - Hidden until `VAPID_PUBLIC_KEY` is set in js/ka-config.js. iPhone needs iOS 16.4+ and the app added to the Home Screen.
  - sw.js shows the alert and opens the right page on tap. Tested: the switch only appears when configured, and a delivered alert shows the right title, text and page. Subscribing needs a real push service, so test that on your phone.
- **Older games tidied** (new js/ka-tidy.js): Poker, Connect Foreplay and Showdown now show only how you play, heat and Start; everything else is in ⚙️ Customise, like the other games. Dice, Ludo and both Position selectors already started in one tap.
- **Fixed:** with topic filters on, the "who it's for" tags in Long-distance, Print Studio, Guided Session and Together's shared card could point at the wrong task (list positions shifted after filtering). They now use the original position.
- "What linking unlocks" on Together now lists shared settings and partner alerts.
- dev/mock-server.py also handles alert subscriptions. Version v78, cache kamaagni-v80.

## v79: "Not for me" hides everywhere, Us at a glance, morning after, weekly date night, smarter Surprise me
- **🚫 "Not for me" hides it everywhere** (new js/ka-limits.js):
  - Anything you mark Not for me in the Kink Explorer disappears from every game, deck and task pack, the same way a 👎 does. Each of the 53 kinks maps to topic switches and words (e.g. Choking switches off breath play; Spanking hides cards that mention spanking).
  - When you're linked, it's hidden on your partner's phone too. Their phone gets only the hiding patterns and a count ("Also hidden for your partner's comfort: 2 things"), never the names. Stored as `ka_filter.auto.me` / `auto.you`.
  - Settings → "Your Not for me list" shows yours and can switch it off. The Kink Explorer's note now says what Not for me does.
  - Desire Match answers are deliberately not used: that game promises never to reveal a no.
  - Fixed along the way: the filter's save dropped any extra fields; it now keeps them.
- **🫶 Us at a glance** (games/kamaagni-us.html): love languages, what turns each of you on and what puts the brakes on (and what you both love), words you love and hate, how you like to be asked, this month's check-in bars, and wishes and curiosities as counts only (kept private). On top, up to five ideas made for you two, starting with your weakest area this month. Shows "x of 4 sections filled in", with links to fill the rest.
- **💗 The morning after** (js/ka-after.js, games/kamaagni-afterglow.html):
  - Finishing a Guided Session, reaching a role-play's afterglow step or ticking off all of tonight's plan sets a gentle reminder for the next day (Today on Home, for 3 days). When linked, it reaches both phones (event `aft`).
  - The check-in: hearts for how it felt, one thing each of you loved, one thing to try next time, and anything to talk about. It's saved to the Journal under "Morning after", dated the night itself.
- **🌹 Weekly date night** (Our Dates):
  - Pick a day and time once. It's shared with your partner's phone, shown in Today on the day with a toast, and can be added to your calendar as a weekly event with a morning alarm.
  - With partner alerts set up, both phones also get a 9 am reminder from the new supabase/functions/date-night function (hourly, via pg_cron). push.sql adds the weekday, time and time-zone columns. Steps are in SETUP-PUSH.md.
- **🎲 Smarter Surprise me** (`KA_NEXT.smart`, used by the Games hub slot machine and both Home buttons):
  - What it weighs: your 👍/👎 per game, games you haven't tried, variety (not what you played in the last two days), favourites, the time you have, mood, and your lowest check-in area.
  - It picks among the best nine so it still surprises (300 test picks covered 55 games, with liked ones and the weakest area clearly favoured).
  - The reason is shown ("Picked because you haven't tried it yet").
- Two-phone tests on the mock backend: Not for me hides on both phones without names leaving the phone, and the date night copies across.
- Us at a glance is in the menu, Home (Closer together) and the catalogue. Version v79, cache kamaagni-v81.

## v80: Position Library, 38 critics' picks, and content from 17 books
- **📖 Position Library (new)** (games/kamaagni-positions.html, data/positions.json): 95 positions in 9 families (face to face, she's on top, from behind, side by side, sitting, standing, furniture, from the Kama Sutra, advanced). Each one has the setup, what she does, what he does (couple names are used when set), why it works and a comfort tip. Filters for family, good-for (deep, G-spot, clitoral, eye contact, slow, beginner, she leads and more), difficulty and tried/favourites/not tried yet, plus search. Includes Position of the Day, "🎲 Pick one for us" (prefers ones you haven't tried), a 5-minute try timer, and tried/favourite marks in ka_pos. It's on Home, in the menu, in the catalogue and linked from Position Families.
- **🎬 Movies: 174 → 212 films.** Added 38 of the best-reviewed films from Rotten Tomatoes' erotic movies ranking. A new 🍅 Tomatometer score shows on 57 films, and a new "🍅 Critics' picks (85%+)" filter lists 22 films sorted by score. Excluded: films that sexualise minors (Lolita, Y tu mamá también, Blue Is the Warmest Color, Call Me by Your Name, Somersault, Young & Beautiful, A Bigger Splash, Nymphomaniac Vol I, Angel Heart) and films built on assault or very disturbing material (Last Tango in Paris, Kissed, The Isle, We Are the Flesh, Pola X, Obsession, The Untamed, The Cook the Thief His Wife & Her Lover, Red White & Blue, Blue Velvet, Exotica, Besieged). The TMDB keyword page refuses automated reading, so nothing was used from it.
- **📚 From the 17 books** (everything rewritten in KamaAgni's own words, nothing copied):
  - Massage Studio: 62 techniques, with new strokes for every area plus two new areas, ☯️ Taoist touch (7) and 🪷 Tantric touch (6).
  - 12-Minute Quickies: 45 → 65 scenarios.
  - Bedroom Skills: 16 → 31 guides, including spanking, restraints, setting up a fantasy, toys for two, condoms that feel good, prostate and perineum play, lasting longer, when it's hard to finish, when sex hurts, sex during pregnancy, dirty talk for beginners, multiple orgasms, pelvic floor training, watching porn together and anal play.
  - Fit for Fun: new 🤸 Position prep set (11 exercises).
  - Eight Dates: short prep worksheets before 6 of the dates, with ticks saved per date.
  - Kama Sutra Studio: new "Scratches & bites" tab (9 marks, with a consent note). The tab row now wraps on phones.
  - Hack of the Day: 167 → 196 tips. Myths vs Facts: 45 → 57.
- **Not used, on purpose:** chapters in *Hot Games for Mind-Blowing Sex* that frame non-consent as play ("The Good Rape", "The Burglar and the Victim") or act out adult/child or teacher/pupil scenes ("Babysitter and Father of the Kids", "Teacher and Student"). The modern Kama Sutra guide was byte-identical to the copy used in v68.
- Version v80, cache kamaagni-v82.

## v81: The Play Book, 60 step-by-step positions, tonight's deck, massage map, skills path, shared favourites
- **🎲 The Play Book (new)** (games/kamaagni-playbook.html, data/playbook.json, key `ka_playbook`): 74 couples' games in 7 chapters: around the house (18), fun with food (7), outdoors & water (8), position games (11), daring nights at home (10), fantasies (14), toys & props (6). Each has what you need, the setup, a 🌸 sweet & safe and a 🌶️ hot & spicy version, and ways to turn it up. Includes Tonight's game, 🎲 Pick a game for us (prefers ones you haven't played), "played x of 74" progress, favourites, search and a `?g=` link to open a game. Follows your heat level (the spicy versions show from Spicy up) and topic filters. Ideas from *Sex Games Bible* (Randi Foxx), all written in KamaAgni's own words.
  - Left out: the threesome and group chapter, sex on a children's playground, a rape-fantasy suggestion, a "photo shoot even if she objects" line, a "horny teenager" variation, secretly involving a friend, and a stereotyped "Japanese sex worker" variation. Everything set in public (lift, train, restroom, plane, cinema, office, shop, changing room) is rewritten as an at-home version, so nobody sees anything they didn't agree to.
- **📖 Position Library: 95 → 155 positions.** 60 new ones from *Kama Sutra Step by Step* (Kama Sutra, Ananga Ranga, Perfumed Garden and Tao positions), such as Mandarin Duck, The Pine Tree, Cicada on a Bough, Kama's Wheel, Tiger Step, Seagulls on the Wing, Phoenix Playing in a Red Cave and The Hanging Bow. Each new one has 3 step-by-step stages and a "take it further" idea (new `st` and `x` fields). New good-for filters: Tantric and Power play.
- **🃏 Tonight's deck** (Position Library): pick Gentle, Mixed or Adventurous and get three positions from different families, gentlest first and the hottest last, preferring untried ones and ones you both love. ▶ Start runs a 5-minute timer for each; finishing marks all three as tried.
- **♥♥ We both love it** (new js/ka-both.js, loaded on every page): when you're linked, favourites in the Position Library and the Play Book are shared with your partner's phone (encrypted couple event `favs`). Positions and games you've both starred are marked "♥♥ you both love it", and a "♥♥ We both love" filter appears. Only favourites are shared, never tried ticks.
- **🎬 After the film** (Movie Night): every film card suggests one thing to do afterwards, matched to the film's mood and heat and capped at your heat level. For example, Ask and Tell after a romance, Candlelit Striptease or Strangers at the Bar after a steamy one, House Arrest after a thriller, Talk Kit after a deep one.
- **🗺️ Massage map** (Massage Studio): a body outline with back and front views. Tap an area (or Taoist / Tantric touch) to see its techniques, then run one, or all of them in a row, with the guided timer.
- **🧗 Skills path** (Bedroom Skills): three levels (Basics 9, Building up 14, Adventurous 8). The next level opens after 3 ticks in the one before, and "next up" shows what to try next. A locked guide still shows its summary and can be opened with "Peek anyway". Two overlapping guides were renamed: "Building intensity together" and "Lasting longer: a training plan".
- *Hot Games for Mind-Blowing Sex* was checked again: 10 of its scenarios are already role-plays (bar, restaurant, call girl, dancer, massage, boss, maid, traffic stop, roadside, rope lesson). The rest overlap existing content or were left out in v80.
- Three phrases were reworded because they tripped the default-off topic filters ("throat", "shock", "blood") and hid content by mistake.
- Fixed: the Connect Foreplay "Self-control finale" tick box is now finger-sized.
- Version v81, cache kamaagni-v83. js/ka-embed.js regenerated.

## v82: night menu, position walkthrough, massage remote, New for Us, plan-it, better search and Plan Tonight
- **🍽️ Tonight's menu** (Play Book): a starter (around the house or food, kept to Sweet or Spicy), a main (positions, fantasies or daring) and a dessert (toys, water or food), favouring games you haven't played and ones you both love. ↻ swaps any course, a title opens that game, "✓ We did it" marks all three played, and "📅 Plan it" saves the menu as a plan.
- **👣 Walk us through it** (Position Library): on the 60 positions with stages, a full-screen walkthrough shows one stage at a time with a short timer (45 s, then 60 s, then 3 minutes to enjoy). The next stage comes up on its own, with Back, Next and Close (Esc works too). Finishing marks the position tried.
- **📲 Receiver's remote** (Massage Studio, new js/ka-remote.js): the receiver taps Lighter, Firmer, Slower, A little faster, Stay right there, Move on, More oil or That feels amazing, and the giver's phone shows it with a buzz ("🐢 Riya says Slower"). While a massage is open the giver's phone checks every 3 seconds (2 seconds end to end in the two-phone test). Encrypted couple event `mrm`; nothing is stored. Not linked? The screen shows the message so you can just turn the phone round.
- **🌟 New for Us** (new games/kamaagni-month.html, key `ka_month`): each month, one position, one Play Book game and one Bedroom Skills guide you haven't tried yet, kept for the whole month. Open each one directly, or mark it done there. Doing all three earns that month's badge (with XP), and past badges are listed. Shows in Today on Home until done, in the menu, the catalogue and on Home.
- **📅 Plan it**: favourite positions and Play Book games get a "Plan it" button (gold when you both love it). It opens Make a plan with that exact item, and the saved plan opens straight to it on the day (planDialog now keeps the specific item and link).
- **Links that open one item:** `kamaagni-positions.html?p=`, `kamaagni-playbook.html?g=` (v81) and `kamaagni-skills.html?s=` (a locked guide opens as a peek).
- **🔎 Search finds what's inside the app:** besides pages, results now include all 155 positions, the Play Book games, the role-plays (within your heat level and filters) and the 31 skills guides, grouped and opening straight to the item ("lotus", "shower", "pirate"…).
- **Fixed: search results for pages were broken links.** Every page result linked to `games/games/…`. They open correctly now.
- **Plan Tonight:** evenings of an hour or more (Spicy and up) get a "Try a position" step chosen from the Position Library to suit the mood (romantic: intimate and slow; playful: she leads or novel; adventurous: deeper or harder; tired: lazy and easy). Playful and adventurous evenings sometimes get a Play Book game as the main event. Both can be swapped.
- Home: a 🌟 New for Us card. Today rows' subtitles are easier to read (contrast).
- Connect Foreplay's finale tick box is 32px like the others.
- Tested: two simulated phones on the mock backend (remote message arrives in about 2 s; favourites shared both ways and "We both love" filter), every changed page at four sizes with random tapping, and axe-core on all 96 pages (no issues).
- Version v82, cache kamaagni-v84.

## v83: Play Book dice and your own games, remote in more places, STOP always gets through, shared walkthrough, year in review
- **🎲 Roll the dice** (Play Book): three dice roll a chapter, a version (🌸 sweet or 🌶️ spicy, sweet only at Sweet heat) and a twist (blindfold, whispers only, double the time, swap who leads, no hands for two minutes, a new room, slow motion, eyes locked, an ice cube…). "Play it" opens a matching game you haven't played, in that version, with the twist shown on the card. Respects reduced motion.
- **✍️ Write our own** (Play Book): add your own games with a name, chapter, heat, what you need, the setup, a sweet version, an optional spicy version and up to six "turn it up" ideas. They're marked ✍️ Ours, have their own "Our own" filter, and can be edited or deleted (tap twice). They're part of the dice, Tonight's menu and Pick a game. Saved in `ka_playbook.mine` and synced to your account. Names must be unique.
- **📲 Remote in the Guided Session and Role-play** (js/ka-remote.js is now shared; `KA_REMOTE.open(set)`): each page has its own set. Session: more, slower, stay there, change it up, kiss me, cuddle, water break, ready for the next step. Role-play: more, slower, stay in character, step out of character, next scene, kiss me, water break, that feels amazing. Massage keeps its own set. Every remote also has 🟢 Green / 🟡 Yellow / 🔴 Red at the top, sent as Together's signal, so a red is the same full STOP alert on the partner's phone. These pages check every 3 seconds (`KA_CHROME.check` is now exported).
- **🔴 STOP always gets through:** a partner's STOP now shows even if partner notifications are muted in Settings (`ka_stop_seen`).
- **👣 Shared walkthrough** (Position Library): when you're linked, starting a walkthrough opens it on your partner's phone at the same stage. Either of you can move it on or close it for both (couple event `walk`). On another page, your partner gets "Manav started a walkthrough · tap to join", which opens it at the current stage (`?p=…&walk=N`).
- **🌟 Our year in KamaAgni** (Roadmap → Yearly review): for the chosen year, from this phone, it shows how many times you played and what you played most, positions tried, Play Book games played, New for Us badges, memories saved and what you both love. Use it to fill in your best moments.
- Today rows on Home have brighter subtitles (contrast). The Home "Surprise us" button has a label. Headings on the yearly review are in order.
- Tested on two simulated phones on the mock backend: role-play remote (2.1 s), STOP with notifications muted, and walkthrough open, next stage and close on both phones. Also the changed pages at four sizes with random tapping, and axe-core on all 96 pages (no issues).
- Version v83, cache kamaagni-v85.

## v84: dice on both phones, remote history in the morning after, Play Book in Print Studio, yearly review from both phones
- **🎲 Dice on both phones** (Play Book): when you're linked, a roll is sent to your partner (couple event `dice`). Their phone shows the same roll ("Manav rolled…") with the same chapter, version, twist and game, and either of you can roll again. If the game is one of your own, its text travels with it so your partner sees it too. On another page your partner gets "Manav rolled the dice · tap to see". The Play Book checks every 3 seconds (1.8 s end to end in the test).
- **📲 During the night** (The morning after): the remote now keeps a short history on the phone (`ka_remote_log`, last 30 days, never sent anywhere). The morning-after check-in shows what the remote said during the evening, most used first and who sent it, plus a gentle tip: what came up most is a clue for next time, and if a 🟡 or 🔴 came up, it suggests a no-blame chat. The summary is saved in the Journal entry too. 🟢🟡🔴 sent from your partner's remote are logged as well.
- **🖨️ Play Book in Print Studio:** new sources "Play Book games (by chapter)", "Our favourite games" and "Games we wrote". Each card has the game's name, setup and the version for your heat level (spicy from Spicy up), with topic filters applied. The Play Book links to it ("Print your favourite games as cards", "print the ones you wrote"). Print Studio accepts `?src=`.
- **🔗 Yearly review from both phones** (Roadmap): when you're linked, each phone sends its own year summary once a day, encrypted (couple event `yr`, stored as `ka_year_p`). "Our year in KamaAgni" then combines both phones: the same game logged on both within 3 hours counts once, positions, games and badges count once, and memories use the larger count. It says when it's from both phones and when it was last updated. `KA_BOTH.yearData(Y)` / `KA_BOTH.merged(Y)`.
- Tested on two simulated phones on the mock backend: same dice roll on both (1.8 s), remote history logged as sent and received, combined yearly review on both phones (shared Truth or Dare counted once, positions merged). Also the changed pages at four sizes with random tapping, and axe-core on all 96 pages (no issues).
- Version v84, cache kamaagni-v86.
