-- Article view tracking (basic analytics)
create table if not exists post_views (
  id        bigint generated always as identity primary key,
  slug      text not null check (char_length(slug) between 1 and 120),
  viewed_at timestamptz not null default now()
);

create index if not exists post_views_slug_time on post_views (slug, viewed_at desc);

alter table post_views enable row level security;

drop policy if exists "Anyone can record a view" on post_views;
drop policy if exists "Admin can read views" on post_views;

-- The website (public key) may add a view, but can never read or change them
create policy "Anyone can record a view"
  on post_views for insert
  to anon, authenticated
  with check (char_length(slug) between 1 and 120);

-- Only the signed-in admin can read view data
create policy "Admin can read views"
  on post_views for select
  to authenticated
  using (true);

-- Summary used by the admin dashboard
create or replace function post_view_stats()
returns table (slug text, views_7d bigint, views_30d bigint, views_all bigint)
language sql stable security invoker
as $$
  select v.slug,
         count(*) filter (where v.viewed_at >= now() - interval '7 days'),
         count(*) filter (where v.viewed_at >= now() - interval '30 days'),
         count(*)
  from post_views v
  group by v.slug;
$$;

revoke execute on function post_view_stats() from public, anon;
grant  execute on function post_view_stats() to authenticated;
