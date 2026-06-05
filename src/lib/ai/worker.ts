import { createAdminClient } from "@/lib/supabase/admin";
import { runAiSearch } from "@/lib/ai/run-search";

export type ProcessSearchResult =
  | { ok: true; searchId: string; resultsCount: number }
  | { ok: false; searchId: string; error: string };

export async function processAiSearch(searchId: string): Promise<ProcessSearchResult> {
  const admin = createAdminClient();

  const { data: search, error: fetchError } = await admin
    .from("ai_searches")
    .select("id, status, query, search_type, project_id")
    .eq("id", searchId)
    .single();

  if (fetchError || !search) {
    return { ok: false, searchId, error: fetchError?.message ?? "Recherche introuvable" };
  }

  if (search.status === "completed" || search.status === "processing") {
    return { ok: true, searchId, resultsCount: 0 };
  }

  if (search.status !== "pending" && search.status !== "failed") {
    return { ok: false, searchId, error: `Statut non traitable: ${search.status}` };
  }

  const now = new Date().toISOString();

  await admin
    .from("ai_searches")
    .update({ status: "processing", started_at: now, error_message: null })
    .eq("id", searchId);

  try {
    const { summary, results, providers } = await runAiSearch(
      search.query,
      search.search_type as import("@/types/database").AiSearchType
    );

    await admin.from("ai_results").delete().eq("search_id", searchId);

    if (results.length > 0) {
      const { error: insertError } = await admin.from("ai_results").insert(
        results.map((r) => ({
          search_id: searchId,
          result_type: r.result_type,
          title: r.title,
          summary: r.summary,
          score: r.score,
          rank: r.rank,
          source_ref: r.source_ref,
          payload: r.payload,
        }))
      );

      if (insertError) throw new Error(insertError.message);
    }

    await admin
      .from("ai_searches")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        metadata: { worker: "multi-provider", providers, summary },
      })
      .eq("id", searchId);

    await admin.from("project_updates").insert({
      project_id: search.project_id,
      update_type: "system",
      title: "Recherche IA terminée",
      content: summary.slice(0, 500),
      metadata: { ai_search_id: searchId },
    });

    return { ok: true, searchId, resultsCount: results.length };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur worker IA";
    await admin
      .from("ai_searches")
      .update({ status: "failed", error_message: message, completed_at: new Date().toISOString() })
      .eq("id", searchId);

    return { ok: false, searchId, error: message };
  }
}

export async function processPendingAiSearches(limit = 10) {
  const admin = createAdminClient();

  const { data: pending, error } = await admin
    .from("ai_searches")
    .select("id")
    .eq("status", "pending")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);

  const outcomes: ProcessSearchResult[] = [];
  for (const row of pending ?? []) {
    outcomes.push(await processAiSearch(row.id));
  }

  return outcomes;
}
