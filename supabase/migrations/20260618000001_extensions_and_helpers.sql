-- Layer 0: extensions and shared helpers.
-- Runs first so later migrations can rely on these objects.

-- citext: case-insensitive text, used for email columns (customers, orders).
create extension if not exists citext;

-- pgcrypto: provides gen_random_uuid() for UUID primary keys.
create extension if not exists pgcrypto;

-- Shared trigger function: stamp updated_at = now() on every UPDATE.
-- Attached to every table that has an updated_at column.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Human-friendly, monotonic order numbers, e.g. "BW-100001".
create sequence if not exists public.order_number_seq start with 100001;
