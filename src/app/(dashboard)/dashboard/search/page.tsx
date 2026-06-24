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

import { getSearchTypeLabel } from "@/lib/ai/search-types";

import { projectTabQuery } from "@/lib/project-tabs";

import { formatDistanceToNow } from "date-fns";

import { fr } from "date-fns/locale";

import type { AiSearch } from "@/types/database";



export const metadata = { title: "Recherche" };



const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {

  pending: "outline",

  processing: "default",

  completed: "success",

  failed: "destructive",

  cancelled: "secondary",

};



export default async function SearchPage({

  searchParams,

}: {

  searchParams: { q?: string; page?: string; focus?: string };

}) {

  await requireUser();

  const supabase = await createClient();

  const q = (searchParams.q ?? "").trim();

  const page = parsePageParam(searchParams.page);

  const focusAi = searchParams.focus === "ai";



  let projects: { id: string; title: string; reference_code: string | null }[] = [];

  let documents: {

    id: string;

    title: string;

    file_name: string;

    project_id: string;

  }[] = [];

  let tasks: { id: string; title: string; project_id: string }[] = [];

  let aiMatches: AiRow[] = [];



  if (q.length >= 2) {

    const pattern = `%${q.replace(/[%_]/g, "")}%`;

    const [pRes, dRes, tRes, aiRes] = await Promise.all([

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

      supabase

        .from("ai_searches")

        .select("*, projects(title, reference_code)")

        .ilike("query", pattern)

        .order("created_at", { ascending: false })

        .limit(20),

    ]);

    projects = pRes.data ?? [];

    documents = dRes.data ?? [];

    tasks = tRes.data ?? [];

    aiMatches = (aiRes.data ?? []) as AiRow[];

  }



  const { from, to } = getRange(page, LIST_PAGE_SIZE);

  const { data: aiSearches, count } = await supabase

    .from("ai_searches")

    .select("*, projects(title, reference_code)", { count: "exact" })

    .order("created_at", { ascending: false })

    .range(from, to);



  type AiRow = AiSearch & {

    projects: { title: string; reference_code: string | null } | { title: string; reference_code: string | null }[] | null;

  };



  const hasQueryResults =

    projects.length + documents.length + tasks.length + aiMatches.length > 0;



  return (

    <div className="space-y-8">

      <PageHeader

        icon={Search}

        eyebrow="Exploration"

        title="Recherche"

        description="Trouvez un projet, document, tâche ou consultez toutes vos analyses IA."

      />



      <div className="flex flex-wrap gap-2">

        <Link

          href="/dashboard/search"

          className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${

            !focusAi ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 text-muted-foreground hover:bg-muted"

          }`}

        >

          Tout

        </Link>

        <Link

          href="/dashboard/search?focus=ai"

          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${

            focusAi ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/60 text-muted-foreground hover:bg-muted"

          }`}

        >

          <Sparkles className="h-3.5 w-3.5" />

          Analyses IA

          {count != null && count > 0 && (

            <span className="tabular-nums text-xs opacity-90">{count}</span>

          )}

        </Link>

      </div>



      {!focusAi && <GlobalSearchForm initialQuery={q} />}



      {!focusAi && q.length >= 2 && (

        <section className="space-y-4">

          <h2 className="text-lg font-semibold">Résultats pour « {q} »</h2>

          {!hasQueryResults ? (

            <EmptyState

              icon={Search}

              title="Aucun résultat"

              description="Essayez d'autres mots-clés (titre projet, nom de fichier, requête IA…)."

              className="py-10"

            />

          ) : (

            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">

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

                    href={`/dashboard/projects/${t.project_id}?tab=echanges&section=tasks`}

                    className="block rounded-lg border px-3 py-2 text-sm hover:bg-muted/50"

                  >

                    <p className="font-medium">{t.title}</p>

                  </Link>

                ))}

              </ResultGroup>

              <ResultGroup title="Analyses IA" icon={Sparkles} count={aiMatches.length}>

                {aiMatches.map((s) => (

                  <AiSearchLink key={s.id} search={s} />

                ))}

              </ResultGroup>

            </div>

          )}

        </section>

      )}



      {(focusAi || !q) && (

        <section className="space-y-4">

          <h2 className="flex items-center gap-2 text-lg font-semibold">

            <Sparkles className="h-5 w-5 text-primary" />

            {focusAi ? "Toutes vos analyses IA" : "Analyses IA récentes"}

            {count != null && (

              <span className="text-sm font-normal text-muted-foreground">({count})</span>

            )}

          </h2>

          {!aiSearches?.length ? (

            <EmptyState

              icon={Sparkles}

              title="Aucune analyse IA"

              description="Ouvrez un projet → onglet IA → Nouvelle analyse pour lancer une recherche."

              className="py-10"

            />

          ) : (

            <>

              <ul className="card-elevated divide-y divide-border/60 overflow-hidden">

                {(aiSearches as AiRow[]).map((s) => (

                  <li key={s.id}>

                    <AiSearchLink search={s} detailed />

                  </li>

                ))}

              </ul>

              <Pagination

                basePath="/dashboard/search"

                page={page}

                totalPages={getTotalPages(count ?? 0, LIST_PAGE_SIZE)}

                query={focusAi ? { focus: "ai" } : q ? { q } : undefined}

              />

            </>

          )}

        </section>

      )}

    </div>

  );

}



function AiSearchLink({ search, detailed = false }: { search: AiRow; detailed?: boolean }) {

  const proj = Array.isArray(search.projects) ? search.projects[0] : search.projects;

  const href = `/dashboard/projects/${search.project_id}${projectTabQuery("search", "history")}`;

  const typeLabel = getSearchTypeLabel(search.search_type);



  if (detailed) {

    return (

      <Link

        href={href}

        className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between"

      >

        <div className="min-w-0">

          <p className="truncate text-sm font-medium">{search.query ?? typeLabel}</p>

          <p className="text-xs text-muted-foreground">

            {proj?.title ?? "Projet"}

            {proj?.reference_code && ` · ${proj.reference_code}`}

            {" · "}

            {formatDistanceToNow(new Date(search.created_at), { addSuffix: true, locale: fr })}

          </p>

        </div>

        <div className="flex flex-wrap items-center gap-2">

          <Badge variant="secondary" className="w-fit text-xs">

            {typeLabel}

          </Badge>

          <Badge variant={statusVariant[search.status] ?? "outline"} className="w-fit capitalize">

            {search.status}

          </Badge>

        </div>

      </Link>

    );

  }



  return (

    <Link

      href={href}

      className="block rounded-lg border px-3 py-2 text-sm hover:bg-muted/50"

    >

      <p className="font-medium">{search.query ?? typeLabel}</p>

      <p className="text-xs text-muted-foreground">{proj?.title ?? "Projet"}</p>

    </Link>

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



type AiRow = AiSearch & {

  projects: { title: string; reference_code: string | null } | { title: string; reference_code: string | null }[] | null;

};


