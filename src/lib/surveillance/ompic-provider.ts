/**
 * Recherche OMPIC — Maroc
 *
 * L'OMPIC ne publie pas d'API REST officielle grand public.
 * Modes :
 * - live (défaut) : search.ompic.ma + brevets MA via EPO OPS
 * - stub : catalogue local de démo uniquement
 * - proxy : service HTTP intermédiaire (n8n)
 * - hybrid : live/proxy puis stub en secours
 *
 * Variables : OMPIC_SEARCH_MODE, OMPIC_PROXY_URL, OMPIC_PROXY_TOKEN
 */

import { enrichTrademarkHitsWithLogoSimilarity } from "@/lib/surveillance/logo-similarity";
import { searchOmpicLive } from "@/lib/surveillance/ompic-live-search";
import { catalogForAssetType, OMPIC_STUB_CATALOG } from "@/lib/surveillance/ompic-stub";
import { findSimilarTitles } from "@/lib/surveillance/similarity";
import type { IpAssetType } from "@/types/surveillance";

export type OmpicHit = {
  title: string;
  ref?: string;
  source: string;
  summary?: string;
  score?: number;
  /** URL image marque — similarité visuelle */
  logo_url?: string;
  /** Score similarité logo 0–1 (après enrichissement) */
  logo_score?: number;
  /** Score texte avant fusion logo */
  text_score?: number;
  /** Fin publication OMPIC — fenêtre opposition marque (~2 mois) */
  publication_end_at?: string;
  opposition_eligible?: boolean;
};

/** Contexte actif client (portefeuille) — envoyé au proxy n8n */
export type OmpicSearchContext = {
  registration_number?: string | null;
  nice_classes?: string | null;
  territory?: string;
  summary?: string | null;
  logo_url?: string | null;
};

export function getOmpicSearchMode(): "live" | "stub" | "proxy" | "hybrid" {
  const m = (process.env.OMPIC_SEARCH_MODE ?? "live").toLowerCase();
  if (m === "stub") return "stub";
  if (m === "proxy" || m === "hybrid") return m;
  return "live";
}

async function fetchOmpicProxy(
  query: string,
  assetType: IpAssetType,
  context?: OmpicSearchContext
): Promise<OmpicHit[]> {
  const endpoint = process.env.OMPIC_PROXY_URL?.replace(/\/$/, "");
  if (!endpoint) return [];

  const token = process.env.OMPIC_PROXY_TOKEN;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      query,
      asset_type: assetType,
      territory: context?.territory ?? "MA",
      registration_number: context?.registration_number ?? undefined,
      nice_classes: context?.nice_classes ?? undefined,
      summary: context?.summary ?? undefined,
      logo_url: context?.logo_url ?? undefined,
    }),
    signal: AbortSignal.timeout(40_000),
  });

  if (!res.ok) {
    console.warn("[ompic] proxy HTTP", res.status);
    return [];
  }

  const data = (await res.json()) as { results?: OmpicHit[] };
  return Array.isArray(data.results) ? data.results : [];
}

function searchStub(query: string, assetType: IpAssetType): OmpicHit[] {
  const catalog = catalogForAssetType(assetType);
  return findSimilarTitles(query, [...catalog], 0.45).map((m) => {
    const entry = catalog.find((c) => c.title === m.title) as
      | { logo_url?: string }
      | undefined;
    return {
      title: m.title,
      ref: m.ref,
      source: m.source ?? "ompic_stub",
      summary: m.summary,
      score: m.score,
      logo_url: entry?.logo_url,
    };
  });
}

/** Recherche similarités pour surveillance / antériorité PI */
export async function searchOmpicSimilar(
  query: string,
  assetType: IpAssetType,
  context?: OmpicSearchContext
): Promise<{ hits: OmpicHit[]; mode: string; error?: string }> {
  if (assetType === "design") {
    return { hits: [], mode: "design_no_automation" };
  }

  const mode = getOmpicSearchMode();
  let hits: OmpicHit[] = [];
  let resultMode: string = mode;
  let lastError: string | undefined;

  if (mode === "live") {
    try {
      const { results, source } = await searchOmpicLive({
        query,
        asset_type: assetType,
        territory: context?.territory ?? "MA",
        nice_classes: context?.nice_classes ?? undefined,
        registration_number: context?.registration_number ?? undefined,
        summary: context?.summary ?? undefined,
        logo_url: context?.logo_url ?? undefined,
      });
      hits = results;
      resultMode = source;
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Erreur recherche OMPIC live";
      console.warn("[ompic] live search error", e);
    }
  }

  if ((mode === "proxy" || mode === "hybrid" || (mode === "live" && hits.length === 0 && lastError)) && hits.length === 0) {
    const proxyUrl = process.env.OMPIC_PROXY_URL?.replace(/\/$/, "");
    if (proxyUrl) {
      try {
        hits = await fetchOmpicProxy(query, assetType, context);
        if (hits.length > 0) {
          resultMode = mode === "proxy" ? "ompic_proxy" : "ompic_proxy_fallback";
          lastError = undefined;
        }
      } catch (e) {
        console.warn("[ompic] proxy error", e);
        if (!lastError) {
          lastError = e instanceof Error ? e.message : "Erreur proxy OMPIC";
        }
      }
    }
  }

  if (hits.length === 0 && (mode === "stub" || mode === "hybrid")) {
    hits = searchStub(query, assetType);
    resultMode = "ompic_stub";
    lastError = undefined;
  }

  if (assetType === "trademark" && context?.logo_url?.trim() && hits.length > 0) {
    hits = await enrichTrademarkHitsWithLogoSimilarity(context.logo_url, hits);
    if (resultMode !== "ompic_stub") {
      resultMode = `${resultMode}+logo`;
    }
  }

  return { hits, mode: resultMode, error: hits.length === 0 ? lastError : undefined };
}

export function ompicProviderLabel(): string {
  const mode = getOmpicSearchMode();
  if (mode === "live") return "OMPIC live (marques / brevets MA)";
  if (mode === "proxy") return "OMPIC via proxy";
  if (mode === "hybrid") return "OMPIC hybrid (live + secours)";
  return "OMPIC (stub démo)";
}

/** Références utiles pour intégration future */
export const OMPIC_PUBLIC_ENDPOINTS = {
  portal: "https://www.ompic.ma",
  patentPublication: "https://patent.ompic.ma",
  patentRegister: "https://patentregister.ompic.ma",
  directDepot: "https://directompic.ma",
} as const;
