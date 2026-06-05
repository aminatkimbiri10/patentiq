import { NextResponse } from "next/server";
import { getDocumentSignedUrl } from "@/lib/actions/documents";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { url, title } = await getDocumentSignedUrl(params.id);
    return NextResponse.json({ url, title });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur" },
      { status: 400 }
    );
  }
}
