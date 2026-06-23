-- Reviewers sign up seamlessly (OAuth) — no application. The only gate is an
-- 18+ self-attestation, recorded as age_verified_at for legal purposes. Profile
-- details (interests, shipping) become optional and are filled later.

alter table marketplace.reviewers add column if not exists age_verified_at timestamptz;

-- Surface age_verified_at so the portal knows whether to show the age gate.
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
    'id', r.id, 'name', r.name, 'email', r.email, 'social_handles', r.social_handles,
    'niches', r.niches, 'product_interests', r.product_interests, 'content_link', r.content_link,
    'shipping_address', r.shipping_address, 'age_verified_at', r.age_verified_at,
    'created_at', r.created_at
  ) into result
  from marketplace.reviewers r
  where r.auth_user_id = uid
  limit 1;
  return result;
end;
$$;

-- Seamless join: create the caller's reviewer row if missing and record the
-- 18+ attestation. This is the entire "signup" — no application form.
create or replace function public.join_reviewer(display_name text default null)
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
  if v_id is null then
    select id into v_id from marketplace.reviewers where email = uemail limit 1;
  end if;
  if v_id is null then
    insert into marketplace.reviewers (id, name, email, auth_user_id, source, age_verified_at)
    values (
      gen_random_uuid(),
      coalesce(nullif(display_name, ''), split_part(uemail::text, '@', 1)),
      uemail, uid, 'application', now()
    )
    returning id into v_id;
  else
    update marketplace.reviewers
       set auth_user_id = uid,
           name = case when name is null or name = '' then coalesce(nullif(display_name, ''), name) else name end,
           age_verified_at = coalesce(age_verified_at, now())
     where id = v_id;
  end if;
  return public.claim_reviewer();
end;
$$;

revoke all on function public.join_reviewer(text) from public, anon;
grant execute on function public.join_reviewer(text) to authenticated;

-- Pre-verify the existing demo reviewer so the local preview shows the full
-- portal rather than the gate.
update marketplace.reviewers
   set age_verified_at = now()
 where email = 'demo-reviewer@blackwell.test' and age_verified_at is null;

-- Demo seed: stamp the demo reviewer as age-verified too.
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
    (id, name, email, niches, product_interests, content_link, shipping_address, source, age_verified_at)
  values
    (rid, 'Demo Reviewer', 'demo-reviewer@blackwell.test',
     array['streetwear', 'fitness'], 'Black basics, outerwear, accessories',
     'https://example.com/demo-reviewer', '123 Demo St, Sample City, CA 90000', 'manual', now())
  on conflict (id) do update set
    email = excluded.email,
    age_verified_at = coalesce(marketplace.reviewers.age_verified_at, now());

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
