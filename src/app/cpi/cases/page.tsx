import { requireUser } from "@/lib/auth/require-user";
import { getCpiProjects } from "@/lib/cpi/queries";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectTable } from "@/components/dashboard/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Briefcase } from "lucide-react";

export const metadata = { title: "Dossiers" };

export default async function CpiCasesPage() {
  const ctx = await requireUser();
  const items = await getCpiProjects(ctx.user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Briefcase}
        title="Mes dossiers"
        description="Projets assignés pour revue et accompagnement CPI."
      />
      {items.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Aucun dossier assigné"
          description="Les projets qui vous sont confiés apparaîtront ici."
        />
      ) : (
        <ProjectTable projects={items} hrefFor={(id) => `/cpi/cases/${id}`} />
      )}
    </div>
  );
}
