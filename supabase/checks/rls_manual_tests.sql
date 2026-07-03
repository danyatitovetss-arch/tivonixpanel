-- RLS manual tests (run in Supabase SQL Editor as different roles or via API)
-- Prerequisites: two partner users A/B, one admin, test data

-- 1. Anonymous cannot read leads
-- set role anon; select * from leads; -- expect 0 rows / permission denied

-- 2. Partner A cannot read Partner B leads (via API GET /api/leads/[id] with B's UUID)

-- 3. Partner cannot insert deal
-- insert into deals (...) -- expect RLS violation

-- 4. Partner cannot update payment_status on deals

-- 5. Activity insert on foreign lead should fail (after 20260303210000 migration)
-- insert into lead_activities (lead_id, user_id, action_type)
-- values ('<other-partner-lead-uuid>', '<partner-a-profile-id>', 'test');

-- 6. find_duplicate_lead as partner only sees own leads (SECURITY INVOKER)
-- Global dedup uses service role in API: findDuplicateLeadGlobal()

-- 7. audit_logs: only admin SELECT; INSERT admin-only after migration

-- 8. user_legal_profiles: partner sees only own row

select 'Run API-level tests for mark_deal_as_paid idempotency and payout mark-paid' as note;
