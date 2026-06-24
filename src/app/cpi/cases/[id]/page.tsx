import { notFound } from "next/navigation";
import { CpiCaseTabs } from "@/components/cpi/cpi-case-tabs";
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
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { ProjectDetailHeader } from "@/components/project/project-detail-header";
import { ProjectStatusBadge } from "@/components/shared/status-badge";
import { ProjectStatusBanner } from "@/components/dashboard/project-status-banner";
import { ProjectStatusForm } from "@/components/dashboard/project-status-form";
import type { CommentWithAuthor } from "@/components/dashboard/comment-thread";
import type { ProjectTask } from "@/components/dashboard/task-list";
import type { ProjectMessage } from "@/lib/actions/messages";
import type { ProjectUpdate } from "@/components/dashboard/project-timeline";
import {
  type ExpertRecommendationRow,
} from "@/components/cpi/expert-recommendations-panel";
import {
  detectProjectRoles,
  getStatusOptions,
  resolveStatusChangeMode,
} from "@/lib/workflow/status-permissions";
import { getAiProviderLabel } from "@/lib/ai/config";
import { getProjectUnreadMessageCount } from "@/lib/messages/read-cursor";
import type { Document, Project, AiSearch, AiResult } from "@/types/database";

export default async function CpiCaseDetailPage({ params }: { params: { id: string } }) {
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
    { data: comments },
    { data: documents },
    { data: tasks },
    { data: updates },
    { data: ownerProfile },
    { data: projectMessages },
    { data: aiSearches },
    patentClaims,
    patentDraft,
    draftVersions,
    unreadMessages,
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
      .select("id, title, description, status, priority, due_at, project_id, created_by, assigned_to")
      .eq("project_id", params.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("project_updates")
      .select("id, title, content, update_type, created_at")
      .eq("project_id", params.id)
      .order("created_at", { ascending: false })
      .limit(30),
    supabase.from("profiles").select("full_name, email").eq("id", p.owner_id).single(),
    supabase
      .from("messages")
      .select("id, body, created_at, sender_id, profiles(full_name, email)")
      .eq("project_id", params.id)
      .eq("message_type", "project_thread")
      .order("created_at", { ascending: true }),
    supabase
      .from("ai_searches")
      .select("*")
      .eq("project_id", params.id)
      .order("created_at", { ascending: false }),
    getPatentClaimsDraft(params.id),
    getPatentDraft(params.id),
    listPatentDraftVersions(params.id),
    getProjectUnreadMessageCount(params.id, ctx.user.id),
  ]);

  const marqueLifecycle =
    parseMarqueLifecycle(p.metadata) ?? defaultMarqueLifecycle();
  const brevetLifecycle =
    parseBrevetLifecycle(p.metadata) ?? defaultBrevetLifecycle();
  const designLifecycle =
    parseDesignLifecycle(p.metadata) ?? defaultDesignLifecycle();

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
  const pendingTasks = (tasks ?? []).filter(
    (t) => t.status !== "completed" && t.status !== "cancelled"
  ).length;
  const pendingAi = (aiSearches ?? []).filter(
    (s) => s.status === "pending" || s.status === "processing"
  ).length;

  const activeDocCount = (documents ?? []).filter((d) => d.status === "active").length;
  const autoCtx = await loadAutoChecklistContext(supabase, params.id, {
    aiSearches: (aiSearches ?? []) as AiSearch[],
    patentDraft,
    patentClaims,
    activeDocumentCount: activeDocCount,
  });
  const checklist = buildEffectiveChecklistState(p.categories?.slug, p.metadata, autoCtx);

  return (
    <div className="space-y-5">
      <ProjectDetailHeader
        backHref="/cpi/cases"
        backLabel="Dossiers CPI"
        category={p.categories?.name ?? "Revue juridique"}
        title={p.title}
        referenceCode={p.reference_code}
        lastActivityAt={p.last_activity_at}
        partyLabel="Porteur"
        partyName={ownerName}
      >
        <ProjectStatusBadge status={p.status} />
      </ProjectDetailHeader>

      <ProjectStatusBanner
        status={p.status}
        partyLabel="Porteur"
        partyName={ownerName}
        checklistPercent={checklist.progress.percent}
        pendingTasks={pendingTasks}
        pendingAi={pendingAi}
        unreadMessages={unreadMessages}
      />

      {statusMode === "cpi" && (
        <div className="rounded-lg border border-border/60 bg-muted/25 px-4 py-4 sm:px-5">
          <ProjectStatusForm
            projectId={p.id}
            currentStatus={p.status}
            allowedStatuses={getStatusOptions("cpi", p.status)}
            mode="cpi"
          />
        </div>
      )}

      <CpiCaseTabs
        projectId={p.id}
        projectTitle={p.title}
        referenceCode={p.reference_code}
        inventionSummary={p.invention_summary}
        needDescription={p.need_description}
        ownerName={ownerName}
        documents={(documents ?? []) as Document[]}
        checklistTemplate={checklist.template}
        checklistState={checklist.effectiveState}
        checklistManualChecked={checklist.manualState.checked}
        checklistAutoChecked={checklist.autoChecked}
        checklistReadOnly={statusMode !== "cpi"}
        canAssignTasks={statusMode === "cpi"}
        holderId={p.owner_id}
        aiSearches={(aiSearches ?? []) as AiSearch[]}
        resultsBySearch={resultsBySearch}
        aiProviderLabel={getAiProviderLabel()}
        tasks={(tasks ?? []) as ProjectTask[]}
        updates={(updates ?? []) as ProjectUpdate[]}
        messages={mappedMessages}
        currentUserId={ctx.user.id}
        canPostLegal={canPostLegal}
        legalComments={legalComments}
        allComments={mappedComments}
        expertRecommendations={expertRecommendations}
        showCpiTaskForm={statusMode === "cpi"}
        statusModeCpi={statusMode === "cpi"}
        categorySlug={p.categories?.slug}
        patentClaims={patentClaims}
        patentDraft={patentDraft}
        draftVersions={draftVersions}
        marqueLifecycle={marqueLifecycle}
        brevetLifecycle={brevetLifecycle}
        designLifecycle={designLifecycle}
        checklistPercent={checklist.progress.percent}
        openTasks={pendingTasks}
        unreadMessages={unreadMessages}
      />
    </div>
  );
}
