create extension if not exists citext with schema extensions;

create type public.game_status as enum ('backlog', 'playing', 'paused', 'shelved', 'dropped', 'completed');
create type public.ownership_type as enum ('physical', 'digital', 'borrowed', 'alternative', 'subscription');
create type public.date_precision as enum ('day', 'month', 'year');
create type public.game_source as enum ('igdb', 'manual');
create type public.external_provider as enum ('psn', 'steam', 'retroachievements', 'xbox');
create type public.sync_status as enum ('running', 'success', 'partial', 'failed');

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username extensions.citext not null unique
    check (username ~ '^[a-zA-Z0-9_.-]{3,30}$'),
  display_name text check (char_length(display_name) <= 60),
  bio text check (char_length(bio) <= 1000),
  avatar_path text,
  banner_path text,
  background_path text,
  accent_color text check (accent_color ~ '^#[0-9a-fA-F]{6}$'),
  theme jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, 'user_' || substr(replace(new.id::text, '-', ''), 1, 12));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_public_profile(profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = profile_id and is_public);
$$;

-- catalog

create table public.games (
  id uuid primary key default gen_random_uuid(),
  source public.game_source not null,
  igdb_id bigint unique,
  title text not null check (char_length(title) between 1 and 300),
  slug text,
  summary text,
  cover_url text,
  release_date date,
  platforms text[] not null default '{}',
  genres text[] not null default '{}',
  franchise text,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((source = 'igdb') = (igdb_id is not null))
);

create index games_title_search_idx on public.games using gin (to_tsvector('simple', title));

create trigger games_updated_at before update on public.games
  for each row execute function public.set_updated_at();

-- library

create table public.library_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  game_id uuid not null references public.games (id) on delete restrict,
  status public.game_status not null default 'backlog',
  status_changed_at timestamptz not null default now(),
  platform text,
  ownership public.ownership_type[] not null default '{}',
  rating numeric(3, 1) check (rating between 0 and 10 and mod(rating * 2, 1) = 0),
  is_platinum boolean not null default false,
  is_favorite boolean not null default false,
  playtime_minutes integer check (playtime_minutes >= 0),
  custom_cover_path text,
  cover_crop jsonb,
  board_position double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, game_id)
);

create index library_entries_user_status_idx on public.library_entries (user_id, status, board_position);

create function public.touch_status_changed_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    new.status_changed_at = now();
  end if;
  return new;
end;
$$;

create trigger library_entries_updated_at before update on public.library_entries
  for each row execute function public.set_updated_at();

create trigger library_entries_status_changed before update on public.library_entries
  for each row execute function public.touch_status_changed_at();

create table public.reviews (
  library_entry_id uuid primary key references public.library_entries (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null,
  is_private boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger reviews_updated_at before update on public.reviews
  for each row execute function public.set_updated_at();

create table public.playthroughs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  library_entry_id uuid not null references public.library_entries (id) on delete cascade,
  started_on date,
  started_precision public.date_precision not null default 'day',
  finished_on date,
  finished_precision public.date_precision not null default 'day',
  outcome public.game_status check (outcome in ('completed', 'dropped')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (finished_on is null or started_on is null or finished_on >= started_on)
);

create index playthroughs_user_timeline_idx on public.playthroughs (user_id, started_on, finished_on);
create index playthroughs_entry_idx on public.playthroughs (library_entry_id);

create trigger playthroughs_updated_at before update on public.playthroughs
  for each row execute function public.set_updated_at();

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  library_entry_id uuid not null references public.library_entries (id) on delete cascade,
  playthrough_id uuid references public.playthroughs (id) on delete set null,
  entry_date date not null default current_date,
  title text check (char_length(title) <= 200),
  body text not null,
  is_private boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index journal_entries_entry_date_idx on public.journal_entries (library_entry_id, entry_date desc);

create trigger journal_entries_updated_at before update on public.journal_entries
  for each row execute function public.set_updated_at();

create table public.screenshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  library_entry_id uuid not null references public.library_entries (id) on delete cascade,
  journal_entry_id uuid references public.journal_entries (id) on delete set null,
  storage_path text not null unique,
  caption text check (char_length(caption) <= 2000),
  taken_at timestamptz,
  width integer,
  height integer,
  is_private boolean not null default false,
  created_at timestamptz not null default now()
);

create index screenshots_entry_idx on public.screenshots (library_entry_id, taken_at);

-- integrations

create table public.external_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  provider public.external_provider not null,
  external_user_id text not null,
  display_name text,
  avatar_url text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create trigger external_accounts_updated_at before update on public.external_accounts
  for each row execute function public.set_updated_at();

create table public.external_account_tokens (
  external_account_id uuid primary key references public.external_accounts (id) on delete cascade,
  access_token text not null,
  access_token_expires_at timestamptz not null,
  refresh_token text not null,
  refresh_token_expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create trigger external_account_tokens_updated_at before update on public.external_account_tokens
  for each row execute function public.set_updated_at();

create table public.psn_titles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  np_communication_id text not null,
  np_service_name text not null,
  title_ids text[] not null default '{}',
  name text not null,
  icon_url text,
  platforms text[] not null default '{}',
  progress smallint not null default 0 check (progress between 0 and 100),
  defined_bronze integer not null default 0,
  defined_silver integer not null default 0,
  defined_gold integer not null default 0,
  defined_platinum smallint not null default 0,
  earned_bronze integer not null default 0,
  earned_silver integer not null default 0,
  earned_gold integer not null default 0,
  earned_platinum smallint not null default 0,
  last_trophy_at timestamptz,
  play_duration_seconds integer,
  first_played_at timestamptz,
  last_played_at timestamptz,
  library_entry_id uuid unique references public.library_entries (id) on delete set null,
  synced_at timestamptz not null default now(),
  unique (user_id, np_communication_id)
);

create index psn_titles_user_idx on public.psn_titles (user_id, last_played_at desc);

create table public.sync_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  provider public.external_provider not null,
  status public.sync_status not null default 'running',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  stats jsonb not null default '{}'::jsonb,
  error text
);

create index sync_runs_user_idx on public.sync_runs (user_id, provider, started_at desc);

-- row level security

create function public.owns_library_entry(entry_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.library_entries where id = entry_id and user_id = (select auth.uid())
  );
$$;


alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.library_entries enable row level security;
alter table public.reviews enable row level security;
alter table public.playthroughs enable row level security;
alter table public.journal_entries enable row level security;
alter table public.screenshots enable row level security;
alter table public.external_accounts enable row level security;
alter table public.external_account_tokens enable row level security;
alter table public.psn_titles enable row level security;
alter table public.sync_runs enable row level security;

create policy "profiles: read own or public" on public.profiles
  for select using (id = (select auth.uid()) or is_public);
create policy "profiles: update own" on public.profiles
  for update using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "games: read all" on public.games
  for select using (true);
create policy "games: authenticated insert" on public.games
  for insert to authenticated
  with check (source = 'igdb' or created_by = (select auth.uid()));
create policy "games: update own manual" on public.games
  for update to authenticated
  using (source = 'manual' and created_by = (select auth.uid()))
  with check (source = 'manual' and created_by = (select auth.uid()));

create policy "library_entries: owner" on public.library_entries
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "library_entries: public read" on public.library_entries
  for select using (public.is_public_profile(user_id));

create policy "reviews: owner" on public.reviews
  for all using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and public.owns_library_entry(library_entry_id));
create policy "reviews: public read" on public.reviews
  for select using (not is_private and public.is_public_profile(user_id));

create policy "playthroughs: owner" on public.playthroughs
  for all using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and public.owns_library_entry(library_entry_id));
create policy "playthroughs: public read" on public.playthroughs
  for select using (public.is_public_profile(user_id));

create policy "journal_entries: owner" on public.journal_entries
  for all using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and public.owns_library_entry(library_entry_id));
create policy "journal_entries: public read" on public.journal_entries
  for select using (not is_private and public.is_public_profile(user_id));

create policy "screenshots: owner" on public.screenshots
  for all using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and public.owns_library_entry(library_entry_id));
create policy "screenshots: public read" on public.screenshots
  for select using (not is_private and public.is_public_profile(user_id));

create policy "external_accounts: owner" on public.external_accounts
  for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "psn_titles: owner read" on public.psn_titles
  for select using (user_id = (select auth.uid()));
create policy "psn_titles: owner link" on public.psn_titles
  for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "psn_titles: public read" on public.psn_titles
  for select using (public.is_public_profile(user_id));

create policy "sync_runs: owner read" on public.sync_runs
  for select using (user_id = (select auth.uid()));

-- storage

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif']
);

create policy "media: owner insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "media: owner update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "media: owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);
