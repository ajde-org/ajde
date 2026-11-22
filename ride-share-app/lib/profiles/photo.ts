// Used by server and client components, so this module must not import `server-only`.

/** Uploads live at `<user id>/<uuid>.<ext>` in the profile-photos bucket. */
export const PROFILE_PHOTO_EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;

export function profilePhotoPathPattern(userId: string) {
  const folder = userId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${folder}/[A-Za-z0-9_-]+\\.(jpg|jpeg|png|webp)$`);
}

const PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#e2e8f0"/>' +
      '<circle cx="32" cy="25" r="11" fill="#94a3b8"/><path d="M12 56c2-11 10-17 20-17s18 6 20 17z" fill="#94a3b8"/></svg>',
  );

// Avatars of the seeded demo profiles (see AJDE-23).
const DEMO_AVATAR_PREFIX = "https://api.dicebear.com/";

/**
 * The `src` to render for a profile photo. Users can write `photo_url` themselves, so only our own
 * storage bucket is trusted: any other URL would let a user log the IP address of everyone who sees
 * their photo. Anything else renders a neutral placeholder.
 */
export function profilePhotoSrc(url: string | null | undefined): string {
  if (!url) return PLACEHOLDER;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  if (supabaseUrl && url.startsWith(`${supabaseUrl}/storage/v1/object/public/profile-photos/`)) return url;
  if (url.startsWith(DEMO_AVATAR_PREFIX)) return url;
  return PLACEHOLDER;
}
