import { createAdminClient } from "@/lib/supabase/admin";

type AuthUserLike = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

/**
 * Garantit une ligne profiles (fallback si le trigger SQL n'est pas déployé).
 * Utilise le service role — serveur uniquement.
 */
export async function ensureProfile(user: AuthUserLike) {
  const admin = createAdminClient();
  const email = user.email ?? "";
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;

  const { error } = await admin.from("profiles").upsert(
    {
      id: user.id,
      email,
      full_name: fullName,
      avatar_url: (user.user_metadata?.avatar_url as string) ?? null,
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error("[ensureProfile]", error.message);
    throw new Error("Impossible de créer le profil utilisateur");
  }
}
