begin;
insert into auth.users(id) values ('95000000-0000-4000-8000-000000000002');
select set_config('request.jwt.claim.sub','95000000-0000-4000-8000-000000000002',true);
create function pg_temp.assert_true(value boolean, label text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'FAIL: %', label; end if; end $$;
set local role authenticated;
select pg_temp.assert_true((public.admit_ai_operation('screenshot')->>'admitted')::boolean, 'read screenshot');
select pg_temp.assert_true((public.admit_ai_operation('parse','95000000-0000-4000-8000-000000000010')->>'admitted')::boolean, 'import');
select pg_temp.assert_true(public.admit_ai_operation('search','95000000-0000-4000-8000-000000000010')->>'reason' = 'conflict', 'duplicate across features');
select public.admit_ai_operation('parse');
do $$ declare denial jsonb := public.admit_ai_operation('parse'); begin
  perform pg_temp.assert_true(denial->>'reason' = 'allowance_limit', 'expensive action denied');
  perform pg_temp.assert_true((denial->>'retryAfterSeconds')::int between 28798 and 28800, 'action-specific delay');
end $$;
select pg_temp.assert_true((public.admit_ai_operation('search')->>'admitted')::boolean, 'cheap search still fits');
reset role;
update public.ai_admission_buckets set permits = 0.5, refilled_at = now() - interval '1 hour' where user_id = auth.uid();
select pg_temp.assert_true((public.admit_ai_operation('search')->>'admitted')::boolean, 'fractional refill');
update public.ai_admission_buckets set refilled_at = now() - interval '3 weeks' where user_id = auth.uid();
select public.admit_ai_operation('parse');
select pg_temp.assert_true((select permits = 10 from public.ai_admission_buckets where user_id = auth.uid()), 'idle refill capped');
rollback;
