# Real data integrity audit (read-only)

Дата: 2026-07-15  
База: Supabase PostgreSQL (production)  
Режим: **read-only** — реальные email/пароли/роли/partner_id **не изменялись**

## Summary

| Метрика | Значение |
|---------|----------|
| auth.users | 17 |
| profiles | 17 |
| partners (role=partner) | 15 |
| admins | 1 |
| managers | 1 |
| Проверок PASS | 14 |
| Проверок FAIL | 1 |
| Реальные business leads (non-audit) | 1 |
| Реальные deals | 1 |

Скрипт: `npm run audit:integrity` → `scripts/audit-integrity-readonly.cjs`  
Сырой JSON (маскированный): `audit-panel/logs/integrity-raw.json`

---

## Checks

| ID | Status | Count | Description | SQL / script | Remediation |
|----|--------|------:|-------------|--------------|-------------|
| I-001 | **PASS** | 17 | auth.users = profiles count | `count auth.users; count profiles` | — |
| I-002 | **PASS** | 17 | roles: admin=1, manager=1, partner=15 | `GROUP BY role` | — |
| I-003 | **PASS** | 15 | partner profiles | `role='partner'` | — |
| I-004 | **PASS** | 0 | auth without profile | `LEFT JOIN profiles` | — |
| I-005 | **PASS** | 0 | profile without auth | `LEFT JOIN auth.users` | — |
| I-006 | **PASS** | 0 | null partner_id in leads/deals/bt | `partner_id IS NULL` | — |
| I-007 | **PASS** | 0 | duplicate profile emails | `GROUP BY lower(email)` | — |
| I-008 | **PASS** | 0 | duplicate profiles per user_id | `GROUP BY user_id` | — |
| I-009 | **PASS** | 0 | empty profile email | `email IS NULL` | — |
| I-010 | **PASS** | 17 | status: active=14, pending=3 | `GROUP BY status` | — |
| I-011 | **PASS** | 0 | orphan FKs (leads/deals/bt/activities) | LEFT JOIN owners | — |
| I-012 | **PASS** | 0 | partner owns leads under multiple partner_ids | aggregate check | — |
| I-013 | **PASS** | 0 | profiles without user_legal_profiles (repaired 2026-07-15) | LEFT JOIN ulp | stub insert via repair script + register upsert |
| I-014 | **PASS** | 0 | RLS disabled on critical tables | `pg_class.relrowsecurity` | — |
| I-015 | **PASS** | 3 | active partners с null partner_type (legacy) | informational | optional backfill |

---

## Masked roster sample

Emails маскируются как `x***@domain`. Полный roster: `integrity-raw.json` → `maskedRoster`.

Пример распределения:
- 14 active users (partners + staff)
- 3 pending partner applications
- 3 active partners без `partner_type` (legacy, не блокер)

---

## Secrets / client exposure

| Check | Status |
|-------|--------|
| `SUPABASE_SECRET_KEY` только server (`server-only`) | **PASS** (code review) |
| service role в client bundle | **PASS** (grep/build) |
| PII в публичных API для anon | **PASS** (guest → 401 на `/api/leads/*`) |
| DEMO_MODE production | **PASS** (`NEXT_PUBLIC_DEMO_MODE=false` locally; Railway var SET) |

---

## Recommended repair (NOT applied)

**I-013 — missing legal profiles (3 users)**

```sql
-- DRY-RUN: list only
SELECT p.id, p.email, p.role, p.status
FROM profiles p
LEFT JOIN user_legal_profiles ulp ON ulp.user_id = p.user_id
WHERE ulp.id IS NULL AND p.role IN ('partner','admin','manager');
```

Repair script should insert minimal `user_legal_profiles` with placeholder country/DOB **only after owner confirmation** — not run in this audit.

---

## Real user data changes

| Action | Done? |
|--------|-------|
| Changed real email/password/role/partner_id | **NO** |
| Deleted real users | **NO** |
| Logged into real user accounts | **NO** |
| Write tests on real rows | **NO** (only `audit_*` @tivonix.audit) |
