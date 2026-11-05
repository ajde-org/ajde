-- Drivers need a phone number to publish a ride, as passengers already do to book one (AJDE-50).
-- Checked when a ride is created as published or a draft is published, for requests made on behalf
-- of a signed-in user; migrations, seeds and the service role are trusted. Seat syncing between
-- published and full is not a publish. SECURITY DEFINER because phone is not readable through the API.
create function public.require_driver_phone()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or new.driver_id is null or new.status <> 'published' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.status in ('published', 'full') then
    return new;
  end if;
  -- Mirrors phoneSchema in lib/profiles/contact.ts.
  if not exists (
    select 1 from public.profiles p
    where p.id = new.driver_id
      and regexp_replace(coalesce(p.phone, ''), '[ ()-]', '', 'g') ~ '^\+?[0-9]{7,15}$'
  ) then
    raise exception 'Add a phone number to your profile before publishing a ride'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke execute on function public.require_driver_phone() from public, anon, authenticated;

create trigger rides_require_driver_phone
before insert or update of status on public.rides
for each row execute function public.require_driver_phone();
