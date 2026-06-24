"use server";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPatentClaimsDraft } from "@/lib/actions/patent-claims";
import {
  generateClaimChart,
  type ClaimChart,
  type ClaimChartPriorArt,
} from "@/lib/ai/claim-chart";

export type BuildClaimChartResult = {
  success: boolean;
  error?: string;
  chart?: ClaimChart;
};

const PRIOR_ART_TYPES = ["novelty", "fto", "semantic", "similarity"];

async function fetchLatestPriorArt(projectId: string): Promise<ClaimChartPriorArt[]> {
  const admin = createAdminClient();

  const { data: searches } = await admin
    .from("ai_searches")
    .select("id, search_type, created_at")
    .eq("project_id", projectId)
    .eq("status", "completed")
    .in("search_type", PRIOR_ART_TYPES)
    .order("created_at", { ascending: false })
    .limit(1);

  const searchId = searches?.[0]?.id;
  if (!searchId) return [];

  const { data: results } = await admin
    .from("ai_results")
    .select("title, summary, source_ref, score, rank")
    .eq("search_id", searchId)
    .order("rank", { ascending: true })
    .limit(5);

  return (results ?? [])
    .map((r) => ({
      ref: (r.source_ref as string) || (r.title as string) || "REF",
      title: (r.title as string) || (r.source_ref as string) || "Antériorité",
      summary: (r.summary as string) ?? undefined,
    }))
    .filter((r) => r.ref);
}

export async function buildClaimChart(projectId: string): Promise<BuildClaimChartResult> {
  await requireUser();

  const supabase = await createClient();
  const { data: canView } = await supabase.rpc("can_view_project", {
    p_project_id: projectId,
  } as never);

  if (!canView) {
    return { success: false, error: "Accès refusé à ce dossier." };
  }

  const claims = await getPatentClaimsDraft(projectId);
  if (!claims?.independent_claim?.trim()) {
    return {
      success: false,
      error: "Renseignez d'abord une revendication indépendante (onglet Revendications).",
    };
  }

  try {
    const priorArt = await fetchLatestPriorArt(projectId);
    const chart = await generateClaimChart(
      claims.independent_claim,
      claims.dependent_claims,
      priorArt
    );
    return { success: true, chart };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Génération impossible",
    };
  }
}
