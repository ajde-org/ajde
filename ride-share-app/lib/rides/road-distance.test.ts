import { afterEach, beforeEach, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const admin = vi.hoisted(() => ({ rpc: vi.fn(), create: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: admin.create }));

import { roadDistanceKm } from "./road-distance";

const userClient = {
  from: () => ({ select: async () => ({ data: [
    { id: 1, lat: 41.99646, lng: 21.43141 },
    { id: 3, lat: 41.03226, lng: 21.33553 },
  ], error: null }) }),
};

beforeEach(() => {
  admin.rpc.mockReset().mockResolvedValue({ data: true, error: null });
  admin.create.mockReset().mockImplementation(() => ({ rpc: admin.rpc }));
});
afterEach(() => vi.unstubAllGlobals());

it("returns an editable city-to-city road estimate after receiving a routing permit", async () => {
  const transport = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ code: "Ok", routes: [{ distance: 174255.6, duration: 9000 }] }));
  vi.stubGlobal("fetch", transport);
  const result = await roadDistanceKm(userClient, 1, 3);
  expect(result).toEqual({ ok: true, distanceKm: 174.3, durationMinutes: 150 });
  expect(transport.mock.calls[0][0]).toBe("https://router.project-osrm.org/route/v1/driving/21.43141,41.99646;21.33553,41.03226?overview=false&alternatives=false&steps=false");
});

it("takes the routing permit with the service-role client, not the user's client", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({ code: "Ok", routes: [{ distance: 1000, duration: 60 }] })));
  const userRpc = vi.fn();
  await roadDistanceKm({ ...userClient, rpc: userRpc } as typeof userClient, 1, 3);
  expect(admin.rpc).toHaveBeenCalledWith("try_ride_routing_request");
  expect(userRpc).not.toHaveBeenCalled();
});

it("reports routing as unavailable when the service-role client cannot be created", async () => {
  admin.create.mockImplementation(() => { throw new Error("Missing SUPABASE_SECRET_KEY"); });
  const transport = vi.fn(); vi.stubGlobal("fetch", transport);
  expect(await roadDistanceKm(userClient, 1, 3)).toEqual({ ok: false, error: "Routing is unavailable. Enter km manually.", status: 503 });
  expect(transport).not.toHaveBeenCalled();
});

it("does not take a permit for unsupported city pairs", async () => {
  expect(await roadDistanceKm(userClient, 1, 1)).toMatchObject({ ok: false, status: 400 });
  expect(admin.rpc).not.toHaveBeenCalled();
});
