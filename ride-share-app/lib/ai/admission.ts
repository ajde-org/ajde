import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/lib/supabase/database.types";

// Policy values and feature-to-group mapping live only in ai_admission_policies /
// ai_admission_features. Endpoints pass a constant feature after validating access.
export const aiFeatureSchema = z.enum([
  "search", "parse", "screenshot", "interpret", "chat_assist", "translate_notes",
]);
export type AiFeature = z.infer<typeof aiFeatureSchema>;

const timestamp = z.iso.datetime({ offset: true });
export const aiAdmissionSchema = z.union([
  z.object({
    admitted: z.literal(true),
    operationId: z.uuid(),
    admittedAt: timestamp,
    deadlineAt: timestamp,
    nextActionAt: timestamp.optional(),
    lowAllowanceFullAt: timestamp.optional(),
  }).refine(value => Date.parse(value.admittedAt) < Date.parse(value.deadlineAt)),
  z.object({
    admitted: z.literal(false),
    reason: z.literal("allowance_limit"),
    retryAfterSeconds: z.number().int().positive(),
    retryAt: timestamp,
  }),
  z.object({ admitted: z.literal(false), reason: z.literal("conflict") }),
]);
export type AiAdmission = z.infer<typeof aiAdmissionSchema>;
export type AdmittedAiOperation = Extract<AiAdmission, { admitted: true }>;
export type AiAdmissionResult = AiAdmission | { admitted: false; reason: "storage_unavailable" };

/** A failed or malformed store response never grants permission to start paid work. */
export async function admitAiOperation(
  supabase: Pick<SupabaseClient<Database>, "rpc">,
  feature: AiFeature,
  requestId?: string | null,
  screenshotRequestId?: string,
): Promise<AiAdmissionResult> {
  try {
    const { data, error } = await supabase.rpc("admit_ai_operation", { p_feature: feature, ...(requestId && { p_request_id: requestId }), ...(screenshotRequestId && { p_screenshot_request_id: screenshotRequestId }) });
    if (error) return { admitted: false, reason: "storage_unavailable" };
    const parsed = aiAdmissionSchema.safeParse(data);
    return parsed.success ? parsed.data : { admitted: false, reason: "storage_unavailable" };
  } catch {
    return { admitted: false, reason: "storage_unavailable" };
  }
}
