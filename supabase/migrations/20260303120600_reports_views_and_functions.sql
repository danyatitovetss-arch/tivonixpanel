-- 7. reports_views_and_functions + audit_logs
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users (id) on delete set null,
  actor_profile_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);

-- Partner balance from transactions
create or replace view public.partner_balances as
select
  p.id as partner_id,
  p.full_name,
  p.email,
  coalesce(sum(bt.amount) filter (where bt.status = 'completed'), 0) as balance,
  coalesce(sum(bt.amount) filter (where bt.status = 'completed' and bt.type = 'accrual'), 0) as total_accrued,
  coalesce(sum(abs(bt.amount)) filter (where bt.status = 'completed' and bt.type = 'payout'), 0) as total_paid_out
from public.profiles p
left join public.balance_transactions bt on bt.partner_id = p.id
where p.role = 'partner'
group by p.id, p.full_name, p.email;

-- Monthly sales (admin)
create or replace view public.monthly_sales as
select
  date_trunc('month', coalesce(d.paid_at, d.closed_at, d.created_at))::date as month,
  count(*) as deals_count,
  sum(d.amount) as total_amount,
  sum(d.commission_amount) filter (where d.commission_status in ('accrued', 'paid')) as total_commission
from public.deals d
where d.payment_status = 'paid'
group by 1
order by 1 desc;

-- Partner dashboard stats (scoped by partner_id in app layer + RLS on underlying tables)
create or replace view public.partner_dashboard_stats as
select
  p.id as partner_id,
  (select count(*) from public.prospect_contacts pc where pc.partner_id = p.id) as prospect_count,
  (select count(*) from public.leads l where l.partner_id = p.id) as lead_count,
  (select count(*) from public.deals d where d.partner_id = p.id and d.payment_status = 'paid') as closed_deals,
  coalesce((select sum(bt.amount) from public.balance_transactions bt where bt.partner_id = p.id and bt.status = 'completed'), 0) as balance
from public.profiles p
where p.role = 'partner';

-- Lead conversion funnel
create or replace view public.lead_conversion_funnel as
select status, count(*) as count
from public.leads
group by status;

-- Top partners
create or replace view public.top_partners as
select
  p.id as partner_id,
  p.full_name,
  count(d.id) filter (where d.payment_status = 'paid') as paid_deals,
  coalesce(sum(d.amount) filter (where d.payment_status = 'paid'), 0) as sales_amount,
  coalesce(sum(d.commission_amount) filter (where d.commission_status in ('accrued', 'paid')), 0) as commission_amount
from public.profiles p
left join public.deals d on d.partner_id = p.id
where p.role = 'partner'
group by p.id, p.full_name
order by sales_amount desc;

-- Audit log helper
create or replace function public.write_audit_log(
  p_action text,
  p_entity_type text,
  p_entity_id uuid default null,
  p_old_value jsonb default null,
  p_new_value jsonb default null,
  p_ip_address text default null,
  p_user_agent text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.audit_logs (
    actor_user_id, actor_profile_id, action, entity_type, entity_id,
    old_value, new_value, ip_address, user_agent
  ) values (
    auth.uid(), public.current_profile_id(), p_action, p_entity_type, p_entity_id,
    p_old_value, p_new_value, p_ip_address, p_user_agent
  )
  returning id into v_id;
  return v_id;
end;
$$;
