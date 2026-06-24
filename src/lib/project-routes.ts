import { projectTabQuery } from "@/lib/project-tabs";

export type ProjectParticipants = {
  owner_id: string;
  assigned_to?: string | null;
  expert_id?: string | null;
};

export type ProjectViewerRole = "holder" | "cpi" | "expert";

export type ProjectDeepTab =
  | "overview"
  | "tasks"
  | "search"
  | "messages"
  | "documents"
  | "checklist";

export function resolveProjectViewerRole(
  userId: string,
  project: ProjectParticipants
): ProjectViewerRole {
  if (project.assigned_to && userId === project.assigned_to) return "cpi";
  if (project.expert_id && userId === project.expert_id) return "expert";
  return "holder";
}

export function projectCasePath(projectId: string, role: ProjectViewerRole): string {
  switch (role) {
    case "cpi":
      return `/cpi/cases/${projectId}`;
    case "expert":
      return `/expert/projects/${projectId}`;
    default:
      return `/dashboard/projects/${projectId}`;
  }
}

export function projectCaseUrl(
  projectId: string,
  role: ProjectViewerRole,
  query?: Record<string, string>
): string {
  const base = projectCasePath(projectId, role);
  if (!query || !Object.keys(query).length) return base;
  return `${base}?${new URLSearchParams(query).toString()}`;
}

/** URL dossier + onglet IA / nouveauté (checklist antériorité) */
export function projectAiSearchUrl(
  projectId: string,
  role: ProjectViewerRole,
  searchType?: string
): string {
  if (role === "cpi") {
    const params: Record<string, string> = { tab: "ia", section: "new" };
    if (searchType) params.type = searchType;
    return projectCaseUrl(projectId, role, params);
  }
  const base = projectCasePath(projectId, role);
  const q = projectTabQuery("search", "new");
  const params = new URLSearchParams(q.replace(/^\?/, ""));
  if (searchType) params.set("type", searchType);
  const suffix = params.toString();
  return suffix ? `${base}?${suffix}` : base;
}

/** URL adaptée au rôle (notifications, liens internes) */
export function projectUrlForUser(
  projectId: string,
  userId: string,
  project: ProjectParticipants,
  tab: ProjectDeepTab = "overview"
): string {
  const role = resolveProjectViewerRole(userId, project);

  if (tab === "search") {
    return projectAiSearchUrl(projectId, role);
  }

  if (role === "cpi") {
    if (tab === "tasks") return projectCaseUrl(projectId, role, { tab: "dossier" });
    if (tab === "messages") return projectCaseUrl(projectId, role, { tab: "echanges" });
    if (tab === "documents" || tab === "checklist") {
      return projectCaseUrl(projectId, role, { tab: "dossier" });
    }
    return projectCasePath(projectId, role);
  }

  if (role === "expert") {
    return projectCasePath(projectId, role);
  }

  if (tab === "overview") return projectCasePath(projectId, role);
  if (tab === "tasks") {
    return `${projectCasePath(projectId, role)}${projectTabQuery("echanges", "tasks")}`;
  }
  if (tab === "messages") {
    return `${projectCasePath(projectId, role)}${projectTabQuery("echanges", "messages")}`;
  }
  if (tab === "documents") {
    return `${projectCasePath(projectId, role)}${projectTabQuery("dossier", "documents")}`;
  }
  if (tab === "checklist") {
    return `${projectCasePath(projectId, role)}${projectTabQuery("dossier", "checklist")}`;
  }
  return projectCasePath(projectId, role);
}

export function projectMessagesUrl(
  projectId: string,
  userId: string,
  project: ProjectParticipants
): string {
  return projectUrlForUser(projectId, userId, project, "messages");
}
