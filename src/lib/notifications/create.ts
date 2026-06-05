import { createAdminClient } from "@/lib/supabase/admin";
import type { Notification } from "@/types/database";

type CreateNotificationInput = {
  userId: string;
  projectId?: string | null;
  notificationType?: "info" | "warning" | "action_required" | "success" | "error";
  title: string;
  body?: string | null;
  actionUrl?: string | null;
  metadata?: Record<string, unknown>;
};

export async function createNotification(
  input: CreateNotificationInput
): Promise<Notification | null> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("notifications")
    .insert({
      user_id: input.userId,
      project_id: input.projectId ?? null,
      notification_type: input.notificationType ?? "info",
      title: input.title,
      body: input.body ?? null,
      action_url: input.actionUrl ?? null,
      metadata: input.metadata ?? {},
    })
    .select("*")
    .single();

  if (error) {
    console.error("[notifications]", error.message);
    return null;
  }

  return data as Notification;
}

export async function createNotifications(
  inputs: CreateNotificationInput[]
): Promise<void> {
  if (!inputs.length) return;

  const admin = createAdminClient();
  const { error } = await admin.from("notifications").insert(
    inputs.map((input) => ({
      user_id: input.userId,
      project_id: input.projectId ?? null,
      notification_type: input.notificationType ?? "info",
      title: input.title,
      body: input.body ?? null,
      action_url: input.actionUrl ?? null,
      metadata: input.metadata ?? {},
    }))
  );

  if (error) console.error("[notifications]", error.message);
}
