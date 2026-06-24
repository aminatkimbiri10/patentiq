import { NextResponse } from "next/server";
import { runHealthCheck } from "@/lib/health/check";

export async function GET() {
  const report = await runHealthCheck();
  const status = report.ok ? 200 : 503;

  return NextResponse.json(report, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
