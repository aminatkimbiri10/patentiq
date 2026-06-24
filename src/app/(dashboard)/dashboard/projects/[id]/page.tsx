import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { ProjectDetailHeader } from "@/components/project/project-detail-header";
import { ProjectStatusBadge } from "@/components/shared/status-badge";
import { ProjectStatusForm } from "@/components/dashboard/project-status-form";
import { ProjectDetailTabs } from "@/components/dashboard/project-detail-tabs";
import { ProjectOnboardingHint } from "@/components/dashboard/project-onboarding-hint";
import { ProjectStatusBanner } from "@/components/dashboard/project-status-banner";
import { getProjectUnreadMessageCount } from "@/lib/messages/read-cursor";
import { DocumentsAckForm } from "@/components/dashboard/documents-ack-form";
import type { Project, Document, AiSearch, AiResult } from "@/types/database";
import type { CommentWithAuthor } from "@/components/dashboard/comment-thread";
import type { ProjectTask } from "@/components/dashboard/task-list";
import type { ProjectUpdate } from "@/components/dashboard/project-timeline";
import type { ProjectMessage } from "@/lib/actions/messages";
import { getAiProviderLabel } from "@/lib/ai/config";
import {
  getStatusOptions,
  resolveStatusChangeMode,
} from "@/lib/workflow/status-permissions";
import type { ExpertRecommendationRow } from "@/components/cpi/expert-recommendations-panel";
import { DeleteProjectButton } from "@/components/dashboard/delete-project-button";
import { HolderExpertInsights } from "@/components/dashboard/holder-expert-insights";
import { getChecklistTemplate } from "@/lib/checklists/templates";
import {
  buildEffectiveChecklistState,
  loadAutoChecklistContext,
} from "@/lib/checklists/load-effective-checklist";
import { getPatentClaimsDraft } from "@/lib/actions/patent-claims";
import { getPatentDraft } from "@/lib/actions/patent-draft";
import { listPatentDraftVersions } from "@/lib/actions/patent-draft-history";
import {
  parseMarqueLifecycle,
  defaultMarqueLifecycle,
} from "@/lib/workflow/marque-lifecycle";
import {
  parseBrevetLifecycle,
  defaultBrevetLifecycle,
} from "@/lib/workflow/brevet-lifecycle";
import {
  parseDesignLifecycle,
  defaultDesignLifecycle,
} from "@/lib/workflow/design-lifecycle";

export async function generateMetadata({ params }: { params: { id: string } }) {
  return { title: "Détail projet" };
}

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const ctx = await requireUser();
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*, categories(name, slug)")
    .eq("id", params.id)
    .single();

  if (!project) notFound();

  const p = project as Project & { categories?: { name: string; slug: string } | null };

  const [
    { data: documents },
    { data: comments },
    { data: tasks },
    { data: updates },
    { data: aiSearches },
    { data: projectMessages },
    { data: cpiProfile },
    unreadMessages,
    patentClaims,
    patentDraft,
    draftVersions,
  ] = await Promise.all([
    supabase
      .from("documents")
      .select("*")
      .eq("project_id", params.id)
      .neq("status", "deleted")
      .order("created_at", { ascending: false }),
    supabase
      .from("project_comments")
      .select("id, body, created_at, author_id, is_legal, metadata, profiles(full_name, email)")
      .eq("project_id", params.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("project_tasks")
      .select("id, title, description, status, priority, due_at, project_id, created_by, assigned_to")
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
    supabase
      .from("messages")
      .select("id, body, created_at, sender_id, profiles(full_name, email)")
      .eq("project_id", params.id)
      .eq("message_type", "project_thread")
      .order("created_at", { ascending: true }),
    p.assigned_to
      ? supabase.from("profiles").select("full_name, email").eq("id", p.assigned_to).single()
      : Promise.resolve({ data: null }),
    getProjectUnreadMessageCount(params.id, ctx.user.id),
    getPatentClaimsDraft(params.id),
    getPatentDraft(params.id),
    listPatentDraftVersions(params.id),
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
    const row = c as {
      id: string;
      body: string;
      created_at: string;
      author_id: string;
      is_legal?: boolean;
      profiles: CommentWithAuthor["profiles"] | NonNullable<CommentWithAuthor["profiles"]>[];
    };
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: row.id,
      body: row.body,
      created_at: row.created_at,
      author_id: row.author_id,
      is_legal: row.is_legal,
      profiles: profile ?? null,
    };
  });

  const canPostLegal =
    ctx.primaryRole === "cpi_advisor" || ctx.primaryRole === "admin";

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

  const holderMode = resolveStatusChangeMode(ctx, {
    id: p.id,
    owner_id: p.owner_id,
    assigned_to: p.assigned_to,
    expert_id: p.expert_id,
    status: p.status,
  });

  const activeDocs = (documents ?? []).filter((d) => d.status !== "deleted");

  const autoCtx = await loadAutoChecklistContext(supabase, params.id, {
    aiSearches: (aiSearches ?? []) as AiSearch[],
    patentDraft,
    patentClaims,
    activeDocumentCount: activeDocs.length,
  });
  const checklist = buildEffectiveChecklistState(p.categories?.slug, p.metadata, autoCtx);

  const pendingTasks = (tasks ?? []).filter(
    (t) => t.status !== "completed" && t.status !== "cancelled"
  ).length;
  const pendingAi = (aiSearches ?? []).filter(
    (s) => s.status === "pending" || s.status === "processing"
  ).length;
  const cpiName =
    cpiProfile?.full_name ?? cpiProfile?.email ?? null;

  const aiProviderLabel = getAiProviderLabel();
  const marqueLifecycle =
    parseMarqueLifecycle(p.metadata) ?? defaultMarqueLifecycle();
  const brevetLifecycle =
    parseBrevetLifecycle(p.metadata) ?? defaultBrevetLifecycle();
  const designLifecycle =
    parseDesignLifecycle(p.metadata) ?? defaultDesignLifecycle();

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
    <div className="space-y-5">
      <ProjectDetailHeader
        backHref="/dashboard/projects"
        backLabel="Mes projets"
        category={p.categories?.name}
        title={p.title}
        referenceCode={p.reference_code}
        lastActivityAt={p.last_activity_at}
      >
        <ProjectStatusBadge status={p.status} />
        {holderMode === "holder" && (
          <DeleteProjectButton projectId={p.id} projectTitle={p.title} />
        )}
      </ProjectDetailHeader>

      <ProjectStatusBanner
        status={p.status}
        cpiName={cpiName}
        checklistPercent={checklist.progress.percent}
        pendingTasks={pendingTasks}
        pendingAi={pendingAi}
        unreadMessages={unreadMessages}
      />

      <ProjectOnboardingHint
        projectId={p.id}
        documentCount={activeDocs.length}
        checklistPercent={checklist.progress.percent}
      />

      {p.status === "awaiting_documents" && holderMode === "holder" && (
        <DocumentsAckForm projectId={p.id} />
      )}

      {holderMode === "holder" && (
        <div className="rounded-lg border border-border/60 bg-muted/25 px-4 py-4 sm:px-5">
          <ProjectStatusForm
            projectId={p.id}
            currentStatus={p.status}
            allowedStatuses={getStatusOptions("holder", p.status)}
            mode="holder"
          />
        </div>
      )}

      {expertRecommendations.length > 0 && (
        <HolderExpertInsights recommendations={expertRecommendations} />
      )}

      <ProjectDetailTabs
        projectId={p.id}
        documents={(documents ?? []) as Document[]}
        comments={mappedComments}
        messages={mappedMessages}
        tasks={(tasks ?? []) as ProjectTask[]}
        updates={(updates ?? []) as ProjectUpdate[]}
        aiSearches={(aiSearches ?? []) as AiSearch[]}
        resultsBySearch={resultsBySearch}
        canPostLegal={canPostLegal}
        currentUserId={ctx.user.id}
        inventionSummary={p.invention_summary}
        needDescription={p.need_description}
        stats={{
          documents: activeDocs.length,
          comments: mappedComments.length,
          tasks: (tasks ?? []).length,
          aiSearches: (aiSearches ?? []).length,
          messages: mappedMessages.length,
          unreadMessages,
          pendingTasks,
          checklistPercent: checklist.progress.percent,
        }}
        aiProviderLabel={aiProviderLabel}
        checklistTemplate={checklist.template}
        checklistState={checklist.effectiveState}
        checklistManualChecked={checklist.manualState.checked}
        checklistAutoChecked={checklist.autoChecked}
        categorySlug={p.categories?.slug}
        patentClaims={patentClaims}
        patentDraft={patentDraft}
        draftVersions={draftVersions}
        projectTitle={p.title}
        marqueLifecycle={marqueLifecycle}
        brevetLifecycle={brevetLifecycle}
        designLifecycle={designLifecycle}
      />
    </div>
  );
}
