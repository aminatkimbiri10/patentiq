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
        <div className="enterprise-panel-header">
          <div className="flex min-w-0 items-start gap-2">
            {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
            <div>
              {title && <h3 className="text-sm font-semibold">{title}</h3>}
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
