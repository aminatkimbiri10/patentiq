import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ProjectCard } from "@/components/dashboard/project-card";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { getExpertStats } from "@/lib/expert/stats";
import { FolderKanban, Microscope, ClipboardList, ArrowRight } from "lucide-react";
import type { Project } from "@/types/database";

export const metadata = { title: "Expert" };

export default async function ExpertDashboardPage() {
  const ctx = await requireUser();
  const supabase = await createClient();
  const stats = await getExpertStats(ctx.user.id);

  const { data: urgent } = await supabase
    .from("projects")
    .select("*")
    .eq("expert_id", ctx.user.id)
    .eq("status", "expert_review")
    .order("last_activity_at", { ascending: false })
    .limit(3);

  const urgentProjects = (urgent ?? []) as Project[];

  return (
    <div className="space-y-8">
      <PageHeader title="Expert métier" description="Analyses techniques et recommandations." />

      <KpiCards
        items={[
          { title: "Projets assignés", value: stats.assignedCount, icon: FolderKanban },
          {
            title: "Analyses en attente",
            value: stats.awaitingAnalysis,
            icon: Microscope,
            hint: "Statut « Revue expert »",
          },
          {
            title: "Recommandations publiées",
            value: stats.recommendationsCount,
            icon: ClipboardList,
          },
        ]}
      />

      {urgentProjects.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">À traiter en priorité</h2>
            <Link
              href="/expert/analysis"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Toutes les analyses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {urgentProjects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                href={`/expert/projects/${p.id}`}
              />
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/expert/assigned-projects"
          className="card-elevated group flex items-center justify-between p-5"
        >
          <div>
            <p className="font-semibold group-hover:text-primary">Projets assignés</p>
            <p className="text-sm text-muted-foreground">Tous vos dossiers en cours</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
        </Link>
        <Link
          href="/expert/recommendations"
          className="card-elevated group flex items-center justify-between p-5"
        >
          <div>
            <p className="font-semibold group-hover:text-primary">Mes recommandations</p>
            <p className="text-sm text-muted-foreground">Avis structurés transmis au CPI</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
        </Link>
      </div>
    </div>
  );
}
