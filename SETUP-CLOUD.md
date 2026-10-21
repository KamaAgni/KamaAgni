# Turn on login, multi-device sync and partner linking (free)

Without this, KamaAgni works fully but data stays in each browser. Setup takes ~10 minutes.

1. Create a free account at https://supabase.com → **New project** (any name, strong DB password, region near you). Free plan: 500 MB DB, 50,000 monthly users.
2. **SQL Editor → New query**: paste all of `supabase/schema.sql` → **Run**.
3. **Project Settings → API**: copy the *Project URL* and the *anon public* key.
4. Edit `js/ka-config.js`: set `SUPABASE_URL` and `SUPABASE_ANON_KEY` (the anon key is meant to be public; security comes from the row-level-security rules in the SQL).
5. **Authentication → Providers → Email**: for friends-only use you can turn **Confirm email OFF** so sign-up is instant (or keep it on and users confirm by email).
6. **Authentication → URL Configuration**: set *Site URL* to your GitHub Pages address (used for password-reset emails).
7. Upload the site to GitHub Pages as usual. A new 👤 button appears in the header on every page.

## How it behaves
- Data is encrypted in the browser with a **vault passphrase** (separate from the password). The server cannot read it, and **a forgotten passphrase cannot be recovered**.
- Partner linking: Together page → *Create invite* → send the link to your partner (the link carries the shared key after `#`, which is never sent to the server). Messages, check-ins and live sessions are end-to-end encrypted.
- Free projects **pause after ~1 week of no activity**; open the Supabase dashboard and click *Restore* (data is kept), or ping the project weekly.
- Sync is last-write-wins per item: editing the same item on two devices offline keeps the newest edit.

## Test locally without Supabase
```
node dev/mock-server.js           # in-memory fake backend on :8787
# set MOCK_URL: 'http://localhost:8787' in js/ka-config.js, then: python3 -m http.server
```
Never ship with MOCK_URL set.
