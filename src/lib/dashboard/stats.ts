import { createClient } from "@/lib/supabase/server";

export type HolderStats = {
  projectCount: number;
  activeProjectCount: number;
  documentCount: number;
  openTaskCount: number;
  aiSearchCount: number;
};

export async function getHolderStats(userId: string): Promise<HolderStats> {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("id, status")
    .eq("owner_id", userId);

  const projectIds = (projects ?? []).map((p) => p.id as string);
  const activeProjectCount = (projects ?? []).filter(
    (p) => !["closed", "rejected"].includes(p.status as string)
  ).length;

  const [docResult, taskResult, aiResult] = await Promise.all([
    projectIds.length
      ? supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .in("project_id", projectIds)
          .neq("status", "deleted")
      : Promise.resolve({ count: 0 }),
    projectIds.length
      ? supabase
          .from("project_tasks")
          .select("*", { count: "exact", head: true })
          .in("project_id", projectIds)
          .neq("status", "completed")
      : Promise.resolve({ count: 0 }),
    projectIds.length
      ? supabase
          .from("ai_searches")
          .select("*", { count: "exact", head: true })
          .in("project_id", projectIds)
      : Promise.resolve({ count: 0 }),
  ]);

  return {
    projectCount: projects?.length ?? 0,
    activeProjectCount,
    documentCount: docResult.count ?? 0,
    openTaskCount: taskResult.count ?? 0,
    aiSearchCount: aiResult.count ?? 0,
  };
}
