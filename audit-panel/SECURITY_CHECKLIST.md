# Security Checklist — TIVONIX Partners CRM (full production QA)

Дата: 2026-07-15  
Ветка: `audit/full-production-qa`  
Audit data: `@tivonix.audit` (seeded, isolated)  
Evidence: `audit-panel/logs/security-probe-results.json`, `e2e/partner-isolation.spec.ts`, Playwright logs in `audit-panel/logs/final/`

Legend: **PASS** / **FAIL** / **BLOCKED** / **PARTIAL**

---

## RLS & Database (live)

| # | Check | Status | Evidence |
|---|-------|--------|----------|
| 1 | RLS enabled on critical tables | **PASS** | I-014 integrity script |
| 2 | Partner A SELECT own lead (Supabase JWT) | **PASS** | S-A-RLS-01 |
| 3 | Partner A SELECT Partner B lead hidden | **PASS** | S-A-RLS-02 |
| 4 | Partner B SELECT Partner A lead hidden | **PASS** | S-B-RLS-01 |
| 5 | Anonymous SELECT private tables | **PASS** | S-GUEST-01 → 401 |
| 6 | Live `verify_schema.sql` all tables | **BLOCKED** | needs SQL Editor session |
| 7 | Partner cannot mark-paid (DB RPC) | **PASS** | admin-only RPC + S-A-FIN via e2e admin |

---

## Partner A → Partner B

| # | Scenario | Status | HTTP / result |
|---|----------|--------|---------------|
| 1 | UI direct URL `/leads/{B}` | **PASS** | 404/нет доступа (e2e) |
| 2 | API GET `/api/leads/{B}` | **PASS** | 404 (e2e local) |
| 3 | API PATCH `/api/leads/{A}` as B | **PASS** | 404 after fix (was 500) |
| 4 | API list `/api/leads` excludes B | **PASS** | e2e |
| 5 | POST forged `partner_id=B` in body | **PASS** | server forces own profile (code + seed attempt) |
| 6 | Query/header partner_id injection | **PARTIAL** | not all endpoints fuzzed |
| 7 | Export only own data | **BLOCKED** | export e2e not run |
| 8 | Finance read B balance | **PASS** | RLS + dashboard scoped |
| 9 | Finance mark-paid | **PASS** | 403/401 partner (e2e admin only) |
| 10 | Admin routes `/api/admin/*` | **PASS** | 403 partner (e2e) |
| 11 | Role escalation via body | **PASS** | register strips role (code) |
| 12 | Aggregated stats other partner | **PARTIAL** | admin/manager reports not fully probed |

---

## Partner B → Partner A

| # | Scenario | Status |
|---|----------|--------|
| 1 | RLS hidden A lead | **PASS** |
| 2 | PATCH A lead | **PASS** (404) |
| 3 | UI/API GET A lead | **PASS** (mirror A→B e2e) |

---

## Admin

| # | Scenario | Status |
|---|----------|--------|
| 1 | Read any lead | **PASS** | e2e admin GET B lead → 200 |
| 2 | mark-paid idempotent | **PASS** | e2e 200/409 ×2 |
| 3 | Dangerous actions audit logged | **PARTIAL** | table exists; not verified live |
| 4 | Server-side admin gate | **PASS** | `requireApiRole("admin")` |

---

## Guest / session

| # | Scenario | Status |
|---|----------|--------|
| 1 | Protected pages redirect | **PASS** | security-smoke |
| 2 | API data denied | **PASS** | 401 |
| 3 | Logout clears session | **PASS** | e2e `/api/auth/me` → 401 |
| 4 | Expired token UX | **BLOCKED** | manual |
| 5 | Refresh authenticated page | **PARTIAL** | not automated |

---

## Application (code + prod HTTP)

| # | Check | Status |
|---|-------|--------|
| DEMO_MODE production blocked | **PASS** |
| Missing env fail-closed | **PASS** |
| Security headers | **PARTIAL** | prod login still shows `x-powered-by: Next.js` on Railway (split deploy); local next.config has CSP |
| service role client-only | **PASS** |
| Login rate limit | **PASS** (code) |
| CSV export sanitize | **PASS** (unit) |

---

## ISS-001 verdict

**PARTIAL → critical isolation PASS on audit data; full checklist ~85%**

Remaining: export cross-partner, header/query fuzz all routes, payout mark-paid idempotency on audit payout row, live SQL verify.

Commands:

```bash
npm run audit:seed
npm run audit:integrity
E2E_BASE_URL=http://127.0.0.1:3000 npx playwright test e2e/partner-isolation.spec.ts
npm run audit:cleanup -- --delete   # only @tivonix.audit
```
