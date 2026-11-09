import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { roadDistanceKm, type RoadDistanceClient } from "./road-distance";

/** Cache reads/writes are server-owned; browser input never supplies the baseline. */
export async function cachedRouteEstimate(client: RoadDistanceClient, originId: number, destinationId: number) {
  const { data: cities, error } = await client.from("cities").select("id, lat, lng");
  const origin = cities?.find(city => city.id === originId), destination = cities?.find(city => city.id === destinationId);
  if (error || !origin || !destination) return { ok: false as const, error: "Cities are unavailable. Enter km manually.", status: 503 as const };
  try {
    const admin = createAdminClient();
    const { data: cached } = await admin.from("route_estimates").select("*")
      .eq("origin_city_id", originId).eq("dest_city_id", destinationId).maybeSingle();
    if (cached && cached.origin_lat === origin.lat && cached.origin_lng === origin.lng && cached.dest_lat === destination.lat && cached.dest_lng === destination.lng
      && Date.parse(cached.estimated_at) > Date.now() - 30 * 86400_000) {
      return { ok: true as const, distanceKm: cached.distance_km, durationMinutes: cached.duration_minutes };
    }
    const result = await roadDistanceKm(client, originId, destinationId);
    if (!result.ok) return result;
    const { error: saveError } = await admin.from("route_estimates").upsert({
      origin_city_id: originId, dest_city_id: destinationId,
      origin_lat: origin.lat, origin_lng: origin.lng, dest_lat: destination.lat, dest_lng: destination.lng,
      distance_km: result.distanceKm, duration_minutes: result.durationMinutes, estimated_at: new Date().toISOString(),
    });
    if (saveError) return { ok: false as const, error: "Route estimate could not be saved. Retry or publish without an arrival estimate.", status: 503 as const };
    return result;
  } catch {
    return { ok: false as const, error: "Routing is unavailable. Enter km manually.", status: 503 as const };
  }
}
