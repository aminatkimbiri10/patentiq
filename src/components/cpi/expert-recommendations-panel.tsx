import { FlaskConical } from "lucide-react";
import { ExpertRecommendationCard } from "@/components/expert/expert-recommendation-card";
import { EmptyState } from "@/components/shared/empty-state";

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
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold">
        <FlaskConical className="h-5 w-5 text-primary" />
        Avis expert métier
      </h2>
      {recommendations.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="Aucune recommandation expert"
          description="Sollicitez un expert (statut « Revue expert ») pour obtenir une analyse technique structurée."
          className="py-8"
        />
      ) : (
        <div className="grid gap-4">
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
      )}
    </section>
  );
}
