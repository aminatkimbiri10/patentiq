import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const accents = [
  "from-blue-500/15 to-blue-600/5 text-blue-600 dark:text-blue-400",
  "from-violet-500/15 to-violet-600/5 text-violet-600 dark:text-violet-400",
  "from-emerald-500/15 to-emerald-600/5 text-emerald-600 dark:text-emerald-400",
  "from-amber-500/15 to-amber-600/5 text-amber-600 dark:text-amber-400",
];

export function KpiCards({
  items,
}: {
  items: { title: string; value: string | number; icon: LucideIcon; hint?: string }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <div key={item.title} className="card-elevated group overflow-hidden p-0">
            <div className="flex items-start gap-4 p-5">
              <div
                className={cn(
                  "rounded-xl bg-gradient-to-br p-3",
                  accents[i % accents.length]
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                <p className="mt-1 text-2xl font-bold tracking-tight">{item.value}</p>
                {item.hint && (
                  <p className="mt-1 truncate text-xs text-muted-foreground">{item.hint}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
