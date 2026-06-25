import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { DashboardHero, SettingsShortcuts } from "@/components/dashboard/overview/dashboard-hero";
import { WorkflowPanel } from "@/components/dashboard/overview/workflow-panel";
import { AiInsightsPanel } from "@/components/dashboard/overview/ai-insights-panel";
import { DashboardTasksPanel } from "@/components/dashboard/overview/dashboard-tasks-panel";
import { DashboardDocumentsPanel } from "@/components/dashboard/overview/dashboard-documents-panel";
import { ActivityFeedPanel } from "@/components/dashboard/overview/activity-feed-panel";
import { AnalyticsPanel } from "@/components/dashboard/overview/analytics-panel";
import { RoleQuickActions } from "@/components/dashboard/overview/role-quick-actions";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { ProjectTable } from "@/components/dashboard/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import type { DashboardOverview } from "@/lib/dashboard/overview-data";
import type { AppRole } from "@/types/roles";

export type RoleDashboardConfig = {
  /** home = accueil épuré ; full = vue détaillée */
  layout?: "home" | "full";
  projectsTitle: string;
  projectsDescription?: string;
  projectsHref: string;
  projectHrefFor: (id: string) => string;
  showSettings?: boolean;
  showDocuments?: boolean;
  showAi?: boolean;
  showWorkflow?: boolean;
  showQuickActions?: boolean;
  showActivity?: boolean;
  headerAction?: React.ReactNode;
  extraBeforeGrid?: React.ReactNode;
  extraSidebar?: React.ReactNode;
  metricsLimit?: number;
  maxProjects?: number;
  maxTasks?: number;
};

function defaultProjectHref(role: AppRole, id: string): string {
  if (role === "cpi_advisor") return `/cpi/cases/${id}`;
  if (role === "expert") return `/expert/projects/${id}`;
  if (role === "admin") return `/admin/projects/${id}`;
  return `/dashboard/projects/${id}`;
}

export function RoleDashboardOverview({
  data,
  config,
}: {
  data: DashboardOverview;
  config: RoleDashboardConfig;
}) {
  const isHome = config.layout !== "full";
  const metricsLimit = config.metricsLimit ?? (isHome ? 4 : 6);
  const maxProjects = config.maxProjects ?? (isHome ? 3 : 5);
  const maxTasks = config.maxTasks ?? (isHome ? 4 : 8);

  const kpiItems = data.metrics.slice(0, metricsLimit).map((m) => ({
    title: m.title,
    value: m.value,
    hint: m.hint,
  }));

  const projects = data.recentProjects.slice(0, maxProjects);
  const tasks = data.tasks.slice(0, maxTasks);

  if (isHome) {
    return (
      <div className="dashboard-overview dash-page w-full min-w-0 max-w-full space-y-5">
        <DashboardHero
          firstName={data.firstName}
          role={data.role}
          statusLine={data.statusLine}
          highlights={[]}
          action={config.headerAction}
          compact
        />

        <KpiCards items={kpiItems} columns={4} />

        {config.extraBeforeGrid}

        <div className="grid gap-5 xl:grid-cols-12">
          <div className="space-y-5 xl:col-span-8">
            {config.showWorkflow !== false && <WorkflowPanel workflow={data.workflow} />}

            <DashboardSection
              title={config.projectsTitle}
              description={config.projectsDescription}
              actionHref={config.projectsHref}
              icon={FolderKanban}
            >
              {!projects.length ? (
                <EmptyState
                  icon={FolderKanban}
                  title="Aucun projet"
                  description="Créez votre premier dossier pour démarrer."
                  className="rounded-none border-0 bg-transparent py-8"
                  action={
                    config.headerAction ?? (
                      <Button size="sm" asChild>
                        <Link href={config.projectsHref}>Voir les projets</Link>
                      </Button>
                    )
                  }
                />
              ) : (
                <ProjectTable projects={projects} hrefFor={config.projectHrefFor} embedded />
              )}
            </DashboardSection>
          </div>

          <aside className="space-y-5 xl:col-span-4">
            <DashboardTasksPanel
              tasks={tasks}
              actionHref={data.tasksHref}
              overdueCount={data.overdueTaskCount}
            />
            {config.extraSidebar}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-overview dash-page w-full min-w-0 max-w-full space-y-6">
      <DashboardHero
        firstName={data.firstName}
        role={data.role}
        statusLine={data.statusLine}
        highlights={data.heroHighlights}
        action={config.headerAction}
      />

      <KpiCards items={kpiItems} columns={metricsLimit > 4 ? 6 : 4} />

      {config.extraBeforeGrid}

      {config.showQuickActions !== false && <RoleQuickActions role={data.role} />}

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          {config.showWorkflow !== false && <WorkflowPanel workflow={data.workflow} />}

          <DashboardSection
            title={config.projectsTitle}
            description={config.projectsDescription}
            actionHref={config.projectsHref}
            icon={FolderKanban}
          >
            {!projects.length ? (
              <EmptyState
                icon={FolderKanban}
                title="Aucun projet"
                description="Créez ou ouvrez un dossier pour commencer."
                className="rounded-none border-0 bg-transparent py-10"
                action={
                  config.headerAction ?? (
                    <Button size="sm" asChild>
                      <Link href={config.projectsHref}>
                        <Plus className="mr-1.5 h-4 w-4" />
                        Voir les projets
                      </Link>
                    </Button>
                  )
                }
              />
            ) : (
              <ProjectTable projects={projects} hrefFor={config.projectHrefFor} embedded />
            )}
          </DashboardSection>

          <div className="grid gap-6 lg:grid-cols-2">
            <DashboardTasksPanel
              tasks={tasks}
              actionHref={data.tasksHref}
              overdueCount={data.overdueTaskCount}
            />
            {config.showDocuments !== false && (
              <DashboardDocumentsPanel documents={data.documents} actionHref={data.documentsHref} />
            )}
          </div>

          {config.showActivity !== false && <ActivityFeedPanel activity={data.activity} />}
        </div>

        <aside className="space-y-6 xl:col-span-4">
          {config.showAi !== false && (
            <AiInsightsPanel insights={data.aiInsights} role={data.role} />
          )}
          <AnalyticsPanel items={data.stageChart} />
          {config.extraSidebar}
          {config.showSettings !== false && <SettingsShortcuts />}
        </aside>
      </div>
    </div>
  );
}

export function holderProjectHref(id: string) {
  return defaultProjectHref("project_holder", id);
}

export function cpiProjectHref(id: string) {
  return defaultProjectHref("cpi_advisor", id);
}

export function expertProjectHref(id: string) {
  return defaultProjectHref("expert", id);
}

export function adminProjectHref(id: string) {
  return defaultProjectHref("admin", id);
}
