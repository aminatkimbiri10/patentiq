"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { userHasRole } from "@/lib/auth/get-user";
import {
  collectIpDeadlines,
  type IpDeadline,
  type ProjectDeadlineInput,
} from "@/lib/workflow/ip-deadlines";

export async function listIpDeadlinesForUser(
  limit = 10,
  userId?: string,
  isCpiAdvisor?: boolean
): Promise<IpDeadline[]> {
  let uid = userId;
  let isCpi = isCpiAdvisor;

  if (!uid) {
    const ctx = await requireUser();
    uid = ctx.user.id;
    if (isCpi === undefined) {
      isCpi = userHasRole(ctx, "cpi_advisor");
    }
  }

  const supabase = await createClient();

  let q = supabase
    .from("projects")
    .select("id, title, reference_code, metadata, categories(slug)")
    .not("status", "in", '("draft","closed","rejected")')
    .order("updated_at", { ascending: false });

  if (isCpi) {
    q = q.or(`owner_id.eq.${uid},assigned_to.eq.${uid}`);
  } else {
    q = q.eq("owner_id", uid);
  }

  const { data } = await q.limit(50);
  const deadlines = collectIpDeadlines((data ?? []) as ProjectDeadlineInput[]);

  return deadlines
    .filter((d) => d.urgency !== "ok" || d.daysRemaining <= 60)
    .slice(0, limit);
}
