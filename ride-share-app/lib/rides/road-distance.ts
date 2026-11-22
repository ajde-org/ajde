import "server-only";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

type CityCoordinates = { id: number; lat: number; lng: number };

/** The caller's client: the city lookup runs under the user's RLS, and the session names the user. */
export type RoadDistanceClient = {
  auth: { getUser(): PromiseLike<{ data: { user: { id: string } | null } }> };
  from(table: "cities"): {
    select(columns: "id, lat, lng"): PromiseLike<{ data: CityCoordinates[] | null; error: unknown }>;
  };
};

export type RoadDistanceResult =
  | { ok: true; distanceKm: number; durationMinutes: number }
  | { ok: false; error: string; status: 400 | 401 | 429 | 502 | 503; code?: "user_limit"; retryAfterMs?: number; retryAfterSeconds?: number };

const routeSchema = z.object({ code: z.literal("Ok"), routes: z.array(z.object({ distance: z.number().positive().finite(), duration: z.number().positive().finite().max(86400) })).min(1) });

const permitSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("granted") }),
  z.object({ status: z.literal("busy") }),
  z.object({ status: z.literal("user_limit"), retry_after_ms: z.number().int().nonnegative() }),
]);

/**
 * The application-wide routing permit is server-only (AJDE-56): users can't call it through the API,
 * so it's taken with the service-role client, for the user named by the caller's own session.
 * The database also caps each user's permits, so one user can't hold the global slot.
 */
async function takeRoutingPermit(userId: string) {
  try {
    const { data, error } = await createAdminClient().rpc("try_ride_routing_request", { p_user_id: userId });
    if (error) return null;
    const permit = permitSchema.safeParse(data);
    return permit.success ? permit.data : null;
  } catch {
    return null;
  }
}

/** Canonical city reference coordinates define the estimate, never pickup points. */
export async function roadDistanceKm(client: RoadDistanceClient, originCityId: number, destinationCityId: number): Promise<RoadDistanceResult> {
  const { data: cities, error } = await client.from("cities").select("id, lat, lng");
  if (error || !cities) return { ok: false, error: "Cities are unavailable. Enter km manually.", status: 503 };
  const origin = cities.find(city => city.id === originCityId);
  const destination = cities.find(city => city.id === destinationCityId);
  if (!origin || !destination || origin.id === destination.id) return { ok: false, error: "Choose two different supported cities.", status: 400 };
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to look up distances.", status: 401 };
  const permit = await takeRoutingPermit(user.id);
  if (!permit) return { ok: false, error: "Routing is unavailable. Enter km manually.", status: 503 };
  if (permit.status === "user_limit") {
    return { ok: false, error: "Too many distance lookups. Enter km manually or try again later.", status: 429, code: "user_limit",
      retryAfterMs: permit.retry_after_ms, retryAfterSeconds: Math.ceil(permit.retry_after_ms / 1000) };
  }
  if (permit.status === "busy") return { ok: false, error: "Waiting for the routing service.", status: 429, retryAfterMs: 1300, retryAfterSeconds: 2 };
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false&alternatives=false&steps=false`;
    const response = await fetch(url, { headers: { "User-Agent": "StudentRideShare/1.0 (non-commercial ride offer demo)" }, cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("Routing failed");
    const result = routeSchema.parse(await response.json());
    return { ok: true, distanceKm: Math.round(result.routes[0].distance / 100) / 10, durationMinutes: Math.ceil(result.routes[0].duration / 60) };
  } catch {
    return { ok: false, error: "Road distance is unavailable. Enter km manually.", status: 502 };
  }
}
