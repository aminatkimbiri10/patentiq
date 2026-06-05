import { getAiProviderConfig, describeActiveProviders } from "@/lib/ai/config";
import { generateStubResults } from "@/lib/ai/stub-engine";
import { patentHitsToResults, searchEpoPatents } from "@/lib/ai/providers/epo-ops";
import { synthesizeNoveltyReport, templateNoveltySummary } from "@/lib/ai/providers/gemini";
import type { AiRunSearchResult } from "@/lib/ai/types";
import type { AiSearchType } from "@/types/database";

export async function runAiSearch(
  query: string | null,
  searchType: AiSearchType
): Promise<AiRunSearchResult> {
  const q = query?.trim() || "";
  const config = getAiProviderConfig();
  const providers = describeActiveProviders(config);

  let results: AiRunSearchResult["results"] = [];
  let patentError: string | null = null;

  if (config.epo && q.length >= 2) {
    try {
      const hits = await searchEpoPatents(
        q,
        config.epo.consumerKey,
        config.epo.consumerSecret,
        8
      );
      results = patentHitsToResults(hits, q, searchType);
      providers.patent = "epo-ops";
    } catch (e) {
      patentError = e instanceof Error ? e.message : "Erreur EPO OPS";
      console.error("[ai] EPO OPS failed:", patentError);
    }
  }

  if (!results.length) {
    const stub = generateStubResults(q || "analyse générale", searchType);
    results = stub.results;
    if (!config.epo) {
      providers.patent = "stub";
    } else {
      providers.patent = "stub-fallback";
    }
  }

  let summary: string;

  if (config.gemini && q.length >= 2) {
    try {
      summary = await synthesizeNoveltyReport(
        config.gemini.apiKey,
        config.gemini.model,
        q,
        results
      );
      providers.synthesis = "gemini";
    } catch (e) {
      console.error("[ai] Gemini failed:", e);
      summary = templateNoveltySummary(q, results, providers.patent);
      if (patentError) {
        summary += ` Note : recherche EPO indisponible (${patentError.slice(0, 120)}).`;
      }
    }
  } else {
    summary = templateNoveltySummary(q, results, providers.patent);
    if (patentError) {
      summary += ` Note : recherche EPO indisponible (${patentError.slice(0, 120)}).`;
    }
  }

  return { summary, results, providers };
}
