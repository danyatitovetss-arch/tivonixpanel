# ISSUES — TIVONIX Panel Pre-Release Audit

Дата: 2026-07-15  
Production: https://tivonixpanel-production.up.railway.app  
Scope: локальная production-сборка + production HTTP/UI + код/API/security (без правок кода)

---

## P0 — блокирует использование / риск безопасности

### ISS-001 — Partner A/B isolation
- **Приоритет:** P0 → **PARTIAL CLOSED** (2026-07-15 full QA)
- **Факт:** RLS PASS (Supabase JWT). Playwright 7/7 audit isolation PASS local. Real users не тронуты.
- **Осталось:** export cross-partner, full header/query fuzz, live SQL verify.
- **Evidence:** `audit-panel/SECURITY_CHECKLIST.md`, `e2e/partner-isolation.spec.ts`, `audit-panel/logs/final/e2e-full.log`

### ISS-019 — PATCH чужого lead возвращал 500 (NEW — FIXED)
- **Приоритет:** P1
- **Факт:** Partner B PATCH Partner A lead → HTTP 500 вместо 404.
- **Исправление:** `src/app/api/leads/[id]/route.ts` — pre-check + maybeSingle → 404.
- **Тест:** e2e `Partner B cannot PATCH Partner A lead` **PASS**

### ISS-021 — Railway SSH audit blocked (NEW)
- **Приоритет:** P2
- **Факт:** `railway ssh` требует `railway ssh keys add`. Использованы logs + HTTP health.

### ISS-002 — DEMO_MODE отключает всю middleware-защиту
- **Приоритет:** P0
- **Страница:** все protected routes
- **Шаги:** Выставить `NEXT_PUBLIC_DEMO_MODE=true` и открыть `/dashboard`, `/admin/*`.
- **Ожидание:** Auth обязателен в любом режиме деплоя.
- **Факт:** при `DEMO_MODE` middleware делает `return NextResponse.next()` без сессии.
- **Причина:**
```80:82:src/middleware.ts
  if (DEMO_MODE) {
    return NextResponse.next();
  }
```
- **Исправление:** Demo-bypass только в `NODE_ENV=development` + явный allowlist; CI/Railway fail если DEMO=true.
- **Скриншот:** —

### ISS-003 — Отсутствие Supabase env → middleware пропускает запросы
- **Приоритет:** P0
- **Страница:** middleware
- **Шаги:** Задеплоить без `NEXT_PUBLIC_SUPABASE_URL` / key.
- **Ожидание:** Сервис не стартует / отдает 503.
- **Факт:**
```116:118:src/middleware.ts
  if (!url || !key) {
    return NextResponse.next();
  }
```
- **Исправление:** Hard-fail / redirect to maintenance; healthcheck должен падать без env.
- **Скриншот:** —

### ISS-004 — `xlsx` High severity в боевом экспорте
- **Приоритет:** P0
- **Страница:** любой Export (leads/deals/reports)
- **Шаги:** `npm audit` → `xlsx *` High (prototype pollution + ReDoS); импорт в `src/lib/export.ts`.
- **Ожидание:** Нет High уязвимостей в runtime deps, особенно на user-triggered export.
- **Факт:** `exportToExcel` динамически импортирует `xlsx` (`src/lib/export.ts:80`). Fix unavailable upstream.
- **Исправление:** Заменить на SheetJS Pro / ExcelJS / CSV-only; убрать `xlsx`.
- **Скриншот:** `audit-panel/logs/npm-audit.txt`

### ISS-005 — Seed/demo данные с реальными ФИО и Telegram
- **Приоритет:** P0 (для клиентского показа / privacy)
- **Страница:** demo mode CRM
- **Шаги:** Открыть `src/lib/seed-data.ts` — пользователи «Данила», «Андрей», telegram `@danya_sxxw` и т.д.
- **Ожидание:** Только вымышленные демо-данные или анонимизация.
- **Факт:** Персональные данные в репозитории; при DEMO_MODE попадают в UI.
- **Исправление:** Заменить на вымышленные personas; scrub телеграм/email.
- **Скриншот:** —

---

## P1 — серьёзно портит основной сценарий / качество релиза

### ISS-006 — `npm run lint` FAIL: 48 errors
- **Приоритет:** P1
- **Лог:** `audit-panel/logs/lint.log`
- Критичные: `react-hooks/rules-of-hooks` в `src/components/layout/role-switcher.tsx:16`; множество `set-state-in-effect`; impure render в `follow-up-panel.tsx`.
- **Исправление:** Починить hooks; исключить `scripts/**` из eslint; довести lint до 0 errors.

### ISS-007 — `npm run start` падает на Windows
- **Приоритет:** P1 (локальный/Win CI; Railway Linux обычно OK)
- **Факт:** `next start -p ${PORT:-3000}` — bash-синтаксис, PowerShell передаёт литерал → invalid port.
- **Лог:** `audit-panel/logs/start-prod.log`
- **Исправление:** `"start": "next start -H 0.0.0.0 -p 3000"` или cross-env / shell wrapper.

### ISS-008 — API healthcheck смотрит на 401 endpoint
- **Приоритет:** P1
- **Файл:** `railway.api.toml` → `healthcheckPath = "/api/auth/me"` (unauth = 401).
- **Исправление:** `/api/health`.

### ISS-009 — Нет security headers
- **Приоритет:** P1
- **Факт:** Production `/login` headers: нет CSP / HSTS / X-Frame-Options / X-Content-Type-Options; есть `x-powered-by: Next.js`.
- **Лог:** `audit-panel/logs/prod-security-headers.txt`
- **Файл:** `next.config.ts` пустой.
- **Исправление:** Добавить headers в Next config + отключить `poweredByHeader`.

### ISS-010 — Английские Zod-ошибки с `/api/auth/register`
- **Приоритет:** P1
- **Шаги:** `POST /api/auth/register` body `{}`
- **Факт:** `"Invalid input: expected string, received undefined"` + raw `fieldErrors`.
- **Лог:** `audit-panel/logs/register-validation-*.json`
- **Исправление:** Прогонять через `toUserMessage` / русские сообщения; не отдавать raw Zod клиенту.

### ISS-011 — Нет app-level rate limit на login
- **Приоритет:** P1
- **Факт:** Rate limit есть только на register (`allowRegisterAttempt`). Login идёт напрямую в Supabase `signInWithPassword`.
- **Исправление:** Throttle/backoff на клиенте + серверный rate limit / Supabase dashboard limits документировать.

### ISS-012 — Две конфликтующие матрицы прав
- **Приоритет:** P1
- **Факт:** `src/lib/access.ts` (UI): partner **без** reports/settings.  
  `src/lib/auth/access.ts`: partner **с** reports/settings; manager без partners.
- **Исправление:** Удалить дубликат или сделать единый источник правды + тесты.

### ISS-013 — `/deals` без `RoleGuard`
- **Приоритет:** P1
- **Файл:** `src/app/deals/page.tsx` — `RoleGuard` импортирован, не используется (lint unused).
- **Исправление:** Обернуть в `RoleGuard resource="deals"` как остальные CRM страницы.

### ISS-014 — Console: массовые 401 на публичных страницах
- **Приоритет:** P1
- **Факт:** Playwright: `consoleErrorRoutes: 32` на production — `/api/auth/me` и bootstrap при анонимном визите.
- **Лог:** `audit-panel/logs/playwright-audit-prod.json`
- **Исправление:** Не дергать bootstrap/me на публичных auth-страницах.

### ISS-015 — Нет custom 404 / error UI
- **Приоритет:** P1
- **Факт:** Нет `src/app/not-found.tsx` / `error.tsx`. Неизвестный URL → английский Next default «This page could not be found.»
- **Исправление:** Брендированный 404/error на русском.

### ISS-016 — LCP ~5.3s на `/login` (production)
- **Приоритет:** P1
- **Лог:** `audit-panel/logs/cwv-login.txt`, `lighthouse-login.json`
- **Метрики:** FCP 1.1s, LCP 5.3s, TTI 5.3s, transfer bytes ~903 KiB; local chunks до ~950 KB.
- **Исправление:** Оптимизировать `fon-hero.png`, отложить auth scripts, code-split.

### ISS-017 — Нет нормального test runner в package.json
- **Приоритет:** P1
- **Факт:** Нет `test` script; unit требует `tsx --test`; e2e не в CI; `@playwright/test` не в deps.
- **Исправление:** Добавить `test`/`test:e2e`, гонять в CI.

### ISS-018 — Ошибки логина без `role="alert"`
- **Приоритет:** P1 (a11y)
- **Факт:** Текст «Неверный email или пароль» показывается, но не в a11y-tree как alert; screen reader может пропустить.
- **Файл:** `src/app/login/login-form.tsx` + `authErrorClass`
- **Исправление:** `role="alert"` / `aria-live="assertive"`.

---

## P2 — заметные проблемы

### ISS-019 — README — шаблон create-next-app
- Не описывает TIVONIX, env, роли, деплой.

### ISS-020 — `/pending` и `/blocked` публичны на уровне middleware
- HTTP 200 без сессии; клиент редиректит на login. Лишний surface.

### ISS-021 — Неиспользуемая переменная `allowed` в deals PATCH
- `src/app/api/deals/[id]/route.ts:23` — whitelist объявлен, не используется; amount патчится отдельно.

### ISS-022 — Reports API без жёсткого admin role gate
- Опирается на RLS/`security_invoker` (отмечено в FINAL audit как LOW/residual).

### ISS-023 — Deals/payouts PATCH без Zod
- Field whitelist вместо схемы.

### ISS-024 — Touch targets < 40px на auth страницах
- Playwright viewport: 2–6 small targets на login/register.

### ISS-025 — Низкий контраст secondary текста
- `text-[var(--color-ash-gray)]` labels на белом.

### ISS-026 — ESLint require() в `scripts/*.cjs`
- Шум; scripts должны быть ignore.

### ISS-027 — Middleware deprecation warning (Next 16)
- «middleware → proxy» при build.

### ISS-028 — `FINAL_BACKEND_AUDIT.md` частично устарел
- Пишет что register отключён; сейчас полный self-registration.

### ISS-029 — Утечка `x-powered-by: Next.js`
- Fingerprinting.

### ISS-030 — Двойной клик на login
- Button disabled во время loading — OK; на register empty HTML5 validation без явного UI feedback кроме native browser.

### ISS-031 — Отсутствует подтверждение опасных CRM-действий (не проверено с auth)
- Код имеет модалки, но user flows не прогнаны без учётки.

### ISS-032 — Local `/login` timeout при нагрузочном crawl
- `audit-panel/logs/playwright-audit.json` (local) имел TimeoutError на `/login` — нестабильность под параллельной нагрузкой.

---

## P3 — косметика / улучшения

### ISS-033 — Placeholder «Иван Иванов» / Agency Studio
- Не lorem, но демо-стиль.

### ISS-034 — Навигация «Войти» скрыта на узких экранах (sm:inline)
- На мобилке остаётся только CTA «Стать партнёром» — приемлемо, но можно улучшить.

### ISS-035 — Shadow на auth card (`shadow-subtle`)
- Минимальный, допустим; следить за «шумом».

### ISS-036 — Нет npm script typecheck в CI docs
- Scripts есть, README не документирует.

### ISS-037 — PostCSS moderate advisory через next
- Зависит от апдейта Next.

### ISS-038 — favikon.png в корне репо untracked
- Дубль `public/images/favikon.png`.

### ISS-039 — RoleSwitcher violation rules-of-hooks
- В prod DEMO=false всегда early-return; latent bug.

### ISS-040 — Отсутствие Lighthouse category scores в отчёте LH
- Частичный LH JSON (`categories: {}`); CWV audits присутствуют.
