import { createAdminClient } from "@/lib/supabase/admin";
import { runAiSearch } from "@/lib/ai/run-search";
import { runProjectReport } from "@/lib/ai/run-report";
import { notifyUser } from "@/lib/notifications/notify-user";
import { projectUrlForUser } from "@/lib/notifications/project-url";

export type ProcessSearchResult =
  | { ok: true; searchId: string; resultsCount: number }
  | { ok: false; searchId: string; error: string };

export async function processAiSearch(searchId: string): Promise<ProcessSearchResult> {
  const admin = createAdminClient();

  const { data: search, error: fetchError } = await admin
    .from("ai_searches")
    .select("id, status, query, search_type, project_id, document_ids")
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
    let summary: string;
    let results: Awaited<ReturnType<typeof runAiSearch>>["results"];
    let providers: Awaited<ReturnType<typeof runAiSearch>>["providers"];

    if (search.search_type === "report") {
      const { data: project } = await admin
        .from("projects")
        .select("title, reference_code, invention_summary, categories(name)")
        .eq("id", search.project_id)
        .single();

      const { data: priorSearches } = await admin
        .from("ai_searches")
        .select("id, query, completed_at, metadata")
        .eq("project_id", search.project_id)
        .in("search_type", ["novelty", "semantic", "similarity", "fto"])
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(5);

      const priorIds = (priorSearches ?? []).map((s) => s.id);
      let priorResults: Array<{
        search_id: string;
        result_type: string;
        title: string | null;
        summary: string | null;
        score: number | null;
        rank: number | null;
        source_ref: string | null;
        payload: Record<string, unknown>;
      }> = [];

      if (priorIds.length) {
        const { data: rows } = await admin
          .from("ai_results")
          .select("search_id, result_type, title, summary, score, rank, source_ref, payload")
          .in("search_id", priorIds);
        priorResults = rows ?? [];
      }

      const category = project?.categories as { name: string } | { name: string }[] | null;
      const categoryName = Array.isArray(category) ? category[0]?.name : category?.name;

      const report = await runProjectReport({
        projectTitle: project?.title ?? "Projet",
        referenceCode: project?.reference_code,
        categoryName: categoryName ?? null,
        inventionSummary: project?.invention_summary,
        priorSearches: (priorSearches ?? []).map((s) => {
          const meta = s.metadata as { summary?: string } | null;
          return {
            query: s.query,
            completedAt: s.completed_at,
            summary: meta?.summary ?? null,
            results: priorResults
              .filter((r) => r.search_id === s.id)
              .map((r, i) => ({
                result_type: r.result_type,
                title: r.title ?? "",
                summary: r.summary ?? "",
                score: Number(r.score ?? 0),
                rank: r.rank ?? i + 1,
                source_ref: r.source_ref ?? "",
                payload: r.payload ?? {},
              })),
          };
        }),
      });

      summary = report.summary;
      results = report.results;
      providers = report.providers;
    } else {
      const run = await runAiSearch(
        search.query,
        search.search_type as import("@/types/database").AiSearchType,
        {
          projectId: search.project_id,
          documentIds: (search.document_ids as string[] | null) ?? [],
          admin,
        }
      );
      summary = run.summary;
      results = run.results;
      providers = run.providers;
    }

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

    const { data: searchRow } = await admin
      .from("ai_searches")
      .select("requested_by, search_type")
      .eq("id", searchId)
      .single();

    const isReport = searchRow?.search_type === "report";

    await admin.from("project_updates").insert({
      project_id: search.project_id,
      update_type: "system",
      title: isReport ? "Rapport IA disponible" : "Recherche IA terminée",
      content: summary.slice(0, 500),
      metadata: { ai_search_id: searchId },
    });

    if (searchRow?.requested_by) {
      const { data: projectRow } = await admin
        .from("projects")
        .select("owner_id, assigned_to, expert_id")
        .eq("id", search.project_id)
        .single();

      const actionUrl = projectRow
        ? projectUrlForUser(
            search.project_id,
            searchRow.requested_by,
            {
              owner_id: projectRow.owner_id as string,
              assigned_to: projectRow.assigned_to as string | null,
              expert_id: projectRow.expert_id as string | null,
            },
            "search"
          )
        : `/dashboard/projects/${search.project_id}?tab=search`;

      await notifyUser({
        userId: searchRow.requested_by,
        projectId: search.project_id,
        notificationType: "info",
        title: isReport ? "Rapport IA prêt" : "Recherche IA terminée",
        body: summary.slice(0, 200),
        actionUrl,
        metadata: { ai_search_id: searchId, event: "ai_search_completed" },
      }).catch((e) => console.error("[ai] notify:", e));
    }

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
