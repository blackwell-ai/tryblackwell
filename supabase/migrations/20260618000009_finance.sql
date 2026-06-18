-- Layer 0 / Finances: general money-in / money-out ledger.
-- Revenue, refunds, fees, shipping, supplier payments -> one place to report
-- revenue, COGS, and margin from.

create table public.financial_transactions (
  id               uuid primary key default gen_random_uuid(),
  type             public.txn_type not null,
  amount           bigint not null,        -- signed: + inflow, - outflow (minor units)
  currency         char(3) not null default 'usd',
  order_id         uuid references public.orders (id),
  supplier_id      uuid references public.suppliers (id),
  stripe_reference text,                    -- charge / refund / balance-txn id
  occurred_at      timestamptz not null default now(),
  memo             text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index financial_transactions_type_idx on public.financial_transactions (type);
create index financial_transactions_order_idx on public.financial_transactions (order_id);
create index financial_transactions_supplier_idx on public.financial_transactions (supplier_id);
create index financial_transactions_occurred_idx on public.financial_transactions (occurred_at);
create index financial_transactions_stripe_ref_idx on public.financial_transactions (stripe_reference);

create trigger financial_transactions_set_updated_at
  before update on public.financial_transactions
  for each row execute function public.set_updated_at();
