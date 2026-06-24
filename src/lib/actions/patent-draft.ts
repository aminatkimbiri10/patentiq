"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { logProjectActivity } from "@/lib/project-activity/log";

export type PatentDraft = {
  id: string;
  project_id: string;
  title: string | null;
  technical_field: string | null;
  background: string | null;
  description: string | null;
  abstract: string | null;
  updated_by: string | null;
  updated_at: string;
};

const saveSchema = z.object({
  project_id: z.string().uuid(),
  title: z.string().max(500).optional(),
  technical_field: z.string().max(10000).optional(),
  background: z.string().max(50000).optional(),
  description: z.string().max(100000).optional(),
  abstract: z.string().max(5000).optional(),
});

export type PatentDraftActionState = { success?: boolean; error?: string; message?: string };

export async function getPatentDraft(projectId: string): Promise<PatentDraft | null> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("patent_drafts")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  if (!data) return null;
  return data as PatentDraft;
}

export async function savePatentDraft(
  _prev: PatentDraftActionState,
  formData: FormData
): Promise<PatentDraftActionState> {
  const ctx = await requireUser();
  const parsed = saveSchema.safeParse({
    project_id: formData.get("project_id"),
    title: formData.get("title") || undefined,
    technical_field: formData.get("technical_field") || undefined,
    background: formData.get("background") || undefined,
    description: formData.get("description") || undefined,
    abstract: formData.get("abstract") || undefined,
  });

  if (!parsed.success) return { error: "Données invalides" };

  const supabase = await createClient();
  const now = new Date().toISOString();
  const payload = {
    title: parsed.data.title ?? null,
    technical_field: parsed.data.technical_field ?? null,
    background: parsed.data.background ?? null,
    description: parsed.data.description ?? null,
    abstract: parsed.data.abstract ?? null,
    updated_by: ctx.user.id,
    updated_at: now,
  };

  const { data: existing } = await supabase
    .from("patent_drafts")
    .select("id")
    .eq("project_id", parsed.data.project_id)
    .maybeSingle();

  let draftId = existing?.id;

  if (existing) {
    const { error } = await supabase.from("patent_drafts").update(payload).eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { data: inserted, error } = await supabase
      .from("patent_drafts")
      .insert({ project_id: parsed.data.project_id, ...payload })
      .select("id")
      .single();
    if (error) return { error: error.message };
    draftId = inserted?.id;
  }

  if (draftId) {
    await supabase.from("patent_draft_versions").insert({
      project_id: parsed.data.project_id,
      draft_id: draftId,
      title: payload.title,
      technical_field: payload.technical_field,
      background: payload.background,
      description: payload.description,
      abstract: payload.abstract,
      saved_by: ctx.user.id,
    });
  }

  await logProjectActivity(supabase, {
    projectId: parsed.data.project_id,
    authorId: ctx.user.id,
    kind: "draft_saved",
    title: "Brouillon de rédaction enregistré",
    content: payload.title ? `Titre : ${payload.title.slice(0, 120)}` : undefined,
  });

  revalidatePath(`/dashboard/projects/${parsed.data.project_id}`);
  revalidatePath(`/cpi/cases/${parsed.data.project_id}`);
  return { success: true, message: "Brouillon de rédaction enregistré (confidentiel)." };
}
