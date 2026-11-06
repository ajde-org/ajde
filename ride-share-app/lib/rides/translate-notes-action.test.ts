import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ user: vi.fn(), from: vi.fn(), translate: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/session", () => ({ requireCompleteProfile: mocks.user }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ from: mocks.from }) }));
vi.mock("@/lib/ai/translate-ride-notes", () => ({ translateRideNotesText: mocks.translate }));
import { translateRideNotes } from "./translate-notes-action";
const rideId = "94000000-0000-4000-8000-000000000001";
function database(status: string, bookingStatus: string | null = null) {
  mocks.from.mockImplementation((table: string) => {
    const query = { select: () => query, eq: () => query, in: () => query,
      maybeSingle: async () => ({ data: table === "rides" ? { status, notes: "Stored source", driver_id: "driver" } : bookingStatus ? { status: bookingStatus } : null, error: null }) };
    return query;
  });
}
beforeEach(() => { vi.resetAllMocks(); mocks.user.mockResolvedValue({ id: "passenger", email: "test@students.finki.ukim.mk" }); mocks.translate.mockResolvedValue("Превод"); database("published"); });
it("validates IDs and locales before authenticating or calling the model", async () => {
  expect(await translateRideNotes({ rideId: "bad", locale: "mk" })).toEqual({ ok: false });
  expect(await translateRideNotes({ rideId, locale: "fr" })).toEqual({ ok: false });
  expect(mocks.user).not.toHaveBeenCalled();
  expect(mocks.translate).not.toHaveBeenCalled();
});
it("translates only the stored accessible source, ignoring supplied text", async () => {
  expect(await translateRideNotes({ rideId, locale: "mk", source: "Attacker input" })).toEqual({ ok: true, source: "Stored source", translation: "Превод" });
  expect(mocks.translate).toHaveBeenCalledWith("Stored source", "mk");
});
it("denies private ride access and unapproved accounts before model use", async () => {
  database("draft");
  expect(await translateRideNotes({ rideId, locale: "mk" })).toEqual({ ok: false });
  mocks.user.mockResolvedValue({ id: "passenger", email: "test@example.invalid" });
  database("published");
  expect(await translateRideNotes({ rideId, locale: "mk" })).toEqual({ ok: false });
  expect(mocks.translate).not.toHaveBeenCalled();
});
it("allows accepted passengers on completed rides and hides provider errors", async () => {
  database("completed", "accepted");
  mocks.translate.mockRejectedValue(new Error("Private provider details"));
  expect(await translateRideNotes({ rideId, locale: "en" })).toEqual({ ok: false });
  expect(mocks.translate).toHaveBeenCalledOnce();
});
