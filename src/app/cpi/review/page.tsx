import { PageHeader } from "@/components/shared/page-header";
import { ProjectCard } from "@/components/dashboard/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { requireUser } from "@/lib/auth/require-user";
import { getCpiProjects } from "@/lib/cpi/queries";
import { FileText } from "lucide-react";

export const metadata = { title: "Revue" };

export default async function CpiReviewPage() {
  const ctx = await requireUser();
  const items = await getCpiProjects(ctx.user.id, ["cpi_review", "expert_review"]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="File de revue"
        description="Dossiers en attente de décision CPI ou retour expert."
      />
      {items.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Aucun dossier en attente"
          description="Les projets en statut « Revue CPI » ou « Revue expert » apparaîtront ici."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => (
            <ProjectCard key={p.id} project={p} href={`/cpi/cases/${p.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
