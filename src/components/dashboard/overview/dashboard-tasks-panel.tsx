import Link from "next/link";
import { format, isPast, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { ListChecks, Calendar, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils/cn";
import type { DashboardTask } from "@/lib/dashboard/overview-data";

const STATUS_LABEL: Record<string, string> = {
  pending: "À faire",
  in_progress: "En cours",
  completed: "Terminé",
  cancelled: "Annulé",
};

const PRIORITY_LABEL: Record<string, string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
  urgent: "Urgente",
};

function dueLabel(due_at: string | null): { text: string; urgent: boolean } {
  if (!due_at) return { text: "Sans échéance", urgent: false };
  const d = new Date(due_at);
  if (isToday(d)) return { text: "Aujourd'hui", urgent: true };
  if (isPast(d)) return { text: `En retard · ${format(d, "d MMM", { locale: fr })}`, urgent: true };
  return { text: format(d, "d MMM yyyy", { locale: fr }), urgent: false };
}

export function DashboardTasksPanel({
  tasks,
  actionHref,
  overdueCount,
}: {
  tasks: DashboardTask[];
  actionHref: string;
  overdueCount: number;
}) {
  return (
    <DashboardSection
      title="Tâches & suivi"
      description={overdueCount ? `${overdueCount} tâche${overdueCount !== 1 ? "s" : ""} en retard` : "Vos actions assignées"}
      icon={ListChecks}
      actionHref={actionHref}
    >
      {!tasks.length ? (
        <EmptyState
          icon={ListChecks}
          title="Aucune tâche ouverte"
          description="Les tâches assignées par votre CPI ou générées par la checklist apparaîtront ici."
          className="rounded-none border-0 bg-transparent py-10"
        />
      ) : (
        <ul className="divide-y divide-border/60">
          {tasks.map((task) => {
            const due = dueLabel(task.due_at);
            return (
              <li key={task.id}>
                <Link
                  href={task.href}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-muted/25",
                    task.overdue && "bg-destructive/[0.03]"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
                      task.status === "in_progress"
                        ? "border-primary bg-primary/15"
                        : "border-border bg-card"
                    )}
                    aria-hidden
                  >
                    {task.status === "in_progress" && (
                      <span className="h-2 w-2 rounded-sm bg-primary" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      {task.overdue && (
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" aria-label="En retard" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {task.projectRef ?? "—"} · {task.projectTitle}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {STATUS_LABEL[task.status] ?? task.status}
                      </Badge>
                      <Badge
                        variant={task.priority === "urgent" || task.priority === "high" ? "default" : "secondary"}
                        className="text-[10px] font-normal"
                      >
                        {PRIORITY_LABEL[task.priority] ?? task.priority}
                      </Badge>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[11px]",
                          due.urgent ? "font-medium text-destructive" : "text-muted-foreground"
                        )}
                      >
                        <Calendar className="h-3 w-3" />
                        {due.text}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardSection>
  );
}
