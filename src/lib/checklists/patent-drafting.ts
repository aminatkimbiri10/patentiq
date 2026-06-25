import type { PatentClaimsDraft } from "@/lib/actions/patent-claims";
import type { PatentDraft } from "@/lib/actions/patent-draft";
import { projectCaseUrl, type ProjectViewerRole } from "@/lib/project-routes";

export type PiParcoursSection = "redaction" | "revendications" | "cycle";

export const DRAFTING_CHECKLIST_IDS = new Set(["revendications", "desc-technique"]);

export function isDraftingChecklistItem(itemId: string): boolean {
  return DRAFTING_CHECKLIST_IDS.has(itemId);
}

export function getPiSectionForChecklistItem(itemId: string): PiParcoursSection | null {
  if (itemId === "revendications") return "revendications";
  if (itemId === "desc-technique") return "redaction";
  return null;
}

export function projectPiParcoursUrl(
  projectId: string,
  piSection: PiParcoursSection,
  viewer: ProjectViewerRole = "holder"
): string {
  if (viewer === "cpi") {
    return projectCaseUrl(projectId, viewer, {
      tab: "dossier",
      section: "parcours-pi",
      pi: piSection,
    });
  }
  return `/dashboard/projects/${projectId}?tab=parcours&section=${piSection}&pi=${piSection}`;
}

export function getDraftingDocumentationStatus(
  itemId: string,
  patentDraft: PatentDraft | null | undefined,
  patentClaims: PatentClaimsDraft | null | undefined
) {
  if (itemId === "revendications") {
    const filled =
      !!patentClaims?.independent_claim?.trim() ||
      (patentClaims?.dependent_claims?.length ?? 0) > 0;
    return {
      documented: filled,
      latestAt: patentClaims?.updated_at ?? null,
    };
  }
  if (itemId === "desc-technique") {
    const filled =
      !!patentDraft?.description?.trim() ||
      !!patentDraft?.technical_field?.trim();
    return {
      documented: filled,
      latestAt: patentDraft?.updated_at ?? null,
    };
  }
  return { documented: false, latestAt: null as string | null };
}

export function patentDossierExportUrl(projectId: string): string {
  return `/api/projects/${projectId}/export-dossier`;
}

export function patentDossierPrintUrl(
  projectId: string,
  viewer: ProjectViewerRole = "holder"
): string {
  if (viewer === "cpi") return `/cpi/cases/${projectId}/export-dossier`;
  return `/dashboard/projects/${projectId}/export-dossier`;
}
