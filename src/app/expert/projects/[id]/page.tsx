import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, FlaskConical, Mail, MessageSquare } from "lucide-react";
import { ProjectMessageThread } from "@/components/messages/project-message-thread";
import type { ProjectMessage } from "@/lib/actions/messages";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectStatusBadge } from "@/components/shared/status-badge";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { CommentThread, type CommentWithAuthor } from "@/components/dashboard/comment-thread";
import { ExpertRecommendationForm } from "@/components/expert/expert-recommendation-form";
import { ExpertRecommendationCard } from "@/components/expert/expert-recommendation-card";
import { Button } from "@/components/ui/button";
import { DocumentList } from "@/components/documents/document-list";
import type { Document, Project } from "@/types/database";

export default async function ExpertProjectDetailPage({ params }: { params: { id: string } }) {
  const ctx = await requireUser();
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

  const [{ data: comments }, { data: documentsRaw }, { data: projectMessages }] =
    await Promise.all([
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
      supabase
        .from("messages")
        .select("id, body, created_at, sender_id, profiles(full_name, email)")
        .eq("project_id", params.id)
        .eq("message_type", "project_thread")
        .order("created_at", { ascending: true }),
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
    (c) =>
      !c.is_legal &&
      (c as { metadata?: { kind?: string } }).metadata?.kind !== "expert_recommendation"
  );

  const recommendations = (comments ?? []).filter(
    (c) => (c as { metadata?: { kind?: string } }).metadata?.kind === "expert_recommendation"
  );

  const documents = (documentsRaw ?? []) as Document[];

  const mappedMessages: ProjectMessage[] = (projectMessages ?? []).map((m) => {
    const row = m as {
      id: string;
      body: string;
      created_at: string;
      sender_id: string;
      profiles: ProjectMessage["profiles"] | NonNullable<ProjectMessage["profiles"]>[];
    };
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: row.id,
      body: row.body,
      created_at: row.created_at,
      sender_id: row.sender_id,
      profiles: profile ?? null,
    };
  });

  return (
    <div className="dash-page w-full min-w-0 space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" asChild>
        <Link href="/expert/assigned-projects">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Projets assignés
        </Link>
      </Button>

      <PageHeader
        icon={FlaskConical}
        eyebrow="Mission expert"
        title={p.title}
        description={p.reference_code ?? "Analyse technique du dossier"}
      >
        <ProjectStatusBadge status={p.status} />
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardSection title="Invention" icon={FlaskConical}>
          <p className="whitespace-pre-wrap p-5 pt-0 text-sm leading-relaxed text-muted-foreground">
            {p.invention_summary || "—"}
          </p>
        </DashboardSection>
        <DashboardSection title="Besoin / contexte" icon={FileText}>
          <p className="whitespace-pre-wrap p-5 pt-0 text-sm leading-relaxed text-muted-foreground">
            {p.need_description || "—"}
          </p>
        </DashboardSection>
      </div>

      <DashboardSection
        title="Documents"
        description={`${documents.length} fichier${documents.length !== 1 ? "s" : ""}`}
        icon={FileText}
      >
        <div className="p-5 pt-0">
          <DocumentList documents={documents} projectId={p.id} canDelete={false} />
        </div>
      </DashboardSection>

      <DashboardSection title="Messages dossier" icon={Mail}>
        <div className="p-5 pt-0">
          <ProjectMessageThread
            projectId={p.id}
            messages={mappedMessages}
            currentUserId={ctx.user.id}
          />
        </div>
      </DashboardSection>

      <ExpertRecommendationForm projectId={p.id} />

      {recommendations.length > 0 && (
        <DashboardSection
          title="Recommandations publiées"
          description={`${recommendations.length} recommandation${recommendations.length !== 1 ? "s" : ""}`}
          icon={MessageSquare}
        >
          <div className="space-y-3 p-5 pt-0">
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
          </div>
        </DashboardSection>
      )}

      <DashboardSection
        title="Notes techniques"
        description="Échanges informels — la recommandation structurée ci-dessus est transmise au CPI."
        icon={FlaskConical}
      >
        <div className="p-5 pt-0">
          <CommentThread
            projectId={p.id}
            comments={technicalComments}
            canPostLegal={false}
            legalOnly={false}
          />
        </div>
      </DashboardSection>
    </div>
  );
}
