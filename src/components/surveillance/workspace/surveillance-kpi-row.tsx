import {
  AlertTriangle,
  Eye,
  Radar,
  Shield,
  Sparkles,
  PauseCircle,
  CalendarClock,
} from "lucide-react";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import type { SurveillanceStats } from "@/lib/surveillance/dashboard-stats";

export function SurveillanceKpiRow({ stats }: { stats: SurveillanceStats }) {
  return (
    <KpiCards
      columns={4}
      items={[
        {
          title: "Alertes actives",
          value: stats.activeAlerts,
          icon: AlertTriangle,
          hint: stats.criticalAlerts ? `${stats.criticalAlerts} critique(s)` : undefined,
        },
        {
          title: "Signaux du jour",
          value: stats.newToday,
          icon: Sparkles,
          hint: "Nouvelles alertes",
        },
        {
          title: "Actifs surveillés",
          value: stats.activeWatchCount,
          icon: Shield,
          hint:
            stats.pausedCount > 0
              ? `${stats.watchedAssets} total · ${stats.pausedCount} en pause`
              : `${stats.watchedAssets} au portefeuille`,
        },
        {
          title: "Veilles techno",
          value: stats.techWatchCount,
          icon: Radar,
          hint: "Mots-clés actifs",
        },
      ]}
    />
  );
}

export function SurveillanceStatusLine({ stats }: { stats: SurveillanceStats }) {
  const updated = stats.lastUpdated
    ? new Date(stats.lastUpdated).toLocaleString("fr-FR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {updated && (
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5" />
          Dernière activité : {updated}
        </span>
      )}
      <span className="inline-flex items-center gap-1.5">
        <Eye className="h-3.5 w-3.5" />
        {stats.activeWatchCount} actif{stats.activeWatchCount !== 1 ? "s" : ""} sous surveillance
      </span>
      {stats.pausedCount > 0 && (
        <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
          <PauseCircle className="h-3.5 w-3.5" />
          {stats.pausedCount} en pause
        </span>
      )}
    </div>
  );
}
