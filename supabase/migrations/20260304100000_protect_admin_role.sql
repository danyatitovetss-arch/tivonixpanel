-- Prevent accidental admin demotion via authenticated client updates.
create or replace function public.protect_admin_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op <> 'UPDATE' then
    return new;
  end if;

  if old.role = 'admin' and new.role is distinct from 'admin' then
    -- service_role / SQL scripts may change roles explicitly
    if auth.uid() is null then
      return new;
    end if;
    new.role := old.role;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_admin_role on public.profiles;
create trigger profiles_protect_admin_role
  before update on public.profiles
  for each row execute function public.protect_admin_profile_role();
