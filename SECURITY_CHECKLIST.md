# Security Checklist — TIVONIX Partners CRM

## RLS & Database

- [ ] Все приватные таблицы имеют `ENABLE ROW LEVEL SECURITY`
- [ ] Нет таблиц с PII/финансами без RLS (`verify_schema.sql` → Tables WITHOUT RLS)
- [ ] Partner видит только свои `prospect_contacts`, `leads`, `deals`, `payouts`, `balance_transactions`
- [ ] Partner не может создать deal / payout / mark-paid (API + RLS)
- [ ] Partner не может менять `role`, `commission_*`, `admin_review_status`, `crm_access`
- [ ] Partner не может менять `status` лида на `approved`/`won` через API (whitelist в `src/lib/api/permissions.ts`)
- [ ] Global duplicate check использует service role (`findDuplicateLeadGlobal`)
- [ ] Миграция `20260303210000_tighten_activity_rls.sql` применена
- [ ] Anonymous не читает приватные таблицы
- [ ] Admin видит всё через RLS policies `is_admin()`
- [ ] Manager ограничен (без payouts/admin legal без явного разрешения)
- [ ] `user_legal_profiles` скрыты от partner (кроме своей записи через onboarding API)
- [ ] `audit_logs` — только admin

## Application

- [ ] `SUPABASE_SECRET_KEY` только в server routes / `admin.ts` (`server-only`)
- [ ] `createAdminClient` не импортируется в `"use client"` компонентах
- [ ] `DATABASE_URL` не используется в client bundle
- [ ] `.env.local` в `.gitignore`
- [ ] `NEXT_PUBLIC_DEMO_MODE=false` в production
- [ ] Middleware защищает CRM routes
- [ ] Legal onboarding проверяет возраст на сервере
- [ ] Все API валидируют вход через zod
- [ ] Запрещённые поля (`role`, `payment_status`, …) игнорируются на сервере

## Manual verification

1. Partner A создаёт lead — Partner B не видит в UI и через API
2. `mark_deal_as_paid` не создаёт второй accrual
3. Payout `mark-paid` создаёт одну отрицательную транзакцию
4. Logout очищает Supabase session
5. `/admin/*` недоступен partner (middleware + RoleGuard)

## Build audit

```bash
grep -r "SUPABASE_SECRET_KEY" src --include="*.tsx" --include="*.ts"
# Должен быть только в server-only файлах и API routes
npm run build
# Проверить .next/static на отсутствие secret key
```
