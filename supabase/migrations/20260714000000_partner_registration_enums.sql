-- Add partner application statuses (must commit before use in later migration)
do $$
begin
  if not exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'user_status' and e.enumlabel = 'pending'
  ) then
    alter type public.user_status add value 'pending';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'user_status' and e.enumlabel = 'rejected'
  ) then
    alter type public.user_status add value 'rejected';
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'user_status' and e.enumlabel = 'suspended'
  ) then
    alter type public.user_status add value 'suspended';
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'partner_type') then
    create type public.partner_type as enum ('referral', 'white_label');
  end if;
end $$;
