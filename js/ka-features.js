/**
 * KamaAgni — Feature Suite
 * PIN Lock (session-aware + quick lock), Couple Profiles, Festival Mode,
 * Mood Picker, Favourites Hub, Surprise Me, Ambient Music
 */

(function () {
'use strict';

/* ─── Storage helpers ─────────────────────────────────── */
const LS = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del: (k)    => { try { localStorage.removeItem(k); } catch {} }
};

/* Session flag — PIN only asked once per browser session */
const SESSION_KEY = 'ka_unlocked';
function isSessionUnlocked() {
  try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch { return false; }
}
function markSessionUnlocked() {
  try { sessionStorage.setItem(SESSION_KEY, '1'); } catch {}
}

/* ─── Festival detection ──────────────────────────────── */
const FESTIVALS = [
  { emoji: '🪔', dates: [[9,2],[9,12]],   color: '#f5c842', label: 'Navratri Nights' },
  { emoji: '🎆', dates: [[10,20],[10,27]], color: '#ff6b35', label: 'Diwali Nights' },
  { emoji: '🪁', dates: [[0,13],[0,15]],   color: '#6c7ef8', label: 'Uttarayan Mode' },
  { emoji: '💝', dates: [[1,12],[1,15]],   color: '#e8637a', label: "Valentine's Week" },
  { emoji: '🎊', dates: [[11,30],[0,2]],   color: '#f5c842', label: 'New Year Special' },
];
function getActiveFestival() {
  const m = new Date().getMonth(), d = new Date().getDate();
  for (const f of FESTIVALS)
    for (const [fm, fd] of f.dates)
      if (m === fm && Math.abs(d - fd) <= 3) return f;
  return null;
}

/* ─── Toast ───────────────────────────────────────────── */
function toast(msg) {
  let el = document.getElementById('ka-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'ka-toast';
    el.className = 'ka-toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ─── CSS ─────────────────────────────────────────────── */
function injectCSS() {
  document.head.insertAdjacentHTML('beforeend', `<style>
/* KamaAgni Feature Suite */
.ka-overlay{position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:16px;animation:kaFadeIn .2s ease}
@keyframes kaFadeIn{from{opacity:0}to{opacity:1}}
.ka-modal{background:#0c0e1c;border:1px solid rgba(255,255,255,0.13);border-radius:24px;padding:30px 24px;width:100%;max-width:360px;text-align:center;animation:kaSlideUp .28s cubic-bezier(.22,1,.36,1);position:relative}
@keyframes kaSlideUp{from{transform:translateY(22px);opacity:0}to{transform:translateY(0);opacity:1}}
.ka-modal h2{font-family:'Cinzel',serif;font-size:22px;color:#dce9ff;margin-bottom:6px}
.ka-modal .ka-sub{font-size:13px;color:#7a8aab;margin-bottom:22px;line-height:1.55}
.ka-x{position:absolute;top:14px;right:16px;background:none;border:none;cursor:pointer;color:#7a8aab;font-size:22px;line-height:1;padding:4px;transition:color .18s}
.ka-x:hover{color:#dce9ff}
.ka-pin-dots{display:flex;gap:16px;justify-content:center;margin-bottom:20px}
.ka-pin-dot{width:14px;height:14px;border-radius:50%;border:2px solid rgba(255,255,255,0.18);background:transparent;transition:all .14s}
.ka-pin-dot.filled{background:#e8637a;border-color:#e8637a;box-shadow:0 0 10px rgba(232,99,122,0.5)}
.ka-pin-dot.shake{animation:kaShake .35s ease}
@keyframes kaShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.ka-keypad{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}
.ka-key{background:#12152a;border:1px solid rgba(255,255,255,0.09);border-radius:14px;padding:15px 8px;font-size:20px;font-weight:700;color:#dce9ff;cursor:pointer;transition:background .12s,transform .08s;-webkit-tap-highlight-color:transparent}
.ka-key:hover{background:#1a1f3a}
.ka-key:active{transform:scale(0.91);background:#1e2440}
.ka-key.del{font-size:16px;color:#7a8aab}
.ka-pin-err{color:#e8637a;font-size:13px;min-height:18px;margin-bottom:8px}
.ka-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 24px;border-radius:999px;border:none;cursor:pointer;font-family:inherit;font-size:14px;font-weight:700;transition:transform .12s,box-shadow .12s;-webkit-tap-highlight-color:transparent;width:100%;margin-bottom:10px}
.ka-btn:active{transform:scale(0.96)}
.ka-btn-rose{background:linear-gradient(135deg,#e8637a,#f07090);color:#fff;box-shadow:0 4px 18px rgba(232,99,122,0.3)}
.ka-btn-rose:hover{box-shadow:0 6px 24px rgba(232,99,122,0.5)}
.ka-btn-ghost{background:transparent;color:#7a8aab;border:1px solid rgba(255,255,255,0.11)}
.ka-btn-ghost:hover{color:#dce9ff;border-color:rgba(255,255,255,0.22)}
.ka-btn-danger{background:transparent;color:#e17168;border:1px solid rgba(225,113,104,0.25)}
.ka-btn-danger:hover{background:rgba(225,113,104,0.08)}
.ka-divider{height:1px;background:rgba(255,255,255,0.07);margin:12px 0}
.ka-input{width:100%;background:#12152a;border:1px solid rgba(255,255,255,0.11);border-radius:12px;padding:12px 14px;color:#dce9ff;font-size:14px;font-family:inherit;margin-bottom:10px;outline:none;transition:border-color .18s;-webkit-appearance:none;display:block}
.ka-input:focus{border-color:rgba(232,99,122,0.45)}
.ka-input::placeholder{color:#7a8aab}
#ka-toolbar{position:fixed;left:16px;bottom:20px;display:flex;flex-direction:column;align-items:center;gap:10px;z-index:8000}
.ka-fab{width:46px;height:46px;border-radius:50%;border:1px solid rgba(255,255,255,0.13);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:19px;box-shadow:0 4px 16px rgba(0,0,0,0.55);transition:transform .14s,box-shadow .14s,border-color .18s;-webkit-tap-highlight-color:transparent;background:#0c0e1c}
.ka-fab:hover{transform:scale(1.1);box-shadow:0 6px 22px rgba(0,0,0,0.65)}
.ka-fab:active{transform:scale(0.93)}
.ka-fab.music-on{background:#1a0d18;border-color:rgba(232,99,122,0.45);animation:kaMusicPulse 2s ease infinite}
@keyframes kaMusicPulse{0%,100%{box-shadow:0 4px 16px rgba(232,99,122,0.3)}50%{box-shadow:0 4px 24px rgba(232,99,122,0.65)}}
#ka-lock-screen{position:fixed;inset:0;z-index:9200;background:#05060f;display:flex;flex-direction:column;align-items:center;justify-content:center}
#ka-lock-screen.hidden{display:none}
.ka-lock-brand{font-family:'Cinzel',serif;font-size:38px;font-weight:900;letter-spacing:.18em;background:linear-gradient(180deg,#fff 0%,#fff 45%,#ff9a5c 75%,#ff6b35 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:8px}
.ka-lock-sub{font-size:13px;color:#7a8aab;letter-spacing:.15em;text-transform:uppercase;margin-bottom:40px}
#ka-settings{position:fixed;left:68px;bottom:20px;background:#0c0e1c;border:1px solid rgba(255,255,255,0.13);border-radius:20px;padding:20px;width:240px;box-shadow:0 12px 40px rgba(0,0,0,0.65);z-index:7999;display:none;animation:kaSlideUp .22s cubic-bezier(.22,1,.36,1)}
#ka-settings.open{display:block}
.ka-settings-hd{font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#7a8aab;margin-bottom:14px}
#ka-couple-banner{display:none;background:linear-gradient(135deg,rgba(232,99,122,0.1),rgba(108,126,248,0.1));border:1px solid rgba(232,99,122,0.18);border-radius:14px;padding:12px 16px;margin-bottom:16px;position:relative;z-index:1;text-align:center}
#ka-couple-banner.on{display:block}
.ka-couple-names{font-size:16px;font-weight:700;color:#dce9ff;margin-bottom:3px}
.ka-couple-days{font-size:12px;color:#7a8aab}
#ka-fest-banner{display:none;border-radius:14px;padding:10px 16px;margin-bottom:16px;position:relative;z-index:1;text-align:center;font-weight:700;font-size:14px;animation:kaGlow 2.2s ease infinite}
#ka-fest-banner.on{display:block}
@keyframes kaGlow{0%,100%{opacity:1}50%{opacity:.78}}
.ka-mood-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.ka-mood-btn{background:#12152a;border:1px solid rgba(255,255,255,0.09);border-radius:14px;padding:14px 10px;font-size:13px;font-weight:600;color:#dce9ff;cursor:pointer;transition:all .14s;-webkit-tap-highlight-color:transparent;line-height:1.45}
.ka-mood-btn:hover{background:#1a1f3a;border-color:rgba(232,99,122,0.3);transform:translateY(-2px)}
.ka-mood-btn:active{transform:scale(0.96)}
.ka-fav-list{display:flex;flex-direction:column;gap:8px;max-height:320px;overflow-y:auto}
.ka-fav-item{background:#12152a;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:10px 14px;font-size:13px;color:#a8bcd8;line-height:1.5;display:flex;align-items:flex-start;gap:8px}
.ka-fav-tag{font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#7a8aab;flex-shrink:0;margin-top:1px}
.ka-fav-empty{font-size:14px;color:#7a8aab;font-style:italic;text-align:center;padding:22px}
#ka-surprise-wrap{text-align:center;margin:0 0 26px}
#ka-surprise-btn{display:inline-flex;align-items:center;gap:10px;padding:13px 30px;border-radius:999px;border:none;cursor:pointer;background:linear-gradient(135deg,#e8637a,#f07090);color:#fff;font-family:'DM Sans',system-ui,sans-serif;font-size:15px;font-weight:700;box-shadow:0 5px 22px rgba(232,99,122,0.32);transition:transform .14s,box-shadow .14s;-webkit-tap-highlight-color:transparent}
#ka-surprise-btn:hover{transform:translateY(-3px);box-shadow:0 9px 30px rgba(232,99,122,0.48)}
#ka-surprise-btn:active{transform:scale(0.96)}
.ka-track-list{display:flex;flex-direction:column;gap:8px;margin-bottom:14px}
.ka-track{display:flex;align-items:center;gap:12px;background:#12152a;border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:12px 14px;cursor:pointer;transition:all .14s;-webkit-tap-highlight-color:transparent}
.ka-track:hover{border-color:rgba(232,99,122,0.28);background:#1a0d18}
.ka-track.on{border-color:rgba(232,99,122,0.5);background:#1a0d18}
.ka-track-name{font-size:14px;color:#dce9ff;flex:1}
.ka-beat{width:9px;height:9px;border-radius:50%;background:#e8637a;display:none;animation:kaBeat .58s ease infinite}
.ka-track.on .ka-beat{display:block}
@keyframes kaBeat{0%,100%{transform:scale(1)}50%{transform:scale(1.45)}}
.ka-vol{width:100%;accent-color:#e8637a;margin-top:6px}
.ka-toast{position:fixed;bottom:76px;left:50%;transform:translateX(-50%) translateY(8px);background:#12152a;border:1px solid rgba(255,255,255,0.14);color:#dce9ff;padding:10px 22px;border-radius:999px;font-size:13px;font-weight:600;z-index:10000;opacity:0;transition:opacity .24s,transform .24s;white-space:nowrap;pointer-events:none;box-shadow:0 8px 28px rgba(0,0,0,0.5)}
.ka-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
@media(max-width:480px){
  .ka-modal{padding:22px 16px}
  #ka-settings{left:8px;bottom:76px;width:calc(100vw - 16px)}
}
</style>`);
}

/* ─── PIN keypad ──────────────────────────────────────── */
function pinKeypad(mode) {
  const titles = { enter: 'Enter PIN', set: 'Set a PIN', confirm: 'Confirm PIN' };
  const subs   = { enter: 'Your private space', set: 'Choose a 4-digit PIN to protect your space', confirm: 'Enter your PIN once more to confirm' };
  let entered = '';

  return new Promise(resolve => {
    const ov = document.createElement('div');
    ov.className = 'ka-overlay';
    ov.style.zIndex = '9600';
    ov.innerHTML = `
      <div class="ka-modal" style="max-width:300px">
        <h2>${titles[mode]}</h2>
        <p class="ka-sub">${subs[mode]}</p>
        <div class="ka-pin-dots">${[0,1,2,3].map(i => `<div class="ka-pin-dot" id="kd${i}"></div>`).join('')}</div>
        <p class="ka-pin-err" id="kpin-err"></p>
        <div class="ka-keypad">${[1,2,3,4,5,6,7,8,9,'',0,'del'].map(k => `<button class="ka-key${k==='del'?' del':''}" data-k="${k}">${k==='del'?'⌫':k===''?'':k}</button>`).join('')}</div>
        ${mode==='set' ? `<button class="ka-btn ka-btn-ghost" id="kpin-skip" style="margin-top:2px">Skip for now</button>` : ''}
      </div>`;
    document.body.appendChild(ov);

    const dots = () => [0,1,2,3].forEach(i => document.getElementById(`kd${i}`).classList.toggle('filled', i < entered.length));

    ov.addEventListener('click', e => {
      const btn = e.target.closest('[data-k]');
      if (!btn) return;
      const v = btn.dataset.k;
      if (v === '') return;
      if (v === 'del') { entered = entered.slice(0, -1); }
      else if (entered.length < 4) { entered += v; }
      dots();
      document.getElementById('kpin-err').textContent = '';
      if (entered.length === 4) setTimeout(() => { ov.remove(); resolve(entered); }, 160);
    });

    if (mode === 'set') {
      document.getElementById('kpin-skip').onclick = () => { ov.remove(); resolve(null); };
    }
  });
}

/* ─── Lock screen element ────────────────────────────── */
function buildLockScreen() {
  const el = document.createElement('div');
  el.id = 'ka-lock-screen';
  el.innerHTML = `<div class="ka-lock-brand">KamaAgni</div><div class="ka-lock-sub">ignite the night</div>`;
  return el;
}

/* ─── Run PIN unlock flow ────────────────────────────── */
async function runUnlockFlow(ls) {
  const saved = LS.get('ka_pin', null);
  if (!saved) { ls.remove(); return; }
  let tries = 0;
  while (tries < 6) {
    const entered = await pinKeypad('enter');
    if (entered === saved) { markSessionUnlocked(); ls.remove(); return; }
    tries++;
    document.querySelectorAll('.ka-pin-dot').forEach(d => {
      d.classList.add('shake');
      setTimeout(() => d.classList.remove('shake'), 400);
    });
    toast('Incorrect PIN. Please try again.');
  }
  markSessionUnlocked();
  ls.remove();
}

/* ─── Check PIN on page load ─────────────────────────── */
async function checkPinOnLoad() {
  const saved = LS.get('ka_pin', null);
  if (!saved || isSessionUnlocked()) return;
  const ls = buildLockScreen();
  document.body.appendChild(ls);
  await runUnlockFlow(ls);
}

/* ─── Quick lock ─────────────────────────────────────── */
async function quickLock() {
  const saved = LS.get('ka_pin', null);
  if (!saved) { toast('Set a PIN in Settings first to use Quick Lock.'); return; }
  try { sessionStorage.removeItem(SESSION_KEY); } catch {}
  const ls = buildLockScreen();
  document.body.appendChild(ls);
  await runUnlockFlow(ls);
}

/* ─── Couple profile ─────────────────────────────────── */
function openCoupleProfile() {
  const p = LS.get('ka_couple', {});
  const ov = document.createElement('div');
  ov.className = 'ka-overlay';
  ov.innerHTML = `
    <div class="ka-modal">
      <button class="ka-x" id="kcp-x">×</button>
      <h2>Your Couple Profile</h2>
      <p class="ka-sub">Personalise your KamaAgni experience</p>
      <input class="ka-input" id="kcp-p1" placeholder="Partner 1 name" value="${p.p1 || ''}">
      <input class="ka-input" id="kcp-p2" placeholder="Partner 2 name" value="${p.p2 || ''}">
      <label style="font-size:11px;color:#7a8aab;display:block;margin:-2px 0 6px;text-align:left">Anniversary date</label>
      <input class="ka-input" id="kcp-ann" type="date" value="${p.ann || ''}">
      <button class="ka-btn ka-btn-rose" id="kcp-save">Save Profile</button>
      <button class="ka-btn ka-btn-ghost" id="kcp-cancel">Cancel</button>
    </div>`;
  document.body.appendChild(ov);
  const close = () => ov.remove();
  document.getElementById('kcp-x').onclick = close;
  document.getElementById('kcp-cancel').onclick = close;
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  document.getElementById('kcp-save').onclick = () => {
    LS.set('ka_couple', {
      p1:  document.getElementById('kcp-p1').value.trim(),
      p2:  document.getElementById('kcp-p2').value.trim(),
      ann: document.getElementById('kcp-ann').value
    });
    close(); renderCoupleBanner(); toast('Profile saved.');
  };
}

function renderCoupleBanner() {
  const b = document.getElementById('ka-couple-banner');
  if (!b) return;
  const p = LS.get('ka_couple', {});
  if (!p.p1 && !p.p2) { b.classList.remove('on'); return; }
  const names = [p.p1, p.p2].filter(Boolean).join(' and ');
  let days = '';
  if (p.ann) {
    const d = Math.floor((Date.now() - new Date(p.ann)) / 86400000);
    if (d >= 0) days = `<div class="ka-couple-days">Together for ${d.toLocaleString()} days</div>`;
  }
  b.innerHTML = `<div class="ka-couple-names">${names}</div>${days}`;
  b.classList.add('on');
}

/* ─── Festival banner ────────────────────────────────── */
function renderFestBanner() {
  const b = document.getElementById('ka-fest-banner');
  if (!b) return;
  const f = getActiveFestival();
  if (!f) { b.classList.remove('on'); return; }
  b.style.background = `linear-gradient(135deg,${f.color}22,${f.color}0d)`;
  b.style.border = `1px solid ${f.color}44`;
  b.style.color = f.color;
  b.textContent = `${f.emoji}  ${f.label}  ${f.emoji}`;
  b.classList.add('on');
}

/* ─── Mood picker ────────────────────────────────────── */
/* This script is loaded from both the site root (index.html) and from
   pages inside /games/, so a plain relative path like "games/x.html"
   would resolve incorrectly (to games/games/x.html) when navigating
   from within a game page. Resolve every game path against the real
   site root instead — computed from this script's own URL, since it
   always lives in /js/ one folder below the root. */
const SITE_ROOT = (() => {
  const src = document.currentScript && document.currentScript.src;
  return src ? new URL('../', src).href : './';
})();
const GAME = (name) => SITE_ROOT + 'games/' + name;

const MOOD_GAMES = [
  [GAME('intimacy_dice_game_single_page.html'), GAME('intimacy_cards_game_single_page.html')],
  [GAME('intimacy_dice_game_single_page.html'), GAME('intimacy_ludo_dice_game_single_page.html'), GAME('kamaagni-connect-foreplay.html')],
  [GAME('intimacy_Position_Selector_page.html'), GAME('intimacy_Oral_Position_Selector_page.html'), GAME('intimacy_ludo_dice_game_single_page.html')],
  [GAME('intimacy_cards_game_single_page.html'), GAME('intimacy_dice_game_single_page.html'), GAME('kamaagni-poker-quick.html')],
];
const MOODS = ['Romantic 🌹','Playful 😜','Adventurous 🔥','Tired but Trying 😴'];

function openMoodPicker() {
  const ov = document.createElement('div');
  ov.className = 'ka-overlay';
  ov.innerHTML = `
    <div class="ka-modal">
      <button class="ka-x" id="kmd-x">×</button>
      <h2>What is the vibe tonight?</h2>
      <p class="ka-sub">We will pick the perfect game for you.</p>
      <div class="ka-mood-grid">${MOODS.map((m, i) => `<button class="ka-mood-btn" data-i="${i}">${m}</button>`).join('')}</div>
    </div>`;
  document.body.appendChild(ov);
  document.getElementById('kmd-x').onclick = () => ov.remove();
  ov.querySelectorAll('.ka-mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const games = MOOD_GAMES[+btn.dataset.i];
      ov.remove();
      window.location.href = games[Math.floor(Math.random() * games.length)];
    });
  });
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
}

/* ─── Favourites hub ─────────────────────────────────── */
function openFavHub() {
  const dice  = LS.get('dice_favorites', []).map(v => ({ tag: 'Dice',     text: v }));
  const cards = LS.get('ka_fav_cards',   []).map(v => ({ tag: 'Card',     text: v }));
  const pos   = LS.get('ka_fav_pos',     []).map(v => ({ tag: 'Position', text: v }));
  const all   = [...dice, ...cards, ...pos];

  const ov = document.createElement('div');
  ov.className = 'ka-overlay';
  ov.innerHTML = `
    <div class="ka-modal" style="max-width:400px;text-align:left">
      <button class="ka-x" id="kfh-x">×</button>
      <h2 style="text-align:center">Saved Moments</h2>
      <div class="ka-fav-list">
        ${all.length
          ? all.map(f => `<div class="ka-fav-item"><span class="ka-fav-tag">${f.tag}</span><span>${f.text}</span></div>`).join('')
          : `<div class="ka-fav-empty">Nothing saved yet. Play a game and tap the heart to save your favourite moments.</div>`}
      </div>
    </div>`;
  document.body.appendChild(ov);
  document.getElementById('kfh-x').onclick = () => ov.remove();
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
}

/* ─── Surprise Me ────────────────────────────────────── */
const ALL_GAMES = [
  GAME('intimacy_dice_game_single_page.html'),
  GAME('intimacy_cards_game_single_page.html'),
  GAME('intimacy_ludo_dice_game_single_page.html'),
  GAME('intimacy_Position_Selector_page.html'),
  GAME('intimacy_Oral_Position_Selector_page.html'),
  GAME('kamaagni-connect-foreplay.html'),
  GAME('kamaagni-poker-quick.html'),
];
function surpriseMe() {
  window.location.href = ALL_GAMES[Math.floor(Math.random() * ALL_GAMES.length)];
}

function injectSurpriseBtn() {
  const games = document.querySelector('.games');
  if (!games || document.getElementById('ka-surprise-wrap')) return;
  const wrap = document.createElement('div');
  wrap.id = 'ka-surprise-wrap';
  wrap.innerHTML = `<button id="ka-surprise-btn">🎲 Surprise Us Tonight</button>`;
  games.parentNode.insertBefore(wrap, games);
  document.getElementById('ka-surprise-btn').addEventListener('click', surpriseMe);
}

/* ─── Ambient music ──────────────────────────────────── */
let actx = null, musicNodes = {}, trackIdx = -1, vol = 0.3;

const TRACKS = [
  { label: 'Romantic Strings 🎻', play: playRomantic },
  { label: 'Monsoon Rain 🌧️',    play: playMonsoon  },
  { label: 'Garba Slow 🪔',      play: playGarba    },
  { label: 'Lo-fi Chill ☁️',     play: playLofi     },
  { label: 'Silence 🌙',         play: () => {}     },
];

function initAudio() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended') actx.resume();
}
function mkGain(v) { const g = actx.createGain(); g.gain.value = v; return g; }
function mkOsc(t, f) { const o = actx.createOscillator(); o.type = t; o.frequency.value = f; return o; }

function stopMusic() {
  if (musicNodes._iv) { clearInterval(musicNodes._iv); musicNodes._iv = null; }
  try {
    if (musicNodes.master) musicNodes.master.gain.setTargetAtTime(0, actx.currentTime, 0.3);
    setTimeout(() => {
      ['master','osc','src'].forEach(k => { try { if (musicNodes[k]) musicNodes[k].disconnect(); } catch {} });
      musicNodes = {};
    }, 500);
  } catch {}
}

function playRomantic() {
  const notes = [130.81, 164.81, 196, 261.63];
  musicNodes.master = mkGain(0);
  musicNodes.master.connect(actx.destination);
  musicNodes.master.gain.setTargetAtTime(vol * 0.38, actx.currentTime, 0.9);
  let i = 0;
  (function next() {
    if (trackIdx !== 0) return;
    const o = mkOsc('sine', notes[i++ % notes.length]);
    const g = mkGain(0.28); o.connect(g); g.connect(musicNodes.master); o.start();
    g.gain.setTargetAtTime(0, actx.currentTime + 1.4, 0.5);
    setTimeout(() => { try { o.stop(); o.disconnect(); g.disconnect(); } catch {} }, 2600);
    setTimeout(next, 2300);
  })();
}

function playMonsoon() {
  const sz = actx.sampleRate * 2;
  const buf = actx.createBuffer(1, sz, actx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < sz; i++) d[i] = Math.random() * 2 - 1;
  const src = actx.createBufferSource(); src.buffer = buf; src.loop = true;
  const flt = actx.createBiquadFilter(); flt.type = 'bandpass'; flt.frequency.value = 800; flt.Q.value = 0.5;
  musicNodes.master = mkGain(0);
  src.connect(flt); flt.connect(musicNodes.master); musicNodes.master.connect(actx.destination);
  musicNodes.master.gain.setTargetAtTime(vol * 0.48, actx.currentTime, 1.1);
  src.start(); musicNodes.src = src;
}

function playGarba() {
  const base = 146.83;
  musicNodes.master = mkGain(0);
  musicNodes.master.connect(actx.destination);
  musicNodes.master.gain.setTargetAtTime(vol * 0.33, actx.currentTime, 0.5);
  const pat = [1,0,1,0,1,0]; let s = 0;
  musicNodes._iv = setInterval(() => {
    if (trackIdx !== 2) { clearInterval(musicNodes._iv); return; }
    if (pat[s % pat.length]) {
      const o = mkOsc('triangle', s % 6 === 0 ? base : base * 1.5);
      const g = mkGain(0.22); o.connect(g); g.connect(musicNodes.master); o.start();
      g.gain.setTargetAtTime(0, actx.currentTime + 0.09, 0.06);
      setTimeout(() => { try { o.stop(); o.disconnect(); g.disconnect(); } catch {} }, 220);
    }
    s++;
  }, 220);
}

function playLofi() {
  const freqs = [130.81, 164.81, 196, 246.94];
  musicNodes.master = mkGain(0);
  musicNodes.master.connect(actx.destination);
  musicNodes.master.gain.setTargetAtTime(vol * 0.22, actx.currentTime, 1.3);
  freqs.forEach((f, i) => {
    const o = mkOsc('sine', f); const g = mkGain(0.14 - i * 0.02);
    o.detune.value = (Math.random() - 0.5) * 9;
    o.connect(g); g.connect(musicNodes.master); o.start();
  });
}

function playTrack(idx) {
  initAudio(); stopMusic();
  trackIdx = idx;
  if (idx >= 0 && idx < TRACKS.length - 1) setTimeout(() => TRACKS[idx].play(), 430);
}

function openMusicPlayer() {
  const ov = document.createElement('div');
  ov.className = 'ka-overlay';
  ov.innerHTML = `
    <div class="ka-modal" style="max-width:310px">
      <button class="ka-x" id="kmu-x">×</button>
      <h2>Mood Music</h2>
      <div class="ka-track-list">
        ${TRACKS.map((tr, i) => `
          <div class="ka-track${trackIdx === i ? ' on' : ''}" data-i="${i}">
            <span class="ka-track-name">${tr.label}</span>
            <span class="ka-beat"></span>
          </div>`).join('')}
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:13px;color:#7a8aab">🔈</span>
        <input type="range" class="ka-vol" min="0" max="1" step="0.05" value="${vol}" id="kmu-vol">
        <span style="font-size:13px;color:#7a8aab">🔊</span>
      </div>
      <div class="ka-divider"></div>
      <button class="ka-btn ka-btn-ghost" id="kmu-stop">Stop Music</button>
    </div>`;
  document.body.appendChild(ov);
  document.getElementById('kmu-x').onclick = () => ov.remove();
  document.getElementById('kmu-stop').onclick = () => {
    trackIdx = -1; stopMusic();
    document.getElementById('ka-music-fab')?.classList.remove('music-on');
    ov.remove();
  };
  document.getElementById('kmu-vol').addEventListener('input', function () {
    vol = parseFloat(this.value);
    if (musicNodes.master) musicNodes.master.gain.setTargetAtTime(vol * 0.38, actx.currentTime, 0.1);
  });
  ov.querySelectorAll('.ka-track').forEach(el => {
    el.addEventListener('click', () => {
      const idx = +el.dataset.i;
      playTrack(idx);
      ov.querySelectorAll('.ka-track').forEach(t => t.classList.remove('on'));
      el.classList.add('on');
      document.getElementById('ka-music-fab')?.classList.toggle('music-on', idx < TRACKS.length - 1);
    });
  });
  ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
}

/* ─── Settings panel ─────────────────────────────────── */
function buildSettings() {
  const panel = document.createElement('div');
  panel.id = 'ka-settings';
  panel.innerHTML = `
    <div class="ka-settings-hd">Settings</div>
    <button class="ka-btn ka-btn-ghost" id="ks-couple">💑 Our Profile</button>
    <button class="ka-btn ka-btn-ghost" id="ks-mood">🎭 Pick a Mood</button>
    <button class="ka-btn ka-btn-ghost" id="ks-favs">❤️ Saved Moments</button>
    <div class="ka-divider"></div>
    <button class="ka-btn ka-btn-ghost" id="ks-pin-set">🔐 Change PIN</button>
    <button class="ka-btn ka-btn-danger" id="ks-pin-clr">Remove PIN</button>`;
  document.body.appendChild(panel);

  const close = () => panel.classList.remove('open');
  document.getElementById('ks-couple').onclick = () => { close(); openCoupleProfile(); };
  document.getElementById('ks-mood').onclick   = () => { close(); openMoodPicker(); };
  document.getElementById('ks-favs').onclick   = () => { close(); openFavHub(); };
  document.getElementById('ks-pin-set').onclick = () => {
    close();
    LS.del('ka_pin');
    pinKeypad('set').then(p1 => {
      if (!p1) return;
      pinKeypad('confirm').then(p2 => {
        if (p1 === p2) { LS.set('ka_pin', p1); markSessionUnlocked(); toast('PIN saved.'); }
        else toast('PINs did not match. Please try again.');
      });
    });
  };
  document.getElementById('ks-pin-clr').onclick = () => { LS.del('ka_pin'); close(); toast('PIN removed.'); };
}

/* ─── Floating toolbar ───────────────────────────────── */
function buildToolbar() {
  const tb = document.createElement('div');
  tb.id = 'ka-toolbar';
  tb.innerHTML = `
    <button class="ka-fab" id="ka-settings-fab" title="Settings">⚙️</button>
    <button class="ka-fab" id="ka-music-fab"    title="Mood Music">🎵</button>
    <button class="ka-fab" id="ka-mood-fab"     title="Pick a Mood">🎭</button>
    <button class="ka-fab" id="ka-favs-fab"     title="Saved Moments">❤️</button>
    <button class="ka-fab" id="ka-lock-fab"     title="Quick Lock">🔒</button>`;
  document.body.appendChild(tb);

  document.getElementById('ka-settings-fab').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('ka-settings').classList.toggle('open');
  });
  document.getElementById('ka-music-fab').addEventListener('click', openMusicPlayer);
  document.getElementById('ka-mood-fab').addEventListener('click', openMoodPicker);
  document.getElementById('ka-favs-fab').addEventListener('click', openFavHub);
  document.getElementById('ka-lock-fab').addEventListener('click', quickLock);

  document.addEventListener('click', e => {
    const s = document.getElementById('ka-settings');
    const f = document.getElementById('ka-settings-fab');
    if (s && s.classList.contains('open') && !s.contains(e.target) && e.target !== f) {
      s.classList.remove('open');
    }
  });
}

/* ─── Banners ────────────────────────────────────────── */
function injectBanners() {
  const wrap = ['.page','.app','.game-container','body'].map(s => document.querySelector(s)).find(Boolean);
  if (!wrap) return;

  const fest   = document.createElement('div'); fest.id   = 'ka-fest-banner';
  const couple = document.createElement('div'); couple.id = 'ka-couple-banner';

  const anchor = wrap.querySelector('header,.hero,.stats-panel,.topbar,h1');
  if (anchor && anchor.parentNode === wrap) {
    wrap.insertBefore(couple, anchor);
    wrap.insertBefore(fest, couple);
  } else {
    wrap.prepend(couple);
    wrap.prepend(fest);
  }

  renderFestBanner();
  renderCoupleBanner();
}

/* ─── Init ───────────────────────────────────────────── */
async function init() {
  injectCSS();
  await checkPinOnLoad();
  buildSettings();
  buildToolbar();
  injectBanners();
  injectSurpriseBtn();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();

/* ─── Public API ─────────────────────────────────────── */
window.KA = {
  saveFav(type, text) {
    const k = { cards: 'ka_fav_cards', pos: 'ka_fav_pos', dice: 'dice_favorites' }[type] || 'dice_favorites';
    const list = LS.get(k, []);
    if (!list.includes(text)) { list.unshift(text); if (list.length > 40) list.pop(); LS.set(k, list); }
  },
  toast,
  openFavHub,
  openMoodPicker,
  surpriseMe,
};

})();
