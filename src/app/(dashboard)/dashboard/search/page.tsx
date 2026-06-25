import Link from "next/link";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardPageFrame } from "@/components/dashboard/dashboard-page-frame";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterPills } from "@/components/shared/filter-pills";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
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

const statusVariant: Record<
  string,
  "default" | "secondary" | "success" | "warning" | "destructive" | "outline"
> = {
  pending: "outline",
  processing: "default",
  completed: "success",
  failed: "destructive",
  cancelled: "secondary",
};

type AiRow = AiSearch & {
  projects:
    | { title: string; reference_code: string | null }
    | { title: string; reference_code: string | null }[]
    | null;
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
  let documents: { id: string; title: string; file_name: string; project_id: string }[] = [];
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

  const hasQueryResults =
    projects.length + documents.length + tasks.length + aiMatches.length > 0;

  return (
    <DashboardPageFrame>
      <PageHeader
        variant="elevated"
        bordered={false}
        icon={Search}
        eyebrow="Exploration"
        title="Recherche"
        description="Projets, documents, tâches et analyses IA — recherche globale sur votre portefeuille."
      />

      <FilterPills
        items={[
          { href: "/dashboard/search", label: "Tout", active: !focusAi },
          {
            href: "/dashboard/search?focus=ai",
            label: "Analyses IA",
            icon: Sparkles,
            active: focusAi,
            count: count ?? undefined,
          },
        ]}
      />

      {!focusAi && <GlobalSearchForm initialQuery={q} />}

      {!focusAi && q.length >= 2 && (
        <DashboardSection title={`Résultats pour « ${q} »`} icon={Search}>
          {!hasQueryResults ? (
            <EmptyState
              icon={Search}
              title="Aucun résultat"
              description="Essayez d'autres mots-clés (titre projet, nom de fichier, requête IA…)."
              className="rounded-none border-0 bg-transparent py-10"
            />
          ) : (
            <div className="grid gap-px bg-border/60 sm:grid-cols-2 xl:grid-cols-4">
              <ResultGroup title="Projets" icon={FolderKanban} count={projects.length}>
                {projects.map((p) => (
                  <SearchResultLink
                    key={p.id}
                    href={`/dashboard/projects/${p.id}`}
                    title={p.title}
                    subtitle={p.reference_code ?? undefined}
                  />
                ))}
              </ResultGroup>
              <ResultGroup title="Documents" icon={FileText} count={documents.length}>
                {documents.map((d) => (
                  <SearchResultLink
                    key={d.id}
                    href={`/dashboard/projects/${d.project_id}`}
                    title={d.title || d.file_name}
                  />
                ))}
              </ResultGroup>
              <ResultGroup title="Tâches" icon={ListChecks} count={tasks.length}>
                {tasks.map((t) => (
                  <SearchResultLink
                    key={t.id}
                    href={`/dashboard/projects/${t.project_id}${projectTabQuery("echanges", "tasks")}`}
                    title={t.title}
                  />
                ))}
              </ResultGroup>
              <ResultGroup title="Analyses IA" icon={Sparkles} count={aiMatches.length}>
                {aiMatches.map((s) => (
                  <AiSearchLink key={s.id} search={s} />
                ))}
              </ResultGroup>
            </div>
          )}
        </DashboardSection>
      )}

      {(focusAi || !q) && (
        <DashboardSection
          title={focusAi ? "Toutes vos analyses IA" : "Analyses IA récentes"}
          description={count != null ? `${count} analyse${count !== 1 ? "s" : ""}` : undefined}
          icon={Sparkles}
        >
          {!aiSearches?.length ? (
            <EmptyState
              icon={Sparkles}
              title="Aucune analyse IA"
              description="Ouvrez un projet → onglet Analyses IA → Nouvelle analyse."
              className="rounded-none border-0 bg-transparent py-10"
            />
          ) : (
            <div className="divide-y divide-border/80">
              {(aiSearches as AiRow[]).map((s) => (
                <AiSearchLink key={s.id} search={s} detailed />
              ))}
            </div>
          )}
          {!!aiSearches?.length && (
            <div className="border-t border-border/80 px-5 py-4">
              <Pagination
                basePath="/dashboard/search"
                page={page}
                totalPages={getTotalPages(count ?? 0, LIST_PAGE_SIZE)}
                query={focusAi ? { focus: "ai" } : q ? { q } : undefined}
              />
            </div>
          )}
        </DashboardSection>
      )}
    </DashboardPageFrame>
  );
}

function SearchResultLink({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Link
      href={href}
      className="block px-4 py-2.5 text-sm transition-colors hover:bg-muted/30"
    >
      <p className="font-medium text-foreground">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </Link>
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
        className="flex flex-col gap-2 px-5 py-3.5 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
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
    <SearchResultLink
      href={href}
      title={search.query ?? typeLabel}
      subtitle={proj?.title ?? "Projet"}
    />
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
    <div className="bg-card">
      <div className="flex items-center gap-2 border-b border-border/80 bg-muted/25 px-4 py-3">
        <Icon className="h-4 w-4 text-primary" />
        <p className="text-sm font-semibold">
          {title} <span className="font-normal text-muted-foreground">({count})</span>
        </p>
      </div>
      <div className="divide-y divide-border/80">{children}</div>
    </div>
  );
}
