"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { NAV_ICONS } from "@/components/layout/nav-icons";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { NavItem } from "@/config/navigation";

const ICON_STROKE = 1.75;

function SidebarNavIconSlot({ icon: Icon, active }: { icon: LucideIcon; active?: boolean }) {
  return (
    <span className={cn("sidebar-nav-icon-slot", active && "sidebar-nav-icon-slot-active")} aria-hidden="true">
      <Icon className="sidebar-nav-icon" strokeWidth={ICON_STROKE} absoluteStrokeWidth />
    </span>
  );
}

function SidebarCount({ count }: { count: string }) {
  const numeric = Number.parseInt(count, 10);
  const isAlert = !Number.isNaN(numeric) && numeric > 0;

  return (
    <span className={cn("sidebar-nav-count", isAlert && "sidebar-nav-count-alert")}>{count}</span>
  );
}

export function SidebarNavItem({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = NAV_ICONS[item.icon];

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "sidebar-nav-item group",
        active && "sidebar-nav-item-active",
        collapsed && "sidebar-nav-item-collapsed"
      )}
      aria-current={active ? "page" : undefined}
      title={collapsed ? (item.badge ? `${item.title} (${item.badge})` : item.title) : undefined}
    >
      <SidebarNavIconSlot icon={Icon} active={active} />
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate">{item.title}</span>
          {item.badge && <SidebarCount count={item.badge} />}
        </>
      )}
      {collapsed && item.badge && (
        <span className="sidebar-nav-dot" aria-label={`${item.badge} notification(s)`} />
      )}
    </Link>
  );
}

export function SidebarFooterLink({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
  onNavigate,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "sidebar-nav-item",
        active && "sidebar-nav-item-active",
        collapsed && "sidebar-nav-item-collapsed"
      )}
      title={collapsed ? label : undefined}
    >
      <SidebarNavIconSlot icon={Icon} active={active} />
      {!collapsed && <span className="min-w-0 flex-1 truncate">{label}</span>}
    </Link>
  );
}

export function SidebarSection({
  label,
  collapsed,
  isFirst,
  children,
}: {
  label: string;
  collapsed?: boolean;
  isFirst?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("sidebar-section-block", isFirst && "!pt-0")}>
      {!collapsed && (
        <p className="sidebar-section-label" id={`nav-section-${label.replace(/\s+/g, "-").toLowerCase()}`}>
          {label}
        </p>
      )}
      {collapsed && !isFirst && (
        <div className="sidebar-section-divider-collapsed" aria-hidden="true" />
      )}
      <div className="sidebar-section-items" role="group" aria-labelledby={collapsed ? undefined : `nav-section-${label.replace(/\s+/g, "-").toLowerCase()}`}>
        {children}
      </div>
    </div>
  );
}

export function SidebarUserCard({
  name,
  initials,
  roleLabel,
  avatarUrl,
  profileHref,
  collapsed,
  active = false,
}: {
  name: string;
  initials: string;
  roleLabel: string;
  avatarUrl?: string | null;
  profileHref: string;
  collapsed?: boolean;
  active?: boolean;
}) {
  const avatar = (
    <UserAvatar
      src={avatarUrl}
      alt={name}
      initials={initials}
      className={collapsed ? "h-8 w-8" : "h-9 w-9"}
      fallbackClassName={collapsed ? "text-[10px]" : "text-[11px]"}
    />
  );

  if (collapsed) {
    return (
      <Link
        href={profileHref}
        className={cn("sidebar-user-collapsed", active && "sidebar-user-row-active")}
        title={`${name} — ${roleLabel}`}
        aria-label={`Profil — ${name}`}
        aria-current={active ? "page" : undefined}
      >
        {avatar}
      </Link>
    );
  }

  return (
    <Link
      href={profileHref}
      className={cn("sidebar-user-row group", active && "sidebar-user-row-active")}
      aria-current={active ? "page" : undefined}
    >
      {avatar}
      <div className="min-w-0 flex-1">
        <p className="sidebar-user-name group-hover:text-primary">{name}</p>
        <p className="sidebar-user-role">{roleLabel}</p>
      </div>
    </Link>
  );
}
