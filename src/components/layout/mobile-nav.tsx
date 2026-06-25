"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Menu, X, UserCircle } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import type { AppRole } from "@/types/roles";
import type { NavItem, NavSection } from "@/config/navigation";
import { getGuideHrefForRole, getProfileHrefForRole } from "@/config/navigation";
import { SidebarFooterLink, SidebarNavItem, SidebarSection } from "@/components/layout/sidebar-nav";
import { SIDEBAR_DOC_ICON } from "@/components/layout/nav-icons";
import { Button } from "@/components/ui/button";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { isNavItemActive, navHomeHref } from "@/lib/layout/dashboard-nav";

export function MobileNav({
  items,
  sections,
  role,
}: {
  items: NavItem[];
  sections?: NavSection[];
  role?: AppRole;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  useBodyScrollLock(open);

  useEffect(() => {
    setMounted(true);
  }, []);

  const homeHref = navHomeHref(items, role);
  const guideHref = getGuideHrefForRole(role ?? null);
  const profileHref = getProfileHrefForRole(role ?? null);
  const profileActive = pathname === profileHref || pathname.startsWith(`${profileHref}/`);
  const navSections = sections ?? [{ label: "Menu", items }];
  const docActive = pathname === guideHref || pathname.startsWith(`${guideHref}/`);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0 lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        aria-expanded={open}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-[100] lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              aria-label="Fermer le menu"
              onClick={() => setOpen(false)}
            />
            <aside
              className="enterprise-sidebar absolute left-0 top-0 flex h-full w-[min(100vw,280px)] max-w-[85vw] flex-col safe-top safe-bottom"
              aria-label="Menu navigation"
            >
              <div className="sidebar-header justify-between">
                <BrandLogo
                  href={homeHref}
                  showText={false}
                  prominent
                  placement="sidebar"
                  context="organization"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="sidebar-icon-btn"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav className="enterprise-sidebar-scroll flex-1 overflow-y-auto py-4">
                {navSections.map((section, index) => (
                  <SidebarSection key={section.label} label={section.label} isFirst={index === 0}>
                    {section.items.map((item) => (
                      <SidebarNavItem
                        key={item.href}
                        item={item}
                        active={isNavItemActive(pathname, item.href)}
                        onNavigate={() => setOpen(false)}
                      />
                    ))}
                  </SidebarSection>
                ))}
              </nav>

              <div className="sidebar-footer">
                <SidebarFooterLink
                  href={profileHref}
                  icon={UserCircle}
                  label="Mon profil"
                  active={profileActive}
                  onNavigate={() => setOpen(false)}
                />
                <SidebarFooterLink
                  href={guideHref}
                  icon={SIDEBAR_DOC_ICON}
                  label="Documentation"
                  active={docActive}
                  onNavigate={() => setOpen(false)}
                />
                <SignOutButton variant="sidebar" />
              </div>
            </aside>
          </div>,
          document.body
        )}
    </>
  );
}
