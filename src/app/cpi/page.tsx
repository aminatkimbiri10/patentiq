import { requireUser } from "@/lib/auth/require-user";
import { getCpiProjects } from "@/lib/cpi/queries";
import { getDashboardOverview } from "@/lib/dashboard/overview-data";
import { listIpDeadlinesForUser } from "@/lib/actions/ip-deadlines";
import { IpDeadlinesPanel } from "@/components/surveillance/ip-deadlines-panel";
import { CpiOnboarding } from "@/components/cpi/cpi-onboarding";
import { StaleCasesAlert } from "@/components/cpi/stale-cases-alert";
import { RoleDashboardOverview } from "@/components/dashboard/overview/role-dashboard-overview";
import type { Project } from "@/types/database";

export const metadata = { title: "Espace CPI" };

const STALE_DAYS = 7;

export default async function CpiDashboardPage() {
  const ctx = await requireUser();
  const [overview, projects, ipDeadlines] = await Promise.all([
    getDashboardOverview(ctx.user.id, "cpi_advisor", ctx.profile ?? undefined),
    getCpiProjects(ctx.user.id),
    listIpDeadlinesForUser(8, ctx.user.id, true),
  ]);

  const staleMs = STALE_DAYS * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const staleProjects = projects.filter(
    (p) =>
      ["awaiting_documents", "expert_review"].includes(p.status) &&
      now - new Date(p.last_activity_at).getTime() > staleMs
  ) as Project[];

  const activeCount = overview.heroHighlights[0]?.value ?? 0;

  return (
    <RoleDashboardOverview
      data={overview}
      config={{
        layout: "home",
        projectsTitle: "Dossiers récents",
        projectsDescription: "Dossiers actifs et en revue.",
        projectsHref: "/cpi/cases",
        projectHrefFor: (id) => `/cpi/cases/${id}`,
        extraBeforeGrid: <StaleCasesAlert projects={staleProjects} />,
        extraSidebar: (
          <>
            <CpiOnboarding activeCaseCount={Number(activeCount)} />
            <IpDeadlinesPanel deadlines={ipDeadlines} viewer="cpi" compact />
          </>
        ),
      }}
    />
  );
}
