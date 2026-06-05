import { ROLE_HOME_PATHS, type AppRole } from "@/types/roles";

export { ROLE_HOME_PATHS };
export type { AppRole };

export const ONBOARDING_PATH = "/onboarding/role";

export const PROTECTED_PREFIXES = [
  "/dashboard",
  "/admin",
  "/cpi",
  "/expert",
  "/onboarding",
];
