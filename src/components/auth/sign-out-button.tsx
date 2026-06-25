"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils/cn";

const ICON_STROKE = 1.5;

export function SignOutButton({
  className,
  variant = "menu",
}: {
  className?: string;
  variant?: "menu" | "sidebar" | "sidebar-collapsed";
}) {
  const label = "Déconnexion";

  if (variant === "sidebar" || variant === "sidebar-collapsed") {
    const collapsed = variant === "sidebar-collapsed";
    return (
      <form action={signOut} className={cn("w-full", className)}>
        <button
          type="submit"
          className={cn(
            "sidebar-nav-item w-full cursor-pointer border-0 bg-transparent font-inherit text-inherit",
            collapsed && "sidebar-nav-item-collapsed"
          )}
          title={collapsed ? label : undefined}
          aria-label={collapsed ? label : undefined}
        >
          <span className="sidebar-nav-icon-slot" aria-hidden="true">
            <LogOut
              className="sidebar-nav-icon"
              strokeWidth={ICON_STROKE}
              absoluteStrokeWidth
            />
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1 truncate text-left">{label}</span>
          )}
        </button>
      </form>
    );
  }

  return (
    <form action={signOut} className={cn("w-full", className)}>
      <button
        type="submit"
        className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus:bg-accent text-destructive focus:text-destructive"
      >
        {label}
      </button>
    </form>
  );
}
