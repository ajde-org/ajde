-- Contact details (phone and social links) are private to a profile's owner and the people they
-- share a ride with (AJDE-16). The app reads them only through this function, so the RLS migration
-- can then withdraw direct SELECT on those columns without breaking it.
--
-- A viewer sees a profile's contacts when the profile is:
--   * their own;
--   * a passenger with a requested or accepted booking on a ride the viewer drives;
--   * the driver of a ride where the viewer's booking is accepted;
--   * another accepted passenger on a ride where the viewer's booking is accepted.
--
-- At most 200 ids per call: larger requests fail loudly rather than returning nothing, and the app
-- batches its lookups.
create function public.profile_contacts(profile_ids uuid[])
returns table (id uuid, phone text, instagram text, facebook text, social_url text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if cardinality(profile_ids) > 200 then
    raise exception 'profile_contacts accepts at most 200 ids, got %', cardinality(profile_ids)
      using errcode = '22023';
  end if;
  return query
  with viewer as (
    select auth.uid() as id
  ),
  driven_rides as (
    select r.id from public.rides r, viewer v where r.driver_id = v.id
  ),
  joined_rides as (
    select b.ride_id as id from public.bookings b, viewer v
    where b.passenger_id = v.id and b.status = 'accepted'
  ),
  visible as (
    select v.id as profile_id from viewer v
    union
    select b.passenger_id from public.bookings b join driven_rides d on d.id = b.ride_id
    where b.status in ('requested', 'accepted')
    union
    select r.driver_id from public.rides r join joined_rides j on j.id = r.id
    where r.driver_id is not null
    union
    select b.passenger_id from public.bookings b join joined_rides j on j.id = b.ride_id
    where b.status = 'accepted'
  )
  select p.id, p.phone, p.instagram, p.facebook, p.social_url
  from public.profiles p
  join visible on visible.profile_id = p.id
  where p.id = any(profile_ids)
    and (select v.id from viewer v) is not null;
end;
$$;

revoke all on function public.profile_contacts(uuid[]) from public, anon, authenticated;
grant execute on function public.profile_contacts(uuid[]) to authenticated;
