import type { SupabaseClient } from "@supabase/supabase-js";
import type { PatentClaimsDraft } from "@/lib/actions/patent-claims";
import type { PatentDraft } from "@/lib/actions/patent-draft";
import {
  computeAutoCheckedItems,
  mergeChecklistChecked,
  type AutoChecklistContext,
} from "@/lib/checklists/auto-sync";
import { checklistProgress, parseProjectChecklist } from "@/lib/checklists/parse";
import { getChecklistTemplate } from "@/lib/checklists/templates";
import type { AiSearch } from "@/types/database";

export async function loadAutoChecklistContext(
  supabase: SupabaseClient,
  projectId: string,
  extras: {
    aiSearches: Pick<AiSearch, "search_type" | "status" | "created_at">[];
    patentDraft: PatentDraft | null;
    patentClaims: PatentClaimsDraft | null;
    activeDocumentCount: number;
  }
): Promise<AutoChecklistContext> {
  const [{ count: watchCount }, { count: techCount }] = await Promise.all([
    supabase
      .from("ip_watchlist")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId)
      .eq("surveillance_active", true),
    supabase
      .from("ip_tech_watch")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId)
      .eq("is_active", true),
  ]);

  return {
    aiSearches: extras.aiSearches,
    patentDraft: extras.patentDraft,
    patentClaims: extras.patentClaims,
    hasActiveWatchlist: (watchCount ?? 0) > 0,
    hasActiveTechWatch: (techCount ?? 0) > 0,
    hasActiveDocuments: extras.activeDocumentCount > 0,
  };
}

export function buildEffectiveChecklistState(
  categorySlug: string | null | undefined,
  metadata: unknown,
  autoCtx: AutoChecklistContext
) {
  const template = getChecklistTemplate(categorySlug);
  const manualState = parseProjectChecklist(metadata);
  const dismissed = manualState.dismissed_auto ?? {};
  const autoChecked = computeAutoCheckedItems(template, autoCtx);
  const effectiveChecked = mergeChecklistChecked(
    manualState.checked,
    autoChecked,
    dismissed
  );
  const effectiveState = { ...manualState, checked: effectiveChecked };
  const itemIds = template.items.map((i) => i.id);
  const progress = checklistProgress(itemIds, effectiveState);

  return {
    template,
    manualState,
    autoChecked,
    effectiveState,
    progress,
  };
}
