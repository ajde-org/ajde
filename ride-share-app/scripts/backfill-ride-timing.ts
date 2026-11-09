/** Run with: npx tsx scripts/backfill-ride-timing.ts. Uses server credentials. */
import { loadEnvConfig } from '@next/env';
import { createClient } from '@supabase/supabase-js';
loadEnvConfig(process.cwd());
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)!);
const { data: rides, error } = await client.from('rides').select('id,origin_city_id,dest_city_id').is('estimated_duration_minutes', null).gt('departure_at', new Date().toISOString()).in('status', ['published', 'full', 'draft']);
if (error) throw error;
const { data: cities, error: cityError } = await client.from('cities').select('id,lat,lng');
if (cityError) throw cityError;
const pairs = new Map((rides ?? []).map(ride => [`${ride.origin_city_id}:${ride.dest_city_id}`, ride]));
for (const ride of pairs.values()) {
  const a = cities!.find(city => city.id === ride.origin_city_id)!, b = cities!.find(city => city.id === ride.dest_city_id)!;
  const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=false&alternatives=false&steps=false`, { signal: AbortSignal.timeout(8000) });
  const result = await response.json();
  const route = result.routes?.[0];
  if (!response.ok || result.code !== 'Ok' || !Number.isFinite(route?.duration) || route.duration <= 0 || route.duration > 86400 || !Number.isFinite(route.distance) || route.distance <= 0) throw new Error('Invalid routing response');
  const { error: cacheError } = await client.from('route_estimates').upsert({ origin_city_id: a.id, dest_city_id: b.id, origin_lat: a.lat, origin_lng: a.lng, dest_lat: b.lat, dest_lng: b.lng, distance_km: route.distance / 1000, duration_minutes: Math.ceil(route.duration / 60), estimated_at: new Date().toISOString() });
  if (cacheError) throw cacheError;
  const ids = rides!.filter(item => item.origin_city_id === a.id && item.dest_city_id === b.id).map(item => item.id);
  const { error: updateError } = await client.from('rides').update({ duration_minutes: null }).in('id', ids).is('estimated_duration_minutes', null);
  if (updateError) throw updateError;
  await new Promise(resolve => setTimeout(resolve, 1300));
}
console.log(`Updated ${pairs.size} city pairs.`);
