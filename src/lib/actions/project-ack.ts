"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { notifyUser } from "@/lib/notifications/notify-user";

const schema = z.object({
  project_id: z.string().uuid(),
});

export type AckDocumentsState = { success?: boolean; error?: string; message?: string };

export async function acknowledgeDocuments(
  _prev: AckDocumentsState,
  formData: FormData
): Promise<AckDocumentsState> {
  const ctx = await requireUser();
  const parsed = schema.safeParse({ project_id: formData.get("project_id") });
  if (!parsed.success) return { error: "Projet invalide" };

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, title, reference_code, owner_id, assigned_to, status")
    .eq("id", parsed.data.project_id)
    .single();

  if (!project) return { error: "Projet introuvable" };
  if (project.owner_id !== ctx.user.id) {
    return { error: "Seul le porteur peut accuser réception" };
  }
  if (project.status !== "awaiting_documents") {
    return { error: "Aucune demande de documents en cours" };
  }

  const ref = project.reference_code ?? project.id.slice(0, 8);

  await supabase.from("project_updates").insert({
    project_id: parsed.data.project_id,
    author_id: ctx.user.id,
    update_type: "validation",
    title: "Accusé de réception",
    content: `Le porteur a accusé réception de la demande de documents pour « ${project.title} ».`,
    metadata: { event: "documents_acknowledged" },
  });

  if (project.assigned_to) {
    await notifyUser({
      userId: project.assigned_to,
      projectId: parsed.data.project_id,
      notificationType: "info",
      title: "Porteur a accusé réception",
      body: `Le porteur a confirmé la prise en compte de la demande de pièces pour « ${project.title} » (${ref}).`,
      actionUrl: `/cpi/cases/${parsed.data.project_id}`,
      metadata: { event: "documents_acknowledged" },
    });
  }

  revalidatePath(`/dashboard/projects/${parsed.data.project_id}`);
  revalidatePath(`/cpi/cases/${parsed.data.project_id}`);

  return {
    success: true,
    message: "Votre accusé de réception a été transmis au conseiller PI.",
  };
}
