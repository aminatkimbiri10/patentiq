import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, FlaskConical } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectStatusBadge } from "@/components/shared/status-badge";
import { CommentThread, type CommentWithAuthor } from "@/components/dashboard/comment-thread";
import { ExpertRecommendationForm } from "@/components/expert/expert-recommendation-form";
import { ExpertRecommendationCard } from "@/components/expert/expert-recommendation-card";
import { Button } from "@/components/ui/button";
import { DocumentList } from "@/components/documents/document-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Document, Project } from "@/types/database";

export default async function ExpertProjectDetailPage({ params }: { params: { id: string } }) {
  await requireUser();
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!project) notFound();

  const p = project as Project;

  const [{ data: isExpert }, { data: isProjectExpert }] = await Promise.all([
    supabase.rpc("has_role", { p_role: "expert" }),
    supabase.rpc("is_project_expert", { p_project_id: params.id }),
  ]);

  if (!isExpert || !isProjectExpert) notFound();

  const [{ data: comments }, { data: documentsRaw }] = await Promise.all([
    supabase
      .from("project_comments")
      .select("id, body, created_at, author_id, is_legal, metadata, profiles(full_name, email)")
      .eq("project_id", params.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("documents")
      .select("id, title, file_name, mime_type, created_at")
      .eq("project_id", params.id)
      .neq("status", "deleted")
      .order("created_at", { ascending: false }),
  ]);

  const mappedComments: CommentWithAuthor[] = (comments ?? []).map((c) => {
    const row = c as CommentWithAuthor & {
      profiles: CommentWithAuthor["profiles"] | CommentWithAuthor["profiles"][];
      metadata?: Record<string, unknown>;
    };
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return { ...row, profiles: profile ?? null };
  });

  const technicalComments = mappedComments.filter(
    (c) => !c.is_legal && (c as { metadata?: { kind?: string } }).metadata?.kind !== "expert_recommendation"
  );

  const recommendations = (comments ?? []).filter(
    (c) =>
      (c as { metadata?: { kind?: string } }).metadata?.kind === "expert_recommendation"
  );

  const documents = (documentsRaw ?? []) as Document[];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" asChild>
        <Link href="/expert/assigned-projects">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Projets assignés
        </Link>
      </Button>

      <PageHeader title={p.title} description={p.reference_code ?? "Analyse technique"}>
        <ProjectStatusBadge status={p.status} />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-elevated border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Invention</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
            {p.invention_summary || "—"}
          </CardContent>
        </Card>
        <Card className="card-elevated border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Besoin / contexte</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
            {p.need_description || "—"}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <FileText className="h-5 w-5 text-primary" />
          Documents
        </h2>
        <DocumentList documents={documents} projectId={p.id} canDelete={false} />
      </section>

      <ExpertRecommendationForm projectId={p.id} />

      {recommendations.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Recommandations publiées</h2>
          {recommendations.map((r) => {
            const row = r as {
              id: string;
              body: string;
              created_at: string;
              metadata: Record<string, unknown>;
              profiles: { full_name: string | null } | { full_name: string | null }[] | null;
            };
            const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
            return (
              <ExpertRecommendationCard
                key={row.id}
                projectId={p.id}
                projectTitle={p.title}
                referenceCode={p.reference_code}
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
        </section>
      )}

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <FlaskConical className="h-5 w-5 text-primary" />
          Notes techniques
        </h2>
        <p className="text-sm text-muted-foreground">
          Échanges informels — la recommandation structurée ci-dessus est transmise au CPI.
        </p>
        <CommentThread
          projectId={p.id}
          comments={technicalComments}
          canPostLegal={false}
          legalOnly={false}
        />
      </section>
    </div>
  );
}
