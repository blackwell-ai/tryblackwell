-- Demo data + seed function for the local role-preview switcher (app/auth/dev).
--
-- seed_demo_marketplace() creates a self-contained demo: one reviewer, one
-- brand, a match between them, and a demo-admin allowlist entry — so the
-- /portal, /brand and /admin previews all show populated, linked data. Fixed
-- UUIDs + on-conflict make it idempotent. service_role-only; only ever called
-- by the dev-gated /auth/dev route, so production stays untouched unless invoked.

create or replace function public.seed_demo_marketplace()
returns void
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare
  rid uuid := '00000000-0000-0000-0000-0000000d0001';
  bid uuid := '00000000-0000-0000-0000-0000000d0002';
begin
  insert into marketplace.reviewers
    (id, name, email, platform, followers, niches, product_interests, content_link, shipping_address, source)
  values
    (rid, 'Demo Reviewer', 'demo-reviewer@blackwell.test', 'Instagram', '12k',
     array['streetwear', 'fitness'], 'Black basics, outerwear, accessories',
     'https://example.com/demo-reviewer', '123 Demo St, Sample City, CA 90000', 'manual')
  on conflict (id) do update set email = excluded.email;

  insert into marketplace.brands
    (id, brand_name, website, category, product_description, contact_name, contact_role, contact_email, stage, source)
  values
    (bid, 'Demo Brand Co', 'https://demo-brand.example', 'Apparel',
     'Minimalist black basics for everyday wear.', 'Demo Contact', 'Marketing',
     'demo-brand@blackwell.test', 'in_talks', 'manual')
  on conflict (id) do update set contact_email = excluded.contact_email;

  insert into marketplace.matches (reviewer_id, brand_id, status, notes)
  values (rid, bid, 'invited', 'Demo match for local preview')
  on conflict (reviewer_id, brand_id) do nothing;

  insert into marketplace.app_admins (email, note)
  values ('demo-admin@blackwell.test', 'demo admin for local preview')
  on conflict (email) do nothing;
end;
$$;

revoke all on function public.seed_demo_marketplace() from public, anon, authenticated;
grant execute on function public.seed_demo_marketplace() to service_role;
