import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardPageFrame } from "@/components/dashboard/dashboard-page-frame";
import { ListPanel } from "@/components/shared/list-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { MessageSquare, ArrowUpRight, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export const metadata = { title: "Messages" };

type ThreadRow = {
  project_id: string;
  body: string;
  created_at: string;
  projects:
    | { title: string; reference_code: string | null }
    | { title: string; reference_code: string | null }[]
    | null;
};

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: { project?: string };
}) {
  const ctx = await requireUser();
  const supabase = await createClient();

  const { data: rawMessages } = await supabase
    .from("messages")
    .select("project_id, body, created_at, projects(title, reference_code)")
    .eq("message_type", "project_thread")
    .not("project_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(100);

  const byProject = new Map<
    string,
    { title: string; ref: string | null; preview: string; at: string }
  >();

  for (const row of (rawMessages ?? []) as ThreadRow[]) {
    if (!row.project_id || byProject.has(row.project_id)) continue;
    const proj = Array.isArray(row.projects) ? row.projects[0] : row.projects;
    byProject.set(row.project_id, {
      title: proj?.title ?? "Projet",
      ref: proj?.reference_code ?? null,
      preview: row.body.length > 80 ? `${row.body.slice(0, 80)}…` : row.body,
      at: row.created_at,
    });
  }

  const threads = Array.from(byProject.entries()).map(([id, t]) => ({
    projectId: id,
    ...t,
  }));

  const highlightId = searchParams.project;

  return (
    <DashboardPageFrame>
      <PageHeader
        variant="elevated"
        bordered={false}
        icon={MessageSquare}
        eyebrow="Communication"
        title="Messages"
        description={
          threads.length > 0
            ? `${threads.length} conversation${threads.length !== 1 ? "s" : ""} — porteur, CPI et expert.`
            : "Conversations par dossier — porteur, CPI et expert."
        }
      />

      {threads.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Aucune conversation"
          description="Échanges → Messages dans la fiche projet pour contacter votre CPI."
          className="enterprise-panel"
          action={
            <Button variant="outline" asChild>
              <Link href="/dashboard/projects">
                <FolderKanban className="mr-2 h-4 w-4" />
                Voir mes projets
              </Link>
            </Button>
          }
        />
      ) : (
        <ListPanel>
          {threads.map((t) => (
            <Link
              key={t.projectId}
              href={`/dashboard/projects/${t.projectId}?tab=echanges&section=messages`}
              className={cn(
                "dash-list-row group",
                highlightId === t.projectId && "bg-primary/[0.04]"
              )}
            >
              <div className="dash-avatar">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold tracking-tight group-hover:text-primary">
                    {t.title}
                  </p>
                  {t.ref && (
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {t.ref}
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{t.preview}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(t.at), { addSuffix: true, locale: fr })}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </ListPanel>
      )}
    </DashboardPageFrame>
  );
}
