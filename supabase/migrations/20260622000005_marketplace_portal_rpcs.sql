-- Layer 1 / Marketplace, part 3: portal RPCs for reviewers, brands, and admins.
--
-- The marketplace schema is not exposed to the Data API, so every app access
-- path is a public SECURITY DEFINER function, self-scoped to auth.uid() (or, for
-- admin functions, gated by public.is_blackwell_admin()). EXECUTE is granted to
-- `authenticated` only; the default PUBLIC grant is revoked. Reviewer/brand
-- functions return only portal-safe fields (no internal CRM columns); admin
-- functions may return everything.

-- ===========================================================================
-- whoami(): role dispatch for the post-login router.
-- Proactively binds the caller to their reviewer/brand row by email (idempotent)
-- then reports which console they belong in.
-- ===========================================================================
create or replace function public.whoami()
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare
  uid        uuid   := auth.uid();
  uemail     citext := nullif(auth.jwt() ->> 'email', '')::citext;
  v_reviewer uuid;
  v_brand    uuid;
  v_admin    boolean := public.is_blackwell_admin();
begin
  if uid is null then
    return jsonb_build_object('role', 'anon');
  end if;

  if uemail is not null then
    -- reviewers.email is unique, so this binds at most one row.
    update marketplace.reviewers r
       set auth_user_id = uid
     where r.auth_user_id is null and r.email = uemail;

    -- brands.contact_email is NOT unique; bind only the oldest unbound match.
    update marketplace.brands b
       set auth_user_id = uid, invited_at = coalesce(b.invited_at, now())
     where b.id = (
       select id from marketplace.brands
       where auth_user_id is null and contact_email = uemail
       order by created_at, id
       limit 1
     );
  end if;

  select id into v_reviewer from marketplace.reviewers where auth_user_id = uid limit 1;
  select id into v_brand    from marketplace.brands    where auth_user_id = uid limit 1;

  return jsonb_build_object(
    'role', case
              when v_admin then 'admin'
              when v_brand is not null then 'brand'
              when v_reviewer is not null then 'reviewer'
              else 'none'
            end,
    'email', auth.jwt() ->> 'email',
    'is_admin', v_admin,
    'reviewer_id', v_reviewer,
    'brand_id', v_brand
  );
end;
$$;

-- ===========================================================================
-- Reviewer side
-- ===========================================================================

-- Create-or-update the caller's own reviewer row (onboarding + profile edits).
-- A brand-new applicant (email not in the seed) gets a fresh row; an existing
-- reviewer (seeded from Giftly) edits theirs. Returns the portal-safe profile.
create or replace function public.upsert_my_reviewer(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare
  uid    uuid   := auth.uid();
  uemail citext := nullif(auth.jwt() ->> 'email', '')::citext;
  v_id   uuid;
begin
  if uid is null or uemail is null then
    raise exception 'not authenticated';
  end if;

  select id into v_id from marketplace.reviewers where auth_user_id = uid limit 1;
  if v_id is null then
    select id into v_id from marketplace.reviewers where email = uemail limit 1;
  end if;

  if v_id is null then
    insert into marketplace.reviewers (id, name, email, auth_user_id, source)
    values (
      gen_random_uuid(),
      coalesce(nullif(payload ->> 'name', ''), split_part(uemail::text, '@', 1)),
      uemail,
      uid,
      'application'
    )
    returning id into v_id;
  end if;

  update marketplace.reviewers r set
    auth_user_id      = uid,
    name              = case when payload ? 'name'              then coalesce(nullif(payload ->> 'name', ''), r.name) else r.name end,
    social_handles    = case when payload ? 'social_handles'    then nullif(payload ->> 'social_handles', '')    else r.social_handles end,
    platform          = case when payload ? 'platform'          then nullif(payload ->> 'platform', '')          else r.platform end,
    followers         = case when payload ? 'followers'         then nullif(payload ->> 'followers', '')         else r.followers end,
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

-- Brands this reviewer has been matched with (brand-safe fields).
create or replace function public.my_reviewer_matches()
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare uid uuid := auth.uid(); v_id uuid; result jsonb;
begin
  if uid is null then return '[]'::jsonb; end if;
  select id into v_id from marketplace.reviewers where auth_user_id = uid limit 1;
  if v_id is null then return '[]'::jsonb; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'match_id', m.id,
    'status', m.status,
    'created_at', m.created_at,
    'brand_id', b.id,
    'brand_name', b.brand_name,
    'website', b.website,
    'category', b.category,
    'product_description', b.product_description
  ) order by m.created_at desc), '[]'::jsonb)
  into result
  from marketplace.matches m
  join marketplace.brands b on b.id = m.brand_id
  where m.reviewer_id = v_id;

  return result;
end;
$$;

-- ===========================================================================
-- Brand side
-- ===========================================================================

-- Bind the caller to their brand row by contact email, then return brand-safe
-- fields (no internal notes / owner). Null if the email matches no brand.
create or replace function public.claim_brand()
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare
  uid    uuid   := auth.uid();
  uemail citext := nullif(auth.jwt() ->> 'email', '')::citext;
  result jsonb;
begin
  if uid is null then return null; end if;

  if uemail is not null then
    update marketplace.brands b
       set auth_user_id = uid, invited_at = coalesce(b.invited_at, now())
     where b.id = (
       select id from marketplace.brands
       where auth_user_id is null and contact_email = uemail
       order by created_at, id
       limit 1
     );
  end if;

  select jsonb_build_object(
    'id', b.id,
    'brand_name', b.brand_name,
    'website', b.website,
    'category', b.category,
    'product_description', b.product_description,
    'contact_name', b.contact_name,
    'contact_role', b.contact_role,
    'contact_email', b.contact_email,
    'stage', b.stage,
    'created_at', b.created_at
  ) into result
  from marketplace.brands b
  where b.auth_user_id = uid
  limit 1;

  return result;
end;
$$;

-- Reviewers matched to the caller's brand (reviewer-safe fields; shipping
-- address withheld until fulfillment is modeled).
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
    'match_id', m.id,
    'status', m.status,
    'created_at', m.created_at,
    'reviewer_id', r.id,
    'name', r.name,
    'platform', r.platform,
    'followers', r.followers,
    'niches', r.niches,
    'social_handles', r.social_handles,
    'content_link', r.content_link,
    'product_interests', r.product_interests
  ) order by m.created_at desc), '[]'::jsonb)
  into result
  from marketplace.matches m
  join marketplace.reviewers r on r.id = m.reviewer_id
  where m.brand_id = v_id;

  return result;
end;
$$;

-- Let a brand edit its own portal-visible fields.
create or replace function public.update_my_brand(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;

  update marketplace.brands b set
    brand_name          = case when payload ? 'brand_name'          then coalesce(nullif(payload ->> 'brand_name', ''), b.brand_name) else b.brand_name end,
    website             = case when payload ? 'website'             then coalesce(nullif(payload ->> 'website', ''), b.website) else b.website end,
    category            = case when payload ? 'category'            then nullif(payload ->> 'category', '')            else b.category end,
    product_description = case when payload ? 'product_description' then nullif(payload ->> 'product_description', '') else b.product_description end,
    contact_name        = case when payload ? 'contact_name'        then coalesce(nullif(payload ->> 'contact_name', ''), b.contact_name) else b.contact_name end,
    contact_role        = case when payload ? 'contact_role'        then nullif(payload ->> 'contact_role', '')        else b.contact_role end
  where b.auth_user_id = uid;

  return public.claim_brand();
end;
$$;

-- ===========================================================================
-- Admin side  (all gated by public.is_blackwell_admin())
-- ===========================================================================

create or replace function public.admin_stats()
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
begin
  if not public.is_blackwell_admin() then raise exception 'forbidden'; end if;
  return jsonb_build_object(
    'reviewers',      (select count(*) from marketplace.reviewers where archived_at is null),
    'brands',         (select count(*) from marketplace.brands    where archived_at is null),
    'matches',        (select count(*) from marketplace.matches),
    'reviewers_bound',(select count(*) from marketplace.reviewers where auth_user_id is not null),
    'brands_bound',   (select count(*) from marketplace.brands    where auth_user_id is not null)
  );
end;
$$;

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
      'id', r.id, 'name', r.name, 'email', r.email, 'platform', r.platform,
      'followers', r.followers, 'niches', r.niches, 'social_handles', r.social_handles,
      'content_link', r.content_link, 'product_interests', r.product_interests,
      'shipping_address', r.shipping_address, 'source', r.source, 'notes', r.notes,
      'bound', (r.auth_user_id is not null), 'archived_at', r.archived_at,
      'created_at', r.created_at,
      'match_count', (select count(*) from marketplace.matches m where m.reviewer_id = r.id)
    ) as row
    from marketplace.reviewers r
    where search is null or search = ''
       or r.name ilike '%' || search || '%'
       or r.email::text ilike '%' || search || '%'
    order by r.created_at desc
    limit greatest(lim, 0) offset greatest(off, 0)
  ) s;
  return result;
end;
$$;

create or replace function public.admin_list_brands(search text default null, lim integer default 200, off integer default 0)
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
    select b.created_at, jsonb_build_object(
      'id', b.id, 'brand_name', b.brand_name, 'website', b.website, 'category', b.category,
      'product_description', b.product_description, 'contact_name', b.contact_name,
      'contact_role', b.contact_role, 'contact_email', b.contact_email, 'stage', b.stage,
      'source', b.source, 'notes', b.notes, 'bound', (b.auth_user_id is not null),
      'archived_at', b.archived_at, 'created_at', b.created_at,
      'match_count', (select count(*) from marketplace.matches m where m.brand_id = b.id)
    ) as row
    from marketplace.brands b
    where search is null or search = ''
       or b.brand_name ilike '%' || search || '%'
       or b.website ilike '%' || search || '%'
       or b.contact_email::text ilike '%' || search || '%'
    order by b.created_at desc
    limit greatest(lim, 0) offset greatest(off, 0)
  ) s;
  return result;
end;
$$;

create or replace function public.admin_create_brand(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare new_id uuid;
begin
  if not public.is_blackwell_admin() then raise exception 'forbidden'; end if;
  if coalesce(nullif(payload ->> 'brand_name', ''), '') = ''
     or coalesce(nullif(payload ->> 'website', ''), '') = ''
     or coalesce(nullif(payload ->> 'contact_name', ''), '') = ''
     or coalesce(nullif(payload ->> 'contact_email', ''), '') = '' then
    raise exception 'brand_name, website, contact_name and contact_email are required';
  end if;

  insert into marketplace.brands (
    id, brand_name, website, category, product_description,
    contact_name, contact_role, contact_email, stage, source, notes, owner_id
  ) values (
    gen_random_uuid(),
    payload ->> 'brand_name',
    payload ->> 'website',
    nullif(payload ->> 'category', ''),
    nullif(payload ->> 'product_description', ''),
    payload ->> 'contact_name',
    nullif(payload ->> 'contact_role', ''),
    (payload ->> 'contact_email')::citext,
    coalesce(nullif(payload ->> 'stage', '')::marketplace.brand_stage, 'cold'),
    'manual',
    nullif(payload ->> 'notes', ''),
    auth.uid()
  )
  returning id into new_id;

  return jsonb_build_object('id', new_id);
end;
$$;

create or replace function public.admin_list_matches(lim integer default 300, off integer default 0)
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
    select m.created_at, jsonb_build_object(
      'id', m.id, 'status', m.status, 'notes', m.notes, 'created_at', m.created_at,
      'reviewer_id', r.id, 'reviewer_name', r.name, 'reviewer_email', r.email,
      'brand_id', b.id, 'brand_name', b.brand_name
    ) as row
    from marketplace.matches m
    join marketplace.reviewers r on r.id = m.reviewer_id
    join marketplace.brands b on b.id = m.brand_id
    order by m.created_at desc
    limit greatest(lim, 0) offset greatest(off, 0)
  ) s;
  return result;
end;
$$;

create or replace function public.admin_create_match(p_reviewer_id uuid, p_brand_id uuid, p_notes text default null)
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare new_id uuid;
begin
  if not public.is_blackwell_admin() then raise exception 'forbidden'; end if;

  insert into marketplace.matches (reviewer_id, brand_id, notes, created_by)
  values (p_reviewer_id, p_brand_id, nullif(p_notes, ''), auth.uid())
  on conflict (reviewer_id, brand_id) do update
    set notes = coalesce(nullif(excluded.notes, ''), marketplace.matches.notes),
        updated_at = now()
  returning id into new_id;

  return jsonb_build_object('id', new_id);
end;
$$;

create or replace function public.admin_update_match_status(p_match_id uuid, p_status text)
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
begin
  if not public.is_blackwell_admin() then raise exception 'forbidden'; end if;
  update marketplace.matches
     set status = p_status::marketplace.match_status
   where id = p_match_id;
  return jsonb_build_object('id', p_match_id, 'status', p_status);
end;
$$;

create or replace function public.admin_delete_match(p_match_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
begin
  if not public.is_blackwell_admin() then raise exception 'forbidden'; end if;
  delete from marketplace.matches where id = p_match_id;
  return jsonb_build_object('id', p_match_id, 'deleted', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- Grants: authenticated may execute; anon/public may not. Authorization for the
-- admin_* functions is enforced inside each body via is_blackwell_admin().
-- ---------------------------------------------------------------------------
do $$
declare fn text;
begin
  foreach fn in array array[
    'public.whoami()',
    'public.upsert_my_reviewer(jsonb)',
    'public.my_reviewer_matches()',
    'public.claim_brand()',
    'public.my_brand_matches()',
    'public.update_my_brand(jsonb)',
    'public.admin_stats()',
    'public.admin_list_reviewers(text,integer,integer)',
    'public.admin_list_brands(text,integer,integer)',
    'public.admin_create_brand(jsonb)',
    'public.admin_list_matches(integer,integer)',
    'public.admin_create_match(uuid,uuid,text)',
    'public.admin_update_match_status(uuid,text)',
    'public.admin_delete_match(uuid)'
  ]
  loop
    execute format('revoke all on function %s from public, anon', fn);
    execute format('grant execute on function %s to authenticated', fn);
  end loop;
end;
$$;
