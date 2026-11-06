vi.mock("server-only", () => ({}));
vi.mock("@/lib/rides/route-estimate-cache", () => ({ cachedRouteEstimate: async () => ({ ok: true, durationMinutes: 150, distanceKm: 174.3 }) }));
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({ userId: "20000000-0000-4000-8000-000000000001" as string | null, rpc: vi.fn(), profileComplete: true as boolean | "error" }));
vi.mock("@/lib/auth/session", () => ({ getProfileCompletion: async () => {
  if (db.profileComplete === "error") throw new Error("Unable to load profile completion");
  return { complete: db.profileComplete, profileId: db.userId };
} }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ auth: { getUser: async () => ({ data: { user: db.userId ? { id: db.userId } : null } }) }, rpc: db.rpc }) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
import { createRide } from "./actions";
const rideId = "30000000-0000-4000-8000-000000000001", carId = "40000000-0000-4000-8000-000000000001";
const idle = { status: "idle" as const, message: "", fieldErrors: {} };
function form() {
  const data = new FormData();
  const values = { source: "native", originCityId: "1", destinationCityId: "3", departureAt: "2026-09-26T14:00:00Z", seatsTotal: "3", carMode: "existing", carId,
    pricePerSeatMkd: "400", genderPreference: "any", intent: "publish", submissionId: "50000000-0000-4000-8000-000000000001" };
  Object.entries(values).forEach(([key, value]) => data.set(key, value)); return data;
}
beforeEach(() => { vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(new Date("2026-09-22T10:00:00Z")); db.userId = "20000000-0000-4000-8000-000000000001"; db.profileComplete = true; db.rpc.mockReset().mockResolvedValue({ data: { rideId, carId, status: "published" }, error: null }); });
afterEach(() => vi.useRealTimers());
it("publishes through the atomic operation and returns the saved ride without navigating", async () => {
  const data = form(); data.set("driver_id", "forged-driver");
  expect(await createRide(idle, data)).toMatchObject({ status: "success", rideId, carId });
  const args = db.rpc.mock.calls[0][1];
  expect(args.p_offer).not.toHaveProperty("driver_id");
  expect(args.p_submission_id).toBe("50000000-0000-4000-8000-000000000001");
});

it("refuses to publish until the profile, including the phone number, is complete", async () => {
  db.profileComplete = false;
  expect(await createRide(idle, form())).toMatchObject({ status: "error", message: expect.stringContaining("phone number") });
  expect(db.rpc).not.toHaveBeenCalled();
});

it("still saves drafts without a complete profile", async () => {
  db.profileComplete = false;
  const data = form(); data.set("intent", "save_draft");
  expect(await createRide(idle, data)).toMatchObject({ status: "success" });
});

it("shows a retryable error when the profile check fails", async () => {
  db.profileComplete = "error";
  expect(await createRide(idle, form())).toMatchObject({ status: "error", message: "We could not check your profile. Please try again." });
  expect(db.rpc).not.toHaveBeenCalled();
});

it("saves a private draft through the same duplicate-safe operation", async () => {
  const data = form(); data.set("intent", "save_draft");
  db.rpc.mockResolvedValueOnce({ data: { rideId, carId, status: "draft" }, error: null });
  expect(await createRide(idle, data)).toMatchObject({ status: "success", message: "Ride saved as a draft.", rideId });
  expect(db.rpc.mock.calls[0][1].p_publish).toBe(false);
});

it("rejects past departures and missing seats without writing a ride or car", async () => {
  const data = form(); data.set("departureAt", "2020-01-01T10:00:00Z"); data.delete("seatsTotal");
  expect(await createRide(idle, data)).toMatchObject({ status: "error", fieldErrors: { seatsTotal: expect.any(Array) } });
  data.set("seatsTotal", "3");
  expect(await createRide(idle, data)).toMatchObject({ status: "error", fieldErrors: { departureAt: expect.any(Array) } });
  expect(db.rpc).not.toHaveBeenCalled();
});

it("requires authentication, preserves database ownership denials and permits distance-free publishing", async () => {
  db.userId = null;
  expect((await createRide(idle, form())).status).toBe("error");
  expect(db.rpc).not.toHaveBeenCalled();
  db.userId = "20000000-0000-4000-8000-000000000001";
  db.rpc.mockResolvedValueOnce({ error: { code: "42501" } });
  expect((await createRide(idle, form())).status).toBe("error");
  expect((await createRide(idle, form())).status).toBe("success");
  expect(db.rpc.mock.calls[1][1].p_offer.distanceKm).toBeNull();
});
