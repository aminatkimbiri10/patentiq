import { createAdminClient } from "@/lib/supabase/admin";
import { notifyUsers } from "@/lib/notifications/notify-user";
import { pickExpert } from "@/lib/workflow/assign-expert";

export async function handleExpertReviewRequested(
  projectId: string,
  actorId: string
): Promise<{ expertId: string | null; expertName: string | null }> {
  const admin = createAdminClient();

  const { data: project } = await admin
    .from("projects")
    .select("id, title, reference_code, expert_id, owner_id")
    .eq("id", projectId)
    .single();

  if (!project) return { expertId: null, expertName: null };

  if (project.expert_id) {
    const { data: profile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("id", project.expert_id)
      .single();
    return { expertId: project.expert_id, expertName: profile?.full_name ?? null };
  }

  const expert = await pickExpert();
  if (!expert) return { expertId: null, expertName: null };

  await admin.from("projects").update({ expert_id: expert.userId }).eq("id", projectId);

  await admin.from("project_members").upsert(
    {
      project_id: projectId,
      user_id: expert.userId,
      member_role: "expert",
      invited_by: actorId,
      can_edit: false,
      can_comment: true,
      can_upload: true,
    },
    { onConflict: "project_id,user_id" }
  );

  const ref = project.reference_code ?? project.id.slice(0, 8);

  await admin.from("project_updates").insert({
    project_id: projectId,
    author_id: actorId,
    update_type: "assignment",
    title: "Expert assigné",
    content: `Revue expert demandée — assigné à ${expert.fullName ?? "un expert métier"}.`,
    new_value: { expert_id: expert.userId },
  });

  await notifyUsers([
    {
      userId: expert.userId,
      projectId,
      notificationType: "action_required",
      title: "Analyse technique demandée",
      body: `Le projet « ${project.title} » (${ref}) nécessite votre expertise.`,
      actionUrl: `/expert/projects/${projectId}`,
    },
    {
      userId: project.owner_id,
      projectId,
      notificationType: "info",
      title: "Revue expert lancée",
      body: `Un expert métier a été sollicité pour « ${project.title} ».`,
      actionUrl: `/dashboard/projects/${projectId}`,
    },
  ]);

  return { expertId: expert.userId, expertName: expert.fullName };
}
