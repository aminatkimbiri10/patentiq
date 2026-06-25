"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
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
import { cn } from "@/lib/utils/cn";

const OPEN_PAGE_SIZE = 5;
const OPEN_PAGE_STEP = 10;

function alertSeverity(score: number | null): "critical" | "high" | "medium" | "low" {
  const s = score ?? 0;
  if (s >= 0.85) return "critical";
  if (s >= 0.7) return "high";
  if (s >= 0.5) return "medium";
  return "low";
}

const SEVERITY_BORDER: Record<ReturnType<typeof alertSeverity>, string> = {
  critical: "border-l-destructive",
  high: "border-l-amber-500",
  medium: "border-l-muted-foreground/40",
  low: "border-l-border",
};

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

function AlertDetails({
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
    <div className="space-y-3 border-t border-border/40 bg-muted/10 px-4 py-3">
      {alert.ip_watchlist && (
        <p className="text-xs text-muted-foreground">
          Votre actif : <strong>{alert.ip_watchlist.title}</strong>
          {alert.matched_ref && ` · Réf. OMPIC ${alert.matched_ref}`}
        </p>
      )}
      {alert.summary && (
        <p className="text-sm leading-relaxed text-muted-foreground">{alert.summary}</p>
      )}

      {isNew && <OppositionHint alert={alert} />}
      <OppositionDossierPanel alert={alert} />

      {isNew && (
        <div className="space-y-2 pt-1">
          <p className="text-xs font-medium text-muted-foreground">Que faire de cette alerte ?</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(IP_ALERT_ACTIONS) as Array<keyof typeof IP_ALERT_ACTIONS>).map((key) => {
              const action = IP_ALERT_ACTIONS[key];
              return (
                <Button
                  key={key}
                  size="sm"
                  variant={action.variant}
                  disabled={pending}
                  onClick={() => onStatus(alert.id, key)}
                >
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function AlertRow({
  alert,
  expanded,
  pending,
  onToggle,
  onStatus,
}: {
  alert: WatchAlertRow;
  expanded: boolean;
  pending: boolean;
  onToggle: () => void;
  onStatus: (id: string, status: WatchAlertRow["status"]) => void;
}) {
  const isNew = alert.status === "new";
  const severity = alertSeverity(alert.similarity_score);
  const scorePct =
    alert.similarity_score != null ? Math.round(Number(alert.similarity_score) * 100) : null;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border/60 bg-card",
        isNew && severity === "critical" && "ring-1 ring-destructive/20",
        expanded && "shadow-sm"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex w-full items-start gap-3 border-l-[3px] px-3 py-2.5 text-left transition-colors hover:bg-muted/30 sm:items-center sm:py-2",
          SEVERITY_BORDER[severity]
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-medium text-foreground">{alert.matched_title}</span>
            {scorePct != null && (
              <Badge
                variant={severity === "critical" ? "destructive" : "secondary"}
                className="h-5 px-1.5 text-[10px] tabular-nums"
              >
                {scorePct} %
              </Badge>
            )}
            {!isNew && (
              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                {IP_ALERT_STATUS_LABELS[alert.status]}
              </Badge>
            )}
            {alert.ip_watchlist && (
              <Badge variant="outline" className="hidden h-5 px-1.5 text-[10px] sm:inline-flex">
                {IP_ASSET_TYPE_LABELS[alert.ip_watchlist.asset_type]}
              </Badge>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {alert.ip_watchlist?.title ?? alert.matched_source}
            {alert.matched_ref && ` · ${alert.matched_ref}`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <time className="hidden text-[11px] tabular-nums text-muted-foreground sm:block">
            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true, locale: fr })}
          </time>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              expanded && "rotate-180"
            )}
          />
        </div>
      </button>

      {expanded && (
        <AlertDetails alert={alert} pending={pending} onStatus={onStatus} />
      )}
    </div>
  );
}

function sortByPriority(alerts: WatchAlertRow[]): WatchAlertRow[] {
  return [...alerts].sort(
    (a, b) => (b.similarity_score ?? 0) - (a.similarity_score ?? 0)
  );
}

export function WatchAlertsPanel({ alerts }: { alerts: WatchAlertRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showHistory, setShowHistory] = useState(false);
  const [visibleOpenCount, setVisibleOpenCount] = useState(OPEN_PAGE_SIZE);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { open, history } = useMemo(() => {
    const o = sortByPriority(alerts.filter((a) => a.status === "new"));
    const h = sortByPriority(alerts.filter((a) => a.status !== "new"));
    return { open: o, history: h };
  }, [alerts]);

  const visibleOpen = open.slice(0, visibleOpenCount);
  const hiddenOpenCount = open.length - visibleOpen.length;

  function handleStatus(id: string, status: WatchAlertRow["status"]) {
    startTransition(async () => {
      const result = await updateAlertStatus(id, status);
      notifyActionResult(result);
      if (result.success) {
        setExpandedId(null);
        router.refresh();
      }
    });
  }

  function toggleExpanded(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  if (!alerts.length) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Aucune alerte"
        description="Lancez un scan depuis le portefeuille pour détecter des similarités OMPIC."
        className="py-10"
        action={
          <p className="text-sm text-muted-foreground">
            Ajoutez d&apos;abord un actif protégé, puis cliquez sur <strong>Scanner OMPIC</strong>.
          </p>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {open.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {open.length} à traiter
              {open.length > OPEN_PAGE_SIZE && (
                <span className="font-normal text-muted-foreground">
                  · {visibleOpen.length} affichée{visibleOpen.length !== 1 ? "s" : ""}
                </span>
              )}
            </p>
            {expandedId && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setExpandedId(null)}
              >
                Tout replier
              </Button>
            )}
          </div>

          <div className="space-y-1.5">
            {visibleOpen.map((alert) => (
              <AlertRow
                key={alert.id}
                alert={alert}
                expanded={expandedId === alert.id}
                pending={pending}
                onToggle={() => toggleExpanded(alert.id)}
                onStatus={handleStatus}
              />
            ))}
          </div>

          {hiddenOpenCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() =>
                setVisibleOpenCount((n) => Math.min(n + OPEN_PAGE_STEP, open.length))
              }
            >
              Afficher {Math.min(hiddenOpenCount, OPEN_PAGE_STEP)} alerte
              {Math.min(hiddenOpenCount, OPEN_PAGE_STEP) !== 1 ? "s" : ""} de plus
              {hiddenOpenCount > OPEN_PAGE_STEP && ` (${hiddenOpenCount} restantes)`}
            </Button>
          )}

          {visibleOpenCount > OPEN_PAGE_SIZE && hiddenOpenCount === 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => setVisibleOpenCount(OPEN_PAGE_SIZE)}
            >
              Réduire la liste
            </Button>
          )}
        </div>
      )}

      {open.length === 0 && history.length > 0 && (
        <p className="text-sm text-green-700 dark:text-green-400">
          Toutes les alertes ont été traitées.
        </p>
      )}

      {history.length > 0 && (
        <div className="pt-1">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/40"
            onClick={() => setShowHistory((v) => !v)}
          >
            <span>Historique ({history.length})</span>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", showHistory && "rotate-180")}
            />
          </button>
          {showHistory && (
            <div className="mt-2 max-h-80 space-y-1.5 overflow-y-auto">
              {history.map((alert) => (
                <AlertRow
                  key={alert.id}
                  alert={alert}
                  expanded={expandedId === alert.id}
                  pending={pending}
                  onToggle={() => toggleExpanded(alert.id)}
                  onStatus={handleStatus}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
