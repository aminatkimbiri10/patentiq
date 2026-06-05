import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** GET /api/search?q=... — recherche globale (projets, documents, tâches) */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(Number(searchParams.get("limit") ?? 8), 20);

  if (q.length < 2) {
    return NextResponse.json({ projects: [], documents: [], tasks: [], query: q });
  }

  const term = q.replace(/[%_,.()]/g, "").trim();
  const pattern = `%${term}%`;

  const [projectsRes, documentsRes, tasksRes] = await Promise.all([
    supabase
      .from("projects")
      .select("id, title, reference_code, status")
      .or(`title.ilike."${pattern}",reference_code.ilike."${pattern}",description.ilike."${pattern}"`)
      .order("last_activity_at", { ascending: false })
      .limit(limit),
    supabase
      .from("documents")
      .select("id, title, file_name, project_id, projects(title, reference_code)")
      .neq("status", "deleted")
      .or(`title.ilike."${pattern}",file_name.ilike."${pattern}"`)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("project_tasks")
      .select("id, title, status, project_id, projects(title, reference_code)")
      .ilike("title", pattern)
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  type DocRow = {
    id: string;
    title: string;
    file_name: string;
    project_id: string;
    projects: { title: string; reference_code: string | null } | { title: string; reference_code: string | null }[] | null;
  };

  type TaskRow = {
    id: string;
    title: string;
    status: string;
    project_id: string;
    projects: { title: string; reference_code: string | null } | { title: string; reference_code: string | null }[] | null;
  };

  const documents = ((documentsRes.data ?? []) as DocRow[]).map((d) => {
    const proj = Array.isArray(d.projects) ? d.projects[0] : d.projects;
    return { ...d, projectTitle: proj?.title, projectRef: proj?.reference_code };
  });

  const tasks = ((tasksRes.data ?? []) as TaskRow[]).map((t) => {
    const proj = Array.isArray(t.projects) ? t.projects[0] : t.projects;
    return { ...t, projectTitle: proj?.title, projectRef: proj?.reference_code };
  });

  return NextResponse.json({
    query: q,
    projects: projectsRes.data ?? [],
    documents,
    tasks,
  });
}
