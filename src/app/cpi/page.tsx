import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ProjectTable } from "@/components/dashboard/project-card";
import { CpiQuickActions } from "@/components/cpi/cpi-quick-actions";
import { CpiOnboarding } from "@/components/cpi/cpi-onboarding";
import { StaleCasesAlert } from "@/components/cpi/stale-cases-alert";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { DashboardLinkCard } from "@/components/dashboard/dashboard-link-card";
import { requireUser } from "@/lib/auth/require-user";
import { getCpiProjects, computeCpiStats } from "@/lib/cpi/queries";
import { listIpDeadlinesForUser } from "@/lib/actions/ip-deadlines";
import { IpDeadlinesPanel } from "@/components/surveillance/ip-deadlines-panel";
import { Briefcase, FileText, FlaskConical, Scale, Columns3, Eye } from "lucide-react";
import type { Project } from "@/types/database";

export const metadata = { title: "Espace CPI" };

const STALE_DAYS = 7;

export default async function CpiDashboardPage() {
  const ctx = await requireUser();
  const [projects, ipDeadlines] = await Promise.all([
    getCpiProjects(ctx.user.id),
    listIpDeadlinesForUser(8, ctx.user.id, true),
  ]);
  const stats = computeCpiStats(projects);

  const staleMs = STALE_DAYS * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const staleProjects = projects.filter(
    (p) =>
      ["awaiting_documents", "expert_review"].includes(p.status) &&
      now - new Date(p.last_activity_at).getTime() > staleMs
  );

  const priority = projects
    .filter((p) => ["cpi_review", "expert_review", "in_review"].includes(p.status))
    .slice(0, 5) as Project[];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Briefcase}
        eyebrow="Espace conseiller"
        title="Conseiller PI"
        description="Pilotage des dossiers clients — revue, surveillance et échéances OMPIC."
      />

      <KpiCards
        items={[
          { title: "Dossiers actifs", value: stats.activeCount, icon: Briefcase },
          { title: "En revue", value: stats.inReviewCount, icon: FileText },
          { title: "Revue expert", value: stats.awaitingExpertCount, icon: FlaskConical },
          { title: "Décision CPI", value: stats.cpiReviewCount, icon: Scale },
        ]}
      />

      <CpiQuickActions />
      <StaleCasesAlert projects={staleProjects} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {priority.length > 0 && (
            <DashboardSection
              title="À traiter en priorité"
              description="Dossiers en revue ou en attente de décision."
              actionHref="/cpi/cases"
            >
              <ProjectTable
                projects={priority}
                hrefFor={(id) => `/cpi/cases/${id}`}
                embedded
              />
            </DashboardSection>
          )}

          <DashboardSection title="Raccourcis" description="Accès rapide aux outils CPI.">
            <DashboardLinkCard
              href="/cpi/surveillance"
              title="Surveillance"
              description="Veille marques & brevets — OMPIC live"
              icon={Eye}
            />
            <DashboardLinkCard
              href="/cpi/kanban"
              title="Kanban"
              description={`Pipeline — ${stats.activeCount} actif${stats.activeCount !== 1 ? "s" : ""}`}
              icon={Columns3}
            />
            <DashboardLinkCard
              href="/cpi/review"
              title="File de revue"
              description={`${stats.cpiReviewCount} en décision`}
              icon={FileText}
            />
            <DashboardLinkCard
              href="/cpi/reports"
              title="Rapports"
              description={`${stats.decidedCount} décision${stats.decidedCount !== 1 ? "s" : ""}`}
              icon={Briefcase}
            />
          </DashboardSection>
        </div>

        <aside className="space-y-6">
          <CpiOnboarding activeCaseCount={stats.activeCount} />
          <IpDeadlinesPanel deadlines={ipDeadlines} viewer="cpi" compact />
        </aside>
      </div>
    </div>
  );
}
