"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";

function revalidateNotificationSurfaces() {
  revalidatePath("/dashboard/notifications");
}

export async function markAllNotificationsRead(): Promise<void> {
  const ctx = await requireUser();
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: now })
    .eq("user_id", ctx.user.id)
    .eq("is_read", false);

  if (error) {
    console.error("[notifications] mark all read:", error.message);
    return;
  }

  revalidateNotificationSurfaces();
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const ctx = await requireUser();
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: now })
    .eq("id", notificationId)
    .eq("user_id", ctx.user.id);

  if (error) {
    console.error("[notifications] mark read:", error.message);
    return;
  }

  revalidateNotificationSurfaces();
}
