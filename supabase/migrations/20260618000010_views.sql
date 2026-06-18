-- Layer 0 / Read surface: curated views for the storefront.

-- storefront_catalog: the safe public read path. security_invoker = true means it
-- runs with the caller's privileges and therefore RESPECTS the RLS policies on
-- products/variants (active rows only). It exposes only storefront-safe columns
-- and deliberately omits cost, inventory numbers, weight/dimensions, supplier.
create view public.storefront_catalog
with (security_invoker = true) as
select
  p.id          as product_id,
  p.handle,
  p.name,
  p.category,
  p.description,
  p.position    as product_position,
  v.id          as variant_id,
  v.sku,
  v.fit,
  v.size,
  v.price_amount,
  v.currency,
  v.position    as variant_position
from public.products p
join public.variants v on v.product_id = p.id
where p.status = 'active'
  and v.status = 'active';

grant select on public.storefront_catalog to anon, authenticated;

-- product_availability: surfaces a BOOLEAN in_stock per variant WITHOUT exposing
-- raw stock numbers. security_invoker = false (definer) lets it read the private
-- inventory table while callers only ever see variant_id + in_stock.
create view public.product_availability
with (security_invoker = false) as
select
  variant_id,
  (available > 0) as in_stock
from public.inventory;

grant select on public.product_availability to anon, authenticated;
