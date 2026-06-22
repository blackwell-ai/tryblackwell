-- Importer RPCs for the Giftly -> Blackwell marketplace sync
-- (scripts/migrate-giftly.ts). The marketplace schema is not exposed to the
-- Data API, so the sync script writes through these SECURITY DEFINER functions
-- in the exposed `public` schema. EXECUTE is granted to service_role only;
-- the default PUBLIC execute grant is revoked so anon/authenticated cannot
-- reach marketplace through them.

create or replace function public.import_marketplace_reviewers(rows jsonb)
returns integer
language plpgsql
security definer
set search_path = public, marketplace
as $$
declare affected integer;
begin
  insert into marketplace.reviewers as r (
    id, name, email, social_handles, platform, followers, niches,
    product_interests, content_link, shipping_address, notes, source,
    reviewed_at, archived_at, giftly_synced_at, created_at, updated_at
  )
  select
    (e->>'id')::uuid,
    e->>'name',
    (e->>'email')::citext,
    e->>'social_handles',
    e->>'platform',
    e->>'followers',
    coalesce((select array_agg(v) from jsonb_array_elements_text(e->'niches') v), '{}'::text[]),
    e->>'product_interests',
    e->>'content_link',
    e->>'shipping_address',
    e->>'notes',
    coalesce(nullif(e->>'source','')::marketplace.record_source, 'application'),
    (e->>'reviewed_at')::timestamptz,
    (e->>'archived_at')::timestamptz,
    now(),
    (e->>'created_at')::timestamptz,
    (e->>'updated_at')::timestamptz
  from jsonb_array_elements(coalesce(rows, '[]'::jsonb)) e
  on conflict (id) do update set
    name = excluded.name,
    email = excluded.email,
    social_handles = excluded.social_handles,
    platform = excluded.platform,
    followers = excluded.followers,
    niches = excluded.niches,
    product_interests = excluded.product_interests,
    content_link = excluded.content_link,
    shipping_address = excluded.shipping_address,
    notes = excluded.notes,
    source = excluded.source,
    reviewed_at = excluded.reviewed_at,
    archived_at = excluded.archived_at,
    giftly_synced_at = excluded.giftly_synced_at,
    updated_at = excluded.updated_at;
  get diagnostics affected = row_count;
  return affected;
end;
$$;

create or replace function public.import_marketplace_brands(rows jsonb)
returns integer
language plpgsql
security definer
set search_path = public, marketplace
as $$
declare affected integer;
begin
  insert into marketplace.brands as b (
    id, brand_name, website, category, product_description, contact_name,
    contact_role, contact_email, stage, source, notes, reviewed_at,
    archived_at, giftly_synced_at, created_at, updated_at
  )
  select
    (e->>'id')::uuid,
    e->>'brand_name',
    e->>'website',
    e->>'category',
    e->>'product_description',
    e->>'contact_name',
    e->>'contact_role',
    (e->>'contact_email')::citext,
    coalesce(nullif(e->>'stage','')::marketplace.brand_stage, 'cold'),
    coalesce(nullif(e->>'source','')::marketplace.record_source, 'outreach'),
    e->>'notes',
    (e->>'reviewed_at')::timestamptz,
    (e->>'archived_at')::timestamptz,
    now(),
    (e->>'created_at')::timestamptz,
    (e->>'updated_at')::timestamptz
  from jsonb_array_elements(coalesce(rows, '[]'::jsonb)) e
  on conflict (id) do update set
    brand_name = excluded.brand_name,
    website = excluded.website,
    category = excluded.category,
    product_description = excluded.product_description,
    contact_name = excluded.contact_name,
    contact_role = excluded.contact_role,
    contact_email = excluded.contact_email,
    stage = excluded.stage,
    source = excluded.source,
    notes = excluded.notes,
    reviewed_at = excluded.reviewed_at,
    archived_at = excluded.archived_at,
    giftly_synced_at = excluded.giftly_synced_at,
    updated_at = excluded.updated_at;
  get diagnostics affected = row_count;
  return affected;
end;
$$;

revoke all on function public.import_marketplace_reviewers(jsonb) from public, anon, authenticated;
revoke all on function public.import_marketplace_brands(jsonb)    from public, anon, authenticated;
grant execute on function public.import_marketplace_reviewers(jsonb) to service_role;
grant execute on function public.import_marketplace_brands(jsonb)    to service_role;
