import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { profilePhotoPathPattern, profilePhotoSrc } from "./photo";

const bucket = "https://abc.supabase.co/storage/v1/object/public/profile-photos";
beforeEach(() => vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co/"));
afterEach(() => vi.unstubAllEnvs());

it("renders photos from our own profile-photos bucket and the demo avatars", () => {
  expect(profilePhotoSrc(`${bucket}/user/photo.jpg`)).toBe(`${bucket}/user/photo.jpg`);
  expect(profilePhotoSrc("https://api.dicebear.com/9.x/initials/svg?seed=Ana")).toBe("https://api.dicebear.com/9.x/initials/svg?seed=Ana");
});

it.each([
  null, "", "https://evil.com/pixel.png", "https://abc.supabase.co.evil.com/storage/v1/object/public/profile-photos/x.jpg",
  "https://evil.com/?https://abc.supabase.co/storage/v1/object/public/profile-photos/x.jpg",
  "https://abc.supabase.co/storage/v1/object/public/other-bucket/x.jpg", "javascript:alert(1)",
])("renders the placeholder for %j", (url) => {
  expect(profilePhotoSrc(url)).toMatch(/^data:image\/svg\+xml,/);
});

it("accepts only uploads in the user's own folder", () => {
  const pattern = profilePhotoPathPattern("1b4e28ba-2fa1-11d2-883f-0016d3cca427");
  expect(pattern.test("1b4e28ba-2fa1-11d2-883f-0016d3cca427/0f8fad5b-d9cb-469f-a165-70867728950e.jpg")).toBe(true);
  for (const path of [
    "other/photo.jpg", "1b4e28ba-2fa1-11d2-883f-0016d3cca427/../victim/photo.jpg",
    "1b4e28ba-2fa1-11d2-883f-0016d3cca427/photo.svg", "1b4e28ba-2fa1-11d2-883f-0016d3cca427/a/photo.jpg",
  ]) expect(pattern.test(path)).toBe(false);
});
