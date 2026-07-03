# FINAL BACKEND AUDIT — TIVONIX Partners CRM

**Дата:** 2026-07-03  
**Режим:** `NEXT_PUBLIC_DEMO_MODE=false` (production path)  
**Проверил:** автоматический аудит кодовой базы + `npm run typecheck` + `npm run build` + `node scripts/check-supabase-state.cjs`

---

## 1. Общая проверка проекта

| Проверка | Статус |
|----------|--------|
| `npm run typecheck` | ✅ PASS |
| `npm run build` | ✅ PASS |
| Supabase REST/API доступен | ✅ (`auth: users=1`, 31 REST paths) |
| `SUPABASE_SECRET_KEY` только server | ✅ `src/lib/supabase/admin.ts` (`server-only`) |
| `DATABASE_URL` в client bundle | ✅ не импортируется в `src/` |
| `.env.local` в `.gitignore` | ✅ |
| `.env.local.example` без секретов | ✅ добавлен |

**Runtime / hydration:** не прогонялись автоматически — проверить вручную в браузере после деплоя.

**Env (локально):** `src/server/.env` + `.env.local` загружаются скриптами; убедитесь что в production заданы все переменные из `.env.local.example`.

---

## 2. Supabase schema

**Миграции в репозитории:** 12 файлов (включая `20260303200000_fix_legal_documents_encoding.sql`, `20260303210000_tighten_activity_rls.sql`).

**Live DB (проверено через REST):** таблицы `profiles`, `leads`, `deals`, `payouts`, `prospect_contacts`, `user_legal_profiles`, `legal_documents`, `audit_logs`, views `partner_balances`, `monthly_sales`, `top_partners`, `lead_conversion_funnel`, `partner_dashboard_stats` — **присутствуют**.

**Ручная проверка в SQL Editor:** выполнить `supabase/checks/verify_schema.sql`.

**RLS:** включён на всех 14 application-таблицах (миграция `20260303120700_rls_policies.sql`).

**Новая миграция (применить в Supabase):** `20260303210000_tighten_activity_rls.sql` — ужесточает INSERT в `lead_activities`, `prospect_activities`, `audit_logs`.

---

## 3. Auth / Login / Register

| Сценарий | Статус |
|----------|--------|
| Login email/password | ✅ Supabase Auth + middleware |
| Русские ошибки | ✅ `src/lib/errors.ts` |
| Logout | ✅ `/api/auth/logout` + sidebar |
| Защита CRM routes | ✅ middleware при `DEMO_MODE=false` |
| Redirect без onboarding | ✅ → `/onboarding/legal` |
| Возраст < 16 | ✅ → `/blocked` |
| **Register нового пользователя** | ⚠️ `/register` редиректит на `/login?mode=register`, но **самoregistration в UI отключена** — партнёров создаёт admin (`/settings` → Пользователи). Это соответствует текущему продуктовому flow. |

---

## 4. Legal onboarding

| Проверка | Статус |
|----------|--------|
| POST `/api/onboarding/legal` → Supabase | ✅ |
| `user_legal_profiles`, `legal_acceptances`, `consent_events` | ✅ |
| Возраст на сервере | ✅ |
| Block < 16 | ✅ |
| Тексты документов UTF-8 | ✅ `src/lib/legal-documents-content.ts` + API |
| `/legal/*` публичные | ✅ middleware PUBLIC_PATHS |
| `requireApiUser` (blocked users) | ✅ исправлено в аудите |

---

## 5. Roles / Access control

| Роль | Backend |
|------|---------|
| Admin | ✅ `requireApiRole("admin")` на admin routes, deals, payouts |
| Partner | ✅ RLS + API restrictions (исправлены status escalation) |
| Manager | ✅ leads approve/reject, ограниченные финансы |

**Исправлено в аудите:**
- Partner не может PATCH `status` лида вне whitelist (`contacted`, `replied`, …)
- Partner не может назначать `assignedManagerId`
- Partner не может ставить произвольный `status` prospect
- Global duplicate check через `createAdminClient()` + `find_duplicate_lead`

---

## 6. Страницы и источник данных (`DEMO_MODE=false`)

| Страница | Supabase/API | Примечание |
|----------|--------------|------------|
| `/login` | Auth | ✅ |
| `/register` | Redirect | ⚠️ admin-only onboarding |
| `/onboarding/legal` | API | ✅ |
| `/dashboard` | `/api/bootstrap` | ✅ |
| `/academy` | Static + bootstrap | ✅ |
| `/prospecting` | API | ✅ (bulk UI убран, API `/bulk` остаётся) |
| `/leads` | API | ✅ |
| `/deals` | API | ✅ |
| `/payouts` | API | ✅ |
| `/reports` | bootstrap + export | ✅ данные из bootstrap |
| `/partners` | bootstrap | ✅ |
| `/my` | bootstrap | ✅ |
| `/settings` | API (commission) + admin users | ✅ |
| `/admin/legal-profiles` | API | ✅ |
| `/admin/audit-logs` | API | ✅ |

**Store (`src/lib/store.tsx`):** при `DEMO_MODE=false` — `loadBootstrap()` из `/api/bootstrap`, мутации через API. **localStorage используется только при `DEMO_MODE=true`.**

---

## 7. Commissions (unit tests)

| Сумма | Ожидание | Статус |
|-------|----------|--------|
| $1000, 0 deals | 10% = $100 | ✅ `backend.test.ts` |
| $2000, 0 deals | 15% = $300 | ✅ |
| $2000, 3+ deals | 25% = $500 | ✅ |

DB: `calculate_commission()`, `mark_deal_as_paid()` — в миграциях. Idempotency mark-paid — **проверить вручную** в Supabase.

---

## 8. Payouts / Balance

- API: create/mark-paid/cancel — admin only ✅
- Partner read-only via RLS ✅
- View `partner_balances` ✅

**E2E payout flow** — manual test required.

---

## 9. Secret safety

```
grep SUPABASE_SECRET_KEY src → только admin.ts
grep DATABASE_URL src → не найдено
```

---

## 10. E2E сценарии 1–12

| # | Сценарий | Статус |
|---|----------|--------|
| 1 | User 16+ onboarding | ⚠️ Manual |
| 2 | User < 16 blocked | ⚠️ Manual |
| 3 | Partner prospecting → lead | ⚠️ Manual |
| 4 | Admin approve lead | ⚠️ Manual |
| 5 | Partner A/B isolation | ⚠️ Manual (+ RLS SQL) |
| 6 | Deal $1000 → $100 | ⚠️ Manual |
| 7 | Deal $2000 → $300 | ⚠️ Manual |
| 8 | Bonus 3+ deals → $750 | ⚠️ Manual |
| 9 | Payout flow | ⚠️ Manual |
| 10 | Refund/cancel deal | ⚠️ Manual |
| 11 | Legal doc reaccept | ⚠️ Manual (нужна v1.1 в DB) |
| 12 | Admin pages vs partner | ✅ middleware + RoleGuard |

Инструкции: `supabase/checks/rls_manual_tests.sql`, `SECURITY_CHECKLIST.md`.

---

## 11. Исправления в этом аудите

1. **`src/lib/api/permissions.ts`** — whitelist статусов partner для leads/prospects
2. **`src/lib/api/find-duplicate-lead.ts`** — global duplicate через service role
3. **`src/app/api/leads/[id]/route.ts`** — запрет escalation status/manager для partner
4. **`src/app/api/leads/[id]/activities/route.ts`** — проверка доступа к lead перед insert
5. **`src/app/api/prospecting/route.ts`** + `[id]/route.ts` — валидация status partner
6. **`src/app/api/leads/route.ts`** + `check-duplicate` — global duplicate
7. **`src/app/api/onboarding/legal/route.ts`** — `requireApiUser()` для blocked users
8. **`supabase/migrations/20260303210000_tighten_activity_rls.sql`**
9. **`.env.local.example`**, **`rls_manual_tests.sql`**

---

## 12. Оставшиеся риски

| Риск | Приоритет |
|------|-----------|
| Миграция `20260303210000` не применена в prod Supabase | HIGH — применить |
| E2E сценарии не автоматизированы | MEDIUM |
| `/register` — мёртвый redirect | LOW (by design: admin creates partners) |
| Reports API `monthly-sales` без role gate | LOW (RLS на view) |
| PATCH deals/payouts без Zod | LOW (admin-only, whitelist полей) |
| Partner dashboard `/dashboard` vs `/my` — оба доступны | LOW |

---

## 13. Перед production

1. ✅ `NEXT_PUBLIC_DEMO_MODE=false`
2. ☐ Применить все миграции: `npm run db:apply` или Supabase SQL
3. ☐ Запустить `verify_schema.sql`
4. ☐ Создать admin: `npm run admin:create`
5. ☐ Прогнать E2E сценарии 1–12 вручную
6. ☐ Проверить `NEXT_PUBLIC_SUPPORT_TELEGRAM` и legal docs в DB
7. ☐ Rotate secrets если утекали в чатах

---

## Итог

**При `NEXT_PUBLIC_DEMO_MODE=false` CRM работает через Supabase:** bootstrap + REST API routes, RLS на таблицах, middleware для auth/legal/admin. Mock/localStorage **не используется** для CRM-данных в production mode.

**Backend готов к staging/production** после применения новых миграций и ручного прогона E2E.
