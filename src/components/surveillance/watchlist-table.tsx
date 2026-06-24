"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, Loader2, Play, Shield } from "lucide-react";
import {
  runWatchlistScan,
  toggleWatchlistActive,
  type WatchlistRow,
} from "@/lib/actions/watchlist";
import { notifyActionResult } from "@/hooks/use-action-toast";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IP_ASSET_TYPE_LABELS } from "@/types/surveillance";

function PortfolioLogo({ url, title }: { url: string | null; title: string }) {
  if (!url?.startsWith("http")) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-muted text-xs font-medium text-muted-foreground">
        {title.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="h-full w-full object-contain p-1" />
    </div>
  );
}

export function WatchlistTable({
  items,
  showOwnerProjects = false,
}: {
  items: WatchlistRow[];
  showOwnerProjects?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (!items.length) {
    return (
      <EmptyState
        icon={Shield}
        title="Portefeuille vide"
        description="Ajoutez une marque, un brevet ou un dessin & modèle déjà enregistré pour lancer la surveillance OMPIC."
        className="py-12"
        action={
          <p className="text-xs text-muted-foreground">
            Utilisez le formulaire ci-dessus ou lancez une recherche OMPIC.
          </p>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 gap-3">
            <PortfolioLogo url={item.logo_url} title={item.title} />
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{item.title}</span>
                <Badge variant="secondary">{IP_ASSET_TYPE_LABELS[item.asset_type]}</Badge>
                {item.asset_type === "trademark" && item.logo_url?.startsWith("http") && (
                  <Badge variant="outline" className="text-[10px] font-normal">
                    Similarité logo
                  </Badge>
                )}
                {!item.surveillance_active && <Badge variant="outline">Pause</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">
                {item.registration_number && `${item.registration_number} · `}
                {item.territory}
                {item.nice_classes && ` · classes ${item.nice_classes}`}
                {item.registered_at &&
                  ` · enreg. ${new Date(item.registered_at).toLocaleDateString("fr-FR")}`}
              </p>
              {item.summary && (
                <p className="line-clamp-2 text-xs text-muted-foreground">{item.summary}</p>
              )}
              {showOwnerProjects && item.projects && (
                <p className="text-xs text-muted-foreground">
                  Dossier lié : {item.projects.title}
                  {item.projects.reference_code && ` (${item.projects.reference_code})`}
                </p>
              )}
              {item.last_scan_at && (
                <p className="text-xs text-muted-foreground">
                  Dernier scan OMPIC : {new Date(item.last_scan_at).toLocaleString("fr-FR")}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await runWatchlistScan(item.id);
                  notifyActionResult(result);
                  if (result.success) router.refresh();
                })
              }
            >
              {pending ? (
                <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="mr-1 h-3.5 w-3.5" />
              )}
              Scanner OMPIC
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await toggleWatchlistActive(item.id, !item.surveillance_active);
                  notifyActionResult(result);
                  if (result.success) router.refresh();
                })
              }
            >
              <Eye className="mr-1 h-3.5 w-3.5" />
              {item.surveillance_active ? "Pause" : "Reprendre"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
