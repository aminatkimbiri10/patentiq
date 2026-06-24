"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { notifyUser } from "@/lib/notifications/notify-user";
import { projectUrlForUser } from "@/lib/notifications/project-url";

function formValue(value: FormDataEntryValue | null): string | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  return s.length ? s : undefined;
}

const createTaskSchema = z.object({
  project_id: z.string().uuid("Projet invalide"),
  title: z.string().min(1, "Titre requis").max(500),
  description: z.string().max(5000).optional(),
  due_at: z.string().optional(),
  assigned_to: z.string().uuid().optional(),
});

export type TaskActionState = { success?: boolean; error?: string; message?: string };

async function insertTask(
  ctx: Awaited<ReturnType<typeof requireUser>>,
  data: z.infer<typeof createTaskSchema>
): Promise<TaskActionState> {
  const supabase = await createClient();
  const assignee = data.assigned_to ?? ctx.user.id;

  const { data: project } = await supabase
    .from("projects")
    .select("title, reference_code, owner_id, assigned_to, expert_id")
    .eq("id", data.project_id)
    .single();

  const { error } = await supabase.from("project_tasks").insert({
    project_id: data.project_id,
    title: data.title,
    description: data.description ?? null,
    created_by: ctx.user.id,
    assigned_to: assignee,
    due_at: data.due_at ? new Date(data.due_at).toISOString() : null,
    priority: assignee !== ctx.user.id ? "high" : "medium",
  });

  if (error) return { error: error.message };

  if (assignee !== ctx.user.id && project) {
    const ref = project.reference_code ?? data.project_id.slice(0, 8);
    await notifyUser({
      userId: assignee,
      projectId: data.project_id,
      notificationType: "action_required",
      title: "Nouvelle tâche assignée",
      body: `Le conseiller PI vous demande : « ${data.title} » — projet « ${project.title} » (${ref}).`,
      actionUrl: project
        ? projectUrlForUser(data.project_id, assignee, {
            owner_id: project.owner_id as string,
            assigned_to: project.assigned_to as string | null,
            expert_id: project.expert_id as string | null,
          }, "tasks")
        : `/dashboard/projects/${data.project_id}?tab=echanges&section=tasks`,
      metadata: { event: "task_assigned", created_by: ctx.user.id },
    });
  }

  revalidatePath(`/dashboard/projects/${data.project_id}`);
  revalidatePath(`/cpi/cases/${data.project_id}`);
  revalidatePath("/dashboard/tasks");

  return { success: true, message: "Tâche créée." };
}

export async function createTask(
  _prev: TaskActionState,
  formData: FormData
): Promise<TaskActionState> {
  const ctx = await requireUser();
  const supabase = await createClient();

  const [{ data: isCpi }, { data: isAdmin }] = await Promise.all([
    supabase.rpc("has_role", { p_role: "cpi_advisor" }),
    supabase.rpc("has_role", { p_role: "admin" }),
  ]);
  if (!isCpi && !isAdmin) {
    return { error: "Seul le conseiller PI peut assigner des tâches" };
  }

  const parsed = createTaskSchema.safeParse({
    project_id: formValue(formData.get("project_id")),
    title: formValue(formData.get("title")),
    description: formValue(formData.get("description")),
    due_at: formValue(formData.get("due_at")),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Tâche invalide" };
  }

  return insertTask(ctx, parsed.data);
}

export async function createCpiTask(
  _prev: TaskActionState,
  formData: FormData
): Promise<TaskActionState> {
  const ctx = await requireUser();
  const supabase = await createClient();

  const { data: isCpi } = await supabase.rpc("has_role", { p_role: "cpi_advisor" });
  if (!isCpi) return { error: "Rôle CPI requis" };

  const parsed = createTaskSchema.safeParse({
    project_id: formValue(formData.get("project_id")),
    title: formValue(formData.get("title")),
    description: formValue(formData.get("description")),
    due_at: formValue(formData.get("due_at")),
    assigned_to: formValue(formData.get("assigned_to")),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Tâche invalide" };
  }

  const { data: isProjectCpi } = await supabase.rpc("is_project_cpi", {
    p_project_id: parsed.data.project_id,
  });
  if (!isProjectCpi) return { error: "Vous n'êtes pas assigné à ce dossier" };

  if (!parsed.data.assigned_to) {
    return { error: "Destinataire requis" };
  }

  return insertTask(ctx, parsed.data);
}

export async function createTaskFromChecklist(
  _prev: TaskActionState,
  formData: FormData
): Promise<TaskActionState> {
  const ctx = await requireUser();
  const supabase = await createClient();

  const { data: isCpi } = await supabase.rpc("has_role", { p_role: "cpi_advisor" });
  if (!isCpi) return { error: "Rôle CPI requis" };

  const projectId = formValue(formData.get("project_id"));
  const title = formValue(formData.get("title"));
  const description = formValue(formData.get("description"));
  const assignedTo = formValue(formData.get("assigned_to"));

  if (!projectId || !title || !assignedTo) {
    return { error: "Données invalides" };
  }

  const { data: isProjectCpi } = await supabase.rpc("is_project_cpi", {
    p_project_id: projectId,
  });
  if (!isProjectCpi) return { error: "Vous n'êtes pas assigné à ce dossier" };

  return insertTask(ctx, {
    project_id: projectId,
    title,
    description,
    assigned_to: assignedTo,
  });
}

export async function updateTaskStatus(taskId: string, projectId: string, status: string) {
  await requireUser();
  const supabase = await createClient();

  const updates: Record<string, unknown> = { status };
  if (status === "completed") {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("project_tasks")
    .update(updates)
    .eq("id", taskId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/cpi/cases/${projectId}`);
  revalidatePath("/dashboard/tasks");
}
