import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { listIpDeadlinesForUser } from "@/lib/actions/ip-deadlines";
import { getDashboardOverview } from "@/lib/dashboard/overview-data";
import { IpDeadlinesPanel } from "@/components/surveillance/ip-deadlines-panel";
import { HolderOnboarding } from "@/components/dashboard/holder-onboarding";
import { RoleDashboardOverview } from "@/components/dashboard/overview/role-dashboard-overview";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Tableau de bord" };

export default async function DashboardPage() {
  const ctx = await requireUser();
  const [overview, ipDeadlines] = await Promise.all([
    getDashboardOverview(ctx.user.id, "project_holder", ctx.profile ?? undefined),
    listIpDeadlinesForUser(5, ctx.user.id, false),
  ]);

  return (
    <RoleDashboardOverview
      data={overview}
      config={{
        layout: "home",
        projectsTitle: "Projets récents",
        projectsDescription: "Vos dossiers actifs.",
        projectsHref: "/dashboard/projects",
        projectHrefFor: (id) => `/dashboard/projects/${id}`,
        headerAction: (
          <Button asChild>
            <Link href="/dashboard/projects/new">
              <Plus className="mr-1.5 h-4 w-4" />
              Nouveau projet
            </Link>
          </Button>
        ),
        extraSidebar: (
          <>
            {overview.projectCount === 0 && (
              <HolderOnboarding projectCount={overview.projectCount} />
            )}
            <IpDeadlinesPanel deadlines={ipDeadlines} viewer="holder" compact />
          </>
        ),
      }}
    />
  );
}
