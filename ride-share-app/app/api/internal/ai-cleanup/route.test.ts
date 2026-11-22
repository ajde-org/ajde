import { afterEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ cleanup: vi.fn(), client: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: mocks.client }));
import { GET } from "./route";
afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });
it("fails closed on missing/weak configuration and unauthorized requests before admin access", async () => {
  vi.stubEnv("CRON_SECRET", "");
  expect((await GET(new Request("http://localhost/api/internal/ai-cleanup"))).status).toBe(503);
  vi.stubEnv("CRON_SECRET", "test-only-".repeat(5));
  expect((await GET(new Request("http://localhost/api/internal/ai-cleanup", { headers: { authorization: "Bearer wrong" } }))).status).toBe(401);
  expect(mocks.client).not.toHaveBeenCalled();
});
it("runs only the cleanup RPC for an authenticated scheduler", async () => {
  const secret = "test-only-".repeat(5); vi.stubEnv("CRON_SECRET", secret);
  mocks.cleanup.mockResolvedValue({ data: 3, error: null });
  const rpc = vi.fn().mockReturnValue({ abortSignal: mocks.cleanup }); mocks.client.mockReturnValue({ rpc });
  const response = await GET(new Request("http://localhost/api/internal/ai-cleanup", { headers: { authorization: `Bearer ${secret}` } }));
  expect(await response.json()).toEqual({ ok: true, removedOperations: 3 });
  expect(rpc).toHaveBeenCalledExactlyOnceWith("cleanup_ai_operations");
  expect(response.headers.get("cache-control")).toBe("private, no-store");
});
