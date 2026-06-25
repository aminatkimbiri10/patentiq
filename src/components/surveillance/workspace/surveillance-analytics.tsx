import { BarChart3 } from "lucide-react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { StatBarList, type StatBar } from "@/components/dashboard/stat-bar-list";

export function SurveillanceAnalytics({
  severityChart,
  categoryChart,
  embedded = false,
}: {
  severityChart: StatBar[];
  categoryChart: StatBar[];
  embedded?: boolean;
}) {
  const content = (
    <div className="grid gap-6 p-5 lg:grid-cols-2">
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Alertes ouvertes par sévérité
        </p>
        <StatBarList
          items={severityChart}
          emptyLabel="Aucune alerte ouverte"
          barClassName="bg-gradient-to-r from-destructive/90 to-amber-500/80"
        />
      </div>
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Portefeuille par type
        </p>
        <StatBarList
          items={categoryChart}
          emptyLabel="Portefeuille vide"
          barClassName="bg-gradient-to-r from-primary to-cyan-500/80"
        />
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <DashboardSection title="Vue analytique" description="Répartition des signaux" icon={BarChart3}>
      {content}
    </DashboardSection>
  );
}
