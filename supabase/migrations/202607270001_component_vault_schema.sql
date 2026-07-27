create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  icon text,
  color text,
  unique(user_id, slug)
);

create table public.components (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  framework text not null default 'React',
  language text not null default 'tsx',
  code text not null,
  styles text,
  usage_code text,
  notes text,
  version text not null default 'v1.0.0',
  is_favorite boolean not null default false,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, slug)
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collection_components (
  collection_id uuid not null references public.collections(id) on delete cascade,
  component_id uuid not null references public.components(id) on delete cascade,
  primary key (collection_id, component_id)
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  unique(user_id, name)
);

create table public.component_tags (
  component_id uuid not null references public.components(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (component_id, tag_id)
);

create table public.component_versions (
  id uuid primary key default gen_random_uuid(),
  component_id uuid not null references public.components(id) on delete cascade,
  version text not null,
  code text not null,
  styles text,
  created_at timestamptz not null default now()
);

create table public.component_usage (
  id uuid primary key default gen_random_uuid(),
  component_id uuid not null references public.components(id) on delete cascade,
  project_name text not null,
  location text not null,
  url text
);

create table public.design_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  name text not null,
  value text not null,
  unique(user_id, type, name)
);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.components enable row level security;
alter table public.collections enable row level security;
alter table public.collection_components enable row level security;
alter table public.tags enable row level security;
alter table public.component_tags enable row level security;
alter table public.component_versions enable row level security;
alter table public.component_usage enable row level security;
alter table public.design_tokens enable row level security;

create policy "profiles own rows" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "categories own rows" on public.categories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "components own or public read" on public.components for select using (auth.uid() = user_id or is_public = true);
create policy "components own write" on public.components for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "collections own rows" on public.collections for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tags own rows" on public.tags for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tokens own rows" on public.design_tokens for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "collection components owned through collection" on public.collection_components
  for all using (
    exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.collections c where c.id = collection_id and c.user_id = auth.uid())
  );

create policy "component tags owned through component" on public.component_tags
  for all using (
    exists (select 1 from public.components c where c.id = component_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.components c where c.id = component_id and c.user_id = auth.uid())
  );

create policy "component versions owned through component" on public.component_versions
  for all using (
    exists (select 1 from public.components c where c.id = component_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.components c where c.id = component_id and c.user_id = auth.uid())
  );

create policy "component usage owned through component" on public.component_usage
  for all using (
    exists (select 1 from public.components c where c.id = component_id and c.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.components c where c.id = component_id and c.user_id = auth.uid())
  );
