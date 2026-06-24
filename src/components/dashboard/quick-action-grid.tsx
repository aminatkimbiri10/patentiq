"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export type QuickAction = {
  href: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  primary?: boolean;
};

/** Barre d'actions — boutons compacts, pas de cartes marketing */
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
    <div className={cn("enterprise-panel", className)}>
      {title && (
        <div className="enterprise-panel-header">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
      )}
      <div className="flex flex-wrap gap-2 p-3">
        {actions.map((a) => (
          <Button
            key={a.href}
            variant={a.primary ? "default" : "outline"}
            size="sm"
            className="h-9"
            asChild
          >
            <Link href={a.href}>
              <a.icon className="mr-2 h-4 w-4" />
              {a.title}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
