import { createClient } from "@/lib/supabase/server";
import { getSearchTypeLabel } from "@/lib/ai/search-types";
import type { DashboardAiInsight } from "@/lib/dashboard/overview-data";
import type { AiSearchStatus } from "@/types/database";
import type { WatchlistRow } from "@/lib/actions/watchlist";

export type SurveillanceProjectRow = {
  id: string;
  title: string;
  reference_code: string | null;
  status: string;
  updated_at: string;
  watchCount: number;
  lastScanAt: string | null;
  href: string;
};

const SEARCH_TYPE_LABELS: Record<string, string> = {
  novelty: "Recherche de nouveauté",
  freedom_to_operate: "Liberté d'exploitation",
  prior_art: "Antériorités",
  landscape: "Cartographie PI",
  trademark: "Similarité marque",
  patent: "Veille brevet",
  general: "Analyse générale",
};

function joinProject<T extends { title?: string }>(
  row: T | T[] | null | undefined
): T | null {
  if (!row) return null;
  return Array.isArray(row) ? row[0] ?? null : row;
}

export async function getSurveillanceAiInsights(
  projectIds: string[],
  role: "holder" | "cpi" = "holder",
  limit = 4
): Promise<DashboardAiInsight[]> {
  if (!projectIds.length) return [];

  const supabase = await createClient();
  const { data: searches } = await supabase
    .from("ai_searches")
    .select("id, search_type, status, query, created_at, project_id, projects(title)")
    .in("project_id", projectIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!searches?.length) return [];

  const ids = searches.map((s) => s.id as string);
  const { data: results } = await supabase
    .from("ai_results")
    .select("search_id, summary, title, score")
    .in("search_id", ids)
    .order("rank", { ascending: true });

  const resultBySearch = new Map<string, { summary: string | null; title: string | null; score: number | null }>();
  for (const r of results ?? []) {
    const row = r as { search_id: string; summary: string | null; title: string | null; score: number | null };
    if (!resultBySearch.has(row.search_id)) {
      resultBySearch.set(row.search_id, row);
    }
  }

  const baseHref = role === "cpi" ? "/cpi/cases" : "/dashboard/projects";

  return searches.map((row) => {
    const s = row as {
      id: string;
      search_type: string;
      status: AiSearchStatus;
      query: string | null;
      created_at: string;
      project_id: string;
      projects: { title: string } | { title: string }[] | null;
    };
    const project = joinProject(s.projects);
    const result = resultBySearch.get(s.id);
    return {
      id: s.id,
      searchType: s.search_type,
      searchTypeLabel: getSearchTypeLabel(s.search_type) ?? SEARCH_TYPE_LABELS[s.search_type] ?? s.search_type,
      status: s.status,
      query: s.query,
      summary: result?.summary ?? result?.title ?? null,
      score: result?.score ?? null,
      projectTitle: project?.title ?? "Projet",
      projectId: s.project_id,
      created_at: s.created_at,
      href: `${baseHref}/${s.project_id}?tab=ai`,
    };
  });
}

export function buildSurveillanceProjects(
  items: WatchlistRow[],
  role: "holder" | "cpi" = "holder"
): SurveillanceProjectRow[] {
  const byProject = new Map<
    string,
    { title: string; reference_code: string | null; watchCount: number; lastScanAt: string | null }
  >();

  for (const item of items) {
    if (!item.project_id) continue;
    const existing = byProject.get(item.project_id);
    const scanAt = item.last_scan_at;
    const lastScanAt =
      existing?.lastScanAt && scanAt
        ? new Date(existing.lastScanAt) > new Date(scanAt)
          ? existing.lastScanAt
          : scanAt
        : scanAt ?? existing?.lastScanAt ?? null;

    byProject.set(item.project_id, {
      title: item.projects?.title ?? "Projet",
      reference_code: item.projects?.reference_code ?? null,
      watchCount: (existing?.watchCount ?? 0) + 1,
      lastScanAt,
    });
  }

  const baseHref = role === "cpi" ? "/cpi/cases" : "/dashboard/projects";

  return Array.from(byProject.entries()).map(([id, meta]) => ({
    id,
    title: meta.title,
    reference_code: meta.reference_code,
    status: "active",
    updated_at: meta.lastScanAt ?? new Date().toISOString(),
    watchCount: meta.watchCount,
    lastScanAt: meta.lastScanAt,
    href: `${baseHref}/${id}`,
  }));
}
