import Link from "next/link";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { ListPanel, ListPanelItem } from "@/components/shared/list-panel";
import { Pagination } from "@/components/shared/pagination";
import { ListChecks, ArrowUpRight } from "lucide-react";
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
    .select("id, title, status, priority, due_at, project_id, projects(title, reference_code)", {
      count: "exact",
    })
    .or(`assigned_to.eq.${ctx.user.id},created_by.eq.${ctx.user.id}`)
    .order("due_at", { ascending: true, nullsFirst: false })
    .range(from, to);

  type TaskRow = {
    id: string;
    title: string;
    status: string;
    project_id: string;
    projects:
      | { title: string; reference_code: string | null }
      | { title: string; reference_code: string | null }[]
      | null;
  };

  const rows = (tasks ?? []) as TaskRow[];
  const totalPages = getTotalPages(count ?? 0, LIST_PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
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
          description="Créez des tâches depuis la fiche d'un projet."
        />
      ) : (
        <>
          <ListPanel>
            {rows.map((task) => {
              const proj = Array.isArray(task.projects) ? task.projects[0] : task.projects;
              return (
                <ListPanelItem key={task.id}>
                  <div className="min-w-0">
                    <p className="font-medium">{task.title}</p>
                    <Link
                      href={`/dashboard/projects/${task.project_id}`}
                      className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      {proj?.title ?? "Projet"}
                      {proj?.reference_code && ` · ${proj.reference_code}`}
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
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
    </div>
  );
}
