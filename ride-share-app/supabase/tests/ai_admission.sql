begin;
-- Exercise launch defaults even when the local UI uses accelerated refill.
update public.ai_admission_policies set burst_capacity = 32, burst_refill_seconds = 6300
  where policy_group = 'explicit';
insert into auth.users(id) values ('95000000-0000-4000-8000-000000000002');
select set_config('request.jwt.claim.sub','95000000-0000-4000-8000-000000000002',true);
create function pg_temp.assert_true(value boolean, label text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'FAIL: %', label; end if; end $$;
set local role authenticated;
do $$ declare first_read jsonb := public.admit_ai_operation('screenshot','95000000-0000-4000-8000-000000000020'); begin
  perform pg_temp.assert_true((first_read->>'admitted')::boolean and not (first_read ?| array['nextActionAt','lowAllowanceFullAt']), 'another full screenshot import fits');
end $$;
select pg_temp.assert_true((public.admit_ai_operation('parse','95000000-0000-4000-8000-000000000010','95000000-0000-4000-8000-000000000020')->>'admitted')::boolean, 'import');
select pg_temp.assert_true(public.admit_ai_operation('search','95000000-0000-4000-8000-000000000010')->>'reason' = 'conflict', 'duplicate across features');
do $$ declare second_import jsonb := public.admit_ai_operation('parse'); third_import jsonb := public.admit_ai_operation('screenshot'); begin
  perform pg_temp.assert_true((second_import->>'admitted')::boolean and not (second_import ?| array['nextActionAt','lowAllowanceFullAt']), 'second import stays quiet');
  perform pg_temp.assert_true((third_import->>'admitted')::boolean and third_import ? 'lowAllowanceFullAt' and not (third_import ? 'nextActionAt'), 'third import warns and leaves one import');
end $$;
do $$ declare low jsonb := public.admit_ai_operation('parse'); begin
  perform pg_temp.assert_true((low->>'nextActionAt')::timestamptz > clock_timestamp() + interval '13 hours 59 minutes', 'last affordable import includes next eligibility');
end $$;
do $$ declare denial jsonb := public.admit_ai_operation('parse'); begin
  perform pg_temp.assert_true(denial->>'reason' = 'allowance_limit', 'expensive action denied');
  perform pg_temp.assert_true((denial->>'retryAfterSeconds')::int between 50398 and 50400, 'action-specific delay');
end $$;
select pg_temp.assert_true((public.admit_ai_operation('screenshot')->>'retryAfterSeconds')::int between 50398 and 50400, 'both import modes have the same wait');
select pg_temp.assert_true(public.admit_ai_operation('parse',null,'95000000-0000-4000-8000-000000000020')->>'reason' = 'conflict', 'included draft is single use');
reset role;
update public.ai_admission_buckets set permits = 0.5, refilled_at = now() - interval '52 minutes 30 seconds' where user_id = auth.uid();
select pg_temp.assert_true((public.admit_ai_operation('search')->>'admitted')::boolean, 'fractional refill');
update public.ai_admission_buckets set refilled_at = now() - interval '3 weeks' where user_id = auth.uid();
select public.admit_ai_operation('parse');
select pg_temp.assert_true((select permits = 24 from public.ai_admission_buckets where user_id = auth.uid()), 'idle refill capped');
update public.ai_admission_buckets set permits = 8, refilled_at = clock_timestamp() where user_id = auth.uid();
select pg_temp.assert_true((public.admit_ai_operation('screenshot','95000000-0000-4000-8000-000000000021')->>'admitted')::boolean, 'last affordable screenshot');
select pg_temp.assert_true(public.admit_ai_operation('parse')->>'reason' = 'allowance_limit', 'standalone draft blocked');
select pg_temp.assert_true((public.admit_ai_operation('parse',null,'95000000-0000-4000-8000-000000000021')->>'admitted')::boolean, 'included draft succeeds at zero balance');
rollback;
