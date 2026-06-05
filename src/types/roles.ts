export const APP_ROLES = [
  "project_holder",
  "cpi_advisor",
  "expert",
  "admin",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  project_holder: "Porteur de projet",
  cpi_advisor: "Conseiller PI",
  expert: "Expert métier",
  admin: "Administrateur",
};

export const ROLE_HOME_PATHS: Record<AppRole, string> = {
  project_holder: "/dashboard",
  cpi_advisor: "/cpi",
  expert: "/expert",
  admin: "/admin",
};
