import { PageHeader } from "@/components/shared/page-header";
import { ProjectTable } from "@/components/dashboard/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { Microscope } from "lucide-react";
import type { Project } from "@/types/database";

export const metadata = { title: "Analyses" };

export default async function ExpertAnalysisPage() {
  const ctx = await requireUser();
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("expert_id", ctx.user.id)
    .in("status", ["expert_review", "cpi_review", "in_review"])
    .order("last_activity_at", { ascending: false });

  const items = (projects ?? []) as Project[];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Microscope}
        title="Analyses techniques"
        description="Dossiers nécessitant votre expertise — le CPI attend votre avis."
      />
      {items.length === 0 ? (
        <EmptyState
          icon={Microscope}
          title="Aucune analyse en cours"
          description="Les projets passés en « Revue expert » apparaîtront ici."
        />
      ) : (
        <ProjectTable projects={items} hrefFor={(id) => `/expert/projects/${id}`} />
      )}
    </div>
  );
}
