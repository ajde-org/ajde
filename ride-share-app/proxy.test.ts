import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ read: vi.fn(), contacts: vi.fn() }));
vi.mock("@supabase/ssr", () => ({ createServerClient: (_url: string, _key: string, options: { cookies: { setAll: (cookies: unknown[]) => void } }) => ({
  auth: { getUser: async () => {
    options.cookies.setAll([{ name: "session", value: "rotated", options: { httpOnly: true } }]);
    return { data: { user: { id: "user", email: "test@students.finki.ukim.mk" } } };
  } },
  rpc: state.contacts,
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: state.read }) }) }),
}) }));
import { proxy } from "./proxy";
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co"); vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test");
  state.contacts.mockResolvedValue({ data: [{ id: "user", phone: "+38970123456" }], error: null });
});
afterEach(() => { vi.unstubAllEnvs(); vi.resetAllMocks(); });
it("does not redirect a database read failure to empty onboarding", async () => {
  state.read.mockResolvedValue({ data: null, error: { code: "42501" } });
  const response = await proxy(new NextRequest("http://localhost/rides", { headers: { cookie: "ajde_locale=mk" } }));
  expect(response.status).toBe(503);
  expect(response.headers.get("location")).toBeNull();
  expect(await response.text()).toBe("We could not load this page. Please try again.");
});
it("returns a retryable response on contact lookup failure", async () => {
  state.read.mockResolvedValue({ data: { full_name: "Test", photo_url: "/photo", university: "UKIM" }, error: null });
  state.contacts.mockResolvedValue({ data: null, error: { code: "42501" } });
  const response = await proxy(new NextRequest("http://localhost/rides"));
  expect(response.status).toBe(503);
  expect(response.headers.get("location")).toBeNull();
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(response.cookies.get("session")?.value).toBe("rotated");
});
it("allows completed profiles and redirects only genuinely missing profiles", async () => {
  state.read.mockResolvedValue({ data: { full_name: "Test", photo_url: "/photo", university: "UKIM", phone: "+38970123456" }, error: null });
  expect((await proxy(new NextRequest("http://localhost/rides"))).status).toBe(200);
  state.read.mockResolvedValue({ data: null, error: null });
  expect((await proxy(new NextRequest("http://localhost/rides"))).headers.get("location")).toBe("http://localhost/onboarding");
});
