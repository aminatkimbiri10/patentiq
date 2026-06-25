import { BarChart3 } from "lucide-react";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { StatBarList, type StatBar } from "@/components/dashboard/stat-bar-list";

export function AnalyticsPanel({
  title = "Répartition par statut",
  description = "Vue portefeuille en un coup d'œil",
  items,
  emptyLabel = "Aucun dossier actif",
}: {
  title?: string;
  description?: string;
  items: StatBar[];
  emptyLabel?: string;
}) {
  return (
    <DashboardSection title={title} description={description} icon={BarChart3}>
      <div className="p-5">
        <StatBarList items={items} emptyLabel={emptyLabel} barClassName="bg-gradient-to-r from-primary to-cyan-500/80" />
      </div>
    </DashboardSection>
  );
}
