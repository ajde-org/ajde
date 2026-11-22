-- Anyone with the public key could list the profile-photos bucket (AJDE-50), which returned every
-- user's folder (their auth UUID) and photos. A public bucket serves files by URL without any
-- SELECT policy, so photos still load on ride pages and share links. Signed-in users keep SELECT on
-- their own folder only, which upload, update and remove need.
drop policy "Profile photos are publicly readable" on storage.objects;

create policy "Users read their own profile photos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'profile-photos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
