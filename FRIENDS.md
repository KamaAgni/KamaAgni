# Sharing KamaAgni with friends (no hosting needed)

Everyone gets their own copy of this folder (pen drive, or a private GitHub repo they are invited to). There is **no public website**. Each person runs it on their own device, and a single Supabase project (yours) stores their progress, separately and encrypted, so it follows them between their own devices.

## For your friends (open the site)
**Laptop or desktop (best):**
1. Copy the whole folder to the computer (do not open the files from inside a zip).
2. Double-click **index.html**. Use **Chrome or Edge** (Safari also works; Firefox keeps settings per page, so avoid it).
3. Click the 👤 button, choose **Create account**, and enter an email, a password and the **invite code** you gave them. Then choose a vault passphrase (write it down: it cannot be reset).
4. Bookmark the page. Their progress syncs to their account.

**Android phone/tablet:** copy the folder, open it in the Files app, long-press `index.html` and open it with Chrome. This usually works; if the browser refuses, use a laptop.

**iPhone/iPad:** iOS does not run a local copy of a site from the Files app. Options: use a laptop, or you host a copy privately (the encrypted vault from v36 is built for exactly this).

Their data lives in the browser. If they clear browser data, they sign in again and it syncs back from Supabase.

## For you (one-time Supabase setup, about 10 minutes)
1. Supabase > **SQL Editor**: run `supabase/schema.sql`, then `supabase/invites.sql`.
2. **Authentication > Providers > Email**: turn **Confirm email OFF**.
3. In `js/ka-config.js` set `REQUIRE_INVITE: true` (your URL and key are already set; keep `MOCK_URL: ''`).
4. Create one code per friend, in the SQL Editor: `select public.new_invite('Sam');` It returns something like `E89A-59CA-DDF4`. Each code works once. Send it to that person privately.
5. Make your own account (it must also use a code), then give the folder to your friends.

**See who joined:** `select i.label, i.code, u.email, i.used_at from public.invites i left join auth.users u on u.id = i.used_by order by i.created_at desc;`

**Remove someone:** Supabase > Authentication > Users > delete the user. Their stored data is deleted with them, and they cannot sign in again. (Their local copy of the app still opens, because it is just files, but it can no longer sync.)

**Update everyone:** send the new folder. Their saved progress stays, since it is stored separately from the files.

## Please remember
- Free Supabase projects pause after about a week without use. Open the dashboard and click Restore if that happens, or open your own app weekly.
- Personal data is encrypted in the browser before upload, so you cannot read your friends' data, and they cannot read each other's.
- Keep the folder among adults who agreed to receive it. Do not post it publicly.
