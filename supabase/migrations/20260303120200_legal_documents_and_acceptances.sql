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
