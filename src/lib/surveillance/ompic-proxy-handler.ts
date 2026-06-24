import type { OmpicHit } from "@/lib/surveillance/ompic-provider";
import { searchOmpicLive } from "@/lib/surveillance/ompic-live-search";
import type { IpAssetType } from "@/types/surveillance";

export type OmpicProxyRequest = {
  query?: string;
  asset_type?: IpAssetType;
  territory?: string;
  registration_number?: string;
  nice_classes?: string;
  summary?: string;
  logo_url?: string;
};

export function authorizeOmpicProxy(request: Request): boolean {
  const expected = process.env.OMPIC_PROXY_TOKEN?.trim();
  if (!expected) return true;
  const auth = request.headers.get("authorization")?.trim() ?? "";
  return auth === `Bearer ${expected}`;
}

/** Proxy HTTP — délègue à la recherche OMPIC live (pas de données simulées). */
export async function runOmpicProxySearch(body: OmpicProxyRequest): Promise<OmpicHit[]> {
  const { results } = await searchOmpicLive(body);
  return results;
}
