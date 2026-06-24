import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCpiProjectFilter, getCpiStats } from "@/lib/cpi/queries";
import { buildCpiReportCsv, buildCpiReportHtml } from "@/lib/cpi/export-report";
import type { CpiExportProject } from "@/lib/cpi/export-report";

/** GET /api/cpi/reports/export?format=csv|html */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: isCpi } = await supabase.rpc("has_role", { p_role: "cpi_advisor" });
  const { data: isAdmin } = await supabase.rpc("has_role", { p_role: "admin" });
  if (!isCpi && !isAdmin) {
    return NextResponse.json({ error: "Accès CPI requis" }, { status: 403 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format") === "html" ? "html" : "csv";

  const filter = await getCpiProjectFilter(user.id);

  const { data: rows, error } = await supabase
    .from("projects")
    .select("*, owner:profiles!projects_owner_id_fkey(full_name, email)")
    .or(filter)
    .order("last_activity_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const projects = (rows ?? []).map((r) => {
    const row = r as CpiExportProject & {
      owner: CpiExportProject["owner"] | CpiExportProject["owner"][];
    };
    const owner = Array.isArray(row.owner) ? row.owner[0] : row.owner;
    return { ...row, owner: owner ?? null };
  }) as CpiExportProject[];

  const [stats, profile] = await Promise.all([
    getCpiStats(user.id),
    supabase.from("profiles").select("full_name, email").eq("id", user.id).single(),
  ]);

  const generatedAt = new Date().toISOString();
  const cpiName = profile.data?.full_name ?? profile.data?.email ?? "CPI";

  if (format === "html") {
    const html = buildCpiReportHtml(projects, stats, cpiName, generatedAt);
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="rapport-cpi-${generatedAt.slice(0, 10)}.html"`,
      },
    });
  }

  const csv = buildCpiReportCsv(projects, stats, generatedAt);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rapport-cpi-${generatedAt.slice(0, 10)}.csv"`,
    },
  });
}
