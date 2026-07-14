-- Partner self-registration: profile fields, triggers, RLS, commission override

alter table public.profiles
  add column if not exists partner_type public.partner_type,
  add column if not exists agency_name text,
  add column if not exists website_url text,
  add column if not exists commission_percent_override numeric
    check (
      commission_percent_override is null
      or (commission_percent_override >= 0 and commission_percent_override <= 100)
    ),
  add column if not exists partnership_notes text,
  add column if not exists assigned_manager_id uuid references public.profiles (id) on delete set null,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references public.profiles (id) on delete set null,
  add column if not exists rejection_reason text;

alter table public.profiles
  alter column status set default 'pending';

create index if not exists profiles_partner_type_idx on public.profiles (partner_type);
create index if not exists profiles_assigned_manager_id_idx on public.profiles (assigned_manager_id);

-- Signup trigger — always partner + pending; never trust role/status from metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_partner_type public.partner_type;
  v_meta_type text;
begin
  v_meta_type := lower(coalesce(new.raw_user_meta_data->>'partner_type', ''));
  if v_meta_type in ('referral', 'white_label') then
    v_partner_type := v_meta_type::public.partner_type;
  else
    v_partner_type := null;
  end if;

  insert into public.profiles (
    user_id,
    email,
    full_name,
    telegram,
    role,
    status,
    partner_type,
    agency_name,
    website_url
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      split_part(coalesce(new.email, 'user'), '@', 1)
    ),
    nullif(trim(coalesce(new.raw_user_meta_data->>'telegram', '')), ''),
    'partner',
    'pending',
    v_partner_type,
    nullif(trim(coalesce(new.raw_user_meta_data->>'agency_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'website_url', '')), '')
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Protect privileged profile fields from non-admin clients
create or replace function public.protect_privileged_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op <> 'UPDATE' then
    return new;
  end if;

  -- service_role / SQL (no jwt uid) may change anything
  if auth.uid() is null then
    return new;
  end if;

  if public.is_admin() then
    return new;
  end if;

  new.role := old.role;
  new.status := old.status;
  new.partner_type := old.partner_type;
  new.commission_percent_override := old.commission_percent_override;
  new.assigned_manager_id := old.assigned_manager_id;
  new.reviewed_at := old.reviewed_at;
  new.reviewed_by := old.reviewed_by;
  new.rejection_reason := old.rejection_reason;
  new.partnership_notes := old.partnership_notes;

  return new;
end;
$$;

drop trigger if exists profiles_protect_admin_role on public.profiles;
drop trigger if exists profiles_protect_privileged_fields on public.profiles;
create trigger profiles_protect_privileged_fields
  before update on public.profiles
  for each row execute function public.protect_privileged_profile_fields();

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = profiles.id)
    and status = (select p.status from public.profiles p where p.id = profiles.id)
    and partner_type is not distinct from (
      select p.partner_type from public.profiles p where p.id = profiles.id
    )
    and commission_percent_override is not distinct from (
      select p.commission_percent_override from public.profiles p where p.id = profiles.id
    )
    and assigned_manager_id is not distinct from (
      select p.assigned_manager_id from public.profiles p where p.id = profiles.id
    )
    and reviewed_at is not distinct from (
      select p.reviewed_at from public.profiles p where p.id = profiles.id
    )
    and reviewed_by is not distinct from (
      select p.reviewed_by from public.profiles p where p.id = profiles.id
    )
    and rejection_reason is not distinct from (
      select p.rejection_reason from public.profiles p where p.id = profiles.id
    )
    and partnership_notes is not distinct from (
      select p.partnership_notes from public.profiles p where p.id = profiles.id
    )
  );

create or replace function public.is_partner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid()
      and role = 'partner'
      and status = 'active'
  );
$$;

create or replace function public.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and status = 'active'
  );
$$;

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
  v_override numeric;
begin
  select commission_percent_override into v_override
  from public.profiles
  where id = p_partner_id;

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

  if v_override is not null then
    v_base := v_override;
    v_bonus := 0;
    v_total := v_override;
  else
    v_base := case
      when p_amount < 2000 then v_settings.base_percent_under_2000
      else v_settings.base_percent_from_2000
    end;

    if v_closed >= v_settings.bonus_after_closed_deals then
      v_bonus := v_settings.bonus_percent;
    end if;

    v_total := v_base + v_bonus;
  end if;

  v_commission := round(p_amount * v_total / 100, 2);

  return query select v_base, v_bonus, v_total, v_commission, v_bonus > 0, v_closed;
end;
$$;
