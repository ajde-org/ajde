-- Included by schema_smoke.sql. Who can read contact details through profile_contacts().
-- Profiles 94…1 driver, 2 and 3 accepted, 4 requested, 5 declined, 6 stranger. All writes roll back.
begin;
insert into auth.users(id)
select ('94000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid from generate_series(1, 6) n;
insert into public.profiles(id, full_name, photo_url, university, phone, instagram)
select id, 'Contact Student', 'https://example.com/photo.png', 'UKIM',
  '+3897000000' || right(id::text, 1), 'student_' || right(id::text, 1)
from auth.users where id::text like '94000000%';
insert into public.rides(id, driver_id, origin_city_id, dest_city_id, departure_at, seats_total, seats_available, status)
values ('95000000-0000-4000-8000-000000000001', '94000000-0000-4000-8000-000000000001', 1, 2,
  now() + interval '1 day', 4, 4, 'published');
insert into public.bookings(ride_id, passenger_id, status, decided_at)
select '95000000-0000-4000-8000-000000000001', ('94000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
  case n when 4 then 'requested'::public.booking_status when 5 then 'declined'::public.booking_status
    else 'accepted'::public.booking_status end,
  case when n = 4 then null else now() end
from generate_series(2, 5) n;

create function pg_temp.assert_true(value boolean, label text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'FAIL: %', label; end if; end $$;
-- Last digits of the profiles whose contacts the current viewer can read, e.g. '1,2,3'.
create function pg_temp.visible() returns text language sql as $$
  select coalesce(string_agg(right(id::text, 1), ',' order by id), '')
  from public.profile_contacts(array(select id from public.profiles where id::text like '94000000%'))
$$;
create function pg_temp.as_user(n int) returns void language sql as $$
  select set_config('request.jwt.claim.sub', '94000000-0000-4000-8000-' || lpad(n::text, 12, '0'), true)
$$;

grant execute on function pg_temp.visible() to anon, authenticated;

set local role authenticated;
select pg_temp.as_user(1);
select pg_temp.assert_true(pg_temp.visible() = '1,2,3,4', 'driver sees self, accepted and requested passengers');
select pg_temp.as_user(2);
select pg_temp.assert_true(pg_temp.visible() = '1,2,3', 'accepted passenger sees self, driver and co-passenger');
select pg_temp.assert_true((select phone from public.profile_contacts(array['94000000-0000-4000-8000-000000000001'::uuid])) = '+38970000001', 'accepted passenger reads driver phone');
select pg_temp.as_user(4);
select pg_temp.assert_true(pg_temp.visible() = '4', 'requester sees only self');
select pg_temp.as_user(5);
select pg_temp.assert_true(pg_temp.visible() = '5', 'declined passenger sees only self');
select pg_temp.as_user(6);
select pg_temp.assert_true(pg_temp.visible() = '6', 'stranger sees only self');
reset role;

-- The chat roster lists accepted members to room members only.
set local role authenticated;
select pg_temp.as_user(2);
select pg_temp.assert_true((select string_agg(right(passenger_id::text, 1), ',' order by passenger_id) from public.ride_room_roster('95000000-0000-4000-8000-000000000001')) = '2,3', 'room member reads the accepted roster');
select pg_temp.as_user(4);
select pg_temp.assert_true((select count(*) from public.ride_room_roster('95000000-0000-4000-8000-000000000001')) = 0, 'requester reads no roster');
select pg_temp.as_user(6);
select pg_temp.assert_true((select count(*) from public.ride_room_roster('95000000-0000-4000-8000-000000000001')) = 0, 'stranger reads no roster');
reset role;

-- Cancelling an accepted booking withdraws access both ways.
update public.bookings set status = 'cancelled', decided_at = null
where passenger_id = '94000000-0000-4000-8000-000000000003';
set local role authenticated;
select pg_temp.as_user(3);
select pg_temp.assert_true(pg_temp.visible() = '3', 'cancelled passenger loses access');
select pg_temp.as_user(1);
select pg_temp.assert_true(pg_temp.visible() = '1,2,4', 'driver loses cancelled passenger');
reset role;

-- More than 200 ids fail loudly instead of returning an empty set.
set local role authenticated;
select pg_temp.as_user(1);
do $$ begin
  perform public.profile_contacts(array(select gen_random_uuid() from generate_series(1, 201)));
  raise exception 'FAIL: profile_contacts accepted 201 ids';
exception when invalid_parameter_value then null;
end $$;
select pg_temp.assert_true((select count(*) from public.profile_contacts(array(select gen_random_uuid() from generate_series(1, 200)))) = 0, '200 ids are accepted');
reset role;

set local role anon;
do $$ begin
  perform public.profile_contacts(array['94000000-0000-4000-8000-000000000001'::uuid]);
  raise exception 'FAIL: anon executed profile_contacts';
exception when insufficient_privilege then null;
end $$;
reset role;

rollback;
