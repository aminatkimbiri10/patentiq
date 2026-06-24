"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { parseProjectChecklist } from "@/lib/checklists/parse";

const toggleSchema = z.object({
  project_id: z.string().uuid(),
  item_id: z.string().min(1).max(64),
  checked: z.enum(["true", "false"]),
});

export type ChecklistActionState = { success?: boolean; error?: string };

export async function toggleChecklistItem(
  _prev: ChecklistActionState,
  formData: FormData
): Promise<ChecklistActionState> {
  const ctx = await requireUser();
  const parsed = toggleSchema.safeParse({
    project_id: formData.get("project_id"),
    item_id: formData.get("item_id"),
    checked: formData.get("checked"),
  });

  if (!parsed.success) {
    return { error: "Données invalides" };
  }

  const supabase = await createClient();
  const { data: canEdit } = await supabase.rpc("can_edit_project", {
    p_project_id: parsed.data.project_id,
  } as never);
  const { data: isCpi } = await supabase.rpc("is_project_cpi", {
    p_project_id: parsed.data.project_id,
  } as never);

  if (!canEdit && !isCpi) {
    return { error: "Vous ne pouvez pas modifier cette checklist" };
  }

  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("metadata")
    .eq("id", parsed.data.project_id)
    .single();

  if (fetchError || !project) {
    return { error: fetchError?.message ?? "Projet introuvable" };
  }

  const current = parseProjectChecklist(project.metadata);
  const checked = parsed.data.checked === "true";
  const nextChecked = { ...current.checked, [parsed.data.item_id]: checked };

  const metadata =
    project.metadata && typeof project.metadata === "object"
      ? { ...(project.metadata as Record<string, unknown>) }
      : {};

  const { error } = await supabase
    .from("projects")
    .update({
      metadata: {
        ...metadata,
        checklist: {
          checked: nextChecked,
          updated_at: new Date().toISOString(),
          updated_by: ctx.user.id,
        },
      },
    })
    .eq("id", parsed.data.project_id);

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/projects/${parsed.data.project_id}`);
  revalidatePath(`/cpi/cases/${parsed.data.project_id}`);

  return { success: true };
}
