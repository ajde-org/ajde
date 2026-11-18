import { afterEach, expect, it, vi } from "vitest";
import { emptyOfferDraft } from "@/lib/rides/offer-interpretation";
import { offerApiContext } from "@/lib/rides/offer-api-auth";
import { POST } from "./route";

vi.mock("@/lib/rides/offer-api-auth", () => ({ offerApiContext: vi.fn() }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

it("fills a ride offer through the OpenAI structured response", async () => {
  vi.stubEnv("AJDE_OPENAI_API_KEY", "project-test-key");
  vi.stubEnv("OPENAI_API_KEY", "other-test-key");
  vi.stubEnv("OPENAI_BASE_URL", "https://other-provider.example/v1");
  const cities = [
    { id: 1, name_en: "Skopje", name_mk: "Скопје", aliases: [] },
    { id: 2, name_en: "Bitola", name_mk: "Битола", aliases: [] },
  ];
  vi.mocked(offerApiContext).mockResolvedValue({
    user: { id: "driver" },
    supabase: { from: (table: string) => ({
      select: () => Object.assign(Promise.resolve({ data: table === "cities" ? cities : [], error: null }), {
        eq: async () => ({ data: [], error: null }),
      }),
    }) },
  } as unknown as Awaited<ReturnType<typeof offerApiContext>>);

  const providerResult = {
    recurring: false,
    trips: [{
      draft: {
        ...emptyOfferDraft(),
        origin: { cityId: null, pickupPointId: null, rawText: "Skopje" },
        destination: { cityId: null, pickupPointId: null, rawText: "Bitola" },
        seatsTotal: 2,
      },
      mentioned: ["origin", "destination", "departureDate", "departureTime", "seatsTotal"],
      dateLocal: null,
      weekday: 6,
      dateEvidence: "Saturday",
      timeLocal: "16:00",
      timeEvidence: "4pm",
      carText: null,
    }],
  };
  const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(async (url, options) => {
    if (String(url) !== "https://api.openai.com/v1/responses"
        || new Headers(options?.headers).get("authorization") !== "Bearer project-test-key") {
      return Response.json({ error: { message: "Unknown endpoint or credentials" } }, { status: 404 });
    }
    return Response.json({
      status: "completed",
      output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(providerResult) }] }],
    });
  });
  vi.stubGlobal("fetch", fetch);
  const response = await POST(new Request("http://localhost/api/rides/interpret", {
    method: "POST",
    body: JSON.stringify({ text: "Skopje to Bitola on Saturday at 4pm, 2 seats", mode: "create" }),
  }));

  expect(response.status).toBe(200);
  expect(fetch).toHaveBeenCalledOnce();
  expect(await response.json()).toMatchObject({
    trips: [{ timeLocal: "16:00", draft: { origin: { cityId: 1 }, destination: { cityId: 2 }, seatsTotal: 2 } }],
  });
});
