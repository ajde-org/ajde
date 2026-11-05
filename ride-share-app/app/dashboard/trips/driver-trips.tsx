import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getContactDetails } from "@/lib/profiles/contact-details";
import { getRatingControls } from "@/lib/ratings/queries";
import { tripStatusFilters, type TripStatusFilter } from "./trip-tabs";
import { DriverTripsView } from "./driver-trips-view";

export async function DriverRides({ userId, filter }: { userId: string; filter: TripStatusFilter }) {
  const data = await loadTrips(userId, filter);
  return <DriverTripsView {...data} />;
}

export type DriverTripsData = Awaited<ReturnType<typeof loadTrips>>;

async function loadTrips(userId: string, filter: TripStatusFilter) {
  const supabase = await createClient();
  const { data: allRides, error } = await supabase
    .from("rides")
    .select("id, departure_at, status, seats_total, seats_available, origin_city_id, dest_city_id")
    .eq("driver_id", userId)
    .order("departure_at", { ascending: false });
  if (error) throw new Error("Unable to load your rides.");
  const counts = new Map(tripStatusFilters.map((option) => [option.value,
    (allRides ?? []).filter((ride) => !option.statuses || (option.statuses as readonly string[]).includes(ride.status)).length]));
  const statuses = tripStatusFilters.find((option) => option.value === filter)?.statuses;
  const rides = (allRides ?? []).filter((ride) => !statuses || (statuses as readonly string[]).includes(ride.status));

  const rideIds = rides.map((ride) => ride.id);
  const cityIds = [...new Set(rides.flatMap((ride) => [ride.origin_city_id, ride.dest_city_id]))];
  const [{ data: bookings }, { data: cities }] = await Promise.all([
    rideIds.length
      ? supabase.from("bookings").select("id, ride_id, passenger_id, seats, message, status, created_at").in("ride_id", rideIds).order("created_at")
      : Promise.resolve({ data: [] }),
    cityIds.length ? supabase.from("cities").select("id, name_en, name_mk").in("id", cityIds) : Promise.resolve({ data: [] }),
  ]);
  const passengerIds = [...new Set((bookings ?? []).map((booking) => booking.passenger_id))];
  const contactPassengerIds = [...new Set((bookings ?? []).filter((booking) => ["requested", "accepted"].includes(booking.status)).map((booking) => booking.passenger_id))];
  const [{ data: passengers }, { data: contactMap, error: contactError }] = await Promise.all([
    passengerIds.length
      ? supabase.from("profiles").select("id, full_name, photo_url, university").in("id", passengerIds)
      : Promise.resolve({ data: [] }),
    getContactDetails(supabase, contactPassengerIds),
  ]);
  if (contactError) throw new Error("Unable to load your rides.");
  const passengerMap = new Map((passengers ?? []).map((passenger) => [passenger.id, passenger]));
  const ratingControls = await getRatingControls(userId, rides.map((ride) => ({ ...ride, driver_id: userId })), bookings ?? []);
  // Keep the eligibility snapshot tied to the authenticated server request.
  const now = Date.now();

  return {
    rides, bookings: bookings ?? [], counts: Object.fromEntries(counts), cities: cities ?? [],
    passengerMap, contactMap: new Map([...contactMap].map(([id, contact]) => [id, { phone: contact.phone }])),
    ratingControls, now, filter, hasRides: Boolean(allRides?.length),
  };
}
