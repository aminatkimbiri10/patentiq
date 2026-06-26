import Link from "next/link";
import { ArrowRight, Check, Route } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/shared/empty-state";
import type { DashboardWorkflow } from "@/lib/dashboard/overview-data";

export function WorkflowPanel({ workflow }: { workflow: DashboardWorkflow }) {
  return (
    <DashboardSection
      title="Parcours PI"
      description={
        workflow.projectTitle
          ? `${workflow.projectRef ?? "Sans réf."} · ${workflow.projectTitle}`
          : "Avancement de votre dossier principal"
      }
      icon={Route}
      actionHref={workflow.href ?? undefined}
      actionLabel="Ouvrir le dossier"
      className="dashboard-workflow-panel"
    >
      {!workflow.projectId ? (
        <EmptyState
          icon={Route}
          title="Aucun dossier en cours"
          description={workflow.recommendation}
          className="rounded-none border-0 bg-transparent py-10"
        />
      ) : (
        <div className="space-y-5 p-4 sm:p-5">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Étape actuelle
              </p>
              <p className="mt-1 break-words text-base font-semibold text-foreground sm:text-lg">
                {workflow.currentStageLabel}
              </p>
            </div>
            <div className="shrink-0 sm:text-right">
              <p className="text-3xl font-semibold tabular-nums text-primary">{workflow.progress}%</p>
              <p className="text-xs text-muted-foreground">Progression estimée</p>
            </div>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/80 to-cyan-500/90 transition-all"
              style={{ width: `${Math.max(workflow.progress, 4)}%` }}
            />
          </div>

          <ol className="-mx-1 flex gap-2 overflow-x-auto overscroll-x-contain px-1 pb-1 scrollbar-thin">
            {workflow.stages.map((stage, idx) => (
              <li
                key={stage.id}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
                  stage.current
                    ? "border-primary/40 bg-primary/10 font-semibold text-primary"
                    : stage.done
                      ? "border-border/50 bg-muted/30 text-muted-foreground"
                      : "border-border/40 text-muted-foreground/60"
                )}
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
                    stage.current
                      ? "bg-primary text-primary-foreground"
                      : stage.done
                        ? "bg-primary/15 text-primary"
                        : "bg-muted"
                  )}
                >
                  {stage.done ? <Check className="h-2.5 w-2.5" /> : idx + 1}
                </span>
                <span className="max-w-[9rem] truncate sm:max-w-[12rem]">{stage.label}</span>
              </li>
            ))}
          </ol>

          <div className="rounded-xl border border-primary/15 bg-primary/[0.04] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Prochaine action
            </p>
            <p className="mt-1 text-sm leading-relaxed text-foreground">{workflow.recommendation}</p>
            {workflow.href && (
              <Link
                href={workflow.href}
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Accéder au dossier
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      )}
    </DashboardSection>
  );
}
