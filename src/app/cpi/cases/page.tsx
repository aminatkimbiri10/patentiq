import { requireUser } from "@/lib/auth/require-user";
import { getCpiProjects } from "@/lib/cpi/queries";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectCard } from "@/components/dashboard/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Briefcase } from "lucide-react";

export const metadata = { title: "Dossiers" };

export default async function CpiCasesPage() {
  const ctx = await requireUser();
  const items = await getCpiProjects(ctx.user.id);

  return (
    <div className="space-y-6">
      <PageHeader
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((p) => (
            <ProjectCard key={p.id} project={p} href={`/cpi/cases/${p.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
