import type { PatentClaimsDraft } from "@/lib/actions/patent-claims";
import type { PatentDraft } from "@/lib/actions/patent-draft";
import {
  getDraftingDocumentationStatus,
  isDraftingChecklistItem,
} from "@/lib/checklists/patent-drafting";
import {
  getPriorArtDocumentationStatus,
  isAiSearchChecklistItem,
} from "@/lib/checklists/prior-art";
import type { ChecklistTemplate } from "@/lib/checklists/templates";
import type { AiSearch } from "@/types/database";

export type AutoChecklistContext = {
  aiSearches: Pick<AiSearch, "search_type" | "status" | "created_at">[];
  patentDraft: PatentDraft | null;
  patentClaims: PatentClaimsDraft | null;
  /** Actif portefeuille lié au projet avec surveillance active */
  hasActiveWatchlist: boolean;
  /** Veille techno active liée au projet */
  hasActiveTechWatch: boolean;
  /** Au moins un document actif dans le dossier */
  hasActiveDocuments: boolean;
};

/** Items validés automatiquement selon l'état réel du dossier. */
export function computeAutoCheckedItems(
  template: ChecklistTemplate,
  ctx: AutoChecklistContext
): Record<string, boolean> {
  const auto: Record<string, boolean> = {};

  for (const item of template.items) {
    if (isAiSearchChecklistItem(item.id)) {
      const { documented } = getPriorArtDocumentationStatus(ctx.aiSearches, item.id);
      if (documented) auto[item.id] = true;
      continue;
    }

    if (isDraftingChecklistItem(item.id)) {
      const { documented } = getDraftingDocumentationStatus(
        item.id,
        ctx.patentDraft,
        ctx.patentClaims
      );
      if (documented) auto[item.id] = true;
      continue;
    }

    if (item.id === "surveillance-portefeuille" && ctx.hasActiveWatchlist) {
      auto[item.id] = true;
    }
    if (item.id === "mots-cles" && ctx.hasActiveTechWatch) {
      auto[item.id] = true;
    }
    if (item.id === "figures" && ctx.hasActiveDocuments) {
      auto[item.id] = true;
    }
    if (item.id === "docs" && ctx.hasActiveDocuments) {
      auto[item.id] = true;
    }
  }

  return auto;
}

export function mergeChecklistChecked(
  manual: Record<string, boolean>,
  auto: Record<string, boolean>,
  dismissedAuto: Record<string, boolean> = {}
): Record<string, boolean> {
  const merged = { ...manual };
  for (const [id, val] of Object.entries(auto)) {
    if (val && !dismissedAuto[id]) merged[id] = true;
  }
  return merged;
}

export function isAutoCheckedOnly(
  itemId: string,
  manual: Record<string, boolean>,
  auto: Record<string, boolean>
): boolean {
  return !!auto[itemId] && manual[itemId] !== true;
}
