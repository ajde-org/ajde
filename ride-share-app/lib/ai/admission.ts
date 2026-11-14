import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/lib/supabase/database.types";

// Policy values and feature-to-group mapping live only in ai_admission_policies /
// ai_admission_features. Endpoints pass a constant feature after validating access.
export const aiFeatureSchema = z.enum([
  "search", "parse", "screenshot", "interpret", "chat_assist", "translate_notes", "explain",
]);
export type AiFeature = z.infer<typeof aiFeatureSchema>;

const timestamp = z.iso.datetime({ offset: true });
export const aiAdmissionSchema = z.discriminatedUnion("admitted", [
  z.object({
    admitted: z.literal(true),
    operationId: z.uuid(),
    admittedAt: timestamp,
    deadlineAt: timestamp,
    leaseExpiresAt: timestamp,
  }).refine(value => Date.parse(value.admittedAt) < Date.parse(value.deadlineAt) && Date.parse(value.deadlineAt) < Date.parse(value.leaseExpiresAt)),
  z.object({
    admitted: z.literal(false),
    reason: z.enum(["hourly_limit", "screenshot_limit", "burst_limit", "concurrency_limit"]),
    retryAfterSeconds: z.number().int().positive(),
    retryAt: timestamp,
  }),
]);
export type AiAdmission = z.infer<typeof aiAdmissionSchema>;
export type AdmittedAiOperation = Extract<AiAdmission, { admitted: true }>;
export type AiAdmissionResult = AiAdmission | { admitted: false; reason: "storage_unavailable" };

/** A failed or malformed store response never grants permission to start paid work. */
export async function admitAiOperation(
  supabase: Pick<SupabaseClient<Database>, "rpc">,
  feature: AiFeature,
): Promise<AiAdmissionResult> {
  try {
    const { data, error } = await supabase.rpc("admit_ai_operation", { p_feature: feature });
    if (error) return { admitted: false, reason: "storage_unavailable" };
    const parsed = aiAdmissionSchema.safeParse(data);
    return parsed.success ? parsed.data : { admitted: false, reason: "storage_unavailable" };
  } catch {
    return { admitted: false, reason: "storage_unavailable" };
  }
}
