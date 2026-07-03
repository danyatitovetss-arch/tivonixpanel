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
