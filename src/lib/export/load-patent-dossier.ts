import type { SupabaseClient } from "@supabase/supabase-js";
import type { PatentClaimsDraft } from "@/lib/actions/patent-claims";
import type { PatentDraft } from "@/lib/actions/patent-draft";
import {
  buildPatentDossierHtml,
  dossierHasExportableContent,
  type PatentDossierExportInput,
} from "@/lib/export/build-patent-dossier-html";

function parseClaimsRow(
  projectId: string,
  row: {
    id: string;
    independent_claim: string | null;
    dependent_claims: unknown;
    updated_by: string | null;
    updated_at: string;
  } | null
): PatentClaimsDraft | null {
  if (!row) return null;
  return {
    id: row.id,
    project_id: projectId,
    independent_claim: row.independent_claim,
    dependent_claims: Array.isArray(row.dependent_claims)
      ? row.dependent_claims.filter((x): x is string => typeof x === "string")
      : [],
    updated_by: row.updated_by,
    updated_at: row.updated_at,
  };
}

export async function loadPatentDossierForExport(
  supabase: SupabaseClient,
  projectId: string
): Promise<
  | { ok: true; input: PatentDossierExportInput; html: string }
  | { ok: false; error: string; status: 404 | 400 }
> {
  const { data: project, error: projectErr } = await supabase
    .from("projects")
    .select("title, reference_code, categories(name)")
    .eq("id", projectId)
    .single();

  if (projectErr || !project) {
    return { ok: false, error: "Projet introuvable", status: 404 };
  }

  const [{ data: draftRow }, { data: claimsRow }] = await Promise.all([
    supabase.from("patent_drafts").select("*").eq("project_id", projectId).maybeSingle(),
    supabase.from("patent_claims_drafts").select("*").eq("project_id", projectId).maybeSingle(),
  ]);

  const draft = (draftRow as PatentDraft | null) ?? null;
  const claims = parseClaimsRow(projectId, claimsRow);

  if (!dossierHasExportableContent(draft, claims)) {
    return {
      ok: false,
      error: "Enregistrez d'abord la rédaction ou les revendications avant l'export.",
      status: 400,
    };
  }

  const category = project.categories as { name: string } | { name: string }[] | null;
  const categoryName = Array.isArray(category) ? category[0]?.name : category?.name;

  const input: PatentDossierExportInput = {
    projectTitle: project.title as string,
    referenceCode: project.reference_code as string | null,
    categoryName: categoryName ?? null,
    draft,
    claims,
    generatedAt: new Date().toISOString(),
  };

  return { ok: true, input, html: buildPatentDossierHtml(input) };
}
