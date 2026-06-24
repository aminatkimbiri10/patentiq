import { NextResponse } from "next/server";

/** OMPIC peut répondre lentement — 60 s sur Vercel Pro ; Hobby plafonné à 10 s */
export const maxDuration = 60;
import {
  authorizeOmpicProxy,
  type OmpicProxyRequest,
} from "@/lib/surveillance/ompic-proxy-handler";
import { searchOmpicLive } from "@/lib/surveillance/ompic-live-search";

/**
 * POST /api/ompic-proxy/search
 * Recherche OMPIC réelle (marques search.ompic.ma + brevets MA via EPO).
 */
export async function POST(request: Request) {
  if (!authorizeOmpicProxy(request)) {
    return NextResponse.json({ error: "Unauthorized", results: [] }, { status: 401 });
  }

  let body: OmpicProxyRequest;
  try {
    body = (await request.json()) as OmpicProxyRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON", results: [] }, { status: 400 });
  }

  try {
    const { results, source, total } = await searchOmpicLive(body);
    return NextResponse.json({ results, source, total: total ?? undefined });
  } catch (e) {
    const message = e instanceof Error ? e.message : "OMPIC search error";
    console.error("[ompic-live]", message);
    return NextResponse.json({ error: message, results: [] }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Use POST",
      hint: "Recherche live OMPIC — marques: search.ompic.ma · brevets MA: EPO OPS (pa=MA)",
    },
    { status: 405 }
  );
}
