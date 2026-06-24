"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowLeftToLine, ArrowRightFromLine } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { BrandLogo } from "@/components/shared/brand-logo";
import { SIDEBAR_DOC_ICON } from "@/components/layout/nav-icons";
import { ROLE_LABELS, type AppRole } from "@/types/roles";
import type { NavSection } from "@/config/navigation";
import { getGuideHrefForRole } from "@/config/navigation";
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

export function DashboardSidebar({
  sections,
  role,
  userName,
  userInitials,
  avatarUrl,
}: {
  sections: NavSection[];
  role?: AppRole;
  userName?: string;
  userInitials?: string;
  avatarUrl?: string | null;
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
  const flatItems = sections.flatMap((s) => s.items);
  const homeHref = navHomeHref(flatItems, role);
  const guideHref = getGuideHrefForRole(role ?? null);
  const roleLabel = role ? ROLE_LABELS[role] : "";
  const docActive = pathname === guideHref || pathname.startsWith(`${guideHref}/`);

  return (
    <aside
      className={cn(
        "enterprise-sidebar relative hidden h-full max-h-[100dvh] shrink-0 overflow-hidden transition-[width] duration-200 ease-out lg:flex lg:flex-col",
        collapsed ? "w-[68px]" : "w-[272px]"
      )}
      aria-label="Navigation principale"
    >
      <div
        className={cn(
          "sidebar-header",
          collapsed ? "sidebar-header-collapsed px-2" : "px-4"
        )}
      >
        <BrandLogo
          href={homeHref}
          showText={!collapsed}
          size="lg"
          variant="flat"
          context="organization"
          className={cn("w-full", collapsed ? "justify-center" : "items-start")}
        />
      </div>

      <nav className="enterprise-sidebar-scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain py-4">
        {sections.map((section, index) => (
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
            collapsed={collapsed}
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

        <button
          type="button"
          onClick={toggleSidebar}
          className="sidebar-rail-toggle"
          aria-label={collapsed ? "Développer le menu" : "Réduire le menu"}
          title="Ctrl+B"
        >
          {collapsed ? (
            <ArrowRightFromLine className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <ArrowLeftToLine className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>
      </div>
    </aside>
  );
}
