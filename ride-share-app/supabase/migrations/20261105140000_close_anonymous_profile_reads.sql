-- Profiles are for signed-in users only (AJDE-50). Logged-out visitors could list every profile's
-- name, university, gender and bio with the public key. The app's profile pages now require sign-in;
-- shared trip links read the driver's name and photo on the server.
drop policy profiles_public_read on public.profiles;
create policy profiles_signed_in_read on public.profiles for select to authenticated using (true);

revoke select on public.profiles from anon;
revoke select (id, full_name, photo_url, university, bio, gender, verified_at, created_at,
  updated_at, driver_details)
  on public.profiles from anon;

-- Rating summaries are shown on profile pages, so they follow the same rule.
revoke execute on function public.profile_rating_summary(uuid) from anon;
