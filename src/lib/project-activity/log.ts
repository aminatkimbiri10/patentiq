import type { SupabaseClient } from "@supabase/supabase-js";

export type ProjectActivityKind =
  | "draft_saved"
  | "claims_saved"
  | "dossier_exported"
  | "opposition_updated"
  | "checklist_auto";

export async function logProjectActivity(
  supabase: SupabaseClient,
  input: {
    projectId: string;
    authorId: string;
    kind: ProjectActivityKind;
    title: string;
    content?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  await supabase.from("project_updates").insert({
    project_id: input.projectId,
    author_id: input.authorId,
    update_type: "system",
    title: input.title,
    content: input.content ?? null,
    metadata: { kind: input.kind, ...input.metadata },
  });
}
