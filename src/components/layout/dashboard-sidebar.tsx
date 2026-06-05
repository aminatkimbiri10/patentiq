"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { BrandLogo } from "@/components/shared/brand-logo";
import { ROLE_LABELS, type AppRole } from "@/types/roles";
import type { NavItem } from "@/config/navigation";
import { NAV_ICONS } from "@/components/layout/nav-icons";
import { useUiStore } from "@/stores/ui-store";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeft } from "lucide-react";

export function DashboardSidebar({
  items,
  role,
}: {
  items: NavItem[];
  role?: AppRole;
}) {
  const pathname = usePathname();
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useUiStore.persist.rehydrate();
    setMounted(true);
  }, []);
  const collapsed = mounted && sidebarCollapsed;

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-border/60 bg-sidebar transition-[width] duration-300 lg:flex lg:flex-col",
        collapsed ? "w-[76px]" : "w-[260px]"
      )}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 px-4">
        {!collapsed ? (
          <BrandLogo href="/dashboard" size="sm" />
        ) : (
          <BrandLogo href="/dashboard" showText={false} size="sm" />
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="shrink-0">
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      {!collapsed && role && (
        <div className="mx-3 mt-4 rounded-xl bg-accent/80 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Espace
          </p>
          <p className="truncate text-sm font-medium">{ROLE_LABELS[role]}</p>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "/admin" &&
              item.href !== "/cpi" &&
              item.href !== "/expert" &&
              pathname.startsWith(`${item.href}/`)) ||
            (["/dashboard", "/admin", "/cpi", "/expert"].includes(item.href) &&
              pathname === item.href);
          const Icon = NAV_ICONS[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "nav-item-active"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                collapsed && "justify-center px-2.5"
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.title}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
