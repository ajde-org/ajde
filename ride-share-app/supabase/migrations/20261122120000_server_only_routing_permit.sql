-- The routing permit is one global slot per 1.2 seconds. Signed-in users could call it through the
-- REST API in a loop and starve everyone else's distance lookups (AJDE-56). Only server code may
-- take a permit now, through the service-role client, after it has checked the caller's session.
-- The service role has no auth.uid(), so the body drops that check; the grants enforce access.
create or replace function public.try_ride_routing_request() returns boolean
language plpgsql security definer set search_path = '' as $$
declare previous_time timestamptz;
begin
  select last_request_at into previous_time from public.ride_routing_gate where id for update;
  -- Small safety margin over the public provider's one-request-per-second limit.
  if clock_timestamp() < previous_time + interval '1200 milliseconds' then return false; end if;
  update public.ride_routing_gate set last_request_at = clock_timestamp() where id;
  return true;
end;
$$;
revoke all on function public.try_ride_routing_request() from public, anon, authenticated;
grant execute on function public.try_ride_routing_request() to service_role;
