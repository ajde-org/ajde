-- Included by schema_smoke.sql. The server-only routing permit (AJDE-56): one global slot per
-- 1.2 s, and at most 10 granted permits per user per 5 minutes. Runs as the service role.
-- All writes are rolled back.
begin;
insert into auth.users(id) values ('95000000-0000-4000-8000-000000000001'), ('95000000-0000-4000-8000-000000000002');
set local role service_role;

create function pg_temp.assert_true(value boolean, label text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'FAIL: %', label; end if; end $$;
-- Free the global slot, as if 1.2 s had passed since the last permit.
create function pg_temp.free_slot() returns void language sql as $$
  update public.ride_routing_gate set last_request_at = '-infinity' where id
$$;
create function pg_temp.permit(n int) returns text language sql as $$
  select public.try_ride_routing_request(('95000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid) ->> 'status'
$$;
reset role;
grant execute on function pg_temp.assert_true(boolean, text), pg_temp.free_slot(), pg_temp.permit(int) to service_role;
set local role service_role;

-- The global slot: one permit, then busy until it is free again.
select pg_temp.free_slot();
select pg_temp.assert_true(pg_temp.permit(1) = 'granted', 'first permit granted');
select pg_temp.assert_true(pg_temp.permit(2) = 'busy', 'second user waits for the global slot');
select pg_temp.assert_true(
  (select lookups from public.ride_routing_user_usage where user_id = '95000000-0000-4000-8000-000000000002') = 0,
  'a busy answer does not count towards the user''s limit');

-- The per-user limit: 10 granted permits per window, then user_limit with a retry time.
do $$
begin
  for i in 2..10 loop
    perform pg_temp.free_slot();
    if pg_temp.permit(1) <> 'granted' then raise exception 'FAIL: permit % within the limit was refused', i; end if;
  end loop;
end $$;
select pg_temp.free_slot();
select pg_temp.assert_true(pg_temp.permit(1) = 'user_limit', 'eleventh permit in the window is refused');
select pg_temp.assert_true(
  (public.try_ride_routing_request('95000000-0000-4000-8000-000000000001') ->> 'retry_after_ms')::bigint between 1 and 300000,
  'user_limit carries the time until the window resets');
select pg_temp.assert_true(
  (select last_request_at from public.ride_routing_gate) = '-infinity',
  'a user over the limit does not take the global slot');
select pg_temp.assert_true(pg_temp.permit(2) = 'granted', 'other users still get the global slot');

-- A new window starts once the old one has passed.
update public.ride_routing_user_usage set window_started_at = now() - interval '6 minutes'
where user_id = '95000000-0000-4000-8000-000000000001';
select pg_temp.free_slot();
select pg_temp.assert_true(pg_temp.permit(1) = 'granted', 'permit granted again in a new window');
select pg_temp.assert_true(
  (select lookups from public.ride_routing_user_usage where user_id = '95000000-0000-4000-8000-000000000001') = 1,
  'the new window counts from one');

do $$
begin
  perform public.try_ride_routing_request(null);
  raise exception 'FAIL: permit without a user id';
exception when null_value_not_allowed then null;
end $$;

reset role;
rollback;
