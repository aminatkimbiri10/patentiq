import type { PatentHit } from "@/lib/ai/types";

const EPO_OPS_BASE = "https://ops.epo.org/3.2";

const EPO_STOP_WORDS = new Set([
  "avec",
  "pour",
  "dans",
  "une",
  "des",
  "les",
  "sur",
  "par",
  "est",
  "sont",
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "system",
  "système",
  "device",
  "appareil",
]);

type TokenCache = { token: string; expiresAt: number };
let tokenCache: TokenCache | null = null;

function decodeXmlEntities(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/** Mots-clés CQL (2–4 termes) à partir d'une requête utilisateur. */
export function extractEpoKeywords(query: string, max = 4): string[] {
  const seen = new Set<string>();
  const words: string[] = [];

  for (const raw of query
    .trim()
    .replace(/[^a-zA-Z0-9\u00C0-\u024F\s-]/g, " ")
    .split(/\s+/)) {
    const w = raw.trim();
    if (w.length < 3) continue;
    const key = w.toLowerCase();
    if (EPO_STOP_WORDS.has(key) || seen.has(key)) continue;
    seen.add(key);
    words.push(w);
    if (words.length >= max) break;
  }

  return words;
}

/**
 * Requêtes CQL OPS (du plus précis au plus large).
 * `ta all` n'est pas documenté — on utilise `txt all` et proximité `ta=`.
 */
export function buildEpoCqlQueries(query: string): string[] {
  const keywords = extractEpoKeywords(query, 4);
  if (!keywords.length) {
    throw new Error("Requête trop courte pour une recherche brevets");
  }

  const queries: string[] = [];

  if (keywords.length >= 3) {
    queries.push(`txt all "${keywords.slice(0, 3).join(" ")}"`);
  }
  if (keywords.length >= 2) {
    const [a, b] = keywords;
    queries.push(`(ta=${a} prox/distance<=8 ta=${b})`);
    queries.push(`txt all "${a} ${b}"`);
  }
  queries.push(`txt all "${keywords[0]}"`);
  queries.push(`ta=${keywords[0]}`);

  return Array.from(new Set(queries));
}

/** @deprecated Utiliser buildEpoCqlQueries — conservé pour compatibilité interne */
export function buildEpoCqlQuery(query: string): string {
  return buildEpoCqlQueries(query)[0]!;
}

async function fetchAccessToken(consumerKey: string, consumerSecret: string): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const res = await fetch(`${EPO_OPS_BASE}/auth/accesstoken`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`EPO OPS auth failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in?: number };
  const ttl = (data.expires_in ?? 1200) - 90;

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + ttl * 1000,
  };

  return data.access_token;
}

function keywordScore(query: string, title: string, abstract?: string): number {
  const hay = `${title} ${abstract ?? ""}`.toLowerCase();
  const keywords = extractEpoKeywords(query, 8);

  if (!keywords.length) return 0.5;

  const hits = keywords.filter((k) => hay.includes(k.toLowerCase())).length;
  return Math.min(0.98, 0.35 + hits / keywords.length * 0.55);
}

export function parseExchangeDocuments(xml: string): PatentHit[] {
  const blocks = xml.split(/<exchange-document\b/i).slice(1);
  const hits: PatentHit[] = [];

  for (const block of blocks) {
    const chunk = block.slice(0, 12000);

    const country =
      chunk.match(/<country>([^<]+)<\/country>/i)?.[1]?.trim() ?? "";
    const docNumber =
      chunk.match(/<doc-number>([^<]+)<\/doc-number>/i)?.[1]?.trim() ?? "";
    const kind = chunk.match(/<kind>([^<]+)<\/kind>/i)?.[1]?.trim() ?? "";
    const date =
      chunk.match(/<date>(\d{8})<\/date>/i)?.[1]?.trim() ?? "";

    const titleMatch = chunk.match(/<invention-title[^>]*>([\s\S]*?)<\/invention-title>/i);
    const title = titleMatch ? decodeXmlEntities(titleMatch[1].replace(/<[^>]+>/g, " ")) : "";

    const abstractMatch = chunk.match(/<abstract[^>]*>([\s\S]*?)<\/abstract>/i);
    const abstract = abstractMatch
      ? decodeXmlEntities(abstractMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " "))
      : undefined;

    const applicants: string[] = [];
    const applicantRe = /<applicant-name[^>]*>([\s\S]*?)<\/applicant-name>/gi;
    let applicantMatch = applicantRe.exec(chunk);
    while (applicantMatch && applicants.length < 2) {
      const name = decodeXmlEntities(
        applicantMatch[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")
      );
      if (name) applicants.push(name);
      applicantMatch = applicantRe.exec(chunk);
    }

    if (!docNumber && !title) continue;

    const source_ref = [country, docNumber, kind].filter(Boolean).join("") || docNumber;

    hits.push({
      source_ref,
      title: title || `Brevet ${source_ref}`,
      abstract,
      publication_date: date
        ? `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`
        : undefined,
      applicants,
    });
  }

  return hits;
}

async function fetchEpoSearchPage(
  cql: string,
  token: string,
  rangeEnd: number
): Promise<{ ok: boolean; status: number; xml: string; body: string }> {
  const url = `${EPO_OPS_BASE}/rest-services/published-data/search/biblio?q=${encodeURIComponent(cql)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/exchange+xml",
      "X-OPS-Range": `1-${rangeEnd}`,
    },
  });

  const body = await res.text().catch(() => "");
  return { ok: res.ok, status: res.status, xml: body, body };
}

/** EPO renvoie 404 EntityNotFound quand la requête est valide mais sans résultats. */
function isEpoEmptyResult(status: number, body: string): boolean {
  return (
    status === 404 &&
    body.includes("EntityNotFound") &&
    body.includes("No results found")
  );
}

function isEpoRetryableStatus(status: number): boolean {
  return status === 404 || status === 400;
}

async function runEpoCqlSearch(
  cqlQueries: string[],
  token: string,
  rangeEnd: number,
  query: string,
  errorLabel: string
): Promise<PatentHit[]> {
  let lastError: Error | null = null;

  for (const cql of cqlQueries) {
    const page = await fetchEpoSearchPage(cql, token, rangeEnd);

    if (!page.ok) {
      if (isEpoEmptyResult(page.status, page.body)) {
        continue;
      }

      const err = new Error(
        `${errorLabel} (${page.status}): ${page.body.slice(0, 300)}`
      );
      lastError = err;
      if (isEpoRetryableStatus(page.status)) continue;
      throw err;
    }

    const hits = parseExchangeDocuments(page.xml);
    if (hits.length > 0) {
      return hits
        .map((h) => ({ hit: h, score: keywordScore(query, h.title, h.abstract) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, rangeEnd)
        .map((x) => x.hit);
    }
  }

  if (lastError) throw lastError;
  return [];
}

export async function searchEpoPatents(
  query: string,
  consumerKey: string,
  consumerSecret: string,
  limit = 8
): Promise<PatentHit[]> {
  const token = await fetchAccessToken(consumerKey, consumerSecret);
  const rangeEnd = Math.min(Math.max(limit, 1), 25);
  return runEpoCqlSearch(
    buildEpoCqlQueries(query),
    token,
    rangeEnd,
    query,
    "EPO OPS search failed"
  );
}

/** Requêtes CQL brevets marocains — `pn=MA` filtre le pays de publication (pas `pa=` = déposant). */
export function buildMoroccanCqlQueries(query: string): string[] {
  return Array.from(
    new Set(
      buildEpoCqlQueries(query).flatMap((q) => [`(${q}) and pn=MA`, `(${q}) and MA`])
    )
  );
}

/** Brevets publiés au Maroc — index EPO (publications MA). */
export async function searchMoroccanPatents(
  query: string,
  consumerKey: string,
  consumerSecret: string,
  limit = 8
): Promise<PatentHit[]> {
  const token = await fetchAccessToken(consumerKey, consumerSecret);
  const rangeEnd = Math.min(Math.max(limit, 1), 25);

  return runEpoCqlSearch(
    buildMoroccanCqlQueries(query),
    token,
    rangeEnd,
    query,
    "EPO OPS MA search failed"
  );
}

export function patentHitsToResults(
  hits: PatentHit[],
  query: string,
  searchType: string
): import("@/lib/ai/types").AiSearchResultItem[] {
  return hits.map((hit, i) => {
    const score = keywordScore(query, hit.title, hit.abstract);
    const abstractSnippet = hit.abstract?.slice(0, 280) ?? "Pas de résumé disponible.";

    return {
      result_type: searchType === "novelty" ? "prior_art" : "generic",
      title: hit.title,
      summary: [
        hit.publication_date ? `Publié le ${hit.publication_date}.` : null,
        hit.applicants?.length ? `Déposant : ${hit.applicants.join(", ")}.` : null,
        abstractSnippet,
      ]
        .filter(Boolean)
        .join(" "),
      score: Math.round(score * 10000) / 10000,
      rank: i + 1,
      source_ref: hit.source_ref,
      payload: {
        provider: "epo-ops",
        query,
        abstract: hit.abstract,
        publication_date: hit.publication_date,
        applicants: hit.applicants,
        espacenet_url: `https://worldwide.espacenet.com/patent/search?q=${encodeURIComponent(hit.source_ref)}`,
      },
    };
  });
}
