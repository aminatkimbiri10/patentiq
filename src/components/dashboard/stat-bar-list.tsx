import { cn } from "@/lib/utils/cn";

export type StatBar = { key: string; label: string; value: number };

/** Graphique à barres horizontales sans dépendance — répartitions de portefeuille. */
export function StatBarList({
  items,
  emptyLabel = "Aucune donnée",
  barClassName = "bg-primary",
}: {
  items: StatBar[];
  emptyLabel?: string;
  barClassName?: string;
}) {
  if (items.length === 0) {
    return <p className="px-1 py-4 text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const pct = Math.round((item.value / max) * 100);
        return (
          <li key={item.key} className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="min-w-0 truncate text-muted-foreground">{item.label}</span>
              <span className="shrink-0 font-medium tabular-nums">{item.value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", barClassName)}
                style={{ width: `${Math.max(pct, 4)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
