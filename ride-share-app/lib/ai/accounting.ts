import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import type { TablesInsert } from "@/lib/supabase/database.types";
import { AI_PRICE_VERSION, estimatedAiCost } from "./pricing";
import type { AiOperationContext } from "./operation-context";

const tokens = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const usageSchema = z.object({ input_tokens: tokens.optional(), output_tokens: tokens.optional(),
  input_tokens_details: z.object({ cached_tokens: tokens.optional() }).optional() });
const responseSchema = z.object({ model: z.string().max(160).optional(), status: z.string().optional(), service_tier: z.string().optional(), usage: z.unknown().optional() });

export function providerUsage(response: unknown) {
  const parsed = responseSchema.safeParse(response);
  const usage = usageSchema.safeParse(parsed.success ? parsed.data.usage : undefined);
  const model = parsed.success ? parsed.data.model ?? null : null;
  const input = usage.success ? usage.data.input_tokens ?? null : null;
  const reportedCache = usage.success ? usage.data.input_tokens_details?.cached_tokens ?? null : null;
  const cached = reportedCache !== null && input !== null && reportedCache <= input ? reportedCache : null;
  const output = usage.success ? usage.data.output_tokens ?? null : null;
  const standardTier = parsed.success && (!parsed.data.service_tier || parsed.data.service_tier === "default");
  return { actual_model: model, input_tokens: input, cached_input_tokens: cached, output_tokens: output,
    estimated_cost_usd: standardTier ? estimatedAiCost(model, input, cached, output) : null };
}

export async function recordProviderUsage(context: AiOperationContext, requestedModel: string | null, response: unknown,
  durationMs: number, outcome: TablesInsert<"ai_provider_usage">["outcome"]) {
  try {
    const record: TablesInsert<"ai_provider_usage"> = { id: randomUUID(), operation_id: context.operationId,
      user_id: context.userId, feature: context.feature, requested_model: requestedModel,
      ...providerUsage(response), duration_ms: Math.max(0, Math.round(durationMs)), outcome, price_version: AI_PRICE_VERSION };
    const { error } = await createAdminClient().from("ai_provider_usage").insert(record).abortSignal(AbortSignal.timeout(5000));
    if (error) console.error("AI usage accounting failed", { operationId: context.operationId, feature: context.feature });
  } catch { console.error("AI usage accounting failed", { operationId: context.operationId, feature: context.feature }); }
}

export async function recordAiEvent(event: TablesInsert<"ai_request_events">) {
  try {
    const { error } = await createAdminClient().from("ai_request_events").insert(event).abortSignal(AbortSignal.timeout(5000));
    if (error) console.error("AI request accounting failed", { feature: event.feature, outcome: event.outcome });
  } catch { console.error("AI request accounting failed", { feature: event.feature, outcome: event.outcome }); }
}
