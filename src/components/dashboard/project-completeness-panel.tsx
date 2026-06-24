import { CheckCircle2, Circle, CircleDot, Gauge } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  computeProjectCompleteness,
  type CompletenessLevel,
  type CompletenessInput,
} from "@/lib/projects/completeness";
import { cn } from "@/lib/utils/cn";

const LEVEL_STYLES: Record<CompletenessLevel, { bar: string; badge: string }> = {
  incomplet: { bar: "[&>div]:bg-destructive", badge: "bg-destructive/10 text-destructive" },
  en_cours: { bar: "[&>div]:bg-amber-500", badge: "bg-amber-500/10 text-amber-600" },
  presque: { bar: "[&>div]:bg-sky-500", badge: "bg-sky-500/10 text-sky-600" },
  complet: { bar: "[&>div]:bg-emerald-500", badge: "bg-emerald-500/10 text-emerald-600" },
};

/**
 * Jauge « dossier prêt à X % » — guide le porteur vers les points manquants.
 * Composant d'affichage : calcule le score à partir de primitives.
 */
export function ProjectCompletenessPanel(props: CompletenessInput) {
  const completeness = computeProjectCompleteness(props);
  const style = LEVEL_STYLES[completeness.level];

  return (
    <div className="card-elevated mb-6 space-y-4 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Gauge className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold">Complétude du dossier</h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                style.badge
              )}
            >
              {completeness.levelLabel}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Estimation indicative de l&apos;avancement avant instruction par un CPI.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-2xl font-bold tabular-nums">{completeness.percent}</span>
          <span className="text-sm text-muted-foreground"> %</span>
        </div>
      </div>

      <Progress value={completeness.percent} className={cn("h-2", style.bar)} />

      <ul className="space-y-2">
        {completeness.items.map((item) => {
          const partial = !item.done && (item.ratio ?? 0) > 0;
          const Icon = item.done ? CheckCircle2 : partial ? CircleDot : Circle;
          return (
            <li key={item.id} className="flex items-start gap-2.5 text-sm">
              <Icon
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  item.done
                    ? "text-emerald-500"
                    : partial
                      ? "text-amber-500"
                      : "text-muted-foreground/50"
                )}
              />
              <div className="min-w-0">
                <span className={cn(item.done && "text-muted-foreground")}>{item.label}</span>
                {!item.done && item.hint && (
                  <p className="text-xs text-muted-foreground">{item.hint}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {completeness.nextAction && completeness.percent < 100 && (
        <p className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Prochaine étape : </span>
          {completeness.nextAction}
        </p>
      )}
    </div>
  );
}
