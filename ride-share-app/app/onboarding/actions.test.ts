vi.mock('server-only', () => ({}));
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({ photo: "https://example.com/existing.png" as string | null, details: {prompts: []} as unknown, written: null as Record<string, unknown> | null }));
vi.mock("@/lib/auth/session", () => ({ requireUser: async () => ({ id: "owner" }) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({
  from: () => {
    const query = { select: () => query, eq: () => query, maybeSingle: async () => ({data: db.photo ? {photo_url:db.photo,driver_details:db.details}:null}),
      upsert: async (value: Record<string, unknown>) => { db.written=value;return {error:null}; } };
    return query;
  },
  storage: {from: () => ({getPublicUrl: (path: string) => ({data:{publicUrl:`https://example.com/${path}`}})})},
}) }));
import { saveProfile } from "./actions";
const input = {fullName:"Test Student", university:"UKIM", storagePath:"", bio:"Existing bio", gender:"" as const, phone:"+389 70 123 456", socialUrl:"https://x.com/student"};
afterEach(() => vi.unstubAllEnvs());
beforeEach(() => {vi.stubEnv('PROFILE_PROMPTS_ENABLED','true');db.details={prompts:[]};db.photo="https://example.com/existing.png";db.written=null;});
it("updates contacts without requiring another photo or changing profile ownership", async () => {
  expect(await saveProfile(input)).toEqual({ok:true});
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
it("saves optional descriptors and trimmed driving answers with the profile", async () => {
  expect(await saveProfile({...input, personality: {music:'shared', prompts:[{id:'snack',answer:'  Coffee and good company  '}]}})).toEqual({ok:true});
  expect(db.written?.driver_details).toEqual({music:'shared',prompts:[{id:'snack',answer:'Coffee and good company'}]});
});
it("does not overwrite personality when older callers omit it", async () => {
  await saveProfile(input);
  expect(db.written).not.toHaveProperty('driver_details');
});
it("rejects duplicate prompts without writing", async () => {
  expect((await saveProfile({...input,personality:{prompts:[{id:'snack',answer:'one'},{id:'snack',answer:'two'}]}})).ok).toBe(false);
  expect(db.written).toBeNull();
});
it("can remove all descriptors and prompts", async () => {
  expect((await saveProfile({...input,personality:{prompts:[]}})).ok).toBe(true);
  expect(db.written?.driver_details).toEqual({prompts:[]});
});

it("preserves saved prompts while the flag is off even if the client submits different answers", async () => {
  vi.stubEnv('PROFILE_PROMPTS_ENABLED','false');
  db.details={prompts:[{id:'snack',answer:'Original answer'}]};
  expect((await saveProfile({...input,personality:{music:'shared',prompts:[{id:'snack',answer:'Forged answer'}]}})).ok).toBe(true);
  expect(db.written?.driver_details).toEqual({music:'shared',prompts:[{id:'snack',answer:'Original answer'}]});
});
it("preserves saved prompts when the hidden editor submits an empty prompt list", async () => {
  vi.stubEnv('PROFILE_PROMPTS_ENABLED','false');
  db.details={prompts:[{id:'snack',answer:'Original answer'}]};
  await saveProfile({...input,personality:{prompts:[]}});
  expect(db.written?.driver_details).toEqual(db.details);
});
