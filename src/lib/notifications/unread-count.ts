import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export const getUnreadNotificationCount = cache(async (userId: string): Promise<number> => {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("[notifications] unread count:", error.message);
    return 0;
  }

  return count ?? 0;
});
