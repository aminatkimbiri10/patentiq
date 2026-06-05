export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export const AVATAR_MIME = ["image/png", "image/jpeg", "image/webp"] as const;

export function validateAvatarFile(file: File): { ok: true } | { ok: false; error: string } {
  if (!AVATAR_MIME.includes(file.type as (typeof AVATAR_MIME)[number])) {
    return { ok: false, error: "Format accepté : PNG, JPG ou WebP" };
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return { ok: false, error: "Image trop volumineuse (max 5 Mo)" };
  }
  return { ok: true };
}

export function avatarExtensionFromMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}
