import { PageHeader } from "@/components/shared/page-header";
import { ExpertRecommendationCard } from "@/components/expert/expert-recommendation-card";
import { EmptyState } from "@/components/shared/empty-state";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { ClipboardList } from "lucide-react";

export const metadata = { title: "Recommandations" };

type RecRow = {
  id: string;
  body: string;
  created_at: string;
  project_id: string;
  metadata: Record<string, unknown>;
  profiles: { full_name: string | null } | { full_name: string | null }[] | null;
  projects: { title: string; reference_code: string | null } | { title: string; reference_code: string | null }[] | null;
};

export default async function ExpertRecommendationsPage() {
  const ctx = await requireUser();
  const supabase = await createClient();

  const { data: projectIds } = await supabase
    .from("projects")
    .select("id")
    .eq("expert_id", ctx.user.id);

  const ids = (projectIds ?? []).map((p) => p.id as string);

  let rows: RecRow[] = [];
  if (ids.length > 0) {
    const { data } = await supabase
      .from("project_comments")
      .select(
        "id, body, created_at, project_id, metadata, profiles(full_name), projects(title, reference_code)"
      )
      .in("project_id", ids)
      .eq("author_id", ctx.user.id)
      .contains("metadata", { kind: "expert_recommendation" })
      .order("created_at", { ascending: false })
      .limit(50);

    rows = (data ?? []) as RecRow[];
  }

  return (
    <div className="dash-page w-full min-w-0 space-y-6">
      <PageHeader
        icon={ClipboardList}
        eyebrow="Expert"
        title="Recommandations"
        description={
          rows.length > 0
            ? `${rows.length} avis structuré${rows.length !== 1 ? "s" : ""} transmis aux conseillers PI.`
            : "Historique de vos avis structurés transmis aux conseillers PI."
        }
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Aucune recommandation"
          description="Publiez une recommandation depuis la fiche d'un projet assigné."
        />
      ) : (
        <div className="grid gap-4">
          {rows.map((row) => {
            const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
            const project = Array.isArray(row.projects) ? row.projects[0] : row.projects;
            return (
              <ExpertRecommendationCard
                key={row.id}
                projectId={row.project_id}
                projectTitle={project?.title ?? "Projet"}
                referenceCode={project?.reference_code ?? null}
                body={row.body}
                createdAt={row.created_at}
                authorName={profile?.full_name ?? null}
                metadata={row.metadata as {
                  feasibility?: string;
                  recommendation?: string;
                  risks?: string | null;
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
