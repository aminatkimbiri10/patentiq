import Link from "next/link";
import { format, isPast, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardPageFrame } from "@/components/dashboard/dashboard-page-frame";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ListPanel, ListPanelItem } from "@/components/shared/list-panel";
import { Pagination } from "@/components/shared/pagination";
import { ListChecks, ArrowUpRight, Calendar, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projectTabQuery } from "@/lib/project-tabs";
import { parsePageParam, getRange, getTotalPages, LIST_PAGE_SIZE } from "@/lib/pagination";

export const metadata = { title: "Tâches" };

const statusLabel: Record<string, string> = {
  pending: "À faire",
  in_progress: "En cours",
  completed: "Terminé",
  cancelled: "Annulé",
};

const statusVariant: Record<string, "default" | "secondary" | "success" | "outline"> = {
  pending: "outline",
  in_progress: "default",
  completed: "success",
  cancelled: "secondary",
};

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const ctx = await requireUser();
  const supabase = await createClient();
  const page = parsePageParam(searchParams.page);
  const { from, to } = getRange(page, LIST_PAGE_SIZE);

  const { data: tasks, count } = await supabase
    .from("project_tasks")
    .select(
      "id, title, description, status, priority, due_at, project_id, created_by, assigned_to, projects(title, reference_code)",
      { count: "exact" }
    )
    .eq("assigned_to", ctx.user.id)
    .order("due_at", { ascending: true, nullsFirst: false })
    .range(from, to);

  type TaskRow = {
    id: string;
    title: string;
    description: string | null;
    status: string;
    due_at: string | null;
    created_by: string;
    assigned_to: string | null;
    project_id: string;
    projects:
      | { title: string; reference_code: string | null }
      | { title: string; reference_code: string | null }[]
      | null;
  };

  const rows = (tasks ?? []) as TaskRow[];
  const totalPages = getTotalPages(count ?? 0, LIST_PAGE_SIZE);

  return (
    <DashboardPageFrame>
      <PageHeader
        variant="elevated"
        bordered={false}
        icon={ListChecks}
        eyebrow="Actions"
        title="Mes tâches"
        description={
          count != null
            ? `${count} tâche${count !== 1 ? "s" : ""} — page ${page}/${totalPages}`
            : "Actions et échéances sur vos projets."
        }
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="Aucune tâche"
          description="Votre conseiller PI vous assignera des actions depuis le dossier (checklist ou formulaire dédié)."
          className="enterprise-panel"
          action={
            <Button variant="outline" asChild>
              <Link href="/dashboard/projects">
                <FolderKanban className="mr-2 h-4 w-4" />
                Mes projets
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <ListPanel>
            {rows.map((task) => {
              const proj = Array.isArray(task.projects) ? task.projects[0] : task.projects;
              const cpiAssigned =
                task.created_by && task.assigned_to && task.created_by !== task.assigned_to;
              const overdue =
                task.due_at &&
                task.status !== "completed" &&
                isPast(new Date(task.due_at)) &&
                !isToday(new Date(task.due_at));

              return (
                <ListPanelItem key={task.id} className="items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{task.title}</p>
                      {cpiAssigned && (
                        <Badge variant="secondary" className="text-[10px]">
                          CPI
                        </Badge>
                      )}
                      {overdue && (
                        <Badge variant="destructive" className="text-[10px]">
                          En retard
                        </Badge>
                      )}
                    </div>
                    {task.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    )}
                    <Link
                      href={`/dashboard/projects/${task.project_id}${projectTabQuery("echanges", "tasks")}`}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      {proj?.title ?? "Projet"}
                      {proj?.reference_code && ` · ${proj.reference_code}`}
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                    {task.due_at && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(task.due_at), "d MMM yyyy", { locale: fr })}
                      </p>
                    )}
                  </div>
                  <Badge variant={statusVariant[task.status] ?? "outline"}>
                    {statusLabel[task.status] ?? task.status}
                  </Badge>
                </ListPanelItem>
              );
            })}
          </ListPanel>
          <Pagination basePath="/dashboard/tasks" page={page} totalPages={totalPages} />
        </>
      )}
    </DashboardPageFrame>
  );
}
