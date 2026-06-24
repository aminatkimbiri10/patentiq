import { Eye } from "lucide-react";

export const maxDuration = 60;
import { requireUser } from "@/lib/auth/require-user";
import { listWatchAlerts, listWatchlistForUser } from "@/lib/actions/watchlist";
import { listTechWatchForUser } from "@/lib/actions/tech-watch";
import { PageHeader } from "@/components/shared/page-header";
import { SurveillanceDashboard } from "@/components/surveillance/surveillance-dashboard";
import { WatchlistForm } from "@/components/surveillance/watchlist-form";
import { WatchlistCsvImport } from "@/components/surveillance/watchlist-csv-import";
import { WatchlistTable } from "@/components/surveillance/watchlist-table";
import { WatchAlertsPanel } from "@/components/surveillance/watch-alerts-panel";
import { OmpicTrademarkSearchPanel } from "@/components/surveillance/ompic-trademark-search-panel";
import { TechWatchForm, TechWatchList } from "@/components/surveillance/tech-watch-panel";
import { OmpicModeBanner } from "@/components/surveillance/ompic-mode-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Surveillance PI" };

export default async function DashboardSurveillancePage() {
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
        title="Surveillance"
        description="Portefeuille OMPIC/EPO, alertes de similarité et veille continue."
      />

      <OmpicModeBanner />

      <SurveillanceDashboard
        items={items}
        alerts={alerts}
        techWatch={techWatch}
        portefeuille={
          <>
            <OmpicTrademarkSearchPanel />
            <Card className="card-elevated border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ajouter un actif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <WatchlistForm />
                <WatchlistCsvImport />
              </CardContent>
            </Card>
            <Card className="card-elevated border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Actifs surveillés</CardTitle>
              </CardHeader>
              <CardContent>
                <WatchlistTable items={items} />
              </CardContent>
            </Card>
          </>
        }
        alertes={
          <Card className="card-elevated border-0">
            <CardContent className="pt-6">
              <WatchAlertsPanel alerts={alerts} />
            </CardContent>
          </Card>
        }
        veille={
          <>
            <Card className="card-elevated border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Nouvelle veille</CardTitle>
              </CardHeader>
              <CardContent>
                <TechWatchForm />
              </CardContent>
            </Card>
            <Card className="card-elevated border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Veilles actives</CardTitle>
              </CardHeader>
              <CardContent>
                <TechWatchList items={techWatch} />
              </CardContent>
            </Card>
          </>
        }
      />
    </div>
  );
}
