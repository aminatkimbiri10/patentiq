import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    stub: true,
    feature: "summarization",
    message: "Brancher lib/ai/providers.ts",
  }, { status: 501 });
}
