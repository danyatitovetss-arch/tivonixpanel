# Вердикт: NO-GO

## Краткое резюме

Панель **не готова** к показу клиентам как готовый продукт и **не готова** к реальной эксплуатации.

Публичная часть (логин, регистрация, legal) выглядит аккуратно и брендово, production отвечает по HTTPS, защищённые маршруты анонима редиректят на `/login`, TypeScript и production build проходят. Но релиз блокируют: **неподтверждённая изоляция данных партнёров и финансовые сценарии**, **High-уязвимость `xlsx` в экспорте**, **опасные footgun’ы DEMO_MODE / пустого Supabase env в middleware**, **падающий lint (48 errors)** и **отсутствие закрытого security checklist**. Без тестовых учёток полный CRM user-flow (лиды → сделки → выплаты) в этом аудите не был пройден — для «реального использования» этого достаточно, чтобы снять GO.

---

## Счётчики

| Приоритет | Кол-во |
|-----------|--------|
| **P0** | **5** |
| **P1** | **13** |
| **P2** | **14** |
| **P3** | **8** |

Полный реестр: [`audit-panel/ISSUES.md`](./ISSUES.md)

---

## Таблица проблем

| ID | Pri | Страница / зона | Шаги | Ожидание | Факт | Причина | Файл | Фикс | Скрин / лог |
|----|-----|-----------------|------|----------|------|---------|------|------|-------------|
| ISS-001 | P0 | CRM / API | Проверить Partner A/B + mark-paid | Изоляция + идемпотентность | SECURITY_CHECKLIST весь `[ ]`; e2e не покрывает | Нет auth E2E / checklist | `SECURITY_CHECKLIST.md` | Прогнать checklist + автотесты | — |
| ISS-002 | P0 | middleware | `DEMO_MODE=true` | Auth всегда | Bypass всех protected | `NextResponse.next()` | `src/middleware.ts:80-82` | Fail closed | — |
| ISS-003 | P0 | middleware | Нет Supabase env | Fail deploy | Passthrough | missing url/key | `src/middleware.ts:116-118` | Hard fail | — |
| ISS-004 | P0 | Export | `npm audit` + export UI | Нет High | `xlsx` High | SheetJS advisories | `src/lib/export.ts:80` | ExcelJS/CSV | `logs/npm-audit.txt` |
| ISS-005 | P0 | Demo seed | Читать seed | Нет чужих PII | Реальные ФИО/telegram | seed | `src/lib/seed-data.ts:23+` | Анонимизировать | — |
| ISS-006 | P1 | CI/quality | `npm run lint` | 0 errors | 48 errors | hooks/effects | много файлов | Починить | `logs/lint.log` |
| ISS-007 | P1 | start | `npm run start` (Win) | Сервер стартует | `${PORT:-3000}` invalid | bash в npm script | `package.json:11` | portable port | `logs/start-prod.log` |
| ISS-008 | P1 | Railway API | healthcheck | 200 health | `/api/auth/me` → 401 | wrong path | `railway.api.toml:7` | `/api/health` | — |
| ISS-009 | P1 | Production headers | Открыть `/login` | CSP/HSTS/XFO | Нет; есть `x-powered-by` | пустой next config | `next.config.ts` | headers() | `logs/prod-security-headers.txt` |
| ISS-010 | P1 | Register API | POST `{}` | RU error | English Zod dump | raw zod | register route | localize | `logs/register-validation-*.json` |
| ISS-011 | P1 | Login | brute force | Rate limit | Только register limited | client→Supabase | login-form | throttle | — |
| ISS-012 | P1 | Roles | Сверить matrices | Один source of truth | Два файла расходятся | duplicate | `access.ts` vs `auth/access.ts` | unify | — |
| ISS-013 | P1 | `/deals` | Сверить guards | RoleGuard | Import unused | forgotten wrap | `deals/page.tsx` | wrap | — |
| ISS-014 | P1 | Public pages | DevTools console | Тихо | 32 route с 401 console | bootstrap/me на public | store/providers | skip fetch | `logs/playwright-audit-prod.json` |
| ISS-015 | P1 | 404 | `/this-does-not-exist` | RU branded | EN Next default | нет not-found | — | add page | — |
| ISS-016 | P1 | `/login` perf | Lighthouse CWV | LCP <2.5s | LCP **5.3s**, ~903 KiB | hero/images/JS | public images | optimize | `logs/cwv-login.txt` |
| ISS-017 | P1 | Tests | `npm test` | CI green | Нет script; e2e вне package | tooling gap | `package.json` | add scripts | — |
| ISS-018 | P1 | Login a11y | Invalid login | alert announced | error без role=alert | markup | `login-form.tsx:142` | role=alert | `screenshots/prod-login-error.png` |

Остальные P2/P3 — в `ISSUES.md`.

---

## Что уже готово хорошо

Проверено фактически в этом аудите:

1. **`tsc --noEmit` PASS** (`audit-panel/logs/typecheck.log`).
2. **`next build` PASS** — все маршруты собираются (`audit-panel/logs/build.log`).
3. **Unit tests PASS** (7/7 через `tsx --test`, commission/age/errors) — `audit-panel/logs/unit-tests.log`.
4. **Production alive:** HTTPS, `/api/health` → `{"ok":true}`, `/login` 200, TTFB ~0.2–0.6s.
5. **Auth gate на CRM:** `/dashboard`, `/leads`, `/admin/*` → **307** на `/login?next=…` без cookie (`logs/prod-routes.txt`).
6. **API без сессии:** `/api/leads`, `/api/bootstrap`, `/api/admin/users` → **401** с русским «Войдите в аккаунт».
7. **Invalid login** на production показывает «Неверный email или пароль»; кнопка уходит в disabled «Загрузка…» (защита от дабл-клика).
8. **Register UX:** выбор Referral / White-label, модалка заявки, согласия, min password 8.
9. **`SUPABASE_SECRET_KEY`** только в server `admin.ts` (`server-only`); в клиентском `.next/static` secret/JWT не найдены.
10. **`.env.local` в `.gitignore`**, example без секретов; локально `NEXT_PUBLIC_DEMO_MODE=false`.
11. **Responsive публичных страниц:** Playwright 360–1920 — **horizontal overflow = 0** на login/register/forgot/legal (62 скрина в `screenshots/`).
12. **Mixed content:** на production login **нет** `http://` ресурсов.
13. **CORS:** OPTIONS с `Origin: evil.example` → **нет** `Access-Control-Allow-Origin` (same-origin модель OK).
14. **Визуальный стиль auth:** минимализм TIVONIX, coral CTA, без неона/пузырей; понятное назначение панели новому пользователю на `/login` и `/register`.
15. **Данные в Supabase** (не in-memory): архитектура bootstrap/API + migrations/RLS в репо (с оговоркой ISS-001 — не верифицированы live).

---

## Что обязательно исправить перед показом клиентам

### P0
1. Закрыть `SECURITY_CHECKLIST` (особенно Partner A/B + payouts idempotency) **с демо-учётками**.
2. Убрать/заблокировать DEMO_MODE и env-missing passthrough в middleware.
3. Убрать `xlsx` из production path.
4. Вычистить PII из `seed-data.ts`.

### P1 (минимум перед клиентским показом)
5. Починить lint / hooks.
6. Security headers + правильный healthcheck.
7. Локализовать Zod errors register API.
8. Убрать console 401 на публичных страницах.
9. Брендированный 404.
10. Снизить LCP login (картинка/бандл).
11. Единая матрица прав + RoleGuard на `/deals`.
12. Прогнать полный CRM flow под admin + partner (нужны credentials).

---

## Что можно исправить позже

- README заменить на продуктовую документацию (ISS-019).
- Deals/payouts Zod, reports role gates, touch targets, контраст labels (ISS-021–025).
- Игнор eslint для `scripts/*.cjs`, middleware→proxy migration, stale FINAL audit doc.
- Cosmetics placeholders, favikon в корне, postcss advisory через Next bump.

---

## Финальный чек-лист запуска

| # | Проверка | Результат |
|---|----------|-----------|
| 1 | `npm ci` / зависимости | **PASS** (node_modules present, engines Node ≥22) |
| 2 | TypeScript `typecheck` | **PASS** |
| 3 | Lint | **FAIL** (48 errors) |
| 4 | Unit tests | **PASS** (7/7 via tsx; нет npm script) |
| 5 | Integration/E2E CI | **FAIL** (нет package script; только smoke spec) |
| 6 | Production build | **PASS** |
| 7 | `npm run start` (Windows) | **FAIL** (PORT syntax) |
| 8 | `npx next start -p 3000` | **PASS** (использовано для аудита) |
| 9 | Console clean (public) | **FAIL** (401 spam) |
| 10 | npm audit High | **FAIL** (`xlsx`) |
| 11 | Env example / secrets в client | **PASS** (secret не в bundle) |
| 12 | DEMO_MODE=false local+expected prod | **PASS** local; prod compile-time не извлечён из HTML на 100%, middleware auth работает → DEMO off |
| 13 | Все публичные страницы открываются | **PASS** |
| 14 | Protected → login | **PASS** |
| 15 | Refresh login / register | **PASS** |
| 16 | Unknown URL 404 | **FAIL** (EN default UI) |
| 17 | Invalid / error / success forms | **PARTIAL** (login error OK; empty register = native HTML5; CRM не тестирован) |
| 18 | Double submit login | **PASS** (disabled) |
| 19 | Auth wrong password | **PASS** |
| 20 | Session / roles / IDOR | **FAIL** (не верифицировано без учёток + checklist open) |
| 21 | API validation | **PARTIAL** (401 OK; register Zod EN leak) |
| 22 | Rate limiting | **PARTIAL** (register only) |
| 23 | CORS / HTTPS / mixed | **PASS** |
| 24 | UI brand minimalism (auth) | **PASS** |
| 25 | Responsive 6 viewports (public) | **PASS** (no overflow) |
| 26 | Perf LCP login | **FAIL** (5.3s) |
| 27 | A11y alerts | **FAIL** (login error no role=alert) |
| 28 | Production = current code (smoke) | **PARTIAL** (поведение совпадает с кодом auth/API; full diff deploy не доказан) |
| 29 | User flows 1–10 | **FAIL** / **PARTIAL** (см. ниже) |
| 30 | SECURITY_CHECKLIST | **FAIL** (всё unchecked) |

### User flows (факт)

| # | Flow | Статус |
|---|------|--------|
| 1 | Новый пользователь открывает панель | **PASS** → `/` → login, понятный бренд |
| 2 | Понимает назначение без объяснений | **PASS** (Partners / CRM copy) |
| 3 | Основное целевое действие | **PARTIAL** — регистрация UI OK; полный lead/deal cycle **не прогнан** (нет учётки) |
| 4 | Ошибка и исправление | **PASS** на login invalid credentials |
| 5 | Refresh и продолжение | **PASS** на public; session restore CRM **не проверен** |
| 6 | Телефон | **PASS** публичные страницы (Playwright 360/390) |
| 7 | Пустые данные | **NOT RUN** (нужен CRM login) |
| 8 | Большие данные | **NOT RUN** |
| 9 | API недоступен | **NOT RUN** (намеренный outage) |
| 10 | Истёкшая сессия | **PARTIAL** — API 401 OK; mid-session UX **не проверен** |

---

## Артефакты

| Путь | Содержимое |
|------|------------|
| `audit-panel/PRE-RELEASE-AUDIT.md` | Этот отчёт |
| `audit-panel/ISSUES.md` | Полный реестр дефектов |
| `audit-panel/screenshots/` | 62 скрина (viewports + routes + flows) |
| `audit-panel/logs/` | typecheck, lint, build, start, npm-audit, prod-routes, playwright local/prod, lighthouse CWV, register validation |
| `audit-panel/audit-playwright.mjs` | Краулер аудита |

---

## Ограничения аудита (честно)

1. **Нет предоставленных учёток** admin/partner → клики по CRM-кнопкам, CRUD, payouts, IDOR по ID, expiry mid-session — только code-review + unauth probes.
2. Lighthouse отдал CWV audits, но пустой объект `categories` (инструментальный глюк LH 12); метрики LCP/FCP использованы.
3. Код **не исправлялся** по запросу; для запуска локального сервера на Windows использовался обход `npx next start -p 3000`.

---

## Итог одной строкой

**NO-GO:** красивая auth-оболочка и рабочие гейты «без логина» есть; **доказанной готовности CRM/безопасности/качества релиза для клиентов нет.**
