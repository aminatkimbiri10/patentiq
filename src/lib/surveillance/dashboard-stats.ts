import type { WatchAlertRow, WatchlistRow } from "@/lib/actions/watchlist";
import type { TechWatchRow } from "@/lib/surveillance/tech-watch-runner";
import type { StatBar } from "@/components/dashboard/stat-bar-list";

export type SurveillanceStats = {
  activeAlerts: number;
  criticalAlerts: number;
  newToday: number;
  watchedAssets: number;
  activeWatchCount: number;
  techWatchCount: number;
  pausedCount: number;
  lastUpdated: string | null;
  severityChart: StatBar[];
  categoryChart: StatBar[];
};

function maxDate(dates: (string | null | undefined)[]): string | null {
  const valid = dates.filter(Boolean).map((d) => new Date(d as string).getTime());
  if (!valid.length) return null;
  return new Date(Math.max(...valid)).toISOString();
}

export function computeSurveillanceStats(
  items: WatchlistRow[],
  alerts: WatchAlertRow[],
  techWatch: TechWatchRow[]
): SurveillanceStats {
  const openAlerts = alerts.filter((a) => a.status === "new");
  const criticalAlerts = openAlerts.filter((a) => (a.similarity_score ?? 0) >= 0.85).length;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const newToday = alerts.filter((a) => new Date(a.created_at) >= todayStart).length;

  const activeWatchCount = items.filter((i) => i.surveillance_active).length;
  const pausedCount = items.length - activeWatchCount;

  const severityBuckets = {
    critical: openAlerts.filter((a) => (a.similarity_score ?? 0) >= 0.85).length,
    high: openAlerts.filter((a) => {
      const s = a.similarity_score ?? 0;
      return s >= 0.7 && s < 0.85;
    }).length,
    medium: openAlerts.filter((a) => {
      const s = a.similarity_score ?? 0;
      return s >= 0.5 && s < 0.7;
    }).length,
    low: openAlerts.filter((a) => (a.similarity_score ?? 0) < 0.5).length,
  };

  const severityChart: StatBar[] = [
    { key: "critical", label: "Critique (≥85 %)", value: severityBuckets.critical },
    { key: "high", label: "Élevée (70–84 %)", value: severityBuckets.high },
    { key: "medium", label: "Moyenne (50–69 %)", value: severityBuckets.medium },
    { key: "low", label: "Faible (<50 %)", value: severityBuckets.low },
  ].filter((b) => b.value > 0);

  const categoryCounts: Record<string, number> = {};
  for (const item of items) {
    categoryCounts[item.asset_type] = (categoryCounts[item.asset_type] ?? 0) + 1;
  }
  const categoryLabels: Record<string, string> = {
    trademark: "Marques",
    patent: "Brevets",
    design: "Dessins & modèles",
  };
  const categoryChart: StatBar[] = Object.entries(categoryCounts).map(([key, value]) => ({
    key,
    label: categoryLabels[key] ?? key,
    value,
  }));

  const lastUpdated = maxDate([
    ...items.map((i) => i.last_scan_at),
    alerts[0]?.created_at,
    techWatch[0]?.last_scan_at,
  ]);

  return {
    activeAlerts: openAlerts.length,
    criticalAlerts,
    newToday,
    watchedAssets: items.length,
    activeWatchCount,
    techWatchCount: techWatch.length,
    pausedCount,
    lastUpdated,
    severityChart,
    categoryChart,
  };
}

export type SurveillanceActivityItem = {
  id: string;
  kind: "alert" | "scan" | "tech_watch";
  title: string;
  body: string | null;
  created_at: string;
  severity?: "critical" | "high" | "medium" | "low";
};

export function buildSurveillanceActivity(
  items: WatchlistRow[],
  alerts: WatchAlertRow[],
  techWatch: TechWatchRow[],
  limit = 12
): SurveillanceActivityItem[] {
  const events: SurveillanceActivityItem[] = [];

  for (const alert of alerts.slice(0, 20)) {
    const score = alert.similarity_score ?? 0;
    events.push({
      id: `alert-${alert.id}`,
      kind: "alert",
      title: alert.matched_title,
      body: alert.ip_watchlist
        ? `Similarité OMPIC · ${alert.ip_watchlist.title}`
        : alert.summary,
      created_at: alert.created_at,
      severity:
        score >= 0.85 ? "critical" : score >= 0.7 ? "high" : score >= 0.5 ? "medium" : "low",
    });
  }

  for (const item of items) {
    if (!item.last_scan_at) continue;
    events.push({
      id: `scan-${item.id}`,
      kind: "scan",
      title: `Scan OMPIC — ${item.title}`,
      body: item.surveillance_active ? "Surveillance active" : "Actif en pause",
      created_at: item.last_scan_at,
    });
  }

  for (const tw of techWatch) {
    if (!tw.last_scan_at) continue;
    events.push({
      id: `tw-${tw.id}`,
      kind: "tech_watch",
      title: `Veille — ${tw.title}`,
      body: tw.keywords,
      created_at: tw.last_scan_at,
    });
  }

  return events
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}
