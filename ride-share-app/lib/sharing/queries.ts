import "server-only";
import type { Locale } from "@/lib/i18n/config";
import { localizedName } from "@/lib/i18n/locations";
import { createAdminClient } from "../supabase/admin";
import type { SharedItinerary } from "./types";

/** Called per request; never cache bearer-token access or return database records. */
export async function getSharedItinerary(token: string, locale: Locale = "en"): Promise<SharedItinerary | null> {
  if (!/^[a-f0-9]{48}$/.test(token)) return null;
  // Share links are opened without signing in, so RLS would hide the passenger's booking. The
  // token is the credential: read with the service role and return only the itinerary fields below.
  const supabase = createAdminClient();
  const { data: share, error } = await supabase.from("trip_shares")
    .select("booking_id, expires_at").eq("token", token).maybeSingle();
  if (error || !share || !(Date.parse(share.expires_at) > Date.now())) return null;
  const { data: booking, error: bookingError } = await supabase.from("bookings")
    .select("ride_id, status").eq("id", share.booking_id).maybeSingle();
  if (bookingError || !booking || booking.status !== "accepted") return null;
  const { data: ride, error: rideError } = await supabase.from("rides")
    .select("status, departure_at, driver_id, car_id, origin_city_id, dest_city_id, origin_pickup_id, dest_pickup_id")
    .eq("id", booking.ride_id).maybeSingle();
  if (rideError || !ride || ride.status === "cancelled") return null;
  if (!(Date.parse(ride.departure_at) + 24 * 60 * 60 * 1000 > Date.now())) return null;
  const [origin, destination, pickup, dropoff, driver, car] = await Promise.all([
    supabase.from("cities").select("name_en, name_mk").eq("id", ride.origin_city_id).maybeSingle(),
    supabase.from("cities").select("name_en, name_mk").eq("id", ride.dest_city_id).maybeSingle(),
    ride.origin_pickup_id ? supabase.from("pickup_points").select("name_en, name_mk").eq("id", ride.origin_pickup_id).maybeSingle() : null,
    ride.dest_pickup_id ? supabase.from("pickup_points").select("name_en, name_mk").eq("id", ride.dest_pickup_id).maybeSingle() : null,
    ride.driver_id ? supabase.from("profiles").select("full_name, photo_url").eq("id", ride.driver_id).maybeSingle() : null,
    ride.car_id ? supabase.from("cars").select("make, model, color").eq("id", ride.car_id).maybeSingle() : null,
  ]);
  if ([origin, destination, pickup, dropoff, driver, car].some(result => result?.error) || !origin.data || !destination.data) return null;
  return {
    origin: localizedName(origin.data, locale), destination: localizedName(destination.data, locale),
    pickup: pickup?.data ? localizedName(pickup.data, locale) : null, dropoff: dropoff?.data ? localizedName(dropoff.data, locale) : null,
    departureAt: ride.departure_at,
    driver: driver?.data ? { name: driver.data.full_name, photoUrl: driver.data.photo_url } : null,
    car: car?.data ? { make: car.data.make, model: car.data.model, color: car.data.color } : null,
  };
}
