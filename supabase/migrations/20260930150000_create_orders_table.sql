create table if not exists public.orders (
  id text primary key,
  created_at timestamptz not null default now(),
  status text not null default 'Order Received'
    check (status in ('Order Received', 'Confirmed', 'Processing', 'Dispatched', 'Delivered')),
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  delivery numeric not null default 0,
  total numeric not null default 0,
  customer_user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null default '',
  customer_location text not null,
  customer_address text not null,
  payment_method text not null,
  history jsonb not null default '[]'::jsonb
);

alter table public.orders enable row level security;

drop policy if exists "orders_insert_public" on public.orders;
create policy "orders_insert_public"
  on public.orders
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "orders_select_authenticated" on public.orders;
create policy "orders_select_authenticated"
  on public.orders
  for select
  to authenticated
  using (true);

drop policy if exists "orders_update_authenticated" on public.orders;
create policy "orders_update_authenticated"
  on public.orders
  for update
  to authenticated
  using (true)
  with check (true);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_customer_user_id_idx on public.orders (customer_user_id);
create index if not exists orders_customer_email_idx on public.orders (lower(customer_email));
