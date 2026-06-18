-- Layer 0 / Catalog: parent products and their imagery.

-- The current `app/shop/products.ts` rows become products. One row per garment.
create table public.products (
  id          uuid primary key default gen_random_uuid(),
  handle      text not null unique,                       -- url slug + stable identity
  name        text not null,                              -- display name
  category    public.product_category not null,
  description text,
  status      public.product_status not null default 'active',
  position    integer,                                    -- manual sort order in the grid
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint products_handle_format check (handle ~ '^[a-z0-9-]+$')
);

create index products_status_idx on public.products (status);
create index products_category_position_idx on public.products (category, position);

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- Front / back / on-model imagery. Model images are keyed by fit; front/back are not.
create table public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  kind       public.image_kind not null,
  fit        public.fit_type,            -- required iff kind = 'model'
  url        text not null,
  alt        text,
  position   integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- model images must carry a fit; non-model images must not.
  constraint product_images_fit_only_for_model check ((kind = 'model') = (fit is not null))
);

create index product_images_product_idx on public.product_images (product_id);
create index product_images_product_kind_pos_idx on public.product_images (product_id, kind, position);

create trigger product_images_set_updated_at
  before update on public.product_images
  for each row execute function public.set_updated_at();
