import { beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
vi.mock("server-only", () => ({}));
const auth = vi.hoisted(() => ({ exchangeCodeForSession: vi.fn(), verifyOtp: vi.fn(), getUser: vi.fn(), signOut: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth }) }));
vi.mock("@/lib/auth/session", () => ({ getProfileCompletion: async () => ({ complete: true }), safeNextPath: (next: string | null) => next === "/rides" ? next : "/dashboard/trips" }));
import { GET } from "./callback/route";
import { POST } from "./signout/route";

beforeEach(() => {
  vi.clearAllMocks();
  auth.exchangeCodeForSession.mockResolvedValue({ error: null });
  auth.verifyOtp.mockResolvedValue({ error: null });
  auth.getUser.mockResolvedValue({ data: { user: { id: "student", email: "student@students.finki.ukim.mk" } } });
  auth.signOut.mockResolvedValue({ error: null });
});
it.each(["en", "mk"])("successful callbacks and sign-out leave the %s preference intact", async locale => {
  for (const query of ["code=fixture&next=/rides", "token_hash=fixture&type=magiclink&next=/rides"]) {
    const request = new NextRequest(`https://ajde.example/auth/callback?${query}`, { headers: { cookie: `ajde_locale=${locale}` } });
    const response = await GET(request);
    expect(response.headers.get("location")).toBe("https://ajde.example/rides");
    expect(response.cookies.get("ajde_locale")).toBeUndefined();
    expect(request.cookies.get("ajde_locale")?.value).toBe(locale);
  }
  const request = new NextRequest("https://ajde.example/auth/signout", { method: "POST", headers: { cookie: `ajde_locale=${locale}` } });
  const response = await POST(request);
  expect(auth.signOut).toHaveBeenCalledOnce();
  expect(response.status).toBe(303);
  expect(response.headers.get("location")).toBe("https://ajde.example/login?status=signed-out");
  expect(response.cookies.get("ajde_locale")).toBeUndefined();
});
