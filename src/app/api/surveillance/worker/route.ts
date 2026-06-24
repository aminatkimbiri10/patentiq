import { NextResponse } from "next/server";

export const maxDuration = 60;
import { createAdminClient } from "@/lib/supabase/admin";
import { scanAllActiveWatchlist } from "@/lib/surveillance/scan-watchlist-core";
import { runAllTechWatchScans } from "@/lib/surveillance/tech-watch-runner";
import { runDeadlineReminders } from "@/lib/workflow/deadline-reminders";

function authorize(request: Request): boolean {
  const secret = process.env.AI_WORKER_SECRET ?? process.env.SURVEILLANCE_WORKER_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/**
 * POST /api/surveillance/worker
 * Scan OMPIC watchlist + veille technologique (cron hebdo / manuel)
 */
export async function POST(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const [watch, tech, deadlines] = await Promise.all([
      scanAllActiveWatchlist(supabase),
      runAllTechWatchScans(supabase),
      runDeadlineReminders(supabase),
    ]);

    return NextResponse.json({
      watchlist: watch,
      techWatch: tech,
      deadlines,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Worker error" },
      { status: 500 }
    );
  }
}
