-- Manual RLS checks after partner registration migrations
-- Run as different JWT contexts in Supabase (or via app API).

-- A) As partner A (authenticated JWT of partner A):
-- select * from profiles;                         -- only own (+admin/manager visibility rules)
-- select * from leads where partner_id <> <own>; -- expect 0
-- select * from deals where partner_id <> <own>; -- expect 0
-- select * from payouts where partner_id <> <own>; -- expect 0

-- B) Attempt privilege escalation (must fail):
-- update profiles set role = 'admin' where user_id = auth.uid();
-- update profiles set status = 'active' where user_id = auth.uid();
-- update profiles set commission_percent_override = 99 where user_id = auth.uid();
-- update profiles set partner_type = 'white_label' where user_id = auth.uid();

-- C) As pending partner:
-- insert into leads (...) -- must fail (is_partner requires active)
-- select crm data -- limited; panel routes blocked by middleware

-- D) As admin:
-- update profiles set status = 'active' where id = '<pending partner>'; -- must succeed
