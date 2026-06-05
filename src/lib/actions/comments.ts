"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { createCommentSchema } from "@/lib/validations/comment";
import type { AppRole } from "@/types/roles";

const LEGAL_COMMENT_ROLES: AppRole[] = ["cpi_advisor", "admin"];

export async function addComment(formData: FormData) {
  const ctx = await requireUser();

  const parsed = createCommentSchema.safeParse({
    project_id: formData.get("project_id"),
    body: formData.get("body"),
    parent_id: formData.get("parent_id") || undefined,
    is_legal: formData.get("is_legal") ?? undefined,
  });

  if (!parsed.success) throw new Error("Commentaire invalide");

  const wantsLegal = parsed.data.is_legal === true;
  const canPostLegal =
    ctx.primaryRole && LEGAL_COMMENT_ROLES.includes(ctx.primaryRole);

  if (wantsLegal && !canPostLegal) {
    throw new Error("Seuls les conseillers CPI et administrateurs peuvent publier des commentaires juridiques.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("project_comments").insert({
    project_id: parsed.data.project_id,
    author_id: ctx.user.id,
    body: parsed.data.body,
    parent_id: parsed.data.parent_id ?? null,
    is_legal: wantsLegal,
  });

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/projects/${parsed.data.project_id}`);
  revalidatePath(`/cpi/cases/${parsed.data.project_id}`);
  revalidatePath(`/expert/projects/${parsed.data.project_id}`);
}
