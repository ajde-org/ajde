import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { admitAiOperation, type AiFeature, type AiAdmissionResult } from "./admission";
import { aiOperationStorage, aiOperationExpired, type AiOperationContext } from "./operation-context";
import { recordAiEvent } from "./accounting";

const allowanceNotice = new AsyncLocalStorage<{ fullAt?: string; nextActionAt?: string }>();

export async function collectAiAllowance<T>(work: () => Promise<T>) {
  const notice: { fullAt?: string; nextActionAt?: string } = {};
  const result = await allowanceNotice.run(notice, work);
  return { result, ...notice };
}

export function withAiAllowance(handler: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    const { result, fullAt, nextActionAt } = await collectAiAllowance(() => handler(request));
    if (nextActionAt) result.headers.set("X-AI-Next-Action-At", nextActionAt);
    if (fullAt) result.headers.set("X-AI-Allowance-Full-At", fullAt);
    return result;
  };
}

export class AiOperationError extends Error {
  constructor(readonly failure: Exclude<AiAdmissionResult, { admitted: true }> |
    { admitted: false; reason: "missing_key" | "disabled" | "timeout" | "invalid_request_id" }) {
    super(failure.reason);
  }
}

export type AiOperationOptions = {
  supabase: SupabaseClient<Database>;
  userId: string;
  feature: AiFeature;
  signal?: AbortSignal;
  requestId?: string | null;
  screenshotRequestId?: string;
};

export function aiRequestIdentity(request: Request) {
  return { requestId: request.headers.get("Idempotency-Key") };
}

/** Call only after request validation and authorization; one weighted debit covers all nested calls. */
export async function runAiOperation<T>(options: AiOperationOptions, work: (context: AiOperationContext) => Promise<T>): Promise<T> {
  const started = Date.now();
  try { return await startAiOperation(options, work); }
  catch (error) {
    if (error instanceof AiOperationError && error.failure.reason !== "timeout" && error.failure.reason !== "conflict") {
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
  if (options.requestId != null && !z.uuid().safeParse(options.requestId).success) {
    throw new AiOperationError({ admitted: false, reason: "invalid_request_id" });
  }
  const admissionStarted = performance.now();
  const admission = await admitAiOperation(options.supabase, options.feature, options.requestId, options.screenshotRequestId);
  if (!admission.admitted) throw new AiOperationError(admission);
  const notice = allowanceNotice.getStore();
  if (notice) {
    notice.fullAt = admission.lowAllowanceFullAt;
    notice.nextActionAt = admission.nextActionAt;
  }
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
    if (remaining <= 0) throw new AiOperationError({ admitted: false, reason: "timeout" });
    signal.throwIfAborted();
    const result = await aiOperationStorage.run(context, () => work(context));
    if (signal.aborted || aiOperationExpired(context)) throw new AiOperationError({ admitted: false, reason: "timeout" });
    outcome = result instanceof Response && result.status >= 400 ? "failed" : "completed";
    return result;
  } catch (error) {
    if (signal.aborted) outcome = aiOperationExpired(context) ? "timeout" : "cancelled";
    if (signal.aborted || aiOperationExpired(context)) throw new AiOperationError({ admitted: false, reason: "timeout" });
    throw error;
  } finally {
    context.closed = true;
    controller.abort();
    clearTimeout(timer);
    await recordAiEvent({ user_id: options.userId, feature: options.feature, operation_id: admission.operationId,
      outcome, duration_ms: Date.now() - started });
  }
}

export function aiOperationFailure(error: unknown): Response | null {
  if (!(error instanceof AiOperationError)) return null;
  const failure = error.failure;
  const limited = "retryAfterSeconds" in failure;
  return Response.json({ error: limited ? "AI is busy. Try again after the indicated time." : "AI is temporarily unavailable. Try again or continue manually.",
    code: limited ? "rate_limit" : failure.reason, ...failure },
  { status: limited ? 429 : failure.reason === "timeout" ? 504 : failure.reason === "conflict" ? 409 : failure.reason === "invalid_request_id" ? 400 : 503,
    headers: { "Cache-Control": "private, no-store", ...(limited ? { "Retry-After": String(failure.retryAfterSeconds) } : {}) } });
}
