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
