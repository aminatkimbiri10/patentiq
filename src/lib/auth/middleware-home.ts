import type { SupabaseClient } from "@supabase/supabase-js";
import { getHomePathForRole } from "@/lib/auth/redirect-by-role";
import { parseRoleFromJoin } from "@/lib/auth/parse-role";
import type { AppRole } from "@/types/roles";

export async function getAuthenticatedHomePath(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const { data: roles } = await supabase
    .from("user_roles")
    .select("is_primary, roles(role_name)")
    .eq("user_id", userId);

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", userId)
    .single();

  const primary = roles?.find((r) => r.is_primary);
  const roleName = parseRoleFromJoin(
    primary?.roles as { role_name: AppRole } | { role_name: AppRole }[] | null
  );

  return getHomePathForRole(roleName, profile?.onboarding_completed ?? false);
}
