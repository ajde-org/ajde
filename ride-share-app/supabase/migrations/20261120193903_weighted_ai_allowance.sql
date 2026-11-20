-- Keep operation and usage history while replacing the admission protocol.
drop function public.admit_ai_operation(text);
drop function public.claim_ai_execution(uuid,text,text);
drop function public.bind_ai_execution(uuid,uuid,uuid,uuid);
drop function public.finish_ai_execution(uuid,uuid,uuid);
drop function public.release_ai_operation(uuid,uuid);
drop function public.ai_spend_last_day();

alter table public.ai_operations add column request_id uuid;
update public.ai_operations o set request_id = k.request_id
  from public.ai_execution_keys k where k.operation_id = o.id;
drop table public.ai_execution_keys;
create unique index ai_operations_request on public.ai_operations(user_id, request_id)
  where request_id is not null;
drop index public.ai_operations_window;
drop index public.ai_operations_screenshots;
alter table public.ai_operations drop column released_at, drop column lease_expires_at;
alter table public.ai_operations add check (deadline_at > admitted_at);

-- Old permits represented a different unit. Start existing users with a full bucket.
delete from public.ai_admission_buckets;
alter table public.ai_admission_policies
  drop column hourly_limit, drop column screenshot_hourly_limit, drop column concurrent_limit,
  drop column lease_seconds;
alter table public.ai_admission_policies drop constraint ai_admission_policies_burst_refill_seconds_check,
  add check (burst_refill_seconds between 1 and 86400);
update public.ai_admission_policies set burst_capacity = 16, burst_refill_seconds = 7200
  where policy_group = 'explicit';
alter table public.ai_admission_features add column weight integer check (weight between 1 and 16);
update public.ai_admission_features set weight = case feature
  when 'search' then 1 when 'translate_notes' then 1 when 'interpret' then 2
  when 'screenshot' then 2 when 'chat_assist' then 3 when 'parse' then 6 end;

create function public.admit_ai_operation(p_feature text, p_request_id uuid default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  policy public.ai_admission_policies%rowtype;
  action_weight integer;
  checked_at timestamptz;
  available double precision;
  wait_seconds integer;
  operation public.ai_operations%rowtype;
begin
  if actor is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select weight into strict action_weight from public.ai_admission_features
    where feature = p_feature and weight is not null and policy_group = 'explicit';
  select * into strict policy from public.ai_admission_policies where policy_group = 'explicit';
  if policy.burst_capacity is null or policy.burst_capacity < action_weight then
    raise exception 'Invalid AI allowance policy';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor::text, 34));
  checked_at := clock_timestamp();
  if p_request_id is not null and exists (select 1 from public.ai_operations
      where user_id = actor and request_id = p_request_id) then
    return jsonb_build_object('admitted', false, 'reason', 'conflict');
  end if;
  select least(policy.burst_capacity, permits + greatest(0, extract(epoch from checked_at - refilled_at))
    / policy.burst_refill_seconds) into available from public.ai_admission_buckets
    where user_id = actor and policy_group = 'explicit';
  if not found then available := policy.burst_capacity; end if;
  if available < action_weight then
    wait_seconds := greatest(1, ceil((action_weight - available) * policy.burst_refill_seconds)::integer);
    return jsonb_build_object('admitted', false, 'reason', 'allowance_limit',
      'retryAt', checked_at + make_interval(secs => wait_seconds), 'retryAfterSeconds', wait_seconds);
  end if;
  insert into public.ai_admission_buckets(user_id, policy_group, permits, refilled_at)
    values (actor, 'explicit', available - action_weight, checked_at)
    on conflict (user_id, policy_group) do update
    set permits = excluded.permits, refilled_at = excluded.refilled_at;
  insert into public.ai_operations(user_id, policy_group, feature, admitted_at, deadline_at, request_id)
    values (actor, 'explicit', p_feature, checked_at,
      checked_at + make_interval(secs => policy.operation_timeout_seconds), p_request_id)
    returning * into operation;
  return jsonb_build_object('admitted', true, 'operationId', operation.id,
    'admittedAt', checked_at, 'deadlineAt', operation.deadline_at);
end;
$$;
revoke all on function public.admit_ai_operation(text,uuid) from public, anon, authenticated;
grant execute on function public.admit_ai_operation(text,uuid) to authenticated;

create or replace function public.cleanup_ai_operations()
returns bigint language plpgsql security definer set search_path = '' as $$
declare removed bigint;
begin
  delete from public.ai_provider_usage where recorded_at < now() - interval '35 days';
  delete from public.ai_request_events where recorded_at < now() - interval '35 days';
  delete from public.ai_operations where admitted_at < now() - interval '35 days';
  get diagnostics removed = row_count;
  delete from public.ai_admission_buckets where refilled_at < now() - interval '35 days';
  return removed;
end;
$$;
