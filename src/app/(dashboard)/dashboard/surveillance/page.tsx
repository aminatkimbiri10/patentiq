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

export const metadata = { title: "Surveillance PI" };
export const maxDuration = 60;

export default async function DashboardSurveillancePage() {
  const ctx = await requireUser();

  const [items, alerts, techWatch] = await Promise.all([
    listWatchlistForUser(),
    listWatchAlerts(),
    listTechWatchForUser(),
  ]);

  const stats = computeSurveillanceStats(items, alerts, techWatch);
  const activity = buildSurveillanceActivity(items, alerts, techWatch);
  const projects = buildSurveillanceProjects(items, "holder");
  const projectIds = Array.from(
    new Set(items.map((i) => i.project_id).filter((id): id is string => Boolean(id)))
  );
  const aiInsights = await getSurveillanceAiInsights(projectIds, "holder");

  return (
    <DashboardPageFrame>
      <PageHeader
        variant="elevated"
        bordered={false}
        icon={Eye}
        eyebrow="Veille PI"
        title="Surveillance"
        description="Signaux OMPIC, alertes de similarité et veille technologique — priorisez les actions à mener."
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
        role={ctx.primaryRole ?? "project_holder"}
        variant="holder"
      />
    </DashboardPageFrame>
  );
}
