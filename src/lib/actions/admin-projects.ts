"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth/require-user";
import { logAction } from "@/lib/audit/log-action";
import { notifyUser } from "@/lib/notifications/notify-user";

const assignSchema = z.object({
  project_id: z.string().uuid(),
  assigned_to: z.string().uuid().optional().or(z.literal("")),
  expert_id: z.string().uuid().optional().or(z.literal("")),
});

async function requireAdmin() {
  const ctx = await requireUser();
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("has_role", { p_role: "admin" });
  if (!isAdmin) throw new Error("Accès administrateur requis");
  return ctx;
}

export type AdminAssignState = { success?: boolean; error?: string; message?: string };

export async function assignProjectMembers(
  _prev: AdminAssignState,
  formData: FormData
): Promise<AdminAssignState> {
  const ctx = await requireAdmin();

  const parsed = assignSchema.safeParse({
    project_id: formData.get("project_id"),
    assigned_to: formData.get("assigned_to") || "",
    expert_id: formData.get("expert_id") || "",
  });

  if (!parsed.success) return { error: "Données invalides" };

  const admin = createAdminClient();
  const cpiId = parsed.data.assigned_to || null;
  const expertId = parsed.data.expert_id || null;

  const { data: project, error: projErr } = await admin
    .from("projects")
    .select("id, title, reference_code, owner_id")
    .eq("id", parsed.data.project_id)
    .single();

  if (projErr || !project) return { error: "Projet introuvable" };

  const { error } = await admin
    .from("projects")
    .update({
      assigned_to: cpiId,
      expert_id: expertId,
    })
    .eq("id", parsed.data.project_id);

  if (error) return { error: error.message };

  if (cpiId) {
    await admin.from("project_members").upsert(
      {
        project_id: parsed.data.project_id,
        user_id: cpiId,
        member_role: "cpi_advisor",
        invited_by: ctx.user.id,
        can_edit: true,
        can_comment: true,
        can_upload: true,
      },
      { onConflict: "project_id,user_id" }
    );

    await notifyUser({
      userId: cpiId,
      projectId: parsed.data.project_id,
      notificationType: "action_required",
      title: "Dossier assigné",
      body: `Le projet « ${project.title} » vous a été assigné par un administrateur.`,
      actionUrl: `/cpi/cases/${parsed.data.project_id}`,
    });
  }

  if (expertId) {
    await admin.from("project_members").upsert(
      {
        project_id: parsed.data.project_id,
        user_id: expertId,
        member_role: "expert",
        invited_by: ctx.user.id,
        can_edit: false,
        can_comment: true,
        can_upload: true,
      },
      { onConflict: "project_id,user_id" }
    );

    await notifyUser({
      userId: expertId,
      projectId: parsed.data.project_id,
      notificationType: "action_required",
      title: "Mission d'expertise",
      body: `Le projet « ${project.title} » vous est confié pour analyse technique.`,
      actionUrl: `/expert/projects/${parsed.data.project_id}`,
    });
  }

  await logAction({
    action: "assignment",
    entityType: "project",
    entityId: parsed.data.project_id,
    projectId: parsed.data.project_id,
    newData: { assigned_to: cpiId, expert_id: expertId },
  });

  revalidatePath(`/admin/projects/${parsed.data.project_id}`);
  revalidatePath("/admin/projects");
  revalidatePath("/cpi/cases");
  revalidatePath("/expert/assigned-projects");

  return {
    success: true,
    message: "Assignations mises à jour.",
  };
}
