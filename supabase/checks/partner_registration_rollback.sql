-- Rollback / recovery plan for partner self-registration migrations.
-- Enum ADD VALUE cannot be dropped safely in Postgres — do not attempt to remove
-- pending/rejected/suspended labels after they have been used.
-- Prefer restoring from backup if the release must be fully reversed.

-- A) Soft rollback of app behavior without dropping enums:
--    1. Redeploy previous application revision (without /register flow).
--    2. Keep additive DB columns (nullable) — they are backward compatible.
--    3. Optionally revert handle_new_user to previous definition if needed.

-- B) Restore handle_new_user to pre-registration behavior (service role / SQL Editor):
/*
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, 'user'), '@', 1))
  );
  return new;
end;
$$;

alter table public.profiles alter column status set default 'active';
*/

-- C) If a migration transaction failed mid-way:
--    - Enum migration (000000) may have committed separately — that is OK and additive.
--    - Re-run 000001 / 000002 after fixing the error (all statements are IF NOT EXISTS / CREATE OR REPLACE).
--    - Existing profile rows are not deleted by these migrations.

-- D) Emergency: set wrongly-pending accounts back to active (admins/partners created during outage)
/*
update public.profiles
set status = 'active'
where role in ('admin', 'manager')
  and status = 'pending';
*/

-- E) Full restore from backup (preferred if data corruption suspected):
--    pg_restore --clean --if-exists --dbname="$DATABASE_URL" tivonixpanel-pre-partner-reg.dump
