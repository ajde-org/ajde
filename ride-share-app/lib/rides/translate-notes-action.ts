"use server";

import { z } from "zod";
import { runAiOperation, AiOperationError } from "@/lib/ai/operation";
import { requireCompleteProfile } from "@/lib/auth/session";
import { isAllowedStudentEmail } from "@/lib/auth/email-domain";
import { createClient } from "@/lib/supabase/server";
import { translateRideNotesText } from "@/lib/ai/translate-ride-notes";
import { canViewRideDetail } from "./ride-detail-access";
import { RIDE_LIMITS } from "./ride-limits";

const inputSchema = z.object({ rideId: z.uuid(), locale: z.enum(["en", "mk"]), requestId: z.uuid().optional() });
export async function translateRideNotes(input: unknown) {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { ok: false } as const;
  const { rideId, locale } = parsed.data;
  const user = await requireCompleteProfile(`/rides/${rideId}`);
  if (!user.email || !isAllowedStudentEmail(user.email)) return { ok: false } as const;
  try {
    const client = await createClient();
    const accessibleNotes = async () => {
      const { data: ride, error } = await client.from("rides").select("notes, status, driver_id").eq("id", rideId).maybeSingle();
      if (error || !ride?.notes?.trim()) return null;
      const { data: booking, error: bookingError } = await client.from("bookings").select("status")
        .eq("ride_id", rideId).eq("passenger_id", user.id).in("status", ["requested", "accepted"]).maybeSingle();
      if (bookingError || !canViewRideDetail({ rideStatus: ride.status, isDriver: ride.driver_id === user.id, bookingStatus: booking?.status })) return null;
      return ride.notes;
    };
    const notes = await accessibleNotes();
    if (!notes) return { ok: false } as const;
    if (notes.length > RIDE_LIMITS.notesLength) return { ok: false } as const;
    const translation = await runAiOperation({ supabase: client, userId: user.id, feature: "translate_notes", requestId: parsed.data.requestId }, () => translateRideNotesText(notes, locale));
    if (await accessibleNotes() !== notes) return { ok: false } as const;
    return { ok: true, source: notes, translation } as const;
  } catch (error) {
    if (error instanceof AiOperationError) return { ok: false, code: "retryAfterSeconds" in error.failure ? "rate_limit" : error.failure.reason, ...error.failure } as const;
    return { ok: false } as const;
  }
}
