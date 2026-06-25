import type { AiSearch, AiSearchType } from "@/types/database";
import { projectAiSearchUrl, type ProjectViewerRole } from "@/lib/project-routes";

/** Items checklist liés à une recherche d'antériorité documentée dans I2PA */
export const PRIOR_ART_CHECKLIST_IDS = new Set([
  "anteriorite",
  "anteriorite-marque",
  "anteriorite-design",
]);

/** Items checklist liés à une analyse IA (antériorité, FTO, veille) */
export const AI_SEARCH_CHECKLIST_IDS = new Set([
  "anteriorite",
  "anteriorite-marque",
  "anteriorite-design",
  "fto",
]);

const PRIOR_ART_SEARCH_TYPES = new Set<AiSearchType>([
  "novelty",
  "semantic",
  "similarity",
  "fto",
]);

export function isPriorArtChecklistItem(itemId: string): boolean {
  return PRIOR_ART_CHECKLIST_IDS.has(itemId);
}

export function isAiSearchChecklistItem(itemId: string): boolean {
  return AI_SEARCH_CHECKLIST_IDS.has(itemId);
}

/** Type d'analyse IA pré-sélectionné depuis la checklist */
export function getPriorArtSearchTypeForItem(itemId: string): AiSearchType {
  if (itemId === "fto") return "fto";
  if (itemId === "anteriorite-marque") return "semantic";
  if (itemId === "anteriorite-design") return "similarity";
  return "novelty";
}

/** Types d'analyse qui valident l'item checklist */
export function getPriorArtSearchTypesForItem(itemId: string): Set<AiSearchType> {
  if (itemId === "fto") return new Set<AiSearchType>(["fto"]);
  if (itemId === "anteriorite-marque")
    return new Set<AiSearchType>(["novelty", "semantic"]);
  if (itemId === "anteriorite-design") return new Set<AiSearchType>(["similarity"]);
  return PRIOR_ART_SEARCH_TYPES;
}

export function getPriorArtDocumentationStatus(
  searches: Pick<AiSearch, "search_type" | "status" | "created_at">[],
  itemId?: string
) {
  const allowed = itemId ? getPriorArtSearchTypesForItem(itemId) : PRIOR_ART_SEARCH_TYPES;
  const completed = searches
    .filter((s) => allowed.has(s.search_type) && s.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  return {
    documented: completed.length > 0,
    count: completed.length,
    latestAt: completed[0]?.created_at ?? null,
  };
}

export function priorArtProjectUrl(
  projectId: string,
  itemId?: string,
  viewer: ProjectViewerRole = "holder"
): string {
  const searchType =
    itemId && isAiSearchChecklistItem(itemId)
      ? getPriorArtSearchTypeForItem(itemId)
      : undefined;
  return projectAiSearchUrl(projectId, viewer, searchType);
}
