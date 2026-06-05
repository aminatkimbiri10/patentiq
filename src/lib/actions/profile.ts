"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { getHomePathForRole } from "@/lib/auth/redirect-by-role";
import { APP_ROLES, type AppRole } from "@/types/roles";
import { STORAGE_BUCKETS } from "@/config/constants";
import { buildAvatarPath } from "@/lib/storage/paths";
import { avatarExtensionFromMime, validateAvatarFile } from "@/lib/validations/avatar";

export type AvatarActionState = { error?: string; success?: boolean };
export type ProfileActionState = { error?: string; success?: boolean };

const roleSelectionSchema = z.object({
  role: z.enum(APP_ROLES),
});

export async function assignPrimaryRole(formData: FormData) {
  const ctx = await requireUser();
  const parsed = roleSelectionSchema.safeParse({ role: formData.get("role") });

  if (!parsed.success) {
    throw new Error("Rôle invalide");
  }

  const supabase = await createClient();

  const { data: roleRow } = await supabase
    .from("roles")
    .select("id")
    .eq("role_name", parsed.data.role)
    .single();

  if (!roleRow) throw new Error("Rôle introuvable");

  const { count } = await supabase
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("user_id", ctx.user.id);

  if ((count ?? 0) > 0) {
    throw new Error("Un rôle est déjà assigné. Contactez un administrateur pour le modifier.");
  }

  const { error: roleError } = await supabase.from("user_roles").insert({
    user_id: ctx.user.id,
    role_id: roleRow.id,
    is_primary: true,
  });

  if (roleError) throw new Error(roleError.message);

  await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", ctx.user.id);

  revalidatePath("/", "layout");
  redirect(getHomePathForRole(parsed.data.role as AppRole, true));
}

export async function updateProfile(
  _prev: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const ctx = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: String(formData.get("full_name") ?? "").trim() || null,
      company: String(formData.get("company") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      bio: String(formData.get("bio") ?? "").trim() || null,
      job_title: String(formData.get("job_title") ?? "").trim() || null,
    })
    .eq("id", ctx.user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/profile");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function uploadAvatar(
  _prev: AvatarActionState,
  formData: FormData
): Promise<AvatarActionState> {
  const ctx = await requireUser();
  const file = formData.get("avatar");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Sélectionnez une image" };
  }

  const check = validateAvatarFile(file);
  if (!check.ok) return { error: check.error };

  const ext = avatarExtensionFromMime(file.type);
  const path = buildAvatarPath(ctx.user.id, ext);
  const supabase = await createClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.avatars)
    .upload(path, buffer, { contentType: file.type, upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_url: path })
    .eq("id", ctx.user.id);

  if (profileError) return { error: profileError.message };

  revalidatePath("/dashboard/profile");
  revalidatePath("/", "layout");
  return { success: true };
}
