import { afterEach, beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc: () => ({ abortSignal: mocks.query }) }) }));
import { aiSpendPolicy, checkAiSpend } from "./spend-control";
beforeEach(() => { vi.resetAllMocks(); vi.stubEnv("AI_SPEND_ALERT_USD", ""); vi.stubEnv("AI_SPEND_CUTOFF_USD", ""); vi.stubEnv("AI_SPEND_POLICY_EFFECTIVE_AT", ""); });
afterEach(() => vi.unstubAllEnvs());
it("does not invent a launch budget or query spend when monetary controls are unset", async () => {
  expect(aiSpendPolicy()).toEqual({ alertUsd: null, cutoffUsd: null, effectiveAt: null });
  expect(await checkAiSpend()).toBe("allowed"); expect(mocks.query).not.toHaveBeenCalled();
});
it("requires a valid reviewed effective date and threshold order", async () => {
  vi.stubEnv("AI_SPEND_CUTOFF_USD", "20"); expect(await checkAiSpend()).toBe("storage_unavailable");
  vi.stubEnv("AI_SPEND_POLICY_EFFECTIVE_AT", "2026-11-14T12:00:00Z"); vi.stubEnv("AI_SPEND_ALERT_USD", "21");
  expect(await checkAiSpend()).toBe("storage_unavailable");
});
it("alerts and blocks new work once the protective threshold is reached", async () => {
  vi.stubEnv("AI_SPEND_ALERT_USD", "10"); vi.stubEnv("AI_SPEND_CUTOFF_USD", "20"); vi.stubEnv("AI_SPEND_POLICY_EFFECTIVE_AT", "2026-11-14T12:00:00Z");
  mocks.query.mockResolvedValue({ data: { knownSpendUsd: 20, unknownCalls: 2 }, error: null });
  const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
  expect(await checkAiSpend()).toBe("spend_cutoff"); expect(warning).toHaveBeenCalledWith("AI spend alert", { knownSpendUsd: 20, unknownCalls: 2 }); warning.mockRestore();
  mocks.query.mockResolvedValue({ data: null, error: { message: "store failed" } });
  expect(await checkAiSpend()).toBe("storage_unavailable");
});
