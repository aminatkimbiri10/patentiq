import { Eye } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { listWatchAlerts, listWatchlistForUser } from "@/lib/actions/watchlist";
import { listTechWatchForUser } from "@/lib/actions/tech-watch";
import {
  buildSurveillanceActivity,
  computeSurveillanceStats,
} from "@/lib/surveillance/dashboard-stats";
import {
  buildSurveillanceProjects,
  getSurveillanceAiInsights,
} from "@/lib/surveillance/context-data";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardPageFrame } from "@/components/dashboard/dashboard-page-frame";
import { SurveillanceWorkspace } from "@/components/surveillance/workspace/surveillance-workspace";
import { OmpicModeBanner } from "@/components/surveillance/ompic-mode-banner";

export const metadata = { title: "Surveillance PI — CPI" };

export default async function CpiSurveillancePage() {
  const ctx = await requireUser();

  const [items, alerts, techWatch] = await Promise.all([
    listWatchlistForUser(),
    listWatchAlerts(),
    listTechWatchForUser(),
  ]);

  const stats = computeSurveillanceStats(items, alerts, techWatch);
  const activity = buildSurveillanceActivity(items, alerts, techWatch);
  const projects = buildSurveillanceProjects(items, "cpi");
  const projectIds = Array.from(
    new Set(items.map((i) => i.project_id).filter((id): id is string => Boolean(id)))
  );
  const aiInsights = await getSurveillanceAiInsights(projectIds, "cpi");

  return (
    <DashboardPageFrame>
      <PageHeader
        variant="elevated"
        bordered={false}
        icon={Eye}
        eyebrow="Veille PI"
        title="Surveillance & veille"
        description="Portefeuille clients — signaux OMPIC, alertes de similarité et veille technologique."
      />

      <OmpicModeBanner />

      <SurveillanceWorkspace
        items={items}
        alerts={alerts}
        techWatch={techWatch}
        stats={stats}
        activity={activity}
        projects={projects}
        aiInsights={aiInsights}
        role={ctx.primaryRole ?? "cpi_advisor"}
        variant="cpi"
      />
    </DashboardPageFrame>
  );
}
