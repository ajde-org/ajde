-- Short-lived request fingerprints, never prompts or generated results.
create table public.ai_execution_keys (
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null,
  claim_id uuid not null default gen_random_uuid(),
  feature text not null references public.ai_admission_features(feature),
  input_hash text not null check (input_hash ~ '^[a-f0-9]{64}$'),
  operation_id uuid references public.ai_operations(id) on delete set null,
  expires_at timestamptz not null default (clock_timestamp() + interval '10 minutes'),
  completed_at timestamptz,
  primary key (user_id, request_id)
);
create index ai_execution_keys_expiry on public.ai_execution_keys(expires_at);
alter table public.ai_execution_keys enable row level security;
revoke all on public.ai_execution_keys from public, anon, authenticated;

create function public.claim_ai_execution(p_request_id uuid, p_feature text, p_input_hash text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  existing public.ai_execution_keys%rowtype;
begin
  if actor is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if p_request_id is null or p_input_hash is null or p_input_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid execution key' using errcode = '22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor::text, 34));
  delete from public.ai_execution_keys where user_id = actor and request_id = p_request_id
    and expires_at <= clock_timestamp();
  select * into existing from public.ai_execution_keys where user_id = actor and request_id = p_request_id;
  if found then
    return jsonb_build_object('state', case
      when existing.feature <> p_feature or existing.input_hash <> p_input_hash then 'conflict'
      when existing.completed_at is not null then 'completed' else 'pending' end,
      'operationId', existing.operation_id);
  end if;
  insert into public.ai_execution_keys(user_id, request_id, feature, input_hash)
    values (actor, p_request_id, p_feature, p_input_hash) returning * into existing;
  return jsonb_build_object('state', 'claimed', 'claimId', existing.claim_id);
end;
$$;
revoke all on function public.claim_ai_execution(uuid,text,text) from public, anon, authenticated;
grant execute on function public.claim_ai_execution(uuid,text,text) to authenticated;

create function public.bind_ai_execution(p_request_id uuid, p_user_id uuid, p_operation_id uuid, p_claim_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  update public.ai_execution_keys k set operation_id = p_operation_id,
    expires_at = greatest(k.expires_at, o.lease_expires_at + interval '1 minute')
    from public.ai_operations o
    where k.user_id = p_user_id and k.request_id = p_request_id and k.operation_id is null
      and k.claim_id = p_claim_id
      and k.completed_at is null and k.expires_at > clock_timestamp()
      and o.id = p_operation_id
        and o.user_id = p_user_id and o.feature = k.feature and o.deadline_at > clock_timestamp()
        and o.released_at is null;
  return found;
end;
$$;
revoke all on function public.bind_ai_execution(uuid,uuid,uuid,uuid) from public, anon, authenticated;
grant execute on function public.bind_ai_execution(uuid,uuid,uuid,uuid) to service_role;

create function public.finish_ai_execution(p_request_id uuid, p_user_id uuid, p_claim_id uuid)
returns void language sql security definer set search_path = '' as $$
  update public.ai_execution_keys set completed_at = coalesce(completed_at, clock_timestamp())
    where request_id = p_request_id and user_id = p_user_id and claim_id = p_claim_id;
$$;
revoke all on function public.finish_ai_execution(uuid,uuid,uuid) from public, anon, authenticated;
grant execute on function public.finish_ai_execution(uuid,uuid,uuid) to service_role;

-- Extend trusted maintenance; admission correctness never depends on this schedule.
create or replace function public.cleanup_ai_operations()
returns bigint language plpgsql security definer set search_path = '' as $$
declare removed bigint;
begin
  delete from public.ai_execution_keys where expires_at <= clock_timestamp();
  delete from public.ai_operations where admitted_at < clock_timestamp() - interval '35 days'
    and lease_expires_at <= clock_timestamp();
  get diagnostics removed = row_count;
  delete from public.ai_admission_buckets b where refilled_at < clock_timestamp() - interval '35 days'
    and not exists (select 1 from public.ai_operations o where o.user_id = b.user_id
      and o.policy_group = b.policy_group);
  return removed;
end;
$$;
revoke all on function public.cleanup_ai_operations() from public, anon, authenticated;
grant execute on function public.cleanup_ai_operations() to service_role;
