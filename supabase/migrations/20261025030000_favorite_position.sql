alter table public.library_entries
  add column favorite_position double precision;

with ranked as (
  select id, row_number() over (partition by user_id order by status_changed_at) as position
  from public.library_entries
  where is_favorite
)
update public.library_entries entry
set favorite_position = ranked.position
from ranked
where entry.id = ranked.id;
