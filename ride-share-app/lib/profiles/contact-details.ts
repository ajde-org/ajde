import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../supabase/database.types";

export type ContactDetails = Database["public"]["Functions"]["profile_contacts"]["Returns"][number];

/** profile_contacts() rejects more than 200 ids per call; stay well below it. */
export const CONTACT_BATCH_SIZE = 100;

/**
 * Contact details (phone and social links) the signed-in user may see: their own, and those of
 * people they share a ride with. The database decides visibility, so profiles the viewer may not
 * contact are simply missing from the map. Never select these columns from `profiles` directly.
 * Callers must handle `error`: on failure the map is empty, which is not the same as "no contacts".
 */
export async function getContactDetails(supabase: SupabaseClient<Database>, profileIds: readonly string[]) {
  const ids = [...new Set(profileIds)];
  const data = new Map<string, ContactDetails>();
  const batches = Array.from({ length: Math.ceil(ids.length / CONTACT_BATCH_SIZE) },
    (_, index) => ids.slice(index * CONTACT_BATCH_SIZE, (index + 1) * CONTACT_BATCH_SIZE));
  const results = await Promise.all(batches.map((batch) => supabase.rpc("profile_contacts", { profile_ids: batch })));
  for (const result of results) {
    if (result.error) return { data: new Map<string, ContactDetails>(), error: result.error };
    for (const contact of result.data ?? []) data.set(contact.id, contact);
  }
  return { data, error: null };
}
