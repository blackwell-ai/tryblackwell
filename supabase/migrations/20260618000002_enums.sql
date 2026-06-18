-- Layer 0: closed-set enum types used across the schema.
-- Enums document intent and stay indexable; new values are added later with
-- `alter type ... add value '...'` without rewriting tables.

create type public.product_category as enum ('tops', 'layers', 'bottoms', 'accessory');

create type public.product_status as enum ('draft', 'active', 'archived');

create type public.variant_status as enum ('active', 'archived');

-- Fits currently in the catalog. Extendable (e.g. 'Kids') via alter type.
create type public.fit_type as enum ('Men', 'Women', 'Unisex');

create type public.image_kind as enum ('front', 'back', 'model', 'detail');

create type public.stock_movement_type as enum (
  'restock',     -- inbound stock (e.g. from a supplier / PO)         + on_hand
  'sale',        -- sold and shipped/allocated                        - on_hand
  'return',      -- customer return back into sellable stock          + on_hand
  'adjustment',  -- manual correction (cycle count, data fix)         +/- on_hand
  'reservation', -- allocate to an unfulfilled order                  + reserved
  'release',     -- release a prior reservation                       - reserved
  'shrinkage'    -- loss: damage, theft, write-off                    - on_hand
);

create type public.order_status as enum (
  'pending',            -- created, not yet paid
  'paid',               -- payment captured
  'fulfilled',          -- shipped / handed off
  'cancelled',          -- voided before fulfilment
  'refunded',           -- fully refunded
  'partially_refunded'  -- partial refund issued
);

create type public.address_type as enum ('shipping', 'billing');

create type public.txn_type as enum (
  'order_revenue',     -- + money in from a sale
  'refund',            -- - money returned to a customer
  'stripe_fee',        -- - processor fee
  'shipping_cost',     -- - carrier/postage cost
  'supplier_payment',  -- - paid to a supplier for goods
  'payout',            -- - transfer of funds out of the platform balance
  'tax_remittance',    -- - tax paid to authorities
  'adjustment'         -- +/- manual correction
);

create type public.supplier_status as enum ('active', 'archived');
