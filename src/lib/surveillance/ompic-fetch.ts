import https from "node:https";
import {
  getCachedOmpicFetch,
  setCachedOmpicFetch,
  waitForOmpicRateLimit,
} from "@/lib/surveillance/ompic-cache";

const BROWSER_HEADERS: Record<string, string> = {
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "fr-FR,fr;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export type OmpicFetchResult =
  | { ok: true; html: string; url: string }
  | { ok: false; error: string; tried: string[] };

function fetchHttpsInsecure(url: string, body: string, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: `${parsed.pathname}${parsed.search}`,
        method: "POST",
        headers: {
          ...BROWSER_HEADERS,
          "Content-Length": Buffer.byteLength(body),
        },
        rejectUnauthorized: false,
        timeout: timeoutMs,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const html = Buffer.concat(chunks).toString("utf8");
          if ((res.statusCode ?? 0) >= 400) {
            reject(new Error(`OMPIC HTTP ${res.statusCode}`));
            return;
          }
          resolve(html);
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
    req.write(body);
    req.end();
  });
}

async function fetchHttp(url: string, body: string, timeoutMs: number): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: BROWSER_HEADERS,
    body,
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`OMPIC HTTP ${res.status}`);
  return res.text();
}

/**
 * OMPIC search.ompic.ma : certificat souvent auto-signé, HTTP parfois lent.
 * Essaie HTTPS (TLS permissif) puis HTTP.
 */
export async function fetchOmpicSearchPage(
  path: string,
  formBody: string
): Promise<OmpicFetchResult> {
  const cached = getCachedOmpicFetch(path, formBody);
  if (cached) return cached;

  await waitForOmpicRateLimit();

  const bases = ["https://search.ompic.ma", "http://search.ompic.ma"];
  const tried: string[] = [];
  let lastError = "Connexion OMPIC impossible";
  const timeoutMs = 30_000;

  for (const base of bases) {
    const url = `${base}${path}`;
    tried.push(url);

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const html =
          base.startsWith("https://")
            ? await fetchHttpsInsecure(url, formBody, timeoutMs)
            : await fetchHttp(url, formBody, timeoutMs);

        if (!html.trim()) {
          lastError = "Réponse OMPIC vide";
          continue;
        }

        const result: OmpicFetchResult = { ok: true, html, url };
        setCachedOmpicFetch(path, formBody, result);
        return result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        lastError =
          msg.includes("timeout") || msg.includes("aborted")
            ? "OMPIC ne répond pas (timeout — réseau ou portail en maintenance)"
            : `Connexion OMPIC échouée : ${msg.slice(0, 120)}`;
      }
    }
  }

  const failure: OmpicFetchResult = { ok: false, error: lastError, tried };
  setCachedOmpicFetch(path, formBody, failure);
  return failure;
}

/** Agent HTTPS permissif pour autres sous-domaines ompic.ma si besoin. */
export const ompicHttpsAgent = new https.Agent({ rejectUnauthorized: false });
