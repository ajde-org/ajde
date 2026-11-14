import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/ai/accounting", () => ({ recordAiEvent: vi.fn(), recordProviderUsage: vi.fn() }));
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), release: vi.fn(), search: vi.fn(), parse: vi.fn(), read: vi.fn(), interpret: vi.fn(), explain: vi.fn() }));
vi.mock("@/lib/i18n/server", () => ({ getLocale: async () => "en" }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc: mocks.release }) }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => client }));
vi.mock("@/lib/rides/offer-api-auth", () => ({ offerApiContext: async () => ({ supabase: client, user }) }));
vi.mock("@/lib/ai/parse-search-query", async original => ({ ...await original<typeof import("@/lib/ai/parse-search-query")>(), parseSearchQuery: mocks.search }));
vi.mock("@/lib/ai/parse-ride-post", async original => ({ ...await original<typeof import("@/lib/ai/parse-ride-post")>(), parseRidePost: mocks.parse }));
vi.mock("@/lib/ai/read-screenshot", async original => ({ ...await original<typeof import("@/lib/ai/read-screenshot")>(), readScreenshot: mocks.read }));
vi.mock("@/lib/ai/parse-offer-description", async original => ({ ...await original<typeof import("@/lib/ai/parse-offer-description")>(), parseOfferDescription: mocks.interpret }));
vi.mock("@/lib/ai/explain-match", () => ({ explainMatch: mocks.explain }));
import { POST as search } from "./search/route";
import { POST as parse } from "./parse/route";
import { POST as screenshot } from "./parse/screenshot/route";
import { POST as interpret } from "./rides/interpret/route";
import { POST as explain } from "./explain/route";
import { emptyOfferDraft } from "@/lib/rides/offer-interpretation";
const id = "94000000-0000-4000-8000-000000000001";
const user = { id, email: "test@students.finki.ukim.mk" };
const context = { originId: null, destinationId: null, departureAfter: null, departureBefore: null, requestedSeats: null, confidence: 1, warnings: [] };
const client = { auth: { getUser: async () => ({ data: { user } }) }, rpc: mocks.rpc,
  from(table: string) {
    const data = table === "cities" ? [{ id: 1, name_en: "Skopje", name_mk: "Скопје", aliases: [] }, { id: 2, name_en: "Veles", name_mk: "Велес", aliases: [] }]
      : table === "rides" ? [{ id, origin_city_id: 1, dest_city_id: 2, departure_at: "2099-11-15T12:00:00Z", seats_available: 2, price_per_seat_mkd: 200, status: "published" }] : [];
    const query = { select: () => query, eq: () => query, in: () => query, gte: () => query, insert: () => query,
      maybeSingle: async () => ({ data: { full_name: "Member", photo_url: "photo", university: "UKIM" }, error: null }),
      single: async () => ({ data: { id }, error: null }),
      then: (resolve: (value: unknown) => void) => Promise.resolve({ data, error: null }).then(resolve) };
    return query;
  },
};
const json = (body: unknown) => new Request("https://rides.example/api/test", { method: "POST", body: JSON.stringify(body) });
const upload = () => { const form = new FormData(); form.set("image", new File([new Uint8Array([1])], "test.png", { type: "image/png" })); return new Request("https://rides.example/api/parse/screenshot", { method: "POST", body: form }); };
const entries = [
  { feature: "search", handler: search, request: () => json({ query: "Skopje tomorrow" }), model: mocks.search },
  { feature: "parse", handler: parse, request: () => json({ text: "Skopje Veles tomorrow at 17:00", sourceHint: "other" }), model: mocks.parse },
  { feature: "screenshot", handler: screenshot, request: upload, model: mocks.read },
  { feature: "interpret", handler: interpret, request: () => json({ text: "Skopje Veles tomorrow", mode: "create" }), model: mocks.interpret },
  { feature: "explain", handler: explain, request: () => json({ rideIds: [id], context }), model: mocks.explain },
];
beforeEach(() => {
  vi.resetAllMocks(); vi.stubEnv("OPENAI_API_KEY", "test-only"); vi.stubEnv("AI_IMPORT_PIPELINE_ENABLED", "false");
  mocks.rpc.mockResolvedValue({ data: { admitted: true, operationId: id, admittedAt: new Date().toISOString(), deadlineAt: new Date(Date.now() + 120_000).toISOString(), leaseExpiresAt: new Date(Date.now() + 180_000).toISOString() }, error: null });
  mocks.release.mockResolvedValue({ data: true, error: null });
  mocks.search.mockResolvedValue(context); mocks.parse.mockResolvedValue({ classification: "offer", sourceLanguage: "mk", draft: { ...emptyOfferDraft(), source: "imported", confidence: 1 } });
  mocks.read.mockResolvedValue({ posts: [] }); mocks.interpret.mockResolvedValue({ trips: [] }); mocks.explain.mockResolvedValue([]);
});
afterEach(() => vi.unstubAllEnvs());

describe.each(entries)("$feature endpoint admission", entry => {
  beforeEach(() => { if (entry.feature === "screenshot") vi.stubEnv("AI_IMPORT_PIPELINE_ENABLED", "true"); });
  it("admits one action and releases its lease", async () => {
    const result = await entry.handler(entry.request());
    expect(result.status).toBe(200); expect(entry.model).toHaveBeenCalledTimes(1);
    expect(mocks.rpc).toHaveBeenCalledExactlyOnceWith("admit_ai_operation", { p_feature: entry.feature });
    expect(mocks.release).toHaveBeenCalledWith("release_ai_operation", { p_operation_id: id, p_user_id: id });
  });
  it("makes zero model calls on denial and preserves exact retry information", async () => {
    mocks.rpc.mockResolvedValue({ data: { admitted: false, reason: "hourly_limit", retryAfterSeconds: 41, retryAt: "2026-11-15T12:00:41Z" }, error: null });
    const result = await entry.handler(entry.request());
    expect(result.status).toBe(429); expect(result.headers.get("retry-after")).toBe("41");
    expect(await result.json()).toMatchObject({ code: "rate_limit", retryAfterSeconds: 41 });
    expect(entry.model).not.toHaveBeenCalled(); expect(mocks.release).not.toHaveBeenCalled();
  });
  it("fails closed on a store error", async () => {
    mocks.rpc.mockResolvedValue({ data: null, error: { message: "private storage error" } });
    const result = await entry.handler(entry.request());
    expect(result.status).toBe(503); expect(entry.model).not.toHaveBeenCalled();
    expect(await result.text()).not.toContain("private storage error");
  });
});

it("keeps empty explanation requests free of admission and model calls", async () => {
  expect((await explain(json({ rideIds: [], context }))).status).toBe(200);
  expect(mocks.rpc).not.toHaveBeenCalled(); expect(mocks.explain).not.toHaveBeenCalled();
});
it("invalid input consumes no allowance", async () => {
  for (const handler of [search, parse, interpret, explain]) expect((await handler(json({}))).status).toBe(400);
  expect(mocks.rpc).not.toHaveBeenCalled();
});

it("admits search and its optional explanation separately across a complete mocked flow", async () => {
  const searched = await search(json({ query: "Skopje tomorrow" }));
  const { result } = await searched.json();
  const explained = await explain(json({ rideIds: [id], context: result }));
  expect(explained.status).toBe(200);
  expect(mocks.rpc.mock.calls.map(call => call[1].p_feature)).toEqual(["search", "explain"]);
  expect(mocks.search).toHaveBeenCalledTimes(1); expect(mocks.explain).toHaveBeenCalledTimes(1);
});
