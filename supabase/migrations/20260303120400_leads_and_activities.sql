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

-- Duplicate check helper (security invoker — RLS applies)
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
