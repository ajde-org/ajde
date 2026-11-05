import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const state = vi.hoisted(() => ({ read: vi.fn(), contacts: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ requireUser: async () => ({ id: "user" }) }));
vi.mock("./onboarding-form", () => ({ OnboardingForm: () => null }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({
  rpc: state.contacts,
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: state.read }) }) }),
}) }));
import OnboardingPage from "./page";
beforeEach(() => {
  vi.resetAllMocks();
  state.read.mockResolvedValue({ data: { full_name: "Test", university: "UKIM", photo_url: "/photo", bio: null, gender: null }, error: null });
  state.contacts.mockResolvedValue({ data: [{ id: "user", phone: "+38970123456", social_url: null }], error: null });
});
it.each(["profile", "contact"])("does not show an empty form on a %s read failure", async source => {
  (source === "profile" ? state.read : state.contacts).mockResolvedValue({ data: null, error: { code: "42501" } });
  await expect(OnboardingPage()).rejects.toThrow("Your profile could not be loaded");
});
it("renders complete profiles and genuinely new accounts", async () => {
  expect(await OnboardingPage()).toBeTruthy();
  state.read.mockResolvedValue({ data: null, error: null });
  state.contacts.mockResolvedValue({ data: [], error: null });
  expect(await OnboardingPage()).toBeTruthy();
});
