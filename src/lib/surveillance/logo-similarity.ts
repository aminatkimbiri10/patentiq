import sharp from "sharp";
import type { OmpicHit } from "@/lib/surveillance/ompic-provider";

const HASH_SIZE = 8;
const LOGO_FETCH_TIMEOUT_MS = 12_000;
const LOGO_SIMILARITY_THRESHOLD = 0.72;
const COMBINED_TEXT_WEIGHT = 0.55;
const COMBINED_LOGO_WEIGHT = 0.45;

/** Distance de Hamming normalisée → similarité 0–1 */
export function hashSimilarity(hashA: string, hashB: string): number {
  if (!hashA || !hashB || hashA.length !== hashB.length) return 0;
  let matches = 0;
  for (let i = 0; i < hashA.length; i++) {
    if (hashA[i] === hashB[i]) matches++;
  }
  return matches / hashA.length;
}

/** Average hash (aHash) 8×8 → 64 bits binaires */
export async function computeAverageHash(image: Buffer): Promise<string | null> {
  try {
    const { data } = await sharp(image)
      .resize(HASH_SIZE, HASH_SIZE, { fit: "fill" })
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    if (!data.length) return null;

    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i] ?? 0;
    const avg = sum / data.length;

    let bits = "";
    for (let i = 0; i < data.length; i++) {
      bits += (data[i] ?? 0) >= avg ? "1" : "0";
    }
    return bits;
  } catch {
    return null;
  }
}

const hashCache = new Map<string, string>();

export async function fetchLogoHash(url: string): Promise<string | null> {
  const key = url.trim();
  if (!key.startsWith("http")) return null;

  const cached = hashCache.get(key);
  if (cached) return cached;

  try {
    const res = await fetch(key, {
      signal: AbortSignal.timeout(LOGO_FETCH_TIMEOUT_MS),
      headers: { Accept: "image/*,*/*" },
    });
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType && !contentType.startsWith("image/") && !contentType.includes("octet-stream")) {
      return null;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 32) return null;

    const hash = await computeAverageHash(buffer);
    if (hash) hashCache.set(key, hash);
    return hash;
  } catch {
    return null;
  }
}

export type LogoEnrichedHit = OmpicHit & {
  logo_url?: string;
  logo_score?: number;
  text_score?: number;
};

function combinedScore(textScore: number, logoScore: number | undefined): number {
  if (logoScore == null) return textScore;
  return Math.min(
    0.99,
    textScore * COMBINED_TEXT_WEIGHT + logoScore * COMBINED_LOGO_WEIGHT
  );
}

/**
 * Enrichit les hits marque avec similarité visuelle (aHash) si logo portefeuille + logo candidat.
 * OMPIC live ne fournit pas encore les images — utile avec stub/proxy ou URLs renseignées.
 */
export async function enrichTrademarkHitsWithLogoSimilarity(
  referenceLogoUrl: string | null | undefined,
  hits: OmpicHit[]
): Promise<LogoEnrichedHit[]> {
  const refUrl = referenceLogoUrl?.trim();
  if (!refUrl?.startsWith("http") || !hits.length) {
    return hits.map((h) => ({ ...h, text_score: h.score }));
  }

  const refHash = await fetchLogoHash(refUrl);
  if (!refHash) {
    return hits.map((h) => ({ ...h, text_score: h.score }));
  }

  const enriched: LogoEnrichedHit[] = [];

  for (const hit of hits) {
    const textScore = hit.score ?? 0;
    const logoUrl = hit.logo_url?.trim();

    let logoScore: number | undefined;
    if (logoUrl?.startsWith("http")) {
      const candidateHash = await fetchLogoHash(logoUrl);
      if (candidateHash) {
        logoScore = hashSimilarity(refHash, candidateHash);
      }
    }

    const score = combinedScore(textScore, logoScore);
    const passesText = textScore >= 0.28;
    const passesLogo = logoScore != null && logoScore >= LOGO_SIMILARITY_THRESHOLD;

    if (!passesText && !passesLogo) continue;

    enriched.push({
      ...hit,
      score,
      text_score: textScore,
      logo_score: logoScore,
      summary: [
        hit.summary,
        logoScore != null ? `Similarité visuelle ${Math.round(logoScore * 100)} %` : null,
      ]
        .filter(Boolean)
        .join(" — "),
    });
  }

  return enriched.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}
