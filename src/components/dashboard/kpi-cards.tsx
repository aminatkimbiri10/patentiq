import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Bandeau KPI — 4 colonnes par défaut, extensible à 6 */
export function KpiCards({
  items,
  columns = 4,
}: {
  items: { title: string; value: string | number; icon?: LucideIcon; hint?: string }[];
  columns?: 4 | 6;
}) {
  return (
    <div
      className={cn(
        "enterprise-kpi",
        columns === 6 ? "lg:grid-cols-3 xl:grid-cols-6" : "sm:grid-cols-2 lg:grid-cols-4"
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.title} className="enterprise-kpi-item group">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground break-words">
                {item.title}
              </p>
              {Icon && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Icon className="h-4 w-4" />
                </span>
              )}
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {item.value}
            </p>
            {item.hint && (
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{item.hint}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
