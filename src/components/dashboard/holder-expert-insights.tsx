import { FlaskConical, AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import type { ExpertRecommendationRow } from "@/components/cpi/expert-recommendations-panel";

const FEASIBILITY_LABELS: Record<string, string> = {
  high: "Bonne faisabilité technique",
  medium: "Faisabilité à confirmer",
  low: "Faisabilité limitée",
  unknown: "Analyse en cours",
};

const RECO_LABELS: Record<string, { label: string; variant: "default" | "outline" | "destructive" }> = {
  proceed: { label: "Parcours favorable", variant: "default" },
  caution: { label: "Points de vigilance", variant: "outline" },
  reject: { label: "À revoir en profondeur", variant: "destructive" },
};

export function HolderExpertInsights({
  recommendations,
}: {
  recommendations: ExpertRecommendationRow[];
}) {
  if (!recommendations.length) return null;

  const latest = recommendations[0];
  const meta = latest.metadata ?? {};
  const feasibility = meta.feasibility
    ? FEASIBILITY_LABELS[meta.feasibility] ?? meta.feasibility
    : null;
  const reco = meta.recommendation
    ? RECO_LABELS[meta.recommendation] ?? { label: meta.recommendation, variant: "outline" as const }
    : null;

  const Icon =
    meta.recommendation === "proceed"
      ? CheckCircle2
      : meta.recommendation === "reject"
        ? AlertTriangle
        : HelpCircle;

  return (
    <section className="card-elevated space-y-4 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <FlaskConical className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold">Points d&apos;attention (expert)</h2>
          <p className="text-xs text-muted-foreground">
            Synthèse accessible — votre CPI détaille les suites à donner.
            {latest.profiles?.full_name && ` · ${latest.profiles.full_name}`}
            {" · "}
            {formatDistanceToNow(new Date(latest.created_at), { addSuffix: true, locale: fr })}
          </p>
        </div>
        <Icon className="h-5 w-5 shrink-0 text-primary opacity-80" />
      </div>

      <div className="flex flex-wrap gap-2">
        {feasibility && <Badge variant="secondary">{feasibility}</Badge>}
        {reco && <Badge variant={reco.variant}>{reco.label}</Badge>}
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
        {latest.body}
      </p>

      {meta.risks && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm">
          <p className="font-medium text-amber-800 dark:text-amber-400">Risques identifiés</p>
          <p className="mt-1 text-muted-foreground">{meta.risks}</p>
        </div>
      )}

      {recommendations.length > 1 && (
        <p className="text-xs text-muted-foreground">
          + {recommendations.length - 1} autre(s) avis expert sur ce dossier.
        </p>
      )}
    </section>
  );
}
