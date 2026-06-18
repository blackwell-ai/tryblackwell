-- Layer 0 / Security: grants + Row Level Security. DEFAULT DENY.
--
-- Two layers of protection:
--   1) GRANTs decide which roles may touch a table AT ALL. As of 2026-05-30
--      Supabase stopped auto-granting the Data API roles on new tables
--      (config: auto_expose_new_tables defaults to false), so we grant
--      explicitly here. Anything not granted below is unreachable.
--   2) RLS then narrows WHICH ROWS each role sees.
--
-- service_role (backend / webhook / seed) gets full access and BYPASSES RLS.
-- anon (public storefront) + authenticated (logged-in customer) get only the
-- narrow access spelled out below. Cost, finance, inventory numbers, and
-- customer PII are never reachable by anon.

-- ---------------------------------------------------------------------------
-- Enable RLS on every table.
-- ---------------------------------------------------------------------------
alter table public.products                enable row level security;
alter table public.product_images          enable row level security;
alter table public.variants                enable row level security;
alter table public.variant_costs           enable row level security;
alter table public.inventory               enable row level security;
alter table public.stock_movements         enable row level security;
alter table public.suppliers               enable row level security;
alter table public.customers               enable row level security;
alter table public.addresses               enable row level security;
alter table public.orders                  enable row level security;
alter table public.order_items             enable row level security;
alter table public.financial_transactions  enable row level security;

-- ---------------------------------------------------------------------------
-- GRANTs. Revoke-all-then-grant-precisely so the table privileges THEMSELVES
-- enforce the boundary (RLS is then a second layer on top). This also makes
-- local match the new cloud deny-by-default, regardless of any legacy
-- auto-exposed grants the platform may have applied to anon/authenticated.
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

-- Wipe any default privileges the public roles may have on existing objects.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

-- Backend: full access to every current table/view and sequence. (Bypasses RLS.)
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

-- Public storefront read path (rows still filtered by the RLS policies below).
grant select on public.products            to anon, authenticated;
grant select on public.product_images      to anon, authenticated;
grant select on public.variants            to anon, authenticated;
grant select on public.storefront_catalog  to anon, authenticated;
grant select on public.product_availability to anon, authenticated;

-- Logged-in customer self-service.
grant select on public.customers           to authenticated;
grant select, insert, update, delete on public.addresses to authenticated;
grant select on public.orders              to authenticated;
grant select on public.order_items         to authenticated;

-- NOTE: no grants to anon/authenticated on variant_costs, inventory,
-- stock_movements, suppliers, or financial_transactions => those tables are
-- reachable only by service_role.

-- ---------------------------------------------------------------------------
-- Public catalog policies: read ACTIVE rows only.
-- ---------------------------------------------------------------------------
create policy products_public_read on public.products
  for select to anon, authenticated
  using (status = 'active');

create policy product_images_public_read on public.product_images
  for select to anon, authenticated
  using (exists (
    select 1 from public.products p
    where p.id = product_images.product_id and p.status = 'active'
  ));

create policy variants_public_read on public.variants
  for select to anon, authenticated
  using (
    status = 'active'
    and exists (
      select 1 from public.products p
      where p.id = variants.product_id and p.status = 'active'
    )
  );

-- ---------------------------------------------------------------------------
-- Customer self-service: a logged-in user sees only their OWN data.
-- The link is customers.auth_user_id = auth.uid(); wrapped in a scalar
-- subselect so Postgres evaluates it once per query (Supabase RLS perf tip).
-- ---------------------------------------------------------------------------
create policy customers_self_read on public.customers
  for select to authenticated
  using (auth_user_id = (select auth.uid()));

create policy addresses_self_all on public.addresses
  for all to authenticated
  using (customer_id in (
    select id from public.customers where auth_user_id = (select auth.uid())
  ))
  with check (customer_id in (
    select id from public.customers where auth_user_id = (select auth.uid())
  ));

create policy orders_self_read on public.orders
  for select to authenticated
  using (customer_id in (
    select id from public.customers where auth_user_id = (select auth.uid())
  ));

create policy order_items_self_read on public.order_items
  for select to authenticated
  using (order_id in (
    select o.id
    from public.orders o
    join public.customers c on c.id = o.customer_id
    where c.auth_user_id = (select auth.uid())
  ));

-- variant_costs, inventory, stock_movements, suppliers, financial_transactions:
-- RLS enabled with NO policy => default deny for anon/authenticated. Combined
-- with the absence of GRANTs above, they are service_role-only.
