"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logAction } from "@/lib/audit/log-action";
import { requireUser } from "@/lib/auth/require-user";

const workflowSchema = z.object({
  auto_assign_cpi: z
    .union([z.literal("on"), z.literal("true"), z.null(), z.undefined()])
    .transform((v) => v === "on" || v === "true"),
  auto_move_to_in_review: z
    .union([z.literal("on"), z.literal("true"), z.null(), z.undefined()])
    .transform((v) => v === "on" || v === "true"),
  default_cpi_user_id: z.string().uuid().optional().or(z.literal("")),
});

async function requireAdmin() {
  const ctx = await requireUser();
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("has_role", { p_role: "admin" });
  if (!isAdmin) throw new Error("Accès administrateur requis");
  return { ctx, supabase };
}

export type WorkflowSettingsState = { success?: boolean; error?: string; message?: string };

export type WorkflowSettingsFormValues = {
  autoAssignCpi: boolean;
  autoMoveToInReview: boolean;
  defaultCpiUserId: string | null;
};

export async function getWorkflowSettingsForAdmin(): Promise<WorkflowSettingsFormValues> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "workflow")
    .maybeSingle();

  const value = (data?.value ?? {}) as Record<string, unknown>;
  return {
    autoAssignCpi: value.auto_assign_cpi !== false,
    autoMoveToInReview: value.auto_move_to_in_review !== false,
    defaultCpiUserId:
      typeof value.default_cpi_user_id === "string" ? value.default_cpi_user_id : null,
  };
}

export async function updateWorkflowSettings(
  _prev: WorkflowSettingsState,
  formData: FormData
): Promise<WorkflowSettingsState> {
  const parsed = workflowSchema.safeParse({
    auto_assign_cpi: formData.get("auto_assign_cpi"),
    auto_move_to_in_review: formData.get("auto_move_to_in_review"),
    default_cpi_user_id: formData.get("default_cpi_user_id") || "",
  });

  if (!parsed.success) return { error: "Paramètres invalides" };

  try {
    const { ctx, supabase } = await requireAdmin();

    const value = {
      default_project_status: "draft",
      auto_assign_cpi: parsed.data.auto_assign_cpi,
      auto_move_to_in_review: parsed.data.auto_move_to_in_review,
      default_cpi_user_id: parsed.data.default_cpi_user_id || null,
    };

    const { error } = await supabase
      .from("settings")
      .update({
        value,
        updated_by: ctx.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq("key", "workflow");

    if (error) return { error: error.message };

    await logAction({
      action: "settings_change",
      entityType: "settings",
      entityId: "workflow",
      newData: value,
    });

    revalidatePath("/admin/settings");
    return { success: true, message: "Paramètres workflow enregistrés." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur" };
  }
}
