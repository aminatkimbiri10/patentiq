import { getAiProviderConfig } from "@/lib/ai/config";
import { synthesizeNoveltyReport, templateNoveltySummary } from "@/lib/ai/providers/synthesis";
import type { AiRunSearchResult, AiSearchResultItem } from "@/lib/ai/types";

export type ProjectReportContext = {
  projectTitle: string;
  referenceCode?: string | null;
  categoryName?: string | null;
  inventionSummary?: string | null;
  priorSearches: Array<{
    query: string | null;
    completedAt: string | null;
    summary: string | null;
    results: AiSearchResultItem[];
  }>;
};

function buildReportQuery(ctx: ProjectReportContext): string {
  const parts = [
    ctx.projectTitle,
    ctx.referenceCode ? `Réf. ${ctx.referenceCode}` : null,
    ctx.categoryName ? `Catégorie : ${ctx.categoryName}` : null,
    ctx.inventionSummary?.slice(0, 500),
  ].filter(Boolean);
  return parts.join(" — ") || "Rapport de nouveauté";
}

export async function runProjectReport(ctx: ProjectReportContext): Promise<AiRunSearchResult> {
  const config = getAiProviderConfig();
  const query = buildReportQuery(ctx);

  const aggregated: AiSearchResultItem[] = [];
  const seen = new Set<string>();

  for (const search of ctx.priorSearches) {
    for (const r of search.results) {
      const key = r.source_ref ?? r.title ?? r.rank?.toString() ?? "";
      if (key && seen.has(key)) continue;
      if (key) seen.add(key);
      aggregated.push(r);
    }
  }

  aggregated.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const results = aggregated.slice(0, 12).map((r, i) => ({ ...r, rank: i + 1 }));

  let summary: string;
  const providers: AiRunSearchResult["providers"] = { patent: "aggregated", synthesis: "template" };

  if (config.llm && query.length >= 2) {
    try {
      const priorBlock = ctx.priorSearches
        .map(
          (s, i) =>
            `Recherche ${i + 1} (${s.query ?? "—"}) : ${s.summary ?? "sans synthèse"}`
        )
        .join("\n");

      summary = await synthesizeNoveltyReport(
        config.llm.apiKey,
        config.llm.model,
        `${query}\n\nHistorique des analyses :\n${priorBlock}`,
        results
      );
      providers.synthesis = "huggingface";
    } catch (e) {
      console.error("[ai] report Hugging Face failed:", e);
      summary = buildTemplateReport(ctx, results);
    }
  } else {
    summary = buildTemplateReport(ctx, results);
  }

  return { summary, results, providers };
}

function buildTemplateReport(
  ctx: ProjectReportContext,
  results: AiSearchResultItem[]
): string {
  const lines = [
    `Rapport IA — ${ctx.projectTitle}`,
    ctx.referenceCode ? `Référence : ${ctx.referenceCode}` : null,
    ctx.categoryName ? `Type : ${ctx.categoryName}` : null,
    "",
    `Analyses antérieures : ${ctx.priorSearches.length}`,
    `Documents agrégés : ${results.length}`,
    "",
    templateNoveltySummary(
      ctx.inventionSummary?.slice(0, 200) ?? ctx.projectTitle,
      results,
      "rapport consolidé"
    ),
  ].filter((l) => l !== null);

  return lines.join("\n");
}
