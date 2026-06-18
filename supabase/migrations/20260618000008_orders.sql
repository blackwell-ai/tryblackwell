-- Layer 0 / Finances: orders and their line items.
-- This is the clean write target for the Stripe-webhook teammate.

create table public.orders (
  id                         uuid primary key default gen_random_uuid(),
  order_number               text not null unique
                               default ('BW-' || nextval('public.order_number_seq')),
  customer_id                uuid references public.customers (id),
  email                      citext not null,                 -- snapshot of buyer email
  status                     public.order_status not null default 'pending',
  currency                   char(3) not null default 'usd',
  -- all monetary values in minor units (cents).
  subtotal_amount            bigint not null default 0 check (subtotal_amount >= 0),
  shipping_amount            bigint not null default 0 check (shipping_amount >= 0),
  tax_amount                 bigint not null default 0 check (tax_amount >= 0),
  discount_amount            bigint not null default 0 check (discount_amount >= 0),
  total_amount               bigint not null default 0 check (total_amount >= 0),
  shipping_address           jsonb,                           -- point-in-time snapshot
  stripe_checkout_session_id text,                            -- idempotency key
  stripe_payment_intent_id   text,
  placed_at                  timestamptz,                     -- set when paid
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

-- Unique-when-present Stripe ids give the webhook a natural idempotency target.
create unique index orders_checkout_session_key
  on public.orders (stripe_checkout_session_id) where stripe_checkout_session_id is not null;
create unique index orders_payment_intent_key
  on public.orders (stripe_payment_intent_id) where stripe_payment_intent_id is not null;
create index orders_customer_idx on public.orders (customer_id);
create index orders_status_idx on public.orders (status);
create index orders_email_idx on public.orders (email);
create index orders_created_idx on public.orders (created_at);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- Line items snapshot SKU, name, price, AND cost at purchase time so historical
-- margin is stable even as live prices/costs change.
create table public.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.orders (id) on delete cascade,
  variant_id        uuid references public.variants (id),   -- soft-archive keeps this valid
  sku               text not null,                          -- snapshot
  product_name      text not null,                          -- snapshot
  variant_label     text,                                   -- snapshot, e.g. "Men / L"
  quantity          integer not null check (quantity > 0),
  unit_price_amount bigint not null check (unit_price_amount >= 0),   -- snapshot
  unit_cost_amount  bigint check (unit_cost_amount >= 0),             -- snapshot (COGS)
  currency          char(3) not null default 'usd',
  line_total_amount bigint not null check (line_total_amount >= 0),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index order_items_order_idx on public.order_items (order_id);
create index order_items_variant_idx on public.order_items (variant_id);
create index order_items_sku_idx on public.order_items (sku);

create trigger order_items_set_updated_at
  before update on public.order_items
  for each row execute function public.set_updated_at();

-- Now that orders exists, wire up the deferred FK from the stock ledger so that
-- sale/return/reservation movements can point at the order that caused them.
alter table public.stock_movements
  add constraint stock_movements_order_fk
  foreign key (order_id) references public.orders (id);
