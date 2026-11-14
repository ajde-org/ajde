import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { admitAiOperation, aiFeatureSchema } from "./admission";

const admission = {
  admitted: true,
  operationId: "94000000-0000-4000-8000-000000000001",
  admittedAt: "2026-11-14T21:00:00+00:00",
  deadlineAt: "2026-11-14T21:02:00+00:00",
  leaseExpiresAt: "2026-11-14T21:03:00+00:00",
};

function client(result: unknown) {
  const rpc = vi.fn().mockResolvedValue(result);
  return { rpc, supabase: { rpc } as unknown as Pick<SupabaseClient<Database>, "rpc"> };
}

describe("AI admission store contract", () => {
  it("requests only a feature, without browser-owned limits or identity", async () => {
    const { rpc, supabase } = client({ data: admission, error: null });
    expect(await admitAiOperation(supabase, "screenshot")).toEqual(admission);
    expect(rpc).toHaveBeenCalledExactlyOnceWith("admit_ai_operation", { p_feature: "screenshot" });
  });

  it.each(["hourly_limit", "screenshot_limit", "burst_limit", "concurrency_limit"])(
    "preserves the database retry timing for %s", async reason => {
      const denial = { admitted: false, reason, retryAfterSeconds: 17, retryAt: "2026-11-14T21:00:17Z" };
      const { supabase } = client({ data: denial, error: null });
      expect(await admitAiOperation(supabase, "search")).toEqual(denial);
    },
  );

  it.each([
    { data: null, error: { message: "store unavailable" } },
    { data: admission, error: { message: "do not trust data alongside an error" } },
    { data: null, error: null },
    { data: { admitted: true }, error: null },
    { data: { ...admission, deadlineAt: admission.leaseExpiresAt }, error: null },
    { data: { admitted: false, reason: "hourly_limit", retryAfterSeconds: -1 }, error: null },
  ])("fails closed on storage errors or malformed responses: %j", async result => {
    const { supabase } = client(result);
    expect(await admitAiOperation(supabase, "parse")).toEqual({ admitted: false, reason: "storage_unavailable" });
  });

  it("fails closed if the RPC throws", async () => {
    const { rpc, supabase } = client(null);
    rpc.mockRejectedValueOnce(new Error("network unavailable"));
    expect(await admitAiOperation(supabase, "explain")).toEqual({ admitted: false, reason: "storage_unavailable" });
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("rejects arbitrary feature names", () => {
    expect(aiFeatureSchema.safeParse("manual_search").success).toBe(false);
  });
});
