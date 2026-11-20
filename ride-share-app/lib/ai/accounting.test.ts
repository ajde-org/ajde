import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ insert: vi.fn(), persist: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from: () => ({ insert: mocks.insert }) }) }));
import { providerUsage, recordProviderUsage } from "./accounting";
import { aiOperationStorage, aiProviderFetch, type AiOperationContext } from "./operation-context";
import { estimatedAiCost } from "./pricing";
const context = (): AiOperationContext => ({ operationId: "94000000-0000-4000-8000-000000000001", userId: "member", feature: "parse", deadlineAt: Date.now() + 120_000, signal: new AbortController().signal, calls: 0, closed: false });
const response = { model: "gpt-5.4-mini-2026-03-17", status: "completed", usage: { input_tokens: 1000, input_tokens_details: { cached_tokens: 400 }, output_tokens: 200, output_tokens_details: { reasoning_tokens: 100 } } };
beforeEach(() => { vi.resetAllMocks(); mocks.persist.mockResolvedValue({ error: null }); mocks.insert.mockReturnValue({ abortSignal: mocks.persist }); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
it("prices cached input separately and never adds reasoning tokens to output", () => {
  expect(providerUsage(response)).toEqual({ actual_model: response.model, input_tokens: 1000, cached_input_tokens: 400, output_tokens: 200, estimated_cost_usd: 0.00138 });
});
it.each([null, "unknown-model", "gpt-5.4-mini-unrecognized-snapshot"])("keeps unknown pricing explicitly unknown: %s", model => {
  expect(estimatedAiCost(model, 1000, 400, 200)).toBeNull();
});
it("preserves available usage but marks missing cache, output and nonstandard service tiers unknown", () => {
  expect(providerUsage({ ...response, usage: { input_tokens: 1000, output_tokens: 200 } })).toMatchObject({ input_tokens: 1000, cached_input_tokens: null, estimated_cost_usd: null });
  expect(providerUsage({ ...response, usage: undefined })).toMatchObject({ input_tokens: null, output_tokens: null, estimated_cost_usd: null });
  expect(providerUsage({ ...response, service_tier: "priority" }).estimated_cost_usd).toBeNull();
  expect(estimatedAiCost(response.model, 100, 101, 10)).toBeNull();
});
it("aggregates all rounds under one operation and persists usage before downstream parsing", async () => {
  const transport = vi.fn().mockImplementation(async () => Response.json({ ...response, output: "private generated content" })); vi.stubGlobal("fetch", transport);
  const current = context();
  await expect(aiOperationStorage.run(current, async () => {
    await aiProviderFetch("https://api.openai.com/v1/responses", { body: JSON.stringify({ model: response.model, input: "private source" }) });
    await aiProviderFetch("https://api.openai.com/v1/responses", { body: JSON.stringify({ model: response.model, input: "private follow-up" }) });
    throw new Error("later parser failed");
  })).rejects.toThrow("later parser failed");
  expect(mocks.insert).toHaveBeenCalledTimes(2);
  const records = mocks.insert.mock.calls.map(call => call[0]);
  expect(records.reduce((total, record) => total + record.estimated_cost_usd, 0)).toBeCloseTo(0.00276);
  expect(records.every(record => record.operation_id === current.operationId)).toBe(true);
  expect(JSON.stringify(records)).not.toMatch(/private|output_tokens_details|reasoning_tokens/);
});
it("records unknown billable usage on provider failure without fabricating zero cost", async () => {
  const transport = vi.fn().mockRejectedValue(new Error("private provider details")); vi.stubGlobal("fetch", transport);
  await expect(aiOperationStorage.run(context(), () => aiProviderFetch("https://api.openai.com/v1/responses", { body: '{"model":"gpt-5.4-mini"}' }))).rejects.toThrow("private provider details");
  expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({ actual_model: null, estimated_cost_usd: null, outcome: "provider_error" }));
  expect(JSON.stringify(mocks.insert.mock.calls)).not.toContain("private provider details");
  expect(transport).toHaveBeenCalledTimes(1);
});
it("does not repeat paid execution when accounting fails", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.persist.mockResolvedValue({ error: { message: "private accounting details" } });
  const transport = vi.fn().mockImplementation(async () => Response.json(response)); vi.stubGlobal("fetch", transport);
  const result = await aiOperationStorage.run(context(), () => aiProviderFetch("https://api.openai.com/v1/responses", { body: '{"model":"gpt-5.4-mini"}' }));
  expect(result.ok).toBe(true); expect(transport).toHaveBeenCalledTimes(1); expect(mocks.insert).toHaveBeenCalledTimes(1);
  expect(log).toHaveBeenCalled(); expect(JSON.stringify(log.mock.calls)).not.toContain("private accounting details"); log.mockRestore();
});
it("writes unique call IDs for separate rounds", async () => {
  await recordProviderUsage(context(), response.model, response, 12, "completed");
  await recordProviderUsage(context(), response.model, response, 14, "completed");
  expect(mocks.insert.mock.calls[0][0].id).not.toBe(mocks.insert.mock.calls[1][0].id);
});
