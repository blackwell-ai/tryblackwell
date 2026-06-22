-- Layer 1 / Marketplace: reviewers + brands migrated from Giftly.
--
-- Two-sided directory for the GEO marketplace: `reviewers` (people who review
-- gifted product; Giftly's `creators`, renamed) and `brands` (companies in the
-- pipeline). Internal CRM data (emails, outreach notes) => service_role-only,
-- in its own schema that is NOT exposed to the Data API.
--
-- IDs are preserved from Giftly so re-syncs are idempotent and a future
-- migration of products/matches/eval_videos lines up by foreign key.

create schema if not exists marketplace;

-- Backend only. Public API roles never get USAGE on this schema.
grant usage on schema marketplace to service_role;

-- Closed sets carried over from Giftly.
create type marketplace.record_source as enum ('application', 'outreach', 'manual');
create type marketplace.brand_stage   as enum ('cold', 'in_talks', 'done');

-- ---------------------------------------------------------------------------
-- reviewers (Giftly `creators`, renamed)
-- ---------------------------------------------------------------------------
create table marketplace.reviewers (
  id                 uuid primary key,              -- preserved from Giftly
  name               text not null,
  email              citext not null unique,
  social_handles     text,
  platform           text,
  followers          text,                          -- free-form ("10k"); normalize later
  niches             text[] not null default '{}',
  product_interests  text,
  content_link       text,
  shipping_address   text,
  notes              text,
  source             marketplace.record_source not null default 'application',
  reviewed_at        timestamptz,
  archived_at        timestamptz,
  -- Portal-ready, but Giftly auth ids are not portable: imported as NULL and
  -- (re)bound when a reviewer is invited into Blackwell's own auth.
  auth_user_id       uuid references auth.users (id) on delete set null,
  invited_at         timestamptz,
  owner_id           uuid references auth.users (id) on delete set null,
  giftly_synced_at   timestamptz,                   -- provenance: last pull from Giftly
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create unique index reviewers_auth_user_key
  on marketplace.reviewers (auth_user_id) where auth_user_id is not null;
create index reviewers_source_idx   on marketplace.reviewers (source) where archived_at is null;
create index reviewers_archived_idx on marketplace.reviewers (archived_at);

create trigger reviewers_set_updated_at
  before update on marketplace.reviewers
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- brands (Giftly `brands`)
-- ---------------------------------------------------------------------------
create table marketplace.brands (
  id                  uuid primary key,             -- preserved from Giftly
  brand_name          text not null,
  website             text not null unique,
  category            text,
  product_description text,
  contact_name        text not null,
  contact_role        text,
  contact_email       citext not null,
  stage               marketplace.brand_stage   not null default 'cold',
  source              marketplace.record_source not null default 'outreach',
  notes               text,
  reviewed_at         timestamptz,
  archived_at         timestamptz,
  owner_id            uuid references auth.users (id) on delete set null,
  giftly_synced_at    timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index brands_stage_idx  on marketplace.brands (stage)  where archived_at is null;
create index brands_source_idx on marketplace.brands (source) where archived_at is null;

create trigger brands_set_updated_at
  before update on marketplace.brands
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Security: default deny, service_role-only (mirrors Layer 0 sensitive tables).
-- ---------------------------------------------------------------------------
alter table marketplace.reviewers enable row level security;
alter table marketplace.brands    enable row level security;

revoke all on all tables in schema marketplace from anon, authenticated;
grant  all on all tables in schema marketplace to service_role;
-- No policies + no public grants => unreachable by anon/authenticated.
