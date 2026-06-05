"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";

type AuditParams = {
  action: string;
  entityType: string;
  entityId?: string;
  projectId?: string;
  oldData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
};

/** Journalise une action via la fonction RPC write_audit_log */
export async function logAction(params: AuditParams) {
  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.rpc("write_audit_log", {
    p_action: params.action,
    p_entity_type: params.entityType,
    p_entity_id: params.entityId ?? null,
    p_project_id: params.projectId ?? null,
    p_old_data: params.oldData ?? null,
    p_new_data: params.newData ?? null,
    p_metadata: {},
  } as never);

  if (error) console.error("[audit]", error.message);
}
