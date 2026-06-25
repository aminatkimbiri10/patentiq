import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function lifecycleProgress(order: readonly string[], current: string): number {
  const idx = order.indexOf(current);
  if (idx < 0) return 0;
  if (order.length <= 1) return 100;
  return Math.round((idx / (order.length - 1)) * 100);
}

function StepBadge({
  idx,
  done,
  isCurrent,
}: {
  idx: number;
  done: boolean;
  isCurrent: boolean;
}) {
  return (
    <span
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
        isCurrent
          ? "bg-primary text-primary-foreground ring-2 ring-primary/20"
          : done
            ? "bg-primary/15 text-primary"
            : "bg-muted text-muted-foreground"
      )}
    >
      {done ? <Check className="h-3.5 w-3.5" /> : idx + 1}
    </span>
  );
}

export function PiLifecycleStepper({
  order,
  labels,
  current,
  className,
}: {
  order: readonly string[];
  labels: Record<string, string>;
  current: string;
  className?: string;
}) {
  const currentIdx = order.indexOf(current);
  const progress = lifecycleProgress(order, current);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-muted-foreground">
          Étape {Math.max(currentIdx + 1, 1)} / {order.length}
        </span>
        <span className="tabular-nums font-semibold text-primary">{progress} %</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary/80 to-cyan-500/90 transition-all duration-500"
          style={{ width: `${Math.max(progress, 4)}%` }}
        />
      </div>

      {/* Desktop : timeline verticale */}
      <ol className="hidden space-y-0 xl:block">
        {order.map((step, idx) => {
          const done = currentIdx > idx;
          const isCurrent = step === current;
          return (
            <li
              key={step}
              className={cn(
                "relative flex items-start gap-3 border-l-2 py-3 pl-4",
                isCurrent
                  ? "border-l-primary"
                  : done
                    ? "border-l-primary/30"
                    : "border-l-border"
              )}
            >
              <StepBadge idx={idx} done={done} isCurrent={isCurrent} />
              <p
                className={cn(
                  "pt-0.5 text-sm leading-tight",
                  isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                )}
              >
                {labels[step] ?? step}
              </p>
            </li>
          );
        })}
      </ol>

      {/* Mobile / tablette : pills compactes */}
      <ol className="grid gap-2 sm:grid-cols-2 xl:hidden">
        {order.map((step, idx) => {
          const done = currentIdx > idx;
          const isCurrent = step === current;
          return (
            <li
              key={step}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors",
                isCurrent
                  ? "border-primary/40 bg-primary/10 font-semibold text-primary"
                  : done
                    ? "border-border/50 bg-muted/30 text-muted-foreground"
                    : "border-border/40 text-muted-foreground/70"
              )}
            >
              <StepBadge idx={idx} done={done} isCurrent={isCurrent} />
              <span className="truncate">{labels[step] ?? step}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
