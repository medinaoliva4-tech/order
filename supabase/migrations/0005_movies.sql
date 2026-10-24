-- Movies: favorites and a watchlist. Posters come from the IMDb suggestion search.

create table movies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  list text not null check (list in ('favorite', 'watchlist')),
  title text not null,
  year int,
  kind text,
  poster text,
  imdb_id text,
  created_at timestamptz not null default now()
);

create index on movies (user_id, list, created_at desc);

alter table movies enable row level security;
create policy "own rows" on movies for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
