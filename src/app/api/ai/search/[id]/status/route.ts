import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET — statut d'une recherche IA (polling client) */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: search, error } = await supabase
    .from("ai_searches")
    .select("id, status, error_message, completed_at, metadata, search_type, query")
    .eq("id", params.id)
    .single();

  if (error || !search) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let resultsCount = 0;
  if (search.status === "completed") {
    const { count } = await supabase
      .from("ai_results")
      .select("id", { count: "exact", head: true })
      .eq("search_id", params.id);
    resultsCount = count ?? 0;
  }

  const metadata = search.metadata as { summary?: string } | null;

  return NextResponse.json({
    searchId: search.id,
    status: search.status,
    searchType: search.search_type,
    query: search.query,
    errorMessage: search.error_message,
    completedAt: search.completed_at,
    resultsCount,
    summary: metadata?.summary ?? null,
  });
}
