create type public.link_status as enum ('pending', 'linked', 'needs_review', 'ignored');

alter table public.psn_titles
  add column link_status public.link_status not null default 'pending';

update public.psn_titles set link_status = 'linked' where library_entry_id is not null;

create index psn_titles_link_status_idx on public.psn_titles (user_id, link_status);

-- PS4 and PS5 versions of a game have separate trophy lists but share one library entry.
alter table public.psn_titles drop constraint psn_titles_library_entry_id_key;
create index psn_titles_library_entry_idx on public.psn_titles (library_entry_id);
