import { textSimilarity } from "@/lib/surveillance/similarity";
import type { OmpicHit } from "@/lib/surveillance/ompic-provider";
import { fetchOmpicSearchPage } from "@/lib/surveillance/ompic-fetch";

export const OMPIC_TRADEMARK_SEARCH_PATH = "/web/pages/rechercheMarque.do";
/** @deprecated utiliser OMPIC_TRADEMARK_SEARCH_PATH */
export const OMPIC_TRADEMARK_SEARCH_URL = `http://search.ompic.ma${OMPIC_TRADEMARK_SEARCH_PATH}`;

export type OmpicTrademarkRow = {
  internalId: string;
  depositNumber: string;
  title: string;
  law: string;
};

/** Parse le tableau JavaScript `rows[n]=new Array(...)` renvoyé par search.ompic.ma */
export function parseOmpicTrademarkRows(html: string): OmpicTrademarkRow[] {
  if (isOmpicMaintenancePage(html)) return [];

  const rows: OmpicTrademarkRow[] = [];
  const re =
    /rows\[\d+\]=new Array\("(\d+)","[^"]*?>(\d+)<\/a>","((?:\\"|[^"])*)","((?:\\"|[^"])*)"\)/g;

  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    rows.push({
      internalId: match[1]!,
      depositNumber: match[2]!,
      title: match[3]!.replace(/\\"/g, '"').trim(),
      law: match[4]!.trim(),
    });
  }

  return rows;
}

export function isOmpicMaintenancePage(html: string): boolean {
  const lower = html.toLowerCase();
  return lower.includes("indisponible") && lower.includes("maintenance");
}

export function extractOmpicResultCount(html: string): number | null {
  const m = html.match(/(\d[\d\s]*)\s+R[ée]sultats trouv[ée]s/i);
  if (!m) return null;
  return Number(m[1]!.replace(/\s/g, ""));
}

export type TrademarkSearchOptions = {
  query: string;
  niceClasses?: string | null;
  /** 0 = phonétique (défaut), 1 = exacte */
  searchType?: "phonetic" | "exact";
  maxResults?: number;
};

function buildTrademarkForm(options: TrademarkSearchOptions, includeNice: boolean): string {
  const form = new URLSearchParams({
    nomMarque: options.query.trim(),
    typeRech: options.searchType === "exact" ? "1" : "0",
    debutRes: "0",
    finRes: String(Math.min(options.maxResults ?? 100, 100)),
    lang: "FR",
    count: "0",
  });

  if (includeNice && options.niceClasses?.trim()) {
    form.set("codeNice", options.niceClasses.replace(/\s/g, "").split(",")[0] ?? "");
  }

  return form.toString();
}

function rowsToHits(
  rows: OmpicTrademarkRow[],
  query: string,
  maxResults: number
): OmpicHit[] {
  const queryNorm = query.toLowerCase();

  return rows
    .map((row) => {
      const score = textSimilarity(query, row.title);
      return {
        title: row.title,
        ref: `MA-M-${row.depositNumber}`,
        source: "ompic_ma",
        summary: `Dépôt OMPIC n° ${row.depositNumber}${row.law ? ` — ${row.law}` : ""}`,
        score,
        opposition_eligible: true,
      } satisfies OmpicHit;
    })
    .filter((h) => h.title.toLowerCase() !== queryNorm)
    .filter((h) => (h.score ?? 0) >= 0.28)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, maxResults);
}

export async function searchOmpicTrademarks(
  options: TrademarkSearchOptions
): Promise<{ hits: OmpicHit[]; total: number | null; source: string; error?: string }> {
  const query = options.query.trim();
  if (!query) return { hits: [], total: 0, source: "ompic_ma_trademark" };

  const maxResults = options.maxResults ?? 20;
  const withNice = !!options.niceClasses?.trim();
  const passes: boolean[] = withNice ? [true, false] : [false];

  for (let i = 0; i < passes.length; i++) {
    const includeNice = passes[i]!;
    const fetched = await fetchOmpicSearchPage(
      OMPIC_TRADEMARK_SEARCH_PATH,
      buildTrademarkForm(options, includeNice)
    );

    if (!fetched.ok) {
      return { hits: [], total: null, source: "ompic_ma_trademark", error: fetched.error };
    }

    const html = fetched.html;
    if (isOmpicMaintenancePage(html)) {
      return {
        hits: [],
        total: 0,
        source: "ompic_ma_trademark",
        error: "OMPIC search.ompic.ma indisponible (maintenance)",
      };
    }

    const total = extractOmpicResultCount(html);
    const rows = parseOmpicTrademarkRows(html);
    const hits = rowsToHits(rows, query, maxResults);

    if (hits.length > 0) {
      return { hits, total, source: "ompic_ma_trademark" };
    }

    if (total === 0 || rows.length > 0) {
      return { hits: [], total, source: "ompic_ma_trademark" };
    }

    if ((total ?? 0) > 0 && rows.length === 0) {
      console.warn("[ompic] résultats OMPIC non parsés — format HTML à mettre à jour");
    }

    if (withNice && includeNice && i < passes.length - 1) {
      continue;
    }

    return { hits: [], total, source: "ompic_ma_trademark" };
  }

  return { hits: [], total: 0, source: "ompic_ma_trademark" };
}
