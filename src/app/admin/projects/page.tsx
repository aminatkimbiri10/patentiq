import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectCard } from "@/components/dashboard/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { FolderKanban } from "lucide-react";
import type { Project } from "@/types/database";

export const metadata = { title: "Projets (admin)" };

export default async function AdminProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(50);

  const items = (projects ?? []) as Project[];

  return (
    <div className="space-y-6">
      <PageHeader title="Tous les projets" description="Vue globale des dossiers sur la plateforme." />
      {items.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Aucun projet"
          description="Les projets créés par les utilisateurs apparaîtront ici."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => (
            <ProjectCard key={p.id} project={p} href={`/admin/projects/${p.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
