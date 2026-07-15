# Follow-up production QA (I-013 + export + fuzz)

Дата: 2026-07-15  
Ветка: `audit/full-production-qa`

## Push

- Ветка уже была на origin @ `9b1a0c19…`
- Follow-up commit push: после этого файла

## I-013

| | |
|---|---|
| Dry-run | 3 partner profiles, no business data, no acceptances |
| Apply | created=3, remainingMissing=0 |
| Integrity after | failCount=**0** |
| Root cause | legacy users before legal onboarding; profiles via `handle_new_user` only |
| Code fix | register now upserts stub `user_legal_profiles` (`crm_access=false`, `onboarding_status=not_started`) |
| Real email/role/partner_id changed? | **No** |

## Export cross-partner

- Export is client CSV from API-scoped rows
- Probe: Partner A/B list + CSV simulation + deals scope
- Result: **26 PASS / 0 FAIL** (`audit-panel/logs/security-fuzz/export-fuzz-results.json`)

## Fuzz headers/query

- query partner_id / partnerId / user_id / role / duplicates / null / invalid UUID
- headers x-partner-id, x-user-id, x-role, Authorization fake
- body forged partner_id
- foreign UUID GET → 404
- Result: **PASS** (included in 26)

## Commands

| Command | Result |
|---------|--------|
| lint | PASS |
| typecheck | PASS |
| test | PASS **17**/17 |
| build | PASS |
| start | PASS |
| e2e desktop | PASS **11** / skip 1 |
| e2e mobile smoke | PASS 5 / skip 1 |
| export-fuzz | PASS 26/26 |

## Merge / deploy

- **Merge:** YES after user confirmation (no P0; no open P1 security)
- **Deploy:** WAIT for merge confirmation
- **Auto-merge:** NO
- **ISS-016 LCP:** still PARTIAL (non-blocking for show)

## Real data

- Unharmed
- Audit seed cleaned after tests
