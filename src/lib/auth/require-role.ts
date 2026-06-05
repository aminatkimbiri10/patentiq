import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { parseRoleFromJoin } from "@/lib/auth/parse-role";
import { ROLE_HOME_PATHS, type AppRole } from "@/types/roles";

export async function requireRole(allowed: AppRole | AppRole[]) {
  const ctx = await requireUser();
  const allowedList = Array.isArray(allowed) ? allowed : [allowed];

  const userRoles = ctx.roles
    .map((ur) =>
      parseRoleFromJoin(
        ur.roles as { role_name: AppRole } | { role_name: AppRole }[] | undefined
      )
    )
    .filter((r): r is AppRole => r != null);

  const hasRole = allowedList.some((r) => userRoles.includes(r));

  if (!hasRole) {
    const home = ctx.primaryRole ? ROLE_HOME_PATHS[ctx.primaryRole] : "/onboarding/role";
    redirect(home);
  }

  return ctx;
}
