import { beforeEach, expect, it, vi } from "vitest";
// `row` is the caller's profile row (null before onboarding); `written` is the last value saved.
const db = vi.hoisted(() => ({ photo: "https://example.com/existing.png" as string | null, written: null as Record<string, unknown> | null,
  row: null as Record<string, unknown> | null, ops: [] as string[] }));
vi.mock("@/lib/auth/session", () => ({ requireUser: async () => ({ id: "owner" }) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({
  from: () => {
    let pending: Record<string, unknown> | null = null;
    const updated = () => {
      if (!pending) return [];
      db.ops.push("update");
      if (!db.row) return [];
      db.row = { ...db.row, ...pending }; db.written = db.row; return [{ id: db.row.id }];
    };
    const query = { select: () => query, eq: () => query, maybeSingle: async () => ({data: db.photo ? {photo_url:db.photo}:null}),
      update: (value: Record<string, unknown>) => { pending = value; return query; },
      insert: async (value: Record<string, unknown>) => { db.ops.push("insert"); db.row = value; db.written = value; return {error:null}; },
      then: (resolve: (result: unknown) => unknown) => Promise.resolve({ data: updated(), error: null }).then(resolve) };
    return query;
  },
  storage: {from: () => ({getPublicUrl: (path: string) => ({data:{publicUrl:`https://example.com/${path}`}})})},
}) }));
import { saveProfile } from "./actions";
const input = {fullName:"Test Student", university:"UKIM", storagePath:"", bio:"Existing bio", gender:"" as const, phone:"+389 70 123 456", socialUrl:"https://x.com/student"};
beforeEach(() => {db.photo="https://example.com/existing.png";db.written=null;db.row={id:"owner"};db.ops=[];});
it("updates contacts without requiring another photo or changing profile ownership", async () => {
  expect(await saveProfile(input)).toEqual({ok:true});
  expect(db.ops).toEqual(["update"]);
  expect(db.written).toMatchObject({id:"owner",photo_url:db.photo,phone:"+38970123456",social_url:input.socialUrl,bio:input.bio});
});
it("rejects a missing phone before writing", async () => {
  expect((await saveProfile({...input,phone:""})).ok).toBe(false);expect(db.written).toBeNull();
});
it("rejects another account's photo path", async () => {
  expect((await saveProfile({...input,storagePath:"other/photo.jpg"})).ok).toBe(false);expect(db.written).toBeNull();
});
it("requires a photo for a new profile and allows removing the optional social link", async () => {
  db.photo=null;expect((await saveProfile(input)).ok).toBe(false);
  expect((await saveProfile({...input,storagePath:"owner/photo.jpg",socialUrl:""})).ok).toBe(true);
  expect(db.written?.social_url).toBeNull();
});
it("creates the profile on first save without an upsert", async () => {
  db.row=null;
  expect(await saveProfile({...input,storagePath:"owner/photo.jpg"})).toEqual({ok:true});
  expect(db.ops).toEqual(["update","insert"]);
  expect(db.written).toMatchObject({id:"owner",phone:"+38970123456",photo_url:"https://example.com/owner/photo.jpg"});
});
