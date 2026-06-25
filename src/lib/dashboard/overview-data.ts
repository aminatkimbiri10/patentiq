import { createClient } from "@/lib/supabase/server";
import { getHolderStats } from "@/lib/dashboard/stats";
import { getCpiProjects, computeCpiStats } from "@/lib/cpi/queries";
import { getExpertStats } from "@/lib/expert/stats";
import { getAdminStats } from "@/lib/admin/stats";
import { getSearchTypeLabel } from "@/lib/ai/search-types";
import {
  WORKFLOW_STAGES,
  workflowProgressForStatus,
  workflowStageIndex,
  workflowRecommendation,
  statusLabel,
} from "@/config/dashboard-workflow";
import { PROJECT_STATUS_LABELS } from "@/config/constants";
import type { AppRole } from "@/types/roles";
import { ROLE_LABELS } from "@/types/roles";
import type { Project, ProjectStatus, AiSearchStatus } from "@/types/database";
import type { StatBar } from "@/components/dashboard/stat-bar-list";

export type DashboardTask = {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_at: string | null;
  project_id: string;
  projectTitle: string;
  projectRef: string | null;
  href: string;
  overdue: boolean;
};

export type DashboardDocument = {
  id: string;
  title: string;
  file_name: string;
  mime_type: string | null;
  status: string;
  updated_at: string;
  project_id: string;
  projectTitle: string;
  href: string;
  hasAiSummary: boolean;
};

export type DashboardAiInsight = {
  id: string;
  searchType: string;
  searchTypeLabel: string;
  status: AiSearchStatus;
  query: string | null;
  summary: string | null;
  score: number | null;
  projectTitle: string;
  projectId: string;
  created_at: string;
  href: string;
};

export type DashboardActivity = {
  id: string;
  kind: "update" | "notification";
  title: string;
  body: string | null;
  created_at: string;
  href: string | null;
};

export type DashboardWorkflow = {
  projectId: string | null;
  projectTitle: string | null;
  projectRef: string | null;
  status: ProjectStatus | null;
  progress: number;
  currentStageLabel: string;
  recommendation: string;
  stages: { id: string; label: string; done: boolean; current: boolean }[];
  href: string | null;
};

export type DashboardHeroHighlight = {
  label: string;
  value: string | number;
};

export type DashboardOverview = {
  role: AppRole;
  roleLabel: string;
  firstName?: string;
  statusLine: string;
  heroHighlights: DashboardHeroHighlight[];
  metrics: { title: string; value: string | number; hint?: string }[];
  workflow: DashboardWorkflow;
  tasks: DashboardTask[];
  overdueTaskCount: number;
  documents: DashboardDocument[];
  aiInsights: DashboardAiInsight[];
  pendingAiCount: number;
  activity: DashboardActivity[];
  stageChart: StatBar[];
  recentProjects: Pick<Project, "id" | "title" | "status" | "reference_code" | "description" | "updated_at">[];
  unreadNotifications: number;
  tasksHref: string;
  documentsHref: string;
  projectCount: number;
};

function joinProject<T extends { title?: string; reference_code?: string | null }>(
  row: T | T[] | null | undefined
): T | null {
  if (!row) return null;
  return Array.isArray(row) ? row[0] ?? null : row;
}

function projectHref(role: AppRole, projectId: string): string {
  if (role === "cpi_advisor") return `/cpi/cases/${projectId}`;
  if (role === "expert") return `/expert/projects/${projectId}`;
  if (role === "admin") return `/admin/projects/${projectId}`;
  return `/dashboard/projects/${projectId}`;
}

function tasksHref(role: AppRole): string {
  if (role === "cpi_advisor") return "/cpi/cases";
  if (role === "expert") return "/expert/assigned-projects";
  return "/dashboard/tasks";
}

function documentsHref(role: AppRole): string {
  if (role === "cpi_advisor") return "/cpi/cases";
  if (role === "expert") return "/expert/assigned-projects";
  return "/dashboard/documents";
}

function aiHref(role: AppRole, projectId: string): string {
  if (role === "cpi_advisor") return `/cpi/cases/${projectId}?tab=ia`;
  if (role === "expert") return `/expert/projects/${projectId}?tab=ia`;
  return `/dashboard/projects/${projectId}?tab=ia`;
}

async function resolveProjects(userId: string, role: AppRole): Promise<Project[]> {
  const supabase = await createClient();
  if (role === "cpi_advisor") return getCpiProjects(userId);
  if (role === "expert") {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("expert_id", userId)
      .order("last_activity_at", { ascending: false });
    return (data ?? []) as Project[];
  }
  if (role === "admin") {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("last_activity_at", { ascending: false })
      .limit(200);
    return (data ?? []) as Project[];
  }
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", userId)
    .order("last_activity_at", { ascending: false });
  return (data ?? []) as Project[];
}

function pickPrimaryProject(projects: Project[], role: AppRole): Project | null {
  if (!projects.length) return null;
  const priority: ProjectStatus[] =
    role === "expert"
      ? ["expert_review"]
      : role === "cpi_advisor"
        ? ["cpi_review", "expert_review", "in_review", "awaiting_documents"]
        : [];
  for (const status of priority) {
    const match = projects.find((p) => p.status === status);
    if (match) return match;
  }
  return (
    projects.find((p) => !["closed", "rejected", "approved"].includes(p.status)) ?? projects[0]
  );
}

function buildWorkflow(
  project: Project | null,
  role: AppRole
): DashboardWorkflow {
  const roleKey =
    role === "cpi_advisor" ? "cpi" : role === "expert" ? "expert" : role === "admin" ? "admin" : "holder";

  if (!project) {
    return {
      projectId: null,
      projectTitle: null,
      projectRef: null,
      status: null,
      progress: 0,
      currentStageLabel: "—",
      recommendation:
        role === "cpi_advisor"
          ? "Aucun dossier assigné — les nouveaux projets soumis apparaîtront ici."
          : role === "expert"
            ? "Aucun projet assigné — le CPI vous affectera des dossiers en revue expert."
            : "Créez votre premier projet pour démarrer le parcours PI.",
      stages: WORKFLOW_STAGES.map((s) => ({ ...s, done: false, current: false })),
      href: null,
    };
  }

  const stageIdx = workflowStageIndex(project.status);
  const stages = WORKFLOW_STAGES.map((s, i) => ({
    id: s.id,
    label: s.label,
    done: i < stageIdx || project.status === "approved",
    current: i === stageIdx,
  }));

  return {
    projectId: project.id,
    projectTitle: project.title,
    projectRef: project.reference_code,
    status: project.status,
    progress: workflowProgressForStatus(project.status),
    currentStageLabel: statusLabel(project.status),
    recommendation: workflowRecommendation(project.status, roleKey),
    stages,
    href: projectHref(role, project.id),
  };
}

function buildStageChart(projects: Project[]): StatBar[] {
  const counts: Record<string, number> = {};
  for (const p of projects) {
    if (p.status === "draft") continue;
    counts[p.status] = (counts[p.status] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([key, value]) => ({
      key,
      label: PROJECT_STATUS_LABELS[key as ProjectStatus] ?? key,
      value,
    }));
}

function buildStatusLine(role: AppRole, projects: Project[], overdue: number, pendingAi: number): string {
  const active = projects.filter((p) => !["closed", "rejected"].includes(p.status)).length;
  if (role === "admin") {
    return `${projects.length} projet${projects.length !== 1 ? "s" : ""} sur la plateforme — supervision et traçabilité.`;
  }
  if (role === "cpi_advisor") {
    const review = projects.filter((p) =>
      ["cpi_review", "expert_review", "in_review"].includes(p.status)
    ).length;
    return `${active} dossier${active !== 1 ? "s" : ""} actif${active !== 1 ? "s" : ""}${review ? ` · ${review} en revue` : ""}.`;
  }
  if (role === "expert") {
    const waiting = projects.filter((p) => p.status === "expert_review").length;
    return waiting
      ? `${waiting} analyse${waiting !== 1 ? "s" : ""} en attente de votre avis.`
      : `${active} projet${active !== 1 ? "s" : ""} assigné${active !== 1 ? "s" : ""}.`;
  }
  const parts: string[] = [];
  if (active) parts.push(`${active} projet${active !== 1 ? "s" : ""} actif${active !== 1 ? "s" : ""}`);
  if (overdue) parts.push(`${overdue} tâche${overdue !== 1 ? "s" : ""} en retard`);
  if (pendingAi) parts.push(`${pendingAi} analyse${pendingAi !== 1 ? "s" : ""} IA en cours`);
  return parts.length ? `${parts.join(" · ")}.` : "Prêt à démarrer votre premier dossier PI.";
}

export async function getDashboardOverview(
  userId: string,
  role: AppRole,
  profile?: { full_name?: string | null }
): Promise<DashboardOverview> {
  const supabase = await createClient();
  const projects = await resolveProjects(userId, role);
  const projectIds = projects.map((p) => p.id);

  const primaryProject = pickPrimaryProject(projects, role);

  const [
    tasksResult,
    docsResult,
    aiResult,
    activityUpdates,
    activityNotifs,
    unreadResult,
    aiResultsRows,
  ] = await Promise.all([
    supabase
      .from("project_tasks")
      .select(
        "id, title, status, priority, due_at, project_id, projects(title, reference_code)"
      )
      .eq("assigned_to", userId)
      .neq("status", "completed")
      .neq("status", "cancelled")
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(8),
    projectIds.length
      ? supabase
          .from("documents")
          .select("id, title, file_name, mime_type, status, updated_at, project_id, metadata, projects(title, reference_code)")
          .in("project_id", projectIds)
          .neq("status", "deleted")
          .eq("is_latest", true)
          .order("updated_at", { ascending: false })
          .limit(6)
      : Promise.resolve({ data: [] }),
    projectIds.length
      ? supabase
          .from("ai_searches")
          .select("id, search_type, status, query, created_at, project_id, projects(title)")
          .in("project_id", projectIds)
          .order("created_at", { ascending: false })
          .limit(6)
      : Promise.resolve({ data: [] }),
    projectIds.length
      ? supabase
          .from("project_updates")
          .select("id, title, content, update_type, created_at, project_id, projects(title, reference_code)")
          .in("project_id", projectIds)
          .order("created_at", { ascending: false })
          .limit(8)
      : Promise.resolve({ data: [] }),
    supabase
      .from("notifications")
      .select("id, title, body, created_at, project_id, action_url")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false),
    (async () => {
      const searches = projectIds.length
        ? (
            await supabase
              .from("ai_searches")
              .select("id")
              .in("project_id", projectIds)
              .eq("status", "completed")
              .order("created_at", { ascending: false })
              .limit(12)
          ).data ?? []
        : [];
      const ids = searches.map((s) => s.id as string);
      if (!ids.length) return [];
      const { data } = await supabase
        .from("ai_results")
        .select("search_id, summary, title, score")
        .in("search_id", ids)
        .order("rank", { ascending: true });
      return data ?? [];
    })(),
  ]);

  const now = Date.now();
  const tasks: DashboardTask[] = (tasksResult.data ?? []).map((row) => {
    const t = row as {
      id: string;
      title: string;
      status: string;
      priority: string;
      due_at: string | null;
      project_id: string;
      projects: { title: string; reference_code: string | null } | { title: string; reference_code: string | null }[] | null;
    };
    const project = joinProject(t.projects);
    return {
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      due_at: t.due_at,
      project_id: t.project_id,
      projectTitle: project?.title ?? "Projet",
      projectRef: project?.reference_code ?? null,
      href: `${projectHref(role, t.project_id)}?tab=echanges&section=tasks`,
      overdue: t.due_at ? new Date(t.due_at).getTime() < now && t.status !== "completed" : false,
    };
  });

  const overdueTaskCount = tasks.filter((t) => t.overdue).length;

  const resultBySearch = new Map<string, { summary: string | null; title: string | null; score: number | null }>();
  for (const r of aiResultsRows as Array<{ search_id: string; summary: string | null; title: string | null; score: number | null }>) {
    if (!resultBySearch.has(r.search_id)) {
      resultBySearch.set(r.search_id, r);
    }
  }

  const aiInsights: DashboardAiInsight[] = (aiResult.data ?? []).map((row) => {
    const s = row as {
      id: string;
      search_type: string;
      status: AiSearchStatus;
      query: string | null;
      created_at: string;
      project_id: string;
      projects: { title: string } | { title: string }[] | null;
    };
    const project = joinProject(s.projects);
    const result = resultBySearch.get(s.id);
    return {
      id: s.id,
      searchType: s.search_type,
      searchTypeLabel: getSearchTypeLabel(s.search_type),
      status: s.status,
      query: s.query,
      summary: result?.summary ?? result?.title ?? null,
      score: result?.score ?? null,
      projectTitle: project?.title ?? "Projet",
      projectId: s.project_id,
      created_at: s.created_at,
      href: aiHref(role, s.project_id),
    };
  });

  const pendingAiCount = aiInsights.filter((a) =>
    ["pending", "processing"].includes(a.status)
  ).length;

  const documents: DashboardDocument[] = (docsResult.data ?? []).map((row) => {
    const d = row as {
      id: string;
      title: string;
      file_name: string;
      mime_type: string | null;
      status: string;
      updated_at: string;
      project_id: string;
      metadata: Record<string, unknown> | null;
      projects: { title: string; reference_code: string | null } | { title: string; reference_code: string | null }[] | null;
    };
    const project = joinProject(d.projects);
    return {
      id: d.id,
      title: d.title,
      file_name: d.file_name,
      mime_type: d.mime_type,
      status: d.status,
      updated_at: d.updated_at,
      project_id: d.project_id,
      projectTitle: project?.title ?? "Projet",
      href: `${projectHref(role, d.project_id)}?tab=documents`,
      hasAiSummary: Boolean(
        d.metadata &&
          typeof d.metadata === "object" &&
          ("ai_summary" in d.metadata || "summary" in d.metadata)
      ),
    };
  });

  const updateActivities: DashboardActivity[] = (activityUpdates.data ?? []).map((row) => {
    const u = row as {
      id: string;
      title: string | null;
      content: string | null;
      update_type: string;
      created_at: string;
      project_id: string;
      projects: { title: string; reference_code: string | null } | { title: string; reference_code: string | null }[] | null;
    };
    const project = joinProject(u.projects);
    return {
      id: `u-${u.id}`,
      kind: "update" as const,
      title: u.title ?? u.update_type,
      body: u.content ?? (project?.title ? `Dossier ${project.title}` : null),
      created_at: u.created_at,
      href: projectHref(role, u.project_id),
    };
  });

  const notifActivities: DashboardActivity[] = (
    (activityNotifs.data ?? []) as Array<{
      id: string;
      title: string;
      body: string | null;
      created_at: string;
      action_url: string | null;
    }>
  ).map((n) => ({
    id: `n-${n.id}`,
    kind: "notification" as const,
    title: n.title,
    body: n.body,
    created_at: n.created_at,
    href: n.action_url,
  }));

  const activity = [...updateActivities, ...notifActivities]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  const unreadNotifications = unreadResult.count ?? 0;
  const workflow = buildWorkflow(primaryProject, role);
  const stageChart = buildStageChart(projects);
  const firstName = profile?.full_name?.split(" ")[0];

  let metrics: DashboardOverview["metrics"] = [];
  let heroHighlights: DashboardHeroHighlight[] = [];

  if (role === "project_holder") {
    const stats = await getHolderStats(userId);
    metrics = [
      { title: "Projets actifs", value: stats.activeProjectCount, hint: `${stats.projectCount} au total` },
      { title: "Documents", value: stats.documentCount },
      { title: "Tâches ouvertes", value: stats.openTaskCount, hint: overdueTaskCount ? `${overdueTaskCount} en retard` : undefined },
      { title: "Analyses IA", value: stats.aiSearchCount, hint: pendingAiCount ? `${pendingAiCount} en cours` : undefined },
      { title: "Notifications", value: unreadNotifications },
      { title: "Documents récents", value: documents.length },
    ];
    heroHighlights = [
      { label: "Projets actifs", value: stats.activeProjectCount },
      { label: "Tâches urgentes", value: overdueTaskCount || stats.openTaskCount },
      { label: "Analyses IA", value: stats.aiSearchCount },
    ];
  } else if (role === "cpi_advisor") {
    const stats = computeCpiStats(projects);
    metrics = [
      { title: "Dossiers actifs", value: stats.activeCount },
      { title: "En revue", value: stats.inReviewCount },
      { title: "Revue expert", value: stats.awaitingExpertCount },
      { title: "Décision CPI", value: stats.cpiReviewCount },
      { title: "Tâches ouvertes", value: tasks.length, hint: overdueTaskCount ? `${overdueTaskCount} en retard` : undefined },
      { title: "Notifications", value: unreadNotifications },
    ];
    heroHighlights = [
      { label: "Dossiers actifs", value: stats.activeCount },
      { label: "À décider", value: stats.cpiReviewCount },
      { label: "En retard", value: stats.staleCount },
    ];
  } else if (role === "expert") {
    const stats = await getExpertStats(userId);
    metrics = [
      { title: "Projets assignés", value: stats.assignedCount },
      { title: "Analyses en attente", value: stats.awaitingAnalysis },
      { title: "Recommandations", value: stats.recommendationsCount },
      { title: "Tâches ouvertes", value: tasks.length },
      { title: "Analyses IA", value: aiInsights.length },
      { title: "Notifications", value: unreadNotifications },
    ];
    heroHighlights = [
      { label: "En revue expert", value: stats.awaitingAnalysis },
      { label: "Assignés", value: stats.assignedCount },
      { label: "Recommandations", value: stats.recommendationsCount },
    ];
  } else {
    const stats = await getAdminStats();
    metrics = [
      { title: "Utilisateurs", value: stats.usersCount },
      { title: "Projets", value: stats.projectsCount },
      { title: "En revue", value: stats.projectsInReview },
      { title: "Logs audit", value: stats.auditLogsCount },
      { title: "Analyses IA", value: aiInsights.length },
      { title: "Notifications", value: unreadNotifications },
    ];
    heroHighlights = [
      { label: "Utilisateurs", value: stats.usersCount },
      { label: "Projets actifs", value: stats.projectsInReview },
      { label: "Audit", value: stats.auditLogsCount },
    ];
  }

  const recentProjects = (role === "expert"
    ? [...projects].sort((a, b) => {
        if (a.status === "expert_review" && b.status !== "expert_review") return -1;
        if (b.status === "expert_review" && a.status !== "expert_review") return 1;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      })
    : projects
  )
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      reference_code: p.reference_code,
      description: p.description,
      updated_at: p.updated_at,
    }));

  return {
    role,
    roleLabel: ROLE_LABELS[role],
    firstName,
    statusLine: buildStatusLine(role, projects, overdueTaskCount, pendingAiCount),
    heroHighlights,
    metrics,
    workflow,
    tasks,
    overdueTaskCount,
    documents,
    aiInsights,
    pendingAiCount,
    activity,
    stageChart,
    recentProjects,
    unreadNotifications,
    tasksHref: tasksHref(role),
    documentsHref: documentsHref(role),
    projectCount: projects.length,
  };
}
