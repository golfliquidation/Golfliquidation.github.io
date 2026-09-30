-- Golf Liquidation: Supabase schema (run in SQL editor)

create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'host', 'viewer');
create type public.inventory_source as enum (
  'shop_closeout',
  'fitting_studio',
  'wholesaler',
  'estate',
  'other'
);
create type public.inventory_status as enum (
  'acquired',
  'inspected',
  'in_stock',
  'listed',
  'sold',
  'archived'
);
create type public.item_condition as enum (
  'new',
  'like_new',
  'excellent',
  'good',
  'fair',
  'as_is'
);
create type public.item_category as enum (
  'drivers',
  'fairway_woods',
  'hybrids',
  'irons',
  'wedges',
  'putters',
  'bags',
  'apparel',
  'balls',
  'accessories',
  'sets',
  'other'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'viewer',
  display_name text,
  created_at timestamptz not null default now()
);

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  sku text,
  quantity integer not null default 1,
  title text not null,
  description text,
  category public.item_category not null default 'other',
  condition public.item_condition not null default 'good',
  brand text,
  source_type public.inventory_source not null default 'shop_closeout',
  source_detail text,
  acquisition_date date,
  cost_cents integer,
  price_cents integer not null default 0,
  status public.inventory_status not null default 'acquired',
  published boolean not null default false,
  slug text,
  photo_urls jsonb not null default '[]'::jsonb,
  notes text,
  buyer_name text,
  sold_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index inventory_items_slug_key on public.inventory_items (slug)
where slug is not null;

create unique index inventory_items_sku_key on public.inventory_items (sku)
where sku is not null;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('admin', 'host')
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (new.id, 'viewer', coalesce(new.raw_user_meta_data ->> 'display_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.inventory_items enable row level security;

create policy "Profiles: users read own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles: staff read all"
  on public.profiles for select
  using (public.is_staff());

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create policy "Profiles: admin update roles"
  on public.profiles for update
  using (public.is_admin());

create policy "Inventory: public read published"
  on public.inventory_items for select
  using (
    published = true
    and status in ('listed', 'in_stock')
  );

create policy "Inventory: staff read all"
  on public.inventory_items for select
  using (public.is_staff());

create policy "Inventory: staff insert"
  on public.inventory_items for insert
  with check (public.is_staff());

create policy "Inventory: staff update"
  on public.inventory_items for update
  using (public.is_staff())
  with check (public.is_staff());

create policy "Inventory: staff delete"
  on public.inventory_items for delete
  using (public.is_staff());

insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

create policy "Photos: public read"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

create policy "Photos: staff upload"
  on storage.objects for insert
  with check (bucket_id = 'listing-photos' and public.is_staff());

create policy "Photos: staff update"
  on storage.objects for update
  using (bucket_id = 'listing-photos' and public.is_staff());

create policy "Photos: staff delete"
  on storage.objects for delete
  using (bucket_id = 'listing-photos' and public.is_staff());

-- After creating your first auth user, promote to admin:
-- update public.profiles set role = 'admin' where id = '<your-user-uuid>';
