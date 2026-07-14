# Partner registration production prep

## Status
Local validation + DB smoke against DATABASE_URL from `.env.local`: **PASSED**
(migrations 20260714* already present in that project: rate limit RPC, enums, partner_type).

**Production Railway + production Supabase:** not modified in this session.
Ask before applying migrations/deploy smoke on live production.

## Required production env
```
NEXT_PUBLIC_DEMO_MODE=false
APP_URL=https://tivonixpanel-production.up.railway.app
NEXT_PUBLIC_APP_URL=https://tivonixpanel-production.up.railway.app
SUPABASE_SECRET_KEY=...
# Optional
TELEGRAM_BOT_TOKEN=...
TELEGRAM_ADMIN_CHAT_ID=...
```

## Supabase Auth dashboard
- Site URL: `https://tivonixpanel-production.up.railway.app`
- Redirect URLs include:
  - `https://tivonixpanel-production.up.railway.app/auth/callback`
  - `https://tivonixpanel-production.up.railway.app/auth/callback?**`
  - `https://tivonixpanel-production.up.railway.app/auth/reset-password`
- Email confirmation: leave OFF until SMTP delivery verified

## Marketing links for /partners
- Referral: https://tivonixpanel-production.up.railway.app/register?type=referral
- White-label: https://tivonixpanel-production.up.railway.app/register?type=white_label
- Login: https://tivonixpanel-production.up.railway.app/login

## Migrations order (staging → then production after GO)
1. `20260714000000_partner_registration_enums.sql`
2. `20260714000001_partner_self_registration.sql`
3. `20260714000002_register_rate_limit.sql`

Preflight: `supabase/checks/partner_registration_preflight.sql`
Rollback notes: `supabase/checks/partner_registration_rollback.sql`

## Smoke after deploy
1. Register Referral + White-label
2. Appear in `/admin/partner-applications`
3. Approve → legal onboarding → `/dashboard`
4. Referral: create client
5. White-label: create project (same lead form, WL labels on `/my`)
6. Partner cannot mark deal paid
7. Duplicate lead does not leak owner data
