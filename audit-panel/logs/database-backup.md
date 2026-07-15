# Database backup — production QA audit

Дата: 2026-07-15 (UTC)  
Ветка: `audit/full-production-qa`

## Тип базы

- **PostgreSQL** (Supabase hosted)
- Подключение через `DATABASE_URL` (pooler, SSL)

## Backup

| Поле | Значение |
|------|----------|
| Время | 2026-07-15T20:14:30Z (`stamp=20260715-231428`) |
| Способ | Логический snapshot: `node --env-file=.env.local scripts/create-backup-snapshot.cjs backups 20260715-231428` |
| SQL файл | `backups/tivonix-snapshot-20260715-231428.sql` (~86 KB) |
| Auth metadata | `backups/tivonix-auth-users-meta-20260715-231428.json` (без password hash) |
| Meta | `backups/tivonix-snapshot-20260715-231428.meta.json` |
| Git | `backups/` добавлен в `.gitignore` — **не коммитится** |

## Содержимое snapshot (row counts)

| Таблица | Строк |
|---------|------:|
| profiles | 17 |
| user_legal_profiles | 14 |
| leads | 1 |
| deals | 1 |
| balance_transactions | 1 |
| legal_acceptances | 78 |
| audit_logs | 47 |
| auth.users (meta) | 17 |

## Проверка восстановления

- [x] Файлы созданы, meta JSON валиден
- [x] Повторное подключение `SELECT 1` — OK (`db=postgres`)
- [x] Формат: INSERT-only logical backup (не pg_dump)
- [ ] Полный restore на чистый инстанс **не выполнялся** (только техническая проверка файлов)

## Восстановление (ручное, осторожно)

1. Создать staging DB / point-in-time recovery через Supabase Dashboard (предпочтительно для полного DR).
2. Для logical snapshot: выборочно применить INSERT из `.sql` на **staging**, не на production без подтверждения.
3. Auth users восстанавливать через Admin API при необходимости (metadata JSON).

## Ограничения

- Snapshot **не заменяет** Supabase PITR / managed backup.
- Содержит PII — хранится только локально в `backups/`, вне git.
- Перед любыми write-тестами создан свежий snapshot.

## Предыдущий snapshot

- `backups/tivonix-snapshot-20260714-171515.sql` (до текущего аудита)
