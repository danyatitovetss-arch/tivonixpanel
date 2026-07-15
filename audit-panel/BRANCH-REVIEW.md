# Branch review — audit/full-production-qa

Дата: 2026-07-15  
Base: `main` @ `cef0b24535c49f9253c35afef87f3fa30775e5b2`  
Head: `9b1a0c19e741e94298e6bd6418a72714d09efdab` (+ follow-up commits for I-013 / export / fuzz)  
Push: **YES** — `origin/audit/full-production-qa` (up-to-date at review start)

## Scope

197 files at initial QA commit: remediation (DEMO/env/headers/export/xlsx removal), audit scripts, Playwright isolation, lead PATCH 404 fix, reports.

## Key files reviewed

| File | Verdict |
|------|---------|
| `src/app/api/leads/[id]/route.ts` | **OK** — GET/PATCH use `maybeSingle`; missing/RLS-hidden → generic `Клиент не найден` **404**; no existence leak beyond same message; UPDATE on empty select → 404 |
| `e2e/partner-isolation.spec.ts` | **OK** — A↔B GET/PATCH, list scope, admin mark-paid, admin 403, logout |
| `src/middleware.ts` | **OK** — fail-closed missing env; DEMO blocked in production |
| `src/lib/env/*` | **OK** — build/runtime validation |
| `src/lib/export.ts` | **OK** — CSV only, formula sanitize; **client-side** from API-scoped rows |
| `src/app/api/leads/route.ts` | **OK** — `partner_id: user.profileId` forced on INSERT |
| `src/lib/auth/access.ts` + `access.ts` | **OK** — matrices unified (partner sans reports/settings) |
| Audit scripts | **OK** — seed/cleanup gated to `@tivonix.audit` |
| `next.config.ts` headers | **OK** locally; Railway frontend may still show `x-powered-by` until redeploy |
| Lighthouse JSON in audit-panel/logs | **Note** — contains `eyJ` substrings in LH telemetry (not app secrets) |

## PATCH foreign lead

| Check | Result |
|-------|--------|
| Returns 404 for foreign lead | **PASS** (e2e) |
| Does not return 500 | **PASS** |
| Does not UPDATE foreign row | **PASS** (RLS + pre-select) |
| Generic error message | **PASS** (`Клиент не найден`) |
| Symmetric A/B | **PASS** |
| Regression test | **PASS** `Partner B cannot PATCH Partner A lead` |

## Risks found

| ID | Sev | Description | Status |
|----|-----|-------------|--------|
| I-013 | P2→fixed | 3 profiles without `user_legal_profiles` | **FIXED** on DB + register stub |
| ISS-016 | P1 | LCP login 4.5–4.8s | **OPEN** (not blocking security) |
| R-01 | P2 | Export is client-side; isolation depends on API | Mitigated by API/RLS + fuzz |
| R-02 | P3 | Prod Railway may lack full security headers until deploy of this branch | Deploy-time |
| R-03 | P3 | LH log `eyJ` noise in audit artifacts | Acceptable |

## P0 / P1 security

- **P0:** none after I-013 data repair + isolation PASS  
- **P1 security:** none open  
- **P1 perf:** ISS-016 remains

## Merge / deploy

| Question | Answer |
|----------|--------|
| Можно ли merge в main? | **YES** after follow-up commit (I-013 + fuzz) lands and commands PASS — **await user confirmation** |
| Можно ли deploy? | **YES WITH CONDITIONS** after merge; verify PATCH 404 + health on Railway |
| Авто-merge? | **NO** |

## Secrets check before push

- `.env*` / `backups/` gitignored  
- No password/token in audit logs scanned  
- Emails masked in integrity/repair logs  
