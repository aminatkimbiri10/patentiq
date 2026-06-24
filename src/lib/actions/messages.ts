"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/auth/require-user";
import { notifyUser } from "@/lib/notifications/notify-user";
import { projectMessagesUrl } from "@/lib/notifications/project-url";
import { markProjectMessagesRead } from "@/lib/messages/read-cursor";
import { markProjectNotificationsRead } from "@/lib/notifications/mark-project-read";

function formValue(value: FormDataEntryValue | null): string | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  return s.length ? s : undefined;
}

const sendSchema = z.object({
  project_id: z.string().uuid(),
  body: z.string().min(1, "Message requis").max(5000),
});

export type MessageActionState = { success?: boolean; error?: string };

export type ProjectMessage = {
  id: string;
  body: string;
  created_at: string;
  sender_id: string;
  profiles?: { full_name: string | null; email: string } | null;
};

async function getProjectCollaborators(
  projectId: string,
  excludeUserId: string
): Promise<string[]> {
  const admin = createAdminClient();
  const { data: project } = await admin
    .from("projects")
    .select("owner_id, assigned_to, expert_id, title, reference_code")
    .eq("id", projectId)
    .single();

  if (!project) return [];

  const { data: members } = await admin
    .from("project_members")
    .select("user_id")
    .eq("project_id", projectId);

  const ids = new Set<string>();
  if (project.owner_id) ids.add(project.owner_id as string);
  if (project.assigned_to) ids.add(project.assigned_to as string);
  if (project.expert_id) ids.add(project.expert_id as string);
  for (const m of members ?? []) ids.add(m.user_id as string);
  ids.delete(excludeUserId);

  return Array.from(ids);
}

export async function sendProjectMessage(
  _prev: MessageActionState,
  formData: FormData
): Promise<MessageActionState> {
  const ctx = await requireUser();
  const parsed = sendSchema.safeParse({
    project_id: formValue(formData.get("project_id")),
    body: formValue(formData.get("body")),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Message invalide" };
  }

  const supabase = await createClient();
  const { data: canView } = await supabase.rpc("can_view_project", {
    p_project_id: parsed.data.project_id,
  } as never);
  if (!canView) return { error: "Accès refusé" };

  const { error } = await supabase.from("messages").insert({
    project_id: parsed.data.project_id,
    sender_id: ctx.user.id,
    message_type: "project_thread",
    body: parsed.data.body,
  });

  if (error) return { error: error.message };

  const admin = createAdminClient();
  const { data: project } = await admin
    .from("projects")
    .select("title, reference_code, owner_id, assigned_to, expert_id")
    .eq("id", parsed.data.project_id)
    .single();

  const ref = project?.reference_code ?? parsed.data.project_id.slice(0, 8);
  const senderName = ctx.profile?.full_name ?? ctx.user.email;
  const preview =
    parsed.data.body.length > 120
      ? `${parsed.data.body.slice(0, 120)}…`
      : parsed.data.body;

  const collaborators = await getProjectCollaborators(
    parsed.data.project_id,
    ctx.user.id
  );

  await Promise.all(
    collaborators.map((userId) =>
      notifyUser({
        userId,
        projectId: parsed.data.project_id,
        notificationType: "info",
        title: `Nouveau message — ${project?.title ?? "Projet"}`,
        body: `${senderName} : ${preview} (${ref})`,
        actionUrl: project
          ? projectMessagesUrl(parsed.data.project_id, userId, {
              owner_id: project.owner_id as string,
              assigned_to: project.assigned_to as string | null,
              expert_id: project.expert_id as string | null,
            })
          : `/dashboard/projects/${parsed.data.project_id}?tab=echanges&section=messages`,
        metadata: { event: "project_message" },
      })
    )
  );

  revalidatePath(`/dashboard/projects/${parsed.data.project_id}`);
  revalidatePath(`/cpi/cases/${parsed.data.project_id}`);
  revalidatePath(`/expert/projects/${parsed.data.project_id}`);
  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard/notifications");

  return { success: true };
}

export async function markMessagesRead(projectId: string): Promise<void> {
  const ctx = await requireUser();
  await Promise.all([
    markProjectMessagesRead(projectId, ctx.user.id),
    markProjectNotificationsRead(projectId, ctx.user.id, "project_message"),
  ]);
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath(`/cpi/cases/${projectId}`);
  revalidatePath(`/expert/projects/${projectId}`);
  revalidatePath("/dashboard/messages");
  revalidatePath("/dashboard/notifications");
}
