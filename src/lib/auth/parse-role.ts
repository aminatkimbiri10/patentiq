import type { AppRole } from "@/types/roles";

export function parseRoleFromJoin(
  roles: { role_name: AppRole } | { role_name: AppRole }[] | null | undefined
): AppRole | null {
  if (!roles) return null;
  if (Array.isArray(roles)) return roles[0]?.role_name ?? null;
  return roles.role_name ?? null;
}
