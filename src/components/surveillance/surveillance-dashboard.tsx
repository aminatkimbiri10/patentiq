"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { WatchAlertRow, WatchlistRow } from "@/lib/actions/watchlist";
import type { TechWatchRow } from "@/lib/surveillance/tech-watch-runner";

type SurveillanceDashboardProps = {
  items: WatchlistRow[];
  alerts: WatchAlertRow[];
  techWatch: TechWatchRow[];
  portefeuille: React.ReactNode;
  alertes: React.ReactNode;
  veille: React.ReactNode;
};

export function SurveillanceDashboard({
  items,
  alerts,
  techWatch,
  portefeuille,
  alertes,
  veille,
}: SurveillanceDashboardProps) {
  const newAlerts = alerts.filter((a) => a.status === "new").length;
  const defaultTab = newAlerts > 0 ? "alertes" : "portefeuille";

  return (
    <Tabs defaultValue={defaultTab} className="space-y-4">
      <TabsList className="grid h-auto w-full grid-cols-3 gap-1 p-1">
        <TabsTrigger value="portefeuille" className="gap-1.5 py-2 text-xs sm:text-sm">
          Portefeuille
          {items.length > 0 && (
            <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-[10px]">
              {items.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="alertes" className="gap-1.5 py-2 text-xs sm:text-sm">
          Alertes
          {newAlerts > 0 ? (
            <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-[10px]">
              {newAlerts}
            </Badge>
          ) : alerts.length > 0 ? (
            <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-[10px]">
              {alerts.length}
            </Badge>
          ) : null}
        </TabsTrigger>
        <TabsTrigger value="veille" className="gap-1.5 py-2 text-xs sm:text-sm">
          Veille
          {techWatch.length > 0 && (
            <Badge variant="secondary" className="h-5 min-w-5 px-1.5 text-[10px]">
              {techWatch.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="portefeuille" className="mt-0 space-y-4 focus-visible:outline-none">
        {portefeuille}
      </TabsContent>

      <TabsContent value="alertes" className="mt-0 focus-visible:outline-none">
        {alertes}
      </TabsContent>

      <TabsContent value="veille" className="mt-0 space-y-4 focus-visible:outline-none">
        {veille}
      </TabsContent>
    </Tabs>
  );
}
