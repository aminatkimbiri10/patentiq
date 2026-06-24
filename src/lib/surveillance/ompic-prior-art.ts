import type { AiSearchResultItem } from "@/lib/ai/types";
import type { OmpicHit } from "@/lib/surveillance/ompic-provider";
import { getOmpicSearchMode } from "@/lib/surveillance/ompic-provider";
import { searchOmpicLive } from "@/lib/surveillance/ompic-live-search";
import { resolveAssetTypeFromCategory } from "@/lib/surveillance/asset-type";

export function ompicHitsToAiResults(
  hits: OmpicHit[],
  searchType: string
): AiSearchResultItem[] {
  return hits.map((h, i) => {
    const isTrademark =
      h.source.includes("trademark") || h.source === "ompic_ma";
    const isDesign = h.source.includes("design") || h.source === "ompic_stub_design";
    return {
      result_type: isTrademark
        ? "prior_art_trademark"
        : isDesign
          ? "prior_art_design"
          : searchType === "fto"
            ? "fto_hit"
            : "prior_art",
      title: h.title,
      summary:
        h.summary ??
        (h.ref ? `Référence OMPIC ${h.ref}` : "Résultat OMPIC Maroc"),
      score: Math.round((h.score ?? 0.5) * 10000) / 10000,
      rank: i + 1,
      source_ref: h.ref ?? h.title,
      payload: {
        provider: h.source,
        territory: "MA",
        opposition_eligible: h.opposition_eligible ?? false,
        ompic: true,
      },
    };
  });
}

/** Fusionne et déduplique par source_ref, tri score décroissant. */
export function mergePriorArtResults(
  ...groups: AiSearchResultItem[][]
): AiSearchResultItem[] {
  const byRef = new Map<string, AiSearchResultItem>();

  for (const group of groups) {
    for (const item of group) {
      const key = (item.source_ref ?? item.title).toLowerCase();
      const existing = byRef.get(key);
      if (!existing || (item.score ?? 0) > (existing.score ?? 0)) {
        byRef.set(key, item);
      }
    }
  }

  return Array.from(byRef.values())
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .map((item, i) => ({ ...item, rank: i + 1 }));
}

export type OmpicPriorArtOptions = {
  query: string;
  categorySlug?: string | null;
  searchType: string;
};

export type OmpicPriorArtResult = {
  results: AiSearchResultItem[];
  error?: string;
};

/**
 * Recherche antériorité OMPIC live — marques pour dossiers marque, brevets MA sinon.
 */
export async function fetchOmpicPriorArt(
  options: OmpicPriorArtOptions
): Promise<OmpicPriorArtResult> {
  if (getOmpicSearchMode() !== "live") return { results: [] };

  const query = options.query.trim();
  if (query.length < 2) return { results: [] };

  const assetType = resolveAssetTypeFromCategory(options.categorySlug);

  try {
    const { results } = await searchOmpicLive({
      query,
      asset_type: assetType,
      territory: "MA",
    });
    return { results: ompicHitsToAiResults(results, options.searchType) };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur OMPIC";
    console.warn("[ompic-prior-art]", e);
    return { results: [], error: message };
  }
}
