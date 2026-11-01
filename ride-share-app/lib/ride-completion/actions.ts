"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export async function completeRide(rideId: string): Promise<{ success: boolean; message: string }> {
  if (!z.uuid().safeParse(rideId).success) return { success: false, message: "completion.invalid" };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "completion.signIn" };

  const { data: ride, error } = await supabase.from("rides")
    .select("id, driver_id, status, departure_at")
    .eq("id", rideId).eq("driver_id", user.id).maybeSingle();
  if (error || !ride) return { success: false, message: "completion.notFound" };
  if (ride.status === "completed") return { success: true, message: "completion.already" };

  const now = new Date().toISOString();
  if (!["published", "full"].includes(ride.status) || Date.parse(ride.departure_at) >= Date.parse(now)) {
    return { success: false, message: "completion.notDeparted" };
  }
  const { data: updated, error: updateError } = await supabase.from("rides")
    .update({ status: "completed" }).eq("id", rideId).eq("driver_id", user.id)
    .in("status", ["published", "full"]).lt("departure_at", now).select("id").maybeSingle();
  if (updateError) return { success: false, message: "completion.failed" };
  if (!updated) {
    const { data: current, error: readError } = await supabase.from("rides")
      .select("status").eq("id", rideId).eq("driver_id", user.id).maybeSingle();
    if (readError || current?.status !== "completed") {
      return { success: false, message: "completion.changed" };
    }
  }

  revalidatePath("/dashboard/driver");
  revalidatePath("/dashboard/trips");
  revalidatePath("/rides");
  revalidatePath(`/rides/${rideId}`);
  return { success: true, message: "completion.done" };
}

export async function cancelRide(
  rideId: string,
  acknowledgesFullRide: boolean,
): Promise<{ success: boolean; message: string }> {
  if (!z.uuid().safeParse(rideId).success) return { success: false, message: "completion.invalid" };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, message: "cancel.signIn" };

  const { data: ride, error } = await supabase.from("rides")
    .select("id, driver_id, status, departure_at, seats_available")
    .eq("id", rideId).eq("driver_id", user.id).maybeSingle();
  if (error || !ride) return { success: false, message: "completion.notFound" };

  const now = new Date().toISOString();
  if (!["published", "full"].includes(ride.status) || Date.parse(ride.departure_at) <= Date.parse(now)) {
    return { success: false, message: "cancel.futureOnly" };
  }
  const isFull = ride.status === "full" || ride.seats_available === 0;
  if (isFull && acknowledgesFullRide !== true) {
    return {
      success: false,
      message: "cancel.needsAck",
    };
  }

  const { data: updated, error: updateError } = await supabase.from("rides")
    .update({ status: "cancelled" }).eq("id", rideId).eq("driver_id", user.id)
    .in("status", ["published", "full"]).gt("departure_at", now).select("id").maybeSingle();
  if (updateError || !updated) {
    return { success: false, message: "cancel.changed" };
  }

  revalidatePath("/rides");
  revalidatePath(`/rides/${rideId}`);
  revalidatePath("/dashboard/driver");
  revalidatePath("/dashboard/trips");
  return {
    success: true,
    message: "cancel.done",
  };
}
