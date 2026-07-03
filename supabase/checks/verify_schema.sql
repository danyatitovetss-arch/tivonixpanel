-- verify_schema.sql — запустить в Supabase SQL Editor после миграций

-- Tables
select tablename from pg_tables where schemaname = 'public' order by tablename;

-- Enums
select t.typname as enum_name, e.enumlabel as enum_value
from pg_type t
join pg_enum e on t.oid = e.enumtypid
join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public'
order by enum_name, enumsortorder;

-- Functions (public)
select routine_name
from information_schema.routines
where routine_schema = 'public'
order by routine_name;

-- Views
select table_name from information_schema.views where table_schema = 'public' order by table_name;

-- Tables WITHOUT RLS (should be empty for private tables)
select c.relname as table_name
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relrowsecurity = false
  and c.relname not in ('schema_migrations')
order by c.relname;

-- RLS policies count
select schemaname, tablename, count(*) as policy_count
from pg_policies
where schemaname = 'public'
group by schemaname, tablename
order by tablename;

-- Active legal documents
select type, version, status, published_at
from public.legal_documents
where status = 'active'
order by type;

-- Commission settings
select * from public.commission_settings limit 5;

-- Indexes (sample)
select indexname, tablename from pg_indexes where schemaname = 'public' order by tablename, indexname;

-- Duplicate function names
select routine_name, count(*)
from information_schema.routines
where routine_schema = 'public'
group by routine_name
having count(*) > 1;

-- Required helper functions
select proname from pg_proc p
join pg_namespace n on p.pronamespace = n.oid
where n.nspname = 'public'
  and proname in (
    'current_profile_id',
    'current_user_role',
    'is_admin',
    'is_manager',
    'is_partner',
    'promote_admin_by_email',
    'calculate_commission',
    'mark_deal_as_paid',
    'write_audit_log',
    'find_duplicate_lead'
  )
order by proname;

-- Required tables check
select unnest(array[
  'profiles','legal_documents','legal_acceptances','user_legal_profiles','consent_events',
  'prospect_contacts','prospect_activities','leads','lead_activities','deals','payouts',
  'balance_transactions','commission_settings','audit_logs'
]) as required_table
except
select tablename from pg_tables where schemaname = 'public';

-- Required views check
select unnest(array[
  'partner_balances','monthly_sales','partner_dashboard_stats','lead_conversion_funnel','top_partners'
]) as required_view
except
select table_name from information_schema.views where table_schema = 'public';
