import { createAdminClient } from "@/lib/supabase/admin";
import { handleProjectSubmitted } from "@/lib/workflow/on-project-submitted";
import type { ProjectStatus } from "@/types/database";

/** Répare les projets soumis sans CPI assigné (workflow raté). */
export async function repairUnassignedSubmittedProjects(): Promise<number> {
  const admin = createAdminClient();

  const { data: stuck, error } = await admin
    .from("projects")
    .select("id, owner_id, status")
    .eq("status", "submitted")
    .is("assigned_to", null);

  if (error) throw new Error(error.message);

  let repaired = 0;
  for (const project of stuck ?? []) {
    try {
      await handleProjectSubmitted(
        project.id,
        project.owner_id,
        "draft" as ProjectStatus
      );
      repaired += 1;
    } catch (e) {
      console.error("[workflow] repair failed for", project.id, e);
    }
  }

  return repaired;
}
