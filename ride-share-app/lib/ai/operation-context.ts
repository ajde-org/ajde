import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import type { AiFeature } from "./admission";
import { recordProviderUsage } from "./accounting";
import { checkAiSpend } from "./spend-control";

export type AiOperationContext = {
  operationId: string;
  userId: string;
  feature: AiFeature;
  deadlineAt: number;
  expiresAtMonotonic?: number;
  signal: AbortSignal;
  calls: number;
  closed: boolean;
  serviceUnavailable?: "spend_cutoff" | "storage_unavailable";
};
export const aiOperationStorage = new AsyncLocalStorage<AiOperationContext>();
export const MAX_PROVIDER_CALLS: Record<AiFeature, number> = {
  search: 3, parse: 8, screenshot: 1, interpret: 1, chat_assist: 1, translate_notes: 1, explain: 1,
};
export function aiOperationExpired(context: AiOperationContext) {
  return context.expiresAtMonotonic === undefined ? Date.now() >= context.deadlineAt : performance.now() >= context.expiresAtMonotonic;
}

export function aiRequestSignal(signal?: AbortSignal | null) {
  const context = aiOperationStorage.getStore();
  const signals = [context?.signal, signal].filter((value): value is AbortSignal => Boolean(value));
  return signals.length ? AbortSignal.any(signals) : undefined;
}

/** Shared by SDK and direct HTTP calls, including nested location fallbacks. */
export const aiProviderFetch: typeof fetch = async (input, init) => {
  const context = aiOperationStorage.getStore();
  if (!context && process.env.NODE_ENV === "production") throw new Error("AI operation context required");
  if (process.env.AI_KILL_SWITCH === "true") throw new Error("AI temporarily disabled");
  const signal = aiRequestSignal(init?.signal);
  signal?.throwIfAborted();
  if (context) {
    if (context.closed || aiOperationExpired(context)) throw new Error("AI operation deadline exceeded");
    if (context.calls >= MAX_PROVIDER_CALLS[context.feature]) throw new Error("AI model round limit exceeded");
  }
  // Bound serialized catalogs and accumulated tool history as well as user input.
  const body = init?.body;
  const maxBytes = context?.feature === "screenshot" ? 6 * 1024 * 1024 : 256 * 1024;
  if (typeof body !== "string" || Buffer.byteLength(body, "utf8") > maxBytes) throw new Error("AI input too large");
  const spend = await checkAiSpend();
  if (spend !== "allowed") {
    if (context) context.serviceUnavailable = spend;
    throw new Error("AI is temporarily unavailable");
  }
  // A spend-store round trip may cross the operation deadline.
  signal?.throwIfAborted();
  if (context && (context.closed || aiOperationExpired(context))) throw new Error("AI operation deadline exceeded");
  if (context && context.calls >= MAX_PROVIDER_CALLS[context.feature]) throw new Error("AI model round limit exceeded");
  if (context) context.calls++;
  const started = Date.now();
  let model: string | null = null;
  try { const value = JSON.parse(body); if (typeof value.model === "string") model = value.model.slice(0, 160); } catch { /* Provider validates malformed JSON. */ }
  try {
    const response = await fetch(input, { ...init, signal });
    if (context) {
      let payload: unknown;
      try { payload = await response.clone().json(); } catch { /* Billable usage remains unknown. */ }
      const status = payload && typeof payload === "object" && "status" in payload ? payload.status : undefined;
      const outcome = !response.ok ? "provider_error" : status === "completed" ? "completed" : status === "incomplete" ? "incomplete" : "unknown";
      await recordProviderUsage(context, model, payload, Date.now() - started, outcome);
    }
    return response;
  } catch (error) {
    if (context) await recordProviderUsage(context, model, undefined, Date.now() - started,
      signal?.aborted ? aiOperationExpired(context) || signal.reason?.name === "TimeoutError" ? "timeout" : "cancelled" : "provider_error");
    throw error;
  }
};
