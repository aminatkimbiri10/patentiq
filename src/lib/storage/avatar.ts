import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKETS } from "@/config/constants";

/** Chemin stocké en base : {userId}/avatar.{ext} */
export function normalizeAvatarPath(avatarPath: string | null | undefined): string | null {
  if (!avatarPath?.trim()) return null;
  const p = avatarPath.trim();
  if (p.startsWith(`${STORAGE_BUCKETS.avatars}/`)) {
    return p.slice(STORAGE_BUCKETS.avatars.length + 1);
  }
  return p;
}

export async function getAvatarSignedUrl(
  avatarPath: string | null | undefined,
  expiresIn = 3600
): Promise<string | null> {
  const path = normalizeAvatarPath(avatarPath);
  if (!path) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.avatars)
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    console.error("[avatar] signed URL failed:", error?.message ?? "unknown");
    return null;
  }
  return data.signedUrl;
}
