-- Rate limiting storage + missing status index (safe, additive)

create table if not exists public.rate_limit_buckets (
  bucket_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_buckets_key_created_idx
  on public.rate_limit_buckets (bucket_key, created_at desc);

alter table public.rate_limit_buckets enable row level security;

-- No policies for authenticated/anon — only service_role / security definer

create or replace function public.check_rate_limit(
  p_bucket_key text,
  p_max_requests integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
  v_window interval;
begin
  if p_bucket_key is null or length(trim(p_bucket_key)) = 0 then
    return false;
  end if;
  if p_max_requests is null or p_max_requests < 1 then
    return false;
  end if;
  if p_window_seconds is null or p_window_seconds < 1 then
    return false;
  end if;

  v_window := make_interval(secs => p_window_seconds);

  -- Opportunistic cleanup of old rows for this bucket
  delete from public.rate_limit_buckets
  where bucket_key = p_bucket_key
    and created_at < now() - (v_window * 2);

  select count(*)::integer into v_count
  from public.rate_limit_buckets
  where bucket_key = p_bucket_key
    and created_at >= now() - v_window;

  if v_count >= p_max_requests then
    return false;
  end if;

  insert into public.rate_limit_buckets (bucket_key) values (p_bucket_key);
  return true;
end;
$$;

revoke all on function public.check_rate_limit(text, integer, integer) from public;
revoke all on function public.check_rate_limit(text, integer, integer) from anon, authenticated;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;

create index if not exists profiles_status_idx on public.profiles (status);

comment on function public.check_rate_limit is
  'Distributed rate limiter backed by Postgres. Call only with service role.';
