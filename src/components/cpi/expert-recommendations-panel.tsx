import { FlaskConical } from "lucide-react";
import { ExpertRecommendationCard } from "@/components/expert/expert-recommendation-card";

export type ExpertRecommendationRow = {
  id: string;
  body: string;
  created_at: string;
  metadata: {
    feasibility?: string;
    recommendation?: string;
    risks?: string | null;
  };
  profiles?: { full_name: string | null } | null;
};

export function ExpertRecommendationsPanel({
  projectId,
  projectTitle,
  referenceCode,
  recommendations,
}: {
  projectId: string;
  projectTitle: string;
  referenceCode: string | null;
  recommendations: ExpertRecommendationRow[];
}) {
  if (recommendations.length === 0) return null;

  return (
    <section
      className="overflow-hidden rounded-lg border bg-card shadow-sm"
      aria-labelledby="expert-reco-heading"
    >
      <div className="border-b border-border/60 px-4 py-3 sm:px-5">
        <h2
          id="expert-reco-heading"
          className="flex items-center gap-2 text-sm font-semibold text-foreground"
        >
          <FlaskConical className="h-4 w-4 text-primary" />
          Avis expert métier
        </h2>
      </div>
      <div className="grid gap-4 p-4 sm:p-5">
        {recommendations.map((r) => (
          <ExpertRecommendationCard
            key={r.id}
            projectId={projectId}
            projectTitle={projectTitle}
            referenceCode={referenceCode}
            body={r.body}
            createdAt={r.created_at}
              authorName={r.profiles?.full_name ?? null}
              metadata={r.metadata}
            />
        ))}
      </div>
    </section>
  );
}
