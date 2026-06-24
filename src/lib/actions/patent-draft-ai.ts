"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchRichProjectContext } from "@/lib/ai/project-chat-context";
import {
  generatePatentDraftSections,
  type PatentDraftSections,
} from "@/lib/ai/patent-draft-generator";

export type SuggestPatentDraftResult = {
  success: boolean;
  error?: string;
  sections?: PatentDraftSections;
  source?: "huggingface" | "template";
  disclaimer?: string;
};

export async function suggestPatentDraft(projectId: string): Promise<SuggestPatentDraftResult> {
  await requireUser();
  const supabase = await createClient();

  const { data: canView } = await supabase.rpc("can_view_project", {
    p_project_id: projectId,
  } as never);

  if (!canView) {
    return { success: false, error: "Accès refusé à ce dossier." };
  }

  const admin = createAdminClient();
  const ctx = await fetchRichProjectContext(admin, projectId);

  const { data: claims } = await supabase
    .from("patent_claims_drafts")
    .select("independent_claim")
    .eq("project_id", projectId)
    .maybeSingle();

  try {
    const result = await generatePatentDraftSections(ctx, {
      independentClaim: claims?.independent_claim ?? null,
    });

    return {
      success: true,
      sections: result.sections,
      source: result.source,
      disclaimer: result.disclaimer,
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Génération impossible",
    };
  }
}
