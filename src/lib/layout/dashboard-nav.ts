import type { NavItem } from "@/config/navigation";
import type { AppRole } from "@/types/roles";

export function navHomeHref(items: NavItem[], role?: AppRole | null): string {
  if (role === "cpi_advisor" || items.some((i) => i.href === "/cpi")) return "/cpi";
  if (role === "expert" || items.some((i) => i.href.startsWith("/expert"))) return "/expert";
  if (role === "admin" || items.some((i) => i.href === "/admin")) return "/admin";
  return "/dashboard";
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (["/dashboard", "/admin", "/cpi", "/expert"].includes(href)) {
    return pathname === href;
  }
  return pathname.startsWith(`${href}/`);
}
