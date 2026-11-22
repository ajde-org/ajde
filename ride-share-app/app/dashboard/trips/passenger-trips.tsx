import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getContactDetails } from "@/lib/profiles/contact-details";
import { getRatingControls } from "@/lib/ratings/queries";
import { tripStatusFilters, type TripStatusFilter } from "./trip-tabs";
import { PassengerTripsView } from "./passenger-trips-view";
import { passengerTripStatus } from "./passenger-trip-status";

export async function PassengerTrips({ userId, filter }: { userId: string; filter: TripStatusFilter }) {
  const data = await loadTrips(userId, filter);
  return <PassengerTripsView {...data} />;
}

export type PassengerTripsData = Awaited<ReturnType<typeof loadTrips>>;

async function loadTrips(userId: string, filter: TripStatusFilter) {
  const supabase = await createClient();
  const { data: bookings, error } = await supabase.from("bookings").select("id, ride_id, seats, message, status, created_at").eq("passenger_id", userId).order("created_at", { ascending: false });
  if (error) throw new Error("Unable to load your trips.");
  const rideIds = [...new Set((bookings ?? []).map((booking) => booking.ride_id))];
  const { data: rides, error: ridesError } = rideIds.length ? await supabase.from("rides").select("id, driver_id, departure_at, origin_city_id, dest_city_id, price_per_seat_mkd, status").in("id", rideIds) : { data: [], error: null };
  if (ridesError) throw new Error("Unable to load your trips.");
  const rideMap = new Map((rides ?? []).map((ride) => [ride.id, ride]));
  const allTrips = (bookings ?? []).flatMap((booking) => {
    const ride = rideMap.get(booking.ride_id);
    return ride ? [{ booking, ride, status: passengerTripStatus(booking.status, ride.status) }] : [];
  });
  const trips = allTrips.filter((trip) => filter === "all" || trip.status.filter === filter);
  const counts = Object.fromEntries(tripStatusFilters.map((option) => [option.value,
    allTrips.filter((trip) => option.value === "all" || trip.status.filter === option.value).length]));
  const cityIds = [...new Set((rides ?? []).flatMap((ride) => [ride.origin_city_id, ride.dest_city_id]))];
  const acceptedDriverIds = [...new Set((bookings ?? []).filter((booking) => booking.status === "accepted").flatMap((booking) => {
    const ride = rides?.find((entry) => entry.id === booking.ride_id);
    return ride?.driver_id ? [ride.driver_id] : [];
  }))];
  const [{ data: cities }, { data: drivers }, { data: driverContacts, error: contactError }] = await Promise.all([
    cityIds.length ? supabase.from("cities").select("id, name_en, name_mk").in("id", cityIds) : Promise.resolve({ data: [] }),
    acceptedDriverIds.length ? supabase.from("profiles").select("id, full_name").in("id", acceptedDriverIds) : Promise.resolve({ data: [] }),
    getContactDetails(supabase, acceptedDriverIds),
  ]);
  if (contactError) throw new Error("Unable to load your trips.");
  const driverMap = new Map((drivers ?? []).map((driver) => {
    const contact = driverContacts.get(driver.id);
    return [driver.id, { ...driver, phone: contact?.phone ?? null, instagram: contact?.instagram ?? null, facebook: contact?.facebook ?? null }];
  }));
  const ratingControls = await getRatingControls(userId, rides ?? [], (bookings ?? []).map((booking) => ({ ...booking, passenger_id: userId })));
  // Keep share-link expiry tied to the authenticated server request.
  const now = Date.now();

  return {
    trips, counts, cities: cities ?? [], driverMap, ratingControls, now, filter,
    hasTrips: allTrips.length > 0,
  };
}
