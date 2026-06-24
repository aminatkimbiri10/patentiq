import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildReportHtml } from "@/lib/ai/build-report-html";
import type { AiResult } from "@/types/database";

/** GET — export HTML imprimable (PDF via navigateur) */
export async function GET(
  _request: Request,
  { params }: { params: { searchId: string } }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { data: search, error } = await supabase
    .from("ai_searches")
    .select("id, status, query, search_type, completed_at, metadata, project_id, projects(title, reference_code, categories(name))")
    .eq("id", params.searchId)
    .single();

  if (error || !search) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (search.status !== "completed") {
    return new NextResponse("Rapport non disponible — analyse en cours", { status: 409 });
  }

  const { data: results } = await supabase
    .from("ai_results")
    .select("*")
    .eq("search_id", params.searchId)
    .order("rank", { ascending: true });

  const projectRaw = search.projects as unknown;
  const project = Array.isArray(projectRaw) ? projectRaw[0] : projectRaw;
  const p = project as {
    title?: string;
    reference_code?: string | null;
    categories?: { name: string } | { name: string }[] | null;
  } | null;
  const category = p?.categories;
  const categoryName = Array.isArray(category) ? category[0]?.name : category?.name;
  const metadata = search.metadata as { summary?: string } | null;

  const html = buildReportHtml({
    projectTitle: p?.title ?? "Projet",
    referenceCode: p?.reference_code,
    categoryName: categoryName ?? null,
    query: search.query,
    summary: metadata?.summary ?? "Synthèse non disponible.",
    results: (results ?? []) as AiResult[],
    generatedAt: search.completed_at ?? new Date().toISOString(),
    searchType: search.search_type,
  });

  const slug = (p?.reference_code ?? params.searchId.slice(0, 8)).replace(/[^a-zA-Z0-9-_]/g, "-");

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="rapport-ia-${slug}.html"`,
    },
  });
}
