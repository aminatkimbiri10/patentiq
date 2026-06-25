"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runMyWatchlistScans } from "@/lib/actions/watchlist";
import { notifyActionResult } from "@/hooks/use-action-toast";
import { SurveillanceStatusLine } from "@/components/surveillance/workspace/surveillance-kpi-row";
import type { SurveillanceStats } from "@/lib/surveillance/dashboard-stats";
import { cn } from "@/lib/utils/cn";

export type SurveillanceFilter = "all" | "open" | "critical";

export function SurveillanceHeaderBar({
  stats,
  filter,
  onFilterChange,
}: {
  stats: SurveillanceStats;
  filter: SurveillanceFilter;
  onFilterChange: (f: SurveillanceFilter) => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const filters: { id: SurveillanceFilter; label: string; count?: number }[] = [
    { id: "all", label: "Tout" },
    { id: "open", label: "À traiter", count: stats.activeAlerts },
    { id: "critical", label: "Critiques", count: stats.criticalAlerts },
  ];

  return (
    <div className="space-y-3">
      <SurveillanceStatusLine stats={stats} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                filter === f.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {f.label}
              {f.count != null && f.count > 0 && (
                <span className="tabular-nums text-xs opacity-90">({f.count})</span>
              )}
            </button>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending || stats.activeWatchCount === 0}
          onClick={() =>
            startTransition(async () => {
              const result = await runMyWatchlistScans();
              notifyActionResult(result);
              if (result.success) router.refresh();
            })
          }
        >
          <RefreshCw className={cn("mr-1.5 h-4 w-4", pending && "animate-spin")} />
          Scanner OMPIC
        </Button>
      </div>
    </div>
  );
}
