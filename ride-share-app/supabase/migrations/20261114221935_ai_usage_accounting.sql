create table public.ai_provider_usage (
  id uuid primary key,
  operation_id uuid not null references public.ai_operations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null references public.ai_admission_features(feature),
  requested_model text check (length(requested_model) <= 160),
  actual_model text check (length(actual_model) <= 160),
  input_tokens bigint check (input_tokens >= 0),
  cached_input_tokens bigint check (cached_input_tokens >= 0 and cached_input_tokens <= input_tokens),
  output_tokens bigint check (output_tokens >= 0),
  duration_ms integer not null check (duration_ms >= 0),
  outcome text not null check (outcome in ('completed','incomplete','provider_error','timeout','cancelled','unknown')),
  price_version text not null,
  estimated_cost_usd numeric(18,10) check (estimated_cost_usd >= 0),
  recorded_at timestamptz not null default clock_timestamp(),
  check (estimated_cost_usd is null or (actual_model is not null and input_tokens is not null
    and cached_input_tokens is not null and output_tokens is not null))
);
create index ai_provider_usage_operation on public.ai_provider_usage(operation_id);
create index ai_provider_usage_period on public.ai_provider_usage(recorded_at, feature);

create table public.ai_request_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  feature text not null references public.ai_admission_features(feature),
  operation_id uuid references public.ai_operations(id) on delete set null,
  outcome text not null check (outcome in ('denied','storage_error','completed','failed','timeout','cancelled','disabled')),
  reason text check (length(reason) <= 80),
  duration_ms integer check (duration_ms >= 0),
  recorded_at timestamptz not null default clock_timestamp()
);
create index ai_request_events_period on public.ai_request_events(recorded_at, feature, outcome);

create table public.ai_policy_versions (
  policy_group text not null,
  effective_at timestamptz not null,
  configuration jsonb not null check (jsonb_typeof(configuration) = 'object'),
  primary key (policy_group, effective_at)
);
insert into public.ai_policy_versions select policy_group, effective_at, to_jsonb(p) from public.ai_admission_policies p;
create function public.record_ai_policy_version()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new is distinct from old then
    new.effective_at := clock_timestamp();
    insert into public.ai_policy_versions values (new.policy_group, new.effective_at, to_jsonb(new));
  end if;
  return new;
end;
$$;
revoke all on function public.record_ai_policy_version() from public, anon, authenticated;
create trigger ai_policy_version before update on public.ai_admission_policies
  for each row execute function public.record_ai_policy_version();

alter table public.ai_provider_usage enable row level security;
alter table public.ai_request_events enable row level security;
alter table public.ai_policy_versions enable row level security;
revoke all on public.ai_provider_usage, public.ai_request_events, public.ai_policy_versions from public, anon, authenticated;
grant select, insert on public.ai_provider_usage, public.ai_request_events to service_role;
grant select on public.ai_policy_versions to service_role;

create function public.ai_spend_last_day()
returns jsonb language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object('knownSpendUsd', coalesce(sum(estimated_cost_usd), 0),
    'unknownCalls', count(*) filter (where estimated_cost_usd is null))
  from public.ai_provider_usage where recorded_at > statement_timestamp() - interval '24 hours';
$$;
revoke all on function public.ai_spend_last_day() from public, anon, authenticated;
grant execute on function public.ai_spend_last_day() to service_role;

create or replace function public.cleanup_ai_operations()
returns bigint language plpgsql security definer set search_path = '' as $$
declare removed bigint;
begin
  delete from public.ai_execution_keys where expires_at <= clock_timestamp();
  delete from public.ai_request_events where recorded_at < clock_timestamp() - interval '35 days';
  delete from public.ai_provider_usage where recorded_at < clock_timestamp() - interval '35 days';
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
