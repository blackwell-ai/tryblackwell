-- Layer 0 / Customers: guest-first customers and their saved addresses.

-- Customers are keyed by email and created from orders (guest checkout).
-- auth_user_id is a NULLABLE link to Supabase Auth: a guest exists without an
-- account and can be claimed later when they register.
create table public.customers (
  id                 uuid primary key default gen_random_uuid(),
  email              citext not null unique,
  full_name          text,
  marketing_consent  boolean not null default false,
  stripe_customer_id text,
  auth_user_id       uuid references auth.users (id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create unique index customers_stripe_customer_key
  on public.customers (stripe_customer_id) where stripe_customer_id is not null;
create unique index customers_auth_user_key
  on public.customers (auth_user_id) where auth_user_id is not null;

create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- Reusable address book for accounts. Orders snapshot their own ship-to
-- separately so address edits never rewrite order history.
create table public.addresses (
  id             uuid primary key default gen_random_uuid(),
  customer_id    uuid not null references public.customers (id) on delete cascade,
  type           public.address_type not null,
  is_default     boolean not null default false,
  recipient_name text,
  line1          text not null,
  line2          text,
  city           text not null,
  region         text,                          -- state / province
  postal_code    text,
  country        char(2) not null,              -- ISO-3166-1 alpha-2
  phone          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index addresses_customer_idx on public.addresses (customer_id);
create index addresses_customer_type_default_idx on public.addresses (customer_id, type, is_default);

create trigger addresses_set_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();
