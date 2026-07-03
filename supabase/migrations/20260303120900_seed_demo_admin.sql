-- 10. seed_demo_admin — legal documents v1.0 + admin promotion by email

insert into public.legal_documents (type, title, version, content, status, published_at) values
('terms', 'Пользовательское соглашение', '1.0',
 'Условия использования платформы TIVONIX Partners CRM. Партнёр обязуется соблюдать правила работы с клиентами, не разглашать конфиденциальную информацию и передавать лиды добросовестно.',
 'active', now()),
('privacy', 'Политика конфиденциальности', '1.0',
 'TIVONIX обрабатывает персональные данные партнёров и клиентов в соответствии с применимым законодательством. Данные используются для работы CRM, выплат и связи.',
 'active', now()),
('personal_data_consent', 'Согласие на обработку персональных данных', '1.0',
 'Я даю согласие на обработку моих персональных данных: ФИО, email, телефон, Telegram, платёжные реквизиты — для целей партнёрской программы TIVONIX.',
 'active', now()),
('partner_agreement', 'Договор партнёра', '1.0',
 'Партнёр привлекает клиентов на IT-услуги TIVONIX. Комиссия начисляется после оплаты клиентом. Партнёр не продаёт самостоятельно и не гарантирует сроки разработки.',
 'active', now()),
('commission_rules', 'Правила комиссии', '1.0',
 'До $2000 — 10%. От $2000 — 15%. После 3+ закрытых оплаченных заказов — бонус +10% к базовому проценту. Выплата после подтверждения админом.',
 'active', now()),
('cookies', 'Политика cookies', '1.0',
 'Мы используем cookies для сессии авторизации и сохранения настроек. Отключение cookies может ограничить работу CRM.',
 'active', now())
on conflict (type, version) do nothing;

-- Promote user to admin when email matches app setting (set via Supabase dashboard secret or SQL after deploy)
-- Usage: select public.promote_admin_by_email('admin@example.com');
create or replace function public.promote_admin_by_email(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set role = 'admin', updated_at = now()
  where lower(email) = lower(trim(p_email));
end;
$$;

revoke all on function public.promote_admin_by_email(text) from public;
grant execute on function public.promote_admin_by_email(text) to service_role;
