"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronDown, Shield } from "lucide-react";
import type { WatchAlertRow, WatchlistRow } from "@/lib/actions/watchlist";
import type { TechWatchRow } from "@/lib/surveillance/tech-watch-runner";
import type { DashboardAiInsight } from "@/lib/dashboard/overview-data";
import type {
  SurveillanceActivityItem,
  SurveillanceStats,
} from "@/lib/surveillance/dashboard-stats";
import type { SurveillanceProjectRow } from "@/lib/surveillance/context-data";
import { SurveillanceKpiRow } from "@/components/surveillance/workspace/surveillance-kpi-row";
import {
  SurveillanceHeaderBar,
  type SurveillanceFilter,
} from "@/components/surveillance/workspace/surveillance-header-bar";
import { SurveillanceAnalytics } from "@/components/surveillance/workspace/surveillance-analytics";
import { SurveillanceTimeline } from "@/components/surveillance/workspace/surveillance-timeline";
import { SurveillanceProjectsPanel } from "@/components/surveillance/workspace/surveillance-projects-panel";
import { AiInsightsPanel } from "@/components/dashboard/overview/ai-insights-panel";
import { WatchAlertsPanel } from "@/components/surveillance/watch-alerts-panel";
import { WatchlistTable } from "@/components/surveillance/watchlist-table";
import { WatchlistForm } from "@/components/surveillance/watchlist-form";
import { WatchlistCsvImport } from "@/components/surveillance/watchlist-csv-import";
import { TechWatchForm, TechWatchList } from "@/components/surveillance/tech-watch-panel";
import { OmpicTrademarkSearchPanel } from "@/components/surveillance/ompic-trademark-search-panel";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import type { AppRole } from "@/types/roles";

function filterAlerts(alerts: WatchAlertRow[], filter: SurveillanceFilter): WatchAlertRow[] {
  if (filter === "open") return alerts.filter((a) => a.status === "new");
  if (filter === "critical") {
    return alerts.filter((a) => a.status === "new" && (a.similarity_score ?? 0) >= 0.85);
  }
  return alerts;
}

function Disclosure({
  title,
  description,
  defaultOpen = false,
  badge,
  anchorId,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  badge?: string;
  anchorId?: string;
  children: React.ReactNode;
}) {
  return (
    <details
      id={anchorId}
      className="enterprise-panel group overflow-hidden"
      open={defaultOpen}
    >
      <summary className="enterprise-panel-header cursor-pointer list-none bg-muted/20 marker:content-none [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            {badge && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-border/60">{children}</div>
    </details>
  );
}

export function SurveillanceWorkspace({
  items,
  alerts,
  techWatch,
  stats,
  activity,
  projects,
  aiInsights,
  role = "project_holder",
  variant = "holder",
}: {
  items: WatchlistRow[];
  alerts: WatchAlertRow[];
  techWatch: TechWatchRow[];
  stats: SurveillanceStats;
  activity: SurveillanceActivityItem[];
  projects: SurveillanceProjectRow[];
  aiInsights: DashboardAiInsight[];
  role?: AppRole;
  variant?: "holder" | "cpi";
}) {
  const [filter, setFilter] = useState<SurveillanceFilter>(
    stats.activeAlerts > 0 ? "open" : "all"
  );

  const filteredAlerts = useMemo(() => filterAlerts(alerts, filter), [alerts, filter]);
  const isEmpty = items.length === 0 && alerts.length === 0 && techWatch.length === 0;
  const projectsHref = variant === "cpi" ? "/cpi/cases" : "/dashboard/projects";

  if (isEmpty) {
    return (
      <div className="space-y-5">
        <EmptyState
          icon={Shield}
          title="Aucune surveillance active"
          description="Ajoutez une marque ou un brevet enregistré pour détecter les similarités OMPIC et suivre votre portefeuille PI."
          className="enterprise-panel py-14"
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild size="sm">
                <a href="#portefeuille">Ajouter un actif</a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={projectsHref}>Lier à un projet</Link>
              </Button>
            </div>
          }
        />
        <Disclosure title="Configurer le portefeuille" defaultOpen anchorId="portefeuille">
          <div className="space-y-4 p-5">
            <WatchlistForm />
          </div>
        </Disclosure>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SurveillanceKpiRow stats={stats} />
      <SurveillanceHeaderBar stats={stats} filter={filter} onFilterChange={setFilter} />

      <div className="grid gap-5 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-8">
          <DashboardSection
            title="Alertes prioritaires"
            description={
              stats.activeAlerts
                ? `${stats.activeAlerts} à traiter${stats.criticalAlerts ? ` · ${stats.criticalAlerts} critique(s)` : ""}`
                : "Aucune alerte ouverte"
            }
            icon={AlertTriangle}
          >
            <div className="p-5 pt-0">
              <WatchAlertsPanel alerts={filteredAlerts} />
            </div>
          </DashboardSection>

          {stats.activeAlerts > 10 ? (
            <Disclosure
              title="Activité récente"
              description={`${Math.min(activity.length, 8)} derniers événements`}
              badge={`${activity.length}`}
            >
              <SurveillanceTimeline items={activity.slice(0, 8)} embedded />
            </Disclosure>
          ) : (
            <SurveillanceTimeline items={activity.slice(0, 8)} />
          )}

          {(stats.severityChart.length > 0 || stats.categoryChart.length > 0) &&
            (stats.activeAlerts <= 10 ? (
              <SurveillanceAnalytics
                severityChart={stats.severityChart}
                categoryChart={stats.categoryChart}
              />
            ) : (
              <Disclosure title="Vue analytique" description="Répartition des signaux">
                <SurveillanceAnalytics
                  severityChart={stats.severityChart}
                  categoryChart={stats.categoryChart}
                  embedded
                />
              </Disclosure>
            ))}
        </div>

        <aside className="space-y-5 xl:col-span-4">
          <DashboardSection
            title="Portefeuille"
            description={`${items.length} actif${items.length !== 1 ? "s" : ""}`}
            icon={Shield}
          >
            <div className="max-h-[360px] overflow-y-auto p-5 pt-0">
              <WatchlistTable
                items={items.slice(0, 5)}
                showOwnerProjects={variant === "cpi"}
              />
              {items.length > 5 && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  + {items.length - 5} autre{items.length - 5 !== 1 ? "s" : ""} — voir portefeuille
                </p>
              )}
            </div>
          </DashboardSection>

          <SurveillanceProjectsPanel projects={projects} />

          <AiInsightsPanel insights={aiInsights} role={role} />
        </aside>
      </div>

      <div className="space-y-3">
        <Disclosure
          anchorId="portefeuille"
          title="Gérer le portefeuille"
          description="Recherche OMPIC, ajout, import CSV et scans"
          badge={`${items.length} actif${items.length !== 1 ? "s" : ""}`}
        >
          <div className="space-y-5 p-5">
            <OmpicTrademarkSearchPanel />
            <WatchlistForm />
            <WatchlistCsvImport />
            <WatchlistTable items={items} showOwnerProjects={variant === "cpi"} />
          </div>
        </Disclosure>

        <Disclosure
          title="Veille technologique"
          description="Mots-clés brevets et dessins & modèles"
          badge={`${techWatch.length} veille${techWatch.length !== 1 ? "s" : ""}`}
        >
          <div className="space-y-4 p-5">
            <TechWatchForm />
            <TechWatchList items={techWatch} />
          </div>
        </Disclosure>
      </div>
    </div>
  );
}
