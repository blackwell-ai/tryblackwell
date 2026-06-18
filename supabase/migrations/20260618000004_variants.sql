-- Layer 0 / Catalog: variants (the sellable SKU) and their cost history.

-- One row per product x fit x size. This is the unit that is priced, stocked,
-- and sold. `default_supplier_id` is added later by the suppliers migration.
create table public.variants (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products (id),
  sku          text not null unique,
  fit          public.fit_type not null,
  size         text not null,                 -- free text: XS..XXL, 28..36, OS
  barcode      text,                          -- optional UPC/EAN/GTIN
  weight_grams integer,                       -- shippable weight
  length_mm    integer,
  width_mm     integer,
  height_mm    integer,
  -- PRICING INTEGRATION POINT (owned by the pricing teammate):
  -- price_amount is in minor units (cents). NULL = "not priced yet" -> storefront
  -- shows NOT PRICED YET and checkout is blocked. Always written with currency.
  price_amount bigint,
  currency     char(3) not null default 'usd',
  status       public.variant_status not null default 'active',
  position     integer,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint variants_unique_combo unique (product_id, fit, size),
  constraint variants_price_nonneg check (price_amount is null or price_amount >= 0)
);

create index variants_product_idx on public.variants (product_id);
create index variants_status_idx on public.variants (status);
create unique index variants_barcode_key on public.variants (barcode) where barcode is not null;

create trigger variants_set_updated_at
  before update on public.variants
  for each row execute function public.set_updated_at();

-- Append-only cost history. The "current cost" is the latest effective row.
-- order_items snapshot the cost in effect at sale time, so margin on a past
-- order never shifts when costs change.
create table public.variant_costs (
  id               uuid primary key default gen_random_uuid(),
  variant_id       uuid not null references public.variants (id),
  unit_cost_amount bigint not null check (unit_cost_amount >= 0),  -- minor units
  currency         char(3) not null default 'usd',
  effective_from   timestamptz not null default now(),
  source           text,                                          -- supplier / PO ref
  note             text,
  created_at       timestamptz not null default now()
);

create index variant_costs_variant_idx on public.variant_costs (variant_id);
create index variant_costs_variant_effective_idx
  on public.variant_costs (variant_id, effective_from desc);
