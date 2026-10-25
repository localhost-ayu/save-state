-- Hours belong to each playthrough so yearly totals stay accurate across replays.
alter table public.playthroughs
  add column hours numeric(6, 1) check (hours >= 0 and hours <= 99999);

alter table public.library_entries
  add column expectation smallint check (expectation between 1 and 10),
  drop column playtime_minutes;
