import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";

type RecommendationMeta = {
  feasibility?: string;
  recommendation?: string;
  risks?: string | null;
};

const FEASIBILITY: Record<string, string> = {
  high: "Faisabilité élevée",
  medium: "Modérée",
  low: "Faible",
  unknown: "À approfondir",
};

const RECO: Record<string, string> = {
  proceed: "Favorable",
  caution: "Réserves",
  reject: "Défavorable",
};

export function ExpertRecommendationCard({
  projectId,
  projectTitle,
  referenceCode,
  body,
  createdAt,
  authorName,
  metadata,
}: {
  projectId: string;
  projectTitle: string;
  referenceCode: string | null;
  body: string;
  createdAt: string;
  authorName: string | null;
  metadata: RecommendationMeta;
}) {
  const feasibility = metadata.feasibility
    ? FEASIBILITY[metadata.feasibility] ?? metadata.feasibility
    : null;
  const reco = metadata.recommendation
    ? RECO[metadata.recommendation] ?? metadata.recommendation
    : null;

  return (
    <article className="card-elevated p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{referenceCode ?? projectId.slice(0, 8)}</p>
          <Link
            href={`/expert/projects/${projectId}`}
            className="group mt-1 flex items-center gap-1 font-semibold hover:text-primary"
          >
            {projectTitle}
            <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            {authorName ?? "Expert"} ·{" "}
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: fr })}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-1.5 justify-end">
          {feasibility && <Badge variant="secondary">{feasibility}</Badge>}
          {reco && (
            <Badge
              variant={
                metadata.recommendation === "proceed"
                  ? "default"
                  : metadata.recommendation === "reject"
                    ? "destructive"
                    : "outline"
              }
            >
              {reco}
            </Badge>
          )}
        </div>
      </div>
      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{body}</p>
      {metadata.risks && (
        <p className="mt-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Risques : </span>
          {metadata.risks}
        </p>
      )}
    </article>
  );
}
