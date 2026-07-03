
-- ========== 20260303120000_initial_extensions_and_enums.sql ==========

-- 1. initial_extensions_and_enums
create extension if not exists "pgcrypto";

-- Roles & status
create type public.user_role as enum ('admin', 'manager', 'partner');
create type public.user_status as enum ('active', 'inactive', 'blocked');

-- Legal
create type public.legal_document_type as enum (
  'terms',
  'privacy',
  'personal_data_consent',
  'partner_agreement',
  'commission_rules',
  'cookies'
);
create type public.document_status as enum ('draft', 'active', 'archived');
create type public.partner_legal_status as enum ('individual', 'self_employed', 'company');
create type public.payout_preference as enum ('card', 'bank', 'usdt', 'other');
create type public.onboarding_status as enum (
  'not_started',
  'in_progress',
  'completed',
  'blocked_under_16',
  'requires_reaccept'
);
create type public.payout_status as enum (
  'pending_admin_review',
  'approved',
  'blocked',
  'suspended'
);
create type public.consent_event_type as enum (
  'document_accepted',
  'onboarding_started',
  'onboarding_completed',
  'document_reaccepted',
  'access_blocked',
  'access_restored'
);

-- Prospecting
create type public.prospect_source as enum (
  '2gis',
  'google_maps',
  'instagram',
  'threads',
  'telegram',
  'company_website',
  'kwork',
  'fiverr',
  'upwork',
  'freelancer',
  'acquaintances',
  'other'
);
create type public.prospect_status as enum (
  'new',
  'needs_check',
  'checked',
  'duplicate',
  'not_relevant',
  'ready_to_message',
  'messaged',
  'follow_up_needed',
  'replied',
  'converted_to_lead',
  'do_not_contact'
);
create type public.website_quality as enum (
  'no_website',
  'bad',
  'average',
  'good',
  'unknown'
);
create type public.priority_level as enum ('low', 'medium', 'high');

-- Leads
create type public.service_type as enum (
  'landing',
  'website',
  'telegram_bot',
  'crm',
  'ai_automation',
  'design',
  'project_rework',
  'other'
);
create type public.lead_status as enum (
  'pending_review',
  'approved',
  'rejected',
  'duplicate',
  'do_not_contact',
  'contacted',
  'replied',
  'interested',
  'sent_to_team',
  'offer_sent',
  'won',
  'lost',
  'no_response'
);
create type public.admin_review_status as enum (
  'pending',
  'approved',
  'rejected',
  'duplicate',
  'do_not_contact'
);

-- Deals & finance
create type public.payment_status as enum (
  'draft',
  'waiting_payment',
  'paid',
  'cancelled',
  'refunded'
);
create type public.commission_status as enum (
  'not_accrued',
  'pending',
  'accrued',
  'paid',
  'cancelled'
);
create type public.balance_transaction_type as enum (
  'accrual',
  'payout',
  'correction',
  'cancellation'
);
create type public.balance_transaction_status as enum (
  'pending',
  'completed',
  'cancelled'
);
create type public.payout_record_status as enum ('pending', 'paid', 'cancelled');


-- ========== 20260303120100_profiles_and_roles.sql ==========

-- 2. profiles_and_roles
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null unique,
  full_name text,
  email text not null,
  telegram text,
  phone text,
  role public.user_role not null default 'partner',
  status public.user_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_user_id_idx on public.profiles (user_id);
create index profiles_role_idx on public.profiles (role);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS helper stubs (implemented fully in migration 8)
create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where user_id = auth.uid() limit 1;
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where user_id = auth.uid() limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'manager' and status = 'active'
  );
$$;

create or replace function public.is_partner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'partner' and status = 'active'
  );
$$;


-- ========== 20260303120200_legal_documents_and_acceptances.sql ==========

-- 3. legal_documents_and_acceptances
create table public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  type public.legal_document_type not null,
  title text not null,
  version text not null,
  content text not null,
  status public.document_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (type, version)
);

create table public.legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null,
  document_type public.legal_document_type not null,
  document_version text not null,
  accepted_at timestamptz not null default now(),
  ip_address text,
  user_agent text,
  acceptance_method text not null default 'checkbox',
  consent_text_snapshot text,
  policy_url text,
  is_active boolean not null default true
);

create index legal_acceptances_user_id_idx on public.legal_acceptances (user_id);
create index legal_acceptances_active_idx on public.legal_acceptances (user_id, document_type, is_active);

create table public.user_legal_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null unique,
  full_name text not null,
  email text not null,
  telegram text,
  phone text,
  city text,
  country text not null,
  tax_residence_country text not null,
  date_of_birth date not null,
  age int not null,
  partner_legal_status public.partner_legal_status not null default 'individual',
  unp text,
  organization_name text,
  payout_preference public.payout_preference,
  preferred_currency text default 'USD',
  onboarding_status public.onboarding_status not null default 'not_started',
  crm_access boolean not null default false,
  payout_status public.payout_status not null default 'pending_admin_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consent_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade not null,
  event_type public.consent_event_type not null,
  document_type public.legal_document_type,
  document_version text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create trigger legal_documents_updated_at
  before update on public.legal_documents
  for each row execute function public.handle_updated_at();

create trigger user_legal_profiles_updated_at
  before update on public.user_legal_profiles
  for each row execute function public.handle_updated_at();

-- Check if user has accepted all active required documents
create or replace function public.user_has_current_legal_acceptances(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1
    from public.legal_documents ld
    where ld.status = 'active'
      and ld.type in (
        'terms', 'privacy', 'personal_data_consent',
        'partner_agreement', 'commission_rules', 'cookies'
      )
      and not exists (
        select 1 from public.legal_acceptances la
        where la.user_id = p_user_id
          and la.document_type = ld.type
          and la.document_version = ld.version
          and la.is_active = true
      )
  );
$$;


-- ========== 20260303120300_prospecting_contacts.sql ==========

-- 4. prospecting_contacts (lead FKs added in migration 5)
create table public.prospect_contacts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.profiles (id) on delete cascade not null,
  business_name text not null,
  niche text,
  city text,
  source text,
  website text,
  instagram text,
  telegram text,
  phone text,
  email text,
  contact_person text,
  status public.prospect_status not null default 'new',
  priority public.priority_level not null default 'medium',
  website_quality public.website_quality not null default 'unknown',
  has_website boolean,
  has_online_booking boolean default false,
  has_telegram_bot boolean default false,
  has_crm boolean default false,
  pain_points text,
  message_template_used text,
  first_message_sent_at timestamptz,
  follow_up_at timestamptz,
  last_action_at timestamptz,
  notes text,
  duplicate_lead_id uuid,
  converted_lead_id uuid,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index prospect_contacts_partner_id_idx on public.prospect_contacts (partner_id);
create index prospect_contacts_status_idx on public.prospect_contacts (status);
create index prospect_contacts_follow_up_idx on public.prospect_contacts (follow_up_at)
  where follow_up_at is not null;

create table public.prospect_activities (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references public.prospect_contacts (id) on delete cascade not null,
  user_id uuid references public.profiles (id) not null,
  action_type text not null,
  comment text,
  created_at timestamptz not null default now()
);

create index prospect_activities_prospect_id_idx on public.prospect_activities (prospect_id);

create trigger prospect_contacts_updated_at
  before update on public.prospect_contacts
  for each row execute function public.handle_updated_at();


-- ========== 20260303120400_leads_and_activities.sql ==========

-- 5. leads_and_activities
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  niche text,
  city text,
  contact_name text,
  instagram_url text,
  telegram_username text,
  phone text,
  email text,
  website text,
  source text,
  service_type public.service_type,
  estimated_budget numeric,
  currency text not null default 'USD',
  status public.lead_status not null default 'pending_review',
  priority public.priority_level not null default 'medium',
  partner_id uuid references public.profiles (id) on delete restrict not null,
  assigned_manager_id uuid references public.profiles (id),
  admin_review_status public.admin_review_status not null default 'pending',
  admin_review_comment text,
  next_action text,
  last_contact_at timestamptz,
  reserved_until timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads (id) on delete cascade not null,
  user_id uuid references public.profiles (id) not null,
  action_type text not null,
  comment text,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

create index leads_partner_id_idx on public.leads (partner_id);
create index leads_status_idx on public.leads (status);
create index leads_admin_review_idx on public.leads (admin_review_status);
create index lead_activities_lead_id_idx on public.lead_activities (lead_id);

-- Prospect FKs to leads
alter table public.prospect_contacts
  add constraint prospect_contacts_duplicate_lead_id_fkey
    foreign key (duplicate_lead_id) references public.leads (id) on delete set null,
  add constraint prospect_contacts_converted_lead_id_fkey
    foreign key (converted_lead_id) references public.leads (id) on delete set null;

create trigger leads_updated_at
  before update on public.leads
  for each row execute function public.handle_updated_at();

-- Duplicate check helper (security invoker вЂ” RLS applies)
create or replace function public.find_duplicate_lead(
  p_business_name text,
  p_website text default null,
  p_instagram text default null,
  p_telegram text default null,
  p_phone text default null,
  p_email text default null,
  p_exclude_lead_id uuid default null
)
returns table (
  lead_id uuid,
  business_name text,
  matched_field text
)
language plpgsql
stable
security invoker
set search_path = public
as $$
begin
  return query
  select l.id, l.business_name,
    case
      when p_email is not null and lower(trim(p_email)) <> '' and lower(l.email) = lower(trim(p_email)) then 'email'
      when p_phone is not null and trim(p_phone) <> '' and regexp_replace(l.phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g') then 'phone'
      when p_website is not null and trim(p_website) <> '' and lower(regexp_replace(l.website, '^https?://(www\.)?', '')) = lower(regexp_replace(p_website, '^https?://(www\.)?', '')) then 'website'
      when p_instagram is not null and trim(p_instagram) <> '' and lower(l.instagram_url) = lower(trim(p_instagram)) then 'instagram'
      when p_telegram is not null and trim(p_telegram) <> '' and lower(l.telegram_username) = lower(trim(p_telegram)) then 'telegram'
      when p_business_name is not null and lower(trim(l.business_name)) = lower(trim(p_business_name)) then 'business_name'
      else 'unknown'
    end as matched_field
  from public.leads l
  where (p_exclude_lead_id is null or l.id <> p_exclude_lead_id)
    and (
      (p_email is not null and lower(trim(p_email)) <> '' and lower(l.email) = lower(trim(p_email)))
      or (p_phone is not null and trim(p_phone) <> '' and regexp_replace(l.phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g'))
      or (p_website is not null and trim(p_website) <> '' and lower(regexp_replace(l.website, '^https?://(www\.)?', '')) = lower(regexp_replace(p_website, '^https?://(www\.)?', '')))
      or (p_instagram is not null and trim(p_instagram) <> '' and lower(l.instagram_url) = lower(trim(p_instagram)))
      or (p_telegram is not null and trim(p_telegram) <> '' and lower(l.telegram_username) = lower(trim(p_telegram)))
      or (p_business_name is not null and lower(trim(l.business_name)) = lower(trim(p_business_name)))
    )
  limit 1;
end;
$$;


-- ========== 20260303120500_deals_commissions_balance_payouts.sql ==========

-- 6. deals_commissions_balance_payouts
create table public.commission_settings (
  id uuid primary key default gen_random_uuid(),
  base_percent_under_2000 numeric not null default 10 check (base_percent_under_2000 >= 0 and base_percent_under_2000 <= 100),
  base_percent_from_2000 numeric not null default 15 check (base_percent_from_2000 >= 0 and base_percent_from_2000 <= 100),
  bonus_after_closed_deals int not null default 3 check (bonus_after_closed_deals >= 0),
  bonus_percent numeric not null default 10 check (bonus_percent >= 0 and bonus_percent <= 100),
  currency text not null default 'USD',
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads (id) on delete restrict not null,
  partner_id uuid references public.profiles (id) on delete restrict not null,
  client_name text not null,
  service_type public.service_type,
  amount numeric not null check (amount > 0),
  currency text not null default 'USD',
  commission_percent numeric not null check (commission_percent >= 0),
  commission_amount numeric not null check (commission_amount >= 0),
  partner_closed_deals_count_at_moment int not null default 0,
  bonus_applied boolean not null default false,
  payment_status public.payment_status not null default 'waiting_payment',
  commission_status public.commission_status not null default 'not_accrued',
  closed_at timestamptz,
  paid_at timestamptz,
  notes text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.profiles (id) on delete restrict not null,
  amount numeric not null check (amount > 0),
  currency text not null default 'USD',
  status public.payout_record_status not null default 'pending',
  payment_method text,
  payment_details text,
  admin_comment text,
  paid_at timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.balance_transactions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.profiles (id) on delete restrict not null,
  deal_id uuid references public.deals (id) on delete set null,
  payout_id uuid references public.payouts (id) on delete set null,
  type public.balance_transaction_type not null,
  amount numeric not null,
  currency text not null default 'USD',
  status public.balance_transaction_status not null default 'completed',
  description text,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  constraint balance_transactions_deal_accrual_unique unique (deal_id, type)
);

create index deals_partner_id_idx on public.deals (partner_id);
create index deals_lead_id_idx on public.deals (lead_id);
create index deals_payment_status_idx on public.deals (payment_status);
create index payouts_partner_id_idx on public.payouts (partner_id);
create index balance_transactions_partner_id_idx on public.balance_transactions (partner_id);

create trigger deals_updated_at
  before update on public.deals
  for each row execute function public.handle_updated_at();

create trigger payouts_updated_at
  before update on public.payouts
  for each row execute function public.handle_updated_at();

-- Commission calculation
create or replace function public.calculate_commission(
  p_amount numeric,
  p_partner_id uuid
)
returns table (
  base_percent numeric,
  bonus_percent numeric,
  total_percent numeric,
  commission_amount numeric,
  bonus_applied boolean,
  closed_deals_count int
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_settings public.commission_settings%rowtype;
  v_closed int;
  v_base numeric;
  v_bonus numeric := 0;
  v_total numeric;
  v_commission numeric;
begin
  select * into v_settings
  from public.commission_settings
  where is_active = true
  order by updated_at desc
  limit 1;

  if not found then
    v_settings.base_percent_under_2000 := 10;
    v_settings.base_percent_from_2000 := 15;
    v_settings.bonus_after_closed_deals := 3;
    v_settings.bonus_percent := 10;
  end if;

  select count(*)::int into v_closed
  from public.deals d
  where d.partner_id = p_partner_id
    and d.payment_status = 'paid'
    and d.commission_status in ('accrued', 'paid');

  v_base := case when p_amount < 2000 then v_settings.base_percent_under_2000 else v_settings.base_percent_from_2000 end;

  if v_closed >= v_settings.bonus_after_closed_deals then
    v_bonus := v_settings.bonus_percent;
  end if;

  v_total := v_base + v_bonus;
  v_commission := round(p_amount * v_total / 100, 2);

  return query select v_base, v_bonus, v_total, v_commission, v_bonus > 0, v_closed;
end;
$$;

-- Mark deal paid + accrue commission (admin only)
create or replace function public.mark_deal_as_paid(p_deal_id uuid)
returns public.deals
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deal public.deals%rowtype;
  v_calc record;
  v_profile_id uuid;
begin
  if not public.is_admin() then
    raise exception 'forbidden: admin only';
  end if;

  select * into v_deal from public.deals where id = p_deal_id for update;
  if not found then
    raise exception 'deal not found';
  end if;

  if v_deal.payment_status = 'paid' then
    if exists (
      select 1 from public.balance_transactions
      where deal_id = p_deal_id and type = 'accrual' and status = 'completed'
    ) then
      return v_deal;
    end if;
  end if;

  select * into v_calc from public.calculate_commission(v_deal.amount, v_deal.partner_id);
  v_profile_id := public.current_profile_id();

  update public.deals set
    payment_status = 'paid',
    commission_status = 'accrued',
    commission_percent = v_calc.total_percent,
    commission_amount = v_calc.commission_amount,
    partner_closed_deals_count_at_moment = v_calc.closed_deals_count,
    bonus_applied = v_calc.bonus_applied,
    paid_at = coalesce(paid_at, now()),
    updated_at = now()
  where id = p_deal_id
  returning * into v_deal;

  insert into public.balance_transactions (
    partner_id, deal_id, type, amount, currency, status, description, created_by
  ) values (
    v_deal.partner_id,
    v_deal.id,
    'accrual',
    v_calc.commission_amount,
    v_deal.currency,
    'completed',
    'Commission: ' || v_deal.client_name,
    v_profile_id
  )
  on conflict (deal_id, type) do nothing;

  return v_deal;
end;
$$;

-- Default commission settings row
insert into public.commission_settings (base_percent_under_2000, base_percent_from_2000, bonus_after_closed_deals, bonus_percent)
values (10, 15, 3, 10);


-- ========== 20260303120600_reports_views_and_functions.sql ==========

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


-- ========== 20260303120700_rls_policies.sql ==========

-- 8. rls_policies
alter table public.profiles enable row level security;
alter table public.legal_documents enable row level security;
alter table public.legal_acceptances enable row level security;
alter table public.user_legal_profiles enable row level security;
alter table public.consent_events enable row level security;
alter table public.prospect_contacts enable row level security;
alter table public.prospect_activities enable row level security;
alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;
alter table public.deals enable row level security;
alter table public.balance_transactions enable row level security;
alter table public.payouts enable row level security;
alter table public.commission_settings enable row level security;
alter table public.audit_logs enable row level security;

-- PROFILES
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin() or public.is_manager());

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and role = (select role from public.profiles where id = profiles.id)
    and status = (select status from public.profiles where id = profiles.id)
  );

create policy profiles_admin_all on public.profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- LEGAL DOCUMENTS (active docs readable by authenticated)
create policy legal_documents_select_active on public.legal_documents
  for select to authenticated
  using (status = 'active' or public.is_admin());

create policy legal_documents_admin_write on public.legal_documents
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- LEGAL ACCEPTANCES
create policy legal_acceptances_select_own on public.legal_acceptances
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy legal_acceptances_insert_own on public.legal_acceptances
  for insert to authenticated
  with check (user_id = auth.uid());

create policy legal_acceptances_admin_all on public.legal_acceptances
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- USER LEGAL PROFILES
create policy user_legal_profiles_select_own on public.user_legal_profiles
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy user_legal_profiles_insert_own on public.user_legal_profiles
  for insert to authenticated
  with check (user_id = auth.uid());

create policy user_legal_profiles_update_own on public.user_legal_profiles
  for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and payout_status = (select payout_status from public.user_legal_profiles ulp where ulp.id = user_legal_profiles.id)
    and crm_access = (select crm_access from public.user_legal_profiles ulp where ulp.id = user_legal_profiles.id)
  );

create policy user_legal_profiles_admin_all on public.user_legal_profiles
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- CONSENT EVENTS
create policy consent_events_select_own on public.consent_events
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy consent_events_insert_own on public.consent_events
  for insert to authenticated
  with check (user_id = auth.uid());

-- PROSPECT CONTACTS
create policy prospect_contacts_select on public.prospect_contacts
  for select to authenticated
  using (
    partner_id = public.current_profile_id()
    or public.is_admin()
    or public.is_manager()
  );

create policy prospect_contacts_insert_partner on public.prospect_contacts
  for insert to authenticated
  with check (
    partner_id = public.current_profile_id()
    and public.is_partner()
  );

create policy prospect_contacts_update on public.prospect_contacts
  for update to authenticated
  using (
    (partner_id = public.current_profile_id() and public.is_partner())
    or public.is_admin()
    or public.is_manager()
  )
  with check (
    partner_id = public.current_profile_id()
    or public.is_admin()
    or public.is_manager()
  );

create policy prospect_contacts_delete on public.prospect_contacts
  for delete to authenticated
  using (
    (partner_id = public.current_profile_id() and public.is_partner())
    or public.is_admin()
  );

-- PROSPECT ACTIVITIES
create policy prospect_activities_select on public.prospect_activities
  for select to authenticated
  using (
    exists (
      select 1 from public.prospect_contacts pc
      where pc.id = prospect_activities.prospect_id
        and (pc.partner_id = public.current_profile_id() or public.is_admin() or public.is_manager())
    )
  );

create policy prospect_activities_insert on public.prospect_activities
  for insert to authenticated
  with check (user_id = public.current_profile_id());

-- LEADS
create policy leads_select on public.leads
  for select to authenticated
  using (
    partner_id = public.current_profile_id()
    or assigned_manager_id = public.current_profile_id()
    or public.is_admin()
    or public.is_manager()
  );

create policy leads_insert_partner on public.leads
  for insert to authenticated
  with check (
    partner_id = public.current_profile_id()
    and status = 'pending_review'
    and admin_review_status = 'pending'
    and public.is_partner()
  );

create policy leads_update on public.leads
  for update to authenticated
  using (
    (partner_id = public.current_profile_id() and public.is_partner() and status not in ('won', 'lost'))
    or assigned_manager_id = public.current_profile_id()
    or public.is_admin()
    or (public.is_manager() and status not in ('won'))
  )
  with check (
    case
      when public.is_partner() then
        partner_id = public.current_profile_id()
        and admin_review_status = (select admin_review_status from public.leads l where l.id = leads.id)
        and status not in ('won')
      when public.is_admin() then true
      when public.is_manager() then admin_review_status = (select admin_review_status from public.leads l where l.id = leads.id)
      else false
    end
  );

create policy leads_admin_delete on public.leads
  for delete to authenticated
  using (public.is_admin());

-- LEAD ACTIVITIES
create policy lead_activities_select on public.lead_activities
  for select to authenticated
  using (
    exists (
      select 1 from public.leads l
      where l.id = lead_activities.lead_id
        and (
          l.partner_id = public.current_profile_id()
          or l.assigned_manager_id = public.current_profile_id()
          or public.is_admin()
          or public.is_manager()
        )
    )
  );

create policy lead_activities_insert on public.lead_activities
  for insert to authenticated
  with check (user_id = public.current_profile_id());

-- DEALS
create policy deals_select on public.deals
  for select to authenticated
  using (
    partner_id = public.current_profile_id()
    or public.is_admin()
    or public.is_manager()
  );

create policy deals_admin_write on public.deals
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- BALANCE TRANSACTIONS
create policy balance_transactions_select on public.balance_transactions
  for select to authenticated
  using (
    partner_id = public.current_profile_id()
    or public.is_admin()
  );

create policy balance_transactions_admin_insert on public.balance_transactions
  for insert to authenticated
  with check (public.is_admin());

-- PAYOUTS
create policy payouts_select on public.payouts
  for select to authenticated
  using (
    partner_id = public.current_profile_id()
    or public.is_admin()
  );

create policy payouts_admin_write on public.payouts
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- COMMISSION SETTINGS
create policy commission_settings_select on public.commission_settings
  for select to authenticated
  using (true);

create policy commission_settings_admin on public.commission_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- AUDIT LOGS
create policy audit_logs_admin_select on public.audit_logs
  for select to authenticated
  using (public.is_admin());

create policy audit_logs_admin_insert on public.audit_logs
  for insert to authenticated
  with check (public.is_admin() or auth.uid() is not null);

-- Revoke public access
revoke all on all tables in schema public from anon;
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on all functions in schema public to authenticated;


-- ========== 20260303120800_indexes_and_constraints.sql ==========

-- 9. indexes_and_constraints
create index if not exists leads_website_lower_idx on public.leads (lower(website)) where website is not null;
create index if not exists leads_email_lower_idx on public.leads (lower(email)) where email is not null;
create index if not exists leads_phone_digits_idx on public.leads (regexp_replace(phone, '\D', '', 'g')) where phone is not null;
create index if not exists leads_business_name_lower_idx on public.leads (lower(business_name));

create index if not exists prospect_contacts_business_name_lower_idx on public.prospect_contacts (lower(business_name));
create index if not exists prospect_contacts_email_lower_idx on public.prospect_contacts (lower(email)) where email is not null;

create unique index if not exists legal_documents_one_active_per_type
  on public.legal_documents (type)
  where status = 'active';

alter table public.leads
  add constraint leads_estimated_budget_nonneg check (estimated_budget is null or estimated_budget >= 0);

alter table public.user_legal_profiles
  add constraint user_legal_profiles_age_min check (age >= 0);

-- Views: security invoker (PG15+)
alter view public.partner_balances set (security_invoker = true);
alter view public.monthly_sales set (security_invoker = true);
alter view public.partner_dashboard_stats set (security_invoker = true);
alter view public.lead_conversion_funnel set (security_invoker = true);
alter view public.top_partners set (security_invoker = true);

grant select on public.partner_balances to authenticated;
grant select on public.monthly_sales to authenticated;
grant select on public.partner_dashboard_stats to authenticated;
grant select on public.lead_conversion_funnel to authenticated;
grant select on public.top_partners to authenticated;


-- ========== 20260303120900_seed_demo_admin.sql ==========

-- 10. seed_demo_admin вЂ” legal documents v1.0 + admin promotion by email

insert into public.legal_documents (type, title, version, content, status, published_at) values
('terms', 'РџРѕР»СЊР·РѕРІР°С‚РµР»СЊСЃРєРѕРµ СЃРѕРіР»Р°С€РµРЅРёРµ', '1.0',
 'РЈСЃР»РѕРІРёСЏ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ РїР»Р°С‚С„РѕСЂРјС‹ TIVONIX Partners CRM. РџР°СЂС‚РЅС‘СЂ РѕР±СЏР·СѓРµС‚СЃСЏ СЃРѕР±Р»СЋРґР°С‚СЊ РїСЂР°РІРёР»Р° СЂР°Р±РѕС‚С‹ СЃ РєР»РёРµРЅС‚Р°РјРё, РЅРµ СЂР°Р·РіР»Р°С€Р°С‚СЊ РєРѕРЅС„РёРґРµРЅС†РёР°Р»СЊРЅСѓСЋ РёРЅС„РѕСЂРјР°С†РёСЋ Рё РїРµСЂРµРґР°РІР°С‚СЊ Р»РёРґС‹ РґРѕР±СЂРѕСЃРѕРІРµСЃС‚РЅРѕ.',
 'active', now()),
('privacy', 'РџРѕР»РёС‚РёРєР° РєРѕРЅС„РёРґРµРЅС†РёР°Р»СЊРЅРѕСЃС‚Рё', '1.0',
 'TIVONIX РѕР±СЂР°Р±Р°С‚С‹РІР°РµС‚ РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹Рµ РґР°РЅРЅС‹Рµ РїР°СЂС‚РЅС‘СЂРѕРІ Рё РєР»РёРµРЅС‚РѕРІ РІ СЃРѕРѕС‚РІРµС‚СЃС‚РІРёРё СЃ РїСЂРёРјРµРЅРёРјС‹Рј Р·Р°РєРѕРЅРѕРґР°С‚РµР»СЊСЃС‚РІРѕРј. Р”Р°РЅРЅС‹Рµ РёСЃРїРѕР»СЊР·СѓСЋС‚СЃСЏ РґР»СЏ СЂР°Р±РѕС‚С‹ CRM, РІС‹РїР»Р°С‚ Рё СЃРІСЏР·Рё.',
 'active', now()),
('personal_data_consent', 'РЎРѕРіР»Р°СЃРёРµ РЅР° РѕР±СЂР°Р±РѕС‚РєСѓ РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С… РґР°РЅРЅС‹С…', '1.0',
 'РЇ РґР°СЋ СЃРѕРіР»Р°СЃРёРµ РЅР° РѕР±СЂР°Р±РѕС‚РєСѓ РјРѕРёС… РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С… РґР°РЅРЅС‹С…: Р¤РРћ, email, С‚РµР»РµС„РѕРЅ, Telegram, РїР»Р°С‚С‘Р¶РЅС‹Рµ СЂРµРєРІРёР·РёС‚С‹ вЂ” РґР»СЏ С†РµР»РµР№ РїР°СЂС‚РЅС‘СЂСЃРєРѕР№ РїСЂРѕРіСЂР°РјРјС‹ TIVONIX.',
 'active', now()),
('partner_agreement', 'Р”РѕРіРѕРІРѕСЂ РїР°СЂС‚РЅС‘СЂР°', '1.0',
 'РџР°СЂС‚РЅС‘СЂ РїСЂРёРІР»РµРєР°РµС‚ РєР»РёРµРЅС‚РѕРІ РЅР° IT-СѓСЃР»СѓРіРё TIVONIX. РљРѕРјРёСЃСЃРёСЏ РЅР°С‡РёСЃР»СЏРµС‚СЃСЏ РїРѕСЃР»Рµ РѕРїР»Р°С‚С‹ РєР»РёРµРЅС‚РѕРј. РџР°СЂС‚РЅС‘СЂ РЅРµ РїСЂРѕРґР°С‘С‚ СЃР°РјРѕСЃС‚РѕСЏС‚РµР»СЊРЅРѕ Рё РЅРµ РіР°СЂР°РЅС‚РёСЂСѓРµС‚ СЃСЂРѕРєРё СЂР°Р·СЂР°Р±РѕС‚РєРё.',
 'active', now()),
('commission_rules', 'РџСЂР°РІРёР»Р° РєРѕРјРёСЃСЃРёРё', '1.0',
 'Р”Рѕ $2000 вЂ” 10%. РћС‚ $2000 вЂ” 15%. РџРѕСЃР»Рµ 3+ Р·Р°РєСЂС‹С‚С‹С… РѕРїР»Р°С‡РµРЅРЅС‹С… Р·Р°РєР°Р·РѕРІ вЂ” Р±РѕРЅСѓСЃ +10% Рє Р±Р°Р·РѕРІРѕРјСѓ РїСЂРѕС†РµРЅС‚Сѓ. Р’С‹РїР»Р°С‚Р° РїРѕСЃР»Рµ РїРѕРґС‚РІРµСЂР¶РґРµРЅРёСЏ Р°РґРјРёРЅРѕРј.',
 'active', now()),
('cookies', 'РџРѕР»РёС‚РёРєР° cookies', '1.0',
 'РњС‹ РёСЃРїРѕР»СЊР·СѓРµРј cookies РґР»СЏ СЃРµСЃСЃРёРё Р°РІС‚РѕСЂРёР·Р°С†РёРё Рё СЃРѕС…СЂР°РЅРµРЅРёСЏ РЅР°СЃС‚СЂРѕРµРє. РћС‚РєР»СЋС‡РµРЅРёРµ cookies РјРѕР¶РµС‚ РѕРіСЂР°РЅРёС‡РёС‚СЊ СЂР°Р±РѕС‚Сѓ CRM.',
 'active', now())
on conflict (type, version) do nothing;

-- Promote user to admin when email matches app setting (set via Supabase dashboard secret or SQL after deploy)
-- Usage: select public.promote_admin_by_email('admin@example.com');
create or replace function public.promote_admin_by_email(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set role = 'admin', updated_at = now()
  where lower(email) = lower(trim(p_email));
end;
$$;

revoke all on function public.promote_admin_by_email(text) from public;
grant execute on function public.promote_admin_by_email(text) to service_role;

