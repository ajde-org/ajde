-- Accepted members of a ride room, for the chat roster (AJDE-16). Co-passengers need to know who
-- is in the room, but not each other's bookings, which hold a private request message to the
-- driver. The RLS migration then limits bookings to the passenger and the ride's driver; the chat
-- reads its roster through this function, so it works before and after that change.
create function public.ride_room_roster(target_ride_id uuid)
returns table (passenger_id uuid, decided_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select b.passenger_id, b.decided_at
  from public.bookings b
  where b.ride_id = target_ride_id
    and b.status = 'accepted'
    and public.can_read_ride_room(target_ride_id, statement_timestamp());
$$;

revoke all on function public.ride_room_roster(uuid) from public, anon, authenticated;
grant execute on function public.ride_room_roster(uuid) to authenticated;
