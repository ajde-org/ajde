-- Server-owned policy. Change values through a reviewed migration, never RPC arguments.
create table public.ai_admission_policies (
  policy_group text primary key check (policy_group in ('explicit', 'explanation')),
  hourly_limit integer not null check (hourly_limit between 1 and 10000),
  screenshot_hourly_limit integer check (screenshot_hourly_limit between 1 and hourly_limit),
  burst_capacity integer check (burst_capacity between 1 and 100),
  burst_refill_seconds integer check (burst_refill_seconds between 1 and 3600),
  concurrent_limit integer not null check (concurrent_limit between 1 and 20),
  operation_timeout_seconds integer not null check (operation_timeout_seconds between 1 and 300),
  lease_seconds integer not null check (lease_seconds between operation_timeout_seconds + 30 and 600),
  effective_at timestamptz not null default clock_timestamp(),
  check ((burst_capacity is null) = (burst_refill_seconds is null)),
  check (policy_group = 'explicit' or screenshot_hourly_limit is null)
);
insert into public.ai_admission_policies
  (policy_group, hourly_limit, screenshot_hourly_limit, burst_capacity, burst_refill_seconds,
   concurrent_limit, operation_timeout_seconds, lease_seconds)
values ('explicit', 30, 10, 4, 10, 2, 120, 180),
       ('explanation', 60, null, null, null, 2, 120, 180);

create table public.ai_admission_features (
  feature text primary key,
  policy_group text not null references public.ai_admission_policies(policy_group)
);
insert into public.ai_admission_features(feature, policy_group) values
  ('search', 'explicit'), ('parse', 'explicit'), ('screenshot', 'explicit'),
  ('interpret', 'explicit'), ('chat_assist', 'explicit'), ('translate_notes', 'explicit'),
  ('explain', 'explanation');

create table public.ai_admission_buckets (
  user_id uuid not null references auth.users(id) on delete cascade,
  policy_group text not null references public.ai_admission_policies(policy_group),
  permits double precision not null check (permits >= 0),
  refilled_at timestamptz not null,
  primary key (user_id, policy_group)
);

-- One row per successful admission; release never deletes its rolling-window charge.
create table public.ai_operations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  policy_group text not null references public.ai_admission_policies(policy_group),
  feature text not null references public.ai_admission_features(feature),
  admitted_at timestamptz not null,
  deadline_at timestamptz not null,
  lease_expires_at timestamptz not null,
  released_at timestamptz,
  check (deadline_at > admitted_at and lease_expires_at > deadline_at),
  check (released_at is null or released_at >= admitted_at)
);
create index ai_operations_window on public.ai_operations(user_id, policy_group, admitted_at);
create index ai_operations_screenshots on public.ai_operations(user_id, admitted_at)
  where feature = 'screenshot';
create index ai_operations_leases on public.ai_operations(user_id, policy_group, lease_expires_at)
  where released_at is null;
create index ai_operations_retention on public.ai_operations(admitted_at);

alter table public.ai_admission_policies enable row level security;
alter table public.ai_admission_features enable row level security;
alter table public.ai_admission_buckets enable row level security;
alter table public.ai_operations enable row level security;
-- Deliberately no API policies: callers can only consume capacity through the definer RPC.
revoke all on public.ai_admission_policies, public.ai_admission_features,
  public.ai_admission_buckets, public.ai_operations from public, anon, authenticated;

create function public.admit_ai_operation(p_feature text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  policy public.ai_admission_policies%rowtype;
  checked_at timestamptz;
  bucket public.ai_admission_buckets%rowtype;
  available double precision;
  admissions integer;
  screenshots integer;
  active integer;
  candidate timestamptz;
  retry_at timestamptz;
  reason text;
  operation public.ai_operations%rowtype;
begin
  if actor is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  select p.* into policy from public.ai_admission_policies p
    join public.ai_admission_features f using (policy_group) where f.feature = p_feature;
  if not found then raise exception 'Unknown AI feature' using errcode = '22023'; end if;

  -- A transaction lock also covers the first request before any state row exists.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(actor::text, 34));
  checked_at := clock_timestamp();
  retry_at := checked_at;

  select count(*) into admissions from public.ai_operations
    where user_id = actor and policy_group = policy.policy_group
      and admitted_at > checked_at - interval '1 hour';
  if admissions >= policy.hourly_limit then
    select admitted_at + interval '1 hour' into candidate from public.ai_operations
      where user_id = actor and policy_group = policy.policy_group
        and admitted_at > checked_at - interval '1 hour'
      order by admitted_at offset (admissions - policy.hourly_limit) limit 1;
    retry_at := candidate; reason := 'hourly_limit';
  end if;

  if p_feature = 'screenshot' and policy.screenshot_hourly_limit is not null then
    select count(*) into screenshots from public.ai_operations
      where user_id = actor and feature = 'screenshot' and admitted_at > checked_at - interval '1 hour';
    if screenshots >= policy.screenshot_hourly_limit then
      select admitted_at + interval '1 hour' into candidate from public.ai_operations
        where user_id = actor and feature = 'screenshot' and admitted_at > checked_at - interval '1 hour'
        order by admitted_at offset (screenshots - policy.screenshot_hourly_limit) limit 1;
      if candidate > retry_at then retry_at := candidate; reason := 'screenshot_limit'; end if;
    end if;
  end if;

  if policy.burst_capacity is not null then
    select * into bucket from public.ai_admission_buckets
      where user_id = actor and policy_group = policy.policy_group;
    available := case when found then least(policy.burst_capacity,
      bucket.permits + greatest(0, extract(epoch from checked_at - bucket.refilled_at))
        / policy.burst_refill_seconds) else policy.burst_capacity end;
    if available < 1 then
      candidate := checked_at + make_interval(secs => (1 - available) * policy.burst_refill_seconds);
      if candidate > retry_at then retry_at := candidate; reason := 'burst_limit'; end if;
    end if;
  end if;

  select count(*) into active from public.ai_operations
    where user_id = actor and policy_group = policy.policy_group
      and released_at is null and lease_expires_at > checked_at;
  if active >= policy.concurrent_limit then
    select lease_expires_at into candidate from public.ai_operations
      where user_id = actor and policy_group = policy.policy_group
        and released_at is null and lease_expires_at > checked_at
      order by lease_expires_at offset (active - policy.concurrent_limit) limit 1;
    if candidate > retry_at then retry_at := candidate; reason := 'concurrency_limit'; end if;
  end if;

  if reason is not null then
    return jsonb_build_object('admitted', false, 'reason', reason, 'retryAt', retry_at,
      'retryAfterSeconds', greatest(1, ceil(extract(epoch from retry_at - checked_at))::integer));
  end if;

  if policy.burst_capacity is not null then
    insert into public.ai_admission_buckets(user_id, policy_group, permits, refilled_at)
      values (actor, policy.policy_group, available - 1, checked_at)
      on conflict (user_id, policy_group) do update
        set permits = excluded.permits, refilled_at = excluded.refilled_at;
  end if;
  insert into public.ai_operations(user_id, policy_group, feature, admitted_at, deadline_at, lease_expires_at)
    values (actor, policy.policy_group, p_feature, checked_at,
      checked_at + make_interval(secs => policy.operation_timeout_seconds),
      checked_at + make_interval(secs => policy.lease_seconds)) returning * into operation;
  return jsonb_build_object('admitted', true, 'operationId', operation.id,
    'admittedAt', operation.admitted_at,
    'deadlineAt', operation.deadline_at, 'leaseExpiresAt', operation.lease_expires_at);
end;
$$;
revoke all on function public.admit_ai_operation(text) from public, anon, authenticated;
grant execute on function public.admit_ai_operation(text) to authenticated;

-- Server-only release: an authenticated browser must not free its own running lease.
-- The server supplies the user ID from its verified operation context, never request input.
create function public.release_ai_operation(p_operation_id uuid, p_user_id uuid)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user_id::text, 34));
  update public.ai_operations set released_at = coalesce(released_at, clock_timestamp())
    where id = p_operation_id and user_id = p_user_id;
  return found;
end;
$$;
revoke all on function public.release_ai_operation(uuid, uuid) from public, anon, authenticated;
grant execute on function public.release_ai_operation(uuid, uuid) to service_role;

-- Retain 35 days for usage reports and preceding-period comparisons. Invoke daily from
-- trusted maintenance; admission/lease correctness never depends on cleanup running.
create function public.cleanup_ai_operations()
returns bigint language plpgsql security definer set search_path = '' as $$
declare removed bigint;
begin
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
