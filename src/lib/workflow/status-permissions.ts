import type { UserContext } from "@/lib/auth/get-user";
import { getGuidedCpiStatusOptions } from "@/lib/workflow/status-transitions";
import type { ProjectStatus } from "@/types/database";
/** Statuts que le porteur peut choisir */
export const HOLDER_STATUSES: ProjectStatus[] = ["draft", "submitted"];

/** Statuts gérés par le CPI (revue, documents, expert, décision) */
export const CPI_STATUSES: ProjectStatus[] = [
  "in_review",
  "awaiting_documents",
  "expert_review",
  "cpi_review",
  "approved",
  "rejected",
  "closed",
];

export const ALL_STATUSES: ProjectStatus[] = [
  "draft",
  "submitted",
  "in_review",
  "awaiting_documents",
  "expert_review",
  "cpi_review",
  "approved",
  "rejected",
  "closed",
];

export type StatusChangeMode = "holder" | "cpi" | "admin";

export type ProjectAccess = {
  id: string;
  owner_id: string;
  assigned_to: string | null;
  expert_id: string | null;
  status: ProjectStatus;
};

export function resolveStatusChangeMode(
  ctx: UserContext,
  project: ProjectAccess,
  options?: { isAdmin?: boolean; isCpiOnProject?: boolean }
): StatusChangeMode | null {
  if (options?.isAdmin) return "admin";
  if (options?.isCpiOnProject) return "cpi";
  if (project.owner_id === ctx.user.id) return "holder";
  return null;
}

export function getAllowedStatuses(mode: StatusChangeMode): ProjectStatus[] {
  switch (mode) {
    case "admin":
      return ALL_STATUSES;
    case "cpi":
      return CPI_STATUSES;
    case "holder":
      return HOLDER_STATUSES;
    default:
      return [];
  }
}

/** Options du select : statuts autorisés + statut actuel (lecture seule si hors liste) */
export function getStatusOptions(
  mode: StatusChangeMode,
  currentStatus: ProjectStatus
): ProjectStatus[] {
  if (mode === "cpi") return getGuidedCpiStatusOptions(currentStatus);
  const allowed = getAllowedStatuses(mode);
  if (allowed.includes(currentStatus)) return allowed;
  return [currentStatus, ...allowed.filter((s) => s !== currentStatus)];
}

export function isStatusAllowed(
  mode: StatusChangeMode,
  status: ProjectStatus
): boolean {
  return getAllowedStatuses(mode).includes(status);
}

export function statusModeLabel(mode: StatusChangeMode): string {
  switch (mode) {
    case "holder":
      return "Porteur — brouillon et soumission";
    case "cpi":
      return "Conseiller PI — revue et décision";
    case "admin":
      return "Administration — tous les statuts";
  }
}

export async function detectProjectRoles(
  ctx: UserContext,
  project: ProjectAccess,
  supabase: {
    rpc: (
      fn: string,
      args: Record<string, unknown>
    ) => PromiseLike<{ data: unknown }>;
  }
): Promise<{ isAdmin: boolean; isCpiOnProject: boolean }> {
  const [{ data: isAdmin }, { data: isCpiRole }, { data: isProjectCpi }] =
    await Promise.all([
      supabase.rpc("has_role", { p_role: "admin" }),
      supabase.rpc("has_role", { p_role: "cpi_advisor" }),
      supabase.rpc("is_project_cpi", { p_project_id: project.id }),
    ]);

  const isCpiOnProject =
    Boolean(isCpiRole) &&
    (project.assigned_to === ctx.user.id || Boolean(isProjectCpi));

  return {
    isAdmin: Boolean(isAdmin),
    isCpiOnProject,
  };
}

export function assertStatusChangeAllowed(
  mode: StatusChangeMode | null,
  newStatus: ProjectStatus
): void {
  if (!mode) {
    throw new Error("Vous n'êtes pas autorisé à modifier le statut de ce projet.");
  }
  if (!isStatusAllowed(mode, newStatus)) {
    throw new Error(
      `Le statut « ${newStatus} » n'est pas autorisé pour votre rôle.`
    );
  }
}
