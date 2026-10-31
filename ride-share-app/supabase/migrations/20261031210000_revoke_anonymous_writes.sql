-- Stopgap before full RLS (AJDE-16). Most public tables still have RLS disabled, and
-- Supabase grants anon and authenticated every privilege on new tables by default, so
-- anyone holding the public key could insert, update or delete rows.
--
-- This migration removes the privileges no app flow needs. Row-level rules (who may
-- change which row) come with the RLS migration; until then logged-in users can still
-- edit other users' rows in tables without RLS.

-- Logged-out visitors never write. TRUNCATE also bypasses RLS, so no API role gets it.
revoke insert, update, delete, truncate, references, trigger
  on all tables in schema public from anon;
revoke truncate, references, trigger
  on all tables in schema public from authenticated;

-- Tables created by later migrations must not hand anon write access again.
alter default privileges for role postgres in schema public
  revoke insert, update, delete, truncate, references, trigger on tables from anon;
alter default privileges for role postgres in schema public
  revoke truncate, references, trigger on tables from authenticated;

-- Catalogs are maintained through migrations only.
revoke insert, update, delete
  on public.cities, public.pickup_points, public.car_models from authenticated;

-- No app feature uses these tables yet.
revoke all on public.ride_comments, public.reports from anon, authenticated;

-- Users must not mark themselves verified. PostgREST upserts (onboarding) write every
-- payload column in the update branch, id included, so UPDATE on id is granted and the
-- trigger below rejects any actual id change.
revoke insert, update on public.profiles from authenticated;
grant insert (id, full_name, photo_url, university, phone, instagram, facebook, bio, gender,
  social_url, driver_details)
  on public.profiles to authenticated;
grant update (id, full_name, photo_url, university, phone, instagram, facebook, bio, gender,
  social_url, driver_details)
  on public.profiles to authenticated;

create function public.guard_profile_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.id <> old.id then
    raise exception 'A profile id cannot be changed' using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke execute on function public.guard_profile_identity() from public, anon, authenticated;

create trigger profiles_guard_identity
before update on public.profiles
for each row execute function public.guard_profile_identity();
