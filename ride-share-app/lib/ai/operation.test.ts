import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
const mocks = vi.hoisted(() => ({ admit: vi.fn() }));
vi.mock("./admission", () => ({ admitAiOperation: mocks.admit }));
vi.mock("./accounting", () => ({ recordAiEvent: vi.fn(), recordProviderUsage: vi.fn() }));
import { runAiOperation, aiOperationFailure, AiOperationError } from "./operation";
import { aiProviderFetch, aiOperationStorage } from "./operation-context";
const options = { supabase: {} as SupabaseClient<Database>, userId: "member", feature: "parse" as const };
const operationId = "94000000-0000-4000-8000-000000000001";
beforeEach(() => {
  vi.resetAllMocks(); vi.stubEnv("OPENAI_API_KEY", "test-only");
  mocks.admit.mockResolvedValue({ admitted: true, operationId,
    admittedAt: new Date().toISOString(), deadlineAt: new Date(Date.now() + 120_000).toISOString() });
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("shared AI operation", () => {
  it("does no paid work after an allowance denial", async () => {
    const reason = "allowance_limit";
    mocks.admit.mockResolvedValue({ admitted: false, reason, retryAt: "2026-11-15T12:00:00Z", retryAfterSeconds: 27 });
    const work = vi.fn();
    let failure: unknown;
    try { await runAiOperation(options, work); } catch (error) { failure = error; }
    const response = aiOperationFailure(failure)!;
    expect(response.status).toBe(429); expect(response.headers.get("retry-after")).toBe("27");
    expect(await response.json()).toMatchObject({ code: "rate_limit", reason, retryAfterSeconds: 27 });
    expect(work).not.toHaveBeenCalled();
  });
  it("uses a retryable service error for storage failure", async () => {
    mocks.admit.mockResolvedValue({ admitted: false, reason: "storage_unavailable" });
    await expect(runAiOperation(options, vi.fn())).rejects.toMatchObject({ failure: { reason: "storage_unavailable" } });
    expect(aiOperationFailure(new AiOperationError({ admitted: false, reason: "storage_unavailable" }))?.status).toBe(503);
  });
  it.each(["success", "failure"])("admits once on %s without refunding", async outcome => {
    const work = vi.fn(async () => {
      expect(aiOperationStorage.getStore()).toMatchObject({ operationId, feature: "parse", userId: "member" });
      if (outcome === "failure") throw new Error("provider failed");
      return "done";
    });
    if (outcome === "success") expect(await runAiOperation(options, work)).toBe("done");
    else await expect(runAiOperation(options, work)).rejects.toThrow("provider failed");
    expect(mocks.admit).toHaveBeenCalledTimes(1);

    expect(aiOperationStorage.getStore()).toBeUndefined();
  });
  it("checks required configuration and kill switch before admission", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    await expect(runAiOperation(options, vi.fn())).rejects.toMatchObject({ failure: { reason: "missing_key" } });
    vi.stubEnv("OPENAI_API_KEY", "test-only"); vi.stubEnv("AI_KILL_SWITCH", "true");
    await expect(runAiOperation(options, vi.fn())).rejects.toMatchObject({ failure: { reason: "disabled" } });
    expect(mocks.admit).not.toHaveBeenCalled();
  });
  it("aborts nested fetches at the overall deadline", async () => {
    vi.useFakeTimers();
    let settle!: () => void;
    const work = runAiOperation(options, async context => {
      await new Promise<void>(resolve => { settle = resolve; });
      expect(context.signal.aborted).toBe(true);
      await expect(aiProviderFetch("https://api.openai.com/v1/responses", { body: "{}" })).rejects.toThrow();
    });
    await vi.advanceTimersByTimeAsync(120_001);

    const rejected = expect(work).rejects.toMatchObject({ failure: { reason: "timeout" } });
    settle(); await rejected;
  });
  it("honors cancellation and prevents later paid work using the same context", async () => {
    const controller = new AbortController();
    let context: ReturnType<typeof aiOperationStorage.getStore>;
    await expect(runAiOperation({ ...options, signal: controller.signal }, async current => {
      context = current; controller.abort();
      await aiProviderFetch("https://api.openai.com/v1/responses", { body: "{}" });
    })).rejects.toMatchObject({ failure: { reason: "timeout" } });
    expect(context!.closed).toBe(true);
  });
  it("enforces database-relative duration despite clock skew", async () => {
    vi.useFakeTimers();
    const databaseNow = Date.now() - 600_000;
    mocks.admit.mockResolvedValue({ admitted: true, operationId, admittedAt: new Date(databaseNow).toISOString(),
      deadlineAt: new Date(databaseNow + 120_000).toISOString() });
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
  it("rejects duplicate actions before provider work", async () => {
    mocks.admit.mockResolvedValue({ admitted: false, reason: "conflict" });
    const work = vi.fn();
    await expect(runAiOperation({ ...options, requestId: operationId }, work)).rejects.toMatchObject({ failure: { reason: "conflict" } });
    expect(mocks.admit).toHaveBeenCalledExactlyOnceWith(options.supabase, options.feature, operationId);
    expect(work).not.toHaveBeenCalled();
  });
  it("bounds accumulated search input before dispatch", async () => {
    const transport = vi.fn().mockResolvedValue(Response.json({})); vi.stubGlobal("fetch", transport);
    await runAiOperation({ ...options, feature: "search" }, async () => {
      const init = { body: JSON.stringify({ text: "x".repeat(24000) }) };
      await aiProviderFetch("https://example.com", init);
      await expect(aiProviderFetch("https://example.com", init)).rejects.toThrow("input limit");
    });
    expect(transport).toHaveBeenCalledTimes(1);
  });
});
