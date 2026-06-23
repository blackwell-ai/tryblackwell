-- Layer 1 / Marketplace, part 2: matches + brand auth + admin gating.
--
-- Adds the admin-curated reviewer<->brand pairing table, gives brands the same
-- auth-binding columns reviewers already have (so a brand contact can log in to
-- a brand portal), and establishes who counts as a Blackwell admin. The
-- marketplace schema stays unexposed to the Data API; all app access continues
-- to flow through public SECURITY DEFINER RPCs (see ...000005).

-- ---------------------------------------------------------------------------
-- brands: auth binding (mirror reviewers)
-- ---------------------------------------------------------------------------
alter table marketplace.brands
  add column if not exists auth_user_id uuid references auth.users (id) on delete set null,
  add column if not exists invited_at   timestamptz;

create unique index if not exists brands_auth_user_key
  on marketplace.brands (auth_user_id) where auth_user_id is not null;

-- ---------------------------------------------------------------------------
-- matches: admin-curated reviewer <-> brand pairings
-- ---------------------------------------------------------------------------
create type marketplace.match_status as enum (
  'suggested',   -- admin proposed it
  'invited',     -- reviewer/brand notified
  'accepted',
  'declined',
  'shipped',     -- product sent to reviewer
  'reviewed',    -- review/content delivered
  'completed',
  'cancelled'
);

create table marketplace.matches (
  id          uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references marketplace.reviewers (id) on delete cascade,
  brand_id    uuid not null references marketplace.brands (id)    on delete cascade,
  status      marketplace.match_status not null default 'suggested',
  notes       text,
  created_by  uuid references auth.users (id) on delete set null,   -- admin who paired them
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (reviewer_id, brand_id)
);
create index matches_reviewer_idx on marketplace.matches (reviewer_id);
create index matches_brand_idx    on marketplace.matches (brand_id);
create index matches_status_idx   on marketplace.matches (status);

create trigger matches_set_updated_at
  before update on marketplace.matches
  for each row execute function public.set_updated_at();

-- Default deny, service_role-only (mirrors reviewers/brands). Reached only
-- through the public SECURITY DEFINER RPCs.
alter table marketplace.matches enable row level security;
revoke all on marketplace.matches from anon, authenticated;
grant  all on marketplace.matches to service_role;

-- ---------------------------------------------------------------------------
-- admin allowlist + predicate
-- ---------------------------------------------------------------------------
-- Admins are anyone on a @blackwell.com address, plus explicit allowlist rows
-- (so the founders can use the console before the domain mailboxes exist).
create table if not exists marketplace.app_admins (
  email      citext primary key,
  note       text,
  created_at timestamptz not null default now()
);
alter table marketplace.app_admins enable row level security;
revoke all on marketplace.app_admins from anon, authenticated;
grant  all on marketplace.app_admins to service_role;

insert into marketplace.app_admins (email, note)
values ('jianyuai2026@gmail.com', 'founder — seeded for console access')
on conflict (email) do nothing;

create or replace function public.is_blackwell_admin()
returns boolean
language sql
stable
security definer
set search_path = marketplace, public, pg_temp
as $$
  select coalesce(
    lower(auth.jwt() ->> 'email') like '%@blackwell.com'
    or exists (
      select 1 from marketplace.app_admins a
      where a.email = nullif(auth.jwt() ->> 'email', '')::citext
    ),
    false
  );
$$;

revoke all on function public.is_blackwell_admin() from public, anon;
grant execute on function public.is_blackwell_admin() to authenticated;
