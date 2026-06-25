import type { AppRole } from "@/types/roles";

export type NavIconName =
  | "layout-dashboard"
  | "folder-kanban"
  | "search"
  | "file-text"
  | "message-square"
  | "list-checks"
  | "bell"
  | "shield"
  | "users"
  | "settings"
  | "clipboard-list"
  | "briefcase"
  | "bar-chart-3"
  | "microscope"
  | "eye";

export type NavItem = {
  title: string;
  href: string;
  icon: NavIconName;
  badge?: string;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

const HOLDER_SECTIONS: NavSection[] = [
  {
    label: "Principal",
    items: [
      { title: "Accueil", href: "/dashboard", icon: "layout-dashboard" },
      { title: "Mes projets", href: "/dashboard/projects", icon: "folder-kanban" },
      { title: "Tâches", href: "/dashboard/tasks", icon: "list-checks" },
      { title: "Documents", href: "/dashboard/documents", icon: "file-text" },
    ],
  },
  {
    label: "Propriété intellectuelle",
    items: [
      { title: "Recherche & IA", href: "/dashboard/search", icon: "search" },
      { title: "Surveillance", href: "/dashboard/surveillance", icon: "eye" },
      { title: "Préparer dépôt OMPIC", href: "/dashboard/preparer-depot-ompic", icon: "file-text" },
    ],
  },
  {
    label: "Communication",
    items: [
      { title: "Messages", href: "/dashboard/messages", icon: "message-square" },
      { title: "Notifications", href: "/dashboard/notifications", icon: "bell" },
    ],
  },
];

const CPI_SECTIONS: NavSection[] = [
  {
    label: "Principal",
    items: [
      { title: "Accueil", href: "/cpi", icon: "layout-dashboard" },
      { title: "Dossiers", href: "/cpi/cases", icon: "briefcase" },
    ],
  },
  {
    label: "Propriété intellectuelle",
    items: [
      { title: "Surveillance", href: "/cpi/surveillance", icon: "eye" },
      { title: "Préparer dépôt OMPIC", href: "/cpi/preparer-depot-ompic", icon: "file-text" },
      { title: "Kanban", href: "/cpi/kanban", icon: "folder-kanban" },
    ],
  },
  {
    label: "Outils",
    items: [{ title: "Tableau de bord", href: "/cpi/reports", icon: "bar-chart-3" }],
  },
];

const ADMIN_SECTIONS: NavSection[] = [
  {
    label: "Administration",
    items: [
      { title: "Vue d'ensemble", href: "/admin", icon: "shield" },
      { title: "Utilisateurs", href: "/admin/users", icon: "users" },
      { title: "Projets", href: "/admin/projects", icon: "folder-kanban" },
      { title: "Paramètres", href: "/admin/settings", icon: "settings" },
      { title: "Audit", href: "/admin/audit-logs", icon: "clipboard-list" },
    ],
  },
];

const EXPERT_SECTIONS: NavSection[] = [
  {
    label: "Expert",
    items: [
      { title: "Accueil", href: "/expert", icon: "layout-dashboard" },
      { title: "Projets assignés", href: "/expert/assigned-projects", icon: "folder-kanban" },
      { title: "Analyses", href: "/expert/analysis", icon: "microscope" },
      { title: "Recommandations", href: "/expert/recommendations", icon: "clipboard-list" },
    ],
  },
];

export function flattenNavSections(sections: NavSection[]): NavItem[] {
  return sections.flatMap((s) => s.items);
}

export function getNavSectionsForRole(role: AppRole | null): NavSection[] {
  switch (role) {
    case "admin":
      return ADMIN_SECTIONS;
    case "cpi_advisor":
      return CPI_SECTIONS;
    case "expert":
      return EXPERT_SECTIONS;
    default:
      return HOLDER_SECTIONS;
  }
}

/** Liste plate — compatibilité (topbar mobile, tests) */
export function getNavForRole(role: AppRole | null): NavItem[] {
  return flattenNavSections(getNavSectionsForRole(role));
}

export function getGuideHrefForRole(role: AppRole | null): string {
  if (role === "cpi_advisor") return "/cpi/guide";
  if (role === "expert") return "/expert/guide";
  if (role === "admin") return "/admin/guide";
  return "/dashboard/guide";
}

/** Profil utilisateur — commun à tous les rôles authentifiés */
export function getProfileHrefForRole(_role: AppRole | null): string {
  return "/dashboard/profile";
}

export const publicNav = [
  { title: "Tarifs", href: "/pricing" },
  { title: "À propos", href: "/about" },
  { title: "Contact", href: "/contact" },
];

export const AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/check-email",
];
export const PUBLIC_ROUTES = ["/", "/pricing", "/about", "/contact", ...AUTH_ROUTES];

/** @deprecated Utiliser getNavSectionsForRole — conservé pour imports existants */
export const dashboardNav = flattenNavSections(HOLDER_SECTIONS);
export const cpiNav = flattenNavSections(CPI_SECTIONS);
export const adminNav = flattenNavSections(ADMIN_SECTIONS);
export const expertNav = flattenNavSections(EXPERT_SECTIONS);
