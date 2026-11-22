import { afterEach, beforeEach, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const admin = vi.hoisted(() => ({ rpc: vi.fn(), create: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: admin.create }));

import { roadDistanceKm } from "./road-distance";

const session = vi.hoisted(() => ({ userId: "driver-1" as string | null }));
const userClient = {
  auth: { getUser: async () => ({ data: { user: session.userId ? { id: session.userId } : null } }) },
  from: () => ({ select: async () => ({ data: [
    { id: 1, lat: 41.99646, lng: 21.43141 },
    { id: 3, lat: 41.03226, lng: 21.33553 },
  ], error: null }) }),
};
const osrmOk = () => vi.fn<typeof fetch>().mockResolvedValue(Response.json({ code: "Ok", routes: [{ distance: 174255.6, duration: 9000 }] }));

beforeEach(() => {
  session.userId = "driver-1";
  admin.rpc.mockReset().mockResolvedValue({ data: { status: "granted" }, error: null });
  admin.create.mockReset().mockImplementation(() => ({ rpc: admin.rpc }));
});
afterEach(() => vi.unstubAllGlobals());

it("returns an editable city-to-city road estimate after receiving a routing permit", async () => {
  const transport = osrmOk();
  vi.stubGlobal("fetch", transport);
  const result = await roadDistanceKm(userClient, 1, 3);
  expect(result).toEqual({ ok: true, distanceKm: 174.3, durationMinutes: 150 });
  expect(transport.mock.calls[0][0]).toBe("https://router.project-osrm.org/route/v1/driving/21.43141,41.99646;21.33553,41.03226?overview=false&alternatives=false&steps=false");
});

it("takes the permit with the service-role client, for the user in the caller's session", async () => {
  vi.stubGlobal("fetch", osrmOk());
  const userRpc = vi.fn();
  await roadDistanceKm({ ...userClient, rpc: userRpc } as typeof userClient, 1, 3);
  expect(admin.rpc).toHaveBeenCalledWith("try_ride_routing_request", { p_user_id: "driver-1" });
  expect(userRpc).not.toHaveBeenCalled();
});

it("refuses to route without a signed-in user and takes no permit", async () => {
  session.userId = null;
  const transport = vi.fn(); vi.stubGlobal("fetch", transport);
  expect(await roadDistanceKm(userClient, 1, 3)).toMatchObject({ ok: false, status: 401 });
  expect(admin.rpc).not.toHaveBeenCalled();
  expect(transport).not.toHaveBeenCalled();
});

it("asks for a quick retry while the global routing slot is busy", async () => {
  admin.rpc.mockResolvedValue({ data: { status: "busy" }, error: null });
  const transport = vi.fn(); vi.stubGlobal("fetch", transport);
  const result = await roadDistanceKm(userClient, 1, 3);
  expect(result).toEqual({ ok: false, error: "Waiting for the routing service.", status: 429, retryAfterMs: 1300, retryAfterSeconds: 2 });
  expect(result).not.toHaveProperty("code");
  expect(transport).not.toHaveBeenCalled();
});

it("reports the per-user limit with its own code and the time until the window resets", async () => {
  admin.rpc.mockResolvedValue({ data: { status: "user_limit", retry_after_ms: 125_400 }, error: null });
  const transport = vi.fn(); vi.stubGlobal("fetch", transport);
  expect(await roadDistanceKm(userClient, 1, 3)).toEqual({
    ok: false, error: "Too many distance lookups. Enter km manually or try again later.", status: 429,
    code: "user_limit", retryAfterMs: 125_400, retryAfterSeconds: 126,
  });
  expect(transport).not.toHaveBeenCalled();
});

it.each([
  { data: null, error: { message: "permission denied" } },
  { data: true, error: null },
  { data: { status: "granted-ish" }, error: null },
  { data: { status: "user_limit" }, error: null },
])("treats a failed or unexpected permit response as unavailable routing (%o)", async response => {
  admin.rpc.mockResolvedValue(response);
  const transport = vi.fn(); vi.stubGlobal("fetch", transport);
  expect(await roadDistanceKm(userClient, 1, 3)).toEqual({ ok: false, error: "Routing is unavailable. Enter km manually.", status: 503 });
  expect(transport).not.toHaveBeenCalled();
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
