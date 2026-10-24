-- Orders schema. Every row belongs to the authenticated user that created it.
create type order_status as enum ('pending', 'preparing', 'ready', 'delivered', 'cancelled');

create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  customer text not null,
  notes text,
  status order_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0)
);

create index on orders (user_id, created_at desc);
create index on order_items (order_id);

alter table orders enable row level security;
alter table order_items enable row level security;

create policy "own orders" on orders for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own items" on order_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
