-- Passengers may cancel only before departure (AJDE-50). Until now they could cancel after the trip,
-- up to when the driver marked it completed, which stopped the driver from rating them.
alter policy bookings_passenger_cancels on public.bookings
  using (
    passenger_id = auth.uid()
    and status in ('requested', 'accepted')
    and public.is_ride_active(ride_id, true)
  );
