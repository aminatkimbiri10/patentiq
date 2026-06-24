import { PageHeader } from "@/components/shared/page-header";

import { KpiCards } from "@/components/dashboard/kpi-cards";

import { ProjectTable } from "@/components/dashboard/project-card";

import { DashboardSection } from "@/components/dashboard/dashboard-section";

import { DashboardLinkCard } from "@/components/dashboard/dashboard-link-card";

import { requireUser } from "@/lib/auth/require-user";

import { createClient } from "@/lib/supabase/server";

import { getExpertStats } from "@/lib/expert/stats";

import { FolderKanban, Microscope, ClipboardList } from "lucide-react";

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

    .limit(5);



  const urgentProjects = (urgent ?? []) as Project[];



  return (

    <div className="space-y-6">

      <PageHeader

        icon={Microscope}

        eyebrow="Espace expert"

        title="Expert métier"

        description="Analyses techniques, avis structurés et recommandations pour le CPI."

      />



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

            title: "Recommandations",

            value: stats.recommendationsCount,

            icon: ClipboardList,

          },

        ]}

      />



      {urgentProjects.length > 0 && (

        <DashboardSection title="À traiter en priorité" actionHref="/expert/analysis">

          <ProjectTable

            projects={urgentProjects}

            hrefFor={(id) => `/expert/projects/${id}`}

            embedded

          />

        </DashboardSection>

      )}



      <DashboardSection title="Raccourcis">

        <DashboardLinkCard

          href="/expert/assigned-projects"

          title="Projets assignés"

          description="Tous vos dossiers en cours"

          icon={FolderKanban}

        />

        <DashboardLinkCard

          href="/expert/recommendations"

          title="Mes recommandations"

          description="Avis structurés transmis au CPI"

          icon={ClipboardList}

        />

      </DashboardSection>

    </div>

  );

}

