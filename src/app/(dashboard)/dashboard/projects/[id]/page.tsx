import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, ListChecks, MessageSquare, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectStatusBadge } from "@/components/shared/status-badge";
import { ProjectStatusForm } from "@/components/dashboard/project-status-form";
import { ProjectDetailTabs } from "@/components/dashboard/project-detail-tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Project, Document, AiSearch, AiResult } from "@/types/database";
import type { CommentWithAuthor } from "@/components/dashboard/comment-thread";
import type { ProjectTask } from "@/components/dashboard/task-list";
import type { ProjectUpdate } from "@/components/dashboard/project-timeline";
import { getAiProviderLabel } from "@/lib/ai/config";
import {
  getStatusOptions,
  resolveStatusChangeMode,
} from "@/lib/workflow/status-permissions";

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: "Détail projet" };
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const ctx = await requireUser();
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*, categories(name)")
    .eq("id", params.id)
    .single();

  if (!project) notFound();

  const p = project as Project & { categories?: { name: string } | null };

  const [
    { data: documents },
    { data: comments },
    { data: tasks },
    { data: updates },
    { data: aiSearches },
  ] = await Promise.all([
    supabase
      .from("documents")
      .select("*")
      .eq("project_id", params.id)
      .neq("status", "deleted")
      .order("created_at", { ascending: false }),
    supabase
      .from("project_comments")
      .select("id, body, created_at, author_id, is_legal, profiles(full_name, email)")
      .eq("project_id", params.id)
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
      .limit(20),
    supabase
      .from("ai_searches")
      .select("*")
      .eq("project_id", params.id)
      .order("created_at", { ascending: false }),
  ]);

  const searchIds = (aiSearches ?? []).map((s) => s.id);
  let aiResults: AiResult[] = [];
  if (searchIds.length > 0) {
    const { data: results } = await supabase
      .from("ai_results")
      .select("*")
      .in("search_id", searchIds)
      .order("rank", { ascending: true });
    aiResults = (results ?? []) as AiResult[];
  }

  const resultsBySearch = aiResults.reduce<Record<string, AiResult[]>>((acc, r) => {
    if (!acc[r.search_id]) acc[r.search_id] = [];
    acc[r.search_id].push(r);
    return acc;
  }, {});

  const mappedComments: CommentWithAuthor[] = (comments ?? []).map((c) => {
    const row = c as CommentWithAuthor & {
      profiles: CommentWithAuthor["profiles"] | CommentWithAuthor["profiles"][];
    };
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return { ...row, profiles: profile ?? null };
  });

  const canPostLegal =
    ctx.primaryRole === "cpi_advisor" || ctx.primaryRole === "admin";

  const holderMode = resolveStatusChangeMode(ctx, {
    id: p.id,
    owner_id: p.owner_id,
    assigned_to: p.assigned_to,
    expert_id: p.expert_id,
    status: p.status,
  });

  const activeDocs = (documents ?? []).filter((d) => d.status !== "deleted");
  const pendingTasks = (tasks ?? []).filter((t) => t.status !== "completed").length;

  const aiProviderLabel = getAiProviderLabel();

  const stats = [
    { icon: FileText, label: "Documents", value: activeDocs.length },
    { icon: MessageSquare, label: "Commentaires", value: mappedComments.length },
    { icon: ListChecks, label: "Tâches ouvertes", value: pendingTasks },
    { icon: Sparkles, label: "Recherches IA", value: (aiSearches ?? []).length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Projets
          </Link>
        </Button>
      </div>

      <PageHeader
        eyebrow={p.categories?.name ?? "Projet"}
        title={p.title}
        description={p.reference_code ?? undefined}
      >
        <ProjectStatusBadge status={p.status} />
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-elevated flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <s.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {holderMode === "holder" && (
        <Card className="card-elevated border-0 shadow-none">
          <CardContent className="pt-6">
            <ProjectStatusForm
              projectId={p.id}
              currentStatus={p.status}
              allowedStatuses={getStatusOptions("holder", p.status)}
              mode="holder"
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-elevated border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Invention</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {p.invention_summary || "Aucun résumé renseigné."}
          </CardContent>
        </Card>
        <Card className="card-elevated border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Besoin</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {p.need_description || "Aucun besoin renseigné."}
          </CardContent>
        </Card>
      </div>

      <ProjectDetailTabs
        projectId={p.id}
        documents={(documents ?? []) as Document[]}
        comments={mappedComments}
        tasks={(tasks ?? []) as ProjectTask[]}
        updates={(updates ?? []) as ProjectUpdate[]}
        aiSearches={(aiSearches ?? []) as AiSearch[]}
        resultsBySearch={resultsBySearch}
        canPostLegal={canPostLegal}
        stats={{
          documents: activeDocs.length,
          comments: mappedComments.length,
          tasks: (tasks ?? []).length,
          aiSearches: (aiSearches ?? []).length,
        }}
        aiProviderLabel={aiProviderLabel}
      />
    </div>
  );
}
