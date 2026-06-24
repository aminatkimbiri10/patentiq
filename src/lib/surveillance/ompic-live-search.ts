import { searchMoroccanPatents, extractEpoKeywords } from "@/lib/ai/providers/epo-ops";
import type { OmpicHit } from "@/lib/surveillance/ompic-provider";
import { searchOmpicTrademarks } from "@/lib/surveillance/ompic-trademark-search";
import type { OmpicProxyRequest } from "@/lib/surveillance/ompic-proxy-handler";
import type { IpAssetType } from "@/types/surveillance";

function patentToOmpicHit(
  hit: Awaited<ReturnType<typeof searchMoroccanPatents>>[number],
  query: string
): OmpicHit {
  const keywords = extractEpoKeywords(query, 6);
  const hay = `${hit.title} ${hit.abstract ?? ""}`.toLowerCase();
  const matched = keywords.filter((k) => hay.includes(k.toLowerCase())).length;
  const score =
    keywords.length > 0
      ? Math.min(0.98, 0.4 + (matched / keywords.length) * 0.5)
      : 0.5;

  return {
    title: hit.title,
    ref: hit.source_ref.startsWith("MA") ? hit.source_ref : `MA-${hit.source_ref}`,
    source: "ompic_ma_epo",
    summary: [
      hit.publication_date ? `Publication ${hit.publication_date}` : null,
      hit.applicants?.length ? `Déposant : ${hit.applicants.slice(0, 2).join(", ")}` : null,
      hit.abstract?.slice(0, 200),
    ]
      .filter(Boolean)
      .join(" — "),
    score,
  };
}

/**
 * Recherche OMPIC réelle — marques via search.ompic.ma, brevets MA via EPO OPS.
 * Dessins : pas de source live automatisée (OMPIC ne publie pas search.ompic.ma pour les DMI).
 */
export async function searchOmpicLive(
  body: OmpicProxyRequest
): Promise<{ results: OmpicHit[]; source: string; total?: number | null }> {
  const query = String(body.query ?? "").trim();
  const assetType: IpAssetType =
    body.asset_type === "patent"
      ? "patent"
      : body.asset_type === "design"
        ? "design"
        : "trademark";

  if (!query) {
    return { results: [], source: "ompic_ma" };
  }

  if (assetType === "trademark") {
    const { hits, total, source, error } = await searchOmpicTrademarks({
      query,
      niceClasses: body.nice_classes,
      searchType: "phonetic",
      maxResults: 20,
    });
    if (error && hits.length === 0) {
      throw new Error(error);
    }
    return { results: hits, source, total };
  }

  if (assetType === "design") {
    return { results: [], source: "design_no_live", total: 0 };
  }

  const key = process.env.EPO_OPS_CONSUMER_KEY;
  const secret = process.env.EPO_OPS_CONSUMER_SECRET;
  if (!key || !secret) {
    throw new Error(
      "Brevets MA : configurez EPO_OPS_CONSUMER_KEY et EPO_OPS_CONSUMER_SECRET (patent.ompic.ma souvent en maintenance)"
    );
  }

  const patents = await searchMoroccanPatents(query, key, secret, 12);
  return {
    results: patents.map((p) => patentToOmpicHit(p, query)),
    source: "ompic_ma_epo",
    total: patents.length,
  };
}
