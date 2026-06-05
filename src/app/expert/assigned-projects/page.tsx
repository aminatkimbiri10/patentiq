import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectCard } from "@/components/dashboard/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { FolderKanban } from "lucide-react";
import type { Project } from "@/types/database";

export const metadata = { title: "Projets assignés" };

export default async function ExpertAssignedPage() {
  const ctx = await requireUser();
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("expert_id", ctx.user.id)
    .order("last_activity_at", { ascending: false });

  const items = (projects ?? []) as Project[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projets assignés"
        description="Dossiers confiés pour analyse technique et recommandations."
      />
      {items.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Aucun projet assigné"
          description="Vos missions d'expertise apparaîtront ici."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              href={`/expert/projects/${p.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
