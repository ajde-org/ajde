import { afterEach, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { POST } from "./route";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

it("searches for rides using the project key when the shell configures another provider", async () => {
  vi.stubEnv("AJDE_OPENAI_API_KEY", "project-test-key");
  vi.stubEnv("OPENAI_API_KEY", "other-test-key");
  vi.stubEnv("OPENAI_BASE_URL", "https://other-provider.example/v1");
  vi.stubEnv("STUDENT_EMAIL_DOMAINS", "students.example");
  const cities = [
    { id: 1, name_en: "Skopje", name_mk: "Скопје", aliases: [] },
    { id: 2, name_en: "Bitola", name_mk: "Битола", aliases: [] },
  ];
  vi.mocked(createClient).mockResolvedValue({
    auth: { getUser: async () => ({ data: { user: { id: "student", email: "student@students.example" } } }) },
    from: (table: string) => ({
      select: () => table === "profiles" ? {
        eq: () => ({
          maybeSingle: async () => ({ data: { full_name: "Student", photo_url: "/photo", university: "University" }, error: null }),
        }),
      } : Promise.resolve({ data: table === "cities" ? cities : [], error: null }),
    }),
  } as unknown as Awaited<ReturnType<typeof createClient>>);

  const providerResult = {
    originText: "Skopje", destinationText: "Bitola", dateLocal: null, dateEndLocal: null,
    timeMode: null, startTime: null, endTime: null, requestedSeats: null, confidence: 1, warnings: [],
  };
  const transport = vi.fn<typeof fetch>().mockImplementation(async (url, options) => {
    if (String(url) !== "https://api.openai.com/v1/responses"
        || new Headers(options?.headers).get("authorization") !== "Bearer project-test-key") {
      return Response.json({ error: { message: "Unknown endpoint or credentials" } }, { status: 404 });
    }
    return Response.json({
      status: "completed",
      output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(providerResult) }] }],
    });
  });
  vi.stubGlobal("fetch", transport);

  const response = await POST(new Request("http://localhost/api/search", {
    method: "POST",
    body: JSON.stringify({ query: "Skopje to Bitola" }),
  }));

  expect(response.status).toBe(200);
  expect(transport).toHaveBeenCalledOnce();
  expect(await response.json()).toMatchObject({ result: { originId: 1, destinationId: 2 } });
});
