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
