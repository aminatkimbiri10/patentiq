import { requireUser } from "@/lib/auth/require-user";
import { getDashboardOverview } from "@/lib/dashboard/overview-data";
import { RoleDashboardOverview } from "@/components/dashboard/overview/role-dashboard-overview";

export const metadata = { title: "Expert" };

export default async function ExpertDashboardPage() {
  const ctx = await requireUser();
  const overview = await getDashboardOverview(ctx.user.id, "expert", ctx.profile ?? undefined);

  return (
    <RoleDashboardOverview
      data={overview}
      config={{
        layout: "home",
        projectsTitle: "Dossiers en revue expert",
        projectsDescription: "Priorisez les analyses en attente.",
        projectsHref: "/expert/assigned-projects",
        projectHrefFor: (id) => `/expert/projects/${id}`,
        showDocuments: true,
      }}
    />
  );
}
