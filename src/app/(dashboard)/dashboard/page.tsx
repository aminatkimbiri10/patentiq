import Link from "next/link";
import { FolderKanban, Plus, FileText, ListChecks, Brain, LayoutDashboard } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { getHolderStats } from "@/lib/dashboard/stats";
import { listIpDeadlinesForUser } from "@/lib/actions/ip-deadlines";
import { IpDeadlinesPanel } from "@/components/surveillance/ip-deadlines-panel";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import { HolderOnboarding } from "@/components/dashboard/holder-onboarding";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ProjectTable } from "@/components/dashboard/project-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types/database";

export const metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const ctx = await requireUser();
  const supabase = await createClient();

  const [stats, ipDeadlines, { data: projects }] = await Promise.all([
    getHolderStats(ctx.user.id),
    listIpDeadlinesForUser(8, ctx.user.id, false),
    supabase
      .from("projects")
      .select("id, title, status, reference_code, description, updated_at")
      .eq("owner_id", ctx.user.id)
      .order("last_activity_at", { ascending: false })
      .limit(5),
  ]);

  const firstName = ctx.profile?.full_name?.split(" ")[0];
  const recent = (projects ?? []) as Pick<
    Project,
    "id" | "title" | "status" | "reference_code" | "description"
  >[];

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        eyebrow="Tableau de bord"
        title={firstName ? `Bonjour, ${firstName}` : "Bonjour"}
        description="Vue d'ensemble de vos dossiers PI — projets, échéances et prochaines actions."
      >
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="mr-1.5 h-4 w-4" />
            Nouveau projet
          </Link>
        </Button>
      </PageHeader>

      <KpiCards
        items={[
          { title: "Projets actifs", value: stats.activeProjectCount, icon: FolderKanban },
          { title: "Documents", value: stats.documentCount, icon: FileText },
          { title: "Tâches ouvertes", value: stats.openTaskCount, icon: ListChecks },
          { title: "Analyses IA", value: stats.aiSearchCount, icon: Brain },
        ]}
      />

      <DashboardQuickActions />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <DashboardSection
            title="Projets récents"
            description="Reprenez là où vous vous êtes arrêté."
            actionHref="/dashboard/projects"
            actionLabel="Tous les projets"
          >
            {!recent.length ? (
              <EmptyState
                icon={FolderKanban}
                title="Aucun projet récent"
                description="Créez votre premier dossier pour démarrer le parcours PI."
                className="rounded-none border-0 bg-transparent py-10"
                action={
                  <Button size="sm" asChild>
                    <Link href="/dashboard/projects/new">
                      <Plus className="mr-1.5 h-4 w-4" />
                      Créer un projet
                    </Link>
                  </Button>
                }
              />
            ) : (
              <ProjectTable projects={recent} embedded />
            )}
          </DashboardSection>
        </div>

        <aside className="space-y-6">
          <HolderOnboarding projectCount={stats.projectCount} />
          <IpDeadlinesPanel deadlines={ipDeadlines} viewer="holder" compact />
        </aside>
      </div>
    </div>
  );
}
