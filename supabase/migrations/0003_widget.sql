-- Read-only widget access: a personal token lets the iOS widget (Scriptable) fetch a summary
-- through widget_data() without storing the user's password.

create table widget_tokens (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now()
);

alter table widget_tokens enable row level security;
create policy "own rows" on widget_tokens for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function widget_data(p_token uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  with u as (select user_id from widget_tokens where token = p_token)
  select json_build_object(
    'habits', coalesce((
      select json_agg(json_build_object(
        'name', h.name, 'emoji', h.emoji, 'color', h.color,
        'days', coalesce((
          select json_agg(l.day order by l.day) from habit_logs l
          where l.habit_id = h.id and l.day > current_date - 400
        ), '[]'::json)
      ) order by h.created_at)
      from habits h where h.user_id = (select user_id from u)
    ), '[]'::json),
    'open_tasks', (select count(*) from tasks t where t.user_id = (select user_id from u) and not t.done),
    'next_plan', (
      select json_build_object('title', p.title, 'starts_on', p.starts_on) from plans p
      where p.user_id = (select user_id from u) and p.starts_on >= current_date
      order by p.starts_on limit 1
    )
  )
  where exists (select 1 from u);
$$;

revoke all on function widget_data(uuid) from public;
grant execute on function widget_data(uuid) to anon, authenticated;
