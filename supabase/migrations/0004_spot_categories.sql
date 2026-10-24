-- User-defined spot categories. spots.category holds a built-in key ('run', 'date', 'friend', 'other')
-- or the id of one of these rows.

alter table spots drop constraint if exists spots_category_check;

create table spot_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default '📍',
  created_at timestamptz not null default now()
);

alter table spot_categories enable row level security;
create policy "own rows" on spot_categories for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
