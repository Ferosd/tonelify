-- Atomic monthly match-usage counter.
-- Run this once in the Supabase SQL editor. Until it exists, the app
-- falls back to a read-modify-write update (slightly racy under
-- concurrent requests, but functional).

create or replace function public.increment_match_usage(p_user_id text, p_month text)
returns void
language sql
security definer
set search_path = public
as $$
    insert into public.match_usage (user_id, month, match_count, updated_at)
    values (p_user_id, p_month, 1, now())
    on conflict (user_id, month)
    do update set
        match_count = match_usage.match_count + 1,
        updated_at = now();
$$;

-- Requires a unique constraint for the upsert:
-- alter table public.match_usage add constraint match_usage_user_month_key unique (user_id, month);
