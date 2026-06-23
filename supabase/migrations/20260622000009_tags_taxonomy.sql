-- Layer 1 / Marketplace: a living tag taxonomy for AI matching.
--
-- Reviewers describe their interests and brands describe what they sell in
-- freeform text; an AI synthesizer turns that into tags (see app/lib/ai). The
-- vocabulary grows autonomously: the AI (and users/admins) can mint new tags
-- whenever nothing fits. We deliberately do NOT de-duplicate by meaning — only
-- exact (case-insensitive) labels collapse, via the citext unique index. The
-- taxonomy is seeded with broad categories most products can apply to.
--
-- Service-role-only like the rest of marketplace; reached through public
-- SECURITY DEFINER RPCs.

-- ---------------------------------------------------------------------------
-- tags + entity links
-- ---------------------------------------------------------------------------
create table marketplace.tags (
  id         uuid primary key default gen_random_uuid(),
  label      citext not null unique,         -- exact-dedup only; no fuzzy merge
  kind       text not null default 'tag',    -- 'category' (seeded) | 'tag'
  source     text not null default 'manual', -- 'seed' | 'ai' | 'user' | 'admin' | 'manual'
  created_at timestamptz not null default now()
);

create table marketplace.reviewer_tags (
  reviewer_id uuid not null references marketplace.reviewers (id) on delete cascade,
  tag_id      uuid not null references marketplace.tags (id)      on delete cascade,
  source      text not null default 'ai',     -- 'ai' | 'self' | 'admin'
  created_at  timestamptz not null default now(),
  primary key (reviewer_id, tag_id)
);
create index reviewer_tags_tag_idx on marketplace.reviewer_tags (tag_id);

create table marketplace.brand_tags (
  brand_id   uuid not null references marketplace.brands (id) on delete cascade,
  tag_id     uuid not null references marketplace.tags (id)   on delete cascade,
  source     text not null default 'ai',
  created_at timestamptz not null default now(),
  primary key (brand_id, tag_id)
);
create index brand_tags_tag_idx on marketplace.brand_tags (tag_id);

alter table marketplace.tags          enable row level security;
alter table marketplace.reviewer_tags enable row level security;
alter table marketplace.brand_tags    enable row level security;
revoke all on marketplace.tags, marketplace.reviewer_tags, marketplace.brand_tags from anon, authenticated;
grant  all on marketplace.tags, marketplace.reviewer_tags, marketplace.brand_tags to service_role;

-- Seed broad categories most products can apply to.
insert into marketplace.tags (label, kind, source) values
  ('apparel','category','seed'), ('footwear','category','seed'), ('accessories','category','seed'),
  ('beauty','category','seed'), ('skincare','category','seed'), ('haircare','category','seed'),
  ('fragrance','category','seed'), ('wellness','category','seed'), ('supplements','category','seed'),
  ('fitness','category','seed'), ('food & beverage','category','seed'), ('home & living','category','seed'),
  ('kitchen','category','seed'), ('tech & electronics','category','seed'), ('gaming','category','seed'),
  ('outdoors','category','seed'), ('pets','category','seed'), ('baby & kids','category','seed'),
  ('travel','category','seed'), ('books & media','category','seed')
on conflict (label) do nothing;

-- ---------------------------------------------------------------------------
-- helper: an entity's tags as jsonb (plain fn; callers are SECURITY DEFINER)
-- ---------------------------------------------------------------------------
create or replace function marketplace.entity_tags_json(p_kind text, p_id uuid)
returns jsonb
language sql
stable
set search_path = marketplace, public, pg_temp
as $$
  select coalesce(jsonb_agg(
           jsonb_build_object('id', t.id, 'label', t.label, 'kind', t.kind, 'source', et.source)
           order by t.label
         ), '[]'::jsonb)
  from (
    select tag_id, source from marketplace.reviewer_tags where p_kind = 'reviewer' and reviewer_id = p_id
    union all
    select tag_id, source from marketplace.brand_tags    where p_kind = 'brand'    and brand_id = p_id
  ) et
  join marketplace.tags t on t.id = et.tag_id;
$$;

-- ---------------------------------------------------------------------------
-- Browse / create tags (authenticated)
-- ---------------------------------------------------------------------------
create or replace function public.list_tags(p_search text default null, p_lim integer default 60)
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare result jsonb;
begin
  if auth.uid() is null then return '[]'::jsonb; end if;
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'label', label, 'kind', kind, 'usage', usage)
           order by usage desc, label), '[]'::jsonb) into result
  from (
    select t.id, t.label, t.kind,
      (select count(*) from marketplace.reviewer_tags rt where rt.tag_id = t.id) +
      (select count(*) from marketplace.brand_tags    bt where bt.tag_id = t.id) as usage
    from marketplace.tags t
    where p_search is null or p_search = '' or t.label ilike '%' || p_search || '%'
    order by usage desc, t.label
    limit greatest(p_lim, 0)
  ) s;
  return result;
end;
$$;

create or replace function public.get_or_create_tag(p_label text, p_kind text default 'tag', p_source text default 'user')
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare v_label citext := nullif(trim(p_label), '')::citext; v_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if v_label is null then raise exception 'label required'; end if;
  insert into marketplace.tags (label, kind, source)
  values (v_label, coalesce(nullif(p_kind, ''), 'tag'), coalesce(nullif(p_source, ''), 'user'))
  on conflict (label) do nothing;
  select id into v_id from marketplace.tags where label = v_label;
  return jsonb_build_object('id', v_id, 'label', v_label);
end;
$$;

-- ---------------------------------------------------------------------------
-- Self-service tags (reviewer or brand, by auth binding)
-- ---------------------------------------------------------------------------
create or replace function public.my_tags()
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare uid uuid := auth.uid(); v_rev uuid; v_brand uuid;
begin
  if uid is null then return '[]'::jsonb; end if;
  select id into v_rev   from marketplace.reviewers where auth_user_id = uid limit 1;
  if v_rev is not null then return marketplace.entity_tags_json('reviewer', v_rev); end if;
  select id into v_brand from marketplace.brands    where auth_user_id = uid limit 1;
  if v_brand is not null then return marketplace.entity_tags_json('brand', v_brand); end if;
  return '[]'::jsonb;
end;
$$;

create or replace function public.add_my_tag(p_label text)
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare
  uid uuid := auth.uid(); v_rev uuid; v_brand uuid;
  v_label citext := nullif(trim(p_label), '')::citext; v_tag uuid;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  if v_label is null then raise exception 'label required'; end if;
  insert into marketplace.tags (label, kind, source) values (v_label, 'tag', 'user')
    on conflict (label) do nothing;
  select id into v_tag from marketplace.tags where label = v_label;
  select id into v_rev from marketplace.reviewers where auth_user_id = uid limit 1;
  if v_rev is not null then
    insert into marketplace.reviewer_tags (reviewer_id, tag_id, source) values (v_rev, v_tag, 'self')
      on conflict (reviewer_id, tag_id) do nothing;
    return marketplace.entity_tags_json('reviewer', v_rev);
  end if;
  select id into v_brand from marketplace.brands where auth_user_id = uid limit 1;
  if v_brand is not null then
    insert into marketplace.brand_tags (brand_id, tag_id, source) values (v_brand, v_tag, 'self')
      on conflict (brand_id, tag_id) do nothing;
    return marketplace.entity_tags_json('brand', v_brand);
  end if;
  raise exception 'no profile to tag';
end;
$$;

create or replace function public.remove_my_tag(p_tag_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare uid uuid := auth.uid(); v_rev uuid; v_brand uuid;
begin
  if uid is null then raise exception 'not authenticated'; end if;
  select id into v_rev from marketplace.reviewers where auth_user_id = uid limit 1;
  if v_rev is not null then
    delete from marketplace.reviewer_tags where reviewer_id = v_rev and tag_id = p_tag_id;
    return marketplace.entity_tags_json('reviewer', v_rev);
  end if;
  select id into v_brand from marketplace.brands where auth_user_id = uid limit 1;
  if v_brand is not null then
    delete from marketplace.brand_tags where brand_id = v_brand and tag_id = p_tag_id;
    return marketplace.entity_tags_json('brand', v_brand);
  end if;
  return '[]'::jsonb;
end;
$$;

-- ---------------------------------------------------------------------------
-- AI synthesis write path (service_role only)
-- Replaces an entity's AI-sourced tags; keeps self/admin tags intact.
-- ---------------------------------------------------------------------------
create or replace function public.apply_ai_tags(p_kind text, p_id uuid, p_labels text[])
returns integer
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare lbl text; v_label citext; v_tag uuid; n integer := 0;
begin
  if p_kind not in ('reviewer', 'brand') then raise exception 'bad kind'; end if;
  if p_kind = 'reviewer' then
    delete from marketplace.reviewer_tags where reviewer_id = p_id and source = 'ai';
  else
    delete from marketplace.brand_tags where brand_id = p_id and source = 'ai';
  end if;
  foreach lbl in array coalesce(p_labels, '{}'::text[]) loop
    v_label := nullif(trim(lbl), '')::citext;
    if v_label is null then continue; end if;
    insert into marketplace.tags (label, kind, source) values (v_label, 'tag', 'ai')
      on conflict (label) do nothing;
    select id into v_tag from marketplace.tags where label = v_label;
    if p_kind = 'reviewer' then
      insert into marketplace.reviewer_tags (reviewer_id, tag_id, source) values (p_id, v_tag, 'ai')
        on conflict (reviewer_id, tag_id) do nothing;
    else
      insert into marketplace.brand_tags (brand_id, tag_id, source) values (p_id, v_tag, 'ai')
        on conflict (brand_id, tag_id) do nothing;
    end if;
    n := n + 1;
  end loop;
  return n;
end;
$$;

-- ---------------------------------------------------------------------------
-- Admin: manage entity tags, browse taxonomy, generate match candidates
-- ---------------------------------------------------------------------------
create or replace function public.admin_get_entity_tags(p_kind text, p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
begin
  if not public.is_blackwell_admin() then raise exception 'forbidden'; end if;
  return marketplace.entity_tags_json(p_kind, p_id);
end;
$$;

create or replace function public.admin_add_entity_tag(p_kind text, p_id uuid, p_label text)
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare v_label citext := nullif(trim(p_label), '')::citext; v_tag uuid;
begin
  if not public.is_blackwell_admin() then raise exception 'forbidden'; end if;
  if v_label is null then raise exception 'label required'; end if;
  insert into marketplace.tags (label, kind, source) values (v_label, 'tag', 'admin')
    on conflict (label) do nothing;
  select id into v_tag from marketplace.tags where label = v_label;
  if p_kind = 'reviewer' then
    insert into marketplace.reviewer_tags (reviewer_id, tag_id, source) values (p_id, v_tag, 'admin')
      on conflict (reviewer_id, tag_id) do nothing;
  elsif p_kind = 'brand' then
    insert into marketplace.brand_tags (brand_id, tag_id, source) values (p_id, v_tag, 'admin')
      on conflict (brand_id, tag_id) do nothing;
  else raise exception 'bad kind'; end if;
  return marketplace.entity_tags_json(p_kind, p_id);
end;
$$;

create or replace function public.admin_remove_entity_tag(p_kind text, p_id uuid, p_tag_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
begin
  if not public.is_blackwell_admin() then raise exception 'forbidden'; end if;
  if p_kind = 'reviewer' then
    delete from marketplace.reviewer_tags where reviewer_id = p_id and tag_id = p_tag_id;
  elsif p_kind = 'brand' then
    delete from marketplace.brand_tags where brand_id = p_id and tag_id = p_tag_id;
  else raise exception 'bad kind'; end if;
  return marketplace.entity_tags_json(p_kind, p_id);
end;
$$;

create or replace function public.admin_list_tags(p_search text default null, p_lim integer default 300)
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare result jsonb;
begin
  if not public.is_blackwell_admin() then raise exception 'forbidden'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
           'id', id, 'label', label, 'kind', kind, 'source', source,
           'reviewer_count', rc, 'brand_count', bc) order by (rc + bc) desc, label), '[]'::jsonb)
  into result
  from (
    select t.id, t.label, t.kind, t.source,
      (select count(*) from marketplace.reviewer_tags rt where rt.tag_id = t.id) as rc,
      (select count(*) from marketplace.brand_tags    bt where bt.tag_id = t.id) as bc
    from marketplace.tags t
    where p_search is null or p_search = '' or t.label ilike '%' || p_search || '%'
    order by t.label
    limit greatest(p_lim, 0)
  ) s;
  return result;
end;
$$;

-- Top reviewers for a brand by shared-tag overlap, plus the brand context.
-- Feeds the AI matcher (app/lib/ai/match) with a manageable candidate set.
create or replace function public.admin_match_candidates(p_brand_id uuid, p_lim integer default 25)
returns jsonb
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
declare result jsonb;
begin
  if not public.is_blackwell_admin() then raise exception 'forbidden'; end if;
  select jsonb_build_object(
    'brand', (
      select jsonb_build_object('id', b.id, 'brand_name', b.brand_name, 'category', b.category,
        'product_description', b.product_description, 'tags', marketplace.entity_tags_json('brand', b.id))
      from marketplace.brands b where b.id = p_brand_id
    ),
    'candidates', coalesce((
      select jsonb_agg(jsonb_build_object(
        'reviewer_id', r.id, 'name', r.name, 'product_interests', r.product_interests,
        'shared_tag_count', c.shared, 'tags', marketplace.entity_tags_json('reviewer', r.id)
      ) order by c.shared desc, r.created_at)
      from (
        select rt.reviewer_id, count(*) as shared
        from marketplace.reviewer_tags rt
        where rt.tag_id in (select tag_id from marketplace.brand_tags where brand_id = p_brand_id)
        group by rt.reviewer_id
        order by shared desc
        limit greatest(p_lim, 0)
      ) c
      join marketplace.reviewers r on r.id = c.reviewer_id
      where r.archived_at is null and r.age_verified_at is not null
    ), '[]'::jsonb)
  ) into result;
  return result;
end;
$$;

-- ---------------------------------------------------------------------------
-- Surface tags on the admin lists (recreate to add a tags array)
-- ---------------------------------------------------------------------------
create or replace function public.admin_list_reviewers(search text default null, lim integer default 200, off integer default 0)
returns jsonb language plpgsql security definer
set search_path = marketplace, public, pg_temp as $$
declare result jsonb;
begin
  if not public.is_blackwell_admin() then raise exception 'forbidden'; end if;
  select coalesce(jsonb_agg(row order by created_at desc), '[]'::jsonb) into result
  from (
    select r.created_at, jsonb_build_object(
      'id', r.id, 'name', r.name, 'email', r.email, 'niches', r.niches,
      'social_handles', r.social_handles, 'content_link', r.content_link,
      'product_interests', r.product_interests, 'shipping_address', r.shipping_address,
      'source', r.source, 'notes', r.notes, 'bound', (r.auth_user_id is not null),
      'archived_at', r.archived_at, 'created_at', r.created_at,
      'match_count', (select count(*) from marketplace.matches m where m.reviewer_id = r.id),
      'tags', marketplace.entity_tags_json('reviewer', r.id)
    ) as row
    from marketplace.reviewers r
    where search is null or search = '' or r.name ilike '%' || search || '%' or r.email::text ilike '%' || search || '%'
    order by r.created_at desc limit greatest(lim, 0) offset greatest(off, 0)
  ) s;
  return result;
end; $$;

create or replace function public.admin_list_brands(search text default null, lim integer default 200, off integer default 0)
returns jsonb language plpgsql security definer
set search_path = marketplace, public, pg_temp as $$
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
      'match_count', (select count(*) from marketplace.matches m where m.brand_id = b.id),
      'tags', marketplace.entity_tags_json('brand', b.id)
    ) as row
    from marketplace.brands b
    where search is null or search = '' or b.brand_name ilike '%' || search || '%' or b.website ilike '%' || search || '%' or b.contact_email::text ilike '%' || search || '%'
    order by b.created_at desc limit greatest(lim, 0) offset greatest(off, 0)
  ) s;
  return result;
end; $$;

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------
do $$
declare fn text;
begin
  -- authenticated-callable
  foreach fn in array array[
    'public.list_tags(text,integer)', 'public.get_or_create_tag(text,text,text)',
    'public.my_tags()', 'public.add_my_tag(text)', 'public.remove_my_tag(uuid)',
    'public.admin_get_entity_tags(text,uuid)', 'public.admin_add_entity_tag(text,uuid,text)',
    'public.admin_remove_entity_tag(text,uuid,uuid)', 'public.admin_list_tags(text,integer)',
    'public.admin_match_candidates(uuid,integer)'
  ] loop
    execute format('revoke all on function %s from public, anon', fn);
    execute format('grant execute on function %s to authenticated', fn);
  end loop;
  -- service-role only
  execute 'revoke all on function public.apply_ai_tags(text,uuid,text[]) from public, anon, authenticated';
  execute 'grant execute on function public.apply_ai_tags(text,uuid,text[]) to service_role';
end;
$$;
