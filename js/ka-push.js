/* KamaAgni partner alerts, phone side (v78). Shows a "🔔 Partner alerts" switch in Settings, and a one-time prompt
   on Together once you're linked. Needs VAPID_PUBLIC_KEY in js/ka-config.js and the server parts in SETUP-PUSH.md;
   until then nothing appears. Loaded on every page by ka-chrome.js. */
(function () {
  'use strict';
  if (window.KA_PUSH) return;
  var D = document, CFG = window.KA_CONFIG || {};
  function key() { return (window.KA_CONFIG || {}).VAPID_PUBLIC_KEY || ''; }
  function supported() { return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window; }
  function ios() { return /iphone|ipad|ipod/i.test(navigator.userAgent); }
  function standalone() { return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone; }
  function cloudOn() { var c = window.KA_CLOUD, s = c && c.state(); return !!(s && s.enabled && s.user); }
  function available() { return !!key() && cloudOn(); }
  function b64(s) { var p = '='.repeat((4 - s.length % 4) % 4), r = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')), o = new Uint8Array(r.length); for (var i = 0; i < r.length; i++) o[i] = r.charCodeAt(i); return o; }
  function reg() { return navigator.serviceWorker.ready; }
  function current() { return supported() ? reg().then(function (r) { return r.pushManager.getSubscription(); }) : Promise.resolve(null); }
  function enable() {
    if (!supported()) return Promise.reject(new Error(ios() && !standalone() ? 'On iPhone, add KamaAgni to your Home Screen first (Share → Add to Home Screen), open it from there, then turn alerts on.' : 'This browser can’t show notifications.'));
    return Notification.requestPermission().then(function (p) {
      if (p !== 'granted') throw new Error('Notifications are blocked. Allow them for this site in your browser settings, then try again.');
      return reg();
    }).then(function (r) { return r.pushManager.getSubscription().then(function (s) { return s || r.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(key()) }); }); })
      .then(function (s) { return window.KA_CLOUD.push.save(s.toJSON(), extra()).then(function () { try { localStorage.setItem('ka_push_asked', '1'); } catch (e) {} return true; }); });
  }
  /* weekly date night travels with the subscription so the server can send the morning reminder */
  function extra() { var d = null; try { d = JSON.parse(localStorage.getItem('ka_datenight')); } catch (e) {} var tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    return d && d.on ? { dn_dow: d.dow, dn_time: d.t || '19:30', tz: tz } : { dn_dow: null, dn_time: null, tz: tz }; }
  function resave() { if (!available()) return; current().then(function (s) { if (s && Notification.permission === 'granted') window.KA_CLOUD.push.save(s.toJSON(), extra()).catch(function () {}); }); }
  var rs = 0, oset = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) { var r = oset.apply(this, arguments); if (k === 'ka_datenight' && this === localStorage) { clearTimeout(rs); rs = setTimeout(resave, 2000); } return r; };
  function disable() { return current().then(function (s) { if (!s) return true; var ep = s.endpoint; return s.unsubscribe().then(function () { return window.KA_CLOUD.push.del(ep); }); }); }
  function toast(m) { try { window.KA && KA.toast && KA.toast(m); } catch (e) {} }
  /* Settings card */
  function card(host, before) {
    if (D.getElementById('ka-push-set')) return;
    var box = D.createElement('div'); box.id = 'ka-push-set'; box.className = 'kx-card';
    function draw() { current().then(function (s) {
      var on = !!s && Notification.permission === 'granted';
      box.innerHTML = '<h2 style="font-size:1.1rem;margin:0 0 6px">🔔 Partner alerts</h2><p class="kx-muted" style="margin:0 0 10px;font-size:14px">Get a notification when your partner sends an invitation, a plan, a nudge or a message, even when KamaAgni is closed. Alerts never show what was sent, only that something arrived.' + (ios() && !standalone() ? ' On iPhone this works once KamaAgni is added to your Home Screen.' : '') + '</p>' +
        '<button class="kx-btn ' + (on ? 'ghost' : '') + '" id="ka-push-b" aria-pressed="' + on + '">' + (on ? '🔕 Turn off on this phone' : '🔔 Turn on for this phone') + '</button>';
      box.querySelector('#ka-push-b').onclick = function () { var b = this; b.disabled = true; (on ? disable() : enable()).then(function () { toast(on ? 'Partner alerts off on this phone' : '🔔 Partner alerts on'); draw(); }, function (e) { b.disabled = false; toast(e.message); }); };
    }); }
    draw(); if (before && before.parentNode) before.parentNode.insertBefore(box, before); else host.appendChild(box);
  }
  function settings() {
    if (!/kamaagni-settings\.html/.test(location.pathname) || !available()) return;
    var app = D.getElementById('app'); if (!app || !app.children.length) return;
    card(app, D.getElementById('ka-fb-set') || null);
  }
  /* Together: once linked, ask once */
  function together() {
    if (!/kamaagni-together\.html/.test(location.pathname) || !available() || D.getElementById('ka-push-ask')) return;
    var s = window.KA_CLOUD.state(); if (!s.couple || !s.couple.partnerJoined) return;
    try { if (localStorage.getItem('ka_push_asked')) return; } catch (e) {}
    current().then(function (sub) {
      if (sub || D.getElementById('ka-push-ask')) return;
      var app = D.getElementById('app'), ref = app && app.querySelector('.kx-card'); if (!ref) return;
      var b = D.createElement('div'); b.id = 'ka-push-ask'; b.className = 'kx-card'; b.style.borderColor = 'rgba(240,190,60,.55)';
      b.innerHTML = '<b>🔔 Know when they send you something?</b><p class="kx-muted" style="margin:4px 0 8px">A phone notification for invitations, plans, nudges and messages, even with KamaAgni closed.</p><div class="kx-row"><button class="kx-btn gold sm" id="pa-y">Turn on</button><button class="kx-btn ghost sm" id="pa-n">Not now</button></div>';
      ref.parentNode.insertBefore(b, ref.nextSibling);
      b.querySelector('#pa-y').onclick = function () { enable().then(function () { toast('🔔 Partner alerts on'); b.remove(); }, function (e) { toast(e.message); }); };
      b.querySelector('#pa-n').onclick = function () { try { localStorage.setItem('ka_push_asked', '1'); } catch (e) {} b.remove(); };
    });
  }
  var n = 0; (function wait() { settings(); together(); if (++n < 30) setTimeout(wait, 500); })();
  window.addEventListener('ka:cloud', function () { setTimeout(function () { settings(); together(); }, 300); });
  window.KA_PUSH = { available: available, enable: enable, disable: disable, current: current };
})();
