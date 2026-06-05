import { createAdminClient } from "@/lib/supabase/admin";

export type WorkflowSettings = {
  autoAssignCpi: boolean;
  defaultCpiUserId: string | null;
  autoMoveToInReview: boolean;
};

const DEFAULTS: WorkflowSettings = {
  autoAssignCpi: true,
  defaultCpiUserId: null,
  autoMoveToInReview: true,
};

export async function getWorkflowSettings(): Promise<WorkflowSettings> {
  const admin = createAdminClient();

  const { data } = await admin
    .from("settings")
    .select("value")
    .eq("key", "workflow")
    .maybeSingle();

  const value = (data?.value ?? {}) as Record<string, unknown>;

  return {
    autoAssignCpi:
      typeof value.auto_assign_cpi === "boolean"
        ? value.auto_assign_cpi
        : DEFAULTS.autoAssignCpi,
    defaultCpiUserId:
      typeof value.default_cpi_user_id === "string" ? value.default_cpi_user_id : null,
    autoMoveToInReview:
      typeof value.auto_move_to_in_review === "boolean"
        ? value.auto_move_to_in_review
        : DEFAULTS.autoMoveToInReview,
  };
}
