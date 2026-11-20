-- A screenshot admission pays for one read and one subsequent parse.
alter table public.ai_operations add column draft_included boolean not null default false;
update public.ai_admission_features set weight = 8 where feature = 'screenshot';
drop function public.admit_ai_operation(text,uuid);

create function public.admit_ai_operation(p_feature text, p_request_id uuid default null, p_screenshot_request_id uuid default null)
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
  if p_screenshot_request_id is not null then
    if p_feature <> 'parse' then raise exception 'Only a draft can redeem a screenshot'; end if;
    update public.ai_operations set draft_included = false
      where user_id = actor and request_id = p_screenshot_request_id
        and feature = 'screenshot' and draft_included;
    if not found then return jsonb_build_object('admitted', false, 'reason', 'conflict'); end if;
  else
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
  end if;
  insert into public.ai_operations(user_id, policy_group, feature, admitted_at, deadline_at, request_id, draft_included)
    values (actor, 'explicit', p_feature, checked_at,
      checked_at + make_interval(secs => policy.operation_timeout_seconds), p_request_id, p_feature = 'screenshot')
    returning * into operation;
  return jsonb_build_object('admitted', true, 'operationId', operation.id,
    'admittedAt', checked_at, 'deadlineAt', operation.deadline_at) ||
    case when p_screenshot_request_id is not null then '{}'::jsonb
      when available - action_weight < action_weight
      then jsonb_build_object('nextActionAt', checked_at + make_interval(secs =>
        ceil((2 * action_weight - available) * policy.burst_refill_seconds)))
      when available - action_weight < greatest(action_weight * 2, policy.burst_capacity / 4.0)
      then jsonb_build_object('lowAllowanceFullAt', checked_at + make_interval(secs =>
        ceil((policy.burst_capacity - available + action_weight) * policy.burst_refill_seconds)))
      else '{}'::jsonb end;
end;
$$;
revoke all on function public.admit_ai_operation(text,uuid,uuid) from public, anon, authenticated;
grant execute on function public.admit_ai_operation(text,uuid,uuid) to authenticated;
