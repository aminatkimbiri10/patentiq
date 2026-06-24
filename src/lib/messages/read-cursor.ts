import { createClient } from "@/lib/supabase/server";

type ProfileMetadata = {
  message_reads?: Record<string, string>;
};

function parseMessageReads(metadata: unknown): Record<string, string> {
  if (!metadata || typeof metadata !== "object") return {};
  const reads = (metadata as ProfileMetadata).message_reads;
  return reads && typeof reads === "object" ? reads : {};
}

export async function getProjectUnreadMessageCount(
  projectId: string,
  userId: string
): Promise<number> {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("metadata")
    .eq("id", userId)
    .single();

  const reads = parseMessageReads(profile?.metadata);
  const lastRead = reads[projectId];

  let query = supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId)
    .eq("message_type", "project_thread")
    .neq("sender_id", userId);

  if (lastRead) {
    query = query.gt("created_at", lastRead);
  }

  const { count, error } = await query;
  if (error) {
    console.error("[messages] unread count:", error.message);
    return 0;
  }

  return count ?? 0;
}

export async function markProjectMessagesRead(
  projectId: string,
  userId: string
): Promise<void> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: profile } = await supabase
    .from("profiles")
    .select("metadata")
    .eq("id", userId)
    .single();

  const base =
    profile?.metadata && typeof profile.metadata === "object"
      ? { ...(profile.metadata as Record<string, unknown>) }
      : {};

  const reads = parseMessageReads(profile?.metadata);

  const { error } = await supabase
    .from("profiles")
    .update({
      metadata: {
        ...base,
        message_reads: { ...reads, [projectId]: now },
      },
    })
    .eq("id", userId);

  if (error) {
    console.error("[messages] mark read:", error.message);
  }
}
