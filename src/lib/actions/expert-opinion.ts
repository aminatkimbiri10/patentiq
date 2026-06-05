"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { logAction } from "@/lib/audit/log-action";
import { createNotification } from "@/lib/notifications/create";

const recommendationSchema = z.object({
  project_id: z.string().uuid(),
  body: z.string().min(20, "Analyse détaillée requise (min. 20 caractères)").max(10000),
  feasibility: z.enum(["high", "medium", "low", "unknown"]),
  recommendation: z.enum(["proceed", "caution", "reject"]),
  risks: z.string().max(5000).optional(),
});

export type ExpertOpinionState = { success?: boolean; error?: string; message?: string };

const FEASIBILITY_LABELS = {
  high: "Faisabilité élevée",
  medium: "Faisabilité modérée",
  low: "Faisabilité faible",
  unknown: "À approfondir",
} as const;

const RECOMMENDATION_LABELS = {
  proceed: "Favorable — poursuivre",
  caution: "Réserves — précautions",
  reject: "Défavorable",
} as const;

export async function submitExpertRecommendation(
  _prev: ExpertOpinionState,
  formData: FormData
): Promise<ExpertOpinionState> {
  const ctx = await requireUser();
  const supabase = await createClient();

  const { data: isExpert } = await supabase.rpc("has_role", { p_role: "expert" });
  if (!isExpert) return { error: "Rôle expert requis" };

  const parsed = recommendationSchema.safeParse({
    project_id: formData.get("project_id"),
    body: formData.get("body"),
    feasibility: formData.get("feasibility"),
    recommendation: formData.get("recommendation"),
    risks: formData.get("risks") || undefined,
  });

  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Données invalides";
    return { error: msg };
  }

  const { data: isProjectExpert } = await supabase.rpc("is_project_expert", {
    p_project_id: parsed.data.project_id,
  });
  if (!isProjectExpert) return { error: "Vous n'êtes pas assigné à ce projet" };

  const { data: project } = await supabase
    .from("projects")
    .select("title, reference_code, assigned_to, owner_id")
    .eq("id", parsed.data.project_id)
    .single();

  const metadata = {
    kind: "expert_recommendation",
    feasibility: parsed.data.feasibility,
    recommendation: parsed.data.recommendation,
    risks: parsed.data.risks ?? null,
  };

  const { error } = await supabase.from("project_comments").insert({
    project_id: parsed.data.project_id,
    author_id: ctx.user.id,
    body: parsed.data.body,
    is_legal: false,
    metadata,
  });

  if (error) return { error: error.message };

  await supabase.from("project_updates").insert({
    project_id: parsed.data.project_id,
    author_id: ctx.user.id,
    update_type: "comment",
    title: "Recommandation expert",
    content: `${FEASIBILITY_LABELS[parsed.data.feasibility]} — ${RECOMMENDATION_LABELS[parsed.data.recommendation]}`,
    new_value: metadata,
  });

  await logAction({
    action: "expert_recommendation",
    entityType: "project_comment",
    projectId: parsed.data.project_id,
    newData: metadata,
  });

  const ref = project?.reference_code ?? parsed.data.project_id.slice(0, 8);
  const notifyTargets = [project?.assigned_to, project?.owner_id].filter(
    (id): id is string => Boolean(id)
  );

  for (const userId of Array.from(new Set(notifyTargets))) {
    await createNotification({
      userId,
      projectId: parsed.data.project_id,
      notificationType: "info",
      title: "Recommandation expert disponible",
      body: `L'expert a rendu son avis sur « ${project?.title ?? "le projet"} » (${ref}).`,
      actionUrl:
        userId === project?.assigned_to
          ? `/cpi/cases/${parsed.data.project_id}`
          : `/dashboard/projects/${parsed.data.project_id}`,
    });
  }

  revalidatePath(`/expert/projects/${parsed.data.project_id}`);
  revalidatePath("/expert/recommendations");
  revalidatePath("/expert/analysis");
  revalidatePath(`/cpi/cases/${parsed.data.project_id}`);

  return { success: true, message: "Recommandation enregistrée et transmise au CPI." };
}
