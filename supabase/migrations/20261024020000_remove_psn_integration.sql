-- PSN sync relied on an unofficial API; removed until official integrations (Steam, RetroAchievements) are planned.

drop table public.psn_titles;
drop table public.sync_runs;
drop table public.external_account_tokens;
drop table public.external_accounts;

drop type public.link_status;
drop type public.sync_status;
drop type public.external_provider;
