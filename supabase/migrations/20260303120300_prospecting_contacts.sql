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
