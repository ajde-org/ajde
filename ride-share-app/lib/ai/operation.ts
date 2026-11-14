import "server-only";
import { createHmac } from "node:crypto";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { createAdminClient } from "@/lib/supabase/admin";
import { admitAiOperation, type AiFeature, type AiAdmissionResult } from "./admission";
import { aiOperationStorage, aiOperationExpired, type AiOperationContext } from "./operation-context";
import { recordAiEvent } from "./accounting";
import { checkAiSpend } from "./spend-control";

export class AiOperationError extends Error {
  constructor(readonly failure: Exclude<AiAdmissionResult, { admitted: true }> |
    { admitted: false; reason: "missing_key" | "disabled" | "spend_cutoff" | "timeout" | "invalid_request_id" | "pending" | "conflict" }) {
    super(failure.reason);
  }
}

export type AiOperationOptions = {
  supabase: SupabaseClient<Database>;
  userId: string;
  feature: AiFeature;
  signal?: AbortSignal;
  requestId?: string | null;
  input?: unknown;
};

export function aiRequestIdentity(request: Request, input: unknown) {
  return { requestId: request.headers.get("Idempotency-Key"), input };
}

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, canonical(child)]));
  return value;
}

/** Call only after request validation and authorization; one permit covers all nested calls. */
export async function runAiOperation<T>(options: AiOperationOptions, work: (context: AiOperationContext) => Promise<T>): Promise<T> {
  const started = Date.now();
  try { return await startAiOperation(options, work); }
  catch (error) {
    if (error instanceof AiOperationError && error.failure.reason !== "timeout") {
      await recordAiEvent({ user_id: options.userId, feature: options.feature,
        outcome: "retryAfterSeconds" in error.failure ? "denied" : error.failure.reason === "storage_unavailable" ? "storage_error" : "disabled",
        reason: error.failure.reason, duration_ms: Date.now() - started });
    }
    throw error;
  }
}

async function startAiOperation<T>(options: AiOperationOptions, work: (context: AiOperationContext) => Promise<T>): Promise<T> {
  if (process.env.AI_KILL_SWITCH === "true") throw new AiOperationError({ admitted: false, reason: "disabled" });
  if (!process.env.OPENAI_API_KEY?.trim()) throw new AiOperationError({ admitted: false, reason: "missing_key" });
  options.signal?.throwIfAborted();
  // Verify required release credentials before consuming any allowance.
  let admin: ReturnType<typeof createAdminClient>;
  try { admin = createAdminClient(); }
  catch { throw new AiOperationError({ admitted: false, reason: "storage_unavailable" }); }
  const spend = await checkAiSpend();
  if (spend !== "allowed") throw new AiOperationError({ admitted: false, reason: spend });
  let claimId: string | undefined;
  if (options.requestId !== undefined && options.requestId !== null) {
    if (!z.uuid().safeParse(options.requestId).success) throw new AiOperationError({ admitted: false, reason: "invalid_request_id" });
    const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!secret) throw new AiOperationError({ admitted: false, reason: "storage_unavailable" });
    const hash = createHmac("sha256", secret).update(JSON.stringify(canonical({ feature: options.feature, input: options.input }))).digest("hex");
    let claim;
    try { claim = await options.supabase.rpc("claim_ai_execution", { p_request_id: options.requestId, p_feature: options.feature, p_input_hash: hash }); }
    catch { throw new AiOperationError({ admitted: false, reason: "storage_unavailable" }); }
    const result = z.object({ state: z.enum(["claimed", "pending", "completed", "conflict"]), claimId: z.uuid().optional() }).safeParse(claim.data);
    if (claim.error || !result.success) throw new AiOperationError({ admitted: false, reason: "storage_unavailable" });
    if (result.data.state !== "claimed") throw new AiOperationError({ admitted: false, reason: result.data.state === "pending" ? "pending" : "conflict" });
    if (!result.data.claimId) throw new AiOperationError({ admitted: false, reason: "storage_unavailable" });
    claimId = result.data.claimId;
  }
  try {
    return await executeAdmittedOperation(options, admin, work, claimId);
  } finally {
    if (options.requestId) {
      try {
        const { error } = await admin.rpc("finish_ai_execution", { p_request_id: options.requestId, p_user_id: options.userId, p_claim_id: claimId! });
        if (error) console.error("AI execution completion failed");
      } catch { console.error("AI execution completion failed"); }
    }
  }
}

async function executeAdmittedOperation<T>(options: AiOperationOptions, admin: ReturnType<typeof createAdminClient>, work: (context: AiOperationContext) => Promise<T>, claimId?: string) {
  const admissionStarted = performance.now();
  const admission = await admitAiOperation(options.supabase, options.feature);
  if (!admission.admitted) throw new AiOperationError(admission);
  const controller = new AbortController();
  // Database-relative duration minus the entire RPC round trip is conservative even
  // when application/database clocks disagree or admission waited on a user lock.
  const remaining = Date.parse(admission.deadlineAt) - Date.parse(admission.admittedAt) - (performance.now() - admissionStarted);
  const deadlineAt = Date.now() + remaining;
  const signal = options.signal ? AbortSignal.any([controller.signal, options.signal]) : controller.signal;
  const context: AiOperationContext = { operationId: admission.operationId, userId: options.userId,
    feature: options.feature, deadlineAt, expiresAtMonotonic: performance.now() + remaining, signal, calls: 0, closed: false };
  const timer = setTimeout(() => controller.abort(new Error("AI operation deadline exceeded")), Math.max(0, remaining));
  const started = Date.now();
  let outcome: "completed" | "failed" | "timeout" | "cancelled" = "failed";
  try {
    if (options.requestId) {
      const { data, error } = await admin.rpc("bind_ai_execution", { p_request_id: options.requestId, p_user_id: options.userId, p_operation_id: admission.operationId, p_claim_id: claimId! });
      if (error || data !== true) throw new AiOperationError({ admitted: false, reason: "storage_unavailable" });
    }
    if (remaining <= 0) throw new AiOperationError({ admitted: false, reason: "timeout" });
    signal.throwIfAborted();
    const result = await aiOperationStorage.run(context, () => work(context));
    if (context.serviceUnavailable) throw new AiOperationError({ admitted: false, reason: context.serviceUnavailable });
    if (signal.aborted || aiOperationExpired(context)) throw new AiOperationError({ admitted: false, reason: "timeout" });
    outcome = result instanceof Response && result.status >= 400 ? "failed" : "completed";
    return result;
  } catch (error) {
    if (context.serviceUnavailable) throw new AiOperationError({ admitted: false, reason: context.serviceUnavailable });
    if (signal.aborted) outcome = aiOperationExpired(context) ? "timeout" : "cancelled";
    if (signal.aborted || aiOperationExpired(context)) throw new AiOperationError({ admitted: false, reason: "timeout" });
    throw error;
  } finally {
    // Await work's settlement before releasing. A race with an abort promise could release
    // while the old callback can still start paid work. Closed contexts reject late tasks.
    context.closed = true;
    controller.abort();
    clearTimeout(timer);
    await recordAiEvent({ user_id: options.userId, feature: options.feature, operation_id: admission.operationId,
      outcome, duration_ms: Date.now() - started });
    try {
      const { error } = await admin.rpc("release_ai_operation", { p_operation_id: admission.operationId, p_user_id: options.userId });
      if (error) console.error("AI lease release failed", { operationId: admission.operationId });
    } catch { console.error("AI lease release failed", { operationId: admission.operationId }); }
  }
}

export function aiOperationFailure(error: unknown): Response | null {
  if (!(error instanceof AiOperationError)) return null;
  const failure = error.failure;
  const limited = "retryAfterSeconds" in failure;
  return Response.json({ error: limited ? "AI is busy. Try again after the indicated time." : "AI is temporarily unavailable. Try again or continue manually.",
    code: limited ? "rate_limit" : failure.reason, ...failure },
  { status: limited ? 429 : failure.reason === "timeout" ? 504 : failure.reason === "pending" ? 202 : failure.reason === "conflict" ? 409 : failure.reason === "invalid_request_id" ? 400 : 503,
    headers: { "Cache-Control": "private, no-store", ...(limited ? { "Retry-After": String(failure.retryAfterSeconds) } : {}) } });
}
