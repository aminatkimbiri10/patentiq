"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";

export type PatentDraftVersionRow = {
  id: string;
  created_at: string;
  title: string | null;
  saved_by: string | null;
};

export async function listPatentDraftVersions(
  projectId: string,
  limit = 8
): Promise<PatentDraftVersionRow[]> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("patent_draft_versions")
    .select("id, created_at, title, saved_by")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as PatentDraftVersionRow[];
}
