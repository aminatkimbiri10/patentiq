"use client";

import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type QuickAction = {
  href: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  primary?: boolean;
};

/** Grille d'actions rapides — tuiles cliquables, style produit commercial */
export function QuickActionGrid({
  title,
  actions,
  className,
}: {
  title?: string;
  actions: readonly QuickAction[];
  className?: string;
}) {
  return (
    <div className={cn("enterprise-panel overflow-hidden", className)}>
      {title && (
        <div className="enterprise-panel-header bg-muted/25">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
      )}
      <div className="grid gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={cn(
              "group flex flex-col gap-3 bg-card p-5 transition-colors duration-200",
              "hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
              a.primary && "bg-primary/[0.03] hover:bg-primary/[0.06]"
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                a.primary
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "bg-primary/10 text-primary group-hover:bg-primary/15"
              )}
            >
              <a.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{a.title}</p>
              {a.description && (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {a.description}
                </p>
              )}
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Accéder
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
