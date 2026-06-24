"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { NAV_ICONS } from "@/components/layout/nav-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { NavItem } from "@/config/navigation";

const ICON_STROKE = 1.5;

function SidebarNavIconSlot({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="sidebar-nav-icon-slot" aria-hidden="true">
      <Icon className="sidebar-nav-icon" strokeWidth={ICON_STROKE} absoluteStrokeWidth />
    </span>
  );
}

function SidebarCount({ count }: { count: string }) {
  return <span className="sidebar-nav-count">{count}</span>;
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
        "sidebar-nav-item",
        active && "sidebar-nav-item-active",
        collapsed && "sidebar-nav-item-collapsed"
      )}
      aria-current={active ? "page" : undefined}
    >
      <SidebarNavIconSlot icon={Icon} />
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate">{item.title}</span>
          {item.badge && <SidebarCount count={item.badge} />}
        </>
      )}
      {collapsed && item.badge && <span className="sidebar-nav-dot" />}
      {collapsed && (
        <span className="sidebar-tooltip" role="tooltip">
          {item.title}
          {item.badge ? ` · ${item.badge}` : ""}
        </span>
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
    >
      <SidebarNavIconSlot icon={Icon} />
      {!collapsed && <span className="min-w-0 flex-1 truncate">{label}</span>}
      {collapsed && (
        <span className="sidebar-tooltip" role="tooltip">
          {label}
        </span>
      )}
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
      {!collapsed && <p className="sidebar-section-label">{label}</p>}
      {collapsed && !isFirst && (
        <div className="sidebar-section-divider-collapsed" aria-hidden="true" />
      )}
      <div className="sidebar-section-items">{children}</div>
    </div>
  );
}

export function SidebarUserCard({
  name,
  initials,
  roleLabel,
  avatarUrl,
  collapsed,
}: {
  name: string;
  initials: string;
  roleLabel: string;
  avatarUrl?: string | null;
  collapsed?: boolean;
}) {
  const avatar = (
    <Avatar className="h-9 w-9 shrink-0">
      {avatarUrl ? (
        <AvatarImage src={avatarUrl} alt={name} className="object-cover" />
      ) : null}
      <AvatarFallback className="bg-muted text-[11px] font-medium text-muted-foreground">
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  if (collapsed) {
    return (
      <div className="sidebar-user-collapsed" title={`${name} — ${roleLabel}`}>
        {avatar}
      </div>
    );
  }

  return (
    <div className="sidebar-user-row">
      {avatar}
      <div className="min-w-0 flex-1">
        <p className="sidebar-user-name">{name}</p>
        <p className="sidebar-user-role">{roleLabel}</p>
      </div>
    </div>
  );
}
