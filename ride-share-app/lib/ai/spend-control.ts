import "server-only";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

function dollars(value: string | undefined): number | null {
  if (!value?.trim()) return null;
  return z.coerce.number().finite().positive().max(1_000_000).parse(value);
}
export function aiSpendPolicy() {
  const alertUsd = dollars(process.env.AI_SPEND_ALERT_USD);
  const cutoffUsd = dollars(process.env.AI_SPEND_CUTOFF_USD);
  const effectiveAt = alertUsd !== null || cutoffUsd !== null ? z.iso.datetime({ offset: true }).parse(process.env.AI_SPEND_POLICY_EFFECTIVE_AT) : null;
  if (alertUsd !== null && cutoffUsd !== null && alertUsd >= cutoffUsd) throw new Error("AI alert must precede its protective cutoff");
  return { alertUsd, cutoffUsd, effectiveAt };
}
export async function checkAiSpend(): Promise<"allowed" | "spend_cutoff" | "storage_unavailable"> {
  try {
    const policy = aiSpendPolicy();
    if (policy.alertUsd === null && policy.cutoffUsd === null) return "allowed";
    const { data, error } = await createAdminClient().rpc("ai_spend_last_day").abortSignal(AbortSignal.timeout(5000));
    const parsed = z.object({ knownSpendUsd: z.number().nonnegative(), unknownCalls: z.number().int().nonnegative() }).safeParse(data);
    if (error || !parsed.success) return "storage_unavailable";
    if (policy.alertUsd !== null && parsed.data.knownSpendUsd >= policy.alertUsd) {
      console.warn("AI spend alert", { knownSpendUsd: parsed.data.knownSpendUsd, unknownCalls: parsed.data.unknownCalls });
    }
    return policy.cutoffUsd !== null && parsed.data.knownSpendUsd >= policy.cutoffUsd ? "spend_cutoff" : "allowed";
  } catch { return "storage_unavailable"; }
}
