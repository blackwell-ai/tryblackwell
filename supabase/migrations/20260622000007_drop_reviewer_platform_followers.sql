-- Reviewers are not (necessarily) influencers, so platform + follower count are
-- obsolete: drop them from the model. Niches / product interests stay — those
-- are what actually drive brand matching. The source values still live in
-- Giftly, so this is reversible if ever needed.
--
-- Recreate every function that referenced the columns (plpgsql is late-bound, so
-- they must stop referencing platform/followers before the columns can go), then
-- drop the columns.

-- Giftly importer — no longer maps platform/followers.
create or replace function public.import_marketplace_reviewers(rows jsonb)
returns integer
language plpgsql
security definer
set search_path = public, marketplace
as $$
declare affected integer;
begin
  insert into marketplace.reviewers as r (
    id, name, email, social_handles, niches,
    product_interests, content_link, shipping_address, notes, source,
    reviewed_at, archived_at, giftly_synced_at, created_at, updated_at
  )
  select
    (e->>'id')::uuid,
    e->>'name',
    (e->>'email')::citext,
    e->>'social_handles',
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

-- Portal self-read.
create or replace function public.claim_reviewer()
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  uemail citext := nullif(auth.jwt() ->> 'email', '')::citext;
  result jsonb;
begin
  if uid is null then return null; end if;
  if uemail is not null then
    update marketplace.reviewers r set auth_user_id = uid
     where r.auth_user_id is null and r.email = uemail;
  end if;
  select jsonb_build_object(
    'id', r.id, 'name', r.name, 'email', r.email,
    'social_handles', r.social_handles, 'niches', r.niches,
    'product_interests', r.product_interests, 'content_link', r.content_link,
    'shipping_address', r.shipping_address, 'created_at', r.created_at
  ) into result
  from marketplace.reviewers r
  where r.auth_user_id = uid
  limit 1;
  return result;
end;
$$;

-- Portal upsert.
create or replace function public.upsert_my_reviewer(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare
  uid uuid := auth.uid();
  uemail citext := nullif(auth.jwt() ->> 'email', '')::citext;
  v_id uuid;
begin
  if uid is null or uemail is null then raise exception 'not authenticated'; end if;
  select id into v_id from marketplace.reviewers where auth_user_id = uid limit 1;
  if v_id is null then select id into v_id from marketplace.reviewers where email = uemail limit 1; end if;
  if v_id is null then
    insert into marketplace.reviewers (id, name, email, auth_user_id, source)
    values (gen_random_uuid(), coalesce(nullif(payload ->> 'name', ''), split_part(uemail::text, '@', 1)), uemail, uid, 'application')
    returning id into v_id;
  end if;
  update marketplace.reviewers r set
    auth_user_id      = uid,
    name              = case when payload ? 'name'              then coalesce(nullif(payload ->> 'name', ''), r.name) else r.name end,
    social_handles    = case when payload ? 'social_handles'    then nullif(payload ->> 'social_handles', '')    else r.social_handles end,
    product_interests = case when payload ? 'product_interests' then nullif(payload ->> 'product_interests', '') else r.product_interests end,
    content_link      = case when payload ? 'content_link'      then nullif(payload ->> 'content_link', '')      else r.content_link end,
    shipping_address  = case when payload ? 'shipping_address'  then nullif(payload ->> 'shipping_address', '')  else r.shipping_address end,
    niches            = case when payload ? 'niches'
                          then coalesce((select array_agg(trim(v)) from jsonb_array_elements_text(payload -> 'niches') v where trim(v) <> ''), '{}'::text[])
                          else r.niches end
  where r.id = v_id;
  return public.claim_reviewer();
end;
$$;

-- Brand's view of its matched reviewers.
create or replace function public.my_brand_matches()
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare uid uuid := auth.uid(); v_id uuid; result jsonb;
begin
  if uid is null then return '[]'::jsonb; end if;
  select id into v_id from marketplace.brands where auth_user_id = uid limit 1;
  if v_id is null then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
    'match_id', m.id, 'status', m.status, 'created_at', m.created_at,
    'reviewer_id', r.id, 'name', r.name, 'niches', r.niches,
    'social_handles', r.social_handles, 'content_link', r.content_link,
    'product_interests', r.product_interests
  ) order by m.created_at desc), '[]'::jsonb) into result
  from marketplace.matches m join marketplace.reviewers r on r.id = m.reviewer_id
  where m.brand_id = v_id;
  return result;
end;
$$;

-- Admin reviewer list.
create or replace function public.admin_list_reviewers(search text default null, lim integer default 200, off integer default 0)
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare result jsonb;
begin
  if not public.is_blackwell_admin() then raise exception 'forbidden'; end if;
  select coalesce(jsonb_agg(row order by created_at desc), '[]'::jsonb) into result
  from (
    select r.created_at, jsonb_build_object(
      'id', r.id, 'name', r.name, 'email', r.email,
      'niches', r.niches, 'social_handles', r.social_handles,
      'content_link', r.content_link, 'product_interests', r.product_interests,
      'shipping_address', r.shipping_address, 'source', r.source, 'notes', r.notes,
      'bound', (r.auth_user_id is not null), 'archived_at', r.archived_at, 'created_at', r.created_at,
      'match_count', (select count(*) from marketplace.matches m where m.reviewer_id = r.id)
    ) as row
    from marketplace.reviewers r
    where search is null or search = '' or r.name ilike '%' || search || '%' or r.email::text ilike '%' || search || '%'
    order by r.created_at desc limit greatest(lim, 0) offset greatest(off, 0)
  ) s;
  return result;
end;
$$;

-- Demo seed (preview switcher).
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
    (id, name, email, niches, product_interests, content_link, shipping_address, source)
  values
    (rid, 'Demo Reviewer', 'demo-reviewer@blackwell.test',
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

-- Finally, drop the obsolete columns.
alter table marketplace.reviewers drop column if exists platform;
alter table marketplace.reviewers drop column if exists followers;
