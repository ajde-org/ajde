-- Local only; fixtures and policy changes roll back. No provider calls.
begin;
insert into auth.users(id) values
  ('94000000-0000-4000-8000-000000000001'), ('94000000-0000-4000-8000-000000000002');
select set_config('request.jwt.claim.sub', '94000000-0000-4000-8000-000000000001', true);

create function pg_temp.assert_true(value boolean, label text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'FAIL: %', label; end if; end $$;
create function pg_temp.admit(feature text default 'search') returns jsonb language plpgsql as $$
declare result jsonb;
begin
  set local role authenticated;
  result := public.admit_ai_operation(feature);
  reset role;
  return result;
end $$;
create function pg_temp.release(operation_id uuid, actor uuid default auth.uid()) returns boolean language plpgsql as $$
declare result boolean;
begin
  set local role service_role;
  result := public.release_ai_operation(operation_id, actor);
  reset role;
  return result;
end $$;
create function pg_temp.clear_budget() returns void language sql as $$
  delete from public.ai_operations where user_id::text like '94000000%';
  delete from public.ai_admission_buckets where user_id::text like '94000000%';
$$;
create function pg_temp.history(n integer, feature_name text default 'search', age interval default interval '30 minutes')
returns void language sql as $$
  insert into public.ai_operations(user_id, policy_group, feature, admitted_at, deadline_at, lease_expires_at, released_at)
  select auth.uid(), case when feature_name = 'explain' then 'explanation' else 'explicit' end,
    feature_name, clock_timestamp() - age, clock_timestamp() - age + interval '120 seconds',
    clock_timestamp() - age + interval '180 seconds', clock_timestamp() - age + interval '1 second'
  from generate_series(1, n);
$$;

-- Shared concurrency, conservative retry, user isolation, and idempotent server release.
select pg_temp.assert_true((pg_temp.admit()->>'admitted')::boolean, 'first admission');
select pg_temp.assert_true((pg_temp.admit('parse')->>'admitted')::boolean, 'second feature shares capacity');
create temporary table saved_bucket as select * from public.ai_admission_buckets where user_id = auth.uid();
select pg_temp.assert_true(pg_temp.admit()->>'reason' = 'concurrency_limit', 'third concurrent denied');
select pg_temp.assert_true((pg_temp.admit()->>'retryAfterSeconds')::integer between 179 and 180, 'retry uses lease expiry');
select pg_temp.assert_true((select count(*) = 2 from public.ai_operations where user_id = auth.uid()), 'denials charge nothing');
select pg_temp.assert_true((select b.permits = s.permits and b.refilled_at = s.refilled_at
  from public.ai_admission_buckets b join saved_bucket s using (user_id, policy_group)), 'denials change no burst state');
select set_config('request.jwt.claim.sub', '94000000-0000-4000-8000-000000000002', true);
select pg_temp.assert_true((pg_temp.admit()->>'admitted')::boolean, 'another user has separate allowance');
select pg_temp.assert_true(not pg_temp.release((select id from public.ai_operations where user_id != auth.uid() limit 1)), 'cannot release another user operation');
select pg_temp.assert_true(pg_temp.release(id) and pg_temp.release(id), 'release is idempotent') from public.ai_operations where user_id = auth.uid();
select set_config('request.jwt.claim.sub', '94000000-0000-4000-8000-000000000001', true);
select pg_temp.assert_true(pg_temp.release(id), 'release own lease') from public.ai_operations where user_id = auth.uid();
select pg_temp.assert_true((select count(*) = 2 from public.ai_operations where user_id = auth.uid()), 'release retains rolling charge');

-- Burst shared across explicit features. Fractional refill is retained on success and denial.
select pg_temp.clear_budget();
do $$ declare permit jsonb; begin
  for i in 1..4 loop
    permit := pg_temp.admit(case when i % 2 = 0 then 'parse' else 'search' end);
    perform pg_temp.assert_true((permit->>'admitted')::boolean, 'four burst actions');
    perform pg_temp.release((permit->>'operationId')::uuid);
  end loop;
end $$;
select pg_temp.assert_true(pg_temp.admit()->>'reason' = 'burst_limit', 'fifth burst denied');
update public.ai_admission_buckets set permits = 0.25, refilled_at = clock_timestamp() - interval '5 seconds' where user_id = auth.uid();
select pg_temp.assert_true((pg_temp.admit()->>'retryAfterSeconds')::integer between 2 and 3, 'partial refill retry');
update public.ai_admission_buckets set refilled_at = refilled_at - interval '3 seconds' where user_id = auth.uid();
select pg_temp.assert_true((pg_temp.admit()->>'admitted')::boolean, 'elapsed time refills without a job');
select pg_temp.assert_true((select permits between 0.04 and 0.10 from public.ai_admission_buckets where user_id = auth.uid()), 'partial progress survives admission');
update public.ai_admission_buckets set refilled_at = clock_timestamp() - interval '1 day' where user_id = auth.uid();
select pg_temp.assert_true((pg_temp.admit()->>'admitted')::boolean, 'idle refill');
select pg_temp.assert_true((select permits = 3 from public.ai_admission_buckets where user_id = auth.uid()), 'idle refill capped at capacity');

-- Rolling hour and screenshot subset; explanation requests never consume explicit permits.
select pg_temp.clear_budget();
select pg_temp.history(29);
select pg_temp.assert_true((pg_temp.admit('screenshot')->>'admitted')::boolean, '30th action can be a screenshot');
select pg_temp.assert_true(pg_temp.admit('parse')->>'reason' = 'hourly_limit', '31st action denied across features');
select pg_temp.assert_true((pg_temp.admit()->>'retryAfterSeconds')::integer between 1799 and 1800, 'rolling-hour retry');
select pg_temp.assert_true((pg_temp.admit('explain')->>'admitted')::boolean, 'separate explanation allowance');
select pg_temp.assert_true((pg_temp.admit('explain')->>'admitted')::boolean, 'explanation has its own second lease');
select pg_temp.assert_true(pg_temp.admit('explain')->>'reason' = 'concurrency_limit', 'explanation concurrency enforced separately');
select pg_temp.assert_true((select permits = 3 from public.ai_admission_buckets where user_id = auth.uid()), 'explanations use no explicit burst permits');
select pg_temp.clear_budget();
select pg_temp.history(10, 'screenshot');
select pg_temp.assert_true(pg_temp.admit('screenshot')->>'reason' = 'screenshot_limit', '11th screenshot denied');
select pg_temp.assert_true((pg_temp.admit()->>'admitted')::boolean, 'screenshot sublimit leaves text actions available');
select pg_temp.history(20);
select pg_temp.assert_true(pg_temp.admit('screenshot')->>'reason' = 'hourly_limit', 'longest wait wins across exhausted constraints');
select pg_temp.clear_budget();
select pg_temp.history(60, 'explain');
select pg_temp.assert_true(pg_temp.admit('explain')->>'reason' = 'hourly_limit', 'explanation hourly limit');
select pg_temp.assert_true((pg_temp.admit()->>'admitted')::boolean, 'explanation charges do not consume explicit allowance');

-- Individual expiry: one boundary admission expires while 29 newer ones still count.
select pg_temp.clear_budget();
select pg_temp.history(29);
select pg_temp.history(1, 'search', interval '1 hour');
select pg_temp.assert_true((pg_temp.admit()->>'admitted')::boolean, 'boundary admission expires individually');
select pg_temp.assert_true(pg_temp.admit()->>'reason' = 'hourly_limit', 'newer admissions remain counted');

-- Crash recovery: expiry frees concurrency without deleting a charge.
select pg_temp.clear_budget();
select pg_temp.history(2, 'search', interval '181 seconds');
update public.ai_operations set released_at = null where user_id = auth.uid();
select pg_temp.assert_true((pg_temp.admit()->>'admitted')::boolean, 'expired leases free concurrency');
select pg_temp.assert_true((select count(*) = 3 from public.ai_operations where user_id = auth.uid()), 'lease expiry retains admissions');
select pg_temp.assert_true((select bool_and(lease_expires_at >= deadline_at + interval '30 seconds') from public.ai_operations where user_id = auth.uid()), 'deadline precedes lease expiry');

-- Identity and feature validation happen before any admission state is changed.
do $$ begin
  begin perform pg_temp.admit('unknown'); raise exception 'FAIL: unknown feature allowed'; exception when invalid_parameter_value then null; end;
end $$;
select set_config('request.jwt.claim.sub', '', true);
do $$ begin
  begin perform pg_temp.admit(); raise exception 'FAIL: missing identity allowed'; exception when insufficient_privilege then null; end;
end $$;

-- Cleanup is server-only, retains recent released admissions, and expires old data.
select set_config('request.jwt.claim.sub', '94000000-0000-4000-8000-000000000002', true);
select pg_temp.history(2, 'search', interval '36 days');
select pg_temp.assert_true(public.cleanup_ai_operations() = 2, 'cleanup removes old metadata');
select pg_temp.assert_true((select count(*) = 3 from public.ai_operations where user_id = '94000000-0000-4000-8000-000000000001'), 'cleanup retains recent admissions');

-- Policy updates cannot create invalid deadlines or allow screenshots above the shared limit.
do $$ begin
  begin update public.ai_admission_policies set lease_seconds = operation_timeout_seconds
    where policy_group = 'explicit'; raise exception 'FAIL: invalid lease configured';
  exception when check_violation then null; end;
  begin update public.ai_admission_policies set screenshot_hourly_limit = hourly_limit + 1
    where policy_group = 'explicit'; raise exception 'FAIL: invalid screenshot limit configured';
  exception when check_violation then null; end;
end $$;

-- When tuning below retained usage, wait until enough rows expire, not just the first row.
select pg_temp.clear_budget();
select pg_temp.history(10, 'search', interval '50 minutes');
select pg_temp.history(20, 'search', interval '30 minutes');
update public.ai_admission_policies set hourly_limit = 15 where policy_group = 'explicit';
select pg_temp.assert_true((pg_temp.admit()->>'retryAfterSeconds')::integer between 1799 and 1800, 'lowered hourly limit waits for enough expirations');
rollback;
