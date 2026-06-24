import { createAdminClient } from "@/lib/supabase/admin";

export type NotificationPrefs = {
  emailEnabled: boolean;
};

const DEFAULTS: NotificationPrefs = { emailEnabled: true };

export function parseNotificationPrefs(metadata: unknown): NotificationPrefs {
  if (!metadata || typeof metadata !== "object") return DEFAULTS;
  const prefs = (metadata as Record<string, unknown>).notification_prefs;
  if (!prefs || typeof prefs !== "object") return DEFAULTS;
  const email = (prefs as Record<string, unknown>).email_enabled;
  return {
    emailEnabled: email !== false,
  };
}

export async function getNotificationPrefs(userId: string): Promise<NotificationPrefs> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("metadata")
    .eq("id", userId)
    .single();
  return parseNotificationPrefs(data?.metadata);
}
