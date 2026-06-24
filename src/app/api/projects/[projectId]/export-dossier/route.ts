import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadPatentDossierForExport } from "@/lib/export/load-patent-dossier";

type RouteParams = { params: { projectId: string } };

/**
 * GET /api/projects/[projectId]/export-dossier
 * HTML imprimable — préférer la page /export-dossier pour l'aperçu PDF.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loaded = await loadPatentDossierForExport(supabase, params.projectId);
  if (!loaded.ok) {
    return NextResponse.json({ error: loaded.error }, { status: loaded.status });
  }

  const safeName = loaded.input.projectTitle
    .replace(/[^\w\s-]/g, "")
    .slice(0, 40)
    .trim();

  return new NextResponse(loaded.html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="patentiq-${safeName || "brevet"}.html"`,
    },
  });
}
