# My Growth Journey

A private, cloud-synchronized 30-day journal focused on Orange Academy, English, Academy review, sustainable wellbeing, and optional RT maintenance.

## Included

- Email/password registration, login, password reset, and logout through Supabase Auth
- One private `user_journals` database row per account, protected with Row Level Security
- Browser caching for resilience and Supabase cloud synchronization across devices
- A rolling 30-day cycle beginning on the user's first day
- Realistic Academy-aware monthly targets
- Academy Daily, Group, and Masterpiece task tracking
- Date-specific daily to-do lists and “carry unfinished to tomorrow”
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

This is a static website and can be published with GitHub Pages. After deployment, add the exact live URL in Supabase under **Authentication → URL Configuration** as both the Site URL and an allowed redirect URL.
