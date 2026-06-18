-- Layer 0 / Catalog: per-SKU stock.
-- Source of truth = the append-only stock_movements ledger.
-- inventory is a fast O(1) snapshot kept in lockstep by a trigger.

create table public.inventory (
  variant_id       uuid primary key references public.variants (id),
  on_hand          integer not null default 0 check (on_hand >= 0),
  reserved         integer not null default 0 check (reserved >= 0),
  available        integer generated always as (on_hand - reserved) stored,
  reorder_point    integer not null default 0,   -- replenishment trigger level
  reorder_quantity integer not null default 0,   -- how many to reorder
  safety_stock     integer not null default 0,
  updated_at       timestamptz not null default now()
);

create index inventory_available_idx on public.inventory (available);
-- Fast scan for the future replenishment agent: "which SKUs need reordering".
create index inventory_needs_reorder_idx
  on public.inventory (variant_id) where available <= reorder_point;

create trigger inventory_set_updated_at
  before update on public.inventory
  for each row execute function public.set_updated_at();

-- The audit trail. Every sale, restock, return, reservation, and adjustment is
-- its own immutable row. order_id's FK is wired up in the orders migration
-- (orders does not exist yet at this point).
create table public.stock_movements (
  id         uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.variants (id),
  type       public.stock_movement_type not null,
  qty_delta  integer not null check (qty_delta <> 0),         -- signed: + adds, - removes
  bucket     text not null check (bucket in ('on_hand', 'reserved')),
  order_id   uuid,                                            -- FK added in orders migration
  note       text,
  created_by text,                                            -- 'webhook' | 'admin' | 'agent' | ...
  created_at timestamptz not null default now()
);

create index stock_movements_variant_idx on public.stock_movements (variant_id);
create index stock_movements_variant_created_idx on public.stock_movements (variant_id, created_at);
create index stock_movements_order_idx on public.stock_movements (order_id);
create index stock_movements_type_idx on public.stock_movements (type);

-- Apply each ledger row to the inventory snapshot.
create or replace function public.apply_stock_movement()
returns trigger
language plpgsql
as $$
begin
  -- Ensure an inventory row exists for this variant.
  insert into public.inventory (variant_id)
  values (new.variant_id)
  on conflict (variant_id) do nothing;

  if new.bucket = 'on_hand' then
    update public.inventory
      set on_hand = on_hand + new.qty_delta
      where variant_id = new.variant_id;
  elsif new.bucket = 'reserved' then
    update public.inventory
      set reserved = reserved + new.qty_delta
      where variant_id = new.variant_id;
  end if;

  return new;
end;
$$;

create trigger stock_movements_apply
  after insert on public.stock_movements
  for each row execute function public.apply_stock_movement();
