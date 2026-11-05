import { afterEach, beforeEach, expect, it, vi } from "vitest";

const bookingId = "50000000-0000-4000-8000-000000000001";
const fixture = vi.hoisted(() => ({
  booking: {
    id: "50000000-0000-4000-8000-000000000001", ride_id: "ride", passenger_id: "passenger", status: "accepted",
    rides: { departure_at: "2026-09-22T12:00:00Z" } as { departure_at: string } | null,
  },
  updates: [] as Record<string, unknown>[],
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "passenger" } } }) },
    from: () => {
      const query = {
        select: () => query,
        eq: () => query,
        in: async () => ({ error: null }),
        update: (changes: Record<string, unknown>) => { fixture.updates.push(changes); return query; },
        maybeSingle: async () => ({ data: { ...fixture.booking }, error: null }),
      };
      return query;
    },
  }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: (url: string) => { throw new Error(decodeURIComponent(url)); } }));

import { cancelBooking } from "./actions";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-09-21T12:00:00Z"));
  fixture.booking.status = "accepted";
  fixture.booking.rides = { departure_at: "2026-09-22T12:00:00Z" };
  fixture.updates = [];
});
afterEach(() => vi.useRealTimers());

it("cancels an accepted booking before departure", async () => {
  await expect(cancelBooking(bookingId)).rejects.toThrow("success=Booking cancelled.");
  expect(fixture.updates).toEqual([{ status: "cancelled", decided_at: null }]);
});

it("refuses to cancel once the ride has departed", async () => {
  vi.setSystemTime(new Date("2026-09-22T13:00:00Z"));
  await expect(cancelBooking(bookingId)).rejects.toThrow("already departed");
  expect(fixture.updates).toEqual([]);
});

it("refuses to cancel when the ride cannot be read", async () => {
  fixture.booking.rides = null;
  await expect(cancelBooking(bookingId)).rejects.toThrow("already departed");
  expect(fixture.updates).toEqual([]);
});
