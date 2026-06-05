import { createClient } from "@/lib/supabase/server";

export type ExpertStats = {
  assignedCount: number;
  awaitingAnalysis: number;
  recommendationsCount: number;
};

export async function getExpertStats(userId: string): Promise<ExpertStats> {
  const supabase = await createClient();

  const [{ count: assignedCount }, { count: awaitingAnalysis }, { data: projectIds }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("expert_id", userId)
        .not("status", "in", '("closed","rejected")'),
      supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("expert_id", userId)
        .eq("status", "expert_review"),
      supabase.from("projects").select("id").eq("expert_id", userId),
    ]);

  const ids = (projectIds ?? []).map((p) => p.id as string);
  let recommendationsCount = 0;

  if (ids.length > 0) {
    const { count } = await supabase
      .from("project_comments")
      .select("*", { count: "exact", head: true })
      .in("project_id", ids)
      .eq("author_id", userId)
      .contains("metadata", { kind: "expert_recommendation" });
    recommendationsCount = count ?? 0;
  }

  return {
    assignedCount: assignedCount ?? 0,
    awaitingAnalysis: awaitingAnalysis ?? 0,
    recommendationsCount,
  };
}
