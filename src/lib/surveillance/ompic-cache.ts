import type { OmpicFetchResult } from "@/lib/surveillance/ompic-fetch";

type CacheEntry = {
  result: OmpicFetchResult;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

let lastRequestAt = 0;
let rateLimitTail: Promise<void> = Promise.resolve();

function envInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export const OMPIC_MIN_INTERVAL_MS = envInt("OMPIC_MIN_INTERVAL_MS", 2000);
export const OMPIC_CACHE_TTL_MS = envInt("OMPIC_CACHE_TTL_MS", 5 * 60 * 1000);
export const OMPIC_CACHE_ERROR_TTL_MS = envInt("OMPIC_CACHE_ERROR_TTL_MS", 60 * 1000);

export function ompicCacheKey(path: string, formBody: string): string {
  return `${path}\0${formBody}`;
}

export function getCachedOmpicFetch(
  path: string,
  formBody: string
): OmpicFetchResult | null {
  const key = ompicCacheKey(path, formBody);
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() >= entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.result;
}

export function setCachedOmpicFetch(
  path: string,
  formBody: string,
  result: OmpicFetchResult
): void {
  const ttl = result.ok ? OMPIC_CACHE_TTL_MS : OMPIC_CACHE_ERROR_TTL_MS;
  if (ttl <= 0) return;

  cache.set(ompicCacheKey(path, formBody), {
    result,
    expiresAt: Date.now() + ttl,
  });
}

export function clearOmpicCache(): void {
  cache.clear();
  lastRequestAt = 0;
  rateLimitTail = Promise.resolve();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Sérialise les requêtes OMPIC pour respecter un intervalle minimum. */
export async function waitForOmpicRateLimit(): Promise<void> {
  rateLimitTail = rateLimitTail.then(async () => {
    const wait = Math.max(0, lastRequestAt + OMPIC_MIN_INTERVAL_MS - Date.now());
    if (wait > 0) await sleep(wait);
    lastRequestAt = Date.now();
  });
  await rateLimitTail;
}

export function ompicCacheStats(): { size: number; minIntervalMs: number; ttlMs: number } {
  return {
    size: cache.size,
    minIntervalMs: OMPIC_MIN_INTERVAL_MS,
    ttlMs: OMPIC_CACHE_TTL_MS,
  };
}
