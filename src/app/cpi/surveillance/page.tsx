import { Eye } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { listWatchAlerts, listWatchlistForUser } from "@/lib/actions/watchlist";
import { listTechWatchForUser } from "@/lib/actions/tech-watch";
import { PageHeader } from "@/components/shared/page-header";
import { SurveillanceDashboard } from "@/components/surveillance/surveillance-dashboard";
import { WatchlistForm } from "@/components/surveillance/watchlist-form";
import { WatchlistCsvImport } from "@/components/surveillance/watchlist-csv-import";
import { WatchlistTable } from "@/components/surveillance/watchlist-table";
import { WatchAlertsPanel } from "@/components/surveillance/watch-alerts-panel";
import { TechWatchForm, TechWatchList } from "@/components/surveillance/tech-watch-panel";
import { OmpicTrademarkSearchPanel } from "@/components/surveillance/ompic-trademark-search-panel";
import { OmpicModeBanner } from "@/components/surveillance/ompic-mode-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Surveillance PI — CPI" };

export default async function CpiSurveillancePage() {
  await requireUser();

  const [items, alerts, techWatch] = await Promise.all([
    listWatchlistForUser(),
    listWatchAlerts(),
    listTechWatchForUser(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Eye}
        title="Surveillance & veille"
        description="Portefeuille clients — OMPIC/EPO, alertes et veille continue."
      />

      <OmpicModeBanner />

      <SurveillanceDashboard
        items={items}
        alerts={alerts}
        techWatch={techWatch}
        portefeuille={
          <Card className="card-elevated border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Portefeuille clients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <OmpicTrademarkSearchPanel />
              <WatchlistForm />
              <WatchlistCsvImport />
              <WatchlistTable items={items} showOwnerProjects />
            </CardContent>
          </Card>
        }
        alertes={
          <Card className="card-elevated border-0">
            <CardContent className="pt-6">
              <WatchAlertsPanel alerts={alerts} />
            </CardContent>
          </Card>
        }
        veille={
          <Card className="card-elevated border-0">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Veille brevets &amp; dessins</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <TechWatchForm />
              <TechWatchList items={techWatch} />
            </CardContent>
          </Card>
        }
      />
    </div>
  );
}
