"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";

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
});

export type TaskActionState = { success?: boolean; error?: string };

export async function createTask(
  _prev: TaskActionState,
  formData: FormData
): Promise<TaskActionState> {
  const ctx = await requireUser();
  const parsed = createTaskSchema.safeParse({
    project_id: formValue(formData.get("project_id")),
    title: formValue(formData.get("title")),
    description: formValue(formData.get("description")),
    due_at: formValue(formData.get("due_at")),
  });

  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? "Tâche invalide";
    return { error: message };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("project_tasks").insert({
    project_id: parsed.data.project_id,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    created_by: ctx.user.id,
    assigned_to: ctx.user.id,
    due_at: parsed.data.due_at ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/projects/${parsed.data.project_id}`);
  revalidatePath(`/cpi/cases/${parsed.data.project_id}`);
  revalidatePath("/dashboard/tasks");

  return { success: true };
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
