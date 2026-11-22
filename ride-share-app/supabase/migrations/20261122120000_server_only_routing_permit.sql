-- The routing permit is one global slot per 1.2 seconds. Signed-in users could call it through the
-- REST API in a loop and starve everyone else's distance lookups (AJDE-56). Now:
--   * only server code may take a permit, through the service-role client, after it has checked the
--     caller's session and passed the caller's user id;
--   * each user may take at most 10 permits per 5-minute window, checked before the global slot, so
--     one user can't hold the global slot either through our own API routes.

-- Per-user routing usage, one fixed window per user. Private: definer function only.
create table public.ride_routing_user_usage (
  user_id uuid primary key references auth.users (id) on delete cascade,
  window_started_at timestamptz not null default '-infinity',
  lookups integer not null default 0 check (lookups >= 0)
);
alter table public.ride_routing_user_usage enable row level security;
revoke all on public.ride_routing_user_usage from public, anon, authenticated;

drop function public.try_ride_routing_request();

-- Returns {"status": "granted"}, {"status": "busy"} (global slot taken; retry in ~1.3 s) or
-- {"status": "user_limit", "retry_after_ms": n} (this user's window is used up).
-- Only granted permits count towards the user's window.
create function public.try_ride_routing_request(p_user_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  user_window constant interval := interval '5 minutes';
  user_limit constant integer := 10;
  now_at constant timestamptz := clock_timestamp();
  usage public.ride_routing_user_usage%rowtype;
  previous_time timestamptz;
begin
  if p_user_id is null then raise exception 'A user id is required' using errcode = '22004'; end if;

  -- Lock order is always user row, then gate row.
  insert into public.ride_routing_user_usage (user_id) values (p_user_id) on conflict (user_id) do nothing;
  select * into usage from public.ride_routing_user_usage where user_id = p_user_id for update;
  if usage.window_started_at > now_at - user_window and usage.lookups >= user_limit then
    return jsonb_build_object('status', 'user_limit', 'retry_after_ms',
      ceil(extract(epoch from (usage.window_started_at + user_window - now_at)) * 1000)::bigint);
  end if;

  select last_request_at into previous_time from public.ride_routing_gate where id for update;
  -- Small safety margin over the public provider's one-request-per-second limit.
  if now_at < previous_time + interval '1200 milliseconds' then return jsonb_build_object('status', 'busy'); end if;
  update public.ride_routing_gate set last_request_at = now_at where id;

  if usage.window_started_at > now_at - user_window then
    update public.ride_routing_user_usage set lookups = lookups + 1 where user_id = p_user_id;
  else
    update public.ride_routing_user_usage set window_started_at = now_at, lookups = 1 where user_id = p_user_id;
  end if;
  return jsonb_build_object('status', 'granted');
end;
$$;
revoke all on function public.try_ride_routing_request(uuid) from public, anon, authenticated;
grant execute on function public.try_ride_routing_request(uuid) to service_role;
