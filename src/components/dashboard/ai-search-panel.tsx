"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileDown,
  Loader2,
  Tags,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AiFormattedText } from "@/components/shared/ai-formatted-text";
import { AiAnalysisMeta, AiResultSources } from "@/components/ai/ai-analysis-meta";
import { EmptyState } from "@/components/shared/empty-state";
import { formatAiSearchCompleteMessage } from "@/lib/messages/user-feedback";
import { formatAiSearchStatusLabel } from "@/lib/messages/ui-labels";
import {
  PROJECT_AI_SEARCH_TYPES,
  getSearchTypeLabel,
} from "@/lib/ai/search-types";
import { getProjectSummaryFieldLabel } from "@/lib/project-summary-labels";
import type { Document, AiSearch, AiResult } from "@/types/database";
import type { AiSearchType } from "@/types/database";

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  pending: "outline",
  processing: "default",
  completed: "success",
  failed: "destructive",
  cancelled: "secondary",
};

function SearchResultList({ results }: { results: AiResult[] }) {
  if (!results.length) {
    return <p className="px-4 py-3 text-xs text-muted-foreground">Aucun résultat enregistré.</p>;
  }

  return (
    <ul className="border-t border-border/60 bg-muted/20">
      {results.map((r) => (
        <li key={r.id} className="border-b border-border/40 px-4 py-3 last:border-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium">{r.title ?? r.source_ref}</p>
              {r.source_ref && r.result_type !== "summary" && (
                <p className="font-mono text-xs text-primary">{r.source_ref}</p>
              )}
              {r.result_type === "tag" && (
                <Badge variant="outline" className="mt-1 text-[10px]">
                  <Tags className="mr-1 h-3 w-3" />
                  tag
                </Badge>
              )}
              {r.result_type === "ipc_class" && (
                <Badge variant="outline" className="mt-1 text-[10px]">
                  <Layers className="mr-1 h-3 w-3" />
                  IPC/CPC
                </Badge>
              )}
            </div>
            {r.score != null && r.result_type !== "summary" && (
              <Badge variant="secondary" className="shrink-0">
                {Math.round(Number(r.score) * 100)}%
              </Badge>
            )}
          </div>
          {r.summary && (
            <AiFormattedText
              text={r.summary}
              className="mt-1.5 text-xs leading-relaxed text-muted-foreground"
            />
          )}
          <AiResultSources result={r} />
        </li>
      ))}
    </ul>
  );
}

function SearchRow({
  search,
  results,
}: {
  search: AiSearch;
  results: AiResult[];
}) {
  const [open, setOpen] = useState(false);
  const metadata = search.metadata as { summary?: string } | null;
  const summary = metadata?.summary;
  const typeLabel = getSearchTypeLabel(search.search_type);
  const canExpand = search.status === "completed" || results.length > 0;

  return (
    <li className="overflow-hidden">
      <button
        type="button"
        onClick={() => canExpand && setOpen((v) => !v)}
        disabled={!canExpand}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/20 sm:px-4"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{search.query ?? typeLabel}</p>
          <p className="truncate text-xs text-muted-foreground">
            {typeLabel}
            {results.length > 0 && ` · ${results.length} rés.`}
            {" · "}
            {formatDistanceToNow(new Date(search.created_at), { addSuffix: true, locale: fr })}
          </p>
          {search.error_message && (
            <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              {search.error_message}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {search.status === "completed" &&
            !["tag_suggestion", "assistant"].includes(search.search_type) && (
            <a
              href={`/api/ai/report/${search.id}?print=1`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex shrink-0 items-center gap-0.5 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-primary hover:bg-muted/40 sm:gap-1 sm:px-2"
              title="Ouvrir le rapport et enregistrer en PDF (gratuit, via le navigateur)"
            >
              <FileDown className="h-3 w-3" />
              <span className="hidden min-[400px]:inline">PDF</span>
            </a>
          )}
          <Badge
            variant={statusVariant[search.status] ?? "outline"}
            className="h-5 px-1.5 text-[10px] capitalize"
          >
            {search.status === "processing" ? (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                …
              </span>
            ) : (
              formatAiSearchStatusLabel(search.status)
            )}
          </Badge>
          {canExpand &&
            (open ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ))}
        </div>
      </button>
      {open && (
        <>
          <AiAnalysisMeta search={search} />
          {summary && (
            <AiFormattedText
              text={summary}
              className="border-t border-border/60 bg-muted/10 px-4 py-3 text-xs leading-relaxed text-muted-foreground"
            />
          )}
          <SearchResultList results={results} />
        </>
      )}
    </li>
  );
}

function AiSearchHistory({
  searches,
  resultsBySearch,
}: {
  searches: AiSearch[];
  resultsBySearch: Record<string, AiResult[]>;
}) {
  if (!searches.length) {
    return (
      <EmptyState
        icon={Search}
        title="Aucune analyse"
        description="Lancez une première analyse depuis l'onglet « Nouvelle analyse »."
        className="py-12"
      />
    );
  }

  return (
    <ul className="card-elevated max-h-[min(70vh,560px)] divide-y divide-border/60 overflow-y-auto scrollbar-thin">
      {searches.map((s) => (
        <SearchRow key={s.id} search={s} results={resultsBySearch[s.id] ?? []} />
      ))}
    </ul>
  );
}

export function AiSearchPanel({
  projectId,
  searches,
  resultsBySearch = {},
  providerLabel,
  documents = [],
  view = "new",
  initialSearchType,
  categorySlug,
}: {
  projectId: string;
  searches: AiSearch[];
  resultsBySearch?: Record<string, AiResult[]>;
  providerLabel?: string;
  documents?: Document[];
  view?: "new" | "history";
  initialSearchType?: AiSearchType;
  categorySlug?: string | null;
}) {
  const router = useRouter();
  const toastedSearches = useRef<Set<string>>(new Set());
  const [searchType, setSearchType] = useState<AiSearchType>(
    () => initialSearchType ?? "novelty"
  );
  const [query, setQuery] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    if (initialSearchType) setSearchType(initialSearchType);
  }, [initialSearchType]);

  const typeConfig = PROJECT_AI_SEARCH_TYPES.find((t) => t.value === searchType)!;
  const summaryFieldLabel = getProjectSummaryFieldLabel(categorySlug);
  const activeDocs = documents.filter((d) => d.status === "active");

  const pendingIds = searches
    .filter((s) => s.status === "pending" || s.status === "processing")
    .map((s) => s.id);

  const pollStatus = useCallback(async () => {
    if (!pendingIds.length) return false;
    const checks = await Promise.all(
      pendingIds.map((id) =>
        fetch(`/api/ai/search/${id}/status`).then((r) => (r.ok ? r.json() : null))
      )
    );
    let anyDone = false;
    for (const check of checks) {
      if (!check || (check.status !== "completed" && check.status !== "failed")) continue;
      anyDone = true;
      const id = check.searchId as string;
      if (toastedSearches.current.has(id)) continue;
      toastedSearches.current.add(id);
      const msg = formatAiSearchCompleteMessage(
        check.status,
        check.resultsCount ?? 0,
        check.errorMessage
      );
      if (msg) {
        if (check.status === "failed") toast.error(msg);
        else toast.success(msg);
      }
    }
    if (anyDone) {
      router.refresh();
      return true;
    }
    return false;
  }, [pendingIds, router]);

  useEffect(() => {
    if (!pendingIds.length) return;
    const interval = setInterval(() => {
      void pollStatus();
    }, 4000);
    return () => clearInterval(interval);
  }, [pendingIds.length, pollStatus]);

  async function launchSearch() {
    if (typeConfig.needsQuery && !query.trim() && searchType !== "similarity") {
      toast.error(`Saisissez une requête ou renseignez le ${summaryFieldLabel} du projet`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          query: query.trim() || null,
          searchType,
          documentId: searchType === "summarization" && documentId ? documentId : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      toast.success(data.message ?? "Analyse lancée");
      setQuery("");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  async function launchReport() {
    setReportLoading(true);
    try {
      const res = await fetch("/api/ai/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");
      toast.success(data.message ?? "Rapport en cours de génération");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally {
      setReportLoading(false);
    }
  }

  if (view === "history") {
    return <AiSearchHistory searches={searches} resultsBySearch={resultsBySearch} />;
  }

  return (
    <div className="space-y-4">
      <div className="card-elevated space-y-4 p-4 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <Label className="text-base font-semibold">Analyses IA</Label>
            <p className="text-xs text-muted-foreground">
              {providerLabel ?? "Analyses brevets EPO / Maroc et synthèse IA (gratuit si clés configurées)"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="search-type">Type d&apos;analyse</Label>
          <select
            id="search-type"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as AiSearchType)}
            className="flex h-11 w-full max-w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {PROJECT_AI_SEARCH_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">{typeConfig.description}</p>
        </div>

        {searchType === "summarization" && (
          <div className="space-y-2">
            <Label htmlFor="doc-select">Document à résumer (optionnel)</Label>
            <select
              id="doc-select"
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value)}
              className="flex h-11 w-full max-w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Dossier projet (résumé + besoin)</option>
              {activeDocs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title} — {d.file_name}
                </option>
              ))}
            </select>
            {documentId && (
              <p className="text-xs text-muted-foreground">
                CSV/TXT : lecture directe. PDF : extraction texte automatique (max 10 Mo, 40 p.).
              </p>
            )}
          </div>
        )}

        {(typeConfig.needsQuery || searchType === "similarity" || query) && (
          <div className="space-y-2">
            <Label htmlFor="ai-query">
              {searchType === "similarity"
                ? `Complément (optionnel — sinon ${summaryFieldLabel})`
                : typeConfig.needsQuery
                  ? "Requête"
                  : "Instructions (optionnel)"}
            </Label>
            <Input
              id="ai-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={typeConfig.placeholder}
              onKeyDown={(e) => e.key === "Enter" && launchSearch()}
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={launchSearch}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <Search className="mr-2 h-4 w-4" />
            {loading ? "Mise en file…" : `Lancer — ${typeConfig.label}`}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={launchReport}
            disabled={reportLoading || searches.length === 0}
            className="w-full sm:w-auto"
          >
            <FileDown className="mr-2 h-4 w-4" />
            {reportLoading ? "Génération…" : "Rapport consolidé"}
          </Button>
        </div>
        {pendingIds.length > 0 && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm"
          >
            <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" />
            <div>
              <p className="font-medium text-foreground">
                Analyse en cours ({pendingIds.length})
              </p>
              <p className="text-xs text-muted-foreground">
                Interrogation EPO / OMPIC et synthèse IA — vous serez notifié à la fin. Consultez
                l&apos;onglet Historique pour suivre l&apos;avancement.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
