begin;
insert into auth.users(id) values ('95000000-0000-4000-8000-000000000001'), ('95000000-0000-4000-8000-000000000002');
create function pg_temp.assert_true(value boolean, label text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'FAIL: %', label; end if; end $$;
create function pg_temp.claim(feature text default 'search', fingerprint text default repeat('a',64)) returns jsonb language plpgsql as $$
declare result jsonb;
begin
  set local role authenticated;
  result := public.claim_ai_execution('95000000-0000-4000-8000-000000000010', feature, fingerprint);
  reset role; return result;
end $$;
select set_config('request.jwt.claim.sub', '95000000-0000-4000-8000-000000000001', true);
select pg_temp.assert_true(pg_temp.claim()->>'state' = 'claimed', 'first request claims execution');
select pg_temp.assert_true(pg_temp.claim()->>'state' = 'pending', 'duplicate in flight is pending');
select pg_temp.assert_true(pg_temp.claim('parse')->>'state' = 'conflict', 'feature reuse is rejected');
select pg_temp.assert_true(pg_temp.claim('search', repeat('b',64))->>'state' = 'conflict', 'different input is rejected');
select pg_temp.assert_true((select count(*) = 0 from public.ai_operations where user_id = auth.uid()), 'claiming alone consumes no admission');
set local role authenticated;
select public.admit_ai_operation('search');
reset role;
-- A delayed bind cannot allow the key to expire while its operation is still live.
update public.ai_execution_keys set expires_at = clock_timestamp() + interval '1 second' where user_id = auth.uid();
select pg_temp.assert_true(not public.bind_ai_execution('95000000-0000-4000-8000-000000000010',
  '95000000-0000-4000-8000-000000000002', (select id from public.ai_operations where user_id = auth.uid()), (select claim_id from public.ai_execution_keys where user_id = auth.uid())), 'binding rejects different owner');
select pg_temp.assert_true(public.bind_ai_execution('95000000-0000-4000-8000-000000000010',
  auth.uid(), (select id from public.ai_operations where user_id = auth.uid()), (select claim_id from public.ai_execution_keys where user_id = auth.uid())), 'server binds admitted operation');
select pg_temp.assert_true(not public.bind_ai_execution('95000000-0000-4000-8000-000000000010',
  auth.uid(), (select id from public.ai_operations where user_id = auth.uid()), (select claim_id from public.ai_execution_keys where user_id = auth.uid())), 'binding cannot be repeated');
select pg_temp.assert_true((select k.expires_at >= o.lease_expires_at + interval '1 minute'
  from public.ai_execution_keys k join public.ai_operations o on o.id = k.operation_id where k.user_id = auth.uid()), 'bound key outlives the lease');
select public.finish_ai_execution('95000000-0000-4000-8000-000000000010', auth.uid(), (select claim_id from public.ai_execution_keys where user_id = auth.uid()));
select public.finish_ai_execution('95000000-0000-4000-8000-000000000010', auth.uid(), (select claim_id from public.ai_execution_keys where user_id = auth.uid()));
select pg_temp.assert_true(pg_temp.claim()->>'state' = 'completed', 'completed operations are not executed again');
select set_config('request.jwt.claim.sub', '95000000-0000-4000-8000-000000000002', true);
select pg_temp.assert_true(pg_temp.claim()->>'state' = 'claimed', 'request keys are scoped to authenticated user');
update public.ai_execution_keys set expires_at = clock_timestamp() - interval '1 second' where user_id = auth.uid();
select pg_temp.assert_true(pg_temp.claim('parse')->>'state' = 'claimed', 'expired key can be reused');
select pg_temp.assert_true(not has_table_privilege('authenticated','public.ai_execution_keys','SELECT,INSERT,UPDATE,DELETE'), 'no direct client access');
select pg_temp.assert_true(not has_function_privilege('authenticated','public.bind_ai_execution(uuid,uuid,uuid,uuid)','EXECUTE'), 'binding is server-only');
select pg_temp.assert_true(not has_function_privilege('authenticated','public.finish_ai_execution(uuid,uuid,uuid)','EXECUTE'), 'completion is server-only');
select set_config('request.jwt.claim.sub', '', true);
do $$ begin
  begin perform pg_temp.claim(); raise exception 'FAIL: missing identity accepted'; exception when insufficient_privilege then null; end;
end $$;
rollback;
