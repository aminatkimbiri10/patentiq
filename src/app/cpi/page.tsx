import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ProjectCard } from "@/components/dashboard/project-card";
import { StaleCasesAlert } from "@/components/cpi/stale-cases-alert";
import { requireUser } from "@/lib/auth/require-user";
import { getCpiProjects, getCpiStats } from "@/lib/cpi/queries";
import { Briefcase, FileText, FlaskConical, Scale, ArrowRight } from "lucide-react";
import type { Project } from "@/types/database";

export const metadata = { title: "Espace CPI" };

const STALE_DAYS = 7;

export default async function CpiDashboardPage() {
  const ctx = await requireUser();
  const [stats, projects] = await Promise.all([
    getCpiStats(ctx.user.id),
    getCpiProjects(ctx.user.id),
  ]);

  const staleMs = STALE_DAYS * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const staleProjects = projects.filter(
    (p) =>
      ["awaiting_documents", "expert_review"].includes(p.status) &&
      now - new Date(p.last_activity_at).getTime() > staleMs
  );

  const priority = projects
    .filter((p) => ["cpi_review", "expert_review", "in_review"].includes(p.status))
    .slice(0, 3) as Project[];

  return (
    <div className="space-y-8">
      <PageHeader title="Conseiller PI" description="Dossiers assignés et revues juridiques." />

      <StaleCasesAlert projects={staleProjects} />

      <KpiCards
        items={[
          { title: "Dossiers actifs", value: stats.activeCount, icon: Briefcase },
          { title: "En revue", value: stats.inReviewCount, icon: FileText },
          {
            title: "Revue expert",
            value: stats.awaitingExpertCount,
            icon: FlaskConical,
          },
          { title: "Décision CPI", value: stats.cpiReviewCount, icon: Scale },
        ]}
      />

      {priority.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">À traiter</h2>
            <Link
              href="/cpi/cases"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Tous les dossiers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {priority.map((p) => (
              <ProjectCard key={p.id} project={p} href={`/cpi/cases/${p.id}`} />
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/cpi/review"
          className="card-elevated group flex items-center justify-between p-5"
        >
          <div>
            <p className="font-semibold group-hover:text-primary">File de revue</p>
            <p className="text-sm text-muted-foreground">
              {stats.cpiReviewCount} dossier{stats.cpiReviewCount !== 1 ? "s" : ""} en décision
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
        </Link>
        <Link
          href="/cpi/reports"
          className="card-elevated group flex items-center justify-between p-5"
        >
          <div>
            <p className="font-semibold group-hover:text-primary">Rapports</p>
            <p className="text-sm text-muted-foreground">
              {stats.decidedCount} décision{stats.decidedCount !== 1 ? "s" : ""} rendue
              {stats.decidedCount !== 1 ? "s" : ""}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
        </Link>
      </div>
    </div>
  );
}
