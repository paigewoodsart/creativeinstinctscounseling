# Connecting the admin backend to Supabase

One-time setup, once you've created a Supabase project at supabase.com.

## 1. Run the schema

Supabase dashboard → **SQL Editor** → paste the full contents of `schema.sql` → **Run**.

This creates the `site_content` table (with public read / admin-only write
policies), seeds it with today's live site content, and creates the
`bio-photos` storage bucket for photo uploads.

## 2. Create the admin login

Dashboard → **Authentication** → **Users** → **Add user** → enter Clare's
email and a password. There's no public sign-up page on purpose — this is
the only way an account gets created.

(Optional) Dashboard → **Authentication** → **Providers** → **Email**:
if you want password-reset emails to work, make sure "Enable email
confirmations" / SMTP settings are configured to your liking — Supabase's
default email sending works out of the box for small volumes.

## 3. Fill in the config

Dashboard → **Settings** → **API**. Copy:
- **Project URL**
- **anon public** key (not the `service_role` key — never put that one in
  a browser-facing file)

Paste both into `js/supabase-config.js`:

```js
window.SUPABASE_URL = 'https://xxxxxxxx.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJ...';
```

## 4. Test it

- Open `index.html` locally — it should look identical to before (it's
  now reading the seeded row instead of the hardcoded HTML, but they match).
- Open `admin/index.html`, log in with the account from step 2, confirm
  the form is pre-filled with the current bio/pricing/contact info, make a
  small change, save, and reload `index.html` to confirm it shows up.

## Notes

- The anon key is meant to be public — it's safe to commit. Supabase's Row
  Level Security (set up by `schema.sql`) is what actually restricts writes
  to logged-in users, not this key.
- If `index.html` ever can't reach Supabase (offline, misconfigured, project
  paused), it silently falls back to the content already in the HTML —
  the site never breaks because of this integration.
