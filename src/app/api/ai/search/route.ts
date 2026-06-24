import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { queueAiSearchProcessing } from "@/lib/ai/trigger-worker";

/** POST — crée une recherche IA et la met en file (worker async) */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    projectId,
    query,
    searchType = "novelty",
    documentId,
    documentIds,
  } = body;

  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  const docIds: string[] = Array.isArray(documentIds)
    ? documentIds.filter((id: unknown) => typeof id === "string")
    : documentId
      ? [documentId]
      : [];

  const { data, error } = await supabase
    .from("ai_searches")
    .insert({
      project_id: projectId,
      requested_by: user.id,
      search_type: searchType,
      status: "pending",
      query: query ?? null,
      document_ids: docIds,
      parameters: { endpoint: "/api/ai/search", searchType, documentIds: docIds },
    })
    .select("id, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  queueAiSearchProcessing(data.id);

  return NextResponse.json({
    searchId: data.id,
    status: "pending",
    message: "Recherche en file d'attente — suivi automatique",
  });
}
