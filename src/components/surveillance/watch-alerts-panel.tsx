"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronDown, Scale } from "lucide-react";
import { updateAlertStatus, type WatchAlertRow } from "@/lib/actions/watchlist";
import { notifyActionResult } from "@/hooks/use-action-toast";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OppositionDossierPanel } from "@/components/surveillance/opposition-dossier-panel";
import {
  IP_ALERT_ACTIONS,
  IP_ALERT_STATUS_LABELS,
  IP_ASSET_TYPE_LABELS,
} from "@/types/surveillance";

function OppositionHint({ alert }: { alert: WatchAlertRow }) {
  const assetType = alert.ip_watchlist?.asset_type;

  if (assetType === "patent") {
    return (
      <p className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
        Veille brevet : dépôt similaire détecté — à analyser avec le CPI (publication ~18 mois).
      </p>
    );
  }

  if (assetType === "design") {
    return (
      <div className="flex gap-2 rounded-md border border-violet-200 bg-violet-50 px-3 py-2 text-xs dark:border-violet-900 dark:bg-violet-950/40">
        <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-700 dark:text-violet-400" />
        <div className="space-y-1 text-violet-900 dark:text-violet-100">
          <p className="font-medium">Dessin &amp; modèle — similarité d&apos;apparence détectée</p>
          <p>Comparez les vues du produit avec le CPI — fenêtre d&apos;opposition selon publication OMPIC.</p>
        </div>
      </div>
    );
  }

  if (assetType !== "trademark") return null;

  const endAt = alert.metadata?.publication_end_at;

  return (
    <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs dark:border-amber-900 dark:bg-amber-950/40">
      <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-400" />
      <div className="space-y-1 text-amber-900 dark:text-amber-100">
        <p className="font-medium">Marque — fenêtre opposition (~2 mois après publication OMPIC)</p>
        {endAt && (
          <p>Fin publication estimée : {new Date(endAt).toLocaleDateString("fr-FR")}</p>
        )}
      </div>
    </div>
  );
}

function AlertCard({
  alert,
  pending,
  onStatus,
}: {
  alert: WatchAlertRow;
  pending: boolean;
  onStatus: (id: string, status: WatchAlertRow["status"]) => void;
}) {
  const isNew = alert.status === "new";

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 ${
        isNew ? "border-amber-300/60 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-950/20" : "border-border/60 bg-card"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{alert.matched_title}</span>
        <Badge variant={isNew ? "destructive" : "secondary"}>
          {IP_ALERT_STATUS_LABELS[alert.status]}
        </Badge>
        {alert.ip_watchlist && (
          <Badge variant="outline">{IP_ASSET_TYPE_LABELS[alert.ip_watchlist.asset_type]}</Badge>
        )}
        {alert.similarity_score != null && (
          <span className="text-xs text-muted-foreground">
            {Math.round(Number(alert.similarity_score) * 100)} % similarité
            {alert.metadata?.logo_score != null && (
              <> · visuel {Math.round(Number(alert.metadata.logo_score) * 100)} %</>
            )}
          </span>
        )}
      </div>

      {alert.ip_watchlist && (
        <p className="text-xs text-muted-foreground">
          Votre actif : <strong>{alert.ip_watchlist.title}</strong>
          {alert.matched_ref && ` · Réf. OMPIC ${alert.matched_ref}`}
        </p>
      )}
      {alert.summary && (
        <p className="line-clamp-2 text-sm text-muted-foreground">{alert.summary}</p>
      )}

      {isNew && <OppositionHint alert={alert} />}

      <OppositionDossierPanel alert={alert} />

      {isNew && (
        <div className="space-y-2 border-t border-border/40 pt-3">
          <p className="text-xs font-medium text-muted-foreground">Que faire de cette alerte ?</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(IP_ALERT_ACTIONS) as Array<keyof typeof IP_ALERT_ACTIONS>).map(
              (key) => {
                const action = IP_ALERT_ACTIONS[key];
                return (
                  <Button
                    key={key}
                    size="sm"
                    variant={action.variant}
                    disabled={pending}
                    className="h-auto flex-col items-start gap-0.5 px-3 py-2 text-left whitespace-normal"
                    onClick={() => onStatus(alert.id, key)}
                  >
                    <span className="font-medium">{action.label}</span>
                    <span className="text-[10px] font-normal opacity-80">{action.hint}</span>
                  </Button>
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function WatchAlertsPanel({ alerts }: { alerts: WatchAlertRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showHistory, setShowHistory] = useState(false);

  const { open, history } = useMemo(() => {
    const o = alerts.filter((a) => a.status === "new");
    const h = alerts.filter((a) => a.status !== "new");
    return { open: o, history: h };
  }, [alerts]);

  function handleStatus(id: string, status: WatchAlertRow["status"]) {
    startTransition(async () => {
      const result = await updateAlertStatus(id, status);
      notifyActionResult(result);
      if (result.success) router.refresh();
    });
  }

  if (!alerts.length) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Aucune alerte"
        description="Lancez un scan depuis l'onglet Portefeuille pour détecter des similarités OMPIC."
        className="py-12"
        action={
          <p className="text-sm text-muted-foreground">
            Ajoutez d&apos;abord un actif protégé, puis cliquez sur <strong>Scanner OMPIC</strong>.
          </p>
        }
      />
    );
  }

  const historyPreview = showHistory || history.length <= 3 ? history : history.slice(0, 3);

  return (
    <div className="space-y-4">
      {open.length > 0 && (
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" />
            {open.length} alerte(s) à traiter
          </p>
          {open.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              pending={pending}
              onStatus={handleStatus}
            />
          ))}
        </div>
      )}

      {open.length === 0 && history.length > 0 && (
        <p className="text-sm text-green-700 dark:text-green-400">
          Toutes les alertes ont été traitées.
        </p>
      )}

      {history.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/40"
            onClick={() => setShowHistory((v) => !v)}
          >
            <span>Historique ({history.length})</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showHistory ? "rotate-180" : ""}`}
            />
          </button>
          {(showHistory || history.length <= 3 || historyPreview.length > 0) && (
            <div className="space-y-2">
              {historyPreview.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  pending={pending}
                  onStatus={handleStatus}
                />
              ))}
              {!showHistory && history.length > 3 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowHistory(true)}
                >
                  Voir {history.length - 3} alerte(s) de plus
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
