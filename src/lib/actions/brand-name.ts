"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchRichProjectContext } from "@/lib/ai/project-chat-context";
import {
  generateBrandNames,
  type BrandNameSuggestion,
} from "@/lib/ai/brand-name-generator";

export type SuggestBrandNamesResult = {
  success: boolean;
  error?: string;
  suggestions?: BrandNameSuggestion[];
  source?: "huggingface" | "template";
  disclaimer?: string;
};

export async function suggestBrandNames(projectId: string): Promise<SuggestBrandNamesResult> {
  await requireUser();

  const supabase = await createClient();
  const { data: canView } = await supabase.rpc("can_view_project", {
    p_project_id: projectId,
  } as never);

  if (!canView) {
    return { success: false, error: "Accès refusé à ce dossier." };
  }

  try {
    const admin = createAdminClient();
    const ctx = await fetchRichProjectContext(admin, projectId);
    const result = await generateBrandNames(ctx);
    return {
      success: true,
      suggestions: result.suggestions,
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
