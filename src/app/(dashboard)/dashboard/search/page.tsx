import Link from "next/link";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { GlobalSearchForm } from "@/components/shared/global-search-form";
import { Badge } from "@/components/ui/badge";
import { Search, FolderKanban, FileText, ListChecks, Sparkles } from "lucide-react";
import { parsePageParam, getRange, getTotalPages, LIST_PAGE_SIZE } from "@/lib/pagination";
import { Pagination } from "@/components/shared/pagination";
import type { AiSearch } from "@/types/database";

export const metadata = { title: "Recherches" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  await requireUser();
  const supabase = await createClient();
  const q = (searchParams.q ?? "").trim();
  const page = parsePageParam(searchParams.page);

  let projects: { id: string; title: string; reference_code: string | null }[] = [];
  let documents: {
    id: string;
    title: string;
    file_name: string;
    project_id: string;
  }[] = [];
  let tasks: { id: string; title: string; project_id: string }[] = [];

  if (q.length >= 2) {
    const pattern = `%${q.replace(/[%_]/g, "")}%`;
    const [pRes, dRes, tRes] = await Promise.all([
      supabase
        .from("projects")
        .select("id, title, reference_code")
        .or(`title.ilike.${pattern},reference_code.ilike.${pattern},description.ilike.${pattern}`)
        .limit(20),
      supabase
        .from("documents")
        .select("id, title, file_name, project_id")
        .neq("status", "deleted")
        .or(`title.ilike.${pattern},file_name.ilike.${pattern}`)
        .limit(20),
      supabase
        .from("project_tasks")
        .select("id, title, project_id")
        .ilike("title", pattern)
        .limit(20),
    ]);
    projects = pRes.data ?? [];
    documents = dRes.data ?? [];
    tasks = tRes.data ?? [];
  }

  const { from, to } = getRange(page, LIST_PAGE_SIZE);
  const { data: aiSearches, count } = await supabase
    .from("ai_searches")
    .select("*, projects(title, reference_code)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const aiTotalPages = getTotalPages(count ?? 0, LIST_PAGE_SIZE);

  type AiRow = AiSearch & {
    projects: { title: string; reference_code: string | null } | { title: string; reference_code: string | null }[] | null;
  };

  const hasQueryResults = projects.length + documents.length + tasks.length > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Recherche"
        title="Recherche globale"
        description="Projets, documents, tâches et historique des analyses IA."
      />

      <GlobalSearchForm initialQuery={q} />

      {q.length >= 2 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">
            Résultats pour « {q} »
          </h2>
          {!hasQueryResults ? (
            <EmptyState
              icon={Search}
              title="Aucun résultat"
              description="Essayez d'autres mots-clés (titre projet, nom de fichier, tâche…)."
              className="py-10"
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <ResultGroup title="Projets" icon={FolderKanban} count={projects.length}>
                {projects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/dashboard/projects/${p.id}`}
                    className="block rounded-lg border px-3 py-2 text-sm hover:bg-muted/50"
                  >
                    <p className="font-medium">{p.title}</p>
                    {p.reference_code && (
                      <p className="text-xs text-muted-foreground">{p.reference_code}</p>
                    )}
                  </Link>
                ))}
              </ResultGroup>
              <ResultGroup title="Documents" icon={FileText} count={documents.length}>
                {documents.map((d) => (
                  <Link
                    key={d.id}
                    href={`/dashboard/projects/${d.project_id}`}
                    className="block rounded-lg border px-3 py-2 text-sm hover:bg-muted/50"
                  >
                    <p className="font-medium">{d.title || d.file_name}</p>
                  </Link>
                ))}
              </ResultGroup>
              <ResultGroup title="Tâches" icon={ListChecks} count={tasks.length}>
                {tasks.map((t) => (
                  <Link
                    key={t.id}
                    href={`/dashboard/projects/${t.project_id}`}
                    className="block rounded-lg border px-3 py-2 text-sm hover:bg-muted/50"
                  >
                    <p className="font-medium">{t.title}</p>
                  </Link>
                ))}
              </ResultGroup>
            </div>
          )}
        </section>
      )}

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="h-5 w-5 text-primary" />
          Recherches IA
          {count != null && (
            <span className="text-sm font-normal text-muted-foreground">({count})</span>
          )}
        </h2>
        {!aiSearches?.length ? (
          <EmptyState
            icon={Sparkles}
            title="Aucune analyse IA"
            description="Lancez une recherche depuis la fiche d'un projet."
            className="py-10"
          />
        ) : (
          <>
            <ul className="card-elevated divide-y divide-border/60 overflow-hidden">
              {(aiSearches as AiRow[]).map((s) => {
                const proj = Array.isArray(s.projects) ? s.projects[0] : s.projects;
                return (
                  <li key={s.id} className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{s.query ?? s.search_type}</p>
                      <Link
                        href={`/dashboard/projects/${s.project_id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {proj?.title ?? "Projet"}
                        {proj?.reference_code && ` · ${proj.reference_code}`}
                      </Link>
                    </div>
                    <Badge variant="outline" className="w-fit capitalize">
                      {s.status}
                    </Badge>
                  </li>
                );
              })}
            </ul>
            <Pagination
              basePath="/dashboard/search"
              page={page}
              totalPages={aiTotalPages}
              query={q ? { q } : undefined}
            />
          </>
        )}
      </section>
    </div>
  );
}

function ResultGroup({
  title,
  icon: Icon,
  count,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <div className="card-elevated p-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" />
        {title} ({count})
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
