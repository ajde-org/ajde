import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const read = vi.hoisted(() => vi.fn());
const contacts = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({
  rpc: contacts,
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: read }) }) }),
}) }));
import { getProfileCompletion } from "./session";
beforeEach(() => { vi.resetAllMocks(); contacts.mockResolvedValue({ data: [{ id: "user", phone: "+38970123456" }], error: null }); });
it("does not classify a failed profile query as incomplete onboarding", async () => {
  read.mockResolvedValue({ data: null, error: { code: "42501" } });
  await expect(getProfileCompletion("user")).rejects.toThrow("Unable to load profile completion");
});
it("recognizes completed profiles and genuine missing profiles", async () => {
  read.mockResolvedValue({ data: { id: "user", full_name: "Test User", photo_url: "/photo.png", university: "UKIM", phone: "+389 70 123 456" }, error: null });
  expect(await getProfileCompletion("user")).toEqual({ complete: true, profileId: "user" });
  expect(contacts).toHaveBeenCalledWith("profile_contacts", { profile_ids: ["user"] });
  read.mockResolvedValue({ data: null, error: null });
  expect(await getProfileCompletion("user")).toEqual({ complete: false, profileId: null });
});
it("does not treat a contact-permission failure as missing onboarding", async () => {
  read.mockResolvedValue({ data: { id: "user", full_name: "Test", photo_url: "/photo", university: "UKIM" }, error: null });
  contacts.mockResolvedValue({ data: null, error: { code: "42501" } });
  await expect(getProfileCompletion("user")).rejects.toThrow("Unable to load profile completion");
});
