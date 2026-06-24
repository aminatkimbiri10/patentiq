import { getAiProviderConfig, describeActiveProviders } from "@/lib/ai/config";
import { applyLlmSynthesisFallback } from "@/lib/ai/llm-client";
import { generateStubResults } from "@/lib/ai/stub-engine";
import {
  patentHitsToResults,
  searchEpoPatents,
  searchMoroccanPatents,
} from "@/lib/ai/providers/epo-ops";
import {
  synthesizeNoveltyReport,
  synthesizeFtoReport,
  templateNoveltySummary,
  templateFtoSummary,
} from "@/lib/ai/providers/synthesis";
import {
  runClassification,
  runSemanticAnalysis,
  runSimilarityAnalysis,
  runSummarization,
  runTagSuggestion,
  runAssistant,
  fetchProjectContext,
} from "@/lib/ai/run-analysis";
import type { AiRunSearchResult } from "@/lib/ai/types";
import type { AiSearchType } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getOmpicSearchMode } from "@/lib/surveillance/ompic-provider";
import {
  fetchOmpicPriorArt,
  mergePriorArtResults,
} from "@/lib/surveillance/ompic-prior-art";

export type AiRunOptions = {
  projectId?: string;
  documentIds?: string[];
  admin?: SupabaseClient;
};

const PRIOR_ART_TYPES = new Set<AiSearchType>([
  "novelty",
  "semantic",
  "similarity",
  "fto",
]);

async function fetchPriorArtResults(
  q: string,
  searchType: AiSearchType,
  providers: ReturnType<typeof describeActiveProviders>,
  categorySlug?: string | null
): Promise<{
  results: AiRunSearchResult["results"];
  patentError: string | null;
  ompicError: string | null;
}> {
  const config = getAiProviderConfig();
  const ompicMode = getOmpicSearchMode();
  const isMarque = categorySlug === "marque";
  let epoResults: AiRunSearchResult["results"] = [];
  let ompicResults: AiRunSearchResult["results"] = [];
  let patentError: string | null = null;
  let ompicError: string | null = null;

  if (config.epo && q.length >= 2 && !isMarque) {
    let globalHits: Awaited<ReturnType<typeof searchEpoPatents>> = [];
    let maHits: Awaited<ReturnType<typeof searchMoroccanPatents>> = [];

    try {
      const limit = searchType === "fto" ? 10 : 8;
      globalHits = await searchEpoPatents(
        q,
        config.epo.consumerKey,
        config.epo.consumerSecret,
        limit
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur EPO OPS";
      patentError = msg;
      console.error("[ai] EPO global search failed:", msg);
    }

    if (ompicMode === "live" || searchType === "fto") {
      try {
        maHits = await searchMoroccanPatents(
          q,
          config.epo.consumerKey,
          config.epo.consumerSecret,
          6
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erreur EPO OPS Maroc";
        patentError = patentError ? `${patentError} | ${msg}` : msg;
        console.error("[ai] EPO MA search failed:", msg);
      }
    }

    const seen = new Set<string>();
    const mergedHits = [...globalHits, ...maHits].filter((h) => {
      if (seen.has(h.source_ref)) return false;
      seen.add(h.source_ref);
      return true;
    });

    if (mergedHits.length > 0) {
      epoResults = patentHitsToResults(mergedHits, q, searchType);
      providers.patent =
        globalHits.length > 0 && maHits.length > 0
          ? "epo-ops+ma"
          : maHits.length > 0
            ? "epo-ops-ma"
            : "epo-ops";
    }
  }

  if (q.length >= 2) {
    const ompic = await fetchOmpicPriorArt({
      query: q,
      categorySlug,
      searchType,
    });
    ompicResults = ompic.results;
    ompicError = ompic.error ?? null;
    if (ompicResults.length > 0) {
      providers.patent = providers.patent
        ? `${providers.patent}+ompic-live`
        : "ompic-live";
    }
  }

  let results = mergePriorArtResults(epoResults, ompicResults);

  if (!results.length && ompicMode !== "live") {
    const stub = generateStubResults(q || "analyse générale", searchType);
    results = stub.results;
    providers.patent = config.epo ? "stub-fallback" : "stub";
  }

  return { results, patentError, ompicError };
}

export async function runAiSearch(
  query: string | null,
  searchType: AiSearchType,
  options: AiRunOptions = {}
): Promise<AiRunSearchResult> {
  const config = getAiProviderConfig();
  const providers = describeActiveProviders(config);
  const q = query?.trim() || "";

  if (
    searchType === "summarization" &&
    options.admin &&
    options.projectId
  ) {
    return runSummarization(
      options.admin,
      options.projectId,
      query,
      options.documentIds ?? []
    );
  }

  if (searchType === "classification" && options.admin && options.projectId) {
    return runClassification(options.admin, options.projectId, query);
  }

  if (searchType === "tag_suggestion" && options.admin && options.projectId) {
    return runTagSuggestion(options.admin, options.projectId, query);
  }

  if (searchType === "assistant" && options.admin && options.projectId) {
    return runAssistant(options.admin, options.projectId, q || "question");
  }

  let effectiveQuery = q;
  let inventionSummary: string | null = null;
  let categorySlug: string | null = null;

  if (
    (PRIOR_ART_TYPES.has(searchType) || searchType === "similarity") &&
    options.admin &&
    options.projectId
  ) {
    const ctx = await fetchProjectContext(options.admin, options.projectId);
    inventionSummary = ctx.inventionSummary;
    categorySlug = ctx.categorySlug;
    if (searchType === "similarity" && !effectiveQuery) {
      effectiveQuery = ctx.similarityQuery;
    }
  }

  if (searchType === "similarity" && !effectiveQuery && options.admin && options.projectId) {
    const ctx = await fetchProjectContext(options.admin, options.projectId);
    effectiveQuery = ctx.similarityQuery;
    inventionSummary = ctx.inventionSummary;
    categorySlug = ctx.categorySlug;
  }

  let results: AiRunSearchResult["results"] = [];
  let patentError: string | null = null;
  let ompicError: string | null = null;

  if (PRIOR_ART_TYPES.has(searchType) || searchType === "similarity") {
    const patentQ = effectiveQuery || q;
    if (patentQ.length < 2) {
      return {
        summary:
          "Requête trop courte. Renseignez le résumé d'invention du projet ou saisissez des mots-clés.",
        results: [],
        providers,
      };
    }
    const priorArt = await fetchPriorArtResults(
      patentQ,
      searchType,
      providers,
      categorySlug
    );
    results = priorArt.results;
    patentError = priorArt.patentError;
    ompicError = priorArt.ompicError;
  }

  let summary: string;
  const reportQuery = effectiveQuery || q;

  if (searchType === "fto") {
    if (config.llm && reportQuery.length >= 2) {
      try {
        summary = await synthesizeFtoReport(
          config.llm.apiKey,
          config.llm.model,
          reportQuery,
          results
        );
        providers.synthesis = "huggingface";
      } catch (e) {
        console.error("[ai] FTO synthesis failed:", e);
        summary = applyLlmSynthesisFallback(
          templateFtoSummary(reportQuery, results, providers.patent),
          e,
          providers
        );
      }
    } else {
      summary = templateFtoSummary(reportQuery, results, providers.patent);
    }
  } else if (searchType === "semantic" && effectiveQuery.length >= 2) {
    try {
      summary = await runSemanticAnalysis(effectiveQuery, results, providers.patent);
      if (config.llm) providers.synthesis = "huggingface";
    } catch (e) {
      console.error("[ai] semantic failed:", e);
      summary = applyLlmSynthesisFallback(
        templateNoveltySummary(effectiveQuery, results, providers.patent),
        e,
        providers
      );
    }
  } else if (searchType === "similarity") {
    try {
      summary = await runSimilarityAnalysis(
        effectiveQuery,
        inventionSummary,
        results,
        providers.patent
      );
      if (config.llm) providers.synthesis = "huggingface";
    } catch (e) {
      console.error("[ai] similarity failed:", e);
      summary = applyLlmSynthesisFallback(
        templateNoveltySummary(effectiveQuery, results, providers.patent),
        e,
        providers
      );
    }
  } else if (config.llm && reportQuery.length >= 2) {
    try {
      summary = await synthesizeNoveltyReport(
        config.llm.apiKey,
        config.llm.model,
        reportQuery,
        results
      );
      providers.synthesis = "huggingface";
    } catch (e) {
      console.error("[ai] Hugging Face failed:", e);
      summary = applyLlmSynthesisFallback(
        templateNoveltySummary(reportQuery, results, providers.patent),
        e,
        providers
      );
    }
  } else {
    summary = templateNoveltySummary(reportQuery, results, providers.patent);
  }

  if (patentError && !results.length) {
    summary += ` Note : recherche EPO indisponible (${patentError.slice(0, 120)}).`;
  } else if (patentError && results.length > 0) {
    summary += " Note : couverture EPO Maroc partielle — résultats internationaux ou OMPIC disponibles.";
  }

  if (ompicError && categorySlug === "marque") {
    summary += ` Note OMPIC Maroc : ${ompicError.slice(0, 140)}.`;
  } else if (ompicError && !results.length && !patentError) {
    summary += ` Note OMPIC : ${ompicError.slice(0, 140)}.`;
  }

  return { summary, results, providers };
}
