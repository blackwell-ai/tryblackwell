# Blackwell — Database (Supabase)

The source-of-truth database for the marketplace. The app (marketing site,
reviewer portal, brand + admin consoles, AI matching) reads from and writes to
it through the typed Supabase clients in `app/lib/supabase/`.

## Layout

```
supabase/
  config.toml          # local stack config (supabase init)
  migrations/          # ordered SQL, applied in filename order
    20260618000001_extensions_and_helpers.sql   # shared foundation (below)
    20260622000001_marketplace_reviewers_brands.sql   # schema + tables + RLS
    20260622000002_marketplace_import_fns.sql         # service-role importer RPCs
    20260622000003_auth_bind_reviewers.sql
    20260622000004_marketplace_matches_and_admin.sql
    20260622000005_marketplace_portal_rpcs.sql
    20260622000006_demo_preview_seed.sql
    20260622000007_drop_reviewer_platform_followers.sql
    20260622000008_reviewer_oauth_age_gate.sql
    20260622000009_tags_taxonomy.sql
    20260622000010_ai_synthesis_input.sql
scripts/migrate-giftly.ts   # streams reviewers/brands from Giftly via importer RPCs
```

## Shared foundation

`20260618000001_extensions_and_helpers.sql` runs first so every later migration
can rely on it:

- **`citext`** — case-insensitive text, used for email columns.
- **`pgcrypto`** — provides `gen_random_uuid()` for UUID primary keys.
- **`public.set_updated_at()`** — trigger function that stamps `updated_at = now()`
  on every UPDATE; attached to every table with an `updated_at` column.

## Local workflow

```bash
supabase start          # boot local stack + apply migrations
supabase db reset       # rebuild from scratch (migrations)
pnpm gen:types          # regenerate app/lib/database.types.ts (needs --linked)
pnpm migrate:giftly     # sync reviewers/brands from Giftly (see below)
```

## Conventions

- **PKs:** `uuid` default `gen_random_uuid()`.
- **Timestamps:** `created_at` / `updated_at` on every table; `updated_at`
  maintained by the `set_updated_at()` trigger.
- **Email:** `citext` columns.

## Marketplace (reviewers + brands)

The `marketplace` schema is the two-sided directory for the GEO marketplace,
migrated from Giftly. It is **service-role only** and **not exposed to the Data
API** (no `anon`/`authenticated` schema USAGE or grants), so reviewer/brand PII
is never reachable by the public roles.

| Table | From Giftly | Notes |
|---|---|---|
| `marketplace.reviewers` | `creators` (renamed) | people who review gifted product; ids + join dates preserved |
| `marketplace.brands` | `brands` | companies in the pipeline; `stage` + `source` preserved |

Migrations: `..._marketplace_reviewers_brands.sql` (schema + tables + RLS) and
`..._marketplace_import_fns.sql` (service-role-only `SECURITY DEFINER` importer
RPCs in `public` — the sync script writes through these because `marketplace`
is unexposed).

Giftly's auth bindings (`auth_user_id`, `owner_id`, `invited_at`) are **not**
migrated — those ids belong to Giftly's `auth.users`. The columns exist
(nullable, → Blackwell `auth.users`) so reviewers can be re-bound when the
reviewer portal ships. `giftly_synced_at` records the last sync.

### Syncing from Giftly

`scripts/migrate-giftly.ts` streams `creators`/`brands` straight from Giftly into
the marketplace tables. Idempotent (upsert on `id`) — safe to re-run as Giftly
keeps taking applications.

```bash
pnpm migrate:giftly
```

Requires in `.env.local`: `GIFTLY_SUPABASE_URL` + `GIFTLY_SECRET_KEY` (Giftly's
`sb_secret_...` key) alongside Blackwell's `SUPABASE_URL` +
`SUPABASE_SERVICE_ROLE_KEY`. App code reads marketplace tables with the
service-role client via `.schema('marketplace')`; `gen:types` emits both schemas.
