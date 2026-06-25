"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowLeftToLine, ArrowRightFromLine } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { BrandLogo } from "@/components/shared/brand-logo";
import { SIDEBAR_DOC_ICON } from "@/components/layout/nav-icons";
import { ROLE_LABELS, type AppRole } from "@/types/roles";
import type { NavSection } from "@/config/navigation";
import { getGuideHrefForRole, getProfileHrefForRole } from "@/config/navigation";
import {
  SidebarFooterLink,
  SidebarNavItem,
  SidebarSection,
  SidebarUserCard,
} from "@/components/layout/sidebar-nav";
import { useUiStore } from "@/stores/ui-store";
import { isNavItemActive, navHomeHref } from "@/lib/layout/dashboard-nav";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { useSidebarShortcut } from "@/hooks/use-sidebar-shortcut";

function enrichSectionsWithBadges(
  sections: NavSection[],
  unreadNotifications: number
): NavSection[] {
  if (unreadNotifications <= 0) return sections;

  const badge = unreadNotifications > 99 ? "99+" : String(unreadNotifications);

  return sections.map((section) => ({
    ...section,
    items: section.items.map((item) =>
      item.href.endsWith("/notifications") ? { ...item, badge } : item
    ),
  }));
}

export function DashboardSidebar({
  sections,
  role,
  userName,
  userInitials,
  avatarUrl,
  unreadNotifications = 0,
}: {
  sections: NavSection[];
  role?: AppRole;
  userName?: string;
  userInitials?: string;
  avatarUrl?: string | null;
  unreadNotifications?: number;
}) {
  const pathname = usePathname();
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const [mounted, setMounted] = useState(false);

  useSidebarShortcut();

  useEffect(() => {
    useUiStore.persist.rehydrate();
    setMounted(true);
  }, []);

  const collapsed = mounted && sidebarCollapsed;
  const navSections = useMemo(
    () => enrichSectionsWithBadges(sections, unreadNotifications),
    [sections, unreadNotifications]
  );
  const flatItems = navSections.flatMap((s) => s.items);
  const homeHref = navHomeHref(flatItems, role);
  const guideHref = getGuideHrefForRole(role ?? null);
  const profileHref = getProfileHrefForRole(role ?? null);
  const roleLabel = role ? ROLE_LABELS[role] : "";
  const docActive = pathname === guideHref || pathname.startsWith(`${guideHref}/`);
  const profileActive =
    pathname === profileHref ||
    pathname.startsWith(`${profileHref}/`) ||
    pathname === "/dashboard/security";

  return (
    <aside
      className={cn(
        "enterprise-sidebar relative hidden h-full max-h-[100dvh] shrink-0 overflow-hidden transition-[width] duration-200 ease-out lg:flex lg:flex-col",
        collapsed ? "enterprise-sidebar--collapsed w-16" : "w-[260px]"
      )}
      aria-label="Navigation principale"
      data-collapsed={collapsed ? "true" : "false"}
    >
      <div className={cn("sidebar-header", collapsed && "sidebar-header-collapsed")}>
        {collapsed ? (
          <>
            <BrandLogo
              href={homeHref}
              showText={false}
              rail
              size="sm"
              variant="sidebar"
              context="organization"
              className="w-full"
            />
            <button
              type="button"
              onClick={toggleSidebar}
              className="sidebar-icon-btn mx-auto"
              aria-label="Développer le menu"
              title="Ctrl+B"
            >
              <ArrowRightFromLine className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </>
        ) : (
          <>
            <div className="sidebar-header-row">
              <BrandLogo
                href={homeHref}
                showText={false}
                prominent
                size="sm"
                placement="sidebar"
                context="organization"
                className="min-w-0 flex-1"
              />
              <button
                type="button"
                onClick={toggleSidebar}
                className="sidebar-icon-btn shrink-0"
                aria-label="Réduire le menu"
                title="Ctrl+B"
              >
                <ArrowLeftToLine className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            {roleLabel && <span className="sidebar-role-badge">{roleLabel}</span>}
          </>
        )}
      </div>

      <nav className="enterprise-sidebar-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain py-3">
        {navSections.map((section, index) => (
          <SidebarSection
            key={section.label}
            label={section.label}
            collapsed={collapsed}
            isFirst={index === 0}
          >
            {section.items.map((item) => (
              <SidebarNavItem
                key={item.href}
                item={item}
                active={isNavItemActive(pathname, item.href)}
                collapsed={collapsed}
              />
            ))}
          </SidebarSection>
        ))}
      </nav>

      <div className="sidebar-footer">
        {userName && userInitials && roleLabel && (
          <SidebarUserCard
            name={userName}
            initials={userInitials}
            roleLabel={roleLabel}
            avatarUrl={avatarUrl}
            profileHref={profileHref}
            collapsed={collapsed}
            active={profileActive}
          />
        )}

        <SidebarFooterLink
          href={guideHref}
          icon={SIDEBAR_DOC_ICON}
          label="Documentation"
          active={docActive}
          collapsed={collapsed}
        />

        <SignOutButton variant={collapsed ? "sidebar-collapsed" : "sidebar"} />
      </div>
    </aside>
  );
}
