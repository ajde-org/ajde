-- A profile photo must be an image the user uploaded to their own folder in the profile-photos
-- bucket (AJDE-50). Users write photo_url directly, so without this they could point it at another
-- user's photo, or at any URL. The app also renders only photos from our own storage host
-- (lib/profiles/photo.ts), which the database cannot check because the host differs per project.
-- Migrations and the service role are trusted.
create function public.guard_profile_photo()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;
  if tg_op = 'UPDATE' and new.photo_url is not distinct from old.photo_url then
    return new;
  end if;
  if new.photo_url !~ ('^https?://[^/?#@]+/storage/v1/object/public/profile-photos/'
      || new.id::text || '/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)$') then
    raise exception 'A profile photo must be an upload in your own profile-photos folder'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke execute on function public.guard_profile_photo() from public, anon, authenticated;

create trigger profiles_guard_photo
before insert or update of photo_url on public.profiles
for each row execute function public.guard_profile_photo();
