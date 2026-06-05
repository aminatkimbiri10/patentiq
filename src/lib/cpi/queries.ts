import { createClient } from "@/lib/supabase/server";
import type { Project, ProjectStatus } from "@/types/database";

export async function getCpiProjectFilter(userId: string) {
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", userId)
    .eq("member_role", "cpi_advisor");

  const memberProjectIds = (memberships ?? []).map((m) => m.project_id as string);
  const orFilters = [`assigned_to.eq.${userId}`];
  if (memberProjectIds.length > 0) {
    orFilters.push(`id.in.(${memberProjectIds.join(",")})`);
  }

  return orFilters.join(",");
}

export async function getCpiProjects(userId: string, statusFilter?: ProjectStatus[]) {
  const supabase = await createClient();
  const filter = await getCpiProjectFilter(userId);

  let query = supabase.from("projects").select("*").or(filter).order("last_activity_at", {
    ascending: false,
  });

  if (statusFilter?.length) {
    query = query.in("status", statusFilter);
  }

  const { data, error } = await query;
  if (error) console.error("[cpi] getCpiProjects:", error.message);
  return (data ?? []) as Project[];
}

export type CpiStats = {
  activeCount: number;
  inReviewCount: number;
  awaitingExpertCount: number;
  cpiReviewCount: number;
  decidedCount: number;
  staleCount: number;
  byStatus: Record<string, number>;
};

const ACTIVE_STATUSES: ProjectStatus[] = [
  "submitted",
  "in_review",
  "awaiting_documents",
  "expert_review",
  "cpi_review",
];

const STALE_STATUSES: ProjectStatus[] = ["awaiting_documents", "expert_review"];
const STALE_DAYS = 7;

export async function getCpiStats(userId: string): Promise<CpiStats> {
  const projects = await getCpiProjects(userId);
  const now = Date.now();
  const staleMs = STALE_DAYS * 24 * 60 * 60 * 1000;

  const byStatus: Record<string, number> = {};
  let inReviewCount = 0;
  let awaitingExpertCount = 0;
  let cpiReviewCount = 0;
  let decidedCount = 0;
  let staleCount = 0;

  for (const p of projects) {
    byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
    if (p.status === "in_review") inReviewCount++;
    if (p.status === "expert_review") awaitingExpertCount++;
    if (p.status === "cpi_review") cpiReviewCount++;
    if (p.status === "approved" || p.status === "rejected" || p.status === "closed") {
      decidedCount++;
    }
    if (
      STALE_STATUSES.includes(p.status) &&
      now - new Date(p.last_activity_at).getTime() > staleMs
    ) {
      staleCount++;
    }
  }

  const activeCount = projects.filter((p) => ACTIVE_STATUSES.includes(p.status)).length;

  return {
    activeCount,
    inReviewCount,
    awaitingExpertCount,
    cpiReviewCount,
    decidedCount,
    staleCount,
    byStatus,
  };
}
