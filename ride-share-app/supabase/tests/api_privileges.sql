-- Included by schema_smoke.sql. Table privileges for the API roles (anon, authenticated).
-- All writes are rolled back.
begin;
insert into auth.users(id) values ('93000000-0000-4000-8000-000000000001');
insert into public.profiles(id, full_name, photo_url, university)
values ('93000000-0000-4000-8000-000000000001', 'Privilege Student', 'https://example.com/photo.png', 'UKIM');

create function pg_temp.assert_true(value boolean, label text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'FAIL: %', label; end if; end $$;
create function pg_temp.denied(sql text, label text) returns void language plpgsql as $$
begin
  begin execute sql; exception when insufficient_privilege then return; end;
  raise exception 'FAIL: expected authorization denial: %', label;
end $$;

-- Logged-out visitors can read catalogs but never write.
set local role anon;
select pg_temp.assert_true((select count(*) from public.cities) > 0, 'anon reads cities');
select pg_temp.denied($q$insert into public.cities(name_mk, name_en, lat, lng) values ('Тест', 'Test', 41, 21)$q$, 'anon inserts city');
select pg_temp.denied($q$update public.rides set notes = 'x'$q$, 'anon updates rides');
select pg_temp.denied($q$delete from public.bookings$q$, 'anon deletes bookings');
select pg_temp.denied($q$update public.profiles set full_name = 'x'$q$, 'anon updates profiles');
select pg_temp.denied($q$truncate public.rides cascade$q$, 'anon truncates rides');
select pg_temp.denied($q$select 1 from public.reports$q$, 'anon reads reports');
reset role;

-- Logged-in users: catalogs are read-only, unused tables are closed, verification is not self-service.
set local role authenticated;
select set_config('request.jwt.claim.sub', '93000000-0000-4000-8000-000000000001', true);
select pg_temp.denied($q$insert into public.cities(name_mk, name_en, lat, lng) values ('Тест', 'Test', 41, 21)$q$, 'user inserts city');
select pg_temp.denied($q$delete from public.car_models$q$, 'user deletes car models');
select pg_temp.denied($q$select 1 from public.ride_comments$q$, 'user reads ride comments');
select pg_temp.denied($q$insert into public.reports(reporter_id, target_user_id, reason) values (auth.uid(), null, 'x')$q$, 'user writes reports');
select pg_temp.denied($q$truncate public.bookings$q$, 'user truncates bookings');
select pg_temp.denied($q$update public.profiles set verified_at = now() where id = auth.uid()$q$, 'user verifies self');
update public.profiles set full_name = 'Renamed Student' where id = auth.uid();
select pg_temp.assert_true((select full_name from public.profiles where id = auth.uid()) = 'Renamed Student', 'user edits own name');
-- Same statement shape as a PostgREST upsert (onboarding).
insert into public.profiles(id, full_name, photo_url, university)
values (auth.uid(), 'Upserted Student', 'https://example.com/photo.png', 'UKIM')
on conflict (id) do update set id = excluded.id, full_name = excluded.full_name,
  photo_url = excluded.photo_url, university = excluded.university;
select pg_temp.assert_true((select full_name from public.profiles where id = auth.uid()) = 'Upserted Student', 'user upserts own profile');
do $$ begin
  update public.profiles set id = gen_random_uuid() where id = auth.uid();
  raise exception 'FAIL: profile id changed';
exception when check_violation then null;
end $$;
reset role;

rollback;
