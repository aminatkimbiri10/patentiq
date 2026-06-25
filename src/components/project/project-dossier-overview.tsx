import Link from "next/link";
import { ArrowRight, Gauge } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ProjectStatusBadge } from "@/components/shared/status-badge";
import {
  computeProjectCompleteness,
  type CompletenessInput,
  type CompletenessLevel,
} from "@/lib/projects/completeness";
import { projectTabQuery } from "@/lib/project-tabs";
import type { ProjectStatus } from "@/types/database";
import { cn } from "@/lib/utils/cn";

const LEVEL_BAR: Record<CompletenessLevel, string> = {
  incomplet: "[&>div]:bg-destructive",
  en_cours: "[&>div]:bg-amber-500",
  presque: "[&>div]:bg-sky-500",
  complet: "[&>div]:bg-emerald-500",
};

/** En-tête dossier unifié — remplace bandeau KPI + complétude séparés */
export function ProjectDossierOverview({
  projectId,
  status,
  partyLabel = "CPI",
  partyName,
  cpiName,
  completenessInput,
  pendingTasks = 0,
  pendingAi = 0,
  unreadMessages = 0,
}: {
  projectId: string;
  status: ProjectStatus;
  partyLabel?: string;
  partyName?: string | null;
  cpiName?: string | null;
  completenessInput: CompletenessInput;
  pendingTasks?: number;
  pendingAi?: number;
  unreadMessages?: number;
}) {
  const c = computeProjectCompleteness(completenessInput);
  const contactName = partyName ?? cpiName;
  const alerts = [
    pendingTasks > 0 ? `${pendingTasks} tâche(s)` : null,
    pendingAi > 0 ? `${pendingAi} analyse(s) IA` : null,
    unreadMessages > 0 ? `${unreadMessages} message(s)` : null,
  ].filter(Boolean);

  return (
    <section className="rounded-xl border border-border/60 bg-card shadow-sm">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <ProjectStatusBadge status={status} />
          {contactName && (
            <span className="text-sm text-muted-foreground">
              {partyLabel} : <span className="font-medium text-foreground">{contactName}</span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Gauge className="h-4 w-4 text-primary" aria-hidden />
          <div className="min-w-[140px] flex-1 sm:min-w-[180px]">
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">Complétude</span>
              <span className="text-sm font-bold tabular-nums">{c.percent} %</span>
            </div>
            <Progress value={c.percent} className={cn("h-1.5", LEVEL_BAR[c.level])} />
          </div>
          <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
            {c.levelLabel}
          </span>
        </div>
      </div>

      {(c.nextAction || alerts.length > 0) && (
        <div className="flex flex-col gap-2 border-t border-border/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          {c.nextAction && c.percent < 100 && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Prochaine étape : </span>
              {c.nextAction}
            </p>
          )}
          {alerts.length > 0 && (
            <p className="text-xs text-primary">{alerts.join(" · ")}</p>
          )}
          {c.percent < 100 && (
            <Link
              href={`/dashboard/projects/${projectId}${projectTabQuery("documents")}`}
              className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Compléter le dossier
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
