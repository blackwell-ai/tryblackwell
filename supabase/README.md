# Blackwell — System of Record (Supabase)

This is **Layer 0**: the source-of-truth database. Everything else (storefront,
pricing, the Stripe webhook, the future reorder agent) reads from and writes to it.

## Layout

```
supabase/
  config.toml          # local stack config (supabase init)
  migrations/          # ordered SQL, applied in filename order
    ...01_extensions_and_helpers.sql
    ...02_enums.sql
    ...03_products.sql
    ...04_variants.sql        (variants + variant_costs)
    ...05_inventory.sql       (inventory + stock_movements + trigger)
    ...06_suppliers.sql
    ...07_customers.sql       (customers + addresses)
    ...08_orders.sql          (orders + order_items)
    ...09_finance.sql         (financial_transactions)
    ...10_views.sql           (storefront_catalog, product_availability)
    ...11_rls.sql             (RLS: default deny + policies)
scripts/seed-catalog.ts # loads the 12 products / 127 variants from app/shop/products.ts
```

## Local workflow

```bash
supabase start          # boot local stack + apply migrations
supabase db reset       # rebuild from scratch (migrations + seed)
SUPABASE_URL=http://127.0.0.1:54321 \
  SUPABASE_SERVICE_ROLE_KEY=<local service role> \
  pnpm seed             # load the catalog
pnpm gen:types          # regenerate app/lib/database.types.ts (needs --linked)
```

## Tables

| Pillar | Tables |
|---|---|
| Catalog | `products`, `product_images`, `variants`, `variant_costs`, `inventory`, `stock_movements` |
| Customers | `customers`, `addresses` |
| Finances | `orders`, `order_items`, `financial_transactions` |
| Forward-compat | `suppliers` |
| Read views | `storefront_catalog`, `product_availability` |

## Conventions

- **Money:** `bigint` minor units (cents), never floats. Always paired with `currency char(3)` (e.g. `'usd'`).
- **PKs:** `uuid` default `gen_random_uuid()`.
- **Timestamps:** `created_at` / `updated_at` on every table; `updated_at` maintained by the `set_updated_at()` trigger.
- **Closed sets:** Postgres enums (see `..._enums.sql`).
- **Soft archive:** `status` columns, not hard deletes (catalog + orders).
- **Inventory:** `stock_movements` is the append-only source of truth; `inventory` is a trigger-maintained snapshot.

## Integration contracts

### Pricing teammate
- **Owns:** `variants.price_amount` (bigint, minor units) + `variants.currency`.
- `price_amount = NULL` ⇒ "not priced yet" ⇒ storefront shows NOT PRICED YET and checkout is blocked.
- Write the two columns together. Do not store dollars/floats.

### Stripe-webhook teammate
- **Owns:** the webhook handler (runs with the **service-role** key; bypasses RLS).
- On `checkout.session.completed`, populate:
  - `customers` (upsert by `email`; set `stripe_customer_id`).
  - `orders` (upsert by `stripe_checkout_session_id` — idempotency): status `paid`, totals, `currency`, `shipping_address` (jsonb), `stripe_payment_intent_id`, `placed_at`, `customer_id`, `email`.
  - `order_items` (per line): `variant_id` (resolve from the SKU passed at checkout), `sku`, `product_name`, `variant_label`, `quantity`, `unit_price_amount` (snapshot), `unit_cost_amount` (snapshot of latest `variant_costs`), `currency`, `line_total_amount`.
  - `stock_movements` (per line): `type='sale'`, `bucket='on_hand'`, `qty_delta = -quantity`, `order_id`, `created_by='webhook'` (trigger decrements `inventory`).
  - `financial_transactions`: one `order_revenue` (+total); a `stripe_fee` (−fee) when available; later `refund` (−) on refund events.
- **Prerequisite (app change, not built here):** the checkout route must pass the **variant SKU / id** + quantity into the Stripe session so the webhook can map line items back to SKUs. Today it sends only a display string with quantity hardcoded to 1.

## Security (RLS)

Default deny. `anon` and `authenticated` can only **read active catalog**
(`products`, `product_images`, `variants`, the two views). A logged-in customer
can read **only their own** `customers` / `addresses` / `orders` / `order_items`.
`variant_costs`, `inventory`, `stock_movements`, `suppliers`, and
`financial_transactions` are **service-role only** — cost, finance, inventory
numbers, and PII are never exposed to the public role.

## Layer 1 — Marketplace (reviewers + brands)

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
