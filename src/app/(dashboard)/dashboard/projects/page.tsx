import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { getHolderStats } from "@/lib/dashboard/stats";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ProjectTable } from "@/components/dashboard/project-card";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { FolderKanban, FileText, Brain } from "lucide-react";
import { parsePageParam, getRange, getTotalPages, PROJECTS_PAGE_SIZE } from "@/lib/pagination";
import type { Project } from "@/types/database";

export const metadata = { title: "Projets" };

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const ctx = await requireUser();
  const supabase = await createClient();
  const page = parsePageParam(searchParams.page);
  const { from, to } = getRange(page, PROJECTS_PAGE_SIZE);

  const [{ data: projects, count }, stats] = await Promise.all([
    supabase
      .from("projects")
      .select("*", { count: "exact" })
      .eq("owner_id", ctx.user.id)
      .order("last_activity_at", { ascending: false })
      .range(from, to),
    getHolderStats(ctx.user.id),
  ]);

  const totalPages = getTotalPages(count ?? 0, PROJECTS_PAGE_SIZE);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FolderKanban}
        eyebrow="Portefeuille"
        title="Mes projets"
        description={
          count != null
            ? `${count} projet${count !== 1 ? "s" : ""} — page ${page}/${totalPages}`
            : "Gérez vos dossiers, inventions et besoins en propriété intellectuelle."
        }
      >
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="h-4 w-4" />
            Nouveau
          </Link>
        </Button>
      </PageHeader>

      <KpiCards
        items={[
          { title: "Total", value: stats.projectCount, icon: FolderKanban },
          { title: "Actifs", value: stats.activeProjectCount, icon: FolderKanban },
          { title: "Documents", value: stats.documentCount, icon: FileText },
          { title: "Analyses IA", value: stats.aiSearchCount, icon: Brain },
        ]}
      />

      {!projects?.length ? (
        <EmptyState
          icon={FolderKanban}
          title="Aucun projet"
          description="Créez votre premier projet pour structurer votre parcours PI."
          action={
            <Button asChild>
              <Link href="/dashboard/projects/new">Créer un projet</Link>
            </Button>
          }
        />
      ) : (
        <>
          <ProjectTable projects={projects as Project[]} />
          <Pagination basePath="/dashboard/projects" page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
