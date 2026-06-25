import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Brain, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { EmptyState } from "@/components/shared/empty-state";
import type { DashboardAiInsight } from "@/lib/dashboard/overview-data";
import type { AppRole } from "@/types/roles";

const STATUS_LABEL: Record<string, string> = {
  pending: "En file",
  processing: "En cours",
  completed: "Terminé",
  failed: "Échec",
  cancelled: "Annulé",
};

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "completed") return "default";
  if (status === "failed") return "destructive";
  if (status === "processing") return "secondary";
  return "outline";
}

export function AiInsightsPanel({
  insights,
  role,
}: {
  insights: DashboardAiInsight[];
  role: AppRole;
}) {
  const askHref =
    role === "cpi_advisor"
      ? "/cpi/cases"
      : role === "expert"
        ? "/expert/analysis"
        : "/dashboard/search";

  const prompts =
    role === "expert"
      ? ["Analyser la revue expert", "Comparer l'état de l'art"]
      : role === "cpi_advisor"
        ? ["Prioriser les dossiers", "Synthèse portefeuille"]
        : ["Recherche de nouveauté", "Liberté d'exploitation", "Résumer un document"];

  return (
    <DashboardSection
      title="Insights IA"
      description="Analyses récentes et recommandations"
      icon={Brain}
      actionHref={askHref}
      actionLabel="Toutes les analyses"
    >
      {!insights.length ? (
        <EmptyState
          icon={Brain}
          title="Aucune analyse IA"
          description="Lancez une recherche depuis un dossier ou la page Recherche."
          className="rounded-none border-0 bg-transparent py-10"
          action={
            <Link
              href={askHref}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Démarrer une analyse
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
      ) : (
        <ul className="divide-y divide-border/60">
          {insights.map((item) => (
            <li key={item.id} className="group px-4 py-4 transition-colors hover:bg-muted/20">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{item.searchTypeLabel}</p>
                    <Badge variant={statusVariant(item.status)} className="text-[10px]">
                      {item.status === "processing" && (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      )}
                      {STATUS_LABEL[item.status] ?? item.status}
                    </Badge>
                    {item.score != null && (
                      <span className="text-xs tabular-nums text-muted-foreground">
                        Confiance {Math.round(item.score * 100)}%
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.projectTitle}</p>
                  {item.summary && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {item.summary}
                    </p>
                  )}
                  {item.status === "failed" && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Analyse interrompue — relancez depuis le dossier.
                    </p>
                  )}
                </div>
                <Link
                  href={item.href}
                  className="shrink-0 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100 hover:underline"
                >
                  Voir
                </Link>
              </div>
              <time className="mt-2 block text-[11px] text-muted-foreground">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: fr })}
              </time>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-border/60 bg-muted/15 px-4 py-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Suggestions rapides</p>
        <div className="flex flex-wrap gap-2">
          {prompts.map((p) => (
            <Link
              key={p}
              href={askHref}
              className="rounded-full border border-border/60 bg-card px-3 py-1 text-xs text-foreground transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              {p}
            </Link>
          ))}
        </div>
      </div>
    </DashboardSection>
  );
}
