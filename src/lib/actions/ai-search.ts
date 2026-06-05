"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import type { AiSearchType } from "@/types/database";

export async function createAiSearchPlaceholder(
  projectId: string,
  searchType: AiSearchType = "novelty",
  query?: string
) {
  const ctx = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ai_searches")
    .insert({
      project_id: projectId,
      requested_by: ctx.user.id,
      search_type: searchType,
      status: "pending",
      query: query ?? null,
      parameters: { provider: "stub", queued_at: new Date().toISOString() },
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { searchId: data.id, status: "pending" as const };
}
