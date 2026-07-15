# Production deploy report

Дата: 2026-07-15  
Окружение: Railway production  
Публичный URL: https://tivonixpanel-production.up.railway.app

## Git

| | |
|---|---|
| Rollback commit (old main) | `cef0b24535c49f9253c35afef87f3fa30775e5b2` |
| Audit tip merged | `a962c26358c02e797d4524dbc443c724adfedc35` |
| Merge commit | `ba53d63f582cffc5f3e3212c8032666e86cdda00` |
| Merge strategy | `--no-ff` |
| Conflicts | none |
| Push main | **YES** (`cef0b24..ba53d63`) |
| Rollback performed | **NO** |

## Pre-push gates (on main after merge)

| Command | Result |
|---------|--------|
| lint | **PASS** |
| typecheck | **PASS** |
| test | **PASS** 17/17 |
| build | **PASS** |

## Railway

| Service | ID | Deploy | Status |
|---------|-----|--------|--------|
| Frontend `tivonixpanel` | `b1f7c9f6-…` | `f793e6b4-…` | **Online · SUCCESS** |
| API `tivonixpanel-api` | `50dbeae0-…` | `90d85b39-…` | **Online · SUCCESS** |

Env (values not shown):

- `NEXT_PUBLIC_DEMO_MODE` = SET, **is_true=false** (web + api)
- `APP_SERVICE` = SET
- Health: web + api `/api/health` → **200** `{ ok: true }`

Logs review:

- No restart loop observed
- No migration / DB connection FATAL
- Existing noise: `refresh_token_not_found` from stale client cookies (non-P0)
- No DEMO_MODE enabled

Security headers on `/login` after deploy:

- CSP **present**
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- HSTS **present**
- `x-powered-by` **absent** (fixed vs prior audit)

## Production smoke (`scripts/prod-smoke.cjs`)

Base: `https://tivonixpanel-production.up.railway.app`  
Result: **22 PASS / 0 FAIL**  
Log: `audit-panel/logs/deploy/prod-smoke.json`

| Check | Result |
|-------|--------|
| Frontend open /login /register | PASS |
| `/api/health` web+api | PASS 200 |
| Login / logout | PASS |
| Refresh protected page | PASS |
| No 401 spam on public login | PASS |
| Security headers | PASS |
| Partner A ↛ Partner B (GET/list/PATCH) | PASS |
| Partner B ↛ Partner A | PASS |
| Export scope (list/CSV JSON) no foreign | PASS |
| Admin mark-paid audit deal idempotent | PASS |
| Mobile 360 login no H-scroll | PASS |
| Integrity ≥17 users, failCount=0 | PASS |
| Missing legal profiles = 0 | PASS |
| Audit seed cleanup | PASS |

Mutating tests used only `@tivonix.audit` and were deleted after.

## Remaining issues

| ID | Severity | Status |
|----|----------|--------|
| ISS-016 LCP login ~4.5–4.8s | P1 perf | OPEN — non-blocking for launch |
| Stale refresh_token log noise | P3 | Accept |

**P0:** none  
**P1 security:** none

## Verdict

# GO WITH CONDITIONS

Conditions: LCP on `/login` still above 2.5s target (ISS-016). Security/isolation/deploy gates passed.

**Можно показывать панель клиентам прямо сейчас:** **ДА**

## Rollback instruction (if needed later)

```bash
git checkout main
git reset --hard cef0b24535c49f9253c35afef87f3fa30775e5b2
git push --force-with-lease origin main   # only with explicit approval
```

Then wait for Railway to redeploy previous SUCCESS images.
