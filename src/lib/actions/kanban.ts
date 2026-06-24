"use server";

import { revalidatePath } from "next/cache";
import { updateProjectStatus } from "@/lib/actions/projects";
import type { ProjectStatus } from "@/types/database";

export async function cpiKanbanMove(
  projectId: string,
  newStatus: ProjectStatus
): Promise<{ success?: boolean; error?: string; message?: string }> {
  const formData = new FormData();
  formData.set("project_id", projectId);
  formData.set("status", newStatus);
  formData.set("status_mode", "cpi");

  const result = await updateProjectStatus({}, formData);

  if (result.success) {
    revalidatePath("/cpi/kanban");
    revalidatePath(`/cpi/cases/${projectId}`);
  }

  return result;
}
