import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { CpiKanbanBoard } from "@/components/cpi/kanban-board";
import { EmptyState } from "@/components/shared/empty-state";
import { requireUser } from "@/lib/auth/require-user";
import { getCpiProjects } from "@/lib/cpi/queries";
import { groupProjectsForKanban } from "@/lib/cpi/kanban";
import { Button } from "@/components/ui/button";
import { Columns3, List } from "lucide-react";

export const metadata = { title: "Kanban CPI" };

export default async function CpiKanbanPage() {
  const ctx = await requireUser();
  const projects = await getCpiProjects(ctx.user.id);
  const columns = groupProjectsForKanban(projects);
  const total = projects.filter((p) => p.status !== "draft").length;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Columns3}
        title="Kanban dossiers"
        description="Pipeline visuel de vos dossiers assignés — déplacez via les transitions guidées."
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/cpi/cases">
              <List className="mr-1.5 h-4 w-4" />
              Vue liste
            </Link>
          </Button>
        </div>
      </PageHeader>

      {total === 0 ? (
        <EmptyState
          icon={Columns3}
          title="Aucun dossier"
          description="Les projets assignés apparaîtront dans les colonnes du pipeline."
        />
      ) : (
        <CpiKanbanBoard columns={columns} />
      )}
    </div>
  );
}
