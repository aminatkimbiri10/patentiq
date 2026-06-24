import { createAdminClient } from "@/lib/supabase/admin";
import { notifyUsers } from "@/lib/notifications/notify-user";
import { assignCpiToProject, pickCpiAdvisor } from "@/lib/workflow/assign-cpi";
import { getWorkflowSettings } from "@/lib/workflow/settings";
import { PROJECT_STATUS_LABELS } from "@/config/constants";
import type { ProjectStatus } from "@/types/database";

export type ProjectSubmittedResult = {
  assignedCpiId: string | null;
  assignedCpiName: string | null;
  finalStatus: ProjectStatus;
  notifiedUserIds: string[];
};

export async function handleProjectSubmitted(
  projectId: string,
  actorId: string,
  previousStatus: ProjectStatus
): Promise<ProjectSubmittedResult> {
  const admin = createAdminClient();
  const settings = await getWorkflowSettings();

  const { data: project, error } = await admin
    .from("projects")
    .select("id, title, reference_code, owner_id, assigned_to, status")
    .eq("id", projectId)
    .single();

  if (error || !project) {
    throw new Error(error?.message ?? "Projet introuvable");
  }

  const ref = project.reference_code ?? project.id.slice(0, 8);
  let assignedCpiId: string | null = project.assigned_to;
  let assignedCpiName: string | null = null;
  let finalStatus: ProjectStatus = "submitted";
  const notifiedUserIds: string[] = [];

  if (settings.autoAssignCpi && !assignedCpiId) {
    const cpi = await pickCpiAdvisor(settings.defaultCpiUserId);
    if (cpi) {
      await assignCpiToProject(projectId, cpi.userId, actorId);
      assignedCpiId = cpi.userId;
      assignedCpiName = cpi.fullName;
    }
  } else if (assignedCpiId) {
    const { data: profile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", assignedCpiId)
      .single();
    assignedCpiName = profile?.full_name ?? null;
  }

  if (settings.autoMoveToInReview && assignedCpiId) {
    finalStatus = "in_review";
    await admin.from("projects").update({ status: finalStatus }).eq("id", projectId);
  }

  const statusLabel = PROJECT_STATUS_LABELS[finalStatus];

  await admin.from("project_updates").insert({
    project_id: projectId,
    author_id: actorId,
    update_type: "status_change",
    title: "Dossier soumis",
    content: assignedCpiId
      ? `Projet soumis et assigné à ${assignedCpiName ?? "un conseiller PI"}. Statut : ${statusLabel}.`
      : `Projet soumis. Statut : ${statusLabel}. En attente d'assignation CPI.`,
    old_value: { status: previousStatus },
    new_value: { status: finalStatus, assigned_to: assignedCpiId },
    metadata: { workflow: "auto_submit", actor_id: actorId },
  });

  const notifications: Parameters<typeof notifyUsers>[0] = [];

  if (assignedCpiId) {
    notifications.push({
      userId: assignedCpiId,
      projectId,
      notificationType: "action_required",
      title: "Nouveau dossier à traiter",
      body: `Le projet « ${project.title} » (${ref}) vient d'être soumis et vous est assigné.`,
      actionUrl: `/cpi/cases/${projectId}`,
      metadata: { event: "project_submitted", previous_status: previousStatus },
    });
    notifiedUserIds.push(assignedCpiId);
  } else {
    const { data: adminRole } = await admin
      .from("roles")
      .select("id")
      .eq("role_name", "admin")
      .maybeSingle();

    const { data: admins } = adminRole
      ? await admin.from("user_roles").select("user_id").eq("role_id", adminRole.id)
      : { data: [] };

    for (const row of admins ?? []) {
      notifications.push({
        userId: row.user_id as string,
        projectId,
        notificationType: "warning",
        title: "Dossier soumis sans CPI",
        body: `Le projet « ${project.title} » (${ref}) est soumis mais aucun conseiller PI n'est disponible.`,
        actionUrl: `/admin/projects/${projectId}`,
        metadata: { event: "project_submitted_unassigned" },
      });
      notifiedUserIds.push(row.user_id as string);
    }
  }

  notifications.push({
    userId: project.owner_id,
      projectId,
      notificationType: "success",
      title: "Dossier soumis",
      body: assignedCpiId
        ? `Votre projet « ${project.title} » a été transmis à ${assignedCpiName ?? "votre conseiller PI"}. Statut : ${statusLabel}.`
        : `Votre projet « ${project.title} » a été soumis. Un conseiller sera assigné prochainement.`,
      actionUrl: `/dashboard/projects/${projectId}`,
      metadata: { event: "project_submitted_owner", final_status: finalStatus },
  });
  notifiedUserIds.push(project.owner_id);

  await notifyUsers(notifications);

  return {
    assignedCpiId,
    assignedCpiName,
    finalStatus,
    notifiedUserIds,
  };
}
