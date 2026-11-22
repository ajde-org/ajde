import { afterEach, beforeEach, expect, it, vi } from "vitest";
const fixture = vi.hoisted(() => ({ user: "driver" as string | null, ride: {} as Record<string, unknown>, car: {} as Record<string, unknown>, fail: false, stale: false, writes: 0 }));
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({
  auth: { getUser: async () => ({ data: { user: fixture.user ? { id: fixture.user } : null } }) },
  from: (table: string) => {
    const row = table === "rides" ? fixture.ride : fixture.car;
    const filters: Array<(row: Record<string, unknown>) => boolean> = [];
    let changes: Record<string, unknown> | undefined;
    const query = {
      select: () => query,
      eq: (key: string, value: unknown) => { filters.push(row => row[key] === value); return query; },
      gt: (key: string, value: string) => { filters.push(row => String(row[key]) > value); return query; },
      update: (value: Record<string, unknown>) => { changes = value; return query; },
      maybeSingle: async () => {
        if (changes && fixture.fail) return { error: { message: "failed" }, data: null };
        if (changes && fixture.stale) row.updated_at = "changed";
        if (!filters.every(matches => matches(row))) return { data: null, error: null };
        if (changes) { fixture.writes++; Object.assign(row, changes); }
        return { data: { ...row }, error: null };
      },
    };
    return query;
  },
}) }));
import { publishDraft } from "./publish-draft";
import { revalidatePath } from "next/cache";
const id = "40000000-0000-4000-8000-000000000001";
const carId = "50000000-0000-4000-8000-000000000001";
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-31T10:00:00Z")); vi.clearAllMocks();
  fixture.user = "driver"; fixture.fail = false; fixture.stale = false; fixture.writes = 0;
  fixture.car = { id: carId, owner_id: "driver", seats_total: 4 };
  fixture.ride = { id, driver_id: "driver", status: "draft", source: "native", import_id: null,
    origin_city_id: 1, dest_city_id: 3, origin_pickup_id: null, dest_pickup_id: null,
    departure_at: "2026-11-02T10:00:00Z", seats_total: 3, seats_available: 3, car_id: carId,
    price_per_seat_mkd: 250, notes: "Original notes", tags: [], gender_preference: "any", updated_at: "2026-10-30T10:00:00Z" };
});
afterEach(() => vi.useRealTimers());
it("publishes the existing ride without duplicating or changing its details and permits retries", async () => {
  const before = { ...fixture.ride };
  expect(await publishDraft(id)).toEqual({ success: true, message: "form.published" });
  expect(fixture.ride).toEqual({ ...before, status: "published" });
  expect(await publishDraft(id)).toMatchObject({ success: true });
  expect(fixture.writes).toBe(1);
  expect(revalidatePath).toHaveBeenCalledWith("/rides");
  expect(revalidatePath).toHaveBeenCalledWith("/dashboard/trips");
});
it.each([null, "another-driver"])("rejects unauthorized user %s", async user => {
  fixture.user = user;
  expect(await publishDraft(id)).toMatchObject({ success: false }); expect(fixture.writes).toBe(0);
});
it.each(["cancelled", "completed"])("does not reopen %s rides", async status => {
  fixture.ride.status = status;
  expect(await publishDraft(id)).toMatchObject({ success: false }); expect(fixture.writes).toBe(0);
});
it.each(["2026-10-30T10:00:00Z", "2027-11-02T10:00:00Z"])("rejects invalid departure %s", async departure => {
  fixture.ride.departure_at = departure;
  expect(await publishDraft(id)).toMatchObject({ success: false, message: "draftPublish.invalid" }); expect(fixture.writes).toBe(0);
});
it("checks vehicle ownership and capacity", async () => {
  fixture.car.owner_id = "another-driver";
  expect(await publishDraft(id)).toMatchObject({ success: false });
  fixture.car.owner_id = "driver"; fixture.car.seats_total = 2;
  expect(await publishDraft(id)).toMatchObject({ success: false }); expect(fixture.writes).toBe(0);
});
it("does not report success after a concurrent edit or failed update", async () => {
  fixture.stale = true;
  expect(await publishDraft(id)).toMatchObject({ success: false });
  fixture.stale = false; fixture.fail = true;
  expect(await publishDraft(id)).toMatchObject({ success: false }); expect(fixture.writes).toBe(0);
});
it("rejects malformed IDs", async () => {
  expect(await publishDraft("invalid")).toMatchObject({ success: false }); expect(fixture.writes).toBe(0);
});
