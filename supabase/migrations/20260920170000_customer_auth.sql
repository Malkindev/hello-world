-- Market Rise Digital customer authentication and customer-owned data.
-- Supabase Auth owns credentials. These tables store only customer profile/data.

do $$
begin
  create type public.app_role as enum ('admin', 'customer');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create table if not exists public.wishlist_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.customer_addresses (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default '',
  location text not null default '',
  address text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.customer_orders (
  id text primary key,
  order_number text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  status text not null default 'Order Received',
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  delivery numeric not null default 0,
  total numeric not null default 0,
  customer jsonb not null default '{}'::jsonb,
  payment_method text not null default '',
  history jsonb not null default '[]'::jsonb
);

create index if not exists customer_orders_user_created_idx
  on public.customer_orders (user_id, created_at desc);

create index if not exists customer_addresses_user_idx
  on public.customer_addresses (user_id);

create index if not exists user_roles_user_idx
  on public.user_roles (user_id);

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.customer_orders enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own" on public.user_roles
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "wishlist_select_own" on public.wishlist_items;
drop policy if exists "wishlist_insert_own" on public.wishlist_items;
drop policy if exists "wishlist_delete_own" on public.wishlist_items;
create policy "wishlist_select_own" on public.wishlist_items
  for select to authenticated using (user_id = auth.uid());
create policy "wishlist_insert_own" on public.wishlist_items
  for insert to authenticated with check (user_id = auth.uid());
create policy "wishlist_delete_own" on public.wishlist_items
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "addresses_select_own" on public.customer_addresses;
drop policy if exists "addresses_insert_own" on public.customer_addresses;
drop policy if exists "addresses_update_own" on public.customer_addresses;
drop policy if exists "addresses_delete_own" on public.customer_addresses;
create policy "addresses_select_own" on public.customer_addresses
  for select to authenticated using (user_id = auth.uid());
create policy "addresses_insert_own" on public.customer_addresses
  for insert to authenticated with check (user_id = auth.uid());
create policy "addresses_update_own" on public.customer_addresses
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "addresses_delete_own" on public.customer_addresses
  for delete to authenticated using (user_id = auth.uid());

drop policy if exists "orders_select_own" on public.customer_orders;
drop policy if exists "orders_insert_own" on public.customer_orders;
create policy "orders_select_own" on public.customer_orders
  for select to authenticated using (user_id = auth.uid());
create policy "orders_insert_own" on public.customer_orders
  for insert to authenticated with check (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

revoke all on function public.has_role(uuid, public.app_role) from public;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

create or replace function public.handle_new_customer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = case
        when excluded.full_name <> '' then excluded.full_name
        else public.profiles.full_name
      end,
      phone = case
        when excluded.phone <> '' then excluded.phone
        else public.profiles.phone
      end,
      updated_at = now();

  insert into public.user_roles (user_id, role)
  values (new.id, 'customer')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_customer();

create or replace function public.touch_profile_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute procedure public.touch_profile_updated_at();
