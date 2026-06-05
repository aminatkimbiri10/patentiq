import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Scale, Activity, ListChecks, FileText } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectStatusBadge } from "@/components/shared/status-badge";
import { CommentThread, type CommentWithAuthor } from "@/components/dashboard/comment-thread";
import { ProjectStatusForm } from "@/components/dashboard/project-status-form";
import { DocumentList } from "@/components/documents/document-list";
import { TaskList, type ProjectTask } from "@/components/dashboard/task-list";
import { ProjectTimeline, type ProjectUpdate } from "@/components/dashboard/project-timeline";
import {
  ExpertRecommendationsPanel,
  type ExpertRecommendationRow,
} from "@/components/cpi/expert-recommendations-panel";
import {
  detectProjectRoles,
  getStatusOptions,
  resolveStatusChangeMode,
} from "@/lib/workflow/status-permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Document, Project } from "@/types/database";

export default async function CpiCaseDetailPage({ params }: { params: { id: string } }) {
  const ctx = await requireUser();
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!project) notFound();

  const p = project as Project;

  const [
    { data: comments },
    { data: documents },
    { data: tasks },
    { data: updates },
    { data: ownerProfile },
    { data: expertProfile },
  ] = await Promise.all([
    supabase
      .from("project_comments")
      .select("id, body, created_at, author_id, is_legal, metadata, profiles(full_name, email)")
      .eq("project_id", params.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("documents")
      .select("*")
      .eq("project_id", params.id)
      .neq("status", "deleted")
      .order("created_at", { ascending: false }),
    supabase
      .from("project_tasks")
      .select("id, title, description, status, priority, due_at, project_id")
      .eq("project_id", params.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("project_updates")
      .select("id, title, content, update_type, created_at")
      .eq("project_id", params.id)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase.from("profiles").select("full_name, email").eq("id", p.owner_id).single(),
    p.expert_id
      ? supabase.from("profiles").select("full_name").eq("id", p.expert_id).single()
      : Promise.resolve({ data: null }),
  ]);

  const mappedComments: CommentWithAuthor[] = (comments ?? []).map((c) => {
    const row = c as CommentWithAuthor & {
      profiles: CommentWithAuthor["profiles"] | CommentWithAuthor["profiles"][];
      metadata?: Record<string, unknown>;
    };
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return { ...row, profiles: profile ?? null };
  });

  const legalComments = mappedComments.filter((c) => c.is_legal);

  const expertRecommendations: ExpertRecommendationRow[] = (comments ?? [])
    .filter((c) => (c as { metadata?: { kind?: string } }).metadata?.kind === "expert_recommendation")
    .map((c) => {
      const row = c as {
        id: string;
        body: string;
        created_at: string;
        metadata: ExpertRecommendationRow["metadata"];
        profiles: { full_name: string | null } | { full_name: string | null }[] | null;
      };
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
      return {
        id: row.id,
        body: row.body,
        created_at: row.created_at,
        metadata: row.metadata,
        profiles: profile ?? null,
      };
    });

  const canPostLegal =
    ctx.primaryRole === "cpi_advisor" || ctx.primaryRole === "admin";

  const projectAccess = {
    id: p.id,
    owner_id: p.owner_id,
    assigned_to: p.assigned_to,
    expert_id: p.expert_id,
    status: p.status,
  };
  const { isAdmin, isCpiOnProject } = await detectProjectRoles(
    ctx,
    projectAccess,
    supabase
  );
  const statusMode = resolveStatusChangeMode(ctx, projectAccess, {
    isAdmin,
    isCpiOnProject,
  });

  const ownerName = ownerProfile?.full_name ?? ownerProfile?.email ?? "Porteur";
  const expertName = expertProfile?.full_name ?? (p.expert_id ? "Assigné" : null);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" asChild>
        <Link href="/cpi/cases">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Dossiers
        </Link>
      </Button>

      <PageHeader title={p.title} description={p.reference_code ?? "Revue juridique CPI"}>
        <ProjectStatusBadge status={p.status} />
      </PageHeader>

      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        <span>
          Porteur : <span className="font-medium text-foreground">{ownerName}</span>
        </span>
        {expertName && (
          <span>
            Expert : <span className="font-medium text-foreground">{expertName}</span>
          </span>
        )}
      </div>

      {statusMode === "cpi" && (
        <Card className="card-elevated border-0 shadow-none">
          <CardContent className="pt-6">
            <ProjectStatusForm
              projectId={p.id}
              currentStatus={p.status}
              allowedStatuses={getStatusOptions("cpi", p.status)}
              mode="cpi"
            />
          </CardContent>
        </Card>
      )}

      <ExpertRecommendationsPanel
        projectId={p.id}
        projectTitle={p.title}
        referenceCode={p.reference_code}
        recommendations={expertRecommendations}
      />

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
            <CardTitle className="text-base">Besoin PI</CardTitle>
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
        <DocumentList
          documents={(documents ?? []) as Document[]}
          projectId={p.id}
          canDelete={false}
        />
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <ListChecks className="h-5 w-5 text-primary" />
          Tâches
        </h2>
        <TaskList projectId={p.id} tasks={(tasks ?? []) as ProjectTask[]} readOnly />
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Activity className="h-5 w-5 text-primary" />
          Historique
        </h2>
        <ProjectTimeline updates={(updates ?? []) as ProjectUpdate[]} />
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Scale className="h-5 w-5 text-primary" />
          Avis et commentaires juridiques
        </h2>
        <CommentThread
          projectId={p.id}
          comments={legalComments.length ? legalComments : mappedComments}
          canPostLegal={canPostLegal}
          legalOnly={legalComments.length > 0}
        />
      </section>
    </div>
  );
}
