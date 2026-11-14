import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
const mocks = vi.hoisted(() => ({ admit: vi.fn(), release: vi.fn(), admin: vi.fn() }));
vi.mock("./admission", () => ({ admitAiOperation: mocks.admit }));
vi.mock("./accounting", () => ({ recordAiEvent: vi.fn(), recordProviderUsage: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.admin }));
import { runAiOperation, aiOperationFailure, AiOperationError } from "./operation";
import { aiProviderFetch, aiOperationStorage } from "./operation-context";
const options = { supabase: {} as SupabaseClient<Database>, userId: "member", feature: "parse" as const };
const operationId = "94000000-0000-4000-8000-000000000001";
beforeEach(() => {
  vi.resetAllMocks(); vi.stubEnv("OPENAI_API_KEY", "test-only");
  mocks.admin.mockReturnValue({ rpc: mocks.release });
  mocks.release.mockResolvedValue({ data: true, error: null });
  mocks.admit.mockResolvedValue({ admitted: true, operationId,
    admittedAt: new Date().toISOString(), deadlineAt: new Date(Date.now() + 120_000).toISOString(), leaseExpiresAt: new Date(Date.now() + 180_000).toISOString() });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("shared AI operation", () => {
  it.each(["hourly_limit", "screenshot_limit", "burst_limit", "concurrency_limit"])("does no paid work after %s denial", async reason => {
    mocks.admit.mockResolvedValue({ admitted: false, reason, retryAt: "2026-11-15T12:00:00Z", retryAfterSeconds: 27 });
    const work = vi.fn();
    let failure: unknown;
    try { await runAiOperation(options, work); } catch (error) { failure = error; }
    const response = aiOperationFailure(failure)!;
    expect(response.status).toBe(429); expect(response.headers.get("retry-after")).toBe("27");
    expect(await response.json()).toMatchObject({ code: "rate_limit", reason, retryAfterSeconds: 27 });
    expect(work).not.toHaveBeenCalled(); expect(mocks.release).not.toHaveBeenCalled();
  });
  it("uses a retryable service error for storage failure", async () => {
    mocks.admit.mockResolvedValue({ admitted: false, reason: "storage_unavailable" });
    await expect(runAiOperation(options, vi.fn())).rejects.toMatchObject({ failure: { reason: "storage_unavailable" } });
    expect(aiOperationFailure(new AiOperationError({ admitted: false, reason: "storage_unavailable" }))?.status).toBe(503);
  });
  it.each(["success", "failure"])("admits once and releases after %s without refunding", async outcome => {
    const work = vi.fn(async () => {
      expect(aiOperationStorage.getStore()).toMatchObject({ operationId, feature: "parse", userId: "member" });
      if (outcome === "failure") throw new Error("provider failed");
      return "done";
    });
    if (outcome === "success") expect(await runAiOperation(options, work)).toBe("done");
    else await expect(runAiOperation(options, work)).rejects.toThrow("provider failed");
    expect(mocks.admit).toHaveBeenCalledTimes(1);
    expect(mocks.release).toHaveBeenCalledExactlyOnceWith("release_ai_operation", { p_operation_id: operationId, p_user_id: "member" });
    expect(aiOperationStorage.getStore()).toBeUndefined();
  });
  it("checks required configuration and kill switch before admission", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    await expect(runAiOperation(options, vi.fn())).rejects.toMatchObject({ failure: { reason: "missing_key" } });
    vi.stubEnv("OPENAI_API_KEY", "test-only"); vi.stubEnv("AI_KILL_SWITCH", "true");
    await expect(runAiOperation(options, vi.fn())).rejects.toMatchObject({ failure: { reason: "disabled" } });
    vi.stubEnv("AI_KILL_SWITCH", "false"); mocks.admin.mockImplementation(() => { throw new Error("missing credentials"); });
    await expect(runAiOperation(options, vi.fn())).rejects.toMatchObject({ failure: { reason: "storage_unavailable" } });
    expect(mocks.admit).not.toHaveBeenCalled();
  });
  it("aborts nested fetches at the overall deadline and releases only after settlement", async () => {
    vi.useFakeTimers();
    let settle!: () => void;
    const work = runAiOperation(options, async context => {
      await new Promise<void>(resolve => { settle = resolve; });
      expect(context.signal.aborted).toBe(true);
      await expect(aiProviderFetch("https://api.openai.com/v1/responses", { body: "{}" })).rejects.toThrow();
    });
    await vi.advanceTimersByTimeAsync(120_001);
    expect(mocks.release).not.toHaveBeenCalled();
    const rejected = expect(work).rejects.toMatchObject({ failure: { reason: "timeout" } });
    settle(); await rejected;
    expect(mocks.release).toHaveBeenCalledTimes(1);
  });
  it("honors cancellation and prevents later paid work using the same context", async () => {
    const controller = new AbortController();
    let context: ReturnType<typeof aiOperationStorage.getStore>;
    await expect(runAiOperation({ ...options, signal: controller.signal }, async current => {
      context = current; controller.abort();
      await aiProviderFetch("https://api.openai.com/v1/responses", { body: "{}" });
    })).rejects.toMatchObject({ failure: { reason: "timeout" } });
    expect(context!.closed).toBe(true); expect(mocks.release).toHaveBeenCalledTimes(1);
  });
  it("enforces database-relative duration despite clock skew", async () => {
    vi.useFakeTimers();
    const databaseNow = Date.now() - 600_000;
    mocks.admit.mockResolvedValue({ admitted: true, operationId, admittedAt: new Date(databaseNow).toISOString(),
      deadlineAt: new Date(databaseNow + 120_000).toISOString(), leaseExpiresAt: new Date(databaseNow + 180_000).toISOString() });
    expect(await runAiOperation(options, async context => { expect(context.signal.aborted).toBe(false); return "allowed"; })).toBe("allowed");
  });
  it("counts SDK and direct HTTP rounds against one operation and bounds work", async () => {
    const transport = vi.fn().mockResolvedValue(Response.json({ usage: {} })); vi.stubGlobal("fetch", transport);
    await runAiOperation({ ...options, feature: "search" }, async () => {
      for (let i = 0; i < 3; i++) await aiProviderFetch("https://api.openai.com/v1/responses", { body: "{}" });
      await expect(aiProviderFetch("https://api.openai.com/v1/responses", { body: "{}" })).rejects.toThrow("round limit");
    });
    expect(transport).toHaveBeenCalledTimes(3); expect(mocks.admit).toHaveBeenCalledTimes(1);
  });
  it.each(["pending", "completed", "conflict"])("rejects duplicate execution state %s before admission", async state => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-only-secret");
    const rpc = vi.fn().mockResolvedValue({ data: { state }, error: null });
    const work = vi.fn();
    await expect(runAiOperation({ ...options, supabase: { rpc } as unknown as SupabaseClient<Database>, requestId: operationId, input: { text: "private" } }, work))
      .rejects.toMatchObject({ failure: { reason: state === "pending" ? "pending" : "conflict" } });
    expect(work).not.toHaveBeenCalled(); expect(mocks.admit).not.toHaveBeenCalled();
  });
  it("binds the admitted operation before paid work and finishes the execution key", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-only-secret");
    const rpc = vi.fn().mockResolvedValue({ data: { state: "claimed", claimId: operationId }, error: null });
    await runAiOperation({ ...options, supabase: { rpc } as unknown as SupabaseClient<Database>, requestId: operationId, input: { text: "private" } }, async () => {
      expect(mocks.release).toHaveBeenCalledWith("bind_ai_execution", { p_request_id: operationId, p_user_id: "member", p_operation_id: operationId, p_claim_id: operationId });
    });
    const fingerprint = rpc.mock.calls[0][1].p_input_hash;
    expect(fingerprint).toMatch(/^[a-f0-9]{64}$/); expect(fingerprint).not.toContain("private");
    expect(mocks.release).toHaveBeenCalledWith("finish_ai_execution", { p_request_id: operationId, p_user_id: "member", p_claim_id: operationId });
    expect(mocks.release).toHaveBeenCalledWith("release_ai_operation", { p_operation_id: operationId, p_user_id: "member" });
  });
  it("fails closed and frees its lease if execution binding fails", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-only-secret");
    const rpc = vi.fn().mockResolvedValue({ data: { state: "claimed", claimId: operationId }, error: null });
    mocks.release.mockResolvedValueOnce({ data: false, error: null });
    const work = vi.fn();
    await expect(runAiOperation({ ...options, supabase: { rpc } as unknown as SupabaseClient<Database>, requestId: operationId }, work))
      .rejects.toMatchObject({ failure: { reason: "storage_unavailable" } });
    expect(work).not.toHaveBeenCalled();
    expect(mocks.release).toHaveBeenCalledWith("release_ai_operation", expect.anything());
  });
});
