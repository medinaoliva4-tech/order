-- Personal organizer: habits, plans, projects, spots. Every row belongs to its creator (RLS).

create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  emoji text not null default '●',
  color text not null default '#e8d77a',
  created_at timestamptz not null default now()
);

create table habit_logs (
  habit_id uuid not null references habits(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  day date not null,
  primary key (habit_id, day)
);

create table plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  place text,
  starts_on date,
  budget numeric(12,2) not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table plan_items (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references plans(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  kind text not null check (kind in ('task', 'expense')),
  title text not null,
  amount numeric(12,2) not null default 0,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#7c9cff',
  created_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  due_on date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table spots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category text not null check (category in ('run', 'date', 'friend', 'other')),
  name text not null,
  detail text,
  link text,
  favorite boolean not null default false,
  created_at timestamptz not null default now()
);

create index on habit_logs (habit_id, day desc);
create index on plan_items (plan_id);
create index on tasks (project_id);
create index on spots (user_id, category);

do $$
declare t text;
begin
  foreach t in array array['habits','habit_logs','plans','plan_items','projects','tasks','spots'] loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy "own rows" on %I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;
