import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectCard } from "@/components/dashboard/project-card";
import { Pagination } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { FolderKanban } from "lucide-react";
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

  const { data: projects, count } = await supabase
    .from("projects")
    .select("*", { count: "exact" })
    .eq("owner_id", ctx.user.id)
    .order("last_activity_at", { ascending: false })
    .range(from, to);

  const totalPages = getTotalPages(count ?? 0, PROJECTS_PAGE_SIZE);

  return (
    <div className="space-y-8">
      <PageHeader
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
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {(projects as Project[]).map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
          <Pagination basePath="/dashboard/projects" page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
