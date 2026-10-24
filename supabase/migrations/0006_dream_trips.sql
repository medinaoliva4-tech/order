-- Dream income calculator + trip details and country on spots.

create table dream_streams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  source text not null default 'Inherent',
  name text not null,
  price numeric(12,2) not null default 0,
  clients int not null default 0 check (clients >= 0),
  created_at timestamptz not null default now()
);

create table dream_settings (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  goal numeric(12,2) not null default 0,
  currency text not null default 'USD'
);

alter table dream_streams enable row level security;
alter table dream_settings enable row level security;
create policy "own rows" on dream_streams for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own rows" on dream_settings for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Spots: allow the new 'trip' category (and custom ones), plus country and trip links.
alter table spots drop constraint if exists spots_category_check;
alter table spots add column if not exists country text;
alter table spots add column if not exists ticket_link text;
alter table spots add column if not exists stay_link text;
