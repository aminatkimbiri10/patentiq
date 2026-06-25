import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

const TYPE_STYLES: Record<string, string> = {
  Marque: "bg-violet-500/10 text-violet-700 ring-violet-500/20 dark:text-violet-300",
  Brevet: "bg-cyan-500/10 text-cyan-800 ring-cyan-500/20 dark:text-cyan-300",
  "Dessin & modèle": "bg-amber-500/10 text-amber-800 ring-amber-500/20 dark:text-amber-300",
};

export function PiParcoursHeader({
  typeLabel,
  currentStepLabel,
  progress,
  description,
}: {
  typeLabel: string;
  currentStepLabel: string;
  progress: number;
  description: string;
}) {
  return (
    <div className="enterprise-panel overflow-hidden">
      <div className="enterprise-panel-header bg-gradient-to-r from-muted/30 to-primary/[0.04]">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">Parcours PI</h2>
              <Badge
                variant="outline"
                className={cn("ring-1 ring-inset", TYPE_STYLES[typeLabel] ?? "")}
              >
                {typeLabel}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex shrink-0 items-center gap-4 sm:text-right">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Étape actuelle
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{currentStepLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold tabular-nums text-primary">{progress}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
