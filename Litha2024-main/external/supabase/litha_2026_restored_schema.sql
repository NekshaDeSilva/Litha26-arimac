
create extension if not exists pgcrypto;

create table if not exists public.ncloud_users (
  user_key_id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.litha_posts (
  id text primary key,
  postdata_ jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_ncloud_users_touch_updated_at on public.ncloud_users;
create trigger trg_ncloud_users_touch_updated_at
before update on public.ncloud_users
for each row execute function public.touch_updated_at();

drop trigger if exists trg_litha_posts_touch_updated_at on public.litha_posts;
create trigger trg_litha_posts_touch_updated_at
before update on public.litha_posts
for each row execute function public.touch_updated_at();

create or replace function public.ncloud_get_user_by_email(login_email text)
returns table (user_key_id text, payload jsonb)
language sql
security definer
set search_path = public
as $$
  select n.user_key_id, n.payload
  from public.ncloud_users n
  where lower(coalesce(n.payload->'userData'->>'Email','')) = lower(login_email)
  limit 1;
$$;

create or replace function public.ncloud_get_user_by_key(lookup_key text)
returns table (user_key_id text, payload jsonb)
language sql
security definer
set search_path = public
as $$
  select n.user_key_id, n.payload
  from public.ncloud_users n
  where n.user_key_id = lookup_key
  limit 1;
$$;

create or replace function public.increment_litha_post_like(post_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  current_likes integer;
  new_count integer;
begin
  select coalesce((postdata_->>'likeCount')::integer, 0)
    into current_likes
  from public.litha_posts
  where id = post_id;

  new_count := coalesce(current_likes, 0) + 1;

  update public.litha_posts
     set postdata_ = jsonb_set(coalesce(postdata_, '{}'::jsonb), '{likeCount}', to_jsonb(new_count), true),
         updated_at = now()
   where id = post_id;

  return new_count;
end;
$$;

alter table public.ncloud_users enable row level security;
alter table public.litha_posts enable row level security;

drop policy if exists ncloud_users_select_all on public.ncloud_users;
create policy ncloud_users_select_all on public.ncloud_users
for select to anon, authenticated
using (true);

drop policy if exists ncloud_users_insert_all on public.ncloud_users;
create policy ncloud_users_insert_all on public.ncloud_users
for insert to anon, authenticated
with check (true);

drop policy if exists ncloud_users_update_all on public.ncloud_users;
create policy ncloud_users_update_all on public.ncloud_users
for update to anon, authenticated
using (true)
with check (true);

drop policy if exists litha_posts_select_all on public.litha_posts;
create policy litha_posts_select_all on public.litha_posts
for select to anon, authenticated
using (true);

drop policy if exists litha_posts_insert_all on public.litha_posts;
create policy litha_posts_insert_all on public.litha_posts
for insert to anon, authenticated
with check (true);

drop policy if exists litha_posts_update_all on public.litha_posts;
create policy litha_posts_update_all on public.litha_posts
for update to anon, authenticated
using (true)
with check (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.ncloud_users to anon, authenticated;
grant select, insert, update on public.litha_posts to anon, authenticated;
grant execute on function public.ncloud_get_user_by_email(text) to anon, authenticated;
grant execute on function public.ncloud_get_user_by_key(text) to anon, authenticated;
grant execute on function public.increment_litha_post_like(text) to anon, authenticated;
