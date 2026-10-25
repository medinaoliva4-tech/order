-- Dream expenses (tuition, apartment…), monthly or yearly, to know how much income is needed.

create table dream_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  amount numeric(12,2) not null default 0 check (amount >= 0),
  period text not null default 'month' check (period in ('month', 'year')),
  created_at timestamptz not null default now()
);

alter table dream_expenses enable row level security;
create policy "own rows" on dream_expenses for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
