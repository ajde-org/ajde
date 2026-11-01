-- Included by schema_smoke.sql. Row Level Security on rides, bookings, cars, profiles, imports and
-- trip shares, exercised as real API roles. All writes roll back.
--
-- Users (96…N): 1 driver (woman), 2 accepted passenger (woman), 3 accepted passenger (man),
-- 4 requester (man), 5 stranger (man), 6 stranger (woman).
-- Rides (97…N): 1 published, 2 the driver's draft, 3 published women-only ("same_as_driver"),
-- 4 published but departed an hour ago (passenger 2 accepted, stranger 6 still requested).
begin;
insert into auth.users(id)
select ('96000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid from generate_series(1, 6) n;
insert into public.profiles(id, full_name, photo_url, university, phone, gender)
select id, 'RLS Student ' || right(id::text, 1), 'https://example.com/photo.png', 'UKIM',
  '+3897100000' || right(id::text, 1),
  case when right(id::text, 1) in ('1', '2', '6') then 'woman'::public.profile_gender else 'man'::public.profile_gender end
from auth.users where id::text like '96000000%';
insert into public.cars(id, owner_id, make, model, fuel_type, consumption_l_100km, seats_total) values
  ('98000000-0000-4000-8000-000000000001', '96000000-0000-4000-8000-000000000001', 'Renault', 'Clio', 'petrol', 6, 4),
  ('98000000-0000-4000-8000-000000000002', '96000000-0000-4000-8000-000000000001', 'Skoda', 'Fabia', 'diesel', 5, 4);
insert into public.rides(id, driver_id, car_id, origin_city_id, dest_city_id, departure_at, seats_total, seats_available, status, gender_preference) values
  ('97000000-0000-4000-8000-000000000001', '96000000-0000-4000-8000-000000000001', '98000000-0000-4000-8000-000000000001', 1, 2, now() + interval '2 days', 4, 4, 'published', 'any'),
  ('97000000-0000-4000-8000-000000000002', '96000000-0000-4000-8000-000000000001', '98000000-0000-4000-8000-000000000002', 1, 2, now() + interval '3 days', 4, 4, 'draft', 'any'),
  ('97000000-0000-4000-8000-000000000003', '96000000-0000-4000-8000-000000000001', '98000000-0000-4000-8000-000000000001', 2, 1, now() + interval '4 days', 4, 4, 'published', 'same_as_driver'),
  ('97000000-0000-4000-8000-000000000004', '96000000-0000-4000-8000-000000000001', '98000000-0000-4000-8000-000000000001', 1, 3, now() - interval '1 hour', 4, 4, 'published', 'any');
insert into public.bookings(id, ride_id, passenger_id, status, decided_at) values
  ('99000000-0000-4000-8000-000000000002', '97000000-0000-4000-8000-000000000001', '96000000-0000-4000-8000-000000000002', 'accepted', now() - interval '1 hour'),
  ('99000000-0000-4000-8000-000000000003', '97000000-0000-4000-8000-000000000001', '96000000-0000-4000-8000-000000000003', 'accepted', now() - interval '1 hour'),
  ('99000000-0000-4000-8000-000000000005', '97000000-0000-4000-8000-000000000004', '96000000-0000-4000-8000-000000000002', 'accepted', now() - interval '2 hours'),
  ('99000000-0000-4000-8000-000000000006', '97000000-0000-4000-8000-000000000004', '96000000-0000-4000-8000-000000000006', 'requested', null),
  ('99000000-0000-4000-8000-000000000004', '97000000-0000-4000-8000-000000000001', '96000000-0000-4000-8000-000000000004', 'requested', null);
update public.bookings set message = 'Private note to the driver' where id = '99000000-0000-4000-8000-000000000003';
insert into public.imports(id, raw_text, created_by)
values ('9a000000-0000-4000-8000-000000000001', 'Skopje to Bitola tomorrow', '96000000-0000-4000-8000-000000000001');

create function pg_temp.assert_true(value boolean, label text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'FAIL: %', label; end if; end $$;
create function pg_temp.denied(sql text, label text) returns void language plpgsql as $$
begin
  begin execute sql; exception when insufficient_privilege then return; end;
  raise exception 'FAIL: expected denial: %', label;
end $$;
-- Rows a statement changed; RLS silently skips rows outside an UPDATE/DELETE policy.
create function pg_temp.affected(sql text) returns integer language plpgsql as $$
declare n integer; begin execute sql; get diagnostics n = row_count; return n; end $$;
-- Statements a trigger rejects as an invalid ride lifecycle change.
create function pg_temp.rejected(sql text, label text) returns void language plpgsql as $$
begin
  begin execute sql; exception when check_violation then return; end;
  raise exception 'FAIL: expected lifecycle rejection: %', label;
end $$;
create function pg_temp.as_user(n int) returns void language sql as $$
  select set_config('request.jwt.claim.sub', '96000000-0000-4000-8000-' || lpad(n::text, 12, '0'), true)
$$;
grant execute on function pg_temp.assert_true(boolean, text), pg_temp.denied(text, text),
  pg_temp.affected(text), pg_temp.rejected(text, text), pg_temp.as_user(int) to anon, authenticated;

-- Logged out: public profiles and catalogs only, no contacts, no trip data.
set local role anon;
select pg_temp.assert_true((select count(*) from public.profiles where id::text like '96000000%') = 6, 'anon reads public profiles');
select pg_temp.denied($q$select phone from public.profiles$q$, 'anon reads phone');
select pg_temp.denied($q$select 1 from public.rides$q$, 'anon reads rides');
select pg_temp.denied($q$select 1 from public.bookings$q$, 'anon reads bookings');
select pg_temp.denied($q$select 1 from public.cars$q$, 'anon reads cars');
select pg_temp.denied($q$select 1 from public.trip_shares$q$, 'anon reads trip shares');
select pg_temp.assert_true((select count(*) from public.pickup_points) > 0, 'anon reads pickup points');
reset role;

set local role authenticated;

-- Stranger (5).
select pg_temp.as_user(5);
select pg_temp.denied($q$select phone from public.profiles$q$, 'user reads phone column');
select pg_temp.denied($q$select instagram from public.profiles$q$, 'user reads instagram column');
select pg_temp.assert_true((select count(*) from public.rides where id::text like '97000000%') = 3, 'stranger sees published rides, not drafts');
select pg_temp.assert_true((select count(*) from public.bookings where ride_id::text like '97000000%') = 0, 'stranger sees no bookings');
select pg_temp.assert_true((select count(*) from public.cars where id::text like '98000000%') = 1, 'stranger sees only the car of a visible ride');
select pg_temp.assert_true((select count(*) from public.imports) = 0, 'stranger sees no imports');
select pg_temp.assert_true(pg_temp.affected($q$update public.rides set status = 'cancelled' where id = '97000000-0000-4000-8000-000000000001'$q$) = 0, 'stranger cannot cancel a ride');
select pg_temp.assert_true(pg_temp.affected($q$update public.profiles set full_name = 'Hijacked' where id = '96000000-0000-4000-8000-000000000001'$q$) = 0, 'stranger cannot edit another profile');
select pg_temp.denied($q$update public.rides set seats_available = 0$q$, 'user writes ride seats');
select pg_temp.denied($q$insert into public.rides(driver_id, origin_city_id, dest_city_id, departure_at, seats_total, seats_available) values (auth.uid(), 1, 2, now() + interval '1 day', 3, 3)$q$, 'user inserts ride directly');
select pg_temp.denied($q$insert into public.bookings(ride_id, passenger_id) values ('97000000-0000-4000-8000-000000000002', auth.uid())$q$, 'request seat on a draft');
select pg_temp.denied($q$insert into public.bookings(ride_id, passenger_id) values ('97000000-0000-4000-8000-000000000003', auth.uid())$q$, 'man requests women-only ride');
select pg_temp.denied($q$insert into public.bookings(ride_id, passenger_id) values ('97000000-0000-4000-8000-000000000001', '96000000-0000-4000-8000-000000000006')$q$, 'request seat for someone else');
select pg_temp.denied($q$insert into public.bookings(ride_id, passenger_id, status) values ('97000000-0000-4000-8000-000000000001', auth.uid(), 'accepted')$q$, 'self-accepted booking');
insert into public.bookings(ride_id, passenger_id, message) values ('97000000-0000-4000-8000-000000000001', auth.uid(), 'Room for one?');
select pg_temp.assert_true((select count(*) from public.bookings where ride_id = '97000000-0000-4000-8000-000000000001') = 1, 'requester sees only own booking');
select pg_temp.denied($q$insert into public.trip_shares(booking_id, expires_at) values ('99000000-0000-4000-8000-000000000002', now() + interval '1 day')$q$, 'share someone else''s booking');
select pg_temp.denied($q$insert into public.imports(raw_text, created_by) values ('x', '96000000-0000-4000-8000-000000000001')$q$, 'import as someone else');
insert into public.imports(raw_text, created_by) values ('My own import', auth.uid());
select pg_temp.denied($q$insert into public.cars(owner_id, make, model, fuel_type, consumption_l_100km, seats_total) values ('96000000-0000-4000-8000-000000000001', 'A', 'B', 'petrol', 5, 4)$q$, 'add car for someone else');

-- Women-only ride accepts a woman (6).
select pg_temp.as_user(6);
insert into public.bookings(ride_id, passenger_id) values ('97000000-0000-4000-8000-000000000003', auth.uid());

-- Driver (1).
select pg_temp.as_user(1);
select pg_temp.assert_true((select count(*) from public.rides where id::text like '97000000%') = 4, 'driver sees own draft');
select pg_temp.assert_true((select count(*) from public.bookings where ride_id = '97000000-0000-4000-8000-000000000001') = 4, 'driver sees every booking on own ride');
select pg_temp.assert_true((select count(*) from public.imports) = 1, 'driver sees own import');
select pg_temp.denied($q$insert into public.bookings(ride_id, passenger_id) values ('97000000-0000-4000-8000-000000000001', auth.uid())$q$, 'driver books own ride');
select pg_temp.denied($q$update public.bookings set seats = 4$q$, 'driver changes booked seats');
select pg_temp.denied($q$update public.bookings set status = 'accepted', decided_at = now() - interval '1 day' where id = '99000000-0000-4000-8000-000000000004'$q$, 'driver backdates a decision');
select pg_temp.denied($q$update public.bookings set status = 'cancelled' where id = '99000000-0000-4000-8000-000000000004'$q$, 'driver cancels a request');
select pg_temp.assert_true(pg_temp.affected($q$update public.bookings set status = 'accepted', decided_at = now() where id = '99000000-0000-4000-8000-000000000004'$q$) = 1, 'driver accepts a request');
select pg_temp.assert_true((select seats_available from public.rides where id = '97000000-0000-4000-8000-000000000001') = 1, 'seats follow accepted bookings');
select pg_temp.assert_true(pg_temp.affected($q$update public.bookings set status = 'declined', decided_at = now() where id = '99000000-0000-4000-8000-000000000002'$q$) = 0, 'driver cannot re-decide an accepted booking');

-- Accepted passenger (2): own booking only; the room roster comes from ride_room_roster().
select pg_temp.as_user(2);
select pg_temp.assert_true((select count(*) from public.bookings where ride_id = '97000000-0000-4000-8000-000000000001') = 1, 'passenger sees only own booking');
select pg_temp.assert_true((select count(*) from public.bookings where message = 'Private note to the driver') = 0, 'co-passenger cannot read a request message');
select pg_temp.assert_true((select count(*) from public.ride_room_roster('97000000-0000-4000-8000-000000000001')) = 3, 'room member reads the accepted roster');
select pg_temp.assert_true(pg_temp.affected($q$update public.rides set status = 'cancelled'$q$) = 0, 'passenger cannot cancel the ride');
select pg_temp.assert_true(pg_temp.affected($q$update public.bookings set status = 'accepted', decided_at = now() where id = '99000000-0000-4000-8000-000000000003'$q$) = 0, 'passenger cannot decide bookings');
insert into public.trip_shares(booking_id, expires_at) values ('99000000-0000-4000-8000-000000000002', now() + interval '3 days');
select pg_temp.assert_true((select count(*) from public.trip_shares) = 1, 'passenger sees own share');
select pg_temp.assert_true(pg_temp.affected($q$update public.bookings set status = 'cancelled', decided_at = null where id = '99000000-0000-4000-8000-000000000002'$q$) = 1, 'passenger cancels own booking');

-- Stranger cannot see or delete the share, nor read a room roster.
select pg_temp.as_user(5);
select pg_temp.assert_true((select count(*) from public.ride_room_roster('97000000-0000-4000-8000-000000000001')) = 0, 'stranger reads no roster');
select pg_temp.assert_true((select count(*) from public.trip_shares) = 0, 'stranger sees no shares');
select pg_temp.assert_true(pg_temp.affected($q$delete from public.trip_shares$q$) = 0, 'stranger deletes no shares');

-- The driver sees the request message; the ride lifecycle is enforced for status changes.
select pg_temp.as_user(1);
select pg_temp.assert_true((select count(*) from public.bookings where message = 'Private note to the driver') = 1, 'driver reads the request message');
select pg_temp.rejected($q$update public.rides set status = 'completed' where id = '97000000-0000-4000-8000-000000000001'$q$, 'complete a ride before departure');
select pg_temp.rejected($q$update public.rides set status = 'draft' where id = '97000000-0000-4000-8000-000000000001'$q$, 'turn a published ride back into a draft');
select pg_temp.rejected($q$update public.rides set status = 'full' where id = '97000000-0000-4000-8000-000000000001'$q$, 'mark a ride full with seats left');
select pg_temp.rejected($q$update public.rides set status = 'cancelled' where id = '97000000-0000-4000-8000-000000000004'$q$, 'cancel a ride after departure');
select pg_temp.assert_true(pg_temp.affected($q$update public.bookings set status = 'accepted', decided_at = now() where id = '99000000-0000-4000-8000-000000000006'$q$) = 0, 'driver cannot accept after departure');
select pg_temp.assert_true(pg_temp.affected($q$update public.rides set status = 'completed' where id = '97000000-0000-4000-8000-000000000004'$q$) = 1, 'driver completes a departed ride');
select pg_temp.rejected($q$update public.rides set status = 'published' where id = '97000000-0000-4000-8000-000000000004'$q$, 'reopen a completed ride');
select pg_temp.assert_true(pg_temp.affected($q$update public.rides set status = 'cancelled' where id = '97000000-0000-4000-8000-000000000003'$q$) = 1, 'driver cancels own future ride');
select pg_temp.rejected($q$update public.rides set status = 'published' where id = '97000000-0000-4000-8000-000000000003'$q$, 'reopen a cancelled ride');

-- A passenger cannot cancel after completion, which would erase ratings.
select pg_temp.as_user(2);
select pg_temp.assert_true(pg_temp.affected($q$update public.bookings set status = 'cancelled', decided_at = null where id = '99000000-0000-4000-8000-000000000005'$q$) = 0, 'passenger cannot cancel after completion');

-- Profile owner edits own row.
select pg_temp.as_user(1);
select pg_temp.assert_true(pg_temp.affected($q$update public.profiles set bio = 'Driving home on Fridays' where id = auth.uid()$q$) = 1, 'owner edits own profile');
-- Onboarding writes contacts with a plain UPDATE (or INSERT); an upsert would need SELECT on them.
select pg_temp.assert_true(pg_temp.affected($q$update public.profiles set phone = '+38970999888', social_url = null where id = auth.uid()$q$) = 1, 'owner updates own contacts');
select pg_temp.assert_true((select phone from public.profile_contacts(array[auth.uid()])) = '+38970999888', 'owner reads updated phone');
reset role;

rollback;
