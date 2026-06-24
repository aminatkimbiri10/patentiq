"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchRichProjectContext } from "@/lib/ai/project-chat-context";
import {
  generateOmpicResponse,
  type OmpicResponseDraft,
} from "@/lib/ai/ompic-irregularity";

export type DraftOmpicResponseResult = {
  success: boolean;
  error?: string;
  draft?: OmpicResponseDraft;
  source?: "huggingface" | "template";
  disclaimer?: string;
};

export async function draftOmpicResponse(
  projectId: string,
  notification: string
): Promise<DraftOmpicResponseResult> {
  await requireUser();

  const text = notification?.trim() ?? "";
  if (text.length < 20) {
    return {
      success: false,
      error: "Collez le texte de la notification d'irrégularité (au moins quelques lignes).",
    };
  }

  const supabase = await createClient();
  const { data: canView } = await supabase.rpc("can_view_project", {
    p_project_id: projectId,
  } as never);

  if (!canView) {
    return { success: false, error: "Accès refusé à ce dossier." };
  }

  try {
    const admin = createAdminClient();
    const ctx = await fetchRichProjectContext(admin, projectId, text);
    const result = await generateOmpicResponse(ctx, text);
    return {
      success: true,
      draft: result.draft,
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
