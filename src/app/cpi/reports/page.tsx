import Link from "next/link";
import { FileDown, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { requireUser } from "@/lib/auth/require-user";
import { getCpiStats, getCpiProjects } from "@/lib/cpi/queries";
import { getCpiPortfolioStats } from "@/lib/cpi/portfolio";
import { listIpDeadlinesForUser } from "@/lib/actions/ip-deadlines";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { StatBarList } from "@/components/dashboard/stat-bar-list";
import { IpDeadlinesPanel } from "@/components/surveillance/ip-deadlines-panel";
import { ProjectStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Briefcase, CheckCircle2, Clock, FolderKanban } from "lucide-react";

export const metadata = { title: "Tableau de bord portefeuille" };

export default async function CpiReportsPage() {
  const ctx = await requireUser();
  const [stats, portfolio, decided, deadlines] = await Promise.all([
    getCpiStats(ctx.user.id),
    getCpiPortfolioStats(ctx.user.id),
    getCpiProjects(ctx.user.id, ["approved", "rejected", "closed"]),
    listIpDeadlinesForUser(8, ctx.user.id, true),
  ]);

  return (
    <div className="dash-page w-full min-w-0 space-y-6">
      <PageHeader
        icon={BarChart3}
        eyebrow="Portefeuille"
        title="Tableau de bord portefeuille"
        description="Répartition, échéances et décisions sur vos dossiers clients."
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/api/cpi/reports/export?format=csv">
              <FileDown className="mr-1.5 h-4 w-4" />
              Export CSV
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/api/cpi/reports/export?format=html">
              <FileDown className="mr-1.5 h-4 w-4" />
              Export HTML / PDF
            </a>
          </Button>
        </div>
      </PageHeader>

      <KpiCards
        items={[
          { title: "Total dossiers", value: portfolio.total, icon: FolderKanban },
          { title: "Dossiers actifs", value: stats.activeCount, icon: Briefcase },
          { title: "Décisions rendues", value: stats.decidedCount, icon: CheckCircle2 },
          {
            title: "En retard (>7j)",
            value: stats.staleCount,
            icon: Clock,
            hint: stats.staleCount > 0 ? "À relancer" : "À jour",
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-6 sm:grid-cols-2">
            <DashboardSection title="Répartition par statut">
              <div className="p-5 pt-0">
                <StatBarList
                  items={portfolio.byStatus}
                  emptyLabel="Aucun dossier assigné"
                  barClassName="bg-primary"
                />
              </div>
            </DashboardSection>
            <DashboardSection title="Répartition par type de PI">
              <div className="p-5 pt-0">
                <StatBarList
                  items={portfolio.byCategory}
                  emptyLabel="Aucune catégorie"
                  barClassName="bg-sky-500"
                />
              </div>
            </DashboardSection>
          </div>

          {decided.length > 0 && (
            <DashboardSection title="Dernières décisions">
              <ul className="divide-y divide-border/80">
                {decided.slice(0, 10).map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/30"
                  >
                    <Link
                      href={`/cpi/cases/${p.id}`}
                      className="min-w-0 font-medium hover:text-primary"
                    >
                      <span className="block truncate">{p.title}</span>
                      <span className="text-xs text-muted-foreground">{p.reference_code}</span>
                    </Link>
                    <ProjectStatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            </DashboardSection>
          )}
        </div>

        <aside className="space-y-6">
          <IpDeadlinesPanel deadlines={deadlines} viewer="cpi" compact />
        </aside>
      </div>
    </div>
  );
}
