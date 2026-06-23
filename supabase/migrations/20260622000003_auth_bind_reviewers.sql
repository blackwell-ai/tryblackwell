-- Reviewer auth binding + self-read for the reviewer portal.
-- Magic-link login proves email ownership, so an authenticated user is bound to
-- their existing marketplace.reviewers row by matching email. marketplace stays
-- unexposed to the Data API: the portal reads through claim_reviewer()
-- (SECURITY DEFINER, self-scoped to auth.uid(), EXECUTE to authenticated only).

-- 1) Proactive bind: when an auth user is created/confirmed, attach their
--    reviewer row if the email matches and it isn't already bound.
create or replace function marketplace.bind_reviewer_to_auth()
returns trigger
language plpgsql
security definer
set search_path = marketplace, public, pg_temp
as $$
begin
  update marketplace.reviewers r
     set auth_user_id = new.id
   where r.auth_user_id is null
     and new.email is not null
     and r.email = new.email;          -- reviewers.email is citext => case-insensitive
  return new;
end;
$$;

drop trigger if exists on_auth_user_bind_reviewer on auth.users;
create trigger on_auth_user_bind_reviewer
  after insert or update of email_confirmed_at on auth.users
  for each row execute function marketplace.bind_reviewer_to_auth();

-- 2) Portal read path: bind-if-needed (defensive), then return the caller's own
--    reviewer row as jsonb (reviewer-safe fields only; internal CRM fields like
--    notes/owner_id/reviewed_at are never returned). Self-scoped to the caller's
--    auth.uid()/JWT email, so a user can only ever get their own row.
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
  if uid is null then
    return null;
  end if;
  if uemail is not null then
    update marketplace.reviewers r
       set auth_user_id = uid
     where r.auth_user_id is null
       and r.email = uemail;
  end if;
  select jsonb_build_object(
    'id', r.id,
    'name', r.name,
    'email', r.email,
    'social_handles', r.social_handles,
    'platform', r.platform,
    'followers', r.followers,
    'niches', r.niches,
    'product_interests', r.product_interests,
    'content_link', r.content_link,
    'shipping_address', r.shipping_address,
    'created_at', r.created_at
  ) into result
  from marketplace.reviewers r
  where r.auth_user_id = uid
  limit 1;
  return result;
end;
$$;

revoke all on function public.claim_reviewer() from public, anon;
grant execute on function public.claim_reviewer() to authenticated;
