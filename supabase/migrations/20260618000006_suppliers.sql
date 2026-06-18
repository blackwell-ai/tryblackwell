-- Layer 0 / Forward-compat: lightweight supplier reference.
-- Kept minimal. A future purchase_orders / purchase_order_items pair attaches
-- here, and restock stock_movements would reference a PO.

create table public.suppliers (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  contact_name   text,
  contact_email  text,
  lead_time_days integer,
  status         public.supplier_status not null default 'active',
  note           text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index suppliers_status_idx on public.suppliers (status);

create trigger suppliers_set_updated_at
  before update on public.suppliers
  for each row execute function public.set_updated_at();

-- A variant may have a default supplier (where the reorder agent would buy from).
alter table public.variants
  add column default_supplier_id uuid references public.suppliers (id);

create index variants_default_supplier_idx on public.variants (default_supplier_id);
