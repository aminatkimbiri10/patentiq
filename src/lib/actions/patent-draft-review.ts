"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { getPatentDraft } from "@/lib/actions/patent-draft";
import { getPatentClaimsDraft } from "@/lib/actions/patent-claims";
import { reviewPatentDraft, type DraftReview } from "@/lib/ai/patent-draft-review";

export type ReviewPatentDraftResult = {
  success: boolean;
  error?: string;
  review?: DraftReview;
};

export async function reviewPatentDraftAction(
  projectId: string
): Promise<ReviewPatentDraftResult> {
  await requireUser();

  const supabase = await createClient();
  const { data: canView } = await supabase.rpc("can_view_project", {
    p_project_id: projectId,
  } as never);

  if (!canView) {
    return { success: false, error: "Accès refusé à ce dossier." };
  }

  const [draft, claims] = await Promise.all([
    getPatentDraft(projectId),
    getPatentClaimsDraft(projectId),
  ]);

  if (!draft && !claims) {
    return {
      success: false,
      error: "Aucun brouillon ni revendication à analyser. Renseignez d'abord la rédaction.",
    };
  }

  const review = reviewPatentDraft({
    title: draft?.title,
    technical_field: draft?.technical_field,
    background: draft?.background,
    description: draft?.description,
    abstract: draft?.abstract,
    independentClaim: claims?.independent_claim,
    dependentClaims: claims?.dependent_claims,
  });

  return { success: true, review };
}
