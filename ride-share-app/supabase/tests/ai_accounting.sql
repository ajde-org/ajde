begin;
insert into auth.users(id) values ('95000000-0000-4000-8000-000000000001');
select set_config('request.jwt.claim.sub','95000000-0000-4000-8000-000000000001',true);
set local role authenticated;
select public.admit_ai_operation('search');
reset role;
select set_config('test.ai_operation_id', (select id::text from public.ai_operations where user_id = auth.uid()), true);
create function pg_temp.assert_true(value boolean, label text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'FAIL: %', label; end if; end $$;

set local role service_role;
insert into public.ai_provider_usage(id, operation_id, user_id, feature, actual_model, input_tokens,
  cached_input_tokens, output_tokens, duration_ms, outcome, price_version, estimated_cost_usd)
values ('95000000-0000-4000-8000-000000000010', current_setting('test.ai_operation_id')::uuid, auth.uid(),
  'search', 'gpt-5.4-mini', 1000, 400, 200, 12, 'completed', 'test-version', 0.00138);
insert into public.ai_provider_usage(id, operation_id, user_id, feature, duration_ms, outcome, price_version)
values ('95000000-0000-4000-8000-000000000011', current_setting('test.ai_operation_id')::uuid, auth.uid(),
  'search', 20, 'timeout', 'test-version');
do $$ begin
  begin insert into public.ai_provider_usage(id, operation_id, user_id, feature, duration_ms, outcome, price_version)
    values ('95000000-0000-4000-8000-000000000010', current_setting('test.ai_operation_id')::uuid, auth.uid(), 'search', 0, 'unknown', 'test');
    raise exception 'FAIL: duplicate call IDs accepted';
  exception when unique_violation then null; end;
  begin insert into public.ai_provider_usage(id, operation_id, user_id, feature, duration_ms, outcome, price_version, estimated_cost_usd)
    values (gen_random_uuid(), current_setting('test.ai_operation_id')::uuid, auth.uid(), 'search', 0, 'unknown', 'test', 0);
    raise exception 'FAIL: unknown usage priced as zero';
  exception when check_violation then null; end;
end $$;
insert into public.ai_request_events(user_id, feature, outcome, reason)
values (auth.uid(), 'screenshot', 'denied', 'allowance_limit');
reset role;

-- Historical policy values survive tuning, with database-owned effective timestamps.
create temporary table policy_count as select count(*) as n from public.ai_policy_versions;
update public.ai_admission_policies set burst_capacity = 17 where policy_group = 'explicit';
select pg_temp.assert_true((select count(*) from public.ai_policy_versions) = (select n + 1 from policy_count), 'policy history recorded');
select pg_temp.assert_true(exists (select 1 from public.ai_policy_versions where configuration->>'burst_capacity' = '16'), 'old policy retained');
update public.ai_provider_usage set recorded_at = clock_timestamp() - interval '36 days';
update public.ai_request_events set recorded_at = clock_timestamp() - interval '36 days' where user_id = auth.uid();
select public.cleanup_ai_operations();
select pg_temp.assert_true((select count(*) = 0 from public.ai_provider_usage where user_id = auth.uid()), 'old usage removed');
select pg_temp.assert_true((select count(*) = 0 from public.ai_request_events where user_id = auth.uid()), 'old request events removed');
rollback;
