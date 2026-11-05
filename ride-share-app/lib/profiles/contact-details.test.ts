import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { CONTACT_BATCH_SIZE, getContactDetails } from "./contact-details";

type Client = Parameters<typeof getContactDetails>[0];
const contact = (id: string) => ({ id, phone: `+389${id}`, instagram: null, facebook: null, social_url: null });

function client(rpc: (ids: string[]) => { data: ReturnType<typeof contact>[] | null; error: { message: string } | null }) {
  const calls: string[][] = [];
  const fake = { rpc: async (_name: string, args: { profile_ids: string[] }) => { calls.push(args.profile_ids); return rpc(args.profile_ids); } };
  return { supabase: fake as unknown as Client, calls };
}

describe("getContactDetails", () => {
  it("skips the database when there is nobody to look up", async () => {
    const { supabase, calls } = client(() => ({ data: [], error: null }));
    const result = await getContactDetails(supabase, []);
    expect(result.error).toBeNull();
    expect(result.data.size).toBe(0);
    expect(calls).toHaveLength(0);
  });

  it("deduplicates ids and splits large lookups into batches", async () => {
    const ids = Array.from({ length: CONTACT_BATCH_SIZE * 2 + 5 }, (_, n) => String(n));
    const { supabase, calls } = client((batch) => ({ data: batch.map(contact), error: null }));
    const result = await getContactDetails(supabase, [...ids, ...ids]);
    expect(calls.map((batch) => batch.length)).toEqual([CONTACT_BATCH_SIZE, CONTACT_BATCH_SIZE, 5]);
    expect(result.data.size).toBe(ids.length);
    expect(result.data.get("204")?.phone).toBe("+389204");
  });

  it("reports a failed batch instead of returning partial contacts", async () => {
    const ids = Array.from({ length: CONTACT_BATCH_SIZE + 1 }, (_, n) => String(n));
    const { supabase } = client((batch) => batch.length === 1
      ? { data: null, error: { message: "boom" } }
      : { data: batch.map(contact), error: null });
    const result = await getContactDetails(supabase, ids);
    expect(result.error).toEqual({ message: "boom" });
    expect(result.data.size).toBe(0);
  });
});
