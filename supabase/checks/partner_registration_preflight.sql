-- Preflight checks BEFORE applying partner registration migrations.
-- Run in Supabase SQL Editor (read-only). Do not apply migrations yet.

-- 1) Current status distribution (must only contain existing enum values)
select status, count(*) as cnt
from public.profiles
group by status
order by cnt desc;

-- 2) Role distribution
select role, count(*) as cnt
from public.profiles
group by role
order by cnt desc;

-- 3) Admins must remain active (expect 0 rows)
select id, email, role, status
from public.profiles
where role = 'admin' and status is distinct from 'active';

-- 4) Partners / managers currently non-active (inventory only)
select id, email, role, status, created_at
from public.profiles
where status <> 'active'
order by created_at desc
limit 100;

-- 5) Duplicate emails (case-insensitive) — migration itself does not fix these
select lower(email) as email_l, count(*) as cnt
from public.profiles
group by lower(email)
having count(*) > 1;

-- 6) Confirm enum labels currently present
select e.enumlabel
from pg_enum e
join pg_type t on t.oid = e.enumtypid
join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public' and t.typname = 'user_status'
order by e.enumsortorder;

-- 7) Confirm partner_type does not already exist under a conflicting definition
select n.nspname, t.typname, t.typtype
from pg_type t
join pg_namespace n on n.oid = t.typnamespace
where t.typname = 'partner_type';

-- 8) Confirm profiles columns that migration will add are absent (or already compatible)
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'profiles'
  and column_name in (
    'partner_type',
    'agency_name',
    'website_url',
    'commission_percent_override',
    'partnership_notes',
    'assigned_manager_id',
    'reviewed_at',
    'reviewed_by',
    'rejection_reason'
  )
order by column_name;

-- 9) Active legal documents needed for registration acceptances
select type, version, status
from public.legal_documents
where type in ('terms', 'privacy') and status = 'active'
order by type;

-- 10) Backup hint (run outside SQL Editor if you have shell access)
-- pg_dump "$DATABASE_URL" --format=custom --file=tivonixpanel-pre-partner-reg.dump
