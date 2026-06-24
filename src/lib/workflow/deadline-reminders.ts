import type { SupabaseClient } from "@supabase/supabase-js";
import { notifyUser } from "@/lib/notifications/notify-user";
import {
  collectIpDeadlines,
  deadlineKey,
  reminderBody,
  shouldRemindDeadline,
  type IpDeadline,
  type ProjectDeadlineInput,
} from "@/lib/workflow/ip-deadlines";

const REMINDER_COOLDOWN_DAYS = 6;

function projectActionUrl(
  deadline: IpDeadline,
  role: "holder" | "cpi"
): string {
  const base =
    role === "cpi"
      ? `/cpi/cases/${deadline.projectId}`
      : `/dashboard/projects/${deadline.projectId}`;
  return `${base}?tab=dossier&section=parcours-pi&pi=cycle`;
}

async function wasRecentlyNotified(
  supabase: SupabaseClient,
  userId: string,
  key: string
): Promise<boolean> {
  const since = new Date();
  since.setDate(since.getDate() - REMINDER_COOLDOWN_DAYS);

  const { data } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", userId)
    .gte("created_at", since.toISOString())
    .contains("metadata", { event: "ip_deadline", deadline_key: key })
    .limit(1);

  return (data?.length ?? 0) > 0;
}

async function sendReminder(
  supabase: SupabaseClient,
  deadline: IpDeadline,
  userId: string,
  role: "holder" | "cpi"
): Promise<boolean> {
  const key = deadlineKey(deadline);
  if (await wasRecentlyNotified(supabase, userId, key)) return false;

  const notificationType =
    deadline.daysRemaining < 0 || deadline.daysRemaining <= 7
      ? "action_required"
      : "warning";

  await notifyUser({
    userId,
    projectId: deadline.projectId,
    notificationType,
    title:
      deadline.kind === "marque_opposition"
        ? "Rappel — opposition marque"
        : "Rappel — publication brevet",
    body: reminderBody(deadline),
    actionUrl: projectActionUrl(deadline, role),
    metadata: {
      event: "ip_deadline",
      deadline_key: key,
      kind: deadline.kind,
      days_remaining: deadline.daysRemaining,
    },
  });

  return true;
}

export async function runDeadlineReminders(
  supabase: SupabaseClient
): Promise<{ checked: number; sent: number }> {
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, reference_code, owner_id, assigned_to, metadata, categories(slug)")
    .not("status", "in", '("draft","closed","rejected")');

  const rows = (projects ?? []) as Array<
    ProjectDeadlineInput & { owner_id: string; assigned_to: string | null }
  >;

  const deadlines = collectIpDeadlines(rows).filter((d) => shouldRemindDeadline(d.daysRemaining));

  let sent = 0;
  for (const deadline of deadlines) {
    const project = rows.find((p) => p.id === deadline.projectId);
    if (!project) continue;

    if (project.owner_id) {
      const ok = await sendReminder(supabase, deadline, project.owner_id, "holder");
      if (ok) sent++;
    }

    if (project.assigned_to && project.assigned_to !== project.owner_id) {
      const ok = await sendReminder(supabase, deadline, project.assigned_to, "cpi");
      if (ok) sent++;
    }
  }

  return { checked: deadlines.length, sent };
}
