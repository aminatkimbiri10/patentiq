import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processAiSearch } from "@/lib/ai/worker";

/** POST — crée une recherche IA et lance le worker stub */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { projectId, query, searchType = "novelty" } = body;

  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("ai_searches")
    .insert({
      project_id: projectId,
      requested_by: user.id,
      search_type: searchType,
      status: "pending",
      query,
      parameters: { endpoint: "/api/ai/search" },
    })
    .select("id, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  let workerResult = null;
  try {
    workerResult = await processAiSearch(data.id);
  } catch {
    workerResult = { ok: false, searchId: data.id, error: "Worker indisponible" };
  }

  return NextResponse.json({
    searchId: data.id,
    status: workerResult?.ok ? "completed" : data.status,
    resultsCount: workerResult?.ok ? workerResult.resultsCount : 0,
    message: workerResult?.ok
      ? `Analyse terminée — ${workerResult.resultsCount} document(s) trouvé(s)`
      : "Recherche en file d'attente — le worker la traitera sous peu",
    worker: workerResult,
  });
}
