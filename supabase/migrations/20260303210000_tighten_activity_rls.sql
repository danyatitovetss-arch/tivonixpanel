-- Tighten RLS: activity inserts must reference accessible parent rows

drop policy if exists prospect_activities_insert on public.prospect_activities;
create policy prospect_activities_insert on public.prospect_activities
  for insert to authenticated
  with check (
    user_id = public.current_profile_id()
    and exists (
      select 1 from public.prospect_contacts pc
      where pc.id = prospect_activities.prospect_id
        and (
          pc.partner_id = public.current_profile_id()
          or public.is_admin()
          or public.is_manager()
        )
    )
  );

drop policy if exists lead_activities_insert on public.lead_activities;
create policy lead_activities_insert on public.lead_activities
  for insert to authenticated
  with check (
    user_id = public.current_profile_id()
    and exists (
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

drop policy if exists audit_logs_admin_insert on public.audit_logs;
create policy audit_logs_admin_insert on public.audit_logs
  for insert to authenticated
  with check (public.is_admin());

create policy consent_events_admin_select on public.consent_events
  for select to authenticated
  using (public.is_admin());
