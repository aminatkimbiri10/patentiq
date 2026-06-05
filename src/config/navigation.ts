import type { AppRole } from "@/types/roles";

/** Clés sérialisables — les icônes Lucide sont résolues côté client uniquement */
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
  | "microscope";

export type NavItem = {
  title: string;
  href: string;
  icon: NavIconName;
  badge?: string;
};

export const dashboardNav: NavItem[] = [
  { title: "Tableau de bord", href: "/dashboard", icon: "layout-dashboard" },
  { title: "Projets", href: "/dashboard/projects", icon: "folder-kanban" },
  { title: "Recherches IA", href: "/dashboard/search", icon: "search" },
  { title: "Documents", href: "/dashboard/documents", icon: "file-text" },
  { title: "Messages", href: "/dashboard/messages", icon: "message-square" },
  { title: "Tâches", href: "/dashboard/tasks", icon: "list-checks" },
  { title: "Notifications", href: "/dashboard/notifications", icon: "bell" },
];

export const adminNav: NavItem[] = [
  { title: "Vue d'ensemble", href: "/admin", icon: "shield" },
  { title: "Utilisateurs", href: "/admin/users", icon: "users" },
  { title: "Projets", href: "/admin/projects", icon: "folder-kanban" },
  { title: "Paramètres", href: "/admin/settings", icon: "settings" },
  { title: "Audit", href: "/admin/audit-logs", icon: "clipboard-list" },
];

export const cpiNav: NavItem[] = [
  { title: "Tableau de bord", href: "/cpi", icon: "layout-dashboard" },
  { title: "Dossiers", href: "/cpi/cases", icon: "briefcase" },
  { title: "Notifications", href: "/dashboard/notifications", icon: "bell" },
  { title: "Revue", href: "/cpi/review", icon: "file-text" },
  { title: "Rapports", href: "/cpi/reports", icon: "bar-chart-3" },
];

export const expertNav: NavItem[] = [
  { title: "Tableau de bord", href: "/expert", icon: "layout-dashboard" },
  { title: "Projets assignés", href: "/expert/assigned-projects", icon: "folder-kanban" },
  { title: "Analyses", href: "/expert/analysis", icon: "microscope" },
  { title: "Recommandations", href: "/expert/recommendations", icon: "clipboard-list" },
];

export function getNavForRole(role: AppRole | null): NavItem[] {
  switch (role) {
    case "admin":
      return adminNav;
    case "cpi_advisor":
      return cpiNav;
    case "expert":
      return expertNav;
    default:
      return dashboardNav;
  }
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
