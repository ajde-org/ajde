"use server";

import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublishableRideDraftSchema } from "./ride-draft";

export async function publishDraft(rideId: string): Promise<{ success: boolean; message: string }> {
  const failed = { success: false, message: "draftPublish.failed" };
  if (!z.uuid().safeParse(rideId).success) return failed;
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { success: false, message: "form.sessionExpired" };
  const { data: ride, error } = await client.from("rides").select("*")
    .eq("id", rideId).eq("driver_id", user.id).maybeSingle();
  if (error || !ride) return failed;
  if (ride.status === "published" || ride.status === "full") return { success: true, message: "form.published" };
  if (ride.status !== "draft") return failed;
  const now = new Date();
  const validated = createPublishableRideDraftSchema({ now }).safeParse({
    source: ride.source, importId: ride.import_id,
    origin: { cityId: ride.origin_city_id, pickupPointId: ride.origin_pickup_id, rawText: null },
    destination: { cityId: ride.dest_city_id, pickupPointId: ride.dest_pickup_id, rawText: null },
    departureAt: ride.departure_at, seatsTotal: ride.seats_total, carId: ride.car_id,
    car: null, distanceKm: null, pricePerSeatMkd: ride.price_per_seat_mkd,
    notes: ride.notes, tags: ride.tags, genderPreference: ride.gender_preference,
    confidence: null, fieldConfidence: [], warnings: [],
  });
  if (!validated.success) return { success: false, message: "draftPublish.invalid" };
  const { data: car, error: carError } = await client.from("cars").select("id, seats_total")
    .eq("id", validated.data.carId).eq("owner_id", user.id).maybeSingle();
  if (carError || !car || car.seats_total < ride.seats_total) return { success: false, message: "validation.car" };
  // Compare the saved version as well as ownership/status so a concurrent change
  // cannot publish a different snapshot from the one validated above.
  const { data: updated, error: updateError } = await client.from("rides")
    .update({ status: ride.seats_available > 0 ? "published" : "full" })
    .eq("id", rideId).eq("driver_id", user.id).eq("status", "draft")
    .eq("updated_at", ride.updated_at).gt("departure_at", new Date().toISOString())
    .select("id").maybeSingle();
  if (updateError || !updated) return failed;
  for (const path of ["/rides", `/rides/${rideId}`, "/dashboard/trips", "/dashboard/driver"]) revalidatePath(path);
  return { success: true, message: "form.published" };
}
