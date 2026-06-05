import type { PatentHit } from "@/lib/ai/types";

const EPO_OPS_BASE = "https://ops.epo.org/3.2";

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

/** Construit une requête CQL (titre + abstract) à partir des mots-clés utilisateur. */
export function buildEpoCqlQuery(query: string): string {
  const words = query
    .trim()
    .replace(/[^a-zA-Z0-9\u00C0-\u024F\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1)
    .slice(0, 8);

  if (words.length === 0) {
    throw new Error("Requête trop courte pour une recherche brevets");
  }

  const phrase = words.join(" ");
  return `ta all "${phrase}"`;
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
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (!keywords.length) return 0.5;

  const hits = keywords.filter((k) => hay.includes(k)).length;
  return Math.min(0.98, 0.35 + hits / keywords.length * 0.55);
}

function parseExchangeDocuments(xml: string): PatentHit[] {
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

export async function searchEpoPatents(
  query: string,
  consumerKey: string,
  consumerSecret: string,
  limit = 8
): Promise<PatentHit[]> {
  const token = await fetchAccessToken(consumerKey, consumerSecret);
  const cql = buildEpoCqlQuery(query);
  const rangeEnd = Math.min(Math.max(limit, 1), 25);

  const url = `${EPO_OPS_BASE}/rest-services/published-data/search/biblio?q=${encodeURIComponent(cql)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/exchange+xml",
      "X-OPS-Range": `1-${rangeEnd}`,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`EPO OPS search failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const xml = await res.text();
  const hits = parseExchangeDocuments(xml);

  return hits
    .map((h) => ({ hit: h, score: keywordScore(query, h.title, h.abstract) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.hit);
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
