import { PROJECT_STATUS_LABELS } from "@/config/constants";
import type { Project, ProjectStatus } from "@/types/database";

/** Colonnes du pipeline CPI (hors brouillon / clôturé) */
export const CPI_KANBAN_COLUMNS: ProjectStatus[] = [
  "submitted",
  "in_review",
  "awaiting_documents",
  "expert_review",
  "cpi_review",
  "approved",
  "rejected",
];

export type KanbanColumn = {
  status: ProjectStatus;
  label: string;
  projects: Project[];
};

const STALE_STATUSES: ProjectStatus[] = ["awaiting_documents", "expert_review"];
const STALE_DAYS = 7;

export function isStaleCase(project: Project): boolean {
  if (!STALE_STATUSES.includes(project.status)) return false;
  const staleMs = STALE_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(project.last_activity_at).getTime() > staleMs;
}

export function groupProjectsForKanban(projects: Project[]): KanbanColumn[] {
  const active = projects.filter((p) => p.status !== "draft" && p.status !== "closed");
  const closed = projects.filter((p) => p.status === "closed");

  const columns: KanbanColumn[] = CPI_KANBAN_COLUMNS.map((status) => ({
    status,
    label: PROJECT_STATUS_LABELS[status],
    projects: active.filter((p) => p.status === status),
  }));

  if (closed.length) {
    columns.push({
      status: "closed",
      label: PROJECT_STATUS_LABELS.closed,
      projects: closed,
    });
  }

  return columns;
}
