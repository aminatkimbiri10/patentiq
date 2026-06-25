import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function DashboardPanel({
  title,
  description,
  icon: Icon,
  children,
  className,
  headerAction,
}: {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}) {
  const hasHeader = title || description || headerAction;

  return (
    <div className={cn("enterprise-panel overflow-hidden", className)}>
      {hasHeader && (
        <div className="enterprise-panel-header bg-muted/25">
          <div className="flex min-w-0 items-start gap-2.5">
            {Icon && (
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
            )}
            <div>
              {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
              {description && (
                <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {headerAction}
        </div>
      )}
      {children}
    </div>
  );
}
