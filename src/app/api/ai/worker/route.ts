import { NextResponse } from "next/server";
import { processPendingAiSearches, processAiSearch } from "@/lib/ai/worker";

function authorize(request: Request): boolean {
  const secret = process.env.AI_WORKER_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/**
 * POST /api/ai/worker
 * - Sans body : traite jusqu'à 10 recherches pending (cron / manuel)
 * - { searchId } : traite une recherche spécifique
 * Header: Authorization: Bearer <AI_WORKER_SECRET>
 */
export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const searchId = typeof body.searchId === "string" ? body.searchId : null;

    if (searchId) {
      const result = await processAiSearch(searchId);
      return NextResponse.json(result);
    }

    const outcomes = await processPendingAiSearches(
      typeof body.limit === "number" ? Math.min(body.limit, 50) : 10
    );

    return NextResponse.json({
      processed: outcomes.length,
      outcomes,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Worker error" },
      { status: 500 }
    );
  }
}
