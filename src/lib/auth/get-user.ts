import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/types/database";
import { parseRoleFromJoin } from "@/lib/auth/parse-role";
import type { AppRole } from "@/types/roles";

export type AuthUser = {
  id: string;
  email: string;
};

export type UserContext = {
  user: AuthUser;
  profile: Profile | null;
  roles: UserRole[];
  primaryRole: AppRole | null;
};

export function userHasRole(ctx: UserContext, role: AppRole): boolean {
  return ctx.roles.some((ur) => {
    const name = parseRoleFromJoin(
      ur.roles as { role_name: AppRole } | { role_name: AppRole }[] | undefined
    );
    return name === role;
  });
}

export async function getUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  return { id: user.id, email: user.email };
}

export const getUserContext = cache(async (): Promise<UserContext | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url, onboarding_completed, created_at, updated_at")
      .eq("id", user.id)
      .single(),
    supabase.from("user_roles").select("*, roles(*)").eq("user_id", user.id),
  ]);

  const primary = roles?.find((r) => r.is_primary);
  const primaryRole = parseRoleFromJoin(
    primary?.roles as { role_name: AppRole } | { role_name: AppRole }[] | undefined
  );

  return {
    user: { id: user.id, email: user.email },
    profile: profile as Profile | null,
    roles: (roles ?? []) as UserRole[],
    primaryRole,
  };
});
