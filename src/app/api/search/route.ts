import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/auth/get-user";
import { projectUrlForUser } from "@/lib/project-routes";

/** GET /api/search?q=... — recherche globale (projets, documents, tâches) */
export async function GET(request: Request) {
  const supabase = await createClient();
  const ctx = await getUserContext();

  if (!ctx?.user) {
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
      .select("id, title, reference_code, status, owner_id, assigned_to, expert_id")
      .or(`title.ilike."${pattern}",reference_code.ilike."${pattern}",description.ilike."${pattern}"`)
      .order("last_activity_at", { ascending: false })
      .limit(limit),
    supabase
      .from("documents")
      .select("id, title, file_name, project_id, projects(title, reference_code, owner_id, assigned_to, expert_id)")
      .neq("status", "deleted")
      .or(`title.ilike."${pattern}",file_name.ilike."${pattern}"`)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("project_tasks")
      .select("id, title, status, project_id, projects(title, reference_code, owner_id, assigned_to, expert_id)")
      .ilike("title", pattern)
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  type ProjectRef = {
    title: string;
    reference_code: string | null;
    owner_id: string;
    assigned_to: string | null;
    expert_id: string | null;
  };

  type DocRow = {
    id: string;
    title: string;
    file_name: string;
    project_id: string;
    projects: ProjectRef | ProjectRef[] | null;
  };

  type TaskRow = {
    id: string;
    title: string;
    status: string;
    project_id: string;
    projects: ProjectRef | ProjectRef[] | null;
  };

  type ProjectRow = {
    id: string;
    title: string;
    reference_code: string | null;
    status: string;
    owner_id: string;
    assigned_to: string | null;
    expert_id: string | null;
  };

  function projectHref(projectId: string, ref: ProjectRef) {
    return projectUrlForUser(projectId, ctx!.user.id, ref);
  }

  const projects = ((projectsRes.data ?? []) as ProjectRow[]).map((p) => ({
    id: p.id,
    title: p.title,
    reference_code: p.reference_code,
    status: p.status,
    href: projectUrlForUser(p.id, ctx.user.id, p),
  }));

  const documents = ((documentsRes.data ?? []) as DocRow[]).map((d) => {
    const proj = Array.isArray(d.projects) ? d.projects[0] : d.projects;
    return {
      id: d.id,
      title: d.title,
      file_name: d.file_name,
      project_id: d.project_id,
      projectTitle: proj?.title,
      projectRef: proj?.reference_code,
      href: proj ? projectHref(d.project_id, proj) : projectUrlForUser(d.project_id, ctx.user.id, {
        owner_id: "",
        assigned_to: null,
        expert_id: null,
      }),
    };
  });

  const tasks = ((tasksRes.data ?? []) as TaskRow[]).map((t) => {
    const proj = Array.isArray(t.projects) ? t.projects[0] : t.projects;
    return {
      id: t.id,
      title: t.title,
      status: t.status,
      project_id: t.project_id,
      projectTitle: proj?.title,
      projectRef: proj?.reference_code,
      href: proj
        ? projectUrlForUser(t.project_id, ctx.user.id, proj, "tasks")
        : projectUrlForUser(t.project_id, ctx.user.id, {
            owner_id: "",
            assigned_to: null,
            expert_id: null,
          }, "tasks"),
    };
  });

  return NextResponse.json({
    query: q,
    projects,
    documents,
    tasks,
  });
}
