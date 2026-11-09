import type { MessageKey } from "@/lib/i18n/messages/en";
import type { Database } from "@/lib/supabase/database.types";
import type { TripStatusFilter } from "./trip-tabs";

type BookingStatus = Database["public"]["Enums"]["booking_status"];
type RideStatus = Database["public"]["Enums"]["ride_status"];

/** A ride's completion only counts as a passenger trip when their booking was accepted. */
export function passengerTripStatus(booking: BookingStatus, ride: RideStatus): {
  filter: Exclude<TripStatusFilter, "all"> | null;
  label: Extract<MessageKey, `trips.status.${string}`>;
} {
  if (booking === "cancelled") return { filter: "cancelled", label: "trips.status.bookingCancelled" };
  if (booking === "declined") return { filter: null, label: "trips.status.declined" };
  if (ride === "cancelled") return { filter: "cancelled", label: "trips.status.rideCancelled" };
  if (ride === "completed") {
    return booking === "accepted"
      ? { filter: "completed", label: "trips.status.completed" }
      : { filter: null, label: "trips.status.closed" };
  }
  return { filter: "active", label: booking === "accepted" ? "trips.status.confirmed" : "trips.status.awaiting" };
}
