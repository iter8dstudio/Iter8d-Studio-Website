alter table posts add column if not exists slug text;

with s as (
  select id,
         coalesce(nullif(trim(both '-' from lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'))), ''), id) as base
  from posts where slug is null
), r as (
  select id, base, row_number() over (partition by base order by id) as rn from s
)
update posts p
set slug = case when r.rn = 1 then r.base else r.base || '-' || r.rn end
from r where p.id = r.id;

create unique index if not exists posts_slug_key on posts (slug);
