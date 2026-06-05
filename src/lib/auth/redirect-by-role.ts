import { ROLE_HOME_PATHS, type AppRole } from "@/types/roles";
import { ONBOARDING_PATH } from "@/lib/auth/constants";

export function getHomePathForRole(role: AppRole | null, onboardingCompleted: boolean): string {
  if (!role || !onboardingCompleted) return ONBOARDING_PATH;
  return ROLE_HOME_PATHS[role] ?? "/dashboard";
}
