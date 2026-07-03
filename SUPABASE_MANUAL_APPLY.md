# Ручное применение миграций Supabase

Проект: `codwkylxpjlinutohflx`  
URL: https://codwkylxpjlinutohflx.supabase.co

CLI `supabase db push` не удалось выполнить автоматически (нет прав link / нет DATABASE_URL).  
Используйте SQL Editor в Dashboard.

## Шаги

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard/project/codwkylxpjlinutohflx/sql/new).
2. Откройте файл `supabase/apply_all_migrations.sql` в репозитории.
3. Скопируйте **весь** SQL и вставьте в SQL Editor.
4. Нажмите **Run**.
5. Если часть объектов уже существует — просмотрите ошибку; отдельные `CREATE` можно пропустить или выполнить оставшиеся миграции по частям (смотрите комментарии `-- ========== filename ==========`).
6. После применения выполните проверку: `supabase/checks/verify_schema.sql`.

## Назначение первого админа

1. Зарегистрируйте пользователя через `/register` (или `/login` → регистрация).
2. Убедитесь, что в таблице `profiles` создана запись.
3. Локально в `.env.local` укажите `ADMIN_EMAIL=ваш@email`.
4. Запустите:

```bash
npm run admin:promote
```

Или в SQL Editor:

```sql
select public.promote_admin_by_email('ваш@email');
```

## Переменные окружения

Скопируйте `.env.local.example` → `.env.local` и заполните секреты локально.  
**Не коммитьте** `.env.local`, `SUPABASE_SECRET_KEY`, пароль PostgreSQL.

## Проверка RLS

После миграций откройте Authentication → Policies и убедитесь, что RLS включён на всех приватных таблицах.  
См. также `SECURITY_CHECKLIST.md`.
