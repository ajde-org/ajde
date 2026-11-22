import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("@/lib/ai/accounting", () => ({ recordAiEvent: vi.fn(), recordProviderUsage: vi.fn() }));
const mocks = vi.hoisted(() => ({ user: vi.fn(), from: vi.fn(), translate: vi.fn(), permit: vi.fn(), release: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ rpc: mocks.release }) }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/session", () => ({ requireCompleteProfile: mocks.user }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ from: mocks.from, rpc: mocks.permit }) }));
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
beforeEach(() => { vi.resetAllMocks(); vi.stubEnv("OPENAI_API_KEY", "test-only");
  mocks.permit.mockResolvedValue({ data: { admitted: true, operationId: rideId, admittedAt: new Date().toISOString(), deadlineAt: new Date(Date.now() + 120_000).toISOString() }, error: null });
  mocks.release.mockResolvedValue({ data: true, error: null });
  mocks.user.mockResolvedValue({ id: "passenger", email: "test@students.finki.ukim.mk" }); mocks.translate.mockResolvedValue("Превод"); database("published"); });
afterEach(() => vi.unstubAllEnvs());
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
  expect(mocks.release).not.toHaveBeenCalled();
});

it("returns retry timing without calling translation when limited", async () => {
  mocks.permit.mockResolvedValue({ data: { admitted: false, reason: "allowance_limit", retryAfterSeconds: 31, retryAt: "2026-11-15T12:00:31Z" }, error: null });
  expect(await translateRideNotes({ rideId, locale: "mk" })).toMatchObject({ ok: false, code: "rate_limit", retryAfterSeconds: 31 });
  expect(mocks.translate).not.toHaveBeenCalled(); expect(mocks.release).not.toHaveBeenCalled();
});
it("discards generated notes when ride access is lost during the model call", async () => {
  mocks.translate.mockImplementation(async () => { database("draft"); return "Private translation"; });
  expect(await translateRideNotes({ rideId, locale: "en" })).toEqual({ ok: false });
  expect(mocks.release).not.toHaveBeenCalled();
});
