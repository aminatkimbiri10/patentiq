import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { queueAiSearchProcessing } from "@/lib/ai/trigger-worker";

/** POST — crée un rapport IA consolidé (file async) */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { projectId } = body;

  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  const { data: canView } = await supabase.rpc("can_view_project", {
    p_project_id: projectId,
  } as never);
  if (!canView) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("ai_searches")
    .insert({
      project_id: projectId,
      requested_by: user.id,
      search_type: "report",
      status: "pending",
      query: "Rapport consolidé de nouveauté",
      parameters: { endpoint: "/api/ai/report", kind: "consolidated" },
    })
    .select("id, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  queueAiSearchProcessing(data.id);

  return NextResponse.json({
    searchId: data.id,
    status: "pending",
    message: "Rapport en cours de génération — actualisation automatique",
  });
}
