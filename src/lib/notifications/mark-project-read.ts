import { createClient } from "@/lib/supabase/server";

/** Marque comme lues les notifications d'un dossier (ex. messages) pour l'utilisateur courant. */
export async function markProjectNotificationsRead(
  userId: string,
  projectId: string,
  event: string
): Promise<void> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: now })
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .eq("is_read", false)
    .contains("metadata", { event });

  if (error) {
    console.error("[notifications] mark project read:", error.message);
  }
}
