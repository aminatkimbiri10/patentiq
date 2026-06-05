import type { ProjectStatus } from "@/types/database";
import { CPI_STATUSES } from "@/lib/workflow/status-permissions";

/** Transitions logiques autorisées pour le CPI (hors admin) */
export const CPI_GUIDED_TRANSITIONS: Partial<Record<ProjectStatus, ProjectStatus[]>> = {
  submitted: ["in_review", "awaiting_documents", "rejected"],
  in_review: ["awaiting_documents", "expert_review", "cpi_review", "rejected"],
  awaiting_documents: ["in_review", "expert_review", "cpi_review", "rejected"],
  expert_review: ["cpi_review", "awaiting_documents", "in_review"],
  cpi_review: ["approved", "rejected", "awaiting_documents", "expert_review"],
  approved: ["closed"],
  rejected: ["closed", "in_review"],
  closed: [],
};

export function getGuidedCpiStatusOptions(currentStatus: ProjectStatus): ProjectStatus[] {
  const next = CPI_GUIDED_TRANSITIONS[currentStatus];
  if (!next?.length) {
    if (CPI_STATUSES.includes(currentStatus)) return [currentStatus];
    return [currentStatus, ...CPI_STATUSES.filter((s) => s !== currentStatus)];
  }
  const options = new Set<ProjectStatus>([currentStatus, ...next]);
  return Array.from(options);
}

export function isCpiStatusTransitionAllowed(
  currentStatus: ProjectStatus,
  newStatus: ProjectStatus
): boolean {
  if (currentStatus === newStatus) return CPI_STATUSES.includes(newStatus);
  const allowed = CPI_GUIDED_TRANSITIONS[currentStatus];
  if (!allowed) return CPI_STATUSES.includes(newStatus);
  return allowed.includes(newStatus);
}
