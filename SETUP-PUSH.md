# Partner alerts (phone notifications)

When your partner sends an invitation, a plan, a nudge or a message, the other phone buzzes even if KamaAgni is closed.
Everything you share stays end-to-end encrypted: the alert only says *what kind* of thing arrived ("You have an invitation"), never what it says.

Until you do the steps below, the "Partner alerts" switch simply doesn't appear. Everything else works as before.

## One-time setup (about 15 minutes)

1. **Make a key pair** (on any computer with Node.js):
   `npx web-push generate-vapid-keys`
   Keep both lines. The *public* key goes in the app, the *private* key stays secret.

2. **Put the public key in the app.** In `js/ka-config.js` set
   `VAPID_PUBLIC_KEY: 'B...your public key...'`

3. **Create the table.** Supabase → SQL editor → paste and run `supabase/push.sql`.

4. **Deploy the function** (Supabase CLI, from this folder):
   ```
   supabase functions deploy notify-partner --no-verify-jwt
   supabase secrets set VAPID_PUBLIC_KEY=B... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:you@example.com WEBHOOK_SECRET=pick-a-long-random-string
   ```

5. **Call it when something is sent.** Supabase → Database → Webhooks → Create:
   - Table `couple_events`, event **Insert**
   - Type **Supabase Edge Function** → `notify-partner`
   - HTTP header `x-webhook-secret` = the same WEBHOOK_SECRET

6. **Turn it on, on each phone:** Settings → 🔔 Partner alerts → Turn on (or the prompt on the Together page).

## Weekly date-night reminder (optional)
If you set a weekly date night (Our Dates → 🌹 Weekly date night), both phones can get a reminder at 9 am that day.
1. Run `supabase/push.sql` again (it adds four columns; safe to re-run).
2. Deploy: `supabase functions deploy date-night --no-verify-jwt`
3. Run it every hour. Supabase → SQL editor (needs the `pg_cron` and `pg_net` extensions, both under Database → Extensions):
   ```sql
   select cron.schedule('ka-date-night', '0 * * * *', $$
     select net.http_post(
       url := 'https://YOUR-PROJECT.supabase.co/functions/v1/date-night',
       headers := jsonb_build_object('x-webhook-secret', 'your WEBHOOK_SECRET', 'content-type', 'application/json'),
       body := '{}'::jsonb);
   $$);
   ```
Only the weekday, the time and your time zone are stored for this, nothing else.

## Phones
- **Android (Chrome, Edge, Samsung Internet):** works in the browser and as an installed app.
- **iPhone / iPad:** needs iOS 16.4 or later and KamaAgni **added to the Home Screen** (Share → Add to Home Screen). Open it from the Home Screen icon, then turn alerts on.
- Desktop Chrome, Edge and Firefox work too.

## What alerts and what doesn't
Alerts: invitations, plans, replies, a skipped plan step, secret-wish updates, nudges, messages, check-ins and pause signals.
Silent: live game moves, shared-settings sync and housekeeping. The same kind of alert is sent at most once a minute (pause signals always go through).
