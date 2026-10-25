alter table public.profiles
  add column tagline text check (char_length(tagline) <= 80),
  add column links jsonb not null default '[]'::jsonb check (jsonb_typeof(links) = 'array'),
  add column sections jsonb not null default '[]'::jsonb check (jsonb_typeof(sections) = 'array'),
  add column featured_entry_id uuid references public.library_entries (id) on delete set null;

alter table public.library_entries
  add column priority smallint not null default 1 check (priority between 0 and 2);
