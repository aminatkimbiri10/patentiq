"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { insertProjectForUser } from "@/lib/projects/create-project";
import { handleProjectSubmitted } from "@/lib/workflow/on-project-submitted";
import { handleExpertReviewRequested } from "@/lib/workflow/on-expert-review";
import { logAction } from "@/lib/audit/log-action";
import {
  assertStatusChangeAllowed,
  type StatusChangeMode,
} from "@/lib/workflow/status-permissions";
import { isCpiStatusTransitionAllowed } from "@/lib/workflow/status-transitions";
import { notifyUser } from "@/lib/notifications/notify-user";
import { projectUrlForUser } from "@/lib/notifications/project-url";
import { PROJECT_STATUS_LABELS } from "@/config/constants";
import { createProjectSchema } from "@/lib/validations/project";
import type { ProjectStatus } from "@/types/database";

const OWNER_NOTIFY_STATUSES: ProjectStatus[] = [
  "awaiting_documents",
  "approved",
  "rejected",
  "closed",
];

const updateStatusSchema = z.object({
  project_id: z.string().uuid(),
  status: z.enum([
    "draft",
    "submitted",
    "in_review",
    "awaiting_documents",
    "expert_review",
    "cpi_review",
    "approved",
    "rejected",
    "closed",
  ]),
  status_mode: z.enum(["holder", "cpi", "admin"]).optional(),
});

export type ProjectStatusActionState = {
  success?: boolean;
  message?: string;
  error?: string;
};

export type DeleteProjectResult = { success?: boolean; error?: string };

export async function deleteProject(projectId: string): Promise<DeleteProjectResult> {
  const ctx = await requireUser();
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("owner_id, title, reference_code")
    .eq("id", projectId)
    .single();

  if (!project) return { error: "Projet introuvable" };
  if (project.owner_id !== ctx.user.id) {
    return { error: "Seul le porteur peut supprimer ce dossier." };
  }

  const { error } = await supabase.from("projects").delete().eq("id", projectId);

  if (error) return { error: error.message };

  await logAction({
    action: "delete",
    entityType: "project",
    entityId: projectId,
    projectId,
    oldData: { title: project.title, reference_code: project.reference_code },
  });

  revalidatePath("/dashboard/projects");
  revalidatePath("/cpi/cases");
  revalidatePath("/admin/projects");

  return { success: true };
}

export async function createProject(formData: FormData) {
  const ctx = await requireUser();

  const parsed = createProjectSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    invention_summary: formData.get("invention_summary"),
    need_description: formData.get("need_description"),
    category_id: formData.get("category_id") || undefined,
  });

  if (!parsed.success) {
    throw new Error("Données invalides");
  }

  const projectId = await insertProjectForUser(ctx, parsed.data);

  revalidatePath("/dashboard/projects");
  redirect(`/dashboard/projects/${projectId}`);
}

async function resolveStatusMode(
  ctx: Awaited<ReturnType<typeof requireUser>>,
  projectId: string,
  requestedMode?: StatusChangeMode
): Promise<StatusChangeMode> {
  const supabase = await createClient();

  const [{ data: isAdmin }, { data: project }] = await Promise.all([
    supabase.rpc("has_role", { p_role: "admin" }),
    supabase
      .from("projects")
      .select("owner_id, assigned_to")
      .eq("id", projectId)
      .single(),
  ]);

  if (!project) throw new Error("Projet introuvable");

  if (requestedMode === "admin" && isAdmin) return "admin";
  if (requestedMode === "cpi") {
    const { data: isCpi } = await supabase.rpc("is_project_cpi", {
      p_project_id: projectId,
    });
    if (isCpi) return "cpi";
  }
  if (requestedMode === "holder" && project.owner_id === ctx.user.id) return "holder";

  if (isAdmin) return "admin";
  const { data: isCpi } = await supabase.rpc("is_project_cpi", {
    p_project_id: projectId,
  });
  if (isCpi) return "cpi";
  if (project.owner_id === ctx.user.id) return "holder";

  throw new Error("Vous n'êtes pas autorisé à modifier le statut de ce projet.");
}

export async function updateProjectStatus(
  _prev: ProjectStatusActionState,
  formData: FormData
): Promise<ProjectStatusActionState> {
  const ctx = await requireUser();
  const parsed = updateStatusSchema.safeParse({
    project_id: formData.get("project_id"),
    status: formData.get("status"),
    status_mode: formData.get("status_mode") || undefined,
  });

  if (!parsed.success) return { error: "Statut invalide" };

  const supabase = await createClient();

  const { data: current } = await supabase
    .from("projects")
    .select("status, assigned_to, expert_id, owner_id, title, reference_code")
    .eq("id", parsed.data.project_id)
    .single();

  const previousStatus = (current?.status ?? "draft") as ProjectStatus;

  let mode: StatusChangeMode;
  try {
    mode = await resolveStatusMode(
      ctx,
      parsed.data.project_id,
      parsed.data.status_mode as StatusChangeMode | undefined
    );
    assertStatusChangeAllowed(mode, parsed.data.status);
    if (
      mode === "cpi" &&
      !isCpiStatusTransitionAllowed(previousStatus, parsed.data.status)
    ) {
      throw new Error(
        `Transition non autorisée : ${previousStatus} → ${parsed.data.status}`
      );
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Accès refusé" };
  }
  const needsSubmitWorkflow =
    parsed.data.status === "submitted" &&
    (previousStatus !== "submitted" || !current?.assigned_to);
  const needsExpertWorkflow =
    parsed.data.status === "expert_review" && previousStatus !== "expert_review";

  const updates: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.status === "closed") {
    updates.closed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", parsed.data.project_id);

  if (error) return { error: error.message };

  if (previousStatus !== parsed.data.status) {
    await logAction({
      action: "status_change",
      entityType: "project",
      entityId: parsed.data.project_id,
      projectId: parsed.data.project_id,
      oldData: { status: previousStatus },
      newData: { status: parsed.data.status, mode },
    });
  }

  let workflowMessage: string | undefined;

  if (needsSubmitWorkflow) {
    try {
      const result = await handleProjectSubmitted(
        parsed.data.project_id,
        ctx.user.id,
        previousStatus
      );
      workflowMessage = result.assignedCpiName
        ? `Dossier soumis — assigné à ${result.assignedCpiName}. Statut : ${result.finalStatus === "in_review" ? "En revue" : "Soumis"}.`
        : "Dossier soumis — en attente d'assignation CPI.";
    } catch (e) {
      console.error("[workflow] project submitted:", e);
      workflowMessage =
        "Dossier soumis. L'assignation automatique a échoué — contactez le support.";
    }
  }

  if (
    previousStatus !== parsed.data.status &&
    current?.owner_id &&
    (mode === "cpi" || mode === "admin") &&
    OWNER_NOTIFY_STATUSES.includes(parsed.data.status)
  ) {
    const ref = current.reference_code ?? parsed.data.project_id.slice(0, 8);
    const label = PROJECT_STATUS_LABELS[parsed.data.status];
    await notifyUser({
      userId: current.owner_id,
      projectId: parsed.data.project_id,
      notificationType:
        parsed.data.status === "rejected" ? "warning" : "info",
      title: `Statut mis à jour : ${label}`,
      body: `Votre projet « ${current.title} » (${ref}) est passé au statut « ${label} ».`,
      actionUrl: projectUrlForUser(
        parsed.data.project_id,
        current.owner_id,
        {
          owner_id: current.owner_id,
          assigned_to: current.assigned_to,
          expert_id: current.expert_id,
        }
      ),
      metadata: {
        event: "status_change_owner",
        from: previousStatus,
        to: parsed.data.status,
      },
    });
  }

  if (needsExpertWorkflow) {
    try {
      const result = await handleExpertReviewRequested(
        parsed.data.project_id,
        ctx.user.id
      );
      if (result.expertName) {
        workflowMessage = `Revue expert — assigné à ${result.expertName}.`;
      } else {
        workflowMessage =
          "Revue expert demandée. Aucun expert disponible — l'admin assignera manuellement.";
      }
    } catch (e) {
      console.error("[workflow] expert review:", e);
    }
  }

  revalidatePath(`/dashboard/projects/${parsed.data.project_id}`);
  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard/notifications");
  revalidatePath("/cpi/cases");
  revalidatePath(`/cpi/cases/${parsed.data.project_id}`);
  revalidatePath("/expert/assigned-projects");
  revalidatePath("/admin/projects");

  return {
    success: true,
    message: workflowMessage ?? "Statut mis à jour.",
  };
}
