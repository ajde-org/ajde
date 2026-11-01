"use server";

import { z } from "zod";
import { requireCompleteProfile } from "@/lib/auth/session";
import { isAllowedStudentEmail } from "@/lib/auth/email-domain";
import { createClient } from "@/lib/supabase/server";
import { translateRideNotesText } from "@/lib/ai/translate-ride-notes";
import { canViewRideDetail } from "./ride-detail-access";

const inputSchema = z.object({ rideId: z.uuid(), locale: z.enum(["en", "mk"]) });
export async function translateRideNotes(input: unknown) {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { ok: false } as const;
  const { rideId, locale } = parsed.data;
  const user = await requireCompleteProfile(`/rides/${rideId}`);
  if (!user.email || !isAllowedStudentEmail(user.email)) return { ok: false } as const;
  try {
    const client = await createClient();
    const { data: ride, error } = await client.from("rides").select("notes, status, driver_id").eq("id", rideId).maybeSingle();
    if (error || !ride?.notes?.trim()) return { ok: false } as const;
    const { data: booking, error: bookingError } = await client.from("bookings").select("status")
      .eq("ride_id", rideId).eq("passenger_id", user.id).in("status", ["requested", "accepted"]).maybeSingle();
    if (bookingError || !canViewRideDetail({ rideStatus: ride.status, isDriver: ride.driver_id === user.id, bookingStatus: booking?.status })) return { ok: false } as const;
    return { ok: true, source: ride.notes, translation: await translateRideNotesText(ride.notes, locale) } as const;
  } catch {
    return { ok: false } as const;
  }
}
