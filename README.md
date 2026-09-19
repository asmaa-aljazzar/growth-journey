# My Growth Journey

A private, cloud-synchronized 30-day journal focused on Orange Academy, English, Academy review, sustainable wellbeing, and optional RT maintenance.

## Live website

**https://asmaa-aljazzar.github.io/growth-journey/**

The website is publicly reachable, but journal entries are not public. Each signed-in user can access only their own database row through Supabase Row Level Security.

## First login

There is no default username or password.

1. Open the live website.
2. Select **Create account**.
3. Enter your email address and choose a strong password.
4. If Supabase sends a confirmation email, open it and confirm the address.
5. Return to the live website and select **Sign in**.

For a personal-only deployment, create the owner's account first and then disable new-user registration in Supabase under **Authentication → Sign In / Providers → Email**.

## Included

- Email/password registration, login, password reset, and logout through Supabase Auth
- One private `user_journals` database row per account, protected with Row Level Security
- Browser caching for resilience and Supabase cloud synchronization across devices
- A rolling 30-day cycle beginning on the user's first day
- Realistic Academy-aware monthly targets
- Academy Daily, Group, and Masterpiece task tracking
- Date-specific, drag-to-reorder daily to-do lists with carry-to-tomorrow, undo, copy-back, and move-back controls
- Movable Overview cards with remembered order
- Month snapshots and “Archive & start next cycle”
- Full JSON backup/restore plus a separate JSON download for each archived month
- Cozy brown light and dark themes

## Files

- `index.html` — interface
- `styles.css` — cozy responsive theme
- `script.js` — journal, goals, tasks, archive, and local cache
- `auth.js` — Supabase authentication and cloud synchronization
- `config.js` — public Supabase URL and publishable key
- `database.sql` — database table, grants, RLS policy, and timestamp trigger

## Security

The publishable key in `config.js` is intentionally public. Security is enforced by the RLS policy in `database.sql`. Never put the database password, a secret key, or the `service_role` key in this repository.

## Deployment

The website is deployed from the `main` branch and root folder with GitHub Pages.

Supabase **Authentication → URL Configuration** must contain the following value as both the Site URL and an allowed redirect URL:

```text
https://asmaa-aljazzar.github.io/growth-journey/
```

After changing authentication settings, test account creation, email confirmation, sign-in, sign-out, and password reset from the live website.
