import { createClient } from "@/lib/supabase/server";

export type AdminStats = {
  usersCount: number;
  projectsCount: number;
  projectsInReview: number;
  auditLogsCount: number;
  byStatus: Record<string, number>;
};

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();

  const [
    { count: usersCount },
    { count: projectsCount },
    { count: projectsInReview },
    { count: auditLogsCount },
    { data: statusRows },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .in("status", ["submitted", "in_review", "expert_review", "cpi_review"]),
    supabase.from("audit_logs").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("status"),
  ]);

  const byStatus: Record<string, number> = {};
  for (const row of statusRows ?? []) {
    const s = row.status as string;
    byStatus[s] = (byStatus[s] ?? 0) + 1;
  }

  return {
    usersCount: usersCount ?? 0,
    projectsCount: projectsCount ?? 0,
    projectsInReview: projectsInReview ?? 0,
    auditLogsCount: auditLogsCount ?? 0,
    byStatus,
  };
}
