"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";

export type PatentClaimsDraft = {
  id: string;
  project_id: string;
  independent_claim: string | null;
  dependent_claims: string[];
  updated_by: string | null;
  updated_at: string;
};

const saveSchema = z.object({
  project_id: z.string().uuid(),
  independent_claim: z.string().max(50000).optional(),
  dependent_claims: z.string().optional(),
});

export type ClaimsActionState = { success?: boolean; error?: string; message?: string };

function parseDependentClaims(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
    }
  } catch {
    return raw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  }
  return [];
}

export async function getPatentClaimsDraft(projectId: string): Promise<PatentClaimsDraft | null> {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("patent_claims_drafts")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  if (!data) return null;
  const deps = data.dependent_claims;
  return {
    id: data.id,
    project_id: data.project_id,
    independent_claim: data.independent_claim,
    dependent_claims: Array.isArray(deps)
      ? deps.filter((x): x is string => typeof x === "string")
      : [],
    updated_by: data.updated_by,
    updated_at: data.updated_at,
  };
}

export async function savePatentClaimsDraft(
  _prev: ClaimsActionState,
  formData: FormData
): Promise<ClaimsActionState> {
  const ctx = await requireUser();
  const parsed = saveSchema.safeParse({
    project_id: formData.get("project_id"),
    independent_claim: formData.get("independent_claim") || undefined,
    dependent_claims: formData.get("dependent_claims") || undefined,
  });

  if (!parsed.success) {
    return { error: "Données invalides" };
  }

  const dependent = parseDependentClaims(parsed.data.dependent_claims);
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("patent_claims_drafts")
    .select("id")
    .eq("project_id", parsed.data.project_id)
    .maybeSingle();

  const payload = {
    independent_claim: parsed.data.independent_claim ?? null,
    dependent_claims: dependent,
    updated_by: ctx.user.id,
    updated_at: now,
  };

  const { error } = existing
    ? await supabase.from("patent_claims_drafts").update(payload).eq("id", existing.id)
    : await supabase.from("patent_claims_drafts").insert({
        project_id: parsed.data.project_id,
        ...payload,
      });

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/projects/${parsed.data.project_id}`);
  revalidatePath(`/cpi/cases/${parsed.data.project_id}`);
  return { success: true, message: "Revendications enregistrées (confidentiel)." };
}
