import { PageHeader } from "@/components/shared/page-header";
import { ProjectTable } from "@/components/dashboard/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { requireUser } from "@/lib/auth/require-user";
import { getCpiProjects } from "@/lib/cpi/queries";
import { FileText } from "lucide-react";

export const metadata = { title: "Revue" };

export default async function CpiReviewPage() {
  const ctx = await requireUser();
  const items = await getCpiProjects(ctx.user.id, ["cpi_review", "expert_review"]);

  return (
    <div className="dash-page w-full min-w-0 space-y-6">
      <PageHeader
        icon={FileText}
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
        <ProjectTable projects={items} hrefFor={(id) => `/cpi/cases/${id}`} />
      )}
    </div>
  );
}
