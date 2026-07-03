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
